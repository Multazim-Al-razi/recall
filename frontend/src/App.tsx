import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router";
import { AnimatePresence } from "framer-motion";
import { useLenis } from "@/hooks/useLenis";
import { useApiSync } from "@/hooks/useApiSync";
import { useTheme } from "@/hooks/useTheme";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { MarketingLayout } from "@/layouts/MarketingLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { AuthGuard } from "@/components/auth/AuthGuard";

// Route-level code splitting (#17)
const HomePage = lazy(() =>
  import("@/pages/Home").then((m) => ({ default: m.HomePage })),
);
const AboutPage = lazy(() =>
  import("@/pages/About").then((m) => ({ default: m.AboutPage })),
);
const BlogPage = lazy(() =>
  import("@/pages/Blog").then((m) => ({ default: m.BlogPage })),
);
const BlogPostPage = lazy(() =>
  import("@/pages/BlogPost").then((m) => ({ default: m.BlogPostPage })),
);
const TermsPage = lazy(() =>
  import("@/pages/Terms").then((m) => ({ default: m.TermsPage })),
);
const PrivacyPage = lazy(() =>
  import("@/pages/Privacy").then((m) => ({ default: m.PrivacyPage })),
);
const RefundsPage = lazy(() =>
  import("@/pages/Refunds").then((m) => ({ default: m.RefundsPage })),
);
const CookiesPage = lazy(() =>
  import("@/pages/Cookies").then((m) => ({ default: m.CookiesPage })),
);
const DonatePage = lazy(() =>
  import("@/pages/Donate").then((m) => ({ default: m.DonatePage })),
);
const PricingPage = lazy(() =>
  import("@/pages/Pricing").then((m) => ({ default: m.PricingPage })),
);
const OnboardingPage = lazy(() =>
  import("@/pages/Onboarding").then((m) => ({ default: m.OnboardingPage })),
);
const DashboardView = lazy(() =>
  import("@/pages/dashboard/DashboardView").then((m) => ({
    default: m.DashboardView,
  })),
);
const SubscriptionsView = lazy(() =>
  import("@/pages/dashboard/SubscriptionsView").then((m) => ({
    default: m.SubscriptionsView,
  })),
);
const AnalyticsView = lazy(() =>
  import("@/pages/dashboard/AnalyticsView").then((m) => ({
    default: m.AnalyticsView,
  })),
);
const SettingsView = lazy(() =>
  import("@/pages/dashboard/SettingsView").then((m) => ({
    default: m.SettingsView,
  })),
);

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-rausch border-t-transparent" />
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Marketing routes — wrapped in MarketingLayout for shared footer */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/refunds" element={<RefundsPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/donate" element={<DonatePage />} />
          </Route>

          {/* Auth routes — no nav */}
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/signin" element={<OnboardingPage />} />

          {/* Dashboard routes — layout shell, protected when cloud mode */}
          <Route
            element={
              <AuthGuard>
                <DashboardLayout />
              </AuthGuard>
            }
          >
            <Route path="/dashboard" element={<DashboardView />} />
            <Route
              path="/dashboard/subscriptions"
              element={<SubscriptionsView />}
            />
            <Route path="/dashboard/analytics" element={<AnalyticsView />} />
            <Route path="/dashboard/settings" element={<SettingsView />} />
          </Route>

          {/* Legacy flat-route redirects */}
          <Route path="/faq" element={<Navigate to="/about#faq" replace />} />
          <Route
            path="/subscriptions"
            element={<Navigate to="/dashboard/subscriptions" replace />}
          />
          <Route
            path="/analytics"
            element={<Navigate to="/dashboard/analytics" replace />}
          />
          <Route
            path="/profile"
            element={<Navigate to="/dashboard/settings" replace />}
          />
          <Route
            path="/dashboard/upgrade"
            element={<Navigate to="/pricing" replace />}
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function Chrome() {
  useLenis();
  useApiSync();
  useTheme();
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/onboarding" || location.pathname === "/signin";
  const isDashboard = location.pathname.startsWith("/dashboard");
  const showNav = !isAuthPage && !isDashboard;

  // Keyboard shortcuts (#13)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl+K — focus search if on subscriptions page
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="Search"]',
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [location.pathname]);

  return (
    <>
      {/* Skip-to-content link (#25) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-rausch focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none"
      >
        Skip to content
      </a>
      {showNav && <FloatingNav />}
      {showNav && <ScrollToTop />}
      <AnimatedRoutes />
    </>
  );
}

export default function App() {
  // 5.2: top-level error boundary wraps the whole router. The
  // DashboardLayout adds a *nested* boundary with a `scope="dashboard"`
  // label, so a render error inside a dashboard widget is caught and
  // recovered locally without unmounting the chrome.
  return (
    <ErrorBoundary scope="app">
      <BrowserRouter>
        <Chrome />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
