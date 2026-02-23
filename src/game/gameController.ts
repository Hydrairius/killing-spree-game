/**
 * Game controller - processes player actions, manages turn flow
 * PRD §5, FR-2
 */
/** Set true to log hidden card trigger evaluation (attacker, defender, armed cards, which fired) */
const DEBUG_HIDDEN_CARDS = false;

import type { GameState, AnyCard, HiddenCard } from './types';
import { createGame, drawCards, advanceToNextPlayer } from './gameEngine';
import { createSeededRandom } from './rng';
import { resolveCardEffect } from './cardResolver';

export type GameAction =
  | { type: 'start'; playerCount: number; momentumBonus: boolean; seed?: number; aiDifficulty?: 'easy' | 'medium' | 'hard' }
  | { type: 'draw'; playerId: string }
  | { type: 'play_card'; playerId: string; card: AnyCard; targetId?: string; targetId2?: string }
  | { type: 'play_hidden'; playerId: string; card: AnyCard }
  | { type: 'end_turn'; playerId: string };

export type RejectLogger = (msg: string, reason?: string) => void;

export class GameController {
  private state: GameState | null = null;
  private rng = createSeededRandom(Date.now());
  private rejectLogger: RejectLogger | null = null;

  /** Set to log when actions are rejected (for DevLog debugging) */
  setRejectLogger(fn: RejectLogger | null): void {
    this.rejectLogger = fn;
  }

  private logReject(msg: string, reason?: string): void {
    this.rejectLogger?.(msg, reason);
  }

  getState(): GameState | null {
    return this.state;
  }

  /** RNG used for draws, card effects, and AI decisions. Same stream for determinism. */
  getRng(): () => number {
    return this.rng;
  }

  start(playerCount: number, momentumBonus: boolean, seed?: number, aiDifficulty: 'easy' | 'medium' | 'hard' = 'medium'): GameState {
    this.rng = createSeededRandom(seed ?? Date.now());
    this.state = createGame(playerCount, momentumBonus, seed ?? Date.now(), aiDifficulty);
    return this.state!;
  }

  processAction(action: GameAction): GameState | null {
    if (action.type === 'start') {
      return this.start(action.playerCount, action.momentumBonus, action.seed, action.aiDifficulty);
    }
    if (!this.state) return null;
    this.state = { ...this.state, lastCombatEvent: undefined, lastHiddenReveal: undefined };

    let result: GameState | null = null;
    switch (action.type) {
      case 'draw':
        result = this.handleDraw(action.playerId);
        break;
      case 'play_card':
        result = this.handlePlayCard(action);
        break;
      case 'play_hidden':
        result = this.handlePlayHidden(action);
        break;
      case 'end_turn':
        return this.handleEndTurn(action.playerId);
      default:
        return this.state;
    }

    if (result) this.state = result;
    this.state = this.advancePastEliminatedIfNeeded();
    return this.state;
  }

  private handleDraw(playerId: string): GameState | null {
    if (!this.state) return null;

    const current = this.state.players[this.state.currentPlayerIndex];
    if (current.id !== playerId) {
      this.logReject(`draw rejected: not your turn (${playerId})`, 'wrong_player');
      return this.state;
    }

    if (this.state.phase === 'draw') {
      if (this.state.roundNumber === 1 && this.state.currentPlayerIndex === 0) {
        this.state = { ...this.state, phase: 'play' };
        return this.state;
      }
      this.state = drawCards(this.state, playerId, 1, this.rng);
      this.state = { ...this.state, phase: 'play' };
      return this.state;
    }

    if (this.state.phase === 'play') {
      const player = this.state.players.find((p) => p.id === playerId);
      const hasPlayedAnyCard =
        (player?.weaponsPlayedThisTurn ?? 0) > 0 ||
        (player?.utilitiesPlayedThisTurn ?? 0) > 0 ||
        (player?.specialsPlayedThisTurn ?? 0) > 0;
      if (player?.drewInsteadThisTurn || hasPlayedAnyCard) {
        this.logReject(`draw rejected: already drew or played this turn`, 'draw_invalid');
        return this.state;
      }
      this.state = drawCards(this.state, playerId, 1, this.rng);
      const newPlayers = this.state.players.map((p) =>
        p.id === playerId ? { ...p, drewInsteadThisTurn: true } : p
      );
      this.state = { ...this.state, players: newPlayers };
      return this.state;
    }

    return this.state;
  }

