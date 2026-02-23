import { useEffect, useRef, useCallback, useState } from 'react';
import type { GameState, Player, StatusEffect } from '../game/types';
import type { GameController } from '../game/gameController';
import type { GameAction } from '../game/gameController';
import type { AnyCard } from '../game/types';
import { chooseAIMove } from '../ai/aiPlayer';
import { getValidMoves } from '../ai/validMoves';
import { getCardEffect } from '../data/cardDescriptions';
import { getCardImageUrl, getCardBackUrl } from '../data/cardImages';
import { DevLogPanel, type DevLogEntry } from './DevLogPanel';
import './GameBoard.css';

interface GameBoardProps {
  state: GameState;
  onAction: (action: Parameters<GameController['processAction']>[0]) => void;
  onBackToLobby: () => void;
  controller?: GameController;
}

function formatAction(a: GameAction): string {
  if (a.type === 'draw') return `draw by ${a.playerId}`;
  if (a.type === 'end_turn') return `end_turn by ${a.playerId}`;
  if (a.type === 'play_card') return `play_card ${a.card?.name ?? '?'} by ${a.playerId}`;
  if (a.type === 'play_hidden') return `play_hidden by ${a.playerId}`;
  if (a.type === 'start') return 'start';
  return 'unknown';
}

export function GameBoard({ state, onAction, onBackToLobby, controller }: GameBoardProps) {
  const aiTimeoutRef = useRef<number | null>(null);
  const aiWeaponDispatchedRef = useRef<string | null>(null); // playerId of last weapon dispatch (break stale-state loop)
  const aiWeaponDispatchCountRef = useRef<number>(0); // consecutive weapon dispatches this turn (force end if >= 1)
  const [devLogEntries, setDevLogEntries] = useState<DevLogEntry[]>([]);
  const logIdRef = useRef(0);
  const prevStateRef = useRef<{ idx: number; phase: string } | null>(null);

  const addLog = useCallback((msg: string, tag?: DevLogEntry['tag']) => {
    const id = ++logIdRef.current;
    const time = new Date().toISOString().slice(11, 23);
    setDevLogEntries((prev) => [...prev.slice(-99), { id, time, msg, tag }]);
  }, []);

  const loggedOnAction = useCallback(
    (action: GameAction) => {
      addLog(`→ ${formatAction(action)}`, 'action');
      onAction(action);
    },
    [onAction, addLog]
  );

  const [previewCard, setPreviewCard] = useState<AnyCard | null>(null);
  const [previewIsPeek, setPreviewIsPeek] = useState(false);
  const [targetingCard, setTargetingCard] = useState<AnyCard | null>(null);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [pendingHiddenReveal, setPendingHiddenReveal] = useState<GameState['lastHiddenReveal'] | { type: 'spike_trap'; targetId: string; attackerId: string; revealedCard: AnyCard } | null>(null);
  const lastShownHiddenRef = useRef<unknown>(null);
  const [drawInCardId, setDrawInCardId] = useState<string | null>(null);
  const prevHandIdsRef = useRef<Set<string>>(new Set());

  const processAITurn = useCallback(() => {
    try {
      const current = state.players[state.currentPlayerIndex];
      if (current.type !== 'ai' || current.isEliminated || state.winnerId) return;

      const canPlayExtraWeapon = current.extraWeaponAllowedThisTurn && current.weaponsPlayedThisTurn === 1;
      const alreadyDispatchedWeapon = aiWeaponDispatchedRef.current === current.id;
      const weaponCountOk = aiWeaponDispatchCountRef.current >= 1;
      if (!canPlayExtraWeapon && (current.weaponsPlayedThisTurn > 0 || alreadyDispatchedWeapon || weaponCountOk)) {
        addLog(`⚠ AI weapon safeguard: forcing end_turn (${current.name})`, 'warn');
        aiWeaponDispatchedRef.current = null;
        aiWeaponDispatchCountRef.current = 0;
        loggedOnAction({ type: 'end_turn', playerId: current.id });
        return;
      }

      const rng = controller?.getRng?.() ?? Math.random;
      let move = chooseAIMove(state, current.id, state.config.aiDifficulty, rng, current.aiPlaystyle);
      if (!move) return;

      if (move.type === 'play_weapon' && !canPlayExtraWeapon && (current.weaponsPlayedThisTurn > 0 || alreadyDispatchedWeapon || weaponCountOk)) {
        addLog(`⚠ AI guard override: weapon→end_turn (${current.name}, picked ${move.card?.name})`, 'warn');
        move = { type: 'end_turn' as const };
      }

      if (move.type === 'draw') {
        loggedOnAction({ type: 'draw', playerId: current.id });
      } else if (move.type === 'end_turn') {
        aiWeaponDispatchedRef.current = null;
        aiWeaponDispatchCountRef.current = 0;
        loggedOnAction({ type: 'end_turn', playerId: current.id });
      } else if (move.type === 'play_weapon' && move.card) {
        aiWeaponDispatchedRef.current = current.id;
        aiWeaponDispatchCountRef.current += 1;
        loggedOnAction({
          type: 'play_card',
          playerId: current.id,
          card: move.card,
          targetId: move.targetId,
          targetId2: move.targetId2,
        });
      } else if (move.type === 'play_utility' && move.card) {
        loggedOnAction({
          type: 'play_card',
          playerId: current.id,
          card: move.card,
          targetId: move.targetId,
        });
      } else if (move.type === 'play_special' && move.card) {
        loggedOnAction({
          type: 'play_card',
          playerId: current.id,
          card: move.card,
          targetId: move.targetId,
        });
      } else if (move.type === 'play_hidden' && move.card) {
        loggedOnAction({ type: 'play_hidden', playerId: current.id, card: move.card });
      }
    } catch (err) {
      addLog(`❌ AI error: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  }, [state, loggedOnAction, controller, addLog]);

  useEffect(() => {
    if (controller) {
      controller.setRejectLogger((msg, reason) =>
        addLog(reason ? `${msg} [${reason}]` : msg, 'warn')
      );
      return () => controller.setRejectLogger(null);
    }
  }, [controller, addLog]);

  const prevCombatEventRef = useRef<GameState['lastCombatEvent'] | null>(null);

  useEffect(() => {
    const rev = state.lastHiddenReveal;
    const ev = state.lastCombatEvent;
    const toShow = rev ?? (ev?.type === 'spike_trap' && ev.revealedCard ? { type: 'spike_trap' as const, targetId: ev.targetId, attackerId: ev.attackerId, revealedCard: ev.revealedCard } : null);
    if (toShow && toShow !== lastShownHiddenRef.current) {
      lastShownHiddenRef.current = toShow;
      setPendingHiddenReveal(toShow);
    }
    if (!toShow) lastShownHiddenRef.current = null;
  }, [state.lastHiddenReveal, state.lastCombatEvent]);

  const prevHiddenRevealRef = useRef<GameState['lastHiddenReveal'] | null>(null);

  useEffect(() => {
    const rev = state.lastHiddenReveal;
    if (!rev) {
      prevHiddenRevealRef.current = null;
      return;
    }
    if (rev === prevHiddenRevealRef.current) return;
    prevHiddenRevealRef.current = rev;

    const defenderName = state.players.find((p) => p.id === rev.defenderId)?.name ?? '?';
    const attackerName = rev.attackerId ? state.players.find((p) => p.id === rev.attackerId)?.name : null;
    const msg = attackerName
      ? `⚠ TRAP: ${defenderName}'s ${rev.revealedCard.name} — ${rev.result} (${attackerName} affected)`
      : `⚠ TRAP: ${defenderName}'s ${rev.revealedCard.name} — ${rev.result}`;
    addLog(msg, 'state');
  }, [state.lastHiddenReveal, state.players, addLog]);

  useEffect(() => {
    const ev = state.lastCombatEvent;
    if (!ev || ev === prevCombatEventRef.current) return;
    prevCombatEventRef.current = ev;

    const lp = state.lastPlayedCard;
    const attackerName = lp?.playerName ?? '?';
    const cardName = lp?.card?.name ?? '?';

    if (ev.type === 'damage') {
      const targetName = state.players.find((p) => p.id === ev.targetId)?.name ?? '?';
      addLog(`💥 ${targetName} took ${ev.amount} damage from ${attackerName} (${cardName})`, 'state');
    } else if (ev.type === 'blocked') {
      const targetName = state.players.find((p) => p.id === ev.targetId)?.name ?? '?';
      addLog(`🛡 ${targetName} blocked with ${ev.effectName}`, 'state');
    } else if (ev.type === 'damage_reduced') {
      const targetName = state.players.find((p) => p.id === ev.targetId)?.name ?? '?';
      addLog(`🛡 ${targetName}'s ${ev.effectName} reduced ${ev.from}→${ev.to} damage`, 'state');
    } else if (ev.type === 'eliminated') {
      const targetName = state.players.find((p) => p.id === ev.targetId)?.name ?? '?';
      addLog(`☠ ${targetName} eliminated`, 'state');
    } else if (ev.type === 'missed') {
      addLog(`❌ ${ev.cardName} missed!`, 'warn');
    }
  }, [state.lastCombatEvent, state.lastPlayedCard, state.players, addLog]);

  useEffect(() => {
    const curr = { idx: state.currentPlayerIndex, phase: state.phase };
    const prev = prevStateRef.current;
    if (!prev || prev.idx !== curr.idx || prev.phase !== curr.phase) {
      const p = state.players[state.currentPlayerIndex];
      addLog(`← current: ${p?.name ?? '?'} (idx ${curr.idx}), phase: ${curr.phase}`, 'state');
      prevStateRef.current = curr;
      aiWeaponDispatchedRef.current = null;
      aiWeaponDispatchCountRef.current = 0;
    }
  }, [state.currentPlayerIndex, state.phase, state.players, addLog]);

  useEffect(() => {
    if (state.winnerId) return;
    if (pendingHiddenReveal) return;

    const current = state.players[state.currentPlayerIndex];
    if (current.type === 'ai' && !current.isEliminated) {
      addLog(`AI scheduling: ${current.name} in 800ms`, 'ai');
      aiTimeoutRef.current = window.setTimeout(processAITurn, 800);
      return () => {
        if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
      };
    }
  }, [state.currentPlayerIndex, state.players, state.winnerId, processAITurn, pendingHiddenReveal, addLog]);

  // Detect newly drawn cards for draw-in animation (skip initial deal)
  const humanHand = state.players[0]?.hand ?? [];
  useEffect(() => {
    const ids = new Set(humanHand.map((c) => c.id));
    const prev = prevHandIdsRef.current;
    if (prev.size > 0 && ids.size > prev.size) {
      const newId = [...ids].find((id) => !prev.has(id));
      if (newId) setDrawInCardId(newId);
    }
    prevHandIdsRef.current = ids;
  }, [humanHand]);

  if (state.winnerId) {
    const winner = state.players.find((p) => p.id === state.winnerId);
    return (
      <div className="game-over">
        <h2>Game Over</h2>
        <p className="winner">{winner?.name ?? 'Unknown'} wins!</p>
        <p className="reason">{state.winnerReason === 'final_spree' ? 'Final Spree!' : 'Last player standing'}</p>
        <button onClick={onBackToLobby}>New Game</button>
        <DevLogPanel entries={devLogEntries} onClear={() => setDevLogEntries([])} />
      </div>
    );
  }

  const humanPlayer = state.players[0];
  const opponents = state.players.slice(1);
  const current = state.players[state.currentPlayerIndex];
  const isHumanTurn = current.type === 'human';
  const activeOpponents = opponents.filter((p) => !p.isEliminated);

  const humanValidMoves = isHumanTurn ? getValidMoves(state, humanPlayer.id) : [];
  const canPlayCard = useCallback((card: AnyCard) => {
    if (!isHumanTurn) return false;
    return humanValidMoves.some((m) => m.card?.id === card.id);
  }, [isHumanTurn, humanValidMoves]);

  const handlePlayCard = useCallback(
    (card: AnyCard, targetId?: string, targetId2?: string) => {
      setPreviewCard(null);
      setPreviewIsPeek(false);
      setTargetingCard(null);
      setSelectedTargets([]);
      loggedOnAction({
        type: 'play_card',
        playerId: humanPlayer.id,
        card,
        targetId,
        targetId2,
      });
    },
    [humanPlayer.id, loggedOnAction]
  );

  const handleTargetSelect = useCallback(
    (targetId: string) => {
      if (!targetingCard) return;
      if (cardAllowsMultiTarget(targetingCard) && activeOpponents.length >= 2) {
        if (selectedTargets.length === 0) {
          setSelectedTargets([targetId]);
        } else if (selectedTargets.length === 1 && selectedTargets[0] !== targetId) {
          handlePlayCard(targetingCard, selectedTargets[0], targetId);
        } else if (selectedTargets[0] === targetId) {
          handlePlayCard(targetingCard, targetId);
        }
      } else {
        handlePlayCard(targetingCard, targetId);
      }
    },
    [targetingCard, selectedTargets, activeOpponents.length, handlePlayCard]
  );

  const handleConfirmSingleTarget = useCallback(() => {
    if (targetingCard && selectedTargets.length === 1) {
      handlePlayCard(targetingCard, selectedTargets[0]);
    }
  }, [targetingCard, selectedTargets, handlePlayCard]);

  return (
    <div className="game-board">
      <header className="game-header">
        <button className="back-btn" onClick={onBackToLobby}>
          ← Lobby
        </button>
        <span className="round">Round {state.roundNumber}</span>
        <span className="phase">{state.phase}</span>
      </header>

      <div className="table-frame">
        <div className="table-surface">
        {/* Opponents around the table - 2p: top | 3p: left+right | 4p: left+top+right */}
        <div className={`table-opponents table-opponents-${Math.min(opponents.length, 3)}`}>
          {opponents.length >= 2 && (
            <div className="table-side table-left">
              <OpponentSeat
                player={opponents[0]}
                isCurrent={current.id === opponents[0].id}
                isTargeting={!!targetingCard}
                isSelected={selectedTargets.includes(opponents[0].id)}
                onTarget={() => handleTargetSelect(opponents[0].id)}
                combatEvent={state.lastCombatEvent && 'targetId' in state.lastCombatEvent && state.lastCombatEvent.targetId === opponents[0].id ? state.lastCombatEvent : undefined}
                state={state}
              />
            </div>
          )}
          {(opponents.length === 1 || opponents.length >= 3) && (
            <div className="table-side table-top">
              <OpponentSeat
                player={opponents.length === 1 ? opponents[0] : opponents[1]}
                isCurrent={current.id === (opponents.length === 1 ? opponents[0] : opponents[1]).id}
                isTargeting={!!targetingCard}
                isSelected={selectedTargets.includes(opponents.length === 1 ? opponents[0].id : opponents[1].id)}
                onTarget={() => handleTargetSelect(opponents.length === 1 ? opponents[0].id : opponents[1].id)}
                combatEvent={state.lastCombatEvent && 'targetId' in state.lastCombatEvent && state.lastCombatEvent.targetId === (opponents.length === 1 ? opponents[0] : opponents[1]).id ? state.lastCombatEvent : undefined}
                state={state}
              />
            </div>
          )}
          {opponents.length >= 2 && (
            <div className="table-side table-right">
              <OpponentSeat
                player={opponents[opponents.length - 1]}
                isCurrent={current.id === opponents[opponents.length - 1].id}
                isTargeting={!!targetingCard}
                isSelected={selectedTargets.includes(opponents[opponents.length - 1].id)}
                onTarget={() => handleTargetSelect(opponents[opponents.length - 1].id)}
                combatEvent={state.lastCombatEvent && 'targetId' in state.lastCombatEvent && state.lastCombatEvent.targetId === opponents[opponents.length - 1].id ? state.lastCombatEvent : undefined}
                state={state}
              />
            </div>
          )}
        </div>

        {/* Center: draw/discard piles and last played card */}
        <div className="table-center">
          <div className="center-piles">
            <div className="pile pile-draw" title={`Draw pile: ${state.drawPile.length} cards`}>
              <div className="pile-stack">
                {state.drawPile.length > 0 && (
                  <>
                    <div className="pile-card pile-card-back">
                      <img src={getCardBackUrl()} alt="" className="card-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    </div>
                    <span className="pile-count">{state.drawPile.length}</span>
                  </>
                )}
              </div>
            </div>
            <div className="pile pile-discard" title={`Discard pile: ${state.discardPile.length} cards`}>
              <div className="pile-stack">
                {state.discardPile.length > 0 ? (
                  <>
                    <div
                      key={state.discardPile[state.discardPile.length - 1]?.id ?? 'top'}
                      className={`pile-card pile-card-face pile-card-updated card-${state.discardPile[state.discardPile.length - 1]?.type ?? 'utility'}`}
                    >
                      <img
                        src={getCardImageUrl(state.discardPile[state.discardPile.length - 1]!.id)}
                        alt=""
                        className="card-img"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <span className="card-name">{state.discardPile[state.discardPile.length - 1]?.name ?? '?'}</span>
                    </div>
                    {state.discardPile.length > 1 && (
                      <span className="pile-count">{state.discardPile.length}</span>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </div>
          {state.lastCombatEvent?.type === 'spike_trap' && (() => {
            const ev = state.lastCombatEvent as { type: 'spike_trap'; targetId: string; attackerId: string };
            return (
              <div className="combat-event combat-spike-trap" key={`spike-${ev.targetId}`}>
                <span className="trap-icon">⚠</span>{' '}
                <strong>{state.players.find((p) => p.id === ev.targetId)?.name}</strong>'s{' '}
                <strong>Spike Trap</strong> cancelled the effect!{' '}
                {state.players.find((p) => p.id === ev.attackerId)?.name} discards 1 card.
              </div>
            );
          })()}
          {state.lastCombatEvent?.type === 'blocked' && (() => {
            const ev = state.lastCombatEvent;
            return ev && 'targetId' in ev ? (
              <div className="combat-event combat-blocked" key={`blocked-${ev.targetId}`}>
                <span className="shield-icon">🛡</span>{' '}
                {state.players.find((p) => p.id === ev.targetId)?.name} blocked with{' '}
                <strong>{ev.effectName}</strong>
              </div>
            ) : null;
          })()}
          {state.lastCombatEvent?.type === 'missed' && (
            <div className="combat-event combat-missed" key={`missed-${state.lastCombatEvent.cardName}`}>
              <span>❌</span> <strong>{state.lastCombatEvent.cardName}</strong> missed!
            </div>
          )}
          {state.lastCombatEvent?.type === 'damage_reduced' && (() => {
            const ev = state.lastCombatEvent;
            return ev && 'targetId' in ev ? (
              <div className="combat-event combat-reduced" key={`reduced-${ev.targetId}`}>
                <span className="shield-icon">🛡</span>{' '}
                {state.players.find((p) => p.id === ev.targetId)?.name}'s{' '}
                <strong>{ev.effectName}</strong> reduced {ev.from} → {ev.to} damage
              </div>
            ) : null;
          })()}
          {state.lastPlayedCard && (
            <div
              className={`last-played ${state.lastPlayedCard.card.type === 'hidden' ? 'last-played-hidden' : ''}`}
              key={state.lastPlayedCard.playerId + state.lastPlayedCard.card.id}
            >
              <strong>{state.lastPlayedCard.playerName}</strong>{' '}
              {state.lastPlayedCard.card.type === 'hidden' ? (
                <>
                  played <span className="mystery-card">🕶 a face-down card</span>
                </>
              ) : (
                <>
                  played{' '}
                  <span className={`last-played-card card-${state.lastPlayedCard.card.type}`}>
                    {state.lastPlayedCard.card.name}
                  </span>
                  {state.lastPlayedCard.targetName && <> → {state.lastPlayedCard.targetName}</>}
                </>
              )}
            </div>
          )}
          {current.type === 'ai' && (
            <div className="waiting">Waiting for {current.name}...</div>
          )}
          {targetingCard && (
            <div className="targeting-prompt">Click an opponent to target with <strong>{targetingCard.name}</strong></div>
          )}
        </div>

        {/* Your seat at the table */}
        <div className="table-player">
          <div
            className={`player-info ${current.id === humanPlayer.id ? 'current' : ''} ${
              state.lastCombatEvent && 'targetId' in state.lastCombatEvent && state.lastCombatEvent.targetId === humanPlayer.id && state.lastCombatEvent.type === 'damage'
                ? 'damage-flash'
                : ''
            } ${
              state.lastCombatEvent && 'targetId' in state.lastCombatEvent &&
              state.lastCombatEvent.targetId === humanPlayer.id &&
              (state.lastCombatEvent.type === 'blocked' || state.lastCombatEvent.type === 'damage_reduced')
                ? 'defensive-effect'
                : ''
            }`}
          >
            <div className="player-avatar player-avatar-human" aria-label="Player portrait" title={humanPlayer.name}>
              {/* Placeholder for player image - replace with img src when available */}
            </div>
            <div className="player-details">
              <span className="name">{humanPlayer.name}</span>
              <div className="player-health">
                <div className="health-bar">
                  <div
                    className="health-bar-fill"
                    style={{ width: `${Math.max(0, (humanPlayer.hp / humanPlayer.maxHp) * 100)}%` }}
                  />
                </div>
                <span className="hp">{humanPlayer.hp} / {humanPlayer.maxHp} HP</span>
              </div>
              {state.lastCombatEvent && 'targetId' in state.lastCombatEvent &&
                state.lastCombatEvent.targetId === humanPlayer.id &&
                state.lastCombatEvent.type === 'damage' && (
                  <span className="damage-number">-{state.lastCombatEvent.amount}</span>
                )}
            </div>
          </div>

          <PlayerTableCards
            player={humanPlayer}
            state={state}
            humanPlayerId={humanPlayer.id}
            onPeekHidden={(card) => { setPreviewCard(card); setPreviewIsPeek(true); }}
          />

          <HandFan cards={humanPlayer.hand} isHuman>
            {(card) => (
              <CardView
                key={card.id}
                card={card}
                disabled={!isHumanTurn || state.phase !== 'play'}
                canPlay={canPlayCard(card)}
                onPlay={handlePlayCard}
                needsTarget={cardNeedsTarget(card)}
                onShowPreview={(c) => { setPreviewCard(c); setPreviewIsPeek(false); }}
                onStartTargeting={setTargetingCard}
                previewCard={previewCard}
                targetingCard={targetingCard}
                drawIn={drawInCardId === card.id}
                onDrawInEnd={() => setDrawInCardId(null)}
              />
            )}
          </HandFan>

          <div className="actions">
            {isHumanTurn && state.phase === 'draw' && (
              <>
                {targetingCard && (
                  <button onClick={() => { setTargetingCard(null); setSelectedTargets([]); }}>Cancel</button>
                )}
                {!targetingCard && (
                  <button onClick={() => loggedOnAction({ type: 'draw', playerId: humanPlayer.id })}>
                    {state.roundNumber === 1 && state.currentPlayerIndex === 0 ? 'Start Turn' : 'Draw'}
                  </button>
                )}
              </>
            )}
            {isHumanTurn && state.phase === 'play' && (
              <>
                {targetingCard && (
                  <>
                    <button onClick={() => { setTargetingCard(null); setSelectedTargets([]); }}>Cancel</button>
                    {cardAllowsMultiTarget(targetingCard) && selectedTargets.length === 1 && activeOpponents.length >= 2 && (
                      <button onClick={handleConfirmSingleTarget}>
                        Apply to {state.players.find(p => p.id === selectedTargets[0])?.name ?? 'target'} only
                      </button>
                    )}
                  </>
                )}
                {!targetingCard && (
                  <>
                    {!humanPlayer.drewInsteadThisTurn &&
                      humanPlayer.weaponsPlayedThisTurn === 0 &&
                      (humanPlayer.utilitiesPlayedThisTurn ?? 0) === 0 &&
                      (humanPlayer.specialsPlayedThisTurn ?? 0) === 0 && (
                        <button onClick={() => loggedOnAction({ type: 'draw', playerId: humanPlayer.id })}>
                          Draw Instead
                        </button>
                      )}
                    <button onClick={() => loggedOnAction({ type: 'end_turn', playerId: humanPlayer.id })}>
                      End Turn
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        </div>
      </div>

      {/* Hidden card reveal - Yu-Gi-Oh style flip when hidden card activates */}
      {pendingHiddenReveal && (
          <HiddenRevealOverlay
            event={pendingHiddenReveal}
            players={state.players}
            onDismiss={() => setPendingHiddenReveal(null)}
            getCardEffect={getCardEffect}
          />
        )}

      {/* Card preview modal */}
      {previewCard && (
        <CardPreviewModal
          card={previewCard}
          effect={getCardEffect(previewCard.id)?.effect}
          subtext={getCardEffect(previewCard.id)?.subtext}
          onClose={() => { setPreviewCard(null); setPreviewIsPeek(false); }}
          peekOnly={previewIsPeek}
          onPlay={() => {
            if (cardNeedsTarget(previewCard) && activeOpponents.length > 0) {
              setPreviewCard(null);
              setPreviewIsPeek(false);
              setSelectedTargets([]);
              setTargetingCard(previewCard);
            } else {
              handlePlayCard(previewCard);
            }
          }}
          disabled={!isHumanTurn || (previewCard ? !canPlayCard(previewCard) : false)}
        />
      )}

      <DevLogPanel
        entries={devLogEntries}
        onClear={() => setDevLogEntries([])}
      />
    </div>
  );
}

/** Opponent hand — fan of face-down card backs (compact) */
function OpponentHandFan({ count }: { count: number }) {
  if (count <= 0) return null;
  const n = Math.min(count, 10); // cap display at 10
  const maxSpread = 36;
  const anglePerCard = n > 1 ? maxSpread / (n - 1) : 0;
  const offsetX = 14;

  return (
    <div className="opponent-hand-fan">
      {Array.from({ length: n }, (_, i) => {
        const center = (n - 1) / 2;
        const rotation = (i - center) * anglePerCard;
        const tx = (i - center) * offsetX;
        return (
          <div
            key={i}
            className="opponent-card-back"
            style={{
              zIndex: i,
              transform: `translateX(${tx}px) rotate(${rotation}deg)`,
            }}
          >
            <img src={getCardBackUrl()} alt="" className="card-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
        );
      })}
      {count > 10 && <span className="opponent-hand-count">+{count - 10}</span>}
    </div>
  );
}

/** Fan layout for player hand — cards radiate in an arc like holding cards */
function HandFan({
  cards,
  isHuman,
  children,
}: {
  cards: AnyCard[];
  isHuman: boolean;
  children: (card: AnyCard) => React.ReactNode;
}) {
  const n = cards.length;
  const maxSpread = 48; // total degrees
  const anglePerCard = n > 1 ? maxSpread / (n - 1) : 0;
  const offsetX = 28; // horizontal overlap/spread in px

  return (
    <div className={`hand hand-fan ${isHuman ? 'hand-fan-human' : 'hand-fan-opponent'}`}>
      {cards.map((card, i) => {
        const center = (n - 1) / 2;
        const rotation = (i - center) * anglePerCard;
        const tx = (i - center) * offsetX;
        return (
          <div
            key={card.id}
            className="card-fan-item"
            style={{
              zIndex: i,
              ['--fan-tx' as string]: `${tx}px`,
              ['--fan-rot' as string]: `${rotation}deg`,
            } as React.CSSProperties}
          >
            {children(card)}
          </div>
        );
      })}
    </div>
  );
}

function OpponentSeat({
  player,
  isCurrent,
  isTargeting,
  isSelected,
  onTarget,
  combatEvent,
  state,
}: {
  player: Player;
  isCurrent: boolean;
  isTargeting: boolean;
  isSelected?: boolean;
  onTarget: () => void;
  combatEvent?: GameState['lastCombatEvent'];
  state: GameState;
}) {
  if (player.isEliminated) {
    return (
      <div className="opponent-seat eliminated">
        <div className="player-avatar player-avatar-ai" aria-label="Opponent portrait" title={player.name}>
          {/* Placeholder for AI image - replace with img src when available */}
        </div>
        <span className="name">{player.name}</span>
        <span className="eliminated-label">OUT</span>
      </div>
    );
  }

  const isDamage = combatEvent?.type === 'damage';
  const isDefensive = combatEvent?.type === 'blocked' || combatEvent?.type === 'damage_reduced';
  const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);

  return (
    <div
      className={`opponent-seat ${isCurrent ? 'current' : ''} ${isTargeting ? 'targetable' : ''} ${isSelected ? 'selected-target' : ''} ${
        isDamage ? 'damage-flash' : ''
      } ${isDefensive ? 'defensive-effect' : ''}`}
      onClick={isTargeting ? onTarget : undefined}
    >
      <div className="player-avatar player-avatar-ai" aria-label="Opponent portrait" title={player.aiPlaystyle ? `${player.name} (${player.aiPlaystyle})` : player.name}>
        {/* Placeholder for AI image - replace with img src when available */}
      </div>
      <div className="opponent-seat-details">
        <span className="name">{player.name}{player.aiPlaystyle && <span className="playstyle-badge" title={`Playstyle: ${player.aiPlaystyle}`}>{player.aiPlaystyle}</span>}</span>
        <div className="player-health">
          <div className="health-bar">
            <div className="health-bar-fill" style={{ width: `${hpPct}%` }} />
          </div>
          <span className="hp">{player.hp} / {player.maxHp} HP</span>
        </div>
        {isDamage && 'amount' in combatEvent && combatEvent && (
          <span className="damage-number">-{combatEvent.amount}</span>
        )}
      </div>
      <OpponentHandFan count={player.hand.length} />
      <PlayerTableCards player={player} state={state} compact />
    </div>
  );
}

function formatStatusEffectShort(e: StatusEffect): string {
  if (e.type === 'molotov') return `${e.damagePerTurn ?? 1}×${e.turnsRemaining}`;
  if (e.type === 'dynamite') return `${e.totalDamage ?? 6} (${e.turnsRemaining})`;
  if (e.type === 'poisonous_apple') return `${e.damagePerTurn ?? 2}×${e.turnsRemaining}`;
  if (e.type === 'chainsaw') return `${e.damagePerTurn ?? 3}×${e.turnsRemaining}`;
  return '';
}

function formatStatusEffectTooltip(e: StatusEffect): string {
  if (e.type === 'molotov') return `${e.damagePerTurn ?? 1} damage per turn for ${e.turnsRemaining} turns`;
  if (e.type === 'dynamite') return `${e.totalDamage ?? 6} damage in ${e.turnsRemaining} turn`;
  if (e.type === 'poisonous_apple') return `${e.damagePerTurn ?? 2} damage in ${e.turnsRemaining} turn`;
  if (e.type === 'chainsaw') return `${e.damagePerTurn ?? 3} damage at start of their turn${e.turnsRemaining > 1 ? ` for ${e.turnsRemaining} turns` : ''}`;
  return '';
}

/** Protective effect badges + status effect badges + hidden card slot for a player's area */
function PlayerTableCards({
  player,
  state,
  compact,
  humanPlayerId,
  onPeekHidden,
}: {
  player: Player;
  state: GameState;
  compact?: boolean;
  humanPlayerId?: string;
  onPeekHidden?: (card: AnyCard) => void;
}) {
  const hasProtection =
    player.kevlarActive ||
    player.chainMailActive ||
    (player.heavyChestplateTurns ?? 0) > 0 ||
    (player.mechaSuitTurns ?? 0) > 0;
  const hasStatusEffects = (player.statusEffects?.length ?? 0) > 0;
  const finalSpree = state.finalSpreePlayerId === player.id;

  if (!hasProtection && !player.hiddenCard && !finalSpree && !hasStatusEffects) return null;

  return (
    <div className={`player-table-cards ${compact ? 'compact' : ''}`}>
      {player.hiddenCard && (
        <div
          className={`hidden-card-slot ${humanPlayerId === player.id && onPeekHidden ? 'hidden-card-peekable' : ''}`}
          title={humanPlayerId === player.id ? 'Click to peek at your hidden card' : 'Face-down hidden card'}
          onClick={humanPlayerId === player.id && onPeekHidden ? () => onPeekHidden(player.hiddenCard!) : undefined}
          role={humanPlayerId === player.id && onPeekHidden ? 'button' : undefined}
          tabIndex={humanPlayerId === player.id && onPeekHidden ? 0 : undefined}
          onKeyDown={humanPlayerId === player.id && onPeekHidden ? (e) => e.key === 'Enter' && onPeekHidden(player.hiddenCard!) : undefined}
        >
          <div className="hidden-card-back">
            <img src={getCardBackUrl()} alt="" className="card-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
        </div>
      )}
      {hasProtection && (
        <div className="protection-badges">
          {player.kevlarActive && (
            <span className="protection-badge kevlar" title="Immune to next Ranged attack">🛡 Ranged</span>
          )}
          {player.chainMailActive && (
            <span className="protection-badge chainmail" title="Immune to next Melee attack">🛡 Melee</span>
          )}
          {(player.heavyChestplateTurns ?? 0) > 0 && (
            <span className="protection-badge chestplate" title={`Reduce damage by 2 for ${player.heavyChestplateTurns} turns`}>
              🛡 −2 dmg ({player.heavyChestplateTurns})
            </span>
          )}
          {(player.mechaSuitTurns ?? 0) > 0 && (
            <span className="protection-badge mecha" title={`Immune to all damage for ${player.mechaSuitTurns} turns`}>
              🤖 Immune ({player.mechaSuitTurns})
            </span>
          )}
        </div>
      )}
      {finalSpree && (
        <span className="protection-badge final-spree" title="Damage doubled this round">⚔ Final Spree</span>
      )}
      {hasStatusEffects && (
        <div className="status-effect-badges">
          {player.statusEffects!.map((e, i) => (
            <span
              key={`${e.type}-${e.sourcePlayerId}-${i}`}
              className={`status-effect-badge status-effect-${e.type}`}
              title={formatStatusEffectTooltip(e)}
            >
              {e.type === 'molotov' && '🔥 '}
              {e.type === 'dynamite' && '💣 '}
              {e.type === 'poisonous_apple' && '☠ '}
              {e.type === 'chainsaw' && '🪚 '}
              {formatStatusEffectShort(e)}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function cardNeedsTarget(card: { type: string; id: string }): boolean {
  if (card.type === 'hidden') return false;
  if (card.type === 'weapon') return true;
  const baseId = card.id.replace(/_\d+$/, '');
  return ['bear_trap', 'grenade', 'molotov', 'dynamite', 'poison_dart', 'petty_thief', 'war_elephant', 'dog_squad', 'devils_blessing', 'execution_order'].includes(baseId);
}

function cardAllowsMultiTarget(card: { type: string; id: string }): boolean {
  if (card.type !== 'weapon') return false;
  const baseId = card.id.replace(/_\d+$/, '');
  return baseId === 'assault_rifle' || baseId === 'throwing_knives';
}

interface CardViewProps {
  card: AnyCard;
  disabled: boolean;
  canPlay?: boolean;
  onPlay: (card: AnyCard, targetId?: string, targetId2?: string) => void;
  needsTarget: boolean;
  onShowPreview: (card: AnyCard | null) => void;
  onStartTargeting: (card: AnyCard | null) => void;
  previewCard: AnyCard | null;
  targetingCard: AnyCard | null;
  drawIn?: boolean;
  onDrawInEnd?: () => void;
}

function CardView({ card, disabled, canPlay = true, onShowPreview, previewCard, targetingCard, drawIn, onDrawInEnd }: CardViewProps) {
  const handleClick = () => {
    if (disabled && !previewCard) return;
    if (previewCard?.id === card.id) return;
    if (targetingCard?.id === card.id) return;
    onShowPreview(card);
  };

  return (
    <div
      className={`card card-${card.type} ${targetingCard?.id === card.id ? 'card-selected' : ''} ${!canPlay ? 'card-unplayable' : ''} ${drawIn ? 'card-draw-in' : ''}`}
      onClick={handleClick}
      onAnimationEnd={drawIn ? () => onDrawInEnd?.() : undefined}
    >
      <img
        src={getCardImageUrl(card.id)}
        alt=""
        className="card-img"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      <span className="card-name">{card.name}</span>
      {'baseDamage' in card && card.baseDamage != null && (
        <span className="card-damage">{card.baseDamage} {card.damageType}</span>
      )}
    </div>
  );
}

/** Yu-Gi-Oh style hidden card reveal - card flips and shows effect when any hidden card triggers */
function HiddenRevealOverlay({
  event,
  players,
  onDismiss,
  getCardEffect,
}: {
  event: NonNullable<GameState['lastHiddenReveal']> | { type: 'spike_trap'; targetId: string; attackerId: string; revealedCard: AnyCard };
  players: { id: string; name: string }[];
  onDismiss: () => void;
  getCardEffect: (id: string) => { effect?: string } | undefined;
}) {
  const isLegacySpike = 'type' in event && event.type === 'spike_trap';
  const card = isLegacySpike ? event.revealedCard : event.revealedCard;
  if (!card) return null;

  const defenderId = isLegacySpike ? event.targetId : ('defenderId' in event ? event.defenderId : '');
  const attackerId = 'attackerId' in event ? event.attackerId : undefined;
  const result = isLegacySpike ? undefined : ('result' in event ? event.result : undefined);

  const defender = players.find((p) => p.id === defenderId);
  const attacker = attackerId ? players.find((p) => p.id === attackerId) : null;
  const effect = getCardEffect(card.id)?.effect ?? '';

  const resultText = result ?? (attacker
    ? `${defender?.name ?? '?'}'s trap cancelled the effect! ${attacker.name} discards 1 card.`
    : '');

  return (
    <div className="trap-reveal-overlay" onClick={onDismiss} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onDismiss()}>
      <div className="trap-reveal-content" onClick={(e) => e.stopPropagation()}>
        <div className="trap-reveal-header">⚠ TRAP REVEALED!</div>
        <div className="trap-reveal-card-flip">
          <div className="trap-card trap-card-face">
            <img src={getCardImageUrl(card.id)} alt="" className="card-img" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <span className="trap-card-name">{card.name}</span>
          </div>
        </div>
        <p className="trap-reveal-effect">{effect}</p>
        <p className="trap-reveal-result">{resultText ? <><strong>{defender?.name ?? '?'}</strong>'s {card.name}: {resultText}</> : null}</p>
        <button className="trap-reveal-dismiss" onClick={onDismiss}>
          Continue
        </button>
      </div>
    </div>
  );
}

function CardPreviewModal({
  card,
  effect,
  subtext,
  onClose,
  onPlay,
  disabled,
  peekOnly,
}: {
  card: AnyCard;
  effect?: string;
  subtext?: string;
  onClose: () => void;
  onPlay: () => void;
  disabled: boolean;
  peekOnly?: boolean;
}) {
  const isPeek = peekOnly === true;
  return (
    <div className="card-preview-overlay" onClick={onClose}>
      <div className="card-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className={`card-preview-content card-${card.type}`}>
          <h3 className="card-preview-name">{card.name}</h3>
          <span className="card-preview-type">{card.type}</span>
          {'baseDamage' in card && card.baseDamage != null && (
            <span className="card-preview-damage">
              {card.baseDamage} {card.damageType} damage
            </span>
          )}
          {effect && <p className="card-preview-effect">{effect}</p>}
          {subtext && <p className="card-preview-subtext">{subtext}</p>}
        </div>
        <div className="card-preview-actions">
          <button onClick={onClose}>Close</button>
          {!isPeek && (
            <button onClick={onPlay} disabled={disabled}>
              Play
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
