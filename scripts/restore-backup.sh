#!/bin/bash

# =======================================================================
# ClientLabs Backup Restore Script
# Restore code backups from Google Drive
# =======================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"
LOG_FILE="$BACKUP_DIR/restore.log"
RCLONE_REMOTE="gdrive-secure"
RCLONE_PATH="backups/code"
TEMP_DIR="$BACKUP_DIR/temp-restore"

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

# Validate dependencies
validate_dependencies() {
    local missing_deps=()

    if ! command -v unzip &> /dev/null; then
        missing_deps+=("unzip")
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

# List available backups
list_available_backups() {
    log_info "Listing available backups from Google Drive"

    # Get list of backup files with metadata
    local backup_list
    backup_list=$(rclone lsf "${RCLONE_REMOTE}:${RCLONE_PATH}/" --format "pst" 2>/dev/null | grep '\.zip$' | sort -r || true)

    if [[ -z "$backup_list" ]]; then
        log_error "No backup files found in ${RCLONE_REMOTE}:${RCLONE_PATH}/"
        log_error "Make sure backups have been created with auto-backup.sh"
        exit 1
    fi

    echo ""
    echo -e "${BLUE}📦 Available Code Backups:${NC}"
    echo "=========================================="
    printf "%-3s %-25s %-12s %-10s\n" "ID" "Backup Name" "Date" "Size"
    echo "------------------------------------------"

    local index=1
    echo "$backup_list" | while read -r line; do
        # Parse rclone format: size timestamp filename
        local size=$(echo "$line" | awk '{print $1}')
        local timestamp=$(echo "$line" | awk '{print $2}')
        local filename=$(echo "$line" | awk '{print $3}')

        # Convert size to human readable
        local size_hr
        if [[ $size -gt 1073741824 ]]; then
            size_hr="$((size / 1073741824))GB"
        elif [[ $size -gt 1048576 ]]; then
            size_hr="$((size / 1048576))MB"
        elif [[ $size -gt 1024 ]]; then
            size_hr="$((size / 1024))KB"
        else
            size_hr="${size}B"
        fi

        # Format date
        local date_formatted
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            date_formatted=$(date -j -f "%Y-%m-%dT%H:%M:%S" "$timestamp" "+%Y-%m-%d %H:%M" 2>/dev/null || echo "$timestamp")
        else
            # Linux
            date_formatted=$(date -d "$timestamp" "+%Y-%m-%d %H:%M" 2>/dev/null || echo "$timestamp")
        fi

        printf "%-3s %-25s %-12s %-10s\n" "$index" "$filename" "$date_formatted" "$size_hr"

        # Store for later use
        eval "BACKUP_$index=\"$filename\""
        ((index++))
    done

    echo "=========================================="
    echo ""
    TOTAL_BACKUPS=$((index - 1))
}

# Get backup selection from user
get_backup_selection() {
    while true; do
        echo -n "Enter backup ID to restore (1-$TOTAL_BACKUPS), or 'q' to quit: "
        read -r selection

        if [[ "$selection" == "q" ]] || [[ "$selection" == "Q" ]]; then
            log_info "Restore cancelled by user"
            exit 0
        fi

        if [[ "$selection" =~ ^[0-9]+$ ]] && [[ $selection -ge 1 ]] && [[ $selection -le $TOTAL_BACKUPS ]]; then
            # Get the backup filename
            local backup_var="BACKUP_$selection"
            SELECTED_BACKUP="${!backup_var}"
            break
        else
            echo -e "${RED}Invalid selection. Please enter a number between 1 and $TOTAL_BACKUPS.${NC}"
        fi
    done

    log_info "Selected backup: $SELECTED_BACKUP"
}

# Confirm restore operation
confirm_restore() {
    echo ""
    echo -e "${YELLOW}⚠️  WARNING: This will OVERWRITE existing files!${NC}"
    echo ""
    echo "The following directories will be restored:"
    echo "  • app/ (Next.js application)"
    echo "  • prisma/ (Database schema)"
    echo "  • lib/ (Utility libraries)"
    echo "  • scripts/ (Automation scripts)"
    echo "  • components/ (React components)"
    echo "  • Configuration files"
    echo ""
    echo "Backup to restore: $SELECTED_BACKUP"
    echo ""
    echo -n "Type 'RESTORE' to confirm, or anything else to cancel: "
    read -r confirmation

    if [[ "$confirmation" != "RESTORE" ]]; then
        log_info "Restore cancelled by user"
        exit 0
    fi

    log_warning "User confirmed destructive restore operation"
}

# Create backup of current state (safety)
create_safety_backup() {
    log_info "Creating safety backup of current state"

    local safety_name="pre-restore_$(date '+%Y-%m-%d_%H-%M-%S').zip"
    local safety_path="$BACKUP_DIR/$safety_name"

    # Quick backup of critical directories
    cd "$PROJECT_ROOT"
    if zip -r "$safety_path" app/ prisma/ lib/ scripts/ package.json tsconfig.json 2>/dev/null; then
        log_success "Safety backup created: $safety_name"
        echo -e "${GREEN}💾 Safety backup created: $safety_name${NC}"
    else
        log_warning "Failed to create safety backup"
    fi
    cd - > /dev/null
}

# Download selected backup
download_backup() {
    log_info "Downloading backup: $SELECTED_BACKUP"

    # Create temp directory
    mkdir -p "$TEMP_DIR"

    # Download from Google Drive
    if ! rclone copy "${RCLONE_REMOTE}:${RCLONE_PATH}/$SELECTED_BACKUP" "$TEMP_DIR/" 2>> "$LOG_FILE"; then
        log_error "Failed to download backup from Google Drive"
        rm -rf "$TEMP_DIR"
        exit 1
    fi

    local downloaded_file="$TEMP_DIR/$SELECTED_BACKUP"
    if [[ ! -f "$downloaded_file" ]]; then
        log_error "Downloaded file not found: $downloaded_file"
        rm -rf "$TEMP_DIR"
        exit 1
    fi

    log_success "Backup downloaded successfully"

    echo "$downloaded_file"
}

# Verify backup integrity
verify_backup() {
    local backup_file="$1"

    log_info "Verifying backup integrity"

    # Test zip file
    if ! unzip -t "$backup_file" &> /dev/null; then
        log_error "Backup file is corrupted or invalid"
        rm -rf "$TEMP_DIR"
        exit 1
    fi

    # Check for critical files
    local has_critical_files=false
    if unzip -l "$backup_file" | grep -q "package.json"; then
        has_critical_files=true
    fi

    if [[ "$has_critical_files" != "true" ]]; then
        log_error "Backup appears to be missing critical files"
        rm -rf "$TEMP_DIR"
        exit 1
    fi

    log_success "Backup integrity verified"
}

# Perform restore operation
perform_restore() {
    local backup_file="$1"

    log_info "Starting restore operation"

    # Create backup directory for extracted files
    local extract_dir="$TEMP_DIR/extracted"
    mkdir -p "$extract_dir"

    # Extract backup
    log_info "Extracting backup files"
    if ! unzip -q "$backup_file" -d "$extract_dir" 2>> "$LOG_FILE"; then
        log_error "Failed to extract backup files"
        rm -rf "$TEMP_DIR"
        exit 1
    fi

    # Restore directories
    local dirs_to_restore=("app" "prisma" "lib" "scripts" "components")

    for dir in "${dirs_to_restore[@]}"; do
        if [[ -d "$extract_dir/$dir" ]]; then
            log_info "Restoring directory: $dir"

            # Remove existing directory if it exists
            if [[ -d "$PROJECT_ROOT/$dir" ]]; then
                rm -rf "$PROJECT_ROOT/$dir"
            fi

            # Copy restored directory
            if ! cp -r "$extract_dir/$dir" "$PROJECT_ROOT/"; then
                log_error "Failed to restore directory: $dir"
                rm -rf "$TEMP_DIR"
                exit 1
            fi

            log_success "Restored: $dir"
        else
            log_warning "Directory not found in backup: $dir"
        fi
    done

    # Restore individual files
    local files_to_restore=("package.json" "package-lock.json" "tsconfig.json" "tailwind.config.js" "next.config.js")

    for file in "${files_to_restore[@]}"; do
        if [[ -f "$extract_dir/$file" ]]; then
            log_info "Restoring file: $file"

            if ! cp "$extract_dir/$file" "$PROJECT_ROOT/"; then
                log_error "Failed to restore file: $file"
                rm -rf "$TEMP_DIR"
                exit 1
            fi

            log_success "Restored: $file"
        fi
    done

    log_success "Restore operation completed"
}

# Cleanup temporary files
cleanup_temp_files() {
    log_info "Cleaning up temporary files"

    if [[ -d "$TEMP_DIR" ]]; then
        rm -rf "$TEMP_DIR"
        log_success "Temporary files cleaned up"
    fi
}

# Verify restore success
verify_restore() {
    log_info "Verifying restore success"

    local critical_files=("package.json" "app" "lib" "scripts")
    local missing_files=()

    for file in "${critical_files[@]}"; do
        if [[ ! -e "$PROJECT_ROOT/$file" ]]; then
            missing_files+=("$file")
        fi
    done

    if [[ ${#missing_files[@]} -ne 0 ]]; then
        log_error "Critical files/directories still missing after restore: ${missing_files[*]}"
        exit 1
    fi

    log_success "Restore verification passed"
}

# Show restore summary
show_restore_summary() {
    echo ""
    echo -e "${GREEN}✅ Code restore completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📦 Restored from:${NC} $SELECTED_BACKUP"
    echo -e "${BLUE}📁 Project root:${NC} $PROJECT_ROOT"
    echo -e "${BLUE}📝 Log file:${NC} $LOG_FILE"
    echo ""
    echo -e "${YELLOW}🔄 Next steps:${NC}"
    echo "  1. Review restored files"
    echo "  2. Run: npm install (if package.json changed)"
    echo "  3. Run: npm run dev"
    echo "  4. Test your application"
    echo ""
    echo -e "${YELLOW}🛡️  Safety backup available:${NC}"
    ls -la "$BACKUP_DIR"/pre-restore_*.zip 2>/dev/null | head -1 || echo "  (none created)"
}

# Main restore function
perform_restore_operation() {
    log "=== Starting ClientLabs Code Restore ==="
    log "Project: $PROJECT_ROOT"
    log "Remote: ${RCLONE_REMOTE}:${RCLONE_PATH}/"

    validate_dependencies
    validate_rclone
    list_available_backups
    get_backup_selection
    confirm_restore
    create_safety_backup

    local backup_file
    backup_file=$(download_backup)
    verify_backup "$backup_file"
    perform_restore "$backup_file"
    cleanup_temp_files
    verify_restore

    log_success "ClientLabs code restore completed successfully"

    show_restore_summary
}

# Handle command line arguments
ACTION="interactive"

while [[ $# -gt 0 ]]; do
    case $1 in
        --list)
            ACTION="list"
            shift
            ;;
        --auto)
            if [[ $# -lt 2 ]]; then
                log_error "--auto requires backup filename argument"
                exit 1
            fi
            ACTION="auto"
            AUTO_BACKUP="$2"
            shift 2
            ;;
        --help)
            echo "ClientLabs Code Restore Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Actions:"
            echo "  (default)     Interactive restore (list and choose backup)"
            echo "  --list        List available backups only"
            echo "  --auto FILE   Automatic restore of specific backup file"
            echo ""
            echo "What gets restored:"
            echo "  • app/ (Next.js application)"
            echo "  • prisma/ (Database schema)"
            echo "  • lib/ (Utility libraries)"
            echo "  • scripts/ (Automation scripts)"
            echo "  • components/ (React components)"
            echo "  • Configuration files (package.json, etc.)"
            echo ""
            echo "Safety features:"
            echo "  • Pre-restore backup of current state"
            echo "  • Integrity verification before restore"
            echo "  • Confirmation required for destructive operations"
            echo ""
            echo "Examples:"
            echo "  $0                    # Interactive restore"
            echo "  $0 --list            # List available backups"
            echo "  $0 --auto backup_2024-01-15_03-00-01.zip"
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
    "interactive")
        perform_restore_operation
        ;;
    "list")
        validate_dependencies
        validate_rclone
        list_available_backups
        ;;
    "auto")
        log_info "Automatic restore mode: $AUTO_BACKUP"
        SELECTED_BACKUP="$AUTO_BACKUP"
        validate_dependencies
        validate_rclone
        create_safety_backup
        local backup_file="$TEMP_DIR/$AUTO_BACKUP"
        # Download the specific backup
        if ! rclone copy "${RCLONE_REMOTE}:${RCLONE_PATH}/$AUTO_BACKUP" "$TEMP_DIR/" 2>> "$LOG_FILE"; then
            log_error "Failed to download backup: $AUTO_BACKUP"
            exit 1
        fi
        verify_backup "$backup_file"
        perform_restore "$backup_file"
        cleanup_temp_files
        verify_restore
        log_success "Automatic restore completed"
        show_restore_summary
        ;;
    *)
        log_error "Invalid action: $ACTION"
        exit 1
        ;;
esac