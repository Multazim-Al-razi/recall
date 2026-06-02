import { differenceInDays } from 'date-fns';
import type { Subscription } from '@/types/subscription';

/**
 * Shared urgency language — the single source of truth for renewal
 * countdown copy across the dashboard, timeline, and reminders.
 */
export type Urgency = 'now' | 'soon' | 'ok';

export const URGENCY_THRESHOLDS = {
  now: 2,
  soon: 7,
} as const;

/** Days from today until a date string (negative = past). */
export function daysUntil(dateStr: string): number {
  return differenceInDays(new Date(dateStr), new Date());
}

/** Classify a renewal/trial date into an urgency band. */
export function urgencyForDays(days: number): Urgency {
  if (days <= URGENCY_THRESHOLDS.now) return 'now';
  if (days <= URGENCY_THRESHOLDS.soon) return 'soon';
  return 'ok';
}

export function urgencyForSubscription(sub: Subscription): Urgency {
  const target = sub.isFreeTrial ? sub.trialEndDate ?? sub.nextRenewalDate : sub.nextRenewalDate;
  return urgencyForDays(daysUntil(target));
}

interface UrgencyStyle {
  /** Solid accent (text / dot). */
  color: string;
  /** Tailwind text class. */
  text: string;
  /** Tailwind background tint class. */
  bg: string;
  /** Tailwind dot background class. */
  dot: string;
  /** Tailwind border class. */
  border: string;
  label: string;
}

export const URGENCY_STYLES: Record<Urgency, UrgencyStyle> = {
  now: {
    color: 'var(--color-rausch)',
    text: 'text-rausch',
    bg: 'bg-rausch/10',
    dot: 'bg-rausch',
    border: 'border-rausch/30',
    label: 'Act now',
  },
  soon: {
    color: 'var(--color-warning)',
    text: 'text-warning',
    bg: 'bg-warning/10',
    dot: 'bg-warning',
    border: 'border-warning/30',
    label: 'Coming up',
  },
  ok: {
    color: 'var(--color-success)',
    text: 'text-success',
    bg: 'bg-success/10',
    dot: 'bg-success',
    border: 'border-success/25',
    label: 'Healthy',
  },
};

/** Human label like "Renews today", "in 3 days", "Mar 14". */
export function renewalLabel(dateStr: string): string {
  const days = daysUntil(dateStr);
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days <= 7) return `in ${days} days`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
