import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeId, onChange, className }: TabsProps) {
  return (
    <div
      className={clsx(
        'inline-flex rounded-[10px] bg-canvas p-1',
        className,
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'relative rounded-[8px] px-4 py-2 text-[13px] font-medium transition-colors',
              isActive ? 'text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-[8px] bg-surface shadow-sm"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={clsx(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                    isActive
                      ? 'bg-rausch/10 text-rausch'
                      : 'bg-ink/6 text-muted',
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
