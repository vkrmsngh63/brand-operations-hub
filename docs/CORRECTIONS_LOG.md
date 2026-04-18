# CORRECTIONS LOG
## Append-only record of mistakes made during chats and lessons learned

**Started:** April 16, 2026
**Last updated:** April 18, 2026 (Phase 1g-test partial — 4 new entries: AA localStorage-keys drift, Phase 1g-test bugs surfaced, Pattern 11 recurrence #5 on session-boundary instructions, new Pattern 13 on session-boundary step-by-step requirement)
**Last updated in session:** session_2026-04-18_phase1g-test-kickoff (Claude Code)
**Previously updated (claude.ai era):** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f

**Purpose:** Every mistake made in any chat — whether Claude or user catches it — gets appended. Future Claudes read this to avoid repeating. This is how institutional memory survives Claude's lack of memory.

**Rules:**
- APPEND-ONLY. Never edit or delete past entries.
- Every mistake gets an entry regardless of severity.
- Each entry identifies root cause, not just symptom.
- Each entry includes Prevention describing what was added to prevent recurrence.

---

## Entry format

```
### [YYYY-MM-DD] — [Short mistake description]
**Chat URL:** https://claude.ai/chat/[uuid]
**Tool/Phase affected:** [Name]
**Severity:** Low / Medium / High / Critical

**What happened:** [Description]
**Root cause:** [Why it happened]
**How caught:** [User / Claude / Downstream problem]
**Correction:** [What was changed to fix]
**Prevention:** [What was added to prevent recurrence]
```

---

## Entries

### 2026-04-18 — Pattern 11 recurrence #5: session-boundary step-by-step instructions needed by non-programmer user (now a standing protocol requirement)
**Session:** session_2026-04-18_phase1g-test-kickoff (Claude Code)
**Tool/Phase affected:** Methodology / end-of-session protocol
**Severity:** High (5th recurrence of a class of issue that documentation alone has not solved)

**What happened:** At the end-of-session doc update phase, the user stated: *"please also tell me exactly what to do to end this session, how to begin the next session, exactly what to type, etc. Please also make sure the next session and every subsequent session is provided this information as well so that I am given step by step instructions on what to do next when I am at the end of sessions and in-between sessions about to start a new session."*

This is a direct reinforcement of the non-programmer rule, applied specifically to **session-boundary moments** — which the existing Pattern 11 / Rule 14a / Rule 9 framework had not sufficiently covered. The prior rules covered mid-session imperatives ("paste this file") but not end-of-session handholding (how to close, how to resume).

**Root cause:** The existing end-of-chat Personalized Handoff template in `HANDOFF_PROTOCOL.md §4 Step 4` was written for the claude.ai era (upload/download workflow). When the project migrated to Claude Code, the template wasn't updated to reflect the new workflow — and the non-programmer handholding requirement wasn't made explicit for Claude Code's session-boundary moments (close + reopen with exact terminal commands).

**How caught:** User directly, at end-of-session.

**Correction (applied this session):**
- Added a new **Step 4b — Claude Code variant of the handoff** to `HANDOFF_PROTOCOL.md §4`, with a mandatory template requiring 🚪 END-OF-SESSION INSTRUCTIONS and 🚪 NEXT-SESSION INSTRUCTIONS sections. The sections must contain exact terminal commands and exact copy-paste-ready first-message text.
- Extended Rule 15 in `CLAUDE_CODE_STARTER.md` with explicit sub-bullets requiring: "what we did," "files changed," "deferred items," "🚪 END-OF-SESSION INSTRUCTIONS," "🚪 NEXT-SESSION INSTRUCTIONS," "open questions."
- Every future Claude Code session reads `CLAUDE_CODE_STARTER.md` at start — so the requirement propagates automatically.

**Prevention — new Pattern 13 below.**

**Lesson:** Session bookends (end + next start) are exactly when a non-programmer user is at highest risk of being lost. The same mechanical rigor demanded mid-session applies at the boundaries, and the protocol must enforce this template-ly, not as a case-by-case courtesy.

**Meta-lesson (reinforces Pattern 11):** When the user has to restate a class of rule for the Nth time, document containment has failed and **mechanical enforcement at the protocol level** is required. A textual rule that Claude "should follow" is insufficient — the rule must be embedded in a REQUIRED TEMPLATE that Claude cannot produce an end-of-session handoff without filling in.

---

### 2026-04-18 — Phase 1g-test bugs: Adaptive Thinking runaway, Mode A omission failure, Vercel 5-min timeout risk
**Session:** session_2026-04-18_phase1g-test-kickoff (Claude Code)
**Tool/Phase affected:** Keyword Clustering / Auto-Analyze / Phase 1g-test
**Severity:** Medium (bugs in the tool, surfaced by the test exactly as designed; not mistakes by Claude or user)

**What happened:** First live test of Auto-Analyze against a real dataset (Bursitis Project, 2,328 keywords, model `claude-sonnet-4-6`, Server mode). Surfaced:

1. **Adaptive Thinking → 0 output tokens.** With Thinking=Adaptive and a 51k-character combined prompt, the model consumed its entire `max_tokens=128000` allocation during the silent thinking phase on all 3 attempts, emitting zero output text. Same signature each time: "Stream complete. Input: 183, Output: 0 tokens" after ~5 min wall time. Workaround: switch to Thinking=Enabled with Budget=12000; confirmed working on batch 1.

2. **Mode A (full-table) drops pre-existing topics as the table grows.** Batch 2 attempts 1 and 3 produced valid-looking responses but omitted 4–6 topics from the prior state and lost 2–8 keywords. HC5 validation caught the omissions correctly. The tool's Mode A → Mode B auto-switch did NOT trigger because that condition only fires on truncation, not on omission failures. Tool's 3-attempt retry with correction context exhausted without success; batch 2 marked FAILED, tool moved on to batch 3.

3. **Vercel 5-min timeout ceiling is close.** Batch 2 attempt 2 took 4:59 wall time and returned 0 output tokens — within 1 second of Vercel's serverless function timeout. May have been Vercel killing the stream, not the model misbehaving.

**Root cause (per-bug):**
- Bug 1: Adaptive Thinking is unbounded by design; large prompts make the model "want to think a lot"; combined with `max_tokens=128000` cap, thinking can fill the whole allocation.
- Bug 2: Full-table Mode A asks the model to re-transcribe the entire current state. As state grows, model attention degrades and rows get dropped. Known long-context generation pattern.
- Bug 3: Server-mode requests are Vercel serverless functions with a 5-min hard kill. Each batch's thinking + output needs to fit under that ceiling, and batches get slower as prompts grow.

**How caught:** Live narration by user during the test. Exactly what Phase 1g-test was designed to surface.

**Corrections applied (this session):**
- Full findings captured in `KEYWORD_CLUSTERING_ACTIVE.md` §6.5 with fix recommendations per bug
- Phase 1g-test follow-up added as top priority for next session in `ROADMAP.md`
- Phase 1-polish list expanded with: overlay resize/move, Budget input UX fix, persist AA settings to UserPreference, UI warning for Adaptive+large-prompt combo

**Prevention:** These are product bugs, not process mistakes. They're prevented in future runs by tuning defaults (Thinking=Enabled-12k as default), broadening the Mode A→B trigger, and surfacing UI hints. All logged.

---

### 2026-04-18 — Documentation drift: `kst_aa_*` localStorage keys claimed to exist, actually don't
**Session:** session_2026-04-18_phase1g-test-kickoff (Claude Code)
**Tool/Phase affected:** Documentation accuracy / Auto-Analyze
**Severity:** Medium (mid-session time loss; user blocker on what was assumed to be a recoverable prompt)

**What happened:** At start of Phase 1g-test, the user opened the Auto-Analyze panel and the Initial Prompt textarea was empty. Prior docs (`DATA_CATALOG.md` §5.8 + `KEYWORD_CLUSTERING_ACTIVE.md` §4) claimed the prompts persist in localStorage under keys `kst_aa_initial_prompt` and `kst_aa_primer_prompt`. Claude grepped the codebase and confirmed those keys **do not exist anywhere in `/src/`** (zero matches). The only AA-related localStorage key is `aa_checkpoint_{Project.id}` (and note: uses `Project.id`, not `ProjectWorkflow.id` as the docs also claimed). Settings (including prompts) live only in React component state before a run starts, and are bundled into the checkpoint only after `saveCheckpoint()` fires.

**Root cause:** Likely origin — the original legacy KST HTML (pre-Phase 0) may have used those key names. When the tool was ported to the Next.js app, the localStorage logic was simplified to only checkpoint-based persistence. The handoff docs were written with the original key names in mind and never got a Pattern-3 (code is source of truth) verification pass.

**How caught:** Claude's start-of-session grep when the empty prompt was encountered. User had assumed (based on docs) that the prompts would be auto-loaded. They had to paste both prompts manually from their own saved text files.

**Correction (applied this session):**
- `DATA_CATALOG.md` §5.8 rewritten to reflect actual behavior + explicit note that the old key names don't exist
- `DATA_CATALOG.md` §5.9 corrected to `Project.id` (was `projectWorkflowId`)
- `KEYWORD_CLUSTERING_ACTIVE.md` §4 rewritten with correction + practical UX implication
- New follow-up task: commit canonical `docs/AUTO_ANALYZE_PROMPT_V2.md` so the prompts live in the repo (not scattered across user's laptop)

**Prevention:** Pattern 3 (code is source of truth) applies. When docs assert "localStorage key X exists" or "data persists at location Y," any session that depends on that claim should verify with a grep before acting. Adding a general corollary to Pattern 7: **claims about runtime state and persistence are doc-drift risks; verify against code.**

**Meta-lesson:** Prompts (and similar artifacts required for tool operation) should live in the **repo**, not in browser localStorage that "might persist." Commit-it-or-it-didn't-happen applies to required operational content just as it does to code.

---

### 2026-04-17 — Pattern 7 recurrence: `/projects/[projectId]/page.tsx` claimed built in Ckpt 6 but never existed — discovered post-production-deploy
**Chat URL:** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f
**Tool/Phase affected:** Phase M / Ckpts 6, 7, 8, 9 (all silently complicit)
**Severity:** High (shipped a broken happy-path route to production; recovered same-chat with Ckpt 9.5)

**What happened:** During Ckpt 9's visual verification on vklf.com post-deploy, clicking a Project's title on `/projects` went to a 404. Diagnostic `ls` confirmed `src/app/projects/[projectId]/page.tsx` did not exist on disk. **No one had ever built it.** Despite Ckpt 6's `CHAT_REGISTRY.md` entry claiming "Two new files created: `src/app/projects/page.tsx` (~1,493 lines) and `src/app/projects/[projectId]/page.tsx` (~372 lines)" — and despite `ROADMAP.md`, `PLATFORM_ARCHITECTURE.md` §3, and `NAVIGATION_MAP.md` all asserting the file existed as a live route — the file was not in the repo at any point from Ckpt 6 onward.

This chat's Task 0 build output gave an explicit warning: `/projects/[projectId]` did NOT appear as a standalone route in the build table, only `/projects/[projectId]/keyword-clustering` did. **Claude flagged this anomaly during Task 0** and wrote: *"If you want me to verify right now that `/projects/[projectId]/page.tsx` exists on disk, I can — but it's not necessary to proceed."* The decision to defer that verification to Task 6 (post-deploy visual check) was a direct failure of Rule 3 (code is source of truth) and Pattern 7 (plan drift verification). The one-line `ls` check would have cost ~5 seconds and caught the bug pre-deploy.

**Root cause (a chain of compounding failures):**
1. **Ckpt 6 chat** (chat `7a745b12-...`) most likely wrote this file to its sandbox `/mnt/user-data/outputs/` and either (a) never told the user to place it in the repo, or (b) wrote a command referencing a sandbox-only path, or (c) the `present_files` link was missed. Whatever happened, the file never landed in the user's Codespaces.
2. **End-of-Ckpt-6 handoff docs** confidently reported the file as built — Claude couldn't verify because of the Codespaces PORTS glitch (no local visual testing possible) and didn't run `ls` to verify file existence.
3. **Ckpts 7 and 8** didn't notice — neither chat had reason to touch the detail page, and its absence was silent (Next.js routing tolerates missing `page.tsx` in a folder that has subfolder routes — it just doesn't produce a route at that level).
4. **Ckpt 9's Task 0** had the diagnostic signal (`/projects/[projectId]` missing from route table) but Claude treated it as "implicit in the nested route" and deferred investigation.
5. **Visual verification post-deploy** finally caught it, but only because the user hit the 404 directly.

**How caught:** User's visual verification on vklf.com — specifically the "clicking project title → 404" and "KC page's Back to Project → 404" reports in Task 6.

**Correction:** Fix 3 of Ckpt 9.5 — built `src/app/projects/[projectId]/page.tsx` (487 lines) from scratch this chat. Matches the pattern of the existing `keyword-clustering/page.tsx` for URL-param reading + auth + fetch + error states. Pulls Project info via `GET /api/projects/[projectId]` and workflow statuses via `GET /api/project-workflows/[projectId]` in parallel. Renders 15-card workflow grid; clicking Keyword Analysis navigates into KC; clicking others shows a coming-soon toast. Error handling: 404 = "This Project no longer exists", 403 = "You do not have access to this Project", other errors = "Could not load this Project." Committed as `fcf2373`; deployed; verified working.

**Prevention — Pattern 7 mitigation strengthened (see below).**

**Key lesson:** When build output contradicts docs, investigate immediately. Do not defer "that's interesting but probably fine" observations about build output — treat them as Pattern 3 (silent fallback to tool knowledge) triggers. The cost of a 5-second `ls` is trivial; the cost of shipping a broken happy-path to production is substantial (requires visual verification to catch, requires follow-up fix deploy, erodes user trust in doc claims).

**Meta-lesson:** The handoff doc system's greatest weakness is that it trusts what prior chats reported. When four consecutive chats all say "it's built," it feels pedantic to doubt them. But "built" has to mean "verifiable on disk," not "was written to sandbox and claimed to be installed." Any chat working on files that originated in a prior chat's `/mnt/user-data/outputs/` should verify existence with `find` or `ls` as a first step. This is a corollary to Rule 3 and Pattern 7 that deserves its own naming — perhaps a future refinement to Pattern 7's wording in a subsequent chat.

---

### 2026-04-17 — `sed | tr` quoting pattern failed on first `git rm` batch; switched to `xargs -d '\n'`
**Chat URL:** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f
**Tool/Phase affected:** Methodology / Ckpt 9 cleanup
**Severity:** Low (caught immediately via error output; trivial retry)

**What happened:** During Ckpt 9 Task 3A (deleting 40 committed `.bak` files via `git rm`), Claude's command wrapped file paths in literal double-quotes via `sed 's/.*/"&"/'` and joined with `tr '\n' ' '`, then fed them to `git rm` through `$(...)`. The intent was to safely escape paths containing `[projectId]` brackets. But bash's word-splitting passed each quoted string as an argument WITH the quote characters still present as literals. git saw `"src/app/api/admin-notes/[noteId]/route.ts.bak"` (quote-as-character) as a pathspec, which doesn't match any file. Error: `fatal: pathspec '"src/app/...route.ts.bak"' did not match any files`.

**Root cause:** Overthought the quoting. `git rm` doesn't need brackets quoted — git's pathspec parser handles `[` and `]` as literals. The `sed` wrap added poisonous literal quotes. Should have tested the pattern in Claude's sandbox before giving it to the user.

**How caught:** Claude's own shell chain `&&` stopped execution after the error; user saw the error immediately in the output and reported it without damage.

**Correction:** Retried with `git ls-files | grep '\.bak' | xargs -d '\n' git rm`. The `xargs -d '\n'` reads one path per line and passes each as a clean argument — no quoting needed. Worked first try. All 40 files removed cleanly.

**Prevention — rule update:**
- **For passing file lists to git commands (or any command), default to `xargs -d '\n'`** rather than inventing shell-quoting schemes.
- **Test complex shell one-liners in Claude's sandbox before giving them to the user.** Claude has `bash_tool` access in the sandbox — use it for dry-runs of quoting-heavy patterns before shipping the command to the user's terminal.

**Meta-lesson:** The "clever one-liner" reflex in shell scripting is the enemy. Boring, well-trodden idioms (`xargs -d '\n'`, `read` loops) are more reliable than bespoke `sed` pipelines, even when they look more verbose.

---

### 2026-04-17 — /docs/ folder had 3 empty subfolders from April 6 that weren't in any Group A doc
**Chat URL:** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f
**Tool/Phase affected:** Repo state / Ckpt 9 `/docs/` setup
**Severity:** Low (inspection caught it, handled cleanly, no damage)

**What happened:** When Ckpt 9's Task 2 ran its initial repo-state inspection, `ls docs/` returned three empty subfolders: `docs/legacy/`, `docs/primers/`, `docs/workflows/` — existing since April 6 (before Phase D documentation overhaul), never populated, never tracked in git (git doesn't track empty folders). No Group A doc mentioned their existence. Ckpt 9's briefing assumed `/docs/` didn't exist and would be created fresh.

