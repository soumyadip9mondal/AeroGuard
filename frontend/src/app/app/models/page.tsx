'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useUIStore } from '@/stores/ui.store';
import { getJobs, DBJob } from '@/lib/api';
import { Box, ArrowRight, Loader2 } from 'lucide-react';

export default function ModelsIndexPage() {
  const [jobs, setJobs] = useState<DBJob[]>([]);
  const [loading, setLoading] = useState(true);
  const setPageTitle = useUIStore((s) => s.setPageTitle);
  useEffect(() => { setPageTitle('3D Digital Twins', 'View inspection models'); }, [setPageTitle]);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const data = await getJobs(1, 200);
        // Only show completed jobs that have models
        setJobs(data.filter((j) => j.status === 'completed'));
      } catch (err) {
        console.error('Failed to load jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <div>
      <div className="page-enter p-6 max-w-[960px] mx-auto">
        {loading ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-lg border border-border-subtle bg-surface p-5 shadow-sm">
                  <div className="skeleton h-28 w-full rounded-md mb-4" />
                  <div className="skeleton h-4 w-32 mb-2" />
                  <div className="skeleton h-3 w-20" />
                </div>
              ))}
            </div>
            
          </>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="rounded-full bg-surface p-5 border border-border-subtle mb-5 shadow-sm">
              <Box className="h-8 w-8 text-text-tertiary" />
            </div>
            <h2 className="text-[18px] font-medium text-text-primary mb-2">No 3D Models Yet</h2>
            <p className="text-[13px] text-text-secondary max-w-sm mb-6">
              Complete an inspection to generate a 3D digital twin model. Models are created automatically after the AI pipeline finishes processing.
            </p>
            <Link
              href="/app/inspection/new"
              className="flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Start New Inspection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((job) => {
              const created = new Date(job.createdAt);
              return (
                <Link
                  key={job.id}
                  href={`/app/models/${job.id}`}
                  className="group rounded-lg border border-border-subtle bg-surface p-5 transition-all hover:border-border-default hover:bg-elevated shadow-sm"
                >
                  <div className="flex h-28 items-center justify-center rounded-md bg-base border border-border-subtle mb-4">
                    <Box className="h-10 w-10 text-text-tertiary group-hover:text-accent transition-colors" />
                  </div>
                  <div className="text-[14px] font-medium text-text-primary truncate mb-1">
                    {job.originalFilename || `Job ${job.id.slice(0, 8)}`}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] text-text-tertiary">
                      {created.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[12px] text-text-secondary">
                      {job.metricsCount} defects
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
