# Card Effect Bugs — Analysis & Fixes

**Date:** February 21, 2026

---

## 1. Spike Trap (Hidden Card)

### Intended effect (PRD §6.4)
- **Trigger:** When a player targets you with a Utility card
- **Effect:** That Utility effect is canceled. Attacker discards 1 card.

### Current behavior
**Spike Trap never triggers.** The game has no combat chain or hidden-card trigger resolution. When a player plays a Utility that targets someone:
1. `resolveUtility` executes the effect (Bear Trap, Grenade, etc.) directly
2. There is no check for the target's `hiddenCard`
3. Spike Trap (and other reactive Hidden cards like Land Mine, Claymore, Shadow Dodge) are never consulted

### Root cause
- TASKS 2.6 and 2.7 are `[~]` in progress: "Hidden card triggers and resolution" and "Combat chain: Weapon → Hidden response → damage resolution"
- Hidden cards are only placed face-down via `play_hidden`; there is no trigger-resolution path

### Fix
Implement Spike Trap trigger in the Utility resolution flow:
1. In `resolveUtility`, for targeted Utilities (bear_trap, grenade, molotov, dynamite, petty_thief, poison_dart), check if target has `hiddenCard` with baseId `spike_trap`
2. If yes and `!state.hiddenCardUsedThisRound`, return a "cancelled by Spike Trap" result
3. Controller: cancel utility effect, discard utility card, force attacker to discard 1 extra card, consume target's Spike Trap, set `hiddenCardUsedThisRound = true`

---

## 2. Devil's Blessing (Special Card)

### Intended effect (PRD §6.3)
- **Condition:** You must have 5 HP or less
- **Effect:** Swap life totals with a chosen player

### Current behavior (code analysis)
The resolver logic in `cardResolver.ts` appears correct:
```ts
if (player.hp <= 5 && targetId) {
  const swap = [player.hp, target.hp];
  const newPlayers = state.players.map((p) => {
    if (p.id === playerId) return { ...p, hp: swap[1] };
    if (p.id === targetId) return { ...p, hp: swap[0] };
    return p;
  });
  return { newState: { ...state, players: newPlayers } };
}
```

### Possible issues
1. **HP exceeding maxHp:** Swapping may give a player HP > maxHp (e.g. 20 when max is 20). Some systems cap; PRD says "swap life totals" (current HP). Will add optional cap for safety.
2. **Eliminated target:** If target is eliminated, we should not allow the swap. Valid moves filter `!p.isEliminated`, so this should not occur.
3. **Self-target:** Valid moves exclude self (`p.id !== playerId`), so no self-swap.

### Fix
- Add `!target.isEliminated` guard
- Cap swapped HP at `maxHp` to avoid display/logic edge cases
- Verify valid-move generation allows Devil's Blessing when hp ≤ 5

---

## 3. Hidden Cards Can't Be Played (UI Bug)

### Symptom
Player clicks a hidden card in hand → preview opens → **no Play button**. Cannot play hidden cards.

### Root cause
CardPreviewModal used `isPeek = peekOnly ?? card.type === 'hidden'`. For any hidden card, Play was hidden. The intent was: when **peeking** at your face-down card on the table, show Close only. But the same modal was used for **preview from hand** (to play) — and `card.type === 'hidden'` incorrectly hid the Play button there too.

### Fix
- Add `previewIsPeek` state to distinguish: hand preview (Play shown) vs table peek (Close only).
- Hand card click: `setPreviewIsPeek(false)` → Play button visible for all card types including hidden.
- Hidden slot click: `setPreviewIsPeek(true)` → peek-only, Close only.
- CardPreviewModal: `isPeek = peekOnly === true` (use prop explicitly, not card type).

---

## Summary

