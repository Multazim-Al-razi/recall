import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  validateNewSubscription,
  validateSubscriptionPatch,
  validateAccountPatch,
} from '../src/validate.js';

describe('sanitizeString', () => {
  it('strips angle-bracket markup', () => {
    expect(sanitizeString('<script>alert(1)</script>Netflix')).toBe('alert(1)Netflix');
  });
  it('trims and caps length', () => {
    expect(sanitizeString('  hi  ')).toBe('hi');
    expect(sanitizeString('x'.repeat(50), 10)).toHaveLength(10);
  });
  it('returns empty string for non-strings', () => {
    expect(sanitizeString(42)).toBe('');
    expect(sanitizeString(null)).toBe('');
    expect(sanitizeString(undefined)).toBe('');
  });
});

describe('validateNewSubscription', () => {
  const valid = { name: 'Netflix', amount: 15.99, nextRenewalDate: '2026-01-01' };

  it('accepts a valid payload and applies defaults', () => {
    const { ok, value } = validateNewSubscription(valid);
    expect(ok).toBe(true);
    expect(value.name).toBe('Netflix');
    expect(value.amount).toBe(15.99);
    expect(value.currency).toBe('USD');
    expect(value.billingCycle).toBe('monthly');
    expect(value.category).toBe('other');
    expect(value.status).toBe('active');
  });

  it('requires name, amount, and nextRenewalDate', () => {
    expect(validateNewSubscription({}).ok).toBe(false);
    expect(validateNewSubscription({ name: 'X' }).ok).toBe(false);
    expect(validateNewSubscription({ name: 'X', amount: 5 }).ok).toBe(false);
  });

  it('rejects a non-numeric or out-of-range amount', () => {
    expect(validateNewSubscription({ ...valid, amount: 'free' }).ok).toBe(false);
    expect(validateNewSubscription({ ...valid, amount: -1 }).ok).toBe(false);
    expect(validateNewSubscription({ ...valid, amount: 9_999_999 }).ok).toBe(false);
    expect(validateNewSubscription({ ...valid, amount: NaN }).ok).toBe(false);
  });

  it('rejects an invalid renewal date', () => {
    expect(validateNewSubscription({ ...valid, nextRenewalDate: 'soon' }).ok).toBe(false);
  });

  it('falls back to safe enum values for unknown inputs', () => {
    const { value } = validateNewSubscription({
      ...valid,
      category: 'rocketry',
      billingCycle: 'fortnightly',
      status: 'pending',
    });
    expect(value.category).toBe('other');
    expect(value.billingCycle).toBe('monthly');
    expect(value.status).toBe('active');
  });

  it('strips markup from string fields', () => {
    const { value } = validateNewSubscription({ ...valid, name: '<b>HBO</b>', notes: '<i>note</i>' });
    expect(value.name).toBe('HBO');
    expect(value.notes).toBe('note');
  });

  it('clamps customCycleDays for custom cycles', () => {
    const { value } = validateNewSubscription({ ...valid, billingCycle: 'custom', customCycleDays: 99999 });
    expect(value.customCycleDays).toBe(3650);
  });
});

describe('validateSubscriptionPatch', () => {
  it('returns only provided, valid fields', () => {
    const { ok, value } = validateSubscriptionPatch({ name: 'New Name', unknownField: 'x' });
    expect(ok).toBe(true);
    expect(value).toEqual({ name: 'New Name' });
    expect('unknownField' in value).toBe(false);
  });

  it('rejects an invalid amount in a patch', () => {
    expect(validateSubscriptionPatch({ amount: -5 }).ok).toBe(false);
    expect(validateSubscriptionPatch({ amount: 'lots' }).ok).toBe(false);
  });

  it('rejects an empty name', () => {
    expect(validateSubscriptionPatch({ name: '   ' }).ok).toBe(false);
  });

  it('rejects an invalid date but accepts a valid one', () => {
    expect(validateSubscriptionPatch({ nextRenewalDate: 'nope' }).ok).toBe(false);
    expect(validateSubscriptionPatch({ nextRenewalDate: '2026-02-01' }).ok).toBe(true);
  });
});

describe('validateAccountPatch', () => {
  it('keeps only known fields and sanitizes them', () => {
    const patch = validateAccountPatch({
      name: '<b>Sam</b>',
      email: 'sam@example.com',
      currency: 'eur',
      reminderLeadDays: 7,
      onboarded: true,
      role: 'admin',
    });
    expect(patch.name).toBe('Sam');
    expect(patch.email).toBe('sam@example.com');
    expect(patch.currency).toBe('EUR');
    expect(patch.reminderLeadDays).toBe(7);
    expect(patch.onboarded).toBe(true);
    expect('role' in patch).toBe(false);
  });

  it('clamps reminderLeadDays into range', () => {
    expect(validateAccountPatch({ reminderLeadDays: 9999 }).reminderLeadDays).toBe(365);
    expect(validateAccountPatch({ reminderLeadDays: -5 }).reminderLeadDays).toBe(0);
  });

  it('ignores wrong-typed fields', () => {
    const patch = validateAccountPatch({ onboarded: 'yes', reminderLeadDays: 'three' });
    expect('onboarded' in patch).toBe(false);
    expect('reminderLeadDays' in patch).toBe(false);
  });
});
