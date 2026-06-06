import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, CreditCard, Ellipsis, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscriptionStore } from '@/stores/subscription';
import { usePaymentMethodStore } from '@/stores/paymentMethod';
import { PaymentCardVisual } from '@/components/ui/PaymentCardVisual';
import { CARD_BRAND_LABELS, type CardBrand } from '@/types/paymentMethod';
import { CARD_SHADES, CARD_SHADE_LIST, type CardShade } from '@/lib/cardTheme';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const INPUT_CLASS =
  'w-full rounded-sm border border-ink/10 bg-canvas px-3 py-2 text-sm focus:border-rausch focus:outline-none';

/** Max visible stacked cards (including the active one). */
const MAX_VISIBLE_STACK = 3;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MyCardsWidget() {
  /* ---- stores ---- */
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const paymentMethods = usePaymentMethodStore((s) => s.paymentMethods);
  const activeCardIndex = usePaymentMethodStore((s) => s.activeCardIndex);
  const { addPaymentMethod, removePaymentMethod, setActiveCardIndex } =
    usePaymentMethodStore();

  /* ---- local state ---- */
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formBrand, setFormBrand] = useState<CardBrand>('visa');
  const [formLabel, setFormLabel] = useState('');
  const [formLast4, setFormLast4] = useState('');
  const [formShade, setFormShade] = useState<CardShade>('coral');

  /* ---- derived ---- */
  const count = paymentMethods.length;
  const activeCard = paymentMethods[activeCardIndex];
  const linkedCount = useMemo(
    () =>
      activeCard
        ? subscriptions.filter(
            (s) => s.paymentMethodId === activeCard.id && s.status === 'active',
          ).length
        : 0,
    [subscriptions, activeCard],
  );

  // Clamp active index when cards are removed
  useEffect(() => {
    if (count === 0) return;
    if (activeCardIndex >= count) {
      setActiveCardIndex(count - 1);
    }
  }, [count, activeCardIndex, setActiveCardIndex]);

  /* ---- handlers ---- */
  const handleAddCard = useCallback(() => {
    if (!formLabel.trim() || !formLast4.trim() || formLast4.length !== 4) return;
    addPaymentMethod({
      label: formLabel.trim(),
      brand: formBrand,
      last4: formLast4,
      color: '',
      shade: formShade,
    });
    setAddFormOpen(false);
    setFormLabel('');
    setFormLast4('');
    setFormBrand('visa');
    setFormShade('coral');
  }, [formLabel, formLast4, formBrand, formShade, addPaymentMethod]);

  const handleDeleteActive = useCallback(() => {
    if (count <= 1) return;
    removePaymentMethod(paymentMethods[activeCardIndex].id);
    setMenuOpen(false);
  }, [count, activeCardIndex, paymentMethods, removePaymentMethod]);

  /**
   * Build the ordered array of cards for the stack visual.
   * The active card is first, then subsequent cards wrap around.
   */
  const stackOrder = useMemo(() => {
    if (count === 0) return [];
    const ordered: number[] = [];
    for (let i = 0; i < Math.min(count, MAX_VISIBLE_STACK); i++) {
      ordered.push((activeCardIndex + i) % count);
    }
    return ordered;
  }, [count, activeCardIndex]);

  /* ---- render ---- */
  return (
    <div className="card-premium flex flex-col gap-4 p-5">
      {/* 1. Header row */}
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

      {/* 2. Active card summary (replaces Total Balance) */}
      {activeCard && (
        <div className="flex items-baseline gap-2">
          <p className="font-display text-[20px] font-light text-ink">
            {activeCard.label || CARD_BRAND_LABELS[activeCard.brand]}
          </p>
          {linkedCount > 0 && (
            <p className="text-[12px] text-muted">
              {linkedCount} subscription{linkedCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* 3. Card display area */}
      {count > 0 ? (
        <div className="relative h-[180px]">
          <AnimatePresence mode="popLayout">
            {stackOrder.map((cardIdx, stackPos) => {
              const pm = paymentMethods[cardIdx];
              const isActive = stackPos === 0;
              const offset = stackPos * 30;
              const scale = 1 - stackPos * 0.05;
              const opacity = isActive ? 1 : 0.7 - stackPos * 0.15;
              const zIndex = 30 - stackPos * 10;

              return (
                <motion.div
                  key={pm.id}
                  layout
                  initial={{ opacity: 0, x: offset, scale }}
                  animate={{
                    opacity,
                    x: offset,
                    scale,
                    zIndex,
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{
                    layout: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] },
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.3 },
                    x: { duration: 0.4, ease: [0.22, 0.61, 0.36, 1] },
                  }}
                  className={cn(
                    'absolute top-0 left-0 max-w-[260px]',
                    !isActive && 'cursor-pointer',
                  )}
                  style={{ zIndex }}
                  onClick={() => {
                    if (!isActive) setActiveCardIndex(cardIdx);
                  }}
                  role={isActive ? undefined : 'button'}
                  tabIndex={isActive ? undefined : 0}
                  aria-label={
                    isActive
                      ? undefined
                      : `Switch to card ${pm.label || `ending ${pm.last4}`}`
                  }
                  onKeyDown={(e) => {
                    if (!isActive && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      setActiveCardIndex(cardIdx);
                    }
                  }}
                >
                  <PaymentCardVisual
                    card={pm}
                    shade={pm.shade ?? 'coral'}
                    showShadePicker={false}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* "+" add card button — positioned at the end of the stack */}
          <motion.button
            type="button"
            onClick={() => setAddFormOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'absolute top-0 flex aspect-[1.586/1] w-full max-w-[260px] items-center justify-center',
              'rounded-[1.2rem] border-2 border-dashed border-[var(--color-line)] transition-colors',
            )}
            style={{
              left: `${Math.min(count, MAX_VISIBLE_STACK) * 30}px`,
              zIndex: 0,
              transform: `scale(${1 - Math.min(count, MAX_VISIBLE_STACK) * 0.05})`,
              transformOrigin: 'top left',
            }}
            aria-label="Add new card"
          >
            <Plus
              size={28}
              strokeWidth={1.5}
              className="text-muted transition-colors hover:text-rausch"
            />
          </motion.button>
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

      {/* 4. Carousel dots + context menu */}
      {count > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {paymentMethods.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveCardIndex(idx)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                idx === activeCardIndex
                  ? 'w-5 bg-rausch'
                  : 'w-1.5 bg-muted/40 hover:bg-muted/60',
              )}
              aria-label={`Card ${idx + 1}`}
            />
          ))}

          {/* Context menu trigger — subtle, not prominent */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="ml-2 flex h-5 w-5 items-center justify-center rounded-full text-muted/60 transition-colors hover:text-ink"
            aria-label="Card options"
          >
            <Ellipsis size={12} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-5 z-50 rounded-lg bg-surface p-1 shadow-[0_4px_20px_rgba(0,0,0,0.12),0_0_0_1px_var(--color-hairline)]"
              >
                <button
                  type="button"
                  onClick={handleDeleteActive}
                  disabled={count <= 1}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[13px] text-muted transition-colors hover:bg-rausch/10 hover:text-rausch disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={13} />
                  Remove card
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 5. Add card modal */}
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
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add payment method</h3>
                <button
                  type="button"
                  onClick={() => setAddFormOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:text-ink"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <label className="block">
                  <span className="text-xs font-medium text-ink/70">Card brand</span>
                  <select
                    className={INPUT_CLASS}
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value as CardBrand)}
                  >
                    {(
                      [
                        'visa',
                        'mastercard',
                        'amex',
                        'discover',
                        'debit',
                        'other',
                      ] as CardBrand[]
                    ).map((b) => (
                      <option key={b} value={b}>
                        {CARD_BRAND_LABELS[b]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-ink/70">
                    Label
                  </span>
                  <input
                    className={INPUT_CLASS}
                    type="text"
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    placeholder="e.g. Main Visa, Joint Debit"
                    maxLength={60}
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-medium text-ink/70">
                    Last 4 digits
                  </span>
                  <input
                    className={INPUT_CLASS}
                    type="text"
                    inputMode="numeric"
                    value={formLast4}
                    onChange={(e) =>
                      setFormLast4(e.target.value.replace(/\D/g, '').slice(0, 4))
                    }
                    placeholder="2719"
                    maxLength={4}
                    required
                  />
                </label>

                {/* Shade picker in modal */}
                <div>
                  <span className="text-xs font-medium text-ink/70">Card color</span>
                  <div className="mt-2 flex items-center gap-2">
                    {CARD_SHADE_LIST.map((shade) => {
                      const meta = CARD_SHADES[shade];
                      const isActive = shade === formShade;
                      return (
                        <button
                          key={shade}
                          type="button"
                          onClick={() => setFormShade(shade)}
                          className={cn(
                            'h-8 w-8 rounded-full transition-transform duration-200',
                            isActive ? 'scale-110 ring-2 ring-ink/30' : 'hover:scale-105',
                          )}
                          style={{ background: meta.swatch }}
                          title={meta.label}
                          aria-label={`Color: ${meta.label}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
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