from fastapi import APIRouter, UploadFile, File, Form
from app.services.resume_parser import extract_text_from_file
from app.services.resume_scorer import score_resume
from typing import List

router = APIRouter()

@router.post("/batch-score")
async def batch_score_resumes(
    jd_file: UploadFile = File(...),
    resume_files: List[UploadFile] = File(...)
):
    jd_text = await extract_text_from_file(jd_file)
    results = []

    for resume in resume_files:
        resume_text = await extract_text_from_file(resume)
        scores = score_resume(resume_text, jd_text)
        results.append({
            "filename": resume.filename,
            "scores": scores,
            "excerpt": resume_text[:400]
        })

    return {"job_description": jd_file.filename, "results": results}

@router.post("/score")
async def upload_and_score_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    resume_text = await extract_text_from_file(file)
    scores = score_resume(resume_text, job_description)
    return {
        "filename": file.filename,
        "scores": scores,
        "excerpt": resume_text[:500]
    }

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    text = await extract_text_from_file(file)
    return {"filename": file.filename, "extracted_text": text[:500]}  # Return only first 500 chars

@router.get("/ping")
def test_resume_route():
    return {"message": "Resume route is working."}

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.database import get_db
# from app.db.db_models import ResumeScore
from app.models.db_models import ResumeScore

@router.get("/scores")
async def get_all_resume_scores(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ResumeScore))
    rows = result.scalars().all()
    return [
        {
            "candidate_name": r.candidate_name,
            "filename": r.filename,
            "relevance_score": r.relevance_score,
            "ats_score": r.ats_score,
            "readability_score": r.readability_score,
            "created_at": r.created_at,
        }
        for r in rows
    ]
