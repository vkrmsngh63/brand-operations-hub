#!/usr/bin/env bash
# codespace-rebuild-audit.sh — one-command audit for HANDOFF_PROTOCOL.md Rule 29.
# Run BEFORE recommending any container-level destructive operation
# (Codespaces: Rebuild Container, devcontainer.json edits that auto-trigger
# rebuild, container reset/delete-and-recreate) so the loss-risk is surfaced
# to the director via a Rule 14f forced-picker.
#
# Why this script exists: 2026-05-20 slip — Claude recommended a Codespaces
# rebuild without auditing what would be lost; the rebuild wiped Claude's
# persistent memory directory + the Claude Code CLI binary. The audit script
# enumerates everything outside /workspaces/ that the rebuild would wipe so
# the director can decide whether to back up first. Full slip narrative in
# CORRECTIONS_LOG.md 2026-05-20 entry; Rule 29 + 4-layer architecture in
# HANDOFF_PROTOCOL.md Rule 29.
#
# Usage:
#   bash scripts/codespace-rebuild-audit.sh
#
# Output: human-readable report of CRITICAL vs. EASILY-REINSTALLED items,
# plus a one-line summary suitable for inclusion in a Rule 14f picker option.
#
# Exit code: 0 if audit ran (regardless of what it found); non-zero only if
# the script itself errored.

set -uo pipefail

MEMORY_DIR="/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory"
BACKUP_DIR="/workspaces/brand-operations-hub/.codespace-backup/memory"

echo "============================================================"
echo "  CODESPACE REBUILD AUDIT — HANDOFF_PROTOCOL.md Rule 29"
echo "  Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "============================================================"
echo
echo "This audit lists what lives OUTSIDE /workspaces/ that a container"
echo "rebuild would wipe. /workspaces/ itself (git repo + untracked files)"
echo "is in the persistent volume and survives rebuilds — it is NOT at risk."
echo
echo "------------------------------------------------------------"
echo "  1. CLAUDE PERSISTENT MEMORY DIRECTORY  (CRITICAL)"
echo "------------------------------------------------------------"
if [ -d "$MEMORY_DIR" ]; then
    MEM_COUNT=$(find "$MEMORY_DIR" -maxdepth 1 -name "*.md" -type f 2>/dev/null | wc -l)
    MEM_SIZE=$(du -sh "$MEMORY_DIR" 2>/dev/null | awk '{print $1}')
    echo "  Location: $MEMORY_DIR"
    echo "  File count: $MEM_COUNT .md files"
    echo "  Size: $MEM_SIZE"
    echo "  Status: WILL BE WIPED ON REBUILD"
    if [ -d "$BACKUP_DIR" ]; then
        BACKUP_COUNT=$(find "$BACKUP_DIR" -maxdepth 1 -name "*.md" -type f 2>/dev/null | wc -l)
        echo "  Backup in persistent volume: $BACKUP_DIR ($BACKUP_COUNT files)"
        echo "  ✅ Backup exists — restoreable via scripts/restore-memory-from-backup.sh"
    else
        echo "  ❌ NO BACKUP — must run \`bash scripts/restore-memory-from-backup.sh --bootstrap\` (or similar) to seed backup BEFORE rebuild"
    fi
else
    echo "  Location: $MEMORY_DIR  (DIRECTORY MISSING)"
    echo "  Status: nothing to lose; either freshly-rebuilt-already or never-existed"
fi
echo

echo "------------------------------------------------------------"
echo "  2. GLOBALLY INSTALLED NPM PACKAGES  (CRITICAL if non-default)"
echo "------------------------------------------------------------"
if command -v npm >/dev/null 2>&1; then
    echo "  npm global packages:"
    npm ls -g --depth=0 2>/dev/null | sed 's/^/    /' || echo "    (npm ls -g failed)"
    echo
    echo "  Status: ALL GLOBAL PACKAGES WILL BE WIPED ON REBUILD"
    echo "  Notable: @anthropic-ai/claude-code (Claude Code CLI) is in this list"
    echo "  Reinstall: npm install -g @anthropic-ai/claude-code  (you'd have to reauthenticate after)"
else
    echo "  npm not available; skipping"
fi
echo

