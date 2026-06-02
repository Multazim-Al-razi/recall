import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import {
  useSubscriptionStore,
  getExpiringTrials,
  getFreeTrials,
} from '@/stores/subscription';
import { MS_PER_DAY } from '@/lib/date';

/**
 * Dot-grid countdown to the next trial conversion — the reference's "13 Days"
 * tile, repurposed to the most time-sensitive event Recall tracks. Each dot is
 * a day; filled dots are days elapsed in a 14-day trial window.
 */
export function TrialCountdownCard() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);

  const next = useMemo(() => {
    const expiring = getExpiringTrials(subscriptions, 30);
    const all = expiring.length ? expiring : getFreeTrials(subscriptions);
    return all
      .map((s) => {
        const end = new Date(s.trialEndDate || s.nextRenewalDate);
        const days = Math.max(
          0,
          Math.ceil((end.getTime() - Date.now()) / MS_PER_DAY),
        );
        return { sub: s, days };
      })
      .sort((a, b) => a.days - b.days)[0];
  }, [subscriptions]);

  const window = 14;
  const daysLeft = next?.days ?? 0;
  const elapsed = Math.min(window, Math.max(0, window - daysLeft));

  return (
    <div className="card-premium flex h-full flex-col justify-between gap-4 p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-ink-soft">
          <Clock size={16} />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
          {next ? next.sub.name : 'No trials'}
        </span>
      </div>

      <div>
        <div className="font-display text-[26px] font-light leading-none tracking-[-0.5px] tabular-nums">
          {daysLeft} {daysLeft === 1 ? 'Day' : 'Days'}
        </div>
        <div className="mt-1 text-[11px] text-muted">
          {next ? 'until it converts to paid' : 'all clear, nothing converting'}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: window }).map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${
              i < elapsed ? 'bg-rausch' : 'bg-ink/12'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
