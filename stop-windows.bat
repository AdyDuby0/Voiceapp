@echo off
setlocal
cd /d "%~dp0"

echo Stopping the voice server ...
docker compose down

echo.
echo Done. The app itself stops when you close its window
echo (the one running start-windows.bat).
echo.
pause
endlocal
