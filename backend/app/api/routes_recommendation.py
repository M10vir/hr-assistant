# backend/app/api/routes_recommendation.py

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, insert

from app.db.database import get_db
from app.models.db_models import JobDescription, ResumeScore, AIRecommendation

router = APIRouter(prefix="/recommend", tags=["AI Recommendations"])


def _top_candidates_stmt(limit: int):
    """Common ordering used by both GET and POST."""
    return (
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


@router.get("/recommendations")
async def get_ai_recommendations(
    jd_id: int = Query(..., description="Job Description ID"),
    limit: int = Query(5, ge=1, le=50, description="Max candidates to return (default 5)"),
    db: AsyncSession = Depends(get_db),
):
    # 1) Validate JD
    row = await db.execute(select(JobDescription).where(JobDescription.id == jd_id))
    jd = row.scalar_one_or_none()
    if not jd:
        raise HTTPException(status_code=404, detail="Job Description not found.")

    # 2) Rank candidates (global scores for now)
    res = await db.execute(_top_candidates_stmt(limit))
    rows = res.all()

    payload = {
        "jd_id": jd_id,
        "job_title": jd.job_title,
        "recommendations": [
            {
                "candidate_id": r.id,
                "candidate_name": (r.candidate_name or "").strip() or "—",
                "filename": r.filename,
                "relevance_score": r.relevance_score,
                "ats_score": r.ats_score,
                "readability_score": r.readability_score,
                "email": r.email or "",
                "phone_number": r.phone_number or "",
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "why": f"High overall relevance and ATS alignment for {jd.job_title}.",
            }
            for r in rows
        ],
    }
    return JSONResponse(content=payload, status_code=200)


@router.post("/save")
async def save_recommendations(
    jd_id: int = Body(..., embed=True, description="Job Description ID"),
    limit: int = Body(5, embed=True, ge=1, le=50, description="Max candidates to persist"),
    db: AsyncSession = Depends(get_db),
):
    """
    Persist a snapshot of the current top-N recommendations for a given JD.
    Strategy:
      1) Validate JD
      2) Select top-N candidates by (relevance desc, ats desc, created_at desc)
      3) DELETE existing ai_recommendations for this jd_id (idempotent snapshot)
      4) INSERT new rows with a concise 'recommendation_text'
    """
    # 1) Validate JD
    row = await db.execute(select(JobDescription).where(JobDescription.id == jd_id))
    jd = row.scalar_one_or_none()
    if not jd:
        raise HTTPException(status_code=404, detail="Job Description not found.")

    # 2) Rank candidates
    res = await db.execute(_top_candidates_stmt(limit))
    rows = res.all()

    # 3) Clear previous snapshot (idempotent)
    await db.execute(delete(AIRecommendation).where(AIRecommendation.jd_id == jd_id))

    # 4) Insert fresh set
    if rows:
        values = [
            {
                "jd_id": jd_id,
                "candidate_id": r.id,
                "recommendation_text": (
                    f"Candidate { (r.candidate_name or '').strip() or '—' } "
                    f"matched {jd.job_title} with relevance {int(round(r.relevance_score))}% "
                    f"and ATS {int(round(r.ats_score))}%."
                ),
            }
            for r in rows
        ]
        await db.execute(insert(AIRecommendation).values(values))

    await db.commit()

    return JSONResponse(
        content={
            "message": "✅ Recommendations snapshot saved",
            "jd_id": jd_id,
            "job_title": jd.job_title,
            "saved_count": len(rows),
        },
        status_code=200,
    )


@router.get("/history")
async def get_saved_recommendations(
    jd_id: int = Query(..., description="Job Description ID"),
    db: AsyncSession = Depends(get_db),
):
    """
    View the last persisted snapshot for a JD.
    (We currently overwrite per /save; this returns the existing rows.)
    """
    # Validate JD
    row = await db.execute(select(JobDescription).where(JobDescription.id == jd_id))
    jd = row.scalar_one_or_none()
    if not jd:
        raise HTTPException(status_code=404, detail="Job Description not found.")

    recs = await db.execute(
        select(AIRecommendation).where(AIRecommendation.jd_id == jd_id).order_by(AIRecommendation.id.asc())
    )
    items = recs.scalars().all()

    data = [
        {
            "id": it.id,
            "candidate_id": it.candidate_id,
            "recommendation_text": it.recommendation_text,
            "created_at": it.created_at.isoformat() if getattr(it, "created_at", None) else None,
        }
        for it in items
    ]
    return JSONResponse(
        content={"jd_id": jd_id, "job_title": jd.job_title, "items": data},
        status_code=200,
    ) 
