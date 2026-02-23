/**
 * Card effect resolution - PRD §6, FR-3
 * Resolves weapon, utility, special, and hidden card effects
 */
import type {
  GameState,
  AnyCard,
  WeaponCard,
  UtilityCard,
  SpecialCard,
} from './types';
import { applyDamage } from './gameEngine';
import type { SeededRNG } from './rng';

export interface PlayContext {
  state: GameState;
  card: AnyCard;
  playerId: string;
  targetId?: string;
  targetId2?: string; // for split damage
  rng: SeededRNG;
}

export interface ResolveResult {
  newState: GameState;
  damageToDeal?: { targetId: string; amount: number }[];
  extraDraws?: number;
  message?: string;
  /** Spike Trap: target's hidden card cancelled the utility; attacker discards 1, effect not applied */
  spikeTrapCancel?: { targetPlayerId: string; attackerId: string; revealedCard: AnyCard };
  /** Revolver: coin flip was tails, weapon missed */
  weaponMissed?: string;
}

function getCardBaseId(card: AnyCard): string {
  return card.id.replace(/_\d+$/, '');
}

export function resolveCardEffect(ctx: PlayContext): ResolveResult {
  const { state, card } = ctx;

  switch (card.type) {
    case 'weapon':
      return resolveWeapon(ctx as PlayContext & { card: WeaponCard });
    case 'utility':
      return resolveUtility(ctx as PlayContext & { card: UtilityCard });
    case 'special':
      return resolveSpecial(ctx as PlayContext & { card: SpecialCard });
    case 'hidden':
      return { newState: state };
  }
}

function resolveWeapon(ctx: PlayContext & { card: WeaponCard }): ResolveResult {
  const { state, card, playerId, targetId, rng } = ctx;
  const player = state.players.find((p) => p.id === playerId)!;
  const baseId = getCardBaseId(card);
  let damage = card.baseDamage ?? 0;

  if (state.finalSpreePlayerId === playerId) damage *= 2;

  const target = targetId ? state.players.find((p) => p.id === targetId) : null;
  if (!target || target.isEliminated) return { newState: state };

  switch (baseId) {
    case 'katana':
      if (target.hp <= 10 && target.hp - damage <= 0) damage += 1;
      break;
    case 'combat_knife':
      if (player.weaponsPlayedThisTurn >= 1) damage += 1;
      break;
    case '44_magnum':
      if (target.hp > player.hp) damage += 1;
      break;
    case 'bow':
      if (player.hiddenCard) damage += 1;
      break;
    case 'revolver':
      if (!(rng() >= 0.5)) {
        damage = 0;
        return { newState: state, weaponMissed: 'Revolver' };
      }
      break;
    case 'crossbow':
      if (targetId) {
        const withSkip = state.players.map((p) =>
          p.id === playerId ? { ...p, skipWeaponNextTurn: true } : p
        );
        return { newState: { ...state, players: withSkip }, damageToDeal: [{ targetId, amount: damage }] };
      }
      break;
    case 'chainsaw':
      if (targetId) {
        const withDoT = addStatusEffect(state, playerId, targetId, 'chainsaw', 1, { damagePerTurn: 3 });
        const withSkipWeapon = withDoT.newState.players.map((p) =>
          p.id === playerId ? { ...p, skipWeaponNextTurn: true } : p
        );
        return { newState: { ...withDoT.newState, players: withSkipWeapon }, damageToDeal: [{ targetId, amount: damage }] };
      }
      break;
    case 'assault_rifle':
    case 'throwing_knives':
      return resolveSplitDamage(ctx, damage);
    case 'rocket_launcher':
      return resolveRocketLauncher(ctx, damage);
  }

  if (baseId === 'glock' && damage > 0) {
    return { newState: state, damageToDeal: [{ targetId: targetId!, amount: damage }], extraDraws: 1 };
  }
  return { newState: state, damageToDeal: damage > 0 ? [{ targetId: targetId!, amount: damage }] : undefined };
}

function resolveSplitDamage(ctx: PlayContext & { card: WeaponCard }, totalDamage: number): ResolveResult {
  const { state, targetId, targetId2 } = ctx;
  const damages: { targetId: string; amount: number }[] = [];
  const baseId = getCardBaseId(ctx.card);

  if (baseId === 'assault_rifle') {
    if (targetId && targetId2) {
      // Split damage between two targets (e.g. 3→2+1, 6→3+3 with Final Spree)
      const first = Math.ceil(totalDamage / 2);
      damages.push({ targetId, amount: first });
      damages.push({ targetId: targetId2, amount: totalDamage - first });
    } else if (targetId) {
      damages.push({ targetId, amount: totalDamage });
    }
  } else {
    if (targetId) damages.push({ targetId, amount: 1 });
    if (targetId2) damages.push({ targetId: targetId2, amount: 2 });
  }
  return { newState: state, damageToDeal: damages };
}

