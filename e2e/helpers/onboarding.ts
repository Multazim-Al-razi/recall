import type { Page } from '@playwright/test';
import { seedAccount, seedAccountWithSubs, seedSubscriptions } from '../fixtures/seed';

/**
 * Onboard the user via localStorage so a test can land on the dashboard
 * without running the multi-step UI onboarding. Equivalent to a fresh
 * account with USD currency and 3 days reminder lead.
 */
export async function completeOnboarding(page: Page) {
  await seedAccount(page, { onboarded: true });
}

/** Same as `completeOnboarding` but also clears all subscriptions. */
export async function completeOnboardingEmpty(page: Page) {
  await seedAccountWithSubs(page, [], { onboarded: true });
}

/** Onboard + seed the standard subscription list. */
export async function completeOnboardingWithSubs(
  page: Page,
  subs: Parameters<typeof seedSubscriptions>[1] = [],
) {
  await seedAccountWithSubs(page, subs);
}
