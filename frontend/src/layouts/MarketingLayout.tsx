import { Outlet } from 'react-router';
import { MarketingFooter } from '@/components/layout/MarketingFooter';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

/**
 * Marketing chrome — main outlet + footer. The outlet is wrapped in its
 * own error boundary so a render error on, say, the blog post detail
 * page doesn't blank the whole marketing site.
 */
export function MarketingLayout() {
  return (
    <>
      <main id="main-content">
        <ErrorBoundary scope="marketing">
          <Outlet />
        </ErrorBoundary>
      </main>
      <MarketingFooter />
    </>
  );
}
