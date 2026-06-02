import { create } from 'zustand';
import type { UserProfile } from '@/stores/account';
import type { ApiAccount } from '@/lib/api';

export type SyncStatus = 'connecting' | 'online' | 'offline' | 'error';

export interface SyncConflict {
  local: Pick<UserProfile, 'name' | 'email'>;
  remote: Pick<ApiAccount, 'name' | 'email'>;
  /** Wall-clock time the conflict was detected. */
  detectedAt: string;
}

interface ConnectionState {
  status: SyncStatus;
  /** ISO timestamp of the last successful sync, if any. */
  lastSyncedAt: string | null;
  /** True once the initial sync attempt has resolved (online or offline). */
  initialized: boolean;
  /** Last sync error message, if any. Cleared on a successful sync. */
  lastSyncError: string | null;
  /** Backend reports a different identity than the local one (F-4). */
  conflict: SyncConflict | null;
  setStatus: (status: SyncStatus) => void;
  markSynced: () => void;
  recordSyncError: (message: string) => void;
  setSyncConflict: (conflict: SyncConflict) => void;
  clearSyncConflict: () => void;
}

/**
 * Tracks the live connection to the optional Express backend.
 *
 * The app is local-first: when `status === 'offline'` everything still works
 * from the persisted Zustand stores. This store drives a small status
 * indicator + retry affordance so the user knows whether their data is being
 * mirrored to the backend, and surfaces sync errors + identity conflicts
 * (F-4) without silently clobbering local data.
 */
export const useConnectionStore = create<ConnectionState>((set) => ({
  status: 'connecting',
  lastSyncedAt: null,
  initialized: false,
  lastSyncError: null,
  conflict: null,
  setStatus: (status) =>
    set({
      status,
      initialized: status !== 'connecting' ? true : false,
      // When we go offline / error, surface the reason if we have one. A
      // successful status transition clears the error.
      lastSyncError: status === 'online' ? null : undefined,
    }),
  markSynced: () =>
    set({
      status: 'online',
      initialized: true,
      lastSyncedAt: new Date().toISOString(),
      lastSyncError: null,
    }),
  recordSyncError: (message) =>
    set({ lastSyncError: message, status: 'error' }),
  setSyncConflict: (conflict) =>
    set({
      conflict: { ...conflict, detectedAt: new Date().toISOString() },
    }),
  clearSyncConflict: () => set({ conflict: null }),
}));
