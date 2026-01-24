#!/bin/bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env.local"

set -o allexport
source "$ENV_FILE"
set +o allexport

RCLONE_REMOTE="gdrive-secure"
RCLONE_PATH="backups/code"

TOTAL=$(rclone lsf "${RCLONE_REMOTE}:${RCLONE_PATH}" 2>/dev/null | grep '\.zip$' | wc -l | tr -d ' ' || echo "0")
LAST=$(rclone lsf "${RCLONE_REMOTE}:${RCLONE_PATH}" 2>/dev/null | grep '\.zip$' | sort -r | head -n 1 || echo "No backups found")

curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -d chat_id="$TELEGRAM_CHAT_ID" \
  -d parse_mode="Markdown" \
  -d text="📊 *ClientLabs Backup Diario*

📦 Total backups: *$TOTAL*
🆕 Último: \`$LAST\`
🕒 Fecha: $(date '+%Y-%m-%d')"