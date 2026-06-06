import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useSubscriptionStore, getSpendHistory } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { formatMoney } from '@/lib/format';

/* ─── Layout constants ─── */
const BAR_COUNT = 6;
const SVG_W = 320;
const SVG_H = 140;
const BAR_W = 36;
const BAR_GAP = 14;
const CHART_LEFT =
  (SVG_W - BAR_COUNT * BAR_W - (BAR_COUNT - 1) * BAR_GAP) / 2;
const MIN_BAR_H = 6;
const BAR_RX = 6;

/* Grid-line percentages (25 / 50 / 75 %) */
const GRID_LINES = [0.25, 0.5, 0.75] as const;

/* ─── Gradient IDs ─── */
const GRAD_NORMAL = 'bar-grad-normal';
const GRAD_CURRENT = 'bar-grad-current';
const GRAD_HOVER = 'bar-grad-hover';

interface BarData {
  label: string;
  value: number;
  x: number;
  y: number;
  height: number;
  isCurrent: boolean;
  index: number;
}

/**
 * Premium Spending bar chart — Bankio-inspired "Spending" panel.
 * Renders the last 6 months of subscription spending as gradient-filled
 * vertical bars with hover tooltips and staggered entrance animations.
 */
export function SpendingBarChart() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const currency = useAccountStore((s) => s.profile.currency);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const history = useMemo(
    () => getSpendHistory(subscriptions, BAR_COUNT),
    [subscriptions],
  );

  const maxValue = useMemo(
    () => Math.max(...history.map((d) => d.value), 0),
    [history],
  );

  const peakEntry = useMemo(() => {
    let peak = history[0];
    for (const entry of history) {
      if (entry.value > (peak?.value ?? 0)) peak = entry;
    }
    return peak;
  }, [history]);

  const allZero = maxValue === 0;

  const bars: BarData[] = useMemo(() => {
    const safeMax = maxValue || 1;
    return history.map((d, i) => {
      const ratio = d.value / safeMax;
      const height = Math.max(ratio * SVG_H, MIN_BAR_H);
      const x = CHART_LEFT + i * (BAR_W + BAR_GAP);
      const y = SVG_H - height;
      const isCurrent = i === history.length - 1;
      return { ...d, x, y, height, isCurrent, index: i };
    });
  }, [history, maxValue]);

  const handlePointerEnter = useCallback(
    (i: number) => setHoveredIdx(i),
    [],
  );
  const handlePointerLeave = useCallback(
    () => setHoveredIdx(null),
    [],
  );

  return (
    <div className="card-premium flex flex-col gap-5 p-6">
      {/* ── Header row ── */}
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-semibold text-ink">Spending</span>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-[var(--color-hairline)] bg-canvas px-3 py-1.5 text-[12px] font-medium text-ink transition-colors hover:bg-[var(--color-hairline)]"
          aria-label="Select period"
        >
          Month
          <ChevronDown size={12} className="text-muted" />
        </button>
      </div>

      {/* ── Peak amount ── */}
      <div className="flex flex-col gap-0.5">
        <span className="font-display text-[24px] font-light tabular-nums text-ink">
          {formatMoney(peakEntry?.value ?? 0, currency)}
        </span>
        <span className="text-[11px] text-muted">Peak this period</span>
      </div>

      {/* ── Bar chart ── */}
      <div className="relative flex flex-col items-center gap-3">
        <svg
          role="img"
          aria-label="Monthly spending chart showing last 6 months"
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="h-[140px] w-full"
          preserveAspectRatio="xMidYMax meet"
        >
          {/* ── SVG gradient definitions ── */}
          <defs>
            {/* Past months: teal fading from 65 % → 30 % */}
            <linearGradient id={GRAD_NORMAL} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-teal)" stopOpacity={0.65} />
              <stop offset="100%" stopColor="var(--color-teal)" stopOpacity={0.3} />
            </linearGradient>

            {/* Current month: teal 100 % → 55 % */}
            <linearGradient id={GRAD_CURRENT} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-teal)" stopOpacity={1} />
              <stop offset="100%" stopColor="var(--color-teal)" stopOpacity={0.55} />
            </linearGradient>

            {/* Hover: full teal, barely fading */}
            <linearGradient id={GRAD_HOVER} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-teal)" stopOpacity={1} />
              <stop offset="100%" stopColor="var(--color-teal)" stopOpacity={0.75} />
            </linearGradient>
          </defs>

          {/* ── Horizontal grid lines ── */}
          {GRID_LINES.map((pct) => {
            const lineY = SVG_H * (1 - pct);
            return (
              <line
                key={pct}
                x1={0}
                y1={lineY}
                x2={SVG_W}
                y2={lineY}
                stroke="var(--color-hairline)"
                strokeDasharray="4 4"
                strokeWidth={1}
              />
            );
          })}

          {/* ── Bars ── */}
          {bars.map((bar) => {
            const isHovered = hoveredIdx === bar.index;
            const fill = isHovered
              ? `url(#${GRAD_HOVER})`
              : bar.isCurrent
                ? `url(#${GRAD_CURRENT})`
                : `url(#${GRAD_NORMAL})`;

            return (
              <motion.rect
                key={bar.label}
                x={bar.x}
                width={BAR_W}
                rx={BAR_RX}
                fill={fill}
                className="cursor-pointer"
                style={{ transition: 'fill 0.2s ease' }}
                initial={{ y: SVG_H, height: 0 }}
                animate={{ y: bar.y, height: bar.height }}
                transition={{
                  duration: 0.6,
                  delay: bar.index * 0.06,
                  ease: 'easeOut',
                }}
                onPointerEnter={() => handlePointerEnter(bar.index)}
                onPointerLeave={handlePointerLeave}
                role="graphics-symbol"
                aria-label={`${bar.label}: ${formatMoney(bar.value, currency)}`}
              />
            );
          })}
        </svg>

        {/* ── Hover tooltip ── */}
        <AnimatePresence>
          {hoveredIdx !== null && bars[hoveredIdx] && (
            <motion.div
              key="tooltip"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-none absolute z-10 rounded-lg bg-ink px-3 py-1.5 text-[12px] font-medium tabular-nums text-surface shadow-lg"
              style={{
                /* Position above the hovered bar. The SVG is laid out to fill
                   the container width, so we map bar centres to percentages. */
                left: `${((bars[hoveredIdx].x + BAR_W / 2) / SVG_W) * 100}%`,
                top: `${((bars[hoveredIdx].y - 10) / SVG_H) * 100}%`,
                transform: 'translate(-50%, -100%)',
              }}
            >
              {formatMoney(bars[hoveredIdx].value, currency)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Month labels ── */}
        <div
          className="flex w-full"
          style={{
            paddingLeft: `${(CHART_LEFT / SVG_W) * 100}%`,
            paddingRight: `${(CHART_LEFT / SVG_W) * 100}%`,
          }}
        >
          {bars.map((bar) => (
            <span
              key={bar.label}
              className={`flex-1 text-center text-[12px] transition-colors ${
                hoveredIdx === bar.index
                  ? 'font-medium text-ink'
                  : bar.isCurrent
                    ? 'font-medium text-ink'
                    : 'text-muted'
              }`}
            >
              {bar.label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Empty state ── */}
      {allZero && (
        <p className="text-center text-[12px] text-muted">
          No spending data yet
        </p>
      )}
    </div>
  );
}