| Card / Area    | Bug                          | Status   |
|----------------|------------------------------|----------|
| Spike Trap     | Never triggers (no trigger resolution) | **Fixed** |
| Devil's Blessing | Verify swap + add guards     | **Fixed** |
| Hidden cards   | Can't play (Play button hidden in preview) | **Fixed** |
| AI stuck after utility | Draw-in-play-phase no-op; AI freezes when choosing draw | **Fixed** |
| Draw Instead           | Infinite draws in play phase                             | **Fixed** |
| Bear Trap              | skipNextTurn set but never checked in advanceToNextPlayer | **Fixed** |
| Status effect damage   | Molotov/Dynamite/Poison damage never applied; AI stuck    | **Fixed** |
| Mecha Suit / Heavy C.  | Never ticked down; stayed at 2 forever                     | **Fixed** |
| AI weapon loop         | Repeatedly plays weapons after already playing one        | **Fixed** |
| Players at 0 HP       | Not eliminated when damage from War Elephant, Dog Squad   | **Fixed** |
| Chainsaw             | No DoT; dealt 3 once instead of 3/turn for 2 turns        | **Fixed** |
| War Elephant         | Caster took 2 damage (should be excluded)                 | **Fixed** |
| Magic Mirror         | Never triggered; damage not redirected                    | **Fixed** |
| Game stuck on AI turn| Current player (AI-3) died from DoT before playing; no advance | **Fixed** |
| Counterstrike        | Never triggered when defender survived attack                   | **Fixed** |
| AI weapon loop (Adrenaline) | AI tried 2nd weapon with Adrenaline in hand (must play it first) | **Fixed** |
| Land Mine                  | Never triggered when defender was attacked by a weapon          | **Fixed** |
| Claymore                   | Never triggered when defender was attacked                      | **Fixed** |
| Game stuck when current eliminated mid-turn | AI-2 eliminated by Land Mine/Counterstrike during attack; turn stuck | **Fixed** |
| Revolver miss        | No feedback when coin flip was tails                              | **Fixed** |
| Devlog combat        | Damage/blocked/missed/eliminated not logged                       | **Fixed** |
| Chainsaw (updated)   | 3 initial damage + 3 DoT for 1 turn (was 3/turn for 2 turns)     | **Fixed** |
| Crossbow             | Explicit case + skipWeaponNextTurn                                | **Fixed** |
| Hidden card overlay  | Spike Trap only had Continue prompt; others had none             | **Fixed** |
| DoT stacking         | Verified: Molotov, Chainsaw, etc. stack (see PLAYER_HEALTH)    | **OK**   |
| Protective Bubble    | Never triggered; not implemented in damage flow                 | **Fixed** |
| Counterstrike on DoT | Was triggering when surviving DoT (should be weapon only)     | **Fixed** |
| Devil's Blessing start of turn | Couldn't play in draw phase when at 5 HP or less        | **Fixed** |
| Assault Rifle split  | Two targets got 3+0 damage instead of 2+1                    | **Fixed** |

---

## 17. Land Mine — Never Triggered

### Symptom
Land Mine (hidden: "When you are attacked by a Weapon: Attacker takes 5 damage after attack resolves") never triggered. The devlog sometimes showed "X took 1 damage from Y (Land Mine)" but that was misleading—the 1 damage was from Molotov (status effect); lastPlayedCard happened to be Land Mine from a recent play_hidden.

### Root cause
Land Mine was not implemented in the damage flow. `applyDamageAndCheckElimination` checked Magic Mirror, Counterstrike, and armor, but not Land Mine.

### Fix
- In `applyDamageAndCheckElimination`, after applying weapon damage: if target has `hiddenCard` with baseId `land_mine`, `!hiddenCardUsedThisRound`, and the damage is from a weapon attack (`attackingCard` has `damageType` melee or ranged), consume the Land Mine, set `hiddenCardUsedThisRound = true`, and apply 5 damage to the attacker
- Triggers whether the defender survives or dies
- Uses the same per-round hidden-card limit as Magic Mirror, Counterstrike, Spike Trap

### Note (devlog)
Status effect damage (Molotov, Dynamite, Poison) uses `lastPlayedCard` for the devlog, which can show the wrong card name if another card was played more recently. Land Mine now correctly deals 5 damage when triggered.

---

## 18. Claymore — Never Triggered

### Symptom
Claymore (hidden: "When you are attacked: Negate 3 damage. Attacker takes 3 damage.") never triggered when the defender was attacked by a weapon.

### Root cause
Claymore was not implemented in the damage flow. Only Magic Mirror, Land Mine, and Counterstrike were handled.

