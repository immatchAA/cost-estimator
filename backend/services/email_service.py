import os
import random
import string
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv
from typing import Optional, Tuple

try:
    from resend import Resend
except ImportError:
    Resend = None

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class EmailService:
    def __init__(self):
        self.resend_api_key = os.getenv("RESEND_API_KEY")
        self.from_email = os.getenv("FROM_EMAIL", "onboarding@resend.dev")
        
        # Debug logging
        logger.info(f"Initializing EmailService...")
        logger.info(f"RESEND_API_KEY found: {bool(self.resend_api_key)}")
        if self.resend_api_key:
            logger.info(f"RESEND_API_KEY length: {len(self.resend_api_key)}")
            logger.info(f"RESEND_API_KEY prefix: {self.resend_api_key[:3] if len(self.resend_api_key) >= 3 else 'N/A'}")
        logger.info(f"Resend package available: {Resend is not None}")
        logger.info(f"FROM_EMAIL: {self.from_email}")
        
        # Initialize Resend client
        if Resend and self.resend_api_key:
            try:
                self.resend = Resend(api_key=self.resend_api_key)
                logger.info("✅ Resend email service initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Resend client: {str(e)}")
                self.resend = None
        else:
            self.resend = None
            if not Resend:
                logger.error("❌ Resend package not installed. Install with: pip install resend")
            if not self.resend_api_key:
                logger.error("❌ RESEND_API_KEY not configured in environment variables")
                logger.error("Please set RESEND_API_KEY in Railway environment variables")
        
    def generate_verification_code(self) -> str:
        """Generate a 6-digit verification code"""
        return ''.join(random.choices(string.digits, k=6))
    
    def send_verification_email(self, to_email: str, verification_code: str) -> Tuple[bool, str]:
        """
        Send verification code email using Resend
        Returns: (success: bool, error_message: str)
        """
        logger.info(f"Attempting to send verification email to: {to_email}")
        
        if not self.resend:
            error_msg = "Resend email service not configured. Please set RESEND_API_KEY environment variable."
            logger.error(error_msg)
            return False, error_msg
        
        try:
            # Plain text version
            text_body = f"""Hello,

Thank you for registering with the Architectural AI Cost Estimator. To complete your registration, please use the verification code below:

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
            
            # Send email using Resend API
            logger.info(f"Sending email from {self.from_email} to {to_email}")
            
            try:
                params = {
                    "from": self.from_email,
                    "to": [to_email],
                    "subject": "Email Verification Code - Architectural AI Cost Estimator",
                    "html": html_body,
                    "text": text_body
                }
                
                result = self.resend.emails.send(params)
                
                if result and hasattr(result, 'id'):
                    logger.info(f"✅ Email sent successfully to {to_email} (Resend ID: {result.id})")
                    print(f"✅ Email sent successfully to {to_email}")
                    return True, "Email sent successfully"
                elif result and isinstance(result, dict) and result.get('id'):
                    logger.info(f"✅ Email sent successfully to {to_email} (Resend ID: {result.get('id')})")
                    print(f"✅ Email sent successfully to {to_email}")
                    return True, "Email sent successfully"
                else:
                    error_msg = f"Unexpected response from Resend: {result}"
                    logger.error(f"Resend API returned unexpected response: {error_msg}")
                    return False, error_msg
                    
            except Exception as e:
                error_msg = f"Resend API error: {str(e)}"
                logger.error(f"Failed to send email to {to_email}: {error_msg}", exc_info=True)
                return False, error_msg
            
        except Exception as e:
            error_msg = f"Error preparing email: {str(e)}"
            logger.error(f"Error preparing email for {to_email}: {error_msg}", exc_info=True)
            print(f"Error sending email to {to_email}: {error_msg}")
            return False, error_msg
    
    def send_password_reset_email(self, to_email: str, reset_code: str) -> Tuple[bool, str]:
        """
        Send password reset code email using Resend
        Returns: (success: bool, error_message: str)
        """
        logger.info(f"Attempting to send password reset email to: {to_email}")
        
        if not self.resend:
            error_msg = "Resend email service not configured. Please set RESEND_API_KEY environment variable."
            logger.error(error_msg)
            return False, error_msg
        
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
            
            # Send email using Resend API
            logger.info(f"Sending password reset email from {self.from_email} to {to_email}")
            
            try:
                params = {
                    "from": self.from_email,
                    "to": [to_email],
                    "subject": "Password Reset Code - Architectural AI Cost Estimator",
                    "html": html_body,
                    "text": text_body
                }
                
                result = self.resend.emails.send(params)
                
                if result and hasattr(result, 'id'):
                    logger.info(f"✅ Password reset email sent successfully to {to_email} (Resend ID: {result.id})")
                    print(f"✅ Password reset email sent successfully to {to_email}")
                    return True, "Email sent successfully"
                elif result and isinstance(result, dict) and result.get('id'):
                    logger.info(f"✅ Password reset email sent successfully to {to_email} (Resend ID: {result.get('id')})")
                    print(f"✅ Password reset email sent successfully to {to_email}")
                    return True, "Email sent successfully"
                else:
                    error_msg = f"Unexpected response from Resend: {result}"
                    logger.error(f"Resend API returned unexpected response: {error_msg}")
                    return False, error_msg
                    
            except Exception as e:
                error_msg = f"Resend API error: {str(e)}"
                logger.error(f"Failed to send password reset email to {to_email}: {error_msg}", exc_info=True)
                return False, error_msg
            
        except Exception as e:
            error_msg = f"Error preparing password reset email: {str(e)}"
            logger.error(f"Error preparing password reset email for {to_email}: {error_msg}", exc_info=True)
            print(f"Error sending password reset email to {to_email}: {error_msg}")
            return False, error_msg
