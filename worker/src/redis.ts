import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

console.log(`Worker connecting to Redis at: ${redisUrl}`);

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required configuration for BullMQ
});

redisConnection.on('connect', () => {
  console.log('Worker successfully connected to Redis.');
});

redisConnection.on('error', (err) => {
  console.error('Worker Redis connection error:', err);
});