  private handlePlayCard(action: Extract<GameAction, { type: 'play_card' }>): GameState | null {
    if (!this.state) return null;

    const { playerId, card, targetId, targetId2 } = action;
    if (card.type === 'hidden') return this.handlePlayHidden({ type: 'play_hidden', playerId, card });

    const current = this.state.players[this.state.currentPlayerIndex];
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return this.state;
    const isDevilsBlessing = card.id.replace(/_\d+$/, '') === 'devils_blessing';
    const canPlayInDraw = this.state.phase === 'draw' && isDevilsBlessing && player.hp <= 5 && targetId;
    if (current.id !== playerId) {
      this.logReject(`play_card rejected: wrong player`, 'wrong_player');
      return { ...this.state! };
    }
    if (!canPlayInDraw && this.state.phase !== 'play') {
      this.logReject(`play_card rejected: wrong phase`, 'wrong_player_or_phase');
      return { ...this.state! };
    }

    const cardIndex = player.hand.findIndex((c) => c.id === card.id);
    if (cardIndex < 0) {
      this.logReject(`play_card rejected: card not in hand (${card.name})`, 'card_not_found');
      return { ...this.state! };
    }

    // PRD §5: enforce 1 weapon, 1 utility, 1 special per turn
    const canPlayExtraWeapon = player.extraWeaponAllowedThisTurn && player.weaponsPlayedThisTurn === 1;
    if (card.type === 'weapon' && (player.skipWeaponNextTurn || (player.weaponsPlayedThisTurn > 0 && !canPlayExtraWeapon))) {
      this.logReject(`play_card rejected: already played weapon or skipWeaponNextTurn (${card.name})`, 'weapon_limit');
      return { ...this.state!, players: [...this.state!.players] }; // new refs so UI effect runs
    }
    if (card.type === 'utility' && (player.utilitiesPlayedThisTurn ?? 0) > 0) {
      this.logReject(`play_card rejected: already played utility (${card.name})`, 'utility_limit');
      return { ...this.state! };
    }
    if (card.type === 'special' && (player.specialsPlayedThisTurn ?? 0) > 0) {
      this.logReject(`play_card rejected: already played special (${card.name})`, 'special_limit');
      return { ...this.state! };
    }

    const result = resolveCardEffect({
      state: this.state,
      card,
      playerId,
      targetId,
      targetId2,
      rng: this.rng,
    });

    // Spike Trap: target's hidden card cancelled the utility
    if (result.spikeTrapCancel) {
      this.state = removeCardAndApply(result.newState, playerId, card);
      this.state = forceDiscardRandom(this.state!, result.spikeTrapCancel.attackerId, 1, this.rng);
      this.state = setLastPlayedCard(this.state!, playerId, card, targetId);
      const { targetPlayerId, attackerId, revealedCard } = result.spikeTrapCancel;
      this.state = {
        ...this.state!,
        lastCombatEvent: { type: 'spike_trap', targetId: targetPlayerId, attackerId, revealedCard },
        lastHiddenReveal: { cardBaseId: 'spike_trap', defenderId: targetPlayerId, attackerId, result: 'Utility cancelled! Attacker discards 1 card.', revealedCard: revealedCard as HiddenCard },
      };
      return this.state;
    }

    if (!result.damageToDeal || result.damageToDeal.length === 0) {
      this.state = removeCardAndApply(result.newState, playerId, card);
      this.state = setLastPlayedCard(this.state!, playerId, card, targetId);
      if (result.weaponMissed) {
        this.state = { ...this.state!, lastCombatEvent: { type: 'missed', cardName: result.weaponMissed } };
      }
      if (result.extraDraws) {
        this.state = drawCards(this.state!, playerId, result.extraDraws, this.rng);
      }
      if (canPlayInDraw) {
        this.state = { ...this.state!, phase: 'play' };
      }
      return this.state;
    }

    this.state = result.newState;
    for (const d of result.damageToDeal) {
      const target = this.state!.players.find((p) => p.id === d.targetId);
      if (target && !target.isEliminated) {
        this.state = applyDamageAndCheckElimination(this.state!, d.targetId, d.amount, playerId, card, false, this.rng);
      }
    }

    this.state = removeCardAndApply(this.state!, playerId, card);
    this.state = setLastPlayedCard(this.state, playerId, card, targetId);
    if (result.extraDraws) {
      this.state = drawCards(this.state, playerId, result.extraDraws, this.rng);
    }

    return this.state;
  }

