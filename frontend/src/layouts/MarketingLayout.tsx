import { Outlet } from 'react-router';
import { MarketingFooter } from '@/components/layout/MarketingFooter';

export function MarketingLayout() {
  return (
    <>
      <Outlet />
      <MarketingFooter />
    </>
  );
}
