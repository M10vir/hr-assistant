from app.models.db_models import ResumeScore
from app.db.database import SessionLocal
from sqlalchemy.future import select

async def save_resume_score(db, data: dict):
    db_obj = ResumeScore(**data)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
