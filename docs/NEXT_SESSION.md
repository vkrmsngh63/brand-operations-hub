# Next session

**Written:** 2026-05-29 (`session_2026-05-29_p49-w4-captured-reviews-ui-session-1` — post-deploy doc-batch handoff after **W#2 polish P-49 Reviews Phase 2 Workstream 4 Captured Reviews UI extensions ✅ DEPLOYED-AND-VERIFIED 2026-05-29 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`**) — same session ID + same calendar day as the earlier-today build-session doc-batch; session expanded mid-session from build-only to build + deploy + Phase-4-PASS via the end-of-session Rule 14f deploy-or-exit picker (director picked Recommended "Deploy now" over Exit/Defer-Phase-4); ff-merge `a40e4ba..1e610ce main -> main` carrying build commit `e89ae50` (9 files +2162/-43) + build-session doc-batch `1e610ce` under ONE Rule 9 deploy gate; Vercel auto-redeploy fired; Phase 4 director real-Chrome verification 6/6 PASS on vklf.com (Customers-say banner above counter-bar / counter-bar per-star counts / click-to-filter / multi-star OR / bulk-select + delete / drag-to-reorder + reload-persistence — all PASS); W4 entire workstream now ✅ DEPLOYED-AND-VERIFIED with no remaining scope (§C.4 estimate "~2-3 sessions" compressed into "1 session shipped + 1 session deployed in same day"; Sessions 2 + 3 from §C.4 outline CLOSED); TWO Rule 14f forced-pickers fired this session (Session 1 scope 0/1 + deploy-or-exit 1/1 = 50% final calibration; running cumulative 24/27 = 88.9% across recent 4 sessions); P-43 cwd-leak Pattern Class reproduced 3 total this session (running tally ~7-8+; strong empirical signal continues mounting). **Closes (a.96) + (a.97); opens (a.98) RECOMMENDED-NEXT = P-49 W2 eBay sub-cluster Session 1** on `workflow-2-competition-scraping` per §A.2 priority order + §C.2 implementation outline (reuses W2 Amazon Patterns: FF#1 symmetric `isXxxScrapableUrl` + `extractAsinFromXxxUrl` helpers + FF#4 URL-construction-based pagination + Session 2 cross-star loop + Shadow DOM trigger modal with per-URL cap override).

---

## What we did this session (in plain terms)

Today shipped the **W4 Captured Reviews UI extensions cluster end-to-end on vklf.com in a single calendar day** — what was originally planned as "Session 1 builds the code + Session 2 deploys" compressed into one calendar day via two converging Rule 14f picker outcomes.

**First, the build portion:** the launch prompt locked all three §C.4 pieces (counter-bar + bulk-delete + drag-reorder) into one session over the design doc's "~2-3 sessions" split estimate. Claude framed a Rule 14f scope picker at start of code mechanics — director picked Option B "All three" over Recommended Option A "§C.4 split" (calibration data point 0/1). All three pieces landed cleanly under one build commit `e89ae50` (9 files +2162/-43): 2 new src/lib handlers (`reviews-batch-delete.ts` + `reviews-reorder.ts`) with 32 new node:test cases between them, 2 thin API route shims, 1 new src/lib helpers module (`captured-reviews-helpers.ts`) with 20 new node:test cases extracted from the .tsx component, and a major rewrite of `UrlDetailContent.tsx` (+637/-43) wiring counter-bar + drag-handle + checkbox + Customers-say banner + 500ms debounced reorder mutation.

**Then, mid-session, the session expanded into a deploy session.** After the build-session doc-batch landed on `workflow-2-competition-scraping` (commits `e89ae50` + `1e610ce` pushed), Claude framed a Rule 14f deploy-or-exit picker offering (A) Deploy-now-and-Phase-4-verify (Recommended — ~30-60 min in-Claude; bounded UI features against locked spec; corpus already exists from 2026-05-28 Amazon DEPLOY) vs (B) Exit-now (~10-15 min next-session-start overhead) vs (C) Defer Phase 4 only. **Director picked Recommended "Deploy now"** (calibration data point 1/1 on the deploy-or-exit picker). The ff-merge `a40e4ba..1e610ce main -> main` carrying both `e89ae50` and `1e610ce` shipped under ONE Rule 9 deploy gate; Vercel auto-redeployed vklf.com (~2-3 min).

**Phase 4 director real-Chrome verification PASSED 6/6 on vklf.com** on a project with the Amazon-scraped review corpus from yesterday's 2026-05-28 Amazon DEPLOY: (1) Customers-say banner renders separately above counter-bar PASS / (2) Counter-bar shows per-star counts PASS / (3) Click-to-filter narrows list PASS / (4) Multi-star OR works PASS / (5) Bulk-select + delete batches correctly PASS / (6) Drag-to-reorder persists + survives reload PASS. **Director PASS verdict resolves the session at ✅ DEPLOYED-AND-VERIFIED 2026-05-29 end-to-end on vklf.com.** No fix-forwards needed.

**The session memorialized THREE NEW reusable Patterns in CORRECTIONS_LOG §Entry 2026-05-29:** (a) "Pure helpers extracted from .tsx component file for node:test coverage" — node:test can't load `'use client'` .tsx files, so extracting pure helpers into a separate `.ts` module under `src/lib/` unlocks node:test coverage; (b) "Customers-say split: separate AI-summary row from main reviews via source discriminator" — when a row's domain semantics diverge from the table's primary purpose (here: AI-summary aggregate vs. individual user review), the source discriminator field is the rendering UI's hook for "should this row participate in row-level operations?"; (c) NEW Pattern candidate "End-of-build-session deploy-or-exit Rule 14f picker" — when a build session lands clean + the design doc opens a deploy session as the next-task, fire a director picker offering Deploy-now vs Exit. Today this Pattern fired and produced the build-and-deploy-in-one-day compression.

**P-43 cwd-leak Pattern Class reproduced 3 times today** during /scoreboard runs (pre-build Check 5 + post-build Check 5 + pre-deploy Check 5). Running tally now ~7-8+ across recent sessions including 4-5+ yesterday on the Amazon DEPLOY session. **Strong empirical signal continues mounting** for the P-43 mechanical prevention small fix.

**W4 estimate compression memorialized:** §C.4 "~2-3 sessions" → "1 session shipped + 1 session deployed in same day" (well under estimate). Sessions 2 + 3 from the §C.4 outline are now CLOSED since all scope shipped + deployed under one calendar day. **W4 entire workstream is now ✅ DEPLOYED-AND-VERIFIED with no remaining scope.**

## What we'll do next session (in plain terms)

Next session is **P-49 W2 eBay sub-cluster Session 1** on `workflow-2-competition-scraping` per (a.98). Per §A.2 priority order, eBay is the next W2 platform sub-cluster after Amazon (which deployed yesterday). The shape of the eBay Session 1 work mirrors the W2 Amazon arc — but eBay should land much faster (~1-2 hours in-Claude) because **the W2 Amazon Patterns from the 2026-05-28 deploy session are directly reusable:**

1. **FF#1 symmetric helpers Pattern** — eBay's per-platform module should adopt the `isEbayScrapableUrl` + `extractItemIdFromEbayUrl` symmetric helper Pattern from the start (rather than the dispatch over-restriction antipattern that surfaced as FF#1 during Amazon Phase 4 verification).
2. **FF#4 URL-construction-based pagination Pattern** — eBay's pagination should adopt direct URL-construction rather than DOM-link-scraping (Amazon's `?pageNumber=N` stability lesson generalizes: eBay's `&_pgn=N` URL parameter is also stable; build URLs directly rather than scraping next-page links).
3. **Session 2 cross-star loop Pattern** — eBay doesn't have per-star granular feedback (per director's verbatim spec: Neutral → 3-star, Negative → 1-star automatic mapping); but the cross-filter-loop structure transfers to eBay's Positive/Neutral/Negative feedback type filter (`fdbkType=FeedbackReceivedAsSeller&overall_rating_item=NEUTRAL` or `=NEGATIVE`).
4. **Shadow DOM trigger modal Pattern** — eBay reuses the existing trigger modal (already in production from the 2026-05-28 deploy); only the eBay-specific scrape dispatch + per-item-ID handler needs adding.

