#!/bin/bash

# =======================================================================
# ClientLabs Telegram Backup Bot Launcher
# Starts the Telegram bot for backup management
# =======================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BOT_SCRIPT="$SCRIPT_DIR/telegram-backup-bot.js"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validate environment
validate_environment() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js not found. Please install Node.js.${NC}"
        exit 1
    fi

    if [[ ! -f "$BOT_SCRIPT" ]]; then
        echo -e "${RED}❌ Bot script not found: $BOT_SCRIPT${NC}"
        exit 1
    fi

    # Check for required environment variables
    if [[ -z "${TELEGRAM_BOT_TOKEN:-}" ]]; then
        echo -e "${YELLOW}⚠️  TELEGRAM_BOT_TOKEN not found in environment${NC}"
        echo -e "${BLUE}ℹ️  Make sure .env.local contains TELEGRAM_BOT_TOKEN${NC}"
    fi

    if [[ -z "${TELEGRAM_CHAT_ID:-}" ]]; then
        echo -e "${YELLOW}⚠️  TELEGRAM_CHAT_ID not found in environment${NC}"
        echo -e "${BLUE}ℹ️  Make sure .env.local contains TELEGRAM_CHAT_ID${NC}"
    fi
}

# Load environment variables
load_environment() {
    local env_file="$PROJECT_ROOT/.env.local"

    if [[ -f "$env_file" ]]; then
        set -o allexport
        source "$env_file"
        set +o allexport
        echo -e "${GREEN}✅ Environment loaded from $env_file${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.local not found, using existing environment${NC}"
    fi
}

# Start the bot
start_bot() {
    echo -e "${BLUE}🤖 Starting ClientLabs Telegram Backup Bot...${NC}"
    echo ""
    echo -e "${BLUE}Bot Commands:${NC}"
    echo "  /start, /help - Show available commands"
    echo "  /backup       - Run manual backup"
    echo "  /status       - Show system status"
    echo "  /rollback     - Rollback to specific backup"
    echo "  /confirm      - Confirm pending rollback"
    echo ""
    echo -e "${YELLOW}⚠️  Press Ctrl+C to stop the bot${NC}"
    echo ""

    # Change to project root for relative paths
    cd "$PROJECT_ROOT"

    # Start the bot
    exec node "$BOT_SCRIPT"
}

# Show usage
show_usage() {
    echo "ClientLabs Telegram Backup Bot Launcher"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "This script starts the Telegram bot for backup management."
    echo ""
    echo "Requirements:"
    echo "  • Node.js installed"
    echo "  • TELEGRAM_BOT_TOKEN in environment or .env.local"
    echo "  • TELEGRAM_CHAT_ID in environment or .env.local"
    echo ""
    echo "Options:"
    echo "  --help     Show this help message"
    echo ""
    echo "The bot will:"
    echo "  • Listen for Telegram commands"
    echo "  • Execute backup operations"
    echo "  • Send status notifications"
    echo "  • Handle rollback confirmations"
    echo ""
    echo "To run in background:"
    echo "  nohup $0 > telegram-bot.log 2>&1 &"
}

# Handle command line arguments
case "${1:-}" in
    --help)
        show_usage
        exit 0
        ;;
    *)
        validate_environment
        load_environment
        start_bot
        ;;
esac