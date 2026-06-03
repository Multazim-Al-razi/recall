/**
 * Lightweight telemetry client — sends anonymized events to the backend
 * so the operator can track product health after launch.
 *
 * Events carry NO user-identifying data: no names, emails, or specific
 * subscription details. Only the event type, a category bucket, and an
 * amount-range bucket are transmitted.
 */

import { getActiveApiBaseUrl } from './environment';

const REQUEST_TIMEOUT = 3000;

type TelemetryEvent =
  | 'subscription_created'
  | 'subscription_cancelled'
  | 'subscription_paused'
  | 'subscription_resumed'
  | 'onboarding_completed'
  | 'reminder_sent';

/** Buckets amounts into broad ranges to avoid transmitting exact spend. */
function bucketAmount(amount: number): string {
  if (amount <= 5) return '0-5';
  if (amount <= 15) return '5-15';
  if (amount <= 30) return '15-30';
  if (amount <= 50) return '30-50';
  if (amount <= 100) return '50-100';
  return '100+';
}

export interface TelemetryPayload {
  event: TelemetryEvent;
  category?: string;
  amountBucket?: string;
  timestamp: string;
}

/**
 * Fire-and-forget telemetry event. Never blocks UI; silently drops
 * on network failure (local-first design).
 */
export async function trackEvent(
  event: TelemetryEvent,
  meta?: { category?: string; amount?: number },
): Promise<void> {
  try {
    const apiBase = await getActiveApiBaseUrl();
    const url = apiBase ? `${apiBase}/api/stats/event` : '/api/stats/event';

    const payload: TelemetryPayload = {
      event,
      category: meta?.category,
      amountBucket: meta?.amount ? bucketAmount(meta.amount) : undefined,
      timestamp: new Date().toISOString(),
    };

    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
  } catch {
    // Fire-and-forget — never block the user
  }
}
