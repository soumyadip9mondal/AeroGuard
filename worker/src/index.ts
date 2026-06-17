import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import the worker to start listening for jobs
import './consumer';
import { sweepOrphanedPurges } from './cleanup-sweep';

console.log('AeroGuard Background Worker service has successfully booted.');

// 1. Run the orphaned R2 purge sweep immediately on boot
sweepOrphanedPurges();

// 2. Schedule the sweep to run every 30 minutes
const SWEEP_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
setInterval(() => {
  sweepOrphanedPurges().catch((err) => {
    console.error('Interval cleanup sweep failed:', err);
  });
}, SWEEP_INTERVAL_MS);
