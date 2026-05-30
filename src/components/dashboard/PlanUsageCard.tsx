import { Link } from 'react-router';
import { CreditCard, ArrowUpRight } from 'lucide-react';
import { useAccountStore } from '@/stores/account';
import { useSubscriptionStore, getActiveSubscriptions } from '@/stores/subscription';
import { PLAN_CONFIG } from '@/types/plan';

/** Dashboard widget: current plan + subscription-limit usage. */
export function PlanUsageCard() {
  const plan = useAccountStore((s) => s.plan);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);

  const config = PLAN_CONFIG[plan];
  const active = getActiveSubscriptions(subscriptions).length;
  const limit = config.subscriptionLimit;
  const pct = limit === Infinity ? 12 : Math.min(100, (active / limit) * 100);
  const nearLimit = limit !== Infinity && active / limit >= 0.8;

  return (
    <div className="flex flex-col rounded-[18px] bg-surface p-5">
      <div className="flex items-center justify-between">
        <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2px] text-muted">
          <CreditCard size={13} />
          Your plan
        </div>
        <span
          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[1px] text-white"
          style={{ background: config.accent }}
        >
          {config.name}
        </span>
      </div>

      <div className="mt-4 flex items-baseline justify-between text-[13px]">
        <span className="font-medium">Subscriptions used</span>
        <span className="text-muted">
          {active} / {limit === Infinity ? 'unlimited' : limit}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/8">
        <div
          className={`h-full rounded-full transition-all ${nearLimit ? 'bg-rausch' : 'bg-success'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <Link
        to="/pricing"
        className="mt-5 inline-flex items-center justify-center gap-1.5 rounded-full border border-ink/12 px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-rausch/40 hover:text-rausch"
      >
        {plan === 'max' ? 'View plans' : 'Upgrade plan'}
        <ArrowUpRight size={15} />
      </Link>
    </div>
  );
}
