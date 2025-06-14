from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import insert
from datetime import datetime

from app.db.database import get_db
from app.models.db_models import ResumeScore
from app.utils.extract_text import extract_text_from_file
from app.utils.score_resume import (
    compute_relevance_score,
    compute_ats_score,
    compute_readability_score
)
from app.utils.extract_name import extract_candidate_details
from app.utils.email_notify import send_hr_notification  # ✅ Include email notifier

router = APIRouter()

# 🔹 POST /resumes/resume/score — Score resume and save to DB
@router.post("/resume/score")
async def score_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    db: AsyncSession = Depends(get_db),
):
    try:
        # Step 1: Extract raw text from uploaded file content
        contents = await file.read()
        extracted_text = extract_text_from_file(file.filename, contents)

        # Step 2: Extract candidate details
        candidate_name, email, phone_number = extract_candidate_details(extracted_text)

        # Step 3: Compute AI-based scores
        relevance_score = compute_relevance_score(extracted_text, job_description)
        ats_score = compute_ats_score(extracted_text)
        readability_score = compute_readability_score(extracted_text)

        # Step 4: Save record in the database
        stmt = insert(ResumeScore).values(
            candidate_name=candidate_name,
            filename=file.filename,
            relevance_score=relevance_score,
            ats_score=ats_score,
            readability_score=readability_score,
            email=email,
            phone_number=phone_number,
            created_at=datetime.utcnow(),
        )
        await db.execute(stmt)
        await db.commit()

        # ✅ Step 5: Notify HR if candidate is highly relevant
        if relevance_score >= 90:
            send_hr_notification(
                candidate_name=candidate_name,
                score=relevance_score,
                filename=file.filename,
                email=email,
                phone_number=phone_number
            )

        # Step 6: Return response
        return {
            "filename": file.filename,
            "candidate_name": candidate_name,
            "email": email,
            "phone_number": phone_number,
            "scores": {
                "relevance_score": relevance_score,
                "ats_score": ats_score,
                "readability_score": readability_score,
            },
            "excerpt": extracted_text[:500],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 🔹 GET /resumes/scores — Fetch all resume records for dashboard
@router.get("/scores")
async def get_all_resume_scores(db: AsyncSession = Depends(get_db)):
    """
    Returns all resume scores from the database.
    """
    result = await db.execute(select(ResumeScore))
    rows = result.scalars().all()

    return [
        {
            "candidate_name": r.candidate_name,
            "filename": r.filename,
            "relevance_score": r.relevance_score,
            "ats_score": r.ats_score,
            "readability_score": r.readability_score,
            "email": r.email,
            "phone_number": r.phone_number,
            "created_at": r.created_at,
        }
        for r in rows
    ]
