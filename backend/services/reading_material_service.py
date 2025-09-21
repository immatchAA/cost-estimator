from services.supabase_service import SupabaseClient
from models.reading_material import ReadingMaterialCreate, ReadingMaterialUpdate
from datetime import datetime, timedelta, timezone

supabase = SupabaseClient().client
PHT = timezone(timedelta(hours=8))

class ReadingMaterialService:
    @staticmethod
    def create(material: ReadingMaterialCreate):
        now_pht = datetime.now(PHT).isoformat()
        
        material_data = (
            supabase.table("reading_materials")
            .insert(
                {
                    "title": material.title,
                    "slug": material.slug,
                    "user_id": material.user_id,
                    "created_at": now_pht,
                    "updated_at": now_pht,
                },
                returning="representation",
            )
            .execute()
        )

        if not material_data.data:
            raise Exception("Failed to insert reading material")

        material_id = material_data.data[0]["id"]

        sections_payload = [
            {
                "reading_material_id": material_id,
                "section_slug": section.section_slug,
                "content": section.content,
            }
            for section in material.sections
        ]

        supabase.table("reading_material_sections").insert(sections_payload).execute()
        return material_data.data[0]

    @staticmethod
    def update(material_id: int, material: ReadingMaterialUpdate):
        now_pht = datetime.now(PHT).isoformat()
        update_payload = {"updated_at": now_pht}

        if material.title is not None:
            update_payload["title"] = material.title
        if material.slug is not None:
            update_payload["slug"] = material.slug

        result = (
            supabase.table("reading_materials")
            .update(update_payload)
            .eq("id", material_id)
            .execute()
        )

        if material.sections is not None:
            # Delete old sections
            supabase.table("reading_material_sections").delete().eq(
                "reading_material_id", material_id
            ).execute()

            # Insert new sections
            sections_payload = [
                {
                    "reading_material_id": material_id,
                    "section_slug": section.section_slug,
                    "content": section.content,
                }
                for section in material.sections
            ]
            supabase.table("reading_material_sections").insert(sections_payload).execute()

        # Return updated material row so frontend has correct updated_at
        return result.data[0] if result.data else {"id": material_id, "message": "Updated successfully"}

    @staticmethod
    def get_all():
        materials = supabase.table("reading_materials").select("*").execute().data or []

        results = []
        for material in materials:
            sections = (
                supabase.table("reading_material_sections")
                .select("section_slug, content")
                .eq("reading_material_id", material["id"])
                .execute()
                .data
            )

            results.append({
                **material,
                "sections": sections or [],
            })

        # Sort by updated_at descending, fallback to created_at
        results.sort(key=lambda x: x.get("updated_at") or x.get("created_at"), reverse=True)

        return results

    @staticmethod
    def get_by_id(material_id: int):
        material_res = (
            supabase.table("reading_materials")
            .select("*")
            .eq("id", material_id)
            .execute()
        )

        if not material_res.data:
            return None

        material = material_res.data[0]

        sections = (
            supabase.table("reading_material_sections")
            .select("section_slug, content")
            .eq("reading_material_id", material_id)
            .execute()
            .data
        )

        return {
            **material,
            "sections": sections or [],
        }

    @staticmethod
    def delete(material_id: int):
        supabase.table("reading_material_sections").delete().eq(
            "reading_material_id", material_id
        ).execute()
        supabase.table("reading_materials").delete().eq("id", material_id).execute()
        return {"id": material_id, "message": "Deleted successfully"}
