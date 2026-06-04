import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, CreditCard, Trash2, X, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscriptionStore, getMonthlySpend, toMonthlyAmount } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { usePaymentMethodStore } from '@/stores/paymentMethod';
import { formatMoney, currencySymbol } from '@/lib/format';
import { PaymentCardVisual } from '@/components/ui/PaymentCardVisual';
import { getCardTheme, type CardShade } from '@/lib/cardTheme';
import { CARD_BRAND_LABELS, type CardBrand } from '@/types/paymentMethod';

const inputClass =
  'w-full rounded-sm border border-ink/10 bg-canvas px-3 py-2 text-sm focus:border-rausch focus:outline-none';

export function PaymentMethodCard() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const profile = useAccountStore((s) => s.profile);
  const paymentMethods = usePaymentMethodStore((s) => s.paymentMethods);
  const activeCardIndex = usePaymentMethodStore((s) => s.activeCardIndex);
  const { addPaymentMethod, removePaymentMethod, setCardShade, setActiveCardIndex } = usePaymentMethodStore();
  const cur = profile.currency;
  const sym = currencySymbol(cur);

  const [addFormOpen, setAddFormOpen] = useState(false);
  const [formBrand, setFormBrand] = useState<CardBrand>('visa');
  const [formLabel, setFormLabel] = useState('');
  const [formLast4, setFormLast4] = useState('');

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

  const burnByCard = useMemo(() => {
    const map: Record<string, number> = {};
    for (const pm of paymentMethods) {
      map[pm.id] = activeSubs
        .filter((s) => s.paymentMethodId === pm.id)
        .reduce((sum, s) => sum + toMonthlyAmount(s), 0);
    }
    return map;
  }, [activeSubs, paymentMethods]);

  const totalBurn = getMonthlySpend(subscriptions);
  const count = paymentMethods.length;

  // Clamp active index when cards are removed
  useEffect(() => {
    if (count === 0) return;
    if (activeCardIndex >= count) {
      setActiveCardIndex(count - 1);
    }
  }, [count, activeCardIndex, setActiveCardIndex]);

  const handlePrev = useCallback(() => {
    if (count <= 1) return;
    setActiveCardIndex(((activeCardIndex - 1 + count) % count));
  }, [activeCardIndex, count, setActiveCardIndex]);

  const handleNext = useCallback(() => {
    if (count <= 1) return;
    setActiveCardIndex(((activeCardIndex + 1) % count));
  }, [activeCardIndex, count, setActiveCardIndex]);

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

  const handleShadeChange = useCallback((cardId: string, shade: CardShade) => {
    setCardShade(cardId, shade);
  }, [setCardShade]);

  // Carousel slide styles — mirrors HeroCarousel stacking effect
  const getSlideStyle = (index: number): React.CSSProperties => {
    const isActive = index === activeCardIndex;
    const offset = index - activeCardIndex;
    // Wrap around for circular navigation
    const wrappedOffset = offset > Math.floor(count / 2)
      ? offset - count
      : offset < -Math.floor(count / 2)
        ? offset + count
        : offset;
    const absOff = Math.abs(wrappedOffset);

    if (absOff > 1) {
      return {
        zIndex: 0,
        opacity: 0,
        pointerEvents: 'none',
        transform: 'scale(0.8)',
        transition: 'transform 0.5s ease, opacity 0.5s ease',
      };
    }

    const transition = 'transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.5s ease';

    if (isActive) {
      return {
        zIndex: 3,
        opacity: 1,
        pointerEvents: 'auto',
        transform: 'translateX(0) translateY(0) scale(1) rotateY(0deg)',
        transition,
      };
    }

    return {
      zIndex: 2,
      opacity: 0.7,
      pointerEvents: 'auto',
      cursor: 'pointer',
      transform: `translateX(${wrappedOffset * 100}px) translateY(-12px) scale(0.85) rotateY(${wrappedOffset * -8}deg)`,
      transition,
    };
  };

  return (
    <div className="flex h-full gap-3">
      {/* Rail of quick actions */}
      <div className="flex flex-col items-center justify-between rounded-[20px] bg-surface px-2 py-4 shadow-[0_0_0_1px_var(--color-hairline),var(--shadow-xs)]">
        <Link
          to="/dashboard/subscriptions"
          aria-label="Add subscription"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-ink transition-colors hover:text-rausch"
        >
          <Plus size={16} />
        </Link>
        <Link
          to="/dashboard/analytics"
          aria-label="Share"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-ink"
        >
          <Share2 size={15} />
        </Link>
      </div>

      <div className="card-premium flex flex-1 flex-col justify-between gap-4 p-5">
        {/* Card carousel or empty state */}
        {paymentMethods.length > 0 ? (
          <div className="flex flex-col gap-3">
            {/* Carousel container */}
            <div
              className="relative h-[210px] flex items-center justify-center"
              style={{ perspective: '1000px' }}
            >
              {paymentMethods.map((pm, idx) => {
                const isActive = idx === activeCardIndex;
                return (
                  <div
                    key={pm.id}
                    className="absolute"
                    style={getSlideStyle(idx)}
                    aria-hidden={!isActive}
                    onClick={() => !isActive && setActiveCardIndex(idx)}
                  >
                    <PaymentCardVisual
                      card={pm}
                      burn={burnByCard[pm.id] ?? 0}
                      linkedCount={activeSubs.filter((s) => s.paymentMethodId === pm.id).length}
                      currencySymbol={sym}
                      illustrationTheme={getCardTheme(idx)}
                      useIllustrationBg={true}
                      shade={pm.shade ?? 'coral'}
                      showShadePicker={isActive}
                      onShadeChange={(shade) => handleShadeChange(pm.id, shade)}
                      className="h-[170px] w-full max-w-[320px]"
                    />
                  </div>
                );
              })}
            </div>

            {/* Carousel navigation */}
            {count > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-ink shadow-[0_0_0_1px_var(--color-hairline)] transition-colors hover:text-rausch"
                  aria-label="Previous card"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex gap-1.5">
                  {paymentMethods.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveCardIndex(idx)}
                      className={cn(
                        'h-2 rounded-full transition-all duration-300',
                        idx === activeCardIndex
                          ? 'w-6 bg-rausch'
                          : 'w-2 bg-muted/40 hover:bg-muted/60',
                      )}
                      aria-label={`Card ${idx + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas text-ink shadow-[0_0_0_1px_var(--color-hairline)] transition-colors hover:text-rausch"
                  aria-label="Next card"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Card management: delete + count */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-ink-soft">
                {count} card{count !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => removePaymentMethod(paymentMethods[activeCardIndex].id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted hover:text-rausch hover:bg-rausch/10 transition-colors"
                  aria-label="Delete active card"
                >
                  <Trash2 size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setAddFormOpen(true)}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-rausch hover:bg-rausch/5 rounded-full px-3 py-1.5 transition-colors"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 text-muted">
            <CreditCard size={28} strokeWidth={1.5} />
            <p className="text-[12px] text-center">Add a payment method to track which card pays each subscription.</p>
            <button
              type="button"
              onClick={() => setAddFormOpen(true)}
              className="mt-1 inline-flex items-center gap-1 rounded-full bg-rausch px-4 py-2 text-[13px] font-semibold text-white hover:bg-rausch-hover transition-colors"
            >
              <Plus size={14} /> Add card
            </button>
          </div>
        )}

        {/* Unlinked burn */}
        {unlinkedBurn > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2 text-[12px]">
            <span className="text-muted">Unlinked subscriptions</span>
            <span className="font-semibold tabular-nums text-ink-soft">
              {formatMoney(unlinkedBurn, cur)}
            </span>
          </div>
        )}

        {/* Fee footer */}
        <div className="flex items-end justify-between border-t border-[var(--color-hairline)] pt-4">
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
    </div>
  );
}
