@echo off
echo ========================================
echo    TaskFlow PRO - Frontend
echo ========================================
echo.

cd /d "%~dp0frontend"

echo Iniciando Angular...
echo (Presiona Ctrl+C para detener)
echo.

call npm start

pause
