import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  useSubscriptionStore,
  getActiveSubscriptions,
  toMonthlyAmount,
} from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { currencySymbol } from '@/lib/format';
import { CATEGORY_CONFIG } from '@/types/subscription';
import { ProviderIcon } from '@/components/ui/ProviderIcon';

/**
 * Clean subscription list card — the dashboard's quick-glance panel.
 * Shows up to 6 active subscriptions sorted by monthly cost, with search
 * filtering and a "See All" link to the full subscriptions page.
 */
export function ActivityManager() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const cur = useAccountStore((s) => s.profile.currency);
  const sym = currencySymbol(cur);
  const [query, setQuery] = useState('');

  const active = useMemo(
    () => getActiveSubscriptions(subscriptions),
    [subscriptions],
  );

  const filtered = useMemo(() => {
    return active
      .filter((s) =>
        query
          ? s.name.toLowerCase().includes(query.toLowerCase())
          : true,
      )
      .sort((a, b) => toMonthlyAmount(b) - toMonthlyAmount(a));
  }, [active, query]);

  const list = filtered.slice(0, 6);

  return (
    <div className="card-premium flex flex-col gap-4 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[18px] font-normal tracking-tight">
          Subscriptions
        </h2>
        <Link
          to="/dashboard/subscriptions"
          className="text-[12px] font-medium text-rausch transition-colors hover:text-rausch/80"
        >
          See All
        </Link>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2.5 rounded-xl border border-[var(--color-hairline)] bg-canvas/70 px-4 py-2.5">
        <Search size={15} className="shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search subscriptions…"
          className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-muted"
        />
      </div>

      {/* Subscription list */}
      <div className="flex flex-col">
        {list.map((sub, i) => (
          <Link
            key={sub.id}
            to="/dashboard/subscriptions"
            className={`group flex items-center gap-3 py-3 transition-colors hover:bg-ink/[0.03] ${
              i < list.length - 1
                ? 'border-b border-[var(--color-hairline)]'
                : ''
            }`}
          >
            {/* Icon */}
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
              style={{ background: CATEGORY_CONFIG[sub.category].gradient }}
            >
              <ProviderIcon
                icon={sub.providerIcon}
                name={sub.name}
                size={15}
              />
            </span>

            {/* Name + meta */}
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium leading-snug">
                {sub.name}
              </div>
              <div className="text-[11px] leading-snug text-muted">
                {CATEGORY_CONFIG[sub.category].label}
                {' · '}
                {formatDistanceToNow(new Date(sub.nextRenewalDate), {
                  addSuffix: true,
                })}
              </div>
            </div>

            {/* Amount */}
            <span className="shrink-0 text-[13px] font-semibold tabular-nums text-ink">
              -{sym}
              {sub.amount.toFixed(2)}
            </span>
          </Link>
        ))}

        {list.length === 0 && (
          <div className="py-8 text-center text-[12px] text-muted">
            {query ? 'No matching subscriptions.' : 'No active subscriptions.'}
          </div>
        )}
      </div>
    </div>
  );
}
