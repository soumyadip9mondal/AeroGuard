import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

let accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

if (!accountId && process.env.CLOUDFLARE_R2_URL) {
  try {
    const parsedUrl = new URL(process.env.CLOUDFLARE_R2_URL);
    accountId = parsedUrl.hostname.split('.')[0];
  } catch (err) {
    console.error('Failed to parse CLOUDFLARE_R2_URL for R2_ACCOUNT_ID:', err);
  }
}

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.warn(
    'Warning: Cloudflare R2 credentials (R2_ACCOUNT_ID/CLOUDFLARE_R2_URL, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY) are not fully configured in the worker.'
  );
}

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId || 'dummy-account'}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || 'dummy-key',
    secretAccessKey: secretAccessKey || 'dummy-secret',
  },
});

/**
 * Fetches an object from Cloudflare R2 as a Readable stream.
 * @param objectKey The key of the R2 object
 * @returns Promise resolving to a Node.js Readable stream
 */
export async function getR2ObjectStream(objectKey: string): Promise<Readable> {
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

  try {
    const response = await r2Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })
    );

    if (!response.Body) {
      throw new Error(`R2 GetObject returned empty body for key: ${objectKey}`);
    }

    return response.Body as Readable;
  } catch (error) {
    console.error(`Failed to stream object from R2: ${objectKey}`, error);
    throw error;
  }
}
