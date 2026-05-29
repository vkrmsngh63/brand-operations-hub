#!/usr/bin/env bash
# SessionStart hook on matcher=startup. Enforces HANDOFF_PROTOCOL Rule 32
# (Model-selection registry): scans src/ for model-menu / pricing-table
# DECLARATION sites and flags any whose file path is NOT registered in
# docs/AI_MODEL_REGISTRY.md. Non-blocking — emits a reminder, never gates.
#
# A "declaration site" = a file that DECLARES a model menu or pricing table
# inline (not one that merely imports a central list). Detected via three
# precise patterns:
#   - <option value="claude-...">        (a hardcoded dropdown option)
#   - *_PRICING                          (a per-model pricing table)
#   - SUPPORTED_MODEL_VERSIONS = [        (a literal supported-model list)
# Consumers that import the central list (e.g. the W#2 summarize modals) carry
# none of these patterns post-refactor, so they're correctly NOT flagged.
#
# Cross-references:
#   docs/HANDOFF_PROTOCOL.md Rule 32 — the rule this hook enforces
#   docs/AI_MODEL_REGISTRY.md — the registry checked against
#   .claude/hooks/inject-next-session-pointer.sh — the sibling SessionStart hook this mirrors
#   .claude/settings.json — the hooks block that wires this in
#
# Hook contract: stdin = SessionStart JSON; stdout = optional JSON with
# hookSpecificOutput.additionalContext; ALWAYS exit 0 (must never block).

set -uo pipefail

REPO_ROOT="${CLAUDE_PROJECT_DIR:-$(pwd)}"
REGISTRY="$REPO_ROOT/docs/AI_MODEL_REGISTRY.md"

emit_empty() {
    printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":""}}\n'
    exit 0
}

# Consume stdin so the hook subsystem doesn't deadlock.
cat > /dev/null 2>&1 || true

# If the registry doc is missing, don't block — just stay silent.
[ -f "$REGISTRY" ] || emit_empty

cd "$REPO_ROOT" 2>/dev/null || emit_empty
[ -d "$REPO_ROOT/src" ] || emit_empty

# Find declaration sites (exclude tests). Pattern set is deliberately precise.
DECL_PATTERN='value="claude-(opus|sonnet|haiku)|_PRICING[^a-zA-Z]|SUPPORTED_MODEL_VERSIONS *= *\['
MATCHES=$(grep -rlE "$DECL_PATTERN" "$REPO_ROOT/src" --include=*.ts --include=*.tsx 2>/dev/null \
    | grep -vE '\.test\.(ts|tsx)$' || true)

[ -z "$MATCHES" ] && emit_empty

REGISTRY_CONTENT=$(cat "$REGISTRY" 2>/dev/null || true)

UNREGISTERED=""
for f in $MATCHES; do
    rel="${f#$REPO_ROOT/}"
    if ! printf '%s' "$REGISTRY_CONTENT" | grep -qF -- "$rel"; then
        UNREGISTERED="${UNREGISTERED}- ${rel}
"
    fi
done

[ -z "$UNREGISTERED" ] && emit_empty

CONTEXT="🟠 MODEL REGISTRY DRIFT — HANDOFF_PROTOCOL Rule 32 (injected by .claude/hooks/check-model-registry-drift.sh):

The following file(s) declare a model menu or per-model pricing table inline but are NOT registered in docs/AI_MODEL_REGISTRY.md §1 (Declaration sites):

${UNREGISTERED}
Per Rule 32, register each one in docs/AI_MODEL_REGISTRY.md §1 (file path + workflow + models offered + default + pricing source) this session — OR, if it should be a consumer rather than a declaration site, refactor it to import the central list (src/lib/competition-scraping/review-analysis/models.ts). This is a non-blocking reminder."

if command -v python3 >/dev/null 2>&1; then
    ESCAPED=$(printf '%s' "$CONTEXT" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))')
elif command -v jq >/dev/null 2>&1; then
    ESCAPED=$(printf '%s' "$CONTEXT" | jq -Rs .)
else
    emit_empty
fi

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":%s}}\n' "$ESCAPED"
exit 0
