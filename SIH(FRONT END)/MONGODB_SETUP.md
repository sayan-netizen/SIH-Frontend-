# MongoDB Setup Guide for Disaster Alert System

This guide helps you set up MongoDB for the Disaster Alert System.

## Option 1: Install MongoDB Locally (Recommended for Development)

### Windows:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. MongoDB will be installed as a Windows service and start automatically
4. Default connection: `mongodb://localhost:27017`

### macOS (using Homebrew):
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community
```

### Ubuntu/Debian:
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Option 2: Use MongoDB Atlas (Cloud)

1. Go to https://www.mongodb.com/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Create a database user
5. Add your IP address to the whitelist
6. Get your connection string

Example connection string:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/disaster_alert_db?retryWrites=true&w=majority
```

## Configuration

### Local MongoDB (Default):
- No additional configuration needed
- The app will connect to `mongodb://localhost:27017/disaster_alert_db`

### MongoDB Atlas or Custom URI:
Set the environment variable:

#### Windows (PowerShell):
```powershell
$env:MONGO_URI = "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/disaster_alert_db?retryWrites=true&w=majority"
```

#### macOS/Linux:
```bash
export MONGO_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/disaster_alert_db?retryWrites=true&w=majority"
```

## Setup Database

1. Make sure MongoDB is running
2. Run the setup script:
   ```bash
   python setup_mongodb.py
   ```

This will:
- Create necessary indexes
- Add sample data
- Create an admin user (admin@disaster-alert.com / admin123)

## Verify Installation

1. Start the Flask app:
   ```bash
   python app.py
   ```

2. Visit the health check endpoint:
   ```
   http://localhost:5000/api/health
   ```

3. You should see:
   ```json
   {
     "success": true,
     "message": "Application and database are healthy",
     "database": "MongoDB connected"
   }
   ```

## Troubleshooting

### Connection Issues:
- Make sure MongoDB service is running
- Check if the port 27017 is available
- Verify your connection string
- Check firewall settings

### Permission Issues:
- Make sure the MongoDB user has proper permissions
- For Atlas, check IP whitelist and user credentials

### Common Errors:
1. `ServerSelectionTimeoutError`: MongoDB is not running or unreachable
2. `AuthenticationError`: Wrong username/password
3. `NetworkTimeout`: Network connectivity issues

## Database Collections

The application uses these collections:

1. **reports**: Disaster reports
2. **users**: User accounts
3. **contacts**: Contact form submissions

## Admin Features

Use the admin account to:
- View all reports and manage their status
- View registered users
- Access contact messages
- View system statistics

Access admin endpoints at:
- `/api/stats` - System statistics
- `/api/users` - User management
- `/api/contact` - Contact messages

## Production Deployment

For production:
1. Use MongoDB Atlas or a properly secured MongoDB instance
2. Set strong passwords
3. Enable authentication and authorization
4. Use SSL/TLS encryption
5. Set up proper backup strategies
6. Monitor database performance