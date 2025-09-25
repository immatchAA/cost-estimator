#!/usr/bin/env python3
"""
Simple debug script to test email functionality
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

def test_email_debug():
    load_dotenv()
    
    print("=== Email Configuration Debug ===")
    print(f"SMTP_SERVER: {os.getenv('SMTP_SERVER')}")
    print(f"SMTP_PORT: {os.getenv('SMTP_PORT')}")
    print(f"SMTP_USERNAME: {os.getenv('SMTP_USERNAME')}")
    print(f"SMTP_PASSWORD: {'*' * len(os.getenv('SMTP_PASSWORD', ''))}")
    print(f"FROM_EMAIL: {os.getenv('FROM_EMAIL')}")
    print()
    
    try:
        # Test SMTP connection
        print("Testing SMTP connection...")
        server = smtplib.SMTP(os.getenv('SMTP_SERVER'), int(os.getenv('SMTP_PORT')))
        print("✅ SMTP connection established")
        
        # Test STARTTLS
        print("Testing STARTTLS...")
        server.starttls()
        print("✅ STARTTLS enabled")
        
        # Test authentication
        print("Testing authentication...")
        server.login(os.getenv('SMTP_USERNAME'), os.getenv('SMTP_PASSWORD'))
        print("✅ Authentication successful")
        
        # Test sending email
        print("Testing email sending...")
        msg = MIMEMultipart()
        msg['From'] = os.getenv('FROM_EMAIL')
        msg['To'] = os.getenv('SMTP_USERNAME')  # Send to self for testing
        msg['Subject'] = "Test Email - Architectural AI Cost Estimator"
        
        body = "This is a test email to verify SMTP configuration."
        msg.attach(MIMEText(body, 'plain'))
        
        text = msg.as_string()
        server.sendmail(os.getenv('FROM_EMAIL'), os.getenv('SMTP_USERNAME'), text)
        print("✅ Test email sent successfully!")
        
        server.quit()
        print("✅ SMTP connection closed")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_email_debug()

