from fastapi import APIRouter, HTTPException
from uuid import UUID

from models.cost_estimation_model import CostEstimateCreate, CostEstimateOut
from services.supabase_service import SupabaseClient
from services.cost_estimation_service import CostEstimationService

router = APIRouter(prefix="/cost-estimates", tags=["Cost Estimates"])
svc = CostEstimationService(SupabaseClient())

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

