import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useSubscriptionStore, getSpendHistory } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { formatMoney } from '@/lib/format';

/**
 * Expenses area chart — inspired by the Bankio "Expenses" panel.
 * Shows a smooth area + line chart of trailing 10-month spend history with
 * Y-axis scale markers, a prominent total, and a date period pill.
 */
export function SpendTrendCard() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const cur = useAccountStore((s) => s.profile.currency);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const history = useMemo(
    () => getSpendHistory(subscriptions, 10),
    [subscriptions],
  );

  const latest = history[history.length - 1]?.value ?? 0;
  const first = history[0]?.value ?? latest;
  const change = first > 0 ? ((latest - first) / first) * 100 : 0;

  // SVG dimensions
  const w = 560;
  const h = 160;
  const padX = 48;
  const padTop = 16;
  const padBot = 24;
  const chartW = w - padX * 2;
  const chartH = h - padTop - padBot;

  const values = history.map((p) => p.value);
  const min = 0;
  const max = Math.max(...values, 1);
  const span = max - min || 1;

  // Y-axis nice ticks
  const yTicks = useMemo(() => {
    const step = Math.ceil(max / 4 / 100) * 100 || 1;
    const ticks: number[] = [];
    for (let v = 0; v <= max + step; v += step) {
      ticks.push(v);
      if (ticks.length >= 5) break;
    }
    return ticks;
  }, [max]);

  const points = history.map((p, i) => {
    const x = padX + (i / (history.length - 1 || 1)) * chartW;
    const y = padTop + chartH - ((p.value - min) / span) * chartH;
    return { x, y, ...p };
  });

  const linePath = points
    .map((pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = points[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    })
    .join(' ');

  const areaPath = linePath
    ? `${linePath} L ${points[points.length - 1].x} ${h - padBot} L ${points[0].x} ${h - padBot} Z`
    : '';

  const hoverPoint = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="card-premium flex flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">Expenses</h3>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-display text-[26px] font-light tabular-nums text-ink">
              {formatMoney(latest, cur)}
            </span>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
            change >= 0
              ? 'bg-rausch/10 text-rausch'
              : 'bg-teal/10 text-teal'
          }`}
        >
          {change >= 0 ? '+' : ''}
          {change.toFixed(1)}%
        </span>
      </div>

      {/* Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="h-[160px] w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label="Monthly expenses trend over 10 months"
          onMouseLeave={() => setHoverIdx(null)}
        >
          <defs>
            <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-teal)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="var(--color-teal)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Y-axis gridlines + labels */}
          {yTicks.map((tick) => {
            const y = padTop + chartH - ((tick - min) / span) * chartH;
            if (y < padTop - 2 || y > h - padBot + 2) return null;
            return (
              <g key={tick}>
                <line
                  x1={padX}
                  y1={y}
                  x2={w - padX}
                  y2={y}
                  stroke="var(--color-hairline)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padX - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="var(--color-muted)"
                  fontSize="10"
                  fontFamily="var(--font-sans)"
                >
                  {tick >= 1000 ? `${(tick / 1000).toFixed(0)}k` : tick}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {areaPath && (
            <motion.path
              d={areaPath}
              fill="url(#expenseFill)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}

          {/* Line */}
          {linePath && (
            <motion.path
              d={linePath}
              fill="none"
              stroke="var(--color-teal)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          )}

          {/* Invisible hover targets */}
          {points.map((pt, i) => (
            <rect
              key={i}
              x={pt.x - chartW / (points.length * 2)}
              y={padTop}
              width={chartW / points.length}
              height={chartH}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
            />
          ))}

          {/* Hover crosshair */}
          {hoverPoint && (
            <>
              <line
                x1={hoverPoint.x}
                y1={padTop}
                x2={hoverPoint.x}
                y2={h - padBot}
                stroke="var(--color-muted)"
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.4}
              />
              <circle
                cx={hoverPoint.x}
                cy={hoverPoint.y}
                r={5}
                fill="var(--color-teal)"
                stroke="var(--color-surface)"
                strokeWidth={2.5}
              />
            </>
          )}

          {/* Latest point dot */}
          {!hoverPoint && points.length > 0 && (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={4}
              fill="var(--color-teal)"
              stroke="var(--color-surface)"
              strokeWidth={2}
            />
          )}

          {/* X-axis labels */}
          {points.map((pt, i) => {
            // Show every other label if there are many
            if (points.length > 7 && i % 2 !== 0 && i !== points.length - 1) return null;
            return (
              <text
                key={i}
                x={pt.x}
                y={h - 4}
                textAnchor="middle"
                fill="var(--color-muted)"
                fontSize="10"
                fontFamily="var(--font-sans)"
              >
                {pt.label}
              </text>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoverPoint && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="pointer-events-none absolute z-10 rounded-lg bg-ink px-3 py-1.5 text-[12px] font-semibold tabular-nums text-surface shadow-[var(--shadow-md)]"
            style={{
              left: `${(hoverPoint.x / w) * 100}%`,
              top: `${((hoverPoint.y - 28) / h) * 100}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {formatMoney(hoverPoint.value, cur)}
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <Link
        to="/dashboard/analytics"
        className="inline-flex items-center gap-1.5 self-start text-[12px] font-medium text-teal transition-colors hover:text-teal-hover"
      >
        Open analytics
        <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}
