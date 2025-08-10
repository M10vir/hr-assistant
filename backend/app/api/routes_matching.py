# backend/app/api/routes_matching.py

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.db.database import get_db
from app.models.db_models import ResumeScore, JobDescription  # Adjust this import if needed
from app.services.resume_matcher import get_jd_resume_match_score

router = APIRouter()

class MatchRequest(BaseModel):
    resume_id: int
    jd_id: int

@router.post("/resume-to-jd/", tags=["Resume-JD Matching"])
def match_resume_to_jd(request: MatchRequest, db: Session = Depends(get_db)):
    """
    Compares a resume and job description using GPT-4 and returns a match score and feedback.
    """
    resume = db.query(ResumeScore).filter(ResumeScore.id == request.resume_id).first()
    jd = db.query(JobDescription).filter(JobDescription.id == request.jd_id).first()

    if not resume or not jd:
        raise HTTPException(status_code=404, detail="Resume or Job Description not found.")

    if not resume.resume_text:
        raise HTTPException(status_code=400, detail="Resume text is missing for the selected resume.")

    # GPT matching using resume_text and description
    result = get_jd_resume_match_score(resume.resume_text, jd.description)

    return {
        "resume_id": request.resume_id,
        "jd_id": request.jd_id,
        "match_score": result["match_score"],
        "feedback": result["feedback"]
    }
