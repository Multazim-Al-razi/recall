import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface SubscriptionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv?: string;
  subscriptionName: string;
  isActive: boolean;
}

export const FlippableSubscriptionCard = ({
  className,
  cardNumber,
  cardholderName,
  expiryDate,
  cvv = "123",
  subscriptionName,
  isActive = true,
  ...props
}: SubscriptionCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const variantStyles = {
    active: "bg-gradient-to-br from-rausch/90 via-rausch to-rausch-hover shadow-glow",
    inactive: "bg-gradient-to-br from-surface-2 via-surface border border-hairline grayscale opacity-75",
  };

  return (
    <div
      className={cn("group relative perspective-[1000px]", className)}
      {...props}
    >
      <motion.div
        className="relative w-full h-48"
        style={{ perspective: "1000px" }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Flip Container */}
        <motion.div
          className="relative w-full h-full"
          style={{
            transformStyle: "preserve-3d",
            rotateY: isFlipped ? 180 : 0,
          }}
          animate={{
            rotateY: isFlipped ? 180 : 0,
          }}
          transition={{ 
            duration: 0.6,
            type: "spring",
            stiffness: 100,
            damping: 20
          }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front of Card */}
          <motion.div
            className={cn(
              "absolute inset-0 rounded-xl p-5 flex flex-col justify-between shadow-lg",
              "backface-hidden",
              isActive ? variantStyles.active : variantStyles.inactive,
              !isActive && "opacity-75"
            )}
            style={{ backfaceVisibility: "hidden" }}
          >
            {/* Shimmer Effect */}
            {isActive && (
              <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 3,
                    ease: "linear",
                  }}
                />
              </div>
            )}

            {/* Card Content - Front */}
            <div className="relative z-10 space-y-4">
              {/* Top Row */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-600 to-amber-700 shadow-inner" />
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs font-semibold text-white/90 uppercase tracking-wider"
                    >
                      Active
                    </motion.span>
                  )}
                </div>
                
                {/* Eye Button for CVV */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVisible(!isVisible);
                  }}
                  className={cn(
                    "p-1.5 rounded-full transition-colors",
                    isActive 
                      ? "bg-white/20 hover:bg-white/30 text-white" 
                      : "bg-surface-2 hover:bg-surface text-muted"
                  )}
                >
                  {isVisible ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </motion.button>
              </div>

              {/* Main Information */}
              <div className="space-y-3">
                {/* Last 4 Digits - Always Visible */}
                <div className="font-mono text-xl font-semibold text-white tracking-wider">
                  •••• •••• •••• {cardNumber.slice(-4)}
                </div>

                {/* Bottom Info */}
                <div className="flex justify-between items-end pt-2">
                  <div>
                    <p className="text-[10px] text-white/70 uppercase tracking-wide mb-0.5">
                      Card Holder
                    </p>
                    <p className="text-sm font-medium text-white truncate max-w-[120px]">
                      {cardholderName}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] text-white/70 uppercase tracking-wide mb-0.5">
                      Expires
                    </p>
                    <p className="text-sm font-medium text-white">
                      {isVisible ? expiryDate : "••/••"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Back of Card */}
          <motion.div
            className={cn(
              "absolute inset-0 rounded-xl p-5 flex flex-col shadow-lg",
              isActive ? variantStyles.active : variantStyles.inactive,
              "backface-hidden"
            )}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Magnetic Strip */}
            <div className="mt-4 h-10 w-full bg-neutral-900 rounded-md" />

            {/* CVV Section */}
            <div className="mt-auto">
              <p className="text-[10px] font-semibold uppercase opacity-70 text-white mb-1 ml-1">
                CVV
              </p>
              <div className="flex items-center justify-end gap-2">
                <div className="flex h-9 px-3 items-center justify-end rounded-md bg-canvas/90 min-w-[80px]">
                  <motion.span 
                    className="font-mono text-sm text-ink font-bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {isVisible ? cvv : "•••"}
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Subtitle/Label below card */}
      <div className="mt-3">
        <p className="text-xs font-medium text-ink-soft text-center">
          {subscriptionName}
        </p>
        <p className="text-[10px] text-muted text-center mt-1">
          Click to reveal details
        </p>
      </div>
    </div>
  );
};
