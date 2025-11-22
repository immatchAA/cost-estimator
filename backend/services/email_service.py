import os
import random
import string
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv
from typing import Optional, Tuple

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Try importing Resend
try:
    import resend
    RESEND_AVAILABLE = True
except ImportError:
    RESEND_AVAILABLE = False
    logger.warning("⚠️ Resend package not installed. Install with: pip install resend")

class EmailService:
    def __init__(self):
        # Resend Configuration
        self.resend_api_key = os.getenv("RESEND_API_KEY")
        # Support both RESEND_FROM_EMAIL and FROM_EMAIL for flexibility
        self.from_email = os.getenv("RESEND_FROM_EMAIL") or os.getenv("FROM_EMAIL", "onboarding@resend.dev")
        
        # Debug logging
        logger.info(f"Initializing EmailService (Resend)...")
        logger.info(f"RESEND_API_KEY found: {bool(self.resend_api_key)}")
        if self.resend_api_key:
            logger.info(f"RESEND_API_KEY length: {len(self.resend_api_key)}")
            logger.info(f"RESEND_API_KEY prefix: {self.resend_api_key[:3] + '...' if len(self.resend_api_key) > 3 else 'Not set'}")
        logger.info(f"FROM_EMAIL: {self.from_email}")
        logger.info(f"Resend package available: {RESEND_AVAILABLE}")
        
        # Validate configuration
        if not RESEND_AVAILABLE:
            logger.error("❌ Resend package not installed. Install with: pip install resend")
        elif not self.resend_api_key:
            logger.warning("⚠️ RESEND_API_KEY not configured. Email sending will fail.")
            logger.warning("Please set RESEND_API_KEY in Railway environment variables")
        else:
            # Initialize Resend client
            resend.api_key = self.resend_api_key
            logger.info("✅ Resend configuration loaded successfully")
        
    def generate_verification_code(self) -> str:
        """Generate a 6-digit verification code"""
        return ''.join(random.choices(string.digits, k=6))
    
    def _send_email_via_resend(
        self, 
        to_email: str, 
        subject: str, 
        text_body: str, 
        html_body: str
    ) -> Tuple[bool, str]:
        """
        Send email via Resend API
        Returns: (success: bool, error_message: str)
        """
        if not RESEND_AVAILABLE:
            error_msg = "Resend package not installed. Install with: pip install resend"
            logger.error(error_msg)
            return False, error_msg
        
        if not self.resend_api_key:
            error_msg = "Resend API key not configured. Please set RESEND_API_KEY environment variable."
            logger.error(error_msg)
            return False, error_msg
        
        try:
            logger.info(f"Sending email via Resend API to {to_email}")
            
            params = {
                "from": f"Archiquest <{self.from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html_body,
                "text": text_body
            }
            
            email_response = resend.Emails.send(params)
            
            # Resend returns an object with id if successful
            if email_response and hasattr(email_response, 'id'):
                logger.info(f"✅ Email sent successfully to {to_email} (ID: {email_response.id})")
                return True, "Email sent successfully"
            elif email_response and isinstance(email_response, dict) and email_response.get('id'):
                logger.info(f"✅ Email sent successfully to {to_email} (ID: {email_response['id']})")
                return True, "Email sent successfully"
            else:
                error_msg = f"Resend API returned unexpected response: {email_response}"
                logger.error(f"Failed to send email to {to_email}: {error_msg}")
                return False, error_msg
                
        except Exception as e:
            error_msg = f"Resend API error: {str(e)}"
            logger.error(f"Failed to send email to {to_email}: {error_msg}", exc_info=True)
            return False, error_msg
    
    def send_verification_email(self, to_email: str, verification_code: str) -> Tuple[bool, str]:
        """
        Send verification code email using Resend
        Returns: (success: bool, error_message: str)
        """
        logger.info(f"Attempting to send verification email to: {to_email}")
        
        try:
            # Plain text version
            text_body = f"""Hello,

Thank you for registering with Archiquest. To complete your registration, please use the verification code below:

{verification_code}

Important:
- This code will expire in 10 minutes
- Do not share this code with anyone
- If you didn't request this verification, please ignore this email

If you have any questions, please contact our support team.

This is an automated message. Please do not reply to this email.
"""
            
            # HTML version
            html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50; text-align: center;">Email Verification</h2>
        
        <p>Hello,</p>
        
        <p>Thank you for registering with Archiquest. To complete your registration, please use the verification code below:</p>
        
        <div style="background-color: #f8f9fa; border: 2px solid #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; letter-spacing: 5px; margin: 0;">{verification_code}</h1>
        </div>
        
        <p><strong>Important:</strong></p>
        <ul>
            <li>This code will expire in 10 minutes</li>
            <li>Do not share this code with anyone</li>
            <li>If you didn't request this verification, please ignore this email</li>
        </ul>
        
        <p>If you have any questions, please contact our support team.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="text-align: center; color: #666; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
        </p>
    </div>
</body>
</html>
"""
            
            return self._send_email_via_resend(
                to_email=to_email,
                subject="Email Verification Code - Archiquest",
                text_body=text_body,
                html_body=html_body
            )
            
        except Exception as e:
            error_msg = f"Error preparing verification email: {str(e)}"
            logger.error(f"Error preparing verification email for {to_email}: {error_msg}", exc_info=True)
            return False, error_msg
    
    def send_password_reset_email(self, to_email: str, reset_code: str) -> Tuple[bool, str]:
        """
        Send password reset code email using Resend
        Returns: (success: bool, error_message: str)
        """
        logger.info(f"Attempting to send password reset email to: {to_email}")
        
        try:
            # Plain text version
            text_body = f"""Hello,

You have requested to reset your password. Please use the verification code below:

{reset_code}

Important:
- This code will expire in 10 minutes
- Do not share this code with anyone
- If you didn't request this reset, please ignore this email

This is an automated message. Please do not reply to this email.
"""
            
            # HTML version
            html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50; text-align: center;">Password Reset</h2>
        
        <p>Hello,</p>
        
        <p>You have requested to reset your password. Please use the verification code below:</p>
        
        <div style="background-color: #f8f9fa; border: 2px solid #dc3545; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #dc3545; font-size: 32px; letter-spacing: 5px; margin: 0;">{reset_code}</h1>
        </div>
        
        <p><strong>Important:</strong></p>
        <ul>
            <li>This code will expire in 10 minutes</li>
            <li>Do not share this code with anyone</li>
            <li>If you didn't request this reset, please ignore this email</li>
        </ul>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="text-align: center; color: #666; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
        </p>
    </div>
</body>
</html>
"""
            
            return self._send_email_via_resend(
                to_email=to_email,
                subject="Password Reset Code - Archiquest",
                text_body=text_body,
                html_body=html_body
            )
            
        except Exception as e:
            error_msg = f"Error preparing password reset email: {str(e)}"
            logger.error(f"Error preparing password reset email for {to_email}: {error_msg}", exc_info=True)
            return False, error_msg