  private handlePlayHidden(action: Extract<GameAction, { type: 'play_hidden' }>): GameState | null {
    if (!this.state) return null;

    const { playerId, card } = action;
    const current = this.state.players[this.state.currentPlayerIndex];
    if (current.id !== playerId || this.state.phase !== 'play') {
      this.logReject(`play_hidden rejected: wrong player or phase`, 'wrong_player_or_phase');
      return this.state;
    }

    const player = this.state.players.find((p) => p.id === playerId)!;
    if (player.hiddenCard) {
      this.logReject(`play_hidden rejected: already have hidden card`, 'already_hidden');
      return this.state;
    }
    const cardIndex = player.hand.findIndex((c) => c.id === card.id);
    if (cardIndex < 0) {
      this.logReject(`play_hidden rejected: card not in hand`, 'card_not_found');
      return this.state;
    }
    if (card.type !== 'hidden') {
      this.logReject(`play_hidden rejected: not a hidden card`, 'wrong_type');
      return this.state;
    }

    const newHand = player.hand.filter((c) => c.id !== card.id);
    const newPlayers = this.state.players.map((p) =>
      p.id === playerId ? { ...p, hand: newHand, hiddenCard: card as import('./types').HiddenCard } : p
    );
    this.state = {
      ...this.state,
      players: newPlayers,
      lastPlayedCard: {
        playerId,
        playerName: player.name,
        card,
        targetName: undefined,
      },
    };
    return this.state;
  }

  /** When current player is eliminated mid-turn (e.g. Land Mine, Counterstrike), advance past them and process start-of-turn for next player. */
  private advancePastEliminatedIfNeeded(): GameState {
    if (!this.state) return this.state!;
    const current = this.state.players[this.state.currentPlayerIndex];
    if (!current || !current.isEliminated) return this.state;

    this.state = advanceToNextPlayer(this.state);

    for (;;) {
      this.state = applyStatusEffectDamage(this.state);
      this.state = tickStatusEffects(this.state);
      this.state = tickProtectiveTurns(this.state);

      const activeCount = this.state.players.filter((p) => !p.isEliminated).length;
      if (activeCount <= 1) {
        const winner = this.state.players.find((p) => !p.isEliminated);
        this.state = { ...this.state, winnerId: winner?.id, winnerReason: 'elimination' };
        return this.state;
      }

      const curr = this.state.players[this.state.currentPlayerIndex];
      if (!curr || curr.isEliminated) {
        this.state = advanceToNextPlayer(this.state);
      } else {
        break;
      }
    }

    return this.state;
  }

