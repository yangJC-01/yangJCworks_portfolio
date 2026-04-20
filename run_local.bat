@echo off
title Portfolio Local Server
cd /d "%~dp0"

echo [1/2] Checking for Python...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Python found. Starting server at http://localhost:8000...
    start "" "http://localhost:8000"
    python -m http.server 8000
    goto :end
)

echo [2/2] Python not found. Checking for Node.js (npx)...
npx -v >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js found. Starting server at http://localhost:5000...
    start "" "http://localhost:5000"
    npx serve -l 5000 .
    goto :end
)

echo.
echo ! ERROR: Python or Node.js is required to run a local server.
echo ! Please install Python (https://www.python.org/) or Node.js (https://nodejs.org/).
pause

:end
