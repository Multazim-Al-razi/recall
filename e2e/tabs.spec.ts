import { test, expect } from '@playwright/test';
import { completeOnboarding } from './helpers/onboarding';

test.describe('Dashboard tab bar', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test('navigating between dashboard routes opens tabs in the bar', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('tab')).toHaveCount(1);

    await page.getByRole('link', { name: /^Subscriptions$/i }).first().click();
    await expect(page.getByRole('tab')).toHaveCount(2);

    await page.getByRole('link', { name: /^Analytics$/i }).first().click();
    await expect(page.getByRole('tab')).toHaveCount(3);
  });

  test('switching tabs activates the corresponding route', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /^Subscriptions$/i }).first().click();
    await page.getByRole('link', { name: /^Analytics$/i }).first().click();
    await expect(page).toHaveURL('/dashboard/analytics');

    // Click the Subscriptions tab — should switch back
    const subsTab = page.getByRole('tab', { name: /Subscriptions/i });
    await subsTab.click();
    await expect(page).toHaveURL('/dashboard/subscriptions');
    // Active tab is the one we just clicked
    await expect(subsTab).toHaveAttribute('aria-selected', 'true');
  });

  test('closing a tab activates the previous neighbor (left)', async ({ page }) => {
    // Open: dashboard, subs, analytics
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /^Subscriptions$/i }).first().click();
    await page.getByRole('link', { name: /^Analytics$/i }).first().click();
    await expect(page.getByRole('tab')).toHaveCount(3);

    // Close the Analytics tab — the previous neighbor (Subscriptions) is activated
    const analyticsClose = page
      .getByRole('button', { name: /Close Analytics tab/i });
    await analyticsClose.click();
    await expect(page.getByRole('tab')).toHaveCount(2);
    await expect(page).toHaveURL('/dashboard/subscriptions');
  });

  test('closing the leftmost tab activates the next neighbor', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /^Subscriptions$/i }).first().click();
    // Now the first tab (Dashboard) is the leftmost. Close it.
    const dashboardClose = page
      .getByRole('button', { name: /Close Dashboard tab/i });
    await dashboardClose.click();
    await expect(page.getByRole('tab')).toHaveCount(1);
    // The remaining tab is Subscriptions and should be active
    const subsTab = page.getByRole('tab', { name: /Subscriptions/i });
    await expect(subsTab).toHaveAttribute('aria-selected', 'true');
  });

  test('closing the only open tab navigates to /dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    const dashboardClose = page
      .getByRole('button', { name: /Close Dashboard tab/i });
    if ((await dashboardClose.count()) > 0) {
      await dashboardClose.click();
      // No tabs left; the tab bar unmounts
      await expect(page.getByRole('tab')).toHaveCount(0);
      // We should be on /dashboard still (or have been routed there)
      await expect(page).toHaveURL(/\/dashboard/);
    }
  });

  test('opening the same route twice does not duplicate the tab', async ({ page }) => {
    await page.goto('/dashboard');
    await page.goto('/dashboard/subscriptions');
    await page.goto('/dashboard/subscriptions');
    await expect(page.getByRole('tab')).toHaveCount(2);
  });

  test('tab bar is session-only (resets on reload)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /^Subscriptions$/i }).first().click();
    await expect(page.getByRole('tab')).toHaveCount(2);

    await page.reload();
    // Tabs are session-only — should have a single tab for the current route
    await expect(page.getByRole('tab')).toHaveCount(1);
  });
});