echo "------------------------------------------------------------"
echo "  3. APT-INSTALLED PACKAGES BEYOND DEFAULT  (EASILY-REINSTALLED if in devcontainer config)"
echo "------------------------------------------------------------"
echo "  Default Codespaces packages: reinstalled automatically by the base image"
echo "  Playwright Chromium libs: reinstalled automatically by .devcontainer/install-playwright-deps.sh"
echo "  (postCreateCommand fires on every rebuild)"
echo
echo "  Other apt-installed extras (if any):"
echo "  Search heuristic: packages installed via 'apt-get install' during sessions"
echo "  Manually check: dpkg --get-selections | head -50  (full list — too long to print)"
echo "  Status: ANYTHING APT-INSTALLED OUTSIDE devcontainer/install-playwright-deps.sh WILL BE WIPED"
echo

echo "------------------------------------------------------------"
echo "  4. LOCAL BINARIES (~/.local/bin/)  (CRITICAL if any)"
echo "------------------------------------------------------------"
if [ -d "$HOME/.local/bin" ]; then
    LOCAL_BIN_COUNT=$(ls -1 "$HOME/.local/bin" 2>/dev/null | wc -l)
    echo "  Location: $HOME/.local/bin"
    echo "  Count: $LOCAL_BIN_COUNT binaries"
    if [ "$LOCAL_BIN_COUNT" -gt 0 ]; then
        echo "  Files:"
        ls -1 "$HOME/.local/bin" 2>/dev/null | sed 's/^/    /'
        echo "  Status: WILL BE WIPED ON REBUILD — back up to .codespace-backup/local-bin/ if needed"
    else
        echo "  Status: empty; nothing to lose"
    fi
else
    echo "  $HOME/.local/bin does not exist; nothing to lose"
fi
echo

echo "------------------------------------------------------------"
echo "  5. CLAUDE API CREDENTIALS  (CRITICAL — reauth required after rebuild)"
echo "------------------------------------------------------------"
if [ -f "$HOME/.claude/.credentials.json" ]; then
    echo "  Location: $HOME/.claude/.credentials.json"
    echo "  Status: WILL BE WIPED ON REBUILD"
    echo "  ⚠️  Do NOT back up to .codespace-backup/ — credentials are secrets + /workspaces/ might end up in git"
    echo "  Recovery: run \`claude\` after rebuild + reauthenticate via web flow"
else
    echo "  No credentials file found; either not configured or fresh state"
fi
echo

echo "------------------------------------------------------------"
echo "  6. SHELL PROFILE EDITS  (CRITICAL if customized)"
echo "------------------------------------------------------------"
for f in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile" "$HOME/.bash_profile"; do
    if [ -f "$f" ]; then
        SIZE=$(wc -c < "$f" 2>/dev/null || echo 0)
        echo "  $f exists ($SIZE bytes) — WILL BE WIPED OR RESET TO IMAGE DEFAULT"
    fi
done
echo "  Status: any customizations here are lost; only image-default content survives"
echo

echo "------------------------------------------------------------"
echo "  7. VS CODE EXTENSIONS  (mixed — Settings-Sync persists; session-installed lost)"
echo "------------------------------------------------------------"
echo "  Settings-Sync-managed extensions: persist (account-level; tied to GitHub login)"
echo "  Session-installed extensions: WILL BE WIPED ON REBUILD"
echo "  Manual check: in VS Code, open the Extensions sidebar; any with cloud-sync icons survive"
echo

echo "------------------------------------------------------------"
echo "  AUDIT SUMMARY"
echo "------------------------------------------------------------"
CRIT_COUNT=0
[ -d "$MEMORY_DIR" ] && [ "$(find "$MEMORY_DIR" -maxdepth 1 -name "*.md" -type f 2>/dev/null | wc -l)" -gt 0 ] && CRIT_COUNT=$((CRIT_COUNT+1))
[ -d "$HOME/.local/bin" ] && [ "$(ls -1 "$HOME/.local/bin" 2>/dev/null | wc -l)" -gt 0 ] && CRIT_COUNT=$((CRIT_COUNT+1))
echo "  CRITICAL items at risk: ~$CRIT_COUNT (see sections 1+4 above)"
echo "  EASILY-REINSTALLED items: Claude Code CLI (npm install -g), Chromium libs (postCreateCommand)"
echo
echo "  RECOMMENDATION shape for the Rule 14f picker:"
echo "    (A) Back up CRITICAL items to /workspaces/brand-operations-hub/.codespace-backup/, then proceed (recommended)"
echo "    (B) Proceed without backup (only if no CRITICAL items above)"
echo "    (C) Cancel the rebuild"
echo "    (D) I have a question first that I need clarified"
echo
echo "  After rebuild, restore via: bash scripts/restore-memory-from-backup.sh"
echo "============================================================"
