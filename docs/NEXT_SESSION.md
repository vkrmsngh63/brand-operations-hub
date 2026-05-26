# Next session

**Written:** 2026-05-26 (`session_2026-05-26_p49-w2-amazon-session-1` — end-of-session handoff after **W#2 polish P-49 Reviews Phase 2 Workstream 2 Amazon Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-26 on `workflow-2-competition-scraping` via build commit `422436f` (20 files +2069/-7)** — first build session of the Reviews Phase 2 implementation arc; foundation session bundling schema migration (the §A.13/§A.16 package via `npx prisma db push` 1.44s additive only zero data loss) + shared content-script infrastructure (`scrape-pagination.ts` + `scrape-progress-indicator.ts`) + Amazon DOM walker (`amazon-review-extractor.ts`) + right-click context-menu wiring + PLOS-side handler extensions under one commit. ZERO Rule 9 deploy gates fired (build commits stay on workflow branch; no production deploy). ZERO Rule 14f forced-pickers fired (design doc + launch prompt removed all ambiguity from (a.93) scope). Schema-change-in-flight flag flipped NO → YES at `npx prisma db push`; stays YES until eventual Amazon deploy session (~3-5 sessions from now). Pre-build + post-build /scoreboard 5/5 GREEN at expected new baselines (root tsc clean / extension tsc clean / **611 ext +49 from baseline 562** — exact match with the 49 new test cases / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**); Check 6 Playwright SKIPPED per Rule 27. NEW baseline locked: extension `npm test` = **611/611**. **Closes (a.93) RECOMMENDED-NEXT** = P-49 W2 Amazon Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-26 via build commit `422436f`. **Opens (a.94) RECOMMENDED-NEXT** = P-49 W2 Amazon Session 2 (cross-star navigation loop + helpful-count sort within star + `Customers say` AI-summary block capture + trigger popup with per-URL cap override) on `workflow-2-competition-scraping`.

---

## What we did this session (in plain terms)

Today was the **first real build session for Reviews Phase 2** — the start of actual code shipping for the long-promised "next round of competition-scraping additions" that we captured over the past two sessions. The two prior sessions captured what we wanted (2026-05-25) and locked the 15 design decisions (2026-05-25-b); today we built the foundation that all the per-platform review extraction work will sit on.

Three big pieces shipped at the code level. **(1) The database schema** — four new fields on existing tables plus one brand-new table for AI review analysis. Specifically: `CapturedReview` got `sortRank` (for drag-to-reorder), `helpfulCount` (Amazon's "X people found this helpful" number), and `platform` (Amazon/eBay/Etsy/Walmart denormalized for query convenience). `CompetitorUrl` got `reviewScrapeCap` defaulting to 200 (the per-URL cap on how many reviews to scrape per star rating). And we added a new `ReviewAnalysis` table for the AI-driven analysis system that's coming in Workstream 5. The schema migration ran in 1.44 seconds against Supabase, was purely additive, and lost zero data. **(2) Shared infrastructure for review scraping** — two new files (~540 lines) that all four future per-platform modules (Amazon today, eBay/Etsy/Walmart coming) will reuse. `scrape-pagination.ts` handles the conservative anti-bot defaults (1-3 second random delays between page transitions, captcha detection that aborts cleanly, rate-limit detection via HTTP 429/503 status codes, user-cancellable via abort signal). `scrape-progress-indicator.ts` is a Shadow DOM-mounted corner indicator that shows "Scraping page N — X reviews captured so far..." on the page itself while the scrape runs. **(3) The Amazon-specific module** — `amazon-review-extractor.ts` (~300 lines) knows how to read an Amazon review page's DOM, extract each review row (star + title + body + helpful-count + date + reviewer), find the "Next page" URL, and orchestrate the multi-page walk. Plus the right-click context-menu wiring across `background.ts` + `messaging.ts` + `orchestrator.ts` so right-clicking an Amazon review page now offers "Scrape reviews for this URL" which dispatches to the Amazon extractor.

A nice implementation refinement worth noting: the pagination uses `fetch()` + `DOMParser` rather than clicking the live "Next page" link. Clicking the live link would navigate the actual browser tab, which would kill the running content-script and lose all in-memory scrape state. Fetching the next page's HTML and parsing it into an in-memory Document lets the scrape keep running for as many pages as needed. This is now memorialized as a reusable Pattern in the design doc.

49 new automated tests cover the new code; all 5 scoreboard checks went green at the expected new baselines (extension test count went from 562 to 611, exactly the +49 we added). The build commit lives on `workflow-2-competition-scraping` and does **NOT** ship to production this session — that comes ~3-5 sessions from now after we polish Amazon a bit more and run a real end-to-end test in your Chrome browser.

## What we'll do next session (in plain terms)

Next session is **P-49 W2 Amazon Session 2** — building on top of today's foundation. Today shipped Amazon scraping at a foundational level (one filter view, up to 200 reviews captured from whatever review-list filter you're currently on). Session 2 expands that to cover the full Amazon scope the design doc spec'd.

**Four things ship at the code level next session.** (1) **Cross-star navigation loop** — Amazon serves a different review page per star rating (1-star / 2-star / 3-star / 4-star / 5-star via the `&filterByStar=` URL parameter), each capped at 1000 reviews. Session 2's cross-star loop visits each of the 5 filter views in sequence and scrapes up to the per-URL cap per star. End result: ~200 reviews per star × 5 stars = up to 1000 reviews captured per Amazon product instead of today's 200 total. (2) **Helpful-count sort within star** — today we *capture* the helpful-count number but don't sort by it; Session 2 sorts the in-memory extracted rows by helpful-count descending before inserting, so the most-useful reviews land in the database first. (3) **`Customers say` AI-summary block capture** — Amazon's product listing pages (the `/dp/<ASIN>` URLs) have an AI-generated summary block at the top of the reviews section that captures common themes. Session 2 fetches the listing-page URL separately and pulls that block as a special `CapturedReview` row marked as "AI summary" rather than an individual review. (4) **Trigger popup with per-URL cap override** — a small Shadow DOM modal that appears before the scrape starts, showing the per-URL default cap (200/star) and letting you override it for this run (e.g., "just 50/star for a quick test" or "1000/star for a deep pull").

This is still a **build session, not a deploy session** — the build commit stays on `workflow-2-competition-scraping`. The Amazon production deploy ships at a later session (~2-4 sessions further out) under a Rule 9 gate, bundling Sessions 1 + 2 + (possibly 3) builds together.

**Important: the schema-change-in-flight flag stays YES.** Today's `prisma db push` brought the schema live in the dev Supabase database but the production deploy hasn't shipped yet. The flag stays YES through Sessions 2+ until the eventual Amazon deploy session ships everything together to production.

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-26 (P-49 W2 Amazon Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-26; foundation shipped; Amazon Session 2 next):

- **P-49 W2 Amazon Session 2 — NEXT (a.94).** ~1-1.5 hours in-Claude. Cross-star navigation loop + helpful-count sort + Customers-say block + trigger popup with cap override. Still a build session; no production deploy.
- **P-49 W2 Amazon Session 3 (if needed) + Amazon deploy session.** ~2-3 more sessions. Optional Session 3 for refinement based on real-Chrome calibration data; then the Amazon production deploy session (Rule 9 gate; Phase-4 real-Chrome verification by director on a real Amazon product).
- **P-49 W2 eBay sub-cluster (Sessions 1-3 + deploy).** ~3-4 sessions. Per §A.2 priority order — eBay second. Reuses today's shared infrastructure.
- **P-49 W2 Etsy sub-cluster (Sessions 1-3 + deploy).** ~3-4 sessions. Per §A.2 priority order — Etsy third. Reuses today's shared infrastructure.
- **P-49 W2 Walmart sub-cluster (Sessions 1-3 + deploy).** ~3-4 sessions. Per §A.2 priority order — Walmart fourth. Reuses today's shared infrastructure.
- **P-49 W4 Captured Reviews UI extensions.** ~2-3 sessions. Star-count counter-bar with click-to-filter, drag-to-reorder via the `sortRank` column shipped today, bulk-delete with multi-select + confirm modal. Interleavable with W2 platform builds.
- **P-49 W5 AI review analysis system.** ~5-10 sessions. 3 levels (per-product two-sweep + cross-Type pooled + cross-everything competitive landscape) using the `ReviewAnalysis` table shipped today + Claude Opus + per-run model-version dropdown + cost caps + fingerprint cache. Interleavable but most useful after W2 ships at least Amazon since it needs review data to summarize.
- **P-49 total build arc ~14-24 sessions remaining.** Revised down by 1 from yesterday's ~15-25 since Session 1 closed.
- **P-50 Condition Pathology card.** ~10 min in-Claude. Lives on `main` branch (platform-wide UI, not workflow-2-scoped). Can slot into any deploy session OR done standalone between W#2 sessions. NOT on the critical path.
- **P-48 Session 3 (Diagnostic #2) — DEFERRED to opportunistic insertion.** ~30-60 min in-Claude. Empirical instrumentation pass to identify the ~6-7 fps source-file bottleneck for the screen-recording stutter. Lives within the existing P-48 ROADMAP entry. Can interleave with P-49 work whenever you'd like to slot it in.
- **P-43 mechanical prevention candidate (LOW informational).** ~1 small session. Add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`. Opportunistic.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions, OR drop. Re-evaluate after Reviews Phase 2 closes.
- **P-27 Bug #9 + Bug #15 — DEFERRED LOW.** ~0-1 sessions. Likely obsolete after P-46. Re-evaluate after P-26.
- **W#2 graduation step (now further deferred).** Was originally gated by P-46 + P-47 + P-26. Now also gated by Reviews Phase 2 closure at the workstream-by-workstream level. Likely 6-12 months out at current sessions-per-week cadence.
- **THEN STOP AND EXPLICITLY ASK DIRECTOR for any next round of competition-scraping additions** per your standing directive after Reviews Phase 2 + P-48 stutter + P-43 + P-26 + P-27 all close.
- **After your next round of additions ships:** W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent.

---

**For:** the next Claude Code session — **P-49 W2 Amazon Session 2 (cross-star navigation loop + helpful-count sort within star + Customers-say block + trigger popup with cap override) on `workflow-2-competition-scraping`** (estimated ~1-1.5 hours in-Claude: pre-build doc reads + branch state verify + cross-star loop wiring atop the existing `paginate()` helper + helpful-count sort within star + `Customers say` block capture via a separate fetch from a `/dp/<ASIN>` URL + Shadow DOM trigger popup with per-URL cap override input + extension test additions + end-of-session doc-batch). Per Rule 23 Change Impact Audit: **EXTENSION + UI surface** (extends Amazon extractor; new Shadow DOM modal; no schema work — Session 1 shipped the full §A.13/§A.16 schema package). **Schema-change-in-flight flag STAYS YES at session start** (Session 1 flipped it; stays YES until Amazon deploy session). **Rule 9 triggers planned this session: ZERO** (build session only; no main push). **Pushes planned per `feedback_approval_scope_per_decision_unit.md`:** 2 (end-of-session push to workflow-2-competition-scraping carrying the build commit + doc-batch + end-of-session ff-merge to main for the doc-batch portion only — operationally adjacent + does NOT invoke Rule 9 since the build commits stay on the workflow branch until the eventual deploy session).

---

## Status of last session

**W#2 polish P-49 Reviews Phase 2 Workstream 2 Amazon Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-26 on `workflow-2-competition-scraping` via build commit `422436f` (20 files +2069/-7)** — first build session of the Reviews Phase 2 implementation arc; pure CODE session executing the (a.93) RECOMMENDED-NEXT task locked by yesterday's design session.

**Session shape (PURE CODE — ZERO Rule 9 gates fired; ZERO Rule 14f forced-pickers fired):**

- Pre-build reads at session start (CLAUDE_CODE_STARTER + ROADMAP P-49 entry + `docs/REVIEWS_PHASE_2_DESIGN.md` PRIMARY SPEC + `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-25-b + `prisma/schema.prisma` current shapes + extension content-script directory listing + P-47 `url-add-form.ts` / `video-capture-form.ts` Shadow DOM mount precedent + `styles.ts` for FORM_CHROME_CSS reference).
- Plain-terms session-start summary per Rule 30 — 3 mandatory sections (What we did last session / What this session will do / What's still left on the total roadmap).
- Branch state verify — `git branch --show-current` confirmed `workflow-2-competition-scraping`; `git log main..HEAD --oneline` showed 0 commits ahead (clean start from yesterday's doc-batch ff-merge).
- Rule 14f session-start confirmation: design doc + launch prompt + (a.93) RECOMMENDED-NEXT all aligned unambiguously; ZERO clarifying pickers fired per `feedback_default_to_recommendation.md`.
- Schema migration via `npx prisma db push` (1.44s; additive only; zero data loss) — the §A.13/§A.16 package: new `ReviewAnalysis` model + `ReviewAnalysisLevel` enum (PER_PRODUCT/PER_TYPE/PER_PROJECT) + `CapturedReview.sortRank Int?` + `.helpfulCount Int?` + `.platform String?` + `CompetitorUrl.reviewScrapeCap Int? @default(200)` + inverse relation `CompetitorUrl.reviewAnalyses ReviewAnalysis[]`. **Schema-change-in-flight flag flipped NO → YES at this step.**
- Shared content-script infrastructure built: NEW `scrape-pagination.ts` (~310 LOC) + NEW `scrape-progress-indicator.ts` (~230 LOC) reusing P-47 mount pattern.
- Amazon per-platform extractor built: NEW `amazon-review-extractor.ts` (~300 LOC) — URL detection + per-row DOM walker + `runAmazonReviewScrape` orchestrator using `fetch()` + `DOMParser` for pagination.
- Right-click context-menu wiring across `background.ts` + `messaging.ts` + `orchestrator.ts` — new `start-review-scrape` ContentScriptMessage + new `create-captured-review` BackgroundRequest + ASIN-matching dispatch.
- PLOS-side handler extensions additive to P-46 W2 S4 baseline — `url-reviews.ts` POST accept new optional `helpfulCount` + `platform`; `toWireShape` extended across 4 handler/route files; `src/lib/shared-types/competition-scraping.ts` extended with NEW `ReviewAnalysis` interface + `isReviewAnalysisLevel` type guard.
- 49 new extension node:test cases (`scrape-pagination.test.ts` +20 + `amazon-review-extractor.test.ts` +29) + 4 fixture-only updates extending makeRow factories with new column defaults.
- Pre-build + post-build /scoreboard 5/5 GREEN at expected new baselines (root tsc clean / extension tsc clean / **611 ext +49 from baseline 562** — exact match / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**); Check 6 Playwright SKIPPED per Rule 27.
- Build commit `422436f` committed locally; NOT pushed this session (push lands at end-of-session doc-batch).
- End-of-session doc-batch covers the 9-doc bundle (ROADMAP header bump + P-49 status flip to "🟢 IN-FLIGHT 2026-05-26" + Workstream 2 narrative + (a.93) close + (a.94) open / CHAT_REGISTRY header bump — 159th session / DOCUMENT_MANIFEST header bump + Group A + Group B modified/unchanged lists / CORRECTIONS_LOG header bump + NEW §Entry 2026-05-26 capturing TWO NEW reusable Patterns + calibration data point + LOW informational sub-observation / HANDOFF_PROTOCOL header bump only / CLAUDE_CODE_STARTER header bump only / this NEXT_SESSION full rewrite for Amazon Session 2 / REVIEWS_PHASE_2_DESIGN.md header bump + NEW §B 2026-05-26 FIRST build-session entry per Rule 18 / COMPETITION_SCRAPING_DESIGN.md header bump + NEW §B 2026-05-26 extension-side architecture cross-reference pointer entry).
- TWO pushes planned per `feedback_approval_scope_per_decision_unit.md`: end-of-session doc-batch push to `origin/workflow-2-competition-scraping` carrying build commit `422436f` + this doc-batch commit + end-of-session ff-merge + push to `origin/main` for doc-batch only (operationally adjacent + does NOT invoke Rule 9 since the build commit stays on the workflow branch).

**ZERO Rule 14f forced-pickers fired this session** — design doc + launch prompt + (a.93) RECOMMENDED-NEXT all aligned unambiguously; per `feedback_default_to_recommendation.md` no clarifying picker needed.

**ZERO Rule 9 deploy gates fired** entire session (build commits stay on `workflow-2-competition-scraping`; no production deploy this session).

**ONE DEFERRED carry-over at session end (Rule 26).** First end-to-end real-Chrome extraction test on a real Amazon product page (originally launch-prompt step 10) — deferred to the eventual Amazon deploy session ~3-5 sessions from now. Reason: PLOS-side handler changes aren't yet on production vklf.com — they ship at the Amazon deploy session. Captured in CORRECTIONS_LOG §Entry 2026-05-26 + the eventual deploy session's launch prompt; not in this NEXT_SESSION.md ## Standing carry-overs section since it requires the deploy session to be the resolution venue.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-26 (the P-49 W2 Amazon Session 1 closing entry)** capturing 5 sub-observations: (a) Session 1 outcome — first build session of P-49 W2 + schema + shared infra + Amazon DOM walker all shipped at code level under one build commit + 49 new tests + 5/5 scoreboard GREEN; (b) **NEW reusable Pattern "Content-script pagination via `fetch()` + `DOMParser` avoids the full-page-navigation kill"**; (c) **NEW reusable Pattern "Foundation session bundles schema + shared helpers + first per-platform module under one commit"**; (d) calibration data point — Session 1 within estimate; ZERO Rule 14f forced-pickers needed (well-calibrated upstream specs); (e) **LOW informational sub-observation — pure-design-session investment pays off at first build session** — the 2026-05-25-b design doc's 15 frozen decisions meant ZERO mid-build scope ambiguity; the third Pattern in the capture → design → build pipeline.

**Baselines locked from this session:** root tsc clean / extension tsc clean / **extension `npm test` 611/611 (+49 from baseline 562)** / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**. Check 6 Playwright SKIPPED per Rule 27.

**Schema-change-in-flight flag flipped NO → YES at `npx prisma db push`** — stays YES until the eventual Amazon deploy session (~3-5 sessions from now).

**THIRTY-SEVENTH end-of-session run under the Rule 30 + §4 Step 4b template.** The 3 plain-terms sections above + the parent's Personalized Handoff continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-49 W2 Amazon Session 2 begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` ahead of `origin/main` by ONE COMMIT (build commit `422436f` from Session 1 — has not yet ff-merged to main since it's a build session not a deploy session) PLUS this session's end-of-session doc-batch SHA. `main` exactly even with `origin/main` at this session's end-of-session ff-merge SHA (doc-batch portion ff-merged; build commit `422436f` stays on the workflow branch). Verify with `git log main..HEAD --oneline` showing 1 commit ahead at session entry (the Session 1 build commit). Next session's build commit lands on workflow branch ONLY (no ff-merge to main this session); the eventual Amazon deploy session 2-4 sessions from now ff-merges all bundled build commits to main under Rule 9 gate.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-49 Reviews Phase 2 Workstream 2 Amazon Session 2 on `workflow-2-competition-scraping`.** Closes **(a.94) RECOMMENDED-NEXT**. Build session — cross-star navigation loop atop the existing `paginate()` helper from Session 1 + helpful-count sort within star (sort the in-memory extracted rows by helpfulCount desc before inserting) + `Customers say` AI-summary block capture on the product listing page (separate fetch from a `/dp/<ASIN>` URL; persists as a special `CapturedReview` row with new marker — likely a `kind` discriminator or a special `source` value within the existing string field) + Shadow DOM trigger popup with per-URL cap override input (small modal mounted before the scrape starts; shows per-URL `reviewScrapeCap` default + lets director override for this run). **NO production deploy this session** — build commits stay on `workflow-2-competition-scraping` until the eventual Amazon deploy session (2-4 sessions from now after possibly Session 3 refinement).

BUILD session — ZERO Rule 9 gates planned. NO main push for code expected. ONE end-of-session push to `origin/workflow-2-competition-scraping` carrying the new build commit + this doc-batch + ONE doc-batch ff-merge to main (operationally adjacent; does NOT invoke Rule 9 since the build commit stays on the workflow branch).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify both branches' SHA relationships with `git log main..HEAD --oneline` — should show **1 commit ahead at session entry** (the Session 1 build commit `422436f`).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or build mechanics).
- `docs/ROADMAP.md` lines 1-30 (header + recent session sequence) + the **P-49 Reviews Phase 2 polish-backlog entry** (Status: "🟢 IN-FLIGHT 2026-05-26" + Workstream 2 narrative with Session 1 ✅ DONE-AT-CODE-LEVEL note + (a.93) close + (a.94) open).
- **`docs/REVIEWS_PHASE_2_DESIGN.md` PRIMARY SPEC for this session.** §A.1 collection method (Extension only) + §A.2 per-platform priority (Amazon first) + §A.3 scrape execution (in-page Shadow DOM progress indicator) + §A.4 per-star cap UX (per-URL `reviewScrapeCap` column + per-trigger override — the Session 2 scope today) + §A.13/§A.16 schema (already shipped Session 1 — confirms field shapes for the Customers-say capture path) + §A.15 anti-bot defensive posture (conservative 1-3s delays + captcha-aware abort + rate-limit UI notification — already shipped Session 1; Session 2 reuses) + §C.2 W2 Per-platform extension extraction implementation outline (Amazon sub-cluster Session 2 scope) + §B 2026-05-26 (NEW yesterday — FIRST build-session §B entry covering Session 1's foundation including the fetch+DOMParser Pattern + Foundation-session-bundles Pattern).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-26 (Session 1 extension-side cross-reference pointer) + §B 2026-05-25-b (P-49 Design Session cross-reference pointer) + §A.7 (content-script architecture overview — Session 2's cross-star loop extends today's Amazon module) + §B 2026-05-19-g (P-23 saved-URL dropdown — URL-prefix dispatch pattern reused) + §B 2026-05-24-d (P-47 Shadow DOM mount as structural replacement — mount strategy reused for the new trigger popup).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-26 (P-49 W2 Amazon Session 1 closing entry) — yesterday's closing §Entry with the TWO NEW reusable Patterns memorialized.
- `extensions/competition-scraping/src/lib/content-script/scrape-pagination.ts` (NEW from Session 1 — the `paginate()` helper Session 2's cross-star loop wraps).
- `extensions/competition-scraping/src/lib/content-script/scrape-progress-indicator.ts` (NEW from Session 1 — the Shadow DOM indicator Session 2 may extend with a per-star indicator if needed).
- `extensions/competition-scraping/src/lib/content-script/amazon-review-extractor.ts` (NEW from Session 1 — the per-platform module Session 2 extends with cross-star loop + helpful-count sort + Customers-say capture).
- `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` (MODIFIED Session 1 — Session 2 may extend the `start-review-scrape` handler to pre-fire the trigger popup before dispatching).
- `prisma/schema.prisma` `CapturedReview` model + `CompetitorUrl` model — current shapes per Session 1's schema additions; Session 2 reads + writes existing fields (no schema work).
- `docs/HANDOFF_PROTOCOL.md` Rule 18 (Interview-cluster + append-only DESIGN doc — Session 2 §B entry lands in `REVIEWS_PHASE_2_DESIGN.md`) + Rule 14f (forced-picker mechanics — expect 0-1 to fire this session) + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — EXTENSION + UI surface; no schema) + Rule 24 (search before capturing — relevant for any sub-implementation-decisions that surface mid-build) + Rule 25 (Multi-Workflow — workflow-2 only) + Rule 26 (DEFERRED items registry — ONE carry-over to eventual Amazon deploy session) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `feedback_recommendation_style.md` (most-thorough/reliable).
- `feedback_approval_scope_per_decision_unit.md` (2-push build-session pattern).
- `feedback_default_to_recommendation.md`.
- `feedback_session_bookends_plain_summary.md`.

**Task shape (P-49 W2 Amazon Session 2):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or build mechanics.

2. **Pre-build reads** — execute the pre-build read list above. ~10-15 min (lighter than Session 1's reads since the design doc is now familiar + Session 1's code is the relevant precedent).

3. **Branch state verify** — `git branch --show-current` (should be `workflow-2-competition-scraping`) + `git log main..HEAD --oneline` (should show 1 commit ahead at session entry — the Session 1 build commit `422436f`).

4. **Rule 14f session-start confirmation** — likely no picker fires unless director surfaces a scope shift between sessions.

5. **Cross-star navigation loop** — extend `runAmazonReviewScrape` in `amazon-review-extractor.ts` to accept an optional `starsToVisit` config (default: visit each of the 5 filterByStar values 1-5 in sequence; allow override to a single star or subset). For each star, construct the per-star URL pattern (`https://www.amazon.com/product-reviews/<ASIN>/?filterByStar=<star-name>&pageNumber=1` where `<star-name>` is one of `one_star` / `two_star` / `three_star` / `four_star` / `five_star` per Amazon's URL convention) + walk that star's pages 1..N via the existing `paginate()` helper + accumulate rows. Cap per star = `reviewScrapeCap` from the CompetitorUrl row.

6. **Helpful-count sort within star** — sort the in-memory extracted rows by `helpfulCount` desc within each star's batch BEFORE inserting via `createCapturedReview`. Preserves insert-order as helpful-count-desc so the database `sortRank` column (Session 1 schema addition) can be populated by the orchestrator at create time.

7. **`Customers say` AI-summary block capture** — for the trigger URL's parent product (extract ASIN via existing `extractAsinFromReviewUrl` + construct `/dp/<ASIN>` listing-page URL) + fetch that listing page via the same fetch+DOMParser Pattern + extract the `Customers say` block (Amazon's selector likely `[data-hook="cr-insights-widget"]` or similar — verify with director-provided real product spec at session-start) + persist as a special `CapturedReview` row marked with a discriminator. **Per Rule 14f**: if the design doc doesn't lock the discriminator field shape (it spec'd a special row type but didn't specify the exact column), fire a Rule 14f picker offering (A) reuse the existing `kind` or `source` column with a new value like `'customers-say-summary'` (Recommended — additive; no schema change) / (B) add a new `kind` enum (more typed but requires another schema migration). Recommended (A).

8. **Shadow DOM trigger popup with per-URL cap override input** — new file `extensions/competition-scraping/src/lib/content-script/scrape-trigger-modal.ts` (or extend `scrape-progress-indicator.ts`). Shadow DOM mount reusing the P-47 pattern. Small modal with title "Scrape reviews for this URL" + label "Per-star cap (default 200)" + numeric input pre-filled with the CompetitorUrl's `reviewScrapeCap` value + "Start scrape" + "Cancel" buttons. Modal appears when the right-click context-menu fires `start-review-scrape`; orchestrator awaits modal resolution before dispatching to `runAmazonReviewScrape`.

9. **Test additions** — new node:test cases covering cross-star URL construction + helpful-count sort behavior + Customers-say block parser + trigger modal helpers. Expect ~20-30 new test cases.

10. **End-of-session doc-batch** covers ROADMAP (header bump + P-49 W2 Amazon Session 2 status note added to the entry; (a.94) closes + (a.95) opens for whichever next-task — likely P-49 W2 Amazon Session 3 refinement OR W2 Amazon deploy session if Session 2 was complete enough) + CHAT_REGISTRY (header bump — 160th session) + DOCUMENT_MANIFEST (header bump only) + CORRECTIONS_LOG (header + new §Entry capturing the Session 2 outcome + any reusable Patterns memorialized during the build) + NEXT_SESSION (rewritten for next-next task per (a.95)) + HANDOFF_PROTOCOL (header bump only) + CLAUDE_CODE_STARTER (header bump only) + REVIEWS_PHASE_2_DESIGN.md §B 2026-05-27-or-similar (Workstream 2 Amazon Session 2 second §B entry in the design doc per Rule 18) + COMPETITION_SCRAPING_DESIGN.md (likely UNCHANGED this session — Session 2 doesn't introduce content-script-architecture-spanning changes; just extends today's Amazon module; if the trigger modal introduces a reusable pattern relevant to future per-platform modules, consider a brief cross-reference entry) + COMPETITION_DATA_V2_DESIGN.md (UNCHANGED — P-49 W2 is review-extraction architecture, not data-shape).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** every Rule 14f picker fired during the build should surface the recommended path + default to it unless director shifts.

**Schema-change-in-flight flag:** STAYS **YES** entire Session 2 (Session 1 flipped it; stays YES through Sessions 2+ until the eventual Amazon deploy session ships the migration to production). Session 2 itself does NOT touch the schema — just reads + writes existing fields from Session 1's schema additions.

---

## Pre-session notes (offline steps for director between sessions)

**Optional — not required for the next session:**

- **Open a competitor's Amazon product page in a Chrome tab** so testing the cross-star loop end-to-end is immediate when we get to step 5 of next session (still deferred to deploy session for FULL end-to-end against production; Session 2 builds the cross-star loop in code). Pick a product with 100+ reviews across multiple star ratings so the per-star pagination has meaningful data per star.
- **Skim the Session 1 §B 2026-05-26 entry in `docs/REVIEWS_PHASE_2_DESIGN.md`** to refresh context on the foundation Session 2 builds atop. Particularly the fetch+DOMParser Pattern (Session 2's cross-star loop uses the same Pattern per-star) + the shared `paginate()` + `scrape-progress-indicator.ts` infrastructure (Session 2 reuses both).
- **Optional: identify the exact CSS selector for Amazon's `Customers say` block on a product listing page** by opening Chrome DevTools on a real product, finding the block, and Copy → Copy selector. Saves ~10 min in Session 2 if you do this between sessions. The most common selectors are `[data-hook="cr-insights-widget"]` or `#cr-summarization-attributes` or similar — Amazon does evolve these so a fresh selector check would be useful.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking P-49 W2 Amazon Session 2 at all — can happen any time. Director-independent.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`). Pure build session on the workflow branch.

**Rule 9 triggers planned this session: ZERO** — no main push for code expected. Build commits stay on `workflow-2-competition-scraping`; the eventual Amazon deploy session (2-4 sessions from now) ff-merges all bundled build commits to main under Rule 9 gate.

**Rule 9 triggers expected in upcoming sessions:** the Amazon deploy session (2-4 sessions from now) WILL fire Rule 9 gate — first shipment of the §A.13/§A.16 schema migration to production + the Amazon scraper code + Phase-4 director real-Chrome verification of the Amazon end-to-end extraction (first end-to-end real-Chrome extraction test on a real Amazon product page; carry-over from Session 1 per Rule 26). Schema-change-in-flight flag will be YES throughout the build sessions leading up to that deploy.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits an alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any build mechanics.

---

## Why this pointer was written this way (debug aid)

Today's session executed the (a.93) RECOMMENDED-NEXT task locked yesterday — the P-49 W2 Amazon Session 1 foundation build. Build commit `422436f` (20 files +2069/-7) ships the schema migration + shared content-script infrastructure + Amazon DOM walker at code level. ZERO Rule 14f forced-pickers fired (design doc + launch prompt unambiguous) — the calibration data point that the upstream capture → design pipeline (sessions 2026-05-25 + 2026-05-25-b) did its job.

The natural next-session task per (a.94) RECOMMENDED-NEXT is **P-49 W2 Amazon Session 2 on `workflow-2-competition-scraping`** — the cross-star navigation loop + helpful-count sort + Customers-say block + trigger popup with per-URL cap override. This is the second build session in the Amazon sub-cluster (foundation + refinement → possible Session 3 + deploy session).

- **(Recommended)** P-49 W2 Amazon Session 2 — cross-star loop + helpful-count sort + Customers-say block + trigger popup. Recommended because (a) it's the locked next-session task per the launch prompt + the (a.94) RECOMMENDED-NEXT context handed off by Session 1; (b) per §A.4 of the design doc, the per-trigger cap override is the canonical Session 2 UX addition (Session 1 shipped the per-URL default; Session 2 ships the per-trigger override); (c) per §C.2 of the design doc, the cross-star loop is the canonical Session 2 scope expansion (Session 1 shipped single-filter-view scrape; Session 2 expands to 5 filter views); (d) per §A.1 of the design doc Amazon-side specs, the Customers-say block is the canonical Session 2 listing-page capture (Session 1 didn't touch listing pages); (e) Session 2 reuses everything Session 1 shipped (`paginate()` helper + `scrape-progress-indicator.ts` + Amazon extractor + context-menu wiring) without re-design.

The shape of P-49 W2 Amazon Session 2 is **plain-terms summary + pre-build reads + branch state verify + Rule 14f session-start confirmation (likely no picker fires) + cross-star loop wiring + helpful-count sort + Customers-say block capture + Shadow DOM trigger popup with per-URL cap override + extension test additions + end-of-session doc-batch (9 docs including REVIEWS_PHASE_2_DESIGN.md §B 2026-05-27-or-similar second build-session entry) + 2 pushes (workflow-branch push + doc-batch ff-merge to main)**.

**After Amazon Session 2 ships,** the next-next sessions step through possibly P-49 W2 Amazon Session 3 (refinement of any first-pass issues + Playwright spec for the scrape flow) → Amazon DEPLOY session (under Rule 9 gate; first production deploy of the §A.13/§A.16 schema migration + the Amazon scraper code; bundles Sessions 1 + 2 + 3 builds together) + Phase-4 real-Chrome verification by director on a real Amazon product (this is where the Session 1 carry-over resolves) → P-49 W2 eBay Session 1 (reusing all the shared infrastructure landed today) → ... continue through W2 sub-clusters → W4 Captured Reviews UI extensions (interleavable) → W5 AI review analysis system (interleavable but most useful after at least Amazon ships) → then P-43 mechanical prevention + P-26 below-fold scroll + P-27 re-evaluation → W#2 graduation step → THEN STOP AND EXPLICITLY ASK director for next round of competition-scraping additions per director's standing directive.

**Alternate next-session candidates if director shifts priorities at session start:**

- **P-49 W4 Captured Reviews UI extensions Session 1 — defer W2 Amazon Session 2 to a later session.** NOT recommended — W4 doesn't strictly depend on W2 (W4 ships the UI for reviews already in the database from existing manual entry per P-46 W2 Session 4), but starting W2 Amazon first lets W4 surfaces test against real extension-scraped data immediately rather than against the smaller manual-entry corpus. Per A.2 of the design doc, Amazon W2 is the locked priority sequence.
- **P-49 W5 AI review analysis system Session 1 — defer W2 Amazon Session 2 to a later session.** NOT recommended — W5 strictly depends on having review data to analyze, and W2 Amazon Session 2 is the next step toward getting full per-star-cap review data into the database. W5 makes more sense interleaved after W2 Amazon ships at least one platform.
- **P-48 Session 3 (Diagnostic #2) — defer P-49 W2 Amazon Session 2 to a later session.** NOT recommended — P-49 is the major scope expansion that gates W#2 graduation + already in-flight with Session 1 shipped. P-48 Session 3 is opportunistic and can interleave with P-49 work.
- **P-50 Condition Pathology card — small `main`-branch standalone session.** NOT recommended as the next-session task — P-50 is ~10 min in-Claude + lives on `main` not `workflow-2-competition-scraping`. Better to slot it into a future deploy session or do it standalone between W#2 sessions.
- **P-43 mechanical prevention small fix.** NOT recommended — P-43 is LOW informational + opportunistic. Better after P-49 W2 Amazon Session 2 lands.
- **P-26 below-fold scroll capture evaluation.** NOT recommended — P-26 is LOW alternate; re-evaluate after Reviews Phase 2 closes (which is months out).
- **P-27 Bug #9 + Bug #15 re-evaluation.** NOT recommended — likely obsolete after P-46. Re-evaluate after P-26.
- **W#2 graduation step.** NOT recommended UNTIL Reviews Phase 2 + P-48 stutter + P-43 + P-26 + P-27 all close. Currently many months out.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.

Check `ROADMAP.md` for the canonical state. Check `docs/REVIEWS_PHASE_2_DESIGN.md` for the canonical interview-locked spec + the §B 2026-05-26 FIRST build-session entry. Check `docs/CORRECTIONS_LOG.md` §Entry 2026-05-26 (P-49 W2 Amazon Session 1 closing entry) for the TWO NEW reusable Pattern memorializations + 5 sub-observations.