**How caught:** Claude's `ls docs/` during the drift check. Immediately flagged as a discrepancy, investigated via follow-up inspection command, confirmed empty, proposed clean deletion, user approved.

**Correction:** All three subfolders deleted by Ckpt 9's setup script. `/docs/` is now cleanly populated with 15 handoff docs, zero stale subfolders.

**Prevention:** Start-of-chat drift check in HANDOFF_PROTOCOL §2 already covers "verify code/repo state against doc claims" — this is a specific instance. No rule change needed, but worth logging as a reminder that **repo state can contain silent leftovers that aren't in any doc** — empty folders, dangling configs, old CI files, etc. The reflex to ignore "empty" things is wrong; empty is still state.

**Meta-lesson:** When the drift check surfaces an unexplained repo artifact, chase it to a known answer rather than defaulting to "probably nothing." The cost is a single `find` or `ls` command.

---

**Chat URL:** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c
**Tool/Phase affected:** Methodology / Entire project execution going forward
**Severity:** Informational (not a mistake — a strategic decision captured in the log so future Claudes understand the lineage)

**What happened:** After Phase M Ckpt 8 complete, the user asked whether the claude.ai copy-paste round-trip cost could be automated. Claude explained Claude Code (Anthropic's CLI tool that runs inside Codespaces, reads files directly, executes commands itself) as the answer. User confirmed cost is not a constraint and asked for the best methodology. Claude recommended migration to Claude Code for Phase 1g-test and all subsequent work.

User decided:
- **Timing:** Finish Phase M Ckpt 9 in claude.ai (safer — the highest-stakes deploy step stays in the known-good tool), THEN migrate to Claude Code for Phase 1g-test kickoff.
- **Scope:** TOP PRIORITY post-Ckpt-9 roadmap item.
- **Docs location:** `/docs/` at repo root (Option X) — gives Ckpt 9's legacy-location cleanup a proper home AND sets up Claude Code's filesystem access.

**Root cause (why the switch is happening):** Two drivers:
1. **Round-trip cost.** Every command in claude.ai requires user paste-in → output paste-back. Ckpt 8 had 20+ such round-trips. This fatigues the user and multiplies the chance of transcription errors.
2. **Pattern 11 recurrence.** The non-programmer rule has had to be re-stated by the user manually in 4 consecutive chats despite documentation escalation. The architectural cause — Claude in claude.ai cannot run commands itself, so is constantly asking the user to do things — partially disappears in Claude Code where Claude has direct execution.

**How caught:** Not a "catch" — proactive question from the user during end-of-chat wrap-up.

**Correction:** New Group A doc `CLAUDE_CODE_MIGRATION.md` (#13) produced this chat. New starter-prompt file `CLAUDE_CODE_STARTER.md` produced this chat. Updates made to: `ROADMAP.md` (Ckpt 9 scope expanded to include `/docs/` setup; migration added as top-priority post-Ckpt-9 item), `HANDOFF_PROTOCOL.md` (new §9 on Claude Code vs. claude.ai applicability), `DOCUMENTATION_ARCHITECTURE.md` (new §15 on doc system evolution), `NEW_CHAT_PROMPT.md` (Ckpt 9 objective includes /docs/ setup; post-Ckpt-9 section flags migration readiness), `DOCUMENT_MANIFEST.md` (Group A count → 13).

**Prevention:** N/A — this isn't a failure pattern. But the decision is logged here so:
- Future Claude Code sessions can reference this entry to understand WHY the project switched tools
- If the switch causes unforeseen issues, the rollback criteria are captured (see `CLAUDE_CODE_MIGRATION.md` §8)
- If the switch succeeds (expected), this entry becomes historical context

**Lesson for future methodology changes:** Don't switch tools and take on high-stakes work simultaneously. Phase M Ckpt 9 (deploy) stays in the known-good tool; the switch happens at a natural boundary (start of Phase 1g-test). Low-risk transition.

**Meta-lesson:** User's proactive question about automation was GOOD — exactly the kind of zoom-out the doc system has been encouraging. Rewarded with a strategic improvement.

---

### 2026-04-17 — Asked user to "paste the file" without a concrete command — Pattern 11 recurrence mid-chat (FOURTH consecutive chat)
**Chat URL:** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c
**Tool/Phase affected:** Methodology / Phase M Checkpoint 8 execution
**Severity:** High (Pattern 11 recurrence — now FOURTH consecutive chat where user had to manually enforce the non-programmer rule despite heavy documentation)

**What happened:** After the user answered the card-click design question and Option A was locked in, Claude needed to read two files from the user's repo (`src/app/dashboard/page.tsx` and `src/app/plos/page.tsx`) to draft the edit plan. Claude asked: *"Could you paste the contents of each, or if they're long, just paste them and I'll read through carefully?"* and *"You don't need to upload them as files — just paste the contents in your next message."*

The user (correctly) called this out: *"Please note that I am a complete novice and will need you to either give me terminal commands or walk me step by step through everything you want me to do. This problem seems to keep lingering despite having not only instructed you so in every chat we've had but also asking you to make increasingly stringent rules..."*

The mistake: "paste the file" treats "opening a file and copying its contents" as a trivial action — which for a programmer, it is (Cmd-click, select-all, copy, paste). For a non-programmer it's ambiguous: which editor? How do I select all? What if it's a huge file? Claude's mental model silently assumed the user would know the mechanics, even though Pattern 11 explicitly calls out this class of slip as a structural problem with LLM attention.

**Root cause:** This is the Pattern 11 meta-pattern in action AGAIN. The rules exist (HANDOFF_PROTOCOL Rules 14a–14e, the big NEW_CHAT_PROMPT banner, this log's Pattern 11 entry). Claude read them at start-of-chat, ran the Read-It-Back test on the decision question about card-click behavior (that one passed), then let the test slip for a subsequent "paste the file" request because it felt too banal to run the test on. The Read-It-Back test was being applied to **questions framed as decisions**, not to **instructions framed as tasks**. That's the gap.

Every instruction Claude gives — whether a decision question or a "please do X" request — must pass the same non-programmer-readable test. "Paste the file" fails. "Paste this command into your terminal and send me the output" passes.

**How caught:** User directly, at turn ~8 in the chat, with explicit reference to the recurring nature of the problem.

**Correction:**
- Acknowledged the recurrence openly, including acknowledging that Pattern 11 was already logged and documentation had been amped up in the prior chat — the slip happened anyway
- Gave the user a concrete terminal command (`cat src/app/pms/notes/page.tsx && head -60 src/components/AdminNotes.tsx`) that solved the original need
- Explicitly committed in-chat: *"Going forward in this chat, I'll hold myself to that. If I slip again, call it out."*
- No further slips occurred in the remaining steps (heredoc-based Python edit scripts were all delivered as ready-to-paste commands with verification output blocks)

**Prevention:**
- **Extended Rule 14a scope.** The Read-It-Back test isn't just for "decision questions" — it's for **every instruction Claude gives the user, including data-gathering requests, build commands, and "please share X" requests**. Any ask that would require the user to do something with a file, a keyboard, a browser, or a mouse must come with an exact terminal command or a numbered click-path. "Paste the contents" / "share the file" / "upload your code" / "show me your config" are all forms of the same slip.
- **New rule in spirit:** the phrase "paste it in" is a forbidden instruction unless it's followed immediately by "by running this command" or "by doing these clicks in this order."
- **Mechanical test addition:** Before sending any message that asks the user to do something, Claude scans the message for any imperative verb ("paste," "share," "upload," "show me," "send me," "give me," "look up") and confirms each one is paired with a concrete method (a terminal command, a click-sequence, an ask_user_input_v0 tool call). If any imperative verb is orphaned, rewrite.
- **Pattern 11 update:** The recurrence count is now FOUR chats. The fact that documentation was substantially escalated between Ckpt 7 and this chat — and the slip happened anyway — confirms the Pattern 11 diagnosis that this is a visibility-under-load issue that documentation alone cannot fully solve. The fix is mechanical habit reinforcement every single instruction, not just "more emphasis in docs." See updated Pattern 11 below.

**Lesson:** The Read-It-Back test is easy to run on obvious questions and easy to skip on banal requests. The slip happens in the small requests, not the big ones. Mechanical tests must cover the whole surface, not just the decision questions.

**Meta-lesson for future Claudes:** When the user's cognitive cost of completing your request exceeds the cognitive cost of you figuring out the command to pre-empt their work, you've failed the non-programmer rule. Always pre-empt.

---

### 2026-04-17 — Pre-existing .bak/untracked files in git status handled via Option A clean split (procedural pattern — NOT a mistake, but a pattern future chats need to apply)
**Chat URL:** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c
**Tool/Phase affected:** Methodology / Phase M commit hygiene
**Severity:** Informational (not a mistake — a procedural pattern being formalized)

**What happened:** During Ckpt 8's commit step, Claude ran `git add -A` expecting to stage only the 7 files from this chat's work. Instead, `git status` showed 20 staged files — the 7 from this chat plus 13 pre-existing files from prior Phase M chats (Ckpts 1–5):
- `prisma/schema.prisma.bak` (from Ckpts 1–4 schema refactor)
- Nine `.bak` files in `src/app/api/projects/[projectId]/` (from Ckpt 5 API route rewrite)
- `src/lib/auth.ts.bak` (from Ckpt 5)
- `src/app/HANDOFF.md` and `src/app/ROADMAP.md` (legacy in-repo docs, modified at some point but never committed; slated for relocation/deletion in Ckpt 9)

These 13 files had been sitting untracked/unstaged in the user's repo across Ckpts 5, 6, and 7 — each prior chat had correctly committed only its own work and left them. Claude's `git add -A` swept them in accidentally.

**Root cause:** `git add -A` is a broad brush. It correctly stages everything in the working tree, including pre-existing untracked/modified files the current chat did not touch. A more surgical approach — `git add <specific paths>` — would have avoided the issue but adds per-chat ceremony.

**How caught:** Claude noticed the mismatch on its own before committing (the staged file list did not match the expected 7-file list from the plan) and surfaced the issue to the user. User chose **Option A (clean split)** from 3 offered options, unstaged the 13 leftovers, and committed only the 7 chat-specific files.

**Correction:** Unstaged 13 files via `git reset HEAD <paths>`. Committed only the 7 chat-specific files as `ac62a3a "Phase M Ckpt 8: ..."`. Branch is now 4 commits ahead of origin/main (was 3 before).

**Prevention — PROCEDURAL PATTERN (read this, future chats):**

**Every Phase M chat until Ckpt 9 MUST follow this procedure when committing work:**

1. After making its own file changes, Claude runs `git status` and explicitly lists which files the current chat touched vs. which are pre-existing leftovers.
2. The staged set (`git add`) MUST contain ONLY the current chat's files. Use specific paths, not `git add -A`.
3. If `git add -A` is used by mistake (or the user suggests it), Claude must run `git status` afterwards, identify leftovers, and unstage them with `git reset HEAD <paths>` before committing.
4. Leftovers are **not deleted** — they stay in the working tree for Ckpt 9 to handle properly.

**The canonical inventory of pre-existing leftovers (as of end of Ckpt 8):**

```
prisma/schema.prisma.bak
src/app/HANDOFF.md                                                    (modified, not committed)
src/app/ROADMAP.md                                                    (modified, not committed)
src/app/api/projects/route.ts.bak
src/app/api/projects/[projectId]/route.ts.bak
src/app/api/projects/[projectId]/canvas/route.ts.bak
src/app/api/projects/[projectId]/canvas/nodes/route.ts.bak
src/app/api/projects/[projectId]/canvas/pathways/route.ts.bak
src/app/api/projects/[projectId]/canvas/rebuild/route.ts.bak
src/app/api/projects/[projectId]/canvas/sister-links/route.ts.bak
src/app/api/projects/[projectId]/keywords/route.ts.bak
src/app/api/projects/[projectId]/keywords/[keywordId]/route.ts.bak
src/lib/auth.ts.bak
```

**13 total. Plus whatever `.bak` files arise from subsequent chats (e.g., `src/app/dashboard/page.tsx.bak` and `src/app/plos/page.tsx.bak` are now committed as of Ckpt 8; future chats may add more alongside their own edits).**

**Ckpt 9's cleanup scope includes all of the above** — per ROADMAP.md Ckpt 9 section and PLATFORM_ARCHITECTURE.md §10 Known Technical Debt.

**Lesson:** A clean commit stack is load-bearing for future legibility. `git log` must read as "Ckpt 5 did X, Ckpt 6 did Y, Ckpt 7 did Z, Ckpt 8 did W" — not "Ckpt 8 did W and also swept up a bunch of leftovers from three chats ago." The one-time cost of the Option A unstaging dance is worth the clarity.

---


**Chat URL:** https://claude.ai/chat/7e0b8456-b925-4460-a583-d348d1c965bf
**Tool/Phase affected:** Methodology / Phase M Checkpoint 7 execution
**Severity:** Low (caught immediately, no damage)

**What happened:** During Step 4 of the Checkpoint 7 execution, Claude told the user to run the command `mv /mnt/user-data/outputs/page.tsx "src/app/projects/[projectId]/keyword-clustering/page.tsx"` to install the new page file. The path `/mnt/user-data/outputs/` only exists inside Claude's own sandbox environment — not in the user's GitHub Codespaces. The `mv` command failed with "cannot stat: No such file or directory."

The user responded constructively with "Please tell me where exactly I need to add this file..." rather than trying to debug the broken command. Claude immediately pivoted to two clear alternatives (Codespaces file-explorer vs. terminal heredoc) and the problem was resolved in the next turn.

**Root cause:** Claude used the `create_file` tool to write the file to `/home/claude/page.tsx`, then used `present_files` to copy it to `/mnt/user-data/outputs/page.tsx` (Claude's output directory). Claude then constructed a `mv` command using the `/mnt/user-data/outputs/` path — which is Claude's environment's download origin, NOT a path visible to the user's terminal. Classic "sandbox path leak" — confusing Claude's environment paths with the user's environment paths.

The user's Codespaces terminal has no knowledge of `/mnt/user-data/outputs/`. It only sees the repo at `/workspaces/brand-operations-hub/`. For the user, a file created on Claude's side needs to be either (a) pasted into Codespaces' file explorer, or (b) created in the user's terminal via heredoc (`cat > ... << EOF`), or (c) downloaded by the user from the chat interface and then manually moved.

**How caught:** User — immediately, within one turn, without debugging time wasted.

**Correction:**
- Acknowledged the mistake openly in the next message
- Offered two clear alternatives: Codespaces file-explorer (Option A) and terminal heredoc (Option B)
- When Option A's shortcut (`../page.tsx` trick) didn't work in the user's version of Codespaces, pivoted smoothly to Option B
- File was installed successfully via `cat > ... << 'CLAUDE_EOF_MARKER'` heredoc pattern
- Line count verification (164 lines) confirmed nothing was lost in the copy-paste

**Prevention:**
- **Mental rule for future Claudes:** When generating a terminal command for the user, NEVER reference any path starting with `/mnt/`, `/home/claude/`, or any other Claude-sandbox path. The user's terminal operates only inside `/workspaces/brand-operations-hub/`.
- **Default method for delivering file content to the user's repo:** For small-to-medium files (under ~200 lines), use the heredoc `cat > "path" << 'MARKER' ... MARKER` pattern — the file content is embedded directly in the command, so no cross-environment path issue. For larger files, paste the content into a code block and have the user paste it into Codespaces' file-explorer New File flow.
- **If Claude has used `present_files` to produce a downloadable file:** That file is for the user's download button in the chat UI, not for terminal `mv`. Claude should not mention the `/mnt/user-data/outputs/` path to the user.
- **Pattern 12 added below** to capture the general rule.

**Lesson:** Claude has two environments (its own sandbox + the user's Codespaces) with different filesystems. Every command Claude gives the user must use ONLY paths that exist in the user's environment. Claude's own paths are internal plumbing and must not appear in user-facing commands.

---

### 2026-04-17 — Gave user a terminal command with a sandbox-only path
**Chat URL:** https://claude.ai/chat/7e0b8456-b925-4460-a583-d348d1c965bf
**Tool/Phase affected:** Methodology / Phase M Checkpoint 7 execution
**Severity:** Low (caught immediately, no damage)

**What happened:** During Step 4 of the Checkpoint 7 execution, Claude told the user to run the command `mv /mnt/user-data/outputs/page.tsx "src/app/projects/[projectId]/keyword-clustering/page.tsx"` to install the new page file. The path `/mnt/user-data/outputs/` only exists inside Claude's own sandbox environment — not in the user's GitHub Codespaces. The `mv` command failed with "cannot stat: No such file or directory."

The user responded constructively with "Please tell me where exactly I need to add this file..." rather than trying to debug the broken command. Claude immediately pivoted to two clear alternatives (Codespaces file-explorer vs. terminal heredoc) and the problem was resolved in the next turn.

**Root cause:** Claude used the `create_file` tool to write the file to `/home/claude/page.tsx`, then used `present_files` to copy it to `/mnt/user-data/outputs/page.tsx` (Claude's output directory). Claude then constructed a `mv` command using the `/mnt/user-data/outputs/` path — which is Claude's environment's download origin, NOT a path visible to the user's terminal. Classic "sandbox path leak" — confusing Claude's environment paths with the user's environment paths.

The user's Codespaces terminal has no knowledge of `/mnt/user-data/outputs/`. It only sees the repo at `/workspaces/brand-operations-hub/`. For the user, a file created on Claude's side needs to be either (a) pasted into Codespaces' file explorer, or (b) created in the user's terminal via heredoc (`cat > ... << EOF`), or (c) downloaded by the user from the chat interface and then manually moved.

**How caught:** User — immediately, within one turn, without debugging time wasted.

**Correction:**
- Acknowledged the mistake openly in the next message
- Offered two clear alternatives: Codespaces file-explorer (Option A) and terminal heredoc (Option B)
- When Option A's shortcut (`../page.tsx` trick) didn't work in the user's version of Codespaces, pivoted smoothly to Option B
- File was installed successfully via `cat > ... << 'CLAUDE_EOF_MARKER'` heredoc pattern
- Line count verification (164 lines) confirmed nothing was lost in the copy-paste

**Prevention:**
- **Mental rule for future Claudes:** When generating a terminal command for the user, NEVER reference any path starting with `/mnt/`, `/home/claude/`, or any other Claude-sandbox path. The user's terminal operates only inside `/workspaces/brand-operations-hub/`.
- **Default method for delivering file content to the user's repo:** For small-to-medium files (under ~200 lines), use the heredoc `cat > "path" << 'MARKER' ... MARKER` pattern — the file content is embedded directly in the command, so no cross-environment path issue. For larger files, paste the content into a code block and have the user paste it into Codespaces' file-explorer New File flow.
- **If Claude has used `present_files` to produce a downloadable file:** That file is for the user's download button in the chat UI, not for terminal `mv`. Claude should not mention the `/mnt/user-data/outputs/` path to the user.
- **Pattern 12 added below** to capture the general rule.

**Lesson:** Claude has two environments (its own sandbox + the user's Codespaces) with different filesystems. Every command Claude gives the user must use ONLY paths that exist in the user's environment. Claude's own paths are internal plumbing and must not appear in user-facing commands.

---

### 2026-04-17 — User had to repeat "I'm a non-programmer, use plain language" — THIRD consecutive chat
**Chat URL:** https://claude.ai/chat/7a745b12-efdf-4adf-a2b4-bf11716f971b
**Tool/Phase affected:** Methodology / Start-of-chat protocol
**Severity:** High (recurring — same class of issue repeatedly caught by user)

**What happened:** On the user's second message of the chat, the user had to explicitly state: "I am a complete novice and not a programmer so you will have to refrain from using technical language. [...] this was explicitly mentioned to you in many past chats but I've had to repeat this in every chat despite asking you to include a note to this effect in the handoff instructions you provide at the end of the chat so that this issue does not reappear in any future chats."

The user was not reacting to a specific jargon incident in this chat — they were pre-empting, because experience across multiple prior chats had taught them that future Claudes would need this reminder regardless of what was in the docs. The reminder itself has been documented in: `HANDOFF_PROTOCOL.md` Rules 14–14e, `PROJECT_CONTEXT.md` §13, `NEW_CHAT_PROMPT.md` opening paragraphs, and `CORRECTIONS_LOG.md` Pattern 8.

**Root cause:** This is a META-pattern — the rules exist, they're prominent, but Claudes still slip mid-chat under cognitive load. The rules live in documents that Claude reads at start-of-chat, but by turn 15+, the most recent turns dominate attention and the plain-language discipline slowly degrades. The "Read It Back" mechanical test (Rule 14a) only helps if Claude runs it on every question; under load, it gets skipped.

Additionally: past end-of-chat handoffs have presumably included some version of "please be careful about technical language" in the next-chat instructions, but clearly not prominently enough, because the user has had to repeat the instruction by hand in each new chat.

**How caught:** User caught directly at turn 2 — pre-emptively.

**Correction:**
- Acknowledged the recurrence openly to the user rather than minimizing or promising to "try harder"
- Explained honestly WHY the slip keeps happening (recent-turn dominance, mechanical test skipping under load)
- Committed to three concrete fixes for the next chat: (1) add a prominent top-of-file communication banner to `NEW_CHAT_PROMPT.md` so it's the FIRST thing Claude reads, not buried in paragraph 4; (2) log this recurrence as a meta-pattern in CORRECTIONS_LOG (this entry); (3) add a mandatory bullet to the Personalized Handoff Message template flagging the recurrence

**Prevention:**
- **New: Top-of-`NEW_CHAT_PROMPT.md` banner** with loud, visual formatting stating the user has had to repeat this instruction in multiple chats and that mechanical discipline (Rules 14a–14e) is non-negotiable. See the updated `NEW_CHAT_PROMPT.md` for the exact wording.
- **Pattern 11 (below)** formalizes this as a meta-pattern: when an instruction has to be repeated by the user for ≥3 chats, the documentation containment is insufficient and the instruction needs to be escalated in visibility (moved higher in the docs, repeated in more places, given mechanical enforcement).
- **Claude's internal discipline check:** before sending any question to the user, read it back looking for any word that would require domain/programming knowledge. If found, rewrite. This has been Rule 14a since mid-April; compliance has been uneven.

**Lesson:** Documentation is necessary but insufficient for preventing communication-discipline slips. The slip is partially a product of how LLMs work (recent attention > distant attention), which means no amount of rule-writing fully solves it. What helps: (1) putting the reminder in the MOST attention-grabbing position in the most-read doc, (2) making the reminder visually impossible to miss, (3) repeating it in more than one doc, (4) having the user call it out early so mid-chat attention weighting keeps it fresh.

**Meta-lesson:** When the same instruction has been necessary in multiple chats AND was already in the docs — the problem is not that Claude doesn't know it. The problem is visibility-under-load. Fix that, not the knowledge.

---

### 2026-04-17 — Buried the search-box feature in a one-liner at the bottom of the recap
**Chat URL:** https://claude.ai/chat/7a745b12-efdf-4adf-a2b4-bf11716f971b
**Tool/Phase affected:** `/projects` page design (Phase M Ckpt 6)
**Severity:** Low (caught immediately by user asking for the already-planned feature)

**What happened:** After the 4 product decisions were locked in, Claude produced a "Recap — the full `/projects` page design" section. The 4 decisions + the 2 previously-locked decisions from the prior chat were in a clear numbered table. The 3 scale-aware features (search bar, filter controls, sort controls) were appended below the table as a 3-bullet list with no framing.

The user responded by submitting a feature request: "can you add a search box at the top." The search box was already in the plan — literally one of the three bullets — but the user hadn't seen it because it was positioned as supporting info rather than part of the design.

**Root cause:** When summarizing design decisions, Claude gave prominent visual weight to the things the user had just decided (the 4 decisions + 2 prior ones) and less weight to things that Claude had already incorporated autonomously (search, filter, sort). From Claude's perspective these were "obvious" additions to a scale-aware list page. From the user's perspective, everything in the design needed equal visibility since they couldn't be expected to remember what Claude planned to build automatically.

**How caught:** User directly, via the feature request (which Claude correctly identified as already-in-scope).

**Correction:** Pointed user to the bullet, confirmed search was already included, proceeded with build.

**Prevention:** Added new bullet to `NEW_CHAT_PROMPT.md` critical-communication-rules: "Equal visual weight in design recaps — when summarizing a design, features Claude added autonomously get the SAME prominent framing as features the user explicitly decided." Future design recaps should treat all features equally in visual weight — no demotion of autonomous additions to "supporting info" status.

**Lesson:** The user can't distinguish between "things I decided" and "things Claude added automatically" unless Claude structures the recap to show them with equal weight. Recaps are for the user, not for Claude's own bookkeeping.

---

### 2026-04-17 — Did not proactively flag the local-storage-vs-database distinction for Dashboard card edits
**Chat URL:** https://claude.ai/chat/7a745b12-efdf-4adf-a2b4-bf11716f971b
**Tool/Phase affected:** Dashboard card edit pencils / data persistence design
**Severity:** Medium (missed an important product-decision moment)

**What happened:** User asked how to remove the edit pencils from the Dashboard system cards. Claude answered literally and gave instructions for removing them. The user had to re-engage with a follow-up asking why the edits needed to be removed — which forced Claude to surface the real underlying problem: edits were saving only to the user's own browser (localStorage), not to the database. In a multi-user future (Phase 2+), this means every worker would see a different name for the "PLOS" card depending on which browser they happened to be using, and would never see admin's edits.

**Root cause:** Claude treated the "remove edit pencils" request as a UI decision when it was actually a data-persistence decision. Claude should have recognized that the user's concern about "do I even want to edit these" was downstream of a concern that wasn't yet explicit: the edits don't actually do what they appear to do in a multi-user setting.

**How caught:** User, by asking "why are we removing them?" when Claude proposed removal.

**Correction:** Surfaced the real issue, presented three options (keep as-is, remove, migrate to DB), user chose to defer to Phase 2 rather than band-aid now. Added roadmap item: "Migrate card-label edits (3 system cards + 14 workflow cards) from local storage to database."

**Prevention:** Added to `NEW_CHAT_PROMPT.md` critical-communication-rules: "Persistence decisions need explicit framing — when data will save to local storage vs. database, explain in plain terms what that means for the user (syncs across devices? visible to workers? survives cache clears?). Never bury this as a parenthetical."

**Lesson:** Data persistence is a product decision, not an implementation detail. The difference between localStorage and database is user-visible (per-device vs. shared, transient vs. durable). Every persistence choice should be surfaced to the user at design time, not assumed.

---

### 2026-04-17 — Initially acted as if Claude had direct repo access when it didn't
**Chat URL:** https://claude.ai/chat/7a745b12-efdf-4adf-a2b4-bf11716f971b
**Tool/Phase affected:** `/projects` page build (Phase M Ckpt 6) — step "read existing pages to understand visual vocabulary"
**Severity:** Low (caught immediately)

**What happened:** When Claude wanted to examine `/dashboard` and `/plos` to match visual style, it initially spoke as if it could look at the files directly — "let me pull up the Dashboard file..." — instead of asking the user to share the relevant code.

**Root cause:** Conflation between Claude's own file-viewing tools (which access Claude's sandbox, not the user's repo) and the user's repo (which Claude cannot access without user mediation).

**How caught:** Claude self-corrected within one message.

**Correction:** Asked user to paste the relevant sections. (Same class of mistake as the sandbox-path leak 2026-04-17 above.)

**Prevention:** **Pattern 12 below** formalizes this as a general rule.

---

### 2026-04-17 — Platform architectural reveal forced mid-chat pivot (Ckpt 6 → PLATFORM_REQUIREMENTS creation)
**Chat URL:** https://claude.ai/chat/cc15409c-5000-4f4f-a5ce-a42784b5a94f
**Tool/Phase affected:** Platform / Entire handoff system
**Severity:** High (prevented rework; would have been Critical if caught later)

**What happened:** During Ckpt 6's Decision 2 (card at-rest content), Claude asked a scale-context question — "thinking ahead, roughly how many Projects do you imagine being in-flight simultaneously once this is fully in use?" The user's answer — "500 Projects per week, ramping to 5,000 — with 50 concurrent workers" — revealed that Claude had been designing the platform for a fundamentally different scale (one-admin-one-dashboard) than the actual target (multi-worker production floor). Ckpt 6 design was mid-flight and would have shipped as small-scale UX. Chat pivoted: paused Ckpt 6, conducted platform-wide interview, created `PLATFORM_REQUIREMENTS.md`, updated multiple Group A docs.

**Root cause:** Claude never asked about operational scale until mid-build. The existing handoff docs did not capture scale targets, user model, concurrency, review cycle, or audit — all of which are platform-level facts that shape every workflow design. The Ckpt 6 design was proceeding on an implicit assumption (small-Project-count admin UI) that was never validated.

**How caught:** Claude's own scale-context question during decision-framing (a Rule 16 zoom-out instinct, deployed too late to be fully preventive but early enough to avoid rework).

**Correction:** Paused Ckpt 6. Conducted 5-cluster platform interview. Created PLATFORM_REQUIREMENTS.md. Updated PROJECT_CONTEXT, PLATFORM_ARCHITECTURE, DATA_CATALOG, ROADMAP, DOCUMENTATION_ARCHITECTURE, HANDOFF_PROTOCOL.

**Prevention:**
- **New Rule 18 in HANDOFF_PROTOCOL** — mandatory Workflow Requirements Interview before any new workflow build
- **New Rule 19 in HANDOFF_PROTOCOL** — Platform-Truths Audit at end of every interview
- **Pattern 9 below** — platform-level requirements need their own dedicated doc
- Going forward, Phase 1 work happens under known scale context. Phase 2 scaffold design happens with the interview pattern locked in.

**Meta-lesson:** Scale context is a platform-level truth that should be asked about in chat #1 of every new phase. It's not a workflow-specific detail.

---

### 2026-04-17 — Generalized from N=1 when discussing workflow architecture
**Chat URL:** https://claude.ai/chat/cc15409c-5000-4f4f-a5ce-a42784b5a94f
**Tool/Phase affected:** Methodology / Workflow Requirements Interview design
**Severity:** Medium (caught by user, would have led to over-engineering)

**What happened:** During the interview, Claude began speculating about what "most of the 13 upcoming workflows" would need based on patterns inferred from Keyword Clustering's complexity. User gently corrected: Keyword Clustering is an outlier, not a template — most of the other 13 workflows are closer to "structured form + file upload + review" than to a canvas application.

**Root cause:** Claude had one reference point (Keyword Clustering) and extrapolated from it. Classic N=1 generalization.

**How caught:** User directly.

**Correction:** Rethought the Shared Workflow-Tool Scaffold concept from scratch — not "what KC needs minus its canvas" but "what a simple form-and-review workflow needs, with KC being a special case that gets grandfathered in."

**Prevention:**
- **Pattern 10 below** — when designing shared infrastructure from one reference point, actively search for the inverse case rather than extrapolating
- Workflow Requirements Interview's Question 14 (scaffold fit) asks directly whether the workflow is a standard case or a special case
- The scaffold will be designed BEFORE workflow #2, not during it, so it's not biased by whichever workflow happens to be built second

---

### 2026-04-17 — Initial read of uploaded docs was too shallow
**Chat URL:** https://claude.ai/chat/cc15409c-5000-4f4f-a5ce-a42784b5a94f
**Tool/Phase affected:** Start-of-chat protocol
**Severity:** Low (caught before any work based on the skim)

**What happened:** When the chat started, the Pre-Flight Drift Check summary was based on header/section scanning of several long docs (particularly PROJECT_CONTEXT, PLATFORM_ARCHITECTURE) rather than end-to-end reading. Claude would have started design work with an incomplete picture if the scale reveal hadn't happened.

**Root cause:** Skipping parts of long docs ("I've got the gist") is tempting when the doc appears well-organized. It's false economy — the details missed often contain the constraints that shape the whole design.

**How caught:** Unclear if Claude self-corrected or user prompted more thorough reading.

**Correction:** Fully re-read all Group A docs before proceeding with platform interview.

**Prevention:** Added to `NEW_CHAT_PROMPT.md` MANDATORY START-OF-CHAT SEQUENCE Step 1: "End-to-end, not by section samples. Any doc with `< truncated lines N-M >` markers must be fully viewed with explicit range calls." Future chats: when a doc has truncation markers, explicitly view the truncated range.

---

_[Earlier entries preserved from prior chats — see file history for entries from 2026-04-16, etc.]_

---

## Patterns (meta-level rules extracted from multiple entries)

### Pattern 1 — Documentation gaps at shared state
Described in 2026-04-16 entries: when data crosses tool boundaries, the sharing contract must be documented in both places.

### Pattern 2 — Navigation assumptions
Described in 2026-04-16 entry: never invent a click path; always verify with code or user.

### Pattern 3 — Silent fallback to tool knowledge
Described in 2026-04-16 entry: when Claude's docs knowledge conflicts with code, trust the code.

### Pattern 4 — Incomplete verification before claiming done
Described in prior entries: "tests pass" means running tests, not inferring their outcome.

### Pattern 5 — Deploy without visual check
Described in prior entries: deploys are not confirmed until the user sees the live site.

### Pattern 6 — Schema drift across docs
Described in 2026-04-16 entry: when schema changes, every doc that references the old shape must be updated in the same chat.

### Pattern 7 — Plan drift between chats (UPDATED 2026-04-17 — serious recurrence in Ckpt 9)
Described originally in 2026-04-17 (Ckpt 5) entry and reinforced in 2026-04-17 (Ckpt 9) entry "Pattern 7 recurrence: `/projects/[projectId]/page.tsx` claimed built in Ckpt 6 but never existed — discovered post-production-deploy."

Plans are a snapshot; actual file listings may differ by the time the next chat runs the plan. **Originally-stated mitigation:** "Always verify file lists with `find`/`ls` before executing multi-file plans."

**Post-Ckpt-9 update (critical):** The original mitigation is insufficient. In Ckpt 9, a file that 4 consecutive prior chats claimed to have built (`/projects/[projectId]/page.tsx`) was never actually on disk. The file was probably written to a prior Claude's sandbox and claimed-as-installed but never landed in the user's Codespaces. Four chats' worth of handoff docs confidently asserted its existence. Only production-deploy visual verification caught it.

**Strengthened mitigation (applies to every future chat):**

1. **Any file that originated in a prior chat's `/mnt/user-data/outputs/` must be verified-present in the user's repo at the start of any chat that depends on it.** A single `ls` or `find` command is sufficient. This is NOT optional — it's the corollary to Rule 3 (code is source of truth) that catches the "was-written-to-sandbox-but-never-installed" class of failure.

2. **Build-output anomalies must be investigated immediately, not deferred.** If `npm run build` output shows something unexpected (missing route, unexpected warning, route-count mismatch), do `ls`/`find`/`grep` investigation BEFORE proceeding to any next step. "We'll confirm during visual verification" is the wrong response — visual verification may only happen post-deploy, and some anomalies only become bugs visible in specific user paths.

3. **When the doc system says "X was built in Ckpt N," treat that as a claim to verify, not a fact.** The phrase-pattern to look for: any doc sentence asserting file existence or route existence written by a prior chat. If a current task depends on the asserted fact, verify.

**Trigger condition:** Build output anomaly OR doc claim of "X exists" that's material to current work → immediate verification via `ls`/`find`/`grep`.

**Recurrence count as of Ckpt 9:** 2 (first Ckpt 5, then Ckpt 9). Each recurrence has been substantially more expensive (Ckpt 5's was caught in-chat; Ckpt 9's shipped to production before being caught).

### Pattern 8 — Communication level slips under complexity
Described in 2026-04-16 entry: technical jargon creeps back in when Claude is mid-explanation of a complex technical decision. Mitigation: before asking any question that invokes a technical decision, mentally read the question back as if one were a non-programmer, and rewrite if any word requires domain knowledge.

### Pattern 9 — Non-functional / platform-level requirements need a dedicated doc (NEW 2026-04-17)
Described in the 2026-04-17 "Platform architectural reveal" entry. When a platform has scale, user-model, concurrency, review-cycle, audit, and infrastructure requirements that cut across all tools — those live in their own doc (`PLATFORM_REQUIREMENTS.md`), not embedded in tool-specific or project-context docs. Embedding them in the wrong place leads to them being forgotten during workflow-specific design work, which leads to workflows shipping at the wrong scale.

### Pattern 10 — Don't generalize from N=1 (NEW 2026-04-17)
Described in the 2026-04-17 "Generalized from N=1" entry. When designing shared infrastructure (like the Shared Workflow-Tool Scaffold), avoid projecting from one instance. Actively seek the inverse case: "What would this look like for the SIMPLEST workflow? What would it look like for the MOST COMPLEX?" Build the shared infrastructure for the typical case, accommodate the outliers as special cases.

### Pattern 11 — When an instruction needs to be repeated for ≥3 chats, visibility containment has failed (UPDATED 2026-04-17 — now FOUR consecutive chats)
Described originally in the 2026-04-17 "User had to repeat non-programmer" entry (third-chat recurrence) and reinforced in the 2026-04-17 "Asked user to paste the file" entry (fourth-chat recurrence — after documentation had been substantially escalated between chats).

If the user has to restate the same instruction at the start of multiple successive chats DESPITE it being in the docs, the documentation containment is insufficient. The fix is not "reiterate more forcefully in docs" (that's more of the same) — the fix is to (a) move the instruction to the MOST attention-grabbing position in the MOST-read doc, (b) make it visually impossible to miss, (c) repeat it in multiple docs, (d) give it mechanical enforcement (read-it-back test on every message), (e) record the recurrence as a meta-pattern so future Claudes understand this is a structural issue with how LLM attention works, not a simple oversight.

**Post-Ckpt-8 update (critical):** Steps (a)–(e) above are necessary but not sufficient. The Ckpt 7 → Ckpt 8 transition added a loud NEW_CHAT_PROMPT banner; the slip happened anyway in Ckpt 8 (on a "paste the file" ask). The diagnosis: the Read-It-Back test (Rule 14a) was only being applied to **decision questions**, not to **instructions framed as tasks or data-gathering requests**. "Paste the file" felt too banal to test.

**Revised Pattern 11 mitigation (applies to every future chat):**

The Read-It-Back test extends to **every imperative instruction Claude gives the user, including:**
- "Paste / share / upload / show me / send me / give me X"
- "Look up / check / find X"
- Any "can you do Y" request
- Build/run/test commands
- Navigation or UI click requests

For each such instruction, Claude must pair it with a concrete method (terminal command OR numbered click-path OR `ask_user_input_v0` tool call). Instructions lacking a concrete method fail Rule 14a and must be rewritten.

**Trigger condition:** When a user says (or implies) "I've told you this before in other chats" — Pattern 11 is engaged. Claude acknowledges openly, escalates documentation visibility, and logs the recurrence. Count is tracked — every recurrence strengthens the diagnosis that documentation alone is insufficient and mechanical habit is the binding constraint.

**Recurrence count as of Ckpt 8:** 4. Each recurrence has been caught by the user, not by Claude's own mechanical test.

### Pattern 12 — Sandbox-path leak in user-facing commands (NEW 2026-04-17)
Described in the 2026-04-17 "Gave user a sandbox-only path" entry. Claude operates in a sandbox environment with filesystem paths like `/home/claude/`, `/mnt/user-data/uploads/`, `/mnt/user-data/outputs/`, `/mnt/skills/`. The user's terminal operates in `/workspaces/brand-operations-hub/` (or wherever their repo is) and has NO access to Claude's sandbox. Any command Claude gives the user to run must reference only paths in the user's environment.

**Rule:** Before sending a terminal command to the user, scan it for these path prefixes: `/home/claude/`, `/mnt/user-data/`, `/mnt/skills/`. If any appear, rewrite.

**Default approach for delivering new file content to the user's repo:**
- **Small-to-medium files (< 200 lines):** Heredoc pattern — `cat > "path/in/user/repo" << 'MARKER' ... MARKER`. The content is embedded in the command. Reliable.
- **Large files (> 200 lines):** Paste content in a code block, have user right-click in Codespaces file-explorer → New File → name it → paste → save.
- **`present_files` produces a download link in the chat UI** — that's for the user to manually download if they want a copy, NOT for `mv` from a path in Claude's sandbox.

### Pattern 13 — Session-boundary instructions must be step-by-step concrete (NEW 2026-04-18)
Described in the 2026-04-18 "Pattern 11 recurrence #5" entry.

**The rule:** Every Claude Code session's end-of-session handoff MUST include two explicit sections with copy-paste-ready commands — not general guidance:

1. **🚪 END-OF-SESSION INSTRUCTIONS** — what the user types/clicks RIGHT NOW to close the current session (e.g., `exit`, close tab behavior, whether to leave terminal open). Concrete. No "when you're ready, end the session" — that's not a method.

2. **🚪 NEXT-SESSION INSTRUCTIONS** — what the user types when they return:
   - Exact terminal command to launch (`cd /workspaces/brand-operations-hub && claude`)
   - Exact first-message text (copy-paste-ready)
   - Any offline-between-sessions steps

**Why this pattern exists:** The user is a non-programmer. Session bookends are high-confusion moments ("what do I type? which terminal? what message do I paste?"). Without explicit copy-paste-ready instructions, the user has to guess. Pattern 11 rules apply to mid-session imperatives; Pattern 13 extends the same discipline to session bookends.

**Enforcement:** Baked into `HANDOFF_PROTOCOL.md §4 Step 4b` (the Claude Code variant of the handoff template) and `CLAUDE_CODE_STARTER.md` Rule 15's mandatory content list. Every session reads `CLAUDE_CODE_STARTER.md` at start, so the requirement propagates.

**Trigger condition:** Pattern 13 is engaged every end-of-session in Claude Code. Not conditional.

**Related patterns:** Pattern 11 (visibility-under-load for non-programmer users), Rule 14a / Rule 9 (Read-It-Back test for imperatives), Pattern 12 (sandbox-path leaks).

---

END OF DOCUMENT
