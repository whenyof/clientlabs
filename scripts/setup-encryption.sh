#!/bin/bash

# =======================================================================
# ClientLabs Encryption Setup Script
# Configure AES-256 backup encryption for the first time
# =======================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging functions
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$PROJECT_ROOT/encryption-setup.log"
}

log_error() {
    echo -e "${RED}[ERROR]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}" >&2
    echo "[ERROR][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$PROJECT_ROOT/encryption-setup.log"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}"
    echo "[SUCCESS][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$PROJECT_ROOT/encryption-setup.log"
}

log_info() {
    echo -e "${BLUE}[INFO]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}"
    echo "[INFO][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$PROJECT_ROOT/encryption-setup.log"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]$(date '+%Y-%m-%d %H:%M:%S') $*${NC}"
    echo "[WARNING][$(date '+%Y-%m-%d %H:%M:%S')] $*" >> "$PROJECT_ROOT/encryption-setup.log"
}

# Validate environment
validate_environment() {
    if [[ ! -f "$PROJECT_ROOT/.env" ]] && [[ ! -f "$PROJECT_ROOT/.env.local" ]]; then
        log_error "No environment file found (.env or .env.local)"
        log_error "Create one first: cp .env.example .env"
        exit 1
    fi

    log_info "Environment files found"
}

# Check if BACKUP_SECRET already exists
check_existing_secret() {
    local env_file=""
    if [[ -f "$PROJECT_ROOT/.env.local" ]]; then
        env_file="$PROJECT_ROOT/.env.local"
    elif [[ -f "$PROJECT_ROOT/.env" ]]; then
        env_file="$PROJECT_ROOT/.env"
    fi

    if [[ -n "$env_file" ]]; then
        local existing_secret=$(grep "^BACKUP_SECRET=" "$env_file" 2>/dev/null | cut -d '=' -f2- | sed 's/^"//' | sed 's/"$//')

        if [[ -n "$existing_secret" ]]; then
            log_warning "BACKUP_SECRET already exists in $env_file"
            echo -n "Do you want to replace it? (y/N): "
            read -r response
            if [[ ! "$response" =~ ^[Yy]$ ]]; then
                log_info "Setup cancelled by user"
                exit 0
            fi
        fi
    fi
}

