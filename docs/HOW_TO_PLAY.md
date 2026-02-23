# How to Play: Killing Spree

A competitive PvP card game where 2–4 players battle to eliminate opponents or win instantly via Final Spree. Play weapons, utilities, specials, and face-down hidden cards to outwit your foes.

---

## Quick Start (Read this first)

- **Win condition:** Eliminate all other players (reduce their HP to 0), or play **Final Spree** and eliminate someone during that round to win instantly.
- **On your turn you:**
  1. Draw 1 card (except first player, round 1)
  2. Play up to 1 weapon, 1 utility, and 1 special—**or** Draw Instead (one extra card) instead of playing
  3. End your turn
- **Key thing to remember:** You can only play **one of each card type** per turn (1 weapon, 1 utility, 1 special). Playing a hidden card is separate—you can do that in addition.
- **Example of a basic turn:** Draw → Play Katana on AI-1 (3 damage) → Play Medkit on yourself (+5 HP) → End Turn.

---

## The Goal

- **Primary:** Reduce every opponent's HP to 0. Last player standing wins.
- **Alternate:** Play **Final Spree** when you’ve eliminated at least one player. For that round, your damage is doubled. If you eliminate someone, you win instantly.
- **Lose:** Your HP reaches 0. You’re eliminated and drop out of the game.

---

## Setup

- **Players:** 2–4 (you vs 1–3 AI opponents).
- **Deck:** Shuffled. Each player draws **7 cards** at start.
- **HP:** Everyone starts at **20 HP**.
- **Board:** Opponents sit around the table (top/sides); you sit at the bottom. Center has draw pile, discard pile, and combat events.
- **First player:** Configured (e.g. human or random). Turns rotate **clockwise**.
- **Hidden cards:** Played face-down. You can have at most **1 hidden card** on the table at a time.

---

## Turn Flow

