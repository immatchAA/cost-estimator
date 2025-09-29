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

            # Check teacher role
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
            # 1. Find class by key
            class_result = supabase.table("classes").select("id, teacher_id").eq("class_key", class_key).execute()
            if not class_result.data:
                return {"success": False, "message": "Invalid class key"}

            class_info = class_result.data[0]   # ✅ first row
            teacher_id = class_info["teacher_id"]

            # 2. Check if already enrolled
            existing = supabase.table("class_enrollments")\
                .select("id")\
                .eq("class_id", class_info["id"])\
                .eq("student_id", student_id).execute()

            if existing.data and len(existing.data) > 0:
                return {"success": False, "message": "You already requested/joined this class"}

            # 3. Insert pending enrollment
            enrollment_data = {
                "id": str(uuid.uuid4()),
                "class_id": class_info["id"],
                "student_id": student_id,
                "teacher_id": teacher_id,
                "status": "pending",
                "created_at": datetime.utcnow().isoformat()
            }
            result = supabase.table("class_enrollments").insert(enrollment_data).execute()

            if result.data:
                return {"success": True, "message": "Request sent, waiting for teacher approval"}
            else:
                return {"success": False, "message": "Failed to send request"}
        except Exception as e:
            return {"success": False, "message": f"Error joining class: {str(e)}"}

    
    @staticmethod
    async def get_teacher_classes(teacher_id: str):
        """Get all classes created by a teacher (only count accepted students)"""
        try:
            # fetch teacher's classes
            result = supabase.table("classes")\
                .select("id, class_name, description, class_key, teacher_id, created_at")\
                .eq("teacher_id", teacher_id)\
                .execute()

            if result.data:
                classes = []
                for class_data in result.data:
                    # count only accepted students for this class
                    count_res = supabase.table("class_enrollments")\
                        .select("id", count="exact")\
                        .eq("class_id", class_data["id"])\
                        .eq("status", "accepted")\
                        .execute()

                    student_count = count_res.count if hasattr(count_res, "count") else 0

                    classes.append({
                        "id": class_data["id"],
                        "class_name": class_data["class_name"],
                        "description": class_data.get("description"),
                        "class_key": class_data["class_key"],
                        "teacher_id": class_data["teacher_id"],
                        "created_at": class_data.get("created_at"),
                        "student_count": student_count
                    })

                return {"success": True, "classes": classes}
            else:
                return {"success": True, "classes": []}
        except Exception as e:
            return {"success": False, "message": f"Error fetching classes: {str(e)}"}

    
    @staticmethod
    async def get_student_classes(student_id: str):
        """Get all classes a student is enrolled in (pending or accepted)"""
        try:
            enrollments = supabase.table("class_enrollments")\
                .select("id, class_id, status, created_at")\
                .eq("student_id", student_id).execute()

            if not enrollments.data:
                return {"success": True, "classes": []}

            classes = []
            for enrollment in enrollments.data:
                class_res = supabase.table("classes")\
                    .select("id, class_name, description, teacher_id")\
                    .eq("id", enrollment["class_id"]).single().execute()

                if not class_res.data:
                    continue

                teacher_res = supabase.table("users")\
                    .select("first_name, last_name")\
                    .eq("id", class_res.data["teacher_id"]).single().execute()

                teacher_name = "Unknown"
                if teacher_res.data:
                    teacher_name = f"{teacher_res.data['first_name']} {teacher_res.data['last_name']}"

                classes.append({
                    "id": class_res.data["id"],
                    "class_name": class_res.data["class_name"],
                    "description": class_res.data.get("description"),
                    "teacher_name": teacher_name,
                    "joined_at": enrollment.get("created_at"),
                    "status": enrollment.get("status", "pending")
                })

            return {"success": True, "classes": classes}

        except Exception as e:
            return {"success": False, "message": f"Error fetching student classes: {str(e)}"}
