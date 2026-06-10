Set-Location $PSScriptRoot

Write-Host "`n=== SRM Compras API ===" -ForegroundColor Green
Write-Host "Carpeta: $PWD`n"

if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
  Write-Host "[ERROR] PHP no esta en el PATH (necesitas XAMPP o PHP instalado)." -ForegroundColor Red
  exit 1
}

Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue |
  ForEach-Object {
    Write-Host "Puerto 8000 ocupado por PID $($_.OwningProcess) — cerrando..."
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
  }

Write-Host "Iniciando en http://127.0.0.1:8000"
Write-Host "Para parar: Ctrl+C`n"
php -S 127.0.0.1:8000 -t public public/router.php
