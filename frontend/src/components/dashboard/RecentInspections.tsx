'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DefectBadge from '@/components/shared/DefectBadge';
import { inspections } from '@/lib/mock/inspections';

const typeLabels: Record<string, string> = {
  engine_borescope: 'Engine Bore',
  airframe: 'Airframe',
  landing_gear: 'Landing Gear',
  full_inspection: 'Full Insp.',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  complete: { label: 'Complete', color: '#16A34A' },
  in_progress: { label: 'In Progress', color: '#2563EB' },
  failed: { label: 'Failed', color: '#DC2626' },
  pending: { label: 'Pending', color: '#71717A' },
};

export default function RecentInspections() {
  const [page, setPage] = useState(0);
  const perPage = 5;
  const pageData = inspections.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(inspections.length / perPage);

  return (
    <div className="rounded-lg border border-border-subtle bg-surface">
      <div className="flex items-center justify-between border-b border-border-subtle px-5 py-3">
        <h3 className="text-[15px] font-medium text-text-primary">Recent Inspections</h3>
        <Link href="/app/history" className="text-[12px] text-accent hover:text-accent-hover transition-colors">
          View all →
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border-subtle">
              {['Tail #', 'Aircraft', 'Date', 'Inspector', 'Type', 'Defects', 'Severity', 'Status'].map((h) => (
                <th
                  key={h}
                  className="px-5 py-2.5 text-text-tertiary"
                  style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((ins) => {
              const st = statusLabels[ins.status];
              return (
                <tr key={ins.id} className="border-b border-border-subtle last:border-0 transition-colors hover:bg-elevated/50">
                  <td className="px-5 py-3 font-mono text-[13px] text-text-primary">{ins.tailNumber}</td>
                  <td className="px-5 py-3 text-[13px] text-text-secondary">{ins.aircraftModel}</td>
                  <td className="px-5 py-3 text-[13px] text-text-tertiary">{ins.date}</td>
                  <td className="px-5 py-3 text-[13px] text-text-secondary">{ins.inspector}</td>
                  <td className="px-5 py-3 text-[13px] text-text-secondary">{typeLabels[ins.type]}</td>
                  <td className="px-5 py-3 text-[13px] text-text-primary">{ins.defectsFound}</td>
                  <td className="px-5 py-3">
                    {ins.maxSeverity ? <DefectBadge severity={ins.maxSeverity} /> : <span className="text-[11px] text-text-tertiary">None</span>}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: st.color }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: st.color }} />
                      {st.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border-subtle px-5 py-3">
        <span className="text-[12px] text-text-tertiary">
          Page {page + 1} of {totalPages}
        </span>
        <div className="flex gap-1">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="rounded p-1 text-text-tertiary hover:bg-elevated disabled:opacity-30 transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="rounded p-1 text-text-tertiary hover:bg-elevated disabled:opacity-30 transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
