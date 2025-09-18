import os, uuid, re
from datetime import datetime
from supabase import create_client, Client
from models.estimate_model import EstimateItem, EstimateSummary
from dotenv import load_dotenv
from typing import List

load_dotenv()

class SupabaseClient:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        self.client = create_client(url, key)
        self.bucket_name = "student_challenge_files"


    def save_material_price(self, item: dict):
        clean_price = re.sub(r"[^\d.]", "", str(item.get("price", "0")))
        payload = {
            "material": item.get("material"),
            "brand": item.get("brand"),
            "unit": item.get("unit"),
            "price": clean_price,                
            "vendor": item.get("vendor"),
            "location": item.get("location"),
            "gmaps_link": item.get("gmaps_link"),
        }
        return self.client.table("materials_prices").insert(payload).execute()

    def upload_file_to_bucket(self, file_path: str, file_bytes: bytes, content_type: str):
        """
        Uploads a file (bytes) to the configured Supabase storage bucket.

        :param file_path: Desired path/name inside the bucket (e.g., "plans/abc.pdf")
        :param file_bytes: The raw file content as bytes
        :param content_type: MIME type of the file (e.g., "application/pdf")
        :return: Public URL of the uploaded file
        """
        try:
        
            response = self.client.storage.from_(self.bucket_name).upload(
                path=file_path,
                file=file_bytes,
                file_options={
                    "content-type": content_type,
                    "upsert": "true"   # must be string, not bool
                }
            )

            if response:
                # Generate a public URL
                public_url = self.client.storage.from_(self.bucket_name).get_public_url(file_path)
                return public_url
            else:
                raise Exception("Upload failed, no response from Supabase.")

        except Exception as e:
            raise Exception(f"Failed to upload file: {str(e)}")

class SupabaseService:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")

        if not url or not key:
            raise ValueError("SUPABASE_URL or SUPABASE_KEY is missing from environment variables")

        self.client: Client = create_client(url, key)

    def get_challenge(self, challenge_id: str):
        """
        Fetch challenge details from student_challenges table.
        """
        response = self.client.table("student_challenges").select("*").eq("challenge_id", challenge_id).execute()
        if len(response.data) > 0:
            return response.data[0]
        return None

    def save_estimation_results(self, challenge_id: str, analysis_id: str, items: List[EstimateItem], summary: EstimateSummary):
        """
        Save AI results into structural_elements, ai_cost_estimates, cost_estimates_summary.
        """
       
        for item in items:
            self.client.table("ai_cost_estimates").insert({
                "estimate_id": str(item.estimate_id),
                "analysis_id": analysis_id,
                "item_number": item.item_number,
                "description": item.description,
                "quantity": item.quantity,
                "unit": item.unit,
                "unit_price": item.unit_price,
                "amount": item.amount,
                "cost_category": item.cost_category
            }).execute()

      
        self.client.table("cost_estimates_summary").insert({
            "summary_id": str(summary.summary_id),
            "analysis_id": analysis_id,
            "subtotal_amount": summary.subtotal_amount,
            "contingency_percentage": summary.contingency_percentage,
            "contingency_amount": summary.contingency_amount,
            "total_amount": summary.total_amount,
        }).execute()