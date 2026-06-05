import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CARD_BRAND_LABELS, type CardBrand, type PaymentMethod } from '@/types/paymentMethod';
import { type CardShade, CARD_SHADES, CARD_SHADE_LIST } from '@/lib/cardTheme';
import { SmokeBackground } from './SmokeBackground';

/** Map our CardBrand enum to the Simple Icons CDN slug. */
const CARD_BRAND_SIMPLE_ICONS_SLUG: Partial<Record<CardBrand, string>> = {
  visa: 'visa',
  mastercard: 'mastercard',
  amex: 'americanexpress',
  discover: 'discover',
};

/** Renders the real brand mark (or a graceful fallback) from the
 *  Simple Icons CDN. Slugs are pinned to a static allowlist. */
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

/** Contactless / NFC wave — the universal "tap to pay" mark. */
function ContactlessIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M7 9.5a6 6 0 0 1 0 5" />
      <path d="M10 7a10 10 0 0 1 0 10" />
      <path d="M13 4.5a14 14 0 0 1 0 15" opacity="0.6" />
    </svg>
  );
}

/** Smoke tint per shade — drives the WebGL background color. */
const SMOKE_COLORS: Record<CardShade, string> = {
  coral: '#FF725E',
  ocean: '#3B82F6',
  forest: '#22C55E',
  galaxy: '#A855F7',
  gold: '#E0A23C',
};

/** Shade picker — 5 preset color dots. */
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
    <div className={cn('flex items-center gap-2', className)}>
      {CARD_SHADE_LIST.map((shade) => {
        const meta = CARD_SHADES[shade];
        const isActive = shade === currentShade;
        return (
          <button
            key={shade}
            type="button"
            onClick={() => onChange(shade)}
            className={cn(
              'h-6 w-6 rounded-full transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-white/50',
              isActive ? 'scale-125 ring-2 ring-white/80' : 'hover:scale-110',
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
  /** Color shade — drives the WebGL smoke background tint. */
  shade?: CardShade;
  /** Show the shade picker dots below the card. */
  showShadePicker?: boolean;
  /** Callback when user changes shade. */
  onShadeChange?: (shade: CardShade) => void;
  className?: string;
}

/**
 * Minimal virtual card. No flip, no chip, no tier label, no cardholder,
 * no EXP/CVV text labels — just the values.
 * Layout (top → bottom):
 *  • network logo (left)  +  contactless mark (right)
 *  • **** **** **** 1234  (prominent, left)
 *  • ***  (left, no captions)
 *
 * Background is a WebGL2 FBM smoke tint (no SVG illustration, no flip).
 */
export function PaymentCardVisual({
  card,
  shade = card.shade ?? 'coral',
  showShadePicker = false,
  onShadeChange,
  className,
}: PaymentCardVisualProps) {
  const last4 = card.last4 || '0000';
  const smokeColor = SMOKE_COLORS[shade];

  return (
    <div className={cn('flex w-full max-w-[320px] flex-col gap-3', className)}>
      <div
        className="relative aspect-[1.586/1] w-full overflow-hidden rounded-[1.2rem] text-white"
        style={{
          boxShadow:
            '0 1px 2px rgba(0,0,0,0.10), 0 8px 20px rgba(0,0,0,0.14), 0 24px 48px rgba(0,0,0,0.12)',
        }}
      >
        {/* WebGL smoke background — different shade per card */}
        <SmokeBackground smokeColor={smokeColor} className="absolute inset-0" />

        {/* Subtle darken layer so the white text is always readable
            even on the brighter smoke regions. */}
        <div className="pointer-events-none absolute inset-0 bg-black/20" />

        {/* Card content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-[5%]">
          {/* Top row: network logo (left) + contactless mark (right) */}
          <div className="flex items-start justify-between">
            <CardBrandLogo brand={card.brand} className="h-10 w-16 shrink-0" />
            <ContactlessIcon className="h-6 w-6 text-white/90" />
          </div>

          {/* Masked PAN — **** **** **** 1234 (large) */}
          <p
            className="self-start font-mono text-[15px] font-light tracking-[0.1em] text-white sm:text-[17px] md:text-[19px]"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {`**** **** **** ${last4}`}
          </p>

          {/* Bottom row: CVV (left, no labels) */}
          <div className="flex items-end gap-5">
            <p
              className="font-mono text-[14px] font-semibold tabular-nums text-white sm:text-[15.5px] md:text-[17px]"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              ***
            </p>
          </div>
        </div>
      </div>

      {showShadePicker && onShadeChange && (
        <ShadePicker currentShade={shade} onChange={onShadeChange} />
      )}
    </div>
  );
}
