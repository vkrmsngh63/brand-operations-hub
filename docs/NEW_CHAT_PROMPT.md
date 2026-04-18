# NEW CHAT PROMPT
## Paste this at the start of every new chat to brief Claude

**Last updated:** April 17, 2026 (Phase M COMPLETE — final claude.ai chat for this project; next session is in Claude Code)
**Last updated in chat:** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f

**⚠️ IMPORTANT:** This file is the claude.ai-era briefing template. **The project has migrated to Claude Code.** New work sessions should use `docs/CLAUDE_CODE_STARTER.md` as the paste-at-start prompt, not this file. This file is preserved as historical reference and as a fallback if the project ever needs to temporarily return to claude.ai (see `docs/CLAUDE_CODE_MIGRATION.md` §8 Rollback plan).

**Purpose (historical):** Start every new chat by uploading Group A documents and pasting this briefing. Tailored each time to the specific work about to begin.

---

## 🚨🚨🚨 CRITICAL — READ FIRST — COMMUNICATION RULES 🚨🚨🚨

> ### I AM A NON-PROGRAMMER.
>
> The user running this project has **no programming background, no developer tools experience, and no technical vocabulary.** This has been true since day one of the project and has NOT changed.
>
> **This instruction has been given by the user at the start of at least FOUR successive chats.** The user has had to repeat it by hand because past Claudes kept slipping into technical jargon despite these rules being in the docs. This is now logged as **Pattern 11** in `CORRECTIONS_LOG.md` — a meta-pattern about visibility-under-load. The FOURTH recurrence happened in Ckpt 8, AFTER the banner was escalated in Ckpt 7 — documentation visibility alone is insufficient; mechanical habit is the binding constraint.
>
> ### What this means — mechanically, not aspirationally:
>
> 1. **Every question you ask the user must be in plain, user-visible language.** Not "endpoint," "route," "schema," "migration," "projectId," "typescript error," "context." Instead: "the address people type to get to this page," "the behind-the-scenes record," "the thing the user sees," etc.
>
> 2. **The "Read It Back" test (HANDOFF_PROTOCOL Rule 14a) is NON-NEGOTIABLE.** Before sending ANY question or instruction to the user, read it back as if you had never written code. If any word requires domain/programming knowledge to understand — rewrite. No exceptions.
>
> 3. **Every decision question presents OPTIONS in plain language with an expert recommendation.** Do not dump the user into "how do you want to architect this?" — give them "Option A does X (what user sees), Option B does Y (what user sees). I'd recommend Option A because... — and either way, this is reversible."
>
> 4. **Reversibility note on every decision.** Tell the user whether the decision can be undone later, so they don't feel paralyzed by commitment.
>
> 5. **Equal visual weight in design recaps.** When summarizing a plan, features Claude added autonomously get the SAME prominent framing as features the user explicitly decided. Never bury a feature in a one-liner.
>
> 6. **Persistence decisions need explicit framing.** When data will save to local storage vs. database, say what that means in plain user-visible terms (syncs across devices? visible to workers? survives cache clears?). Never bury as a parenthetical.
>
> 7. **If you slip mid-chat:** acknowledge openly, don't minimize. The user has earned the right to flag slips.
>
> 8. **NEVER give the user a terminal command referencing a path starting with `/mnt/`, `/home/claude/`, or `/mnt/skills/`.** Those are Claude's sandbox paths — they do NOT exist in the user's Codespaces terminal. The user's terminal only sees paths inside the repo (`/workspaces/brand-operations-hub/...`). Default method for delivering new files: **heredoc** (`cat > "path/in/user/repo" << 'MARKER' ... MARKER`) for files under ~200 lines, or paste content in a code block and have the user create the file via Codespaces file-explorer for larger files. See Pattern 12 in CORRECTIONS_LOG.
>
> 9. **EVERY imperative instruction to the user must come with a concrete method.** (NEW from Ckpt 8 — the 4th Pattern 11 recurrence happened here.) The Read-It-Back test from Rule 14a applies not only to decision questions but to ALL instructions Claude gives the user, including:
>    - "Paste / share / upload / show me / send me / give me X"
>    - "Look up / check / find X"
>    - "Can you do Y"
>    - Build / run / test commands
>    - Navigation or UI click requests
>
>    Every imperative verb must be paired with EITHER a ready-to-paste terminal command OR a numbered click-path OR an `ask_user_input_v0` tool call. If the user would have to figure out HOW to do what Claude asked, Claude has failed. Example failure from Ckpt 8: *"Could you paste the contents of these two files?"* — fails because "paste" is orphaned (how does the user get the file contents?). Correct form: *"Paste this command into your Codespaces terminal: `cat src/app/X.tsx` — then paste whatever it prints into your next message."*
>
>    **Mechanical test:** scan every message you're about to send for imperative verbs. Each must have a paired method. If any orphaned imperative is found, rewrite.
>
> This banner exists because documentation without prominence fails. Read it at the start of every chat. Re-read it whenever you're about to ask the user a technical-sounding question OR give the user anything to do.

