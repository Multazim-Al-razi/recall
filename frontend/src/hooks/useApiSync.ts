import { useEffect, useRef, useCallback } from 'react';
import { subscriptionsApi, accountApi, type ApiSubscription } from '@/lib/api';
import { useSubscriptionStore } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { useConnectionStore } from '@/stores/connection';
import type { Subscription } from '@/types/subscription';
import type { UserProfile } from '@/stores/account';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

/** Convert API subscription to local Subscription type */
function fromApiSub(api: ApiSubscription): Subscription {
  return {
    id: api.id,
    name: api.name,
    amount: api.amount,
    currency: api.currency,
    billingCycle: api.billingCycle as Subscription['billingCycle'],
    customCycleDays: api.customCycleDays,
    category: api.category as Subscription['category'],
    startDate: api.startDate,
    nextRenewalDate: api.nextRenewalDate,
    reminderDaysBefore: api.reminderDaysBefore,
    autoReminder: api.autoReminder,
    isFreeTrial: api.isFreeTrial,
    trialEndDate: api.trialEndDate,
    providerIcon: api.providerIcon,
    notes: api.notes,
    status: api.status as Subscription['status'],
  };
}

/**
 * Two accounts that look like the same person but have different email/name
 * almost always means a second device on the same no-auth backend (F-4). We
 * surface this as a conflict the user can resolve instead of silently
 * clobbering the local data.
 */
function profilesLookLikeSameAccount(
  a: Pick<UserProfile, 'name' | 'email'>,
  b: Pick<UserProfile, 'name' | 'email'>,
): boolean {
  return (
    (a.name?.trim() ?? '') === (b.name?.trim() ?? '') &&
    (a.email?.trim() ?? '') === (b.email?.trim() ?? '')
  );
}

/**
 * Performs a full sync against the backend and reports status to the
 * connection store. Returns true if the backend was reachable.
 *
 *  1. Health-check the backend
 *  2. Pull account + subscriptions when present (backend is source of truth)
 *  3. Seed the backend from local data when it is empty
 *  4. Stay in local-first mode if anything fails
 */
export async function syncWithBackend(): Promise<boolean> {
  const conn = useConnectionStore.getState();
  conn.setStatus('connecting');

  try {
    const health = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!health.ok) {
      conn.setStatus('offline');
      return false;
    }

    // Load account from backend
    try {
      const apiAccount = await accountApi.get();
      const localProfile = useAccountStore.getState().profile;
      const localOnboarded = useAccountStore.getState().onboarded;
      const localIsNonEmpty =
        localOnboarded || (localProfile.name?.trim() ?? '') !== '' || (localProfile.email?.trim() ?? '') !== '';

      // F-4: if the backend has a *different* identity (name/email) than
      // ours and we have local data, don't auto-merge — surface a
      // conflict and let the user decide. The connection store carries the
      // `conflict` flag; `DashboardLayout` renders the banner.
      if (localIsNonEmpty && !profilesLookLikeSameAccount(localProfile, apiAccount)) {
        conn.setSyncConflict({ local: localProfile, remote: apiAccount });
        conn.markSynced();
        return true;
      }

      const store = useAccountStore.getState();
      store.updateProfile({
        name: apiAccount.name,
        email: apiAccount.email,
        avatar: apiAccount.avatar,
        currency: apiAccount.currency,
        reminderLeadDays: apiAccount.reminderLeadDays,
        tier: apiAccount.tier ?? 'local',
      });
      if (apiAccount.onboarded && !store.onboarded) {
        store.completeOnboarding({});
      }
    } catch (err) {
      // 5.3: surface the error to the connection store so the UI can show
      // a banner. Don't spam the console.
      conn.recordSyncError(err instanceof Error ? err.message : 'Account sync failed');
      // Account might not exist yet — push local data
      const local = useAccountStore.getState();
      try {
        await accountApi.update({
          name: local.profile.name,
          email: local.profile.email,
          currency: local.profile.currency,
          reminderLeadDays: local.profile.reminderLeadDays,
          onboarded: local.onboarded,
        });
      } catch { /* ignore */ }
    }

    // Load subscriptions from backend
    try {
      const { subscriptions: apiSubs } = await subscriptionsApi.list();
      if (apiSubs.length > 0) {
        // Backend has data — load it into local store
        useSubscriptionStore.setState({
          subscriptions: apiSubs.map(fromApiSub),
        });
      } else {
        // Backend is empty — push local seed data
        const localSubs = useSubscriptionStore.getState().subscriptions;
        for (const sub of localSubs) {
          try {
            await subscriptionsApi.create(sub);
          } catch { /* skip duplicates */ }
        }
      }
    } catch (err) {
      conn.recordSyncError(err instanceof Error ? err.message : 'Subscription sync failed');
    }

    conn.markSynced();
    return true;
  } catch (err) {
    // 5.3: surface the error before flipping to offline so the UI can
    // decide whether to show a transient "sync error" toast or a hard
    // "backend offline" indicator.
    conn.recordSyncError(err instanceof Error ? err.message : 'Backend unreachable');
    conn.setStatus('offline');
    return false;
  }
}

