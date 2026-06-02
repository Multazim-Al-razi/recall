import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import type { Category } from '@/types/subscription';
import { CATEGORY_CONFIG, CATEGORY_COLORS } from '@/types/subscription';
import { SegmentRing } from '@/components/charts/SegmentRing';
import { currencySymbol, formatMoney } from '@/lib/format';

interface Props {
  data: Record<string, number>;
  total: number;
  currency?: string;
}

/** Count up to `target` once on mount, respecting reduced-motion. */
function useCountUp(target: number, duration = 1100) {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [value, setValue] = useState(prefersReduced ? target : 0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (prefersReduced) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(target * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, prefersReduced]);

  return value;
}

export function DonutChart({ data, total, currency = 'USD' }: Props) {
  const sym = currencySymbol(currency);
  const navigate = useNavigate();
  const [hoveredCat, setHoveredCat] = useState<string | null>(null);
  const animated = useCountUp(total);

  const entries = Object.entries(data)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  const segments = entries.map(([cat, amount]) => ({
    key: cat,
    value: amount,
    color: CATEGORY_COLORS[cat as Category],
    label: `${CATEGORY_CONFIG[cat as Category].label}: ${sym}${amount.toFixed(2)}/mo`,
  }));

  const goToSubscriptions = () => navigate('/dashboard/subscriptions');

  return (
    <div className="card-premium flex min-h-[300px] flex-col items-center gap-7 p-6 sm:flex-row md:p-7">
      <SegmentRing
        segments={segments}
        size={188}
        thickness={16}
        gap={6}
        activeKey={hoveredCat}
        onActivate={setHoveredCat}
        onSelect={goToSubscriptions}
        className="shrink-0"
        ariaLabel={`Spending breakdown: ${formatMoney(total, currency)} per month`}
      >
        <div className="font-display text-[32px] font-light leading-none tracking-[-1px] tabular-nums">
          {sym}{Math.round(animated)}
        </div>
        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[1.8px] text-muted">
          per month
        </div>
      </SegmentRing>

      <div className="w-full flex-1">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[2px] text-muted">
          Where it goes
        </div>
        {entries.map(([cat, amount]) => {
          const pct = total > 0 ? ((amount / total) * 100).toFixed(0) : '0';
          const isHovered = hoveredCat === cat;
          return (
            <div
              key={cat}
              className={`flex items-center gap-2.5 rounded-md px-1.5 py-2 -mx-1.5 cursor-pointer transition-colors ${
                isHovered ? 'bg-ink/4' : 'hover:bg-ink/3'
              }`}
              onMouseEnter={() => setHoveredCat(cat)}
              onMouseLeave={() => setHoveredCat(null)}
              onClick={goToSubscriptions}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goToSubscriptions(); }}
            >
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: CATEGORY_COLORS[cat as Category] }}
              />
              <div className="flex-1 text-[13px] font-medium">
                {CATEGORY_CONFIG[cat as Category].label}
              </div>
              <div className="text-right">
                <div className="text-[13px] font-semibold tabular-nums">
                  {sym}{amount.toFixed(2)}
                </div>
                <div className="text-[11px] text-muted">{pct}%</div>
              </div>
            </div>
          );
        })}
        {entries.length === 0 && (
          <div className="py-6 text-center text-[13px] text-muted">No active spend yet.</div>
        )}
      </div>
    </div>
  );
}
