'use client';

import { create } from 'zustand';
import { PipelineStage, PipelineStageStatus } from '@/types/inspection';
import { getJobMetrics, Detection, getAuthToken } from '@/lib/api';

const STAGE_DEFAULTS: PipelineStage[] = [
  { name: 'upload', label: 'Upload Complete', status: 'pending' },
  { name: 'frame_extraction', label: 'Frame Extraction', status: 'pending' },
  { name: 'enhancement', label: 'AI Enhancement', status: 'pending' },
  { name: 'defect_detection', label: 'Defect Detection', status: 'pending' },
  { name: 'reconstruction', label: '3D Reconstruction', status: 'pending' },
  { name: 'report_generation', label: 'Report Generation', status: 'pending' },
  { name: 'inventory_check', label: 'Inventory Check', status: 'pending' },
  { name: 'maintenance_recommendations', label: 'Maintenance Recommendations', status: 'pending' },
];

interface InspectionState {
  currentStep: number;
  aircraftModel: string;
  registrationNumber: string;
  tailNumber: string;
  inspectionType: string;
  uploadProgress: number;
  uploadedFile: { name: string; size: string } | null;
  fileObject: File | null;
  jobId: string | null;
  detections: Detection[];
  inferenceTime: number;
  pipelineError: string | null;
  isRejected: boolean;
  pipelineStages: PipelineStage[];
  isUploading: boolean;
  isPipelineRunning: boolean;
  pipelineComplete: boolean;
  setStep: (step: number) => void;
  setField: (field: string, value: string) => void;
  startUpload: (file: File) => void;
  aircraftMake: string;
  airframeSerialNumber: string;
  yearOfManufacture: string;
  engineMake: string;
  engineModel: string;
  engineSerialNumber: string;
  propellerMakeModel: string;
  propellerSerialNumber: string;
  totalAirframeTime: string;
  totalEngineHours: string;

  removeVideo: () => void;
  startPipeline: () => Promise<void>;
  setInspectionData: (data: any) => void;
  reset: () => void;
}

