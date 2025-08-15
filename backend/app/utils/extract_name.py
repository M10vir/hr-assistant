# backend/app/utils/extract_name.py

import os
import re
import json
import logging
from typing import Tuple, Optional

from email_validator import validate_email, EmailNotValidError

logger = logging.getLogger(__name__)

# Optional OpenAI v1 (used only if key is present)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
USE_OPENAI = bool(OPENAI_API_KEY)
if USE_OPENAI:
    try:
        from openai import OpenAI
        _client = OpenAI(api_key=OPENAI_API_KEY)
    except Exception as e:
        logger.warning(f"[extract_name] OpenAI import/init failed, fallback to regex only: {e}")
        USE_OPENAI = False


EMAIL_RE = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_RE = re.compile(r"(\+?\d[\d\-\s()]{7,}\d)")
HEADER_NOISE = {"email", "phone", "@", "curriculum", "resume", "cv"}

def _regex_extract(resume_text: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    name = None
    email = None
    phone = None

    # email
    for m in EMAIL_RE.findall(resume_text or ""):
        try:
            email = validate_email(m).email
            break
        except EmailNotValidError:
            continue

    # phone
    pm = PHONE_RE.search(resume_text or "")
    phone = pm.group(1).strip() if pm else None

    # name: look at top lines, first reasonable-looking line without noisy tokens
    lines = (resume_text or "").strip().splitlines()
    for line in lines[:12]:
        l = line.strip()
        parts = l.split()
        if len(parts) >= 2:
            low = l.lower()
            if not any(noise in low for noise in HEADER_NOISE) and not EMAIL_RE.search(low):
                name = l
                break

    logger.info(f"[regex] name={name} email={email} phone={phone}")
    return name, email, phone


def _openai_extract(resume_text: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Use OpenAI (v1) to extract name, email, phone. Strict JSON response with fallback.
    """
    if not USE_OPENAI:
        return None, None, None

    system = "You extract candidate name, email, and phone from resume text. Return concise JSON only."
    user = f"""
Extract:
- name (string, full name)
- email (string)
- phone (string)

Resume:
{resume_text}
"""
    try:
        resp = _client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0,
            max_tokens=120,
            # response_format={"type": "json_object"},  # enable if your account supports it
        )
        content = resp.choices[0].message.content or ""
        try:
            data = json.loads(content)
        except Exception:
            # try salvage {...}
            start = content.find("{")
            end = content.rfind("}")
            data = json.loads(content[start:end+1]) if start != -1 and end != -1 else {}

        name = (data.get("name") or "").strip() or None
        email = (data.get("email") or "").strip() or None
        phone = (data.get("phone") or "").strip() or None
        logger.info(f"[openai] name={name} email={email} phone={phone}")
        return name, email, phone
    except Exception as e:
        logger.warning(f"[openai] extraction failed: {e}")
        return None, None, None


def extract_candidate_details(resume_text: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    """
    Try OpenAI (if configured); fallback to robust regex.
    """
    if USE_OPENAI:
        n, e, p = _openai_extract(resume_text)
        # If OpenAI returns nothing, still do regex as a safety net
        if any([n, e, p]):
            return n, e, p

    return _regex_extract(resume_text) 
