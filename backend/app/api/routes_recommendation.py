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
async def get_recommendations(
    job_title: str = Query(None, description="Optional job title to filter recommendations"),
    db: AsyncSession = Depends(get_db)
):
    """
    Recommend top resumes based on relevance, ATS score, readability, and job title keyword.
    """
    query = select(ResumeScore)
    result = await db.execute(query)
    all_scores = result.scalars().all()

    if not all_scores:
        return {"job_title": job_title, "timestamp": datetime.utcnow(), "recommendations": []}

    recommendations = []

    for resume in all_scores:
        # Weighted average score
        weighted_score = (
            0.5 * resume.relevance_score +
            0.3 * resume.ats_score +
            0.2 * resume.readability_score
        )

        # Match reason logic
        match_reason = "Strong general match based on scores"

        if job_title:
            job_title_lower = job_title.lower()
            filename_match = job_title_lower in resume.filename.lower()
            name_match = job_title_lower in resume.candidate_name.lower()

            if filename_match:
                match_reason = f"Filename contains '{job_title}'"
            elif name_match:
                match_reason = f"Candidate name suggests role '{job_title}'"

        recommendations.append({
            "candidate_name": resume.candidate_name or "Candidate",
            "filename": resume.filename,
            "recommendation_score": round(weighted_score, 2),
            "match_reason": match_reason
        })

    # Sort by score and return top 10
    top_n = sorted(recommendations, key=lambda r: r["recommendation_score"], reverse=True)[:10]

    return {
        "job_title": job_title,
        "timestamp": datetime.utcnow(),
        "recommendations": top_n
    } 
