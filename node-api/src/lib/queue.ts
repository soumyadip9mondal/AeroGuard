import { Queue } from 'bullmq';
import { redisConnection } from './redis';

// Define the payload structure for queue processing jobs
export interface VideoJobPayload {
  jobId: string;
  r2ObjectKey: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

// Initialize the video inspection BullMQ queue
export const videoQueue = new Queue<VideoJobPayload>('video-inspection', {
  connection: redisConnection,
});

/**
 * Enqueues a video processing task into BullMQ
 * @param payload The job input metadata
 */
export async function addVideoJob(payload: VideoJobPayload) {
  try {
    await videoQueue.add('process-video', payload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000, // 5 seconds initial delay
      },
      removeOnComplete: {
        age: 86400, // Keep completed jobs for 24 hours
      },
      removeOnFail: {
        age: 604800, // Keep failed jobs for 7 days
      },
    });
    console.log(`Successfully enqueued job ${payload.jobId} into video-inspection queue.`);
  } catch (error) {
    console.error(`Failed to enqueue job ${payload.jobId} in BullMQ:`, error);
    throw error;
  }
}
