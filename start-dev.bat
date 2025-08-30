@echo off
echo Starting Mangrove Guardian Development Environment...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm run dev"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Development servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul
