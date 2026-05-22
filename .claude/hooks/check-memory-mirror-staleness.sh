#!/usr/bin/env bash
# SessionStart hook on matcher=startup. Compares Claude's persistent memory
# directory at /home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/
# against the persistent-volume backup mirror at
# /workspaces/brand-operations-hub/.codespace-backup/memory/ and emits an
# additionalContext alert if they diverge (file count mismatch OR per-file
# size mismatch OR file present in one but not the other).
#
# Why this hook exists: P-42 root cause shipped 2026-05-22-f — three prior
# reproductions of the `.tool`-vs-`.tool_name` field-name bug left the
# backup mirror silently stale across multiple memory-write sessions. The
# Layer-1 (Mechanical) backup-memory-dir.sh PostToolUse hook is now fixed
# at the field-name level, but defense-in-depth says we should ALSO have a
# canary that catches drift if the mechanical layer ever regresses or some
# OTHER path leaves the mirror stale (e.g., a manual `cp` that misses a
# file; a future hook refactor that breaks the wiring again; a Codespace
# rebuild that wipes one side but not the other).
#
# Cross-references:
#   docs/HANDOFF_PROTOCOL.md Rule 29 — Pre-destructive-container-operation audit
#   .claude/hooks/backup-memory-dir.sh — Layer-1 PostToolUse mirror (mechanical)
#   .claude/hooks/check-memory-dir-status.sh — Layer-3 SessionStart source-health canary
#   scripts/restore-memory-from-backup.sh — recovery script
#   docs/CORRECTIONS_LOG.md 2026-05-22-f §Entry — P-42 root cause + canary addition
#
# Hook contract (matches check-memory-dir-status.sh pattern):
#   stdin: JSON with metadata about the SessionStart event (consumed + discarded)
#   stdout: optional JSON with hookSpecificOutput.additionalContext
#   exit 0: always (never block session start)
#
# Defensive design:
#   - If either dir is missing entirely, stay silent — the sibling
#     check-memory-dir-status.sh canary already covers source-missing;
#     backup-missing is bootstrap state (handled at Phase 4 ship per Rule 29).
#   - Compare on file basename + size (fast + sufficient — memory files are
#     small + size catches ~99% of drift cases; mtime is unreliable because
#     `cp -p` preserves source mtime).
#   - Emit a structured alert listing exactly which files diverge + how, so
#     Claude can decide whether to auto-sync (safe drift = mirror stale) or
#     surface to director (corrupt drift = sizes differ in unclear direction).
#   - Never exit non-zero — SessionStart hook failures must not block work.

set -uo pipefail

SOURCE_DIR="/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory"
REPO_ROOT="${CLAUDE_PROJECT_DIR:-/workspaces/brand-operations-hub}"
BACKUP_DIR="$REPO_ROOT/.codespace-backup/memory"

emit_empty() {
    printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":""}}\n'
    exit 0
}

