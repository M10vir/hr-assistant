import whisper
import os
from tempfile import NamedTemporaryFile
from fastapi import UploadFile

model = whisper.load_model("base")  # You can switch to "medium" or "large" later

async def transcribe_audio(file: UploadFile) -> dict:
    # Save uploaded file to temp location
    suffix = os.path.splitext(file.filename)[-1]
    with NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        result = model.transcribe(tmp_path)
        return {
            "filename": file.filename,
            "text": result["text"],
            "segments": result.get("segments", [])
        }
    finally:
        os.remove(tmp_path)
