'use client';

import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, AlertOctagon, Shield, Wrench, DollarSign, Loader2 } from 'lucide-react';
import FullscreenLoader from '@/components/shared/FullscreenLoader';
import { useUIStore } from '@/stores/ui.store';
import KPICard from '@/components/dashboard/KPICard';
import DefectTrend from '@/components/dashboard/DefectTrend';
import FleetOverview from '@/components/dashboard/FleetOverview';
import RecentInspections from '@/components/dashboard/RecentInspections';
import RiskMatrix from '@/components/dashboard/RiskMatrix';
import { getJobs, DBJob } from '@/lib/api';

export default function DashboardPage() {
  const setPageTitle = useUIStore((s) => s.setPageTitle);
  useEffect(() => { setPageTitle('Dashboard'); }, [setPageTitle]);

  const [jobs, setJobs] = useState<DBJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const data = await getJobs(1, 200);
        setJobs(data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();

    // Poll every 5 seconds
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalJobs = jobs.length;
  const completedJobs = jobs.filter((j) => j.status === 'completed').length;
  const totalDefects = jobs.reduce((sum, j) => sum + j.metricsCount, 0);
  const criticalDefects = jobs.filter((j) => j.metricsCount > 0).length;

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const thisWeekJobs = jobs.filter((j) => new Date(j.createdAt) >= oneWeekAgo);
  const lastWeekJobs = jobs.filter((j) => new Date(j.createdAt) >= twoWeeksAgo && new Date(j.createdAt) < oneWeekAgo);

  const getDelta = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  const currCompleted = thisWeekJobs.filter((j) => j.status === 'completed').length;
  const prevCompleted = lastWeekJobs.filter((j) => j.status === 'completed').length;
  const currHealth = thisWeekJobs.length > 0 ? (currCompleted / thisWeekJobs.length) * 100 : 0;
  const prevHealth = lastWeekJobs.length > 0 ? (prevCompleted / lastWeekJobs.length) * 100 : 0;

  const currOpen = thisWeekJobs.filter((j) => j.status === 'processing' || j.status === 'queued').length;
  const prevOpen = lastWeekJobs.filter((j) => j.status === 'processing' || j.status === 'queued').length;

  const currDefects = thisWeekJobs.reduce((sum, j) => sum + j.metricsCount, 0);
  const prevDefects = lastWeekJobs.reduce((sum, j) => sum + j.metricsCount, 0);

  const currCritical = thisWeekJobs.filter((j) => j.metricsCount > 0).length;
  const prevCritical = lastWeekJobs.filter((j) => j.metricsCount > 0).length;

  const kpiData = {
    aircraftInspected: totalJobs,
    defectsDetected: totalDefects,
    criticalFindings: criticalDefects,
    fleetHealthScore: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100 * 10) / 10 : 0,
    openWorkOrders: jobs.filter((j) => j.status === 'processing' || j.status === 'queued').length,
    deltas: {
      aircraftInspected: getDelta(thisWeekJobs.length, lastWeekJobs.length),
      defectsDetected: getDelta(currDefects, prevDefects),
      criticalFindings: getDelta(currCritical, prevCritical),
      fleetHealthScore: getDelta(currHealth, prevHealth),
      openWorkOrders: getDelta(currOpen, prevOpen),
    },
  };

  if (loading) {
    return (
      <div>
        {/* Responsive page padding: tighter on mobile */}
        <div className="px-3 py-4 md:p-6 space-y-6 content-max">
          {/* KPI Row Skeleton — auto-fit grid prevents orphan cards */}
          <div className="grid gap-3 sm:gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))' }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse h-[100px] rounded-lg border border-border-subtle overflow-hidden">
                <div className="skeleton h-full w-full" />
              </div>
            ))}
          </div>

          {/* Charts row Skeleton */}
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 animate-pulse h-[350px] rounded-lg border border-border-subtle overflow-hidden">
              <div className="skeleton h-full w-full" />
            </div>
            <div className="animate-pulse h-[350px] rounded-lg border border-border-subtle overflow-hidden">
              <div className="skeleton h-full w-full" />
            </div>
          </div>

          {/* Recent Inspections Skeleton */}
          <div className="animate-pulse h-[400px] rounded-lg border border-border-subtle overflow-hidden">
            <div className="skeleton h-full w-full" />
          </div>

          {/* Risk Matrix Skeleton */}
          <div className="animate-pulse h-[400px] rounded-lg border border-border-subtle overflow-hidden">
            <div className="skeleton h-full w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* Responsive page padding */}
      <div className="page-enter px-3 py-4 md:p-6 space-y-6 content-max relative z-0">
        
        {/* KPI Row — auto-fit grid prevents orphan cards across all breakpoints */}
        <div className="grid gap-3 sm:gap-4 relative" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(140px, 100%), 1fr))' }}>
          <KPICard label="Total Inspections" value={kpiData.aircraftInspected} format="number" delta={kpiData.deltas.aircraftInspected} icon={Activity} iconColor="text-blue-500" shadowColor="hover:shadow-blue-500/20" />
          <KPICard label="Defects Detected" value={kpiData.defectsDetected} format="number" delta={kpiData.deltas.defectsDetected} icon={AlertTriangle} iconColor="text-orange-500" shadowColor="hover:shadow-orange-500/20" />
          <KPICard label="Inspections With Defects" value={kpiData.criticalFindings} format="number" delta={kpiData.deltas.criticalFindings} icon={AlertOctagon} iconColor="text-red-500" shadowColor="hover:shadow-red-500/20" />
          <KPICard label="Completion Rate" value={kpiData.fleetHealthScore} format="percentage" delta={kpiData.deltas.fleetHealthScore} icon={Shield} iconColor="text-emerald-500" shadowColor="hover:shadow-emerald-500/20" />
          <KPICard label="Processing / Queued" value={kpiData.openWorkOrders} format="number" delta={kpiData.deltas.openWorkOrders} icon={Wrench} iconColor="text-purple-500" shadowColor="hover:shadow-purple-500/20" />
        </div>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DefectTrend jobs={jobs} />
          </div>
          <div>
            <FleetOverview jobs={jobs} />
          </div>
        </div>

        {/* Recent Inspections */}
        <RecentInspections />

        {/* Risk Matrix */}
        <RiskMatrix jobs={jobs} />
      </div>
    </div>
  );
}
