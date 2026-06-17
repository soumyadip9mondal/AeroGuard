'use client';

import { Activity, AlertTriangle, AlertOctagon, Shield, Wrench, DollarSign } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import KPICard from '@/components/dashboard/KPICard';
import DefectTrend from '@/components/dashboard/DefectTrend';
import FleetOverview from '@/components/dashboard/FleetOverview';
import RecentInspections from '@/components/dashboard/RecentInspections';
import RiskMatrix from '@/components/dashboard/RiskMatrix';
import { kpiData } from '@/lib/mock/dashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-base">
      <TopBar title="Dashboard" />

      <div className="page-enter p-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <KPICard label="Aircraft Inspected" value={kpiData.aircraftInspected} format="number" delta={kpiData.deltas.aircraftInspected} icon={Activity} />
          <KPICard label="Defects Detected" value={kpiData.defectsDetected} format="number" delta={kpiData.deltas.defectsDetected} icon={AlertTriangle} />
          <KPICard label="Critical Findings" value={kpiData.criticalFindings} format="number" delta={kpiData.deltas.criticalFindings} icon={AlertOctagon} />
          <KPICard label="Fleet Health" value={kpiData.fleetHealthScore} format="percentage" delta={kpiData.deltas.fleetHealthScore} icon={Shield} />
          <KPICard label="Open Work Orders" value={kpiData.openWorkOrders} format="number" delta={kpiData.deltas.openWorkOrders} icon={Wrench} />
          <KPICard label="Maintenance Cost" value={kpiData.maintenanceCost} format="currency" delta={kpiData.deltas.maintenanceCost} icon={DollarSign} />
        </div>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DefectTrend />
          </div>
          <div>
            <FleetOverview />
          </div>
        </div>

        {/* Recent Inspections */}
        <RecentInspections />

        {/* Risk Matrix */}
        <RiskMatrix />
      </div>
    </div>
  );
}
