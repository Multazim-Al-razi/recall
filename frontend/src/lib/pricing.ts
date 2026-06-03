/**
 * Pricing — the single source of truth for Recall's plans.
 *
 * Recall is free during early access. The local web app is free forever.
 * Cloud (reminders across devices) is also free during early access.
 * We measure download metrics to evaluate the product, but we never sell
 * personal data or share it with data brokers on any plan.
 */

export interface Plan {
  /** Stable key for selection / analytics. */
  id: 'local' | 'sync';
  name: string;
  price: string;
  cadence: string;
  /** One-line promise. */
  tagline: string;
  /** Longer description for the Pricing page. */
  description: string;
  features: string[];
  /** The visual hero of the grid — the plan we point people toward. */
  featured: boolean;
  /** Pill label shown on the featured card. */
  badge?: string;
  /** CTA label + destination. */
  cta: { label: string; to: string };
}

export const PLANS: Plan[] = [
  {
    id: 'local',
    name: 'Local',
    price: 'Free',
    cadence: '',
    tagline: 'Runs in your browser. Nothing to install.',
    description:
      'The full Recall experience with nothing held back. Track every subscription, see your true monthly burn, read your category breakdown, and catch renewals before they bill, all stored on your own device. No account, no sign-up, no upload. This is Recall as it was meant to be used.',
    features: [
      'All tracking, charts & insights',
      'Unlimited subscriptions',
      'In-app renewal & trial alerts',
      'Calendar (.ics) export for reminders',
      'No account, no sign-up',
      'Your data never leaves the device',
    ],
    featured: false,
    cta: { label: 'Get started', to: '/onboarding' },
  },
  {
    id: 'sync',
    name: 'Cloud',
    price: 'Free',
    cadence: '',
    tagline: 'Reminders that reach you, even with the tab closed.',
    description:
      'Everything in Local, plus the one thing a closed browser tab cannot do: wake itself up to remind you. Cloud runs a server around the clock so renewal alerts arrive by email and push wherever you are, and your subscriptions stay mirrored across every device.',
    features: [
      'Everything in Local',
      'Email & push renewal reminders',
      'Multi-device sync',
      'Reminders even when the tab is closed',
    ],
    featured: true,
    cta: { label: 'Sign up', to: '/onboarding' },
  },
];

/** A single cell in the comparison table — a checkmark, a dash, or a note. */
export type CompareCell = boolean | string;

export interface CompareRow {
  feature: string;
  local: CompareCell;
  sync: CompareCell;
}

export const COMPARISON: CompareRow[] = [
  { feature: 'Unlimited subscriptions', local: true, sync: true },
  { feature: 'Spending analytics & insights', local: true, sync: true },
  { feature: 'In-app renewal & trial alerts', local: true, sync: true },
  { feature: 'Calendar (.ics) export', local: true, sync: true },
  { feature: 'No account / sign-up', local: true, sync: false },
  { feature: 'Email & push reminders', local: false, sync: true },
  { feature: 'Reminders with the tab closed', local: false, sync: true },
  { feature: 'Multi-device sync', local: false, sync: true },
  { feature: 'Works fully offline', local: true, sync: false },
  { feature: 'Price', local: 'Free', sync: 'Free' },
];

/** Pricing-specific questions. The broader FAQ lives on the About page. */
export const PRICING_FAQ: { q: string; a: string }[] = [
  {
    q: 'Is everything really free?',
    a: 'Yes — during early access, Local web use is free forever, Cloud is also free. When server costs make a fee, it will be small, honest, and transparent, and there are no hidden tiers.',
  },
  {
    q: 'Is the free Local plan limited or a trial?',
    a: 'Neither. Local is the complete app with unlimited subscriptions, every chart, and every insight, free for as long as you use it. Cloud only adds cross-device reminders on top.',
  },
  {
    q: 'Do you sell my data on any plan?',
    a: 'Never. Your subscription data is yours. On Local it never leaves your browser; on Sync it is stored only so reminders can reach you. We measure download metrics to evaluate the product, but we never sell personal data or share with data brokers on any plan.',
  },
  {
    q: 'Can I switch between Local and Cloud?',
    a: 'Yes. You can start with Local and add Cloud later, or switch back to Local at any time. Your data stays on your device either way.',
  },
];
