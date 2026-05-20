# `.codespace-backup/` — persistent-volume backups of state outside `/workspaces/`

**Purpose:** This directory mirrors state that Codespaces would otherwise wipe on container rebuild — most importantly Claude Code's persistent operational memory directory at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`. Because `/workspaces/brand-operations-hub/` IS in the Codespaces persistent volume, anything stored here survives "Codespaces: Rebuild Container" and other container-level destructive operations.

**Why this exists:** 2026-05-20 slip. Claude recommended a Codespaces rebuild (to verify the P-18 devcontainer postCreateCommand) without auditing what the rebuild would wipe. The rebuild succeeded at its purpose but silently wiped the entire `~/.claude/projects/.../memory/` directory — 9 operational-memory files that Claude had built up across many prior sessions. Recovery required functional reconstruction from `docs/HANDOFF_PROTOCOL.md` references. Full slip narrative + 4-layer protective architecture in `docs/HANDOFF_PROTOCOL.md` Rule 29 + `docs/CORRECTIONS_LOG.md` 2026-05-20 entry.

## Directory layout

```
.codespace-backup/
├── README.md             ← tracked in git (this file)
├── .gitkeep              ← tracked in git (preserves the directory)
└── memory/               ← NOT tracked (gitignored); mirror of ~/.claude/.../memory/
    ├── MEMORY.md
    ├── feedback_*.md
    └── project_*.md
```

## How the backup gets populated

**Mechanical layer — automatic on every memory write:** the PostToolUse hook at `.claude/hooks/backup-memory-dir.sh` fires on every Edit / Write tool call. When the target file path is inside `~/.claude/projects/-workspaces-brand-operations-hub/memory/`, the hook copies the file into `.codespace-backup/memory/<same-basename>`. The hook is idempotent + silent + cannot block tool execution.

**Detection layer — alert on session start if backup or source is missing:** the SessionStart hook at `.claude/hooks/check-memory-dir-status.sh` fires at the start of every Claude Code session. If `~/.claude/projects/.../memory/` is missing, empty, or missing any canonical file, the hook emits a 🚨 CRITICAL alert as session context so the inheriting session immediately knows recovery is needed.

**Procedural layer — pre-rebuild audit:** `docs/HANDOFF_PROTOCOL.md` Rule 29 requires Claude to run `bash scripts/codespace-rebuild-audit.sh` BEFORE recommending any container-level destructive operation. The audit lists what's at risk; the director picks via a Rule 14f forced-picker whether to back up first.

**Recovery layer — restore from this backup on demand:** `scripts/restore-memory-from-backup.sh` is the one-command recovery script. From any post-rebuild Codespace, run it once + the memory directory is restored from this backup.

## How to restore from this backup

After any container rebuild that wipes the memory directory, run:

```bash
bash scripts/restore-memory-from-backup.sh
```

The script:

1. Verifies `.codespace-backup/memory/` exists + contains files
2. Creates `~/.claude/projects/-workspaces-brand-operations-hub/memory/` if missing
3. Refuses to overwrite existing files unless `--force` is passed
4. Copies every `.md` file from the backup into the memory directory
5. Reports success + file count

If the backup itself is also missing (e.g., a fresh repo clone with no prior backup), the script prints the fall-back reconstruction instructions — pointing at `docs/HANDOFF_PROTOCOL.md` Rule 29 §Recovery Playbook.

## What is NOT backed up here

- **Claude API credentials** (`~/.claude/.credentials.json`): NOT backed up. Credentials are secrets; `/workspaces/` might end up in a git push by accident if someone removes the gitignore. After rebuild, run `claude` + reauthenticate via the web flow.
- **Globally installed npm packages** (`/usr/local/share/nvm/.../lib`): not backed up. Reinstall via `npm install -g <pkg>`. The Claude Code CLI itself is `npm install -g @anthropic-ai/claude-code`.
- **Apt-installed extras**: not backed up. Anything beyond the Chromium libs (which `postCreateCommand` reinstalls automatically) is the user's responsibility.
- **VS Code extensions**: not backed up. Settings-Sync-managed extensions persist at the account level; session-installed extensions are lost.
- **Shell profile edits**: not backed up. Customizations to `.bashrc` / `.zshrc` must be added to dotfiles or persisted via `.devcontainer/` config.

## Cross-references

- `docs/HANDOFF_PROTOCOL.md` Rule 29 (the procedural rule that uses this backup)
- `.claude/hooks/backup-memory-dir.sh` (the PostToolUse mirror hook that populates this backup)
- `.claude/hooks/check-memory-dir-status.sh` (the SessionStart canary that detects loss)
- `scripts/codespace-rebuild-audit.sh` (the pre-rebuild audit script)
- `scripts/restore-memory-from-backup.sh` (the recovery script)
- `docs/CORRECTIONS_LOG.md` 2026-05-20 entry (the slip narrative + 4-layer fix)
