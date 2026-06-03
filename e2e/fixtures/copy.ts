/**
 * Pinned copy strings for e2e assertions.
 *
 * Replaces the deleted frontend/src/lib/copyContract.ts.
 * When marketing copy changes, update the values here and the
 * affected specs will flag the drift.
 */
export const COPY = {
  homeHeroHeadline: 'The money leaving your account, finally in your hands',
  dashboardKpiMonthlyBurn: 'Monthly burn',
  dashboardKpiYearlyProjection: 'Yearly projection',
  dashboardKpiTrialsExpiring: 'Trials expiring',
  dashboardKpiPotentialSavings: 'Potential savings',
  subscriptionsPageHeading: 'All subscriptions',
  subscriptionsPageHeadingStrong: 'subscriptions',
  settingsAccountHeading: 'Account settings',
  settingsYourPlanHeading: 'Your plan',
  settingsSaveButton: 'Save changes',
  settingsSaved: 'Saved',
  settingsResetButton: 'Reset account',
} as const;
