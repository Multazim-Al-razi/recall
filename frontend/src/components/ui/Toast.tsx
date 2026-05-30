import { useEffect, useCallback, useState, createContext, useContext, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_ICONS: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const TOAST_COLORS: Record<ToastType, string> = {
  success: 'bg-success/10 text-success border-success/20',
  error: 'bg-rausch/10 text-rausch border-rausch/20',
  info: 'bg-ink/5 text-ink border-ink/10',
};

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = TOAST_ICONS[t.type];

  useEffect(() => {
    const timer = setTimeout(() => onDismiss(t.id), 4000);
    return () => clearTimeout(timer);
  }, [t.id, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={clsx(
        'flex items-center gap-3 rounded-[12px] border px-4 py-3 text-[13px] font-medium shadow-lg backdrop-blur-sm',
        TOAST_COLORS[t.type],
      )}
      role="status"
    >
      <Icon size={16} className="shrink-0" />
      <span className="flex-1">{t.message}</span>
      <button
        onClick={() => onDismiss(t.id)}
        className="shrink-0 text-current opacity-50 transition-opacity hover:opacity-100"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col-reverse gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
}
