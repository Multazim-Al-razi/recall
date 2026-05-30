import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlanTier } from '@/types/plan';

export interface UserProfile {
  name: string;
  email: string;
  /** Optional avatar (data URL or remote). Falls back to initials. */
  avatar?: string;
  currency: string;
  /** Notify this many days before a renewal. */
  reminderLeadDays: number;
}

interface AccountState {
  /** Whether the user has finished onboarding. */
  onboarded: boolean;
  profile: UserProfile;
  plan: PlanTier;
  completeOnboarding: (profile: Partial<UserProfile>) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setPlan: (plan: PlanTier) => void;
  resetAccount: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  email: '',
  currency: 'USD',
  reminderLeadDays: 3,
};

export const useAccountStore = create<AccountState>()(
  persist(
    (set) => ({
      onboarded: false,
      profile: DEFAULT_PROFILE,
      plan: 'free',

      completeOnboarding: (profile) =>
        set((state) => ({
          onboarded: true,
          profile: { ...state.profile, ...profile },
        })),

      updateProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),

      setPlan: (plan) => set({ plan }),

      resetAccount: () =>
        set({ onboarded: false, profile: DEFAULT_PROFILE, plan: 'free' }),
    }),
    { name: 'recall-account' }
  )
);

