import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, LifeBuoy } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { GithubStars, GithubMark } from "@/components/layout/GithubStars";
import { GITHUB_URL, useGitHubStars } from "@/lib/github";
import { useAccountStore } from "@/stores/account";

const DONATE_URL = '/donate';

const NAV_ITEMS = [
  { path: "/", label: "Home" },
  { path: "/pricing", label: "Pricing" },
  { path: "/about", label: "About" },
  { path: "/blog", label: "Blog" },
];

function ThemeToggle() {
  const theme = useAccountStore((s) => s.profile.theme);
  const setTheme = useAccountStore((s) => s.setTheme);

  const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';

  return (
    <button
      onClick={() => setTheme(next)}
      aria-label={`Switch theme (current: ${theme}, next: ${next})`}
      className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
    >
      {theme === 'dark' ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}

export function FloatingNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const onboarded = useAccountStore((s) => s.onboarded);
  const { formatted, visible } = useGitHubStars();

  const go = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <>
      {/* Non-sticky header — scrolls away with the page */}
      <motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-30 w-full"
      >
        <div className="mx-auto grid max-w-[1240px] grid-cols-[auto_1fr_auto] items-center gap-4 px-5 py-4 sm:px-8 md:px-12">
          {/* Left — GitHub stars (visible only when ≥ 100), donate link */}
          <div className="hidden items-center gap-2 md:inline-flex">
            {visible && (
              <>
                <GithubStars />
                <span className="text-ink/20" aria-hidden="true">·</span>
              </>
            )}
            <Link
              to={DONATE_URL}
              aria-label="Support Recall"
              className="flex items-center gap-1 text-[13px] font-medium text-muted transition-colors hover:text-rausch"
            >
              <LifeBuoy size={14} />
              <span>Support</span>
            </Link>
          </div>

          {/* Mobile logo (left) */}
          <button
            onClick={() => go("/")}
            className="md:hidden"
            aria-label="Recall home"
          >
            <Logo className="h-[22px] w-auto text-ink" />
          </button>

          {/* Center — logo | nav links in glass pill, sized to content */}
          <nav className="glass hidden h-[54px] w-fit items-center gap-1.5 justify-self-center rounded-full border border-ink/8 px-2.5 shadow-[0_4px_24px_rgba(26,26,26,0.08)] md:flex">
            <button
              onClick={() => go("/")}
              className="px-1"
              aria-label="Recall home"
            >
              <Logo className="h-[22px] w-auto text-ink" />
            </button>
            <span className="mx-1 h-5 w-px bg-ink/10" aria-hidden="true" />
            {NAV_ITEMS.map((item) => (
              <button
                key={item.path}
                onClick={() => go(item.path)}
                className="relative rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors"
              >
                {isActive(item.path) && (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-ink/6"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={`relative ${isActive(item.path) ? "text-ink" : "text-muted hover:text-ink"}`}
                >
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Right — theme toggle + auth actions */}
          <div className="hidden items-center gap-3 justify-self-end md:flex">
            <ThemeToggle />
            {onboarded ? (
              <button
                onClick={() => go("/dashboard")}
                className="rounded-full bg-rausch px-5 py-2 text-[13px] font-semibold text-white shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
              >
                Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={() => go("/signin")}
                  className="text-[13px] font-semibold text-rausch transition-colors hover:text-rausch/80"
                >
                  Log in
                </button>
                <button
                  onClick={() => go("/onboarding")}
                  className="rounded-full bg-rausch px-5 py-2 text-[13px] font-semibold text-white shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger (right) */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-[34px] w-[34px] items-center justify-center justify-self-end rounded-full text-ink md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.header>

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
              className="fixed left-1/2 top-[68px] z-50 w-[calc(100%-24px)] max-w-[420px] -translate-x-1/2 rounded-[20px] border border-hairline bg-surface p-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] md:hidden"
            >
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className={`block w-full rounded-[14px] px-4 py-3 text-left text-[15px] font-medium transition-all ${
                    isActive(item.path)
                      ? "bg-rausch/8 text-rausch"
                      : "text-ink hover:bg-ink/4"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {/* Theme toggle */}
              <div className="my-1 h-px bg-hairline" />
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[15px] font-medium text-ink">Theme</span>
                <ThemeToggle />
              </div>

              {/* Account actions */}
              <div className="my-1 h-px bg-hairline" />
              {onboarded ? (
                <button
                  onClick={() => go("/dashboard")}
                  className="block w-full rounded-[14px] bg-rausch px-4 py-3 text-left text-[15px] font-semibold text-white"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => go("/signin")}
                    className="block w-full rounded-[14px] px-4 py-3 text-left text-[15px] font-semibold text-rausch transition-all hover:bg-rausch/8"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => go("/onboarding")}
                    className="block w-full rounded-[14px] bg-rausch px-4 py-3 text-left text-[15px] font-semibold text-white"
                  >
                    Sign up
                  </button>
                </>
              )}

              {/* GitHub (visible only when ≥ 100 stars) */}
              {visible && (
                <>
                  <div className="my-1 h-px bg-hairline" />
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-[14px] px-4 py-3 text-[15px] font-medium text-ink transition-all hover:bg-ink/4"
                  >
                    <GithubMark size={17} />
                    <span className="flex-1">Star on GitHub</span>
                    <span className="text-[13px] text-muted">{formatted}</span>
                  </a>
                </>
              )}

              {/* Support */}
              <Link
                to={DONATE_URL}
                onClick={() => setMenuOpen(false)}
                className="mx-4 mb-4 mt-2 flex items-center gap-2 rounded-[14px] bg-rausch/8 px-4 py-3 text-[15px] font-medium text-rausch transition-all hover:bg-rausch/12"
              >
                <LifeBuoy size={18} />
                <span className="flex-1">Support Recall</span>
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
