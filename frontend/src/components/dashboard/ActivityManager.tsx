import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Search, SlidersHorizontal, MoreHorizontal, Maximize2 } from 'lucide-react';
import {
  useSubscriptionStore,
  getActiveSubscriptions,
  getByCategory,
  toMonthlyAmount,
} from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { currencySymbol } from '@/lib/format';
import { Modal } from '@/components/ui/Modal';
import { CATEGORY_CONFIG, CATEGORY_COLORS } from '@/types/subscription';
import type { Category } from '@/types/subscription';
import { ProviderIcon } from '@/components/ui/ProviderIcon';

const FILTERS = ['All', 'Entertainment', 'Productivity', 'Music'] as const;

/**
 * The reference's "Activity manager" hub: a searchable, filterable view of the
 * stack with a mini monthly-burn bar chart and a compact list of the priciest
 * plans. It's the dashboard's interactive centerpiece.
 */
export function ActivityManager() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const cur = useAccountStore((s) => s.profile.currency);
  const sym = currencySymbol(cur);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [expanded, setExpanded] = useState(false);

  const active = useMemo(
    () => getActiveSubscriptions(subscriptions),
    [subscriptions],
  );

  const bars = useMemo(() => {
    const byCat = getByCategory(subscriptions);
    const vals = Object.values(byCat);
    const max = Math.max(...vals, 1);
    return Object.entries(byCat)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, amount]) => ({
        cat: cat as Category,
        height: Math.round((amount / max) * 100),
        color: CATEGORY_COLORS[cat as Category],
      }));
  }, [subscriptions]);

  const filtered = useMemo(() => {
    return active
      .filter((s) =>
        query
          ? s.name.toLowerCase().includes(query.toLowerCase())
          : true,
      )
      .filter((s) =>
        filter === 'All'
          ? true
          : CATEGORY_CONFIG[s.category].label === filter,
      )
      .sort((a, b) => toMonthlyAmount(b) - toMonthlyAmount(a));
  }, [active, query, filter]);

  const list = filtered.slice(0, 4);

  return (
    <>
    <div className="card-premium flex h-full flex-col gap-4 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-[18px] font-normal tracking-tight">
          Activity manager
        </h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Options"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <MoreHorizontal size={16} />
          </button>
          <button
            type="button"
            aria-label="Expand"
            onClick={() => setExpanded(true)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
          >
            <Maximize2 size={14} />
          </button>
          <Link
            to="/dashboard/analytics"
            className="flex h-8 items-center gap-1.5 rounded-full bg-canvas px-3 text-[12px] font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            <SlidersHorizontal size={13} />
            Filters
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2.5 rounded-full bg-canvas px-4 py-2.5">
        <Search size={15} className="text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in activities..."
          className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-muted"
        />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
              filter === f
                ? 'bg-ink text-surface'
                : 'bg-canvas text-ink-soft hover:text-ink'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Body: mini bar chart + plans list */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Mini bar chart */}
        <div className="card-inset flex flex-col justify-between gap-3 p-4">
          <div>
            <div className="font-display text-[22px] font-light tabular-nums">
              {sym}
              {Math.round(
                bars.reduce((sum, b) => sum + b.height, 0) / (bars.length || 1),
              )}
            </div>
            <div className="text-[11px] text-muted">Burn by category</div>
          </div>
          <div className="flex h-[80px] items-end gap-1.5">
            {bars.length === 0 && (
              <div className="text-[12px] text-muted">No data</div>
            )}
            {bars.map((b, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-[3px]"
                style={{
                  height: `${Math.max(b.height, 6)}%`,
                  background: b.color,
                }}
                title={CATEGORY_CONFIG[b.cat].label}
              />
            ))}
          </div>
        </div>

        {/* Plans list */}
        <div className="card-inset flex flex-col gap-1 p-4">
          <div className="mb-1 text-[12px] font-semibold text-ink">
            Your plans
          </div>
          {list.map((sub) => (
            <Link
              key={sub.id}
              to="/dashboard/subscriptions"
              className="group flex items-center gap-2.5 rounded-lg py-1.5 transition-colors hover:bg-ink/4"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                style={{ background: CATEGORY_CONFIG[sub.category].gradient }}
              >
                <ProviderIcon icon={sub.providerIcon} name={sub.name} size={15} />
              </span>
              <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">
                {sub.name}
              </span>
              <span className="text-[12px] font-semibold tabular-nums text-ink-soft">
                {sym}
                {sub.amount.toFixed(2)}
              </span>
            </Link>
          ))}
          {list.length === 0 && (
            <div className="py-4 text-center text-[12px] text-muted">
              No matching plans.
            </div>
          )}
        </div>
      </div>
    </div>

    <Modal
      open={expanded}
      onClose={() => setExpanded(false)}
      title="Activity manager"
      maxWidth="max-w-[560px]"
    >
      <div className="mb-4 flex items-center gap-2.5 rounded-full bg-canvas px-4 py-2.5">
        <Search size={15} className="text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search in activities..."
          className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-muted"
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
              filter === f
                ? 'bg-ink text-surface'
                : 'bg-canvas text-ink-soft hover:text-ink'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex max-h-[50vh] flex-col gap-0.5 overflow-y-auto">
        {filtered.map((sub) => (
          <Link
            key={sub.id}
            to="/dashboard/subscriptions"
            onClick={() => setExpanded(false)}
            className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-ink/4"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: CATEGORY_CONFIG[sub.category].gradient }}
            >
              <ProviderIcon icon={sub.providerIcon} name={sub.name} size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13.5px] font-medium">{sub.name}</div>
              <div className="text-[11px] text-muted">
                {CATEGORY_CONFIG[sub.category].label}
              </div>
            </div>
            <span className="text-[13px] font-semibold tabular-nums text-ink-soft">
              {sym}
              {sub.amount.toFixed(2)}
            </span>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="py-6 text-center text-[13px] text-muted">
            No matching plans.
          </div>
        )}
      </div>
    </Modal>
    </>
  );
}