🚨🚨🚨 END OF COMMUNICATION BANNER — continue reading below 🚨🚨🚨

---

## [BEGIN PASTE-INTO-NEW-CHAT TEXT]

## ⚠️ STOP — This file is historical (post-Phase-M, April 17 2026)

**If you are reading this because a user just started a fresh claude.ai chat for this project — pause.** The project migrated to **Claude Code** after Phase M completed successfully. The canonical session-start prompt is now `docs/CLAUDE_CODE_STARTER.md` in the repo. Please confirm with the user whether they meant to start a claude.ai chat or whether they should be using Claude Code instead.

**If the user is genuinely back in claude.ai** (rollback per `docs/CLAUDE_CODE_MIGRATION.md` §8, or some other reason), read the loud communication banner above FIRST, then continue reading this file. The banner is still authoritative — Pattern 11 still applies, Rule 9 still applies, Pattern 12 still applies.

### CONTEXT (post-Phase-M snapshot)

I'm a complete novice and non-programmer. Plain language, options + recommendation + reversibility on every decision, concrete methods paired with every imperative instruction. See the communication banner at the top of this file. Read it before your first response.

### Where we are (as of April 17, 2026)

**Phase M is COMPLETE.** All 9 checkpoints + Ckpt 9.5 bug-fix deployed to vklf.com. Full Phase 1 happy-path works end-to-end: Dashboard → PLOS → Keyword Analysis card → Projects list → click Project title → Project detail page → Keyword Clustering workspace → Back to Project → Back to Projects. Admin Notes work on all 4 systems (Dashboard, PLOS, PMS, Think Tank). `/docs/` exists at repo root with all 15 handoff docs; `.bak` files purged; `.gitignore` hardened.

