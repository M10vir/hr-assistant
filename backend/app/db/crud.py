from app.db import models
from datetime import datetime

async def save_resume_score(session, candidate_name, filename, relevance_score, ats_score, readability_score):
    new_score = models.ResumeScore(
        candidate_name=candidate_name,
        filename=filename,
        relevance_score=relevance_score,
        ats_score=ats_score,
        readability_score=readability_score,
        created_at=datetime.utcnow()
    )
    session.add(new_score)
    await session.commit()
