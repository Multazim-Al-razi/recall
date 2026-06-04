import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import type { PaymentMethod } from '@/types/paymentMethod';
import { CARD_BRAND_COLORS } from '@/types/paymentMethod';

interface PaymentMethodState {
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (pm: Omit<PaymentMethod, 'id'>) => string;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => void;
  removePaymentMethod: (id: string) => void;
}

let nextId = 1;

export const usePaymentMethodStore = create<PaymentMethodState>()(
  persist(
    (set) => ({
      paymentMethods: [],

      addPaymentMethod: (pm: Omit<PaymentMethod, 'id'>) => {
        const id = `pm-${Date.now()}-${nextId++}`;
        const newPm: PaymentMethod = {
          ...pm,
          id,
          color: pm.color || CARD_BRAND_COLORS[pm.brand],
        };
        set((s) => ({ paymentMethods: [...s.paymentMethods, newPm] }));
        return id;
      },

      updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => {
        set((s) => ({
          paymentMethods: s.paymentMethods.map((pm) =>
            pm.id === id ? { ...pm, ...updates } : pm,
          ),
        }));
      },

      removePaymentMethod: (id: string) => {
        set((s) => ({
          paymentMethods: s.paymentMethods.filter((pm) => pm.id !== id),
        }));
      },
    }),
    {
      name: 'recall-payment-methods',
      version: 0,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function usePaymentMethodFields<K extends keyof PaymentMethodState>(keys: readonly K[]) {
  return usePaymentMethodStore(
    useShallow((s) => {
      const out: Partial<PaymentMethodState> = {};
      for (const k of keys) out[k] = s[k];
      return out as Pick<PaymentMethodState, K>;
    }),
  );
}

/** Get a payment method by ID. */
export function getPaymentMethodById(id: string | undefined): PaymentMethod | undefined {
  if (!id) return undefined;
  return usePaymentMethodStore.getState().paymentMethods.find((pm) => pm.id === id);
}

/** Get subscriptions linked to a specific payment method. */
export function getSubscriptionsForCard(
  subs: { paymentMethodId?: string }[],
  cardId: string,
): { paymentMethodId?: string }[] {
  return subs.filter((s) => s.paymentMethodId === cardId);
}
