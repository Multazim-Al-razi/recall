import { useRef } from 'react';
import { Link } from 'react-router';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Illustration } from '@/components/ui/Illustration';
import type { IllustrationKey } from '@/lib/visuals';
import { MaskDivider } from '@/components/layout/MaskDivider';

function ParallaxSection({
  illustration,
  title,
  body,
  flip = false,
}: {
  illustration: IllustrationKey;
  title: string;
  body: string;
  flip?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center gap-10 py-16 md:flex-row md:gap-16 md:py-24 ${
        flip ? 'md:flex-row-reverse' : ''
      }`}
    >
      <motion.div style={{ y }} className="w-full max-w-[380px] shrink-0 md:max-w-[440px]">
        <Illustration
          name={illustration}
          decorative={false}
          className="w-full object-contain"
        />
      </motion.div>
      <div className="max-w-[480px]">
        <h2 className="text-[28px] font-light leading-[1.15] tracking-[-1px] md:text-[36px] md:tracking-[-1.5px]">
          {title}
        </h2>
        <p className="mt-4 text-[15px] leading-[1.7] text-muted md:text-[16px]">
          {body}
        </p>
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Hero */}
      <section className="mx-auto flex max-w-[1280px] flex-col-reverse items-center justify-between gap-8 px-5 pt-[96px] pb-14 sm:px-8 md:flex-row md:gap-12 md:px-12 md:pt-[150px] md:pb-20">
        <div className="w-full max-w-[540px] text-center md:text-left">
          <h1 className="mb-5 text-[40px] font-light leading-[1.05] tracking-[-1.5px] sm:text-[48px] md:mb-7 md:text-[56px] md:tracking-[-2.5px]">
            Stop paying for things you <strong className="font-bold">forgot</strong> to cancel.
          </h1>
          <p className="mx-auto max-w-[440px] text-[16px] leading-[1.65] text-muted md:mx-0 md:text-[18px]">
            Recall tracks every recurring charge, calculates your true monthly burn,
            and nudges you before each renewal.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
            <Link
              to="/onboarding"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-rausch px-8 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 sm:w-auto"
            >
              Get started free
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/12 px-8 py-3.5 text-[15px] font-semibold text-ink transition-all hover:border-rausch/40 hover:text-rausch sm:w-auto"
            >
              See pricing
            </Link>
          </div>
        </div>
        <div className="relative flex h-[280px] w-[280px] shrink-0 items-center justify-center sm:h-[340px] sm:w-[340px] md:h-[400px] md:w-[400px]">
          <div className="absolute h-[82%] w-[82%] rounded-full bg-rausch/[0.06]" />
          <Illustration
            name="hero"
            decorative={false}
            loading="eager"
            className="relative z-10 h-[92%] w-[92%] object-contain"
          />
        </div>
      </section>

      {/* Feature sections — alternating layout with parallax */}
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8 md:px-12">
        <ParallaxSection
          illustration="emptyAdd"
          title="Never miss a renewal"
          body="Recall watches every billing date and nudges you before a charge lands. Set it once, forget the rest — no more surprise deductions."
        />
        <ParallaxSection
          illustration="hero"
          title="See where money goes"
          body="Category breakdowns and monthly trends turn a pile of charges into a clear picture. Spot overlaps, track growth, and find savings."
          flip
        />
        <ParallaxSection
          illustration="empty"
          title="Yours, and only yours"
          body="Everything lives locally in your browser. No accounts to phish, no data to sell, no servers to breach. Your subscriptions stay private."
        />
      </div>

      <MaskDivider />

      {/* Bottom CTA */}
      <section className="pb-20 pt-8 text-center md:pb-24">
        <h2 className="text-[28px] font-light tracking-[-1px] md:text-[34px]">
          Ready to take control?
        </h2>
        <p className="mx-auto mt-3 max-w-[400px] text-[15px] text-muted">
          Start tracking in under a minute. No sign-up required.
        </p>
        <Link
          to="/onboarding"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-rausch px-9 py-4 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5"
        >
          Get started
          <ArrowRight size={17} />
        </Link>
      </section>
    </motion.div>
  );
}
