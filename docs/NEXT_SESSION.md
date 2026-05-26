# Next session

**Written:** 2026-05-30 (`session_2026-05-30_p49-w2-ebay-sub-cluster-session-1` — post-deploy doc-batch handoff after **W#2 polish P-49 Reviews Phase 2 Workstream 2 eBay sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-30 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`**) — build + deploy + 5-fix-forward cascade + Phase-4-PASS bundled into ONE calendar day; Session 1 build commit `11e99e1` (3 files +1535/-99) carrying NEW `ebay-review-extractor.ts` (~390 LOC) + NEW `ebay-review-extractor.test.ts` (~470 LOC; 64 new node:test cases) + MODIFY `orchestrator.ts` (eBay dispatch) ff-merged to main under Rule 9 deploy gate; Vercel auto-redeploy fired; Phase 4 surfaced TWO co-occurring bugs (seller auto-detect failing because modern eBay listing pages don't render `/usr/<seller>` links in the visible DOM — seller is embedded in a JSON data island as `"sellerUserName":"<value>"`; AND This Item filter returning All Items rows because the feedback page renders both This Item + All Items tabpanels server-side with the All Items panel carrying the `hidden` attribute) that survived 3 speculative fix-forwards (FF#1+#2 bundled `23b6221` + FF#3 `c19f187`) before Rule 14f mid-Phase-4 picker rerouted to diagnostic-instrumentation FF#4 `6675963` (TEMPORARY HTML-dump + console.log probes; director uploaded 3 HTML files + console output) → **FF#5 `23aa851` empirically-verified fix — the WIN** (3 files +176/-135 carrying `extractSellerFromListingHtml` regex against `"sellerUserName"` JSON data island + `[role=tabpanel]:not([hidden])` walker scope + remove FF#4 instrumentation + 8 new test cases); director Phase 4 PASS verdict on FF#5 "Everything worked perfectly"; eBay sub-cluster now fully ✅ DEPLOYED-AND-VERIFIED with no remaining scope (§C.2 estimate "~3-4 sessions" compressed into "1 calendar day"; eBay Sessions 2 + 3 from §C.2 outline CLOSED); THREE Rule 14f forced-pickers fired all director-Yes-to-Recommended (3/3 = 100% calibration; running cumulative 27/30 = 90% across recent 5 sessions); FIVE Rule 9 deploy gates fired (stretches 2026-05-28 Amazon DEPLOY 4-FF Pattern by one further); P-43 cwd-leak Pattern Class reproduced ~3 more times this session (running tally ~11+; strong empirical signal continues mounting). **Closes (a.98); opens (a.99) RECOMMENDED-NEXT = P-49 W2 Etsy sub-cluster Session 1** on `workflow-2-competition-scraping` per §A.2 priority order (Etsy third after Amazon + eBay) + §C.2 implementation outline (reuses W2 Amazon + eBay Patterns: FF#1 symmetric helpers + FF#4 URL-construction-based pagination + cross-filter loop per §A.2's `3-star + 2-star + 1-star at 200/star` default + Shadow DOM trigger modal with per-URL cap override + today's NEW JSON data-island extraction Pattern for Etsy's seller/listing metadata).

---

## What we did this session (in plain terms)

Today shipped + deployed the **entire eBay sub-cluster of P-49 Workstream 2 end-to-end on vklf.com in a single calendar day** — what was originally planned as "~3-4 sessions for the full eBay arc" compressed into one calendar day via three converging Rule 14f picker outcomes and a 5-fix-forward cascade that converted speculative debugging into empirical-evidence-driven fixing.

**First, the start-of-session deploy-now pick:** Yesterday's W4 deploy memorialized a new Pattern — "End-of-build-session deploy-or-exit Rule 14f picker" — that fires when a build session lands clean + the next-task is a deploy-session. Today that Pattern fired for the FIRST TIME at start-of-session (rather than end-of-session): the inbound (a.98) task was a build session, but Claude framed a deploy-now-vs-exit picker as the very first thing — you picked Recommended Deploy-now. That converted today from a planned build session into a build-and-deploy session from the start.

**Then, the build commit landed cleanly.** Session 1 build commit `11e99e1` (3 files +1535/-99): NEW `ebay-review-extractor.ts` (~390 LOC; per-platform module mirroring the W2 Amazon Patterns from the 2026-05-28 deploy session) + NEW `ebay-review-extractor.test.ts` (~470 LOC; 64 new node:test cases) + MODIFY `orchestrator.ts` (eBay dispatch added). The build was small + clean because eBay's architecture mirrors Amazon's — symmetric URL-detection helpers + URL-construction pagination + cross-filter loop + Shadow DOM trigger modal all reused.

**Then the cascade started.** Phase 4 director real-Chrome verification surfaced TWO co-occurring bugs: (1) eBay's listing page wasn't auto-detecting the seller (the listing page no longer renders `/usr/<seller>` links in the visible DOM — the seller name is in a JSON data island as `"sellerUserName":"<value>"`); (2) the This Item filter wasn't returning only This Item rows — it was also returning rows from the All Items tab (the feedback page renders BOTH tabpanels server-side, with the All Items panel carrying the `hidden` HTML attribute). Three speculative fix-forwards followed: **FF#1+#2 bundled** (trigger modal extended with optional eBay seller text input + `buildEbayFeedbackUrl` adds director's working URL params) → BUSTED. **FF#3** (full `_item`-suffixed param set replacing `_pgn`) → BUSTED.

**Mid-Phase-4 Rule 14f picker fired** — you picked Recommended "Diagnostic instrumentation" over "Defer to next session". **FF#4 `6675963` shipped TEMPORARY diagnostic instrumentation** (dumps fetched HTML to your Downloads folder via programmatic `<a download>` click + console.logs structured row-count breakdowns per selector probe). You ran ONE scrape → uploaded 3 HTML files (listing + NEGATIVE feedback page 1 + NEUTRAL feedback page 1) + pasted the console output.

