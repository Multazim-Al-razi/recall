import { useMemo } from 'react';
import { Link } from 'react-router';
import { format, differenceInDays } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { useSubscriptionStore, getUpcomingRenewals } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { currencySymbol } from '@/lib/format';

interface Props {
  /** Cap the number of rows shown; remainder is summarised with a link. */
  limit?: number;
}

export function RenewalTimeline({ limit }: Props) {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const cur = useAccountStore((s) => s.profile.currency);
  const sym = currencySymbol(cur);

  const upcoming = useMemo(() => getUpcomingRenewals(subscriptions, 30), [subscriptions]);

  const shown = limit ? upcoming.slice(0, limit) : upcoming;
  const remaining = upcoming.length - shown.length;

  return (
    <div className="flex min-h-[300px] flex-col rounded-xl bg-surface p-6 md:p-7">
      <div className="mb-[18px] text-[10px] font-bold uppercase tracking-[2.5px] text-muted">
        Renewal timeline
      </div>
      {shown.map((sub) => {
        const days = differenceInDays(new Date(sub.nextRenewalDate), new Date());
        const isUrgent = days <= 2;
        const cancelLabel =
          days <= 1 ? 'Cancel by today' : `Cancel by ${format(new Date(sub.nextRenewalDate), 'MMM d')}`;

        return (
          <div
            key={sub.id}
            className="flex items-center gap-4 border-b border-ink/4 py-3.5 last:border-b-0"
          >
            <div className="w-[60px] shrink-0 text-center">
              <div className="text-[22px] font-bold leading-none tracking-[-1px]">
                {format(new Date(sub.nextRenewalDate), 'd')}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[1px] text-muted">
                {format(new Date(sub.nextRenewalDate), 'MMM')}
              </div>
            </div>
            <div
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                isUrgent ? 'bg-rausch' : 'bg-muted'
              }`}
            />
            <div className="flex-1">
              <div className="text-sm font-semibold">{sub.name}</div>
              <div className="text-[13px] text-muted">
                {sym}{sub.amount.toFixed(2)}
              </div>
            </div>
            <div className="cursor-pointer text-[11px] font-medium text-rausch">
              {cancelLabel}
            </div>
          </div>
        );
      })}

      {upcoming.length === 0 && (
        <div className="flex flex-1 items-center justify-center py-6 text-[13px] text-muted">
          No renewals in the next 30 days.
        </div>
      )}

      {remaining > 0 && (
        <Link
          to="/dashboard/subscriptions"
          className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-medium text-muted transition-colors hover:text-ink"
        >
          +{remaining} more upcoming
          <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}