  private handleEndTurn(playerId: string): GameState | null {
    if (!this.state) return null;

    const current = this.state.players[this.state.currentPlayerIndex];
    if (current.id !== playerId) {
      this.logReject(`end_turn rejected: not your turn (${playerId})`, 'wrong_player');
      return this.state;
    }

    this.state = advanceToNextPlayer(this.state);

    for (;;) {
      this.state = applyStatusEffectDamage(this.state);
      this.state = tickStatusEffects(this.state);
      this.state = tickProtectiveTurns(this.state);

      const activeCount = this.state.players.filter((p) => !p.isEliminated).length;
      if (activeCount <= 1) {
        const winner = this.state.players.find((p) => !p.isEliminated);
        this.state = { ...this.state, winnerId: winner?.id, winnerReason: 'elimination' };
        return this.state;
      }

      const current = this.state.players[this.state.currentPlayerIndex];
      if (!current || current.isEliminated) {
        this.state = advanceToNextPlayer(this.state);
      } else {
        break;
      }
    }

    return this.state;
  }
}

function forceDiscardRandom(
  state: GameState,
  playerId: string,
  count: number,
  rng: () => number
): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.hand.length === 0) return state;
  const toDiscard = Math.min(count, player.hand.length);
  const indices = new Set<number>();
  while (indices.size < toDiscard) {
    indices.add(Math.floor(rng() * player.hand.length));
  }
  const newHand = player.hand.filter((_, i) => !indices.has(i));
  const discarded = player.hand.filter((_, i) => indices.has(i));
  const newPlayers = state.players.map((p) =>
    p.id === playerId ? { ...p, hand: newHand } : p
  );
  return {
    ...state,
    players: newPlayers,
    discardPile: [...state.discardPile, ...discarded],
  };
}

function setLastPlayedCard(
  state: GameState,
  playerId: string,
  card: AnyCard,
  targetId?: string
): GameState {
  const player = state.players.find((p) => p.id === playerId);
  const target = targetId ? state.players.find((p) => p.id === targetId) : null;
  return {
    ...state,
    lastPlayedCard: {
      playerId,
      playerName: player?.name ?? 'Unknown',
      card,
      targetName: target?.name,
    },
  };
}

function removeCardAndApply(state: GameState, playerId: string, card: AnyCard): GameState {
  const player = state.players.find((p) => p.id === playerId)!;
  const newHand = player.hand.filter((c) => c.id !== card.id);
  const turnIncrements =
    card.type === 'weapon'
      ? {
          weaponsPlayedThisTurn: player.weaponsPlayedThisTurn + 1,
          ...(player.extraWeaponAllowedThisTurn && player.weaponsPlayedThisTurn === 1 ? { extraWeaponAllowedThisTurn: false } : {}),
        }
      : card.type === 'utility'
        ? { utilitiesPlayedThisTurn: player.utilitiesPlayedThisTurn + 1 }
        : card.type === 'special'
          ? { specialsPlayedThisTurn: player.specialsPlayedThisTurn + 1 }
          : {};
  const newPlayers = state.players.map((p) =>
    p.id === playerId ? { ...p, hand: newHand, ...turnIncrements } : p
  );
  return {
    ...state,
    players: newPlayers,
    discardPile: [...state.discardPile, card],
  };
}

function getCardBaseId(cardId: string): string {
  return cardId.replace(/_\d+$/, '');
}

