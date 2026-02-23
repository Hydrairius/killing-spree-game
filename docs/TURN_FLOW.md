# Turn Flow — Lifecycle & Tick Order

**Date:** February 21, 2026

---

## Turn Structure (PRD §5)

1. **Draw phase** — Draw 1 card (except first player, round 1)
2. **Play phase** — Play up to 1 weapon, 1 utility, 1 special **OR** Draw Instead (once, only if no cards played yet)
3. **End turn** — Advance to next player

---

## When a Player Ends Their Turn

`handleEndTurn` runs this sequence:

1. **advanceToNextPlayer(state)**
   - Compute next player index (wrap, skip eliminated)
   - Skip players with `skipNextTurn` (Bear Trap, Healing Wish); clear flag when skipping
   - Reset previous player's turn counters (weaponsPlayedThisTurn, utilitiesPlayedThisTurn, specialsPlayedThisTurn, drewInsteadThisTurn)
   - Set phase to `'draw'`, optionally increment roundNumber

2. **Loop until current player is alive:**
   - **applyStatusEffectDamage(state)** — For the **current** (new) player only: apply damage from their status effects
     - Molotov: `damagePerTurn` each turn
     - Dynamite: `totalDamage` when `turnsRemaining <= 1`
     - Poisonous Apple: `damagePerTurn` when `turnsRemaining <= 1`
     - Chainsaw: `damagePerTurn` each turn
   - **tickStatusEffects(state)** — Decrement **only the current player's** status effects; remove expired
   - **tickProtectiveTurns(state)** — Decrement `mechaSuitTurns` and `heavyChestplateTurns` for the **current** player
   - **Win check** — If ≤1 active player, set winnerId and return
   - **If current player eliminated** (e.g. by Chainsaw DoT at start of turn): advance to next living player and repeat loop
   - Otherwise break

This loop prevents the game from getting stuck when a player dies from DoT before they can act (e.g. AI-3 eliminated by Chainsaw at start of their turn).

---

## Order Summary

| Step | Purpose |
|------|---------|
| advanceToNextPlayer | Who's next; reset prev player counters |
| (loop) applyStatusEffectDamage | Deal DoT damage before ticking |
| tickStatusEffects | Decrement status effect turns; remove expired |
| tickProtectiveTurns | Decrement Mecha Suit, Heavy Chestplate |
| advanceToNextPlayer (if current eliminated) | Skip dead player; repeat loop |

---

## Key Rules

- **Status effects** are stored on the target player; only that player's effects are ticked when it's their turn
- **Protective turns** (Mecha Suit, Heavy Chestplate) tick at start of the player's turn, not on damage
- **skipNextTurn** is consumed when we skip that player's turn in `advanceToNextPlayer`
