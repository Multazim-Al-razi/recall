import { useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  /** Max width class, e.g. 'max-w-[440px]' */
  maxWidth?: string;
  /** Whether clicking the backdrop closes the modal */
  closeOnBackdrop?: boolean;
}

export function Modal({
  open,
  onClose,
  children,
  title,
  maxWidth = 'max-w-[440px]',
  closeOnBackdrop = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;
    if (!node) return;

    const focusable = () =>
      node.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );

    const first = focusable()[0];
    first?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;
      const items = focusable();
      if (items.length === 0) return;
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    }

    node.addEventListener('keydown', onKeyDown);
    return () => node.removeEventListener('keydown', onKeyDown);
  }, [open]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden
          />

          {/* Dialog */}
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={clsx(
              'relative z-10 w-full overflow-y-auto rounded-[20px] bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:p-7',
              maxWidth,
            )}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <X size={18} />
            </button>

            {/* Title */}
            {title && (
              <h2 className="mb-5 pr-8 text-xl font-semibold">{title}</h2>
            )}

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
