# Killing Spree — UI System Alignment

**Version:** 2.0  
**Date:** February 21, 2026  
**Visual anchor:** Card back design (flat red-on-black, symmetrical geometric emblem)

---

## 1. Design Language

### Style Philosophy

The game UI is:

- **Competitive** — Tactical, sharp, clean
- **Mechanical** — Minimal, esports broadcast-ready
- **Flat only** — No gradients (except subtle depth), no glow, no drop shadows

Explicitly avoided: gritty, fantasy-medieval, post-apocalyptic, cartoonish, soft, glossy, 3D.

---

## 2. Color System (Strict)

| Token | HEX | Role |
|-------|-----|------|
| `--ks-bg-base` | `#111111` | Matte black |
| `--ks-bg-elevated` | `#1A1A1A` | Elevated black |
| `--ks-bg-panel` | `#141414` | Panel black |
| `--ks-arena-bg` | `#0E0E14` | Arena navy-black |
| `--ks-accent` | `#A11212` | Core crimson |
| `--ks-accent-active` | `#FF2E2E` | Active highlight |
| `--ks-accent-depth` | `#7A0E0E` | Depth red |
| `--ks-neutral-border` | `#3A3A3A` | Border gray |
| `--ks-neutral-rim` | `#4A4A4A` | Inner rim highlight |
| `--ks-neutral-disabled` | `#2A2A2A` | Disabled state |

**Rules:** No additional accent colors. No blues, oranges, greens. Single red accent only.

---

## 3. Shape Language

- **Border radius:** 2–4px max (`--ks-radius-sm`, `--ks-radius-md`)
- **Circular elements:** Arena motif (avatars, table surface)
- **Angular:** Sharp triangular forms, crosshair geometry
- **Avoid:** Rounded bubbly corners, organic curves

---

## 4. Component Behavior

### Buttons

| State | Appearance |
|-------|------------|
| Default | Flat dark bg (`--ks-bg-elevated`), neutral border |
| Hover | Border `#FF2E2E`, scale 1.03, 100ms |
| Active | Solid red fill, red border |

No drop shadows. No glow.

### Card Interactions

- **Flip:** 200ms, sharp ease-out
- **Hover:** Border shifts to `--ks-accent-active`, scale 1.03
- **Selected:** 2px red border
- No particles, no glow

### Card back display

The card back image (`card_back.png`) includes its own border. The UI does not add a CSS border (avoids double border). Use `object-fit: contain` so the full image is visible; `object-fit: cover` would crop the image because display containers have a wider aspect ratio than the source (682×1024 ≈ 2:3).

### Damage Feedback

- Flat red angular edge flash
- 100–150ms duration
- No lightning or particle FX

---

## 5. Typography

- **Font stack:** Oswald (headers), Inter (body)
- **Headers:** All caps, condensed
- **Avoid:** Fantasy fonts, brush styles, serif

---

## 6. Animation Timings

| Type | Duration | Curve |
|------|----------|-------|
| Micro (hover, border) | 100ms | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` |
| Card flip | 200ms | Same |
| Major event | 250ms | Same |

No bounce easing.

---

## 7. Arena Background

- **Base:** `#0E0E14`
- **Motif:** Subtle circular grid / arena lines
- **Accents:** Faint red accents
- **Avoid:** Smoke, fire, grunge overlays

---

## 8. Restrictions (Do not introduce)

- Texture overlays
- Film grain
- Metallic chrome
- Bloom lighting
- Drop shadows
- Heavy gradients
- Neon cyberpunk colors
- UI glass effects

---

## 9. Files Updated

| File | Changes |
|------|---------|
| `src/styles/theme.css` | Full token overhaul to flat esports palette |
| `src/styles/theme.json` | Sync with theme.css |
| `src/index.css` | Typography (Oswald, Inter) |
| `index.html` | Google Fonts preconnect |
| `src/App.css` | Arena bg `#0E0E14` |
| `src/ui/Lobby.css` | Flat buttons, no glow, theme tokens |
| `src/ui/GameBoard.css` | Flat panels, no gradients/shadows, red-only accents |
| `src/ui/DevLogPanel.css` | Flat panel, red accents |

---

## 10. Spacing & Border System

- **Spacing:** Existing rem scale preserved
- **Borders:** 1px default, 2px for active/selected
- **Radius:** `var(--ks-radius-sm)` (2px), `var(--ks-radius-md)` (4px)

---

*Aligned to card back design. Do not redesign; extend.*