**Current repo state:**
- Branch `main` is at commit `fcf2373` (Phase M Ckpt 9.5)
- origin/main matches (everything pushed)
- Safety branch `phase-m-safety-net` still at `f545e2a` (deletable at user's discretion)
- Live site vklf.com is stable and coherent

### What comes next

**Phase 1g-test** — live-testing Auto-Analyze on Keyword Clustering. This is the first task for the Claude Code migration era. See `docs/KEYWORD_CLUSTERING_ACTIVE.md` §6 for scope.

**If you're somehow in claude.ai right now** despite the migration, the session-start approach is:

1. Upload these 13 Group A docs: `PROJECT_CONTEXT.md`, `PLATFORM_ARCHITECTURE.md`, `PLATFORM_REQUIREMENTS.md`, `NAVIGATION_MAP.md`, `DATA_CATALOG.md`, `ROADMAP.md`, `CORRECTIONS_LOG.md`, `CHAT_REGISTRY.md`, `HANDOFF_PROTOCOL.md`, `DOCUMENTATION_ARCHITECTURE.md`, `NEW_CHAT_PROMPT.md`, `DOCUMENT_MANIFEST.md`, `CLAUDE_CODE_MIGRATION.md`.
2. Upload relevant Group B docs if the scope is tool-specific. For Phase 1g-test, that's `KEYWORD_CLUSTERING_ACTIVE.md`.
3. Paste this file's content as your briefing.
4. Run the mandatory start-of-chat sequence below.

### Leftovers status (historical)

✅ **All pre-Ckpt-9 leftovers resolved in Ckpt 9:**
- 11 untracked `.bak` files — deleted from disk
- 40 committed `.bak` files — deleted from git going forward (remain in history if needed)
- 2 legacy docs in `src/app/` (`HANDOFF.md`, `ROADMAP.md`) — deleted
- 3 empty `docs/` subfolders (`legacy`, `primers`, `workflows`) from pre-Phase-D era — removed
- `.gitignore` hardened with `*.bak*` pattern

If `git status` shows new leftovers in a future chat, they're from that chat's own work, not pre-existing debt. Apply Option A clean split procedure (see CORRECTIONS_LOG 2026-04-17 "Pre-existing .bak/untracked files" entry) as needed.

### ATTACHED DOCUMENTS (Group A — 13 docs)

1. `PROJECT_CONTEXT.md` — big-picture context
2. `PLATFORM_ARCHITECTURE.md` — platform tech structure
3. `PLATFORM_REQUIREMENTS.md` — scale, user-model, review cycle, audit, concurrency requirements
4. `NAVIGATION_MAP.md` — every route + click path
5. `DATA_CATALOG.md` — every data item + where it lives
6. `ROADMAP.md` — what's been done, what's next
7. `CORRECTIONS_LOG.md` — mistakes and lessons
8. `CHAT_REGISTRY.md` — log of past chats and URLs
9. `HANDOFF_PROTOCOL.md` — the rules for how chats operate
10. `DOCUMENTATION_ARCHITECTURE.md` — doc-system design
11. `NEW_CHAT_PROMPT.md` — this briefing template
12. `DOCUMENT_MANIFEST.md` — ground-truth registry of what docs exist
13. `CLAUDE_CODE_MIGRATION.md` — migration plan (primary source of truth for what changed with Claude Code)

### MANDATORY START-OF-CHAT SEQUENCE

1. Read all attached documents **end-to-end**, not by section samples. Any doc with `< truncated lines N-M >` markers must be fully viewed with explicit range calls.
2. Run the **Pre-Flight Drift Check** per HANDOFF_PROTOCOL §2 Step 3 — output a short summary of where we are. Specifically verify with `git log --oneline -5` that `main` is at `fcf2373` (or further along if more work has happened).
3. **Capture and confirm the chat URL** at the top of your first response.
4. **Rate on a 1-5 scale the questions you plan to ask me**, per HANDOFF_PROTOCOL Rule 14d — and rewrite any that score below 4 (non-programmer-readable).
5. **Verify relevant files exist** if the task depends on files prior chats claimed to have built. (Pattern 7 strengthened mitigation — see CORRECTIONS_LOG.)
6. Wait for my go-ahead before starting the work.

### WORKING RULES REMINDERS

- I'm a non-programmer. Plain-language options + expert recommendation + reversibility on every decision. (See banner above.)
- Every imperative instruction must come with a concrete method — terminal command, numbered click-path, or ask_user_input_v0 tool. No "paste the X" without a command. (Rule 9 in banner.)
- Don't generate commands using `/mnt/` or `/home/claude/` paths — those are your sandbox, not my terminal (Pattern 12).
- If a file needs to go into my repo, default delivery is a heredoc (`cat > "path" << 'MARKER' ... MARKER`) for small/medium files, or a code block to paste into Codespaces file-explorer for larger files.
- Document the work at end-of-chat per the standard Document Update Checklist.
- Log mistakes to CORRECTIONS_LOG.md as they happen (or at end of chat).
- Update the chat URL in CHAT_REGISTRY.md at end of chat.

### KNOWN DEFERRED ITEMS (do NOT work on these unless explicitly scoped in)

- Manual/AI toggle persistence on Keyword Clustering page → Phase 1-polish (low priority)
- localStorage → database migration for card labels → Phase 2
- All Phase 2 items from architectural reveal (Assignment, ReviewNote, AuditEvent, real-time collab, etc.) → Phase 2
- Middleware deprecation warning (Next.js 16 "proxy" convention) → fix at convenience later
- Think Tank projects localStorage → DB migration → Phase 2

Ready when you've read the docs and confirmed the URL.

## [END PASTE-INTO-NEW-CHAT TEXT]

---

## Maintenance notes for this file (for future end-of-chat Claude)

This file is retailored at the end of every chat for the next chat's specific objective. What to preserve vs. rewrite:

**ALWAYS PRESERVE (never weaken, never shorten):**
- The top communication banner (🚨🚨🚨 section). If anything, it should get more prominent over time. See Pattern 11 in CORRECTIONS_LOG.
- Reversibility language on every decision.
- The "Read It Back" test reminder.
- The sandbox-path rule (Pattern 12).
- **Rule 9 — every imperative instruction needs a concrete method** (added after Ckpt 8's 4th Pattern 11 recurrence). This is load-bearing.
- The "Known git-status leftovers — DO NOT COMMIT UNSWEPT" section stays until Ckpt 9's cleanup is complete, THEN it can be replaced with a confirmation note that leftovers were cleaned.

**REWRITE FOR NEXT CHAT:**
- "Where we are" section (update with the work just completed)
- "Objective for this chat" (next checkpoint or next phase's scope)
- "Attached documents" (add/remove tool-specific Group B docs based on scope)
- "Mandatory start-of-chat sequence" (usually stays the same; only change if protocol changes)
- "Known deferred items" (update as items move in and out of scope)

**RULE:** If ANY item in CORRECTIONS_LOG is a Pattern (meta-level rule), it should be referenced in the communication banner or the working rules section. Patterns exist because they've repeated — visibility in this file is how we prevent another repeat.

---

END OF DOCUMENT
