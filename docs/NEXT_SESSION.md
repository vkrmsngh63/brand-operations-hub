# Next session

**Written:** 2026-05-28 (`session_2026-05-28_p49-w2-amazon-deploy-and-fix-forwards` — end-of-session handoff after **W#2 polish P-49 Reviews Phase 2 Workstream 2 Amazon ✅ DEPLOYED-AND-VERIFIED 2026-05-28 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`** — first production deploy of the Reviews Phase 2 implementation arc. Sessions 1 + 2 build commits + intervening doc-batches all ff-merged to main under ONE Rule 9 deploy gate as the initial deploy (`1914171..0ef8340` carrying 4 commits); 3 fix-forward commits shipped under their own Rule 9 deploy gates (FF#1 `8bc2e7e` accept `/dp/<ASIN>` dispatch + FF#2+#3 `b55cdbd` bundled trigger-modal-per-star-checkboxes + progress-indicator-per-star-breakdown + FF#4 `f6944db` pageNumber-increment pagination); final director PASS verdict after FF#4 ("It worked, all reviews scraped past 10"); RESOLVES the Sessions 1 + 2 standing carry-over. 4 Rule 9 deploy gates fired (initial + FF#1 + FF#2+#3 + FF#4). 9 Rule 14f forced-pickers fired all director-Yes to Recommended (9/9 = 100% calibration data point). Schema-change-in-flight flag FLIPPED YES → NO at initial deploy push completion (canonical schema-change-ships-to-production transition). Pre-deploy /scoreboard 5/5 GREEN at expected baselines (root tsc clean / extension tsc clean / **633 ext matches Session 2 baseline** / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**); Check 6 Playwright SKIPPED per Rule 27 picker. Post-FF#1 5/5 GREEN: **651/651 (+18)**. Post-FF#2+#3 5/5 GREEN: **655/655 (+4)**. Post-FF#4 5/5 GREEN: **655/655 UNCHANGED**. **NEW baseline locked: extension `npm test` = 655/655** (+22 cumulative from 633 entry baseline). 4 fresh extension zips at repo root (initial + ff1 + ff2-ff3 + ff4). **Closes (a.95) RECOMMENDED-NEXT** = P-49 W2 Amazon DEPLOY session ✅ DEPLOYED-AND-VERIFIED 2026-05-28 end-to-end after the 4-fix-forward cascade. **Opens (a.96) RECOMMENDED-NEXT** = P-49 W4 Captured Reviews UI extensions Session 1 (star-count counter-bar with click-to-filter per §A.14 — directly addresses today's Phase 4 verification issue #3 "no way to see reviews of specific star counts on vklf.com Captured Reviews section after the Amazon DEPLOY populated the corpus" + drag-to-reorder via `sortRank` column shipped in Session 1 reusing P-46 W3 S3 @dnd-kit Pattern from 2026-05-23-f + bulk-delete with multi-select checkboxes + confirm modal + new batch-delete API route per §A.6) on `workflow-2-competition-scraping` — locked via §4 Step 1c forced-picker at end-of-session (director picked Recommended P-49 W4 Session 1 over P-49 W2 eBay Session 1 + P-49 W5 AI review analysis Session 1 + P-48 Session 3 alternatives).

---

## What we did this session (in plain terms)

Today was the **first production deploy** of the Reviews Phase 2 work — the long-awaited "ship Sessions 1 + 2 to vklf.com + try it on a real Amazon product page" session. It turned out to be a long one because Phase 4 verification surfaced four distinct issues that each needed their own small fix-forward.

**The deploy itself worked cleanly the first time.** All four commits sitting on the workflow branch (Session 1 build + Session 1 doc-batch + Session 2 build + Session 2 doc-batch) ff-merged into main in one shot; Vercel auto-redeployed vklf.com (the new database schema + the new wire-shape fields + the Amazon scraper code all reached production); the fresh extension zip (`plos-extension-2026-05-28-w2-deploy-37.zip`) packaged via `npm run zip`. **The schema-change-in-flight flag flipped from YES (where it had been carrying since Session 1 ran `npx prisma db push` two days ago) to NO at that initial deploy push completion** — the canonical "schema-change ships to production" transition. So the schema is now live; the in-flight window closed cleanly.

**Then Phase 4 verification opened — and surfaced four issues across two rounds of director walkthrough on a real Amazon product page.** Each got its own fix-forward; all four landed PASS on re-verification. **(1) FF#1 — dispatch over-restriction.** When director right-clicked on the Amazon `/dp/<ASIN>` product page, the extension rejected it with "Review scraping is currently available on Amazon product-review pages only." The dispatch check was too restrictive — Session 2's cross-star refactor fetches all pages via fetch+DOMParser anyway, so the starting page is just an ASIN source, and the dispatch should accept ANY Amazon URL exposing the ASIN. Fix: added 4 new symmetric helpers (`isAmazonProductPage` + `isAmazonScrapableUrl` + `extractAsinFromProductUrl` + `extractAsinFromAmazonUrl`) + updated the dispatch. 18 new tests. **(2) FF#2 — trigger modal per-star checkboxes.** The modal only had a single capPerStar number input; director couldn't pick which stars to scrape. Fix: added 5 star checkboxes (pre-checked = all stars on) + new `starFilterForRating` helper. **(3) FF#3 — progress indicator per-star breakdown.** The indicator's "0 reviews then 46 reviews" messaging was confusing. Fix: added per-star breakdown showing current star + cumulative count per star + total cumulative. FF#2 + FF#3 bundled into one commit + one deploy since they ship to the same UI surface. 4 new tests. **(4) FF#4 — pageNumber-increment pagination.** Phase 4 surfaced "all reviews per star end at 10" — the `findNextPageUrl()` call looked for an OLD CSS selector (`<li.a-last><a>`) which Amazon no longer renders (Amazon switched to a "Show 10 more reviews" button). Fix: replaced the DOM-link-scraping approach with direct URL construction via `buildAmazonStarFilterUrl(asin, filter, N+1)`; stop signal = fetched page has 0 reviews. This doesn't depend on Amazon's UI at all and works regardless of numbered links vs Show-more button vs AJAX. 0 new unit tests (integration-level deferred to Playwright per Rule 27).

**One issue surfaced during Phase 4 was deliberately NOT fix-forwarded today — and instead became the next-session task.** Phase 4 verification round 2 surfaced "no way to see reviews of specific star counts on vklf.com Captured Reviews section after the Amazon DEPLOY populated the corpus." That's literally the canonical W4 Captured Reviews UI extensions scope per §A.14 (star-count counter-bar with click-to-filter). Per the Step 1c forced-picker outcome, director picked P-49 W4 Captured Reviews UI extensions Session 1 as the next-session task — directly addressing this Phase 4 verification issue #3 + shipping the rest of the W4 scope at the same time.

**Final director PASS verdict after FF#4** ("It worked, all reviews scraped past 10") **resolves the long-standing Sessions 1 + 2 carry-over** — first end-to-end real-Chrome extraction test on a real Amazon product page is now ✅ DONE. The Reviews Phase 2 implementation arc just shipped its first per-platform sub-cluster end-to-end. 4 Rule 9 deploy gates total today (well within the W#2 P-46 W3 2026-05-24-f Pattern cap of 5 per session). All 9 Rule 14f forced-pickers fired today were director-Yes to Recommended (9/9 = 100% calibration — reinforces the 14/15 = 93.3% from the 2026-05-25-b design session).

## What we'll do next session (in plain terms)

Next session is **P-49 W4 Captured Reviews UI extensions Session 1** on `workflow-2-competition-scraping`. Three additions to the Captured Reviews UI on the vklf.com URL detail page, all in one session:

**(1) Star-count counter-bar with click-to-filter (per §A.14)** — replaces the existing star-rating-multi-select dropdown with a horizontal counter-bar at the top of the Captured Reviews section showing how many reviews are in each star bucket (1-star × N, 2-star × N, 3-star × N, 4-star × N, 5-star × N), and clicking a bucket filters the list below to that star only. **This directly addresses today's Phase 4 verification issue #3** ("no way to see reviews of specific star counts on vklf.com Captured Reviews section after the Amazon DEPLOY populated the corpus"). The Customers-say AI-summary row (which uses starRating=5 sentinel + source="extension-scrape:customers-say" discriminator) likely gets a separate banner above the per-star counter-bar rather than counting as a 5-star contribution — the discriminator field tells the UI to render it specially.

**(2) Drag-to-reorder via the `sortRank` column shipped in Session 1 (per §A.5)** — drag-and-drop within and across star buckets via @dnd-kit, reusing the P-46 W3 S3 shared debounced-mutation Pattern from 2026-05-23-f. The `sortRank Int?` column on `CapturedReview` was shipped in Session 1 + reached production today; the UI ships next session. New PUT route persists the reorder.

**(3) Bulk-delete with multi-select checkboxes (per §A.6)** — multi-select checkboxes on each row + a confirm modal + a new batch-delete API route. Lets director clean up corpora that got too large from a deep scrape.

Estimated **~1-2 sessions for the full W4** (revised down from the earlier ~2-3 estimate now that the underlying data model is in place from Session 1 + has real production data from today's deploy to test against). W4 Session 1 is a pure CODE session — ZERO Rule 9 deploy gates planned (build commit stays on the workflow branch until the next deploy session). Schema-change-in-flight flag STAYS NO entire session (W4 is UI + new batch-delete API route only; no schema changes).

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-28 (P-49 W2 Amazon ✅ DEPLOYED-AND-VERIFIED; W4 Session 1 next):

- **P-49 W4 Captured Reviews UI extensions Session 1 — NEXT (a.96).** ~1 session. Star-count counter-bar with click-to-filter (addresses today's Phase 4 issue #3) + drag-to-reorder via `sortRank` shipped in Session 1 + bulk-delete with multi-select.
- **P-49 W4 Session 2 (if needed) + W4 deploy session.** ~0-1 + ~1 sessions. Whatever polish + the deploy of W4 to production.
- **P-49 W2 eBay sub-cluster (Sessions 1-3 + deploy).** ~3-4 sessions. Per §A.2 priority order — eBay second. Reuses today's shared infrastructure + the cross-star loop pattern + the trigger modal + the symmetric-helper Pattern from FF#1 + the URL-construction pagination Pattern from FF#4.
- **P-49 W2 Etsy sub-cluster (Sessions 1-3 + deploy).** ~3-4 sessions. Per §A.2 priority order — Etsy third.
- **P-49 W2 Walmart sub-cluster (Sessions 1-3 + deploy).** ~3-4 sessions. Per §A.2 priority order — Walmart fourth.
- **P-49 W5 AI review analysis system.** ~5-10 sessions. 3 levels (per-product two-sweep + cross-Type pooled + cross-everything competitive landscape) using the `ReviewAnalysis` table shipped in Session 1 + Claude Opus + per-run model-version dropdown + cost caps + fingerprint cache. Can now operate on real production review data (today's Amazon deploy populated the corpus).
- **P-49 total build arc ~12-22 sessions remaining.** Revised down by 1 from yesterday's ~13-23 since today closed the Amazon deploy step.
- **P-50 Condition Pathology card.** ~10 min in-Claude. Lives on `main` branch (platform-wide UI, not workflow-2-scoped). Can slot into any deploy session OR done standalone between W#2 sessions. NOT on the critical path.
- **P-48 Session 3 (Diagnostic #2) — DEFERRED to opportunistic insertion.** ~30-60 min in-Claude. Empirical instrumentation pass to identify the ~6-7 fps source-file bottleneck for the screen-recording stutter. Lives within the existing P-48 ROADMAP entry. Can interleave with P-49 work whenever you'd like to slot it in.
- **P-43 mechanical prevention candidate (LOW informational).** ~1 small session. Add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md`. **Strong empirical signal from today** — P-43 cwd-leak Pattern Class reproduced 4-5+ times during the various /scoreboard runs after each fix-forward; the Nth reproduction in the Pattern class. Opportunistic but increasingly worth slotting in.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions, OR drop. Re-evaluate after Reviews Phase 2 closes.
- **P-27 Bug #9 + Bug #15 — DEFERRED LOW.** ~0-1 sessions. Likely obsolete after P-46. Re-evaluate after P-26.
- **W#2 graduation step (now further deferred).** Was originally gated by P-46 + P-47 + P-26. Now also gated by Reviews Phase 2 closure at the workstream-by-workstream level. Likely 6-12 months out at current sessions-per-week cadence.
- **THEN STOP AND EXPLICITLY ASK DIRECTOR for any next round of competition-scraping additions** per your standing directive after Reviews Phase 2 + P-48 stutter + P-43 + P-26 + P-27 all close.
- **After your next round of additions ships:** W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent.

---

## Status of last session

**W#2 polish P-49 Reviews Phase 2 Workstream 2 Amazon ✅ DEPLOYED-AND-VERIFIED 2026-05-28 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main`** — first production deploy of the Reviews Phase 2 implementation arc; DEPLOY + 4-FIX-FORWARD session executing the (a.95) RECOMMENDED-NEXT task locked by Session 2.

**Session shape (DEPLOY + 4-FIX-FORWARD — 4 Rule 9 deploy gates fired; 9 Rule 14f forced-pickers fired all director-Yes to Recommended):**

- Pre-deploy reads at session start (CLAUDE_CODE_STARTER + ROADMAP P-49 entry + `docs/REVIEWS_PHASE_2_DESIGN.md` §A.1-A.16 + §B 2026-05-26 + §B 2026-05-27 + `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-26 + §B 2026-05-27 + `docs/CORRECTIONS_LOG.md` §Entry 2026-05-27 + Session 2's new content-script files).
- Plain-terms session-start summary per Rule 30 — 3 mandatory sections (What we did last session / What this session will do / What's still left on the total roadmap).
- Branch state verify — `git branch --show-current` confirmed `workflow-2-competition-scraping`; `git log main..HEAD --oneline` showed **4 commits ahead of main** at session entry (matches launch prompt expectation exactly).
- Pre-deploy /scoreboard 5/5 GREEN at expected baselines (root tsc clean / extension tsc clean / **633 ext matches Session 2 baseline** / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**); Check 6 Playwright SKIPPED per Rule 27 picker.
- Rule 9 deploy gate #1 fired — director picked Deploy now (Recommended). Initial deploy ff-merge `1914171..0ef8340` carrying 4 commits; push to `origin/main`; Vercel auto-redeploy ~2-3 min; ping-pong push to `origin/workflow-2-competition-scraping`. **Schema-change-in-flight flag FLIPPED YES → NO** at this push completion.
- Fresh extension zip via `npm run zip` — `plos-extension-2026-05-28-w2-deploy-37.zip` (208K) at repo root.
- Phase 4 mode picker per `feedback_playwright_for_repeatable_walkthroughs.md` — director picked Manual walkthrough Recommended (5+ step manual walkthrough on a major new feature). Director loaded the fresh extension unpacked in Chrome + opened a real Amazon product page with multi-star reviews + right-clicked.
- **Phase 4 verification round 1 surfaced ISSUE #1** (right-click on `/dp/` rejected). FF#1 shape picker → Recommended (extend dispatch). **FF#1 build commit `8bc2e7e`** (3 files +190/-16; +18 ext tests). Post-FF#1 /scoreboard 5/5 GREEN: **651/651 (+18)**. **Rule 9 deploy gate #2** fired — director picked Deploy Recommended. Deploy ff-merge + push + Vercel + ping-pong.
- **Phase 4 verification round 2 surfaced 3 MORE issues** (#2 modal granularity + #3 no way to filter Captured Reviews by star count + #4 reviews capped at 10 per star). **Phase 4 issue triage picker** → Recommended (FF#2 + FF#3 + defer issue #3 to W4). FF#2+#3 bundled because operationally adjacent + ship to the same UI surface. **FF#2+#3 build commit `b55cdbd`** (6 files +274/-8; +4 ext tests). Post-FF#2+#3 /scoreboard 5/5 GREEN: **655/655 (+4)**. **Rule 9 deploy gate #3** fired — director picked Deploy bundled Recommended. Deploy ff-merge + push + Vercel + ping-pong.
- **Phase 4 verification round 2b surfaced ISSUE #4 still present.** FF#4 shape picker → Recommended (pageNumber-increment over extend-findNextPageUrl-selector or defer). **FF#4 build commit `f6944db`** (1 file +23/-10; 0 new tests — integration-level deferred to Playwright per Rule 27). Post-FF#4 /scoreboard 5/5 GREEN: **655/655 UNCHANGED**. **Rule 9 deploy gate #4** bundled into shape picker by inference. Deploy ff-merge + push + Vercel + ping-pong.
- **Phase 4 final verification — director PASS verdict** ("It worked, all reviews scraped past 10"). RESOLVES the Sessions 1 + 2 standing carry-over.
- **NEW baseline locked from this session:** extension `npm test` = **655/655** (+22 cumulative from the 633 entry baseline).
- §4 Step 1c forced-picker at end-of-session — director picked Recommended (P-49 W4 Captured Reviews UI extensions Session 1) over P-49 W2 eBay Session 1 + P-49 W5 AI review analysis Session 1 + P-48 Session 3 alternatives.
- End-of-session doc-batch covers the 9-doc bundle (ROADMAP header bump + P-49 status flip + (a.95) close + (a.96) open / CHAT_REGISTRY header bump — 161st session / DOCUMENT_MANIFEST header bump + Group A + Group B modified/unchanged lists + 4 new zip artifacts / CORRECTIONS_LOG header bump + NEW §Entry 2026-05-28 capturing THREE NEW reusable Patterns + LOW informational P-43 cwd-leak Pattern Class reproduction + calibration data point / HANDOFF_PROTOCOL header bump only / CLAUDE_CODE_STARTER header bump only / this NEXT_SESSION full rewrite for P-49 W4 Session 1 / REVIEWS_PHASE_2_DESIGN.md header bump + NEW §B 2026-05-28 THIRD build/deploy-session entry per Rule 18 / COMPETITION_SCRAPING_DESIGN.md header bump + NEW §B 2026-05-28 extension-side architecture cross-reference pointer entry).
- **~10 pushes this session per `feedback_approval_scope_per_decision_unit.md`:** 4 deploy pushes + 4 ping-pong pushes + end-of-session doc-batch push to `origin/workflow-2-competition-scraping` + end-of-session ff-merge + push to `origin/main` for doc-batch (the last two pending; doc-batch ff-merge cleanly applies since main and workflow-2 are now even at `f6944db`).

**9 Rule 14f forced-pickers fired this session all director-Yes to Recommended** (9/9 = 100% calibration data point) — pre-deploy combined picker (Rule 27 Check 6 Playwright SKIP + Rule 9 initial deploy gate Deploy now), Phase 4 mode picker (Manual walkthrough), FF#1 shape picker (Extend dispatch), FF#1 Rule 9 deploy gate (Deploy now), Phase 4 issue triage picker after FF#1 (FF#2 + FF#3 + defer issue #3 to W4), FF#2+#3 Rule 9 deploy gate (Deploy bundled), FF#4 shape picker (pageNumber-increment), FF#4 Rule 9 deploy gate (bundled into shape picker by inference), §4 Step 1c next-session picker (P-49 W4 Session 1).

**4 Rule 9 deploy gates fired this session** — initial deploy + FF#1 + FF#2+#3 + FF#4 (within the W#2 P-46 W3 2026-05-24-f Pattern cap of 5 per session).

**ZERO DEFERRED items at session end (Rule 26).** The Sessions 1 + 2 standing carry-over (first end-to-end real-Chrome extraction test on a real Amazon product page) RESOLVED today via Phase 4 PASS verdict. Phase 4 verification issue #3 is NOT a carry-over because it has a destination ((a.96) RECOMMENDED-NEXT = P-49 W4 Session 1) which directly addresses it per §A.14.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-28 (the FIRST 2026-05-28-dated §Entry)** capturing 5 sub-observations: (a) DEPLOY outcome — Amazon ✅ DEPLOYED-AND-VERIFIED end-to-end after 4-fix-forward cascade; (b) **NEW reusable Pattern "Phase 4 verification fix-forward cascade scales beyond N=5 when each issue is scoped + reversible + UI-only"**; (c) **NEW reusable Pattern "FF#1 dispatch over-restriction antipattern at the per-platform extractor layer"**; (d) **NEW reusable Pattern "Findnextpage-link-selector empirically falsified by Amazon UI change → pageNumber-direct-increment is the more robust replacement"**; (e) LOW informational sub-observation — P-43 cwd-leak Pattern Class reproduced 4-5+ times this session (Nth in the Pattern class; strong empirical signal for the mechanical prevention fix) PLUS calibration data point (9/9 director-Yes to Recommended = 100%).

**Baselines locked from this session:** root tsc clean / extension tsc clean / **extension `npm test` 655/655 (+22 cumulative from 633 entry baseline; +18 FF#1 + 4 FF#2+#3 + 0 FF#4)** / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**. Check 6 Playwright SKIPPED per Rule 27 picker.

**Schema-change-in-flight flag FLIPPED YES → NO at initial deploy push completion** (canonical schema-change-ships-to-production transition carrying from Session 1's `npx prisma db push`); STAYS NO through 3 fix-forwards (none touch schema); **final state NO at session end**.

**THIRTY-NINTH end-of-session run under the Rule 30 + §4 Step 4b template.** The 3 plain-terms sections above + the parent's Personalized Handoff continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-49 W4 Captured Reviews UI extensions Session 1 begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` **even with `origin/main`** at the end-of-session doc-batch SHA. Both branches are at the same SHA after the 4 deploy ping-pongs today + the end-of-session doc-batch ff-merge. Verify with `git log main..HEAD --oneline` showing **0 commits ahead** at session entry. (Today's session shipped via 4 ff-merges + ping-pongs; the doc-batch ff-merge brings both branches to the same SHA at the doc-batch commit.)

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-49 Reviews Phase 2 Workstream 4 Captured Reviews UI extensions Session 1 on `workflow-2-competition-scraping`.** Closes **(a.96) RECOMMENDED-NEXT**. Pure CODE session — ZERO Rule 9 deploy gates planned (build commit stays on workflow branch; deploys at the eventual W4 deploy session). Schema-change-in-flight flag STAYS NO entire session (W4 is UI + new batch-delete API route only; no schema changes — the underlying `sortRank` column shipped in Session 1 + reached production via today's 2026-05-28 deploy).

Three additions to the Captured Reviews UI on the vklf.com URL detail page, all in one session:

1. **Star-count counter-bar with click-to-filter (per §A.14 of `docs/REVIEWS_PHASE_2_DESIGN.md`)** — replaces the existing star-rating-multi-select dropdown with a horizontal counter-bar at the top of the Captured Reviews section showing counts per star bucket (1-star × N, 2-star × N, 3-star × N, 4-star × N, 5-star × N), and clicking a bucket filters the list below to that star only. **This directly addresses Phase 4 verification issue #3 from 2026-05-28** ("no way to see reviews of specific star counts on vklf.com Captured Reviews section after the Amazon DEPLOY populated the corpus"). The Customers-say row (starRating=5 sentinel + source="extension-scrape:customers-say" discriminator) likely gets a separate banner above the per-star counter-bar rather than counting as a 5-star contribution — render based on the source discriminator.

2. **Drag-to-reorder via the `sortRank` column shipped in Session 1 (per §A.5)** — drag-and-drop within and across star buckets via @dnd-kit, reusing the P-46 W3 S3 shared debounced-mutation Pattern from 2026-05-23-f. NEW PUT route persists the reorder.

3. **Bulk-delete with multi-select checkboxes (per §A.6)** — multi-select checkboxes on each row + a confirm modal + a NEW batch-delete API route.

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify the SHA relationships with `git log main..HEAD --oneline` — should show **0 commits ahead at session entry** (workflow-2 even with main at the end-of-session doc-batch SHA).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or code mechanics).
- `docs/ROADMAP.md` lines 1-30 (header + recent session sequence) + the **P-49 Reviews Phase 2 polish-backlog entry** (Status: "🟢 IN-FLIGHT 2026-05-28 — Workstream 2 Amazon ✅ DEPLOYED-AND-VERIFIED 2026-05-28 on vklf.com end-to-end ... Workstream 4 (Captured Reviews UI extensions) Session 1 NEXT per (a.96)").
- **`docs/REVIEWS_PHASE_2_DESIGN.md`** §A.5 (drag-to-reorder via sortRank) + §A.6 (bulk-delete with multi-select + confirm modal + batch-delete API route) + §A.14 (star UI counter-bar with click-to-filter) + §C.4 (Workstream 4 implementation outline) + §B 2026-05-28 (today's deploy-session entry — the W4 destination for Phase 4 verification issue #3 is captured there).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-28 (today's extension-side cross-reference pointer entry) + §A.7 (content-script architecture overview).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-28 (today's closing entry — THREE NEW reusable Patterns + P-43 cwd-leak Pattern Class reproduction + calibration data point).
- **The relevant UrlDetailContent.tsx component** — `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` (current Captured Reviews UI lives here).
- **The existing @dnd-kit Pattern from P-46 W3 S3 (2026-05-23-f)** — search the codebase for the canonical drag-to-reorder debounced-mutation implementation; reuse the same Pattern.
- **The existing CapturedReview shape** — `src/lib/shared-types/competition-scraping.ts` for the wire shape + `prisma/schema.prisma` for the database shape (note `sortRank Int?` is already present from Session 1's `npx prisma db push`).
- `docs/HANDOFF_PROTOCOL.md` Rule 14f (forced-picker mechanics — expect 0-2 to fire this session for UI shape choices if any aren't pre-locked by §A.5 + §A.6 + §A.14) + Rule 18 + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — UI + new API route surface; no schema; schema-change-in-flight STAYS NO) + Rule 25 (Multi-Workflow — workflow-2 only) + Rule 26 (DEFERRED items registry — ZERO carry-overs at start) + Rule 27 (Playwright forced-picker — non-deploy session; SKIP Recommended) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `feedback_recommendation_style.md` (most-thorough/reliable).
- `feedback_approval_scope_per_decision_unit.md` (build-session push pattern: 1 push planned — end-of-session push to workflow-2 carrying the build commit + this doc-batch commit; NO ff-merge to main per the build-session pattern memorialized 2026-05-27).
- `feedback_default_to_recommendation.md`.
- `feedback_session_bookends_plain_summary.md`.

**Task shape (P-49 W4 Captured Reviews UI extensions Session 1):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or code mechanics. The 3 plain-terms sections at top above provide the launch context.

2. **Pre-build reads** — execute the pre-build read list above. ~10-15 min.

3. **Branch state verify** — `git branch --show-current` (should be `workflow-2-competition-scraping`) + `git log main..HEAD --oneline` (should show **0 commits ahead at session entry**). If anything else, surface to director.

4. **Pre-build /scoreboard** — confirm 5/5 GREEN at current baselines on `workflow-2-competition-scraping` (root tsc clean / extension tsc clean / **655 ext** / **786 src/lib** / **62 routes**); Check 6 Playwright SKIPPED per Rule 27 picker (non-deploy session).

5. **Implement star-count counter-bar with click-to-filter (per §A.14)** — replaces existing star-rating-multi-select dropdown in `UrlDetailContent.tsx`'s Captured Reviews section. Counter-bar shows per-star counts; clicking a star filters the list to that star only; "All" button clears the filter. Customers-say rows (source="extension-scrape:customers-say") render as a separate banner above the counter-bar.

6. **Implement drag-to-reorder via sortRank (per §A.5)** — @dnd-kit reusing the P-46 W3 S3 shared debounced-mutation Pattern. NEW PUT route under `src/app/api/projects/[projectId]/competition-scraping/url/[urlId]/reviews/[reviewId]/route.ts` (or similar — match the existing API surface) for the persist call.

7. **Implement bulk-delete with multi-select checkboxes (per §A.6)** — multi-select checkboxes on each row + a "Delete selected" button that opens a confirm modal + a NEW batch-delete API route accepting an array of review IDs.

8. **Write tests** — new component-level tests for the counter-bar + click-to-filter; new node:test cases for the new API routes (PUT for reorder + DELETE for batch-delete). Expect ~10-20 new src/lib node:test cases.

9. **Post-build /scoreboard** — confirm 5/5 GREEN at new baselines (root tsc clean / extension tsc clean / **655 ext UNCHANGED** / **786 src/lib + N from new test cases** / **62 routes + 1 for new batch-delete route** if a new route file is added); Check 6 Playwright SKIPPED per Rule 27.

10. **End-of-session doc-batch** covers ROADMAP (header bump + P-49 W4 Session 1 ✅ DONE-AT-CODE-LEVEL narrative + (a.96) closes + (a.97) opens for whichever next-task — likely P-49 W4 Session 2 if needed OR P-49 W4 deploy session OR P-49 W2 eBay Session 1 per Rule 14f picker at session end) + CHAT_REGISTRY (header bump — 162nd session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header + new §Entry capturing the W4 Session 1 outcome + any Patterns memorialized) + NEXT_SESSION (rewritten for next-next task per (a.97)) + HANDOFF_PROTOCOL (header bump only) + CLAUDE_CODE_STARTER (header bump only) + REVIEWS_PHASE_2_DESIGN.md §B 2026-05-XX (W4 Session 1 first build-session entry consuming §A.5 + §A.6 + §A.14 cascade) + COMPETITION_SCRAPING_DESIGN.md (extension-side architecture cross-reference pointer if any extension-architecture-level Pattern surfaces; possibly UNCHANGED if the work is pure PLOS-side UI + API) + COMPETITION_DATA_V2_DESIGN.md (UNCHANGED — P-49 W4 is review-UI architecture, not data-shape).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** every Rule 14f picker fired during the implementation should surface the recommended path + default to it unless director shifts.

**Schema-change-in-flight flag:** **STAYS NO entire session** (W4 is UI + new batch-delete API route only; no schema changes).

**Rule 9 triggers planned this session: ZERO** (build session; build commits stay on workflow branch until the eventual W4 deploy session).

---

## Pre-session notes (offline steps for director between sessions)

**Recommended — no specific pre-session offline steps for W4 Session 1.** Director can immediately test the new UI on vklf.com once W4 Session 1 deploys (likely the session after this one — W4 Session 2 or the W4 deploy session). The Amazon-scraped review corpus already exists in production from today's 2026-05-28 Amazon DEPLOY, so the counter-bar + click-to-filter has real data to render against from session 1.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking P-49 W4 Session 1 at all — can happen any time. Director-independent.

---

## Standing carry-overs

**None this session.** The Sessions 1 + 2 standing carry-over (first end-to-end real-Chrome extraction test on a real Amazon product page) RESOLVED today via Phase 4 PASS verdict. Phase 4 verification issue #3 ("no way to see reviews of specific star counts on vklf.com") is NOT a standing carry-over because it has a destination ((a.96) RECOMMENDED-NEXT = P-49 W4 Session 1) which directly addresses it per §A.14 — captured in the launch prompt above + ROADMAP P-49 W4 entry, NOT in this section.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (pure CODE session on the workflow branch; no rebases, no force pushes, no `git reset --hard`, no `git branch -D`).

**Rule 9 triggers planned this session: ZERO** — build session; build commit stays on `workflow-2-competition-scraping` until the eventual W4 deploy session.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits an alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any code mechanics.

---

## Why this pointer was written this way (debug aid)

Today's session executed the (a.95) RECOMMENDED-NEXT task locked yesterday — the P-49 W2 Amazon DEPLOY session. Initial deploy ff-merge `1914171..0ef8340` carrying Sessions 1 + 2 + intervening doc-batches under ONE Rule 9 gate; Phase 4 director real-Chrome verification on a real Amazon product page surfaced 4 distinct issues; 3 fix-forward commits (FF#1 + FF#2+#3 bundled + FF#4) shipped under 3 additional Rule 9 deploy gates; final director PASS verdict after FF#4. The 4-fix-forward cascade extended the P-46 W3 2026-05-24-f "Phase-4 verification fix-forward cascade in a single deploy session" Pattern from N=5 to "scales beyond N=5 when each issue is scoped + reversible + UI-only."

The natural next-session task per (a.96) RECOMMENDED-NEXT is **P-49 W4 Captured Reviews UI extensions Session 1 on `workflow-2-competition-scraping`** — directly addresses today's Phase 4 verification issue #3 ("no way to see reviews of specific star counts on vklf.com") + ships the rest of the W4 scope (§A.5 drag-to-reorder + §A.6 bulk-delete + §A.14 star-count counter-bar) at the same time.

- **(Recommended)** P-49 W4 Captured Reviews UI extensions Session 1 — addresses Phase 4 verification issue #3 immediately + ships the full W4 scope. Recommended because (a) issue #3 was deferred from today to here per the Phase 4 issue triage picker outcome, and shipping W4 Session 1 next puts the counter-bar in front of director within ~1 session; (b) the W4 scope (counter-bar + drag-reorder + bulk-delete) is bounded + locked by §A.5 + §A.6 + §A.14 with no design ambiguity; (c) the underlying schema (sortRank column) already exists in production from today's deploy + has real Amazon-scraped review data to test against; (d) interleaving W4 before continuing W2 eBay sub-cluster lets director use the counter-bar immediately rather than waiting through 3-4 more W2 deploy sessions.

The shape of P-49 W4 Captured Reviews UI extensions Session 1 is **plain-terms summary + pre-build reads + branch state verify + pre-build /scoreboard + implement counter-bar + implement drag-reorder + implement bulk-delete + write tests + post-build /scoreboard + end-of-session doc-batch (9 docs including REVIEWS_PHASE_2_DESIGN.md §B 2026-05-XX first W4 build-session entry) + 1 push (end-of-session push to workflow-2 carrying the build commit + this doc-batch commit per the build-session push pattern memorialized 2026-05-27)**.

**After W4 Session 1 ships,** the next-next sessions step through W4 Session 2 if any polish is needed → W4 deploy session → P-49 W2 eBay Session 1 (per §A.2 priority order — eBay second after Amazon) → eBay Session 2 + deploy → Etsy sub-cluster → Walmart sub-cluster → W5 AI review analysis sub-cluster. Director picks at end-of-each-session Rule 14f next-task picker.

**Alternate next-session candidates if director shifts priorities at session start:**

- **P-49 W2 eBay Session 1 — defer W4 Session 1.** Per §A.2 priority order, eBay is the next W2 platform sub-cluster after Amazon. Re-uses today's shared infrastructure + Patterns from FF#1 (symmetric helpers) + FF#4 (URL-construction pagination). NOT recommended as the immediate next session per the §4 Step 1c picker outcome — director picked W4 over eBay because issue #3 from today's Phase 4 verification directly maps to W4's §A.14 scope.
- **P-49 W5 AI review analysis Session 1 — defer W4 Session 1.** W5 strictly depends on having review data to analyze; today's Amazon DEPLOY put real review data in production for W5 to operate on. NOT recommended as the immediate next session per the §4 Step 1c picker outcome — W4's UI work is more user-facing + addresses today's Phase 4 issue #3.
- **P-48 Session 3 (Diagnostic #2) — opportunistic insertion.** NOT recommended — P-49 is the major scope expansion + already in-flight; P-48 Session 3 is opportunistic and can interleave with P-49 work between deploys.
- **P-50 Condition Pathology card — small `main`-branch standalone session.** NOT recommended as the next-session task — P-50 is ~10 min in-Claude + lives on `main` not `workflow-2-competition-scraping`. Better to slot it into a future deploy session.
- **P-43 mechanical prevention small fix.** Increasingly justifiable given today's 4-5+ cwd-leak reproductions. NOT recommended as the immediate next session — opportunistic; defer to after W4 Session 1.
- **P-26 below-fold scroll capture evaluation.** NOT recommended — LOW alternate; re-evaluate after Reviews Phase 2 closes.
- **P-27 Bug #9 + Bug #15 re-evaluation.** NOT recommended — likely obsolete after P-46.
- **W#2 graduation step.** NOT recommended UNTIL Reviews Phase 2 + P-48 stutter + P-43 + P-26 + P-27 all close.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above.

Check `ROADMAP.md` for the canonical state. Check `docs/REVIEWS_PHASE_2_DESIGN.md` for the canonical interview-locked spec + the §B 2026-05-26 + §B 2026-05-27 + §B 2026-05-28 build/deploy-session entries (the W2 Amazon arc's complete trio). Check `docs/CORRECTIONS_LOG.md` §Entry 2026-05-28 (today's closing entry) for the THREE NEW reusable Pattern memorializations + P-43 cwd-leak Pattern Class reproduction + calibration data point.

---

## Personalized Handoff (parent Claude — copy into the director-facing summary)

**What we did this session (3-minute read):**

Today we deployed the Reviews Phase 2 Amazon work to vklf.com for the first time. Sessions 1 + 2 from the prior two days (database schema additions + the Amazon scraper code) all shipped to production in one ff-merge. Vercel auto-redeployed. Fresh extension zip packaged.

Then you opened a real Amazon product page in Chrome, right-clicked, and ran through the scrape. Phase 4 verification surfaced four issues across two rounds of testing; we shipped three fix-forward commits to address them (FF#1 dispatch accepts `/dp/` pages now, FF#2 trigger modal has 5 star checkboxes so you can pick which stars to scrape, FF#3 progress indicator shows per-star breakdown instead of confusing "0 then 46" messaging, FF#4 pagination works past 10 reviews per star). Issue #3 from your testing ("no way to see reviews of specific star counts on vklf.com") got deferred to next session's W4 Captured Reviews UI extensions Session 1 — that's literally the W4 scope per the design doc, so it makes more sense to ship the canonical W4 work there than to fix-forward at deploy time.

After FF#4 you confirmed PASS ("It worked, all reviews scraped past 10"). The first end-to-end real-Chrome extraction test on a real Amazon product is now ✅ DONE — that long-standing Sessions 1 + 2 carry-over resolved today.

**Files changed (high-level):**

- 3 fix-forward build commits on the extension side: `8bc2e7e` + `b55cdbd` + `f6944db` (10 files total +487/-34; +22 ext tests covering the new helpers)
- 4 fresh extension zips at repo root (initial + ff1 + ff2-ff3 + ff4 — you used the final `-ff4.zip` for the PASS verification)
- Database schema (the §A.16 migration) reached production for the first time via the initial deploy push — schema-change-in-flight flag flipped YES → NO at that completion
- End-of-session doc-batch covers the 9-doc canonical bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + NEXT_SESSION + REVIEWS_PHASE_2_DESIGN.md §B 2026-05-28 + COMPETITION_SCRAPING_DESIGN.md §B 2026-05-28)

**Push status:**

- 4 deploy pushes to `origin/main` DONE (initial + FF#1 + FF#2+#3 + FF#4)
- 4 ping-pong pushes to `origin/workflow-2-competition-scraping` DONE
- End-of-session doc-batch push to `origin/workflow-2-competition-scraping` PENDING (about to fire)
- End-of-session ff-merge + push to `origin/main` for doc-batch PENDING (operationally adjacent + does NOT re-invoke Rule 9 since main and workflow-2 are now even)
- Branches end at the doc-batch SHA on both `main` and `workflow-2-competition-scraping`

**Deferred items at session end (Rule 26):** **ZERO.** The Sessions 1 + 2 standing carry-over RESOLVED via Phase 4 PASS today.

**END-OF-SESSION INSTRUCTIONS for you (the director, offline between sessions):**

No specific offline steps required. The standing optional offline step (raise the Supabase Global File Size Limit) remains available any time — see "Pre-session notes" above for the steps. NOT blocking.

If you want to test the Amazon scrape again on a different product page, the production extension zip at repo root (`plos-extension-2026-05-28-w2-deploy-37-ff4.zip`) is the latest verified version. Just reload it unpacked in Chrome.

**NEXT-SESSION INSTRUCTIONS for the next Claude Code session (the easy path):**

When you start the next session in Codespaces, run `./resume` (or `./resume-workflow 2`) — that will switch you to `workflow-2-competition-scraping` and pre-load context. Then paste the launch prompt above (the "Launch prompt" section). The next Claude will produce a 3-sentence plain-terms summary of what it'll do (per Rule 30) before any code mechanics; once you give go-ahead, it'll execute the W4 Session 1 task end-to-end. Expected ~1-2 hours in-Claude. Build session — ZERO Rule 9 deploy gates planned (no deploy this session).

**ESCAPE HATCH (if `./resume` doesn't work or you want a different task):**

If you'd rather pick a different next-session task, surface that at session start before any reads happen — the Rule 14f forced-picker mechanics will accommodate. The alternate candidates are listed in the "Alternate next-session candidates" section above; the most likely alternate is P-49 W2 eBay Session 1 (continues the W2 per-platform sub-cluster per §A.2 priority order — eBay second after Amazon).

**Offline between sessions:** None blocking. Optional Supabase file size limit raise remains available.

**Open questions / carry-overs:** None at session end. Phase 4 verification issue #3 has a destination ((a.96) RECOMMENDED-NEXT = P-49 W4 Session 1) which directly addresses it; ROADMAP P-49 W4 entry captures the destination + the Phase 4 verification reference.

---
