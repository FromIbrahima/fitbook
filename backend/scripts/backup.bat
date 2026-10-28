@echo off
REM Sauvegarde FitBook sous Windows (XAMPP / WAMP / Laragon)
REM Usage : scripts\backup.bat 01_debut
REM Adapter MYSQL_BIN si mysqldump n'est pas dans le PATH (ex. C:\xampp\mysql\bin)
set ETAPE=%1
if "%ETAPE%"=="" set ETAPE=manuel
set MYSQL_BIN=C:\xampp\mysql\bin
for /f "tokens=1-3 delims=/" %%a in ("%date%") do set JOUR=%%c%%b%%a
set FICHIER=database\backups\backup_%ETAPE%_%JOUR%.sql
if not exist database\backups mkdir database\backups
"%MYSQL_BIN%\mysqldump.exe" -h 127.0.0.1 -u fitbook_user -pFitB00k_2026 --routines --triggers --single-transaction --default-character-set=utf8mb4 --add-drop-table --databases fitbook > %FICHIER%
echo Sauvegarde creee : %FICHIER%
