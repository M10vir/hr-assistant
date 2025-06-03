import whisper
import os
import torchaudio
from tempfile import NamedTemporaryFile
from fastapi import UploadFile
from pyAudioAnalysis import audioSegmentation as aS

model = whisper.load_model("base")

async def transcribe_audio(file: UploadFile) -> dict:
    suffix = os.path.splitext(file.filename)[-1]
    with NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        # 1. Transcribe
        result = model.transcribe(tmp_path)

        # 2. Load audio for emotion profiling
        waveform, sr = torchaudio.load(tmp_path)
        tone_summary = classify_tone(tmp_path)

        return {
            "filename": file.filename,
            "text": result["text"],
            "segments": result.get("segments", []),
            "emotion_tone": tone_summary
        }
    finally:
        os.remove(tmp_path)


def classify_tone(file_path: str) -> dict:
    try:
        [flags_ind, classes_all, acc, CM] = aS.mtFileClassification(file_path, "pyAudioAnalysis/data/svmSpeechEmotion", "svm")
        tone_class = classes_all[flags_ind[0]]
        return {
            "primary_tone": tone_class,
            "confidence_estimate": round(acc, 2)
        }
    except Exception as e:
        return {
            "error": str(e),
            "primary_tone": "unknown",
            "confidence_estimate": 0
        }
