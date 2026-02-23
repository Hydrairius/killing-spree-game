/**
 * Bug report schema: JSON serialization round-trip
 */
import { describe, it, expect } from 'vitest';
import type { BugReport } from './types';

describe('BugReport schema', () => {
  it('serializes to valid JSON and parses back', () => {
    const report: BugReport = {
      id: 'test-uuid-123',
      createdAt: '2025-02-23T12:00:00.000Z',
      title: 'Test bug',
      description: 'What happened',
      reproSteps: '1. Do X\n2. See Y',
      category: 'Gameplay',
      severity: 'Medium',
      reproRate: 'Often',
      buildVersion: '0.1.0',
      gameVersion: '0.1.0',
      platform: 'web',
      device: 'Desktop',
      os: 'Windows',
      locale: 'en-US',
      timezone: 'America/New_York',
      currentScene: 'game',
      screenWidth: 1920,
      screenHeight: 1080,
      userAgent: 'Mozilla/5.0',
      extraContext: {},
    };

    const json = JSON.stringify(report);
    const parsed = JSON.parse(json) as BugReport;

    expect(parsed.id).toBe(report.id);
    expect(parsed.title).toBe(report.title);
    expect(parsed.category).toBe(report.category);
    expect(parsed.severity).toBe(report.severity);
    expect(parsed.extraContext).toEqual({});
  });

  it('handles optional fields as undefined', () => {
    const minimal: Partial<BugReport> = {
      id: 'x',
      createdAt: new Date().toISOString(),
      title: 'T',
      description: 'D',
      category: 'Other',
      severity: 'Low',
      reproRate: 'Once',
      buildVersion: '0.1.0',
      platform: 'web',
      device: 'x',
      os: 'x',
      locale: 'en',
      timezone: 'UTC',
      currentScene: 'lobby',
      screenWidth: 0,
      screenHeight: 0,
      userAgent: '',
      extraContext: {},
    };

    const json = JSON.stringify(minimal);
    expect(() => JSON.parse(json)).not.toThrow();
  });
});
