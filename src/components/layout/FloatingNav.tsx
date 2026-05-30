import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/about', label: 'About' },
];

export function FloatingNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const go = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-3 left-1/2 z-50 flex h-[52px] w-[calc(100%-24px)] max-w-[540px] -translate-x-1/2 items-center justify-between gap-1.5 rounded-full border border-ink/5 bg-surface/70 px-2.5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] backdrop-blur-[24px] backdrop-saturate-150 sm:top-5 sm:w-auto"
      >
        <button
          onClick={() => go('/')}
          className="px-2 sm:px-3.5"
        >
          <Logo className="h-[22px] w-auto text-ink" />
        </button>

        {/* Desktop links */}
        <div className="mx-1 hidden h-6 w-px bg-ink/8 md:block" />
        <div className="hidden gap-0.5 md:flex">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className={`rounded-full px-3.5 py-2 text-[13px] font-medium transition-all ${
                  isActive ? 'bg-ink/6 text-ink' : 'text-muted hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-ink md:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-[72px] z-50 w-[calc(100%-24px)] max-w-[420px] -translate-x-1/2 rounded-[20px] border border-hairline bg-surface p-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] md:hidden"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => go(item.path)}
                    className={`block w-full rounded-[14px] px-4 py-3 text-left text-[15px] font-medium transition-all ${
                      isActive ? 'bg-rausch/8 text-rausch' : 'text-ink hover:bg-ink/4'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
