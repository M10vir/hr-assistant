# backend/app/models/db_models.py

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Text,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import JSONB
from app.db.database import Base


# -----------------------------
# ResumeScore
# -----------------------------
class ResumeScore(Base):
    __tablename__ = "resume_scores"

    id = Column(Integer, primary_key=True, index=True)

    # Core identity
    candidate_name = Column(String, nullable=False)
    filename = Column(String, nullable=False)

    # Scores
    relevance_score = Column(Float, nullable=False)
    ats_score = Column(Float, nullable=False)
    readability_score = Column(Float, nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Contacts / extracted meta
    email = Column(Text, nullable=True)
    phone_number = Column(Text, nullable=True)

    # Persisted text + storage metadata
    resume_text = Column(Text, nullable=True)          # <- exists in DB
    file_path = Column(Text, nullable=True)            # <- exists in DB
    mime_type = Column(String(100), nullable=True)     # <- exists in DB

    def __repr__(self) -> str:
        return f"<ResumeScore id={self.id} file={self.filename} rel={self.relevance_score}>"


# -----------------------------
# InterviewSubmission
# -----------------------------
class InterviewSubmission(Base):
    __tablename__ = "interview_submissions"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String, nullable=False)
    email = Column(Text, nullable=True)
    phone_number = Column(Text, nullable=True)
    job_title = Column(String, nullable=False)

    # structured/free-form payloads
    answers = Column(JSONB)
    feedback = Column(JSONB, nullable=True)
    grand_score_percent = Column(Float, nullable=True)

    submitted_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<InterviewSubmission id={self.id} candidate={self.candidate_name}>"


# -----------------------------
# JobDescription
# -----------------------------
class JobDescription(Base):
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    job_title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<JobDescription id={self.id} title={self.job_title}>"


# -----------------------------
# AIRecommendation (new)
# -----------------------------
class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)

    # FK to JD and Candidate
    jd_id = Column(Integer, ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False)
    candidate_id = Column(Integer, ForeignKey("resume_scores.id", ondelete="CASCADE"), nullable=False)

    # Small rationale / explanation (optional)
    recommendation_text = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self) -> str:
        return f"<AIRecommendation id={self.id} jd_id={self.jd_id} cand_id={self.candidate_id}>" 
