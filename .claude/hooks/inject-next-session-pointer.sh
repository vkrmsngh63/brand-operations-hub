#!/usr/bin/env bash
# SessionStart hook on matcher=startup. Reads docs/NEXT_SESSION.md and emits
# its contents as JSON `additionalContext` so Claude has the pointer-file
# content as a system reminder BEFORE the user's first prompt.
#
# Why this exists: Claude Code's `claude [prompt]` positional argument does
# NOT auto-submit in interactive mode (only in print mode `-p`). The original
# `./resume` script's `exec claude "$SENTINEL"` therefore failed to auto-start
# the session — Claude just waited for user input. This hook fixes that by
# injecting the pointer-file content into the session as context, so Claude
# can act on it as soon as the director types any first message (even just
# "go" + Enter).
#
# Cross-references:
#   docs/CLAUDE_CODE_STARTER.md — sentinel-handling section (primary mechanism: this hook; fallback: sentinel-string match in user message)
#   docs/HANDOFF_PROTOCOL.md Rule 28 — Resume-flow multi-layered defense
#   `./resume` — the companion shell script that wraps this hook in a one-command session-handoff
#   `.claude/settings.json` — the hooks block that wires this script into the SessionStart event
#
# Hook contract (per Claude Code hooks docs):
#   stdin: JSON with metadata about the SessionStart event
#   stdout: optional JSON with hookSpecificOutput.additionalContext (string) — injected into the session as a system reminder
#   exit 0: allow session start (always; this hook must never block)
#
# Defensive design:
#   - If docs/NEXT_SESSION.md doesn't exist, emit empty additionalContext + exit 0 (don't block session start)
#   - If anything errors, emit empty additionalContext + exit 0 (graceful degradation; director can fall back to manual paste)
#   - Never exit non-zero — SessionStart hook failures shouldn't block work

set -uo pipefail

REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
POINTER="$REPO_ROOT/docs/NEXT_SESSION.md"

emit_empty() {
    printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":""}}\n'
    exit 0
}

# Consume stdin so the hook subsystem doesn't deadlock waiting for us to read it
cat > /dev/null 2>&1 || true

if [ ! -f "$POINTER" ]; then
    emit_empty
fi

# Read the pointer file and build the additionalContext string.
# The context wraps the file contents in a clear marker so Claude knows
# this is the resume-flow pointer (not just random content).
POINTER_CONTENT=$(cat "$POINTER" 2>/dev/null || true)

if [ -z "$POINTER_CONTENT" ]; then
    emit_empty
fi

CONTEXT_PREFIX="🟢 RESUME-FLOW POINTER — docs/NEXT_SESSION.md content follows (injected by SessionStart hook .claude/hooks/inject-next-session-pointer.sh; the user is starting a session via ./resume or fresh claude launch; treat this content as the session's launch prompt and proceed with the start-of-session sequence per docs/CLAUDE_CODE_STARTER.md once the user sends any first message — even a single word like 'go' or 'proceed'):

"

# JSON-escape the combined string for the additionalContext field.
# Use python3 if available for robust JSON escaping; fall back to jq if python3 missing.
FULL_CONTEXT="${CONTEXT_PREFIX}${POINTER_CONTENT}"

if command -v python3 >/dev/null 2>&1; then
    ESCAPED=$(printf '%s' "$FULL_CONTEXT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
elif command -v jq >/dev/null 2>&1; then
    ESCAPED=$(printf '%s' "$FULL_CONTEXT" | jq -Rs .)
else
    # No JSON-escaper available — degrade gracefully
    emit_empty
fi

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":%s}}\n' "$ESCAPED"
exit 0
