import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CreditCard,
  BarChart3,
  Settings,
  Crown,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { useAccountStore } from '@/stores/account';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
  { path: '/dashboard/upgrade', label: 'Upgrade', icon: Crown },
] as const;

interface Props {
  /** Collapsed state is owned by DashboardLayout so the content area can reflow. */
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const profile = useAccountStore((s) => s.profile);
  const resetAccount = useAccountStore((s) => s.resetAccount);
  const navigate = useNavigate();

  const handleSignOut = () => {
    resetAccount();
    navigate('/');
  };

  const sidebarContent = (isMobile: boolean) => (
    <>
      {/* ------------------------------------------------------------------ */}
      {/*  Logo + collapse toggle                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4">
        {(isMobile || !collapsed) && (
          <NavLink
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
          >
            <Logo className="text-[19px] text-[var(--color-sidebar-text)]" />
          </NavLink>
        )}
        {!isMobile && (
          <button
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="flex h-9 w-9 items-center justify-center rounded-[8px] text-[var(--color-sidebar-text)] transition-colors hover:bg-[var(--color-sidebar-hover)]"
          >
            {collapsed ? <PanelLeftOpen size={22} /> : <PanelLeftClose size={22} />}
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/*  Nav                                                               */}
      {/* ------------------------------------------------------------------ */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/dashboard'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex h-11 items-center gap-3 rounded-[10px] px-3 text-[14px] font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-sidebar-active)] text-rausch'
                  : 'text-[var(--color-sidebar-text)] hover:bg-[var(--color-sidebar-hover)]'
              }`
            }
          >
            <Icon size={22} className="shrink-0" />
            <AnimatePresence mode="wait">
              {(isMobile || !collapsed) && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* ------------------------------------------------------------------ */}
      {/*  Bottom section — user + sign out                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col gap-2 border-t border-[var(--color-sidebar-border)] px-3 py-3">
        <div className="flex items-center gap-3 px-0.5">
          <Avatar className="h-8 w-8" />
          <AnimatePresence mode="wait">
            {(isMobile || !collapsed) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="flex min-w-0 flex-1 items-center justify-between overflow-hidden"
              >
                <span className="truncate text-[13px] font-medium text-[var(--color-sidebar-text)]">
                  {profile.name || 'User'}
                </span>
                <button
                  onClick={handleSignOut}
                  aria-label="Sign out"
                  className="ml-2 shrink-0 text-muted transition-colors hover:text-ink"
                >
                  <LogOut size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ================================================================== */}
      {/*  Mobile hamburger trigger (visible < 744px)                       */}
      {/* ================================================================== */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-bg)] shadow-sm min-[744px]:hidden"
      >
        <Menu size={22} />
      </button>

      {/* ================================================================== */}
      {/*  Desktop sidebar (visible >= 744px)                               */}
      {/* ================================================================== */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="fixed left-0 top-0 z-30 hidden h-screen flex-col border-r border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-bg)] min-[744px]:flex"
      >
        {sidebarContent(false)}
      </motion.aside>

      {/* ================================================================== */}
      {/*  Mobile drawer (visible < 744px)                                  */}
      {/* ================================================================== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm min-[744px]:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed left-0 top-0 z-50 flex h-screen w-[var(--sidebar-width)] flex-col border-r border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-bg)] min-[744px]:hidden"
            >
              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close sidebar"
                className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:text-ink"
              >
                <X size={20} />
              </button>

              {sidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
