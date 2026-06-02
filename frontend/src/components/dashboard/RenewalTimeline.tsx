import { useMemo } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import {
  useSubscriptionStore,
  getUpcomingRenewals,
} from "@/stores/subscription";
import { useAccountStore } from "@/stores/account";
import { currencySymbol } from "@/lib/format";
import { ProviderIcon } from "@/components/ui/ProviderIcon";
import {
  urgencyForDays,
  URGENCY_STYLES,
  daysUntil,
  renewalLabel,
} from "@/lib/urgency";
import { CATEGORY_CONFIG } from "@/types/subscription";

interface Props {
  /** Cap the number of rows shown; remainder is summarised with a link. */
  limit?: number;
}

export function RenewalTimeline({ limit }: Props) {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const cur = useAccountStore((s) => s.profile.currency);
  const sym = currencySymbol(cur);

  const upcoming = useMemo(
    () => getUpcomingRenewals(subscriptions, 30),
    [subscriptions],
  );

  const shown = limit ? upcoming.slice(0, limit) : upcoming;
  const remaining = upcoming.length - shown.length;

  return (
    <div className="card-premium flex min-h-[300px] flex-col p-6 md:p-7">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-[2.5px] text-muted">
          Renewal timeline
        </div>
        <div className="flex items-center gap-3 text-[10px] font-medium text-muted">
          <Legend swatch="bg-rausch" label="Now" />
          <Legend swatch="bg-warning" label="Soon" />
          <Legend swatch="bg-success" label="Later" />
        </div>
      </div>

      {shown.map((sub) => {
        const days = daysUntil(sub.nextRenewalDate);
        const style = URGENCY_STYLES[urgencyForDays(days)];
        const config = CATEGORY_CONFIG[sub.category];
        return (
          <Link
            to="/dashboard/subscriptions"
            key={sub.id}
            className="group -mx-2 flex items-center gap-3.5 rounded-lg px-2 py-3 transition-colors hover:bg-ink/3"
          >
            <div className="w-[52px] shrink-0 text-center">
              <div className="text-[22px] font-light leading-none tracking-[-1px]">
                {format(new Date(sub.nextRenewalDate), "d")}
              </div>
              <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[1px] text-muted">
                {format(new Date(sub.nextRenewalDate), "MMM")}
              </div>
            </div>

            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
              style={{ background: config.gradient }}
            >
              <ProviderIcon icon={sub.providerIcon} name={sub.name} size={18} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-semibold">
                {sub.name}
              </div>
              <div className="text-[12px] text-muted tabular-nums">
                {sym}
                {sub.amount.toFixed(2)}
              </div>
            </div>

            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.bg} ${style.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
              {renewalLabel(sub.nextRenewalDate)}
            </span>
          </Link>
        );
      })}

      {upcoming.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 py-8 text-center">
          <div className="text-[14px] font-medium text-ink">All clear</div>
          <div className="text-[13px] text-muted">
            No renewals in the next 30 days.
          </div>
        </div>
      )}

      {remaining > 0 && (
        <Link
          to="/dashboard/subscriptions"
          className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[12px] font-medium text-muted transition-colors hover:text-rausch"
        >
          +{remaining} more upcoming
          <ArrowRight size={13} />
        </Link>
      )}
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={`h-1.5 w-1.5 rounded-full ${swatch}`} />
      {label}
    </span>
  );
}
