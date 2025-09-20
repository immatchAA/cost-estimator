from pydantic import BaseModel
from typing import List, Optional


class Section(BaseModel):
    section_slug: str
    content: str


class ReadingMaterialCreate(BaseModel):
    title: str
    slug: str
    user_id: str   # must be a valid UUID string in Supabase
    sections: List[Section]


class ReadingMaterialUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    sections: Optional[List[Section]] = None