### Fix
- In `applyDamageAndCheckElimination`, after armor checks, before Heavy Chestplate: if target has `hiddenCard` with baseId `claymore`, `!hiddenCardUsedThisRound`, and damage is from a weapon attack, reduce damage by 3, consume Claymore, apply reduced damage to target, then apply 3 damage to the attacker
- Uses the same per-round hidden-card limit as other reactive hidden cards
- UI shows "Claymore" in damage_reduced event when damage was reduced

---

## 19. Game Stuck When Current Player Eliminated Mid-Turn

### Symptom
AI-2 attacked with 44 Magnum; target had Land Mine or Counterstrike; retaliatory damage eliminated AI-2. Game stuck on AI-2's turn—AI scheduling skipped (current eliminated), human couldn't act (wrong turn).

### Root cause
When a player is eliminated mid-turn (e.g. by Land Mine or Counterstrike when they attacked), `currentPlayerIndex` stayed on the eliminated player. The earlier fix for "DoT at start of turn" only ran in `handleEndTurn`; play_card/handlePlayHidden returned without advancing.

### Fix
- Added `advancePastEliminatedIfNeeded()`: when current player is eliminated, advance to next living player and run the same start-of-turn logic (status effects, ticks) as in handleEndTurn
- Called from `processAction` after draw, play_card, and play_hidden (not after end_turn, which already has the loop)

---

## 16. AI Weapon Loop — Adrenaline in Hand Treated as "Extra Weapon Allowed"

### Symptom
AI repeatedly tried to play a second weapon (e.g. Glock after Baseball Bat), got rejected, rescheduled, tried again in a loop. Happened when AI had Adrenaline in hand but had not played it.

### Root cause
`getValidMoves` and the GameBoard safeguard used `hasAdrenaline(player)` (Adrenaline in hand) to allow a second weapon. But Adrenaline must be **played** first to grant the extra weapon—playing it sets `extraWeaponAllowedThisTurn`. The controller correctly required `extraWeaponAllowedThisTurn`; validMoves incorrectly allowed weapons when Adrenaline was merely in hand.

### Fix
- **validMoves**: Only allow a second weapon when `extraWeaponAllowedThisTurn && weaponsPlayedThisTurn === 1` (i.e. they played Adrenaline this turn)
- **GameBoard safeguard**: Use same condition—`extraWeaponAllowedThisTurn && weaponsPlayedThisTurn === 1`—not "Adrenaline in hand"
- Removed `hasAdrenaline()`; the extra weapon is granted only after playing the Adrenaline utility card

---

## 15. Counterstrike — Never Triggered When Surviving Attack

### Symptom
Counterstrike (hidden card: "When you survive an attack: Deal 3 damage back to attacker") never triggered when the defender survived a weapon attack.

### Root cause
Damage is applied in `applyDamageAndCheckElimination`. That function checked Magic Mirror (pre-damage redirect) and various armor/block effects, but did not check for Counterstrike after damage was applied when the target survived.

### Fix
- In `applyDamageAndCheckElimination`, after applying damage: if target survived (`newHp > 0`) and has `hiddenCard` with baseId `counterstrike` and `!hiddenCardUsedThisRound`, consume the Counterstrike, set `hiddenCardUsedThisRound = true`, and apply 3 damage to the attacker
- Counterstrike uses the round's single hidden-card allowance (same as Magic Mirror, Spike Trap)
- If the attacker survives the Counterstrike damage, they cannot trigger their own Counterstrike because `hiddenCardUsedThisRound` is already true

---

## 20. Revolver Miss — No Feedback When Coin Flip Was Tails

### Symptom
Revolver ("Flip a coin—on heads deal damage, on tails it misses") gave no feedback when it missed. Damage simply didn't apply.

### Fix
- Resolver: when revolver gets tails (damage=0), return `weaponMissed: 'Revolver'` instead of damageToDeal
- Controller: set `lastCombatEvent: { type: 'missed', cardName: 'Revolver' }`
- UI: combat event banner "❌ Revolver missed!" + DevLog entry

---

## 21. DevLog — Combat Events Not Logged

### Fix
- DevLog now logs: damage (💥), blocked (🛡), damage_reduced (🛡), eliminated (☠), missed (❌)
- useEffect watches lastCombatEvent; formats message with target/attacker/card name

---

## 22. Crossbow — Explicit Case + skipWeaponNextTurn

