import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, format } from 'date-fns';
import type { Subscription } from '@/types/subscription';
import { useAccountStore } from '@/stores/account';
import { PLAN_CONFIG } from '@/types/plan';

interface SubscriptionState {
  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
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

      addSubscription: (sub) =>
        set((state) => {
          // Enforce the active plan's limit (only active subscriptions count).
          const limit = PLAN_CONFIG[useAccountStore.getState().plan].subscriptionLimit;
          const activeCount = state.subscriptions.filter((s) => s.status === 'active').length;
          if (sub.status === 'active' && activeCount >= limit) {
            return state;
          }
          return {
            subscriptions: [...state.subscriptions, { ...sub, id: generateId() }],
          };
        }),

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
      // Older persisted data had a smaller seed set; reset to the richer demo
      // data so the local dev account showcases every plan/cycle/status.
      migrate: (_persisted, version) => {
        if (version < 2) return { subscriptions: SEED_DATA };
        return _persisted as { subscriptions: Subscription[] };
      },
    }
  )
);

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
    const left = Math.ceil((end.getTime() - Date.now()) / 86_400_000);
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
