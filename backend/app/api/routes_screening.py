from fastapi import APIRouter, UploadFile, File
from app.services.audio_transcriber import transcribe_audio

router = APIRouter()

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    result = await transcribe_audio(file)
    return result
