#!/bin/bash

# =======================================================================
# ClientLabs Database Backup Script
# Enterprise-grade PostgreSQL backup solution
# =======================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_ROOT="$PROJECT_ROOT/backups"
LOG_FILE="$BACKUP_ROOT/backup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}" >&2
    echo "[ERROR][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}"
    echo "[SUCCESS][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}"
    echo "[INFO][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

# Environment detection
detect_environment() {
    if [[ -f "$PROJECT_ROOT/.env.local" ]]; then
        ENV_FILE="$PROJECT_ROOT/.env.local"
        ENVIRONMENT="development"
    elif [[ -f "$PROJECT_ROOT/.env.production" ]]; then
        ENV_FILE="$PROJECT_ROOT/.env.production"
        ENVIRONMENT="production"
    elif [[ -f "$PROJECT_ROOT/.env" ]]; then
        ENV_FILE="$PROJECT_ROOT/.env"
        ENVIRONMENT="development"
    else
        log_error "No environment file found (.env, .env.local, or .env.production)"
        exit 1
    fi

    log_info "Environment detected: $ENVIRONMENT ($ENV_FILE)"
}

# Load environment variables
load_env() {
    if [[ ! -f "$ENV_FILE" ]]; then
        log_error "Environment file not found: $ENV_FILE"
        exit 1
    fi

    # Extract DATABASE_URL from env file
    DATABASE_URL=$(grep "^DATABASE_URL=" "$ENV_FILE" | cut -d '=' -f2- | sed 's/^"//' | sed 's/"$//')

    if [[ -z "$DATABASE_URL" ]]; then
        log_error "DATABASE_URL not found in $ENV_FILE"
        exit 1
    fi

    log_info "Database URL loaded from environment"
}

# Validate dependencies
validate_dependencies() {
    local missing_deps=()

    if ! command -v pg_dump &> /dev/null; then
        missing_deps+=("pg_dump")
    fi

    if ! command -v gzip &> /dev/null; then
        missing_deps+=("gzip")
    fi

    if ! command -v psql &> /dev/null; then
        missing_deps+=("psql")
    fi

    if [[ ${#missing_deps[@]} -ne 0 ]]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        log_error "Please install PostgreSQL client tools"
        exit 1
    fi

    log_info "All dependencies validated"
}

# Test database connection
test_connection() {
    log_info "Testing database connection..."

    if ! psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
        log_error "Cannot connect to database"
        exit 1
    fi

    log_info "Database connection successful"
}

# Create backup directory
create_backup_dir() {
    BACKUP_DATE=$(date '+%Y-%m-%d_%H-%M-%S')
    BACKUP_DIR="$BACKUP_ROOT/$BACKUP_DATE"

    if ! mkdir -p "$BACKUP_DIR"; then
        log_error "Failed to create backup directory: $BACKUP_DIR"
        exit 1
    fi

    log_info "Backup directory created: $BACKUP_DIR"
}

# Perform database backup
perform_backup() {
    local backup_file="$BACKUP_DIR/backup.sql"
    local compressed_file="$backup_file.gz"

    log_info "Starting database backup..."

    # Create backup
    if ! pg_dump "$DATABASE_URL" > "$backup_file" 2>> "$LOG_FILE"; then
        log_error "Database backup failed"
        rm -f "$backup_file"
        exit 1
    fi

    local backup_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null || echo "0")

    log_info "Backup created successfully (Size: $(numfmt --to=iec-i --suffix=B $backup_size 2>/dev/null || echo "${backup_size}B"))"

    # Compress backup
    log_info "Compressing backup..."
    if ! gzip "$backup_file"; then
        log_error "Backup compression failed"
        exit 1
    fi

    local compressed_size=$(stat -f%z "$compressed_file" 2>/dev/null || stat -c%s "$compressed_file" 2>/dev/null || echo "0")

    log_info "Backup compressed successfully (Size: $(numfmt --to=iec-i --suffix=B $compressed_size 2>/dev/null || echo "${compressed_size}B"))"

    # Create backup metadata
    cat > "$BACKUP_DIR/metadata.json" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "environment": "$ENVIRONMENT",
  "database_url": "$(echo "$DATABASE_URL" | sed 's|//.*@|//***:***@|')",
  "backup_size_bytes": $backup_size,
  "compressed_size_bytes": $compressed_size,
  "compression_ratio": $(awk "BEGIN {print $compressed_size/$backup_size}"),
  "pg_dump_version": "$(pg_dump --version | head -1)"
}
EOF

    # Create backup verification
    log_info "Verifying backup integrity..."
    if ! gunzip -c "$compressed_file" | head -1 | grep -q "PostgreSQL database dump"; then
        log_error "Backup verification failed - invalid backup file"
        rm -rf "$BACKUP_DIR"
        exit 1
    fi

    log_info "Backup verification successful"
}

# Cleanup old backups (keep last 30 days)
cleanup_old_backups() {
    log_info "Cleaning up old backups (keeping last 30 days)..."

    local cutoff_date=$(date -d '30 days ago' +%Y-%m-%d 2>/dev/null || date -v -30d +%Y-%m-%d 2>/dev/null || echo "")

    if [[ -n "$cutoff_date" ]]; then
        local old_backups=$(find "$BACKUP_ROOT" -maxdepth 1 -type d -name "20*" | while read dir; do
            local dir_date=$(basename "$dir" | cut -d'_' -f1)
            if [[ "$dir_date" < "$cutoff_date" ]]; then
                echo "$dir"
            fi
        done)

        if [[ -n "$old_backups" ]]; then
            echo "$old_backups" | xargs rm -rf
            log_info "Cleaned up $(echo "$old_backups" | wc -l) old backup(s)"
        else
            log_info "No old backups to clean up"
        fi
    fi
}

# Send notification (placeholder for future implementation)
send_notification() {
    local status="$1"
    local message="$2"

    # TODO: Implement email/Slack notifications
    log_info "Notification: $status - $message"
}

# Main function
main() {
    log "=== Starting ClientLabs Database Backup ==="
    log "Script version: 1.0.0"
    log "Project root: $PROJECT_ROOT"

    detect_environment
    load_env
    validate_dependencies
    test_connection
    create_backup_dir
    perform_backup
    cleanup_old_backups

    log_success "Database backup completed successfully"
    log_success "Backup location: $BACKUP_DIR/backup.sql.gz"
    log_success "Log file: $LOG_FILE"

    send_notification "SUCCESS" "Database backup completed: $BACKUP_DIR"

    echo ""
    echo -e "${GREEN}✅ Backup completed successfully!${NC}"
    echo "📁 Location: $BACKUP_DIR"
    echo "📊 Size: $(ls -lh "$BACKUP_DIR/backup.sql.gz" | awk '{print $5}')"
    echo "📝 Logs: $LOG_FILE"
}

# Handle command line arguments
DRY_RUN=false
while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            log_info "DRY RUN MODE - No actual backup will be performed"
            ;;
        --help)
            echo "ClientLabs Database Backup Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Show what would be done without making changes"
            echo "  --help       Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  DATABASE_URL    PostgreSQL connection string (required)"
            echo ""
            echo "Backup location: ./backups/YYYY-MM-DD_HH-MM-SS/"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
    shift
done

# Run main function
if [[ "$DRY_RUN" == "true" ]]; then
    echo "DRY RUN - Would perform backup with the following settings:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Backup root: $BACKUP_ROOT"
    echo "  Log file: $LOG_FILE"
    echo ""
    echo "DRY RUN completed - no changes made"
else
    main
fi