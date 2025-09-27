#!/usr/bin/env python3
"""
Test script for email verification functionality.
Run this script to test if your email configuration is working correctly.
"""

import os
import sys
from dotenv import load_dotenv
from services.email_service import EmailService

def test_email_configuration():
    """Test if email configuration is properly set up"""
    load_dotenv()
    
    # Check environment variables
    required_vars = ['SMTP_SERVER', 'SMTP_USERNAME', 'SMTP_PASSWORD', 'FROM_EMAIL']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print("❌ Missing environment variables:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease add these to your .env file")
        return False
    
    print("✅ All required environment variables are set")
    return True

def test_email_sending():
    """Test sending a verification email"""
    try:
        email_service = EmailService()
        
        # Test email (change this to your email for testing)
        test_email = input("Enter your email address for testing: ").strip()
        
        if not test_email:
            print("❌ No email provided")
            return False
        
        print(f"📧 Sending test verification email to: {test_email}")
        
        # Generate and send test code
        test_code = email_service.generate_verification_code()
        success = email_service.send_verification_email(test_email, test_code)
        
        if success:
            print("✅ Test email sent successfully!")
            print(f"📝 Test verification code: {test_code}")
            print("📬 Check your email inbox (and spam folder)")
            return True
        else:
            print("❌ Failed to send test email")
            return False
            
    except Exception as e:
        print(f"❌ Error testing email: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🧪 Email Verification Test Script")
    print("=" * 40)
    
    # Test configuration
    if not test_email_configuration():
        sys.exit(1)
    
    print()
    
    # Test email sending
    if not test_email_sending():
        sys.exit(1)
    
    print()
    print("🎉 All tests passed! Email verification is ready to use.")
    print()
    print("Next steps:")
    print("1. Run the SQL schema in Supabase")
    print("2. Start your backend server")
    print("3. Test the registration flow")

if __name__ == "__main__":
    main()

