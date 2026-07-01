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
        
        plane_model = model_manager.get_plane_model()
        sahi_model = model_manager.get_sahi_model()
        part_model = model_manager.get_part_model()
        

        frame_count = 0
        extracted_count = 0
        metrics = []
        
        from sahi.predict import get_sliced_prediction
        from PIL import Image
        
        logger.info("Starting inference loop...")
        while True:
            ret, frame = cap.read()
            if not ret:
                break
                
            if frame_count % frame_interval == 0:
                extracted_count += 1
                
                # Convert BGR (OpenCV) to RGB (YOLO)
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                image = Image.fromarray(rgb_frame)
                
                # Stage 1: Detect planes
                plane_results = plane_model(image, conf=0.25, verbose=False)
                
                for r in plane_results:
                    for box in r.boxes:
                        class_id = int(box.cls[0].item())
                        class_name = r.names[class_id]
                        
                        if class_name.lower() in ["airplane", "aeroplane", "aircraft"]:
                            x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
                            
                            # Crop the plane
                            width, height = image.size
                            x1, y1 = max(0, x1), max(0, y1)
                            x2, y2 = min(width, x2), min(height, y2)
                            
                            if x2 > x1 and y2 > y1:
                                plane_crop = image.crop((x1, y1, x2, y2))
                                
                                # Inference with SAHI
                                result = get_sliced_prediction(
                                    plane_crop,
                                    sahi_model,
                                    slice_height=512,
                                    slice_width=512,
                                    overlap_height_ratio=0.2,
                                    overlap_width_ratio=0.2
                                )
                                
                                for obj in result.object_prediction_list:
                                    obj_bbox = obj.bbox.to_xyxy()
                                    conf = float(obj.score.value)
                                    name = obj.category.name
                                        
                                    defect_label = name.title()
                                    
                                    # Shift bounding box to original image coordinates
                                    final_bbox = [
                                        float(obj_bbox[0] + x1),
                                        float(obj_bbox[1] + y1),
                                        float(obj_bbox[2] + x1),
                                        float(obj_bbox[3] + y1)
                                    ]
                                    
                                    # Stage 3: Detect Part using the chosen model (yolov8n or yolo11x)
                                    # For demonstration, we run the part model on the defect crop or plane crop.
                                    # Let's crop the defect area with some context and run the part model.
                                    defect_w = obj_bbox[2] - obj_bbox[0]
                                    defect_h = obj_bbox[3] - obj_bbox[1]
                                    ctx_w, ctx_h = defect_w * 2, defect_h * 2
                                    c_x1 = max(0, obj_bbox[0] - ctx_w)
                                    c_y1 = max(0, obj_bbox[1] - ctx_h)
                                    c_x2 = min(plane_crop.size[0], obj_bbox[2] + ctx_w)
                                    c_y2 = min(plane_crop.size[1], obj_bbox[3] + ctx_h)
                                    
                                    defect_crop = plane_crop.crop((c_x1, c_y1, c_x2, c_y2))
                                    part_results = part_model(defect_crop, verbose=False)
                                    
                                    part_name = "Engine Turbine" # Fallback if no parts detected
                                    for pr in part_results:
                                        if len(pr.boxes) > 0:
                                            # Pick the part with highest confidence
                                            best_part_id = int(pr.boxes[0].cls[0].item())
                                            part_name = pr.names[best_part_id].title()
                                            break
                                    
                                    metric = (
                                        str(uuid.uuid4()),
                                        job_id,
                                        extracted_count * 1000, # Mock timestamp
                                        "defect",
                                        defect_label,
                                        part_name,
                                        conf * 100,
                                        final_bbox[0], final_bbox[1], final_bbox[2], final_bbox[3],
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
                INSERT INTO metrics (id, job_id, frame_timestamp_ms, metric_type, label, part_name, confidence, bbox_x1, bbox_y1, bbox_x2, bbox_y2, raw_value)
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
        conn.rollback()
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
