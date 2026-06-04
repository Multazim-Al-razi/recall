import { useState, useEffect, useRef, useMemo, type FormEvent } from "react";
import { format } from "date-fns";
import { useAccountStore } from "@/stores/account";
import { useSubscriptionActions } from "@/hooks/useApiSync";
import {
  CATEGORY_CONFIG,
  type Subscription,
  type Category,
  type BillingCycle,
  type CancellationDifficulty,
} from "@/types/subscription";
import { usePaymentMethodStore } from "@/stores/paymentMethod";
import { CARD_BRAND_LABELS } from "@/types/paymentMethod";
import { findProviders, type Provider } from "@/lib/providers";
import { ProviderIcon } from "@/components/ui/ProviderIcon";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import {
  validateSubscriptionForm,
  type FormErrors,
  type SubscriptionFormDraft,
} from "@/lib/subscriptionValidation";
import { parseDecimal } from "@/lib/date";

interface Props {
  subscription?: Subscription | null;
  onClose: () => void;
  /** Element that triggered the modal — focus returns here on close (#24). */
  triggerRef?: React.RefObject<HTMLElement | null>;
}

const CYCLES: BillingCycle[] = ["monthly", "yearly", "weekly", "custom"];

const inputClass =
  "mt-1 w-full rounded-sm border border-ink/10 bg-canvas px-3.5 py-2.5 text-sm focus:border-rausch focus:outline-none";
const inputErrorClass =
  "mt-1 w-full rounded-sm border border-rausch/60 bg-canvas px-3.5 py-2.5 text-sm focus:border-rausch focus:outline-none";
const labelClass = "block text-xs font-medium text-ink/70";
const errorClass = "mt-1 text-[11px] text-rausch";

