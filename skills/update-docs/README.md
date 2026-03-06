# update-docs Skill - Usage Guide

## Overview

The `update-docs` skill helps you systematically update project documentation after completing work sessions. It ensures all documentation files remain synchronized and accurate.

## Files

- **SKILL.md** - Main skill documentation
- **scan-docs.sh** - Script to scan for documentation files
- **update-doc.sh** - Script to update documentation files

## Installation

The skill is automatically available when using Claude Code. The shell scripts require:

- Bash shell (Git Bash, WSL, or Linux/macOS Terminal)
- Standard Unix utilities (sed, awk, grep, cp)

## Usage

### Interactive Mode

Simply tell Claude:

```
update docs
```

Claude will:
1. Scan for documentation files in current directory
2. Ask which files to update
3. Show proposed changes
4. Apply updates with automatic backups

### Batch Mode

Update all documentation at once:

```
update all docs
```

### Specific Updates

Update only certain types:

```
update progress        # LOG, PROGRESS, CHANGELOG
update user docs       # README, QUICKREF
update changelog       # CHANGELOG.md only
```

## What Gets Updated

### LOG.md
- Adds timestamped entry
- Documents work completed
- Records decisions made
- Notes issues encountered

### CHANGELOG.md
- Adds to [Unreleased] section
- Categorizes changes (Added/Changed/Fixed/Removed)
- Follows Keep a Changelog format

### PROGRESS.md
- Updates completion percentages
- Moves tasks between sections
- Updates milestone status

### README.md
- Updates feature list
- Modifies installation instructions
- Updates usage examples

### CLAUDE.md
- Adds new patterns if established
- Updates project structure
- Documents new conventions

## Safety Features

### Automatic Backups

Every update creates a timestamped backup:
```
README.md → README.md.backup.20250307_180000
```

### Restore if Needed

If something goes wrong:
```bash
mv README.md.backup.20250307_180000 README.md
```

### Change Preview

Before applying changes, you'll see:
```
## Proposed Changes for LOG.md

+++ Add new entry +++
### 2025-03-07 18:00
- ✅ Completed environment detector implementation

Confirm changes? [Y/n]
```

## Error Handling

### Missing Files

If a documentation file doesn't exist:
```
LOG.md not found
Options:
[1] Create new LOG.md with template
[2] Skip LOG.md
[3] Cancel all updates
```

### File Conflicts

If updates might conflict:
```
## Conflict Detection

LOG.md line 45:
Existing: "### 2025-03-07 10:00"
Proposed: "### 2025-03-07 18:00"

Resolution:
[1] Keep both (append)
[2] Replace existing
[3] Manual merge
```

### Permission Errors

```
Error: Cannot write CLAUDE.md
Causes:
- File locked by another process
- Insufficient permissions

Actions:
- Close other programs
- Check permissions: ls -l CLAUDE.md
- Retry or skip file
```

## Best Practices

### 1. Update Frequently

Update documentation after each meaningful work session:
- After completing a feature
- After fixing bugs
- After refactoring
- After reaching milestones

### 2. Be Specific

Provide context when updating:
```
update docs - "Completed Phase 1 MVP implementation with 5 core modules"
```

### 3. Review Changes

Always review the proposed changes before confirming.

### 4. Keep Backups

Don't delete backup files immediately. Keep them until you're sure everything is working.

### 5. Sync Across Files

Ensure related information stays consistent:
- If you update PROGRESS.md, also update LOG.md
- If you add features, update README.md and CHANGELOG.md
- If you change rules, update CLAUDE.md and RULES.md

## Examples

### After Completing a Feature

```
update all docs "Completed user authentication feature" Added "User login, registration, and password reset"
```

### After Bug Fixes

```
update changelog "Fixed database connection issues" Fixed "Resolved connection pool exhaustion under load"
```

### After Reaching Milestone

```
update progress "Phase 1 MVP completed"
```

### End of Work Session

```
update docs - "Fixed 50+ TypeScript errors, project now builds successfully"
```

## Integration with Other Skills

This skill works well with:

- **test-driven-development** - Update docs after TDD cycle
- **verification-before-completion** - Update docs before claiming work complete
- **finishing-a-development-branch** - Update docs before PR/merge

## Troubleshooting

### Scripts Not Running

**Problem:** `bash: ./update-doc.sh: Permission denied`

**Solution:**
```bash
chmod +x update-doc.sh
./update-doc.sh
```

### Files Not Found

**Problem:** Script can't find documentation files

**Solution:**
- Ensure you're in the project root directory
- Run `scan-docs.sh` first to see what files exist
- Create missing files with templates if needed

### Updates Not Applying

**Problem:** Changes shown but not applied to files

**Solution:**
- Check file permissions
- Ensure files aren't locked by other programs
- Check for syntax errors in file content
- Restore from backup and try again

## Advanced Usage

### Custom Update Patterns

Edit `update-doc.sh` to add custom update logic for your project's specific documentation structure.

### Integration with CI/CD

Add to your CI pipeline:
```yaml
- name: Update Documentation
  run: |
    bash skills/update-docs/update-doc.sh all "CI/CD build ${GITHUB_SHA}"
```

### Git Hooks

Create a post-commit hook:
```bash
#!/bin/bash
# .git/hooks/post-commit
bash skills/update-docs/update-doc.sh all "Post-commit update"
```

## Contributing

To improve this skill:

1. Test the current skill thoroughly
2. Document issues or edge cases
3. Propose changes to SKILL.md
4. Add new update patterns to scripts
5. Update this usage guide

## License

Part of the KINXKit project - MIT License
