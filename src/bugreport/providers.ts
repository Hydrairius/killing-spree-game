/**
 * Pluggable bug report providers: local-only (default), HTTP webhook.
 * Secrets via env vars / config — never hardcoded.
 */

import type { BugReport } from './types';
import { saveReport } from './storage';

export interface BugReportProvider {
  name: string;
  send(report: BugReport): Promise<{ success: boolean; error?: string }>;
}

/**
 * Local-only: save to IndexedDB, optional download. Always succeeds for storage.
 */
export const localProvider: BugReportProvider = {
  name: 'local',
  async send(report: BugReport) {
    try {
      await saveReport(report);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
};

/** Default: same-origin API (works when deployed to Cloudflare Pages) */
const DEFAULT_BUGREPORT_API = '/api/bugreports';

/**
 * HTTP POST to webhook URL. Uses VITE_BUGREPORT_WEBHOOK_URL if set,
 * otherwise /api/bugreports (Cloudflare Pages Function).
 * Set to "off" for local-only storage.
 */
export function createWebhookProvider(): BugReportProvider | null {
  const envUrl = import.meta.env.VITE_BUGREPORT_WEBHOOK_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().toLowerCase() === 'off') return null;

  const url =
    envUrl && typeof envUrl === 'string' && envUrl.trim() !== ''
      ? envUrl.trim()
      : DEFAULT_BUGREPORT_API;

  return {
    name: 'webhook',
    async send(report: BugReport) {
      await saveReport(report);
      try {
        const body = JSON.stringify(report);
        const res = await fetch(url.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        });
        if (!res.ok) {
          return { success: false, error: `HTTP ${res.status}` };
        }
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
  };
}

/**
 * Get active provider based on config. Default: local-only.
 */
export function getActiveProvider(): BugReportProvider {
  const webhook = createWebhookProvider();
  return webhook ?? localProvider;
}
