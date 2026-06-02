/**
 * Input validation + sanitization for the API surface.
 *
 * Every write endpoint runs untrusted JSON through these helpers before it
 * touches the database, so malformed types, out-of-range numbers, unknown
 * enum values, and embedded markup never get persisted. Keeping this in one
 * module means the frontend contract (see frontend/src/types/subscription.ts)
 * has a single server-side mirror.
 */
import type { SubscriptionRecord, AccountRecord } from "./db.js";

const CATEGORIES = [
  "entertainment",
  "productivity",
  "fitness",
  "music",
  "cloud",
  "news",
  "food",
  "other",
] as const;

const BILLING_CYCLES = ["monthly", "yearly", "weekly", "custom"] as const;
const STATUSES = ["active", "paused", "cancelled"] as const;

/** Strip angle-bracket markup, trim, and cap length. */
export function sanitizeString(value: unknown, maxLen = 500): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLen);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function oneOf<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fallback: T[number],
): T[number] {
  return typeof value === "string" &&
    (allowed as readonly string[]).includes(value)
    ? (value as T[number])
    : fallback;
}

/** ISO-ish date guard (YYYY-MM-DD or full ISO). Returns null when invalid. */
function cleanDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || Number.isNaN(Date.parse(trimmed))) return null;
  return trimmed.slice(0, 30);
}

/**
 * Validate an `accountId` from a request body or query string. Accepts:
 *   - `"default"` — the legacy lowdb single-account id
 *   - A UUID string (e.g. from Supabase auth.uid())
 *   - Empty / null / undefined — caller falls back to resolved accountId
 *
 * Rejects non-UUID, non-"default" strings to prevent injection or misuse.
 */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function validateAccountId(value: unknown): {
  ok: boolean;
  accountId: string | null;
  error?: string;
} {
  if (value === undefined || value === null) {
    return { ok: true, accountId: null };
  }
  if (typeof value !== "string") {
    return { ok: false, accountId: null, error: "accountId must be a string" };
  }
  const trimmed = value.trim();
  if (trimmed === "") {
    return { ok: true, accountId: null };
  }
  if (trimmed !== "default" && !UUID_RE.test(trimmed)) {
    return {
      ok: false,
      accountId: null,
      error: "accountId must be 'default' or a valid UUID",
    };
  }
  return { ok: true, accountId: trimmed };
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
): ValidationResult<
  Omit<SubscriptionRecord, "id" | "accountId" | "createdAt" | "updatedAt">
> {
  const errors: string[] = [];
  const b = (body ?? {}) as Record<string, unknown>;

  const name = sanitizeString(b.name, 120);
  if (!name) errors.push("name is required");

  const amount = isFiniteNumber(b.amount) ? b.amount : NaN;
  if (!isFiniteNumber(amount) || amount < 0 || amount > 1_000_000) {
    errors.push("amount must be a number between 0 and 1,000,000");
  }

  const nextRenewalDate = cleanDate(b.nextRenewalDate);
  if (!nextRenewalDate) errors.push("nextRenewalDate must be a valid date");

  const billingCycle = oneOf(b.billingCycle, BILLING_CYCLES, "monthly");

  let customCycleDays: number | undefined;
  if (billingCycle === "custom") {
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
    currency: sanitizeString(b.currency, 8).toUpperCase() || "USD",
    billingCycle,
    customCycleDays,
    category: oneOf(b.category, CATEGORIES, "other"),
    startDate: cleanDate(b.startDate) ?? new Date().toISOString().slice(0, 10),
    nextRenewalDate: nextRenewalDate ?? "",
    reminderDaysBefore,
    autoReminder: typeof b.autoReminder === "boolean" ? b.autoReminder : true,
    isFreeTrial: typeof b.isFreeTrial === "boolean" ? b.isFreeTrial : false,
    trialEndDate: cleanDate(b.trialEndDate) ?? undefined,
    providerIcon: b.providerIcon
      ? sanitizeString(b.providerIcon, 60)
      : undefined,
    notes: b.notes ? sanitizeString(b.notes, 1000) : undefined,
    status: oneOf(b.status, STATUSES, "active"),
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
    if (!name) errors.push("name cannot be empty");
    else patch.name = name;
  }
  if (b.amount !== undefined) {
    if (!isFiniteNumber(b.amount) || b.amount < 0 || b.amount > 1_000_000) {
      errors.push("amount must be a number between 0 and 1,000,000");
    } else patch.amount = b.amount;
  }
  if (b.currency !== undefined)
    patch.currency = sanitizeString(b.currency, 8).toUpperCase() || "USD";
  if (b.billingCycle !== undefined)
    patch.billingCycle = oneOf(b.billingCycle, BILLING_CYCLES, "monthly");
  if (b.customCycleDays !== undefined && isFiniteNumber(b.customCycleDays)) {
    patch.customCycleDays = Math.min(
      Math.max(Math.round(b.customCycleDays), 1),
      3650,
    );
  }
  if (b.category !== undefined)
    patch.category = oneOf(b.category, CATEGORIES, "other");
  if (b.startDate !== undefined) {
    const d = cleanDate(b.startDate);
    if (d) patch.startDate = d;
  }
  if (b.nextRenewalDate !== undefined) {
    const d = cleanDate(b.nextRenewalDate);
    if (!d) errors.push("nextRenewalDate must be a valid date");
    else patch.nextRenewalDate = d;
  }
  if (
    b.reminderDaysBefore !== undefined &&
    isFiniteNumber(b.reminderDaysBefore)
  ) {
    patch.reminderDaysBefore = Math.min(
      Math.max(Math.round(b.reminderDaysBefore), 0),
      365,
    );
  }
  if (b.autoReminder !== undefined && typeof b.autoReminder === "boolean")
    patch.autoReminder = b.autoReminder;
  if (b.isFreeTrial !== undefined && typeof b.isFreeTrial === "boolean")
    patch.isFreeTrial = b.isFreeTrial;
  if (b.trialEndDate !== undefined) {
    const d = cleanDate(b.trialEndDate);
    patch.trialEndDate = d ?? undefined;
  }
  if (b.providerIcon !== undefined)
    patch.providerIcon = sanitizeString(b.providerIcon, 60);
  if (b.notes !== undefined) patch.notes = sanitizeString(b.notes, 1000);
  if (b.status !== undefined)
    patch.status = oneOf(b.status, STATUSES, "active");

  return { ok: errors.length === 0, errors, value: patch };
}

