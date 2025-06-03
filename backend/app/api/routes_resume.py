from fastapi import APIRouter, UploadFile, File, Form
from app.services.resume_parser import extract_text_from_file
from app.services.resume_scorer import score_resume

router = APIRouter()

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
