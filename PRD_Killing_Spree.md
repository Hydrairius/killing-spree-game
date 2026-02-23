# Product Requirements Document (PRD)
# Killing Spree — Online Competitive PvP Card Game

**Version:** 1.0  
**Date:** February 21, 2026  
**Status:** Draft  

---

## 1. Executive Summary

**Killing Spree** is an online multiplayer competitive PvP card game where 2–4 players battle to eliminate opponents or secure victory via the Final Spree mechanic. The game combines tactical card play, hidden reactions, and psychological bluffing. This PRD defines requirements for the initial release supporting **local play with up to 3 AI opponents**, with architecture prepared for future online multiplayer.

---

## 2. Game Overview

### 2.1 Genre & Platform
- **Genre:** Competitive PvP card game
- **Platform:** Web-based (online game)
- **Player Count:** 2–4 players
- **Initial Release Scope:** Local play with 1 human + up to 3 AI players

### 2.2 Core Pillars
- **Elimination-focused:** Primary win condition is eliminating all opponents
- **Alternate win condition:** Final Spree — a high-risk, high-reward instant-win card
- **Hidden cards:** Bluffing and mind games through face-down reaction cards
- **Momentum:** Rewards aggression via optional Momentum Bonus mechanic

---

## 3. Win Conditions

### 3.1 Primary Win Condition
- **Eliminate all other players** (reduce their HP to 0)

### 3.2 Alternate Win Condition — Final Spree
- **Requirement:** Player must have eliminated at least 1 player during the game
- **Effect:** When played, for the next full round:
  - All damage the player deals is **doubled**
  - If the player eliminates a player during this round → **instant win**
- **Failure:** If no elimination occurs during the Final Spree round:
  - Effect ends
  - Card is discarded
  - Game continues normally

---

## 4. Game Setup

| Step | Requirement |
|------|-------------|
| 1 | Shuffle the deck |
| 2 | Each player draws **7 cards** |
| 3 | Each player starts with **20 HP** |
| 4 | Create draw pile and discard pile |
| 5 | Determine first player (youngest in physical game; configurable in digital) |
| 6 | Turns rotate **clockwise** |

### 4.1 Deck Composition (from Killing Spree.xlsx)
- **Weapons:** 14 unique cards, various quantities (see Card Catalog)
- **Special:** 14 cards (1 copy each)
- **Utility:** 13 unique cards, various quantities
- **Hidden:** 8 unique cards, various quantities  
- **Total deck:** ~100+ cards (exact count from xlsx quantities)

---

## 5. Turn Structure

On each turn, a player must:

1. **Draw 1 card** (except the first player on Round 1)
2. **Play cards (optional):**
   - Up to **1 Weapon** card
   - Up to **1 Utility** card  
   - Up to **1 Special** card
   - **OR** instead of playing a card: draw **1 additional card**
3. **End turn**

---

## 6. Card Types & Catalog

### 6.1 Weapon Cards
Used to deal damage. Two subtypes: **Melee** and **Ranged**.

| Name | Damage Type | Base Damage | Effect | Notes |
|------|-------------|-------------|--------|-------|
| Katana | Melee | 3 | If target is reduced below 10 HP, deal +1 bonus damage | Momentum finisher |
| Combat Knife | Melee | 2 | If played after another Weapon this turn, deal +1 bonus damage | Combo weapon |
| Baseball Bat | Melee | 3 | Target discards 1 card | Disruption tool |
| Morning Star | Melee | 3 | Cannot be blocked by Dodge-type Hidden cards | Armor pierce |
| Chainsaw | Melee | 3 | Deals 3 damage per turn for 2 turns. Cannot play another Weapon next turn | Sustained damage tradeoff |
| Glock | Ranged | 2 | Draw 1 card after dealing damage | Tempo weapon |
| Revolver | Ranged | 3 | Flip a coin. On heads deal damage, on tails it misses | Risk/reward |
| 44 Magnum | Ranged | 3 | If target has more HP than you, deal +1 bonus damage | Underdog weapon |
| Crossbow | Ranged | 4 | Must skip next Weapon phase | Heavy shot delay |
| Assault Rifle | Ranged | 3 | May deal 3 damage split between up to two players | Multi-target pressure |
| Throwing Knives | Ranged | 2 | May split damage between two targets (1+2) | Flexible targeting |
| Bow | Ranged | 2 | If you have an active Hidden card, deal +1 bonus damage | Synergy weapon |
| Barrett M82 | Ranged | 5 | Target cannot play Hidden cards in response | Sniper finisher |
| Rocket Launcher | Ranged | 5 | Deals 5 damage to all players. You take 2 recoil damage | Legendary chaos weapon |

