'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import DefectBadge from '@/components/shared/DefectBadge';
import DefectPanel from '@/components/twin/DefectPanel';
import ViewerToolbar from '@/components/twin/ViewerToolbar';
import HeatmapLegend from '@/components/twin/HeatmapLegend';
import { defects } from '@/lib/mock/defects';
import { useTwinStore } from '@/stores/twin.store';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const EngineViewer = dynamic(() => import('@/components/twin/EngineViewer'), { ssr: false,
  loading: () => <div className="flex h-full items-center justify-center bg-base"><div className="h-8 w-8 animate-spin rounded-full border-2 border-accent/20 border-t-accent" /></div>
});

const twinDefects = defects.filter((d) => d.inspectionId === 'INS-2024-0847');

export default function DigitalTwinPage() {
  const { selectedDefectId, panelOpen, setSelectedDefect } = useTwinStore();
  const selectedDefect = twinDefects.find((d) => d.id === selectedDefectId) || null;

  return (
    <div className="flex h-screen bg-base overflow-hidden">
      {/* Left panel — defect list */}
      <aside className="hidden w-[300px] shrink-0 flex-col border-r border-border-subtle bg-surface lg:flex">
        <div className="flex items-center gap-3 border-b border-border-subtle px-4 py-3">
          <Link href="/app/dashboard" className="text-text-tertiary hover:text-text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="text-[14px] font-medium text-text-primary">3D Digital Twin</div>
            <div className="text-[11px] text-text-tertiary font-mono">N-737AB · INS-2024-0847</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="px-2 py-1 text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">
            {twinDefects.length} Defects Found
          </div>
          {twinDefects.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDefect(d.id)}
              className={`w-full rounded-md p-3 text-left transition-all ${
                selectedDefectId === d.id
                  ? 'border border-accent/40 bg-accent-subtle'
                  : 'border border-transparent hover:bg-elevated'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-[12px] text-text-primary">{d.id}</span>
                <DefectBadge severity={d.severity} />
              </div>
              <div className="text-[12px] text-text-secondary">{d.bladeId} — {d.section}</div>
              <div className="text-[11px] text-text-tertiary capitalize">{d.type.replace(/_/g, ' ')}</div>
            </button>
          ))}
        </div>
      </aside>

      {/* Center — 3D canvas */}
      <div className="relative flex-1">
        <EngineViewer defects={twinDefects} />
        <ViewerToolbar />
        <HeatmapLegend />
      </div>

      {/* Right panel — defect detail */}
      {panelOpen && selectedDefect && (
        <DefectPanel defect={selectedDefect} />
      )}
    </div>
  );
}
