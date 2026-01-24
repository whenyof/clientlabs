#!/bin/bash

# =======================================================================
# ClientLabs Backup Manager - Unified Interface
# Single entry point for all backup operations
# =======================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Display banner
show_banner() {
    echo ""
    echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║${NC} ${GREEN}🏗️  ClientLabs Backup Manager - Enterprise Code Backups${NC} ${CYAN}║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Show main menu
show_main_menu() {
    echo -e "${BLUE}Available Operations:${NC}"
    echo ""
    echo -e "  ${CYAN}1)${NC} 🚀 Setup Auto Backup     - Configure daily automated backups"
    echo -e "  ${CYAN}2)${NC} 💾 Manual Backup         - Create backup right now"
    echo -e "  ${CYAN}3)${NC} 📋 List Backups          - Show available backups"
    echo -e "  ${CYAN}4)${NC} 🔄 Restore Backup        - Interactive restore"
    echo -e "  ${CYAN}5)${NC} 📊 System Status         - Check backup system health"
    echo -e "  ${CYAN}6)${NC} 🧪 Run Tests             - Validate backup system"
    echo -e "  ${CYAN}7)${NC} ⚙️  Advanced Options      - Cron, logs, configuration"
    echo -e "  ${CYAN}8)${NC} 📚 Documentation        - Open backup documentation"
    echo ""
    echo -e "  ${CYAN}0)${NC} Exit"
    echo ""
}

# Show advanced menu
show_advanced_menu() {
    echo ""
    echo -e "${BLUE}Advanced Options:${NC}"
    echo ""
    echo -e "  ${CYAN}1)${NC} ⏰ Cron Management      - Setup/remove automated backups"
    echo -e "  ${CYAN}2)${NC} 📝 View Logs            - Show backup operation logs"
    echo -e "  ${CYAN}3)${NC} 🔧 Validate System      - Production readiness check"
    echo -e "  ${CYAN}4)${NC} 🧹 Cleanup              - Remove old local files"
    echo -e "  ${CYAN}5)${NC} 📊 Backup Statistics    - Show usage and metrics"
    echo -e "  ${CYAN}6)${NC} ⚡ Emergency Restore    - Quick restore commands"
    echo ""
    echo -e "  ${CYAN}0)${NC} Back to Main Menu"
    echo ""
}

# Execute operations
execute_setup_auto_backup() {
    echo ""
    echo -e "${GREEN}Setting up automated daily backups...${NC}"
    echo ""
    bash "$SCRIPT_DIR/setup-auto-backup.sh"
}

execute_manual_backup() {
    echo ""
    echo -e "${GREEN}Creating manual backup right now...${NC}"
    echo ""
    echo -n "Include dry-run test first? (y/N): "
    read -r do_dry_run

    if [[ "$do_dry_run" =~ ^[Yy]$ ]]; then
        echo ""
        echo -e "${YELLOW}Running dry-run test...${NC}"
        bash "$SCRIPT_DIR/auto-backup.sh" --dry-run
        echo ""
        echo -n "Dry-run successful. Proceed with actual backup? (y/N): "
        read -r proceed
        if [[ ! "$proceed" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}Backup cancelled.${NC}"
            return
        fi
    fi

    echo ""
    bash "$SCRIPT_DIR/auto-backup.sh"
}

execute_list_backups() {
    echo ""
    echo -e "${GREEN}Listing available backups...${NC}"
    echo ""
    bash "$SCRIPT_DIR/restore-backup.sh" --list
}

execute_restore_backup() {
    echo ""
    echo -e "${GREEN}Starting interactive restore...${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  WARNING: This will overwrite existing files!${NC}"
    echo -n "Are you sure you want to continue? (y/N): "
    read -r confirm

    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        echo ""
        bash "$SCRIPT_DIR/restore-backup.sh"
    else
        echo -e "${YELLOW}Restore cancelled.${NC}"
    fi
}

execute_system_status() {
    echo ""
    echo -e "${GREEN}Checking backup system status...${NC}"
    echo ""

    # Quick status checks
    echo -e "${BLUE}📊 System Status:${NC}"

    # Scripts check
    local scripts_ok=true
    for script in auto-backup.sh setup-auto-backup.sh restore-backup.sh; do
        if [[ ! -x "$SCRIPT_DIR/$script" ]]; then
            scripts_ok=false
            break
        fi
    done

    if $scripts_ok; then
        echo -e "  ✅ Scripts: ${GREEN}All executable${NC}"
    else
        echo -e "  ❌ Scripts: ${RED}Some not executable${NC}"
    fi

    # Dependencies check
    if command -v rclone &> /dev/null && command -v zip &> /dev/null; then
        echo -e "  ✅ Dependencies: ${GREEN}Available${NC}"
    else
        echo -e "  ❌ Dependencies: ${RED}Missing some${NC}"
    fi

    # rclone remote check
    if rclone listremotes 2>/dev/null | grep -q "gdrive-secure:"; then
        echo -e "  ✅ Cloud Storage: ${GREEN}Configured${NC}"
    else
        echo -e "  ❌ Cloud Storage: ${RED}Not configured${NC}"
    fi

    # Cron job check
    if crontab -l 2>/dev/null | grep -q "auto-backup.sh"; then
        echo -e "  ✅ Automation: ${GREEN}Active${NC}"
    else
        echo -e "  ⚠️  Automation: ${YELLOW}Not configured${NC}"
    fi

    # Recent backups check
    local recent_backups
    recent_backups=$(find "$PROJECT_ROOT/backups" -name "auto-backup.log" -mtime -1 2>/dev/null | wc -l)
    if [[ $recent_backups -gt 0 ]]; then
        echo -e "  ✅ Recent Backup: ${GREEN}Found (< 24h)${NC}"
    else
        echo -e "  ⚠️  Recent Backup: ${YELLOW}None recent${NC}"
    fi

    echo ""
    echo -e "${BLUE}🔍 For detailed validation, run:${NC}"
    echo "  bash scripts/validate-backup-system.sh"
    echo ""
}

execute_run_tests() {
    echo ""
    echo -e "${GREEN}Running comprehensive backup system tests...${NC}"
    echo ""
    bash "$SCRIPT_DIR/test-auto-backup.sh"
}

execute_advanced_cron() {
    echo ""
    echo -e "${GREEN}Cron Job Management${NC}"
    echo ""
    echo -e "${BLUE}Current status:${NC}"
    bash "$SCRIPT_DIR/setup-auto-backup.sh" --status
    echo ""
    echo -e "${BLUE}Options:${NC}"
    echo "  1) Setup automated backups"
    echo "  2) Remove automated backups"
    echo "  3) Test cron configuration"
    echo ""
    echo -n "Choose option (1-3): "
    read -r choice

    case $choice in
        1)
            echo ""
            bash "$SCRIPT_DIR/setup-auto-backup.sh"
            ;;
        2)
            echo ""
            bash "$SCRIPT_DIR/setup-auto-backup.sh" --remove
            ;;
        3)
            echo ""
            bash "$SCRIPT_DIR/setup-auto-backup.sh" --test
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
}

