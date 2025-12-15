from fastapi import APIRouter, HTTPException
from services.estimate_service import run_ai_estimation, save_teacher_estimates
import uuid
from pydantic import BaseModel

router = APIRouter(prefix="/cost-estimates", tags=["Cost Estimates"]) 

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


@router.post("/save")
def save_estimates(payload: dict):
    challenge_id = payload.get("challenge_id")
    analysis_id = payload.get("analysis_id")
    items = payload.get("items", [])
    summary = payload.get("summary", {})

    if not challenge_id:
        raise HTTPException(status_code=400, detail="challenge_id required")

    try:
        print("ITEMS:", items)
        print("SUMMARY:", summary)

        save_teacher_estimates(challenge_id, analysis_id, items, summary)
        return {"status": "success"}

    except Exception as e:
        import traceback
        traceback.print_exc()  
        raise HTTPException(status_code=400, detail=str(e))
