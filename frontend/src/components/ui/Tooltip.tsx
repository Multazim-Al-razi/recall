import { useState, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: Placement;
  delay?: number;
  className?: string;
}

const PLACEMENT_CLASSES: Record<Placement, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

const ORIGIN: Record<Placement, string> = {
  top: 'origin-bottom',
  bottom: 'origin-top',
  left: 'origin-right',
  right: 'origin-left',
};

export function Tooltip({
  content,
  children,
  placement = 'top',
  delay = 300,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  return (
    <div
      className={clsx('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={clsx(
              'pointer-events-none absolute z-50 whitespace-nowrap rounded-[8px] bg-dark px-2.5 py-1.5 text-[12px] font-medium text-surface shadow-lg',
              PLACEMENT_CLASSES[placement],
              ORIGIN[placement],
            )}
            role="tooltip"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
