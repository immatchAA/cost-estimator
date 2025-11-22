import os
import random
import string
import logging
import smtplib
from datetime import datetime, timedelta
from dotenv import load_dotenv
from typing import Optional, Tuple
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class EmailService:
    def __init__(self):
        # SMTP Configuration
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        
        # Debug logging
        logger.info(f"Initializing EmailService (SMTP)...")
        logger.info(f"SMTP_SERVER: {self.smtp_server}")
        logger.info(f"SMTP_PORT: {self.smtp_port}")
        logger.info(f"SMTP_USERNAME: {self.smtp_username if self.smtp_username else 'Not set'}")
        logger.info(f"SMTP_PASSWORD: {'*' * len(self.smtp_password) if self.smtp_password else 'Not set'}")
        logger.info(f"FROM_EMAIL: {self.from_email}")
        
        # Validate configuration
        if not self.smtp_username or not self.smtp_password:
            logger.warning("⚠️ SMTP credentials not fully configured. Email sending may fail.")
            logger.warning("Please set SMTP_USERNAME and SMTP_PASSWORD in Railway environment variables")
        else:
            logger.info("✅ SMTP configuration loaded successfully")
        
    def generate_verification_code(self) -> str:
        """Generate a 6-digit verification code"""
        return ''.join(random.choices(string.digits, k=6))
    
    def _send_email_via_smtp(
        self, 
        to_email: str, 
        subject: str, 
        text_body: str, 
        html_body: str
    ) -> Tuple[bool, str]:
        """
        Send email via SMTP
        Returns: (success: bool, error_message: str)
        """
        if not self.smtp_username or not self.smtp_password:
            error_msg = "SMTP credentials not configured. Please set SMTP_USERNAME and SMTP_PASSWORD environment variables."
            logger.error(error_msg)
            return False, error_msg
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = subject
            
            # Add both plain text and HTML versions
            part1 = MIMEText(text_body, 'plain')
            part2 = MIMEText(html_body, 'html')
            
            msg.attach(part1)
            msg.attach(part2)
            
            # Connect to SMTP server and send
            logger.info(f"Connecting to SMTP server {self.smtp_server}:{self.smtp_port}")
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()  # Enable TLS encryption
            logger.info("TLS enabled, authenticating...")
            server.login(self.smtp_username, self.smtp_password)
            logger.info("Authentication successful, sending email...")
            
            text = msg.as_string()
            server.sendmail(self.from_email, to_email, text)
            server.quit()
            
            logger.info(f"✅ Email sent successfully to {to_email}")
            return True, "Email sent successfully"
            
        except smtplib.SMTPAuthenticationError as e:
            error_msg = f"SMTP authentication failed: {str(e)}. Please check your SMTP_USERNAME and SMTP_PASSWORD."
            logger.error(f"Failed to send email to {to_email}: {error_msg}")
            return False, error_msg
        except smtplib.SMTPRecipientsRefused as e:
            error_msg = f"Invalid recipient email address: {str(e)}"
            logger.error(f"Failed to send email to {to_email}: {error_msg}")
            return False, error_msg
        except smtplib.SMTPServerDisconnected as e:
            error_msg = f"SMTP server disconnected: {str(e)}. Please check SMTP_SERVER and SMTP_PORT."
            logger.error(f"Failed to send email to {to_email}: {error_msg}")
            return False, error_msg
        except Exception as e:
            error_msg = f"SMTP error: {str(e)}"
            logger.error(f"Failed to send email to {to_email}: {error_msg}", exc_info=True)
            return False, error_msg
    
    def send_verification_email(self, to_email: str, verification_code: str) -> Tuple[bool, str]:
        """
        Send verification code email using SMTP
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
            
            return self._send_email_via_smtp(
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
        Send password reset code email using SMTP
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
            
            return self._send_email_via_smtp(
                to_email=to_email,
                subject="Password Reset Code - Archiquest",
                text_body=text_body,
                html_body=html_body
            )
            
        except Exception as e:
            error_msg = f"Error preparing password reset email: {str(e)}"
            logger.error(f"Error preparing password reset email for {to_email}: {error_msg}", exc_info=True)
            return False, error_msg
