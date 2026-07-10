@echo off
setlocal
title MineTrack Server

cd /d "%~dp0"

echo.
echo ========================================
echo  MineTrack Server Starter
echo ========================================
echo.

if not exist ".\tools\php\php.exe" (
    echo ERROR: Portable PHP was not found at .\tools\php\php.exe
    echo.
    pause
    exit /b 1
)

if not exist ".\artisan" (
    echo ERROR: artisan was not found. Make sure this script is inside the MineTrack project folder.
    echo.
    pause
    exit /b 1
)

echo Checking for an existing server on port 8000...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$listener = Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' } | Select-Object -First 1; if ($listener) { Write-Host 'Stopping existing process on port 8000...' ; Stop-Process -Id $listener.OwningProcess -Force }"

echo.
echo Clearing Laravel config cache...
".\tools\php\php.exe" artisan config:clear
if errorlevel 1 (
    echo.
    echo ERROR: Laravel config clear failed.
    pause
    exit /b 1
)

echo.
echo Starting MineTrack...
echo.
echo Local URL:
echo   http://localhost:8000
echo.
echo Tailscale URL:
echo   http://100.115.130.43:8000
echo.
echo Login:
echo   admin@minetrack.local / password
echo.
echo Keep this window open while using MineTrack.
echo Press CTRL+C in this window to stop the server.
echo.

".\tools\php\php.exe" artisan serve --host=0.0.0.0 --port=8000

echo.
echo MineTrack server stopped.
pause
