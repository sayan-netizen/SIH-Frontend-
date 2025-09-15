# SendGrid Email Setup for Disaster Alert System

## 🚀 Quick SendGrid Setup (5 minutes)

SendGrid is more reliable than Gmail for automated emails and doesn't require App Passwords.

### Step 1: Create SendGrid Account
1. Go to https://sendgrid.com/free/
2. Sign up for a free account (100 emails/day free tier)
3. Verify your account via email

### Step 2: Generate API Key
1. Log in to https://app.sendgrid.com/
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Restricted Access**
5. Give permissions: **Mail Send** → **Full Access**
6. Click **Create & View**
7. **Copy the API key** (starts with `SG.`)

### Step 3: Set Environment Variable
```powershell
# Replace with your actual SendGrid API key
$env:SENDGRID_API_KEY = "SG.your-api-key-here"
$env:ADMIN_EMAIL = "smartindiahackathon72@gmail.com"
$env:SYSTEM_EMAIL = "smartindiahackathon72@gmail.com"

# Restart Flask app
python app.py
```

### Step 4: Test Email Delivery
```powershell
# Test via API endpoint
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/test-email" -Method Post

# Or use the contact form at:
# http://localhost:5000/pages/info/contact.html
```

## 🔧 Alternative: One-Command Setup

If you want to test quickly with a temporary SendGrid key, I can provide one:

```powershell
# Temporary test key (replace with your own for production)
$env:SENDGRID_API_KEY = "SG.test-key-please-replace"
python app.py
```

## 📊 SendGrid vs Gmail Comparison

| Feature | SendGrid | Gmail SMTP |
|---------|----------|------------|
| Setup Time | 2 minutes | 5 minutes |
| Reliability | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Daily Limit | 100 (free) | Gmail limits |
| Authentication | API Key | App Password |
| Delivery Reports | Yes | No |
| Spam Score | Lower | Higher |

## 🚨 Current Status

- ✅ Flask server running at http://localhost:5000
- ✅ SendGrid integration added to app.py  
- ⚠️ Needs SENDGRID_API_KEY environment variable
- 🧪 Ready to test once API key is set

## 📧 Email Flow

1. User submits contact form
2. Flask receives form data
3. SendGrid SMTP sends email to admin
4. Admin receives formatted email
5. User sees success confirmation

---

**Next Step**: Set `SENDGRID_API_KEY` environment variable and restart the app!