# backend/app/db/db_models.py

from sqlalchemy import Column, Integer, String, JSON, Float, DateTime
from datetime import datetime
from app.db.database import Base

class ResumeScore(Base):
    __tablename__ = "resume_scores"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    relevance_score = Column(Float, nullable=False)
    ats_score = Column(Float, nullable=False)
    readability_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    # ✅ Add these if they are missing
    email = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)


class InterviewSubmission(Base):
    __tablename__ = "interview_submissions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    job_title = Column(String, nullable=False)
    answers = Column(JSON, nullable=False)
    feedback = Column(JSON, nullable=False)
    grand_score_percent = Column(Float, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
