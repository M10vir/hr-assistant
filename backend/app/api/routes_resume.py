from fastapi import APIRouter

router = APIRouter()

@router.get("/ping")
def test_resume_route():
    return {"message": "Resume route is working."}
