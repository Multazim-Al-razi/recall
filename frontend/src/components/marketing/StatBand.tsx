import { useState } from "react";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

/**
 * Product-truth counter band. Every number is something Recall can prove
 * about itself — no sample-data estimates of user savings or average spend.
 */
const STATS = [
  {
    value: 0,
    prefix: "",
    suffix: "",
    label: "Surprise charges",
    display: "Zero",
  },
  {
    value: 0,
    prefix: "",
    suffix: "",
    label: "Ads and trackers",
    display: "Zero",
  },
  {
    value: 100,
    prefix: "",
    suffix: "%",
    label: "On your device",
    decimals: 0,
  },
  {
    value: 0,
    prefix: "",
    suffix: "",
    label: "Bank login required",
    display: "None",
  },
] as const;

/**
 * Headline metrics band. Counters stay at their target until the section
 * scrolls into view, then spring up — a small moment of motion that makes the
 * numbers feel earned rather than static.
 */
export function StatBand() {
  const [inView, setInView] = useState(false);

  return (
    <motion.section
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto max-w-[1100px] px-5 py-4 sm:px-8 md:px-12"
    >
      <div className="card-premium grid grid-cols-2 gap-y-8 overflow-hidden p-8 md:grid-cols-4 md:gap-y-0 md:p-10">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="relative flex flex-col items-center text-center md:px-4"
          >
            {i > 0 && (
              <span className="absolute left-0 top-1/2 hidden h-12 w-px -translate-y-1/2 bg-hairline md:block" />
            )}
            <div className="font-display text-[34px] font-light leading-none tracking-[-1px] text-ink md:text-[40px]">
              {"display" in s && s.display ? (
                s.display
              ) : inView ? (
                <AnimatedCounter
                  value={s.value}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  decimals={"decimals" in s ? s.decimals : 0}
                />
              ) : (
                <span>
                  {s.prefix}
                  {s.value}
                  {s.suffix}
                </span>
              )}
            </div>
            <div className="mt-2.5 text-[13px] leading-[1.4] text-muted">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
