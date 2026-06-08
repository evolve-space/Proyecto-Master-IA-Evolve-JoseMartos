@echo off
cd /d "%~dp0"
echo Parando servidores Symfony y PHP-CGI...
symfony server:stop 2>nul
taskkill /F /IM php-cgi.exe 2>nul
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do taskkill /PID %%a /F >nul 2>&1
echo Listo.
