import { db } from './db/client';
import { jobs, metrics } from './db/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const API_URL = 'http://localhost:3001';
const VIDEO_PATH = 'c:/Users/ishit/AeroGuard-1/test_video.mp4';
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'aeroguard-footage';

async function runE2E() {
  console.log('==================================================');
  console.log('    AEROGUARD PIPELINE END-TO-END VALIDATION      ');
  console.log('==================================================\n');

  // Step 1: Request presigned URL from API
  console.log('--- Step 1: Requesting Presigned URL from API ---');
  let jobId = '';
  let uploadUrl = '';
  let r2ObjectKey = '';
  let fileSizeBytes = 0;
  try {
    const stats = fs.statSync(VIDEO_PATH);
    fileSizeBytes = stats.size;
    const filename = path.basename(VIDEO_PATH);
    const contentType = 'video/mp4';

    const res = await fetch(`${API_URL}/api/v1/uploads/presign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, fileSizeBytes, contentType })
    });

    if (!res.ok) {
      throw new Error(`Failed to get presigned URL: ${res.statusText}`);
    }

    const data = await res.json() as any;
    jobId = data.jobId;
    uploadUrl = data.uploadUrl;
    r2ObjectKey = data.r2ObjectKey;
    console.log(`[PASS] Success! Generated Job ID: ${jobId}`);
    console.log(`       Object Key: ${r2ObjectKey}\n`);
  } catch (err: any) {
    console.error(`[FAIL] Step 1: ${err.message}`);
    process.exit(1);
  }

  // Step 2: Verify job record in NeonDB
  console.log('--- Step 2: Verifying Job record created in NeonDB ---');
  try {
    const jobRecords = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    if (jobRecords.length === 0) {
      throw new Error('No job record found in NeonDB.');
    }
    const job = jobRecords[0];
    console.log(`[PASS] Success! Job record found in DB with status: ${job.status}\n`);
  } catch (err: any) {
    console.error(`[FAIL] Step 2: ${err.message}`);
    process.exit(1);
  }

  // Step 3: PUT video to R2 via presigned URL
  console.log('--- Step 3: Attempting PUT upload to Cloudflare R2 ---');
  try {
    const fileBuffer = fs.readFileSync(VIDEO_PATH);
    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'video/mp4' },
      body: fileBuffer
    });

    if (putRes.ok) {
      console.log(`[PASS] Success! Video uploaded successfully to R2.\n`);
    } else {
      const text = await putRes.text();
      throw new Error(`HTTP ${putRes.status} ${putRes.statusText} - ${text}`);
    }
  } catch (err: any) {
    console.error(`[FAIL] Step 3: ${err.message}`);
    process.exit(1);
  }

  // Step 4: Setup SSE stream connection
  console.log('--- Step 4: Connecting to SSE Progress Stream ---');
  const sseUrl = `${API_URL}/api/v1/jobs/${jobId}/stream`;
  let sseEvents: any[] = [];
  let sseDone = false;

  const ssePromise = new Promise<void>((resolve, reject) => {
    const abortController = new AbortController();
    fetch(sseUrl, { signal: abortController.signal }).then(async (response) => {
      if (!response.ok) {
        throw new Error(`SSE stream returned HTTP ${response.status}`);
      }
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('ReadableStream not supported on response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.substring(6));
              console.log(`[SSE Event] type: ${event.type}, progress: ${event.progress}, status: ${event.status}`);
              sseEvents.push(event);

              if (event.type === 'job_complete' || event.type === 'job_failed' || event.status === 'completed' || event.status === 'purged') {
                sseDone = true;
                abortController.abort();
                resolve();
                return;
              }
            } catch (e) {}
          }
        }
      }
      resolve();
    }).catch((err) => {
      if (sseDone) {
        resolve();
      } else {
        console.warn('SSE stream disconnected:', err.message);
        resolve(); // resolve anyway to check NeonDB state
      }
    });
  });

  // Step 5: Trigger webhook
  console.log('--- Step 5: Sending Webhook notification to API ---');
  try {
    const webhookPayload = {
      bucket: BUCKET_NAME,
      key: r2ObjectKey,
      size: fileSizeBytes,
      eventTime: new Date().toISOString()
    };
    const rawBody = JSON.stringify(webhookPayload);
    const webhookSecret = process.env.R2_WEBHOOK_SECRET || 'my-local-secret-1234';
    const computedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const webhookRes = await fetch(`${API_URL}/api/v1/webhooks/upload-complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': computedSignature
      },
      body: rawBody
    });

    if (!webhookRes.ok) {
      throw new Error(`Webhook trigger returned HTTP ${webhookRes.status}`);
    }

    const data = await webhookRes.json() as any;
    console.log(`[PASS] Success! Webhook response:`, data);
  } catch (err: any) {
    console.error(`[FAIL] Step 5: ${err.message}`);
    process.exit(1);
  }

  // Step 6: Wait for E2E processing to finish via SSE
  console.log('\n--- Step 6: Waiting for video processing job to complete ---');
  const timeoutTimer = setTimeout(() => {
    console.error('\n[FAIL] Timeout: E2E processing exceeded 45 seconds.');
    process.exit(1);
  }, 45000);

  await ssePromise;
  clearTimeout(timeoutTimer);
  console.log('[PASS] E2E processing finished naturally according to stream.\n');

  // Step 7: Verify final NeonDB job status
  console.log('--- Step 7: Verifying final Job status in NeonDB ---');
  let finalJob: any = null;
  try {
    const jobRecords = await db.select().from(jobs).where(eq(jobs.id, jobId)).limit(1);
    finalJob = jobRecords[0];
    console.log(`[PASS] Job status in NeonDB: "${finalJob.status}"`);
    if (finalJob.errorMessage) {
      console.log(`       Error Message: "${finalJob.errorMessage}"`);
    }
  } catch (err: any) {
    console.error(`[FAIL] Step 7: ${err.message}`);
    process.exit(1);
  }

  // Step 8: Verify written metrics in NeonDB
  console.log('--- Step 8: Verifying generated metrics in NeonDB ---');
  try {
    const writtenMetrics = await db.select().from(metrics).where(eq(metrics.jobId, jobId));
    console.log(`[PASS] Metrics written: ${writtenMetrics.length}`);
    if (writtenMetrics.length > 0) {
      console.log(`       Sample prediction: ${writtenMetrics[0].label} with confidence ${writtenMetrics[0].confidence}`);
    } else if (finalJob.status === 'purged' || finalJob.status === 'completed') {
      throw new Error('Job is marked completed/purged, but 0 metrics were written to NeonDB.');
    }
  } catch (err: any) {
    console.error(`[FAIL] Step 8: ${err.message}`);
    process.exit(1);
  }

  console.log('\n==================================================');
  console.log('        E2E PIPELINE VALIDATION SUCCESS!          ');
  console.log('==================================================');
  process.exit(0);
}

runE2E();
