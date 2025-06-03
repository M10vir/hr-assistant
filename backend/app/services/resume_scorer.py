import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import textstat

nlp = spacy.load("en_core_web_sm")

def compute_relevance_score(resume_text: str, job_description: str) -> float:
    documents = [job_description, resume_text]
    tfidf = TfidfVectorizer().fit_transform(documents)
    score = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
    return round(score * 100, 2)

def compute_ats_score(resume_text: str, job_description: str) -> float:
    job_keywords = set(job_description.lower().split())
    resume_keywords = set(resume_text.lower().split())
    matched = job_keywords.intersection(resume_keywords)
    return round((len(matched) / len(job_keywords)) * 100, 2)

def compute_readability_score(resume_text: str) -> float:
    return round(100 - textstat.difficult_words(resume_text), 2)

def score_resume(resume_text: str, job_description: str) -> dict:
    return {
        "relevance_score": compute_relevance_score(resume_text, job_description),
        "ats_score": compute_ats_score(resume_text, job_description),
        "readability_score": compute_readability_score(resume_text),
    }
