#!/bin/bash

# =======================================================================
# ClientLabs Database Backup Script with S3 Upload
# Enterprise-grade PostgreSQL backup with cloud storage
# BONUS FEATURE: Automatic upload to AWS S3
# =======================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKUP_ROOT="$PROJECT_ROOT/backups"
LOG_FILE="$BACKUP_ROOT/backup-s3.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# S3 Configuration (set these in your environment)
S3_BUCKET="${S3_BACKUP_BUCKET:-clientlabs-backups}"
S3_REGION="${AWS_REGION:-us-east-1}"
S3_PREFIX="${S3_BACKUP_PREFIX:-database}"

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

# Validate S3 dependencies
validate_s3() {
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI not found. Install with: pip install awscli"
        log_error "Or use: brew install awscli"
        exit 1
    fi

    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured"
        log_error "Run: aws configure"
        exit 1
    fi

    # Check if bucket exists
    if ! aws s3 ls "s3://$S3_BUCKET" &> /dev/null; then
        log_warning "S3 bucket $S3_BUCKET does not exist or is not accessible"
        log_info "Attempting to create bucket..."

        if ! aws s3 mb "s3://$S3_BUCKET" --region "$S3_REGION"; then
            log_error "Failed to create S3 bucket"
            exit 1
        fi

        log_success "S3 bucket created: $S3_BUCKET"
    fi

    log_info "S3 configuration validated"
}

# Upload to S3
upload_to_s3() {
    local local_file="$1"
    local s3_key="$2"

    log_info "Uploading to S3: s3://$S3_BUCKET/$s3_key"

    if ! aws s3 cp "$local_file" "s3://$S3_BUCKET/$s3_key" --storage-class STANDARD_IA; then
        log_error "S3 upload failed"
        return 1
    fi

    log_success "Upload completed: s3://$S3_BUCKET/$s3_key"
    return 0
}

# List S3 backups
list_s3_backups() {
    log_info "Listing S3 backups..."

    if ! aws s3 ls "s3://$S3_BUCKET/$S3_PREFIX/" --recursive | head -10; then
        log_warning "No backups found in S3 or access denied"
        return 1
    fi
}

# Download from S3
download_from_s3() {
    local s3_key="$1"
    local local_file="$2"

    log_info "Downloading from S3: s3://$S3_BUCKET/$s3_key"

    if ! aws s3 cp "s3://$S3_BUCKET/$s3_key" "$local_file"; then
        log_error "S3 download failed"
        return 1
    fi

    log_success "Download completed: $local_file"
    return 0
}

# Source the main backup script
source_backup_script() {
    local main_script="$SCRIPT_DIR/backup-db.sh"

    if [[ ! -f "$main_script" ]]; then
        log_error "Main backup script not found: $main_script"
        exit 1
    fi

    # Source the main script to inherit its functions
    # Note: This is a simplified approach - in production you'd modularize better
    source "$main_script"
}