execute_view_logs() {
    echo ""
    echo -e "${GREEN}Backup System Logs${NC}"
    echo ""
    echo -e "${BLUE}Available logs:${NC}"
    echo "  1) Main backup log"
    echo "  2) Cron job log"
    echo "  3) Restore log"
    echo "  4) All logs"
    echo ""
    echo -n "Choose log to view (1-4): "
    read -r choice

    echo ""
    case $choice in
        1)
            echo -e "${CYAN}=== Main Backup Log ===${NC}"
            tail -20 "$PROJECT_ROOT/backups/auto-backup.log" 2>/dev/null || echo "No main backup log found"
            ;;
        2)
            echo -e "${CYAN}=== Cron Job Log ===${NC}"
            tail -20 "$PROJECT_ROOT/backups/cron-auto-backup.log" 2>/dev/null || echo "No cron log found"
            ;;
        3)
            echo -e "${CYAN}=== Restore Log ===${NC}"
            tail -20 "$PROJECT_ROOT/backups/restore.log" 2>/dev/null || echo "No restore log found"
            ;;
        4)
            echo -e "${CYAN}=== All Backup Logs ===${NC}"
            echo ""
            echo -e "${YELLOW}Main Backup Log:${NC}"
            tail -10 "$PROJECT_ROOT/backups/auto-backup.log" 2>/dev/null || echo "No main backup log found"
            echo ""
            echo -e "${YELLOW}Cron Job Log:${NC}"
            tail -10 "$PROJECT_ROOT/backups/cron-auto-backup.log" 2>/dev/null || echo "No cron log found"
            echo ""
            echo -e "${YELLOW}Restore Log:${NC}"
            tail -10 "$PROJECT_ROOT/backups/restore.log" 2>/dev/null || echo "No restore log found"
            ;;
        *)
            echo -e "${RED}Invalid option${NC}"
            ;;
    esac
    echo ""
}

