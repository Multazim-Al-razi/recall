/**
 * Pure validation for the subscription add/edit form.
 *
 * Extracted from `SubscriptionFormModal` so the rules can be unit-tested
 * without rendering React. The modal keeps a thin wrapper that calls this
 * function and stores the result in local state.
 */
import type { BillingCycle, Category } from "@/types/subscription";
import { parseDecimal } from "@/lib/date";

export interface FormErrors {
  name?: string;
  amount?: string;
  nextRenewalDate?: string;
  customCycleDays?: string;
}

export interface SubscriptionFormDraft {
  name: string;
  amount: string;
  billingCycle: BillingCycle;
  customCycleDays: string;
  category: Category;
  startDate: string;
  nextRenewalDate: string;
  isFreeTrial: boolean;
  notes: string;
}

/**
 * Returns a (possibly empty) `FormErrors` map. Empty map == valid.
 * Pure — never reads or writes component state, never throws.
 */
export function validateSubscriptionForm(
  draft: SubscriptionFormDraft,
): FormErrors {
  const errors: FormErrors = {};

  if (!draft.name.trim()) {
    errors.name = "Name is required";
  }

  const parsedAmount = parseDecimal(draft.amount);
  if (
    !draft.amount.trim() ||
    Number.isNaN(parsedAmount) ||
    parsedAmount < 0
  ) {
    errors.amount = "Enter a valid amount (0 or more)";
  }

  if (!draft.nextRenewalDate) {
    errors.nextRenewalDate = "Renewal date is required";
  }

  if (draft.billingCycle === "custom") {
    const days = parseInt(draft.customCycleDays, 10);
    if (!draft.customCycleDays.trim() || Number.isNaN(days) || days < 1) {
      errors.customCycleDays = "Enter at least 1 day";
    }
  }

  return errors;
}
