import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import type { PaymentMethod } from '@/types/paymentMethod';
import { CARD_BRAND_COLORS } from '@/types/paymentMethod';
import type { CardShade } from '@/lib/cardTheme';

interface PaymentMethodState {
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (pm: Omit<PaymentMethod, 'id'>) => string;
  updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => void;
  removePaymentMethod: (id: string) => void;
  setCardShade: (id: string, shade: CardShade) => void;
  /** Currently active card index in the carousel. Persisted to localStorage. */
  activeCardIndex: number;
  setActiveCardIndex: (index: number) => void;
}

let nextId = 1;

function migratePaymentMethods(pm: Omit<PaymentMethod, 'id'> & { shade?: string }): Omit<PaymentMethod, 'id'> {
  return {
    ...pm,
    shade: pm.shade ?? 'coral',
    color: pm.color || CARD_BRAND_COLORS[pm.brand],
  };
}

export const usePaymentMethodStore = create<PaymentMethodState>()(
  persist(
    (set) => ({
      paymentMethods: [],
      activeCardIndex: 0,

      addPaymentMethod: (pm: Omit<PaymentMethod, 'id'>) => {
        const id = `pm-${Date.now()}-${nextId++}`;
        const newPm: PaymentMethod = {
          ...migratePaymentMethods(pm),
          id,
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

      setCardShade: (id: string, shade: CardShade) => {
        set((s) => ({
          paymentMethods: s.paymentMethods.map((pm) =>
            pm.id === id ? { ...pm, shade } : pm,
          ),
        }));
      },

      setActiveCardIndex: (index: number) => {
        set({ activeCardIndex: index });
      },
    }),
    {
      name: 'recall-payment-methods',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted: Record<string, unknown>, version: number) => {
        if (version === 0) {
          // Add shade field to existing payment methods
          const state = persisted as unknown as PaymentMethodState & { paymentMethods: Record<string, unknown>[] };
          return {
            ...state,
            paymentMethods: state.paymentMethods.map((pm: Record<string, unknown>) => ({
              ...pm,
              shade: pm.shade ?? 'coral',
            })),
            activeCardIndex: 0,
          };
        }
        return persisted;
      },
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
