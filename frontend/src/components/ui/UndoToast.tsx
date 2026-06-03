import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, X } from 'lucide-react';

interface Props {
  message: string;
  visible: boolean;
  onUndo: () => void;
  onDismiss: () => void;
}

export function UndoToast({ message, visible, onUndo, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 z-[200] flex -translate-x-1/2 items-center gap-3 rounded-full bg-ink px-5 py-3 text-[13px] font-medium text-canvas shadow-[0_8px_30px_rgba(0,0,0,0.25)]"
          role="status"
          aria-live="polite"
        >
          <span>{message}</span>
          <button
            onClick={onUndo}
            className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[12px] font-semibold text-rausch transition-colors hover:bg-white/25"
          >
            <Undo2 size={13} />
            Undo
          </button>
          <button
            onClick={onDismiss}
            className="ml-1 text-muted transition-colors hover:text-canvas"
            aria-label="Dismiss"
          >
            <X size={15} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}