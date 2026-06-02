import { motion } from "framer-motion";
import { TrendingDown } from "lucide-react";
import { Illustration } from "@/components/ui/Illustration";

/**
 * Hero carousel slide — the yearly projection. Illustration-led: a growth
 * visual up top, one big prominent savings figure below. Minimal text.
 */
export function ProjectionPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative h-full w-full"
    >
      <div className="card-premium flex h-full flex-col overflow-hidden p-7">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-[2.5px] text-rausch">
            Yearly projection
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-[11px] font-semibold text-success">
            <TrendingDown size={13} strokeWidth={2.5} />
            17%
          </span>
        </div>

        {/* Illustration centrepiece — fills the body */}
        <div className="flex flex-1 items-center justify-center py-2">
          <Illustration
            name="growth"
            className="h-full max-h-45 w-full object-contain"
          />
        </div>

        {/* Prominent savings figure */}
        <div className="rounded-2xl bg-success/8 px-5 py-4 text-center">
          <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
            On track to save
          </div>
          <div className="mt-1 font-display text-[40px] font-light leading-none tracking-[-1.5px] tabular-nums text-success">
            $372
          </div>
          <div className="mt-1.5 text-[12px] text-muted">
            a year, down to{" "}
            <span className="font-semibold text-ink tabular-nums">
              $1,836/yr
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
