/**
 * Core game engine - PRD §4, §5, §7, FR-2, FR-5, FR-8
 * Deterministic, headless (no UI dependency)
 */
import type { GameState, Player, AIPlaystyle } from './types';
import { createSeededRandom, shuffle } from './rng';
import { buildDeck } from '../data/deckBuilder';
import deckConfig from '../data/deck.json';
import { AI_PLAYSTYLES } from './types';

const STARTING_HP = 20;
const STARTING_HAND_SIZE = 7;

export function createGame(
  playerCount: number,
  momentumBonus: boolean,
  seed: number = Date.now(),
  aiDifficulty: 'easy' | 'medium' | 'hard' = 'medium'
): GameState {
  const rng = createSeededRandom(seed);
  const deck = buildDeck(deckConfig as never);
  const shuffled = shuffle(deck, rng);

  const playstyleOrder = shuffle(AI_PLAYSTYLES.map((_, i) => i), rng);

  const players: Player[] = [];
  const names = ['You', 'AI-1', 'AI-2', 'AI-3'];
  for (let i = 0; i < playerCount; i++) {
    const hand = shuffled.splice(0, STARTING_HAND_SIZE);
    const playstyle: AIPlaystyle | undefined =
      i > 0 ? AI_PLAYSTYLES[playstyleOrder[(i - 1) % playstyleOrder.length]] : undefined;
    players.push({
      id: `p${i}`,
      name: names[i],
      type: i === 0 ? 'human' : 'ai',
      aiPlaystyle: playstyle,
      hp: STARTING_HP,
      maxHp: STARTING_HP,
      hand,
      hiddenCard: null,
      isEliminated: false,
      skipNextTurn: false,
      skipWeaponNextTurn: false,
      weaponsPlayedThisTurn: 0,
      utilitiesPlayedThisTurn: 0,
      specialsPlayedThisTurn: 0,
      drewInsteadThisTurn: false,
      damageTakenThisRound: 0,
      mechaSuitTurns: 0,
      heavyChestplateTurns: 0,
      kevlarActive: false,
      chainMailActive: false,
      statusEffects: [],
      hasEliminatedPlayer: false,
    });
  }

  return {
    config: {
      playerCount,
      momentumBonus,
      aiDifficulty,
      seed,
    },
    players,
    drawPile: shuffled,
    discardPile: [],
    currentPlayerIndex: 0,
    roundNumber: 1,
    phase: 'draw',
    hiddenCardUsedThisRound: false,
  };
}

export function drawCards(state: GameState, playerId: string, count: number, rng: () => number): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.isEliminated) return state;

  let drawPile = [...state.drawPile];
  let discardPile = [...state.discardPile];
  let hand = [...player.hand];

  for (let i = 0; i < count; i++) {
    if (drawPile.length === 0) {
      if (discardPile.length > 0) {
        drawPile = shuffle(discardPile, rng);
        discardPile = [];
      } else break;
    }
    const card = drawPile.pop()!;
    hand = [...hand, card];
  }

  const newPlayers = state.players.map((p) =>
    p.id === playerId ? { ...p, hand } : p
  );
  return { ...state, players: newPlayers, drawPile, discardPile };
}

export function advanceToNextPlayer(state: GameState): GameState {
  const activePlayers = state.players.filter((p) => !p.isEliminated);
  if (activePlayers.length <= 1) return state;

  const prevPlayerIndex = state.currentPlayerIndex;
  let newPlayers = state.players.map((p, i) =>
    i === prevPlayerIndex
      ? { ...p, weaponsPlayedThisTurn: 0, utilitiesPlayedThisTurn: 0, specialsPlayedThisTurn: 0, drewInsteadThisTurn: false, extraWeaponAllowedThisTurn: false, skipWeaponNextTurn: false }
      : p
  );

  let nextIndex = (prevPlayerIndex + 1) % state.players.length;
  let attempts = 0;
  while (attempts < state.players.length) {
    const candidate = newPlayers[nextIndex];
    if (candidate.isEliminated) {
      nextIndex = (nextIndex + 1) % state.players.length;
      attempts++;
      continue;
    }
    if (candidate.skipNextTurn) {
      newPlayers = newPlayers.map((p, i) =>
        i === nextIndex ? { ...p, skipNextTurn: false } : p
      );
      nextIndex = (nextIndex + 1) % state.players.length;
      attempts++;
      continue;
    }
    break;
  }

  const isNewRound = nextIndex <= prevPlayerIndex;
  const newRound = isNewRound ? state.roundNumber + 1 : state.roundNumber;

  return {
    ...state,
    players: newPlayers,
    currentPlayerIndex: nextIndex,
    roundNumber: newRound,
    phase: 'draw',
    hiddenCardUsedThisRound: isNewRound ? false : state.hiddenCardUsedThisRound,
  };
}

export function applyDamage(
  state: GameState,
  targetId: string,
  damage: number,
  eliminatorId?: string
): GameState {
  const target = state.players.find((p) => p.id === targetId);
  if (!target || target.isEliminated || damage <= 0) return state;

  let actualDamage = damage;

  if (target.mechaSuitTurns > 0) return state;
  if (target.heavyChestplateTurns > 0) actualDamage = Math.max(0, actualDamage - 2);

  const newHp = Math.max(0, target.hp - actualDamage);
  const newPlayers = state.players.map((p) => {
    if (p.id !== targetId) return p;
    return {
      ...p,
      hp: newHp,
      damageTakenThisRound: p.damageTakenThisRound + actualDamage,
    };
  });

  let ns: GameState = { ...state, players: newPlayers };

  if (newHp <= 0) {
    ns = eliminatePlayer(ns, targetId, eliminatorId);
  }

  return ns;
}

export function eliminatePlayer(state: GameState, playerId: string, eliminatorId?: string): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;

  const newState = {
    ...state,
    players: state.players.map((p) => {
      if (p.id !== playerId) return p;
      return {
        ...p,
        isEliminated: true,
        hand: [],
        hiddenCard: null,
      };
    }),
    discardPile: [...state.discardPile, ...player.hand],
  };

  if (eliminatorId) {
    const eliminator = newState.players.find((p) => p.id === eliminatorId);
    if (eliminator) {
      eliminator.hasEliminatedPlayer = true;
      if (state.config.momentumBonus) {
        newState.players = newState.players.map((p) =>
          p.id === eliminatorId ? { ...p, hp: Math.min(p.maxHp, p.hp + 2), hasEliminatedPlayer: true } : p
        );
        return drawCards(newState, eliminatorId, 2, () => Math.random());
      }
    }
  }

  return newState;
}
