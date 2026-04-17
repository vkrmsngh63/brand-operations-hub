# NEW CHAT PROMPT
## Paste this at the start of every new chat to brief Claude

**Last updated:** April 17, 2026 (tailored for Phase M Ckpt 9 kickoff after Ckpt 8 complete)
**Last updated in chat:** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c

**Purpose:** Start every new chat by uploading Group A documents and pasting this briefing. Tailored each time to the specific work about to begin.

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

I'm continuing the PLOS (Product Launch Operating System) platform development. We just completed Phase M Checkpoint 8 in my last chat. **This next chat is Checkpoint 9 — the FINAL Phase M checkpoint: deploy + cleanup.**

### CONTEXT

I'm a complete novice and non-programmer. Please refrain from using technical language — explain things in plain, user-visible terms, give me options with clear "what the user sees" framing plus an expert recommendation, and always note reversibility. **This instruction has been repeated by hand in FOUR successive chats despite being in the docs.** Please read the loud communication banner at the top of `NEW_CHAT_PROMPT.md` (attached) BEFORE your first response. Pay special attention to Rule 9 (newly added after Ckpt 8): every imperative instruction you give me must come with a concrete method — terminal command OR numbered click-path OR `ask_user_input_v0` tool — never just "paste the file" / "share X" / "show me Y" without telling me HOW.

I've uploaded all 12 Group A handoff documents. No Group B tool-specific doc needed for Ckpt 9 (it's deploy + cleanup; no tool-specific work). Please read them end-to-end before doing anything.

### Where we are (end of Phase M Checkpoint 8)

**All code work for Phase M is DONE.** Only deploy + cleanup remains.

**Completed so far in Phase M:**
- **Ckpts 1–4 (2026-04-16):** Database schema refactored (Project + ProjectWorkflow; all workflow data tables use `projectWorkflowId`). Live in Supabase.
- **Ckpt 5 (2026-04-17):** Server-side API routes aligned with new schema. Committed as `14d68e7`.
- **Ckpt 6 (2026-04-17):** Built `/projects` list page (scale-aware) and `/projects/[projectId]` detail page. Committed as `3b69cf2`.
- **Ckpt 7 (2026-04-17):** Refactored Keyword Clustering to `/projects/[projectId]/keyword-clustering` (single-state). Deleted old `/keyword-clustering`. Committed as `5cc10c5`.
- **Ckpt 8 (2026-04-17):** Admin Notes added to `/dashboard` (→ `/dashboard/notes`) and `/plos` (→ `/plos/notes`). `/plos` Keyword Analysis card rewired from deleted `/keyword-clustering` to `/projects`. Committed as `ac62a3a`. 📝 Notes buttons added to both top bars. Zero visual testing yet (Codespaces PORTS glitch) — visual verification happens during this Ckpt 9 chat.

**Current repo state:**
- Branch `main` is ahead of `origin/main` by **4 commits**: `14d68e7`, `3b69cf2`, `5cc10c5`, `ac62a3a`.
- Safety branch `phase-m-safety-net` at `f545e2a` (pre-Phase-M) preserved.
- Live site vklf.com still runs the pre-Phase-M code (broken against the new DB schema). **This chat deploys it.**

### 🚨 CRITICAL — Known git-status leftovers — DO NOT COMMIT UNSWEPT 🚨

Before I started Ckpt 8, `git status` showed 13 files in the working tree that are NOT part of any committed checkpoint. They accumulated across Ckpts 1–5. Ckpt 8 did not commit them; they're still there now at the start of your chat. **Ckpt 9's cleanup pass handles these properly** — but until then:

**Every time you commit during Ckpt 9, verify the staged file list. Use specific paths, not `git add -A`. If `git add -A` is used and sweeps leftovers in, run `git reset HEAD <paths>` to unstage before committing.**

**The 13 pre-existing leftovers (canonical inventory):**

```
prisma/schema.prisma.bak                                            (Ckpts 1–4 schema backup; delete)
src/app/HANDOFF.md                                                  (legacy location, modified — relocate to /docs/ or delete)
src/app/ROADMAP.md                                                  (legacy location, modified — relocate to /docs/ or delete)
src/app/api/projects/route.ts.bak                                   (Ckpt 5; delete)
src/app/api/projects/[projectId]/route.ts.bak                       (Ckpt 5; delete)
src/app/api/projects/[projectId]/canvas/route.ts.bak                (Ckpt 5; delete)
src/app/api/projects/[projectId]/canvas/nodes/route.ts.bak          (Ckpt 5; delete)
src/app/api/projects/[projectId]/canvas/pathways/route.ts.bak       (Ckpt 5; delete)
src/app/api/projects/[projectId]/canvas/rebuild/route.ts.bak        (Ckpt 5; delete)
src/app/api/projects/[projectId]/canvas/sister-links/route.ts.bak   (Ckpt 5; delete)
src/app/api/projects/[projectId]/keywords/route.ts.bak              (Ckpt 5; delete)
src/app/api/projects/[projectId]/keywords/[keywordId]/route.ts.bak  (Ckpt 5; delete)
src/lib/auth.ts.bak                                                 (Ckpt 5; delete)
```

