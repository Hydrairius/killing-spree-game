/**
 * Game types - PRD §4, §6, FR-12
 */

export type CardType = 'weapon' | 'utility' | 'special' | 'hidden';
export type DamageType = 'melee' | 'ranged';

export interface Card {
  id: string;
  name: string;
  type: CardType;
  damageType?: DamageType;
  baseDamage?: number;
}

export interface WeaponCard extends Card {
  type: 'weapon';
  damageType: DamageType;
  baseDamage: number;
}

export interface UtilityCard extends Card {
  type: 'utility';
}

export interface SpecialCard extends Card {
  type: 'special';
}

export interface HiddenCard extends Card {
  type: 'hidden';
}

export type AnyCard = WeaponCard | UtilityCard | SpecialCard | HiddenCard;

export type PlayerType = 'human' | 'ai';

export interface Player {
  id: string;
  name: string;
  type: PlayerType;
  hp: number;
  maxHp: number;
  hand: AnyCard[];
  hiddenCard: HiddenCard | null;
  isEliminated: boolean;
  skipNextTurn: boolean;
  /** Chainsaw: cannot play weapon next turn */
  skipWeaponNextTurn: boolean;
  /** Execution Order: chosen target id */
  executionOrderTarget?: string;
  /** Cards played this turn (for Combat Knife combo) */
  weaponsPlayedThisTurn: number;
  utilitiesPlayedThisTurn: number;
  specialsPlayedThisTurn: number;
  /** Draw Instead: used in play phase; only if no cards played yet, max 1 per turn */
  drewInsteadThisTurn?: boolean;
  /** Adrenaline: may play one additional Weapon this turn */
  extraWeaponAllowedThisTurn?: boolean;
  /** Damage taken this round (for Healing Wish) */
  damageTakenThisRound: number;
  /** Mecha Suit: turns remaining */
  mechaSuitTurns: number;
  /** Heavy Chestplate: turns remaining */
  heavyChestplateTurns: number;
  /** Kevlar Vest / Chain Mail: active this round */
  kevlarActive: boolean;
  chainMailActive: boolean;
  /** Molotov / Dynamite / Poisonous Apple: status effects */
  statusEffects: StatusEffect[];
  /** For Final Spree: has eliminated at least 1 player */
  hasEliminatedPlayer: boolean;
  /** For Devil's Blessing: swap pending */
  devilBlessingSwapTarget?: string;
  /** For Forgery: copy of last utility */
  forgeryCopyTarget?: string;
  /** AI playstyle — assigned at game start from seed */
  aiPlaystyle?: AIPlaystyle;
}

export interface StatusEffect {
  type: 'molotov' | 'dynamite' | 'poisonous_apple' | 'chainsaw';
  sourcePlayerId: string;
  targetPlayerId: string;
  turnsRemaining: number;
  damagePerTurn?: number;
  totalDamage?: number; // for dynamite
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';

/** Unique AI personality/strategy assigned per bot from game seed */
export type AIPlaystyle =
  | 'aggressor'   // Focus fire, kills, weapons first
  | 'defensive'  // Heal early, avoid traps, target threats
  | 'opportunist'// Guaranteed kills, Bear Trap on leader, Devil's Blessing
  | 'hunter'     // Bias toward human player
  | 'chaos'      // Random picks
  | 'calculated'; // Avoid hidden cards, spread damage

export const AI_PLAYSTYLES: AIPlaystyle[] = ['aggressor', 'defensive', 'opportunist', 'hunter', 'chaos', 'calculated'];

export interface GameConfig {
  playerCount: number;
  momentumBonus: boolean;
  aiDifficulty: AIDifficulty;
  seed?: number;
}

export interface GameState {
  config: GameConfig;
  players: Player[];
  drawPile: AnyCard[];
  discardPile: AnyCard[];
  currentPlayerIndex: number;
  roundNumber: number;
  phase: 'draw' | 'play' | 'end';
  /** Final Spree active for this player - damage doubled */
  finalSpreePlayerId?: string;
  /** Round when Final Spree started */
  finalSpreeStartRound?: number;
  /** Hidden card used this round (1 per round) */
  hiddenCardUsedThisRound: boolean;
  /** Winner if game over */
  winnerId?: string;
  winnerReason?: 'elimination' | 'final_spree';
  /** Last utility played (for Forgery) */
  lastUtilityPlayed?: { card: UtilityCard; playerId: string };
  /** Last card played (for UI feedback when AI plays) */
  lastPlayedCard?: { playerId: string; playerName: string; card: AnyCard; targetName?: string };
  /** Combat/effect event for UI juice (flash, block, etc.) - cleared on next action */
  lastCombatEvent?:
    | { type: 'damage'; targetId: string; amount: number }
    | { type: 'blocked'; targetId: string; effectName: string }
    | { type: 'damage_reduced'; targetId: string; effectName: string; from: number; to: number }
    | { type: 'eliminated'; targetId: string }
    | { type: 'missed'; cardName: string }
    | { type: 'spike_trap'; targetId: string; attackerId: string; revealedCard?: AnyCard };
  /** Hidden card revealed overlay - shown when Land Mine, Claymore, Counterstrike, Magic Mirror, etc. trigger */
  lastHiddenReveal?: {
    cardBaseId: string;
    defenderId: string;
    attackerId?: string;
    result: string;
    revealedCard: HiddenCard;
  };
}
