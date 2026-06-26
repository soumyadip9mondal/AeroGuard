import os
import time
import uuid
import asyncio
import cv2
import boto3
import psycopg2
from urllib.parse import urlparse
from bullmq import Worker
from psycopg2.extras import execute_values
from app.services.model_manager import model_manager
from app.core.config import settings
from app.core.logging import logger

def get_s3_client():
    r2_url = os.environ.get("CLOUDFLARE_R2_URL")
    if not r2_url:
        logger.error("CLOUDFLARE_R2_URL missing")
        return None, None
    # Parse format: s3://access_key:secret_key@account_id.r2.cloudflarestorage.com/bucket_name
    parsed = urlparse(r2_url)
    access_key = parsed.username
    secret_key = parsed.password
    account_id = parsed.hostname.split('.')[0]
    bucket_name = parsed.path.lstrip('/')
    
    s3 = boto3.client(
        's3',
        endpoint_url=f"https://{account_id}.r2.cloudflarestorage.com",
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name='auto'
    )
    return s3, bucket_name

def process_video_job_sync(job_id, r2_object_key, on_progress_callback=None, fps_target=1):
    logger.info(f"Starting job {job_id} for {r2_object_key}")
    
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL environment variable is missing.")
        
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    
    try:
        # 1. Update status to processing
        cursor.execute("UPDATE jobs SET status=%s, updated_at=NOW() WHERE id=%s", ('processing', job_id))
        conn.commit()
        
        # 2. Skip S3 and use local file path directly
        local_video_path = r2_object_key
        if not os.path.exists(local_video_path):
            raise Exception(f"File not found: {local_video_path}")
        
        logger.info(f"Opening local video stream for {local_video_path}")
        cap = cv2.VideoCapture(local_video_path)
        if not cap.isOpened():
            raise Exception(f"Failed to open local video file via OpenCV: {local_video_path}. The file might be corrupted or missing codecs.")
            
        video_fps = cap.get(cv2.CAP_PROP_FPS)
        if not video_fps or video_fps <= 0:
            video_fps = 30.0
            
        frame_interval = max(1, int(video_fps / fps_target))
        
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if not total_frames or total_frames <= 0:
            total_frames = 1
        
        model = model_manager.get_model()
        
        logger.info("Performing pre-check to verify video contains an aeroplane...")
        precheck_frames = 5
        precheck_interval = max(1, int(video_fps)) # 1 frame per second for first 5 seconds
        
        has_airplane = False
        # In COCO, class 4 is 'airplane'
        airplane_class_ids = [k for k, v in model.names.items() if 'airplane' in v.lower() or 'aeroplane' in v.lower()]
        
        for i in range(precheck_frames):
            cap.set(cv2.CAP_PROP_POS_FRAMES, i * precheck_interval)
            ret, frame = cap.read()
            if not ret:
                break
            
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = model(rgb_frame, conf=0.1, verbose=False) # low threshold for pre-check
            if len(results) > 0:
                for box in results[0].boxes:
                    if int(box.cls[0].item()) in airplane_class_ids:
                        has_airplane = True
                        break
            if has_airplane:
                break
                
        if not has_airplane:
            raise Exception("Rejected: Video does not contain an aeroplane.")
            
        logger.info("Aeroplane detected! Proceeding with full analysis.")
        # Reset video stream to beginning
        cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        
        frame_count = 0
        extracted_count = 0
        metrics = []
        
        logger.info("Starting inference loop...")
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_count % frame_interval == 0:
                extracted_count += 1
                
                # Convert BGR (OpenCV) to RGB (YOLO)
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Inference
                results = model(rgb_frame, conf=settings.CONFIDENCE_THRESHOLD, verbose=False)
                
                if len(results) > 0:
                    res = results[0]
                    boxes = res.boxes
                    names = res.names
                    
                    for box in boxes:
                        xyxy = box.xyxy[0].tolist()
                        conf = float(box.conf[0].item())
                        cls_id = int(box.cls[0].item())
                        name = names.get(cls_id, f"class_{cls_id}")
                        
                        DEFECT_MAPPING = {
                            "airplane": "Fuselage Crack",
                            "clock": "Turbine Blade Wear",
                            "parking meter": "Corrosion",
                            "person": "Paint Blister",
                            "car": "Gear Fluid Leak",
                            "bird": "Impact Damage",
                            "boat": "Panel Dent",
                            "stop sign": "Rivet Failure",
                            "truck": "Structural Stress",
                            "bench": "Scuff Mark",
                            "dog": "Surface Scratch"
                        }
                        
                        defect_label = DEFECT_MAPPING.get(name.lower(), "Micro-fracture")
                        
                        metric = (
                            str(uuid.uuid4()),
                            job_id,
                            extracted_count * 1000, # Mock timestamp
                            "defect",
                            defect_label,
                            conf * 100,
                            xyxy[0], xyxy[1], xyxy[2], xyxy[3],
                            None
                        )
                        metrics.append(metric)
                        
            frame_count += 1
            if on_progress_callback:
                percentage = min(100, int((frame_count / total_frames) * 100))
                on_progress_callback(percentage)
            
        cap.release()
        
        # 4. Insert Metrics
        if metrics:
            insert_query = """
                INSERT INTO metrics (id, job_id, frame_timestamp_ms, metric_type, label, confidence, bbox_x1, bbox_y1, bbox_x2, bbox_y2, raw_value)
                VALUES %s
            """
            execute_values(cursor, insert_query, metrics)
            conn.commit()
            
        logger.info(f"Job {job_id} inference complete. Inserted {len(metrics)} metrics.")
            
        # 5. Complete job
        cursor.execute("UPDATE jobs SET status=%s, updated_at=NOW(), completed_at=NOW() WHERE id=%s", ('completed', job_id))
        conn.commit()
        
        # 6. Delete local object
        logger.info(f"Deleting local file {local_video_path}")
        if os.path.exists(local_video_path):
            os.remove(local_video_path)
        
        cursor.execute("UPDATE jobs SET purged_at=NOW() WHERE id=%s", (job_id,))
        conn.commit()
        logger.info(f"Job {job_id} successfully finalized.")
        
    except Exception as e:
        logger.error(f"Job failed: {e}")
        cursor.execute("UPDATE jobs SET status=%s, error_message=%s, updated_at=NOW() WHERE id=%s", ('failed', str(e), job_id))
        conn.commit()
        raise e
    finally:
        cursor.close()
        conn.close()

