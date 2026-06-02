import { Link } from "react-router";
import { Bell } from "lucide-react";

/** Dashboard widget: gentle nudge toward the optional Sync plan for reminders. */
export function PlanUsageCard() {
  return (
    <div className="card-premium relative flex flex-col overflow-hidden p-5">
      <div className="relative text-[10px] font-bold uppercase tracking-[2px] text-rausch">
        Web · Local — free
      </div>

      <p className="relative mt-3 text-[13px] leading-[1.55] text-muted">
        You're on the free local plan — all tracking and insights, right in this
        browser. Want reminders that reach you when the tab is closed? Sync adds
        email & push for $1.99/mo.
      </p>

      <Link
        to="/pricing"
        className="relative mt-4 inline-flex items-center justify-center gap-1.5 rounded-full border border-ink/12 px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-rausch/40 hover:text-rausch"
      >
        <Bell size={14} />
        See plans
      </Link>
    </div>
  );
}
