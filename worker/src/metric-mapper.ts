import { RawDetection, ExtractedMetric } from './types';

/**
 * Maps model detections to database metrics rows.
 * Computes millisecond timestamp offsets based on frame index and sample rate.
 * 
 * @param jobId The database UUID of the job
 * @param frameIndex 1-based index of the processed frame
 * @param sampleRateFps Sampling rate used during extraction (frames per second)
 * @param detections List of raw detections to map
 * @returns Array of database-ready metric objects
 */
export function mapDetectionsToMetrics(
  jobId: string,
  frameIndex: number,
  sampleRateFps: number,
  detections: RawDetection[]
): ExtractedMetric[] {
  // Compute millisecond offset (e.g. frame index 1 at 1 fps = 1000ms offset)
  const frameTimestampMs = Math.round((frameIndex / sampleRateFps) * 1000);

  return detections.map((detection) => {
    const [x1, y1, x2, y2] = detection.bbox || [null, null, null, null];
    
    return {
      jobId,
      frameTimestampMs,
      metricType: 'defect_detection',
      label: detection.class_name,
      confidence: detection.confidence,
      bboxX1: x1 ?? null,
      bboxY1: y1 ?? null,
      bboxX2: x2 ?? null,
      bboxY2: y2 ?? null,
      rawValue: null,
    };
  });
}
