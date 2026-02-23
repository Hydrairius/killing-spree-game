# Killing Spree — Architecture

**Date:** February 21, 2026

---

## Overview

Killing Spree is a React + TypeScript card game with a headless game engine. The UI is a thin layer over the controller; all game logic lives in `/src/game`.

---

## Project Structure

```
src/
├── App.tsx              # Root: Lobby or GameBoard, singleton GameController
├── game/
│   ├── gameController.ts  # Action processing, turn flow, validation
│   ├── gameEngine.ts      # Pure functions: createGame, advanceToNextPlayer, drawCards, applyDamage
│   ├── cardResolver.ts    # Card effect resolution (weapon, utility, special)
│   ├── types.ts           # GameState, Player, Card types, StatusEffect
│   └── rng.ts             # Seeded RNG for deterministic shuffle
├── ai/
│   ├── aiPlayer.ts        # chooseAIMove (easy/medium/hard)
│   └── validMoves.ts      # getValidMoves for a player
├── ui/
│   ├── Lobby.tsx          # Setup: player count, AI difficulty, Momentum
│   ├── GameBoard.tsx      # Main game UI, AI scheduling, targeting
│   ├── DevLogPanel.tsx    # Debug log (actions, state transitions)
│   └── ...
├── data/
│   ├── deck.json          # Card quantities
│   ├── deckBuilder.ts     # Build deck from config
│   ├── cardDescriptions.ts
│   └── cardImages.ts
```

---

## Data Flow

1. **User or AI** dispatches an action via `onAction(action)`.
2. **App** calls `controller.processAction(action)` and `setGameState(newState)`.
3. **GameBoard** receives `state` and `onAction` as props; schedules AI turns via `useEffect`.
4. **GameController** is a singleton; holds `this.state` and mutates/returns new state on each action.

---

## Key Modules

### GameController
- `processAction(action)` → `GameState | null`
- Routes to `handleDraw`, `handlePlayCard`, `handlePlayHidden`, `handleEndTurn`
- Enforces 1 weapon/utility/special per turn; validates before resolve
- On reject (wrong phase, already played): returns `{ ...this.state }` so React re-renders

### GameEngine
- `createGame`, `drawCards`, `advanceToNextPlayer`, `applyDamage`, `applyDamageAndCheckElimination`
- `advanceToNextPlayer`: skips eliminated and `skipNextTurn` players
- No UI imports; pure game logic

### CardResolver
- `resolveCardEffect(ctx)` → `ResolveResult` (newState, damageToDeal, spikeTrapCancel, etc.)
- Weapon, utility, special, hidden resolution
- Spike Trap cancel checked at start of targeted utility resolution

### ValidMoves
- `getValidMoves(state, playerId)` → `ValidMove[]`
- Filters by phase, turn counters (weaponsPlayedThisTurn, etc.), Draw Instead rules
- Defensive filter: removes `play_weapon` when `weaponsPlayedThisTurn > 0` (AI loop safeguard)

### AI (aiPlayer)
- `chooseAIMove(state, playerId, difficulty)` → `ValidMove | null`
- Easy: random; Medium: HP heuristics, weapon preference; Hard: kill priority, Final Spree
- processAITurn guard: if move is `play_weapon` but `weaponsPlayedThisTurn > 0`, override to `end_turn`

---

## State Shape

- **GameState**: players, drawPile, discardPile, currentPlayerIndex, roundNumber, phase, lastPlayedCard, lastCombatEvent, ...
- **Player**: id, name, type, hp, hand, hiddenCard, weaponsPlayedThisTurn, statusEffects, mechaSuitTurns, ...
- **StatusEffect**: type (molotov/dynamite/poisonous_apple), targetPlayerId, turnsRemaining, damagePerTurn/totalDamage

---

## References

- [TURN_FLOW.md](TURN_FLOW.md) — Turn lifecycle, tick order
- [CARD_BUGS.md](CARD_BUGS.md) — Bug fixes and edge cases
- [PROTECTIVE_HIDDEN_INDICATORS.md](PROTECTIVE_HIDDEN_INDICATORS.md) — UI badges and effects
