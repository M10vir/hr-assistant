from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.db.database import Base
from app.models.db_models import ResumeScore

class ResumeScore(Base):
    __tablename__ = "resume_scores"

    id = Column(Integer, primary_key=True, index=True)
    candidate_name = Column(String)
    filename = Column(String)
    relevance_score = Column(Float)
    ats_score = Column(Float)
    readability_score = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
