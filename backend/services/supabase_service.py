import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

class SupabaseClient:
    def __init__(self):
        # Load Supabase credentials from environment variables
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        self.client = create_client(url, key)
        self.bucket_name = "student_challenge_files"


    def save_material_price(self, material_info):
        try:
            response = self.client.table("materials_prices").insert(material_info).execute()
            return response.data
        except Exception as e:
            raise Exception(f"Failed to save to Supabase: {str(e)}")

