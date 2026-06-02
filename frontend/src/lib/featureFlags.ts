/**
 * Build-time feature flags — the single source of truth for which plan
 * surfaces are visible in the UI.
 *
 * Recall's product model:
 *   - Web · Local  → always available, free, runs in the browser.
 *   - Web · Sync   → $1.99/mo for cloud-delivered reminders. Schema and
 *                    entitlement plumbing exist (see lib/entitlements.ts
 *                    and the `tier` field on the account), but the
 *                    checkout/email-reminder side of the feature is not
 *                    yet shipping. Flip `syncPlan` to `true` only once
 *                    billing and reminder delivery are live.
 *   - Mobile       → free, on-device reminders. The companion app is in
 *                    development; the marketing surface is already
 *                    present so users can see what's coming.
 *
 * Keep this file the only place these booleans are defined. UI components,
 * pricing copy, and the entitlements module all read from here so the
 * story never drifts across surfaces.
 */
export const FLAGS: Record<FeatureFlag, boolean> = {
  /** When true, the Sync plan renders as buyable (featured card, checkout CTA). */
  syncPlan: false,
  /** When true, the Mobile plan card surfaces a "Join the waitlist" CTA. */
  mobileApp: false,
};

export type FeatureFlag = 'syncPlan' | 'mobileApp';
