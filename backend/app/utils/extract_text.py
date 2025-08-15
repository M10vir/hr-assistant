# backend/app/utils/extract_text.py

import os
import io
import re
import unicodedata
import logging

logger = logging.getLogger(__name__)

CLEAN_WS_RE = re.compile(r"[ \t]+")
MULTI_NL_RE = re.compile(r"\n{3,}")

def _normalize(text: str) -> str:
    if not text:
        return ""
    # Normalize Unicode, remove CR
    t = unicodedata.normalize("NFKC", text.replace("\r", ""))
    # Non‑breaking space → regular space
    t = t.replace("\u00a0", " ")

    # --- NEW: normalize bullets & dashes to sentence breaks for readability ---
    # Turn common bullets/dashes into ". " so both PDF and DOCX behave the same
    t = t.replace("•", ". ").replace("·", ". ")
    t = re.sub(r"(?:^|\n)\s*[-–—]\s+", ". ", t)

    # --- NEW: join hyphenated linebreak words from PDFs (e.g., "devel-\nopment") ---
    t = re.sub(r"-\n(?=[a-z])", "", t)

    # Collapse spaces and giant newlines
    t = CLEAN_WS_RE.sub(" ", t)
    t = MULTI_NL_RE.sub("\n\n", t)

    return t.strip()

def _read_pdf_bytes(file_bytes: bytes) -> str:
    # Try pdfplumber → PyPDF2 → textract
    try:
        import pdfplumber
        text = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text.append(page.extract_text() or "")
        t = "\n".join(text)
        if t.strip():
            return t
    except Exception as e:
        logger.debug(f"[extract_text] pdfplumber failed: {e}")

    try:
        import PyPDF2
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        out = []
        for p in reader.pages:
            out.append(p.extract_text() or "")
        t = "\n".join(out)
        if t.strip():
            return t
    except Exception as e:
        logger.debug(f"[extract_text] PyPDF2 failed: {e}")

    try:
        import textract
        return textract.process(io.BytesIO(file_bytes)).decode("utf-8", errors="ignore")
    except Exception as e:
        logger.debug(f"[extract_text] textract(pdf) failed: {e}")
    return ""

def _read_docx_bytes(file_bytes: bytes) -> str:
    # Try python-docx → mammoth → docx2txt → textract
    try:
        from docx import Document
        doc = Document(io.BytesIO(file_bytes))
        t = "\n".join(p.text for p in doc.paragraphs)
        if t.strip():
            return t
    except Exception as e:
        logger.debug(f"[extract_text] python-docx failed: {e}")

    try:
        import mammoth
        result = mammoth.extract_raw_text(io.BytesIO(file_bytes))
        t = result.value or ""
        if t.strip():
            return t
    except Exception as e:
        logger.debug(f"[extract_text] mammoth failed: {e}")

    try:
        import tempfile, docx2txt
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
        try:
            t = docx2txt.process(tmp_path) or ""
            if t.strip():
                return t
        finally:
            try:
                os.remove(tmp_path)
            except Exception:
                pass
    except Exception as e:
        logger.debug(f"[extract_text] docx2txt failed: {e}")

    try:
        import tempfile, textract
        with tempfile.NamedTemporaryFile(suffix=".docx", delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
        try:
            return textract.process(tmp_path).decode("utf-8", errors="ignore")
        finally:
            try:
                os.remove(tmp_path)
            except Exception:
                pass
    except Exception as e:
        logger.debug(f"[extract_text] textract(docx) failed: {e}")

    return ""

def _read_doc_bytes(file_bytes: bytes) -> str:
    # .doc (legacy) → textract best-effort
    try:
        import tempfile, textract
        with tempfile.NamedTemporaryFile(suffix=".doc", delete=False) as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
        try:
            return textract.process(tmp_path).decode("utf-8", errors="ignore")
        finally:
            try:
                os.remove(tmp_path)
            except Exception:
                pass
    except Exception as e:
        logger.debug(f"[extract_text] textract(doc) failed: {e}")
    return ""

def extract_text_from_file(filename: str, file_bytes: bytes) -> str:
    """
    Robust extractor for PDF/DOCX/DOC using multiple fallbacks.
    Keeps original signature used across the project.
    """
    ext = os.path.splitext(filename)[1].lower()
    logger.info(f"[extract_text] Processing: {filename} (ext: {ext})")

    try:
        if ext == ".pdf":
            raw = _read_pdf_bytes(file_bytes)
        elif ext == ".docx":
            raw = _read_docx_bytes(file_bytes)
        elif ext == ".doc":
            raw = _read_doc_bytes(file_bytes)
        else:
            # Unknown → try all best-effort
            raw = (
                _read_pdf_bytes(file_bytes)
                or _read_docx_bytes(file_bytes)
                or _read_doc_bytes(file_bytes)
            )
    except Exception as e:
        logger.error(f"[extract_text] Failed to extract from {filename}: {e}")
        raw = ""

    return _normalize(raw)

def extract_text_from_path(path: str) -> str:
    """
    Convenience method when you have a path on disk.
    """
    try:
        with open(path, "rb") as f:
            data = f.read()
        return extract_text_from_file(os.path.basename(path), data)
    except Exception as e:
        logger.error(f"[extract_text] Failed to read path {path}: {e}")
        return "" 
