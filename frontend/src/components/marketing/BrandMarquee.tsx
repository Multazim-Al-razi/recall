/**
 * Infinite, edge-faded logo marquee for the marketing home page. Renders the
 * provider stack twice back-to-back so a single -50% translate loops seamlessly.
 * Pauses on hover and collapses to a static row under reduced-motion. Logos are
 * requested in a single warm-ink tone (Simple Icons `/slug/color`) so the strip
 * reads as one quiet monochrome family rather than a loud rainbow of brand marks.
 */
const BRANDS = [
  'netflix',
  'spotify',
  'youtube',
  'notion',
  'figma',
  'adobe',
  'openai',
  'discord',
  'dropbox',
  'apple',
  'amazon',
  'audible',
  'canva',
  'github',
];

/** Warm-ink tone for monochrome logos (matches --color-ink-soft, hex only). */
const LOGO_TONE = '5b534b';

/**
 * F-6: a small allowlist of CDN slugs used in the marketing marquee. We
 * don't reuse the full `PROVIDERS` set because the marquee intentionally
 * showcases brands the user may not be tracking yet.
 */
const MARQUEE_ALLOWLIST: ReadonlySet<string> = new Set(BRANDS);

function LogoChip({ slug }: { slug: string }) {
  // Slugs come from the module-level BRANDS constant, so the allowlist is a
  // belt-and-braces guard — if anyone ever changes BRANDS to read from an
  // untrusted source, we still won't render arbitrary CDN paths.
  if (!MARQUEE_ALLOWLIST.has(slug)) return null;
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-surface shadow-[0_0_0_1px_var(--color-hairline),var(--shadow-xs)] transition-transform hover:-translate-y-0.5 sm:h-14 sm:w-14">
      <img
        src={`https://cdn.simpleicons.org/${slug}/${LOGO_TONE}`}
        alt={slug}
        loading="lazy"
        referrerPolicy="no-referrer"
        style={{ width: 24, height: 24 }}
        className="opacity-55 transition-opacity duration-300 hover:opacity-100"
      />
    </div>
  );
}

export function BrandMarquee() {
  return (
    <section className="border-y border-hairline bg-surface/40 py-10 sm:py-12">
      <p className="mx-auto mb-7 max-w-[1100px] px-5 text-center text-[12px] font-semibold uppercase tracking-[2.5px] text-muted sm:px-8">
        Tracks the subscriptions you already pay for
      </p>
      <div className="marquee-mask relative overflow-hidden">
        <div className="animate-marquee flex w-max gap-3 sm:gap-4">
          {[...BRANDS, ...BRANDS].map((slug, i) => (
            <LogoChip key={`${slug}-${i}`} slug={slug} />
          ))}
        </div>
      </div>
    </section>
  );
}
