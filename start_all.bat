@echo off
title Basklingo Launcher
echo Starting Basklingo Ecosystem...
start "Basklingo Backend (:8765)" cmd /k "run_backend.bat"
start "Basklingo Frontend (:3000)" cmd /k "run_frontend.bat"
start "Basklingo Bot" cmd /k "run_bot.bat"
echo All services launched!
pause
