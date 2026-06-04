/**
 * Input validation + sanitization for the API surface.
 *
 * Every write endpoint runs untrusted JSON through these helpers before it
 * touches the database, so malformed types, out-of-range numbers, unknown
 * enum values, and embedded markup never get persisted. Keeping this in one
 * module means the frontend contract (see frontend/src/types/subscription.ts)
 * has a single server-side mirror.
 */
import type { SubscriptionRecord, AccountRecord } from './db.js';

const CATEGORIES = [
  'entertainment', 'productivity', 'fitness', 'music',
  'cloud', 'news', 'food', 'other',
] as const;

const BILLING_CYCLES = ['monthly', 'yearly', 'weekly', 'custom'] as const;
const STATUSES = ['active', 'paused', 'cancelled'] as const;
const CANCELLATION_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

/** Maximum length for avatar URLs / data URIs. */
export const AVATAR_MAX_LEN = 8_000;

const ALLOWED_DATA_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

/**
 * Sanitize an avatar URL or data URI.
 *
 * Accepts: https URLs, data:image/(png|jpeg|webp);base64,... URIs,
 * empty strings (to clear the avatar). Everything else is rejected
 * (http, javascript:, file:, data:text/html, arbitrary strings, non-strings).
 * Returns the cleaned value or undefined if invalid.
 */
export function sanitizeAvatar(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (trimmed === '') return '';

  if (trimmed.length > AVATAR_MAX_LEN) return undefined;

  // https URLs
  if (trimmed.startsWith('https://')) return trimmed;

  // data URIs — tight allowlist
  if (trimmed.startsWith('data:')) {
    const match = trimmed.match(/^data:(image\/(png|jpeg|webp));base64,[A-Za-z0-9+/]+=*$/);
    if (!match) return undefined;
    return trimmed;
  }

  // Everything else (http, javascript:, file:, arbitrary strings)
  return undefined;
}

export interface AccountIdResult {
  ok: boolean;
  accountId: string | null;
  error?: string;
}

/**
 * Validate an accountId — only 'default' (or absent) is accepted.
 * This prevents multi-tenant cross-talk until proper auth is in place.
 */
export function validateAccountId(value: unknown): AccountIdResult {
  if (value === undefined || value === null) return { ok: true, accountId: null };
  if (typeof value !== 'string') return { ok: false, accountId: null, error: 'accountId must be a string or absent; only "default" is allowed' };
  const trimmed = value.trim();
  if (trimmed === '') return { ok: true, accountId: null };
  if (trimmed === 'default') return { ok: true, accountId: 'default' };
  return { ok: false, accountId: null, error: 'accountId must be "default" or absent' };
}

/** Strip angle-bracket markup, trim, and cap length. */
export function sanitizeString(value: unknown, maxLen = 500): string {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]*>/g, '').trim().slice(0, maxLen);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function oneOf<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fallback: T[number],
): T[number] {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T[number])
    : fallback;
}

/** ISO-ish date guard (YYYY-MM-DD or full ISO). Returns null when invalid. */
function cleanDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || Number.isNaN(Date.parse(trimmed))) return null;
  return trimmed.slice(0, 30);
}

export interface ValidationResult<T> {
  ok: boolean;
  errors: string[];
  value: T;
}

/**
 * Validate a subscription create payload. Required: name, amount,
 * nextRenewalDate. Everything else is defaulted, type-checked, and clamped.
 */
export function validateNewSubscription(
  body: unknown,
): ValidationResult<Omit<SubscriptionRecord, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>> {
  const errors: string[] = [];
  const b = (body ?? {}) as Record<string, unknown>;

  const name = sanitizeString(b.name, 120);
  if (!name) errors.push('name is required');

  const amount = isFiniteNumber(b.amount) ? b.amount : NaN;
  if (!isFiniteNumber(amount) || amount < 0 || amount > 1_000_000) {
    errors.push('amount must be a number between 0 and 1,000,000');
  }

  const nextRenewalDate = cleanDate(b.nextRenewalDate);
  if (!nextRenewalDate) errors.push('nextRenewalDate must be a valid date');

  const billingCycle = oneOf(b.billingCycle, BILLING_CYCLES, 'monthly');

  let customCycleDays: number | undefined;
  if (billingCycle === 'custom') {
    customCycleDays = isFiniteNumber(b.customCycleDays)
      ? Math.min(Math.max(Math.round(b.customCycleDays), 1), 3650)
      : 30;
  }

  const reminderDaysBefore = isFiniteNumber(b.reminderDaysBefore)
    ? Math.min(Math.max(Math.round(b.reminderDaysBefore), 0), 365)
    : 3;

  const value = {
    name,
    amount: isFiniteNumber(amount) ? amount : 0,
    currency: sanitizeString(b.currency, 8).toUpperCase() || 'USD',
    billingCycle,
    customCycleDays,
    category: oneOf(b.category, CATEGORIES, 'other'),
    startDate: cleanDate(b.startDate) ?? new Date().toISOString().slice(0, 10),
    nextRenewalDate: nextRenewalDate ?? '',
    reminderDaysBefore,
    autoReminder: typeof b.autoReminder === 'boolean' ? b.autoReminder : true,
    isFreeTrial: typeof b.isFreeTrial === 'boolean' ? b.isFreeTrial : false,
    trialEndDate: cleanDate(b.trialEndDate) ?? undefined,
    providerIcon: b.providerIcon ? sanitizeString(b.providerIcon, 60) : undefined,
    notes: b.notes ? sanitizeString(b.notes, 1000) : undefined,
    status: oneOf(b.status, STATUSES, 'active'),
    paymentMethodId: b.paymentMethodId ? sanitizeString(b.paymentMethodId, 60) : undefined,
    cancellationDifficulty: b.cancellationDifficulty ? oneOf(b.cancellationDifficulty, CANCELLATION_DIFFICULTIES, 'easy') : undefined,
    autoRenews: typeof b.autoRenews === 'boolean' ? b.autoRenews : true,
  };

  return { ok: errors.length === 0, errors, value };
}

