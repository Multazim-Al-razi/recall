import { useState, useRef, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  align = 'right',
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={containerRef} className={clsx('relative inline-flex', className)}>
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className={clsx(
              'absolute top-full z-50 mt-1.5 min-w-[180px] overflow-hidden rounded-[12px] border border-ink/6 bg-surface p-1 shadow-[0_12px_40px_rgba(0,0,0,0.12)]',
              align === 'right' ? 'right-0' : 'left-0',
            )}
            role="menu"
          >
            {items.map((item, i) => (
              <>
                <button
                  key={item.label}
                  role="menuitem"
                  onClick={() => {
                    item.onClick();
                    setOpen(false);
                  }}
                  className={clsx(
                    'flex w-full items-center gap-2.5 rounded-[8px] px-3 py-2 text-left text-[13px] font-medium transition-colors',
                    item.danger
                      ? 'text-rausch hover:bg-rausch/8'
                      : 'text-ink hover:bg-ink/5',
                  )}
                >
                  {item.icon && (
                    <span className="shrink-0 text-muted">{item.icon}</span>
                  )}
                  {item.label}
                </button>
                {item.divider && (
                  <div
                    key={`divider-${i}`}
                    className="my-1 h-px bg-ink/6"
                  />
                )}
              </>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
