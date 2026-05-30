import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { Pencil, Trash2, Plus, Lock } from 'lucide-react';
import { useSubscriptionStore, getActiveSubscriptions } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { PLAN_CONFIG } from '@/types/plan';
import { CATEGORY_CONFIG, type Category, type Subscription } from '@/types/subscription';
import { getCategoryIllustration } from '@/lib/visuals';
import { Illustration } from '@/components/ui/Illustration';
import { MaskDivider } from '@/components/layout/MaskDivider';
import { SubscriptionFormModal } from '@/components/subscriptions/SubscriptionFormModal';
import { currencySymbol } from '@/lib/format';

const FILTERS: { key: 'all' | Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'productivity', label: 'Productivity' },
  { key: 'fitness', label: 'Fitness' },
  { key: 'cloud', label: 'Cloud' },
  { key: 'music', label: 'Music' },
  { key: 'news', label: 'News' },
  { key: 'food', label: 'Food' },
  { key: 'other', label: 'Other' },
];

const CYCLE_SHORT: Record<string, string> = {
  monthly: 'mo',
  yearly: 'yr',
  weekly: 'wk',
  custom: 'cycle',
};

export function SubscriptionsPage() {
  const [filter, setFilter] = useState<'all' | Category>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const removeSubscription = useSubscriptionStore((s) => s.removeSubscription);
  const plan = useAccountStore((s) => s.plan);
  const cur = useAccountStore((s) => s.profile.currency);
  const sym = currencySymbol(cur);

  const limit = PLAN_CONFIG[plan].subscriptionLimit;
  const activeCount = getActiveSubscriptions(subscriptions).length;
  const atLimit = activeCount >= limit;

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (sub: Subscription) => {
    setEditing(sub);
    setFormOpen(true);
  };
  const handleDelete = (sub: Subscription) => {
    if (window.confirm(`Delete ${sub.name}?`)) removeSubscription(sub.id);
  };

  const filtered =
    filter === 'all' ? subscriptions : subscriptions.filter((s) => s.category === filter);

  const categoryArt = filter === 'all' ? null : getCategoryIllustration(filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 md:px-12">
        <div className="flex flex-col gap-5 pb-8 pt-6 sm:flex-row sm:items-end sm:justify-between md:pb-10 md:pt-8">
          <div>
            <h1 className="text-[34px] font-light tracking-[-2px] sm:text-[42px]">
              All <strong className="font-bold">subscriptions</strong>
            </h1>
            <p className="mt-3 max-w-[480px] text-[15px] text-muted md:text-base">
              Manage, track, and cancel your recurring charges in one place.
            </p>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-rausch px-6 py-3 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 sm:self-auto"
          >
            <Plus size={17} strokeWidth={2.5} />
            Add
          </button>
        </div>

        {/* Plan usage / limit notice */}
        <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
          <span>
            <strong className="font-semibold text-ink">{activeCount}</strong> active ·{' '}
            {PLAN_CONFIG[plan].name} plan allows{' '}
            {limit === Infinity ? 'unlimited' : limit}
          </span>
          {atLimit && limit !== Infinity && (
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1 font-medium text-rausch hover:underline"
            >
              <Lock size={12} />
              Upgrade for more
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="mb-7 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const count =
              f.key === 'all'
                ? subscriptions.length
                : subscriptions.filter((s) => s.category === f.key).length;
            if (f.key !== 'all' && count === 0) return null;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={`rounded-full border px-4 py-1.5 text-[13px] font-medium transition-all md:px-[18px] md:py-2 ${
                  filter === f.key
                    ? 'border-transparent bg-ink/6 text-ink'
                    : 'border-ink/8 text-muted hover:text-ink'
                }`}
              >
                {f.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Contextual category banner */}
        {categoryArt && filtered.length > 0 && (
          <motion.div
            key={filter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-7 flex items-center justify-between gap-4 overflow-hidden rounded-xl bg-surface px-6 py-5 md:px-8 md:py-6"
          >
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[2.5px] text-rausch">
                {CATEGORY_CONFIG[filter as Category].label}
              </div>
              <div className="mt-2 text-[18px] font-light tracking-[-0.5px] md:text-[22px]">
                {filtered.length} {CATEGORY_CONFIG[filter as Category].label.toLowerCase()}{' '}
                subscription{filtered.length > 1 ? 's' : ''}
              </div>
            </div>
            <img
              src={categoryArt.src}
              alt=""
              aria-hidden
              draggable={false}
              className="h-[80px] w-[120px] shrink-0 object-contain md:h-[110px] md:w-[160px]"
            />
          </motion.div>
        )}

        {/* List */}
        <div className="pb-12">
          {filtered.map((sub) => {
            const config = CATEGORY_CONFIG[sub.category];
            const daysUntil = differenceInDays(new Date(sub.nextRenewalDate), new Date());
            const cancelLabel =
              daysUntil <= 1 ? 'Cancel by today' : `Cancel by ${format(new Date(sub.nextRenewalDate), 'MMM d')}`;

            return (
              <div
                key={sub.id}
                className="mb-2.5 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg bg-surface px-4 py-4 sm:flex-nowrap sm:gap-5 sm:px-6 sm:py-5"
              >
                <div
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    sub.status === 'active'
                      ? 'bg-success'
                      : sub.status === 'paused'
                      ? 'bg-warning'
                      : 'bg-muted'
                  }`}
                  title={sub.status}
                />
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md sm:h-12 sm:w-12"
                  style={{ background: config.gradient }}
                >
                  {sub.providerIcon ? (
                    <img
                      src={`https://cdn.simpleicons.org/${sub.providerIcon}`}
                      alt=""
                      className="h-6 w-6"
                      onError={(e) => {
                        (e.currentTarget.style.display = 'none');
                      }}
                    />
                  ) : (
                    <span className="text-lg font-bold text-ink/30">{sub.name.charAt(0)}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold">{sub.name}</div>
                  <div className="mt-0.5 text-xs text-muted">
                    {sub.billingCycle === 'monthly' ? 'Monthly' : sub.billingCycle} &middot; {config.label}
                    {sub.isFreeTrial && ' · Free trial'}
                    {sub.status !== 'active' && ` · ${sub.status}`}
                  </div>
                </div>
                <div className="min-w-[72px] text-right">
                  <div className="text-[15px] font-semibold">
                    {sym}{sub.amount.toFixed(2)}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted">/{CYCLE_SHORT[sub.billingCycle]}</div>
                </div>
                <div className="hidden min-w-[120px] text-right sm:block">
                  <div
                    className={`text-[13px] font-medium ${
                      sub.isFreeTrial && daysUntil <= 7 ? 'text-rausch' : ''
                    }`}
                  >
                    {format(new Date(sub.nextRenewalDate), 'MMM d, yyyy')}
                  </div>
                  <div className="mt-0.5 text-[11px] text-rausch">{cancelLabel}</div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button
                    onClick={() => openEdit(sub)}
                    aria-label={`Edit ${sub.name}`}
                    className="flex items-center gap-1 rounded-full border border-ink/10 px-3 py-1.5 text-[12px] font-medium text-muted transition-colors hover:text-ink"
                  >
                    <Pencil size={13} />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(sub)}
                    aria-label={`Delete ${sub.name}`}
                    className="flex items-center gap-1 rounded-full border border-ink/10 px-3 py-1.5 text-[12px] font-medium text-muted transition-colors hover:text-rausch"
                  >
                    <Trash2 size={13} />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/8 py-16 text-center">
              {categoryArt ? (
                <img
                  src={categoryArt.src}
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="mb-5 h-[120px] w-[160px] object-contain opacity-90"
                />
              ) : (
                <Illustration name="empty" className="mb-5 h-[140px] w-[150px] object-contain opacity-90" />
              )}
              <div className="text-[15px] font-medium text-ink">No subscriptions here yet</div>
              <p className="mt-1 max-w-[320px] text-[13px] text-muted">
                Nothing matches this filter. Add a subscription to start tracking it.
              </p>
              <button
                onClick={openAdd}
                className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-ink/10 px-5 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-rausch/30 hover:text-rausch"
              >
                <Plus size={15} strokeWidth={2.5} />
                Add subscription
              </button>
            </div>
          )}
        </div>
      </div>

      <MaskDivider />

      <section className="pb-20 pt-8 text-center md:pb-24">
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-full bg-rausch px-9 py-4 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
        >
          <Plus size={18} strokeWidth={2.5} />
          Add new subscription
        </button>
      </section>

      {formOpen && (
        <SubscriptionFormModal
          subscription={editing}
          atLimit={!editing && atLimit}
          planName={PLAN_CONFIG[plan].name}
          onClose={() => setFormOpen(false)}
        />
      )}
    </motion.div>
  );
}
