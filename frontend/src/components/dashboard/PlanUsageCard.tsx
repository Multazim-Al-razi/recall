import { Link } from "react-router";
import { Heart } from "lucide-react";

/** Dashboard widget: gentle donation nudge. */
export function PlanUsageCard() {
  return (
    <div className="card-premium relative flex flex-col overflow-hidden p-5">
      <div className="relative text-[10px] font-bold uppercase tracking-[2px] text-rausch">
        Free forever
      </div>

      <p className="relative mt-3 text-[13px] leading-[1.55] text-muted">
        Recall is free and built with care. All tracking, insights, and
        reminders — right in this browser, no account needed.
      </p>

      <Link
        to="/donate"
        className="relative mt-4 inline-flex items-center justify-center gap-1.5 rounded-full border border-ink/12 px-4 py-2.5 text-[13px] font-semibold text-ink transition-colors hover:border-rausch/40 hover:text-rausch"
      >
        <Heart size={14} />
        Support us
      </Link>
    </div>
  );
}
