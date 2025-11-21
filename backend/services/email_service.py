import smtplib
import os
import random
import string
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from typing import Optional, Tuple

load_dotenv()

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        
    def generate_verification_code(self) -> str:
        """Generate a 6-digit verification code"""
        return ''.join(random.choices(string.digits, k=6))
    
    def send_verification_email(self, to_email: str, verification_code: str) -> Tuple[bool, str]:
        """
        Send verification code email
        Returns: (success: bool, error_message: str)
        """
        try:
            # Validate SMTP configuration
            if not self.smtp_username or not self.smtp_password:
                return False, "SMTP credentials not configured"
            
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = "Email Verification Code - Architectural AI Cost Estimator"
            
            # Email body
            body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50; text-align: center;">Email Verification</h2>
                    
                    <p>Hello,</p>
                    
                    <p>Thank you for registering with the Architectural AI Cost Estimator. To complete your registration, please use the verification code below:</p>
                    
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
            
            msg.attach(MIMEText(body, 'html'))
            
            # Send email with better error handling
            server = None
            try:
                # Connect to SMTP server
                server = smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=30)
                server.set_debuglevel(0)  # Set to 1 for debugging
                
                # Start TLS
                server.starttls()
                
                # Login
                server.login(self.smtp_username, self.smtp_password)
                
                # Send email
                send_result = server.sendmail(self.from_email, [to_email], msg.as_string())
                
                # Check if there were any rejected recipients
                if send_result:
                    rejected = list(send_result.keys())
                    return False, f"Email rejected by server for: {', '.join(rejected)}"
                
                return True, "Email sent successfully"
                
            except smtplib.SMTPAuthenticationError as e:
                return False, f"SMTP authentication failed: {str(e)}"
            except smtplib.SMTPRecipientsRefused as e:
                return False, f"Recipient refused by server: {str(e)}"
            except smtplib.SMTPSenderRefused as e:
                return False, f"Sender refused by server: {str(e)}"
            except smtplib.SMTPDataError as e:
                return False, f"SMTP data error: {str(e)}"
            except smtplib.SMTPConnectError as e:
                return False, f"Could not connect to SMTP server: {str(e)}"
            except smtplib.SMTPException as e:
                return False, f"SMTP error: {str(e)}"
            except Exception as e:
                return False, f"Unexpected error: {str(e)}"
            finally:
                if server:
                    try:
                        server.quit()
                    except:
                        pass
            
        except Exception as e:
            error_msg = f"Error preparing email: {str(e)}"
            print(f"Error sending email to {to_email}: {error_msg}")
            print(f"Error type: {type(e).__name__}")
            import traceback
            traceback.print_exc()
            return False, error_msg
    
    def send_password_reset_email(self, to_email: str, reset_code: str) -> Tuple[bool, str]:
        """
        Send password reset code email
        Returns: (success: bool, error_message: str)
        """
        try:
            # Validate SMTP configuration
            if not self.smtp_username or not self.smtp_password:
                return False, "SMTP credentials not configured"
            
            msg = MIMEMultipart()
            msg['From'] = self.from_email
            msg['To'] = to_email
            msg['Subject'] = "Password Reset Code - Architectural AI Cost Estimator"
            
            body = f"""
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
            
            msg.attach(MIMEText(body, 'html'))
            
            server = None
            try:
                server = smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=30)
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                send_result = server.sendmail(self.from_email, [to_email], msg.as_string())
                
                if send_result:
                    rejected = list(send_result.keys())
                    return False, f"Email rejected by server for: {', '.join(rejected)}"
                
                return True, "Email sent successfully"
                
            except smtplib.SMTPAuthenticationError as e:
                return False, f"SMTP authentication failed: {str(e)}"
            except smtplib.SMTPRecipientsRefused as e:
                return False, f"Recipient refused by server: {str(e)}"
            except smtplib.SMTPSenderRefused as e:
                return False, f"Sender refused by server: {str(e)}"
            except smtplib.SMTPDataError as e:
                return False, f"SMTP data error: {str(e)}"
            except smtplib.SMTPConnectError as e:
                return False, f"Could not connect to SMTP server: {str(e)}"
            except smtplib.SMTPException as e:
                return False, f"SMTP error: {str(e)}"
            except Exception as e:
                return False, f"Unexpected error: {str(e)}"
            finally:
                if server:
                    try:
                        server.quit()
                    except:
                        pass
            
        except Exception as e:
            error_msg = f"Error preparing email: {str(e)}"
            print(f"Error sending password reset email to {to_email}: {error_msg}")
            return False, error_msg
