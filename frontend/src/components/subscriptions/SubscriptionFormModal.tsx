import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link } from 'react-router';
import { format } from 'date-fns';
import { Lock } from 'lucide-react';
import { useSubscriptionStore } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import {
  CATEGORY_CONFIG,
  type Subscription,
  type Category,
  type BillingCycle,
} from '@/types/subscription';

interface Props {
  subscription?: Subscription | null;
  /** When true, the user is at their plan's subscription limit (add mode). */
  atLimit?: boolean;
  planName?: string;
  onClose: () => void;
}

const CYCLES: BillingCycle[] = ['monthly', 'yearly', 'weekly', 'custom'];

const inputClass =
  'mt-1 w-full rounded-sm border border-ink/10 bg-canvas px-3.5 py-2.5 text-sm focus:border-rausch focus:outline-none';
const labelClass = 'block text-xs font-medium text-ink/70';

export function SubscriptionFormModal({ subscription, atLimit = false, planName = 'Free', onClose }: Props) {
  const addSubscription = useSubscriptionStore((s) => s.addSubscription);
  const updateSubscription = useSubscriptionStore((s) => s.updateSubscription);
  const cur = useAccountStore((s) => s.profile.currency);
  const isEdit = Boolean(subscription);
  const dialogRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState(subscription?.name ?? '');
  const [amount, setAmount] = useState(subscription?.amount?.toString() ?? '');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(subscription?.billingCycle ?? 'monthly');
  const [customCycleDays, setCustomCycleDays] = useState(subscription?.customCycleDays?.toString() ?? '30');
  const [category, setCategory] = useState<Category>(subscription?.category ?? 'entertainment');
  const [nextRenewalDate, setNextRenewalDate] = useState(
    subscription?.nextRenewalDate ?? format(new Date(), 'yyyy-MM-dd')
  );
  const [isFreeTrial, setIsFreeTrial] = useState(subscription?.isFreeTrial ?? false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Focus trap — keep Tab inside the dialog
  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    const focusable = () =>
      node.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    const first = focusable()[0];
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const items = focusable();
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    }

    node.addEventListener('keydown', onKeyDown);
    return () => node.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = {
      name: name.trim(),
      amount: parseFloat(amount) || 0,
      billingCycle,
      customCycleDays: billingCycle === 'custom' ? parseInt(customCycleDays, 10) || 30 : undefined,
      category,
      nextRenewalDate,
      isFreeTrial,
      trialEndDate: isFreeTrial ? nextRenewalDate : undefined,
    };
    if (isEdit && subscription) {
      updateSubscription(subscription.id, data);
    } else {
      addSubscription({
        currency: cur,
        startDate: format(new Date(), 'yyyy-MM-dd'),
        reminderDaysBefore: 3,
        autoReminder: true,
        status: 'active',
        ...data,
      });
    }
    onClose();
  };

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/30 p-4"
      onClick={onClose}
      role="presentation"
    >
      {atLimit ? (
        <div
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Plan limit reached"
          className="w-full max-w-[400px] rounded-xl bg-surface p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)]"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rausch/10 text-rausch">
            <Lock size={22} />
          </div>
          <h2 className="text-xl font-semibold">You've reached your limit</h2>
          <p className="mt-2 text-[14px] leading-[1.55] text-muted">
            The {planName} plan can't track any more active subscriptions. Upgrade
            once to unlock more room — it's a one-time purchase.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-sm font-medium text-muted hover:text-ink"
            >
              Not now
            </button>
            <Link
              to="/dashboard/upgrade"
              onClick={onClose}
              className="rounded-full bg-rausch px-6 py-2.5 text-sm font-semibold text-white hover:bg-rausch-hover"
            >
              View plans
            </Link>
          </div>
        </div>
      ) : (
        <form
          onClick={(e) => e.stopPropagation()}
          onSubmit={handleSubmit}
          role="dialog"
          aria-modal="true"
          aria-label={`${isEdit ? 'Edit' : 'Add'} subscription`}
          className="max-h-[90vh] w-full max-w-[440px] overflow-y-auto rounded-xl bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:p-7"
        >
        <h2 className="mb-5 text-xl font-semibold">
          {isEdit ? 'Edit' : 'Add'} subscription
        </h2>

        <div className="space-y-4">
          <label className="block">
            <span className={labelClass}>Name</span>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </label>

          <div className="flex gap-3">
            <label className="block flex-1">
              <span className={labelClass}>Amount</span>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </label>
            <label className="block flex-1">
              <span className={labelClass}>Billing cycle</span>
              <select
                className={inputClass}
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
              >
                {CYCLES.map((c) => (
                  <option key={c} value={c}>
                    {c[0].toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {billingCycle === 'custom' && (
            <label className="block">
              <span className={labelClass}>Custom cycle length (days)</span>
              <input
                className={inputClass}
                type="number"
                min="1"
                step="1"
                value={customCycleDays}
                onChange={(e) => setCustomCycleDays(e.target.value)}
                required
              />
            </label>
          )}

          <div className="flex gap-3">
            <label className="block flex-1">
              <span className={labelClass}>Category</span>
              <select
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
            <label className="block flex-1">
              <span className={labelClass}>Next renewal</span>
              <input
                className={inputClass}
                type="date"
                value={nextRenewalDate}
                onChange={(e) => setNextRenewalDate(e.target.value)}
                required
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isFreeTrial}
              onChange={(e) => setIsFreeTrial(e.target.checked)}
            />
            This is a free trial
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
            className="rounded-full bg-rausch px-6 py-2.5 text-sm font-semibold text-white hover:bg-rausch-hover"
          >
            {isEdit ? 'Save' : 'Add'}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
