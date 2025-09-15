#!/usr/bin/env python3
"""
Quick Gmail SMTP test to verify App Password works
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def test_gmail_smtp():
    """Test Gmail SMTP connection with App Password"""
    
    # Gmail SMTP settings
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    username = "smartindiahackathon72@gmail.com"
    password = "mkgqmdrtgmftdhuc"
    
    print(f"🔧 Testing Gmail SMTP: {username}")
    print(f"📧 Server: {smtp_server}:{smtp_port}")
    print(f"🔑 Password length: {len(password)} characters")
    
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = username
        msg['To'] = username
        msg['Subject'] = "Gmail SMTP Test - App Password Verification"
        
        body = """
        This is a test email to verify Gmail SMTP works with App Password.
        
        If you receive this email, the configuration is working correctly!
        
        Timestamp: """ + str(__import__('datetime').datetime.now())
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Connect to Gmail SMTP server
        print("📡 Connecting to Gmail SMTP server...")
        server = smtplib.SMTP(smtp_server, smtp_port)
        
        # Enable security
        print("🔒 Starting TLS encryption...")
        server.starttls()
        
        # Login
        print("🔐 Authenticating with App Password...")
        server.login(username, password)
        
        # Send email
        print("📤 Sending test email...")
        server.send_message(msg)
        
        # Close connection
        server.quit()
        
        print("✅ SUCCESS: Email sent successfully!")
        print(f"📬 Check your inbox: {username}")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        print(f"❌ AUTHENTICATION FAILED: {e}")
        print("🔧 Solution: Verify App Password is correct")
        return False
        
    except smtplib.SMTPException as e:
        print(f"❌ SMTP ERROR: {e}")
        return False
        
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {e}")
        return False

if __name__ == "__main__":
    print("=" * 50)
    print("📧 Gmail SMTP Test with App Password")
    print("=" * 50)
    
    success = test_gmail_smtp()
    
    print("\n" + "=" * 50)
    if success:
        print("✅ RESULT: Gmail SMTP is working correctly!")
    else:
        print("❌ RESULT: Gmail SMTP authentication failed!")
    print("=" * 50)