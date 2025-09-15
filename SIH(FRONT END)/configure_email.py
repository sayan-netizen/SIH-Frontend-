#!/usr/bin/env python3
"""
Quick Email Configuration Helper
Run this script to set up email configuration for the Disaster Alert System
"""

import os
import requests
import json

def setup_email_config():
    """Interactive email configuration setup"""
    print("🔧 Disaster Alert System - Email Configuration")
    print("=" * 50)
    
    # Get Gmail credentials
    print("\n📧 Gmail Configuration:")
    print("1. Ensure 2-Step Verification is enabled on your Gmail account")
    print("2. Go to Google Account > Security > App passwords")
    print("3. Generate an app password for 'Disaster Alert System'")
    
    email = input("\nEnter Gmail address [smartindiahackathon72@gmail.com]: ").strip()
    if not email:
        email = "smartindiahackathon72@gmail.com"
    
    app_password = input("Enter 16-character App Password: ").strip().replace(" ", "")
    
    if len(app_password) != 16:
        print("❌ Invalid app password length. Should be 16 characters.")
        return False
    
    # Set environment variables
    os.environ['MAIL_USERNAME'] = email
    os.environ['MAIL_PASSWORD'] = app_password
    
    print(f"\n✅ Configuration set for {email}")
    print("🔄 Restart your Flask app to apply changes")
    
    # Test the configuration
    test_now = input("\nTest email configuration now? (y/n): ").strip().lower()
    if test_now == 'y':
        return test_email_config()
    
    return True

def test_email_config():
    """Test email configuration by sending a test email"""
    print("\n📨 Testing email configuration...")
    
    try:
        # Test via API endpoint
        response = requests.post('http://127.0.0.1:5000/api/test-email', timeout=30)
        result = response.json()
        
        if result.get('success'):
            print("✅ Test email sent successfully!")
            print(f"📧 Email delivered to: {result.get('adminEmail')}")
            print("📥 Check your inbox/spam folder")
        else:
            print("❌ Test email failed:")
            print(f"   Error: {result.get('error')}")
            print("   Check server console for detailed error messages")
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection error: Make sure Flask app is running on http://127.0.0.1:5000")
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    
    return True

def show_manual_config():
    """Show manual configuration instructions"""
    print("\n📋 Manual Configuration Instructions:")
    print("=" * 40)
    
    print("\n1. Set Environment Variables (Windows PowerShell):")
    print('   $env:MAIL_USERNAME = "smartindiahackathon72@gmail.com"')
    print('   $env:MAIL_PASSWORD = "your-16-char-app-password"')
    
    print("\n2. Or Update app.py directly:")
    print("   Find the email configuration section and update:")
    print("   app.config['MAIL_USERNAME'] = 'smartindiahackathon72@gmail.com'")
    print("   app.config['MAIL_PASSWORD'] = 'your-16-char-app-password'")
    
    print("\n3. Restart Flask app and test with:")
    print("   curl -X POST http://127.0.0.1:5000/api/test-email")

def main():
    print("🚀 Email Configuration Helper")
    print("Choose an option:")
    print("1. Interactive setup")
    print("2. Test current configuration")
    print("3. Show manual configuration")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == '1':
        setup_email_config()
    elif choice == '2':
        test_email_config()
    elif choice == '3':
        show_manual_config()
    else:
        print("❌ Invalid choice")

if __name__ == '__main__':
    main()