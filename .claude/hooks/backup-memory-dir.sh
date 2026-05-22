#!/usr/bin/env bash
# PostToolUse hook on Edit + Write. When Claude writes/edits a file inside
# Claude's persistent memory directory at
# /home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/,
# automatically mirrors the file into the persistent-volume backup at
# /workspaces/brand-operations-hub/.codespace-backup/memory/<same-filename>.
#
# Why this hook exists: 2026-05-20 slip — Codespaces "Rebuild Container" wiped
# the entire memory directory silently because the home dir is outside the
# Codespaces persistent volume. The PostToolUse backup hook mirrors every
# memory write into /workspaces/ which IS in the persistent volume — so even
# if the home dir gets wiped again, the backup survives + scripts/restore-memory-from-backup.sh
# brings it back in one command. The hook is mechanical (no Claude memory
# required); it just runs every time Edit or Write touches a memory file.
#
# Cross-references:
#   docs/HANDOFF_PROTOCOL.md Rule 29 — Pre-destructive-container-operation audit
#   .claude/hooks/check-memory-dir-status.sh — SessionStart detection hook (canary if memory ever ends up empty despite the backup)
#   scripts/restore-memory-from-backup.sh — recovery script that consumes this backup
#   .codespace-backup/memory/ — the mirror destination (in /workspaces/, persistent)
#
# Hook contract:
#   stdin: JSON with .tool_name ("Edit" or "Write") + .tool_input.file_path
#          (Empirically confirmed 2026-05-22-f via /tmp/plos-hook-debug.log capture;
#          stdin also carries .session_id, .transcript_path, .cwd, .permission_mode,
#          .hook_event_name, .tool_use_id, .duration_ms, .tool_response.)
#   stdout: ignored (informational only; never blocks)
#   exit 0: always (this hook is observational; must never block tool execution)
#
# Defensive design:
#   - If jq missing OR stdin parse fails, exit 0 without backing up (graceful degradation; PostToolUse hooks must not block)
#   - Only mirror files under the canonical memory dir path
#   - Skip if backup dir doesn't exist (rare; .codespace-backup/memory/ is created at Phase 4 ship)
#   - Overwrite (not append) — backup mirror replaces previous file each time

set -uo pipefail

MEMORY_DIR_PREFIX="/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory"
REPO_ROOT="${CLAUDE_PROJECT_DIR:-/workspaces/brand-operations-hub}"
BACKUP_DIR="$REPO_ROOT/.codespace-backup/memory"

INPUT=$(cat 2>/dev/null || printf '')

# Need jq to parse the stdin JSON
if ! command -v jq >/dev/null 2>&1; then
    exit 0
fi

# Claude Code's PostToolUse stdin shape uses .tool_name (not .tool).
# P-42 root cause confirmed 2026-05-22-f via /tmp/plos-hook-debug.log instrumentation —
# prior to this fix the .tool extraction always returned empty + the Edit/Write gate
# always exited without backing up. CORRECTIONS_LOG.md 2026-05-22-f §Entry has the
# full empirical capture. Three reproductions across 2026-05-20-b, 2026-05-20-c,
# 2026-05-21 all stemmed from this single field-name mismatch.
TOOL=$(printf '%s' "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null || printf '')
FILE_PATH=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || printf '')

# Only act on Edit + Write
if [ "$TOOL" != "Edit" ] && [ "$TOOL" != "Write" ]; then
    exit 0
fi

# Skip if file_path empty
if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Only mirror files inside the canonical memory dir
case "$FILE_PATH" in
    "$MEMORY_DIR_PREFIX"/*)
        ;;
    *)
        exit 0
        ;;
esac

# Skip if backup dir doesn't exist (initial bootstrap state; the .codespace-backup/memory/
# directory is created at Phase 4 ship + thereafter persists in /workspaces/)
[ -d "$BACKUP_DIR" ] || exit 0

# Mirror: copy the file into the backup dir (overwriting any prior backup)
BASENAME=$(basename "$FILE_PATH")
cp -p "$FILE_PATH" "$BACKUP_DIR/$BASENAME" 2>/dev/null || true

exit 0
