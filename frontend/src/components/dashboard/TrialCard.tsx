import type { Subscription } from '@/types/subscription';
import { CATEGORY_CONFIG } from '@/types/subscription';
import { ProviderIcon } from '@/components/ui/ProviderIcon';
import { daysUntil, urgencyForDays, URGENCY_STYLES } from '@/lib/urgency';

interface Props {
  trials: Subscription[];
}

function TrialLogo({ sub }: { sub: Subscription }) {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]"
      style={{ background: CATEGORY_CONFIG[sub.category].gradient }}
    >
      <ProviderIcon icon={sub.providerIcon} name={sub.name} size={16} />
    </div>
  );
}

export function TrialCard({ trials }: Props) {
  if (trials.length === 0) return null;

  return (
    <div className="card-premium flex min-h-[180px] flex-col justify-between p-6 md:p-7">
      <div>
        <div className="mb-3.5 flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-[2.5px] text-muted">
            Free trials
          </div>
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
            {trials.length} active
          </span>
        </div>
        {trials.map((trial) => {
          const endDate = trial.trialEndDate || trial.nextRenewalDate;
          const left = daysUntil(endDate);
          const style = URGENCY_STYLES[urgencyForDays(left)];

          return (
            <div
              key={trial.id}
              className="flex items-center gap-3 border-b border-hairline py-2.5 last:border-b-0"
            >
              <TrialLogo sub={trial} />
              <div className="flex-1 truncate text-[13px] font-medium">{trial.name}</div>
              <div className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${style.bg} ${style.text}`}>
                {left <= 0 ? 'ends today' : `${left}d left`}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 text-[12px] text-muted">
        {trials.length === 1 ? 'Converts' : 'These convert'} to paid if not cancelled in time.
      </div>
    </div>
  );
}
