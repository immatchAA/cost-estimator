#!/usr/bin/env python3
"""
Test script to debug the API email verification endpoint
"""

import requests
import json

def test_verification_endpoint():
    url = "http://127.0.0.1:8000/verification/send-code"
    
    # Test data
    test_email = "akosikyle505@gmail.com"  # Use your email for testing
    
    payload = {
        "email": test_email
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"Testing verification endpoint: {url}")
    print(f"Email: {test_email}")
    print()
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Text: {response.text}")
        
        if response.status_code == 200:
            print("✅ Verification code sent successfully!")
        else:
            print("❌ Failed to send verification code")
            try:
                error_data = response.json()
                print(f"Error details: {error_data}")
            except:
                print("Could not parse error response as JSON")
                
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the server is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_verification_endpoint()

