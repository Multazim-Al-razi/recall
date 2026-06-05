import { useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useSubscriptionStore,
  getUpcomingRenewals,
  getExpiringTrials,
} from '@/stores/subscription';

/**
 * Reminders card — click the bell to toggle reminders on/off.
 *
 *  • Big bell fills the card; no background pill behind it.
 *  • On  → rausch colour, rings on a slow loop when items need action.
 *  • Off → muted colour, settles to rest, no ring.
 *  • The whole card surface is the toggle target.
 */
export function StatusLockCard() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const [remindersOn, setRemindersOn] = useState(true);

  const atRisk = useMemo(() => {
    const renewals = getUpcomingRenewals(subscriptions, 2).length;
    const trials = getExpiringTrials(subscriptions, 7).length;
    return renewals + trials;
  }, [subscriptions]);

  const shouldRing = remindersOn && atRisk > 0;

  return (
    <motion.button
      type="button"
      onClick={() => setRemindersOn((v) => !v)}
      whileTap={{ scale: 0.96 }}
      aria-label={
        remindersOn
          ? `Reminders on${atRisk > 0 ? ` (${atRisk} pending)` : ''}`
          : 'Reminders off'
      }
      aria-pressed={remindersOn}
      className="card-premium flex h-full min-h-[150px] w-full flex-col items-center justify-center gap-2 rounded-[20px] p-4"
    >
      <motion.div
        key={remindersOn ? 'on' : 'off'}
        animate={
          shouldRing
            ? { rotate: [0, -16, 16, -14, 14, -8, 8, 0] }
            : { rotate: 0 }
        }
        transition={
          shouldRing
            ? {
                duration: 1,
                repeat: Infinity,
                repeatDelay: 2.2,
                ease: 'easeInOut',
              }
            : { duration: 0.3, ease: 'easeOut' }
        }
        style={{ transformOrigin: '50% 0%' }}
        className="flex items-center justify-center"
      >
        <Bell
          size={60}
          strokeWidth={1.6}
          className={remindersOn ? 'text-rausch' : 'text-muted'}
        />
      </motion.div>

      <div className="text-[10px] font-medium uppercase tracking-[1.5px] text-muted">
        {remindersOn ? 'Reminders on' : 'Reminders off'}
      </div>
    </motion.button>
  );
}
