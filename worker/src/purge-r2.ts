import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from './video-stream';

/**
 * Idempotently purges an object from Cloudflare R2 bucket.
 * Deleting an already-deleted key is not an error in R2/S3.
 * 
 * @param r2ObjectKey The key of the object to delete
 */
export async function purgeR2Object(r2ObjectKey: string): Promise<void> {
  let bucketName = process.env.R2_BUCKET_NAME;
  if (!bucketName && process.env.CLOUDFLARE_R2_URL) {
    try {
      const parsedUrl = new URL(process.env.CLOUDFLARE_R2_URL);
      bucketName = parsedUrl.pathname.replace(/^\//, '');
    } catch (err) {
      console.error('Failed to parse CLOUDFLARE_R2_URL for R2_BUCKET_NAME:', err);
    }
  }
  bucketName = bucketName || 'aeroguard-videos';

  console.log(`Purging object from R2. Bucket: ${bucketName}, Key: ${r2ObjectKey}`);

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: r2ObjectKey,
    })
  );

  console.log(`Object successfully purged from R2: ${r2ObjectKey}`);
}
