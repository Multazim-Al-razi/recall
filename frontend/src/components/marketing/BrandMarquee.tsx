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
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg opacity-50 transition-opacity duration-300 hover:opacity-100 sm:h-12 sm:w-12">
      <img
        src={`https://cdn.simpleicons.org/${slug}/${LOGO_TONE}`}
        alt={slug}
        loading="lazy"
        referrerPolicy="no-referrer"
        style={{ width: 22, height: 22 }}
      />
    </div>
  );
}

export function BrandMarquee() {
  return (
    <section className="relative overflow-hidden">
      <div className="marquee-mask relative overflow-hidden">
        <div className="animate-marquee flex w-max gap-2 sm:gap-3">
          {[...BRANDS, ...BRANDS].map((slug, i) => (
            <LogoChip key={`${slug}-${i}`} slug={slug} />
          ))}
        </div>
      </div>
    </section>
  );
}
