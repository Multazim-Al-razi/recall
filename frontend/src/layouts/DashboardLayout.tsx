import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import { useAccountStore } from '@/stores/account';
import { useConnectionStore } from '@/stores/connection';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { QuickCheckinModal } from '@/components/dashboard/QuickCheckinModal';

/**
 * Dashboard chrome — sidebar, header, tab bar (mounted inside the layout's
 * `<main>` by the parent route config).
 *
 * F-4: when the backend reports a different identity than the local one,
 * a banner is shown at the top of the dashboard so the user can resolve
 * the conflict instead of having their data silently overwritten.
 *
 * 5.3: transient sync errors are surfaced as a non-blocking banner with
 * a retry button. Persistent offline status gets its own small indicator
 * in the header.
 */
export function DashboardLayout() {
  const conflict = useConnectionStore((s) => s.conflict);
  const lastSyncError = useConnectionStore((s) => s.lastSyncError);
  const status = useConnectionStore((s) => s.status);
  const lastSyncedAt = useConnectionStore((s) => s.lastSyncedAt); // triggers re-sync via key

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const clearConflict = useConnectionStore((s) => s.clearSyncConflict);

  // Auto-dismiss the error banner on a successful sync.
  useEffect(() => {
    if (status === 'online') setBannerDismissed(false);
  }, [status]);

  // Re-mount key — flip on each successful sync so the children re-render
  // with fresh data without us having to thread a refetch through props.
  const syncKey = lastSyncedAt ?? 'never';

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <div className="flex flex-1 flex-col overflow-y-auto">
        <Header />

        {/* F-4: identity conflict banner */}
        {conflict && !bannerDismissed && (
          <div
            role="alert"
            className="border-b border-rausch/20 bg-rausch/8 px-6 py-3 text-[13px] text-rausch"
          >
            <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2">
              <div>
                <strong className="font-semibold">Sync conflict:</strong> the
                backend reports a different account ({conflict.remote.name || '—'}
                {' · '}
                {conflict.remote.email || '—'}) than this device (
                {conflict.local.name || '—'}
                {' · '}
                {conflict.local.email || '—'}). Local data has been preserved.
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => clearConflict()}
                  className="rounded-full border border-rausch/30 bg-canvas px-3 py-1 text-[12px] font-medium text-rausch transition-colors hover:bg-rausch/10"
                >
                  Keep mine
                </button>
                <button
                  onClick={() => {
                    // Adopt the remote identity. A full re-sync will follow
                    // because the key below changes.
                    useAccountStore.getState().updateProfile({
                      name: conflict.remote.name,
                      email: conflict.remote.email,
                    });
                    clearConflict();
                  }}
                  className="rounded-full bg-rausch px-3 py-1 text-[12px] font-semibold text-white transition-colors hover:bg-rausch-hover"
                >
                  Use theirs
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5.3: transient sync error banner */}
        {lastSyncError && !conflict && !bannerDismissed && (
          <div
            role="status"
            className="border-b border-warning/20 bg-warning/8 px-6 py-2 text-[12px] text-warning"
          >
            <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2">
              <span>Sync paused: {lastSyncError}. Local data is up to date.</span>
              <button
                onClick={() => setBannerDismissed(true)}
                className="rounded-full border border-warning/30 px-2 py-0.5 text-[11px] font-medium text-warning transition-colors hover:bg-warning/10"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <main id="main-content" className="flex-1" key={syncKey}>
          <ErrorBoundary scope="dashboard">
            <Outlet />
          </ErrorBoundary>
        </main>
        <Footer />
        <QuickCheckinModal />
      </div>
    </div>
  );
}
