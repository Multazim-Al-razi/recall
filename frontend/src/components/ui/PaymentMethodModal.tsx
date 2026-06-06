import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePaymentMethodStore } from '@/stores/paymentMethod';
import { PaymentCardVisual } from '@/components/ui/PaymentCardVisual';
import { CARD_BRAND_LABELS, type CardBrand, type PaymentMethod } from '@/types/paymentMethod';
import { CARD_SHADES, CARD_SHADE_LIST, type CardShade } from '@/lib/cardTheme';

const INPUT_CLASS =
  'w-full rounded-lg border border-ink/10 bg-canvas/60 px-3.5 py-2.5 text-[13px] text-ink focus:border-rausch focus:outline-none focus:bg-canvas transition-colors';

const LABEL_CLASS = 'text-[11px] font-semibold uppercase tracking-[1px] text-ink/50';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: PaymentMethod | null;
}

export function PaymentMethodModal({ isOpen, onClose, initialData }: PaymentMethodModalProps) {
  const { addPaymentMethod, updatePaymentMethod, removePaymentMethod } = usePaymentMethodStore();

  const [formBrand, setFormBrand] = useState<CardBrand>('visa');
  const [formLabel, setFormLabel] = useState('');
  const [formLast4, setFormLast4] = useState('');
  const [formShade, setFormShade] = useState<CardShade>('coral');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync form with initialData when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormBrand(initialData.brand);
        setFormLabel(initialData.label);
        setFormLast4(initialData.last4);
        setFormShade(initialData.shade ?? 'coral');
      } else {
        setFormBrand('visa');
        setFormLabel('');
        setFormLast4('');
        setFormShade('coral');
      }
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    if (!formLabel.trim() || !formLast4.trim() || formLast4.length !== 4) return;
    
    if (initialData) {
      updatePaymentMethod(initialData.id, {
        label: formLabel.trim(),
        brand: formBrand,
        last4: formLast4,
        shade: formShade,
      });
    } else {
      addPaymentMethod({
        label: formLabel.trim(),
        brand: formBrand,
        last4: formLast4,
        color: '',
        shade: formShade,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (initialData && window.confirm(`Remove ${initialData.label}?`)) {
      removePaymentMethod(initialData.id);
      onClose();
    }
  };

  const previewCard = useMemo(
    () => ({
      id: '__preview__',
      label: formLabel || 'Your Card',
      brand: formBrand,
      last4: formLast4 || '0000',
      color: '',
      shade: formShade,
    }),
    [formLabel, formBrand, formLast4, formShade],
  );

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[360px] rounded-2xl bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.25),0_0_0_1px_var(--color-hairline)]"
          >
            {/* Live card preview */}
            <div className="flex items-center justify-center bg-canvas/50 px-5 pt-5 pb-3 rounded-t-2xl">
              <div className="w-full max-w-[210px]">
                <PaymentCardVisual
                  card={previewCard}
                  shade={formShade}
                  showShadePicker={false}
                />
              </div>
            </div>

            {/* Form */}
            <div className="p-5 pt-3">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-[16px] font-medium">
                  {initialData ? 'Edit payment method' : 'Add payment method'}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-canvas text-muted transition-colors hover:text-ink"
                  aria-label="Close"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className={LABEL_CLASS}>Card brand</span>
                    <select
                      className={INPUT_CLASS}
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value as CardBrand)}
                    >
                      {(
                        ['visa', 'mastercard', 'amex', 'discover', 'debit', 'other'] as CardBrand[]
                      ).map((b) => (
                        <option key={b} value={b}>
                          {CARD_BRAND_LABELS[b]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className={LABEL_CLASS}>Last 4 digits</span>
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
                </div>

                <label className="block">
                  <span className={LABEL_CLASS}>Label</span>
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

                {/* Shade picker */}
                <div>
                  <span className={LABEL_CLASS}>Card color</span>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {CARD_SHADE_LIST.map((shade) => {
                      const meta = CARD_SHADES[shade];
                      const isActive = shade === formShade;
                      return (
                        <button
                          key={shade}
                          type="button"
                          onClick={() => setFormShade(shade)}
                          className={cn(
                            'h-7 w-7 rounded-full transition-all duration-200 focus:outline-none shrink-0',
                            isActive
                              ? 'scale-110 ring-2 ring-ink ring-offset-2 ring-offset-surface shadow-sm'
                              : 'hover:scale-105 border border-ink/10',
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

              {/* Actions */}
              <div className="mt-5 flex items-center justify-between">
                {initialData ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="flex items-center gap-1.5 text-[13px] font-medium text-rausch hover:text-rausch-hover transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                ) : (
                  <p className="text-[11px] text-muted/50">
                    Only last 4 digits stored.
                  </p>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full px-4 py-2 text-[13px] font-medium text-muted hover:text-ink transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={!formLabel.trim() || formLast4.length !== 4}
                    className="rounded-full bg-rausch px-5 py-2 text-[13px] font-semibold text-white transition-opacity hover:bg-rausch-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
