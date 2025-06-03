from fastapi import APIRouter, UploadFile, File, Form
from app.services.resume_parser import extract_text_from_file
from app.services.resume_scorer import score_resume
from typing import List

router = APIRouter()

@router.post("/batch-score")
async def batch_score_resumes(
    jd_file: UploadFile = File(...),
    resume_files: List[UploadFile] = File(...)
):
    jd_text = await extract_text_from_file(jd_file)
    results = []

    for resume in resume_files:
        resume_text = await extract_text_from_file(resume)
        scores = score_resume(resume_text, jd_text)
        results.append({
            "filename": resume.filename,
            "scores": scores,
            "excerpt": resume_text[:400]
        })

    return {"job_description": jd_file.filename, "results": results}

@router.post("/score")
async def upload_and_score_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...)
):
    resume_text = await extract_text_from_file(file)
    scores = score_resume(resume_text, job_description)
    return {
        "filename": file.filename,
        "scores": scores,
        "excerpt": resume_text[:500]
    }

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    text = await extract_text_from_file(file)
    return {"filename": file.filename, "extracted_text": text[:500]}  # Return only first 500 chars

@router.get("/ping")
def test_resume_route():
    return {"message": "Resume route is working."}
