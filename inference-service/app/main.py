from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router
from app.services.model_manager import model_manager
from app.core.logging import logger

import os
from bullmq import Worker
from app.worker import process

worker_instance = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global worker_instance
    # Startup: Load the YOLO model once in memory
    logger.info("Service starting up. Initializing model loading...")
    try:
        model_manager.load_model()
    except Exception as e:
        logger.error(f"Failed to load YOLO model during startup: {str(e)}")
        raise e
        
    # Start BullMQ worker in the background
    redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379")
    logger.info("Starting BullMQ background worker...")
    worker_instance = Worker("video-inspection", process, {"connection": redis_url})
    
    yield
    
    # Shutdown: Clean up cached model reference
    logger.info("Service shutting down. Cleaning up model references and workers...")
    if worker_instance:
        await worker_instance.close()
    model_manager.unload_model()

app = FastAPI(
    title="AeroGuard Detection Service",
    description="FastAPI service wrapper around YOLOv8 for aircraft defect and anomaly detection.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API endpoints
app.include_router(router)
