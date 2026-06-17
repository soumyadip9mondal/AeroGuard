import { eq } from 'drizzle-orm';
import pino from 'pino';
import { db } from './db/client';
import { jobs } from './db/schema';
import { bulkInsertMetrics } from './persist-metrics';
import { purgeR2Object } from './purge-r2';
import { ExtractedMetric } from './types';

const logger = pino({
  name: 'aeroguard-finalizer',
  level: process.env.LOG_LEVEL || 'info',
});

/**
 * Orchestrates the finalization steps of a processed video inspection job.
 * 
 * Strict Ordering:
 * 1. Bulk insert metrics (if this fails, the error propagates and the job fails).
 * 2. Update jobs status to "completed" in NeonDB.
 * 3. Try purging R2 object. If it fails, log "purge_failed" (status remains "completed").
 * 4. On R2 purge success, update jobs status to "purged" and record purgedAt.
 * 
 * @param jobId The database UUID of the job
 * @param metrics Mapped inspection metrics to persist
 * @param r2ObjectKey Key of the source video in Cloudflare R2
 */
export async function finalizeJob(
  jobId: string,
  metrics: ExtractedMetric[],
  r2ObjectKey: string
): Promise<void> {
  // a. Persist metrics (will throw out on failure to trigger BullMQ retry)
  await bulkInsertMetrics(jobId, metrics);

  // b. Mark job status as "completed" in NeonDB
  await db
    .update(jobs)
    .set({
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(jobs.id, jobId));

  logger.info({ jobId }, 'Job status updated to "completed". Proceeding to purge video...');

  // c. Attempt to delete R2 video object
  try {
    await purgeR2Object(r2ObjectKey);

    // d. Update job status to "purged" on success
    await db
      .update(jobs)
      .set({
        status: 'purged',
        purgedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(jobs.id, jobId));

    logger.info({ jobId, r2ObjectKey }, 'Job status updated to "purged". Video cleanup done.');
  } catch (err: any) {
    // Log failures without failing the job, since metrics are already saved in DB
    logger.error(
      { jobId, r2ObjectKey, error: err.message },
      'purge_failed - R2 file cleanup failed. Orphaned sweep will handle retries.'
    );
  }
}