function resolveRocketLauncher(ctx: PlayContext & { card: WeaponCard }, damage: number): ResolveResult {
  const { state, playerId } = ctx;
  const activePlayers = state.players.filter((p) => !p.isEliminated);
  const damages: { targetId: string; amount: number }[] = [];
  for (const p of activePlayers) {
    damages.push({ targetId: p.id, amount: p.id === playerId ? 2 : damage });
  }
  return { newState: state, damageToDeal: damages };
}


function resolveUtility(ctx: PlayContext & { card: UtilityCard }): ResolveResult {
  const { state, card, playerId, targetId } = ctx;
  const baseId = getCardBaseId(card);

  // Spike Trap: when a targeted Utility is played, check if target has Spike Trap hidden
  const targetedUtilities = ['bear_trap', 'grenade', 'molotov', 'dynamite', 'poison_dart', 'petty_thief'];
  if (targetId && targetedUtilities.includes(baseId) && !state.hiddenCardUsedThisRound) {
    const target = state.players.find((p) => p.id === targetId);
    const hasSpikeTrap = target?.hiddenCard && getCardBaseId(target.hiddenCard) === 'spike_trap';
    if (hasSpikeTrap) {
      const revealedCard = target!.hiddenCard!;
      const newPlayers = state.players.map((p) =>
        p.id === targetId ? { ...p, hiddenCard: null } : p
      );
      return {
        newState: {
          ...state,
          players: newPlayers,
          hiddenCardUsedThisRound: true,
        },
        spikeTrapCancel: { targetPlayerId: targetId, attackerId: playerId, revealedCard },
      };
    }
  }

  switch (baseId) {
    case 'medkit':
      return healPlayer(state, playerId, 5);
    case 'bandage':
      return healPlayer(state, playerId, 2);
    case 'bear_trap':
      if (targetId) {
        const newPlayers = state.players.map((p) =>
          p.id === targetId ? { ...p, skipNextTurn: true } : p
        );
        return { newState: { ...state, players: newPlayers } };
      }
      break;
    case 'grenade':
      if (targetId) return { newState: state, damageToDeal: [{ targetId, amount: 4 }] };
      break;
    case 'kevlar_vest':
      return setPlayerFlag(state, playerId, 'kevlarActive', true);
    case 'chain_mail':
      return setPlayerFlag(state, playerId, 'chainMailActive', true);
    case 'heavy_chestplate':
      return setPlayerFlag(state, playerId, 'heavyChestplateTurns', 2);
    case 'adrenaline':
      return setPlayerFlag(state, playerId, 'extraWeaponAllowedThisTurn', true);
    case 'petty_thief':
      if (targetId) return stealCard(state, playerId, targetId);
      break;
    case 'molotov':
      if (targetId)
        return addStatusEffect(state, playerId, targetId, 'molotov', 3, { damagePerTurn: 1 });
      break;
    case 'dynamite':
      if (targetId) return addStatusEffect(state, playerId, targetId, 'dynamite', 1, { totalDamage: 6 });
      break;
    case 'poison_dart':
      if (targetId) {
        const withEffect = addStatusEffect(state, playerId, targetId, 'poisonous_apple', 1, { damagePerTurn: 2 });
        return { newState: withEffect.newState, damageToDeal: [{ targetId, amount: 2 }] };
      }
      break;
    case 'mass_panic':
      return resolveMassPanic(state);
  }

  return { newState: state };
}

function healPlayer(state: GameState, playerId: string, amount: number): ResolveResult {
  const newPlayers = state.players.map((p) =>
    p.id === playerId ? { ...p, hp: Math.min(p.maxHp, p.hp + amount) } : p
  );
  return { newState: { ...state, players: newPlayers } };
}

function setPlayerFlag(state: GameState, playerId: string, flag: string, value: number | boolean | string): ResolveResult {
  const newPlayers = state.players.map((p) =>
    p.id === playerId ? { ...p, [flag]: value } : p
  );
  return { newState: { ...state, players: newPlayers } };
}

