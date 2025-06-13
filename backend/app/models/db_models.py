# backend/app/models/db_models.py

from sqlalchemy import Column, Integer, String, Float, DateTime
from app.db.database import Base
from datetime import datetime

class ResumeScore(Base):
    __tablename__ = "resume_scores"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    relevance_score = Column(Float, nullable=False)
    ats_score = Column(Float, nullable=False)
    readability_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
