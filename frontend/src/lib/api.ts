/**
 * Recall Backend API Client
 *
 * Provides typed functions for every backend endpoint.
 * Dynamically routes to the local CLI companion if available,
 * otherwise falls back to the cloud backend.
 */
import { getActiveApiBaseUrl } from './environment';
import { supabase } from './supabaseClient';

let cachedApiBase: string | null = null;

async function getApiBase(): Promise<string> {
  if (cachedApiBase !== null) return cachedApiBase;
  cachedApiBase = await getActiveApiBaseUrl();
  return cachedApiBase;
}

/** Default per-request timeout (ms) so a dead backend never hangs the UI. */
const REQUEST_TIMEOUT = 5000;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const apiBase = await getApiBase();
  // Ensure path starts with /api if apiBase is empty (cloud mode relative path)
  const fullPath = apiBase ? `${apiBase}/api${path}` : `/api${path}`;

  // Attach Supabase JWT as Authorization header when available.
  const session = supabase ? await supabase.auth.getSession() : null;
  const authHeader: Record<string, string> =
    session?.data.session?.access_token
      ? { Authorization: `Bearer ${session.data.session.access_token}` }
      : {};

  const res = await fetch(fullPath, {
    headers: { 'Content-Type': 'application/json', ...authHeader },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || `API error: ${res.status}`);
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
  paymentMethodId?: string;
  cancellationDifficulty?: string;
  autoRenews?: boolean;
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
};

// ── Payment Methods ────────────────────────────────────────────────

export interface ApiPaymentMethod {
  id: string;
  label: string;
  brand: string;
  last4: string;
  color: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export const paymentMethodsApi = {
  list() {
    return request<{ paymentMethods: ApiPaymentMethod[] }>('/payment-methods');
  },
  create(data: Partial<ApiPaymentMethod>) {
    return request<ApiPaymentMethod>('/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  update(id: string, data: Partial<ApiPaymentMethod>) {
    return request<ApiPaymentMethod>(`/payment-methods/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
  delete(id: string) {
    return request<{ success: boolean }>(`/payment-methods/${id}`, {
      method: 'DELETE',
    });
  },
};

// ── Stats ──────────────────────────────────────────────────────────────

export interface ApiStats {
  mode: 'lowdb' | 'supabase';
  note?: string;
  totalUsers: number;
  activeSubscriptions: number;
  totalSubscriptions?: number;
  totalMonthlyBurn: number;
  avgMonthlyBurnPerUser?: number;
  yearlyProjection: number;
  categoryBurn: Record<string, number>;
  renewalsNext7d: number;
  renewalsNext30d: number;
  activeFreeTrials: number;
  onboarded?: boolean;
  timestamp: string;
}

export const statsApi = {
  get() {
    return request<ApiStats>('/stats');
  },
};

// ── Health ────────────────────────────────────────────────────────────

export const healthApi = {
  check() {
    return request<{ status: string; timestamp: string }>('/health');
  },
};
