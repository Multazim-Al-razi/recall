import { addDays, addMonths, format, isBefore, parseISO, startOfDay, startOfMonth } from 'date-fns';
import type { Subscription } from '@/types/subscription';

/**
 * A single calendar-month point in the forward projection series.
 *
 * The series always contains one point per calendar month in the window, even
 * when a month carries no charges, so the chart x-axis stays stable.
 */
export interface ProjectionPoint {
  /** Stable sort/identity key in `'yyyy-MM'` form (e.g. `'2025-01'`). */
  monthKey: string;
  /** Short, human-readable axis label (e.g. `'Jan'`). */
  label: string;
  /** Sum of charge amounts that fall due within this calendar month. */
  charges: number;
  /** Running total of `charges` from the window start through this month. */
  cumulative: number;
}

/** Options controlling the projection window. */
export interface ProjectionOptions {
  /** Window start; defaults to the start of today. Charges before this are never emitted. */
  from?: Date;
  /** Number of calendar months in the window; defaults to 12. */
  months?: number;
}

/** Default window length, in calendar months (Requirement 6.4). */
const DEFAULT_MONTHS = 12;

/** Fallback step for a `custom` cycle with a missing/non-positive interval. */
const DEFAULT_CUSTOM_CYCLE_DAYS = 30;

/**
 * Advance a charge date forward by one billing cycle.
 *
 * Every cycle advances the date by at least one day, so callers that step until
 * a finite window end are guaranteed to terminate:
 * - `monthly` → +1 month, `yearly` → +12 months, `weekly` → +7 days,
 * - `custom`  → +(customCycleDays || 30) days, guarded to a positive step so a
 *   missing, zero, or invalid interval cannot stall progress (no infinite loop).
 */
function nextOccurrence(date: Date, sub: Subscription): Date {
  switch (sub.billingCycle) {
    case 'monthly':
      return addMonths(date, 1);
    case 'yearly':
      return addMonths(date, 12);
    case 'weekly':
      return addDays(date, 7);
    case 'custom': {
      const cycleDays =
        sub.customCycleDays && sub.customCycleDays > 0
          ? sub.customCycleDays
          : DEFAULT_CUSTOM_CYCLE_DAYS;
      return addDays(date, cycleDays);
    }
    default:
      // Exhaustive over BillingCycle; kept as a safe forward step.
      return addDays(date, DEFAULT_CUSTOM_CYCLE_DAYS);
  }
}

/**
 * Cumulative upcoming charges across a forward window, derived ONLY from the
 * `nextRenewalDate`, `billingCycle`, `customCycleDays`, and `amount` of ACTIVE
 * subscriptions (Requirement 6.1). This is a new pure derivation and does not
 * touch any store selector.
 *
 * Behavior:
 * - The window starts at `options.from ?? start of today` and spans `options.months`
 *   (default 12) calendar months beginning with the month that contains the start.
 * - Each subscription is stepped forward from its `nextRenewalDate` by its billing
 *   cycle. Renewal dates before the window start are advanced to the first
 *   occurrence on or after the start, so NO charge is ever emitted before the
 *   window start — no fabricated history (Requirement 6.2).
 * - Every charge occurrence within the window contributes its full `amount` to the
 *   calendar month it lands in. A yearly plan therefore shows one spike in its
 *   renewal month rather than twelve slices.
 * - Exactly `months` points are returned, ordered by `monthKey` ascending; months
 *   with no charges appear with `charges: 0` so the x-axis is stable.
 * - `cumulative[i] = Σ charges[0..i]`, so `cumulative` is non-decreasing and
 *   `cumulative[last]` equals the total of all in-window charges.
 *
 * Stepping is bounded by the window end, which guarantees termination.
 */
export function getProjectedCharges(
  subs: Subscription[],
  options?: ProjectionOptions
): ProjectionPoint[] {
  const months = options?.months ?? DEFAULT_MONTHS;
  if (months <= 0) {
    return [];
  }

  const windowStart = startOfDay(options?.from ?? new Date());
  const firstMonth = startOfMonth(windowStart);
  // Exclusive upper bound: the first day of the month after the last bucket.
  const windowEnd = addMonths(firstMonth, months);

  // Pre-build the stable, ordered month buckets.
  const monthDates: Date[] = [];
  for (let i = 0; i < months; i += 1) {
    monthDates.push(addMonths(firstMonth, i));
  }
  const monthKeys = monthDates.map((d) => format(d, 'yyyy-MM'));
  const indexByKey = new Map<string, number>();
  monthKeys.forEach((key, i) => indexByKey.set(key, i));

  const charges = new Array<number>(months).fill(0);

  for (const sub of subs) {
    if (sub.status !== 'active') {
      continue;
    }

    let occurrence = parseISO(sub.nextRenewalDate);
    if (Number.isNaN(occurrence.getTime())) {
      continue;
    }

    // Advance past renewals already behind the window to the first occurrence
    // that lands on or after the window start (never before it).
    while (isBefore(occurrence, windowStart)) {
      occurrence = nextOccurrence(occurrence, sub);
    }

    // Accumulate each occurrence that falls inside [windowStart, windowEnd).
    while (isBefore(occurrence, windowEnd)) {
      const key = format(occurrence, 'yyyy-MM');
      const idx = indexByKey.get(key);
      if (idx !== undefined) {
        charges[idx] += sub.amount;
      }
      occurrence = nextOccurrence(occurrence, sub);
    }
  }

  let running = 0;
  return monthDates.map((date, i) => {
    running += charges[i];
    return {
      monthKey: monthKeys[i],
      label: format(date, 'MMM'),
      charges: charges[i],
      cumulative: running,
    };
  });
}

/**
 * True when at least one point in the window carries a charge. Drives the
 * projection chart's empty state (Requirement 6.5).
 */
export function hasProjectedCharges(points: ProjectionPoint[]): boolean {
  return points.some((point) => point.charges > 0);
}
