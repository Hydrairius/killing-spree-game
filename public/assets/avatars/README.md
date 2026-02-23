# Player Avatars

Place player and AI portrait images in this folder. The game shows placeholders until images are added.

## Path
```
public/assets/avatars/
```
Files end up at `/assets/avatars/` when the app runs.

## Files to add

### Human player
- **player.png** — Your avatar (or use `human.png` if wired up)

### AI opponents
- **ai_1.png**, **ai_2.png**, **ai_3.png** — AI opponent portraits (or `ai.png` for shared default)

## Naming & usage
- Extension: **.png** (or .jpg, .webp)
- To enable: update `GameBoard.tsx` — replace the `.player-avatar` placeholder divs with:
  ```jsx
  <img src="/assets/avatars/player.png" alt="" className="player-avatar-img" />
  ```
- Optional: map player ID (e.g. `p0`, `p1`) or name to filename

## Fallback
Placeholders show emoji icons (🧑 for human, 🤖 for AI) until custom images are added.
