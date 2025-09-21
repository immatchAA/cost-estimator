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
    result = run_ai_estimation(
        challenge_id=challenge_id,
        plan_file_url=request.plan_file_url
    )
    return {"status": "success", "data": result}
    
@router.post("/estimate")
def estimate(payload: dict):
    challenge_id = payload.get("challenge_id")
    plan_file_url = payload.get("plan_file_url")

    if not challenge_id or not plan_file_url:
        return {"error": "challenge_id and plan_file_url are required"}

    result = run_ai_estimation(challenge_id, plan_file_url)
    return result 