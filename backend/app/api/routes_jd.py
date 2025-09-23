# backend/app/api/routes_jd.py

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert
from sqlalchemy.future import select
from datetime import datetime

from app.db.database import get_db
from app.models.db_models import JobDescription

# ✅ Use our robust extractor (no textract dependency)
from app.utils.extract_text import extract_text_from_file
# (Optional) keep text consistent with resume scoring
from app.utils.score_resume import canonicalize_text

router = APIRouter()

@router.post("/upload-jd/")
async def upload_and_store_jd(file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    """
    Upload a JD (.pdf/.docx/.doc), extract+canonicalize text, store in DB.
    """
    try:
        file_bytes = await file.read()
        raw_text = extract_text_from_file(file.filename, file_bytes)
        jd_text = canonicalize_text(raw_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")

    if not jd_text:
        raise HTTPException(status_code=400, detail="No text could be extracted from the JD.")

    # Derive a sensible job title from filename if none available
    job_title = file.filename.rsplit(".", 1)[0].replace("_", " ").strip().title() or "Job Description"

    try:
        stmt = insert(JobDescription).values(
            job_title=job_title,
            description=jd_text,
            uploaded_at=datetime.utcnow(),
        )
        await db.execute(stmt)
        await db.commit()
        return JSONResponse(
            content={"message": "✅ JD uploaded and stored successfully", "job_title": job_title},
            status_code=200,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database insert failed: {str(e)}")


# (Optional tiny read endpoint you added earlier)
@router.get("/list")
async def list_jd(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(JobDescription.id, JobDescription.job_title).order_by(JobDescription.uploaded_at.desc()))
    rows = res.all()
    return [{"id": r.id, "job_title": r.job_title} for r in rows]

@router.get("/{jd_id}")
async def get_jd(jd_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(JobDescription).where(JobDescription.id == jd_id))
    jd = res.scalar_one_or_none()
    if not jd:
        raise HTTPException(status_code=404, detail="JD not found")
    return {"id": jd.id, "job_title": jd.job_title, "description": jd.description, "uploaded_at": jd.uploaded_at} 
