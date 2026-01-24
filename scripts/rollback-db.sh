#!/bin/bash

# =======================================================================
# ClientLabs Database Rollback Script
# Enterprise-grade database restoration with safety checks
# =======================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_ROOT="$PROJECT_ROOT/backups"
LOG_FILE="$BACKUP_ROOT/rollback.log"

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

log_warning() {
    echo -e "${YELLOW}[WARNING]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}"
    echo "[WARNING][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
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

    if ! command -v psql &> /dev/null; then
        missing_deps+=("psql")
    fi

    if ! command -v gunzip &> /dev/null; then
        missing_deps+=("gunzip")
    fi

    if ! command -v pg_dump &> /dev/null; then
        missing_deps+=("pg_dump")
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

# List available backups
list_backups() {
    log_info "Available backups:"

    if [[ ! -d "$BACKUP_ROOT" ]]; then
        log_error "Backup directory not found: $BACKUP_ROOT"
        exit 1
    fi

    local backup_count=0
    local backups=()

    while IFS= read -r -d '' dir; do
        local backup_name=$(basename "$dir")
        local backup_path="$dir/backup.sql.gz"
        local metadata_path="$dir/metadata.json"

        if [[ -f "$backup_path" ]]; then
            backup_count=$((backup_count + 1))

            # Get backup info
            local size=$(ls -lh "$backup_path" | awk '{print $5}')
            local date=$(echo "$backup_name" | sed 's/_/ /g' | cut -d' ' -f1)
            local time=$(echo "$backup_name" | sed 's/_/:/g' | cut -d' ' -f2)
            local formatted_date="$date $time"

            # Try to get environment from metadata
            local env="unknown"
            if [[ -f "$metadata_path" ]]; then
                env=$(grep '"environment"' "$metadata_path" | cut -d'"' -f4 2>/dev/null || echo "unknown")
            fi

            backups+=("$backup_count|$backup_name|$formatted_date|$size|$env|$backup_path")
        fi
    done < <(find "$BACKUP_ROOT" -maxdepth 1 -type d -name "20*" -print0 | sort -rz)

    if [[ ${#backups[@]} -eq 0 ]]; then
        log_warning "No backups found in $BACKUP_ROOT"
        echo ""
        echo "To create a backup, run:"
        echo "  bash scripts/backups/backup-db.sh"
        exit 1
    fi

    echo ""
    printf "%-3s %-25s %-19s %-8s %-12s\n" "ID" "Date/Time" "Size" "Environment" "Name"
    printf "%-3s %-25s %-19s %-8s %-12s\n" "---" "-------------------------" "-------------------" "------------" "------------"
    printf '%s\n' "${backups[@]}" | sort -t'|' -k2 -r | while IFS='|' read -r id name date size env path; do
        printf "%-3s %-25s %-19s %-12s %s\n" "$id" "$date" "$size" "$env" "$name"
    done

    echo ""
    log_info "Found ${#backups[@]} backup(s)"
}

# Select backup for restoration
select_backup() {
    local backup_id="$1"

    if [[ -z "$backup_id" ]]; then
        echo -n "Enter backup ID to restore: "
        read -r backup_id
    fi

    if ! [[ "$backup_id" =~ ^[0-9]+$ ]]; then
        log_error "Invalid backup ID: $backup_id"
        exit 1
    fi

    # Find backup by ID
    local backup_info=$(find "$BACKUP_ROOT" -maxdepth 1 -type d -name "20*" -print0 | sort -rz | while IFS= read -r -d '' dir; do
        if [[ -f "$dir/backup.sql.gz" ]]; then
            echo "$dir"
            break
        fi
    done | sed -n "${backup_id}p")

    if [[ -z "$backup_info" ]]; then
        log_error "Backup ID $backup_id not found"
        exit 1
    fi

    SELECTED_BACKUP_DIR="$backup_info"
    SELECTED_BACKUP_FILE="$SELECTED_BACKUP_DIR/backup.sql.gz"

    if [[ ! -f "$SELECTED_BACKUP_FILE" ]]; then
        log_error "Backup file not found: $SELECTED_BACKUP_FILE"
        exit 1
    fi

    log_info "Selected backup: $(basename "$SELECTED_BACKUP_DIR")"
}

# Create pre-rollback backup
create_rollback_backup() {
    log_info "Creating pre-rollback backup..."

    local timestamp=$(date '+%Y-%m-%d_%H-%M-%S')
    local rollback_backup_dir="$BACKUP_ROOT/pre-rollback_$timestamp"

    mkdir -p "$rollback_backup_dir"

    if ! pg_dump "$DATABASE_URL" > "$rollback_backup_dir/backup.sql" 2>> "$LOG_FILE"; then
        log_error "Failed to create pre-rollback backup"
        rm -rf "$rollback_backup_dir"
        exit 1
    fi

    if ! gzip "$rollback_backup_dir/backup.sql"; then
        log_error "Failed to compress pre-rollback backup"
        rm -rf "$rollback_backup_dir"
        exit 1
    fi

    log_success "Pre-rollback backup created: $(basename "$rollback_backup_dir")"
    PRE_ROLLBACK_DIR="$rollback_backup_dir"
}

# Perform database restoration
perform_restore() {
    local force="$1"
    local backup_file="$SELECTED_BACKUP_FILE"

    log_info "Starting database restoration..."
    log_warning "This will REPLACE all current data with backup data"
    log_warning "A pre-rollback backup has been created"

    if [[ "$ENVIRONMENT" == "production" ]] && [[ "$force" != "true" ]]; then
        log_error "Production environment detected!"
        log_error "Use --force flag to restore in production"
        log_error "Example: $0 --force <backup_id>"
        exit 1
    fi

    # Show confirmation prompt
    echo ""
    echo -e "${RED}⚠️  DANGER ZONE${NC}"
    echo "You are about to restore the database from backup:"
    echo "  Backup: $(basename "$SELECTED_BACKUP_DIR")"
    echo "  Environment: $ENVIRONMENT"
    echo "  Database: $(echo "$DATABASE_URL" | sed 's|//.*@|//***:***@|')"
    echo ""
    echo "This action will:"
    echo "  ❌ Delete all current data"
    echo "  ✅ Restore data from backup"
    echo "  🔄 Pre-rollback backup created"
    echo ""
    echo -n "Type 'RESTORE' to confirm: "

    local confirmation
    read -r confirmation

    if [[ "$confirmation" != "RESTORE" ]]; then
        log_info "Restore cancelled by user"
        exit 0
    fi

    log_info "Confirmation received. Starting restore..."

    # Create temporary directory for extraction
    local temp_dir=$(mktemp -d)
    local extracted_file="$temp_dir/backup.sql"

    # Extract backup
    log_info "Extracting backup file..."
    if ! gunzip -c "$backup_file" > "$extracted_file"; then
        log_error "Failed to extract backup file"
        rm -rf "$temp_dir"
        exit 1
    fi

    # Verify backup file
    log_info "Verifying backup file..."
    if ! head -1 "$extracted_file" | grep -q "PostgreSQL database dump"; then
        log_error "Invalid backup file - not a PostgreSQL dump"
        rm -rf "$temp_dir"
        exit 1
    fi

    # Perform restore
    log_info "Restoring database..."
    if ! psql "$DATABASE_URL" < "$extracted_file" 2>> "$LOG_FILE"; then
        log_error "Database restore failed"
        rm -rf "$temp_dir"
        exit 1
    fi

    # Cleanup
    rm -rf "$temp_dir"

    log_success "Database restore completed successfully"
    log_success "Pre-rollback backup: $(basename "$PRE_ROLLBACK_DIR")"
}

# Send notification
send_notification() {
    local status="$1"
    local message="$2"

    # TODO: Implement email/Slack notifications
    log_info "Notification: $status - $message"
}

# Main function
main() {
    log "=== Starting ClientLabs Database Rollback ==="

    detect_environment
    load_env
    validate_dependencies

    local force=false
    local backup_id=""

    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force)
                force=true
                shift
                ;;
            --help)
                echo "ClientLabs Database Rollback Script"
                echo ""
                echo "Usage: $0 [options] [backup_id]"
                echo ""
                echo "Arguments:"
                echo "  backup_id    ID of backup to restore (optional, will prompt if not provided)"
                echo ""
                echo "Options:"
                echo "  --force      Allow restore in production environment"
                echo "  --help       Show this help message"
                echo ""
                echo "Examples:"
                echo "  $0                    # List backups and prompt for selection"
                echo "  $0 1                  # Restore backup with ID 1"
                echo "  $0 --force 2          # Force restore backup 2 in production"
                echo ""
                echo "Safety features:"
                echo "  • Pre-rollback backup is always created"
                echo "  • Production requires --force flag"
                echo "  • Manual confirmation required"
                echo "  • Backup verification before restore"
                exit 0
                ;;
            *)
                if [[ -z "$backup_id" ]]; then
                    backup_id="$1"
                else
                    log_error "Unexpected argument: $1"
                    echo "Use --help for usage information"
                    exit 1
                fi
                shift
                ;;
        esac
    done

    # List available backups
    list_backups

    # Select backup
    select_backup "$backup_id"

    # Test database connection
    test_connection

    # Create pre-rollback backup
    create_rollback_backup

    # Perform restore
    perform_restore "$force"

    # Send notification
    send_notification "SUCCESS" "Database restored from backup: $(basename "$SELECTED_BACKUP_DIR")"

    echo ""
    echo -e "${GREEN}✅ Database restore completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📋 Summary:${NC}"
    echo "  Restored from: $(basename "$SELECTED_BACKUP_DIR")"
    echo "  Pre-rollback backup: $(basename "$PRE_ROLLBACK_DIR")"
    echo "  Environment: $ENVIRONMENT"
    echo ""
    echo -e "${YELLOW}⚠️  Important:${NC}"
    echo "  • Verify your application is working correctly"
    echo "  • Check for any data inconsistencies"
    echo "  • The pre-rollback backup can be used to undo this restore"
}

# Run main function
main "$@"