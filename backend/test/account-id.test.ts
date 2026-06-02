import { describe, it, expect } from 'vitest';
import { validateAccountId } from '../src/validate.js';

/**
 * B-3 / B-4 / 10.9: accountId is constrained to a single 'default' value
 * (or absent). This pins the validator's behaviour so a future change
 * that loosens the rule — or accidentally allows multi-tenant cross-talk
 * — is caught before it ships.
 */
describe('validateAccountId', () => {
  it('accepts an absent value', () => {
    const check = validateAccountId(undefined);
    expect(check).toEqual({ ok: true, accountId: null });
  });

  it('treats null as absent', () => {
    const check = validateAccountId(null);
    expect(check).toEqual({ ok: true, accountId: null });
  });

  it('treats an empty string as absent', () => {
    const check = validateAccountId('');
    expect(check).toEqual({ ok: true, accountId: null });
  });

  it('treats whitespace-only as absent', () => {
    const check = validateAccountId('   ');
    expect(check).toEqual({ ok: true, accountId: null });
  });

  it("accepts 'default' verbatim", () => {
    const check = validateAccountId('default');
    expect(check).toEqual({ ok: true, accountId: 'default' });
  });

  it("accepts 'default' with surrounding whitespace", () => {
    const check = validateAccountId('  default  ');
    expect(check).toEqual({ ok: true, accountId: 'default' });
  });

  it("rejects any other string", () => {
    const check = validateAccountId('admin');
    expect(check.ok).toBe(false);
    expect(check.accountId).toBeNull();
    expect(check.error).toMatch(/default/);
  });

  it('rejects non-string types', () => {
    expect(validateAccountId(42).ok).toBe(false);
    expect(validateAccountId({ id: 'default' }).ok).toBe(false);
    expect(validateAccountId(['default']).ok).toBe(false);
  });

  it('does not match a partial substring', () => {
    expect(validateAccountId('default-account').ok).toBe(false);
    expect(validateAccountId('xdefault').ok).toBe(false);
  });
});