/**
 * Mounts the initial backend sync. Local-first: the UI is fully functional
 * whether or not the backend responds. Status is surfaced via the
 * connection store so a small indicator can reflect the live state.
 */
export function useApiSync() {
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;
    syncWithBackend();
  }, []);
}

/** Imperative retry for the "reconnect" affordance in the UI. */
export function useRetrySync() {
  return useCallback(() => syncWithBackend(), []);
}


/**
 * Hook to push subscription changes to the backend.
 * Returns wrapped store actions that also sync to the API.
 */
export function useSubscriptionActions() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const addSubscription = useSubscriptionStore((s) => s.addSubscription);
  const updateSubscription = useSubscriptionStore((s) => s.updateSubscription);
  const removeSubscription = useSubscriptionStore((s) => s.removeSubscription);

  const addSub = async (sub: Omit<Subscription, 'id'>) => {
    addSubscription(sub);
    // addSubscription modifies the store in-place, so grab the latest
    // state to find the newly-created subscription by matching fields.
    const store = useSubscriptionStore.getState();
    const created = store.subscriptions.find((s) =>
      s.name === sub.name && s.amount === sub.amount && s.billingCycle === sub.billingCycle
    );
    if (created) {
      try { await subscriptionsApi.create(created); } catch { /* local-first */ }
    }
  };

  const updateSub = async (id: string, updates: Partial<Subscription>) => {
    updateSubscription(id, updates);
    try { await subscriptionsApi.update(id, updates); } catch { /* local-first */ }
  };

  const removeSub = async (id: string) => {
    removeSubscription(id);
    try { await subscriptionsApi.delete(id); } catch { /* local-first */ }
  };

  return {
    subscriptions,
    addSubscription: addSub,
    updateSubscription: updateSub,
    removeSubscription: removeSub,
  };
}

/**
 * Hook to push account changes to the backend. Uses granular selectors so
 * only the relevant slice of the store re-renders on each change (6.2).
 */
export function useAccountActions() {
  const profile = useAccountStore((s) => s.profile);
  const onboarded = useAccountStore((s) => s.onboarded);
  const updateProfile = useAccountStore((s) => s.updateProfile);
  const completeOnboarding = useAccountStore((s) => s.completeOnboarding);
  const resetAccount = useAccountStore((s) => s.resetAccount);

  const updateProfileApi = async (updates: Partial<UserProfile>) => {
    updateProfile(updates);
    try { await accountApi.update(updates); } catch { /* local-first */ }
  };

  const completeOnboardingApi = async (profile: Partial<UserProfile>) => {
    completeOnboarding(profile);
    try { await accountApi.completeOnboarding(profile); } catch { /* local-first */ }
  };

  const resetAccountApi = async () => {
    resetAccount();
    try { await accountApi.reset(); } catch { /* local-first */ }
  };

  return {
    profile,
    onboarded,
    updateProfile: updateProfileApi,
    completeOnboarding: completeOnboardingApi,
    resetAccount: resetAccountApi,
  };
}
