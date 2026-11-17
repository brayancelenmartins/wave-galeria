@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao encontrado. Instale a versao LTS em https://nodejs.org e rode este arquivo de novo.
  pause
  exit /b 1
)
echo Conferindo dependencias...
call npm install --no-audit --no-fund
start "" http://localhost:3000
call npm run dev
pause