**Analysis of the dumped HTML files revealed BOTH root causes simultaneously.** **FF#5 `23aa851` — the WIN** (3 files +176/-135 carrying `extractSellerFromListingHtml(html)` regex against the JSON data island + `[role=tabpanel]:not([hidden])` walker scope + remove FF#4 instrumentation + 8 new test cases). **Phase 4 PASS verdict on FF#5 = "Everything worked perfectly."** eBay sub-cluster ✅ DEPLOYED-AND-VERIFIED end-to-end on vklf.com.

**The session memorialized THREE NEW reusable Patterns in CORRECTIONS_LOG §Entry 2026-05-30:** (a) **"Diagnostic-instrumentation FF as escape valve from speculative-FF antipattern"** — when 2+ consecutive speculative fix-forwards BUSTED, ALWAYS fire a Rule 14f picker offering Diagnostic instrumentation (Recommended) vs Defer to next session; don't ship a 3rd speculative FF; (b) **"Tabpanel-scoped DOM walking — `[role=tabpanel]:not([hidden])` to avoid capturing rows from inactive tabs"** — generalizes beyond eBay to any tabbed-content scraping surface; (c) **"JSON data-island extraction for server-rendered seller/product metadata"** — `"sellerUserName":"<value>"` on eBay; likely similar shapes on Etsy + Walmart; regex extraction against raw HTML is more robust than DOM-link probing when the visible UI uses React buttons/spans rather than `<a href>`. **All three Patterns apply directly to the next Etsy + Walmart sub-cluster sessions.**

**P-43 cwd-leak Pattern Class reproduced ~3 more times today** during deploy cycles (extension `npm run zip` ran from project root in 2 deploy cycles; pre-build /scoreboard Check 5 from prior extension test cwd). Running tally now ~11+ across recent sessions. **Strong empirical signal continues mounting** for the P-43 mechanical prevention small fix. The end-of-session §4 Step 1c next-task picker offered P-43 as an alternative to Etsy — you picked Recommended Etsy per §A.2 priority order; P-43 increasingly worth slotting in opportunistically.

**§C.2 estimate compression memorialized:** "~3-4 sessions for the full eBay arc" → "1 session shipped + 1 session deployed + 5 FFs + Phase 4 PASS, all in one calendar day". eBay Sessions 2 + 3 from §C.2 outline CLOSED; **entire eBay sub-cluster now ✅ DEPLOYED-AND-VERIFIED with no remaining scope.**

## What we'll do next session (in plain terms)

Next session is **P-49 W2 Etsy sub-cluster Session 1** on `workflow-2-competition-scraping` per (a.99). Per §A.2 priority order, Etsy is third after Amazon (deployed 2026-05-28) + eBay (deployed today 2026-05-30). The shape of Etsy Session 1 mirrors the W2 eBay arc — and Etsy should land at the same 1-calendar-day cadence because **all four Patterns are now directly reusable:**

