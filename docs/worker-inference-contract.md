# Internal API Contract: GPU Worker -> Inference Service

This document defines the HTTP request contract used by the GPU worker to send extracted frames to the internal `inference-service` for YOLOv8 model inference.

## Service Endpoints & Network Access

- **Base URL**: Defined by `INFERENCE_SERVICE_URL` in environment variables.
- **Docker Internal URL**: `http://inference-service:8000` (accessible via the shared docker network).
- **Public Access**: In production, the `inference-service` must not be exposed to the public internet.

---

## API Comparison: Specification vs. Actual Implementation

The table below outlines the differences between the target architecture spec and the actual FastAPI code implementation inside `inference-service/app/api/endpoints.py` and `inference-service/app/schemas/detection.py`.

| Parameter | Architecture Specification | Actual FastAPI Implementation (Current) |
| :--- | :--- | :--- |
| **HTTP Method** | `POST` | `POST` |
| **Endpoint Path** | `/internal/infer` | `/detect` |
| **Request Content-Type** | `multipart/form-data` | `multipart/form-data` |
| **Request Frame Field Name** | `frame` (image bytes) | `file` (image bytes) |
| **Response Format** | JSON | JSON |
| **Response Schema** | See below | See below |

---

## Request Contract Details

### Endpoint: `POST {INFERENCE_SERVICE_URL}/detect`

#### Headers
```http
Content-Type: multipart/form-data
```

#### Body (Multipart Form Data)
- **`file`**: Binary image bytes of the extracted frame (typically JPEG format).
- **Filename**: The multi-part field should include a valid filename with an extension (e.g. `frame_0100.jpg`) to assist the service in auto-detecting the image format.

---

## Response Contract Details

### Success Response (`200 OK`)

#### Content-Type
```http
Content-Type: application/json
```

#### JSON Payload Schema
```json
{
  "detections": [
    {
      "class_name": "string",
      "confidence": "number",
      "bbox": [
        "number",
        "number",
        "number",
        "number"
      ]
    }
  ],
  "metrics": {
    "inference_time_ms": "number",
    "total_time_ms": "number"
  }
}
```

#### Fields Description
- **`detections`** (Array of Objects, Required):
  - **`class_name`** (String): Label of the detected class (e.g., dent, scratch, corrosion).
  - **`confidence`** (Float): Model confidence score between `0.0` and `1.0`.
  - **`bbox`** (Array of 4 Floats): Bounding box coordinates in standard order `[x1, y1, x2, y2]`.
- **`metrics`** (Object, Optional/Provided):
  - **`inference_time_ms`** (Float): Duration of raw YOLOv8 model inference.
  - **`total_time_ms`** (Float): Total duration of the request processing pipeline.

---

## Error Handling

- **`400 Bad Request`**: Returned if the `file` field is missing or the uploaded frame is empty.
  ```json
  {
    "detail": "No file uploaded."
  }
  ```
- **`500 Internal Server Error`**: Returned if model inference fails or there is an issue reading the frame bytes.
