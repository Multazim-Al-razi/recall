import { createContext, useContext } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

/** Access the toast dispatcher. Must be used within a <ToastProvider>. */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
}
