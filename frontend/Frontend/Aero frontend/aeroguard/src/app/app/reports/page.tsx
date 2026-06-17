'use client';

import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { Download, Search, FileText } from 'lucide-react';

const reports = [
  { id: 'RPT-2847', inspectionId: 'INS-2024-0847', tailNumber: 'N-737AB', title: 'Engine Borescope Compliance Report', type: 'compliance' as const, date: '2025-06-12', format: 'PDF' as const, size: '2.4 MB', refs: ['AC 33.27', 'EASA Part-145'] },
  { id: 'RPT-2846', inspectionId: 'INS-2024-0846', tailNumber: 'B-A380C', title: 'Airframe Inspection Summary', type: 'detailed' as const, date: '2025-06-11', format: 'PDF' as const, size: '1.8 MB', refs: ['AC 43.13-1B'] },
  { id: 'RPT-2845', inspectionId: 'INS-2024-0845', tailNumber: 'N-320XD', title: 'Full Inspection Executive Summary', type: 'executive' as const, date: '2025-06-10', format: 'PDF' as const, size: '890 KB', refs: ['AC 33.27', 'AC 43.13-1B'] },
  { id: 'RPT-2844', inspectionId: 'INS-2024-0844', tailNumber: 'N-777EK', title: 'Engine Bore Detailed Analysis', type: 'detailed' as const, date: '2025-06-09', format: 'XLSX' as const, size: '3.1 MB', refs: ['AC 33.27'] },
  { id: 'RPT-2843', inspectionId: 'INS-2024-0843', tailNumber: 'N-7M8UA', title: 'Landing Gear Compliance Report', type: 'compliance' as const, date: '2025-06-08', format: 'PDF' as const, size: '1.2 MB', refs: ['AC 43.13-1B'] },
  { id: 'RPT-2842', inspectionId: 'INS-2024-0841', tailNumber: 'N-E190B', title: 'Full Inspection Report', type: 'detailed' as const, date: '2025-06-06', format: 'PDF' as const, size: '4.7 MB', refs: ['AC 33.27', 'EASA Part-145'] },
  { id: 'RPT-2841', inspectionId: 'INS-2024-0840', tailNumber: 'N-737CD', title: 'Critical Defect Executive Brief', type: 'executive' as const, date: '2025-06-05', format: 'PDF' as const, size: '540 KB', refs: ['AC 33.27'] },
  { id: 'RPT-2840', inspectionId: 'INS-2024-0838', tailNumber: 'N-777JL', title: 'Engine Borescope Compliance Report', type: 'compliance' as const, date: '2025-06-03', format: 'PDF' as const, size: '2.1 MB', refs: ['AC 33.27'] },
];

const typeBadge = (t: string) => {
  const cfg: Record<string, { color: string; bg: string }> = {
    compliance: { color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
    executive: { color: '#D97706', bg: 'rgba(217,119,6,0.10)' },
    detailed: { color: '#16A34A', bg: 'rgba(22,163,74,0.10)' },
  };
  const c = cfg[t] || cfg.detailed;
  return <span className="rounded-full px-2 py-0.5 text-[10px] font-medium capitalize" style={{ color: c.color, backgroundColor: c.bg }}>{t}</span>;
};

export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const filtered = reports.filter((r) =>
    !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.tailNumber.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-base">
      <TopBar title="Reports" subtitle="Compliance report library" />
      <div className="page-enter p-6 space-y-5">
        <div className="relative max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reports or tail numbers..." className="w-full rounded-md border border-border-subtle bg-elevated pl-9 pr-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent" />
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr className="border-b border-border-subtle">
              {['Report', 'Tail #', 'Date', 'Type', 'Format', 'Size', ''].map((h) => (
                <th key={h} className="px-4 py-2.5 text-text-tertiary whitespace-nowrap" style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{filtered.map((r) => (
              <tr key={r.id} className="border-b border-border-subtle last:border-0 hover:bg-elevated/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-text-tertiary shrink-0" />
                    <div>
                      <div className="text-[13px] font-medium text-text-primary">{r.title}</div>
                      <div className="text-[11px] font-mono text-text-tertiary">{r.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-[13px] text-text-primary">{r.tailNumber}</td>
                <td className="px-4 py-3 text-[13px] text-text-tertiary">{r.date}</td>
                <td className="px-4 py-3">{typeBadge(r.type)}</td>
                <td className="px-4 py-3 text-[12px] font-mono text-text-tertiary">{r.format}</td>
                <td className="px-4 py-3 text-[12px] text-text-tertiary">{r.size}</td>
                <td className="px-4 py-3">
                  <button className="flex items-center gap-1 rounded-md border border-border-subtle px-2.5 py-1 text-[11px] text-text-secondary hover:text-text-primary hover:border-border-default transition-colors">
                    <Download className="h-3 w-3" /> Download
                  </button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
