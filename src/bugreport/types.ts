/**
 * Bug Report types and enums
 */

export type BugCategory =
  | 'Gameplay'
  | 'UI'
  | 'Audio'
  | 'Visual'
  | 'Performance'
  | 'Network'
  | 'Progression'
  | 'Other';

export type BugSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type ReproRate = 'Always' | 'Often' | 'Sometimes' | 'Once' | 'Unable';

export interface BugReportFormData {
  title: string;
  description: string;
  category: BugCategory;
  severity: BugSeverity;
  reproSteps: string;
  reproRate: ReproRate;
  includeScreenshot: boolean;
  includeLogs: boolean;
  playerContact?: string;
}

export interface BugReportContext {
  buildVersion: string;
  gameVersion: string;
  commitHash?: string;
  platform: string;
  device: string;
  os: string;
  locale: string;
  timezone: string;
  sessionId?: string;
  playerId?: string;
  currentScene: string;
  playerPosition?: { x?: number; y?: number; rotation?: number };
  gameState?: Record<string, unknown>;
  fps?: number;
  memoryMb?: number;
  networkPingMs?: number;
  screenWidth: number;
  screenHeight: number;
  userAgent: string;
}

export interface BugReport {
  id: string;
  createdAt: string;
  title: string;
  description: string;
  reproSteps: string;
  category: BugCategory;
  severity: BugSeverity;
  reproRate: ReproRate;
  buildVersion: string;
  gameVersion: string;
  commitHash?: string;
  platform: string;
  device: string;
  os: string;
  locale: string;
  timezone: string;
  sessionId?: string;
  playerId?: string;
  currentScene: string;
  playerPosition?: { x?: number; y?: number; rotation?: number };
  gameState?: Record<string, unknown>;
  fps?: number;
  memoryMb?: number;
  networkPingMs?: number;
  screenshotPath?: string;
  screenshotDataBase64?: string;
  logPath?: string;
  logContent?: string;
  playerContact?: string;
  extraContext: Record<string, unknown>;
}
