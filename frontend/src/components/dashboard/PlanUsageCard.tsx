import { Link } from "react-router";
import { Bell, Sparkles } from "lucide-react";
import { FLAGS } from "@/lib/featureFlags";

/** Dashboard widget: gentle nudge toward the optional Sync plan for reminders. */
export function PlanUsageCard() {
  return (
    <div className="card-premium relative flex flex-col overflow-hidden p-5">
      <div className="relative text-[10px] font-bold uppercase tracking-[2px] text-rausch">
        Web · Local — free
      </div>

      <p className="relative mt-3 text-[13px] leading-[1.55] text-muted">
        You're on the free local plan — all tracking and insights, right in this
        browser.{" "}
        {FLAGS.syncPlan
          ? "Want reminders that reach you when the tab is closed? Sync adds email & push for $1.99/mo."
          : "Cloud reminders (email & push, even with the tab closed) are coming soon."}
      </p>

      {FLAGS.syncPlan ? (
        <Link
          to="/pricing"
          className="relative mt-4 inline-flex items-center justify-center gap-1.5 rounded-full border border-ink/12 px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-rausch/40 hover:text-rausch"
        >
          <Bell size={14} />
          See plans
        </Link>
      ) : (
        <div className="relative mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-ink/10 bg-ink/4 px-4 py-2.5 text-[13px] font-semibold text-muted">
          <Sparkles size={14} />
          Cloud — in development
        </div>
      )}
    </div>
  );
}
