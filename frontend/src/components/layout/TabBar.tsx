import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTabs } from '@/hooks/useTabs';

export function TabBar() {
  const navigate = useNavigate();
  const { tabs, activeTabId, closeTab, setActiveTab } = useTabs();

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    navigate(id);
  };

  const handleClose = (id: string) => {
    // If we're closing the active tab, navigate to the next active tab after close.
    const isActive = id === activeTabId;
    const idx = tabs.findIndex((t) => t.id === id);
    closeTab(id);
    if (isActive) {
      const remaining = tabs.filter((t) => t.id !== id);
      const neighbor = remaining[idx - 1] ?? remaining[idx] ?? null;
      navigate(neighbor ? neighbor.id : '/dashboard');
    }
  };

  if (tabs.length === 0) return null;

  return (
    <div
      role="tablist"
      style={{ height: 'var(--tabbar-height)' }}
      className="flex shrink-0 items-stretch overflow-x-auto border-b border-[var(--color-sidebar-border)] bg-[var(--color-tab-bg)]"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            className="relative flex items-stretch border-r border-[var(--color-sidebar-border)] last:border-r-0"
          >
            {isActive && (
              <motion.div
                layoutId="tab-active-indicator"
                className="absolute inset-0 bg-[var(--color-tab-active)]"
                style={{ zIndex: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <button
              role="tab"
              aria-selected={isActive}
              onClick={() => handleTabClick(tab.id)}
              className={`relative z-10 flex items-center whitespace-nowrap pl-4 pr-1.5 text-[13px] transition-colors ${
                isActive ? 'font-semibold text-ink' : 'text-muted hover:text-ink'
              }`}
            >
              {tab.title}
            </button>
            <button
              type="button"
              onClick={() => handleClose(tab.id)}
              aria-label={`Close ${tab.title} tab`}
              className="relative z-10 mr-2 flex w-5 items-center justify-center rounded text-muted transition-colors hover:bg-ink/8 hover:text-ink"
            >
              <X size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
