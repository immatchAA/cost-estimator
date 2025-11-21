import os
import json
import re
import logging
import uuid

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

from routes.challenges import router as challenges_router
from routes.auth import auth_router
from routes import reading_materials
from routes.class_routes import class_router
from routes.verification import verification_router
from pydantic import BaseModel
from services.gemini_service import GeminiPriceSearch
from services.supabase_service import SupabaseClient
from routes.cost_estimation_route import router as cost_estimation_router
from routes import ai_suggestion_route
from routes import estimate_route
from routes import materials


load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
sb = SupabaseClient()

# FastAPI app
app = FastAPI()
app.include_router(challenges_router, prefix="/api")
app.include_router(estimate_route.router, prefix="/api") 
app.include_router(auth_router)
app.include_router(verification_router)
app.include_router(reading_materials.router)
app.include_router(class_router, prefix="/api")
app.include_router(cost_estimation_router, prefix="/api")
app.include_router(ai_suggestion_route.router, prefix="/api")
app.include_router(materials.router)

@app.get("/")
def root():
    return {"status": "ok", "message": "API running successfully"}

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://archi-quest.vercel.app",
        "https://archi-quest-biphfu62w-kinatulinans-projects.vercel.app"
    ],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gemini = GeminiPriceSearch()


class MaterialRequest(BaseModel):
    material: str


class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    role: str


@app.post("/auth/register")
async def register_user(request: RegisterRequest):
    try:
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password
        })

        if auth_response.user:
            user_id = auth_response.user.id
        else:
            raise HTTPException(status_code=400, detail="User already registered")

        # Insert/Upsert user into your custom users table
        insert_response = supabase.table("users").upsert({
            "id": user_id,
            "first_name": request.first_name,
            "last_name": request.last_name,
            "email": request.email,
            "role": request.role
        }).execute()

        if insert_response.error:
            raise HTTPException(status_code=400, detail=insert_response.error.message)

        return {"message": "User registered successfully"}

    except Exception as e:
        logging.error(f"Registration failed: {e}")
        raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@app.post("/search_price")
async def search_price(request: MaterialRequest):
    material = request.material
    if not material:
        raise HTTPException(status_code=400, detail="Missing material")

    try:
        prompt = (
            f"You are a cost estimation assistant trained on the latest material pricing information in the Philippines. "
            f"Find the most recent and realistic listings for {material} available in Cebu and nearby areas. "
            f"Include a variety of brands and store types — such as Wilcon Depot, CitiHardware, Lazada, Shopee, local hardware suppliers, and other known vendors. "
            f"Your goal is to simulate the best possible multi-source listings based on your knowledge. "
            f"For each listing, return the following fields:\n"
            "- material\n"
            "- brand\n"
            "- unit (e.g., per bag, per piece, per kg)\n"
            "- price (in PHP)\n"
            "- vendor/store name\n"
            "- location (e.g., Cebu City, Mandaue, Talisay)\n"
            "- optional: Google Maps link (gmaps_link)\n\n"
            "Strictly return the output as a **raw JSON array only** — do NOT include markdown formatting, do NOT wrap the result with backticks (```) or 'json'. "
            "Return only the valid JSON array like this:\n"
            "[\n"
            "  {\n"
            "    \"material\": \"Cement\",\n"
            "    \"brand\": \"Holcim Excel\",\n"
            "    \"unit\": \"40kg bag\",\n"
            "    \"price\": \"₱250\",\n"
            "    \"vendor\": \"Wilcon Depot\",\n"
            "    \"location\": \"Cebu City\",\n"
            "    \"gmaps_link\": \"https://goo.gl/maps/abc123\"\n"
            "  },\n"
            "  {\n"
            "    \"material\": \"Cement\",\n"
            "    \"brand\": \"Republic Portland\",\n"
            "    \"unit\": \"40kg bag\",\n"
            "    \"price\": \"₱240\",\n"
            "    \"vendor\": \"CitiHardware\",\n"
            "    \"location\": \"Mandaue\",\n"
            "    \"gmaps_link\": \"https://goo.gl/maps/xyz456\"\n"
            "  }\n"
            "]"
        )

        ai_response = gemini._call_gemini(prompt)

        match = re.search(r"\[.*\]", ai_response, re.DOTALL)
        if not match:
            raise HTTPException(status_code=500, detail={"error": "No valid JSON array found", "raw": ai_response})

        clean_json = match.group(0)
        material_list = json.loads(clean_json)

        for item in material_list:
            sb.save_material_price(item)

        return material_list

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)