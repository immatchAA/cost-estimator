# routes/materials.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/materials", tags=["Materials"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


class MaterialAdd(BaseModel):
    material: str
    brand: str
    price: str
    unit: str
    vendor: str
    location: str
    teacher_id: str


@router.post("/add")
async def add_material(material: MaterialAdd):
    try:
        data = {
            "material": material.material,
            "brand": material.brand,
            "price": material.price,
            "unit": material.unit,
            "vendor": material.vendor,
            "location": material.location,
            "teacher_id": material.teacher_id,
        }

        print("🟩 Inserting data:", data) 

        response = supabase.table("materials_prices").insert(data).execute()

        print("🟩 Supabase response:", response)  

        if response.data:
            return {"success": True, "message": "Material added successfully", "data": response.data}
        else:
            raise HTTPException(status_code=400, detail="Failed to add material")

    except Exception as e:
        print("❌ SUPABASE ERROR:", e)  
        raise HTTPException(status_code=500, detail=str(e))
    


@router.get("/teacher/{teacher_id}")
async def get_teacher_materials(teacher_id: str):
    try:
        response = supabase.table("materials_prices").select("*").eq("teacher_id", teacher_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/update/{material_id}")
async def update_material(material_id: int, updated_data: dict):
    try:
        response = supabase.table("materials_prices").update(updated_data).eq("material_id", material_id).execute()
        return {"success": True, "message": "Material updated", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all")
async def get_all_materials():
    """Fetch only materials created by teachers (teacher_id not null)."""
    try:
        response = (
            supabase.table("materials_prices")
            .select("*")
            .not_.is_("teacher_id", None) 
            .execute()
        )

        materials = [m for m in response.data if m.get("teacher_id")]  
        return materials

    except Exception as e:
        print("❌ ERROR fetching teacher materials:", e)
        raise HTTPException(status_code=500, detail=str(e))




@router.delete("/delete/{material_id}")
async def delete_material(material_id: str):
    try:
        supabase.table("materials_prices").delete().eq("material_id", material_id).execute()
        return {"success": True, "message": "Material deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

