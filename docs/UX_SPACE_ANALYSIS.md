# UX Space Analysis — Game Board Layout

**Purpose:** Ensure no single player (human or AI) dominates the game space. Balanced, readable layout for 2–4 players.

---

## 1. Layout Zones

| Zone | Role | Current Size | Priority |
|------|------|--------------|----------|
| **Opponents** (top/sides) | AI seats | ~140px min each, flex: 1 | Secondary — compact |
| **Center** | Piles, last played, combat events | Piles 70×95px each | Primary — focal point |
| **Human player** (bottom) | Avatar, health, hand, actions | max 700px, hand ~90×120 cards | Primary — main interaction |

---

## 2. Space Principles

1. **Opponents are reference, not focus** — Compact enough to read HP, name, and target; no need for large avatars or long bars.
2. **Center is shared context** — Piles and combat events should remain visible without scrolling.
3. **Human player gets primary real estate** — Hand is largest (most interaction), but capped so table isn't dominated.
4. **Scale with player count** — 4-player: opponents share row; 2-player: single opponent; each seat stays within max.

---

## 3. Constraints (Implemented)

### Opponent seats
- **max-width:** 180px
- **min-width:** 120px
- **Avatar:** 40px
- **Health bar:** 50–90px fill width, 8px height
- **Padding:** 0.75rem 1rem

### Human player
- **max-width:** 680px (table-player)
- **Avatar:** 48px
- **Health bar:** 120px, 10px height
- **Hand cards:** 82×110px (fits 7 cards + gaps)

### Center
- **Piles:** 60×82px
- **Gap:** 1rem

### Table opponents row
- **max-width:** 560px (keeps opponents from spanning full width on large screens)
- **flex:** opponents share evenly with `flex: 1 1 0` and `max-width`

---

## 4. Player-Count Scaling

| Players | Opponents layout | Per-seat width |
|---------|------------------|----------------|
| 2 | 1 center-top | max 180px |
| 3 | Left + right | max 180px each |
| 4 | Left + top + right | max 180px each |

---

## 5. Responsive Notes

- **&lt; 600px viewport:** Hand cards may wrap to 2 rows; opponent seats remain readable.
- **Tall viewports:** Table frame fills; center stays centered; no vertical overflow from single zone.

---

*See `src/ui/GameBoard.css` for implementation. Updated: Feb 2026.*
