from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert, select
from typing import List
from datetime import datetime
import os
from openai import AsyncOpenAI

from app.db.database import get_db
from app.models.db_models import InterviewSubmission

router = APIRouter()

# 🔹 Setup OpenAI client from .env
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise RuntimeError("❌ OPENAI_API_KEY is not set in the environment.")

client = AsyncOpenAI(api_key=openai_api_key)

# 🔹 Pydantic model for submission
class AnswerSubmission(BaseModel):
    candidate_name: str
    email: EmailStr | None = None
    phone_number: str | None = None
    job_title: str
    answers: List[str]

# ✅ GPT-generated questions endpoint
@router.get("/assessment/questions")
async def get_questions(job_title: str = Query(..., min_length=2)):
    prompt = (
        f"Generate 3 technical interview questions for the job title: {job_title}. "
        "Make sure the questions test practical skills and real-world knowledge. "
        "Return the questions as a numbered list."
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert technical interviewer."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7,
        )

        content = response.choices[0].message.content.strip()
        questions = [
            line.strip().lstrip("1234567890. ").strip()
            for line in content.split("\n")
            if line.strip()
        ]

        if len(questions) < 3:
            raise HTTPException(status_code=500, detail="Incomplete questions from GPT")

        return {"job_title": job_title, "questions": questions}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GPT question generation error: {str(e)}")

# ✅ Store assessment answers
@router.post("/assessment/submit")
async def submit_answers(payload: AnswerSubmission, db: AsyncSession = Depends(get_db)):
    stmt = insert(InterviewSubmission).values(
        candidate_name=payload.candidate_name,
        email=payload.email,
        phone_number=payload.phone_number,
        job_title=payload.job_title,
        answers=payload.answers,
        submitted_at=datetime.utcnow()
    )
    await db.execute(stmt)
    await db.commit()

    return {
        "message": "Answers submitted successfully.",
        "submitted_at": datetime.utcnow()
    }

# ✅ Retrieve all interview submissions
@router.get("/assessment/submissions")
async def get_all_submissions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InterviewSubmission))
    rows = result.scalars().all()

    return {
        "submissions": [
            {
                "candidate_name": r.candidate_name,
                "email": r.email,
                "phone_number": r.phone_number,
                "job_title": r.job_title,
                "answers": r.answers,
                "submitted_at": r.submitted_at,
            }
            for r in rows
        ]
    }
