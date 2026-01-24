#!/bin/bash

# =======================================================================
# ClientLabs Database Backup Script
# Creates uncompressed database backups ready for encryption
# =======================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
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

    # Detect database type from URL
    if [[ "$DATABASE_URL" == postgresql://* ]] || [[ "$DATABASE_URL" == postgres://* ]]; then
        DB_TYPE="postgresql"
        DB_NAME=$(echo "$DATABASE_URL" | sed 's|.*/\([^/?]*\).*|\1|')
    elif [[ "$DATABASE_URL" == mysql://* ]]; then
        DB_TYPE="mysql"
        DB_NAME=$(echo "$DATABASE_URL" | sed 's|.*/\([^/?]*\).*|\1|')
    else
        log_error "Unsupported database type. Only PostgreSQL and MySQL are supported."
        exit 1
    fi

    log_info "Database type: $DB_TYPE, Database name: $DB_NAME"
}

# Validate dependencies
validate_dependencies() {
    local missing_deps=()

    if [[ "$DB_TYPE" == "postgresql" ]]; then
        if ! command -v pg_dump &> /dev/null; then
            missing_deps+=("pg_dump")
        fi
        if ! command -v psql &> /dev/null; then
            missing_deps+=("psql")
        fi
    elif [[ "$DB_TYPE" == "mysql" ]]; then
        if ! command -v mysqldump &> /dev/null; then
            missing_deps+=("mysqldump")
        fi
        if ! command -v mysql &> /dev/null; then
            missing_deps+=("mysql")
        fi
    fi

    if ! command -v gzip &> /dev/null; then
        missing_deps+=("gzip")
    fi

    if [[ ${#missing_deps[@]} -ne 0 ]]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        log_error "Please install the required database client tools"
        exit 1
    fi

    log_info "All dependencies validated"
}

# Test database connection
test_connection() {
    log_info "Testing database connection..."

    if [[ "$DB_TYPE" == "postgresql" ]]; then
        if ! psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
            log_error "Cannot connect to PostgreSQL database"
            exit 1
        fi
    elif [[ "$DB_TYPE" == "mysql" ]]; then
        if ! mysql "$DATABASE_URL" -e "SELECT 1;" &> /dev/null; then
            log_error "Cannot connect to MySQL database"
            exit 1
        fi
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

    log_info "Starting database backup..."

    if [[ "$DB_TYPE" == "postgresql" ]]; then
        # PostgreSQL backup
        if ! pg_dump "$DATABASE_URL" > "$backup_file" 2>> "$LOG_FILE"; then
            log_error "PostgreSQL backup failed"
            rm -f "$backup_file"
            exit 1
        fi
    elif [[ "$DB_TYPE" == "mysql" ]]; then
        # MySQL backup
        if ! mysqldump "$DATABASE_URL" > "$backup_file" 2>> "$LOG_FILE"; then
            log_error "MySQL backup failed"
            rm -f "$backup_file"
            exit 1
        fi
    fi

    local backup_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null || echo "0")

    log_info "Backup created successfully (Size: $(numfmt --to=iec-i --suffix=B $backup_size 2>/dev/null || echo "${backup_size}B"))"

    # Compress backup
    log_info "Compressing backup..."
    if ! gzip "$backup_file"; then
        log_error "Backup compression failed"
        exit 1
    fi

    local compressed_file="$backup_file.gz"
    local compressed_size=$(stat -f%z "$compressed_file" 2>/dev/null || stat -c%s "$compressed_file" 2>/dev/null || echo "0")

    log_info "Backup compressed successfully (Size: $(numfmt --to=iec-i --suffix=B $compressed_size 2>/dev/null || echo "${compressed_size}B"))"

    # Create backup metadata
    cat > "$BACKUP_DIR/metadata.json" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "environment": "$ENVIRONMENT",
  "database_type": "$DB_TYPE",
  "database_name": "$DB_NAME",
  "backup_size_bytes": $backup_size,
  "compressed_size_bytes": $compressed_size,
  "compression_ratio": $(awk "BEGIN {print $compressed_size/$backup_size}"),
  "status": "unencrypted"
}
EOF

    # Create backup verification
    log_info "Verifying backup integrity..."
    if ! gunzip -c "$compressed_file" | head -1 | grep -q "PostgreSQL\|MySQL\|Dump"; then
        log_error "Backup verification failed - invalid backup file"
        rm -rf "$BACKUP_DIR"
        exit 1
    fi

    log_info "Backup verification successful"
}

# Update backup log
update_backup_log() {
    local log_file="$BACKUP_ROOT/backup-log.json"
    local backup_info=$(cat "$BACKUP_DIR/metadata.json")

    # Create or update log file
    if [[ ! -f "$log_file" ]]; then
        echo "[]" > "$log_file"
    fi

    # Add new entry (simplified - in production you'd use jq)
    local temp_file=$(mktemp)
    cat > "$temp_file" << EOF
[
  {
    "id": "$BACKUP_DATE",
    "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "status": "unencrypted",
    "size": $(stat -f%z "$BACKUP_DIR/backup.sql.gz" 2>/dev/null || stat -c%s "$BACKUP_DIR/backup.sql.gz" 2>/dev/null || echo "0"),
    "path": "$BACKUP_DIR",
    "metadata": $backup_info
  }
]
EOF

    mv "$temp_file" "$log_file"
}

# Main function
main() {
    log "=== Starting ClientLabs Database Backup ==="
    log "Script version: 2.0.0 (Encryption Ready)"
    log "Project root: $PROJECT_ROOT"

    detect_environment
    load_env
    validate_dependencies
    test_connection
    create_backup_dir
    perform_backup
    update_backup_log

    log_success "Database backup completed successfully"
    log_success "Backup location: $BACKUP_DIR/backup.sql.gz"
    log_success "Ready for encryption with: bash scripts/encrypt.sh $BACKUP_DIR"
    log_success "Log file: $LOG_FILE"

    echo ""
    echo -e "${GREEN}✅ Backup completed successfully!${NC}"
    echo "📁 Location: $BACKUP_DIR"
    echo "📊 Size: $(ls -lh "$BACKUP_DIR/backup.sql.gz" | awk '{print $5}')"
    echo "🔒 Next: Run encryption script"
    echo "📝 Logs: $LOG_FILE"
}

# Run main function
main "$@"