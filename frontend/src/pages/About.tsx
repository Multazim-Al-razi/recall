import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { CREDITS } from "@/lib/credits";
import { Illustration } from "@/components/ui/Illustration";
import { Logo } from "@/components/ui/Logo";
import { MaskDivider } from "@/components/layout/MaskDivider";
import { DonateWidget } from "@/components/marketing/DonateWidget";

/** Left-rail index — every entry maps to a section id below. */
const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "problem", label: "The problem" },
  { id: "how", label: "How Recall works" },
  { id: "privacy", label: "Local-first & privacy" },
  { id: "philosophy", label: "Our philosophy" },
  { id: "faq", label: "FAQ" },
  { id: "credits", label: "Credits" },
] as const;

const FAQ_ITEMS = [
  {
    q: "What is Recall?",
    a: "Recall is a subscription tracker that lives entirely in your browser. You add your recurring charges, and Recall calculates your true monthly spend, shows category breakdowns, and reminds you before each renewal date.",
  },
  {
    q: "Is my data sent to a server?",
    a: "On the Local plan, everything is stored in your browser and never leaves your device. On Cloud, your data is stored so reminders can reach you across devices — but is never sold.",
  },
  {
    q: "How much does Recall cost?",
    a: "Recall is completely free. All tracking, charts, and unlimited subscriptions are available with no account needed. The upcoming mobile app will also be free, with native on-device reminders.",
  },
  {
    q: "Can I export my data?",
    a: "Yes. You can export all your subscriptions as a JSON file from Settings. This file can be re-imported anytime or kept as a backup.",
  },
  {
    q: "Does Recall connect to my bank?",
    a: "No. Recall never asks for bank credentials or reads your transactions. You manually add each subscription, which keeps your financial accounts completely separate and secure.",
  },
  {
    q: "What happens if I clear my browser data?",
    a: "Clearing browser data will erase your Recall data. We recommend exporting a JSON backup from Settings regularly. You can re-import it anytime to restore everything.",
  },
  {
    q: "Can I use Recall on multiple devices?",
    a: "Each device keeps its own data, and you can use export/import in Settings to move it between devices. The upcoming mobile app can optionally import your web data, or start fresh and stay fully local.",
  },
  {
    q: "How do renewal reminders work?",
    a: "Recall shows in-app alerts and can export your renewals to your calendar (.ics), so your own calendar app notifies you. The upcoming mobile app will fire native on-device notifications.",
  },
] as const;

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-ink/6 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-[15px] font-semibold leading-[1.4] sm:text-[16px]">
          {q}
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[14px] leading-[1.65] text-muted">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Tracks which section is in view to highlight the left-rail index. */
function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

