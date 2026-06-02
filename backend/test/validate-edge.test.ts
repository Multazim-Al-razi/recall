import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  validateNewSubscription,
  validateSubscriptionPatch,
  validateAccountPatch,
} from '../src/validate.js';

/**
 * Edge-case coverage that complements validate.test.ts. Focused on boundary
 * conditions, clamping, defaulting, and the "untrusted input" guarantees the
 * write endpoints depend on.
 */

const validSub = { name: 'Netflix', amount: 15.99, nextRenewalDate: '2026-01-01' };

describe('sanitizeString — boundaries', () => {
  it('caps at exactly maxLen characters', () => {
    expect(sanitizeString('abcdefghij', 5)).toBe('abcde');
  });

  it('strips nested/partial markup and keeps surrounding text', () => {
    expect(sanitizeString('Hi <b><i>there</i></b>!')).toBe('Hi there!');
  });

  it('trims after stripping markup', () => {
    expect(sanitizeString('  <span>  spaced</span>  ')).toBe('spaced');
  });

  it('handles an empty string', () => {
    expect(sanitizeString('')).toBe('');
  });

  it('rejects array and object inputs', () => {
    expect(sanitizeString([1, 2, 3])).toBe('');
    expect(sanitizeString({ a: 1 })).toBe('');
  });
});

describe('validateNewSubscription — numeric boundaries', () => {
  it('accepts amount at the lower bound (0)', () => {
    expect(validateNewSubscription({ ...validSub, amount: 0 }).ok).toBe(true);
  });

  it('accepts amount at the exact upper bound (1,000,000)', () => {
    expect(validateNewSubscription({ ...validSub, amount: 1_000_000 }).ok).toBe(true);
  });

  it('rejects amount just above the upper bound', () => {
    expect(validateNewSubscription({ ...validSub, amount: 1_000_000.01 }).ok).toBe(false);
  });

  it('rejects Infinity as an amount', () => {
    expect(validateNewSubscription({ ...validSub, amount: Infinity }).ok).toBe(false);
  });

  it('defaults customCycleDays to 30 for a custom cycle without a value', () => {
    const { value } = validateNewSubscription({ ...validSub, billingCycle: 'custom' });
    expect(value.customCycleDays).toBe(30);
  });

  it('clamps customCycleDays to a minimum of 1', () => {
    const { value } = validateNewSubscription({ ...validSub, billingCycle: 'custom', customCycleDays: 0 });
    expect(value.customCycleDays).toBe(1);
  });

  it('rounds a fractional customCycleDays', () => {
    const { value } = validateNewSubscription({ ...validSub, billingCycle: 'custom', customCycleDays: 14.7 });
    expect(value.customCycleDays).toBe(15);
  });

  it('omits customCycleDays entirely for non-custom cycles', () => {
    const { value } = validateNewSubscription({ ...validSub, billingCycle: 'monthly', customCycleDays: 99 });
    expect(value.customCycleDays).toBeUndefined();
  });

  it('clamps reminderDaysBefore into [0, 365] and rounds it', () => {
    expect(validateNewSubscription({ ...validSub, reminderDaysBefore: -10 }).value.reminderDaysBefore).toBe(0);
    expect(validateNewSubscription({ ...validSub, reminderDaysBefore: 9999 }).value.reminderDaysBefore).toBe(365);
    expect(validateNewSubscription({ ...validSub, reminderDaysBefore: 3.6 }).value.reminderDaysBefore).toBe(4);
  });

  it('defaults reminderDaysBefore to 3 when missing or non-numeric', () => {
    expect(validateNewSubscription(validSub).value.reminderDaysBefore).toBe(3);
    expect(validateNewSubscription({ ...validSub, reminderDaysBefore: 'soon' }).value.reminderDaysBefore).toBe(3);
  });
});