execute_validate_system() {
    echo ""
    echo -e "${GREEN}Running production readiness validation...${NC}"
    echo ""
    bash "$SCRIPT_DIR/validate-backup-system.sh"
}

execute_cleanup() {
    echo ""
    echo -e "${GREEN}Cleaning up old local backup files...${NC}"
    echo ""

    local old_files
    old_files=$(find "$PROJECT_ROOT/backups" -name "*.zip" -mtime +7 2>/dev/null || true)

    if [[ -z "$old_files" ]]; then
        echo -e "${GREEN}No old local backup files to clean up.${NC}"
        return
    fi

    echo -e "${YELLOW}Found old backup files:${NC}"
    echo "$old_files" | while read -r file; do
        local size
        size=$(du -h "$file" | cut -f1)
        echo "  • $(basename "$file") (${size})"
    done

    echo ""
    echo -n "Delete these old files? (y/N): "
    read -r confirm

    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        echo "$old_files" | xargs rm -f
        echo -e "${GREEN}Old backup files cleaned up.${NC}"
    else
        echo -e "${YELLOW}Cleanup cancelled.${NC}"
    fi
}

execute_backup_stats() {
    echo ""
    echo -e "${GREEN}Backup System Statistics${NC}"
    echo ""

    # Local backups
    local local_backups
    local_backups=$(find "$PROJECT_ROOT/backups" -name "backup_*.zip" 2>/dev/null | wc -l | tr -d ' ')
    echo -e "${BLUE}📦 Local Backups:${NC} $local_backups files"

    # Local storage
    local local_size
    local_size=$(du -sh "$PROJECT_ROOT/backups" 2>/dev/null | cut -f1 || echo "0B")
    echo -e "${BLUE}💾 Local Storage:${NC} $local_size"

    # Cloud backups (if accessible)
    if command -v rclone &> /dev/null && rclone listremotes 2>/dev/null | grep -q "gdrive-secure:"; then
        local cloud_backups
        cloud_backups=$(rclone lsf "gdrive-secure:backups/code/" 2>/dev/null | grep '\.zip$' | wc -l | tr -d ' ' || echo "0")
        echo -e "${BLUE}☁️  Cloud Backups:${NC} $cloud_backups files"

        # Cloud storage
        local cloud_size
        cloud_size=$(rclone size "gdrive-secure:backups/code/" 2>/dev/null | grep "Total size" | cut -d: -f2 | tr -d ' ' || echo "Unknown")
        echo -e "${BLUE}☁️  Cloud Storage:${NC} $cloud_size"
    else
        echo -e "${BLUE}☁️  Cloud Status:${NC} Not accessible"
    fi

    # Last backup
    local last_backup
    last_backup=$(find "$PROJECT_ROOT/backups" -name "auto-backup.log" -print0 2>/dev/null | xargs -0 ls -t | head -1 | xargs basename 2>/dev/null || echo "None")
    echo -e "${BLUE}🕒 Last Backup:${NC} $last_backup"

    # System health
    local health_score=0
    local total_checks=4

    [[ -x "$SCRIPT_DIR/auto-backup.sh" ]] && ((health_score++))
    command -v rclone &> /dev/null && ((health_score++))
    crontab -l 2>/dev/null | grep -q "auto-backup.sh" && ((health_score++))
    [[ $local_backups -gt 0 ]] && ((health_score++))

    local health_percent=$(( (health_score * 100) / total_checks ))

    if [[ $health_percent -ge 75 ]]; then
        echo -e "${BLUE}❤️  System Health:${NC} ${GREEN}$health_percent%${NC} (${health_score}/${total_checks} checks)"
    elif [[ $health_percent -ge 50 ]]; then
        echo -e "${BLUE}❤️  System Health:${NC} ${YELLOW}$health_percent%${NC} (${health_score}/${total_checks} checks)"
    else
        echo -e "${BLUE}❤️  System Health:${NC} ${RED}$health_percent%${NC} (${health_score}/${total_checks} checks)"
    fi

    echo ""
}

