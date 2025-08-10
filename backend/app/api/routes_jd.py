# backend/app/api/routes_jd.py

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.responses import JSONResponse
from app.db.database import get_db
from app.models.db_models import JobDescription
from sqlalchemy import insert, select
import os, textract
from datetime import datetime

router = APIRouter()

@router.post("/upload-jd/")
async def upload_and_store_jd(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    try:
        # Step 1: Save and extract text
        contents = await file.read()
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as f:
            f.write(contents)
        jd_text = textract.process(temp_path).decode("utf-8").strip()
        os.remove(temp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")

    # Step 2: Extract job title — fallback to filename
    job_title = file.filename.rsplit('.', 1)[0].replace('_', ' ').title()

    try:
        # Step 3: Store in DB
        stmt = insert(JobDescription).values(
            job_title=job_title,
            description=jd_text,
            uploaded_at=datetime.utcnow()
        )
        await db.execute(stmt)
        await db.commit()
        return JSONResponse(content={"message": "✅ JD uploaded and stored successfully", "job_title": job_title})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database insert failed: {str(e)}")


@router.get("/list")
async def list_jds(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(JobDescription.id, JobDescription.job_title))
        jds = [{"id": row.id, "job_title": row.job_title} for row in result.all()]
        return jds
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch job descriptions: {str(e)}")


@router.get("/{jd_id}")
async def get_jd_by_id(jd_id: int, db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(
            select(JobDescription.id, JobDescription.job_title, JobDescription.description)
            .where(JobDescription.id == jd_id)
        )
        jd = result.first()
        if not jd:
            raise HTTPException(status_code=404, detail="Job Description not found")
        return {
            "id": jd.id,
            "job_title": jd.job_title,
            "description": jd.description
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch job description: {str(e)}") 
