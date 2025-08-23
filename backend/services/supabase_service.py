import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

class SupabaseClient:
    def __init__(self):
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
