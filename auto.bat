@echo off
:loop
tasklist /fi "imagename eq node.exe" | find /i "node.exe" > nul
if errorlevel 1 (
    C:\Users\Administrator\Downloads\AkR-Bot-main\AkR-Bot-main
    start cmd /k "npm start"
)
timeout /t 10 /nobreak > nul
goto loop
