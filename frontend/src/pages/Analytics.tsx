import { useMemo } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useSubscriptionStore, getMonthlySpend, getActiveSubscriptions, getByCategory, getSavingsOpportunities } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { currencySymbol } from '@/lib/format';
import { CATEGORY_CONFIG, CATEGORY_COLORS, type Category } from '@/types/subscription';
import { ProviderIcon } from '@/components/ui/ProviderIcon';
import { MaskDivider } from '@/components/layout/MaskDivider';
import { Illustration } from '@/components/ui/Illustration';

export function AnalyticsPage() {
  const cur = useAccountStore((s) => s.profile.currency);
  const sym = currencySymbol(cur);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const monthlySpend = useMemo(() => getMonthlySpend(subscriptions), [subscriptions]);
  const byCategory = useMemo(() => getByCategory(subscriptions), [subscriptions]);
  const active = useMemo(() => getActiveSubscriptions(subscriptions), [subscriptions]);

  const sortedSubs = useMemo(() => [...active].sort((a, b) => b.amount - a.amount), [active]);
  const savings = useMemo(() => getSavingsOpportunities(subscriptions), [subscriptions]);

  const categoryEntries = Object.entries(byCategory)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 md:px-12">
        {/* Header with illustration */}
        <section className="flex flex-col items-center gap-8 pb-8 pt-6 md:flex-row md:gap-12 md:pb-10 md:pt-8">
          <div className="flex-1">
            <h1 className="font-display text-[34px] font-light tracking-[-2px] sm:text-[42px]">
              Spending <strong className="font-bold">analytics</strong>
            </h1>
            <p className="mt-3 max-w-[480px] text-[15px] text-muted md:text-base">
              Understand where your money goes and find opportunities to save.
            </p>
          </div>
          <div className="hidden shrink-0 md:block md:max-w-[260px]">
            <Illustration
              name="analyticsHero"
              decorative={false}
              className="w-full object-contain opacity-90"
            />
          </div>
        </section>

        {/* Summary Stats — real figures only (no fabricated history) */}
        <div className="mb-10 grid grid-cols-1 gap-3.5 sm:grid-cols-3 md:mb-12">
          <div className="flex min-h-[160px] flex-col justify-between rounded-xl bg-surface p-6 md:min-h-[180px] md:p-7">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[2.5px] text-muted">This month</div>
              <div className="mt-3.5 text-[40px] font-light leading-none tracking-[-3px] md:text-[48px]">
                <span className="font-bold">{sym}{Math.floor(monthlySpend)}</span>
                <span>.{(monthlySpend % 1).toFixed(2).slice(2)}</span>
              </div>
              <div className="mt-1.5 text-xs text-muted">{active.length} active subscriptions</div>
            </div>
          </div>
          <div className="flex min-h-[160px] flex-col justify-between rounded-xl bg-surface p-6 md:min-h-[180px] md:p-7">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[2.5px] text-muted">Yearly projection</div>
              <div className="mt-3.5 text-[40px] font-light leading-none tracking-[-3px] md:text-[48px]">
                <span className="font-bold">{sym}{Math.round(monthlySpend * 12).toLocaleString()}</span>
              </div>
              <div className="mt-1.5 text-xs text-muted">at the current monthly rate</div>
            </div>
          </div>
          <div className="flex min-h-[160px] flex-col justify-between rounded-xl bg-surface p-6 md:min-h-[180px] md:p-7">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[2.5px] text-muted">Potential savings</div>
              <div className="mt-3.5 text-[40px] font-light leading-none tracking-[-3px] md:text-[48px]">
                <span className="font-bold">{sym}{Math.floor(savings.totalSavings)}</span>.{(savings.totalSavings % 1).toFixed(2).slice(2)}
              </div>
              <div className="mt-1.5 text-xs text-muted">
                {savings.cancelCount > 0 ? `if you cancel ${savings.cancelCount} sub${savings.cancelCount > 1 ? 's' : ''}` : 'no overlaps found'}
              </div>
            </div>
            <div className="mt-2.5 inline-flex w-fit items-center gap-1 rounded-full bg-rausch/7 px-2.5 py-1 text-[11px] font-semibold text-rausch">
              See recommendations
            </div>
          </div>
        </div>

        {/* Top Spenders + Category + Insight */}
        <div className="mb-10 grid grid-cols-1 gap-3.5 md:mb-12 lg:grid-cols-12">
          {/* Top Spenders */}
          <div id="top-spenders" className="rounded-xl bg-surface p-6 md:p-7 lg:col-span-5">
            <h3 className="mb-4 text-lg font-semibold">Top spenders</h3>
            {sortedSubs.slice(0, 5).map((sub, i) => {
              const pct = monthlySpend > 0 ? (sub.amount / monthlySpend) * 100 : 0;
              const topAmount = sortedSubs[0]?.amount ?? sub.amount;
              const barPct = topAmount > 0 ? (sub.amount / topAmount) * 100 : 0;
              const config = CATEGORY_CONFIG[sub.category];
              return (
                <div
                  key={sub.id}
                  className="border-b border-ink/4 py-3 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-5 text-[11px] font-bold tabular-nums text-muted">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-sm"
                      style={{ background: config.gradient }}
                    >
                      <ProviderIcon icon={sub.providerIcon} name={sub.name} size={18} />
                    </div>
                    <div className="flex-1 text-sm font-medium">{sub.name}</div>
                    <div className="text-right">
                      <div className="text-sm font-semibold tabular-nums">{sym}{sub.amount.toFixed(2)}</div>
                      <div className="text-[11px] tabular-nums text-muted">{pct.toFixed(1)}%</div>
                    </div>
                  </div>
                  <div
                    className="mt-2.5 ml-8 h-2 overflow-hidden rounded-full bg-ink/5"
                    role="presentation"
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: CATEGORY_COLORS[sub.category] }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.max(barPct, 4)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category Breakdown */}
          <div className="rounded-xl bg-surface p-6 md:p-7 lg:col-span-4">
            <h3 className="mb-4 text-lg font-semibold">By category</h3>
            {categoryEntries.map(([cat, amount], i) => {
              const pct = monthlySpend > 0 ? (amount / monthlySpend) * 100 : 0;
              return (
                <div
                  key={cat}
                  className="border-b border-ink/4 py-3 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: CATEGORY_COLORS[cat as Category] }}
                    />
                    <div className="flex-1 text-sm font-medium">
                      {CATEGORY_CONFIG[cat as Category].label}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold tabular-nums">{sym}{amount.toFixed(2)}</div>
                      <div className="text-[11px] tabular-nums text-muted">{pct.toFixed(1)}%</div>
                    </div>
                  </div>
                  <div
                    className="mt-2.5 ml-[22px] h-2 overflow-hidden rounded-full bg-ink/5"
                    role="presentation"
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: CATEGORY_COLORS[cat as Category] }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.max(pct, 4)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.1 + i * 0.06, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendation */}
          <div className="flex min-h-[180px] flex-col justify-between rounded-xl bg-dark p-6 text-[#f5f0eb] md:p-7 lg:col-span-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#555]">
                Recommendation
              </div>
              <div className="mt-3.5 text-xl font-light leading-relaxed tracking-tight">
                {savings.top ? (
                  <>
                    You have <b className="font-semibold text-rausch">{savings.top.names.join(' + ')}</b>.
                    Consider consolidating to save <b className="font-semibold text-rausch">{sym}{savings.top.savings.toFixed(2)}/mo</b>.
                  </>
                ) : (
                  <>No overlapping subscriptions — your stack is lean.</>
                )}
              </div>
            </div>
            <a className="mt-5 text-xs font-medium text-rausch cursor-pointer" href="#top-spenders">
              See details &rarr;
            </a>
          </div>
        </div>
      </div>

      <MaskDivider />

      <section className="flex flex-col items-center gap-6 pb-24 pt-8 text-center">
        <Illustration
          name="scheduleCleanup"
          decorative={false}
          className="h-[120px] w-[140px] object-contain opacity-80"
        />
        <Link to="/dashboard/subscriptions" className="inline-flex items-center gap-2 rounded-full bg-rausch px-9 py-4 text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(212,68,58,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(212,68,58,0.3)]">
          <Plus size={18} strokeWidth={2.5} />
          Add new subscription
        </Link>
      </section>
    </motion.div>
  );
}