import type { Page } from '@playwright/test';
import { seedAccount } from '../fixtures/seed';

/** Sign the user out by clicking the sidebar sign-out button. */
export async function signOut(page: Page) {
  await page.getByRole('button', { name: /Sign out/i }).click();
}

/** Open a fresh page already signed in. */
export async function newOnboardedPage(browser: import('@playwright/test').Browser, opts: Parameters<typeof seedAccount>[1] = {}) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await seedAccount(page, { onboarded: true, ...opts });
  return { page, ctx };
}