export const useInspectionStore = create<InspectionState>()((set, get) => ({
  currentStep: 1,
  aircraftMake: '',
  aircraftModel: '',
  airframeSerialNumber: '',
  yearOfManufacture: '',
  engineMake: '',
  engineModel: '',
  engineSerialNumber: '',
  propellerMakeModel: '',
  propellerSerialNumber: '',
  totalAirframeTime: '',
  totalEngineHours: '',

  registrationNumber: '',
  tailNumber: '',
  inspectionType: '',
  uploadProgress: 0,
  uploadedFile: null,
  fileObject: null,
  jobId: null,
  detections: [],
  inferenceTime: 0,
  pipelineError: null,
  isRejected: false,
  pipelineStages: STAGE_DEFAULTS.map((s) => ({ ...s })),
  isUploading: false,
  isPipelineRunning: false,
  pipelineComplete: false,

  setStep: (step) => set({ currentStep: step }),
  setField: (field, value) => set({ [field]: value } as any),

  removeVideo: () => set({
    uploadProgress: 0,
    uploadedFile: null,
    fileObject: null,
    jobId: null,
    pipelineError: null,
    isUploading: false,
  }),

  setInspectionData: (data: any) => set({
    detections: data.parts ?? data.detections ?? [],
    jobId: data.inspectionId ?? data.jobId ?? get().jobId,
  }),

  startUpload: async (file) => {
    set({ isUploading: true, uploadProgress: 0, uploadedFile: null, fileObject: file, jobId: null, pipelineError: null });
    try {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      
      let contentType = file.type;
      if (!contentType) {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'mov') contentType = 'video/quicktime';
        else if (ext === 'avi') contentType = 'video/x-msvideo';
        else contentType = 'video/mp4';
      }

      const { 
        aircraftMake, aircraftModel, airframeSerialNumber, yearOfManufacture,
        engineMake, engineModel, engineSerialNumber,
        propellerMakeModel, propellerSerialNumber,
        totalAirframeTime, totalEngineHours,
        registrationNumber, tailNumber, inspectionType 
      } = get();

      const metadata = {
        aircraftMake, aircraftModel, airframeSerialNumber, yearOfManufacture,
        engineMake, engineModel, engineSerialNumber,
        propellerMakeModel, propellerSerialNumber,
        totalAirframeTime, totalEngineHours
      };

      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const token = await getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // 1. Get Presigned URL
      const presignRes = await fetch(`${API_URL}/api/v1/uploads/presign`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          filename: file.name,
          fileSizeBytes: file.size,
          contentType,
          aircraftModel: aircraftModel || 'Unknown',
          registrationNumber: registrationNumber || 'VT-XXX',
          tailNumber: tailNumber || '',
          inspectionType: inspectionType || 'Routine',
          metadata
        })
      });

      if (!presignRes.ok) {
        const err = await presignRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to get secure upload URL');
      }

      const { uploadUrl, jobId } = await presignRes.json();

      // 2. Upload directly to R2 via XMLHttpRequest to track progress
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', contentType);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          set({ uploadProgress: Math.min(progress, 99) });
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            // 3. Notify backend of success
            await fetch(`${API_URL}/api/v1/uploads/upload-success`, {
              method: 'POST',
              headers,
              body: JSON.stringify({ jobId })
            });

            set({
              jobId,
              uploadProgress: 100,
              isUploading: false,
              uploadedFile: { name: file.name, size: `${sizeMb} MB` },
            });
          } catch (notifyErr: any) {
            console.error('Error notifying backend:', notifyErr);
            set({
              isUploading: false,
              pipelineError: 'File uploaded, but failed to initialize processing.',
            });
          }
        } else {
          set({
            isUploading: false,
            pipelineError: `Direct upload failed with status ${xhr.status}`,
          });
        }
      };

      xhr.onerror = () => {
        console.error('R2 direct upload failed. URL was:', uploadUrl?.split('?')[0]);
        set({
          isUploading: false,
          pipelineError: 'Network error during direct upload to R2. This is usually a CORS or credentials issue — check the browser console for details.',
        });
      };

      xhr.send(file);
    } catch (error: any) {
      console.error('Error starting upload process:', error);
      set({
        isUploading: false,
        pipelineError: error.message || 'Failed to start upload process.',
      });
    }
  },

  startPipeline: async () => {
    const pipelineStartTime = Date.now();
    const { fileObject, jobId } = get();
    const stages = STAGE_DEFAULTS.map((s) => ({ ...s }));

    // Initialize running state
    set({
      isPipelineRunning: true,
      pipelineStages: stages,
      pipelineComplete: false,
      pipelineError: null,
      detections: [],
      inferenceTime: 0
    });

    if (!jobId || !fileObject) {
      stages[0].status = 'error';
      set({
        isPipelineRunning: false,
        pipelineError: 'No file uploaded or job ID found. Please go back and upload.',
        pipelineStages: stages
      });
      return;
    }

    try {
      // Step 1: Upload Complete
      stages[0].status = 'complete';
      stages[0].duration = '0.3s';
      set({ pipelineStages: [...stages] });

      // Step 2: Frame Extraction (opens EventSource stream)
      stages[1].status = 'running';
      stages[1].progress = 'Connecting to analysis stream...';
      set({ pipelineStages: [...stages] });

      const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

      // Explicitly start the job
      const startRes = await fetch(`${API_URL}/api/v1/jobs/${jobId}/start`, { method: 'POST' });
      if (!startRes.ok) {
        const errorData = await startRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start analysis.');
      }

      const eventSource = new EventSource(`${API_URL}/api/v1/jobs/${jobId}/stream`);

      const handleCleanup = () => {
        eventSource.close();
      };

      eventSource.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('SSE Event:', data);

          if (data.type === 'status_update') {
            const status = data.status;
            if (status === 'processing') {
              stages[1].status = 'complete';
              stages[1].duration = 'Done';
              stages[1].progress = undefined;

              stages[2].status = 'complete'; // AI Enhancement
              stages[2].duration = 'Done';

              stages[3].status = 'running';
              stages[3].progress = 'Processing frames and running inference...';
              set({ pipelineStages: [...stages] });
            } else if (status === 'rejected') {
              handleCleanup();
              set({
                isPipelineRunning: false,
                isRejected: true,
                pipelineError: 'No aircraft detected. Inspection aborted.',
                pipelineStages: [...stages],
              });
            }
          } else if (data.type === 'progress') {
            const count = typeof data.progress === 'object' ? data.progress.frameCount : data.progress;
            stages[3].progress = `Processing frame ${count || 0}...`;
            set({ pipelineStages: [...stages] });
          } else if (data.type === 'job_complete') {
            handleCleanup();

            stages[3].status = 'complete';
            stages[3].duration = 'Done';
            stages[3].progress = undefined;

            // Fetch final metrics from DB
            stages[4].status = 'running';
            stages[4].progress = 'Mapping metrics to 3D Twin...';
            set({ pipelineStages: [...stages] });

            try {
              const dbMetrics = await getJobMetrics(jobId);
              
              // Map DB metrics to Detection format
              const detectionsList = dbMetrics.map((m) => {
                const x1 = m.bboxX1 || 0;
                const y1 = m.bboxY1 || 0;
                const x2 = m.bboxX2 || 0;
                const y2 = m.bboxY2 || 0;
                const isNormalized = x1 <= 1.0 && y1 <= 1.0 && x2 <= 1.0 && y2 <= 1.0;
                const areaRatio = isNormalized
                  ? Math.max(0, Math.min(1, (x2 - x1) * (y2 - y1)))
                  : Math.max(0, Math.min(1, ((x2 - x1) * (y2 - y1)) / (640 * 640)));

                return {
                  class_name: m.label,
                  confidence: m.confidence || 0,
                  bbox: [x1, y1, x2, y2] as [number, number, number, number],
                  area_ratio: areaRatio,
                };
              });

              // Sequentially complete remaining stages for premium UX
              stages[4].status = 'complete';
              stages[4].duration = '0s';
              stages[4].progress = undefined;

              stages[5].status = 'running';
              stages[5].progress = 'Generating inspection reports...';
              stages[5].status = 'complete';
              stages[5].duration = '0s';
              stages[5].progress = undefined;

              stages[6].status = 'running';
              stages[6].progress = 'Checking parts inventory...';
              stages[6].status = 'complete';
              stages[6].duration = '0s';
              stages[6].progress = undefined;

              stages[7].status = 'running';
              stages[7].progress = 'Finalizing recommendations...';
              stages[7].status = 'complete';
              stages[7].duration = '0s';
              stages[7].progress = undefined;

              const totalTimeMs = Date.now() - pipelineStartTime;

              set({
                isPipelineRunning: false,
                pipelineComplete: true,
                detections: detectionsList,
                inferenceTime: totalTimeMs,
                pipelineStages: [...stages],
              });
            } catch (err: any) {
              console.error('Error post-processing job metrics:', err);
              stages[4].status = 'error';
              set({
                isPipelineRunning: false,
                pipelineError: err.message || 'Failed to fetch job metrics.',
                pipelineStages: [...stages],
              });
            }
          } else if (data.type === 'job_failed') {
            handleCleanup();
            const runningIdx = stages.findIndex((s) => s.status === 'running');
            if (runningIdx !== -1) {
              stages[runningIdx].status = 'error';
            } else {
              stages[3].status = 'error';
            }
            set({
              isPipelineRunning: false,
              pipelineError: data.error || 'Job failed during execution.',
              pipelineStages: [...stages],
            });
          } else if (data.type === 'job_rejected') {
            handleCleanup();
            // Mark validation stage as error, keep prior stages as-is
            const runningIdx = stages.findIndex((s) => s.status === 'running');
            if (runningIdx !== -1) {
              stages[runningIdx].status = 'error';
            }
            set({
              isPipelineRunning: false,
              isRejected: true,
              pipelineError: data.error || 'No aircraft detected. Inspection aborted.',
              pipelineStages: [...stages],
            });
          }
        } catch (parseErr) {
          console.error('Error parsing SSE event data:', parseErr);
        }
      };

      eventSource.onerror = (err) => {
        console.error('EventSource connection error:', err);
        handleCleanup();
        stages[3].status = 'error';
        set({
          isPipelineRunning: false,
          pipelineError: 'EventSource connection disconnected or failed.',
          pipelineStages: [...stages],
        });
      };

    } catch (error: any) {
      console.error('Pipeline startup failed:', error);
      stages[1].status = 'error';
      set({
        isPipelineRunning: false,
        pipelineError: error.message || 'Failed to start pipeline.',
        pipelineStages: [...stages]
      });
    }
  },

  reset: () =>
    set({
      currentStep: 1,
      aircraftModel: '',
      registrationNumber: '',
      tailNumber: '',
      inspectionType: '',
      uploadProgress: 0,
      uploadedFile: null,
      fileObject: null,
      jobId: null,
      detections: [],
      inferenceTime: 0,
      pipelineError: null,
      isRejected: false,
      pipelineStages: STAGE_DEFAULTS.map((s) => ({ ...s })),
      isUploading: false,
      isPipelineRunning: false,
      pipelineComplete: false,
    }),
}));


