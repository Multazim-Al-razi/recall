import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { CARD_BRAND_LABELS, CARD_BRAND_GRADIENTS, type CardBrand, type PaymentMethod } from '@/types/paymentMethod';
import { type CardIllustrationTheme, type CardShade, CARD_SHADES, CARD_SHADE_LIST, THEME_SVG } from '@/lib/cardTheme';

/** Map our CardBrand enum to the Simple Icons CDN slug. */
const CARD_BRAND_SIMPLE_ICONS_SLUG: Partial<Record<CardBrand, string>> = {
  visa: 'visa',
  mastercard: 'mastercard',
  amex: 'americanexpress',
  discover: 'discover',
};

/** Brand-specific "tier" label shown on the top-left of the card, like a real
 *  card issuer would print (Visa Infinite, World, Platinum, etc.). */
const CARD_TIER_LABEL: Partial<Record<CardBrand, string>> = {
  visa: 'Visa Infinite',
  mastercard: 'World Elite',
  amex: 'Platinum',
  discover: 'Cashback',
  debit: 'Debit',
  other: 'Standard',
};

/** Renders a real brand logo (or a graceful fallback) from the Simple Icons
 *  CDN. Slugs are pinned to a static allowlist — never feed user input here. */
function CardBrandLogo({ brand, className }: { brand: CardBrand; className?: string }) {
  const slug = CARD_BRAND_SIMPLE_ICONS_SLUG[brand];
  const [failed, setFailed] = useState(false);

  if (slug && !failed) {
    return (
      <img
        src={`https://cdn.simpleicons.org/${slug}/FFFFFF`}
        alt={CARD_BRAND_LABELS[brand]}
        className={className}
        style={{ objectFit: 'contain' }}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span className="flex items-center gap-1 text-white/90">
      <CreditCard className="h-3.5 w-3.5" />
      <span className="text-[10px] font-semibold uppercase tracking-wide">
        {CARD_BRAND_LABELS[brand]}
      </span>
    </span>
  );
}

/** Contactless / NFC wave icon — the universal "tap to pay" symbol printed
 *  on real cards. Inline SVG so we don't depend on lucide's icon set. */
function ContactlessIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 8.5a8 8 0 0 1 0 7" />
      <path d="M9.5 6a12 12 0 0 1 0 12" />
      <path d="M13 3.5a16 16 0 0 1 0 17" opacity="0.6" />
    </svg>
  );
}

/** EMV chip icon — realistic gold chip with rounded corners, diagonal lines,
 *  and contact pads. Sized to match real-card chip proportions. */
function ChipIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 30" className={className} aria-hidden="true">
      <rect x="1" y="1" width="38" height="28" rx="5" ry="5" fill="#D4A843" stroke="#B8922F" strokeWidth="0.8" />
      <rect x="4" y="4" width="32" height="22" rx="3" ry="3" fill="#C9A84C" stroke="#A08030" strokeWidth="0.5" />
      <line x1="4" y1="4" x2="36" y2="26" stroke="#A08030" strokeWidth="0.5" />
      <line x1="4" y1="10" x2="36" y2="26" stroke="#A08030" strokeWidth="0.4" />
      <line x1="4" y1="20" x2="36" y2="26" stroke="#A08030" strokeWidth="0.4" />
      <line x1="36" y1="4" x2="4" y2="26" stroke="#A08030" strokeWidth="0.5" />
      <line x1="36" y1="10" x2="4" y2="26" stroke="#A08030" strokeWidth="0.4" />
      <line x1="36" y1="20" x2="4" y2="26" stroke="#A08030" strokeWidth="0.4" />
      <line x1="14" y1="4" x2="14" y2="26" stroke="#A08030" strokeWidth="0.5" />
      <line x1="26" y1="4" x2="26" y2="26" stroke="#A08030" strokeWidth="0.5" />
      <rect x="6" y="6" width="6" height="4" rx="1" fill="#BF9B30" opacity="0.6" />
      <rect x="28" y="6" width="6" height="4" rx="1" fill="#BF9B30" opacity="0.6" />
    </svg>
  );
}

/** Shade picker — 5 preset color dots. Clicking changes the card accent shade. */
function ShadePicker({
  currentShade,
  onChange,
  className,
}: {
  currentShade: CardShade;
  onChange: (shade: CardShade) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {CARD_SHADE_LIST.map((shade) => {
        const meta = CARD_SHADES[shade];
        const isActive = shade === currentShade;
        return (
          <button
            key={shade}
            type="button"
            onClick={() => onChange(shade)}
            className={cn(
              "h-6 w-6 rounded-full transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-white/50",
              isActive ? "scale-125 ring-2 ring-white/80" : "hover:scale-110",
            )}
            style={{ background: meta.swatch }}
            title={meta.label}
            aria-label={`Shade: ${meta.label}`}
          />
        );
      })}
    </div>
  );
}

