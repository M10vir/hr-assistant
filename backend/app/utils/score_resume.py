# backend/app/utils/score_resume.py

import re
import math
import unicodedata
from typing import Dict, Iterable, List
from collections import Counter

# ----------------------------
# Canonicalization (format-agnostic)
# ----------------------------
_WS = re.compile(r"[ \t]+")
_MULTI_NL = re.compile(r"\n{3,}")
_HARD_BREAK_HYPHEN = re.compile(r"([A-Za-z])-\s*\n\s*([A-Za-z])")   # line-break hyphens
_SOFT_HYPHEN = "\u00AD"

def canonicalize_text(text: str) -> str:
    """Normalize resume/JD text so PDF vs DOCX produce near-identical strings."""
    if not text:
        return ""
    t = unicodedata.normalize("NFKC", text or "")
    t = t.replace("\r", "")
    t = t.replace("\u00a0", " ").replace(_SOFT_HYPHEN, "")
    # join hyphenated words across line breaks: Dev-
    # Ops -> DevOps
    t = _HARD_BREAK_HYPHEN.sub(r"\1\2", t)
    # convert bullets/dashes to sentence breaks
    t = t.replace("•", ". ").replace("·", ". ")
    t = re.sub(r"(?:^|\n)\s*[-–—]\s+", ". ", t)
    # drop common PDF JS junk if present
    t = re.sub(r"^javascript:void.*$", "", t, flags=re.IGNORECASE | re.MULTILINE)
    # collapse whitespace & huge newlines
    t = _WS.sub(" ", t)
    t = _MULTI_NL.sub("\n\n", t)
    return t.strip()

# ----------------------------
# Tokenization
# ----------------------------
WORD_RE = re.compile(r"[A-Za-z][A-Za-z0-9+\-\.#]*")
STOP = set("""
a an the and or for of to with in on by is are be as at from this that it we our your you their them they
i me my mine he she him her his hers its us
""".split())

def _tokens(text: str) -> List[str]:
    if not text:
        return []
    return [w.lower() for w in WORD_RE.findall(text)]

# ----------------------------
# Readability (Flesch Reading Ease -> 0..100)
# ----------------------------
def _count_syllables(word: str) -> int:
    w = word.lower()
    vowels = "aeiouy"
    count, prev_vowel = 0, False
    for ch in w:
        v = ch in vowels
        if v and not prev_vowel:
            count += 1
        prev_vowel = v
    if w.endswith("e"):
        count = max(1, count - 1)
    return max(count, 1)

def compute_readability_score(resume_text: str) -> float:
    """
    Robust FRE:
    - works for bullet-heavy PDFs (line fallback)
    - never returns 0; uses a neutral floor when punctuation is poor
    """
    if not resume_text:
        return 60.0

    txt = canonicalize_text(resume_text)

    # primary: punctuation-based sentences
    sents = [s.strip() for s in re.split(r"[.!?]+", txt) if s.strip()]

    # fallback: bullet/line-based sentences
    if len(sents) < 3:
        lines = [ln.strip() for ln in re.split(r"\n+", txt)]
        sents = [ln for ln in lines if len(ln) >= 25]

    words = WORD_RE.findall(txt)
    if len(sents) < 2 or not words:
        return 60.0  # neutral readability when structure is too sparse

    syllables = sum(_count_syllables(w) for w in words)
    W, S = len(words), len(sents)
    fre = 206.835 - 1.015 * (W / max(S, 1)) - 84.6 * (syllables / max(W, 1))
    # clamp 0..100, but avoid 0 by flooring neutral
    fre = max(0.0, min(100.0, fre))
    if fre == 0.0:
        fre = 60.0
    return float(round(fre))

# ----------------------------
# ATS: % of JD skills present
# ----------------------------
CURATED_DEVOPS: set[str] = {
    "azure","aks","kubernetes","docker","terraform","ansible","helm",
    "gitlab","github","ado","linux","windows","powershell","bash",
    "prometheus","grafana","pipelines","pipeline","ci/cd","cicd",
    "automation","iac","monitoring","cloud","helmcharts","helm-chart",
}

