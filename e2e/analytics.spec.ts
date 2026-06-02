import { test, expect } from '@playwright/test';

async function completeOnboarding(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    const accountState = {
      state: {
        onboarded: true,
        profile: { name: 'Test User', email: 'test@example.com', currency: 'USD', reminderLeadDays: 3 },
      },
      version: 0,
    };
    localStorage.setItem('recall-account', JSON.stringify(accountState));
  });
}

test.describe('Analytics page', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test('loads and displays the page heading', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await expect(page.getByText('Spending analytics')).toBeVisible();
  });

  test('displays summary stat cards', async ({ page }) => {
    await page.goto('/dashboard/analytics');

    // Three stat cards: This month, Yearly projection, Potential savings
    await expect(page.getByText('This month')).toBeVisible();
    await expect(page.getByText('Yearly projection')).toBeVisible();
    await expect(page.getByText('Potential savings')).toBeVisible();
  });

  test('displays top spenders section', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await expect(page.getByText('Top spenders')).toBeVisible();

    // Seed data includes Netflix, Spotify etc.
    await expect(page.getByText('Netflix')).toBeVisible();
  });

  test('displays category breakdown section', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await expect(page.getByText('By category')).toBeVisible();

    // Entertainment category should be present
    await expect(page.getByText('Entertainment')).toBeVisible();
  });

  test('displays recommendation section', async ({ page }) => {
    await page.goto('/dashboard/analytics');
    await expect(page.getByText('Recommendation')).toBeVisible();
  });

  test('top spenders link scrolls to details', async ({ page }) => {
    await page.goto('/dashboard/analytics');

    const detailsLink = page.getByText('See details');
    await expect(detailsLink).toBeVisible();
    await detailsLink.click();
    // The anchor should navigate within the page
  });

  test('add subscription button links to subscriptions page', async ({ page }) => {
    await page.goto('/dashboard/analytics');

    const addBtn = page.getByRole('link', { name: /Add new subscription/i });
    await expect(addBtn).toBeVisible();
    await expect(addBtn).toHaveAttribute('href', '/dashboard/subscriptions');
  });
});