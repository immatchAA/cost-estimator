from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from services.class_service import ClassService
from models.class_model import ClassCreate, ClassJoin, ClassResponse, StudentClassResponse

class ClassCreateRequest(BaseModel):
    class_name: str
    description: str = None
    user_id: str

class ClassJoinRequest(BaseModel):
    class_key: str
    user_id: str

load_dotenv()

class_router = APIRouter(prefix="/classes")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_current_user_id():
    """Extract user ID from request headers or session"""
    # This is a simplified version - in production, you'd validate JWT tokens
    # For now, we'll expect the user_id to be passed in the request
    pass

@class_router.post("/create")
async def create_class(request: ClassCreateRequest):
    """Create a new class with a unique class key"""
    try:
        result = await ClassService.create_class(
            class_name=request.class_name,
            teacher_id=request.user_id,
            description=request.description
        )
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["message"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@class_router.post("/join")
async def join_class(request: ClassJoinRequest):
    try:
        # 1. Find class by key
        class_result = supabase.table("classes").select("id, teacher_id").eq("class_key", request.class_key).single().execute()
        if not class_result.data:
            raise HTTPException(status_code=404, detail="Class not found")

        class_id = class_result.data["id"]
        teacher_id = class_result.data["teacher_id"]


        enroll_result = supabase.table("class_enrollments").insert({
            "class_id": class_id,
            "student_id": request.user_id,
            "teacher_id": teacher_id
        }).execute()

        return {"success": True, "data": enroll_result.data}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@class_router.get("/teacher/{teacher_id}")
async def get_teacher_classes(teacher_id: str):
    """Get all classes created by a teacher"""
    try:
        result = await ClassService.get_teacher_classes(teacher_id)
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["message"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@class_router.get("/student/{student_id}")
async def get_student_classes(student_id: str):
    """Get all classes a student is enrolled in"""
    try:
        result = await ClassService.get_student_classes(student_id)
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["message"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@class_router.get("/key/{class_key}")
async def get_class_by_key(class_key: str):
    """Get class information by class key"""
    try:
        result = supabase.table("classes").select("*").eq("class_key", class_key).execute()
        
        if result.data:
            return {
                "success": True,
                "class": result.data[0]
            }
        else:
            raise HTTPException(status_code=404, detail="Class not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
