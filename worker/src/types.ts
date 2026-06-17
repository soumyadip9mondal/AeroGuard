// Detection returned by the FastAPI inference service
export interface RawDetection {
  class_name: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
}

// Metric ready to be inserted via Drizzle ORM
export interface ExtractedMetric {
  jobId: string;
  frameTimestampMs: number;
  metricType: string;
  label: string;
  confidence: number | null;
  bboxX1: number | null;
  bboxY1: number | null;
  bboxX2: number | null;
  bboxY2: number | null;
  rawValue: string | null;
}
