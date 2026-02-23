/**
 * Seeded RNG for deterministic game state (PRD §11, FR-12, FR-14)
 * Uses mulberry32 algorithm
 */

/** Generate a random seed for a new game. AI behavior and deck order vary per seed. */
export function generateGameSeed(): number {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] ^ (Date.now() >>> 0);
  }
  return (Date.now() ^ (Math.random() * 0xffffffff)) >>> 0;
}

export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return function (): number {
    state = (state + 0x6d2b79f5) >>> 0; // mulberry32
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type SeededRNG = ReturnType<typeof createSeededRandom>;

/** Fisher-Yates shuffle using seeded RNG */
export function shuffle<T>(array: T[], rng: SeededRNG): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Coin flip: returns true for heads, false for tails */
export function coinFlip(rng: SeededRNG): boolean {
  return rng() >= 0.5;
}
