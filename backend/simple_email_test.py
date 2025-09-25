#!/usr/bin/env python3
"""
Simple email test without any dependencies
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def test_gmail_smtp():
    print("=== Gmail SMTP Test ===")
    
    # Gmail SMTP settings
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    username = "akosikyle505@gmail.com"
    password = "tgrq cgof feqz hrmo"
    
    print(f"Server: {smtp_server}:{smtp_port}")
    print(f"Username: {username}")
    print(f"Password: {'*' * len(password)}")
    print()
    
    try:
        # Step 1: Connect to server
        print("1. Connecting to SMTP server...")
        server = smtplib.SMTP(smtp_server, smtp_port)
        print("   ✅ Connected successfully")
        
        # Step 2: Enable TLS
        print("2. Enabling TLS...")
        server.starttls()
        print("   ✅ TLS enabled")
        
        # Step 3: Login
        print("3. Authenticating...")
        server.login(username, password)
        print("   ✅ Authentication successful")
        
        # Step 4: Create and send email
        print("4. Creating email...")
        msg = MIMEMultipart()
        msg['From'] = username
        msg['To'] = username  # Send to self
        msg['Subject'] = "Test Email from Architectural AI Cost Estimator"
        
        body = """
        This is a test email to verify that the SMTP configuration is working correctly.
        
        If you receive this email, the email verification system is ready to use!
        
        Best regards,
        Architectural AI Cost Estimator Team
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        print("5. Sending email...")
        text = msg.as_string()
        server.sendmail(username, username, text)
        print("   ✅ Email sent successfully!")
        
        # Step 5: Close connection
        print("6. Closing connection...")
        server.quit()
        print("   ✅ Connection closed")
        
        print("\n🎉 All tests passed! Check your email inbox.")
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ Authentication failed: {e}")
        print("   This usually means:")
        print("   - The app password is incorrect")
        print("   - 2-factor authentication is not enabled")
        print("   - The app password was not generated for 'Mail'")
        
    except smtplib.SMTPConnectError as e:
        print(f"❌ Connection failed: {e}")
        print("   This usually means:")
        print("   - Network connectivity issues")
        print("   - Firewall blocking SMTP")
        
    except smtplib.SMTPException as e:
        print(f"❌ SMTP error: {e}")
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        print(f"   Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_gmail_smtp()

