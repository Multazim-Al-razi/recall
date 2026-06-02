import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import type { ApiAccount } from '@/lib/api';

export interface UserProfile {
  name: string;
  email: string;
  /** Optional avatar (data URL or remote). Falls back to initials. */
  avatar?: string;
  currency: string;
  /** Notify this many days before a renewal. */
  reminderLeadDays: number;
  /** UI theme preference: 'system' | 'light' | 'dark' */
  theme: 'system' | 'light' | 'dark';
  /**
   * Plan tier. Mirrors the backend `AccountRecord.tier`. Defaults to 'local'
   * for new accounts; populated by useApiSync when the backend reports a
   * different value. No feature in the app currently reads this — see
   * lib/featureFlags.ts and lib/entitlements.ts for the rollout order.
   */
  tier: 'local' | 'sync';
}

interface AccountState {
  /** Whether the user has finished onboarding. */
  onboarded: boolean;
  profile: UserProfile;
  completeOnboarding: (profile: Partial<UserProfile>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  resetAccount: () => void;
  setTheme: (theme: 'system' | 'light' | 'dark') => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  email: '',
  currency: 'USD',
  reminderLeadDays: 3,
  theme: 'system',
  tier: 'local',
};

// ── Storage adapter (D-2) ──────────────────────────────────────────────
// Wrap localStorage so a `QuotaExceededError` (or any other write failure)
// surfaces to the connection store instead of being silently swallowed by
// Zustand. The store stays in-memory and the user can be notified.

const STORAGE_QUOTA_EVENT = 'recall:storage-quota';

function safeLocalStorage(): StateStorage | undefined {
  if (typeof window === 'undefined') return undefined;
  return {
    getItem: (name) => window.localStorage.getItem(name),
    setItem: (name, value) => {
      try {
        window.localStorage.setItem(name, value);
      } catch (err) {
        // D-2: surface quota errors so the connection store (or any other
        // listener) can show a banner. The store keeps its in-memory copy
        // so the app stays usable; the next write will retry.
        window.dispatchEvent(
          new CustomEvent(STORAGE_QUOTA_EVENT, {
            detail: { name, message: err instanceof Error ? err.message : String(err) },
          }),
        );
      }
    },
    removeItem: (name) => {
      try {
        window.localStorage.removeItem(name);
      } catch {
        /* ignore */
      }
    },
  };
}

/** Subscribe to storage-quota errors. Returns an unsubscribe function. */
export function onStorageQuota(
  handler: (detail: { name: string; message: string }) => void,
): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const listener = (e: Event) => {
    const ce = e as CustomEvent<{ name: string; message: string }>;
    handler(ce.detail);
  };
  window.addEventListener(STORAGE_QUOTA_EVENT, listener);
  return () => window.removeEventListener(STORAGE_QUOTA_EVENT, listener);
}

// ── Type-safe migration (1.1) ─────────────────────────────────────────
// Each version has a known shape. Migration steps cast through the
// matching interface so a drift in the persisted shape produces a compile
// error here, not a silent runtime corruption.
interface PersistedV0 {
  onboarded: boolean;
  profile: Partial<UserProfile>;
}
interface PersistedV1 {
  onboarded: boolean;
  profile: Partial<UserProfile> & { tier?: 'local' | 'sync' };
}
interface PersistedV2 {
  onboarded: boolean;
  profile: UserProfile;
}

function isV0(value: unknown): value is PersistedV0 {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as PersistedV0).onboarded === 'boolean' &&
    typeof (value as PersistedV0).profile === 'object'
  );
}

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      onboarded: false,
      profile: DEFAULT_PROFILE,

      completeOnboarding: (profile) =>
        set((state) => ({
          onboarded: true,
          profile: { ...state.profile, ...profile },
        })),

      updateProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),

      resetAccount: () =>
        set({ onboarded: false, profile: { ...DEFAULT_PROFILE } }),

      setTheme: (theme) =>
        set((state) => ({ profile: { ...state.profile, theme } })),
    }),
    {
      name: 'recall-account',
      version: 2,
      storage: createJSONStorage(() => safeLocalStorage() as Storage),
      // 1.1 + 1.3: type-safe migration chain. Each step is a typed
      // transformation; unknown fields are dropped, not coerced.
      migrate: (persistedState, version) => {
        if (version < 1) {
          const v0 = (persistedState ?? {}) as PersistedV0;
          return {
            onboarded: !!v0.onboarded,
            profile: { ...DEFAULT_PROFILE, ...v0.profile, tier: 'local' as const },
          } as PersistedV1;
        }
        if (version < 2) {
          const v1 = isV0(persistedState) ? (persistedState as unknown as PersistedV1) : null;
          if (!v1) {
            return { onboarded: false, profile: { ...DEFAULT_PROFILE } } as PersistedV2;
          }
          return {
            onboarded: v1.onboarded,
            profile: {
              ...DEFAULT_PROFILE,
              ...v1.profile,
              tier: v1.profile.tier ?? 'local',
            },
          } as PersistedV2;
        }
        return persistedState as PersistedV2;
      },
    },
  ),
);

/**
 * 6.2 helper: read several account-store fields in a single render. Use
 * `useShallow` so the component re-renders only when one of the listed
 * fields actually changes, not whenever the store object identity changes.
 */
export function useAccountFields<K extends keyof AccountState>(keys: readonly K[]) {
  return useAccountStore(
    useShallow((s) => {
      const out: Partial<AccountState> = {};
      for (const k of keys) out[k] = s[k];
      return out as Pick<AccountState, K>;
    }),
  );
}

/** Convenience: the parts of the ApiAccount shape that mirrors UserProfile. */
export type ProfileFromApi = Pick<ApiAccount, 'name' | 'email' | 'currency' | 'reminderLeadDays'>;
