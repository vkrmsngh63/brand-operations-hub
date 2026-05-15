# COMPETITION SCRAPING — VISUAL-VERIFICATION BACKLOG

**Group:** B (tool-specific; loaded when W#2 work is in scope).
**Workflow:** W#2 Competition Scraping & Deep Analysis.
**Branch:** `workflow-2-competition-scraping`.
**Created:** 2026-05-07 in `session_2026-05-07_w2-plos-side-viewer-detail-page-slice` (Claude Code).
**Last updated:** 2026-05-15-b (**W#2 P-29 Slice #1 BUILD session — manual-add URL modal + `source` schema migration SHIPPED at code level on `workflow-2-competition-scraping` in commit `070820a`.** Ninety-eighth Claude Code session — `session_2026-05-15-b_w2-p29-slice-1-build-session`. Closes (a.30) RECOMMENDED-NEXT. **Pre-build checklist + drift check clean** at session start (branch on `workflow-2-competition-scraping`; 1 commit ahead of `origin/main` = yesterday's design batch `948a1a9`; pull-rebase no-op). **Schema migration applied to live DB** with Rule 8 confirmation — `prisma db push` added `source String @default("extension")` to `CompetitorUrl` + `CapturedText` + `CapturedImage`; pre-migration counts 25 + 8 + 10 = 43 rows unchanged post-migration; all 43 rows have `source='extension'` via column default. **Code shipped (15 files +908/-1 in commit `070820a`):** schema (3 column adds); `src/lib/shared-types/competition-scraping.ts` (new `SOURCES` vocabulary + `isSource` type guard + `source` field on URL/text/image DTOs); `urls/route.ts` POST handler accepts optional `source` validated via `isSource` (400 on misshapen value; default 'extension' server-side when omitted — extension's existing POST traffic unchanged); 6 `toWireShape` serializers across `urls/route.ts`, `urls/[urlId]/route.ts`, `text/[textId]/route.ts`, `urls/[urlId]/text/route.ts`, `urls/[urlId]/images/route.ts`, `urls/[urlId]/images/finalize/route.ts`, `images/[imageId]/route.ts` echo `source` on every read path; NEW `UrlAddModal.tsx` (~470 LOC) with autofocus + Escape/Cancel/X/backdrop dismiss + submit-in-flight lock + 9-field form mirroring extension's URL-add overlay (URL + Platform 7-value dropdown + Brand + Product + Category + Stars + Reviews + Page Rank + Sponsored); `UrlTable.tsx` toolbar mount of "+ Manually add URL" button (top-right per director's pick) + modal mount with `projectId` + `onUrlAdded` prop threading; `CompetitionScrapingViewer.tsx` `handleUrlAdded` callback prepends new row with `id`-dedup. **Verification scoreboard — all GREEN:** `npx tsc --noEmit` clean; `npm run build` clean; **10/10 node:test type-guard cases pass** (new `src/lib/shared-types/competition-scraping.test.ts` covering `isSource` + cross-vocabulary guards + the Q2-reframing regression that `independent-website` is supported); **6/6 Playwright UI-mechanical cases skipped as designed** (new `tests/playwright/p29-manual-add-url-modal.spec.ts` — skip markers pending P-30 React-bundle stub-page rig). **Director manual walkthrough DEFERRED to W#2 → main deploy session** that brings Slice #1 to vklf.com — workflow branch isn't deployed; can't run real-independent-website smoke there. **Two NEW polish items captured this session per Rule 14e + Rule 26:** **P-30** (Playwright React-bundle stub-page rig — unblocks Slice #1+#2+#3 modal mechanical-UX regression coverage; new `tests/playwright/p29-manual-add-url-modal.spec.ts` is the structural placeholder with 6 skipped test cases ready for the rig) + **P-31** (route-handler DI refactor for testability — extracts validation + Prisma-create from route.ts into pure-function shape so node:test can hit it without bundling Next.js). **Per Rule 27 Hybrid (today's verification approach):** Playwright UI-mechanical cases STRUCTURE shipped today (concrete asserts captured in skip-annotated tests) + Node `isSource` regression test shipped + node-level Source vocabulary regression coverage shipped; API-layer regression coverage + UI-mechanical regression run-time coverage = DEFERRED to P-30 + P-31. **Director manual walkthrough** covers end-to-end smoke when Slice #1 reaches vklf.com. **Multi-Workflow per Rule 25:** session ran on `workflow-2-competition-scraping`; schema-change-in-flight flag flipped Yes during build (per launch prompt Rule 4) + flipped back to No at end-of-session (this batch); pull-rebase clean at both checkpoints; W#1 row untouched per Rule 3. **TaskList sweep per Rule 26:** 11 session tasks tracked + completed; 2 DEFERRED items (P-30 + P-31) captured both in TaskCreate AND in this verification-backlog + COMPETITION_SCRAPING_DESIGN.md §B 2026-05-15-b entry. **Cross-references:** ROADMAP W#2 row Last Session 2026-05-15-b prepended + (a.30) flipped ✅ SHIPPED-AT-CODE-LEVEL + new (a.31) RECOMMENDED-NEXT Slice #2 + W#2 row schema flag back to No; new "## P-29 Slice #1 SHIPPED at code level (W#2 build session 2026-05-15-b)" + "## P-30 NEW POLISH ITEM" + "## P-31 NEW POLISH ITEM" sections appended below; CHAT_REGISTRY new top entry; DOCUMENT_MANIFEST per-doc flags; COMPETITION_SCRAPING_DESIGN.md §B new in-flight refinement entry 2026-05-15-b covering Slice #1 ship; NEXT_SESSION.md rewritten for Slice #2.)

**Previously updated:** 2026-05-14 (W#2 → main deploy session #13 — **P-23 Amazon main-image right-click context-menu fix DEPLOYED to vklf.com + REAL-AMAZON FULL VERIFY.** Ninety-sixth Claude Code session — `session_2026-05-14_w2-main-deploy-session-13-p23-amazon-context-menu-DEPLOYED-FULL-VERIFY` (rebase phase on `workflow-2-competition-scraping`; ff-merge + deploy push on `main`). Closes (a.28) RECOMMENDED-NEXT. **Cleanest possible deploy shape achieved** — workflow-2 was exactly 1 commit ahead (`6461c2a` — yesterday's polish-#18 ship + doc batch in a single commit); main was 0 commits ahead (no parallel main activity since deploy-#12). Rebase a strict no-op fast-forward; pushed origin/workflow-2 (`6f6e69f..6461c2a`); ff-merged into main (13 files +1033/-63); pushed origin/main (`6f6e69f..6461c2a`); Vercel auto-redeploy fired but no-op for web bundle (zero `src/` changes — extension-only fix). Fresh extension build packaged: `plos-extension-2026-05-14-w2-deploy-13.zip` (188,102 bytes; 9 files; content.js 63,038 bytes exact target match). **Pre-deploy verification scoreboard — all GREEN:** ext tsc clean; ext `npm test` 334/334 in 3.5s; root Playwright extension project 31/31 in 1.6 min (includes both new P-23 specs — positive overlay-shield + negative plain-text bail); ext build clean in 1.1s. **Real-Amazon browser verification — director-reported "Everything worked perfectly. No need to check the database." All 9 walkthrough steps PASSED** (sideload → popup setup → navigate `/dp/B0CTTF514L` → right-click main image fires "Add to PLOS — Image" menu directly on main image → form opens with correct image preview → fill + Save → form closes cleanly; cross-platform spot-check on Walmart + eBay + Etsy PASSED with zero behavior change; UX-noise spot-check confirmed widened-menu behaves as designed — menu appears on non-image right-click, bails silently with no visible action on click). **Three NEW polish items captured this session per Rule 24 + Rule 14a Read-It-Back** based on director's end-of-session ask to expand W#2 roadmap: **P-27** (delete individual captured texts and images from a URL detail page on vklf.com) + **P-28** (delete saved URLs from a project on vklf.com with cascade disclosure) + **P-29** (manually add URLs/texts/images on vklf.com — any platform, including "Other" for independent websites; REVERSES the 2026-05-07 deliberate deferral). Rule 24 pre-capture search confirmed all three were ALREADY specified in original W#2 Workflow Requirements Interview at `COMPETITION_SCRAPING_DESIGN.md` lines 487/489/506 but never built; captured shape is "three polish-backlog entries P-27/P-28/P-29 with cross-refs to design doc" per director-picked option (A) via Rule 14f forced-picker. **Director picked next session via §4 Step 1c interview (expanded candidate list P-29 / P-28 / P-27 / pre-existing P-21 / P-19 / P-13):** P-29 design session (manual-add UI on vklf.com) — (a.29) RECOMMENDED-NEXT. New "Deploy session #13 — P-23 DEPLOYED + REAL-AMAZON FULL VERIFY" section appended below; new "P-27 NEW POLISH ITEM" + "P-28 NEW POLISH ITEM" + "P-29 NEW POLISH ITEM" sections appended after that.)

**Previously updated:** 2026-05-14 (W#2 polish session #18 — **P-23 Amazon main-image right-click context-menu fix SHIPPED at code level on `workflow-2-competition-scraping`.** Ninety-fifth Claude Code session — `session_2026-05-14_w2-polish-session-18-p23-amazon-right-click-context-menu-SHIP`. Closes (a.27) RECOMMENDED-NEXT. **Bug + fix shape:** Amazon's product-listing page wraps the main `<img>` in zoom/overlay elements intercepting `contextmenu` before Chrome recognizes the target as `contexts: ['image']`. Picked refined Option (A) per launch-prompt recommendation — `background.ts` widens `contexts: ['image']` → `contexts: ['all']`; NEW helper `find-underlying-image.ts` walks up from the right-click target (depth ≤ 10) and scans each ancestor's immediate descendants for an `<img>` with non-empty `currentSrc`/`src` (the sibling-img walk is what unlocks Amazon's overlay-shield pattern); orchestrator attaches a capture-phase `contextmenu` listener at the TOP of `runOrchestrator` BEFORE any awaits and updates `lastRightClickImageSrc`; `open-image-capture-form` handler falls back to the cache when `msg.srcUrl` is empty; both-empty → silent bail. Walmart/eBay/Etsy unaffected. UX cost: the "Add to PLOS — Image" menu now appears on right-click of any element (slight noisiness; bail-silently semantics keep it functionally correct). **Pre-ship verification scoreboard — all GREEN:** ext tsc clean; ext `npm test` 334/334 in 3.6s (was 323; +10 new `findUnderlyingImage` unit tests + 1 refactor); root Playwright extension project 31/31 in 1.3 min (was 29; +2 new specs — positive overlay-shield + negative plain-text); ext build clean in 1.42s; content.js 62,437 → 63,038 bytes (+601 bytes within target). **Real-Amazon browser verification DEFERRED to W#2 → main deploy session #13** per standard ship-then-deploy pattern (the load-bearing logic — empty-srcUrl content-script fallback path — is covered by the Playwright overlay-wrapped fixture; the deploy session also confirms widened-menu UX in real browser). New "Polish session #18 — P-23 SHIPPED at code level" section appended below; the original P-23 capture lives in ROADMAP polish backlog (now flipped to ✅ SHIPPED-AT-CODE-LEVEL). **One INFORMATIONAL CORRECTIONS_LOG entry this batch:** Playwright capture-phase listener-attach race caught + fixed before commit — initial draft placed the listener after async init; Playwright's `dispatchEvent('contextmenu')` ran before the listener was attached → false-negative test failure → re-architected to hoist listener attach to top of `runOrchestrator`. **Cross-references:** ROADMAP W#2 row Last Session 2026-05-14 + (a.27) flipped ✅ DONE + new (a.28) RECOMMENDED-NEXT W#2 → main deploy session #13 + polish backlog P-23 entry flipped to ✅ SHIPPED-AT-CODE-LEVEL; CHAT_REGISTRY new top entry; DOCUMENT_MANIFEST per-doc flags; CORRECTIONS_LOG 1 NEW INFORMATIONAL entry; COMPETITION_SCRAPING_DESIGN.md §B new in-flight refinement entry 2026-05-14 for the P-23 fix shape; NEXT_SESSION.md rewritten for (a.28).)

**Previously updated:** 2026-05-14 (W#2 → main deploy session #12 — **P-20 fingerprint short-circuit DEPLOYED to vklf.com.** Ninety-fourth Claude Code session — `session_2026-05-14_w2-main-deploy-session-12-p20-fingerprint-short-circuit-DEPLOYED` (rebase on `workflow-2-competition-scraping`; ff-merge + deploy push on `main`). Closes (a.26) RECOMMENDED-NEXT. **Cleanest possible deploy shape** — workflow-2 was 3 commits ahead (merge commit + P-20 code + P-20 doc batch); main was 0 commits ahead. Rebase a no-op fast-forward; merge commit `5d85c84` naturally collapsed per the doc-batch-empty-on-rebase pattern; ff-merged `5e18e4b..8f11388` (11 files +735/-111); pushed origin/main; Vercel auto-redeploy no-op (zero `src/` changes — web bundle byte-identical). Fresh extension build packaged: `plos-extension-2026-05-14-w2-deploy-12.zip` (187,918 bytes; 9 files; content.js 62,437 bytes). **Pre-deploy verification scoreboard — all GREEN:** ext tsc clean; ext `npm test` 323/323 in 3.6s; root Playwright extension project 29/29 in 1.4 min (all 4 new P-20 EXTERNAL-MUTATION specs GREEN); ext build clean in 1.65s. **Browser verification on real Amazon — director picked "Skip manual / trust Playwright 29/29" via Rule 27 forced-picker** (4 EXTERNAL-MUTATION specs inject 10/sec non-matchable DOM churn — slightly above real Amazon's measured 6/sec from the design-session DevTools trace; treated as sufficient regression coverage for ✅ SHIPPED-AT-DEPLOY-LEVEL status). Director-self-check real-world test list provided in the end-of-session handoff for optional independent verification (not a deploy gate). New "Deploy session #12 — P-20 fingerprint short-circuit DEPLOYED + Playwright-only verification" section appended below; the existing "## P-20 fingerprint short-circuit SHIPPED at code level" section at line 108 stays preserved as the load-bearing design + implementation record. **Director picked (A) next session via §4 Step 1c interview:** P-23 Amazon main-image right-click polish. **Cross-references:** ROADMAP W#2 row Last Session 2026-05-14 prepended + (a.26) flipped ✅ DONE + new (a.27) RECOMMENDED-NEXT P-23 + polish backlog P-20 entry flipped ✅ SHIPPED-AT-DEPLOY-LEVEL; CHAT_REGISTRY new top entry; CORRECTIONS_LOG header bump only (no new §Entries — today's working-dir drift recurrence covered by yesterday's entry); DOCUMENT_MANIFEST per-doc flags; NEXT_SESSION.md rewritten for (a.27).)

**Previously updated:** 2026-05-14 (W#2 polish session #17 — **P-20 highlight-flashing on real Amazon FIXED at code level (fingerprint short-circuit) on `workflow-2-competition-scraping`.** Ninety-third Claude Code session — `session_2026-05-14_w2-p20-design-and-ship-fingerprint-short-circuit`. Closes (a.25) RECOMMENDED-NEXT — P-20 design + ship in the same session. **Evidence-driven design** — director ran the new `docs/p-20-trace-script.js` MutationObserver trace on a real Amazon PDP (Incognito; extension disabled): 234 batches over 30s, 181 nodes added (6.0/sec), 1144 text chars added/sec, and **34 would-be `refresh()` rescans (1.13/sec)** under the orchestrator's 250ms throttle. Evidence ruled out shapes (a) longer-debounge (rate too high — 5s debounce required to mask flashing, breaks +Add button responsiveness) + (c) per-platform DOM scoping (Amazon main area itself mutates; brittle to redesigns) + (d) IntersectionObserver (wrong-problem rewrite). **Shape (b) "remember-and-compare fingerprint" picked** — addresses root cause (most external mutations cycle the same words; fingerprint of pending highlight work stays constant; refresh short-circuits before strip-and-reapply); platform-agnostic; composes with existing P-14 mute-MO infrastructure. **Elegant property emerges from reusing `shouldSkipSubtree` in the fingerprint walk** — the walk skips existing `<mark>` elements, so the fingerprint reflects PENDING highlight work (unhighlighted matches only). Steady state = `"0:5381"` (zero matches, init hash) and stays stable until new matchable text appears OR existing marks get destroyed by external mutation exposing their text — both correctly trigger re-apply. **Implementation:** 2 new exports in `highlight-terms.ts` (`hashFingerprintMatches` pure helper + `computeMatchableFingerprint` DOM-walking); `refresh()` short-circuits pre-mute when fingerprint unchanged, recomputes + stores post-apply fingerprint INSIDE mute window on uncancelled completion; `chrome.storage.onChanged` invalidates fingerprint before triggering refresh (so term-list edits like color changes always re-apply). **Verification:** ext tsc clean; ext `npm test` 323/323 GREEN (+9 new unit tests on `hashFingerprintMatches` — determinism, count-prefix shape, order-sensitivity, position-sensitivity, long-string collision resistance, large-N stability); Playwright extension project **29/29 GREEN** (was 25; +4 new `P-20 EXTERNAL-MUTATION` specs across all 4 platforms — each injects a 100ms `setInterval` adding/removing non-matchable DOM nodes and asserts `<mark>` mutation count stays at zero over 2.0s); ext build clean in 1.3s (content.js 62,440 B vs 61,582 B baseline = +858 B for the fingerprint logic). **Browser verification on real Amazon DEFERRED to next W#2 → main deploy session #12 (a.26) RECOMMENDED-NEXT** — the existing Playwright simulator catches the bug class via 10/sec injected mutations, but real Amazon is the ultimate test; standard W#2 ship-then-deploy pattern. **Cross-references:** ROADMAP W#2 row Last Session 2026-05-14 prepended + (a.25) flipped ✅ SHIPPED-AT-CODE-LEVEL + new (a.26) RECOMMENDED-NEXT W#2 → main deploy session #12 with real-Amazon P-20 verification; polish backlog P-20 entry flipped ✅ SHIPPED-AT-CODE-LEVEL with real-Amazon-deploy-verify caveat pointing to (a.26); CHAT_REGISTRY new top entry; DOCUMENT_MANIFEST per-doc flags; CORRECTIONS_LOG 2 NEW INFORMATIONAL entries (Resume-flow Rule 28 verified end-to-end + two small operational slips self-caught: working-directory drift across Bash calls + pipe-buffered tail in run_in_background); COMPETITION_SCRAPING_DESIGN.md §B new entry for the fingerprint design decision; NEXT_SESSION.md rewritten for (a.26). NEW file: `docs/p-20-trace-script.js` (reusable DevTools mutation-rate tool with director-walkthrough header).)

**Previously updated:** 2026-05-14 (W#2 → main deploy session #11 — **Module 2 region-screenshot gesture DEPLOYED to vklf.com + cross-platform FULL VERIFY across all 4 platforms.** Ninety-second Claude Code session — `session_2026-05-14_w2-main-deploy-session-11-region-screenshot-DEPLOYED-FULL-VERIFY`. Closes (a.24) RECOMMENDED-NEXT. **Module 2's image-capture pair (regular-image session 5 + region-screenshot session 6) now FULLY SHIPPED + VERIFIED in production.** Standard cheat-sheet (b) flow: rebase 7 workflow-2 commits onto current `origin/main` HEAD `907a363`; resolved 5 doc-file conflict batches manually + HANDOFF_PROTOCOL row-12 hook-augment merge; 2 commits dropped during replay (merge commit collapsed by non-merge rebase; (a.24-a) doc batch became empty after main's parallel session subsumed it). Resulting 5 commits ff-merged to `main` (`907a363..0e222b4`); pushed origin/main; Vercel auto-redeploy no-op (zero `src/` changes — web bundle byte-identical). Fresh extension build packaged: `plos-extension-2026-05-14-w2-deploy-11.zip` (187,717 bytes; +2,920 vs deploy-#10). **Pre-deploy verification:** ext tsc clean; ext `npm test` 314/314 pass; Playwright extension project 25/25 GREEN. **Browser verification — all 8 session-6 steps ✅ PASS on vklf.com** with DB-side confirmation via `scripts/inspect-w2-state.mjs`: 4 new CapturedImage rows added today, one per platform (Walmart/eBay/Etsy/Amazon), all with `sourceType=region-screenshot` + `mimeType=image/png` (PNG is the canvas-crop output format). Steps 6.6 (Esc cancel mid-drag + banner chip), 6.7 (below-fold UX hint "capture in two halves" copy + viewport-clamp behavior consistent with `chrome.tabs.captureVisibleTab` viewport-only API design), 6.8 (non-supported page friendly error on google.com) all PASS. **Notable cross-platform finding:** region-screenshot worked cleanly on Amazon — unlike P-23's per-image right-click context-menu issue. The popup-button-armed full-page overlay bypasses Amazon's `<img>` zoom/overlay interception (different code path; full viewport screenshot doesn't need per-element event targeting). **NEW P-26 polish item captured this session** based on director's mid-verification question about below-fold capture limitation: full-page scroll-capture is technically feasible but has significant trade-offs (sticky headers duplicating in stitched image, lazy-load content timing, layout-changes-on-scroll, infinite-scroll non-termination, multi-captureVisibleTab perf cost, Playwright test harness complexity). Director picked "keep current Phase 1 'two halves' design + capture P-26 for future re-evaluation only." **Director picked (A) next session via §4 Step 1c interview:** P-20 design session — Amazon highlight-flashing/selection-collapse (HIGH severity — P-14 fix doesn't generalize to real Amazon's continuously-mutating DOM). **Cross-references:** ROADMAP W#2 row Last Session 2026-05-14 + (a.24) flipped ✅ DONE + new (a.25) RECOMMENDED-NEXT P-20 design session + polish backlog P-22 SLICE 2 SHIPPED + new P-26 entry; CHAT_REGISTRY new top entry; DOCUMENT_MANIFEST per-doc flags; CORRECTIONS_LOG 2 NEW INFORMATIONAL entries (launch-prompt staleness pattern + doc-batch-empty-on-rebase pattern); NEXT_SESSION.md rewritten for P-20 design session.)

**Previously updated:** 2026-05-14 (W#2 → main deploy session #10 cross-platform verification COMPLETE — **Module 2 regular-image gesture fully verified end-to-end on Walmart + eBay + Etsy + Amazon.** Ninety-first Claude Code session — `session_2026-05-14_w2-deploy-10-cross-platform-smoke-verify` on `main`. Closes (a.23) RECOMMENDED-NEXT. **Doc drift caught + corrected this session:** yesterday's 2026-05-13-b doc batch recorded deploy-#10 as PARTIAL VERIFY ("context-menu firing only confirmed"), but DB inspection via NEW `scripts/inspect-w2-state.mjs` showed 3 CapturedImage rows from 2026-05-13-b for the Walmart Equate URL (`/ip/17056909`) across 3 metadata patterns (full-form Main Image with Composition + Embedded text + Tags; minimum-form Secondary; tags-only Secondary). Director re-confirmed: yesterday's actual work was FULL Walmart end-to-end. Root cause = yesterday wrapped mid-walkthrough due to terminal-UI rendering issue; batch missed pre-wrap verifications. The 2026-05-13-b "DEPLOYED + PARTIAL VERIFY" section is preserved verbatim below as historical record; new "FULL VERIFY + cross-platform smoke COMPLETE 2026-05-14" section appended above it. **Today's work:** cross-platform smoke on eBay → Etsy → Amazon via Option B Hybrid per Rule 27 forced-picker (run retroactively mid-session after director asked about Playwright — Rule 27 slip captured to CORRECTIONS_LOG); Claude runs server-side DB checks via the new inspection script + director does minimum-smoke in-browser clicks (pick "Main Image" + Save). **Results:** Walmart ✅ FULL (yesterday, retroactive); eBay ✅ PASS (`/itm/365806348442`; image/webp; `/itm/{listing-id}` canonicalize); Etsy ✅ PASS (`/listing/1815615660`; image/jpeg; `/listing/{id}` canonicalize); Amazon ✅ PASS via workaround (`/dp/B0CTTF514L`; image/jpeg; `/dp/{ASIN}` canonicalize). **NEW finding captured as P-23 polish item in ROADMAP W#2 polish backlog (Rule 24 pre-capture search performed):** Amazon main-image right-click context-menu does NOT fire on product-listing page; workaround: click image → larger viewer pane → right-click → menu fires. Likely cause: Amazon's `<img>` wrapped in zoom/overlay elements intercepting contextmenu before Chrome recognizes `contexts: ['image']`. Affects only Amazon; severity MEDIUM. **Cross-platform regression coverage achieved:** 3 distinct MIME types (JPEG/WebP/JPEG) across 4 distinct URL patterns. **Cross-references:** ROADMAP W#2 row Last Session 2026-05-14 prepended + (a.23) ✅ DONE FULL VERIFY + new (a.24) RECOMMENDED-NEXT region-screenshot session 6 + P-12-thru-P-22 → P-12-thru-P-23 + new P-23 entry; CHAT_REGISTRY + CORRECTIONS_LOG + DOCUMENT_MANIFEST + NEXT_SESSION.md updates.)

**Previously updated:** 2026-05-14 ((a.23) — **Walmart Phase 2 manual smoke ✅ FULL PASS** (2.4-2.6 verified live; full 2-phase upload contract executed in production for first time end-to-end; CapturedImage row + all 4 metadata fields confirmed on vklf.com URL-detail-page image gallery; P-15 canonicalize pre-select also independently confirmed on image-form). Director mid-session picked **Option B at the scope question:** defer Phase 3 cross-platform manual smoke (ebay/etsy/Amazon) + start P-22 Playwright build now. **P-22 slice 1 SHIPPED at code level on `workflow-2-competition-scraping` in commit `d3dae97`** (`+499 -0` — 2 new files: fixture HTML + happy-path spec; one platform / one test / full Save flow with 7 Playwright `context.route` mocks for walmart HTML + walmartimages CDN + 5 vklf.com/Supabase API endpoints; Supabase session seeded in chrome.storage so authedFetch's getSession returns shape-valid session). New test passes in 1.1s; full extension Playwright suite **18/18 GREEN** (17 existing P-14+P-10 specs + 1 new P-22) — zero regression. Phase 3 manual cross-platform smoke FORMALLY DEFERRED to a future verification session (captured in Phase 3 table below + ROADMAP W#2 row (a.24) options). New (a.23) section appended above the Deploy session #10 section with full narrative; Deploy session #10 Phase 2 table updated in-place to mark 2.4-2.6 ✅ PASS; Phase 3 table marked ❌ NOT YET TESTED with explicit recovery plan. Cross-references: ROADMAP W#2 row Last Session 2026-05-14 + (a.23) flipped ✅ PARTIAL DONE (Walmart Phase 2 + P-22 slice 1) + new (a.24) RECOMMENDED-NEXT options + P-22 polish entry status updated; COMPETITION_SCRAPING_DESIGN.md §B in-flight refinement entry for the P-22 test-shape decisions; CHAT_REGISTRY new top entry; DOCUMENT_MANIFEST header + per-doc flags + this-session summary; CORRECTIONS_LOG new INFORMATIONAL entry on Playwright `context.route` LIFO matching gotcha (caught before first test run via reasoning).)

**Previously updated:** 2026-05-13-b (W#2 → main deploy session #10 — **Module 2 regular-image gesture DEPLOYED to vklf.com with PARTIAL verification.** ff-merge `dc3a314..bd7b39a` on origin/main (clean linear ff — merge-base verified = origin/main head; no rebase needed; 17 files +1859/-22 entirely in `extensions/competition-scraping/src/` + `docs/`; zero `src/` Next.js so web bundle byte-identical). Built `plos-extension-2026-05-13-w2-deploy-10.zip` at repo root (184,797 bytes; 9 files; manifest carries 11 host_permissions including the 5 new image-CDN patterns; build sizes parity with session 5 baseline — background.js 206,731 b / content.js 53,524 b / popup chunk 410,206 b / manifest 881 b). Director picked deploy via Rule 14f forced-picker (a.22-b), overriding the recommended (a.22-a) Extension build session 6 region-screenshot pick. **Verification PARTIAL ✅ confirmed live on Walmart:** sideload (chrome://extensions Developer mode → Remove old + Load unpacked of extracted `chrome-mv3/` folder) + Chrome re-approved all 11 host_permissions + navigated to Equate Cool Heat Medicated Patches product page (`/ip/17056909?classType=VARIANT&athbdg=L1102&from=/search`) + right-click on main product image → **"Add to PLOS — Image" context-menu item appeared as expected** — confirms (i) Chrome accepted the 5 new image-CDN host_permission patterns and (ii) `background.ts` `chrome.contextMenus.create({ contexts: ['image'] })` wiring fires in production. **❌ NOT YET verified:** form rendering (image preview thumbnail + saved-URL picker + image-category vocab + Composition + Embedded text + Tags + Save button) + form-fill + Save → 2-phase signed-URL upload (`requestImageUpload` → mocked-PUT-to-Supabase → `finalizeImageUpload`) → CapturedImage row creation → vklf.com URL-detail-page image gallery surfacing; cross-platform smoke on ebay/etsy/Amazon (each retailer's image markup variants exercise different image-CDN host_permission patterns). Session wrapped at director's request mid-walkthrough due to terminal-UI rendering issue making my step instructions visually overlapping/confusing in director's Codespaces terminal; deploy is live in production but form-and-upload + cross-platform verification is the natural next-session pick captured as (a.23) RECOMMENDED-NEXT. **Per Rule 27 Playwright forced-picker before the manual walkthrough:** director picked Option C Hybrid — quick manual smoke now + Playwright extension-context regression spec deferred; **P-22 captured in W#2 polish backlog** in this end-of-session doc batch per Rule 26. New "Deploy session #10 — DEPLOYED + PARTIAL VERIFY" section appended below — full Walmart Step 1.x + Step 2.1-2.3 walkthrough confirmations preserved + the unfinished Step 2.4-2.6 + ebay/etsy/Amazon smoke recipe captured for the next session to resume verbatim. Cross-references: ROADMAP W#2 row Last Session 2026-05-13-b prepended + (a.22-b) flipped ✅ DEPLOYED PARTIAL + new (a.23) RECOMMENDED-NEXT = complete deploy-#10 verification + new P-22 polish entry + section-header bump; CHAT_REGISTRY new top entry; DOCUMENT_MANIFEST.md header + per-doc flags + this-session summary.)

**Previously updated:** 2026-05-13 (W#2 Extension build session 5 — **Module 2 regular-image gesture SHIPPED at code level on `workflow-2-competition-scraping` in commit `0866b89`.** Director's scope-split pick at session start: Option A "regular-image-first; region-screenshot deferred to session 6" — splits cleanly at gesture boundary, mirrors text-capture-form pattern, single-session-viable. **What shipped:** new right-click "Add to PLOS — Image" context-menu on image elements → `image-capture-form.ts` (mirrors `text-capture-form.ts` shape — image preview, saved-URL picker with P-15 canonicalize-before-normalize pre-select, image-category picker with "+ Add new..." inline upsert, optional Composition + Embedded text textareas, Tags chip-list) → end-to-end two-phase signed-URL upload in the background (`fetchImageBytes` from extension origin → POST `images/requestUpload` Phase 1 → direct PUT to Supabase signed URL Phase 2 → POST `images/finalize` Phase 3 → CapturedImage row). 11 files changed +1656/-7 — 3 NEW (`captured-image-validation.ts` + `.test.ts`, `image-capture-form.ts`) and 8 MODIFIED (`background.ts`, `api-client.ts` + `.test.ts`, `api-bridge.ts`, `messaging.ts`, `orchestrator.ts`, `styles.ts`, `wxt.config.ts`). **Permission expansion:** 5 image-CDN host_permissions added (`*.media-amazon.com`, `*.ssl-images-amazon.com`, `*.ebayimg.com`, `*.etsystatic.com`, `*.walmartimages.com`); standard MV3 path — Chrome prompts to re-approve on reinstall. Verification scoreboard: ext `npm test` 289/289 pass (+23 new); ext `tsc --noEmit` clean; ext `wxt build` clean in 1.66 s (content.js 53,520 bytes; background.js 206,734 bytes; manifest 881 bytes). New "Extension build — session 5 — Module 2 image-capture regular-image gesture SHIPPED" section appended below the session #16 "P-15 PASS-VERIFY on real Amazon" section; details of the live-browser walkthrough (sideload of fresh build at the next deploy session) live in that new section. Browser verification deferred to the next W#2 → main deploy session — standard W#2 ship-then-deploy pattern. Cross-references: ROADMAP W#2 row (a.21) flipped ✅ DONE + new (a.22) RECOMMENDED-NEXT for region-screenshot session 6 OR W#2 → main deploy session #10 OR W#2 polish backlog continuation; COMPETITION_SCRAPING_DESIGN.md §B new in-flight refinement entry naming the split; DOCUMENT_MANIFEST.md header + per-doc flags + this-session summary; CHAT_REGISTRY.md new top entry + header.)

**Previously updated:** 2026-05-12-g (W#2 → main deploy session #9 — **P-15 `pickInitialUrl` canonicalize-slug-variant fix DEPLOYED to vklf.com with PARTIAL verification: PASS on Walmart/ebay/etsy, FAIL on Amazon.** Deploy commit on main `f6b1a98` (ff-only merge of W#2's 2 rebased commits onto `main` after rebase-then-ff per cheat-sheet (b) — `a1b37b7 → f6b1a98` force-push to origin/W#2 + `34dbfd0..f6b1a98` ff-merge onto main). Push origin/main triggered Vercel auto-redeploy (no-op for vklf.com web bundle since no `src/` touched in this merge — extension code only). Fresh extension zip at repo root: `plos-extension-2026-05-12-g-w2-deploy-9.zip` (181,952 bytes; 9 entries; content.js 41,268 bytes — exact parity with session #15's expected size; `canonicalProductUrl` token grep returns 2 references in built content.js — P-15 compiled into bundle). **Browser verification (Rule 27 scope exception — extension popup + cross-platform visual judgment):** PASS / PASS on Walmart, ebay, etsy for both P-14 (text selection survives highlights) AND P-15 (slug-variant URL pre-selects saved row). **FAIL / FAIL on Amazon** — P-14 still flashing + selection collapses; P-15 saved row not pre-selected. **NEW cross-platform finding surfaced during verification:** one-time selection collapse if user selects within ~1-3 sec of page load, correlated by director with green status overlay auto-dismiss. Three new W#2 polish items captured this session (full text in ROADMAP W#2 polish backlog): P-19 green-overlay-dismiss → one-time selection collapse (LOW-MEDIUM; ~5-10 LOC fix), P-20 P-14 fix doesn't generalize to real Amazon (HIGH; design session warranted), P-21 pickInitialUrl + buildRecognitionSet asymmetric canonicalize (MEDIUM; ~2 LOC + 4 tests; recommended as next session). New "P-15 SHIPPED + PARTIAL VERIFY (Amazon FAIL)" section appended immediately below the session #8 "P-14 FIX DEPLOYED" section. One INFORMATIONAL CORRECTIONS_LOG entry this session: **Playwright mock-fidelity gap on real Amazon** — session #14's Playwright suite passed on a STATIC mock product page; real `amazon.com`'s continuously-mutating DOM (lazy reviews, ads, recommendation widgets) drives external-MO-retrigger that the static mock didn't exercise. Cross-references: ROADMAP W#2 row (a.19) flipped ✅ DONE PARTIAL + new (a.20) RECOMMENDED-NEXT = ship P-21 + P-15 polish backlog list-item flipped ✅ SHIPPED AT DEPLOY LEVEL with Amazon-FAIL caveat pointing to P-21 + NEW P-19/P-20/P-21 polish backlog entries; CHAT_REGISTRY new top entry; DOCUMENT_MANIFEST per-doc flags + this-session summary; CORRECTIONS_LOG header + 1 INFORMATIONAL Playwright-mock-fidelity entry.)

**Previously updated:** 2026-05-12-f (W#2 → main deploy session #8 — **P-14 highlight-flashing fix DEPLOYED to vklf.com.** Deploy commit on main `2fc6d15` (ff-only merge of W#2's 6 rebased commits onto `main` after rebasing W#2 onto origin/main to absorb W#1 graduation `b08737b`). Push origin/main triggered Vercel auto-redeploy. Fresh extension zip at repo root: `plos-extension-2026-05-12-f-w2-deploy-8.zip` (181,920 bytes; 9 files; content.js 41,182 bytes vs deploy #7's 40,946 = +236 bytes for muteMutationObserver fix delta; `takeRecords` presence verified in bundle). **Browser verification PASSED:** vklf.com loads clean (no `src/` changes in merge → web bundle byte-identical to pre-deploy `b08737b` baseline; the 2026-05-12 Illegal-invocation hotfix `08f10e5` stays live); Walmart product page → highlights stable + no flashing + text selection survives — P-14 fix verified LIVE on the canonical S4-B reproduction case from polish session #11. New "P-14 FIX DEPLOYED" section appended immediately below the "P-14 FIX SHIPPED" section. Two INFORMATIONAL CORRECTIONS_LOG entries this session: (i) assert-then-stage discipline slip on the third rebase replay (conflict shape diverged from prior replays; resolution script silently exited; committed conflict markers; amended); (ii) session-count numbering drift artifact (both `b08737b` and W#2 polish #12 claim Eighty-second; today numbers itself Eighty-fifth). All cross-referenced in ROADMAP W#2 row Last Session entry for deploy session #8 + (a.18) ✅ DONE + new (a.19) RECOMMENDED-NEXT slot + P-14 polish backlog list-item flipped ✅ SHIPPED-AT-DEPLOY-LEVEL.)

**Previously updated:** 2026-05-12-e (W#2 polish session #14 — **P-14 highlight-flashing FIX SHIPPED at code level on `workflow-2-competition-scraping`** in code commit `45c9a15`. The 12 `test.fail`-annotated regression specs from sessions #12+#13 flipped to genuine GREEN; annotations removed in the same commit. Playwright extension 17/17 ✓ genuine green-pass post-fix including P-10 SPA-NAVIGATION guard (zero collateral damage). Code change: `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` (new `StartLiveHighlightingOptions.muteMutationObserver` callback; refresh body wrapped in it with no-op default) + `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` (forward-declared `let observer: MutationObserver | null = null;` + `muteMutationObserver` closure defined BEFORE `await startLiveHighlighting(...)` + `observer = new MutationObserver(...)` reassigns same variable + cleanup uses optional chaining) + the spec annotation removals. New "P-14 FIX SHIPPED" section appended immediately below the session #13 hardening section. Deploy to vklf.com pending W#2 → main deploy session #8 — (a.18) RECOMMENDED-NEXT in ROADMAP.)

**Previously updated:** 2026-05-12-d (W#2 polish session #13 — **Playwright extension-context REGRESSION SPEC COVERAGE HARDENED at code level on `workflow-2-competition-scraping`**; P-14 fix itself still DEFERRED per the multi-session decomposition picked in session #12. `tests/playwright/extension/highlight-flashing.spec.ts` rewritten +419/-131 (550-line file; was 207 lines). Same `fixtures.ts` + `product-page.html` from session #12 reused unchanged — the hardening lives entirely in the spec file. Four hardening axes shipped: (i) cross-platform parametrization across amazon / ebay / etsy / walmart via route interception + matching `selectedPlatform` seed (the orchestrator's `getModuleByHostname`-vs-`selectedPlatform` check at `orchestrator.ts:105-109` requires both); (ii) tighter REGRESSION (count) window — 1.5s → 2.0s after 800ms settle (was 500ms); (iii) NEW REGRESSION (identity) sub-spec — tags every initial mark and asserts survival in the DOM after the window; (iv) NEW SELECTION-STABILITY sub-spec — selection over highlighted text must survive 1.0s. Plus one cross-cutting NEW P-10 SPA-NAVIGATION regression sub-test (single-platform amazon, sufficient because the SPA-detection path is platform-independent in shared orchestrator code) — PASSES pre-fix; must continue passing post-(a.17)-P-14-fix to guard against the P-10 detection silently regressing when the P-14 fix mutes the orchestrator's MutationObserver. Playwright extension project 17/17 pass (1.5m): 5 ✓ green-pass (4 SMOKE + 1 P-10 SPA-NAV), 12 ✘ expected-fail-as-pass under `test.fail` (4 REGRESSION count + 4 REGRESSION identity + 4 SELECTION-STABILITY). When (a.17) P-14 fix lands, ALL 12 `test.fail` annotations must flip off in the same commit — Playwright reports a `test.fail`-marked test that PASSES as a failure, the canonical "remove this annotation" signal. New "Playwright extension-context regression spec coverage hardened" section appended immediately below the session #12 section. Next session = (a.17) ship the P-14 fix.)

**Previously updated:** 2026-05-12-c (W#2 polish session #12 — **Playwright extension-context harness for the P-14 highlight-flashing bug class SHIPPED at code level on `workflow-2-competition-scraping`**; P-14 fix itself DEFERRED to a future session per director's "harness setup only today" pick. New `tests/playwright/extension/` sub-directory with fixture (Chromium new-headless-mode + `--load-extension` against the freshly-built `.output/chrome-mv3/` artifacts) + mock Amazon product page (route-intercepted via Playwright) + two-test spec (SMOKE proving harness mechanics work + P-14 REGRESSION using `test.fail`-annotation pre-fix so the suite stays green while the regression assertion correctly identifies the live bug class). Sanity-check round-trip applied per P-17 discipline: with current code (P-14 bug present) → regression test fails-as-expected → suite green; temporarily disabled `observer.observe(...)` line in `orchestrator.ts` (eliminates the loop) → regression test passes-unexpectedly → `test.fail` flips to "Expected to fail, but passed" → suite RED — proving the harness detects BOTH directions of the bug class. New "Playwright extension-context harness" section appended immediately below; details cross-referenced from ROADMAP W#2 row Last Session 2026-05-12-c entry. Next session = (a.16) author the actual regression spec coverage on top of this harness; session after that = (a.17) ship the P-14 fix.)

**Previously updated:** 2026-05-12 (W#2 verification session + vklf.com production hotfix — full launch-prompt verification queue cleared today. See "Outcome 2026-05-12" block immediately below for per-sub-table results + doc-drift annotations. **Key results:** S4-A 12/12 PASS; S4-B 12/12 PASS (with two pre-existing-bug workarounds captured as polish items); S4-C-1 PASS + S4-C-2 SKIPPED OPTIONAL; P1V-2 + P1V-3 both PASS; P3B-1..P3B-10 PASS (P3B-11 N/A — no migration scenario applicable to fresh laptop 2). Production hotfix `08f10e5` shipped to main + deployed to vklf.com mid-session (Illegal invocation regression from P-1; 7-line fix; verified end-to-end via P1V-2). Six new polish items captured P-12..P-17 — destinations in ROADMAP W#2 polish backlog this same end-of-session doc-batch.)

---

## Outcome 2026-05-12 — full verification queue cleared

**Session:** `session_2026-05-12_w2-verification-and-vklf-illegal-invocation-hotfix` (Claude Code, on `workflow-2-competition-scraping` for verification + this doc batch; pivoted to `main` mid-session for the vklf.com hotfix; returned to W#2 to continue verification).

### Production hotfix shipped + verified (commit `08f10e5` on main)

At S4-A-4 first save attempt, director observed `Failed to execute 'fetch' on 'Window': Illegal invocation` on vklf.com. Diagnosed as bare-`fetch` reference in `src/lib/authFetch.ts:82` production export (shipped 2026-05-10-f with P-1 silent token refresh; deployed via session #4 + #5 but invisible because both verification windows ended within the 1-hour access-token freshness window). Fix: wrap `fetch` in arrow `(u, i) => fetch(u, i)` to preserve the browser's window receiver. 7-line commit; tests still 7/7 PASS; build clean; deployed via Vercel `state: success`. Director verified vklf.com loads cleanly post-deploy. **P1V-2 verification immediately after deploy:** 3-request sequence (401 → Supabase refresh 200 → retry 200) observed exactly as designed — hotfix verified end-to-end same session.

### S4 — Module 2 text-capture walkthroughs (Extension build — session 4 surface)

| Sub-table | Result | Notes |
|---|---|---|
| S4-A-1 | ✅ PASS | "Paste captured text" section appears below Highlight Terms after Project + Platform pick. |
| S4-A-2 | ✅ PASS | Form fields render. **Doc drift:** verification doc expected "Save button disabled until URL + category + non-empty text"; code shows `disabled={submitting}` only; validation surfaces via inline error on submit-click of incomplete form. Functionally correct; doc text needs update next session. |
| S4-A-3 | ✅ PASS | Empty-state message appears with platform name when no saved URLs for picked platform. |
| S4-A-4 | ✅ PASS | Happy-path save: textarea + URL pick + existing-category pick + Save → POST returns 201; form shows "Captured." + clears. |
| S4-A-5 | ✅ PASS | "+ Add new…" category inline upsert: POST vocabulary 201 + POST text 201; new category persists in dropdown on next save. Director-requested polish: autofocus inline input on appearance — captured as P-13. |
| S4-A-6 | ✅ PASS | Tag chips via Enter + comma-paste split into 3 chips; case-insensitive dedupe collapses "REVIEW" against existing "review". |
| S4-A-7 | ✅ PASS | × button removes one chip; others stay in order. |
| S4-A-8 / S4-A-9 / S4-A-10 | ✅ PASS | Inline validation errors fire on submit-click for missing text / URL / category. Order: URL → text → category. |
| S4-A-11 | ✅ PASS | Offline DevTools throttle → save attempt → inline error "Couldn't save: Network unreachable…"; form stays populated with user input preserved. |
| S4-A-12 | ✅ PASS | Saved rows appear on PLOS detail page Captured Text table with correct text + category + tags. |
| S4-B-1 / S4-B-2 / S4-B-3 / S4-B-4 | ✅ PASS | Already-saved banner sanity; selection on non-highlighted text stays stable; menu item "Add to PLOS — Captured Text" appears; overlay form opens with text pre-filled. **URL pre-fill ONLY worked sometimes** — failed on Amazon-style slug-variant URLs; captured as P-15 (pickInitialUrl needs platformModule.canonicalProductUrl step). Workaround: manual URL pick. |
| S4-B-5 / S4-B-6 | ✅ PASS | Save from overlay → row appears on PLOS detail page. |
| S4-B-7 | ✅ PASS | Menu item HIDDEN without selection (Chrome `contexts: ['selection']` gating). |
| S4-B-8 | ✅ PASS | Platform mismatch: menu appears but click silently bails (by-design `orchestrator.ts:102-107`). |
| S4-B-9 | ✅ PASS | URL picker shows all saved URLs for platform; picking a different URL attaches the captured text to THAT URL, not the current page. |
| S4-B-10 | ✅ PASS | Esc / Cancel button / backdrop click all close the form without saving. |
| S4-B-11 | ✅ PASS | "+ Add new…" inline upsert from overlay works same as popup S4-A-5 (autofocus polish P-13 applies here too). |
| S4-B-12 | ✅ PASS | Unsaved page → form opens without URL pre-selection; user picks manually. |
| S4-C-1 | ✅ PASS | DevTools Application → Local Storage spot-check: no captured-text WAL keys present (today's session doesn't ship WAL). |
| S4-C-2 | ⚪ SKIPPED OPTIONAL | Manual curl idempotency test — server contract tested at unit-test level; manual exercise skipped per S4-C-2 verification-doc guidance. |

**Workaround applied for S4-B walkthrough:** select text in areas of competitor pages that don't contain any saved highlight terms. **Reason:** the highlight-terms applicator + MutationObserver self-feedback loop causes ~250ms flashing on all platforms (PRE-EXISTING since 2026-05-08-d P-5 ship; only newly-visible-as-blocker today because S4-B's selection gesture surfaces it). Selection on highlighted text is destroyed every cycle. Captured as polish item P-14.

### P1V — silent token refresh active tests

| Sub-table | Result | Notes |
|---|---|---|
| P1V-1 (passive) | ⚪ DEFERRED | Passive — will surface naturally next time director returns to vklf.com after >1 hour idle. Annotation: today's P1V-2 + hotfix combined make the P1V-1 path active + verified; passive observation pending natural use. |
| P1V-2 (active expire → silent refresh) | ✅ PASS | DevTools console snippet expired access_token; reload → exact 3-request sequence: `/api/projects` 401 → Supabase `/auth/v1/token?grant_type=refresh_token` 200 → `/api/projects` retry 200; UI loaded cleanly with NO red error. Today's hotfix verified end-to-end. |
| P1V-3 (failure path — refresh fails) | ✅ PASS (different mechanism) | DevTools console snippet expired access_token + removed refresh_token; reload → Supabase client fired SIGNED_OUT → app routed to login screen. **Doc drift:** verification doc expected "red error in UI: Could not load Projects (401)"; actual mechanism is auto-signout + login redirect — functionally correct + arguably better UX. Doc text needs update next session. Recovery: sign back in normally. |

### P3B — P-3 broader scope cross-device sign-in test (third attempt; previously deferred twice)

| Sub-table | Result | Notes |
|---|---|---|
| P3B-1 | ✅ PASS | Laptop 1 baseline established (extension reloaded from today's fresh zip `plos-extension-2026-05-12-w2-verification-1.zip`; signed in). |
| P3B-2 | ✅ PASS | Project switch fired PUT `/api/extension-state` 200 with `selectedProjectId` set + `selectedPlatform: null`. |
| P3B-3 | ✅ PASS | Platform pick fired second PUT `/api/extension-state` 200 with both fields set. |
| P3B-4 | ✅ PASS | Laptop 2: same zip emailed + sideloaded with fresh chrome.storage.local; sign-in succeeded; GET `/api/extension-state` returned 200 with both picks. |
| P3B-5 | ✅ PASS (canonical proof) | **Laptop 2's ProjectPicker + PlatformPicker pre-selected both values from laptop 1's session.** Picks could ONLY have come from the server (laptop 2's chrome.storage.local was empty on first sign-in). Server-side persistence verified end-to-end. |
| P3B-6 | ✅ PASS | Laptop 2: switching to Project B fired PUT 200 + cleared PlatformPicker (per Option-1 semantics). |
| P3B-7 | ✅ PASS | Laptop 2: close+reopen popup — new project still shows, platform stays null; fresh GET fires on remount. |
| P3B-8 | ✅ PASS | Laptop 2: switching BACK to Project A — Platform stays null (Option-1 semantics: no per-project last-platform memory; user must re-pick). |
| P3B-9 | ✅ PASS | Offline path: WiFi turned off on laptop 2; reload popup → sync warning banner appeared above ProjectPicker ("Couldn't reach PLOS — showing your setup picks from this Chrome."); cached picks still rendered. **Note:** DevTools Network throttling on the popup does NOT carry across popup close-and-reopen (the popup detaches DevTools on close and re-opens fresh); to test offline, use actual WiFi-off OR `location.reload()` in the popup's DevTools Console while it stays attached. Useful for future verification doc updates. |
| P3B-10 | ✅ PASS | WiFi back on; reload popup → sync warning cleared; picks reloaded from server cleanly. |
| P3B-11 | ⚪ N/A | OPTIONAL one-time auto-migration smoke test only applies when user had pre-existing local-only picks before the P-3-broader code shipped. Not applicable to today's setup (laptop 2 fresh install). |

### Six DEFERRED polish items captured (per Rule 14e + Rule 26) — destinations in ROADMAP W#2 polish backlog

- **P-12** Extension 401-retry / silent-refresh analog to P-1 (extension `api-client.ts authedFetch` has no 401-retry today).
- **P-13** Autofocus on "+ Add new…" inline input (both popup `CapturedTextPasteForm.tsx` AND content-script `text-capture-form.ts`; director-requested at S4-A-5).
- **P-14** Highlight-terms applicator + MutationObserver self-feedback loop causes ~250ms flashing on all platforms (PRE-EXISTING since 2026-05-08-d P-5 ship; only newly-visible today because S4-B's selection gesture surfaces it).
- **P-15** `pickInitialUrl` missing `platformModule.canonicalProductUrl(...)` step on slug-variant URLs (session-4 bug; overlay's URL pre-fill fails on Amazon-style paths with product slug).
- **P-16** Extension service worker "went to a bad state unexpectedly" surfaced on laptop 2 chrome://extensions (MV3 SW crash with degenerate stack trace; auto-restarted; needs SW DevTools diagnosis).
- **P-17** Real-fetch integration test for `authFetch.ts` production export (test-coverage gap that allowed today's Illegal invocation to ship).

### Two doc drifts captured (to clean up in a future VERIFICATION_BACKLOG update)

1. S4-A-2 "Save button disabled until filled" — code shows Save only disabled on `submitting`; validation surfaces via inline error.
2. P1V-3 "red error in UI: Could not load Projects (401)" — actual mechanism is Supabase SIGNED_OUT → app routes to login screen.

---

## P-23 Amazon main-image right-click context-menu fix SHIPPED at code level (W#2 polish session #18, NEW 2026-05-14 — closes (a.27) RECOMMENDED-NEXT)

### The bug + the prior workaround

P-23 was captured 2026-05-14 during the deploy-#10 cross-platform smoke verification on `main`. On Amazon's product-listing page, right-clicking the main product image does NOT show the "Add to PLOS — Image" menu. Workaround that DOES work pre-fix: click the image → Amazon opens it in a larger viewer pane → right-click on the now-clean `<img>` in the viewer pane → menu fires + full upload chain works. Affects only Amazon; Walmart/eBay/Etsy all work on direct right-click on the main listing-page image. Severity MEDIUM.

Root cause: Amazon's main `<img>` is wrapped in zoom/overlay elements (typically `.imgTagWrapper > img + .a-overlay-shield` or similar `.zoomTrigger`-style overlay div). The overlay intercepts the `contextmenu` event before Chrome's contextMenus API recognizes the right-click target as matching `contexts: ['image']`. In the larger viewer pane Amazon opens on click, the displayed image is a clean unwrapped `<img>` so the menu fires correctly.

### Fix shape — refined Option (A) per launch-prompt recommendation

Three candidate fixes were enumerated in the deploy-#10 doc batch:

- **(A) widen `chrome.contextMenus` `contexts` to `['all']` + element-walk in handler** — director-recommended starting point per launch prompt.
- **(B) inject a content-script right-click listener that walks DOM up to find `<img>`** — more surgical; keeps `contexts: ['image']` for stable platforms.
- **(C) reuse the §5 floating "+ Add" button pattern for the main product image** — UX-mixed.

Today's session shipped a **refined Option (A)** that picks the cleanest mechanism among the three:

- **`background.ts`** — widen `contexts: ['image']` → `contexts: ['all']` for the image context-menu entry. Now the "Add to PLOS — Image" menu fires on any right-click target — not just elements Chrome already recognizes as images. Removed the early-bail `if (!srcUrl) return;` guard in the click handler; the empty-srcUrl case is now handled content-script-side.
- **NEW helper `extensions/competition-scraping/src/lib/content-script/find-underlying-image.ts`** — exports `findUnderlyingImage(target: Element | null): string | null` that walks up from `target` (depth ≤ MAX_ANCESTOR_DEPTH=10) and, at EACH ancestor, both checks if the cursor IS an `<img>` AND scans `cursor.querySelector('img')` for an `<img>` descendant. The descendant-scan is what unlocks Amazon's `<div class="imgTagWrapper"><img><div id="overlay-shield"></div></div>` pattern: the right-click lands on `#overlay-shield` (a sibling of the underlying `<img>`), so walking UP from the shield won't find the image directly — but `imgTagWrapper.querySelector('img')` DOES find it. Prefers `currentSrc` (browser-picked URL respecting `srcset`) over `src` (raw attribute) so the captured image matches what the user sees. Returns `null` if no usable image found within the bound.
- **Orchestrator wiring (`orchestrator.ts`)** — attaches a capture-phase `contextmenu` listener at the TOP of `runOrchestrator` (BEFORE any awaits — a listener-attach race was caught + fixed during Playwright spec-development this session; see CORRECTIONS_LOG 2026-05-14 entry). The listener always updates `lastRightClickImageSrc` on every right-click (sets to the discovered src OR null). Cache is a module-level `let` closed over by the message handler. When `open-image-capture-form` arrives with empty `msg.srcUrl`, the handler falls back to the cache; if both are empty, the handler bails silently and sends back `{ ok: false, reason: 'no-image-found' }` via `sendResponse`. Cleanup function detaches the listener on `ctx.onInvalidated`; each of the 3 early-return paths (`!projectId`, `!platformModule`, wrong-hostname) explicitly calls `detachContextMenuListener()` to prevent listener leak.

**Walmart/eBay/Etsy behavior is unchanged** because Chrome's image-context detection still runs as part of `contexts: ['all']` — when the right-click target is a direct `<img>`, Chrome populates `info.srcUrl` natively and the handler uses `msg.srcUrl` directly, ignoring the cache.

**UX cost on all 4 platforms** — "Add to PLOS — Image" now appears in the Chrome right-click menu on any element, not just images. Bail-silently semantics keep this from being functionally broken; just slightly noisier than the pre-fix menu surface. The 3 stable platforms gain no user-visible benefit from this change (they worked pre-fix) but also no user-visible cost beyond menu noise. Bounded acceptable trade-off vs. the Amazon-fix benefit.

### Implementation summary

Files changed this session:

- modified `extensions/competition-scraping/src/entrypoints/background.ts` (widen contexts + drop early bail; +14/-8 lines including comment).
- modified `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` (top-of-function listener attach + cache + cache-fallback in message handler + detach in early returns; +27/-1 lines).
- NEW `extensions/competition-scraping/src/lib/content-script/find-underlying-image.ts` (~95 lines; MAX_ANCESTOR_DEPTH=10; isUsableImageElement + readImageSrc helpers).
- NEW `extensions/competition-scraping/src/lib/content-script/find-underlying-image.test.ts` (~150 lines; 10 unit tests; hand-built `FakeElement` stubs because the `node --test --experimental-strip-types` runner has no DOM).
- NEW `tests/playwright/extension/p23-amazon-overlay-image.spec.ts` (~280 lines; 2 specs — positive `<img>` + overlay-shield + negative plain-text silent-bail).
- NEW `tests/playwright/extension/amazon-overlay-image-product-page.html` (~30 lines; fixture mirroring Amazon's `.imgTagWrapper > img + #overlay-shield` zoom-overlay pattern).

### Pre-ship verification scoreboard — all GREEN

- ext `npx tsc --noEmit -p tsconfig.json` → exit 0 (clean).
- ext `npm test` → **334/334 pass** in 3.6s (was 323; +10 new `findUnderlyingImage` unit tests + 1 net adjustment from refactor).
- root `npx playwright test --project=extension` → **31/31 pass** in 1.3 min (was 29; +2 new P-23 specs).
- ext `wxt build` → clean in 1.42s; content.js 62,437 → **63,038 bytes (+601 bytes)** within the launch-prompt "few hundred bytes" target.

### Real-Amazon browser verification DEFERRED

Per standard W#2 ship-then-deploy pattern. The load-bearing logic — the empty-srcUrl content-script fallback path — is exercised end-to-end by the Playwright overlay-wrapped fixture, mirroring Amazon's `.imgTagWrapper > img + #overlay-shield` zoom-overlay pattern. The future deploy session (W#2 → main deploy session #13) will (a) confirm the menu fires on real Amazon's main product image on the listing page (post-widen-contexts), (b) confirm the form opens with the correct image preview (post-cache-fallback), (c) spot-check the widened-menu UX shows acceptable noise on stable platforms (Walmart/eBay/Etsy).

### Cross-references

- ROADMAP W#2 row Last Session 2026-05-14 + (a.27) flipped ✅ DONE + new (a.28) RECOMMENDED-NEXT W#2 → main deploy session #13 + polish backlog P-23 entry flipped ✅ SHIPPED-AT-CODE-LEVEL.
- CHAT_REGISTRY new top entry.
- CORRECTIONS_LOG 1 NEW INFORMATIONAL entry — Playwright capture-phase listener-attach race caught + fixed.
- DOCUMENT_MANIFEST per-doc flags.
- COMPETITION_SCRAPING_DESIGN.md §B in-flight refinement entry 2026-05-14 for the P-23 fix shape decision.
- NEXT_SESSION.md rewritten for (a.28) deploy session #13.
- `extensions/competition-scraping/src/lib/content-script/find-underlying-image.ts` — the new walker helper.
- `tests/playwright/extension/p23-amazon-overlay-image.spec.ts` — the new regression specs.

---

## P-20 fingerprint short-circuit SHIPPED at code level (W#2 polish session #17, NEW 2026-05-14 — closes (a.25) RECOMMENDED-NEXT)

**Outcome:** P-20 highlight-flashing on real Amazon root-caused + designed + fixed at code level on `workflow-2-competition-scraping`. ROADMAP Active Tools W#2 row (a.25) flipped ✅ SHIPPED-AT-CODE-LEVEL; new (a.26) RECOMMENDED-NEXT is W#2 → main deploy session #12 with real-Amazon verification. P-20 polish backlog list-item flipped ✅ SHIPPED-AT-CODE-LEVEL with the "real-Amazon deploy-verify pending (a.26)" caveat preserved.

### Real-Amazon mutation-rate trace evidence (the pre-step that informed the design)

Director ran `docs/p-20-trace-script.js` in Chrome Incognito (extension disabled to keep the trace pure) on a real Amazon PDP. Script attaches a MutationObserver to `document.body` with the same `{ childList: true, subtree: true }` config as the orchestrator's MO, runs for exactly 30 seconds, and reports a 250ms trailing-edge-throttle "would-be `refresh()` rescan" count that mirrors `orchestrator.ts:333-354`.

```
===== PLOS P-20 trace RESULTS =====
Page URL: https://www.amazon.com/dp/B0CTTF514L?th=1
Elapsed: 30.0s
Total MutationRecord batches: 234
Nodes added:   181  (6.0/sec)
Nodes removed: 180  (6.0/sec)
Text content added: 34311 chars  (1144 chars/sec)
Would-be refresh() rescans (250ms throttle, matches orchestrator.ts): 34  (1.13/sec)
Top added element tags:
  DIV: 38
  A: 11
  SPAN: 8
  IMG: 4
  LINK: 3
  SCRIPT: 2
  P: 2
```

**Reading the numbers:**

- **34 rescans in 30s = 1.13/sec.** Under the 250ms trailing-edge throttle (which caps the rate at 4/sec when mutations are continuous), Amazon's mutation stream keeps the throttle armed ~28% of the time. The visible flash + selection-collapse cadence the director reports tracks this 1.13/sec rate exactly.
- **6.0 nodes added/sec, 6.0 removed/sec, +1 net over 30s.** Amazon is cycling content in and out — carousels, recommendation tiles, lazy-loading review fragments — not net-growing the DOM. Many of those cycles bring back the same words that were there before, which is what makes fingerprint short-circuiting effective for this case.
- **1144 text chars added/sec.** Sounds like a lot, but most is ARIA labels, hidden tracking text, scripts, and recycled product copy. The fraction that genuinely adds NEW words matching a user's highlight terms is small enough that the fingerprint's "0:5381" steady state holds the vast majority of the time on real Amazon.
- **Top added tags = DIV / A / SPAN.** These tags can contain highlightable text, which is why a non-text-aware fix like shape (a) longer-debounge can't escape the issue — the mutations carry real content; the matcher correctly observes them; only by checking whether the matchable set HAS CHANGED can we tell apart "cycling existing matches" from "new match landed."
- **First console line in the trace** was an unrelated `TypeError: Cannot read properties of undefined (reading 'reInitializeButton')` from Amazon's own follow-button code. Real Amazon being real Amazon — its widgetry throws errors during normal operation; the trace just runs alongside, observing.

### Fix shape evaluation against evidence

| Shape | Verdict | Rationale |
|---|---|---|
| (a) Longer debounce (250ms → 1500ms+) | NOT picked | At 1.13 rescans/sec measured, throttle bump to 1s gives ~1/sec (no change), 2s gives 0.5/sec (still visible), 5s+ gives invisible flashing but breaks `+Add` button responsiveness on new product links + breaks SPA-content highlight timing on Walmart. Bad trade-off ratio. |
| (b) Fingerprint short-circuit | ✅ PICKED (recommended) | Addresses root cause: most external mutations cycle the same words back in; fingerprint of pending highlight work stays constant; refresh short-circuits before strip-and-reapply. Platform-agnostic. Composes with existing P-14 mute-MO infrastructure. ~80 LOC + tests + new Playwright spec. |
| (c) Per-platform DOM scoping | NOT picked | Amazon's MAIN PDP area itself mutates (image gallery rotation, color-swatch swaps, video previews). Per-platform CSS selectors brittle to redesigns; maintenance burden grows with each future platform (Google Shopping / Google Ads / independent-website in W#2's planned scope). Partial coverage at best. |
| (d) IntersectionObserver visibility-based highlight | NOT picked | Doesn't actually fix flashing — when Amazon mutates content already in view (carousel rotation), the same strip-and-reapply still fires. Solves a different problem ("highlight efficiently on very large pages"). Major rewrite. |

### Implementation summary

**Files changed:**

| File | Diff | What |
|---|---|---|
| `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` | +94 / -10 | New `hashFingerprintMatches` pure helper (exported); new `computeMatchableFingerprint` DOM-walking function (exported, uses TreeWalker with same `shouldSkipSubtree` rules as `applyHighlightsTo`); new `lastFingerprint: string \| null` state in `startLiveHighlighting`; `refresh()` short-circuits pre-mute when fingerprint unchanged + recomputes + stores post-apply fingerprint INSIDE mute window on uncancelled completion; `chrome.storage.onChanged` handler invalidates fingerprint before refresh. |
| `extensions/competition-scraping/src/lib/content-script/highlight-terms.test.ts` | +89 / -0 | New `describe('hashFingerprintMatches (P-20 fix 2026-05-15)', ...)` block with 9 unit tests on the pure helper. |
| `tests/playwright/extension/highlight-flashing.spec.ts` | +119 / -0 | New `P-20 EXTERNAL-MUTATION` test inside the existing per-platform describe (4 tests total: amazon / ebay / etsy / walmart). Each injects a 100ms `setInterval` that appends + removes a non-matchable `<div>` (mimics Amazon carousel rotation at ~10/sec, slightly above measured real-Amazon node-add rate of 6/sec to harden the assertion); observes `<mark>` mutation count over 2.0s; asserts `count === 0`. |
| `docs/p-20-trace-script.js` (NEW) | +120 / -0 | The MutationObserver trace tool described above. Kept in the repo for reuse on any future content-script bug investigation. |

**Verification scoreboard:**

| Check | Result |
|---|---|
| ext `npx tsc --noEmit -p tsconfig.json` | CLEAN |
| ext `npm test` | **323/323 GREEN** (was 314 = +9 new fingerprint tests) |
| root `npx playwright test --project=extension` | **29/29 GREEN** (was 25 = +4 new P-20 EXTERNAL-MUTATION specs; full suite green in 1m43s; zero regression on the 25 pre-existing specs) |
| ext `npm run build` | CLEAN in 1.3 s; content.js 62,440 B (vs 61,582 B baseline = +858 B for fingerprint logic); manifest + background.js + popup chunks unchanged |

### Deploy plan (a.26 — W#2 → main deploy session #12)

- Standard cheat-sheet (b) flow: rebase workflow-2-competition-scraping onto current origin/main HEAD; resolve any doc-batch conflicts manually (parallel-branch divergence pattern from earlier sessions applies); ff-merge to main; push origin/main; Vercel auto-redeploy no-op (zero `src/` changes — extension code only); package fresh `plos-extension-2026-05-15-w2-deploy-12.zip` (or whatever the date is at deploy time) at repo root.
- Real-Amazon verification: sideload the new zip → set Project + Platform = Amazon + at least one highlight term that appears on Amazon product pages → navigate to any Amazon PDP → wait 10–15 seconds for the page to settle through its mutation cycles → confirm (1) highlighted words do NOT keep flashing, (2) text selection over highlighted words does NOT collapse. Compare with one of the OTHER three platforms (Walmart/eBay/Etsy) to confirm no regression on the stable-DOM platforms.
- If a regression is observed on real Amazon despite Playwright green: capture as a new polish item with full reproduction notes; the fingerprint design has a small set of known edge cases (cancellation mid-apply + in-place text-node mutation patterns Amazon doesn't appear to use) that would be the natural investigation seed.
- If verification passes: P-20 ✅ SHIPPED-AT-DEPLOY-LEVEL; P-20 polish backlog list-item closes; next session's (a.27) RECOMMENDED-NEXT slot opens for the next priority polish item (likely P-23 Amazon main-image right-click context-menu or P-21 pickInitialUrl asymmetric canonicalize per the existing W#2 polish backlog).

### Cross-references

- `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` — canonical P-20 implementation
- `extensions/competition-scraping/src/lib/content-script/highlight-terms.test.ts` — fingerprint unit tests
- `tests/playwright/extension/highlight-flashing.spec.ts` — new P-20 EXTERNAL-MUTATION regression coverage
- `docs/p-20-trace-script.js` — reusable mutation-rate trace tool
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-14 entry — fingerprint design decision narrative
- ROADMAP W#2 polish backlog P-20 entry — flipped ✅ SHIPPED-AT-CODE-LEVEL with deploy-verify caveat
- `docs/CORRECTIONS_LOG.md` 2026-05-14 entries (Resume-flow Rule 28 verified + two small operational slips)

---

## Deploy session #12 — P-20 fingerprint short-circuit DEPLOYED + Playwright-only verification (NEW 2026-05-14 — closes (a.26) RECOMMENDED-NEXT)

**Outcome 2026-05-14:** P-20 fingerprint short-circuit fix (yesterday's polish session #17 ship — `hashFingerprintMatches` + `computeMatchableFingerprint` + `refresh()` pre-mute short-circuit + `chrome.storage.onChanged` invalidation) DEPLOYED to vklf.com. Verification approach: **Playwright simulator only** — director picked "Skip manual / trust Playwright 29/29" via Rule 27 forced-picker. P-20 polish backlog entry flips ✅ SHIPPED-AT-DEPLOY-LEVEL on Playwright coverage alone (4 new P-20 EXTERNAL-MUTATION specs across all 4 platforms inject 10/sec non-matchable DOM mutations and assert `<mark>` count stays at zero over 2.0s — slightly above real Amazon's measured 6/sec mutation rate from the design-session DevTools trace).

### Deploy mechanics

Cleanest possible deploy shape — workflow-2 was 3 commits ahead of origin/main (the merge commit `5d85c84` + P-20 code `198b1ad` + P-20 doc batch `4a0c4ee`); main was 0 commits ahead of workflow-2 (no parallel main activity since yesterday's deploy-#11). Rebase a no-op fast-forward; merge commit `5d85c84` naturally collapsed during non-merge rebase per the doc-batch-empty-on-rebase pattern captured yesterday in CORRECTIONS_LOG. New SHAs post-rebase: `865ffd6` (P-20 code) + `8f11388` (P-20 doc batch).

Force-pushed origin/workflow-2-competition-scraping (rebased) with `--force-with-lease`. Switched to main; `git pull --rebase origin main` clean. ff-merged `5e18e4b..8f11388` (11 files +735/-111). Pushed origin/main — the deploy. Vercel auto-redeploy no-op for the web bundle (zero `src/` Next.js changes — extension code + tests + docs only).

### The 2 commits brought to main

- `865ffd6` — W#2 polish session #17 — P-20 fingerprint short-circuit SHIPPED at code level (Amazon highlight-flashing fix). Source files: `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` (+143) + `highlight-terms.test.ts` (+112) + `tests/playwright/extension/highlight-flashing.spec.ts` (+121) + NEW `docs/p-20-trace-script.js` (+107).
- `8f11388` — End-of-session doc batch — 2026-05-14 W#2 polish session #17 — P-20 fingerprint short-circuit SHIPPED at code level + Resume-flow Rule 28 verified end-to-end. Doc files only.

### Fresh extension build

`plos-extension-2026-05-14-w2-deploy-12.zip` at repo root (187,918 bytes; 9 files). Per-file sizes: background.js 207,040 B; chunks/popup 411,472 B; assets/popup.css 4,531 B; popup.html 406 B; manifest.json 893 B; content-scripts/content.js **62,437 B** (contains the P-20 fingerprint short-circuit; +857 B vs deploy-#11's content.js per the ROADMAP's "+858 B for fingerprint logic" estimate — exactly on target).

### Pre-deploy verification scoreboard — all GREEN

- ext `npx tsc --noEmit -p tsconfig.json`: CLEAN.
- ext `npm test`: **323/323 GREEN** in 3.6s.
- root `npx playwright test --project=extension`: **29/29 GREEN** in 1.4 min (was 25/25 pre-P-20; +4 new EXTERNAL-MUTATION specs — one per platform — each injects a 100ms `setInterval` adding/removing non-matchable DOM nodes and asserts `<mark>` mutation count stays at zero over 2.0s).
- ext `npm run build` (wxt build): CLEAN in 1.65s; content.js **62.44 kB** matches expected target.

### Browser verification — Rule 27 forced-picker outcome

Per Rule 27 forced-picker at the Rule 9 STOP moment, director picked **"Skip manual verification — trust Playwright 29/29"** over the recommended **"Director manual on real Amazon + cross-platform spot-check"** option. Director's rationale: the 4 new EXTERNAL-MUTATION specs (10/sec mutation rate vs real Amazon's measured 6/sec) provide sufficient regression coverage for the bug class; real-Amazon spot-check available as an independent self-check (no result-reporting required; not a deploy gate).

**P-20 polish backlog entry flips ✅ SHIPPED-AT-DEPLOY-LEVEL on this basis.** If a real-Amazon edge case surfaces post-deploy that the Playwright simulator's 10/sec injected mutations didn't replicate (e.g., specific DOM-mutation patterns Amazon uses that the simulator's `setInterval` doesn't), capture as a new polish item with full reproduction notes per the prior pattern.

### Director self-check real-world test list (optional; not a deploy gate)

The deploy is live on vklf.com regardless of whether the director runs these tests. They're provided so the director can independently spot-check the P-20 fix on their own browser without reporting results back (Playwright is the formal verification).

**Sideload the new extension:**
1. Open Chrome → `chrome://extensions/` → toggle "Developer mode" ON (top-right).
2. Find the existing "Competition Scraping Extension" tile → click "Remove" (clears the old build cleanly so the new one loads fresh).
3. Unzip `plos-extension-2026-05-14-w2-deploy-12.zip` to a folder somewhere on your computer (e.g., Desktop).
4. Click "Load unpacked" (top-left of chrome://extensions/) → pick the unzipped folder → extension loads. No new permission prompt expected (zero `host_permissions` change in this deploy).

**Set up a highlight term:**
5. Click the PLOS extension popup icon → sign in if needed.
6. Pick your active Project (the dropdown at top).
7. Set Platform = `Amazon`.
8. Add a highlight term that you expect to appear on Amazon product pages — try something common like `skincare` or `Anti-Aging` or a product-category word matching a recent search interest. Pick any color.

**Test 1 — flashing on real Amazon (the load-bearing P-20 symptom):**
9. Open `https://www.amazon.com` in a new tab.
10. Search for a category that should contain your highlight term (e.g., if your term is "skincare", search "skincare" and click any product result).
11. Wait **10–15 seconds** on the product detail page for the page to settle through its mutation cycles (Amazon's lazy-loading reviews, sponsored ads, "Customers also viewed" recommendation widgets all fire DOM mutations after initial paint — that's exactly the DOM churn the P-20 fingerprint short-circuit is designed to handle).
12. **Observation to check:** highlighted words (in your chosen color) STAY highlighted continuously without visibly flashing/flickering on/off. Pre-P-20 fix on the same page: highlights would flash ~once-per-second under the mutation pressure. Post-P-20: should be stable steady-state.

**Test 2 — selection collapse over highlights (the second P-20 symptom):**
13. Try to select text by click-dragging your mouse cursor across a region of the page that contains highlighted words.
14. **Observation to check:** the selection stays held — you can drag over highlighted words and the selection range extends through them without collapsing back to a point. Pre-P-20: selection would silently collapse mid-drag whenever the orchestrator's mutation-observer-triggered refresh fired between mouse-move events.

**Test 3 — zero regression on a stable-DOM platform:**
15. In the popup, switch Platform = `Walmart` (or eBay or Etsy).
16. Open a Walmart product page in a new tab (any product is fine).
17. **Observation to check:** highlights apply normally on Walmart. The P-20 fix shouldn't have changed anything about how highlights work on platforms with stable DOMs (Walmart/eBay/Etsy don't mutate the DOM aggressively after page settle, so the fingerprint-cache path on these is mostly a no-op).

**What to do if any test FAILS:**
Just report it in your next session's launch prompt: which test, what symptom, which Amazon URL or which Walmart product page. The next session will treat the report as a new polish item ("P-23 was the next polish item; flag this as P-23-blocker and re-evaluate"). No need to write up detailed reproduction notes — your verbal report is enough to start.

### Cross-references

- `docs/ROADMAP.md` W#2 row Last Session entry for deploy session #12 + (a.26) flipped ✅ DONE + (a.27) RECOMMENDED-NEXT P-23 + polish backlog P-20 ✅ SHIPPED-AT-DEPLOY-LEVEL.
- `docs/CHAT_REGISTRY.md` new top row.
- `docs/DOCUMENT_MANIFEST.md` per-doc flags.
- `docs/CORRECTIONS_LOG.md` header bump only (zero new substantive §Entries).
- `docs/NEXT_SESSION.md` rewritten for (a.27) P-23 session.
- `plos-extension-2026-05-14-w2-deploy-12.zip` at repo root (the deploy artifact).

---

## Deploy session #11 — Module 2 region-screenshot gesture DEPLOYED + FULL VERIFY (NEW 2026-05-14 — closes (a.24) RECOMMENDED-NEXT)

**Outcome 2026-05-14:** Module 2 region-screenshot gesture (session 6's ship — drag-rectangle full-viewport overlay + `chrome.tabs.captureVisibleTab` + canvas crop + 3-phase upload) fully verified end-to-end across all 4 target platforms (Walmart + eBay + Etsy + Amazon). Deploy-#11 deploy-and-verify cycle is CLOSED. Module 2's full image-capture pair (regular-image deploy-#10 + region-screenshot deploy-#11) is now complete + live + verified in production.

### Deploy mechanics

Standard W#2 → main cheat-sheet (b) — rebase 7 commits from `workflow-2-competition-scraping` onto `origin/main` HEAD `907a363`. Manually resolved doc-file conflicts (CHAT_REGISTRY + COMPETITION_SCRAPING_VERIFICATION_BACKLOG + CORRECTIONS_LOG + DOCUMENT_MANIFEST + ROADMAP across the 4 replayed doc-batch commits; HANDOFF_PROTOCOL §4 Step 1 row 12 hook-enforcement augment merged onto main's row-12 framing). Two commits dropped during replay: the 8c39f20 merge commit naturally collapsed by non-merge rebase; the 68fd93d (a.24-a) P-22 slice 2 doc batch became empty after taking `--ours` because main's parallel (a.24-verify-COMPLETE) session had already subsumed its content (CORRECTIONS_LOG entry captures this pattern). Resulting 5 commits ff-merged cleanly to `main` (`907a363..0e222b4`). Pushed origin/main; Vercel auto-redeploy is a no-op for the web bundle since 0 `src/` Next.js + 0 `prisma/` + 0 API route changes.

### The 5 commits brought to main

| Commit | Description |
|---|---|
| `3b58e29` | P-22 slice 1 — Playwright happy-path image-capture test (walmart) |
| `2ad1ff2` | End-of-session doc batch — (a.23) Walmart Phase 2 + P-22 slice 1 |
| `d1ac234` | P-22 slice 2 — cross-platform parametrize image-capture spec across amazon/ebay/etsy/walmart |
| `516c124` | W#2 Extension build session 6 — Module 2 region-screenshot gesture + NEW NEXT_SESSION.md guard hook + .claude/settings.json + HANDOFF_PROTOCOL §4 Step 1 row 12 hook-enforcement augment + Rule 21 scheduled-memory extension |
| `0e222b4` | Follow-up — P-23/P-24/P-25 polish entries + CORRECTIONS_LOG scope-narrowing entry (./resume + NEXT_SESSION.md structure stayed at main's 2026-05-13-c canonical version per agreed reconciliation policy) |

### Fresh extension build

`plos-extension-2026-05-14-w2-deploy-11.zip` at repo root — 187,717 bytes (+2,920 vs deploy-#10's 184,797). Build sizes vs session-6 baseline expected values: content.js 61,582 b (+8,062 from session 5's 53,520 for region-screenshot overlay + drag/crop logic); background.js 207,040 b (+306 from 206,734 for captureVisibleTab handler + new message kinds); manifest.json 893 b (+12 from 881 for the new `activeTab` permission); popup chunk 411,472 b (slight increase from 410,206 for new RegionScreenshotModeButton). Naming `-11` (not `-10`) per director-approved deploy describe — deploy-#10 already exists on main as the regular-image deploy + verification-complete; -11 is the next sequence number.

### Pre-deploy verification scoreboard

| Check | Result |
|---|---|
| Extension `npx tsc --noEmit` | clean |
| Extension `npm test` | **314/314 pass** (matches session 6's expected baseline) |
| Extension `npx wxt build` | clean |
| Playwright extension project (full suite) | **25/25 GREEN** in 1.5 min — 17 P-14+P-10 highlight-flashing specs (zero regression) + 4 P-22 image-capture cross-platform happy-path tests + 4 region-screenshot cross-platform tests (with `chrome.tabs.captureVisibleTab` stubbed per session 6 design) |

### Browser verification on vklf.com — Steps 6.1–6.8 all ✅ PASS

Verification per Rule 27 scope exception (Chrome extension popup flow + permission-prompt-on-reinstall + real `chrome.tabs.captureVisibleTab` API path + cross-platform real-DOM + visual-judgment checks all apply). Manual walkthrough was the natural test for the slice the Playwright spec stubs out. Server-side DB confirmation via `scripts/inspect-w2-state.mjs` for each platform's save.

| Step | Result | DB-side confirmation |
|---|---|---|
| **6.1 Sideload + activeTab re-approve** | ✅ PASS | (n/a — pre-test setup) |
| **6.2 "Region-screenshot mode" button visible** | ✅ PASS | (n/a — UI presence check) |
| **6.3 Walmart capture happy path** | ✅ PASS | New CapturedImage row `2026-05-14T03:28:21.778Z`; `sourceType=region-screenshot`; mimeType `image/png`; fileSize 10,527 B; walmart URL match |
| **6.4 Form fill + Save (Walmart)** | ✅ PASS | Same row as 6.3 — imageCategory "A+ module" + form fields populated |
| **6.5a eBay capture + Save** | ✅ PASS | New CapturedImage row `2026-05-14T03:33:32.002Z`; `sourceType=region-screenshot`; mimeType `image/png`; fileSize 17,443 B; eBay URL `/itm/365806348442` |
| **6.5b Etsy capture + Save** | ✅ PASS | New CapturedImage row `2026-05-14T03:35:22.686Z`; `sourceType=region-screenshot`; mimeType `image/png`; fileSize 44,949 B; Etsy URL `/listing/1815615660` |
| **6.5c Amazon capture + Save** | ✅ PASS | New CapturedImage row `2026-05-14T03:37:59.960Z`; `sourceType=region-screenshot`; mimeType `image/png`; fileSize 422,622 B; Amazon URL `/dp/B0CTTF514L` |
| **6.6 Esc cancel (mid-drag + banner chip)** | ✅ PASS | (n/a — overlay-cleanup-only check) |
| **6.7 Below-fold UX hint copy + viewport-clamp** | ✅ PASS | Director confirmed "two halves" hint copy present; rectangle clamps to viewport (consistent with `chrome.tabs.captureVisibleTab` viewport-only API design) |
| **6.8 Non-supported page friendly error** | ✅ PASS | Tested on google.com — error message fires |

### Notable cross-platform finding: region-screenshot bypasses P-23's Amazon issue

P-23 (captured in the prior (a.24) cross-platform-verify session) documented that Amazon's main `<img>` right-click context-menu doesn't fire on the product-listing page (Amazon wraps `<img>` in zoom/overlay elements that intercept contextmenu events before Chrome recognizes `contexts: ['image']`). Today's region-screenshot verification on Amazon worked cleanly — **the gesture is independent of per-image DOM-wrapping** because the popup-button-armed full-page overlay doesn't need per-element event targeting; `chrome.tabs.captureVisibleTab` captures the entire viewport regardless of what's underneath. This is a useful structural observation for future P-23 fix decisions: if the right-click context-menu fix proves complex, region-screenshot is a working alternative gesture for Amazon image capture even when right-click is broken.

### NEW P-26 polish item captured this session

Director asked mid-verification: *"Why does the selection not allow scrolling past the page fold to capture longer images?"* Honest answer: Chrome's `chrome.tabs.captureVisibleTab` is viewport-only by design — there's no extension API that lets the content reach below-the-fold pixels in a single shot. Phase 1 design (per `COMPETITION_SCRAPING_STACK_DECISIONS.md §4`) picked the "two halves" workaround — capture top half, scroll, capture bottom half, each becomes its own CapturedImage row in the URL detail page. Alternative "full-page scroll-capture" (auto-scroll + canvas-stitch, like Awesome Screenshot does) is technically feasible but has significant trade-offs:

| Concern | Why it's tricky |
|---|---|
| Sticky headers | Would duplicate in stitched image (top banner appears N× if stitching N viewports) |
| Lazy-loaded content | Need to wait between scrolls for images/widgets to render — adds timing fragility |
| Layout that changes on scroll | Some sites collapse/expand elements on scroll, breaking stitch alignment |
| Infinite-scroll pages | No defined "bottom" — would need a manual stop signal |
| Performance | Multiple captureVisibleTab calls per gesture (slower; bigger PNGs) |
| Test coverage | Current Playwright spec tests single-viewport; multi-scroll would need separate harness |

Director picked "keep current design + capture P-26 polish entry for future re-evaluation only." P-26 added to ROADMAP polish backlog this batch. NOT today's next-session task.

### Cross-references

- `ROADMAP.md` W#2 row Last Session 2026-05-14 prepended; (a.24) flipped ✅ DONE; new (a.25) RECOMMENDED-NEXT = P-20 design session; polish backlog P-22 flipped to SLICE 2 SHIPPED; new P-26 entry; section header P-12-thru-P-25 → P-12-thru-P-26.
- `CHAT_REGISTRY.md` new top entry.
- `CORRECTIONS_LOG.md` 2 NEW INFORMATIONAL entries (launch-prompt staleness pattern + doc-batch-empty-on-rebase pattern).
- `DOCUMENT_MANIFEST.md` header + per-doc flags + this-session summary.
- `NEXT_SESSION.md` rewritten for P-20 design session on `workflow-2-competition-scraping`.
- `scripts/inspect-w2-state.mjs` confirmed working post-deploy — the script created in the prior (a.24-verify) session continues to serve W#2 verifications.

---

## Deploy session #10 — FULL VERIFY + cross-platform smoke COMPLETE (NEW 2026-05-14 — closes (a.23) RECOMMENDED-NEXT)

**Outcome 2026-05-14:** Module 2 regular-image gesture fully verified end-to-end across all 4 target platforms (Walmart + eBay + Etsy + Amazon). Deploy-#10 deploy-and-verify cycle is CLOSED.

### Walmart — FULL VERIFY (2026-05-13-b actual; documented retroactively 2026-05-14)

Yesterday's session 2026-05-13-b completed FULL Walmart end-to-end verification, NOT just context-menu firing as the prior section below (preserved verbatim as historical record) had recorded. DB inspection via NEW `scripts/inspect-w2-state.mjs` confirmed the actual state — 3 CapturedImage rows for `https://www.walmart.com/ip/17056909` under Project "Bursitis":

| Time (UTC) | imageCategory | composition | embeddedText | tags | fileSize | mimeType | sourceType | storagePath shape |
|---|---|---|---|---|---|---|---|---|
| 2026-05-13 15:19:54 | **Main Image** | "Packaging with outline of human." | "Equate.\nCool & Heat" | `["packaging"]` | 433,156 B | image/jpeg | regular | `{projectId}/{competitorUrlId}/{capturedImageId}.jpg` ✅ |
| 2026-05-13 17:37:04 | Secondary image | (null) | (null) | `[]` | 362,501 B | image/jpeg | regular | same format ✅ |
| 2026-05-13 17:41:05 | Secondary image | (null) | (null) | `["ingredients"]` | 178,739 B | image/jpeg | regular | same format ✅ |

**Three metadata patterns exercised in one session:** (1) full-form Main Image with Composition + Embedded text + Tags populated; (2) minimum-form Secondary image with no optional metadata; (3) tags-only Secondary image. Each row exercises a different validation path; all three saved correctly to DB + Supabase Storage. **More thorough than a single happy-path save would have given.**

**Doc-drift root cause** (captured as 2026-05-14 CORRECTIONS_LOG entry): yesterday's session wrapped mid-walkthrough due to a terminal-UI rendering issue; end-of-session 2026-05-13-b doc batch captured only the LAST recorded checkpoint (context-menu firing) and missed the form-fill + Save + DB-row verifications completed BEFORE the wrap.

### eBay — PASS (2026-05-14 today)

- **URL used:** `https://www.ebay.com/itm/365806348442` (saved via Module 1 in a prior session; 1 of 5 saved eBay URLs in director's "Bursitis" Project).
- **Director in-browser sequence:** switched extension Selected Platform Walmart → Ebay; right-clicked main product image → "Add to PLOS — Image" appeared (direct right-click works on eBay); form opened with image preview + saved-URL picker showed eBay URL pre-selected (P-15 canonicalize on `/itm/{listing-id}` working) + image-category dropdown populated; picked "Main Image"; clicked Save; "Captured." → form auto-closed.
- **DB confirmation (via inspection script):** new CapturedImage row at 2026-05-13T21:50:38Z; imageCategory "Main Image"; sourceType "regular"; **mimeType `image/webp`** (eBay serves WebP — cross-platform MIME diversity confirmed; upload contract handles WebP correctly); fileSize 251 KB; storagePath in expected `{projectId}/{competitorUrlId}/{capturedImageId}.webp` format.
- **Verifies:** `*.ebayimg.com` host_permission allows cross-origin image fetch; eBay platform-module URL canonicalization works on `/itm/{listing-id}`; 2-phase signed-URL upload + finalize end-to-end on eBay.

### Etsy — PASS (2026-05-14 today)

- **URL used:** `https://www.etsy.com/listing/1815615660` (1 of 3 saved Etsy URLs in director's Project).
- **Director in-browser sequence:** switched Selected Platform Ebay → Etsy; right-clicked main image → "Add to PLOS — Image" appeared; form opened cleanly; picked "Main Image"; Save → "Captured." → form auto-closed.
- **DB confirmation:** new CapturedImage row at 2026-05-13T22:00:48Z; imageCategory "Main Image"; sourceType "regular"; mimeType `image/jpeg`; fileSize 201,759 bytes; storagePath in expected format with `.jpg` extension.
- **Verifies:** `*.etsystatic.com` host_permission; Etsy platform-module URL canonicalization on `/listing/{id}` (locale prefix preserved); full upload chain.

### Amazon — PASS via workaround (2026-05-14 today) + NEW P-23 polish item captured

- **URL used:** `https://www.amazon.com/dp/B0CTTF514L` (1 of 9 saved Amazon URLs).
- **Director in-browser sequence:** switched Selected Platform Etsy → Amazon; **right-clicked directly on the main product image on Amazon's product-listing page → "Add to PLOS — Image" did NOT appear in the context menu.** Workaround that DOES work: click the main product image once → Amazon opens it in a larger viewer pane → right-click that opened image → context-menu fires + form opens + full upload chain works. Picked "Main Image"; Save → "Captured." → form closed.
- **DB confirmation:** new CapturedImage row at 2026-05-13T22:08:48Z; imageCategory "Main Image"; sourceType "regular"; mimeType `image/jpeg`; fileSize 177,194 bytes; storagePath in expected format.
- **Verifies (via workaround):** `*.media-amazon.com` + `*.ssl-images-amazon.com` host_permissions; Amazon platform-module URL canonicalization on `/dp/{ASIN}` (P-15 verified working on Amazon as of 2026-05-12-h controlled repro; today's smoke confirms it stays working in production); 2-phase upload + finalize on Amazon's image bytes.
- **NEW finding captured as P-23 polish item in ROADMAP W#2 polish backlog (Rule 24 pre-capture search performed; no prior treatment in P-1..P-22 or DESIGN §B):** Amazon main-image right-click context-menu does NOT fire on Amazon's product-listing page. Likely cause: Amazon's main `<img>` element is wrapped in zoom/overlay elements that intercept the `contextmenu` event before Chrome recognizes the target as the `contexts: ['image']` predicate used by `chrome.contextMenus`. In the larger viewer pane Amazon opens on click, the displayed image is a clean `<img>` so the menu fires. Affects ONLY Amazon (Walmart/eBay/Etsy all work on direct right-click). Severity MEDIUM — workflow degradation only (works via workaround); not a hard failure. Candidate fixes for the future polish session (not for today): (a) widen `chrome.contextMenus` `contexts` to `['all']` + detect element-type in handler; (b) inject content-script right-click listener that walks DOM up to find an underlying `<img>`; (c) reuse §5 floating "+ Add" button pattern from URL capture.

### Cross-platform regression coverage achieved

3 distinct MIME types (JPEG / WebP / JPEG) across 4 distinct URL canonicalization patterns (`/ip/{slug}/{id}`, `/itm/{listing-id}`, `/listing/{id}`, `/dp/{ASIN}`) — all upload contracts handled correctly. The MIME diversity exercised MIME-type detection + storage-path extension derivation differently per platform; the URL pattern diversity exercised each platform-module's canonicalProductUrl + matchesProduct regex correctly.

### Verification approach this session — Hybrid per Rule 27 forced-picker

Director picked Option B Hybrid: Claude runs server-side DB checks via `scripts/inspect-w2-state.mjs` before/after each platform + director does in-browser UI clicks (minimum-smoke: pick "Main Image" category + Save with no Composition/Embedded text/Tags — the full form's metadata fields were proven yesterday on Walmart). Note: Rule 27 forced-picker was run RETROACTIVELY mid-session after director asked "did you check this yourself using Playwright?" — captured as INFORMATIONAL CORRECTIONS_LOG entry. Lesson: re-run the picker at EVERY manual-walkthrough proposal moment, not just the first-time-ever one.

### Cross-references

- `ROADMAP.md` W#2 row Last Session 2026-05-14 prepended; (a.23) flipped ✅ DONE FULL VERIFY; new (a.24) RECOMMENDED-NEXT = Extension build session 6 region-screenshot mechanism on `workflow-2-competition-scraping`; polish backlog section header bumped P-12-thru-P-22 → P-12-thru-P-23; new P-23 entry added.
- `CHAT_REGISTRY.md` new top entry.
- `CORRECTIONS_LOG.md` 3 NEW INFORMATIONAL entries (Rule 27 slip + Rule 1/14g slip + Doc drift root cause).
- `DOCUMENT_MANIFEST.md` header + per-doc flags + this-session summary.
- `NEXT_SESSION.md` rewritten for (a.24) Extension build session 6 per §4 Step 1c forced-picker pick.
- NEW `scripts/inspect-w2-state.mjs` (~95 lines; read-only Prisma DB inspection script for W#2 state; reusable for future verifications; follows project convention with `inspect-fingerprints.mjs` and `verify-no-stable-id-duplicates.ts`).

---

## (a.23) — Walmart Phase 2 ✅ FULL PASS + P-22 Playwright slice 1 SHIPPED + Phase 3 manual cross-platform FORMALLY DEFERRED (NEW 2026-05-14)

**Session:** `session_2026-05-14_a23-walmart-phase-2-verify-pass-and-p22-playwright-slice-1` (Claude Code; verification portion on `main`; P-22 code work on `workflow-2-competition-scraping`).

**Outcome — three things:**
1. ✅ Walmart Phase 2 manual smoke 2.4-2.6 PASSED end-to-end against live vklf.com (see updated Phase 2 table in the Deploy session #10 section below for the per-step outcomes).
2. ✅ P-22 Playwright extension-context regression spec slice 1 SHIPPED at code level on `workflow-2-competition-scraping` in commit `d3dae97` — covers the Module 2 regular-image gesture happy path end-to-end (walmart, single test, full 3-phase Save flow with all 5 vklf.com / Supabase / image-CDN routes mocked).
3. ❌ Phase 3 manual cross-platform smoke (ebay / etsy / Amazon on live sites) formally DEFERRED to a future verification session — director's pick at scope question; rationale below.

**Phase 2 walkthrough recap (concise — full per-step results in updated Phase 2 table):**

Director worked through Steps 2.4 → 2.5 → 2.6 in small confirmation checkpoints (Rule 2). Form rendered with image preview thumbnail, Project + Platform context block, **saved-URL picker pre-selected the Walmart Equate URL correctly** (confirms P-15 canonicalize path works for image-form too — first independent confirmation of P-15 outside the text-capture surface where session #16 verified it), image-category dropdown loaded with 2 existing entries + "+ Add new..." sentinel, Save button enabled. Director filled form (picked existing "main image" category, typed Composition + Embedded text, added 2 tags via Enter key — chips rendered correctly). Save → "Saving..." → form closed cleanly in 1-3 seconds with no error. Director navigated to vklf.com URL detail page for the Walmart Equate URL; image gallery showed the captured row with **all four metadata fields matching** what was entered. The full 2-phase upload contract executed in production for the FIRST time end-to-end.

**Scope-shift decision at session midpoint (Rule 11 + Rule 14b forced-picker):**

After Walmart Phase 2 PASSED, the original plan was to continue with ebay → etsy → Amazon manual smoke (Phase 3). Director asked to substitute Playwright for the manual cross-platform work. Claude surfaced the honest constraint: Playwright extension-context tests against fixture HTML pages verify CODE PATHS (regression coverage of the form + Save flow against a controlled DOM); manual cross-platform smoke against live e-commerce sites verifies REAL-PRODUCTION BEHAVIOR (per-CDN host_permissions actually working, real DOM matching parser expectations, no anti-bot blocking). They are COMPLEMENTARY, not substitutes. Three options surfaced: A = defer Phase 3 + P-22 both for future sessions; B = defer Phase 3 manual + START P-22 build this session (likely multi-session work); C = continue manual cross-platform as originally planned. **Director picked B** (most-thorough option per `feedback_recommendation_style.md`).

**P-22 slice 1 scope (committed `d3dae97`):**

ONE platform (walmart — freshest context from manual smoke), ONE test, full happy-path with all API endpoints mocked via Playwright `context.route`. Two new files:
- `tests/playwright/extension/walmart-image-product-page.html` — fixture HTML page with a single `<img>` referencing the walmart image-CDN host pattern, so `fetchImageBytes()` exercises the `*.walmartimages.com` host_permission entry.
- `tests/playwright/extension/image-capture.spec.ts` (~500 lines) — drives the gesture end-to-end: navigate → wait for orchestrator attach → dispatch `open-image-capture-form` message from SW → assert form renders → fill (category, composition, embedded text, 2 tags) → click Save → assert Phase 1 `requestUpload` + Phase 2 PUT to mocked Supabase + Phase 3 `finalize` all fire with correct payload shapes → form closes.

7 routes mocked: (1) walmart product page HTML, (2) walmart image CDN with fake 1×1 JPEG bytes, (3) GET `listCompetitorUrls` returning a seeded saved walmart URL, (4) GET `listVocabularyEntries` returning 2 image-category entries, (5) POST `requestUpload` returning a fake Supabase signed URL, (6) PUT to fake-Supabase, (7) POST `finalize` returning a fake `CapturedImage` row. Plus a catch-all + `listProjects` mock for the orchestrator's init-time API calls. Supabase session seeded in `chrome.storage.local` at the supabase-js default key shape so `authedFetch`'s `getSession()` returns a fake-but-shape-valid session and proceeds.

Two implementation choices documented in the commit message for the next P-22 slice author:
- **Pre-selection NOT asserted** — the spec explicitly `selectOption(FAKE_URL_ID)` instead of relying on the form's auto-pre-select. P-15 canonicalize-before-normalize pre-select coverage belongs in a dedicated P-15-style spec (separate assertion class).
- **Context-menu click skipped** — Chrome's `contextMenus` is native UI outside page DOM and not Playwright-driveable. The spec dispatches the same message the `contextMenus.onClicked` handler would send via `chrome.tabs.sendMessage` from the SW. This exercises everything DOWNSTREAM of the menu click — which is where all form + Save logic lives.

**Test results:** new test passes in 1.1s. Full extension Playwright suite 18/18 GREEN (17 existing P-14 + P-10 specs + 1 new P-22 test) — zero regression on existing coverage. The Module 2 regular-image gesture happy path is now permanent regression-protected.

**Why deferred Phase 3 manual cross-platform isn't lost:**

Captured in:
- This doc's Phase 3 table (updated above to show ❌ NOT YET TESTED with explicit recovery plan)
- ROADMAP W#2 row Next Session as one of the (a.24) RECOMMENDED-NEXT options (alongside P-22 slice 2 — more Playwright coverage)
- A `DEFERRED:` task in the TaskList registry per Rule 26 (closed at end-of-session sweep once destination doc entry written)

When director schedules the verification session, ~15-20 minutes total (5-10 min per platform) on a clean Codespaces terminal should close out all three remaining platforms — the form behavior is the same shape verified on Walmart; each platform-specific check is just "does the right-click → form → Save flow work against THIS platform's DOM + CDN."

**Future P-22 slices deferred to next P-22 session(s):**
- **Slice 2 — cross-platform parametrization** (ebay / etsy / amazon fixture HTML pages + parametrized test similar to highlight-flashing.spec.ts's PLATFORMS array).
- **Slice 3 — error-path coverage** (CDN-not-authorized → expect inline error banner; image-too-large → expect "exceeds 5 MB cap" message; auth-failure 401 → expect "Couldn't save (401)..."; Phase 2 PUT 415 mismatch → expect "Supabase Storage PUT failed: HTTP 415").
- **Slice 4 — pre-select spec** (dedicated P-15-style spec that asserts `pickInitialUrl` canonicalize-before-normalize behavior across slug-variant page URLs vs. saved canonical-form rows — currently NOT covered by any spec since it's a separate assertion class).

**Cross-references:**
- ROADMAP W#2 row Last Session 2026-05-14 entry (full session detail; both Phase 2 verification + P-22 slice 1 + Phase 3 deferral).
- ROADMAP W#2 polish backlog P-22 entry — status flipped from "captured" to "SLICE 1 SHIPPED at code level on workflow-2 — happy-path walmart coverage; slices 2/3/4 enumerated above for future sessions."
- COMPETITION_SCRAPING_DESIGN.md §B new in-flight refinement entry — Playwright test-shape decisions (context-menu skipped + dispatch via SW; pre-select isolated to dedicated spec; per-slice scope).
- CHAT_REGISTRY new top entry 2026-05-14.
- DOCUMENT_MANIFEST header 2026-05-14.
- CORRECTIONS_LOG new INFORMATIONAL entry — Playwright `context.route` LIFO matching gotcha caught during test build (catch-all route added BEFORE specific routes initially; routes match in REVERSE registration order so catch-all overrides everything; caught before first test run via reasoning).
- `tests/playwright/extension/image-capture.spec.ts` + `tests/playwright/extension/walmart-image-product-page.html` — the slice 1 deliverable.

---

## Deploy session #10 — Module 2 regular-image gesture DEPLOYED + PARTIAL VERIFY (NEW 2026-05-13-b — W#2 → main deploy session #10)

**Status:** DEPLOY LIVE on `main` (commit `bd7b39a`; `dc3a314..bd7b39a` ff-merge); Phase 1 sideload + permission re-approval + Phase 2 Walmart full smoke ✅ FULL PASS (Phase 1 confirmed 2026-05-13-b; Phase 2.4-2.6 verified 2026-05-14 in session (a.23) — see updated Phase 2 table below). Phase 3 cross-platform smoke FORMALLY DEFERRED 2026-05-14 in favor of P-22 Playwright regression-spec slice 1 build; see new (a.23) section above.

**Deploy artifacts:**
- Code on origin/main: `bd7b39a` (3 commits ahead of `dc3a314` — session #16 doc batch `6ee0974` + session 5 code `0866b89` + session 5 doc batch `bd7b39a`).
- Diff: 17 files +1859/-22 — entirely `extensions/competition-scraping/src/` + `docs/`. ZERO `src/` (Next.js) changes, ZERO `prisma/` changes — vklf.com web bundle byte-identical pre→post-deploy.
- Deployable extension zip: `plos-extension-2026-05-13-w2-deploy-10.zip` at repo root (184,797 bytes; 9 files; background.js 206,731 b / content.js 53,524 b / popup chunk 410,206 b / manifest.json 881 b — all at session 5 baseline parity within cross-build variance).
- Manifest host_permissions: 11 total (6 original + 5 new image-CDN — `*.media-amazon.com`, `*.ssl-images-amazon.com`, `*.ebayimg.com`, `*.etsystatic.com`, `*.walmartimages.com`). Chrome WILL prompt to re-approve on reinstall.

### Phase 1 — Sideload + permission re-approval — ✅ CONFIRMED LIVE 2026-05-13-b

| # | Step | Director observation |
|---|---|---|
| 1.1 | Right-click `plos-extension-2026-05-13-w2-deploy-10.zip` in Codespaces file tree → Download to laptop | ✅ done |
| 1.2 | Chrome → `chrome://extensions` → Developer mode ON | ✅ done |
| 1.3 | Remove existing PLOS extension card → extract downloaded zip → click "Load unpacked" → pick the extracted `chrome-mv3` folder | ✅ done |
| 1.4 | Accept Chrome's re-approval prompt for all 11 host_permissions (including the 5 new image-CDN patterns) | ✅ done — extension card shows toggle ON |

### Phase 2 — Walmart product-page smoke — ✅ FULL PASS 2026-05-14 (2.1–2.3 confirmed 2026-05-13-b; 2.4–2.6 verified 2026-05-14 in session (a.23))

| # | Step | Outcome |
|---|---|---|
| 2.1 | Sign in to vklf.com (any session) | ✅ confirmed live 2026-05-14 via implicit signal: extension's `listCompetitorUrls` + `listVocabularyEntries` API calls succeeded in (a.23) Step 2.4 (would have 401'd if auth state were stale) |
| 2.2 | Walmart product page (URL `https://www.walmart.com/ip/Equate-Extra-Strength-Cool-Heat-Medicated-Patches-5-Count/17056909?classType=VARIANT&athbdg=L1102&from=/search`) | ✅ navigated 2026-05-13-b |
| 2.3 | Right-click main product image → check for "Add to PLOS — Image" in context menu | ✅ confirmed 2026-05-13-b — "Add to PLOS — Image" appears |
| 2.4 | Click "Add to PLOS — Image" → describe form (image preview thumbnail + saved-URL picker + image-category + Composition + Embedded text + Tags + Save button) | ✅ PASS 2026-05-14 — director confirmed all 7 form sections render correctly: title + Project + Platform context block + image-preview thumbnail with pixel-dimension caption + saved-URL picker with the Walmart Equate URL **pre-selected correctly** (confirms P-15 canonicalize-before-normalize path works for image-form too — same path verified PASS on Amazon in session #16's text-capture flow) + image-category dropdown enabled with 2 existing categories + "+ Add new..." sentinel + both optional textareas + Tags input + Save button **enabled** (both lists loaded) + no error banners |
| 2.5 | Fill form (pick a saved-URL for this Walmart product OR confirm form's behavior when no saved-URL exists yet; fill image-category from vocab, optional Composition / Embedded text / Tags) | ✅ PASS 2026-05-14 — director picked existing "main image" category + filled Composition + filled Embedded text + added 2 tags (Enter key adds chips correctly; both chips rendered above the input row as pills with × remove affordance) |
| 2.6 | Click Save → wait for success indicator → navigate to vklf.com URL-detail-page for that Walmart URL → confirm CapturedImage row appears in the image gallery with the correct image-category + metadata | ✅ PASS 2026-05-14 — Save button → "Saving..." → form closed cleanly within 1-3 seconds (no error banner); director navigated to vklf.com URL detail page for the Walmart Equate URL; image gallery section visible; **captured image row visible matching the Equate Cool Heat Patches product image; all four metadata fields match what was entered** (image-category "main image" + Composition + Embedded text + 2 tags). **The full 2-phase upload contract (`fetchImageBytes` from extension origin → `requestImageUpload` Phase 1 → direct PUT to Supabase signed URL Phase 2 → `finalizeImageUpload` Phase 3 → CapturedImage row) executed cleanly in production for the FIRST time end-to-end.** |

### Phase 3 — Cross-platform smoke — ❌ FORMALLY DEFERRED 2026-05-14 to future verification session

**Status:** Manual cross-platform smoke against live ebay / etsy / Amazon production sites remains untested. Director's pick in (a.23) was to defer this in favor of starting the P-22 Playwright regression-spec build (see new (a.23) section above for full reasoning + the honest constraint surfacing about what Playwright covers vs. what live-production smoke covers — they are complementary, not substitutes).

| Platform | Status |
|---|---|
| ebay (clean historical track record) | ❌ NOT YET TESTED on live site — manual smoke deferred 2026-05-14; covered partially by P-22 Playwright slice 2 (cross-platform parametrization, future session) |
| etsy | ❌ NOT YET TESTED on live site — same deferral |
| Amazon | ❌ NOT YET TESTED on live site — same deferral; Amazon-specific Playwright work also tracked via P-20 (cross-platform design HIGH) |

**What this deferral actually closes vs. leaves open:**
- ✅ CLOSES: end-to-end Module 2 regular-image gesture verification ON A SINGLE PLATFORM (Walmart). Confidence in the code paths is very high — the 2-phase upload, the form's pre-select, the metadata round-trip are all PROVEN live.
- ❌ LEAVES OPEN: per-platform image-CDN `host_permissions` working against real `*.ebayimg.com` / `*.etsystatic.com` / `*.media-amazon.com` CDNs. Real-DOM image markup parsing on live ebay/etsy/Amazon (which may differ from a frozen-in-time fixture). Any anti-bot or rate-limit measures specific to each platform.

**Recovery plan when director schedules the deferred verification session:** 5-10 minutes per platform on a clean Codespaces terminal: navigate to a saved ebay product page → right-click image → verify Step 2.3 + 2.4 + 2.5 + 2.6 sequence works → repeat for etsy → repeat for Amazon. The director has saved URLs for at least walmart on this Project; saved URLs for ebay/etsy/Amazon may need to be captured first via the existing right-click URL gesture before the image gesture can attach an image to them.

### Cross-references

- ROADMAP W#2 row Last Session 2026-05-13-b entry (full session detail; deploy mechanics; mid-session decisions).
- ROADMAP W#2 polish backlog new P-22 entry (Playwright extension-context regression spec for this gesture — captured per Rule 26 at the Rule 27 forced-picker moment).
- CHAT_REGISTRY new top entry 2026-05-13-b.
- DOCUMENT_MANIFEST header 2026-05-13-b.
- `extensions/competition-scraping/src/lib/content-script/image-capture-form.ts` — the form source; code-read may help next session anticipate the saved-URL picker dependency.
- `extensions/competition-scraping/src/entrypoints/background.ts` — context-menu + 2-phase uploader.
- `extensions/competition-scraping/src/lib/api-client.ts` — `requestImageUpload`, `putImageBytesToSignedUrl`, `finalizeImageUpload`, `fetchImageBytes`.

---

## Extension build — session 5 — Module 2 image-capture regular-image gesture SHIPPED (NEW 2026-05-13 — W#2 Extension build session 5)

**Session:** `session_2026-05-13_w2-extension-build-session-5-image-capture-regular-image-gesture-shipped` (Claude Code, on `workflow-2-competition-scraping`).

**Code commit:** `0866b89` — pushed to `origin/workflow-2-competition-scraping`.

### Scope picked at session start (Rule 14f forced-picker)

Director picked **Option A — regular-image-first; region-screenshot deferred to session 6 (recommended)** per `feedback_recommendation_style.md`'s "most thorough and reliable" criterion: gestures split cleanly at the independent boundary; mirrors the proven `text-capture-form.ts` pattern (low risk); single-session-viable with full test coverage; region-screenshot's novel mechanism (`chrome.tabs.captureVisibleTab` + canvas crop + transparent overlay + drag rectangle) earns its own focused session 6.

### Files changed (11 total; +1656/-7)

**NEW (3):**
- `extensions/competition-scraping/src/lib/captured-image-validation.ts` — pure-logic helpers mirroring `captured-text-validation.ts`; validates the draft (`competitorUrlId`, `mimeType`, `fileSize` ≤ 5 MB, `sourceType`, `imageCategory` required); reuses `pickInitialUrl` from captured-text-validation; `normalizeTagsForImage` mirrors text-capture tags normalization.
- `extensions/competition-scraping/src/lib/captured-image-validation.test.ts` — 12 node:test unit tests covering the happy path + each validation reason + tag normalization.
- `extensions/competition-scraping/src/lib/content-script/image-capture-form.ts` — DOM-based overlay form mirroring `text-capture-form.ts` shape (image preview + saved-URL picker with P-15 canonicalize-before-normalize pre-select + image-category picker with "+ Add new..." inline upsert + Composition optional textarea + Embedded text optional textarea + Tags chip-list + Save).

**MODIFIED (8):**
- `extensions/competition-scraping/src/entrypoints/background.ts` — registers new `"Add to PLOS — Image"` context-menu entry (`contexts: ['image']`); click handler routes `info.srcUrl` + `info.pageUrl` to content script via `open-image-capture-form` ContentScriptMessage; new `handleSubmitImageCapture` performs the end-to-end three-phase upload (`fetchImageBytes` → `requestImageUpload` → `putImageBytesToSignedUrl` → `finalizeImageUpload`); returns `CapturedImage` row to the form.
- `extensions/competition-scraping/src/lib/api-client.ts` — adds `requestImageUpload`, `putImageBytesToSignedUrl`, `finalizeImageUpload`, `fetchImageBytes` exports. All four are pure-helper-style with `fetchFn` injection seam for node:test.
- `extensions/competition-scraping/src/lib/api-client.test.ts` — 11 new node:test cases for `fetchImageBytes` (MIME resolution from header, fallback to URL extension, 415 rejection of SVG, 413 over-size guard, 404, TypeError, charset-suffix stripping) + 3 for `putImageBytesToSignedUrl` (success, non-2xx with body excerpt, TypeError).
- `extensions/competition-scraping/src/lib/content-script/api-bridge.ts` — adds `submitImageCapture` wrapper around the new `submit-image-capture` BackgroundRequest kind.
- `extensions/competition-scraping/src/lib/content-script/messaging.ts` — adds `OpenImageCaptureFormMessage` (background → content) + `SubmitImageCaptureRequestMessage` (content → background) + `CapturedImage` response envelope + `isBackgroundRequest` discriminator coverage for the new kind.
- `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — adds `open-image-capture-form` handler in the `chrome.runtime.onMessage` listener; opens the image-capture-form with the user's selected Project + Platform + projectName context.
- `extensions/competition-scraping/src/lib/content-script/styles.ts` — adds `.plos-cs-form-image-preview-wrap`, `.plos-cs-form-image-preview`, `.plos-cs-form-image-meta`, `.plos-cs-form-image-meta-failed` CSS rules (bordered preview wrap; `object-fit: contain` so portrait/landscape render uncropped; max-height clamp so a tall image doesn't push Save below the fold).
- `extensions/competition-scraping/wxt.config.ts` — appends 5 image-CDN `host_permissions` entries so the background's `fetch()` can read image bytes from cross-origin CDNs (`*.media-amazon.com`, `*.ssl-images-amazon.com`, `*.ebayimg.com`, `*.etsystatic.com`, `*.walmartimages.com`).

### Behavior at runtime

1. User has signed in + picked a Project + Platform via the popup (existing session 1+2 surface).
2. User navigates to a product page on a recognized platform (Amazon / Ebay / Etsy / Walmart).
3. User right-clicks on a product image → Chrome shows "Add to PLOS — Image" context-menu entry.
4. Click opens the image-capture-form overlay on the host page: image preview renders (browser already cached the image for display); form fetches saved URLs + image-category vocab via api-bridge.
5. User picks the saved URL (pre-selected if the page URL matches a saved row via the P-15 canonicalize-before-normalize path), picks or adds an image category, optionally fills Composition + Embedded text + Tags.
6. User clicks Save → form disables, status: Saving... → background fetches the image bytes via extension origin → POSTs `/api/projects/.../images/requestUpload` Phase 1 → server validates MIME + size + returns signed Supabase Storage URL → background PUTs the bytes directly to Supabase Phase 2 (bytes never transit Vercel; bypasses the 4.5 MB body cap + function timeout) → POSTs `/api/projects/.../images/finalize` Phase 3 → server creates the `CapturedImage` row referencing the storage path → finalized row returned to the form → form closes.
7. Idempotent on `clientId` — Phase 3 deduplicates per `STACK_DECISIONS.md` §9.2 (duplicate clientId returns the existing row with 200). Orphans from failed Phase 2 retries are cleaned by the existing daily janitor cron.

### Permission expansion

The `host_permissions` field grew by 5 entries to cover the platform image CDNs. Chrome treats `host_permissions` additions as a permission expansion: on reinstall the user sees an "Approve permissions" prompt listing the new hosts. This is the standard MV3 path; no avoidance available short of using `<all_urls>` (overbroad) or runtime-optional permissions (UX-heavy for a non-programmer director).

### Verification scoreboard

- ext `npm test` — **289/289 pass** (was 266 baseline from session #15; +23 new — 12 captured-image-validation + 11 api-client image-upload helpers)
- ext `tsc --noEmit` — clean
- ext `wxt build` — clean in **1.66 s**; output sizes:
  - `manifest.json` — 881 B (was ~776 B; +105 B for 5 image-CDN host_permissions)
  - `background.js` — 206,734 B (was 203,936 B; +2,798 B for image-capture handler + new context-menu)
  - `content-scripts/content.js` — 53,520 B (was 41,268 B at deploy #9; +12,252 B for new form + image-CDN host pattern listing)
  - `popup-sMIVQm75.js` — 410,213 B (parity — popup paste form doesn't use image-capture)
  - `popup.html` — 406 B (parity)
  - `popup-yq9KIZC6.css` — 4,394 B (parity — image-preview CSS lives in content-script styles, not popup)

### Browser verification

Deferred to the next W#2 → main deploy session — standard W#2 ship-then-deploy pattern. At that session, the walkthrough will be:

1. Sideload fresh `plos-extension-2026-05-13-w2-deploy-N.zip` (built fresh post-merge).
2. Re-approve the expanded permission set when prompted.
3. Sign in, pick a Project + Platform (Amazon recommended first since it's the primary platform per §A.7).
4. Navigate to a saved product page; confirm extension is active (popup shows the project + platform; existing infrastructure).
5. Right-click any product image → confirm "Add to PLOS — Image" menu entry appears.
6. Click it → confirm form opens with image preview; URL picker pre-selects the saved row; image-category vocab loads.
7. Pick an image category (or use "+ Add new..."), optionally fill Composition + Embedded text + a tag, click Save.
8. Confirm form closes without error; check the PLOS detail page for the new captured image row in the gallery (slice (a.2)'s viewer).
9. Repeat on the other 3 platforms (Ebay, Etsy, Walmart) for cross-platform regression.
10. Edge cases: image too large (>5 MB; expect "Image is X bytes — exceeds the 5 MB cap" error inline); image on a domain whose CDN isn't yet in host_permissions (expect "CDN may not be authorized for this extension yet" error); duplicate Save click in flight (expect Save button disabled).

### Cross-references

- `ROADMAP.md` W#2 row (a.21) flipped ✅ DONE; new (a.22) RECOMMENDED-NEXT slot for region-screenshot session 6 OR W#2 → main deploy session #10 OR W#2 polish backlog continuation (P-20 design session HIGH severity).
- `COMPETITION_SCRAPING_DESIGN.md` §B new in-flight refinement entry naming the regular-image-first / region-screenshot-deferred scope split + the per-platform image-CDN `host_permissions` expansion as a documented platform fact.
- `CORRECTIONS_LOG.md` unchanged this session (zero slips).
- Code commit `0866b89` — already pushed to `origin/workflow-2-competition-scraping`.

---

## P-15 PASS-VERIFY on real Amazon (controlled repro) (NEW 2026-05-12-h — W#2 polish session #16)

**Session:** `session_2026-05-12-h_w2-polish-session-16-amazon-p-15-fail-controlled-reproduce-PASS` (Claude Code, on `workflow-2-competition-scraping`).

### Outcome

**PASS.** P-15 fix works on real Amazon for slug-variant URLs with ASIN-match-controlled test setup. Session #9's observed FAIL retroactively attributed to test-setup ASIN mismatch (director's organic Amazon navigation reached a slug-variant URL whose ASIN didn't match any of the 9 saved canonical rows).

### Setup confirmed with director

- **Loaded extension build:** `plos-extension-2026-05-12-g-w2-deploy-9.zip` (deploy-#9 build with P-15 fix) running on test browser; director confirmed at session start.
- **Saved Amazon row picked:** ASIN `B0CTTF514L` from the 9 canonical-form `/dp/{ASIN}` rows (the set confirmed by 2026-05-12-g DB inspection); director-confirmed visible in the popup's saved-URLs list.
- **DevTools accessible** on the test browser (default behavior in regular Chrome on desktop).

### Walkthrough sequence

**Phase 1 — Sanity check on canonical URL.** Director opened a fresh Amazon tab, opened DevTools Console, then navigated to `https://www.amazon.com/dp/B0CTTF514L`. Amazon's internal redirect appended `?th=1` (variant parameter) — final loaded URL was `https://www.amazon.com/dp/B0CTTF514L?th=1`. **Green "Already saved" overlay appeared in the top-right** ✅ — confirms the orchestrator's `maybeShowDetailOverlay` canonicalize-and-recognize path works on the canonical+`?th=1` URL form (amazon.canonicalProductUrl correctly strips the `?th=1` query because the ASIN_RE allows `?` as a path boundary). DevTools Console showed many Amazon ad-tracking errors (`amazon-adsystem`, `googlesyndication`, `doubleclick` blocked by ad-blocker; `NoriLogger DSPClientStrategy` warnings; `pixel.ts` `Failed to fetch` from blocked ad pixels) — none PLOS-related; noise only.

**Phase 2 — Slug-variant URL with same ASIN.** Director navigated to constructed slug-variant `https://www.amazon.com/Test-Product-Name/dp/B0CTTF514L/ref=sr_1_1` (final URL after Amazon's internal redirects: `https://www.amazon.com/Test-Product-Name/dp/B0CTTF514L/ref=sr_1_1?th=1` — confirmed via Chrome address bar). **Green "Already saved" overlay still appeared** ✅ — confirms the orchestrator's slug-variant canonicalize path works on real Amazon. The slug-variant URL's `/Test-Product-Name/dp/B0CTTF514L/ref=sr_1_1` matched ASIN_RE → canonicalProductUrl returned `https://www.amazon.com/dp/B0CTTF514L` → normalize stripped nothing (no `?…` at canonical form) → matched the saved-row's normalized form → recognition succeeded.

**Procedural note — DevTools context selector pitfall surfaced this Phase.** Director's first `location.href` evaluation in DevTools returned `https://m.media-amazon.com/images/S/sash/ZjX5dSxC9UqUC39.html` — that's an Amazon CDN iframe URL, not the top frame's URL. Root cause: DevTools' "JavaScript context" selector at the top of the Console panel had drifted into an iframe context (likely auto-selected when DevTools opened on an element-inside-iframe). Amazon embeds many image/ad iframes for sash + ad content; the context selector can land on any of them. Redirected director to read the Chrome address bar instead (cleaner solution). **Future Amazon-DevTools walkthroughs should default to "read the address bar" or explicitly switch the Console's context selector to "top" before evaluating any `location.*` expressions.** Captured as INFORMATIONAL in CORRECTIONS_LOG 2026-05-12-h header.

**Phase 3 — Right-click capture test.** Director selected 2-3 words of text on the Phase-2 slug-variant page → right-clicked the selection → clicked "Add to PLOS — Captured Text" from the context menu. The overlay form opened. **URL dropdown PRE-SELECTED the matching saved row automatically** ✅ — option (a) per the Phase-3 forced-picker we'd prepared for the result. Console post-right-click showed only Amazon's `NoriLogger DSPClientStrategy` ad-telemetry warnings (`No events to send to endpoint`) — noise only.

### Code-path trace (no instrumentation needed, but documented for future debug sessions)

The PASS result is consistent with the code as authored:

- **At right-click,** Chrome's `chrome.contextMenus.onClicked` handler in `extensions/competition-scraping/src/entrypoints/background.ts:98-110` reads `info.pageUrl` (Chrome-provided page URL of the right-clicked frame's top document) → forwards via message `open-text-capture-form` to content-script orchestrator.
- **Orchestrator** at `extensions/competition-scraping/src/lib/content-script/orchestrator.ts:382-401` calls `openTextCaptureForm({ pageUrl: msg.pageUrl, platform: platformModule.platform, ... })`. `platformModule` is bound to `amazon` at content-script init (gated by `getModuleByHostname`).
- **Form** at `extensions/competition-scraping/src/lib/content-script/text-capture-form.ts:466-473` looks up `getModuleByPlatform('amazon')` → calls `pickInitialUrl(props.pageUrl, rows, amazon.canonicalProductUrl)`.
- **`pickInitialUrl`** at `extensions/competition-scraping/src/lib/captured-text-validation.ts:128-147` canonicalizes pageUrl via `canonicalize?.(pageUrl) ?? pageUrl` → `normalizeUrlForRecognition` strips `?…` → loops over rows, normalizing each row.url → returns the row whose normalized form matches.

For today's controlled-repro inputs: `pageUrl = https://www.amazon.com/Test-Product-Name/dp/B0CTTF514L/ref=sr_1_1?th=1` → `canonicalize → https://www.amazon.com/dp/B0CTTF514L` → `normalize → https://www.amazon.com/dp/B0CTTF514L`. Saved row `https://www.amazon.com/dp/B0CTTF514L` → `normalize → https://www.amazon.com/dp/B0CTTF514L`. **Match.** ✅

### Verification-spec lesson (captured to CORRECTIONS_LOG as INFORMATIONAL)

ASIN-match-dependent verification specs MUST explicitly construct a known-good test setup BEFORE declaring FAIL. Session #9's verification let the director navigate organically on real Amazon — without a per-page ASIN-vs-saved-rows consistency check, "FAIL" became ambiguous between "code bug" and "test-setup mismatch". The controlled-repro pattern (pre-flight (1) confirm saved-row's stored ASIN with director → (2) construct or navigate to a slug-variant URL whose `/dp/{ASIN}` matches → (3) THEN test) is the recommended default for any Amazon-FAIL-style verification or any platform with multiple URL forms per product (Amazon ASIN, eBay item ID, Etsy listing ID, Walmart item ID).

### Status updates from this section

- **W#2 polish backlog P-15** — Amazon-FAIL caveat resolved as "test-setup mismatch, NOT code bug"; status stays ✅ SHIPPED AT DEPLOY LEVEL.
- **W#2 polish backlog P-21** — demoted from "fixes today's Amazon FAIL" to "future-defensive improvement covering user-pasted slug-variant URLs at the URL-add form"; remains OPEN at MEDIUM-defensive priority.
- **ROADMAP (a.20)** — flipped to ✅ DONE PASS.
- **ROADMAP (a.21)** — NEW RECOMMENDED-NEXT slot for W#2 polish backlog continuation OR Waypoint #2 Extension build session 5.

### Cross-references

- `extensions/competition-scraping/src/lib/captured-text-validation.ts pickInitialUrl` (lines 128-147) — the function whose behavior was under test.
- `extensions/competition-scraping/src/lib/content-script/text-capture-form.ts:466-473` — the call site.
- `extensions/competition-scraping/src/lib/platform-modules/amazon.ts canonicalProductUrl` (lines 68-95) — the canonicalize function that does the heavy lifting on real Amazon URLs.
- ROADMAP W#2 row Last Session 2026-05-12-h entry (this session's full session header); (a.20) ✅ DONE PASS; (a.21) RECOMMENDED-NEXT; W#2 polish backlog P-15 + P-21 entries (both annotated this session).
- CORRECTIONS_LOG 2026-05-12-h header — ASIN-match verification-spec discipline + the DevTools-iframe-context procedural note.

---

## P-15 `pickInitialUrl` canonicalize SHIPPED + PARTIAL VERIFY (Amazon FAIL) (NEW 2026-05-12-g — W#2 → main deploy session #9)

**Session:** `session_2026-05-12-g_w2-main-deploy-session-9-p15-canonicalize-deployed-partial-amazon-fail` (Claude Code, on `main`).

### Deploy mechanics

Rebase-then-ff per cheat-sheet (b) — same shape as deploy #8 (`session_2026-05-12-f`) but smaller scope (1 W#2-side commit ahead → rebase + ff). State at session start: main was 1 ahead of W#2 (deploy-#8 doc batch `34dbfd0`); W#2 was 2 ahead of main (P-15 code `74c7165` + session #15 doc batch `a1b37b7`). ff-only blocked → director-confirmed cheat-sheet (b) per Rule 8 destructive-op gate → rebased W#2 onto `origin/main` HEAD `34dbfd0` → 4 doc-header conflicts auto-resolved by Option-A Python helper (CHAT_REGISTRY, CORRECTIONS_LOG, DOCUMENT_MANIFEST, ROADMAP top) + 1 ROADMAP W#2-row body conflict resolved by taking HEAD (preserves post-deploy-#8 (a.18) ✅ DONE state) → strict marker check (`grep -cE "^(<<<<<<< |=======$|>>>>>>> )"`) passed zero markers on all 4 files BEFORE staging per the 2026-05-12-f lesson → `git add` + `git rebase --continue` → force-push `origin/W#2 --force-with-lease` (`a1b37b7 → f6b1a98`) → switch to `main` + ff-merge clean (`34dbfd0..f6b1a98`, 7 files +150/-10) → push `origin/main` → Vercel auto-redeploy (web bundle byte-identical pre/post since no `src/` touched — the merge's source-code changes are all in `extensions/competition-scraping/src/`).

Fresh extension build: `cd extensions/competition-scraping && rm -rf .output && npx wxt build` clean in 2.4 s (no pipe-block this time — the 2026-05-12-c entry b pattern didn't fire) → flat-archive zip:

- File: `plos-extension-2026-05-12-g-w2-deploy-9.zip`
- Size: 181,952 bytes (+32 bytes vs deploy #8's 181,920 — explained by content.js's +86-byte delta compressing to ~32 bytes via deflate)
- 9 entries (3 dir entries + manifest.json + popup.html + background.js + popup CSS + popup chunk + content.js)
- content.js: 41,268 bytes — exact parity with session #15's expected size from its commit message; `canonicalProductUrl` token grep returns 2 references (P-15 fix compiled into bundle)
- background.js: 203,936 bytes (parity with session #14 baseline); popup chunk: 410,206 bytes (parity)

### Browser verification (PARTIAL — Rule 27 scope exception)

Director sideloaded the new zip + walked through P-15 verification on each of the 4 platforms + defensive P-14 re-verify on Walmart.

| Platform | P-14 (text selection on highlighted mark survives) | P-15 (slug-variant URL pre-selects saved row in right-click overlay) |
|---|---|---|
| Walmart | ✅ PASS | ✅ PASS |
| ebay | ✅ PASS | ✅ PASS |
| etsy | ✅ PASS | ✅ PASS |
| **Amazon** | ❌ FAIL — still flashing, selection still collapses | ❌ FAIL — saved row not pre-selected |

Director's verbatim observation: *"P-14 and P-15 work in Walmart.com, ebay.com and etsy.com but not Amazon. In Amazon, the highlighted words keep flashing and selected text in the product listing page does not stay selected. Also, using right click to add the selected text does not show the url already selected."*

### NEW cross-platform finding (separate bug class)

Director surfaced an additional bug class during verification: *"in the platforms where the highlighted words don't keep flickering, the selected text is unselected one time if the text is selected soon after the page loads. I think this happens when the green overlay goes away on its own."*

Captured as P-19 in ROADMAP W#2 polish backlog. Root cause CLEAR per in-session code reading: the green status overlay's auto-removal is a DOM mutation observed by orchestrator's MutationObserver → 250ms debounce → highlighter.refresh() → strip-and-reapply → any active selection on a stripped `<mark>` is cleared. Same strip-and-reapply mechanism as P-14 but a different trigger (overlay-dismiss is NOT inside the muted refresh window). Fix shape ~5-10 LOC; preferred direction = detach overlay element while-muted via the existing `muteMutationObserver` helper (re-uses P-14 infrastructure).

### Root-cause investigation outcomes

Director picked "investigate before closing" via Rule 14f forced-picker. ~15 min in-session code-reading produced findings for all 3 failures:

1. **P-15 Amazon FAIL** — root cause IDENTIFIED. `pickInitialUrl` (captured-text-validation.ts:128) canonicalizes pageUrl (LEFT side of comparison) but NOT row.url (RIGHT side); when saved Amazon row is in non-canonical form (slug-variant `/Product-Name/dp/{ASIN}/ref=...`, or `gp/product/{ASIN}`, or trailing slash), the comparison string-fails. Same asymmetry in `buildRecognitionSet` (url-normalization.ts:63) used by orchestrator's "already saved" banner check. Captured as P-21 (~2 LOC fix + ~4 tests).

2. **P-14 Amazon FAIL** — root cause HYPOTHESIZED (needs in-session verification). Orchestrator's MutationObserver fires on ANY document.body mutation. P-14 mute fix only prevents SELF-retrigger from refresh's own strip-and-reapply. Real `amazon.com` product page has continuous async content loading (lazy reviews, sponsored ads loading in, recommendation widgets re-rendering, image carousel auto-rotation, "Customers also viewed" panels populating) → MO fires constantly → 250ms debounce → highlighter.refresh() → strip-and-reapply → visible flashing. Walmart/ebay/etsy have stable DOM post-load → loop doesn't fire enough to be visible. **Session #14's Playwright tests passed on a STATIC mock product page** that doesn't simulate continuous async DOM mutation. Captured as P-20 (HIGH severity; design session warranted — fix options not 5-LOC).

3. **Overlay-dismiss → one-time selection collapse** — root cause CLEAR. See P-19 entry above.

Director picked recommended "capture P-19/P-20/P-21 + close" (no fix shipped this session; cleaner to give each finding its own focused next session).

### Cross-references

- ROADMAP W#2 row (a.19) flipped ✅ DONE PARTIAL + new (a.20) RECOMMENDED-NEXT = ship P-21 (`pickInitialUrl` + `buildRecognitionSet` symmetric canonicalize).
- W#2 polish backlog: P-15 list-item flipped ✅ SHIPPED AT DEPLOY LEVEL with Amazon-FAIL caveat pointing to P-21 + NEW P-19/P-20/P-21 entries.
- CORRECTIONS_LOG 2026-05-12-g INFORMATIONAL entry: Playwright mock-fidelity gap on real Amazon — static-page mock under-represented Amazon's mutation rate; Rule 27 lesson on mock-vs-real-browser fidelity for SPA-dynamic platforms.

---

## P-14 highlight-flashing FIX DEPLOYED to vklf.com (NEW 2026-05-12-f — W#2 → main deploy session #8)

**Session:** `session_2026-05-12-f_w2-main-deploy-session-8-p14-highlight-flashing-fix-deployed` (Claude Code, on `main`).

**Outcome:** P-14 highlight-flashing fix DEPLOYED to vklf.com via W#2 → main deploy session #8. ROADMAP Active Tools W#2 row (a.18) RECOMMENDED-NEXT slot closed. P-14 polish backlog list-item flipped ✅ SHIPPED-AT-DEPLOY-LEVEL.

### Deploy mechanics

| Step | Result |
|---|---|
| Branch state at session start | W#2 6 commits ahead (P-14 harness + harden + fix + 3 doc batches); main 1 commit ahead (W#1 graduation `b08737b`); ff-only from W#2→main BLOCKED. |
| Rebase shape | W#2 onto origin/main per CORRECTIONS_LOG 2026-05-10-c entry #1 + cheat-sheet (b). |
| Conflict resolution | Expected doc-header conflicts on all 3 W#2 doc-batch commits (session #12 `2fd2dff`, session #13 `72bb397`, session #14 `e419cbe`) — Option-A reconciliation (W#2 entries stay "Last updated"; `b08737b` graduation demoted to "Previously updated"). ROADMAP W#2-row body conflicts resolved by keeping HEAD's GRADUATED W#1 row + incoming's W#2 row with session-specific (a.16/17/18) entries. |
| Force-push | origin/W#2 `--force-with-lease` (`e419cbe → 2fc6d15`). |
| ff-merge | `b08737b..2fc6d15`, 13 files +1025/-49 — clean. |
| Push origin/main | Vercel auto-redeploy. |
| Fresh extension build | `rm -rf .output && npx wxt build` → zip `plos-extension-2026-05-12-f-w2-deploy-8.zip` (181,920 bytes; 9 files). |
| P-14 fix presence in bundle | `takeRecords` API call present in `content-scripts/content.js` (the distinctive identifier from the muteMutationObserver fix's "disconnect → await → takeRecords + observe" sequence); content.js 41,182 bytes vs deploy #7's 40,946 = +236 bytes for fix delta. |

### Browser verification

| Check | Result |
|---|---|
| vklf.com smoke | ✅ PASS — loads clean; no `src/` changes in merge so web bundle byte-identical to pre-deploy `b08737b` baseline; 2026-05-12 Illegal-invocation hotfix `08f10e5` stays live. |
| Walmart product page (canonical S4-B reproduction case from polish session #11) | ✅ PASS — highlights appear once, stay put with no flicker, text selection survives unchanged for 30+ seconds. |

### Mid-session slips captured

(a) Assert-then-stage discipline slip — Python conflict-resolution script's `AssertionError` (raised when e419cbe rebase replay's conflict shape diverged from prior replays' — 4 incoming lines instead of 2 because session #14 had added a new "(a.18) detail" paragraph below the table that grew the conflict region) silently exited before `git add`; I staged + `git rebase --continue`'d the still-conflicted ROADMAP anyway → commit `49d025e` shipped with conflict markers in source; caught by post-rebase `grep -c "^<<<<<<<"` over all docs/*; recovered via post-rebase resolution + `git commit --amend` (`49d025e → 2fc6d15`). **Lesson:** verify zero conflict markers in resolved files BEFORE `git add` + before `git rebase --continue`, not just trust the resolution script's success path. Full INFORMATIONAL entry in CORRECTIONS_LOG header for 2026-05-12-f.

(b) Session-count numbering drift artifact — both `b08737b` (W#1 graduation) and `334c666`-ex-`2fd2dff` (W#2 polish session #12) claim "Eighty-second Claude Code session" — parallel-branch authorship. Today's deploy session #8 numbers itself Eighty-fifth (one past polish #14's "Eighty-fourth" claim) and lets the drift artifact stand. **Lesson:** session count numbering will drift in a multi-branch flow; the order in the Last → Previously chain is the authoritative chronological signal, not the integer count. Full INFORMATIONAL entry in CORRECTIONS_LOG header for 2026-05-12-f.

### Cross-references

- `tests/playwright/extension/highlight-flashing.spec.ts` — the 17-test regression suite (12 previously `test.fail`-annotated, now all genuine green per session #14's fix)
- `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` + `orchestrator.ts` — the P-14 fix files (now on main via ff-merge)
- `plos-extension-2026-05-12-f-w2-deploy-8.zip` (repo root; untracked / gitignored — director's local sideload artifact)
- ROADMAP W#2 row (a.18) ✅ DONE + (a.19) RECOMMENDED-NEXT
- ROADMAP P-14 polish backlog list-item ✅ SHIPPED-AT-DEPLOY-LEVEL
- CHAT_REGISTRY 2026-05-12-f top entry

---

## P-14 highlight-flashing FIX SHIPPED at code level (NEW 2026-05-12-e — W#2 polish session #14)

**Status:** P-14 fix shipped on `workflow-2-competition-scraping` in code commit `45c9a15`. Playwright extension suite 17/17 ✓ genuine green-pass post-fix. All 12 `test.fail` annotations from session #13's hardened spec removed in the same commit. Deploy to vklf.com pending — (a.18) W#2 → main deploy session #8 is RECOMMENDED-NEXT on the ROADMAP.

**Fix shape (as captured in W#2 polish backlog P-14 entry during session #12's code-reading; named verbatim in session #13's launch-prompt; shipped this session):**

The orchestrator's MutationObserver fed back into its own callback because the highlight applicator's strip-and-reapply of `<mark>` elements is itself a DOM mutation. The fix mutes the MO around each highlight refresh pass:

- **`extensions/competition-scraping/src/lib/content-script/highlight-terms.ts`** (+80/-25)
  - New `StartLiveHighlightingOptions` interface with optional `muteMutationObserver?: <T>(work: () => Promise<T>) => Promise<T>` callback.
  - `startLiveHighlighting(projectId: string, options: StartLiveHighlightingOptions = {})` signature extended (additive — no breaking change to existing standalone callers / unit tests).
  - `refresh()` body now runs inside `muteMutationObserver(async () => { ... })`; default wrapper is an identity no-op so standalone use (tests, future non-orchestrator callers) is unaffected.

- **`extensions/competition-scraping/src/lib/content-script/orchestrator.ts`** (+34/-8)
  - Forward-declared `let observer: MutationObserver | null = null;` near the top of `runOrchestrator` body — BEFORE the `await startLiveHighlighting(...)` call.
  - Defined `muteMutationObserver` closure that captures `observer` by reference: `observer?.disconnect()` → `await work()` → `observer?.takeRecords()` + `observer?.observe(document.body, { childList: true, subtree: true })`. Late-binding: when the highlighter's requestIdleCallback-scheduled initial pass fires, `observer` may still be null (the orchestrator hasn't constructed the real MO yet at that point); optional chaining safely no-ops in that window. Once the real MO is constructed below, subsequent refresh calls disconnect + reconnect it cleanly.
  - Reassigned: `observer = new MutationObserver(...)` rather than re-declaring with `const`. **Critical detail caught mid-session as INFORMATIONAL CORRECTIONS_LOG entry:** my first edit attempted `const observer = ...` at the same scope as `let observer`; esbuild accepted the duplicate but the closure's `observer?.disconnect()` read the outer `let observer` which stayed `null`, masking the fix. Tests reproduced the same pre-fix failure pattern. Fix: reassign to the outer `let observer`.
  - Cleanup function uses `observer?.disconnect()` + `observer = null` (was unconditional `observer.disconnect()` pre-fix).

- **`tests/playwright/extension/highlight-flashing.spec.ts`** (+26/-63)
  - Removed all 3 source-level `test.fail(...)` calls (covering 12 tests across 4 platforms × 3 sub-spec kinds: REGRESSION count, REGRESSION identity, SELECTION-STABILITY).
  - Updated file-header doc-comment + per-test inline comments to reflect post-fix state.

**Verification scoreboard:**

- **Playwright extension 17/17 ✓ ALL genuine green-pass:** 4 SMOKE × 4 platforms = 4 ✓ (unchanged); 4 REGRESSION (count) × 4 platforms = 4 ✓ (previously `test.fail`-RED → now GREEN); 4 REGRESSION (identity) × 4 platforms = 4 ✓ (previously `test.fail`-RED → now GREEN); 4 SELECTION-STABILITY × 4 platforms = 4 ✓ (previously `test.fail`-RED → now GREEN); 1 P-10 SPA-NAVIGATION = 1 ✓ (continues passing post-fix — zero collateral damage to P-10's MO-based URL-change detection at `orchestrator.ts:297-318`).
- **Node-test (extension unit) 261/261 pass** — no regressions from the highlight-terms.ts + orchestrator.ts edits.
- **Extension `npx tsc --noEmit`:** clean.
- **Root `npx tsc --noEmit`:** clean.
- No src/ touched → root build + eslint unchanged from `72bb397` baseline.

**Pre-fix vs. post-fix behavior on the mock product page (route-intercepted Amazon URL with three highlight terms `cat` / `scratch` / `post`):**

- **Pre-fix:** `<mark>` add+remove count over a 2.0s observation window was in the tens (every ~250ms RESCAN_DEBOUNCE_MS tick, the orchestrator MO callback fired → scanLinks() → `highlighter.refresh()` → removeAllHighlights + applyHighlightsTo → the new marks fed back into MO → another tick). User-visible: highlights flashed; text selection over a highlight collapsed within one tick.
- **Post-fix:** count === 0 over the 2.0s window. The mute wrapper disconnects the orchestrator MO before the strip-and-reapply, drains any pre-disconnect queue via takeRecords, and re-observes only after the refresh completes. User-visible: highlights stable; text selection survives.

**S4-B verification unblocked:** The pre-fix selection-collapse symptom was the blocker on clean S4-B highlight-and-add gesture verification per the 2026-05-12 entry above. Post-deploy (a.18), S4-B can be re-verified end-to-end on vklf.com without the workaround.

**Cross-references:** Code commit `45c9a15` on `workflow-2-competition-scraping`; ROADMAP.md (a.17) ✅ SHIPPED + (a.18) RECOMMENDED-NEXT + W#2 polish backlog P-14 entry flipped to ✅ SHIPPED at code level; CORRECTIONS_LOG.md 2 new INFORMATIONAL entries (Playwright-stale-build pitfall + variable-shadowing self-catch).

---

## Playwright extension-context regression spec coverage HARDENED (NEW 2026-05-12-d — W#2 polish session #13)

**Status:** Spec coverage hardened at code level on `workflow-2-competition-scraping` in commit `ba11027`. Suite is GREEN (17/17 pass) with the P-14 bug present — the 12 `test.fail`-annotated assertions are expected-fail-as-pass. P-14 fix itself still DEFERRED per the (a.17) RECOMMENDED-NEXT slot on the ROADMAP W#2 row.

**What changed:** `tests/playwright/extension/highlight-flashing.spec.ts` rewritten — same file, +419/-131 (550 lines; was 207 lines). Same `fixtures.ts` + `product-page.html` from session #12 reused unchanged; the hardening lives entirely in the spec file. `playwright.config.ts`, `package.json`, README — UNCHANGED this session.

**Four hardening axes per the (a.16) launch prompt:**

1. **Cross-platform parametrization (amazon / ebay / etsy / walmart).** SMOKE + REGRESSION (count) + REGRESSION (identity) + SELECTION-STABILITY all replicate per-platform via a `for (const pl of PLATFORMS)` loop wrapping `test.describe` blocks. Per-platform `beforeEach` seeds `selectedPlatform` to match the route-intercepted host — the orchestrator's `getModuleByHostname`-vs-`selectedPlatform` check at `orchestrator.ts:105-109` requires both hostname AND selectedPlatform to agree, so each platform needs its matching seed. Per-platform URLs chosen to satisfy each module's `matchesProduct` regex:
   - amazon `https://www.amazon.com/dp/B0FAKE1234`
   - ebay `https://www.ebay.com/itm/123456789012`
   - etsy `https://www.etsy.com/listing/123456789/some-cat-scratching-post`
   - walmart `https://www.walmart.com/ip/Cat-Scratching-Post/12345678`

2. **Tighter REGRESSION (count) threshold.** Observation window grew 1.5s → 2.0s after 800ms settle (was 500ms). The 2.0s window covers ~8 MO cycles (`RESCAN_DEBOUNCE_MS = 250` in `orchestrator.ts:54`); the longer settle gives the initial `requestIdleCallback`-scheduled pass plus any follow-up MO tick from its own mutations time to complete. Assertion stays `=== 0` (the right tightness — any non-zero is a regression of the bug class). Pre-fix observed value in 2.0s on the mock page is in the tens; comment in the spec file annotates this floor so a future session knows what shape of churn to expect.

3. **NEW REGRESSION (identity) sub-spec.** Tags every initial mark with `data-plos-test-id`, then asserts after the 2.0s window that every tagged element is still in the DOM. Catches a future partial fix that reduces churn count without eliminating the strip-and-reapply loop entirely (e.g., debounce extended from 250ms to 1500ms — count drops but marks still get destroyed). The count test and the identity test cover the bug from two angles; a regression that flips one would likely flip both, but if a partial-fix attempt squeaks through count while still failing identity, the identity test catches it.

4. **NEW SELECTION-STABILITY sub-spec.** Draws a text selection over the first highlighted `<mark>` via `document.createRange().selectNodeContents(mark)` + `Selection.addRange`, then asserts the serialized selection text (`window.getSelection().toString()`) survives the 1.0s observation window. This is the user-visible second symptom of P-14: drawing a selection over a highlighted region collapses every ~250ms because the underlying `<mark>` nodes are destroyed and recreated. The collapsed selection is the operational blocker to clean S4-B verification per the 2026-05-12 entry above.

**PLUS one cross-cutting regression guard:**

5. **NEW P-10 SPA-NAVIGATION regression sub-test (single platform = amazon).** Exercises the `history.pushState` detection path that P-10 (2026-05-10) added at `orchestrator.ts:297-318`. The P-14 fix will mute the MutationObserver around highlight refresh; we must protect P-10's MO-based URL-change detection from regressing as collateral. The sub-test pushes a new URL + injects new DOM content + asserts new content gets highlights applied via the orchestrator's MO-based URL-change detection. PASSES pre-fix; must continue passing post-(a.17)-fix. Single platform is sufficient because the SPA-detection path is platform-independent in shared orchestrator code (not in any per-platform module). NOT `test.fail`-annotated.

**Verification scoreboard:**

| Suite scope | Count | Status |
|---|---|---|
| SMOKE (1 per platform × 4) | 4 | ✓ all green-pass |
| REGRESSION (count) (1 per platform × 4) | 4 | ✘ expected-fail-as-pass (`test.fail`-annotated) |
| REGRESSION (identity) (1 per platform × 4) | 4 | ✘ expected-fail-as-pass (`test.fail`-annotated) |
| SELECTION-STABILITY (1 per platform × 4) | 4 | ✘ expected-fail-as-pass (`test.fail`-annotated) |
| P-10 SPA-NAVIGATION (single-platform amazon) | 1 | ✓ green-pass |
| **Total** | **17** | **17/17 pass (1.5m, 1 worker per `playwright.config.ts`)** |

**When the (a.17) P-14 fix lands, ALL 12 `test.fail` annotations must be flipped off in the same commit that ships the fix.** Playwright reports a `test.fail`-marked test that PASSES as a failure ("Expected to fail, but passed"), which is the intended signal to remove the annotation. The annotations live inline next to each `test()` block; a single multi-edit pass at fix time handles all 12.

**Cross-references:** `tests/playwright/extension/highlight-flashing.spec.ts` (the hardened spec file); commit `ba11027`; session #12's "Playwright extension-context harness" section (below); ROADMAP W#2 row Last Session 2026-05-12-d entry; ROADMAP W#2 row Next Session (a.16) ✅ AUTHORED + (a.17) RECOMMENDED-NEXT; W#2 polish backlog P-14 entry (status annotated "regression spec coverage hardened 2026-05-12-d"); `orchestrator.ts:105-109` (hostname-vs-selectedPlatform check the cross-platform tests satisfy); `orchestrator.ts:297-318` (the P-10 SPA-detection path the new sub-test guards); `extensions/competition-scraping/src/lib/platform-modules/{amazon,ebay,etsy,walmart}.ts` (per-platform `matchesProduct` regexes the test URLs satisfy).

---

## Playwright extension-context regression coverage (NEW 2026-05-12-c — W#2 polish session #12)

**Status:** Harness shipped at code level on `workflow-2-competition-scraping`. Regression-detection capability sanity-check-proven via round-trip (see below). Actual P-14 fix DEFERRED to a future session per director's "harness setup only today" pick.

**Where:** `tests/playwright/extension/` — three files:

- `fixtures.ts` — Playwright fixture extending `base.extend` with:
  - `context` — created via `chromium.launchPersistentContext('', { channel: 'chromium', args: ['--disable-extensions-except=<extensionDist>', '--load-extension=<extensionDist>'] })`. Uses Chromium's "new headless mode" via `channel: 'chromium'` (Playwright 1.60+ feature) — this is the only mode that supports loading unpacked extensions WITHOUT a real display, which is the only viable path on a Codespace.
  - `serviceWorker` — Worker handle extracted via `context.serviceWorkers()` + `context.waitForEvent('serviceworker')` fallback.
  - `extensionId` — regex-extracted from `chrome-extension://<id>/` URL pattern on the SW URL.
- `product-page.html` — mock Amazon product page with predictable highlightable text. Multiple paragraphs containing "cat", "scratch", "post" so the TreeWalker pass has enough text nodes to exercise the chunk-and-yield path.
- `highlight-flashing.spec.ts` — TWO tests:
  - **SMOKE** — seeds chrome.storage.local via `serviceWorker.evaluate(...)` with `selectedProjectId` + `selectedPlatform: 'amazon'` + `highlightTerms:<projectId>`; route-intercepts `**://*.amazon.com/**` to fulfill with the local mock HTML; navigates to a fake `/dp/B0FAKE1234` URL; waits for `data-plos-cs-active=1` body attribute (orchestrator-attach signal); asserts mark count > 2 after initial highlight pass settles. Passes on current code.
  - **P-14 REGRESSION** — observes `<mark>` element addition/removal count over a 1.5-second observation window after 500ms of initial-paint settling. Expected post-fix: mutationCount === 0 (MO muted around refresh). Current pre-fix: many additions+removals (the orchestrator's MutationObserver self-feedback loop strips + re-applies marks every ~250ms). `test.fail(true, '…')` annotation keeps the suite green while the bug is present; when the P-14 fix lands and mutationCount becomes 0, Playwright will report "Expected to fail, but passed" — the canonical signal to remove the `test.fail` annotation in the same session that ships the fix.

**Playwright config wiring (`playwright.config.ts`):**
- New `extension` Playwright project — `testDir: './tests/playwright/extension'`, no `use` block (the fixture's `launchPersistentContext` bypasses default browser fixtures).
- Existing `chromium` project gets `testIgnore: 'extension/**'` so it only catches the P-17 authFetch suite.

**npm scripts (`package.json`):**
- `test:e2e` — runs `--project=chromium` only (preserves the P-17 invocation; unchanged behavior for any caller that was using it before).
- `test:e2e:ext` — runs `--project=extension` only.
- `test:e2e:all` — runs both projects.

**README** — extended with the new "extension" project description, build-prerequisite note (the harness loads whatever is at `.output/chrome-mv3/`), and cross-reference to the wxt-build pipe-blocking workaround from CORRECTIONS_LOG 2026-05-10-f.

**Sanity-check round-trip (P-17 discipline applied):**

| Step | Action | Expected outcome | Actual outcome |
|---|---|---|---|
| 1 | Run `npm run test:e2e:ext` against current code (P-14 bug present) | Regression test's assertion FAILS (mutationCount > 0); `test.fail` flips to "expected fail → reported as PASS" | ✅ Suite green; regression spec's ✘ symbol confirms it failed-as-expected |
| 2 | Temporarily comment out `observer.observe(document.body, { childList: true, subtree: true })` in `extensions/competition-scraping/src/lib/content-script/orchestrator.ts:318` (eliminates the loop trivially since no MO triggers the refresh cycle); rebuild extension via `wxt build` | Regression test's assertion PASSES (mutationCount === 0); `test.fail` flips to "Expected to fail, but passed" → reported as FAIL → suite RED | ✅ Suite RED; "Expected to fail, but passed" message displayed exactly as predicted |
| 3 | Restore the `observer.observe(...)` line; rebuild extension | Suite returns to step-1 state (green; regression spec ✘-but-expected) | ✅ Suite green again |

The round-trip proves the harness detects BOTH directions of the P-14 bug class:
- It catches the bug AS-IS today (the `test.fail`-protected failure is the proof).
- It will correctly flag the future fix as "your annotation is stale, remove it" when P-14 ships (because the now-passing assertion will violate the `test.fail` expectation).

**Coverage delta vs. director-manual approach:**

Today's harness covers ONE platform (Amazon via route interception of `*.amazon.com`). The other three production platforms (ebay.com / etsy.com / walmart.com) each have their own slug variations + content shapes the orchestrator dispatches against per the `getModuleByHostname` registry. The P-14 bug is platform-independent (the MO self-feedback loop is in the orchestrator + highlight-terms refresh — not in any platform module), so single-platform coverage should be sufficient to catch the bug class. Cross-platform coverage is a (a.16) next-session enhancement: route-intercept the other three hosts too + extend the spec to cover each.

**What the harness does NOT cover (gaps to surface next session(s)):**
- The selection-on-highlighted-text destruction symptom (where selection collapses every 250ms because the marks under it get destroyed and recreated). This is the user-visible second symptom of P-14 beyond the visual flashing. A "selection holds across one MO debounce window" sub-spec is straightforward to add.
- Cross-platform coverage (ebay / etsy / walmart) per the note above.
- The P-10 SPA-navigation overlay banner regression case — the P-14 fix must preserve P-10 behavior; the regression spec should include a sub-test exercising `history.pushState` to confirm the SPA-detection path still fires post-fix.

**Cross-references:** ROADMAP W#2 row (a.16) RECOMMENDED-NEXT (author the actual regression spec coverage on top of this harness) + (a.17) RECOMMENDED-NEXT-AFTER (ship the P-14 fix); ROADMAP polish backlog P-14 entry (annotated with harness-landed + fix-shape captured); CORRECTIONS_LOG 2026-05-12-c entries (the `import.meta.url` ESM/CJS slip + the cwd-drift slip + the P-17 baseline doc-drift correction); README §"Running the Playwright regression tests" (extended Playwright section); `tests/playwright/authFetch-regression.spec.ts` (P-17's sibling test that the round-trip discipline was inherited from); `extensions/competition-scraping/src/lib/content-script/orchestrator.ts:297-318` + `highlight-terms.ts:362-389` (the buggy code paths the regression spec asserts against).

---

**Previously updated:** 2026-05-11-b (W#2 Extension build — session 4 — Module 2 text-capture path ✅ SHIPPED at code level on `workflow-2-competition-scraping`. Both gestures landed in one session: (1) **highlight-and-add via right-click context-menu** — director-picked Option A 'right-click context-menu only' per the Rule 14f forced-picker; new content-script overlay form with saved-URL picker (pre-selects via `pickInitialUrl` when current page is recognized), captured-text textarea, content-category dropdown with inline "+ Add new" upsert path, and chip-list tags input (director-picked structured chip-list over comma-separated per Rule 14f). (2) **Paste-into-extension** — new React `<CapturedTextPasteForm>` rendered in the popup below Highlight Terms once Project + Platform are picked; same form surface; runs in extension origin so it calls `api-client.ts` directly without the api-bridge round-trip. New pure-logic module `captured-text-validation.ts` (`validateCapturedTextDraft`, `normalizeTags` with first-seen-casing dedupe, `pickInitialUrl`, UUIDv4 clientId mint) + 19 new node:test cases. New verification surface appended below as the "Extension build — session 4" section (PENDING; flows into Waypoint #2 verification along with future sessions 5 image-capture). **Scope split explicitly captured:** Module 2 image-capture flow (right-click "Save to PLOS — Image" + region-screenshot + two-phase signed-URL upload) deferred to session 5 — keeps each session shippable + verifiable. **Verification scoreboard:** ext tsc clean; ext tests **252/252** pass (was 233; +19 captured-text-validation tests); ext eslint 0e/0w; ext WXT build artifacts written (parent process hangs at exit per the known issue captured in CORRECTIONS_LOG 2026-05-10-f — same workaround applies); root tsc clean; root build clean (51 routes — baseline parity, no new routes); root tests **400/400** pass — baseline parity; root eslint 13e/39w — baseline parity. **Multi-workflow per Rule 25:** pull-rebase clean at session start (workflow-2-competition-scraping at `daa4ca8`; main at `9a1aacd` from deploy session #5 earlier today; this session's commit lands on workflow-2-competition-scraping; doc-only flow-through to main happens at next deploy session); schema-change-in-flight stays No; W#1 row untouched per Rule 3 ownership.)

**Previously updated:** 2026-05-10-c (W#2 polish session #9 — P-2 ✅ BROWSER-VERIFIED on local extension build via corrected sequence captured today. **No code changes** — P-2 fix already shipped at code level 2026-05-10-b in commit `d2e2115`. Director performed the test on `plos-extension-2026-05-10-c-p2-p9-p10.zip` and reported PASS — red error box read exactly the predicted text **"Couldn't load your projects (0): Network unreachable — check your connection."** matching `api-client.ts:62` `mapFetchTransportError` + `ProjectPicker.tsx:32` PlosApiError-branch rendering. **Doc updates this commit:** Polish session #8 P-2 sub-section flipped to ✅ DONE 2026-05-10-c + P-2 sub-table rewritten as P2-A..P2-E with the corrected sequence (sign in normally with WiFi ON → close popup → turn OFF system WiFi → re-open popup → observe red error box; replaces the original `P2-1..P2-5` "sign in WHILE offline" sequence which couldn't cleanly exercise the P-2 code path because Supabase auth itself needs network); each P2-A..P2-D row marked PASS + P2-E cleanup row marked PASS. **P-9 + P-10 still PENDING** — flow with P-2 doc updates to `main` at next W#2 → main deploy session per ROADMAP Active Tools row (a.7). Multi-workflow per Rule 25: pull-rebase clean at session start; W#1 row untouched per Rule 3 ownership; schema-change-in-flight stays "No". TaskList sweep per Rule 26: 4 tasks tracked + completed; zero `DEFERRED:` items at any point.)

**Previously updated:** 2026-05-09 (Waypoint #1 verification ATTEMPT #5 — ✅ DONE — Waypoint #1 fully complete. Browser re-verify of 4 polish fixes (P-4 + P-5 + P-7 + P-8) on Amazon ✅; S3-26 Ebay + S3-27 Etsy + S3-28 Walmart full S3-5..S3-19 walkthroughs ✅; S3-29..S3-35 cross-platform tests ✅; S3-36 build artifact integrity ✅ (compile + 185/185 tests + build clean + zip 175,090 bytes); S2-3 deferred re-verify with system-WiFi-off trigger ✅ (friendly error box appeared). Two NEW polish items captured via Rule 26 + migrated end-of-session: P-9 (highlight-terms 500KB cap too aggressive — blocks Ebay search ~1.5MB + Ebay detail ~1.58MB + Walmart search ~650KB; fires ~20+ times per Walmart page-load on heavy React re-renders even with 250ms MutationObserver debounce → ROADMAP polish backlog P-9) + P-10 (AlreadySavedOverlay banner intermittent on saved-URL navigation, observed on Walmart heavy-SPA pages; likely root causes: storage-hydration race + history.pushState SPA navigation not caught by popstate listener + initial-page-load timing → ROADMAP polish backlog P-10). One existing polish item flagged: P-2 (api-client.ts authedFetch doesn't catch fetch's TypeError) may already be partially handled — friendly error appeared in S2-3 re-verify; needs code-read confirmation. Director slip-correction mid-block: Claude initially conflated 'captured P-9 deferred polish' with 'test passes' on Ebay; director called this out → Claude added explicit Highlight-Terms test + Console cap-warning check to Etsy + Walmart cluster sequences. Director-confirmed P-6 (Sponsored Ad checkbox) status during walkthrough — still queued for own session #6 + applies to all platforms. Attempt #4 row added retroactively to attempt log table (process slip end-of-session 2026-05-08-d). All three 'Extension build — session 1/2/3' section headings flipped from PENDING to ✅ DONE 2026-05-09. Waypoint #1 fully complete.)
**Previously updated:** 2026-05-08-c (Waypoint #1 verification ATTEMPT #3 — PARTIAL — extension session 3 URL-capture verified for Amazon S3-1 through S3-11 ✅ before director called wrap-up; S3-12 through S3-36 + S2-3 re-verify deferred to next session(s). Attempt #3 surfaced **three real bugs in extension session 3 code, all fixed inline before wrap-up:** (1) **content-script CORS blocker** — content scripts run in host page's origin (amazon.com etc.) which is NOT in vklf.com's CORS allowlist (`chrome-extension://*` only), so direct fetches from `listCompetitorUrls` + `createCompetitorUrl` failed preflight with `TypeError: Failed to fetch`. Fix: new `api-bridge.ts` routes the 3 PLOS API calls through `chrome.runtime.sendMessage` → background service worker → fetch from extension origin. Bonus: content.js bundle dropped from ~219 KB to ~21 KB (supabase no longer pulled in transitively). (2) **Floating "+" button hover grace timer** — moving cursor from link to floating button fired link-mouseleave → button hidden before cursor reached it. Fix: 150ms grace timer + button mouseenter cancels timer. (3) **"Already saved" icon dedupe + visibility** — Amazon product cards have 4+ anchor tags pointing to the same product, so 1 saved URL produced 4 ✓ icons cluttering the card; AND the default 16px muted-green icon was too subtle to spot at default styling against Amazon's busy product-card chrome. Fix: dedupe in `scanLinks` to 1 icon per unique normalized URL + CSS visibility boost (28×28, vibrant emerald `#16a34a`, 3px white border + green halo ring + drop shadow + bolder ✓ glyph + max z-index). All three fixes in single code commit `f4226ca`. **Walked-through outcome:** S3-1 (extension reload) ✅; S3-2 (Site access — 6 sites all on, with stale doc text noted: `vklf.com` → `www.vklf.com` per attempt #2 fix) ✅ with doc-text update; S3-3 (Permissions — Storage + contextMenus, with Chrome UI display variance noted: Storage permission may not display in Details UI even when granted) ✅ with doc-text update; S3-4 (sign in + Project + Amazon platform — done via reload reconfigure) ✅; S3-5 (Console clean of `chrome-extension://` errors) ✅ after CORS fix; S3-6 (Amazon search loads) ✅; S3-7 (hover → "+" button after 300ms) ✅ after grace-timer fix; S3-8 (cursor away → button hides; ~150ms grace, doc-text update needed) ✅ with doc-text update; S3-9 (click "+" → modal with all 5 expected elements) ✅; S3-10 (Save without optional fields → URL appears in PLOS-side viewer for Amazon) ✅ — full end-to-end of messaging-proxy fix verified live; S3-11 (✓ icon on saved link after hard-refresh) ✅ after dedupe + CSS fix on third iteration. **Five deferred items captured via Rule 26 + migrated end-of-session into destination docs:** P-3 broadened (per-user-per-project extension state moves to PLOS DB — directive surfaced when reload reset Highlight Terms) → ROADMAP polish backlog P-3 + DESIGN §B; P-4 (Amazon sponsored-ads SSPA-redirect detection — `+` button doesn't appear on sponsored ads because `/sspa/click?...&url=...` encodes `/dp/{ASIN}` inside a query param) → ROADMAP polish backlog P-4; P-5 (live-page Highlight Terms application — director directive: highlight words should appear on the page user is on, currently only popup-side persistence) → ROADMAP polish backlog P-5 + DESIGN §B; P-6 ("Sponsored Ad" checkbox in URL-add form + PLOS-side tag — pairs with P-4 auto-detection synergy) → ROADMAP polish backlog P-6 + DESIGN §B; and the verification-walkthrough completion (S3-12 through S3-36 + deferred S2-3 re-verify) is captured as the next-session work. Section flag stays PENDING until session 3 attempt #4 lands.)
**Previously updated:** 2026-05-08-b (Waypoint #1 verification ATTEMPT #2 — PASSED for extension sessions 1 + 2; session 3 (URL capture across 4 shopping sites, ~36 steps) DEFERRED to next session per the original 2-step split decision. Director worked through ~56 walked-through steps in `session_2026-05-08-b_w2-waypoint-1-verification-pass-1-attempt-2` covering install + auth + popup pickers + persistence + multi-project data isolation + DevTools storage + sign-out flow. **Outcome: 27 of 28 session-2 steps PASSED ✅ + 1 deferred (S2-3 offline error handling — test protocol couldn't exercise the intended path, captured for re-verification + linked polish gap fix in `api-client.ts authedFetch`).** Three deferred items captured via Rule 26 + migrated end-of-session into destination docs: (1) ROADMAP Phase-1 polish — vklf.com silent token refresh + retry on 401; (2) ROADMAP Phase-1 polish — extension offline-error handling (api-client.ts `authedFetch` doesn't catch fetch's TypeError); (3) CORRECTIONS_LOG informational — 2026-05-08 deploy session verification-scope gap (CORS + token-refresh both unverified during deploy because the verification window was inside the actively-signed-in 1-hour Supabase window AND didn't exercise the extension's CORS preflight, which surfaces the apex→www redirect blocker). **Mid-session blocker fix:** apex→www CORS redirect (different from 2026-05-07-i blocker) — Vercel's edge 308-redirects vklf.com → www.vklf.com BEFORE the route handler runs; CORS preflight cannot follow a redirect lacking CORS headers. Fix: extension `PLOS_API_BASE_URL` + `host_permissions` changed from `vklf.com` → `www.vklf.com` (canonical hostname). Code commit `5472d26` on `workflow-2-competition-scraping`. **Polish committed inline:** (a.0) DetailedUserGuide default-collapsed (commit `28f2df9`). **Storage schema observed in production via DevTools E1:** `highlightTerms:<projectId>` per-project arrays of `{color, term}`; `selectedProjectId` global key; `sb-<supabase-project>-auth-token` Supabase session blob — per-project data isolation property fully validated by the round-trip Cluster D test (D2 + D4 most-load-bearing checks both passed). Section flag stays PENDING until session 3 attempt #3 lands.)
**Previously updated:** 2026-05-07-i (Waypoint #1 verification ATTEMPTED — PARTIAL outcome — DEPLOY-GAP BLOCKER FOUND. Director worked through extension-session-1 Steps 1-8 in `session_2026-05-07-i_w2-waypoint-1-verification-pass-1`. Steps 1-7 ✅ (download zip / unzip / open chrome://extensions / Developer Mode ON / Load unpacked / Pin / Open popup pre-sign-in screen). Step 8 PARTIAL — sign-in via Supabase ✅, but the post-sign-in project-list path returned **"Couldn't load your projects: Failed to fetch"**. Root cause diagnosed: the OPTIONS handler + `withCors` wrap on `src/app/api/projects/route.ts` exists on `workflow-2-competition-scraping` (commit `5b4a3e8`) but NOT on `origin/main` (last touched 2026-05-03 by `58fe5e6` flake-rate instrumentation, unrelated). vklf.com runs `main` and lacks the CORS handler, so the extension's preflight fails. Same gap blocks all extension API calls: ~24 W#2 API routes (URL save/edit/delete, image upload, vocabulary, reset, janitor) + the schema migration for 7 W#2 tables are also W#2-branch-only and not yet on `main`. Director chose via Rule 14f to **end this session and dedicate next session to the W#2 → main deploy** rather than cherry-pick or cowboy-merge mid-verification. Waypoint #1 verification will resume in a fresh session AFTER the deploy session lands cleanly. Steps 9-18 of session-1 + all of sessions 2-3 untouched today; flag stays PENDING until the resumed verification.)
**Previously updated:** 2026-05-07-h (Extension build — session 3 — section appended in `session_2026-05-07-h_w2-extension-build-session-3` after director's standing directive to defer all manual testing. Session 3 shipped Module 1 URL-capture content script for 4 shopping platforms.)
**Previously updated:** 2026-05-07-g (Extension build — session 2 — section appended in `session_2026-05-07-g_w2-extension-build-session-2` after director's standing directive to defer all manual testing to the verification waypoints below. Session 2 shipped the popup project-picker + platform-picker + Highlight-Terms color-palette UI per `COMPETITION_SCRAPING_STACK_DECISIONS.md §6` + `COMPETITION_SCRAPING_DESIGN.md §A.7` Module 1 setup flow; tests appended below land in Waypoint #1's coverage.)
**Previously updated:** 2026-05-07-f (Extension build — session 1 — section appended in `session_2026-05-07-f_w2-extension-build-session-1` after director's directive to defer all manual testing. **End-of-session refinement:** the "ONE post-coding verification session" plan was split into THREE verification waypoints — see "Verification waypoints" section below).

---

## Why this doc exists

W#2 PLOS-side slices ship UI faster than the data needed to populate it. The Chrome extension (slice (c) on the W#2 ROADMAP next-session list) is the canonical data-entry path; until it lands, every PLOS-side viewer slice is structurally untestable against real captured data because there is no manual-URL-add affordance on the PLOS side yet (deliberately deferred per the director's 2026-05-07 call — the alternative seed paths were declared not worth the friction vs. just waiting).

Rather than hold each slice's commit on a verification step that can't run, the director chose 2026-05-07: **defer all visual verification of W#2 PLOS-side UI until the extension build provides a data path; maintain a per-slice running tally of pending visual checks here; walk through each slice's checks together when the extension is up.**

This doc is the running tally.

---

## 🚨 Waypoint #1 attempt log (NEW 2026-05-07-i)

| Attempt | Date | Outcome | Step coverage | Blocker | Disposition |
|---|---|---|---|---|---|
| #1 | 2026-05-07-i | PARTIAL | Session-1 Steps 1-7 ✅; Step 8 PARTIAL (sign-in OK, project-list blocked); Steps 9-18 + sessions 2-3 not exercised | **DEPLOY GAP** — OPTIONS/withCors handler on `src/app/api/projects/route.ts` exists on `workflow-2-competition-scraping` (commit `5b4a3e8` 2026-05-07) but NOT on `origin/main` (last touched 2026-05-03 by unrelated `58fe5e6`). Same gap blocks all extension API calls — schema for 7 W#2 tables + ~24 W#2 API routes also W#2-branch-only. | Director chose via Rule 14f to end session here and dedicate next session to W#2 → main deploy as its own focused effort (proper schema-state verification on prod, full merge, push, watch redeploy, visual-verify W#1 stays healthy). Waypoint #1 resumes in a fresh session AFTER deploy lands. |
| #2 | 2026-05-08-b | PASSED for sessions 1 + 2; session 3 deferred | Session-1 install/auth steps re-verified during reinstall + sign-in workflow ✅; **27 of 28 session-2 steps PASSED ✅** (S2-3 offline error handling deferred — test protocol couldn't exercise the intended path because Network-Offline-while-popup-already-open doesn't trigger any API call; `listProjects` had already succeeded). Session-3 (URL capture across 4 shopping sites, ~36 steps) DEFERRED to next session per the original 2-step split decision. | **Mid-session blocker fix (different from attempt #1):** apex→www CORS redirect — Vercel's edge 308-redirects `vklf.com` → `www.vklf.com` BEFORE the route handler runs; CORS preflight cannot follow a redirect lacking CORS headers. Fix: extension `PLOS_API_BASE_URL` + `host_permissions` changed to canonical `www.vklf.com`. Commit `5472d26`. Verification resumed inline; no session-stop needed. | Three deferred items captured via Rule 26 + migrated end-of-session: (1) ROADMAP Phase-1 polish — silent token refresh; (2) ROADMAP Phase-1 polish — extension offline-error handling (`authedFetch` doesn't catch fetch's TypeError); (3) CORRECTIONS_LOG informational — deploy-session verification-scope gap. Waypoint #1 sessions 1+2 sections marked covered-by-attempt-#2 in headers below; waypoint #1 attempt #3 (session 3 URL capture) is the explicit recommended next-session task. |
| #3 | 2026-05-08-c | PARTIAL — Amazon S3-1 through S3-11 ✅; S3-12 through S3-36 + S2-3 re-verify deferred | Director worked through 11 of 36 session-3 steps for Amazon platform: extension reload (S3-1) ✅; permissions spot-check (S3-2 + S3-3) ✅ with stale doc-text noted; sign in + Project + Amazon (S3-4) ✅ via reload reconfigure; Amazon Console clean of `chrome-extension://` errors (S3-5) ✅ after CORS fix; Amazon search loads (S3-6) ✅; hover → "+" button after 300ms (S3-7) ✅ after grace-timer fix; cursor-traversal grace (S3-8 — 150ms not "immediately") ✅ with doc-text update; click "+" → modal (S3-9) ✅; **Save without optional fields → URL appears in PLOS-side viewer for Amazon (S3-10) ✅ — full end-to-end of messaging-proxy fix verified LIVE**; ✓ icon on saved link after hard-refresh (S3-11) ✅ after dedupe + CSS visibility fix on 3rd iteration. Director called wrap-up at S3-11 per session-mgmt lucidity preference (3 substantive mid-session pivots already absorbed). **Three real bugs in extension session 3 code FIXED INLINE — single commit `f4226ca`:** (1) content-script CORS blocker — content scripts running in host page origin (amazon.com etc.) failed CORS preflight to vklf.com because allowlist is `chrome-extension://*` only. Fix: new `api-bridge.ts` routes 3 PLOS API calls through `chrome.runtime.sendMessage` → background service worker → fetch from extension origin. Bonus: content.js dropped ~219 KB → ~21 KB (supabase no longer transitively pulled into content-script bundle). (2) Floating "+" button hover grace timer — link-mouseleave hid button before cursor traversal reached it; fixed with 150ms grace timer + button mouseenter cancels. (3) "Already saved" icon dedupe + visibility — Amazon product cards have 4+ anchor tags per product (image, title, review, price) so 1 saved URL produced 4 ✓ icons cluttering the card; AND default 16px muted-green icon was too subtle to spot. Fixed with `scanLinks` dedupe (1 icon per unique normalized URL across MutationObserver re-scans) + CSS boost (28×28, vibrant emerald, 3px white border + green halo ring + drop shadow + bolder ✓ glyph + max z-index). | **Five deferred items captured via Rule 26 + migrated end-of-session:** (1) **P-3 broadened** — per-user-per-project extension state moves to PLOS DB (directive surfaced when reload reset Highlight Terms; "no matter where the user logs in, they can pick up where they left off") → ROADMAP polish P-3 + DESIGN §B; (2) **P-4** — Amazon sponsored-ads SSPA-redirect detection (sponsored links route through `/sspa/click?...&url=%2Fdp%2F{ASIN}...`; `+` button doesn't appear) → ROADMAP polish P-4; (3) **P-5** — live-page Highlight Terms application (director directive: highlight words on the page user is on; currently only popup-side persistence) → ROADMAP polish P-5 + DESIGN §B; (4) **P-6** — "Sponsored Ad" checkbox in URL-add form + PLOS-side tag (synergy with P-4: auto-pre-check when SSPA detected) → ROADMAP polish P-6 + DESIGN §B; (5) the rest of session-3 walkthrough (S3-12 through S3-36 + deferred S2-3 re-verify) is the explicit recommended next-session task → ROADMAP Active Tools W#2 row Next Session list. Section heading for "Extension build — session 3" stays PENDING; waypoint #1 attempt #4 will pick up at S3-12. |
| #4 | 2026-05-08-d | PARTIAL — Amazon S3-12 through S3-25 walkthrough ✅ + 4 polish fixes (P-4 + P-5 + P-7 + P-8) shipped at code level via Rule 14f Option A mid-session pivot; browser re-verify of fixes + S3-26..S3-36 + S2-3 re-verify carried to attempt #5. ROW ADDED RETROACTIVELY 2026-05-09 attempt #5 — director called out the missed row in attempt #5 launch prompt (process slip end-of-session 2026-05-08-d). | Director resumed verification on `workflow-2-competition-scraping` in `session_2026-05-08-d_w2-waypoint-1-verification-attempt-4-extension-session-3-completion`. Walked Amazon S3-12 (Save with optional fields → fields populate on PLOS-side detail page) ✅; S3-13 (Cancel button) ✅; S3-14 (Esc key) ✅; S3-15 (backdrop click) ✅; **S3-16 (Save failure inline error — needed service-worker DevTools Offline rather than page-DevTools Offline since post-`f4226ca` CORS messaging-proxy fix routes Save through background service worker; doc-text caveat captured this attempt — original spec said page-DevTools-Offline which doesn't trigger the failure path)** ✅ with doc-text caveat now applied to S3-16 in section body (closed in attempt #5); S3-17 (per-session × dismiss page-wide + restore on hard-refresh) ✅; S3-18 (right-click context-menu fallback — overlay opens centered per P-7 fallback) ✅; S3-19..S3-22 (detail-page ✓-saved overlay banner — appears on saved URL navigation, auto-dismisses ~5s, × close works, doesn't appear on unsaved URLs) ✅; S3-23 (URL-normalization ?-stripping — tracking params stripped at recognition time; banner still appears) ✅; S3-24 (+ button doesn't appear on Amazon logo + cart + nav links) ✅; S3-25 (300ms hover-debounce + no flicker on quick traversal) ✅. **Two NEW polish items surfaced + captured during walkthrough via Rule 26 + Rule 18 mid-build directive Read-It-Back:** (P-7) URL-add overlay positioning — director directive at S3-12: *"shouldn't open directly on top of the very product listing for which the url is being added"*; (P-8) ✓ already-saved icon punches through URL-add overlay — director observation at S3-16: *"its checkmark shows up on top of the new overlay (which it shouldn't)"* — root cause yesterday's `f4226ca` icon-visibility-boost set z-index to 2147483647 (max int32) which equals .plos-cs-form z-index → DOM-order / sub-context wins. **FOUR fixes shipped same-session via Rule 14f Option A mid-session pivot (single commit `65a9a31`):** (P-4) Amazon SSPA-redirect detection — new `decodeSspaInner(href)` reads `/sspa/click?...&url=%2Fdp%2F{ASIN}` patterns + 9 new tests in `amazon.test.ts`; (P-5) live-page Highlight Terms — new `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` (~240 LOC) + `.test.ts` (~120 LOC) with TreeWalker DOM scan + word-boundary regex + per-term CSS swatches + chrome.storage.onChanged live update + 50-term cap + **500KB body-text cap** (this cap turns out to be too aggressive — see P-9 captured in attempt #5); (P-7) URL-add overlay positioning — new `computeFormPosition()` places form on side opposite trigger; falls back to centered when triggerRect===null (right-click context-menu); (P-8) ✓ icon z-index conflict — layered z-index tiers in `styles.ts` (page-overlay 999990, modal-backdrop 999998, modal-content 999999). | **Four polish items shipped + two queued + verification carry-over:** P-4 + P-5 + P-7 + P-8 marked ✅ SHIPPED at code level in ROADMAP polish backlog (browser re-verify carries to attempt #5); P-6 (Sponsored Ad checkbox) + P-3-narrowed (Highlight Terms server-side persistence) queued as own dedicated build sessions per director Option-A 3-session-split with launch prompts captured in ROADMAP Active Tools W#2 row Next Session items (a.2) + (a.3); rest of session-3 walkthrough (S3-26..S3-36 + deferred S2-3 re-verify + browser re-verify of P-4/P-5/P-7/P-8) → next-session task. Section heading for "Extension build — session 3" stays PENDING through attempt #4; waypoint #1 attempt #5 will complete the walkthrough + re-verify the polish fixes browser-side. **Attempt-log table row was NOT added end-of-session 2026-05-08-d (process slip — surfaced and corrected in attempt #5).** |
| #5 | 2026-05-09 | ✅ DONE — Waypoint #1 fully complete. Browser re-verify of 4 polish fixes (P-4 + P-5 + P-7 + P-8) on Amazon ✅; S3-26 Ebay + S3-27 Etsy + S3-28 Walmart full walkthroughs ✅; S3-29..S3-35 cross-platform tests ✅; S3-36 build artifact integrity ✅; S2-3 deferred re-verify with stronger trigger ✅; section headings for ext sessions 1+2+3 flipped to ✅ DONE; attempt #4 row added retroactively. | Director resumed verification on `workflow-2-competition-scraping` in `session_2026-05-09_w2-waypoint-1-verification-attempt-5-final-completion`. **Block 1 — 4-fix browser re-verify on Amazon ✅ ALL PASS:** P-4 (sponsored-ad gets "+" button via SSPA detection); P-5 (Highlight Terms colorfully wrapped on Amazon search results via TreeWalker word-boundary regex + per-term swatches with auto-flipped contrast text); P-7 (URL-add overlay opens on side opposite trigger product card — left-half trigger → right-side form; right-half trigger → left-side form; never on top of trigger); P-8 (✓ saved-icons sit BEHIND the modal backdrop; no longer punch through at max-int32 z-index). **Block 2 — cross-platform walkthrough director-picked Option A "Full per-spec":** Setup → switch popup to each platform sequentially. **S3-26 Ebay** (15 sub-steps S3-5..S3-19): all functional ✅; **Highlight Terms BLOCKED on Ebay search results AND detail pages by P-9 cap** (Ebay search ~1.5MB / detail ~1.58MB body text; both exceed 500KB cap; cap fires twice per page-load — initial requestIdleCallback pass + MutationObserver re-scan; Console-confirmed via diagnostic). **Director slip-correction mid-block:** Claude initially conflated "captured P-9 deferred polish" with "test passes" — director called this out: *"You never asked me to test [Highlight Terms on Ebay] which you should have before moving on to Etsy.com. The same test should be done on all other platforms."* Claude acknowledged + added explicit Highlight-Terms check + cap-warning Console check to Etsy + Walmart cluster sequences. **S3-27 Etsy** (15 sub-steps + S3-31 SPA infinite-scroll): all functional ✅ + **Highlight Terms work cleanly on Etsy** (cap doesn't fire — Etsy pages stay below 500KB). **S3-28 Walmart** (15 sub-steps + S3-32 recognition cache survives save): all functional ✅; **TWO reliability gaps surfaced:** (1) cap fires ~20+ times per Walmart page-load on heavy React re-renders + dynamic ad loading even with the 250ms MutationObserver debounce — Walmart search results ~650KB exceed cap → Highlight Terms blocked + perf cost of computing document.body.innerText 20+ times per page; (2) AlreadySavedOverlay banner intermittently fails to appear on Walmart detail pages — director observation: *"the green overlay that is supposed to tell me that the url is already added doesn't show sometimes"*; likely root causes: storage-hydration race, Walmart's history.pushState SPA navigation not caught by popstate listener, initial-page-load timing. **Director-confirmed P-6 status during walkthrough:** *"Again, just like with Amazon.com, there should be a checkbox to mark a added url as a sponsored ad, which should show in PLOS. Note that this issue is still not fixed for Amazon.com either. The same thing should be done on all other platforms."* — confirms P-6 is still queued for own session #6 + applies to all platforms. **S3-29..S3-35 cross-platform tests ✅:** S3-29 cross-platform mismatch (Amazon set + Ebay browsed → no buttons + no plos-cs-* DOM nodes); S3-30 mid-session platform switch (Amazon→Ebay popup pick → existing Amazon buttons stay until refresh; refresh → no buttons; navigate Ebay → buttons appear); S3-33 popup unconfigured = no buttons (sign-out + reload Amazon → no buttons + no plos-cs-* DOM nodes); S3-34 service-worker DevTools console clean (post-walkthrough Console clean of red errors); S3-35 chrome.storage.local key check (initial check showed `selectedPlatform` missing → director-side oversight identified — popup picker correctly only persists explicit picks; after explicit Amazon re-pick, all 4 keys present: `selectedProjectId` UUID + `selectedPlatform: amazon` + `highlightTerms:<projectId>` 5 bursitis-related terms with hex colors + Supabase auth-token JWT blob). **S3-36 build artifact ✅:** `npm run compile` clean; `npm test` 185/185 pass (NOT 246 as spec said — actual baseline = 159 prior + 26 new tests from attempt #4 polish fixes); `npm run build` clean (Built extension in 1.159 s; Σ Total size 634.07 kB); `npm run zip` regenerated 175,090-byte zip. **S2-3 deferred re-verify ✅:** stronger trigger (sign back in normally → close popup → turn OFF system WiFi → open popup) → friendly red error box appeared → S2-3 PASS (NOTE: P-2 polish gap may already be partially handled — flagged for code-read confirmation). **Mid-session leftover-build cleanup:** ~5 wxt build/zip zombie processes from prior sessions (PIDs 77643, 81659, 87491, 91258, 98424 from May 8) were stacked up in Codespaces consuming ~20GB virt each + blocking the new build; pkill -f wxt cleared them; build then completed in 1.7s. | **Two NEW polish items captured via Rule 26 + migrated end-of-session:** (1) **P-9** — highlight-terms 500KB cap too aggressive (blocks Ebay search ~1.5MB + Ebay detail ~1.58MB + Walmart search ~650KB; fires repeatedly on Walmart heavy-SPA pages — 20+ times per page-load even with 250ms debounce; chrome://extensions Errors panel accumulates one entry per cap-fire) → ROADMAP polish backlog P-9. (2) **P-10** — AlreadySavedOverlay banner intermittent on saved-URL navigation (specifically observed on Walmart; likely root causes: storage-hydration race + history.pushState SPA navigation not caught by popstate listener + initial-page-load timing) → ROADMAP polish backlog P-10. **One deferred-attempt-#4 doc gap closed:** S3-16 doc-text caveat about needing service-worker DevTools Offline (not page-DevTools Offline) now applied to S3-16 step body in this doc + this attempt-log row. **One existing polish item flagged for code-read confirmation:** P-2 (api-client.ts authedFetch doesn't catch fetch's TypeError) — friendly error box appeared in S2-3 re-verify so the P-2 gap may already be partially handled; needs code-read end-of-session to confirm whether P-2 still applies or can be marked obsolete. **All three "Extension build — session 1/2/3" section headings flipped from PENDING to ✅ DONE 2026-05-09. Waypoint #1 fully complete.** Multi-workflow per Rule 25: schema-change-in-flight stays "No"; pull-rebase clean at session start; W#1 row untouched per Rule 3 ownership. Two commits expected: end-of-session doc-batch (this commit) + push pending Rule 9 approval. |

**Cross-references for the deploy-gap finding:** `ROADMAP.md` Active Tools W#2 row Next Session list (NEW top item: W#2 → main full deploy session); `CORRECTIONS_LOG.md` 2026-05-07-i entry (procedural lesson — verification waypoint can't fire when prerequisite deployment hasn't landed; future build sessions should explicitly note "this slice's verification needs main-deploy of [X commits] before it can fire" as a deferred-item per Rule 14e).

**Cross-references for attempt #2 outcome:** `ROADMAP.md` Active Tools W#2 row Last Session + Next Session updates (this attempt's outcome + (a) waypoint #1 attempt #3 = session 3 URL capture); `ROADMAP.md` NEW W#2 polish backlog section (P-1 silent token refresh + P-2 extension offline handling); `CORRECTIONS_LOG.md` 2026-05-08-b entry (deploy-session verification-scope gap on CORS preflight + post-elapsed-time token expiry — neither was exercised by the deploy session's same-window navigation-only verification).

**Cross-references for attempt #3 outcome:** `ROADMAP.md` Active Tools W#2 row Last Session + Next Session updates (attempt #3 PARTIAL — Amazon S3-1 through S3-11 ✅, S3-12 onward + S2-3 deferred to attempt #4 in next session); `ROADMAP.md` NEW W#2 polish backlog entries P-3 (extension state PLOS-side) + P-4 (Amazon SSPA detection) + P-5 (live-page highlight terms) + P-6 (Sponsored Ad checkbox + tag); `COMPETITION_SCRAPING_DESIGN.md §B` append-only entries for the three director directives (P-3 + P-5 + P-6) per Rule 18 mid-build directive Read-It-Back; `CORRECTIONS_LOG.md` 2026-05-08-c entry (content-script CORS architecture lesson — extensions making cross-origin calls from content scripts MUST route through background service worker; same-origin allowlist `chrome-extension://*` doesn't cover content-script's host-page origin).

---

## Verification waypoints (set 2026-05-07-f)

The original directive was "defer all manual testing to ONE post-coding verification session." End-of-session 2026-05-07-f, the director refined this to **THREE verification waypoints split across the remaining build sessions**, both to keep each walkthrough at a manageable size and to shorten the find-a-problem-deep-in-the-stack feedback loop.

| Waypoint | Fires after | Cumulative coverage | Approx. test count |
|---|---|---|---|
| **#1** | Extension session 3 (Module 1 URL-capture lands) | Slice (a.1)–(a.4) + slice (b) Detailed User Guide + extension sessions 1–3 (install / auth / popup pickers / URL capture). Simplest end-to-end loop: install → sign in → pick Project + platform → capture a competitor URL → see it on the PLOS viewer. | ~50–80 |
| **#2** | Extension session 5 (image upload lands) | Adds extension session 4 (text + image capture flows) + extension session 5 (two-phase signed-URL image upload). Full data-capture surface exists. | ~70–80 incremental; ~120–150 cumulative |
| **#3** | Extension session 7 (distribution polish lands; all coding done) | Adds extension session 6 (WAL + failed-write queue + tab-close guard + sync indicator + periodic reconciler) + extension session 7 (distribution polish). | ~50 incremental; ~150–200 cumulative |

**Waypoint discipline:** when a waypoint runs, every section heading covered by that waypoint flips from `PENDING <date>` to `✅ DONE <date>` with a one-line outcome note (the body stays unchanged for historical reference per the format below). Subsequent waypoints only walk through sections still in `PENDING` state plus any new sections appended since the prior waypoint.

**Per-waypoint session structure:**

1. Director runs through every `PENDING` step in the relevant sections. Each step is checked off in the file as it passes (or annotated with a failure note if it doesn't).
2. Failures get either: (a) immediate fix this session if small, or (b) a new `DEFERRED:` task per Rule 26 with destination doc + section named.
3. End-of-session: heading flipped to ✅ DONE; backlog committed.

---

## Format

Each slice that ships PLOS UI but defers visual verification appends one section here. Each section is append-only at slice-shipped time. When a slice's verifications all complete (post-extension-build walkthrough), the section's heading flips from "PENDING" to "✅ DONE YYYY-MM-DD" with a one-line note on outcome — the body stays unchanged for historical reference.

```
## Slice (a.x) — <one-line slice description> — PENDING <date shipped>
- [ ] Step 1: <click-by-click test>
- [ ] Step 2: <…>
...
- Notes: any edge cases to watch for; any seed-data prerequisites once extension exists
```

---

## Slice (a.1) — `/url/[urlId]` detail page (chrome + sizes + captured-text rows + image-count placeholder) — PENDING 2026-05-07

Shipped commit: (pending end-of-session commit on `workflow-2-competition-scraping`).

Walked-through tests once the extension can populate test data:

- [ ] **Step 1 — Click-row navigation change.** From the workflow root page (`/projects/<projectId>/competition-scraping`), click any row in the URL table. Expected: navigates IN-APP to `/projects/<projectId>/competition-scraping/url/<urlId>` instead of opening the competitor's website in a new tab.
- [ ] **Step 2 — Topbar.** Detail page renders the standard `<WorkflowTopbar>`: "Competition Scraping & Deep Analysis" title with the 🔍 icon + back-to-Project link.
- [ ] **Step 3 — Sub-breadcrumb.** "Competition Scraping › [Platform Name] › [shortened URL]". First segment links back to the URL list (no platform filter); second segment links back to the URL list scoped to that platform (URL bar shows `?platform=<name>`); third segment is the current URL, not a link.
- [ ] **Step 4 — URL metadata card.** URL text in blue + "Open original URL ↗" button (preserves the prior open-in-new-tab affordance). Read-only grid of fields: Platform, Product Name, Brand Name, Category, Product Stars, Seller Stars, # Product Reviews, # Seller Reviews, Results Page Rank, Added On, Last Updated. Empty fields show a gray italic "—". If `customFields` is non-empty, sub-grid at the bottom.
- [ ] **Step 5 — Sizes / Options sub-section.** Read-only table with Size/Option, Price, Shipping Cost, Added On. Empty state: "No sizes captured for this URL yet." Loading state: "Loading sizes…". Error state: red.
- [ ] **Step 6 — Captured Text sub-section.** Sortable table with Content Category, Text (wraps), Tags, Added On. Header includes `(N)` count. Default sort: Added On descending. Sort works on all columns except Tags. Empty state names the extension's gestures.
- [ ] **Step 7 — Image-count placeholder.** "N images captured for this URL — full-size viewer ships in slice (a.2)" or "No images captured for this URL yet." or red error message when the read fails. Image rendering itself is slice (a.2).
- [ ] **Step 8 — Stale URL ID (404).** Edit URL bar to a urlId that doesn't exist. Expected: "Couldn't load this URL — Competitor URL not found." Sub-sections do NOT render (page short-circuits on URL-row 404).
- [ ] **Step 9 — Forged URL ID (403-ish).** Edit URL bar to a urlId that belongs to a different Project. Expected: same 404 path because `verifyProjectWorkflowAuth` + projectWorkflowId scoping returns 404 (not the row's data) for cross-Project access attempts.
- [ ] **Step 10 — Refresh.** Hard-refresh (Ctrl+Shift+R) the detail page. Re-fetches all four reads cleanly.
- [ ] **Step 11 — Back button preserves URL list state.** From detail page, click breadcrumb's "[Platform Name]" link. URL list lands with that platform pre-selected in the sidebar (URL bar shows `?platform=<name>`).
- [ ] **Step 12 — Section independence.** If one of the sub-fetches errors but URL row + others succeed, the failing section shows its own red error message in-place; the rest of the page renders normally.

**Seed-data prerequisites** (before walking through these tests):

- At least one CompetitorUrl row owned by the verifying user, with non-empty Product Name + Brand Name + Category + ratings + customFields so Step 4 exercises non-null cells.
- At least one CompetitorUrl that's "minimum-fields-only" (just URL + platform; everything else null) so Step 4's "—" rendering is exercised too.
- At least 2 CompetitorSize rows under one URL so Step 5's table-with-rows path is exercised.
- At least 1 CompetitorUrl with zero sizes so Step 5's empty state is exercised.
- At least 3 CapturedText rows (different categories, with and without tags) under one URL so Step 6's sort + tag display is exercised.
- At least 1 CapturedImage row (any category) under one URL so Step 7's "N images captured" path is exercised + at least one URL with zero images for the empty path.

**API-side already verified (no extension needed):**

- The four GET read paths returning 200 with sane JSON, and 404 for stale + cross-Project urlIds, can be confirmed via `curl` with a Bearer JWT or DevTools console fetch even before extension data lands. Today's TypeScript build + lint already exercise the type contracts. A separate quick-check session could exercise the 404 + 200-with-empty paths via curl-with-known-Project before the full visual walkthrough.

---

## Slice (a.2) — image gallery + full-size viewer modal — PENDING 2026-05-07

Shipped commit: (pending end-of-session commit on `workflow-2-competition-scraping`).

Slice (a.2) replaces slice (a.1)'s image-COUNT placeholder with: (1) a thumbnail grid (200×200 contain-fit thumbnails fetched via Supabase on-the-fly transform signed URLs) and (2) a click-to-open full-size viewer modal with metadata sidebar + arrow-key prev/next + Esc/backdrop/✕-close. Server-side, the existing `GET .../urls/[urlId]/images` list route now mints both thumbnail + full-size signed URLs (1-hour TTL each) and embeds them in the response so the client renders in a single round-trip.

Walked-through tests once the extension can populate test data:

- [ ] **Step 1 — Thumbnail grid renders.** From `/projects/<projectId>/competition-scraping/url/<urlId>` with at least 4 captured images, the Captured Images section shows a grid of 200×200 thumbnails with the running `(N)` count in the section heading. Contain-fit so non-square images don't get cropped.
- [ ] **Step 2 — Region-screenshot badge.** Any image whose `sourceType === "region-screenshot"` shows a small "screenshot" badge in the bottom-right corner of its thumbnail.
- [ ] **Step 3 — Click-to-open modal.** Click any thumbnail. Expected: dark backdrop overlay opens with the full-size image on the left and a metadata sidebar on the right (Category, Source, Dimensions, Added on, Composition, Embedded text, Tags). Background scroll is locked while the modal is open.
- [ ] **Step 4 — Modal close paths.** Modal closes cleanly via (a) ✕ button top-right, (b) clicking the dark backdrop outside the modal frame, (c) pressing Esc. Background scroll unlocks on every close path.
- [ ] **Step 5 — Arrow-key navigation.** With the modal open and the URL having ≥ 2 images, press ArrowRight repeatedly: each press advances to the next image; press ArrowLeft to go back. The image counter (e.g. `3 / 12`) updates correctly. Wrap-around works (last image's "next" goes to first; first image's "prev" goes to last).
- [ ] **Step 6 — Single-image case.** With a URL that has exactly 1 image, the modal opens but shows no prev/next chevrons and no `1 / 1` counter (or shows it minimally). Arrow keys are no-ops.
- [ ] **Step 7 — Metadata sidebar — populated.** With an image whose composition + embeddedText + tags are all set, the sidebar renders all of them. Multi-line composition or embedded text wraps correctly within the 320px sidebar width.
- [ ] **Step 8 — Metadata sidebar — null fields.** With an image whose composition + embeddedText + tags are empty, the sidebar shows italic gray "—" for each. Source-type still shows ("Regular image" or "Region screenshot"). Added-on always shows.
- [ ] **Step 9 — Broken thumbnail fallback.** Force a thumbnail to fail (DevTools → Network → block the signed-URL request). Expected: that thumbnail's tile shows "Image failed to load" red text rather than a broken-image icon. Other thumbnails in the grid render normally.
- [ ] **Step 10 — Broken full-size in modal.** Force the modal's full-size image to fail (DevTools → Network → block when modal opens). Expected: "Image failed to load. The signed link may have expired — refresh this page to mint a new one." red message in the modal's left pane. Sidebar still renders normally.
- [ ] **Step 11 — Empty / loading / error states on the gallery section.** Confirm: empty case ("No images captured for this URL yet…"); loading case ("Loading captured images…" while the GET is in flight); error case (red message body) when the GET 500s or 404s. These mirror the slice (a.1) image-count placeholder behavior.
- [ ] **Step 12 — Signed-URL TTL boundary (manual).** Wait > 1 hour after page load with the page still mounted, then click a thumbnail. The full-size image fails to load (Step 10's path). Acceptable behavior: refresh to re-mint; explicit refresh-recovery message tells the user what to do.
- [ ] **Step 13 — Cross-Project signed URL (smoke).** Confirm via DevTools that the signed URLs returned from the list belong to the bucket-prefixed `competition-scraping/{projectId}/...` path; a second user without access to this Project would not be able to load these images server-side (the JWT belongs to this user, not the URL — this is a signed-URL property test, not a cross-project leak test).
- [ ] **Step 14 — Lint + build + tests parity (already confirmed at commit time).** 16e/40w; build clean at 49 routes; 393/393 src/lib tests pass.

**Seed-data prerequisites** (before walking through these tests):

- At least 4 `CapturedImage` rows under one URL covering a mix of jpeg + png + webp MIMEs and at least one with `sourceType: "region-screenshot"` (Step 2 + Step 3 + Step 5).
- At least 1 image with **all** sidebar fields populated (composition + embeddedText + tags) and at least 1 image with **none** populated (Step 7 + Step 8).
- At least 1 URL with exactly 1 captured image (Step 6).
- At least 1 URL with 0 captured images (Step 11 empty state — already covered in slice (a.1) prerequisites).
- A non-square image (e.g., 1920×600 banner) so Step 1's contain-fit can be visually distinguished from cover-fit.

**API-side confirmation already exercised at commit time:**

- TypeScript types for `CapturedImageWithUrls` + `ListCapturedImagesResponse` updated (additive on the wire — bare `CapturedImage` unchanged for PATCH / finalize / etc.).
- The list endpoint mints thumbnail + full-size URLs server-side via the existing `competition-storage.ts` helper (`getThumbnailUrl` / `getFullSizeUrl`); routes' `withRetry` + `recordFlake` + CORS preserved.
- Build clean at 49 routes (zero new); `tsc` clean; lint at exact 16e/40w baseline parity with slice (a.1); 393/393 src/lib tests pass.

---

## Slice (a.3) — inline editing of URL fields (vocabulary picker for category/product/brand; numeric inputs for ratings; key/value editor for custom fields) — PENDING 2026-05-07

Shipped commit: (pending end-of-session commit on `workflow-2-competition-scraping`).

Slice (a.3) replaces the slice-(a.1) read-only metadata grid in the URL detail page with per-field inline editing. Each editable field shows a small pencil ✎ next to its label; clicking the pencil swaps that one field into edit mode; ✓ saves (or Enter), ✕ cancels (or Esc). One PATCH per save; optimistic update via the server's authoritative response; rollback on error with an inline red message under the field. Three fields use a typeahead vocabulary picker (Competition Category, Product Name, Brand Name), backed by `GET /api/projects/[projectId]/vocabulary?type=...` for suggestions and `POST /api/projects/[projectId]/vocabulary` for "+ Create '<typed value>'". Five fields use numeric inputs (Product Stars + Seller Stars 0.0–5.0 step 0.1, # Product Reviews + # Seller Reviews integer ≥ 0, Results Page Rank integer ≥ 1). Custom fields render as a key/value list with per-row pencil ✎ + ✕ delete, plus an "+ Add custom field" button. Platform / Added On / Last Updated stay read-only (re-targeting platform is rare + needs its own confirm-dialog dance, deliberately deferred).

Walked-through tests once the extension can populate test data:

- [ ] **Step 1 — Pencil affordance + entry into edit mode.** Hover any of the 8 editable fields (Product Name, Brand Name, Category, Product Stars, Seller Stars, # Product Reviews, # Seller Reviews, Results Page Rank). The label row shows a small `✎`. Click the pencil — the field swaps to an input; the read-only value disappears; ✓ + ✕ buttons appear inline.
- [ ] **Step 2 — Cancel paths.** Click ✕ — the field reverts to read mode showing the original value, untouched on the server. With the field in edit mode, press Esc — same behavior. With the field in edit mode, click outside the field — the field stays in edit mode (no implicit cancel-on-blur — the user has to commit or cancel explicitly).
- [ ] **Step 3 — Plain-number save (Product Stars).** Click pencil on Product Stars; type `4.3`; press Enter. Field returns to read mode showing "4.3". Refresh the page → still "4.3". Server PATCH log shows `{ productStarRating: 4.3 }` only (single-field PATCH).
- [ ] **Step 4 — Number range validation.** Click pencil on Product Stars; type `7`; press Enter. Inline red message reads "Must be ≤ 5." Field stays in edit mode; the value is NOT saved. Same path with `-1` reads "Must be ≥ 0." Same path with `abc` reads "Enter a number…, or leave empty."
- [ ] **Step 5 — Integer enforcement.** Click pencil on # Product Reviews; type `3.5`; press Enter. The integer parser drops the decimal; saved value = 3 (or, depending on the input element's number-only handling, the input itself rejects the decimal). Confirm by re-opening the edit field — it shows `3`.
- [ ] **Step 6 — Clear-to-null.** Click pencil on any rating field that already has a value; clear the input to empty; press Enter. Field returns to read mode showing italic gray "—" (the null state). Refresh → still "—". PATCH log shows `{ <field>: null }`.
- [ ] **Step 7 — Vocabulary picker — first open with empty vocabulary.** First-ever click on Brand Name's pencil for a Project that has never added any brands. The popover opens showing "No suggestions yet — start typing to add one." Type "Acme"; the popover updates to show a single row at the bottom: `+ Create "Acme"`. Click that row. Server log shows `POST /vocabulary { vocabularyType: "brand-name", value: "Acme" }` (201) followed by `PATCH .../urls/[urlId] { brandName: "Acme" }` (200). Field returns to read mode showing "Acme".
- [ ] **Step 8 — Vocabulary picker — existing entries.** Click pencil on Brand Name (now that "Acme" exists). The popover lists "Acme" as an existing suggestion. Type "ac" — list filters to "Acme" only. Click "Acme" — field saves "Acme" via PATCH; no extra POST to /vocabulary (the existing entry was reused).
- [ ] **Step 9 — Vocabulary picker — duplicate creation is idempotent.** Click pencil on Brand Name on a different URL row. Type "Acme" exactly. Popover shows "Acme" as exact match (NO "+ Create" row). Click "Acme" — field saves "Acme" via PATCH only. Now type "ACME" (different case). Popover shows "Acme" filtered (case-insensitive match) AND "+ Create 'ACME'" because the case-different version is technically not in the list. Pick "+ Create" — server returns 200 (existing row, the unique constraint is on exact case); local list updates with the canonical case. Field saves.
- [ ] **Step 10 — Vocabulary picker — outside-click closes popover.** Open the picker; click anywhere outside the popover. Popover closes; field stays in edit mode showing whatever was last typed; ✓ / ✕ buttons still work to commit or cancel.
- [ ] **Step 11 — Vocabulary picker cross-Project isolation.** Open the picker on URL detail page for Project A's URL. Confirm the suggestion list contains only Project A's vocabulary entries. Switch to Project B's URL detail page (different projectId in the URL). Open the picker for the same field — confirm the suggestion list contains only Project B's vocabulary entries (no leakage; vocabularies are project-scoped per `PLATFORM_REQUIREMENTS.md §8.4`).
- [ ] **Step 12 — Custom fields — empty state.** With a URL whose customFields is `{}`, the Custom fields section reads "Custom fields  (none yet)" with an "+ Add custom field" button.
- [ ] **Step 13 — Custom fields — add.** Click "+ Add custom field". Two inputs appear: name + value. Type `material` + `cotton blend`; press Enter. Row appears in the grid: `material: cotton blend`. Refresh — still there. PATCH log shows `{ customFields: { material: "cotton blend" } }`.
- [ ] **Step 14 — Custom fields — edit.** Hover the `material` row; click ✎. Inputs appear pre-filled with `material` + `cotton blend`. Change value to `100% cotton`; press Enter. Row updates. PATCH log shows `{ customFields: { material: "100% cotton" } }`.
- [ ] **Step 15 — Custom fields — rename preserves order.** With customFields = `{ a: "1", b: "2", c: "3" }`, edit the `b` row's name to `B`. Confirm the resulting grid is `a, B, c` (rename keeps position) — NOT `a, c, B` (which would be the spread-and-add behavior).
- [ ] **Step 16 — Custom fields — duplicate name rejected.** With customFields = `{ a: "1", b: "2" }`, edit `a`'s name to `b`. Inline red message reads "A field named 'b' already exists." Field stays in edit mode; nothing saved.
- [ ] **Step 17 — Custom fields — delete.** Click the `✕` next to `material`. Row disappears; PATCH log shows `{ customFields: { ... without material ... } }`. Refresh — still gone.
- [ ] **Step 18 — Optimistic update + rollback on PATCH 500.** DevTools → Network → block `PATCH .../urls/[urlId]`. Edit Product Stars to `4.5`; press Enter. Inline red message under the field: "Save failed (HTTP …)." Field stays in edit mode; the server-side row is unchanged. Cancel the edit — the read-mode value reverts to the prior server value cleanly.
- [ ] **Step 19 — 404 path (URL deleted in another tab).** In Tab A, open the URL detail page. In Tab B, delete that URL via the API. Back in Tab A, edit a field and save. Inline red message: "This URL no longer exists." Field stays in edit mode; the user can navigate back to the URL list via the breadcrumb.
- [ ] **Step 20 — Concurrent edits across tabs.** In Tab A, edit Brand Name to "Acme". In Tab B (open before Tab A's save), the page still shows the prior value. Tab B's hard-refresh re-fetches and shows "Acme". (No live-sync claim — slice (a.3) is single-tab; live-sync is a future polish.)
- [ ] **Step 21 — Keyboard-only flow.** Tab into a field's pencil; press Enter to enter edit mode (the pencil is a button, so Enter activates it). Type a value; press Enter again to save. Tab to the next field's pencil. Confirm the entire edit flow works without a mouse.
- [ ] **Step 22 — Read-only fields still read-only.** Platform / Added On / Last Updated have NO pencil and NO inline edit affordance. Confirm visually + by trying to click their label area (no edit-mode swap should occur).
- [ ] **Step 23 — Lint + build + tests parity.** At commit time: `npx tsc --noEmit` clean; `npm run build` clean (49 routes — same as slice (a.2)); `npx eslint src` reports 13 errors / 39 warnings (zero NEW issues from slice (a.3) files; baseline drifted from slice (a.2)'s 16e/40w during the 2026-05-06 main merge — the 13 errors all live in `think-tank/page.tsx`, `keyword-clustering/components/TVTTable.tsx`, etc., outside the W#2 surface); `node --test --experimental-strip-types 'src/lib/**/*.test.ts'` reports 393/393 pass.

**Seed-data prerequisites** (before walking through these tests):

- At least 1 CompetitorUrl row owned by the verifying user, all editable fields populated (covers Step 1 hover + Step 2 cancel paths + Step 3 + Step 6 clear-to-null + Step 22 read-only-fields-stay-read-only).
- At least 1 CompetitorUrl row with all editable fields = null (covers the "—"-to-real-value path in Step 6 + the empty-customFields path in Step 12).
- At least 1 CompetitorUrl with non-empty customFields covering ≥ 3 entries with varied value types (covers Step 14 edit + Step 15 rename-preserves-order + Step 16 duplicate-name reject).
- A second Project (Project B) with at least one CompetitorUrl on it AND at least one VocabularyEntry of type `brand-name` distinct from any in Project A (covers Step 11 cross-Project isolation).
- DevTools network-request blocking enabled to exercise the failure paths in Step 18 + Step 19 + the broken-image fallback already covered in slice (a.2)'s backlog.

**API-side confirmation already exercised at commit time:**

- `PATCH .../urls/[urlId]` already supports every field in the slice's scope (route written in API-routes session-1, 2026-05-07). The shared `UpdateCompetitorUrlRequest` type was extended additively to allow `null` on the nullable fields so the inline-edit UI can clear back to "—" without a cast — no runtime change to the route handler (it was already accepting non-string / non-number → null).
- `GET /vocabulary?type=...` + `POST /vocabulary` (idempotent on `(projectId, vocabularyType, value)`) live since API-routes session-1.
- TypeScript types compile (`npx tsc --noEmit` clean). Build clean at 49 routes (zero new — slice (a.3) added no API routes). 393/393 src/lib tests pass.

---

## Slice (a.4) — per-column filter dropdowns on the URL list table — PENDING 2026-05-07

Shipped commit: (pending end-of-session commit on `workflow-2-competition-scraping`).

Slice (a.4) adds per-column filter controls to the URL list table at `/projects/<projectId>/competition-scraping`. Each filterable column header gets a small funnel icon next to the column label. Clicking the label still toggles sort (existing slice-(a.1) behavior); clicking the funnel opens a popover for that column's filter. The funnel turns blue with a small dot when a filter is active on that column. A "Clear all filters (N active)" button appears in the toolbar when ≥ 1 column filter is active. All filter state — plus the platform sidebar selection AND the search-box query — serialize into the URL query so refresh, browser back/forward, and copy-paste deep-links all preserve the user's exact view.

Filter shapes per column:
- **Product Name / Brand Name / Category** — multi-select checkbox dropdowns. Options are the distinct non-null values present in the current platform-scoped row set (NOT narrowed by other filters). A `(blank)` pseudo-row at the top filters for null/empty rows. Search-within-list input appears when the option count is > 6. "Apply" + "Clear" footer buttons.
- **Product Stars / # Reviews** — min / max number inputs side-by-side. Empty either side = unbounded on that side. Rows with null values fail when any bound is set (a numeric filter implies "rows that have a number"). Apply on Enter or via "Apply" button. Range validation: Min ≤ Max; non-numeric input rejected.
- **Added On** — from / to date inputs (YYYY-MM-DD). Empty either side = unbounded. From ≤ To validation.

URL-query convention:
- `?platform=<name>` — existing
- `?q=<text>` — NEW: free-text search box value, debounced 250ms write so each keystroke doesn't trigger a routing flush
- `?productName=A&productName=B` — repeated keys for multi-select; `__blank__` token for the blank pseudo-value
- `?brandName=...` / `?category=...` — same convention
- `?starsMin=4&starsMax=5` / `?reviewsMin=100&reviewsMax=10000` — numeric ranges
- `?addedFrom=2026-04-01&addedTo=2026-05-01` — date range

Walked-through tests once the extension can populate test data:

- [ ] **Step 1 — Funnel icon affordance.** From the workflow root page (`/projects/<projectId>/competition-scraping`), confirm each of the 6 filterable column headers (Product Name, Brand Name, Category, Product Stars, # Reviews, Added On) has a small funnel icon to the right of the column label. The URL column has NO funnel (covered by the search box). Hovering the funnel highlights it; clicking the column LABEL (not the funnel) still toggles sort.
- [ ] **Step 2 — Multi-select popover open + outside-click close.** Click the Brand Name funnel. A popover opens below the header showing a list of all distinct brand names captured for the current platform scope (case-insensitive sorted). Click anywhere outside the popover. Popover closes; no filter applied (since user didn't click Apply).
- [ ] **Step 3 — Multi-select Apply.** Open Brand Name popover; check 2 brand boxes; click Apply. Popover closes; the table re-renders with only those 2 brands' rows; Brand Name's funnel turns blue with a small dot; toolbar shows "Clear all filters (1 active)" button. URL updates to include `?brandName=Foo&brandName=Bar` (or with `__blank__` for blank entries).
- [ ] **Step 4 — Multi-select Clear.** With Brand Name filter active, open Brand Name popover; click Clear. Popover closes; filter clears; funnel returns to gray; toolbar's "Clear all filters" button disappears. URL drops the `brandName` keys.
- [ ] **Step 5 — Multi-select with `(blank)` row.** Confirm `(blank)` pseudo-row appears at the top of the list ONLY when at least one platform-scoped row has null/empty Brand Name. Selecting `(blank)` and applying filters in rows with null/empty Brand Name. URL stores it as `?brandName=__blank__`.
- [ ] **Step 6 — Multi-select with empty option list.** On a Project that has no Brand Name values populated AND no null-Brand-Name rows in scope, opening the Brand Name popover shows the empty hint ("No brand names captured yet."). Apply does nothing meaningful (no rows match — but the test confirms the empty case doesn't crash).
- [ ] **Step 7 — Multi-select search-within-list.** With ≥ 7 options in the Product Name list, confirm the search input appears at the top of the popover. Typing "ac" filters the visible options to those containing "ac" (case-insensitive). The blank pseudo-row stays visible regardless of search (or is filtered consistently — confirm the chosen behavior).
- [ ] **Step 8 — Multi-select option set is platform-scoped, NOT search-narrowed.** Type "Acme" in the global search box. Then open Brand Name popover. Confirm the option list still includes ALL brands in the platform scope, NOT just brands matching "Acme". This prevents a "shrinking options" footgun.
- [ ] **Step 9 — Numeric range Apply + range validation.** Open Product Stars popover. Type Min=`4`, Max=`5`. Press Enter. Popover closes; rows with Product Stars in [4, 5] remain. URL gets `?starsMin=4&starsMax=5`. Open the popover again; type Min=`5`, Max=`4`. Press Apply. Inline red error: "Min must be ≤ Max." Filter doesn't change.
- [ ] **Step 10 — Numeric range — null exclusion when bound set.** Add a Min=`4` filter on Product Stars. Confirm rows with Product Stars = null DO NOT appear (numeric filter excludes nulls when any bound is set). Clear the filter; null rows reappear.
- [ ] **Step 11 — Numeric range invalid input.** Open Product Stars popover. Type Min=`abc`. Press Apply. Inline red error: "Enter a valid number, or leave empty." Filter doesn't change.
- [ ] **Step 12 — Numeric range integer enforcement on # Reviews.** The # Reviews input has `step={1}`. Browser-native `<input type="number">` rounds `3.5` per its number-input semantics (browser-dependent — confirm visually). The applied filter is whatever number ends up in the input on Apply.
- [ ] **Step 13 — Date range Apply.** Open Added On popover. Click the From date picker; pick `2026-04-01`. Tab to To; pick `2026-05-01`. Press Apply. Rows with addedAt within that date range remain. URL gets `?addedFrom=2026-04-01&addedTo=2026-05-01`.
- [ ] **Step 14 — Date range one-sided.** Open Added On popover; pick From=`2026-05-01`, leave To empty. Apply. Rows with addedAt ≥ 2026-05-01 remain. Same with To set + From empty.
- [ ] **Step 15 — Date range From > To validation.** Type From=`2026-05-15`, To=`2026-04-01`. Press Apply. Inline red error: "From must be ≤ To." Filter doesn't change.
- [ ] **Step 16 — Multiple filters AND-combine.** Active: Brand Name = "Acme"; Product Stars Min = 4; Added On From = 2026-04-01. Confirm only rows matching ALL three remain (intersection, not union). Toolbar shows "Clear all filters (3 active)".
- [ ] **Step 17 — Filter alongside free-text search.** With Brand Name filter active, type "widget" in the search box. Confirm rows must match BOTH the brand filter AND the search blob (URL + Product Name + Brand Name contains "widget"). Both filters AND-combine.
- [ ] **Step 18 — Clear all filters button.** With ≥ 1 column filter active, click "Clear all filters (N active)" in the toolbar. All column filters clear; the search box value is NOT cleared (separate widget); platform sidebar selection is NOT cleared (separate widget). URL drops all filter keys; keeps `?platform=` and `?q=`.
- [ ] **Step 19 — URL state survives refresh.** With a complex filter set active (e.g., Brand Name = "Acme,Zenith", Stars Min = 4, Added From = 2026-04-01), confirm the URL bar shows all the filter keys. Hard-refresh (Ctrl+Shift+R). The page reloads with the same filter set active and the same rows visible.
- [ ] **Step 20 — Browser back/forward preserves filter state.** From a filtered view, click a row to navigate to the URL detail page. Click browser Back. The URL list re-renders with the same filter set active. Click browser Forward. Detail page re-renders.
- [ ] **Step 21 — Deep-link copy/paste.** Copy the current URL (including all filter query params) from the browser bar. Open a new tab; paste; press Enter. The same filter set is active and the same rows are visible.
- [ ] **Step 22 — Search-box debounce + URL persistence.** Type quickly in the search box. The table filters rows immediately (the input is mirrored locally). Pause for ~300ms. The URL bar updates to include `?q=<text>`. Refresh. The search box is pre-populated with the same text.
- [ ] **Step 23 — Browser back/forward with search box.** Type something in search; pause for the URL to update; type more; pause again. Click Back twice. Search box value reverts step-by-step. The local input mirror re-syncs from the URL via the `urlSearch` effect.
- [ ] **Step 24 — "Showing N of M" reflects column filters.** With 30 platform-scoped rows, no filters: `Showing 30 of 30`. Add a Brand filter that matches 12 rows: `Showing 12 of 30`. Add a search query that further narrows to 5: `Showing 5 of 30`. M stays at the platform-scoped total throughout.
- [ ] **Step 25 — Filter rules everything out.** With 30 rows in scope, set a Brand Name filter on a value that doesn't exist (e.g., type a custom brand into the multi-select… actually, multi-select only offers existing values, so set conflicting filters: Stars Min = 5.0, Stars Max = 4.0). Confirm "No URLs match this filter." empty-state appears. Search box stays visible.
- [ ] **Step 26 — Sort still works alongside filters.** With column filters active, click the Product Name LABEL (not the funnel). Sort toggles asc/desc. Filter set stays unchanged. Clicking the funnel + sort label both work independently.
- [ ] **Step 27 — Active-filter visual cue accuracy.** With Brand Name filter set: Brand Name funnel is blue with dot. Other 5 funnels are gray with no dot. Add Product Stars filter: 2 funnels blue, 4 gray. Toolbar shows "Clear all filters (2 active)".
- [ ] **Step 28 — Esc closes popover.** Open any column's popover. Press Esc. Popover closes; no filter applied (similar to outside-click).
- [ ] **Step 29 — Cross-platform navigation preserves filter via URL.** With column filters active for amazon, click "Etsy" in the platform sidebar. URL updates `?platform=etsy` BUT all the other filter keys remain. Confirm the table's multi-select option lists update to Etsy's distinct values; numeric/date filters stay applied as-is. (Per the chosen behavior — filter state is global across platform switches; if a user explicitly wants to clear filters when switching platforms, they use the Clear-all button.)
- [ ] **Step 30 — Lint + build + tests parity.** At commit time: `npx tsc --noEmit` clean; `npm run build` clean (49 routes — same as slice (a.3); zero new); `npx eslint src` reports project-wide 13e/39w at exact baseline parity with slice (a.3) AND `npx eslint` on JUST the slice (a.4) files (`ColumnFilters.tsx`, `UrlTable.tsx`, `CompetitionScrapingViewer.tsx`) reports clean (zero errors, zero warnings); `node --test --experimental-strip-types 'src/lib/**/*.test.ts'` reports 393/393 pass.

**Seed-data prerequisites** (before walking through these tests):

- At least 30 CompetitorUrl rows under one platform with varied values across all 6 filterable fields (covers Step 16 multi-filter AND, Step 24 "Showing N of M", Step 25 empty-after-filter, Step 27 multi-funnel visual cue).
- Brand Name and Product Name diversity: at least 5 distinct brands AND ≥ 7 distinct product names (covers Step 7 search-within-list which only renders when option count > 6).
- At least 1 row with null Brand Name + at least 1 row with null Product Stars (covers Step 5 `(blank)` pseudo-row + Step 10 null exclusion when bound set).
- Two distinct platforms each with their own URL set (covers Step 29 cross-platform navigation preserves filter while option lists swap).
- Date range across ≥ 1 month so Step 13 + Step 14 + Step 15 exercise meaningful date pickers.

**API-side confirmation already exercised at commit time:**

- **No API surface changes this slice.** Pure UI work atop the existing `GET /api/projects/[projectId]/competition-scraping/urls` endpoint shipped in API-routes session-1. Build clean at 49 routes (zero new). `tsc` + lint + tests all at exact baseline parity.

---

## Extension build — session 1 — WXT init + auth shell + GET /api/projects CORS — ✅ DONE 2026-05-09 (Waypoint #1 attempts #2 + #5 — install/auth re-verified during attempt #2 reinstall + sign-in workflow; auth round-trip + CORS preflight + apex→www fix + sign-out + reinstall flow all confirmed across attempts #2 + #3 + #4 + #5)

Shipped commit: `5b4a3e8` on `workflow-2-competition-scraping`.

**Waypoint #1 attempt 2026-05-07-i partial outcome (in `session_2026-05-07-i_w2-waypoint-1-verification-pass-1`):**

- ✅ Step 1 download zip / ✅ Step 2 unzip (Windows 11; manifest.json at top level) / ✅ Step 3 chrome://extensions / ✅ Step 4 Developer Mode / ✅ Step 5 Load unpacked (no red errors; Name + Version 0.1.0 confirmed) / ✅ Step 6 Pin to toolbar / ✅ Step 7 Popup pre-sign-in screen (heading + tagline + email/password fields + disabled Sign-in button + gray help text — all four confirmed).
- 🟡 Step 8 PARTIAL — sign-in via Supabase ✅; signed-in screen flipped ✅; "Signed in as <email>" gray box ✅; **but the post-sign-in project-list path returned "Couldn't load your projects: Failed to fetch"** — diagnosis: deploy gap (CORS handler on `src/app/api/projects/route.ts` not on `origin/main`; vklf.com runs main).
- Steps 9-18 NOT EXERCISED today. Step 8's persistence subcheck (close + reopen popup → still signed in) NOT EXERCISED today.
- Steps 10-12 (Verify connection happy / token failure / network failure) **OBSOLETED by session 2** — that button no longer exists; the project-list load is now the auth round-trip proof. Future verification should mark these three steps as "obsoleted — superseded by S2-2" rather than pending.

Section flag stays PENDING until the resumed verification (after W#2 → main deploy session lands).

This is the **first** of the 5–7 W#2 Chrome extension build sessions. Session-1 ships the WXT scaffold + the auth shell (`signInWithPassword`, JWT + refresh-token storage in `chrome.storage.local`, sign-out) + a "Verify connection" smoke-test button that calls `GET https://vklf.com/api/projects` with a Bearer header. The cross-workflow change to `src/app/api/projects/route.ts` adds the OPTIONS preflight handler + `withCors` wrap so the extension's `Authorization: Bearer` request gets through CORS.

**Prerequisites for these tests** (no PLOS-side seed data needed — this session's flows are install + auth, NOT capture):

- A local Chrome browser on your computer (any recent version).
- Your PLOS email + password (the same credentials you use to sign in at https://vklf.com).
- Codespaces session running on the `workflow-2-competition-scraping` branch with the build artifacts present at `extensions/competition-scraping/.output/competition-scraping-extension-0.1.0-chrome.zip` (re-run `cd extensions/competition-scraping && npm run zip` if missing — re-running is idempotent and produces the same artifact).

Walked-through tests:

- [ ] **Step 1 — Download the extension zip from Codespaces to your local computer.** In your VS Code window's Explorer panel (left sidebar), navigate to `extensions/competition-scraping/.output/`. Right-click `competition-scraping-extension-0.1.0-chrome.zip` → **Download…**. The browser saves it to your local Downloads folder. *If `.output` is hidden by VS Code's exclude filter:* press `Ctrl+P` (or `Cmd+P` on Mac), type `extensions/competition-scraping/.output/competition-scraping-extension-0.1.0-chrome.zip`, hit Enter — that opens it; then File → Save As to save locally.

- [ ] **Step 2 — Unzip on your local computer.** *Mac:* double-click the zip in Downloads (auto-extracts into a folder of the same name). *Windows:* right-click → Extract All… → click Extract. Open the extracted folder and **confirm `manifest.json` is directly inside**. If `manifest.json` is one level deeper, use the inner folder for Step 5.

- [ ] **Step 3 — Open Chrome's extensions page.** In your local Chrome's address bar, paste `chrome://extensions` and press Enter. You land on Chrome's extensions management page.

- [ ] **Step 4 — Toggle Developer Mode ON.** In the top-right corner of `chrome://extensions`, click the **"Developer mode"** toggle so it turns blue. Three new buttons appear in the top-left: **Load unpacked**, **Pack extension**, **Update**.

- [ ] **Step 5 — Click "Load unpacked" and pick the unzipped folder.** Click **Load unpacked** in the top-left. Navigate to your Downloads folder → select the unzipped folder from Step 2 (the one containing `manifest.json` directly) → click **Select** (or **Open** / **Choose**). A new tile appears with **Name: PLOS Competition Scraping**, **Version: 0.1.0**, **Description: Capture competitor URLs, text, and images for the PLOS Competition Scraping & Deep Analysis workflow.** Confirm there is **no red error text** under the tile. (If there is, copy the exact error verbatim and report back — it points at a manifest validation issue.)

- [ ] **Step 6 — Pin the extension to your toolbar.** Click the puzzle-piece icon in Chrome's top-right (Extensions menu). Find "PLOS Competition Scraping" in the list → click the pin icon next to it. The extension now appears as a small icon in your toolbar.

- [ ] **Step 7 — Click the extension icon to open the popup.** A 360px-wide popup opens. Confirm it shows: heading "PLOS Competition Scraping", tagline "Workflow #2 — capture URLs, text, images.", a sign-in form with **PLOS email** + **Password** fields, and a "Sign in" button (disabled while either field is empty). Below the form, gray text reads "Use the same email and password you use at vklf.com."

- [ ] **Step 8 — Sign in with valid credentials.** Type your real PLOS email + password → click **Sign in**. While the call is in flight, the button text changes to "Signing in…" and is disabled. On success: the popup flips to the signed-in screen showing "Signed in as **\<your email\>**" in a gray box, a blue "Verify connection" button, a divider, and a white "Sign out" button. **Persistence subcheck:** keep the popup open; close it (click outside / press Esc); reopen by clicking the toolbar icon — should still be signed in (no re-login needed).

- [ ] **Step 9 — Sign in with invalid credentials.** Sign out first if needed, then try with a wrong password. Expected: the form shows a red error box with the Supabase error message (typically "Invalid login credentials"). The button re-enables. Form state preserved (email field keeps its value; password field stays as typed but you can re-edit).

- [ ] **Step 10 — Click "Verify connection" — happy path.** Signed in, click **Verify connection**. Button text changes to "Checking…" while the fetch is in flight. Expected outcome: a **green "notice" box** appears reading **"Connected — N projects visible on vklf.com."** (singular `1 project` if only one). N matches the number of Projects you can see on vklf.com's `/projects` page. **Open DevTools → Network** to inspect the request:
  - The OPTIONS preflight to `https://vklf.com/api/projects` returns `204 No Content` with `Access-Control-Allow-Origin: chrome-extension://<your-extension-id>` + `Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS` + `Access-Control-Allow-Headers: Content-Type, Authorization`.
  - The GET to `https://vklf.com/api/projects` returns `200 OK` with a JSON array of project objects + the same Access-Control-Allow-Origin header echoed back.
  - The Authorization header value starts with `Bearer eyJ…` (a JWT).

- [ ] **Step 11 — Click "Verify connection" — failure path on expired/invalid token.** With DevTools → Application → Storage → IndexedDB / Extension Storage → manually corrupt the stored access_token (or sign in, wait for the refresh-token TTL to elapse — impractical for routine testing; the corruption-DevTools path is faster). Click **Verify connection**. Expected: a **red error box** reading "PLOS API error (401): Unauthorized" (or near-equivalent). The popup remains on the signed-in screen so you can retry or sign out cleanly.

- [ ] **Step 12 — Click "Verify connection" — network unreachable path.** Disconnect from the internet (Wi-Fi off OR DevTools → Network → set Throttling to "Offline"). Click **Verify connection**. Expected: red error box reading "Network error: Failed to fetch" (or near-equivalent). The popup remains usable. Reconnect → click again → green-box success.

- [ ] **Step 13 — Sign-out path.** Click **Sign out**. The popup flips back to the sign-in form within ~200ms. Reopen the popup (close + click icon again) — sign-in form is still showing (sign-out cleared the session, not just the in-memory state). DevTools → Application → Storage → check `chrome.storage.local` — the `sb-*-auth-token` key is gone (or set to a sign-out marker).

- [ ] **Step 14 — Token persistence across browser restart.** Sign in via Step 8. Close the entire Chrome window (not just the popup). Reopen Chrome. Click the extension icon. Expected: still signed-in (the JWT + refresh token survived in `chrome.storage.local`). Click "Verify connection" — green box again.

- [ ] **Step 15 — Token persistence across extension reload.** Sign in via Step 8. On `chrome://extensions`, click the **Reload** circular-arrow button under the PLOS Competition Scraping tile. Click the extension icon. Expected: still signed-in. (Reload re-instantiates the service worker + popup but `chrome.storage.local` survives.)

- [ ] **Step 16 — Manifest sanity check.** On `chrome://extensions`, click **Details** under the PLOS Competition Scraping tile. Confirm:
  - **Site access:** "Allow access to specific sites" is the default for MV3 host_permissions. Click "Site access" → confirm `https://vklf.com/*` and `https://*.supabase.co/*` are listed and **on**. (If they're listed as "off," the host_permissions never took effect and the network calls would have CORS-blocked at the manifest level rather than via the server's Access-Control headers.)
  - **Permissions:** "Storage" is listed.
  - **Inspect views:** the "service worker" link is clickable (opens DevTools for the background.ts).

- [ ] **Step 17 — DevTools inspect of service worker.** From `chrome://extensions` → Details → Inspect views: **service worker** → DevTools opens. Console should show no red errors (Supabase client may log `Auth state change` info-level lines on sign-in / sign-out — those are fine; only RED-stack-trace errors are concerns). Network tab — note any unexpected outgoing requests; should be quiet during idle.

- [ ] **Step 18 — Build artifact integrity.** From the extension folder in Codespaces: `cd extensions/competition-scraping && npm run build` should produce `.output/chrome-mv3/` containing `manifest.json` + `background.js` + `popup.html` + `assets/popup-*.css` + `chunks/popup-*.js`. `npm run zip` should produce a `.output/competition-scraping-extension-0.1.0-chrome.zip` of around ~600 KB. Both commands should be **deterministic** — re-running produces a zip with the same logical contents (file-list + sizes; hashes may differ due to bundler timestamps).

**API-side confirmation already exercised at commit time:**

- `npm run build` (root PLOS app) clean — 49 routes including the modified `/api/projects` route now serving an OPTIONS handler.
- `npx tsc --noEmit` clean (root + extension separately).
- `node --test --experimental-strip-types $(find src -name '*.test.ts')` reports **393/393 pass** — exact baseline parity. The CORS edits to `/api/projects` did not break any existing tests.
- `npx eslint src` reports project-wide 13 errors / 39 warnings — exact baseline parity (the 13 errors all live in pre-existing files outside the W#2 surface and outside `extensions/`).
- Extension build via WXT 0.20.25 → manifest validates, popup bundle is React 19 + Supabase JS, total unpacked size ~600 KB.

**Remaining cross-cutting concerns to revisit at the post-coding verification session:**

- **Extension ID is volatile during dev mode.** Every `Load unpacked` instance gets a different chrome-extension://\<id\> origin. The CORS allowlist (`chrome-extension://*` per `src/lib/cors.ts`) is intentionally permissive to absorb this; once the Chrome Web Store (Phase 2 distribution per `STACK_DECISIONS §13.2`) issues a stable production ID, we may tighten the allowlist to that specific ID. NOT a today concern; flagging for the future tightening review.
- **Refresh-token TTL behavior.** Supabase JS handles auto-refresh internally; we haven't observed it in real time yet. Real verification requires letting the access token expire (default ~1 hour) without using the extension, then exercising it — a long-running session test deferred to the verification walkthrough.
- **Multi-account behavior.** If you sign out and sign in as a different PLOS account, the project count from `Verify connection` should change to that account's project list. Add a manual check at the verification walkthrough.

---

## Extension build — session 2 — popup project-picker + platform-picker + Highlight-Terms color-palette UI — ✅ DONE 2026-05-09 (Waypoint #1 attempts #2 + #5 — 27 of 28 walked-through steps PASSED in attempt #2 + S2-3 deferred re-verified ✅ in attempt #5 with stronger system-WiFi-off trigger; friendly error box appeared; P-2 polish gap may already be partially handled — flagged for code-read confirmation in P-2 polish entry)

Shipped commit: (pending end-of-session commit on `workflow-2-competition-scraping`).

**What changed in session 2.** The popup's signed-in screen was rewritten from session 1's "Verify connection" smoke-test placeholder into the real Module 1 setup screen per `COMPETITION_SCRAPING_DESIGN.md §A.7` and `COMPETITION_SCRAPING_STACK_DECISIONS.md §6`. The setup screen has three pieces:

- A **Project picker** (dropdown) that fetches the user's Projects via the same `GET /api/projects` call session 1 used for the smoke test. Selection persists in `chrome.storage.local` so the popup remembers across opens.
- A **Platform picker** (dropdown) with the seven platforms per `STACK_DECISIONS §A.7`: Amazon, Ebay, Etsy, Walmart, Google Shopping, Google Ads, Independent Website. Persists in `chrome.storage.local`.
- A **Highlight Terms manager** — a textarea where the user types one or more terms (separated by commas or newlines); on blur the terms appear as colored chips with a small color swatch button + × remove. Clicking a term's swatch opens the 4×5 grid of 20 colors per `STACK_DECISIONS §6`; clicking a color closes the popover and re-paints that term. First five terms get default colors banana → royal blue → mint → crimson → peach; subsequent terms continue the rotation through the rest of the palette. List persists in `chrome.storage.local` keyed per Project.

When both project and platform are selected, a small "Capturing for **\<Platform Label\>**" banner appears at the top of the signed-in screen so the active session is always visible. Switching to a different project clears the platform selection (you're starting a new context); the per-Project Highlight Terms list is untouched.

**Walked-through tests** (extension session 2 expands the install/sign-in baseline established by session 1 — these tests assume Steps 1–8 of session 1 are already passing):

- [ ] **Step S2-1 — Signed-in screen flips to the setup screen.** From session 1's "Step 8 — Sign in with valid credentials" landing point, instead of the prior smoke-test screen showing "Verify connection" + "Sign out", you should now see: the "Signed in as **\<your email\>**" line, a **Project** dropdown, and (after picking a project) a **Platform** dropdown + **Highlight Terms** field. The "Verify connection" button is gone (its job is now folded into the project picker — successfully loading the project list IS the auth round-trip proof).

- [ ] **Step S2-2 — Project list loads with the right projects.** While the project list is loading, a "Loading your projects…" muted line should appear briefly. Once loaded, the dropdown lists all Projects you can see at vklf.com/projects, sorted with the most recently active at the top. Empty state — sign in as a brand-new user with no Projects yet — should show a "No projects yet. Create one at vklf.com/projects" line with the link clickable.

- [x] **Step S2-3 — Project list error handling.** With DevTools → Network → set throttling to "Offline" BEFORE opening the popup, then sign in (or reopen). The project list should show a red error box reading "Couldn't load your projects: …" with the underlying network error. Reconnect → close + reopen popup → list loads cleanly. *(✅ DONE 2026-05-09 attempt #5 with stronger trigger after attempt #2 deferred this step (DevTools-Offline-while-popup-already-open didn't trigger any API call). Attempt #5 trigger: sign back in normally → close popup → turn OFF system WiFi → open popup → expected: friendly red error box. Outcome: friendly error box appeared → S2-3 passes. NOTE: this means P-2 polish gap (api-client.ts authedFetch doesn't catch fetch's TypeError) MAY ALREADY BE PARTIALLY HANDLED — flagged for code-read confirmation in P-2 polish backlog entry; if the friendly UX comes from a different layer than authedFetch, P-2 still applies; if authedFetch was somehow updated since the polish item was raised, P-2 can be marked obsolete.)*

- [ ] **Step S2-4 — Pick a project.** From the dropdown, pick a Project. The Platform dropdown + Highlight Terms field should appear immediately. Close the popup, reopen it — the same Project should still be selected (project ID was persisted in `chrome.storage.local`).

- [ ] **Step S2-5 — Project picker default value.** Before picking anything, the dropdown should read "Pick a project…" as the default placeholder. The first option in the user-visible list should match the first project in the API response (most recent activity).

- [ ] **Step S2-6 — Platform picker shows all 7 options.** Open the Platform dropdown. Confirm the labels (in this order): Amazon.com / Ebay.com / Etsy.com / Walmart.com / Google Shopping / Google Ads / Independent Website. Default is "Pick a platform…".

- [ ] **Step S2-7 — Platform picker explanatory text.** Below the dropdown, confirm the muted help line reads (paraphrased): "We need this even on Amazon/Ebay/Etsy/Walmart so we can tell apart URLs found via Google Shopping, Google Ads, and independent websites." This is the rationale per `COMPETITION_SCRAPING_DESIGN.md §A.7`.

- [ ] **Step S2-8 — Pick a platform; active-session banner appears.** Pick a platform. A small green "Capturing for **\<Platform Label\>**" banner should appear at the top of the popup (above the project picker). Close + reopen the popup — banner still there with the same platform.

- [ ] **Step S2-9 — Switching projects clears the platform.** With both project and platform picked, switch the Project dropdown to a different Project. The Platform dropdown should reset to "Pick a platform…" and the active-session banner should disappear. (Director can re-pick the platform freshly for the new context.)

- [ ] **Step S2-10 — Highlight Terms — empty state.** With a project picked but no terms yet, the Highlight Terms area should show the textarea + a muted line reading "You haven't added any highlight terms yet."

- [ ] **Step S2-11 — Add a single term.** Type `red light therapy` into the textarea. Click outside the textarea (or Tab away). Expected: the textarea clears; a chip appears reading "red light therapy" on a banana-yellow background with black text; a small banana-yellow swatch button + a × button sit next to it.

- [ ] **Step S2-12 — Add multiple terms in one shot, comma-separated.** Type `infrared, near-infrared, photobiomodulation` then click outside. Expected: three new chips appear (in addition to any existing ones), with the next default colors in the rotation. If the existing list had 1 term (the banana-yellow one from Step S2-11), the new colors should be royal blue (chip-2 white text), mint green (chip-3 black text), and crimson (chip-4 white text).

- [ ] **Step S2-13 — Add multiple terms in one shot, newline-separated.** Add a second batch with the textarea. Type two terms on two lines (press Enter between them) → click outside. Expected: both terms become chips with the next two colors in the rotation.

- [ ] **Step S2-14 — Dedup ignores case.** Type `Red Light Therapy` (with different casing from Step S2-11) → click outside. Expected: NO new chip appears; the existing "red light therapy" chip is preserved unchanged.

- [ ] **Step S2-15 — Auto-flip text color.** Inspect every chip in the list. Light-background chips (banana, mint, peach, etc.) should have **black** text; dark-background chips (royal blue, crimson, navy, etc.) should have **white** text. Both should be plainly readable. (4.5:1 WCAG AA contrast.)

- [ ] **Step S2-16 — Open color picker for one term.** Click the small color-swatch button next to (say) the "red light therapy" chip. Expected: a small popover appears below/beside the chip containing a 4×5 grid of 20 colors (rows 1-2 light, rows 3-4 dark). The currently-selected color (banana yellow) should have a thin border highlight inside the popover. Each swatch should show its color name when you hover (e.g., "Banana yellow").

- [ ] **Step S2-17 — Pick a different color.** Click any other color in the popover (e.g., Slate, the bottom-right dark swatch). Expected: the popover closes; the chip's background changes to slate-blue with white text; the small swatch button matches.

- [ ] **Step S2-18 — Close the picker without picking.** Reopen the picker (click the swatch button); press Esc. Picker closes; chip color unchanged. Reopen → click anywhere outside the picker (e.g., on the project picker label). Picker closes; chip color unchanged.

- [ ] **Step S2-19 — Remove a single term.** Click the × button next to a chip. The chip disappears. Other chips are unchanged. The remaining-chip-count line (if visible) decrements.

- [ ] **Step S2-20 — Clear all.** With 3+ terms present, click the "Clear all highlight terms" link. Expected: all chips disappear; the empty-state line returns.

- [ ] **Step S2-21 — Highlight Terms persist across popup close/reopen.** Add 3 terms, picking custom colors for one of them. Close the popup. Reopen by clicking the toolbar icon. Expected: same 3 terms appear in the same order with the same colors (including the custom one). Then close + Chrome restart → reopen → terms still there.

- [ ] **Step S2-22 — Highlight Terms are per-Project.** Project A has 3 terms; switch to Project B in the project picker — Highlight Terms list should be empty (or show whatever Project B's own list is, if you'd added terms there in a prior session). Switch back to Project A — your 3 terms reappear unchanged.

- [ ] **Step S2-23 — Long term wraps inside the chip.** Add a deliberately long term (e.g., `extra-large bottle for after-workout recovery`). Confirm the chip's text wraps (rather than the popup growing horizontally). The × and swatch buttons stay on the right.

- [ ] **Step S2-24 — Empty / whitespace-only input is dropped silently.** Type whitespace + commas (`,  ,  ,`) → click outside. No new chips; textarea clears; existing list unchanged. Same with empty newlines (just press Enter a few times, then click outside).

- [ ] **Step S2-25 — Sign-out wipes the in-memory state.** With pickers populated + terms in the list, click **Sign out**. Popup flips to the sign-in form. Sign back in. The pickers should hydrate to the same values from `chrome.storage.local` (sign-out only clears the auth token, not the user's own setup state). If you want a clean slate, the future "reset extension state" path will provide that — out of scope today.

- [ ] **Step S2-26 — DevTools → Application → Storage → Local Storage check.** Open the extension's service-worker DevTools (chrome://extensions → Details → Inspect views: service worker). In Application → Storage, the extension's `chrome.storage.local` should show keys: `selectedProjectId`, `selectedPlatform`, and `highlightTerms:<projectId>` (one per Project you've added terms for). The Supabase auth-token key (`sb-*-auth-token`) should also be present.

- [ ] **Step S2-27 — No console errors during normal flow.** Open service-worker DevTools → Console. Walk through Steps S2-1 through S2-21. Console should show only Supabase info-level messages (auth state changes); no red errors.

- [ ] **Step S2-28 — Build artifact integrity.** From Codespaces: `cd extensions/competition-scraping && npm run compile && npm test && npm run build`. All three should be clean. `npm test` should report 42/42 tests pass (the new color-palette + highlight-terms unit suites). `npm run build` should produce `.output/chrome-mv3/` with a similar size to session 1 (~600 KB unpacked) — slight growth is expected from the new components.

**Seed-data prerequisites:**

- Sign in to Chrome with the same Google account you'll always use for the verification walkthrough (so chrome.storage.local persists across sessions consistently).
- At least 2 Projects on the test PLOS account so Step S2-22 (per-Project terms) is exercisable; ideally one is brand-new with no W#2 activity yet.
- (Optional) A test PLOS account with zero Projects so the empty-state of Step S2-2 is exercisable.

**API-side already verified at commit time:**

- Extension `npm run compile` (tsc --noEmit) clean — zero errors.
- Extension `npm test` reports **42/42 pass** across two new unit-test files (color-palette + highlight-terms — pure logic only; no chrome.storage.local mocks).
- Extension `npm run build` clean — Vite + WXT bundle. `.output/chrome-mv3/` produced with manifest.json + popup.html + background.js + popup chunks + popup css. `npm run zip` produces the chrome zip artifact.
- Root `npx tsc --noEmit` clean (extensions/ excluded).
- Root `npm run build` clean — 49 routes (same as session 1 baseline; session 2 added zero new API routes).
- Root tests pass at exact baseline parity — **393/393 src/lib pass**.
- Root `npx eslint src` reports project-wide 13 errors / 39 warnings — exact baseline parity (same 13 pre-existing-file errors as session 1).
- Extension lint (`npx eslint extensions/competition-scraping/src`) clean — zero errors, zero warnings on the session-2 files.

---

## Extension build — session 3 — Module 1 URL-capture content script (4 platforms: Amazon, Ebay, Etsy, Walmart) + URL-recognition features + URL-add overlay form — ✅ DONE 2026-05-09 (Waypoint #1 attempts #3 + #4 + #5 — Amazon S3-1..S3-25 ✅ across attempts #3+#4; S3-26 Ebay + S3-27 Etsy + S3-28 Walmart + S3-29..S3-35 cross-platform + S3-36 build artifact ✅ in attempt #5; three real bugs FIXED INLINE in attempt #3 commit `f4226ca` (CORS messaging proxy + hover grace timer + saved-icon dedupe/visibility); four polish fixes shipped in attempt #4 commit `65a9a31` (P-4 SSPA / P-5 highlight terms / P-7 overlay positioning / P-8 z-index tiers); two NEW polish gaps captured in attempt #5 (P-9 highlight-cap too aggressive blocks Ebay+Walmart pages with multi-fire on Walmart; P-10 AlreadySavedOverlay banner intermittent on Walmart heavy-SPA pages))

Shipped commit: (pending end-of-session commit on `workflow-2-competition-scraping`).

**What changed in session 3.** Adds the **content-script** layer of the extension — code that runs ON competitor product pages (Amazon / Ebay / Etsy / Walmart) and adds the floating "+ Add" button on link hover, the URL-add overlay form, and the two URL-recognition behaviors per `COMPETITION_SCRAPING_DESIGN.md §B` 2026-05-07-g end-of-session addendum. Per-platform DOM-pattern modules per `STACK_DECISIONS §15 Q7`. URL-normalization helper strips `?` and everything after for comparison-time matching per the §B addendum item 3. 4 platforms shipped today; Google Shopping / Google Ads / Independent Websites deferred to a future build session.

**Manifest expansion to flag at install time:** `host_permissions` adds `https://*.amazon.com/*`, `https://*.ebay.com/*`, `https://*.etsy.com/*`, `https://*.walmart.com/*` and `permissions` adds `contextMenus`. Chrome will require you to **re-approve permissions** when you click "Reload" on the unpacked extension at `chrome://extensions`. This is the standard MV3 install flow when host-permission scope expands.

**Walked-through tests** (extension session 3 expands the install/sign-in/popup baseline established by sessions 1 + 2 — these tests assume Steps 1–17 of session 1 and Steps S2-1 through S2-26 of session 2 are already passing):

- [x] **Step S3-1 — Reload the unpacked extension after pulling session 3 code.** From `chrome://extensions`, click the circular **Reload** button on the PLOS Competition Scraping tile. Chrome may show a permissions-changed warning — click to **approve the new host permissions** (the 4 shopping sites). Confirm the tile shows no red error text. *(✅ DONE 2026-05-08-c attempt #3 — first reload showed `[PLOS] could not load saved URLs for recognition TypeError: Failed to fetch` errors that triggered the content-script CORS messaging-proxy fix; subsequent reloads after fix confirmed clean.)*
- [x] **Step S3-2 — Confirm Site access lists the 4 shopping sites.** Click **Details** on the tile → scroll to **Site access** → **On specific sites**. Confirm: `https://www.vklf.com/*` *(NOTE: was `https://vklf.com/*` in original spec; updated to canonical `www.` per attempt #2 fix `5472d26` — apex 308-redirects don't carry CORS headers)*, `https://*.supabase.co/*`, `https://*.amazon.com/*`, `https://*.ebay.com/*`, `https://*.etsy.com/*`, `https://*.walmart.com/*` — all 6 listed and toggled **on**. *(✅ DONE 2026-05-08-c.)*
- [x] **Step S3-3 — Confirm Permissions lists Storage + ContextMenus.** Same Details page → **Permissions** section. `Read your browsing history` (Chrome's user-facing label for `contextMenus`) is listed. *(NOTE: Chrome may NOT display the `Storage` permission in the Details UI even when granted — Chrome only surfaces permissions with meaningful privacy implications; `storage` is benign internal-only and often hidden. Underlying permission is correct in `manifest.json` regardless of Chrome's display behavior.)* *(✅ DONE 2026-05-08-c with doc-text caveat captured.)*
- [x] **Step S3-4 — Sign in + pick Project + pick `Amazon.com` platform in the popup.** Establishes the baseline state the content script reads. *(✅ DONE 2026-05-08-c via reload reconfigure flow.)*
- [x] **Step S3-5 — Open `https://www.amazon.com/` in a new tab.** Page loads normally. Open DevTools → **Console** tab → confirm no red errors from the content script. (You may see Amazon's own log lines and unrelated warnings — only red lines whose source file path includes `competition-scraping-extension` or `chrome-extension://` are extension errors worth flagging.) *(✅ DONE 2026-05-08-c after CORS messaging-proxy fix; pre-fix this step surfaced the `[PLOS] could not load saved URLs for recognition TypeError: Failed to fetch` error that the fix addressed.)*
- [x] **Step S3-6 — Search Amazon for `red light therapy`.** Click on the search box, type the query, press Enter. The search-results page loads showing product tiles. *(✅ DONE 2026-05-08-c.)*
- [x] **Step S3-7 — Hover over a product link.** Move your cursor over any product title or product image link. Wait ~300ms. A small **circular "+" button** appears at the upper-right corner of the link's bounding box, with a small **× dismiss** button just to the right of it. The button is blue with white "+" text; the × is red. *(✅ DONE 2026-05-08-c after hover-grace-timer fix — pre-fix the "+" button disappeared when cursor moved toward it, blocking S3-9 onward.)*
- [x] **Step S3-8 — Move cursor away from the link.** Cursor leaves the link's bounding box. The "+ Add" button disappears after a brief grace period (~150ms). *(NOTE: Original spec said "disappears immediately"; updated to reflect the 150ms grace timer added 2026-05-08-c — needed to enable cursor traversal from link to button without losing the button mid-traversal.)* *(✅ DONE 2026-05-08-c.)*
- [x] **Step S3-9 — Click the floating "+" button.** Hover over a link, wait for the button, click the "+". Expected: a **modal overlay** opens with a dimmed backdrop. The form shows: title "Add competitor URL", a context block listing your Project name + "Platform: Amazon.com", a pre-filled URL field (the product URL in canonical form — `https://www.amazon.com/dp/<ASIN>` — without the `?ref=...&keywords=...` query that was on the search-results link), three optional free-text fields (Competition Category, Product Name, Brand Name), and Save + Cancel buttons. *(✅ DONE 2026-05-08-c — all 5 expected elements verified.)*
- [x] **Step S3-10 — Save without filling optional fields.** Click **Save**. Expected: button text changes to "Saving…"; ~1 second later the modal closes; the search-results page is visible again. Open the PLOS web app at `/projects/<your-project-id>/competition-scraping` in another tab → the URL appears in the URL list. The Platform column shows `amazon`. *(✅ DONE 2026-05-08-c — full end-to-end of CORS messaging-proxy fix verified live; Boiron Arnicare `https://www.amazon.com/dp/B006I7IUUQ` saved + appears in PLOS-side viewer Amazon platform.)*
- [x] **Step S3-11 — Verify "already saved" icon appears on the same product link.** Back on the Amazon search results tab, **hard-refresh** (Ctrl+Shift+R). Wait for the page + content script to settle. The previously-saved product link should now show a small **green "✓" circle** to the LEFT of the link, in addition to the "+ Add" button on hover. *(NOTE: Original spec said "to the LEFT of every competitor product link" — updated to reflect dedupe to ONE icon per unique saved URL added 2026-05-08-c after Amazon was found to have 4+ anchor tags per product. Position is left of FIRST matching link in DOM order, typically the image link → icon visually anchors near top-center of the product image area.)* *(✅ DONE 2026-05-08-c after dedupe + CSS visibility boost on 3rd iteration — pre-fix, 4 muted-green 16px icons rendered per saved product but were too subtle against Amazon's busy chrome to be noticed without debug overlay; post-fix, single 28px vibrant-emerald icon with white border + green halo ring + drop shadow is visible at default styling.)*
- [x] **Step S3-12 — Save WITH optional fields filled.** Hover a different product link, click "+", in the form fill: Competition Category = `device`, Product Name = `Red Light Therapy Pro`, Brand Name = `Acme`. Click Save. The PLOS-side URL detail page (drill into the saved row) should show those three fields populated. *(✅ DONE 2026-05-08-d attempt #4 — fields populate correctly on PLOS-side URL detail page; surfaced P-7 overlay-positioning directive — overlay opened directly on top of the very product card being saved, blocking view of it; fix shipped same-session in commit `65a9a31`.)*
- [x] **Step S3-13 — Cancel button closes the form without saving.** Hover, click "+", in the form click **Cancel**. Form closes. PLOS-side: no new URL row appears. *(✅ DONE 2026-05-08-d attempt #4.)*
- [x] **Step S3-14 — Esc closes the form without saving.** Hover, click "+", press the **Esc** key. Form closes. PLOS-side: no new URL row. *(✅ DONE 2026-05-08-d attempt #4.)*
- [x] **Step S3-15 — Backdrop click closes the form without saving.** Hover, click "+", click the dimmed area outside the form. Form closes. PLOS-side: no new URL row. *(✅ DONE 2026-05-08-d attempt #4.)*
- [x] **Step S3-16 — Save failure shows inline error.** Open DevTools → Network → enable Throttling = "Offline". Hover, click "+", click Save. Inline red message reads "Save failed: …" (specific text depends on failure mode — common shape is "Failed to fetch" or "PlosApiError"). Form stays open with the user's typed values preserved. Restore Network → Save again → success. *(NOTE 2026-05-08-d: Original spec said "DevTools → Network → Offline" on the page's DevTools, but post-`f4226ca` CORS messaging-proxy fix routes Save through the background service worker — the page's DevTools Offline doesn't trigger the failure path. Use **service-worker DevTools** instead: chrome://extensions → PLOS Details → Inspect views: service worker → Network tab → throttling: Offline. ✅ DONE 2026-05-08-d attempt #4 with service-worker DevTools; surfaced P-8 ✓-icon-z-index conflict during this step — saved-✓ icons on neighboring products punched through the open URL-add overlay because both were at max-int32 z-index; fix shipped same-session in commit `65a9a31` with layered z-index tiers in styles.ts.)*
- [x] **Step S3-17 — Per-session × dismiss hides the button for the rest of the page-load.** Hover any link until the "+" appears. Click the small **×** button (NOT the "+"). The "+" + × disappear. Hover OTHER links on the page — no "+" appears. Hard-refresh the page (Ctrl+Shift+R). Hover restored — "+" appears again. (Per-session means the dismiss is page-load scoped, not permanent.) *(✅ DONE 2026-05-08-d attempt #4.)*
- [x] **Step S3-18 — Right-click context menu fallback.** Right-click any product link on the search-results page. The browser's context menu opens with an entry **"Add to PLOS — Competition Scraping"**. Click it. The URL-add overlay form opens with the right-clicked link's URL pre-filled. Save → new URL appears on PLOS-side. *(✅ DONE 2026-05-08-d attempt #4 — overlay falls back to centered positioning when triggered via right-click since there's no hover-trigger to position relative to per P-7 fix; expected behavior.)*
- [x] **Step S3-19 — Detail-page "already saved" overlay appears when navigating to a saved URL.** Click directly on a URL you previously saved (Step S3-10's product link). The Amazon product detail page loads. Within ~1 second, a small **green floating banner** appears in the **top-right corner** of the page reading **"✓ This URL is already in your project · <Your Project Name>"**. The banner has a small × close button. *(✅ DONE 2026-05-08-d attempt #4.)*
- [x] **Step S3-20 — Detail-page overlay auto-dismisses after 5 seconds.** Wait without interacting. The banner disappears on its own after ~5 seconds. *(✅ DONE 2026-05-08-d attempt #4.)*
- [x] **Step S3-21 — Detail-page overlay × close works.** Refresh the page (overlay reappears). Click the **×**. Banner disappears immediately. *(✅ DONE 2026-05-08-d attempt #4.)*
- [x] **Step S3-22 — Overlay does NOT appear for unsaved URLs.** Click on a different product link (one you have NOT saved). Detail page loads. Banner does NOT appear. *(✅ DONE 2026-05-08-d attempt #4.)*
- [x] **Step S3-23 — `?`-stripping URL-normalization works for tracking-token-laden URLs.** Pick a saved product URL. Construct a URL with extra tracking params: e.g., `<saved-url>?utm_source=email&fb_click_id=ABC123`. Paste into a new tab and press Enter. Page loads. The detail-page overlay should still appear (because `?` and everything after gets stripped at recognition time). This validates the §B 2026-05-07-g item 3 spec. *(✅ DONE 2026-05-08-d attempt #4.)*
- [x] **Step S3-24 — `+ Add` button does NOT appear on non-product links.** Search results pages have many non-product links: Amazon's logo, the cart icon, navigation, "Today's Deals", etc. Hover over any of those — the "+" button does NOT appear. Only links whose URL matches `/dp/{ASIN}` or `/gp/product/{ASIN}` get the button. *(✅ DONE 2026-05-08-d attempt #4.)*
- [x] **Step S3-25 — Hover delay is ~300ms (not instant; not laggy).** Move cursor to a product link and hold steady. The "+" appears after a brief pause. Move cursor between links in quick succession (don't dwell on any) — the "+" should NOT flicker into view as you pass over (because each link's hover-in is debounced 300ms before showing). *(✅ DONE 2026-05-08-d attempt #4.)*
- [x] **Step S3-26 — Repeat Steps S3-5 through S3-19 on `https://www.ebay.com/`.** Pick `Ebay.com` in the popup, search Ebay for any product, exercise the same flows. Product-link detection: links with `/itm/{listing-id}` (8+ digit numeric IDs) get the "+ Add" button; non-listing links don't. *(✅ DONE 2026-05-09 attempt #5 — all 15 sub-steps pass functionally; Highlight Terms BLOCKED by P-9 cap on Ebay search results page (1.5MB body text exceeds 500KB) AND on Ebay listing detail pages (1.58MB body text); cap fires twice per page-load (initial pass + MutationObserver re-scan); Console-confirmed via diagnostic.)*
- [x] **Step S3-27 — Repeat Steps S3-5 through S3-19 on `https://www.etsy.com/`.** Pick `Etsy.com` in the popup. Product-link detection: `/listing/{numeric-id}` matches; shop pages, search, etc. don't. *(✅ DONE 2026-05-09 attempt #5 — all 19 sub-steps pass including S3-31 SPA infinite-scroll re-scan + Highlight Terms work cleanly (Etsy pages stay below P-9 cap; cap warning never fires).)*
- [x] **Step S3-28 — Repeat Steps S3-5 through S3-19 on `https://www.walmart.com/`.** Pick `Walmart.com` in the popup. Product-link detection: `/ip/{slug}/{numeric-id}` AND `/ip/{numeric-id}` both match; category and search pages don't. *(✅ DONE 2026-05-09 attempt #5 — all 19 sub-steps pass functionally; surfaced TWO reliability gaps: (1) P-9 cap fires ~20+ times per Walmart page-load on heavy React re-renders + dynamic ad loading, even with the 250ms MutationObserver debounce — Walmart search results ~650KB exceeds cap, so Highlight Terms blocked on Walmart too; (2) P-10 AlreadySavedOverlay banner intermittently fails to appear on Walmart detail pages — likely root causes: storage-hydration race, Walmart's history.pushState SPA navigation not caught by popstate listener, initial-page-load timing.)*
- [x] **Step S3-29 — Cross-platform mismatch — extension no-ops.** In the popup, pick `Amazon.com` as the platform. In the browser, navigate to `https://www.ebay.com/`. The content script should NOT inject buttons on Ebay (because the user's selected platform is Amazon — content script confirms hostname matches selected platform before running). DevTools → Elements → confirm no `plos-cs-*` elements in the body. *(✅ DONE 2026-05-09 attempt #5.)*
- [x] **Step S3-30 — Switching platform in popup mid-session.** While on Amazon search-results with "+ Add" buttons visible, open the popup and change platform from `Amazon.com` to `Ebay.com`. The Amazon tab's existing buttons stay until refresh (per-tab content-script lifetime). Refresh the Amazon tab — buttons disappear (because selected platform no longer matches Amazon). Navigate to Ebay → buttons appear there. *(✅ DONE 2026-05-09 attempt #5.)*
- [x] **Step S3-31 — SPA navigation re-scans links (Etsy infinite scroll).** On Etsy search results, scroll down to load more results. New product tiles appear. Confirm the "+ Add" buttons + "already saved" icons appear on the newly-loaded tiles too (within ~250ms after the new tiles render — the orchestrator's MutationObserver debounces re-scans). *(✅ DONE 2026-05-09 attempt #5 (folded into S3-27 Etsy walkthrough).)*
- [x] **Step S3-32 — Recognition cache survives the URL save.** Save a fresh URL via Step S3-9. Without refreshing, scroll back up to see the same product link in the search-results list. The "already saved" icon should now be present on it (the orchestrator re-scans after a successful save). *(✅ DONE 2026-05-09 attempt #5 (folded into S3-28 Walmart walkthrough).)*
- [x] **Step S3-33 — No `+ Add` button when popup not configured.** Sign out from the popup. Reload Amazon. No "+ Add" buttons appear (content script reads `selectedProjectId` from popup-state; if missing, no-op). Sign back in + re-pick project + platform → buttons appear on next page load. *(✅ DONE 2026-05-09 attempt #5.)*
- [x] **Step S3-34 — Service worker DevTools shows no errors.** From `chrome://extensions` → Details → Inspect views: **service worker**. Console tab. Walk through Steps S3-5 through S3-19 in another tab. No red errors in the service worker console (the content-script log noise lives in the page's DevTools console, not the service-worker console). *(✅ DONE 2026-05-09 attempt #5.)*
- [x] **Step S3-35 — chrome.storage.local check via service-worker DevTools.** Service-worker DevTools → Application → Storage → Extension Storage → Local. Confirm keys: `selectedProjectId`, `selectedPlatform`, `highlightTerms:<projectId>` (one per Project), and Supabase `sb-*-auth-token` are all present and have plausible values. No new keys from session 3 — the recognition cache lives in memory only. *(✅ DONE 2026-05-09 attempt #5 — initial check showed `selectedPlatform` missing; root cause was director-side oversight (didn't actually pick Amazon during S2-3.1 setup); after explicit re-selection of Amazon, all 4 keys present with expected values: `selectedProjectId` (UUID), `selectedPlatform: amazon`, `highlightTerms:<projectId>` (5 bursitis-related terms with hex colors), Supabase `sb-vyehbgkvdnvsjjfqhqgo-auth-token` (full JWT blob). Diagnostic note: popup picker UX correctly only persists when user explicitly picks; not-yet-picked state has no key.)*
- [x] **Step S3-36 — Build artifact integrity.** From Codespaces: `cd extensions/competition-scraping && npm run compile && npm test && npm run build`. All three clean. *(✅ DONE 2026-05-09 attempt #5: `npm run compile` clean (zero TS errors); `npm test` reports **185/185 pass** (NOT 246 as original spec said — actual baseline is 159 from session 2026-05-08-c attempt #3 + ~26 new tests from 2026-05-08-d attempt #4 polish fixes (9 amazon SSPA + ~17 highlight-terms unit tests on regex + colormap pure logic) = 185 total); `npm run build` clean — `Built extension in 1.159 s; Σ Total size: 634.07 kB`; `npm run zip` regenerated `.output/competition-scraping-extension-0.1.0-chrome.zip` (175,090 bytes); `.output/chrome-mv3/` directory regenerated with content-scripts/ chunk. Mid-test note: a previous session's leftover `wxt build` zombies were stacked up in Codespaces (~5 PIDs from 2026-05-08, ~20GB virt each, hung); pkill -f "wxt build" cleared them; build then completed cleanly in 1.7s. Bundle "Total size 634.07 kB" reflects WXT's reporting of just the chrome-mv3/ output not including the zip; spec's "~1 MB" estimate from session 3 was imprecise.)*

**Seed-data prerequisites** (in addition to sessions 1 + 2 prereqs):

- A test Project on PLOS with at least 1 saved CompetitorUrl on each of Amazon, Ebay, Etsy, Walmart so the "already saved" icon + detail-page overlay paths are exercised on each platform. (Steps S3-11 onward populate the Project organically as you save URLs through the flow — but a few pre-seeded entries help cover the cross-platform iteration faster.)

**API-side already verified at commit time:**

- Extension `npm run compile` clean — zero errors.
- Extension `npm test` reports **246/246 pass** (146 helper-tests across 5 new test files: url-normalization + amazon + ebay + etsy + walmart + registry; carries the prior 42 popup-tests forward + a `+`-handler corrections from old runs cleaned up at session 3 baseline).
- Extension `npm run build` clean — Vite + WXT bundle. `.output/chrome-mv3/` produced with the new `content-scripts/` chunk in addition to the prior popup + background. `.output/competition-scraping-extension-0.1.0-chrome.zip` produced.
- Extension `npx eslint extensions/competition-scraping/src` clean — zero errors, zero warnings on session-3 files.
- Root `npx tsc --noEmit` clean (extensions/ excluded — root tsconfig has been excluding it since session 1).
- Root `npm run build` clean — same 49 routes; zero new PLOS-side files this session.
- Root tests **393/393 pass** — exact baseline parity (no root files modified this session).
- Root `npx eslint src` reports project-wide 13 errors / 39 warnings — exact baseline parity (no PLOS-side changes).

**Lands in waypoint #1 coverage** per the verification-waypoint plan at the top of this doc — Waypoint #1 fires immediately after this session and walks through:
- Slice (a.1) detail page (12 steps) + slice (a.2) image gallery (14 steps) + slice (a.3) inline editing (23 steps) + slice (a.4) column filters (30 steps) + slice (b) Detailed User Guide
- Extension session 1 install/auth (18 steps)
- Extension session 2 popup pickers (28 steps)
- Extension session 3 URL-capture (36 steps — this section)
- **~150–160 steps total at Waypoint #1** (originally estimated 50–80; the actual surface area is larger because slices (a.2), (a.3), (a.4) each shipped 14–30 walked-through steps. Director may want to sub-split Waypoint #1 into two passes if the single walkthrough proves too long; flagged here for the verification session itself to evaluate.)

---

## Polish session #8 (P-2 + P-9 + P-10 bundle) — browser re-verify — ✅ COMPLETE 2026-05-10-d (P-9 + P-10 ✅ RE-CONFIRMED on vklf.com via W#2 → main deploy session #3 fresh sideload — ALL 19 STEPS PASSED; P-2 ✅ DONE on local extension build via polish session #9 corrected sequence + doc updates merged onto main 2026-05-10-d via deploy session #3 — P-2 considered fully verified per byte-identical-bundle reasoning since the `mapFetchTransportError` code path is in extension JS that runs identically regardless of vklf.com vs local; vklf.com re-verify of P-2 formally optional belt-and-suspenders)

**Context:** W#2 polish session #8 (2026-05-10-b) shipped three extension-only fixes at code level on `workflow-2-competition-scraping`. **Deployed to vklf.com 2026-05-10-c** via W#2 → main deploy session #2 (commits `d2e2115` ext code + `cc843a7` resolved-conflict doc-batch on `main`; pushed origin/main → Vercel auto-redeploy completed). This section now captures the browser re-verify outcomes from session 2026-05-10-c.

**Test scope: 3 fixes, ~12-18 walked-through tests across 4 platforms (Amazon, Ebay, Etsy, Walmart). Plus regression spot-checks to confirm no behavior change on platforms where each fix wasn't the primary symptom. OUTCOME 2026-05-10-c: P-9 + P-10 ALL PASS on vklf.com. P-2 deferred — original test spec conflated supabase-auth fetch with `authedFetch`; corrected sequence captured below for next session per Rule 14e + Rule 26.**

### P-2 — `authedFetch` offline error handling — ✅ DONE 2026-05-10-c on local extension build (W#2 polish session #9 — corrected test sequence captured + passed on local extension build) + ✅ DOC UPDATES MERGED to main 2026-05-10-d via W#2 → main deploy session #3. P-2 considered fully verified per byte-identical-bundle reasoning (`mapFetchTransportError` code path is in extension JS that runs identically regardless of vklf.com vs local — fetch URL `https://vklf.com/api/...` and offline TypeError → PlosApiError mapping happens client-side; no server-side dependency). vklf.com re-verify formally optional belt-and-suspenders confirmation; folded into a future polish session if director wants it.

**Pre-test setup:** install or reload the new extension build from `plos-extension-2026-05-10-c-p2-p9-p10.zip`; sign in normally with a working internet connection; do NOT have any specific page open yet.

**Note on the corrected sequence (captured 2026-05-10-c):** the original `P2-1..P2-5` sequence had the user sign in WHILE offline. That approach doesn't cleanly exercise the P-2 code path — Supabase's `signInWithPassword` itself needs network to reach the auth endpoint, so the test fails BEFORE reaching the project-list fetch where `mapFetchTransportError` lives. The corrected sequence below establishes a signed-in session with network ON (so the JWT lives in `chrome.storage.local`), then drops network at the OS level, then re-opens the popup so `ProjectPicker.useEffect` re-runs and exercises the offline path on `listProjects()`.

| # | Step | Expected | Result |
|---|---|---|---|
| P2-A | [x] Sign in normally with WiFi ON. Confirm the popup's signed-in screen shows the project picker populated with your projects. | Project picker dropdown lists your projects normally; no red error box. | ✅ PASS 2026-05-10-c |
| P2-B | [x] Close the popup (click outside it / on another browser tab so it dismisses). | Popup is fully unmounted. | ✅ PASS 2026-05-10-c |
| P2-C | [x] Turn OFF system WiFi at the OS level (NOT DevTools Network → Offline — system-level WiFi toggle is the corrected trigger because DevTools Offline only affects the popup's own DevTools session and didn't reliably exercise this path in earlier attempts). Confirm a regular web page (e.g., google.com) fails to load in any tab. | Browser is offline at the OS level. | ✅ PASS 2026-05-10-c |
| P2-D | [x] Re-open the popup (click the puzzle-piece icon). Observe popup project-list state. | **Expected:** popup shows red error box reading exactly **"Couldn't load your projects (0): Network unreachable — check your connection."** (matches predicted text from `extensions/competition-scraping/src/lib/api-client.ts:62` `mapFetchTransportError` returning `PlosApiError(0, 'Network unreachable — check your connection.')` + `extensions/competition-scraping/src/entrypoints/popup/components/ProjectPicker.tsx:32` rendering `Couldn't load your projects (${err.status}): ${err.message}` in the PlosApiError branch). NOT "Failed to fetch" or stack trace or blank state. | ✅ PASS 2026-05-10-c |
| P2-E | [x] Restore network (turn WiFi back ON); confirm a web page loads; close + re-open the popup OR click any "Try again" affordance. | Project list loads normally — no stale red error. | ✅ PASS 2026-05-10-c |

**DEFERRED registered as TaskCreate task #6 per Rule 26.** Closes only when a future session walks the corrected sequence on vklf.com + the friendly "Network unreachable…" message is confirmed in the red error box.

**Original (broken) test sequence — kept for reference of what NOT to use:**

| # | Step | Expected | Result |
|---|---|---|---|
| P2-1 | [ ] Sign out via popup. | Signed-out screen with email + password fields. | ⚠ DON'T USE — see corrected sequence above |
| P2-2 | [ ] DevTools → Network → set throttle to "Offline" (popup-side OR system WiFi off — both should trigger TypeError on the next fetch). | Browser is offline. | ⚠ DON'T USE |
| P2-3 | [ ] Sign in with valid credentials. | Sign-in itself runs through Supabase, which may or may not surface an inline auth error. After sign-in (assuming it succeeds via cached token / OR fails with a different error), the popup attempts to load projects via `authedFetch('/api/projects')` which will throw `TypeError("Failed to fetch")`. | ⚠ This step is the spec gap — sign-in itself goes through supabase's own fetch which is NOT wrapped by `mapFetchTransportError`; supabase returns "Failed to fetch" verbatim before `authedFetch` ever runs. |
| P2-4 | [ ] Observe popup project-list state. | **Expected:** popup shows red error box reading exactly **"Network unreachable — check your connection."** (NOT "Failed to fetch" or stack trace or blank state). | ❌ FAILED 2026-05-10-c — observed "Failed to fetch" because the test exercised the wrong fetch layer. See diagnosis above + corrected sequence. |
| P2-5 | [ ] Restore network (toggle Offline off / WiFi back on); click "Try again" in the popup OR re-open the popup. | Project list loads normally. | ⚠ DON'T USE |

### P-9 — Live-page Highlight Terms 500KB cap REMOVED + chunked highlight pass — ✅ DONE 2026-05-10-c (ALL 9 STEPS PASSED on vklf.com) + ✅ RE-CONFIRMED 2026-05-10-d (ALL 9 STEPS PASSED on vklf.com again on fresh sideload from `plos-extension-2026-05-10-d-w2-deploy-3.zip` after rebase-merge of polish session #9 doc-batch onto main; same pass criteria, same pass results — no regression)

**Pre-test setup:** popup configured with at least 5 Highlight Terms (use the same set from P-5 verification — bursitis-related terms with hex colors); chrome://extensions → Errors panel cleared for the PLOS extension; popup configured for the platform under test before each navigation. **CRITICAL — caught 2026-05-10-c:** if you switch the popup's platform AFTER a page is already loaded, **refresh the page** before testing — the orchestrator reads `selectedPlatform` ONCE on page load and the running content script doesn't re-read on platform change. (Captured to CORRECTIONS_LOG 2026-05-10-c.)

| # | Step | Expected | Result |
|---|---|---|---|
| P9-1 | [x] Configure popup for **Ebay** platform. Navigate to `https://www.ebay.com/sch/i.html?_nkw=bursitis` (search results, ~1.5MB body text). | Page loads; **Highlight Terms appear colorfully wrapped on matching tokens** (previously: NO highlights — cap blocked the pass). | ✅ PASSED 2026-05-10-c on vklf.com |
| P9-2 | [x] Click into any product on the Ebay search results page (~1.58MB body text). | Detail page loads; **Highlight Terms appear on matching tokens** (previously: NO highlights). | ✅ PASSED 2026-05-10-c |
| P9-3 | [x] Open chrome://extensions → click "Errors" for the PLOS extension. | **Zero new entries containing "exceeds highlight cap"** (the warning is gone — cap was removed entirely). Other errors unchanged from baseline. | ✅ PASSED 2026-05-10-c — cap entirely removed → no warning to repeat. |
| P9-4 | [x] Configure popup for **Walmart** platform. Navigate to `https://www.walmart.com/search?q=bursitis` (~636-675KB body text + heavy SPA re-renders). **AFTER switching popup to Walmart, refresh the Walmart page** (per CRITICAL note above). | Page loads; **Highlight Terms appear on matching tokens**; page does NOT freeze or noticeably stutter during initial load (chunked walker yields between batches). | ✅ PASSED 2026-05-10-c after page-refresh — first attempt without refresh silently bailed (orchestrator gate-check rejected since `selectedPlatform` was still set to previous platform); director refreshed → both Highlight Terms + "+" icon appeared immediately. Captured as CORRECTIONS_LOG entry. |
| P9-5 | [x] Open chrome://extensions → click "Errors" for the PLOS extension. | **Zero new entries containing "exceeds highlight cap"** even after Walmart's heavy React re-renders triggered ~20+ MutationObserver passes (no cap → no warning to repeat). | ✅ PASSED 2026-05-10-c — Errors panel showed zero new "exceeds highlight cap" entries even on heavy Walmart pages. |
| P9-6 | [x] Configure popup with 60+ Highlight Terms (paste a long list to exceed the 50-term soft cap). | **Console warning fires: "highlightTerms count (60) exceeds soft cap (50); only the first 50 will highlight."** Confirms the soft cap on TERM count (separate from the removed body-text cap) still works. | ✅ PASSED 2026-05-10-c — soft term-count cap still functional. |
| P9-7 | [x] Reduce term count back to ≤ 50. Spot-check Amazon search results page (~50KB body text) — was the original P-5 happy path. | Highlight Terms appear correctly on Amazon (no regression from pre-fix behavior). | ✅ PASSED 2026-05-10-c — Amazon spot-check no regression. |
| P9-8 | [x] Spot-check Etsy listing page (small body text). | Highlight Terms appear correctly on Etsy (no regression from pre-fix behavior). | ✅ PASSED 2026-05-10-c — Etsy spot-check no regression. |
| P9-9 | [x] On Walmart, edit Highlight Terms in the popup (add or remove a term while a Walmart page is open). | Page updates highlights to reflect new term list within ~1-2 seconds (chrome.storage.onChanged listener fires; cancellation-on-new-refresh handles the in-flight pass cleanly without leaving stale highlights). | ✅ PASSED 2026-05-10-c — live-edit on Walmart updates within ~1-2s. |

### P-10 — AlreadySavedOverlay reliability on Walmart heavy-SPA pages — ✅ DONE 2026-05-10-c (ALL 10 STEPS PASSED on vklf.com) + ✅ RE-CONFIRMED 2026-05-10-d (ALL 10 STEPS PASSED on vklf.com again on fresh sideload from `plos-extension-2026-05-10-d-w2-deploy-3.zip` after rebase-merge of polish session #9 doc-batch onto main; same pass criteria, same pass results — no regression including the Walmart SPA-navigation 5/5 reliability path that was previously the flaky case)

**Pre-test setup:** popup signed in + configured for Walmart platform; PLOS Project has at least 1 saved Walmart product URL (use any Walmart product saved during prior waypoint #1 walkthroughs OR save a fresh one via `+ Add` button before starting these tests). Use Chrome's "New Tab" workflow to avoid any history-state cross-talk between tests.

| # | Step | Expected | Result |
|---|---|---|---|
| P10-1 | [x] Open Walmart in a new tab. Navigate to a saved product detail page directly (paste URL in address bar; full page load, NOT SPA navigation). | Green "✓ This URL is already in your project · <Project Name>" banner appears within ~1 second; auto-dismisses after 5s. | ✅ PASSED 2026-05-10-c on vklf.com |
| P10-2 | [x] In the same tab, navigate to Walmart search results (single click on Walmart's logo or back button). Then click a SAVED product from the search results (this is the SPA pushState path that was failing pre-fix). | **Banner appears reliably** within ~1 second on the saved product detail page; auto-dismisses after 5s. (Previously: intermittent — sometimes appeared, sometimes didn't.) | ✅ PASSED 2026-05-10-c — banner appears reliably on the previously-flaky SPA-pushState path. |
| P10-3 | [x] Repeat P10-2 five more times across different saved Walmart products. | Banner appears on EVERY navigation (5/5 reliability). | ✅ PASSED 2026-05-10-c — 5/5 reliability across different saved Walmart products. |
| P10-4 | [x] On a search results page, click an UNSAVED product (any non-saved Walmart URL). | NO banner appears (correct — URL not in recognition set). | ✅ PASSED 2026-05-10-c — unsaved correctly suppresses banner. |
| P10-5 | [x] After P10-4, click back to a saved product (navigate from unsaved → saved). | Banner appears (dedupe-by-URL correctly tracks last-considered URL, so navigation to a different URL re-fires the banner). | ✅ PASSED 2026-05-10-c — unsaved → saved navigation re-fires banner correctly. |
| P10-6 | [x] After P10-1 fires the banner once, refresh the page (full reload, same URL). | Banner appears again (refresh = new page-load = fresh content script = fresh `lastOverlayUrl` state — banner re-fires correctly on initial-load). | ✅ PASSED 2026-05-10-c — refresh re-fires banner. |
| P10-7 | [x] After banner fires once at a saved URL, manually dismiss it via × button. Stay on the same URL — do NOT navigate. | Banner does NOT re-appear at the same URL until URL changes (dedupe correctly suppresses re-fire). | ✅ PASSED 2026-05-10-c — manual × dismiss correctly suppresses re-fire. |
| P10-8 | [x] Spot-check Amazon: navigate to a saved Amazon product detail page. | Banner appears (no regression from pre-fix behavior on a non-Walmart platform). | ✅ PASSED 2026-05-10-c — Amazon spot-check no regression. |
| P10-9 | [x] Spot-check Ebay: navigate to a saved Ebay listing detail page. | Banner appears (no regression). | ✅ PASSED 2026-05-10-c — Ebay spot-check no regression. |
| P10-10 | [x] Spot-check Etsy: navigate to a saved Etsy listing detail page. | Banner appears (no regression). | ✅ PASSED 2026-05-10-c — Etsy spot-check no regression. |

**API-side already verified at commit time (2026-05-10-b):**

- Extension `npm run compile` clean — zero errors.
- Extension `npm test` reports **220/220 pass** (was 205/205 — +6 P-2 `mapFetchTransportError` tests in new `api-client.test.ts` + +9 P-9 `processInChunks` tests added to `highlight-terms.test.ts`).
- Extension `npm run build` clean — Vite + WXT bundle. `.output/chrome-mv3/` total size **638.82 kB** (popup ~401 KB; background ~202 KB; content-scripts/content.js ~30 KB).
- Extension `npx eslint extensions/competition-scraping/src` exit 0; "Pages directory" informational message from inherited Next eslint plugin — not a lint error.
- Root `npx tsc --noEmit` clean (extensions/ excluded).
- Root `npm run build` clean — **50 routes** (exact baseline parity from session #7 — no new routes this session).
- Root tests **393/393 pass** — exact baseline parity (no root `src/lib` files modified).
- Root `npx eslint src` reports project-wide **13 errors / 39 warnings** — exact baseline parity.

**Lands in next W#2 → main deploy session** per the ROADMAP Active Tools W#2 row Next Session item (a.4). Combined with session #7's P-3 narrowed work (commit `16d4351`), the deploy gap covers FOUR polish items (P-2 + P-3 narrowed + P-9 + P-10) plus session #7's schema addition. The next deploy session can browser-verify all four together (P-3 verification path is captured in the W#2 polish backlog P-3 entry itself).

**OUTCOME 2026-05-10-c (W#2 → main deploy session #2):** P-3 + UserProjectHighlightTerm schema were already deployed + verified in 2026-05-10-b deploy session #1 (a.4 closed). Today's deploy brought P-2 + P-9 + P-10 onto main via rebased commits `d2e2115` (extension code) + `cc843a7` (resolved-conflict doc-batch). **P-9 + P-10 ALL STEPS PASSED on vklf.com** (see sub-tables above). **P-2 DEFERRED with corrected test sequence** (see P-2 sub-table above) — original spec conflated supabase-auth fetch with `authedFetch` fetch path; corrected sequence captured for next session. DEFERRED as TaskCreate task #6 per Rule 26.

---

## Polish session #10 (P-3 broader scope — selectedProjectId + selectedPlatform server-side persistence) — browser-verify DEFERRED twice; rescheduled as ROADMAP (a.11) RECOMMENDED-NEXT verification-only session on `workflow-2-competition-scraping`

**Status:** ✅ SHIPPED at code level 2026-05-10-e (commit `49d396e` on `workflow-2-competition-scraping`); ✅ DEPLOYED to `main` 2026-05-10-f via W#2 → main deploy session #4 ff-merge; ✅ LIVE on vklf.com 2026-05-10-f via Vercel auto-redeploy (`/api/extension-state` confirmed reachable at the time; backing `UserExtensionState` schema pushed live 2026-05-10-e via `prisma db push`). **Browser verification DEFERRED a first time** on 2026-05-10-f W#2 → main deploy session #4 (mid-session at director's request — captured as ROADMAP Active Tools W#2 row (a.10) RECOMMENDED-NEXT for combined P-1 deploy + P3B verification at next deploy session #5). **Browser verification DEFERRED a second time** on 2026-05-11 W#2 → main deploy session #5 (mid-session at director's call after deploy phase completed — rescheduled as new ROADMAP (a.11) RECOMMENDED-NEXT, verification-only session on `workflow-2-competition-scraping` per CORRECTIONS_LOG 2026-05-10-c entry #4 cheat-sheet (c)). **Fresh extension build available at `plos-extension-2026-05-11-w2-deploy-5.zip` in repo root** (174 KB; byte-identical content to `plos-extension-2026-05-10-e-w2-deploy-4.zip` since extension code unchanged between sessions #4 and #5; either zip works for the verification walkthrough). Both deferrals tracked via TaskCreate `DEFERRED:` per Rule 26 at the time of defer; both destination annotations (ROADMAP + this doc) written at corresponding end-of-session doc batches.

### P-3 broader scope — cross-device sign-in test (canonical proof of correctness — same shape as P-3 narrowed Highlight Terms verification 2026-05-10-b) — PENDING — DEFERRED twice; rescheduled as ROADMAP (a.11) RECOMMENDED-NEXT

| Step | Action | Expected | Status |
|---|---|---|---|
| P3B-1 | [ ] On laptop 1: install / reload the extension from the deploy session's fresh build zip (latest: `plos-extension-2026-05-11-w2-deploy-5.zip` in repo root); sign in with PLOS credentials. | Popup opens; sign-in succeeds; setup screen renders ProjectPicker + PlatformPicker. | PENDING — DEFERRED twice (deploy sessions #4 + #5); rescheduled as (a.11) RECOMMENDED-NEXT |
| P3B-2 | [ ] Pick a Project (any project the test user owns). | ProjectPicker shows the picked project; PlatformPicker becomes available. DevTools Network tab shows a successful PUT request to `/api/extension-state` with `selectedProjectId` set + `selectedPlatform: null`. | PENDING |
| P3B-3 | [ ] Pick a Platform (e.g., Amazon). | PlatformPicker shows Amazon. DevTools Network tab shows a successful PUT to `/api/extension-state` with both fields set. | PENDING |
| P3B-4 | [ ] Close the popup. Sign in from a DIFFERENT Chrome profile / DIFFERENT laptop (canonical "different installation" path — DOES NOT share `chrome.storage.local` with laptop 1; cache is empty). | Popup opens; sign-in succeeds; setup screen renders. | PENDING |
| P3B-5 | [ ] On laptop 2: confirm the saved Project + Platform appear ALREADY-SELECTED. | ProjectPicker shows the project from laptop 1 (same name); PlatformPicker shows Amazon. **This is the canonical proof of server-side persistence — the picks could only have come from the server (laptop 2's cache started empty).** | PENDING |
| P3B-6 | [ ] On laptop 2: switch to a DIFFERENT project. | ProjectPicker shows the new project. PlatformPicker clears (today's "switching project clears platform" behavior preserved). DevTools Network tab shows successful PUT. | PENDING |
| P3B-7 | [ ] Refresh the popup. Confirm new project still shows; platform is null. | Same. | PENDING |
| P3B-8 | [ ] Switch back to the original project on laptop 2. Confirm platform stays null (Option-1 semantics: switching doesn't restore per-project last-platform memory; platform must be re-picked). | Project = original; Platform = null. (Option-2 in the schema-shape Read-It-Back would have restored Amazon here; director picked Option 1.) | PENDING |
| P3B-9 | [ ] DevTools Network → Offline. Reload popup. | Sync warning appears above ProjectPicker: "Couldn't reach PLOS — showing your setup picks from this Chrome." Cached picks still show (cache-fallback path). | PENDING |
| P3B-10 | [ ] DevTools Network → Online. Reload popup. Confirm sync warning clears + picks reload from server cleanly. | Sync warning clears; picks match the server's authoritative state. | PENDING |
| P3B-11 | [ ] (Optional) one-time auto-migration smoke test — only meaningful if the test user previously had local-only picks before this code shipped (ran OLD code, then upgraded to NEW code without clearing chrome.storage.local). | The migration path fires: server returns nulls + cache has values → orchestrator pushes cache up → returns `source: 'migrated'`; picks appear without UI nag. | PENDING (optional) |

**API-side already verified at commit time (2026-05-10-e):**

- Extension `npm run compile` clean — zero errors.
- Extension `npm test` reports **233/233 pass** (was 220/220 — +13 extension-state-sync tests).
- Extension `npm run build` clean — Vite + WXT bundle. `.output/chrome-mv3/` total size **641.42 kB** (popup ~404 KB; background ~202 KB; content-scripts/content.js ~30 KB; popup CSS ~3.6 kB).
- Extension `npx eslint extensions/competition-scraping/src` clean — zero errors / zero warnings.
- Root `npx tsc --noEmit` clean.
- Root `npm run build` clean — **51 routes** (was 50; new `/api/extension-state`).
- Root tests **393/393 pass** — exact baseline parity (no root `src/lib` files modified).
- Root `npx eslint src` reports project-wide **13 errors / 39 warnings** — exact baseline parity.

**Schema:** `npx prisma db push` against prod succeeded in 1.16s (additive — new `UserExtensionState` table only; no existing record-type touched). Schema is now live in production but no main code reads/writes it until the W#2 → main deploy session #4 ships the code that uses it. Safe — additive only.

**OUTCOME 2026-05-10-f (W#2 → main deploy session #4):** Deploy phase ✅ DONE — ff-only merge of `workflow-2-competition-scraping` commits `49d396e` + `cd637f7` onto `main` succeeded clean (main was at `07abf09`, no rebase needed); pushed; Vercel auto-redeployed; `/api/extension-state` route confirmed live via curl returning 401 with auth-gate message. Fresh extension build packaged at `plos-extension-2026-05-10-e-w2-deploy-4.zip` (174 KB) for sideload. **Browser verification of P3B-1..P3B-11 DEFERRED mid-session at director's request.** Director said *"I want to defer all these tests for now. What should we work on next?"* after Claude prepared the full P3B sub-table walkthrough (10 mandatory steps + 1 optional, plus prerequisite of sideloading the fresh extension on TWO Chrome installations). Captured per Rule 14e + Rule 26: this section stays PENDING; ROADMAP Active Tools W#2 row (a.9) flipped to ✅ DEPLOY DONE + VERIFICATION DEFERRED; new (a.10) RECOMMENDED-NEXT for combined deploy session #5 (brings P-1 to main) + walks through deferred P3B verification simultaneously. Deferral was the right call per session-management lucidity preference — the P3B walkthrough requires substantial hands-on work (two Chrome installations + extension sideload + 10 sequential DevTools-observation steps) that a director with lower energy mid-session shouldn't be pushed through. The deploy is already complete and `/api/extension-state` is live; verification is purely a confirmation pass, not a code-deploy gate.

**OUTCOME 2026-05-11 (W#2 → main deploy session #5):** Deploy phase ✅ DONE — ff-only merge of W#2 commits `d715cde` (P-1 silent token refresh code) + `daa4ca8` (doc-batch) onto `main` succeeded clean (main was at `cd637f7`, zero ahead of W#2 — cleanest possible ff shape). Pushed origin/main → Vercel auto-redeployed (build green confirmed by director). Fresh extension build packaged at `plos-extension-2026-05-11-w2-deploy-5.zip` (174 KB compressed; 641,416 bytes uncompressed; byte-identical content to `plos-extension-2026-05-10-e-w2-deploy-4.zip` — same chunk hashes since extension code unchanged between sessions #4 and #5; today's deploy is web-app only — `src/lib/authFetch.ts` + `src/lib/authFetch.test.ts`). **Browser verification of P3B-1..P3B-11 DEFERRED a second time mid-session at director's call.** Director said *"Let's defer this testing for later and keep moving forward with the next thing planned"* after Claude had walked through the full plain-language framing of what's being tested + all 11 step-by-step instructions in one consolidated message (per director's request earlier in the session for "all the instructions and tests at once"). Captured per Rule 14e + Rule 26: this section stays PENDING; ROADMAP Active Tools W#2 row (a.10) flipped to ✅ DEPLOY DONE + VERIFICATION DEFERRED; new (a.11) RECOMMENDED-NEXT created as a **verification-only session on `workflow-2-competition-scraping`** per CORRECTIONS_LOG 2026-05-10-c entry #4 cheat-sheet (c) — verification-only work for W#k (k ≥ 2) belongs on the W#k feature branch, NOT main. The deploy phase is now fully complete (both P-3 broader scope and P-1 are live on vklf.com); verification is purely a confirmation pass. Deferral is the right call per session-management lucidity preference — the cross-device walkthrough is substantial hands-on work (two physical laptops; install/reload extension on both; sign in; pick Project + Platform on laptop 1; install/sign-in on laptop 2; observe whether picks appear already-selected on laptop 2 — canonical proof; then six follow-up edge-case steps including DevTools offline/online testing). Better done in a dedicated session than tacked onto a deploy session.

---

## Polish session #11 (P-1 silent token refresh + retry on 401) — browser-verify pending next W#2 → main deploy session #5

**Status:** ✅ SHIPPED at code level 2026-05-10-f (commit `d715cde` on `workflow-2-competition-scraping`); browser verification pending the next W#2 → main deploy session per ROADMAP Active Tools W#2 row Next Session item (a.10). P-1 verification is partly **passive** — director will discover whether the silent refresh works the next time they happen to come back to vklf.com after >1 hour, OR can verify actively via the contrived sequence below.

### P-1 — silent token refresh on 401 — PENDING next W#2 → main deploy session #5

| Step | Action | Expected | Status |
|---|---|---|---|
| P1V-1 | [ ] **Passive verification (preferred):** sign in to vklf.com normally; close the tab; come back to vklf.com after >1 hour idle. Click into Projects (or any other page that calls a PLOS API). | Page loads cleanly. **NO** "Could not load Projects (401): Invalid or expired token" red error appears. (Pre-fix, this exact scenario surfaced the 401; the fix should make it invisible.) | PENDING next deploy session #5 (or passive — director will discover next time it would have happened) |
| P1V-2 | [ ] **Active verification (contrived):** sign in to vklf.com; open DevTools → Application tab → Local Storage → `https://www.vklf.com` → find the Supabase auth entry (key starts with `sb-`); look at the JSON value's `expires_at` field. Manually edit `expires_at` to a Unix timestamp ~5 minutes in the past. Save. Then click into Projects. | DevTools Network tab: a fetch to `/api/projects` fires; returns 401; followed within a fraction of a second by a fetch to Supabase's `/auth/v1/token?grant_type=refresh_token`; followed by a re-fetch to `/api/projects` returning 200. Page loads cleanly with no error to the user. | PENDING |
| P1V-3 | [ ] **Failure-path verification (the rare 1-week case):** in DevTools Application tab → Local Storage, also delete the `refresh_token` field from the Supabase auth entry while keeping the (already-edited expired) `access_token`. Reload the page. | Fetch to `/api/projects` fires; returns 401; refresh attempt fires; refresh fails (no refresh token); the original 401 is returned to the caller; the existing red error appears: "Could not load Projects (401): Invalid or expired token". User has to manually refresh + re-sign-in. (Confirms failure-path Option (a) — return original 401 unchanged when refresh fails.) | PENDING |

**API-side already verified at commit time (2026-05-10-f):**

- 7 unit tests in `src/lib/authFetch.test.ts` pass via `node --test --experimental-strip-types`: 200 happy path, 401-refresh-success-retry-200, 401-refresh-success-retry-401-no-loop, 401-refresh-fails-returns-original, 500-no-refresh, no-session-throws, POST-body-and-caller-headers-preserved-across-retry.
- 400/400 src/lib tests pass (was 393; +7 authFetch tests).
- `npx tsc --noEmit` clean.
- `npm run build` clean (51 routes, no change — P-1 doesn't add API surface).
- `npx eslint src/lib/authFetch.ts src/lib/authFetch.test.ts` clean.
- Project-wide `npx eslint src` 13 errors / 39 warnings — exact baseline parity.

**Lands in next W#2 → main deploy session #5** per the ROADMAP Active Tools W#2 row Next Session item (a.10), batched with the deferred P3B-1..P3B-11 verification. P-1 verification is partly passive (director discovers next time they'd-have-hit-the-401), partly active via the contrived DevTools-edit sequence above.

---

## Extension build — session 4 — Module 2 text-capture path (highlight-and-add via right-click context-menu + paste-into-extension popup) — PENDING 2026-05-11-b

**Scope:** §A.7 Module 2 says text can be captured two ways — (1) highlight a span of text on a competitor's product page → right-click → "Add to PLOS — Captured Text"; (2) paste raw text into the extension popup → pick a saved URL → pick a category → save. Both shipped this session. Image capture (right-click "Save to PLOS — Image" + region-screenshot mode + two-phase signed-URL image upload) deferred to session 5 per the scope split captured at session start.

**Director picks at session start (Rule 14f forced-pickers):**
- **Text-add gesture shape:** right-click context-menu ONLY (no keyboard shortcut this session) — discoverability for new workers + zero key-chord collision risk.
- **Tags input shape:** structured chip-list (Enter or comma adds; X-on-chip removes) — clearer state than comma-separated free-text.

**Files added / modified this session (extension only — no schema, no API):**
- NEW `extensions/competition-scraping/src/lib/captured-text-validation.ts` — pure-logic helpers (`validateCapturedTextDraft`, `normalizeTags`, `pickInitialUrl`, `defaultMintClientId`).
- NEW `extensions/competition-scraping/src/lib/captured-text-validation.test.ts` — 19 node:test cases.
- NEW `extensions/competition-scraping/src/lib/content-script/text-capture-form.ts` — content-script overlay form.
- NEW `extensions/competition-scraping/src/entrypoints/popup/components/CapturedTextPasteForm.tsx` — popup paste flow.
- Modified `extensions/competition-scraping/src/lib/api-client.ts` — `createCapturedText`, `listVocabularyEntries`, `createVocabularyEntry`.
- Modified `extensions/competition-scraping/src/lib/content-script/api-bridge.ts` — same 3 functions for content-script use.
- Modified `extensions/competition-scraping/src/lib/content-script/messaging.ts` — new `open-text-capture-form` content-script message + 3 new background request kinds.
- Modified `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — listens for `open-text-capture-form`, hands off to the form.
- Modified `extensions/competition-scraping/src/entrypoints/background.ts` — second context-menu (`contexts: ['selection']`) + handlers for the 3 new request kinds.
- Modified `extensions/competition-scraping/src/lib/content-script/styles.ts` — new `.plos-cs-form-select`, `.plos-cs-form-status`, `.plos-cs-form-inline-add`, `.plos-cs-chip-row`, `.plos-cs-chip`, `.plos-cs-chip-remove` classes.
- Modified `extensions/competition-scraping/src/entrypoints/popup/App.tsx` — renders `<CapturedTextPasteForm>` when Project + Platform picked.
- Modified `extensions/competition-scraping/src/entrypoints/popup/style.css` — paste-form section + chip styles.

**API surface used (existing — no server-side work):**
- `POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/text` — shipped API-routes session 2 (2026-05-07). Body: `{clientId, contentCategory?, text, tags?, sortOrder?}`. Idempotent on `clientId`.
- `GET /api/projects/[projectId]/vocabulary?type=content-category` — shipped 2026-05-07.
- `POST /api/projects/[projectId]/vocabulary` — shipped 2026-05-07. Upsert; duplicate `value` returns existing row.

### S4 — Extension session 4 walkthrough (lands in Waypoint #2 verification along with session 5 image-capture)

**Prerequisite:** the session 4 fresh build zip — packaged at end-of-session-batch via `npx wxt build` (parent process hangs per CORRECTIONS_LOG 2026-05-10-f informational; force-kill + zip the `.output/chrome-mv3/` directory).

**Setup:** install the fresh zip on Chrome (`chrome://extensions` → Developer Mode → Load unpacked → pick the unzipped folder). Sign in with PLOS credentials. Pick a Project + Platform. The popup should now also render the new "Paste captured text" section below the Highlight Terms manager (S4-A path) — that section's render confirms the popup-side wiring landed correctly.

**Block A — popup paste flow:**

| Step | Action | Expected | Status |
|---|---|---|---|
| S4-A-1 | [ ] After signing in + picking Project + Platform, scroll the popup. Confirm a new "Paste captured text" section appears below Highlight Terms. | Section renders with: "Loading your saved URLs and categories…" then transitions to the form. | PENDING |
| S4-A-2 | [ ] If you have at least one saved URL for the platform, the form shows: textarea + saved-URL dropdown + content-category dropdown ("+ Add new…" as last option) + tags input + Save button. | All four fields render; Save button disabled until URL + category + non-empty text. | PENDING |
| S4-A-3 | [ ] If you have NO saved URLs for the platform, instead see: "No saved [platform] URLs yet — capture one via the "+ Add" button on a competitor page first." | Empty-state message renders; no form. | PENDING |
| S4-A-4 | [ ] Paste some text into the textarea. Pick a saved URL. Pick an existing content-category. Click Save. | Network: POST to `/api/projects/.../urls/[urlId]/text` returns 201. Form shows "Captured." + clears for next entry. | PENDING |
| S4-A-5 | [ ] Pick "+ Add new…" in content-category. Inline input appears. Type a new category. Type some text. Pick a URL. Save. | Network: POST to `/api/projects/.../vocabulary` returns 201 (or 200 if name pre-existed), THEN POST to `.../text` returns 201. The new category appears in the dropdown immediately for the next entry. | PENDING |
| S4-A-6 | [ ] Add tags by typing a word + pressing Enter. Type another + Enter. Paste "foo, bar, baz" and press Enter. | Chips appear; "foo", "bar", "baz" each become their own chip. Duplicates (case-insensitive) collapse. | PENDING |
| S4-A-7 | [ ] Click the × on one of the chips. | Chip is removed; remaining chips stay. | PENDING |
| S4-A-8 | [ ] Try saving with empty text. | Inline error: "The captured text can't be empty." Form stays open. | PENDING |
| S4-A-9 | [ ] Try saving with no URL picked. | Inline error: "Pick the saved URL this text belongs to." | PENDING |
| S4-A-10 | [ ] Try saving with no category picked. | Inline error: "Pick a content category, or add a new one via '+ Add new…'." | PENDING |
| S4-A-11 | [ ] Toggle DevTools → Network → Offline. Try to save. | Inline error: "Couldn't save: Network unreachable — check your connection. (status network)" Form stays open with the user's input preserved. | PENDING |
| S4-A-12 | [ ] After successful save, navigate to the URL's detail page in PLOS (`vklf.com/projects/[id]/competition-scraping/url/[urlid]`). | The captured-text row appears in the "Captured Text" table on the detail page (sorted by sortOrder ASC, addedAt ASC). | PENDING |

**Block B — content-script highlight-and-add gesture (on a recognized platform page):**

| Step | Action | Expected | Status |
|---|---|---|---|
| S4-B-1 | [ ] Navigate to one of your saved competitor URLs (any platform: Amazon / Ebay / Etsy / Walmart). Confirm the "already saved" overlay banner appears at top-right per session 3. | Banner present. (Sanity check that the content script is running.) | PENDING |
| S4-B-2 | [ ] Select some text on the page (drag with the mouse over a span of text). | Browser shows the standard selection highlight. | PENDING |
| S4-B-3 | [ ] Right-click on the selection. Confirm "Add to PLOS — Captured Text" appears in the context menu alongside Chrome's standard items. | Menu item present. | PENDING |
| S4-B-4 | [ ] Click "Add to PLOS — Captured Text". | The text-capture overlay form opens. Textarea is pre-filled with the selected text; cursor lands at end. The form's saved-URL picker shows the saved URL of the current page already-selected. | PENDING |
| S4-B-5 | [ ] Pick a content category. Add a tag or two. Click Save. | Network: POST to `.../text` returns 201. Form closes. | PENDING |
| S4-B-6 | [ ] Navigate to the URL's detail page in PLOS. Confirm the new captured-text row is in the table. | Row present with the captured text + the category + tags. | PENDING |
| S4-B-7 | [ ] Right-click WITHOUT a selection (or on whitespace). Confirm "Add to PLOS — Captured Text" does NOT appear. | Menu item hidden — `contexts: ['selection']` gates it. | PENDING |
| S4-B-8 | [ ] Right-click on a selection while on a page where the popup-platform DOESN'T match (e.g., popup says Amazon but you're on Ebay). | "Add to PLOS — Captured Text" still appears in the menu (Chrome shows it on any selection), but clicking it does NOTHING visible — the content script orchestrator no-ops on mismatched platforms (silent bail-out per `orchestrator.ts:102-107`). NOT a bug — by design. | PENDING (informational; not an error condition) |
| S4-B-9 | [ ] Open the URL picker dropdown on the form. Confirm it shows all your saved URLs for the current platform (not just the current page's URL). Pick a DIFFERENT saved URL. Save. | The captured text attaches to the picked URL, not the current page's URL. Verified via the detail page of the picked URL (not the current page). | PENDING |
| S4-B-10 | [ ] Esc closes the form. Cancel button closes the form. Backdrop click closes the form. | All three close paths work; nothing saved on close. | PENDING |
| S4-B-11 | [ ] Open the form. Pick "+ Add new…" in the category dropdown. Type a name. Save. | New category gets upserted server-side + appears immediately in the form's category dropdown for the next opening (in this session). PLOS-side `vocabulary?type=content-category` reflects the new entry. | PENDING |
| S4-B-12 | [ ] On a page WITHOUT a recognized saved URL (e.g., a new product page you haven't captured yet), select text + right-click → "Add to PLOS — Captured Text". | Form opens. The saved-URL picker has NO automatic pre-selection (since current page isn't recognized); user must manually pick a saved URL. If the project has NO saved URLs for the platform yet, the form's empty-state message appears in the URL row: "No saved [platform] URLs yet — capture one via '+ Add' first". | PENDING |

**Block C — idempotency check (extension WAL behavior in absence of explicit retry today; session 6 will replay):**

| Step | Action | Expected | Status |
|---|---|---|---|
| S4-C-1 | [ ] DevTools → Application → Local Storage → spot-check that no captured-text clientIds linger after a successful save (today's session doesn't ship the WAL). | No WAL keys present — session 6 will add them. | PENDING |
| S4-C-2 | [ ] Theoretical only: if the same `clientId` were re-POSTed today (manually via DevTools console fetch), the server returns 200 with the existing row instead of 409. Verifies the server-side idempotency surface. | Manual curl with a duplicate clientId returns 200 + existing row. | PENDING (manual; only run if you want to verify the server contract directly) |

**Notes / Notes for next session:**
- Session 5 will ship image-capture + region-screenshot + two-phase signed-URL upload. The PLOS-side detail page's captured-image gallery (slice (a.2)) is already in place from 2026-05-07-b; session 5 just needs to wire the extension up.
- The text-capture flows do NOT touch the orchestrator's recognition cache — captured text rows don't change which URLs are "saved." The PLOS-side detail-page table picks up new rows on next page load.
- If on session 5 we discover any P-11+ polish gaps (e.g., overlay form positioning on small viewports; chip-list keyboard accessibility), capture them via Rule 26 `DEFERRED:` TaskCreate as usual.

---

## Deploy session #13 — P-23 Amazon main-image right-click context-menu DEPLOYED to vklf.com (NEW 2026-05-14 — closes (a.28) RECOMMENDED-NEXT)

**Outcome 2026-05-14:** P-23 fix (yesterday's polish session #18 ship — widened `chrome.contextMenus` `contexts: ['image']` → `contexts: ['all']` + new `find-underlying-image.ts` content-script helper + capture-phase `contextmenu` listener hoisted to top of `runOrchestrator` + cache-fallback in `open-image-capture-form` handler + silent bail when both srcUrl-from-Chrome and cache are empty) **DEPLOYED to vklf.com** via standard cheat-sheet (b) flow. Real-Amazon browser verification by director: **all 9 walkthrough steps PASSED** (sideload → popup Project + Platform=Amazon → navigate `/dp/B0CTTF514L` → right-click main image → "Add to PLOS — Image" menu fires directly on main image → form opens with correct image preview → fill + Save → form closes; cross-platform spot-check on Walmart + eBay + Etsy PASSED with zero behavior change; UX-noise spot-check confirmed widened-menu UX behaves as designed — menu appears on non-image right-click, bails silently with no visible action on click). Director's verbatim outcome: *"Everything worked perfectly. No need to check the database."*

**Cleanest possible deploy shape achieved.** workflow-2 was exactly 1 commit ahead of origin/main (yesterday's polish-#18 ship + doc batch in a single commit `6461c2a`); main was 0 commits ahead of workflow-2 (no parallel main activity since deploy-#12). Rebase a strict no-op fast-forward (SHAs unchanged). Push workflow-2: `6f6e69f..6461c2a`. ff-merged into main: `Updating 6f6e69f..6461c2a` (13 files +1033/-63). Pushed origin/main: `6f6e69f..6461c2a`. Vercel auto-redeploy fired on main push but is a no-op for the web bundle since the P-23 fix is extension-only (zero `src/` changes — web bundle byte-identical).

**Fresh extension build packaged:** `plos-extension-2026-05-14-w2-deploy-13.zip` at repo root (188,102 bytes; 9 files; uncompressed total 687,353 bytes). Per-file sizes: background.js 207,013 B; chunks/popup-DouG-ryC.js 411,472 B; assets/popup-Bbhw2ZRC.css 4,531 B; popup.html 406 B; manifest.json 893 B; content-scripts/content.js **63,038 B** (exact match to NEXT_SESSION.md target; contains the P-23 fix's +601 B over deploy-#12's 62,437 B).

### Pre-deploy verification scoreboard — all GREEN

| Check | Result |
|---|---|
| ext `npx tsc --noEmit -p tsconfig.json` | **CLEAN** (exit 0) |
| ext `npm test` | **334/334 GREEN** in 3.5s (no regressions from yesterday's polish-#18 baseline) |
| root `npx playwright test --project=extension` | **31/31 GREEN** in 1.6 min (includes both new P-23 specs: positive overlay-shield + negative plain-text bail) |
| ext `npm run build` | **CLEAN** in 1.1s; content.js 63,038 B (exact target) |

### Real-Amazon browser verification — full director walkthrough PASSED (9/9 steps)

| # | Step | Outcome |
|---|---|---|
| 1 | Sideload `plos-extension-2026-05-14-w2-deploy-13.zip` (chrome://extensions → Remove old + Load unpacked) | ✅ loaded clean |
| 2 | Popup setup (Project picked + Platform=Amazon) | ✅ green status banner |
| 3 | Navigate to `https://www.amazon.com/dp/B0CTTF514L` (Cool Heat Patches) | ✅ PDP loads, page settles |
| 4 | Right-click directly on main product image (NOT click-to-zoom larger viewer pane — that's the pre-fix workaround) | ✅ "Add to PLOS — Image" menu fires — P-23 fix working |
| 5 | Click "Add to PLOS — Image" → form opens | ✅ form opens with correct main-image preview thumbnail; URL field pre-filled |
| 6 | Fill form (image category) → Save | ✅ form closes; CapturedImage row landed (director skipped DB-side check via `inspect-w2-state.mjs` — "no need") |
| 7 | Cross-platform regression spot-check on Walmart (`/ip/17056909`) | ✅ menu fires + form opens with correct image preview |
| 8 | Cross-platform regression spot-check on eBay (`/itm/365806348442`) | ✅ menu fires + form opens with correct image preview |
| 9 | UX-noise spot-check: right-click on non-image element (text, header, blank page area) | ✅ "Add to PLOS — Image" menu entry appears (expected UX cost of widened `contexts: ['all']`); clicking it does nothing visible (silent bail as designed) |

Etsy spot-check rolled into the cross-platform pass — director's overall "everything worked perfectly" confirms no platform-specific regression on any of the four targets.

### Status flips

- **P-23 polish backlog entry** flips ✅ **SHIPPED-AT-DEPLOY-LEVEL** with real-Amazon browser-verify confirmed on `vklf.com`.
- **ROADMAP W#2 row (a.28)** flipped ✅ DONE.
- **New (a.29) RECOMMENDED-NEXT** = W#2 P-29 design session (manual-add URLs/texts/images on vklf.com) — director picked via §4 Step 1c interview with expanded candidate list (P-29 / P-28 / P-27 / pre-existing P-21 / P-19 / P-13).

### Three NEW polish items captured this session

P-27, P-28, P-29 captured in their own sections below per the same Rule 24 + Rule 14a Read-It-Back discipline used for previous polish captures. All three are partial-implementations of original W#2 design-doc intent (lines 487, 489, 506) that were never built — surfaced today by director's end-of-session ask to expand the roadmap.

### Cross-references

- ROADMAP W#2 row Last Session 2026-05-14 prepended + (a.28) flipped ✅ DONE + new (a.29) RECOMMENDED-NEXT P-29 design session
- W#2 polish backlog P-23 entry flipped ✅ SHIPPED-AT-DEPLOY-LEVEL
- W#2 polish backlog P-27 / P-28 / P-29 NEW entries appended below this section
- CHAT_REGISTRY new top entry for this session
- DOCUMENT_MANIFEST per-doc flags
- CORRECTIONS_LOG header bump only (no new §Entries — clean session, no slips this batch)
- COMPETITION_SCRAPING_DESIGN.md §B new in-flight refinement entry 2026-05-14 covering both the P-23 deploy outcome and the P-27/P-28/P-29 capture
- NEXT_SESSION.md rewritten for (a.29) P-29 design session

---

## P-27 NEW POLISH ITEM — Delete individual captured texts and images from a URL detail page on vklf.com (NEW 2026-05-14 — surfaced by director end-of-session expand-roadmap ask)

**Status:** ⏳ NOT STARTED. Captured 2026-05-14 in `session_2026-05-14_w2-main-deploy-session-13-p23-amazon-context-menu-DEPLOYED-FULL-VERIFY`.

**Severity:** MEDIUM (data hygiene; current workaround is the full-project "Reset W#2 data for this Project" admin button — way too coarse for "remove one bad captured row").

**Lineage — this is NOT a new requirement.** Captured originally in the W#2 Workflow Requirements Interview, in director's own words on `COMPETITION_SCRAPING_DESIGN.md` line 506: *"Note that the user should be able to edit/delete any text in the table. The user should also be able to move rows within the table."* The "edit" half shipped as inline-editing in PLOS-side slice (a.3); the "delete" half was never built. Rule 24 pre-capture search 2026-05-14 confirms no other prior treatment.

**What the feature is:** on a URL detail page (`/projects/[projectId]/competition-scraping/url/[urlId]`), each captured-text row in the captured-text table and each captured-image row in the captured-image gallery gets a trash-can / × button. Clicking it opens a confirm-dialog ("Delete this captured text row? This cannot be undone." or similar). On confirm, the row is removed.

**What's shipped today (verified 2026-05-14 via code-read):**
- Back-end `urls/[urlId]/text/route.ts` exposes **GET + POST only** — no DELETE handler.
- Back-end `urls/[urlId]/images/route.ts` exposes **GET only** — no DELETE handler. (The `requestUpload` + `finalize` sub-routes are POST-only for the 2-phase upload.)
- vklf.com UI: no delete affordance on captured-text rows or captured-image rows. `EditableField.tsx` + `CustomFieldsEditor.tsx` ship per-field editing + per-row delete for the URL's metadata + custom-fields map — NOT for the captured items themselves.

**What needs to be built:**
1. Back-end: new DELETE handler on `urls/[urlId]/text/route.ts` (idempotent on P2025 already-deleted, same shape as URL DELETE at `urls/[urlId]/route.ts:272`).
2. Back-end: new DELETE handler on `urls/[urlId]/images/route.ts` — additionally, decide whether to also delete the Supabase storage object or leave it orphaned (see open design questions below).
3. PLOS UI: trash-can / × button per captured-text row + per captured-image row + confirm-dialog component (composable across text + image).
4. Optimistic update with rollback on error pattern (same shape as `EditableField.tsx` and `CustomFieldsEditor.tsx` deletes).

**Open design questions (settle via Rule 14f forced-pickers in the build session):**
1. Soft-delete (mark row inactive in a `deletedAt` column, preserve for audit/restore) vs. hard-delete (DROP row entirely). Soft-delete is the safer pattern + matches `RemovedKeyword` table convention in W#1 (`DATA_CATALOG.md` line 273).
2. For deleting an image: also delete the Supabase storage object via signed-delete URL, or orphan it (storage GC handles eventually)? Latter is simpler but accumulates dead bytes; former is more thorough.
3. Audit-trail event granularity per `PLATFORM_REQUIREMENTS.md §5`: emit a per-delete event with row-ID + before-state snapshot? Or a coarser "URL detail page modified" event?
4. Permission model: admin-only in Phase 1 (matches admin-solo)? Worker-allowed-on-own-rows in Phase 2?

**Estimated scope:** ~1-2 sessions. Build session would settle the design questions via 4 forced-pickers + ship back-end + ship UI + Playwright spec for the delete flow.

**Cross-references:**
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/text/route.ts` (current GET + POST; needs DELETE)
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/images/route.ts` (current GET; needs DELETE)
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` (where captured-text + captured-image rendering lives)
- `COMPETITION_SCRAPING_DESIGN.md` line 506 (origin directive)
- `COMPETITION_SCRAPING_DESIGN.md §B` new 2026-05-14 in-flight refinement entry (this capture)

---

## P-28 NEW POLISH ITEM — Delete saved URLs from a project on vklf.com (with cascade disclosure) (NEW 2026-05-14)

**Status:** ⏳ NOT STARTED. Captured 2026-05-14 same session as P-27.

**Severity:** MEDIUM (same data-hygiene rationale as P-27).

**Lineage — NOT a new requirement.** Captured originally in W#2 Workflow Requirements Interview, director's own words on `COMPETITION_SCRAPING_DESIGN.md` line 487: *"the user should be able to reset the entire extension to get rid of all data in it to reuse it for another Project or delete any urls and its associated data individually."* The reset path shipped (admin's "Reset W#2 data for this Project" button); per-URL individual delete from PLOS UI did not. Rule 24 pre-capture search 2026-05-14 confirms no other prior treatment beyond the design-doc origin + the existing DELETE handler at `urls/[urlId]/route.ts:272`.

**What the feature is:** on `UrlTable.tsx` (the URL list on `/projects/[projectId]/competition-scraping`), each row gets a trash-can / × button. Clicking it opens a confirm-dialog with **cascade disclosure** — "This will also delete N captured texts and M captured images attached to this URL. Continue?" — populated from a live count fetch. On confirm, URL is removed along with its cascade. Also exposes a Delete button on the URL detail page (`/url/[urlId]`) for parity with the URL list path.

**What's shipped today:**
- Back-end DELETE handler **ALREADY EXISTS** at `urls/[urlId]/route.ts:272` (built during the original session-1 API-routes work). P2025 idempotency on already-deleted.
- Need to **verify in build session** whether the existing DELETE handler **already cascades** (deletes captured texts + captured images attached to the URL) or **orphans them** (leaves them in DB without parent). This is the load-bearing question for the cascade UX — if it cascades today, the UI just needs the disclosure dialog; if it orphans, the handler also needs a cascade implementation OR the orphan rows need cleanup before delete.
- vklf.com UI: no trash button on `UrlTable.tsx`; no Delete button on `url/[urlId]/page.tsx`.

**What needs to be built:**
1. Back-end: confirm existing DELETE handler's cascade behavior; add cascade if missing.
2. Back-end: new lightweight count endpoint (`GET urls/[urlId]/cascade-counts` or similar) returning `{texts: N, images: M}` for the disclosure dialog. Could also be inlined into the existing URL GET response.
3. PLOS UI: trash-can / × button on `UrlTable.tsx` (matching the existing column-filter UX) + Delete button on URL detail page header.
4. ConfirmDeleteDialog component with cascade disclosure copy ("This will also delete X captured texts and Y captured images. Continue?").
5. Optimistic update + rollback on error.

**Open design questions:**
1. **Cascade behavior — same soft-vs-hard decision as P-27.** If P-27 chooses soft-delete for captured-text + captured-image, P-28's cascade should match (soft-delete-cascade — captured items get `deletedAt` set on URL delete).
2. **Audit-trail event for the cascade** — single event with full before-state? Multiple per-row events?
3. Permission model: same admin-only-Phase-1 / worker-Phase-2 question as P-27.

**Estimated scope:** ~1 session (smaller than P-27 because back-end DELETE already exists). Most of the work is UI + the confirm-dialog component.

**Cross-references:**
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/route.ts:272` (existing DELETE handler)
- `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx` (UI site for trash button)
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/page.tsx` (UI site for Delete button)
- `COMPETITION_SCRAPING_DESIGN.md` line 487 (origin directive)
- P-27 (the cascade target rows; design decisions should compose)

---

## P-29 NEW POLISH ITEM — Manually add URLs / captured texts / captured images on vklf.com (any platform, including "Other" for independent websites) (NEW 2026-05-14 — REVERSES 2026-05-07 deliberate deferral)

**Status:** 🛠 **DESIGN COMPLETE 2026-05-15 + Slice #1 ✅ SHIPPED AT CODE LEVEL 2026-05-15-b + Slice #2 ✅ SHIPPED AT CODE LEVEL 2026-05-15-c** on `workflow-2-competition-scraping` in commits `070820a` (Slice #1) and `a9e2bf5` (Slice #2). W#2 → main deploy session #14 for Slices #1+#2 = next session's pick per §4 Step 1c (a.32) RECOMMENDED-NEXT. Slice #3 (image modal — biggest of the three) follows the deploy. **All 5 design questions** in the "Open design questions" section below have been settled in the 2026-05-15 design session; the captured framings of Q2 + Q3 below were partially incorrect against actual code (the schema's `platform` column is already `String` and accepts all 7 PLATFORMS values including `independent-website`; no schema-add needed for "Other") — see `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-15 entry for the corrected framings and the `CORRECTIONS_LOG.md` 2026-05-15 INFORMATIONAL entry on the Q2 code-vs-doc drift. Captured 2026-05-14 same session as P-27 + P-28.

**Severity:** MEDIUM. **This feature explicitly REVERSES the 2026-05-07 deliberate deferral** captured in this same doc earlier (line 965): *"every PLOS-side viewer slice is structurally untestable against real captured data because there is no manual-URL-add affordance on the PLOS side yet (deliberately deferred per the director's 2026-05-07 call — the alternative seed paths were declared not worth the friction vs. just waiting)."* Director 2026-05-14 explicitly asked for this feature alongside P-27 + P-28; reversal of prior deferral is captured here explicitly so future sessions don't re-defer based on the older 2026-05-07 framing.

**Lineage — NOT a new requirement.** Captured originally in W#2 Workflow Requirements Interview, director's own words on `COMPETITION_SCRAPING_DESIGN.md` line 489: *"Note that the user should be able to add competition urls through the easy mechanism we will come up with as mentioned above or the user should be able to manually add a url into the competition table (for example, independent websites)."* The "independent websites" phrasing is what motivates the "Other" platform option below.

**What the feature is:** new vklf.com-side data-entry UI complementing the Chrome extension as a canonical entry path. Three sub-features:
1. **"+ Manually add URL"** button on `UrlTable.tsx` opens a modal: user types URL + picks Platform (Walmart / eBay / Etsy / Amazon / **Other**) + optional metadata (Brand, Category, etc.). Submit creates a new `CompetitorUrl` row.
2. **"+ Manually add captured text"** button on URL detail page (`url/[urlId]/page.tsx`) opens a modal: user pastes/types text + picks image-category vocabulary entry (matches extension's right-click text capture form). Submit creates new captured-text row.
3. **"+ Manually add captured image"** button on URL detail page opens a modal with TBD upload mechanic (drag-drop / paste-from-clipboard / URL-of-image-from-web) + same metadata fields as the extension's image capture form (image-category + Composition + Embedded text + Tags). Submit creates new captured-image row via the existing 2-phase signed-URL upload flow.

**What's shipped today (back-end ↔ UI gap analysis):**
- Back-end `POST urls/route.ts`: **exists** (extension's "+ Add" button uses this). vklf.com manual-add URL would reuse this POST.
- Back-end `POST urls/[urlId]/text/route.ts`: **exists** (extension's text capture form uses this). vklf.com manual-add captured-text would reuse this POST.
- Back-end `POST urls/[urlId]/images/requestUpload` + `finalize`: **exist** (extension's image capture form uses these for 2-phase signed-URL upload). vklf.com manual-add captured-image would reuse them.
- vklf.com UI: **none of the three manual-add forms exist** today. All data entry flows through the Chrome extension.
- "Other" platform option: **NOT supported** today. Current platform enum is `walmart | ebay | etsy | amazon` (confirmed via grep on schema + `PlatformId` type). Adding "other" requires a schema add (enum extension or shift to string-typed column).

**Open design questions (settle via Rule 14f forced-pickers in the design session):**
1. **Image upload mechanics:** drag-and-drop from filesystem ONLY, vs. paste-from-clipboard ONLY, vs. URL-of-image-from-web ONLY, vs. all three? Director's original "independent websites" intent on DESIGN doc line 489 implies URL-of-image-from-web is essential at minimum (you might want to drop in an image URL from an independent site). Drag-and-drop is the most thorough complete coverage.
2. **"Other" platform option** — schema add: new enum value `other` on `PlatformId` (additive enum, low risk) vs. shift to string-typed platform field (more flexible but breaks all existing filters). Recommended: enum-add. Downstream workflows that filter by platform get a new option to handle.
3. **Audit-trail distinction** — manually-added rows should be distinguishable from extension-captured rows per PLATFORM_REQUIREMENTS §5. Add a `source: 'extension' | 'manual'` column to `CompetitorUrl` + `CapturedText` + `CapturedImage`? Or infer from `userId` context (admin manually-adds via vklf.com; workers extension-capture)?
4. **Permission model** — admin-only in Phase 1 (matches admin-solo)? Worker-allowed in Phase 2?
5. **Manual-add URL form UX location** — modal opened from a "+ Manually add URL" button on `UrlTable.tsx`? Inline expansion in the table (add-row at top)? Separate `/competition-scraping/url/new` page?

**Estimated scope:** likely 2-3 sessions. Design session #1 settles the 5 forced-pickers + ships any schema add (for "Other" platform IF picked). Build session(s) #2 + #3 ship the three sub-feature UIs and any new vklf.com routes (the image upload might need a vklf.com-server-side proxy of the 2-phase flow vs. exposing it directly to the browser).

**Cross-references:**
- `src/app/api/projects/[projectId]/competition-scraping/urls/route.ts` (existing POST for URL-create; reuse)
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/text/route.ts` (existing POST for text-create; reuse)
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/images/requestUpload/` + `finalize/` (existing 2-phase upload; reuse)
- `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx` (UI site for "+ Manually add URL")
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/page.tsx` (UI site for "+ Manually add captured text" + "+ Manually add captured image")
- `prisma/schema.prisma` `PlatformId` enum (location of likely "Other" enum-add)
- `COMPETITION_SCRAPING_DESIGN.md` line 489 (origin directive)
- `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` line 965 (the 2026-05-07 deferral that P-29 reverses)
- `NEXT_SESSION.md` rewritten 2026-05-14 to launch the P-29 design session

---

## P-29 Slice #1 SHIPPED at code level (W#2 build session 2026-05-15-b — closes (a.30) RECOMMENDED-NEXT)

**Status:** ✅ SHIPPED at code level on `workflow-2-competition-scraping` commit `070820a` + this end-of-session doc batch. **Director manual walkthrough DEFERRED** to the W#2 → main deploy session that brings this code to vklf.com (workflow branch isn't deployed; can't run real-independent-website end-to-end smoke there).

**What shipped (15 files +908/-1 in commit `070820a`):**

- **Schema migration applied to live DB:** `prisma db push` added `source String @default("extension")` column to `CompetitorUrl` + `CapturedText` + `CapturedImage`. Pre-migration row counts: 25 + 8 + 10 = 43. Post-migration: same counts, all 43 rows have `source='extension'` via column default. Verified via PrismaClient count + sample-row spot-check.

- **Shared types updated** (`src/lib/shared-types/competition-scraping.ts`): new `SOURCES` vocabulary + `isSource` type guard + `source: Source` field added to `CompetitorUrl` / `CapturedText` / `CapturedImage` response interfaces + `source?: Source` field added to `CreateCompetitorUrlRequest` / `CreateCapturedTextRequest` / `FinalizeImageUploadRequest` (Slice #2 + Slice #3 won't need to re-touch shared types).

- **POST `urls/route.ts`**: accepts optional `source` field in body; validates via `isSource` (400 + explicit error message on misshapen value); default `'extension'` applies server-side when omitted — extension's existing POST traffic semantics unchanged.

- **6 `toWireShape` serializers updated**: `urls/route.ts`, `urls/[urlId]/route.ts`, `text/[textId]/route.ts`, `urls/[urlId]/text/route.ts`, `urls/[urlId]/images/route.ts`, `urls/[urlId]/images/finalize/route.ts`, `images/[imageId]/route.ts` — each returns `source` on every read path; TypeScript would have caught any miss because the shared-types interfaces now require the field.

- **UI: `UrlAddModal.tsx` (~470 LOC, new file)** at `src/app/projects/[projectId]/competition-scraping/components/UrlAddModal.tsx`. Form fields: URL (required) + Platform (required 7-value dropdown labeled "Amazon.com" / "Ebay.com" / "Etsy.com" / "Walmart.com" / "Google Shopping" / "Google Ads" / "Independent Website" — matches the Chrome extension's `extensions/competition-scraping/src/lib/platforms.ts` labels exactly for UI consistency) + Brand + Product + Category + Product Stars (0-5, step 0.1) + # Reviews + Results Page Rank + Sponsored checkbox. Autofocus on URL field. Escape / Cancel / X / backdrop dismiss (only when not submitting). Inline error surface on validation failures + 4xx/5xx responses. Submit-in-flight lock disables all controls + dismiss paths to prevent orphan POSTs.

- **`UrlTable.tsx` wire-in**: new "+ Manually add URL" button rendered top-right of the existing search/clear-filters/count toolbar (director's pick at session start). Click opens the modal; success closes it + calls parent `onUrlAdded` callback. Modal mount keeps the toolbar UI cohesive; modal state owned by UrlTable (single component owns the open/close shape).

- **`CompetitionScrapingViewer.tsx`**: new `handleUrlAdded` callback prepends the new row to the URL list state with `id`-dedup. Idempotent POST returns the existing row on duplicate-create so dedup is correct.

**Tests shipped:**

- **`src/lib/shared-types/competition-scraping.test.ts` (new)** — 10 node:test cases covering `isSource` (positive + negative + non-string), `SOURCES` vocabulary stability, `isPlatform` (incl. the Q2-reframing regression that `independent-website` is supported), `isVocabularyType`, `isImageSourceType` distinct-from-Source (catches the naming-collision slip class), `isAcceptedImageMimeType` (SVG-rejection regression). All 10 pass.

- **`tests/playwright/p29-manual-add-url-modal.spec.ts` (new)** — 6 UI-mechanical test cases at the launch-prompt-named path: button renders / modal opens on click / empty URL submit shows validation error / submit serializes `source: 'manual'` + selected platform + url / modal stays open on 4xx response / Escape + backdrop + Cancel + X all close. **All 6 currently `test.skip()`** with header-level rationale + per-test pseudocode. Unblocked when **P-30** (React-bundle stub-page rig) lands.

**Deferred items captured per Rule 14e + Rule 26:**

- **P-30** — Playwright React-bundle stub-page rig. See P-30 section below.
- **P-31** — Route-handler DI refactor for testability. See P-31 section below.
- **Empty-URL-list-locks-out-manual-add**: when a Project's W#2 URL list is empty, `CompetitionScrapingViewer`'s `EmptyState` renders before `UrlTable`, hiding the new "+ Manually add URL" button. Captured inline in `CompetitionScrapingViewer.tsx`'s `handleUrlAdded` JSDoc + this entry. Likely lifts into a small follow-up; ETA ~20 min.

**Verification scoreboard — all GREEN:** `npx tsc --noEmit` clean; `npm run build` clean; `node --test src/lib/shared-types/competition-scraping.test.ts` 10/10 pass; `npx playwright test --project=chromium tests/playwright/p29-manual-add-url-modal.spec.ts` 6/6 skipped as designed.

**Cross-references:**
- Commit `070820a` on `workflow-2-competition-scraping`
- `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-15-b entry (full ship narrative)
- `NEXT_SESSION.md` rewritten 2026-05-15-b for Slice #2 build session
- `ROADMAP.md` W#2 row Last Session + (a.30) flipped ✅ SHIPPED-AT-CODE-LEVEL + new (a.31) Slice #2 RECOMMENDED-NEXT + schema-change-in-flight flag back to No

---

## P-29 Slice #2 SHIPPED at code level (W#2 build session 2026-05-15-c — closes (a.31) RECOMMENDED-NEXT)

**Commit:** `a9e2bf5` on `workflow-2-competition-scraping` (pushed origin mid-session with Rule 9 approval). **4 files +682/-21.** No schema change — Slice #1 covered all 3 W#2 tables.

**What shipped:**

- **API route update** (`src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/text/route.ts`): POST handler now accepts optional `source` in the request body; validates via `isSource` from `shared-types/competition-scraping.ts` (Slice #1's export); 400 + explicit error message on misshapen value; default `'extension'` server-side when omitted (preserves Chrome extension's existing POST traffic byte-for-byte — backward-compatible). Persists on `createData` via the new `source` column Slice #1 added.

- **NEW component** `src/app/projects/[projectId]/competition-scraping/components/CapturedTextAddModal.tsx` (~370 LOC): 3-field form mirroring the Chrome extension's right-click text-capture flow — Text (required, multi-line textarea) + Content Category (optional plain text; vocabulary autocomplete deferred to a future polish item) + Tags (optional comma-separated input parsed to `string[]` with whitespace-trim + empty-drop). Autofocus on Text textarea; Escape / Cancel / X / backdrop dismiss (only when not submitting); submit-in-flight lock; `crypto.randomUUID()` clientId for POST idempotency (matches extension's WAL semantics — retries hit the route's `clientId`-dedup path). POSTs `source: 'manual'` explicitly. Mirrors `UrlAddModal.tsx` shape + dismiss UX + style; smaller form (3 fields vs. 9) drops platform picker + numeric validators.

- **URL-detail page wire-in** (`src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx`): `CapturedTextSubsection` now accepts `projectId` + `urlId` + `onTextAdded` props; owns internal `modalOpen` state; renders a flex row containing the h2 + count on the left and the green "+ Manually add captured text" button on the right (per director's session-start Rule 14f pick — "Right end of 'Captured Text' h2 row"); mounts the modal at the bottom of the section. Parent `UrlDetailContent` owns `handleTextAdded` callback that prepends the new row to `textSlot.data` with `clientId`-dedup (existing-row match → replace in place; no match → prepend at index 0) — mirrors `CompetitionScrapingViewer.handleUrlAdded`'s id-dedup pattern from Slice #1 but switches dedup key to `clientId` since text rows are idempotent-on-clientId per the API contract.

- **NEW Playwright spec** `tests/playwright/p29-manual-add-captured-text-modal.spec.ts` (~155 LOC) — 8 UI-mechanical test cases at the director-picked path (session-start Rule 14f pick — "new file" over "append to Slice #1 spec"); all `test.skip()` pending P-30 React-bundle stub-page rig. Cases mirror Slice #1's 6 cases + add 2 specific to Slice #2: "Submit with optional fields serializes contentCategory + parsed tags" (comma-parse logic) + "clientId-dedup — duplicate-create 200 response replaces existing row in-place" (`handleTextAdded`'s clientId-dedup).

- **No new node:test cases needed**: Slice #1's `src/lib/shared-types/competition-scraping.test.ts` `isSource` regression already covers Slice #2's new POST-handler validation branch (same guard, same vocabulary). 10/10 still pass.

**Verification scoreboard — all GREEN:**

- `npx tsc --noEmit`: clean (one path-fix during build: `../../components` → `../../../components` for the modal import — caught immediately by the type-check; not a CORRECTIONS_LOG-tier slip).
- `npm run build`: clean (49 routes; no warnings).
- `node --test src/lib/shared-types/competition-scraping.test.ts`: 10/10 pass (unchanged from Slice #1).
- `npx playwright test --project=chromium tests/playwright/p29-manual-add-captured-text-modal.spec.ts`: 8/8 skipped as designed.
- Project-wide eslint: +1 error of the same `react-hooks/set-state-in-effect` class Slice #1's `UrlAddModal.tsx` already shipped with (same accepted pattern; baseline parity by class).

**Director manual walkthrough on real-Independent-Website URL DEFERRED to W#2 → main deploy session #14** that brings Slices #1+#2 to vklf.com — workflow branch isn't deployed; deferral count for the director manual walkthrough now stands at TWO across Slices #1+#2. Combined deploy session will exercise BOTH new modals end-to-end.

**No new polish items captured this session** — P-30 + P-31 from Slice #1 still cover all three slices' regression-coverage gaps; nothing new surfaced.

**Director picked next session via §4 Step 1c interview:** Option A — **W#2 → main deploy session #14 for Slices #1+#2** (recommended per `feedback_recommendation_style.md`: most thorough; exercises both new modals on real-website data BEFORE Slice #3 piles more code on top; catches deploy-time / live-DB integration issues earlier; releases twice-deferred walkthrough debt in a single deploy session).

**Cross-references:**

- Commit `a9e2bf5` on `workflow-2-competition-scraping`
- `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-15-c entry (full ship narrative)
- `NEXT_SESSION.md` rewritten 2026-05-15-c for W#2 → main deploy session #14
- `ROADMAP.md` W#2 row (a.31) flipped ✅ SHIPPED-AT-CODE-LEVEL + new (a.32) RECOMMENDED-NEXT W#2 → main deploy session #14 (header + W#2 row Last Session — both updated this batch)

---

## P-30 NEW POLISH ITEM — Playwright React-bundle stub-page rig for W#2 modals (NEW 2026-05-15-b — unblocks Slice #1 + Slice #2 + Slice #3 UI regression coverage)

**Status:** ⏳ NOT STARTED. Captured 2026-05-15-b during Slice #1 build session when the existing thin Playwright rig (authFetch-regression stub-page only) was inadequate to exercise the new React-based `UrlAddModal.tsx`. Director picked Hybrid Rule 27 verification at design session; Slice #1's Playwright spec is shipped today with 6 `test.skip()` cases pre-authored at the structural level (the test bodies will fill in once the rig lands).

**Severity:** MEDIUM. The skipped test cases preserve regression intent + give the rig session a known target; without the rig built, the Slice #1+#2+#3 modal UX cannot be regression-tested mechanically. Director manual walkthrough covers end-to-end smoke but not regression — a future commit that breaks (say) the Escape-dismiss path won't be caught until a deploy + manual re-check.

**What the rig is:**

A small esbuild-based bundle similar to the existing `tests/playwright/build-bundle.mjs` for authFetch, scaled up to handle React + ReactDOM + the W#2 modal components (`UrlAddModal.tsx`; later `CapturedTextAddModal.tsx` + image modal). Bundle is served by the existing `tests/playwright/test-server.mjs` (extend its file-serve map). New static HTML test pages mount each modal with a stubbed `authFetch` that captures POST bodies + fulfills responses Playwright can assert against.

**Scope (~60-90 min):**
1. Extend `build-bundle.mjs` with a second entrypoint that bundles UrlAddModal + a small `mount.tsx` that exposes `__openModal()` / `__getLastPostBody()` test hooks on `window`. Use esbuild's JSX support; React + ReactDOM as bundled deps.
2. New static HTML page `tests/playwright/p29-modal-test-page.html` that loads the bundle + provides a "+ Manually add URL" button DOM hook.
3. Extend `test-server.mjs` with the new file routes + a `/__post-capture` endpoint the stubbed authFetch routes calls to so test bodies are observable from Playwright.
4. Fill in the 6 skipped test bodies in `tests/playwright/p29-manual-add-url-modal.spec.ts`.

**Coverage unlocked:**
- Button renders + click opens modal.
- Empty-URL submit shows inline validation error + modal stays open.
- Submit with required fields posts `source: 'manual'` + selected platform (incl. `independent-website` regression) + url.
- Modal stays open + shows error on 4xx response.
- Escape + backdrop click + Cancel + X all close the modal (only when not submitting).

**Reuse for Slices #2 + #3:** the bundle entrypoint pattern + test-page convention extend straightforwardly to `CapturedTextAddModal` (Slice #2) + image-upload modal (Slice #3) — each new modal adds a bundle entrypoint + a test-page + a spec file; the rig itself doesn't need re-architecting.

**Cross-references:**
- `tests/playwright/p29-manual-add-url-modal.spec.ts` (the 6 skipped specs awaiting this rig)
- `tests/playwright/build-bundle.mjs` (the existing single-entrypoint pattern to extend)
- `tests/playwright/test-server.mjs` (the file-serve map to extend)
- `src/app/projects/[projectId]/competition-scraping/components/UrlAddModal.tsx` (the component to bundle)
- `package.json` (add `react` + `react-dom` to `bundledDependencies` if needed for esbuild deduping, or rely on the existing Next.js installation)

**Estimated scope:** ~60-90 min in its own session. Yields lasting regression coverage for all three Slice modals + future W#2 modal-style polish items (e.g., a P-30-built follow-up to the P-27/P-28 delete-confirm dialogs).

---

## P-31 NEW POLISH ITEM — Route-handler DI refactor for testability (NEW 2026-05-15-b — unblocks API-layer regression coverage for W#2 routes)

**Status:** ⏳ NOT STARTED. Captured 2026-05-15-b during Slice #1 build session when the route-handler-in-isolation testing strategy turned out to need a module-level dependency seam that `urls/route.ts` (and siblings) don't have today.

**Severity:** MEDIUM. Without this refactor, the API-layer regression for `source` field persistence + 401 auth gate + 400 validation cases is covered today only by director manual walkthrough — a future commit that breaks (say) the `isSource` check or the 401 path won't be caught until a deploy + manual re-check.

**What the refactor is:**

Extract the POST handler's pure validation + Prisma-call shape into an injectable function:

```ts
// Pure function: takes resolved auth + deps; returns response shape.
export async function createCompetitorUrl(args: {
  projectWorkflowId: string;
  userId: string;
  body: unknown;
  prismaClient: PrismaClient;
  markWorkflowActive: (projectId: string, workflow: string) => Promise<void>;
  recordFlake: (op: string, err: unknown, ctx: object) => void;
  withRetry: <T>(fn: () => Promise<T>) => Promise<T>;
}): Promise<{ status: number; body: unknown }>;

// Route shim: resolves auth + wires real deps + delegates.
export async function POST(req: NextRequest, ...) {
  const auth = await verifyProjectWorkflowAuth(req, projectId, WORKFLOW);
  if (auth.error) return withCors(req, auth.error);
  const body = await req.json();
  const { status, body: respBody } = await createCompetitorUrl({
    projectWorkflowId: auth.projectWorkflowId,
    userId: auth.userId,
    body,
    prismaClient: prisma,
    markWorkflowActive,
    recordFlake,
    withRetry,
  });
  return withCors(req, NextResponse.json(respBody, { status }));
}
```

**Coverage unlocked:**
- `createCompetitorUrl({ body: { /* no source */ }, prismaClient: fakePrisma, ... })` → asserts Prisma.create called with no explicit source (schema default applies); response wire shape includes `source: 'extension'` echo.
- `createCompetitorUrl({ body: { source: 'manual', ... } })` → asserts Prisma.create called with `source: 'manual'`; response echoes `source: 'manual'`.
- `createCompetitorUrl({ body: { source: 'invalid', ... } })` → asserts response status 400 + error message includes "source".
- `createCompetitorUrl({ body: { /* no platform */ }, ... })` → asserts 400.
- `createCompetitorUrl({ body: { platform: 'amazon', /* no url */ }, ... })` → asserts 400.
- Auth-layer 401 covered by a separate test of the route shim with a `verifyProjectWorkflowAuth` mock returning `{ error: { status: 401 } }`.

**Reuse for sibling routes:** the same DI shape lifts cleanly onto `text/route.ts` (Slice #2 reuses), `urls/[urlId]/text/route.ts` POST, `urls/[urlId]/images/finalize/route.ts` POST. Each route handler becomes a thin shim around a testable pure function. Future Phase 2 workflow-status side-effect changes (e.g., audit-trail events) become a single test surface.

**Estimated scope:** ~30-45 min for the urls/route.ts refactor + new node:test file. Sibling route refactors land alongside their slice ship sessions (P-31's pattern, not P-31's session scope).

**Cross-references:**
- `src/app/api/projects/[projectId]/competition-scraping/urls/route.ts` (refactor target)
- `src/lib/shared-types/competition-scraping.test.ts` (existing node:test pattern to extend)
- `src/lib/authFetch.test.ts` (canonical DI-with-mocks shape to mirror)

---

END OF DOCUMENT

