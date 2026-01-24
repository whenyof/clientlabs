#!/bin/bash

# =======================================================================
# ClientLabs Automatic Code Backup Script
# Creates encrypted backups and uploads to Google Drive
# =======================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Load environment variables
ENV_FILE="$PROJECT_ROOT/.env.local"

if [[ -f "$ENV_FILE" ]]; then
    set -o allexport
    source "$ENV_FILE"
    set +o allexport
else
    echo "[ERROR] .env.local not found at $ENV_FILE"
    exit 1
fi

# Validate required environment variables
: "${TELEGRAM_BOT_TOKEN:?Missing TELEGRAM_BOT_TOKEN}"
: "${TELEGRAM_CHAT_ID:?Missing TELEGRAM_CHAT_ID}"

# Configuration
BACKUP_DIR="$PROJECT_ROOT/backups"
LOG_FILE="$BACKUP_DIR/auto-backup.log"
RCLONE_REMOTE="gdrive-secure"
RCLONE_PATH="backups/code"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions - ALL write to stderr to preserve stdout for return values
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >&2
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}" >&2
    echo "[ERROR][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}" >&2
    echo "[SUCCESS][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[INFO]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}" >&2
    echo "[INFO][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}" >&2
    echo "[WARNING][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$LOG_FILE"
}

# Telegram notification functions
send_telegram_message() {
    local message="$1"

    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d chat_id="$TELEGRAM_CHAT_ID" \
        -d text="$message" \
        -d parse_mode="Markdown" \
        > /dev/null
}

