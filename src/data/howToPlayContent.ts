/** Tutorial content for How to Play modal. Synced with docs/HOW_TO_PLAY.md */

export interface TutorialSection {
  id: string;
  heading: string;
  bullets?: string[];
  steps?: string[];
}

export interface TutorialPage {
  id: string;
  label: string;
  icon?: string; // short emoji or label for tab
  sections: TutorialSection[];
}

export const HOW_TO_PLAY_TITLE = 'How to Play: Killing Spree';

/** Top-level pages. User switches between them via tabs. */
export const HOW_TO_PLAY_PAGES: TutorialPage[] = [
  {
    id: 'quick_start',
    label: 'Quick Start',
    icon: '▶',
    sections: [
      {
        id: 'quick_start',
        heading: 'Read this first',
        bullets: [
          'Win: eliminate all opponents OR play Final Spree and eliminate someone that round.',
          'Each turn: Draw 1 → Play up to 1 weapon, 1 utility, 1 special (or Draw Instead) → End Turn.',
          'One of each card type per turn; hidden cards are separate.',
          'Example: Draw → Katana on AI-1 → Medkit on self → End Turn.',
        ],
      },
      {
        id: 'goal',
        heading: 'The Goal',
        bullets: [
          'Primary: Reduce every opponent\'s HP to 0. Last standing wins.',
          'Alternate: Final Spree + eliminate someone = instant win.',
          'Lose: Your HP reaches 0.',
        ],
      },
      {
        id: 'setup',
        heading: 'Setup',
        bullets: [
          '2–4 players, 7 cards each, 20 HP.',
          'Turns rotate clockwise. One hidden card per player max.',
        ],
      },
    ],
  },
  {
    id: 'rules',
    label: 'Rules',
    icon: '📋',
    sections: [
      {
        id: 'turn_flow',
        heading: 'Turn Flow',
        steps: [
          'Draw phase: Draw 1 (or Devil\'s Blessing if HP ≤ 5).',
          'Play phase: Up to 1 weapon, 1 utility, 1 special—or Draw Instead.',
          'End turn.',
          'Next player: DoT damage, status tick, protection tick, then they act.',
        ],
      },
      {
        id: 'actions',
        heading: 'Actions You Can Take',
        bullets: [
          'Draw — In draw phase, draw 1 card.',
          'Play Weapon — In play phase. Choose target(s). Deal damage.',
          'Play Utility — Heal, damage, trap, protection, etc.',
          'Play Special — Powerful effects. Target if required.',
          'Play Hidden — Face-down. Triggers when condition is met.',
          'Draw Instead — In play phase, draw 1 extra if you haven\'t played any cards.',
          'End Turn — Pass to next player.',
        ],
      },
      {
        id: 'combat',
        heading: 'Combat & Damage',
        bullets: [
          'Armor (Kevlar, Chain Mail, Heavy Chestplate, Mecha Suit) blocks or reduces damage.',
          'Hidden cards trigger before or after damage.',
          '0 HP = eliminated.',
        ],
      },
      {
        id: 'hidden_cards',
        heading: 'Hidden Cards / Traps',
        bullets: [
          'Play face-down. Only 1 resolves per round. Opponents cannot see identity.',
          'Trigger on attack (most) or utility targeting (Spike Trap).',
        ],
      },
    ],
  },
  {
    id: 'encyclopedia',
    label: 'Card Encyclopedia',
    icon: '🃏',
    sections: [
      {
        id: 'weapons_melee',
        heading: 'Weapons — Melee',
        bullets: [
          'Katana — 3 dmg. +1 if target drops below 10 HP.',
          'Combat Knife — 2 dmg. +1 if played after another weapon this turn.',
          'Baseball Bat — 3 dmg. Target discards 1 card.',
          'Morning Star — 3 dmg. Ignores Dodge-type hidden cards.',
          'Chainsaw — 3 dmg now + 3 DoT next turn. Skip weapon next turn.',
        ],
      },
      {
        id: 'weapons_ranged',
        heading: 'Weapons — Ranged',
        bullets: [
          'Glock — 2 dmg. Draw 1 card.',
          'Revolver — 3 dmg. Coin flip: heads hit, tails miss.',
          '44 Magnum — 3 dmg. +1 if target has more HP than you.',
          'Crossbow — 4 dmg. Skip weapon next turn.',
          'Assault Rifle — 3 dmg split (1–2 targets).',
          'Throwing Knives — 2 dmg split (1+2).',
          'Bow — 2 dmg. +1 if you have a hidden card.',
          'Barrett M82 — 5 dmg. Target can\'t play hidden in response.',
          'Rocket Launcher — 5 dmg to all. You take 2 recoil.',
        ],
      },
      {
        id: 'utilities',
        heading: 'Utilities',
        bullets: [
          'Medkit — Restore 5 HP.',
          'Bandage — Restore 2 HP.',
          'Bear Trap — Target skips next turn.',
          'Molotov — 1 dmg/turn for 3 turns.',
          'Kevlar Vest — Block next Ranged attack.',
          'Chain Mail — Block next Melee attack.',
          'Heavy Chestplate — −2 dmg for 2 turns.',
          'Dynamite — 6 dmg after 1 round delay.',
          'Grenade — 4 dmg instantly.',
          'Petty Thief — Steal 1 card; they draw 1.',
          'Forgery — Copy the last Utility played.',
          'Adrenaline — Play one extra weapon this turn.',
          'Poison Dart — 2 dmg now + 2 dmg next turn.',
        ],
      },
      {
        id: 'specials',
        heading: 'Specials',
        bullets: [
          'Final Spree — Double damage this round. Eliminate = instant win. (Requires: eliminated ≥1)',
          'Healing Wish — Skip next turn. Heal round damage + 5 HP.',
          'Mecha Suit — Immune for 2 turns.',
          'War Elephant — 6 dmg to target, 2 to all others.',
          'Dog Squad — 4 dmg. If survive, discard 2 cards.',
          'Devil\'s Blessing — Swap HP with chosen player. (Requires: HP ≤ 5)',
          'Mass Panic — Everyone discards hand, draws 3.',
          'Execution Order — If chosen player dies before your next turn: draw 3, deal 3 to any target.',
        ],
      },
      {
        id: 'hidden',
        heading: 'Hidden Cards',
        bullets: [
          'Land Mine — When attacked by Weapon: attacker takes 5 dmg.',
          'Claymore — When attacked: negate 3 dmg, attacker takes 3.',
          'Poisonous Apple — When attacked: attacker takes 2 dmg/turn for 2 turns.',
          'Protective Bubble — When you would take dmg: negate all from that attack.',
          'Magic Mirror — When you would take dmg: redirect to another player.',
          'Spike Trap — When targeted by Utility: cancel effect, they discard 1.',
          'Shadow Dodge — When attacked by Ranged: negate and draw 1.',
          'Counterstrike — When you survive attack: deal 3 dmg back.',
        ],
      },
      {
        id: 'status_effects',
        heading: 'Status Effects (DoT)',
        bullets: [
          'Molotov — 1 dmg/turn for 3 turns. Stacks.',
          'Dynamite — 6 dmg when timer expires.',
          'Poisonous Apple — 2 dmg/turn for 2 turns (on attacker).',
          'Chainsaw — 3 dmg at start of target\'s next turn.',
        ],
      },
      {
        id: 'protective',
        heading: 'Protective Effects',
        bullets: [
          'Kevlar — Block next Ranged attack.',
          'Chain Mail — Block next Melee attack.',
          'Heavy Chestplate — −2 dmg for 2 turns.',
          'Mecha Suit — Immune for 2 turns.',
        ],
      },
    ],
  },
  {
    id: 'ui_guide',
    label: 'UI Guide',
    icon: '🖥',
    sections: [
      {
        id: 'ui_guide',
        heading: 'Where things are',
        bullets: [
          'Health — HP bar on each seat. Human: bottom; opponents: top/sides.',
          'Hand — Card fan at bottom.',
          'Piles — Draw and discard in center.',
          'Hidden card — Face-down card by seat.',
          'End Turn — Bottom actions when it\'s your turn.',
          'Settings — Gear icon top right (How to Play, Report Bug).',
          'DevLog — Bottom-left debug panel.',
        ],
      },
    ],
  },
  {
    id: 'faq_tips',
    label: 'FAQ & Tips',
    icon: '❓',
    sections: [
      {
        id: 'faq',
        heading: 'FAQ',
        bullets: [
          'Adrenaline must be played first to get extra weapon.',
          'Draw Instead = no cards played that phase.',
          'One hidden card per round. Protective Bubble blocks attacks only, not DoT.',
          'Bear Trap skips next turn. Devil\'s Blessing can replace draw at ≤5 HP.',
        ],
      },
      {
        id: 'tips',
        heading: 'Tips & Examples',
        bullets: [
          'Basic: Katana + Medkit to pressure and heal.',
          'Bluff: Land Mine deters attacks and punishes.',
          'Final Spree: double damage + elimination = instant win.',
        ],
      },
    ],
  },
];

/** @deprecated Use HOW_TO_PLAY_PAGES. Kept for backwards compatibility. */
export const HOW_TO_PLAY_SECTIONS: TutorialSection[] = HOW_TO_PLAY_PAGES.flatMap((p) => p.sections);
