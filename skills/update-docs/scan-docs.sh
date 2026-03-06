#!/bin/bash
# scan-docs.sh - Scan for project documentation files
# Part of update-docs skill

set -euo pipefail

# Documentation files to scan for
DOCS=(
  "CLAUDE.md"
  "CHANGELOG.md"
  "LOG.md"
  "CONTEXT.md"
  "PROGRESS.md"
  "PROJECT_SPEC.md"
  "QUICKREF.md"
  "README.md"
  "USER_QUESTIONS.md"
)

echo "🔍 Scanning for documentation files..."
echo ""

found=()
missing=()

for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    echo "  ✓ $doc"
    found+=("$doc")
  else
    echo "  ✗ $doc (not found)"
    missing+=("$doc")
  fi
done

echo ""
echo "📊 Summary:"
echo "  Found: ${#found[@]} files"
echo "  Missing: ${#missing[@]} files"

if [ ${#found[@]} -gt 0 ]; then
  echo ""
  echo "📝 Found files:"
  printf '  - %s\n' "${found[@]}"
fi

if [ ${#missing[@]} -gt 0 ]; then
  echo ""
  echo "❌ Missing files (can be created):"
  printf '  - %s\n' "${missing[@]}"
fi

# Export for use in other scripts
export FOUND_DOCS="${found[@]}"
export MISSING_DOCS="${missing[@]}"
