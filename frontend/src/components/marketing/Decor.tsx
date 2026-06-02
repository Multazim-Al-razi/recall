import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Marketing chrome artifact. Only the floating "UI chip" remains — the ambient
 * gradient blobs and sparkles were removed to keep surfaces on clean warm paper.
 * Everything here is purely decorative (aria-hidden) and respects reduced-motion.
 */

interface FloatingChipProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Float bob animation; disabled under reduced-motion. */
  float?: boolean;
}

/**
 * A small glassy "UI artifact" chip that floats near the hero — e.g. a
 * renewal reminder or a saved-amount badge. Decorative by default.
 */
export function FloatingChip({ children, className = '', delay = 0, float = true }: FloatingChipProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={`glass pointer-events-none absolute flex items-center gap-2 rounded-2xl px-3.5 py-2.5 shadow-[var(--shadow-lg)] ring-1 ring-hairline ${className}`}
      initial={reduce ? false : { opacity: 0, scale: 0.8, y: 10 }}
      animate={
        reduce
          ? undefined
          : { opacity: 1, scale: 1, y: float ? [0, -8, 0] : 0 }
      }
      transition={
        reduce
          ? undefined
          : {
              opacity: { duration: 0.5, delay },
              scale: { duration: 0.5, delay, ease: [0.34, 1.56, 0.64, 1] },
              y: float
                ? { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.5 }
                : undefined,
            }
      }
    >
      {children}
    </motion.div>
  );
}
