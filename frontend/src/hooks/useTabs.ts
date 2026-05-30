import { useTabsStore } from '@/stores/tabs';

/** Convenience hook over the tab store, using granular selectors to limit re-renders. */
export function useTabs() {
  const tabs = useTabsStore((s) => s.tabs);
  const activeTabId = useTabsStore((s) => s.activeTabId);
  const openTab = useTabsStore((s) => s.openTab);
  const closeTab = useTabsStore((s) => s.closeTab);
  const setActiveTab = useTabsStore((s) => s.setActiveTab);
  return { tabs, activeTabId, openTab, closeTab, setActiveTab };
}
