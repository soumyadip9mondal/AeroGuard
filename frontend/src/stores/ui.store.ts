'use client';

import { create } from 'zustand';

interface UIState {
  /* Mobile sidebar drawer state */
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;

  /* Desktop sidebar collapse state */
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;

  /* Command palette */
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  /* Page title (read by TopBar in AppShell) */
  pageTitle: string;
  pageSubtitle: string | null;
  setPageTitle: (title: string, subtitle?: string) => void;

  /* Route transition hint */
  pendingRoute: string | null;
  setPendingRoute: (route: string | null) => void;

  /* Global Loading Overlay */
  globalLoading: boolean;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  mobileDrawerOpen: false,
  setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),

  sidebarCollapsed: typeof window !== 'undefined' && localStorage.getItem('ag-sidebar-collapsed') === 'true',
  setSidebarCollapsed: (collapsed) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ag-sidebar-collapsed', String(collapsed));
    }
    set({ sidebarCollapsed: collapsed });
  },

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  pageTitle: '',
  pageSubtitle: null,
  setPageTitle: (title, subtitle) => set({ pageTitle: title, pageSubtitle: subtitle ?? null }),

  pendingRoute: null,
  setPendingRoute: (route) => set({ pendingRoute: route }),

  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));

/**
 * Hook for pages to set the topbar title on mount.
 * Usage: useSetPageTitle('Dashboard', 'Overview');
 */
export function useSetPageTitle(title: string, subtitle?: string) {
  const setPageTitle = useUIStore((s) => s.setPageTitle);
  // Must be called inside useEffect in the page component
  return { setPageTitle, title, subtitle };
}
