import { test, expect } from '@playwright/test';

test.describe('Onboarding flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
  });

  test('completes the full local onboarding flow end-to-end', async ({ page }) => {
    await page.goto('/onboarding');

    // Step 0 — Consent
    await expect(page.getByText('Ready to take back control')).toBeVisible();
    // ToS checkbox must be checked before Continue is enabled
    const continueBtn = page.getByRole('button', { name: 'Continue' });
    await expect(continueBtn).toBeDisabled();
    await page.getByText('Terms of Service').click();
    // Check the ToS checkbox
    await page.locator('label', { hasText: /Terms of Service/ }).locator('input[type="checkbox"]').check();
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();

    // Step 1 — Setup path
    await expect(page.getByText('Choose your setup')).toBeVisible();
    // Select Local
    await page.getByRole('button', { name: /Local/i }).click();

    // Step 2 — Profile
    await expect(page.getByText('Set up your profile')).toBeVisible();
    await page.getByPlaceholder('Ada Lovelace').fill('Test User');
    await page.getByPlaceholder('ada@example.com').fill('test@example.com');
    await page.getByLabel('Preferred currency').selectOption('EUR');
    await page.getByRole('button', { name: 'Create profile' }).click();

    // Should navigate to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('can skip profile setup', async ({ page }) => {
    await page.goto('/onboarding');

    // Consent
    await page.locator('label', { hasText: /Terms of Service/ }).locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Select Local
    await page.getByRole('button', { name: /Local/i }).click();

    // Skip profile
    await page.getByRole('button', { name: 'Skip for now' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('CLI setup path shows install instructions', async ({ page }) => {
    await page.goto('/onboarding');

    // Consent
    await page.locator('label', { hasText: /Terms of Service/ }).locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Select CLI
    await page.getByRole('button', { name: /CLI companion/i }).click();

    // Should show CLI install instructions
    await expect(page.getByText('Install the CLI companion')).toBeVisible();
    await expect(page.getByText('npm i -g recall-cli')).toBeVisible();

    // Continue to profile
    await page.getByRole('button', { name: 'Continue to profile' }).click();
    await expect(page.getByText('Set up your profile')).toBeVisible();
  });

  test('Cloud setup path triggers GitHub OAuth', async ({ page }) => {
    await page.goto('/onboarding');

    // Consent
    await page.locator('label', { hasText: /Terms of Service/ }).locator('input[type="checkbox"]').check();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Cloud card should show GitHub option
    const cloudBtn = page.getByRole('button', { name: /Cloud/i });
    await expect(cloudBtn).toBeVisible();
  });

  test('redirects to onboarding when accessing dashboard without onboarding', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/onboarding');
  });

  test('redirects to onboarding when accessing dashboard subscriptions without onboarding', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');
    await expect(page).toHaveURL('/onboarding');
  });

  test('sign-in page renders the cloud sign-in flow', async ({ page }) => {
    await page.goto('/signin');
    await expect(page.getByText('Welcome back')).toBeVisible();
    await expect(page.getByRole('button', { name: /Continue with GitHub/i })).toBeVisible();
  });
});
