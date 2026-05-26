# Next session

**Written:** 2026-05-27 (`session_2026-05-27_p49-w2-amazon-session-2` — end-of-session handoff after **W#2 polish P-49 Reviews Phase 2 Workstream 2 Amazon Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-27 on `workflow-2-competition-scraping` via build commit `1830074` (5 files +1054/-99)** — second build session of the Reviews Phase 2 implementation arc atop the Session 1 foundation; cross-star navigation loop + helpful-count sort within star + `Customers say` AI-summary block capture + Shadow DOM trigger popup with per-URL cap override all shipped at code level under one commit. ZERO Rule 9 deploy gates fired (build session only; build commits stay on workflow branch until the Amazon deploy session per (a.95)). EXACTLY ONE Rule 14f forced-picker fired (Customers-say block storage-shape: director picked Recommended Option A — starRating=5 sentinel + source="extension-scrape:customers-say" discriminator). Schema-change-in-flight flag STAYS YES entire session carrying from Session 1; STAYS YES through this session; FLIPS TO NO at Amazon deploy completion. Pre-build + post-build /scoreboard 5/5 GREEN at new baseline (root tsc clean / extension tsc clean / **633 ext +22 from Session 1 baseline 611** — exact match with the 22 new test cases / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**); Check 6 Playwright SKIPPED per Rule 27. NEW baseline locked: extension `npm test` = **633/633**. **Closes (a.94) RECOMMENDED-NEXT** = P-49 W2 Amazon Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-27 via build commit `1830074`. **Opens (a.95) RECOMMENDED-NEXT** = P-49 W2 Amazon DEPLOY session (bundle Sessions 1 + 2 build commits + intervening doc-batches as one ff-merge under Rule 9 gate; Vercel auto-redeploy; fresh extension zip via `npm run zip`; Phase 4 director real-Chrome verification on a real Amazon product page resolves the Session 1 deferred carry-over) on `workflow-2-competition-scraping` → `main`.

---

## What we did this session (in plain terms)

Today was the **second build session** of the Amazon review-scraping arc — picking up where yesterday's foundation session (Session 1) left off. Yesterday shipped the building blocks (database changes + shared pagination helpers + a basic Amazon DOM walker that could scrape one filter view). Today expanded that into the full Amazon scope the design doc spec'd.

**Four things shipped at the code level today.** **(1) Cross-star navigation loop** — Amazon serves a different review page per star rating (1-star / 2-star / 3-star / 4-star / 5-star via the `&filterByStar=` URL parameter). Today the scraper visits all 5 star filters in sequence per product and pulls up to the per-star cap per star. End result: up to ~200 reviews per star × 5 stars = up to 1,000 reviews per Amazon product instead of yesterday's 200 total from a single filter view. **(2) Helpful-count sort within star** — yesterday we captured Amazon's "X people found this helpful" number but didn't sort by it; today we sort the in-memory rows by helpful-count descending before inserting, so the most-useful reviews land in the database first within each star group. **(3) `Customers say` AI-summary block capture** — Amazon's product listing pages have an AI-generated summary block at the top of the reviews section that captures common themes. Today we fetch that listing-page URL separately and pull that block as a special row (stored with starRating=5 as a sentinel value + a `source` field of "extension-scrape:customers-say" to mark it as the AI summary rather than an individual review — director picked this storage shape from a 4-option Rule 14f picker). **(4) Trigger popup with per-URL cap override** — a small Shadow DOM modal that appears before the scrape starts, showing the per-URL default cap and letting you override it for this specific run (e.g., 50/star for a quick test or 1,000/star for a deep pull).

A few implementation notes worth surfacing. The cross-star loop is an **extension of yesterday's `fetch()` + `DOMParser` Pattern** — yesterday's scraper rooted page 1 in the live DOM (the page you're already on when you right-click); today's cross-star loop fetches page 1 too via fetch+DOMParser, because the loop visits 5 different filter views and only ONE of them can be the live DOM. The trigger modal is the **second use of the Shadow DOM mount pattern from P-47** (the first was yesterday's progress indicator) — same mount strategy: open shadow root on a fixed-positioned host div, inject CSS inside the shadow, return a Promise that resolves when the user clicks Start or rejects when they Cancel. 22 new automated tests cover the new helpers; the extension test count went from yesterday's 611 to 633 — exactly the +22 we added. The build commit stays on `workflow-2-competition-scraping` and does **NOT** ship to production this session.

**Important calibration note: at session-start we discovered that yesterday's planned "ff-merge doc-batch to main without the build commit" didn't actually execute.** The local `main` branch is still at `1914171` (the 2026-05-25-b design-session doc-batch), not at yesterday's doc-batch SHA. Reason: when a build commit sits between main and the doc-batch on the workflow branch (commit ordering `main ← build ← doc-batch`), a standard fast-forward merge would ship BOTH together. The only ways to ff-merge just the doc-batch would be cherry-pick (creates a new SHA on main, breaks the ff-only invariant) or rebase (destructive). Yesterday's session must have detected this and silently aborted. **Today's resolution:** ONE push only to the workflow branch — no ff-merge to main attempted this session either. All four commits (Session 1 build + Session 1 doc-batch + Session 2 build + Session 2 doc-batch) stay on `workflow-2-competition-scraping` until the next session's Amazon deploy ff-merges everything together under Rule 9 gate. This is captured as a NEW reusable Pattern in today's CORRECTIONS_LOG §Entry 2026-05-27: "Build-session end-of-session push pattern: ONE push to workflow branch, NOT two." Going forward, the NEXT_SESSION pointer convention for any build session sitting on top of an existing un-shipped build commit should say "ONE push planned" not "TWO pushes planned."

## What we'll do next session (in plain terms)

Next session is the **P-49 W2 Amazon DEPLOY session** — the long-awaited first production deploy of the Reviews Phase 2 work. Two full Amazon build sessions (1 + 2) plus their interleaved doc-batches plus today's doc-batch will all ship together to vklf.com under ONE Rule 9 gate.

**The deploy session has four phases.** **(1) Pre-deploy /scoreboard verification** — confirm 5/5 GREEN at the current baselines (root tsc clean / extension tsc clean / 633 ext / 786 src/lib / 62 routes) on `workflow-2-competition-scraping`. **(2) Rule 9 deploy gate** — ff-merge `workflow-2-competition-scraping` → `main` (bundles all 4 commits since `1914171`); push to `origin/main`; Vercel auto-redeploy fires (~2-3 minute cycle); first production deploy of the §A.13/§A.16 schema migration (`ReviewAnalysis` model + new `CapturedReview` columns + `CompetitorUrl.reviewScrapeCap`) + the Amazon scraper code; Schema-change-in-flight flag FLIPS YES → NO at deploy completion. **(3) Fresh extension zip** via `npm run zip` from `extensions/competition-scraping/` — produces a new `plos-extension-*.zip` at repo root; director loads it unpacked in Chrome (or via Chrome Web Store Unlisted update if that path is configured). **(4) Phase 4 director real-Chrome verification on a real Amazon product page** — this is the long-deferred carry-over from Session 1. Director opens a real Amazon product page with multi-star reviews, right-clicks → "Scrape reviews for this URL", picks the cap in the trigger modal, watches the Shadow DOM progress indicator advance through 5 star filters (1-star, 2-star, 3-star, 4-star, 5-star) + the Customers-say summary block, then checks the URL detail page on vklf.com to confirm the reviews landed correctly with the new fields populated (helpfulCount, platform, source discriminator for the Customers-say row).

If Phase 4 surfaces issues (likely — first real-Chrome run of a major feature; some Amazon selectors may have drifted since the design doc was written), expect a fix-forward cycle: small UI-only or selector-tweak commits ship under additional Rule 9 gates within the same deploy session per the P-46 W3 + W4 deploy precedent.

**Important: the schema-change-in-flight flag stays YES at session start and FLIPS TO NO at deploy completion.** This is the canonical "in-flight schema-change ships to production" transition that yesterday's `npx prisma db push` set up.

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-27 (P-49 W2 Amazon Session 2 ✅ DONE-AT-CODE-LEVEL; Amazon DEPLOY session next):

- **P-49 W2 Amazon DEPLOY session — NEXT (a.95).** ~1 session. Rule 9 gate. Schema-change-in-flight flag flips YES → NO at completion. Phase 4 director real-Chrome verification resolves the Session 1 deferred carry-over.
- **P-49 W2 Amazon Session 3 (if needed).** ~0-1 sessions. Only if Phase 4 surfaces something that needs more than fix-forward effort. Optional.
- **P-49 W2 eBay sub-cluster (Sessions 1-3 + deploy).** ~3-4 sessions. Per §A.2 priority order — eBay second. Reuses today's shared infrastructure + the cross-star loop pattern + the trigger modal.
- **P-49 W2 Etsy sub-cluster (Sessions 1-3 + deploy).** ~3-4 sessions. Per §A.2 priority order — Etsy third.
- **P-49 W2 Walmart sub-cluster (Sessions 1-3 + deploy).** ~3-4 sessions. Per §A.2 priority order — Walmart fourth.
- **P-49 W4 Captured Reviews UI extensions.** ~2-3 sessions. Star-count counter-bar with click-to-filter, drag-to-reorder via the `sortRank` column shipped in Session 1, bulk-delete with multi-select + confirm modal. Interleavable with W2 platform builds.
- **P-49 W5 AI review analysis system.** ~5-10 sessions. 3 levels (per-product two-sweep + cross-Type pooled + cross-everything competitive landscape) using the `ReviewAnalysis` table shipped in Session 1 + Claude Opus + per-run model-version dropdown + cost caps + fingerprint cache.
- **P-49 total build arc ~13-23 sessions remaining.** Revised down by 1 from yesterday's ~14-24 since Session 2 closed.
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

**For:** the next Claude Code session — **P-49 W2 Amazon DEPLOY session on `workflow-2-competition-scraping` → `main`** (estimated ~30-60 min in-Claude pre-deploy + Vercel auto-redeploy ~2-3 min + Phase 4 real-Chrome verification ~15-30 min + any fix-forward cycles if Phase 4 surfaces issues). Per Rule 23 Change Impact Audit: **SCHEMA + EXTENSION + UI surface** (first production deploy of the §A.13/§A.16 schema migration + the Amazon scraper code + the new wire-shape fields). **Schema-change-in-flight flag STAYS YES at session start; FLIPS TO NO at deploy completion** (canonical schema-change-ships-to-production transition). **Rule 9 triggers planned this session: AT LEAST ONE** (deploy push to `origin/main`); potentially more if Phase 4 surfaces fix-forward needs. **Pushes planned per `feedback_approval_scope_per_decision_unit.md`:** at least 4 (Rule 9 deploy push to origin/main + ping-pong push to origin/workflow-2-competition-scraping + end-of-session doc-batch push + end-of-session ff-merge + push to origin/main for doc-batch — though after deploy the doc-batch can ff-merge cleanly since main and workflow-2 will be even).

---

## Status of last session

**W#2 polish P-49 Reviews Phase 2 Workstream 2 Amazon Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-27 on `workflow-2-competition-scraping` via build commit `1830074` (5 files +1054/-99)** — second build session of the Reviews Phase 2 implementation arc atop the Session 1 foundation; pure CODE session executing the (a.94) RECOMMENDED-NEXT task locked by Session 1.

**Session shape (PURE CODE — ZERO Rule 9 gates fired; EXACTLY ONE Rule 14f forced-picker fired):**

- Pre-build reads at session start (CLAUDE_CODE_STARTER + ROADMAP P-49 entry + `docs/REVIEWS_PHASE_2_DESIGN.md` §A.1-A.16 + §B 2026-05-26 + `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-26 + §B 2026-05-19-g (P-23) + §B 2026-05-24-d (P-47) + `docs/CORRECTIONS_LOG.md` §Entry 2026-05-26 + Session 1's new content-script modules — `scrape-pagination.ts` + `scrape-progress-indicator.ts` + `amazon-review-extractor.ts` + `orchestrator.ts` + `prisma/schema.prisma` current CapturedReview/CompetitorUrl shapes).
- Plain-terms session-start summary per Rule 30 — 3 mandatory sections (What we did last session / What this session will do / What's still left on the total roadmap).
- Branch state verify — `git branch --show-current` confirmed `workflow-2-competition-scraping`; `git log main..HEAD --oneline` showed **2 commits ahead of main** (Session 1 build `422436f` + Session 1 doc-batch `1323f9a`), not 1 as the Session 1 pointer expected. **Drift surfaced + non-destructively recovered** — see CORRECTIONS_LOG §Entry 2026-05-27 sub-observation (d).
- Cross-star navigation loop refactor in `amazon-review-extractor.ts` — `runAmazonReviewScrape` went from "scrape current view" to ASIN-driven cross-star loop visiting all 5 filterByStar values; AmazonScrapeContext shape changed (`cap` → `capPerStar`; NEW `asin` + optional `starsToVisit`); AmazonScrapeResult gains `insertedByStar` + `customersSayInserted`; captcha + rate-limit abort the whole scrape per §A.15.
- Helpful-count sort within star — NEW `sortByHelpfulCountDesc` helper (stable; null sorts last; pure functional preserving immutability) applied per-star before saveReview.
- `Customers say` AI-summary block capture — NEW `extractCustomersSayFromListing` helper with 4 selector fallbacks (`[data-hook="cr-insights-widget"]` canonical + 3 alternates); fetched via the same fetch+DOMParser Pattern from a separate `/dp/<ASIN>` listing-page URL; persisted as a special row with starRating=5 sentinel + source="extension-scrape:customers-say" discriminator per the Rule 14f picker outcome.
- **ONE Rule 14f forced-picker fired** — Customers-say block storage-shape picker (the launch prompt explicitly anticipated this). 4 options offered: (A) starRating=5 sentinel + source="extension-scrape:customers-say" — no schema change, no wire-validator change, but lies about rating; (B) Relax wire validator to allow starRating=0 sentinel — cleaner semantic but couples validator to source; (C) Add new `amazonCustomersSayText` column on CompetitorUrl — additive schema change; (D) Defer Customers-say entirely. Director picked Option A (Recommended).
- Shadow DOM trigger popup with per-URL cap override — NEW `scrape-trigger-modal.ts` (320 LOC) mounted via the P-47 pattern (SECOND consumer after Session 1's progress indicator); per-star-cap numeric input pre-filled with saved per-URL `reviewScrapeCap` default; returns Promise resolving to `{ capPerStar }` on Start OR null on Cancel/Escape/backdrop click; NEW `clampCap` pure helper (MIN_CAP=1, MAX_CAP=5000; floors decimals; returns 200 for non-finite).
- `orchestrator.ts` refactor — `start-review-scrape` handler now fires `openScrapeTriggerModal` BEFORE dispatching to `runAmazonReviewScrape` + builds new context shape + saveReview wrapper passes `input.source` through to `createCapturedReview`.
- 22 new node:test cases — `scrape-trigger-modal.test.ts` (5 for `clampCap`) + `amazon-review-extractor.test.ts` (+182; 17 new cases for all new helpers).
- Pre-build + post-build /scoreboard 5/5 GREEN at expected new baseline (root tsc clean / extension tsc clean / **633 ext +22 from Session 1 baseline 611** — exact match / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**); Check 6 Playwright SKIPPED per Rule 27.
- Build commit `1830074` committed locally; NOT pushed this session (push lands at end-of-session doc-batch).
- End-of-session doc-batch covers the 9-doc bundle (ROADMAP header bump + P-49 status flip with Amazon Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-27 narrative + (a.94) close + (a.95) open / CHAT_REGISTRY header bump — 160th session / DOCUMENT_MANIFEST header bump + Group A + Group B modified/unchanged lists / CORRECTIONS_LOG header bump + NEW §Entry 2026-05-27 capturing TWO NEW reusable Patterns + LOW informational drift sub-observation + calibration data point / HANDOFF_PROTOCOL header bump only / CLAUDE_CODE_STARTER header bump only / this NEXT_SESSION full rewrite for Amazon DEPLOY session / REVIEWS_PHASE_2_DESIGN.md header bump + NEW §B 2026-05-27 SECOND build-session entry per Rule 18 / COMPETITION_SCRAPING_DESIGN.md header bump + NEW §B 2026-05-27 extension-side architecture cross-reference pointer entry).
- **ONE push only this session per `feedback_approval_scope_per_decision_unit.md`:** end-of-session push to `origin/workflow-2-competition-scraping` carrying build commit `1830074` + this doc-batch commit. **NO ff-merge to main this session** per the drift analysis (CORRECTIONS_LOG §Entry 2026-05-27 sub-observation (b)).

**EXACTLY ONE Rule 14f forced-picker fired this session** — the Customers-say block storage-shape picker (director picked Option A Recommended). The discriminator field choice (source vs. new column) was NOT a separate picker — the launch prompt locked the recommended path (reuse source column with new value) and per `feedback_default_to_recommendation.md` no re-confirmation picker fired.

**ZERO Rule 9 deploy gates fired** entire session (build commits stay on `workflow-2-competition-scraping`; no production deploy this session).

**ONE DEFERRED carry-over at session end (Rule 26).** First end-to-end real-Chrome extraction test on a real Amazon product page — carrying from Session 1; resolves AT the Amazon deploy session (next session per (a.95)) by definition since the Phase-4 verification IS the resolution venue. Captured in CORRECTIONS_LOG §Entry 2026-05-27 + the deploy session's launch prompt below; not in ## Standing carry-overs section since it resolves at the next session.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-27 (the P-49 W2 Amazon Session 2 closing entry)** capturing 5 sub-observations: (a) Session 2 outcome — cross-star loop + helpful-count sort + Customers-say block + trigger popup all shipped under one build commit; 22 new tests; 5/5 scoreboard GREEN at expected new baseline; (b) **NEW reusable Pattern "Build-session end-of-session push pattern: ONE push to workflow branch, NOT two"**; (c) **NEW reusable Pattern "Pre-emptive design choice rolled into Rule 14f picker"**; (d) LOW informational sub-observation — drift surfaced + non-destructively recovered; (e) calibration data point — Session 2 within estimate; multi-session arcs compound.

**Baselines locked from this session:** root tsc clean / extension tsc clean / **extension `npm test` 633/633 (+22 from Session 1 baseline 611)** / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**. Check 6 Playwright SKIPPED per Rule 27.

**Schema-change-in-flight flag STAYS YES** entire session carrying from Session 1; STAYS YES at end of this session; FLIPS TO NO at Amazon deploy session completion.

**THIRTY-EIGHTH end-of-session run under the Rule 30 + §4 Step 4b template.** The 3 plain-terms sections above + the parent's Personalized Handoff continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-49 W2 Amazon DEPLOY session begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` ahead of `origin/main` by **FOUR COMMITS**:
1. Session 1 build commit `422436f` (foundation: schema + shared infra + Amazon DOM walker)
2. Session 1 doc-batch `1323f9a` (end-of-session bundle for Session 1)
3. Session 2 build commit `1830074` (cross-star loop + helpful-count sort + Customers-say + trigger modal)
4. Session 2 doc-batch (this session's end-of-session bundle SHA — TBD)

`main` exactly even with `origin/main` at `1914171` (2026-05-25-b design-session doc-batch SHA — has NOT moved since Session 1 design-session ff-merge). Verify with `git log main..HEAD --oneline` showing **4 commits ahead** at session entry. The Amazon deploy session ff-merges all 4 commits to main under ONE Rule 9 gate.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-49 Reviews Phase 2 Workstream 2 Amazon DEPLOY session on `workflow-2-competition-scraping` → `main`.** Closes **(a.95) RECOMMENDED-NEXT**. Deploy session — bundle Sessions 1 + 2 build commits + intervening doc-batches as one ff-merge under Rule 9 gate; Vercel auto-redeploy fires; fresh extension zip via `npm run zip`; **Phase 4 director real-Chrome verification on a real Amazon product page** (resolves the Session 1 deferred carry-over — first end-to-end real-Chrome extraction test on a real Amazon product).

DEPLOY session — AT LEAST ONE Rule 9 gate planned (the ff-merge deploy push to origin/main); potentially more if Phase 4 surfaces fix-forward needs. At least 4 pushes planned per `feedback_approval_scope_per_decision_unit.md` (deploy push to origin/main + ping-pong push to origin/workflow-2-competition-scraping + end-of-session doc-batch push + end-of-session ff-merge + push to origin/main for doc-batch — though after deploy the doc-batch can ff-merge cleanly since main and workflow-2 will be even).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify the SHA relationships with `git log main..HEAD --oneline` — should show **4 commits ahead at session entry** (Session 1 build `422436f` + Session 1 doc-batch `1323f9a` + Session 2 build `1830074` + Session 2 doc-batch SHA).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or deploy mechanics).
- `docs/ROADMAP.md` lines 1-30 (header + recent session sequence) + the **P-49 Reviews Phase 2 polish-backlog entry** (Status: "🟢 IN-FLIGHT 2026-05-27 — Workstream 2 Amazon Sessions 1 + 2 ✅ DONE-AT-CODE-LEVEL on `workflow-2-competition-scraping`; Workstream 2 Amazon DEPLOY session NEXT per (a.95)").
- **`docs/REVIEWS_PHASE_2_DESIGN.md`** §A.13/§A.16 (schema package — first production deploy today) + §A.1 collection method (Extension only) + §A.4 per-star cap (per-URL default + per-trigger override — both shipped in Sessions 1 + 2) + §A.3 scrape execution (in-page Shadow DOM progress indicator) + §A.15 anti-bot defensive posture + §B 2026-05-26 (Session 1 first build-session entry) + §B 2026-05-27 (Session 2 second build-session entry — NEW yesterday).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-27 (Session 2 cross-reference pointer) + §B 2026-05-26 (Session 1 cross-reference pointer) + §A.7 (content-script architecture overview).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-27 (Session 2 closing entry — TWO NEW reusable Patterns + drift sub-observation) + §Entry 2026-05-26 (Session 1 closing entry — TWO NEW reusable Patterns + foundation Pattern).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (deploy gate — fires for the ff-merge push) + Rule 14a (fix-forward picker mechanics if Phase 4 surfaces issues) + Rule 14f (forced-picker mechanics — expect 0-2 to fire this session for fix-forward shaping if needed) + Rule 18 + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — SCHEMA + EXTENSION + UI surface; schema-change-in-flight FLIPS YES → NO at deploy completion) + Rule 25 (Multi-Workflow — workflow-2 → main) + Rule 26 (DEFERRED items registry — the Session 1 + 2 carry-over RESOLVES this session via Phase 4 verification) + Rule 27 (Playwright forced-picker for verification — director real-Chrome verification is the Phase 4 step) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `feedback_recommendation_style.md` (most-thorough/reliable).
- `feedback_approval_scope_per_decision_unit.md` (deploy session push pattern: 4+ pushes per the deploy + ping-pong + doc-batch convention).
- `feedback_default_to_recommendation.md`.
- `feedback_session_bookends_plain_summary.md`.
- `feedback_playwright_for_repeatable_walkthroughs.md` (Rule 14f picker before any 5+ step manual walkthrough; today's Phase 4 verification is a 5+ step walkthrough — picker likely fires for "draft Playwright spec OR run manual walkthrough" choice).

**Task shape (P-49 W2 Amazon DEPLOY session):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or deploy mechanics. The 3 plain-terms sections at top above (What we did this session / What this session will do / What's still left on the total roadmap) provide the launch context.

2. **Pre-deploy reads** — execute the pre-build read list above. ~10-15 min.

3. **Branch state verify** — `git branch --show-current` (should be `workflow-2-competition-scraping`) + `git log main..HEAD --oneline` (should show **4 commits ahead at session entry**: Session 1 build + Session 1 doc-batch + Session 2 build + Session 2 doc-batch). If anything else, surface to director.

4. **Pre-deploy /scoreboard** — confirm 5/5 GREEN at the current baselines on `workflow-2-competition-scraping` (root tsc clean / extension tsc clean / **633 ext** / **786 src/lib** / **62 routes**); Check 6 Playwright per Rule 27 picker.

5. **Rule 9 deploy gate** — fire the deploy-gate picker before `git push origin main`. Picker offers: (A) Deploy now — Recommended (per `feedback_recommendation_style.md` most-thorough/reliable since the build commits are tested, the schema migration is additive-only, and the carry-over Phase-4 verification IS the next step) / (B) Defer to a later session / (C) Question first. Director-Yes to (A) expected.

6. **Execute deploy:**
   - `git checkout main`
   - `git merge --ff-only workflow-2-competition-scraping` (ff-merges all 4 commits cleanly: `1914171..<session-2-doc-batch-SHA>`)
   - `git push origin main` (THE Rule 9 deploy push)
   - Vercel auto-redeploy fires ~2-3 minute cycle
   - `git checkout workflow-2-competition-scraping` (ping-pong)
   - `git merge --ff-only main` (resolves the ping-pong; workflow-2 is now even with main)
   - `git push origin workflow-2-competition-scraping` (the ping-pong push)
   - **Schema-change-in-flight flag FLIPS YES → NO** at this point.

7. **Post-merge /scoreboard** on `main` — partial per the session_2026-05-24-f Pattern (root tsc clean + extension tsc clean + src/lib clean + Check 3 + Check 5 trusted at unchanged baselines via clean ff-merge since merged commit is byte-identical to pre-deploy commit). Check 6 Playwright SKIPPED per Rule 27 unless director shifts.

8. **Fresh extension zip** — `cd extensions/competition-scraping && npm run zip` produces `plos-extension-2026-05-28-w2-deploy-37.zip` (or similar; check actual filename + size after build) at repo root. Note that the WXT zip workflow is well-precedented across the 32 prior zip artifacts at repo root.

9. **Phase 4 director real-Chrome verification** — Director loads the fresh extension unpacked in Chrome (or via Chrome Web Store Unlisted update path), opens a real Amazon product page with multi-star reviews (see Pre-session notes section below — director should pre-pick a target product URL), right-clicks → "Scrape reviews for this URL", picks the cap in the trigger modal, watches the Shadow DOM progress indicator advance through 5 star filters + the Customers-say summary block, then checks the URL detail page on vklf.com to confirm the reviews landed correctly. **Per Rule 14f**: before starting the walkthrough, fire a picker for (A) Manual walkthrough (Recommended for first real-Chrome run of a major feature — most-thorough/reliable diagnosis if issues surface) / (B) Draft Playwright spec for repeatability / (C) Skip Phase 4. Director-Yes to (A) expected.

10. **Fix-forward cycles if Phase 4 surfaces issues.** Per the P-46 W3 + W4 deploy precedent + the W4 fix-forward Pattern 2026-05-24-f. Small UI-only or selector-tweak commits ship under additional Rule 9 gates within the same deploy session. Expect 0-3 fix-forwards.

11. **End-of-session doc-batch** covers ROADMAP (header bump + P-49 W2 Amazon ✅ DEPLOYED-VERIFIED 2026-05-28-or-similar narrative + (a.95) closes + (a.96) opens for whichever next-task — likely P-49 W4 Captured Reviews UI extensions Session 1 OR P-49 W2 eBay Session 1 OR P-48 Session 3 Diagnostic #2 per Rule 14f picker at session end) + CHAT_REGISTRY (header bump — 161st session) + DOCUMENT_MANIFEST (header bump + zip artifact count update) + CORRECTIONS_LOG (header + new §Entry capturing the deploy outcome + any reusable Patterns memorialized during fix-forward cycles) + NEXT_SESSION (rewritten for next-next task per (a.96)) + HANDOFF_PROTOCOL (header bump only) + CLAUDE_CODE_STARTER (header bump only) + REVIEWS_PHASE_2_DESIGN.md §B 2026-05-28-or-similar (THIRD build/deploy-session §B entry — Amazon deploy + Phase-4 outcome) + COMPETITION_SCRAPING_DESIGN.md (likely UNCHANGED OR brief cross-reference) + COMPETITION_DATA_V2_DESIGN.md (UNCHANGED — P-49 W2 is review-extraction architecture, not data-shape).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** every Rule 14f picker fired during the deploy + fix-forward cycle should surface the recommended path + default to it unless director shifts.

**Schema-change-in-flight flag:** **STAYS YES at session start** (carrying from Sessions 1 + 2); **FLIPS TO NO at deploy completion** (the canonical schema-change-ships-to-production transition).

**Rule 9 triggers planned this session: AT LEAST ONE** (the deploy push); potentially more if Phase 4 surfaces fix-forward needs.

---

## Pre-session notes (offline steps for director between sessions)

**Recommended — pre-pick a target Amazon product URL for Phase 4 verification:**

- **Open a competitor's Amazon product page in a Chrome tab + bookmark or save the URL.** Pick a product with **100+ reviews across multiple star ratings** so the per-star pagination has meaningful data per star (Amazon serves up to 1000/star but the cross-star loop's value-add is most visible on products with at least some reviews in each star filter). Avoid brand-new products with fewer than 20 reviews — the cross-star loop visits all 5 filters even when one or more are empty.
- **Optional but useful: open Chrome DevTools on the product page + verify that the `Customers say` block is visible** (it appears at the top of the reviews section on many products but isn't on every product — Amazon's AI summary is opportunistic). If the target product DOESN'T have a Customers-say block, Phase 4 verification just won't surface that aspect of the feature; the per-star loop + helpful-count sort still verify cleanly.
- **Confirm you're logged into your Amazon account** in the same Chrome profile where you'll load the extension. The fetch+DOMParser pagination uses your Amazon cookies for any pages 2..N requests, so you need to be logged in for the pagination to work.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking P-49 W2 Amazon DEPLOY session at all — can happen any time. Director-independent.

---

## Standing carry-overs

**None this session.** The Session 1 + Session 2 deferred carry-over (first end-to-end real-Chrome extraction test on a real Amazon product page) **resolves AT the Amazon deploy session next per (a.95) by definition** — Phase 4 verification IS the resolution venue, not a Claude-defer. Captured in CORRECTIONS_LOG §Entry 2026-05-27 + the deploy session's launch prompt above; not in this section since it's a same-next-session resolution.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned beyond the clean ff-merge (which is non-destructive — ff-only preserves all SHAs). No rebases, no force pushes, no `git reset --hard`, no `git branch -D`.

**Rule 9 triggers planned this session: AT LEAST ONE** — the deploy push to `origin/main` (ff-merge of `workflow-2-competition-scraping` → `main` carrying 4 commits). Potentially more (0-3 fix-forward deploy pushes) if Phase 4 surfaces issues.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits an alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any deploy mechanics.

---

## Why this pointer was written this way (debug aid)

Today's session executed the (a.94) RECOMMENDED-NEXT task locked yesterday — the P-49 W2 Amazon Session 2 build. Build commit `1830074` (5 files +1054/-99) ships the cross-star navigation loop + helpful-count sort + Customers-say block + trigger popup with cap override at code level. EXACTLY ONE Rule 14f forced-picker fired (Customers-say storage-shape — director picked Recommended Option A) — the calibration data point that the launch prompt's anticipated picker shape was well-calibrated to director's intent.

The natural next-session task per (a.95) RECOMMENDED-NEXT is **P-49 W2 Amazon DEPLOY session on `workflow-2-competition-scraping` → `main`** — the first production deploy of the Reviews Phase 2 work, bundling Sessions 1 + 2 build commits + intervening doc-batches as one ff-merge under Rule 9 gate + Phase 4 director real-Chrome verification.

- **(Recommended)** P-49 W2 Amazon DEPLOY session — bundle Sessions 1 + 2 + Phase 4 real-Chrome verification. Recommended because (a) Sessions 1 + 2 together ship the full Amazon scope the design doc spec'd (single-filter + cross-star + Customers-say + trigger modal) — natural shipping unit; (b) the Schema-change-in-flight flag has been YES for 2 sessions and needs to flip back to NO via the deploy; (c) the Session 1 + 2 carry-over (first end-to-end real-Chrome extraction test) resolves AT this deploy session; (d) deferring further would extend the schema-change-in-flight window beyond the canonical "ship-within-3-sessions" pattern; (e) the build commits are tested, /scoreboard is 5/5 GREEN at the new baseline, and the deploy mechanics are well-precedented (clean ff-merge of 4 commits per the P-46 W3 + W4 deploy precedents).

The shape of P-49 W2 Amazon DEPLOY session is **plain-terms summary + pre-deploy reads + branch state verify + pre-deploy /scoreboard + Rule 9 deploy gate + ff-merge + push + Vercel auto-redeploy + ping-pong push + post-merge /scoreboard partial + fresh extension zip + Phase 4 director real-Chrome verification + 0-3 fix-forward cycles + end-of-session doc-batch (9 docs including REVIEWS_PHASE_2_DESIGN.md §B 2026-05-28-or-similar third entry covering deploy + Phase-4) + 4+ pushes (deploy + ping-pong + doc-batch + doc-batch ff-merge to main)**.

**After Amazon DEPLOY ships,** the next-next sessions step through P-49 W4 Captured Reviews UI extensions (interleavable but most natural here since the W2 Amazon corpus is now populated with real review data) OR P-49 W2 eBay Session 1 (continues the W2 per-platform sub-cluster) OR P-49 W5 AI review analysis system Session 1 (also interleavable; can now operate on real Amazon review data) OR P-48 Session 3 Diagnostic #2 (opportunistic insertion) OR P-50 Condition Pathology card (small main-branch standalone) — director picks at end-of-deploy-session Rule 14f next-task picker. Per the design doc §A.2 priority sequence, eBay is next in W2; per integration value, W4 + W5 are both highly desirable now that real review data exists.

**Alternate next-session candidates if director shifts priorities at session start:**

- **P-49 W2 Amazon Session 3 — defer DEPLOY session.** NOT recommended — the build commits are tested + the design doc + launch prompt didn't anticipate a Session 3 refinement before deploy; deploying first surfaces real-Chrome issues that Session 3 (if needed) addresses with empirical data rather than speculation.
- **P-49 W4 Captured Reviews UI extensions Session 1 — defer DEPLOY session.** NOT recommended — W4 is interleavable but ships the UI for reviews already in the database; deploying W2 Amazon first lets W4 surfaces test against real extension-scraped data rather than the smaller manual-entry corpus.
- **P-49 W5 AI review analysis system Session 1 — defer DEPLOY session.** NOT recommended — W5 strictly depends on having review data to analyze; deploying W2 Amazon first puts review data in production for W5 to operate on.
- **P-48 Session 3 (Diagnostic #2) — defer DEPLOY session.** NOT recommended — P-49 is the major scope expansion + already in-flight; P-48 Session 3 is opportunistic and can interleave with P-49 work between deploys.
- **P-50 Condition Pathology card — small `main`-branch standalone session.** NOT recommended as the next-session task — P-50 is ~10 min in-Claude + lives on `main` not `workflow-2-competition-scraping`. Better to slot it into a future deploy session.
- **P-43 mechanical prevention small fix.** NOT recommended — opportunistic; defer to after the deploy.
- **P-26 below-fold scroll capture evaluation.** NOT recommended — LOW alternate; re-evaluate after Reviews Phase 2 closes.
- **P-27 Bug #9 + Bug #15 re-evaluation.** NOT recommended — likely obsolete after P-46.
- **W#2 graduation step.** NOT recommended UNTIL Reviews Phase 2 + P-48 stutter + P-43 + P-26 + P-27 all close.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above.

Check `ROADMAP.md` for the canonical state. Check `docs/REVIEWS_PHASE_2_DESIGN.md` for the canonical interview-locked spec + the §B 2026-05-26 + §B 2026-05-27 build-session entries. Check `docs/CORRECTIONS_LOG.md` §Entry 2026-05-27 (Session 2 closing entry) for the TWO NEW reusable Pattern memorializations + drift sub-observation + calibration data point.
