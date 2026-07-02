import Redis from 'ioredis';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Mask credentials in logs
const maskedUrl = redisUrl.replace(/:[^@]+@/, ':***@');
console.log(`Connecting to Redis at: ${maskedUrl}`);

export const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

redisConnection.on('connect', () => {
  console.log('Successfully connected to Redis.');
});

redisConnection.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});
