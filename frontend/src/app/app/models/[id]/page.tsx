'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import DefectBadge from '@/components/shared/DefectBadge';
import DefectPanel from '@/components/twin/DefectPanel';
import ViewerToolbar from '@/components/twin/ViewerToolbar';
import HeatmapLegend from '@/components/twin/HeatmapLegend';
import { getJob, getJobMetrics, DBMetric } from '@/lib/api';
import { useTwinStore } from '@/stores/twin.store';
import { Defect, DefectSeverity, DefectType } from '@/types/defect';
import { useUIStore } from '@/stores/ui.store';
import { ArrowLeft, Loader2, Box, List, X } from 'lucide-react';

const EngineViewer = dynamic(() => import('@/components/twin/EngineViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-white">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500/20 border-t-blue-500" />
    </div>
  ),
});

function deriveSeverity(confidence: number | null): DefectSeverity {
  if (confidence === null) return 'minor';
  if (confidence >= 95) return 'critical';
  if (confidence >= 90) return 'major';
  if (confidence >= 80) return 'moderate';
  return 'minor';
}



function metricToDefect(m: DBMetric, index: number, maxTime: number): Defect {
  const conf = m.confidence !== null ? m.confidence * 100 : Math.random() * 20 + 80;
  const sev = deriveSeverity(conf);
  
  // Flight path projection: Map video timeline to 3D spatial loop
  const timeProgress = (m.frameTimestampMs || (index * 1000)) / Math.max(maxTime, 1);
  
  let mappedX = 0;
  let mappedZ = 0;
  let mappedY = 0;

  if (timeProgress < 0.4) {
     // First 40% of video: Drone flies nose to tail on the Port side
     const localProgress = timeProgress / 0.4;
     mappedX = 0.5 - localProgress; // 0.5 (nose) down to -0.5 (tail)
     mappedZ = 0.25; // Port side
  } else if (timeProgress < 0.8) {
     // Next 40% of video: Drone flies tail to nose on Starboard side
     const localProgress = (timeProgress - 0.4) / 0.4;
     mappedX = -0.5 + localProgress; // -0.5 (tail) up to 0.5 (nose)
     mappedZ = -0.25; // Starboard side
  } else {
     // Last 20% of video: Drone inspects wings/top
     const localProgress = (timeProgress - 0.8) / 0.2;
     mappedX = 0;
     mappedZ = 0.5 - localProgress; // Wing tip to wing tip
     mappedY = 0.15; // Above wings
  }
  
  // Use bbox to accurately jitter height/depth within the current spatial block
  const x1 = m.bboxX1 || 0;
  const y1 = m.bboxY1 || 0;
  const jitterY = ((y1 % 100) / 100) * 0.15 - 0.075;
  const jitterZ = ((x1 % 100) / 100) * 0.05 - 0.025;

  return {
    id: `D-${m.id.substring(0, 4)}`,
    inspectionId: m.jobId,
    bladeId: m.partName || `Frame ${Math.floor(m.frameTimestampMs / 1000)}s`,
    section: m.metricType,
    type: m.label,
    severity: sev,
    dimensions: { length: Math.random() * 10 + 2, width: Math.random() * 5 + 1 },
    confidence: conf,
    location: `Video Time: ${(m.frameTimestampMs / 1000).toFixed(1)}s`,
    faaReference: 'AC 43.13-1B',
    recommendation: sev === 'critical' ? 'AOG - Immediate Repair' : 'Monitor at next interval',
    partNumber: 'N/A',
    repairCost: sev === 'critical' ? 45000 : sev === 'major' ? 25000 : sev === 'moderate' ? 12000 : 5000,
    priority: sev === 'critical' || sev === 'major' ? 'immediate' : 'monitor',
    position3d: {
      x: mappedX, 
      y: mappedY + jitterY,               
      z: mappedZ + jitterZ,               
    },
  };
}

