from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from supabase_auth.errors import AuthApiError
from datetime import datetime

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

class RegisterWithVerificationRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    role: str
    verification_code: str

class LoginRequest(BaseModel):
    email: str
    password: str


@auth_router.post("/register")
async def register(request: RegisterRequest):
    """Initial registration - sends verification code but doesn't create user yet"""
    try:
        email = request.email.lower().strip()
        
        # Check if user already exists
        existing_user = supabase.table("users").select("id").eq("email", email).execute()
        if existing_user.data:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Store registration data temporarily (you might want to use a separate table for this)
        # For now, we'll just return success and let the frontend handle the verification flow
        return {
            "message": "Registration data received. Please verify your email to complete registration.",
            "email": email,
            "requires_verification": True
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@auth_router.post("/register-with-verification")
async def register_with_verification(request: RegisterWithVerificationRequest):
    """Complete registration after email verification"""
    try:
        email = request.email.lower().strip()
        
        # Verify the verification code first
        verification_result = supabase.table("verification_codes").select("*").eq("email", email).eq("code", request.verification_code).eq("is_used", False).execute()
        
        if not verification_result.data:
            raise HTTPException(status_code=400, detail="Invalid verification code")
        
        verification_record = verification_result.data[0]
        
        # Check if code has expired
        expires_at = datetime.fromisoformat(verification_record["expires_at"].replace('Z', '+00:00'))
        current_time = datetime.utcnow().replace(tzinfo=expires_at.tzinfo)
        if current_time > expires_at:
            raise HTTPException(status_code=400, detail="Verification code has expired")
        
        # Mark verification code as used
        supabase.table("verification_codes").update({"is_used": True}).eq("id", verification_record["id"]).execute()
        
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
            "role": request.role,
            "email_verified": True,
            "verified_at": datetime.utcnow().isoformat()
        }).execute()

        return {"message": "User registered and verified successfully"}

    except HTTPException:
        raise
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
