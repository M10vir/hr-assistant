import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.services.resume_parser import extract_text_from_file
from app.services.resume_scorer import score_resume
from app.db.crud import save_resume_score
from app.db.database import async_session
from app.utils.email_utils import send_score_email  # ✅ Send notification email
from fastapi import UploadFile
from io import BytesIO
import asyncio

# File paths
DATA_DIR = os.path.abspath("data")
JD_PATH = os.path.join(DATA_DIR, "job_description.docx")
RESUME_DIR = os.path.join(DATA_DIR, "resumes")


def fake_upload_file(path: str):
    with open(path, "rb") as f:
        return UploadFile(filename=os.path.basename(path), file=BytesIO(f.read()))


async def bulk_score_and_save():
    jd_file = fake_upload_file(JD_PATH)
    jd_text = await extract_text_from_file(jd_file)

    async with async_session() as session:
        for fname in os.listdir(RESUME_DIR):
            resume_path = os.path.join(RESUME_DIR, fname)
            resume_file = fake_upload_file(resume_path)
            resume_text = await extract_text_from_file(resume_file)
            scores = score_resume(resume_text, jd_text)

            candidate_name = os.path.splitext(fname)[0]

            # Save to database
            await save_resume_score(
                session=session,
                candidate_name=candidate_name,
                filename=fname,
                relevance_score=float(scores['relevance_score']),
                ats_score=float(scores['ats_score']),
                readability_score=float(scores['readability_score'])
            )

            print(f"✅ Saved: {fname} -> {scores}")

            # Trigger email if relevance score is high
            if scores["relevance_score"] > 75:
                send_score_email(candidate_name, fname, float(scores["relevance_score"]))


if __name__ == "__main__":
    asyncio.run(bulk_score_and_save())
