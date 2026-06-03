import { useMemo } from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  useSubscriptionStore,
  getUpcomingRenewals,
  getExpiringTrials,
} from '@/stores/subscription';

/**
 * Compact dark status tile — the reference's "System Lock" chip, repurposed to
 * a reminder-protection indicator. Green when nothing's at risk, sienna when
 * renewals or trials need a decision soon.
 */
export function StatusLockCard() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);

  const atRisk = useMemo(() => {
    const renewals = getUpcomingRenewals(subscriptions, 2).length;
    const trials = getExpiringTrials(subscriptions, 7).length;
    return renewals + trials;
  }, [subscriptions]);

  const safe = atRisk === 0;

  return (
    <div className="flex h-full min-h-[150px] w-full flex-col items-center justify-center gap-3 rounded-[20px] bg-ink p-4 text-canvas shadow-[var(--shadow-md)]">
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-full ${
          safe ? 'bg-success/20 text-success' : 'bg-rausch/20 text-rausch'
        }`}
      >
        <ShieldCheck size={22} />
      </span>
      <div className="text-center">
        <div className="text-[13px] font-semibold">
          {safe ? 'All protected' : `${atRisk} need${atRisk === 1 ? 's' : ''} action`}
        </div>
        <div className="mt-0.5 text-[10px] uppercase tracking-[1.5px] text-muted">
          Reminders on
        </div>
      </div>
    </div>
  );
}
