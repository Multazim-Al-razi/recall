import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Plus, CreditCard, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscriptionStore, getMonthlySpend, toMonthlyAmount } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { usePaymentMethodStore } from '@/stores/paymentMethod';
import { formatMoney } from '@/lib/format';
import { PaymentCardVisual } from '@/components/ui/PaymentCardVisual';
import { CARD_BRAND_LABELS, type CardBrand } from '@/types/paymentMethod';

const inputClass =
  'w-full rounded-sm border border-ink/10 bg-canvas px-3 py-2 text-sm focus:border-rausch focus:outline-none';

/** Slide direction for the carousel AnimatePresence. 1 = next (slide in
 *  from right), -1 = prev (slide in from left). */
type SlideDir = 1 | -1;

/** Carousel slide variants — the active card sits at x:0, the new card
 *  enters from the side the user is paging toward, the old card exits
 *  out the opposite side. No transparency / no stacked behind — only
 *  one card on stage at a time, animated by Framer Motion. */
const cardVariants = {
  enter: (dir: SlideDir) => ({ x: dir > 0 ? '110%' : '-110%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: SlideDir) => ({ x: dir > 0 ? '-110%' : '110%', opacity: 0 }),
};

export function PaymentMethodCard() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const profile = useAccountStore((s) => s.profile);
  const paymentMethods = usePaymentMethodStore((s) => s.paymentMethods);
  const activeCardIndex = usePaymentMethodStore((s) => s.activeCardIndex);
  const { addPaymentMethod, removePaymentMethod, setActiveCardIndex } = usePaymentMethodStore();
  const cur = profile.currency;

  const [addFormOpen, setAddFormOpen] = useState(false);
  const [formBrand, setFormBrand] = useState<CardBrand>('visa');
  const [formLabel, setFormLabel] = useState('');
  const [formLast4, setFormLast4] = useState('');
  const [slideDir, setSlideDir] = useState<SlideDir>(1);

  const activeSubs = useMemo(
    () => subscriptions.filter((s) => s.status === 'active'),
    [subscriptions],
  );

  const unlinkedBurn = useMemo(
    () => activeSubs
      .filter((s) => !s.paymentMethodId)
      .reduce((sum, s) => sum + toMonthlyAmount(s), 0),
    [activeSubs],
  );

  const totalBurn = getMonthlySpend(subscriptions);
  const count = paymentMethods.length;
  const activeCard = count > 0 ? paymentMethods[activeCardIndex] : null;

  // Clamp active index when cards are removed
  useEffect(() => {
    if (count === 0) return;
    if (activeCardIndex >= count) {
      setActiveCardIndex(count - 1);
    }
  }, [count, activeCardIndex, setActiveCardIndex]);

  const goTo = useCallback(
    (nextIndex: number) => {
      if (count <= 1) return;
      const dir: SlideDir = nextIndex > activeCardIndex ? 1 : -1;
      setSlideDir(dir);
      setActiveCardIndex(((nextIndex % count) + count) % count);
    },
    [activeCardIndex, count, setActiveCardIndex],
  );

  const handleAddCard = () => {
    if (!formLabel.trim() || !formLast4.trim() || formLast4.length !== 4) return;
    addPaymentMethod({
      label: formLabel.trim(),
      brand: formBrand,
      last4: formLast4,
      color: '',
      shade: 'coral',
    });
    setAddFormOpen(false);
    setFormLabel('');
    setFormLast4('');
    setFormBrand('visa');
  };

  return (
    <div className="flex h-full flex-col gap-3">
        {/* Card management toolbar — lives ABOVE the card so the area
            under the carousel stays clean. Right-aligned: trash (delete
            active card) + Add card. */}
        {count > 0 && (
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted">
              {count} card{count !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => removePaymentMethod(paymentMethods[activeCardIndex].id)}
                disabled={count <= 1}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:bg-rausch/10 hover:text-rausch disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Delete active card"
                title="Delete card"
              >
                <Trash2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => setAddFormOpen(true)}
                className="flex items-center gap-1.5 rounded-full bg-rausch px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-rausch-hover"
              >
                <Plus size={13} /> Add card
              </button>
            </div>
          </div>
        )}

        {/* Carousel — the wrapper is rounded-[1.2rem] overflow-hidden
            so the card's drop shadow is clipped to the rounded shape
            (no sharp shadow leaking past). AnimatePresence swaps the
            active card with a horizontal slide. */}
        {activeCard ? (
          <div className="relative">
            <div className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-[1.2rem]">
              <AnimatePresence custom={slideDir} initial={false} mode="popLayout">
                <motion.div
                  key={activeCard.id}
                  custom={slideDir}
                  variants={cardVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { duration: 0.42, ease: [0.22, 0.61, 0.36, 1] },
                    opacity: { duration: 0.2 },
                  }}
                >
                  <PaymentCardVisual
                    card={activeCard}
                    shade={activeCard.shade ?? 'coral'}
                    showShadePicker={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-[320px] flex-col items-center gap-3 rounded-[1.2rem] bg-canvas px-6 py-10 text-center text-muted shadow-[0_0_0_1px_var(--color-hairline),var(--shadow-xs)]">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-[0_0_0_1px_var(--color-hairline)]">
              <CreditCard size={22} strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-[13px] font-medium text-ink">No cards yet</p>
              <p className="mt-1 text-[12px] leading-snug">
                Add a payment method to track which card pays each subscription.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAddFormOpen(true)}
              className="mt-1 inline-flex items-center gap-1 rounded-full bg-rausch px-4 py-2 text-[13px] font-semibold text-white hover:bg-rausch-hover transition-colors"
            >
              <Plus size={14} /> Add card
            </button>
          </div>
        )}

        {/* Carousel dots */}
        {count > 1 && (
          <div className="flex justify-center gap-1.5">
            {paymentMethods.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goTo(idx)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  idx === activeCardIndex
                    ? 'w-5 bg-rausch'
                    : 'w-1.5 bg-muted/40 hover:bg-muted/60',
                )}
                aria-label={`Card ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Fee footer — separated card surface so the carousel stays
            unchaperoned. */}
        {(unlinkedBurn > 0 || count > 0) && (
          <div className="card-premium flex flex-col gap-3 p-4">
            {unlinkedBurn > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2 text-[12px]">
                <span className="text-muted">Unlinked subscriptions</span>
                <span className="font-semibold tabular-nums text-ink-soft">
                  {formatMoney(unlinkedBurn, cur)}
                </span>
              </div>
            )}

            <div className="flex items-end justify-between border-t border-[var(--color-hairline)] pt-3">
              <div>
                <div className="text-[11px] text-muted">Monthly auto-debit</div>
                <div className="font-display text-[20px] font-light tabular-nums">
                  {formatMoney(totalBurn, cur)}
                </div>
              </div>
              <Link
                to="/dashboard/settings"
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-rausch"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rausch/12">
                  <ChevronRight size={12} className="-rotate-90" />
                </span>
                Edit limits
              </Link>
            </div>
          </div>
        )}

      {/* Add card modal */}
      <AnimatePresence>
        {addFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/30 p-4"
            onClick={() => setAddFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] rounded-xl bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Add payment method</h3>
                <button
                  type="button"
                  onClick={() => setAddFormOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-ink"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-medium text-ink/70">Card brand</span>
                  <select
                    className={inputClass}
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value as CardBrand)}
                  >
                    {(['visa', 'mastercard', 'amex', 'discover', 'debit', 'other'] as CardBrand[]).map((b) => (
                      <option key={b} value={b}>{CARD_BRAND_LABELS[b]}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-ink/70">Label (e.g. "Main Visa", "Joint Debit")</span>
                  <input
                    className={inputClass}
                    type="text"
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    placeholder="My Visa card"
                    maxLength={60}
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-ink/70">Last 4 digits</span>
                  <input
                    className={inputClass}
                    type="text"
                    inputMode="numeric"
                    value={formLast4}
                    onChange={(e) => setFormLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="2719"
                    maxLength={4}
                    required
                  />
                </label>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddFormOpen(false)}
                  className="rounded-full px-5 py-2.5 text-sm font-medium text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCard}
                  disabled={!formLabel.trim() || formLast4.length !== 4}
                  className="rounded-full bg-rausch px-6 py-2.5 text-sm font-semibold text-white hover:bg-rausch-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Add card
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
