from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.supabase_service import SupabaseClient
import os
import shutil
from uuid import uuid4

router = APIRouter()
supabase_service = SupabaseClient()

@router.post("/challenges")
async def create_challenge(
    challenge_name: str = Form(...),
    challenge_objectives: str = Form(...),
    challenge_instructions: str = Form(...),
    file: UploadFile = File(...)
):
    
    try:
        ext = os.path.splitext(file.filename)[-1]             
        unique_filename = f"{uuid4()}{ext}"                  
        file_path = f"plans/{unique_filename}"
        file_bytes = await file.read()

        public_url = supabase_service.upload_file_to_bucket(
            file_path=file_path,
            file_bytes=file_bytes,
            content_type=file.content_type or "application/octet-stream",
        )

        payload = {
            "challenge_name": challenge_name,
            "challenge_objectives": challenge_objectives,
            "challenge_instructions": challenge_instructions,
            "file_url": public_url
        }

        response = supabase_service.client.table("student_challenges")\
            .insert(payload, returning="representation")\
            .execute()

        challenge_id = None
        if response.data and isinstance(response.data, list) and response.data:
            challenge_id = response.data[0].get("challenge_id")

        if not challenge_id:
            raise HTTPException(status_code=500, detail="Could not retrieve challenge_id after insert")

        return {
            "status": "success",
            "challenge_id": challenge_id,
            "plan_file_url": public_url,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

