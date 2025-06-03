import fitz  # PyMuPDF
from docx import Document
from fastapi import UploadFile
from io import BytesIO
import mammoth

async def extract_text_from_file(file: UploadFile) -> str:
    contents = await file.read()
    if file.filename.endswith(".pdf"):
        return extract_text_from_pdf(contents)
    elif file.filename.endswith(".docx"):
        return extract_text_from_docx(contents)
    else:
        return "Unsupported file type."

def extract_text_from_pdf(contents: bytes) -> str:
    with fitz.open(stream=contents, filetype="pdf") as doc:
        return "".join([page.get_text() for page in doc])

def extract_text_from_docx(contents: bytes) -> str:
    result = mammoth.extract_raw_text(BytesIO(contents))
    return result.value.strip() if result.value else ""
