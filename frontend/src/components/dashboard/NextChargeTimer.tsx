import { useEffect, useState } from 'react';
import { CATEGORY_COLORS } from '@/types/subscription';

import { useSubscriptionStore, getUpcomingRenewals } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { formatMoney } from '@/lib/format';
import { ProviderIcon } from '@/components/ui/ProviderIcon';

export function NextChargeTimer() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const currency = useAccountStore((s) => s.profile.currency);
  
  // Get the next upcoming subscription within the next year
  const upcoming = getUpcomingRenewals(subscriptions, 365)[0];

  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!upcoming) return;

    const targetDate = new Date(upcoming.nextRenewalDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [upcoming]);

  if (!upcoming || !timeLeft) {
    return (
      <div className="card-premium flex flex-col items-center justify-center p-6 text-center relative overflow-hidden min-h-[160px]">
        {/* Dot Matrix Background */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03] text-ink"
          width="100%" 
          height="100%"
        >
          <defs>
            <pattern 
              id="dot-matrix" 
              x="0" 
              y="0" 
              width="14" 
              height="14" 
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="1.5" fill="currentColor" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#dot-matrix)" />
        </svg>

        <div className="relative z-10 flex flex-col items-center">
          <p className="text-[14px] font-medium text-ink">No upcoming charges</p>
          <p className="mt-1.5 text-[13px] text-muted max-w-[200px]">
            Add a subscription to see your next charge countdown here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-premium flex flex-col justify-between p-6 overflow-hidden relative">
      {/* Background glow based on category color */}
      <div 
        className="absolute -top-12 -right-12 h-32 w-32 rounded-full opacity-[0.15] blur-[40px] pointer-events-none"
        style={{ backgroundColor: CATEGORY_COLORS[upcoming.category] || 'var(--color-rausch)' }}
      />

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
            Upcoming Renewal
          </h3>
          <span className="text-[13px] font-medium text-ink tabular-nums">
            {new Date(upcoming.nextRenewalDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <ProviderIcon name={upcoming.name} icon={upcoming.providerIcon} size={40} className="shadow-[var(--shadow-sm)]" />
          <div>
            <h4 className="font-display text-[22px] font-medium leading-none tracking-tight text-ink">
              {upcoming.name}
            </h4>
            <p className="text-[14px] text-muted mt-1 font-medium">
              {formatMoney(upcoming.amount, currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-col items-center justify-center bg-canvas/60 rounded-lg py-2.5 border border-ink/5">
          <span className="font-display text-[24px] font-light leading-none tabular-nums text-ink">
            {String(timeLeft.d).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted mt-1">Days</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-canvas/60 rounded-lg py-2.5 border border-ink/5">
          <span className="font-display text-[24px] font-light leading-none tabular-nums text-ink">
            {String(timeLeft.h).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted mt-1">Hrs</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-canvas/60 rounded-lg py-2.5 border border-ink/5">
          <span className="font-display text-[24px] font-light leading-none tabular-nums text-ink">
            {String(timeLeft.m).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted mt-1">Min</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-canvas/60 rounded-lg py-2.5 border border-ink/5">
          <span className="font-display text-[24px] font-light leading-none tabular-nums text-ink">
            {String(timeLeft.s).padStart(2, '0')}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted mt-1">Sec</span>
        </div>
      </div>
    </div>
  );
}