**Build session shape — ZERO Rule 9 deploy gates planned.** Schema-change-in-flight STAYS NO (no schema work — eBay reuses the schema W2 Amazon shipped). Estimated ~1-2 hours in-Claude. Next-next session likely eBay Session 2 (or a deploy session if Session 1 wraps the scope cleanly).

**Pre-build read list for the next session:** `docs/REVIEWS_PHASE_2_DESIGN.md` §A.2 (per-platform priority order) + §A.15 (anti-bot conservative defaults) + §C.2 (eBay sub-cluster implementation outline) + §B 2026-05-26 (W2 Session 1 foundation — shared content-script infrastructure that eBay reuses) + §B 2026-05-27 (W2 Session 2 cross-star + Customers-say + trigger modal) + §B 2026-05-28 (W2 Amazon DEPLOY + 4-fix-forward cascade — the canonical W2 Amazon Patterns reference) + §B 2026-05-29 (today's W4 Session 1 build entry + post-deploy sub-section) + `docs/COMPETITION_SCRAPING_DESIGN.md` (extension-side architecture) + `docs/CORRECTIONS_LOG.md` §Entry 2026-05-29 (today's closing entry with post-deploy sub-observation appended — TWO NEW Patterns + ONE NEW Pattern candidate + final calibration + P-43 cwd-leak reproductions) + the existing `extensions/competition-scraping/src/lib/content-script/amazon-review-extractor.ts` (the canonical W2 platform-module precedent).

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-29 (P-49 W4 ✅ DEPLOYED-AND-VERIFIED; eBay Session 1 NEXT):

