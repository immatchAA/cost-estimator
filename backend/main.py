from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routes.challenges import router as challenges_router
from pydantic import BaseModel
from services.gemini_service import GeminiPriceSearch
from supabase import create_client, Client
from dotenv import load_dotenv
from routes.auth import auth_router

import os
import json
import re
import logging

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# FastAPI app
app = FastAPI()
app.include_router(challenges_router, prefix="/api")
app.include_router(auth_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", 
                   "http://127.0.0.1:5173"
                   ],  # Replace "*" with frontend origin for security
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
    # ... keep your existing search_price endpoint ...
    pass


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
