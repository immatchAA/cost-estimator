from fastapi import APIRouter, HTTPException
from uuid import UUID
import os
from supabase import create_client

from models.cost_estimation_model import CostEstimateCreate, CostEstimateOut
from services.supabase_service import SupabaseClient
from services.cost_estimation_service import CostEstimationService

router = APIRouter(prefix="/cost-estimates", tags=["Cost Estimates"])
svc = CostEstimationService(SupabaseClient())

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@router.post("", response_model=CostEstimateOut)
def save_cost_estimate(body: CostEstimateCreate):
    try:
        return svc.save_estimation(body)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/student/{student_id}/challenge/{challenge_id}")
def get_cost_estimate(student_id: UUID, challenge_id: UUID):
    data = svc.get_estimation(student_id, challenge_id)
    if not data:
        raise HTTPException(status_code=404, detail="No estimate found")
    return data

@router.get("/ai/{challenge_id}")
def get_ai_estimates(challenge_id: str):
    try:
  
        estimates = supabase.table("ai_cost_estimates") \
            .select("*") \
            .eq("challenge_id", challenge_id) \
            .execute()

  
        summary = supabase.table("cost_estimates_summary") \
            .select("*") \
            .eq("challenge_id", challenge_id) \
            .single() \
            .execute()

        return {
            "success": True,
            "challenge_id": challenge_id,
            "estimates": estimates.data,
            "summary": summary.data if summary.data else {}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
    