export function SubscriptionFormModal({
  subscription,
  onClose,
  triggerRef,
}: Props) {
  const { addSubscription, updateSubscription } = useSubscriptionActions();
  const cur = useAccountStore((s) => s.profile.currency);
  const isEdit = Boolean(subscription);
  const dialogRef = useRef<HTMLDivElement>(null);

  // 4.1: hand the focus trap off to the shared hook. RAF-deferred focus on
  // mount avoids the focus-on-unmount flicker the audit called out (#2.5).
  useFocusTrap(dialogRef);

  const [name, setName] = useState(subscription?.name ?? "");
  const [amount, setAmount] = useState(subscription?.amount?.toString() ?? "");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(
    subscription?.billingCycle ?? "monthly",
  );
  const [customCycleDays, setCustomCycleDays] = useState(
    subscription?.customCycleDays?.toString() ?? "30",
  );
  const [category, setCategory] = useState<Category>(
    subscription?.category ?? "entertainment",
  );
  const [startDate, setStartDate] = useState(
    subscription?.startDate ?? format(new Date(), "yyyy-MM-dd"),
  );
  const [nextRenewalDate, setNextRenewalDate] = useState(
    subscription?.nextRenewalDate ?? format(new Date(), "yyyy-MM-dd"),
  );
  const [isFreeTrial, setIsFreeTrial] = useState(
    subscription?.isFreeTrial ?? false,
  );
  const [notes, setNotes] = useState(subscription?.notes ?? "");
  const [paymentMethodId, setPaymentMethodId] = useState(subscription?.paymentMethodId ?? "");
  const [cancellationDifficulty, setCancellationDifficulty] = useState<CancellationDifficulty>(
    subscription?.cancellationDifficulty ?? "easy",
  );
  const [autoRenews, setAutoRenews] = useState(subscription?.autoRenews ?? true);
  const [errors, setErrors] = useState<FormErrors>({});

  const paymentMethods = usePaymentMethodStore((s) => s.paymentMethods);

  // 9.1: submit debouncing — disable the submit button while a save is in
  // flight (the underlying store action returns synchronously, but the
  // network call is best-effort and we don't want double-clicks to fire
  // two POSTs).
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Provider autocomplete state (#4)
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );
  const autocompleteRef = useRef<HTMLDivElement>(null);

  const providerMatches = useMemo(() => {
    if (!name.trim() || selectedProvider) return [];
    return findProviders(name);
  }, [name, selectedProvider]);

  // Close on Escape (still needed even though the focus trap handles Tab —
  // Escape is the WAI-ARIA dialog pattern for closing a modal).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Return focus to trigger on close (#24)
  useEffect(() => {
    const trigger = triggerRef?.current;
    return () => {
      trigger?.focus();
    };
  }, [triggerRef]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(e.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selectProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setName(provider.name);
    setCategory(provider.category);
    setAmount(provider.typicalAmount.toString());
    setBillingCycle(provider.billingCycle);
    setShowAutocomplete(false);
  };

  // 9.2: validation lives in `lib/subscriptionValidation.ts` so it can be
  // unit-tested without rendering React. The form keeps a thin wrapper
  // here that runs the validator and mirrors results into local state.
  const validate = (): boolean => {
    const draft: SubscriptionFormDraft = {
      name,
      amount,
      billingCycle,
      customCycleDays,
      category,
      startDate,
      nextRenewalDate,
      isFreeTrial,
      notes,
    };
    const newErrors = validateSubscriptionForm(draft);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const data = {
        name: name.trim(),
        amount: parseDecimal(amount) || 0,
        billingCycle,
        customCycleDays:
          billingCycle === "custom"
            ? parseInt(customCycleDays, 10) || 30
            : undefined,
        category,
        startDate,
        nextRenewalDate,
        isFreeTrial,
        trialEndDate: isFreeTrial ? nextRenewalDate : undefined,
        notes: notes.trim() || undefined,
        providerIcon: selectedProvider?.icon || subscription?.providerIcon,
        paymentMethodId: paymentMethodId || undefined,
        cancellationDifficulty,
        autoRenews,
      };
      if (isEdit && subscription) {
        await updateSubscription(subscription.id, data);
      } else {
        await addSubscription({
          currency: cur,
          reminderDaysBefore: 3,
          autoReminder: true,
          status: "active",
          ...data,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4.4: explicit `id`/`htmlFor` pairs for every field. This lets the
  // e2e suite (and screen readers) target labels without depending on the
  // label-wraps-input pattern alone.
  const fieldIds = {
    name: "sub-form-name",
    amount: "sub-form-amount",
    billingCycle: "sub-form-cycle",
    customCycleDays: "sub-form-custom-days",
    category: "sub-form-category",
    startDate: "sub-form-start",
    nextRenewalDate: "sub-form-renewal",
    notes: "sub-form-notes",
  } as const;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/30 p-4"
      onClick={onClose}
      role="presentation"
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sub-form-title"
        aria-describedby="sub-form-errors"
        className="max-h-[90vh] w-full max-w-[440px] overflow-y-auto rounded-xl bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:p-7"
      >
        <h2 id="sub-form-title" className="mb-5 text-xl font-semibold">
          {isEdit ? "Edit" : "Add"} subscription
        </h2>

        <div
          id="sub-form-errors"
          aria-live="polite"
          className="sr-only"
        >
          {Object.values(errors).filter(Boolean).join(". ")}
        </div>

        <div className="space-y-4">
          {/* Name with autocomplete (#4) */}
          <div className="relative" ref={autocompleteRef}>
            <label className="block" htmlFor={fieldIds.name}>
              <span className={labelClass}>Name</span>
              <div className="relative">
                <input
                  id={fieldIds.name}
                  className={errors.name ? inputErrorClass : inputClass}
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSelectedProvider(null);
                    setShowAutocomplete(true);
                    if (errors.name)
                      setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  onFocus={() => setShowAutocomplete(true)}
                  required
                  maxLength={100}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={
                    errors.name ? `${fieldIds.name}-error` : undefined
                  }
                />
                {!selectedProvider &&
                  providerMatches.length > 0 &&
                  showAutocomplete && (
                    <div className="absolute left-0 top-full z-10 mt-1 w-full overflow-hidden rounded-lg border border-ink/10 bg-surface p-1 shadow-lg">
                      {providerMatches.map((p) => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => selectProvider(p)}
                          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-canvas"
                        >
                          <ProviderIcon
                            icon={p.icon}
                            name={p.name}
                            size={20}
                            className="shrink-0"
                          />
                          <span className="flex-1 font-medium">{p.name}</span>
                          <span className="text-xs text-muted">
                            ${p.typicalAmount}/
                            {p.billingCycle === "monthly" ? "mo" : "yr"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
              </div>
              {errors.name && (
                <p id={`${fieldIds.name}-error`} className={errorClass}>
                  {errors.name}
                </p>
              )}
            </label>
          </div>

          <div className="flex gap-3">
            <label className="block flex-1" htmlFor={fieldIds.amount}>
              <span className={labelClass}>Amount</span>
              {/* 9.3: `text` + `inputMode="decimal"` so users in `de-DE`,
                  `fr-FR`, etc. can type `,` as their locale's decimal
                  separator. We still parse with `parseDecimal` below. */}
              <input
                id={fieldIds.amount}
                className={errors.amount ? inputErrorClass : inputClass}
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount)
                    setErrors((prev) => ({ ...prev, amount: undefined }));
                }}
                required
                aria-invalid={errors.amount ? true : undefined}
                aria-describedby={
                  errors.amount ? `${fieldIds.amount}-error` : undefined
                }
              />
              {errors.amount && (
                <p id={`${fieldIds.amount}-error`} className={errorClass}>
                  {errors.amount}
                </p>
              )}
            </label>
            <label className="block flex-1" htmlFor={fieldIds.billingCycle}>
              <span className={labelClass}>Billing cycle</span>
              <select
                id={fieldIds.billingCycle}
                className={inputClass}
                value={billingCycle}
                onChange={(e) =>
                  setBillingCycle(e.target.value as BillingCycle)
                }
              >
                {CYCLES.map((c) => (
                  <option key={c} value={c}>
                    {c[0].toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {billingCycle === "custom" && (
            <label className="block" htmlFor={fieldIds.customCycleDays}>
              <span className={labelClass}>Custom cycle length (days)</span>
              <input
                id={fieldIds.customCycleDays}
                className={
                  errors.customCycleDays ? inputErrorClass : inputClass
                }
                type="text"
                inputMode="numeric"
                value={customCycleDays}
                onChange={(e) => {
                  setCustomCycleDays(e.target.value);
                  if (errors.customCycleDays)
                    setErrors((prev) => ({
                      ...prev,
                      customCycleDays: undefined,
                    }));
                }}
                required
                aria-invalid={errors.customCycleDays ? true : undefined}
                aria-describedby={
                  errors.customCycleDays
                    ? `${fieldIds.customCycleDays}-error`
                    : undefined
                }
              />
              {errors.customCycleDays && (
                <p
                  id={`${fieldIds.customCycleDays}-error`}
                  className={errorClass}
                >
                  {errors.customCycleDays}
                </p>
              )}
            </label>
          )}

          <div className="flex gap-3">
            <label className="block flex-1" htmlFor={fieldIds.category}>
              <span className={labelClass}>Category</span>
              <select
                id={fieldIds.category}
                className={inputClass}
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {(Object.keys(CATEGORY_CONFIG) as Category[]).map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_CONFIG[c].label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block flex-1" htmlFor={fieldIds.nextRenewalDate}>
              <span className={labelClass}>Next renewal</span>
              <input
                id={fieldIds.nextRenewalDate}
                className={
                  errors.nextRenewalDate ? inputErrorClass : inputClass
                }
                type="date"
                value={nextRenewalDate}
                onChange={(e) => {
                  setNextRenewalDate(e.target.value);
                  if (errors.nextRenewalDate)
                    setErrors((prev) => ({
                      ...prev,
                      nextRenewalDate: undefined,
                    }));
                }}
                required
                aria-invalid={errors.nextRenewalDate ? true : undefined}
                aria-describedby={
                  errors.nextRenewalDate
                    ? `${fieldIds.nextRenewalDate}-error`
                    : undefined
                }
              />
              {errors.nextRenewalDate && (
                <p
                  id={`${fieldIds.nextRenewalDate}-error`}
                  className={errorClass}
                >
                  {errors.nextRenewalDate}
                </p>
              )}
            </label>
          </div>

          {/* Start date field (#9) */}
          <label className="block" htmlFor={fieldIds.startDate}>
            <span className={labelClass}>Start date</span>
            <input
              id={fieldIds.startDate}
              className={inputClass}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isFreeTrial}
              onChange={(e) => setIsFreeTrial(e.target.checked)}
            />
            This is a free trial
          </label>

          {/* Notes */}
          <label className="block" htmlFor={fieldIds.notes}>
            <span className={labelClass}>Notes (optional)</span>
            <textarea
              id={fieldIds.notes}
              className={inputClass + " resize-none"}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this subscription..."
              maxLength={500}
            />
          </label>

          {/* Payment method */}
          <div className="flex gap-3">
            <label className="block flex-1">
              <span className={labelClass}>Payment method</span>
              <select
                className={inputClass}
                value={paymentMethodId}
                onChange={(e) => setPaymentMethodId(e.target.value)}
              >
                <option value="">— None —</option>
                {paymentMethods.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {CARD_BRAND_LABELS[pm.brand]} ···· {pm.last4} ({pm.label})
                  </option>
                ))}
              </select>
            </label>
            <label className="block flex-1">
              <span className={labelClass}>Cancel difficulty</span>
              <select
                className={inputClass}
                value={cancellationDifficulty}
                onChange={(e) => setCancellationDifficulty(e.target.value as CancellationDifficulty)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={autoRenews}
              onChange={(e) => setAutoRenews(e.target.checked)}
            />
            Auto-renews at end of cycle
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 text-sm font-medium text-muted hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-rausch px-6 py-2.5 text-sm font-semibold text-white hover:bg-rausch-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? isEdit
                ? "Saving…"
                : "Adding…"
              : isEdit
                ? "Save"
                : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
