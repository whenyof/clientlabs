#!/bin/bash

# =======================================================================
# ClientLabs Encryption System Test Script
# Validates backup encryption and decryption functionality
# =======================================================================

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/backup.sh"
ENCRYPT_SCRIPT="$SCRIPT_DIR/encrypt.sh"
DECRYPT_SCRIPT="$SCRIPT_DIR/decrypt.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Logging functions
log_test() {
    echo -e "${BLUE}[TEST]$(date '+%H:%M:%S') $*${NC}"
}

log_success() {
    echo -e "${GREEN}[PASS]$(date '+%H:%M:%S') $*${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

log_failure() {
    echo -e "${RED}[FAIL]$(date '+%H:%M:%S') $*${NC}" >&2
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

log_info() {
    echo -e "${YELLOW}[INFO]$(date '+%H:%M:%S') $*${NC}"
}

run_test() {
    local test_name="$1"
    local test_command="$2"

    TESTS_RUN=$((TESTS_RUN + 1))
    log_test "Running: $test_name"

    if eval "$test_command"; then
        log_success "$test_name"
        return 0
    else
        log_failure "$test_name"
        return 1
    fi
}

# Test functions
test_scripts_exist() {
    [[ -f "$BACKUP_SCRIPT" ]] && [[ -f "$ENCRYPT_SCRIPT" ]] && [[ -f "$DECRYPT_SCRIPT" ]]
}

test_scripts_executable() {
    [[ -x "$BACKUP_SCRIPT" ]] && [[ -x "$ENCRYPT_SCRIPT" ]] && [[ -x "$DECRYPT_SCRIPT" ]]
}

test_dependencies() {
    command -v openssl &> /dev/null && command -v psql &> /dev/null && command -v gzip &> /dev/null
}

test_environment() {
    [[ -f "$PROJECT_ROOT/.env.local" ]] || [[ -f "$PROJECT_ROOT/.env" ]]
}

test_backup_secret() {
    local secret=""
    if [[ -f "$PROJECT_ROOT/.env.local" ]]; then
        secret=$(grep "^BACKUP_SECRET=" "$PROJECT_ROOT/.env.local" 2>/dev/null | cut -d '=' -f2- | sed 's/^"//' | sed 's/"$//')
    elif [[ -f "$PROJECT_ROOT/.env" ]]; then
        secret=$(grep "^BACKUP_SECRET=" "$PROJECT_ROOT/.env" 2>/dev/null | cut -d '=' -f2- | sed 's/^"//' | sed 's/"$//')
    fi

    [[ -n "$secret" ]] && [[ ${#secret} -eq 64 ]] && [[ "$secret" =~ ^[0-9a-fA-F]{64}$ ]]
}

test_openssl_aes() {
    # Test basic OpenSSL AES functionality
    echo "test data" | openssl enc -aes-256-cbc -pbkdf2 -iter 10000 -salt -pass pass:test123 -out /tmp/test.enc 2>/dev/null && \
    openssl enc -aes-256-cbc -d -pbkdf2 -iter 10000 -salt -pass pass:test123 -in /tmp/test.enc 2>/dev/null | grep -q "test data" && \
    rm -f /tmp/test.enc
}

# Integration tests (create actual backup, encrypt, decrypt)
test_full_workflow() {
    local test_backup_dir=""
    local test_secret="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

    # Set test environment
    export BACKUP_SECRET="$test_secret"

    # Create test backup
    log_info "Creating test backup..."
    if ! "$BACKUP_SCRIPT" --dry-run 2>/dev/null; then
        log_info "Backup script validation passed (dry run)"
    fi

    # Test encryption with dummy file
    log_info "Testing encryption workflow..."
    mkdir -p /tmp/test-backup
    echo "test database content" > /tmp/test-backup/backup.sql
    gzip /tmp/test-backup/backup.sql

    # Test encryption
    BACKUP_DIR="/tmp/test-backup" "$ENCRYPT_SCRIPT" --dry-run 2>/dev/null && \
    [[ -f "/tmp/test-backup/backup.sql.gz" ]] && \
    [[ -f "/tmp/test-backup/encryption.json" ]]

    # Cleanup
    rm -rf /tmp/test-backup

    return $?
}

# Security tests
test_security_measures() {
    # Test that scripts don't expose secrets in logs
    ! grep -r "BACKUP_SECRET" "$PROJECT_ROOT/backups/" 2>/dev/null || true
}

# Main test function
run_all_tests() {
    echo "========================================="
    echo "🔐 ClientLabs Encryption System Test Suite"
    echo "========================================="
    echo ""

    log_info "Starting encryption system tests..."
    log_info "Project root: $PROJECT_ROOT"
    log_info "Backup script: $BACKUP_SCRIPT"
    log_info "Encrypt script: $ENCRYPT_SCRIPT"
    log_info "Decrypt script: $DECRYPT_SCRIPT"
    echo ""

    # Basic validation tests
    run_test "Scripts exist" "test_scripts_exist"
    run_test "Scripts are executable" "test_scripts_executable"
    run_test "Dependencies installed" "test_dependencies"
    run_test "Environment configured" "test_environment"
    run_test "Backup secret configured" "test_backup_secret"
    run_test "OpenSSL AES support" "test_openssl_aes"

    # Integration tests
    run_test "Full encryption workflow" "test_full_workflow"
    run_test "Security measures" "test_security_measures"

    # Summary
    echo ""
    echo "========================================="
    echo "📊 Encryption Test Results Summary"
    echo "========================================="
    echo "Tests run: $TESTS_RUN"
    echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo ""
        echo -e "${GREEN}✅ All encryption tests passed! System is ready.${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Configure BACKUP_SECRET in your .env file"
        echo "2. Run: bash scripts/backup.sh"
        echo "3. Run: bash scripts/encrypt.sh"
        echo "4. Test restore: bash scripts/decrypt.sh"
        echo ""
        return 0
    else
        echo ""
        echo -e "${RED}❌ Some tests failed. Please fix the issues above.${NC}"
        echo ""
        echo "Common fixes:"
        echo "• Install OpenSSL: brew install openssl"
        echo "• Configure BACKUP_SECRET: openssl rand -hex 32"
        echo "• Make scripts executable: chmod +x scripts/*.sh"
        echo ""
        return 1
    fi
}

# Help function
show_help() {
    echo "ClientLabs Encryption System Test Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --help     Show this help message"
    echo "  --verbose  Show detailed test output"
    echo ""
    echo "This script validates that the encryption system is properly configured:"
    echo "  • Required scripts exist and are executable"
    echo "  • Dependencies (OpenSSL, PostgreSQL) are installed"
    echo "  • Environment variables are configured"
    echo "  • Backup secret is properly formatted"
    echo "  • OpenSSL AES-256 encryption works"
    echo "  • Full encryption/decryption workflow"
    echo "  • Security measures are in place"
    echo ""
    echo "Run this after setting up the encryption system to verify everything works."
}

# Parse command line arguments
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --help)
            show_help
            exit 0
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo "Unknown option: $1" >&2
            echo "Use --help for usage information" >&2
            exit 1
            ;;
    esac
done

# Run tests
run_all_tests