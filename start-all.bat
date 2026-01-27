@echo off
echo ========================================
echo    TaskFlow PRO - Inicio Completo
echo ========================================
echo.
echo Abriendo Backend y Frontend en ventanas separadas...
echo.

start "TaskFlow Backend" cmd /k "%~dp0start-backend.bat"

timeout /t 5 /nobreak > nul

start "TaskFlow Frontend" cmd /k "%~dp0start-frontend.bat"

echo.
echo ========================================
echo   Aplicaciones iniciadas!
echo ========================================
echo.
echo   Backend:  http://localhost:8081
echo   Frontend: http://localhost:4200
echo.
echo   Cierra las ventanas CMD para detener
echo ========================================
