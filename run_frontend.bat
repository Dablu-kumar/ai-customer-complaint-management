@echo off
title AIVOA.AI - Frontend Dev Server
set "PATH=C:\Users\dablu\.gemini\antigravity\scratch\node;%PATH%"
cd /d "%~dp0frontend"
echo ===================================================
echo   AIVOA.AI QMS - Launching Frontend Web App
echo   Target URL: http://localhost:5173
echo ===================================================
call npm run dev
pause
