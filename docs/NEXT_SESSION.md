# Next session

**Written:** 2026-05-30-c (`session_2026-05-30-c` — W#2 polish P-49 W5 — a MIXED session: (1) an FU-3 traceability-table-shadowing bug fix ✅ DEPLOYED-AND-VERIFIED 2026-05-30-c end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` (single build `bdec02e` under ONE Rule 9 deploy gate; director Phase 4 verbatim verdict: **"PASS, table is back"**); (2) the NEW "Source Reviews" column for the Category page DESIGNED + APPROVED with the director (TWO Rule 14f decisions LOCKED); (3) Category page Session 2 BUILT-not-deployed — backend `d1659d7` + frontend `fb772ad`, both committed on `workflow-2-competition-scraping` ahead of main, undeployed on purpose. NEW reusable PATTERN: **"A second same-level row discriminated only by `analysisJson.flow` can silently shadow the structured row a reader needs — select by flow, not recency."** **Closes (a.116) RECOMMENDED-NEXT PARTIALLY** — the two Category AI flows + the Source Reviews backend are BUILT (undeployed); the FU-3 bug is fixed & DEPLOYED. **Opens (a.117) RECOMMENDED-NEXT = P-49 W5 Category page Session 2 FINISH** on `workflow-2-competition-scraping`.

> ⚠️ **DATE-STAMPS: TRUST THE HARNESS `currentDate`.** This session correctly stamped `2026-05-30-c` (the THIRD session of 2026-05-30 — first = `session_2026-05-30` no-suffix scaffold; second = `session_2026-05-30-b` interactive batch). Do NOT regress the date or invent a different suffix ahead of the harness. Future sessions keep trusting the harness `currentDate`.

> ⚠️ **BRANCH: next session stays on `workflow-2-competition-scraping`.** (a.117) / the Category page Session 2 FINISH is W#2-only Reviews Phase 2 work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically.

> ⚠️ **NON-STANDARD BRANCH STATE — READ CAREFULLY.** `main` is at `bdec02e` (the FU-3 fix, live + verified). `workflow-2-competition-scraping` is **2 commits AHEAD of main** — `d1659d7` (Category Session 2 backend) + `fb772ad` (Category Session 2 frontend) — both UNDEPLOYED ON PURPOSE, PLUS this session's end-of-session doc-batch commit on top. **The Category Session 2 code is already written and committed; next session does NOT re-do it — it builds the Source Reviews column rendering on top, then deploys the WHOLE thing to main together.** Do NOT expect `git log origin/main..HEAD` = 0 next session; expect it to be ≥ 3 (the two category commits + the doc-batch + any new work).

> ⚠️ **SCHEMA-CHANGE-IN-FLIGHT = NO at entry next session.** The Source Reviews column rendering reads the already-persisted backend data (the category bulleted flow already unions the cited bullets' reviewIds onto each category bullet); the deploy ships existing committed code. No new column, no `prisma db push` expected.

---

## What we did this session (in plain terms)

Three things this session:

1. **Fixed a vanishing table (deployed + verified live).** On a competitor's URL detail page, the "Overall Analysis — Captured Reviews" table — the one that shows which captured reviews each bullet point came from — was disappearing after you generated the plain-paragraph (non-bulleted) summary for that competitor. The cause: the page was grabbing "the most recent analysis of EITHER kind," and the plain-paragraph kind doesn't carry the table's structured data, so when it was the newer one it blanked the table. We taught the page to specifically grab the bulleted (structured) analysis, never the plain-paragraph one. Your verbatim Phase 4 verdict: **"PASS, table is back."**

2. **Designed + approved a brand-new "Source Reviews" column.** You asked that each bullet in the category-level "Category Comprehensive (bulleted)" column also show — right next to it — every individual review (across all competitors in that category) that fed into that bullet: the product name, its star rating, the review text, and a little link to jump to that review's detail. We settled the two design decisions together (it shows bullet-by-bullet always visible, and it's for the category bullets only), and we settled the AI wording before writing any code. You also directed that the SAME Source Reviews feature be built for the Type page later (Sessions 4-5) — we wrote that down as a deferred to-do.

3. **Built the two category AI summaries + the Source Reviews data engine (but did NOT deploy yet).** We built the backend that generates the two "by category" AI summaries and figures out exactly which reviews back each category bullet, plus the front-end run buttons + modal + live painting into the two category cells. This is all committed on the working branch but deliberately NOT pushed live — you chose to deploy it all next session, together with the Source Reviews column, as one finished piece.

**Numbers:**

- **SIX Rule 14f decisions — 5 chose Recommended, 1 override** (the "continue or pause" picker, where the recommended option was to pause and deploy the category work as a clean unit, but you chose "keep going" and build the rest now). Running cumulative: **149/153 = 97.4%**.
- **ONE Rule 9 deploy gate** (the FU-3 fix `bdec02e`).
- **Three pushes total** (the FU-3 deploy ff-merge + its ping-pong happened during the session; the end-of-session doc-batch push to `workflow-2` only — NOT to main — is pending; the parent handles it).
- **Schema-change-in-flight = NO the entire session** (the fix is a read-side change; the category build reuses storage that already exists).
- **Post-merge + post-build /scoreboard all GREEN at NEW LOCKED baselines:** root tsc clean + extension tsc clean + extension `npm test` = 910/910 UNCHANGED + src/lib `node:test` = **1179/1179** (+23 from 1156 — +7 for the FU-3 fix + 16 for the category aggregation helpers) + `npm run build` = **69 routes UNCHANGED** (reused the existing AI-run endpoint — no new route); Check 6 Playwright SKIPPED per Rule 27.
- **NO extension zip this session** (no extension code changed).

## What's pending from prior sessions

Captured across `docs/ROADMAP.md` (P-49 entry) + `docs/polish-item-specs/P-49-W5-S4-category-page.md` §2/§3 + `docs/polish-item-specs/P-49-W5-S5-type-page.md` §2 + `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §2/§3.

- **(a.117) P-49 W5 Category page Session 2 FINISH** — NEXT SESSION; on `workflow-2-competition-scraping` (see below). Build the Source Reviews column rendering against the already-produced backend data, then deploy the whole Category Session 2 feature (the two summaries + the Source Reviews column) together + Phase 4 verification.
- **DEFERRED — the Type page "Source Reviews" mirror** — the same Source Reviews feature, for Type instead of Category, when the Type page is built (Sessions 4-5). Captured in `docs/polish-item-specs/P-49-W5-S5-type-page.md` §2 + the master spec.
- **(optional refinement) Category page banner — editable category name (rename the whole group)** — the banner name is a read-only label today; director may request making it editable.
- **Opus 4.8 pricing numbers + W#1 `AutoAnalyze.tsx` shared-list migration** — the two P-52 carry-overs.

## What we'll do next session (in plain terms)

Next session is **P-49 W5 Category page Session 2 FINISH** — the only piece left of the category AI work, plus the deploy. In plain terms:

1. **Build the "Source Reviews" column.** The backend already figured out which individual reviews back each category bullet; next session builds the on-screen column that displays them — bullet-by-bullet, always visible, showing each source review's product name + star rating + review text + a jump-to-detail link, for the category bullets only.
2. **Then deploy the whole thing together.** The two category AI summaries (already built) + the new Source Reviews column ship to live in one deploy, then you verify it in real Chrome on vklf.com (Phase 4).
3. **Confirm one placement question.** The plain-paragraph category summary writes back into each competitor's "Overall Analysis — Captured Reviews" box (the one Fix Session D relabeled "Your notes — Captured Reviews"). It was built exactly to the written spec; you'll confirm at Phase 4 whether that's the right spot.

After this, the Category page is essentially done, and we move to the **Type page (Sessions 4-5)**, which inherits ALL the Category behaviors — including the new Source Reviews feature.

## What's still left in the total roadmap (in plain terms)

- **P-49 W#2 Reviews Phase 2 (IN-FLIGHT — the Competitor Reviews Analysis Table page is CLOSED; the Category page scaffold + polish + interactive batch are ✅ DEPLOYED; the two Category AI flows + the Source Reviews backend are BUILT-not-deployed; the Source Reviews column rendering + the Category deploy + the Type page Sessions 4-5 remain)** — Estimate ~3 more sessions until P-49 W5 closes.
- **P-52 (AI model registry + Rule 32 + Opus 4.8 rollout)** — ✅ DEPLOYED-AND-VERIFIED on `main`. TWO carry-overs OPEN: official Opus 4.8 pricing numbers + the deferred W#1 shared-list migration.
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

**P-49 W5 — a MIXED session: FU-3 traceability-table-shadowing bug fix ✅ DEPLOYED-AND-VERIFIED 2026-05-30-c** (single build `bdec02e`) end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`; director Phase 4 verbatim verdict: "PASS, table is back." **PLUS** the NEW "Source Reviews" column DESIGNED + APPROVED, **PLUS** Category page Session 2 BUILT-not-deployed (`d1659d7` backend + `fb772ad` frontend on `workflow-2`, ahead of main, undeployed on purpose).

**Session shape (MIXED — 1 deploy + 2 undeployed build commits + end-of-session doc-batch):**

- **Deployed:** `bdec02e` (FU-3 fix — NEW pure helper `selectBulletedAnalysisRow(rows, urlId)` in `src/lib/competition-scraping/reviews-traceability.ts` that picks the latest PER_PRODUCT row for the URL that is NOT the non-bulleted prose row; `UrlDetailContent.tsx` uses it instead of the naive last-match loop; +7 node:test; no schema change). ff-merged to main + ping-ponged to workflow-2 under ONE Rule 9 deploy gate.
- **Built, NOT deployed (on `workflow-2`, ahead of main):** `d1659d7` (Category Session 2 backend — `per-category-bulleted` + `per-category-nonbulleted` added to SHIPPED_FLOWS + dispatch in `review-analysis-run-batch.ts`, branch BEFORE the single-urlId contract; bulleted reads each in-category url's latest bulleted structured per-competitor summary, labels input bullets B1..Bn, the model cites which it merged, the handler UNIONS the cited bullets' reviewIds → each category bullet's source reviews; persists PER_CATEGORY `{ summary, categories }` reusing the per-competitor structured shape; non-bulleted rewrites the category bulleted summary as prose + appends merge-never-overwrite to each in-category competitor's "Overall Analysis — Captured Reviews" box; NEW prompts `PER_CATEGORY_BULLETED/NONBULLETED v1`; NEW pure helpers `src/lib/competition-scraping/category-analysis-aggregation.ts` — `collectCategoryInputBullets` / `buildCategoryStructuredAnalysis` / `canonicalizeCategoryInputBullets` — + `.test.ts`; NO schema change; NO new route; a local `CategoryQueryPrisma` cast keeps the shared per-url deps type + real-PrismaClient wiring untouched) + `fb772ad` (Category Session 2 frontend — NEW `CategoryAiRunModal.tsx` [one parameterized modal for both category flows: model select / progress / per-category status / cost tally / cancel; categoryKey echo-guard before painting] + two "Auto-create Category Comprehensive Reviews Analysis (bulleted)/(non-bulleted)" buttons + live painting into Columns 12/13 on each category banner + re-hydrate on refresh + extended `review-analysis-list` GET to return PER_CATEGORY rows + `typeFilter`).
- **1 PENDING:** end-of-session doc-batch commit (this doc-batch agent's output) — carries the 7-doc Group A bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + CLAUDE_CODE_STARTER + this NEXT_SESSION + AI_MODEL_REGISTRY [unchanged content; listed for completeness]) + HANDOFF_PROTOCOL header bump + 1 Group B doc (REVIEWS_PHASE_2_DESIGN.md §B 2026-05-30-c) + 3 parent-MODIFIED polish-item-specs. **This doc-batch commit goes on `workflow-2-competition-scraping` ONLY — NO ff-merge to main; the category code stays off main until next session's deploy.**

**SIX Rule 14f decisions — 5 chose Recommended, 1 override** (the "continue or pause" picker — director chose "keep going" over the recommended "pause" so the Source Reviews column + the category deploy land together next session; the two Source Reviews design decisions [bullet-by-bullet always-visible layout + category-bullets-only scope] + the AI prompt wording + the FU-3 deploy gate all chose Recommended). Running cumulative was 144/147 → +5/+1 → **149/153 = 97.4% Yes-to-Recommended**.

**ONE Rule 9 deploy gate fired this session** (the FU-3 fix `bdec02e`).

**Schema-change-in-flight flag NO entire session (entry NO → exit NO)** — the FU-3 fix is a read-side selection change; the Category Session 2 backend reuses the existing `ReviewAnalysis` PER_CATEGORY storage (PER_CATEGORY enum + nullable urlId + typeFilter all already exist). **NEXT session = NO at entry** (the Source Reviews column reads already-persisted data; the deploy ships existing code).

**TWO open DEFERRED carry-forwards at exit (Rule 26):** (a) the Source Reviews column rendering + the Category Session 2 deploy (next session); (b) the Type-page Source Reviews mirror (Sessions 4-5).

**Baselines locked from this session:** root tsc clean + extension tsc clean + extension `npm test` = **910/910 UNCHANGED** + src/lib `node:test` = **1179/1179** (+23 from 1156 entry — +7 FU-3 `selectBulletedAnalysisRow` + 16 `category-analysis-aggregation`) + `npm run build` = **69 routes UNCHANGED** (reused the existing `/review-analysis/run-batch` endpoint — no new route).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-30-c** (no top-tier slip — director PASSED the deploy) capturing: (1) NEW reusable PATTERN — "A second same-level row discriminated only by `analysisJson.flow` can silently shadow the structured row a reader needs — select by flow, not recency" (the FU-3 root cause); (2) the Source Reviews feature design (the two Rule 14f decisions); (3) the category-non-bulleted write-back placement nuance flagged to director; (4) the one Rule 14f override; (5) the P-43 cwd-leak running tally ~31-33+. NO new memory file.

**NEW §B 2026-05-30-c entry appended to `docs/REVIEWS_PHASE_2_DESIGN.md`** (TWENTY-THIRD build/deploy-session §B entry per Rule 18; FIFTEENTH W5 entry; the FIRST Category-page AI-flows entry — the FU-3 fix + the two per-category AI flows + the Source Reviews provenance backend + the two category run modals + the write-back placement nuance; notes it does NOT regress the sibling Reviews Analysis Table page or the Category page's interactive batch).

**ROADMAP P-49 entry status updated to "🟢 IN-FLIGHT 2026-05-30-c"** with the FU-3 fix ✅ DEPLOYED + the Source Reviews feature design + the Category Session 2 BUILT-not-deployed state + (a.116) closes-partially / (a.117) opens for the Category Session 2 FINISH.

**SIXTIETH end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session. (a.117) / the Category page Session 2 FINISH is W#2-only Reviews Phase 2 work. The `./resume` / `./resume-workflow 2` scripts switch to the workflow-2 branch automatically. Verify with `git branch --show-current` immediately after entry; should be on `workflow-2-competition-scraping`.

**Expected branch state on entry** (after this session's end-of-session doc-batch lands on `workflow-2` ONLY): `main` stays at `bdec02e` (the FU-3 fix); `workflow-2-competition-scraping` is **AHEAD of main by ≥ 3 commits** — `d1659d7` (Category Session 2 backend) + `fb772ad` (Category Session 2 frontend) + the end-of-session doc-batch SHA. **This is intentional — the Category Session 2 code is committed and waiting; next session continues on top of it, does NOT re-do it.** Verify with `git log origin/main..HEAD --oneline` showing those commits (≥ 3); `git status` clean apart from historical untracked .zip + .html artifacts at repo root.

**Pre-build read list for next session** (the SessionStart hook auto-emits the 🔵 RULE 31 MANDATORY READ block listing the matching polish-item-specs files since this NEXT_SESSION.md references P-43 + P-49 + P-50 + P-51 + P-52; read §2 + §3 of each at session start):

- `docs/CLAUDE_CODE_STARTER.md` (mandatory; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/HANDOFF_PROTOCOL.md` Rule 31 (mechanical read-guarantee + audit-shipped-state mandate) + Rule 14f (forced-picker mechanics) + Rule 9 (deploy gate) + Rule 18 + Rule 23 (Change Impact Audit — likely N/A: no schema change expected) + Rule 24 (pre-capture search) + Rule 25 + Rule 26 + Rule 27 + Rule 30 (Session bookends) + §4 Step 4b extended template.
- **`docs/polish-item-specs/P-49-W5-S4-category-page.md` §2 (the 2026-05-30-c entry — the Source Reviews design + the two Category AI flows BUILT-not-deployed + the write-back placement nuance) + §3 (the rolled-up spec, esp. Columns 12/13 = the two "by category" AI flows + the NEW Source Reviews column)** — THE source-of-truth for the Source Reviews column rendering.
- `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` §2/§3 (Source Reviews cross-cutting + the Category Session 2 status + the pointer table).
- `docs/polish-item-specs/P-49-W5-S5-type-page.md` §2 (the Type page must inherit ALL Category behaviors INCLUDING the new Source Reviews feature — relevant when shaping the column so it generalizes).
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-30-c (this session — the FU-3 fix + the two category AI flows + the Source Reviews backend) + §A (the frozen design intent, esp. the PER_CATEGORY analysis-level decisions) + §B 2026-05-29-c (the per-competitor bulleted/non-bulleted flow patterns the category flows mirror) + §B 2026-05-31 + §B 2026-05-31-b (the detail-page traceability table the Source Reviews layout mirrors).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-30-c (this session's informational entry — the FU-3 PATTERN + the Source Reviews design + the write-back nuance).
- **The shipped + committed code to build on:** `src/app/projects/[projectId]/competition-scraping/reviews-analysis-by-category/page.tsx` (the page — Columns 12/13 on the banner rows now show the two category AI summaries; the Source Reviews column UI is what's missing) + `src/lib/competition-scraping/category-analysis-aggregation.ts` (`buildCategoryStructuredAnalysis` — already produces each category bullet's source-review ids the column renders against) + `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` (the `per-category-bulleted`/`per-category-nonbulleted` dispatch + the reviewId-union) + the NEW `CategoryAiRunModal.tsx` + the `review-analysis-list` GET (returns PER_CATEGORY rows + `typeFilter`) + `src/lib/competition-scraping/reviews-traceability.ts` (`selectBulletedAnalysisRow` + the detail-page traceability-table parse/build helpers the Source Reviews column should mirror in shape).
- **All existing memory files** at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`:
  - `feedback_plan_output_shape_before_building.md` — the Source Reviews layout/scope was already settled this session; if any further UI shape decisions arise, settle them WITH the director before coding.
  - `feedback_approval_scope_per_decision_unit.md` — the deploy that ships the WHOLE Category Session 2 feature (the two summaries + the Source Reviews column) is one decision unit; the 3-push pattern applies.
  - `feedback_destructive_ops_confirmation.md` + `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` + `feedback_trust_director_setup_confirmation.md` + `feedback_deferred_items_registry.md` + `feedback_remaining_roadmap_summary.md` + `feedback_handoff_carryovers_to_roadmap.md` + `feedback_session_bookends_plain_summary.md` + `feedback_playwright_for_repeatable_walkthroughs.md` + `feedback_browser_first_ai_with_server_migration.md`.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** **Per Rule 31 (with the 2026-05-28-b mechanical read-guarantee + audit-shipped-state mandate sub-sections), the SessionStart hook will auto-emit a 🔵 RULE 31 MANDATORY READ block; read §2 + §3 of each listed spec at session start — especially `docs/polish-item-specs/P-49-W5-S4-category-page.md` §2 (the 2026-05-30-c entry — the Source Reviews design + the BUILT-not-deployed category flows) + §3 (Columns 12/13 + the NEW Source Reviews column).** **This session is on `workflow-2-competition-scraping` — verify the branch first AND verify the two category commits `d1659d7` + `fb772ad` are present on the branch ahead of main (do NOT re-build them).** **Trust the harness `currentDate` for date-stamps; do NOT regress.**

**Session goal (a.117 / P-49 W5 Category page Session 2 FINISH):** build the **Source Reviews column** rendering — bullet-by-bullet, always visible, each category bullet's source reviews showing product name + star rating + review text + a jump-to-detail link, **category bullets only** — against the already-produced + persisted backend data (the category bulleted flow already unions the cited bullets' reviewIds onto each category bullet). THEN deploy the WHOLE Category Session 2 feature — the two category AI summaries (already built, `d1659d7` + `fb772ad`) + the Source Reviews column — to main TOGETHER, and run director Phase 4 real-Chrome verification on vklf.com. **Schema-change-in-flight = NO entry state** (the column reads already-persisted data; the deploy ships existing code). Then the Type page (Sessions 4-5) inherits ALL Category behaviors INCLUDING the Source Reviews feature.

**Branch verify (do this immediately after entry):**

```bash
git branch --show-current
# Expected: workflow-2-competition-scraping

git status
# Expected: clean working tree (apart from historical untracked .zip + .html artifacts at repo root)

git log origin/main..HEAD --oneline
# Expected: d1659d7 + fb772ad (the Category Session 2 backend + frontend) + the 2026-05-30-c doc-batch SHA — workflow-2 is AHEAD of main on purpose; do NOT re-build the category code
```

If `git branch --show-current` shows `main`, run `./resume-workflow 2`. If `d1659d7` + `fb772ad` are somehow NOT present, STOP and audit before building — they carry the entire category AI backend + frontend.

**Phase 0 (audit-shipped-state — confirm the category build is intact before adding the column):**

- **Audit-shipped-state (Rule 31):** confirm the committed Category Session 2 code is intact — `reviews-analysis-by-category/page.tsx` paints the two category AI summaries into Columns 12/13 on the banner rows; `CategoryAiRunModal.tsx` + the two Auto-create buttons run them; `category-analysis-aggregation.ts` (`buildCategoryStructuredAnalysis`) produces each category bullet's source-review ids; the `per-category-bulleted`/`per-category-nonbulleted` dispatch in `review-analysis-run-batch.ts` persists PER_CATEGORY `{ summary, categories }` with the reviewId-union. Confirm the detail-page traceability table (`reviews-traceability.ts` + `ReviewsTraceabilityTable.tsx`) is the shape to MIRROR for the Source Reviews column.
- **Confirm the FU-3 fix is live on main** (`bdec02e`) — the detail-page traceability table renders the bulleted structured row regardless of the prose row; the category build sits on top of it.

**Phase 1 (the Source Reviews column rendering):**

- Render the NEW Source Reviews column adjacent to the "Category Comprehensive (bulleted)" column — bullet-by-bullet, always visible, each category bullet's cell aligned with its source-reviews cell (mirror the detail-page traceability-table layout). Per source review: product name + star rating + review text + a jump-to-detail link icon. Category bullets ONLY (not the per-competitor column).
- Read the source-review ids the backend already unioned onto each category bullet (`buildCategoryStructuredAnalysis` output / the persisted PER_CATEGORY `analysisJson.categories`); resolve them to the `CapturedReview` product/star/text + the detail link.
- Test coverage: positive tests on the source-review resolution + the bullet↔source-reviews alignment selection logic; negative tests asserting the FU-3 fix, the two category AI flows, the per-competitor flows, and the Category page interactive-batch behaviors are unchanged.

**Phase 2 (deploy decision Rule 14f, once the column lands + scoreboard-verifies):** fire a deploy-now picker. On Yes, ff-merge the WHOLE Category Session 2 feature (`d1659d7` + `fb772ad` + the new column commit + doc-batches) to main + Vercel auto-redeploy + Phase 4 director real-Chrome verification on vklf.com. **Confirm at Phase 4 the category non-bulleted prose write-back placement** (it appends to each in-category competitor's "Your notes — Captured Reviews" box per the literal §1 spec; director may want it elsewhere).

**Scoreboard targets** (entry baselines = this session's exit baselines):

- Root tsc clean (UNCHANGED)
- Extension tsc clean (UNCHANGED)
- Extension `npm test` = 910/910 (likely UNCHANGED — the column is PLOS-side; confirm)
- src/lib `node:test` ≥ 1179 (entry 1179; expect +N for the source-review resolution + alignment tests)
- `npm run build` = 69 routes (likely UNCHANGED — the column reads existing data; no new route expected)
- Check 6 Playwright SKIPPED per Rule 27 (DEPLOY session; director real-Chrome Phase 4 used instead)

**Deploy mechanics:** 1 Rule 9 deploy gate planned (the whole Category Session 2 feature ships as one unit). On Yes, expect the standard 3-push pattern (push + ff-merge to main + push main + ping-pong workflow-2) per `feedback_approval_scope_per_decision_unit.md`. **NOTE the ff-merge range will span from `bdec02e` through `d1659d7` + `fb772ad` + the new work** — the two category commits land on main in THIS deploy (they were intentionally held off main this session).

**Schema-change-in-flight flag:** **NO entry → NO exit expected** (the column reads already-persisted data; the deploy ships existing committed code; no new column).

**Group A docs to update at session end:** ROADMAP header bump + P-49 polish-backlog entry status update (Category Session 2 ✅ DEPLOYED-AND-VERIFIED + Category page essentially CLOSED) + CHAT_REGISTRY header bump (183rd session) + DOCUMENT_MANIFEST header + flags + CORRECTIONS_LOG header (+ 1 NEW §Entry if anything notable) + HANDOFF_PROTOCOL header bump (likely header-bump-only) + CLAUDE_CODE_STARTER header bump + NEXT_SESSION full rewrite (likely the Type page Sessions 4-5).

**Group B docs to update at session end:** `docs/REVIEWS_PHASE_2_DESIGN.md` NEW §B entry (TWENTY-FOURTH build/deploy-session entry; SIXTEENTH W5 entry) IF code ships — capturing the Source Reviews column + the Category Session 2 deploy. `docs/polish-item-specs/P-49-W5-S4-category-page.md` (mark the Source Reviews column ✅ DONE + Category page CLOSED) + `docs/polish-item-specs/P-49-W5-S5-type-page.md` (note the Source Reviews pattern now shipped + must be mirrored) + `docs/polish-item-specs/P-49-W5-reviews-phase-2-master-spec.md` (§3 pointer table — Category page CLOSED; only the Type page Sessions 4-5 remaining).

**Standing carry-overs into this session:**

- **The Type-page Source Reviews mirror (DEFERRED)** — build the same Source Reviews feature for Type at Sessions 4-5; shape the Category column so it generalizes.
- **The category non-bulleted write-back placement** — confirm at Phase 4 (currently appends to each in-category competitor's "Your notes — Captured Reviews" box).
- **Opus 4.8 pricing numbers (P-52 carry-over)** — director may supply offline; relevant if the category AI flows surface cost estimates.
- **W#1 `AutoAnalyze.tsx` shared-list migration (P-52 carry-over)** — a future `main`-track tidy-up; not for this session.
- **(optional refinement) editable banner category name** — captured in the P-49 ROADMAP entry; the banner name is a read-only label today; director may request making it editable.

---

## Why this pointer was written this way (debug aid)

- **(a.117) the Category page Session 2 FINISH is the PICK** because the director chose (Rule 14f override on the continue-vs-pause picker) to build the two category AI flows + the Source Reviews backend THIS session but deploy NEXT session together with the Source Reviews column rendering. So the next unit is unambiguous: finish the one missing UI piece (the column), then deploy the whole feature.
- **The two category commits `d1659d7` + `fb772ad` are deliberately held off main** so the Category Session 2 feature deploys as one finished unit (the two summaries + the Source Reviews column together), per the director's "keep going" choice. Next session continues ON TOP of them — re-doing them would be a Rule 31 audit failure.
- **Schema-change-in-flight = NO at entry** because the Source Reviews column reads the already-persisted PER_CATEGORY `analysisJson` data (the category bulleted flow already unioned the cited bullets' reviewIds); no new column.
- **The FU-3 fix was deployed separately + immediately** because it was a live-bug fix (the traceability table had vanished for users) independent of the category build — it shipped under its own Rule 9 gate and was verified before the category build continued.
- **The write-back placement nuance is flagged** because the category non-bulleted prose appends to a box that Fix Session D relabeled "Your notes — Captured Reviews"; it was built to the literal §1 spec, but the director should confirm at Phase 4 that's the intended destination.

## Alternate next-session candidates if director shifts priorities at session start

- **(a.117.alt1) P-49 W5 Category page Session 2 FINISH** (current PICK — pre-loaded above). Build the Source Reviews column + deploy the whole Category Session 2 feature; on `workflow-2-competition-scraping`; Schema-change-in-flight NO.
- **(a.117.alt2) Deploy the Category Session 2 summaries FIRST, Source Reviews column second** (if the director prefers to ship the two AI summaries now and add the column in a follow-up deploy — splits the held-back unit; on `workflow-2-competition-scraping`).
- **(a.117.alt3) P-49 W5 Type page Sessions 4-5** (if the director prefers to start the Type page before finishing the Category Source Reviews column; the Type page inherits ALL Category behaviors including Source Reviews, with its own `typeTableLayout` column; on `workflow-2-competition-scraping`).
- **(a.117.alt4) Category page banner — editable category name** (the optional refinement; small UI follow-up; on `workflow-2-competition-scraping`).
- **(a.117.alt5) Resolve the P-52 Opus 4.8 pricing carry-over + W#1 shared-list migration** (a small `main`-track follow-up, if the director supplies official pricing numbers).
- **(a.117.alt6) P-43 mechanical prevention small fix** (single-session — add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`). Running tally ~31-33+; quick palate-cleanser.
- **(a.117.alt7) P-50 Condition Pathology card** (single-session — add a NEW card to two card-array files). Director already approved scope; quick palate-cleanser on `main`.
- **(a.117.alt8) P-51 per-Project competitive landscape AI summary** (per `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` skeleton — build session opens with Q&A). Slotted AFTER P-49 closes.
