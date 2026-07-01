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
import FullscreenLoader from '@/components/shared/FullscreenLoader';
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



function metricToDefect(m: DBMetric, index: number): Defect {
  const sev = deriveSeverity(m.confidence);
  const x1 = m.bboxX1 || 0;
  const y1 = m.bboxY1 || 0;
  const x2 = m.bboxX2 || 0;
  const y2 = m.bboxY2 || 0;
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const detectedLabel = m.label || `Detection ${index + 1}`;

  const priority: Defect['priority'] =
    sev === 'critical' ? 'immediate' :
    sev === 'major' ? 'next_shop_visit' : 'monitor';

  return {
    id: m.id.slice(0, 8),
    inspectionId: m.jobId,
    bladeId: detectedLabel,
    section: m.metricType || 'detection',
    type: detectedLabel,
    severity: sev,
    dimensions: { length: Math.round(width * 100) || 10, width: Math.round(height * 100) || 5 },
    confidence: m.confidence || 0,
    location: `Frame ${m.frameTimestampMs}ms`,
    faaReference: 'AC 33.27',
    recommendation:
      sev === 'critical' ? 'Remove from service immediately' :
      sev === 'major' ? 'Schedule replacement' :
      'Monitor and reinspect',
    partNumber: 'N/A',
    repairCost: sev === 'critical' ? 45000 : sev === 'major' ? 25000 : sev === 'moderate' ? 12000 : 5000,
    priority,
    position3d: {
      x: (x1 + x2) / 2 * 4 - 2,
      y: (y1 + y2) / 2 * 2 - 1,
      z: Math.sin(m.frameTimestampMs / 1000) * 2,
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

  useEffect(() => {
    if (!jobId) return;

    async function fetchData() {
      try {
        const [jobData, metricsData] = await Promise.all([
          getJob(jobId),
          getJobMetrics(jobId),
        ]);
        setJobFilename(jobData.originalFilename || 'Unknown');
        setAircraftModel(jobData.aircraftModel || null);
        const mapped = metricsData.map((m, i) => metricToDefect(m, i));
        setDefects(mapped);
      } catch (err) {
        console.error('Failed to load twin data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    const interval = setInterval(async () => {
      try {
        const jobData = await getJob(jobId);
        if (jobData.status === 'completed' || jobData.status === 'failed') {
          const metricsData = await getJobMetrics(jobId);
          setDefects(metricsData.map((m, i) => metricToDefect(m, i)));
        }
      } catch (err) {
        // Ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId]);

  const selectedDefect = defects.find((d) => d.id === selectedDefectId) || null;

  return (
    <div className="flex h-[100dvh] bg-white text-slate-900 overflow-hidden relative">
      {/* Mobile Top Bar */}
      <div className="absolute top-4 left-4 z-[40] lg:hidden">
        <button onClick={() => setShowMobileList(true)} className="flex items-center justify-center rounded-lg bg-white/90 border border-slate-200 p-2.5 shadow-lg backdrop-blur-sm text-slate-700 hover:bg-slate-50 transition-colors">
          <List className="h-5 w-5" />
        </button>
      </div>

      {/* Left panel — defect list */}
      <aside className={`absolute inset-y-0 left-0 z-[50] w-[85%] max-w-[320px] flex-col border-r border-slate-200 bg-slate-50 transition-transform duration-300 lg:static lg:w-[300px] lg:translate-x-0 lg:flex ${showMobileList ? 'translate-x-0 flex shadow-2xl' : '-translate-x-full hidden'}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 bg-white">
          <div className="flex items-center gap-3">
            <Link href="/app/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="text-[14px] font-medium text-slate-900">3D Digital Twin</div>
              <div className="text-[11px] text-slate-500 font-mono">{jobFilename} · {jobId.slice(0, 8)}</div>
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
      <main className="flex-1 relative bg-white">
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
        ) : !aircraftModel || !['boeing 737', 'airbus a320'].some(m => aircraftModel.toLowerCase().includes(m)) ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white flex-col gap-4">
            <div className="rounded-full bg-slate-50 p-4 border border-slate-200">
              <Box className="h-8 w-8 text-slate-400" />
            </div>
            <div className="text-center">
              <h3 className="text-[16px] font-medium text-slate-800">3D Model Not Available</h3>
              <p className="mt-1 text-[13px] text-slate-500 max-w-sm">
                No 3D model is currently available for the aircraft model: <span className="font-medium text-slate-900">{aircraftModel || 'Unknown'}</span>. We currently support Boeing 737 and Airbus A320.
              </p>
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