def _normalize_set(tokens: Iterable[str]) -> set[str]:
    base = {t.lower() for t in tokens}
    return base | {t.replace("/", "").replace("-", "") for t in base}

def _skills_from_jd(job_description: str, max_terms: int = 35) -> set[str]:
    toks = [t for t in _tokens(job_description) if t not in STOP and len(t) > 2]
    common = [w for w, _ in Counter(toks).most_common(max_terms)]
    noisy = {"experience","best","practices","tools","including","hands","knowledge",
             "services","team","teams","member","members","management","strong",
             "working","implement","implementing","environment","environments",
             "support","monitor","analysis","configure","deploy","enhance","manage"}
    return {w for w in common if w not in noisy}

def compute_ats_score(resume_text: str, job_description: str = "") -> float:
    resume_norm = _normalize_set(_tokens(canonicalize_text(resume_text)))
    jd_skills = _skills_from_jd(canonicalize_text(job_description)) if job_description else set()
    skills = (jd_skills | CURATED_DEVOPS)
    if not skills:
        return 0.0

    present = 0
    for term in skills:
        variants = {term, term.replace("/", "").replace("-", "")}
        if resume_norm & variants:
            present += 1
    pct = 100.0 * present / len(skills)
    return float(round(pct))

# ----------------------------
# Relevance (deterministic fallback / hybrid component)
# ----------------------------
def _tfidf_vector(doc: List[str], df: Counter, N: int) -> Dict[str, float]:
    tf = Counter(doc)
    vec = {}
    L = max(1, len(doc))
    for w, f in tf.items():
        idf = math.log((N + 1) / (df[w] + 0.5)) + 1
        vec[w] = (f / L) * idf
    return vec

def _cosine(v1: Dict[str, float], v2: Dict[str, float]) -> float:
    dot = sum(v * v2.get(k, 0.0) for k, v in v1.items())
    n1 = math.sqrt(sum(v*v for v in v1.values()))
    n2 = math.sqrt(sum(v*v for v in v2.values()))
    if n1 == 0.0 or n2 == 0.0:
        return 0.0
    return dot / (n1 * n2)

def compute_relevance_score(resume_text: str, job_description: str = "") -> float:
    rs = canonicalize_text(resume_text)
    jd = canonicalize_text(job_description)
    if not rs or not jd:
        return 0.0

    jd_tokens = _tokens(jd)
    rs_tokens = _tokens(rs)
    docs = [jd_tokens, rs_tokens]

    df = Counter()
    for d in docs:
        for w in set(d):
            df[w] += 1
    N = len(docs)

    v_jd = _tfidf_vector(jd_tokens, df, N)
    v_rs = _tfidf_vector(rs_tokens, df, N)
    cos_sim = _cosine(v_jd, v_rs)

    skills = _skills_from_jd(jd) | CURATED_DEVOPS
    rs_norm = _normalize_set(rs_tokens)
    overlap = sum(1 for kw in skills if rs_norm & {kw, kw.replace("/", "").replace("-", "")})
    overlap_ratio = overlap / max(1, len(skills))

    score = (0.6 * cos_sim + 0.4 * overlap_ratio) * 100.0
    return float(round(max(0.0, min(100.0, score))))

# ----------------------------
# Combined API
# ----------------------------
def calculate_scores(resume_text: str, job_description: str = "") -> Dict[str, float]:
    rs = canonicalize_text(resume_text)
    jd = canonicalize_text(job_description)
    return {
        "relevance_score": compute_relevance_score(rs, jd),
        "ats_score": compute_ats_score(rs, jd),
        "readability_score": compute_readability_score(rs),
    }

__all__ = [
    "canonicalize_text",
    "compute_relevance_score",
    "compute_ats_score",
    "compute_readability_score",
    "calculate_scores",
] 
