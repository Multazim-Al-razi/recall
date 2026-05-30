import { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { MaskDivider } from '@/components/layout/MaskDivider';

const FAQ_ITEMS = [
  {
    q: 'What is Recall?',
    a: 'Recall is a subscription tracker that lives entirely in your browser. You add your recurring charges, and Recall calculates your true monthly spend, shows category breakdowns, and reminds you before each renewal date.',
  },
  {
    q: 'Is my data sent to a server?',
    a: "No. Everything is stored locally in your browser's IndexedDB. There are no accounts, no cloud sync, and no servers that ever see your financial data. Your subscriptions stay on your device.",
  },
  {
    q: 'How much does Recall cost?',
    a: 'Recall offers a free tier with up to 5 subscriptions. Paid plans are a one-time purchase — no recurring billing. See the Pricing page for full details.',
  },
  {
    q: 'Can I export my data?',
    a: 'Yes. You can export all your subscriptions as a JSON file from Settings. This file can be re-imported anytime or kept as a backup.',
  },
  {
    q: 'Does Recall connect to my bank?',
    a: 'No. Recall never asks for bank credentials or reads your transactions. You manually add each subscription, which keeps your financial accounts completely separate and secure.',
  },
  {
    q: 'What happens if I clear my browser data?',
    a: "Clearing browser data will erase your Recall data. We recommend exporting a JSON backup from Settings regularly. You can re-import it anytime to restore everything.",
  },
  {
    q: 'Can I use Recall on multiple devices?',
    a: 'Recall is local-first, so each device has its own data. You can use the export/import feature in Settings to move data between devices. Cloud sync may come in a future update.',
  },
  {
    q: 'How do renewal reminders work?',
    a: 'Recall uses browser notifications (if you grant permission) to alert you before a subscription renews. You can configure how far in advance you want to be reminded in Settings.',
  },
];

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
          className={`shrink-0 text-muted transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[14px] leading-[1.65] text-muted">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FaqPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="mx-auto max-w-[700px] px-5 sm:px-8 md:px-12">
        {/* Hero */}
        <section className="pt-[110px] pb-10 text-center md:pt-[130px]">
          <h1 className="text-[34px] font-light leading-[1.1] tracking-[-2px] sm:text-[42px]">
            Frequently asked <strong className="font-bold">questions</strong>
          </h1>
          <p className="mx-auto mt-4 max-w-[460px] text-[16px] leading-[1.65] text-muted">
            Everything you need to know about Recall. Can't find an answer?{' '}
            <Link to="/about" className="text-rausch underline underline-offset-2">
              Reach out
            </Link>
            .
          </p>
        </section>

        {/* Accordion */}
        <section className="rounded-xl bg-surface px-6 pb-2 sm:px-8">
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </section>

        {/* Bottom CTA */}
        <section className="py-16 text-center">
          <p className="text-[15px] text-muted">Ready to take control of your subscriptions?</p>
          <Link
            to="/onboarding"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-rausch px-8 py-3.5 text-[14px] font-semibold text-white transition-all hover:-translate-y-0.5"
          >
            Get started free
          </Link>
        </section>
      </div>

      <MaskDivider />
      <section className="pb-24 pt-8 text-center text-[13px] text-muted">
        Recall — track every subscription, never forget to cancel.
      </section>
    </motion.div>
  );
}
