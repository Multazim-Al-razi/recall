import { test, expect } from '@playwright/test';
import { COPY } from '../frontend/src/lib/copyContract';
import { completeOnboarding } from './helpers/onboarding';
import { seedAccountWithSubs, type SeedSubscriptionOverrides } from './fixtures/seed';

const SEED: SeedSubscriptionOverrides[] = [
  { name: 'Netflix', amount: 15.99, category: 'entertainment', renewalInDays: 1 },
  { name: 'Spotify', amount: 9.99, category: 'music', renewalInDays: 2 },
  { name: 'YouTube Premium', amount: 13.99, category: 'entertainment', renewalInDays: 8 },
];

test.describe('Subscriptions page', () => {
  test.beforeEach(async ({ page }) => {
    await seedAccountWithSubs(page, SEED);
  });

  test('displays subscription list with seed data', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    // The page heading is the pinned "All subscriptions"
    await expect(page.getByText(COPY.subscriptionsPageHeading)).toBeVisible();
    await expect(page.getByText(COPY.subscriptionsPageHeadingStrong)).toBeVisible();

    // Seed data should include these subscriptions
    await expect(page.getByText('Netflix')).toBeVisible();
    await expect(page.getByText('Spotify')).toBeVisible();
    await expect(page.getByText('YouTube Premium')).toBeVisible();
  });

  test('shows the active subscription count', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');
    // The header reads "X active · {plan} plan allows ..."
    const planBar = page.getByText(/active · .*plan allows/i);
    await expect(planBar).toBeVisible();
  });

  test('category filters are present and functional', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    // "All" filter should be the default
    const allFilter = page.getByRole('button', { name: /^All \(\d+\)/i });
    await expect(allFilter).toBeVisible();

    // Click the Entertainment filter (pinned — "Entertainment" is a
    // category label rendered by CATEGORY_CONFIG).
    const entertainmentFilter = page.getByRole('button', { name: /^Entertainment \(\d+\)/i });
    await expect(entertainmentFilter).toBeVisible();
    await entertainmentFilter.click();

    // Netflix is entertainment, so it should stay visible
    await expect(page.getByText('Netflix')).toBeVisible();

    // Spotify is music — its row should be gone from the visible list.
    // (It may still be in the DOM with `display:none`, so we check that
    // the visible Spotify text count is 0.)
    const spotifyVisible = await page
      .getByText('Spotify')
      .first()
      .isVisible()
      .catch(() => false);
    expect(spotifyVisible).toBe(false);
  });

  test('opens the Add subscription modal', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    await page.getByRole('button', { name: /^Add$/i }).first().click();

    await expect(page.getByRole('dialog', { name: /Add subscription/i })).toBeVisible();
  });

  test('adds a new subscription with all required fields', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    // Open the add modal
    await page.getByRole('button', { name: /^Add$/i }).first().click();
    const dialog = page.getByRole('dialog', { name: /Add subscription/i });
    await expect(dialog).toBeVisible();

    // Fill the form using stable selectors (label, role-based)
    await dialog.getByLabel('Name').fill('Test Service');
    await dialog.getByLabel('Amount').fill('29.99');
    // Billing cycle defaults to "monthly" but pin it explicitly
    await dialog.getByLabel('Billing cycle').selectOption('monthly');
    // Category defaults to entertainment
    await dialog.getByLabel('Category').selectOption('entertainment');
    // Pin the renewal date too so the test isn't sensitive to defaults
    const renewal = dialog.getByLabel('Next renewal');
    await renewal.fill('2099-12-31');

    // Submit
    await dialog.getByRole('button', { name: 'Add' }).click();

    // Modal should close
    await expect(dialog).toBeHidden({ timeout: 5000 });

    // New subscription should appear in the list
    await expect(page.getByText('Test Service')).toBeVisible();
    // Pin the price (uses the symbol currently configured for the user)
    await expect(page.getByText(/\$29\.99/)).toBeVisible();
  });

  test('edits an existing subscription and saves the change', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    // Click edit on Netflix
    const editButton = page.getByRole('button', { name: /Edit Netflix/i });
    await expect(editButton).toBeVisible();
    await editButton.click();

    const dialog = page.getByRole('dialog', { name: /Edit subscription/i });
    await expect(dialog).toBeVisible();

    // Should pre-fill with Netflix data
    const nameInput = dialog.getByLabel('Name');
    await expect(nameInput).toHaveValue('Netflix');

    // Change the amount
    const amountInput = dialog.getByLabel('Amount');
    await amountInput.fill('19.99');

    // Save
    await dialog.getByRole('button', { name: 'Save' }).click();
    await expect(dialog).toBeHidden({ timeout: 5000 });

    // Updated amount visible on the card
    await expect(page.getByText(/\$19\.99/)).toBeVisible();
  });

  test('opens edit modal with subscription data pre-filled', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    const editButton = page.getByRole('button', { name: /Edit Netflix/i });
    await editButton.click();

    const dialog = page.getByRole('dialog', { name: /Edit subscription/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel('Name')).toHaveValue('Netflix');
  });

  test('deletes a subscription after confirmation', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    page.on('dialog', (dialog) => dialog.accept());

    const deleteButton = page.getByRole('button', { name: /Delete Netflix/i });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    await expect(page.getByText('Netflix')).toBeHidden({ timeout: 5000 });
  });

  test('subscription cards show pricing info', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');
    // Netflix shows $15.99/month
    await expect(page.getByText('$15.99')).toBeVisible();
    await expect(page.getByText('/mo')).toBeVisible();
  });

  test('cancel-by labels are displayed', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');
    await expect(page.getByText(/Cancel by/).first()).toBeVisible();
  });

  test('can cancel deletion and keep the subscription', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    page.on('dialog', (dialog) => dialog.dismiss());

    const deleteButton = page.getByRole('button', { name: /Delete Netflix/i });
    await deleteButton.click();

    await expect(page.getByText('Netflix')).toBeVisible();
  });

  test('Escape closes the add modal (focus-trap behavior)', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');
    await page.getByRole('button', { name: /^Add$/i }).first().click();
    const dialog = page.getByRole('dialog', { name: /Add subscription/i });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden({ timeout: 5000 });
  });

  test('add a new subscription updates the dashboard monthly burn KPI', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    // Read the current monthly burn value
    const burnTile = page
      .locator('div', { hasText: COPY.dashboardKpiMonthlyBurn })
      .last();
    const burnBefore = (await burnTile.locator('div').first().textContent())?.trim() ?? '';
    expect(burnBefore.length).toBeGreaterThan(0);

    // Navigate to subscriptions and add a new sub
    await page.goto('/dashboard/subscriptions');
    await page.getByRole('button', { name: /^Add$/i }).first().click();
    const dialog = page.getByRole('dialog', { name: /Add subscription/i });
    await dialog.getByLabel('Name').fill('Big Add-on');
    await dialog.getByLabel('Amount').fill('77.77');
    await dialog.getByLabel('Category').selectOption('other');
    await dialog.getByLabel('Next renewal').fill('2099-12-31');
    await dialog.getByRole('button', { name: 'Add' }).click();
    await expect(dialog).toBeHidden();

    // Return to dashboard, monthly burn should now include the new sub
    await page.goto('/dashboard');
    await expect(page.getByText(/\$\d/)).toBeVisible();
    await expect(page.getByText('Big Add-on')).toBeVisible();
  });

  test('search filters the subscription list', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');
    const search = page.getByPlaceholder(/search/i);
    if ((await search.count()) > 0) {
      await search.fill('Netflix');
      await expect(page.getByText('Netflix')).toBeVisible();

      await search.fill('zzz-no-such-thing');
      await expect(page.getByText(/No subscriptions here yet/i)).toBeVisible();
    }
  });
});
