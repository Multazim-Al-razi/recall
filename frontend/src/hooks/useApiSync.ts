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
    paymentMethodId: api.paymentMethodId,
    cancellationDifficulty: api.cancellationDifficulty as Subscription['cancellationDifficulty'],
    autoRenews: api.autoRenews ?? true,
  };
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
      const store = useAccountStore.getState();
      store.updateProfile({
        name: apiAccount.name,
        email: apiAccount.email,
        avatar: apiAccount.avatar,
        currency: apiAccount.currency,
        reminderLeadDays: apiAccount.reminderLeadDays,
      });
      if (apiAccount.onboarded && !store.onboarded) {
        store.completeOnboarding({});
      }
    } catch {
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
    } catch {
      // Subscriptions endpoint failed — continue with local data
    }

    conn.markSynced();
    return true;
  } catch {
    // Backend unreachable — local-first mode continues normally
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
  const store = useSubscriptionStore();

  const addSub = async (sub: Omit<Subscription, 'id'>) => {
    const id = store.addSubscription(sub);
    // Use the returned ID to find the created subscription reliably
    const created = useSubscriptionStore.getState().subscriptions.find((s) => s.id === id);
    if (created) {
      try { await subscriptionsApi.create(created); } catch { /* local-first */ }
    }
  };

  const updateSub = async (id: string, updates: Partial<Subscription>) => {
    store.updateSubscription(id, updates);
    try { await subscriptionsApi.update(id, updates); } catch { /* local-first */ }
  };

  const removeSub = async (id: string) => {
    store.removeSubscription(id);
    try { await subscriptionsApi.delete(id); } catch { /* local-first */ }
  };

  return {
    subscriptions: store.subscriptions,
    addSubscription: addSub,
    updateSubscription: updateSub,
    removeSubscription: removeSub,
  };
}

/**
 * Hook to push account changes to the backend.
 */
export function useAccountActions() {
  const store = useAccountStore();

  const updateProfile = async (updates: Partial<UserProfile>) => {
    store.updateProfile(updates);
    try { await accountApi.update(updates); } catch { /* local-first */ }
  };

  const completeOnboarding = async (profile: Partial<UserProfile>) => {
    store.completeOnboarding(profile);
    try { await accountApi.completeOnboarding(profile); } catch { /* local-first */ }
  };

  const resetAccount = async () => {
    store.resetAccount();
    try { await accountApi.reset(); } catch { /* local-first */ }
  };

  return {
    ...store,
    updateProfile,
    completeOnboarding,
    resetAccount,
  };
}
