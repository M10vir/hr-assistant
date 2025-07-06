
import re
import logging
from email_validator import validate_email, EmailNotValidError
from typing import Tuple, Optional

try:
    import openai
    import os
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    openai.api_key = OPENAI_API_KEY if OPENAI_API_KEY else None
except ImportError:
    openai = None

logger = logging.getLogger(__name__)


def extract_candidate_details(resume_text: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    name, email, phone = None, None, None

    # Try using GPT function calling (if enabled)
    if openai and openai.api_key:
        try:
            response = openai.ChatCompletion.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an assistant that extracts candidate details from resume text."},
                    {"role": "user", "content": f"Extract full name, email and phone number from the following resume: {resume_text}"}
                ],
                functions=[
                    {
                        "name": "extract_details",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "name": {"type": "string"},
                                "email": {"type": "string"},
                                "phone": {"type": "string"}
                            },
                            "required": ["name", "email", "phone"]
                        }
                    }
                ],
                function_call="auto"
            )
            args = response["choices"][0]["message"]["function_call"]["arguments"]
            import json
            parsed = json.loads(args)
            name = parsed.get("name")
            email = parsed.get("email")
            phone = parsed.get("phone")
            logger.info(f"[GPT-4] Extracted: name={name}, email={email}, phone={phone}")
            return name, email, phone
        except Exception as gpt_error:
            logger.warning(f"[GPT-4 fallback] Extraction failed: {gpt_error}")

    # Regex-based fallback extraction
    try:
        email_matches = re.findall(r"[\w\.-]+@[\w\.-]+", resume_text)
        for e in email_matches:
            try:
                valid = validate_email(e)
                email = valid.email
                break
            except EmailNotValidError:
                continue

        phone_matches = re.search(r"\+?\d[\d\s\-]{7,}\d", resume_text)
        phone = phone_matches[0] if phone_matches else None

        name_lines = resume_text.strip().splitlines()
        for line in name_lines[:10]:  # Only check top 10 lines of resume
            line = line.strip()
            if line and len(line.split()) >= 2 and not any(keyword in line.lower() for keyword in ["email", "phone", "@", "curriculum", "resume"]):
                name = line.strip()
                break

        logger.info(f"[Regex fallback] Extracted: name={name}, email={email}, phone={phone}")
        return name, email, phone

    except Exception as regex_error:
        logger.error(f"[Regex fallback] Extraction error: {regex_error}")
        return None, None, None