### Fix
- Added explicit crossbow case in resolveWeapon: deal damage and set skipWeaponNextTurn on attacker ("Must skip next Weapon phase")
- Ensures damage applies and card text is honored

---

## 24. Protective Bubble — Never Triggered

### Symptom
Protective Bubble (hidden: "When you would take damage: Negate all damage from that single attack") never triggered when the defender would take damage from a weapon or utility.

### Root cause
Protective Bubble was not implemented in `applyDamageAndCheckElimination`. Only Magic Mirror, Claymore, Land Mine, and Counterstrike were handled.

### Fix
- In `applyDamageAndCheckElimination`, after Magic Mirror: if target has `hiddenCard` with baseId `protective_bubble`, `!hiddenCardUsedThisRound`, and damage is from an **attack** (attackingCard present, i.e. weapon or utility—not DoT), consume the bubble and return with blocked event
- DoT damage does not count as "that single attack"; Protective Bubble does not trigger on status effect damage (see PLAYER_HEALTH_AND_ELIMINATION.md)

---

## 23. Hidden Card Reveal Overlay — All Triggers Show Continue Prompt

### Symptom
Only Spike Trap had the trap-reveal overlay with Continue. Land Mine, Claymore, Counterstrike, Magic Mirror had no prompt.

### Fix
- Added `lastHiddenReveal` to GameState (cardBaseId, defenderId, attackerId, result, revealedCard)
- When Land Mine, Claymore, Counterstrike, Magic Mirror trigger, set lastHiddenReveal
- Spike Trap also sets lastHiddenReveal (unified)
- `HiddenRevealOverlay` shows for all: card flip, effect text, result, Continue button
- AI scheduling blocks until user clicks Continue

---

## Fixes Applied

### Spike Trap
- Added `spikeTrapCancel` to ResolveResult in cardResolver
- In resolveUtility, before applying targeted Utilities, check if target has hiddenCard === spike_trap
- If yes and !hiddenCardUsedThisRound: return spikeTrapCancel, consume Spike Trap, set hiddenCardUsedThisRound
- Controller: on spikeTrapCancel, remove utility card, force attacker to discard 1 random card, show UI feedback

### Devil's Blessing
- Added eliminated target guard
- Added HP cap at maxHp after swap (prevents invalid state)

### Hidden Cards Can't Be Played
- Added `previewIsPeek` state; pass `peekOnly` explicitly to CardPreviewModal
- Hand → preview: `previewIsPeek = false` (Play shown)
- Table hidden slot → peek: `previewIsPeek = true` (Close only)

## 4. AI Stuck After Playing Utility (e.g. Chain Mail)

### Symptom
AI plays a utility like Chain Mail, then freezes on their turn and never advances.

### Root cause
- In play phase, "draw" is a valid move (draw 1 additional card instead of playing)
- AI often chooses "draw" when it has no good plays
- `handleDraw` only ran when `phase === 'draw'`; in play phase it returned unchanged state
- No state change → no re-render → no new AI timeout → AI stuck

### Fix
- In `handleDraw`, also handle `phase === 'play'`: draw 1 card for the player, keep phase as 'play', return new state

## 5. Draw Instead Infinite Draw (PRD §5)

### Symptom
Player could click "Draw Instead" repeatedly and draw infinite cards during play phase.

### Root cause
- `handleDraw` in play phase drew 1 card with no limit
- No tracking of whether the player had already used their one "draw instead" for the turn
- PRD §5: "OR instead of playing a card: draw **1 additional card**" — exactly one per turn

### Fix
- Add `drewInsteadThisTurn?: boolean` on Player
- In play phase: only allow draw if `!player.drewInsteadThisTurn` AND no cards played yet (`weaponsPlayedThisTurn === 0 && utilitiesPlayedThisTurn === 0 && specialsPlayedThisTurn === 0`); on draw, set `drewInsteadThisTurn: true`
- Reset `drewInsteadThisTurn` in `advanceToNextPlayer` when turn ends
- validMoves: only add `{ type: 'draw' }` when `!player.drewInsteadThisTurn`
- UI: hide "Draw Instead" button when `humanPlayer.drewInsteadThisTurn`

## 6. Bear Trap — Skip Next Turn Not Applied

### Symptom
Bear Trap targets a player ("That player skips their next turn") but the target still gets their turn.

