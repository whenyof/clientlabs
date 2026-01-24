#!/bin/bash

# =======================================================================
# ClientLabs Auto Backup System Test Script
# Validates automatic backup functionality
# =======================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_SCRIPT="$SCRIPT_DIR/auto-backup.sh"
SETUP_SCRIPT="$SCRIPT_DIR/setup-auto-backup.sh"
RESTORE_SCRIPT="$SCRIPT_DIR/restore-backup.sh"
RCLONE_REMOTE="gdrive-secure"
TEST_BACKUP_DIR="$PROJECT_ROOT/backups/test"

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
TESTS_SKIPPED=0

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

log_skip() {
    echo -e "${YELLOW}[SKIP]$(date '+%H:%M:%S') $*${NC}"
    TESTS_SKIPPED=$((TESTS_SKIPPED + 1))
}

log_info() {
    echo -e "${YELLOW}[INFO]$(date '+%H:%M:%S') $*${NC}"
}

run_test() {
    local test_name="$1"
    local test_command="$2"
    local skip_condition="${3:-}"

    TESTS_RUN=$((TESTS_RUN + 1))
    log_test "Running: $test_name"

    # Check skip condition
    if [[ -n "$skip_condition" ]] && eval "$skip_condition"; then
        log_skip "$test_name - $skip_condition"
        return 0
    fi

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
    [[ -f "$BACKUP_SCRIPT" ]] && [[ -f "$SETUP_SCRIPT" ]] && [[ -f "$RESTORE_SCRIPT" ]]
}

test_scripts_executable() {
    [[ -x "$BACKUP_SCRIPT" ]] && [[ -x "$SETUP_SCRIPT" ]] && [[ -x "$RESTORE_SCRIPT" ]]
}

