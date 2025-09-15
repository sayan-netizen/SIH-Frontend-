#!/usr/bin/env python3
"""
SendGrid Email Test Script
Quick test for SendGrid email functionality
"""

import os
import sys
from datetime import datetime

def test_sendgrid_config():
    """Test SendGrid configuration"""
    print("🧪 SendGrid Configuration Test")
    print("=" * 40)
    
    # Check environment variables
    sendgrid_key = os.environ.get('SENDGRID_API_KEY', '')
    admin_email = os.environ.get('ADMIN_EMAIL', 'smartindiahackathon72@gmail.com')
    system_email = os.environ.get('SYSTEM_EMAIL', 'smartindiahackathon72@gmail.com')
    
    print(f"📧 Admin Email: {admin_email}")
    print(f"🔧 System Email: {system_email}")
    print(f"🔑 SendGrid API Key: {'Set' if sendgrid_key else 'NOT SET'}")
    
    if sendgrid_key:
        if sendgrid_key.startswith('SG.'):
            print("✅ SendGrid API key format looks correct")
        else:
            print("⚠️  Warning: SendGrid API key should start with 'SG.'")
        
        # Test length (typical SendGrid keys are 69 characters)
        if len(sendgrid_key) > 50:
            print(f"✅ API key length looks good ({len(sendgrid_key)} chars)")
        else:
            print(f"⚠️  API key seems short ({len(sendgrid_key)} chars)")
    else:
        print("❌ SendGrid API key not found")
        print("\n🔧 To set up SendGrid:")
        print("1. Get API key: https://app.sendgrid.com/settings/api_keys")
        print("2. Set: $env:SENDGRID_API_KEY='SG.your-api-key'")
        return False
    
    return True

def test_sendgrid_smtp():
    """Test SendGrid SMTP connection"""
    try:
        print("\n🔌 Testing SendGrid SMTP Connection...")
        
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        
        sendgrid_key = os.environ.get('SENDGRID_API_KEY')
        admin_email = os.environ.get('ADMIN_EMAIL', 'smartindiahackathon72@gmail.com')
        
        # Create test message
        msg = MIMEMultipart()
        msg['From'] = admin_email
        msg['To'] = admin_email
        msg['Subject'] = '✅ SendGrid Test - Disaster Alert System'
        
        body = f"""
        This is a test email sent via SendGrid SMTP.
        
        If you receive this, your SendGrid configuration is working correctly!
        
        Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        Server: SendGrid SMTP (smtp.sendgrid.net:587)
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Connect to SendGrid SMTP
        server = smtplib.SMTP('smtp.sendgrid.net', 587)
        server.starttls()
        server.login('apikey', sendgrid_key)
        
        # Send email
        text = msg.as_string()
        server.sendmail(admin_email, admin_email, text)
        server.quit()
        
        print("✅ SendGrid SMTP test successful!")
        print(f"📧 Test email sent to: {admin_email}")
        print("📥 Check your inbox/spam folder")
        
        return True
        
    except Exception as e:
        print(f"❌ SendGrid SMTP test failed: {e}")
        return False

def main():
    print("🚀 SendGrid Email Test Utility")
    print("Testing SendGrid configuration and connectivity...\n")
    
    # Test configuration
    config_ok = test_sendgrid_config()
    
    if not config_ok:
        sys.exit(1)
    
    # Test SMTP connection
    test_choice = input("\n🧪 Test SendGrid SMTP connection? (y/n): ").strip().lower()
    if test_choice == 'y':
        smtp_ok = test_sendgrid_smtp()
        
        if smtp_ok:
            print("\n🎉 SendGrid setup complete!")
            print("   Your Flask app should now be able to send emails.")
        else:
            print("\n❌ SendGrid SMTP test failed")
            print("   Check your API key and network connection.")
    else:
        print("\n✅ Configuration test complete")
        print("   Start your Flask app to begin sending emails.")

if __name__ == "__main__":
    main()