### Root cause
- `cardResolver` sets `skipNextTurn: true` on the target when Bear Trap resolves
- `advanceToNextPlayer` in gameEngine never checked `skipNextTurn` — it only skipped eliminated players

### Fix
- In `advanceToNextPlayer`: loop to find next valid player; skip eliminated players and players with `skipNextTurn`
- When skipping a player with `skipNextTurn`, clear their flag before advancing

## 7. Status Effect Damage Never Applied (Molotov, Dynamite, Poisonous Apple)

### Symptom
Molotov "1 damage per turn for 3 turns" never dealt damage. Status effect badges showed countdown but HP didn't change. AI could get stuck repeatedly attempting plays.

### Root cause
- `tickStatusEffects` only decremented `turnsRemaining` and removed expired effects; it never applied damage
- Damage must be dealt at the **start** of the target's turn, before ticking down

### Fix
- New `applyStatusEffectDamage(state)`: runs after `advanceToNextPlayer`, before `tickStatusEffects`
- For the current player's status effects: apply `damagePerTurn` (molotov, poisonous_apple) or `totalDamage` when `turnsRemaining <= 1` (dynamite)
- Use `applyDamageAndCheckElimination` with `sourcePlayerId` as attacker for elimination credit
- Also: when `handlePlayCard` rejects (wrong phase, already played that type), return `{ ...this.state }` so React re-renders and AI gets fresh state
- AI loop safeguard: in `getValidMoves`, defensively filter out all `play_weapon` moves when `weaponsPlayedThisTurn > 0` (prevents stale-state loop)

### Dynamite never dealt damage (tick bug)
- `tickStatusEffects` was decrementing **every** player's effects on every turn end
- Dynamite (turnsRemaining: 1) on the human would get decremented to 0 and removed when AI-1 ended turn, before the human's turn
- Fix: only tick the **current player's** status effects (the one whose turn just started); damage applies at start of their turn, then we tick their effects

## 7b. Poisonous Apple (Hidden Card) — Never Triggered (Feb 2026)

### Symptom
Poisonous Apple hidden card ("When you are attacked: Attacker takes 2 damage at the start of their next 2 turns") never triggered when the defender was attacked by a weapon.

### Root cause
- `applyDamageAndCheckElimination` handled Magic Mirror, Protective Bubble, Shadow Dodge, Claymore, Land Mine, Counterstrike — but had no branch for `poisonous_apple`
- The hidden card was in deck and playable, but the combat pipeline never checked for it

### Fix (Feb 2026)
- In `applyDamageAndCheckElimination`: after Land Mine block, add check for `poisonous_apple`
- Consume the hidden card, add `poisonous_apple` status effect to the attacker (2 dmg/turn for 2 turns), set `lastHiddenReveal`
- See [HIDDEN_CARDS_AUDIT.md](HIDDEN_CARDS_AUDIT.md) for full audit

## 8. Mecha Suit & Heavy Chestplate — Never Ticked Down

### Symptom
Mecha Suit ("immune for 2 turns") and Heavy Chestplate ("−2 dmg for 2 turns") never expired; badge stayed at 2.

### Root cause
- `mechaSuitTurns` and `heavyChestplateTurns` were set when the card was played but never decremented
- Heavy Chestplate was previously decremented only when damage was reduced (charge-based); card says "for 2 turns"

### Fix
- New `tickProtectiveTurns(state)`: runs at start of each player's turn (after status effects)
- Decrements `mechaSuitTurns` and `heavyChestplateTurns` for the current player only
- Removed per-damage decrement from Heavy Chestplate in `applyDamageAndCheckElimination`; now purely turn-based

## 9. AI Weapon Loop — Repeatedly Playing Weapons

### Symptom
AI plays Bow, then repeatedly tries Barrett M82 (or Chainsaw, etc.) every 800ms; never ends turn.

### Root cause
- Stale React state in closure: `processAITurn` or `getValidMoves` sees `weaponsPlayedThisTurn === 0` when it should be 1
- Controller rejects but returns same reference; React may not re-render; AI keeps picking weapon

