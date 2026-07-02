import { DefectSeverity } from './defect';

export type InspectionStatus = 'pending' | 'in_progress' | 'complete' | 'failed' | 'rejected';
export type InspectionType = 'engine_borescope' | 'airframe' | 'landing_gear' | 'full_inspection';
export type PipelineStageStatus = 'pending' | 'running' | 'complete' | 'error';
export type PipelineStageName =
  | 'upload'
  | 'frame_extraction'
  | 'enhancement'
  | 'defect_detection'
  | 'reconstruction'
  | 'report_generation'
  | 'inventory_check'
  | 'maintenance_recommendations';

export interface PipelineStage {
  name: PipelineStageName;
  label: string;
  status: PipelineStageStatus;
  progress?: string;
  duration?: string;
}

export interface Inspection {
  id: string;
  aircraftModel: string;
  registrationNumber: string;
  tailNumber: string;
  type: InspectionType;
  status: InspectionStatus;
  date: string;
  inspector: string;
  defectsFound: number;
  maxSeverity: DefectSeverity | null;
  videoFile?: { name: string; size: string; duration: string };
}
