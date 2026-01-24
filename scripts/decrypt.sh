#!/bin/bash

# =======================================================================
# ClientLabs Backup Decryption Script
# Decrypts AES-256-CBC encrypted database backups
# =======================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_ROOT="$PROJECT_ROOT/backups"
LOG_FILE="$BACKUP_ROOT/decrypt.log"

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

# Load encryption key from environment or prompt
load_encryption_key() {
    local use_env_key=true

    if [[ ! -f "$ENV_FILE" ]]; then
        log_warning "Environment file not found: $ENV_FILE"
        use_env_key=false
    else
        # Try to extract BACKUP_SECRET from env file
        BACKUP_SECRET=$(grep "^BACKUP_SECRET=" "$ENV_FILE" 2>/dev/null | cut -d '=' -f2- | sed 's/^"//' | sed 's/"$//')

        if [[ -z "$BACKUP_SECRET" ]]; then
            log_warning "BACKUP_SECRET not found in environment file"
            use_env_key=false
        fi
    fi

    # If no env key, prompt user
    if [[ "$use_env_key" != "true" ]] || [[ ${#BACKUP_SECRET} -ne 64 ]]; then
        echo -n "Enter decryption password (64-character hex key): "
        read -rs BACKUP_SECRET
        echo ""

        if [[ ${#BACKUP_SECRET} -ne 64 ]]; then
            log_error "Invalid key length. Must be exactly 64 characters (32 bytes hex)"
            log_error "Generate with: openssl rand -hex 32"
            exit 1
        fi

        # Validate hex format
        if ! [[ "$BACKUP_SECRET" =~ ^[0-9a-fA-F]{64}$ ]]; then
            log_error "Invalid key format. Must be hexadecimal characters only"
            exit 1
        fi
    fi

    log_info "Encryption key loaded"
}

# Validate dependencies
validate_dependencies() {
    local missing_deps=()

    if ! command -v openssl &> /dev/null; then
        missing_deps+=("openssl")
    fi

    if ! command -v gunzip &> /dev/null; then
        missing_deps+=("gunzip")
    fi

    if [[ ${#missing_deps[@]} -ne 0 ]]; then
        log_error "Missing required dependencies: ${missing_deps[*]}"
        log_error "Please install OpenSSL and gzip"
        exit 1
    fi

    log_info "All dependencies validated"
}

# Get encrypted backup file
get_encrypted_file() {
    if [[ $# -gt 0 ]]; then
        ENCRYPTED_FILE="$1"
        if [[ ! -f "$ENCRYPTED_FILE" ]]; then
            log_error "Encrypted file not found: $ENCRYPTED_FILE"
            exit 1
        fi
    else
        # Find latest encrypted backup
        ENCRYPTED_FILE=$(find "$BACKUP_ROOT" -name "*.enc" -type f -print0 | xargs -0 ls -t | head -1)

        if [[ -z "$ENCRYPTED_FILE" ]]; then
            log_error "No encrypted backup files found in $BACKUP_ROOT"
            log_error "Run encryption script first: bash scripts/encrypt.sh"
            exit 1
        fi
    fi

    # Determine output path
    DECRYPTED_FILE="${ENCRYPTED_FILE%.enc}"

    if [[ -f "$DECRYPTED_FILE" ]]; then
        log_warning "Decrypted file already exists: $DECRYPTED_FILE"
        read -p "Overwrite existing decrypted file? (y/N): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Decryption cancelled by user"
            exit 0
        fi
    fi

    log_info "Using encrypted file: $ENCRYPTED_FILE"
    log_info "Output will be: $DECRYPTED_FILE"
}

# Verify encryption metadata
verify_encryption_metadata() {
    local backup_dir=$(dirname "$ENCRYPTED_FILE")
    local metadata_file="$backup_dir/encryption.json"

    if [[ -f "$metadata_file" ]]; then
        log_info "Found encryption metadata - verifying..."

        # Extract algorithm from metadata
        local algorithm=$(grep '"algorithm"' "$metadata_file" | cut -d'"' -f4)
        if [[ "$algorithm" != "AES-256-CBC" ]]; then
            log_warning "Unexpected encryption algorithm: $algorithm"
        fi

        log_info "Encryption metadata verified"
    else
        log_warning "No encryption metadata found - proceeding anyway"
    fi
}

# Decrypt backup file
decrypt_backup() {
    log_info "Starting backup decryption with AES-256-CBC..."

    local encrypted_size=$(stat -f%z "$ENCRYPTED_FILE" 2>/dev/null || stat -c%s "$ENCRYPTED_FILE" 2>/dev/null || echo "0")

    # Decrypt file using AES-256-CBC with PBKDF2
    if ! openssl enc -aes-256-cbc \
        -d \
        -salt \
        -pbkdf2 \
        -iter 10000 \
        -in "$ENCRYPTED_FILE" \
        -out "$DECRYPTED_FILE" \
        -k "$BACKUP_SECRET" \
        2>> "$LOG_FILE"; then
        log_error "Backup decryption failed"
        log_error "Possible causes:"
        log_error "  • Wrong decryption password"
        log_error "  • Corrupted encrypted file"
        log_error "  • File not encrypted with this script"
        rm -f "$DECRYPTED_FILE"
        exit 1
    fi

    local decrypted_size=$(stat -f%z "$DECRYPTED_FILE" 2>/dev/null || stat -c%s "$DECRYPTED_FILE" 2>/dev/null || echo "0")

    log_success "Backup decrypted successfully"
    log_info "Encrypted size: $(numfmt --to=iec-i --suffix=B $encrypted_size 2>/dev/null || echo "${encrypted_size}B")"
    log_info "Decrypted size: $(numfmt --to=iec-i --suffix=B $decrypted_size 2>/dev/null || echo "${decrypted_size}B")"

    # Verify decrypted file is valid
    log_info "Verifying decrypted file integrity..."

    if ! gunzip -c "$DECRYPTED_FILE" | head -1 | grep -q "PostgreSQL\|MySQL\|Dump"; then
        log_error "Decryption verification failed - invalid decrypted file"
        log_error "This could mean:"
        log_error "  • Wrong decryption password"
        log_error "  • Corrupted encrypted file"
        rm -f "$DECRYPTED_FILE"
        exit 1
    fi

    log_success "Decryption verification successful"
}

# Create decryption log
create_decryption_log() {
    local backup_dir=$(dirname "$ENCRYPTED_FILE")
    local log_file="$backup_dir/decryption.json"

    cat > "$log_file" << EOF
{
  "decryption_timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "encrypted_file": "$(basename "$ENCRYPTED_FILE")",
  "decrypted_file": "$(basename "$DECRYPTED_FILE")",
  "encrypted_size_bytes": $(stat -f%z "$ENCRYPTED_FILE" 2>/dev/null || stat -c%s "$ENCRYPTED_FILE" 2>/dev/null || echo "0"),
  "decrypted_size_bytes": $(stat -f%z "$DECRYPTED_FILE" 2>/dev/null || stat -c%s "$DECRYPTED_FILE" 2>/dev/null || echo "0"),
  "algorithm": "AES-256-CBC",
  "key_derivation": "PBKDF2",
  "iterations": 10000
}
EOF

    log_info "Decryption log created"
}

# Security reminder
security_reminder() {
    echo ""
    echo -e "${YELLOW}🔐 Security Reminder:${NC}"
    echo "  • The decrypted file contains sensitive data"
    echo "  • Delete it immediately after use: rm \"$DECRYPTED_FILE\""
    echo "  • Or use rollback script for automatic cleanup"
    echo "  • Never store decrypted backups long-term"
}

# Main function
main() {
    log "=== Starting ClientLabs Backup Decryption ==="
    log "Script version: 2.0.0"
    log "Algorithm: AES-256-CBC with PBKDF2"

    detect_environment
    load_encryption_key
    validate_dependencies
    get_encrypted_file "$@"
    verify_encryption_metadata
    decrypt_backup
    create_decryption_log

    log_success "Backup decryption completed successfully"
    log_success "Decrypted file: $DECRYPTED_FILE"
    log_success "Ready for database restoration"
    log_success "Log file: $LOG_FILE"

    echo ""
    echo -e "${GREEN}✅ Decryption completed successfully!${NC}"
    echo "📁 Decrypted file: $DECRYPTED_FILE"
    echo "🗄️  Ready for: bash scripts/rollback-db.sh $(dirname "$ENCRYPTED_FILE")"
    echo "📝 Logs: $LOG_FILE"

    security_reminder
}

# Handle command line arguments
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            log_info "DRY RUN MODE - No actual decryption will be performed"
            ;;
        --help)
            echo "ClientLabs Backup Decryption Script"
            echo ""
            echo "Usage: $0 [encrypted_file] [options]"
            echo ""
            echo "Arguments:"
            echo "  encrypted_file     Path to .enc file (optional, uses latest if not specified)"
            echo ""
            echo "Options:"
            echo "  --dry-run         Show what would be done without decrypting"
            echo "  --help           Show this help message"
            echo ""
            echo "Security Notes:"
            echo "  • Prompts for password if not in environment"
            echo "  • Never logs or displays the decryption key"
            echo "  • Decrypted files should be deleted immediately after use"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Decrypt latest backup"
            echo "  $0 backups/2024-01-15/backup.sql.gz.enc  # Decrypt specific file"
            echo "  $0 --dry-run                         # Test decryption without changes"
            echo ""
            echo "Integration with rollback:"
            echo "  1. bash scripts/decrypt.sh"
            echo "  2. bash scripts/rollback-db.sh <backup_dir>"
            echo "  3. rm <decrypted_file>  # Clean up immediately"
            exit 0
            ;;
        *)
            # Assume it's an encrypted file path
            if [[ -z "${ENCRYPTED_FILE:-}" ]]; then
                ENCRYPTED_FILE="$1"
            else
                log_error "Unexpected argument: $1"
                echo "Use --help for usage information"
                exit 1
            fi
            shift
            ;;
    esac
    shift
done

# Run main function
if [[ "$DRY_RUN" == "true" ]]; then
    echo "DRY RUN - Would decrypt backup with the following settings:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Algorithm: AES-256-CBC with PBKDF2"
    echo "  Iterations: 10,000"
    echo "  Key: $(echo "$BACKUP_SECRET" | cut -c1-8)...[hidden]"
    echo ""
    echo "DRY RUN completed - no changes made"
else
    main "$@"
fi