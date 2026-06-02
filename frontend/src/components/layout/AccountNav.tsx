import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Settings, LogOut, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { useAccountStore } from '@/stores/account';
import { Avatar } from '@/components/ui/Avatar';

/**
 * Marketing-nav account entry. Replaces the old "Open app" button with an
 * avatar-style trigger that adapts to account state:
 *  - signed out (not onboarded): create-account / sign-in actions
 *  - signed in (onboarded): identity header + dashboard / settings / sign out
 */
export function AccountNav() {
  const onboarded = useAccountStore((s) => s.onboarded);
  const profile = useAccountStore((s) => s.profile);
  const resetAccount = useAccountStore((s) => s.resetAccount);
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const handleSignOut = () => {
    setOpen(false);
    resetAccount();
    navigate('/');
  };

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className={clsx(
          'flex h-9 w-9 items-center justify-center rounded-full ring-2 transition-all hover:-translate-y-0.5',
          open ? 'ring-rausch/40' : 'ring-transparent hover:ring-rausch/30',
        )}
      >
        <Avatar className="h-9 w-9" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            role="menu"
            className="glass absolute right-0 top-full z-50 mt-2 w-[260px] overflow-hidden rounded-[18px] border border-ink/8 p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.16)]"
          >
            {onboarded ? (
              <>
                <div className="flex items-center gap-3 rounded-[12px] px-2.5 py-2.5">
                  <Avatar className="h-9 w-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-ink">
                      {profile.name || 'User'}
                    </p>
                    <p className="truncate text-[12px] text-muted">
                      {profile.email || 'Local account'}
                    </p>
                  </div>
                </div>
                <div className="my-1 h-px bg-ink/6" />
                <MenuButton icon={<LayoutDashboard size={16} />} label="Open dashboard" onClick={() => go('/dashboard')} />
                <MenuButton icon={<Settings size={16} />} label="Settings" onClick={() => go('/dashboard/settings')} />
                <div className="my-1 h-px bg-ink/6" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-[13px] font-medium text-rausch transition-colors hover:bg-rausch/8"
                >
                  <span className="shrink-0"><LogOut size={16} /></span>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <div className="px-2.5 pb-1 pt-2 text-center">
                  <p className="text-[13px] font-semibold text-ink">Get started with Recall</p>
                  <p className="mt-1 text-[12px] leading-[1.5] text-muted">
                    Free on the web — no account needed to start.
                  </p>
                </div>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => go('/onboarding')}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-rausch px-4 py-2.5 text-[13px] font-semibold text-white transition-all hover:-translate-y-0.5"
                >
                  Create account
                  <ArrowRight size={15} />
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => go('/signin')}
                  className="mt-1.5 flex w-full items-center justify-center rounded-full px-4 py-2.5 text-[13px] font-medium text-ink transition-colors hover:bg-ink/5"
                >
                  Sign in
                </button>
                <p className="px-2.5 pb-1 pt-2 text-center text-[11px] leading-[1.5] text-muted">
                  Web is free · Sync is $1.99/mo · Mobile coming soon
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-[13px] font-medium text-ink transition-colors hover:bg-ink/5"
    >
      <span className="shrink-0 text-muted">{icon}</span>
      {label}
    </button>
  );
}
