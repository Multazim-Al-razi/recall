import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { useLenis } from '@/hooks/useLenis';
import { FloatingNav } from '@/components/layout/FloatingNav';
import { MarketingLayout } from '@/layouts/MarketingLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { HomePage } from '@/pages/Home';
import { AboutPage } from '@/pages/About';
import { BlogPage } from '@/pages/Blog';
import { BlogPostPage } from '@/pages/BlogPost';
import { FaqPage } from '@/pages/Faq';
import { PricingPage } from '@/pages/Pricing';
import { OnboardingPage } from '@/pages/Onboarding';
import { LoginPage } from '@/pages/Login';
import { DashboardView } from '@/pages/dashboard/DashboardView';
import { SubscriptionsView } from '@/pages/dashboard/SubscriptionsView';
import { AnalyticsView } from '@/pages/dashboard/AnalyticsView';
import { SettingsView } from '@/pages/dashboard/SettingsView';
import { UpgradeView } from '@/pages/dashboard/UpgradeView';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Marketing routes — wrapped in MarketingLayout for shared footer */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/faq" element={<FaqPage />} />
        </Route>

        {/* Auth routes — no nav */}
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard routes — layout shell */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/dashboard/subscriptions" element={<SubscriptionsView />} />
          <Route path="/dashboard/analytics" element={<AnalyticsView />} />
          <Route path="/dashboard/settings" element={<SettingsView />} />
          <Route path="/dashboard/upgrade" element={<UpgradeView />} />
        </Route>

        {/* Legacy flat-route redirects */}
        <Route path="/subscriptions" element={<Navigate to="/dashboard/subscriptions" replace />} />
        <Route path="/analytics" element={<Navigate to="/dashboard/analytics" replace />} />
        <Route path="/profile" element={<Navigate to="/dashboard/settings" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function Chrome() {
  useLenis();
  const location = useLocation();
  const isOnboarding = location.pathname === '/onboarding';
  const isLogin = location.pathname === '/login';
  const isDashboard = location.pathname.startsWith('/dashboard');
  const showNav = !isOnboarding && !isLogin && !isDashboard;

  return (
    <>
      {showNav && <FloatingNav />}
      <AnimatedRoutes />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Chrome />
    </BrowserRouter>
  );
}
