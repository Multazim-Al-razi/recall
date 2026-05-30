import { motion } from 'framer-motion';
import { PricingPage } from '@/pages/Pricing';

export function UpgradeView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="pb-8"
    >
      <PricingPage />
    </motion.div>
  );
}
