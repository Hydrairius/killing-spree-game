# Killing Spree — Development Task List

**References:** [PRD_Killing_Spree.md](PRD_Killing_Spree.md)  
**Last Updated:** February 21, 2026  

---

## How to Use This Document

- **Status:** `[ ]` Not started | `[~]` In progress | `[x]` Complete
- **PRD Ref:** Links to PRD sections (e.g., §4 = Section 4, FR-1 = Functional Requirement 1)
- Tasks are ordered by dependency where possible; some can run in parallel.

---

## Phase 0: Project Setup

| # | Task | PRD Ref | Status |
|---|------|---------|--------|
| 0.1 | Initialize project (e.g., Vite + TypeScript, or plain HTML/JS) | §11 | [x] |
| 0.2 | Set up project structure: `/src/game`, `/src/ai`, `/src/ui`, `/src/data` | FR-11, FR-13 | [x] |
| 0.3 | Implement seeded RNG utility (for shuffle, coin flips, etc.) | FR-12, FR-14 | [x] |
| 0.4 | Create card data schema and load deck from config/JSON | §4.1, §6 | [x] |
| 0.5 | Export deck composition from Killing Spree.xlsx → JSON | §6 | [x] |

---

## Phase 1: Core Game Engine

| # | Task | PRD Ref | Status |
|---|------|---------|--------|
| 1.1 | Define `GameState` model (players, HP, hands, draw/discard piles) | §4, FR-12 | [x] |
| 1.2 | Implement deck shuffle and initial deal (7 cards each) | §4, FR-8 | [x] |
| 1.3 | Implement turn structure: draw → play → end (no draw for P1 R1) | §5, FR-2 | [x] |
| 1.4 | Implement turn order (clockwise, skip eliminated players) | §4, §7 | [x] |
| 1.5 | Implement HP tracking and damage application | §7 | [x] |
| 1.6 | Implement elimination (0 HP → discard hand, remove from turn order) | §7, FR-5 | [x] |
| 1.7 | Implement draw pile exhaustion (reshuffle discard → draw, or define rule) | §4 | [x] |
| 1.8 | Implement win detection (last player standing, Final Spree instant win) | §3, FR-4 | [x] |

---

## Phase 2: Card Implementation

| # | Task | PRD Ref | Status |
|---|------|---------|--------|
| 2.1 | Implement generic card play resolution (target selection, effect execution) | FR-3 | [x] |
| 2.2 | Implement all **Weapon** effects (14 cards) | §6.1 | [x] |
| 2.2a | — Melee: Katana, Combat Knife, Baseball Bat, Morning Star, Chainsaw | §6.1 | [x] |
| 2.2b | — Ranged: Glock, Revolver, 44 Magnum, Crossbow, Assault Rifle, Throwing Knives, Bow, Barrett M82, Rocket Launcher | §6.1 | [x] |
| 2.3 | Implement all **Utility** effects (13 cards) | §6.2 | [x] |
| 2.4 | Implement all **Special** effects (8 cards), including Final Spree | §6.3, FR-4 | [x] |
| 2.5 | Implement **Hidden** card system: play face-down, 1 active per player | §6.4, FR-7 | [x] |
| 2.6 | Implement Hidden card triggers and resolution (1 per round rule) | §6.4 | [~] |
| 2.6a | Spike Trap: trigger when targeted by Utility — cancel effect, attacker discards 1 | §6.4 | [x] |
| 2.7 | Implement combat chain: Weapon → Hidden response → damage resolution | §6.1, §6.4 | [~] |
| 2.8 | Implement Momentum Bonus (toggle on/off) | §8.1, FR-9 | [x] |

---

## Phase 3: AI Opponents

| # | Task | PRD Ref | Status |
|---|------|---------|--------|
| 3.1 | Implement AI controller interface (receive state, return action) | §10, AI-1 | [x] |
| 3.2 | Implement valid move generator (all legal plays) | AI-1 | [x] |
| 3.3 | Implement **Easy** AI: random valid moves | AI-2 | [x] |
| 3.4 | Implement **Medium** AI: heuristic (HP, card advantage, threat) | AI-2, AI-4 | [x] |
| 3.5 | Implement **Hard** AI: strategic (Final Spree timing, Hidden bluffing) | AI-2, AI-4 | [x] |
| 3.6 | Add configurable AI turn delay (2–5s) | AI-3 | [x] |
| 3.7 | Fix AI stuck: enforce 1 weapon/utility/special per turn, rocket_launcher support, reset counters | §5, UX-5 | [x] |
| 3.8 | Trap overlay: persist until user dismisses; block AI while overlay visible | FX-7 | [x] |
| 3.9 | AI targeting: random among tied lowest-HP targets (fix human bias) | AI-5a | [x] |
| 3.10 | Fix AI stuck after utility (e.g. Chain Mail): handle draw-in-play-phase in gameController | CARD_BUGS | [x] |
| 3.11 | DevLog panel: bottom-left chat-style log for actions, state transitions, AI scheduling; use for AI stuck debugging | Debug | [x] |
| 3.12 | Investigate AI 3 stuck when transferring to player: trace via DevLog (end_turn → state advance) | Debug | [~] |

---

## Phase 4: User Interface

