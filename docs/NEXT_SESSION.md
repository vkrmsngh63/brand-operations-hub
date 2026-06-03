# Next session

**Written:** 2026-06-03-b (`session_2026-06-03-b_w2-graduation-continuity-first` — W#2 (Competition Scraping & Deep Analysis) was FORMALLY GRADUATED — continuity-first, per HANDOFF_PROTOCOL Rule 33 — a DOCS-ONLY session (no code, no schema, no deploy, no in-session commits). Now that the W#2 polish queue is fully drained (P-54 / P-55 / P-56 / P-57 / P-58 / P-59 / P-60 / P-61 all closed), the director — via two AskUserQuestion picks — chose graduation depth = **continuity-first** (finalize the continuity primer + `./catch-up-workflow 2`, mark W#2 ✅ GRADUATED, DEFER the DOCUMENTATION_ARCHITECTURE §5 Step 1 Archive/Data-Contract split + the finalized-HRL Data Capture Interview until W#3 needs to read W#2 data per the §4 create-on-need rule) + residue = **one consolidated section** (folded into the primer §5 "post-graduation residue" table); verified all 14 primer pointers resolve. **Closes (a.132) = Begin W#2 graduation (Rule 33) → ✅ DONE (W#2 graduated continuity-first). Opens (a.133) RECOMMENDED-NEXT = Backfill W#1 (Keyword Clustering) under Rule 33** — write `docs/KEYWORD_CLUSTERING_PRIMER.md` (a map+pointers front door; copy `docs/templates/WORKFLOW_PRIMER_TEMPLATE.md`) + register `./catch-up-workflow 1` so graduated W#1 gets the same one-paste re-entry kit W#2 now has. **W#1's branch is `main` per the resume-workflow registry — so the NEXT SESSION RUNS ON `main`; start command `./resume` (or `./resume-workflow 1`).** This was the director's §4 Step 1c forced-picker choice, confirmed via a disambiguation follow-up. **FIRST action next session = read `docs/HANDOFF_PROTOCOL.md` Rule 33 + `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` §4 + the existing W#1 docs BEFORE writing the primer.**)

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session is `session_2026-06-03-b` — the SECOND session of 2026-06-03 (suffix `-b`); the FIRST was `session_2026-06-03` (no suffix) = P-61. The harness `currentDate` = 2026-06-03. **Next session: keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.** The fabricated/reverted `session_2026-05-31` is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — NOT a normal prior session.

> ⚠️ **BRANCH: next session runs on `main`.** The (a.133) pick is the W#1 (Keyword Clustering) Rule-33 backfill, and **W#1's branch is `main`** per the `resume-workflow` registry (W#1 is graduated; it lives on main, not on a feature branch). The `./resume` / `./resume-workflow 1` scripts switch to `main` automatically. This is a DELIBERATE branch CHANGE from this session (`workflow-2-competition-scraping`) to `main` — confirm `git branch --show-current` shows `main` immediately after entry.

> ⚠️ **BRANCH STATE — NOTHING HELD BACK.** This was a DOCS-ONLY session: no code, no deploy, no in-session commits. After this session's end-of-session doc-batch ff-merge to `main`, `main` and `workflow-2-competition-scraping` are both at `60f9455` (the prior P-61 deploy) + the 2026-06-03-b doc-batch SHA. Expect `git log origin/main..HEAD --oneline` to show 0 at next session entry (you'll be on `main`).

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** This (graduation) session was docs-only: NO → STAYED NO → NO at exit; zero `prisma db push`. **The W#1 backfill is a DOCS unit (write a primer + register a catch-up command) — NO schema change anticipated.** W#1 is a graduated tool; do NOT touch its schema or its `src/lib/keyword-clustering/*` code unless the director explicitly asks. If anything code-adjacent surfaces, run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (additive only; never `migrate reset` against prod).

> ⚠️ **NO OWED VERIFICATION.** Nothing was deployed this session (docs-only). There is NO owed verification carried into next session. The W#1 backfill is a NEW docs unit.

