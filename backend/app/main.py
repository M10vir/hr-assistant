# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Routers
from app.api.routes_resume import router as resume_router
from app.api.routes_screening import router as screening_router
from app.api.routes_recommendation import router as recommendation_router  # has prefix="/recommend" inside
from app.api.routes_assessment import router as assessment_router
from app.api.routes_jd import router as jd_router
# NOTE: Only add matching if that module exists & imports cleanly.
# from app.api.routes_matching import router as matching_router

app = FastAPI(
    title="HR Recruitment Assistant",
    description="AI-powered platform for resume screening, scoring, recommendations, and interview analysis.",
    version="1.3.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS (tighten in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(resume_router, prefix="/resumes", tags=["Resume Management"])
app.include_router(screening_router, prefix="/screening", tags=["Interview Analysis"])
app.include_router(recommendation_router)  # already prefixed with /recommend in the router itself
app.include_router(assessment_router, prefix="/interview", tags=["Assessment Interview"])
app.include_router(jd_router, prefix="/jd", tags=["Job Description Ingestion"])
# app.include_router(matching_router, prefix="/match", tags=["Resume-JD Matching"])  # enable only if module is valid

@app.get("/")
def root():
    return {"message": "✅ HR Recruitment Assistant API is running."}

@app.get("/health")
def health():
    return {"status": "ok"} 
