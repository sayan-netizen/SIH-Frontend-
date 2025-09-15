# Email Configuration Fix for Disaster Alert System

## 🚨 Current Issue
The email functionality is not working because the Gmail password is set to a regular password instead of a Gmail App Password.

## 🔧 Quick Fix Instructions

### Step 1: Generate Gmail App Password

1. **Go to your Google Account**: https://myaccount.google.com/
2. **Security Section** → **2-Step Verification** (must be enabled)
3. **App passwords** → **Select app: Mail** → **Select device: Other**
4. **Enter name**: "Disaster Alert System"
5. **Copy the 16-character password** (format: abcd efgh ijkl mnop)

### Step 2: Configure Application

#### Option A: Environment Variables (Recommended)
```powershell
# Windows PowerShell
$env:MAIL_USERNAME = "smartindiahackathon72@gmail.com"
$env:MAIL_PASSWORD = "your-16-character-app-password"
python app.py
```

#### Option B: Direct Configuration
Edit `app.py` line ~28:
```python
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD', 'YOUR-16-CHAR-APP-PASSWORD')
```

### Step 3: Test Email Functionality

1. Start the server: `python app.py`
2. Visit: http://localhost:5000/pages/info/contact.html
3. Fill out the contact form
4. Check the admin email inbox

## 🧪 Email Test Commands

```bash
# Test via API
curl -X POST http://localhost:5000/api/test-email

# Test contact form
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"contactName":"Test User","contactEmail":"test@example.com","subject":"support","message":"Test message"}'
```

## ✅ Success Indicators

- Console shows: "✅ Email configuration appears valid"  
- Contact form shows: "Message sent successfully"
- Admin receives email at smartindiahackathon72@gmail.com

## 📧 Current Status

**Email Address**: smartindiahackathon72@gmail.com  
**Password Type**: ❌ Regular password (invalid)  
**Required**: ✅ 16-character Gmail App Password

## 🔗 Helpful Links

- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [2-Step Verification Setup](https://support.google.com/accounts/answer/185839)
- [SMTP Settings for Gmail](https://support.google.com/mail/answer/7126229)

---

**Priority**: 🔴 **HIGH** - Email functionality is completely broken without proper App Password

**Estimated Fix Time**: 2-3 minutes (once App Password is generated)