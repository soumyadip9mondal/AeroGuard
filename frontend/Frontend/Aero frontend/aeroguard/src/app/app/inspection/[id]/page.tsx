'use client';

import Link from 'next/link';
import TopBar from '@/components/layout/TopBar';
import DefectBadge from '@/components/shared/DefectBadge';
import SeverityIndicator from '@/components/shared/SeverityIndicator';
import { Box, FileText, Flag, CheckCircle2 } from 'lucide-react';
import { defects } from '@/lib/mock/defects';

const inspection = {
  id: 'INS-2024-0847', tailNumber: 'N-737AB', aircraftModel: 'Boeing 737-800',
  registrationNumber: 'N73742', date: '2025-06-12', inspector: 'J. Rivera',
  type: 'Engine Borescope', status: 'complete' as const,
};

const relatedDefects = defects.filter((d) => d.inspectionId === 'INS-2024-0847');

export default function InspectionDetailPage() {
  return (
    <div className="min-h-screen bg-base">
      <TopBar title="Inspection Detail" subtitle={inspection.id} />
      <div className="page-enter p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border-subtle bg-surface p-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-[22px] font-medium text-text-primary">{inspection.tailNumber}</span>
              <DefectBadge severity="critical" size="md" />
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-text-secondary">
              <span>{inspection.aircraftModel}</span>
              <span>Reg: <span className="font-mono text-text-primary">{inspection.registrationNumber}</span></span>
              <span>{inspection.date}</span>
              <span>Inspector: {inspection.inspector}</span>
              <span>{inspection.type}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/app/models/demo" className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-[13px] font-medium text-white hover:bg-accent-hover transition-colors">
              <Box className="h-3.5 w-3.5" /> View 3D Twin
            </Link>
            <button className="flex items-center gap-1.5 rounded-md border border-border-default px-4 py-2 text-[13px] text-text-secondary hover:text-text-primary transition-colors">
              <FileText className="h-3.5 w-3.5" /> Download Report
            </button>
            <button className="flex items-center gap-1.5 rounded-md border border-border-default px-4 py-2 text-[13px] text-text-secondary hover:text-text-primary transition-colors">
              <Flag className="h-3.5 w-3.5" /> Flag for Review
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {[
            { label: 'Total Defects', value: relatedDefects.length, color: '#FAFAFA' },
            { label: 'Critical', value: relatedDefects.filter((d) => d.severity === 'critical').length, color: '#DC2626' },
            { label: 'Major', value: relatedDefects.filter((d) => d.severity === 'major').length, color: '#D97706' },
            { label: 'Moderate', value: relatedDefects.filter((d) => d.severity === 'moderate').length, color: '#EA580C' },
            { label: 'Minor', value: relatedDefects.filter((d) => d.severity === 'minor').length, color: '#16A34A' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border-subtle bg-surface p-4">
              <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">{s.label}</span>
              <div className="mt-1 text-[28px] font-medium leading-none" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Defects */}
        <div>
          <h3 className="mb-4 text-[15px] font-medium text-text-primary">Detected Defects</h3>
          <div className="space-y-3">
            {relatedDefects.map((d) => (
              <div key={d.id} className="rounded-lg border border-border-subtle bg-surface p-5 transition-colors hover:border-border-default">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[14px] font-medium text-text-primary">{d.id}</span>
                    <DefectBadge severity={d.severity} />
                  </div>
                  <SeverityIndicator level={d.severity === 'critical' ? 5 : d.severity === 'major' ? 4 : d.severity === 'moderate' ? 3 : 2} />
                </div>
                <div className="grid gap-x-8 gap-y-2 text-[13px] sm:grid-cols-2 lg:grid-cols-3">
                  <div><span className="text-text-tertiary">Blade:</span> <span className="text-text-primary">{d.bladeId} — {d.section}</span></div>
                  <div><span className="text-text-tertiary">Type:</span> <span className="text-text-primary">{d.type.replace(/_/g, ' ')}</span></div>
                  <div><span className="text-text-tertiary">Dimensions:</span> <span className="font-mono text-text-primary">{d.dimensions.length}mm × {d.dimensions.width}mm</span></div>
                  <div><span className="text-text-tertiary">Confidence:</span> <span className="text-accent font-mono">{d.confidence}%</span></div>
                  <div><span className="text-text-tertiary">Location:</span> <span className="text-text-primary">{d.location}</span></div>
                  <div><span className="text-text-tertiary">FAA Ref:</span> <span className="font-mono text-text-primary">{d.faaReference}</span></div>
                  <div className="sm:col-span-2 lg:col-span-3"><span className="text-text-tertiary">Recommendation:</span> <span className="text-text-primary">{d.recommendation}</span></div>
                  <div><span className="text-text-tertiary">Part #:</span> <span className="font-mono text-text-primary">{d.partNumber}</span></div>
                  <div><span className="text-text-tertiary">Est. Cost:</span> <span className="text-text-primary">${d.repairCost.toLocaleString()}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
