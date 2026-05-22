#!/usr/bin/env bash
# PostToolUse hook on Edit + Write. Logs every doc file Claude edits during
# the session to .claude/session-modified-docs.log. The end-of-session
# doc-batch updater agent (or Claude itself) reads this log to mechanically
# determine which Group A / Group B docs need their headers bumped this
# session — replacing the manual "I think I touched these" memory recall
# with an externally-observable record.
#
# Cross-references:
#   docs/HANDOFF_PROTOCOL.md §4 Step 1 Document Update Checklist — the 12-question
#     checklist that every end-of-session must answer; this log mechanically
#     answers questions 1-10 (which docs got touched) so the manual answers
#     focus on the 11 + 12 ALWAYS-update items
#   .claude/agents/plos-doc-batch.md — the agent that consumes this log
#
# Hook contract:
#   stdin: JSON with .tool_name ("Edit" or "Write") + .tool_input.file_path (absolute or relative)
#          (Empirically confirmed 2026-05-22-f via /tmp/plos-hook-debug.log capture
#          alongside the sibling P-42 fix to backup-memory-dir.sh; same field-name
#          mismatch as P-42 — this hook had the identical .tool vs .tool_name bug.)
#   stdout: ignored (hook informational only; never blocks)
#   exit 0: always (this hook is observational; never blocks tool execution)
#
# Defensive design:
#   - If jq is missing OR stdin parse fails, exit 0 without logging (graceful degradation)
#   - Only log files under docs/ (the canonical doc tree); skip source code edits
#   - Skip if log dir doesn't exist (rare; let it auto-create via the touch fallback)
#   - Append (>>) not overwrite (>) so multiple edits accumulate

set -uo pipefail

INPUT=$(cat 2>/dev/null || printf '')

# Extract tool + file_path. If jq missing or input malformed, exit clean.
if ! command -v jq >/dev/null 2>&1; then
    exit 0
fi

TOOL=$(printf '%s' "$INPUT" | jq -r '.tool_name // empty' 2>/dev/null || printf '')
FILE_PATH=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null || printf '')

# Only act on Edit + Write tools (the two that modify file contents)
if [ "$TOOL" != "Edit" ] && [ "$TOOL" != "Write" ]; then
    exit 0
fi

# Skip if file_path is empty
if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Only log files in the docs/ tree (Group A + Group B markdown docs)
case "$FILE_PATH" in
    */docs/*)
        ;;
    *)
        exit 0
        ;;
esac

REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
LOG_DIR="$REPO_ROOT/.claude"
LOG_FILE="$LOG_DIR/session-modified-docs.log"

# Ensure log dir exists (it should — .claude/ is committed); skip silently if not
[ -d "$LOG_DIR" ] || exit 0

# Normalize file_path to relative-from-repo-root for compact log lines
RELATIVE_PATH=$(printf '%s' "$FILE_PATH" | sed "s|^${REPO_ROOT}/||")

# Append timestamp + tool + path on one line. Use ISO-8601 timestamp.
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
printf '%s\t%s\t%s\n' "$TIMESTAMP" "$TOOL" "$RELATIVE_PATH" >> "$LOG_FILE" 2>/dev/null || true

exit 0
