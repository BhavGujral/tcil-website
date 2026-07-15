from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

from app.pdf_processor import extract_text_from_pdf
from app.image_processor import create_thumbnail
from app.celery_worker import (
    task_process_tender_pdf,
    task_process_career_pdf,
    task_process_gallery_image,
    task_process_banner_image
)

load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="TCIL Python Service",
    description="Handles PDF processing and image optimization for TCIL website",
    version="1.0.0"
)

# Allow requests from Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- REQUEST MODELS ----


class ProcessTenderRequest(BaseModel):
    tender_id: str
    pdf_key: str


class ProcessCareerRequest(BaseModel):
    career_id: str
    pdf_key: str


class ProcessImageRequest(BaseModel):
    gallery_id: str
    file_key: str


class ProcessBannerRequest(BaseModel):
    banner_id: str
    file_key: str

# ---- HEALTH CHECK ----


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "message": "TCIL Python Service is running",
        "service": "python-fastapi"
    }

# ---- PDF ENDPOINTS ----


@app.post("/process/tender-pdf")
async def process_tender_pdf(request: ProcessTenderRequest):
    """
    Trigger background processing of tender PDF
    Node.js calls this after uploading a tender
    """
    try:
        # Send job to Celery worker (runs in background)
        task = task_process_tender_pdf.delay(
            request.tender_id,
            request.pdf_key
        )

        return {
            "success": True,
            "message": "Tender PDF processing started",
            "task_id": task.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/process/career-pdf")
async def process_career_pdf(request: ProcessCareerRequest):
    """
    Trigger background processing of career PDF
    """
    try:
        task = task_process_career_pdf.delay(
            request.career_id,
            request.pdf_key
        )

        return {
            "success": True,
            "message": "Career PDF processing started",
            "task_id": task.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """
    Direct PDF text extraction endpoint
    Upload a PDF and get back the extracted text
    """
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(
                status_code=400,
                detail="Only PDF files are allowed"
            )

        pdf_bytes = await file.read()
        extracted_text = extract_text_from_pdf(pdf_bytes)

        return {
            "success": True,
            "filename": file.filename,
            "text": extracted_text,
            "character_count": len(extracted_text),
            "word_count": len(extracted_text.split())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- IMAGE ENDPOINTS ----


@app.post("/process/gallery-image")
async def process_gallery_image(request: ProcessImageRequest):
    """
    Trigger thumbnail generation for gallery image
    """
    try:
        task = task_process_gallery_image.delay(
            request.gallery_id,
            request.file_key
        )

        return {
            "success": True,
            "message": "Image thumbnail generation started",
            "task_id": task.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/process/banner-image")
async def process_banner_image(request: ProcessBannerRequest):
    """
    Trigger banner image optimization
    """
    try:
        task = task_process_banner_image.delay(
            request.banner_id,
            request.file_key
        )

        return {
            "success": True,
            "message": "Banner image processing started",
            "task_id": task.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/create-thumbnail")
async def create_thumbnail_endpoint(
    file: UploadFile = File(...),
    width: int = 400,
    height: int = 300
):
    """
    Direct thumbnail creation endpoint
    Upload an image and get back a thumbnail
    """
    try:
        image_bytes = await file.read()
        thumbnail_bytes = create_thumbnail(image_bytes, width, height)

        if not thumbnail_bytes:
            raise HTTPException(
                status_code=500,
                detail="Failed to create thumbnail"
            )

        from fastapi.responses import Response
        return Response(
            content=thumbnail_bytes,
            media_type="image/jpeg",
            headers={
                "Content-Disposition": f"attachment; filename=thumb_{file.filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ---- TASK STATUS ----


@app.get("/task/{task_id}")
def get_task_status(task_id: str):
    """
    Check the status of a background task
    """
    from celery.result import AsyncResult
    from celery_worker import celery_app

    result = AsyncResult(task_id, app=celery_app)

    return {
        "task_id": task_id,
        "status": result.status,
        "result": str(result.result) if result.ready() else None
    }
