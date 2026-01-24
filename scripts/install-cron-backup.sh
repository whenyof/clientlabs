#!/bin/bash

# =======================================================================
# ClientLabs Cron Backup Installer
# Automatically installs daily backup cron job without manual editing
# =======================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/auto-backup.sh"
CRON_LOG="$PROJECT_ROOT/backups/cron.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[INFO]$(date '+%H:%M:%S') $*${NC}"
}

log_error() {
    echo -e "${RED}[ERROR]$(date '+%H:%M:%S') $*${NC}" >&2
}

log_success() {
    echo -e "${GREEN}[SUCCESS]$(date '+%H:%M:%S') $*${NC}"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]$(date '+%H:%M:%S') $*${NC}"
}

# Check if script exists and is executable
validate_backup_script() {
    if [[ ! -f "$BACKUP_SCRIPT" ]]; then
        log_error "Backup script not found: $BACKUP_SCRIPT"
        exit 1
    fi

    if [[ ! -x "$BACKUP_SCRIPT" ]]; then
        log_error "Backup script not executable: $BACKUP_SCRIPT"
        log_error "Run: chmod +x $BACKUP_SCRIPT"
        exit 1
    fi

    log "Backup script validated: $BACKUP_SCRIPT"
}

# Check if cron jobs already exist
check_existing_cron() {
    local existing_backup_cron
    local existing_summary_cron

    existing_backup_cron=$(crontab -l 2>/dev/null | grep -v '^#' | grep "auto-backup.sh" || true)
    existing_summary_cron=$(crontab -l 2>/dev/null | grep -v '^#' | grep "backup-daily-summary.sh" || true)

    local has_backup=false
    local has_summary=false

    if [[ -n "$existing_backup_cron" ]]; then
        log_warning "Existing auto-backup cron job found:"
        echo "$existing_backup_cron" | while read -r line; do
            log_warning "  $line"
        done
        has_backup=true
    fi

    if [[ -n "$existing_summary_cron" ]]; then
        log_warning "Existing daily summary cron job found:"
        echo "$existing_summary_cron" | while read -r line; do
            log_warning "  $line"
        done
        has_summary=true
    fi

    # We can still install missing jobs even if some exist
    return 0
}

# Install cron job
install_cron_job() {
    local backup_cron_time="0 3 * * *"
    local backup_cron_command="cd \"$PROJECT_ROOT\" && bash \"$BACKUP_SCRIPT\" >> \"$CRON_LOG\" 2>&1"
    local summary_cron_command="bash \"$PROJECT_ROOT/scripts/backup-daily-summary.sh\""

    # Get current crontab
    local current_cron
    current_cron=$(crontab -l 2>/dev/null || true)

    local new_cron="$current_cron"
    local added_backup=false
    local added_summary=false

    # Add backup cron if not exists
    if ! echo "$current_cron" | grep -qF "$backup_cron_command"; then
        log "Installing daily backup cron job..."
        log "Schedule: Every day at 3:00 AM"
        log "Command: $backup_cron_command"

        new_cron="$new_cron
# ClientLabs Auto Code Backup - Daily at 3:00 AM
$backup_cron_time $backup_cron_command"
        added_backup=true
    else
        log "Backup cron job already exists"
    fi

    # Add summary cron if not exists
    if ! echo "$current_cron" | grep -qF "$summary_cron_command"; then
        log "Installing daily summary cron job..."
        log "Schedule: Every day at 9:00 AM"
        log "Command: $summary_cron_command"

        new_cron="$new_cron
# ClientLabs Daily Backup Summary - Daily at 9:00 AM
0 9 * * * $summary_cron_command"
        added_summary=true
    else
        log "Summary cron job already exists"
    fi

    # Install new crontab only if we added something
    if [[ "$added_backup" == "true" || "$added_summary" == "true" ]]; then
        echo "$new_cron" | crontab -
        log_success "Cron jobs installed successfully"
        [[ "$added_backup" == "true" ]] && log "✅ Added backup cron job"
        [[ "$added_summary" == "true" ]] && log "✅ Added summary cron job"
    else
        log "All cron jobs already exist"
    fi
}

# Verify cron installation
verify_cron_installation() {
    local installed_cron
    installed_cron=$(crontab -l | grep "auto-backup.sh" || true)

    if [[ -z "$installed_cron" ]]; then
        log_error "Cron job verification failed - not found in crontab"
        exit 1
    fi

    log_success "Cron job verified in crontab"
}

# Create backup directory if it doesn't exist
ensure_backup_directory() {
    mkdir -p "$PROJECT_ROOT/backups"
    log "Backup directory ready: $PROJECT_ROOT/backups"
}

# Test backup script (dry run)
test_backup_script() {
    log "Testing backup script (dry run)..."

    if ! bash "$BACKUP_SCRIPT" --dry-run &> /dev/null; then
        log_error "Backup script test failed"
        exit 1
    fi

    log_success "Backup script test passed"
}

# Show installation summary
show_installation_summary() {
    echo ""
    echo -e "${GREEN}✅ ClientLabs Auto Backup Cron Installed Successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Installation Summary:${NC}"
    echo "  • Backup cron: Every day at 3:00 AM"
    echo "  • Summary cron: Every day at 9:00 AM"
    echo "  • Backup script: $BACKUP_SCRIPT"
    echo "  • Summary script: $PROJECT_ROOT/scripts/backup-daily-summary.sh"
    echo "  • Log file: $CRON_LOG"
    echo "  • Remote: gdrive-secure:backups/code/"
    echo "  • Retention: Last 7 backups"
    echo ""
    echo -e "${BLUE}📊 Next Backup:${NC}"
    local next_backup
    next_backup=$(date -d 'tomorrow 03:00' '+%Y-%m-%d %H:%M:%S' 2>/dev/null || date -v+1d -v3H -v0M -v0S '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "tomorrow at 3:00 AM")
    echo "  $next_backup"
    echo ""
    echo -e "${BLUE}🔍 Verify Installation:${NC}"
    echo "  crontab -l | grep auto-backup"
    echo ""
    echo -e "${BLUE}📝 Monitor Logs:${NC}"
    echo "  tail -f $CRON_LOG"
    echo ""
    echo -e "${GREEN}🎉 Your code will be automatically backed up every day!${NC}"
}

# Main installation function
main() {
    echo "=========================================="
    echo "⏰ ClientLabs Cron Backup Installer"
    echo "=========================================="
    echo ""
    echo "This will install automatic daily backups at 3:00 AM"
    echo ""

    validate_backup_script
    ensure_backup_directory

    if ! check_existing_cron; then
        log "Installation cancelled - cron already exists"
        exit 0
    fi

    install_cron_job
    verify_cron_installation
    test_backup_script

    show_installation_summary
}

# Handle command line arguments
case "${1:-}" in
    --help)
        echo "ClientLabs Cron Backup Installer"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "This script automatically installs a daily backup cron job:"
        echo "  • Schedule: Every day at 3:00 AM"
        echo "  • Script: scripts/auto-backup.sh"
        echo "  • Logs: backups/cron.log"
        echo ""
        echo "Options:"
        echo "  --help     Show this help message"
        echo ""
        echo "Requirements:"
        echo "  • macOS or Linux system"
        echo "  • Executable auto-backup.sh script"
        echo "  • rclone configured with gdrive-secure remote"
        echo ""
        echo "The script will:"
        echo "  1. Validate backup script exists and is executable"
        echo "  2. Check for existing cron jobs to avoid duplicates"
        echo "  3. Install new cron job for daily backups"
        echo "  4. Verify installation was successful"
        echo "  5. Test backup script functionality"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac