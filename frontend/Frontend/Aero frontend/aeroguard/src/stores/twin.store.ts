'use client';

import { create } from 'zustand';

interface TwinState {
  selectedDefectId: string | null;
  panelOpen: boolean;
  viewMode: 'solid' | 'wireframe' | 'xray';
  sectionView: boolean;
  historicalCompare: boolean;
  setSelectedDefect: (id: string | null) => void;
  setPanelOpen: (open: boolean) => void;
  setViewMode: (mode: 'solid' | 'wireframe' | 'xray') => void;
  toggleSectionView: () => void;
  toggleHistoricalCompare: () => void;
}

export const useTwinStore = create<TwinState>()((set) => ({
  selectedDefectId: null,
  panelOpen: false,
  viewMode: 'solid',
  sectionView: false,
  historicalCompare: false,
  setSelectedDefect: (id) => set({ selectedDefectId: id, panelOpen: id !== null }),
  setPanelOpen: (open) => set({ panelOpen: open, selectedDefectId: open ? undefined : null }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSectionView: () => set((s) => ({ sectionView: !s.sectionView })),
  toggleHistoricalCompare: () => set((s) => ({ historicalCompare: !s.historicalCompare })),
}));
