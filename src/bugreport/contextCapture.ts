/**
 * Captures automatic context for bug reports: platform, device, performance, game state.
 */

import type { BugReportContext } from './types';

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? '0.1.0';
const COMMIT_HASH = import.meta.env.VITE_COMMIT_HASH;

let lastFps = 0;
let fpsFrameCount = 0;
let fpsLastTime = performance.now();

let sessionId: string | undefined;
function getOrCreateSessionId(): string | undefined {
  if (!sessionId && typeof crypto?.randomUUID === 'function') {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

export function startFpsTracker(): void {
  function tick(): void {
    fpsFrameCount++;
    const now = performance.now();
    const elapsed = now - fpsLastTime;
    if (elapsed >= 1000) {
      lastFps = Math.round((fpsFrameCount * 1000) / elapsed);
      fpsFrameCount = 0;
      fpsLastTime = now;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

export function captureContext(gameState?: Record<string, unknown>): BugReportContext {
  const nav = typeof navigator !== 'undefined' ? navigator : ({} as Navigator);
  const navExt = nav as Navigator & { userAgentData?: { platform: string } };
  const scr = typeof screen !== 'undefined' ? screen : ({} as Screen);

  let memoryMb: number | undefined;
  if ('memory' in performance && typeof (performance as Performance & { memory?: { usedJSHeapSize?: number } }).memory === 'object') {
    const mem = (performance as Performance & { memory: { usedJSHeapSize: number } }).memory;
    memoryMb = Math.round(mem.usedJSHeapSize / (1024 * 1024));
  }

  return {
    buildVersion: APP_VERSION,
    gameVersion: APP_VERSION,
    commitHash: COMMIT_HASH,
    platform: 'web',
    device: navExt.userAgentData?.platform ?? nav.platform ?? 'unknown',
    os: navExt.userAgentData?.platform ?? nav.platform ?? 'unknown',
    locale: nav.language ?? 'unknown',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'unknown',
    sessionId: getOrCreateSessionId(),
    currentScene: gameState ? 'game' : 'lobby',
    gameState: gameState ? sanitizeGameState(gameState) : undefined,
    fps: lastFps || undefined,
    memoryMb,
    screenWidth: scr.width ?? 0,
    screenHeight: scr.height ?? 0,
    userAgent: nav.userAgent ?? '',
  };
}

function sanitizeGameState(g: Record<string, unknown>): Record<string, unknown> {
  try {
    const out: Record<string, unknown> = {};
    const keys = ['roundNumber', 'phase', 'currentPlayerIndex', 'winnerId', 'winnerReason'];
    for (const k of keys) {
      if (k in g) out[k] = g[k];
    }
    if (g.players && Array.isArray(g.players)) {
      out.players = (g.players as Record<string, unknown>[]).map((p) => ({
        id: p.id,
        name: p.name,
        hp: p.hp,
        maxHp: p.maxHp,
        isEliminated: p.isEliminated,
        handCount: Array.isArray(p.hand) ? (p.hand as unknown[]).length : 0,
      }));
    }
    return out;
  } catch {
    return {};
  }
}
