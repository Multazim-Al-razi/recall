import { useMemo } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useSubscriptionStore, getSpendHistory, getExpiringTrials, getByCategory, getSavingsOpportunities } from '@/stores/subscription';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { Link } from 'react-router';

// ── Arc geometry ──────────────────────────────────────────────────────────────
const CX = 100;
const CY = 100;
const R = 80;
const STROKE = 14;
const GAP_DEG = 2.5; // degrees of gap between segments

/** Convert degrees → radians. 0° = 3-o'clock, we work in 180°→360° range. */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Point on the circle at `angleDeg` measured from positive x-axis. */
function pointOnArc(angleDeg: number): { x: number; y: number } {
  const rad = toRad(angleDeg);
  return {
    x: CX + R * Math.cos(rad),
    y: CY + R * Math.sin(rad),
  };
}

/**
 * Build an SVG arc path from `startDeg` to `endDeg`.
 * Angles: 180° = leftmost, 360° (=0°) = rightmost.
 */
function arcPath(startDeg: number, endDeg: number): string {
  const start = pointOnArc(startDeg);
  const end = pointOnArc(endDeg);
  const sweep = endDeg - startDeg;
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

// ── Segment definitions ───────────────────────────────────────────────────────
interface Segment {
  startPct: number;
  endPct: number;
  color: string;
}

const SEGMENTS: Segment[] = [
  { startPct: 0, endPct: 25, color: 'var(--color-chart-1)' },
  { startPct: 25, endPct: 50, color: 'var(--color-chart-3)' },
  { startPct: 50, endPct: 75, color: 'var(--color-chart-2)' },
  { startPct: 75, endPct: 100, color: 'var(--color-success)' },
];

/** Map a 0–100 percentage to the 180°→360° arc. */
function pctToDeg(pct: number): number {
  return 180 + (pct / 100) * 180;
}

// ── Status helpers ────────────────────────────────────────────────────────────
interface Status {
  label: string;
  colorClass: string;
  pillBg: string;
}

function getStatus(score: number): Status {
  if (score >= 76) return { label: 'Excellent', colorClass: 'text-[var(--color-success)]', pillBg: 'bg-[var(--color-success)]/12' };
  if (score >= 51) return { label: 'Good', colorClass: 'text-[var(--color-teal)]', pillBg: 'bg-[var(--color-teal)]/12' };
  if (score >= 26) return { label: 'Fair', colorClass: 'text-[var(--color-gold)]', pillBg: 'bg-[var(--color-gold)]/12' };
  return { label: 'At Risk', colorClass: 'text-[var(--color-rausch)]', pillBg: 'bg-[var(--color-rausch)]/12' };
}

function getActiveColor(score: number): string {
  if (score >= 76) return 'var(--color-success)';
  if (score >= 51) return 'var(--color-teal)';
  if (score >= 26) return 'var(--color-gold)';
  return 'var(--color-rausch)';
}

// ── Score computation ─────────────────────────────────────────────────────────
function computeHealthScore(subscriptions: Parameters<typeof getSpendHistory>[0]): number {
  // 1. Trend Score (0–25): MoM spend change
  const history = getSpendHistory(subscriptions, 2);
  let trendScore = 25;
  if (history.length >= 2) {
    const prev = history[0].value;
    const curr = history[1].value;
    if (prev > 0) {
      const change = ((curr - prev) / prev) * 100;
      // <= 0% → 25, >= 20% → 0, linear between
      trendScore = Math.round(Math.max(0, Math.min(25, 25 * (1 - change / 20))));
    }
  }

  // 2. Trial Score (0–25): expiring trials within 14 days
  const expiringCount = getExpiringTrials(subscriptions, 14).length;
  const trialScore = Math.max(0, 25 - expiringCount * 5);

  // 3. Diversity Score (0–25): Herfindahl index on category spending
  const byCategory = getByCategory(subscriptions);
  const categoryValues = Object.values(byCategory);
  let diversityScore = 25;
  if (categoryValues.length === 0) {
    diversityScore = 25; // no subs = no concentration risk
  } else if (categoryValues.length === 1) {
    diversityScore = 5;
  } else {
    const total = categoryValues.reduce((a, b) => a + b, 0);
    if (total > 0) {
      const hhi = categoryValues.reduce((sum, v) => sum + (v / total) ** 2, 0);
      // HHI ranges from 1/n (perfect spread) to 1 (single category).
      // Map: HHI=1 → 5, HHI=1/n → 25
      const minHHI = 1 / categoryValues.length;
      const normalised = (hhi - minHHI) / (1 - minHHI || 1); // 0 = spread, 1 = concentrated
      diversityScore = Math.round(25 - normalised * 20);
    }
  }

  // 4. Savings Score (0–25): savings opportunities
  const { cancelCount } = getSavingsOpportunities(subscriptions);
  const savingsScore = Math.max(0, 25 - cancelCount * 4);

  return Math.min(100, trendScore + trialScore + diversityScore + savingsScore);
}

// ── Animated number component ─────────────────────────────────────────────────
function AnimatedNumber({ value, reduced }: { value: number; reduced: boolean }) {
  const mv = useMotionValue(0);
  const display = useTransform(mv, (v) => Math.round(v));

  // Drive the motion value to `value` on mount / change
  useMemo(() => {
    if (reduced) {
      mv.set(value);
    } else {
      animate(mv, value, { duration: 1, ease: 'easeOut' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduced]);

  return <motion.span>{display}</motion.span>;
}

// ── Needle (animated dot on arc) ──────────────────────────────────────────────
function Needle({ score, reduced }: { score: number; reduced: boolean }) {
  const color = getActiveColor(score);
  const finalDeg = pctToDeg(score);
  const finalPos = pointOnArc(finalDeg);

  const startPos = pointOnArc(180);

  return (
    <>
      {/* Glow halo behind the needle dot */}
      <motion.circle
        cx={reduced ? finalPos.x : startPos.x}
        cy={reduced ? finalPos.y : startPos.y}
        r={STROKE / 2 + 8}
        fill={color}
        opacity={0.2}
        animate={reduced ? undefined : { cx: finalPos.x, cy: finalPos.y }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ filter: 'blur(6px)' }}
      />
      {/* Main needle dot */}
      <motion.circle
        cx={reduced ? finalPos.x : startPos.x}
        cy={reduced ? finalPos.y : startPos.y}
        r={STROKE / 2 + 2}
        fill={color}
        stroke="var(--color-surface)"
        strokeWidth={3}
        animate={reduced ? undefined : { cx: finalPos.x, cy: finalPos.y }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))' }}
      />
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
/**
 * Spend Health arc gauge — a premium Bankio-inspired vertical card with a
 * centered segmented semicircle speedometer showing a composite 0–100 health
 * score computed from trend, trial risk, category diversity, and savings
 * opportunities.
 */
export function SpendHealthArc() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const reduced = useReducedMotion();

  const score = useMemo(() => computeHealthScore(subscriptions), [subscriptions]);
  const status = getStatus(score);

  return (
    <motion.div
      className="card-premium flex flex-col items-center p-6"
      initial={reduced ? undefined : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* ── Header row: title + "See More" link ── */}
      <div className="flex w-full items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold tracking-wide text-ink">
          Spend Health
        </h3>
        <Link
          to="/dashboard/analytics"
          className="text-[12px] font-medium text-[var(--color-rausch)] transition-colors hover:text-[var(--color-rausch-hover)]"
        >
          See More
        </Link>
      </div>

      {/* ── Arc gauge hero — centered, with score overlay ── */}
      <div className="relative w-full max-w-[240px]">
        <svg
          viewBox="0 0 200 120"
          className="h-auto w-full overflow-visible"
          role="img"
          aria-label={`Spend health score: ${score} out of 100, ${status.label}`}
        >
          {/* Background segments (faded) */}
          {SEGMENTS.map((seg, i) => {
            const startDeg = pctToDeg(seg.startPct) + (i === 0 ? 0 : GAP_DEG);
            const endDeg = pctToDeg(seg.endPct) - (i === SEGMENTS.length - 1 ? 0 : GAP_DEG);
            return (
              <path
                key={i}
                d={arcPath(startDeg, endDeg)}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE}
                strokeLinecap="round"
                opacity={0.15}
              />
            );
          })}

          {/* Active (filled) segments — only up to the score */}
          {SEGMENTS.map((seg, i) => {
            const segStart = seg.startPct;
            const segEnd = seg.endPct;
            // Determine how much of this segment is filled
            if (score <= segStart) return null;
            const fillEnd = Math.min(score, segEnd);
            const startDeg = pctToDeg(segStart) + (i === 0 ? 0 : GAP_DEG);
            const endDeg = pctToDeg(fillEnd) - (fillEnd >= segEnd && i < SEGMENTS.length - 1 ? GAP_DEG : 0);
            // Need at least a tiny arc to render
            if (endDeg - startDeg < 0.5) return null;

            return (
              <motion.path
                key={`fill-${i}`}
                d={arcPath(startDeg, endDeg)}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE}
                strokeLinecap="round"
                initial={reduced ? undefined : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, ease: 'easeOut', delay: i * 0.08 }}
              />
            );
          })}

          {/* Needle dot with glow */}
          <Needle score={score} reduced={reduced} />
        </svg>

        {/* ── Score + status pill — absolutely positioned inside the arc ── */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-1 pointer-events-none">
          <span className="font-display text-[40px] font-light leading-none tabular-nums text-ink">
            <AnimatedNumber value={score} reduced={reduced} />
          </span>
          <span
            className={`mt-1.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[1.5px] ${status.pillBg} ${status.colorClass}`}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* ── Subtitle ── */}
      <p className="mt-4 text-center text-[11px] text-muted leading-relaxed">
        Based on spending trends, trial risks,<br />
        category diversity &amp; savings signals.
      </p>

      {/* ── Bottom CTA pill button ── */}
      <Link
        to="/dashboard/analytics"
        className="mt-5 inline-flex items-center justify-center rounded-full bg-[var(--color-teal)]/10 px-5 py-2 text-[12px] font-semibold text-[var(--color-teal)] transition-all hover:bg-[var(--color-teal)]/18 hover:shadow-sm active:scale-[0.97]"
      >
        Explore Details
      </Link>
    </motion.div>
  );
}
