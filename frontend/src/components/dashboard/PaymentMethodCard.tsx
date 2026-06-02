import { Link } from 'react-router';
import { ChevronDown, Share2, Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useSubscriptionStore, getMonthlySpend } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { formatMoney } from '@/lib/format';

/**
 * Linked-card panel — the payment method that auto-debits the user's
 * subscriptions. Mirrors the reference's VISA card composition (brand row,
 * masked number, dual action buttons, fee footer) using Recall data.
 */
export function PaymentMethodCard() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const profile = useAccountStore((s) => s.profile);
  const cur = profile.currency;

  const autoDebit = useMemo(
    () => getMonthlySpend(subscriptions),
    [subscriptions],
  );

  return (
    <div className="flex h-full gap-3">
      {/* Rail of quick actions, like the reference's far-left + / share */}
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

      <div className="card-premium flex flex-1 flex-col justify-between gap-5 p-5">
        {/* Brand + cycle */}
        <div className="flex items-start justify-between">
          <span className="font-display text-[19px] font-semibold italic tracking-tight text-ink">
            VISA
          </span>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-[11px] font-semibold text-ink-soft transition-colors hover:text-ink"
          >
            Direct Debits
            <ChevronDown size={13} />
          </button>
        </div>

        {/* Masked number */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[1.8px] text-muted">
            Linked to subscriptions
          </div>
          <div className="mt-1.5 font-display text-[22px] font-light tracking-[2px] tabular-nums text-ink">
            ···· ···· ···· 2719
          </div>
        </div>

        {/* Dual action */}
        <div className="flex gap-2">
          <Link
            to="/dashboard/subscriptions"
            className="flex-1 rounded-full bg-ink py-2.5 text-center text-[13px] font-semibold text-surface transition-opacity hover:opacity-90"
          >
            Manage
          </Link>
          <Link
            to="/dashboard/analytics"
            className="flex-1 rounded-full bg-canvas py-2.5 text-center text-[13px] font-semibold text-ink transition-colors hover:text-rausch"
          >
            Review
          </Link>
        </div>

        {/* Fee footer */}
        <div className="flex items-end justify-between border-t border-[var(--color-hairline)] pt-4">
          <div>
            <div className="text-[11px] text-muted">Monthly auto-debit</div>
            <div className="font-display text-[20px] font-light tabular-nums">
              {formatMoney(autoDebit, cur)}
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
      </div>
    </div>
  );
}
