import { and, eq, isNull, lt } from 'drizzle-orm';
import pino from 'pino';
import { db } from './db/client';
import { jobs } from './db/schema';
import { purgeR2Object } from './purge-r2';

const logger = pino({
  name: 'aeroguard-cleanup-sweep',
  level: process.env.LOG_LEVEL || 'info',
});

/**
 * Searches for jobs that completed more than 1 hour ago but whose R2 objects
 * were not successfully purged. Retries R2 object deletions and updates job states.
 */
export async function sweepOrphanedPurges(): Promise<void> {
  logger.info('Executing orphaned R2 purge cleanup sweep...');

  // Target jobs completed older than 1 hour ago
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  try {
    const orphanedJobs = await db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.status, 'completed'),
          isNull(jobs.purgedAt),
          lt(jobs.completedAt, oneHourAgo)
        )
      );

    if (orphanedJobs.length === 0) {
      logger.info('Cleanup Sweep: No orphaned purges found.');
      return;
    }

    logger.info(`Cleanup Sweep: Found ${orphanedJobs.length} completed jobs awaiting R2 purging.`);

    for (const job of orphanedJobs) {
      logger.info({ jobId: job.id, key: job.r2ObjectKey }, 'Retrying R2 purge for orphaned job');
      
      try {
        await purgeR2Object(job.r2ObjectKey);

        // Update database status on success
        await db
          .update(jobs)
          .set({
            status: 'purged',
            purgedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(jobs.id, job.id));

        logger.info({ jobId: job.id }, 'Orphaned R2 purge and job status update completed.');
      } catch (err: any) {
        logger.error(
          { jobId: job.id, key: job.r2ObjectKey, error: err.message },
          'Orphaned R2 purge retry failed'
        );
      }
    }
  } catch (error) {
    logger.error(error, 'Error executing orphaned purges cleanup sweep');
  }
}
