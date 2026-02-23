# Killing Spree — Color System Spec

**Version:** 1.0  
**Date:** February 21, 2026

---

## 1. Design Vibe

- **Background:** Dark navy / indigo arena
- **Accents:** Vibrant but not neon overload
- **Feel:** Arena-tech meets fantasy — stylized competitive party-strategy
- **Constraints:** No pure black (#000) or pure white (#FFF) on main surfaces

---

## 2. Full Color Palette

### 2.1 Backgrounds

| Role | Token | HEX | Notes |
|------|-------|-----|-------|
| Base | `--bg-base` | `#0f1420` | Deep navy arena floor |
| Base gradient end | — | `#151c2e` | Slight lift for gradients |
| Elevated panel | `--bg-elevated` | `#1a2135` | Cards, opponent seats |
| Modal | `--bg-modal` | `#1e2540` | Dialogs, overlays |
| Overlay | `--bg-overlay` | `#0a0e16` | Semi-transparent scrim |
| Vignette | `--bg-vignette` | `rgba(0,0,0,0.4)` | Edge darkening |

### 2.2 Text

| Role | Token | HEX | Notes |
|------|-------|-----|-------|
| Primary | `--text-primary` | `#f0eeec` | Headings, card names |
| Secondary | `--text-secondary` | `#b8b4b0` | Body, labels |
| Muted | `--text-muted` | `#7a7680` | Placeholders, hints |
| Inverted | `--text-inverted` | `#0f1420` | On bright accents |

### 2.3 Borders & Strokes

| Role | Token | HEX | Notes |
|------|-------|-----|-------|
| Default | `--border-default` | `#3d4a5c` | Standard outlines |
| Subtle | `--border-subtle` | `#2a3444` | Low-emphasis dividers |
| Focus | `--border-focus` | `#6b8ab8` | Focus rings, active states |

### 2.4 Card Type Accents

| Role | Token | HEX | Notes |
|------|-------|-----|-------|
| Attack | `--accent-attack` | `#e85c5c` | Weapons, damage |
| Trap | `--accent-trap` | `#e8a84c` | Hidden cards, reveals |
| Defense | `--accent-defense` | `#4ab8c4` | Protection, blocks |
| Special | `--accent-special` | `#b878e8` | Unique effects |
| Neutral/Info | `--accent-neutral` | `#6b8ab8` | Info, targeting |

### 2.5 Status

| Role | Token | HEX | Notes |
|------|-------|-----|-------|
| Success | `--status-success` | `#5cb86c` | Heal, positive outcome |
| Warning | `--status-warning` | `#e8a84c` | Caution, low HP |
| Danger | `--status-danger` | `#e85c5c` | Damage, eliminate |
| Disabled | `--status-disabled` | `#4a5264` | Grayed out |

### 2.6 Rarity (Optional)

| Role | Token | HEX |
|------|-------|-----|
| Common | `--rarity-common` | `#7a7680` |
| Rare | `--rarity-rare` | `#6b8ab8` |
| Epic | `--rarity-epic` | `#b878e8` |
| Legendary | `--rarity-legendary` | `#e8a84c` |

---

## 3. UI Hierarchy Rules

### 3.1 Buttons

| Type | Background | Border | Text | Hover bg |
|------|------------|--------|------|----------|
| Primary | `--accent-attack` | same | `--text-inverted` | `#f06c6c` |
| Secondary | `--bg-elevated` | `--border-default` | `--text-primary` | `--bg-modal` |
| Destructive | `--status-danger` | same | `--text-inverted` | `#f06c6c` |

### 3.2 Cards

| State | Background | Border | Notes |
|-------|------------|--------|-------|
| Card back (hidden) | `#1a1f35` + gradient | `--border-default` | Mysterious, ready to flip |
| Card front (revealed) | `--bg-elevated` | Accent by type | Weapon=Attack, Utility=Defense, etc. |
| Hover | + glow ring | `--accent-trap` | Subtle amber highlight |
| Selected | `--bg-modal` | `--accent-attack` | Red ring, slight glow |
| Disabled | `--bg-base` | `--status-disabled` | Muted, no interaction |

### 3.3 Player & Targeting

| Element | Color | Notes |
|---------|-------|------|
| Player ring (default) | `--border-default` | Neutral outline |
| Player ring (active turn) | `--accent-attack` | Red glow, pulse |
| Player ring (targeted) | `--accent-defense` | Teal highlight |
| Target indicator | `--accent-neutral` | Blue-ish, "click me" cue |
| Low HP (<10) | `--status-warning` | Amber pulse on health bar |

---

## 4. Glow / Effects Recipe

| Effect | Color | Opacity | Blur | Notes |
|--------|-------|---------|------|-------|
| **Damage flash overlay** | `#e85c5c` (attack) | 0.4–0.6 | 20–40px | Brief red wash, 0.5–0.8s |
| **Trap reveal pulse** | `#e8a84c` (trap) | 0.5 | 30px | Amber pulse, 0.6s |
| **Hidden card flip shine** | `#f0eeec` (off-white) | 0.3 | 8px | Sweep across card, 0.3s |
| **Target lock highlight** | `#4ab8c4` (defense) | 0.4 | 25px | Teal ring, steady |
| **Low-health warning** | `#e8a84c` (warning) | 0.5 | 15px | Slow pulse, 2s loop |

### CSS Recipe Examples

```css
/* Damage flash overlay */
.damage-flash {
  box-shadow: 0 0 30px rgba(232, 92, 92, 0.5);
  animation: damage-flash 0.6s ease-out;
}

/* Trap reveal pulse */
.trap-pulse {
  box-shadow: 0 0 30px rgba(232, 168, 76, 0.5);
  animation: trap-pulse 0.6s ease-out;
}

/* Card flip shine */
@keyframes card-shine {
  0% { filter: brightness(1); }
  50% { filter: brightness(1.4) drop-shadow(0 0 8px rgba(240,238,236,0.3)); }
  100% { filter: brightness(1); }
}

/* Target lock */
.target-lock {
  box-shadow: 0 0 25px rgba(74, 184, 196, 0.4);
}

/* Low-health pulse */
.low-health {
  animation: low-health-pulse 2s ease-in-out infinite;
}
@keyframes low-health-pulse {
  0%, 100% { box-shadow: 0 0 15px rgba(232, 168, 76, 0.3); }
  50% { box-shadow: 0 0 25px rgba(232, 168, 76, 0.6); }
}
```

---

## 5. Accessible Contrast

### 5.1 Minimum Contrast

- **Primary text** on `--bg-base`: ≥ 7:1 (WCAG AAA)
- **Secondary text** on `--bg-elevated`: ≥ 4.5:1 (WCAG AA)
- **Muted text** on dark: ≥ 3:1 (large text only)

### 5.2 Do / Don't Rules

| ✅ Do | ❌ Don't |
|-------|----------|
| Use `--text-primary` on `--bg-base`, `--bg-elevated`, `--bg-modal` | Put `--text-muted` on `--bg-base` for critical info |
| Use `--text-inverted` on accent buttons | Put light gray text on light accent backgrounds |
| Add border or glow for focus states | Rely on color alone for focus |
| Test health bar fill on dark bar track | Use similar red/orange for fill and track |

---

## 6. Avatar Frame States

| State | Border | Background tint | Notes |
|-------|--------|-----------------|-------|
| Default | `--border-default` | `--bg-elevated` | Neutral |
| Active turn | `--accent-attack` + glow | Slight red tint | Player's turn |
| Targeted | `--accent-defense` + glow | Slight teal tint | Being targeted |
| Eliminated | `--status-disabled` | Desaturated, 0.5 opacity | Grayed out |

---

## 7. Compact Token Table

| Category | Token | HEX |
|----------|-------|-----|
| **Bg** | base | `#0f1420` |
| | elevated | `#1a2135` |
| | modal | `#1e2540` |
| | overlay | `#0a0e16` |
| **Text** | primary | `#f0eeec` |
| | secondary | `#b8b4b0` |
| | muted | `#7a7680` |
| | inverted | `#0f1420` |
| **Border** | default | `#3d4a5c` |
| | subtle | `#2a3444` |
| | focus | `#6b8ab8` |
| **Accent** | attack | `#e85c5c` |
| | trap | `#e8a84c` |
| | defense | `#4ab8c4` |
| | special | `#b878e8` |
| | neutral | `#6b8ab8` |
| **Status** | success | `#5cb86c` |
| | warning | `#e8a84c` |
| | danger | `#e85c5c` |
| | disabled | `#4a5264` |

---

## 8. Copy-Paste Implementation

### 8.1 CSS Variables (`:root`)

Add to `index.css` or create `src/styles/theme.css` and import it:

```css
:root {
  /* Backgrounds */
  --ks-bg-base: #0f1420;
  --ks-bg-base-end: #151c2e;
  --ks-bg-elevated: #1a2135;
  --ks-bg-modal: #1e2540;
  --ks-bg-overlay: #0a0e16;
  --ks-bg-vignette: rgba(0, 0, 0, 0.4);

  /* Text */
  --ks-text-primary: #f0eeec;
  --ks-text-secondary: #b8b4b0;
  --ks-text-muted: #7a7680;
  --ks-text-inverted: #0f1420;

  /* Borders */
  --ks-border-default: #3d4a5c;
  --ks-border-subtle: #2a3444;
  --ks-border-focus: #6b8ab8;

  /* Accents */
  --ks-accent-attack: #e85c5c;
  --ks-accent-trap: #e8a84c;
  --ks-accent-defense: #4ab8c4;
  --ks-accent-special: #b878e8;
  --ks-accent-neutral: #6b8ab8;

  /* Status */
  --ks-status-success: #5cb86c;
  --ks-status-warning: #e8a84c;
  --ks-status-danger: #e85c5c;
  --ks-status-disabled: #4a5264;

  /* Semantic aliases */
  --bg-base: var(--ks-bg-base);
  --bg-elevated: var(--ks-bg-elevated);
  --bg-modal: var(--ks-bg-modal);
  --text-primary: var(--ks-text-primary);
  --text-secondary: var(--ks-text-secondary);
  --accent-attack: var(--ks-accent-attack);
  --accent-trap: var(--ks-accent-trap);
  --accent-defense: var(--ks-accent-defense);
  --accent-special: var(--ks-accent-special);
  --accent-neutral: var(--ks-accent-neutral);
}
```

### 8.2 JSON Theme Object

```json
{
  "backgrounds": { "base": "#0f1420", "elevated": "#1a2135", "modal": "#1e2540" },
  "text": { "primary": "#f0eeec", "secondary": "#b8b4b0", "muted": "#7a7680" },
  "borders": { "default": "#3d4a5c", "subtle": "#2a3444", "focus": "#6b8ab8" },
  "accents": { "attack": "#e85c5c", "trap": "#e8a84c", "defense": "#4ab8c4", "special": "#b878e8", "neutral": "#6b8ab8" },
  "status": { "success": "#5cb86c", "warning": "#e8a84c", "danger": "#e85c5c", "disabled": "#4a5264" }
}
```

---

## 9. Implementation Files

| File | Purpose |
|------|---------|
| `src/styles/theme.css` | CSS variables (import in `index.css`) |
| `src/styles/theme.json` | JSON theme for JS/TS usage |
| `docs/COLOR_SYSTEM_EXAMPLE.html` | Standalone demo — open in browser |

---

## 10. Adoption Log (Applied Feb 2026)

The color system has been applied across the game. Summary of changes:

### Files Modified

| File | Changes |
|------|---------|
| `src/index.css` | Enabled `@import './styles/theme.css'` |
| `src/App.css` | Body background → `--ks-bg-base` gradient; text → `--ks-text-primary` |
| `src/ui/Lobby.css` | Panel, title, buttons, inputs → theme tokens; accent-attack for primary CTA |
| `src/ui/GameBoard.css` | Full theme adoption (see below) |

### GameBoard.css — Token Usage

| Element | Before | After |
|---------|--------|-------|
| Game board bg | Brown gradient `#1a1410` | Navy gradient `--ks-bg-base` |
| Table frame | Wood brown | Arena-tech `--ks-bg-elevated` / `--ks-bg-modal` |
| Table surface | Green felt | Indigo arena floor |
| Opponent seats | Brown `#4a4035` | `--ks-border-default`, `--ks-bg-elevated` |
| Current turn | `#f44` | `--ks-accent-attack` |
| Targetable | `#fa4` | `--ks-accent-trap` |
| Selected target | `#8af` | `--ks-accent-defense` |
| Damage flash | Red rgba | `--ks-accent-attack` (rgba) |
| Defensive glow | `#4af` | `--ks-accent-defense` |
| Trap reveal | `#c44` | `--ks-accent-attack` |
| Card backs | Brown gradient | `--ks-bg-elevated` / `--ks-bg-modal` |
| Card type borders | `#c44`, `#4a4`, etc. | `--ks-accent-attack`, `--ks-accent-defense`, etc. |
| Protection badges | Various blue/brown | `--ks-accent-defense`, `--ks-accent-neutral`, `--ks-accent-attack` |
| Avatars | Brown/green/gray | `--ks-accent-defense` (human), `--ks-accent-neutral` (AI) |
| Health bar | Red gradient | `--ks-accent-attack` gradient |
| Buttons | `#333`, `#c44` | `--ks-bg-elevated`, `--ks-accent-attack` |

### Design Shift

- **Old:** Brown wood frame, green felt table, warm red accents
- **New:** Dark navy/indigo arena background, arena-tech panels, vibrant Attack/Trap/Defense/Special accents

---

*Designed for Killing Spree — competitive PvP card game.*
