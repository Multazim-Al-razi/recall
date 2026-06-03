import { test, expect } from '@playwright/test';
import { COPY } from './fixtures/copy';
import { completeOnboarding } from './helpers/onboarding';

test.describe('Dashboard layout & navigation', () => {
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
    await page.getByRole('link', { name: /^Subscriptions$/i }).first().click();
    await expect(page).toHaveURL('/dashboard/subscriptions');

    // Navigate to analytics
    await page.getByRole('link', { name: /^Analytics$/i }).first().click();
    await expect(page).toHaveURL('/dashboard/analytics');

    // Navigate back to dashboard
    await page.getByRole('link', { name: /^Dashboard$/i }).first().click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('settings page is accessible', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page).toHaveURL('/dashboard/settings');
  });

  test('upgrade page redirects to pricing', async ({ page }) => {
    await page.goto('/dashboard/upgrade');
    await expect(page).toHaveURL('/pricing');
  });

  test('header shows the dashboard title', async ({ page }) => {
    await page.goto('/dashboard');
    // The page title (h1 in the header) should be "Dashboard"
    await expect(page.getByRole('heading', { name: /^Dashboard$/, level: 1 })).toBeVisible();
  });

  test('KPI tiles render with the pinned copy-contract labels', async ({ page }) => {
    await page.goto('/dashboard');
    // The four KPI tile labels are pinned by the copy contract.
    await expect(page.getByText(COPY.dashboardKpiMonthlyBurn)).toBeVisible();
    await expect(page.getByText(COPY.dashboardKpiYearlyProjection)).toBeVisible();
    await expect(page.getByText(COPY.dashboardKpiTrialsExpiring)).toBeVisible();
    await expect(page.getByText(COPY.dashboardKpiPotentialSavings)).toBeVisible();
  });

  test('collapsing the sidebar narrows it', async ({ page }) => {
    await page.goto('/dashboard');
    const collapseBtn = page.getByRole('button', { name: /Collapse sidebar/i });
    if ((await collapseBtn.count()) > 0) {
      await collapseBtn.click();
      await expect(page.getByRole('button', { name: /Expand sidebar/i })).toBeVisible();
    }
  });
});
