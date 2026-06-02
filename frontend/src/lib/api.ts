/**
 * Recall Backend API Client
 *
 * Provides typed functions for every backend endpoint.
 * Falls back gracefully when the backend is unavailable
 * (local-first mode continues to work via Zustand stores).
 */

// Use relative path so Vite proxy forwards to backend in dev.
// In production, set VITE_API_URL to the deployed backend URL.
const API_BASE = import.meta.env.VITE_API_URL || '/api';

/** Default per-request timeout (ms) so a dead backend never hangs the UI. */
const REQUEST_TIMEOUT = 5000;

/**
 * Normalize a non-2xx response into a friendly `Error` (5.1). The backend
 * returns `{ error: string }` JSON for 4xx; everything else is coerced to
 * a generic message so we never surface raw HTML or stack text to the UI.
 */
async function readErrorBody(res: Response): Promise<string> {
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    try {
      const data = (await res.clone().json()) as { error?: unknown };
      if (typeof data?.error === 'string' && data.error.trim()) {
        return data.error;
      }
    } catch {
      // fall through
    }
  }
  // Avoid leaking HTML / non-JSON bodies.
  return `Request failed (${res.status})`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    ...options,
  });
  if (!res.ok) {
    const message = await readErrorBody(res);
    throw new Error(message);
  }
  return res.json();
}


// ── Subscriptions ─────────────────────────────────────────────────────

export interface ApiSubscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billingCycle: string;
  customCycleDays?: number;
  category: string;
  startDate: string;
  nextRenewalDate: string;
  reminderDaysBefore: number;
  autoReminder: boolean;
  isFreeTrial: boolean;
  trialEndDate?: string;
  providerIcon?: string;
  notes?: string;
  status: string;
}

export const subscriptionsApi = {
  list(status?: string) {
    const qs = status ? `?status=${status}` : '';
    return request<{ subscriptions: ApiSubscription[] }>(`/subscriptions${qs}`);
  },
  get(id: string) {
    return request<ApiSubscription>(`/subscriptions/${id}`);
  },
  create(data: Partial<ApiSubscription>) {
    return request<ApiSubscription>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update(id: string, data: Partial<ApiSubscription>) {
    return request<ApiSubscription>(`/subscriptions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  delete(id: string) {
    return request<{ success: boolean }>(`/subscriptions/${id}`, {
      method: 'DELETE',
    });
  },
};

// ── Account ───────────────────────────────────────────────────────────

export interface ApiAccount {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: string;
  reminderLeadDays: number;
  onboarded: boolean;
  tier: 'local' | 'sync';
}

export const accountApi = {
  get() {
    return request<ApiAccount>('/account');
  },
  update(data: Partial<ApiAccount>) {
    return request<ApiAccount>('/account', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  completeOnboarding(data: { name?: string; email?: string; currency?: string }) {
    return request<ApiAccount>('/account/complete-onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  reset() {
    return request<ApiAccount>('/account/reset', {
      method: 'POST',
    });
  },
  /**
   * Request a plan change. The backend endpoint is a stub today (returns
   * 501 until billing ships). Calling it from the client makes the
   * eventual integration testable in one place.
   *
   * Note: not currently called from the UI — the Sync plan is gated off
   * by `FLAGS.syncPlan = false`. The Cloud card on /pricing renders a
   * disabled "Coming soon" button while this flag is off.
   */
  upgrade(tier: 'local' | 'sync') {
    return request<ApiAccount>('/account/upgrade', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    });
  },
};

// ── Health ────────────────────────────────────────────────────────────

export const healthApi = {
  check() {
    return request<{ status: string; timestamp: string }>('/health');
  },
};
