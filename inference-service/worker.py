import asyncio
import os
import cv2
import boto3
import json
import psycopg2
from psycopg2.extras import execute_values
from bullmq import Worker, Job
from ultralytics import YOLO
from dotenv import load_dotenv

load_dotenv()

from urllib.parse import urlparse

# S3 Configuration
r2_url_str = os.getenv('CLOUDFLARE_R2_URL', 's3://dummy-key:dummy-secret@dummy-account.r2.cloudflarestorage.com/aeroguard-videos')
r2_url = urlparse(r2_url_str)

s3 = boto3.client(
    's3',
    endpoint_url=f"https://{r2_url.hostname}",
    aws_access_key_id=r2_url.username,
    aws_secret_access_key=r2_url.password,
    region_name='auto'
)
bucket_name = r2_url.path.strip('/')

# Postgres Configuration
def get_db_connection():
    db_url = os.getenv('DATABASE_URL', 'postgresql://postgres:password@localhost:5432/postgres')
    return psycopg2.connect(db_url)

# YOLO Model Initialization
print("Loading YOLOv8 model...")
model = YOLO('yolov8n.pt') # using nano for testing

async def process_video(job: Job, token: str):
    video_key = job.data.get('videoKey')
    if not video_key:
        print("No video key found in job data.")
        return

    print(f"Processing video: {video_key}")

    try:
        # 1. Get Presigned URL to stream video via FFmpeg/OpenCV
        presigned_url = s3.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket_name, 'Key': video_key},
            ExpiresIn=3600
        )

        # 2. Extract frames and run inference
        # Using cv2.VideoCapture to stream network video
        cap = cv2.VideoCapture(presigned_url)
        if not cap.isOpened():
            raise Exception("Failed to open video stream")

        metrics = []
        frame_idx = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process every 30th frame (e.g. 1 frame per second for 30fps)
            if frame_idx % 30 == 0:
                results = model(frame, verbose=False)
                for r in results:
                    boxes = r.boxes
                    for box in boxes:
                        cls = int(box.cls[0])
                        conf = float(box.conf[0])
                        metrics.append((video_key, frame_idx, cls, conf))
            
            frame_idx += 1
            
        cap.release()
        print(f"Processed {frame_idx} frames. Found {len(metrics)} detections.")

        # 3. Postgres Bulk Copy (metrics saved)
        if metrics:
            conn = get_db_connection()
            cur = conn.cursor()
            # Ensure table exists
            cur.execute('''
                CREATE TABLE IF NOT EXISTS detections (
                    id SERIAL PRIMARY KEY,
                    video_key VARCHAR(255),
                    frame_idx INT,
                    class_id INT,
                    confidence FLOAT
                )
            ''')
            # Bulk insert
            insert_query = "INSERT INTO detections (video_key, frame_idx, class_id, confidence) VALUES %s"
            execute_values(cur, insert_query, metrics)
            conn.commit()
            cur.close()
            conn.close()
            print("Saved metrics to Neon DB (Postgres)")

        # 4. Job Lifecycle Purge - AWS S3 DeleteObject
        print(f"Deleting video from R2: {video_key}")
        s3.delete_object(Bucket=bucket_name, Key=video_key)
        
        print("Job completed successfully!")
        return {"status": "success", "video_key": video_key, "detections": len(metrics)}

    except Exception as e:
        print(f"Error processing video: {str(e)}")
        raise e

async def main():
    redis_url_str = os.getenv("REDIS_URL", "redis://127.0.0.1:6379")
    r_url = urlparse(redis_url_str)
    
    redis_opts = {
        "host": r_url.hostname or "127.0.0.1",
        "port": r_url.port or 6379,
    }
    if r_url.password:
        redis_opts["password"] = r_url.password
    
    print(f"Starting GPU Worker Node, connecting to Redis at {redis_opts['host']}:{redis_opts['port']}")
    worker = Worker('videoProcessing', process_video, {"connection": redis_opts})
    
    # Keep worker running
    await asyncio.Future()

if __name__ == '__main__':
    asyncio.run(main())
