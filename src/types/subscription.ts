export type Category =
  | 'entertainment'
  | 'productivity'
  | 'fitness'
  | 'music'
  | 'cloud'
  | 'news'
  | 'food'
  | 'other';

export type BillingCycle = 'monthly' | 'yearly' | 'weekly' | 'custom';

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: BillingCycle;
  customCycleDays?: number;
  category: Category;
  startDate: string;
  nextRenewalDate: string;
  reminderDaysBefore: number;
  autoReminder: boolean;
  isFreeTrial: boolean;
  trialEndDate?: string;
  providerIcon?: string;
  notes?: string;
  status: SubscriptionStatus;
}

export const CATEGORY_CONFIG: Record<Category, { label: string; gradient: string }> = {
  entertainment: { label: 'Entertainment', gradient: 'linear-gradient(135deg, #fde8e8, #fff5f5)' },
  productivity: { label: 'Productivity', gradient: 'linear-gradient(135deg, #e8e8f5, #f0f0ff)' },
  fitness: { label: 'Fitness', gradient: 'linear-gradient(135deg, #e8f0f5, #f0f8ff)' },
  music: { label: 'Music', gradient: 'linear-gradient(135deg, #e8f5e8, #f0fff0)' },
  cloud: { label: 'Cloud', gradient: 'linear-gradient(135deg, #e8f5f0, #f0fff8)' },
  news: { label: 'News', gradient: 'linear-gradient(135deg, #fff0e0, #fff8f0)' },
  food: { label: 'Food', gradient: 'linear-gradient(135deg, #f5f0e8, #fff8f0)' },
  other: { label: 'Other', gradient: 'linear-gradient(135deg, #f0f0f0, #f8f8f8)' },
};

export const CATEGORY_COLORS: Record<Category, string> = {
  entertainment: '#d4443a',
  productivity: '#1a1a1a',
  fitness: '#888888',
  music: '#66bb6a',
  cloud: '#42a5f5',
  news: '#ffa726',
  food: '#ef5350',
  other: '#cccccc',
};
