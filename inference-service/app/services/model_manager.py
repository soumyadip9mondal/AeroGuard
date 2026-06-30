import os
import torch
from ultralytics import YOLO
from sahi import AutoDetectionModel
from app.core.config import settings
from app.core.logging import logger

class ModelManager:
    _instance = None
    plane_model = None
    sahi_model = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(ModelManager, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def load_model(self):
        if self.sahi_model is not None:
            logger.info("Models already loaded.")
            return

        defect_model_path = settings.YOLO_MODEL_PATH
        plane_model_path = settings.PLANE_MODEL_PATH
        device = settings.DEVICE

        # Device fallback logic (check CUDA availability)
        if device == "cuda" and not torch.cuda.is_available():
            logger.warning("CUDA selected but GPU is not available. Falling back to CPU.")
            device = "cpu"

        logger.info(f"Loading plane YOLO model from {plane_model_path} and SAHI model from {defect_model_path} on device {device}...")

        # Ensure directory exists for model weights
        os.makedirs(os.path.dirname(plane_model_path) or "models", exist_ok=True)
        os.makedirs(os.path.dirname(defect_model_path) or "models", exist_ok=True)

        try:
            # If the plane model does not exist in the path, let's trigger ultralytics auto-download
            if not os.path.exists(plane_model_path):
                model_name = os.path.basename(plane_model_path)
                logger.info(f"Downloading {model_name}...")
                _ = YOLO(model_name) # Auto-downloads to root directory
                
                # Move it to the models/ folder
                if os.path.exists(model_name) and model_name != plane_model_path:
                    import shutil
                    shutil.move(model_name, plane_model_path)
            
            # Load the plane YOLO model from the expected path
            self.plane_model = YOLO(plane_model_path)
            # Send model to device
            self.plane_model.to(device)
            logger.info("Plane YOLO model loaded successfully.")
            
            # Load SAHI AutoDetectionModel
            self.sahi_model = AutoDetectionModel.from_pretrained(
                model_type='yolov8',
                model_path=defect_model_path,
                confidence_threshold=settings.CONFIDENCE_THRESHOLD,
                device=device,
            )
            logger.info("SAHI model loaded successfully.")
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise e

    def get_plane_model(self) -> YOLO:
        if self.plane_model is None:
            self.load_model()
        return self.plane_model
        
    def get_sahi_model(self):
        if self.sahi_model is None:
            self.load_model()
        return self.sahi_model

    def unload_model(self):
        self.plane_model = None
        self.sahi_model = None
        logger.info("YOLO plane and SAHI defect models unloaded.")

model_manager = ModelManager()