/**
 * Validate a subscription PATCH payload — only provided fields are returned,
 * each individually type-checked. Unknown fields are dropped.
 */
export function validateSubscriptionPatch(
  body: unknown,
): ValidationResult<Partial<SubscriptionRecord>> {
  const errors: string[] = [];
  const b = (body ?? {}) as Record<string, unknown>;
  const patch: Partial<SubscriptionRecord> = {};

  if (b.name !== undefined) {
    const name = sanitizeString(b.name, 120);
    if (!name) errors.push('name cannot be empty');
    else patch.name = name;
  }
  if (b.amount !== undefined) {
    if (!isFiniteNumber(b.amount) || b.amount < 0 || b.amount > 1_000_000) {
      errors.push('amount must be a number between 0 and 1,000,000');
    } else patch.amount = b.amount;
  }
  if (b.currency !== undefined) patch.currency = sanitizeString(b.currency, 8).toUpperCase() || 'USD';
  if (b.billingCycle !== undefined) patch.billingCycle = oneOf(b.billingCycle, BILLING_CYCLES, 'monthly');
  if (b.customCycleDays !== undefined && isFiniteNumber(b.customCycleDays)) {
    patch.customCycleDays = Math.min(Math.max(Math.round(b.customCycleDays), 1), 3650);
  }
  if (b.category !== undefined) patch.category = oneOf(b.category, CATEGORIES, 'other');
  if (b.startDate !== undefined) {
    const d = cleanDate(b.startDate);
    if (d) patch.startDate = d;
  }
  if (b.nextRenewalDate !== undefined) {
    const d = cleanDate(b.nextRenewalDate);
    if (!d) errors.push('nextRenewalDate must be a valid date');
    else patch.nextRenewalDate = d;
  }
  if (b.reminderDaysBefore !== undefined && isFiniteNumber(b.reminderDaysBefore)) {
    patch.reminderDaysBefore = Math.min(Math.max(Math.round(b.reminderDaysBefore), 0), 365);
  }
  if (b.autoReminder !== undefined && typeof b.autoReminder === 'boolean') patch.autoReminder = b.autoReminder;
  if (b.isFreeTrial !== undefined && typeof b.isFreeTrial === 'boolean') patch.isFreeTrial = b.isFreeTrial;
  if (b.trialEndDate !== undefined) {
    const d = cleanDate(b.trialEndDate);
    patch.trialEndDate = d ?? undefined;
  }
  if (b.providerIcon !== undefined) patch.providerIcon = sanitizeString(b.providerIcon, 60);
  if (b.notes !== undefined) patch.notes = sanitizeString(b.notes, 1000);
  if (b.status !== undefined) patch.status = oneOf(b.status, STATUSES, 'active');
  if (b.paymentMethodId !== undefined) patch.paymentMethodId = sanitizeString(b.paymentMethodId, 60);
  if (b.cancellationDifficulty !== undefined) patch.cancellationDifficulty = oneOf(b.cancellationDifficulty, CANCELLATION_DIFFICULTIES, 'easy');
  if (b.autoRenews !== undefined && typeof b.autoRenews === 'boolean') patch.autoRenews = b.autoRenews;

  return { ok: errors.length === 0, errors, value: patch };
}

/** Validate an account PATCH/onboarding payload. */
export function validateAccountPatch(
  body: unknown,
): Partial<Pick<AccountRecord, 'name' | 'email' | 'avatar' | 'currency' | 'reminderLeadDays' | 'onboarded'>> {
  const b = (body ?? {}) as Record<string, unknown>;
  const patch: Partial<AccountRecord> = {};

  if (b.name !== undefined) patch.name = sanitizeString(b.name, 80);
  if (b.email !== undefined) patch.email = sanitizeString(b.email, 254);
  if (b.avatar !== undefined) patch.avatar = sanitizeAvatar(b.avatar);
  if (b.currency !== undefined) patch.currency = sanitizeString(b.currency, 8).toUpperCase() || 'USD';
  if (b.reminderLeadDays !== undefined && isFiniteNumber(b.reminderLeadDays)) {
    patch.reminderLeadDays = Math.min(Math.max(Math.round(b.reminderLeadDays), 0), 365);
  }
  if (b.onboarded !== undefined && typeof b.onboarded === 'boolean') patch.onboarded = b.onboarded;

  return patch;
}
