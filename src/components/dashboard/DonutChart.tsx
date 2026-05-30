import type { Category } from '@/types/subscription';
import { CATEGORY_CONFIG, CATEGORY_COLORS } from '@/types/subscription';
import { currencySymbol, formatMoney } from '@/lib/format';

interface Props {
  data: Record<string, number>;
  total: number;
  currency?: string;
}

export function DonutChart({ data, total, currency = 'USD' }: Props) {
  const sym = currencySymbol(currency);
  const entries = Object.entries(data)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  const circumference = 2 * Math.PI * 80;
  const safeTotal = total || 1; // Prevent division by zero

  // Precompute cumulative offsets without mutating across renders.
  const segments = entries.map(([cat, amount], i) => {
    const dash = (amount / safeTotal) * circumference;
    const offset = entries
      .slice(0, i)
      .reduce((sum, [, a]) => sum + (a / safeTotal) * circumference, 0);
    return { cat, dash, offset };
  });

  return (
    <div className="flex min-h-[300px] flex-col items-center gap-7 rounded-[20px] bg-surface p-6 sm:flex-row md:p-7">
      <div className="relative h-[180px] w-[180px] shrink-0">
        <svg viewBox="0 0 200 200" width="180" height="180" role="img" aria-label={`Spending breakdown: ${formatMoney(total, currency)} per month`}>
          <circle cx="100" cy="100" r="80" fill="none" stroke="#ece8e3" strokeWidth="24" />
          {segments.map(({ cat, dash, offset }) => (
            <circle
              key={cat}
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={CATEGORY_COLORS[cat as Category]}
              strokeWidth="24"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 100 100)"
            />
          ))}
        </svg>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-[26px] font-bold tracking-[-1px]">
            {sym}{Math.round(total)}
          </div>
          <div className="text-[10px] uppercase tracking-[1.5px] text-muted">
            /month
          </div>
        </div>
      </div>

      <div className="w-full flex-1">
        {entries.map(([cat, amount]) => (
          <div
            key={cat}
            className="flex items-center gap-2.5 border-b border-ink/4 py-2 last:border-b-0"
          >
            <div
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: CATEGORY_COLORS[cat as Category] }}
            />
            <div className="flex-1 text-[13px] font-medium">
              {CATEGORY_CONFIG[cat as Category].label}
            </div>
            <div className="text-[13px] font-semibold">
              {sym}{amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
