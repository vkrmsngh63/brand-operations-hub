#!/usr/bin/env bash
# restore-memory-from-backup.sh — recovery script for Claude's persistent
# operational memory directory at /home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/.
#
# Run this after any container rebuild that wipes the memory directory.
# Restores files from the persistent-volume backup at
# /workspaces/brand-operations-hub/.codespace-backup/memory/.
#
# Why this script exists: 2026-05-20 slip. Codespaces "Rebuild Container"
# wiped the memory directory silently. The PostToolUse backup hook at
# .claude/hooks/backup-memory-dir.sh now auto-mirrors every memory write
# into .codespace-backup/memory/ (which IS in the persistent volume); this
# restore script is the one-command recovery path. Full architecture in
# docs/HANDOFF_PROTOCOL.md Rule 29 + CORRECTIONS_LOG.md 2026-05-20 entry.
#
# Usage:
#   bash scripts/restore-memory-from-backup.sh           # safe — refuses to overwrite existing
#   bash scripts/restore-memory-from-backup.sh --force   # overwrite existing files in the memory dir
#
# Exit codes:
#   0 — success (files restored OR memory dir already populated + safe-mode refuses to overwrite OR backup missing + fall-back instructions printed)
#   1 — script error (unable to create destination dir; permissions issue)

set -uo pipefail

MEMORY_DIR="/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory"
BACKUP_DIR="/workspaces/brand-operations-hub/.codespace-backup/memory"

FORCE=false
if [ "${1:-}" = "--force" ]; then
    FORCE=true
fi

echo "============================================================"
echo "  RESTORE MEMORY FROM BACKUP"
echo "  HANDOFF_PROTOCOL.md Rule 29 §Recovery Playbook"
echo "============================================================"
echo

# Case 1: backup itself is missing → print fall-back instructions
if [ ! -d "$BACKUP_DIR" ]; then
    cat <<'EOF'
❌ BACKUP MISSING

The expected backup directory at
  /workspaces/brand-operations-hub/.codespace-backup/memory/
does NOT exist. This typically means the PostToolUse backup hook had not
shipped yet, OR the .codespace-backup/ directory itself was deleted, OR
this is a fresh-repo-clone scenario.

FALL-BACK RECONSTRUCTION (manual):

  Reconstruct each memory file from docs/HANDOFF_PROTOCOL.md references.
  Each canonical memory file's name + operational principle + source-of-truth
  is documented in HANDOFF_PROTOCOL.md Rule 29 §Recovery Playbook. The
  2026-05-20 reconstruction is the canonical example of how to do this from
  the protocol doc alone.

  Canonical file list (10 files):
    MEMORY.md                                    (index)
    feedback_recommendation_style.md             ← Rule 14f §"most thorough"
    feedback_default_to_recommendation.md        ← Rule 14f §"Default-to-recommendation exception"
    feedback_trust_director_setup_confirmation.md ← Rule 14g
    feedback_playwright_for_repeatable_walkthroughs.md ← Rule 27
    feedback_deferred_items_registry.md          ← Rule 26
    feedback_approval_scope_per_decision_unit.md ← §4 Step 1 (end-of-session pattern)
    project_sequential_workflow_operation.md     ← Rule 25 reframe 2026-05-04
    project_scaffold_pivot_to_components_library.md ← Rule 20 reframe 2026-05-04
    project_resume_script_design_scheduled.md    ← Rule 21 §extension

LAST RESORT — GitHub Support ticket:

  Open https://support.github.com asking whether Codespaces has server-side
  backups of the prior container state. Response time 1-3 business days;
  outcome uncertain.
EOF
    exit 0
fi

# Case 2: backup exists but is empty
BACKUP_COUNT=$(find "$BACKUP_DIR" -maxdepth 1 -name "*.md" -type f 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -eq 0 ]; then
    echo "❌ BACKUP DIRECTORY EXISTS BUT IS EMPTY"
    echo "  Location: $BACKUP_DIR"
    echo "  Expected: at least 1 .md file"
    echo
    echo "  This may indicate the backup hook had not yet shipped before"
    echo "  the wipe occurred. Fall back to reconstruction per Rule 29."
    exit 0
fi

# Case 3: backup is healthy — proceed with restore
echo "✅ BACKUP FOUND"
echo "  Location: $BACKUP_DIR"
echo "  Files: $BACKUP_COUNT .md files"
echo "  Size: $(du -sh "$BACKUP_DIR" 2>/dev/null | awk '{print $1}')"
echo

# Ensure destination directory exists
if [ ! -d "$MEMORY_DIR" ]; then
    if ! mkdir -p "$MEMORY_DIR"; then
        echo "❌ Failed to create $MEMORY_DIR — permissions issue?"
        exit 1
    fi
    echo "  Created destination: $MEMORY_DIR"
fi

# Check whether destination is empty or populated
DEST_COUNT=$(find "$MEMORY_DIR" -maxdepth 1 -name "*.md" -type f 2>/dev/null | wc -l)

if [ "$DEST_COUNT" -gt 0 ] && [ "$FORCE" != "true" ]; then
    echo "  Destination already contains $DEST_COUNT .md files."
    echo "  Safe-mode: refusing to overwrite. Pass --force to overwrite."
    echo
    echo "  Files in destination:"
    ls -1 "$MEMORY_DIR"/*.md 2>/dev/null | sed 's/^/    /'
    exit 0
fi

# Perform the restore
RESTORED=0
for src in "$BACKUP_DIR"/*.md; do
    [ -f "$src" ] || continue
    basename_only=$(basename "$src")
    if cp -p "$src" "$MEMORY_DIR/$basename_only" 2>/dev/null; then
        RESTORED=$((RESTORED + 1))
        echo "  ✓ Restored: $basename_only"
    else
        echo "  ✗ Failed to restore: $basename_only"
    fi
done

echo
echo "============================================================"
echo "  RESTORE COMPLETE — $RESTORED file(s) restored"
echo "============================================================"
echo
echo "Verify:"
echo "  ls -la $MEMORY_DIR"
echo
echo "If the SessionStart hook (.claude/hooks/check-memory-dir-status.sh)"
echo "previously surfaced a 🚨 CRITICAL alert, restart Claude Code now;"
echo "the next session start should show no alert."

exit 0
