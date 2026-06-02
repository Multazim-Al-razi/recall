import { FLAGS } from '@/lib/featureFlags';
import type { UserProfile } from '@/stores/account';

/**
 * Plan entitlements — the single place downstream code asks "does this user
 * have feature X?". Each helper is a pure function so it can be reused
 * server-side, in tests, or in components without coupling to React.
 *
 * Today every plan except `local` is gated behind `FLAGS`, so even a profile
 * with `tier === 'sync'` still reads as not-entitled while Sync is in
 * development. Once billing and reminder delivery ship, flip `FLAGS.syncPlan`
 * to `true` and these helpers will start returning true automatically.
 */

export type Tier = UserProfile['tier'];

/** True when the user is on (or has access to) cloud-delivered reminders. */
export function hasSync(profile: UserProfile): boolean {
  return FLAGS.syncPlan && profile.tier === 'sync';
}

/**
 * True when the companion mobile app is generally available. Unlike Sync,
 * mobile availability is a build-time gate (the binary either ships or it
 * doesn't), so this is a constant for the lifetime of a build. No
 * profile parameter needed.
 */
export function hasMobile(): boolean {
  return FLAGS.mobileApp;
}

/** Display label for the active tier, used by the profile and pricing UI. */
export function tierLabel(tier: Tier): string {
  switch (tier) {
    case 'sync':
      return 'Web · Sync';
    case 'local':
      return 'Web · Local';
  }
}
