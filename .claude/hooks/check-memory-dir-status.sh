#!/usr/bin/env bash
# SessionStart hook on matcher=startup. Verifies Claude's persistent memory
# directory at /home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/
# contains the canonical operational-memory files. If the directory is empty
# OR any canonical file is missing, emits a 🚨 CRITICAL alert as additionalContext
# so the inheriting session immediately knows + can trigger recovery via
# scripts/restore-memory-from-backup.sh.
#
# Why this hook exists: 2026-05-20 slip — Codespaces "Rebuild Container" wiped
# the entire memory directory silently. The next session inherited an empty
# memory dir + would have continued working without realizing operational
# principles like "default to recommendation" or "Playwright-first for
# repeatable walkthroughs" were inaccessible. This hook surfaces that loss
# immediately at session start. Full slip + 4-layer architecture in
# HANDOFF_PROTOCOL.md Rule 29 + CORRECTIONS_LOG.md 2026-05-20 entry.
#
# Cross-references:
#   docs/HANDOFF_PROTOCOL.md Rule 29 — Pre-destructive-container-operation audit
#   .claude/hooks/backup-memory-dir.sh — PostToolUse mirror hook (mechanical backup layer)
#   scripts/restore-memory-from-backup.sh — recovery script if alert fires
#   .codespace-backup/memory/ — the persistent-volume backup location
#
# Hook contract (matches inject-next-session-pointer.sh pattern):
#   stdin: JSON with metadata about the SessionStart event
#   stdout: optional JSON with hookSpecificOutput.additionalContext
#   exit 0: always (never block session start)
#
# Defensive design:
#   - If memory dir doesn't exist OR is empty, alert fires (the canary)
#   - If any canonical file missing, alert lists which ones
#   - If everything is healthy, emit empty additionalContext (silent OK)
#   - Never exit non-zero — SessionStart hook failures must not block work

set -uo pipefail

MEMORY_DIR="/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory"

# Canonical memory file list (as of 2026-05-20 reconstruction; update when adding new memories).
CANONICAL_FILES=(
    "MEMORY.md"
    "feedback_recommendation_style.md"
    "feedback_default_to_recommendation.md"
    "feedback_trust_director_setup_confirmation.md"
    "feedback_playwright_for_repeatable_walkthroughs.md"
    "feedback_deferred_items_registry.md"
    "feedback_approval_scope_per_decision_unit.md"
    "project_sequential_workflow_operation.md"
    "project_scaffold_pivot_to_components_library.md"
    "project_resume_script_design_scheduled.md"
)

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

# Case 1: memory dir missing entirely
if [ ! -d "$MEMORY_DIR" ]; then
    emit_alert "🚨 CRITICAL MEMORY DIR MISSING — Claude's persistent operational memory directory at $MEMORY_DIR does NOT exist. This typically indicates a container rebuild or home-dir wipe wiped the directory. RECOVERY STEPS: (1) Run \`bash scripts/restore-memory-from-backup.sh\` to restore from the persistent-volume backup at /workspaces/brand-operations-hub/.codespace-backup/memory/. (2) If the backup is also missing, reconstruct from docs/HANDOFF_PROTOCOL.md Rule 29 §Recovery Playbook. (3) Surface this to the director at session start before doing other work. Full architecture: HANDOFF_PROTOCOL.md Rule 29."
fi

# Case 2: memory dir exists but is empty (no .md files)
MD_COUNT=$(find "$MEMORY_DIR" -maxdepth 1 -name "*.md" -type f 2>/dev/null | wc -l)
if [ "$MD_COUNT" -eq 0 ]; then
    emit_alert "🚨 CRITICAL MEMORY DIR EMPTY — Claude's persistent operational memory directory at $MEMORY_DIR exists but contains zero .md files. This typically indicates a container rebuild or home-dir wipe wiped the contents. RECOVERY STEPS: (1) Run \`bash scripts/restore-memory-from-backup.sh\` to restore from the persistent-volume backup. (2) If the backup is also missing, reconstruct from docs/HANDOFF_PROTOCOL.md Rule 29 §Recovery Playbook. (3) Surface this to the director at session start before doing other work."
fi

# Case 3: memory dir exists + has files, but specific canonical files missing
MISSING_FILES=()
for f in "${CANONICAL_FILES[@]}"; do
    if [ ! -f "$MEMORY_DIR/$f" ]; then
        MISSING_FILES+=("$f")
    fi
done

if [ "${#MISSING_FILES[@]}" -gt 0 ]; then
    MISSING_LIST=$(printf '%s, ' "${MISSING_FILES[@]}")
    MISSING_LIST="${MISSING_LIST%, }"
    emit_alert "🚨 MEMORY DIR PARTIAL LOSS — Claude's persistent operational memory directory at $MEMORY_DIR is missing canonical file(s): $MISSING_LIST. The remaining files survived; the listed ones did not. RECOVERY STEPS: (1) Run \`bash scripts/restore-memory-from-backup.sh\` to restore from the persistent-volume backup. (2) If the backup is also missing the specific files, reconstruct from docs/HANDOFF_PROTOCOL.md (each canonical file's source-of-truth section is named in Rule 29 §Recovery Playbook). (3) Surface this to the director at session start."
fi

# All canonical files present + memory dir healthy → silent OK
emit_empty
