export interface InspectionPart {
  part: string; // Mesh name, e.g., "LeftWing"
  defect: string; // Description of the defect
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number; // 0-1 confidence score
  frames: number[]; // Frame numbers where defect appears
  explanation?: string;
  recommendedAction?: string;
  estimatedRepairTime?: string;
}

export interface InspectionResult {
  inspectionId: string;
  aircraftId: string;
  timestamp: string; // ISO string
  parts: InspectionPart[];
}
