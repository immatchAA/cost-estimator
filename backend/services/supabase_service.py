import os, uuid, re
from datetime import datetime
from supabase import create_client, Client
from models.estimate_model import EstimateItem, EstimateSummary
from dotenv import load_dotenv
from typing import List, Optional
from models.cost_estimation_model import CostEstimateItemIn

load_dotenv()

CAT_TO_NUM = {
    "EARTHWORK": 1,
    "FORMWORK & SCAFFOLDING": 2,
    "MASONRY WORK": 3,
    "CONCRETE WORK": 4,
    "STEELWORK": 5,
    "CARPENTRY WORK": 6,
    "ROOFING WORK": 7,
}

class SupabaseClient:
    def __init__(self):
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        self.client = create_client(url, key)
        self.bucket_name = "student_challenge_files"

    def upsert_cost_estimate(self, student_id: str, challenge_id: str, total_amount: float, submitted_at: Optional[str], status: str):
   
        res = (
            self.client.table("student_cost_estimates")
            .select("studentsCostEstimatesID")
            .eq("student_id", student_id)
            .eq("challenge_id", challenge_id)
            .limit(1)
            .execute()
        )
        existing = res.data[0]["studentsCostEstimatesID"] if res.data else None

        if existing:
            self.client.table("student_cost_estimates").update({
                "total_amount": total_amount,
                "submitted_at": submitted_at,
                "status": status
            }).eq("studentsCostEstimatesID", existing).execute()
            return existing

        ins = self.client.table("student_cost_estimates").insert({
            "student_id": student_id,
            "challenge_id": challenge_id,
            "total_amount": total_amount,
            "submitted_at": submitted_at,
            "status": status
        }, returning="representation").execute()

        return ins.data[0]["studentsCostEstimatesID"]
    

    def replace_estimate_items(self, est_id: str, items: List[CostEstimateItemIn]):
        self.client.table("student_cost_estimate_items") \
            .delete().eq("studentsCostEstimatesID", est_id).execute()

        if not items:
            return

        rows = []
        for i in items:
            cat = (i.cost_category or "").upper().strip()
            item_num = CAT_TO_NUM.get(cat, None)  
            amount = round((i.quantity or 0) * (i.unit_price or 0), 2)
            rows.append({
                "studentsCostEstimatesID": est_id,
                "cost_category": i.cost_category, 
                "material_name": i.material_name,
                "quantity": i.quantity,
                "unit": i.unit,
                "unit_price": i.unit_price,
                "amount": amount,
                "item_number": item_num or 0,     
            })

        self.client.table("student_cost_estimate_items").insert(rows).execute()

    def upsert_estimate_summary(self, est_id: str, subtotal: float, pct: float,
                            contingency: float, total: float, category_subtotals, challenge_id:str):
        base = {
            "studentsCostEstimatesID": est_id,
            "subtotal_amount": subtotal,
            "contingency_percentage": pct,
            "contingency_amount": contingency,
            "total_amount": total,
            "category_subtotals": category_subtotals or [],
            "challenge_id": challenge_id
        }
        sel = self.client.table("students_estimates_summary") \
            .select("studentsEstimatesSummaryID") \
            .eq("studentsCostEstimatesID", est_id) \
            .limit(1).execute()
        if sel.data:
            self.client.table("students_estimates_summary").update(base) \
                .eq("studentsEstimatesSummaryID", sel.data[0]["studentsEstimatesSummaryID"]).execute()
        else:
            self.client.table("students_estimates_summary").insert(base).execute()


    def get_estimate_with_items(self, student_id: str, challenge_id: str):
        hdr = (
            self.client.table("student_cost_estimates")
            .select("studentsCostEstimatesID, status, total_amount, submitted_at")
            .eq("student_id", student_id)
            .eq("challenge_id", challenge_id)
            .limit(1)
            .execute()
        )
        if not hdr.data:
            return None

        est = hdr.data[0]
        est_id = est["studentsCostEstimatesID"]

        items = (
            self.client.table("student_cost_estimate_items")
            .select("*")
            .eq("studentsCostEstimatesID", est_id)
            .order("item_number", desc=False)
            .order("material_name", desc=False)
            .execute()
            .data
        )

        summary = (
            self.client.table("students_estimates_summary")  
            .select("*")
            .eq("studentsCostEstimatesID", est_id)
            .limit(1)
            .execute()
            .data
        )

        est["items"] = items or []
        est["summary"] = summary[0] if summary else None
        return est
    
    def get_summary_by_analysis(self, analysis_id: str):
        res = self.client.table("cost_estimates_summary") \
            .select("*") \
            .eq("analysis_id", analysis_id) \
            .limit(1).execute()
        return res.data[0] if res.data else None


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