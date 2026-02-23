# AI Behavior — How Bots Play and Target

**Last updated:** February 21, 2026

---

## Overview

The AI uses **valid moves** as its decision space. It never picks invalid actions. Targeting is encoded in each move: a move like `{ type: 'play_weapon', card, targetId: 'p2' }` already includes the chosen target. The AI selects among these pre-built moves; it does not choose a card and then a target separately.

---

## Valid Move Generation (`validMoves.ts`)

### Who Can Be Targeted

All targeting uses the same base filter:

```ts
state.players.filter((p) => !p.isEliminated && p.id !== playerId)
```

- Excludes eliminated players  
- Excludes self  

No other targeting rules (e.g. lowest HP) are applied at move generation. Every non-eliminated opponent is a valid target for weapons, utilities, and specials.

### Weapon Targets

| Card | Targets | Special Rules |
|------|---------|---------------|
| Most weapons | All living opponents | One move per (card, target) |
| Assault Rifle, Throwing Knives | All living opponents | Single-target moves + all (targetA, targetB) pairs for split |
| Rocket Launcher | No explicit target | Hits everyone (handled in resolver) |

For Assault Rifle / Throwing Knives with 2 targets:
- 1-target: `targetId` only
- 2-target: `targetId` + `targetId2` for every ordered pair of opponents

### Utility Targets

Utilities that need a target (Bear Trap, Grenade, Molotov, Dynamite, Poison Dart, Petty Thief) get one move per opponent.

### Special Targets

- War Elephant, Dog Squad, Devil's Blessing, Execution Order: one move per opponent  
- Devil's Blessing: targets only if `player.hp <= 5`  
- Final Spree: no target, only playable if `hasEliminatedPlayer`

---

## AI Playstyles (`aiPlayer.ts`)

Each bot gets a **playstyle** assigned at game creation from the **game seed**. The seed is used to shuffle playstyle indices, so each AI receives a (typically unique) playstyle. Different seeds → different bot lineups.

### Playstyle Assignment

| Step | What Happens |
|------|--------------|
| 1. Game start | `createGame` shuffles playstyle indices with the game RNG |
| 2. AI players | Each AI (index 1, 2, 3…) gets `AI_PLAYSTYLES[shuffled[i-1]]` |
| 3. Human | Player index 0 has no playstyle |
| 4. Same seed | Same seed → same playstyle assignment per game |

### The Six Playstyles

| Playstyle | Strategy |
|-----------|----------|
| **Aggressor** | Focus fire, kills first, weapons first. Heal only when HP ≤ 5. Targets lowest HP. |
| **Defensive** | Heal earlier (HP ≤ 10). Target highest-HP threat. Avoid targets with hidden cards (trap risk). |
| **Opportunist** | Guaranteed weapon kills first. Final Spree when can eliminate. Devil's Blessing when low + target has high HP. Bear Trap on highest-HP opponent. |
| **Hunter** | 70% chance to target the human player when possible; otherwise Aggressor logic. |
| **Chaos** | Random pick from all valid moves. |
| **Calculated** | Prefer kills and spread damage (multi-target). Avoid targets with hidden cards. |

### Fallback (No Playstyle)

When a player has no `aiPlaystyle` (e.g. old saves), the lobby **AI Difficulty** maps to a default:
- Easy → `chaos`
- Medium → `aggressor`
- Hard → `opportunist`

---

## Targeting Summary

| Step | What Happens |
|------|--------------|
| 1. Move generation | `getValidMoves` builds one move per (card, target) or (card, target1, target2) |
| 2. Target list | All non-eliminated opponents |
| 3. AI choice | Playstyle selects: kills, lowest HP, human, avoid traps, etc. |
| 4. Tie-break | Among equally preferred moves, `pick(moves, rng)` chooses randomly |

The AI never chooses a target after choosing a card. It always picks a complete move from the pre-generated valid move list.

---

## Files

| File | Role |
|------|------|
| `src/ai/validMoves.ts` | `getValidMoves`, `getWeaponTargets`, `getUtilityTargets`, `getSpecialTargets` |
| `src/ai/aiPlayer.ts` | `chooseAIMove`, `chooseMoveByPlaystyle`, playstyle handlers (`chooseAggressor`, etc.) |
| `src/ui/GameBoard.tsx` | Calls `chooseAIMove`, dispatches selected move |

---

## Seeded RNG

AI uses the game’s seeded RNG (`controller.getRng()`). Same seed → same AI choices. See [SEED_AND_AI_RNG.md](SEED_AND_AI_RNG.md).
