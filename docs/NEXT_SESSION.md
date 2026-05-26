# Next session

**Written:** 2026-05-29 (`session_2026-05-29_p49-w4-captured-reviews-ui-session-1` — end-of-session handoff after **W#2 polish P-49 Reviews Phase 2 Workstream 4 Captured Reviews UI extensions Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-29 on `workflow-2-competition-scraping` via build commit `e89ae50` (9 files +2162/-43)** — first build session of the Reviews Phase 2 W4 cluster (Captured Reviews UI extensions on vklf.com); all 3 §C.4 pieces shipped in ONE session per the Rule 14f scope picker outcome (director picked Option B "All three" over Recommended Option A "§C.4 split into Sessions 1+2") — star-count counter-bar with click-to-filter per §A.14 + drag-to-reorder via the `sortRank Int?` column shipped W2 Session 1 (reusing the P-46 W3 S3 @dnd-kit shared debounced-mutation Pattern from 2026-05-23-f) per §A.5 + bulk-delete with multi-select checkboxes + confirm modal + new batch-delete API route per §A.6 — directly addresses the 2026-05-28 Phase 4 verification issue #3 ("no way to see reviews of specific star counts on vklf.com Captured Reviews section after the Amazon DEPLOY populated the corpus"). 52 new src/lib node:test cases (15 batch-delete + 17 reorder + 20 helpers) + 2 new API routes (POST batch-delete + PUT reorder). ZERO Rule 9 deploy gates fired (build commit stays on workflow branch until W4 deploy session per (a.97)). EXACTLY ONE Rule 14f forced-picker fired (Session 1 scope picker; director picked Option B over Recommended A — calibration data point 0/1 = 0% this session; running cumulative across recent 4 sessions: 23/26 = 88.5%). Schema-change-in-flight flag STAYS NO entire session (W4 is UI + 2 new API routes only; no schema work). Pre-build /scoreboard 5/5 GREEN at entry baselines (root tsc clean / extension tsc clean / **655 ext** / **786 src/lib** / **62 routes**); Check 6 SKIPPED per Rule 27. Post-build /scoreboard 5/5 GREEN at new baselines: extension **655/655 UNCHANGED** / **838 src/lib (+52)** / **64 routes (+2)**; Check 6 SKIPPED per Rule 27. **NEW baselines locked:** src/lib **838/838** (+52); npm run build **64 routes** (+2); extension **655/655 UNCHANGED**. **Closes (a.96) RECOMMENDED-NEXT** = P-49 W4 Captured Reviews UI extensions Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-29 via build commit `e89ae50`. **Opens (a.97) RECOMMENDED-NEXT** = P-49 W4 Captured Reviews UI extensions deploy session on `workflow-2-competition-scraping` → `main` (bundle build commit `e89ae50` + this doc-batch under ONE Rule 9 gate; Vercel auto-redeploys vklf.com; Phase 4 director real-Chrome verification ~6-step walkthrough — Customers-say banner above counter-bar / counter-bar shows per-star counts / click-to-filter narrows the list / multi-star OR works / bulk-select + delete batches correctly / drag-to-reorder persists + survives reload).

---

## What we did this session (in plain terms)

Today was the **first build session of the W4 Captured Reviews UI extensions cluster** — the three UI additions to the Captured Reviews section on the vklf.com URL detail page that were spec'd at the 2026-05-25-b design session and surfaced as the natural next task after yesterday's 2026-05-28 Amazon DEPLOY surfaced "no way to see reviews of specific star counts on vklf.com Captured Reviews section."

**Director picked the bundled-all-three path at the start.** The launch prompt locked all three pieces (counter-bar + bulk-delete + drag-reorder) into one session. The design doc §C.4 had estimated "~2-3 sessions" for the full W4 scope by splitting into Sessions 1 + 2. Claude framed a Rule 14f scope picker at the start of code mechanics offering Option A (§C.4 split — Recommended per most-thorough/reliable framing because smaller diff + 2 API surfaces + easier verification) vs Option B (all three per launch prompt) vs Option C (counter-bar only). **Director picked Option B (all three).** This was the first non-Recommended pick in recent W#2 sessions — calibration data point 0/1 = 0% this session, running cumulative 23/26 = 88.5% across recent 4 sessions, still well-calibrated overall but worth memorializing.

**All three pieces landed cleanly under one build commit `e89ae50` (9 files +2162/-43).** (1) **Star-count counter-bar with click-to-filter** at the top of the Captured Reviews section — horizontal bar showing per-star bucket counts (1-star × N through 5-star × N), each clickable to filter the list to that star only, multi-select OR semantics, "All" button to clear. (2) **Drag-to-reorder via @dnd-kit** — drag-and-drop within and across star buckets, 500ms debounced mutation, persists via a NEW PUT route at `/api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews/reorder` that writes the new `sortRank Int?` column shipped in W2 Session 1 + already in production from the 2026-05-28 Amazon DEPLOY. (3) **Bulk-delete with multi-select checkboxes** — checkbox on each row + "Delete selected" toolbar button + confirm modal + a NEW POST batch-delete route at `/api/projects/[projectId]/competition-scraping/reviews/batch-delete`. Both new API routes have proper DI seam handlers with full test coverage (15 batch-delete + 17 reorder cases) and proper ownership scoping (cross-project / cross-URL smuggling silently dropped via Prisma `findMany` ownership filter).

**Customers-say AI-summary row got its own banner above the counter-bar** — a NEW reusable Pattern memorialized in today's CORRECTIONS_LOG §Entry. The W2 Session 2 storage-shape Rule 14f outcome (starRating=5 sentinel + source="extension-scrape:customers-say") put the AI-summary text into the same captured-reviews table as a regular row, but the rendering UI needs to split it out so it doesn't inflate per-star counts, doesn't participate in drag-reorder, and doesn't participate in bulk-select. The split happens via a new `CUSTOMERS_SAY_SOURCE` constant + a `splitCustomersSay()` helper at render time. Today's session memorialized this as the "Customers-say split: separate AI-summary row from main reviews via source discriminator" reusable Pattern for future per-platform sub-cluster sessions (eBay/Etsy/Walmart) that ship their own AI-summary equivalents.

**A second NEW reusable Pattern got memorialized too** — "Pure helpers extracted from .tsx component file for node:test coverage." When the substantial pure-function logic inside `UrlDetailContent.tsx` (the comparator + split + count + filter + reorder-merge functions) was extracted into a new `src/lib/competition-scraping/captured-reviews-helpers.ts` module, node:test could load and exercise them directly — landing 20 new tests that would otherwise have required a Playwright spec or component-test infra. Future feature work on `'use client'` components should adopt the same extraction Pattern.

**Two API routes added + 52 new src/lib tests pushed the src/lib baseline from 786 to 838 + the route count from 62 to 64.** Extension baseline unchanged at 655 because W4 is purely PLOS-side. Schema-change-in-flight flag stayed NO the entire session because W4 doesn't touch the schema — the underlying `sortRank Int?` column shipped at W2 Session 1's `npx prisma db push` two days ago and reached production via yesterday's 2026-05-28 Amazon DEPLOY.

**Two P-43 cwd-leak Pattern Class reproductions** this session during pre-build Check 5 + post-build Check 5 — running tally now ~6-7+ across recent sessions including yesterday's 4-5+ on the Amazon DEPLOY session. The mechanical prevention small fix (add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`) remains opportunistic per the P-43 ROADMAP entry, but the empirical signal keeps mounting.

## What we'll do next session (in plain terms)

Next session is **P-49 W4 Captured Reviews UI extensions deploy session** on `workflow-2-competition-scraping` → `main`. The deploy bundles today's build commit `e89ae50` + this doc-batch commit under ONE Rule 9 gate via standard ff-merge:

**(1) Pre-deploy reads + branch state verify + pre-deploy /scoreboard 5/5 GREEN at the new baselines** (root tsc clean / extension tsc clean / 655 ext / 838 src/lib / 64 routes); Check 6 SKIPPED per Rule 27 picker (will fire as Rule 14f forced-picker at deploy session start).

**(2) Rule 9 deploy gate fires** — director picks Deploy now (Recommended); ff-merge `a40e4ba..HEAD` to main carrying 2 commits (build commit `e89ae50` + this doc-batch commit); push to `origin/main`; Vercel auto-redeploys vklf.com (~2-3 min); ping-pong push to `origin/workflow-2-competition-scraping` brings both branches even.

**(3) Phase 4 director real-Chrome verification** — director opens vklf.com on a project that has Amazon-scraped reviews (the corpus populated yesterday by the 2026-05-28 Amazon DEPLOY); navigates to the URL detail page; ~6-step walkthrough: (a) Customers-say banner renders separately above the counter-bar — visually distinct + doesn't count toward any star bucket; (b) Star-count counter-bar shows per-star counts matching the actual scraped data; (c) Clicking a star bucket filters the list to that star only; (d) Multi-star selection OR's the filters together; (e) Bulk-select multiple rows + click "Delete selected" → confirm modal → rows disappear after confirm; (f) Drag a row from its current position to a new position → row stays at new position + survives a page reload (sortRank persisted to DB).

**(4) Phase 4 PASS verdict expected** — these are bounded UI features against locked spec; no extension-side changes; no schema changes; no anti-bot considerations; no fix-forward cascade expected.

**(5) End-of-session doc-batch** covers the 9-doc canonical bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + NEXT_SESSION + REVIEWS_PHASE_2_DESIGN.md §B 2026-05-XX deploy entry + COMPETITION_SCRAPING_DESIGN.md likely UNCHANGED).

