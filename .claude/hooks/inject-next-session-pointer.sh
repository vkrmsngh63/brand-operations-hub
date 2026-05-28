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
ACTIVE_WORKFLOW_POINTER="$REPO_ROOT/.claude/active-workflow-prompt.md"

emit_empty() {
    printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":""}}\n'
    exit 0
}

# Consume stdin so the hook subsystem doesn't deadlock waiting for us to read it
cat > /dev/null 2>&1 || true

# Choose the source pointer file:
#   PRIORITY 1: .claude/active-workflow-prompt.md if present — written by
#               ./resume-workflow <N> for workflow-switching sessions.
#               Single-use: this hook DELETES the file after reading so the
#               next bare `./resume` invocation correctly falls back to
#               NEXT_SESSION.md instead.
#   PRIORITY 2: docs/NEXT_SESSION.md — the standard end-of-session pointer
#               for "continue the workflow the prior session was on" (the
#               ./resume entry point).
if [ -f "$ACTIVE_WORKFLOW_POINTER" ]; then
    POINTER_FILE="$ACTIVE_WORKFLOW_POINTER"
    POINTER_SOURCE_LABEL=".claude/active-workflow-prompt.md (written by ./resume-workflow; single-use)"
    CONSUME_AFTER_READ=true
else
    POINTER_FILE="$POINTER"
    POINTER_SOURCE_LABEL="docs/NEXT_SESSION.md (standard end-of-session pointer)"
    CONSUME_AFTER_READ=false
fi

if [ ! -f "$POINTER_FILE" ]; then
    emit_empty
fi

# Read the pointer file and build the additionalContext string.
# The context wraps the file contents in a clear marker so Claude knows
# this is the resume-flow pointer (not just random content).
POINTER_CONTENT=$(cat "$POINTER_FILE" 2>/dev/null || true)

# Consume the single-use workflow pointer if that's the one we read.
# Delete AFTER read but BEFORE emit so a hook crash mid-emit doesn't leave
# the file behind to confuse the next session start.
if [ "$CONSUME_AFTER_READ" = "true" ]; then
    rm -f "$ACTIVE_WORKFLOW_POINTER" 2>/dev/null || true
fi

if [ -z "$POINTER_CONTENT" ]; then
    emit_empty
fi

CONTEXT_PREFIX="🟢 RESUME-FLOW POINTER — content follows (source: $POINTER_SOURCE_LABEL; injected by SessionStart hook .claude/hooks/inject-next-session-pointer.sh; the user is starting a session via ./resume, ./resume-workflow <N>, or fresh claude launch; treat this content as the session's launch prompt and proceed with the start-of-session sequence per docs/CLAUDE_CODE_STARTER.md once the user sends any first message — even a single word like 'go' or 'proceed'):

"

# Mechanical read-guarantee for polish-item spec docs per HANDOFF_PROTOCOL Rule 31
# (NEW 2026-05-28-b mechanical-layer closure):
#
# Scan POINTER_CONTENT for any "P-NN" references and emit a Rule-31 mandatory-read
# block listing matching docs/polish-item-specs/P-NN-*.md files. This ensures
# Claude reads the spec docs for every polish item the upcoming session touches —
# closing the gap surfaced 2026-05-28-b where today's session narrowly followed
# the launch prompt's Category-page scope without auditing the shipped Reviews
# Analysis Table page on the same workstream.
SPEC_DOCS_DIR="$REPO_ROOT/docs/polish-item-specs"
RULE31_BLOCK=""
if [ -d "$SPEC_DOCS_DIR" ]; then
    # Extract unique P-NN tokens from the pointer content (e.g., P-49, P-50, P-51).
    # Sort+uniq for de-dup; tr to normalize.
    P_TOKENS=$(printf '%s' "$POINTER_CONTENT" | grep -oE 'P-[0-9]+' | sort -u || true)
    if [ -n "$P_TOKENS" ]; then
        MATCHED_DOCS=""
        for token in $P_TOKENS; do
            # Glob for any spec doc starting with this token
            for f in "$SPEC_DOCS_DIR"/${token}-*.md "$SPEC_DOCS_DIR"/${token}.md; do
                if [ -f "$f" ]; then
                    # Strip REPO_ROOT prefix for cleanliness
                    rel_path="${f#$REPO_ROOT/}"
                    MATCHED_DOCS="${MATCHED_DOCS}- ${rel_path}
"
                fi
            done
            # Also catch master/cluster files like P-49-W5-reviews-phase-2-master-spec.md
            for f in "$SPEC_DOCS_DIR"/${token}-W*-*.md; do
                if [ -f "$f" ]; then
                    rel_path="${f#$REPO_ROOT/}"
                    # Avoid double-listing if already added above
                    if ! printf '%s' "$MATCHED_DOCS" | grep -qF -- "$rel_path"; then
                        MATCHED_DOCS="${MATCHED_DOCS}- ${rel_path}
"
                    fi
                fi
            done
        done
        if [ -n "$MATCHED_DOCS" ]; then
            RULE31_BLOCK="

---

🔵 RULE 31 MANDATORY READ — POLISH-ITEM SPEC DOCS (auto-detected from P-NN references in the pointer above):

Per HANDOFF_PROTOCOL.md Rule 31 (Polish-item spec capture), Claude MUST read §3 of every spec doc below at session start — these are the source-of-truth for the polish items this session touches. §1 (verbatim director instructions) + §2 (joint-discussion adjustments) read as needed to verify §3 hasn't drifted. §4 (open questions) MUST be read BEFORE any code lands.

${MATCHED_DOCS}
If a polish item is mentioned in the pointer but no spec doc exists yet (file missing), CREATE the spec doc as the first artifact of the session per Rule 31 — capture the director's verbatim instructions in §1 BEFORE any joint-discussion or code work begins.
"
        fi
    fi
fi

# JSON-escape the combined string for the additionalContext field.
# Use python3 if available for robust JSON escaping; fall back to jq if python3 missing.
FULL_CONTEXT="${CONTEXT_PREFIX}${POINTER_CONTENT}${RULE31_BLOCK}"

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
