import io
import torch
from PIL import Image, ImageOps
from ultralytics import YOLO
from app.core.config import settings
from app.core.logging import logger


class AircraftValidator:
    """Validates whether a video frame contains an aircraft using COCO-pretrained YOLOv8n."""

    _instance = None
    _model = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(AircraftValidator, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def load_model(self):
        if self._model is not None:
            logger.info("Aircraft validation model already loaded.")
            return

        model_path = settings.AIRCRAFT_YOLO_MODEL_PATH
        device = settings.DEVICE

        if device == "cuda" and not torch.cuda.is_available():
            logger.warning("CUDA selected but GPU is not available. Falling back to CPU.")
            device = "cpu"

        logger.info(f"Loading aircraft validation YOLO model from {model_path} on device {device}...")

        try:
            self._model = YOLO(model_path)
            self._model.to(device)
            logger.info("Aircraft validation YOLO model loaded successfully.")
        except Exception as e:
            logger.error(f"Error loading aircraft validation model: {str(e)}")
            raise e

    def get_model(self) -> YOLO:
        if self._model is None:
            self.load_model()
        return self._model

    def validate(self, file_bytes: bytes) -> dict:
        """
        Check if an image frame contains an aircraft.

        Args:
            file_bytes: Raw image bytes (JPEG/PNG)

        Returns:
            dict with keys: is_aircraft (bool), confidence (float), class_name (str)
        """
        try:
            image = Image.open(io.BytesIO(file_bytes))
            image = ImageOps.exif_transpose(image)
        except Exception as e:
            logger.error(f"Image parsing failed during aircraft validation: {str(e)}")
            return {"is_aircraft": False, "confidence": 0.0, "class_name": "unknown"}

        model = self.get_model()

        try:
            results = model(image, conf=settings.AIRCRAFT_CONFIDENCE_THRESHOLD, verbose=False)
        except Exception as e:
            logger.error(f"Aircraft validation inference failed: {str(e)}")
            return {"is_aircraft": False, "confidence": 0.0, "class_name": "unknown"}

        # COCO class 0 = "airplane"
        if len(results) > 0:
            result = results[0]
            boxes = result.boxes
            names = result.names

            for box in boxes:
                class_id = int(box.cls[0].item())
                class_name = names.get(class_id, f"class_{class_id}")
                confidence = float(box.conf[0].item())

                if class_name == "airplane":
                    return {
                        "is_aircraft": True,
                        "confidence": round(confidence, 4),
                        "class_name": class_name,
                    }

        return {"is_aircraft": False, "confidence": 0.0, "class_name": "none"}


aircraft_validator = AircraftValidator()
