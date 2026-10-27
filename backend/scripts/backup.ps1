# Sauvegarde FitBook (PowerShell) — usage : .\scripts\backup.ps1 -Etape 02_milieu
param([string]$Etape = "manuel", [string]$MysqlBin = "C:\xampp\mysql\bin")
$dir = Join-Path $PSScriptRoot "..\database\backups"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$fichier = Join-Path $dir ("backup_{0}_{1}.sql" -f $Etape, (Get-Date -Format "yyyyMMdd_HHmm"))
& "$MysqlBin\mysqldump.exe" -h 127.0.0.1 -u fitbook_user -pFitB00k_2026 --routines --triggers --single-transaction `
  --default-character-set=utf8mb4 --add-drop-table --databases fitbook --result-file="$fichier"
Write-Host "Sauvegarde creee : $fichier"
