/**
 * Bug report storage: IndexedDB persistence + file download.
 * In browser we can't write to disk; we store in IndexedDB and offer download.
 */

import type { BugReport } from './types';
import { safeFilename } from './utils';

const DB_NAME = 'KillingSpreeBugReports';
const DB_VERSION = 1;
const STORE_NAME = 'reports';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve(req.result);
        req.onupgradeneeded = (e) => {
          const db = (e.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  }
  return dbPromise;
}

export async function saveReport(report: BugReport): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(report);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[BugReport] Failed to save:', err);
  }
}

export async function getAllReports(): Promise<BugReport[]> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const list = (req.result ?? []) as BugReport[];
        list.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
        resolve(list);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[BugReport] Failed to load:', err);
    return [];
  }
}

export async function getReport(id: string): Promise<BugReport | null> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[BugReport] Failed to get report:', err);
    return null;
  }
}

export async function deleteReport(id: string): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[BugReport] Failed to delete:', err);
  }
}

/**
 * Download report JSON file
 */
export function downloadReportJson(report: BugReport): void {
  try {
    const { screenshotDataBase64, ...exportReport } = report;
    const blob = new Blob([JSON.stringify(exportReport, null, 2)], { type: 'application/json' });
    const name = safeFilename('BugReports/bugreport', report.id, '.json');
    downloadBlob(blob, name);
  } catch (err) {
    console.warn('[BugReport] Failed to download JSON:', err);
  }
}

/**
 * Download screenshot as PNG
 */
export function downloadReportScreenshot(report: BugReport): void {
  try {
    const data = report.screenshotDataBase64 ?? report.screenshotPath;
    if (!data) return;
    const base64 = typeof data === 'string' && data.startsWith('data:') ? data : `data:image/png;base64,${data}`;
    fetch(base64)
      .then((r) => r.blob())
      .then((blob) => {
        const name = safeFilename('BugReports/screenshot', report.id, '.png');
        downloadBlob(blob, name);
      })
      .catch((err) => console.warn('[BugReport] Screenshot download failed:', err));
  } catch (err) {
    console.warn('[BugReport] Screenshot download failed:', err);
  }
}

/**
 * Download log file
 */
export function downloadReportLog(report: BugReport): void {
  try {
    const content = report.logContent ?? 'No log content captured.';
    const blob = new Blob([content], { type: 'text/plain' });
    const name = safeFilename('BugReports/log', report.id, '.txt');
    downloadBlob(blob, name);
  } catch (err) {
    console.warn('[BugReport] Log download failed:', err);
  }
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
