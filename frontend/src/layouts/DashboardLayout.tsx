import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router';
import { useAccountStore } from '@/stores/account';
import { useTabsStore } from '@/stores/tabs';
import { DASHBOARD_TITLES } from '@/lib/dashboardRoutes';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { TabBar } from '@/components/layout/TabBar';
import { Footer } from '@/components/layout/Footer';
import { supabase } from '@/lib/supabaseClient';

export function DashboardLayout() {
  const onboarded = useAccountStore((s) => s.onboarded);
  const [collapsed, setCollapsed] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const location = useLocation();
  const openTab = useTabsStore((s) => s.openTab);

  // Check Supabase auth session (Workstream 2). The dashboard requires
  // a valid session when DB_BACKEND=supabase. In lowdb mode, the local
  // onboarded boolean is still the gate.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(data.session !== null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setHasSession(session !== null);
      },
    );
    return () => subscription.unsubscribe();
  }, []);

  // Open (or re-activate) a tab for each visited dashboard route.
  useEffect(() => {
    const title = DASHBOARD_TITLES[location.pathname];
    if (title) openTab({ id: location.pathname, title });
  }, [location.pathname, openTab]);

  // If Supabase auth is required (FLAGS.syncPlan or DB_BACKEND=supabase),
  // redirect to login when there's no session. Otherwise, fall back to
  // the local onboarded check for pure-local mode.
  if (hasSession === null) {
    // Still loading session state — show nothing (prevents flash).
    return null;
  }

  if (!hasSession && !onboarded) {
    // No Supabase session and not locally onboarded → go to login.
    return <Navigate to="/login" replace />;
  }

  if (!onboarded && hasSession) {
    // Have a Supabase session but haven't done local onboarding →
    // let them through (they'll complete onboarding in the dashboard).
  }

  if (!onboarded && !hasSession) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-canvas">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div
        className={`flex flex-1 flex-col overflow-hidden transition-[margin] duration-200 ease-in-out ${
          collapsed
            ? 'min-[744px]:ml-[var(--sidebar-collapsed-width)]'
            : 'min-[744px]:ml-[var(--sidebar-width)]'
        }`}
      >
        <Header />
        <TabBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
