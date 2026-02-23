import { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import type { BugReport, BugCategory, BugSeverity } from './types';
import { getAllReports, getReport, downloadReportJson, downloadReportScreenshot, downloadReportLog } from './storage';
import { safeFilename } from './utils';
import './BugReportsViewer.css';

interface BugReportsViewerProps {
  onClose: () => void;
}

export function BugReportsViewer({ onClose }: BugReportsViewerProps) {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<BugCategory | 'All'>('All');
  const [filterSeverity, setFilterSeverity] = useState<BugSeverity | 'All'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAllReports();
      setReports(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filtered = reports.filter((r) => {
    if (filterCategory !== 'All' && r.category !== filterCategory) return false;
    if (filterSeverity !== 'All' && r.severity !== filterSeverity) return false;
    return true;
  });

  const selectedReport = selectedId ? reports.find((r) => r.id === selectedId) : null;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyReportId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
    } catch {
      // fallback
    }
  };

  const exportZip = async () => {
    if (selectedIds.size === 0) return;
    try {
      const zip = new JSZip();
      for (const id of selectedIds) {
        const r = await getReport(id);
        if (!r) continue;
        const { screenshotDataBase64, screenshotPath, ...exportReport } = r;
        zip.file(safeFilename('bugreport', id, '.json'), JSON.stringify(exportReport, null, 2));
        if (r.logContent) {
          zip.file(safeFilename('log', id, '.txt'), r.logContent);
        }
        if (r.screenshotDataBase64) {
          const base64 = r.screenshotDataBase64.replace(/^data:image\/\w+;base64,/, '');
          zip.file(safeFilename('screenshot', id, '.png'), base64, { base64: true });
        }
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `bug-reports-${new Date().toISOString().slice(0, 10)}.zip`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.warn('[BugReportsViewer] Export failed:', err);
    }
  };

  return (
    <div className="bugviewer-overlay" onClick={onClose}>
      <div className="bugviewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="bugviewer-header">
          <h2>Bug Reports</h2>
          <button type="button" className="bugviewer-close" onClick={onClose}>×</button>
        </div>

        <div className="bugviewer-toolbar">
          <div className="bugviewer-filters">
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value as BugCategory | 'All')}>
              <option value="All">All categories</option>
              <option value="Gameplay">Gameplay</option>
              <option value="UI">UI</option>
              <option value="Audio">Audio</option>
              <option value="Visual">Visual</option>
              <option value="Performance">Performance</option>
              <option value="Network">Network</option>
              <option value="Progression">Progression</option>
              <option value="Other">Other</option>
            </select>
            <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value as BugSeverity | 'All')}>
              <option value="All">All severities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="bugviewer-actions">
            <button type="button" onClick={loadReports}>Refresh</button>
            <button type="button" onClick={exportZip} disabled={selectedIds.size === 0}>
              Export {selectedIds.size > 0 ? `(${selectedIds.size})` : ''} as ZIP
            </button>
          </div>
        </div>

        <div className="bugviewer-body">
          <div className="bugviewer-list">
            {loading ? (
              <div className="bugviewer-loading">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="bugviewer-empty">No reports</div>
            ) : (
              filtered.map((r) => (
                <div
                  key={r.id}
                  className={`bugviewer-item ${selectedId === r.id ? 'selected' : ''}`}
                  onClick={() => setSelectedId(r.id)}
                >
                  <label className="bugviewer-select" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(r.id)}
                      onChange={() => toggleSelect(r.id)}
                    />
                  </label>
                  <div className="bugviewer-item-content">
                    <span className="bugviewer-item-title">{r.title}</span>
                    <span className="bugviewer-item-meta">
                      {r.severity} · {r.category} · {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bugviewer-detail">
            {selectedReport ? (
              <>
                <div className="bugviewer-detail-header">
                  <h3>{selectedReport.title}</h3>
                  <div className="bugviewer-detail-actions">
                    <button type="button" onClick={() => copyReportId(selectedReport.id)}>Copy ID</button>
                    <button type="button" onClick={() => downloadReportJson(selectedReport)}>Download JSON</button>
                    <button type="button" onClick={() => downloadReportScreenshot(selectedReport)}>Screenshot</button>
                    <button type="button" onClick={() => downloadReportLog(selectedReport)}>Log</button>
                  </div>
                </div>
                <div className="bugviewer-detail-content">
                  <p><strong>Description:</strong> {selectedReport.description}</p>
                  <p><strong>Repro:</strong> {selectedReport.reproSteps || '—'}</p>
                  <p><strong>Severity:</strong> {selectedReport.severity} · <strong>Category:</strong> {selectedReport.category} · <strong>Repro rate:</strong> {selectedReport.reproRate}</p>
                  <p><strong>Context:</strong> {selectedReport.currentScene} · v{selectedReport.buildVersion} · {selectedReport.platform}</p>
                  {selectedReport.screenshotDataBase64 && (
                    <div className="bugviewer-screenshot-preview">
                      <img src={selectedReport.screenshotDataBase64} alt="Screenshot" />
                    </div>
                  )}
                  <pre className="bugviewer-json">
                    {JSON.stringify(
                      { ...selectedReport, screenshotDataBase64: selectedReport.screenshotDataBase64 ? '[base64 omitted]' : undefined },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </>
            ) : (
              <div className="bugviewer-detail-empty">Select a report</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
