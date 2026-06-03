import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import { addDays } from 'date-fns';
import type { Subscription } from '@/types/subscription';
import { MS_PER_DAY } from '@/lib/date';

interface SubscriptionState {
  subscriptions: Subscription[];
  /** Returns the generated ID of the new subscription. */
  addSubscription: (sub: Omit<Subscription, 'id'>) => string;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  removeSubscription: (id: string) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      subscriptions: [],

      addSubscription: (sub) => {
        const id = generateId();
        set((state) => ({
          subscriptions: [...state.subscriptions, { ...sub, id }],
        }));
        return id;
      },

      updateSubscription: (id, updates) =>
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      removeSubscription: (id) =>
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        })),
    }),
    {
      name: 'recall-subscriptions',
      version: 3,
      // D-2: surface quota errors via the same `recall:storage-quota` event
      // the account store fires on. Falls back gracefully in SSR / non-DOM
      // environments.
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') return undefined as unknown as StateStorage;
        return {
          getItem: (name) => window.localStorage.getItem(name),
          setItem: (name, value) => {
            try {
              window.localStorage.setItem(name, value);
            } catch (err) {
              window.dispatchEvent(
                new CustomEvent('recall:storage-quota', {
                  detail: {
                    name,
                    message: err instanceof Error ? err.message : String(err),
                  },
                }),
              );
            }
          },
          removeItem: (name) => {
            try {
              window.localStorage.removeItem(name);
            } catch {
              /* ignore */
            }
          },
        } as StateStorage;
      }),
      // v3 drops the legacy SEED_DATA demo subscriptions. Every older
      // persisted payload (v0/v1/v2) is reset to an empty list on upgrade so
      // users who previously saw 16 pre-loaded Netflix/Spotify/etc. entries
      // start fresh alongside brand-new sign-ups. Future shape changes should
      // add a v4 — never `as any`.
      migrate: (persistedState, version) => {
        if (version < 3) {
          return { subscriptions: [] };
        }
        const p = persistedState as { subscriptions?: Subscription[] } | null;
        return { subscriptions: p?.subscriptions ?? [] };
      },
    }
  )
);

/**
 * 6.2 helper: subscribe to a few subscription-store fields without
 * re-rendering the consumer when unrelated fields change. Pairs with
 * `useShallow` from `zustand/shallow`.
 */
export function useSubscriptionFields<K extends keyof SubscriptionState>(keys: readonly K[]) {
  return useSubscriptionStore(
    useShallow((s) => {
      const out: Partial<SubscriptionState> = {};
      for (const k of keys) out[k] = s[k];
      return out as Pick<SubscriptionState, K>;
    }),
  );
}

// Derived selectors — pure functions, no get()
export function toMonthlyAmount(s: Subscription): number {
  switch (s.billingCycle) {
    case 'monthly': return s.amount;
    case 'yearly': return s.amount / 12;
    case 'weekly': return s.amount * 4.33;
    case 'custom': return (s.amount / (s.customCycleDays || 30)) * 30;
    default: return 0;
  }
}

export function getMonthlySpend(subs: Subscription[]): number {
  return subs
    .filter((s) => s.status === 'active')
    .reduce((total, s) => total + toMonthlyAmount(s), 0);
}

export function getUpcomingRenewals(subs: Subscription[], days: number): Subscription[] {
  const now = new Date();
  const cutoff = addDays(now, days);
  return subs
    .filter((s) => {
      if (s.status !== 'active') return false;
      const renewal = new Date(s.nextRenewalDate);
      return renewal >= now && renewal <= cutoff;
    })
    .sort((a, b) => new Date(a.nextRenewalDate).getTime() - new Date(b.nextRenewalDate).getTime());
}

export function getActiveSubscriptions(subs: Subscription[]): Subscription[] {
  return subs.filter((s) => s.status === 'active');
}

/**
 * Monthly active spend over the trailing `months` window (oldest → newest),
 * derived from each subscription's `startDate`. A subscription contributes its
 * normalized monthly amount to every month at or after it began, so the curve
 * reflects real stack growth rather than fabricated numbers.
 */
export function getSpendHistory(
  subs: Subscription[],
  months = 7,
): { label: string; value: number }[] {
  const now = new Date();
  const result: { label: string; value: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const total = subs
      .filter((s) => s.status !== 'cancelled')
      .filter((s) => new Date(s.startDate) <= monthEnd)
      .reduce((sum, s) => sum + toMonthlyAmount(s), 0);
    result.push({
      label: monthEnd.toLocaleDateString('en-US', { month: 'short' }),
      value: Math.round(total * 100) / 100,
    });
  }

  return result;
}

export function getFreeTrials(subs: Subscription[]): Subscription[] {
  return subs.filter((s) => s.isFreeTrial && s.status === 'active');
}

export function getByCategory(subs: Subscription[]): Record<string, number> {
  const result: Record<string, number> = {};
  subs
    .filter((s) => s.status === 'active')
    .forEach((s) => {
      result[s.category] = (result[s.category] || 0) + toMonthlyAmount(s);
    });
  return result;
}

export function getExpiringTrials(subs: Subscription[], days: number): Subscription[] {
  return getFreeTrials(subs).filter((s) => {
    const end = new Date(s.trialEndDate || s.nextRenewalDate);
    const left = Math.ceil((end.getTime() - Date.now()) / MS_PER_DAY);
    return left >= 0 && left <= days;
  });
}

// Detect categories with overlapping subscriptions and the savings from
// consolidating each down to its cheapest option.
export function getSavingsOpportunities(subs: Subscription[]) {
  const byCat: Record<string, Subscription[]> = {};
  getActiveSubscriptions(subs).forEach((s) => {
    (byCat[s.category] ||= []).push(s);
  });

  let totalSavings = 0;
  let cancelCount = 0;
  let top: { names: string[]; savings: number } | null = null;

  for (const list of Object.values(byCat)) {
    if (list.length < 2) continue;
    const monthly = list.map(toMonthlyAmount);
    const sorted = [...monthly].sort((a, b) => a - b);
    const savings = sorted.slice(1).reduce((a, b) => a + b, 0);
    totalSavings += savings;
    cancelCount += list.length - 1;
    if (!top || savings > top.savings) {
      top = { names: list.map((s) => s.name), savings };
    }
  }

  return { totalSavings, cancelCount, top };
}
