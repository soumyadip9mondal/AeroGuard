export type DefectSeverity = 'critical' | 'major' | 'moderate' | 'minor';

export type DefectType =
  | 'surface_crack'
  | 'erosion'
  | 'dent'
  | 'corrosion'
  | 'foreign_object_damage'
  | 'thermal_damage'
  | 'fatigue_crack'
  | 'coating_loss';

export interface Defect {
  id: string;
  inspectionId: string;
  bladeId: string;
  section: string;
  type: DefectType;
  severity: DefectSeverity;
  dimensions: { length: number; width: number };
  confidence: number;
  location: string;
  faaReference: string;
  recommendation: string;
  partNumber: string;
  repairCost: number;
  priority: 'immediate' | 'next_shop_visit' | 'monitor';
  position3d: { x: number; y: number; z: number };
}
