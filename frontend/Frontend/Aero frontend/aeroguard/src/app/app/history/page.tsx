'use client';

import { useState } from 'react';
import Link from 'next/link';
import TopBar from '@/components/layout/TopBar';
import DefectBadge from '@/components/shared/DefectBadge';
import { inspections } from '@/lib/mock/inspections';
import { Search, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';

const typeLabels: Record<string, string> = { engine_borescope: 'Engine Bore', airframe: 'Airframe', landing_gear: 'Landing Gear', full_inspection: 'Full Insp.' };
const statusConfig: Record<string, { label: string; color: string }> = { complete: { label: 'Complete', color: '#16A34A' }, in_progress: { label: 'In Progress', color: '#2563EB' }, failed: { label: 'Failed', color: '#DC2626' }, pending: { label: 'Pending', color: '#71717A' } };

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(0);
  const perPage = 8;

  const filtered = inspections.filter((ins) => {
    if (search && !ins.tailNumber.toLowerCase().includes(search.toLowerCase()) && !ins.aircraftModel.toLowerCase().includes(search.toLowerCase())) return false;
    if (severityFilter.length && ins.maxSeverity && !severityFilter.includes(ins.maxSeverity)) return false;
    if (statusFilter.length && !statusFilter.includes(ins.status)) return false;
    return true;
  });
  const pageData = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) => {
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  return (
    <div className="min-h-screen bg-base">
      <TopBar title="Inspection History" />
      <div className="page-enter flex">
        {/* Filter sidebar */}
        {showFilters && (
          <aside className="hidden w-[260px] shrink-0 border-r border-border-subtle bg-surface p-5 lg:block">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[13px] font-medium text-text-primary">Filters</span>
              <button onClick={() => { setSeverityFilter([]); setStatusFilter([]); setSearch(''); }} className="text-[11px] text-accent hover:text-accent-hover">Clear all</button>
            </div>
            <div className="mb-5">
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
                <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Tail number or aircraft" className="w-full rounded-md border border-border-subtle bg-elevated pl-8 pr-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent" />
              </div>
            </div>
            <div className="mb-5">
              <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">Severity</span>
              {['critical', 'major', 'moderate', 'minor'].map((s) => (
                <label key={s} className="flex items-center gap-2 py-1 text-[13px] text-text-secondary cursor-pointer hover:text-text-primary">
                  <input type="checkbox" checked={severityFilter.includes(s)} onChange={() => { toggle(severityFilter, s, setSeverityFilter); setPage(0); }} className="h-3.5 w-3.5 rounded border-border-default bg-elevated accent-accent" />
                  <span className="capitalize">{s}</span>
                </label>
              ))}
            </div>
            <div className="mb-5">
              <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">Status</span>
              {['complete', 'in_progress', 'failed'].map((s) => (
                <label key={s} className="flex items-center gap-2 py-1 text-[13px] text-text-secondary cursor-pointer hover:text-text-primary">
                  <input type="checkbox" checked={statusFilter.includes(s)} onChange={() => { toggle(statusFilter, s, setStatusFilter); setPage(0); }} className="h-3.5 w-3.5 rounded border-border-default bg-elevated accent-accent" />
                  <span>{statusConfig[s]?.label}</span>
                </label>
              ))}
            </div>
          </aside>
        )}

        {/* Main table */}
        <div className="flex-1 p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[13px] text-text-tertiary">{filtered.length} inspections</span>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 rounded-md border border-border-subtle px-3 py-1.5 text-[12px] text-text-secondary hover:text-text-primary transition-colors lg:hidden">
              <Filter className="h-3.5 w-3.5" /> Filters
            </button>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-subtle">
                  {['Tail #', 'Aircraft', 'Date', 'Inspector', 'Type', 'Defects', 'Severity', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-text-tertiary whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((ins) => {
                  const st = statusConfig[ins.status];
                  return (
                    <tr key={ins.id} className="border-b border-border-subtle last:border-0 hover:bg-elevated/50 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <Link href={`/app/inspection/${ins.id}`} className="font-mono text-[13px] text-text-primary hover:text-accent">{ins.tailNumber}</Link>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-text-secondary whitespace-nowrap">{ins.aircraftModel}</td>
                      <td className="px-4 py-3 text-[13px] text-text-tertiary">{ins.date}</td>
                      <td className="px-4 py-3 text-[13px] text-text-secondary">{ins.inspector}</td>
                      <td className="px-4 py-3 text-[13px] text-text-secondary">{typeLabels[ins.type]}</td>
                      <td className="px-4 py-3 text-[13px] text-text-primary">{ins.defectsFound}</td>
                      <td className="px-4 py-3">{ins.maxSeverity ? <DefectBadge severity={ins.maxSeverity} /> : <span className="text-[11px] text-text-tertiary">—</span>}</td>
                      <td className="px-4 py-3"><span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: st?.color }}><span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: st?.color }} />{st?.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-[12px] text-text-tertiary">Page {page + 1} of {totalPages || 1}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="rounded p-1 text-text-tertiary hover:bg-elevated disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="rounded p-1 text-text-tertiary hover:bg-elevated disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
