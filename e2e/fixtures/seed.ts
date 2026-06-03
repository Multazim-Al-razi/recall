import type { Page } from '@playwright/test';
import { addDays, format } from 'date-fns';

export interface SeedAccountOverrides {
  name?: string;
  email?: string;
  currency?: 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CAD' | 'AUD';
  reminderLeadDays?: number;
  theme?: 'system' | 'light' | 'dark';
  onboarded?: boolean;
}

export interface SeedSubscriptionOverrides {
  id?: string;
  name: string;
  amount: number;
  currency?: string;
  billingCycle?: 'monthly' | 'yearly' | 'weekly' | 'custom';
  customCycleDays?: number;
  category?: string;
  startDate?: string;
  /** Days from "now" (in the test environment) until the next renewal. */
  renewalInDays?: number;
  status?: 'active' | 'paused' | 'cancelled';
  isFreeTrial?: boolean;
  providerIcon?: string;
}

/**
 * Write a zustand-persisted account record directly to localStorage so a
 * test can land on the dashboard without running onboarding.
 *
 * The `version` field matches the current persist version of
 * `frontend/src/stores/account.ts`. Bump in lockstep if the store changes.
 */
export async function seedAccount(page: Page, overrides: SeedAccountOverrides = {}) {
  await page.goto('/');
  await page.evaluate((overridesJson: string) => {
    const overrides = JSON.parse(overridesJson) as SeedAccountOverrides;
    const accountState = {
      state: {
        onboarded: overrides.onboarded ?? true,
        profile: {
          name: overrides.name ?? 'Test User',
          email: overrides.email ?? 'test@example.com',
          currency: overrides.currency ?? 'USD',
          reminderLeadDays: overrides.reminderLeadDays ?? 3,
          ...(overrides.theme ? { theme: overrides.theme } : {}),
        },
      },
      version: 0,
    };
    localStorage.setItem('recall-account', JSON.stringify(accountState));
  }, JSON.stringify(overrides));
}

/**
 * Write a zustand-persisted subscription set to localStorage. Pass an empty
 * array to test empty states.
 */
export async function seedSubscriptions(
  page: Page,
  subscriptions: SeedSubscriptionOverrides[] = [],
) {
  await page.goto('/');
  await page.evaluate((subsJson: string) => {
    const subs = JSON.parse(subsJson) as Array<SeedSubscriptionOverrides & {
      renewalInDays: number;
    }>;
    const now = Date.now();
    const normalised = subs.map((s) => ({
      id: s.id ?? `sub_${s.name.toLowerCase().replace(/\s+/g, '_')}`,
      name: s.name,
      amount: s.amount,
      currency: s.currency ?? 'USD',
      billingCycle: s.billingCycle ?? 'monthly',
      customCycleDays: s.customCycleDays,
      category: s.category ?? 'entertainment',
      startDate: s.startDate ?? '2024-01-01',
      nextRenewalDate: format(addDays(new Date(now), s.renewalInDays ?? 30), 'yyyy-MM-dd'),
      reminderDaysBefore: 3,
      autoReminder: true,
      isFreeTrial: s.isFreeTrial ?? false,
      status: s.status ?? 'active',
      providerIcon: s.providerIcon ?? s.name.toLowerCase(),
    }));
    localStorage.setItem(
      'recall-subscriptions',
      JSON.stringify({ state: { subscriptions: normalised }, version: 0 }),
    );
  }, JSON.stringify(subscriptions));
}

/**
 * Seed both the account + subscription set in one call. Most dashboard tests
 * start with this.
 */
export async function seedAccountWithSubs(
  page: Page,
  subscriptions: SeedSubscriptionOverrides[] = [],
  accountOverrides: SeedAccountOverrides = {},
) {
  await seedAccount(page, accountOverrides);
  await seedSubscriptions(page, subscriptions);
}

/**
 * Write a v0/v1-shaped account payload (no `plan`, no `theme`, no `tier`)
 * to localStorage. Used by the migration test to verify the account store
 * migrates an older shape into the current one.
 */
export async function seedLegacyAccountV0(page: Page) {
  await page.goto('/');
  await page.evaluate(() => {
    const legacy = {
      state: {
        onboarded: true,
        profile: {
          name: 'Legacy User',
          email: 'legacy@example.com',
          currency: 'USD',
          reminderLeadDays: 3,
        },
      },
      version: 0,
    };
    localStorage.setItem('recall-account', JSON.stringify(legacy));
  });
}
