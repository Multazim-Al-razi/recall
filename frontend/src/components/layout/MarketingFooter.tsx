import { Link } from "react-router";
import { LifeBuoy } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const RESOURCE_LINKS = [
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blog" },
  { label: "FAQ", to: "/about#faq" },
];

const POLICY_LINKS = [
  { label: "Terms of Service", to: "/terms" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Refund Policy", to: "/refunds" },
  { label: "Cookie Policy", to: "/cookies" },
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-hairline bg-surface/40">
      <div className="mx-auto max-w-[1100px] px-5 sm:px-8 md:px-12">
        <div className="flex flex-col gap-10 py-14 md:flex-row md:justify-between md:gap-12 md:py-16">
          <div className="max-w-[300px]">
            <Logo className="text-[22px]" />
            <p className="mt-3 text-[14px] leading-[1.6] text-muted">
              Track every recurring charge, see your true monthly burn,
              and never get billed by surprise.
            </p>
          </div>

          <div className="flex flex-wrap gap-12 sm:gap-16 md:gap-20">
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
                Policies
              </h4>
              <ul className="mt-4 space-y-2.5">
                {POLICY_LINKS.map((l) => (
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

            <div className="min-w-[200px]">
              <h4 className="text-[12px] font-bold uppercase tracking-[1.5px] text-ink/40">
                Support Recall
              </h4>
              <p className="mt-4 max-w-[240px] text-[14px] leading-[1.6] text-muted">
                Recall is free and donation-supported. If it saved you money, a
                tip keeps the project alive and ad-free.
              </p>
              <Link
                to="/donate"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-rausch/30 bg-rausch/8 px-4 py-2 text-[13px] font-semibold text-rausch transition-all hover:-translate-y-0.5 hover:bg-rausch/12"
              >
                <LifeBuoy size={14} />
                Support Recall
              </Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
