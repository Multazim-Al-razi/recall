import { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ChartPie, ChevronDown, ShieldCheck } from 'lucide-react';
import { CREDITS } from '@/lib/credits';
import { Illustration } from '@/components/ui/Illustration';
import { Logo } from '@/components/ui/Logo';
import { MaskDivider } from '@/components/layout/MaskDivider';

const PILLARS = [
  {
    icon: Bell,
    title: 'Never miss a renewal',
    body: 'Recall watches every billing date and nudges you before a charge lands, so trials never convert behind your back.',
  },
  {
    icon: ChartPie,
    title: 'See where money goes',
    body: 'Category breakdowns and spending trends turn a pile of charges into a clear picture of your monthly burn.',
  },
  {
    icon: ShieldCheck,
    title: 'Yours, and only yours',
    body: 'Everything lives locally in your browser. No accounts to phish, no servers to breach, no data to sell.',
  },
];

export function AboutPage() {
  const [creditsOpen, setCreditsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-[1000px] px-5 sm:px-8 md:px-12">
        {/* Hero */}
        <section className="flex flex-col items-center gap-8 pt-[110px] pb-12 text-center md:flex-row md:gap-12 md:pt-[130px] md:text-left">
          <div className="flex-1">
            <h1 className="text-[34px] font-light leading-[1.1] tracking-[-2px] sm:text-[42px]">
              The calm way to <strong className="font-bold">own your subscriptions</strong>.
            </h1>
            <p className="mx-auto mt-4 max-w-[460px] text-[16px] leading-[1.65] text-muted md:mx-0">
              Subscriptions are easy to start and easy to forget. Recall keeps them
              all in one place, does the math on your true monthly spend, and reminds
              you before each renewal — so you only pay for what you actually use.
            </p>
          </div>
          <Illustration
            name="welcome"
            decorative={false}
            className="h-[220px] w-full max-w-[300px] object-contain"
          />
        </section>

        {/* Pillars */}
        <section className="grid grid-cols-1 gap-4 pb-14 sm:grid-cols-3">
          {PILLARS.map((p) => (
            <div key={p.title} className="rounded-xl bg-surface p-7">
              <div className="flex h-11 w-11 items-center justify-center rounded-md bg-rausch/8 text-rausch">
                <p.icon size={20} />
              </div>
              <h3 className="mt-4 text-[16px] font-semibold">{p.title}</h3>
              <p className="mt-2 text-[13px] leading-[1.55] text-muted">{p.body}</p>
            </div>
          ))}
        </section>

        {/* Story */}
        <section className="mx-auto max-w-[640px] pb-14 text-center">
          <h2 className="text-[24px] font-light tracking-[-0.5px]">
            Why we built <strong className="font-bold"><Logo className="text-[24px]" /></strong>
          </h2>
          <p className="mt-4 text-[15px] leading-[1.7] text-muted">
            The average person carries a dozen recurring charges and underestimates
            their spend by nearly half. Recall exists to close that gap — no bank
            logins, no spreadsheets, just a clear, honest view of what you're paying
            and when. Start free, and upgrade once if you ever need more room.
          </p>
          <Link
            to="/pricing"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-rausch px-7 py-3 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5"
          >
            See plans
          </Link>
        </section>

        {/* Compact credits disclosure */}
        <section className="pb-16">
          <button
            onClick={() => setCreditsOpen((v) => !v)}
            aria-expanded={creditsOpen}
            className="mx-auto flex items-center gap-2 text-[12px] font-medium text-muted transition-colors hover:text-ink"
          >
            Built with open-source tools &amp; design resources
            <ChevronDown
              size={14}
              className={`transition-transform ${creditsOpen ? 'rotate-180' : ''}`}
            />
          </button>
          <AnimatePresence>
            {creditsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mx-auto mt-5 flex max-w-[680px] flex-wrap justify-center gap-x-5 gap-y-2 text-center text-[12px] text-muted">
                  {CREDITS.map((c) => (
                    <a
                      key={c.name}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transition-colors hover:text-rausch"
                    >
                      {c.name}
                      <span className="text-ink/25"> · {c.author}</span>
                    </a>
                  ))}
                </div>
                <p className="mx-auto mt-3 max-w-[520px] text-center text-[11px] leading-[1.5] text-ink/40">
                  Illustrations by Storyset (Freepik) and unDraw. Icons by Lucide.
                  Brand logos via Simple Icons. Thanks to all these communities.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <MaskDivider />
      <section className="pb-24 pt-8 text-center text-[13px] text-muted">
        Recall — track every subscription, never forget to cancel.
      </section>
    </motion.div>
  );
}
