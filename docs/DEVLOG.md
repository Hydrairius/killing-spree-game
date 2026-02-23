# DevLog — Debug Tool

**Last updated:** February 21, 2026

---

## Purpose

Bottom-left chat-style panel for tracing actions, state transitions, AI behavior, and errors during gameplay. Use for debugging turn-flow issues (e.g. AI weapon loop, stuck turns) and controller rejections.

---

## Log Tags

| Tag    | Color        | Content                                           |
|--------|--------------|---------------------------------------------------|
| action | Red accent   | Dispatched actions: `→ play_card Glock by p1`     |
| state  | Red accent   | Current player/phase, combat events (damage, blocked, missed), hidden activations |
| ai     | Red accent   | AI scheduling: `AI scheduling: AI-2 in 800ms`   |
| warn   | Amber        | Rejections, safeguards, overrides, weapon missed |
| error  | Red          | Exceptions and critical failures                  |

---

## Warning & Error Entries

### Controller rejections (warn)

When an action is rejected, the controller logs to DevLog with a `warn` tag:

- `draw rejected: not your turn (p1) [wrong_player]`
- `draw rejected: already drew or played this turn [draw_invalid]`
- `play_card rejected: wrong player or phase [wrong_player_or_phase]`
- `play_card rejected: card not in hand (Glock) [card_not_found]`
- `play_card rejected: already played weapon or skipWeaponNextTurn (Baseball Bat) [weapon_limit]`
- `play_card rejected: already played utility (Medkit) [utility_limit]`
- `play_card rejected: already played special (Final Spree) [special_limit]`
- `play_hidden rejected: wrong player or phase [wrong_player_or_phase]`
- `play_hidden rejected: already have hidden card [already_hidden]`
- `play_hidden rejected: card not in hand [card_not_found]`
- `play_hidden rejected: not a hidden card [wrong_type]`
- `end_turn rejected: not your turn (p2) [wrong_player]`

### AI safeguards (warn)

- `⚠ AI weapon safeguard: forcing end_turn (AI-2)` — Short-circuit triggered; AI would have played a second weapon
- `⚠ AI guard override: weapon→end_turn (AI-2, picked Chainsaw)` — Guard overrode AI’s weapon choice to `end_turn`

### Errors (error)

- `❌ AI error: <message>` — Exception in `processAITurn` (e.g. from `chooseAIMove` or state access)

### Combat event logging (state)

When `lastCombatEvent` changes, DevLog logs:

- `💥 X took N damage from Y (CardName)` — damage applied
- `🛡 X blocked with EffectName` — Kevlar, Chain Mail, Mecha Suit
- `🛡 X's EffectName reduced A→B damage` — Heavy Chestplate, Claymore
- `☠ X eliminated` — player eliminated
- `❌ CardName missed!` — Revolver coin flip was tails

### Hidden activation logging (state)

When a hidden card triggers (`lastHiddenReveal`), DevLog logs:

- `⚠ TRAP: X's CardName — result (Y affected)` — defender's hidden activated; attacker Y affected (Spike Trap, Magic Mirror, Protective Bubble, Land Mine, Claymore, Counterstrike)
- `⚠ TRAP: X's CardName — result` — defender's hidden activated with no attacker (e.g. damage-only triggers)

Examples:
- `⚠ TRAP: AI-2's Magic Mirror — damage redirected (p1 affected)`
- `⚠ TRAP: p1's Land Mine — 5 damage to attacker (AI-2 affected)`
- `⚠ TRAP: AI-1's Spike Trap — 2 damage to attacker (p1 affected)`

The ref `prevHiddenRevealRef` ensures each activation is logged only once; it is cleared when `lastHiddenReveal` is reset so the next trigger logs correctly.

---

## How to Use

1. Start a game — DevLog appears bottom-left
2. Watch `→` action entries for dispatched actions
3. Watch `←` state entries when player/phase changes
4. **Rejections:** if you see `play_card rejected: already played weapon`, the AI or human tried to play a second weapon
5. **Safeguards:** `⚠ AI weapon safeguard` shows the loop-prevention firing
6. **Errors:** `❌ AI error` indicates a crash in AI logic

---

## Implementation

| File                    | Role                                                       |
|-------------------------|------------------------------------------------------------|
| `src/ui/DevLogPanel.tsx`| Panel component; supports `action`, `state`, `ai`, `warn`, `error` |
| `src/ui/GameBoard.tsx`  | `addLog`, `loggedOnAction`, reject logger wiring, AI try/catch, hidden activation logging |
| `src/game/gameController.ts` | `setRejectLogger()`, `logReject()` at each rejection point   |

---

## Wiring the reject logger

GameBoard registers the logger when mounted:

```ts
useEffect(() => {
  if (controller) {
    controller.setRejectLogger((msg, reason) =>
      addLog(reason ? `${msg} [${reason}]` : msg, 'warn')
    );
    return () => controller.setRejectLogger(null);
  }
}, [controller, addLog]);
```

The controller calls `logReject(msg, reason)` whenever an action is rejected without applying.

---

## Files

- `src/ui/DevLogPanel.tsx`
- `src/ui/DevLogPanel.css`
