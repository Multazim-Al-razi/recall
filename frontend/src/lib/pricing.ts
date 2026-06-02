import { Bell, HardDrive, type LucideIcon } from 'lucide-react';

/**
 * Pricing — the single source of truth for Recall's plans.
 *
 * The product pivot: Recall is free and local-first on the web (and free
 * forever on mobile). The only thing that carries a real, recurring cost is
 * delivering reminders to a closed browser tab — that needs a server running
 * around the clock. The optional Cloud plan ($1.99/mo) pays for exactly that,
 * and nothing more. No ads, no data selling, on any plan.
 *
 * The Pricing page, the About summary, and the dashboard plan cards all read
 * from here so the story never drifts across surfaces.
 */

export interface Plan {
  /** Stable key for selection / analytics. */
  id: 'free' | 'cloud';
  name: string;
  price: string;
  cadence: string;
  icon: LucideIcon;
  /** One-line promise. */
  tagline: string;
  /** Longer, verbose description for the Pricing page. */
  description: string;
  features: string[];
  /** The visual hero of the grid — the plan we point people toward. */
  featured: boolean;
  /** Pill label shown on the featured card. */
  badge?: string;
  /** CTA label + destination. */
  cta: { label: string; to: string };
  /** Availability note shown under the price. */
  availability: string;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 'Free',
    cadence: '',
    icon: HardDrive,
    tagline: 'Everything runs in your browser.',
    description:
      'The full Recall experience with nothing held back. Track every subscription, see your true monthly burn, read your category breakdown, and catch renewals before they bill — all stored on your own device. No account, no sign-up, no upload. This is Recall as it was meant to be used.',
    features: [
      'All tracking & insights',
      'Unlimited subscriptions',
      'Renewal & trial alerts',
      'Calendar export',
    ],
    featured: false,
    cta: { label: 'Start free', to: '/onboarding' },
    availability: 'Available now',
  },
  {
    id: 'cloud',
    name: 'Cloud',
    price: '$1.99',
    cadence: '/mo',
    icon: Bell,
    tagline: 'Reminders that reach you, even with the tab closed.',
    description:
      'Everything in Free, plus the one thing a closed browser tab genuinely cannot do: wake itself up to remind you. Cloud runs a server around the clock so renewal alerts arrive by email and push wherever you are, and your subscriptions stay mirrored across every device. The $1.99/mo covers that real cost — and nothing more.',
    features: [
      'Everything in Free',
      'Email & push reminders',
      'Multi-device sync',
      'Cancel anytime',
    ],
    featured: true,
    cta: { label: 'Start free, add Cloud later', to: '/onboarding' },
    availability: 'Optional · cancel anytime',
  },
];

/** A single cell in the comparison table — a checkmark, a dash, or a note. */
export type CompareCell = boolean | string;

export interface CompareRow {
  feature: string;
  free: CompareCell;
  cloud: CompareCell;
}

export const COMPARISON: CompareRow[] = [
  { feature: 'Unlimited subscriptions', free: true, cloud: true },
  { feature: 'Spending analytics & insights', free: true, cloud: true },
  { feature: 'In-app renewal & trial alerts', free: true, cloud: true },
  { feature: 'Calendar (.ics) export', free: true, cloud: true },
  { feature: 'No account / sign-up', free: true, cloud: false },
  { feature: 'Email & push reminders', free: false, cloud: true },
  { feature: 'Reminders with the tab closed', free: false, cloud: true },
  { feature: 'Multi-device sync', free: false, cloud: true },
  { feature: 'Works fully offline', free: true, cloud: false },
  { feature: 'Price', free: 'Free', cloud: '$1.99/mo' },
];

/** Pricing-specific questions. The broader FAQ lives on the About page. */
export const PRICING_FAQ: { q: string; a: string }[] = [
  {
    q: 'Why does the Cloud plan cost money if Recall is free?',
    a: "A browser tab that's closed can't wake itself up to remind you — that needs a server running around the clock, which has a real cost. The $1.99/mo Cloud plan pays for exactly that: reliable reminder delivery and multi-device sync. We charge a small honest amount rather than show ads or sell data. Free web use stays free, forever.",
  },
  {
    q: 'Is the Free plan limited or a trial?',
    a: 'Neither. Free is the complete app — unlimited subscriptions, every chart, every insight — free for as long as you use it. Cloud only adds cloud-delivered reminders and cross-device mirroring on top.',
  },
  {
    q: 'Do you sell my data on any plan?',
    a: 'Never. Your subscription data is yours. On Free it never leaves your browser; on Cloud it is stored only so reminders can reach you. We have no ads and no data-broker relationships on any plan.',
  },
  {
    q: 'Can I cancel Cloud whenever I want?',
    a: "Yes. Cloud is month-to-month with no lock-in. Cancel anytime and you drop straight back to the Free plan with all your data intact.",
  },
];