describe('validateNewSubscription — defaults & coercion', () => {
  it('uppercases and caps the currency, defaulting to USD', () => {
    expect(validateNewSubscription({ ...validSub, currency: 'eur' }).value.currency).toBe('EUR');
    expect(validateNewSubscription({ ...validSub, currency: '' }).value.currency).toBe('USD');
  });

  it('defaults startDate to today when omitted', () => {
    const { value } = validateNewSubscription(validSub);
    expect(value.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('defaults autoReminder to true and isFreeTrial to false', () => {
    const { value } = validateNewSubscription(validSub);
    expect(value.autoReminder).toBe(true);
    expect(value.isFreeTrial).toBe(false);
  });

  it('respects explicit boolean flags', () => {
    const { value } = validateNewSubscription({ ...validSub, autoReminder: false, isFreeTrial: true });
    expect(value.autoReminder).toBe(false);
    expect(value.isFreeTrial).toBe(true);
  });

  it('drops an invalid trialEndDate to undefined', () => {
    const { value } = validateNewSubscription({ ...validSub, trialEndDate: 'not-a-date' });
    expect(value.trialEndDate).toBeUndefined();
  });

  it('keeps a valid trialEndDate', () => {
    const { value } = validateNewSubscription({ ...validSub, trialEndDate: '2026-02-15' });
    expect(value.trialEndDate).toBe('2026-02-15');
  });

  it('treats a null body as fully invalid rather than throwing', () => {
    const result = validateNewSubscription(null);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('collects multiple errors at once', () => {
    const result = validateNewSubscription({ amount: -1 });
    expect(result.errors.length).toBeGreaterThanOrEqual(2); // name + date missing, amount bad
  });
});

describe('validateSubscriptionPatch — partial semantics', () => {
  it('returns an empty patch for an empty body', () => {
    const { ok, value } = validateSubscriptionPatch({});
    expect(ok).toBe(true);
    expect(value).toEqual({});
  });

  it('accepts amount at the boundaries', () => {
    expect(validateSubscriptionPatch({ amount: 0 }).ok).toBe(true);
    expect(validateSubscriptionPatch({ amount: 1_000_000 }).ok).toBe(true);
    expect(validateSubscriptionPatch({ amount: 1_000_001 }).ok).toBe(false);
  });

  it('clamps customCycleDays when present', () => {
    expect(validateSubscriptionPatch({ customCycleDays: 99999 }).value.customCycleDays).toBe(3650);
    expect(validateSubscriptionPatch({ customCycleDays: -3 }).value.customCycleDays).toBe(1);
  });

  it('ignores a non-numeric customCycleDays without erroring', () => {
    const { ok, value } = validateSubscriptionPatch({ customCycleDays: 'lots' });
    expect(ok).toBe(true);
    expect('customCycleDays' in value).toBe(false);
  });

  it('clears trialEndDate to undefined when given an invalid date', () => {
    const { ok, value } = validateSubscriptionPatch({ trialEndDate: 'bad' });
    expect(ok).toBe(true);
    expect(value.trialEndDate).toBeUndefined();
  });

  it('normalizes currency casing in a patch', () => {
    expect(validateSubscriptionPatch({ currency: 'gbp' }).value.currency).toBe('GBP');
  });

  it('coerces unknown enum values to safe defaults', () => {
    const { value } = validateSubscriptionPatch({ category: 'space', status: 'frozen', billingCycle: 'daily' });
    expect(value.category).toBe('other');
    expect(value.status).toBe('active');
    expect(value.billingCycle).toBe('monthly');
  });
});

describe('validateAccountPatch — boundaries & caps', () => {
  it('returns an empty patch for an empty body', () => {
    expect(validateAccountPatch({})).toEqual({});
  });

  it('drops an oversized avatar string (cap is 8_000 chars)', () => {
    // An https URL longer than 8_000 chars is rejected.
    const huge = 'https://example.com/' + 'a'.repeat(8_000);
    const patch = validateAccountPatch({ avatar: huge });
    expect(patch.avatar).toBeUndefined();
  });

  it('accepts reminderLeadDays at both boundaries', () => {
    expect(validateAccountPatch({ reminderLeadDays: 0 }).reminderLeadDays).toBe(0);
    expect(validateAccountPatch({ reminderLeadDays: 365 }).reminderLeadDays).toBe(365);
  });

  it('strips markup from the name', () => {
    expect(validateAccountPatch({ name: '<script>x</script>Sam' }).name).toBe('xSam');
  });

  it('treats a null body safely', () => {
    expect(validateAccountPatch(null)).toEqual({});
  });
});
