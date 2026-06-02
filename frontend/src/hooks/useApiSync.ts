import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { subscriptionsApi, accountApi } from '@/lib/api';
import { useSubscriptionStore } from '@/stores/subscription';
import { useAccountStore } from '@/stores/account';
import { useConnectionStore } from '@/stores/connection';
import type { Subscription } from '@/types/subscription';
import type { UserProfile } from '@/stores/account';
import * as sb from '@/lib/supabaseSync';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const HAS_SUPABASE = supabase !== null;

function isCloudMode(): boolean {
  return HAS_SUPABASE;
}

export function useIsCloudMode(): boolean {
  return HAS_SUPABASE;
}

export async function syncWithBackend(): Promise<boolean> {
  const conn = useConnectionStore.getState();
  conn.setStatus('connecting');

  if (isCloudMode()) {
    return syncSupabase(conn);
  }
  return syncExpressApi(conn);
}

async function syncSupabase(conn: ReturnType<typeof useConnectionStore.getState>): Promise<boolean> {
  try {
    const userRes = await supabase!.auth.getUser();
    if (!userRes.data.user) {
      conn.setStatus('offline');
      return false;
    }

    const accountData = await sb.fetchAccount();
    const store = useAccountStore.getState();

    if (accountData) {
      store.updateProfile({
        name: accountData.profile.name,
        email: accountData.profile.email,
        currency: accountData.profile.currency,
        reminderLeadDays: accountData.profile.reminderLeadDays,
        tier: (accountData.profile.tier ?? 'local') as UserProfile['tier'],
      });
      if (accountData.profile.onboarded && !store.onboarded) {
        store.completeOnboarding({});
      }
    } else {
      const local = useAccountStore.getState();
      try {
        await sb.ensureAccount({
          name: local.profile.name,
          email: local.profile.email,
          currency: local.profile.currency,
          reminderLeadDays: local.profile.reminderLeadDays,
        });
      } catch { /* ignore — account may already exist */ }
    }

    try {
      const cloudSubs = await sb.listSubscriptions();
      if (cloudSubs.length > 0) {
        useSubscriptionStore.setState({ subscriptions: cloudSubs });
      } else {
        const localSubs = useSubscriptionStore.getState().subscriptions;
        for (const sub of localSubs) {
          try {
            await sb.createSubscription(sub);
          } catch { /* skip duplicates */ }
        }
      }
    } catch (err) {
      conn.recordSyncError(err instanceof Error ? err.message : 'Subscription sync failed');
    }

    conn.markSynced();
    return true;
  } catch (err) {
    conn.recordSyncError(err instanceof Error ? err.message : 'Cloud sync failed');
    conn.setStatus('offline');
    return false;
  }
}

async function syncExpressApi(conn: ReturnType<typeof useConnectionStore.getState>): Promise<boolean> {
  try {
    const health = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!health.ok) {
      conn.setStatus('offline');
      return false;
    }

    try {
      const apiAccount = await accountApi.get();
      const localProfile = useAccountStore.getState().profile;
      const localOnboarded = useAccountStore.getState().onboarded;
      const localIsNonEmpty =
        localOnboarded || (localProfile.name?.trim() ?? '') !== '' || (localProfile.email?.trim() ?? '') !== '';

      if (localIsNonEmpty && !profilesLookLikeSameAccount(localProfile, apiAccount)) {
        conn.setSyncConflict({ local: localProfile, remote: apiAccount, detectedAt: new Date().toISOString() });
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
      conn.recordSyncError(err instanceof Error ? err.message : 'Account sync failed');
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

    try {
      const { subscriptions: apiSubs } = await subscriptionsApi.list();
      if (apiSubs.length > 0) {
        useSubscriptionStore.setState({
          subscriptions: apiSubs.map(fromApiSub),
        });
      } else {
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
    conn.recordSyncError(err instanceof Error ? err.message : 'Backend unreachable');
    conn.setStatus('offline');
    return false;
  }
}

function profilesLookLikeSameAccount(
  a: Pick<UserProfile, 'name' | 'email'>,
  b: Pick<{ name: string; email: string }, 'name' | 'email'>,
): boolean {
  return (
    (a.name?.trim() ?? '') === (b.name?.trim() ?? '') &&
    (a.email?.trim() ?? '') === (b.email?.trim() ?? '')
  );
}

function fromApiSub(api: { id: string; name: string; amount: number; currency: string; billingCycle: string; customCycleDays?: number; category: string; startDate: string; nextRenewalDate: string; reminderDaysBefore: number; autoReminder: boolean; isFreeTrial: boolean; trialEndDate?: string; providerIcon?: string; notes?: string; status: string }): Subscription {
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

export function useApiSync() {
  const synced = useRef(false);

  useEffect(() => {
    if (synced.current) return;
    synced.current = true;
    syncWithBackend();
  }, []);
}

export function useRetrySync() {
  return useCallback(() => syncWithBackend(), []);
}

export function useSubscriptionActions() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const addSubscription = useSubscriptionStore((s) => s.addSubscription);
  const updateSubscription = useSubscriptionStore((s) => s.updateSubscription);
  const removeSubscription = useSubscriptionStore((s) => s.removeSubscription);

  const addSub = async (sub: Omit<Subscription, 'id'>) => {
    const id = addSubscription(sub);
    const created = useSubscriptionStore.getState().subscriptions.find((s) => s.id === id);
    if (created) {
      try {
        if (isCloudMode()) {
          await sb.createSubscription(created);
        } else {
          await subscriptionsApi.create(created);
        }
      } catch { /* local-first */ }
    }
  };

  const updateSub = async (id: string, updates: Partial<Subscription>) => {
    updateSubscription(id, updates);
    try {
      if (isCloudMode()) {
        await sb.updateSubscription(id, updates);
      } else {
        await subscriptionsApi.update(id, updates);
      }
    } catch { /* local-first */ }
  };

  const removeSub = async (id: string) => {
    removeSubscription(id);
    try {
      if (isCloudMode()) {
        await sb.deleteSubscription(id);
      } else {
        await subscriptionsApi.delete(id);
      }
    } catch { /* local-first */ }
  };

  return {
    subscriptions,
    addSubscription: addSub,
    updateSubscription: updateSub,
    removeSubscription: removeSub,
  };
}

export function useAccountActions() {
  const profile = useAccountStore((s) => s.profile);
  const onboarded = useAccountStore((s) => s.onboarded);
  const updateProfile = useAccountStore((s) => s.updateProfile);
  const completeOnboarding = useAccountStore((s) => s.completeOnboarding);
  const resetAccount = useAccountStore((s) => s.resetAccount);

  const updateProfileApi = async (updates: Partial<UserProfile>) => {
    updateProfile(updates);
    try {
      if (isCloudMode()) {
        await sb.updateAccount(updates);
      } else {
        await accountApi.update(updates);
      }
    } catch { /* local-first */ }
  };

  const completeOnboardingApi = async (profilePatch: Partial<UserProfile>) => {
    completeOnboarding(profilePatch);
    try {
      if (isCloudMode()) {
        await sb.ensureAccount(profilePatch);
      } else {
        await accountApi.completeOnboarding(profilePatch);
      }
    } catch { /* local-first */ }
  };

  const resetAccountApi = async () => {
    resetAccount();
    try {
      if (isCloudMode()) {
        await sb.resetAccount();
      } else {
        await accountApi.reset();
      }
    } catch { /* local-first */ }
  };

  return {
    profile,
    onboarded,
    updateProfile: updateProfileApi,
    completeOnboarding: completeOnboardingApi,
    resetAccount: resetAccountApi,
  };
}