- **P-49 W2 eBay sub-cluster (Sessions 1-3 + deploy) — NEXT (a.98).** ~3-4 sessions. Per §A.2 priority order — eBay second after Amazon (now deployed). Reuses W2 Amazon Patterns from 2026-05-28 deploy session (FF#1 symmetric helpers + FF#4 URL-construction pagination + cross-star loop + Shadow DOM trigger modal + per-URL cap override). The eBay arc accelerates because the shared infrastructure is in production + the Pattern library is established.
- **P-49 W2 Etsy sub-cluster (Sessions 1-3 + deploy).** ~3-4 sessions. Per §A.2 priority order — Etsy third.
- **P-49 W2 Walmart sub-cluster (Sessions 1-3 + deploy).** ~3-4 sessions. Per §A.2 priority order — Walmart fourth.
- **P-49 W5 AI review analysis system.** ~5-10 sessions. 3 levels (per-product two-sweep + cross-Type pooled + cross-everything competitive landscape) using the `ReviewAnalysis` table shipped in W2 Session 1 + Claude Opus + per-run model-version dropdown + cost caps + fingerprint cache. Can operate on real production review data (Amazon DEPLOY corpus exists since 2026-05-28; eBay/Etsy/Walmart corpora pending).
- **P-49 total build arc ~10-20 sessions remaining.** Revised down by 1 from yesterday's ~11-21 since today closed W4 entirely (Sessions 2 + 3 from §C.4 CLOSED via the build-and-deploy-in-one-day compression).
- **P-50 Condition Pathology card.** ~10 min in-Claude. Lives on `main` branch. Can slot into any deploy session OR done standalone. NOT on the critical path.
- **P-48 Session 3 (Diagnostic #2) — DEFERRED to opportunistic insertion.** ~30-60 min in-Claude.
- **P-43 mechanical prevention candidate (LOW informational).** ~1 small session. Add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`. **Empirical signal continues mounting** — 3 more reproductions today; running tally ~7-8+ across recent sessions. Increasingly worth slotting in.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions, OR drop. Re-evaluate after Reviews Phase 2 closes.
- **P-27 Bug #9 + Bug #15 — DEFERRED LOW.** ~0-1 sessions. Likely obsolete after P-46. Re-evaluate after P-26.
- **W#2 graduation step (further deferred).** Gated by Reviews Phase 2 closure at the workstream-by-workstream level. Likely 6-12 months out at current sessions-per-week cadence.
- **THEN STOP AND EXPLICITLY ASK DIRECTOR for any next round of competition-scraping additions** per your standing directive after Reviews Phase 2 + P-48 stutter + P-43 + P-26 + P-27 all close.
- **After your next round of additions ships:** W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent.

---

## Status of last session

**W#2 polish P-49 Reviews Phase 2 Workstream 4 Captured Reviews UI extensions ✅ DEPLOYED-AND-VERIFIED 2026-05-29 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` (`session_2026-05-29_p49-w4-captured-reviews-ui-session-1`)** — same session ID + same calendar day as the build-session doc-batch from earlier today; session expanded mid-session from build-only to build + deploy + Phase-4-PASS via the end-of-session Rule 14f deploy-or-exit picker.

**Session shape (BUILD + DEPLOY + PHASE-4-PASS bundled — ONE Rule 9 deploy gate fired; TWO Rule 14f forced-pickers fired total):**

- **Build portion (executed earlier today):**
  - Pre-build /scoreboard 5/5 GREEN at entry baselines (root tsc clean / extension tsc clean / 655 ext / 786 src/lib / 62 routes); Check 6 SKIPPED per Rule 27.
  - Rule 14f scope picker fired at start of code mechanics — director picked Option B (All three) over Recommended Option A (§C.4 split into Sessions 1+2) — calibration 0/1.
  - Code mechanics: pure helpers extraction to `captured-reviews-helpers.ts` + 20 new tests; 2 new handlers (`reviews-batch-delete.ts` + `reviews-reorder.ts`) + 15 + 17 new tests + 2 thin route shims; `UrlDetailContent.tsx` rewrite (+637/-43) wiring counter-bar + drag-handle + checkbox + 500ms debounced reorder mutation + Customers-say banner.
  - Build commit `e89ae50` landed (9 files +2162/-43); build-session doc-batch `1e610ce` landed.
  - Post-build /scoreboard 5/5 GREEN at new baselines: extension 655/655 UNCHANGED / 838 src/lib (+52) / 64 routes (+2); Check 6 SKIPPED per Rule 27.
  - Build-session push to `origin/workflow-2-competition-scraping` carrying `e89ae50` + `1e610ce`.

- **Deploy portion (executed end-of-session):**
  - End-of-session Rule 14f deploy-or-exit picker fired — director picked Recommended "Deploy now" over Exit / Defer-Phase-4 — calibration 1/1.
  - Pre-deploy /scoreboard re-run produced identical 5/5 GREEN at post-build baselines.
  - Check 6 Playwright SKIP picker fired + director picked SKIP (Recommended per standing non-deploy SKIP precedent — though this IS a deploy session, the W4 UI changes lack Playwright spec coverage).
  - Rule 9 deploy gate combined picker — director picked Deploy now (Recommended) covering ff-merge + push + Vercel + ping-pong.
  - Ff-merge `a40e4ba..1e610ce main -> main` carrying 2 commits; push to `origin/main`; Vercel auto-redeploy fired (~2-3 min); ping-pong push to `origin/workflow-2-competition-scraping`.
  - Post-merge /scoreboard SKIPPED full re-run per 2026-05-24-e "trust-at-unchanged-baseline" Pattern.

- **Phase 4 portion:**
  - Phase 4 mode picker fired — director picked Manual walkthrough (Recommended for new UI features against locked spec).
  - Phase 4 director real-Chrome verification 6/6 PASS on vklf.com (all 6 steps PASS — Customers-say banner + counter-bar + click-to-filter + multi-star OR + bulk-select + delete + drag-reorder + reload-persistence).
  - Director PASS verdict resolves the session at ✅ DEPLOYED-AND-VERIFIED 2026-05-29 end-to-end on vklf.com. No fix-forwards needed.

- **End-of-session:**
  - §4 Step 1c forced-picker — director picked Recommended (P-49 W2 eBay sub-cluster Session 1) over P-49 W5 AI review analysis Session 1 + P-49 W2 Etsy Session 1 + P-48 Session 3 alternatives.
  - Post-deploy doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + NEXT_SESSION + REVIEWS_PHASE_2_DESIGN.md post-deploy §B sub-section).

**TWO Rule 14f forced-pickers fired total this session:** Session 1 scope picker (0/1) + end-of-session deploy-or-exit picker (1/1). **Final calibration data point: 1/2 = 50% Yes-to-Recommended this session;** running cumulative across recent 4 sessions: **24/27 = 88.9%** (was 23/26 = 88.5% before today's deploy-now pick landed).

**ONE Rule 9 deploy gate fired this session** (ff-merge `a40e4ba..1e610ce main -> main` carrying both `e89ae50` + `1e610ce`).

**Schema-change-in-flight flag STAYS NO entire session** (W4 had no schema work; the broader Reviews Phase 2 schema YES → NO transition already happened at the 2026-05-28 Amazon DEPLOY).

**ZERO DEFERRED items at session end (Rule 26).** No carry-overs at entry or end.

**Baselines locked from this session:** src/lib **838/838** (+52); npm run build **64 routes** (+2); extension **655/655 UNCHANGED**. Files now live in production on vklf.com.

**P-43 cwd-leak Pattern Class reproduced 3 times this session** (Check 5 pre-build + Check 5 post-build + Check 5 pre-deploy); running tally ~7-8+ across recent sessions; strong empirical signal continues mounting for the P-43 mechanical prevention small fix.

**§C.4 estimate compression memorialized:** "~2-3 sessions" → "1 session shipped + 1 session deployed in same day"; Sessions 2 + 3 from §C.4 outline CLOSED; **W4 entire workstream now ✅ DEPLOYED-AND-VERIFIED with no remaining scope.**

**FORTY-FIRST end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-49 W2 eBay sub-cluster Session 1 begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` **even with `origin/main`** at the post-deploy doc-batch SHA (both branches at the same SHA after today's deploy ping-pong + post-deploy doc-batch ff-merge). Verify with `git log main..HEAD --oneline` showing **0 commits ahead** at session entry.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-49 Reviews Phase 2 Workstream 2 eBay sub-cluster Session 1 on `workflow-2-competition-scraping`.** Closes **(a.98) RECOMMENDED-NEXT**. BUILD session — ZERO Rule 9 deploy gates planned. Schema-change-in-flight flag STAYS NO entire session (no schema work — eBay reuses the schema W2 Amazon shipped at 2026-05-28 Amazon DEPLOY).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify the SHA relationships with `git log main..HEAD --oneline` — should show **0 commits ahead at session entry** (both branches at the same SHA after yesterday's W4 deploy ping-pong + post-deploy doc-batch ff-merge).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/ROADMAP.md` lines 1-30 (header + recent session sequence) + the **P-49 Reviews Phase 2 polish-backlog entry** (Status: "🟢 IN-FLIGHT 2026-05-29 — Workstream 2 Amazon ✅ DEPLOYED-AND-VERIFIED 2026-05-28 + Workstream 4 ✅ DEPLOYED-AND-VERIFIED 2026-05-29 ... eBay sub-cluster NEXT per (a.98)").
- **`docs/REVIEWS_PHASE_2_DESIGN.md`** §A.2 (per-platform priority order — eBay second after Amazon) + §A.15 (conservative anti-bot defaults) + §C.2 (eBay sub-cluster implementation outline — the canonical eBay design canon) + §B 2026-05-26 (W2 Session 1 foundation — shared content-script infrastructure eBay reuses) + §B 2026-05-27 (W2 Session 2 cross-star + Customers-say + trigger modal) + §B 2026-05-28 (W2 Amazon DEPLOY + 4-fix-forward cascade — canonical W2 Amazon Patterns reference) + §B 2026-05-29 (today's W4 Session 1 build entry + today's post-deploy sub-section).
- `docs/COMPETITION_SCRAPING_DESIGN.md` (extension-side architecture; eBay sub-cluster reuses the shared content-script infrastructure from W2 Session 1).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-29 (today's closing entry with post-deploy sub-observation appended — TWO NEW Patterns + ONE NEW Pattern candidate + final calibration + P-43 cwd-leak Pattern Class reproductions UPDATED to 3) + §Entry 2026-05-28 (yesterday's Amazon DEPLOY closing entry — THREE NEW Patterns including FF#1 dispatch over-restriction antipattern + FF#4 pageNumber-direct-increment Pattern).
- **The W2 Amazon precedent extension code** — `extensions/competition-scraping/src/lib/content-script/amazon-review-extractor.ts` + `amazon-review-extractor.test.ts` + `orchestrator.ts` + `scrape-trigger-modal.ts` + `scrape-pagination.ts` + `scrape-progress-indicator.ts` (the canonical W2 platform-module precedent for the eBay equivalent).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (deploy gate — 0 fires planned) + Rule 14f (forced-picker mechanics — expect 0-2 to fire: possibly storage-shape picker for eBay-specific edge cases like the Neutral/Negative → 3-star/1-star mapping detail; possibly the cross-filter loop scope picker for eBay's feedback type filter) + Rule 18 + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — extension-side per-platform module + no schema; schema-change-in-flight STAYS NO) + Rule 25 (Multi-Workflow — single-branch workflow-2) + Rule 26 (DEFERRED items registry — ZERO carry-overs at start) + Rule 27 (Playwright forced-picker — non-deploy session; SKIP default-approved per the standing non-deploy SKIP precedent) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `feedback_recommendation_style.md` (most-thorough/reliable).
- `feedback_approval_scope_per_decision_unit.md` (build-session push pattern memorialized 2026-05-27: ONE push to workflow branch; NO ff-merge to main this session).
- `feedback_default_to_recommendation.md`.
- `feedback_session_bookends_plain_summary.md`.

**Task shape (P-49 W2 eBay sub-cluster Session 1 — per-platform scraper module for eBay reusing W2 Amazon Patterns):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or code mechanics. The 3 plain-terms sections at top above provide the launch context.

2. **Pre-build reads** — execute the pre-build read list above. ~5-10 min.

3. **Branch state verify** — `git branch --show-current` (should be `workflow-2-competition-scraping`) + `git log main..HEAD --oneline` (should show **0 commits ahead at session entry**). If anything else, surface to director.

4. **Pre-build /scoreboard** — confirm 5/5 GREEN at the new baselines on `workflow-2-competition-scraping` (root tsc clean / extension tsc clean / **655 ext** / **838 src/lib** / **64 routes**); Check 6 Playwright SKIP via Rule 14f forced-picker per Rule 27 (Recommended per standing non-deploy SKIP precedent — last 40+ sessions all SKIP for non-deploy; treated as default-approved).

5. **Rule 14f picker(s) potentially firing during code mechanics:** Anticipate possibly: (a) eBay Neutral/Negative → 3-star/1-star mapping detail picker if any edge case arises (Recommended path is to follow §A.2 director-verbatim spec exactly); (b) cross-filter loop scope picker if eBay's feedback type filter (`fdbkType=...&overall_rating_item=NEUTRAL|NEGATIVE`) requires more than 2-filter loop (Recommended is to mirror the Amazon Session 2 5-star cross-loop structure); (c) Session 1 scope picker if launch prompt vs. §C.2 disagree (anticipate launch prompt + §C.2 to agree; no scope picker expected). Per `feedback_default_to_recommendation.md` no clarifying picker should fire when launch prompt + design doc agree.

6. **Code mechanics — eBay per-platform module:** Mirror the Amazon Session 1 + 2 + FF#1 + FF#4 Patterns from the start:
   - NEW `extensions/competition-scraping/src/lib/content-script/ebay-review-extractor.ts` — per-row DOM walker against eBay's feedback row structure + URL detection helpers + cross-filter loop (Positive/Neutral/Negative) + parsers (`parseFeedbackType` → starRating mapping: Positive → 5, Neutral → 3, Negative → 1; `parseFeedbackBody` review body extractor; eBay has no helpful-count signal) + `runEbayReviewScrape` orchestrator using `fetch()` + `DOMParser` for pagination (extends Session 1's Pattern) + symmetric helpers per FF#1 Pattern (`isEbayListingUrl` + `isEbayFeedbackUrl` + `isEbayScrapableUrl` + `extractItemIdFromEbayListingUrl` + `extractItemIdFromEbayFeedbackUrl` + `extractItemIdFromEbayUrl` + `extractSellerFromEbayFeedbackUrl` — eBay needs the seller username for the feedback URL, not just the item ID) + URL-construction-based pagination per FF#4 Pattern (`buildEbayFeedbackUrl(itemId, seller, feedbackType, pageNumber)` direct URL construction; stop signal = fetched page has 0 reviews; don't scrape next-page links).
   - NEW `extensions/competition-scraping/src/lib/content-script/ebay-review-extractor.test.ts` — node:test cases covering all new helpers + parsers + dispatch surface (anticipate ~15-25 new cases based on the Amazon precedent's 29 cases for the equivalent Session 1).
   - MODIFY `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — extend `start-review-scrape` handler dispatch to route eBay URLs to `runEbayReviewScrape`; reuse the existing `openScrapeTriggerModal` (already in production from 2026-05-28 deploy) + `saveReview` wrapper.
   - The shared `scrape-pagination.ts` + `scrape-progress-indicator.ts` from W2 Session 1 are reused — NO modifications needed (they're platform-agnostic).
   - The shared `scrape-trigger-modal.ts` from W2 Session 2 is reused — NO modifications needed (the per-URL cap override is platform-agnostic).
   - PLOS-side handler extensions — NONE expected (the existing `url-reviews.ts` POST handler accepts `platform: 'ebay'` already since the schema shipped in W2 Session 1 included the `CapturedReview.platform String?` column).

7. **Post-build /scoreboard 5/5 GREEN at new ext baseline** — expected extension `npm test` ≈ 670-680 (655 + ~15-25 new cases for eBay); 838 src/lib UNCHANGED; 64 routes UNCHANGED; Check 6 SKIPPED per Rule 27.

8. **§4 Step 1c forced-picker at session-end** — locks the next-next task per Rule 14f. Likely alternatives: P-49 W2 eBay Session 2 (Recommended if more eBay scope remains — TBD on Session 1 outcome) vs P-49 W2 eBay DEPLOY session (Recommended if Session 1 lands the full eBay sub-cluster scope) vs P-49 W2 Etsy Session 1 (premature unless eBay is fully done).

9. **End-of-session doc-batch** covers ROADMAP (header bump + P-49 polish-backlog entry status update for eBay Session 1 outcome + (a.98) closes + (a.99) opens) + CHAT_REGISTRY (header bump — 163rd session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header + new §Entry 2026-05-XX capturing eBay Session 1 outcome + any Patterns memorialized) + NEXT_SESSION (rewritten for next-next task per (a.99)) + HANDOFF_PROTOCOL (header bump only expected) + CLAUDE_CODE_STARTER (header bump only) + REVIEWS_PHASE_2_DESIGN.md §B 2026-05-XX (FIFTH+ build/deploy-session entry per Rule 18 — eBay Session 1 entry) + COMPETITION_SCRAPING_DESIGN.md (likely §B 2026-05-XX cross-reference pointer entry per the W2 Amazon precedent) + COMPETITION_DATA_V2_DESIGN.md (UNCHANGED).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** every Rule 14f picker fired during code mechanics should surface the recommended path + default to it unless director shifts.

**Per `feedback_approval_scope_per_decision_unit.md` (build-session push pattern memorialized 2026-05-27):** ONE push to `origin/workflow-2-competition-scraping` carrying build commit + doc-batch commit; NO ff-merge to main this session (build commits stay on workflow branch until the eventual eBay deploy session ~1-2 sessions from now).

**Schema-change-in-flight flag:** **STAYS NO entire session** (eBay reuses the schema W2 Amazon shipped at 2026-05-28 Amazon DEPLOY; no `prisma db push`; the `CapturedReview.platform String?` column already in production handles eBay's `platform: 'ebay'` discriminator).

**Rule 9 triggers planned this session: ZERO** (build session only; build commits stay on `workflow-2-competition-scraping` until eBay deploy session ~1-2 sessions from now).

---

## Pre-session notes (offline steps for director between sessions)

**No specific pre-session offline steps for the eBay Session 1 build.** Director can monitor session progress via the in-Claude messages; no director action required between W4 deploy completion and eBay Session 1 start.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking eBay Session 1 at all — can happen any time. Director-independent.

---

## Standing carry-overs

**None this session.** No carry-overs at session entry; no carry-overs at session end. The (a.98) RECOMMENDED-NEXT = P-49 W2 eBay sub-cluster Session 1 is NOT a carry-over — it's the natural next step per §A.2 priority order.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (build session does only push + ff-merge; no rebases, no force pushes, no `git reset --hard`, no `git branch -D`).

**Rule 9 triggers planned this session: ZERO** — build session only; no production deploy. Build commits stay on `workflow-2-competition-scraping` until eBay deploy session.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits an alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any code mechanics.

---

## Why this pointer was written this way (debug aid)

Today's session executed the (a.96) RECOMMENDED-NEXT task locked at the 2026-05-28 Amazon DEPLOY session — P-49 W4 Captured Reviews UI extensions Session 1 — and then **expanded mid-session into a deploy session** via the end-of-session Rule 14f deploy-or-exit picker (director picked Recommended "Deploy now"). The W4 entire workstream now ✅ DEPLOYED-AND-VERIFIED 2026-05-29 end-to-end on vklf.com after Phase 4 6/6 PASS.

The natural next-session task per (a.98) RECOMMENDED-NEXT is **P-49 W2 eBay sub-cluster Session 1 on `workflow-2-competition-scraping`** — per-platform scraper module for eBay reusing W2 Amazon Patterns from the 2026-05-28 deploy session (FF#1 symmetric helpers + FF#4 URL-construction pagination + Session 2 cross-filter loop + Shadow DOM trigger modal). Per §A.2 priority order, eBay is second after Amazon.

- **(Recommended)** P-49 W2 eBay sub-cluster Session 1 — per-platform scraper module for eBay; ~1-2 hours in-Claude; build session; ZERO Rule 9 deploy gates planned; Schema-change-in-flight STAYS NO. Recommended because (a) eBay is the natural next sub-cluster per §A.2 priority order; (b) the W2 Amazon Patterns from 2026-05-28 are directly reusable (FF#1 symmetric helpers + FF#4 URL-construction pagination); (c) shared content-script infrastructure (scrape-pagination + scrape-progress-indicator + scrape-trigger-modal) all in production from yesterday's deploy; (d) PLOS-side handler additions NONE expected (schema already supports `platform: 'ebay'`); (e) the eBay arc accelerates vs. Amazon because Pattern library + infrastructure already established.

The shape of P-49 W2 eBay sub-cluster Session 1 is **plain-terms summary + pre-build reads + branch state verify + pre-build /scoreboard + code mechanics (new `ebay-review-extractor.ts` per-platform module + `ebay-review-extractor.test.ts` + orchestrator dispatch extension) + post-build /scoreboard + §4 Step 1c next-session picker + end-of-session doc-batch (8-9 docs including REVIEWS_PHASE_2_DESIGN.md §B 2026-05-XX FIFTH+ build/deploy-session entry + COMPETITION_SCRAPING_DESIGN.md §B 2026-05-XX cross-reference pointer entry) + 1 push to workflow branch (no ff-merge to main per build-session push pattern memorialized 2026-05-27)**.

**After eBay Session 1 ships,** the next-next sessions step through eBay Session 2 + eBay deploy → Etsy sub-cluster → Walmart sub-cluster → W5 AI review analysis sub-cluster. Director picks at end-of-each-session Rule 14f next-task picker.

**Alternate next-session candidates if director shifts priorities at session start:**

- **P-49 W5 AI review analysis Session 1 — defer eBay.** W5 strictly depends on having review data to analyze; the 2026-05-28 Amazon DEPLOY put real review data in production for W5 to operate on. NOT recommended as the immediate next session — §A.2 priority order locks per-platform sub-clusters before W5; eBay Session 1 should ship before W5 begins to avoid Pattern-class divergence.
- **P-49 W2 Etsy Session 1 — skip eBay.** NOT recommended — eBay is second after Amazon per §A.2 explicit director-stated priority order; skipping eBay would violate the design doc's priority sequencing.
- **P-49 W2 Walmart Session 1 — skip eBay + Etsy.** NOT recommended — Walmart is fourth per §A.2.
- **P-48 Session 3 (Diagnostic #2) — opportunistic insertion.** NOT recommended — eBay Session 1 is the natural next step; P-48 Session 3 is opportunistic and can interleave between sub-cluster sessions later.
- **P-50 Condition Pathology card — small `main`-branch standalone session.** NOT recommended as the next-session task — P-50 is ~10 min in-Claude + lives on `main` not `workflow-2-competition-scraping`. Could slot opportunistically.
- **P-43 mechanical prevention small fix.** Increasingly justifiable given 7-8+ cwd-leak reproductions across recent sessions. NOT recommended as the immediate next session — opportunistic; defer to after eBay sub-cluster deploys.
- **P-26 below-fold scroll capture evaluation.** NOT recommended — LOW alternate; re-evaluate after Reviews Phase 2 closes.
- **P-27 Bug #9 + Bug #15 re-evaluation.** NOT recommended — likely obsolete after P-46.
- **W#2 graduation step.** NOT recommended UNTIL Reviews Phase 2 + P-48 stutter + P-43 + P-26 + P-27 all close.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above.

Check `ROADMAP.md` for the canonical state. Check `docs/REVIEWS_PHASE_2_DESIGN.md` for the canonical interview-locked spec + the §B 2026-05-26 + §B 2026-05-27 + §B 2026-05-28 + §B 2026-05-29 build/deploy-session entries (the W2 Amazon arc + W4 Session 1 + W4 DEPLOY post-deploy sub-section quintet). Check `docs/CORRECTIONS_LOG.md` §Entry 2026-05-29 (today's closing entry with post-deploy sub-observation appended) for the TWO NEW reusable Pattern memorializations + ONE NEW Pattern candidate ("End-of-build-session deploy-or-exit Rule 14f picker") + P-43 cwd-leak Pattern Class reproductions UPDATED to 3 + final calibration 1/2 = 50%.

---

## Personalized Handoff (parent Claude — copy into the director-facing summary)

**What we did this session (3-minute read):**

Today we shipped + deployed the entire W4 Captured Reviews UI extensions cluster end-to-end on vklf.com in a single calendar day — what was originally planned as "Session 1 builds + Session 2-3 deploys" compressed into one calendar day via two converging Rule 14f picker outcomes.

**First, the build portion:** the launch prompt locked all three §C.4 pieces (counter-bar + bulk-delete + drag-reorder) into one session over the design doc's "~2-3 sessions" split estimate. You picked "All three" (Option B over Recommended Option A) — that was a non-Recommended pick (calibration data point 0/1). All three pieces landed cleanly under build commit `e89ae50` with 52 new tests + 2 new API routes.

**Then, mid-session, the session expanded into a deploy session.** After the build-session doc-batch landed on the workflow branch, Claude framed a Rule 14f deploy-or-exit picker offering (A) Deploy-now-and-Phase-4-verify (Recommended — ~30-60 min) vs (B) Exit-now (~10-15 min next-session-start overhead) vs (C) Defer Phase 4 only. **You picked Recommended "Deploy now"** (calibration data point 1/1). The ff-merge `a40e4ba..1e610ce` shipped under ONE Rule 9 deploy gate; Vercel auto-redeployed vklf.com.

**Phase 4 PASSED 6/6 on vklf.com:** Customers-say banner above counter-bar / counter-bar per-star counts / click-to-filter / multi-star OR / bulk-select + delete / drag-to-reorder + reload-persistence — all PASS. Director PASS verdict resolves the session at ✅ DEPLOYED-AND-VERIFIED 2026-05-29 end-to-end on vklf.com. **No fix-forwards needed.**

**W4 entire workstream now ✅ DEPLOYED-AND-VERIFIED with no remaining scope** (§C.4 estimate "~2-3 sessions" compressed into "1 session shipped + 1 session deployed in same day"; Sessions 2 + 3 from §C.4 outline CLOSED).

**Final session calibration:** 1/2 = 50% Yes-to-Recommended (Session 1 scope 0/1 + deploy-or-exit 1/1); running cumulative 24/27 = 88.9% across recent 4 sessions. Framing still well-calibrated overall.

**NEW reusable Pattern candidate memorialized:** "End-of-build-session deploy-or-exit Rule 14f picker — when a build session lands clean + the design doc opens a deploy session as the next-task, fire a director picker offering Deploy-now vs Exit." Today's session demonstrates this Pattern works cleanly when (a) build lands clean, (b) design doc opens deploy as next-task, (c) director available for Phase 4, (d) deploy is bounded.

**P-43 cwd-leak Pattern Class reproduced 3 times today** during /scoreboard runs (pre-build Check 5 + post-build Check 5 + pre-deploy Check 5). Running tally now ~7-8+ across recent sessions. Mechanical prevention small fix is increasingly worth slotting in opportunistically.

**Files now live in production on vklf.com:**

- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` — major rewrite (counter-bar + banner + drag handles + checkboxes + bulk-delete + all wiring)
- `src/lib/competition-scraping/captured-reviews-helpers.ts` — 5 pure helpers
- `src/lib/competition-scraping/handlers/reviews-batch-delete.ts` + thin shim route — POST batch-delete API
- `src/lib/competition-scraping/handlers/reviews-reorder.ts` + thin shim route — PUT reorder API

**Push status:**

- (1) Build-session push to `origin/workflow-2-competition-scraping` carrying `e89ae50` + `1e610ce` — DONE.
- (2) Deploy push to `origin/main` ff-merging `a40e4ba..1e610ce` under ONE Rule 9 deploy gate — DONE.
- (3) Ping-pong push to `origin/workflow-2-competition-scraping` — DONE.
- (4) Post-deploy doc-batch push to `origin/workflow-2-competition-scraping` — PENDING (about to fire).
- (5) Post-deploy doc-batch ff-merge + push to `origin/main` — PENDING (about to fire; operationally adjacent + does NOT re-invoke Rule 9 since post-deploy doc-batch carries no code changes; mirrors the 2026-05-28 + 2026-05-27 + 2026-05-26 same-day-deploy doc-batch pattern).
- Branch state at end-of-session: `workflow-2-competition-scraping` even with `origin/main` at the post-deploy doc-batch SHA.

**Deferred items at session end (Rule 26):** **ZERO.** No carry-overs at entry or end. The W4 workstream is fully covered; the (a.98) RECOMMENDED-NEXT = eBay Session 1 is the natural next step per §A.2 priority order.

**END-OF-SESSION INSTRUCTIONS for you (the director, offline between sessions):**

No specific offline steps required. The standing optional offline step (raise the Supabase Global File Size Limit) remains available any time — see "Pre-session notes" above for the steps. NOT blocking.

The W4 UI is now live on vklf.com — you can use the counter-bar + click-to-filter + drag-reorder + bulk-delete + Customers-say banner immediately on any project with Amazon-scraped reviews.

**NEXT-SESSION INSTRUCTIONS for the next Claude Code session (the easy path):**

When you start the next session in Codespaces, run `./resume` (or `./resume-workflow 2`) — that will switch you to `workflow-2-competition-scraping` and pre-load context. Then paste the launch prompt above (the "Launch prompt" section). The next Claude will produce a 3-sentence plain-terms summary of what it'll do (per Rule 30) before any code mechanics; once you give go-ahead, it'll execute eBay Session 1 end-to-end. Expected ~1-2 hours in-Claude. BUILD session — ZERO Rule 9 deploy gates planned. Schema-change-in-flight STAYS NO.

**ESCAPE HATCH (if `./resume` doesn't work or you want a different task):**

If you'd rather pick a different next-session task, surface that at session start before any reads happen — the Rule 14f forced-picker mechanics will accommodate. The alternate candidates are listed in the "Alternate next-session candidates" section above; eBay Session 1 is the canonical next step per §A.2 priority order, but if you want to jump ahead to W5 AI review analysis (which can now operate on real production data from the Amazon DEPLOY) or insert P-48 Session 3 opportunistically, that's available.

**Offline between sessions:** None blocking. Optional Supabase file size limit raise remains available.

**Open questions / carry-overs:** None at session end. Today's session shipped + deployed all 3 §C.4 pieces under one calendar day via two converging Rule 14f picker outcomes (Session 1 scope bundled-all-three + end-of-session deploy-or-exit deploy-now); W4 entire workstream now ✅ DEPLOYED-AND-VERIFIED with no remaining scope; eBay Session 1 is the natural next step per §A.2.

---
