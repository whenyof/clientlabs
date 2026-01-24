#!/bin/bash

# =======================================================================
# ClientLabs Auto Backup Setup Script
# Configure automatic code backups to Google Drive
# =======================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
AUTO_BACKUP_SCRIPT="$SCRIPT_DIR/auto-backup.sh"
CRON_LOG="$PROJECT_ROOT/backups/cron-auto-backup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$CRON_LOG"
}

log_error() {
    echo -e "${RED}[ERROR]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}" >&2
    echo "[ERROR][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$CRON_LOG"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}"
    echo "[SUCCESS][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$CRON_LOG"
}

log_info() {
    echo -e "${BLUE}[INFO]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}"
    echo "[INFO][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$CRON_LOG"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}"
    echo "[WARNING][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$CRON_LOG"
}

# Validate dependencies
validate_dependencies() {
    local missing_deps=()

    if ! command -v crontab &> /dev/null; then
        missing_deps+=("crontab")
    fi

    if ! command -v rclone &> /dev/null; then
        missing_deps+=("rclone")
    fi

    if [[ ${#missing_deps[@]} -ne 0 ]]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        if [[ " ${missing_deps[*]} " =~ " crontab " ]]; then
            log_error "Cron is usually pre-installed on macOS/Linux"
        fi
        if [[ " ${missing_deps[*]} " =~ " rclone " ]]; then
            log_error "Install rclone with: brew install rclone"
        fi
        exit 1
    fi

    # Check if auto-backup script exists and is executable
    if [[ ! -x "$AUTO_BACKUP_SCRIPT" ]]; then
        log_error "Auto backup script not found or not executable: $AUTO_BACKUP_SCRIPT"
        log_error "Make it executable with: chmod +x scripts/auto-backup.sh"
        exit 1
    fi

    log_info "All dependencies validated"
}

# Validate rclone configuration
validate_rclone_config() {
    if ! rclone listremotes | grep -q "^gdrive-secure:"; then
        log_error "Rclone remote 'gdrive-secure' not found"
        log_error "Please configure rclone with: rclone config"
        log_error "Use 'gdrive-secure' as the remote name"
        exit 1
    fi

    # Test connection
    if ! rclone lsd "gdrive-secure:" &> /dev/null; then
        log_error "Cannot connect to rclone remote 'gdrive-secure'"
        log_error "Check your rclone configuration and internet connection"
        exit 1
    fi

    log_info "Rclone configuration validated"
}

# Check existing cron jobs
check_existing_cron() {
    local existing_cron
    existing_cron=$(crontab -l 2>/dev/null | grep -v '^#' | grep "auto-backup.sh" || true)

    if [[ -n "$existing_cron" ]]; then
        log_warning "Existing auto-backup cron job found:"
        echo "$existing_cron" | while read -r line; do
            log_warning "  $line"
        done

        echo -n "Remove existing cron job and create new one? (y/N): "
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            remove_existing_cron
        else
            log_info "Keeping existing cron job"
            return 1
        fi
    fi

    return 0
}

# Remove existing auto-backup cron jobs
remove_existing_cron() {
    log_info "Removing existing auto-backup cron jobs"

    # Get current crontab, remove auto-backup lines, and reinstall
    local current_cron
    current_cron=$(crontab -l 2>/dev/null || true)

    # Remove lines containing auto-backup.sh
    local new_cron
    new_cron=$(echo "$current_cron" | grep -v "auto-backup.sh" || true)

    # Only update if there were changes
    if [[ "$current_cron" != "$new_cron" ]]; then
        echo "$new_cron" | crontab -
        log_success "Existing auto-backup cron jobs removed"
    else
        log_info "No existing auto-backup cron jobs found"
    fi
}

# Setup cron job for daily backups at 3:00 AM
setup_cron_job() {
    local cron_time="0 3 * * *"
    local cron_command="cd \"$PROJECT_ROOT\" && bash \"$AUTO_BACKUP_SCRIPT\" >> \"$CRON_LOG\" 2>&1"

    log_info "Setting up daily backup cron job"
    log_info "Schedule: Every day at 3:00 AM"
    log_info "Command: $cron_command"

    # Get current crontab
    local current_cron
    current_cron=$(crontab -l 2>/dev/null || true)

    # Check if the exact cron job already exists
    if echo "$current_cron" | grep -qF "$cron_command"; then
        log_warning "Identical cron job already exists"
        return 0
    fi

    # Add new cron job
    local new_cron="$current_cron
# ClientLabs Auto Code Backup - Daily at 3:00 AM
$cron_time $cron_command
"

    # Install new crontab
    echo "$new_cron" | crontab -

    log_success "Cron job installed successfully"
}

# Test cron setup
test_cron_setup() {
    log_info "Testing cron job setup"

    # Verify cron was installed
    local installed_cron
    installed_cron=$(crontab -l | grep "auto-backup.sh" || true)

    if [[ -z "$installed_cron" ]]; then
        log_error "Cron job was not installed properly"
        exit 1
    fi

    log_success "Cron job verified in crontab"

    # Test auto-backup script (dry run)
    log_info "Testing auto-backup script (dry run)"
    if ! bash "$AUTO_BACKUP_SCRIPT" --dry-run >> "$CRON_LOG" 2>&1; then
        log_error "Auto-backup script test failed"
        exit 1
    fi

    log_success "Auto-backup script test passed"
}

# Show cron status
show_cron_status() {
    echo ""
    echo -e "${BLUE}📋 Cron Job Status:${NC}"
    echo "Current auto-backup cron jobs:"
    crontab -l | grep -v '^#' | grep "auto-backup.sh" || echo "  (none found)"

    echo ""
    echo -e "${BLUE}📁 Backup Configuration:${NC}"
    echo "  • Script: $AUTO_BACKUP_SCRIPT"
    echo "  • Schedule: Daily at 3:00 AM"
    echo "  • Remote: gdrive-secure"
    echo "  • Path: backups/code/"
    echo "  • Rotation: Keep last 7 backups"
    echo "  • Log: $CRON_LOG"

    echo ""
    echo -e "${BLUE}📊 Next Backup:${NC}"
    echo "  $(date -d 'tomorrow 03:00' '+%Y-%m-%d %H:%M:%S') (in $(($(($(date -d 'tomorrow 03:00' +%s) - $(date +%s))) / 3600)) hours)"
}

# Remove cron job
remove_cron_job() {
    log_info "Removing auto-backup cron job"

    remove_existing_cron

    log_success "Auto-backup cron job removed"
}

# Main setup function
setup_auto_backup() {
    log "=== Setting up ClientLabs Auto Code Backup ==="
    log "Project: $PROJECT_ROOT"
    log "Script: $AUTO_BACKUP_SCRIPT"

    validate_dependencies
    validate_rclone_config

    if ! check_existing_cron; then
        log_info "Setup cancelled by user"
        exit 0
    fi

    setup_cron_job
    test_cron_setup

    log_success "ClientLabs auto code backup setup completed"

    show_cron_status

    echo ""
    echo -e "${GREEN}✅ Auto backup setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}🚀 Your code will be automatically backed up every day at 3:00 AM${NC}"
    echo -e "${BLUE}☁️  Backups will be uploaded to Google Drive (gdrive-secure)${NC}"
    echo -e "${BLUE}📝 Monitor logs at: $CRON_LOG${NC}"
    echo ""
    echo -e "${YELLOW}💡 Manual backup anytime: bash scripts/auto-backup.sh${NC}"
}

# Handle command line arguments
ACTION="setup"

while [[ $# -gt 0 ]]; do
    case $1 in
        --remove)
            ACTION="remove"
            shift
            ;;
        --status)
            ACTION="status"
            shift
            ;;
        --test)
            ACTION="test"
            shift
            ;;
        --help)
            echo "ClientLabs Auto Backup Setup Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Actions:"
            echo "  (default)    Setup automatic daily backups"
            echo "  --remove     Remove existing auto-backup cron job"
            echo "  --status     Show current cron job status"
            echo "  --test       Test backup script and configuration"
            echo ""
            echo "Configuration:"
            echo "  • Backup script: scripts/auto-backup.sh"
            echo "  • Schedule: Daily at 3:00 AM"
            echo "  • Remote: gdrive-secure (rclone)"
            echo "  • Path: backups/code/"
            echo "  • Rotation: Keep last 7 backups"
            echo ""
            echo "Requirements:"
            echo "  • rclone configured with 'gdrive-secure' remote"
            echo "  • Google Drive access permissions"
            echo "  • Executable auto-backup.sh script"
            echo ""
            echo "Examples:"
            echo "  $0                    # Setup auto backup"
            echo "  $0 --status          # Show current status"
            echo "  $0 --remove          # Remove auto backup"
            echo "  $0 --test            # Test configuration"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Execute action
case "$ACTION" in
    "setup")
        setup_auto_backup
        ;;
    "remove")
        remove_cron_job
        echo -e "${GREEN}✅ Auto backup cron job removed${NC}"
        ;;
    "status")
        show_cron_status
        ;;
    "test")
        validate_dependencies
        validate_rclone_config
        test_cron_setup
        echo -e "${GREEN}✅ All tests passed!${NC}"
        ;;
    *)
        log_error "Invalid action: $ACTION"
        exit 1
        ;;
esac