import { describe, it, expect } from 'vitest';
import { sanitizeAvatar, AVATAR_MAX_LEN, validateAccountPatch } from '../src/validate.js';

/**
 * B-7: avatar inputs are restricted to a tight allowlist to prevent
 * stored XSS (`javascript:`, `data:text/html`) and to keep the per-row
 * payload bounded.
 */
describe('sanitizeAvatar — scheme allowlist (B-7)', () => {
  it('accepts a valid https URL', () => {
    expect(sanitizeAvatar('https://example.com/me.png')).toBe(
      'https://example.com/me.png',
    );
  });

  it('rejects an http URL (https only)', () => {
    expect(sanitizeAvatar('http://example.com/me.png')).toBeUndefined();
  });

  it('accepts a data:image/png base64 URI', () => {
    const png = 'data:image/png;base64,iVBORw0KGgo=';
    expect(sanitizeAvatar(png)).toBe(png);
  });

  it('accepts a data:image/jpeg base64 URI', () => {
    const jpg = 'data:image/jpeg;base64,/9j/4AAQ';
    expect(sanitizeAvatar(jpg)).toBe(jpg);
  });

  it('accepts a data:image/webp base64 URI', () => {
    const webp = 'data:image/webp;base64,UklGRg==';
    expect(sanitizeAvatar(webp)).toBe(webp);
  });

  it('rejects a data:image/gif URI (gif not in allowlist)', () => {
    expect(
      sanitizeAvatar('data:image/gif;base64,R0lGODlh'),
    ).toBeUndefined();
  });

  it('rejects a data:text/html URI (XSS vector)', () => {
    expect(
      sanitizeAvatar('data:text/html,<script>alert(1)</script>'),
    ).toBeUndefined();
  });

  it('rejects a data:image/png URI without a base64 encoding', () => {
    expect(sanitizeAvatar('data:image/png;utf8,hello')).toBeUndefined();
  });

  it('rejects a data:image/png URI whose payload is not valid base64', () => {
    expect(
      sanitizeAvatar('data:image/png;base64,not*valid*base64!'),
    ).toBeUndefined();
  });

  it('rejects a javascript: URI', () => {
    expect(sanitizeAvatar('javascript:alert(1)')).toBeUndefined();
  });

  it('rejects a file:// URI', () => {
    expect(sanitizeAvatar('file:///etc/passwd')).toBeUndefined();
  });

  it('rejects an arbitrary string', () => {
    expect(sanitizeAvatar('not a url at all')).toBeUndefined();
  });

  it('rejects non-string inputs', () => {
    expect(sanitizeAvatar(undefined)).toBeUndefined();
    expect(sanitizeAvatar(null)).toBeUndefined();
    expect(sanitizeAvatar(42)).toBeUndefined();
    expect(sanitizeAvatar({ url: 'https://x' })).toBeUndefined();
    expect(sanitizeAvatar(['https://x'])).toBeUndefined();
  });

  it('returns an empty string for an explicit empty/whitespace input', () => {
    expect(sanitizeAvatar('')).toBe('');
    expect(sanitizeAvatar('   ')).toBe('');
  });

  it('caps the avatar length and rejects oversized payloads', () => {
    const big = 'https://example.com/' + 'a'.repeat(AVATAR_MAX_LEN);
    expect(sanitizeAvatar(big)).toBeUndefined();
  });

  it('accepts a payload exactly at the cap', () => {
    const small = 'https://example.com/' + 'a'.repeat(AVATAR_MAX_LEN - 19);
    expect(small.length).toBe(AVATAR_MAX_LEN);
    expect(sanitizeAvatar(small)).toBe(small);
  });

  it('trims surrounding whitespace before checking', () => {
    expect(sanitizeAvatar('  https://example.com/me.png  ')).toBe(
      'https://example.com/me.png',
    );
  });
});

describe('validateAccountPatch — avatar integration (B-7)', () => {
  it('persists a valid https avatar', () => {
    const patch = validateAccountPatch({ avatar: 'https://example.com/me.png' });
    expect(patch.avatar).toBe('https://example.com/me.png');
  });

  it('drops an http avatar', () => {
    const patch = validateAccountPatch({ avatar: 'http://example.com/me.png' });
    expect('avatar' in patch).toBe(true);
    expect(patch.avatar).toBeUndefined();
  });

  it('drops a data:text/html avatar', () => {
    const patch = validateAccountPatch({
      avatar: 'data:text/html,<script>alert(1)</script>',
    });
    expect('avatar' in patch).toBe(true);
    expect(patch.avatar).toBeUndefined();
  });

  it('allows an empty string to clear the avatar', () => {
    const patch = validateAccountPatch({ avatar: '' });
    expect(patch.avatar).toBe('');
  });
});