**Plus .bak files that ARE committed but still need Ckpt 9 removal:**
- `src/app/dashboard/page.tsx.bak` (committed in `ac62a3a`)
- `src/app/plos/page.tsx.bak` (committed in `ac62a3a`)
- ~30 `.bak*` files in `src/app/projects/[projectId]/keyword-clustering/components/` (committed in `5cc10c5` during Ckpt 7's folder move)

Full details in `ROADMAP.md` Ckpt 9 section + `PLATFORM_ARCHITECTURE.md` §10 + `CORRECTIONS_LOG.md` 2026-04-17 "Pre-existing .bak/untracked files" entry.

### OBJECTIVE FOR THIS CHAT — PHASE M CHECKPOINT 9 (Deploy + cleanup + `/docs/` setup)

Sub-tasks in rough order:

**Task 1 — Create `/docs/` and consolidate all handoff documents into it.**
This is a NEW scope item for Ckpt 9 (added after Ckpt 8's decision to migrate to Claude Code). Create `/docs/` at repo root. Move all 13 Group A handoff docs + Group B `KEYWORD_CLUSTERING_ACTIVE.md` + two new Claude Code docs (`CLAUDE_CODE_MIGRATION.md`, `CLAUDE_CODE_STARTER.md`) into `/docs/`. This becomes the canonical location going forward — after Ckpt 9, Claude Code reads docs from here directly.

**Task 2 — Handle legacy-location docs.**
`src/app/HANDOFF.md` and `src/app/ROADMAP.md` live inside `src/app/` which is Next.js's routes folder — Next.js could misinterpret them as routes. Verify they contain no unique content (they're stale copies), then delete them. Canonical copies now live in `/docs/`.

**Task 3 — Clean up `.bak` files.**
Delete all `.bak`, `.bak2`, `.bak3`, etc. files from the repo — both the 13 leftovers listed above and the ~32 committed ones (from Ckpts 5–8 folder moves and file edits). Add `*.bak*` to `.gitignore` so they never commit again.

**Task 4 — Final build + commit the Ckpt 9 work.**
Run `npm run build` one more time after cleanup to confirm nothing broke. Commit as "Phase M Ckpt 9: deploy readiness + /docs/ setup + cleanup."

**Task 5 — Deploy.**
`git push origin main`. This publishes all 5 Phase M commits (Ckpts 5–9) to Vercel in one push. Wait for Vercel build to complete.

**Task 6 — Visual verification on vklf.com.**
Test login → Dashboard (verify 📝 Notes button visible) → click Dashboard 📝 Notes → verify `/dashboard/notes` loads empty Admin Notes workspace → back to Dashboard → click PLOS card → verify PLOS page loads with 📝 Notes button → click PLOS 📝 Notes → verify `/plos/notes` loads → back to PLOS → click Keyword Analysis card → verify it navigates to `/projects` (NOT 404) → from `/projects`, click into a Project → click Keyword Analysis from Project detail → verify `/projects/[id]/keyword-clustering` loads the KC workspace. User visually confirms each page.

**Task 7 — Produce the "Migration readiness" Personalized Handoff Message.**
Phase M is complete after this chat. The NEXT session should be in Claude Code (not claude.ai). The handoff message explicitly instructs the user how to migrate to Claude Code (~30 min offline). See `docs/CLAUDE_CODE_MIGRATION.md` for the full migration procedure — the handoff should reference it, not duplicate it.

### ATTACHED DOCUMENTS (Group A — 13 docs including new CLAUDE_CODE_MIGRATION.md)

1. `PROJECT_CONTEXT.md` — big-picture context
2. `PLATFORM_ARCHITECTURE.md` — platform tech structure (updated through Ckpt 8)
3. `PLATFORM_REQUIREMENTS.md` — scale, user-model, review cycle, audit, concurrency requirements
4. `NAVIGATION_MAP.md` — every route + click path (updated through Ckpt 8)
5. `DATA_CATALOG.md` — every data item + where it lives
6. `ROADMAP.md` — what's been done, what's next (updated through Ckpt 8; includes Ckpt 9 /docs/ setup + Claude Code migration top-priority)
7. `CORRECTIONS_LOG.md` — mistakes and lessons (includes Pattern 11 4th-recurrence + Option A clean-split procedural pattern)
8. `CHAT_REGISTRY.md` — log of past chats and URLs
9. `HANDOFF_PROTOCOL.md` — the rules for how chats operate
10. `DOCUMENTATION_ARCHITECTURE.md` — doc-system design
11. `NEW_CHAT_PROMPT.md` — this briefing template (with the communication banner + Rule 9 + Claude Code migration note)
12. `DOCUMENT_MANIFEST.md` — ground-truth registry of what docs exist
13. **`CLAUDE_CODE_MIGRATION.md` — NEW (end of Ckpt 8): migration plan for shifting from claude.ai to Claude Code after Ckpt 9 deploy completes. Ckpt 9's Task 1 puts this file (plus `CLAUDE_CODE_STARTER.md`) into the repo at `/docs/`.**

Plus: **`CLAUDE_CODE_STARTER.md`** is a new non-Group-A file (read-at-session-start prompt). Ckpt 9's Task 1 puts it into `/docs/` alongside the Group A docs.

No Group B tool-specific doc needed — Ckpt 9 is deploy + cleanup + docs setup only; no tool-specific work.

### MANDATORY START-OF-CHAT SEQUENCE

1. Read all attached documents **end-to-end**, not by section samples. Any doc with `< truncated lines N-M >` markers must be fully viewed with explicit range calls.
2. Run the **Pre-Flight Drift Check** per HANDOFF_PROTOCOL Rule 13 — output a short summary of where we are and anything that looks off (doc drift, plan discrepancies, file-list vs. claimed state, etc.). Specifically verify with `git status` that the 13 leftovers listed above are still present in my repo.
3. **Capture and confirm the chat URL** at the top of your first response. Ask me to paste it if unclear.
4. **Rate on a 1-5 scale the questions you plan to ask me**, per HANDOFF_PROTOCOL Rule 14d — and rewrite any that score below 4 (non-programmer-readable).
5. **Verify via `git log --oneline -5` that my local main has 4 unpushed commits** (ac62a3a, 5cc10c5, 3b69cf2, 14d68e7) before the deploy task.
6. Wait for my go-ahead before starting the work.

### WORKING RULES REMINDERS

- I'm a non-programmer. Plain-language options + expert recommendation + reversibility on every decision. (See banner above.)
- Every imperative instruction must come with a concrete method — terminal command, numbered click-path, or ask_user_input_v0 tool. No "paste the X" without a command. (Rule 9 in banner.)
- Don't generate commands using `/mnt/` or `/home/claude/` paths — those are your sandbox, not my terminal (Pattern 12).
- If a file needs to go into my repo, default delivery is a heredoc (`cat > "path" << 'MARKER' ... MARKER`) for small/medium files, or a code block to paste into Codespaces file-explorer for larger files.
- Ckpt 9 is the DEPLOY checkpoint — pushing to GitHub and deploying to vklf.com IS the scope of this chat. Deploy only happens after Task 1, 2, 3 are done and `npm run build` is clean.
- Document the work at end-of-chat per the standard Document Update Checklist.
- Log mistakes to CORRECTIONS_LOG.md as they happen (or at end of chat).
- Update the chat URL in CHAT_REGISTRY.md at end of chat.

### KNOWN DEFERRED ITEMS (not Ckpt 9 scope — do NOT work on these)

- Manual/AI toggle persistence on Keyword Clustering page → Phase 1-polish (low priority)
- localStorage → database migration for card labels → Phase 2
- All Phase 2 items from architectural reveal (Assignment, ReviewNote, AuditEvent, real-time collab, etc.) → Phase 2
- Middleware deprecation warning (Next.js 16 "proxy" convention) → not Phase M scope; fix at convenience later
- Think Tank projects localStorage → DB migration → Phase 2

### AFTER CKPT 9 COMPLETES — THIS IS IMPORTANT

**Phase M is done. The next step is the methodology shift to Claude Code.** See `docs/CLAUDE_CODE_MIGRATION.md` for the full plan. In brief:

1. **Immediately after Ckpt 9 deploy is confirmed visually:** the Ckpt 9 chat's Personalized Handoff Message must include a clearly-labeled section titled **"🚨 Ready to switch to Claude Code — do this next"** telling me exactly what to do.
2. **I (the user) then do a ~30-minute offline migration:** install Claude Code, authenticate, smoke-test, read `docs/CLAUDE_CODE_MIGRATION.md`. No Claude chat needed for this step.
3. **First Claude Code session** is Phase 1g-test kickoff (live-test Auto-Analyze on Keyword Clustering). Starter prompt: `docs/CLAUDE_CODE_STARTER.md`.
4. **This is the last claude.ai chat in the project.** The CHAT_REGISTRY transitions from URL entries to session-identifier entries after this.

**Claude running Ckpt 9:** your handoff at end-of-chat MUST explicitly flag migration readiness. Do not end the chat with a standard "great work, see you next time" — end with an explicit "You are now ready to migrate to Claude Code. Here's exactly what to do next" section, referencing `docs/CLAUDE_CODE_MIGRATION.md`.

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