# Generate secure backup secret
generate_backup_secret() {
    log_info "Generating secure AES-256 encryption key..."

    if ! command -v openssl &> /dev/null; then
        log_error "OpenSSL not found. Install with: brew install openssl"
        exit 1
    fi

    # Generate 256-bit (32 byte) key as hex
    BACKUP_SECRET=$(openssl rand -hex 32)

    if [[ ${#BACKUP_SECRET} -ne 64 ]]; then
        log_error "Failed to generate valid key"
        exit 1
    fi

    log_success "Generated 256-bit encryption key"
    log_info "Key length: 64 characters (${#BACKUP_SECRET} chars)"
}

# Update environment file
update_env_file() {
    local env_file=""
    local backup_file=""

    # Determine which env file to use
    if [[ -f "$PROJECT_ROOT/.env.local" ]]; then
        env_file="$PROJECT_ROOT/.env.local"
        backup_file="$PROJECT_ROOT/.env.local.backup"
    elif [[ -f "$PROJECT_ROOT/.env" ]]; then
        env_file="$PROJECT_ROOT/.env"
        backup_file="$PROJECT_ROOT/.env.backup"
    fi

    # Create backup of original file
    cp "$env_file" "$backup_file"
    log_info "Created backup: $backup_file"

    # Remove existing BACKUP_SECRET if present
    sed -i.bak '/^BACKUP_SECRET=/d' "$env_file" && rm "${env_file}.bak" 2>/dev/null || true

    # Add new BACKUP_SECRET
    echo "" >> "$env_file"
    echo "# AES-256 Backup Encryption Key (Generated $(date '+%Y-%m-%d %H:%M:%S'))" >> "$env_file"
    echo "BACKUP_SECRET=$BACKUP_SECRET" >> "$env_file"

    log_success "Updated $env_file with encryption key"
}

# Make scripts executable
setup_scripts() {
    local scripts=(
        "$SCRIPT_DIR/backup.sh"
        "$SCRIPT_DIR/encrypt.sh"
        "$SCRIPT_DIR/decrypt.sh"
        "$SCRIPT_DIR/test-encryption.sh"
        "$SCRIPT_DIR/setup-cron.sh"
    )

    for script in "${scripts[@]}"; do
        if [[ -f "$script" ]]; then
            chmod +x "$script"
            log_info "Made executable: $(basename "$script")"
        else
            log_warning "Script not found: $(basename "$script")"
        fi
    done

    log_success "All scripts configured"
}

# Test encryption setup
test_setup() {
    log_info "Testing encryption setup..."

    # Test OpenSSL AES
    if ! echo "test" | openssl enc -aes-256-cbc -pbkdf2 -iter 10000 -salt -pass pass:"$BACKUP_SECRET" -out /tmp/test.enc 2>/dev/null; then
        log_error "OpenSSL AES test failed"
        exit 1
    fi

    # Test decryption
    if ! openssl enc -aes-256-cbc -d -pbkdf2 -iter 10000 -salt -pass pass:"$BACKUP_SECRET" -in /tmp/test.enc 2>/dev/null | grep -q "test"; then
        log_error "OpenSSL AES decryption test failed"
        rm -f /tmp/test.enc
        exit 1
    fi

    rm -f /tmp/test.enc
    log_success "Encryption/decryption test passed"
}

# Create initial backup directory
setup_backup_directory() {
    mkdir -p "$PROJECT_ROOT/backups"
    log_info "Created backup directory: $PROJECT_ROOT/backups"

    # Create .gitkeep to ensure directory is tracked
    touch "$PROJECT_ROOT/backups/.gitkeep"
}

# Show setup summary
show_summary() {
    echo ""
    echo -e "${GREEN}✅ ClientLabs Encryption Setup Complete!${NC}"
    echo ""
    echo -e "${BLUE}📋 What was configured:${NC}"
    echo "  • AES-256 encryption key generated and stored"
    echo "  • Environment file updated with BACKUP_SECRET"
    echo "  • Backup scripts made executable"
    echo "  • Backup directory created"
    echo "  • Encryption functionality tested"
    echo ""
    echo -e "${BLUE}🔐 Security Details:${NC}"
    echo "  • Algorithm: AES-256-CBC with PBKDF2"
    echo "  • Key Length: 256-bit (32 bytes)"
    echo "  • Iterations: 10,000 (PBKDF2)"
    echo "  • Salt: Random 8-byte per encryption"
    echo ""
    echo -e "${BLUE}📁 Files Modified:${NC}"
    echo "  • .env (BACKUP_SECRET added)"
    echo "  • .env.backup (original backup created)"
    echo ""
    echo -e "${BLUE}🚀 Next Steps:${NC}"
    echo "  1. Test the system: bash scripts/test-encryption.sh"
    echo "  2. Create first backup: bash scripts/backup.sh"
    echo "  3. Encrypt it: bash scripts/encrypt.sh"
    echo "  4. Setup automation: bash scripts/setup-cron.sh"
    echo "  5. Access admin dashboard: /dashboard/admin/backups"
    echo ""
    echo -e "${YELLOW}⚠️  Security Reminder:${NC}"
    echo "  • Keep BACKUP_SECRET secure and backed up separately"
    echo "  • Never commit .env files to version control"
    echo "  • Test restore procedures regularly"
    echo "  • Monitor backup logs for errors"
    echo ""
    echo -e "${GREEN}🎉 Your backups are now military-grade encrypted! 🛡️${NC}"
}

# Main function
main() {
    log "=== Starting ClientLabs Encryption Setup ==="

    echo "=========================================="
    echo "🔐 ClientLabs Encryption Setup"
    echo "=========================================="
    echo ""
    echo "This will configure AES-256 encryption for your database backups."
    echo ""
    echo -e "${YELLOW}⚠️  Important:${NC}"
    echo "  • A secure encryption key will be generated"
    echo "  • Your .env file will be modified"
    echo "  • A backup of your .env will be created"
    echo ""
    echo -n "Continue with setup? (y/N): "

    read -r confirmation
    if [[ ! "$confirmation" =~ ^[Yy]$ ]]; then
        log_info "Setup cancelled by user"
        exit 0
    fi

    validate_environment
    check_existing_secret
    generate_backup_secret
    update_env_file
    setup_scripts
    test_setup
    setup_backup_directory

    log_success "ClientLabs encryption setup completed successfully"

    show_summary
}

# Help function
show_help() {
    echo "ClientLabs Encryption Setup Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "This script configures AES-256 encryption for database backups:"
    echo "  • Generates a secure 256-bit encryption key"
    echo "  • Updates your .env file with BACKUP_SECRET"
    echo "  • Makes backup scripts executable"
    echo "  • Tests encryption functionality"
    echo "  • Creates backup directory structure"
    echo ""
    echo "Options:"
    echo "  --help     Show this help message"
    echo ""
    echo "Requirements:"
    echo "  • OpenSSL installed (brew install openssl)"
    echo "  • .env or .env.local file exists"
    echo "  • Write permissions to project directory"
    echo ""
    echo "Security:"
    echo "  • Uses AES-256-CBC with PBKDF2 key derivation"
    echo "  • Generates cryptographically secure random keys"
    echo "  • Creates backup of original .env file"
    echo "  • Never displays the encryption key in logs"
}

# Parse command line arguments
case "${1:-}" in
    --help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac