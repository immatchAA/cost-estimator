from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from services.class_service import ClassService
from models.class_model import ClassCreate, ClassJoin

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
    """Student requests to join a class"""
    try:
        result = await ClassService.join_class(
            class_key=request.class_key,
            student_id=request.user_id
        )
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result["message"])

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
            return {"success": True, "class": result.data[0]}
        else:
            raise HTTPException(status_code=404, detail="Class not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

# 🔹 FIXED: safer request fetch (no broken Supabase join)
@class_router.get("/{class_id}/requests")
async def get_class_requests(class_id: str):
    """Get pending student requests for a class"""
    try:
        # get pending enrollments
        enrollments = supabase.table("class_enrollments")\
            .select("id, student_id, created_at")\
            .eq("class_id", class_id).eq("status", "pending").execute()

        if not enrollments.data:
            return {"success": True, "requests": []}

        requests = []
        for e in enrollments.data:
            # fetch student profile
            user_res = supabase.table("users")\
                .select("first_name, last_name")\
                .eq("id", e["student_id"]).single().execute()

            student_name = "Unknown"
            if user_res.data:
                student_name = f"{user_res.data['first_name']} {user_res.data['last_name']}"

            requests.append({
                "id": e["id"],
                "student_id": e["student_id"],
                "student_name": student_name,
                "created_at": e["created_at"]
            })

        return {"success": True, "requests": requests}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@class_router.post("/requests/{request_id}/approve")
async def approve_request(request_id: str):
    """Approve student request"""
    try:
        result = supabase.table("class_enrollments")\
            .update({"status": "accepted"}).eq("id", request_id).execute()
        return {"success": True, "message": "Request approved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@class_router.post("/requests/{request_id}/reject")
async def reject_request(request_id: str):
    """Reject student request"""
    try:
        supabase.table("class_enrollments").delete().eq("id", request_id).execute()
        return {"success": True, "message": "Request rejected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@class_router.get("/teacher/{teacher_id}/with-students")
async def get_teacher_classes_with_students(teacher_id: str):
    try:
        classes_res = supabase.table("classes")\
            .select("id, class_name, description, class_key, teacher_id, created_at")\
            .eq("teacher_id", teacher_id).execute()

        classes_with_students = []

        for cls in classes_res.data:
            students_res = supabase.table("class_enrollments")\
                .select("student_id, created_at")\
                .eq("class_id", cls["id"])\
                .eq("status", "accepted").execute()

            students = []
            for s in students_res.data:
                user = supabase.table("users")\
                    .select("first_name, last_name, email")\
                    .eq("id", s["student_id"]).single().execute()

                if user.data:
                    students.append({
                        "id": s["student_id"],
                        "name": f"{user.data['first_name']} {user.data['last_name']}",
                        "email": user.data["email"],
                        "joined_at": s["created_at"]
                    })

            cls["students"] = students
            classes_with_students.append(cls)

        return {"success": True, "classes": classes_with_students}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
