import { useState } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus, CreditCard, Trash2, X, Share2 } from 'lucide-react';
import { useMemo } from 'react';
import { useSubscriptionStore, getMonthlySpend, toMonthlyAmount } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { usePaymentMethodStore } from '@/stores/paymentMethod';
import { formatMoney } from '@/lib/format';
import { currencySymbol } from '@/lib/format';
import { PaymentCardVisual, getCardTheme, type CardIllustrationTheme } from '@/components/ui/PaymentCardVisual';
import {
  CARD_BRAND_LABELS,
  type CardBrand,
  type PaymentMethod,
} from '@/types/paymentMethod';

const inputClass =
  'w-full rounded-sm border border-ink/10 bg-canvas px-3 py-2 text-sm focus:border-rausch focus:outline-none';

export function PaymentMethodCard() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const profile = useAccountStore((s) => s.profile);
  const paymentMethods = usePaymentMethodStore((s) => s.paymentMethods);
  const { addPaymentMethod, removePaymentMethod } = usePaymentMethodStore();
  const cur = profile.currency;
  const sym = currencySymbol(cur);

  const [expanded, setExpanded] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [formBrand, setFormBrand] = useState<CardBrand>('visa');
  const [formLabel, setFormLabel] = useState('');
  const [formLast4, setFormLast4] = useState('');

  const activeSubs = useMemo(
    () => subscriptions.filter((s) => s.status === 'active'),
    [subscriptions],
  );

  // Total auto-debit for unlinked subscriptions
  const unlinkedBurn = useMemo(
    () => activeSubs
      .filter((s) => !s.paymentMethodId)
      .reduce((sum, s) => sum + toMonthlyAmount(s), 0),
    [activeSubs],
  );

  // Burn per payment method
  const burnByCard = useMemo(() => {
    const map: Record<string, number> = {};
    for (const pm of paymentMethods) {
      map[pm.id] = activeSubs
        .filter((s) => s.paymentMethodId === pm.id)
        .reduce((sum, s) => sum + toMonthlyAmount(s), 0);
    }
    return map;
  }, [activeSubs, paymentMethods]);

  const primaryCard = paymentMethods[0];
  const totalBurn = getMonthlySpend(subscriptions);

  const handleAddCard = () => {
    if (!formLabel.trim() || !formLast4.trim() || formLast4.length !== 4) return;
    addPaymentMethod({
      label: formLabel.trim(),
      brand: formBrand,
      last4: formLast4,
      color: '',
    });
    setAddFormOpen(false);
    setFormLabel('');
    setFormLast4('');
    setFormBrand('visa');
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
        {/* Card visual or empty state */}
        {primaryCard ? (
          <PaymentCardVisual
            card={primaryCard}
            burn={burnByCard[primaryCard.id] ?? 0}
            linkedCount={activeSubs.filter((s) => s.paymentMethodId === primaryCard.id).length}
            currencySymbol={sym}
            illustrationTheme={getCardTheme(0)}
            useIllustrationBg={true}
            className="h-[170px] w-full max-w-[320px]"
          />
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

        {/* Expandable card list */}
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-[11px] font-semibold text-ink-soft transition-colors hover:text-ink"
        >
          {paymentMethods.length} card{paymentMethods.length !== 1 ? 's' : ''}
          <ChevronDown size={13} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-2">
                {paymentMethods.map((pm, idx) => (
                  <CardRow
                    key={pm.id}
                    card={pm}
                    burn={burnByCard[pm.id] ?? 0}
                    linkedCount={activeSubs.filter((s) => s.paymentMethodId === pm.id).length}
                    cur={cur}
                    theme={getCardTheme(idx)}
                    onDelete={() => removePaymentMethod(pm.id)}
                  />
                ))}
                {unlinkedBurn > 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-canvas px-3 py-2 text-[12px]">
                    <span className="text-muted">Unlinked subscriptions</span>
                    <span className="font-semibold tabular-nums text-ink-soft">
                      {formatMoney(unlinkedBurn, cur)}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setAddFormOpen(true)}
                  className="flex items-center gap-2 rounded-lg bg-canvas px-3 py-2 text-[12px] font-medium text-rausch transition-colors hover:bg-rausch/5"
                >
                  <Plus size={14} /> Add payment method
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              <ChevronDown size={12} className="-rotate-90" />
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

function CardRow({
  card,
  burn,
  linkedCount,
  cur,
  theme,
  onDelete,
}: {
  card: PaymentMethod;
  burn: number;
  linkedCount: number;
  cur: string;
  theme: CardIllustrationTheme;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-canvas px-3 py-2.5">
      <div
        className="flex h-8 w-12 shrink-0 items-center justify-center rounded-md overflow-hidden"
      >
        <PaymentCardVisual
          card={card}
          burn={0}
          linkedCount={0}
          illustrationTheme={theme}
          useIllustrationBg={true}
          className="h-[40px] w-[60px] !rounded-md"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-ink truncate">{card.label}</span>
          <span className="text-[12px] font-semibold tabular-nums text-ink-soft">
            {formatMoney(burn, cur)}
          </span>
        </div>
        <div className="text-[10px] text-muted">
          ···· {card.last4} · {linkedCount} linked
        </div>
      </div>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete card"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted hover:text-rausch hover:bg-rausch/10 transition-colors"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
