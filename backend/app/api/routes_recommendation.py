# backend/app/api/routes_recommendation.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from typing import List
from app.db.database import get_db
from app.models.db_models import ResumeScore

router = APIRouter(prefix="/recommend", tags=["Recommendation"])

@router.get("/recommendations")
async def get_recommendations(job_title: str = Query(None), db: AsyncSession = Depends(get_db)):
    """
    Recommend top resumes based on relevance, ats score, and job title keyword.
    """
    query = select(ResumeScore)
    result = await db.execute(query)
    all_scores = result.scalars().all()

    if not all_scores:
        return {"job_title": job_title, "timestamp": datetime.utcnow(), "recommendations": []}

    recommendations = []

    for resume in all_scores:
        match_score = (resume.relevance_score + resume.ats_score + resume.readability_score) / 3

        reason = "Strong general match based on score"
        if job_title and job_title.lower() in resume.filename.lower():
            reason = f"Filename matched job title: {job_title}"

        recommendations.append({
            "candidate_name": resume.candidate_name or "Candidate",
            "filename": resume.filename,
            "recommendation_score": round(match_score, 2),
            "match_reason": reason
        })

    top_n = sorted(recommendations, key=lambda r: r["recommendation_score"], reverse=True)[:10]

    return {
        "job_title": job_title,
        "timestamp": datetime.utcnow(),
        "recommendations": top_n
    }
