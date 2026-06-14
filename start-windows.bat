@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo    Voiceapp - Windows launcher
echo ============================================
echo.

REM --- 1. Node.js installed? ---
where node >nul 2>nul
if errorlevel 1 (
  echo [X] Node.js is not installed.
  echo     Install the LTS version from https://nodejs.org
  echo     then run this file again.
  echo.
  pause
  exit /b 1
)

REM --- 2. Docker installed? ---
where docker >nul 2>nul
if errorlevel 1 (
  echo [X] Docker is not installed.
  echo     Install Docker Desktop from:
  echo     https://www.docker.com/products/docker-desktop
  echo     then start it and run this file again.
  echo.
  pause
  exit /b 1
)

REM --- 3. Docker actually running? ---
docker info >nul 2>nul
if errorlevel 1 (
  echo [X] Docker Desktop is installed but not running.
  echo     Open Docker Desktop, wait until it says "Running",
  echo     then run this file again.
  echo.
  pause
  exit /b 1
)

REM --- 4. Config file ---
if not exist ".env.local" (
  echo [*] Creating .env.local from the template ...
  copy /y ".env.example" ".env.local" >nul
)

REM --- 5. Dependencies (first run only) ---
if not exist "node_modules" (
  echo [*] Installing dependencies. First run only - may take a minute ...
  call npm install
  if errorlevel 1 (
    echo [X] npm install failed - see the messages above.
    pause
    exit /b 1
  )
)

REM --- 6. Start the LiveKit voice server in the background ---
echo [*] Starting the voice server ...
docker compose up -d
if errorlevel 1 (
  echo [X] Could not start the voice server.
  pause
  exit /b 1
)

echo.
echo ============================================
echo    Starting the app...
echo.
echo    When you see "Ready" below, open:
echo        http://localhost:3000
echo.
echo    Keep this window OPEN while using the app.
echo    Close it (or press Ctrl+C) to stop the app.
echo    Run stop-windows.bat to stop the voice server.
echo ============================================
echo.

REM Open the browser shortly after the dev server boots.
start "" http://localhost:3000

call npm run dev

endlocal
