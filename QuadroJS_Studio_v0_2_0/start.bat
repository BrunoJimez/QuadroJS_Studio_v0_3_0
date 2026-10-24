@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul || (
  echo [AVISO] Node.js nao foi encontrado.
  echo Execute primeiro: powershell -ExecutionPolicy Bypass -File setup_windows.ps1
  pause
  exit /b 1
)
node server.mjs
if errorlevel 1 pause
