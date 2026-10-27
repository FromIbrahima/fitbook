#!/usr/bin/env bash
# Sauvegarde de la base FitBook (structure + données + procédures stockées)
# Usage : ./scripts/backup.sh 01_debut     → database/backups/backup_01_debut_AAAAMMJJ_HHMM.sql
set -euo pipefail
ETAPE="${1:-manuel}"
DB_USER="${DB_USER:-fitbook_user}"
DB_PASS="${DB_PASS:-FitB00k_2026}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_NAME="${DB_NAME:-fitbook}"
DIR="$(cd "$(dirname "$0")/.." && pwd)/database/backups"
mkdir -p "$DIR"
DUMP=$(command -v mysqldump || command -v mariadb-dump)
FICHIER="$DIR/backup_${ETAPE}_$(date +%Y%m%d_%H%M).sql"
"$DUMP" -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" --routines --triggers --single-transaction \
        --default-character-set=utf8mb4 --add-drop-table --databases "$DB_NAME" > "$FICHIER"
echo "Sauvegarde créée : $FICHIER ($(wc -c < "$FICHIER") octets)"
