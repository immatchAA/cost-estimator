from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from services.email_service import EmailService
from models.verification_model import VerificationCodeRequest, VerificationCodeVerify

load_dotenv()

verification_router = APIRouter(prefix="/verification")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

email_service = EmailService()

@verification_router.post("/send-code")
async def send_verification_code(request: VerificationCodeRequest):
    """Send a 6-digit verification code to the provided email"""
    try:
        email = request.email.lower().strip()
        
        # Generate verification code
        verification_code = email_service.generate_verification_code()
        
        # Set expiration time (10 minutes from now)
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        # Delete any existing verification codes for this email
        supabase.table("verification_codes").delete().eq("email", email).execute()
        
        # Insert new verification code
        verification_data = {
            "email": email,
            "code": verification_code,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": expires_at.isoformat(),
            "is_used": False
        }
        
        result = supabase.table("verification_codes").insert(verification_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to save verification code")
        
        # Send email
        email_sent, error_message = email_service.send_verification_email(email, verification_code)
        
        if not email_sent:
            # If email failed to send, delete the verification code
            supabase.table("verification_codes").delete().eq("email", email).execute()
            # Log the detailed error message for debugging
            print(f"Failed to send verification email to {email}: {error_message}")
            raise HTTPException(status_code=500, detail=f"Failed to send verification email: {error_message}")
        
        return {"message": "Verification code sent successfully", "email": email}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@verification_router.post("/verify-code")
async def verify_code(request: VerificationCodeVerify):
    """Verify the 6-digit code for the provided email"""
    try:
        email = request.email.lower().strip()
        code = request.code.strip()
        
        # Get verification code from database
        result = supabase.table("verification_codes").select("*").eq("email", email).eq("code", code).eq("is_used", False).execute()
        
        if not result.data:
            raise HTTPException(status_code=400, detail="Invalid verification code")
        
        verification_record = result.data[0]
        
        # Check if code has expired
        expires_at = datetime.fromisoformat(verification_record["expires_at"].replace('Z', '+00:00'))
        current_time = datetime.utcnow().replace(tzinfo=expires_at.tzinfo)
        if current_time > expires_at:
            # Mark expired code as used
            supabase.table("verification_codes").update({"is_used": True}).eq("id", verification_record["id"]).execute()
            raise HTTPException(status_code=400, detail="Verification code has expired")
        
        # Mark code as used
        supabase.table("verification_codes").update({"is_used": True}).eq("id", verification_record["id"]).execute()
        
        return {"message": "Email verified successfully", "email": email}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@verification_router.post("/resend-code")
async def resend_verification_code(request: VerificationCodeRequest):
    """Resend verification code to the provided email"""
    try:
        email = request.email.lower().strip()
        
        # Check if there's an existing unused code
        result = supabase.table("verification_codes").select("*").eq("email", email).eq("is_used", False).execute()
        
        if result.data:
            existing_record = result.data[0]
            expires_at = datetime.fromisoformat(existing_record["expires_at"].replace('Z', '+00:00'))
            
            # If code hasn't expired yet, don't allow resend (prevent spam)
            current_time = datetime.utcnow().replace(tzinfo=expires_at.tzinfo)
            if current_time < expires_at:
                remaining_time = int((expires_at - current_time).total_seconds())
                raise HTTPException(
                    status_code=429, 
                    detail=f"Please wait {remaining_time} seconds before requesting a new code"
                )
        
        # Generate new verification code
        verification_code = email_service.generate_verification_code()
        
        # Set expiration time (10 minutes from now)
        expires_at = datetime.utcnow() + timedelta(minutes=10)
        
        # Delete any existing verification codes for this email
        supabase.table("verification_codes").delete().eq("email", email).execute()
        
        # Insert new verification code
        verification_data = {
            "email": email,
            "code": verification_code,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": expires_at.isoformat(),
            "is_used": False
        }
        
        result = supabase.table("verification_codes").insert(verification_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to save verification code")
        
        # Send email
        email_sent, error_message = email_service.send_verification_email(email, verification_code)
        
        if not email_sent:
            # If email failed to send, delete the verification code
            supabase.table("verification_codes").delete().eq("email", email).execute()
            # Log the detailed error message for debugging
            print(f"Failed to resend verification email to {email}: {error_message}")
            raise HTTPException(status_code=500, detail=f"Failed to send verification email: {error_message}")
        
        return {"message": "Verification code resent successfully", "email": email}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
