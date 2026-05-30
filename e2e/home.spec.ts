import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads the hero section with headline and CTA buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Stop paying for things you forgot to cancel');

    // Two CTA links in the hero
    const getStartedLink = page.getByRole('link', { name: 'Get started free' });
    await expect(getStartedLink).toBeVisible();
    await expect(getStartedLink).toHaveAttribute('href', '/onboarding');

    const pricingLink = page.getByRole('link', { name: 'See pricing' });
    await expect(pricingLink).toBeVisible();
    await expect(pricingLink).toHaveAttribute('href', '/pricing');
  });

  test('displays feature sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Never miss a renewal')).toBeVisible();
    await expect(page.getByText('See where money goes')).toBeVisible();
    await expect(page.getByText('Yours, and only yours')).toBeVisible();
  });

  test('bottom CTA links to onboarding', async ({ page }) => {
    await page.goto('/');
    const bottomCta = page.getByRole('link', { name: 'Get started' }).last();
    await expect(bottomCta).toBeVisible();
    await expect(bottomCta).toHaveAttribute('href', '/onboarding');
  });

  test('navigates to pricing page via header link', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Pricing' }).click();
    await expect(page).toHaveURL('/pricing');
  });
});