**(6) §4 Step 1c forced-picker at end-of-session locks the next-next task** — likely **P-49 W2 eBay Session 1** per §A.2 priority order (eBay second after Amazon; reuses today's UI plus the W2 Amazon Patterns) OR **P-49 W5 AI review analysis Session 1** (the analysis system can now operate on production review data from the Amazon DEPLOY) OR **P-48 Session 3 (Diagnostic #2)** (opportunistic insertion still queued).

Estimated **~1-1.5 hours in-Claude** for the W4 deploy session if Phase 4 PASSES first walkthrough. Schema-change-in-flight flag STAYS NO entire session. NO fresh extension zip needed (zero extension-side changes from W4 — the Amazon scraper code reached production via yesterday's deploy). 1 Rule 9 deploy gate planned.

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-29 (P-49 W4 Captured Reviews UI extensions Session 1 ✅ DONE-AT-CODE-LEVEL; W4 deploy session next):

- **P-49 W4 Captured Reviews UI extensions deploy session — NEXT (a.97).** ~1-1.5 hours. Standard deploy + Phase 4 verification; expected PASS first walkthrough (bounded UI features against locked spec; no extension-side changes; no schema changes).
- **P-49 W2 eBay sub-cluster (Sessions 1-3 + deploy).** ~3-4 sessions. Per §A.2 priority order — eBay second after Amazon. Reuses today's shared infrastructure + the cross-star loop Pattern + the trigger modal + the symmetric-helper Pattern from FF#1 + the URL-construction pagination Pattern from FF#4. The 2026-05-28 Amazon DEPLOY's Phase 4 fix-forwards (especially FF#1 dispatch helpers + FF#4 pageNumber-increment pagination) accelerate eBay's design.
- **P-49 W2 Etsy sub-cluster (Sessions 1-3 + deploy).** ~3-4 sessions. Per §A.2 priority order — Etsy third.
- **P-49 W2 Walmart sub-cluster (Sessions 1-3 + deploy).** ~3-4 sessions. Per §A.2 priority order — Walmart fourth.
- **P-49 W5 AI review analysis system.** ~5-10 sessions. 3 levels (per-product two-sweep + cross-Type pooled + cross-everything competitive landscape) using the `ReviewAnalysis` table shipped in W2 Session 1 + Claude Opus + per-run model-version dropdown + cost caps + fingerprint cache. Can operate on real production review data (the Amazon DEPLOY corpus exists since 2026-05-28).
- **P-49 total build arc ~11-21 sessions remaining.** Revised down by 1 from yesterday's ~12-22 since today closed the W4 Session 1 build step.
- **P-50 Condition Pathology card.** ~10 min in-Claude. Lives on `main` branch. Can slot into any deploy session OR done standalone. NOT on the critical path.
- **P-48 Session 3 (Diagnostic #2) — DEFERRED to opportunistic insertion.** ~30-60 min in-Claude. Empirical instrumentation pass to identify the ~6-7 fps source-file bottleneck for the screen-recording stutter.
- **P-43 mechanical prevention candidate (LOW informational).** ~1 small session. Add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`. **Empirical signal still mounting** — 2 more reproductions today; running tally ~6-7+ across recent sessions. Opportunistic but increasingly worth slotting in.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions, OR drop. Re-evaluate after Reviews Phase 2 closes.
- **P-27 Bug #9 + Bug #15 — DEFERRED LOW.** ~0-1 sessions. Likely obsolete after P-46. Re-evaluate after P-26.
- **W#2 graduation step (now further deferred).** Was originally gated by P-46 + P-47 + P-26. Now also gated by Reviews Phase 2 closure at the workstream-by-workstream level. Likely 6-12 months out at current sessions-per-week cadence.
- **THEN STOP AND EXPLICITLY ASK DIRECTOR for any next round of competition-scraping additions** per your standing directive after Reviews Phase 2 + P-48 stutter + P-43 + P-26 + P-27 all close.
- **After your next round of additions ships:** W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent.

---

## Status of last session

**W#2 polish P-49 Reviews Phase 2 Workstream 4 Captured Reviews UI extensions Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-29 on `workflow-2-competition-scraping` via build commit `e89ae50` (9 files +2162/-43)** — pure CODE session executing the (a.96) RECOMMENDED-NEXT task locked at the 2026-05-28 Amazon DEPLOY session's §4 Step 1c picker.

**Session shape (pure CODE — ZERO Rule 9 deploy gates; EXACTLY ONE Rule 14f forced-picker fired):**

- Pre-build reads at session start (CLAUDE_CODE_STARTER + ROADMAP P-49 entry + `docs/REVIEWS_PHASE_2_DESIGN.md` §A.5 + §A.6 + §A.14 + §C.4 + §B 2026-05-26 + §B 2026-05-27 + §B 2026-05-28 + `docs/CORRECTIONS_LOG.md` §Entry 2026-05-28 + `UrlDetailContent.tsx` + the P-46 W3 S3 @dnd-kit Pattern from 2026-05-23-f).
- Plain-terms session-start summary per Rule 30 — 3 mandatory sections (What we did last session / What this session will do / What's still left on the total roadmap).
- Branch state verify — `git branch --show-current` confirmed `workflow-2-competition-scraping`; `git log main..HEAD --oneline` showed **0 commits ahead** at session entry (matches launch prompt expectation).
- Pre-build /scoreboard 5/5 GREEN at entry baselines (root tsc clean / extension tsc clean / **655 ext** / **786 src/lib** / **62 routes**); Check 6 SKIPPED per Rule 27.
- Rule 14f scope picker fired at start of code mechanics — director picked Option B (All three) over Recommended Option A (§C.4 split into Sessions 1+2).
- Code mechanics: pure helpers extraction to `captured-reviews-helpers.ts` + 20 new tests; 2 new handlers (`reviews-batch-delete.ts` + `reviews-reorder.ts`) + 15 + 17 new tests + 2 thin route shims; `UrlDetailContent.tsx` rewrite (+637/-43) wiring counter-bar + drag-handle + checkbox + 500ms debounced reorder mutation + Customers-say banner.
- Build commit `e89ae50` landed (9 files +2162/-43).
- Post-build /scoreboard 5/5 GREEN at new baselines: extension **655/655 UNCHANGED** / **838 src/lib (+52)** / **64 routes (+2)**; Check 6 SKIPPED per Rule 27.
- **NEW baselines locked from this session:** src/lib **838/838** (+52 from 786); npm run build **64 routes** (+2 from 62); extension **655/655 UNCHANGED**.
- §4 Step 1c forced-picker at end-of-session — director picked Recommended (P-49 W4 Captured Reviews UI extensions deploy session) over P-49 W2 eBay Session 1 + P-49 W5 AI review analysis Session 1 + P-48 Session 3 alternatives.
- End-of-session doc-batch covers the 9-doc canonical bundle.
- **ONE push planned this session per `feedback_approval_scope_per_decision_unit.md`:** end-of-session push to `origin/workflow-2-competition-scraping` carrying build commit `e89ae50` + this doc-batch commit (PENDING). NO ff-merge to main this session per the build-session push pattern memorialized 2026-05-27.

**EXACTLY ONE Rule 14f forced-picker fired this session** — Session 1 scope picker (A) §C.4 split into Sessions 1+2 (Recommended per most-thorough/reliable framing — smaller diff + 2 API surfaces + easier verification) / (B) All three: counter-bar + bulk-delete + drag-reorder per last night's launch prompt / (C) Counter-bar only. **Director picked Option B (All three).** Calibration data point 0/1 = 0% Yes-to-Recommended this session; running cumulative across recent 4 sessions: 23/26 = 88.5%. NOT a session-trend signal (single-picker session); framing still well-calibrated overall; today's pick reflects a director-side scope preference that the launch prompt had already encoded.

**ZERO Rule 9 deploy gates fired this session** — build session only; build commit stays on workflow branch until W4 deploy session per (a.97).

**ZERO DEFERRED items at session end (Rule 26).** No carry-overs at entry or end. The (a.97) RECOMMENDED-NEXT = P-49 W4 deploy session is NOT a carry-over — it's the natural next step.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-29 (the FIRST 2026-05-29-dated §Entry)** capturing 5 sub-observations: (a) W4 Session 1 outcome — all 3 §C.4 pieces shipped in one session per Rule 14f scope picker; 52 new src/lib tests + 2 new API routes; (b) **NEW reusable Pattern "Pure helpers extracted from .tsx component file for node:test coverage"**; (c) **NEW reusable Pattern "Customers-say split: separate AI-summary row from main reviews via source discriminator"**; (d) LOW informational P-43 cwd-leak Pattern Class reproduction (2 more this session; running tally ~6-7+); (e) calibration data point (0/1 = 0% Yes-to-Recommended this session; running cumulative 23/26 = 88.5%).

**Baselines locked from this session:** root tsc clean / extension tsc clean / **extension `npm test` 655/655 UNCHANGED** / **src/lib `npm run -w src/lib test` 838/838 (+52 from 786 — exact match with the 52 new test cases: 15 batch-delete + 17 reorder + 20 helpers)** / **npm run build 64 routes (+2: batch-delete POST + reorder PUT)**. Check 6 Playwright SKIPPED per Rule 27.

**Schema-change-in-flight flag STAYS NO entire session.** W4 is UI + 2 new API routes only; no schema work; the underlying `sortRank Int?` column shipped at W2 Session 1's `npx prisma db push` + already in production via the 2026-05-28 Amazon DEPLOY initial deploy push.

**FORTIETH end-of-session run under the Rule 30 + §4 Step 4b template.** The 3 plain-terms sections above + the parent's Personalized Handoff continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-49 W4 deploy session begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` **2 commits ahead of `main`** (today's build commit `e89ae50` + today's doc-batch commit). `main` stays at `a40e4ba`. Verify with `git log main..HEAD --oneline` showing **2 commits ahead** at session entry. (Today's build session shipped 1 build commit + 1 doc-batch commit on the workflow branch; no ff-merge to main today per the build-session push pattern memorialized 2026-05-27.)

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-49 Reviews Phase 2 Workstream 4 Captured Reviews UI extensions deploy session on `workflow-2-competition-scraping` → `main`.** Closes **(a.97) RECOMMENDED-NEXT**. DEPLOY session — ONE Rule 9 deploy gate planned (initial deploy ff-merge of yesterday's W4 Session 1 build commit + doc-batch to main). Schema-change-in-flight flag STAYS NO entire session (W4 is UI + 2 new API routes only; no schema changes — the underlying `sortRank` column already in production from the 2026-05-28 Amazon DEPLOY). NO fresh extension zip needed (zero extension-side changes from W4 — the Amazon scraper code reached production via yesterday's 2026-05-28 deploy).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify the SHA relationships with `git log main..HEAD --oneline` — should show **2 commits ahead at session entry** (today's build commit `e89ae50` + today's doc-batch commit).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or deploy mechanics).
- `docs/ROADMAP.md` lines 1-30 (header + recent session sequence) + the **P-49 Reviews Phase 2 polish-backlog entry** (Status: "🟢 IN-FLIGHT 2026-05-29 — Workstream 2 Amazon ✅ DEPLOYED-AND-VERIFIED 2026-05-28 + Workstream 4 Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-29 via build commit `e89ae50` ... W4 deploy session NEXT per (a.97)").
- **`docs/REVIEWS_PHASE_2_DESIGN.md`** §A.5 (drag-to-reorder via sortRank) + §A.6 (bulk-delete) + §A.14 (star UI counter-bar) + §C.4 (Workstream 4 implementation outline) + §B 2026-05-29 (today's W4 Session 1 build-session entry) — the canonical canon for the deploy session's Phase 4 walkthrough.
- `docs/COMPETITION_SCRAPING_DESIGN.md` UNCHANGED this session expected (W4 is purely PLOS-side UI + 2 new API routes; no extension-side architectural work).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-29 (today's closing entry — TWO NEW reusable Patterns + P-43 cwd-leak Pattern Class reproduction + calibration data point) + §Entry 2026-05-28 (yesterday's Amazon DEPLOY closing entry — Phase 4 fix-forward cascade Pattern at N=4 + 3 NEW reusable Patterns).
- **The relevant UrlDetailContent.tsx component** — `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` (today's CapturedReviewsSection rewrite + new helper components).
- **The new src/lib helpers + handlers shipped today** — `src/lib/competition-scraping/captured-reviews-helpers.ts` + `reviews-batch-delete.ts` + `reviews-reorder.ts`.
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (deploy gate — 1 fire planned) + Rule 14f (forced-picker mechanics — expect 1-2 to fire this session: pre-deploy combined picker including Rule 27 Check 6 Playwright SKIP + Rule 9 initial deploy gate Deploy now; Phase 4 mode picker per `feedback_playwright_for_repeatable_walkthroughs.md` — Manual walkthrough Recommended for the W4 UI walkthrough; §4 Step 1c next-session picker at session-end) + Rule 18 + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — PLOS-side UI + new API route surface; no schema; schema-change-in-flight STAYS NO) + Rule 25 (Multi-Workflow — workflow-2 → main once) + Rule 26 (DEFERRED items registry — ZERO carry-overs at start) + Rule 27 (Playwright forced-picker — deploy session; SKIP Recommended per the standing precedent) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `feedback_recommendation_style.md` (most-thorough/reliable).
- `feedback_approval_scope_per_decision_unit.md` (deploy-session push pattern: deploy push + ping-pong + end-of-session doc-batch push + optionally end-of-session ff-merge + push for doc-batch).
- `feedback_default_to_recommendation.md`.
- `feedback_playwright_for_repeatable_walkthroughs.md` (Phase 4 mode picker per the directive).
- `feedback_session_bookends_plain_summary.md`.

**Task shape (P-49 W4 Captured Reviews UI extensions deploy session):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or deploy mechanics. The 3 plain-terms sections at top above provide the launch context.

2. **Pre-deploy reads** — execute the pre-build read list above. ~5-10 min.

3. **Branch state verify** — `git branch --show-current` (should be `workflow-2-competition-scraping`) + `git log main..HEAD --oneline` (should show **2 commits ahead at session entry** — today's build commit `e89ae50` + today's doc-batch commit). If anything else, surface to director.

4. **Pre-deploy /scoreboard** — confirm 5/5 GREEN at the new baselines on `workflow-2-competition-scraping` (root tsc clean / extension tsc clean / **655 ext** / **838 src/lib** / **64 routes**); Check 6 Playwright SKIP via Rule 14f forced-picker per Rule 27 (Recommended per the standing 39-session non-deploy SKIP precedent — though this IS a deploy session, the W4 UI changes don't have Playwright spec coverage; SKIP still Recommended; director picks).

5. **Rule 9 deploy gate combined picker** — director picks Deploy now (Recommended) covering the ff-merge + push + Vercel auto-redeploy + ping-pong. Ff-merge `a40e4ba..HEAD` to main carrying 2 commits (build commit `e89ae50` + today's doc-batch commit). Push to `origin/main`. Vercel auto-redeploys vklf.com (~2-3 min cycle). Ping-pong push to `origin/workflow-2-competition-scraping` brings both branches even at the deploy SHA.

6. **Phase 4 mode picker per `feedback_playwright_for_repeatable_walkthroughs.md`** — Manual walkthrough (Recommended for first real-Chrome run of new UI features) vs Draft Playwright spec vs Skip. Director picks. Manual walkthrough is the canonical choice for ~6-step UI walkthroughs.

7. **Phase 4 director real-Chrome verification — ~6-step walkthrough on vklf.com:** (a) Open a project with Amazon-scraped reviews (corpus populated by 2026-05-28 Amazon DEPLOY); navigate to URL detail page; confirm **Customers-say banner renders separately above the counter-bar** with distinct styling (not counting as a 5-star contribution); (b) Confirm **star-count counter-bar shows per-star counts** matching actual scraped data (e.g., 5-star × 200, 4-star × 200, 3-star × 200, 2-star × 200, 1-star × 200 if a 200-cap scrape); (c) Click a star bucket → list filters to that star only; click another star → multi-select OR; click "All" → filter clears; (d) Select 2+ rows via checkboxes → "Delete selected" toolbar button enables → click → confirm modal opens → confirm → rows disappear (page doesn't reload); (e) Drag a row from current position to new position within the same star → row stays at new position after release; (f) Reload the page → drag-reorder persisted (sortRank written to DB).

8. **Phase 4 outcome:** PASS verdict expected first walkthrough (bounded UI features against locked spec; no extension-side changes; no schema changes; no anti-bot considerations; no fix-forward cascade expected). If issues surface, fix-forward shape per Rule 14a (extend dispatch / extend handler / extend UI per the surfaced issue).

9. **§4 Step 1c forced-picker at session-end** — locks the next-next task per Rule 14f. Likely alternatives: P-49 W2 eBay Session 1 (Recommended per §A.2 priority order) vs P-49 W5 AI review analysis Session 1 (now possible with production review data) vs P-48 Session 3 (Diagnostic #2 — opportunistic insertion) vs P-43 mechanical prevention small fix (LOW informational; increasingly worth slotting in given the 6-7+ reproductions).

10. **End-of-session doc-batch** covers ROADMAP (header bump + P-49 W4 status flip from ✅ DONE-AT-CODE-LEVEL to ✅ DEPLOYED-AND-VERIFIED + (a.97) closes + (a.98) opens for whatever §4 Step 1c picker outcome) + CHAT_REGISTRY (header bump — 163rd session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header + new §Entry 2026-05-XX capturing W4 deploy outcome + any Patterns memorialized) + NEXT_SESSION (rewritten for next-next task per (a.98)) + HANDOFF_PROTOCOL (header bump only expected) + CLAUDE_CODE_STARTER (header bump only) + REVIEWS_PHASE_2_DESIGN.md §B 2026-05-XX (FIFTH build/deploy-session entry per Rule 18 — W4 deploy entry) + COMPETITION_SCRAPING_DESIGN.md (likely UNCHANGED — W4 is purely PLOS-side UI + 2 new API routes; no extension-side architectural work) + COMPETITION_DATA_V2_DESIGN.md (UNCHANGED — P-49 W4 is review-UI architecture, not data-shape).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** every Rule 14f picker fired during the deploy + Phase 4 walkthrough should surface the recommended path + default to it unless director shifts.

**Schema-change-in-flight flag:** **STAYS NO entire session** (W4 is UI + 2 new API routes only; no schema changes; underlying `sortRank` column already in production from 2026-05-28 Amazon DEPLOY).

**Rule 9 triggers planned this session: 1** (initial deploy ff-merge to main; possible additional Rule 9 gates if Phase 4 fix-forwards surface — within the W#2 P-46 W3 2026-05-24-f Pattern cap of 5 per session).

---

## Pre-session notes (offline steps for director between sessions)

**Recommended — no specific pre-session offline steps for the W4 deploy session.** Director can test the new UI on vklf.com immediately after the deploy completes + Vercel finishes redeploying (~2-3 min after the push). The Amazon-scraped review corpus already exists in production from the 2026-05-28 Amazon DEPLOY, so the counter-bar + click-to-filter + drag-reorder + bulk-delete have real data to render against from the first walkthrough.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking P-49 W4 deploy session at all — can happen any time. Director-independent.

---

## Standing carry-overs

**None this session.** No carry-overs at session entry; no carry-overs at session end. The (a.97) RECOMMENDED-NEXT = P-49 W4 deploy session is NOT a carry-over — it's the natural next step.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (deploy session does ff-merge + push; no rebases, no force pushes, no `git reset --hard`, no `git branch -D`).

**Rule 9 triggers planned this session: 1** (initial deploy ff-merge to main carrying today's build commit `e89ae50` + today's doc-batch commit). Possible additional Rule 9 gates if Phase 4 fix-forwards surface — within the W#2 P-46 W3 2026-05-24-f Pattern cap of 5 per session.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits an alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any code mechanics.

---

## Why this pointer was written this way (debug aid)

Today's session executed the (a.96) RECOMMENDED-NEXT task locked at the 2026-05-28 Amazon DEPLOY session — P-49 W4 Captured Reviews UI extensions Session 1. The Rule 14f scope picker at start of code mechanics yielded a non-Recommended director pick (Option B "All three" over Recommended Option A "§C.4 split into Sessions 1+2") — first non-Recommended pick in recent W#2 sessions but still well-calibrated overall (running cumulative 23/26 = 88.5%); today's pick reflects a director-side scope preference that the launch prompt had already encoded. All three pieces landed cleanly under one build commit `e89ae50`; 52 new src/lib tests + 2 new API routes; 5/5 scoreboard GREEN at expected new baselines.

The natural next-session task per (a.97) RECOMMENDED-NEXT is **P-49 W4 Captured Reviews UI extensions deploy session on `workflow-2-competition-scraping` → `main`** — ships the bundled W4 Session 1 build commit + this doc-batch to production for director to use the new UI immediately (corpus already exists from the 2026-05-28 Amazon DEPLOY).

- **(Recommended)** P-49 W4 Captured Reviews UI extensions deploy session — ships today's build to vklf.com for immediate use. Recommended because (a) build commit + doc-batch sit on the workflow branch ready to deploy; (b) W4 directly addresses the 2026-05-28 Phase 4 verification issue #3 that director surfaced ("no way to see reviews of specific star counts on vklf.com"); (c) deploying immediately puts the new UI in director's hands for the next testing pass against the existing Amazon corpus; (d) the deploy is bounded (PLOS-side only + no schema + 2 new API routes + UI rewrite) so Phase 4 PASS expected first walkthrough.

The shape of P-49 W4 Captured Reviews UI extensions deploy session is **plain-terms summary + pre-deploy reads + branch state verify + pre-deploy /scoreboard + Rule 9 deploy gate combined picker (Check 6 SKIP + Deploy now) + ff-merge + push + Vercel auto-redeploy + ping-pong + Phase 4 mode picker (Manual walkthrough Recommended) + Phase 4 ~6-step director real-Chrome walkthrough (Customers-say banner / counter-bar / click-to-filter / multi-star OR / bulk-select + delete / drag-to-reorder + reload persistence) + Phase 4 PASS verdict expected + §4 Step 1c next-session picker + end-of-session doc-batch (9 docs including REVIEWS_PHASE_2_DESIGN.md §B 2026-05-XX FIFTH build/deploy-session entry) + 3 pushes (deploy push to main + ping-pong to workflow-2 + end-of-session doc-batch push + end-of-session ff-merge + push for doc-batch)**.

**After W4 deploy session ships,** the next-next sessions step through P-49 W2 eBay Session 1 (per §A.2 priority order — eBay second after Amazon) → eBay Session 2 + deploy → Etsy sub-cluster → Walmart sub-cluster → W5 AI review analysis sub-cluster. Director picks at end-of-each-session Rule 14f next-task picker.

**Alternate next-session candidates if director shifts priorities at session start:**

- **P-49 W4 Session 2 (additional polish on W4 before deploy) — defer the deploy.** NOT recommended — today's W4 Session 1 shipped all 3 §C.4 pieces under one commit; no Session 2 needed. The §C.4 design doc estimate "~2-3 sessions" compressed into "1 session" per the Rule 14f scope picker outcome. Director would only pick this if they wanted to add specific polish AFTER seeing the W4 surface — but per Phase 4 verification convention, polish happens AFTER the deploy + Phase 4 walkthrough surfaces specific issues.
- **P-49 W2 eBay Session 1 — defer W4 deploy.** Per §A.2 priority order, eBay is the next W2 platform sub-cluster after Amazon. NOT recommended as the immediate next session — W4 build commit + doc-batch are already on the workflow branch; deploying them is operationally simpler than starting eBay first (which would either require splitting the ff-merge OR holding W4 indefinitely undeployed).
- **P-49 W5 AI review analysis Session 1 — defer W4 deploy.** W5 strictly depends on having review data to analyze; the 2026-05-28 Amazon DEPLOY put real review data in production for W5 to operate on. NOT recommended as the immediate next session per the same operational simplicity argument as eBay.
- **P-48 Session 3 (Diagnostic #2) — opportunistic insertion.** NOT recommended — W4 deploy is the natural next step; P-48 Session 3 is opportunistic and can interleave between W2 sub-cluster sessions later.
- **P-50 Condition Pathology card — small `main`-branch standalone session.** NOT recommended as the next-session task — P-50 is ~10 min in-Claude + lives on `main` not `workflow-2-competition-scraping`. Could slot into the W4 deploy session AFTER the W4 ff-merge if director wants — but only if Phase 4 PASSES first walkthrough + there's spare in-Claude time.
- **P-43 mechanical prevention small fix.** Increasingly justifiable given 6-7+ cwd-leak reproductions across recent sessions. NOT recommended as the immediate next session — opportunistic; defer to after W4 deploy session.
- **P-26 below-fold scroll capture evaluation.** NOT recommended — LOW alternate; re-evaluate after Reviews Phase 2 closes.
- **P-27 Bug #9 + Bug #15 re-evaluation.** NOT recommended — likely obsolete after P-46.
- **W#2 graduation step.** NOT recommended UNTIL Reviews Phase 2 + P-48 stutter + P-43 + P-26 + P-27 all close.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above.

Check `ROADMAP.md` for the canonical state. Check `docs/REVIEWS_PHASE_2_DESIGN.md` for the canonical interview-locked spec + the §B 2026-05-26 + §B 2026-05-27 + §B 2026-05-28 + §B 2026-05-29 build/deploy-session entries (the W2 Amazon arc + W4 Session 1 quartet). Check `docs/CORRECTIONS_LOG.md` §Entry 2026-05-29 (today's closing entry) for the TWO NEW reusable Pattern memorializations + P-43 cwd-leak Pattern Class reproduction + calibration data point.

---

## Personalized Handoff (parent Claude — copy into the director-facing summary)

**What we did this session (3-minute read):**

Today we shipped the first build session of the W4 Captured Reviews UI extensions cluster — the three UI additions to the Captured Reviews section on the vklf.com URL detail page that were spec'd at the 2026-05-25-b design session and surfaced as the natural next task after yesterday's 2026-05-28 Amazon DEPLOY revealed "no way to see reviews of specific star counts on vklf.com."

The launch prompt locked all three pieces (counter-bar + bulk-delete + drag-reorder) into one session. The design doc had originally split them into 2-3 sessions for verification ease, so Claude offered a Rule 14f scope picker at the start with the split as the Recommended path. You picked "All three" — the bundled path per the launch prompt. That was the first non-Recommended pick in recent W#2 sessions (calibration data point 0/1 = 0% this session; running cumulative 23/26 = 88.5%), but it worked out cleanly — all three pieces landed under one build commit `e89ae50`, 52 new tests, 2 new API routes, scoreboard 5/5 GREEN at expected new baselines.

The Customers-say AI-summary row (which W2 Session 2 stored as a special row with starRating=5 sentinel + source="extension-scrape:customers-say" discriminator) now gets its own banner above the counter-bar — it doesn't count toward any star bucket, doesn't participate in drag-reorder, doesn't participate in bulk-select. Two NEW reusable Patterns memorialized today: "Pure helpers extracted from .tsx component file for node:test coverage" + "Customers-say split: separate AI-summary row from main reviews via source discriminator."

P-43 cwd-leak Pattern Class reproduced 2 more times today during /scoreboard runs; running tally ~6-7+ across recent sessions. Mechanical prevention small fix is increasingly worth slotting in opportunistically.

**Files changed (high-level):**

- 1 build commit on the PLOS side: `e89ae50` (9 files +2162/-43)
  - 2 new src/lib handlers (`reviews-batch-delete.ts` + `reviews-reorder.ts`) with 15 + 17 new node:test cases
  - 2 thin API route shims (POST batch-delete + PUT reorder)
  - 1 new src/lib helpers module (`captured-reviews-helpers.ts`) with 20 new node:test cases extracted from the .tsx component
  - Major rewrite of `UrlDetailContent.tsx` wiring the counter-bar + drag-handle + checkbox + Customers-say banner + 500ms debounced reorder mutation
- 0 extension-side changes (W4 is purely PLOS-side UI + 2 new API routes)
- 0 schema changes (sortRank column already in production from 2026-05-28 Amazon DEPLOY)
- End-of-session doc-batch covers the 9-doc canonical bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + NEXT_SESSION + REVIEWS_PHASE_2_DESIGN.md §B 2026-05-29 + COMPETITION_SCRAPING_DESIGN.md UNCHANGED)

**Push status:**

- End-of-session push to `origin/workflow-2-competition-scraping` carrying build commit `e89ae50` + this doc-batch commit PENDING (about to fire)
- NO ff-merge to main this session per the build-session push pattern memorialized 2026-05-27 (build commit stays on workflow branch until W4 deploy session per (a.97))
- Branch state at end-of-session: `workflow-2-competition-scraping` 2 commits ahead of `main`; `main` stays at `a40e4ba`

**Deferred items at session end (Rule 26):** **ZERO.** No carry-overs at entry or end.

**END-OF-SESSION INSTRUCTIONS for you (the director, offline between sessions):**

No specific offline steps required. The standing optional offline step (raise the Supabase Global File Size Limit) remains available any time — see "Pre-session notes" above for the steps. NOT blocking.

When you start the next session, the W4 UI will be ready to deploy + test on vklf.com — the build commit + doc-batch are on the workflow branch waiting for the Rule 9 deploy gate at start of the next session.

**NEXT-SESSION INSTRUCTIONS for the next Claude Code session (the easy path):**

When you start the next session in Codespaces, run `./resume` (or `./resume-workflow 2`) — that will switch you to `workflow-2-competition-scraping` and pre-load context. Then paste the launch prompt above (the "Launch prompt" section). The next Claude will produce a 3-sentence plain-terms summary of what it'll do (per Rule 30) before any deploy mechanics; once you give go-ahead, it'll execute the W4 deploy session end-to-end. Expected ~1-1.5 hours in-Claude if Phase 4 PASSES first walkthrough. DEPLOY session — 1 Rule 9 deploy gate planned (initial deploy ff-merge of W4 Session 1 build commit + doc-batch to main).

**ESCAPE HATCH (if `./resume` doesn't work or you want a different task):**

If you'd rather pick a different next-session task, surface that at session start before any reads happen — the Rule 14f forced-picker mechanics will accommodate. The alternate candidates are listed in the "Alternate next-session candidates" section above; the most likely alternate is P-49 W2 eBay Session 1 (continues the W2 per-platform sub-cluster per §A.2 priority order — eBay second after Amazon).

**Offline between sessions:** None blocking. Optional Supabase file size limit raise remains available.

**Open questions / carry-overs:** None at session end. Today's session shipped all 3 §C.4 pieces under one commit per the Rule 14f scope picker outcome; no W4 Session 2 needed (compressed from §C.4 estimate "~2-3 sessions" to 1 session). W4 deploy session is the natural next step per (a.97); no separate carry-overs.

---
