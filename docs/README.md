# Killing Spree — Documentation

**Last Updated:** February 23, 2026

---

## Quick Links

| Document | Purpose |
|----------|---------|
| [PRD_Killing_Spree.md](../PRD_Killing_Spree.md) | Product requirements, card catalog, win conditions |
| [TASKS.md](../TASKS.md) | Development task list (phases, status) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Code structure, modules, data flow |

---

## How This Documentation Is Organized

Docs are grouped by role: **game design** (how it works), **implementation** (architecture & AI), **bugs & fixes**, **UI/UX**, **development tools**, and **assets**.

---

## 1. Game Design — Rules & Mechanics

How the game works from a design perspective.

| Document | Description |
|----------|-------------|
| [HOW_TO_PLAY.md](HOW_TO_PLAY.md) | **Player-facing tutorial:** Quick Start, Turn Flow, glossary, card/effect reference, FAQ, tips. |
| [TURN_FLOW.md](TURN_FLOW.md) | Turn lifecycle: draw → play → end. Tick order for status effects, protective turns, skipNextTurn. |
| [PLAYER_HEALTH_AND_ELIMINATION.md](PLAYER_HEALTH_AND_ELIMINATION.md) | HP, damage paths, elimination at 0 HP. DoT stacking. Which hidden cards trigger on DoT vs weapon attacks. |

---

## 2. Architecture & AI — Technical Implementation

How the codebase is structured and how AI makes decisions.

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Project structure, data flow, key modules (GameController, GameEngine, CardResolver, ValidMoves, AI). |
| [AI_BEHAVIOR.md](AI_BEHAVIOR.md) | How bots play and target: valid moves, playstyles (Aggressor, Defensive, Hunter, etc.), targeting logic. |
| [SEED_AND_AI_RNG.md](SEED_AND_AI_RNG.md) | Random seed generator, deterministic replay, how deck shuffle and AI decisions use the same RNG. |

---

## 3. Bugs & Edge Cases — Fixes Applied

Analysis and fixes for card effects and game flow issues.

| Document | Description |
|----------|-------------|
| [CARD_BUGS.md](CARD_BUGS.md) | Full list: Spike Trap, Devil's Blessing, Bear Trap, Draw Instead, status effects, Mecha Suit tick, AI loops, etc. |
| [TRAP_OVERLAY_AND_AI_TARGETING.md](TRAP_OVERLAY_AND_AI_TARGETING.md) | Trap reveal overlay persistence; AI targeting bias fix (random among tied HP targets). |

---

## 4. UI & UX — Layout, Visuals, Design System

User interface, layout constraints, and design language.

| Document | Description |
|----------|-------------|
| [CARD_UI_FAN_AND_ANIMATIONS.md](CARD_UI_FAN_AND_ANIMATIONS.md) | Fan layout for hands, draw-in and discard pile animations. |
| [PROTECTIVE_HIDDEN_INDICATORS.md](PROTECTIVE_HIDDEN_INDICATORS.md) | Protection badges (Kevlar, Chain Mail, Mecha Suit), status effect badges, hidden cards, peek, trap reveal overlay. |
| [UX_SPACE_ANALYSIS.md](UX_SPACE_ANALYSIS.md) | Space balance, max-widths, layout principles. No zone dominance. |
| [COLOR_SYSTEM.md](COLOR_SYSTEM.md) | CSS variables, theme palette (navy/indigo arena style). Token reference. |
| [COLOR_SYSTEM_EXAMPLE.html](COLOR_SYSTEM_EXAMPLE.html) | Live color demo — open in browser |
| [UI_SYSTEM_ALIGNMENT.md](UI_SYSTEM_ALIGNMENT.md) | Design language: flat esports, single red accent, typography, animation timings. *Note: May override parts of COLOR_SYSTEM for strict flat palette.* |

---

## 5. Development — Tools & Changelog

Debug tools, deployment, and recent changes.

| Document | Description |
|----------|-------------|
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deploy to the web for free (Netlify, Vercel, Cloudflare Pages, GitHub Pages). |
| [DEVLOG.md](DEVLOG.md) | DevLog panel: trace actions, state transitions, AI scheduling, combat events. |
| [RECENT_CHANGES.md](RECENT_CHANGES.md) | Changelog: Protective Bubble, Devil's Blessing in draw phase, Assault Rifle split, etc. |
| [QA_BUG_REPORT_GUIDE.md](QA_BUG_REPORT_GUIDE.md) | How QA testers submit bug reports (F8, settings menu, form fields). |
| [CLOUDFLARE_BUGREPORTS_SETUP.md](CLOUDFLARE_BUGREPORTS_SETUP.md) | Cloudflare D1: store bug reports in a database. |
| [src/bugreport/README.md](../src/bugreport/README.md) | Bug Report system: setup, config, webhook, storage. |

---

## 6. Assets — Art & Conventions

Where to put images and how to name them.

| Document | Description |
|----------|-------------|
| [CARD_ART_LIST.md](CARD_ART_LIST.md) | Card art inventory: 44 images (Weapons, Utility, Special, Hidden). Filenames by card ID. |
| [public/assets/cards/README.md](../public/assets/cards/README.md) | Card image conventions, card back display. |
| [public/assets/avatars/README.md](../public/assets/avatars/README.md) | Avatar placeholder conventions. |

---

## Suggested Reading Order

**New to the project:**
1. [PRD_Killing_Spree.md](../PRD_Killing_Spree.md) — what we're building
2. [ARCHITECTURE.md](ARCHITECTURE.md) — how it's structured
3. [TURN_FLOW.md](TURN_FLOW.md) — turn lifecycle

**Implementing or debugging cards:**
- [CARD_BUGS.md](CARD_BUGS.md) — known issues and fixes
- [PLAYER_HEALTH_AND_ELIMINATION.md](PLAYER_HEALTH_AND_ELIMINATION.md) — damage and hidden cards vs DoT

**Working on AI:**
- [AI_BEHAVIOR.md](AI_BEHAVIOR.md) → [SEED_AND_AI_RNG.md](SEED_AND_AI_RNG.md)

**Working on UI:**
- [COLOR_SYSTEM.md](COLOR_SYSTEM.md) or [UI_SYSTEM_ALIGNMENT.md](UI_SYSTEM_ALIGNMENT.md) — design tokens
- [UX_SPACE_ANALYSIS.md](UX_SPACE_ANALYSIS.md) — layout constraints
- [CARD_UI_FAN_AND_ANIMATIONS.md](CARD_UI_FAN_AND_ANIMATIONS.md) — card layout and motion
