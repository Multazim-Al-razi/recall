import { motion } from 'framer-motion';
import { Check, Minus } from 'lucide-react';
import { useAccountStore } from '@/stores/account';
import {
  PLAN_CONFIG,
  PLAN_ORDER,
  FEATURE_MATRIX,
  planRank,
} from '@/types/plan';
import { Illustration } from '@/components/ui/Illustration';
import { MaskDivider } from '@/components/layout/MaskDivider';
import { formatMoney } from '@/lib/format';

export function PricingPage() {
  const currentPlan = useAccountStore((s) => s.plan);
  const setPlan = useAccountStore((s) => s.setPlan);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 md:px-12">
        {/* Header */}
        <section className="flex flex-col items-center gap-8 pt-[110px] pb-10 text-center md:flex-row md:gap-12 md:pt-[130px] md:text-left">
          <div className="flex-1">
            <h1 className="text-[38px] font-light leading-[1.08] tracking-[-2px] sm:text-[46px]">
              Pay once. <strong className="font-bold">Own it forever.</strong>
            </h1>
            <p className="mx-auto mt-4 max-w-[440px] text-[16px] leading-[1.6] text-muted md:mx-0">
              No subscriptions to track your subscriptions. Every Recall plan is a
              one-time purchase — pick the tier that fits and keep it for life.
            </p>
          </div>
          <Illustration
            name="pricing"
            decorative={false}
            className="h-[200px] w-full max-w-[340px] object-contain md:h-[240px]"
          />
        </section>

        {/* Plan cards */}
        <section className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_ORDER.map((tier) => {
            const plan = PLAN_CONFIG[tier];
            const isCurrent = currentPlan === tier;
            const isDowngrade = planRank(tier) < planRank(currentPlan);

            return (
              <motion.div
                key={tier}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              className={`relative flex flex-col rounded-xl bg-surface p-6 transition-all ${
                  plan.popular ? 'ring-1 ring-rausch/30' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center rounded-full bg-rausch px-3 py-1 text-[10px] font-bold uppercase tracking-[1px] text-white">
                    Most popular
                  </div>
                )}
                <div className="text-[13px] font-bold uppercase tracking-[2px]" style={{ color: plan.accent }}>
                  {plan.name}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-[40px] font-bold leading-none tracking-[-2px]">
                    {plan.price === 0 ? 'Free' : formatMoney(plan.price)}
                  </span>
                  {plan.price > 0 && <span className="text-[13px] text-muted">once</span>}
                </div>
                <p className="mt-2 text-[13px] text-muted">{plan.tagline}</p>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-[13px] leading-snug">
                      <Check size={15} className="mt-0.5 shrink-0 text-rausch" strokeWidth={2.5} />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setPlan(tier)}
                  disabled={isCurrent}
                  className={`mt-6 w-full rounded-full px-5 py-3 text-[14px] font-semibold transition-all ${
                    isCurrent
                      ? 'cursor-default bg-ink/8 text-muted'
                      : plan.popular
                      ? 'bg-rausch text-white hover:-translate-y-0.5'
                      : 'border border-ink/15 text-ink hover:border-rausch/40 hover:text-rausch hover:-translate-y-0.5'
                  }`}
                >
                  {isCurrent
                    ? 'Current plan'
                    : tier === 'free'
                    ? 'Downgrade to Free'
                    : isDowngrade
                    ? `Switch to ${plan.name}`
                    : plan.price === 0
                    ? 'Choose Free'
                    : `Get ${plan.name} — ${formatMoney(plan.price)}`}
                </button>
              </motion.div>
            );
          })}
        </section>

        {/* Comparison matrix */}
        <section className="pb-20">
          <h2 className="mb-6 text-[24px] font-light tracking-[-0.5px]">
            Compare <strong className="font-bold">every feature</strong>
          </h2>
          <div className="overflow-x-auto rounded-xl bg-surface">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-ink/6">
                  <th className="p-4 text-[13px] font-semibold text-muted">Feature</th>
                  {PLAN_ORDER.map((tier) => (
                    <th
                      key={tier}
                      className="p-4 text-center text-[13px] font-bold"
                      style={{ color: PLAN_CONFIG[tier].accent }}
                    >
                      {PLAN_CONFIG[tier].name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURE_MATRIX.map((feature) => (
                  <tr key={feature.label} className="border-b border-ink/4 last:border-b-0">
                    <td className="p-4 text-[13px] font-medium">{feature.label}</td>
                    {PLAN_ORDER.map((tier) => {
                      const included = feature.tiers.includes(tier);
                      return (
                        <td key={tier} className="p-4 text-center">
                          {included ? (
                            <Check size={16} className="mx-auto text-rausch" strokeWidth={2.5} />
                          ) : (
                            <Minus size={16} className="mx-auto text-ink/15" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="bg-canvas/40">
                  <td className="p-4 text-[13px] font-semibold">Subscription limit</td>
                  {PLAN_ORDER.map((tier) => {
                    const limit = PLAN_CONFIG[tier].subscriptionLimit;
                    return (
                      <td key={tier} className="p-4 text-center text-[13px] font-semibold">
                        {limit === Infinity ? 'unlimited' : limit}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <MaskDivider />

      <section className="pb-24 pt-8 text-center text-[13px] text-muted">
        One-time purchase · No recurring billing · Your data stays on your device
      </section>
    </motion.div>
  );
}