### Fixes (layered)
1. **validMoves**: defensively filter out all `play_weapon` moves when `weaponsPlayedThisTurn > 0 && !hasAdrenaline`
2. **processAITurn guard**: before dispatching `play_weapon`, check; if already played weapon, override move to `end_turn`
3. **Controller**: on reject, return `{ ...this.state }` to force new reference and re-render
4. **Ref-based safeguard** (GameBoard): `aiWeaponDispatchedRef` tracks playerId of last weapon dispatch. If AI picks weapon again and ref matches current player, force `end_turn` instead. Ref cleared when turn changes (useEffect) or when dispatching `end_turn`.
5. **Dispatch counter** (GameBoard): `aiWeaponDispatchCountRef` counts weapon dispatches this turn. If >= 1, force `end_turn` before any AI logic. Independent of React state. Reset on turn change or `end_turn`.
6. **Controller reject**: on weapon reject, return `{ ...state, players: [...state.players] }` so React effect deps see new reference and reschedule correctly.

## 10. Players at 0 HP Not Eliminated

### Symptom
AI or player hits 0 HP but does not die (no "OUT" label, still gets turn).

### Root cause
`gameEngine.applyDamage` (used by War Elephant, Dog Squad) reduced HP but never called `eliminatePlayer` when `newHp <= 0`.

### Fix
- `applyDamage` now accepts optional `eliminatorId` and calls `eliminatePlayer` when `newHp <= 0`
- cardResolver: War Elephant, Dog Squad pass `playerId` as eliminator

## 11. Chainsaw — No DoT, No skipWeaponNextTurn (updated)

### Symptom
Chainsaw dealt 3 damage once instead of 3 damage per turn. Attacker could play another weapon next turn.

### Root cause
resolveWeapon had no `chainsaw` case; it fell through to default (single hit). No status effect, no skipWeaponNextTurn.

### Fix
- Added chainsaw case: addStatusEffect(..., 'chainsaw', 1, { damagePerTurn: 3 }), set skipWeaponNextTurn on attacker, **deal 3 initial damage** (damageToDeal)
- Card effect: 3 damage now + 3 damage at start of target's next turn
- Added 'chainsaw' to StatusEffect type; UI badge + tooltip

---

## 12. War Elephant — Caster Taking Own Damage

### Symptom
When playing War Elephant, the caster was taking 2 damage along with other players. Card says "Deal 2 damage to all other players" — caster should be excluded.

### Root cause
The damage loop in `cardResolver.ts` only excluded the target (`p.id !== targetId`); the caster was not excluded.

### Fix
- In War Elephant damage loop: exclude both target and caster: `p.id !== targetId && p.id !== playerId`

---

## 13. Magic Mirror — Never Triggered

### Symptom
Magic Mirror (hidden card: "When you would take damage: Redirect the full damage to another player of your choice") never triggered. Damage went through to the defender instead of being redirected.

### Root cause
Damage is applied in `applyDamageAndCheckElimination` in `gameController.ts`. That function checked mechaSuit, kevlar, chainMail, heavyChestplate but did not check for hidden cards (Magic Mirror, Protective Bubble, Land Mine, Claymore).

### Fix
- In `applyDamageAndCheckElimination`, before applying damage: if target has `hiddenCard` with baseId `magic_mirror` and `!hiddenCardUsedThisRound`, consume the mirror and redirect damage to the attacker
- Pass `isRedirected = true` when applying redirected damage to prevent redirect loops (attacker's Magic Mirror does not trigger on reflected damage)

### Note
Current implementation redirects to the attacker by default. Full "another player of your choice" would require pending state and UI for target selection.

---

## 14. Game Stuck When AI Dies Before Turn (DoT at Start of Turn)

### Symptom
AI-3 (or any player) dies from Chainsaw DoT at the start of their turn before they can play. Game gets stuck: current player is eliminated, no AI turn scheduled, human cannot act.

### Root cause
`handleEndTurn` runs: advanceToNextPlayer → applyStatusEffectDamage → tickStatusEffects → tickProtectiveTurns. When status effect damage (e.g. Chainsaw) eliminates the new current player, `currentPlayerIndex` stays pointing at that eliminated player. The UI checks `!current.isEliminated` before scheduling AI, so nothing runs.

### Fix
- In `handleEndTurn`: wrap applyStatusEffectDamage, tickStatusEffects, tickProtectiveTurns in a loop
- After each iteration: if current player is eliminated, advance to next living player and repeat
- Exit when current is alive or game is over (≤1 active)