interface PaymentCardVisualProps {
  card: PaymentMethod;
  burn?: number;
  linkedCount?: number;
  currencySymbol?: string;
  /** Which illustration theme to use for the background. */
  illustrationTheme?: CardIllustrationTheme;
  /** Whether to use the illustration background instead of the brand gradient. */
  useIllustrationBg?: boolean;
  /** Color shade for SVG tinting and border gradient. */
  shade?: CardShade;
  /** Show the shade picker dots below the card. */
  showShadePicker?: boolean;
  /** Callback when user changes shade. */
  onShadeChange?: (shade: CardShade) => void;
  className?: string;
}

export function PaymentCardVisual({
  card,
  burn = 0,
  linkedCount = 0,
  currencySymbol = '$',
  illustrationTheme = 'bambooTree',
  useIllustrationBg = true,
  shade = card.shade ?? 'coral',
  showShadePicker = false,
  onShadeChange,
  className,
}: PaymentCardVisualProps) {
  const last4 = card.last4 || '0000';
  const masked = `•••• •••• •••• ${last4}`;
  const expiry = card.expiryMonth && card.expiryYear
    ? `${String(card.expiryMonth).padStart(2, '0')}/${String(card.expiryYear).slice(-2)}`
    : '';
  const shadeMeta = CARD_SHADES[shade];
  const tierLabel = CARD_TIER_LABEL[card.brand] ?? CARD_BRAND_LABELS[card.brand];

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative h-[200px] w-[320px] overflow-hidden rounded-[16px] text-white shadow-2xl"
        style={{
          background: useIllustrationBg
            ? 'radial-gradient(100% 100% at 100% 0%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 100%)'
            : undefined,
          backdropFilter: useIllustrationBg ? 'blur(21px)' : undefined,
        }}
      >
        {/* Aurora-style border ring */}
        {useIllustrationBg && (
          <div
            className="absolute inset-0 rounded-[16px] transition-all duration-700"
            style={{
              background: shadeMeta.borderGradient,
              opacity: 0.8,
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              padding: '2px',
            }}
          />
        )}

        {/* Background layer */}
        {useIllustrationBg ? (
          <>
            <img
              src={THEME_SVG[illustrationTheme]}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-center"
              aria-hidden="true"
              style={{ filter: shadeMeta.filter !== 'none' ? shadeMeta.filter : undefined }}
            />
            <div className="absolute inset-0 bg-black/55" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: CARD_BRAND_GRADIENTS[card.brand] }}
          />
        )}

        {/* Subtle gloss sweep — feels like a real plastic card */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute -left-1/3 top-0 h-full w-1/3 opacity-25"
            style={{
              background: 'linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)',
              transform: 'skewX(-12deg)',
            }}
          />
        </div>

        {/* Card content — laid out like a real credit card */}
        <div className="relative z-10 flex h-full flex-col justify-between p-5">
          {/* Top row: tier label (left) + contactless + brand logo (right) */}
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/75">
              {tierLabel}
            </span>
            <div className="flex items-center gap-2">
              <ContactlessIcon className="h-4 w-4 text-white/80" />
              <CardBrandLogo brand={card.brand} className="h-6 w-12" />
            </div>
          </div>

          {/* Middle row: EMV chip */}
          <div className="flex items-center gap-3">
            <ChipIcon className="h-8 w-10" />
            {linkedCount > 0 && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/65">
                {linkedCount} linked
              </span>
            )}
          </div>

          {/* PAN — primary account number, masked */}
          <p
            className="font-mono text-[19px] font-light tracking-[0.18em] text-white/95"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {masked}
          </p>

          {/* Bottom row: holder name + expiry + statement balance */}
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-white/55">
                Card Holder
              </p>
              <p className="mt-0.5 truncate text-[12px] font-semibold uppercase tracking-[0.04em] text-white">
                {card.label}
              </p>
            </div>
            {expiry && (
              <div className="text-right">
                <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-white/55">
                  Valid Thru
                </p>
                <p
                  className="mt-0.5 text-[12px] font-semibold tracking-[0.04em] text-white"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {expiry}
                </p>
              </div>
            )}
            {burn > 0 && (
              <div className="text-right">
                <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-white/55">
                  Statement
                </p>
                <p
                  className="mt-0.5 text-[12px] font-semibold tracking-[0.02em] text-white"
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {currencySymbol}{burn.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Shade picker */}
      {showShadePicker && onShadeChange && (
        <ShadePicker currentShade={shade} onChange={onShadeChange} />
      )}
    </div>
  );
}
