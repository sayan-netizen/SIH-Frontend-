@echo off
echo ===================================
echo  Disaster Alert System - MongoDB
echo ===================================
echo.

echo Checking Python virtual environment...
if not exist ".venv\Scripts\python.exe" (
    echo Creating virtual environment...
    python -m venv .venv
)

echo.
echo Activating virtual environment...
call .venv\Scripts\activate.bat

echo.
echo Installing/updating dependencies...
pip install -r requirements.txt

echo.
echo Testing MongoDB connection...
python -c "from pymongo import MongoClient; client = MongoClient('mongodb://localhost:27017/'); client.admin.command('ping'); print('✅ MongoDB connection successful')" 2>nul || (
    echo ❌ MongoDB connection failed!
    echo Please make sure MongoDB is running on your system.
    echo.
    echo To install MongoDB:
    echo 1. Download from: https://www.mongodb.com/try/download/community
    echo 2. Install and start the service
    echo.
    pause
    exit /b 1
)

echo.
echo Starting Flask application with MongoDB...
echo Open your browser to: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
".venv\Scripts\python.exe" app.py

pause