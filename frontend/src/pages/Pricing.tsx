import { Link, useLocation } from "react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  PLANS,
  COMPARISON,
  type CompareCell,
} from "@/lib/pricing";
import { Illustration } from "@/components/ui/Illustration";
import { MaskDivider } from "@/components/layout/MaskDivider";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8.5l3 3 7-7" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <path d="M3.5 8h9" />
    </svg>
  );
}

function Cell({ value }: { value: CompareCell }) {
  if (value === true)
    return (
      <CheckIcon
        className="mx-auto h-4 w-4 text-teal"
        aria-label="Included"
      />
    );
  if (value === false)
    return (
      <MinusIcon
        className="mx-auto h-4 w-4 text-ink/20"
        aria-label="Not included"
      />
    );
  return (
    <span className="text-[12.5px] font-medium text-ink-soft">{value}</span>
  );
}

export function PricingPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = window.setTimeout(() => {
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => window.clearTimeout(id);
  }, [hash]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Hero */}
      <div className="mx-auto max-w-[1000px] px-5 sm:px-8 md:px-12">
         <section className="flex flex-col items-center gap-8 pt-12 pb-12 text-center md:flex-row md:gap-12 md:pt-16 md:text-left">
          <div className="flex-1">
            <h1 className="font-display text-[38px] font-light leading-[1.05] tracking-[-2px] sm:text-[48px]">
              Free on your device.{" "}
              <span className="text-gradient-rausch font-normal">
                Cloud, free for now.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-[500px] text-[16px] leading-[1.65] text-muted md:mx-0 md:text-[17px]">
              Recall on the web is free and lives in your browser. A closed
              browser tab cannot wake itself up to remind you; that needs a
              server. Cloud covers exactly that, and it is free during
              early access.
            </p>
          </div>
          <Illustration
            name="pricing"
            decorative={false}
            className="h-[200px] w-full max-w-[280px] object-contain md:h-[240px]"
          />
        </section>

        {/* Plan cards */}
        <section id="plans" className="scroll-mt-24 pb-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                id={plan.id}
                className={`relative flex scroll-mt-24 flex-col rounded-xl border p-6 ${
                  plan.featured
                    ? "border-rausch/40 bg-surface"
                    : "border-ink/8 bg-surface/60"
                }`}
              >
                <div className="flex items-center gap-2 text-rausch">
                  <span className="text-[13px] font-semibold text-ink">
                    {plan.name}
                  </span>
                </div>
                <div className="mt-4 flex items-end gap-1">
                  <span className="font-display text-[34px] font-light leading-none tracking-[-1px]">
                    {plan.price}
                  </span>
                  {plan.cadence && (
                    <span className="pb-1 text-[13px] text-muted">
                      {plan.cadence}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[13px] leading-[1.55] text-muted">
                  {plan.tagline}
                </p>
                <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[13px] leading-[1.4] text-ink/80"
                    >
                      <CheckIcon className="mt-0.5 h-[15px] w-[15px] shrink-0 text-rausch" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={plan.cta.to}
                  className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-all hover:-translate-y-0.5 ${
                    plan.featured
                      ? "bg-rausch text-white"
                      : "border border-ink/12 text-ink hover:border-rausch/40 hover:text-rausch"
                  }`}
                >
                  {plan.cta.label}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Feature highlights */}
      <div className="mx-auto mt-8 max-w-[1000px] px-5 sm:px-8 md:px-12">
        <section
          id="why"
          className="scroll-mt-24 rounded-2xl bg-surface-2 p-8 sm:p-10"
        >
          <h2 className="max-w-[640px] font-display text-[26px] font-light leading-[1.2] tracking-[-0.5px] md:text-[32px]">
            One app, everything you need to stay on top of your recurring spend.
          </h2>
          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-center md:gap-10">
            <Illustration
              name="pricingSync"
              decorative={false}
              className="h-[180px] w-full max-w-[260px] shrink-0 object-contain md:h-[220px]"
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-[15px] font-semibold">
                  Cross-device sync
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-muted">
                  Your subscriptions, reminders, and spending data stay
                  mirrored across every device you use. Add a subscription on
                  your phone; it appears on your laptop instantly.
                </p>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold">
                  Reminders that reach you
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-muted">
                  Renewal alerts arrive by email and push notification even
                  when the browser tab is closed. No more surprise charges on
                  subscriptions you meant to cancel.
                </p>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold">
                  Spending analytics
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-muted">
                  See your true monthly burn at a glance, with category breakdowns,
                  trend charts, and trial-vs-paid splits, so you can cut
                  waste before it compounds.
                </p>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold">
                  No ads, no tracking
                </h3>
                <p className="mt-2 text-[13.5px] leading-[1.6] text-muted">
                  No ads, we measure download metrics to evaluate the product, no data sold to third parties on any plan.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Comparison table */}
      <div className="mx-auto mt-16 max-w-[1000px] px-5 sm:px-8 md:px-12">
        <section id="compare" className="scroll-mt-24">
          <div className="mb-8 text-center">
            <div className="text-[11px] font-bold uppercase tracking-[2.5px] text-rausch">
              Compare plans
            </div>
            <h2 className="mt-3 font-display text-[28px] font-light tracking-[-1px] md:text-[34px]">
              Everything, side by side
            </h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
            <table className="w-full border-collapse text-[14px]">
              <thead>
                <tr className="border-b border-hairline">
                  <th className="px-4 py-4 text-left text-[12px] font-bold uppercase tracking-[1px] text-muted sm:px-6">
                    Feature
                  </th>
                  <th className="px-3 py-4 text-center text-[13px] font-semibold sm:px-4">
                    Local
                  </th>
                  <th className="bg-rausch/5 px-3 py-4 text-center text-[13px] font-semibold text-rausch sm:px-4">
                    Cloud
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-hairline last:border-b-0"
                  >
                    <td className="px-4 py-3.5 text-left text-[13.5px] text-ink-soft sm:px-6">
                      {row.feature}
                    </td>
                    <td className="px-3 py-3.5 text-center sm:px-4">
                      <Cell value={row.local} />
                    </td>
                    <td className="bg-rausch/5 px-3 py-3.5 text-center sm:px-4">
                      <Cell value={row.sync} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <MaskDivider />

      {/* Closing CTA */}
      <section className="pb-24 pt-10 text-center">
        <h2 className="font-display text-[30px] font-light tracking-[-1px] md:text-[40px]">
          Start free.{" "}
          <span className="text-gradient-rausch font-normal">
            Add Cloud whenever you want reminders.
          </span>
        </h2>
<p className="mx-auto mt-4 max-w-[440px] text-[15px] text-muted">
              No card to begin, no account on Local. Add Cloud the day you want
              a renewal nudge to reach you anywhere.
            </p>
        <Link
          to="/onboarding"
          className="sheen mt-8 inline-flex items-center gap-2 rounded-full bg-rausch px-9 py-4 text-[15px] font-semibold text-white shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
        >
          Start tracking free
        </Link>
      </section>
    </motion.div>
  );
}
