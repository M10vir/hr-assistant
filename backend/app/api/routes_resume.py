# backend/app/api/routes_resume.py

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert
from sqlalchemy.future import select
from datetime import datetime
import os

from app.db.database import get_db
from app.models.db_models import ResumeScore, JobDescription
from app.services.resume_matcher import get_jd_resume_match_score
from app.utils.email_notify import (
    send_hr_high_match_alert,
    send_candidate_invite,
)

# ✅ Hardened extractors
from app.utils.extract_text import extract_text_from_file
from app.utils.extract_name import extract_candidate_details

# ✅ Real scorers (JD‑aware ATS, robust readability, deterministic relevance, canonicalization)
from app.utils.score_resume import (
    canonicalize_text,            # ← NEW: format-agnostic normalization
    compute_ats_score,
    compute_readability_score,
    compute_relevance_score,      # deterministic component for hybrid
)

router = APIRouter()

@router.post("/resume/score")
async def score_resume_against_jd(
    jd_id: int = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload a resume file, extract + canonicalize text (.pdf/.docx/.doc),
    fetch JD by jd_id (also canonicalized), compute HYBRID relevance (70% GPT + 30% deterministic),
    compute ATS/Readability, store in DB, and trigger emails when relevance >= 90.
    """
    # 1) Fetch JD
    jd_row = await db.execute(select(JobDescription).where(JobDescription.id == jd_id))
    jd = jd_row.scalar_one_or_none()
    if not jd:
        raise HTTPException(status_code=404, detail="Job Description not found for given jd_id.")

    # 2) Read upload bytes and extract text (robust), then canonicalize
    try:
        file_bytes = await file.read()
        raw_resume_text = extract_text_from_file(file.filename, file_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume text extraction failed: {str(e)}")

    resume_text = canonicalize_text(raw_resume_text)
    if not resume_text:
        raise HTTPException(status_code=400, detail="No text could be extracted from the resume.")

    # Canonicalize JD as well for parity (important for PDF vs DOCX consistency)
    jd_text = canonicalize_text(jd.description or "")

    # 3) Relevance: GPT + deterministic hybrid (both get canonicalized text)
    match_result = get_jd_resume_match_score(resume_text=resume_text, jd_text=jd_text)
    gpt_rel = float(match_result.get("match_score", 0) or 0)
    feedback = match_result.get("feedback", "")

    det_rel = float(compute_relevance_score(resume_text, jd_text))

    use_hybrid = os.getenv("USE_HYBRID_RELEVANCE", "true").lower() not in {"0", "false", "no"}
    if use_hybrid:
        relevance_score = int(round(0.70 * gpt_rel + 0.30 * det_rel))
    else:
        relevance_score = int(round(gpt_rel))

    # If GPT failed silently (0 + no feedback), hard‑fallback to deterministic
    if relevance_score == 0 and not feedback:
        relevance_score = int(round(det_rel))
        feedback = "Deterministic relevance used due to GPT unavailability."

    # 4) ATS & Readability (on canonical resume text; ATS is JD‑aware)
    ats_score = int(round(compute_ats_score(resume_text, jd_text)))
    readability_score = int(round(compute_readability_score(resume_text)))

    # 5) Extract candidate details (OpenAI v1 if configured; else regex fallback)
    candidate_name, email, phone_number = extract_candidate_details(resume_text)
    candidate_name = candidate_name or ""
    email = email or ""
    phone_number = phone_number or ""

    # 6) Insert into resume_scores (store CANONICAL resume_text for consistency/searchability)
    try:
        stmt = (
            insert(ResumeScore)
            .values(
                candidate_name=candidate_name,
                filename=file.filename,
                relevance_score=relevance_score,
                ats_score=ats_score,
                readability_score=readability_score,
                created_at=datetime.utcnow(),
                email=email,
                phone_number=phone_number,
                resume_text=resume_text,   # ← canonicalized text
            )
            .returning(ResumeScore.id)
        )
        res = await db.execute(stmt)
        new_id = res.scalar_one()
        await db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store resume score: {str(e)}")

    # 7) Email triggers if relevance_score >= 90 (non‑blocking)
    try:
        if relevance_score >= 90:
            frontend_base = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")
            assessment_url = f"{frontend_base}/?start=assessment&resume_id={new_id}"

            send_hr_high_match_alert(
                candidate_name=candidate_name or "",
                filename=file.filename,
                relevance_score=relevance_score,
                ats_score=ats_score,
                readability_score=readability_score,
                job_title=jd.job_title,
                email=email or "",
                phone_number=phone_number or "",
                feedback_short=(feedback[:140] + "…") if feedback else "",
            )

            if email:
                send_candidate_invite(
                    candidate_email=email,
                    job_title=jd.job_title,
                    assessment_url=assessment_url,
                )
    except Exception as e:
        print(f"[email triggers] non-blocking error: {e}")

    # 8) Response for UI
    return JSONResponse(
        content={
            "id": new_id,
            "filename": file.filename,
            "scores": {
                "relevance_score": relevance_score,
                "ats_score": ats_score,
                "readability_score": readability_score,
            },
            "excerpt": resume_text[:1200],
            "feedback": feedback,
            "jd_id": jd_id,
            "jd_title": jd.job_title,
        },
        status_code=200,
    ) 
