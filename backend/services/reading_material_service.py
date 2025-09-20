from services.supabase_service import SupabaseClient
from models.reading_material import ReadingMaterialCreate, ReadingMaterialUpdate
from datetime import datetime

# Create a single instance of Supabase client
supabase = SupabaseClient().client


class ReadingMaterialService:
    @staticmethod
    def create(material: ReadingMaterialCreate):
        material_data = (
            supabase.table("reading_materials")
            .insert(
                {
                    "title": material.title,
                    "slug": material.slug,
                    "user_id": material.user_id,  # must be valid UUID
                },
                returning="representation",  # ensures inserted row is returned
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
        return {"id": material_id, "title": material.title}

    @staticmethod
    def update(material_id: int, material: ReadingMaterialUpdate):
        update_payload = {
            "updated_at": datetime.utcnow().isoformat(),
        }
        if material.title is not None:
            update_payload["title"] = material.title
        if material.slug is not None:
            update_payload["slug"] = material.slug

        supabase.table("reading_materials").update(update_payload).eq("id", material_id).execute()

        if material.sections is not None:
            # clear old sections
            supabase.table("reading_material_sections").delete().eq(
                "reading_material_id", material_id
            ).execute()

            # insert new sections
            sections_payload = [
                {
                    "reading_material_id": material_id,
                    "section_slug": section.section_slug,
                    "content": section.content,
                }
                for section in material.sections
            ]
            supabase.table("reading_material_sections").insert(sections_payload).execute()

        return {"id": material_id, "message": "Updated successfully"}

    @staticmethod
    def get_all():
        return supabase.table("reading_materials").select("*").execute().data

    @staticmethod
    def get_by_id(material_id: int):
        material = supabase.table("reading_materials").select("*").eq("id", material_id).execute()
        sections = (
            supabase.table("reading_material_sections")
            .select("*")
            .eq("reading_material_id", material_id)
            .execute()
        )

        return {
            "material": material.data[0] if material.data else None,
            "sections": sections.data,
        }

    @staticmethod
    def delete(material_id: int):
        supabase.table("reading_material_sections").delete().eq(
            "reading_material_id", material_id
        ).execute()
        supabase.table("reading_materials").delete().eq("id", material_id).execute()
        return {"id": material_id, "message": "Deleted successfully"}