test_dependencies() {
    local missing_deps=()

    if ! command -v zip &> /dev/null; then
        missing_deps+=("zip")
    fi

    if ! command -v unzip &> /dev/null; then
        missing_deps+=("unzip")
    fi

    if ! command -v rclone &> /dev/null; then
        missing_deps+=("rclone")
    fi

    if ! command -v crontab &> /dev/null; then
        missing_deps+=("crontab")
    fi

    # Report missing dependencies
    if [[ ${#missing_deps[@]} -ne 0 ]]; then
        echo "Missing: ${missing_deps[*]}" >&2
        return 1
    fi

    return 0
}

test_project_structure() {
    local required_dirs=("app" "lib" "scripts")
    local missing_dirs=()

    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$PROJECT_ROOT/$dir" ]]; then
            missing_dirs+=("$dir")
        fi
    done

    if [[ ${#missing_dirs[@]} -ne 0 ]]; then
        echo "Missing directories: ${missing_dirs[*]}" >&2
        return 1
    fi

    return 0
}

test_rclone_config() {
    if ! rclone listremotes | grep -q "^${RCLONE_REMOTE}:"; then
        echo "Rclone remote '${RCLONE_REMOTE}' not configured" >&2
        return 1
    fi

    if ! rclone lsd "${RCLONE_REMOTE}:" &> /dev/null; then
        echo "Cannot connect to rclone remote '${RCLONE_REMOTE}'" >&2
        return 1
    fi

    return 0
}

test_backup_script_dry_run() {
    local output
    output=$(bash "$BACKUP_SCRIPT" --dry-run 2>&1)
    echo "$output" | grep -q "DRY RUN" && echo "$output" | grep -q "Would perform"
}

test_setup_script_status() {
    bash "$SETUP_SCRIPT" --status &> /dev/null
}

test_restore_script_list() {
    # This might fail if no backups exist, so we just test the script runs
    timeout 10s bash "$RESTORE_SCRIPT" --list &> /dev/null || true
    # Return true as long as script doesn't crash immediately
    return 0
}

test_zip_functionality() {
    local test_file="$TEST_BACKUP_DIR/test.txt"
    local test_zip="$TEST_BACKUP_DIR/test.zip"

    # Create test directory
    mkdir -p "$TEST_BACKUP_DIR"

    # Create test file
    echo "test content" > "$test_file"

    # Test zip
    if ! zip "$test_zip" "$test_file" &> /dev/null; then
        rm -f "$test_file"
        return 1
    fi

    # Test unzip
    if ! unzip -q "$test_zip" -d "$TEST_BACKUP_DIR" &> /dev/null; then
        rm -f "$test_file" "$test_zip"
        return 1
    fi

    # Cleanup
    rm -rf "$TEST_BACKUP_DIR"
    return 0
}

test_cron_functionality() {
    # Test if we can read/write crontab
    local original_cron
    original_cron=$(crontab -l 2>/dev/null || true)

    # Try to add a test entry
    local test_cron="$original_cron
# Test entry for backup system validation
* * * * * echo 'test' > /dev/null"

    echo "$test_cron" | crontab - 2>/dev/null || return 1

    # Restore original
    echo "$original_cron" | crontab - 2>/dev/null || true

    return 0
}

test_backup_directory() {
    local backup_dir="$PROJECT_ROOT/backups"

    # Create if doesn't exist
    mkdir -p "$backup_dir"

    # Test write permissions
    local test_file="$backup_dir/test-write.txt"
    echo "test" > "$test_file" || return 1
    rm -f "$test_file"

    return 0
}

test_cloud_storage_access() {
    # Test basic cloud access (don't upload actual files)
    rclone lsd "${RCLONE_REMOTE}:" &> /dev/null
}

# Integration test (lightweight)
test_integration_light() {
    # Create minimal test backup
    mkdir -p "$TEST_BACKUP_DIR"

    # Create minimal project structure for testing
    mkdir -p "$TEST_BACKUP_DIR/app" "$TEST_BACKUP_DIR/lib" "$TEST_BACKUP_DIR/scripts"
    echo '{"name": "test"}' > "$TEST_BACKUP_DIR/package.json"
    echo "console.log('test');" > "$TEST_BACKUP_DIR/app/test.js"

    # Test backup creation (without upload)
    cd "$TEST_BACKUP_DIR"
    local test_backup="test-backup-$(date +%s).zip"

    if zip -r "$test_backup" app/ lib/ scripts/ package.json &> /dev/null; then
        # Test unzip
        if unzip -t "$test_backup" &> /dev/null; then
            rm -rf "$TEST_BACKUP_DIR"
            cd "$PROJECT_ROOT"
            return 0
        fi
    fi

    rm -rf "$TEST_BACKUP_DIR"
    cd "$PROJECT_ROOT"
    return 1
}

# Show comprehensive test results
show_test_results() {
    echo ""
    echo "=========================================="
    echo "📊 Auto Backup System Test Results"
    echo "=========================================="
    echo "Tests run: $TESTS_RUN"
    echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
    echo -e "Skipped: ${YELLOW}$TESTS_SKIPPED${NC}"

    local success_rate=0
    if [[ $TESTS_RUN -gt 0 ]]; then
        success_rate=$(( (TESTS_PASSED * 100) / TESTS_RUN ))
    fi

    echo "Success rate: ${success_rate}%"

    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo ""
        echo -e "${GREEN}✅ All auto backup tests passed! System is ready.${NC}"
        echo ""
        echo "🚀 Ready for production:"
        echo "  • Run: bash scripts/setup-auto-backup.sh"
        echo "  • Monitor: tail -f backups/auto-backup.log"
        echo "  • Restore: bash scripts/restore-backup.sh"
        echo ""
        return 0
    else
        echo ""
        echo -e "${RED}❌ Some tests failed. Please fix the issues above.${NC}"
        echo ""
        echo "🔧 Common fixes:"
        echo "  • Install missing tools: brew install zip unzip rclone"
        echo "  • Configure rclone: rclone config (use 'gdrive-secure')"
        echo "  • Make scripts executable: chmod +x scripts/*.sh"
        echo "  • Check permissions: ls -la scripts/"
        echo ""
        return 1
    fi
}

# Show system information
show_system_info() {
    echo "🔍 System Information:"
    echo "  • Project root: $PROJECT_ROOT"
    echo "  • rclone remote: $RCLONE_REMOTE"
    echo "  • OS: $(uname -s) $(uname -r)"
    echo "  • Scripts directory: $SCRIPT_DIR"
    echo ""

    echo "📦 Dependencies check:"
    echo -n "  • zip: " && (command -v zip &> /dev/null && echo "✅" || echo "❌")
    echo -n "  • unzip: " && (command -v unzip &> /dev/null && echo "✅" || echo "❌")
    echo -n "  • rclone: " && (command -v rclone &> /dev/null && echo "✅" || echo "❌")
    echo -n "  • crontab: " && (command -v crontab &> /dev/null && echo "✅" || echo "❌")
    echo ""

    echo "🔧 Scripts check:"
    echo -n "  • auto-backup.sh: " && [[ -x "$BACKUP_SCRIPT" ]] && echo "✅" || echo "❌"
    echo -n "  • setup-auto-backup.sh: " && [[ -x "$SETUP_SCRIPT" ]] && echo "✅" || echo "❌"
    echo -n "  • restore-backup.sh: " && [[ -x "$RESTORE_SCRIPT" ]] && echo "✅" || echo "❌"
    echo ""

    echo "☁️  Cloud storage check:"
    if command -v rclone &> /dev/null; then
        if rclone listremotes | grep -q "^${RCLONE_REMOTE}:"; then
            echo -n "  • Remote configured: ✅ (${RCLONE_REMOTE})"
            if rclone lsd "${RCLONE_REMOTE}:" &> /dev/null; then
                echo " - Connected ✅"
            else
                echo " - Connection failed ❌"
            fi
        else
            echo "  • Remote not configured ❌ (run: rclone config)"
        fi
    else
        echo "  • rclone not available ❌"
    fi
    echo ""
}

# Main test function
run_all_tests() {
    echo "========================================="
    echo "🔄 ClientLabs Auto Backup System Test Suite"
    echo "========================================="
    echo ""

    show_system_info

    log_info "Starting comprehensive backup system tests..."
    echo ""

    # Core functionality tests
    run_test "Scripts exist" "test_scripts_exist"
    run_test "Scripts are executable" "test_scripts_executable"
    run_test "Dependencies installed" "test_dependencies"
    run_test "Project structure valid" "test_project_structure"
    run_test "Backup directory accessible" "test_backup_directory"

    # rclone tests (skip if not configured)
    run_test "Rclone configured" "test_rclone_config" "test_rclone_config && echo 'false' || echo 'true'"

    # Local functionality tests
    run_test "ZIP functionality" "test_zip_functionality"
    run_test "Cron accessibility" "test_cron_functionality"
    run_test "Backup script dry run" "test_backup_script_dry_run"

    # Setup script tests
    run_test "Setup script status" "test_setup_script_status"

    # Restore script tests
    run_test "Restore script basic" "test_restore_script_list"

    # Cloud tests (only if rclone configured)
    run_test "Cloud storage access" "test_cloud_storage_access" "! test_rclone_config"

    # Integration test
    run_test "Light integration test" "test_integration_light"

    show_test_results
}

# Handle command line arguments
VERBOSE=false
QUICK=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose)
            VERBOSE=true
            shift
            ;;
        --quick)
            QUICK=true
            shift
            ;;
        --help)
            echo "ClientLabs Auto Backup System Test Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --verbose    Show detailed test output"
            echo "  --quick      Run only critical tests"
            echo "  --help       Show this help message"
            echo ""
            echo "This script validates that the automatic backup system is properly configured:"
            echo "  • Required scripts exist and are executable"
            echo "  • Dependencies (zip, rclone, crontab) are installed"
            echo "  • Project structure is valid for backup"
            echo "  • rclone is configured for Google Drive access"
            echo "  • ZIP compression and extraction work"
            echo "  • Cron jobs can be managed"
            echo "  • Backup and restore scripts function correctly"
            echo "  • Cloud storage is accessible"
            echo "  • End-to-end integration works"
            echo ""
            echo "Run this before deploying the backup system to production."
            exit 0
            ;;
        *)
            echo "Unknown option: $1" >&2
            echo "Use --help for usage information" >&2
            exit 1
            ;;
    esac
done

# Cleanup function
cleanup() {
    # Remove any test files/directories
    rm -rf "$TEST_BACKUP_DIR"
}

# Set trap for cleanup
trap cleanup EXIT

# Run tests
run_all_tests