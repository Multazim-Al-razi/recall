import { differenceInDays } from 'date-fns';
import type { Subscription } from '@/types/subscription';

interface Props {
  trials: Subscription[];
}

export function TrialCard({ trials }: Props) {
  if (trials.length === 0) return null;

  return (
    <div className="flex min-h-[180px] flex-col justify-between rounded-xl border-2 border-dashed border-rausch/15 bg-transparent p-6 md:p-7">
      <div>
        <div className="mb-3.5 text-[10px] font-bold uppercase tracking-[2.5px] text-muted">
          Free trials
        </div>
        {trials.map((trial) => {
          const endDate = trial.trialEndDate || trial.nextRenewalDate;
          const daysLeft = differenceInDays(new Date(endDate), new Date());
          const isUrgent = daysLeft <= 5;

          return (
            <div
              key={trial.id}
              className="flex items-center justify-between border-b border-ink/4 py-2.5 last:border-b-0"
            >
              <div className="text-[13px] font-medium">{trial.name}</div>
              <div
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  isUrgent
                    ? 'bg-rausch/8 text-rausch'
                    : 'bg-warning/8 text-warning'
                }`}
              >
                {daysLeft} days left
              </div>
            </div>
          );
        })}
      </div>
      <div className="text-xs text-muted">
        {trials.length === 1 ? 'Converts' : 'All convert'} to paid if not cancelled.
      </div>
    </div>
  );
}
