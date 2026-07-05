import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import * as path from 'path';
import uploadsRouter from './routes/uploads';
import webhooksRouter from './routes/webhooks';
import jobsRouter from './routes/jobs';
import inventoryRouter from './routes/inventory';
import authRouter from './routes/auth';
import { requireAuth } from './middleware/auth';
import { db } from './db/client';
import { sql } from 'drizzle-orm';

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// 1. CORS Configuration
const allowedOrigins = [
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:3000'] : []),
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
    : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);

// Middleware - Parse JSON and capture raw body buffer for signature verification
app.use(
  express.json({
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString('utf8');
    },
  })
);

// 2. Health Endpoint — checks PostgreSQL and Redis connectivity
app.get('/health', async (_req, res) => {
  const checks: Record<string, string> = {};

  try {
    await db.execute(sql`SELECT 1`);
    checks.postgresql = 'ok';
  } catch {
    checks.postgresql = 'error';
  }

  try {
    const { redisConnection } = await import('./lib/redis');
    if (redisConnection.status === 'ready') {
      checks.redis = 'ok';
    } else {
      checks.redis = 'not_ready';
    }
  } catch {
    checks.redis = 'error';
  }

  const allOk = Object.values(checks).every((v) => v === 'ok');
  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'ok' : 'degraded',
    checks,
  });
});

// Route to serve test_video.mp4 for E2E simulation/automation (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.get('/test_video.mp4', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../test_video.mp4'));
  });
}

// 3. API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/uploads', uploadsRouter);
app.use('/api/v1/webhooks', webhooksRouter);
app.use('/api/v1/jobs', jobsRouter);
app.use('/api/v1/inventory', requireAuth, inventoryRouter);

// Start Server
app.listen(PORT, () => {
  console.log(`Node.js API Gateway listening on port ${PORT}`);
  if (process.env.FRONTEND_URL) {
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  }
  if (process.env.INFERENCE_URL) {
    console.log(`Inference API URL: ${process.env.INFERENCE_URL}`);
  }
});
