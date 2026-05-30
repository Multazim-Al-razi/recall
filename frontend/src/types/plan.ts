export type PlanTier = 'free' | 'basic' | 'pro' | 'max';

export interface PlanFeature {
  label: string;
  /** Tiers at which this feature is available. */
  tiers: PlanTier[];
}

export interface PlanConfig {
  tier: PlanTier;
  name: string;
  /** One-time price in USD. 0 for free. */
  price: number;
  tagline: string;
  /** Headline capabilities shown on the pricing card. */
  highlights: string[];
  /** Max number of tracked subscriptions (Infinity = unlimited). */
  subscriptionLimit: number;
  accent: string;
  popular?: boolean;
}

/**
 * One-time purchase tiers (no recurring billing). Each tier is a strict
 * superset of the previous one.
 */
export const PLAN_ORDER: PlanTier[] = ['free', 'basic', 'pro', 'max'];

export const PLAN_CONFIG: Record<PlanTier, PlanConfig> = {
  free: {
    tier: 'free',
    name: 'Free',
    price: 0,
    tagline: 'Track the essentials.',
    subscriptionLimit: 5,
    accent: '#999999',
    highlights: [
      'Up to 5 subscriptions',
      'Renewal timeline',
      'Monthly spend overview',
    ],
  },
  basic: {
    tier: 'basic',
    name: 'Basic',
    price: 5,
    tagline: 'For the casual subscriber.',
    subscriptionLimit: 25,
    accent: '#42a5f5',
    highlights: [
      'Up to 25 subscriptions',
      'Free-trial alerts',
      'Category breakdown',
      'Cancellation reminders',
    ],
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    price: 10,
    tagline: 'For the power tracker.',
    subscriptionLimit: 100,
    accent: '#d4443a',
    popular: true,
    highlights: [
      'Up to 100 subscriptions',
      'Spending analytics & trends',
      'Savings recommendations',
      'Data export (CSV)',
      'Everything in Basic',
    ],
  },
  max: {
    tier: 'max',
    name: 'Max',
    price: 20,
    tagline: 'The complete picture.',
    subscriptionLimit: Infinity,
    accent: '#1a1a1a',
    highlights: [
      'Unlimited subscriptions',
      'Multi-currency support',
      'Priority insight engine',
      'Custom categories & tags',
      'Forecast & budget goals',
      'Everything in Pro',
    ],
  },
};

/** Full feature matrix for the comparison table on the pricing page. */
export const FEATURE_MATRIX: PlanFeature[] = [
  { label: 'Track subscriptions', tiers: ['free', 'basic', 'pro', 'max'] },
  { label: 'Renewal timeline', tiers: ['free', 'basic', 'pro', 'max'] },
  { label: 'Monthly spend overview', tiers: ['free', 'basic', 'pro', 'max'] },
  { label: 'Free-trial conversion alerts', tiers: ['basic', 'pro', 'max'] },
  { label: 'Category breakdown', tiers: ['basic', 'pro', 'max'] },
  { label: 'Cancellation reminders', tiers: ['basic', 'pro', 'max'] },
  { label: 'Spending analytics & trends', tiers: ['pro', 'max'] },
  { label: 'Savings recommendations', tiers: ['pro', 'max'] },
  { label: 'Data export (CSV)', tiers: ['pro', 'max'] },
  { label: 'Unlimited subscriptions', tiers: ['max'] },
  { label: 'Multi-currency support', tiers: ['max'] },
  { label: 'Custom categories & tags', tiers: ['max'] },
  { label: 'Forecast & budget goals', tiers: ['max'] },
];

export function planRank(tier: PlanTier): number {
  return PLAN_ORDER.indexOf(tier);
}

/** Whether `current` tier includes everything in `required` tier. */
export function planIncludes(current: PlanTier, required: PlanTier): boolean {
  return planRank(current) >= planRank(required);
}
