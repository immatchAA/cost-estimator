from fastapi import APIRouter, HTTPException
from uuid import UUID
import os
from supabase import create_client
from services.gemini_service import GeminiPriceSearch

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

@router.get("/ai/student/{student_id}/completed")
def get_student_completed(student_id: str):
    res = (
        supabase.table("student_cost_estimates")
        .select("challenge_id")
        .eq("student_id", student_id)
        .eq("status", "submitted")
        .execute()
    )

    completed = len(res.data or [])
    return {"success": True, "completed": completed}

@router.get("/ai/student/{student_id}/average-accuracy")
def get_student_average_accuracy(student_id: str):
    res = (
        supabase.table("student_ai_accuracy")
        .select("accuracy")
        .eq("student_id", student_id)
        .execute()
    )

    rows = res.data or []
    if not rows:
        return {"success": True, "average_accuracy": 0}

    avg = sum(r["accuracy"] for r in rows) / len(rows)
    return {"success": True, "average_accuracy": round(avg, 2)}


@router.get("/ai/average-accuracy")
def get_average_accuracy():
    try:
        res = (
            supabase.table("student_ai_accuracy")
            .select("accuracy")
            .execute()
        )

        rows = res.data or []

        if not rows:
            return {"success": True, "average_accuracy": 0}

        # Convert to floats
        accuracies = [
            float(r["accuracy"]) for r in rows
            if r.get("accuracy") is not None
        ]

        if not accuracies:
            return {"success": True, "average_accuracy": 0}

        avg = sum(accuracies) / len(accuracies)

        return {
            "success": True,
            "average_accuracy": round(avg, 2)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ai/student/{student_id}/completed-list")
def get_student_completed_list(student_id: str):
    """
    Returns full list of completed challenges for a student,
    including accuracy, challenge details, submission date, etc.
    """

    try:
        submitted_res = (
            supabase.table("student_cost_estimates")
            .select("challenge_id, submitted_at, total_amount, status")
            .eq("student_id", student_id)
            .eq("status", "submitted")
            .order("submitted_at", desc=True)
            .execute()
        )

        submitted = submitted_res.data or []
        if not submitted:
            return {"success": True, "completed": []}

        challenge_ids = [s["challenge_id"] for s in submitted]


        challenge_res = (
            supabase.table("student_challenges")
            .select("challenge_id, challenge_name, challenge_instructions, teacher_id, created_at")
            .in_("challenge_id", challenge_ids)
            .execute()
        )
        challenge_map = {c["challenge_id"]: c for c in (challenge_res.data or [])}


        accuracy_res = (
            supabase.table("student_ai_accuracy")
            .select("challenge_id, accuracy")
            .eq("student_id", student_id)
            .in_("challenge_id", challenge_ids)
            .execute()
        )

        accuracy_map = {
            a["challenge_id"]: a["accuracy"]
            for a in (accuracy_res.data or [])
        }

 
        completed_list = []
        for item in submitted:
            cid = item["challenge_id"]
            challenge = challenge_map.get(cid, {})

            completed_list.append({
                "challenge_id": cid,
                "challenge_name": challenge.get("challenge_name", "Untitled Challenge"),
                "instructions": challenge.get("challenge_instructions", ""),
                "submitted_at": item["submitted_at"],
                "accuracy": accuracy_map.get(cid, 0),              
            })

        return {
            "success": True,
            "completed": completed_list
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ai/{challenge_id}")
def get_ai_estimates(challenge_id: UUID):
    try:
        challenge_id = str(challenge_id)

        print("🔍 Fetching AI cost estimates for", challenge_id)

        estimates_res = (
            supabase.table("ai_cost_estimates")
            .select("*")
            .eq("challenge_id", challenge_id)
            .execute()
        )

        print("🟦 Supabase estimates response:", estimates_res)

        estimates = estimates_res.data if estimates_res.data else []

        summary_res = (
            supabase.table("cost_estimates_summary")
            .select("*")
            .eq("challenge_id", challenge_id)
            .limit(1)
            .execute()
        )

        print("🟩 Supabase summary response:", summary_res)

        summary = summary_res.data[0] if summary_res.data else {}

        return {
            "success": True,
            "challenge_id": challenge_id,
            "estimates": estimates,
            "summary": summary,
        }

    except Exception as e:
        print("🔥 BACKEND ERROR:", e)
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
    
@router.post("/ai/calculate-accuracy")
def calculate_accuracy(payload: dict):
    try:
        gemini = GeminiPriceSearch()

        # Extract fields
        student_items = payload.get("student_items", [])
        ai_items = payload.get("ai_items", [])
        student_id = payload.get("student_id")
        challenge_id = payload.get("challenge_id")

        # Validate
        if not student_id or not challenge_id:
            raise HTTPException(status_code=400, detail="Missing student_id or challenge_id")

        if not student_items or not ai_items:
            raise HTTPException(status_code=400, detail="Missing student_items or ai_items")

        # Generate accuracy using Gemini
        accuracy_result = gemini.calculate_accuracy(student_items, ai_items)

        # Fallback safety
        final_accuracy = float(accuracy_result.get("final_accuracy", 0))

        # CHECK IF RECORD ALREADY EXISTS
        existing = (
            supabase.table("student_ai_accuracy")
            .select("*")
            .eq("student_id", student_id)
            .eq("challenge_id", challenge_id)
            .execute()
        )

        if existing.data:
            # UPDATE existing accuracy instead of inserting duplicates
            supabase.table("student_ai_accuracy").update({
                "accuracy": final_accuracy,
                "details": accuracy_result
            }).eq("student_id", student_id).eq("challenge_id", challenge_id).execute()
        else:
            # INSERT new record
            supabase.table("student_ai_accuracy").insert({
                "student_id": student_id,
                "challenge_id": challenge_id,
                "accuracy": final_accuracy,
                "details": accuracy_result
            }).execute()

        # Return clean response
        return {
            "success": True,
            "accuracy": accuracy_result
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    


    




    
