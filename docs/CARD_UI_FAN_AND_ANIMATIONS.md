# Card UI — Fan Layout & Draw/Discard Animations

**Date:** February 2025  
**Status:** Implemented

---

## Overview

Cards should feel like players are holding them: a **fan layout** for hands (human and AI opponents), plus **animations** when drawing from the pile and discarding/playing cards.

---

## Current State (Pre–UI Engineer Updates)

- **Human hand**: Horizontal flexbox, wrap, 82×110px cards, gap 0.5rem
- **AI opponents**: Text only — "X cards" — no card visuals
- **Draw/discard piles**: Static; no motion
- **Theme**: Flat esports style (theme.css), red-on-black card back

---

## Target Behavior

### 1. Fan Layout — Human Player

- Cards arranged in an **arc** radiating from bottom center
- Each card rotated based on index: `rotation = (index - center) * anglePerCard`
- `transform-origin: bottom center` so cards pivot from the base
- Hover: card lifts (translateY) and increases scale, higher z-index
- Cards overlap slightly for a stacked-hand feel
- Max ~12° spread per side for 7 cards; scales with count

### 2. Fan Layout — AI Opponents

- Face-down **card backs** in a fan (no actual card faces)
- Layout depends on seat (top / left / right):
  - **Top**: fan spreads downward (cards point toward center)
  - **Left/right**: fan spreads inward
- Compact size (e.g. 36×50px) to fit in opponent seat
- Count badge optional (or replace "X cards" with fan only)

### 3. Draw Animation

- **Trigger**: Human draws (draw phase or "Draw Instead")
- **Motion**: Card appears to fly from draw pile → hand
- **Options**:
  - A: New card in hand gets `card-draw-in` class, animates from draw-pile position
  - B: Brief draw-pile "pop" + card fades/scales in at hand position
- **Duration**: 350–500ms, ease-out

### 4. Discard / Play Animation

- **Trigger**: Card played (weapon, utility, special) → goes to discard pile
- **Motion**:
  - Card in hand: shrink/fade out
  - Discard pile: top card updates with scale-in / fade-in
- **Optional**: Ghost card flies from hand position → discard pile (more work)

---

## Implementation Summary (Done)

- **HandFan** (`GameBoard.tsx`): Human hand in arc; `--fan-tx`, `--fan-rot` for per-card transform; hover lifts card.
- **OpponentHandFan**: Face-down card backs (32×44px), max 10 shown; `+N` badge if more.
- **Draw-in**: `prevHandIdsRef` detects new card; `card-draw-in` class animates scale + opacity 0.4s.
- **Discard**: Top card `key={topCardId}` forces remount; `pile-card-updated` animates scale 0.35s.

---

## Implementation Notes

### Fan Layout (CSS + JS)

- Use `position: absolute` per card; container `position: relative` with fixed height
- Compute `left`, `transform` (rotate + translate) per index
- Formula: `rotation = (i - (n-1)/2) * maxAngle / max(1, n-1)`
- Overlap: `translateX` offset so cards stack; negative margin or `left` calc

### Draw Animation

- Track previous hand (ref): `prevHandIdsRef`
- `useEffect` when `humanPlayer.hand` changes:
  - If `hand.length > prev.length`, find new card id
  - Add `card-draw-in` to that card; clear after animation ends
- CSS: `@keyframes card-draw-in` from draw-pile position (or top-center) to final position

### Discard Animation

- On play: card removed from hand immediately
- Simpler approach: animate discard pile top-card change (`pile-card-update`)
- If we want card-fly: render a "flying" card overlay positioned at last-known card rect, animate to discard pile rect, then remove

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/ui/GameBoard.tsx` | Fan layout logic, HandFan component, draw/discard animation triggers |
| `src/ui/GameBoard.css` | `.hand-fan`, `.card-fan-item`, opponent fan, `@keyframes` for draw/discard |
| [TASKS.md](../TASKS.md) | Task list for tracking |

---

## Dependencies

- No new npm packages; CSS-only animations
- Uses existing `--ks-ease-*` timing variables from theme.css
