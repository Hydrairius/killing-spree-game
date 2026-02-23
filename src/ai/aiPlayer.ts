/**
 * AI opponent - PRD §10, AI-1 to AI-5
 * Uses playstyles (assigned from seed) for unique bot personalities.
 */
import type { GameState, Player, AIPlaystyle } from '../game/types';
import { getValidMoves, type ValidMove } from './validMoves';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export { AI_PLAYSTYLES } from '../game/types';

/** RNG function (0..1). If not provided, falls back to Math.random. */
type Rng = () => number;

function pick<T>(arr: T[], rng: Rng): T {
  return arr[Math.floor(rng() * arr.length)];
}

export function chooseAIMove(
  state: GameState,
  playerId: string,
  difficulty: AIDifficulty,
  rng: Rng = Math.random,
  playstyle?: AIPlaystyle
): ValidMove | null {
  const moves = getValidMoves(state, playerId);
  if (moves.length === 0) return null;

  const style = playstyle ?? mapDifficultyToPlaystyle(difficulty);
  return chooseMoveByPlaystyle(state, playerId, moves, style, rng);
}

/** Fallback when no playstyle assigned (e.g. old saves) */
function mapDifficultyToPlaystyle(d: AIDifficulty): AIPlaystyle {
  if (d === 'easy') return 'chaos';
  if (d === 'hard') return 'opportunist';
  return 'aggressor';
}

function chooseMoveByPlaystyle(
  state: GameState,
  playerId: string,
  moves: ValidMove[],
  playstyle: AIPlaystyle,
  rng: Rng
): ValidMove {
  const player = state.players.find((p) => p.id === playerId)!;
  const humanId = state.players[0]?.id;

  switch (playstyle) {
    case 'chaos':
      return pick(moves, rng);
    case 'aggressor':
      return chooseAggressor(state, player, moves, rng);
    case 'defensive':
      return chooseDefensive(state, player, moves, rng);
    case 'opportunist':
      return chooseOpportunist(state, player, moves, rng);
    case 'hunter':
      return chooseHunter(state, player, moves, humanId, rng);
    case 'calculated':
      return chooseCalculated(state, player, moves, rng);
    default:
      return pick(moves, rng);
  }
}

/** Aggressor: focus fire, kills first, weapons first, heal only when very low */
function chooseAggressor(state: GameState, player: Player, moves: ValidMove[], rng: Rng): ValidMove {
  const playMoves = moves.filter((m) => m.type.startsWith('play_'));
  const endTurn = moves.find((m) => m.type === 'end_turn');
  const draw = moves.find((m) => m.type === 'draw');

  if (player.hp <= 5 && hasHeal(playMoves)) {
    const heals = playMoves.filter((m) => isHeal(m));
    if (heals.length > 0) return pick(heals, rng);
  }

  const weaponMoves = playMoves.filter((m) => m.type === 'play_weapon');
  if (weaponMoves.length > 0) {
    const withScore = weaponMoves.map((m) => ({
      move: m,
      score: scoreForKill(state, m) * 1000 + (1000 - getTargetHp(state, m)),
    }));
    const best = Math.max(...withScore.map((x) => x.score));
    const tied = withScore.filter((x) => x.score === best).map((x) => x.move);
    return pick(tied, rng);
  }

  if (playMoves.length > 0) return pick(playMoves, rng);
  return endTurn ?? draw ?? moves[0];
}

/** Defensive: heal earlier (≤10), avoid hidden cards, target highest HP threat */
function chooseDefensive(state: GameState, player: Player, moves: ValidMove[], rng: Rng): ValidMove {
  const playMoves = moves.filter((m) => m.type.startsWith('play_'));
  const endTurn = moves.find((m) => m.type === 'end_turn');
  const draw = moves.find((m) => m.type === 'draw');

  if (player.hp <= 10 && hasHeal(playMoves)) {
    const heals = playMoves.filter((m) => isHeal(m));
    if (heals.length > 0) return pick(heals, rng);
  }

  const weaponMoves = playMoves.filter((m) => m.type === 'play_weapon');
  if (weaponMoves.length > 0) {
    const withScore = weaponMoves.map((m) => ({
      move: m,
      score: getTargetHp(state, m) - (getTargetHasHidden(state, m) ? 150 : 0),
    }));
    const best = Math.max(...withScore.map((x) => x.score));
    const tied = withScore.filter((x) => x.score === best).map((x) => x.move);
    return pick(tied, rng);
  }

  if (playMoves.length > 0) return pick(playMoves, rng);
  return endTurn ?? draw ?? moves[0];
}

