# Recent Changes

**Last updated:** February 21, 2026

---

## Summary (This Session)

| Change | Description | Files |
|--------|-------------|-------|
| **Protective Bubble** | Implemented missing hidden card; negates all damage from weapon/utility attacks (not DoT) | gameController.ts |
| **DoT vs Hidden Cards** | Counterstrike fixed to not trigger on DoT; documented which hidden cards trigger on DoT | gameController.ts, PLAYER_HEALTH_AND_ELIMINATION.md |
| **Devil's Blessing in Draw Phase** | Can play Devil's Blessing instead of drawing when at 5 HP or less at start of turn | validMoves.ts, gameController.ts, GameBoard.tsx |
| **Assault Rifle Split Damage** | Fixed split damage when selecting 2 targets (was 3+0, now 2+1) | cardResolver.ts |
| **Hidden Activation Logging** | DevLog tracks hidden card triggers (`⚠ TRAP: X's Card — result`) | GameBoard.tsx, DEVLOG.md |
| **Ref Cleanup** | `prevHiddenRevealRef` cleared when `lastHiddenReveal` resets | GameBoard.tsx |

---

## 1. Protective Bubble

**Problem:** Protective Bubble ("When you would take damage: Negate all damage from that single attack") never triggered.

**Fix:** Added to `applyDamageAndCheckElimination` in gameController.ts, after Magic Mirror. Only triggers on **attacks** (weapon/utility damage), not on DoT. Consumes the card and returns with blocked event + overlay.

---

## 2. Hidden Cards vs DoT

**Problem:** Counterstrike was incorrectly triggering when a player "survived" DoT damage.

**Fix:** Counterstrike now requires `isWeaponAttack`; it does not trigger on status effect damage.

**Documented:** PLAYER_HEALTH_AND_ELIMINATION.md — table of which hidden cards trigger on DoT:
- Magic Mirror: ✓ (redirects to source)
- Protective Bubble, Land Mine, Claymore, Counterstrike: ✗ (weapon attacks only)
- Spike Trap: N/A (triggers on Utility targeting)

---

## 3. Devil's Blessing at Start of Turn

**Problem:** Players couldn't play Devil's Blessing at the start of their turn (draw phase).

**Fix:** Devil's Blessing can be played **instead of drawing** when:
- In draw phase
- HP ≤ 5
- Valid target exists  
Playing it transitions to play phase; no card is drawn. Cancel button added for draw-phase targeting.

---

## 4. Assault Rifle Split Damage

**Problem:** When selecting 2 targets, first target took full 3 damage, second took 0.

**Fix:** In `resolveSplitDamage`, when both targetId and targetId2 are set, damage is split: `Math.ceil(totalDamage/2)` and `totalDamage - first`. Example: 3 → 2+1; 6 (Final Spree) → 3+3.

---

## 5. Hidden Activation DevLog

- DevLog logs `⚠ TRAP: X's CardName — result (Y affected)` when hidden cards trigger
- `prevHiddenRevealRef` cleared when `lastHiddenReveal` is undefined so each trigger logs correctly

---

## Related Docs

- [CARD_BUGS.md](CARD_BUGS.md) — Full bug list and fixes
- [DEVLOG.md](DEVLOG.md) — DevLog tags and hidden activation logging
- [PLAYER_HEALTH_AND_ELIMINATION.md](PLAYER_HEALTH_AND_ELIMINATION.md) — Hidden cards vs DoT table