emit_alert() {
    local alert_body="$1"
    if command -v python3 >/dev/null 2>&1; then
        local escaped
        escaped=$(printf '%s' "$alert_body" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
        printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":%s}}\n' "$escaped"
    elif command -v jq >/dev/null 2>&1; then
        local escaped
        escaped=$(printf '%s' "$alert_body" | jq -Rs .)
        printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":%s}}\n' "$escaped"
    else
        emit_empty
    fi
    exit 0
}

# Consume stdin so the hook subsystem doesn't deadlock
cat > /dev/null 2>&1 || true

# If source missing — sibling check-memory-dir-status.sh handles this; stay silent
[ -d "$SOURCE_DIR" ] || emit_empty

# If backup missing — bootstrap state per Rule 29 ship; stay silent
[ -d "$BACKUP_DIR" ] || emit_empty

# Collect source + backup file inventories: basename<TAB>bytes per line
collect_inventory() {
    local dir="$1"
    find "$dir" -maxdepth 1 -type f -name "*.md" -printf '%f\t%s\n' 2>/dev/null | sort
}

SOURCE_INV=$(collect_inventory "$SOURCE_DIR")
BACKUP_INV=$(collect_inventory "$BACKUP_DIR")

# Fast path: byte-identical inventory = no drift
if [ "$SOURCE_INV" = "$BACKUP_INV" ]; then
    emit_empty
fi

# Build drift report. Each category is one of: SOURCE_ONLY, BACKUP_ONLY, SIZE_MISMATCH
SOURCE_ONLY=()
BACKUP_ONLY=()
SIZE_MISMATCH=()

# Index inventories by basename for lookup. Use associative arrays.
declare -A SOURCE_BY_NAME
declare -A BACKUP_BY_NAME

while IFS=$'\t' read -r name size; do
    [ -n "$name" ] && SOURCE_BY_NAME["$name"]="$size"
done <<< "$SOURCE_INV"

while IFS=$'\t' read -r name size; do
    [ -n "$name" ] && BACKUP_BY_NAME["$name"]="$size"
done <<< "$BACKUP_INV"

# Files only in source (not yet mirrored — the most common drift mode pre-P-42-fix)
for name in "${!SOURCE_BY_NAME[@]}"; do
    if [ -z "${BACKUP_BY_NAME[$name]:-}" ]; then
        SOURCE_ONLY+=("$name (${SOURCE_BY_NAME[$name]}B in source / MISSING in backup)")
    elif [ "${SOURCE_BY_NAME[$name]}" != "${BACKUP_BY_NAME[$name]}" ]; then
        SIZE_MISMATCH+=("$name (${SOURCE_BY_NAME[$name]}B in source / ${BACKUP_BY_NAME[$name]}B in backup)")
    fi
done

# Files only in backup (orphan — source deleted but backup retained)
for name in "${!BACKUP_BY_NAME[@]}"; do
    if [ -z "${SOURCE_BY_NAME[$name]:-}" ]; then
        BACKUP_ONLY+=("$name (${BACKUP_BY_NAME[$name]}B in backup / MISSING in source)")
    fi
done

# Build the alert body
ALERT="🚨 MEMORY MIRROR STALENESS — Claude's persistent memory source dir + .codespace-backup/memory/ mirror diverge."

if [ "${#SOURCE_ONLY[@]}" -gt 0 ]; then
    ALERT+=$'\n\nFiles in SOURCE but NOT YET MIRRORED to backup (the typical Layer-1 hook-failure mode):\n'
    for entry in "${SOURCE_ONLY[@]}"; do
        ALERT+="  - $entry"$'\n'
    done
fi

if [ "${#SIZE_MISMATCH[@]}" -gt 0 ]; then
    ALERT+=$'\nFiles with SIZE MISMATCH (one side updated, the other is stale):\n'
    for entry in "${SIZE_MISMATCH[@]}"; do
        ALERT+="  - $entry"$'\n'
    done
fi

if [ "${#BACKUP_ONLY[@]}" -gt 0 ]; then
    ALERT+=$'\nFiles in BACKUP but NOT in source (source-side deletion not propagated; rare):\n'
    for entry in "${BACKUP_ONLY[@]}"; do
        ALERT+="  - $entry"$'\n'
    done
fi

ALERT+=$'\nRECOVERY OPTIONS:\n'
ALERT+=$'  (a) If SOURCE_ONLY or SIZE_MISMATCH where source is NEWER → auto-sync source → backup is safe (the Layer-1 hook should have done this; the canary just caught what the hook missed). Command:\n'
ALERT+=$'        cp -p '"$SOURCE_DIR"'/<file> '"$BACKUP_DIR"'/<file>\n'
ALERT+=$'  (b) If SIZE_MISMATCH where backup is NEWER → backup carries unsaved changes from a prior session; investigate before overwriting source. Read both, decide.\n'
ALERT+=$'  (c) If BACKUP_ONLY → source-side deletion not propagated; either delete from backup if intentional OR restore to source if accidental.\n'
ALERT+=$'\nWhen surfacing to director: lead with WHICH files diverge + WHICH direction. Do not silently auto-sync until the safe direction is established.\n'
ALERT+=$'\nCROSS-REFERENCES: .claude/hooks/backup-memory-dir.sh (the Layer-1 hook that should have prevented this); HANDOFF_PROTOCOL.md Rule 29; CORRECTIONS_LOG.md 2026-05-22-f §Entry (P-42 root cause + canary addition).'

emit_alert "$ALERT"
