'use client';

import { useState, useEffect } from 'react';
import { useUIStore } from '@/stores/ui.store';
import { Download, Search, FileText, Loader2 } from 'lucide-react';
import { DBJob, getJobs, getJobMetrics } from '@/lib/api';
import { generatePDFReport } from '@/lib/pdfGenerator';

const typeBadge = (t: string) => {
  const cfg: Record<string, { color: string; bg: string }> = {
    completed: { color: '#16A34A', bg: 'rgba(22,163,74,0.10)' },
    processing: { color: '#2563EB', bg: 'rgba(37,99,235,0.12)' },
    failed: { color: '#DC2626', bg: 'rgba(220,38,38,0.10)' },
  };
  const c = cfg[t] || cfg.completed;
  return <span className="rounded-full px-2 py-0.5 text-[10px] font-medium capitalize" style={{ color: c.color, backgroundColor: c.bg }}>{t}</span>;
};

export default function ReportsPage() {
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState<DBJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const setPageTitle = useUIStore((s) => s.setPageTitle);
  useEffect(() => { setPageTitle('Reports', 'Generated PDF inspection reports'); }, [setPageTitle]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getJobs(1, 100);
        // Only show completed jobs in the reports list
        setJobs(data.filter(j => j.status === 'completed'));
      } catch (error) {
        console.error('Failed to load jobs', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleDownload = async (job: DBJob) => {
    setDownloadingId(job.id);
    try {
      const metrics = await getJobMetrics(job.id);
      generatePDFReport(job, metrics);
    } catch (error) {
      console.error('Failed to generate report', error);
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = jobs.filter((r) =>
    !search || 
    (r.originalFilename && r.originalFilename.toLowerCase().includes(search.toLowerCase())) || 
    (r.tailNumber && r.tailNumber.toLowerCase().includes(search.toLowerCase())) ||
    (r.registrationNumber && r.registrationNumber.toLowerCase().includes(search.toLowerCase())) ||
    r.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-enter px-3 py-4 md:p-6 space-y-5 content-max">
        <div className="relative max-w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
          <input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Search files or tail numbers..." 
            className="w-full rounded-md border border-border-subtle bg-elevated pl-9 pr-3 py-2 text-[13px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-accent" 
          />
        </div>

        <div className="rounded-lg border border-border-subtle bg-surface overflow-x-auto shadow-sm">
          {loading ? (
            <>
            <table className="w-full text-left">
              <thead><tr className="border-b border-border-subtle">
                {['Report', 'Tail #', 'Date', 'Status', 'Format', 'Size', ''].map((h) => (
                  <th key={h} className={`px-2 sm:px-4 py-2.5 text-text-tertiary whitespace-nowrap ${['Tail #', 'Format', 'Size'].includes(h) ? 'hidden md:table-cell' : ''} ${h === 'Date' ? 'hidden sm:table-cell' : ''}`} style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border-subtle last:border-0">
                    <td className="px-2 sm:px-4 py-3"><div className="skeleton h-8 w-24 sm:w-32" /></td>
                    <td className="px-2 sm:px-4 py-3 hidden md:table-cell"><div className="skeleton h-4 w-16" /></td>
                    <td className="px-2 sm:px-4 py-3 hidden sm:table-cell"><div className="skeleton h-4 w-24" /></td>
                    <td className="px-2 sm:px-4 py-3"><div className="skeleton h-4 w-16" /></td>
                    <td className="px-2 sm:px-4 py-3 hidden md:table-cell"><div className="skeleton h-4 w-8" /></td>
                    <td className="px-2 sm:px-4 py-3 hidden md:table-cell"><div className="skeleton h-4 w-12" /></td>
                    <td className="px-2 sm:px-4 py-3"><div className="skeleton h-6 w-12 sm:w-20" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            </>
          ) : filtered.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-12 text-text-tertiary">
               <FileText className="h-8 w-8 mb-4 opacity-50" />
               <p className="text-[13px]">No completed inspections found.</p>
             </div>
          ) : (
            <table className="w-full text-left">
              <thead><tr className="border-b border-border-subtle">
                {['Report', 'Tail #', 'Date', 'Status', 'Format', 'Size', ''].map((h) => (
                  <th key={h} className={`px-2 sm:px-4 py-2.5 text-text-tertiary whitespace-nowrap ${['Tail #', 'Format', 'Size'].includes(h) ? 'hidden md:table-cell' : ''} ${h === 'Date' ? 'hidden sm:table-cell' : ''}`} style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{filtered.map((job) => (
                <tr key={job.id} className="border-b border-border-subtle last:border-0 hover:bg-elevated/50 transition-colors">
                  <td className="px-2 sm:px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="hidden sm:block h-4 w-4 text-text-tertiary shrink-0" />
                      <div className="max-w-[120px] sm:max-w-[200px] truncate">
                        <div className="text-[13px] font-medium text-text-primary truncate">{job.originalFilename || 'Inspection Report'}</div>
                        <div className="text-[11px] font-mono text-text-tertiary">{job.id.slice(0,8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 sm:px-4 py-3 text-[13px] text-text-secondary hidden md:table-cell">{job.registrationNumber || job.tailNumber || '-'}</td>
                  <td className="px-2 sm:px-4 py-3 text-[13px] text-text-tertiary hidden sm:table-cell">{new Date(job.createdAt).toLocaleDateString()}</td>
                  <td className="px-2 sm:px-4 py-3">{typeBadge(job.status)}</td>
                  <td className="px-2 sm:px-4 py-3 text-[12px] font-mono text-text-tertiary hidden md:table-cell">PDF</td>
                  <td className="px-2 sm:px-4 py-3 text-[12px] text-text-tertiary hidden md:table-cell">{job.fileSizeBytes ? `${(job.fileSizeBytes / (1024 * 1024)).toFixed(1)} MB` : '-'}</td>
                  <td className="px-2 sm:px-4 py-3 text-right">
                    <button 
                      onClick={() => handleDownload(job)}
                      disabled={downloadingId === job.id}
                      className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border-subtle px-2 sm:px-2.5 py-1 sm:py-1 text-[11px] text-text-secondary hover:text-text-primary hover:border-border-default transition-colors disabled:opacity-50"
                    >
                      {downloadingId === job.id ? <Loader2 className="h-3 w-3 animate-spin shrink-0" /> : <Download className="h-3 w-3 shrink-0" />}
                      <span className="hidden sm:inline">Download</span>
                    </button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