1. **Draw phase** — Draw 1 card (or skip draw if you're first player, round 1). You may also play **Devil's Blessing** instead of drawing if you have 5 HP or less.
2. **Play phase** — Play cards in any order, respecting limits:
   - Up to **1 Weapon**
   - Up to **1 Utility**
   - Up to **1 Special**
   - **OR** instead of playing any card: use **Draw Instead** (draw 1 extra card; only if you haven’t played anything yet)
3. **End turn** — Click **End Turn**. The next player’s turn starts.
4. **Start of next player’s turn** — Before they act:
   - Damage-over-time effects (Molotov, Chainsaw, Dynamite, Poisonous Apple) deal their damage
   - Status effects tick down (turns remaining decrease)
   - Protective effects (Mecha Suit, Heavy Chestplate) tick down
   - If that player died from DoT, the turn skips to the next living player

---

## Actions You Can Take

- **Draw** — In draw phase, draw 1 card. Button says "Draw" or "Start Turn" (round 1, first player skips draw).
- **Play Weapon** — In play phase, play a weapon card. Choose a target (or targets for split-damage cards). Deal damage.
- **Play Utility** — In play phase, play a utility (heal, damage, trap, protection, etc.). Target if required.
- **Play Special** — In play phase, play a special card. Target if required. Specials have strong effects.
- **Play Hidden** — In play phase, play a hidden card face-down. It stays on the table and triggers when its condition is met. Only 1 hidden card per player.
- **Draw Instead** — In play phase, if you haven’t played any cards yet, you may draw 1 extra card instead of playing.
- **End Turn** — End your turn. Next player goes.

---

## Combat & Damage

- **Attacking:** Play a weapon or damaging utility. Pick target(s). Damage is applied after armor checks and hidden card triggers.
- **Defending:**
  - **Kevlar Vest** — Blocks next Ranged attack this round.
  - **Chain Mail** — Blocks next Melee attack this round.
  - **Heavy Chestplate** — Reduces all incoming damage by 2 for 2 turns (ticks at start of your turn).
  - **Mecha Suit** — Immune to all damage for 2 turns (ticks at start of your turn).
  - **Hidden cards** — Trigger on attack (Land Mine, Claymore, Protective Bubble, Magic Mirror, Shadow Dodge, Counterstrike, Poisonous Apple) or on utility targeting (Spike Trap).
- **Timing:** Armor checks first (Kevlar/Chain Mail vs attack type), then hidden cards, then damage.
- **How damage is applied:** HP is reduced. At 0 HP, the player is eliminated (hand discarded, removed from play).

---

## Hidden Cards / Traps

- **How they’re placed:** Play a hidden card from your hand during play phase. It goes face-down on your side of the table.
- **When they trigger:** When their condition is met (e.g. “when you are attacked by a weapon”).
- **What the opponent can/can’t know:** Opponents see that you have a hidden card (face-down) but **cannot** see what it is. You can click yours to **peek** at it.
- **Reveal rules:** Only **1 hidden card may resolve per round**. When one triggers, it flips face-up, shows its effect in an overlay, and is consumed. You can play another hidden card on a later turn.
- **DoT vs attacks:** Most hidden cards (Land Mine, Claymore, Protective Bubble, Counterstrike, Shadow Dodge) trigger only on **weapon/utility attacks**, not on damage-over-time (Molotov, Dynamite, Chainsaw, etc.). **Magic Mirror** does trigger on DoT and redirects it.

---

## Cards & Effects Reference

### Status Effects (Damage Over Time)

| Effect | Source | Damage | Duration | Notes |
|--------|--------|--------|----------|-------|
| Molotov | Molotov Cocktail | 1 per turn | 3 turns | Stacks with other Molotovs |
| Dynamite | Dynamite | 6 total | 1 turn (after delay) | Deals 6 when it goes off |
| Poisonous Apple | Hidden card (when attacked) | 2 per turn | 2 turns | Applied to attacker |
| Chainsaw | Chainsaw weapon | 3 now + 3 next turn | 1 turn DoT | Attacker can’t play weapon next turn |

Status effects tick at the **start of your turn**—you take the damage, then the effect’s remaining turns decrease.

### Protective Effects

| Effect | Source | How it works |
|--------|--------|--------------|
| Kevlar | Kevlar Vest | Consumed on next Ranged block |
| Chain Mail | Chain Mail | Consumed on next Melee block |
| Heavy Chestplate | Heavy Chestplate | −2 damage for 2 turns; ticks at start of your turn |
| Mecha Suit | Mecha Suit | Immune to all damage for 2 turns; ticks at start of your turn |

### Hidden Cards

| Name | Trigger | Effect |
|------|--------|--------|
| **Land Mine** | When you are attacked by a Weapon | Attacker takes 5 damage after attack resolves |
| **Claymore** | When you are attacked | Negate 3 damage; attacker takes 3 damage |
| **Poisonous Apple** | When you are attacked | Attacker takes 2 damage at start of their next 2 turns |
| **Protective Bubble** | When you would take damage (attack) | Negate all damage from that single attack |
| **Magic Mirror** | When you would take damage | Redirect full damage to another player (implemented: redirects to attacker) |
| **Spike Trap** | When a player targets you with a Utility | Cancel that utility; they discard 1 card |
| **Shadow Dodge** | When attacked by a Ranged weapon | Negate the attack and draw 1 card |
| **Counterstrike** | When you survive an attack | Deal 3 damage back to attacker |

### Weapons (Summary)

- **Melee:** Katana (3 + momentum), Combat Knife (2 + combo), Baseball Bat (3 + discard), Morning Star (3, pierces Dodge), Chainsaw (3 + 3 DoT, skip weapon next turn)
- **Ranged:** Glock (2 + draw), Revolver (3, coin flip), 44 Magnum (3 + underdog), Crossbow (4, skip weapon next turn), Assault Rifle (3, split 1–2 targets), Throwing Knives (2 split), Bow (2 + hidden bonus), Barrett M82 (5, blocks hidden response), Rocket Launcher (5 to all, 2 recoil to you)

---

## UI Guide (Where things are)

- **Health:** Each player has an HP bar and number. Human: bottom area; opponents: top/sides.
- **Hand/deck:** Your hand is a fan of cards at the bottom. Draw pile and discard pile are in the center.
- **Hidden card indicator:** A face-down card appears next to your (or an opponent’s) seat when they have a hidden card.
- **Log/history:** DevLog panel (bottom-left) shows actions, combat events, and traps. Use for debugging.
- **End Turn button:** In the actions area at the bottom, when it’s your turn in play phase.
- **Settings:** Gear icon (top right). Opens menu with bug report, etc.
- **Back to Lobby:** ← Lobby button (top left).
- **Round / Phase:** Shown in the header (e.g. “Round 3”, “play”).

---

## FAQ / Common Confusions

**Q: Can I play a weapon and then Adrenaline to play another weapon?**  
A: No. You must play Adrenaline **first**. Adrenaline lets you play one **extra** weapon this turn only after you’ve played it.

**Q: Does Draw Instead count as “playing a card”?**  
A: No. Draw Instead is your **only** action for the play phase when you use it. You can’t play any cards and then Draw Instead.

**Q: If I attack someone with a hidden card, can multiple hidden cards trigger?**  
A: No. Only **one** hidden card resolves per round. The first one whose condition is met triggers; others wait.

**Q: Does Protective Bubble block damage from Molotov or Chainsaw?**  
A: No. Protective Bubble triggers only on **attacks** (weapons, utilities). DoT from status effects is not blocked.

**Q: When does Bear Trap make me skip my turn?**  
A: You skip your **next** turn after being hit. The turn advances past you when it would be your turn.

**Q: Can I play Devil's Blessing at the start of my turn before drawing?**  
A: Yes. If you have 5 HP or less, you can play Devil's Blessing **instead of drawing** in the draw phase.

**Q: What happens if the Rocket Launcher eliminates me?**  
A: You take 2 recoil damage. If that (or the 5 to everyone) reduces you to 0 HP, you’re eliminated like any other damage.

**Q: Can I play a hidden card and a weapon in the same turn?**  
A: Yes. Hidden cards are separate from the “1 weapon, 1 utility, 1 special” limit. You can play one of each plus a hidden if you have room.

**Q: Does Morning Star ignore Shield-type hidden cards?**  
A: Morning Star says it cannot be blocked by Dodge-type hidden cards. Shadow Dodge is a dodge; it does not block Morning Star.

---

## Tips & Examples

### Example 1: Basic aggression
You have Katana and Medkit. Play Katana on AI-1 for 3 damage. If they drop below 10 HP, Katana deals +1 (4 total). Then play Medkit on yourself for +5 HP. End turn. You’ve pressured them and healed.

### Example 2: Hidden card bluff
Play Land Mine face-down. Opponents see you have a hidden card but not which one. When AI attacks you with a weapon, Land Mine triggers: they take 5 damage. If they would have killed you, the Land Mine damage might eliminate them first—or make them think twice before attacking.

### Example 3: Final Spree setup
You’ve eliminated AI-1. You have Final Spree and Grenade. Play Final Spree. Your damage is doubled this round. Play Grenade on AI-2: 4×2 = 8 damage. If they have 8 or less HP, they’re eliminated and you win instantly.

---

## Clarifications Needed

These are design questions that may need resolution:

1. **Magic Mirror target choice:** PRD says “redirect to another player of your choice.” Current implementation always redirects to the attacker. Should players eventually choose the redirect target?

2. **Hidden card priority:** When multiple players have hidden cards that could theoretically trigger in the same situation, only one resolves per round. Is the order (e.g. defender’s card first) the intended priority, or should it be documented?

3. **Momentum Bonus:** Optional rule: when you eliminate a player, draw 2 cards and +2 HP. Is this always on in the digital version, or is it a lobby toggle?

---

## JSON Structure for UI Rendering

```json
{
  "title": "How to Play: Killing Spree",
  "sections": [
    {
      "id": "quick_start",
      "heading": "Quick Start",
      "bullets": [
        "Win: eliminate all opponents OR play Final Spree and eliminate someone that round.",
        "Each turn: Draw 1 → Play up to 1 weapon, 1 utility, 1 special (or Draw Instead) → End Turn.",
        "One of each card type per turn; hidden cards are separate.",
        "Example: Draw → Katana on AI-1 → Medkit on self → End Turn."
      ]
    },
    {
      "id": "goal",
      "heading": "The Goal",
      "bullets": [
        "Primary: Reduce every opponent's HP to 0. Last standing wins.",
        "Alternate: Final Spree + eliminate someone = instant win.",
        "Lose: Your HP reaches 0."
      ]
    },
    {
      "id": "setup",
      "heading": "Setup",
      "bullets": [
        "2-4 players, 7 cards each, 20 HP.",
        "Turns rotate clockwise. One hidden card per player max."
      ]
    },
    {
      "id": "turn_flow",
      "heading": "Turn Flow",
      "steps": [
        "Draw phase: Draw 1 (or Devil's Blessing if HP ≤ 5).",
        "Play phase: Up to 1 weapon, 1 utility, 1 special—or Draw Instead.",
        "End turn.",
        "Next player: DoT damage, status tick, protection tick, then they act."
      ]
    },
    {
      "id": "actions",
      "heading": "Actions You Can Take",
      "bullets": [
        "Draw, Play Weapon, Play Utility, Play Special, Play Hidden, Draw Instead, End Turn"
      ]
    },
    {
      "id": "combat",
      "heading": "Combat & Damage",
      "bullets": [
        "Armor (Kevlar, Chain Mail, Heavy Chestplate, Mecha Suit) blocks or reduces damage.",
        "Hidden cards trigger before or after damage.",
        "0 HP = eliminated."
      ]
    },
    {
      "id": "hidden_cards",
      "heading": "Hidden Cards / Traps",
      "bullets": [
        "Play face-down. Only 1 resolves per round. Opponents cannot see identity.",
        "Trigger on attack (most) or utility targeting (Spike Trap)."
      ]
    },
    {
      "id": "status_effects",
      "heading": "Status Effects",
      "bullets": [
        "Molotov, Dynamite, Poisonous Apple, Chainsaw: damage at start of your turn.",
        "Stacks. Ticks down each turn."
      ]
    },
    {
      "id": "hidden_reference",
      "heading": "Hidden Cards Reference",
      "bullets": [
        "Land Mine: 5 damage to attacker. Claymore: negate 3, attacker takes 3.",
        "Poisonous Apple: 2 dmg/turn for 2 turns on attacker. Protective Bubble: negate all.",
        "Magic Mirror: redirect damage. Spike Trap: cancel utility, they discard 1.",
        "Shadow Dodge: negate Ranged, draw 1. Counterstrike: 3 damage back if you survive."
      ]
    },
    {
      "id": "ui_guide",
      "heading": "UI Guide",
      "bullets": [
        "Health: HP bar on each seat. Hand: bottom. Piles: center.",
        "Hidden card: face-down card by seat. End Turn: bottom actions.",
        "Settings: gear icon top right. DevLog: bottom-left."
      ]
    },
    {
      "id": "faq",
      "heading": "FAQ",
      "bullets": [
        "Adrenaline must be played first to get extra weapon.",
        "Draw Instead = no cards played that phase.",
        "One hidden card per round. Protective Bubble blocks attacks only, not DoT.",
        "Bear Trap skips next turn. Devil's Blessing can replace draw at ≤5 HP."
      ]
    },
    {
      "id": "tips",
      "heading": "Tips & Examples",
      "bullets": [
        "Basic: Katana + Medkit to pressure and heal.",
        "Bluff: Land Mine deters attacks and punishes.",
        "Final Spree: double damage + elimination = instant win."
      ]
    }
  ]
}
```
