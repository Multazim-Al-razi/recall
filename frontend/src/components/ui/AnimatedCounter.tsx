import { useEffect, useState } from 'react';
import { useSpring, useTransform } from 'framer-motion';
import { clsx } from 'clsx';

interface AnimatedCounterProps {
  /** Target value to animate to */
  value: number;
  /** Number of decimal places */
  decimals?: number;
  /** Prefix, e.g. '$' */
  prefix?: string;
  /** Suffix, e.g. '/mo' */
  suffix?: string;
  /** Duration in ms */
  duration?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  decimals = 0,
  prefix,
  suffix,
  className,
}: AnimatedCounterProps) {
  const spring = useSpring(0, { damping: 20, stiffness: 150 });
  const display = useTransform(spring, (v) => v.toFixed(decimals));
  const [displayValue, setDisplayValue] = useState(value.toFixed(decimals));

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = display.on('change', (v) => {
      setDisplayValue(v);
    });
    return unsubscribe;
  }, [display]);

  return (
    <span className={clsx('inline-flex items-baseline tabular-nums', className)}>
      {prefix && <span>{prefix}</span>}
      <span>{displayValue}</span>
      {suffix && <span className="ml-0.5 text-muted">{suffix}</span>}
    </span>
  );
}
