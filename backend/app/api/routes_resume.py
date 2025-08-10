# backend/app/api/routes_resume.py

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert
from sqlalchemy.future import select
from datetime import datetime
import os, textract

from app.db.database import get_db
from app.models.db_models import ResumeScore, JobDescription
from app.services.resume_matcher import get_jd_resume_match_score
# If you have existing scorers, import them here
# from app.services.resume_scorer import score_ats_readability

router = APIRouter()

@router.post("/resume/score")
async def score_resume_against_jd(
    jd_id: int = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a resume file, parse text, fetch JD by jd_id, and compute relevance score via GPT.
    Stores to resume_scores (including resume_text). Returns scores for UI.
    """
    # 1) Fetch JD
    jd_row = await db.execute(
        select(JobDescription).where(JobDescription.id == jd_id)
    )
    jd = jd_row.scalar_one_or_none()
    if not jd:
        raise HTTPException(status_code=404, detail="Job Description not found for given jd_id.")

    # 2) Persist file temporarily and extract text
    try:
        contents = await file.read()
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as f:
            f.write(contents)
        resume_text = textract.process(temp_path).decode("utf-8", errors="ignore").strip()
        try:
            os.remove(temp_path)
        except Exception:
            pass
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume text extraction failed: {str(e)}")

    if not resume_text:
        raise HTTPException(status_code=400, detail="No text could be extracted from the resume.")

    # 3) Compute relevance score via GPT (JD vs resume_text)
    match_result = get_jd_resume_match_score(resume_text=resume_text, jd_text=jd.description)
    relevance_score = int(match_result.get("match_score", 0))
    feedback = match_result.get("feedback", "")

    # 4) (Optional) ATS & readability scoring via your existing logic
    # ats_score, readability_score = score_ats_readability(resume_text)
    # For now, if you don't have a function handy, default to 0 or keep existing calculations elsewhere:
    ats_score = 0
    readability_score = 0

    # 5) Extract minimal candidate info if you already do this elsewhere, otherwise leave blank
    candidate_name = ""
    email = ""
    phone_number = ""

    # 6) Insert into resume_scores (including resume_text) – always store; UI will filter top 20 ≥90 later
    try:
        stmt = insert(ResumeScore).values(
            candidate_name=candidate_name,
            filename=file.filename,
            relevance_score=relevance_score,
            ats_score=ats_score,
            readability_score=readability_score,
            created_at=datetime.utcnow(),
            email=email,
            phone_number=phone_number,
            resume_text=resume_text,   # <-- new column we added
        ).returning(ResumeScore.id)
        res = await db.execute(stmt)
        new_id = res.scalar_one()
        await db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store resume score: {str(e)}")

    # 7) Build response compatible with your UI
    response = {
        "id": new_id,
        "filename": file.filename,
        "scores": {
            "relevance_score": relevance_score,
            "ats_score": ats_score,
            "readability_score": readability_score
        },
        "excerpt": resume_text[:1200],  # small excerpt for UI preview
        "feedback": feedback,
        "jd_id": jd_id,
        "jd_title": jd.job_title,
    }

    return JSONResponse(content=response, status_code=200) 
