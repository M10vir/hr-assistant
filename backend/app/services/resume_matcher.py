# backend/app/services/resume_matcher.py

import os
import json
from typing import Any, Dict
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

# Uses OPENAI_API_KEY from env (dotenv already loaded elsewhere in your app)
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def _coerce_score(value: Any) -> int:
    """Coerce any numeric-like value into an int between 0 and 100."""
    try:
        n = float(value)
    except Exception:
        return 0
    n = max(0, min(100, n))
    return int(round(n))


def _safe_json_parse(text: str) -> Dict[str, Any]:
    """
    Parse JSON from the model; if it sent extra prose or code fences,
    try to extract the first {...} block.
    """
    try:
        return json.loads(text)
    except Exception:
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start : end + 1])
            except Exception:
                pass
    return {}


def get_jd_resume_match_score(resume_text: str, jd_text: str) -> dict:
    """
    Compare JD and resume text with GPT, return:
      - match_score: int 0..100
      - feedback: short explanation
    """
    system = "You are an expert HR recruiter. Return concise, accurate scoring."
    user = f"""
Compare the following job description and resume.
Return a JSON object with:
- "match_score": integer 0-100
- "feedback": string (2-3 sentences max)

[Job Description]
{jd_text}

[Resume]
{resume_text}
"""

    try:
        resp = client.chat.completions.create(
            model="gpt-4o",  # pick a model you have access to (e.g., gpt-4o, gpt-4.1-mini)
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            temperature=0.2,
            max_tokens=300,
            # If your account supports strict JSON responses, you can enforce it:
            # response_format={"type": "json_object"},
        )
        content = resp.choices[0].message.content or ""
        data = _safe_json_parse(content)

        score = _coerce_score(data.get("match_score", 0))
        feedback = data.get("feedback") or "No feedback returned."

        return {"match_score": score, "feedback": feedback}

    except Exception as e:
        # Fail soft — keep pipeline running while surfacing the error.
        return {"match_score": 0, "feedback": f"⚠️ GPT matching failed: {str(e)}"} 
