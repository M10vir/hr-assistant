# backend/app/utils/score_resume.py

import random

def compute_relevance_score(resume_text: str, job_description: str) -> float:
    """
    Dummy logic: returns a random relevance score (0–100).
    In production, use real NLP-based similarity models.
    """
    return round(random.uniform(70, 100), 2)

def compute_ats_score(resume_text: str) -> float:
    """
    Dummy ATS scoring function: based on presence of common ATS keywords.
    """
    ats_keywords = ['experience', 'skills', 'education', 'certifications', 'projects']
    score = sum(1 for kw in ats_keywords if kw in resume_text.lower())
    return round(min(score / len(ats_keywords) * 100, 100), 2)

def compute_readability_score(resume_text: str) -> float:
    """
    Dummy readability scoring: based on average sentence length (simulated).
    """
    words = resume_text.split()
    num_words = len(words)
    num_sentences = resume_text.count('.') + 1
    avg_sentence_length = num_words / max(num_sentences, 1)

    # Ideal sentence length range for readability: 12–18 words
    if avg_sentence_length < 10:
        score = 70
    elif avg_sentence_length > 25:
        score = 60
    else:
        score = 90

    return round(score, 2)