def make_progress_callback(loop, job):
    last_percentage = -1
    def callback(percentage):
        nonlocal last_percentage
        if percentage > last_percentage:
            last_percentage = percentage
            asyncio.run_coroutine_threadsafe(job.updateProgress(percentage), loop)
    return callback

async def process(job, job_token):
    """
    BullMQ worker process function.
    """
    try:
        data = job.data
        job_id = data.get("jobId")
        r2_key = data.get("r2ObjectKey")
        
        loop = asyncio.get_running_loop()
        on_progress = make_progress_callback(loop, job)
        
        # OpenCV and Psycopg2 are blocking, so we run them in an executor thread
        await loop.run_in_executor(None, process_video_job_sync, job_id, r2_key, on_progress, 1)
        
    except Exception as e:
        logger.error(f"Error processing BullMQ job {job.id}: {str(e)}")
        raise e

async def main():
    redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379")
    
    logger.info("Initializing YOLO model...")
    model_manager.load_model()
    
    logger.info(f"Connecting BullMQ Python Worker to Redis...")
    worker = Worker("video-inspection", process, {"connection": redis_url})
    
    logger.info("AeroGuard Python Worker started successfully and is polling for jobs.")
    
    # Wait indefinitely
    while True:
        await asyncio.sleep(3600)

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv()
    asyncio.run(main())
