/**
 * Recall is completely free — every user gets full access to all features
 * with no subscription limits. The plan config is kept as a lightweight
 * constant so dashboard widgets that still reference it continue to work.
 */

export type PlanTier = 'community';

export interface PlanConfig {
  tier: PlanTier;
  name: string;
  tagline: string;
  accent: string;
  /** No limits — always Infinity. */
  subscriptionLimit: number;
}

/** The single plan every user gets. */
export const PLAN_ORDER: PlanTier[] = ['community'];

export const PLAN_CONFIG: Record<PlanTier, PlanConfig> = {
  community: {
    tier: 'community',
    name: 'Local',
    tagline: 'Free on the web, all features in your browser.',
    accent: '#66bb6a',
    subscriptionLimit: Infinity,
  },
};

export function planRank(_tier: PlanTier): number {
  return 0;
}