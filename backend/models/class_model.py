from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ClassCreate(BaseModel):
    class_name: str
    description: Optional[str] = None

class ClassJoin(BaseModel):
    class_key: str

class ClassResponse(BaseModel):
    id: str
    class_name: str
    description: Optional[str] = None
    class_key: str
    teacher_id: str
    created_at: datetime
    student_count: Optional[int] = 0

class StudentClassResponse(BaseModel):
    id: str
    class_name: str
    description: Optional[str] = None
    teacher_name: str
    joined_at: datetime
