# backend/app/api/routes_jd.py

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
import os
import textract

router = APIRouter()

@router.post("/upload-jd/")
async def upload_jd(file: UploadFile = File(...)):
    # Save file temporarily
    try:
        contents = await file.read()
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Extract JD content
    try:
        jd_text = textract.process(temp_path).decode("utf-8").strip()
        os.remove(temp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract JD text: {str(e)}")

    return JSONResponse(content={"jd_text": jd_text[:2000]})  # Limit output for preview
