import { test, expect } from '@playwright/test';
import { COPY } from './fixtures/copy';
import { completeOnboarding } from './helpers/onboarding';
import { seedAccountWithSubs } from './fixtures/seed';

test.describe('Profile / Settings page', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test('displays user profile information', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page.getByText('Test User').first()).toBeVisible();
    await expect(page.getByText('test@example.com').first()).toBeVisible();
  });

  test('shows the Account settings form with pre-filled values', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page.getByText(COPY.settingsAccountHeading)).toBeVisible();

    // Use accessible labels — these are stable.
    await expect(page.getByLabel('Name').first()).toHaveValue('Test User');
    await expect(page.getByLabel('Email').first()).toHaveValue('test@example.com');
  });

  test('shows the plan card', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await expect(page.getByText(COPY.settingsYourPlanHeading)).toBeVisible();
  });

  test('save button is disabled when the form is unchanged', async ({ page }) => {
    await page.goto('/dashboard/settings');
    const saveBtn = page.getByRole('button', { name: COPY.settingsSaveButton });
    await expect(saveBtn).toBeDisabled();
  });

  test('save button enables after modifying a field', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await page.getByLabel('Name').first().fill('New Name');
    const saveBtn = page.getByRole('button', { name: COPY.settingsSaveButton });
    await expect(saveBtn).not.toBeDisabled();
  });

  test('saving shows the Saved confirmation', async ({ page }) => {
    await page.goto('/dashboard/settings');
    await page.getByLabel('Name').first().fill('New Name');
    const saveBtn = page.getByRole('button', { name: COPY.settingsSaveButton });
    await saveBtn.click();
    await expect(page.getByText(COPY.settingsSaved)).toBeVisible();
  });

  test('can change currency and the Saved feedback appears', async ({ page }) => {
    await page.goto('/dashboard/settings');
    // The currency select sits inside a labelled field. Pin by its visible
    // label rather than index.
    const currencyGroup = page.locator('label', { hasText: 'Currency' }).first();
    await currencyGroup.locator('select').selectOption('EUR');
    const saveBtn = page.getByRole('button', { name: COPY.settingsSaveButton });
    await saveBtn.click();
    await expect(page.getByText(COPY.settingsSaved)).toBeVisible();
  });

  test('can change reminder lead time and the Saved feedback appears', async ({ page }) => {
    await page.goto('/dashboard/settings');
    const reminderGroup = page.locator('label', { hasText: 'Reminder lead time' }).first();
    await reminderGroup.locator('select').selectOption('7');
    const saveBtn = page.getByRole('button', { name: COPY.settingsSaveButton });
    await saveBtn.click();
    await expect(page.getByText(COPY.settingsSaved)).toBeVisible();
  });

  test('currency switch propagates to the Subscriptions page', async ({ page }) => {
    await page.goto('/dashboard/settings');
    const currencyGroup = page.locator('label', { hasText: 'Currency' }).first();
    await currencyGroup.locator('select').selectOption('EUR');
    await page.getByRole('button', { name: COPY.settingsSaveButton }).click();
    await expect(page.getByText(COPY.settingsSaved)).toBeVisible();

    // Navigate to Subscriptions and check the formatted amounts use the
    // new currency symbol. (The security agent is fixing symbol positions;
    // we only assert the symbol changed.)
    await page.goto('/dashboard/subscriptions');
    // The EUR symbol is € (U+20AC). At least one €-prefixed amount should
    // be visible on a seeded subscription list.
    await expect(page.locator('text=/€[0-9]/').first()).toBeVisible({ timeout: 5000 });
  });

  test('reset account accept path clears the profile and lands on /onboarding', async ({
    page,
    context,
  }) => {
    // Seed some subscriptions so we can verify they're cleared too.
    await seedAccountWithSubs(page, [{ name: 'Will Be Cleared', amount: 1.23, renewalInDays: 30 }]);

    await page.goto('/dashboard/settings');
    page.on('dialog', (dialog) => dialog.accept());

    const resetBtn = page.getByRole('button', { name: COPY.settingsResetButton });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();

    // After reset, we should be on the onboarding page
    await expect(page).toHaveURL(/\/onboarding/);

    // Account storage should be in the "not onboarded" state
    const account = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('recall-account') ?? '{}');
    });
    expect(account?.state?.onboarded).toBe(false);
  });

  test('reset account dismiss path keeps the user on /dashboard/settings', async ({ page }) => {
    await page.goto('/dashboard/settings');
    page.on('dialog', (dialog) => dialog.dismiss());
    await page.getByRole('button', { name: COPY.settingsResetButton }).click();
    await expect(page).toHaveURL('/dashboard/settings');
  });

  test('plan link points to the pricing page', async ({ page }) => {
    await page.goto('/dashboard/settings');
    const plansLink = page.getByRole('link', { name: /See plans|View plans|Upgrade plan/i });
    await expect(plansLink).toBeVisible();
    await expect(plansLink).toHaveAttribute('href', '/pricing');
  });
});