function applyDamageAndCheckElimination(
  state: GameState,
  targetId: string,
  damage: number,
  attackerId: string,
  attackingCard?: { damageType?: string },
  isRedirected = false,
  rng: () => number = () => Math.random()
): GameState {
  const target = state.players.find((p) => p.id === targetId)!;
  const isRanged = attackingCard?.damageType === 'ranged';
  const isMelee = attackingCard?.damageType === 'melee';
  const isWeaponAttack = attackingCard && (attackingCard.damageType === 'melee' || attackingCard.damageType === 'ranged');
  /** Damage from a card play (weapon/utility), not from DoT tick */
  const isAttack = attackingCard != null;

  if (DEBUG_HIDDEN_CARDS && isAttack) {
    const defenderHidden = target?.hiddenCard ? getCardBaseId(target.hiddenCard.id) : null;
    console.log('[HIDDEN] Attack', { attackerId, targetId, defenderHidden, hiddenCardUsedThisRound: state.hiddenCardUsedThisRound });
  }

  // Magic Mirror: redirect damage to attacker (when you would take damage)
  if (!isRedirected && target?.hiddenCard && getCardBaseId(target.hiddenCard.id) === 'magic_mirror' && !state.hiddenCardUsedThisRound) {
    const newPlayers = state.players.map((p) =>
      p.id === targetId ? { ...p, hiddenCard: null } : p
    );
    const reveal = { cardBaseId: 'magic_mirror' as const, defenderId: targetId, attackerId, result: 'Redirected all damage to the attacker!', revealedCard: target.hiddenCard };
    const ns = { ...state, players: newPlayers, hiddenCardUsedThisRound: true, lastHiddenReveal: reveal };
    return { ...applyDamageAndCheckElimination(ns, attackerId, damage, attackerId, attackingCard, true, rng), lastHiddenReveal: reveal };
  }

  // Protective Bubble: negate all damage from that single attack (not DoT)
  if (isAttack && target?.hiddenCard && getCardBaseId(target.hiddenCard.id) === 'protective_bubble' && !state.hiddenCardUsedThisRound) {
    const newPlayers = state.players.map((p) =>
      p.id === targetId ? { ...p, hiddenCard: null } : p
    );
    const reveal = { cardBaseId: 'protective_bubble' as const, defenderId: targetId, attackerId, result: 'All damage negated!', revealedCard: target.hiddenCard };
    return {
      ...state,
      players: newPlayers,
      hiddenCardUsedThisRound: true,
      lastCombatEvent: { type: 'blocked', targetId, effectName: 'Protective Bubble' },
      lastHiddenReveal: reveal,
    };
  }

  // Shadow Dodge: when attacked by Ranged weapon, negate attack and draw 1
  if (isRanged && target?.hiddenCard && getCardBaseId(target.hiddenCard.id) === 'shadow_dodge' && !state.hiddenCardUsedThisRound) {
    const withConsumed = state.players.map((p) =>
      p.id === targetId ? { ...p, hiddenCard: null } : p
    );
    const ns = { ...state, players: withConsumed, hiddenCardUsedThisRound: true };
    const reveal = { cardBaseId: 'shadow_dodge' as const, defenderId: targetId, attackerId, result: 'Attack negated! Defender draws 1 card.', revealedCard: target.hiddenCard };
    return {
      ...drawCards(ns, targetId, 1, rng),
      lastCombatEvent: { type: 'blocked', targetId, effectName: 'Shadow Dodge' },
      lastHiddenReveal: reveal,
    };
  }

  if (target.mechaSuitTurns > 0) {
    return { ...state, lastCombatEvent: { type: 'blocked', targetId, effectName: 'Mecha Suit' } };
  }
  if (target.kevlarActive && isRanged) {
    const newPlayers = state.players.map((p) =>
      p.id === targetId ? { ...p, kevlarActive: false } : p
    );
    return { ...state, players: newPlayers, lastCombatEvent: { type: 'blocked', targetId, effectName: 'Kevlar Vest' } };
  }
  if (target.chainMailActive && isMelee) {
    const newPlayers = state.players.map((p) =>
      p.id === targetId ? { ...p, chainMailActive: false } : p
    );
    return { ...state, players: newPlayers, lastCombatEvent: { type: 'blocked', targetId, effectName: 'Chain Mail' } };
  }

  let actualDamage = damage;
  // Claymore: negate 3 damage, attacker takes 3 (when attacked by weapon)
  if (
    isWeaponAttack &&
    target?.hiddenCard &&
    getCardBaseId(target.hiddenCard.id) === 'claymore' &&
    !state.hiddenCardUsedThisRound
  ) {
    actualDamage = Math.max(0, actualDamage - 3);
    const withConsumed = state.players.map((p) =>
      p.id === targetId ? { ...p, hiddenCard: null } : p
    );
    const ns = { ...state, players: withConsumed, hiddenCardUsedThisRound: true };
    const newHp = Math.max(0, target.hp - actualDamage);
    const newPlayers = ns.players.map((p) =>
      p.id === targetId ? { ...p, hp: newHp } : p
    );
    let newState: GameState = {
      ...ns,
      players: newPlayers,
      lastCombatEvent:
        damage > 0 && actualDamage < damage
          ? { type: 'damage_reduced', targetId, effectName: 'Claymore', from: damage, to: actualDamage }
          : { type: 'damage', targetId, amount: actualDamage },
      lastHiddenReveal: { cardBaseId: 'claymore', defenderId: targetId, attackerId, result: 'Negated 3 damage! Attacker takes 3 damage.', revealedCard: target.hiddenCard },
    };
    if (newHp <= 0) {
      newState = handleElimination(newState, targetId, attackerId);
    }
    newState = applyDamageAndCheckElimination(newState, attackerId, 3, targetId, undefined, false, rng);
    return newState;
  }

  if (target.heavyChestplateTurns > 0) {
    actualDamage = Math.max(0, damage - 2);
    if (actualDamage < damage) {
      const newHp = Math.max(0, target.hp - actualDamage);
      const newPlayers = state.players.map((p) =>
        p.id === targetId ? { ...p, hp: newHp } : p
      );
      let ns: GameState = {
        ...state,
        players: newPlayers,
        lastCombatEvent: { type: 'damage_reduced', targetId, effectName: 'Heavy Chestplate', from: damage, to: actualDamage },
      };
      if (newHp <= 0) {
        ns = handleElimination(ns, targetId, attackerId);
      }
      return ns;
    }
  }

  const newHp = Math.max(0, target.hp - actualDamage);
  const newPlayers = state.players.map((p) =>
    p.id === targetId ? { ...p, hp: newHp } : p
  );
  let newState: GameState = { ...state, players: newPlayers, lastCombatEvent: { type: 'damage', targetId, amount: actualDamage } };

  // Land Mine: when attacked by a weapon, attacker takes 5 damage after attack resolves
  if (
    isWeaponAttack &&
    target?.hiddenCard &&
    getCardBaseId(target.hiddenCard.id) === 'land_mine' &&
    !newState.hiddenCardUsedThisRound
  ) {
    const withConsumed = newState.players.map((p) =>
      p.id === targetId ? { ...p, hiddenCard: null } : p
    );
    const ns = { ...newState, players: withConsumed, hiddenCardUsedThisRound: true };
    newState = { ...applyDamageAndCheckElimination(ns, attackerId, 5, targetId, undefined, false, rng), lastHiddenReveal: { cardBaseId: 'land_mine', defenderId: targetId, attackerId, result: 'Attacker takes 5 damage!', revealedCard: target.hiddenCard } };
  }

  // Poisonous Apple: when attacked by a weapon, attacker takes 2 damage at the start of their next 2 turns (DoT)
  if (
    isWeaponAttack &&
    target?.hiddenCard &&
    getCardBaseId(target.hiddenCard.id) === 'poisonous_apple' &&
    !newState.hiddenCardUsedThisRound
  ) {
    const withConsumed = newState.players.map((p) =>
      p.id === targetId ? { ...p, hiddenCard: null } : p
    );
    const appleEffect = {
      type: 'poisonous_apple' as const,
      sourcePlayerId: targetId,
      targetPlayerId: attackerId,
      turnsRemaining: 2,
      damagePerTurn: 2,
    };
    const withEffect = withConsumed.map((p) =>
      p.id === attackerId
        ? { ...p, statusEffects: [...p.statusEffects, appleEffect] }
        : p
    );
    const ns = { ...newState, players: withEffect, hiddenCardUsedThisRound: true };
    newState = { ...ns, lastHiddenReveal: { cardBaseId: 'poisonous_apple', defenderId: targetId, attackerId, result: 'Attacker takes 2 damage for 2 turns!', revealedCard: target.hiddenCard } };
    if (DEBUG_HIDDEN_CARDS) console.log('[HIDDEN] Poisonous Apple triggered', { attackerId, targetId });
  }

  if (newHp <= 0) {
    newState = handleElimination(newState, targetId, attackerId);
  } else {
    // Counterstrike: when you survive a weapon attack, deal 3 damage back to attacker (not DoT)
    const survivor = newState.players.find((p) => p.id === targetId)!;
    if (
      isWeaponAttack &&
      survivor?.hiddenCard &&
      getCardBaseId(survivor.hiddenCard.id) === 'counterstrike' &&
      !newState.hiddenCardUsedThisRound
    ) {
      const withConsumed = newState.players.map((p) =>
        p.id === targetId ? { ...p, hiddenCard: null } : p
      );
      const ns = { ...newState, players: withConsumed, hiddenCardUsedThisRound: true };
      newState = { ...applyDamageAndCheckElimination(ns, attackerId, 3, targetId, undefined, false, rng), lastHiddenReveal: { cardBaseId: 'counterstrike', defenderId: targetId, attackerId, result: 'Dealt 3 damage back to the attacker!', revealedCard: survivor.hiddenCard } };
    }
  }

  return newState;
}