1. **FF#1 symmetric helpers Pattern** (from Amazon FF#1 2026-05-28) — Etsy's per-platform module should adopt `isEtsyScrapableUrl` + `extractListingIdFromEtsyUrl` symmetric helpers from the start.
2. **FF#4 URL-construction-based pagination Pattern** (from Amazon FF#4 2026-05-28) — Etsy's pagination should adopt direct URL construction rather than DOM-link-scraping (Etsy's per-star filter URL parameters are stable; build URLs directly).
3. **Tabpanel-scoped DOM walking Pattern** (NEW from today's FF#5) — if Etsy's review overlay uses tabbed UI with hidden inactive tabs, scope the walker to `[role=tabpanel]:not([hidden])` from the start.
4. **JSON data-island extraction Pattern** (NEW from today's FF#5) — Etsy listing pages likely embed JSON blobs containing canonical seller/listing/category metadata; use regex extraction against raw HTML for any platform-canonical metadata that the visible UI renders via React components rather than `<a href>` links.

**Etsy-specific spec per §A.2 director-verbatim:** listing page `https://www.etsy.com/listing/<ID>/...`; `Reviews for this item` section on listing page + `View all reviews for this item` overlay with per-star percentage filter affordances at top-right (hover to see %, click to filter); ~8 reviews/page in overlay paginated; capture review body only; default capture is **3-star + 2-star + 1-star at 200/star** user-adjustable.

**Build session shape — ZERO Rule 9 deploy gates planned** (build session only; build commits stay on workflow branch until Etsy deploy session). Schema-change-in-flight STAYS NO (no schema work — Etsy reuses the schema W2 Amazon shipped). Estimated ~1-2 hours in-Claude (matching today's eBay Session 1 pre-cascade build time). Next-next session likely Etsy DEPLOY (possibly bundled with Session 1 via the "End-of-build-session deploy-or-exit Rule 14f picker" Pattern again).

**Pre-build read list for the next session:** `docs/REVIEWS_PHASE_2_DESIGN.md` §A.2 (per-platform priority order + Etsy-specific spec) + §A.15 (anti-bot conservative defaults) + §C.2 (Etsy sub-cluster implementation outline) + §B 2026-05-30 (today's eBay Session 1 + DEPLOY + 5-fix-forward cascade entry — the canonical W2 eBay Patterns reference) + §B 2026-05-28 (W2 Amazon DEPLOY + 4-fix-forward cascade) + §B 2026-05-27 (W2 Amazon Session 2 cross-filter loop + Shadow DOM trigger modal) + §B 2026-05-26 (W2 Amazon Session 1 foundation) + `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-30 (extension-side architecture cross-reference pointer for today's eBay deploy with the 3 NEW Patterns listed) + `docs/CORRECTIONS_LOG.md` §Entry 2026-05-30 (today's closing entry with the 3 NEW reusable Patterns memorialized + the 3 LOW informational sub-observations) + the existing `extensions/competition-scraping/src/lib/content-script/ebay-review-extractor.ts` (today's canonical W2 eBay platform-module precedent for the Etsy equivalent) + `amazon-review-extractor.ts` (the original canonical W2 platform-module precedent).

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-30 (P-49 W2 eBay ✅ DEPLOYED-AND-VERIFIED; Etsy Session 1 NEXT):

- **P-49 W2 Etsy sub-cluster (Session 1 + deploy) — NEXT (a.99).** ~1-2 sessions estimated based on today's eBay 1-calendar-day cadence. Per §A.2 priority order — Etsy third after Amazon (deployed 2026-05-28) + eBay (deployed today 2026-05-30). Reuses W2 Amazon + eBay Patterns from the 2026-05-28 + today's deploy sessions (FF#1 symmetric helpers + FF#4 URL-construction pagination + cross-filter loop + Shadow DOM trigger modal + today's NEW JSON data-island extraction Pattern + today's NEW tabpanel-scoped DOM walking Pattern). The Etsy arc should accelerate because the Pattern library is now richer than at eBay's start.
- **P-49 W2 Walmart sub-cluster (Session 1 + deploy).** ~1-2 sessions estimated based on today's eBay 1-calendar-day cadence. Per §A.2 priority order — Walmart fourth.
- **P-49 W5 AI review analysis system.** ~5-10 sessions. 3 levels (per-product two-sweep + cross-Type pooled + cross-everything competitive landscape) using the `ReviewAnalysis` table shipped in W2 Session 1 + Claude Opus + per-run model-version dropdown + cost caps + fingerprint cache. Can operate on real production review data (Amazon + eBay corpora exist as of today; Etsy + Walmart corpora pending).
- **P-49 total build arc ~7-12 sessions remaining.** Revised down from yesterday's ~10-20 since today closed eBay entirely (Sessions 2 + 3 from §C.2 CLOSED via the build-and-deploy-in-one-day compression) — applying the same compression assumption to Etsy + Walmart yields ~2-4 more sessions for those + ~5-10 for W5.
- **P-50 Condition Pathology card.** ~10 min in-Claude. Lives on `main` branch. Can slot into any deploy session OR done standalone. NOT on the critical path.
- **P-48 Session 3 (Diagnostic #2) — DEFERRED to opportunistic insertion.** ~30-60 min in-Claude.
- **P-43 mechanical prevention candidate (LOW informational).** ~1 small session. Add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`. **Empirical signal continues mounting** — ~3 more reproductions today; running tally ~11+ across recent sessions. **Increasingly worth slotting in opportunistically** — today's end-of-session §4 Step 1c picker offered P-43 as an alternative; Etsy won this time but P-43 is increasingly competitive.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions, OR drop. Re-evaluate after Reviews Phase 2 closes.
- **P-27 Bug #9 + Bug #15 — DEFERRED LOW.** ~0-1 sessions. Likely obsolete after P-46. Re-evaluate after P-26.
- **W#2 graduation step (further deferred).** Gated by Reviews Phase 2 closure at the workstream-by-workstream level. Likely 4-8 months out at current sessions-per-week cadence + 1-calendar-day per-platform-cluster compression.
- **THEN STOP AND EXPLICITLY ASK DIRECTOR for any next round of competition-scraping additions** per your standing directive after Reviews Phase 2 + P-48 stutter + P-43 + P-26 + P-27 all close.
- **After your next round of additions ships:** W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent.

---

## Status of last session

**W#2 polish P-49 Reviews Phase 2 Workstream 2 eBay sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-30 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` (`session_2026-05-30_p49-w2-ebay-sub-cluster-session-1`)** — build + deploy + 5-fix-forward cascade + Phase-4-PASS bundled into ONE calendar day.

**Session shape (BUILD + DEPLOY + 5-FIX-FORWARD + PHASE-4-PASS bundled — FIVE Rule 9 deploy gates fired; THREE Rule 14f forced-pickers fired all director-Yes-to-Recommended):**

- **Build portion:**
  - Pre-deploy /scoreboard 5/5 GREEN at entry baselines (root tsc clean / extension tsc clean / 655 ext / 838 src/lib / 64 routes); Check 6 SKIPPED per Rule 27.
  - **Rule 14f start-of-session deploy-now-vs-exit picker fired** — director picked Recommended Deploy-now (calibration 1/1 on the deploy-or-exit picker firing at start-of-session for the FIRST TIME per the Pattern memorialized 2026-05-29 sub-observation f).
  - Code mechanics: NEW `ebay-review-extractor.ts` (~390 LOC) + NEW `ebay-review-extractor.test.ts` (~470 LOC; 64 new node:test cases) + MODIFY `orchestrator.ts` (eBay dispatch).
  - Build commit `11e99e1` landed (3 files +1535/-99).
  - Build deploy ff-merge to main under Rule 9 gate #1; Vercel auto-redeploy fired; fresh extension zip `plos-extension-2026-05-30-w2-ebay-deploy-1.zip` produced.

- **5-fix-forward cascade portion (during Phase 4 verification):**
  - **FF#1+#2 bundled `23b6221`** (4 files +183/-30; +4 ext tests) — trigger modal seller text input + `buildEbayFeedbackUrl` URL params per director's working URL; BUSTED.
  - **FF#3 `c19f187`** (2 files +58/-25; 0 new tests) — full `_item`-suffixed param set replacing `_pgn`; BUSTED.
  - **Rule 14f mid-Phase-4 diagnostic-vs-defer picker fired** after FF#3 BUSTED — director picked Recommended Diagnostic instrumentation (calibration 2/2).
  - **FF#4 `6675963`** (2 files +116/-0) — TEMPORARY diagnostic instrumentation (HTML-dump + console.log probes); director uploaded 3 HTML files + console output.
  - **FF#5 `23aa851` — the WIN** (3 files +176/-135; +8 ext tests) — `extractSellerFromListingHtml` regex against `"sellerUserName"` JSON data island + `[role=tabpanel]:not([hidden])` walker scope + remove FF#4 instrumentation.

- **Phase 4 portion:**
  - Phase 4 director real-Chrome verification PASS verdict on FF#5 = **"Everything worked perfectly."** No further fix-forwards needed.

- **End-of-session:**
  - **Rule 14f §4 Step 1c next-task picker fired** — director picked Recommended Etsy over W5 / P-43 / P-48 (calibration 3/3 = 100% this session).
  - Post-deploy doc-batch covers the 9-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + NEXT_SESSION + REVIEWS_PHASE_2_DESIGN.md §B 2026-05-30 + COMPETITION_SCRAPING_DESIGN.md §B 2026-05-30 cross-reference pointer).

**THREE Rule 14f forced-pickers fired total this session — all director-Yes-to-Recommended (3/3 = 100% calibration this session; running cumulative 27/30 = 90% across recent 5 sessions).**

**FIVE Rule 9 deploy gates fired this session** (build deploy + FF#1+#2 bundled deploy + FF#3 deploy + FF#4 diagnostic deploy + FF#5 fix deploy — stretches the 2026-05-28 Amazon DEPLOY 4-FF Pattern by one further).

**Schema-change-in-flight flag STAYS NO entire session** (eBay reuses the schema W2 Amazon shipped 2026-05-28; no `prisma db push`; no API contract changes; new platform discriminator `'ebay'` already accepted by the `CapturedReview.platform String?` column shipped at W2 Session 1).

**ZERO DEFERRED items at session end (Rule 26).** No carry-overs at entry; no carry-overs at end; eBay sub-cluster fully ✅ DEPLOYED-AND-VERIFIED with no remaining scope.

**Baselines locked from this session:** extension `npm test` = **731/731** (+76 cumulative from 655 entry baseline); src/lib **838 UNCHANGED**; routes **64 UNCHANGED**. Files now live in production on vklf.com.

**P-43 cwd-leak Pattern Class reproduced ~3 more times this session** (extension `npm run zip` from project root × 2 deploy cycles + pre-build /scoreboard Check 5); running tally ~11+ across recent sessions; strong empirical signal continues mounting for the P-43 mechanical prevention small fix.

**§C.2 estimate compression memorialized:** "~3-4 sessions for the full eBay arc" → "1 calendar day"; eBay Sessions 2 + 3 from §C.2 outline CLOSED; **entire eBay sub-cluster now ✅ DEPLOYED-AND-VERIFIED with no remaining scope.**

**FORTY-SECOND end-of-session run under the Rule 30 + §4 Step 4b extended template.**

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-49 W2 Etsy sub-cluster Session 1 begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` **even with `origin/main`** at the post-deploy doc-batch SHA (both branches at the same SHA after today's 5 deploy ping-pongs + post-deploy doc-batch ff-merge). Verify with `git log main..HEAD --oneline` showing **0 commits ahead** at session entry.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-49 Reviews Phase 2 Workstream 2 Etsy sub-cluster Session 1 on `workflow-2-competition-scraping`.** Closes **(a.99) RECOMMENDED-NEXT**. BUILD session — ZERO Rule 9 deploy gates planned. Schema-change-in-flight flag STAYS NO entire session (no schema work — Etsy reuses the schema W2 Amazon shipped at 2026-05-28 Amazon DEPLOY).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify the SHA relationships with `git log main..HEAD --oneline` — should show **0 commits ahead at session entry** (both branches at the same SHA after yesterday's eBay deploy ping-pongs + post-deploy doc-batch ff-merge).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/ROADMAP.md` lines 1-30 (header + recent session sequence) + the **P-49 Reviews Phase 2 polish-backlog entry** (Status: "🟢 IN-FLIGHT 2026-05-30 — W2 Amazon ✅ DEPLOYED-AND-VERIFIED 2026-05-28 + W2 eBay sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-30 + W4 ✅ DEPLOYED-AND-VERIFIED 2026-05-29 ... Etsy sub-cluster NEXT per (a.99)").
- **`docs/REVIEWS_PHASE_2_DESIGN.md`** §A.2 (per-platform priority order — Etsy third after Amazon + eBay; Etsy-specific spec: per-star percentage filter overlay + ~8 reviews/page + default 3-star+2-star+1-star at 200/star) + §A.15 (conservative anti-bot defaults) + §C.2 (Etsy sub-cluster implementation outline — the canonical Etsy design canon) + **§B 2026-05-30** (today's W2 eBay Session 1 + DEPLOY + 5-fix-forward cascade entry — the canonical W2 eBay Patterns reference with 3 NEW Patterns listed) + §B 2026-05-28 (W2 Amazon DEPLOY + 4-fix-forward cascade — canonical W2 Amazon Patterns reference) + §B 2026-05-27 (W2 Amazon Session 2 cross-star + Customers-say + trigger modal) + §B 2026-05-26 (W2 Amazon Session 1 foundation — shared content-script infrastructure that Etsy reuses).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-30 (extension-side architecture cross-reference pointer for today's eBay deploy with the 3 NEW Patterns listed: "Diagnostic-instrumentation FF as escape valve" + "Tabpanel-scoped DOM walking" + "JSON data-island extraction").
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-30 (today's closing entry — THREE NEW reusable Patterns memorialized + 3 LOW informational sub-observations) + §Entry 2026-05-28 (W2 Amazon DEPLOY closing entry — THREE NEW Patterns including FF#1 dispatch over-restriction antipattern + FF#4 pageNumber-direct-increment Pattern).
- **The W2 eBay precedent extension code** — `extensions/competition-scraping/src/lib/content-script/ebay-review-extractor.ts` (today's canonical W2 eBay platform-module precedent for the Etsy equivalent) + `ebay-review-extractor.test.ts` + `amazon-review-extractor.ts` + `amazon-review-extractor.test.ts` + `orchestrator.ts` + `scrape-trigger-modal.ts` + `scrape-pagination.ts` + `scrape-progress-indicator.ts` (the shared infrastructure modules Etsy reuses unchanged).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (deploy gate — 0 fires planned) + Rule 14f (forced-picker mechanics — expect 0-3 to fire: possibly start-of-session deploy-now-vs-exit picker if applicable per yesterday's Pattern + possibly Etsy-specific edge case pickers + end-of-session §4 Step 1c next-task picker) + Rule 18 + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — extension-side per-platform module + no schema; schema-change-in-flight STAYS NO) + Rule 25 (Multi-Workflow — single-branch workflow-2) + Rule 26 (DEFERRED items registry — ZERO carry-overs at start) + Rule 27 (Playwright forced-picker — non-deploy session; SKIP default-approved per the standing non-deploy SKIP precedent) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `feedback_recommendation_style.md` (most-thorough/reliable).
- `feedback_approval_scope_per_decision_unit.md` (build-session push pattern: ONE push to workflow branch; NO ff-merge to main this session unless the start-of-session deploy-now picker fires and director picks Deploy-now per the new Pattern memorialized 2026-05-29 + reused today).
- `feedback_default_to_recommendation.md`.
- `feedback_session_bookends_plain_summary.md`.

**Task shape (P-49 W2 Etsy sub-cluster Session 1 — per-platform scraper module for Etsy reusing W2 Amazon + eBay Patterns):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or code mechanics. The 3 plain-terms sections at top above provide the launch context.

2. **Pre-build reads** — execute the pre-build read list above. ~5-10 min.

3. **Branch state verify** — `git branch --show-current` (should be `workflow-2-competition-scraping`) + `git log main..HEAD --oneline` (should show **0 commits ahead at session entry**). If anything else, surface to director.

4. **Pre-build /scoreboard** — confirm 5/5 GREEN at the new baselines on `workflow-2-competition-scraping` (root tsc clean / extension tsc clean / **731 ext** / **838 src/lib** / **64 routes**); Check 6 Playwright SKIP via Rule 14f forced-picker per Rule 27 (Recommended per standing non-deploy SKIP precedent — last 41+ sessions all SKIP for non-deploy; treated as default-approved).

5. **(Possibly) Rule 14f start-of-session deploy-now-vs-exit picker** — per the new Pattern memorialized 2026-05-29 sub-observation (f) + reused today at start-of-session. Frame the picker only if (a) the inbound task is a build session, (b) the build is bounded against a locked spec, (c) the corpus already exists for Phase 4 verification (eBay + Amazon corpora both exist as of today). For Etsy this likely fires the same way as today's eBay session-start picker; director Yes-to-Recommended on the Deploy-now path is the canonical outcome.

6. **Rule 14f picker(s) potentially firing during code mechanics:** Anticipate possibly: (a) Etsy-specific per-star percentage filter cross-loop scope picker if §A.2 spec leaves any edge case ambiguity (Recommended path is to follow §A.2 director-verbatim spec exactly — `3-star + 2-star + 1-star at 200/star`); (b) Etsy listing-page seller/listing metadata extraction picker if the Etsy listing page also uses JSON data-island Pattern (Recommended path is to apply today's NEW JSON data-island extraction Pattern from the start + preserve DOM-link walker as a classic-view fallback per the Pattern's specification). Per `feedback_default_to_recommendation.md` no clarifying picker should fire when launch prompt + design doc agree.

7. **Code mechanics — Etsy per-platform module:** Mirror the W2 Amazon + eBay Patterns from the start:
   - NEW `extensions/competition-scraping/src/lib/content-script/etsy-review-extractor.ts` — per-row DOM walker against Etsy's review row structure (listing-page `Reviews for this item` section + `View all reviews for this item` overlay with per-star percentage filter affordances) + URL detection helpers (`isEtsyListingUrl` + `isEtsyScrapableUrl` + `extractListingIdFromEtsyUrl` — symmetric helpers per FF#1 Pattern from Amazon DEPLOY) + cross-filter loop (3-star → 2-star → 1-star per §A.2 spec) + parsers (`parseEtsyReviewBody` review body extractor; Etsy has no helpful-count signal per §A.2) + `runEtsyReviewScrape` orchestrator using `fetch()` + `DOMParser` for pagination (extends Session 1's Pattern) + URL-construction-based pagination per FF#4 Pattern (`buildEtsyReviewUrl(listingId, starFilter, pageNumber)` direct URL construction; stop signal = fetched page has 0 reviews; don't scrape next-page links).
   - **Apply NEW Patterns from today's eBay FF#5 from the start:** (a) **JSON data-island extraction** — Etsy listing pages likely embed seller/listing/category metadata in JSON blobs; use `extractSellerFromEtsyListingHtml(html)` regex against raw HTML for any platform-canonical metadata that the visible UI renders via React components rather than `<a href>` links; preserve DOM-link walker as a classic-view fallback; (b) **Tabpanel-scoped DOM walking** — if Etsy's review overlay uses tabbed UI with hidden inactive tabs, scope the walker to `[role=tabpanel]:not([hidden])` from the start; fall through to whole-doc scope as a classic-view safety net.
   - NEW `extensions/competition-scraping/src/lib/content-script/etsy-review-extractor.test.ts` — node:test cases covering all new helpers + parsers + dispatch surface (anticipate ~30-65 new cases based on the eBay precedent's 64 cases for the equivalent Session 1).
   - MODIFY `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — extend `start-review-scrape` handler dispatch to route Etsy URLs to `runEtsyReviewScrape`; reuse the existing `openScrapeTriggerModal` + `saveReview` wrapper.
   - The shared `scrape-pagination.ts` + `scrape-progress-indicator.ts` + `scrape-trigger-modal.ts` are all reused — NO modifications needed (platform-agnostic).
   - PLOS-side handler extensions — NONE expected (the existing `url-reviews.ts` POST handler accepts `platform: 'etsy'` already via the `CapturedReview.platform String?` column shipped at W2 Session 1 2026-05-26).

8. **Post-build /scoreboard 5/5 GREEN at new ext baseline** — expected extension `npm test` ≈ 761-796 (731 + ~30-65 new cases for Etsy); 838 src/lib UNCHANGED; 64 routes UNCHANGED; Check 6 SKIPPED per Rule 27.

9. **§4 Step 1c forced-picker at session-end** — locks the next-next task per Rule 14f. Likely alternatives: P-49 W2 Etsy DEPLOY session (Recommended if Session 1 lands the full Etsy sub-cluster scope and director ready for Phase 4) vs P-49 W2 Walmart Session 1 (premature unless Etsy is fully deployed) vs P-43 mechanical prevention small fix.

10. **End-of-session doc-batch** covers ROADMAP (header bump + P-49 polish-backlog entry status update for Etsy Session 1 outcome + (a.99) closes + (a.100) opens) + CHAT_REGISTRY (header bump — 164th session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header + new §Entry 2026-05-XX capturing Etsy Session 1 outcome + any Patterns memorialized) + NEXT_SESSION (rewritten for next-next task per (a.100)) + HANDOFF_PROTOCOL (header bump only expected) + CLAUDE_CODE_STARTER (header bump only) + REVIEWS_PHASE_2_DESIGN.md §B 2026-05-XX (SIXTH+ build/deploy-session entry per Rule 18 — Etsy Session 1 entry) + COMPETITION_SCRAPING_DESIGN.md (likely §B 2026-05-XX cross-reference pointer entry per the W2 Amazon + eBay precedent) + COMPETITION_DATA_V2_DESIGN.md (UNCHANGED).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** every Rule 14f picker fired during code mechanics should surface the recommended path + default to it unless director shifts.

**Per `feedback_approval_scope_per_decision_unit.md` (build-session push pattern memorialized 2026-05-27 + start-of-session deploy-now Pattern from 2026-05-29):** ONE push to `origin/workflow-2-competition-scraping` carrying build commit + doc-batch commit if Session 1 stays as a pure build session; ~12 pushes if the start-of-session deploy-now picker fires + director picks Deploy-now (per today's 5-fix-forward + deploy precedent).

**Schema-change-in-flight flag:** **STAYS NO entire session** (Etsy reuses the schema W2 Amazon shipped at 2026-05-28 Amazon DEPLOY; no `prisma db push`; the `CapturedReview.platform String?` column already in production handles Etsy's `platform: 'etsy'` discriminator).

**Rule 9 triggers planned this session: ZERO** (build session only by default; build commits stay on `workflow-2-competition-scraping` until Etsy deploy session ~0-1 sessions from now; deploy may fire today if start-of-session deploy-now picker fires + director picks Deploy-now).

---

## Pre-session notes (offline steps for director between sessions)

**No specific pre-session offline steps for the Etsy Session 1 build.** Director can monitor session progress via the in-Claude messages; no director action required between eBay deploy completion and Etsy Session 1 start.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking Etsy Session 1 at all — can happen any time. Director-independent.

---

## Standing carry-overs

**None this session.** No carry-overs at session entry; no carry-overs at session end. The (a.99) RECOMMENDED-NEXT = P-49 W2 Etsy sub-cluster Session 1 is NOT a carry-over — it's the natural next step per §A.2 priority order.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (build session does only push + possibly ff-merge if start-of-session deploy-now picker fires; no rebases, no force pushes, no `git reset --hard`, no `git branch -D`).

**Rule 9 triggers planned this session: ZERO** by default — build session only; no production deploy planned. Build commits stay on `workflow-2-competition-scraping` until Etsy deploy session. (Note: 1-5 Rule 9 gates may fire IF the start-of-session deploy-now picker fires + director picks Deploy-now per today's 5-fix-forward + deploy precedent.)

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits an alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any code mechanics.

---

## Why this pointer was written this way (debug aid)

Today's session executed the (a.98) RECOMMENDED-NEXT task locked at the 2026-05-29 W4 post-deploy doc-batch — P-49 W2 eBay sub-cluster Session 1 — and **expanded mid-session into a deploy session via the start-of-session Rule 14f deploy-or-exit picker** (the Pattern from §Entry 2026-05-29 sub-observation f firing for the FIRST TIME at start-of-session rather than end-of-session); director picked Recommended Deploy-now. The eBay sub-cluster is now ✅ DEPLOYED-AND-VERIFIED 2026-05-30 end-to-end on vklf.com after a 5-fix-forward cascade culminating in FF#5's empirically-verified one-shot fix (the diagnostic-instrumentation FF#4 Pattern enabling FF#5 to land both bugs in one commit).

The natural next-session task per (a.99) RECOMMENDED-NEXT is **P-49 W2 Etsy sub-cluster Session 1 on `workflow-2-competition-scraping`** — per-platform scraper module for Etsy reusing W2 Amazon + eBay Patterns + today's NEW 3 Patterns (JSON data-island extraction + tabpanel-scoped DOM walking + diagnostic-instrumentation FF as escape valve). Per §A.2 priority order, Etsy is third after Amazon (2026-05-28) + eBay (2026-05-30).

- **(Recommended)** P-49 W2 Etsy sub-cluster Session 1 — per-platform scraper module for Etsy; ~1-2 hours in-Claude (matching today's eBay Session 1 pre-cascade build time); build session; ZERO Rule 9 deploy gates planned by default (but start-of-session deploy-now picker may fire per today's Pattern); Schema-change-in-flight STAYS NO. Recommended because (a) Etsy is the natural next sub-cluster per §A.2 priority order; (b) the W2 Amazon + eBay Patterns from 2026-05-28 + 2026-05-30 are directly reusable (FF#1 symmetric helpers + FF#4 URL-construction pagination + cross-filter loop + Shadow DOM trigger modal); (c) NEW 3 Patterns from today's eBay FF#5 apply directly to Etsy (JSON data-island extraction + tabpanel-scoped DOM walking + diagnostic-instrumentation FF escape valve); (d) shared content-script infrastructure (scrape-pagination + scrape-progress-indicator + scrape-trigger-modal) all in production from prior deploys; (e) PLOS-side handler additions NONE expected (schema already supports `platform: 'etsy'`); (f) the Etsy arc accelerates vs. eBay because Pattern library + infrastructure are now richer than at eBay's start.

The shape of P-49 W2 Etsy sub-cluster Session 1 is **plain-terms summary + pre-build reads + branch state verify + pre-build /scoreboard + (possibly) start-of-session deploy-now picker + code mechanics (new `etsy-review-extractor.ts` per-platform module + `etsy-review-extractor.test.ts` + orchestrator dispatch extension + apply NEW JSON data-island extraction + tabpanel-scoped walker Patterns from the start) + post-build /scoreboard + §4 Step 1c next-session picker + end-of-session doc-batch (9-doc bundle including REVIEWS_PHASE_2_DESIGN.md §B SIXTH+ build/deploy-session entry + COMPETITION_SCRAPING_DESIGN.md §B cross-reference pointer entry) + 1 push to workflow branch (or ~12 pushes if start-of-session deploy-now picker fires)**.

**After Etsy Session 1 ships,** the next-next sessions step through Etsy DEPLOY → Walmart sub-cluster → W5 AI review analysis sub-cluster. Director picks at end-of-each-session Rule 14f next-task picker.

**Alternate next-session candidates if director shifts priorities at session start:**

- **P-49 W5 AI review analysis Session 1 — defer Etsy.** W5 strictly depends on having review data to analyze; the 2026-05-28 Amazon + 2026-05-30 eBay corpora exist in production for W5 to operate on. NOT recommended as the immediate next session — §A.2 priority order locks per-platform sub-clusters before W5; Etsy + Walmart Sessions should ship before W5 begins to avoid Pattern-class divergence.
- **P-49 W2 Walmart Session 1 — skip Etsy.** NOT recommended — Etsy is third after Amazon + eBay per §A.2 explicit director-stated priority order; skipping Etsy would violate the design doc's priority sequencing.
- **P-48 Session 3 (Diagnostic #2) — opportunistic insertion.** NOT recommended — Etsy Session 1 is the natural next step; P-48 Session 3 is opportunistic and can interleave between sub-cluster sessions later.
- **P-50 Condition Pathology card — small `main`-branch standalone session.** NOT recommended as the next-session task — P-50 is ~10 min in-Claude + lives on `main` not `workflow-2-competition-scraping`. Could slot opportunistically.
- **P-43 mechanical prevention small fix.** **Increasingly justifiable** given ~11+ cwd-leak reproductions across recent sessions. NOT recommended as the immediate next session — opportunistic; defer to after Etsy sub-cluster deploys. Today's end-of-session §4 Step 1c picker offered P-43 as an alternative and director picked Etsy; P-43 stays competitive for the next-next picker.
- **P-26 below-fold scroll capture evaluation.** NOT recommended — LOW alternate; re-evaluate after Reviews Phase 2 closes.
- **P-27 Bug #9 + Bug #15 re-evaluation.** NOT recommended — likely obsolete after P-46.
- **W#2 graduation step.** NOT recommended UNTIL Reviews Phase 2 + P-48 stutter + P-43 + P-26 + P-27 all close.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above.

Check `ROADMAP.md` for the canonical state. Check `docs/REVIEWS_PHASE_2_DESIGN.md` for the canonical interview-locked spec + the §B 2026-05-26 + §B 2026-05-27 + §B 2026-05-28 + §B 2026-05-29 + §B 2026-05-30 build/deploy-session entries (the W2 Amazon arc + W4 cluster + W2 eBay arc quintet). Check `docs/CORRECTIONS_LOG.md` §Entry 2026-05-30 (today's closing entry) for the THREE NEW reusable Pattern memorializations ("Diagnostic-instrumentation FF as escape valve from speculative-FF antipattern" + "Tabpanel-scoped DOM walking via `[role=tabpanel]:not([hidden])`" + "JSON data-island extraction for server-rendered seller/product metadata") + 3 LOW informational sub-observations (P-43 cwd-leak Pattern Class reproductions running tally ~11+ + calibration 3/3 = 100% + §C.2 estimate compression).

---

## Personalized Handoff (parent Claude — copy into the director-facing summary)

**What we did this session (3-minute read):**

Today we shipped + deployed the **entire eBay sub-cluster of P-49 Workstream 2 end-to-end on vklf.com in a single calendar day** — what was originally planned as "~3-4 sessions for the full eBay arc" compressed into one calendar day via three converging Rule 14f picker outcomes and a 5-fix-forward cascade that converted speculative debugging into empirical-evidence-driven fixing.

**Start-of-session deploy-now picker** (the new Pattern from yesterday's W4 deploy firing for the FIRST TIME at start-of-session): you picked Recommended Deploy-now. Build commit `11e99e1` landed cleanly with the eBay per-platform module mirroring W2 Amazon Patterns. Then the cascade started — Phase 4 surfaced TWO co-occurring bugs (seller auto-detect failing because modern eBay listing pages don't render `/usr/<seller>` links in the visible DOM; This Item filter returning All Items rows because the feedback page renders both tabpanels server-side with the All Items panel `hidden`). Three speculative fix-forwards followed (FF#1+#2 bundled + FF#3) — both BUSTED.

**Mid-Phase-4 Rule 14f picker fired** — you picked Recommended Diagnostic instrumentation over Defer-to-next-session. **FF#4 shipped TEMPORARY diagnostic instrumentation** (HTML-dump via programmatic `<a download>` click + console.log selector probes); you uploaded 3 HTML files + console output. **Analysis of the dumped HTML files revealed BOTH root causes simultaneously.** **FF#5 — the WIN** (`extractSellerFromListingHtml` regex against the `"sellerUserName"` JSON data island + `[role=tabpanel]:not([hidden])` walker scope + remove FF#4 instrumentation + 8 new test cases). **Phase 4 PASS verdict on FF#5 = "Everything worked perfectly."**

**THREE NEW reusable Patterns memorialized that apply directly to next Etsy + Walmart sub-cluster sessions:** (a) "Diagnostic-instrumentation FF as escape valve from speculative-FF antipattern" — don't ship a 3rd speculative FF; (b) "Tabpanel-scoped DOM walking via `[role=tabpanel]:not([hidden])`" — generalizes beyond eBay to any tabbed-content scraping surface; (c) "JSON data-island extraction for server-rendered seller/product metadata" — `"sellerUserName":"<value>"` on eBay; likely similar shapes on Etsy + Walmart.

**eBay entire sub-cluster now ✅ DEPLOYED-AND-VERIFIED with no remaining scope** (§C.2 estimate "~3-4 sessions" compressed into "1 calendar day"; eBay Sessions 2 + 3 from §C.2 outline CLOSED).

**Final session calibration:** 3/3 = 100% Yes-to-Recommended; running cumulative 27/30 = 90% across recent 5 sessions. Framing well-calibrated.

**P-43 cwd-leak Pattern Class reproduced ~3 more times today** during deploy cycles. Running tally now ~11+ across recent sessions. **Strong empirical signal continues mounting** for the P-43 mechanical prevention small fix.

**Files now live in production on vklf.com:**

- `extensions/competition-scraping/src/lib/content-script/ebay-review-extractor.ts` — eBay per-platform module (~390 LOC build + ~176 LOC FF#5 refinements)
- `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — eBay dispatch added
- `extensions/competition-scraping/src/lib/content-script/scrape-trigger-modal.ts` — extended with optional eBay seller text input from FF#1

**Push status:**

- (1-5) 5 deploy pushes to `origin/main` (build deploy + FF#1+#2 bundled + FF#3 + FF#4 diagnostic + FF#5 fix) — all DONE.
- (6-10) 5 ping-pong pushes to `origin/workflow-2-competition-scraping` — all DONE.
- (11) Post-deploy doc-batch push to `origin/workflow-2-competition-scraping` — PENDING (about to fire).
- (12) Post-deploy doc-batch ff-merge + push to `origin/main` — PENDING (about to fire; operationally adjacent + does NOT re-invoke Rule 9 since post-deploy doc-batch carries no code changes; mirrors the 2026-05-29 + 2026-05-28 + 2026-05-27 same-day-deploy doc-batch pattern).
- Branch state at end-of-session: `workflow-2-competition-scraping` even with `origin/main` at the post-deploy doc-batch SHA.

**Deferred items at session end (Rule 26):** **ZERO.** No carry-overs at entry or end. The eBay sub-cluster is fully covered; the (a.99) RECOMMENDED-NEXT = Etsy Session 1 is the natural next step per §A.2 priority order.

**END-OF-SESSION INSTRUCTIONS for you (the director, offline between sessions):**

No specific offline steps required. The standing optional offline step (raise the Supabase Global File Size Limit) remains available any time — see "Pre-session notes" above for the steps. NOT blocking.

The eBay scraper is now live on vklf.com — you can right-click any saved eBay listing URL → "Scrape reviews for this URL" → the trigger modal opens (with optional seller text input as a manual paste fallback) → director picks the per-URL cap → the scraper runs across NEUTRAL → NEGATIVE feedback types + persists rows with `platform: 'ebay'` discriminator into the CapturedReview table. Reviews show up in the Captured Reviews section on the URL detail page with the counter-bar + bulk-delete + drag-reorder UI from yesterday's W4 deploy.

**NEXT-SESSION INSTRUCTIONS for the next Claude Code session (the easy path):**

When you start the next session in Codespaces, run `./resume` (or `./resume-workflow 2`) — that will switch you to `workflow-2-competition-scraping` and pre-load context. Then paste the launch prompt above (the "Launch prompt" section). The next Claude will produce a 3-sentence plain-terms summary of what it'll do (per Rule 30) before any code mechanics; once you give go-ahead, it'll execute Etsy Session 1 end-to-end. Expected ~1-2 hours in-Claude (matching today's eBay Session 1 pre-cascade build time). BUILD session — ZERO Rule 9 deploy gates planned by default. Schema-change-in-flight STAYS NO. (Note: if today's start-of-session deploy-now picker Pattern fires + you pick Deploy-now, the session can expand to ~3-6 hours including Phase 4 + any fix-forwards.)

**ESCAPE HATCH (if `./resume` doesn't work or you want a different task):**

If you'd rather pick a different next-session task, surface that at session start before any reads happen — the Rule 14f forced-picker mechanics will accommodate. The alternate candidates are listed in the "Alternate next-session candidates" section above; Etsy Session 1 is the canonical next step per §A.2 priority order, but if you want to jump ahead to W5 AI review analysis (which can now operate on real production data from both the Amazon + eBay deploys) or insert P-43 opportunistically given the ~11+ cwd-leak reproductions running tally, that's available.

**Offline between sessions:** None blocking. Optional Supabase file size limit raise remains available.

**Open questions / carry-overs:** None at session end. Today's session shipped + deployed the entire eBay sub-cluster under one calendar day via three converging Rule 14f picker outcomes (start-of-session deploy-now + mid-Phase-4 diagnostic-instrumentation + end-of-session §4 Step 1c next-task); eBay entire sub-cluster now ✅ DEPLOYED-AND-VERIFIED with no remaining scope; Etsy Session 1 is the natural next step per §A.2.

---
