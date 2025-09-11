from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from supabase_auth.errors import AuthApiError

load_dotenv()

auth_router = APIRouter(prefix="/auth")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Pydantic models
class RegisterRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    role: str

class LoginRequest(BaseModel):
    email: str
    password: str


@auth_router.post("/register")
async def register(request: RegisterRequest):
    try:
        # Create user in Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
        })

        if not auth_response.user:
            raise HTTPException(status_code=400, detail="Failed to create user")

        # Insert into custom users table
        insert_response = supabase.table("users").insert({
            "id": auth_response.user.id,
            "first_name": request.first_name,
            "last_name": request.last_name,
            "email": request.email,
            "role": request.role
        }).execute()

        return {"message": "User registered successfully"}

    except AuthApiError as e:
        # Handles cases like "User already registered"
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")


@auth_router.post("/login")
async def login_user(request: LoginRequest):
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })

        if not auth_response.user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        return {
            "message": "Login successful",
            "user": {
                "id": auth_response.user.id,
                "email": auth_response.user.email
            },
            "session": {
                "access_token": auth_response.session.access_token if auth_response.session else None
            }
        }

    except AuthApiError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
