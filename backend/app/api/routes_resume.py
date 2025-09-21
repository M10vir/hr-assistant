# backend/app/api/routes_resume.py

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form, Query
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert
from datetime import datetime
import os
import uuid
import mimetypes

from app.db.database import get_db
from app.models.db_models import ResumeScore, JobDescription
from app.services.resume_matcher import get_jd_resume_match_score
from app.utils.email_notify import send_hr_high_match_alert, send_candidate_invite

# Extractors / scorers
from app.utils.extract_text import extract_text_from_file
from app.utils.extract_name import extract_candidate_details
from app.utils.score_resume import (
    canonicalize_text,
    compute_ats_score,
    compute_readability_score,
    compute_relevance_score,   # deterministic component (hybrid)
)

router = APIRouter()

# ---------- helpers ----------
def _storage_root() -> str:
    root = os.getenv("BACKEND_STORAGE_DIR", "./storage")
    path = os.path.join(root, "resumes")
    os.makedirs(path, exist_ok=True)
    return path

def _safe_name(name: str) -> str:
    keep = "-_.() abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return "".join(c for c in (name or "file") if c in keep) or "file"

# ---------- endpoints ----------
@router.post("/resume/score")
async def score_resume_against_jd(
    jd_id: int = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """
    Upload resume, save original, extract + canonicalize text (.pdf/.docx/.doc),
    fetch JD, compute HYBRID relevance (70% GPT + 30% deterministic),
    compute ATS/Readability, store, and fire emails if relevance >= 90.
    """
    # 1) JD
    res = await db.execute(select(JobDescription).where(JobDescription.id == jd_id))
    jd = res.scalar_one_or_none()
    if not jd:
        raise HTTPException(status_code=404, detail="Job Description not found for given jd_id.")

    # 2) Read bytes & persist original
    try:
        file_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read upload: {e}")

    original_name = file.filename or "resume"
    safe_original = _safe_name(original_name)
    mime = file.content_type or mimetypes.guess_type(safe_original)[0] or "application/octet-stream"

    uniq = uuid.uuid4().hex
    stored_basename = f"{uniq}_{safe_original}"
    stored_path = os.path.join(_storage_root(), stored_basename)
    try:
        with open(stored_path, "wb") as fh:
            fh.write(file_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store original file: {e}")

    # 3) Extract + canonicalize
    try:
        raw_resume_text = extract_text_from_file(original_name, file_bytes)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume text extraction failed: {e}")

    resume_text = canonicalize_text(raw_resume_text)
    if not resume_text:
        raise HTTPException(status_code=400, detail="No text could be extracted from the resume.")
    jd_text = canonicalize_text(jd.description or "")

    # 4) Hybrid relevance
    gpt_result = get_jd_resume_match_score(resume_text=resume_text, jd_text=jd_text)
    gpt_rel = float(gpt_result.get("match_score", 0) or 0)
    feedback = gpt_result.get("feedback", "")
    det_rel = float(compute_relevance_score(resume_text, jd_text))

    use_hybrid = os.getenv("USE_HYBRID_RELEVANCE", "true").lower() not in {"0", "false", "no"}
    relevance_score = int(round(0.70 * gpt_rel + 0.30 * det_rel)) if use_hybrid else int(round(gpt_rel))
    if relevance_score == 0 and not feedback:
        relevance_score = int(round(det_rel))
        feedback = "Deterministic relevance used due to GPT unavailability."

    # 5) ATS & Readability
    ats_score = int(round(compute_ats_score(resume_text, jd_text)))
    readability_score = int(round(compute_readability_score(resume_text)))

    # 6) Candidate details
    candidate_name, email, phone_number = extract_candidate_details(resume_text)
    candidate_name = candidate_name or ""
    email = email or ""
    phone_number = phone_number or ""

    # 7) Insert row (includes file_path + mime_type for download)
    try:
        ins = (
            insert(ResumeScore)
            .values(
                candidate_name=candidate_name,
                filename=original_name,
                relevance_score=relevance_score,
                ats_score=ats_score,
                readability_score=readability_score,
                created_at=datetime.utcnow(),
                email=email,
                phone_number=phone_number,
                resume_text=resume_text,
                file_path=stored_path,
                mime_type=mime,
            )
            .returning(ResumeScore.id)
        )
        res = await db.execute(ins)
        new_id = res.scalar_one()
        await db.commit()
    except Exception as e:
        try:
            if os.path.exists(stored_path):
                os.remove(stored_path)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Failed to store resume score: {e}")

    # 8) Email triggers (non-blocking)
    try:
        if relevance_score >= 90:
            frontend_base = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")
            assessment_url = f"{frontend_base}/?start=assessment&resume_id={new_id}"
            send_hr_high_match_alert(
                candidate_name=candidate_name,
                filename=original_name,
                relevance_score=relevance_score,
                ats_score=ats_score,
                readability_score=readability_score,
                job_title=jd.job_title,
                email=email,
                phone_number=phone_number,
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

    api_base = os.getenv("API_BASE_URL", "http://localhost:8000")
    download_url = f"{api_base}/resumes/{new_id}/download"

    return JSONResponse(
        content={
            "id": new_id,
            "filename": original_name,
            "scores": {
                "relevance_score": relevance_score,
                "ats_score": ats_score,
                "readability_score": readability_score,
            },
            "excerpt": resume_text[:1200],
            "feedback": feedback,
            "jd_id": jd_id,
            "jd_title": jd.job_title,
            "download_url": download_url,
        },
        status_code=200,
    )

@router.get("/top")
async def get_top_resumes(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(
            ResumeScore.id,
            ResumeScore.candidate_name,
            ResumeScore.filename,
            ResumeScore.relevance_score,
            ResumeScore.ats_score,
            ResumeScore.readability_score,
            ResumeScore.email,
            ResumeScore.phone_number,
            ResumeScore.created_at,
        )
        .order_by(
            ResumeScore.relevance_score.desc(),
            ResumeScore.ats_score.desc(),
            ResumeScore.created_at.desc(),
        )
        .limit(limit)
    )
    res = await db.execute(stmt)
    rows = res.all()
    data = [
        {
            "id": r.id,
            "candidate_name": r.candidate_name or "",
            "filename": r.filename,
            "relevance_score": r.relevance_score,
            "ats_score": r.ats_score,
            "readability_score": r.readability_score,
            "email": r.email or "",
            "phone_number": r.phone_number or "",
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]
    return JSONResponse(content=data, status_code=200)

@router.get("/scores")
async def list_recent_scores(
    limit: int = Query(50, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(
            ResumeScore.id,
            ResumeScore.candidate_name,
            ResumeScore.filename,
            ResumeScore.relevance_score,
            ResumeScore.ats_score,
            ResumeScore.readability_score,
            ResumeScore.email,
            ResumeScore.phone_number,
            ResumeScore.created_at,
        )
        .order_by(ResumeScore.created_at.desc())
        .limit(limit)
    )
    res = await db.execute(stmt)
    rows = res.all()
    data = [
        {
            "id": r.id,
            "candidate_name": r.candidate_name or "",
            "filename": r.filename,
            "relevance_score": r.relevance_score,
            "ats_score": r.ats_score,
            "readability_score": r.readability_score,
            "email": r.email or "",
            "phone_number": r.phone_number or "",
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]
    return JSONResponse(content=data, status_code=200)

@router.get("/{resume_id}/text")
async def get_resume_text(resume_id: int, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(ResumeScore).where(ResumeScore.id == resume_id))
    row = q.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Resume not found")
    return JSONResponse(
        content={
            "id": row.id,
            "candidate_name": row.candidate_name or "",
            "email": row.email or "",
            "phone_number": row.phone_number or "",
            "filename": row.filename,
            "created_at": row.created_at.isoformat() if row.created_at else None,
            "resume_text": row.resume_text or "",
        },
        status_code=200,
    )

@router.get("/{resume_id}/download")
async def download_original(resume_id: int, db: AsyncSession = Depends(get_db)):
    q = await db.execute(select(ResumeScore).where(ResumeScore.id == resume_id))
    row = q.scalar_one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Resume not found")
    if not getattr(row, "file_path", None) or not os.path.exists(row.file_path):
        raise HTTPException(status_code=404, detail="Original file not available")
    media_type = getattr(row, "mime_type", None) or mimetypes.guess_type(row.filename or "")[0] or "application/octet-stream"
    return FileResponse(
        row.file_path,
        media_type=media_type,
        filename=row.filename or os.path.basename(row.file_path),
    ) 
