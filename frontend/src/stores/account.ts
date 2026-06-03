import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  /** Which onboarding path the user completed (null until onboarding finishes). */
  setupPath: 'local' | 'cli' | 'cloud' | null;
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
  setupPath: null,
};

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
        set({ onboarded: false, profile: DEFAULT_PROFILE }),

      setTheme: (theme) =>
        set((state) => ({ profile: { ...state.profile, theme } })),
    }),
    { name: 'recall-account' }
  )
);