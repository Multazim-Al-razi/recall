import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePaymentMethodStore } from '@/stores/paymentMethod';
import { PaymentCardVisual } from '@/components/ui/PaymentCardVisual';
import { CARD_BRAND_LABELS } from '@/types/paymentMethod';
import { PaymentMethodModal } from '@/components/ui/PaymentMethodModal';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */



/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

/**
 * My Cards — Bankio-inspired side-by-side card display.
 *
 * Shows cards in a horizontal scroll row (not stacked/overlapping).
 * Each card sits naturally next to the others with a dark rounded "+"
 * button at the end. Swipe or scroll to see more cards.
 *
 * No edit/shade picker on the dashboard — that belongs in Settings.
 * Delete is available via a small icon on long-press or right-click context,
 * but primarily through the card management in Settings.
 */
export function MyCardsWidget() {
  /* ---- stores ---- */
  const paymentMethods = usePaymentMethodStore((s) => s.paymentMethods);
  const activeCardIndex = usePaymentMethodStore((s) => s.activeCardIndex);
  const { setActiveCardIndex } = usePaymentMethodStore();

  /* ---- local state ---- */
  const [mounted, setMounted] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);

  /* ---- derived ---- */
  const count = paymentMethods.length;

  // Set mount status
  useEffect(() => {
    setMounted(true);
  }, []);

  // Clamp active index when cards are removed
  useEffect(() => {
    if (count === 0) return;
    if (activeCardIndex >= count) {
      setActiveCardIndex(count - 1);
    }
  }, [count, activeCardIndex, setActiveCardIndex]);

  /* ---- handlers ---- */


  /* ---- render ---- */
  return (
    <div className="card-premium flex flex-col gap-4 p-5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-muted">
          My Cards
        </h3>
        {count > 0 && (
          <span className="text-[11px] font-semibold tabular-nums text-muted">
            {count} card{count !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Cards row — horizontal scroll, side-by-side like Bankio */}
      {count > 0 ? (
        <div className="flex items-start gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {paymentMethods.map((pm, idx) => (
            <div
              key={pm.id}
              className="relative shrink-0"
              style={{ width: 'min(260px, 70vw)' }}
            >
              {/* Card visual */}
              <motion.button
                type="button"
                onClick={() => setActiveCardIndex(idx)}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'w-full text-left transition-all duration-300',
                  idx === activeCardIndex
                    ? 'scale-100 opacity-100'
                    : 'scale-[0.97] opacity-70 hover:opacity-90',
                )}
                aria-label={`Select card ${pm.label || CARD_BRAND_LABELS[pm.brand]}`}
              >
                <PaymentCardVisual
                  card={pm}
                  shade={pm.shade ?? 'coral'}
                  showShadePicker={false}
                />
              </motion.button>
            </div>
          ))}

          {/* "+" Add card button — dark rounded card-shaped */}
          <div
            className="relative shrink-0"
            style={{ width: 'min(260px, 70vw)' }}
          >
            <motion.button
              type="button"
              onClick={() => setAddFormOpen(true)}
              whileTap={{ scale: 0.96 }}
              className="flex w-full items-center justify-center rounded-[1.2rem] bg-ink/90 text-surface/70 transition-colors hover:bg-ink hover:text-surface"
              style={{ aspectRatio: '1.586 / 1' }}
              aria-label="Add new card"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface/15 transition-transform hover:scale-105">
                  <Plus size={20} strokeWidth={2} />
                </span>
                <span className="text-[11px] font-medium tracking-wide">Add Card</span>
              </div>
            </motion.button>
          </div>
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center gap-3 rounded-[1.2rem] bg-canvas px-6 py-10 text-center text-muted shadow-[0_0_0_1px_var(--color-hairline),var(--shadow-xs)]">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-[0_0_0_1px_var(--color-hairline)]">
            <CreditCard size={22} strokeWidth={1.5} />
          </span>
          <div>
            <p className="text-[13px] font-medium text-ink">No cards yet</p>
            <p className="mt-1 text-[12px] leading-snug">
              Add a payment method to track which card pays each subscription.
            </p>
          </div>
          <motion.button
            type="button"
            onClick={() => setAddFormOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mt-1 inline-flex items-center gap-1 rounded-full bg-rausch px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-rausch-hover"
            aria-label="Add your first card"
          >
            <Plus size={14} /> Add card
          </motion.button>
        </div>
      )}

      {/* ─── Add card modal ──────────────────────────────────── */}
      {mounted && (
        <PaymentMethodModal
          isOpen={addFormOpen}
          onClose={() => setAddFormOpen(false)}
          initialData={null}
        />
      )}
    </div>
  );
}