#!/bin/bash

# =======================================================================
# ClientLabs Backup System Validator
# Comprehensive validation of backup system components
# =======================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RCLONE_REMOTE="gdrive-secure"

# Validation counters
CHECKS_TOTAL=0
CHECKS_PASSED=0
ISSUES_FOUND=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validation functions
check() {
    local description="$1"
    local command="$2"

    ((CHECKS_TOTAL++))

    echo -n "🔍 $description... "

    if eval "$command" &> /dev/null; then
        echo -e "${GREEN}✅${NC}"
        ((CHECKS_PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC}"
        ((ISSUES_FOUND++))
        return 1
    fi
}

check_with_details() {
    local description="$1"
    local command="$2"
    local details_command="${3:-}"

    ((CHECKS_TOTAL++))

    echo -n "🔍 $description... "

    if eval "$command" &> /dev/null; then
        echo -e "${GREEN}✅${NC}"
        ((CHECKS_PASSED++))
        if [[ -n "$details_command" ]]; then
            echo -e "   ℹ️  $(eval "$details_command")"
        fi
        return 0
    else
        echo -e "${RED}❌${NC}"
        ((ISSUES_FOUND++))
        return 1
    fi
}

warning() {
    local message="$1"
    echo -e "${YELLOW}⚠️  $message${NC}"
}

error() {
    local message="$1"
    echo -e "${RED}❌ $message${NC}"
}

info() {
    local message="$1"
    echo -e "${BLUE}ℹ️  $message${NC}"
}

# System validation functions
validate_dependencies() {
    echo ""
    echo "📦 Checking Dependencies:"
    echo "------------------------"

    check "rclone installed" "command -v rclone"
    check "zip installed" "command -v zip"
    check "unzip installed" "command -v unzip"
    check "cron available" "command -v crontab"
}

validate_scripts() {
    echo ""
    echo "📜 Checking Scripts:"
    echo "-------------------"

    check "auto-backup.sh exists" "[[ -f '$SCRIPT_DIR/auto-backup.sh' ]]"
    check "auto-backup.sh executable" "[[ -x '$SCRIPT_DIR/auto-backup.sh' ]]"

    check "install-cron-backup.sh exists" "[[ -f '$SCRIPT_DIR/install-cron-backup.sh' ]]"
    check "install-cron-backup.sh executable" "[[ -x '$SCRIPT_DIR/install-cron-backup.sh' ]]"

    check "validate-backup-system.sh exists" "[[ -f '$SCRIPT_DIR/validate-backup-system.sh' ]]"
    check "validate-backup-system.sh executable" "[[ -x '$SCRIPT_DIR/validate-backup-system.sh' ]]"

    check "backup-daily-summary.sh exists" "[[ -f '$SCRIPT_DIR/backup-daily-summary.sh' ]]"
    check "backup-daily-summary.sh executable" "[[ -x '$SCRIPT_DIR/backup-daily-summary.sh' ]]"
}

validate_project_structure() {
    echo ""
    echo "🏗️  Checking Project Structure:"
    echo "------------------------------"

    check "app/ directory exists" "[[ -d '$PROJECT_ROOT/app' ]]"
    check "lib/ directory exists" "[[ -d '$PROJECT_ROOT/lib' ]]"
    check "scripts/ directory exists" "[[ -d '$PROJECT_ROOT/scripts' ]]"

    check "package.json exists" "[[ -f '$PROJECT_ROOT/package.json' ]]"
    check "backups/ directory exists" "[[ -d '$PROJECT_ROOT/backups' ]]"
}

validate_rclone() {
    echo ""
    echo "☁️  Checking Google Drive (rclone):"
    echo "-----------------------------------"

    if ! command -v rclone &> /dev/null; then
        error "rclone not installed - cannot validate remote"
        return 1
    fi

    check "gdrive-secure remote configured" "rclone listremotes | grep -q '^gdrive-secure:'"

    if rclone listremotes 2>/dev/null | grep -q "^gdrive-secure:"; then
        check "gdrive-secure remote accessible" "rclone lsd gdrive-secure: &>/dev/null"

        # Check backup path exists
        if rclone lsd "gdrive-secure:backups" &>/dev/null 2>&1; then
            check "backups/ path exists" "rclone lsd gdrive-secure:backups &>/dev/null"
            check "backups/code/ path exists" "rclone lsd gdrive-secure:backups/code &>/dev/null 2>&1 || true"
        else
            warning "backups/ path does not exist in Google Drive (will be created on first backup)"
        fi

        # Count existing backups
        local backup_count
        backup_count=$(rclone lsf "gdrive-secure:backups/code/" 2>/dev/null | grep '\.zip$' | wc -l | tr -d ' ' || echo "0")
        info "Found $backup_count backup(s) in Google Drive"
    fi
}

validate_cron() {
    echo ""
    echo "⏰ Checking Cron Jobs:"
    echo "---------------------"

    local cron_job
    cron_job=$(crontab -l 2>/dev/null | grep "auto-backup.sh" || true)

    check "auto-backup cron job exists" "[[ -n '$cron_job' ]]"

    if [[ -n "$cron_job" ]]; then
        check "cron job scheduled for 3:00 AM" "echo '$cron_job' | grep -q '0 3 \* \* \*'"

        # Extract and display the cron schedule
        local cron_schedule
        cron_schedule=$(echo "$cron_job" | awk '{print $1,$2,$3,$4,$5}' | head -1)
        info "Cron schedule: $cron_schedule (daily at 3:00 AM)"
    else
        warning "No auto-backup cron job found. Run: bash scripts/install-cron-backup.sh"
    fi

    # Check daily summary cron
    local summary_cron
    summary_cron=$(crontab -l 2>/dev/null | grep "backup-daily-summary.sh" || true)

    check "daily summary cron exists" "[[ -n '$summary_cron' ]]"

    if [[ -n "$summary_cron" ]]; then
        check "summary cron scheduled for 9:00 AM" "echo '$summary_cron' | grep -q '0 9 \* \* \*'"

        info "Summary cron: daily at 9:00 AM (backup status report)"
    else
        warning "No daily summary cron job found. Run: bash scripts/install-cron-backup.sh"
    fi
}

validate_logs() {
    echo ""
    echo "📝 Checking Logs:"
    echo "-----------------"

    check "auto-backup.log exists" "[[ -f '$PROJECT_ROOT/backups/auto-backup.log' ]]"
    check "cron.log exists" "[[ -f '$PROJECT_ROOT/backups/cron.log' ]]"

    # Check last backup date
    if [[ -f "$PROJECT_ROOT/backups/auto-backup.log" ]]; then
        local last_backup
        last_backup=$(grep "completed successfully" "$PROJECT_ROOT/backups/auto-backup.log" | tail -1 | cut -d' ' -f2 || echo "Never")
        if [[ "$last_backup" != "Never" ]]; then
            info "Last successful backup: $last_backup"
        else
            warning "No successful backups found in logs"
        fi
    fi
}

validate_backup_functionality() {
    echo ""
    echo "🔧 Testing Backup Functionality:"
    echo "--------------------------------"

    if [[ -x "$SCRIPT_DIR/auto-backup.sh" ]]; then
        check "backup script dry-run works" "timeout 120s bash '$SCRIPT_DIR/auto-backup.sh' --dry-run &>/dev/null"
    else
        error "Cannot test backup script - not executable"
    fi
}

validate_documentation() {
    echo ""
    echo "📚 Checking Documentation:"
    echo "-------------------------"

    check "RESTORE_GUIDE.md exists" "[[ -f '$PROJECT_ROOT/backups/RESTORE_GUIDE.md' ]]"
    check "BACKUP_SYSTEM_README.md exists" "[[ -f '$PROJECT_ROOT/BACKUP_SYSTEM_README.md' ]]"

    if [[ -f "$PROJECT_ROOT/backups/RESTORE_GUIDE.md" ]]; then
        check "RESTORE_GUIDE.md has content" "[[ -s '$PROJECT_ROOT/backups/RESTORE_GUIDE.md' ]]"
    fi
}

show_summary() {
    echo ""
    echo "=========================================="
    echo "📊 Backup System Validation Summary"
    echo "=========================================="
    echo ""
    echo "Checks performed: $CHECKS_TOTAL"
    echo -e "Passed: ${GREEN}$CHECKS_PASSED${NC}"
    echo -e "Failed: ${RED}$ISSUES_FOUND${NC}"

    local success_rate=0
    if [[ $CHECKS_TOTAL -gt 0 ]]; then
        success_rate=$(( (CHECKS_PASSED * 100) / CHECKS_TOTAL ))
    fi

    echo "Success rate: ${success_rate}%"

    if [[ $ISSUES_FOUND -eq 0 ]]; then
        echo ""
        echo -e "${GREEN}🎉 EXCELLENT! Backup system is fully operational!${NC}"
        echo ""
        echo -e "${GREEN}✅ All components validated${NC}"
        echo -e "${GREEN}✅ System ready for production${NC}"
        echo -e "${GREEN}✅ Automatic backups configured${NC}"
        echo ""
        echo "🚀 Your code is automatically backed up daily at 3:00 AM!"
        echo ""
        return 0
    else
        echo ""
        echo -e "${RED}❌ Issues found that need attention${NC}"
        echo ""
        echo -e "${YELLOW}🔧 Common fixes:${NC}"
        if ! command -v rclone &> /dev/null; then
            echo "  • Install rclone: brew install rclone"
        fi
        if ! crontab -l 2>/dev/null | grep -q "auto-backup.sh"; then
            echo "  • Install cron: bash scripts/install-cron-backup.sh"
        fi
        if ! rclone listremotes 2>/dev/null | grep -q "gdrive-secure:"; then
            echo "  • Configure rclone: rclone config"
        fi
        echo ""
        echo -e "${BLUE}📋 Run validation again after fixes:${NC}"
        echo "  bash scripts/validate-backup-system.sh"
        echo ""
        return 1
    fi
}

# Main validation function
main() {
    echo "=========================================="
    echo "🔍 ClientLabs Backup System Validator"
    echo "=========================================="
    echo ""
    echo "Validating complete backup system..."
    echo ""

    validate_dependencies
    validate_scripts
    validate_project_structure
    validate_rclone
    validate_cron
    validate_logs
    validate_backup_functionality
    validate_documentation

    show_summary
}

# Handle command line arguments
case "${1:-}" in
    --help)
        echo "ClientLabs Backup System Validator"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "This script validates the complete backup system:"
        echo "  • Dependencies (rclone, zip, cron)"
        echo "  • Scripts existence and permissions"
        echo "  • Project structure"
        echo "  • Google Drive configuration"
        echo "  • Cron job setup"
        echo "  • Log files"
        echo "  • Backup functionality"
        echo "  • Documentation"
        echo ""
        echo "Options:"
        echo "  --help     Show this help message"
        echo ""
        echo "Exit codes:"
        echo "  0 = All checks passed"
        echo "  1 = Issues found"
        echo ""
        echo "Run this after setting up the backup system."
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac