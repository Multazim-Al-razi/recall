import { create } from 'zustand';

export interface Tab {
  /** Route path, used as the unique identifier — e.g. `/dashboard/subscriptions`. */
  id: string;
  title: string;
  /** Optional icon key, resolved by the consuming component. */
  icon?: string;
}

interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
  /** Open a tab. Adds it if absent, then activates it. */
  openTab: (tab: Tab) => void;
  /** Close a tab. If it was active, activate the neighbor (previous, then next, else null). */
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  closeAllTabs: () => void;
}

// Session-only store — intentionally NOT wrapped in persist so tabs reset on reload.
export const useTabsStore = create<TabsState>()((set) => ({
  tabs: [],
  activeTabId: null,

  openTab: (tab) =>
    set((state) => {
      if (state.tabs.some((t) => t.id === tab.id)) {
        return { activeTabId: tab.id };
      }
      return { tabs: [...state.tabs, tab], activeTabId: tab.id };
    }),

  closeTab: (id) =>
    set((state) => {
      const index = state.tabs.findIndex((t) => t.id === id);
      if (index === -1) return state;

      const tabs = state.tabs.filter((t) => t.id !== id);

      if (state.activeTabId !== id) {
        return { tabs };
      }

      // The closed tab was active — pick the previous neighbor, then the next, else null.
      const neighbor = tabs[index - 1] ?? tabs[index] ?? null;
      return { tabs, activeTabId: neighbor ? neighbor.id : null };
    }),

  setActiveTab: (id) => set({ activeTabId: id }),

  closeAllTabs: () => set({ tabs: [], activeTabId: null }),
}));
