# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Route modules
from app.api.routes_resume import router as resume_router
from app.api.routes_screening import router as screening_router
from app.api.routes_recommendation import router as recommendation_router

app = FastAPI(
    title="HR Recruitment Assistant",
    description="An AI-powered platform to automate resume screening, scoring, and interview analysis.",
    version="1.0.0"
)

# Enable CORS for frontend access (e.g., from localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Mount routers — no duplicate prefixes
app.include_router(resume_router, prefix="/resumes", tags=["Resume Management"])
app.include_router(screening_router, prefix="/screening", tags=["Interview Analysis"])
app.include_router(recommendation_router)  # Already includes /recommend prefix in its definition

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "✅ HR Recruitment Assistant API is running."}
