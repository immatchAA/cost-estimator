from fastapi import APIRouter, HTTPException
from services.estimate_service import run_ai_estimation
from services.gemini_service import GeminiPriceSearch
import uuid
from pydantic import BaseModel


router = APIRouter()

class EstimationRequest(BaseModel):
    plan_file_url: str


@router.post("/challenges/{challenge_id}/estimate")
def run_estimation(challenge_id: str, request: EstimationRequest):
    try:
        result = run_ai_estimation(
            challenge_id=challenge_id, 
            plan_file_url=request.plan_file_url
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 