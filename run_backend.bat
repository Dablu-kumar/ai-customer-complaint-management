@echo off
title AIVOA.AI - Backend API Server
cd /d "%~dp0backend"
echo ===================================================
echo   AIVOA.AI QMS - Launching FastAPI Backend Server
echo   Target URL: http://127.0.0.1:8000
echo   API Docs:   http://127.0.0.1:8000/docs
echo ===================================================
python -m uvicorn app.main:app --reload --port 8000
pause