### 6.2 Utility Cards
Support effects: Heal, draw, force discards, steal cards, skip turns, temporary protection.

| Name | Quantity | Effect | Notes |
|------|----------|--------|-------|
| Medkit | 2 | Restore 5 HP | Strong healing, limited copies |
| Bandage | 1 | Restore 2 HP | Minor sustain |
| Bear Trap | 3 | Target a player. That player skips their next turn | High tempo disruption |
| Molotov Cocktail | 2 | Deal 1 damage per turn for 3 turns | Damage over time pressure |
| Kevlar Vest | 2 | Immune to next Ranged attack this round | Ranged counter |
| Chain Mail | 2 | Immune to next Melee attack this round | Melee counter |
| Heavy Chestplate | 1 | Reduce all incoming damage by 2 for 2 turns | Stronger defense with scaling value |
| Dynamite | 2 | After 1 full round, deal 6 damage to that player | Delayed burst damage |
| Grenade | 2 | Deal 4 damage instantly | Reliable burst tool |
| Petty Thief | 2 | Steal 1 random card from their hand. They draw 1 card | Card advantage manipulation |
| Forgery | 1 | Play immediately after another Utility card is played. Copy that Utility card's effect | Reactive utility tech |
| Adrenaline | 2 | You may play one additional Weapon this turn | Aggression enabler |
| Poison Dart | 2 | Deal 2 damage now and 2 damage at the start of their next turn | Hybrid burst + delayed damage |

### 6.3 Special Cards
Unique cards (1 copy each). Powerful effects.

| Name | Play Condition | Effect | Balance Notes |
|------|----------------|--------|---------------|
| Final Spree | Must have eliminated ≥1 player | For one full round, all damage you deal is doubled. If you eliminate a player during this round, you win instantly | Primary alternate win condition |
| Healing Wish | Play during your turn | Skip your next turn. Heal all damage taken this round and recover 5 HP | Strong sustain with tempo cost |
| Mecha Suit | — | You are immune to all damage for 2 turns | Defensive power spike |
| War Elephant | — | Deal 6 damage to target player and 2 damage to all others | High impact battlefield swing |
| Dog Squad | — | Deal 4 damage to one target. If they survive, they discard 2 cards | Mid-tier pressure card |
| Devil's Blessing | You must have 5 HP or less | Swap life totals with a chosen player | High-risk comeback mechanic |
| Mass Panic | — | All players discard their hands and draw 3 new cards | Chaos reset card |
| Execution Order | Secretly choose a player | If chosen player dies before your next turn, draw 3 cards and deal 3 damage to any target | Strategic bounty mechanic |

### 6.4 Hidden Cards (Reaction Cards)
- Played **face-down**
- Trigger on specific conditions (e.g., being attacked)
- **1 hidden card active per player** at a time
- **1 hidden card may resolve per round** (priority rules to be defined)
- Create bluffing and mind games

| Name | Trigger Condition | Effect | Balance Role |
|------|-------------------|--------|--------------|
| Land Mine | When you are attacked by a Weapon | Attacker takes 5 damage after attack resolves | Heavy retaliation deterrent |
| Claymore | When you are attacked | Negate 3 damage. Attacker takes 3 damage | Hybrid defense + punish |
| Poisonous Apple | When you are attacked | Attacker takes 2 damage at the start of their next 2 turns | Damage over time punishment |
| Protective Bubble | When you would take damage | Negate all damage from that single attack | Pure defensive stop |
| Magic Mirror | When you would take damage | Redirect the full damage to another player of your choice | High-impact redirect |
| Spike Trap | When a player targets you with a Utility card | That Utility effect is canceled. Attacker discards 1 card | Anti-utility tech |
| Shadow Dodge | When attacked by a Ranged weapon | Negate the attack and draw 1 card | Ranged counter + tempo |
| Counterstrike | When you survive an attack | Deal 3 damage back to attacker | Momentum reversal tool |

---

## 7. Elimination Rules

- When a player reaches **0 HP**, they are eliminated
- Eliminated players **discard their hand**
- Play continues until:
  - **One player remains**, or
  - **Final Spree** wins the game

---

## 8. Optional Mechanics

### 8.1 Momentum Bonus
When you eliminate a player:
- **Draw 2 cards**
- **Gain +2 HP**

Creates snowball tension and rewards aggression. Configurable (on/off) for balance testing.

---

## 9. Functional Requirements

### 9.1 MVP Scope (Local + AI)

