# backend/app/services/resume_matcher.py

import os
import openai
from dotenv import load_dotenv

load_dotenv()  # Load OPENAI_API_KEY from .env

openai.api_key = os.getenv("OPENAI_API_KEY")

def get_jd_resume_match_score(resume_text: str, jd_text: str) -> dict:
    """
    Use GPT-4 to compare a resume and job description,
    returning a match score (0–100) and qualitative feedback.
    """
    prompt = f"""
You are an AI HR assistant. Compare the following resume against the job description and return:
1. A match score from 0 to 100.
2. A short explanation of the match (2–3 lines).

[Job Description]
{jd_text}

[Resume Text]
{resume_text}

Return your answer in the following JSON format:

{{
  "match_score": number,
  "feedback": "string"
}}
"""

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an AI assistant for HR candidate evaluation."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=300
        )

        content = response.choices[0].message['content']

        # Extract JSON-like response from GPT output
        import json
        result = json.loads(content)

        return {
            "match_score": result.get("match_score", 0),
            "feedback": result.get("feedback", "No feedback returned.")
        }

    except Exception as e:
        return {
            "match_score": 0,
            "feedback": f"⚠️ GPT matching failed: {str(e)}"
        }
