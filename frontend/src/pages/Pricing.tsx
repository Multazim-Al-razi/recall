import { Link, useLocation } from "react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Minus,
} from "lucide-react";
import {
  PLANS,
  COMPARISON,
  type CompareCell,
} from "@/lib/pricing";
import { Illustration } from "@/components/ui/Illustration";
import { MaskDivider } from "@/components/layout/MaskDivider";

function Cell({ value }: { value: CompareCell }) {
  if (value === true)
    return (
      <Check size={16} className="mx-auto text-teal" aria-label="Included" />
    );
  if (value === false)
    return (
      <Minus
        size={15}
        className="mx-auto text-ink/20"
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
        <section className="flex flex-col items-center gap-8 pt-[120px] pb-12 text-center md:flex-row md:gap-12 md:pt-[140px] md:text-left">
          <div className="flex-1">
            <h1 className="font-display text-[38px] font-light leading-[1.05] tracking-[-2px] sm:text-[48px]">
              Simple pricing,{" "}
              <strong className="font-bold text-gradient-rausch">
                no surprises.
              </strong>
            </h1>
            <p className="mx-auto mt-5 max-w-[500px] text-[16px] leading-[1.65] text-muted md:mx-0 md:text-[17px]">
              Free for everything on your device. Cloud adds reminders and sync across devices.
            </p>
          </div>
          <Illustration
            name="aboutAutonomy"
            decorative={false}
            className="h-[200px] w-full max-w-[280px] object-contain md:h-[240px]"
          />
        </section>

        {/* Plan cards */}
        <section id="plans" className="scroll-mt-24 pb-4">
          <div className="flex flex-col md:flex-row items-stretch justify-center gap-6 max-w-[1000px] mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                id={plan.id}
                className={`relative flex flex-col rounded-2xl p-8 scroll-mt-24 transition-all ${
                  plan.featured
                    ? "md:scale-105 bg-rausch/10 border-2 border-rausch shadow-md flex-1"
                    : "bg-surface border border-ink/8 flex-1"
                }`}
              >
                {plan.badge && (
                  <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-rausch px-3 py-1 text-[11px] font-bold uppercase tracking-[1px] text-white">
                    {plan.badge}
                  </span>
                )}
                <h3 className="text-[16px] font-semibold text-ink">
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-end gap-1">
                  <span className="font-display text-[40px] font-light leading-none tracking-[-1.5px] text-ink">
                    {plan.price}
                  </span>
                  {plan.cadence && (
                    <span className="pb-1 text-[14px] text-muted">
                      {plan.cadence}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[13.5px] leading-[1.55] text-muted">
                  {plan.tagline}
                </p>
                <div className={`my-6 h-px ${plan.featured ? "bg-rausch/20" : "bg-ink/6"}`} />
                <ul className="flex flex-1 flex-col gap-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-[13.5px] leading-[1.4] text-ink/80"
                    >
                      <Check
                        size={16}
                        className="mt-0.5 shrink-0 text-rausch"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.available ? (
                  <Link
                    to={plan.cta.to}
                    className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[14px] font-semibold transition-all ${
                      plan.featured
                        ? "bg-rausch text-white hover:bg-rausch/90"
                        : "border border-ink/12 text-ink hover:border-rausch/40 hover:text-rausch"
                    }`}
                  >
                    {plan.cta.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    aria-disabled="true"
                    className="mt-6 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-ink/10 bg-ink/4 px-5 py-3 text-[14px] font-semibold text-muted"
                  >
                    Coming soon
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      <MaskDivider />

      {/* Comparison table */}
      <div className="mx-auto max-w-[1000px] px-5 pb-16 sm:px-8 md:px-12">
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
                    Free
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
                      <Cell value={row.free} />
                    </td>
                    <td className="bg-rausch/5 px-3 py-3.5 text-center sm:px-4">
                      <Cell value={row.cloud} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
