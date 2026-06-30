import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "AeroGuard Detection Service"
    PLANE_MODEL_PATH: str = os.getenv("PLANE_MODEL_PATH", "models/yolo11x.pt")
    YOLO_MODEL_PATH: str = os.getenv("YOLO_MODEL_PATH", "models/best.pt")
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.05"))
    DEVICE: str = os.getenv("DEVICE", "cpu")
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "15"))  # 15MB max
    ALLOWED_EXTENSIONS: list = ["jpg", "jpeg", "png", "webp"]

settings = Settings()