> ⚠️ **W#2 IS GRADUATED — DO NOT REOPEN IT.** W#2 (Competition Scraping) is ✅ GRADUATED 2026-06-03 (continuity-first). Its re-entry front door is `docs/COMPETITION_SCRAPING_PRIMER.md` + `./catch-up-workflow 2`. The low-priority residue (P-53 / P-43 / P-50 / P-26 / P-27 / the two P-52 carry-overs / the optional P-56 Option-2 idle-flicker follow-up) is in the primer §5 "post-graduation residue" table and is explicitly NON-BLOCKING. The deferred W#2 Archive/Data-Contract split is intentionally held until W#3 needs to read W#2 data — do NOT author it now.

---

## What we did this session (in plain terms)

This session "graduated" Workflow #2 (Competition Scraping) — meaning we declared it essentially complete and wrote the materials that let anyone pick it back up later with full context.

**Until now, W#2 was still in active "polish" mode — a long list of small improvements (P-54 through P-61).** With the last of those shipped and verified, the whole list is now done.

**So we did the formal "graduation."** We finalized a single front-door document (the continuity primer) that explains what W#2 does, how it's built, and what's left over as low-priority odds-and-ends — and we made sure a one-line command (`./catch-up-workflow 2`) hands a future session everything it needs to resume. We checked that all 14 of the primer's internal pointers actually lead somewhere valid.

**We made two judgment calls with you (the director):**
1. **How thorough to be right now: "continuity-first."** We finalized the re-entry primer and marked W#2 graduated, but we deliberately held off on writing a formal "data contract" (a precise spec of W#2's stored data for other workflows to read). The reasoning: nobody needs to read W#2's data yet, so writing that contract now would just go stale — we'll write it when a later workflow (W#3) actually needs it.
2. **How to handle the leftovers: "one consolidated section."** All the small low-priority leftovers are listed together in one clearly-marked, non-blocking spot in the primer, instead of scattered around.

