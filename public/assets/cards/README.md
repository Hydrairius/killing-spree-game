# Card Images

Place your card artwork in this folder. The game loads them automatically.

## Path
```
public/assets/cards/
```
↑ This folder. Files end up at `/assets/cards/` when the app runs.

## Files to add

### Card back (draw pile & face-down hidden cards)
- **card_back.png** ✓ (red emblem on black, tactical theme)

### Individual cards
Use card ID as filename: `{card_id}.png`  
Examples: `katana.png`, `medkit.png`, `spike_trap.png`, `devils_blessing.png`

Full list: `docs/CARD_ART_LIST.md` (43 card IDs)

## Naming
- Extension: **.png**
- Card IDs use underscores: `44_magnum`, `molotov`, `devils_blessing`, etc.

## Fallback
Missing images show a styled placeholder. The game is playable without any art.

---

## Card back display (implementation notes)

The card back image (`card_back.png`) includes its own border in the artwork. The UI renders it accordingly:

| Setting | Reason |
|---------|--------|
| **No CSS border** | The image has a built-in dark grey border; adding a CSS border would create a double border. |
| **`object-fit: contain`** | The image (682×1024) has a ~2:3 aspect ratio. Display containers (e.g. 45×60, 60×82) are wider. `contain` shows the full image without cropping; `cover` would crop the top/bottom. |

Applied to: draw pile card back (`.pile-card-back`), face-down hidden cards (`.hidden-card-back`).
