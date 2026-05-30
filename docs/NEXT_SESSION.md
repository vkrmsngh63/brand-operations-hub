# Next session

**Written:** 2026-05-30-b (`session_2026-05-30-b_p49-w5-category-page-interactive-batch` — W#2 polish P-49 W5 Category page "interactive batch" made the Reviews Analysis By Competitor Category Table fully interactive ✅ DEPLOYED-AND-VERIFIED 2026-05-30-b end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — TWO deploys (`5f07f24` interactive batch + `469e5c6` FF1: fix category drag below the fold), TWO Rule 9 deploy gates; both branches at `469e5c6` pre-doc-batch. Director Phase 4 verbatim verdict: **"All passed."** TWO NEW reusable PATTERNS: **"Two-level nested @dnd-kit drag in ONE DndContext via prefixed sortable ids + per-group SortableContexts"** + **"Off-screen drop targets in an `overflowX:hidden` scroll container need `MeasuringStrategy.Always` + explicit `autoScroll`."** **Closes (a.115) RECOMMENDED-NEXT** — the Category page interactive batch is DEPLOYED & verified. **Opens (a.116) RECOMMENDED-NEXT = P-49 W5 Category page Session 2 — the two Category AI flows** on `workflow-2-competition-scraping`.

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session correctly stamped `2026-05-30-b` (the SECOND session of 2026-05-30 — the first was `session_2026-05-30_p49-w5-category-page-session-1-scaffold-and-polish` with NO suffix). Do NOT regress to 05-31 or invent letter suffixes ahead of the harness. Future sessions keep trusting the harness `currentDate`.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** (a.116) / the Category page Session 2 AI flows is W#2-only Reviews Phase 2 work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** The two Category AI flows reuse the EXISTING `ReviewAnalysis` PER_CATEGORY storage — no new column, no `prisma db push` expected. If the design Q&A surfaces a storage need, fire a Rule 14f schema picker + flip the flag YES then. Otherwise the flag stays NO entire session.

---

## What we did this session (in plain terms)

Today we made the **"Reviews Analysis By Competitor Category" page** fully interactive — the page now does what the rest of the tables do, plus a brand-new "remember my layout" feature. In plain terms:

1. **A tidy banner row per category.** Each category now has its own shaded banner row with a drag-grip + the category name on the left and the two "by category" AI boxes on the right. All of that category's competitors sit beneath the banner — which means the very first competitor is now draggable too (before, the first row carried the category label and blocked dragging).
2. **Drag to reorder, two levels.** You can drag whole categories up and down (the "(Uncategorized)" group stays pinned at the bottom), and within a category you can drag individual competitors up and down. Each competitor's stacked review rows travel with it.
3. **Hide-with-restore.** You can hide a competitor or a whole category from JUST this page, and a "Hidden on this page" panel lets you bring them back. This never deletes any data anywhere else.
4. **The page remembers your layout — per user, per project.** All of the above (the order + what's hidden) is saved so it sticks across refreshes, scoped to this page only.

One follow-up fix this session: when you tried to drag a category down to a spot below the visible screen, the page didn't auto-scroll, so the drop failed. We added the missing auto-scroll + re-measuring so off-screen drops now work.

**Your verbatim Phase 4 verification verdict on both deploys: "All passed."**

**Numbers:**

- **FOUR Rule 14f decisions — all chosen = 4/4 = 100% Yes-to-Recommended** (the memory storage shape + the banner-row layout + the interactive-batch deploy gate + the FF1 deploy gate). Running cumulative: **144/147 = 98.0%**.
- **TWO Rule 9 deploy gates** (the interactive batch `5f07f24` + the FF1 `469e5c6`).
- **Six pushes total** (the two deploy ff-merges + their ping-pongs happened during the session; the end-of-session doc-batch push + ping-pong are pending — the parent handles them).
- **Schema-change-in-flight = YES at entry → flipped YES → NO at the interactive-batch deploy push** (the one new "remember my layout" column landed cleanly — additive, zero data loss).
- **Post-merge /scoreboard all GREEN at NEW LOCKED baselines:** root tsc clean + extension tsc clean + extension `npm test` = 910/910 UNCHANGED + src/lib `node:test` = **1156/1156** (+26 from 1130 — the new layout-memory + grouping + handler tests) + `npm run build` = **69 routes UNCHANGED** (reused the existing preferences endpoint — no new route); Check 6 Playwright SKIPPED per Rule 27.
- **NO extension zip this session** (no extension code changed).

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (P-49 entry) + `docs/polish-item-specs/P-49-W5-S4-category-page.md` §2/§3 + `docs/polish-item-specs/P-49-W5-S5-type-page.md` §2 + `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3.

- **(a.116) P-49 W5 Category page Session 2 — the two Category AI flows** — NEXT SESSION; on `workflow-2-competition-scraping` (see below). The bulleted dedup flow + the non-bulleted prose flow, painting into Columns 12/13 on the banner rows. Then the Type page (Sessions 4-5) inherits ALL Category behaviors.
- **(optional refinement) Category page banner — editable category name (rename the whole group)** — captured within the P-49 ROADMAP entry; the banner name is a read-only label today; director may request making it editable.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.

## What we'll do next session (in plain terms)

Next session is **P-49 W5 Category page Session 2 — the two Category AI flows** — adding the two "by category" AI summaries that the banner rows have been holding placeholders for. In plain terms:

1. **First, draft the wording together.** Before any code, we'll settle the exact AI prompt content for the two flows WITH you (what each summary should say, how long, what tone) — per the "plan the output shape before building" rule.
2. **Two AI summaries per category.** A **bulleted** summary that de-duplicates the per-competitor points across the whole category, and a **non-bulleted** prose summary. These paint live into the two "by category" cells (Columns 12/13) on each category's banner row.
3. **Write the prose back where it belongs.** The non-bulleted prose also writes back into the URL detail "Overall Analysis — Captured Reviews" box.
4. **Reuse the existing AI plumbing.** We'll reuse the existing per-batch AI dispatch (`review-analysis-run-batch.ts` SHIPPED_FLOWS) and the existing `ReviewAnalysis` PER_CATEGORY storage — so **no database change is expected.**

After Session 2, the Category page is essentially done, and we move on to the **Type page (Sessions 4-5)**, which inherits ALL the Category behaviors we've built (scaffold + polish + interactive batch + AI flows), with its own "remember my layout" column.

## What's still left in the total roadmap (in plain terms)

- **P-49 W#2 Reviews Phase 2 (IN-FLIGHT — the Competitor Reviews Analysis Table page is CLOSED; the Category page scaffold + polish + interactive batch are now ✅ DEPLOYED; the two Category AI flows + the Type page Sessions 4-5 remain)** — Estimate ~3 more sessions until P-49 W5 closes.
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

**P-49 W5 Category page "interactive batch" — banner-row layout restructure + two-level @dnd-kit drag-to-reorder + hide-with-restore + a NEW per-user/per-Project page-layout "memory" area ✅ DEPLOYED-AND-VERIFIED 2026-05-30-b** end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`. BUILD + DEPLOY session: TWO builds, TWO deploys, TWO Rule 9 deploy gates. Director Phase 4 verbatim verdict: "All passed." The SECOND of the 5-session Category + Type corrective rebuild.

**Session shape (BUILD + DEPLOY — 2 build commits + end-of-session doc-batch; 2 ff-merges + ping-pong syncs):**

- Builds: `5f07f24` (interactive batch — banner-row layout restructure + two-level @dnd-kit drag-to-reorder in ONE DndContext via prefixed `cat:<key>` sortable ids + per-category nested SortableContexts + hide-with-restore + a NEW additive nullable `UserTablePreferences.categoryTableLayout` Json column `{ categoryOrder, rowOrderByUrlId, hiddenUrlIds, hiddenCategoryKeys }` threaded through the shared-types wire shape + the existing `/table-preferences` GET/PUT handler — REUSING the endpoint, NO new route; NEW pure helpers `src/lib/competition-scraping/category-table-layout.ts` + `.test.ts` + grouping `foldIntoCategoryGroups`/`buildCategoryGroups`; 9 files +1268/-186; `prisma db push` 1.29s additive zero data loss) + `469e5c6` (FF1: fix category drag below the fold — `measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}` + `autoScroll={{ threshold: { x: 0, y: 0.25 }, acceleration: 15 }}` on the DndContext; 1 file +10).
- ff-merge ranges: `0c9f361..5f07f24` then `5f07f24..469e5c6` to main; ping-ponged to workflow-2 after each.
- 1 PENDING: end-of-session doc-batch commit (this doc-batch agent's output) — carries the 7-doc Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged content; listed for completeness]) + HANDOFF_PROTOCOL header bump + 1 Group B doc (REVIEWS_PHASE_2_DESIGN.md §B 2026-05-30-b) + 3 parent-MODIFIED polish-item-specs.

**FOUR Rule 14f decisions — all chosen = 4/4 = 100% Yes-to-Recommended** (memory-drawer storage shape = one additive nullable column on `UserTablePreferences` + banner-row layout = shaded banner with grip+name+hide on the left + the two category AI boxes at the right + the interactive-batch deploy gate + the FF1 deploy gate). Running cumulative = **144/147 = 98.0% Yes-to-Recommended**.

**TWO Rule 9 deploy gates fired this session** (the interactive batch `5f07f24` + the FF1 `469e5c6`).

**Schema-change-in-flight flag YES entry → FLIPPED YES → NO at the interactive-batch deploy push (`5f07f24`)** — the additive nullable `categoryTableLayout Json?` column landed cleanly via `prisma db push` (additive-only, zero data loss). **NEXT session = NO at entry** (the two Category AI flows reuse the existing `ReviewAnalysis` PER_CATEGORY storage).

**ZERO DEFERRED items at entry and exit (Rule 26).** 5 in-session tasks, all 5 completed cleanly. ZERO new DEFERRED.

**Baselines locked from this session:** root tsc clean + extension tsc clean + extension `npm test` = **910/910 UNCHANGED** + src/lib `node:test` = **1156/1156** (+26 from 1130 entry — the new `category-table-layout.test.ts` + grouping fold/build tests + handler `categoryTableLayout` tests) + `npm run build` = **69 routes UNCHANGED** (reused the existing `/table-preferences` endpoint — no new route).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-30-b** (no top-tier slip — director PASSED everything) capturing: (1) NEW reusable PATTERN — "Two-level nested @dnd-kit drag in ONE DndContext via prefixed sortable ids + per-group SortableContexts"; (2) NEW reusable PATTERN — "Off-screen drop targets in an `overflowX:hidden` scroll container need `MeasuringStrategy.Always` + explicit `autoScroll`" (the FF1 root cause); (3) the informational design note — the banner category name is a READ-ONLY label this session (renaming the whole category from the banner was deliberately deferred; flagged to director at Phase 4); (4) P-43 cwd-leak running tally ~31-33+ (no notable new reproductions). NO new memory file.

**NEW §B 2026-05-30-b entry appended to `docs/REVIEWS_PHASE_2_DESIGN.md`** (TWENTY-SECOND build/deploy-session §B entry per Rule 18; FOURTEENTH W5 entry; the FIRST Category-page interactive-batch entry — the `categoryTableLayout` schema column + the banner-row restructure + the two-level nested @dnd-kit drag + hide-with-restore + the FF1 auto-scroll fix; notes it does NOT regress the sibling Reviews Analysis Table page or the Category page's Session 1 scaffold behaviors).

**ROADMAP P-49 entry status updated to "🟢 IN-FLIGHT 2026-05-30-b — Category page interactive batch ✅ DEPLOYED-AND-VERIFIED"** with the two build commit hashes + the optional-refinement sub-note (editable banner name) + (a.116) Category page Session 2 AI flows queued.

**FIFTY-NINTH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. (a.116) / the Category page Session 2 AI flows is W#2-only Reviews Phase 2 work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch lands + the standard 3-push ping-pong sync fires): `main` and `workflow-2-competition-scraping` both at the post-doc-batch SHA after ff-merge. Verify with `git status` showing a clean working tree (apart from historical untracked .zip + .html artifacts at repo root) and `git log origin/main..HEAD --oneline | wc -l` = 0.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52; read §2 + §3 of each at session start):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate) + Rule 14f (forced-picker mechanics — draft the AI prompt content WITH the director BEFORE any code, per `feedback_plan_output_shape_before_building.md`) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit — likely N/A: no schema change expected) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-49-W5-S4-category-page.md` §2 (the 2026-05-30-b entry — the interactive batch ✅ DONE + the read-only-banner-name note + the optional editable-name refinement) + §3 (the rolled-up 13-column spec, esp. Columns 12/13 = the two "by category" AI flows)** — THE source-of-truth for the Category page AI flows.
- `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §3 (pointer table — Category interactive batch CLOSED; remaining = Category Session 2 AI flows + Type page Sessions 4-5) + §1 (the verbatim director re-paste — the per-category AI flow intent, esp. the Q-E prompt-content questions to settle with the director at session start).
- `docs/polish-item-specs/P-49-W5-S5-type-page.md` §2 (the Type page must inherit ALL Category behaviors — relevant when shaping the AI flows so they generalize to the Type page).
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-30-b (this session — the interactive batch) + §A (the frozen design intent, esp. the PER_CATEGORY analysis-level decisions) + the earlier §B entries covering the sibling page's AI flows (the bulleted + non-bulleted flow patterns to MIRROR onto the Category page's two AI columns).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-30-b (this session's informational entry — the 2 NEW Patterns + the read-only-banner-name design note).
- **The shipped Category page + the sibling AI-flow patterns to mirror:** `src/app/projects/[projectId]/competition-scraping/reviews-analysis-by-category/page.tsx` (the page to add the AI flows to — Columns 12/13 on the banner rows are the placeholders to fill; the interactive batch + grouping + layout-memory already live here) + `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` (the per-batch AI dispatch + the SHIPPED_FLOWS registry to reuse) + the sibling `competitor-reviews-analysis/page.tsx` (the per-competitor bulleted + non-bulleted AI flows to MIRROR) + `src/lib/competition-scraping/category-table-layout.ts` + `category-table-grouping.ts` (the layout-memory + grouping helpers the AI flows render against).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - `feedback_plan_output_shape_before_building.md` — DIRECTLY relevant: draft the two AI flows' prompt content (audience / sections / depth / tone / placement) WITH the director via Rule 14f pickers BEFORE writing any code; the Q-E prompt content is the FIRST thing to settle.
  - `feedback_browser_first_ai_with_server_migration.md` — RELEVANT: mirror the sibling page's per-batch execution-mode shape so the Category AI flows match the existing AI-batch UX.
  - `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_approval_scope_per_decision_unit.md` + `feedback_destructive_ops_confirmation.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31 (with the 2026-05-28-b mechanical read-guarantee + audit-shipped-state mandate sub-sections), the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §2 + §3 of each listed spec at session start — especially `docs/polish-item-specs/P-49-W5-S4-category-page.md` §3 (Columns 12/13 = the two "by category" AI flows) + the master spec §1 (the Q-E prompt-content intent).** **This session is on `workflow-2-competition-scraping` — verify the branch first.** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal (a.116 / P-49 W5 Category page Session 2 — the two Category AI flows):** add the two "by category" AI summaries that the banner rows hold placeholders for. A **bulleted** flow that de-duplicates the per-competitor points across the whole category + a **non-bulleted** prose flow; both paint live into Columns 12/13 on each category's banner row; the non-bulleted prose also writes back into the URL detail "Overall Analysis — Captured Reviews" box. Reuse the existing per-batch AI dispatch (`review-analysis-run-batch.ts` SHIPPED_FLOWS) + the existing `ReviewAnalysis` PER_CATEGORY storage. **Schema-change-in-flight = NO entry state** (no new column expected; if the design Q&A surfaces a storage need, fire a Rule 14f schema picker + flip the flag YES). Then the Type page (Sessions 4-5) inherits ALL Category behaviors with its own `typeTableLayout` column.

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

**Phase 0 (audit-shipped-state + the AI prompt-content design decision — per `feedback_plan_output_shape_before_building.md`, draft the two flows' prompt content WITH the director BEFORE writing any code):**

- **Audit-shipped-state (Rule 31):** confirm the shipped Category page (`reviews-analysis-by-category/page.tsx`) is intact — the banner-row layout, the two-level @dnd-kit drag, hide-with-restore, the `categoryTableLayout` layout-memory, and the Columns 12/13 placeholders the AI flows will fill. Confirm the sibling page's per-competitor bulleted + non-bulleted AI flows (`competitor-reviews-analysis/page.tsx` + `review-analysis-run-batch.ts` SHIPPED_FLOWS) are the patterns to mirror. Confirm the existing `ReviewAnalysis` PER_CATEGORY storage is the write target (no new column expected).
- **AI prompt-content picker(s) (Rule 14f — the FIRST decision, BEFORE code):** draft the exact prompt content for the bulleted dedup flow + the non-bulleted prose flow WITH the director — audience, sections, depth, tone, placement — per `feedback_plan_output_shape_before_building.md`. "Ship v1 and iterate" is NOT a substitute for settling the output shape with the director first.
- **Execution-mode shape:** mirror the sibling page's per-batch execution-mode UX per `feedback_browser_first_ai_with_server_migration.md` so the Category AI flows match the existing AI-batch experience.

**Phase 1 (the two AI flows, after the prompt content + execution shape are locked):**

- Wire the two new per-category flows into the per-batch AI dispatch (`review-analysis-run-batch.ts` SHIPPED_FLOWS) — the bulleted dedup flow + the non-bulleted prose flow — writing to the existing `ReviewAnalysis` PER_CATEGORY storage.
- Real-time per-cell painting into Columns 12/13 on each category's banner row as each flow completes.
- Non-bulleted prose write-back into the URL detail "Overall Analysis — Captured Reviews" box.
- Test coverage: positive tests on the new flow dispatch + the per-category write/read + the banner-cell painting selection logic; negative tests asserting the sibling page's AI flows + the Category page's interactive-batch behaviors (banner layout, two-level drag, hide-with-restore, layout-memory) are unchanged.

**Phase 2 (deploy decision Rule 14f, once the AI flows land + scoreboard-verifies):** fire a deploy-now-vs-exit picker. If deploy fires, ff-merge to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on vklf.com.

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (UNCHANGED)
- Extension tsc clean (UNCHANGED)
- Extension `npm test` = 910/910 (likely UNCHANGED — the AI flows are PLOS-side; confirm)
- src/lib `node:test` ≥ 1156 (entry 1156; expect +N for the new per-category flow dispatch + write/read tests)
- `npm run build` = 69 routes (likely UNCHANGED unless a new AI-flow endpoint is added — confirm; the existing per-batch dispatch may be reused)
- Check 6 Playwright SKIPPED per Rule 27 (BUILD/DEPLOY session; AI-batch flows are impractical to Playwright reliably; director real-Chrome Phase 4 used instead)

**Deploy mechanics:** 1+ Rule 9 deploy gates planned (the AI flows are a clean deploy candidate). If deploy fires, expect the standard 3-push pattern (push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`.

**Schema-change-in-flight flag:** **NO entry → likely NO exit** (the two Category AI flows reuse the existing `ReviewAnalysis` PER_CATEGORY storage). If the design Q&A surfaces a storage need, fire a Rule 14f schema picker + flip the flag YES → NO at the deploy push per Rule 23 + `feedback_destructive_ops_confirmation.md`.

**Group A docs to update at session end:** ROADMAP header bump + P-49 polish-backlog entry status update (Category page Session 2 AI flows progress) + CHAT_REGISTRY header bump (182nd session) + DOCUMENT_MANIFEST header + flags (Schema-change-in-flight state + any new endpoint) + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump (likely header-bump-only — no new rule expected) + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite (likely the Type page Sessions 4-5, OR Category page closeout).

**Group B docs to update at session end:** `docs/REVIEWS_PHASE_2_DESIGN.md` NEW §B entry (TWENTY-THIRD build/deploy-session entry; FIFTEENTH W5 entry) IF code ships — capturing the two AI flows + the prompt content + the per-category write target + the banner-cell painting. `docs/polish-item-specs/P-49-W5-S4-category-page.md` (mark the AI flows ✅ DONE in §2/§3 — Category page essentially CLOSED) + `docs/polish-item-specs/P-49-W5-S5-type-page.md` (note the AI-flow pattern now shipped + must be mirrored) + `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` (§3 pointer table — Category page CLOSED; only the Type page Sessions 4-5 remaining).

**Standing carry-overs into this session:**

- **Opus 4.8 pricing numbers (P-52 carry-over)** — director may supply offline; DIRECTLY relevant if the two Category AI flows surface cost estimates.
- **W#1 `AutoAnalyze.tsx` shared-list migration (P-52 carry-over)** — a future `main`-track tidy-up; not for this session.
- **(optional refinement) editable banner category name** — captured in the P-49 ROADMAP entry; the banner name is a read-only label today; director may request making it editable to rename the whole category group (small UI follow-up, slot any time).
- **Type page Sessions 4-5** — STILL PENDING; resume after the Category page (Sessions 1-3) closes; the Type page inherits ALL Category behaviors per the 2026-05-30 director directive — shape the AI flows so they generalize.

---

## Why this pointer was written this way (debug aid)

- **(a.116) the two Category AI flows is the PICK** because Session 2 is the obvious next unit per the locked 5-session decomposition (Category Sessions 1-3, then Type Sessions 4-5): Session 1 scaffolded + polished the page, this session made it interactive, and the only remaining Category-page work is the two "by category" AI summaries the banner rows already hold placeholders for. No §4 Step 1c forced-picker was needed — the decomposition pre-locks the order.
- **Schema-change-in-flight = NO at entry** because the two AI flows reuse the existing `ReviewAnalysis` PER_CATEGORY storage that already shipped (the 2026-05-27 W5 Session 1.5 `prisma db push` added the PER_CATEGORY enum value). No new column is expected.
- **The prompt content is settled FIRST (before code)** per `feedback_plan_output_shape_before_building.md` — the audience / sections / depth / tone / placement of the two AI summaries is a design decision for the director, not a "ship v1 and iterate" unilateral call.
- **The banner-name editability was deliberately NOT bundled here** — it is an optional refinement captured on the P-49 ROADMAP entry; the AI flows are the committed Session 2 scope.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.116.alt1) P-49 W5 Category page Session 2 — the two Category AI flows** (current PICK — pre-loaded above). The next P-49 W5 work; on `workflow-2-competition-scraping`; Schema-change-in-flight NO; the bulleted dedup + non-bulleted prose flows painting into Columns 12/13.
- **(a.116.alt2) P-49 W5 Type page Sessions 4-5** (if the director prefers to start the Type page before finishing the Category AI flows; the Type page inherits ALL Category behaviors with its own `typeTableLayout` column; on `workflow-2-competition-scraping`).
- **(a.116.alt3) Category page banner — editable category name** (the optional refinement; small UI follow-up to let the banner name rename the whole category group; on `workflow-2-competition-scraping`).
- **(a.116.alt4) Resolve the P-52 Opus 4.8 pricing carry-over + W#1 shared-list migration** (a small `main`-track follow-up, if the director supplies official pricing numbers and wants the W#1 cleanup done now).
- **(a.116.alt5) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`). Running tally ~31-33+; quick palate-cleanser.
- **(a.116.alt6) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files). Director already approved scope; quick palate-cleanser on `main`.
- **(a.116.alt7) P-51 per-Project competitive landscape AI summary** (per `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` skeleton — build session opens with Q&A). Slotted AFTER P-49 closes, but available if director wants to start the Q&A early.