export function AboutPage() {
  const { hash } = useLocation();
  const active = useScrollSpy(SECTIONS.map((s) => s.id));
  const didScroll = useRef(false);

  // Honor deep links like /about#faq (used by the merged FAQ redirect).
  useEffect(() => {
    if (!hash || didScroll.current) return;
    didScroll.current = true;
    const id = window.setTimeout(() => {
      document
        .getElementById(hash.slice(1))
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(id);
  }, [hash]);

  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Hero */}
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8 md:px-12">
         <section className="flex flex-col items-center gap-8 pt-12 pb-12 text-center md:flex-row md:gap-12 md:pt-16 md:text-left">
          <div className="flex-1">
            <h1 className="font-display text-[34px] font-light leading-[1.1] tracking-[-2px] sm:text-[44px]">
              Take control of your subscriptions.
            </h1>
            <p className="mx-auto mt-4 max-w-[480px] text-[16px] leading-[1.65] text-muted md:mx-0 md:text-[17px]">
              Subscriptions are easy to start and easy to forget. Recall keeps
              them all in one place, does the math on your true monthly spend,
              and reminds you before each renewal so you only pay for what you
              actually use.
            </p>
          </div>
          <Illustration
            name="aboutSupport"
            decorative={false}
            className="h-[220px] w-full max-w-[320px] object-contain"
          />
        </section>
      </div>

      {/* Indexed body: sticky left rail + verbose right content */}
      <div className="mx-auto max-w-[1100px] px-5 pb-8 sm:px-8 md:px-12">
        <div className="flex flex-col gap-10 md:flex-row md:gap-12">
          {/* Left index */}
          <aside className="md:w-[200px] md:shrink-0">
            <nav aria-label="On this page" className="md:sticky md:top-[100px]">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[2px] text-muted">
                On this page
              </div>
              <ul className="flex flex-row flex-wrap gap-x-4 gap-y-1 md:flex-col md:gap-1">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => scrollTo(s.id)}
                      aria-current={active === s.id ? "true" : undefined}
                      className={clsx(
                        "border-l-2 py-1.5 pl-3 text-left text-[13.5px] transition-colors",
                        active === s.id
                          ? "border-rausch font-semibold text-ink"
                          : "border-transparent text-muted hover:text-ink",
                      )}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Right content */}
          <div className="min-w-0 flex-1 space-y-16">
            {/* Overview */}
            <section id="overview" className="scroll-mt-[100px]">
              <h2 className="font-display text-[26px] font-light tracking-[-0.5px] md:text-[30px]">
                What Recall is
              </h2>
              <p className="mt-4 text-[15.5px] leading-[1.8] text-ink-soft">
                Recall is a subscription tracker that lives where your money
                decisions actually happen, quietly in the background, without
                asking for your bank login or your trust up front. You add the
                services you pay for, and Recall turns that scattered list into
                one honest monthly number, a clear renewal calendar, and a
                gentle nudge before anything bills.
              </p>
              <p className="mt-4 text-[15.5px] leading-[1.8] text-ink-soft">
                It is deliberately small in scope and generous in care. There is
                no feed to scroll, no streak to maintain, no upsell buried in
                every corner. Open it, see exactly what you are paying for,
                decide what stays, and close it. That is the whole product.
              </p>
            </section>

            {/* Problem */}
            <section id="problem" className="scroll-mt-[100px]">
              <h2 className="font-display text-[26px] font-light tracking-[-0.5px] md:text-[30px]">
                The problem we set out to fix
              </h2>
              <p className="mt-4 text-[15.5px] leading-[1.8] text-ink-soft">
                Subscriptions are designed to be easy to start and easy to
                forget. A free trial converts in silence. An annual plan renews
                eleven months after you last thought about it. A service you
                used once still quietly debits your card every month.
                Individually, each charge is small enough to ignore. Together,
                they add up to real money leaving your account for things you no
                longer use.
              </p>
              <p className="mt-4 text-[15.5px] leading-[1.8] text-ink-soft">
                The average person carries roughly a dozen recurring charges and
                underestimates their true monthly spend by nearly half. The gap
                is not carelessness, it is that nobody gives you a single, clear
                place to see the whole picture. Bank statements bury the signal
                in noise. Spreadsheets go stale the week after you build them.
              </p>
              <div className="mt-6 flex items-center gap-5 rounded-xl bg-surface-2 p-5">
                <Illustration
                  name="aboutWallet"
                  className="h-[110px] w-[130px] shrink-0 object-contain"
                />
                <p className="text-[14px] leading-[1.7] text-muted">
                  Recall closes that gap with no bank logins and no spreadsheet
                  — just a clear, honest view of what you are paying and when,
                  so the next surprise charge never arrives.
                </p>
              </div>
            </section>

            {/* How it works */}
            <section id="how" className="scroll-mt-[100px]">
              <h2 className="font-display text-[26px] font-light tracking-[-0.5px] md:text-[30px]">
                How Recall works
              </h2>
              <p className="mt-4 text-[15.5px] leading-[1.8] text-ink-soft">
                Three ideas carry the entire product. Each is small on its own;
                together they turn a pile of charges into something you can
                actually act on.
              </p>
              <div className="mt-6 space-y-6">
                <div className="border-l-2 border-rausch/30 pl-5">
                  <h3 className="text-[16px] font-semibold">
                    Never miss a renewal
                  </h3>
                  <p className="mt-1.5 text-[14.5px] leading-[1.7] text-muted">
                    Recall watches every billing date and nudges you before a
                    charge lands, so free trials never convert behind your back
                    and annual plans never ambush you. You get a clear window to
                    cancel, keep, or switch on your terms, not the vendor's.
                  </p>
                </div>
                <div className="border-l-2 border-teal/30 pl-5">
                  <h3 className="text-[16px] font-semibold">
                    See where the money goes
                  </h3>
                  <p className="mt-1.5 text-[14.5px] leading-[1.7] text-muted">
                    Category breakdowns and spend trends turn a scattered list
                    into one clear picture of your monthly burn. Normalised
                    across weekly, monthly, yearly, and custom cycles, so the
                    number you see is the number you actually pay.
                  </p>
                </div>
                <div className="border-l-2 border-gold/30 pl-5">
                  <h3 className="text-[16px] font-semibold">
                    Find the quiet savings
                  </h3>
                  <p className="mt-1.5 text-[14.5px] leading-[1.7] text-muted">
                    Recall surfaces overlapping services and forgotten trials,
                    then shows you exactly what you would save by consolidating
                    — a gentle nudge to make every charge an intentional
                    choice.
                  </p>
                </div>
              </div>
            </section>
            {/* MORE_SECTIONS */}

            {/* Privacy */}
            <section id="privacy" className="scroll-mt-[100px]">
              <h2 className="font-display text-[26px] font-light tracking-[-0.5px] md:text-[30px]">
                Local-first, and what that means for you
              </h2>
              <p className="mt-4 text-[15.5px] leading-[1.8] text-ink-soft">
                Every subscription you track says something about you — your
                habits, your priorities, roughly what you earn. We think that
                picture belongs to you and no one else. So Recall is built
                local-first: on the web, your data is stored in your own browser
                and never leaves your device. There is no account to create, no
                password to leak, no central database to breach.
              </p>
              <div className="mt-6 flex flex-col gap-5 rounded-xl bg-surface-2 p-6 sm:flex-row sm:items-center">
                <Illustration
                  name="aboutAutonomy"
                  className="h-[140px] w-full max-w-[180px] shrink-0 object-contain"
                />
                <ul className="flex-1 list-disc space-y-2.5 pl-5 text-[14px] leading-[1.6] text-ink-soft">
                  <li>No account or sign-up to start using the web app.</li>
                  <li>Your data stays on your device by default.</li>
                  <li>No ads, we measure download metrics to evaluate the product, no data sold on any plan.</li>
                  <li>Export to a file anytime; you are never locked in.</li>
                </ul>
              </div>
              <p className="mt-5 text-[15.5px] leading-[1.8] text-ink-soft">
                The honest trade-off: local data does not automatically follow
                you across devices. You can export your data from Settings and
                re-import it on any device. The upcoming mobile app will offer
                optional Cloud for cross-device use.
              </p>
            </section>

            {/* Philosophy */}
            <section id="philosophy" className="scroll-mt-[100px]">
              <h2 className="font-display text-[26px] font-light tracking-[-0.5px] md:text-[30px]">
                Why we built <Logo className="text-[26px] md:text-[30px]" />
              </h2>
              <p className="mt-4 text-[15.5px] leading-[1.8] text-ink-soft">
                We were tired of two things: surprise charges, and the kind of
                “free” apps that quietly make you the product. Recall is our
                answer to both. It is straightforward where most money tools are anxious,
                honest where most are vague, and respectful of your attention
                where most fight for it.
              </p>
              <p className="mt-4 text-[15.5px] leading-[1.8] text-ink-soft">
                That shapes every decision. We use one warm accent instead of
                alarming red. We show real numbers derived from your own data
                rather than invented history. Cloud is currently free
                during early access; when server costs make a fee necessary,
                it will be small, honest, and transparent — never ads or data.
                The goal is a tool you can trust precisely because its
                incentives point at you, not past you.
              </p>
            </section>


            {/* FAQ */}
            <section id="faq" className="scroll-mt-[100px]">
              <h2 className="font-display text-[26px] font-light tracking-[-0.5px] md:text-[30px]">
                Frequently asked questions
              </h2>
              <div className="mt-5">
                {FAQ_ITEMS.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </section>

            {/* Credits */}
            <section id="credits" className="scroll-mt-[100px]">
              <h2 className="font-display text-[26px] font-light tracking-[-0.5px] md:text-[30px]">
                Credits
              </h2>
              <p className="mt-3 text-[14.5px] leading-[1.7] text-muted">
                Recall is built on the work of generous open-source and design
                communities.
              </p>
              <ul className="mt-4 space-y-3">
                {CREDITS.filter((c) => c.attributionRequired).map((c) => (
                  <li
                    key={c.name}
                    className="rounded-lg bg-surface-2 p-4"
                  >
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[14px] font-semibold transition-colors hover:text-rausch"
                    >
                      {c.name}
                      <span className="font-normal text-muted">
                        {" "}
                        · {c.author}
                      </span>
                    </a>
                    {c.usage ? (
                      <>
                        <p className="mt-1 text-[12.5px] leading-[1.5] text-muted">
                          {c.usage}
                        </p>
                        <span className="mt-1.5 inline-block text-[11px] font-medium uppercase tracking-[0.5px] text-ink/35">
                          {c.licence}
                        </span>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>

      <MaskDivider />
      <section className="mx-auto max-w-[1100px] px-5 pt-8 text-center sm:px-8 md:px-12">
        <p className="text-[15px] leading-[1.7] text-muted">
          Ready to take control?{" "}
          <Link
            to="/onboarding"
            className="text-[15px] text-muted underline decoration-ink/20 underline-offset-4 transition-colors hover:text-rausch"
          >
            Get started for free
          </Link>
        </p>
      </section>
      <section className="mx-auto max-w-[1100px] px-5 pb-24 pt-8 sm:px-8 md:px-12">
        <DonateWidget />
      </section>
    </motion.div>
  );
}
