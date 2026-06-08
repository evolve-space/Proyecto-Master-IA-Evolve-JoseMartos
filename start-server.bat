@echo off
cd /d "%~dp0"

echo.
echo === SRM Compras API (backend) ===
echo Carpeta: %CD%
echo.

where php >nul 2>&1
if errorlevel 1 (
  echo [ERROR] PHP no esta en el PATH. Activa XAMPP o instala PHP.
  pause
  exit /b 1
)

REM Parar servidores Symfony colgados y procesos PHP-CGI huerfanos
where symfony >nul 2>&1
if not errorlevel 1 (
  symfony server:stop >nul 2>&1
  taskkill /F /IM php-cgi.exe >nul 2>&1
  timeout /t 1 /nobreak >nul
)

REM Liberar puerto 8000 si algo lo ocupa
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000" ^| findstr "LISTENING"') do (
  echo Cerrando proceso en puerto 8000 ^(PID %%a^)...
  taskkill /PID %%a /F >nul 2>&1
)

REM Intentar Symfony CLI (desde ESTA carpeta, con public/index.php)
where symfony >nul 2>&1
if not errorlevel 1 (
  symfony server:start --no-tls --port=8000 -d
  if not errorlevel 1 (
    echo.
    echo [OK] Symfony server en http://127.0.0.1:8000
    echo Para parar: symfony server:stop o stop-server.bat
    echo.
    exit /b 0
  )
  echo Symfony CLI fallo, usando servidor PHP integrado...
)

echo Iniciando PHP en http://127.0.0.1:8000
echo Para parar: Ctrl+C
echo.
php -S 127.0.0.1:8000 -t public
