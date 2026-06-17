import { RawDetection } from './types';
import * as dotenv from 'dotenv';

dotenv.config();

const INFERENCE_SERVICE_URL = process.env.INFERENCE_SERVICE_URL || 'http://inference-service:8000';
const CONFIDENCE_THRESHOLD = Number(process.env.CONFIDENCE_THRESHOLD || 0.25);

/**
 * Sends frame image bytes to the inference service for object detection.
 * Uses native Node.js 20 fetch, FormData, and Blob.
 * 
 * @param frameBuffer Binary image buffer of a video frame
 * @returns Array of filtered raw detections
 */
export async function runInference(frameBuffer: Buffer): Promise<RawDetection[]> {
  const detectUrl = `${INFERENCE_SERVICE_URL}/detect`;

  // Construct multipart form data using global FormData & Blob
  const formData = new FormData();
  const fileBlob = new Blob([new Uint8Array(frameBuffer)], { type: 'image/jpeg' });
  formData.append('file', fileBlob, 'frame.jpg');

  try {
    // Call the FastAPI endpoint with a 10-second timeout limit
    const response = await fetch(detectUrl, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    if (!response.ok) {
      throw new Error(`Inference API returned ${response.status}: ${response.statusText}`);
    }

    const data = (await response.json()) as { detections?: RawDetection[] };
    const rawDetections = data.detections || [];

    // Filter detections on confidence scores
    return rawDetections.filter((detection) => detection.confidence >= CONFIDENCE_THRESHOLD);
  } catch (error) {
    // The caller is responsible for handling error counting and resilience logging
    throw error;
  }
}
