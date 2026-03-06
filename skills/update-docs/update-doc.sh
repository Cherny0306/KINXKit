#!/bin/bash
# update-doc.sh - Update project documentation after work completion
# Part of update-docs skill

set -euo pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() { echo -e "${BLUE}ℹ${NC} $1"; }
log_success() { echo -e "${GREEN}✓${NC} $1"; }
log_error() { echo -e "${RED}✗${NC} $1"; }
log_warning() { echo -e "${YELLOW}⚠${NC} $1"; }

# Create backup
create_backup() {
  local file=$1
  local timestamp=$(date +%Y%m%d_%H%M%S)
  local backup="${file}.backup.${timestamp}"

  if [ -f "$file" ]; then
    cp "$file" "$backup"
    log_info "Backup created: $backup"
    echo "$backup"
  fi
}

# Restore from backup
restore_backup() {
  local file=$1
  local backup=$2

  if [ -f "$backup" ]; then
    mv "$backup" "$file"
    log_success "Restored from backup"
  else
    log_error "Backup not found: $backup"
    return 1
  fi
}

# Update LOG.md
update_log() {
  local file=$1
  local timestamp=$(date '+%Y-%m-%d %H:%M')
  local work_summary=${2:-"Work completed"}

  if [ ! -f "$file" ]; then
    log_warning "$file not found, creating new file"
    cat > "$file" << EOF
# Project Development Log

> Daily development chronology and decisions

## $timestamp

### Project Setup
- Initialized project
EOF
    return 0
  fi

  # Create backup
  local backup=$(create_backup "$file")

  # Add new entry
  cat >> "$file" << EOF

## $timestamp

### $work_summary
EOF

  log_success "$file updated"
}

# Update CHANGELOG.md
update_changelog() {
  local file=$1
  local category=$2  # Added/Changed/Fixed/Removed
  local description=$3

  if [ ! -f "$file" ]; then
    log_warning "$file not found, creating new file"
    cat > "$file" << EOF
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### $category
- $description
EOF
    return 0
  fi

  # Create backup
  local backup=$(create_backup "$file")

  # Check if [Unreleased] section exists
  if grep -q "\[Unreleased\]" "$file"; then
    # Add to existing Unreleased section
    awk -v category="$category" -v desc="$description" '
      /\[Unreleased\]/ {in_unreleased=1}
      in_unreleased && /^### / && $0 !~ category {
        print "### " category
        print "- " desc
        print ""
        in_unreleased=0
      }
      in_unreleased && /^### / && $0 ~ category {
        print
        print "- " desc
        in_unreleased=0
      }
      {print}
    ' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
  else
    # Add new Unreleased section at the beginning
    awk 'NR==1 {print "\n## [Unreleased]\n\n### " category "\n- " desc "\n"} {print}' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
  fi

  log_success "$file updated"
}

# Update PROGRESS.md
update_progress() {
  local file=$1
  local percentage=${2:-""}
  local status=${3:-"🟡 进行中"}

  if [ ! -f "$file" ]; then
    log_warning "$file not found, skipping"
    return 0
  fi

  # Create backup
  local backup=$(create_backup "$file")

  if [ -n "$percentage" ]; then
    # Update progress bar
    sed -i "s/进度：.*/进度：${percentage}/" "$file" 2>/dev/null || true
  fi

  log_success "$file updated"
}

# Update README.md
update_readme() {
  local file=$1
  local new_content=$2

  if [ ! -f "$file" ]; then
    log_warning "$file not found, skipping"
    return 0
  fi

  # Create backup
  local backup=$(create_backup "$file")

  # Append to features section if it exists
  if grep -q "^## 🎯" "$file"; then
    # Add after features section
    sed -i "/^## 🎯/a\\- $new_content" "$file" 2>/dev/null || true
  fi

  log_success "$file updated"
}

# Main update function
update_docs() {
  local mode=${1:-"interactive"}
  local work_summary=${2:-"Work completed"}
  local category=${3:-"Changed"}
  local description=${4:-"Updates and improvements"}

  echo ""
  echo "🔄 Update Project Documentation"
  echo "==============================="
  echo ""

  # Scan for documentation files
  source "$(dirname "$0")/scan-docs.sh"

  echo ""
  echo "Select update mode:"
  echo "  [1] All (recommended)"
  echo "  [2] Progress only (LOG, PROGRESS, CHANGELOG)"
  echo "  [3] User-facing only (README, QUICKREF)"
  echo "  [4] Cancel"
  echo ""
  read -p "Choice [1-4]: " choice

  case $choice in
    1)
      log_info "Updating all documentation..."
      update_log "LOG.md" "$work_summary"
      update_changelog "CHANGELOG.md" "$category" "$description"
      update_progress "PROGRESS.md" "" "$status"
      # update_readme "README.md" "$description"
      ;;
    2)
      log_info "Updating progress documentation..."
      update_log "LOG.md" "$work_summary"
      update_changelog "CHANGELOG.md" "$category" "$description"
      update_progress "PROGRESS.md"
      ;;
    3)
      log_info "Updating user-facing documentation..."
      update_readme "README.md" "$description"
      ;;
    4)
      log_info "Update cancelled"
      return 0
      ;;
    *)
      log_error "Invalid choice"
      return 1
      ;;
  esac

  echo ""
  log_success "Documentation update complete!"
  echo ""
  echo "📊 Summary:"
  echo "  - Files updated: see above"
  echo "  - Backups created: *.backup.YYYYMMDD_HHMMSS"
  echo ""
  echo "💡 To restore backups:"
  echo "   mv FILE.backup.YYYYMMDD_HHMMSS FILE"
}

# Batch mode
batch_update() {
  local work_summary=${1:-"Batch update"}
  local category=${2:-"Changed"}
  local description=${3:-"Multiple updates"}

  log_info "Batch update mode..."
  update_log "LOG.md" "$work_summary"
  update_changelog "CHANGELOG.md" "$category" "$description"
  update_progress "PROGRESS.md"
}

# Main
case "${1:-}" in
  "all"|"batch")
    batch_update "${2:-}" "${3:-}" "${4:-}"
    ;;
  "help")
    echo "Usage: $0 [all] [work_summary] [category] [description]"
    echo ""
    echo "Examples:"
    echo "  $0                    # Interactive mode"
    echo "  $0 all               # Batch update all"
    echo "  $0 all 'Completed feature X' Added 'New feature X'"
    ;;
  *)
    update_docs
    ;;
esac
