import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { CARD_BRAND_LABELS, CARD_BRAND_GRADIENTS, type PaymentMethod } from '@/types/paymentMethod';
import cherryTreeBg from '@/assets/illustrations/storyset/cherry-tree-pana.svg';

interface PaymentCardVisualProps {
  card: PaymentMethod;
  burn?: number;
  linkedCount?: number;
  currencySymbol?: string;
  /** Whether to use the illustration background instead of the brand gradient. */
  useIllustrationBg?: boolean;
  className?: string;
}

export function PaymentCardVisual({
  card,
  burn = 0,
  linkedCount = 0,
  currencySymbol = '$',
  useIllustrationBg = true,
  className,
}: PaymentCardVisualProps) {
  const masked = `···· ···· ···· ${card.last4}`;
  const brandLabel = CARD_BRAND_LABELS[card.brand];
  const expiry = card.expiryMonth && card.expiryYear
    ? `${String(card.expiryMonth).padStart(2, '0')}/${String(card.expiryYear).slice(-2)}`
    : '';

  return (
    <motion.div
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'relative h-[200px] w-[320px] rounded-2xl overflow-hidden shadow-2xl text-white flex flex-col justify-between',
        className,
      )}
    >
      {/* Background layer */}
      {useIllustrationBg ? (
        <>
          <img
            src={cherryTreeBg}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-black/55 rounded-2xl" />
        </>
      ) : (
        <div
          className="absolute inset-0 rounded-2xl"
          style={{ background: CARD_BRAND_GRADIENTS[card.brand] }}
        />
      )}

      {/* Shimmer overlay */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
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
      <div className="relative z-10 flex justify-between items-start px-5 pt-5 text-xs tracking-wide">
        <div className="flex items-center gap-2">
          <span className="font-semibold uppercase">{brandLabel}</span>
        </div>
        <span className="text-white/70 uppercase font-semibold">
          {linkedCount > 0 ? `${linkedCount} linked` : 'Card'}
        </span>
      </div>

      <div className="relative z-10 px-5 pb-5">
        <p className="text-[22px] tracking-[2px] font-display font-light tabular-nums">
          {masked}
        </p>
        <div className="flex justify-between items-end mt-3">
          <div>
            <p className="text-[10px] text-white/70 uppercase tracking-wide">
              {card.label}
            </p>
            {expiry && (
              <p className="text-[13px] font-medium mt-0.5">
                Exp {expiry}
              </p>
            )}
          </div>
          {burn > 0 && (
            <div className="text-right">
              <p className="text-[10px] text-white/70 uppercase tracking-wide">
                Monthly burn
              </p>
              <p className="text-[16px] font-display font-light tabular-nums">
                {currencySymbol}{burn.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
