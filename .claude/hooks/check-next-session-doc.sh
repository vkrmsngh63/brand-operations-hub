#!/usr/bin/env bash
# PreToolUse hook on Bash. Blocks any commit whose message contains
# "End-of-session" unless docs/NEXT_SESSION.md exists AND is staged in
# that commit. Prevents the failure mode where Claude forgets to refresh
# docs/NEXT_SESSION.md at session close and the next session's launch
# command (cat docs/NEXT_SESSION.md) fails with "No such file or directory".
#
# Cross-references:
#   HANDOFF_PROTOCOL.md §4 Step 1 item #11 (ALWAYS-update docs)
#   HANDOFF_PROTOCOL.md §4 Step 4b (Claude Code handoff template — NEXT-SESSION-INSTRUCTIONS)
#
# Hook contract:
#   stdin: JSON with .tool_input.command (the Bash command Claude is about to run)
#   exit 0: allow
#   exit 2: block (stderr is shown to Claude so it can self-correct)

set -uo pipefail

INPUT=$(cat)

# Extract the command field. If jq fails, default to empty string -> hook does nothing.
CMD=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // ""' 2>/dev/null || printf '')

# Only act on actual `git commit` invocations whose message references
# "End-of-session". To avoid false positives from echo/grep/cat commands that
# happen to quote `git commit ... End-of-session` as a string literal, we
# require `git commit` to appear at a logical command boundary: start of the
# command, or right after `&&`, `;`, or pipe. This catches the real-world
# Claude patterns `git commit -m ...` and `cd /path && git commit -m ...`
# while skipping echo-quoted false positives.
IS_GIT_COMMIT=false
if printf '%s' "$CMD" | grep -qE '(^|&&[[:space:]]*|;[[:space:]]*|\|[[:space:]]*)[[:space:]]*git[[:space:]]+(-C[[:space:]]+[^[:space:]]+[[:space:]]+)?commit\b'; then
    IS_GIT_COMMIT=true
fi
HAS_EOS_MARKER=false
if printf '%s' "$CMD" | grep -q 'End-of-session'; then
    HAS_EOS_MARKER=true
fi
if [ "$IS_GIT_COMMIT" != "true" ] || [ "$HAS_EOS_MARKER" != "true" ]; then
    exit 0
fi

REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
FILE_REL="docs/NEXT_SESSION.md"
FILE_ABS="$REPO_ROOT/$FILE_REL"

if [ ! -f "$FILE_ABS" ]; then
    cat >&2 <<EOF
[NEXT_SESSION.md guard] BLOCKED — docs/NEXT_SESSION.md does not exist.

Every End-of-session doc batch commit must create or refresh docs/NEXT_SESSION.md
with the next-session launch-prompt instructions for whoever picks up next.

To fix:
  1. Write docs/NEXT_SESSION.md following HANDOFF_PROTOCOL.md §4 Step 4b
     "NEXT-SESSION-INSTRUCTIONS" template (terminal commands + paste-ready
     first message + branch checkout + offline steps if any).
  2. git add docs/NEXT_SESSION.md
  3. Retry the commit.
EOF
    exit 2
fi

STAGED=$(git -C "$REPO_ROOT" diff --cached --name-only 2>/dev/null || true)
if ! printf '%s\n' "$STAGED" | grep -qx "$FILE_REL"; then
    cat >&2 <<EOF
[NEXT_SESSION.md guard] BLOCKED — docs/NEXT_SESSION.md exists but is NOT staged
for this End-of-session commit.

Every session's end-of-session commit must refresh docs/NEXT_SESSION.md with
THIS session's hand-off to the next session (the file from a prior session is
stale by definition — at minimum the session identifier and the named task
change every session).

To fix:
  1. Update docs/NEXT_SESSION.md with the next-session launch-prompt for
     whoever picks up next (HANDOFF_PROTOCOL.md §4 Step 4b template).
  2. git add docs/NEXT_SESSION.md
  3. Retry the commit.
EOF
    exit 2
fi

exit 0
