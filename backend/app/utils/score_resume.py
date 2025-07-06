# backend/app/utils/score_resume.py

import re
from typing import Dict


def compute_relevance_score(resume_text: str, job_description: str = "") -> float:
    """
    Compute a basic relevance score between resume and job description (mock logic).
    """
    if not resume_text:
        return 0.0

    score = 0
    keywords = ['python', 'aws', 'azure', 'docker', 'kubernetes', 'terraform', 'ci/cd']
    for keyword in keywords:
        if keyword.lower() in resume_text.lower():
            score += 10

    return min(score, 100.0)


def compute_ats_score(resume_text: str) -> float:
    """
    Compute a mock ATS compatibility score based on formatting indicators.
    """
    if not resume_text:
        return 0.0

    score = 100.0
    if len(resume_text) < 100:
        score -= 50
    if not re.search(r'\b(Experience|Skills|Education)\b', resume_text, re.IGNORECASE):
        score -= 20
    if resume_text.count("\n") < 5:
        score -= 15

    return max(score, 0.0)


def compute_readability_score(resume_text: str) -> float:
    """
    Compute a mock readability score.
    """
    if not resume_text:
        return 0.0

    words = resume_text.split()
    num_words = len(words)
    num_sentences = resume_text.count('.') + resume_text.count('\n')
    avg_sentence_length = num_words / max(num_sentences, 1)

    if avg_sentence_length < 12:
        return 90.0
    elif avg_sentence_length < 20:
        return 75.0
    else:
        return 60.0


def calculate_scores(resume_text: str, job_description: str = "") -> Dict[str, float]:
    """
    Calculate and return all scores in a dictionary format.
    """
    return {
        "relevance_score": compute_relevance_score(resume_text, job_description),
        "ats_score": compute_ats_score(resume_text),
        "readability_score": compute_readability_score(resume_text),
    }


# Ensure all are exposed to be imported
__all__ = [
    "compute_relevance_score",
    "compute_ats_score",
    "compute_readability_score",
    "calculate_scores"
]
