import os
import random
import string
import logging
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv
from typing import Optional, Tuple

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class EmailService:
    def __init__(self):
        # Brevo Configuration
        self.brevo_api_key = os.getenv("BREVO_API_KEY")
        self.from_email = os.getenv("FROM_EMAIL", "aarchiquest@gmail.com")
        self.brevo_api_url = "https://api.brevo.com/v3/smtp/email"
        
        # Debug logging
        logger.info(f"Initializing EmailService (Brevo)...")
        logger.info(f"BREVO_API_KEY found: {bool(self.brevo_api_key)}")
        if self.brevo_api_key:
            logger.info(f"BREVO_API_KEY length: {len(self.brevo_api_key)}")
            logger.info(f"BREVO_API_KEY prefix: {self.brevo_api_key[:10] + '...' if len(self.brevo_api_key) > 10 else 'Not set'}")
        logger.info(f"FROM_EMAIL: {self.from_email}")
        
        # Validate configuration
        if not self.brevo_api_key:
            logger.warning("⚠️ BREVO_API_KEY not configured. Email sending will fail.")
            logger.warning("Please set BREVO_API_KEY in environment variables")
        else:
            logger.info("✅ Brevo configuration loaded successfully")
        
    def generate_verification_code(self) -> str:
        """Generate a 6-digit verification code"""
        return ''.join(random.choices(string.digits, k=6))
    
    def _send_email_via_brevo(
        self, 
        to_email: str, 
        subject: str, 
        text_body: str, 
        html_body: str
    ) -> Tuple[bool, str]:
        """
        Send email via Brevo API
        Returns: (success: bool, error_message: str)
        """
        if not self.brevo_api_key:
            error_msg = "Brevo API key not configured. Please set BREVO_API_KEY environment variable."
            logger.error(error_msg)
            return False, error_msg
        
        try:
            logger.info(f"Sending email via Brevo API to {to_email}")
            
            headers = {
                "accept": "application/json",
                "api-key": self.brevo_api_key,
                "content-type": "application/json"
            }
            
            payload = {
                "sender": {
                    "name": "Archiquest",
                    "email": self.from_email
                },
                "to": [
                    {
                        "email": to_email
                    }
                ],
                "subject": subject,
                "htmlContent": html_body,
                "textContent": text_body
            }
            
            response = requests.post(self.brevo_api_url, json=payload, headers=headers)
            
            if response.status_code == 201:
                response_data = response.json()
                message_id = response_data.get("messageId", "unknown")
                logger.info(f"✅ Email sent successfully to {to_email} (Message ID: {message_id})")
                return True, "Email sent successfully"
            else:
                error_msg = f"Brevo API error: {response.status_code} - {response.text}"
                logger.error(f"Failed to send email to {to_email}: {error_msg}")
                return False, error_msg
                
        except Exception as e:
            error_msg = f"Brevo API error: {str(e)}"
            logger.error(f"Failed to send email to {to_email}: {error_msg}", exc_info=True)
            return False, error_msg
    
    def send_verification_email(self, to_email: str, verification_code: str) -> Tuple[bool, str]:
        """
        Send verification code email using Brevo
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
            
            return self._send_email_via_brevo(
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
        Send password reset code email using Brevo
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
            
            return self._send_email_via_brevo(
                to_email=to_email,
                subject="Password Reset Code - Archiquest",
                text_body=text_body,
                html_body=html_body
            )
            
        except Exception as e:
            error_msg = f"Error preparing password reset email: {str(e)}"
            logger.error(f"Error preparing password reset email for {to_email}: {error_msg}", exc_info=True)
            return False, error_msg
