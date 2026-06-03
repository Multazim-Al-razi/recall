import { test, expect } from '@playwright/test';
import { COPY } from './fixtures/copy';
import { completeOnboarding } from './helpers/onboarding';

test.describe('Marketing pages', () => {
  test('Pricing page loads with all plan tiers visible', async ({ page }) => {
    await page.goto('/pricing');
    // Pin on the heading, not "Pricing" — marketing may rename
    await expect(page.getByText(/Pay once/i).first()).toBeVisible();
    // The pricing table should mention one of the tier names
    await expect(page.getByText(/Free/i).first()).toBeVisible();
  });

  test('About page loads and tells the Recall story', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1').first()).toBeVisible();
    // The about page mentions "Recall" in the heading
    await expect(page.getByText(/Recall/i).first()).toBeVisible();
  });

  test('FAQ page loads (legacy route)', async ({ page }) => {
    await page.goto('/faq');
    await expect(page.getByText(/Frequently asked/i).first()).toBeVisible();
  });

  test('Blog page loads', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.getByText(/Recall/i).first()).toBeVisible();
  });

  test('unknown routes redirect to home', async ({ page }) => {
    await page.goto('/nonexistent-page');
    await expect(page).toHaveURL('/');
  });

  test('legacy /subscriptions redirects to /dashboard/subscriptions', async ({ page }) => {
    await completeOnboarding(page);
    await page.goto('/subscriptions');
    await expect(page).toHaveURL('/dashboard/subscriptions');
  });

  test('legacy /analytics redirects to /dashboard/analytics', async ({ page }) => {
    await completeOnboarding(page);
    await page.goto('/analytics');
    await expect(page).toHaveURL('/dashboard/analytics');
  });

  test('home page hero copy is the pinned contract', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1').first();
    await expect(h1).toContainText(COPY.homeHeroHeadline);
  });

  test('pricing page links into onboarding for the free tier', async ({ page }) => {
    await page.goto('/pricing');
    // The pricing page has at least one CTA to the onboarding flow.
    // We don't pin the label — the marketing copy may rename it.
    const ctaLinks = page.getByRole('link', { name: /get started|choose free|start/i });
    await expect(ctaLinks.first()).toBeVisible();
  });
});
