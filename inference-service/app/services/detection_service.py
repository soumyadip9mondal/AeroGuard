import time
import io
from PIL import Image, ImageOps
from fastapi import HTTPException, status
from app.services.model_manager import model_manager
from app.core.config import settings
from app.core.logging import logger
from app.schemas.detection import DetectionItem, DetectionResponse, PerformanceMetrics

class DetectionService:
    @staticmethod
    def validate_image(file_bytes: bytes, filename: str) -> None:
        # Check size
        size_mb = len(file_bytes) / (1024 * 1024)
        if size_mb > settings.MAX_FILE_SIZE_MB:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File size ({size_mb:.2f} MB) exceeds maximum limit of {settings.MAX_FILE_SIZE_MB} MB."
            )

        # Check extension
        ext = filename.split(".")[-1].lower() if "." in filename else ""
        if ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )

    @staticmethod
    def run_detection(file_bytes: bytes, filename: str) -> DetectionResponse:
        total_start = time.perf_counter()

        # 1. Validate extension and size
        DetectionService.validate_image(file_bytes, filename)

        try:
            # 2. Parse Image with Pillow to verify it is valid
            image = Image.open(io.BytesIO(file_bytes))
            # Normalize orientation based on EXIF tag
            image = ImageOps.exif_transpose(image)
        except Exception as e:
            logger.error(f"Image parsing failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Corrupted or invalid image data."
            )

        # 3. Get Models (Singleton)
        plane_model = model_manager.get_plane_model()
        sahi_model = model_manager.get_sahi_model()

        # 4. Perform Inference
        inference_start = time.perf_counter()
        detections = []
        try:
            from sahi.predict import get_sliced_prediction
            # Convert PIL Image to RGB for consistent behavior
            image = image.convert("RGB")
            
            # Stage 1: Detect planes
            plane_results = plane_model(image, conf=0.25, verbose=False)
            
            for r in plane_results:
                for box in r.boxes:
                    class_id = int(box.cls[0].item())
                    class_name = r.names[class_id]
                    
                    if class_name.lower() in ["airplane", "aeroplane", "aircraft"]:
                        x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
                        plane_conf = float(box.conf[0].item())
                        
                        detections.append(
                            DetectionItem(
                                class_name="airplane",
                                confidence=round(plane_conf, 4),
                                bbox=[float(x1), float(y1), float(x2), float(y2)]
                            )
                        )
                        
                        # Crop the plane
                        width, height = image.size
                        x1, y1 = max(0, x1), max(0, y1)
                        x2, y2 = min(width, x2), min(height, y2)
                        
                        if x2 > x1 and y2 > y1:
                            plane_crop = image.crop((x1, y1, x2, y2))
                            
                            # Stage 2: SAHI on the cropped plane
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
                                confidence = obj.score.value
                                defect_class_name = obj.category.name
                                
                                # Shift bounding box to original image coordinates
                                final_bbox = [
                                    round(obj_bbox[0] + x1, 2),
                                    round(obj_bbox[1] + y1, 2),
                                    round(obj_bbox[2] + x1, 2),
                                    round(obj_bbox[3] + y1, 2)
                                ]
                                
                                detections.append(
                                    DetectionItem(
                                        class_name=defect_class_name,
                                        confidence=round(confidence, 4),
                                        bbox=final_bbox
                                    )
                                )
        except Exception as e:
            logger.error(f"Inference execution failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Inference error: {str(e)}"
            )
        inference_time_ms = (time.perf_counter() - inference_start) * 1000

        total_time_ms = (time.perf_counter() - total_start) * 1000

        # Build response
        response = DetectionResponse(
            detections=detections,
            metrics=PerformanceMetrics(
                inference_time_ms=round(inference_time_ms, 2),
                total_time_ms=round(total_time_ms, 2)
            )
        )

        logger.info(f"Processed detection for '{filename}' in {total_time_ms:.2f}ms. Detections count: {len(detections)}")
        return response

detection_service = DetectionService()
