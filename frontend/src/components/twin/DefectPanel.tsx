'use client';

import { Defect } from '@/types/defect';
import { useTwinStore } from '@/stores/twin.store';
import SeverityIndicator from '@/components/shared/SeverityIndicator';
import { X, ShoppingCart } from 'lucide-react';

const sevLevel: Record<string, number> = { critical: 5, major: 4, moderate: 3, minor: 2 };

export default function DefectPanel({ defect }: { defect: Defect }) {
  const { setSelectedDefect } = useTwinStore();

  return (
    <aside className="absolute inset-y-0 right-0 z-[60] w-full sm:w-[300px] sm:static shrink-0 animate-slide-in-right border-l border-slate-200 bg-slate-50 overflow-y-auto shadow-2xl sm:shadow-none">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 bg-white">
        <span className="font-mono text-[14px] font-medium text-slate-900">DEFECT {defect.id}</span>
        <button onClick={() => setSelectedDefect(null)} className="text-slate-500 hover:text-slate-900 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div>
          <div className="text-[15px] font-medium text-slate-900 mb-0.5">{defect.bladeId} — {defect.section}</div>
        </div>

        <div className="space-y-3">
          {[
            { label: 'TYPE', value: defect.type.replace(/_/g, ' '), capitalize: true },
            { label: 'SEVERITY', custom: <SeverityIndicator level={sevLevel[defect.severity] || 3} /> },
            { label: 'DIMENSIONS', value: `${defect.dimensions.length}mm × ${defect.dimensions.width}mm`, mono: true },
            { label: 'CONFIDENCE', value: `${Number(defect.confidence).toFixed(1)}%`, mono: true, accent: true },
            { label: 'LOCATION', value: defect.location },
            { label: 'FAA REFERENCE', value: defect.faaReference, mono: true },
            { label: 'RECOMMENDATION', value: defect.recommendation },
            { label: 'PART NUMBER', value: defect.partNumber, mono: true },
            { label: 'REPAIR COST', value: `$${defect.repairCost.toLocaleString()} est.` },
            { label: 'PRIORITY', value: defect.priority.replace(/_/g, ' '), capitalize: true },
          ].map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-4">
              <span className="shrink-0 text-[11px] font-medium uppercase tracking-[0.04em] text-slate-500 pt-0.5">{row.label}</span>
              {row.custom || (
                <span className={`text-right text-[13px] ${row.mono ? 'font-mono' : ''} ${row.accent ? 'text-blue-600 font-medium' : 'text-slate-700'} ${row.capitalize ? 'capitalize' : ''}`}>
                  {row.value}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-4 space-y-2">
          <button className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2.5 text-[13px] font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">
            <ShoppingCart className="h-3.5 w-3.5" /> Draft Parts Order
          </button>
        </div>
      </div>
    </aside>
  );
}
