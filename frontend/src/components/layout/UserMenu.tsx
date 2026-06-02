import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Settings,
  Bell,
  Heart,
  HelpCircle,
  LogOut,
  Monitor,
  Sun,
  Moon,
} from "lucide-react";
import { clsx } from "clsx";
import { useAccountStore } from "@/stores/account";
import {
  useSubscriptionStore,
  getUpcomingRenewals,
  getExpiringTrials,
} from "@/stores/subscription";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/hooks/useAuth";

const THEME_OPTIONS = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export function UserMenu() {
  const profile = useAccountStore((s) => s.profile);
  const setTheme = useAccountStore((s) => s.setTheme);
  const resetAccount = useAccountStore((s) => s.resetAccount);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const alertCount = useMemo(() => {
    const renewals = getUpcomingRenewals(subscriptions, 2).length;
    const trials = getExpiringTrials(subscriptions, 7).length;
    return renewals + trials;
  }, [subscriptions]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    resetAccount();
    navigate("/");
  };

  const close = () => setOpen(false);

  return (
    <div ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-full"
      >
        <Avatar
          className={clsx(
            "h-8 w-8 ring-2 transition-all",
            open ? "ring-rausch/40" : "ring-transparent hover:ring-rausch/30",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            role="menu"
            className="glass absolute right-0 top-full z-50 mt-2 w-[284px] overflow-hidden rounded-[20px] border border-ink/8 p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.16)]"
          >
            {/* Identity header */}
            <div className="flex items-center gap-3 rounded-[14px] px-2.5 py-2.5">
              <Avatar className="h-10 w-10" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-semibold text-ink">
                  {profile.name || "User"}
                </p>
                <p className="truncate text-[12px] text-muted">
                  {profile.email || "Local account"}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-rausch/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[1px] text-rausch">
                Free
              </span>
            </div>

            <div className="my-1 h-px bg-ink/6" />

            {/* Theme switcher */}
            <div className="px-2.5 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-muted">
                Appearance
              </span>
              <div className="mt-2 flex gap-1 rounded-[12px] bg-ink/5 p-1">
                {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const active = profile.theme === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTheme(value)}
                      aria-pressed={active}
                      className={clsx(
                        "relative flex flex-1 flex-col items-center gap-1 rounded-[9px] py-2 text-[11px] font-medium transition-colors",
                        active ? "text-rausch" : "text-muted hover:text-ink",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="theme-active-pill"
                          className="absolute inset-0 rounded-[9px] bg-surface shadow-[var(--shadow-xs)]"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 32,
                          }}
                        />
                      )}
                      <Icon size={16} className="relative" />
                      <span className="relative">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="my-1 h-px bg-ink/6" />

            {/* Profile group */}
            <div className="flex flex-col">
              <MenuLink
                to="/dashboard/settings"
                icon={<UserIcon size={16} />}
                label="Your profile"
                onClick={close}
              />
              <MenuLink
                to="/dashboard/settings"
                icon={<Settings size={16} />}
                label="Settings"
                onClick={close}
              />
              <MenuLink
                to="/dashboard/subscriptions"
                icon={<Bell size={16} />}
                label="Notifications"
                onClick={close}
                badge={alertCount > 0 ? alertCount : undefined}
              />
            </div>

            <div className="my-1 h-px bg-ink/6" />

            {/* Support group */}
            <div className="flex flex-col">
              <MenuLink
                to="/donate"
                icon={<Heart size={16} />}
                label="Support us"
                onClick={close}
              />
              <MenuLink
                to="/about#faq"
                icon={<HelpCircle size={16} />}
                label="Help & FAQ"
                onClick={close}
              />
            </div>

            <div className="my-1 h-px bg-ink/6" />

            {/* Account */}
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-[13px] font-medium text-rausch transition-colors hover:bg-rausch/8"
            >
              <span className="shrink-0">
                <LogOut size={16} />
              </span>
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MenuLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  badge?: number;
}

function MenuLink({ to, icon, label, onClick, badge }: MenuLinkProps) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-ink/5"
    >
      <span className="shrink-0 text-muted">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rausch px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      )}
    </Link>
  );
}
