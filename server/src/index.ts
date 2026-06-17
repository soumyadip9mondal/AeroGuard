import express from 'express';
import cors from 'cors';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Queue } from 'bullmq';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Cloudflare R2 configuration
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || 'https://<ACCOUNT_ID>.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'dummy-key',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'dummy-secret',
  },
});

// BullMQ configuration
const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

const videoQueue = new Queue('videoProcessing', { connection });

// 1. Generate Presigned URL
app.post('/api/upload/presigned-url', async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    const key = `uploads/${Date.now()}-${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME || 'aeroguard-videos',
      Key: key,
      ContentType: contentType || 'video/mp4',
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    res.json({
      uploadUrl: presignedUrl,
      key: key,
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    res.status(500).json({ error: 'Failed to generate presigned URL' });
  }
});

// 2. Webhook / Upload Success -> Add job to BullMQ
app.post('/api/upload/success', async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    // Add job to BullMQ
    const job = await videoQueue.add('process-video', {
      videoKey: key,
    });

    res.json({
      message: 'Job queued successfully',
      jobId: job.id,
    });
  } catch (error) {
    console.error('Error queueing job:', error);
    res.status(500).json({ error: 'Failed to queue job' });
  }
});

app.listen(PORT, () => {
  console.log(`Node.js Backend API listening on port ${PORT}`);
});
