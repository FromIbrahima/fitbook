#!/usr/bin/env bash
# Restauration : ./scripts/restore.sh database/backups/backup_02_milieu_xxx.sql
set -euo pipefail
FICHIER="$1"
MYSQL=$(command -v mysql || command -v mariadb)
"$MYSQL" -h "${DB_HOST:-127.0.0.1}" -u "${DB_USER:-fitbook_user}" -p"${DB_PASS:-FitB00k_2026}" < "$FICHIER"
echo "Base restaurée depuis $FICHIER"
