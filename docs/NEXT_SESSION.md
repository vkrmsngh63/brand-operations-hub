# Next session

**Written:** 2026-05-28-b (`session_2026-05-28-b_p49-w5-reviews-phase-2-master-spec-backfill-and-page-2-divergence-fix-plan` — W#2 polish P-49 W5 Reviews Phase 2 master-spec-backfill + page-2 (Competitor Reviews Analysis Table) divergence-discovery + 3-session corrective-fix plan locked — **PURE-PLANNING + DOC-ONLY SESSION** on `workflow-2-competition-scraping` — NO code, NO builds, NO deploys this session. Session opened per yesterday's NEXT_SESSION.md pointer scoping "P-49 W5 corrective rebuild Block 1 planning resume + (likely) Session 1 Category page scaffold"; director redirected immediately at session-start with a MAJOR scope correction NOT covered by the launch prompt — the previously-shipped `/competitor-reviews-analysis` page (W5 Sessions 2 + 3, deployed 2026-05-27 + 2026-05-27-c) has multiple divergences from director's original verbatim spec. Director re-pasted the FULL original instruction set covering all 3 Reviews Phase 2 pages + Claude executed code-truth audit producing 12 divergence findings (D-1 through D-12). Director picked Rule 14f Option A "Planning + spec backfill only today. NO code today." 7 clarifying questions answered Yes-to-Recommended (7/7 = 100%) via 2 AskUserQuestion batches; 3 NEW open questions emerged (Q8 / Q9 / Q10). NEW master spec doc `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` + NEW backfilled Reviews Analysis Table spec doc `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` (with §3 carrying the 3-session corrective-fix plan Fix A + Fix B + Fix C) + UPDATE Category page §5 + UPDATE Type page §5 + UPDATE master spec §4 + UPDATE ROADMAP P-49 entry + NEW Rule 31 sub-sections in `docs/HANDOFF_PROTOCOL.md` ("Mechanical read-guarantee" + "Audit-shipped-state mandate for in-flight workstreams") + EXTEND `.claude/hooks/inject-next-session-pointer.sh` to auto-detect `P-NN` token references in the pointer content + emit a "🔵 RULE 31 MANDATORY READ — POLISH-ITEM SPEC DOCS" block listing every matching spec file. 2 NEW reusable PATTERNS memorialized. **Closes (a.106) RECOMMENDED-NEXT** = P-49 W5 corrective rebuild Block 1 planning resume — REDIRECTED to Reviews Analysis Table master-spec-backfill + page-2 divergence-discovery + 3-session corrective-fix plan locked. **Opens (a.107) RECOMMENDED-NEXT = P-49 W5 Reviews Analysis Table Fix Session A** on `workflow-2-competition-scraping` per `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session A" sub-section.

---

## What we did this session (in plain terms)

Today's session started with a clean launch prompt from yesterday's W5 Session 4 (the scope-misread rollback + corrective-planning session). The prompt directed Claude to pick up Block 1 planning for the Category-page corrective rebuild (answer 6 open questions from the Category-page spec doc's §4) and probably build Session 1 of the corrective rebuild (Category page scaffold). Claude completed the start-of-session routine (branch verify on `workflow-2-competition-scraping`, read all Group A docs + Rule 31 §3 of the Category + Type spec docs, ran a drift check, produced the Step 7b plain-terms summary) and awaited director's go-ahead.

**Director redirected at session-start with a MAJOR scope correction NOT covered by the launch prompt.** The previously-shipped Competitor Reviews Analysis Table page (the page at `/competitor-reviews-analysis` deployed 2026-05-27 + 2026-05-27-c through W5 Sessions 2 + 3) has multiple divergences from director's original verbatim spec. Director re-pasted the FULL original instruction set covering all 3 Reviews Phase 2 pages — the Competitor Reviews Analysis Table page (already shipped + diverged), the Reviews Analysis By Competitor Category Table page (yesterday's wrong-spec-then-reverted target; queued for corrective rebuild Sessions 1-3 from yesterday), the Reviews Analysis By Competitor Type Table page (queued for corrective rebuild Sessions 4-5 from yesterday) — and asked Claude to (a) audit shipped state vs verbatim spec, (b) surface clarifying questions, (c) propose prevention mechanism, (d) propose forward path.

**Claude executed the code-truth audit and surfaced 12 divergence findings (D-1 through D-12)** on the shipped Reviews Analysis Table page: toggle labels truncated; 6 of 10 URL-row columns missing; 3 of 4 top-of-page buttons missing (no non-bulleted Auto-create button, no Export Table button); no click-to-edit on URL-row data cells; no show/hide column checkboxes; no drag-to-reorder; no Excel export; per-review summary persistence-on-refresh bug; no write-back to `CapturedReview.analysis` ("Your Analysis" box on URL detail); no write-back to `CompetitorUrl.overallAnalyses["reviews"]`; the "Overall Analysis — Captured Reviews" box itself not even rendered on URL detail page; per-review Edit affordance rejected as out-of-scope-for-now.

**Director picked Rule 14f Option A "Planning + spec backfill only today. NO code today."** over Option B (plan + scaffold + ship Phase 1 of one corrective fix today) and Option C (plan + ship a quick patch while planning the rest). Session became 100%-planning.

**7 clarifying questions answered Yes-to-Recommended (7/7 = 100%)** via 2 AskUserQuestion batches. Running cumulative across recent 10 sessions: 89/92 = 96.7% Yes-to-Recommended.

**Deliverables locked:**

1. **NEW master spec doc `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md`** carrying the FULL verbatim re-paste covering all 3 Reviews Phase 2 pages + the parent 4-option toggle + cross-cutting joint-discussion decisions. Per-page specs derive their §1 from this master.

2. **NEW backfilled per-page spec doc `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md`** for the already-shipped Reviews Analysis Table page with §1 verbatim director instructions + §2 carrying 4 chronological joint-discussion entries (2026-05-27 W5 Session 1.5 design lock decisions retroactively recorded + 2026-05-27-b W5 Session 2 ship decisions + 2026-05-27-c W5 Session 3 ship decisions + 2026-05-28-b today's divergence findings + clarifying-question answers) + §3 carrying the consolidated fix-spec with 5-option toggle + 10-column table + click-to-edit + drag-to-reorder + 4 buttons + AI-flow keep-mechanics + write-backs + persistence fixes + **3-session corrective-fix plan Fix A + Fix B + Fix C** + §4 carrying 3 NEW open questions Q8/Q9/Q10 (Q1-Q7 RESOLVED) + §5 cross-references.

3. **UPDATE Category page spec doc §5 + Type page spec doc §5** — added master spec doc cross-references.

4. **UPDATE master spec doc §4** — CQ-1 + CQ-7 RESOLVED via Q1/Q7 answers.

5. **UPDATE ROADMAP P-49 entry SPEC DOCS line** — added the 2 NEW spec docs to the cross-reference list.

6. **NEW Rule 31 sub-sections** in `docs/HANDOFF_PROTOCOL.md` — "Mechanical read-guarantee (NEW 2026-05-28-b)" + "Audit-shipped-state mandate for in-flight workstreams (NEW 2026-05-28-b)". Both inline under existing Rule 31 (no new top-level rule number — these are Rule 31 extensions).

7. **EXTEND `.claude/hooks/inject-next-session-pointer.sh`** — auto-detect `P-NN` token references in the resume-flow pointer content + emit a "🔵 RULE 31 MANDATORY READ — POLISH-ITEM SPEC DOCS (auto-detected from P-NN references in the pointer above)" block listing every matching `docs/polish-item-specs/P-NN-*.md` file. **Tested working:** for today's pointer content (which mentions P-43, P-46, P-49, P-50, P-51, etc.) the hook emits all 5 matching files (`P-49-W5-reviews-phase-2-master-spec.md` + `P-49-W5-S2-S3-competitor-reviews-analysis.md` + `P-49-W5-S4-category-page.md` + `P-49-W5-S5-type-page.md` + `P-51-comprehensive-analysis-ai-summary.md`).

**2 NEW reusable PATTERNS memorialized in CORRECTIONS_LOG §Entry 2026-05-28-b:**

- **"Master-spec-plus-per-page-specs structure for multi-page polish items"** — when a polish item covers N pages with shared cross-cutting decisions, create ONE master spec doc + N per-page spec docs. Canonical reference: today's master + 3 per-page specs.
- **"Backfill spec doc for already-shipped pre-Rule-31 polish items as discovery surfaces divergence"** — when Rule 31 establishes mid-arc, already-shipped surfaces may have spec gaps; backfill at the moment divergence is surfaced. Canonical reference: today's Reviews Analysis Table spec backfill.

**3-session corrective-fix plan locked** (full sub-bullet decomposition in the new spec doc's §3):

- **Fix Session A** — Toggle rename + URL-row column population + UI fixes. NO write-back work, NO new AI flow, NO Excel export, NO drag. Smallest verifiable unit. (THIS upcoming session.)
- **Fix Session B** — Write-back to URL detail page + per-review edit + persistence-on-refresh bug. NO new AI flows, NO Excel, NO drag.
- **Fix Session C** — NEW per-competitor non-bulleted flow + Auto-create non-bulleted button + Excel Export + Drag-to-reorder + 1 NEW schema column.

After Fix Sessions A + B + C complete, Category page Sessions 1-3 + Type page Sessions 4-5 from yesterday's 5-session corrective rebuild plan resume.

**Numbers:**

- **THREE Rule 14f forced-pickers fired this session — 8/8 = 100% Yes-to-Recommended** (1 session-shape picker for Option A planning-only Recommended + 2 AskUserQuestion clarifying-question batches comprising 4 + 3 = 7 questions). Running cumulative across recent 10 sessions: 89/92 = 96.7%.
- **ZERO Rule 9 deploy gates fired** (pure-planning + doc-only session).
- **3 pushes total** (1 end-of-session doc-batch push to workflow-2 + 1 ff-merge to main + push main + 1 ping-pong workflow-2 — standard 3-push pattern; the ff-merge to main is operationally clean since it touches only docs + 1 hook + Rule 31 sub-section additions, no Vercel-visible code surface changes).
- **Schema-change-in-flight = NO entire session** (entry NO + no schema work + corrective-fix plan introduces 1 new column in Fix Session C, not this session + exit NO).
- **/scoreboard NOT RUN this session** — pure-doc work; Check 6 SKIPPED per Rule 27 standing precedent for pure-doc sessions; baselines UNCHANGED from W5 Session 4: root tsc clean + extension tsc clean + extension `npm test` = 910/910 + src/lib `node:test` = 950/950 + `npm run build` = 67 routes.

## What's pending from prior session — 3 OPEN QUESTIONS (Q8 / Q9 / Q10)

These 3 questions are the resume points for the upcoming Fix Sessions A + B + C. They are captured verbatim in `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §4.

- **Q10 — display format for the "N of M summarized" count on URL-row Column 8** — Plain text vs small badge / pill style vs clickable-to-expand. **Pick at start of Fix Session A planning (THIS upcoming session).** Default: plain text.
- **Q9 — per-review summary Edit UI: same Edit-button pattern as banner row?** Likely yes per Rule 14a Read-It-Back (the §1 spec line "All cells should be editable by clicking them" implies the same UX). Confirm at start of Fix Session B.
- **Q8 — per-batch endpoint flow-value naming convention for the NEW per-competitor non-bulleted flow** — Options: (a) `flow=per-competitor-nonbulleted` (mirrors existing `per-competitor-bulleted` shipped W5 Session 3); (b) `flow=per-product-nonbulleted` (matches enum level `PER_PRODUCT` for clarity). Decide at start of Fix Session C.

Also pending (pushed back behind Fix Sessions A + B + C):

- **Category page Block 1 planning resume** (6 open questions from yesterday's `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4 — Q-A Column 8 Stars semantics, Q-B Column 9 Reviews Summary data source + rendering, Q-C Column 11 non-bulleted, 1b-i first-row-carries-label visual treatment, 1b-ii drag handle placement, 1b-iii Uncategorized bucket placement). STILL PENDING; resume after Fix Session C closes.

## What we'll do next session (in plain terms)

Next session is **P-49 W5 Reviews Analysis Table Fix Session A** on the `workflow-2-competition-scraping` branch per (a.107). The session ID is TBD (a likely candidate: `session_2026-05-29_p49-w5-reviews-analysis-table-fix-session-a`).

**Recommended session shape (subject to director's pickers at session start):**

- **Phase 1 (planning Q10 resolution — likely 5-15 min):** answer Q10 (display format for the "N of M summarized" count on URL-row Column 8 — plain text default; pick pill / badge / clickable-to-expand if director prefers something richer). Update `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 to reflect the agreed answer + remove the resolved question from §4.
- **Phase 2 (build — likely 60-120 min):** code Fix Session A scope per `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session A" sub-section:
  1. Rename `CompetitionScrapingSurfaceNav.tsx` labels to spec verbatim (5 options per Q1 — preserving Comprehensive Analysis as 5th option).
  2. Expand the URL-row of the Reviews Analysis Table to all 10 spec columns left-to-right. Show Category / Type / Product Name / Results Rank / Competition Score / URL as own columns (currently merged into "Competitor / Product" or missing entirely).
  3. Implement title+description display-time merge on review-row body (Q3).
  4. Implement Column 8 "N of M summarized" count display on URL row (Q2 → B; format per Q10 resolved at Phase 1).
  5. Add `ColumnVisibilityBar` checkbox bar above the table for show/hide of the 10 columns (mirroring Competitor Content Table pattern).
  6. Add click-to-edit on URL-row cells 1-7 (Platform / Category / Type / Product Name / Results Rank / Competition Score / URL) propagating to `CompetitorUrl` columns via existing PATCH endpoint (Q6 → A).
  7. Add click-to-edit on review-row body / star / reviewer / date cells propagating to `CapturedReview` columns via existing PATCH endpoint (Q6 → A).
- **Phase 3 (deploy decision Rule 14f picker):** if Phase 2 lands + scoreboard-verifies, fire a Rule 14f deploy-now-vs-exit picker. If director picks deploy, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on the new column layout + show/hide checkboxes + click-to-edit on URL-row + review-row body merge + Column 8 count display.

**Director's pre-session homework (optional):**

- Answer to Q10 (display format for "N of M summarized" — plain text default, decide pill vs link if richer affordance preferred).
- Preference confirmation on the URL-row column ordering (10 columns left-to-right per §1 verbatim: Platform / Category / Type / Product Name / Results Rank / Competition Score / URL / Reviews Summary [Column 8] / Bulleted Comprehensive Reviews Analysis [Column 9] / non-bulleted [Column 10 blank in Fix Session A]).

**Session shape estimate:** ~60-120 minutes in-Claude depending on Phase 2 scope. BUILD session by default after Phase 1 closes. Phase 3 deploy decision is a Rule 14f picker. Schema-change-in-flight STAYS NO entire session (no schema work in Fix Session A; schema change comes in Fix Session C only). Pre-build joint-confirmation per `feedback_plan_output_shape_before_building.md` STILL FIRES on top of §3 of the spec doc, but the bar is now: confirm §3 is correct + complete for Fix Session A's scope, NOT re-derive the spec from scratch (the spec doc is the canonical source-of-truth per NEW Rule 31).

## What's still left in the total roadmap (in plain terms)

- **P-49 W#2 Reviews Phase 2 (IN-FLIGHT — CORRECTIVE FIX SESSIONS A + B + C + CORRECTIVE REBUILD Category Sessions 1-3 + Type Sessions 4-5)** — remaining work: 3 Fix Sessions on the Reviews Analysis Table page (Fix A this upcoming session + Fix B write-backs + per-review-edit + persistence + Fix C non-bulleted + Excel + drag + schema) + 5-session corrective rebuild from yesterday (Category Sessions 1-3 + Type Sessions 4-5) pushed back behind the Fix Sessions + Phase 4 verification per session + opportunistic polish. Estimate ~8-10 more sessions until P-49 W5 closes.
- **P-50 NEW Condition Pathology card** — small single-session UI addition (one card insertion in two card-array files); director already approved scope; slot in any future session or do standalone on `main`.
- **P-51 NEW per-Project competitive landscape AI summary on `/comprehensive-analysis` page** — slot AFTER P-49 closes (per director directive: P-51 is BETWEEN P-49 and P-50 in next-priority order); spec doc skeleton already in place; build session opens with Q&A per director's directive.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation to determine why every SCREEN_RECORDING webm is captured at ~6-7 fps actual rate; deferred from earlier sessions.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md` to permanently prevent the cwd-leak Pattern Class; running tally now **~27+** across recent sessions (UNCHANGED today since /scoreboard was not run). Strong empirical signal continues mounting; single-session fix would mechanically prevent this entire bug class.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority; re-evaluate after P-49 closes.
- **W#2 graduation** — deferred until P-49 closes at the workstream-by-workstream level.
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started.
- **Infrastructure TODOs** — Supabase file-size offline check (separate operational concern; not blocking workflows).

---

## Status of last session

**P-49 W5 Reviews Phase 2 master-spec-backfill + page-2 (Competitor Reviews Analysis Table) divergence-discovery + 3-session corrective-fix plan locked** on `workflow-2-competition-scraping`. **PURE-PLANNING + DOC-ONLY SESSION:** NO code, NO builds, NO deploys this session. ZERO Rule 9 deploy gates fired. ZERO schema changes. ZERO new routes.

**Session shape (PURE-PLANNING — 0 work commits + 1 doc-batch commit + 3 pushes):**

- 0 work commits.
- 1 PENDING: end-of-session doc-batch commit (this doc-batch agent's output) — carries 2 NEW spec docs + 2 MODIFIED spec docs (Category §5 + Type §5) + 5 MODIFIED Group A docs + 1 MODIFIED Group B doc (REVIEWS_PHASE_2_DESIGN.md §B 2026-05-28-b) + 1 MODIFIED operational file (`.claude/hooks/inject-next-session-pointer.sh`) + NEW Rule 31 sub-sections inline in HANDOFF_PROTOCOL.md.

**THREE Rule 14f forced-pickers fired this session — 8/8 = 100% Yes-to-Recommended:** (1) Session-shape picker (Option A planning-only Recommended); (2) 4-question AskUserQuestion clarifying-question batch (4/4 Yes-to-Recommended); (3) 3-question AskUserQuestion clarifying-question batch (3/3 Yes-to-Recommended). Running cumulative across recent 10 sessions = **89/92 = 96.7% Yes-to-Recommended**.

**ZERO Rule 9 deploy gates fired this session.**

**Schema-change-in-flight flag STAYS NO entire session** — entry NO + no schema work + exit NO; corrective-fix plan introduces 1 new column `CapturedReview.sortRankInReviewsTable` in Fix Session C (not this session).

**ZERO DEFERRED items at session end (Rule 26)** — 7 in-session tasks; all 7 completed cleanly.

**Baselines locked from this session:** UNCHANGED from W5 Session 4 (since no code shipped): root tsc clean + extension tsc clean + extension `npm test` = **910/910 UNCHANGED** + src/lib `node:test` = **950/950 UNCHANGED** + `npm run build` = **67 routes UNCHANGED**.

**ONE NEW HIGH-importance CORRECTIONS_LOG §Entry 2026-05-28-b** capturing the meta-pattern (even with Rule 31 established yesterday, today's session-start scoping narrowly followed the launch-prompt's Category-page focus without independently auditing the shipped Reviews Analysis Table page on the same workstream against the verbatim spec — a Rule 14a Read-It-Back gap at session-start scoping; prevention via NEW Rule 31 "Audit-shipped-state mandate for in-flight workstreams" sub-section) + 12-divergence finding on the shipped Reviews Analysis Table page + NEW Rule 31 extensions + 2 NEW reusable PATTERNS memorialized + the 3-session corrective-fix plan (Fix A + Fix B + Fix C) + 7-of-7 clarifying questions answered Yes-to-Recommended + 3 sub-observations.

**NEW Rule 31 sub-sections added inline to `docs/HANDOFF_PROTOCOL.md`** — "Mechanical read-guarantee (NEW 2026-05-28-b)" + "Audit-shipped-state mandate for in-flight workstreams (NEW 2026-05-28-b)".

**EXTENDED `.claude/hooks/inject-next-session-pointer.sh`** — auto-detect `P-NN` token references + emit Rule 31 mandatory-read block.

**NEW §B 2026-05-28-b entry appended to `docs/REVIEWS_PHASE_2_DESIGN.md`** (THIRTEENTH build/deploy-session §B entry per Rule 18; FIFTH W5 entry; SECOND W5 entry covering a non-deploy session).

**P-43 cwd-leak Pattern Class — ZERO reproductions this session** (pure-doc work; no /scoreboard or other parallel-Bash runs). Running tally stays at **~27+** across recent sessions.

**FIFTIETH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-49 W5 Reviews Analysis Table Fix Session A begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping` and pre-load context. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry** (after this session's end-of-session doc-batch lands + the standard 3-push ping-pong sync fires): `workflow-2-competition-scraping` **even with `origin/main`** — both branches at the same SHA = the post-doc-batch SHA after ff-merge. Verify with `git log main..HEAD --oneline` showing **0 commits ahead** at session entry. If shown as N>0 commits ahead, the doc-batch may not have ff-merged — surface to director.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the 5 polish-item-specs files since this NEXT_SESSION.md references P-43 + P-46 + P-49 + P-50 + P-51; Claude reads all 5 §3 sections as part of the start-of-session routine):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (NEW mechanical read-guarantee + audit-shipped-state mandate as of 2026-05-28-b) — the protocol mandate extensions this session memorializes.
- **`docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 end-to-end** (THE source-of-truth for Fix Session A scope — read the "Fix Session A" sub-section in particular) + §4 (Q8 / Q9 / Q10 open questions; **Q10 directly relevant to Fix Session A** — pick at session-start planning).
- Master spec doc `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` (skim §3 pointer table for context; §1 verbatim only if §2 / §3 of the per-page spec needs verification).
- `docs/polish-item-specs/P-49-W5-S4-category-page.md` §3 (the canonical reference for Category page Sessions 1-3 of the corrective rebuild — pushed back behind Fix Sessions A + B + C but useful background context).
- `docs/polish-item-specs/P-49-W5-S5-type-page.md` §3 (the canonical reference for Type page Sessions 4-5 of the corrective rebuild — also pushed back).
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-28-b (THE canonical entry for the divergence + fix plan; verifies the per-page spec hasn't drifted) + §B 2026-05-28 (yesterday's scope-misread rollback + 5-session corrective rebuild plan) + §B 2026-05-27-c (W5 Session 3 Per-Competitor bulleted — the v3 critique-only theme-emergent prompt + PATCH endpoint architecture PRESERVED in the corrective fix) + §B 2026-05-27-b (W5 Session 2 per-batch endpoint architecture PRESERVED) + §B 2026-05-27 (W5 Session 1.5 design lock; partially superseded by the 3-session corrective-fix plan on the Reviews Analysis Table page surface).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-28-b (THE meta-pattern entry from this session — 12-divergence finding + NEW Rule 31 extensions + 2 NEW reusable PATTERNS + 3-session corrective-fix plan) + §Entry 2026-05-28 (yesterday's scope-misread incident + NEW Rule 31).
- `docs/ROADMAP.md` lines 1-30 (header + recent session sequence) + the **P-49 polish-backlog entry** (Status: "🟢 IN-FLIGHT — CORRECTIVE FIX SESSIONS A + B + C + CORRECTIVE REBUILD Category Sessions 1-3 + Type Sessions 4-5" with cross-reference to the 4 P-49 spec docs).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - `feedback_plan_output_shape_before_building.md` — the related procedural memory; Rule 31 + the spec-doc mechanism + the mechanical read-guarantee + the audit-shipped-state mandate are the structural backstops. STILL FIRES at session start on top of §3 of the spec doc, but the bar is now: confirm §3 is correct + complete for Fix Session A's scope.
  - `feedback_browser_first_ai_with_server_migration.md` — the default-to-browser-first AI directive; PARTIALLY SUPERSEDED for the Reviews Analysis Table page's existing AI flows + the Category + Type aggregation flows per director's verbatim server-side spec (the rule's default-to-browser-first guidance still applies for NEW AI batch flows outside the corrective-fix scope).
  - `feedback_recommendation_style.md` + `feedback_default_to_recommendation.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_deferred_items_registry.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md`.
- **W5 Sessions 2 + 3 shipped reference files** (the canonical reference implementation for the per-batch endpoint architecture + the v3 critique-only theme-emergent prompt + the PATCH endpoint — all PRESERVED across the corrective fix):
  - `src/app/projects/[projectId]/competition-scraping/competitor-reviews-analysis/page.tsx` — Table 2 page; Fix Session A extends this with the 10-column URL row + show/hide + click-to-edit + Column 8 count display + title+description display-time merge.
  - `src/app/projects/[projectId]/competition-scraping/components/CompetitionScrapingSurfaceNav.tsx` — 4-option toggle; Fix Session A renames to 5 spec verbatim labels.
  - `src/app/projects/[projectId]/competition-scraping/components/ColumnVisibilityBar.tsx` + `InlineCells.tsx` — canonical Patterns for column show/hide + click-to-edit; Fix Session A mirrors these.
  - `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` (per-batch handler with flow-dispatch branches; PRESERVED in Fix Session A; extended in Fix Session C with new flow values).
  - `src/lib/competition-scraping/handlers/review-analysis-update.ts` (PATCH handler; Fix Session A reuses this for cell-level edits via Edit affordance; Fix Session B extends for per-review Edit).
  - `prisma/schema.prisma` — read the `CompetitorUrl` + `CapturedReview` models to confirm column names for Fix Session A click-to-edit propagation (Fix Session A does NOT add new schema columns; Fix Session C does).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (0-1 gates planned by default if Phase 2 lands + Phase 3 deploy-decision picker fires Yes) + Rule 14f (forced-picker mechanics — expect ~3-5 to fire this session: Q10 resolution + Phase 2 build-scope picker + Phase 3 deploy-now-vs-exit picker + §4 Step 1c next-task picker at session-end) + Rule 18 (§A frozen + §B append-only; today's §B 2026-05-28-b is the latest entry to anchor cross-references against) + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — PLOS-side UI + src/lib + schema-change-in-flight STAYS NO at session entry) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + Rule 31 (NEW sub-sections this session — Mechanical read-guarantee + Audit-shipped-state mandate; reads §3 of the spec doc at session start via the SessionStart hook) + §4 Step 4b extended template.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per NEW Rule 31 (with NEW 2026-05-28-b mechanical read-guarantee + audit-shipped-state mandate sub-sections), the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block listing the 5 polish-item-specs files; read §3 of each at session start as part of your pre-build read sequence. ALSO audit any shipped sister surfaces on the in-flight P-49 W5 workstream against the master verbatim spec at session start per the NEW audit-shipped-state mandate.**

**Session goal:** P-49 W5 Reviews Analysis Table Fix Session A on `workflow-2-competition-scraping` per `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session A" sub-section — toggle rename to 5 options (4 verbatim + Comprehensive Analysis as 5th) + URL-row column population (10 columns left-to-right per §1 verbatim: Platform / Category / Type / Product Name / Results Rank / Competition Score / URL / Reviews Summary / Bulleted Comprehensive Reviews Analysis / non-bulleted) + title+description display-time merge on review-row body + Column 8 "N of M summarized" count display on URL row + ColumnVisibilityBar with show/hide for the 10 columns (mirror Competitor Content Table pattern) + click-to-edit on URL-row cells 1-7 propagating to `CompetitorUrl` columns (single source of truth via existing PATCH endpoint) + click-to-edit on review-row body / star / reviewer / date cells propagating to `CapturedReview` columns (single source of truth via existing PATCH endpoint). NO drag, NO new AI flows, NO write-backs, NO Excel. BUILD session by default; 0-1 Rule 9 deploy gates planned (1 if session lands + Phase 3 deploy picker fires Yes).

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

**Phase 1 (Q10 resolution + audit-shipped-state confirmation — likely 5-20 min):**

Per the NEW audit-shipped-state mandate, confirm at session start that the `/competitor-reviews-analysis` page on the live site still matches the 12-divergence-finding state documented in `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §2 (verify D-1 through D-12 still apply — they should, since no code shipped between this NEXT_SESSION write and the next session start). If any divergence has been resolved out-of-band, surface to director.

Ask director Q10 (display format for the "N of M summarized" count cell on URL-row Column 8) — default to plain text per the spec doc; pick small badge / pill OR clickable-to-expand if director prefers something richer. Update `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 (Fix Session A sub-section) to reflect the answer + remove Q10 from §4.

**Phase 2 (build — Fix Session A scope; fires a Rule 14f scope picker first):**

Fire a Rule 14f forced-picker after Phase 1 closes:

- **Option A (Recommended):** Proceed to Phase 2 (build Fix Session A scope per §3 — 7 sub-items listed above; NO drag, NO new AI flows, NO write-backs, NO Excel; smallest verifiable unit).
- **Option B:** Pause + end session after Phase 1 closes; defer Phase 2 to next session.
- **Option C (escape-hatch):** Director writes free-text directive shaping the scope differently.

If director picks Option A, build the Fix Session A scope per the consolidated §3 spec. Test coverage: ship the same Pattern as W5 Sessions 2 + 3 (positive test pinning the column shape + click-to-edit propagation + Column 8 count display; negative test asserting unrelated surfaces unchanged).

**Phase 3 (deploy decision):**

If Phase 2 lands + scoreboard-verifies, fire a Rule 14f deploy-now-vs-exit picker. If director picks deploy, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on the new column layout + show/hide checkboxes + click-to-edit on URL-row cells 1-7 + click-to-edit on review-row body / star / reviewer / date cells + review-row body title+description display-time merge + Column 8 "N of M summarized" count display. If Phase 4 surfaces redirects, bundle multi-redirect Phase 4 issues into single FFs per the canonical "Same-day Phase 4 multi-redirect bundling Pattern" from CORRECTIONS_LOG §Entry 2026-05-27-c.

**Scoreboard targets** (entry baselines = today's W5 Session 4 baselines = W5 Session 3 exit baselines):

- Root tsc clean (UNCHANGED)
- Extension tsc clean (UNCHANGED)
- Extension `npm test` = 910/910 (UNCHANGED — Fix Session A is PLOS-side only; no extension changes)
- src/lib `node:test` ≥ 950 (entry 950; expect +N for new column-population tests + click-to-edit tests + Column 8 count display tests; rough estimate +5-15)
- `npm run build` = 67 routes UNCHANGED (no new routes in Fix Session A; the Category + Type pages don't ship in Fix sessions)
- Check 6 Playwright SKIPPED per Rule 27 standing precedent (BUILD session by default)

**Deploy mechanics:** 0-1 Rule 9 deploy gates planned by default for this session (1 if Phase 2 + Phase 3 deploy fires; 0 if session pauses after Phase 1 per Phase 2 Option B). If deploy fires, expect the standard 3-push pattern (workflow-2 push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`; if fix-forwards needed, bundle multi-redirect Phase 4 issues into single FFs.

**Schema-change-in-flight flag:** NO entry, NO exit (no schema work in Fix Session A; schema change comes in Fix Session C only).

**Group A docs to update at session end** (7-doc bundle assuming no new rules or memory files): ROADMAP header bump + P-49 polish-backlog entry status update (Fix Session A outcome) + CHAT_REGISTRY header bump (173rd session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header + 1 NEW §Entry capturing Fix Session A outcome + HANDOFF_PROTOCOL header bump only + CLAUDE_CODE_STARTER header bump only + NEXT_SESSION full rewrite for next session (likely Fix Session B).

**Group B docs to update at session end:** NEW §B 2026-05-29 entry in `docs/REVIEWS_PHASE_2_DESIGN.md` (FOURTEENTH build/deploy-session §B entry per Rule 18; SIXTH W5 entry). UPDATE `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §2 + §3 + §4 in real-time during the session (any redirects append to §2 + update §3 + resolve §4 items as answered).

**Standing carry-overs from this session:**

- **Q8** (flow-value naming convention for NEW per-competitor non-bulleted) — resolved at start of Fix Session C, NOT this session.
- **Q9** (per-review summary Edit UI pattern) — resolved at start of Fix Session B, NOT this session.
- **Q10** (display format for "N of M summarized" count) — resolved at start of Fix Session A (THIS upcoming session).
- **Category page Block 1 planning resume** (6 questions from 2026-05-28's NEXT_SESSION pointer) — STILL PENDING; pushed back behind Fix Sessions A + B + C; will resume after Fix Session C closes.

---

## Alternate next-session candidates if director shifts priorities at session start

- **(A.107.alt1) P-49 W5 Reviews Analysis Table Fix Session A** (current PICK — pre-loaded above).
- **(A.107.alt2) P-49 W5 Reviews Analysis Table Fix Session B** (per `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session B" sub-section — write-backs + per-review edit + persistence-on-refresh bug). Useful if director wants to ship the write-back surfaces first so the cross-page data plumbing exists before the URL-row layout fix.
- **(A.107.alt3) P-49 W5 Reviews Analysis Table Fix Session C** (per `docs/polish-item-specs/P-49-W5-S2-S3-competitor-reviews-analysis.md` §3 "Fix Session C" sub-section — NEW non-bulleted flow + Excel + drag + schema). Heaviest of the 3 Fix Sessions; would require Phase 1 to resolve Q8 (flow naming) before code starts.
- **(A.107.alt4) P-49 W5 Category page Block 1 planning resume** (yesterday's plan; pushed back behind Fix Sessions but still queued — answer 6 open questions from `docs/polish-item-specs/P-49-W5-S4-category-page.md` §4 + open Block 2 schema planning). Useful if director wants to keep both Reviews Analysis Table fix work AND Category page planning moving in parallel.
- **(A.107.alt5) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`). Running tally ~27+ reproductions; would mechanically prevent the entire bug class. Useful if director wants a quick palate-cleanser session between heavier P-49 work.
- **(A.107.alt6) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files). Director already approved scope; would also be a quick palate-cleanser session.
