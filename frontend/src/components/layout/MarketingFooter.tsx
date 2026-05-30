import { Link } from 'react-router';
import { Logo } from '@/components/ui/Logo';

const PRODUCT_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
];

const RESOURCE_LINKS = [
  { label: 'Blog', to: '/blog' },
  { label: 'FAQ', to: '/faq' },
];

const START_LINKS = [
  { label: 'Get started', to: '/onboarding' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'See plans', to: '/pricing' },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-hairline bg-surface/40">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8 md:px-12">
        <div className="flex flex-col gap-10 py-14 md:flex-row md:justify-between md:gap-12 md:py-16">
          <div className="max-w-[300px]">
            <Logo className="text-[22px]" />
            <p className="mt-3 text-[14px] leading-[1.6] text-muted">
              The calm way to own your subscriptions. Track every charge, see
              your true monthly burn, and never get billed by surprise.
            </p>
          </div>

          <div className="flex gap-16 sm:gap-24">
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-[1.5px] text-ink/40">
                Product
              </h4>
              <ul className="mt-4 space-y-2.5">
                {PRODUCT_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-[14px] text-muted transition-colors hover:text-rausch"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-[1.5px] text-ink/40">
                Resources
              </h4>
              <ul className="mt-4 space-y-2.5">
                {RESOURCE_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-[14px] text-muted transition-colors hover:text-rausch"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-[1.5px] text-ink/40">
                Get started
              </h4>
              <ul className="mt-4 space-y-2.5">
                {START_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-[14px] text-muted transition-colors hover:text-rausch"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-hairline py-6 text-[13px] text-muted sm:flex-row">
          <span>&copy; {new Date().getFullYear()} Recall. Your data stays on your device.</span>
          <span>Made for people who hate surprise charges.</span>
        </div>
      </div>
    </footer>
  );
}