/**
 * Validate an account PATCH/onboarding payload.
 */
export function validateAccountPatch(
  body: unknown,
): Partial<
  Pick<
    AccountRecord,
    | "name"
    | "email"
    | "avatar"
    | "currency"
    | "reminderLeadDays"
    | "onboarded"
    | "tier"
  >
> {
  const b = (body ?? {}) as Record<string, unknown>;
  const patch: Partial<AccountRecord> = {};

  if (b.name !== undefined) patch.name = sanitizeString(b.name, 80);
  if (b.email !== undefined) patch.email = sanitizeString(b.email, 254);
  if (b.avatar !== undefined) patch.avatar = sanitizeAvatar(b.avatar);
  if (b.currency !== undefined)
    patch.currency = sanitizeString(b.currency, 8).toUpperCase() || "USD";
  if (b.reminderLeadDays !== undefined && isFiniteNumber(b.reminderLeadDays)) {
    patch.reminderLeadDays = Math.min(
      Math.max(Math.round(b.reminderLeadDays), 0),
      365,
    );
  }
  if (b.onboarded !== undefined && typeof b.onboarded === "boolean")
    patch.onboarded = b.onboarded;
  if (b.tier === "local" || b.tier === "sync") patch.tier = b.tier;

  return patch;
}

/** Maximum allowed length of a stored avatar string. */
export const AVATAR_MAX_LEN = 8000;

/**
 * Tightened avatar validation (B-7). We accept three classes of value:
 *   1. `data:image/(png|jpeg|webp);base64,<...>` — inline image uploads.
 *   2. `https://...` — remote avatars served over TLS only.
 *   3. Empty string — explicit clear of the avatar.
 *
 * Anything else (e.g. `javascript:`, `data:text/html`, `http://`,
 * arbitrary markup, oversized blobs) is rejected by returning `undefined`,
 * so the caller can distinguish "no avatar provided" from "invalid
 * avatar provided" using `b.avatar !== undefined` in `validateAccountPatch`.
 *
 * The cap is 8000 chars — a base64 avatar of that length decodes to ~6 KB
 * of image, which is well under the 100 KB JSON body limit and large
 * enough to be visually useful.
 */
export function sanitizeAvatar(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (trimmed === "") return "";
  if (trimmed.length > AVATAR_MAX_LEN) return undefined;

  // Inline data URI: only allow image/png, image/jpeg, image/webp.
  if (trimmed.startsWith("data:")) {
    if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(trimmed)) {
      return undefined;
    }
    return trimmed;
  }

  // Remote URL: https only. (Other schemes like javascript:, file:,
  // data:text/html, etc. are all rejected at the prefix check below.)
  if (/^https:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return undefined;
}
