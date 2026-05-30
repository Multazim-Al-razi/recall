import { useId, type ReactNode } from 'react';
import { clsx } from 'clsx';
import { ChartEmptyState } from './ChartEmptyState';
import { ChartErrorBoundary } from './ChartErrorBoundary';

/** Minimum chart height that keeps labels legible on mobile (Requirement 9.3). */
const MIN_HEIGHT_FLOOR = 220;
/** Default chart height when a caller does not specify one. */
const DEFAULT_MIN_HEIGHT = 240;

interface ChartFrameProps {
  /** Visible heading and part of the accessible label. */
  title: string;
  /** Screen-reader-only summary of the chart's key values (Requirement 8.1). */
  description: string;
  /** When true, renders {@link ChartEmptyState} instead of the chart children. */
  isEmpty: boolean;
  /** Empty-state copy announced to assistive technology (Requirement 8.5). */
  emptyMessage: string;
  /** Chart region min-height; floored at 220px for mobile legibility (Requirement 9.3). */
  minHeight?: number;
  /** Optional extra classes applied to the card surface. */
  className?: string;
  /** The recharts `ResponsiveContainer` subtree to render inside the chart region. */
  children: ReactNode;
}

/**
 * Shared, presentational wrapper for every chart (donut, category bar, top
 * spenders, projection).
 *
 * `ChartFrame` provides the brand card surface, a visible title, a screen-reader
 * description, the accessible chart region, the empty state, and the per-chart
 * error boundary so individual chart components stay focused on their recharts
 * subtree.
 *
 * It renders:
 * - a card surface using brand tokens (`bg-surface`, `rounded-[20px]`, brand spacing);
 * - a visible `<h3>` title plus a visually-hidden `<p id={descId}>` description
 *   (Requirement 8.1);
 * - the chart region as `role="img"` with `aria-label={title}` and
 *   `aria-describedby={descId}`, with a min-height floored at 220px (Requirement 9.3);
 * - {@link ChartEmptyState} (itself `role="status"`) when `isEmpty` is true
 *   (Requirement 8.5);
 * - everything wrapped by {@link ChartErrorBoundary} so a render failure shows the
 *   contained error state and stays isolated from the rest of the view (Requirement 15.4).
 */
export function ChartFrame({
  title,
  description,
  isEmpty,
  emptyMessage,
  minHeight,
  className,
  children,
}: ChartFrameProps) {
  const descId = useId();
  const regionMinHeight = Math.max(minHeight ?? DEFAULT_MIN_HEIGHT, MIN_HEIGHT_FLOOR);

  return (
    <section className={clsx('rounded-[20px] bg-surface p-6 md:p-7', className)}>
      <h3 className="text-[10px] font-bold uppercase tracking-[2.5px] text-muted">{title}</h3>
      <p id={descId} className="sr-only">
        {description}
      </p>
      <ChartErrorBoundary>
        <div
          role="img"
          aria-label={title}
          aria-describedby={descId}
          className="mt-5 w-full"
          style={{ minHeight: regionMinHeight }}
        >
          {isEmpty ? <ChartEmptyState message={emptyMessage} /> : children}
        </div>
      </ChartErrorBoundary>
    </section>
  );
}
