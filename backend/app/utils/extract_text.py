import textract
import tempfile
import os

def extract_text_from_file(filename: str, contents: bytes) -> str:
    """
    Extracts text from in-memory uploaded resume file using textract.
    Writes to a temporary file before processing.
    """
    try:
        suffix = os.path.splitext(filename)[-1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            tmp_file.write(contents)
            tmp_path = tmp_file.name

        text = textract.process(tmp_path).decode("utf-8")
        os.unlink(tmp_path)  # cleanup
        return text

    except Exception as e:
        return f"Error extracting text: {e}"
