import { motion } from 'framer-motion';
import { SubscriptionsPage } from '@/pages/Subscriptions';

export function SubscriptionsView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="pb-8"
    >
      <SubscriptionsPage />
    </motion.div>
  );
}
