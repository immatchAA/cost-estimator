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
from services.price_service import PriceService


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
# Verification router temporarily disabled - will be re-enabled later
# app.include_router(verification_router)
app.include_router(reading_materials.router, prefix="/api")

app.include_router(class_router, prefix="/api")
app.include_router(cost_estimation_router, prefix="/api")
app.include_router(ai_suggestion_route.router, prefix="/api")
app.include_router(materials.router)

@app.get("/")
def root():
    return {"status": "ok", "message": "API running successfully"}

@app.get("/health/email")
def check_email_config():
    """Check email service configuration"""
    import os
    try:
        import resend
        resend_available = True
    except ImportError:
        resend_available = False
    
    resend_api_key = os.getenv("RESEND_API_KEY")
    from_email = os.getenv("RESEND_FROM_EMAIL") or os.getenv("FROM_EMAIL", "onboarding@resend.dev")
    
    return {
        "email_service": "Resend",
        "resend_api_key_set": bool(resend_api_key),
        "resend_api_key_length": len(resend_api_key) if resend_api_key else 0,
        "resend_api_key_prefix": resend_api_key[:3] + "..." if resend_api_key and len(resend_api_key) > 3 else "Not set",
        "from_email": from_email,
        "from_email_source": "RESEND_FROM_EMAIL" if os.getenv("RESEND_FROM_EMAIL") else ("FROM_EMAIL" if os.getenv("FROM_EMAIL") else "default"),
        "resend_package_available": resend_available,
        "configuration_complete": bool(resend_api_key) and resend_available,
    }

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "https://archiquest.vercel.app",
        "https://archiquest-6s5fymguo-imrichellev123456-gmailcoms-projects.vercel.app"
                   ],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

gemini = GeminiPriceSearch()


class MaterialRequest(BaseModel):
    material: str
    size:str


# RegisterRequest model and register endpoint moved to routes/auth.py
# Keeping this commented for reference - using auth_router instead
# class RegisterRequest(BaseModel):
#     first_name: str
#     last_name: str
#     email: str
#     password: str
#     role: str

# @app.post("/auth/register")
# async def register_user(request: RegisterRequest):
#     try:
#         auth_response = supabase.auth.sign_up({
#             "email": request.email,
#             "password": request.password
#         })
#
#         if auth_response.user:
#             user_id = auth_response.user.id
#         else:
#             raise HTTPException(status_code=400, detail="User already registered")
#
#         # Insert/Upsert user into your custom users table
#         insert_response = supabase.table("users").upsert({
#             "id": user_id,
#             "first_name": request.first_name,
#             "last_name": request.last_name,
#             "email": request.email,
#             "role": request.role
#         }).execute()
#
#         if insert_response.error:
#             raise HTTPException(status_code=400, detail=insert_response.error.message)
#
#         return {"message": "User registered successfully"}
#
#     except Exception as e:
#         logging.error(f"Registration failed: {e}")
#         raise HTTPException(status_code=500, detail=f"Server error: {str(e)}")


@app.post("/search_price")
async def search_price(request: MaterialRequest):
    material = request.material
    size = request.size or ""
    unit = "piece"

    if not material:
        raise HTTPException(status_code=400, detail="Missing material")

    try:
        service = PriceService()   # ← Now recognized

        median_price, listings = service.get_unit_price(
            material=material,
            unit=unit,
            size=size
        )

        for item in listings:
            if "size" not in item or not item["size"]:
                item["size"] = size

        return listings

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 8000))
    )