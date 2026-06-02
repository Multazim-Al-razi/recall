import { describe, expect, it } from 'vitest';
import { hasSync, hasMobile, tierLabel } from '@/lib/entitlements';
import { FLAGS } from '@/lib/featureFlags';
import type { UserProfile } from '@/stores/account';

const baseProfile: UserProfile = {
  name: '',
  email: '',
  currency: 'USD',
  reminderLeadDays: 3,
  theme: 'system',
  tier: 'local',
};

describe('entitlements', () => {
  // The defaults in featureFlags.ts ship with `syncPlan: false` and
  // `mobileApp: false`, so hasSync / hasMobile must read as false today.
  // This is the contract: entitlements track flags, not just the tier.
  it('denies Sync when the feature flag is off, even if the user is on the sync tier', () => {
    expect(FLAGS.syncPlan).toBe(false);
    expect(hasSync({ ...baseProfile, tier: 'sync' })).toBe(false);
  });

  it('denies Sync when the feature flag is on but the user is on the local tier', () => {
    const restore = FLAGS.syncPlan;
    FLAGS.syncPlan = true;
    try {
      expect(hasSync({ ...baseProfile, tier: 'local' })).toBe(false);
    } finally {
      FLAGS.syncPlan = restore;
    }
  });

  it('grants Sync when both the flag is on and the user is on the sync tier', () => {
    const restore = FLAGS.syncPlan;
    FLAGS.syncPlan = true;
    try {
      expect(hasSync({ ...baseProfile, tier: 'sync' })).toBe(true);
    } finally {
      FLAGS.syncPlan = restore;
    }
  });

  it('denies mobile when the feature flag is off', () => {
    expect(FLAGS.mobileApp).toBe(false);
    expect(hasMobile()).toBe(false);
  });

  it('tierLabel returns the marketing label for each tier', () => {
    expect(tierLabel('local')).toBe('Web · Local');
    expect(tierLabel('sync')).toBe('Web · Sync');
  });
});
