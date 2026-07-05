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
import { useMemo } from 'react';
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
  const conf = m.confidence !== null ? m.confidence * 100 : 80;
  const sev = deriveSeverity(conf);
  
  // --- EXACT BBOX-BASED 3D POSITION MAPPING (NDC) ---
  const timeProgress = (m.frameTimestampMs || (index * 1000)) / Math.max(maxTime, 1);

  // 1. Compute exact center of the AI bounding box in pixel space
  const bx1 = m.bboxX1 ?? 0;
  const by1 = m.bboxY1 ?? 0;
  const bx2 = m.bboxX2 ?? 0;
  const by2 = m.bboxY2 ?? 0;
  const bboxCenterX = (bx1 + bx2) / 2;
  const bboxCenterY = (by1 + by2) / 2;

  const isPixelCoords = bx2 > 1;
  const imageWidth = isPixelCoords ? Math.max(bx2, 1920) : 1;
  const imageHeight = isPixelCoords ? Math.max(by2, 1080) : 1;

  // Step 1: Calculate NDC
  const x_ndc = (bboxCenterX / imageWidth) * 2 - 1;
  const y_ndc = -(bboxCenterY / imageHeight) * 2 + 1;

  let camPos: [number, number, number] = [0, 0, 0];
  let camLookAt: [number, number, number] = [0, 0, 0];

  if (timeProgress < 0.4) {
    // Port side
    const localProgress = timeProgress / 0.4;
    const x = 0.5 - localProgress;
    camPos = [x, 0, 0.5]; // 0.5 represents a safe distance outside the bounding box
    camLookAt = [x, 0, 0];
  } else if (timeProgress < 0.8) {
    // Starboard side
    const localProgress = (timeProgress - 0.4) / 0.4;
    const x = -0.5 + localProgress;
    camPos = [x, 0, -0.5];
    camLookAt = [x, 0, 0];
  } else {
    // Top
    const localProgress = (timeProgress - 0.8) / 0.2;
    const z = 0.5 - localProgress;
    camPos = [0, 0.5, z];
    camLookAt = [0, 0, z];
  }

  const bboxWidthPx  = Math.abs(bx2 - bx1);
  const bboxHeightPx = Math.abs(by2 - by1);
  const pxToMm = 15.6;
  const dimLength = bboxWidthPx > 0 ? Math.round(bboxWidthPx * pxToMm) / 10 : 5;
  const dimWidth  = bboxHeightPx > 0 ? Math.round(bboxHeightPx * pxToMm) / 10 : 3;

  return {
    id: `D-${m.id.substring(0, 4)}`,
    inspectionId: m.jobId,
    bladeId: m.partName || `Frame ${Math.floor(m.frameTimestampMs / 1000)}s`,
    section: m.metricType,
    type: m.label,
    severity: sev,
    dimensions: { length: dimLength, width: dimWidth },
    confidence: conf,
    location: `Video Time: ${(m.frameTimestampMs / 1000).toFixed(1)}s`,
    faaReference: 'AC 43.13-1B',
    recommendation: sev === 'critical' ? 'AOG - Immediate Repair' : 'Monitor at next interval',
    partNumber: 'N/A',
    repairCost: sev === 'critical' ? 45000 : sev === 'major' ? 25000 : sev === 'moderate' ? 12000 : 5000,
    priority: sev === 'critical' || sev === 'major' ? 'immediate' : 'monitor',
    position3d: { x: 0, y: 0, z: 0 }, // legacy fallback
    ndc: { x: x_ndc, y: y_ndc },
    cameraState: {
      position: camPos,
      lookAt: camLookAt,
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
  const [validDefectIds, setValidDefectIds] = useState<string[] | null>(null);
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

  const displayDefects = useMemo(() => {
    if (!validDefectIds) return defects;
    return defects.filter(d => validDefectIds.includes(d.id));
  }, [defects, validDefectIds]);

  const selectedDefect = displayDefects.find((d) => d.id === selectedDefectId) || null;

  return (
    <div className="flex w-full h-[calc(100dvh-120px)] sm:h-[calc(100vh-120px)] bg-white text-slate-900 overflow-hidden relative sm:rounded-[24px] shadow-sm sm:border border-slate-200">
      {/* Mobile Top Bar */}
      <div className="absolute top-4 left-4 z-[40] lg:hidden">
        <button onClick={() => setShowMobileList(true)} className="flex items-center justify-center rounded-lg bg-white/90 border border-slate-200 p-2.5 shadow-lg backdrop-blur-sm text-slate-700 hover:bg-slate-50 transition-colors">
          <List className="h-5 w-5" />
        </button>
      </div>

      {/* Left panel — defect list */}
      <aside className={`absolute inset-y-0 left-0 z-[50] w-[85%] max-w-[280px] flex-col border-r border-slate-200 bg-slate-50 transition-transform duration-300 lg:static lg:w-[260px] lg:translate-x-0 lg:flex ${showMobileList ? 'translate-x-0 flex shadow-2xl' : '-translate-x-full hidden'}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-3 sm:px-4 py-3 bg-white gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Link href="/app/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors shrink-0" title="Dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] sm:text-[14px] font-medium text-slate-900 truncate">3D Digital Twin</div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono truncate">
                {jobFilename || 'Untitled'}
              </div>
              <Link href="/app/history" className="text-[10px] sm:text-[11px] text-blue-500 hover:underline">
                View History
              </Link>
            </div>
          </div>
          <button onClick={() => setShowMobileList(false)} className="lg:hidden text-slate-500 hover:text-slate-900 p-1 shrink-0">
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
                {displayDefects.length} Defects Found
              </div>
              {displayDefects.map((d) => (
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
            <EngineViewer defects={defects} onComputed={setValidDefectIds} />
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
