import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { Illustration } from "@/components/ui/Illustration";

const BENEFITS = [
  "No premium walls — every feature is free right now",
  "Community-driven, open-source roadmap",
  "Grows with feedback from users like you",
];

/**
 * Organic growth & community section. Matches the homepage's illustration-led
 * two-column pattern — text first on mobile, cherry tree illustration on the
 * side (left on desktop via column reversal).
 */
export function OrganicGrowthHero() {
  return (
    <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
      <div>
        <h2 className="mb-6 font-display text-[32px] font-light tracking-[-1px] md:text-[40px]">
          Growing with the <span className="text-gradient-rausch font-normal">community</span>
        </h2>
        <div className="space-y-4 text-[15px] text-muted">
          <p>
            Recall is free because it should be. No premium walls, no
            features locked behind a paywall, just a tool that does its job and gets better over time.
          </p>
          <p>
            Every feature request and bug report shapes the roadmap. Real
            users, real priorities, no venture-driven pivot.
          </p>
          <ul className="space-y-2.5 pt-2">
            {BENEFITS.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2.5 text-[14px] text-muted"
              >
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-rausch shrink-0" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 flex items-center gap-3">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 text-[14px] font-medium text-rausch underline-offset-4 hover:underline"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Illustration
          name="cherryTree"
          decorative={false}
          className="mx-auto h-[240px] w-full max-w-[360px] object-contain md:h-[320px]"
        />
      </motion.div>
    </div>
  );
}
