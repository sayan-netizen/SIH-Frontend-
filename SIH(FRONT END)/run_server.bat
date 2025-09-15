@echo off
echo Installing Flask dependencies...
pip install -r requirements.txt

echo.
echo Starting Disaster Alert System...
echo Open your browser and go to: http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

python app.py
pause