execute_emergency_restore() {
    echo ""
    echo -e "${RED}🚨 Emergency Restore Commands${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Use these commands only in emergency situations!${NC}"
    echo ""
    echo -e "${CYAN}Step 1 - List available backups:${NC}"
    echo "  bash scripts/restore-backup.sh --list"
    echo ""
    echo -e "${CYAN}Step 2 - Quick restore (replace BACKUP_NAME):${NC}"
    echo "  bash scripts/restore-backup.sh --auto BACKUP_NAME.zip"
    echo ""
    echo -e "${CYAN}Step 3 - Interactive restore:${NC}"
    echo "  bash scripts/restore-backup.sh"
    echo ""
    echo -e "${CYAN}Step 4 - Verify restore:${NC}"
    echo "  ls -la app/ lib/ scripts/"
    echo "  npm install && npm run dev"
    echo ""
    echo -e "${RED}Remember to backup current state first if possible!${NC}"
    echo ""
}

execute_open_docs() {
    echo ""
    echo -e "${GREEN}Opening backup system documentation...${NC}"
    echo ""

    if [[ -f "$PROJECT_ROOT/AUTO_BACKUP_SYSTEM_README.md" ]]; then
        if command -v open &> /dev/null; then
            open "$PROJECT_ROOT/AUTO_BACKUP_SYSTEM_README.md"
        elif command -v xdg-open &> /dev/null; then
            xdg-open "$PROJECT_ROOT/AUTO_BACKUP_SYSTEM_README.md"
        else
            echo -e "${YELLOW}Please open manually: $PROJECT_ROOT/AUTO_BACKUP_SYSTEM_README.md${NC}"
        fi
    else
        echo -e "${RED}Documentation file not found: AUTO_BACKUP_SYSTEM_README.md${NC}"
        echo -e "${YELLOW}Run documentation generation first${NC}"
    fi
}

# Main menu loop
main_menu() {
    while true; do
        show_banner
        show_main_menu

        echo -n "Choose an operation (0-8): "
        read -r choice

        case $choice in
            1) execute_setup_auto_backup ;;
            2) execute_manual_backup ;;
            3) execute_list_backups ;;
            4) execute_restore_backup ;;
            5) execute_system_status ;;
            6) execute_run_tests ;;
            7) advanced_menu ;;
            8) execute_open_docs ;;
            0)
                echo ""
                echo -e "${GREEN}Thank you for using ClientLabs Backup Manager!${NC}"
                echo -e "${GREEN}Your code is automatically backed up every day. 🛡️${NC}"
                echo ""
                exit 0
                ;;
            *)
                echo -e "${RED}Invalid option. Please choose 0-8.${NC}"
                echo ""
                sleep 1
                ;;
        esac

        echo ""
        echo -n "Press Enter to continue..."
        read -r
        echo ""
    done
}

# Advanced menu loop
advanced_menu() {
    while true; do
        show_banner
        echo -e "${PURPLE}⚙️  Advanced Options${NC}"
        show_advanced_menu

        echo -n "Choose an advanced option (0-6): "
        read -r choice

        case $choice in
            1) execute_advanced_cron ;;
            2) execute_view_logs ;;
            3) execute_validate_system ;;
            4) execute_cleanup ;;
            5) execute_backup_stats ;;
            6) execute_emergency_restore ;;
            0) return ;;
            *)
                echo -e "${RED}Invalid option. Please choose 0-6.${NC}"
                echo ""
                sleep 1
                ;;
        esac

        echo ""
        echo -n "Press Enter to continue..."
        read -r
        echo ""
    done
}

# Handle command line arguments
case "${1:-}" in
    --help)
        show_banner
        echo "ClientLabs Backup Manager - Unified Interface"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  (none)      Interactive menu mode"
        echo "  --help      Show this help message"
        echo "  --status    Quick system status"
        echo "  --backup    Create manual backup"
        echo "  --list      List available backups"
        echo "  --test      Run test suite"
        echo ""
        echo "This script provides a unified interface for all backup operations."
        echo "Use the interactive menu for full functionality."
        exit 0
        ;;
    --status)
        execute_system_status
        ;;
    --backup)
        execute_manual_backup
        ;;
    --list)
        execute_list_backups
        ;;
    --test)
        execute_run_tests
        ;;
    *)
        main_menu
        ;;
esac