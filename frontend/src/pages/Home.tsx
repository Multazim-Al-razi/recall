import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { HeroCarousel } from "@/components/marketing/HeroCarousel";
import { StatBand } from "@/components/marketing/StatBand";
import { StepThread } from "@/components/marketing/StepThread";
import { Illustration } from "@/components/ui/Illustration";
import type { IllustrationKey } from "@/lib/visuals";
import { IntegrationsMarquee } from "@/components/marketing/IntegrationsMarquee";
import { OrganicGrowthHero } from "@/components/marketing/OrganicGrowthHero";

type Feature = {
  title: string;
  body: string;
  art: IllustrationKey;
};

const FEATURES: Feature[] = [
  {
    title: "Never miss a renewal",
    body: "Recall watches every billing date and nudges you before each charge lands, so trials never convert behind your back.",
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
  "Free to use",
  "No ads",
  "We never see your data",
  "Works offline",
];

export function HomePage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeOut" }}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-12 px-5 pt-12 pb-16 sm:px-8 md:flex-row md:gap-10 md:px-12 md:pt-16 md:pb-24">
          <div className="w-full max-w-[560px] text-center md:text-left">
            <h1 className="font-display text-[42px] font-light leading-[1.02] tracking-[-1.5px] sm:text-[52px] md:text-[60px]">
              The money leaving your account, finally in your{" "}
              <span className="text-gradient-rausch font-normal">hands</span>
            </h1>
            <p className="mx-auto mt-6 max-w-[460px] text-[17px] leading-[1.6] text-muted md:mx-0 md:text-[18px]">
              Recall tracks every recurring charge so nothing renews behind your
              back. Use it free in your browser, or sign up for Cloud and
              reminders that reach you even with the tab closed — both free
              during early access.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
              <Link
                to="/onboarding"
                className="sheen inline-flex w-full items-center justify-center gap-2 rounded-full bg-rausch px-8 py-4 text-[15px] font-semibold text-white shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)] sm:w-auto"
              >
                Start tracking free
                <ArrowRight size={18} />
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

      {/* Stats band */}
      <div className="pt-16 md:pt-24">
        <StatBand />
      </div>

      {/* Feature trio — illustration-led, no cards, no icons */}
      <section className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8 md:px-12 md:py-24">
        {/* NO LABEL HEADER - removed "Why Recall" */}
        <h2 className="mb-12 font-display text-[30px] font-light tracking-[-1px] text-center md:text-[38px]">
          Clarity over your subscriptions
        </h2>
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
        {/* NO LABEL HEADER - removed "How it works" */}
        <h2 className="mb-10 font-display text-[30px] font-light tracking-[-1px] text-center md:text-[38px]">
          Set up in under a minute
        </h2>
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

      {/* Privacy & Trust Section */}
      <section className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8 md:px-12 md:py-24">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-6 font-display text-[32px] font-light tracking-[-1px] md:text-[40px]">
              Your data stays yours
            </h2>
            <div className="space-y-4 text-[15px] text-muted">
              <p>
                Nothing leaves your device unless you want it to. Your subscription
                data lives locally, completely private and secure.
              </p>
              <p>
                Open-source code means community-audited transparency. No hidden
                tracking, no data mining, just software that respects your boundaries.
              </p>
              <p>
                Works perfectly offline. Cloud is optional, and you are never
                locked out of your own information.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <a
                href="https://github.com/Multazim-Al-razi/recall"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-rausch underline-offset-4 hover:underline"
              >
                View source on GitHub
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Illustration
              name="privacy"
              decorative={false}
              className="mx-auto h-[320px] w-full max-w-[360px] object-contain"
            />
          </motion.div>
        </div>
      </section>

      {/* Find quiet savings */}
      <section className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8 md:px-12 md:py-24">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-6 font-display text-[32px] font-light tracking-[-1px] md:text-[40px]">
              Money back in your <span className="text-gradient-rausch font-normal">pocket</span>
            </h2>
            <div className="space-y-4 text-[15px] text-muted">
              <p>
                Most people carry 4–6 subscriptions they barely use. Recall spots
                overlapping services and forgotten trials, then shows you exactly
                what to cut.
              </p>
              <p>
                One honest number for your monthly burn, a yearly projection, and
                category splits, so you stop guessing and start saving.
              </p>
              <p>
                Every subscription you cut is money back in your pocket. Small
                cancellations compound — a forgotten $9 trial here, a duplicated
                music plan there — into real savings, every single month.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <Link
                to="/onboarding"
                className="inline-flex items-center gap-2 text-[14px] font-medium text-rausch underline-offset-4 hover:underline"
              >
                Start saving free
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
              name="celebration"
              decorative={false}
              className="mx-auto h-[320px] w-full max-w-[360px] object-contain"
            />
          </motion.div>
        </div>
      </section>

      {/* 🔥 NEW: Open Source & Community Section */}
      <section className="mx-auto max-w-[1100px] px-5 py-16 sm:px-8 md:px-12 md:py-24">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:[&>*:first-child]:order-2">
          <div>
            <h2 className="mb-6 font-display text-[32px] font-light tracking-[-1px] md:text-[40px]">
              Built openly, together
            </h2>
            <div className="space-y-4 text-[15px] text-muted">
              <p>
                Recall is free, open-source software built by the community, for the
                community. Licensed MIT, fork it, modify it, contribute back.
              </p>
              <p>
                Every line of code is transparent, and every feature request gets
                heard. This is not just our tool, it is yours as much as anyone
                else's.
              </p>
              <p>
                Join us in building software that respects your privacy, empowers your
                choices, and grows organically with feedback from users like you.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <a
                href="https://github.com/Multazim-Al-razi/recall"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[14px] font-medium text-rausch underline-offset-4 hover:underline"
              >
                Contribute on GitHub
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Illustration
              name="openSourceCode"
              decorative={false}
              className="mx-auto h-[320px] w-full max-w-[360px] object-contain"
            />
          </motion.div>
        </div>
      </section>

      {/* Organic Growth & Community Building Section */}
      <section className="mx-auto max-w-[1100px] px-5 pb-24 sm:px-8 md:px-12">
        <OrganicGrowthHero />
      </section>

      {/* Integrations Marquee */}
      <IntegrationsMarquee />
    </motion.div>
  );
}
