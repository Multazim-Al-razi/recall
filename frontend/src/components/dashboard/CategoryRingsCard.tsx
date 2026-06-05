import { useMemo, useState } from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { useSubscriptionStore, getByCategory, getMonthlySpend } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { currencySymbol } from '@/lib/format';
import { CATEGORY_CONFIG } from '@/types/subscription';
import type { Category } from '@/types/subscription';
import { Dropdown } from '@/components/ui/Dropdown';

type Period = 'monthly' | 'yearly';

/**
 * Concentric bullseye + breakdown. The reference's "Annual profits" nested
 * circles, mapped to the top spend categories. All circles share one bottom
 * center and are sized (% of the square) by monthly amount, so they nest; a
 * single sienna hue deepens toward the smallest ring. The breakdown rows give
 * each category clear label / amount / share separation.
 */
export function CategoryRingsCard() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const cur = useAccountStore((s) => s.profile.currency);
  const sym = currencySymbol(cur);
  const [active, setActive] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('monthly');

  // Aggregate by category, normalized to either monthly or yearly.
  const total = useMemo(() => {
    const monthly = getMonthlySpend(subscriptions);
    return period === 'yearly' ? monthly * 12 : monthly;
  }, [subscriptions, period]);

  const rings = useMemo(() => {
    const byCat = getByCategory(subscriptions);
    const multiplier = period === 'yearly' ? 12 : 1;
    return Object.entries(byCat)
      .filter(([, v]) => v > 0)
      .map(([cat, amount]) => [cat, amount * multiplier] as const)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([cat, amount]) => ({
        cat: cat as Category,
        amount,
        label: CATEGORY_CONFIG[cat as Category].label,
      }));
  }, [subscriptions, period]);

  const n = rings.length;
  // Single rausch hue, deepening toward the inner ring. The inner ring stays a
  // lighter shade (not full solid) but dark enough that white reads on it.
  const shade = (i: number) => (n > 1 ? 0.16 + (i / (n - 1)) * 0.69 : 0.85);

  // Reference-style nested rings: radii are evenly stepped by rank (not raw
  // value), so the bullseye always reads as clean concentric circles. Circles
  // are bottom-aligned and share a center x; even stepping makes the label gaps
  // uniform, so no collision pass is needed.
  const VB = 200;
  const cx = VB / 2;
  const bottom = VB - 6;
  const maxR = 90;
  const minR = 34;
  const step = n > 1 ? (maxR - minR) / (n - 1) : 0;
  const geo = rings.map((ring, i) => {
    const r = maxR - i * step;
    return { ...ring, i, r, top: bottom - 2 * r };
  });
  const labels = geo.map((g) => {
    const isInner = g.i === n - 1;
    // Innermost ring: value centered. Others: near the top arc, nudged up ~2%
    // then back down 6px so they sit just inside each ring.
    const y = isInner ? bottom - g.r : g.top + 16 - VB * 0.02 + 6;
    return { y, isInner, amount: g.amount };
  });

  return (
    <div className="card-premium flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-muted">
            Spend by category
          </h3>
          <div className="mt-1.5 font-display text-[22px] font-light leading-none tabular-nums">
            {sym}
            {Math.round(total)}
            <span className="ml-1.5 text-[12px] font-sans text-muted">
              /{period === 'yearly' ? 'yr' : 'mo'}
            </span>
          </div>
        </div>
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              aria-label="Change time period"
              className="inline-flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink-soft transition-colors hover:text-ink"
            >
              <Calendar size={11} />
              {period === 'yearly' ? 'Yearly' : 'Monthly'}
              <ChevronDown size={12} />
            </button>
          }
          items={[
            {
              label: 'Monthly',
              onClick: () => setPeriod('monthly'),
            },
            {
              label: 'Yearly',
              onClick: () => setPeriod('yearly'),
            },
          ]}
        />
      </div>

      {/* Bullseye */}
      <div className="relative mx-auto w-full max-w-[210px]">
        {n > 0 ? (
          <svg
            viewBox={`0 0 ${VB} ${VB}`}
            className="h-auto w-full"
            role="img"
            aria-label="Spend by category, nested by amount"
          >
            <defs>
              <filter id="ringShadow" x="-30%" y="-10%" width="160%" height="135%">
                <feDropShadow
                  dx="0"
                  dy="10"
                  stdDeviation="9"
                  floodColor="var(--color-rausch)"
                  floodOpacity="0.22"
                />
              </filter>
            </defs>
            <g filter="url(#ringShadow)">
              {geo.map((g) => {
                const dim = active && active !== g.cat;
                return (
                  <circle
                    key={g.cat}
                    cx={cx}
                    cy={bottom - g.r}
                    r={g.r}
                    fill="var(--color-rausch)"
                    style={{
                      opacity: dim ? shade(g.i) * 0.55 : shade(g.i),
                      transition: 'opacity 0.2s',
                      cursor: 'default',
                    }}
                    onMouseEnter={() => setActive(g.cat)}
                    onMouseLeave={() => setActive(null)}
                  >
                    <title>
                      {g.label}: {sym}
                      {g.amount.toFixed(2)}
                    </title>
                  </circle>
                );
              })}
            </g>
            {labels.map((l, i) => (
              <text
                key={i}
                x={cx}
                y={l.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none select-none"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 14,
                  fontWeight: 600,
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '-0.3px',
                }}
              >
                <tspan style={{ fill: l.isInner ? '#fff' : 'var(--color-rausch)' }}>
                  {sym}
                </tspan>
                <tspan dx="2" style={{ fill: l.isInner ? '#fff' : '#000' }}>
                  {Math.round(l.amount)}
                </tspan>
              </text>
            ))}
          </svg>
        ) : (
          <div className="flex h-[160px] items-center justify-center text-[13px] text-muted">
            No active spend yet.
          </div>
        )}
      </div>

      {/* Breakdown rows */}
      {n > 0 && (
        <div className="mt-6 flex flex-col gap-0.5">
          {rings.map((ring, i) => {
            const pct = total > 0 ? Math.round((ring.amount / total) * 100) : 0;
            const isActive = active === ring.cat;
            return (
              <div
                key={ring.cat}
                onMouseEnter={() => setActive(ring.cat)}
                onMouseLeave={() => setActive(null)}
                className={`-mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors ${
                  isActive ? 'bg-ink/4' : ''
                }`}
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: 'var(--color-rausch)', opacity: shade(i) }}
                />
                <span className="flex-1 text-[13px] font-medium text-ink">
                  {ring.label}
                </span>
                <span className="text-[13px] font-semibold tabular-nums text-ink">
                  {sym}
                  {ring.amount.toFixed(2)}
                </span>
                <span className="w-9 text-right text-[11px] tabular-nums text-muted">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
