/**
 * Global log buffer for bug reports. Captures last N lines for attachment.
 * GameBoard's addLog should also push to this buffer.
 */

const MAX_LINES = 1000;
const MAX_BYTES = 3 * 1024 * 1024; // ~3 MB

interface LogEntry {
  time: string;
  msg: string;
  tag?: string;
}

const buffer: LogEntry[] = [];
let totalBytes = 0;

export function bugReportLogPush(msg: string, tag?: string): void {
  try {
    const time = new Date().toISOString();
    const line = `[${time}] ${tag ? `[${tag}] ` : ''}${msg}\n`;
    const lineBytes = new Blob([line]).size;

    buffer.push({ time, msg, tag });
    totalBytes += lineBytes;

    while (buffer.length > MAX_LINES || totalBytes > MAX_BYTES) {
      const removed = buffer.shift();
      if (removed) {
        const removedLine = `[${removed.time}] ${removed.tag ? `[${removed.tag}] ` : ''}${removed.msg}\n`;
        totalBytes -= new Blob([removedLine]).size;
      }
    }
  } catch {
    // Never crash
  }
}

export function bugReportLogGetRecent(): string {
  try {
    return buffer
      .map((e) => `[${e.time}] ${e.tag ? `[${e.tag}] ` : ''}${e.msg}`)
      .join('\n');
  } catch {
    return '';
  }
}

export function bugReportLogClear(): void {
  buffer.length = 0;
  totalBytes = 0;
}
