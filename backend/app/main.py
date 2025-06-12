from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importing route modules
from app.api.routes_resume import router as resume_router
from app.api.routes_screening import router as screening_router
# Add other routers like recommendation_router if needed

app = FastAPI(
    title="HR Recruitment Assistant",
    description="An AI-powered platform to automate resume screening, scoring, and interview analysis.",
    version="1.0.0"
)

# Optional: Allow frontend to access API (e.g., Vite/React on localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers with clear prefixes
app.include_router(resume_router, prefix="/resumes", tags=["Resume Management"])
app.include_router(screening_router, prefix="/screening", tags=["Interview Analysis"])
# app.include_router(recommendation_router, prefix="/recommend", tags=["Recommendations"])

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "✅ HR Recruitment Assistant API is running."}
