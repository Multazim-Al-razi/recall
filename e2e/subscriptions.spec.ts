import { test, expect } from '@playwright/test';

// Helper: complete onboarding and seed subscription data via localStorage
async function setupWithSubscriptions(page: import('@playwright/test').Page) {
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
}

test.describe('Subscriptions page', () => {
  test.beforeEach(async ({ page }) => {
    await setupWithSubscriptions(page);
  });

  test('displays subscription list with seed data', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');
    await expect(page.getByText('All subscriptions')).toBeVisible();

    // Seed data should include these subscriptions
    await expect(page.getByText('Netflix')).toBeVisible();
    await expect(page.getByText('Spotify')).toBeVisible();
    await expect(page.getByText('YouTube Premium')).toBeVisible();
  });

  test('shows active subscription count', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');
    // Should show active count
    await expect(page.getByText(/active/)).toBeVisible();
  });

  test('category filters are present and functional', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    // "All" filter should be active by default
    const allFilter = page.getByRole('button', { name: /All/i }).first();
    await expect(allFilter).toHaveAttribute('aria-pressed', 'true');

    // Click Entertainment filter
    const entertainmentFilter = page.getByRole('button', { name: /Entertainment/i });
    await expect(entertainmentFilter).toBeVisible();
    await entertainmentFilter.click();
    await expect(entertainmentFilter).toHaveAttribute('aria-pressed', 'true');

    // Netflix should still be visible (entertainment)
    await expect(page.getByText('Netflix')).toBeVisible();

    // Spotify should not be visible (music category)
    // Note: it might still be in the DOM but filtered out — check the list
    const spotifyVisible = await page.getByText('Spotify').isVisible().catch(() => false);
    // Spotify is music, not entertainment, so it should be hidden
    expect(spotifyVisible).toBe(false);
  });

  test('opens add subscription modal', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    // Click the "Add" button
    await page.getByRole('button', { name: /Add$/i }).first().click();

    // Modal should appear
    await expect(page.getByRole('dialog', { name: /Add subscription/i })).toBeVisible();
    await expect(page.getByText('Add subscription')).toBeVisible();
  });

  test('adds a new subscription', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    // Open add modal
    await page.getByRole('button', { name: /Add$/i }).first().click();

    // Fill in the form
    await page.getByRole('dialog').getByLabel('Name').or(page.getByRole('dialog').locator('input').first()).fill('Test Service');
    await page.getByRole('dialog').locator('input[type="number"]').fill('29.99');

    // Submit
    await page.getByRole('dialog').getByRole('button', { name: 'Add' }).click();

    // Modal should close
    await expect(page.getByRole('dialog')).toBeHidden({ timeout: 5000 });

    // New subscription should appear in the list
    await expect(page.getByText('Test Service')).toBeVisible();
  });

  test('opens edit subscription modal', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    // Click edit on Netflix
    const editButton = page.getByRole('button', { name: /Edit Netflix/i });
    await expect(editButton).toBeVisible();
    await editButton.click();

    // Edit modal should appear
    await expect(page.getByRole('dialog', { name: /Edit subscription/i })).toBeVisible();

    // Should pre-fill with Netflix data
    const nameInput = page.getByRole('dialog').locator('input').first();
    await expect(nameInput).toHaveValue('Netflix');
  });

  test('deletes a subscription after confirmation', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    // Accept the confirm dialog
    page.on('dialog', (dialog) => dialog.accept());

    // Delete Netflix
    const deleteButton = page.getByRole('button', { name: /Delete Netflix/i });
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    // Netflix should be removed from the list
    await expect(page.getByText('Netflix')).toBeHidden({ timeout: 5000 });
  });

  test('subscription cards show pricing info', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    // Netflix shows $15.99/month
    await expect(page.getByText('$15.99')).toBeVisible();
    await expect(page.getByText('/mo')).toBeVisible();
  });

  test('cancel labels are displayed', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    // Should show "Cancel by" labels
    await expect(page.getByText(/Cancel by/).first()).toBeVisible();
  });

  test('can cancel deletion and keep subscription', async ({ page }) => {
    await page.goto('/dashboard/subscriptions');

    // Dismiss the confirm dialog
    page.on('dialog', (dialog) => dialog.dismiss());

    // Try to delete Netflix
    const deleteButton = page.getByRole('button', { name: /Delete Netflix/i });
    await deleteButton.click();

    // Netflix should still be visible
    await expect(page.getByText('Netflix')).toBeVisible();
  });
});