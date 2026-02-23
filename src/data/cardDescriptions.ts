/**
 * Card effect descriptions - PRD §6
 * Used for card preview UI
 */
export const CARD_EFFECTS: Record<string, { effect: string; subtext?: string }> = {
  katana: { effect: 'Deal 3 damage. If target is reduced below 10 HP, deal +1 bonus damage.', subtext: 'Momentum finisher' },
  combat_knife: { effect: 'Deal 2 damage. If played after another Weapon this turn, deal +1 bonus damage.', subtext: 'Combo weapon' },
  baseball_bat: { effect: 'Deal 3 damage. Target discards 1 card.', subtext: 'Disruption tool' },
  morning_star: { effect: 'Deal 3 damage. Cannot be blocked by Dodge-type Hidden cards.', subtext: 'Armor pierce' },
  chainsaw: { effect: 'Deal 3 damage now, then 3 damage at the start of their next turn. Cannot play another Weapon next turn.', subtext: 'Initial hit + DoT' },
  glock: { effect: 'Deal 2 damage. Draw 1 card after dealing damage.', subtext: 'Tempo weapon' },
  revolver: { effect: 'Deal 3 damage. Flip a coin — on heads deal damage, on tails it misses.', subtext: 'Risk/reward' },
  '44_magnum': { effect: 'Deal 3 damage. If target has more HP than you, deal +1 bonus damage.', subtext: 'Underdog weapon' },
  crossbow: { effect: 'Deal 4 damage. Must skip next Weapon phase.', subtext: 'Heavy shot delay' },
  assault_rifle: { effect: 'May deal 3 damage split between up to two players.', subtext: 'Multi-target pressure' },
  throwing_knives: { effect: 'May split damage between two targets (1+2).', subtext: 'Flexible targeting' },
  bow: { effect: 'Deal 2 damage. If you have an active Hidden card, deal +1 bonus damage.', subtext: 'Synergy weapon' },
  barrett_m82: { effect: 'Deal 5 damage. Target cannot play Hidden cards in response.', subtext: 'Sniper finisher' },
  rocket_launcher: { effect: 'Deals 5 damage to all players. You take 2 recoil damage.', subtext: 'Legendary chaos weapon' },
  medkit: { effect: 'Restore 5 HP.', subtext: 'Strong healing' },
  bandage: { effect: 'Restore 2 HP.', subtext: 'Minor sustain' },
  bear_trap: { effect: 'Target a player. That player skips their next turn.', subtext: 'High tempo disruption' },
  molotov: { effect: 'Deal 1 damage per turn for 3 turns.', subtext: 'Damage over time' },
  kevlar_vest: { effect: 'Immune to next Ranged attack this round.', subtext: 'Ranged counter' },
  chain_mail: { effect: 'Immune to next Melee attack this round.', subtext: 'Melee counter' },
  heavy_chestplate: { effect: 'Reduce all incoming damage by 2 for 2 turns.', subtext: 'Stronger defense' },
  dynamite: { effect: 'After 1 full round, deal 6 damage to that player.', subtext: 'Delayed burst damage' },
  grenade: { effect: 'Deal 4 damage instantly.', subtext: 'Reliable burst tool' },
  petty_thief: { effect: 'Steal 1 random card from their hand. They draw 1 card.', subtext: 'Card advantage' },
  forgery: { effect: 'Play immediately after another Utility. Copy that Utility\'s effect.', subtext: 'Reactive utility tech' },
  adrenaline: { effect: 'You may play one additional Weapon this turn.', subtext: 'Aggression enabler' },
  poison_dart: { effect: 'Deal 2 damage now and 2 damage at the start of their next turn.', subtext: 'Hybrid burst + delayed' },
  final_spree: { effect: 'For one full round, all damage you deal is doubled. If you eliminate a player during this round, you win instantly.', subtext: 'Requires: Have eliminated ≥1 player' },
  healing_wish: { effect: 'Skip your next turn. Heal all damage taken this round and recover 5 HP.', subtext: 'Strong sustain with tempo cost' },
  mecha_suit: { effect: 'You are immune to all damage for 2 turns.', subtext: 'Defensive power spike' },
  war_elephant: { effect: 'Deal 6 damage to target player and 2 damage to all others.', subtext: 'High impact battlefield swing' },
  dog_squad: { effect: 'Deal 4 damage to one target. If they survive, they discard 2 cards.', subtext: 'Mid-tier pressure card' },
  devils_blessing: { effect: 'Swap life totals with a chosen player.', subtext: 'Requires: 5 HP or less' },
  mass_panic: { effect: 'All players discard their hands and draw 3 new cards.', subtext: 'Chaos reset card' },
  execution_order: { effect: 'Secretly choose a player. If they die before your next turn, draw 3 cards and deal 3 damage to any target.', subtext: 'Strategic bounty mechanic' },
  land_mine: { effect: 'When you are attacked by a Weapon: Attacker takes 5 damage after attack resolves.', subtext: 'Heavy retaliation deterrent' },
  claymore: { effect: 'When you are attacked: Negate 3 damage. Attacker takes 3 damage.', subtext: 'Hybrid defense + punish' },
  poisonous_apple: { effect: 'When you are attacked: Attacker takes 2 damage at the start of their next 2 turns.', subtext: 'Damage over time punishment' },
  protective_bubble: { effect: 'When you would take damage: Negate all damage from that single attack.', subtext: 'Pure defensive stop' },
  magic_mirror: { effect: 'When you would take damage: Redirect the full damage to another player of your choice.', subtext: 'High-impact redirect' },
  spike_trap: { effect: 'When a player targets you with a Utility: That effect is canceled. Attacker discards 1 card.', subtext: 'Anti-utility tech' },
  shadow_dodge: { effect: 'When attacked by a Ranged weapon: Negate the attack and draw 1 card.', subtext: 'Ranged counter + tempo' },
  counterstrike: { effect: 'When you survive an attack: Deal 3 damage back to attacker.', subtext: 'Momentum reversal tool' },
};

export function getCardEffect(cardId: string): { effect: string; subtext?: string } | undefined {
  const baseId = cardId.replace(/_\d+$/, '');
  return CARD_EFFECTS[baseId];
}
