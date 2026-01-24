#!/bin/bash

# =======================================================================
# ClientLabs Telegram Notifications Test
# Tests Telegram integration for backup notifications
# =======================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env.local"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load environment variables
if [[ -f "$ENV_FILE" ]]; then
    set -o allexport
    source "$ENV_FILE"
    set +o allexport
else
    echo -e "${RED}❌ .env.local not found at $ENV_FILE${NC}"
    exit 1
fi

# Validate required environment variables
: "${TELEGRAM_BOT_TOKEN:?Missing TELEGRAM_BOT_TOKEN}"
: "${TELEGRAM_CHAT_ID:?Missing TELEGRAM_CHAT_ID}"

echo "=========================================="
echo "📱 ClientLabs Telegram Test"
echo "=========================================="
echo ""
echo "🔑 Bot Token: ${TELEGRAM_BOT_TOKEN:0:10}..."
echo "👤 Chat ID: $TELEGRAM_CHAT_ID"
echo ""

# Test success notification
echo "📤 Testing SUCCESS notification..."

curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" \
    -d text="✅ *ClientLabs Backup TEST - SUCCESS*

🧪 This is a test message
🕒 $(date '+%Y-%m-%d %H:%M:%S')
📱 Telegram integration working!" \
    -d parse_mode="Markdown" \
    > /dev/null

echo -e "${GREEN}✅ Success notification sent${NC}"

# Test error notification
echo "📤 Testing ERROR notification..."

curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" \
    -d text="❌ *ClientLabs Backup TEST - ERROR*

🚨 This is a test error message
🕒 $(date '+%Y-%m-%d %H:%M:%S')
📱 Error notifications working!" \
    -d parse_mode="Markdown" \
    > /dev/null

echo -e "${GREEN}✅ Error notification sent${NC}"

echo ""
echo -e "${GREEN}🎉 Telegram integration test completed!${NC}"
echo ""
echo "📱 Check your Telegram for test messages."
echo "✅ If you received both messages, integration is working!"