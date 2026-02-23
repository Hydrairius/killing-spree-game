/**
 * Build deck from config - PRD §4.1, §6
 */
import type { AnyCard, WeaponCard, UtilityCard, SpecialCard, HiddenCard } from '../game/types';

interface DeckConfig {
  weapons: { id: string; name: string; damageType: string; baseDamage: number; quantity: number }[];
  utility: { id: string; name: string; quantity: number }[];
  special: { id: string; name: string; quantity: number }[];
  hidden: { id: string; name: string; quantity: number }[];
}

export function buildDeck(config: DeckConfig): AnyCard[] {
  const deck: AnyCard[] = [];

  for (const w of config.weapons) {
    for (let i = 0; i < w.quantity; i++) {
      deck.push({
        id: `${w.id}_${i}`,
        name: w.name,
        type: 'weapon',
        damageType: w.damageType as 'melee' | 'ranged',
        baseDamage: w.baseDamage,
      } as WeaponCard);
    }
  }

  for (const u of config.utility) {
    for (let i = 0; i < u.quantity; i++) {
      deck.push({
        id: `${u.id}_${i}`,
        name: u.name,
        type: 'utility',
      } as UtilityCard);
    }
  }

  for (const s of config.special) {
    for (let i = 0; i < s.quantity; i++) {
      deck.push({
        id: `${s.id}_${i}`,
        name: s.name,
        type: 'special',
      } as SpecialCard);
    }
  }

  for (const h of config.hidden) {
    for (let i = 0; i < h.quantity; i++) {
      deck.push({
        id: `${h.id}_${i}`,
        name: h.name,
        type: 'hidden',
      } as HiddenCard);
    }
  }

  return deck;
}