/** Opportunist: kills first, Bear Trap on leader, Devil's Blessing, Final Spree */
function chooseOpportunist(state: GameState, player: Player, moves: ValidMove[], rng: Rng): ValidMove {
  if (player.hasEliminatedPlayer && player.hand.some((c) => c.id?.includes('final_spree'))) {
    const finalSpree = moves.find((m) => m.card?.id?.includes('final_spree'));
    const weak = state.players.filter((p) => !p.isEliminated && p.id !== player.id && p.hp <= 10);
    if (finalSpree && weak.length > 0) return finalSpree;
  }

  const weaponMoves = moves.filter((m) => m.type === 'play_weapon');
  const kills = weaponMoves.filter((m) => isGuaranteedKill(state, m));
  if (kills.length > 0) return pick(kills, rng);

  const devilMoves = moves.filter((m) => m.card?.id?.includes('devils_blessing'));
  if (devilMoves.length > 0 && player.hp <= 5) {
    const withScore = devilMoves.map((m) => ({
      move: m,
      score: m.targetId ? (state.players.find((p) => p.id === m.targetId)?.hp ?? 0) : 0,
    }));
    const best = Math.max(...withScore.map((x) => x.score));
    const tied = withScore.filter((x) => x.score === best).map((x) => x.move);
    return pick(tied, rng);
  }

  const bearTrap = moves.filter((m) => m.card?.id?.includes('bear_trap'));
  if (bearTrap.length > 0) {
    const highestHp = Math.max(
      ...bearTrap
        .map((m) => state.players.find((p) => p.id === m.targetId)?.hp ?? 0)
        .filter((h) => h > 0)
    );
    const best = bearTrap.filter((m) => (state.players.find((p) => p.id === m.targetId)?.hp ?? 0) === highestHp);
    if (best.length > 0) return pick(best, rng);
  }

  return chooseAggressor(state, player, moves, rng);
}

/** Hunter: bias toward human player (p0) */
function chooseHunter(
  state: GameState,
  player: Player,
  moves: ValidMove[],
  humanId: string | undefined,
  rng: Rng
): ValidMove {
  if (!humanId) return pick(moves, rng);

  const targetingHuman = moves.filter((m) => m.targetId === humanId || m.targetId2 === humanId);
  if (targetingHuman.length > 0 && rng() < 0.7) return pick(targetingHuman, rng);

  return chooseAggressor(state, player, moves, rng);
}

/** Calculated: avoid hidden cards, prefer spread damage */
function chooseCalculated(state: GameState, _player: Player, moves: ValidMove[], rng: Rng): ValidMove {
  const playMoves = moves.filter((m) => m.type.startsWith('play_'));
  const weaponMoves = playMoves.filter((m) => m.type === 'play_weapon');

  if (weaponMoves.length > 0) {
    const withScore = weaponMoves.map((m) => ({
      move: m,
      score:
        scoreForKill(state, m) * 500 +
        (m.targetId2 ? 50 : 0) -
        (getTargetHasHidden(state, m) ? 200 : 0) +
        (1000 - getTargetHp(state, m)),
    }));
    const best = Math.max(...withScore.map((x) => x.score));
    const tied = withScore.filter((x) => x.score === best).map((x) => x.move);
    return pick(tied, rng);
  }

  if (playMoves.length > 0) return pick(playMoves, rng);
  const endTurn = moves.find((m) => m.type === 'end_turn');
  const draw = moves.find((m) => m.type === 'draw');
  return endTurn ?? draw ?? moves[0];
}

function hasHeal(playMoves: ValidMove[]): boolean {
  return playMoves.some((m) => m.card?.id?.includes('medkit') || m.card?.id?.includes('bandage'));
}

function isHeal(m: ValidMove): boolean {
  return !!(m.card?.id?.includes('medkit') || m.card?.id?.includes('bandage'));
}

function getTargetHp(state: GameState, m: ValidMove): number {
  const id = m.targetId ?? m.targetId2;
  return id ? (state.players.find((p) => p.id === id)?.hp ?? 99) : 99;
}

function getTargetHasHidden(state: GameState, m: ValidMove): boolean {
  const id = m.targetId ?? m.targetId2;
  return !!(id && state.players.find((p) => p.id === id)?.hiddenCard);
}

function scoreForKill(state: GameState, m: ValidMove): number {
  const t = m.targetId ? state.players.find((p) => p.id === m.targetId) : null;
  const dmg = m.card?.baseDamage ?? 0;
  return t && t.hp <= dmg ? 1 : 0;
}

function isGuaranteedKill(state: GameState, m: ValidMove): boolean {
  return scoreForKill(state, m) === 1;
}
