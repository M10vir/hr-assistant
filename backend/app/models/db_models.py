# backend/app/models/db_models.py

from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from app.db.database import Base
from datetime import datetime

# ResumeScore Model
class ResumeScore(Base):
    __tablename__ = "resume_scores"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    relevance_score = Column(Float, nullable=False)
    ats_score = Column(Float, nullable=False)
    readability_score = Column(Float, nullable=False)
    email = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ✅ InterviewSubmission Model for persistent interview storage
class InterviewSubmission(Base):
    __tablename__ = "interview_submissions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String, nullable=False)
    email = Column(Text)
    phone_number = Column(Text)
    job_title = Column(String, nullable=False)
    answers = Column(JSONB)
    submitted_at = Column(DateTime, default=datetime.utcnow)
