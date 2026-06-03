import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { FlippableSubscriptionCard } from "./FlippableSubscriptionCard";

interface Subscription {
  id: string;
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv?: string;
  subscriptionName: string;
  isActive: boolean;
}

interface SubscriptionCardCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  subscriptions: Subscription[];
  title?: string;
  description?: string;
  className?: string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export const SubscriptionCardCarousel = ({
  className,
  subscriptions = [],
  title = "Your Subscriptions",
  description = "Manage your active and past subscriptions",
  autoPlay = true,
  autoPlayInterval = 5000,
  ...props
}: SubscriptionCardCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeIndex < subscriptions.length - 1) {
      handleNext();
    } else if (isRightSwipe && activeIndex > 0) {
      handlePrev();
    }
  };

  const handleNext = useCallback(() => {
    setActiveIndex((current) => 
      current === subscriptions.length - 1 ? 0 : current + 1
    );
  }, [subscriptions.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((current) => 
      current === 0 ? subscriptions.length - 1 : current - 1
    );
  }, [subscriptions.length]);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  // Auto-play functionality
  React.useEffect(() => {
    if (!autoPlay || subscriptions.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setActiveIndex((current) => 
        current === subscriptions.length - 1 ? 0 : current + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, subscriptions.length, isPaused]);

  if (subscriptions.length === 0) {
    return (
      <div className={cn("w-full max-w-md mx-auto", className)} {...props}>
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-2 mb-4">
            <svg
              className="w-8 h-8 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-ink mb-1">No Subscriptions</h3>
          <p className="text-sm text-muted">{description}</p>
        </div>
      </div>
    );
  }

  const isSingleCard = subscriptions.length === 1;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        "rounded-2xl border border-hairline bg-surface",
        "shadow-md",
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      {...props}
    >
      {/* Header */}
      {!isSingleCard && (
        <div className="px-6 py-4 border-b border-hairline">
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          <p className="text-sm text-muted mt-0.5">{description}</p>
        </div>
      )}

      {/* Carousel Container */}
      <div className="relative p-6">
        {/* Main Card Display */}
        <AnimatePresence initial={false} custom={0} mode="popLayout">
          <motion.div
            key={activeIndex}
            custom={activeIndex}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="flex justify-center"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <FlippableSubscriptionCard
              cardNumber={subscriptions[activeIndex].cardNumber}
              cardholderName={subscriptions[activeIndex].cardholderName}
              expiryDate={subscriptions[activeIndex].expiryDate}
              cvv={subscriptions[activeIndex].cvv}
              subscriptionName={subscriptions[activeIndex].subscriptionName}
              isActive={subscriptions[activeIndex].isActive}
              className="w-full max-w-[340px]"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        {!isSingleCard && subscriptions.length > 1 && (
          <div className="absolute inset-x-0 top-6 flex justify-between items-center px-2 pointer-events-none">
            <button
              onClick={handlePrev}
              disabled={activeIndex === 0}
              className={cn(
                "pointer-events-auto p-2 rounded-full transition-all",
                "bg-surface shadow-md border border-hairline",
                "hover:bg-surface-2",
                activeIndex === 0 
                  ? "opacity-30 cursor-not-allowed" 
                  : "opacity-100 hover:scale-105"
              )}
            >
              <svg
                className="w-5 h-5 text-ink"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              onClick={handleNext}
              disabled={activeIndex === subscriptions.length - 1}
              className={cn(
                "pointer-events-auto p-2 rounded-full transition-all",
                "bg-surface shadow-md border border-hairline",
                "hover:bg-surface-2",
                activeIndex === subscriptions.length - 1
                  ? "opacity-30 cursor-not-allowed"
                  : "opacity-100 hover:scale-105"
              )}
            >
              <svg
                className="w-5 h-5 text-ink"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Dots Indicator */}
        {!isSingleCard && subscriptions.length > 1 && (
          <div className="absolute inset-x-0 bottom-[-16px] flex justify-center gap-2">
            {subscriptions.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "transition-all duration-300 rounded-full",
                  "focus:outline-none focus:ring-2 focus:ring-rausch-glow",
                  index === activeIndex
                    ? "w-8 h-2 bg-rausch"
                    : "w-2 h-2 bg-muted/40 hover:bg-muted/60"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Swipe Hint for Single Card on Mobile */}
      {isSingleCard && (
        <p className="text-center text-[10px] text-muted/60 py-2">
          Tap card to flip
        </p>
      )}
    </div>
  );
};
