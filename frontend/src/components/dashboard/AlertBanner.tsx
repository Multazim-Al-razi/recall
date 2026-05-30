import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, X } from 'lucide-react';
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

  const names = renewals.map((r) => `${r.name} (${sym}${r.amount.toFixed(2)})`).join(' and ');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="relative z-10 mx-auto -mt-5 max-w-[1280px] px-5 sm:px-8 md:px-12"
        role="alert"
      >
        <div className="flex items-center gap-3.5 rounded-lg bg-dark px-5 py-4 text-surface md:px-7 md:py-[18px]">
          <BellRing size={16} className="shrink-0 animate-pulse text-rausch" />
          <div className="flex-1 text-[13px] font-medium">
            <strong className="text-rausch">{renewals.length} renewal{renewals.length > 1 ? 's' : ''}</strong>
            {' '}in the next 48 hours &mdash; {names}. Review now.
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="flex items-center gap-1 text-[11px] tracking-[0.5px] text-muted transition-colors hover:text-surface"
          >
            <X size={13} />
            Dismiss
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
