# backend/app/utils/extract_text.py

import os
import logging
import io
import textract
from docx import Document
from PyPDF2 import PdfReader

logger = logging.getLogger(__name__)

def extract_text_from_file(filename: str, file_bytes: bytes) -> str:
    """
    Extract text content from a PDF or DOCX file from raw bytes.
    Returns extracted text as a string.
    """
    ext = os.path.splitext(filename)[1].lower()
    logger.info(f"[extract_text] Processing file: {filename} | Extension: {ext}")

    try:
        if ext == ".pdf":
            with io.BytesIO(file_bytes) as pdf_io:
                reader = PdfReader(pdf_io)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() or ""
                return text.strip()

        elif ext == ".docx":
            with io.BytesIO(file_bytes) as docx_io:
                doc = Document(docx_io)
                text = "\n".join(p.text for p in doc.paragraphs)
                return text.strip()

        else:
            logger.warning(f"[extract_text] Unsupported file extension: {ext}")
            return ""

    except Exception as e:
        logger.error(f"[extract_text] Failed to extract from {filename}: {e}")
        return ""
