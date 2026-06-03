# Next session

**Written:** 2026-06-03-c (`session_2026-06-03-c_w1-keyword-clustering-rule33-backfill` — W#1 (Keyword Clustering) was BACKFILLED under HANDOFF_PROTOCOL Rule 33 — a DOCS-ONLY session (no code, no schema, no deploy, no in-session commits). W#1 graduated 2026-05-12 but predated Rule 33, so it lacked the one-page continuity primer + the one-paste catch-up command that W#2 received last session; this session closed that gap by writing NEW `docs/KEYWORD_CLUSTERING_PRIMER.md` (copied the template, mirrored the W#2 worked example, filled from the existing W#1 docs + a Rule 3 code-truth scan; every pointer verified) + registering `./catch-up-workflow 1` (→ `main` + the new primer) + updating `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` (§4 W#1-backfill → ✅ RESOLVED). **Closes (a.133) = Backfill W#1 (Keyword Clustering) under Rule 33 → ✅ DONE. Opens (a.134) RECOMMENDED-NEXT = Remaining W#2 (Competition Scraping) residue items** — the director EXPLICITLY chose this as next-session work. **The next session RUNS ON `workflow-2-competition-scraping`; the start command is `./catch-up-workflow 2`** (the dedicated graduated-W#2 re-entry — this is what the director will paste). **FIRST action next session = read the W#2 continuity primer `docs/COMPETITION_SCRAPING_PRIMER.md` (its §5 lists the residue table), present the candidate items to the director, and let the director pick which item(s) to work.** NO Rule 14f picker fired this session (the recommended primer shape was obvious + default-approved per `feedback_default_to_recommendation`; the §4 Step 1c next-task picker did NOT fire because the director EXPLICITLY named the next task).)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session is `session_2026-06-03-c` — the THIRD session of 2026-06-03 (suffix `-c`); the FIRST was `session_2026-06-03` (no suffix) = P-61, the SECOND was `session_2026-06-03-b` = W#2 graduation. The harness `currentDate` = 2026-06-03. **Next session: keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.** The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session.

> ⚠️ **BRANCH: next session runs on `workflow-2-competition-scraping`.** The (a.134) pick is the remaining W#2 (Competition Scraping) residue items, and W#2's branch is `workflow-2-competition-scraping`. **Start command: `./catch-up-workflow 2`** (the dedicated Rule 33 graduated-W#2 re-entry — switches to `workflow-2-competition-scraping` + prints `docs/COMPETITION_SCRAPING_PRIMER.md`). This is a DELIBERATE branch CHANGE from this session (`main`) back to `workflow-2-competition-scraping` — confirm `git branch --show-current` shows `workflow-2-competition-scraping` immediately after entry.

> ⚠️ **BRANCH STATE — NOTHING HELD BACK.** This was a DOCS-ONLY session: no code, no deploy, no in-session commits. Before this session's doc-batch, `main` and `workflow-2-competition-scraping` are both at `7fe4dbe` (the prior W#2-graduation doc-batch). After this session's end-of-session doc-batch commit to `main` + ping-pong onto `workflow-2-competition-scraping`, both branches carry the 2026-06-03-c doc-batch SHA. Expect `git log origin/workflow-2-competition-scraping..HEAD --oneline` to show 0 at next session entry.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** This (W#1 backfill) session was docs-only: NO → STAYED NO → NO at exit; zero `prisma db push`. **The W#2 residue items are mostly small UI / mechanical / docs polish — most are NOT schema changes.** BEFORE any prisma work on whichever residue item the director picks, confirm the Schema-change-in-flight flag at that session's start: if the picked item touches the schema it is ADDITIVE only; run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (never `migrate reset` against prod).

> ⚠️ **NO OWED VERIFICATION.** Nothing was deployed this session (docs-only). There is NO owed verification carried into next session.

> ⚠️ **W#2 IS GRADUATED — these are RESIDUE polish items, NOT a reopening.** W#2 (Competition Scraping) is ✅ GRADUATED 2026-06-03 (continuity-first). Its re-entry front door is `docs/COMPETITION_SCRAPING_PRIMER.md` + `./catch-up-workflow 2`. The residue items below are the LOW-priority, explicitly NON-BLOCKING leftovers from the primer §5 "post-graduation residue" table — picking one off does NOT un-graduate W#2. The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview stay intentionally held until W#3 needs to read W#2 data — do NOT author them now.

> ⚠️ **W#1 IS ALSO GRADUATED — do NOT touch it next session.** W#1 (Keyword Clustering) is graduated and lives on `main`. Its continuity kit is now complete (`docs/KEYWORD_CLUSTERING_PRIMER.md` + `./catch-up-workflow 1`). The one W#2-residue item that touches W#1 code — the deferred `AutoAnalyze.tsx` shared-list migration (a P-52 carry-over) — is W#1-OWNED per Rule 3; if the director picks it, run it on `main`, not on `workflow-2-competition-scraping`.

---

## What we did this session (in plain terms)

This session gave Workflow #1 (Keyword Clustering) the same "front door" treatment Workflow #2 got last session.

**Last session we "graduated" Workflow #2 and wrote a one-page primer + a one-line re-entry command (`./catch-up-workflow 2`) so anyone can pick it back up later with full context.** Workflow #1 had been graduated much earlier (back in May) but never got those two things, because the rule that introduced them (Rule 33) didn't exist yet. So W#1 was missing its front door.

**This session wrote that front door for W#1.** We created `docs/KEYWORD_CLUSTERING_PRIMER.md` — a one-page map that explains what W#1 does, how it's built, where its real code and data live, and what's still open — and we registered the `./catch-up-workflow 1` command so a future session can re-enter W#1 with a single paste, exactly like W#2 now has. We double-checked that every link in the primer points to a real file.

**One judgment call worth noting (it's now written down as a lesson):** when copying the W#2 primer's shape, the natural assumption was that W#1's "what's left" section should be a small "leftover residue" list like W#2's. But that's wrong for W#1 — W#2's to-do list is fully finished, while W#1 still has a real, non-empty list of improvements queued (the biggest being an "undo / action history" feature). So W#1's primer points at its live to-do list as the source of truth, instead of pretending W#1 is completely done. The lesson: a "graduated" tool isn't necessarily a "finished" tool.

**This was a documentation-only session — no app code changed, nothing was deployed.**

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` + `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (the W#2 residue table) + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (the W#1 live backlog) + `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` + `docs/DATA_CATALOG.md` §6.1 (the deferred W#2 Data Contract).

- **(a.134) = Remaining W#2 (Competition Scraping) residue items** — **NEXT SESSION (see below).** All LOW/non-blocking.
- **The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview** — intentionally held until W#3 starts and needs to read W#2 data (DOCUMENTATION_ARCHITECTURE §4 create-on-need). NOT a blocker.
- **W#1's live polish backlog** — HIGH H-1 (action history + per-action undo) is the queued-next W#1 item; plus M-1/M-2/M-3 medium, L-1..L-5 low, C-1..C-7 carry-overs, Z-1 explicitly-last, P-1 passive prereq. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`; W#1 re-entry via `./catch-up-workflow 1` (or the older `./resume-workflow 1`). On `main`.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card rename + hub page + "Continued Competitive Surveillance" page (spec doc exists) — future-workflow, NOT a W#2 residue item.

## What we'll do next session (in plain terms)

1. **We pick off one (or a few) of Workflow #2's small leftover items.** Workflow #2 is finished and graduated, but a short list of low-priority odds-and-ends was set aside — things like an extra "export to spreadsheet" button on two pages, a tiny mechanical fix to one of our internal command files, a small "Condition Pathology" card, and a couple of capture bug-fixes.
2. **We start by reading Workflow #2's front-door primer, then show you the list and let you choose.** Rather than guess, the session reads the primer's leftover list, presents it to you in plain terms, and you pick which item(s) you want done.
3. **Whatever you pick follows the normal build-and-deploy routine** — plan the shape with you if it's non-trivial, build, run the test scoreboard, deploy to vklf.com, and you verify on real Chrome.

## What's still left in the total roadmap (in plain terms)

- **W#1 (Keyword Clustering) Rule-33 backfill — ✅ DONE 2026-06-03-c.** Graduated W#1 now has its continuity primer + `./catch-up-workflow 1`. On `main`.
- **W#2 graduation — ✅ DONE 2026-06-03 (continuity-first).** Workflow #2 is officially essentially complete; re-entry via the primer + `./catch-up-workflow 2`.
- **Remaining W#2 residue items — NEXT, the (a.134) pick.** Low-priority leftovers; the director picks from the primer §5 list. On `workflow-2-competition-scraping`.
- **The deferred W#2 Data Contract** — held until W#3 needs to read W#2 data; NOT a blocker.
- **W#1's live polish backlog** — HIGH H-1 (action history + undo) queued; plus medium/low/carry-over items. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`. On `main`.
- **P-61 (extension default categories) — ✅ CLOSED 2026-06-03.** The LAST substantive W#2 polish item.
- **P-54 / P-55 / P-56 / P-57 / P-58 / P-59 / P-60 — ✅ ALL CLOSED.** The full W#2 polish queue is drained.
- **P-49 W#2 Reviews Phase 2 — ✅ CLOSED 2026-06-01.**
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED. TWO carry-overs OPEN: official Opus 4.8 pricing numbers + the deferred W#1-owned `AutoAnalyze.tsx` shared-list migration.
- **P-53** Excel "Export Table" for the Category + Type pages — effectively ABSORBED by P-55; LOW residue only.
- **P-43 mechanical prevention small fix** — add an absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix.
- **P-50 NEW Condition Pathology card** — small single-session UI addition; director already approved scope.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority.
- **P-56 Option-2 follow-up** — the optional "kill the idle flash too" for the residual Amazon Highlight-Terms flicker; raise only if the director wants it.
- **P-62 (NEW capture)** — the Workflow-11 surveillance card + page. Future-workflow.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started (P-62 seeds part of W#11). W#3 kickoff is also the trigger to author the deferred W#2 Data Contract.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#1 (Keyword Clustering) was BACKFILLED under HANDOFF_PROTOCOL Rule 33 — 2026-06-03-c.** A DOCS-ONLY session: NO code, NO schema, NO deploy, NO in-session commits. W#1 graduated 2026-05-12 but predated Rule 33, so it lacked the one-page continuity primer + the one-paste catch-up command that W#2 received last session. This session: (1) wrote NEW `docs/KEYWORD_CLUSTERING_PRIMER.md` (copied `docs/templates/WORKFLOW_PRIMER_TEMPLATE.md`, mirrored the W#2 worked example `docs/COMPETITION_SCRAPING_PRIMER.md`, filled from the existing W#1 Data Contract / Polish Backlog / Next-Session / Archive docs PLUS a Rule 3 code-truth scan of W#1's real surfaces — the `keyword-clustering/` page + components, the `canvas/` + `keywords/` + `removed-keywords/` + `user-preferences/` routes, the `src/lib/` helpers `operation-applier.ts` / `auto-analyze-v3.ts` / `canvas-*.ts`, and the Prisma models `ProjectWorkflow` / `Keyword` / `CanvasNode` / `RemovedKeyword` / `Pathway` / `SisterLink` / `CanvasState` / `UserPreference`; every pointer verified); (2) registered `./catch-up-workflow 1` (→ `main` + the new primer; bash syntax-checked OK); (3) updated `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` (§4 W#1-backfill → ✅ RESOLVED 2026-06-03-c; §2 chronological entry; §3 deliverable-5 line + Status line). The older Rule 22 path `./resume-workflow 1` coexists and stays valid.

**Session shape (read Rule 33 + the W#1 docs → copy the primer template → fill from the W#1 docs + a Rule 3 code-truth scan → verify pointers → register `./catch-up-workflow 1` → flip the design-doc §4 item → end-of-session doc-batch):**

- **Read-first:** `docs/HANDOFF_PROTOCOL.md` Rule 33 + `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` §4 + the existing W#1 docs + `docs/templates/WORKFLOW_PRIMER_TEMPLATE.md` + `docs/COMPETITION_SCRAPING_PRIMER.md` (the worked example).
- **NO Rule 14f picker fired** — the recommended primer shape was obvious + default-approved (copy the template, mirror the W#2 worked example), so per `feedback_default_to_recommendation` it was described plainly and proceeded (the director then said "proceed with the recommended shape"). The §4 Step 1c next-task picker did NOT fire because the director EXPLICITLY named the next task (remaining W#2 residue items).
- **No code, no deploy, no commits in-session.**
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged]) + HANDOFF_PROTOCOL header bump + the Group B updates (the NEW KEYWORD_CLUSTERING_PRIMER + WORKFLOW_GRADUATION_CONTINUITY_DESIGN §2/§3/§4 + the `./catch-up-workflow` script). **This doc-batch commits to `main` (W#1 IS `main`) + ping-pongs onto `workflow-2-competition-scraping` per the standard 3-push pattern; ONE push only (no prior deploy push — docs-only).**

**Schema-change-in-flight flag NO at entry → STAYED NO entire session → NO at exit. NEXT session (W#2 residue) = NO at entry anticipated** (most residue items are small UI / mechanical / docs polish).

**ZERO open DEFERRED items at exit (Rule 26):** TaskList returned EMPTY at entry; 3 in-session tasks were created + all completed (write the primer; register `./catch-up-workflow 1`; flip the design-doc §4 item). The deferred W#2 Data Contract + P-62 + the W#2 residue items + the W#1 live backlog are documented roadmap continuation, NOT TaskList DEFERRED items.

**Baselines UNCHANGED by definition (DOCS-ONLY — not re-run; legitimately skipped per the docs-only scoreboard exception):** extension `npm test` = **915/915 UNCHANGED** + src/lib `node:test` = **1369/1369 UNCHANGED** + `npm run build` = **74 routes UNCHANGED**; Check 6 Playwright SKIPPED per Rule 27.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-03-c** (NO top-tier slip — a clean docs-only session) capturing a NEW reusable PATTERN: **"graduated ≠ finished" — a graduated workflow's continuity-primer §5 must reflect the REAL backlog state.** Unlike W#2 (whose polish queue is fully drained, so its §5 = "post-graduation residue"), W#1 still has a LIVE, non-empty polish backlog (HIGH H-1 action-history+undo queued; M-1/M-2/M-3 medium; L-1..L-5 low; C-1..C-7 carry-overs; Z-1 explicitly-last; P-1 passive prereq) — so W#1's §5 points at `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` as canonical (point at the live backlog doc; do NOT restate it) and frames the open work as a live backlog, not residue. **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**Group B docs updated** — NEW `docs/KEYWORD_CLUSTERING_PRIMER.md` (the deliverable) + `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` (§4 W#1-backfill → ✅ RESOLVED 2026-06-03-c; §2 chronological entry; §3 deliverable-5 line + Status line) + the `./catch-up-workflow` script (registered W#1: a `case 1)` block + usage text). `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` UNCHANGED (already current; queues H-1; sparse per Rule 22). `docs/KEYWORD_CLUSTERING_ARCHIVE.md` / `_DATA_CONTRACT.md` / `_POLISH_BACKLOG.md` UNCHANGED. The W#2 Group B docs (`COMPETITION_SCRAPING_PRIMER.md` / `COMPETITION_SCRAPING_DESIGN.md` / `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md`) UNCHANGED (no W#2 work this session — the residue work is NEXT). `docs/AI_MODEL_REGISTRY.md` UNCHANGED.

**SEVENTY-SEVENTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO destructive ops — DOCS-ONLY. NO `prisma db push`, NO `migrate reset`, NO drop, NO dev-data deletes, NO in-session commits. NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session). The `./catch-up-workflow` script was MODIFIED (registered W#1) — an additive, non-destructive change, bash syntax-checked OK.
- **NEXT session (W#2 residue):** **whichever residue item the director picks follows the standard build-and-deploy routine.** Most residue items (P-53 export button, P-43 mechanical scoreboard fix, P-50 Condition Pathology card, P-26/P-27 capture bugs, the Opus 4.8 pricing-number P-52 carry-over) are small UI / mechanical / docs polish with NO schema change. If a picked item touches the schema, it is ADDITIVE only; run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (never `migrate reset` against prod). The W#1-owned `AutoAnalyze.tsx` shared-list migration (a P-52 carry-over), if picked, runs on `main` per Rule 3 ownership — NOT on `workflow-2-competition-scraping`. No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the NEW `docs/KEYWORD_CLUSTERING_PRIMER.md` + the W#2 continuity primer `docs/COMPETITION_SCRAPING_PRIMER.md` + `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` + the memory directory + the `./catch-up-workflow` + `./resume-workflow` scripts.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. The (a.134) pick is the remaining W#2 (Competition Scraping) residue items, and W#2's branch is `workflow-2-competition-scraping`. **Start command: `./catch-up-workflow 2`** (the dedicated Rule 33 graduated-W#2 re-entry — switches to `workflow-2-competition-scraping` + prints `docs/COMPETITION_SCRAPING_PRIMER.md`). This is a DELIBERATE branch CHANGE from this session's `main` to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch commits to `main` + ping-pongs onto `workflow-2-competition-scraping`): both branches carry the 2026-06-03-c doc-batch SHA on top of `7fe4dbe`. **Verify with `git log origin/workflow-2-competition-scraping..HEAD --oneline` showing 0**; `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block; the W#2 residue pick has a polish-item-spec per item — read the spec for whichever item the director picks, CREATE it per Rule 31 if missing):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- **`docs/COMPETITION_SCRAPING_PRIMER.md` — the FIRST read** (the W#2 continuity front door; §5 is the "post-graduation residue" table listing the candidate items). Present the §5 list to the director and let the director pick.
- **`docs/HANDOFF_PROTOCOL.md`** Rule 3 (workflow ownership) + Rule 9 (deploy gate) + Rule 14f (forced-picker) + Rule 23 (Change Impact Audit) + Rule 25 (multi-workflow) + Rule 26 + Rule 27 (verification) + Rule 30 (Session bookends) + Rule 31 (read-guarantee + audit-shipped-state) + §4 Step 4b extended template.
- **The polish-item-spec for whichever item the director picks** — `docs/polish-item-specs/P-53-*.md` / `P-50-*.md` / `P-43-*.md` / `P-26-*.md` / `P-27-*.md` / `P-56-*.md` / `P-52-*.md` (CREATE per Rule 31 if missing). Do a Rule 3 code-truth audit of the relevant surface BEFORE designing.
- `docs/COMPETITION_SCRAPING_DESIGN.md` + `docs/COMPETITION_SCRAPING_STACK_DECISIONS.md` — the W#2 design + architecture context (§B is append-only per Rule 18).
- `docs/ROADMAP.md` — the W#2 graduation record + the residue items + the total-roadmap summary.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-03-c (this session — the "graduated ≠ finished" primer-§5 PATTERN) + §Entry 2026-06-03-b (W#2 graduation) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_no_fabricated_instructions.md`** — act only on verbatim directives; the W#2 residue items are the confirmed (a.134) pick, but the SPECIFIC item is the director's pick at session start.
  - **`feedback_recommendation_style.md`** + **`feedback_default_to_recommendation.md`** — recommend the most thorough/reliable option; skip the forced-picker when re-confirming a default-approved recommendation.
  - **`feedback_remaining_roadmap_summary.md`** + **`feedback_handoff_carryovers_to_roadmap.md`** — the handoff must summarize the total remaining roadmap + capture every carry-over as a ROADMAP entry.
  - **`feedback_session_bookends_plain_summary.md`** — bookend with plain-terms summaries.
  - **`feedback_plan_output_shape_before_building.md`** — if the picked item is a UI/content surface, plan the shape WITH the director before coding.
  - `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md` + `feedback_exports_include_all_table_data.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; the FIRST read is `docs/COMPETITION_SCRAPING_PRIMER.md` (the W#2 continuity front door — its §5 lists the residue items), then read the polish-item-spec for whichever item I pick (CREATE it per Rule 31 if missing).** **This session runs on `workflow-2-competition-scraping` — verify the branch first (this is a deliberate change from `main`).** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.134) = Remaining W#2 (Competition Scraping) residue items):** Workflow #2 is graduated, but a short list of LOW-priority, explicitly NON-BLOCKING leftover items was folded into the primer §5 "post-graduation residue" table. **FIRST action: read `docs/COMPETITION_SCRAPING_PRIMER.md` §5, present the residue list to me in plain terms, and let me pick which item(s) to work this session.** The candidate items are: **P-53** (Excel "Export Table" on the Category + Type pages — effectively absorbed by P-55; LOW residue), **P-43** (a mechanical fix — add an absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session), **P-50** (a NEW "Condition Pathology" card — small single-session UI addition; scope pre-approved), **P-26** (below-fold scroll capture bugs), **P-27** (capture bugs #9 + #15), the **two P-52 carry-overs** (official Opus 4.8 pricing numbers + the W#1-owned `AutoAnalyze.tsx` shared-list migration — note the W#1 piece runs on `main` per Rule 3), and **P-56 Option-2** (the optional "kill the idle flash too" follow-up — raise only if I want it). **NOTE: P-62 is a FUTURE-WORKFLOW (W#11) item, NOT a W#2 residue item — do not fold it into this pick.** **W#2 is GRADUATED — picking off a residue item does NOT reopen it. Do NOT author the deferred W#2 Data Contract (held until W#3 needs it).**

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping   (deliberate change from this session's main)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/workflow-2-competition-scraping..HEAD --oneline
# Expected: 0 — main and workflow-2 both carry the 2026-06-03-c doc-batch SHA on top of 7fe4dbe; nothing is held back
```

If `git branch --show-current` shows `main` (or anything other than `workflow-2-competition-scraping`), run `./catch-up-workflow 2`.

**FIRST step (read the W#2 primer + present the residue list — BEFORE any coding):** read `docs/COMPETITION_SCRAPING_PRIMER.md` fully (especially §5 the residue table); then present the residue items to me in plain terms and let me pick. AFTER I pick: read that item's polish-item-spec (CREATE it per Rule 31 if missing), do a Rule 3 code-truth audit of the relevant surface, and confirm the Schema-change-in-flight flag (most residue items are NOT schema changes).

**Schema-change-in-flight flag:** **NO at entry.** Most W#2 residue items are small UI / mechanical / docs polish with NO schema change. If the item I pick touches the schema, it is ADDITIVE only; run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (never `migrate reset` against prod).

**Output-shape (plan WITH the director per `feedback_plan_output_shape_before_building` + `feedback_session_bookends_plain_summary`):** if the picked item is a UI/content surface (e.g. P-50 Condition Pathology card, P-53 Export Table), plan the placement/columns/shape WITH me before coding. For exports, follow `feedback_exports_include_all_table_data` (same columns + order as the on-screen table; include all click-to-reveal data; split sub-rows; generate fresh on click). If the recommended shape is obvious + default-approved, describe it plainly and proceed per `feedback_default_to_recommendation`.

**Forced-picker shape (before coding):** fire a Rule 14f AskUserQuestion for any real design fork (placement, columns, behavior). The deploy gate is itself a Rule 14f picker. The §4 Step 1c next-pick at end-of-session is a Rule 14f picker.

**Test coverage decision:** if the picked item adds a pure helper, add node:test coverage (run as part of the scoreboard). If it adds a regression-prone UI mechanic, add a Playwright spec per Rule 27 (or `test.skip()` pending the rig). The P-43 mechanical fix needs no test (it's a doc/command edit) — verify by running the scoreboard with the corrected absolute-cd prefix.

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect UNCHANGED unless the picked item touches `src/`)
- Extension tsc clean (expect UNCHANGED unless the picked item touches extension source)
- Extension `npm test` = 915 (entry 915)
- src/lib `node:test` = 1369 (entry 1369; +N if the picked item adds a pure helper)
- `npm run build` = 74 routes (entry 74; +1 only if the picked item adds a new endpoint)
- Check 6 Playwright per Rule 27 (SKIPPED unless the picked item adds a regression-prone UI mechanic)
- **Run `npm run build` with an explicit absolute `cd /workspaces/brand-operations-hub` prefix** — the P-43 cwd-leak recurred recently; treat a route count of 0 as the cwd-leak tell-tale. (If P-43 is the picked item, FIXING this leak in `.claude/commands/scoreboard.md` IS the task.)

**Deploy mechanics:** whichever item I pick follows the standard Rule 9 deploy gate + 3-push pattern (build commit on `workflow-2-competition-scraping` → ff-merge to `main` → ping-pong sync back → end-of-session doc-batch). If the picked item is a pure docs/command fix (e.g. P-43), it may be a docs-only push with no vklf.com impact. The W#1-owned P-52 `AutoAnalyze.tsx` migration, if picked, deploys from `main`.

**Group A docs to update at session end:** ROADMAP header bump + the (a.134) close / (a.135) open + the P-NN polish-backlog flip if a polish item shipped + CHAT_REGISTRY header bump (200th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ 1 NEW §Entry only if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (flip the picked residue item) + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (new "Deploy session #N" section if deployed) + `docs/COMPETITION_SCRAPING_DESIGN.md` §B (append-only design note if a design choice was made) + the picked item's polish-item-spec (Status flip).

**Standing carry-overs into this session:**

- **(a.134) = Remaining W#2 (Competition Scraping) residue items** — read the W#2 primer §5 FIRST; present the list; let the director pick. On `workflow-2-competition-scraping`.
- **The deferred W#2 Archive/Data-Contract split** — held until W#3 needs to read W#2 data; do NOT author now.
- **W#1's live polish backlog** (HIGH H-1 action-history+undo queued; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`) — W#1 is graduated + lives on `main`; do NOT touch unless the director picks a W#1 item explicitly.
- **P-62** — the Workflow-11 surveillance card+page (future-workflow; NOT a W#2 residue item).
- **The two P-52 carry-overs** — official Opus 4.8 pricing numbers + the W#1-owned `AutoAnalyze.tsx` shared-list migration (the W#1 piece runs on `main` per Rule 3).

---

## Why this pointer was written this way (debug aid)

- **(a.134) = Remaining W#2 residue items is the PICK because the director EXPLICITLY named it as next-session work this session.** That is why no §4 Step 1c forced-picker fired — the director named the task verbatim, so per `feedback_no_fabricated_instructions` the task was carried forward as-stated rather than re-picked.
- **The branch CHANGES to `workflow-2-competition-scraping` this session** — the residue items are W#2's, and W#2 lives on `workflow-2-competition-scraping`. This is a deliberate change from this session's `main` (where the W#1 backfill ran). Use `./catch-up-workflow 2`; verify the branch immediately.
- **The FIRST action is to READ the W#2 primer §5 and let the director pick the specific item — not to start coding a guessed item.** The (a.134) pick is "remaining W#2 residue items" (a set), and the SPECIFIC item is the director's pick at session start, per `feedback_no_fabricated_instructions`.
- **The Schema-change-in-flight flag is NO at entry** — most residue items are small UI / mechanical / docs polish; confirm at session start once the item is picked.
- **W#2 is GRADUATED — picking off a residue item does NOT reopen it; W#2's deferred Data Contract is intentionally NOT authored now** (held until W#3 needs to read W#2 data, DOCUMENTATION_ARCHITECTURE §4 create-on-need).
- **Nothing is held back** — this was a docs-only session; the doc-batch commits this session. Expect `git log origin/workflow-2-competition-scraping..HEAD` = 0 at entry.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.134.alt1) Remaining W#2 residue items** (current PICK — pre-loaded above). Read the W#2 primer §5, present the list, let the director pick. On `workflow-2-competition-scraping` via `./catch-up-workflow 2`.
- **(a.134.alt2) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; quick palate-cleanser; one of the residue items).
- **(a.134.alt3) P-50 NEW Condition Pathology card** (small single-session UI addition; director already approved scope; one of the residue items; on `workflow-2-competition-scraping`).
- **(a.134.alt4) W#1 HIGH item H-1** (action history + per-action undo — the queued-next W#1 polish item; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`; on `main` via `./catch-up-workflow 1` or `./resume-workflow 1`). W#1 is graduated; this is a deliberate W#1 polish pick if the director wants to advance W#1 instead of W#2 residue.
- **(a.134.alt5) The two P-52 carry-overs** (official Opus 4.8 pricing numbers + the deferred W#1-owned `AutoAnalyze.tsx` shared-list migration — the W#1 piece runs on `main` per Rule 3).
- **(a.134.alt6) P-62 Workflow-11 surveillance card + page** (future-workflow seed; the spec exists; design WITH the director when W#11 kicks off — NOT a W#2 residue item).
