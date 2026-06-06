import { motion } from "framer-motion";
import { SegmentRing } from "@/components/charts/SegmentRing";

/** Demo spend mix for the hero ring — flat warm-trio pills. */
const RING = [
  { key: "Entertainment", value: 76, color: "#d64f33" },
  { key: "Cloud", value: 48, color: "#16786a" },
  { key: "Productivity", value: 36, color: "#e0a23c" },
  { key: "Music", value: 24, color: "#e8896d" },
];

/**
 * Hero carousel slide — the burn snapshot. Ring-led: one big spend ring as the
 * centrepiece, a prominent total, and a compact colour legend. Minimal text.
 */
export function HeroPreview() {
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
            Monthly burn
          </div>
          <span className="rounded-full bg-canvas/70 px-3 py-1 text-[11px] font-medium text-muted">
            9 active
          </span>
        </div>

        {/* Ring centrepiece — fills the body */}
        <div className="flex flex-1 items-center justify-center py-2">
          <SegmentRing
            segments={RING}
            size={224}
            thickness={20}
            gap={0}
            ariaLabel="$184 per month across four categories"
          >
            <span className="font-display text-[46px] font-light leading-none tracking-[-2px] tabular-nums">
              $184
            </span>
            <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[2px] text-muted">
              per month
            </span>
          </SegmentRing>
        </div>

        {/* Compact legend */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-hairline pt-5">
          {RING.map((seg) => (
            <div key={seg.key} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: seg.color }}
              />
              <span className="flex-1 truncate text-[12px] text-ink/70">
                {seg.key}
              </span>
              <span className="text-[12px] font-semibold tabular-nums">
                ${seg.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
