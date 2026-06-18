export const APP_NAME = 'AeroGuard';
export const APP_VERSION = '1.0.0';
export const ORG_NAME = 'AeroGuard Aviation';

export const SEVERITY_LEVELS = ['critical', 'major', 'moderate', 'minor'] as const;
export type SeverityLevel = (typeof SEVERITY_LEVELS)[number];

export const INSPECTION_TYPES = [
  { value: 'engine_borescope', label: 'Engine Borescope' },
  { value: 'airframe', label: 'Airframe Inspection' },
  { value: 'landing_gear', label: 'Landing Gear' },
  { value: 'full_inspection', label: 'Full Inspection' },
] as const;

export const PIPELINE_STAGES = [
  { name: 'upload', label: 'Upload Complete' },
  { name: 'frame_extraction', label: 'Frame Extraction' },
  { name: 'enhancement', label: 'AI Enhancement' },
  { name: 'defect_detection', label: 'Defect Detection' },
  { name: 'reconstruction', label: '3D Reconstruction' },
  { name: 'report_generation', label: 'Report Generation' },
  { name: 'inventory_check', label: 'Inventory Check' },
  { name: 'maintenance_recommendations', label: 'Maintenance Recommendations' },
] as const;

export const SEVERITY_CONFIG = {
  critical: { label: 'Critical', color: 'var(--danger)', bg: 'var(--danger-subtle)', dotClass: 'bg-danger' },
  major:    { label: 'Major',    color: 'var(--warning)', bg: 'var(--warning-subtle)', dotClass: 'bg-warning' },
  moderate: { label: 'Moderate', color: '#EA580C', bg: 'rgba(234,88,12,0.10)', dotClass: 'bg-[#EA580C]' },
  minor:    { label: 'Minor',    color: 'var(--success)', bg: 'var(--success-subtle)', dotClass: 'bg-success' },
} as const;

export const VIDEO_FORMATS = ['MP4', 'MOV', 'AVI', 'MKV', '4K'] as const;
