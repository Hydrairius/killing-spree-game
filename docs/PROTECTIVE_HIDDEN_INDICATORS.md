# Protective & Hidden Card Indicators

**Date:** February 21, 2026

---

## Requirement

For all players (human + AI opponents), display:
1. **Indicators** for active protective effects (Kevlar, Chain Mail, Heavy Chestplate, Mecha Suit)
2. **Hidden cards on the table** — show face-down cards visually so users can see who has a hidden card played

---

## Status Effect Indicators (DoT)

Players with damage-over-time effects (Molotov, Dynamite, Poisonous Apple) show badges:

| Effect | Display | Notes |
|--------|---------|-------|
| Molotov | 🔥 1×3 | 1 dmg/turn, 3 turns remaining |
| Dynamite | 💣 6 (1) | 6 dmg in 1 turn |
| Poisonous Apple | ☠ 2×1 | 2 dmg per remaining turn (on attacker) |
| Chainsaw | 🪚 3×2 | 3 dmg/turn for 2 turns (weapon DoT) |

Badges appear in `PlayerTableCards` next to protection badges; numbers tick down as turns pass.

---

## Protective Effects (Player State)

| Effect | Field | Display | Tick behavior |
|--------|-------|---------|---------------|
| Kevlar Vest | `kevlarActive` | 🛡 Ranged | Consumed on next Ranged block |
| Chain Mail | `chainMailActive` | 🛡 Melee | Consumed on next Melee block |
| Heavy Chestplate | `heavyChestplateTurns` | 🛡 −2 dmg (N) | Ticks down at **start of your turn** |
| Mecha Suit | `mechaSuitTurns` | 🤖 Immune (N) | Ticks down at **start of your turn** |

Heavy Chestplate and Mecha Suit are turn-based: `tickProtectiveTurns` decrements them when your turn starts. See [TURN_FLOW.md](TURN_FLOW.md).

---

## Hidden Cards (Player State)

| Field | Display |
|-------|---------|
| `hiddenCard` | Face-down card (card-back style) on table in player's area |

Hidden cards are played face-down. Opponents do not see the card identity until it triggers.

### Peek at Own Hidden Card
- **Owner can peek:** Click your own face-down hidden card to see its name, type, and effect in a modal (Close only, no Play).
- **Opponents:** Cannot peek at others' hidden cards — they stay face-down.

### Trap-Style Activation (Yu-Gi-Oh inspired)
When a hidden card activates (e.g. Spike Trap when targeted by a Utility):
1. **Full-screen overlay** appears: "⚠ TRAP REVEALED!"
2. **Card flips** from face-down to face-up with animation
3. **Effect text** shown so everyone sees what happened
4. **Result summary** (e.g. "AI-1's trap cancelled the effect! You discard 1 card.")
5. **Dismiss** on click or Continue button

---

## UI Placement

- **Opponent seats:** Below name/HP, show a row of effect badges + face-down hidden card slot
- **Human player area:** Same — effect badges + face-down hidden card slot next to/in hand area
- **Badges:** Small pill-style tags with icon + short label (tooltip for full effect)

---

## Implementation (Done)

1. **PlayerTableCards** component: renders protective badges + hidden card slot
2. **Protective badges:** Kevlar (🛡 Ranged), Chain Mail (🛡 Melee), Heavy Chestplate (🛡 −2 dmg), Mecha Suit (🤖 Immune), Final Spree (⚔)
3. **Hidden card slot:** Face-down card-back style when `player.hiddenCard` exists
4. **Peek:** `hidden-card-peekable` class when `humanPlayerId === player.id`; click opens CardPreviewModal with `peekOnly=true` (no Play button). Must pass `peekOnly` explicitly—do NOT infer from `card.type === 'hidden'` or hand preview would hide Play for hidden cards.
5. **Trap reveal:** `TrapRevealOverlay` when `lastCombatEvent.type === 'spike_trap'` and `revealedCard`; cardResolver passes `revealedCard` in spikeTrapCancel
6. **Hidden card play fix:** `previewIsPeek` state distinguishes hand-preview (Play shown) vs table-peek (Close only). Hand click: `setPreviewIsPeek(false)`. Hidden slot click: `setPreviewIsPeek(true)`.
4. Added to OpponentSeat (compact) and human player area (full size)
5. OpponentSeat now receives full `Player` type and `state` for Final Spree check
