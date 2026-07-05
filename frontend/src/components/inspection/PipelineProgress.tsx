'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Loader2, XCircle, FileText, Flag, Box, PlayCircle, ShieldCheck, ShieldAlert, ArrowLeft, AlertTriangle } from 'lucide-react';
import { generatePDFReport } from '@/lib/pdfGenerator';
import { DBJob, DBMetric } from '@/lib/api';
import { useInspectionStore } from '@/stores/inspection.store';
import { DefectSeverity } from '@/types/defect';

function deriveSeverity(confidence: number): DefectSeverity {
  if (confidence >= 0.95) return 'critical';
  if (confidence >= 0.90) return 'major';
  if (confidence >= 0.80) return 'moderate';
  return 'minor';
}

export default function PipelineProgress() {
  const {
    pipelineStages,
    isPipelineRunning,
    pipelineComplete,
    startPipeline,
    detections,
    inferenceTime,
    pipelineError,
    isRejected,
    setStep
  } = useInspectionStore();

  useEffect(() => {
    if (!isPipelineRunning && !pipelineComplete && !pipelineError) {
      startPipeline();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const statusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'running':  return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':    return <XCircle className="h-5 w-5 text-red-500" />;
      default:         return <Circle className="h-5 w-5 text-slate-300" />;
    }
  };

  const criticalCount = detections.filter(d => deriveSeverity(d.confidence) === 'critical').length;
  const majorCount = detections.filter(d => deriveSeverity(d.confidence) === 'major').length;
  const moderateCount = detections.filter(d => deriveSeverity(d.confidence) === 'moderate').length;
  const minorCount = detections.filter(d => deriveSeverity(d.confidence) === 'minor').length;

  return (
    <div className="animate-slide-up space-y-5">
      <div>
        <h2 className="text-[18px] font-medium text-text-primary mb-1">AI Pipeline</h2>
        <p className="text-[13px] text-text-secondary">Processing your inspection file through the detection pipeline.</p>
      </div>

      <div className="rounded-xl shadow-sm border border-slate-200 bg-white p-4 sm:p-6">
        <div className="space-y-1">
          {pipelineStages.map((stage, i) => (
            <div key={stage.name}>
              <div className={`pipeline-stage flex items-center gap-4 rounded-md px-3 py-2.5 ${stage.status === 'running' ? 'active' : stage.status === 'complete' ? 'complete' : ''}`}>
                {statusIcon(stage.status)}
                <div className="flex-1">
                  <span className={`text-[14px] font-medium ${stage.status === 'pending' ? 'text-text-tertiary' : 'text-text-primary'}`}>
                    {stage.label}
                  </span>
                  {stage.progress && (
                    <span className="ml-3 text-[12px] font-mono text-blue-800">{stage.progress}</span>
                  )}
                </div>
                {stage.duration && (
                  <span className="text-[12px] font-mono text-text-tertiary">{stage.duration}</span>
                )}
              </div>
              {i < pipelineStages.length - 1 && (
                <div className="ml-[29px] h-3 w-px bg-border-subtle" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error State Summary */}
      {pipelineError && !isRejected && (
        <div className="animate-slide-up rounded-lg border border-danger/30 bg-danger-subtle p-5">
          <div className="flex items-start gap-3">
            <XCircle className="mt-0.5 h-5 w-5 text-danger shrink-0" />
            <div className="flex-1">
              <h3 className="text-[15px] font-medium text-text-primary mb-1">Pipeline Failed</h3>
              <p className="text-[13px] text-text-secondary mb-4">{pipelineError}</p>
              <button
                onClick={() => {
                  useInspectionStore.getState().removeVideo();
                  setStep(2);
                }}
                className="flex items-center gap-1.5 rounded-md border border-border-default px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejected State — No Aircraft Detected */}
      {isRejected && (
        <div className="animate-slide-up rounded-lg border border-warning/30 bg-warning-subtle p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-warning shrink-0" />
            <div className="flex-1">
              <h3 className="text-[15px] font-medium text-text-primary mb-1">Inspection Rejected</h3>
              <p className="text-[13px] text-text-secondary mb-1">{pipelineError || 'No aircraft detected. Inspection aborted.'}</p>
              <p className="text-[12px] text-text-tertiary mb-4">Only aircraft videos are accepted for inspection. Please upload a video containing an aircraft.</p>
              <button
                onClick={() => {
                  useInspectionStore.getState().removeVideo();
                  setStep(2);
                }}
                className="flex items-center gap-1.5 rounded-md border border-border-default px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results summary */}
      {pipelineComplete && (
        <div className="animate-slide-up rounded-lg border border-success/30 bg-success-subtle p-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-success shrink-0" />
            <div className="w-full">
              <h3 className="text-[15px] font-medium text-text-primary mb-1">Pipeline Complete</h3>
              <p className="text-[13px] text-text-secondary mb-4">
                {detections.length} defect{detections.length === 1 ? '' : 's'} detected in {inferenceTime}ms.
              </p>

              {/* Severity Badges */}
              <div className="mb-4 flex flex-wrap gap-2">
                {criticalCount > 0 && (
                  <span className="rounded border border-danger/30 bg-danger-subtle px-2.5 py-1 text-[11px] font-medium text-danger">
                    {criticalCount} Critical
                  </span>
                )}
                {majorCount > 0 && (
                  <span className="rounded border border-warning/30 bg-warning-subtle px-2.5 py-1 text-[11px] font-medium text-warning">
                    {majorCount} Major
                  </span>
                )}
                {moderateCount > 0 && (
                  <span className="rounded border border-[rgba(234,88,12,0.3)] bg-[rgba(234,88,12,0.1)] px-2.5 py-1 text-[11px] font-medium text-[#EA580C]">
                    {moderateCount} Moderate
                  </span>
                )}
                {minorCount > 0 && (
                  <span className="rounded border border-success/30 bg-success-subtle px-2.5 py-1 text-[11px] font-medium text-success">
                    {minorCount} Minor
                  </span>
                )}
                {detections.length === 0 && (
                  <span className="rounded border border-border-subtle bg-surface px-2.5 py-1 text-[11px] font-medium text-text-tertiary">
                    No Defects Detected
                  </span>
                )}
              </div>

              {/* Bounding box list output */}
              {detections.length > 0 && (
                <div className="mb-5 divide-y divide-border-subtle rounded border border-border-subtle bg-surface overflow-hidden">
                  {detections.map((det, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between px-3.5 py-2.5 text-[13px] transition-colors hover:bg-elevated gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          deriveSeverity(det.confidence) === 'critical' ? 'bg-danger' :
                          deriveSeverity(det.confidence) === 'major' ? 'bg-warning' :
                          deriveSeverity(det.confidence) === 'moderate' ? 'bg-[#EA580C]' : 'bg-success'
                        }`} />
                        <span className="font-medium text-text-primary">{det.class_name}</span>
                      </div>
                      <div className="flex gap-4 text-text-secondary font-mono text-[12px]">
                        <span>Conf: <span className="text-accent">{Math.round(det.confidence)}%</span></span>
                        <span>Area Ratio: <span className="text-text-primary">{(det.area_ratio * 100).toFixed(2)}%</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/app/models/demo" className="flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-[13px] font-medium text-white hover:bg-accent-hover transition-colors">
                  <Box className="h-3.5 w-3.5" /> View 3D Twin
                </Link>
                <button 
                  onClick={() => {
                    // Create mock job/metrics from state
                    const currentJobId = useInspectionStore.getState().jobId || 'unknown';
                    const mockJob: DBJob = {
                      id: currentJobId,
                      r2ObjectKey: '',
                      originalFilename: 'Inspection Report',
                      fileSizeBytes: 0,
                      status: 'completed',
                      errorMessage: null,
                      aircraftModel: useInspectionStore.getState().aircraftModel || '-',
                      registrationNumber: useInspectionStore.getState().registrationNumber || '-',
                      tailNumber: useInspectionStore.getState().tailNumber || '-',
                      inspectionType: useInspectionStore.getState().inspectionType || '-',
                      metadata: {
                        aircraftMake: useInspectionStore.getState().aircraftMake,
                        airframeSerialNumber: useInspectionStore.getState().airframeSerialNumber,
                        yearOfManufacture: useInspectionStore.getState().yearOfManufacture,
                        engineMake: useInspectionStore.getState().engineMake,
                        engineModel: useInspectionStore.getState().engineModel,
                        engineSerialNumber: useInspectionStore.getState().engineSerialNumber,
                        propellerMakeModel: useInspectionStore.getState().propellerMakeModel,
                        propellerSerialNumber: useInspectionStore.getState().propellerSerialNumber,
                        totalAirframeTime: useInspectionStore.getState().totalAirframeTime,
                        totalEngineHours: useInspectionStore.getState().totalEngineHours,
                      },
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      completedAt: new Date().toISOString(),
                      purgedAt: null,
                      metricsCount: detections.length,
                    };
                    const mockMetrics: DBMetric[] = detections.map((d, i) => ({
                      id: `det-${i}`,
                      jobId: currentJobId,
                      frameTimestampMs: 0,
                      metricType: 'detection',
                      label: d.class_name,
                      confidence: d.confidence,
                      bboxX1: null, bboxY1: null, bboxX2: null, bboxY2: null,
                      rawValue: null,
                      createdAt: new Date().toISOString(),
                    }));
                    generatePDFReport(mockJob, mockMetrics);
                  }}
                  className="flex items-center gap-1.5 rounded-md border border-border-default px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" /> Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPipelineRunning && (
        <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning-subtle px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <span className="text-[13px] text-text-secondary">Do not close this page while pipeline is running.</span>
        </div>
      )}
    </div>
  );
}
