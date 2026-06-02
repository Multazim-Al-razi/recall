import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Illustration } from "@/components/ui/Illustration";

/**
 * Hero carousel slide — the cancel reminder. Illustration-led: a big reminder
 * visual, one bold headline, and a single decisive action. Minimal text.
 */
export function ReminderPreview() {
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
            Heads up
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-rausch/10 px-3 py-1 text-[11px] font-semibold text-rausch">
            <span className="h-1.5 w-1.5 rounded-full bg-rausch" />
            18h left
          </span>
        </div>

        {/* Illustration centrepiece — fills the body */}
        <div className="flex flex-1 items-center justify-center py-2">
          <Illustration
            name="notification"
            className="h-full max-h-45 w-full object-contain"
          />
        </div>

        <div className="text-center">
          <p className="font-display text-[22px] font-light leading-[1.2] tracking-[-0.5px]">
            Your <span className="font-normal text-rausch">Disney+</span> trial
            converts tomorrow
          </p>
          <p className="mt-1.5 text-[13px] text-muted tabular-nums">
            Becomes $13.99/mo if you keep it
          </p>
        </div>

        <div className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-rausch py-3 text-[13px] font-semibold text-white">
          <X size={15} strokeWidth={2.5} />
          Cancel in one tap
        </div>
      </div>
    </motion.div>
  );
}
