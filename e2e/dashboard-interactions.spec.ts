import { test, expect } from '@playwright/test';
import { COPY } from './fixtures/copy';
import { completeOnboarding } from './helpers/onboarding';
import { seedAccountWithSubs, type SeedSubscriptionOverrides } from './fixtures/seed';

test.describe('Dashboard interactions', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test('dashboard shows the four KPI tiles by their contract labels', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(COPY.dashboardKpiMonthlyBurn)).toBeVisible();
    await expect(page.getByText(COPY.dashboardKpiYearlyProjection)).toBeVisible();
    await expect(page.getByText(COPY.dashboardKpiTrialsExpiring)).toBeVisible();
    await expect(page.getByText(COPY.dashboardKpiPotentialSavings)).toBeVisible();
  });

  test('dashboard greeting shows the user first name', async ({ page }) => {
    await page.goto('/dashboard');
    // The dashboard h1 reads "Hi {firstName}, here's your money map."
    await expect(page.getByRole('heading', { name: /Hi Test User/i })).toBeVisible();
  });

  test('dashboard shows the renewal timeline section', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/Renewal timeline/i)).toBeVisible();
  });

  test('dashboard shows the donut chart with the spending-breakdown aria-label', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    // The donut chart exposes a chart with an accessible name containing
    // "Spending breakdown" (added by the a11y hardening).
    await expect(
      page.locator('svg[aria-label*="Spending breakdown" i]'),
    ).toBeVisible();
  });

  test('dashboard shows the top subscriptions section', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/Top subscriptions/i)).toBeVisible();
  });

  test('dashboard shows the savings opportunity section', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/Savings opportunity/i)).toBeVisible();
  });

  test('add subscription CTA navigates to subscriptions page', async ({ page }) => {
    await page.goto('/dashboard');
    const addBtn = page.getByRole('link', { name: /Add subscription/i });
    await expect(addBtn).toBeVisible();
    await addBtn.click();
    await expect(page).toHaveURL('/dashboard/subscriptions');
  });

  test('view-all link navigates to subscriptions page', async ({ page }) => {
    await page.goto('/dashboard');
    const viewAll = page.getByRole('link', { name: /View all/i });
    await expect(viewAll).toBeVisible();
    await viewAll.click();
    await expect(page).toHaveURL('/dashboard/subscriptions');
  });

  test('open-analytics link navigates to analytics page', async ({ page }) => {
    await page.goto('/dashboard');
    const analyticsLink = page.getByRole('link', { name: /Open analytics/i });
    await expect(analyticsLink).toBeVisible();
    await analyticsLink.click();
    await expect(page).toHaveURL('/dashboard/analytics');
  });

  test('alert banner can be dismissed after seeding a soon-renewing subscription', async ({
    page,
  }) => {
    // Seed a single sub renewing tomorrow so the banner has something to show.
    const soon: SeedSubscriptionOverrides[] = [
      { name: 'Soon Renewing', amount: 9.99, renewalInDays: 1 },
    ];
    await seedAccountWithSubs(page, soon);

    await page.goto('/dashboard');

    const banner = page.locator('[role="alert"]').first();
    // The banner should appear with at least one soon-renewing subscription
    await expect(banner).toBeVisible({ timeout: 5000 });
    await expect(banner).toContainText(/Soon Renewing/i);

    // Dismiss
    await page.getByRole('button', { name: /Dismiss/i }).first().click();
    await expect(banner).toBeHidden();
  });

  test('sign out resets account and redirects to home', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('button', { name: /Sign out/i }).click();

    await expect(page).toHaveURL('/');

    // Accessing dashboard should redirect to onboarding
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/onboarding');
  });
});
