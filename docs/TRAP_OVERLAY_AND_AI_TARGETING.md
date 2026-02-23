# Trap Overlay & AI Targeting Fixes

**Date:** February 21, 2026

---

## 1. Trap Reveal Overlay — Disappearing Too Fast

### Symptom
When a hidden card (e.g. Spike Trap) activates, the overlay appeared for only a split second and disappeared before the user could read it.

### Root cause
- `lastCombatEvent` is cleared at the start of every `processAction` (gameController)
- When it's the AI's turn and Spike Trap triggers, the AI's 800ms timeout fires and the AI takes another action
- That action clears `lastCombatEvent` → overlay condition fails → overlay disappears
- User had only ~800ms to read

### Fix
1. **`pendingTrapReveal` state** — Store the trap event in local React state when we see it
2. **Overlay driven by `pendingTrapReveal`** — Not by `lastCombatEvent`; persists until user dismisses
3. **Block AI while overlay visible** — AI useEffect skips starting the timeout when `pendingTrapReveal` is set; AI cannot act until user clicks Continue
4. **On dismiss** — Clear `pendingTrapReveal`; AI effect re-runs and AI can proceed

### Implementation
- `useEffect` captures `lastCombatEvent` when it's `spike_trap` with `revealedCard` → `setPendingTrapReveal(ev)`
- AI `useEffect` dependency includes `pendingTrapReveal`; when set, we `return` early (no AI timeout)
- Overlay shows when `pendingTrapReveal` is set; `onDismiss` clears it

---

## 2. AI Targeting — Bias Toward Human Player

### Symptom
AI seemed to attack the human player more often than other opponents.

### Root cause
- Weapon target selection used `reduce` to pick the lowest-HP target
- When multiple targets had the **same HP**, `reduce` kept the first one (never replaced)
- `getWeaponTargets` returns opponents in `state.players` order → human (index 0) is always first
- Result: On HP ties, human was always chosen

### Fix
- Collect all weapon moves with the minimum target HP
- Randomly select among tied targets: `tiedBest[Math.floor(Math.random() * tiedBest.length)]`
- Applied to Medium AI weapon selection
- Applied to Hard AI kill selection (when multiple enemies are in kill range, randomize which to finish)

### Implementation
- `chooseMediumMove`: Build `movesByTargetHp`, find `lowestHp`, filter `tiedBest`, random pick
- `chooseHardMove`: `killCandidates` when multiple kills available → random pick

---

## Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| Trap overlay flash | lastCombatEvent cleared by next action; AI acted after 800ms | pendingTrapReveal state; block AI until dismiss |
| AI targets human more | HP ties kept first target (human in player order) | Random among tied lowest-HP targets |
