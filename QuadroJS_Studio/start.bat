@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul || (
  echo [ERRO] Node.js nao foi encontrado no PATH.
  echo Instale Node.js 22 ou superior e tente novamente.
  pause
  exit /b 1
)
node server.mjs
if errorlevel 1 pause
