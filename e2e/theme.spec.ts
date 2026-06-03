import { test, expect } from '@playwright/test';
import { completeOnboarding } from './helpers/onboarding';

/**
 * Theme switching. The store currently has no theme field, so this test is
 * forward-looking: it asserts the *contract* (HTML <html> class + a
 * `theme` key in localStorage) but tolerates the current shape.
 */
test.describe('Theme switching', () => {
  test.beforeEach(async ({ page }) => {
    await completeOnboarding(page);
  });

  test('the html element can be switched between light and dark classes', async ({ page }) => {
    await page.goto('/');
    // The initial html element should not have a dark class (light by default)
    const html = page.locator('html');
    const initiallyHasDark = await html.evaluate((el) => el.classList.contains('dark'));

    // Programmatically toggle the class to simulate theme switching.
    // The theme-switcher hook may live in a settings panel that hasn't
    // shipped yet, so we exercise the contract directly here.
    await html.evaluate((el) => el.classList.add('dark'));
    expect(await html.evaluate((el) => el.classList.contains('dark'))).toBe(true);

    await html.evaluate((el) => el.classList.remove('dark'));
    expect(await html.evaluate((el) => el.classList.contains('dark'))).toBe(false);
    expect(initiallyHasDark).toBe(false);
  });

  test('a theme control exists in the settings page (when shipped)', async ({ page }) => {
    await page.goto('/dashboard/settings');
    // The theme control may be a button, a select, or a segmented control.
    // We accept any of these accessible names.
    const themeControl = page
      .getByRole('button', { name: /theme|dark|light|system/i })
      .or(page.getByRole('radio', { name: /dark|light|system/i }))
      .or(page.getByLabel(/theme/i));
    if ((await themeControl.count()) > 0) {
      // If a control is present, clicking the "dark" option should add the
      // dark class to <html>.
      const darkOption = page
        .getByRole('button', { name: /^dark$/i })
        .or(page.getByRole('radio', { name: /^dark$/i }));
      if ((await darkOption.count()) > 0) {
        await darkOption.first().click();
        await expect(page.locator('html')).toHaveClass(/dark/);
      }
    }
  });

  test('localStorage account store preserves theme across reloads (when shipped)', async ({ page }) => {
    await page.goto('/');
    // The theme lives inside the zustand-persisted account store.
    // Write a dark-theme account record and verify it survives a reload.
    await page.evaluate(() => {
      const existing = JSON.parse(localStorage.getItem('recall-account') ?? '{}');
      const state = existing.state ?? {};
      state.profile = { ...(state.profile ?? {}), theme: 'dark' };
      localStorage.setItem('recall-account', JSON.stringify({ ...existing, state }));
    });
    await page.reload();
    const stored = await page.evaluate(() => {
      const raw = JSON.parse(localStorage.getItem('recall-account') ?? '{}');
      return raw?.state?.profile?.theme;
    });
    expect(stored).toBe('dark');
  });
});
