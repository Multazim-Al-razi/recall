import { motion } from 'framer-motion';
import { DashboardPage } from '@/pages/Dashboard';

export function DashboardView() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="pb-8 [&_header]:pt-6 [&_header]:md:pt-8"
    >
      <DashboardPage />
    </motion.div>
  );
}
