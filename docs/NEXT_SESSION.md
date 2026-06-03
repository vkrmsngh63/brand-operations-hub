# Next session

**Written:** 2026-06-03-d (`session_2026-06-03-d_w2-p43-subshell-cwd-leak-mechanical-prevention` — W#2 residue P-43 — the recurring CWD-leak class is now STRUCTURALLY KILLED via mechanical prevention — a TOOLING-TEMPLATE-ONLY session (zero live-site impact; no schema, no deploy gate). The original P-43 file-fix (absolute `cd` prefixes in the command templates) was ALREADY ✅ DONE-AND-VERIFIED 2026-05-22-g via commit `4afea35` — all three `.claude/commands/` templates were already 100% absolute — yet the leak kept recurring (~32-35× logged) because in this persistent-shell harness an absolute `cd /abs && cmd` LEAVES the session sitting in `/abs` for the next command to inherit. This session wrapped every cd-bearing command in all three templates (`scoreboard.md` + `deploy.md` + `ship-polish-item.md`) in a disposable sub-shell `( cd /abs && ... )` so the directory change is discarded on exit and the persistent cwd never leaks; added a CWD-discipline note at the top of `scoreboard.md`; and refreshed the stale 2026-05-22-g baselines (57 / 590 / 558 / 94) to current VERIFIED values (74 / 1369 / 915 / 94-skipped). Build commit `ac9c8bf` (3 files +39/-33; parent `8dfcdc8`). **Closes (a.134)'s P-43 slice = the recurrence class is structurally killed (~32-35× → 0 by construction). Opens (a.135) RECOMMENDED-NEXT = P-50 (NEW "Condition Pathology" card — small single-session user-facing UI addition; director already approved scope)** — the director's §4 Step 1c forced-picker choice. **The next session RUNS ON `workflow-2-competition-scraping`; the start command is `./catch-up-workflow 2`** (the dedicated graduated-W#2 re-entry — this is what the director will paste). **FIRST action next session = read any existing `docs/polish-item-specs/P-50-*.md` (CREATE per Rule 31 if missing — it does NOT exist yet), do a Rule 3 code-truth audit of the competitor detail surface where the card lands, then DESIGN the card shape WITH the director per `feedback_plan_output_shape_before_building` BEFORE writing any code.** TWO Rule 14f pickers fired this session (the P-43 fix-shape picker → Recommended "sub-shell wrap + refresh baselines"; the §4 Step 1c next-pick → P-50). NO Rule 9 deploy gate (`.claude/` template-only, ZERO live-site impact — the director authorized "commit this and close the session").)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session is `session_2026-06-03-d` — the FOURTH session of 2026-06-03 (suffix `-d`); the FIRST was `session_2026-06-03` (no suffix) = P-61, the SECOND was `session_2026-06-03-b` = W#2 graduation, the THIRD was `session_2026-06-03-c` = W#1 Rule-33 backfill. The harness `currentDate` = 2026-06-03. **Next session: keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.** The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session.

> ⚠️ **BRANCH: next session runs on `workflow-2-competition-scraping`.** The (a.135) pick is P-50, a W#2 residue item, and W#2's branch is `workflow-2-competition-scraping`. **Start command: `./catch-up-workflow 2`** (the dedicated Rule 33 graduated-W#2 re-entry — switches to `workflow-2-competition-scraping` + prints `docs/COMPETITION_SCRAPING_PRIMER.md`). This session ALSO ran on `workflow-2-competition-scraping`, so this is NOT a branch change — confirm `git branch --show-current` shows `workflow-2-competition-scraping` immediately after entry.

> ⚠️ **BRANCH STATE — NOTHING HELD BACK.** This session committed ONE build commit `ac9c8bf` (the three subshelled `.claude/commands/` templates) on `workflow-2-competition-scraping`. Before this session's end-of-session doc-batch, `main` was at `8dfcdc8` and `workflow-2-competition-scraping` was at `ac9c8bf` (1 ahead). After this session's end-of-session doc-batch commit + ff-merge to `main` + ping-pong onto `workflow-2-competition-scraping`, both branches carry the build commit `ac9c8bf` PLUS the 2026-06-03-d doc-batch SHA. Expect `git log origin/workflow-2-competition-scraping..HEAD --oneline` to show 0 at next session entry.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** This (P-43) session touched only `.claude/` command templates: NO → STAYED NO → NO at exit; zero `prisma db push`. **P-50 (Condition Pathology card) is a small user-facing UI addition — confirm at the next session's start whether it needs any schema (likely NOT — a card surfacing existing/derived data is usually a render-only change).** If P-50 DOES touch the schema it is ADDITIVE only; run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (never `migrate reset` against prod).

> ⚠️ **NO OWED VERIFICATION.** Nothing was deployed this session (`.claude/` tooling-template only — the P-43 fix was verified in-session by running the scoreboard checks from `/tmp` and confirming `pwd` stayed put). There is NO owed vklf.com verification carried into next session.

> ⚠️ **W#2 IS GRADUATED — P-50 is a RESIDUE polish item, NOT a reopening.** W#2 (Competition Scraping) is ✅ GRADUATED 2026-06-03 (continuity-first). Its re-entry front door is `docs/COMPETITION_SCRAPING_PRIMER.md` + `./catch-up-workflow 2`. P-50 is one of the LOW-priority, explicitly NON-BLOCKING leftovers from the primer §5 "post-graduation residue" table — building it does NOT un-graduate W#2. The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview stay intentionally held until W#3 needs to read W#2 data — do NOT author them now.

> ⚠️ **W#1 IS ALSO GRADUATED — do NOT touch it next session.** W#1 (Keyword Clustering) is graduated and lives on `main`. Its continuity kit is complete (`docs/KEYWORD_CLUSTERING_PRIMER.md` + `./catch-up-workflow 1`). P-50 is W#2-owned and runs on `workflow-2-competition-scraping`.

---

## What we did this session (in plain terms)

This session fixed — for good — a recurring internal glitch in our own command tooling.

**The glitch:** the internal "scoreboard / deploy / ship" command files (the checklists Claude runs to count tests and routes and to deploy) kept quietly leaving the terminal pointed at the WRONG folder after a check ran. The next check then ran in the wrong place and reported a bogus number — usually a wrong test count or "0 routes". This had been logged roughly 32-35 times across many sessions.

**The surprise:** we thought we'd already fixed this back in May (we made every command use the full folder path instead of a shortcut). And we HAD — a check this session confirmed every command already used full paths. But the glitch kept coming back anyway. The reason: in our setup the terminal REMEMBERS which folder it's in from one command to the next, and a command like "go to folder X, then run the check" leaves the terminal sitting in folder X afterward — so the NEXT command inherits the wrong folder. Using full paths fixed the command that HAD the path, but did nothing to protect the command after it.

**The real fix:** we wrapped each "go to folder, run the check" step in a throwaway sub-shell — like running it in a disposable side-room. The folder change happens inside that side-room and is thrown away the instant the check finishes, so the main terminal never moves. We proved it works by deliberately starting from a wrong folder (`/tmp`) and confirming the terminal stayed put after every check. We also refreshed the old reference numbers in those command files to today's real values.

**This was a tooling-only session — no app code changed, nothing was deployed to the live site.**

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` + `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (the W#2 residue table) + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (the W#1 live backlog) + `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` + `docs/DATA_CATALOG.md` §6.1 (the deferred W#2 Data Contract).

- **(a.135) = P-50 (NEW "Condition Pathology" card)** — **NEXT SESSION (see below).** Small single-session user-facing UI addition; director already approved scope. On `workflow-2-competition-scraping`.
- **Remaining W#2 residue items beyond P-50** — P-53 (Export Table on the Category + Type pages — largely absorbed by P-55), P-26 / P-27 (capture bugs #9 / #15 + below-fold scroll capture), the two P-52 carry-overs (official Opus 4.8 pricing numbers + the W#1-owned `AutoAnalyze.tsx` shared-list migration), P-56 Option-2 (optional idle-flicker follow-up). All LOW/non-blocking; the director picks the order.
- **P-43 — ✅ RESOLVED 2026-06-03-d.** The recurring cwd-leak class is structurally killed (subshell mechanical prevention).
- **The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview** — intentionally held until W#3 starts and needs to read W#2 data (DOCUMENTATION_ARCHITECTURE §4 create-on-need). NOT a blocker.
- **W#1's live polish backlog** — HIGH H-1 (action history + per-action undo) is the queued-next W#1 item; plus M-1/M-2/M-3 medium, L-1..L-5 low, C-1..C-7 carry-overs, Z-1 explicitly-last, P-1 passive prereq. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`; W#1 re-entry via `./catch-up-workflow 1` (or the older `./resume-workflow 1`). On `main`.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card rename + hub page + "Continued Competitive Surveillance" page (spec doc exists) — future-workflow, NOT a W#2 residue item.

## What we'll do next session (in plain terms)

1. **We add a new "Condition Pathology" card to the Competition Scraping area** — a small, single-session piece of user-facing UI. You already approved doing this.
2. **We design the card's shape WITH you first, before any code.** Rather than guess, the session reads the card's spec (writing one first if it doesn't exist), looks at the real page where the card will live, and then presents the placement / contents / behavior to you to confirm in plain terms.
3. **Then it follows the normal build-and-deploy routine** — build, run the test scoreboard, deploy to vklf.com, and you verify on real Chrome.

## What's still left in the total roadmap (in plain terms)

- **P-43 (the internal cwd-leak fix) — ✅ DONE 2026-06-03-d.** Structurally killed via subshell mechanical prevention. Tooling-only; nothing to verify on the live site.
- **P-50 (Condition Pathology card) — NEXT, the (a.135) pick.** Small single-session UI addition; design WITH the director first. On `workflow-2-competition-scraping`.
- **Other W#2 residue items** — P-53, P-26 / P-27, the two P-52 carry-overs, P-56 Option-2. Low-priority; the director picks the order from the primer §5 list.
- **W#2 graduation — ✅ DONE 2026-06-03 (continuity-first).** Re-entry via the primer + `./catch-up-workflow 2`.
- **W#1 (Keyword Clustering) Rule-33 backfill — ✅ DONE 2026-06-03-c.** Graduated W#1 now has its continuity primer + `./catch-up-workflow 1`. On `main`.
- **The deferred W#2 Data Contract** — held until W#3 needs to read W#2 data; NOT a blocker.
- **W#1's live polish backlog** — HIGH H-1 (action history + undo) queued; plus medium/low/carry-over items. Canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`. On `main`.
- **P-61 (extension default categories) — ✅ CLOSED 2026-06-03.** The LAST substantive W#2 polish item.
- **P-54 / P-55 / P-56 / P-57 / P-58 / P-59 / P-60 — ✅ ALL CLOSED.** The full W#2 polish queue is drained.
- **P-49 W#2 Reviews Phase 2 — ✅ CLOSED 2026-06-01.**
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED. TWO carry-overs OPEN: official Opus 4.8 pricing numbers + the deferred W#1-owned `AutoAnalyze.tsx` shared-list migration.
- **P-62 (NEW capture)** — the Workflow-11 surveillance card + page. Future-workflow.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started (P-62 seeds part of W#11). W#3 kickoff is also the trigger to author the deferred W#2 Data Contract.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#2 residue P-43 — the recurring CWD-leak class is now STRUCTURALLY KILLED via mechanical prevention — 2026-06-03-d.** A TOOLING-TEMPLATE-ONLY session: ONE build commit (`ac9c8bf`), NO Rule 9 deploy gate (`.claude/` template-only with ZERO live-site impact — the director authorized "commit this and close the session"). The original P-43 file-fix (absolute `cd` prefixes in the command templates) was ALREADY ✅ DONE-AND-VERIFIED 2026-05-22-g via commit `4afea35` — a Rule 3 scan confirmed all three `.claude/commands/` templates were already 100% absolute — yet the leak kept recurring (~32-35× logged) because in this persistent-shell harness an absolute `cd /abs && cmd` LEAVES the session in `/abs` for the next command to inherit. This session: (1) wrapped every cd-bearing command in all three templates (`scoreboard.md` + `deploy.md` + `ship-polish-item.md`) in a disposable sub-shell `( cd /abs && ... )` so the directory change is discarded on exit; (2) added a CWD-discipline note at the top of `scoreboard.md`; (3) refreshed the stale 2026-05-22-g baselines (57 / 590 / 558 / 94) to current VERIFIED values (74 / 1369 / 915 / 94-skipped).

**Session shape (Rule 3 scan of the three templates → discover the original fix already shipped but the leak recurs → diagnose the persistent-shell cwd-leak root cause → fix-shape picker → subshell-wrap + refresh baselines → verify from `/tmp` → end-of-session doc-batch):**

- **Read-first:** `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (the W#2 residue table) + `docs/ROADMAP.md` P-43 entry + the prior CORRECTIONS_LOG §Entry 2026-05-22-g (the original P-43 close) + the three `.claude/commands/` templates.
- **TWO Rule 14f pickers** — (1) the P-43 fix-shape picker → the director chose the Recommended "sub-shell wrap + refresh baselines" over a belt-and-suspenders PostToolUse re-`cd` hook + a baselines-only refresh; (2) the §4 Step 1c next-pick → P-50.
- **NO Rule 9 deploy gate** — `.claude/` template-only, ZERO live-site impact; the director authorized "commit this and close the session."
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged]) + HANDOFF_PROTOCOL header bump + the Group B update (the COMPETITION_SCRAPING_PRIMER §5 P-43 flip). **This doc-batch ff-merges to `main` + ping-pongs onto `workflow-2-competition-scraping` per the standard 3-push pattern; ONE push only (no prior deploy push — no Rule 9 gate fired).**

**Schema-change-in-flight flag NO at entry → STAYED NO entire session → NO at exit. NEXT session (P-50) = NO at entry anticipated** (a card surfacing existing/derived data is usually render-only; confirm once the spec is read).

**ZERO open DEFERRED items at exit (Rule 26):** TaskList returned EMPTY at entry; 3 in-session tasks were created + all completed (subshell-wrap the three templates + add the CWD note; refresh the stale baselines; verify from `/tmp`). The other W#2 residue items + the deferred W#2 Data Contract + P-62 + the W#1 live backlog are documented roadmap continuation, NOT TaskList DEFERRED items.

**TOOLING-TEMPLATE-ONLY — counts UNCHANGED by definition (a template change cannot move test/route counts; verified THIS session from an arbitrary `/tmp` cwd, proving the subshell discipline survives cwd drift):** extension `npm test` = **915/915 UNCHANGED** (from `/tmp`; `pwd` stayed `/tmp`) + src/lib `node:test` = **1369/1369 UNCHANGED** (from `/tmp` via the `$(find ...)` subshelled form — historically reproduction #3's leak point; `pwd` stayed `/tmp`) + `npm run build` = **74 routes UNCHANGED**; root + extension tsc clean; Check 6 Playwright NOT re-run (SKIPPED per Rule 27 — left honestly marked in the refreshed baselines).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-03-d** (NO top-tier slip — a clean tooling-hardening session) capturing (a) the Rule 3 finding that P-43's ORIGINAL fix was already shipped — the genuine residue was the *recurrence despite the fix*; (b) the root cause — absolute `cd` alone is insufficient in a persistent-shell harness where the cwd persists between Bash calls; (c) the NEW REUSABLE PATTERN — "Absolute `cd` doesn't prevent a CWD leak in a persistent-shell harness — wrap the cd in a disposable subshell `( cd /abs && cmd )` so the change is discarded on exit; verify by running the command from an arbitrary cwd (e.g. `/tmp`) and confirming `pwd` is unchanged"; (d) the P-43 recurrence tally's STRUCTURAL close (~32-35× → 0 by construction). **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**Group B docs updated** — `docs/COMPETITION_SCRAPING_PRIMER.md` (§5 residue table — the P-43 row flipped to ✅ RESOLVED 2026-06-03-d via subshell mechanical prevention). `docs/COMPETITION_SCRAPING_DESIGN.md` UNCHANGED (NO §B entry — P-43 is a `.claude/` tooling-template fix, not a W#2 product-design choice; nothing to append to the W#2 design log). `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` UNCHANGED (NO new Deploy session #N — nothing shipped to vklf.com). `docs/REVIEWS_PHASE_2_DESIGN.md` / `docs/COMPETITION_DATA_V2_DESIGN.md` / `docs/AI_MODEL_REGISTRY.md` UNCHANGED.

**SEVENTY-EIGHTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO destructive ops — TOOLING-TEMPLATE-ONLY. NO `prisma db push`, NO `migrate reset`, NO drop, NO dev-data deletes. ONE in-session build commit `ac9c8bf` (the three subshelled `.claude/commands/` templates — additive, non-destructive). NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (P-50):** the P-50 Condition Pathology card follows the standard build-and-deploy routine. It is most likely a render-only UI addition with NO schema change. If P-50 DOES touch the schema, it is ADDITIVE only; run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (never `migrate reset` against prod). No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the W#2 continuity primer `docs/COMPETITION_SCRAPING_PRIMER.md` + the W#1 continuity primer `docs/KEYWORD_CLUSTERING_PRIMER.md` + the memory directory + the three subshelled `.claude/commands/` templates + the `./catch-up-workflow` + `./resume-workflow` scripts.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. The (a.135) pick is P-50, a W#2 residue item, and W#2's branch is `workflow-2-competition-scraping`. **Start command: `./catch-up-workflow 2`** (the dedicated Rule 33 graduated-W#2 re-entry — switches to `workflow-2-competition-scraping` + prints `docs/COMPETITION_SCRAPING_PRIMER.md`). This session ALSO ran on `workflow-2-competition-scraping`, so this is NOT a branch change. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to `main` + ping-pongs onto `workflow-2-competition-scraping`): both branches carry the build commit `ac9c8bf` PLUS the 2026-06-03-d doc-batch SHA on top of `8dfcdc8`. **Verify with `git log origin/workflow-2-competition-scraping..HEAD --oneline` showing 0**; `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block; P-50 needs a polish-item-spec — read it for P-50, CREATE it per Rule 31 if missing, which it is):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- **`docs/COMPETITION_SCRAPING_PRIMER.md` — the FIRST read** (the W#2 continuity front door; §5 is the "post-graduation residue" table — P-50 is one of the listed items; P-43 is now marked ✅ RESOLVED there).
- **`docs/polish-item-specs/P-50-*.md` — read it if it exists; CREATE per Rule 31 if missing (it does NOT exist yet).** Do a Rule 3 code-truth audit of the competitor detail page surface where the card lands BEFORE designing.
- **`docs/HANDOFF_PROTOCOL.md`** Rule 3 (workflow ownership) + Rule 9 (deploy gate) + Rule 14f (forced-picker) + Rule 23 (Change Impact Audit) + Rule 25 (multi-workflow) + Rule 26 + Rule 27 (verification) + Rule 30 (Session bookends) + Rule 31 (read-guarantee + audit-shipped-state) + §4 Step 4b extended template.
- `docs/COMPETITION_SCRAPING_DESIGN.md` + `docs/COMPETITION_SCRAPING_STACK_DECISIONS.md` — the W#2 design + architecture context (§B is append-only per Rule 18 — a P-50 design choice gets a NEW §B entry).
- `docs/ROADMAP.md` — the W#2 graduation record + the residue items (P-43 now ✅ RESOLVED) + the total-roadmap summary.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-03-d (this session — the subshell-CWD-discipline PATTERN) + §Entry 2026-06-03-c (the "graduated ≠ finished" primer-§5 PATTERN) + §Entry 2026-06-03-b (W#2 graduation) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_plan_output_shape_before_building.md`** — P-50 is a UI surface; plan the card's placement / contents / depth / tone WITH the director BEFORE coding.
  - **`feedback_no_fabricated_instructions.md`** — P-50 is the confirmed (a.135) pick; the SPECIFIC card shape is the director's design call at session start.
  - **`feedback_recommendation_style.md`** + **`feedback_default_to_recommendation.md`** — recommend the most thorough/reliable shape; skip the forced-picker only when re-confirming a default-approved recommendation.
  - **`feedback_remaining_roadmap_summary.md`** + **`feedback_handoff_carryovers_to_roadmap.md`** — the handoff must summarize the total remaining roadmap + capture every carry-over as a ROADMAP entry.
  - **`feedback_session_bookends_plain_summary.md`** — bookend with plain-terms summaries.
  - `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md` + `feedback_exports_include_all_table_data.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; the FIRST read is `docs/COMPETITION_SCRAPING_PRIMER.md` (the W#2 continuity front door — its §5 lists the residue items; P-50 is the pick), then read `docs/polish-item-specs/P-50-*.md` (CREATE it per Rule 31 if missing — it does NOT exist yet).** **This session runs on `workflow-2-competition-scraping` — verify the branch first (it is the SAME branch as last session; not a change).** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.135) = P-50 NEW "Condition Pathology" card):** add a small, single-session, user-facing "Condition Pathology" card to the Competition Scraping area. You have already approved the scope; the SHAPE (placement, contents, depth, behavior) is still to be designed WITH you. **FIRST action: read/CREATE the P-50 spec, do a Rule 3 code-truth audit of the page surface where the card lands, then present me the card's proposed placement + contents + behavior in plain terms and let me confirm or adjust BEFORE you write any code** (per `feedback_plan_output_shape_before_building`). **W#2 is GRADUATED — building P-50 does NOT reopen it. Do NOT author the deferred W#2 Data Contract (held until W#3 needs it). NOTE: P-62 is a FUTURE-WORKFLOW (W#11) item, NOT part of this pick.**

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping   (SAME branch as last session — not a change)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/workflow-2-competition-scraping..HEAD --oneline
# Expected: 0 — main and workflow-2 both carry build commit ac9c8bf + the 2026-06-03-d doc-batch SHA on top of 8dfcdc8; nothing is held back
```

If `git branch --show-current` shows anything other than `workflow-2-competition-scraping`, run `./catch-up-workflow 2`.

**FIRST step (read the primer + read/CREATE the P-50 spec + audit the surface + design WITH me — BEFORE any coding):** read `docs/COMPETITION_SCRAPING_PRIMER.md` (especially §5); read `docs/polish-item-specs/P-50-*.md` (CREATE per Rule 31 if missing); do a Rule 3 code-truth audit of the competitor detail page surface where the Condition Pathology card will live; then present me the card's proposed placement + contents + behavior and let me confirm. AFTER I confirm: build, scoreboard, deploy, I verify on real Chrome.

**Schema-change-in-flight flag:** **NO at entry.** A card surfacing existing/derived data is usually render-only with NO schema change. If P-50 turns out to need schema, it is ADDITIVE only; run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (never `migrate reset` against prod).

**Output-shape (plan WITH the director per `feedback_plan_output_shape_before_building` + `feedback_session_bookends_plain_summary`):** P-50 is a user-facing UI surface — plan the placement / contents / depth / tone WITH me before coding. If the recommended shape is obvious + default-approved, describe it plainly and proceed per `feedback_default_to_recommendation`; otherwise fire a Rule 14f picker for any real design fork.

**Forced-picker shape (before coding):** fire a Rule 14f AskUserQuestion for any real design fork (placement, contents, behavior). The deploy gate is itself a Rule 14f picker. The §4 Step 1c next-pick at end-of-session is a Rule 14f picker.

**Test coverage decision:** if P-50 adds a pure helper (e.g. a "compute the pathology summary" function), add node:test coverage (run as part of the scoreboard). If it adds a regression-prone UI mechanic, add a Playwright spec per Rule 27 (or `test.skip()` pending the rig). A pure render-only card may need no new test beyond tsc + the visual verification.

**Scoreboard targets** (entry baselines = this session's exit baselines, now refreshed in the subshelled templates):

- Root tsc clean (expect UNCHANGED unless P-50 touches `src/`)
- Extension tsc clean (expect UNCHANGED — P-50 is PLOS-side; no extension source expected)
- Extension `npm test` = 915 (entry 915)
- src/lib `node:test` = 1369 (entry 1369; +N if P-50 adds a pure helper)
- `npm run build` = 74 routes (entry 74; +1 only if P-50 adds a new endpoint — a render-only card usually does not)
- Check 6 Playwright per Rule 27 (SKIPPED unless P-50 adds a regression-prone UI mechanic)
- **The `/scoreboard` command is now subshell-hardened (P-43 ✅ RESOLVED 2026-06-03-d)** — the cwd-leak class that produced bogus "0 routes" / wrong-test-count results is structurally killed; you should no longer see the leak, but if a count looks wrong, confirm `pwd` and re-run the affected check.

**Deploy mechanics:** P-50 follows the standard Rule 9 deploy gate + 3-push pattern (build commit on `workflow-2-competition-scraping` → ff-merge to `main` → ping-pong sync back → end-of-session doc-batch).

**Group A docs to update at session end:** ROADMAP header bump + the (a.135) close / (a.136) open + the P-50 polish-backlog flip (it ships) + CHAT_REGISTRY header bump (201st session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ 1 NEW §Entry only if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** `docs/COMPETITION_SCRAPING_PRIMER.md` §5 (flip the P-50 residue item) + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (new "Deploy session #44" section if deployed) + `docs/COMPETITION_SCRAPING_DESIGN.md` §B (append-only design note for the card design choice) + the P-50 polish-item-spec (Status flip).

**Standing carry-overs into this session:**

- **(a.135) = P-50 (NEW Condition Pathology card)** — read/CREATE the spec, audit the surface, design WITH the director FIRST. On `workflow-2-competition-scraping`.
- **P-43 — ✅ RESOLVED 2026-06-03-d** — the cwd-leak class is structurally killed; the `/scoreboard` command is subshell-hardened.
- **Other W#2 residue items** — P-53, P-26 / P-27, the two P-52 carry-overs, P-56 Option-2 (the director picks the order after P-50).
- **The deferred W#2 Archive/Data-Contract split** — held until W#3 needs to read W#2 data; do NOT author now.
- **W#1's live polish backlog** (HIGH H-1 action-history+undo queued; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`) — W#1 is graduated + lives on `main`; do NOT touch unless the director picks a W#1 item explicitly.
- **P-62** — the Workflow-11 surveillance card+page (future-workflow; NOT a W#2 residue item).

---

## Why this pointer was written this way (debug aid)

- **(a.135) = P-50 is the PICK because the director chose it at this session's §4 Step 1c forced-picker.** P-50 is one of the W#2 residue items from the primer §5 table; the director picked it specifically (over the other residue items) to be the next session's work.
- **The branch STAYS `workflow-2-competition-scraping`** — P-50 is a W#2 residue item, and W#2 lives on `workflow-2-competition-scraping`. This is the SAME branch this session ran on (not a change). Use `./catch-up-workflow 2`; verify the branch immediately.
- **The FIRST action is to READ/CREATE the P-50 spec + audit the surface + design WITH the director — not to start coding.** P-50 is a user-facing UI surface, so per `feedback_plan_output_shape_before_building` the shape is planned with the director before any code.
- **The Schema-change-in-flight flag is NO at entry** — a card surfacing existing/derived data is usually render-only; confirm once the spec is read.
- **P-43 is now ✅ RESOLVED** — the cwd-leak class is structurally killed via subshell mechanical prevention, so the `/scoreboard` + `/deploy` + `/ship-polish-item` commands are hardened against the recurring bogus-count glitch.
- **Nothing is held back** — this session committed build `ac9c8bf`; the doc-batch ff-merges + ping-pongs both branches to the same SHA. Expect `git log origin/workflow-2-competition-scraping..HEAD` = 0 at entry.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.135.alt1) P-50 NEW Condition Pathology card** (current PICK — pre-loaded above). Read/CREATE the spec, audit the surface, design WITH the director. On `workflow-2-competition-scraping` via `./catch-up-workflow 2`.
- **(a.135.alt2) P-53 Excel "Export Table" for the Category + Type pages** (largely ABSORBED by P-55's grouped spreadsheets; LOW residue — a quick palate-cleanser if the director wants it).
- **(a.135.alt3) P-26 / P-27 capture bugs** (below-fold scroll capture + capture bugs #9 / #15 — LOW; extension-side).
- **(a.135.alt4) The two P-52 carry-overs** (official Opus 4.8 pricing numbers + the deferred W#1-owned `AutoAnalyze.tsx` shared-list migration — the W#1 piece runs on `main` per Rule 3).
- **(a.135.alt5) W#1 HIGH item H-1** (action history + per-action undo — the queued-next W#1 polish item; canonical in `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`; on `main` via `./catch-up-workflow 1` or `./resume-workflow 1`). A deliberate W#1 pick if the director wants to advance W#1 instead of W#2 residue.
- **(a.135.alt6) P-62 Workflow-11 surveillance card + page** (future-workflow seed; the spec exists; design WITH the director when W#11 kicks off — NOT a W#2 residue item).
