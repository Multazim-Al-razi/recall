import { useMemo } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  useSubscriptionStore,
  getMonthlySpend,
  getSpendHistory,
  getActiveSubscriptions,
} from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { formatMoney } from '@/lib/format';

/**
 * Single spend-lens card. The reference stacks "Total income / Total paid";
 * here both spend lenses that matter — monthly burn and its 12-month
 * projection — live in one container, split by a hairline, so they read as one
 * coherent panel instead of two competing cards.
 */
export function FlowTiles() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const cur = useAccountStore((s) => s.profile.currency);

  const monthly = useMemo(
    () => getMonthlySpend(subscriptions),
    [subscriptions],
  );
  const activeCount = useMemo(
    () => getActiveSubscriptions(subscriptions).length,
    [subscriptions],
  );
  const history = useMemo(
    () => getSpendHistory(subscriptions, 2),
    [subscriptions],
  );

  const prev = history[0]?.value ?? monthly;
  const change = prev > 0 ? ((monthly - prev) / prev) * 100 : 0;
  const up = change >= 0;

  return (
    <div className="card-premium flex h-full flex-col p-5">
      {/* Monthly burn — primary */}
      <div className="flex flex-1 flex-col justify-between gap-4 pb-5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-[1.8px] text-muted">
            Monthly burn
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
              up ? 'bg-rausch/10 text-rausch' : 'bg-teal/10 text-teal'
            }`}
          >
            {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {up ? '+' : ''}
            {change.toFixed(1)}%
          </span>
        </div>
        <div>
          <div className="font-display text-[30px] font-light leading-none tracking-[-1px] tabular-nums">
            {formatMoney(monthly, cur)}
          </div>
          <div className="mt-2 text-[12px] text-ink-soft">
            across {activeCount} active subscription{activeCount === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-[var(--color-hairline)]" />

      {/* Yearly projection — secondary */}
      <div className="flex items-end justify-between pt-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[1.8px] text-muted">
            Yearly projection
          </span>
          <div className="mt-2 font-display text-[22px] font-light leading-none tabular-nums">
            {formatMoney(monthly * 12, cur)}
          </div>
        </div>
        <span className="text-[11px] text-muted">{formatMoney(monthly, cur)}/mo avg</span>
      </div>
    </div>
  );
}
