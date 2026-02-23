# Seed & AI RNG System

**Last updated:** February 2025

---

## Overview

Every game uses a **random seed** that drives both deck order and AI decision-making. Different seeds produce different games; the same seed reproduces the same game (deterministic replay).

---

## Seed Generator

**Location:** `src/game/rng.ts`

```ts
generateGameSeed(): number
```

- Uses `crypto.getRandomValues` when available (cryptographically strong)
- Falls back to `Date.now() ^ (Math.random() * 0xffffffff)` otherwise
- Called automatically when starting a game (Lobby → App → `controller.start`)

---

## What the Seed Affects

| System        | Uses seed? | Notes                                      |
|---------------|------------|--------------------------------------------|
| Deck shuffle  | ✓          | `createGame` uses seeded RNG                |
| Draws         | ✓          | Controller’s RNG                            |
| Card effects  | ✓          | Coin flips, petty thief steal, etc.         |
| AI decisions  | ✓          | `chooseAIMove` receives controller’s RNG    |

---

## Flow

1. **Lobby** → user clicks Start Game  
2. **App** → `generateGameSeed()` → `controller.start(…, seed, …)`  
3. **Controller** → `createSeededRandom(seed)` → shared RNG for the whole game  
4. **GameBoard** (AI turn) → `controller.getRng()` → `chooseAIMove(…, rng)`  
5. AI uses the same RNG stream as draws and card effects

---

## Determinism

- Same seed + same actions → same outcome
- Replays are possible if seed and action log are stored
- AI choices (targets, tie-breaks) are fully driven by the RNG

---

## Files

| File              | Role                             |
|-------------------|----------------------------------|
| `src/game/rng.ts` | `generateGameSeed`, `createSeededRandom` |
| `src/game/gameController.ts` | `getRng()`, owns RNG instance    |
| `src/ai/aiPlayer.ts` | `chooseAIMove(…, rng)`           |
| `src/App.tsx`     | Calls `generateGameSeed()` on start |
