import { db } from './db/client';
import { jobs, metrics } from './db/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as http from 'http';
import { r2Client } from './lib/r2-client';
import { videoQueue } from './lib/queue';
import { HeadObjectCommand } from '@aws-sdk/client-s3';

const FRONTEND_URL = 'http://localhost:3000';
const API_URL = 'http://localhost:3001';
const VIDEO_PATH = 'c:/Users/ishit/AeroGuard-1/test_video.mp4';
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'aeroguard-footage';

async function runE2E() {
  console.log('==================================================');
  console.log('    AEROGUARD PIPELINE END-TO-END VALIDATION      ');
  console.log('==================================================');


  const stages: { name: string; status: 'PASS' | 'FAIL' | 'PENDING'; error?: string }[] = [
    { name: '1. Frontend loads', status: 'PENDING' },
    { name: '2. Video upload succeeds', status: 'PENDING' },
    { name: '3. R2 upload succeeds', status: 'PENDING' },
    { name: '4. Webhook fires', status: 'PENDING' },
    { name: '5. Redis queue receives the job', status: 'PENDING' },
    { name: '6. Worker starts processing', status: 'PENDING' },
    { name: '7. SSE progress updates are emitted', status: 'PENDING' },
    { name: '8. Metrics are written to NeonDB', status: 'PENDING' },
    { name: '9. Job status becomes completed', status: 'PENDING' },
    { name: '10. Uploaded video is purged from R2', status: 'PENDING' },
  ];

  let firstFailingStageIndex = -1;
  const setStage = (index: number, status: 'PASS' | 'FAIL', error?: string) => {
    stages[index].status = status;
    if (error) {
      stages[index].error = error;
    }
    if (status === 'FAIL' && firstFailingStageIndex === -1) {
      firstFailingStageIndex = index;
    }
    console.log(`[${status}] Stage ${index + 1}: ${stages[index].name}${error ? ` - Error: ${error}` : ''}`);
  };
<truncated 10972 bytes>