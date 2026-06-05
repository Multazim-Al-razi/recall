import { useRef, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Plus, LineChart } from "lucide-react";
import { useAccountStore } from "@/stores/account";
import { PaymentMethodCard } from "@/components/dashboard/PaymentMethodCard";
import { FlowTiles } from "@/components/dashboard/FlowTiles";
import { SavingsGauge } from "@/components/dashboard/SavingsGauge";
import { StatusLockCard } from "@/components/dashboard/StatusLockCard";
import { TrialCountdownCard } from "@/components/dashboard/TrialCountdownCard";
import { SpendTrendCard } from "@/components/dashboard/SpendTrendCard";
import { CategoryRingsCard } from "@/components/dashboard/CategoryRingsCard";
import { ActivityManager } from "@/components/dashboard/ActivityManager";
import { SpendHealthCard } from "@/components/dashboard/SpendHealthCard";
import { SubscriptionFormModal } from "@/components/subscriptions/SubscriptionFormModal";

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: "easeOut" as const },
};

export function DashboardPage() {
  const profile = useAccountStore((s) => s.profile);
  const firstName = profile.name ? profile.name.split(" ")[0] : "there";

  const [formOpen, setFormOpen] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const now = new Date();
  const day = now.getDate();
  const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
  const month = now.toLocaleDateString("en-US", { month: "long" });

  return (
    <motion.div {...fadeUp} className="pb-16">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 md:px-10">
        {/* Greeting / utility row */}
        <header className="flex flex-col gap-6 pt-2 pb-7 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: date chip + primary action */}
          <div className="flex flex-wrap items-center gap-3">
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

            <button
              ref={addBtnRef}
              type="button"
              onClick={() => setFormOpen(true)}
              className="sheen group inline-flex items-center gap-2 rounded-full bg-rausch py-2.5 pr-2.5 pl-5 text-[14px] font-semibold text-white shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"
            >
              Add subscription
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:rotate-90">
                <Plus size={15} strokeWidth={2.5} />
              </span>
            </button>

            <Link
              to="/dashboard/analytics"
              aria-label="View analytics"
              title="View analytics"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink shadow-[0_0_0_1px_var(--color-hairline),var(--shadow-xs)] transition-all hover:-translate-y-0.5 hover:text-rausch hover:shadow-[var(--shadow-sm)]"
            >
              <LineChart size={18} />
            </Link>
          </div>

          {/* Right: editorial greeting */}
          <div className="flex items-center gap-4">
            <h1 className="font-display text-[26px] font-light leading-[1.1] tracking-[-0.5px] md:text-[32px]">
              Hey {firstName}, here's your{" "}
              <span className="text-gradient-rausch font-normal">money map</span>
              .
            </h1>
          </div>
        </header>

        {/* Bento grid — three aligned columns mirroring the reference regions */}
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-start">
          {/* Column 1 — linked card + category bullseye */}
          <div className="flex flex-col gap-3.5 lg:flex-[1.05]">
            <PaymentMethodCard />
            <CategoryRingsCard />
          </div>

          {/* Column 2 — spend lenses + activity hub */}
          <div className="flex flex-col gap-3.5 lg:flex-[1.15]">
            <FlowTiles />
            <ActivityManager />
          </div>

          {/* Column 3 — status dials, trend, check-in */}
          <div className="flex flex-col gap-3.5 lg:flex-[0.95]">
            <div className="grid grid-cols-2 gap-3.5">
              <StatusLockCard />
              <SavingsGauge />
            </div>
            <TrialCountdownCard />
            <SpendTrendCard />
            <SpendHealthCard />
          </div>
        </div>
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