| ID | Requirement | Priority |
|----|--------------|----------|
| FR-1 | Support 2–4 player games (1 human + up to 3 AI) | P0 |
| FR-2 | Full implementation of turn structure (draw, play, end) | P0 |
| FR-3 | Implement all Weapon, Utility, Special, and Hidden card effects | P0 |
| FR-4 | Implement Final Spree win condition | P0 |
| FR-5 | Implement elimination (0 HP) and hand discard | P0 |
| FR-6 | AI opponents with configurable difficulty (Easy/Medium/Hard) | P0 |
| FR-7 | Hidden card system: play face-down, trigger on conditions | P0 |
| FR-8 | Deck shuffle, draw pile, discard pile | P0 |
| FR-9 | Momentum Bonus (optional, toggle) | P1 |
| FR-10 | Game state persistence (save/load for local play) | P1 |

### 9.2 Online-Ready Architecture (Future)

| ID | Requirement | Priority |
|----|--------------|----------|
| FR-11 | Game logic decoupled from I/O (suitable for client-server) | P0 |
| FR-12 | Deterministic game state for replication | P0 |
| FR-13 | Clear separation: Game Engine / AI / UI / Networking | P1 |
| FR-14 | Support for random seed (replay/debug) | P1 |

### 9.3 Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-1 | Responsive web UI (desktop primary, tablet supported) |
| NFR-2 | Accessible: keyboard navigation, clear feedback |
| NFR-3 | Localization-ready (strings externalized) |
| NFR-4 | Performance: turn resolution &lt; 500ms for AI turns |
| NFR-5 | Immersive table perspective: player sits at one side, opponents around the rest of the table |

### 9.4 Game Board UX (Card Preview & Targeting)

| ID | Requirement |
|----|-------------|
| UX-1 | **Card preview:** Clicking a card opens a modal showing name, type, damage, and full effect description |
| UX-2 | **Targeting mode:** When playing an attacking/targeting card, opponents show a clear hover effect (glow, pulse, cursor) to indicate they are clickable targets |
| UX-3 | **Table layout:** 2 players = opponent across (top); 3 players = opponents left + right; 4 players = opponents left + top + right |
| UX-4 | **Table perspective:** Wooden frame, felt surface, and layout evoke sitting at one side of a physical table |

### 9.5 AI & Board Feedback

| ID | Requirement |
|----|-------------|
| UX-5 | **Turn limits (human + AI):** Enforce 1 weapon, 1 utility, 1 special per turn (PRD §5). Controller validates and rejects invalid plays; UI disables/grays out unplayable cards. |
| UX-6 | **AI played cards:** Display when AI plays a card (card name, target if any) for user feedback |
| UX-7 | **Visual card piles:** Draw pile and discard pile shown as card stacks in center (card-back style for draw, face-up top for discard) |

### 9.5a Multi-Target Card Selection (FR-2)

**Principle:** When a card can affect more than one player, the player or AI must have the option to select one or more targets.

| ID | Requirement |
|----|-------------|
| MT-1 | **Assault Rifle / Throwing Knives:** Player and AI must be able to choose 1 target (all damage) OR 2 targets (split damage) |
| MT-2 | UI: When playing a multi-target card, allow selecting first target, then optionally second target (or confirm single with "Apply to [name] only") |
| MT-3 | AI: Valid moves include both single-target and two-target options; AI selects based on situation |

---

### 9.6 Protective & Hidden Card Visibility (UX-8)

| ID | Requirement |
|----|-------------|
| UX-8 | **Protective indicators:** All players show badges for active Kevlar, Chain Mail, Heavy Chestplate, Mecha Suit |
| UX-9 | **Hidden cards on table:** Face-down card displayed in each player's area when they have a hidden card played |

---

### 9.7 Combat & Effect Juice (Visual Feedback)

| ID | Requirement |
|----|-------------|
| FX-1 | **Damage feedback:** When a player takes damage, flash their seat/sprite red with a brief hit animation |
| FX-2 | **Defensive effects:** When Kevlar/Chain Mail/Mecha Suit/Heavy Chestplate blocks or reduces damage, show shield/block effect with effect name |
| FX-3 | **Hidden/reactionary cards:** When a player plays or reveals a hidden card, show creative feedback (mystery reveal, face-down flip, etc.) |
| FX-4 | **Peek at own hidden card:** Owner can click face-down hidden card to see its identity (modal, Close only) |
| FX-5 | **Trap-style activation:** When a hidden card activates (e.g. Spike Trap), Yu-Gi-Oh style: card flips to face, overlay shows effect to everyone, dismiss on click |
| FX-6 | **Hidden card play:** Preview from hand must show Play button for hidden cards; peek from table shows Close only. Use `peekOnly` prop, not `card.type`, to avoid hiding Play. |
| FX-7 | **Trap overlay persistence:** Trap reveal overlay must stay visible until user dismisses; block AI from acting until overlay closed. See `docs/TRAP_OVERLAY_AND_AI_TARGETING.md` |

