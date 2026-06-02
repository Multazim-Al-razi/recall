import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, Heart, Check } from "lucide-react";
import { HeroCarousel } from "@/components/marketing/HeroCarousel";
import { BrandMarquee } from "@/components/marketing/BrandMarquee";
import { StatBand } from "@/components/marketing/StatBand";
import { Testimonials } from "@/components/marketing/Testimonials";
import { StepThread } from "@/components/marketing/StepThread";
import { Illustration } from "@/components/ui/Illustration";
import type { IllustrationKey } from "@/lib/visuals";
import { MaskDivider } from "@/components/layout/MaskDivider";

type Feature = {
  title: string;
  body: string;
  art: IllustrationKey;
};

const FEATURES: Feature[] = [
  {
    title: "Never miss a renewal",
    body: "Recall watches every billing date and nudges you before a charge lands — so trials never convert behind your back.",
    art: "notification",
  },
  {
    title: "See where money goes",
    body: "Category breakdowns turn a pile of charges into one clear picture of your true monthly burn.",
    art: "revenueChart",
  },
  {
    title: "Find quiet savings",
    body: "Recall spots overlapping services and forgotten trials, then shows you exactly what to cut.",
    art: "savingsGoal",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Add your subscriptions",
    body: "Type a name and Recall autofills the logo, price, and cycle. Takes seconds.",
  },
  {
    num: "02",
    title: "See your real burn",
    body: "One honest monthly number, plus a yearly projection and category split.",
  },
  {
    num: "03",
    title: "Get nudged in time",
    body: "A clear heads-up before each renewal so you only pay for what you use.",
  },
];

const TRUST = [
  "Runs locally",
  "No sign-up",
  "No ads",
  "We never see your data",
];

export function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-12 px-5 pt-12 pb-16 sm:px-8 md:flex-row md:gap-10 md:px-12 md:pt-16 md:pb-24">
          <div className="w-full max-w-[560px] text-center md:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-ink/8 bg-surface/70 px-3.5 py-1.5 text-[12px] font-medium text-muted backdrop-blur">
              <Heart size={13} className="text-rausch" />
              Your subscriptions, on your device, under your control
            </div>
            <h1 className="font-display text-[42px] font-light leading-[1.02] tracking-[-1.5px] sm:text-[52px] md:text-[60px]">
              The money leaving your account, finally in your{" "}
              <span className="text-gradient-rausch font-normal">hands</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-[460px] text-[17px] leading-[1.6] text-muted md:mx-0 md:text-[18px]">
              Recall tracks every recurring charge right in your browser — no
              account, no upload, no catch. See your real monthly burn and get a
              heads-up before each renewal.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
              <Link
                to="/onboarding"
                className="sheen inline-flex w-full items-center justify-center gap-2 rounded-full bg-rausch px-8 py-4 text-[15px] font-semibold text-white shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)] sm:w-auto"
              >
                Start tracking free
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/about"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/12 px-8 py-4 text-[15px] font-semibold text-ink transition-all hover:border-rausch/40 hover:text-rausch sm:w-auto"
              >
                <Heart size={16} />
                Learn more
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:justify-start">
              {TRUST.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1.5 text-[13px] text-muted"
                >
                  <Check size={14} className="text-success" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative flex w-full justify-center md:w-auto md:justify-end">
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* Brand marquee */}
      <BrandMarquee />

      {/* Stats band */}
      <div className="pt-16 md:pt-24">
        <StatBand />
      </div>

      {/* Feature trio — illustration-led, no cards, no icons */}
      <section className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8 md:px-12 md:py-24">
        <div className="mb-12 text-center">
          <div className="text-[11px] font-bold uppercase tracking-[2.5px] text-rausch">
            Why Recall
          </div>
          <h2 className="mt-3 font-display text-[30px] font-light tracking-[-1px] md:text-[38px]">
            Clarity over your subscriptions
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="text-center"
            >
              <Illustration
                name={f.art}
                className="mx-auto h-[170px] w-full object-contain"
              />
              <h3 className="mt-6 text-[17px] font-semibold">{f.title}</h3>
              <p className="mx-auto mt-2 max-w-[300px] text-[14px] leading-[1.65] text-muted">
                {f.body}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-[1100px] px-5 pb-16 sm:px-8 md:px-12 md:pb-24">
        <div className="mb-10 text-center">
          <div className="text-[11px] font-bold uppercase tracking-[2.5px] text-rausch">
            How it works
          </div>
          <h2 className="mt-3 font-display text-[30px] font-light tracking-[-1px] md:text-[38px]">
            Set up in under a minute
          </h2>
        </div>
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[1fr_0.8fr] md:gap-14">
          <StepThread steps={STEPS} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="relative hidden md:block"
          >
            <Illustration
              name="financeOverview"
              decorative={false}
              className="mx-auto h-[320px] w-full max-w-[360px] object-contain"
            />
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      <MaskDivider />

      {/* Bottom CTA */}
      <section className="relative overflow-hidden pb-24 pt-10 text-center md:pb-28">
        <h2 className="font-display text-[32px] font-light tracking-[-1px] md:text-[42px]">
          Your money, back in your{" "}
          <span className="text-gradient-rausch font-normal">hands</span>.
        </h2>
        <p className="mx-auto mt-4 max-w-[460px] text-[15px] text-muted">
          Your data lives on your device. Everything you need to take back
          control of your subscriptions, right in your browser.
        </p>
        <Link
          to="/onboarding"
          className="sheen mt-8 inline-flex items-center gap-2 rounded-full bg-rausch px-9 py-4 text-[15px] font-semibold text-white shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"
        >
          Get started
          <ArrowRight size={17} />
        </Link>
      </section>
    </motion.div>
  );
}
