import uuid
import string
import random
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class ClassService:
    @staticmethod
    def generate_class_key():
        """Generate a unique 8-character class key"""
        characters = string.ascii_uppercase + string.digits
        return ''.join(random.choice(characters) for _ in range(8))
    
    @staticmethod
    async def create_class(class_name: str, teacher_id: str, description: str = None):
        """Create a new class with a unique class key"""
        try:
            # Generate unique class key
            class_key = ClassService.generate_class_key()
            while True:
                existing_class = supabase.table("classes").select("id").eq("class_key", class_key).execute()
                if not existing_class.data:
                    break
                class_key = ClassService.generate_class_key()

            # ✅ FIX: valid Python dict (removed stray brace) + safer single fetch
            user = supabase.table("users").select("role").eq("id", teacher_id).single().execute()
            if (not user.data) or (user.data["role"] != "teacher"):
                return {"success": False, "message": "Only teachers can create classes"}

            # Create class
            class_data = {
                "id": str(uuid.uuid4()),
                "class_name": class_name,
                "description": description,
                "class_key": class_key,
                "teacher_id": teacher_id,
                "created_at": datetime.utcnow().isoformat()
            }
            result = supabase.table("classes").insert(class_data).execute()

            if result.data:
                return {"success": True, "class": result.data[0], "message": "Class created successfully"}
            else:
                return {"success": False, "message": "Failed to create class"}
        except Exception as e:
            return {"success": False, "message": f"Error creating class: {str(e)}"}
    
    @staticmethod
    async def join_class(class_key: str, student_id: str):
        """Join a class using class key"""
        try:
            # Find class by class key
            class_result = supabase.table("classes").select("id, teacher_id").eq("class_key", class_key).single().execute()
            if not class_result.data:
                return {"success": False, "message": "Invalid class key"}
            class_info = class_result.data
            teacher_id = class_info["teacher_id"]

            # ✅ FIX: remove the typo block; use correct table/columns once
            existing_enrollment = supabase.table("class_enrollments")\
                .select("id")\
                .eq("class_id", class_info["id"])\
                .eq("student_id", student_id)\
                .maybe_single()\
                .execute()

            if existing_enrollment.data:
                return {"success": False, "message": "You are already enrolled in this class"}

            # Enroll student in class (include teacher_id)
            enrollment_data = {
                "id": str(uuid.uuid4()),
                "class_id": class_info["id"],
                "student_id": student_id,
                "teacher_id": teacher_id,
                "created_at": datetime.utcnow().isoformat()
            }
            enrollment_result = supabase.table("class_enrollments").insert(enrollment_data).execute()

            if enrollment_result.data:
                return {"success": True, "class": class_info, "message": "Successfully joined the class"}
            else:
                return {"success": False, "message": "Failed to join class"}
        except Exception as e:
            return {"success": False, "message": f"Error joining class: {str(e)}"}
    
    @staticmethod
    async def get_teacher_classes(teacher_id: str):
        """Get all classes created by a teacher"""
        try:
            result = supabase.table("classes").select("*, class_enrollments(count)").eq("teacher_id", teacher_id).execute()
            if result.data:
                classes = []
                for class_data in result.data:
                    classes.append({
                        "id": class_data["id"],
                        "class_name": class_data["class_name"],
                        "description": class_data["description"],
                        "class_key": class_data["class_key"],
                        "teacher_id": class_data["teacher_id"],
                        "created_at": class_data.get("created_at"),
                        "student_count": class_data["class_enrollments"][0]["count"] if class_data.get("class_enrollments") else 0
                    })
                return {"success": True, "classes": classes}
            else:
                return {"success": True, "classes": []}
        except Exception as e:
            return {"success": False, "message": f"Error fetching classes: {str(e)}"}
    
    @staticmethod
    async def get_student_classes(student_id: str):
        """Get all classes a student is enrolled in"""
        try:
            result = supabase.table("class_enrollments")\
                .select("*, classes(*, users(first_name, last_name))")\
                .eq("student_id", student_id).execute()
            if result.data:
                classes = []
                for enrollment in result.data:
                    class_data = enrollment["classes"]
                    teacher_info = class_data["users"]
                    classes.append({
                        "id": class_data["id"],
                        "class_name": class_data["class_name"],
                        "description": class_data["description"],
                        "teacher_name": f"{teacher_info['first_name']} {teacher_info['last_name']}",
                        "joined_at": enrollment.get("created_at")
                    })
                return {"success": True, "classes": classes}
            else:
                return {"success": True, "classes": []}
        except Exception as e:
            return {"success": False, "message": f"Error fetching student classes: {str(e)}"}
