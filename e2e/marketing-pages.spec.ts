import { test, expect } from '@playwright/test';

test.describe('Marketing pages', () => {
  test('Pricing page loads and shows plan options', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.getByText(/pricing/i).first()).toBeVisible();
    // Should have links to onboarding
    const ctaLinks = page.getByRole('link', { name: /get started/i });
    await expect(ctaLinks.first()).toBeVisible();
  });

  test('About page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText(/about/i).first()).toBeVisible();
  });

  test('Blog page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByText(/blog/i).first()).toBeVisible();
  });

  test('FAQ page loads', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByText(/faq/i).first()).toBeVisible();
  });

  test('unknown routes redirect to home', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await expect(page).toHaveURL('/');
  });

  test('legacy /subscriptions route redirects to /dashboard/subscriptions', async ({ page }) => {
    // First complete onboarding so dashboard access works
    await page.goto('/');
    await page.evaluate(() => {
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
    await page.goto('/subscriptions');
    await expect(page).toHaveURL('/dashboard/subscriptions');
  });

  test('legacy /analytics route redirects to /dashboard/analytics', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
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
    await page.goto('/analytics');
    await expect(page).toHaveURL('/dashboard/analytics');
  });
});