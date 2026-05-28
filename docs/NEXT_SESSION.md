# Next session

**Written:** 2026-05-29 (`session_2026-05-29_p49-w5-reviews-analysis-table-fix-session-a-shipped-with-4-bundled-ff-cycles` — W#2 polish P-49 W5 Reviews Analysis Table Fix Session A ✅ DEPLOYED-AND-VERIFIED 2026-05-29 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — the first of the 3-session corrective-fix plan locked 2026-05-28-b — initial build commit `8708343` (5 files +973/-183) plus FOUR fix-forward commits (FF1 `0b21c09` 8 redirects + FF2 `31c54a0` 5 redirects + FF3 `12c042c` 4 redirects + FF4 `3fbe12e` 1 redirect = 18 total redirects across 4 FFs in one Phase 4 verification day — **NEW RECORD beating the prior 3-FF max for the Same-day Phase 4 multi-redirect bundling Pattern**). Director Phase 4 verbatim PASS verdict on FF4: "everything passed". Q3 schema gap (`CapturedReview.title` column missing — title silently dropped at `orchestrator.ts:1254-1275` `saveReview` adapter) DISCOVERED mid-Fix-Session-A + DEFERRED to Fix Session B per director-approved Rule 14f picker. **Closes (a.107) RECOMMENDED-NEXT** = P-49 W5 Reviews Analysis Table Fix Session A ✅ DEPLOYED-AND-VERIFIED 2026-05-29 with 4 bundled fix-forward cycles. **Opens (a.108) RECOMMENDED-NEXT = P-49 W5 Reviews Analysis Table Fix Session B** on `workflow-2-competition-scraping` per `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session B" sub-section (with Q3 schema gap carry-over).

---

## What we did this session (in plain terms)

Today's session was a code + ship + verify day. We landed the smallest verifiable unit of the corrective fix on the Competitor Reviews Analysis Table page — the page that was shipped weeks ago (W5 Sessions 2 + 3) with 12 divergences from director's verbatim spec.

**The initial build commit `8708343` shipped 7 of the smallest verifiable changes:**

1. Toggle nav renamed to the 5 verbatim labels (4 spec labels + Comprehensive Analysis preserved as 5th per Q1 → A from 2026-05-28-b).
2. The URL row of the Reviews Analysis Table expanded from "Competitor / Product" merged + Platform + Reviews count + Actions to all 10 spec columns left-to-right (Platform / Category / Type / Product Name / Results Rank / Competition Score / URL / Reviews Summary / Bulleted / Non-Bulleted).
3. Column 8 "Reviews Summary" on the URL row displays a plain-text "N of M summarized" count (Q10 → A resolved at session-start planning — plain text default, no badge/pill, no click-to-expand).
4. NEW `ColumnVisibilityBar` checkbox bar above the table for show/hide of the 10 columns (mirroring the Competitor Content Table pattern).
5. Click-to-edit on URL-row cells 1-7 (Platform / Category / Type / Product Name / Results Rank / Competition Score / URL) propagating to `CompetitorUrl` columns via the existing PATCH endpoint (single source of truth across sibling tables per Q6 → A).
6. Click-to-edit on review-row body / star / reviewer / date cells propagating to `CapturedReview` columns via the existing PATCH endpoint (single source of truth across URL detail page per Q6 → A).
7. NEW pure helper module `src/lib/competition-scraping/reviews-analysis-table-columns.ts` carrying the 10-column shape constants + width helpers + count-display helper + 18 new node:test cases pinning the table primitive against spec.

**After deploy, director surfaced FOUR rounds of Phase 4 verification with a total of 18 redirects bundled into 4 fix-forward commits within one verification day — a NEW RECORD beating the prior 3-FF max for the Same-day Phase 4 multi-redirect bundling Pattern.** The 4 FF cycles were:

- **FF1 `0b21c09` — 8 redirects bundled:** NEW Platforms filter chips above the table + visible cell borders + fix overlapping columns (CSS grid layout → HTML `<table>` + `<colgroup>` with `tableLayout:fixed`) + edge-to-edge table (1280px maxWidth removed) + drag-to-resize column widths via NEW shared `ColumnResizeHandle` EXTRACTED from `UrlTable.tsx` into `src/app/projects/[projectId]/competition-scraping/components/ColumnResizeHandle.tsx` (now used by BOTH the Competitor URLs sibling table + Reviews Analysis Table) + 3 button text renames (per-URL "Summarize all reviews within this product" + per-URL "Summarize each individual review under this product" + top-of-page "Summarize All Reviews From All Competitors").
- **FF2 `31c54a0` — 5 redirects bundled:** drag handles work along the full length of the column header (removed `overflow:hidden` from `thStyle`) + sticky table header + horizontal scrollbar locked to viewport (`maxHeight: calc(100vh - 280px)` on the outer table div) + column widths + visibility persist server-side via the existing `/table-preferences` endpoint with `reviewsTable:` key prefix namespace (**NO schema change** — extends the existing JSON value shape per spec doc directive) + right edge of table draggable via `ColumnResizeHandle` on the Actions column header (key `__actions__`) + per-review + per-competitor summary persistence-on-refresh via NEW `GET /api/projects/[projectId]/competition-scraping/review-analysis` route + NEW handler `src/lib/competition-scraping/handlers/review-analysis-list.ts` (closes D-8 — lifted forward from Fix Session B per director directive).
- **FF3 `12c042c` — 4 redirects bundled:** colspan off-by-one fix (`tableColspan` corrected; explicit `border:none` on banner + ReviewsList `<td>`s) + click-to-expand on Column 8 cell now works (removed `<td>`-level `stopPropagation`; InlineCell components carry their own internal `stopPropagation`) + horizontal scrollbar now floats at viewport bottom via full-viewport flex-column page restructure (`height: 100vh` + `display: flex; flexDirection: column` + `overflow: hidden` on outer page wrapper; table region takes `flex:1` of remaining viewport with `minHeight: 0`) + blue "Summarize each individual review" button moved ABOVE green "Summarize all reviews within this product" button. `ColumnResizeHandle` gained NEW `showRestingLine` prop (default true for URLs page; set false on Reviews Analysis Table so the full-height column lines don't bleed into the expanded sub-rows).
- **FF4 `3fbe12e` — Column 8 + Column 9 cells become expand/collapse triggers with state-aware text:** split single `expanded` state into `reviewsExpanded` (Column 8 toggle) + `bannerExpanded` (Column 9 toggle); leftmost ▸/▾ cell becomes "expand both" master toggle; auto-expand on per-URL AI run kickoff + on fresh in-session per-competitor summary land; NEW pure helpers `computeReviewsSummaryCellAffordance` + `computeBannerCellAffordance` in the helper module with +9 new node:test cases pinning text states + clickability semantics.

**Director's verbatim Phase 4 verification result on FF4: "everything passed".**

**Q3 schema-gap discovery during build.** Mid-build code-truth audit at the orchestrator's `saveReview` adapter (`orchestrator.ts:1254-1275`) revealed: `CapturedReview` prisma model has only a single `body` column; extractors (`amazon-review-extractor.ts:283`, `walmart-review-extractor.ts:305`) DO capture `title` separately but the adapter silently DROPS the title before persisting via `createCapturedReview`. The Q3 → A title+description display-time merge from 2026-05-28-b CAN'T ship without a schema migration. Director-approved Rule 14f mid-build picker (4-option) — director picked Recommended (Defer to Fix Session B + preserve Fix Session A's NO-schema-change scope intact). Q3 carry-over fully captured into the spec doc §3 Fix Session B item 6 + §4 RESOLVED-via-deferral note.

**Numbers:**

- **SEVEN Rule 14f forced-pickers fired this session — 7/7 = 100% Yes-to-Recommended** (1 Q10 resolution picker [plain text Recommended] + 1 Q3 schema-gap discovery picker [Defer to Fix Session B Recommended] + 5 Rule 9 deploy gates [initial + FF1 + FF2 + FF3 + FF4 all Recommended]). Running cumulative across recent 10 sessions: 96/99 = 97.0%.
- **FIVE Rule 9 deploy gates fired** (initial build + FF1 + FF2 + FF3 + FF4 — all director-Yes; standard 3-push pattern per ff-merge per `feedback_approval_scope_per_decision_unit.md`).
- **~14-16 pushes total** (5 build-commit pushes to workflow-2 BEFORE deploy + 5 ff-merges to main + 5 ping-pong workflow-2 syncs + the end-of-session doc-batch push pattern).
- **Schema-change-in-flight = NO entire session** (entry NO + STAYS NO across all 5 deploys + Q3 schema-gap deferred to Fix Session B + exit NO).
- **Post-FF4 /scoreboard 5/5 GREEN at NEW LOCKED baselines:** root tsc clean + extension tsc clean + extension `npm test` = 910/910 UNCHANGED + src/lib `node:test` = **984/984** (+34 net cumulative — +18 initial reviews-analysis-table-columns tests, +2 FF1 `resolveReviewsColumnWidth` tests, +5 FF2 `resolveActionsColumnWidth` tests, +9 FF4 affordance helper tests; FF3 was layout-only) + `npm run build` = **68 routes** (+1 NEW `GET /api/projects/[projectId]/competition-scraping/review-analysis` route added in FF2); Check 6 Playwright SKIPPED per Rule 27.

## What's pending from prior session — 2 OPEN QUESTIONS (Q8 / Q9) + Q3 SCHEMA CARRY-OVER

These questions are the resume points for the upcoming Fix Sessions B + C. Captured verbatim in `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 + §4.

- **Q3 schema gap (NEW carry-over from Fix Session A 2026-05-29 build discovery)** — add `CapturedReview.title String?` column (additive, nullable, zero data loss) + wire `orchestrator.ts:1254-1275` `saveReview` adapter to pass title through to `createCapturedReview` + extend wire shape + extend PATCH endpoint to accept title + implement title+description display-time merge on the review-row body cell of the Reviews Analysis Table (per Q3 → A from 2026-05-28-b: 'title' + period-if-missing + ' ' + 'body'). **Pick at start of Fix Session B planning (THIS upcoming session).** Default: ship with Fix Session B's schema work (Fix Session B is now a YES-schema-change-in-flight session).
- **Q9 — per-review summary Edit UI: same Edit-button pattern as banner row?** Likely yes per Rule 14a Read-It-Back (the §1 spec line "All cells should be editable by clicking them" implies the same UX). **Confirm at start of Fix Session B planning (THIS upcoming session).** Default: same Edit-button pattern as banner row.
- **Q8 — per-batch endpoint flow-value naming convention for the NEW per-competitor non-bulleted flow** — Options: (a) `flow=per-competitor-nonbulleted` (mirrors existing `per-competitor-bulleted` shipped W5 Session 3); (b) `flow=per-product-nonbulleted` (matches enum level `PER_PRODUCT` for clarity). **Decide at start of Fix Session C** (pushed back behind this session).

Also pending (pushed back behind Fix Sessions B + C):

- **Category page Block 1 planning resume** (6 open questions from `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4 — Q-A Column 8 Stars semantics, Q-B Column 9 Reviews Summary data source + rendering, Q-C Column 11 non-bulleted, 1b-i first-row-carries-label visual treatment, 1b-ii drag handle placement, 1b-iii Uncategorized bucket placement). STILL PENDING; resume after Fix Session C closes.

## What we'll do next session (in plain terms)

Next session is **P-49 W5 Reviews Analysis Table Fix Session B** on the `workflow-2-competition-scraping` branch per (a.108). The session ID is TBD (a likely candidate: `session_2026-05-30_p49-w5-reviews-analysis-table-fix-session-b`).

**Recommended session shape (subject to director's pickers at session start):**

- **Phase 1 (planning Q3 + Q9 resolutions — likely 5-20 min):**
  - Answer Q9 (per-review summary Edit UI pattern — same as banner row by default; pick alternative if director prefers).
  - Confirm Q3 schema-change shape (additive nullable `CapturedReview.title String?` column; expect zero data loss; `npx prisma db push` fires mid-session; Schema-change-in-flight flag FLIPS NO → YES at that point).
  - Update `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 (Fix Session B sub-section) to reflect any answer-driven refinements + remove resolved questions from §4.
- **Phase 2 (build — Fix Session B scope; likely 90-150 min):** code Fix Session B scope per the spec doc §3 "Fix Session B" sub-section:
  1. Render the NEW "Overall Analysis — Captured Reviews" box on URL detail page (`UrlDetailContent.tsx`) using the existing `OverallAnalysisBox` component pattern. Backed by `CompetitorUrl.overallAnalyses["reviews"]` (slot already exists in schema; just needs UI render).
  2. Wire per-review summary WRITE-BACK to `CapturedReview.analysis`. Path: when `run-batch.ts` saves a PER_REVIEW `ReviewAnalysis` row, ALSO update the corresponding `CapturedReview.analysis` field with the same bullet-list TipTap doc (D-9 fix).
  3. Wire per-competitor BULLETED WRITE-BACK to `CompetitorUrl.overallAnalyses["reviews"]`. Append-merge at the bottom (D-10 fix; bulleted half).
  4. Extend `review-analysis-update.ts` PATCH endpoint to ACCEPT PER_REVIEW edits (currently rejected at line 181-193). Wire UI Edit button on per-review summary cells on review rows (D-11 fix; Q9 → same Edit-button UI pattern as banner row).
  5. Re-verify per-review summaries persistence-on-refresh works correctly (mostly closed in FF2 of Fix Session A; worth re-confirming after schema change).
  6. **Q3 schema gap carry-over from Fix Session A**: add `CapturedReview.title String?` column (additive, nullable, zero data loss) + wire `orchestrator.ts:1254-1275` `saveReview` adapter to pass title through to `createCapturedReview` + extend wire shape + extend PATCH endpoint to accept title + implement title+description display-time merge on the review-row body cell of the Reviews Analysis Table (per Q3 → A from 2026-05-28-b).
- **Phase 3 (deploy decision Rule 14f picker):** if Phase 2 lands + scoreboard-verifies, fire a Rule 14f deploy-now-vs-exit picker. If director picks deploy, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on:
  - the new "Overall Analysis — Captured Reviews" box rendering correctly on URL detail page;
  - per-review summary write-back showing up in the "Your Analysis" box on URL detail page;
  - per-competitor bulleted write-back showing up appended at the bottom of the "Overall Analysis — Captured Reviews" box on URL detail page;
  - per-review Edit affordance on review-row summary cells working;
  - title+description display-time merge rendering correctly on the review-row body cell (after `CapturedReview.title` schema column lands).
  If Phase 4 surfaces redirects, bundle multi-redirect Phase 4 issues into single FFs per the canonical "Same-day Phase 4 multi-redirect bundling Pattern" (now with a 4-FF/18-redirect ceiling per today's NEW RECORD).

**Director's pre-session homework (optional):**

- Q9 confirmation (per-review summary Edit UI — same Edit-button pattern as banner row?).
- Q3 schema-change confirmation (additive nullable `CapturedReview.title String?` column; expect zero data loss; `npx prisma db push` mid-session).

**Session shape estimate:** ~90-150 minutes in-Claude depending on Phase 2 scope + FF cycles. BUILD session by default after Phase 1 closes. Phase 3 deploy decision is a Rule 14f picker. Schema-change-in-flight = **YES entry** (Q3 schema migration carried over from Fix Session A — additive only; `CapturedReview.title` nullable; zero data loss); FLIPPED YES → NO at deploy push completion per the canonical schema-change-ships-to-production transition. Pre-build joint-confirmation per `feedback_plan_output_shape_before_building.md` STILL FIRES on top of §3 of the spec doc, but the bar is now: confirm §3 is correct + complete for Fix Session B's scope, NOT re-derive the spec from scratch (the spec doc is the canonical source-of-truth per Rule 31).

## What's still left in the total roadmap (in plain terms)

- **P-49 W#2 Reviews Phase 2 (IN-FLIGHT — Fix Session A ✅ DEPLOYED 2026-05-29; Fix Sessions B + C + Category Sessions 1-3 + Type Sessions 4-5 remaining)** — remaining work: 2 more Fix Sessions on the Reviews Analysis Table page (Fix B this upcoming session with write-backs + per-review-edit + Q3 schema; Fix C non-bulleted + Excel + drag + 1 more schema column) + 5-session corrective rebuild from 2026-05-28 (Category Sessions 1-3 + Type Sessions 4-5) pushed back behind the Fix Sessions + Phase 4 verification per session + opportunistic polish. Estimate ~7 more sessions until P-49 W5 closes (Fix B + Fix C + Category 1 + Category 2 + Category 3 + Type 4 + Type 5).
- **P-50 NEW Condition Pathology card** — small single-session UI addition (one card insertion in two card-array files); director already approved scope; slot in any future session or do standalone on `main`.
- **P-51 NEW per-Project competitive landscape AI summary on `/comprehensive-analysis` page** — slot AFTER P-49 closes (per director directive: P-51 is BETWEEN P-49 and P-50 in next-priority order); spec doc skeleton already in place; build session opens with Q&A per director's directive.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation to determine why every SCREEN_RECORDING webm is captured at ~6-7 fps actual rate; deferred from earlier sessions.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md` to permanently prevent the cwd-leak Pattern Class; running tally now **~31-33+** across recent sessions (~4 reproductions today). Strong empirical signal continues mounting; single-session fix would mechanically prevent this entire bug class.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority; re-evaluate after P-49 closes.
- **W#2 graduation** — deferred until P-49 closes at the workstream-by-workstream level.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started.
- **Infrastructure TODOs** — Supabase file-size offline check (separate operational concern; not blocking workflows).

---

## Status of last session

**P-49 W5 Reviews Analysis Table Fix Session A ✅ DEPLOYED-AND-VERIFIED 2026-05-29** end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`. DEPLOY session: 5 Rule 9 deploy gates fired across initial build + FF1 + FF2 + FF3 + FF4 within one Phase 4 verification day.

**Session shape (DEPLOY — 5 work commits + end-of-session doc-batch + 5 ff-merges + 5 ping-pong syncs):**

- 5 work commits: `8708343` (initial 5 files +973/-183) + `0b21c09` (FF1 5 files +936/-517) + `31c54a0` (FF2 5 files +466/-6) + `12c042c` (FF3 2 files +97/-33) + `3fbe12e` (FF4 3 files +308/-55).
- 1 PENDING: end-of-session doc-batch commit (this doc-batch agent's output) — carries 8-doc Group A bundle + 1 Group B doc (REVIEWS_PHASE_2_DESIGN.md §B 2026-05-29) + 2 MODIFIED polish-item-specs.

**SEVEN Rule 14f forced-pickers fired this session — 7/7 = 100% Yes-to-Recommended:** (1) Q10 resolution picker (plain text Recommended); (2) Q3 schema-gap discovery picker mid-build (Defer to Fix Session B Recommended); (3-7) 5 Rule 9 deploy gates (initial + FF1 + FF2 + FF3 + FF4 all Recommended). Running cumulative across recent 10 sessions = **96/99 = 97.0% Yes-to-Recommended**.

**FIVE Rule 9 deploy gates fired this session.**

**Schema-change-in-flight flag STAYS NO entire session** — entry NO + STAYS NO across all 5 deploys + Q3 schema-gap discovery DEFERRED to Fix Session B (preserves NO-this-session scope) + exit NO.

**ZERO DEFERRED items at session end (Rule 26)** — Q3 carry-over captured into spec doc §3 + §4 not into TaskList per Rule 14e.

**Baselines locked from this session:** root tsc clean + extension tsc clean + extension `npm test` = **910/910 UNCHANGED** + src/lib `node:test` = **984/984** (+34 net cumulative) + `npm run build` = **68 routes** (+1 NEW GET /review-analysis route in FF2).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-29** capturing FOUR observations: (1) NEW RECORD for the Same-day Phase 4 multi-redirect bundling Pattern — 4 FFs in one day beating the prior 3-FF max (Etsy 2026-05-31 + Walmart 2026-06-01 had 3 FFs each); (2) Q3 schema-gap discovery during build is a NEW positive pattern — director-approved Rule 14f deferral preserved Fix Session A's NO-schema-change scope intact while still capturing the work for Fix Session B; (3) NEW reusable PATTERN memorialized: Cell-level click handlers + state-aware text affordance Pattern (the FF4 split-state + cell-text-changes pattern is reusable for any table cell that toggles a sub-surface); (4) P-43 cwd-leak Pattern Class — ~4 reproductions this session (running tally now ~31-33+).

**NEW source-tree files shipped to production this session:** NEW handler `src/lib/competition-scraping/handlers/review-analysis-list.ts` (FF2 — backs the NEW `GET /api/projects/[projectId]/competition-scraping/review-analysis` route; provides per-review + per-competitor summary persistence-on-refresh; closes D-8 — lifted forward from Fix Session B per director directive) + NEW shared component `src/app/projects/[projectId]/competition-scraping/components/ColumnResizeHandle.tsx` (FF1; extracted from `UrlTable.tsx` so both sibling tables use the same drag-to-resize affordance; FF3 added `showRestingLine` prop).

**2 polish-item-specs MODIFIED this session:**

- `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` — Status field flipped to "Fix Session A SHIPPED-AND-VERIFIED 2026-05-29; D-1 through D-7 closed; D-8 PARTIALLY closed in FF2; D-9/D-10/D-11 + Q3 schema gap carried to Fix Session B" + §3 Fix Session A items marked ✅ DONE + Q10 → A RESOLVED at session-start + §3 Fix Session B item 6 added carrying Q3 schema gap carry-over + §4 reduced to Q8 + Q9 + Q10 RESOLVED note.
- `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` — §3 pointer table — Reviews Analysis Table page status flipped from "🔴 PARTIAL — shipped at W5 Sessions 2 + 3 with multiple divergences" to "🟡 PARTIAL — Fix Session A ✅ DEPLOYED-AND-VERIFIED 2026-05-29; Fix Sessions B + C remaining".

**NEW §B 2026-05-29 entry appended to `docs/REVIEWS_PHASE_2_DESIGN.md`** (FOURTEENTH build/deploy-session §B entry per Rule 18; SIXTH W5 entry; captures Fix Session A deploy + 4-FF cascade + scoreboard deltas + Q3 deferral to Fix Session B + NEW reusable PATTERN memorialized).

**P-43 cwd-leak Pattern Class — ~4 reproductions this session.** Running tally now **~31-33+** across recent sessions.

**FIFTY-FIRST end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-49 W5 Reviews Analysis Table Fix Session B begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping` and pre-load context. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry** (after this session's end-of-session doc-batch lands + the standard 3-push ping-pong sync fires): `workflow-2-competition-scraping` **even with `origin/main`** — both branches at the same SHA = the post-doc-batch SHA after ff-merge. Verify with `git log main..HEAD --oneline` showing **0 commits ahead** at session entry. If shown as N>0 commits ahead, the doc-batch may not have ff-merged — surface to director.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51; Claude reads all matching §3 sections as part of the start-of-session routine):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate as of 2026-05-28-b).
- **`docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 end-to-end** (THE source-of-truth for Fix Session B scope — read the "Fix Session B" sub-section in particular; ALL 6 items now including the NEW item 6 Q3 schema gap carry-over) + §4 (Q8 + Q9 + Q10 RESOLVED note open questions; Q9 directly relevant to Fix Session B — pick at session-start planning) + §2 (the Fix Session A 2026-05-29 joint-discussion entry summarizing the 4 FF cycles + verbatim director "everything passed" PASS verdict).
- Master spec doc `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` (skim §3 pointer table for context — Reviews Analysis Table page is now 🟡 PARTIAL after Fix Session A; Category page is still 🟡 SPEC LOCKED + wrong-spec-build SHIPPED + REVERTED; Type page is still 🟢 SPEC LOCKED + not yet shipped).
- `docs/polish-item-specs/P-49-W5-S4-category-page.md` §3 (the canonical reference for Category page Sessions 1-3 of the corrective rebuild — pushed back behind Fix Sessions B + C but useful background context).
- `docs/polish-item-specs/P-49-W5-S5-type-page.md` §3 (the canonical reference for Type page Sessions 4-5 of the corrective rebuild — also pushed back).
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-29 (THE canonical entry for Fix Session A deploy + 4-FF cascade + scoreboard deltas + Q3 deferral; verifies the per-page spec hasn't drifted) + §B 2026-05-28-b (the divergence + 3-session fix plan) + §B 2026-05-28 (the scope-misread rollback + 5-session corrective rebuild plan) + §B 2026-05-27-c (W5 Session 3 Per-Competitor bulleted — the v3 critique-only theme-emergent prompt + PATCH endpoint architecture PRESERVED in the corrective fix) + §B 2026-05-27-b (W5 Session 2 per-batch endpoint architecture PRESERVED) + §B 2026-05-27 (W5 Session 1.5 design lock; partially superseded by the 3-session corrective-fix plan on the Reviews Analysis Table page surface).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-29 (THE Fix Session A informational entry — NEW RECORD for the bundling Pattern + Q3 schema-gap discovery NEW positive pattern + NEW Cell-level click handlers + state-aware text affordance Pattern + P-43 running tally) + §Entry 2026-05-28-b (the meta-pattern entry from the planning session — 12-divergence finding + NEW Rule 31 extensions + 2 NEW reusable PATTERNS + 3-session corrective-fix plan) + §Entry 2026-05-28 (the scope-misread incident + NEW Rule 31).
- `docs/ROADMAP.md` lines 1-30 (header + recent session sequence) + the **P-49 polish-backlog entry** (Status: "🟢 IN-FLIGHT 2026-05-29 — Fix Session A ✅ DEPLOYED-AND-VERIFIED; Fix Sessions B + C + Category Sessions 1-3 + Type Sessions 4-5 remaining" with cross-reference to the 4 P-49 spec docs + 5 deploy commit hashes).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - `feedback_plan_output_shape_before_building.md` — the related procedural memory; Rule 31 + the spec-doc mechanism + the mechanical read-guarantee + the audit-shipped-state mandate are the structural backstops. STILL FIRES at session start on top of §3 of the spec doc, but the bar is now: confirm §3 is correct + complete for Fix Session B's scope.
  - `feedback_browser_first_ai_with_server_migration.md` — the default-to-browser-first AI directive; PARTIALLY SUPERSEDED for the Reviews Analysis Table page's existing AI flows + the Category + Type aggregation flows per director's verbatim server-side spec.
  - `feedback_recommendation_style.md` + `feedback_default_to_recommendation.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_deferred_items_registry.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md`.
- **Fix Session A shipped reference files** (the canonical reference implementation for the 10-column + show/hide + click-to-edit + persistence-on-refresh + drag-to-resize + state-aware Column 8/9 affordances — Fix Session B extends these with write-backs + per-review-edit + Q3 schema column):
  - `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/page.tsx` — Table 2 page; Fix Session B extends this with the title+description display-time merge on review-row body cell + per-review Edit affordance on review-row summary cells (Q9 wire-up).
  - `src/app/projects/[projectId]/competition-scraping/url/[urlId]/page.tsx` + `UrlDetailContent.tsx` — Fix Session B ADDS the "Overall Analysis — Captured Reviews" box rendering (currently missing per D-10).
  - `src/app/projects/[projectId]/competition-scraping/components/OverallAnalysisBox.tsx` — existing pattern; Fix Session B re-uses for the new "Overall Analysis — Captured Reviews" box.
  - `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` (per-batch handler with flow-dispatch branches; Fix Session B EXTENDS with write-back hooks for `CapturedReview.analysis` (per-review) + `CompetitorUrl.overallAnalyses["reviews"]` (per-competitor)).
  - `src/lib/competition-scraping/handlers/review-analysis-update.ts` (PATCH handler; Fix Session B EXTENDS to ACCEPT PER_REVIEW edits — currently rejected at line 181-193).
  - `src/lib/competition-scraping/handlers/review-analysis-list.ts` (NEW handler shipped in Fix Session A FF2; Fix Session B reuses for persistence-on-refresh sanity check post-schema-change).
  - `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/orchestrator.ts:1254-1275` — `saveReview` adapter; Fix Session B wires the title through to `createCapturedReview` per Q3 schema gap carry-over.
  - `prisma/schema.prisma` — read the `CompetitorUrl` + `CapturedReview` models; Fix Session B adds `CapturedReview.title String?` (additive, nullable, zero data loss) + fires `npx prisma db push` mid-session (Schema-change-in-flight FLIPS NO → YES at that point).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (1-2 gates planned by default for Fix Session B — schema change + write-back UI both warrant a Phase 3 deploy-decision picker after Phase 2 lands) + Rule 14f (forced-picker mechanics — expect ~3-5 to fire: Q9 confirmation + Q3 schema-confirmation + Phase 2 build-scope picker + Phase 3 deploy-now-vs-exit picker + §4 Step 1c next-task picker at session-end) + Rule 18 (§A frozen + §B append-only; today's §B 2026-05-29 is the latest entry to anchor cross-references against) + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — PLOS-side UI + src/lib + schema-change-in-flight FLIPS NO → YES mid-session at `prisma db push`) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + Rule 31 (read §3 of the spec doc at session start via the SessionStart hook) + §4 Step 4b extended template.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31 (with NEW 2026-05-28-b mechanical read-guarantee + audit-shipped-state mandate sub-sections), the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block listing the polish-item-specs files; read §3 of each at session start as part of your pre-build read sequence. ALSO audit any shipped sister surfaces on the in-flight P-49 W5 workstream against the master verbatim spec at session start per the audit-shipped-state mandate.**

**Session goal:** P-49 W5 Reviews Analysis Table Fix Session B on `workflow-2-competition-scraping` per `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session B" sub-section — (1) render NEW "Overall Analysis — Captured Reviews" box on URL detail page using existing `OverallAnalysisBox` pattern backed by `CompetitorUrl.overallAnalyses["reviews"]`; (2) wire per-review summary write-back to `CapturedReview.analysis` (D-9 fix); (3) wire per-competitor bulleted write-back to `CompetitorUrl.overallAnalyses["reviews"]` — append-merge at bottom (D-10 fix; bulleted half); (4) extend `review-analysis-update.ts` PATCH endpoint to ACCEPT PER_REVIEW edits + wire UI Edit button on per-review summary cells (D-11 fix; Q9 confirmation at session start); (5) **Q3 schema gap carry-over from Fix Session A**: add `CapturedReview.title String?` column (additive, nullable, zero data loss) + wire `orchestrator.ts:1254-1275` `saveReview` adapter to pass title through + extend wire shape + extend PATCH endpoint to accept title + implement title+description display-time merge on review-row body cell of the Reviews Analysis Table; (6) re-verify per-review summaries persistence-on-refresh works correctly post-schema-change; (7) /scoreboard + deploy decision Rule 14f. **Schema-change-in-flight = YES entry state** (Q3 schema migration carry-over). 1-2 Rule 9 deploy gates planned.

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

**Phase 1 (Q3 + Q9 resolutions + audit-shipped-state confirmation — likely 5-20 min):**

Per the audit-shipped-state mandate, confirm at session start that the `/competitor-reviews-analysis` page on the live site still matches the Fix Session A end-state (the 5-toggle nav + 10-column layout + show/hide + click-to-edit + Column 8 plain-text count + Column 8/9 expand-collapse cells with state-aware text + persistence-on-refresh + drag-to-resize + sticky header + viewport-floating scrollbar — all working). Spot-check by loading the page on vklf.com + flipping a checkbox + dragging a column edge + clicking a URL-row cell + clicking Column 8 cell to expand reviews. If anything has regressed out-of-band, surface to director.

Ask director Q9 (per-review summary Edit UI pattern — same Edit-button pattern as banner row by default; pick alternative if director prefers something different). Confirm Q3 schema-change shape (additive nullable `CapturedReview.title String?` column; expect zero data loss; `npx prisma db push` fires mid-session). Update `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 (Fix Session B sub-section) to reflect the answers + remove resolved questions from §4.

**Phase 2 (build — Fix Session B scope; fires a Rule 14f scope picker first):**

Fire a Rule 14f forced-picker after Phase 1 closes:

- **Option A (Recommended):** Proceed to Phase 2 (build Fix Session B scope per §3 — 6 sub-items listed above; YES schema change for Q3 carry-over; NO new AI flows; NO Excel; NO drag-to-reorder rows).
- **Option B:** Pause + end session after Phase 1 closes; defer Phase 2 to next session.
- **Option C (escape-hatch):** Director writes free-text directive shaping the scope differently.

If director picks Option A, build the Fix Session B scope per the consolidated §3 spec. Test coverage: ship the same Pattern as Fix Session A (positive tests pinning the new write-back paths + new "Overall Analysis — Captured Reviews" box render + per-review Edit affordance + title display-time merge; negative tests asserting unrelated surfaces unchanged).

**Phase 3 (deploy decision):**

If Phase 2 lands + scoreboard-verifies, fire a Rule 14f deploy-now-vs-exit picker. If director picks deploy, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on:

- the new "Overall Analysis — Captured Reviews" box rendering correctly on URL detail page;
- per-review summary write-back showing up in the "Your Analysis" box on URL detail page;
- per-competitor bulleted write-back showing up appended at the bottom of the "Overall Analysis — Captured Reviews" box on URL detail page;
- per-review Edit affordance on review-row summary cells working;
- title+description display-time merge rendering correctly on the review-row body cell (after `CapturedReview.title` schema column lands).

If Phase 4 surfaces redirects, bundle multi-redirect Phase 4 issues into single FFs per the canonical "Same-day Phase 4 multi-redirect bundling Pattern" — today's 4-FF / 18-redirect ceiling is the NEW RECORD; aim for fewer (the schema-change-in-flight surface is more sensitive than UI-only changes).

**Scoreboard targets** (entry baselines = today's Fix Session A exit baselines):

- Root tsc clean (UNCHANGED)
- Extension tsc clean (UNCHANGED)
- Extension `npm test` = 910/910 (UNCHANGED — Fix Session B is PLOS-side only; no extension changes)
- src/lib `node:test` ≥ 984 (entry 984; expect +N for new write-back tests + per-review Edit endpoint tests + title schema handling tests; rough estimate +10-20)
- `npm run build` = 68 routes UNCHANGED (no new routes in Fix Session B; the PATCH endpoint extension reuses the existing `[analysisId]` route)
- Check 6 Playwright SKIPPED per Rule 27 standing precedent (BUILD/DEPLOY session)

**Deploy mechanics:** 1-2 Rule 9 deploy gates planned by default for this session (1 if Phase 2 + Phase 3 deploy fires; +N for FF cycles after Phase 4). If deploy fires, expect the standard 3-push pattern per ff-merge (workflow-2 push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`; if fix-forwards needed, bundle multi-redirect Phase 4 issues into single FFs.

**Schema-change-in-flight flag:** **YES entry** (Q3 schema migration carry-over from Fix Session A — additive only; `CapturedReview.title String?` nullable; zero data loss). FLIPPED YES → NO at deploy push completion per the canonical schema-change-ships-to-production transition.

**Group A docs to update at session end** (7-doc bundle assuming no new rules or memory files): ROADMAP header bump + P-49 polish-backlog entry status update (Fix Session B outcome + cumulative Fix-Session-A-B deploy commit hashes) + CHAT_REGISTRY header bump (174th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header + 1 NEW §Entry capturing Fix Session B outcome + HANDOFF_PROTOCOL header bump only + CLAUDE_CODE_STARTER header bump only + NEXT_SESSION full rewrite for next session (likely Fix Session C).

**Group B docs to update at session end:** NEW §B 2026-05-30 (or session-letter date) entry in `docs/REVIEWS_PHASE_2_DESIGN.md` (FIFTEENTH build/deploy-session §B entry per Rule 18; SEVENTH W5 entry). UPDATE `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §2 + §3 + §4 in real-time during the session (any redirects append to §2 + update §3 + resolve §4 items as answered). UPDATE `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3 pointer table if the Reviews Analysis Table page status flips further toward ✅ (Fix Session B closes D-8 fully + D-9 + D-10 bulleted half + D-11 + Q3 schema gap; Fix Session C remaining to close D-6 drag-to-reorder + D-7 Excel + D-10 non-bulleted half + the new per-competitor non-bulleted AI flow).

**Standing carry-overs from this session:**

- **Q3 schema gap** (additive nullable `CapturedReview.title String?` column + orchestrator wire-up + PATCH endpoint extension + display-time merge) — resolved at start of Fix Session B (THIS upcoming session).
- **Q9** (per-review summary Edit UI pattern — same Edit-button as banner row?) — resolved at start of Fix Session B (THIS upcoming session).
- **Q8** (flow-value naming convention for NEW per-competitor non-bulleted) — resolved at start of Fix Session C, NOT this session.
- **Category page Block 1 planning resume** (6 questions from 2026-05-28's NEXT_SESSION pointer) — STILL PENDING; pushed back behind Fix Sessions B + C; will resume after Fix Session C closes.

---

## Alternate next-session candidates if director shifts priorities at session start

- **(A.108.alt1) P-49 W5 Reviews Analysis Table Fix Session B** (current PICK — pre-loaded above).
- **(A.108.alt2) P-49 W5 Reviews Analysis Table Fix Session C** (per `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session C" sub-section — NEW non-bulleted flow + Excel + drag + schema). Heaviest of the 3 Fix Sessions; would require Phase 1 to resolve Q8 (flow naming) before code starts. Skipping Fix Session B + jumping to Fix Session C would leave D-8/D-9/D-10/D-11 + Q3 carry-over open — Fix B is the natural next step.
- **(A.108.alt3) P-49 W5 Category page Block 1 planning resume** (2026-05-28's plan; pushed back behind Fix Sessions but still queued — answer 6 open questions from `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4 + open Block 2 schema planning). Useful if director wants to keep both Reviews Analysis Table fix work AND Category page planning moving in parallel.
- **(A.108.alt4) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`). Running tally ~31-33+ reproductions (~4 today); would mechanically prevent the entire bug class. Useful if director wants a quick palate-cleanser session between heavier P-49 work.
- **(A.108.alt5) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files). Director already approved scope; would also be a quick palate-cleanser session.
