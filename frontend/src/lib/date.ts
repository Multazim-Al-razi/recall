/**
 * Time-constant helpers. Centralised so we never have magic numbers
 * (86_400_000 etc.) sprinkled across the codebase. Pure values, no
 * runtime cost — keep this file dependency-free.
 */

/** Number of milliseconds in one second. */
export const MS_PER_SECOND = 1_000;

/** Number of milliseconds in one minute. */
export const MS_PER_MINUTE = 60 * MS_PER_SECOND;

/** Number of milliseconds in one hour. */
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;

/** Number of milliseconds in one day (24h). */
export const MS_PER_DAY = 24 * MS_PER_HOUR;

/** Number of milliseconds in one week. */
export const MS_PER_WEEK = 7 * MS_PER_DAY;

/**
 * Parse a locale-friendly decimal string into a float. Accepts both "1,99" and
 * "1.99" — handy for amount inputs that users type with their locale's
 * separator.
 */
export function parseDecimal(value: string): number {
  if (!value) return NaN;
  const normalised = value.trim().replace(",", ".");
  return parseFloat(normalised);
}