| # | Task | PRD Ref | Status |
|---|------|---------|--------|
| 4.1 | Create game lobby: player count (2–4), AI slots, difficulty, Momentum toggle | FR-1, FR-6, FR-9 | [x] |
| 4.2 | Implement game board layout (opponents, hand, draw/discard, center) | NFR-1 | [x] |
| 4.3 | Display player HP and card counts | §4 | [x] |
| 4.4 | Display hand with card details (tooltip/expand) | §6 | [x] |
| 4.4a | Card preview modal: click card → see effect, damage, description; Play / Close | UX-1 | [x] |
| 4.4b | Targeting mode: opponents get hover/click feedback when attacking card selected | UX-2 | [x] |
| 4.4c | Table perspective: wooden frame, felt surface, opponents around table (2p/3p/4p layouts) | UX-3, UX-4, NFR-5 | [x] |
| 4.4d | Show AI played cards (last played card + target) for user feedback | UX-6 | [x] |
| 4.4e | Visual card piles in center (draw = card-back, discard = face-up top card) | UX-7 | [x] |
| 4.5 | Implement card play flow: select card → select target (if needed) | FR-2 | [x] |
| 4.5a | Multi-target selection: Assault Rifle & Throwing Knives — allow player/AI to select 1 or 2 targets (option to affect more than one player) | MT-1, MT-2, MT-3 | [x] |
| 4.6 | Implement Hidden card play (face-down display for opponents) | §6.4 | [x] |
| 4.6a | Protective/hidden indicators: badges for Kevlar, Chain Mail, Heavy Chestplate, Mecha Suit + face-down hidden card on table | UX-8, UX-9 | [x] |
| 4.7 | Show turn indicator and "waiting for AI" state | NFR-2 | [x] |
| 4.8 | Implement game-over screen (winner, stats) | §3 | [x] |
| 4.9 | Add basic animations/feedback (damage, draw, elimination) | NFR-2 | [x] |
| 4.9a | Damage flash: player seat flashes red when taking damage | FX-1 | [x] |
| 4.9b | Defensive effect feedback: shield/block animation when Kevlar/Chain Mail/Mecha Suit/Heavy Chestplate blocks/reduces | FX-2 | [x] |
| 4.9c | Hidden card feedback: creative reveal when face-down cards played or used | FX-3 | [x] |
| 4.9g | Peek at own hidden card: click face-down to see identity; opponents stay face-down | FX-4 | [x] |
| 4.9h | Trap-style activation: Yu-Gi-Oh flip overlay when hidden card triggers (Spike Trap) | FX-5 | [x] |
| 4.9i | Fix hidden cards unplayable: previewIsPeek distinguishes hand vs table; Play shown for hand hidden cards | CARD_BUGS | [x] |
| 4.9j | Trap overlay persistence: pendingTrapReveal state, block AI until user dismisses | FX-7 | [x] |
| 4.9k | Status effect indicators: Molotov, Dynamite, Poisonous Apple badges on player seats | UX | [x] |
| 4.9d | Health bars for player and AI: visual HP bar + numeric display | UX-10 | [x] |
| 4.9e | Avatar placeholders: circular slots for player/AI images; emoji fallback until custom art | UX-11 | [x] |
| 4.9f | Space balance: cap opponent/human/center so no zone dominates; document in UX_SPACE_ANALYSIS.md | UX-12 | [x] |
| 4.10 | Responsive layout for tablet | NFR-1 | [ ] |
| 4.11 | Keyboard navigation where applicable | NFR-2 | [ ] |

---

## Phase 5: Polish & Testing

| # | Task | PRD Ref | Status |
|---|------|---------|--------|
| 5.1 | Game state persistence (save/load local) | FR-10 | [ ] |
| 5.2 | Externalize all UI strings (localization-ready) | NFR-3 | [ ] |
| 5.3 | Verify all card effects against Design Doc + xlsx | §13 | [ ] |
| 5.4 | End-to-end test: full game vs 3 AI | §13 | [ ] |
| 5.5 | Performance check: AI turn &lt; 500ms (or configurable) | NFR-4 | [ ] |
| 5.6 | Bug bash and edge-case handling | §13 | [ ] |
| 5.6a | Fix Spike Trap (no trigger) and Devil's Blessing (guards) — see CARD_BUGS.md | §6.3, §6.4 | [x] |
| 5.6b | Enforce 1 weapon/utility/special per turn for human: controller validation + UI `canPlayCard`/`card-unplayable` | §5, UX-5 | [x] |
| 5.6c | Limit Draw Instead: only if no cards played yet + max 1/turn; see CARD_BUGS §5 | §5 | [x] |
| 5.6d | Mecha Suit / Heavy Chestplate: tick at turn start (tickProtectiveTurns); see CARD_BUGS §8 | §6.2 | [x] |
| 5.6e | AI weapon loop: validMoves filter + processAITurn guard; see CARD_BUGS §9 | Debug | [x] |

---

## Phase 6: Online-Ready (Future)

| # | Task | PRD Ref | Status |
|---|------|---------|--------|
| 6.1 | Ensure game logic is headless (no UI calls in engine) | FR-11 | [ ] |
| 6.2 | Add optional replay/debug mode with seed | FR-14 | [ ] |
| 6.3 | Design network protocol (actions, state sync) | FR-11 | [ ] |
| 6.4 | Implement WebSocket client + server stub | §11 | [ ] |

---

## Summary by Phase

| Phase | Tasks | Critical Path |
|-------|-------|----------------|
| 0 | 5 | 0.1 → 0.2 → 0.3 → 0.4 |
| 1 | 8 | 1.1 → 1.2 → 1.3 → 1.5 → 1.6 → 1.8 |
| 2 | 11 | 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 → 2.7 |
| 3 | 6 | 3.1 → 3.2 → 3.3 (then 3.4, 3.5) |
| 4 | 11 | 4.1 → 4.2 → 4.3 → 4.4 → 4.5 → 4.7 → 4.8 |
| 5 | 6 | Can run in parallel after Phase 4 |
| 6 | 4 | Post-MVP |

---

*Update status as work progresses. When tasks are completed, change `[ ]` to `[x]` and note any PRD updates needed.*
