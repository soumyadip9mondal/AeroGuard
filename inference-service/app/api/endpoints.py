from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.services.detection_service import detection_service
from app.services.aircraft_validator import aircraft_validator
from app.schemas.detection import DetectionResponse
from app.schemas.validation import AircraftValidationResponse

router = APIRouter()

@router.get("/health", status_code=status.HTTP_200_OK)
async def health():
    return {"status": "ok"}

@router.post("/detect", response_model=DetectionResponse, status_code=status.HTTP_200_OK)
async def detect(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded."
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    # Execute inference pipeline
    response = detection_service.run_detection(file_bytes, file.filename or "image.jpg")
    return response

@router.post("/validate-aircraft", response_model=AircraftValidationResponse, status_code=status.HTTP_200_OK)
async def validate_aircraft(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file uploaded."
        )

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    result = aircraft_validator.validate(file_bytes)
    return AircraftValidationResponse(**result)
