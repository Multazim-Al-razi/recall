import { test, expect } from '@playwright/test';

test.describe('Onboarding flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear persisted zustand state so onboarding starts fresh
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('completes the full onboarding flow end-to-end', async ({ page }) => {
    await page.goto('/onboarding');

    // Step 0 — Welcome
    await expect(page.getByText('Welcome to')).toBeVisible();
    await expect(page.getByText('Recall')).toBeVisible();
    const getStartedBtn = page.getByRole('button', { name: 'Get started' });
    await expect(getStartedBtn).toBeVisible();
    await getStartedBtn.click();

    // Step 1 — Profile
    await expect(page.getByText('Tell us about you')).toBeVisible();
    await page.getByPlaceholder('Ada Lovelace').fill('Test User');
    await page.getByPlaceholder('ada@example.com').fill('test@example.com');
    await page.getByLabel('Preferred currency').selectOption('EUR');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2 — Plan selection
    await expect(page.getByText('Pick a plan')).toBeVisible();
    // Free plan should be selected by default
    await page.getByRole('button', { name: 'Enter Recall' }).click();

    // Should navigate to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('can skip plan selection', async ({ page }) => {
    await page.goto('/onboarding');
    await page.getByRole('button', { name: 'Get started' }).click();

    // Fill profile
    await page.getByPlaceholder('Ada Lovelace').fill('Skipper');
    await page.getByRole('button', { name: 'Continue' }).click();

    // Skip plan selection
    await page.getByRole('button', { name: 'Skip for now' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('redirects to onboarding when accessing dashboard without onboarding', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/onboarding');
  });

  test('redirects to onboarding when accessing dashboard subscriptions without onboarding', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');
    await expect(page).toHaveURL('/onboarding');
  });
});
