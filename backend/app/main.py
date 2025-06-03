from fastapi import FastAPI
from app.api import routes_resume

app = FastAPI(title="HR Recruitment Assistant")

app.include_router(routes_resume.router, prefix="/resume", tags=["Resume"])

@app.get("/")
def read_root():
    return {"message": "HR Recruitment Assistant API is running."}
