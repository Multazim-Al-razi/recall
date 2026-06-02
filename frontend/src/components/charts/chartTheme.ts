import type { Category } from '@/types/subscription';
import { CATEGORY_COLORS } from '@/types/subscription';

/**
 * Brand tokens for chart chrome (axes, gridlines, surfaces, ink, accent).
 *
 * Every value references a CSS custom property defined in `src/index.css` under
 * `@theme`, so chart axes/grid/surfaces never use ad-hoc colors and stay in sync
 * with the brand palette (Requirement 7.2). Data marks themselves are colored from
 * `CATEGORY_COLORS`; this map is strictly for non-data chrome plus the primary
 * accent series.
 */
export const CHART_THEME = {
  axis: 'var(--color-muted)',
  grid: 'var(--color-hairline)',
  surface: 'var(--color-surface)',
  ink: 'var(--color-ink)',
  accent: 'var(--color-rausch)',
} as const;

export type ChartTheme = typeof CHART_THEME;

/** A parsed sRGB color in the 0–255 range. */
interface Rgb {
  r: number;
  g: number;
  b: number;
}

/**
 * Parse a `#rrggbb` hex string into its red/green/blue components.
 * All palette entries in `CATEGORY_COLORS` are 6-digit hex, so this is total over
 * the inputs we actually feed it.
 */
function hexToRgb(hex: string): Rgb {
  const value = hex.replace('#', '');
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  };
}

/**
 * Perceptual distance between two colors using the "redmean" weighted-Euclidean
 * approximation (a cheap, deterministic stand-in for a full CIE Lab/Delta-E).
 * Larger values mean the colors look more distinct to the human eye; identical
 * colors return 0.
 *
 * See the well-known redmean formula: it weights the green channel most heavily
 * and shifts red/blue weighting based on the average red level, which tracks human
 * perception far better than a plain RGB Euclidean distance.
 */
function perceptualDistance(a: Rgb, b: Rgb): number {
  const meanR = (a.r + b.r) / 2;
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  const rWeight = 2 + meanR / 256;
  const bWeight = 2 + (255 - meanR) / 256;
  return Math.sqrt(rWeight * dr * dr + 4 * dg * dg + bWeight * db * db);
}

/**
 * Threshold below which two category colors are treated as "near-identical".
 *
 * Measured redmean distances across the current palette:
 *   - entertainment (#d4443a) vs food (#ef5350)  ≈ 63   → MUST collide
 *   - fitness (#888888)       vs music (#66bb6a) ≈ 125  → next closest, distinct
 *   - every other pair                            > 150  → clearly distinct
 *
 * 90 sits comfortably above the entertainment/food pair (~63) and well below the
 * next-closest pair (~125), so it flags the known red-on-red collision without
 * catching any visually distinct pairing (e.g. entertainment vs cloud, or
 * productivity vs music).
 */
const COLLISION_THRESHOLD = 90;

/**
 * Returns the set of categories whose palette color is within the perceptual
 * similarity threshold of at least one other category present in `categories`.
 *
 * Only categories actually passed in are considered, and a category is flagged
 * only when it collides with a *different* present category. The known collision
 * (entertainment `#d4443a` vs food `#ef5350`) is always detected when both are
 * present. The function is pure and deterministic.
 */
export function findColorCollisions(categories: Category[]): Set<Category> {
  const collisions = new Set<Category>();
  // De-duplicate so a repeated category never "collides with itself".
  const unique = Array.from(new Set(categories));
  const rgb = new Map<Category, Rgb>(
    unique.map((category) => [category, hexToRgb(CATEGORY_COLORS[category])]),
  );

  for (let i = 0; i < unique.length; i += 1) {
    for (let j = i + 1; j < unique.length; j += 1) {
      const a = unique[i];
      const b = unique[j];
      const colorA = rgb.get(a);
      const colorB = rgb.get(b);
      if (colorA === undefined || colorB === undefined) continue;
      if (perceptualDistance(colorA, colorB) < COLLISION_THRESHOLD) {
        collisions.add(a);
        collisions.add(b);
      }
    }
  }

  return collisions;
}