**This was a documentation-only session — no app code changed, nothing was deployed.**

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (the W#2 graduation + the residue) + `docs/COMPETITION_SCRAPING_PRIMER.md` (the W#2 continuity primer §5 residue table) + `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` (the graduation methodology + the W#1-backfill open item in §4) + `docs/DATA_CATALOG.md` §6.1 (the deferred W#2 Data Contract).

- **(a.133) = Backfill W#1 (Keyword Clustering) under Rule 33** — **NEXT SESSION (see below).**
- **The deferred W#2 Archive/Data-Contract split + finalized-HRL Data Capture Interview** — intentionally held until W#3 starts and needs to read W#2 data (DOCUMENTATION_ARCHITECTURE §4 create-on-need). NOT a blocker.
- **(P-62, under Workflow 11)** "Post Launch Optimization & Surveillance" card rename + hub page + "Continued Competitive Surveillance" page (spec doc exists) — future-workflow.
- **(P-56 Option-2 follow-up)** the optional "kill the idle flash too" for the residual Amazon Highlight-Terms flicker; raise only if the director wants it.
- **(P-53)** Excel "Export Table" for the Category + Type pages — effectively ABSORBED by P-55; LOW residue only.
- **(P-43 mechanical prevention small fix)** — add an absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix.
- **(P-50 NEW Condition Pathology card)** — small single-session UI addition; director already approved scope.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.

## What we'll do next session (in plain terms)

1. **We give Workflow #1 (Keyword Clustering) the same "front-door" treatment W#2 just got.** W#1 was graduated a while ago but it never got the new one-page continuity primer or the one-line re-entry command. We write `docs/KEYWORD_CLUSTERING_PRIMER.md` (starting from the shared template) so it has a single map+pointers front door.
2. **We register the `./catch-up-workflow 1` command** so a future session can re-enter W#1 with one paste, exactly like W#2 now has.
3. **We do NOT touch W#1's app code or data** — this is purely catching its documentation up to the new standard. It's marked "low priority" but it's the natural next consistency step.

## What's still left in the total roadmap (in plain terms)

- **W#2 graduation — ✅ DONE 2026-06-03 (continuity-first).** Workflow #2 is officially essentially complete; re-entry via the primer + `./catch-up-workflow 2`.
- **W#1 (Keyword Clustering) Rule-33 backfill — NEXT, the (a.133) pick.** Give graduated W#1 the same primer + catch-up command. On `main`.
- **The deferred W#2 Data Contract** — held until W#3 needs to read W#2 data; NOT a blocker.
- **P-61 (extension default categories) — ✅ CLOSED 2026-06-03.** The LAST substantive W#2 polish item.
- **P-54 / P-55 / P-56 / P-57 / P-58 / P-59 / P-60 — ✅ ALL CLOSED.** The full W#2 polish queue is drained.
- **P-49 W#2 Reviews Phase 2 — ✅ CLOSED 2026-06-01.**
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED. TWO carry-overs OPEN: official Opus 4.8 pricing numbers + the deferred W#1 shared-list migration.
- **P-62 (NEW capture)** — the Workflow-11 surveillance card + page. Future-workflow.
- **P-50 NEW Condition Pathology card** — small single-session UI addition; director already approved scope.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`. Single-session fix.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started (P-62 seeds part of W#11). W#3 kickoff is also the trigger to author the deferred W#2 Data Contract.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**W#2 (Competition Scraping & Deep Analysis) was FORMALLY GRADUATED — continuity-first, per HANDOFF_PROTOCOL Rule 33 — 2026-06-03.** A DOCS-ONLY session: NO code, NO schema, NO deploy, NO in-session commits. With the W#2 polish queue fully drained (P-54 / P-55 / P-56 / P-57 / P-58 / P-59 / P-60 / P-61 all closed), the director — via two AskUserQuestion picks — chose: (1) **graduation depth = continuity-first** (finalize the continuity primer + `./catch-up-workflow 2`, mark W#2 ✅ GRADUATED, DEFER the DOCUMENTATION_ARCHITECTURE §5 Step 1 Archive/Data-Contract split + the finalized-HRL Data Capture Interview until W#3 needs to read W#2 data per the §4 create-on-need rule); (2) **residue = one consolidated section** (folded into the primer §5 "post-graduation residue" table). All 14 primer pointers were verified to resolve.

**Session shape (read Rule 33 + the graduation methodology → confirm `./catch-up-workflow 2` → two graduation-depth/residue pickers → finalize the primer + DESIGN §B + WORKFLOW_GRADUATION_CONTINUITY_DESIGN §2/§4 + DATA_CATALOG §6.1 + the ROADMAP Active Tools W#2 row → verify pointers → end-of-session doc-batch):**

- **Read-first:** `docs/HANDOFF_PROTOCOL.md` Rule 33 (workflow-graduation continuity) + the graduation methodology + `docs/COMPETITION_SCRAPING_PRIMER.md` + `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md`.
- **Two Rule 14f graduation pickers (WITH the director):** graduation depth = continuity-first (DEFER the Data-Contract split until downstream need); residue = one consolidated non-blocking primer §5 section.
- **The §4 Step 1c next-pick (a third picker):** Backfill W#1 (Keyword Clustering) under Rule 33 — confirmed via a disambiguation follow-up (the bare answer token "3" was ambiguous because option 1 was literally about 'W#3', so Claude confirmed "Backfill W#1 under Rule 33" BEFORE acting, per `feedback_no_fabricated_instructions`).
- **No code, no deploy, no commits in-session.**
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged]) + HANDOFF_PROTOCOL header bump + the Group B graduation updates (PRIMER + WORKFLOW_GRADUATION_CONTINUITY_DESIGN + DATA_CATALOG + COMPETITION_SCRAPING_DESIGN §B). **This doc-batch commit ff-merges to `main` per the standard 3-push pattern; ONE push only (no prior deploy push — docs-only).**

**Schema-change-in-flight flag NO at entry → STAYED NO entire session → NO at exit. NEXT session (W#1 backfill) = NO at entry anticipated** (a docs unit).

**ZERO open DEFERRED items at exit (Rule 26):** TaskList returned EMPTY at entry; 4 in-session tasks were created + all completed (verify `./catch-up-workflow 2`; primer §5; ROADMAP graduated stamp; design-doc §4 + DATA_CATALOG). The deferred W#2 Data Contract + P-62 + the small carry-overs are documented roadmap continuation, NOT TaskList DEFERRED items.

**Baselines UNCHANGED by definition (DOCS-ONLY — not re-run):** extension `npm test` = **915/915 UNCHANGED** + src/lib `node:test` = **1369/1369 UNCHANGED** + `npm run build` = **74 routes UNCHANGED**; Check 6 Playwright SKIPPED per Rule 27.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-03-b** (NO top-tier slip — a clean docs-only session) capturing: (a) W#2 graduated continuity-first; (b) NEW reusable PATTERN — "at workflow graduation, defer the Archive/Data-Contract split + the finalized-HRL Data Capture Interview until a downstream workflow discovers a need to read the data (DOCUMENTATION_ARCHITECTURE §4 create-on-need), rather than authoring a contract no consumer reads yet — the continuity PRIMER is the load-bearing re-entry artifact and is sufficient at graduation"; (c) a process-good note — the ambiguous bare-token "3" answer was disambiguated with a confirmation picker BEFORE acting (per `feedback_no_fabricated_instructions`). **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** **NO new memory file this session.**

**Group B docs updated** — `docs/COMPETITION_SCRAPING_PRIMER.md` (Status → ✅ GRADUATED 2026-06-03 continuity-first; §5 rewritten into "State at graduation + post-graduation residue" with a consolidated residue table + a "deferred graduation step (by design)" note) + `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` (Status notes W#2 graduated; §2 new 2026-06-03 chronological entry; §4 "formal W#2 graduation" → ✅ RESOLVED 2026-06-03 — continuity-first, split deferred to W#3) + `docs/DATA_CATALOG.md` (§6.1 W#2 Status — schema SHIPPED+LIVE+authoritative; the finalized-HRL Data Capture Interview + Data Contract DEFERRED to W#3-need) + `docs/COMPETITION_SCRAPING_DESIGN.md` (NEW §B 2026-06-03-b graduation note). `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` UNCHANGED (no deploy/verification this session). `docs/REVIEWS_PHASE_2_DESIGN.md` UNCHANGED. `docs/COMPETITION_DATA_V2_DESIGN.md` UNCHANGED. `docs/AI_MODEL_REGISTRY.md` UNCHANGED.

**ROADMAP Current Active Tools W#2 row flipped** to ✅ GRADUATED 2026-06-03 (continuity-first; the continuity primer + `./catch-up-workflow 2` as the re-entry front door; the Archive/Data-Contract split deferred to W#3-need) with prior active-dev history preserved + (a.132) CLOSED / (a.133) opens = Backfill W#1 (Keyword Clustering) under Rule 33.

**SEVENTY-SIXTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Destructive-ops handoff audit (per `feedback_destructive_ops_confirmation.md`)

- **THIS session:** ZERO destructive ops — DOCS-ONLY. NO `prisma db push`, NO `migrate reset`, NO drop, NO dev-data deletes, NO in-session commits. NO new memory file created; zero memory deletions. All memory files at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/` + the `.codespace-backup/memory/` mirror are intact (verified present this session).
- **NEXT session (W#1 backfill):** **NO schema change, NO destructive op anticipated** — writing `docs/KEYWORD_CLUSTERING_PRIMER.md` + registering `./catch-up-workflow 1` is a docs unit. W#1 is a graduated tool: do NOT touch its schema or its `src/lib/keyword-clustering/*` code unless the director explicitly asks (Rule 3 ownership — W#1 is W#1-owned). If a residual code cleanup surfaces, it is ADDITIVE only; run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (never `migrate reset` against prod). No other Rule 8/9/29 triggers anticipated.
- **Critical files affirmed intact:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / HANDOFF_PROTOCOL / CLAUDE_CODE_STARTER / NEXT_SESSION + the W#2 continuity primer + `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` + `docs/DATA_CATALOG.md` + the memory directory + the `docs/templates/WORKFLOW_PRIMER_TEMPLATE.md` (the template the next session copies).

---

## Branch

**`main`** — entered at start of next session. The (a.133) pick is the W#1 (Keyword Clustering) Rule-33 backfill, and **W#1's branch is `main`** per the `resume-workflow` registry (W#1 is graduated; it lives on main). The `./resume` / `./resume-workflow 1` scripts switch to `main` automatically. This is a DELIBERATE branch CHANGE from this session's `workflow-2-competition-scraping` to `main`. Verify with `git branch --show-current` immediately after entry; should be on `main`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to main): `main` and `workflow-2-competition-scraping` BOTH at `60f9455` (the prior P-61 deploy) + the 2026-06-03-b doc-batch SHA. **Verify with `git log origin/main..HEAD --oneline` showing 0** (you'll be on `main`; everything is on `main` after the doc-batch ff-merge); `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block; the W#1 backfill has no polish-item-spec — the canonical reads are Rule 33 + the graduation methodology + the W#1 docs + the primer template):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- **`docs/HANDOFF_PROTOCOL.md` Rule 33 (workflow-graduation continuity) — the FIRST read** + the graduation methodology + Rule 22 (graduated-tool Resume Prompt / Data Contract) + Rule 25 (multi-workflow) + Rule 26 + Rule 30 (Session bookends) + §4 Step 4b extended template.
- **`docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` §4** — the "OPEN (low priority) — W#1 backfill" item that this session's (a.133) pick fulfills + the §2 chronology (W#2 graduated 2026-06-03) + the continuity-design rationale (the same kit W#2 now has).
- **`docs/templates/WORKFLOW_PRIMER_TEMPLATE.md`** — the canonical primer template to COPY for `docs/KEYWORD_CLUSTERING_PRIMER.md`.
- **`docs/COMPETITION_SCRAPING_PRIMER.md`** — the W#2 primer is the WORKED EXAMPLE of a finished continuity primer (front door + map + pointers + §5 residue); mirror its shape for W#1.
- **The existing W#1 docs the primer must point at:** `docs/KEYWORD_CLUSTERING_ARCHIVE.md` + `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (W#1 already has Archive / Data-Contract / Polish-Backlog — the gap is ONLY the primer + the catch-up command).
- **`./catch-up-workflow` + `./resume-workflow`** — read how W#2 (`./catch-up-workflow 2`) is wired so W#1 (`./catch-up-workflow 1`) is registered identically; the registry already lists W#1 → `main`.
- `docs/ROADMAP.md` — the W#2 graduation record + the total-roadmap summary.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-03-b (this session — the graduation + the defer-the-Data-Contract PATTERN + the disambiguation process-good) + §Entry 2026-05-31 (the TOP-TIER SLIP — never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_no_fabricated_instructions.md`** — act only on verbatim directives; the W#1 backfill is the confirmed (a.133) pick.
  - **`feedback_remaining_roadmap_summary.md`** + **`feedback_handoff_carryovers_to_roadmap.md`** — the handoff must summarize the total remaining roadmap + capture every carry-over as a ROADMAP entry.
  - **`feedback_session_bookends_plain_summary.md`** — bookend with plain-terms summaries.
  - `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_plan_output_shape_before_building.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md` + `feedback_exports_include_all_table_data.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; for the W#1 Rule-33 backfill there is no polish-item-spec — instead the FIRST read is `docs/HANDOFF_PROTOCOL.md` Rule 33 (workflow-graduation continuity) + the graduation methodology + `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` §4 + the existing W#1 docs + `docs/templates/WORKFLOW_PRIMER_TEMPLATE.md`.** **This session runs on `main` — verify the branch first (this is a deliberate change from W#2's branch).** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal ((a.133) = Backfill W#1 (Keyword Clustering) under Rule 33):** graduated W#1 never got the new one-page continuity primer or the one-line re-entry command that W#2 just received. Write `docs/KEYWORD_CLUSTERING_PRIMER.md` (a map+pointers front door — copy `docs/templates/WORKFLOW_PRIMER_TEMPLATE.md` and fill it from the existing W#1 Archive / Data-Contract / Polish-Backlog docs) + register `./catch-up-workflow 1` so a future session can re-enter W#1 with one paste exactly like W#2 now has. This was your §4 Step 1c forced-picker choice (confirmed via a disambiguation follow-up). **W#2 is GRADUATED — do NOT reopen it. Do NOT touch W#1's app code or schema — this is a DOCS unit (Rule 3: W#1-owned).**

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: main   (deliberate change from this session's workflow-2-competition-scraping)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: 0 — main and workflow-2 are both at 60f9455 + the 2026-06-03-b doc-batch SHA; nothing is held back
```

If `git branch --show-current` shows `workflow-2-competition-scraping` (or anything other than `main`), run `./resume-workflow 1` (or `./resume`).

**FIRST step (read Rule 33 + the graduation methodology + the W#1 inputs — BEFORE any writing):** read `docs/HANDOFF_PROTOCOL.md` Rule 33 + the graduation methodology fully; then `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` §4 (the W#1-backfill open item this pick fulfills) + §2; then the existing W#1 docs (`docs/KEYWORD_CLUSTERING_ARCHIVE.md` + `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` + `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md`); then `docs/templates/WORKFLOW_PRIMER_TEMPLATE.md` (the shape to copy) and `docs/COMPETITION_SCRAPING_PRIMER.md` (the worked example). Confirm what `./catch-up-workflow 2` does (and how `./resume-workflow` already lists W#1 → `main`) BEFORE wiring `./catch-up-workflow 1`.

**Schema-change-in-flight flag:** **NO at entry.** The W#1 backfill is a docs unit — NO schema change anticipated. Do NOT touch W#1's schema or `src/lib/keyword-clustering/*` code (Rule 3: W#1-owned, graduated). If anything code-adjacent is genuinely required and touches the schema, it is ADDITIVE only; run the Rule 23 Change Impact Audit + get explicit director authorization via the Rule 9 deploy gate BEFORE any `prisma db push` (never `migrate reset` against prod).

**Output-shape (plan WITH the director per `feedback_plan_output_shape_before_building` + `feedback_session_bookends_plain_summary`):** the W#1 primer should MIRROR the W#2 primer's shape (front door + status line + map + pointers + a §5 residue section drawn from `KEYWORD_CLUSTERING_POLISH_BACKLOG.md`). If there's a real shape fork (e.g. how much W#1 history to fold in vs. point at, whether W#1 even has residue worth a §5), plan the shape WITH me; otherwise describe the recommended shape plainly and proceed per `feedback_default_to_recommendation` (the template + the W#2 worked example largely settle the shape).

**Forced-picker shape (before writing):** fire a Rule 14f AskUserQuestion only if there is a real fork (e.g. how the W#1 residue is presented, or whether to also refresh `KEYWORD_CLUSTERING_NEXT_SESSION.md`). If the recommended shape is obvious + default-approved (copy the template, mirror the W#2 primer), describe it plainly and proceed.

**Test coverage decision:** the W#1 backfill is docs/methodology — NO new tests expected. If any residual code cleanup adds a pure helper (unlikely — W#1 is W#1-owned and graduated), add node:test coverage. Check 6 Playwright per Rule 27 (SKIPPED — no UI surface).

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect UNCHANGED)
- Extension tsc clean (expect UNCHANGED — no extension code touched)
- Extension `npm test` = 915 (entry 915; expect UNCHANGED — docs unit)
- src/lib `node:test` = 1369 (entry 1369; expect UNCHANGED — docs unit)
- `npm run build` = 74 routes (expect UNCHANGED — no new endpoint for a docs unit)
- Check 6 Playwright SKIPPED per Rule 27
- **Run `npm run build` with an explicit absolute `cd /workspaces/brand-operations-hub` prefix** — the P-43 cwd-leak recurred recently; treat a route count of 0 as the cwd-leak tell-tale. (For a pure docs session you may legitimately skip re-running the scoreboard — baselines are UNCHANGED by definition — but state that you're skipping it.)

**Deploy mechanics:** the W#1 backfill is a docs/methodology unit — NO deploy expected. If any residual code cleanup ships, it follows the standard Rule 9 gate + 3-push pattern. Otherwise the only push is the end-of-session doc-batch ff-merge to `main` + ping-pong (W#1 IS `main`, so the ping-pong target may collapse — verify the `./resume-workflow 1` registry).

**Group A docs to update at session end:** ROADMAP header bump + (a.133) status + CHAT_REGISTRY header bump (199th session) + DOCUMENT_MANIFEST header + flags + the NEW `docs/KEYWORD_CLUSTERING_PRIMER.md` registered + CORRECTIONS_LOG header (+ 1 NEW §Entry only if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** the NEW `docs/KEYWORD_CLUSTERING_PRIMER.md` (the deliverable) + `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` §4 (flip the W#1-backfill open item to ✅ RESOLVED) + `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` if the re-entry kit warrants it (sparse per Rule 22) + the `./catch-up-workflow` script (register W#1).

**Standing carry-overs into this session:**

- **(a.133) = Backfill W#1 (Keyword Clustering) under Rule 33** — read Rule 33 + WORKFLOW_GRADUATION_CONTINUITY_DESIGN §4 + the W#1 docs FIRST; copy the primer template; register `./catch-up-workflow 1`; on `main`.
- **The deferred W#2 Archive/Data-Contract split** — held until W#3 needs to read W#2 data; do NOT author now.
- **P-62** — the Workflow-11 surveillance card+page (future-workflow).
- **P-56 Option-2 follow-up** — the optional "kill the idle flash too"; raise only if you want it.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; single-session fix / palate-cleanser.
- **P-50 NEW Condition Pathology card** — small single-session UI addition; director already approved scope.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs (note the W#1 piece is W#1-owned per Rule 3).

---

## Why this pointer was written this way (debug aid)

- **(a.133) = Backfill W#1 under Rule 33 is the PICK because it was the director's §4 Step 1c forced-picker choice this session, confirmed via a disambiguation follow-up.** The bare answer token "3" was ambiguous (option 1 was literally about 'W#3'), so rather than guess, Claude fired a confirmation picker and the director confirmed "Backfill W#1 under Rule 33." With W#2 graduated, giving the OTHER graduated tool (W#1) the same continuity kit is the natural consistency step.
- **The branch CHANGES to `main` this session** — W#1 is a graduated tool that lives on `main` (per the `resume-workflow` registry), not on a feature branch. This is the first session in a while to run on `main`; verify the branch immediately and use `./resume` / `./resume-workflow 1`.
- **The FIRST action is to READ Rule 33 + WORKFLOW_GRADUATION_CONTINUITY_DESIGN §4 + the W#1 docs, not to write the primer blind.** The W#1 backfill is explicitly tracked as the "OPEN (low priority) — W#1 backfill" item in §4; the primer must be filled from the existing W#1 Archive / Data-Contract / Polish-Backlog docs and mirror the W#2 primer's shape.
- **The Schema-change-in-flight flag is NO at entry and expected to stay NO** — the backfill is a docs unit; W#1's code + schema are W#1-owned and must not be touched.
- **W#2's deferred Data Contract is intentionally NOT authored now** — it's held until W#3 needs to read W#2 data (DOCUMENTATION_ARCHITECTURE §4 create-on-need). Do NOT confuse the W#1 backfill (write W#1's primer) with the deferred W#2 contract.
- **Nothing is held back** — this was a docs-only session; the doc-batch ff-merges this session. Expect `git log origin/main..HEAD` = 0 at entry.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.133.alt1) Backfill W#1 (Keyword Clustering) under Rule 33** (current PICK — pre-loaded above). Write `docs/KEYWORD_CLUSTERING_PRIMER.md` + register `./catch-up-workflow 1`; on `main`; read Rule 33 + WORKFLOW_GRADUATION_CONTINUITY_DESIGN §4 + the W#1 docs first.
- **(a.133.alt2) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; quick palate-cleanser).
- **(a.133.alt3) P-50 NEW Condition Pathology card** (small single-session UI addition; director already approved scope; on `workflow-2-competition-scraping`).
- **(a.133.alt4) P-56 Option-2 follow-up** (the optional "kill the idle flash too" / redraw only changed text for the residual Amazon Highlight-Terms flicker; on `workflow-2-competition-scraping`).
- **(a.133.alt5) The two P-52 carry-overs** (official Opus 4.8 pricing numbers + the deferred W#1 `AutoAnalyze.tsx` shared-list migration — the W#1 piece is W#1-owned per Rule 3, on `main`).
- **(a.133.alt6) P-62 Workflow-11 surveillance card + page** (future-workflow seed; the spec exists; design WITH the director when W#11 kicks off).
