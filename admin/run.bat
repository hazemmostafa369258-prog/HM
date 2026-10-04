@echo off
chcp 65001 >nul
cd /d "%~dp0"
pip install flask >nul 2>&1
start "" cmd /c "timeout /t 2 >nul & start http://localhost:5000"
python admin.py
pause