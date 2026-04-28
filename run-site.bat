@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Building...
call npm run build
if errorlevel 1 exit /b 1
echo Starting server on http://127.0.0.1:3335/
node scripts\static-server.cjs
pause
