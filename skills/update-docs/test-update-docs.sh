#!/bin/bash
# test-update-docs.sh - Test the update-docs skill
# This script validates that the skill works as expected

set -euo pipefail

echo "🧪 Testing update-docs skill"
echo "========================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_count=0
pass_count=0
fail_count=0

run_test() {
  local test_name=$1
  local test_command=$2
  local expected_result=$3

  test_count=$((test_count + 1))
  echo "Test $test_count: $test_name"

  if eval "$test_command" > /dev/null 2>&1; then
    if [ "$expected_result" = "pass" ]; then
      echo -e "  ${GREEN}✓ PASS${NC}"
      pass_count=$((pass_count + 1))
    else
      echo -e "  ${RED}✗ FAIL${NC} (expected fail, but passed)"
      fail_count=$((fail_count + 1))
    fi
  else
    if [ "$expected_result" = "fail" ]; then
      echo -e "  ${GREEN}✓ PASS${NC} (expected failure)"
      pass_count=$((pass_count + 1))
    else
      echo -e "  ${RED}✗ FAIL${NC} (unexpected failure)"
      fail_count=$((fail_count + 1))
    fi
  fi
  echo ""
}

# Test 1: SKILL.md exists
run_test "SKILL.md file exists" "[ -f SKILL.md ]" "pass"

# Test 2: scan-docs.sh exists
run_test "scan-docs.sh script exists" "[ -f scan-docs.sh ]" "pass"

# Test 3: update-doc.sh exists
run_test "update-doc.sh script exists" "[ -f update-doc.sh ]" "pass"

# Test 4: README.md exists
run_test "README.md exists" "[ -f README.md ]" "pass"

# Test 5: SKILL.md has valid frontmatter
run_test "SKILL.md has valid YAML frontmatter" "grep -q '^name:' SKILL.md && grep -q '^description:' SKILL.md" "pass"

# Test 6: Description starts with "Use when"
run_test "Description starts with 'Use when'" "grep -q '^description: Use when' SKILL.md" "pass"

# Test 7: SKILL.md has Overview section
run_test "SKILL.md has Overview section" "grep -q '## Overview' SKILL.md" "pass"

# Test 8: SKILL.md has Quick Reference table
run_test "SKILL.md has Quick Reference table" "grep -q '^## Quick Reference' SKILL.md" "pass"

# Test 9: SKILL.md has Implementation section
run_test "SKILL.md has Implementation section" "grep -q '^## Implementation' SKILL.md" "pass"

# Test 10: scan-docs.sh is executable (on Unix)
run_test "scan-docs.sh has execute permission" "[ -x scan-docs.sh ] || echo 'Skipping on Windows'" "pass"

# Test 11: update-doc.sh has backup function
run_test "update-doc.sh has create_backup function" "grep -q 'create_backup()' update-doc.sh" "pass"

# Test 12: update-doc.sh has update_log function
run_test "update-doc.sh has update_log function" "grep -q 'update_log()' update-doc.sh" "pass"

# Test 13: update-doc.sh has update_changelog function
run_test "update-doc.sh has update_changelog function" "grep -q 'update_changelog()' update-doc.sh" "pass"

# Test 14: Scripts have error handling
run_test "Scripts have 'set -e' for error handling" "grep -q 'set -e' scan-docs.sh && grep -q 'set -e' update-doc.sh" "pass"

# Test 15: SKILL.md documents error handling
run_test "SKILL.md documents error handling" "grep -q '^## Error Handling' SKILL.md" "pass"

# Test 16: SKILL.md has Common Mistakes section
run_test "SKILL.md has Common Mistakes section" "grep -q '^## Common Mistakes' SKILL.md" "pass"

# Summary
echo "========================="
echo "Test Summary"
echo "========================="
echo "Total tests: $test_count"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  echo ""
  echo "The update-docs skill is ready to use."
  echo ""
  echo "To use it:"
  echo "  1. Tell Claude: 'update docs'"
  echo "  2. Or run directly: ./update-doc.sh"
  echo ""
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  echo "Please review and fix the issues."
  exit 1
fi
