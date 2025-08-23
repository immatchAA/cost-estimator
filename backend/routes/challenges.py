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
        unique_filename = f"{uuid4()}.{ext}"
        file_path = f"plans/{unique_filename}"
        file_bytes = await file.read()

        public_url = supabase_service.upload_file_to_bucket(file_path, file_bytes, file.content_type)

        challenge_data = {
            "challenge_name": challenge_name,
            "challenge_objectives": challenge_objectives,
            "challenge_instructions": challenge_instructions,
            "file_url": public_url
        }

        response = supabase_service.client.table("student_challenges").insert(challenge_data).execute()

        if not response.data:
                raise HTTPException(status_code=400, detail="Failed to insert challenge into database")

        return {"message": "Challenge created", "data": response.data}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

