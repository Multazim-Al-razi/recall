import { test, expect } from '@playwright/test';
import { COPY } from '../frontend/src/lib/copyContract';

test.describe('Home page', () => {
  test('loads the hero section with the contract headline and CTA buttons', async ({
    page,
  }) => {
    await page.goto('/');

    // Resilient presence check: the h1 must be visible and must contain at
    // least one of the topic words. Marketing can rename the headline later;
    // as long as the page is recognisably about forgotten subscriptions, the
    // check passes.
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText(/pay|forgot|subscription|recall/i);

    // Exact-pin test: the pinned headline from the copy contract must
    // appear verbatim. This is the only place the contract is exercised
    // end-to-end; if the page renders it, we know Home.tsx is still
    // importing from the contract.
    await expect(h1).toContainText(COPY.homeHeroHeadline);

    // Hero CTAs are pinned by the contract, so the spec reads from there.
    const getStartedLink = page.getByRole('link', { name: COPY.homePrimaryCta });
    await expect(getStartedLink).toBeVisible();
    await expect(getStartedLink).toHaveAttribute('href', '/onboarding');

    const supportLink = page.getByRole('link', { name: COPY.homeSecondaryCta });
    await expect(supportLink).toBeVisible();
    await expect(supportLink).toHaveAttribute('href', '/pricing');
  });

  test('displays feature sections', async ({ page }) => {
    await page.goto('/');
    for (const feature of COPY.homeFeatures) {
      await expect(page.getByText(feature)).toBeVisible();
    }
  });

  test('bottom CTA links to onboarding', async ({ page }) => {
    await page.goto('/');
    const bottomCta = page.getByRole('link', { name: COPY.homeBottomCta }).last();
    await expect(bottomCta).toBeVisible();
    await expect(bottomCta).toHaveAttribute('href', '/onboarding');
  });

  test('navigates to the pricing page via the secondary CTA', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: COPY.homeSecondaryCta }).click();
    await expect(page).toHaveURL('/pricing');
  });
});
