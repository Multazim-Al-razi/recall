import { test, expect } from '@playwright/test';

// Helper: complete onboarding via localStorage so tests start in dashboard
async function completeOnboarding(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    // Set zustand persisted account state
    const accountState = {
      state: {
        onboarded: true,
        profile: { name: 'Test User', email: 'test@example.com', currency: 'USD', reminderLeadDays: 3 },
        plan: 'free',
      },
      version: 0,
    };
    localStorage.setItem('recall-account', JSON.stringify(accountState));
  });
}

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test('displays dashboard after onboarding', async ({ page }) => {
    await page.goto('/dashboard');
    // Should not redirect to onboarding
    await expect(page).toHaveURL('/dashboard');
    // Dashboard should have sidebar navigation
    await expect(page.locator('nav, [role="navigation"]').first()).toBeVisible();
  });

  test('sidebar navigation links work', async ({ page }) => {
    await page.goto('/dashboard');

    // Navigate to subscriptions
    await page.getByRole('link', { name: /subscriptions/i }).first().click();
    await expect(page).toHaveURL('/dashboard/subscriptions');

    // Navigate to analytics
    await page.getByRole('link', { name: /analytics/i }).first().click();
    await expect(page).toHaveURL('/dashboard/analytics');

    // Navigate back to dashboard
    await page.getByRole('link', { name: /dashboard/i }).first().click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('settings page is accessible', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page).toHaveURL('/dashboard/settings');
  });

  test('upgrade page is accessible', async ({ page }) => {
    await page.goto('/dashboard/upgrade');
    await expect(page).toHaveURL('/dashboard/upgrade');
  });
});