/**
 * Hidden card trigger verification tests
 * Verifies that each hidden card correctly triggers under the right conditions.
 */
import { describe, it, expect } from 'vitest';
import { GameController } from './gameController';
import type { GameState, AnyCard } from './types';

/** Helper: get a card by base id from a hand */
function findCard(hand: AnyCard[], baseId: string): AnyCard | undefined {
  return hand.find((c) => c.id.replace(/_\d+$/, '') === baseId);
}

describe('Hidden Cards', () => {
  describe('integration via GameController', () => {
    it('Poisonous Apple triggers when defender is attacked by weapon and adds DoT to attacker', () => {
      const ctrl = new GameController();
      let state = ctrl.processAction({ type: 'start', playerCount: 2, momentumBonus: false, seed: 99991 })!;

      // Get p0 (human) to have poisonous_apple in hand, p1 to have a weapon. Try multiple seeds.
      for (let seed = 99990; seed < 100010; seed++) {
        state = ctrl.processAction({ type: 'start', playerCount: 2, momentumBonus: false, seed })!;
        const p0 = state.players[0]!;
        const p1 = state.players[1]!;
        const apple = findCard(p0.hand, 'poisonous_apple');
        const weapon = p1.hand.find((c) => c.type === 'weapon');

        if (apple && weapon) {
          // p0 draws, plays poisonous_apple hidden, ends turn
          state = ctrl.processAction({ type: 'draw', playerId: 'p0' })!;
          state = ctrl.processAction({ type: 'play_hidden', playerId: 'p0', card: apple })!;
          state = ctrl.processAction({ type: 'end_turn', playerId: 'p0' })!;

          // p1 draws, attacks p0 with weapon
          state = ctrl.processAction({ type: 'draw', playerId: 'p1' })!;
          state = ctrl.processAction({
            type: 'play_card',
            playerId: 'p1',
            card: weapon!,
            targetId: 'p0',
          })!;

          expect(state!.lastHiddenReveal?.cardBaseId).toBe('poisonous_apple');
          const attacker = state!.players.find((p) => p.id === 'p1')!;
          const appleEffect = attacker.statusEffects.find((e) => e.type === 'poisonous_apple');
          expect(appleEffect).toBeDefined();
          expect(appleEffect?.damagePerTurn).toBe(2);
          expect(appleEffect?.turnsRemaining).toBe(2);
          expect(appleEffect?.targetPlayerId).toBe('p1');
          return;
        }
      }
      expect.fail('Could not find seed where p0 has poisonous_apple and p1 has weapon');
    });

    it('Land Mine triggers and deals 5 damage to attacker', () => {
      const ctrl = new GameController();
      let state: GameState | null = null;
      for (let seed = 100; seed < 200; seed++) {
        state = ctrl.processAction({ type: 'start', playerCount: 2, momentumBonus: false, seed })!;
        const p0 = state.players[0]!;
        const p1 = state.players[1]!;
        const landMine = findCard(p0.hand, 'land_mine');
        const weapon = p1.hand.find((c) => c.type === 'weapon');
        if (landMine && weapon) break;
      }
      expect(state).toBeTruthy();
      const p0 = state!.players[0]!;
      const p1 = state!.players[1]!;
      const landMine = findCard(p0.hand, 'land_mine');
      const weapon = p1.hand.find((c) => c.type === 'weapon');
      expect(landMine).toBeTruthy();
      expect(weapon).toBeTruthy();

      state = ctrl.processAction({ type: 'draw', playerId: 'p0' })!;
      state = ctrl.processAction({ type: 'play_hidden', playerId: 'p0', card: landMine! })!;
      state = ctrl.processAction({ type: 'end_turn', playerId: 'p0' })!;
      state = ctrl.processAction({ type: 'draw', playerId: 'p1' })!;

      const attackerHpBefore = state!.players.find((p) => p.id === 'p1')!.hp;
      state = ctrl.processAction({
        type: 'play_card',
        playerId: 'p1',
        card: weapon!,
        targetId: 'p0',
      })!;

      expect(state!.lastHiddenReveal?.cardBaseId).toBe('land_mine');
      const attackerHpAfter = state!.players.find((p) => p.id === 'p1')!.hp;
      expect(attackerHpBefore - attackerHpAfter).toBe(5);
    });

    it('Claymore triggers, negates 3 damage, attacker takes 3', () => {
      const ctrl = new GameController();
      let state: GameState | null = null;
      for (let seed = 200; seed < 300; seed++) {
        state = ctrl.processAction({ type: 'start', playerCount: 2, momentumBonus: false, seed })!;
        const p0 = state!.players[0]!;
        const p1 = state!.players[1]!;
        const claymore = findCard(p0.hand, 'claymore');
        const weapon = p1.hand.find((c) => c.type === 'weapon' && (c as { baseDamage?: number }).baseDamage >= 4 && !c.id.startsWith('rocket_launcher'));
        if (claymore && weapon) break;
      }
      expect(state).toBeTruthy();
      const p0 = state!.players[0]!;
      const p1 = state!.players[1]!;
      const claymore = findCard(p0.hand, 'claymore');
      const weapon = p1.hand.find((c) => c.type === 'weapon' && (c as { baseDamage?: number }).baseDamage >= 4 && !c.id.startsWith('rocket_launcher'));
      expect(claymore).toBeTruthy();
      expect(weapon).toBeTruthy();

      state = ctrl.processAction({ type: 'draw', playerId: 'p0' })!;
      state = ctrl.processAction({ type: 'play_hidden', playerId: 'p0', card: claymore! })!;
      state = ctrl.processAction({ type: 'end_turn', playerId: 'p0' })!;
      state = ctrl.processAction({ type: 'draw', playerId: 'p1' })!;

      const defHpBefore = state!.players.find((p) => p.id === 'p0')!.hp;
      const attHpBefore = state!.players.find((p) => p.id === 'p1')!.hp;
      state = ctrl.processAction({
        type: 'play_card',
        playerId: 'p1',
        card: weapon!,
        targetId: 'p0',
      })!;

      expect(state!.lastHiddenReveal?.cardBaseId).toBe('claymore');
      const defHpAfter = state!.players.find((p) => p.id === 'p0')!.hp;
      const attHpAfter = state!.players.find((p) => p.id === 'p1')!.hp;
      expect(attHpBefore - attHpAfter).toBe(3);
      expect(defHpBefore - defHpAfter).toBeLessThanOrEqual(4); // reduced by 3 from claymore
    });

    it('Protective Bubble negates all damage', () => {
      const ctrl = new GameController();
      let state: GameState | null = null;
      for (let seed = 300; seed < 400; seed++) {
        state = ctrl.processAction({ type: 'start', playerCount: 2, momentumBonus: false, seed })!;
        const p0 = state!.players[0]!;
        const p1 = state!.players[1]!;
        const bubble = findCard(p0.hand, 'protective_bubble');
        const weapon = p1.hand.find((c) => c.type === 'weapon');
        if (bubble && weapon) break;
      }
      expect(state).toBeTruthy();
      const p0 = state!.players[0]!;
      const p1 = state!.players[1]!;
      const bubble = findCard(p0.hand, 'protective_bubble');
      const weapon = p1.hand.find((c) => c.type === 'weapon');
      expect(bubble).toBeTruthy();
      expect(weapon).toBeTruthy();

      state = ctrl.processAction({ type: 'draw', playerId: 'p0' })!;
      state = ctrl.processAction({ type: 'play_hidden', playerId: 'p0', card: bubble! })!;
      state = ctrl.processAction({ type: 'end_turn', playerId: 'p0' })!;
      state = ctrl.processAction({ type: 'draw', playerId: 'p1' })!;

      const defHpBefore = state!.players.find((p) => p.id === 'p0')!.hp;
      state = ctrl.processAction({
        type: 'play_card',
        playerId: 'p1',
        card: weapon!,
        targetId: 'p0',
      })!;

      expect(state!.lastHiddenReveal?.cardBaseId).toBe('protective_bubble');
      const defHpAfter = state!.players.find((p) => p.id === 'p0')!.hp;
      expect(defHpAfter).toBe(defHpBefore);
    });

    it('Spike Trap cancels utility and forces attacker to discard 1', () => {
      const ctrl = new GameController();
      let state: GameState | null = null;
      for (let seed = 500; seed < 600; seed++) {
        state = ctrl.processAction({ type: 'start', playerCount: 2, momentumBonus: false, seed })!;
        const p0 = state!.players[0]!;
        const p1 = state!.players[1]!;
        const spikeTrap = findCard(p0.hand, 'spike_trap');
        const grenade = p1.hand.find((c) => c.id.replace(/_\d+$/, '') === 'grenade');
        if (spikeTrap && grenade) break;
      }
      expect(state).toBeTruthy();
      const p0 = state!.players[0]!;
      const p1 = state!.players[1]!;
      const spikeTrap = findCard(p0.hand, 'spike_trap');
      const grenade = p1.hand.find((c) => c.id.replace(/_\d+$/, '') === 'grenade');
      expect(spikeTrap).toBeTruthy();
      expect(grenade).toBeTruthy();

      state = ctrl.processAction({ type: 'draw', playerId: 'p0' })!;
      state = ctrl.processAction({ type: 'play_hidden', playerId: 'p0', card: spikeTrap! })!;
      state = ctrl.processAction({ type: 'end_turn', playerId: 'p0' })!;
      state = ctrl.processAction({ type: 'draw', playerId: 'p1' })!;

      const targetHpBefore = state!.players.find((p) => p.id === 'p0')!.hp;
      const attackerHandBefore = state!.players.find((p) => p.id === 'p1')!.hand.length;
      state = ctrl.processAction({
        type: 'play_card',
        playerId: 'p1',
        card: grenade!,
        targetId: 'p0',
      })!;

      expect(state!.lastHiddenReveal?.cardBaseId).toBe('spike_trap');
      const targetHpAfter = state!.players.find((p) => p.id === 'p0')!.hp;
      const attackerHandAfter = state!.players.find((p) => p.id === 'p1')!.hand.length;
      expect(targetHpAfter).toBe(targetHpBefore);
      expect(attackerHandBefore - attackerHandAfter).toBe(2); // grenade discarded + 1 forced discard
    });

    it('Magic Mirror redirects damage to attacker', () => {
      const ctrl = new GameController();
      let state: GameState | null = null;
      for (let seed = 400; seed < 500; seed++) {
        state = ctrl.processAction({ type: 'start', playerCount: 2, momentumBonus: false, seed })!;
        const p0 = state!.players[0]!;
        const p1 = state!.players[1]!;
        const mirror = findCard(p0.hand, 'magic_mirror');
        const weapon = p1.hand.find((c) => c.type === 'weapon');
        if (mirror && weapon) break;
      }
      expect(state).toBeTruthy();
      const p0 = state!.players[0]!;
      const p1 = state!.players[1]!;
      const mirror = findCard(p0.hand, 'magic_mirror');
      const weapon = p1.hand.find((c) => c.type === 'weapon');
      expect(mirror).toBeTruthy();
      expect(weapon).toBeTruthy();

      state = ctrl.processAction({ type: 'draw', playerId: 'p0' })!;
      state = ctrl.processAction({ type: 'play_hidden', playerId: 'p0', card: mirror! })!;
      state = ctrl.processAction({ type: 'end_turn', playerId: 'p0' })!;
      state = ctrl.processAction({ type: 'draw', playerId: 'p1' })!;

      const defHpBefore = state!.players.find((p) => p.id === 'p0')!.hp;
      const attHpBefore = state!.players.find((p) => p.id === 'p1')!.hp;
      state = ctrl.processAction({
        type: 'play_card',
        playerId: 'p1',
        card: weapon!,
        targetId: 'p0',
      })!;

      expect(state!.lastHiddenReveal?.cardBaseId).toBe('magic_mirror');
      const defHpAfter = state!.players.find((p) => p.id === 'p0')!.hp;
      const attHpAfter = state!.players.find((p) => p.id === 'p1')!.hp;
      expect(defHpAfter).toBe(defHpBefore);
      expect(attHpBefore - attHpAfter).toBeGreaterThan(0);
    });
  });
});
