import { useState, useCallback } from 'react';
import type { BugReportFormData, BugCategory, BugSeverity, ReproRate } from './types';
import { submitBugReport } from './submit';
import { Toast } from './Toast';
import './BugReportModal.css';

const CATEGORIES: BugCategory[] = [
  'Gameplay',
  'UI',
  'Audio',
  'Visual',
  'Performance',
  'Network',
  'Progression',
  'Other',
];

const SEVERITIES: BugSeverity[] = ['Low', 'Medium', 'High', 'Critical'];

const REPRO_RATES: ReproRate[] = ['Always', 'Often', 'Sometimes', 'Once', 'Unable'];

interface BugReportModalProps {
  onClose: () => void;
  gameState?: Record<string, unknown>;
}

export function BugReportModal({ onClose, gameState }: BugReportModalProps) {
  const [form, setForm] = useState<BugReportFormData>({
    title: '',
    description: '',
    category: 'Other',
    severity: 'Medium',
    reproSteps: '',
    reproRate: 'Sometimes',
    includeScreenshot: true,
    includeLogs: true,
    playerContact: '',
  });
  const [showContact, setShowContact] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const update = useCallback(<K extends keyof BugReportFormData>(k: K, v: BugReportFormData[K]) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitBugReport(form, gameState);
      if (result.success && result.reportId) {
        setToast({
          message: `Report saved! ID: ${result.reportId}. Stored locally (IndexedDB). Use the Bug Reports viewer to export.`,
          variant: 'success',
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setSubmitError(result.error ?? 'Failed to submit');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [form, gameState, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  return (
    <>
      <div className="bugreport-overlay" onClick={onClose} onKeyDown={handleKeyDown} role="dialog" aria-labelledby="bugreport-title">
        <div className="bugreport-modal" onClick={(e) => e.stopPropagation()}>
          <h2 id="bugreport-title" className="bugreport-title">Report Bug</h2>

          <div className="bugreport-form">
            <div className="bugreport-field">
              <label htmlFor="br-title">Title <span className="required">*</span></label>
              <input
                id="br-title"
                type="text"
                placeholder="Short summary of the bug"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                maxLength={200}
              />
              {submitError && submitError.includes('Title') && (
                <span className="bugreport-error">{submitError}</span>
              )}
            </div>

            <div className="bugreport-field">
              <label htmlFor="br-desc">Description <span className="required">*</span></label>
              <textarea
                id="br-desc"
                placeholder="Detailed description of what happened"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={4}
                maxLength={10000}
              />
              {submitError && submitError.includes('Description') && (
                <span className="bugreport-error">{submitError}</span>
              )}
            </div>

            <div className="bugreport-row">
              <div className="bugreport-field">
                <label htmlFor="br-category">Category</label>
                <select
                  id="br-category"
                  value={form.category}
                  onChange={(e) => update('category', e.target.value as BugCategory)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="bugreport-field">
                <label htmlFor="br-severity">Severity</label>
                <select
                  id="br-severity"
                  value={form.severity}
                  onChange={(e) => update('severity', e.target.value as BugSeverity)}
                >
                  {SEVERITIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="bugreport-field">
                <label htmlFor="br-repro">Repro rate</label>
                <select
                  id="br-repro"
                  value={form.reproRate}
                  onChange={(e) => update('reproRate', e.target.value as ReproRate)}
                >
                  {REPRO_RATES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bugreport-field">
              <label htmlFor="br-steps">Reproduction steps</label>
              <textarea
                id="br-steps"
                placeholder="Steps to reproduce (if known)"
                value={form.reproSteps}
                onChange={(e) => update('reproSteps', e.target.value)}
                rows={3}
              />
            </div>

            <div className="bugreport-checkboxes">
              <label className="bugreport-check">
                <input
                  type="checkbox"
                  checked={form.includeScreenshot}
                  onChange={(e) => update('includeScreenshot', e.target.checked)}
                />
                Include screenshot
              </label>
              <label className="bugreport-check">
                <input
                  type="checkbox"
                  checked={form.includeLogs}
                  onChange={(e) => update('includeLogs', e.target.checked)}
                />
                Include logs
              </label>
              <label className="bugreport-check">
                <input
                  type="checkbox"
                  checked={showContact}
                  onChange={(e) => setShowContact(e.target.checked)}
                />
                Include contact (email/Discord)
              </label>
            </div>

            {showContact && (
              <div className="bugreport-field">
                <label htmlFor="br-contact">Email or Discord</label>
                <input
                  id="br-contact"
                  type="text"
                  placeholder="optional@example.com or username#1234"
                  value={form.playerContact ?? ''}
                  onChange={(e) => update('playerContact', e.target.value)}
                />
              </div>
            )}

            {submitError && !submitError.includes('Title') && !submitError.includes('Description') && (
              <div className="bugreport-error-block">{submitError}</div>
            )}

            <div className="bugreport-actions">
              <button type="button" className="bugreport-btn bugreport-btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                className="bugreport-btn bugreport-btn-primary"
                onClick={handleSubmit}
                disabled={isSubmitting || !form.title.trim() || !form.description.trim()}
              >
                {isSubmitting ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
