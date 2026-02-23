/**
 * Bug report utils: JSON serialization, filename safety, validation
 */
import { describe, it, expect } from 'vitest';
import { generateReportId, safeFilename, validateForm } from './utils';

describe('bugreport utils', () => {
  describe('generateReportId', () => {
    it('returns a non-empty string', () => {
      const id = generateReportId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('returns unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 50; i++) {
        ids.add(generateReportId());
      }
      expect(ids.size).toBe(50);
    });

    it('returns UUID-like format when crypto.randomUUID is available', () => {
      const id = generateReportId();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const fallbackRegex = /^report-\d+-[a-z0-9]+$/;
      expect(uuidRegex.test(id) || fallbackRegex.test(id)).toBe(true);
    });
  });

  describe('safeFilename', () => {
    it('produces safe filenames with prefix, timestamp, and extension', () => {
      const name = safeFilename('bugreport', 'abc-123_x', '.json');
      expect(name.startsWith('bugreport-')).toBe(true);
      expect(name.endsWith('.json')).toBe(true);
      expect(name).not.toMatch(/[/\\:*?"<>|]/);
    });

    it('strips unsafe characters from id', () => {
      const name = safeFilename('log', 'id/with\\bad:chars*?', '.txt');
      expect(name).not.toMatch(/[/\\:*?"<>|]/);
      expect(name.endsWith('.txt')).toBe(true);
    });

    it('handles UUID format (keeps safe chars)', () => {
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const name = safeFilename('screenshot', id, '.png');
      expect(name).toContain('550e8400');
      expect(name.endsWith('.png')).toBe(true);
    });
  });

  describe('validateForm', () => {
    it('rejects empty title', () => {
      const { valid, errors } = validateForm({ title: '', description: 'Some desc' });
      expect(valid).toBe(false);
      expect(errors).toContain('Title is required');
    });

    it('rejects empty description', () => {
      const { valid, errors } = validateForm({ title: 'Bug', description: '' });
      expect(valid).toBe(false);
      expect(errors).toContain('Description is required');
    });

    it('rejects title over 200 chars', () => {
      const { valid, errors } = validateForm({
        title: 'a'.repeat(201),
        description: 'Desc',
      });
      expect(valid).toBe(false);
      expect(errors.some((e) => e.includes('200'))).toBe(true);
    });

    it('rejects description over 10000 chars', () => {
      const { valid, errors } = validateForm({
        title: 'Bug',
        description: 'x'.repeat(10001),
      });
      expect(valid).toBe(false);
      expect(errors.some((e) => e.includes('10,000'))).toBe(true);
    });

    it('accepts valid form', () => {
      const { valid, errors } = validateForm({
        title: 'Valid bug',
        description: 'What happened here.',
      });
      expect(valid).toBe(true);
      expect(errors).toHaveLength(0);
    });

    it('trims whitespace for validation', () => {
      const { valid } = validateForm({
        title: '  Bug  ',
        description: '  Desc  ',
      });
      expect(valid).toBe(true);
    });
  });
});
