from fastapi import APIRouter, HTTPException
from models.reading_material import ReadingMaterialCreate, ReadingMaterialUpdate
from services.reading_material_service import ReadingMaterialService

router = APIRouter(prefix="/reading-materials", tags=["Reading Materials"])


@router.post("/")
def create_reading_material(material: ReadingMaterialCreate):
    try:
        return ReadingMaterialService.create(material)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{material_id}")
def update_reading_material(material_id: int, material: ReadingMaterialUpdate):
    try:
        return ReadingMaterialService.update(material_id, material)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
def get_all_materials():
    try:
        return ReadingMaterialService.get_all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{material_id}")
def get_material_by_id(material_id: int):
    try:
        return ReadingMaterialService.get_by_id(material_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{material_id}")
def delete_material(material_id: int):
    try:
        return ReadingMaterialService.delete(material_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
