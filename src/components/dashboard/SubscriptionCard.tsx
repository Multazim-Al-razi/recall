import { useState } from 'react';
import { format, differenceInDays } from 'date-fns';
import type { Subscription } from '@/types/subscription';
import { CATEGORY_CONFIG } from '@/types/subscription';
import { useAccountStore } from '@/stores/account';
import { currencySymbol } from '@/lib/format';

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
  const [iconFailed, setIconFailed] = useState(false);

  const daysUntilRenewal = differenceInDays(new Date(s.nextRenewalDate), new Date());
  const cancelLabel =
    daysUntilRenewal <= 1
      ? 'Cancel by today'
      : `Cancel by ${format(new Date(s.nextRenewalDate), 'MMM d')}`;

  return (
    <div className="flex min-h-[260px] flex-col rounded-[20px] bg-surface p-7">
      <div
        className="mb-[18px] flex h-14 w-14 items-center justify-center rounded-[16px]"
        style={{ background: config.gradient }}
      >
        {s.providerIcon && !iconFailed ? (
          <img
            src={`https://cdn.simpleicons.org/${s.providerIcon}`}
            alt=""
            className="h-7 w-7"
            onError={() => setIconFailed(true)}
          />
        ) : (
          <span className="text-xl font-bold text-ink/30">{s.name.charAt(0)}</span>
        )}
      </div>

      <div className="text-base font-semibold tracking-tight">{s.name}</div>
      <div className="mt-0.5 text-[13px] text-muted">{CYCLE_LABEL[s.billingCycle]}</div>
      <div className="mt-2 text-[11px] text-muted">
        Renews {format(new Date(s.nextRenewalDate), 'MMM d')}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-ink/5 pt-[18px]">
        <div className="text-[15px] font-semibold">
          {sym}{s.amount.toFixed(2)}
          {CYCLE_SUFFIX[s.billingCycle] && (
            <span className="ml-0.5 text-[11px] font-normal text-muted">
              {CYCLE_SUFFIX[s.billingCycle]}
            </span>
          )}
        </div>
        <span className="border-b border-rausch/25 text-[11px] font-medium text-rausch">
          {cancelLabel} &rarr;
        </span>
      </div>
    </div>
  );
}
