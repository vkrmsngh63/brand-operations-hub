# Next session

**Written:** 2026-05-27-c (`session_2026-05-27-c_p49-w5-session-3-per-competitor-deploy-and-2-ff-cycles` — W#2 polish P-49 W5 Session 3 — Per-Competitor Comprehensive (bulleted) flow ✅ DEPLOYED-AND-VERIFIED 2026-05-27-c end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — first of 3 remaining aggregation flows from §B 2026-05-27 design lock — initial build commit `b9d232e` (10 files +1481/-45) + 2 fix-forward commits (FF#1 `1cd6e3b` 10 files +1678/-106 bundling 4 Phase 4 redirects / FF#2 `7f19aca` 4 files +135/-39 bundling 2 Phase 4 redirects) all ff-merged to main under 3 Rule 9 deploy gates within ONE Phase 4 verification day; director Phase 4 PASS verdict on FF#2). **Closes (a.104) RECOMMENDED-NEXT** = P-49 W5 Session 3 Per-Competitor flow ✅ DEPLOYED-AND-VERIFIED 2026-05-27-c; **opens (a.105) RECOMMENDED-NEXT = P-49 W5 Session 4 — Per-Category Comprehensive (bulleted) flow + NEW "By Category-Type" page (Table 3 scaffold)** on `workflow-2-competition-scraping`.

---

## What we did this session (in plain terms)

Today's session shipped the second AI-summarization flow on the live site. The first flow — Per-Review (one summary per review) — shipped earlier today in a different session. Today's flow — Per-Competitor (one summary per competitor URL, summarizing ALL that competitor's reviews into a single critique) — is the first of three remaining "aggregation" flows in the locked design (the other two are Per-Category and Per-Type, scheduled for upcoming sessions).

**What shipped to the live site (one build + two batches of director-requested follow-up changes):**

- **The initial build** added the Per-Competitor flow end-to-end: a new prompt that takes one competitor's reviews and produces a single critique grouped under theme headings, a new dispatch branch in the behind-the-scenes endpoint, a new modal with the same per-batch loop pattern as today's earlier Per-Review modal (but at URL-level granularity rather than per-review granularity), a new button on the competitor URL row in Table 2, and a banner below the URL row showing the persisted summary.
- **First batch of fixes (4 changes bundled into one commit + one deploy)** — this is the first time we used a NEW reusable pattern: when director surfaces multiple distinct redirects in a single Phase 4 review session, we bundle them into ONE follow-up commit + ONE deploy rather than one-commit-per-issue. Today's bundle included: (1) the prompt rewrite from "neutral summary of stance + signals" to "critique-only, drop positive signals and use cases, write bullets under 4 fixed theme headings: Product / Fulfillment / Company-seller / Other notable"; (2) a NEW global "Summarize Reviews for All Competitors" button that fires the Per-Competitor flow against ALL competitor URLs in the project sequentially (browser loop iterating URLs, per-URL status table, cancel button, cost tally accumulating across URLs); (3) renaming the per-URL button from "Summarize competitor" to "Summarize Competitor Reviews" to clarify what's being summarized; (4) an Edit affordance on the summary banner — inline textarea + Save/Cancel + a new PATCH endpoint that overwrites the stored summary. Edit is cache-stable: if you re-run later with the same inputs, the cached row now carries your edit and that's what gets returned (no fresh AI call). Director's verbatim trigger for the Edit affordance: *"User should be able to edit the Review Summary."*
- **Second batch of fixes (2 changes bundled into one commit + one deploy)** — (1) the prompt got another rewrite from v2's 4 FIXED theme headings (Product / Fulfillment / Company-seller / Other notable) to v3 "theme-emergent" structure: reframe the original 3 critique categories as COMMON EXAMPLES, add an explicit "INVENT a new theme heading" directive, and list 9 example themes for inspiration (Pricing / Documentation / Compatibility / Safety / Software / Customer support / Longevity / Marketing accuracy / Accessibility) so the AI can name themes that don't fit the 4 boxes; (2) an explicit "✅ AI Review Summarizing job complete" green-bordered banner in BOTH the per-URL modal and the Global modal when the run finishes, so there's a clear visual signal of completion rather than a quiet state.
- Director's final Phase 4 PASS verdict on the second fix bundle confirms the v3 theme-emergent prompt + the completion banner across both modals.

**What this surfaces as reusable lessons-learned (Patterns) for future sessions:**

1. **"Same-day Phase 4 multi-redirect bundling Pattern"** — bundle N redirects from one Phase 4 review window into ONE follow-up commit + ONE deploy. Saves N-1 deploy gates + N-1 Phase 4 verification cycles vs. the prior eBay 5-commits-one-per-issue / Walmart 3-commits-one-per-issue historical pattern. Works when the redirects share the same flow + production state can't surface partial changes; doesn't work when redirects are gated by each other's outcome (sequential dependency).
2. **"Edit affordance for cached AI output Pattern"** — when an AI flow's output is persisted as the AUTHORITATIVE artifact (not an ephemeral preview), shipping the Edit affordance means (i) extend the wire shape to return the row id; (ii) new PATCH endpoint overwriting the stored summary; (iii) keep the cache key stable so subsequent reads serve the edit.
3. **"Test stub level-discriminator filtering Pattern"** — when production has a uniqueness constraint via an enum discriminator, the test stub MUST mirror it; otherwise tests pass when they shouldn't. Today's failure mode: PER_REVIEW_SUMMARIZE_PROMPT_VERSION and PER_COMPETITOR_BULLETED_PROMPT_VERSION coincidentally landed at 'v2' at the same time + the version-tripwire test broke because hash strings coincided across flows.

**Numbers:**

- **EIGHT Rule 14f forced-pickers fired — 8/8 = 100% Yes-to-Recommended** (variant scope + build order + which flow first + bullet structure + length range + input strategy + deploy-now + end-session). Running cumulative across recent sessions = 78/81 = 96.3% Yes-to-Recommended.
- **THREE Rule 9 deploy gates fired** (initial build + FF#1 bundled-4-redirect + FF#2 bundled-2-redirect). All under one session-start approval scope per `feedback_approval_scope_per_decision_unit.md`.
- **6 pushes total** (3 deploy + 3 ping-pong pairs).
- **Schema-change-in-flight = NO entire session** (no schema work; the PER_PRODUCT enum value used by Per-Competitor was already in production from this morning's W5 Session 2 deploy).
- **Scoreboards at session end:** root tsc clean + extension tsc clean + extension `npm test` = 910/910 UNCHANGED + src/lib `node:test` = **950/950** (+28 from 922 entry) + `npm run build` = **67 routes** (+1 from 66 — the new PATCH endpoint).

## What we'll do next session (in plain terms)

Next session is **P-49 W5 Session 4** on the `workflow-2-competition-scraping` branch per (a.105). Today's Per-Competitor flow is now the canonical pattern; next session reuses the same per-batch endpoint flow-dispatch architecture + the v3 critique-theme-emergent prompt shape but applied to the next aggregation level.

**What we'll do next session:**

- **Build the Per-Category Comprehensive (bulleted) flow.** Per the §B 2026-05-27 design lock, Per-Category means: take all reviews across all products sharing a category value (the `category` column on competitor URLs from W#2's Competition Data table), pool them, and produce a single critique-with-theme-headings summary per category. Reuses the v3 prompt shape from today (theme-emergent with COMMON EXAMPLES + INVENT directive + 9 example themes) but the input is now N×M reviews across multiple URLs grouped by category, not one URL's review corpus.
- **Build the NEW "By Category-Type" page** — this is Table 3 in the §B 2026-05-27 design lock. The 4-option toggle at the top of Competition Scraping (Competitor URLs / Comprehensive Analysis / Competitor Reviews Analysis / By Category-Type) already exists from W5 Session 2 — the 4th option is currently DISABLED. Next session enables it + builds the page. The page shows one row per competitor grouped by Category (rows collapse competitors sharing the same Category value); each row has a "Summarize Reviews for All Competitors in this Category" button + the persisted Per-Category summary banner inline.
- **Build the Per-Category modal + browser batch loop** — sibling to today's Per-Competitor modals; iterates categories sequentially rather than URLs. Should ship the View prompts panel + the "✅ AI Review Summarizing job complete" banner + the Edit affordance from the start (proactive use of today's Patterns rather than waiting for Phase 4 to surface them as gaps).
- **Fire the first live end-to-end run** on Per-Category against real reviews + check the output with director via Phase 4.
- **Optionally also build Per-Type Comprehensive (bulleted) flow + Table 4** (By Type page) if Per-Category lands + Phase 4 PASSES in the same session — Per-Type is structurally identical to Per-Category but groups by Type column instead of Category column. Director may opt to bundle both into Session 4 or split into Session 5.

**Director's pre-session homework (optional):**

- **Per-Category vs Per-Type ordering or both?** Should we knock out Per-Category first then Per-Type in a follow-up session, or build both in parallel since they share architecture?
- **For Per-Category specifically:** the input is N reviews across M products in a category. Does the theme-emergent v3 prompt shape need any adjustments for cross-product aggregation (e.g., "common themes across products in this category" vs. "common themes within this product's reviews")? Today's v3 prompt was tuned for one URL's reviews; cross-URL aggregation may need a small prompt tweak.

**Session shape estimate:** ~2 hours in-Claude. BUILD session by default. ZERO Rule 9 deploy gates planned by default (next session builds Per-Category + new By Category-Type page + modal + browser loop + fires first live run but doesn't necessarily land a production-ready deploy until director approves the output shape via Phase 4). Director may opt to deploy at session-end via a Rule 14f deploy-now-vs-exit picker if Phase 4 PASSES. Schema-change-in-flight STAYS NO at session entry (the 5 enum values in `ReviewAnalysisLevel` already cover all remaining flows).

## What's still left in the total roadmap (in plain terms)

- **P-49 W#2 Reviews Phase 2 (IN-FLIGHT)** — remaining work: Per-Category flow (next session) + Per-Type flow + Tables 3 + 4 wiring + Phase 4 verification per flow + opportunistic polish (Excel export + drag-reorder + click-to-edit + show-hide columns per the §B 2026-05-27 design lock). Estimate ~2-4 more sessions until P-49 closes.
- **P-50 NEW Condition Pathology card** — small single-session UI addition (one card insertion in two card-array files); director already approved scope; can be slotted into any future session or done standalone on `main`.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation to determine why every SCREEN_RECORDING webm is captured at ~6-7 fps actual rate; deferred from earlier sessions.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md` to permanently prevent the cwd-leak Pattern Class; reproduction running tally now **~26+** across recent sessions (was ~24+ at end of yesterday's W5 Session 2 catch-up; +2 today). Strong empirical signal continues mounting; the single-session fix would mechanically prevent this entire bug class going forward.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority; re-evaluate after P-49 closes.
- **W#2 graduation** — deferred until P-49 closes at the workstream-by-workstream level.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started.
- **Infrastructure TODOs** — Supabase file-size offline check (separate operational concern; not blocking workflows).

---

## Status of last session

**P-49 W5 Session 3 — Per-Competitor Comprehensive (bulleted) flow ✅ DEPLOYED-AND-VERIFIED 2026-05-27-c end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`** — first of 3 remaining aggregation flows from §B 2026-05-27 design lock.

**Session shape (DEPLOY session — 3 work commits + 1 doc-batch commit + 6 pushes):**

- Build commit `b9d232e` (10 files +1481/-45) — Per-Competitor Comprehensive (bulleted) flow end-to-end at code level: NEW prompt builders in `prompts.ts` (PROMPT_VERSION='v1') + per-batch handler dispatch branch + NEW `PerCompetitorSummarizeModal.tsx` + button + summary banner in Table 2 page.
- FF#1 `1cd6e3b` (10 files +1678/-106) — FOUR Phase 4 redirects bundled into ONE commit: (a) v1→v2 critique-only prompt with 4 fixed theme headings; (b) NEW global "Summarize Reviews for All Competitors" button + NEW `GlobalCompetitorSummarizeModal.tsx` (606 LOC sequential browser loop); (c) Table 2 button rename; (d) Edit affordance with NEW PATCH endpoint + NEW `review-analysis-update.ts` handler + wire-shape extension carrying `analysisId`.
- FF#2 `7f19aca` (4 files +135/-39) — TWO Phase 4 redirects bundled into ONE commit: (a) v2→v3 theme-emergent prompt + 9 example emergent themes + PROMPT_VERSION bump v2→v3; (b) explicit "✅ AI Review Summarizing job complete" green-bordered banner in BOTH PerCompetitor + Global modals when `runState.kind === 'completed'`.

**EIGHT Rule 14f forced-pickers fired this session — 8/8 = 100% Yes-to-Recommended** (variant scope + build order + which flow first + bullet structure + length range + input strategy + deploy-now + end-session). Running cumulative 78/81 = 96.3% Yes-to-Recommended.

**THREE Rule 9 deploy gates fired this session** (initial build deploy + FF#1 bundled-4-redirect deploy + FF#2 bundled-2-redirect deploy); per `feedback_approval_scope_per_decision_unit.md`, the session-start deploy-or-continue picker approved the whole Phase 4 redirect cycle including FF iterations.

**Schema-change-in-flight flag STAYS NO entire session** — entry NO (PER_PRODUCT enum value already in production from W5 Session 2's deploy 2026-05-27 morning); STAYS NO through both FFs (no schema work); final state at session end NO.

**ZERO DEFERRED items at session end (Rule 26)** — 15 in-session tasks; all 15 completed cleanly.

**Baselines locked from this session:** src/lib `node:test` = **950/950** (+28 from 922 entry) + `npm run build` = **67 routes** (+1 from 66 — the new PATCH endpoint) + extension `npm test` = **910/910 UNCHANGED**.

**THREE NEW reusable Patterns memorialized in CORRECTIONS_LOG §Entry 2026-05-27-c:** "Same-day Phase 4 multi-redirect bundling Pattern" + "Edit affordance for cached AI output Pattern" + "Test stub level-discriminator filtering Pattern".

**P-43 cwd-leak Pattern Class reproduced ~2 more times during today's /scoreboard runs.** Running tally now **~26+** across recent sessions; strong empirical signal continues mounting for the P-43 mechanical prevention small fix.

**FORTY-EIGHTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-49 W5 Session 4 begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping` and pre-load context. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry** (after this session's end-of-session doc-batch lands + the standard 3-push ping-pong sync fires): `workflow-2-competition-scraping` **even with `origin/main`** — both branches at the same SHA = the post-deploy doc-batch SHA after ff-merge. Verify with `git log main..HEAD --oneline` showing **0 commits ahead** at session entry. If shown as N>0 commits ahead, the doc-batch may not have ff-merged — surface to director.

**Pre-build read list for next session:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/ROADMAP.md` lines 1-30 (header + recent session sequence) + the **P-49 polish-backlog entry** (Status: "🟢 IN-FLIGHT 2026-05-27-c — W5 Session 3 Per-Competitor Comprehensive (bulleted) flow ✅ DEPLOYED-AND-VERIFIED 2026-05-27-c; W5 Session 4 NEXT per (a.105)").
- **`docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27-c** (THE canonical reference for W5 Session 3's Per-Competitor pattern that Session 4 mirrors — captures the v3 critique-theme-emergent prompt shape + the multi-redirect bundling Pattern + the Edit affordance Pattern + the per-batch handler's flow-dispatch architecture) + **§B 2026-05-27-b** (predecessor W5 Session 2 per-batch endpoint + Per-Review Summarize entry — the architectural foundation that Per-Competitor + Per-Category + Per-Type all extend) + **§B 2026-05-27** (W5 Session 1.5 design lock entry — the 3-table + 7-flow + 4-option toggle design lives there; the 4th By Category-Type option enables in Session 4) + **§B 2026-06-02** (W5 Session 1 foundation entry — the underlying primitives) + §A.10/§A.11/§A.12 (UX + interaction spec — original spec; cross-check against §B 2026-05-27 + §B 2026-05-27-b + §B 2026-05-27-c for the superseding decisions per Rule 18 §A frozen).
- **`docs/CORRECTIONS_LOG.md` §Entry 2026-05-27-c** (THE meta-pattern entry from this session — captures the 3 NEW reusable Patterns + 8 forced-picker calibrations + P-43 cwd-leak Pattern Class running tally ~26+).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - `feedback_browser_first_ai_with_server_migration.md` — PRIMARY directive for the browser-first batch loop architecture; today's Session 4 work reuses this Pattern for the new Per-Category modal + browser loop.
  - `feedback_plan_output_shape_before_building.md` — PRIMARY directive for asking director about the Per-Category prompt content before writing it.
  - `feedback_recommendation_style.md` + `feedback_default_to_recommendation.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_deferred_items_registry.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md`.
- **Today's W5 Session 3 shipped files** (the canonical reference implementation for Session 4):
  - `src/lib/competition-scraping/review-analysis/prompts.ts` (current shape carries `PER_REVIEW_SUMMARIZE_*` + `PER_COMPETITOR_BULLETED_*` builders; Session 4 adds `PER_CATEGORY_BULLETED_*`).
  - `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` (per-batch handler with flow-dispatch branches — Session 4 extends with `per-category-bulleted` dispatch).
  - `src/lib/competition-scraping/handlers/review-analysis-update.ts` (PATCH handler — Session 4's Per-Category banner reuses this same handler via the existing PATCH endpoint, no new endpoint needed).
  - `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/page.tsx` (Table 2 — Session 4 builds the new By Category-Type page at `src/app/projects/[projectId]/competition-scraping/by-category-type/page.tsx` with similar shape but category-grouped rows).
  - `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/components/PerCompetitorSummarizeModal.tsx` (canonical modal — Session 4 builds `PerCategorySummarizeModal.tsx` mirroring it).
  - `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/components/GlobalCompetitorSummarizeModal.tsx` (sequential browser loop iterating URLs — Session 4 may mirror this at category-level if a "Summarize all categories" button is wanted).
  - `src/app/projects/[projectId]/competition-scraping/components/CompetitionScrapingSurfaceNav.tsx` (4-option toggle; Session 4 enables the currently-disabled By Category-Type option).
- W#1's `AutoAnalyze.tsx` at `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` — canonical implementation pattern for browser batch loops; sibling reference.
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (zero gates expected by default for Session 4) + Rule 14f (forced-picker mechanics — expect ~3-5 to fire: 1 prompt-content-confirmation picker + 1 ordering picker if also doing Per-Type + per-Phase-4 redirect pickers + 1 §4 Step 1c next-task picker at session-end) + Rule 18 (§A frozen + §B append-only; today's §B 2026-05-27-c is the latest entry to anchor cross-references against) + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — PLOS-side handlers + src/lib + schema-change-in-flight STAYS NO at session entry) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.**

**Session goal:** P-49 W5 Session 4 — Per-Category Comprehensive (bulleted) flow + NEW "By Category-Type" page (Table 3 scaffold) on `workflow-2-competition-scraping`. Reuses the validated v3 critique-theme-emergent prompt shape from today's W5 Session 3 + the per-batch handler's flow-dispatch architecture. BUILD session by default; ZERO Rule 9 deploy gates planned by default.

**Branch verify (do this immediately after the resume script lands):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git log main..HEAD --oneline | wc -l
# Expected: 0 (workflow branch even with main after the standard 3-push ping-pong sync)

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)
```

If `git branch --show-current` shows `main`, STOP and surface to director. If `git log main..HEAD --oneline | wc -l` shows N>0, surface — the doc-batch ff-merge may not have completed.

**Fix shape outline (Rule 14f forced-picker BEFORE coding):**

Fire a Rule 14f forced-picker before any code lands surfacing the Per-Category prompt-content confirmation + ordering question:

- **Option A (Recommended):** Per-Category only this session (build Per-Category prompt + new By Category-Type page enabling the 4th toggle option + Per-Category modal + browser loop adapted for category-grouping + first live e2e run + Phase 4) → Per-Type in a follow-up session. Rationale: smallest scope to live verify + matches the per-flow Phase 4 round shape that worked well for Per-Competitor today.
- **Option B:** Per-Category + Per-Type in same session (both built + both first live runs fired + Phase 4 covers both). Bigger session length but parallel coverage since both flows are structurally identical (just different grouping column).
- **Option C (escape-hatch):** Director writes free-text directive shaping the ordering / scope differently.

**Pre-build prompt-content confirmation per `feedback_plan_output_shape_before_building.md`:**

Director and Claude jointly confirm the v1 Per-Category prompt before any code lands. The v3 prompt shape from today's W5 Session 3 (theme-emergent critique-only with COMMON EXAMPLES + INVENT directive + 9 example themes) is the natural starting point — but Per-Category's input is cross-product (N reviews across M products in a category) vs. today's Per-Competitor input (one product's review corpus). Likely small adjustments: prompt language may need to acknowledge "reviews are across multiple products within this category" + theme emergence may need to call out "themes that recur across products in this category" vs. "themes from this single product's reviews".

**Test coverage decision (Rule 14f sub-picker):**

For the Per-Category flow, ship the same Pattern as W5 Session 3 (positive test pinning PROMPT_VERSION + negative test asserting predecessor phrasings absent + handler cache-hit tests covering the composite cache key + StubCachedRow with `level` discriminator filtering). Recommended Yes — the Patterns are canonical now per CORRECTIONS_LOG §Entry 2026-05-27-c sub-observation (c).

**Scoreboard targets** (entry baselines = today's W5 Session 3 exit baselines):

- Root tsc clean (UNCHANGED)
- Extension tsc clean (UNCHANGED)
- Extension `npm test` = 910/910 (UNCHANGED — W5 is PLOS-side; no extension changes planned)
- src/lib `node:test` ≥ 950 (entry 950; expect +N for new prompt tests + new handler dispatch tests; rough estimate +14-20 for Per-Category if shipping just one flow; +28-30 if shipping both Per-Category + Per-Type)
- `npm run build` = 67 routes + N for new By Category-Type page + possibly By Type page (entry 67; +1 expected for By Category-Type page = 68 routes; +2 if also shipping By Type page = 69 routes)
- Check 6 Playwright SKIPPED per Rule 27 standing precedent (BUILD session)

**Deploy mechanics:** ZERO Rule 9 deploy gates planned by default for Session 4 (BUILD session by default). Director may opt to deploy at session-end via a Rule 14f deploy-now-vs-exit picker if Phase 4 PASSES on the live runs. If deploy fires, expect the same 3-push pattern as today (workflow-2 push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`; if also fix-forwards needed, bundle multi-redirect Phase 4 issues into single FFs per the NEW "Same-day Phase 4 multi-redirect bundling Pattern" from today's CORRECTIONS_LOG §Entry 2026-05-27-c.

**Group A docs to update at session end** (8-doc bundle assuming no new rules or memory files): ROADMAP header bump + P-49 polish-backlog entry status update + CHAT_REGISTRY header bump (171st session) + DOCUMENT_MANIFEST header bump + CORRECTIONS_LOG header + 1 NEW §Entry 2026-05-28 (or whatever date convention applies — likely 2026-05-28 since next session opens a new calendar day) capturing the W5 Session 4 outcome + any new Patterns + HANDOFF_PROTOCOL header bump only + CLAUDE_CODE_STARTER header bump only + NEXT_SESSION full rewrite for next session.

**Group B docs to update at session end:** NEW §B entry appended to `docs/REVIEWS_PHASE_2_DESIGN.md` (TWELFTH build/deploy-session §B entry per Rule 18; FOURTH W5 entry; captures the Per-Category flow + new By Category-Type page + Phase 4 verification + any new Patterns or §A supersedences). `docs/COMPETITION_SCRAPING_DESIGN.md` UNCHANGED (W5 is PLOS-side; no extension-side files in the planned commit set). `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` UNCHANGED (W5 verification happens in-session via Phase 4 not via the verification backlog).

**Schema-change-in-flight flag** at session entry: NO (the 5 enum values in `ReviewAnalysisLevel` already cover all remaining flows). Expected at session end: NO (no schema work planned for Session 4).

---

## Pre-session notes (offline; optional)

Director may want to think ahead about:

- **Per-Category vs Per-Type ordering or both?** Should we knock out Per-Category first then Per-Type in a follow-up session, or build both in parallel since they share architecture? Single-flow-per-session worked well today for Per-Competitor; same-day Phase 4 multi-redirect bundling may keep session length manageable even with both flows.
- **For Per-Category specifically:** the input is N reviews across M products in a category. Does the theme-emergent v3 prompt shape need any adjustments for cross-product aggregation (e.g., "common themes across products in this category" vs. "common themes within this product's reviews")? Today's v3 prompt was tuned for one URL's reviews; cross-URL aggregation may need a small prompt tweak.
- **By Category-Type page layout** — Table 3 in the §B 2026-05-27 design lock. One row per competitor grouped by Category (rows collapse competitors sharing the same Category value); Stars + Reviews Summary columns dropped per Round 2 free-text redirect from the planning conversation. Director may want to think about additional column structure or sorting preferences before next session.

If director comes in with answers, the session-start pickers are mostly re-confirmations. If director wants to think through it during the session, the pickers are genuine.

---

## Why this pointer was written this way (debug aid for next session)

The session that wrote this pointer (W5 Session 3 — 2026-05-27-c) shipped Per-Competitor Comprehensive (bulleted) flow with 2 bundled fix-forward cycles atop the initial build. The 3 NEW reusable Patterns memorialized in CORRECTIONS_LOG §Entry 2026-05-27-c apply directly to Session 4's work:

1. **Use the multi-redirect bundling Pattern proactively** — if Phase 4 surfaces multiple distinct redirects on the new Per-Category flow, bundle them into ONE FF commit per redirect-window rather than one-FF-per-issue.
2. **Ship the Edit affordance from the start** on the Per-Category banner — the wire shape + PATCH endpoint already exist; just need to extend the response body and add the inline textarea UI.
3. **Test stub level-discriminator filtering** — the `StubCachedRow` already carries the `level` field after FF#1's fix; Per-Category tests should leverage it from the start.

The Per-Competitor flow is the canonical implementation pattern; Session 4's Per-Category flow should mirror it closely, only diverging where the input granularity (cross-product within a category) genuinely requires it.

---

## Alternate next-session candidates (if director shifts priorities at session start)

If director surfaces a different priority at session start, alternative paths off (a.105):

- **P-43 mechanical prevention small fix** — one-session fix; adds absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md` to mechanically prevent the cwd-leak Pattern Class; reproduction running tally now **~26+** across recent sessions; small standalone session done on `main` between W#2 sessions.
- **P-50 Condition Pathology card** — ~10-minute UI addition; one card insertion in two card-array files (`src/app/projects/[projectId]/page.tsx` + `src/app/projects/page.tsx`); standalone session on `main`.
- **P-48 Session 3 Diagnostic #2** — empirical instrumentation to determine why every SCREEN_RECORDING webm is captured at ~6-7 fps actual rate; deferred from earlier sessions; can interleave between W5 sessions.

The Recommended path stays W5 Session 4 because today's W5 Session 3 deploy validated the Per-Competitor flow as the canonical pattern for the remaining 2 aggregation flows (Per-Category + Per-Type); closing the remaining P-49 W5 implementation arc faster than alternative paths.