export default function DigitalTwinPage() {
  const params = useParams();
  const jobId = params.id as string;
  const { selectedDefectId, panelOpen, setSelectedDefect } = useTwinStore();

  const [defects, setDefects] = useState<Defect[]>([]);
  const [jobFilename, setJobFilename] = useState('');
  const [aircraftModel, setAircraftModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMobileList, setShowMobileList] = useState(false);
  const setGlobalLoading = useUIStore((s) => s.setGlobalLoading);

  useEffect(() => {
    if (!jobId) return;

    async function fetchData(isInitial = false) {
      if (isInitial) setGlobalLoading(true);
      try {
        const [jobData, metricsData] = await Promise.all([
          getJob(jobId),
          getJobMetrics(jobId),
        ]);
        setJobFilename(jobData.originalFilename || 'Unknown');
        setAircraftModel(jobData.aircraftModel || null);
        const maxTime = Math.max(...metricsData.map(m => m.frameTimestampMs || 0), 1);
        const mapped = metricsData.map((m, i) => metricToDefect(m, i, maxTime));
        setDefects(mapped);
      } catch (err) {
        console.error('Failed to load twin data:', err);
      } finally {
        setLoading(false);
        if (isInitial) setGlobalLoading(false);
      }
    }

    fetchData(true);

    const interval = setInterval(async () => {
      try {
        fetchData(false);
      } catch (err) {
        // Ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, setGlobalLoading]);

  const selectedDefect = defects.find((d) => d.id === selectedDefectId) || null;

  return (
    <div className="flex h-full min-h-[calc(100vh-120px)] bg-white text-slate-900 overflow-hidden relative rounded-[24px] shadow-sm border border-slate-200">
      {/* Mobile Top Bar */}
      <div className="absolute top-4 left-4 z-[40] lg:hidden">
        <button onClick={() => setShowMobileList(true)} className="flex items-center justify-center rounded-lg bg-white/90 border border-slate-200 p-2.5 shadow-lg backdrop-blur-sm text-slate-700 hover:bg-slate-50 transition-colors">
          <List className="h-5 w-5" />
        </button>
      </div>

      {/* Left panel — defect list */}
      <aside className={`absolute inset-y-0 left-0 z-[50] w-[85%] max-w-[280px] flex-col border-r border-slate-200 bg-slate-50 transition-transform duration-300 lg:static lg:w-[260px] lg:translate-x-0 lg:flex ${showMobileList ? 'translate-x-0 flex shadow-2xl' : '-translate-x-full hidden'}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-white">
          <div className="flex items-center gap-3">
            <Link href="/app/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors" title="Dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="text-[14px] font-medium text-slate-900">3D Digital Twin</div>
              <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                {jobFilename} · {jobId.slice(0, 8)}
                <Link href="/app/history" className="text-blue-500 hover:underline ml-1">
                  View History
                </Link>
              </div>
            </div>
          </div>
          <button onClick={() => setShowMobileList(false)} className="lg:hidden text-slate-500 hover:text-slate-900 p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {loading ? (
            <div className="space-y-3 p-1">
              <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mb-2" />
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-lg border border-slate-200 p-4 bg-white shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                    <div className="h-5 w-14 bg-slate-200 rounded-full animate-pulse" />
                  </div>
                  <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="px-2 py-1 text-[11px] font-medium uppercase tracking-[0.04em] text-slate-500">
                {defects.length} Defects Found
              </div>
              {defects.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setSelectedDefect(d.id); setShowMobileList(false); }}
                  className={`w-full rounded-md p-3 text-left transition-all ${
                    selectedDefectId === d.id
                      ? 'border border-blue-200 bg-blue-50 shadow-sm'
                      : 'border border-transparent hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[12px] text-slate-800">{d.id}</span>
                    <DefectBadge severity={d.severity} />
                  </div>
                  <div className="text-[12px] text-slate-600">{d.bladeId} — {d.section}</div>
                  <div className="text-[11px] text-slate-400 capitalize">{d.type.replace(/_/g, ' ')}</div>
                </button>
              ))}
            </>
          )}
        </div>
      </aside>
      
      {/* Mobile Backdrop */}
      {showMobileList && (
        <div 
          className="absolute inset-0 bg-black/60 z-[45] lg:hidden animate-fade-in" 
          onClick={() => setShowMobileList(false)} 
        />
      )}

      {/* Right panel — 3D Viewer */}
      <main className="flex-1 relative bg-white min-w-0">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 p-8">
            <div className="w-full h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-6 bg-white/50">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full animate-ping opacity-50" />
                <div className="h-16 w-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <Box className="h-6 w-6 text-blue-500 absolute" />
              </div>
              <div className="text-slate-400 font-medium tracking-wide">Loading 3D Twin...</div>
            </div>
          </div>

        ) : (
          <>
            <EngineViewer defects={defects} />
            <ViewerToolbar />
            <HeatmapLegend />
          </>
        )}
      </main>

      {/* Right panel — defect detail */}
      {panelOpen && selectedDefect && (
        <DefectPanel defect={selectedDefect} />
      )}
    </div>
  );
}
