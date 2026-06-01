# Next session

**Written:** 2026-06-01 (`session_2026-06-01_p49-w5-type-page-sessions-4-5` — W#2 polish P-49 W5 Type page Sessions 4-5 — the entire "Reviews Analysis By Competitor Type Table" page (`/competition-scraping/reviews-analysis-by-type`) built in ONE all-in-one session + ✅ DEPLOYED-AND-VERIFIED 2026-06-01 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` (director Phase 4 PASS — both per-Type AI flows verified, incl. the non-bulleted button; `main` went `cb00f53 → f23df1b` clean ff). **P-49 W5 is now CLOSED** — the Type page was its last remaining piece (the Category page closed 2026-05-30-d). NEW reusable PATTERN: **"Mirror a sibling page by REUSING grouping-agnostic helpers + GENERALIZING a shared handler branch (parameterize by grouping level + prompts) instead of duplicating the branch."** **Closes (a.118) RECOMMENDED-NEXT.** **Opens (a.119) RECOMMENDED-NEXT = Comprehensive Analysis page (`/competition-scraping/comprehensive-analysis`) AI-summarizing functionality** on `workflow-2-competition-scraping` — a DIRECTOR-DIRECTED, ASK-DIRECTOR-FIRST requirements-gathering opener.)

> 🔴 **FIRST ACTION OF NEXT SESSION (DIRECTOR DIRECTIVE — do this BEFORE any coding, any heavy reads beyond the starter, and any forced-picker):** ASK THE DIRECTOR for instructions/requirements on what to develop for the `/competition-scraping/comprehensive-analysis` page. The director wants this page to now include AI-summarizing functionalities **just like** the `/reviews-analysis-by-type`, `/reviews-analysis-by-category`, and `/competitor-reviews-analysis` pages already have. This is a **DESIGN / REQUIREMENTS-GATHERING session opener — Q&A FIRST, NOT coding-first** — per `feedback_plan_output_shape_before_building.md`. Do NOT scaffold, design unilaterally, or fire a build picker until the director has supplied the requirements and you have planned the output shape (audience / sections / depth / tone / placement) WITH the director.

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session crossed a calendar boundary — it STARTED 2026-05-31 and the harness rolled to 2026-06-01 during the build; it is stamped `2026-06-01`. A SEPARATE fabricated/reverted `session_2026-05-31` (the Keyword-Clustering-visuals confabulation) is recorded ONLY as the CORRECTIONS_LOG §Entry 2026-05-31 TOP-TIER SLIP — it is NOT a normal prior session; the prior REAL committed session is `2026-05-30-d` (`cb00f53`). Keep trusting the harness `currentDate`; do NOT regress or invent a suffix ahead of it.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** (a.119) / the `/comprehensive-analysis` AI-summary work is W#2-only Reviews Phase 2 work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **BRANCH STATE — NORMAL.** Nothing held back this session: the Type page build (`f23df1b`) AND this session's end-of-session doc-batch all land on main (the parent ff-merges the doc-batch per the standard 3-push pattern). `main` and `workflow-2-competition-scraping` are BOTH at `f23df1b` plus the end-of-session doc-batch SHA. Expect `git log origin/main..HEAD --oneline` to show only the doc-batch commit (or 0 after the parent's ff-merge) at next session entry.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** This session FLIPPED YES→NO at the deploy push (the additive nullable `UserTablePreferences.typeTableLayout Json?` column shipped to prod). The `/comprehensive-analysis` AI-summary work's schema needs are UNKNOWN until the director supplies requirements — confirm any schema shape WITH the director during the requirements-gathering before any `prisma db push`.

---

## What we did this session (in plain terms)

We built your **entire new "Reviews Analysis By Competitor Type" page** in one go, and it is live and verified on vklf.com:

- It is the twin of the "By Category" page you finished last time, but it groups your competitors by **Type** instead of by Category, with an "(Untyped)" bucket for any competitor that has no type set. (The Type and Category columns are deliberately swapped: Type is the first column, Category is the third.)
- It was born with everything the Category page has: the editable table, drag-to-reorder (whole types and the competitors inside them), hide-a-row-with-a-restore-panel, a remembered per-page layout, the **two AI summaries per type** (a deduplicated bullet list + a plain-paragraph critique — both verified, including the non-bulleted button), and the **Source Reviews** column where each complaint lines up beside the exact reviews behind it.
- Behind the scenes we kept it **lean**: instead of copying ~450 lines from the Category page, we reused the shared helpers and generalized the shared AI handler so it serves both Category and Type — so the proven Category path is untouched.

With this shipped, the whole "Reviews Phase 2" rebuild (all three analysis pages) is **finished**.

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (P-49 entry now CLOSED + the NEW P-53 entry) + `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3 (pointer table — all three pages CLOSED) + `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-06-01.

- **(a.119) `/comprehensive-analysis` AI-summarizing functionality** — NEXT SESSION; ASK-DIRECTOR-FIRST (see top).
- **(P-53) Excel "Export Table" button for the Category + Type pages** — NEVER built on either grouped page (it was never built on the Category page; the Type mirror lacks it too); LOW priority; deferred.
- **(optional refinement) editable banner category/type name** — read-only label on both grouped pages today; director may request making it editable.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.

## What we'll do next session (in plain terms)

Next session is a **planning / requirements-gathering session for the "Comprehensive Analysis" page** — NOT a build-first session. In plain terms:

1. **We START by asking YOU what you want.** Right at the top, we ask you for your instructions/requirements for the `/comprehensive-analysis` page — specifically the AI-summarizing functionality you want it to have, working like the AI summaries on the three review-analysis pages you already have.
2. **We plug your answers into a plan and ask follow-ups.** We take what you give us, slot it into the output-shape plan (who the summary is for, what sections it has, how deep, what tone, where it lives), and then ask you specific questions about anything still unclear — all BEFORE writing any code.
3. **Only then do we design + build.** Once the requirements are settled with you, we plan the build and, when you approve, ship + verify it.

## What's still left in the total roadmap (in plain terms)

- **P-49 W#2 Reviews Phase 2 — ✅ CLOSED 2026-06-01.** All three analysis pages (Competitor Reviews Analysis Table, By Category, By Type) shipped + verified. Only the LOW-priority Excel export (P-53) + the optional editable-banner-name refinement remain as small follow-ups.
- **(a.119 / next) `/comprehensive-analysis` AI-summary** — requirements-gathering session opens next.
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED on `main`. TWO carry-overs OPEN: official Opus 4.8 pricing numbers + the deferred W#1 shared-list migration.
- **P-51 NEW per-Project competitive landscape AI summary on `/comprehensive-analysis`** — note: the director's (a.119) directive points at the SAME page; the requirements-gathering next session should reconcile (a.119) with the P-51 skeleton.
- **P-53 (NEW this session) Excel "Export Table" for the Category + Type pages** — LOW; never built on Category either.
- **P-50 NEW Condition Pathology card** — small single-session UI addition; director already approved scope.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation; deferred.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; running tally ~31-34+ (a cwd-leak near-miss this session — a parallel `npm run build` picked up the extension dir; caught when the route count read 0). Single-session fix.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority.
- **W#2 graduation** — now that P-49 W5 is closed, W#2 graduation can be scheduled (director's discretion — the `/comprehensive-analysis` work is the director's chosen next item first).
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**P-49 W5 Type page Sessions 4-5 — the entire "Reviews Analysis By Competitor Type Table" page built ALL-IN-ONE + ✅ DEPLOYED-AND-VERIFIED 2026-06-01** end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`; director Phase 4 PASS (both per-Type AI flows verified, incl. the non-bulleted button); `main` went `cb00f53 → f23df1b` (clean ff). **P-49 W5 is now CLOSED.**

**Session shape (all-in-one BUILD + DEPLOY — 1 build, 1 deploy, + end-of-session doc-batch):**

- **Build `f23df1b` — the entire Type page.** A LEAN mirror of the now-closed Category page: grouping key `competitionCategory` → `type`, an `(Untyped)` fallback bucket, the intentional Type↔Category column SWAP (Type = col 1, Category = col 3). Born with EVERYTHING — the 13-column grouped table + show/hide + click-to-edit + per-review stacked Stars/Reviews Summary + the interactive batch (type banner rows + two-level @dnd-kit drag + hide-with-restore) + the per-page layout memory (NEW additive nullable `UserTablePreferences.typeTableLayout Json?` column) + BOTH per-Type AI flows (`per-type-bulleted` + `per-type-nonbulleted`) + the Source Reviews column + all 4 of the 2026-05-30-d director adjustments. NEW page-specific pure helpers `type-table-columns.ts` / `type-table-grouping.ts` / `type-table-layout.ts` (each `.test.ts`). The per-Type AI flows + the Source Reviews column REUSE the grouping-agnostic helpers + GENERALIZE the `review-analysis-run-batch` per-category branch (parameterized by grouping `level` PER_TYPE + `PER_TYPE_BULLETED/NONBULLETED` prompts + a `typeKey` alias) — the per-category path stays byte-identical.
- **ONE Rule 9 deploy gate**, satisfied by a single fully-informed director picker ("Yes — commit, db push, deploy") naming the ff-merge / push / ping-pong / `prisma db push` consequences — no redundant re-fire. Director chose ALL-IN-ONE over the Session-4/Session-5 split.
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — carries the Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged content]) + HANDOFF_PROTOCOL header bump + 1 Group B doc (REVIEWS_PHASE_2_DESIGN.md §B 2026-06-01) + 2 MODIFIED polish-item-specs (P-49-W5-S5-type-page.md + P-49-W5-reviews-phase-2-master-spec.md). **This doc-batch commit ff-merges to main per the standard 3-push pattern (the Type page is already on main; nothing held back).**

**ONE Rule 9 deploy gate — director Yes; ZERO other Rule 14f forced-pickers** (the Type page mirrors a fully-proven Category page; built under the default-to-recommendation path).

**Schema-change-in-flight flag YES at entry → FLIPPED YES→NO at the deploy push (`f23df1b`)** — the additive nullable `UserTablePreferences.typeTableLayout Json?` column shipped to production via director-approved `npx prisma db push` (Rule 8; zero data loss). **NEXT session = NO at entry.**

**ZERO open DEFERRED items at exit (Rule 26)** — Tasks #1–#5 completed; Task #6 ("Excel Export Table for both Category + Type pages") was DEFERRED in-session and its destination entry (NEW ROADMAP polish-backlog entry P-53) was WRITTEN in this doc-batch, so it closes at exit.

**Baselines locked from this session:** root tsc clean + extension tsc clean + extension `npm test` = **910/910 UNCHANGED** + src/lib `node:test` = **1238/1238** (+56 from 1182 — three new lib-helper suites `type-table-columns`/`type-table-grouping`/`type-table-layout` ≈ +51 + 5 `typeTableLayout` preferences cases; the run-batch shipped-flow tests were UPDATED not added — all 7 flows now shipped) + `npm run build` = **70 routes** (+1 from 69 — the new `reviews-analysis-by-type` route); Check 6 Playwright SKIPPED per Rule 27 (PLOS-only change, zero extension change).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-06-01** (no top-tier slip — director PASSED the deploy) capturing: (1) the NEW reusable PATTERN — "mirror a sibling page by REUSING grouping-agnostic helpers + GENERALIZING a shared handler branch instead of duplicating it"; (2) THREE Rule 3 findings (the nav slot was already `disabled:true`, `typeTableLayout` existed only as a schema comment, the Excel Export was never built on Category → P-53); (3) the date-boundary crossing; (4) a cwd-leak near-miss in the scoreboard (P-43 Pattern Class running tally +1). **The earlier 2026-05-31 TOP-TIER SLIP §Entry is PRESERVED verbatim and is a SEPARATE, distinct session.** NO new memory file.

**NEW §B 2026-06-01 entry appended to `docs/REVIEWS_PHASE_2_DESIGN.md`** (TWENTY-FIFTH build/deploy-session §B entry per Rule 18; SEVENTEENTH W5 entry — the as-built Type page).

**ROADMAP P-49 entry status updated to "✅ CLOSED 2026-06-01"** + a NEW P-53 polish-backlog entry (the deferred Excel export) + (a.118) closes / (a.119) opens.

**SIXTY-SECOND end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. (a.119) / the `/comprehensive-analysis` AI-summary work is W#2-only Reviews Phase 2 work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to main): `main` and `workflow-2-competition-scraping` BOTH at `f23df1b` + the end-of-session doc-batch SHA. **Normal state — nothing held back.** Verify with `git log origin/main..HEAD --oneline` showing 0 (or only brand-new work); `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files; since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52 + P-53, read §2 + §3 of each at session start):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate) + Rule 14f (forced-picker mechanics) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit — only if a schema shape emerges from the director's requirements) + Rule 24 (pre-capture search) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md`** (the existing P-51 skeleton for the `/comprehensive-analysis` page — reconcile the director's (a.119) directive with this skeleton; the requirements-gathering should fold (a.119) + P-51 together).
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-06-01 (the as-built Type page — the most recently shipped sibling AI-summary surface) + §B 2026-05-30-d (the Category page) + the §A frozen design intent (esp. the cross-everything / comprehensive-landscape decisions that the `/comprehensive-analysis` page realizes).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-01 (this session's informational entry — the mirror-by-reuse-+-generalize PATTERN + the Rule 3 findings) + §Entry 2026-05-31 (the TOP-TIER SLIP — the prevention rules: never act on an instruction that is not verbatim in a director message; honor explicit picker choices; restart on degraded tooling; confirm branch + task against the roadmap).
- **The shipped AI-summary surfaces to study as the consistency reference:** `src/app/.../competition-scraping/reviews-analysis-by-type/page.tsx` + `reviews-analysis-by-category/page.tsx` + `competitor-reviews-analysis/page.tsx` (the three pages whose AI-summarizing functionality the director wants mirrored onto `/comprehensive-analysis`) + `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` (the generalized batch handler the comprehensive flow would likely extend — apply the SAME mirror-by-reuse-+-generalize Pattern rather than duplicating) + the run-modal + prompt helpers.
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - **`feedback_plan_output_shape_before_building.md`** — THE governing memory for next session: the director explicitly wants Q&A + output-shape planning FIRST, then build. Do NOT design unilaterally or ship v1-and-iterate.
  - **`feedback_no_fabricated_instructions.md`** — never act on an instruction unless it appears verbatim in a director message; the (a.119) directive is captured verbatim above + in ROADMAP/CORRECTIONS_LOG.
  - `feedback_browser_first_ai_with_server_migration.md` — if the `/comprehensive-analysis` AI flow runs batch AI, default to browser-side execution with an execution-mode dropdown for future server migration (mirror the existing pages).
  - `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` (any schema shape that emerges is a Rule 23 / Rule 8/9 trigger — audit before `prisma db push`) + `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31, the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §2 + §3 of each listed spec at session start — especially `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` (the `/comprehensive-analysis` skeleton to reconcile with the director's (a.119) directive).** **This session is on `workflow-2-competition-scraping` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

🔴 **YOUR VERY FIRST ACTION (DIRECTOR DIRECTIVE — before any coding, any forced-picker, any design):** ASK ME for my instructions/requirements on what to develop for the `/competition-scraping/comprehensive-analysis` page. I want this page to include AI-summarizing functionalities **just like** the `/reviews-analysis-by-type`, `/reviews-analysis-by-category`, and `/competitor-reviews-analysis` pages. Once I give you my suggestions, plug as much of it as you can into the output-shape plan (audience / sections / depth / tone / placement / which data feeds the summary), and then ask me specific clarifying questions about anything still hazy — all BEFORE writing any code. This is a planning / requirements-gathering session opener, per `feedback_plan_output_shape_before_building.md`. Do NOT scaffold or build until the requirements are settled with me.

**Session goal (a.119 / `/comprehensive-analysis` AI-summarizing functionality):** gather my requirements, plan the output shape with me, reconcile against the existing P-51 skeleton, and only then design + (when I approve) build the AI-summary functionality for the `/comprehensive-analysis` page — mirroring the AI-summary behavior of the three review-analysis pages for consistency. If a batch AI flow is involved, prefer the mirror-by-reuse-+-generalize Pattern (extend/generalize the existing `review-analysis-run-batch` handler) rather than duplicating, and default to browser-side execution with an execution-mode dropdown per `feedback_browser_first_ai_with_server_migration.md`. **Schema-change-in-flight = NO at entry**; if the requirements imply a schema shape, confirm it WITH me (Rule 23 / Rule 8) before any `prisma db push`.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: 0 (or only brand-new work) — main and workflow-2 are both at f23df1b + the 2026-06-01 doc-batch SHA; nothing is held back
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2`.

**Phase 0 (requirements-gathering + output-shape design BEFORE coding — Rule 14f + `feedback_plan_output_shape_before_building.md`):**

- **Ask the director for the `/comprehensive-analysis` AI-summary requirements FIRST** (see the directive above). Do NOT pre-decide the design.
- **Plan the output shape WITH the director:** who the summary is for, what sections it has, how deep, what tone, where it lives on the page, and which data feeds it (the per-competitor / per-category / per-type analyses already produced? the raw captured reviews? something cross-everything?).
- **Reconcile (a.119) with the existing P-51 skeleton** (`docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md`) — note the director's directive and P-51 both target the `/comprehensive-analysis` page; fold them together.
- **Ask specific clarifying questions** about anything still hazy after plugging the director's answers into the plan.

**Phase 1+ (the build — only after requirements settle):**

- Design + (on director go-ahead) build the AI-summary functionality, mirroring the AI-summary UX of the three review-analysis pages for consistency. Prefer mirror-by-reuse-+-generalize (extend the existing batch handler) over duplication.
- Test coverage: positive tests on any new pure helpers; negative tests asserting the three existing analysis pages + their flows are unchanged.

**Phase 2+ (deploy decision Rule 14f, once the work lands + scoreboard-verifies):** fire deploy-now picker(s). On Yes, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on vklf.com. If a schema column ships, flip Schema-change-in-flight NO→YES→NO at the deploy push (`prisma db push`; additive nullable; zero data loss per Rule 23).

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (expect UNCHANGED)
- Extension tsc clean (expect UNCHANGED)
- Extension `npm test` = 910/910 (likely UNCHANGED — PLOS-side work; confirm)
- src/lib `node:test` ≥ 1238 (entry 1238; +N if new pure helpers ship)
- `npm run build` = 70 routes (UNCHANGED unless a new route is added; `/comprehensive-analysis` likely already exists as a route — confirm)
- Check 6 Playwright SKIPPED per Rule 27 (likely a DEPLOY session with director real-Chrome Phase 4)

**Deploy mechanics:** 1+ Rule 9 deploy gates planned IF the session reaches a build. On Yes, expect the standard 3-push pattern (push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`.

**Schema-change-in-flight flag:** **NO at entry**; flips to YES→NO at a deploy push only if the director's requirements imply a new schema column (confirm WITH the director first).

**Group A docs to update at session end:** ROADMAP header bump + (likely) a P-51 / new-entry status update + (a.119) close / (a.120) open + CHAT_REGISTRY header bump (185th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite.

**Group B docs to update at session end:** `docs/REVIEWS_PHASE_2_DESIGN.md` NEW §B entry (EIGHTEENTH W5 entry) IF code ships — capturing the `/comprehensive-analysis` AI-summary work. `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` updated with the director's settled requirements (§2 joint-discussion entry) + ship state.

**Standing carry-overs into this session:**

- **The (a.119) directive: ASK-DIRECTOR-FIRST for `/comprehensive-analysis` AI-summary requirements** (verbatim above + in ROADMAP + CORRECTIONS_LOG §Entry 2026-06-01).
- **P-53 Excel "Export Table"** for the Category + Type pages — LOW; never built on Category either.
- **(optional refinement) editable banner category/type name** on both grouped pages.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.
- **W#2 graduation** — schedulable now that P-49 W5 is closed (director's discretion).

---

## Why this pointer was written this way (debug aid)

- **(a.119) the `/comprehensive-analysis` AI-summary is the PICK because the director directed it explicitly** at the close of the Type page session: with P-49 W5 closed, the director wants `/comprehensive-analysis` to gain AI-summarizing functionality like the three review-analysis pages. The §4 Step 1c forced-picker outcome is the director-directed requirements-gathering opener.
- **This is an ASK-DIRECTOR-FIRST opener, NOT a build-first session** — per `feedback_plan_output_shape_before_building.md`, the director wants to plan the output shape together before any code. The launch prompt makes "ask the director for requirements" the literal first action.
- **The directive is captured verbatim** (here + in ROADMAP + CORRECTIONS_LOG §Entry 2026-06-01) specifically to satisfy `feedback_no_fabricated_instructions.md` — next session acts ONLY on the captured-verbatim directive, not a paraphrase.
- **Schema-change-in-flight = NO at entry** because the Type page's `typeTableLayout` column already shipped to prod this session; the `/comprehensive-analysis` work's schema needs are unknown until requirements settle.
- **Branch state is normal** (nothing held off main this session — the Type page build + the doc-batch both land on main).

## Alternate next-session candidates if director shifts priorities at session start

- **(a.119.alt1) `/comprehensive-analysis` AI-summary requirements-gathering** (current PICK — pre-loaded above). ASK-DIRECTOR-FIRST; reconcile with the P-51 skeleton; on `workflow-2-competition-scraping`.
- **(a.119.alt2) P-53 Excel "Export Table" for the Category + Type pages** (the deferred convenience export, never built on Category either; mirror `reviews-table-export.ts`; on `workflow-2-competition-scraping`).
- **(a.119.alt3) Category/Type page editable banner name** (the optional refinement; small UI follow-up applying to both grouped pages; on `workflow-2-competition-scraping`).
- **(a.119.alt4) W#2 graduation** (now that P-49 W5 is closed; schedule the graduation pass; director's discretion).
- **(a.119.alt5) Resolve the P-52 Opus 4.8 pricing carry-over + W#1 shared-list migration** (a small `main`-track follow-up, if the director supplies official pricing numbers).
- **(a.119.alt6) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; reinforced by this session's cwd-leak near-miss). Running tally ~31-34+; quick palate-cleanser.
- **(a.119.alt7) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files; director already approved scope; quick palate-cleanser on `main`).
