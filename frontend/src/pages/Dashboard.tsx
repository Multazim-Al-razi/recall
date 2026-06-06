import { useRef, useState } from "react";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useAccountStore } from "@/stores/account";
import { useSubscriptionStore, getMonthlySpend } from "@/stores/subscription";
import { formatMoney } from "@/lib/format";
import { MyCardsWidget } from "@/components/dashboard/MyCardsWidget";
import { ActivityManager } from "@/components/dashboard/ActivityManager";
import { NextChargeTimer } from "@/components/dashboard/NextChargeTimer";
import { SpendTrendCard } from "@/components/dashboard/SpendTrendCard";
import { SpendHealthArc } from "@/components/dashboard/SpendHealthArc";
import { TopCategoriesWidget } from "@/components/dashboard/TopCategoriesWidget";
import { SubscriptionFormModal } from "@/components/subscriptions/SubscriptionFormModal";

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] },
};

export function DashboardPage() {
  const profile = useAccountStore((s) => s.profile);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const firstName = profile.name ? profile.name.split(" ")[0] : "there";
  const cur = profile.currency;
  const monthlyBurn = getMonthlySpend(subscriptions);

  const [formOpen, setFormOpen] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const now = new Date();
  const day = now.getDate();
  const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
  const month = now.toLocaleDateString("en-US", { month: "long" });

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="pb-16"
    >
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 md:px-10">
        {/* ── Header ────────────────────────────────────────────────── */}
        <motion.header
          variants={fadeUp}
          className="flex flex-col gap-6 pt-2 pb-8 lg:flex-row lg:items-center lg:justify-between"
        >
          {/* Left: editorial greeting */}
          <div className="flex items-center gap-4">
            <h1 className="font-display text-[26px] font-light leading-[1.1] tracking-[-0.5px] md:text-[32px]">
              Hey {firstName}, here's your{" "}
              <span className="text-gradient-rausch font-normal">money map</span>
            </h1>
          </div>

          {/* Right: primary action + date chip */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              ref={addBtnRef}
              type="button"
              onClick={() => setFormOpen(true)}
              className="sheen group inline-flex items-center gap-2 rounded-full bg-rausch py-2.5 pr-2.5 pl-5 text-[14px] font-semibold text-white shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              Add subscription
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:rotate-90">
                <Plus size={15} strokeWidth={2.5} />
              </span>
            </button>

            <div className="inline-flex items-center gap-3 rounded-full bg-surface py-1.5 pr-5 pl-1.5 shadow-[0_0_0_1px_var(--color-hairline),var(--shadow-xs)]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-canvas font-display text-[20px] font-light leading-none tabular-nums">
                {day}
              </span>
              <span className="text-[12.5px] font-medium leading-[1.25] text-ink">
                {weekday},
                <br />
                {month}
              </span>
            </div>
          </div>
        </motion.header>

        {/* ── Row 1: Hero KPI bar — Balance + Spending + Subscriptions ── */}
        <motion.div
          variants={fadeUp}
          className="mb-3.5 grid grid-cols-1 gap-3.5 md:grid-cols-3"
        >
          {/* Total Balance / Monthly Burn */}
          <div className="card-premium flex flex-col justify-between gap-6 p-6 md:col-span-1">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
                Total Balance
              </div>
              <div className="mt-2 font-display text-[36px] font-light leading-none tabular-nums tracking-tight md:text-[40px]">
                {formatMoney(monthlyBurn, cur)}
                <span className="text-[20px] text-muted">.{((monthlyBurn % 1) * 100).toFixed(0).padStart(2, '0')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted">Monthly subscription spend across all cards</span>
            </div>
          </div>

          {/* Next upcoming subscription timer */}
          <NextChargeTimer />

          {/* Activity / Transactions */}
          <ActivityManager />
        </motion.div>

        {/* ── Row 2: Cards + Tip card + Trend chart ──────────────── */}
        <motion.div
          variants={fadeUp}
          className="mb-3.5 grid grid-cols-1 gap-3.5 lg:grid-cols-[1fr_1fr]"
        >
          {/* Left: My Cards */}
          <MyCardsWidget />

          {/* Right: Insight card */}
          <TopCategoriesWidget />
        </motion.div>

        {/* ── Row 3: Expenses trend + Spend Health gauge ────────── */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.6fr_1fr]"
        >
          <SpendTrendCard />
          <SpendHealthArc />
        </motion.div>
      </div>

      {formOpen && (
        <SubscriptionFormModal
          subscription={null}
          onClose={() => setFormOpen(false)}
          triggerRef={addBtnRef}
        />
      )}
    </motion.div>
  );
}
