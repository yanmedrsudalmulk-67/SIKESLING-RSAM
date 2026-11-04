@echo off
title SIKRESMI — UOBK RSUD Al-Mulk Kota Sukabumi
cd /d "%~dp0"

echo ========================================================
echo   SIKRESMI — SISTEM INFORMASI KESEHATAN LINGKUNGAN
echo   UOBK RSUD Al-Mulk Kota Sukabumi
echo ========================================================
echo.

:: Cek apakah port 3005 sudah aktif
powershell -NoProfile -Command "if (Test-NetConnection -ComputerName 127.0.0.1 -Port 3005 -InformationLevel Quiet) { exit 0 } else { exit 1 }"
if %ERRORLEVEL% equ 0 (
    echo [OK] Server aplikasi sudah aktif di port 3005.
    echo Membuka browser...
    start http://localhost:3005
    timeout /t 2 >nul
    exit
)

echo [*] Memulai server SIKRESMI di background (port 3005)...
start "SIKRESMI Server (Port 3005)" /min cmd /c "npm run dev"

echo [*] Menunggu server siap...
powershell -NoProfile -Command "for ($i=0; $i -lt 30; $i++) { if (Test-NetConnection -ComputerName 127.0.0.1 -Port 3005 -InformationLevel Quiet) { exit 0 }; Start-Sleep -Seconds 1 }; exit 1"

if %ERRORLEVEL% equ 0 (
    echo [OK] Server berhasil aktif! Membuka browser...
    start http://localhost:3005
    timeout /t 2 >nul
    exit
) else (
    echo [!] Membuka browser ke http://localhost:3005...
    start http://localhost:3005
    timeout /t 3 >nul
    exit
)
