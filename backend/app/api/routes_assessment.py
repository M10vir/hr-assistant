# backend/app/api/routes_assessment.py

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert, select
from typing import List
from datetime import datetime
import os
import re
from openai import AsyncOpenAI

from app.db.database import get_db
from app.models.db_models import InterviewSubmission
from app.utils.email_notify import send_hr_interview_notification

router = APIRouter()

# 🔐 Load OpenAI key
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise RuntimeError("❌ OPENAI_API_KEY is not set.")
client = AsyncOpenAI(api_key=openai_api_key)

# 🔍 Extract float score from feedback like "Score: 8.5/10" or "8.5 out of 10"
def extract_score(feedback: str) -> float:
    match = re.search(r"(\d+(\.\d+)?)\s*(?:/10|out\s*of\s*10)", feedback, re.IGNORECASE)
    return float(match.group(1)) if match else 0.0

# ✂️ Clean GPT feedback by removing top-level "Score: x/10"
def clean_feedback(text: str) -> str:
    return re.sub(r"^Score:\s*\d+(\.\d+)?\s*/\s*10\s*[\-:]*", "", text.strip(), flags=re.IGNORECASE).strip()

# 📦 Request model
class AnswerSubmission(BaseModel):
    candidate_name: str
    email: EmailStr | None = None
    phone_number: str | None = None
    job_title: str
    answers: List[str]

# ✅ Get GPT questions
@router.get("/assessment/questions")
async def get_questions(job_title: str = Query(..., min_length=2)):
    prompt = (
        f"Generate 3 technical interview questions for the job title: {job_title}. "
        "Make sure they assess hands-on skills. Return as a numbered list."
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
        questions = [line.strip().lstrip("1234567890. ").strip() for line in content.split("\n") if line.strip()]
        if len(questions) < 3:
            raise HTTPException(status_code=500, detail="Incomplete GPT response")
        return {"job_title": job_title, "questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GPT error: {str(e)}")

# 📝 Submit answers and get feedback
@router.post("/assessment/submit")
async def submit_answers(payload: AnswerSubmission, db: AsyncSession = Depends(get_db)):
    feedback_list = []
    grand_score = 0.0

    for idx, answer in enumerate(payload.answers):
        try:
            response = await client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a technical interviewer. Provide concise feedback and a score out of 10."},
                    {"role": "user", "content": f"Evaluate this answer to Question {idx+1}: '{answer}' and give a brief feedback and score out of 10."}
                ],
                max_tokens=250,
                temperature=0.6,
            )
            raw_feedback = response.choices[0].message.content.strip()
            score = extract_score(raw_feedback)
            clean = clean_feedback(raw_feedback)
            grand_score += score

            feedback_list.append({
                "question_number": idx + 1,
                "answer": answer,
                "score": score,
                "feedback": clean
            })
        except Exception as e:
            feedback_list.append({
                "question_number": idx + 1,
                "answer": answer,
                "score": 0.0,
                "feedback": f"Error generating feedback: {str(e)}"
            })

    max_score = len(payload.answers) * 10
    grand_score_percent = round((grand_score / max_score) * 100, 2) if max_score else 0.0

    # ✅ Save to DB
    stmt = insert(InterviewSubmission).values(
        candidate_name=payload.candidate_name,
        email=payload.email,
        phone_number=payload.phone_number,
        job_title=payload.job_title,
        answers=payload.answers,
        feedback=feedback_list,
        grand_score_percent=grand_score_percent,
        submitted_at=datetime.utcnow()
    )
    await db.execute(stmt)
    await db.commit()

    # 📧 Notify HR
    if grand_score_percent >= 80:
        send_hr_interview_notification(
            candidate_name=payload.candidate_name,
            email=payload.email,
            phone_number=payload.phone_number,
            job_title=payload.job_title,
            score=grand_score_percent
        )

    return {
        "message": "Submission saved with feedback.",
        "grand_score_percent": grand_score_percent,
        "submitted_at": datetime.utcnow(),
        "feedback": feedback_list
    }

# 📊 Retrieve all submissions
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
                "feedback": r.feedback,
                "grand_score_percent": r.grand_score_percent,
                "submitted_at": r.submitted_at,
            }
            for r in rows
        ]
    } 
