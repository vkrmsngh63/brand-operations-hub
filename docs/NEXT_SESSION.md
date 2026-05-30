# Next session

**Written:** 2026-05-30-d (`session_2026-05-30-d` — W#2 polish P-49 W5 Category page Session 2 FINISH — ✅ DEPLOYED-AND-VERIFIED 2026-05-30-d end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` (TWO deploys, director Phase 4 PASS on both; `main` went `bdec02e → e2030e8 → c641b3d`). Deploy 1 (`e2030e8`) = the NEW "Source Reviews" column rendering, deployed TOGETHER with the previously-held-back Category Session 2 backend+frontend (`d1659d7` + `fb772ad`) + last session's doc-batch (`fbd318f`) — so the WHOLE Category Session 2 feature went live as one unit. Deploy 2 (`c641b3d`) = 4 director Phase-4 adjustments. NEW reusable PATTERN: **"Per-row alignment across two adjacent table columns via a multi-`<tr>` banner block with rowSpan'd flanking cells."** **Closes (a.117) RECOMMENDED-NEXT** — Category page Session 2 FINISH; the Category page is now essentially CLOSED. **Opens (a.118) RECOMMENDED-NEXT = P-49 W5 Type page Sessions 4-5** on `workflow-2-competition-scraping`.

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session correctly stamped `2026-05-30-d` (the FOURTH session of 2026-05-30 — first = `session_2026-05-30` no-suffix scaffold; second = `session_2026-05-30-b` interactive batch; third = `session_2026-05-30-c` Category Session 2 build + FU-3 fix). Do NOT regress the date or invent a different suffix ahead of the harness. Future sessions keep trusting the harness `currentDate`.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** (a.118) / the Type page Sessions 4-5 is W#2-only Reviews Phase 2 work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **BRANCH STATE — back to NORMAL this time.** Unlike last session, the Category code did NOT stay off main — both this session's deploys (`e2030e8` + `c641b3d`) AND the previously-held-back commits (`d1659d7` + `fb772ad` + `fbd318f`) all landed on main in Deploy 1's ff-merge. `main` and `workflow-2-competition-scraping` are BOTH at `c641b3d` plus this session's end-of-session doc-batch SHA (which the parent ff-merges to main too, per the standard 3-push pattern). Expect `git log origin/main..HEAD` to show only the doc-batch commit (or 0 after the parent's ff-merge) at next session entry.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = likely YES at entry next session.** The Type page (Sessions 4-5) needs its OWN per-page layout-memory column `UserTablePreferences.typeTableLayout Json?` mirroring the Category page's `categoryTableLayout` (additive nullable; `prisma db push`; zero data loss). Confirm the exact shape at that session's start. The two Type AI flows + the Source Reviews column reuse the existing `ReviewAnalysis` PER_TYPE storage (no schema change for those).

---

## What we did this session (in plain terms)

Two deploys this session, both verified live on vklf.com:

1. **Finished and shipped the "Source Reviews" column.** Last session we built the engine that figures out which individual reviews back each category bullet; this session we built the on-screen column that displays them and shipped the whole "by category" feature live. Now each category gets two AI summaries (a deduplicated bullet list + a plain-paragraph critique) AND, right beside each bulleted complaint, the exact individual reviews behind it — product name, star rating, review text, and a little link that jumps straight to that review. Your Phase 4 verdict: everything passed.

2. **Made 4 adjustments you asked for.** (1) The category name now sits at the TOP of its banner instead of the middle; (2) the plain-paragraph category summary no longer gets copied into each competitor's notes box — it lives only in the category column (you confirmed: the plain-paragraph COLUMN keeps its prose; we only removed the duplicate copy into the notes boxes; the Source Reviews column was never prose); (3) the two "Auto-create" buttons now have little hover tooltips that fade away after a few seconds; (4) each bulleted complaint now lines up on its own row right beside its source reviews (like the detail-page table), instead of being stacked in one cell.

**Numbers:**

- **TWO Rule 9 deploy gates — both Yes.** **ZERO other forced-pickers** (the Source Reviews design was already locked last session, so the build went under the default-to-recommendation path with a plain-terms description + your go-ahead). Running cumulative: **151/155 = 97.4%**.
- **~6 pushes total** (each deploy's ff-merge + ping-pong happened during the session; the end-of-session doc-batch push + ping-pong is pending — the parent handles it).
- **Schema-change-in-flight = NO the entire session** (the new column reads data that already exists; the write-back removal is a deletion).
- **Post-merge + post-build /scoreboard all GREEN at NEW LOCKED baselines:** root tsc clean + extension tsc clean + extension `npm test` = 910/910 UNCHANGED + src/lib `node:test` = **1182/1182** (+3 from 1179 — the Source Reviews resolution helper tests) + `npm run build` = **69 routes UNCHANGED** (reused existing endpoints — no new route); Check 6 Playwright SKIPPED per Rule 27.
- **NO extension zip this session** (no extension code changed).

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (P-49 entry) + `docs/polish-item-specs/P-49-W5-S5-type-page.md` §2/§3 + `docs/polish-item-specs/P-49-W5-S4-category-page.md` §2/§3 + `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §2/§3.

- **(a.118) P-49 W5 Type page Sessions 4-5** — NEXT SESSION; on `workflow-2-competition-scraping` (see below). Build the `Reviews Analysis By Competitor Type Table`, inheriting ALL Category behaviors + the Source Reviews column + the 4 adjustments, with type substituted for category.
- **(optional refinement) Category page banner — editable category name (rename the whole group)** — the banner name is a read-only label today; director may request making it editable. The Category page is otherwise CLOSED.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.

## What we'll do next session (in plain terms)

Next session is **P-49 W5 Type page Sessions 4-5** — the last remaining piece of the Reviews Phase 2 rebuild. In plain terms:

1. **Build the "Reviews Analysis By Competitor Type" page.** It's the twin of the Category page you just finished, but grouped by competitor TYPE instead of category. It inherits everything the Category page has — the table, the drag-to-reorder, the hide-with-restore, the Excel export, the two AI summaries, and the new Source Reviews column — just with "type" swapped in for "category."
2. **Apply the 4 adjustments from the start.** The Type page must be born with the 4 refinements you asked for this session (top-aligned label; no copying the plain-paragraph summary into competitor notes boxes; auto-fading button tooltips; the per-bullet row-aligned Source Reviews layout).
3. **Then deploy + verify.** Ship to live and verify in real Chrome on vklf.com (Phase 4).

After this, the entire P-49 W5 Reviews Phase 2 work closes.

## What's still left in the total roadmap (in plain terms)

- **P-49 W#2 Reviews Phase 2 (IN-FLIGHT — the Competitor Reviews Analysis Table page is CLOSED; the Category page is now essentially CLOSED [scaffold + polish + interactive batch + the two AI flows + the Source Reviews column + 4 adjustments all ✅ DEPLOYED]; only the Type page Sessions 4-5 remain)** — Estimate ~2 more sessions until P-49 W5 closes.
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED on `main`. TWO carry-overs OPEN: official Opus 4.8 pricing numbers + the deferred W#1 shared-list migration.
- **P-51 NEW per-Project competitive landscape AI summary on `/comprehensive-analysis` page** — slot AFTER P-49 closes (director directive: P-51 is BETWEEN P-49 and P-50 in next-priority order); spec skeleton in place; build session opens with Q&A.
- **P-50 NEW Condition Pathology card** — small single-session UI addition; director already approved scope; slot in any future session or do standalone on `main`.
- **P-48 Session 3 (Diagnostic #2 for screen-recording stutter)** — empirical instrumentation; deferred.
- **P-43 mechanical prevention small fix** — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`; running tally ~31-33+ (no notable new reproductions this session). Single-session fix.
- **P-26 below-fold scroll capture bugs** + **P-27 capture bugs #9 + #15** — LOW priority; re-evaluate after P-49 closes.
- **W#2 graduation** — deferred until P-49 closes (now one session away).
- **W#3-W#14 future workflows** — Therapeutic Strategy + the rest of the 14-workflow lineup; design phases not yet started.
- **Infrastructure TODOs** — Supabase pool sizing under AI-batch load + Supabase file-size offline check.

---

## Status of last session

**P-49 W5 Category page Session 2 FINISH — ✅ DEPLOYED-AND-VERIFIED 2026-05-30-d** end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`; director Phase 4 PASS on BOTH deploys; the whole Category Session 2 feature shipped as one unit. The Category page is now essentially CLOSED.

**Session shape (DEPLOY — 2 deploys + end-of-session doc-batch):**

- **Deploy 1 (`e2030e8`) — the Source Reviews column rendering** (NEW 14th column `catSourceReviews` read-only categoryLevel in `category-table-columns.ts` + NEW client-safe pure helper `buildCategorySourceReviewRows(categories, reviewsById)` in `reviews-traceability.ts` resolving each category bullet's cross-competitor reviewId-union → product + stars + merged title/body + urlId, +3 node:test + the page's global reviewId→meta map + the Source Reviews cell + a per-review anchor/scrollMarginTop/scroll-on-hash jump link in `UrlDetailContent.tsx` + the `category-table-columns.test.ts` registry assertions 13→14). **This deploy's ff-merge ALSO carried the previously-held-back `d1659d7` + `fb772ad` (Category Session 2 backend+frontend) + `fbd318f` (last session's doc-batch)** — they were ahead of main and landed together, so the two per-category AI summaries + the Source Reviews column all went live as ONE unit.
- **Deploy 2 (`c641b3d`) — 4 director Phase-4 adjustments:** (#1) top-align the banner category name; (#2) removed the per-category non-bulleted prose write-back into each in-category competitor's "Your notes — Captured Reviews" box (deleted the append-merge loop in `review-analysis-run-batch.ts`; the non-bulleted COLUMN keeps its prose; the per-competitor non-bulleted write-back left intact); (#3) NEW shared `components/HoverTooltip.tsx` (portal+fade tooltip + `autoHideMs` auto-fade) wired onto the two AI buttons; (#4) Source Reviews layout restructured to per-bullet sub-rows via a multi-`<tr>` banner block (grip / category-name label / non-bulleted prose rowSpan the whole category).
- **1 PENDING:** the end-of-session doc-batch commit (this doc-batch agent's output) — carries the 7-doc Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged content; listed for completeness]) + HANDOFF_PROTOCOL header bump + 1 Group B doc (REVIEWS_PHASE_2_DESIGN.md §B 2026-05-30-d) + 3 MODIFIED polish-item-specs. **This doc-batch commit ff-merges to main per the standard 3-push pattern (the Category code is already on main; nothing is held back this time).**

**TWO Rule 9 deploy gates — both Yes; ZERO other Rule 14f forced-pickers** (the Source Reviews shape was locked 2026-05-30-c; the build proceeded under the default-to-recommendation path with a plain-terms shape description + go-ahead). Running cumulative was 149/153 → +2 → **151/155 = 97.4% Yes-to-Recommended**.

**Schema-change-in-flight flag NO entire session (entry NO → exit NO)** — the Source Reviews column reads already-persisted PER_CATEGORY data; the Deploy-2 write-back removal is a deletion. **NEXT session (the Type page) = likely YES at entry** (the new `typeTableLayout` column).

**ZERO open DEFERRED items at exit (Rule 26)** — Tasks #1–#9 completed; Task #10 ("Mirror the 4 category adjustments onto the Type page") was DEFERRED in-session and its destination entries (`P-49-W5-S5-type-page.md` §2 + `P-49-W5-S4-category-page.md` §2) were WRITTEN in this doc-batch, so it closes at exit.

**Baselines locked from this session:** root tsc clean + extension tsc clean + extension `npm test` = **910/910 UNCHANGED** + src/lib `node:test` = **1182/1182** (+3 from 1179 entry — the `buildCategorySourceReviewRows` tests) + `npm run build` = **69 routes UNCHANGED** (reused existing endpoints — no new route).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-30-d** (no top-tier slip — director PASSED both deploys) capturing: (1) NEW reusable PATTERN — "Per-row alignment across two adjacent table columns via a multi-`<tr>` banner block with rowSpan'd flanking cells"; (2) the write-back-scope terminology clarification (resolved with NO code change — the implementation already matched intent); (3) the note that no backend per-category invocation test exists (pre-existing test-infra gap — the mock's `competitorUrl` lacks `findMany`); (4) the P-43 cwd-leak running tally ~31-33+. NO new memory file.

**NEW §B 2026-05-30-d entry appended to `docs/REVIEWS_PHASE_2_DESIGN.md`** (TWENTY-FOURTH build/deploy-session §B entry per Rule 18; SIXTEENTH W5 entry — the Source Reviews column rendering + the whole-Category-Session-2 deploy + the 4 director adjustments + the NEW multi-`<tr>` rowSpan-alignment PATTERN; notes it does NOT regress the sibling Reviews Analysis Table page, the per-competitor flows, or the Category page interactive batch).

**ROADMAP P-49 entry status updated to "🟢 IN-FLIGHT 2026-05-30-d"** with the Source Reviews column + the 4 adjustments ✅ DEPLOYED-AND-VERIFIED + the Category page essentially CLOSED + (a.117) closes / (a.118) opens for the Type page Sessions 4-5.

**SIXTY-FIRST end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. (a.118) / the Type page Sessions 4-5 is W#2-only Reviews Phase 2 work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch ff-merges to main): `main` and `workflow-2-competition-scraping` BOTH at `c641b3d` + the end-of-session doc-batch SHA. **Normal state — nothing held back this time.** Verify with `git log origin/main..HEAD --oneline` showing 0 (or only any brand-new work); `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52; read §2 + §3 of each at session start):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate) + Rule 14f (forced-picker mechanics) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit — the `typeTableLayout` additive nullable column will trigger this) + Rule 24 (pre-capture search) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-49-W5-S5-type-page.md` §2 (esp. the 2026-05-30-d entry — the Type page MUST inherit ALL FOUR adjustments + the Source Reviews feature) + §3 (the rolled-up Type spec + the Category→Type substitution table)** — THE source-of-truth for the Type page build.
- **`docs/polish-item-specs/P-49-W5-S4-category-page.md` §2 + §3 (the AS-SHIPPED Category page — the pattern to mirror, with `type` substituted for `category`)** — esp. the 2026-05-30-d entry (Source Reviews column + the 4 adjustments) + the 2026-05-30-b entry (interactive batch / drag / hide / `categoryTableLayout`).
- `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §2/§3 (the cross-cutting decisions — esp. the 2026-05-30-d entry removing the per-group non-bulleted write-back + the pointer table: Category page CLOSED, only the Type page remaining).
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-30-d (this session — Source Reviews column + the 4 adjustments) + §B 2026-05-30-c (the two category AI flows + the Source Reviews backend) + §B 2026-05-30-b (the Category interactive batch + the `categoryTableLayout` memory) + §A (the frozen design intent, esp. the PER_TYPE analysis-level decisions).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-30-d (this session's informational entry — the multi-`<tr>` rowSpan-alignment PATTERN + the write-back-scope clarification + the no-backend-per-category-invocation-test gap).
- **The shipped Category-page code to mirror:** `src/app/projects/[projectId]/competition-scraping/reviews-analysis-by-category/page.tsx` (the full as-shipped Category page — table + two-level drag + hide-with-restore + the two AI summaries + the Source Reviews column + the multi-`<tr>` banner) + `src/lib/competition-scraping/category-table-columns.ts` (the 14-column registry incl. `catSourceReviews`) + `category-table-grouping.ts` + `category-table-layout.ts` (the `categoryTableLayout` memory helper to clone as `type-table-layout.ts`) + `category-analysis-aggregation.ts` (the reviewId-union to clone for `per-type-bulleted`) + `reviews-traceability.ts` (`buildCategorySourceReviewRows` to clone/generalize for type) + `handlers/review-analysis-run-batch.ts` (the `per-category-*` dispatch to mirror as `per-type-*`) + NEW `CategoryAiRunModal.tsx` (parameterize for type, or reuse) + `components/HoverTooltip.tsx` (reuse as-is).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - `feedback_plan_output_shape_before_building.md` — the Type page mirrors a fully-locked Category page; if any genuinely-new UI shape decision arises, settle it WITH the director before coding.
  - `feedback_approval_scope_per_decision_unit.md` — the deploy that ships the Type page is one decision unit; the 3-push pattern applies.
  - `feedback_destructive_ops_confirmation.md` — the additive `typeTableLayout` column is a Rule 23 / Rule 8/9 trigger; audit before `prisma db push`; additive nullable, zero data loss expected.
  - `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31 (with the 2026-05-28-b mechanical read-guarantee + audit-shipped-state mandate sub-sections), the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §2 + §3 of each listed spec at session start — especially `docs/polish-item-specs/P-49-W5-S5-type-page.md` §2 (the 2026-05-30-d entry — the 4 adjustments + the Source Reviews feature the Type page must inherit) + §3 (the Category→Type substitution table) AND `docs/polish-item-specs/P-49-W5-S4-category-page.md` §2/§3 (the as-shipped Category page to mirror).** **This session is on `workflow-2-competition-scraping` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal (a.118 / P-49 W5 Type page Sessions 4-5):** build the **`Reviews Analysis By Competitor Type Table`** page, mirroring the now-CLOSED Category page with `type` / `(Untyped)` substituted for `category` / `(Uncategorized)` throughout. It must inherit ALL Category behaviors — the grouped table + per-review stacked Stars/Reviews Summary + column show/hide + click-to-edit + drag-to-resize + the two-level @dnd-kit drag (with `type:<key>` prefixed ids + the FF1 `MeasuringStrategy.Always` + `autoScroll` from the start) + hide-with-restore + the per-page layout-memory column + Excel export + the two AI flows (`per-type-bulleted` + `per-type-nonbulleted`) + **the NEW "Source Reviews" column** — AND it must be born with the 4 director adjustments shipped this session (top-aligned type label; NO per-type non-bulleted prose write-back into competitor notes boxes; auto-fading HoverTooltips on the AI buttons; Source Reviews = per-bullet sub-row layout via a multi-`<tr>` banner block). **Schema-change-in-flight = likely YES at entry** (the additive `typeTableLayout` Json column).

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: 0 (or only brand-new work) — main and workflow-2 are both at c641b3d + the 2026-05-30-d doc-batch SHA; nothing is held back this time
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2`.

**Phase 0 (forced-picker shape BEFORE coding — Rule 14f + `feedback_plan_output_shape_before_building.md`):**

- **Confirm the `typeTableLayout` storage shape with the director** (mirror `categoryTableLayout` = ONE additive nullable `UserTablePreferences.typeTableLayout Json?` column `{ typeOrder, rowOrderByUrlId, hiddenUrlIds, hiddenTypeKeys }`, reusing the existing `/table-preferences` endpoint — NO new route). This is the Recommended path; default-to-recommendation applies if it's just re-confirming the established Category pattern.
- **Confirm whether to reuse `CategoryAiRunModal.tsx` parameterized by level vs a new `TypeAiRunModal.tsx`** (Recommended: parameterize/reuse).
- **Session decomposition reminder (Q4, locked 2026-05-28):** Session 4 = Type page scaffold + drag + Excel together (compressed since the pattern is proven); Session 5 = the two Type AI flows + the Source Reviews column. The director may compress these into fewer build sessions now that the Category page is fully proven — confirm the split at session start.

**Phase 1+ (the build):**

- Mirror the as-shipped Category page (`reviews-analysis-by-category/page.tsx` + its helpers) into a `reviews-analysis-by-competitor-type` page (final slug TBD; confirm with director), substituting `type` for `category`. Clone `category-table-layout.ts` → `type-table-layout.ts`, `category-analysis-aggregation.ts` → `type-analysis-aggregation.ts` (the reviewId-union for `per-type-bulleted`), and generalize/clone `buildCategorySourceReviewRows` for type. Add `per-type-bulleted` + `per-type-nonbulleted` to `review-analysis-run-batch.ts` SHIPPED_FLOWS + dispatch + `PER_TYPE_BULLETED/NONBULLETED` prompts. Reuse `components/HoverTooltip.tsx` as-is.
- **Apply the 4 adjustments from the START** (top-aligned label; NO per-type non-bulleted write-back into competitor boxes; auto-fading HoverTooltips; Source Reviews per-bullet sub-row multi-`<tr>` banner layout).
- Test coverage: positive tests on the type grouping + the type-table-layout helper + the source-review resolution; negative tests asserting the Category page, the per-competitor flows, and the Reviews Analysis Table page are unchanged.

**Phase 2+ (deploy decision Rule 14f, once the page lands + scoreboard-verifies):** fire deploy-now picker(s). On Yes, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on vklf.com. If a `typeTableLayout` schema column ships, flip Schema-change-in-flight YES→NO at the deploy push (`prisma db push`; additive nullable; zero data loss per Rule 23).

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (UNCHANGED)
- Extension tsc clean (UNCHANGED)
- Extension `npm test` = 910/910 (likely UNCHANGED — the Type page is PLOS-side; confirm)
- src/lib `node:test` ≥ 1182 (entry 1182; expect +N for the type grouping + type-table-layout + source-review resolution tests)
- `npm run build` = 69 routes + 1 (the new Type page route) — expect **70 routes** if a new page route is added; confirm
- Check 6 Playwright SKIPPED per Rule 27 (DEPLOY session; @dnd-kit drag impractical to Playwright reliably; director real-Chrome Phase 4 used instead)

**Deploy mechanics:** 1+ Rule 9 deploy gates planned. On Yes, expect the standard 3-push pattern (push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`.

**Schema-change-in-flight flag:** **likely YES at entry → flips NO at the deploy push** (the additive `typeTableLayout` column). The Type AI flows + the Source Reviews column reuse the existing `ReviewAnalysis` PER_TYPE storage (no schema change for those).

**Group A docs to update at session end:** ROADMAP header bump + P-49 polish-backlog entry status update (Type page Sessions 4-5 progress; if the Type page ships, P-49 W5 may CLOSE) + CHAT_REGISTRY header bump (184th session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump (likely header-bump-only) + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite (likely W#2 graduation prep + P-51, OR a follow-up Type session if Sessions 4-5 split across more than one session).

**Group B docs to update at session end:** `docs/REVIEWS_PHASE_2_DESIGN.md` NEW §B entry (SEVENTEENTH W5 entry) IF code ships — capturing the Type page + its AI flows + its Source Reviews column. `docs/polish-item-specs/P-49-W5-S5-type-page.md` (mark Sessions 4-5 ✅ DONE + the Type page CLOSED) + `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` (§3 pointer table — Type page CLOSED → P-49 W5 fully CLOSED). If a `typeTableLayout` column ships, note it in DOCUMENT_MANIFEST's schema-change transition note.

**Standing carry-overs into this session:**

- **The 4 adjustments from 2026-05-30-d MUST be inherited** (top-aligned label; NO per-type non-bulleted write-back into competitor boxes; auto-fading HoverTooltips; Source Reviews per-bullet sub-row layout).
- **(optional refinement) editable banner category/type name** — the banner name is a read-only label on both pages; director may request making it editable (would apply to both pages).
- **Opus 4.8 pricing numbers (P-52 carry-over)** — director may supply offline; relevant if the Type AI flows surface cost estimates.
- **W#1 `AutoAnalyze.tsx` shared-list migration (P-52 carry-over)** — a future `main`-track tidy-up; not for this session.
- **W#2 graduation** — once the Type page closes, P-49 W5 closes and W#2 graduation can be scheduled.

---

## Why this pointer was written this way (debug aid)

- **(a.118) the Type page Sessions 4-5 is the PICK** because the Category page is now essentially CLOSED (the two AI flows + the Source Reviews column + the 4 adjustments all shipped + verified), and the Type page is the only remaining unit in the locked 5-session Category + Type corrective rebuild. No §4 Step 1c forced-picker was needed — the Type page is the obvious + only remaining next unit.
- **The Type page is a near-mechanical mirror of the now-proven Category page** — the substitution table in `P-49-W5-S5-type-page.md` §3 + the as-shipped Category code make this a low-risk, high-confidence build. The main genuinely-new piece is the additive `typeTableLayout` column (mirror `categoryTableLayout`).
- **The 4 adjustments are pre-loaded into the Type spec's §2 (2026-05-30-d entry)** specifically so the Type page is born with them, closing the in-session Task #10 ("mirror the 4 category adjustments onto the Type page") that was DEFERRED and resolved in this doc-batch.
- **Schema-change-in-flight = likely YES at entry** because the Type page needs its own per-page layout-memory column; the AI flows + Source Reviews column themselves reuse existing PER_TYPE storage.
- **Branch state is back to normal** (nothing held off main this session — both deploys landed on main, unlike 2026-05-30-c which intentionally held the category build back).

## Alternate next-session candidates if director shifts priorities at session start

- **(a.118.alt1) P-49 W5 Type page Sessions 4-5** (current PICK — pre-loaded above). Build the Type page mirroring the closed Category page + inherit the Source Reviews column + the 4 adjustments; on `workflow-2-competition-scraping`; Schema-change-in-flight likely YES.
- **(a.118.alt2) Split the Type page into Session 4 (scaffold + drag + Excel) then Session 5 (AI flows + Source Reviews)** per the original Q4 decomposition, if the director prefers smaller deploy units; on `workflow-2-competition-scraping`.
- **(a.118.alt3) Category page banner — editable category name** (the optional refinement; small UI follow-up that would also apply to the Type page; on `workflow-2-competition-scraping`).
- **(a.118.alt4) P-51 per-Project competitive landscape AI summary** (per `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` skeleton — build session opens with Q&A). Director directive: P-51 slots AFTER P-49 closes — so only if the director chooses to start it before the Type page; on `main` or a new workflow branch.
- **(a.118.alt5) Resolve the P-52 Opus 4.8 pricing carry-over + W#1 shared-list migration** (a small `main`-track follow-up, if the director supplies official pricing numbers).
- **(a.118.alt6) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`). Running tally ~31-33+; quick palate-cleanser.
- **(a.118.alt7) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files). Director already approved scope; quick palate-cleanser on `main`.
