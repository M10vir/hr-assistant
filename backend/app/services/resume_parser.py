import fitz  # PyMuPDF
from docx import Document
from fastapi import UploadFile

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
        text = ""
        for page in doc:
            text += page.get_text()
        return text

def extract_text_from_docx(contents: bytes) -> str:
    with open("/tmp/temp_resume.docx", "wb") as f:
        f.write(contents)
    doc = Document("/tmp/temp_resume.docx")
    return "\n".join([para.text for para in doc.paragraphs])
