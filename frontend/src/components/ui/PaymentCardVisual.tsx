import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CARD_BRAND_LABELS, CARD_BRAND_GRADIENTS, type CardBrand, type PaymentMethod } from '@/types/paymentMethod';
import { type CardIllustrationTheme, type CardShade, CARD_SHADES, CARD_SHADE_LIST, THEME_SVG } from '@/lib/cardTheme';

/** Inline brand logo SVGs — more realistic proportions for Visa, Mastercard, AMEX. */
function CardBrandLogo({ brand, className }: { brand: CardBrand; className?: string }) {
  if (brand === 'visa') {
    return (
      <svg viewBox="0 0 64 20" className={className} aria-label="Visa">
        {/* Visa flag stripe */}
        <rect x="0" y="0" width="64" height="20" rx="2" fill="#1A1F71" />
        <text x="8" y="15" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontWeight="700" fontStyle="italic" fontSize="14" fill="#FFFFFF">VISA</text>
      </svg>
    );
  }
  if (brand === 'mastercard') {
    return (
      <svg viewBox="0 0 64 40" className={className} aria-label="Mastercard">
        <circle cx="22" cy="20" r="16" fill="#EB001B" />
        <circle cx="42" cy="20" r="16" fill="#F79E1B" />
        {/* Overlap region — Mastercard uses #FF5F00 in the intersection */}
        <path d="M32 6a16 16 0 0 1 0 28a16 16 0 0 1 0-28" fill="#FF5F00" />
      </svg>
    );
  }
  if (brand === 'amex') {
    return (
      <svg viewBox="0 0 64 20" className={className} aria-label="American Express">
        <rect x="0" y="0" width="64" height="20" rx="2" fill="#006FCF" />
        <text x="4" y="8" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontWeight="700" fontSize="7" fill="#FFFFFF">AMERICAN</text>
        <text x="4" y="16" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif" fontWeight="700" fontSize="7" fill="#FFFFFF">EXPRESS</text>
      </svg>
    );
  }
  return <span className="font-semibold uppercase text-[10px] tracking-wide">{CARD_BRAND_LABELS[brand]}</span>;
}

/** EMV chip icon — realistic gold chip with rounded corners, diagonal lines, and contact pads. */
function ChipIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 30" className={className} aria-hidden="true">
      {/* Main chip body */}
      <rect x="1" y="1" width="38" height="28" rx="5" ry="5" fill="#D4A843" stroke="#B8922F" strokeWidth="0.8" />
      {/* Inner border */}
      <rect x="4" y="4" width="32" height="22" rx="3" ry="3" fill="#C9A84C" stroke="#A08030" strokeWidth="0.5" />
      {/* Diagonal lines — EMV chip circuit pattern */}
      <line x1="4" y1="4" x2="36" y2="26" stroke="#A08030" strokeWidth="0.5" />
      <line x1="4" y1="10" x2="36" y2="26" stroke="#A08030" strokeWidth="0.4" />
      <line x1="4" y1="20" x2="36" y2="26" stroke="#A08030" strokeWidth="0.4" />
      <line x1="36" y1="4" x2="4" y2="26" stroke="#A08030" strokeWidth="0.5" />
      <line x1="36" y1="10" x2="4" y2="26" stroke="#A08030" strokeWidth="0.4" />
      <line x1="36" y1="20" x2="4" y2="26" stroke="#A08030" strokeWidth="0.4" />
      {/* Vertical separator lines */}
      <line x1="14" y1="4" x2="14" y2="26" stroke="#A08030" strokeWidth="0.5" />
      <line x1="26" y1="4" x2="26" y2="26" stroke="#A08030" strokeWidth="0.5" />
      {/* Horizontal contact pad accents */}
      <rect x="6" y="6" width="6" height="4" rx="1" fill="#BF9B30" opacity="0.6" />
      <rect x="28" y="6" width="6" height="4" rx="1" fill="#BF9B30" opacity="0.6" />
    </svg>
  );
}

/** Shade picker — 5 preset color dots + label. Clicking changes the card accent shade. */
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
  const masked = `···· ···· ···· ${card.last4}`;
  const expiry = card.expiryMonth && card.expiryYear
    ? `${String(card.expiryMonth).padStart(2, '0')}/${String(card.expiryYear).slice(-2)}`
    : '';
  const shadeMeta = CARD_SHADES[shade];

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative h-[200px] w-[320px] rounded-[40px] overflow-hidden shadow-2xl text-white flex flex-col justify-between"
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
            className="absolute inset-0 rounded-[40px] transition-all duration-700"
            style={{
              background: shadeMeta.borderGradient,
              opacity: 0.8,
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              padding: '3px',
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
            <div className="absolute inset-0 bg-black/55 rounded-[40px]" />
          </>
        ) : (
          <div
            className="absolute inset-0 rounded-[40px]"
            style={{ background: CARD_BRAND_GRADIENTS[card.brand] }}
          />
        )}

        {/* Shimmer overlay */}
        <div className="absolute inset-0 rounded-[40px] overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/8 to-white/0"
            animate={{ x: ['-100%', '100%'] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'linear',
            }}
          />
        </div>

        {/* Card content */}
        <div className="relative z-10 flex justify-between items-start px-6 pt-4">
          <ChipIcon className="h-[24px] w-[34px]" />
          <CardBrandLogo brand={card.brand} className="h-[20px] w-[40px]" />
        </div>

        <div className="relative z-10 px-6 pb-4">
          <p className="text-[20px] tracking-[2px] font-display font-light tabular-nums mt-1">
            {masked}
          </p>
          <div className="flex justify-between items-end mt-3">
            <div>
              <p className="text-[10px] text-white/70 uppercase tracking-wide">
                {card.label}
              </p>
              <div className="flex items-center gap-3 mt-1">
                {expiry && (
                  <p className="text-[12px] font-medium">
                    Exp {expiry}
                  </p>
                )}
                {linkedCount > 0 && (
                  <span className="text-[10px] text-white/70">
                    {linkedCount} linked
                  </span>
                )}
              </div>
            </div>
            {burn > 0 && (
              <div className="text-right">
                <p className="text-[10px] text-white/70 uppercase tracking-wide">
                  Monthly burn
                </p>
                <p className="text-[15px] font-display font-light tabular-nums">
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
