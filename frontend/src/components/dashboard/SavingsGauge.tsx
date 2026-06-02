import { useMemo } from 'react';
import { useSubscriptionStore, getMonthlySpend, getSavingsOpportunities } from '@/stores/subscription';

/**
 * Dark radial gauge echoing the reference's "Growth rate" dial. Here it shows
 * the share of monthly spend that's recoverable through the detected savings
 * opportunities — a single, honest health number on the dark surface.
 */
export function SavingsGauge() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);

  const pct = useMemo(() => {
    const monthly = getMonthlySpend(subscriptions);
    const { totalSavings } = getSavingsOpportunities(subscriptions);
    if (monthly <= 0) return 0;
    return Math.min(Math.round((totalSavings / monthly) * 100), 100);
  }, [subscriptions]);

  const size = 132;
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (pct / 100) * c;

  return (
    <div className="flex h-full min-h-[150px] w-full flex-col items-center justify-center overflow-hidden rounded-[20px] bg-dark p-4 text-[#f5f0eb] shadow-[var(--shadow-md)]">
      <div className="relative inline-flex w-full max-w-[132px] items-center justify-center">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-rausch)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[26px] font-light leading-none tabular-nums">
            {pct}%
          </span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#9a8f86]">
            Savings rate
          </span>
        </div>
      </div>
    </div>
  );
}
