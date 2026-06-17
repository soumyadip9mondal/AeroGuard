'use client';

import { create } from 'zustand';

interface UIState {
  sidebarExpanded: boolean;
  commandPaletteOpen: boolean;
  mobileDrawerOpen: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setMobileDrawerOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarExpanded: true,
  commandPaletteOpen: false,
  mobileDrawerOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
  setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
}));
