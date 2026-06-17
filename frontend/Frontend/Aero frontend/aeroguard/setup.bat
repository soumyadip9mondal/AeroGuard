@echo off
echo ═══════════════════════════════════════
echo   AeroGuard — Project Setup
echo ═══════════════════════════════════════
echo.

cd /d "%~dp0"

echo [1/4] Cleaning up legacy routes...
if exist "src\app\(app)" (
    rmdir /s /q "src\app\(app)"
    echo Legacy routes removed.
) else (
    echo Legacy routes already cleaned.
)

echo.
echo [2/4] Installing dependencies...
call npm install

echo.
echo [3/4] Build check...
call npx next lint 2>nul

echo.
echo [4/4] Starting development server...
echo.
echo ═══════════════════════════════════════
echo   Open http://localhost:3000
echo ═══════════════════════════════════════
echo.
call npm run dev
