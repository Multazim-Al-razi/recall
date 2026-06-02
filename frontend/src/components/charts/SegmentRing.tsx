import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface RingSegment {
  /** Stable identity for hover / click. */
  key: string;
  /** Relative weight of the segment. */
  value: number;
  /** Solid colour — no gradients. */
  color: string;
  label?: string;
}

interface Props {
  segments: RingSegment[];
  size?: number;
  /** Ring thickness; also the pill cap radius. */
  thickness?: number;
  /** Gap between pills along the ring, in px of circumference. */
  gap?: number;
  /** Key of the currently emphasised segment. */
  activeKey?: string | null;
  onActivate?: (key: string | null) => void;
  onSelect?: (key: string) => void;
  children?: ReactNode;
  className?: string;
  ariaLabel?: string;
}

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A donut built from rounded "pill" segments. Each segment is a stroked arc
 * with round caps, drawn in order so the rounded head of the next pill tucks
 * behind the rounded tail of the previous one — a continuous ring with no
 * sharp corners. Colours are flat; emphasis is by thickness + dimming.
 */
export function SegmentRing({
  segments,
  size = 188,
  thickness = 20,
  gap = 3,
  activeKey,
  onActivate,
  onSelect,
  children,
  className = '',
  ariaLabel,
}: Props) {
  const reduce = prefersReduced();
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const active = thickness + 6;
  const r = (size - active) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;

  let acc = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((s) => {
      const len = (s.value / total) * c;
      const start = acc;
      acc += len;
      // Keep a hair of length so single-segment rings still render a cap.
      const drawn = Math.max(len - gap, Math.min(len, 0.5));
      return { ...s, drawn, start };
    });

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} role="img" aria-label={ariaLabel}>
        {/* Track */}
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke="var(--color-hairline)"
          strokeWidth={thickness}
        />
        {arcs.map((a, i) => {
          const dim = activeKey != null && activeKey !== a.key;
          const on = activeKey === a.key;
          return (
            <motion.circle
              key={a.key}
              cx={cx}
              cy={cx}
              r={r}
              fill="none"
              stroke={a.color}
              strokeWidth={on ? active : thickness}
              strokeLinecap="round"
              strokeDasharray={`${a.drawn} ${c - a.drawn}`}
              strokeDashoffset={-a.start}
              transform={`rotate(-90 ${cx} ${cx})`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: dim ? 0.3 : 1 }}
              transition={{
                opacity: { duration: 0.35, delay: reduce ? 0 : 0.15 + i * 0.08 },
              }}
              style={{
                cursor: onSelect ? 'pointer' : 'default',
                transition: 'stroke-width 0.25s var(--ease-out-soft)',
              }}
              onMouseEnter={() => onActivate?.(a.key)}
              onMouseLeave={() => onActivate?.(null)}
              onClick={() => onSelect?.(a.key)}
            >
              {a.label && <title>{a.label}</title>}
            </motion.circle>
          );
        })}
      </svg>
      {children && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      )}
    </div>
  );
}
