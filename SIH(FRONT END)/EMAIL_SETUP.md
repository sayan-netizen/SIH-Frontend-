# Email Configuration Setup Guide

## Gmail SMTP Configuration

To enable email functionality for the contact form, you need to configure Gmail SMTP settings.

### Step 1: Enable Gmail App Password

1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification (enable if not already enabled)
3. Go to Security > App passwords
4. Generate a new app password for "Disaster Alert System"
5. Copy the 16-character app password

### Step 2: Set Environment Variables

#### Option 1: Using Environment Variables (Recommended for Production)
```bash
# Windows (PowerShell)
$env:MAIL_USERNAME = "smartindiahackathon72@gmail.com"
$env:MAIL_PASSWORD = "your-16-character-app-password"

# Linux/Mac
export MAIL_USERNAME="smartindiahackathon72@gmail.com"
export MAIL_PASSWORD="your-16-character-app-password"
```

#### Option 2: Update app.py directly (For Testing)
```python
# In app.py, update the email configuration:
app.config['MAIL_USERNAME'] = 'smartindiahackathon72@gmail.com'
app.config['MAIL_PASSWORD'] = 'your-16-character-app-password'
```

### Step 3: Test Configuration

Run this test to verify email setup:
```python
python -c "
import requests, json
data = {
    'contactName': 'Test User', 
    'contactEmail': 'test@example.com', 
    'subject': 'support', 
    'message': 'This is a test email to verify admin email delivery'
}
r = requests.post('http://127.0.0.1:5000/api/contact', json=data)
result = r.json()
print('Email Delivered:', result.get('emailDelivered', False))
print('Message:', result.get('message', 'No message'))
"
```

## Email Settings Configuration

Current settings in app.py:
- **SMTP Server**: smtp.gmail.com
- **Port**: 587 (TLS)
- **Admin Email**: smartindiahackathon72@gmail.com
- **System Email**: smartindiahackathon72@gmail.com

## Troubleshooting

### Common Issues:

1. **"Authentication failed" error**
   - Ensure 2-Step Verification is enabled
   - Use App Password, not regular Gmail password
   - Check username is correct

2. **"Connection refused" error**
   - Check internet connection
   - Verify SMTP server and port
   - Check firewall settings

3. **Email not delivered**
   - Check spam/junk folder
   - Verify admin email address
   - Check Gmail sent items

### Test Email Functionality
```python
# Test email sending capability
from flask_mail import Message
from app import mail, ADMIN_EMAIL

def test_email():
    try:
        msg = Message(
            subject='Test Email - Disaster Alert System',
            recipients=[ADMIN_EMAIL]
        )
        msg.body = 'This is a test email to verify SMTP configuration.'
        mail.send(msg)
        print("✅ Test email sent successfully!")
        return True
    except Exception as e:
        print(f"❌ Email test failed: {e}")
        return False
```

## Security Notes

- Never commit passwords to version control
- Use environment variables for sensitive data
- Consider using OAuth2 for production environments
- Regularly rotate app passwords

## Production Recommendations

1. Use a dedicated email service (SendGrid, AWS SES, etc.)
2. Implement email queuing for high volume
3. Add email templates and styling
4. Set up email monitoring and logging
5. Configure proper error handling and retries