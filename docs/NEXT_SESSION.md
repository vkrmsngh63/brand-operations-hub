# Next session

**Written:** 2026-05-30 (`session_2026-05-30_p49-w5-category-page-session-1-scaffold-and-polish` — W#2 polish P-49 W5 Category page (Reviews Analysis By Competitor Category Table) Session 1 scaffold + a 5-item look-and-feel polish pass + 3 follow-up fixes + a vertical-scrollbar-overlap fix ✅ DEPLOYED-AND-VERIFIED 2026-05-30 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — FOUR deploys (`f08a41f` scaffold + `ee56398` 5-item polish + `90bfdf5` 3 fixes + `9b1d023` scrollbar-overlap fix), ONE explicit Rule 9 deploy picker (first deploy) + 3 in-session director directives; both branches at `9b1d023` pre-doc-batch. Director Phase 4 verbatim verdicts: all **"passed."** TWO NEW reusable PATTERNS: **"rowSpan sub-rows to align per-item data across two adjacent columns"** + **"Debounced merge-save must gate on initial-load-complete."** **Closes (a.114) RECOMMENDED-NEXT** — the Category page Block 1 planning resume is RESOLVED + Session 1 scaffold + polish + fixes are all deployed & verified. **Opens (a.115) RECOMMENDED-NEXT = P-49 W5 Category page "interactive batch"** on `workflow-2-competition-scraping`.

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session correctly stamped `2026-05-30` (the harness `currentDate` — the first session of the new calendar day after `2026-05-29-d`; NO letter suffix because it is the first session of 2026-05-30). Do NOT regress to 05-31 or invent letter suffixes ahead of the harness. Future sessions keep trusting the harness `currentDate`.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** (a.115) / the Category page interactive batch is W#2-only Reviews Phase 2 work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = YES at entry next session.** The interactive batch is backed by a NEW additive per-user/per-Project "memory" area (drag-order + hidden-rows). The exact storage shape — new nullable JSON columns on `UserTablePreferences` vs a sibling row — is the FIRST design decision: fire a Rule 14f picker on the storage shape BEFORE any code, per `feedback_plan_output_shape_before_building.md`. The flag flips YES → NO at the deploy push once the migration lands cleanly.

---

## What we did this session (in plain terms)

Today we built the brand-new **"Reviews Analysis By Competitor Category" page** — the first of the two sibling pages still on the to-do list — and then polished it and fixed a handful of layout issues. In plain terms:

1. **A new page that groups everything by category.** Instead of one long list, the new page shows one tidy block per competitor category (with the category name on the first row of its block, and an "(Uncategorized)" block last). Each block has the same kind of editable cells, the same show/hide-columns controls, and the same drag-to-resize column widths as the page we finished yesterday.
2. **Each review's stars sit right beside that review's summary.** Within a competitor, every captured review now shows its own star rating lined up next to its own summary, with the borders aligned — done by making each review its own little sub-row.
3. **The per-competitor summaries are reused, not regenerated.** The two summary columns reuse the work the sibling page already produced; the two future "by category" AI columns show a "(not yet generated)" placeholder for now.
4. **A look-and-feel polish pass + fixes:** a Platforms filter box, resize handles that run the full height of the table (including the right edge), a floating bottom scrollbar, full-height AI boxes, the table can now be dragged past the screen edge, the column widths are remembered across refreshes, and the right-side scrollbar no longer covers the table's edge.

A useful behind-the-scenes catch this session: the column widths were silently resetting because the "save" was firing before the page had finished loading the saved widths — we fixed it by waiting for the load to finish first. We also caught a stray invisible character that had slipped into a piece of text and made git think a source file was a binary file; we cleaned it up.

**Your verbatim Phase 4 verification verdict on all four deploys: "passed."**

**Numbers:**

- **SEVEN Rule 14f decisions — all chosen = 7/7 = 100% Yes-to-Recommended** (3 Block-1 planning questions + the first-deploy gate + 3 refinement-round decisions). Running cumulative: **140/143 = 97.9%**.
- **ONE explicit Rule 9 deploy picker** (first deploy `f08a41f`) + **3 in-session director directives** for the other three deploys.
- **Three pushes total** (the deploy ff-merges + ping-pongs happened during the session; the end-of-session doc-batch push + ping-pong are pending — the parent handles them).
- **Schema-change-in-flight = NO entire session** (every "remembered layout" setting reused the existing preferences storage; no database change).
- **Post-merge /scoreboard all GREEN at NEW LOCKED baselines:** root tsc clean + extension tsc clean + extension `npm test` = 910/910 UNCHANGED + src/lib `node:test` = **1130/1130** (+29 from 1101 — the two new helper test files) + `npm run build` = **69 routes** (+1 from 68 — the new page); Check 6 Playwright SKIPPED per Rule 27.
- **NO extension zip this session** (no extension code changed).

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (P-49 entry) + `docs/polish-item-specs/P-49-W5-S4-category-page.md` §2/§3 + `docs/polish-item-specs/P-49-W5-S5-type-page.md` §2 + `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3.

- **(a.115) P-49 W5 Category page "interactive batch"** — NEXT SESSION; on `workflow-2-competition-scraping` (see below). Drag whole categories + drag competitors within a category + the header-row layout restructure + hide-with-restore (scoped to this page only) + the NEW memory area. Then Session 2 = the two Category AI flows; the Type page (Sessions 4-5) inherits ALL Category behaviors.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.

## What we'll do next session (in plain terms)

Next session is **P-49 W5 Category page "interactive batch"** — making the new Category page interactive. In plain terms:

1. **Restructure the layout first.** Move the category name onto its OWN header row, with all of that category's competitor rows beneath it — so the very first competitor row is also draggable (right now the first row carries the category label, which blocks dragging it).
2. **Drag to reorder, two levels.** Drag whole categories up and down; and within a category, drag competitors up and down.
3. **Hide-with-restore.** Hide a competitor or hide an entire category — and be able to bring them back. This NEVER deletes any data anywhere else; it only hides them on THIS page.
4. **Remember it all per-user, per-Project.** All of the above (the drag order + what's hidden) is saved in a new "memory" area so it sticks across refreshes — scoped to this page only.

Because this adds a new place in the database to remember the order + hidden rows, **the database-change flag is YES at the start of next session** — and the very first thing to settle with you is the exact shape of that storage (one Rule 14f picker before any code).

## What's still left in the total roadmap (in plain terms)

- **P-49 W#2 Reviews Phase 2 (IN-FLIGHT — the Competitor Reviews Analysis Table page is CLOSED; the Category page Session 1 scaffold + polish + fixes are now ✅ DEPLOYED; the Category interactive batch + the two Category AI flows + the Type page Sessions 4-5 remain)** — Estimate ~4 more sessions until P-49 W5 closes.
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED on `main`. TWO carry-overs OPEN: official Opus 4.8 pricing numbers (director may supply offline) + the deferred W#1 shared-list migration.
- **P-50 NEW Condition Pathology card** — small single-session UI addition; director already approved scope; slot in any future session or do standalone on `main`.
- **P-51 NEW per-Project competitive landscape AI summary on `/comprehensive-analysis` page** — slot AFTER P-49 closes (director directive: P-51 is BETWEEN P-49 and P-50 in next-priority order); spec skeleton in place; build session opens with Q&A.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation; deferred.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; running tally ~31-33+ (no notable new reproductions this session). Single-session fix.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority; re-evaluate after P-49 closes.
- **W#2 graduation** — deferred until P-49 closes.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**P-49 W5 Category page (Reviews Analysis By Competitor Category Table) Session 1 scaffold + a 5-item look-and-feel polish pass + 3 follow-up fixes + a vertical-scrollbar-overlap fix ✅ DEPLOYED-AND-VERIFIED 2026-05-30** end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`. BUILD + DEPLOY session: FOUR builds, FOUR deploys (ONE explicit Rule 9 deploy picker on the first deploy + 3 in-session director directives). Director Phase 4 verbatim verdicts: all "passed." The FIRST of the 5-session Category + Type corrective rebuild.

**Session shape (BUILD + DEPLOY — 4 build commits + end-of-session doc-batch; 4 ff-merges + ping-pong syncs):**

- Builds: `f08a41f` (scaffold: NEW route `reviews-analysis-by-category/page.tsx` + a flat 13-column grouped table + column show/hide + click-to-edit + per-review stacked Stars/Reviews Summary + reuse of sibling per-competitor summaries in cols 10/11 + cols 12/13 placeholders; NEW pure helpers `src/lib/competition-scraping/category-table-columns.ts` + `category-table-grouping.ts` + their `.test.ts` siblings; nav tab enabled) + `ee56398` (5-item polish: Platforms filter + full-length resize incl. right edge + floating bottom h-scroll + full-height AI boxes + sub-row borders) + `90bfdf5` (3 fixes: explicit table width [per-col MAX 600→1000] + per-review `rowSpan` alignment + column-width persistence via a `hasLoadedPrefs` load-before-save gate) + `9b1d023` (`scrollbar-gutter: stable` + 48px trailing scroll space).
- 1 PENDING: end-of-session doc-batch commit (this doc-batch agent's output) — carries the 7-doc Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged content; listed for completeness]) + HANDOFF_PROTOCOL header bump + 1 Group B doc (REVIEWS_PHASE_2_DESIGN.md §B 2026-05-30) + 2 parent-MODIFIED polish-item-specs.

**SEVEN Rule 14f decisions — all chosen = 7/7 = 100% Yes-to-Recommended** (3 Block-1 planning questions [Q-A/B per-review-stacked + Q-C reuse the sibling prose flow + Q-D mirror the xlsx export] + the first-deploy gate + 3 refinement-round decisions [sequencing = polish-now-interactive-next + removal = hide-with-restore + scope = this-page-only]). Running cumulative = **140/143 = 97.9% Yes-to-Recommended**.

**ONE explicit Rule 9 deploy picker fired this session** (first deploy `f08a41f`); the other 3 deploys were covered by in-session director directives per `feedback_approval_scope_per_decision_unit.md`.

**Schema-change-in-flight flag NO entry → NO exit** — all persistence reused the existing `UserTablePreferences` model (`categoryTable:` key prefix). No `prisma db push` this session. **NEXT session = YES at entry** (the new per-user/per-Project memory area).

**ZERO DEFERRED items at entry and exit (Rule 26).** ZERO new DEFERRED.

**Baselines locked from this session:** root tsc clean + extension tsc clean + extension `npm test` = **910/910 UNCHANGED** + src/lib `node:test` = **1130/1130** (+29 from 1101 entry — the two new pure-helper test files `category-table-columns.test.ts` + `category-table-grouping.test.ts`) + `npm run build` = **69 routes** (+1 from 68 — the new `reviews-analysis-by-category` page route).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-30** (no top-tier slip — director PASSED everything) capturing: (1) NEW reusable PATTERN — "rowSpan sub-rows to align per-item data across two adjacent columns"; (2) NEW reusable PATTERN — "Debounced merge-save must gate on initial-load-complete"; (3) the lesson "git 'Bin 0 -> N bytes' on a .ts file = a stray non-text byte" (a NUL byte in a string sentinel; resolved by switching the uncategorized sentinel to the empty string); (4) the doc-drift note — the sibling xlsx export helper lives at `src/lib/competition-scraping/reviews-table-export.ts`, NOT the `…/review-analysis/…` path a prior handoff guessed; (5) P-43 cwd-leak running tally ~31-33+ (no notable new reproductions). NO new memory file.

**NEW §B 2026-05-30 entry appended to `docs/REVIEWS_PHASE_2_DESIGN.md`** (TWENTY-FIRST build/deploy-session §B entry per Rule 18; THIRTEENTH W5 entry; the FIRST Category-page entry — the Session 1 scaffold + the grouping helper + the per-review `rowSpan` sub-rows + the `categoryTable:` column-prefs persistence + the 5 polish items + the 3 fixes + the deferred interactive batch with the locked decisions; notes it does NOT regress the sibling Reviews Analysis Table page).

**ROADMAP P-49 entry status updated to "🟢 IN-FLIGHT 2026-05-30 — Category page Session 1 scaffold + polish + fixes ✅ DEPLOYED-AND-VERIFIED"** with the four build commit hashes + (a.115) Category page interactive batch queued.

**FIFTY-EIGHTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. (a.115) / the Category page interactive batch is W#2-only Reviews Phase 2 work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch lands + the standard 3-push ping-pong sync fires): `main` and `workflow-2-competition-scraping` both at the post-doc-batch SHA after ff-merge. Verify with `git status` showing a clean working tree (apart from historical untracked .zip + .html artifacts at repo root) and `git log origin/main..HEAD --oneline | wc -l` = 0.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52; read §2 + §3 of each at session start):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate) + Rule 14f (forced-picker mechanics — fire the storage-shape picker BEFORE any code, per `feedback_plan_output_shape_before_building.md`) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit — RELEVANT: a schema change is in flight) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-49-W5-S4-category-page.md` §2 (the 2026-05-30 entry — the Session 1 ship state + the DEFERRED interactive batch + the LOCKED decisions: hide-with-restore + scoped-to-page + the header-row layout restructure) + §3 (the rolled-up 13-column spec)** — THE source-of-truth for the Category page interactive batch.
- `docs/polish-item-specs/P-49-W5-S5-type-page.md` §2 (the 2026-05-30 entry — the Type page must inherit ALL Category behaviors; relevant when designing the memory area so it generalizes to the Type page).
- `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3 (pointer table — Reviews Analysis Table page CLOSED; Category page scaffold shipped; the interactive batch + AI flows + Type page remaining).
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-30 (this session — the Category page scaffold + the grouping helper + the `categoryTable:` persistence + the deferred interactive batch with the locked decisions) + §B 2026-05-29-d (the sibling page's @dnd-kit drag + the shared `rowOrder` mechanism — the drag pattern to MIRROR) + §A (the frozen design intent).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-30 (this session's informational entry — the 2 NEW Patterns + the stray-NUL-byte lesson + the xlsx-export-helper path correction).
- **The shipped Category page + the sibling drag pattern to mirror:** `src/app/projects/[projectId]/competition-scraping/reviews-analysis-by-category/page.tsx` (the page to make interactive — the `rowSpan` sub-rows + the `hasLoadedPrefs` gate already live here) + `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/page.tsx` (the sibling page's @dnd-kit drag-to-reorder pattern to MIRROR onto the Category page) + `src/lib/competition-scraping/category-table-grouping.ts` (the grouping helper — the header-row layout restructure changes the label-on-first-row shape here) + `prisma/schema.prisma` (the `UserTablePreferences` model — the memory-area schema decision lands here).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - `feedback_plan_output_shape_before_building.md` — DIRECTLY relevant: settle the memory-area storage shape (new nullable JSON columns on `UserTablePreferences` vs a sibling row) + the header-row layout restructure WITH the director via a Rule 14f picker BEFORE writing code.
  - `feedback_destructive_ops_confirmation.md` — RELEVANT: a schema change is in flight (Rule 23 Change Impact Audit + the additive-only / zero-data-loss confirmation before `prisma db push`).
  - `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31 (with the 2026-05-28-b mechanical read-guarantee + audit-shipped-state mandate sub-sections), the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §2 + §3 of each listed spec at session start — especially `docs/polish-item-specs/P-49-W5-S4-category-page.md` §2 (the 2026-05-30 entry — the deferred interactive batch + the locked decisions) + §3.** **This session is on `workflow-2-competition-scraping` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal (a.115 / P-49 W5 Category page "interactive batch"):** make the shipped Category page interactive. Restructure the layout (category name on its OWN header row, all competitor rows beneath it so the first is draggable); add drag-to-reorder at two levels (drag whole categories + drag competitors within a category); add hide-with-restore of a competitor and of an entire category, scoped to THIS PAGE ONLY (never deleting data elsewhere); back all of it with a NEW additive per-user/per-Project "memory" area (drag-order + hidden-rows). Mirror the sibling Reviews Analysis Table page's @dnd-kit drag pattern. **Schema-change-in-flight = YES entry state** (the memory-area schema is the FIRST decision). Then Session 2 = the two Category AI flows (Q-E prompts drafted at its start). The Type page (Sessions 4-5) must inherit ALL Category behaviors.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline | wc -l
# Expected: 0 (workflow-2 even with main after the standard 3-push ping-pong sync)
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2` (or `git checkout workflow-2-competition-scraping && git pull`) — this session is the W#2 Reviews Phase 2 Category page work, NOT a `main`-track item.

**Phase 0 (audit-shipped-state + the storage-shape design decision — per `feedback_plan_output_shape_before_building.md`, settle the memory-area schema via a Rule 14f picker BEFORE writing any code):**

- **Audit-shipped-state (Rule 31):** confirm the shipped Category page (`reviews-analysis-by-category/page.tsx`) is intact — the grouping (label on first row, `(Uncategorized)` last), the `rowSpan` per-review sub-rows, the `hasLoadedPrefs`-gated `categoryTable:` column-width persistence. Confirm the sibling page's @dnd-kit drag-to-reorder (`competitor-reviews-analysis/page.tsx`) is the pattern to mirror. Inspect `prisma/schema.prisma` for the `UserTablePreferences` model (where the memory area will land).
- **Storage-shape picker (Rule 14f — the FIRST decision, BEFORE code):** new nullable JSON columns on `UserTablePreferences` (recommended — additive, mirrors the existing `categoryTable:`-prefixed prefs, no new table) vs a separate sibling order/hidden-rows table. Confirm the additive-only / zero-data-loss shape per `feedback_destructive_ops_confirmation.md` + Rule 23 BEFORE `prisma db push`. The memory area must be designed to generalize to the Type page (Sessions 4-5 inherit ALL Category behaviors).
- **Layout-restructure shape picker (Rule 14f):** confirm the header-row layout restructure (category name on its OWN row, all competitor rows beneath) before reworking `category-table-grouping.ts` + the page render — this is what makes the first competitor row draggable.

**Phase 1 (interactive-batch build, after the storage shape + layout shape are locked):**

- The schema change (`prisma db push` — additive nullable columns on `UserTablePreferences`, or the sibling table per the picker) → flag flips YES → NO at the deploy push.
- The header-row layout restructure (category label on its own row) + two-level @dnd-kit drag-to-reorder (categories + competitors-within-a-category), mirroring `competitor-reviews-analysis/page.tsx`.
- Hide-with-restore of a competitor + of an entire category, scoped to this page only (a "hidden" set in the memory area + a restore affordance; NEVER deletes data elsewhere).
- Test coverage: positive tests on the new memory-area read/write helper(s) + the drag re-rank logic + the hidden-set filtering; negative tests asserting the sibling Reviews Analysis Table page + the Category page's existing scaffold behaviors (grouping, `rowSpan` alignment, column persistence) are unchanged.

**Phase 2 (deploy decision Rule 14f, once the interactive batch lands + scoreboard-verifies):** fire a deploy-now-vs-exit picker. If deploy fires, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on vklf.com.

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (UNCHANGED)
- Extension tsc clean (UNCHANGED)
- Extension `npm test` = 910/910 (likely UNCHANGED — the interactive batch is PLOS-side; confirm)
- src/lib `node:test` ≥ 1130 (entry 1130; expect +N for the memory-area helper + drag-rerank + hidden-set tests)
- `npm run build` = 69 routes (likely UNCHANGED unless a new memory-area endpoint is added — confirm; the existing `/table-preferences` endpoint may be reused)
- Check 6 Playwright SKIPPED per Rule 27 (BUILD/DEPLOY session; @dnd-kit drag is impractical to Playwright reliably + the sibling drag has no Playwright coverage; director real-Chrome Phase 4 used instead)

**Deploy mechanics:** 1+ Rule 9 deploy gates planned (the interactive batch is a clean deploy candidate). If deploy fires, expect the standard 3-push pattern (push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`.

**Schema-change-in-flight flag:** **YES entry → flips YES → NO at the deploy push** (the additive memory-area columns/table land via `prisma db push`; additive-only, zero data loss per Rule 23 + `feedback_destructive_ops_confirmation.md`).

**Group A docs to update at session end:** ROADMAP header bump + P-49 polish-backlog entry status update (Category page interactive batch progress) + CHAT_REGISTRY header bump (181st session) + DOCUMENT_MANIFEST header + flags (Schema-change-in-flight YES→NO transition + any new endpoint) + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump (likely header-bump-only — no new rule expected) + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite (likely Category page Session 2 — the two Category AI flows).

**Group B docs to update at session end:** `docs/REVIEWS_PHASE_2_DESIGN.md` NEW §B entry (TWENTY-SECOND build/deploy-session entry; FOURTEENTH W5 entry) IF code ships — capturing the memory-area schema shape + the header-row layout restructure + the two-level drag + hide-with-restore. `docs/polish-item-specs/P-49-W5-S4-category-page.md` (mark the interactive batch ✅ DONE in §2/§3) + `docs/polish-item-specs/P-49-W5-S5-type-page.md` (note the inheritable behaviors now shipped) + `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` (§3 pointer table — Category page interactive batch progress).

**Standing carry-overs into this session:**

- **Opus 4.8 pricing numbers (P-52 carry-over)** — director may supply offline; relevant if the Category page AI flows surface cost estimates (Session 2, not the interactive batch).
- **W#1 `AutoAnalyze.tsx` shared-list migration (P-52 carry-over)** — a future `main`-track tidy-up; not for this session.
- **Type page Sessions 4-5** — STILL PENDING; resume after the Category page (Sessions 1-3) closes; the Type page inherits ALL Category behaviors per the 2026-05-30 director directive — design the memory area so it generalizes.

---

## Why this pointer was written this way (debug aid)

- **(a.115) interactive batch is the PICK** because the director, after seeing the Session 1 scaffold + polish + fixes deployed, settled the refinement-round decisions (sequencing = polish-now-interactive-next; removal = hide-with-restore; scope = this-page-only) — these LOCK the interactive batch as the next coherent unit. The two Category AI flows (Session 2) come after, because they need the page structure stable first.
- **Schema-change-in-flight = YES at entry** because the interactive batch needs a NEW place to remember the drag order + hidden rows; that is the first real schema decision since the scaffold reused the existing prefs storage. The storage-shape picker is FIRST per `feedback_plan_output_shape_before_building.md`.
- **The header-row layout restructure is bundled here** (not in the scaffold) because it only matters once dragging exists — the first competitor row can't be draggable while it carries the category label; moving the label to its own header row unblocks the drag.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.115.alt1) P-49 W5 Category page "interactive batch"** (current PICK — pre-loaded above). The next P-49 W5 work; on `workflow-2-competition-scraping`; Schema-change-in-flight YES; the two-level drag + hide-with-restore + the memory area.
- **(a.115.alt2) P-49 W5 Category page Session 2 — the two Category AI flows** (if the director prefers to do the AI columns BEFORE the interactivity; Q-E prompts drafted at session start; on `workflow-2-competition-scraping`).
- **(a.115.alt3) Resolve the P-52 Opus 4.8 pricing carry-over + W#1 shared-list migration** (a small `main`-track follow-up, if the director supplies official pricing numbers and wants the W#1 cleanup done now).
- **(a.115.alt4) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`). Running tally ~31-33+; quick palate-cleanser.
- **(a.115.alt5) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files). Director already approved scope; quick palate-cleanser on `main`.
- **(a.115.alt6) P-51 per-Project competitive landscape AI summary** (per `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` skeleton — build session opens with Q&A). Slotted AFTER P-49 closes, but available if director wants to start the Q&A early.