function addStatusEffect(
  state: GameState,
  sourceId: string,
  targetId: string,
  type: 'molotov' | 'dynamite' | 'poisonous_apple' | 'chainsaw',
  turns: number,
  opts: { damagePerTurn?: number; totalDamage?: number }
): ResolveResult {
  const newEffect = {
    type,
    sourcePlayerId: sourceId,
    targetPlayerId: targetId,
    turnsRemaining: turns,
    ...opts,
  };
  const newPlayers = state.players.map((p) =>
    p.id === targetId
      ? { ...p, statusEffects: [...p.statusEffects, newEffect] }
      : p
  );
  return { newState: { ...state, players: newPlayers } };
}

function stealCard(state: GameState, stealerId: string, targetId: string): ResolveResult {
  const target = state.players.find((p) => p.id === targetId)!;
  if (target.hand.length === 0) return { newState: state };

  const idx = Math.floor(Math.random() * target.hand.length);
  const stolen = target.hand[idx];
  const newHand = target.hand.filter((_, i) => i !== idx);

  const newPlayers = state.players.map((p) => {
    if (p.id === targetId) return { ...p, hand: newHand };
    if (p.id === stealerId) return { ...p, hand: [...p.hand, stolen] };
    return p;
  });

  return { newState: { ...state, players: newPlayers } };
}

function resolveMassPanic(state: GameState): ResolveResult {
  const activePlayers = state.players.filter((p) => !p.isEliminated);
  const allDiscarded = activePlayers.flatMap((p) => p.hand);
  const newDiscard = [...state.discardPile, ...allDiscarded];

  const drawPile = [...state.drawPile, ...newDiscard];
  const shuffled = [...drawPile].sort(() => Math.random() - 0.5);

  const newPlayers = state.players.map((p) => {
    if (p.isEliminated) return p;
    const drawn = shuffled.splice(0, 3);
    return { ...p, hand: drawn };
  });

  return {
    newState: {
      ...state,
      players: newPlayers,
      drawPile: shuffled,
      discardPile: [],
    },
  };
}

function resolveSpecial(ctx: PlayContext & { card: SpecialCard }): ResolveResult {
  const { state, card, playerId, targetId } = ctx;
  const player = state.players.find((p) => p.id === playerId)!;
  const baseId = getCardBaseId(card);

  switch (baseId) {
    case 'final_spree':
      if (!player.hasEliminatedPlayer) return { newState: state };
      return {
        newState: {
          ...state,
          finalSpreePlayerId: playerId,
          finalSpreeStartRound: state.roundNumber,
        },
      };
    case 'healing_wish':
      const healed = healPlayer(state, playerId, 5 + player.damageTakenThisRound).newState;
      return setPlayerFlag(healed, playerId, 'skipNextTurn', true);
    case 'mecha_suit':
      return setPlayerFlag(state, playerId, 'mechaSuitTurns', 2);
    case 'war_elephant':
      if (targetId) {
        let ns = applyDamage(state, targetId, 6, playerId);
        for (const p of ns.players) {
          if (!p.isEliminated && p.id !== targetId && p.id !== playerId) ns = applyDamage(ns, p.id, 2, playerId);
        }
        return { newState: ns };
      }
      break;
    case 'dog_squad':
      if (targetId) {
        let ns = applyDamage(state, targetId, 4, playerId);
        const target = ns.players.find((p) => p.id === targetId)!;
        if (target.hp > 0 && target.hand.length >= 2) {
          const newHand = target.hand.slice(0, -2);
          ns = { ...ns, players: ns.players.map((p) => (p.id === targetId ? { ...p, hand: newHand } : p)), discardPile: [...ns.discardPile, ...target.hand.slice(-2)] };
        }
        return { newState: ns };
      }
      break;
    case 'devils_blessing':
      if (player.hp <= 5 && targetId) {
        const target = state.players.find((p) => p.id === targetId);
        if (!target || target.isEliminated) break;
        const swap = [player.hp, target.hp];
        const newPlayers = state.players.map((p) => {
          if (p.id === playerId) return { ...p, hp: Math.min(swap[1], p.maxHp) };
          if (p.id === targetId) return { ...p, hp: Math.min(swap[0], p.maxHp) };
          return p;
        });
        return { newState: { ...state, players: newPlayers } };
      }
      break;
    case 'mass_panic':
      return resolveMassPanic(state);
    case 'execution_order':
      if (targetId)
        return setPlayerFlag(state, playerId, 'executionOrderTarget', targetId);
      break;
  }

  return { newState: state };
}