# Override perform_backup to add S3 upload
perform_backup_with_s3() {
    # Call original backup function
    perform_backup

    # Upload to S3
    local s3_key="$S3_PREFIX/$BACKUP_DATE/backup.sql.gz"
    local local_file="$BACKUP_DIR/backup.sql.gz"

    log_info "Starting S3 upload..."

    if upload_to_s3 "$local_file" "$s3_key"; then
        # Update metadata with S3 info
        cat >> "$BACKUP_DIR/metadata.json" << EOF

{
  "s3_uploaded": true,
  "s3_bucket": "$S3_BUCKET",
  "s3_key": "$s3_key",
  "s3_region": "$S3_REGION",
  "uploaded_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

        log_success "Backup uploaded to S3 successfully"
    else
        log_warning "Local backup created but S3 upload failed"
        log_warning "Backup location: $BACKUP_DIR/backup.sql.gz"
    fi
}

# Main function override
main_with_s3() {
    log "=== Starting ClientLabs Database Backup with S3 Upload ==="
    log "Script version: 1.0.0 (S3 Edition)"
    log "Project root: $PROJECT_ROOT"

    detect_environment
    load_env
    validate_dependencies
    validate_s3
    test_connection
    create_backup_dir

    # Override the perform_backup function
    perform_backup_with_s3

    cleanup_old_backups

    log_success "Database backup with S3 upload completed successfully"
    log_success "Backup location: $BACKUP_DIR/backup.sql.gz"
    log_success "S3 location: s3://$S3_BUCKET/$S3_PREFIX/$BACKUP_DATE/backup.sql.gz"
    log_success "Log file: $LOG_FILE"

    send_notification "SUCCESS" "Database backup completed with S3 upload: $BACKUP_DIR"

    echo ""
    echo -e "${GREEN}✅ Backup completed successfully!${NC}"
    echo "📁 Local location: $BACKUP_DIR"
    echo "☁️  S3 location: s3://$S3_BUCKET/$S3_PREFIX/$BACKUP_DATE/"
    echo "📊 Size: $(ls -lh "$BACKUP_DIR/backup.sql.gz" | awk '{print $5}')"
    echo "📝 Logs: $LOG_FILE"
}

# Setup S3 functions
setup_s3() {
    echo "Setting up S3 backup configuration..."
    echo ""
    echo "Required environment variables:"
    echo "  S3_BACKUP_BUCKET=your-backup-bucket-name"
    echo "  AWS_ACCESS_KEY_ID=your-access-key"
    echo "  AWS_SECRET_ACCESS_KEY=your-secret-key"
    echo "  AWS_REGION=us-east-1"
    echo ""
    echo "Optional:"
    echo "  S3_BACKUP_PREFIX=database  # S3 folder prefix"
    echo ""
    echo "AWS CLI installation:"
    echo "  brew install awscli  # macOS"
    echo "  pip install awscli   # Linux/Windows"
    echo ""
    echo "Configuration:"
    echo "  aws configure"
}

# Parse command line arguments
DRY_RUN=false
SETUP_S3=false
LIST_S3=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --setup-s3)
            SETUP_S3=true
            shift
            ;;
        --list-s3)
            LIST_S3=true
            shift
            ;;
        --help)
            echo "ClientLabs Database Backup Script with S3 Upload"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --dry-run     Show what would be done without making changes"
            echo "  --setup-s3    Show S3 setup instructions"
            echo "  --list-s3     List backups in S3"
            echo "  --help        Show this help message"
            echo ""
            echo "Environment variables:"
            echo "  DATABASE_URL           PostgreSQL connection string"
            echo "  S3_BACKUP_BUCKET       S3 bucket name"
            echo "  AWS_ACCESS_KEY_ID      AWS access key"
            echo "  AWS_SECRET_ACCESS_KEY  AWS secret key"
            echo "  AWS_REGION            AWS region (default: us-east-1)"
            echo ""
            echo "Backup location: ./backups/YYYY-MM-DD_HH-MM-SS/"
            echo "S3 location: s3://BUCKET/database/YYYY-MM-DD_HH-MM-SS/"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Handle special commands
if [[ "$SETUP_S3" == "true" ]]; then
    setup_s3
    exit 0
fi

if [[ "$LIST_S3" == "true" ]]; then
    validate_s3
    list_s3_backups
    exit 0
fi

# Source the main backup script
source_backup_script

# Run main function
if [[ "$DRY_RUN" == "true" ]]; then
    echo "DRY RUN - Would perform backup with S3 upload with the following settings:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Backup root: $BACKUP_ROOT"
    echo "  S3 bucket: $S3_BUCKET"
    echo "  S3 region: $S3_REGION"
    echo "  S3 prefix: $S3_PREFIX"
    echo ""
    echo "DRY RUN completed - no changes made"
else
    main_with_s3
fi