send_telegram_success() {
    local backup_name="$1"

    send_telegram_message "✅ *ClientLabs Backup OK*

📦 Backup: \`$backup_name\`
🕒 $(date '+%Y-%m-%d %H:%M')
☁️ Google Drive: OK
🔁 Rotación aplicada"
}

send_telegram_error() {
    local backup_name="$1"
    local error_log="$2"

    send_telegram_message "❌ *ClientLabs Backup FALLÓ*

📦 Backup: \`$backup_name\`
🚨 Error: Subida a Google Drive fallida
📄 Últimas líneas del log:
\`\`\`
$(echo "$error_log" | tail -5)
\`\`\`

🕒 $(date '+%Y-%m-%d %H:%M')

Revisa logs inmediatamente."
}

# Global error handler
on_error() {
    local code="$1"
    local line="$2"

    send_telegram_message "❌ *ClientLabs Backup FALLÓ*

🚨 Código: $code
📍 Línea: $line
🕒 $(date '+%Y-%m-%d %H:%M')

Revisa logs inmediatamente."
}

# Set error trap
trap 'on_error $? $LINENO' ERR

# Ensure remote path exists
ensure_remote_path() {
    local remote_path="${RCLONE_REMOTE}:${RCLONE_PATH}"

    log_info "Ensuring remote path exists: $remote_path"

    # Try to create the directory (this is idempotent - won't fail if it exists)
    if ! rclone mkdir "$remote_path" 2>> "$LOG_FILE"; then
        log_warning "Could not create remote path $remote_path (may already exist)"
        # Don't fail here - the path might already exist
    else
        log_info "Remote path ensured: $remote_path"
    fi
}

# Validate dependencies
validate_dependencies() {
    local missing_deps=()

    if ! command -v zip &> /dev/null; then
        missing_deps+=("zip")
    fi

    if ! command -v rclone &> /dev/null; then
        missing_deps+=("rclone")
    fi

    if [[ ${#missing_deps[@]} -ne 0 ]]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        log_error "Please install: brew install ${missing_deps[*]}"
        exit 1
    fi

    log_info "All dependencies validated"
}

# Validate rclone configuration
validate_rclone() {
    if ! rclone listremotes | grep -q "^${RCLONE_REMOTE}:"; then
        log_error "Rclone remote '${RCLONE_REMOTE}' not found"
        log_error "Please configure with: rclone config"
        exit 1
    fi

    # Test connection
    if ! rclone lsd "${RCLONE_REMOTE}:" &> /dev/null; then
        log_error "Cannot connect to rclone remote '${RCLONE_REMOTE}'"
        log_error "Check your rclone configuration"
        exit 1
    fi

    log_info "Rclone configuration validated"
}

# Create backup directory
setup_backup_directory() {
    mkdir -p "$BACKUP_DIR"
    log_info "Backup directory ready: $BACKUP_DIR"
}

# Generate backup filename
generate_backup_name() {
    echo "backup_$(date '+%Y-%m-%d_%H-%M-%S').zip"
}

# Create backup archive
create_backup_archive() {
    local backup_name="$1"
    local backup_path="$BACKUP_DIR/$backup_name"

    log_info "Creating backup archive: $backup_name"

    local dirs_to_backup=(
        "app"
        "prisma"
        "lib"
        "scripts"
        "components"
        "middleware.ts"
        "next.config.js"
        "package.json"
        "package-lock.json"
        "tailwind.config.js"
        "tsconfig.json"
        "README.md"
        ".env.example"
    )

    cd "$PROJECT_ROOT" || {
        log_error "Failed to enter project root"
        exit 1
    }

    # Ejecutamos zip SIN romper el script por warnings
    zip -r "$backup_path" \
        app prisma lib scripts components \
        middleware.ts next.config.js package.json package-lock.json \
        tailwind.config.js tsconfig.json README.md .env.example \
        >> "$LOG_FILE" 2>&1 || {
            log_error "Zip command failed"
            exit 1
        }

    cd - > /dev/null || true

    # Verificación REAL
    if [[ ! -f "$backup_path" ]]; then
        log_error "Backup file was not created: $backup_path"
        exit 1
    fi

    local backup_size
    backup_size=$(stat -f%z "$backup_path" 2>/dev/null || stat -c%s "$backup_path" 2>/dev/null || echo "0")

    # Validate backup file size
    if [[ "$backup_size" -eq 0 ]]; then
        log_error "Backup file is empty (0 bytes): $backup_path"
        rm -f "$backup_path"
        exit 1
    fi

    local size_mb=$((backup_size / 1024 / 1024))

    log_success "Backup archive created successfully (${size_mb}MB)"

    # Return ONLY the path - no logs in stdout
    echo "$backup_path"
}
# Upload to Google Drive with error handling and notifications
upload_to_drive() {
    local backup_path="$1"
    local backup_name="$(basename "$backup_path")"
    local remote_path="${RCLONE_REMOTE}:${RCLONE_PATH}/"

    log_info "Uploading to Google Drive: $backup_name"
    log_info "Source: $backup_path"
    log_info "Destination: $remote_path"

    # Ensure remote path exists before uploading
    ensure_remote_path

    # Validate backup file exists and is readable
    if [[ ! -f "$backup_path" ]]; then
        log_error "Backup file does not exist: $backup_path"
        send_telegram_error "$backup_name" "Backup file missing: $backup_path"
        exit 1
    fi

    if [[ ! -r "$backup_path" ]]; then
        log_error "Backup file not readable: $backup_path"
        send_telegram_error "$backup_name" "Backup file not readable: $backup_path"
        exit 1
    fi

    # Capture stderr for error reporting
    local error_output=""
    local rclone_cmd="rclone copy \"$backup_path\" \"$remote_path\" --progress=false"

    log_info "Executing: $rclone_cmd"

    # Upload with error capture
    if ! error_output=$(eval "$rclone_cmd" 2>&1); then
        log_error "Failed to upload backup to Google Drive"
        log_error "Command: $rclone_cmd"
        log_error "Error output: $error_output"

        # Send Telegram error notification
        send_telegram_error "$backup_name" "$error_output"

        # Log the error details
        {
            echo "Upload error details:"
            echo "Command: $rclone_cmd"
            echo "Error output: $error_output"
            echo "Backup file: $backup_path"
            echo "Remote path: $remote_path"
        } >> "$LOG_FILE"

        # Exit with error code, but notification was already sent
        exit 1
    fi

    log_success "Backup uploaded to Google Drive successfully"
    log_info "Remote location: ${remote_path}${backup_name}"
}

# Clean local backup file
clean_local_backup() {
    local backup_path="$1"

    log_info "Removing local backup file for security"

    if ! rm -f "$backup_path"; then
        log_warning "Failed to remove local backup file: $backup_path"
    else
        log_success "Local backup file removed securely"
    fi
}

# Rotation: Keep only last 7 backups in cloud
rotate_backups() {
    log_info "Checking backup rotation (keeping last 7)"

    # List backups in cloud, sorted by date (newest first)
    local cloud_backups
    cloud_backups=$(rclone lsf "${RCLONE_REMOTE}:${RCLONE_PATH}/" --format "t" 2>/dev/null | sort -r | grep '\.zip$' || true)

    if [[ -z "$cloud_backups" ]]; then
        log_info "No existing backups found in cloud"
        return 0
    fi

    # Count backups
    local backup_count=$(echo "$cloud_backups" | wc -l | tr -d ' ')

    if [[ $backup_count -le 7 ]]; then
        log_info "Backup count ($backup_count) is within limit (7)"
        return 0
    fi

    # Get backups to delete (older than 7th)
    local backups_to_delete
    backups_to_delete=$(echo "$cloud_backups" | tail -n +8)

    if [[ -n "$backups_to_delete" ]]; then
        log_info "Deleting $(echo "$backups_to_delete" | wc -l | tr -d ' ') old backups"

        echo "$backups_to_delete" | while read -r backup_file; do
            if [[ -n "$backup_file" ]]; then
                log_info "Deleting old backup: $backup_file"
                if ! rclone delete "${RCLONE_REMOTE}:${RCLONE_PATH}/$backup_file" 2>> "$LOG_FILE"; then
                    log_warning "Failed to delete old backup: $backup_file"
                fi
            fi
        done

        log_success "Backup rotation completed"
    fi
}

# Create restore guide document
create_restore_guide() {
    local guide_file="$BACKUP_DIR/RESTORE_GUIDE.txt"

    # Get current date for examples
    local current_date
    current_date=$(date '+%Y-%m-%d_%H-%M')

    cat > "$guide_file" << 'EOF'
============================
CLIENTLABS BACKUP RESTORE GUIDE
============================

📋 AUTOMATIC CODE BACKUPS - RESTORE INSTRUCTIONS
Generated on: REPLACE_TIMESTAMP

🚨 IMPORTANT NOTES:
- Always backup current state before restore
- Verify backup date and time
- Test application after restore
- Keep logs for audit trail

============================
1️⃣ LIST AVAILABLE BACKUPS
============================

Check what backups are available in Google Drive:

rclone ls gdrive-secure:backups/code/

Example output:
   456789 backup_2026-01-22_03-00-01.zip
   456789 backup_2026-01-21_03-00-01.zip
   456789 backup_2026-01-20_03-00-01.zip

============================
2️⃣ DOWNLOAD BACKUP
============================

Download the desired backup to local machine:

rclone copy gdrive-secure:backups/code/BACKUP_NAME.zip .

Example (replace with actual backup name):
rclone copy gdrive-secure:backups/code/backup_2026-01-22_03-00-01.zip .

============================
3️⃣ EXTRACT BACKUP
============================

Extract the downloaded backup:

unzip backup_2026-01-22_03-00-01.zip

This creates a 'backup' directory with all restored files.

============================
4️⃣ RESTORE PROJECT FILES
============================

⚠️  WARNING: This will REPLACE existing files!

# Backup current state first (recommended)
mkdir ../current-backup-$(date +%Y%m%d-%H%M%S)
cp -r app prisma lib scripts components ../current-backup-$(date +%Y%m%d-%H%M%S)/

# Remove old directories
rm -rf app prisma lib scripts components

# Move restored directories
mv backup/app .
mv backup/prisma .
mv backup/lib .
mv backup/scripts .
mv backup/components .

# Clean up backup directory
rm -rf backup
rm backup_2026-01-22_03-00-01.zip

============================
5️⃣ VERIFY AND RESTART
============================

# Install dependencies
npm install

# Verify application structure
ls -la app/ lib/ scripts/

# Start development server
npm run dev

# Test application in browser
open http://localhost:3000

============================
6️⃣ EMERGENCY RESTORE
============================

If interactive restore is needed:

bash scripts/restore-backup.sh

Or for automatic restore:

bash scripts/restore-backup.sh --auto backup_2026-01-22_03-00-01.zip

============================
📞 SUPPORT INFORMATION
============================

For support or issues:
- Check logs: tail -f backups/auto-backup.log
- Run diagnostics: bash scripts/validate-backup-system.sh
- Contact: DevOps Team

============================
🔐 SECURITY NOTES
============================

- Never share backup files or guide documents
- Verify file integrity after download
- Use official restore scripts when possible
- Keep backup secret keys secure

============================
📊 BACKUP SYSTEM STATUS
============================

Last Backup: REPLACE_LAST_BACKUP
Total Backups: REPLACE_TOTAL_BACKUPS
Next Backup: Daily at 3:00 AM (cron job)

For more information:
- bash scripts/backup-manager.sh
- Open: AUTO_BACKUP_SYSTEM_README.md

============================
⚠️  END OF RESTORE GUIDE
============================
EOF

    # Replace placeholders with actual data
    sed -i.bak "s/REPLACE_TIMESTAMP/$(date '+%Y-%m-%d %H:%M:%S')/" "$guide_file"
    sed -i.bak "s/REPLACE_LAST_BACKUP/$current_date/" "$guide_file"

    # Get total backups count
    local total_backups
    total_backups=$(rclone lsf "${RCLONE_REMOTE}:${RCLONE_PATH}/" 2>/dev/null | grep '\.zip$' | wc -l | tr -d ' ' || echo "0")
    sed -i.bak "s/REPLACE_TOTAL_BACKUPS/$total_backups/" "$guide_file"

    rm -f "${guide_file}.bak"

    log_success "Restore guide created: $guide_file"
}

# Upload restore guide to Google Drive
upload_restore_guide() {
    local guide_file="$BACKUP_DIR/RESTORE_GUIDE.txt"

    log_info "Uploading restore guide to Google Drive"

    # Upload/overwrite the guide file
    if ! rclone copy "$guide_file" "${RCLONE_REMOTE}:/" --progress=false 2>> "$LOG_FILE"; then
        log_error "Failed to upload restore guide to Google Drive"
        return 1
    fi

    log_success "Restore guide uploaded to Google Drive"
    return 0
}

# Create backup metadata
create_backup_metadata() {
    local backup_name="$1"
    local metadata_file="$BACKUP_DIR/backup-metadata.json"

    local metadata=$(cat << EOF
{
  "backup_name": "$backup_name",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "project_root": "$PROJECT_ROOT",
  "included_directories": ["app", "prisma", "lib", "scripts", "components"],
  "excluded_patterns": ["node_modules", ".next", ".git", "*.log"],
  "remote": "$RCLONE_REMOTE",
  "remote_path": "$RCLONE_PATH",
  "rotation_policy": "keep_last_7",
  "compression": "zip",
  "restore_guide": true,
  "status": "completed"
}
EOF
)

    echo "$metadata" > "$metadata_file"
    log_info "Backup metadata created"
}

# Send notification (placeholder for future email/slack integration)
send_notification() {
    local backup_name="$1"
    local status="$2"

    # Placeholder - can be extended to send emails, Slack notifications, etc.
    log_info "Backup notification: $backup_name - $status"

    # Example for future implementation:
    # curl -X POST -H 'Content-type: application/json' \
    #   --data '{"text":"Backup completed: '"$backup_name"'"}' \
    #   $SLACK_WEBHOOK_URL
}

# Main backup function
perform_backup() {
    log "=== Starting ClientLabs Code Backup ==="
    log "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    log "Project: $PROJECT_ROOT"

    validate_dependencies
    validate_rclone
    setup_backup_directory

    # Generate backup name
    local backup_name
    backup_name=$(generate_backup_name)

    # Create backup
    local backup_path
    backup_path=$(create_backup_archive "$backup_name")

    # Upload to cloud (with error handling and notifications)
    upload_to_drive "$backup_path"

    # Clean local file
    clean_local_backup "$backup_path"

    # Rotate old backups
    rotate_backups

    # Create metadata
    create_backup_metadata "$backup_name"

    # Create and upload restore guide
    create_restore_guide
    upload_restore_guide

    # Send notification
    send_notification "$backup_name" "success"

    log_success "ClientLabs code backup completed successfully"
    log_success "Backup: $backup_name"
    log_success "Location: ${RCLONE_REMOTE}:${RCLONE_PATH}/"
    log_success "Log file: $LOG_FILE"

    # Send Telegram success notification
    send_telegram_success "$backup_name"

    echo ""
    echo -e "${GREEN}✅ Code backup completed successfully!${NC}"
    echo "📦 Backup: $backup_name"
    echo "☁️  Location: Google Drive (${RCLONE_REMOTE})"
    echo "📝 Logs: $LOG_FILE"
}

# Handle command line arguments
DRY_RUN=false
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            log_info "DRY RUN MODE - No actual backup will be performed"
            ;;
        --force)
            FORCE=true
            log_info "FORCE MODE - Ignoring some validations"
            ;;
        --help)
            echo "ClientLabs Automatic Code Backup Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Show what would be done without creating backup"
            echo "  --force      Force backup even if validations fail"
            echo "  --help       Show this help message"
            echo ""
            echo "Configuration:"
            echo "  • Rclone remote: $RCLONE_REMOTE"
            echo "  • Cloud path: $RCLONE_PATH"
            echo "  • Local backups: $BACKUP_DIR"
            echo "  • Log file: $LOG_FILE"
            echo ""
            echo "What gets backed up:"
            echo "  • app/ (Next.js application)"
            echo "  • prisma/ (Database schema)"
            echo "  • lib/ (Utility libraries)"
            echo "  • scripts/ (Automation scripts)"
            echo "  • components/ (React components)"
            echo "  • Configuration files (package.json, tsconfig.json, etc.)"
            echo ""
            echo "Exclusions:"
            echo "  • node_modules/ (dependencies)"
            echo "  • .next/ (build artifacts)"
            echo "  • .git/ (version control)"
            echo "  • *.log (log files)"
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
    echo "DRY RUN - Would perform the following operations:"
    echo "  • Validate dependencies (zip, rclone)"
    echo "  • Validate rclone configuration ($RCLONE_REMOTE)"
    echo "  • Ensure remote path exists (${RCLONE_REMOTE}:${RCLONE_PATH})"
    echo "  • Create backup archive with timestamp"
    echo "  • Upload to Google Drive (${RCLONE_REMOTE}:${RCLONE_PATH}/)"
    echo "  • Remove local backup file"
    echo "  • Rotate backups (keep last 7)"
    echo "  • Create restore guide document"
    echo "  • Upload restore guide to Google Drive"
    echo "  • Send Telegram success notification"
    echo "  • Update logs and metadata"
    echo ""
    echo "DRY RUN completed - no changes made"
    exit 0
else
    perform_backup
fi