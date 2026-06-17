'use client';

import { useTwinStore } from '@/stores/twin.store';
import { Box, Grid3x3, Eye, Layers, Camera, History } from 'lucide-react';

export default function ViewerToolbar() {
  const { viewMode, setViewMode, sectionView, toggleSectionView, toggleHistoricalCompare } = useTwinStore();

  const buttons = [
    { icon: Box, label: 'Solid', active: viewMode === 'solid', onClick: () => setViewMode('solid') },
    { icon: Grid3x3, label: 'Wireframe', active: viewMode === 'wireframe', onClick: () => setViewMode('wireframe') },
    { icon: Eye, label: 'X-Ray', active: viewMode === 'xray', onClick: () => setViewMode('xray') },
    { icon: Layers, label: 'Section', active: sectionView, onClick: toggleSectionView },
    { icon: Camera, label: 'Screenshot', active: false, onClick: () => {} },
    { icon: History, label: 'Compare', active: false, onClick: toggleHistoricalCompare },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-xl border border-border-subtle bg-surface/90 px-2 py-1.5 shadow-lg backdrop-blur-sm">
      {buttons.map((btn, i) => {
        const Icon = btn.icon;
        return (
          <button
            key={btn.label}
            onClick={btn.onClick}
            title={btn.label}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
              btn.active ? 'bg-accent-subtle text-accent' : 'text-text-tertiary hover:text-text-primary hover:bg-elevated'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{btn.label}</span>
          </button>
        );
      })}
    </div>
  );
}
