/**
 * Valid move generator - PRD AI-1
 */
import type { GameState, AnyCard } from '../game/types';

export interface ValidMove {
  type: 'play_weapon' | 'play_utility' | 'play_special' | 'play_hidden' | 'draw' | 'end_turn';
  card?: AnyCard;
  targetId?: string;
  targetId2?: string;
}

export function getValidMoves(state: GameState, playerId: string): ValidMove[] {
  const player = state.players.find((p) => p.id === playerId);
  if (!player || player.isEliminated) return [];
  if (state.winnerId) return [];

  const current = state.players[state.currentPlayerIndex];
  if (current.id !== playerId) return [];

  const moves: ValidMove[] = [];

  if (state.phase === 'draw') {
    if (!(state.roundNumber === 1 && state.currentPlayerIndex === 0)) {
      moves.push({ type: 'draw' });
      // Devil's Blessing: can play instead of drawing when at 5 HP or less (desperate swap at start of turn)
      const devilCard = player.hand.find((c) => c.type === 'special' && c.id.replace(/_\d+$/, '') === 'devils_blessing');
      if (devilCard && player.hp <= 5) {
        const targets = state.players.filter((p) => !p.isEliminated && p.id !== playerId).map((p) => p.id);
        for (const t of targets) moves.push({ type: 'play_special', card: devilCard, targetId: t });
      }
    }
  }

  if (state.phase === 'play') {
    const hasPlayedWeapon = player.weaponsPlayedThisTurn > 0;
    const hasPlayedUtility = (player.utilitiesPlayedThisTurn ?? 0) > 0;
    const hasPlayedSpecial = (player.specialsPlayedThisTurn ?? 0) > 0;
    const canPlayWeapon = !player.skipWeaponNextTurn && (!hasPlayedWeapon || (player.extraWeaponAllowedThisTurn && player.weaponsPlayedThisTurn === 1));
    const canPlayUtility = !hasPlayedUtility;
    const canPlaySpecialType = !hasPlayedSpecial;

    for (const card of player.hand) {
      if (card.type === 'weapon' && canPlayWeapon) {
        const targets = getWeaponTargets(state, playerId, card);
        if (targets.length > 0) {
          for (const t of targets) {
            moves.push({ type: 'play_weapon', card, targetId: t });
          }
          if (cardNeedsTwoTargets(card) && targets.length >= 2) {
            for (let i = 0; i < targets.length; i++) {
              for (let j = 0; j < targets.length; j++) {
                if (i !== j) {
                  moves.push({ type: 'play_weapon', card, targetId: targets[i], targetId2: targets[j] });
                }
              }
            }
          }
        } else if (card.id.startsWith('rocket_launcher')) {
          moves.push({ type: 'play_weapon', card });
        }
      } else if (card.type === 'utility' && canPlayUtility) {
        const targets = getUtilityTargets(state, playerId, card);
        if (targets.length === 0) moves.push({ type: 'play_utility', card });
        else for (const t of targets) moves.push({ type: 'play_utility', card, targetId: t });
      } else if (card.type === 'special' && canPlaySpecialType) {
        if (canPlaySpecialCard(state, player, card)) {
          const targets = getSpecialTargets(state, playerId, card);
          if (targets.length === 0) moves.push({ type: 'play_special', card });
          else for (const t of targets) moves.push({ type: 'play_special', card, targetId: t });
        }
      } else if (card.type === 'hidden' && !player.hiddenCard) {
        moves.push({ type: 'play_hidden', card });
      }
    }

    const hasPlayedAnyCard = player.weaponsPlayedThisTurn > 0 || (player.utilitiesPlayedThisTurn ?? 0) > 0 || (player.specialsPlayedThisTurn ?? 0) > 0;
    if (!player.drewInsteadThisTurn && !hasPlayedAnyCard) moves.push({ type: 'draw' });
    moves.push({ type: 'end_turn' });

    // Defensive: filter out weapon plays if already played a weapon (avoids AI loop when state is stale)
    const canPlaySecondWeapon = player.extraWeaponAllowedThisTurn && player.weaponsPlayedThisTurn === 1;
    if (player.weaponsPlayedThisTurn > 0 && !canPlaySecondWeapon) {
      return moves.filter((m) => m.type !== 'play_weapon');
    }
    if (player.weaponsPlayedThisTurn >= 2) {
      return moves.filter((m) => m.type !== 'play_weapon');
    }
  }

  return moves;
}

function cardNeedsTwoTargets(card: AnyCard): boolean {
  return card.id.startsWith('assault_rifle') || card.id.startsWith('throwing_knives');
}


function getWeaponTargets(state: GameState, playerId: string, card: AnyCard): string[] {
  const targets = state.players
    .filter((p) => !p.isEliminated && p.id !== playerId)
    .map((p) => p.id);
  if (card.id.startsWith('assault_rifle') || card.id.startsWith('throwing_knives')) {
    return targets;
  }
  if (card.id.startsWith('rocket_launcher')) return [];
  return targets;
}

function getUtilityTargets(state: GameState, playerId: string, card: AnyCard): string[] {
  const baseId = card.id.replace(/_\d+$/, '');
  const needsTarget = ['bear_trap', 'grenade', 'molotov', 'dynamite', 'poison_dart', 'petty_thief'].includes(baseId);
  if (!needsTarget) return [];
  return state.players.filter((p) => !p.isEliminated && p.id !== playerId).map((p) => p.id);
}

function getSpecialTargets(state: GameState, playerId: string, card: AnyCard): string[] {
  const baseId = card.id.replace(/_\d+$/, '');
  const needsTarget = ['war_elephant', 'dog_squad', 'devils_blessing', 'execution_order'].includes(baseId);
  if (!needsTarget) return [];
  if (baseId === 'devils_blessing') {
    const player = state.players.find((p) => p.id === playerId)!;
    if (player.hp > 5) return [];
  }
  return state.players.filter((p) => !p.isEliminated && p.id !== playerId).map((p) => p.id);
}

function canPlaySpecialCard(_state: GameState, player: { hasEliminatedPlayer: boolean; hp: number }, card: AnyCard): boolean {
  const baseId = card.id.replace(/_\d+$/, '');
  if (baseId === 'final_spree' && !player.hasEliminatedPlayer) return false;
  if (baseId === 'devils_blessing' && player.hp > 5) return false;
  return true;
}
