import type { Category, Subscription } from '@/types/subscription';
import { CATEGORY_COLORS, CATEGORY_CONFIG } from '@/types/subscription';
import { getActiveSubscriptions, toMonthlyAmount } from '@/stores/subscription';
import { findColorCollisions } from '@/components/charts/chartTheme';

/**
 * A single category slice for the donut and category bar charts.
 *
 * `label` and `percent`/`amount` are the non-color cues that make the data
 * legible without relying on `color` alone (Requirements 3.3, 8.2), and
 * `collides` flags categories whose palette color is near-identical to another
 * displayed category so the view can add a pattern/extra cue (Requirement 7.3).
 */
export interface CategoryDatum {
  category: Category;
  /** `CATEGORY_CONFIG[category].label` — always-present non-color cue. */
  label: string;
  /** Monthly spend for the category, taken verbatim from the selector map. */
  amount: number;
  /** Whole-percent share of the displayed total, rounded to the nearest integer. */
  percent: number;
  /** `CATEGORY_COLORS[category]`. */
  color: string;
  /** True when this color is within the perceptual threshold of another shown category. */
  collides: boolean;
}

/**
 * A single bar for the top-spenders chart.
 */
export interface SpenderDatum {
  id: string;
  /** Subscription name — non-color cue (Requirement 5.2). */
  name: string;
  /** Normalized monthly amount via `toMonthlyAmount`. */
  amount: number;
  category: Category;
  /** `CATEGORY_COLORS[category]`. */
  color: string;
}

/**
 * The set of valid `Category` keys, derived from `CATEGORY_CONFIG` so it stays
 * in sync with the type. Used to drop any unknown keys that may appear in a
 * `Record<string, number>` selector map.
 */
const VALID_CATEGORIES = new Set<string>(Object.keys(CATEGORY_CONFIG));

function isCategory(value: string): value is Category {
  return VALID_CATEGORIES.has(value);
}

/**
 * Category breakdown for the donut + category bar charts.
 *
 * Receives the `getByCategory(subs)` map as a parameter (this function never
 * calls the selector itself, keeping it pure and trivially testable). Rules:
 * - Includes only valid categories with `amount > 0` — never invents
 *   zero/negative categories (Requirements 2.2, 3.1, 4.1).
 * - Sorted by `amount` descending, ties broken by `CATEGORY_CONFIG[c].label`
 *   ascending A→Z (Requirements 2.5, 3.5, 3.6, 4.4).
 * - `percent = round(amount / total * 100)`, where `total` is the sum of the
 *   included amounts; a zero total short-circuits to `[]` so there is no
 *   division by zero (Requirement 4.2).
 * - `label = CATEGORY_CONFIG[category].label`, `color = CATEGORY_COLORS[category]`.
 * - `collides` is `true` for categories flagged by `findColorCollisions`
 *   among the included set (Requirement 7.3).
 */
export function toCategoryData(byCategory: Record<string, number>): CategoryDatum[] {
  const included: { category: Category; amount: number }[] = [];

  for (const [key, amount] of Object.entries(byCategory)) {
    if (!isCategory(key)) continue;
    if (amount > 0) {
      included.push({ category: key, amount });
    }
  }

  const total = included.reduce((sum, entry) => sum + entry.amount, 0);
  if (total === 0) return [];

  const collisions = findColorCollisions(included.map((entry) => entry.category));

  return included
    .map(({ category, amount }) => ({
      category,
      label: CATEGORY_CONFIG[category].label,
      amount,
      percent: Math.round((amount / total) * 100),
      color: CATEGORY_COLORS[category],
      collides: collisions.has(category),
    }))
    .sort((a, b) => {
      if (b.amount !== a.amount) return b.amount - a.amount;
      return a.label.localeCompare(b.label);
    });
}

/**
 * Top spenders for the analytics bar chart.
 *
 * - Active subscriptions whose `toMonthlyAmount(sub) > 0` (Requirement 5.1).
 * - `amount` is the normalized monthly amount via `toMonthlyAmount`.
 * - Sorted by `amount` descending, ties broken by ascending case-insensitive
 *   name (Requirements 5.3, 5.5).
 * - Returns at most `limit` items (default 10); when more than `limit` qualify,
 *   exactly `limit` are returned (Requirement 5.4).
 */
export function toTopSpenders(subs: Subscription[], limit = 10): SpenderDatum[] {
  return getActiveSubscriptions(subs)
    .map((sub) => ({ sub, amount: toMonthlyAmount(sub) }))
    .filter(({ amount }) => amount > 0)
    .sort((a, b) => {
      if (b.amount !== a.amount) return b.amount - a.amount;
      return a.sub.name.toLowerCase().localeCompare(b.sub.name.toLowerCase());
    })
    .slice(0, limit)
    .map(({ sub, amount }) => ({
      id: sub.id,
      name: sub.name,
      amount,
      category: sub.category,
      color: CATEGORY_COLORS[sub.category],
    }));
}
