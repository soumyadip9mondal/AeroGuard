'use client';

import { create } from 'zustand';

interface TwinState {
  selectedDefectId: string | null;
  panelOpen: boolean;
  viewMode: 'solid' | 'wireframe' | 'xray';
  sectionView: boolean;
  historicalCompare: boolean;
  highlightedParts: string[]; // mesh names to highlight based on inspection
  heatmapMode: boolean; // true shows severity heatmap
  cameraTarget: string | null; // mesh name to focus camera on
  setSelectedDefect: (id: string | null) => void;
  setPanelOpen: (open: boolean) => void;
  setViewMode: (mode: 'solid' | 'wireframe' | 'xray') => void;
  toggleSectionView: () => void;
  toggleHistoricalCompare: () => void;
  setHighlightedParts: (parts: string[]) => void;
  toggleHeatmapMode: () => void;
  setCameraTarget: (target: string | null) => void;
}

export const useTwinStore = create<TwinState>()((set) => ({
  selectedDefectId: null,
  panelOpen: false,
  viewMode: 'solid',
  sectionView: false,
  historicalCompare: false,
  highlightedParts: [],
  heatmapMode: false,
  cameraTarget: null,
  setSelectedDefect: (id) => set({ selectedDefectId: id, panelOpen: id !== null }),
  setPanelOpen: (open) => set({ panelOpen: open, selectedDefectId: open ? undefined : null }),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleSectionView: () => set((s) => ({ sectionView: !s.sectionView })),
  toggleHistoricalCompare: () => set((s) => ({ historicalCompare: !s.historicalCompare })),
  setHighlightedParts: (parts) => set({ highlightedParts: parts }),
  toggleHeatmapMode: () => set((s) => ({ heatmapMode: !s.heatmapMode })),
  setCameraTarget: (target) => set({ cameraTarget: target }),
}));
