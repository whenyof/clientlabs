#!/bin/bash

# =======================================================================
# ClientLabs Cron Job Setup Script
# Configure automatic database backups
# =======================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backups/backup-db.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$PROJECT_ROOT/backups/cron-setup.log"
}

log_error() {
    echo -e "${RED}[ERROR]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}" >&2
    echo "[ERROR][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$PROJECT_ROOT/backups/cron-setup.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}"
    echo "[SUCCESS][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$PROJECT_ROOT/backups/cron-setup.log"
}

log_info() {
    echo -e "${BLUE}[INFO]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}"
    echo "[INFO][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$PROJECT_ROOT/backups/cron-setup.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}"
    echo "[WARNING][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$PROJECT_ROOT/backups/cron-setup.log"
}

# Validate environment
validate_environment() {
    # Check if running on macOS or Linux
    if [[ "$OSTYPE" != "darwin"* ]] && [[ "$OSTYPE" != "linux-gnu" ]]; then
        log_error "This script is designed for macOS and Linux systems"
        exit 1
    fi

    # Check if cron is available
    if ! command -v crontab &> /dev/null; then
        log_error "crontab command not found. Please install cron."
        exit 1
    fi

    # Check if backup script exists
    if [[ ! -f "$BACKUP_SCRIPT" ]]; then
        log_error "Backup script not found: $BACKUP_SCRIPT"
        exit 1
    fi

    # Make backup script executable
    if ! chmod +x "$BACKUP_SCRIPT"; then
        log_error "Failed to make backup script executable"
        exit 1
    fi

    log_info "Environment validation passed"
}

# Detect current user and cron setup
detect_cron_setup() {
    CURRENT_USER=$(whoami)

    # Check if running as root (not recommended)
    if [[ "$EUID" -eq 0 ]]; then
        log_warning "Running as root - this is not recommended for security reasons"
        CRON_USER="root"
    else
        CRON_USER="$CURRENT_USER"
    fi

    log_info "Setting up cron for user: $CRON_USER"
}

# Get current cron jobs
get_current_cron() {
    if ! crontab -l 2>/dev/null; then
        echo ""
    fi
}

# Set cron jobs
set_cron_jobs() {
    local current_cron=$(get_current_cron)
    local backup_command="cd $PROJECT_ROOT && $BACKUP_SCRIPT >> $PROJECT_ROOT/backups/cron.log 2>&1"
    local cron_job="0 3 * * * $backup_command # ClientLabs daily database backup"

    # Check if backup job already exists
    if echo "$current_cron" | grep -q "ClientLabs daily database backup"; then
        log_info "Backup cron job already exists - skipping"
        return 0
    fi

    # Add new cron job
    local new_cron="${current_cron:+$current_cron\n}$cron_job"

    # Set new cron
    if echo -e "$new_cron" | crontab -; then
        log_success "Daily backup cron job added successfully"
        log_info "Backup will run every day at 3:00 AM"
        return 0
    else
        log_error "Failed to set cron job"
        return 1
    fi
}

# Setup log rotation for backup logs
setup_log_rotation() {
    local logrotate_config="/etc/logrotate.d/clientlabs-backup"

    # Only setup on Linux systems
    if [[ "$OSTYPE" != "linux-gnu" ]]; then
        log_info "Log rotation setup skipped (not Linux)"
        return 0
    fi

    # Check if running as root for logrotate setup
    if [[ "$EUID" -ne 0 ]]; then
        log_warning "Skipping log rotation setup (requires root privileges)"
        return 0
    fi

    # Create logrotate configuration
    cat > "$logrotate_config" << EOF
$PROJECT_ROOT/backups/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $CRON_USER $CRON_USER
    postrotate
        # Optional: send notification after rotation
    endscript
}
EOF

    log_success "Log rotation configured for backup logs"
}

# Test backup script
test_backup_script() {
    log_info "Testing backup script..."

    if ! "$BACKUP_SCRIPT" --dry-run; then
        log_error "Backup script test failed"
        return 1
    fi

    log_success "Backup script test passed"
}

# Show cron job information
show_cron_info() {
    echo ""
    echo -e "${GREEN}✅ Cron job setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Current cron jobs:${NC}"
    crontab -l | grep -v '^#' | grep -v '^$'
    echo ""
    echo -e "${BLUE}⏰ Backup schedule:${NC}"
    echo "   Daily at 3:00 AM (server time)"
    echo ""
    echo -e "${BLUE}📁 Backup location:${NC}"
    echo "   $PROJECT_ROOT/backups/YYYY-MM-DD_HH-MM-SS/"
    echo ""
    echo -e "${BLUE}📝 Logs:${NC}"
    echo "   $PROJECT_ROOT/backups/cron.log"
    echo "   $PROJECT_ROOT/backups/backup.log"
    echo ""
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo "   • Test manually: $BACKUP_SCRIPT --dry-run"
    echo "   • View logs: tail -f $PROJECT_ROOT/backups/cron.log"
    echo "   • Edit cron: crontab -e"
    echo "   • List cron: crontab -l"
}

# Remove cron job (for uninstall)
remove_cron_job() {
    log_info "Removing ClientLabs backup cron job..."

    local current_cron=$(get_current_cron)
    local filtered_cron=$(echo "$current_cron" | grep -v "ClientLabs daily database backup")

    if [[ "$current_cron" != "$filtered_cron" ]]; then
        if echo "$filtered_cron" | crontab -; then
            log_success "Backup cron job removed successfully"
            return 0
        else
            log_error "Failed to remove cron job"
            return 1
        fi
    else
        log_info "No backup cron job found to remove"
        return 0
    fi
}

# Main function
main() {
    log "=== ClientLabs Cron Setup Started ==="

    validate_environment
    detect_cron_setup
    test_backup_script

    case "${1:-setup}" in
        setup)
            set_cron_jobs
            setup_log_rotation
            show_cron_info
            ;;
        remove)
            remove_cron_job
            ;;
        test)
            echo "Testing completed successfully"
            ;;
        *)
            echo "Usage: $0 [setup|remove|test]"
            echo ""
            echo "Commands:"
            echo "  setup    Setup automatic daily backups (default)"
            echo "  remove   Remove backup cron job"
            echo "  test     Test backup script without setting up cron"
            exit 1
            ;;
    esac

    log "=== ClientLabs Cron Setup Completed ==="
}

# Run main function
main "$@"