*See [docs/PROTECTIVE_HIDDEN_INDICATORS.md](docs/PROTECTIVE_HIDDEN_INDICATORS.md), [docs/CARD_BUGS.md](docs/CARD_BUGS.md), and [docs/TRAP_OVERLAY_AND_AI_TARGETING.md](docs/TRAP_OVERLAY_AND_AI_TARGETING.md) for implementation details.*

---

### 9.8 Player Display (Health Bars & Avatars)

| ID | Requirement |
|----|-------------|
| UX-10 | **Health bars:** Each player (human and AI) shows a visual HP bar (fill = current/max) plus numeric HP |
| UX-11 | **Avatar placeholders:** Circular slots for player/AI portrait images; emoji fallbacks (🧑 human, 🤖 AI) until custom images added. See `public/assets/avatars/README.md` |

### 9.9 Space Balance (No Zone Dominance)

| ID | Requirement |
|----|-------------|
| UX-12 | **Balanced layout:** No single player (human or AI) takes excessive space. Opponent seats compact (max 180px); human hand capped (max 680px); center (piles, combat) remains focal. See `docs/UX_SPACE_ANALYSIS.md` |

---

## 10. AI Opponent Requirements

| ID | Requirement |
|----|-------------|
| AI-1 | AI must follow all game rules (valid moves only) |
| AI-5a | **Target diversity:** When multiple opponents have same (or tied) lowest HP, AI randomly selects among them; no bias toward human (player index order). See `docs/TRAP_OVERLAY_AND_AI_TARGETING.md` |
| AI-2 | AI difficulty levels: Easy (random/simple), Medium (heuristic), Hard (strategic) |
| AI-3 | AI turn completion within 2–5 seconds (configurable) |
| AI-4 | AI considers: HP, hand quality, hidden card bluffing, Final Spree timing |
| AI-5 | AI personality/archetypes optional (aggressive, defensive, opportunistic) |

---

## 11. Technical Considerations

### 11.1 Recommended Stack (Suggestion)
- **Frontend:** HTML/CSS/JS or React/Vue
- **Game Logic:** Pure TypeScript/JavaScript (deterministic)
- **AI:** Rule-based + heuristic (extensible to ML later)
- **Future Online:** WebSocket + authoritative server

### 11.2 Key Design Decisions
- **Authoritative Server:** For online, server validates all moves
- **Turn-Based:** No real-time clock initially; async play possible later
- **RNG:** Seeded random for reproducibility (e.g., coin flips, shuffles)

---

## 12. Out of Scope (Initial Release)

- Online matchmaking
- Ranked/competitive leagues
- In-app purchases / monetization
- Mobile native apps (web responsive only)
- Spectator mode
- Replay sharing

---

## 12a. Known Card Bug Fixes (2026-02-21)

| Card | Issue | Fix |
|------|-------|-----|
| Spike Trap | Never triggered (no hidden-card trigger resolution) | Implemented trigger in resolveUtility: when targeted Utility played, check target's hiddenCard; if spike_trap, cancel effect, attacker discards 1, consume trap |
| Devil's Blessing | Potential edge cases | Added eliminated-target guard, HP cap at maxHp after swap |

*See [docs/CARD_BUGS.md](docs/CARD_BUGS.md) for full analysis.*

---

## 13. Success Criteria

1. **Playable:** 1 human can complete a full game vs 3 AI opponents
2. **Rules-Compliant:** All card effects match Design Doc and xlsx specs
3. **Stable:** No game-breaking bugs in standard play
4. **Extensible:** Codebase ready for online multiplayer integration

---

## 14. References

- **Killing Spree Design Doc.docx** — Core rules, turn structure, card types
- **Killing Spree.xlsx** — Card catalog (Weapons, Special, Utility, Hidden)
- **[TASKS.md](TASKS.md)** — Development task list (phased, PRD-linked)

---

## 15. Development Task List

A detailed, phased task list is maintained in **[TASKS.md](TASKS.md)**. Tasks are organized as:

| Phase | Scope |
|-------|-------|
| **0** | Project setup, RNG, deck data |
| **1** | Core game engine (state, turns, elimination, win detection) |
| **2** | Card implementation (Weapons, Utility, Special, Hidden) |
| **3** | AI opponents (Easy/Medium/Hard) |
| **4** | User interface (lobby, board, play flow, feedback) |
| **5** | Polish & testing (save/load, localization, verification) |
| **6** | Online-ready (future) |

Each task references the relevant PRD section or requirement ID. Update TASKS.md as work progresses.

---

*Document generated from Design Doc and Killing Spree.xlsx. Subject to change during implementation.*
