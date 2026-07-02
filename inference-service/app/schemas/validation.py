from pydantic import BaseModel, Field


class AircraftValidationResponse(BaseModel):
    is_aircraft: bool = Field(..., description="Whether an aircraft was detected in the frame")
    confidence: float = Field(..., description="Detection confidence score (0.0 to 1.0)")
    class_name: str = Field(..., description="Name of the detected class")
