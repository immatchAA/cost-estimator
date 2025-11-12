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

@class_router.get("/{class_id}/student-view")
async def get_class_for_student(class_id: str):
    """Get class details with challenges for a student"""
    try:
        # Get class info
        class_res = supabase.table("classes")\
            .select("id, class_name, description, class_key, teacher_id, created_at")\
            .eq("id", class_id).single().execute()
        
        if not class_res.data:
            raise HTTPException(status_code=404, detail="Class not found")
        
        cls = class_res.data
        
        # Get teacher info
        teacher_res = supabase.table("users")\
            .select("first_name, last_name, email")\
            .eq("id", cls["teacher_id"]).single().execute()
        
        teacher_name = "Unknown"
        if teacher_res.data:
            teacher_name = f"{teacher_res.data['first_name']} {teacher_res.data['last_name']}"
        
        # Get all challenges for this teacher
        challenge_res = supabase.table("student_challenges")\
            .select("challenge_id, challenge_name, challenge_instructions, challenge_objectives, due_date, file_url, created_at")\
            .eq("teacher_id", cls["teacher_id"])\
            .order("created_at", desc=True)\
            .execute()
        
        challenges = challenge_res.data if challenge_res.data else []
        
        return {
            "success": True,
            "class": {
                **cls,
                "teacher_name": teacher_name
            },
            "challenges": challenges
        }
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

@class_router.get("/student/{student_id}/all-challenges")
async def get_student_all_challenges(student_id: str):
    """Get all challenges for a student with class information"""
    try:
        # Get all enrollments for the student
        enrollments_res = supabase.table("class_enrollments")\
            .select("class_id, teacher_id")\
            .eq("student_id", student_id)\
            .eq("status", "accepted").execute()
        
        if not enrollments_res.data:
            return {"success": True, "challenges": []}
        
        # Get unique teacher IDs
        teacher_ids = list(set([e["teacher_id"] for e in enrollments_res.data]))
        
        # Get all challenges from these teachers
        challenges_res = supabase.table("student_challenges")\
            .select("challenge_id, challenge_name, challenge_instructions, challenge_objectives, due_date, file_url, created_at, teacher_id")\
            .in_("teacher_id", teacher_ids)\
            .order("created_at", desc=True)\
            .execute()
        
        challenges_with_class = []
        
        # For each challenge, get class information
        for challenge in challenges_res.data:
            # Get teacher's classes
            classes_res = supabase.table("classes")\
                .select("id, class_name")\
                .eq("teacher_id", challenge["teacher_id"]).execute()
            
            # Find which class(es) this challenge belongs to
            # Since challenges are tied to teachers, we'll get all classes from that teacher
            class_names = [c["class_name"] for c in classes_res.data if classes_res.data]
            primary_class = class_names[0] if class_names else "Unknown Class"
            
            # Get teacher info
            teacher_res = supabase.table("users")\
                .select("first_name, last_name")\
                .eq("id", challenge["teacher_id"]).single().execute()
            
            teacher_name = "Unknown Teacher"
            if teacher_res.data:
                teacher_name = f"{teacher_res.data['first_name']} {teacher_res.data['last_name']}"
            
            challenges_with_class.append({
                **challenge,
                "class_name": primary_class,
                "teacher_name": teacher_name
            })
        
        return {"success": True, "challenges": challenges_with_class}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")

@class_router.get("/teacher/{teacher_id}/with-students")
async def get_teacher_classes_with_students(teacher_id: str):
    """
    Get all classes created by a teacher.
    Includes:
      - accepted students per class
      - all challenges created by that teacher
      - only students who submitted each challenge
    """
    try:
        print("🟦 FETCHING CLASSES FOR TEACHER:", teacher_id)

        # Get all classes created by teacher
        classes_res = (
            supabase.table("classes")
            .select("id, class_name, description, class_key, teacher_id, created_at")
            .eq("teacher_id", teacher_id)
            .execute()
        )

        # Get all challenges by teacher
        challenges_res = (
            supabase.table("student_challenges")
            .select("challenge_id, challenge_name, challenge_instructions, due_date, created_at")
            .eq("teacher_id", teacher_id)
            .order("created_at", desc=True)
            .execute()
        )
        all_challenges = challenges_res.data or []
        print(f"🟩 Found {len(all_challenges)} challenges")

        classes_with_data = []

        for cls in classes_res.data:
            class_id = cls["id"]

            # Fetch all accepted students in this class
            enrollments_res = (
                supabase.table("class_enrollments")
                .select("student_id, status, created_at")
                .eq("class_id", class_id)
                .eq("status", "accepted")
                .execute()
            )

            students = []
            for e in enrollments_res.data:
                user_res = (
                    supabase.table("users")
                    .select("first_name, last_name, email")
                    .eq("id", e["student_id"])
                    .single()
                    .execute()
                )
                if user_res.data:
                    students.append({
                        "id": e["student_id"],
                        "name": f"{user_res.data['first_name']} {user_res.data['last_name']}",
                        "email": user_res.data["email"],
                        "joined_at": e["created_at"],
                    })

            # Fetch each challenge’s student submissions
            challenges_with_submissions = []
            for ch in all_challenges:
                submissions_res = (
                    supabase.table("student_cost_estimates")
                    .select("student_id, total_amount, submitted_at, status")
                    .eq("challenge_id", ch["challenge_id"])
                    .eq("status", "submitted")
                    .execute()
                )

                submitted_students = []
                for s in submissions_res.data:
                    student_info = next(
                        (st for st in students if st["id"] == s["student_id"]),
                        None,
                    )
                    if student_info:
                        submitted_students.append({
                            **student_info,
                            "submitted_at": s.get("submitted_at"),
                            "total_amount": s.get("total_amount"),
                        })

                challenges_with_submissions.append({
                    **ch,
                    "submissions": submitted_students,
                })

            cls["students"] = students
            cls["challenges"] = challenges_with_submissions
            classes_with_data.append(cls)

        return {"success": True, "classes": classes_with_data}

    except Exception as e:
        print("❌ Error fetching teacher classes:", e)
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")
