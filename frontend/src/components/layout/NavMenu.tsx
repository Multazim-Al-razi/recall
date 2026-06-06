import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Presentation,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: Presentation },
  { path: '/dashboard/subscriptions', label: 'Subscriptions', icon: CreditCard },
  { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
] as const;

const ITEM_SIZE = 40;
// Separated beads — a small gap between each circle
const STEP = ITEM_SIZE + 10;

/**
 * Dashboard navigation.
 * Desktop: expands horizontally (sideways).
 * Mobile: standard popover dropdown.
 */
export function NavMenu() {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!expanded) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setExpanded(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [expanded]);

  const go = (path: string) => {
    navigate(path);
    setExpanded(false);
  };

  const isActive = (path: string) =>
    path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(path);

  return (
    <nav
      ref={containerRef}
      aria-label="Dashboard navigation"
      className="relative flex h-8 w-8 items-center justify-center"
      data-expanded={expanded}
    >
      {/* Trigger — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? 'Close navigation' : 'Open navigation'}
        aria-expanded={expanded}
        aria-haspopup="menu"
        className="relative z-50 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-ink shadow-[0_0_0_1px_var(--color-hairline),var(--shadow-xs)] transition-all hover:-translate-y-0.5 hover:text-rausch hover:shadow-[var(--shadow-sm)]"
      >
        {expanded ? <X size={17} /> : <Menu size={17} />}
      </button>

      {/* DESKTOP UI: Fan out sideways (Horizontal) */}
      <div role="menu" aria-orientation="horizontal" className="hidden md:block">
        {NAV_ITEMS.map((item, index) => {
          const { path, label, icon: Icon } = item;
          const active = isActive(path);
          const offset = (index + 1) * STEP;
          return (
            <div
              key={path}
              className="group absolute left-0 top-1/2 -translate-y-1/2"
              style={{
                width: ITEM_SIZE,
                height: ITEM_SIZE,
                transform: `translateX(${expanded ? offset : 0}px) scale(${expanded ? 1 : 0.6})`,
                opacity: expanded ? 1 : 0,
                pointerEvents: expanded ? 'auto' : 'none',
                zIndex: 40 - index,
                transition: reduce
                  ? 'none'
                  : `transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1) ${expanded ? index * 40 : 0}ms, opacity 240ms ease ${expanded ? index * 40 : 0}ms`,
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
              }}
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => go(path)}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className={clsx(
                  'flex h-10 w-10 items-center justify-center rounded-full shadow-[0_0_0_1px_var(--color-sidebar-border),var(--shadow-xs)] transition-colors',
                  active
                    ? 'bg-[var(--color-sidebar-active)] text-rausch'
                    : 'bg-[var(--color-sidebar-bg)] text-[var(--color-sidebar-text)] hover:text-rausch',
                )}
              >
                <Icon
                  size={18}
                  strokeWidth={active ? 2.4 : 2}
                  className="transition-transform group-hover:scale-110"
                />
              </button>

              {/* Label pill — reveals below the button on hover */}
              <span
                aria-hidden
                className="glass pointer-events-none absolute left-1/2 top-[50px] -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-medium text-ink opacity-0 shadow-[var(--shadow-sm)] ring-1 ring-hairline transition-opacity duration-200 group-hover:opacity-100"
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* MOBILE UI: Normal dropdown menu */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            className="absolute left-0 top-full z-50 mt-3 w-[220px] overflow-hidden rounded-[16px] border border-ink/8 bg-surface p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.16)] md:hidden"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="flex flex-col">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    role="menuitem"
                    aria-current={active ? 'page' : undefined}
                    className={clsx(
                      'flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-left text-[13px] font-medium transition-colors',
                      active
                        ? 'bg-ink/5 text-rausch'
                        : 'text-ink hover:bg-ink/5'
                    )}
                  >
                    <Icon
                      size={16}
                      className={active ? 'text-rausch' : 'text-muted'}
                    />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
