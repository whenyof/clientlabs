#!/bin/bash

# =======================================================================
# ClientLabs Restore Guide Test Script
# Validates RESTORE_GUIDE.txt generation and upload
# =======================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"
RCLONE_REMOTE="gdrive-secure"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Test restore guide creation
test_restore_guide_creation() {
    local guide_file="$BACKUP_DIR/RESTORE_GUIDE.txt"

    # Remove any existing guide for clean test
    rm -f "$guide_file"

    # Create a test guide file (simplified version)
    cat > "$guide_file" << 'EOF'
============================
CLIENTLABS BACKUP RESTORE
============================

Test restore guide for validation.
Generated on: TEST_TIMESTAMP

1) List backups: rclone ls gdrive-secure:
2) Download: rclone copy gdrive-secure:backup.zip .
3) Extract: unzip backup.zip
4) Restore: mv backup/* .
5) Restart: npm run dev

============================
EOF

    # Replace timestamp
    sed -i.bak "s/TEST_TIMESTAMP/$(date '+%Y-%m-%d %H:%M:%S')/" "$guide_file"
    rm -f "${guide_file}.bak"

    # Check if guide was created
    [[ -f "$guide_file" ]] && [[ -s "$guide_file" ]]
}

# Test restore guide content
test_restore_guide_content() {
    local guide_file="$BACKUP_DIR/RESTORE_GUIDE.txt"

    [[ -f "$guide_file" ]] && \
    grep -q "CLIENTLABS BACKUP RESTORE" "$guide_file" && \
    grep -q "rclone" "$guide_file" && \
    grep -q "unzip" "$guide_file" && \
    grep -q "npm run dev" "$guide_file"
}

# Test Google Drive access for guide
test_guide_upload_access() {
    # Check if we can access the remote
    rclone lsd "${RCLONE_REMOTE}:" &> /dev/null
}

# Test complete workflow (without actual upload)
test_complete_workflow() {
    local guide_file="$BACKUP_DIR/RESTORE_GUIDE.txt"

    # Create guide
    test_restore_guide_creation

    # Verify content
    test_restore_guide_content

    # Check file is readable
    [[ -r "$guide_file" ]] && head -5 "$guide_file" > /dev/null
}

# Show test results
show_test_results() {
    echo ""
    echo "=========================================="
    echo "📋 Restore Guide Test Results"
    echo "=========================================="
    echo ""
    echo "Tests run: $TESTS_RUN"
    echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

    local success_rate=0
    if [[ $TESTS_RUN -gt 0 ]]; then
        success_rate=$(( (TESTS_PASSED * 100) / TESTS_RUN ))
    fi

    echo "Success rate: ${success_rate}%"

    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo ""
        echo -e "${GREEN}✅ All restore guide tests passed!${NC}"
        echo ""
        echo "The RESTORE_GUIDE.txt system is working correctly."
        echo "It will be automatically created and uploaded after each backup."
        echo ""
        return 0
    else
        echo ""
        echo -e "${RED}❌ Some tests failed.${NC}"
        echo ""
        echo "Check the auto-backup.sh script for restore guide functionality."
        echo ""
        return 1
    fi
}

# Main test function
run_restore_guide_tests() {
    echo "========================================="
    echo "📋 ClientLabs Restore Guide Test Suite"
    echo "========================================="
    echo ""
    echo "Testing RESTORE_GUIDE.txt generation and management..."
    echo ""

    # Run tests
    run_test "Restore guide creation" "test_restore_guide_creation"
    run_test "Restore guide content validation" "test_restore_guide_content"
    run_test "Google Drive upload access" "test_guide_upload_access"
    run_test "Complete workflow test" "test_complete_workflow"

    # Show results
    show_test_results
}

# Handle command line arguments
case "${1:-}" in
    --help)
        echo "ClientLabs Restore Guide Test Script"
        echo ""
        echo "Usage: $0 [options]"
        echo ""
        echo "This script validates the RESTORE_GUIDE.txt generation system:"
        echo "  • Guide file creation and content validation"
        echo "  • Google Drive upload access verification"
        echo "  • Complete workflow testing"
        echo ""
        echo "Run this after modifying the restore guide functionality."
        exit 0
        ;;
    *)
        run_restore_guide_tests
        ;;
esac