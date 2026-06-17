import { Queue } from 'bullmq';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

const queue = new Queue('video-inspection', { connection });

async function enqueueTestJob() {
  console.log(`Connecting to Redis at: ${redisUrl}`);
  console.log('Enqueueing test job in "video-inspection" queue...');
  
  const job = await queue.add('process-video', {
    jobId: 'test-job-uuid-123',
    r2ObjectKey: 'uploads/test-video.mp4',
    fileSizeBytes: 1048576,
    uploadedAt: new Date().toISOString(),
  });

  console.log(`Test job enqueued successfully! Job ID: ${job.id}`);
  await connection.quit();
}

enqueueTestJob();
