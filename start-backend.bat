@echo off
echo ========================================
echo    TaskFlow PRO - Backend
echo ========================================
echo.

REM Configurar Java y Maven
set JAVA_HOME=C:\Program Files\Java\jdk-21
set MAVEN_HOME=C:\maven\apache-maven-3.9.9
set PATH=%JAVA_HOME%\bin;%MAVEN_HOME%\bin;%PATH%

cd /d "%~dp0backend"

echo Iniciando Spring Boot...
echo (Presiona Ctrl+C para detener)
echo.

call "%MAVEN_HOME%\bin\mvn.cmd" spring-boot:run

pause
