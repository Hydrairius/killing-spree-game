/**
 * Bug report submission: validation, rate limit, context capture, provider send.
 */

import type { BugReport, BugReportFormData } from './types';
import { generateReportId } from './utils';
import { validateForm } from './utils';
import { captureContext } from './contextCapture';
import { bugReportLogGetRecent } from './logBuffer';
import { captureScreenshot } from './screenshot';
import { getActiveProvider } from './providers';

const RATE_LIMIT_MS = 10_000;
let lastSubmitTime = 0;

export interface SubmitResult {
  success: boolean;
  reportId?: string;
  error?: string;
}

export async function submitBugReport(
  form: BugReportFormData,
  gameState?: Record<string, unknown>
): Promise<SubmitResult> {
  try {
    const { valid, errors } = validateForm(form);
    if (!valid) {
      return { success: false, error: errors.join('. ') };
    }

    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) {
      return {
        success: false,
        error: `Please wait ${Math.ceil((RATE_LIMIT_MS - (now - lastSubmitTime)) / 1000)} seconds before submitting again.`,
      };
    }

    const id = generateReportId();
    const ctx = captureContext(gameState);

    let screenshotDataBase64: string | null = null;
    if (form.includeScreenshot) {
      try {
        screenshotDataBase64 = await captureScreenshot();
      } catch (err) {
        // Continue without screenshot; note in extraContext
      }
    }

    let logContent: string | undefined;
    if (form.includeLogs) {
      logContent = bugReportLogGetRecent() || undefined;
    }

    const report: BugReport = {
      id,
      createdAt: new Date().toISOString(),
      title: form.title.trim(),
      description: form.description.trim(),
      reproSteps: form.reproSteps.trim(),
      category: form.category,
      severity: form.severity,
      reproRate: form.reproRate,
      buildVersion: ctx.buildVersion,
      gameVersion: ctx.gameVersion,
      commitHash: ctx.commitHash,
      platform: ctx.platform,
      device: ctx.device,
      os: ctx.os,
      locale: ctx.locale,
      timezone: ctx.timezone,
      sessionId: ctx.sessionId,
      playerId: ctx.playerId,
      currentScene: ctx.currentScene,
      playerPosition: ctx.playerPosition,
      gameState: ctx.gameState,
      fps: ctx.fps,
      memoryMb: ctx.memoryMb,
      networkPingMs: ctx.networkPingMs,
      screenshotDataBase64: screenshotDataBase64 ?? undefined,
      logContent,
      playerContact: form.playerContact?.trim() || undefined,
      extraContext: {
        screenshotFailed: form.includeScreenshot && !screenshotDataBase64,
        ...(ctx.sessionId ? { sessionId: ctx.sessionId } : {}),
      },
    };

    const provider = getActiveProvider();
    const sendResult = await provider.send(report);

    if (sendResult.success) {
      lastSubmitTime = now;
      return { success: true, reportId: id };
    }
    return {
      success: false,
      reportId: id,
      error: sendResult.error ?? 'Failed to submit report',
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
