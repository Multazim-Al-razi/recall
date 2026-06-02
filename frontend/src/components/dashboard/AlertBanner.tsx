import { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, X, ArrowRight } from 'lucide-react';
import type { Subscription } from '@/types/subscription';
import { currencySymbol } from '@/lib/format';

interface Props {
  renewals: Subscription[];
  currency?: string;
}

export function AlertBanner({ renewals, currency = 'USD' }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const sym = currencySymbol(currency);

  if (dismissed || renewals.length === 0) return null;

  const total = renewals.reduce((sum, r) => sum + r.amount, 0);
  const names = renewals.map((r) => r.name).join(', ');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="relative z-10 mx-auto -mt-5 max-w-[1280px] px-5 sm:px-8 md:px-12"
        role="alert"
      >
        <div className="flex flex-col gap-3 overflow-hidden rounded-xl bg-dark px-5 py-4 text-[#f5f0eb] shadow-[0_12px_40px_rgba(26,26,26,0.18)] sm:flex-row sm:items-center md:px-7 md:py-[18px]">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rausch/15">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rausch/20 text-rausch animate-pulse-ring">
              <BellRing size={15} />
            </span>
          </span>
          <div className="flex-1 text-[13px] leading-relaxed">
            <strong className="text-rausch">
              {renewals.length} charge{renewals.length > 1 ? 's' : ''} ({sym}{total.toFixed(2)})
            </strong>{' '}
            in the next 48 hours — {names}. Cancel now if you don't need them.
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/subscriptions"
              className="inline-flex items-center gap-1.5 rounded-full bg-rausch px-4 py-2 text-[12px] font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Review
              <ArrowRight size={13} />
            </Link>
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss alert"
              className="flex h-7 w-7 items-center justify-center rounded-full text-[#999] transition-colors hover:bg-white/10 hover:text-[#f5f0eb]"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
