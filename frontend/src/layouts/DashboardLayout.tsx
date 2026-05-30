import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router';
import { useAccountStore } from '@/stores/account';
import { useTabsStore } from '@/stores/tabs';
import { DASHBOARD_TITLES } from '@/lib/dashboardRoutes';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { TabBar } from '@/components/layout/TabBar';
import { Footer } from '@/components/layout/Footer';

export function DashboardLayout() {
  const onboarded = useAccountStore((s) => s.onboarded);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const openTab = useTabsStore((s) => s.openTab);

  // Open (or re-activate) a tab for each visited dashboard route.
  useEffect(() => {
    const title = DASHBOARD_TITLES[location.pathname];
    if (title) openTab({ id: location.pathname, title });
  }, [location.pathname, openTab]);

  if (!onboarded) {
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