function handleElimination(state: GameState, targetId: string, attackerId: string): GameState {
  const eliminator = state.players.find((p) => p.id === attackerId);
  const eliminated = state.players.find((p) => p.id === targetId)!;
  const newPlayers = state.players.map((p) => {
    if (p.id === targetId) return { ...p, isEliminated: true, hand: [], hiddenCard: null };
    if (p.id === attackerId) return { ...p, hasEliminatedPlayer: true };
    return p;
  });
  let newState: GameState = {
    ...state,
    players: newPlayers,
    discardPile: [...state.discardPile, ...eliminated.hand],
    lastCombatEvent: { type: 'eliminated', targetId },
  };
  if (newState.config.momentumBonus && eliminator) {
    const idx = newState.players.findIndex((p) => p.id === attackerId);
    newState = {
      ...newState,
      players: newState.players.map((p, i) =>
        i === idx ? { ...p, hp: Math.min(p.maxHp, p.hp + 2) } : p
      ),
    };
    newState = drawCards(newState, attackerId, 2, () => Math.random());
  }
  return newState;
}

/** Tick down Mecha Suit and Heavy Chestplate for the current player at start of their turn */
function tickProtectiveTurns(state: GameState): GameState {
  const idx = state.currentPlayerIndex;
  const p = state.players[idx];
  if (!p || p.isEliminated) return state;
  const mecha = Math.max(0, (p.mechaSuitTurns ?? 0) - 1);
  const chest = Math.max(0, (p.heavyChestplateTurns ?? 0) - 1);
  if (mecha === (p.mechaSuitTurns ?? 0) && chest === (p.heavyChestplateTurns ?? 0)) return state;
  const newPlayers = state.players.map((pl, i) =>
    i === idx ? { ...pl, mechaSuitTurns: mecha, heavyChestplateTurns: chest } : pl
  );
  return { ...state, players: newPlayers };
}

/** Apply damage from status effects to the current player at start of their turn */
function applyStatusEffectDamage(state: GameState): GameState {
  const current = state.players[state.currentPlayerIndex];
  if (!current || current.isEliminated) return state;

  let ns = state;
  for (const e of current.statusEffects ?? []) {
    const damage = e.damagePerTurn ?? (e.turnsRemaining <= 1 ? (e.totalDamage ?? 0) : 0);
    if (damage > 0) {
      ns = applyDamageAndCheckElimination(ns, e.targetPlayerId, damage, e.sourcePlayerId);
    }
  }
  return ns;
}

/** Only tick the CURRENT player's status effects (damage is applied at start of their turn) */
function tickStatusEffects(state: GameState): GameState {
  const currentIdx = state.currentPlayerIndex;
  const newPlayers = state.players.map((p, i) => {
    if (i !== currentIdx) return p;
    const newEffects = p.statusEffects
      .map((e) => ({ ...e, turnsRemaining: e.turnsRemaining - 1 }))
      .filter((e) => e.turnsRemaining > 0);
    return { ...p, statusEffects: newEffects };
  });
  return { ...state, players: newPlayers };
}
