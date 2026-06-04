import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CARD_BRAND_LABELS, CARD_BRAND_GRADIENTS, type CardBrand, type PaymentMethod } from '@/types/paymentMethod';
import { type CardIllustrationTheme } from '@/lib/cardTheme';
import cherryTreeBg from '@/assets/illustrations/storyset/cherry-tree-pana.svg';
import bambooTreeBg from '@/assets/illustrations/storyset/bamboo-tree-pana.svg';
import poppyFlowerBg from '@/assets/illustrations/storyset/poppy-flower-pana.svg';
import springFlowerBg from '@/assets/illustrations/storyset/spring-flower-pana.svg';

const THEME_SVG: Record<CardIllustrationTheme, string> = {
  cherryTree: cherryTreeBg,
  bambooTree: bambooTreeBg,
  poppyFlower: poppyFlowerBg,
  springFlower: springFlowerBg,
};

/** Inline brand logo SVGs — Visa, Mastercard, AMEX only. Others fall back to text. */
function CardBrandLogo({ brand, className }: { brand: CardBrand; className?: string }) {
  if (brand === 'visa') {
    return (
      <svg viewBox="0 0 48 16" className={className} aria-label="Visa">
        <path d="M17.2 15.6h-4L16.2.4h4zM7 15.6H2.8L8.6.4h4.6L20 15.6h-4.2l-1-2.8H8l-1 2.8zm3.6-5.8l-1.6-4.4-1.6 4.4h3.2zM34.4.4L30 11.2 28.6.4h-4.2l3.2 15.2h4.2L38.4.4h-4zM41.6.4h-3.8v15.2h3.8V.4zM48 .4l-3 7.6 3 7.6h-4.4l-3-7.6 3-7.6H48z" fill="currentColor" />
      </svg>
    );
  }
  if (brand === 'mastercard') {
    return (
      <svg viewBox="0 0 48 32" className={className} aria-label="Mastercard">
        <circle cx="16" cy="16" r="14" fill="#EB001B" />
        <circle cx="32" cy="16" r="14" fill="#F79E1B" />
        <path d="M24 4.4a14 14 0 0 1 0 23.2a14 14 0 0 1 0-23.2" fill="#FF5F00" />
      </svg>
    );
  }
  if (brand === 'amex') {
    return (
      <svg viewBox="0 0 48 16" className={className} aria-label="American Express">
        <path d="M2 15.6V.4h5l3 6.4L13 .4h5v15.2h-3.6V5l-3 6.6h-2.4L7.6 5v10.6H2zM22.4.4h4.8v6.2h4V.4h4.8v15.2h-4.8v-6h-4v6h-4.8V.4z" fill="currentColor" />
      </svg>
    );
  }
  return <span className="font-semibold uppercase text-[10px] tracking-wide">{CARD_BRAND_LABELS[brand]}</span>;
}

/** EMV chip icon — gold rectangle with diagonal lines. */
function ChipIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 26" className={className} aria-hidden="true">
      <rect x="1" y="1" width="34" height="24" rx="4" fill="#C9A84C" stroke="#A08030" strokeWidth="1" />
      <line x1="0" y1="0" x2="36" y2="26" stroke="#A08030" strokeWidth="0.6" />
      <line x1="0" y1="6" x2="36" y2="26" stroke="#A08030" strokeWidth="0.4" />
      <line x1="0" y1="20" x2="36" y2="26" stroke="#A08030" strokeWidth="0.4" />
      <line x1="12" y1="0" x2="12" y2="26" stroke="#A08030" strokeWidth="0.4" />
      <line x1="24" y1="0" x2="24" y2="26" stroke="#A08030" strokeWidth="0.4" />
    </svg>
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
  className?: string;
}

export function PaymentCardVisual({
  card,
  burn = 0,
  linkedCount = 0,
  currencySymbol = '$',
  illustrationTheme = 'cherryTree',
  useIllustrationBg = true,
  className,
}: PaymentCardVisualProps) {
  const masked = `···· ···· ···· ${card.last4}`;
  const expiry = card.expiryMonth && card.expiryYear
    ? `${String(card.expiryMonth).padStart(2, '0')}/${String(card.expiryYear).slice(-2)}`
    : '';

  return (
    <motion.div
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative h-[200px] w-[320px] rounded-xl overflow-hidden shadow-2xl text-white flex flex-col justify-between',
        className,
      )}
    >
      {/* Background layer */}
      {useIllustrationBg ? (
        <>
          <img
            src={THEME_SVG[illustrationTheme]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-black/55 rounded-xl" />
        </>
      ) : (
        <div
          className="absolute inset-0 rounded-xl"
          style={{ background: CARD_BRAND_GRADIENTS[card.brand] }}
        />
      )}

      {/* Shimmer overlay */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
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
      <div className="relative z-10 flex justify-between items-start px-5 pt-4">
        <ChipIcon className="h-[22px] w-[32px]" />
        <CardBrandLogo brand={card.brand} className="h-[20px] w-[36px]" />
      </div>

      <div className="relative z-10 px-5 pb-4">
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
  );
}
