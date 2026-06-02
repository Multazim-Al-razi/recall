import { Link } from 'react-router';
import { format } from 'date-fns';
import { ArrowUpRight } from 'lucide-react';
import type { Subscription } from '@/types/subscription';
import { CATEGORY_CONFIG } from '@/types/subscription';
import { useAccountStore } from '@/stores/account';
import { currencySymbol } from '@/lib/format';
import { ProviderIcon } from '@/components/ui/ProviderIcon';
import { urgencyForSubscription, URGENCY_STYLES, daysUntil, renewalLabel } from '@/lib/urgency';

interface Props {
  subscription: Subscription;
}

const CYCLE_LABEL: Record<Subscription['billingCycle'], string> = {
  monthly: 'Monthly',
  yearly: 'Yearly',
  weekly: 'Weekly',
  custom: 'Custom cycle',
};

const CYCLE_SUFFIX: Record<Subscription['billingCycle'], string> = {
  monthly: '/mo',
  yearly: '/yr',
  weekly: '/wk',
  custom: '',
};

export function SubscriptionCard({ subscription: s }: Props) {
  const config = CATEGORY_CONFIG[s.category];
  const cur = useAccountStore((st) => st.profile.currency);
  const sym = currencySymbol(cur);

  const urgency = urgencyForSubscription(s);
  const style = URGENCY_STYLES[urgency];
  const days = daysUntil(s.nextRenewalDate);

  return (
    <Link
      to="/dashboard/subscriptions"
      className="group card-premium flex min-h-[230px] flex-col p-6"
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-[16px] shadow-[inset_0_0_0_1px_rgba(26,26,26,0.04)] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-0.5 group-hover:scale-[1.04]"
          style={{ background: config.gradient }}
        >
          <ProviderIcon icon={s.providerIcon} name={s.name} className="h-7 w-7" />
        </div>

        {/* Urgency / trial chip */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${style.bg} ${style.text}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {s.isFreeTrial ? 'Trial' : renewalLabel(s.nextRenewalDate)}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-1.5">
        <span className="text-[16px] font-semibold tracking-tight">{s.name}</span>
        <ArrowUpRight
          size={15}
          className="text-muted opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
        />
      </div>
      <div className="mt-0.5 text-[13px] text-muted">
        {CYCLE_LABEL[s.billingCycle]} · {config.label}
      </div>

      <div className="mt-auto flex items-end justify-between border-t border-hairline pt-4">
        <div>
          <div className="font-display text-[23px] font-light leading-none tracking-[-0.5px] tabular-nums">
            {sym}{s.amount.toFixed(2)}
            {CYCLE_SUFFIX[s.billingCycle] && (
              <span className="ml-0.5 font-sans text-[11px] font-normal text-muted">
                {CYCLE_SUFFIX[s.billingCycle]}
              </span>
            )}
          </div>
          <div className="mt-1.5 text-[11px] text-muted">
            {days <= 1 ? 'Renews today' : `Renews ${format(new Date(s.nextRenewalDate), 'MMM d')}`}
          </div>
        </div>
      </div>
    </Link>
  );
}
