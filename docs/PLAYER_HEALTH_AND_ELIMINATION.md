# Player Health & Elimination Mechanics

**Last updated:** February 21, 2026

---

## Overview

Players have `hp` (current) and `maxHp` (typically 20). When `hp` reaches 0 or below, the player is **eliminated** (`isEliminated: true`).

---

## Damage Paths

| Source | Path | Elimination? |
|--------|------|--------------|
| **Weapon cards** | Controller: `applyDamageAndCheckElimination` | ✓ Yes |
| **Status effects** (Molotov, Dynamite, Poison) | Controller: `applyStatusEffectDamage` → `applyDamageAndCheckElimination` | ✓ Yes |
| **Special cards** (War Elephant, Dog Squad) | Resolver: `gameEngine.applyDamage` | ✓ Yes (fixed) |

---

## Status Effects & DoT Stacking

**Verified: DoTs stack.** Multiple applications of the same or different DoT effects on a player each add a separate entry to `statusEffects`. At the start of that player's turn, `applyStatusEffectDamage` iterates over **all** effects and applies damage for each.

| Source | Implementation |
|--------|----------------|
| `addStatusEffect` (cardResolver) | Appends: `statusEffects: [...p.statusEffects, newEffect]` |
| `applyStatusEffectDamage` | Loops over all effects, applies damage for each |
| `tickStatusEffects` | Decrements `turnsRemaining`, removes when ≤ 0 |

**Example:** Target has 2× Molotov (1 dmg/turn each) + 1× Chainsaw (3 dmg/turn) → takes 5 damage at start of their turn.

---

## Hidden Cards vs DoT (Status Effect Damage)

DoT damage is applied via `applyStatusEffectDamage` → `applyDamageAndCheckElimination` **without** an `attackingCard` (only `sourcePlayerId`). The distinction:

| Hidden Card        | Triggers on DoT? | Notes                                                |
|--------------------|------------------|------------------------------------------------------|
| **Magic Mirror**   | ✓ Yes            | "When you would take damage" — redirects to source  |
| **Protective Bubble** | ✗ No         | "That single attack" — only weapon/utility damage   |
| **Land Mine**      | ✗ No             | "When attacked by a Weapon" — weapon only           |
| **Claymore**       | ✗ No             | "When you are attacked" — weapon only                |
| **Counterstrike**  | ✗ No             | "When you survive an attack" — weapon only           |
| **Spike Trap**      | N/A              | Triggers on Utility targeting, not damage            |

---

## Bug Fixed: gameEngine.applyDamage

**Problem:** `applyDamage` in `gameEngine.ts` reduced HP but did **not** call `eliminatePlayer` when `newHp <= 0`. Players could stay at 0 HP without being marked eliminated.

**Impact:** War Elephant and Dog Squad (which use `applyDamage` directly) could reduce targets to 0 HP without eliminating them.

**Fix:** `applyDamage` now accepts optional `eliminatorId` and calls `eliminatePlayer` when `newHp <= 0`.

---

## Elimination Flow

1. Damage is applied (HP reduced)
2. If `newHp <= 0`:
   - `isEliminated = true`
   - `hand = []`, `hiddenCard = null`
   - Hand discarded to discard pile
   - If `eliminatorId` provided: that player gets `hasEliminatedPlayer = true`
   - If momentum bonus: eliminator heals +2 and draws 2

3. Winner check (in `handleEndTurn`): if `activeCount <= 1`, game ends.

---

## Key Functions

| Function | Location | Role |
|----------|----------|------|
| `applyDamageAndCheckElimination` | gameController.ts | Weapon + status damage; applies damage and elimination |
| `applyDamage` | gameEngine.ts | Used by resolver for special cards; now eliminates on 0 HP |
| `eliminatePlayer` | gameEngine.ts | Marks player eliminated, discards hand |
| `advanceToNextPlayer` | gameEngine.ts | Skips eliminated players |

---

## UI

- Eliminated players: `OpponentSeat` shows "OUT", collapsed UI
- `validMoves` excludes eliminated players from targets
- `advanceToNextPlayer` skips eliminated players
