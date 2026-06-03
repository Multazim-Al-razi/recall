/**
 * Integrations marquee — dual-row scrolling logo strip showing popular brands.
 * Row 1 scrolls left, Row 2 scrolls right. Uses SimpleIcons CDN with fallback
 * to colored initials if icon not available.
 */
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

const BRANDS_ROW1 = [
  'netflix', 'youtube', 'spotify', 'discord', 'figma', 'github',
  'notion', 'apple', 'dropbox', 'twitch', 'zoom', 'paypal',
  'stripe', 'shopify', 'whatsapp', 'messenger', 'telegram', 'linear',
  'jira', 'asana', 'calendar', 'chrome', 'edge', 'firefox',
  'npm', 'yarn', 'nodejs', 'react', 'vue', 'angular',
  'aws', 'gcp', 'azure', 'digitalocean', 'vercel', 'netlify',
  'slack', 'teams', 'zoom', 'skype', 'meet',
  'instagram', 'twitter', 'facebook', 'tiktok', 'snapchat', 'reddit',
  'gmail', 'outlook', 'dropbox', 'onedrive', 'icloud', 'drive',
  'figma', 'sketch', 'xd', 'illustrator', 'photoshop', 'premiere',
];

const BRANDS_ROW2 = [
  'paypal', 'visa', 'mastercard', 'applepay', 'googlepay', 'stripe',
  'ebay', 'etsy', 'shopify', 'wordpress',
  'medium', 'substack', 'ghost', 'hubspot', 'mailchimp',
  'braintree', 'coinbase', 'bitcoin',
  'airbnb', 'booking', 'expedia', 'uber', 'lyft', 'doordash',
  'grubhub', 'seamless', 'postmates', 'instacart',
  'robinhood', 'cashapp', 'venmo', 'zelle',
  'playstation', 'xbox', 'nintendo', 'steam', 'epicgames', 'roblox',
  'applemusic',
  'dropbox', 'icloud', 'drive', 'onedrive', 'box', 'mediafire',
];

/** Warm-ink tone for monochrome logos. */
const LOGO_TONE = '5b534b';

/** Deterministic color from brand name */
function brandColor(name: string): string {
  const colors = ['#d64f33', '#16786a', '#e0a23c', '#8b5cf6', '#ec4899', '#06b6d4'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const repeatedBrands = (brands: string[], repeat = 2) =>
  Array.from({ length: repeat }).flatMap(() => brands);

function LogoIcon({ slug }: { slug: string }) {
  const initials = slug.slice(0, 2).toUpperCase();
  const color = brandColor(slug);

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface shadow-[0_0_0_1px_var(--color-hairline)] transition-transform hover:scale-105 sm:h-16 sm:w-16">
      <img
        src={`https://cdn.simpleicons.org/${slug}/${LOGO_TONE}`}
        alt={slug}
        className="opacity-60 transition-opacity hover:opacity-100"
        style={{ width: 26, height: 26 }}
        loading="lazy"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          if (!target.dataset.fallbackInitials) {
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = 'flex items-center justify-center rounded-xl font-bold text-white';
              fallback.style.cssText = `width: 26px; height: 26px; background-color: ${color}; font-size: 10px;`;
              fallback.textContent = initials;
              fallback.dataset.fallbackInitials = 'true';
              parent.appendChild(fallback);
            }
          }
        }}
      />
    </div>
  );
}

export function IntegrationsMarquee() {
  const row1 = repeatedBrands(BRANDS_ROW1, 2);
  const row2 = repeatedBrands(BRANDS_ROW2, 2);

  return (
    <section className="relative overflow-hidden py-24">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-hairline)_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Content */}
      <div className="relative mx-auto max-w-[1100px] px-5 text-center sm:px-8">
        <div className="mb-10">
          <h2 className="font-display text-[28px] font-light tracking-[-1px] md:text-[36px]">
            Works with the services you already use
          </h2>
          <p className="mx-auto mt-3 max-w-[460px] text-[15px] text-muted">
            From streaming to productivity tools, Recall tracks any subscription
            so nothing catches you off guard.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative overflow-hidden pb-4">
          {/* Row 1 - scrolls left */}
          <div className="animate-scroll-left mb-6 flex gap-4 whitespace-nowrap">
            {row1.map((slug, i) => (
              <LogoIcon key={`r1-${i}`} slug={slug} />
            ))}
          </div>

          {/* Row 2 - scrolls right */}
          <div className="animate-scroll-right flex gap-4 whitespace-nowrap">
            {row2.map((slug, i) => (
              <LogoIcon key={`r2-${i}`} slug={slug} />
            ))}
          </div>

          {/* Fade overlays */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-canvas to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-canvas to-transparent" />
        </div>

        {/* CTA */}
        <div className="mt-10">
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-2 rounded-full bg-rausch px-8 py-4 text-[15px] font-semibold text-white shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"
          >
            Get started for free
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-left {
          animation: scroll-left 50s linear infinite;
        }
        .animate-scroll-right {
          animation: scroll-right 50s linear infinite;
        }
      `}</style>
    </section>
  );
}
