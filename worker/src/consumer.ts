import { Worker, Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import pino from 'pino';
import { redisConnection } from './redis';
import { db } from './db/client';
import { jobs } from './db/schema';
import { getR2ObjectStream } from './video-stream';
import { extractFrames } from './frame-extractor';
import { runInference } from './inference-client';
import { mapDetectionsToMetrics } from './metric-mapper';
import { ExtractedMetric } from './types';
import { finalizeJob } from './job-finalizer';

const logger = pino({
  name: 'aeroguard-worker',
  level: process.env.LOG_LEVEL || 'info',
});

// Setup concurrency (defaults to 2 concurrent jobs)
const concurrency = Number(process.env.WORKER_CONCURRENCY || 2);
const TIMEOUT_MS = 20 * 60 * 1000; // 20 minutes timeout limit

/**
 * Core video processing task handler
 */
export async function processVideoJob(job: Job) {
  const { jobId, r2ObjectKey, fileSizeBytes } = job.data;
  
  logger.info({ jobId, r2ObjectKey, fileSizeBytes }, 'Job started processing');

  const abortController = new AbortController();
  
  // Set up 20 minutes processing watchdog timeout
  const timeoutId = setTimeout(() => {
    logger.warn({ jobId }, 'Job exceeded processing timeout limit. Aborting.');
    abortController.abort();
  }, TIMEOUT_MS);

  try {
    // 1. Update jobs.status = "processing" in database
    await db
      .update(jobs)
      .set({
        status: 'processing',
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    // 2. Fetch the stream from Cloudflare R2
    const videoStream = await getR2ObjectStream(r2ObjectKey);

    // 3. Spawns FFmpeg and decodes PNG frames
    let frameCount = 0;
    let failedInferenceCount = 0;
    const accumulatedMetrics: ExtractedMetric[] = [];
    const startTime = Date.now();
    const fps = Number(process.env.SAMPLE_RATE_FPS || 1);

    for await (const frameBuffer of extractFrames(videoStream, fps, abortController.signal)) {
      if (abortController.signal.aborted) {
        throw new Error('Processing timeout exceeded');
      }

      frameCount++;
      logger.info(
        { jobId, frameIndex: frameCount, bufferSizeBytes: frameBuffer.length },
        'Frame decoded. Sending to inference-service...'
      );

      // Update job progress to track processed frame count
      await job.updateProgress(frameCount);

      // 4. Run model inference with fault-tolerance per frame
      try {
        const detections = await runInference(frameBuffer);
        logger.info(
          { jobId, frameIndex: frameCount, detectionsCount: detections.length },
          'Inference succeeded for frame'
        );

        // 5. Map detections to metrics and accumulate in memory
        const metricsList = mapDetectionsToMetrics(jobId, frameCount, fps, detections);
        accumulatedMetrics.push(...metricsList);
      } catch (infError: any) {
        failedInferenceCount++;
        logger.warn(
          { jobId, frameIndex: frameCount, error: infError.message },
          'Inference failed for single frame. Continuing.'
        );
      }
    }

    const durationSeconds = (Date.now() - startTime) / 1000;

    // 6. Final safety validations
    if (frameCount === 0) {
      throw new Error('No frames were extracted from the video.');
    }

    // 7. Enforce 20% inference failure tolerance threshold
    const failureRate = failedInferenceCount / frameCount;
    if (failureRate > 0.20) {
      throw new Error(
        `Inference failure rate exceeded 20% limit. Failed ${failedInferenceCount} of ${frameCount} frames (${(
          failureRate * 100
        ).toFixed(1)}%).`
      );
    }

    logger.info(
      {
        jobId,
        totalFrames: frameCount,
        failedInferenceFrames: failedInferenceCount,
        accumulatedMetricsCount: accumulatedMetrics.length,
        durationSeconds,
      },
      'Video processing and inference pipeline completed successfully'
    );

    // 8. Finalize job: Persist metrics to NeonDB and purge video from R2
    await finalizeJob(jobId, accumulatedMetrics, r2ObjectKey);
  } catch (error: any) {
    clearTimeout(timeoutId);

    let errorMessage = error.message || 'Unknown processing error';
    if (abortController.signal.aborted) {
      errorMessage = 'Processing timeout exceeded';
    }

    logger.error(
      { jobId, error: errorMessage, stack: error.stack },
      'Job processing failed'
    );

    // Update job status to "failed" and save error message
    try {
      await db
        .update(jobs)
        .set({
          status: 'failed',
          errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(jobs.id, jobId));
    } catch (dbError) {
      logger.error({ jobId, dbError }, 'Failed to record job failure in database');
    }

    // Rethrow to let BullMQ trigger retry/backoff policy
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Initialize and export the BullMQ worker daemon
export const videoWorker = new Worker('video-inspection', processVideoJob, {
  connection: redisConnection,
  concurrency,
});

videoWorker.on('ready', () => {
  logger.info(`BullMQ Worker "video-inspection" is ready with concurrency: ${concurrency}`);
});

videoWorker.on('error', (err) => {
  logger.error(err, 'BullMQ Worker encountered an error');
});
