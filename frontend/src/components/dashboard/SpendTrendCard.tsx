import { useMemo } from 'react';
import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import { useSubscriptionStore, getSpendHistory } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { formatMoney } from '@/lib/format';

/**
 * Wide trend card echoing the reference's "Main Stocks" line panel. Plots the
 * trailing spend history as a smooth area + line so the user can read where
 * their monthly burn is heading, with a delta chip versus the first month.
 */
export function SpendTrendCard() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const cur = useAccountStore((s) => s.profile.currency);

  const history = useMemo(
    () => getSpendHistory(subscriptions, 9),
    [subscriptions],
  );

  const latest = history[history.length - 1]?.value ?? 0;
  const first = history[0]?.value ?? latest;
  const change = first > 0 ? ((latest - first) / first) * 100 : 0;

  const w = 520;
  const h = 110;
  const pad = 6;
  const values = history.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = history.map((p, i) => {
    const x = pad + (i / (history.length - 1 || 1)) * (w - pad * 2);
    const y = h - pad - ((p.value - min) / span) * (h - pad * 2);
    return { x, y };
  });

  const linePath = points
    .map((pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = points[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    })
    .join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${h} L ${points[0].x} ${h} Z`;

  return (
    <div className="card-premium flex h-full flex-col justify-between gap-3 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-[24px] font-light tabular-nums">
            {formatMoney(latest * 12, cur)}
          </div>
          <div className="mt-0.5 text-[12px] font-semibold text-ink">
            Projected yearly
          </div>
          <div className="text-[11px] text-muted">Trailing spend trend</div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
            change >= 0
              ? 'bg-rausch/10 text-rausch'
              : 'bg-teal/10 text-teal'
          }`}
        >
          {change >= 0 ? '+' : ''}
          {change.toFixed(1)}%
        </span>
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-[88px] w-full"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="spendTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-rausch)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-rausch)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#spendTrendFill)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--color-rausch)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.length > 0 && (
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={3.5}
            fill="var(--color-rausch)"
          />
        )}
      </svg>

      <Link
        to="/dashboard/analytics"
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-rausch"
      >
        Open analytics
        <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}
