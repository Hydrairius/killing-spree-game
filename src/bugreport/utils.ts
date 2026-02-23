/**
 * Utility functions for bug reports: UUID, filename safety, validation.
 */

export function generateReportId(): string {
  return crypto.randomUUID?.() ?? `report-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Make a safe filename (alphanumeric, hyphen, underscore only).
 */
export function safeFilename(prefix: string, id: string, ext: string): string {
  const safeId = id.replace(/[^a-zA-Z0-9-_]/g, '');
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${prefix}-${ts}-${safeId}${ext}`;
}

export function validateForm(data: { title: string; description: string }): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const t = (data.title ?? '').trim();
  const d = (data.description ?? '').trim();
  if (!t) errors.push('Title is required');
  if (t.length > 200) errors.push('Title must be 200 characters or less');
  if (!d) errors.push('Description is required');
  if (d.length > 10000) errors.push('Description must be 10,000 characters or less');
  return { valid: errors.length === 0, errors };
}
