import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.resume_parser import extract_text_from_file
from app.services.resume_scorer import score_resume
from fastapi import UploadFile
from io import BytesIO
import os

# File paths
DATA_DIR = os.path.abspath("data")
JD_PATH = os.path.join(DATA_DIR, "job_description.docx")
RESUME_DIR = os.path.join(DATA_DIR, "resumes")

def fake_upload_file(path: str):
    with open(path, "rb") as f:
        return UploadFile(filename=os.path.basename(path), file=BytesIO(f.read()))

async def bulk_score_from_folder():
    jd_file = fake_upload_file(JD_PATH)
    jd_text = await extract_text_from_file(jd_file)

    results = []

    for fname in os.listdir(RESUME_DIR):
        resume_path = os.path.join(RESUME_DIR, fname)
        resume_file = fake_upload_file(resume_path)
        resume_text = await extract_text_from_file(resume_file)
        scores = score_resume(resume_text, jd_text)
        results.append({
            "filename": fname,
            "scores": scores,
            "excerpt": resume_text[:400]
        })

    return results

# Add a runner
import asyncio
if __name__ == "__main__":
    results = asyncio.run(bulk_score_from_folder())
    for r in results:
        print(r)
