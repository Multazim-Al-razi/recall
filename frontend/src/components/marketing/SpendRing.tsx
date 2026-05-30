import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  amount: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function SpendRing({
  amount,
  size = 180,
  strokeWidth = 10,
  className = '',
}: Props) {
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [displayAmount, setDisplayAmount] = useState(
    prefersReduced ? amount : 0,
  );
  const ringRef = useRef<SVGCircleElement>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const maxAmount = 500;
  const progress = Math.min(amount / maxAmount, 1);
  const offset = circumference * (1 - progress);

  useEffect(() => {
    if (prefersReduced) return;

    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayAmount(Math.round(amount * eased));
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [amount, prefersReduced]);

  useEffect(() => {
    if (ringRef.current) {
      ringRef.current.style.strokeDashoffset = String(
        prefersReduced ? offset : circumference,
      );
      if (!prefersReduced) {
        requestAnimationFrame(() => {
          if (ringRef.current) {
            ringRef.current.style.transition =
              'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
            ringRef.current.style.strokeDashoffset = String(offset);
          }
        });
      }
    }
  }, [offset, circumference, prefersReduced]);

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        role="img"
        aria-label={`$${amount} per month`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-ink/6"
        />
        <circle
          ref={ringRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-rausch)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-[32px] font-bold tracking-[-1.5px] text-ink">
          ${displayAmount}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-[1px] text-muted">
          / month
        </span>
      </div>
    </motion.div>
  );
}
