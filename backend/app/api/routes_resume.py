from fastapi import APIRouter, UploadFile, File
from app.services.resume_parser import extract_text_from_file

router = APIRouter()

@router.post("/upload")
async def upload_resume(file: UploadFile = File(...)):
    text = await extract_text_from_file(file)
    return {"filename": file.filename, "extracted_text": text[:500]}  # Return only first 500 chars

@router.get("/ping")
def test_resume_route():
    return {"message": "Resume route is working."}
