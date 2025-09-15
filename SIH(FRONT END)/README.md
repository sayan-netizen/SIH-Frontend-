# 🚨 Disaster Alert System

A comprehensive community disaster reporting system built with HTML, CSS, JavaScript, and Flask with **MongoDB backend**.

## 🌟 Features

- **Real-time Disaster Reporting** - Submit disaster reports with photos and GPS location
- **Mobile-Responsive Design** - Works perfectly on all devices
- **GPS Location Integration** - Automatic location detection and address lookup
- **User Authentication** - Secure login/register system with password hashing
- **MongoDB Database** - Scalable NoSQL database for data persistence
- **Reports Dashboard** - View, filter, and manage disaster reports
- **Admin Panel** - User management and system statistics
- **Dark Mode** - Complete theme switching with user preferences
- **Community-Driven** - Built for community collaboration and safety

## 🚀 Quick Start

### Prerequisites
- **Python 3.12+**
- **MongoDB** (Local or MongoDB Atlas)

### Installation

1. **Install Python** (if not already installed)
   - Download from [python.org](https://python.org)
   - Make sure to check "Add Python to PATH" during installation

2. **Set up MongoDB**
   - **Local**: Install MongoDB Community Server
   - **Cloud**: Create free MongoDB Atlas account
   - See `MONGODB_SETUP.md` for detailed instructions

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Initialize database**
   ```bash
   python setup_mongodb.py
   ```
   This creates sample data and admin user: `admin@disaster-alert.com` / `admin123`

5. **Start the application**
   ```bash
   python app.py
   ```

6. **Open your browser**
   - Go to: `http://localhost:5000`
   - Test health: `http://localhost:5000/api/health`

### Environment Configuration

For MongoDB Atlas or custom MongoDB:
```bash
# Windows PowerShell
$env:MONGO_URI = "mongodb+srv://username:password@cluster.mongodb.net/disaster_alert_db"

# macOS/Linux  
export MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/disaster_alert_db"
```

## 📁 Project Structure

```
SIH(FRONT END)/
├── app.py                 # Flask server application
├── requirements.txt       # Python dependencies
├── run_server.bat        # Easy startup script
├── index.html            # Main disaster reporting page
├── home.html             # User dashboard
├── new-post.html         # Alternative reporting form
├── pages/
│   ├── auth/
│   │   ├── login.html    # User login
│   │   └── register.html # User registration
│   ├── info/
│   │   ├── about.html    # About page
│   │   └── contact.html  # Contact form
│   └── reports.html      # View all reports
├── css/                  # Stylesheets
├── js/                   # JavaScript files
├── fonts/               # Custom fonts
└── images/              # Images and assets
```

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Backend**: Python Flask 2.3.3
- **Database**: MongoDB with PyMongo
- **Security**: bcrypt password hashing
- **APIs**: Geolocation API, OpenStreetMap Nominatim
- **Icons**: Font Awesome
- **Fonts**: Google Fonts (Roboto, Source Sans Pro)

## 📱 Key Features

### 🗺️ GPS Location
- Automatic location detection
- Reverse geocoding for addresses
- Interactive location selection

### 📸 Photo Upload
- Multiple photo uploads
- Image preview functionality
- File validation

### 🔐 Secure Authentication
- Password hashing with bcrypt
- Session management
- User verification system
- Admin/Citizen role separation

### 📊 MongoDB Database
- Scalable NoSQL data storage
- Real-time report persistence
- User account management
- Contact form storage
- Advanced querying and filtering

### � Admin Dashboard
- System statistics
- User management
- Report status updates
- Contact message handling

## 🔧 Development

### Database Collections

- **reports**: Disaster reports with geolocation
- **users**: User accounts with secure passwords  
- **contacts**: Contact form submissions

### API Endpoints

#### Reports
- `GET /api/reports` - Fetch disaster reports (with filtering/pagination)
- `POST /api/reports` - Submit new disaster report
- `GET /api/reports/<id>` - Get specific report
- `PATCH /api/reports/<id>/status` - Update report status

#### Authentication  
- `POST /api/auth/login` - User login with password verification
- `POST /api/auth/register` - User registration with password hashing
- `POST /api/auth/verify/<user_id>` - Verify user account

#### System
- `GET /api/health` - Database connection and health check
- `GET /api/stats` - System statistics and analytics
- `GET /api/users` - User management (admin)
- `GET /api/contact` - Contact messages (admin)

### Local Development

1. Install dependencies: `pip install -r requirements.txt`
2. Set up MongoDB: `python setup_mongodb.py`
3. Run server: `python app.py`
4. Access at: `http://localhost:5000`
5. Debug mode enabled for development

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt
- **Input Validation**: Server-side validation
- **XSS Protection**: Sanitized inputs
- **Database Indexes**: Optimized queries
- **Error Handling**: Comprehensive error management

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 📞 Support

For technical support or questions, visit the Contact page or submit an issue.

---

**Built for Smart India Hackathon 2025** 🇮🇳
