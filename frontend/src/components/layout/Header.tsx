import { useMemo } from "react";
import { Link } from "react-router";
import { Bell, LifeBuoy, Sun, Moon } from "lucide-react";
import { SyncBadge } from "@/components/ui/SyncBadge";
import { UserMenu } from "@/components/layout/UserMenu";
import { NavMenu } from "@/components/layout/NavMenu";
import { Logo } from "@/components/ui/Logo";
import { useAccountStore } from "@/stores/account";
import {
  useSubscriptionStore,
  getUpcomingRenewals,
  getExpiringTrials,
} from "@/stores/subscription";

function ThemeToggle() {
  const theme = useAccountStore((s) => s.profile.theme);
  const setTheme = useAccountStore((s) => s.setTheme);

  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';

  return (
    <button
      onClick={() => setTheme(next)}
      aria-label={`Switch theme (current: ${theme}, next: ${next})`}
      className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-[var(--color-sidebar-hover)] hover:text-ink"
    >
      {theme === 'dark' ? <Moon size={19} /> : <Sun size={19} />}
    </button>
  );
}

export function Header() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);

  // Real, derived notification count: imminent renewals + expiring trials.
  const alertCount = useMemo(() => {
    const renewals = getUpcomingRenewals(subscriptions, 2).length;
    const trials = getExpiringTrials(subscriptions, 7).length;
    return renewals + trials;
  }, [subscriptions]);

  return (
    <header
      style={{ height: "var(--header-height)" }}
      className="relative z-30 flex shrink-0 items-center justify-between bg-transparent px-5 md:px-6"
    >
      <div className="flex items-center gap-3">
        <NavMenu />
      </div>

      {/* Centered brand */}
      <Link
        to="/dashboard"
        aria-label="Recall home"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <Logo className="text-[20px]" />
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend connection status — full badge on wider screens, compact icon on mobile */}
        <span className="hidden sm:inline-flex">
          <SyncBadge />
        </span>
        <span className="inline-flex sm:hidden">
          <SyncBadge compact />
        </span>

        {/* Support link */}
        <Link
          to="/donate"
          aria-label="Support Recall"
          className="hidden h-9 items-center gap-1.5 rounded-full border border-ink/8 px-3 text-[12px] font-medium text-muted transition-colors hover:border-rausch/30 hover:text-rausch sm:inline-flex"
        >
          <LifeBuoy size={14} />
          Support
        </Link>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications — count reflects real urgent items */}
        <Link
          to="/dashboard/subscriptions"
          aria-label={`${alertCount} items need attention`}
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-[var(--color-sidebar-hover)] hover:text-ink"
        >
          <Bell size={19} />
          {alertCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rausch px-1 text-[10px] font-bold text-white ring-2 ring-[var(--color-header-bg)]">
              {alertCount}
            </span>
          )}
        </Link>

        <UserMenu />
      </div>
    </header>
  );
}
