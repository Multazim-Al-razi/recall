import { useMemo } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Wallet, CalendarClock, PiggyBank, Layers, Plus, ArrowRight } from 'lucide-react';
import {
  useSubscriptionStore,
  getMonthlySpend,
  getUpcomingRenewals,
  getActiveSubscriptions,
  getFreeTrials,
  getExpiringTrials,
  getByCategory,
  getSavingsOpportunities,
} from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { RenewalTimeline } from '@/components/dashboard/RenewalTimeline';
import { DonutChart } from '@/components/dashboard/DonutChart';
import { AlertBanner } from '@/components/dashboard/AlertBanner';
import { TrialCard } from '@/components/dashboard/TrialCard';
import { KpiTile } from '@/components/dashboard/KpiTile';
import { PlanUsageCard } from '@/components/dashboard/PlanUsageCard';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
import { formatMoney, currencySymbol } from '@/lib/format';

export function DashboardPage() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const profile = useAccountStore((s) => s.profile);
  const cur = profile.currency;
  const sym = currencySymbol(cur);

  const monthlySpend = useMemo(() => getMonthlySpend(subscriptions), [subscriptions]);
  const yearlySpend = monthlySpend * 12;
  const upcoming = useMemo(() => getUpcomingRenewals(subscriptions, 2), [subscriptions]);
  const trials = useMemo(() => getFreeTrials(subscriptions), [subscriptions]);
  const expiringTrials = useMemo(() => getExpiringTrials(subscriptions, 7), [subscriptions]);
  const active = useMemo(() => getActiveSubscriptions(subscriptions), [subscriptions]);
  const byCategory = useMemo(() => getByCategory(subscriptions), [subscriptions]);
  const savings = useMemo(() => getSavingsOpportunities(subscriptions), [subscriptions]);
  const featured = useMemo(
    () => [...active].sort((a, b) => b.amount - a.amount).slice(0, 4),
    [active]
  );

  const firstName = profile.name ? profile.name.split(' ')[0] : 'there';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="min-h-screen pb-24"
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 md:px-12">
        {/* Compact header — a dashboard greeting, not a marketing hero */}
        <header className="flex flex-col gap-4 pt-6 pb-8 sm:flex-row sm:items-end sm:justify-between md:pt-8">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[2.5px] text-muted">Dashboard</div>
            <h1 className="mt-2 text-[28px] font-light tracking-[-1px] md:text-[34px]">
              Hi {firstName}, here's your <strong className="font-bold">money map</strong>.
            </h1>
          </div>
          <Link
            to="/dashboard/subscriptions"
            className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-rausch px-5 py-2.5 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5 sm:self-auto"
          >
            <Plus size={17} strokeWidth={2.5} />
            Add subscription
          </Link>
        </header>
      </div>

      {/* Action-required banner */}
      {upcoming.length > 0 && <AlertBanner renewals={upcoming} currency={cur} />}

      <div className="mx-auto mt-6 max-w-[1280px] px-5 sm:px-8 md:mt-8 md:px-12">
        {/* KPI row */}
          <section className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <KpiTile
            icon={Wallet}
            label="Monthly burn"
            value={formatMoney(monthlySpend, cur)}
            sub={`${active.length} active subscriptions`}
          />
          <KpiTile
            icon={CalendarClock}
            label="Yearly projection"
            value={`${sym}${Math.round(yearlySpend).toLocaleString()}`}
            sub={`${formatMoney(monthlySpend, cur)}/mo avg`}
            tone="ink"
          />
          <KpiTile
            icon={Layers}
            label="Trials expiring"
            value={expiringTrials.length.toString()}
            sub="within 7 days"
            tone={expiringTrials.length > 0 ? 'warning' : 'success'}
          />
          <KpiTile
            icon={PiggyBank}
            label="Potential savings"
            value={formatMoney(savings.totalSavings, cur)}
            sub={savings.cancelCount > 0 ? `cancel ${savings.cancelCount} overlap${savings.cancelCount > 1 ? 's' : ''}` : 'no overlaps'}
            tone="success"
          />
        </section>

        {/* Main grid: renewals (left) + breakdown & plan (right) */}
        <section className="mt-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <RenewalTimeline limit={6} />
          </div>
          <div className="flex flex-col gap-3.5 lg:col-span-5">
            <DonutChart data={byCategory} total={monthlySpend} currency={cur} />
            <PlanUsageCard />
          </div>
        </section>

        {/* Trials + savings insight */}
        <section className="mt-3.5 grid grid-cols-1 gap-3.5 md:grid-cols-12">
          <div className="md:col-span-5 lg:col-span-4">
            <TrialCard trials={trials} />
          </div>
            <div className="flex min-h-[180px] flex-col justify-between rounded-lg bg-dark p-6 text-[#f5f0eb] md:col-span-7 lg:col-span-8">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[2.5px] text-[#666]">
                Savings opportunity
              </div>
              <div className="mt-3 max-w-[560px] text-[20px] font-light leading-relaxed tracking-tight md:text-[22px]">
                {savings.top ? (
                  <>
                    You're running <b className="font-semibold text-rausch">{savings.top.names.join(' + ')}</b>{' '}
                    together. Consolidating could save{' '}
                    <b className="font-semibold text-rausch">{formatMoney(savings.top.savings, cur)}/mo</b>.
                  </>
                ) : (
                  <>No overlapping subscriptions detected — your stack is lean and efficient.</>
                )}
              </div>
            </div>
            <Link to="/dashboard/analytics" className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-rausch">
              Open analytics
              <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* Top subscriptions at a glance */}
        <section className="mt-10">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-[18px] font-semibold tracking-[-0.3px]">Top subscriptions</h2>
            <Link to="/dashboard/subscriptions" className="inline-flex items-center gap-1 text-[13px] font-medium text-muted transition-colors hover:text-ink">
              View all {active.length}
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((sub) => (
              <SubscriptionCard key={sub.id} subscription={sub} />
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
