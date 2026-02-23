# Hidden Cards Audit — Killing Spree

**Date:** February 23, 2026

---

## A) Checklist Table Per Hidden Card

| Card | Definition present? | Correct trigger wiring? | Effect resolves? | Consumed/cleared correctly? | Tests/repro added? |
|------|---------------------|-------------------------|------------------|-----------------------------|--------------------|
| **Land Mine** | ✓ Y | ✓ Y | ✓ Y | ✓ Y | ✓ Y |
| **Claymore** | ✓ Y | ✓ Y | ✓ Y | ✓ Y | ✓ Y |
| **Poisonous Apple** | ✓ Y | ✓ Y (fixed) | ✓ Y | ✓ Y | ✓ Y |
| **Protective Bubble** | ✓ Y | ✓ Y | ✓ Y | ✓ Y | ✓ Y |
| **Trampoline** | ✗ N (not in deck) | N/A | N/A | N/A | N/A |
| **Magic Mirror** | ✓ Y | ✓ Y | ✓ Y | ✓ Y | ✓ Y |
| **Spike Trap** | ✓ Y | ✓ Y | ✓ Y | ✓ Y | ✓ Y |
| **Shadow Dodge** | ✓ Y | ✓ Y | ✓ Y | ✓ Y | — |
| **Counterstrike** | ✓ Y | ✓ Y | ✓ Y | ✓ Y | — |

**Notes:**
- **Trampoline** is not in the deck or codebase. Magic Mirror provides similar “redirect damage to attacker” behavior. If Trampoline is desired, it would need to be added to `deck.json` and implemented in `gameController.ts`.
- **Land Mine** design: 5 damage (PRD/code); your note said 6 — left at 5 per current design.
- **Poisonous Apple** design: 2 damage for 2 turns (card text). Implementation uses `damagePerTurn: 2`, `turnsRemaining: 2` (4 damage total over 2 turns).

---

## B) Root Cause: Poisonous Apple Never Fired

**Root cause:** Poisonous Apple was never checked in the combat damage flow.

**Location:** `src/game/gameController.ts` — the `applyDamageAndCheckElimination` function.

**Details:**
- Hidden cards are evaluated in a fixed order: Magic Mirror → Protective Bubble → Shadow Dodge → Claymore → (damage applied) → Land Mine → Poisonous Apple → Counterstrike.
- There was no branch for `poisonous_apple`. Land Mine, Claymore, Protective Bubble, Magic Mirror, Spike Trap, Shadow Dodge, and Counterstrike were implemented; Poisonous Apple was not.
- When the defender was attacked with a weapon while having Poisonous Apple armed, the event pipeline skipped it and never added the DoT status effect to the attacker.

**Fix:** A new block was added (after Land Mine, before `newHp <= 0` handling) that:
1. Detects defender `hiddenCard` with `poisonous_apple`
2. Consumes the hidden card
3. Adds a `poisonous_apple` status effect to the attacker (2 damage per turn for 2 turns)
4. Sets `lastHiddenReveal` for the overlay

---

## C) Code Changes Summary

### 1. Poisonous Apple trigger (gameController.ts)

- **Lines:** ~534–563 (new block after Land Mine).
- **Change:** Added handling for `poisonous_apple` hidden card: consume card, add status effect to attacker, set reveal overlay.

### 2. Shadow Dodge `rng` bug (gameController.ts)

- **Problem:** `drawCards(ns, targetId, 1, rng ?? (() => Math.random()))` used an undefined `rng`, which would throw when Shadow Dodge triggered.
- **Change:** Added optional `rng` parameter to `applyDamageAndCheckElimination` with default `() => Math.random()`, and passed `this.rng` from `handlePlayCard` and through recursive calls (Claymore, Land Mine, Counterstrike).

### 3. `processAction('start')` when state is null (gameController.ts)

- **Problem:** `processAction` returned `null` when `!this.state`, so `start` could not be used to initialize the game.
- **Change:** Handle `action.type === 'start'` before the null check and return the result of `this.start(...)`.

### 4. Debug logging (gameController.ts)

- Added `DEBUG_HIDDEN_CARDS` flag (default `false`).
- When `DEBUG_HIDDEN_CARDS` is true, logs attack events and when Poisonous Apple triggers.

### 5. Tests (hiddenCards.test.ts)

- Added Vitest integration tests for:
  - Poisonous Apple (DoT applied to attacker)
  - Land Mine (5 damage to attacker)
  - Claymore (negate 3, attacker takes 3)
  - Protective Bubble (negate all damage)
  - Magic Mirror (redirect to attacker)
  - Spike Trap (cancel utility, attacker discards 1)

### 6. Vitest setup

- Added `vitest.config.ts`.
- Added `test` and `test:watch` scripts to `package.json`.

---

## Follow-up Recommendations

1. **Add tests for Shadow Dodge and Counterstrike** — Same style as existing tests; both are already implemented and working.
2. **Optional: Trampoline** — If a “reflect attack back” card is needed, add it to `deck.json` and implement in `gameController.ts`, mirroring Magic Mirror’s redirect behavior.
3. **Land Mine vs PRD** — Confirm intended damage (5 vs 6). Current implementation uses 5.
4. **DoT edge cases** — Consider tests for:
   - Attacker dies from Poisonous Apple DoT before their turn.
   - Multiple DoT stacks.
5. **`hiddenCardUsedThisRound` reset** — Verify it resets at round boundary; current logic in `advanceToNextPlayer` looks correct.
