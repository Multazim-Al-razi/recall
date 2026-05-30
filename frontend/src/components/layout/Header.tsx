import { useLocation } from 'react-router';
import { Bell } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { DASHBOARD_TITLES } from '@/lib/dashboardRoutes';

export function Header() {
  const location = useLocation();
  const title = DASHBOARD_TITLES[location.pathname] ?? 'Dashboard';

  return (
    <header
      style={{ height: 'var(--header-height)' }}
      className="sticky top-0 z-20 flex shrink-0 items-center justify-between border-b border-[var(--color-sidebar-border)] bg-[var(--color-header-bg)] px-6"
    >
      <h1 className="text-lg font-semibold text-ink">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-[var(--color-sidebar-hover)] hover:text-ink"
        >
          <Bell size={20} />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rausch text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* User avatar */}
        <Avatar className="h-8 w-8" />
      </div>
    </header>
  );
}
