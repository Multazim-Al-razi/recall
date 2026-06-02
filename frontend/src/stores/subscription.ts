import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import { addDays, format } from 'date-fns';
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

const SEED_DATA: Subscription[] = [
  {
    id: 'sub_netflix',
    name: 'Netflix',
    amount: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'entertainment',
    startDate: '2024-01-15',
    nextRenewalDate: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    reminderDaysBefore: 3,
    autoReminder: true,
    isFreeTrial: false,
    providerIcon: 'netflix',
    status: 'active',
  },
  {
    id: 'sub_spotify',
    name: 'Spotify',
    amount: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'music',
    startDate: '2023-06-01',
    nextRenewalDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    reminderDaysBefore: 3,
    autoReminder: true,
    isFreeTrial: false,
    providerIcon: 'spotify',
    status: 'active',
  },
  {
    id: 'sub_appletv',
    name: 'Apple TV+',
    amount: 9.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'entertainment',
    startDate: format(addDays(new Date(), -25), 'yyyy-MM-dd'),
    nextRenewalDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    reminderDaysBefore: 3,
    autoReminder: true,
    isFreeTrial: true,
    trialEndDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    providerIcon: 'appletv',
    status: 'active',
  },
  {
    id: 'sub_youtube',
    name: 'YouTube Premium',
    amount: 13.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'entertainment',
    startDate: format(addDays(new Date(), -22), 'yyyy-MM-dd'),
    nextRenewalDate: format(addDays(new Date(), 8), 'yyyy-MM-dd'),
    reminderDaysBefore: 3,
    autoReminder: true,
    isFreeTrial: true,
    trialEndDate: format(addDays(new Date(), 8), 'yyyy-MM-dd'),
    providerIcon: 'youtubemusic',
    status: 'active',
  },
  {
    id: 'sub_icloud',
    name: 'iCloud+',
    amount: 2.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'cloud',
    startDate: '2023-03-10',
    nextRenewalDate: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    reminderDaysBefore: 3,
    autoReminder: true,
    isFreeTrial: false,
    providerIcon: 'icloud',
    status: 'active',
  },
  {
    id: 'sub_peloton',
    name: 'Peloton',
    amount: 12.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'fitness',
    startDate: '2024-09-01',
    nextRenewalDate: format(addDays(new Date(), 12), 'yyyy-MM-dd'),
    reminderDaysBefore: 5,
    autoReminder: true,
    isFreeTrial: false,
    providerIcon: 'peloton',
    status: 'active',
  },
  {
    id: 'sub_google',
    name: 'Google One',
    amount: 2.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'cloud',
    startDate: '2024-04-01',
    nextRenewalDate: format(addDays(new Date(), 18), 'yyyy-MM-dd'),
    reminderDaysBefore: 3,
    autoReminder: true,
    isFreeTrial: false,
    providerIcon: 'googlecloud',
    status: 'active',
  },
  {
    id: 'sub_apple_music',
    name: 'Apple Music',
    amount: 10.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'music',
    startDate: '2023-11-15',
    nextRenewalDate: format(addDays(new Date(), 25), 'yyyy-MM-dd'),
    reminderDaysBefore: 3,
    autoReminder: true,
    isFreeTrial: false,
    providerIcon: 'apple',
    status: 'active',
  },
  // Productivity — annual billing
  {
    id: 'sub_notion',
    name: 'Notion',
    amount: 96,
    currency: 'USD',
    billingCycle: 'yearly',
    category: 'productivity',
    startDate: '2024-02-10',
    nextRenewalDate: format(addDays(new Date(), 40), 'yyyy-MM-dd'),
    reminderDaysBefore: 7,
    autoReminder: true,
    isFreeTrial: false,
    providerIcon: 'notion',
    status: 'active',
  },
  {
    id: 'sub_figma',
    name: 'Figma',
    amount: 144,
    currency: 'USD',
    billingCycle: 'yearly',
    category: 'productivity',
    startDate: '2024-05-20',
    nextRenewalDate: format(addDays(new Date(), 60), 'yyyy-MM-dd'),
    reminderDaysBefore: 7,
    autoReminder: true,
    isFreeTrial: false,
    providerIcon: 'figma',
    status: 'active',
  },
  {
    id: 'sub_chatgpt',
    name: 'ChatGPT Plus',
    amount: 20,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'productivity',
    startDate: format(addDays(new Date(), -10), 'yyyy-MM-dd'),
    nextRenewalDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
    reminderDaysBefore: 2,
    autoReminder: true,
    isFreeTrial: false,
    providerIcon: 'openai',
    status: 'active',
  },
  // News — weekly billing
  {
    id: 'sub_nyt',
    name: 'NYT Cooking',
    amount: 1.25,
    currency: 'USD',
    billingCycle: 'weekly',
    category: 'news',
    startDate: '2024-08-01',
    nextRenewalDate: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
    reminderDaysBefore: 1,
    autoReminder: true,
    isFreeTrial: false,
    providerIcon: 'newyorktimes',
    status: 'active',
  },
  // Food — custom cycle
  {
    id: 'sub_hellofresh',
    name: 'HelloFresh',
    amount: 59.94,
    currency: 'USD',
    billingCycle: 'custom',
    customCycleDays: 14,
    category: 'food',
    startDate: '2024-10-05',
    nextRenewalDate: format(addDays(new Date(), 9), 'yyyy-MM-dd'),
    reminderDaysBefore: 2,
    autoReminder: true,
    isFreeTrial: false,
    providerIcon: 'hellofresh',
    status: 'active',
  },
  // Paused
  {
    id: 'sub_disney',
    name: 'Disney+',
    amount: 13.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'entertainment',
    startDate: '2023-12-01',
    nextRenewalDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    reminderDaysBefore: 3,
    autoReminder: false,
    isFreeTrial: false,
    providerIcon: 'disneyplus',
    status: 'paused',
  },
  // Trial expiring very soon
  {
    id: 'sub_audible',
    name: 'Audible',
    amount: 14.95,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'entertainment',
    startDate: format(addDays(new Date(), -28), 'yyyy-MM-dd'),
    nextRenewalDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    reminderDaysBefore: 2,
    autoReminder: true,
    isFreeTrial: true,
    trialEndDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    providerIcon: 'audible',
    status: 'active',
  },
  // Cancelled (history)
  {
    id: 'sub_hbo',
    name: 'Max',
    amount: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
    category: 'entertainment',
    startDate: '2023-05-01',
    nextRenewalDate: format(addDays(new Date(), -5), 'yyyy-MM-dd'),
    reminderDaysBefore: 3,
    autoReminder: false,
    isFreeTrial: false,
    providerIcon: 'hbo',
    status: 'cancelled',
  },
];

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set) => ({
      subscriptions: SEED_DATA,

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
      version: 2,
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
      // 1.1 + 1.3: type-safe migration chain. v0/v1 lacked the full seed;
      // we reset to the rich SEED_DATA on upgrade. Future shape changes
      // should add a v3 with a typed PersistedV3 interface — never `as any`.
      migrate: (persistedState, version) => {
        if (version < 2) {
          // Older persisted data had a smaller seed set; reset to the richer
          // demo data so the local dev account showcases every plan/cycle/status.
          return { subscriptions: SEED_DATA };
        }
        return persistedState as { subscriptions: Subscription[] };
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
