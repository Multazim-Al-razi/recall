import { useMemo } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useSubscriptionStore, getMonthlySpend, getActiveSubscriptions, getByCategory, getSavingsOpportunities } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { currencySymbol } from '@/lib/format';
import { CATEGORY_CONFIG, CATEGORY_COLORS, type Category } from '@/types/subscription';
import { MaskDivider } from '@/components/layout/MaskDivider';

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
        <div className="pb-8 pt-6 md:pb-10 md:pt-8">
          <h1 className="text-[34px] font-light tracking-[-2px] sm:text-[42px]">
            Spending <strong className="font-bold">analytics</strong>
          </h1>
          <p className="mt-3 max-w-[480px] text-[15px] text-muted md:text-base">
            Understand where your money goes and find opportunities to save.
          </p>
        </div>

        {/* Summary Stats — real figures only (no fabricated history) */}
        <div className="mb-10 grid grid-cols-1 gap-3.5 sm:grid-cols-3 md:mb-12">
          <div className="flex min-h-[160px] flex-col justify-between rounded-[20px] bg-surface p-6 md:min-h-[180px] md:p-7">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[2.5px] text-muted">This month</div>
              <div className="mt-3.5 text-[40px] font-light leading-none tracking-[-3px] md:text-[48px]">
                <span className="font-bold">{sym}{Math.floor(monthlySpend)}</span>
                <span>.{(monthlySpend % 1).toFixed(2).slice(2)}</span>
              </div>
              <div className="mt-1.5 text-xs text-muted">{active.length} active subscriptions</div>
            </div>
          </div>
          <div className="flex min-h-[160px] flex-col justify-between rounded-[20px] bg-surface p-6 md:min-h-[180px] md:p-7">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[2.5px] text-muted">Yearly projection</div>
              <div className="mt-3.5 text-[40px] font-light leading-none tracking-[-3px] md:text-[48px]">
                <span className="font-bold">{sym}{Math.round(monthlySpend * 12).toLocaleString()}</span>
              </div>
              <div className="mt-1.5 text-xs text-muted">at the current monthly rate</div>
            </div>
          </div>
          <div className="flex min-h-[160px] flex-col justify-between rounded-[20px] bg-surface p-6 md:min-h-[180px] md:p-7">
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
          <div id="top-spenders" className="rounded-[20px] bg-surface p-6 md:p-7 lg:col-span-5">
            <h3 className="mb-4 text-lg font-semibold">Top spenders</h3>
            {sortedSubs.slice(0, 5).map((sub, i) => {
              const pct = monthlySpend > 0 ? ((sub.amount / monthlySpend) * 100).toFixed(1) : '0.0';
              const config = CATEGORY_CONFIG[sub.category];
              return (
                <div
                  key={sub.id}
                  className="flex items-center gap-3 border-b border-ink/4 py-3 last:border-b-0"
                >
                  <div className="w-5 text-[11px] font-bold text-muted">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-[10px]"
                    style={{ background: config.gradient }}
                  >
                    {sub.providerIcon ? (
                      <img src={`https://cdn.simpleicons.org/${sub.providerIcon}`} alt="" className="h-[18px] w-[18px]" />
                    ) : (
                      <span className="text-sm font-bold text-ink/30">{sub.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 text-sm font-medium">{sub.name}</div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{sym}{sub.amount.toFixed(2)}</div>
                    <div className="text-[11px] text-muted">{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Category Breakdown */}
          <div className="rounded-[20px] bg-surface p-6 md:p-7 lg:col-span-4">
            <h3 className="mb-4 text-lg font-semibold">By category</h3>
            {categoryEntries.map(([cat, amount]) => {
              const pct = monthlySpend > 0 ? ((amount / monthlySpend) * 100).toFixed(1) : '0.0';
              return (
                <div
                  key={cat}
                  className="flex items-center gap-3 border-b border-ink/4 py-3 last:border-b-0"
                >
                  <div
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: CATEGORY_COLORS[cat as Category] }}
                  />
                  <div className="flex-1 text-sm font-medium">
                    {CATEGORY_CONFIG[cat as Category].label}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{sym}{amount.toFixed(2)}</div>
                    <div className="text-[11px] text-muted">{pct}%</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendation */}
          <div className="flex min-h-[180px] flex-col justify-between rounded-[20px] bg-dark p-6 text-[#f5f0eb] md:p-7 lg:col-span-3">
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

      <section className="pb-25 pt-8 text-center">
        <Link to="/dashboard/subscriptions" className="inline-flex items-center gap-2 rounded-full bg-rausch px-9 py-4 text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(212,68,58,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(212,68,58,0.3)]">
          <Plus size={18} strokeWidth={2.5} />
          Add new subscription
        </Link>
      </section>
    </motion.div>
  );
}
