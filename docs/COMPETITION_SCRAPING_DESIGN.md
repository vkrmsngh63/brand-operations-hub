# COMPETITION SCRAPING & DEEP ANALYSIS — DESIGN DOC (Workflow #2)

**Workflow number:** W#2
**Workflow name:** Competition Scraping & Deep Analysis (🔍)
**Status:** 🔄 Design phase (this doc is the design-phase deliverable)
**Branch:** `workflow-2-competition-scraping`
**Created:** May 4, 2026
**Created in session:** session_2026-05-04_w2-workflow-requirements-interview (Claude Code)
**Last updated:** 2026-06-02-d (P-55 Phase 3 — the teaching primer WIRED into `/comprehensive-analysis` [a "Competitive Analysis Primer" Word `.docx` download in the Files box + in the "Download all (.zip)" bundle + an "↡ Insert primer" editor button] AND made EDITABLE + SAVABLE [an "✎ Edit" rich-text modal with Save + Reset-to-default; the saved version drives the download + the insert] ✅ DEPLOYED-AND-VERIFIED on vklf.com [director "pass all five" + "pass"] — **P-55 essentially CLOSED** — PLUS the Workflow Graduation Continuity methodology [NEW HANDOFF_PROTOCOL Rule 33 + the per-workflow continuity primer `docs/COMPETITION_SCRAPING_PRIMER.md` + the `./catch-up-workflow 2` script; W#2 first instance]; new §B 2026-06-02-d entry `session_2026-06-02-d_p55-phase-3-primer-wiring-editable-primer-and-graduation-methodology` appended at end-of-doc as an append-only design note per Rule 18 [§A frozen]; TWO deploys `894563b` [primer wiring] + `ef4a47c` [editable primer]; NEW client dependency `docx ^9.7.1`; NEW endpoint `.../comprehensive-analysis/primer` [route count 71 → 72] via a node:tested DI handler owning ONLY the additive nullable `ComprehensiveCompetitorAnalysis.primerJson Json?`; baselines src/lib `node:test` = 1353/1353 [+18], `npm run build` = 72 routes [+1], extension = 910/910 UNCHANGED; Schema-change-in-flight NO entry → YES [pt3 `primerJson`] → NO exit [the column shipped to prod via `prisma db push`]. Canonical spec `docs/polish-item-specs/P-55-...md`; §Entry in CORRECTIONS_LOG 2026-06-02-d. §A unchanged per Rule 18. Closes (a.125) [P-55 essentially COMPLETE]; opens (a.126) RECOMMENDED-NEXT = P-56 [HIGH — Amazon highlight-terms flicker blocks text selection; resumes the deferred P-20 real-Amazon verification] on `workflow-2-competition-scraping`.) **Previously updated:** 2026-06-02-b (P-55 CONTINUED — Phase 2b-ii grouped By-Category + By-Type spreadsheets + a full four-file export audit + the Phase 3 primer content generator [held back inert at `dfa4af1`] — new §B 2026-06-02-b entry `session_2026-06-02-b_p55-phase-2b-ii-grouped-spreadsheets-audit-and-primer-content` appended at end-of-doc as an append-only design note per Rule 18 [§A frozen]; the governing principle made explicit — an export must MIRROR the on-screen table [match its columns + order from the page's column registry, include ALL click-to-reveal data, split every sub-row into its own row, generate fresh on click, clamp cells to Excel's 32,767-char limit]; FIVE deploys `e705f10 → fd63d45 → 0718711 → 1be0f62 → 41481f0`; Phase 2b-ii DEPLOYED [director verification of the four exports DEFERRED]; baselines src/lib `node:test` = 1330/1330 [+13], `npm run build` = 71 routes UNCHANGED, extension = 910/910 UNCHANGED; Schema-change-in-flight NO entry → NO exit. Canonical spec `docs/polish-item-specs/P-55-...md`; Patterns in CORRECTIONS_LOG §Entry 2026-06-02-b; standing rule in memory `feedback_exports_include_all_table_data`. §A unchanged per Rule 18. Closes (a.123) PARTIALLY; opens (a.124) RECOMMENDED-NEXT = P-55 Phase 3 part 2 [the primer .docx + "Insert primer" button + Files-box entry] on `workflow-2-competition-scraping`; verify the four exports FIRST.) **Previously updated:** 2026-06-01 (P-49 W2 Walmart sub-cluster DEPLOY + 3-fix-forward cascade session — new §B 2026-06-01 entry `session_2026-06-01_p49-w2-walmart-sub-cluster-session-1` appended at end-of-doc as extension-side architecture cross-reference pointer entry to the canonical `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-06-01 deploy-session entry per the P-23 + P-46 + W2 Amazon + eBay + Etsy precedent — **fourth + FINAL per-platform DEPLOY in the W2 arc; CLOSES the entire P-49 W2 per-platform extension extraction arc across all 4 platforms** — Amazon (2026-05-28) + eBay (2026-05-30) + Etsy (2026-05-31) + Walmart (2026-06-01) all now ✅ DEPLOYED-AND-VERIFIED end-to-end on vklf.com; third consecutive per-platform DEPLOY to reuse the Diagnostic-instrumentation FF Pattern; UNBLOCKS Workstream 5 AI review analysis Session 1 per (a.101). 4 Rule 9 deploy gates fired (build deploy + FF#1 `3321690` loosen-LISTING_PAGE_PATH-regex from director's URL paste + FF#2 `c953e71` diagnostic instrumentation + FF#3 `86cbfbd` empirical fix the WIN anchoring on per-review body `data-testid="enhanced-review-content"` + walking up via `closest('.overflow-visible')` + screen-reader-only `<span class="ld_Ec">` star + word-boundary regex `/\b(review|...)\b/i` reviewer-name filter + removed `findWalmartReviewsContainer` + removed FF#2 instrumentation); 7 Rule 14f forced-pickers fired all director-Yes-to-Recommended (7/7 = 100% calibration; running cumulative 50/53 = 94.3% across recent 8 sessions); Schema-change-in-flight flag STAYS NO entire session; NEW baseline locked: extension `npm test` = **910/910** (+92 from 818 entry baseline). THREE NEW reusable Patterns memorialized in CORRECTIONS_LOG §Entry 2026-06-01 ("Diagnostic-instrumentation FF Pattern reusability validated across 3 consecutive days/platforms" + "Word-boundary regex for reserved-keyword filtering against natural-language strings" + "closest() walk-up + anchor-on-canonical-data-testid Pattern"). 5 fresh extension zips at repo root + 3 debug HTML files from director's diagnostic capture. Director Phase 4 PASS verdict on FF#3 "Everything passed" (third consecutive day the Diagnostic-instrumentation FF Pattern delivered a PASS verdict on the empirical-fix FF). Walmart sub-cluster fully ✅ DEPLOYED-AND-VERIFIED with no remaining scope; §C.2 estimate "~2-3 sessions" compressed into "1 calendar day"; Walmart Sessions 2 + 3 from §C.2 outline CLOSED. §A unchanged per Rule 18. Closes (a.100); opens (a.101) RECOMMENDED-NEXT = P-49 W5 AI review analysis Session 1 on `workflow-2-competition-scraping` per §C.5 outline.) **Previously updated:** 2026-05-31 (P-49 W2 Etsy sub-cluster DEPLOY + 3-fix-forward cascade session — new §B 2026-05-31 entry `session_2026-05-31_p49-w2-etsy-sub-cluster-session-1` appended at end-of-doc as extension-side architecture cross-reference pointer entry to the canonical `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-31 deploy-session entry per the P-23 + P-46 + W2 Amazon + eBay precedent — third per-platform DEPLOY in the W2 arc after Amazon (2026-05-28) + eBay (2026-05-30); second consecutive per-platform DEPLOY to reuse the Diagnostic-instrumentation FF Pattern. 4 Rule 9 deploy gates fired (build deploy + FF#1 `67aeacd` architecture pivot from URL-construction to live-DOM driver + FF#2 `a3107b6` diagnostic instrumentation + FF#3 `41b03c5` empirical fix the WIN restricting `findOverlayContainer` to `.deep-dive-sheet` only + reject hidden variants + remove FF#2 instrumentation); 8 Rule 14f forced-pickers fired all director-Yes-to-Recommended (8/8 = 100% calibration; running cumulative 35/38 = 92.1% across recent 6 sessions); Schema-change-in-flight flag STAYS NO entire session; NEW baseline locked: extension `npm test` = **818/818** (+87 from 731 entry baseline). THREE NEW reusable Patterns memorialized in CORRECTIONS_LOG §Entry 2026-05-31 ("Diagnostic-instrumentation FF Pattern reusability validated across consecutive sessions" + "Over-broad fallback selectors in platform DOM-walkers should be DELETED, not added" + "AJAX-loaded overlay scraping requires live-DOM driver, not URL-construction"). 4 fresh extension zips at repo root + 1 debug HTML file from director's diagnostic capture. Director Phase 4 PASS verdict on FF#3 "Everything worked perfectly this time" (identical phrasing to yesterday's eBay FF#5 PASS — same outcome shape twice in a row across different platforms + different root causes). Etsy sub-cluster fully ✅ DEPLOYED-AND-VERIFIED with no remaining scope; §C.2 estimate "~2-3 sessions" compressed into "1 calendar day"; Etsy Sessions 2 + 3 from §C.2 outline CLOSED. §A unchanged per Rule 18. Closes (a.99); opens (a.100) RECOMMENDED-NEXT = P-49 W2 Walmart sub-cluster Session 1 on `workflow-2-competition-scraping`.) **Previously updated:** 2026-05-30 (P-49 W2 eBay sub-cluster DEPLOY + 5-fix-forward cascade session — new §B 2026-05-30 entry appended; 5 Rule 9 deploy gates fired; 3 Rule 14f forced-pickers fired all director-Yes-to-Recommended; THREE NEW reusable Patterns memorialized: "Diagnostic-instrumentation FF as escape valve from speculative-FF antipattern" + "Tabpanel-scoped DOM walking" + "JSON data-island extraction"; Closes (a.98); opens (a.99) for P-49 W2 Etsy sub-cluster Session 1.) **Previously updated:** 2026-05-28 (P-49 W2 Amazon DEPLOY + 4-fix-forward cascade session — new §B 2026-05-28 entry `session_2026-05-28_p49-w2-amazon-deploy-and-fix-forwards` appended at end-of-doc as extension-side architecture cross-reference pointer entry to the canonical `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-28 deploy-session entry (per the P-23 + P-46 + Sessions 1 + 2 precedent). First production deploy of the Reviews Phase 2 implementation arc via 4 Rule 9 deploy gates within ONE Phase 4 verification session: initial deploy ff-merge `1914171..0ef8340` carrying Sessions 1 + 2 + intervening doc-batches + 3 fix-forward commits (FF#1 `8bc2e7e` accept /dp/<ASIN> dispatch + FF#2+#3 `b55cdbd` bundled trigger-modal-per-star-checkboxes + progress-indicator-per-star-breakdown + FF#4 `f6944db` pageNumber-increment pagination). Final director PASS verdict after FF#4 RESOLVES the Sessions 1 + 2 standing carry-over. Schema-change-in-flight flag FLIPPED YES → NO at initial deploy push completion (canonical schema-change-ships-to-production transition). FF#2 trigger modal extension with 5 star checkboxes makes the trigger modal the THIRD P-47 mount pattern consumer (after the original `video-capture-form.ts` + Session 2's `scrape-trigger-modal.ts` baseline). FF#4 pageNumber-increment pagination is the FIRST URL-construction-based pagination Pattern in the extension. NEW baseline locked: extension `npm test` = **655/655** (+22 cumulative from 633 entry baseline; +18 FF#1 + 4 FF#2+#3 + 0 FF#4). 9 Rule 14f forced-pickers fired all director-Yes to Recommended (9/9 = 100% calibration). 4 fresh extension zips at repo root (initial + ff1 + ff2-ff3 + ff4). THREE NEW reusable Patterns memorialized in CORRECTIONS_LOG §Entry 2026-05-28 ("Phase 4 verification fix-forward cascade scales beyond N=5 when each issue is scoped + reversible + UI-only" + "FF#1 dispatch over-restriction antipattern at per-platform extractor layer" + "Findnextpage-link-selector empirically falsified by Amazon UI change → pageNumber-direct-increment is the more robust replacement"). §A unchanged per Rule 18 — today's §B here is the extension-side cross-reference pointer per the dual-doc precedent. Closes (a.95); opens (a.96) RECOMMENDED-NEXT = P-49 W4 Captured Reviews UI extensions Session 1.)

**Previously updated:** 2026-05-26 (P-49 W2 Amazon Session 1 build session — new §B 2026-05-26 entry `session_2026-05-26_p49-w2-amazon-session-1` appended at end-of-doc as extension-side architecture cross-reference pointer entry to the canonical `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-26 build-session entry (per the P-23 + P-46 precedent — extension content-script changes get a pointer here; the canonical entry lives in the dedicated design doc). Build commit `422436f` (20 files +2069/-7) on `workflow-2-competition-scraping` shipped 3 new content-script modules (`scrape-pagination.ts` + `scrape-progress-indicator.ts` + `amazon-review-extractor.ts`) + right-click context-menu wiring in `background.ts` + `messaging.ts` + `orchestrator.ts` + per-extension api-bridge / api-client additions + 49 new node:test cases. Schema-change-in-flight flag flipped NO → YES at `npx prisma db push`. ZERO Rule 9 deploy gates fired (build commits stay on workflow branch; no production deploy). ZERO Rule 14f forced-pickers fired (design doc + launch prompt unambiguous). Pre-build + post-build /scoreboard 5/5 GREEN at expected new baselines (root tsc clean / extension tsc clean / **611 ext +49 from baseline 562** / 786 src/lib UNCHANGED / 62 routes UNCHANGED). NEW baseline locked: extension `npm test` = **611/611**. TWO NEW reusable Patterns memorialized in CORRECTIONS_LOG §Entry 2026-05-26 ("Content-script pagination via `fetch()` + `DOMParser` avoids the full-page-navigation kill" + "Foundation session bundles schema + shared helpers + first per-platform module under one commit"). §A unchanged per Rule 18 — P-49 W2 build sessions get §B entries in the canonical `docs/REVIEWS_PHASE_2_DESIGN.md`; today's §B here is the extension-side cross-reference pointer per the P-23 + P-46 + P-27 design-doc-split precedent. Closes (a.93); opens (a.94) RECOMMENDED-NEXT = P-49 W2 Amazon Session 2.)

**Previously updated:** 2026-05-25-b (Reviews Phase 2 DESIGN SESSION — new §B 2026-05-25-b entry `session_2026-05-25-b_reviews-phase-2-design-session` appended at end-of-doc as cross-reference pointer entry to the NEW standalone `docs/REVIEWS_PHASE_2_DESIGN.md` (790 lines; §A frozen 15 interview-locked subsections A.1-A.15 + §B empty + §C 4 active workstream implementation outlines W1 DONE / W2 / W4 / W5 + W3 Crawler DROPPED placeholder per Q1 outcome). Director walked the 15-question Workflow Requirements Interview scaffold preserved verbatim in yesterday's NEXT_SESSION.md; answered 14 direct-Yes-to-Recommended + 1 Q7 substantive refinement on the AI model-version selector. Pure design session (NO code, NO builds, NO deploys, ZERO Rule 9 gates fired); 16 Rule 14f forced-pickers fired (15 interview + 1 next-session); all director-Yes-aligned. §A unchanged per Rule 18 — P-49 design is design-level scope expansion that now lives in the new standalone `docs/REVIEWS_PHASE_2_DESIGN.md`. Extension-side architecture cross-reference (per P-23 precedent — extension content-script changes live in this doc, not in COMPETITION_DATA_V2_DESIGN) captured in §B 2026-05-25-b covering P-49 Workstream 2 per-platform extension extraction architecture (URL-prefix dispatch + Shadow DOM mounts + `makeTextareaField()` helper extensions). NEW reusable Pattern memorialized in CORRECTIONS_LOG §Entry 2026-05-25-b: "Director-supplied per-platform DOM specs in capture-session memorialization pay off at design-session ingestion." Schema-change-in-flight stayed "No" this session — pure design-doc capture; no schema, no API, no shared-types. SECOND APPLICATION of the design-doc-split precedent from W#2's history (P-27 → CAPTURED_VIDEOS_DESIGN.md 2026-05-20-b [first via §B 2026-05-20-b]; P-46 → COMPETITION_DATA_V2_DESIGN.md 2026-05-23 [second via §B 2026-05-23]; P-49 → REVIEWS_PHASE_2_DESIGN.md 2026-05-25-b [third application of the pattern via today's §B 2026-05-25-b]).)

**Previously updated:** 2026-05-25 (Reviews Phase 2 scope-expansion CAPTURE SESSION — new §B 2026-05-25 entry `session_2026-05-25_reviews-phase-2-capture-session` appended at end-of-doc capturing today's pure-capture outcome: NEW P-49 Reviews Phase 2 hub-and-spokes ROADMAP entry (5 internal workstreams analogous to P-46 — Design Session NEXT + per-platform extension extraction × 4 platforms Amazon→eBay→Etsy→Walmart + Crawler infrastructure CONDITIONAL + Captured Reviews UI extensions + AI review analysis system at 3 levels) + NEW P-50 Condition Pathology placeholder card ROADMAP entry + `docs/COMPETITION_DATA_V2_DESIGN.md` §A.1 deferral resolved via "RESOLVED 2026-05-25 — see ROADMAP P-49" cross-reference. Pure-capture session (NO code, NO builds, NO deploys, ZERO Rule 9 gates fired); THREE Rule 14f forced-pickers fired all director-Yes per recommendations. §A unchanged per Rule 18 — P-49 capture is design-level scope expansion that will land in the new standalone `docs/REVIEWS_PHASE_2_DESIGN.md` once next session's design interview produces it. Extension-side architecture cross-reference (per P-23 precedent — extension content-script changes live in this doc, not in COMPETITION_DATA_V2_DESIGN) captured in §B 2026-05-25 covering P-49 Workstream 2 per-platform extension extraction architecture (URL-prefix dispatch + Shadow DOM mounts + `makeTextareaField()` helper extensions). NEW reusable Pattern memorialized in §B 2026-05-25: "Mid-pre-build scope-expansion redirect — pure-capture session over mixed-session attempts." Schema-change-in-flight stayed "No" this session — pure ROADMAP + design-doc capture; no schema, no API, no shared-types.)

**Previously updated:** 2026-05-24-d (P-47 Shadow DOM refactor Session 1 — new §B 2026-05-24-d entry appended at end-of-doc capturing the content-script video-capture-form mount strategy refactor from `document.body` + 80-event-listener band-aid to open Shadow DOM root with `FORM_CHROME_CSS` injected inside the shadow + band-aid deletion. Pure CODE session on `workflow-2-competition-scraping` via build commit `d08f673` (2 files +203/-220, net -17 LOC); 5/5 GREEN at unchanged baselines (558 / 786 / 62 all UNCHANGED). §A unchanged per Rule 18 — P-47 is a structural refactor of extension content-script architecture introduced post-graduation; §A captures pre-graduation design only. NEW reusable Pattern memorialized in §B 2026-05-24-d: "Shadow DOM mount as structural replacement for per-listener event-isolation band-aid" — pairs with P-45 Build #2 §Entry 2026-05-22-i Pattern B as the long-term-fix pairing. Schema-change-in-flight stayed "No" this session — pure content-script DOM mount refactor; no schema, no API, no shared-types.)

**Previously updated:** 2026-05-23 (P-46 W#2 Phase 2 design session — new §B 2026-05-23 entry appended at end-of-doc cross-referencing the standalone `docs/COMPETITION_DATA_V2_DESIGN.md` shipped this session (~700 lines; §A frozen 10 questions + §B empty + §C 5-workstream implementation outlines; mirrors the 2026-05-20-b CAPTURED_VIDEOS_DESIGN.md split precedent). §A unchanged per Rule 18 — P-46 is a Phase 2 expansion of W#2's graduated-pattern surface; the design lives in the standalone doc. Future P-46 build sessions get §B entries in `docs/COMPETITION_DATA_V2_DESIGN.md` directly per Rule 18, NOT in this doc's §B. The 10 locked decisions cover Reviews extraction (DEFERRED to future per-platform sessions; v1 = schema + URL-detail-page view + manual entry form) + click-to-edit cells + server-side per-user UI preferences + Comprehensive Analysis page one-per-Project + TipTap rich-text editor + Sizes/Options box hide-UI-keep-data + Competition Score number-input + Status ↔ Scraping Status bidirectional mirror + Select-preview-thumbnail DROPPED + workstream sequencing Schema → URL detail page → Competition Data table → Comprehensive Analysis page → Extension + Reviews. Schema-change-in-flight stayed "No" this session — design-only.)

**Previously updated:** 2026-05-20-b (P-27 Captured-videos feature DESIGN session — new §B 2026-05-20-b entry appended at end-of-doc cross-referencing the standalone `docs/CAPTURED_VIDEOS_DESIGN.md` shipped this session. §A unchanged — P-27 is a NEW polish item on top of W#2's graduated-pattern surface; §A frozen per Rule 18. The design lives in standalone `docs/CAPTURED_VIDEOS_DESIGN.md` (525 lines after corrections; §A.0–§A.18 frozen + §B empty per Rule 18 shape) per the Rule 14f forced-picker pick of Option A — new top-level doc — over Option B (§B append here) and Option C (both). Future P-27 ship sessions get §B entries in `docs/CAPTURED_VIDEOS_DESIGN.md` directly per Rule 18, NOT in this doc's §B. Rule 24 end-of-session catch on the §A.8 asymmetry-claim captured in `docs/CORRECTIONS_LOG.md` §Entry 2026-05-20-b INFORMATIONAL. Schema-change-in-flight stayed "No" this session — design-only.)

**Previously updated:** 2026-05-19-g-2 (ADDENDUM to 2026-05-19-g — same Claude session, post-handoff scope-add. Director added a new W#2 pre-graduation polish item P-27 — Captured-videos feature: end-to-end parity with captured-text + captured-image flows. New §B 2026-05-19-g-2 entry appended at end — mid-build directive Read-It-Back per Rule 18 — capturing the scope-add directive verbatim + director's three Rule 14f forced-picker outcomes (Q1 Source = URL reference + uploaded video bytes BOTH stored; Q2 Gestures = full symmetry with text/image right-click + embed + popup paste; Q3 Graduation timing = pre-graduation polish item) + the 7 open design questions to resolve in the dedicated design interview before any code starts (Supabase bucket strategy; thumbnail extraction approach; schema additions; YouTube/Vimeo handling; cross-platform `<video>` detection; Living Questions answers; DATA_CATALOG §7 reciprocal output declaration). §A unchanged per Rule 18. Schema-change-in-flight stays "No" for now; flips to "Yes" when P-27 implementation starts.)

**Previously updated:** 2026-05-19-g (W#2 → main deploy session #28 — P-23 saved-URL dropdown side-by-side SHIPPED + DEPLOYED + REAL-CHROME-VERIFIED on vklf.com on all 3 caller forms — popup paste form + right-click "Add to PLOS — Captured Text" overlay + right-click "Add to PLOS — Image" overlay. §B 2026-05-19-g entry appended at end covering: (1) the launch-prompt drift catch at session-start (Rule 3 — `url-add-form.ts` had no saved-URL `<select>`; actual sites were three: `text-capture-form.ts` + `image-capture-form.ts` + `CapturedTextPasteForm.tsx`); (2) Rule 14f scope picker outcome (director chose all-3-sites scope); (3) em-dash label format choice via Rule 14f forced-picker (em-dash vs. pipe vs. two-line-via-CSS vs. aggressive-truncate); (4) truncation budget refinement (60-char when productName present, 80-char when productName absent — preserves pre-P-23 URL-only behavior exactly); (5) extraction to shared pure helper `buildSavedUrlOptionLabel` at `extensions/competition-scraping/src/lib/saved-url-option-label.ts` so all 3 caller sites share the same label-building logic; (6) Hybrid test coverage via Rule 27 forced-picker (12 node:test pure-helper cases + 1 Playwright extension-context spec on the text-capture-form rendering path — sibling sites covered by the pure-helper cases alone since the helper output is identical across all 3 callers); (7) zero new polish items captured this session; (8) (a.50) RECOMMENDED-NEXT = W#2 polish P-22 — Playwright cross-platform slices 2-4 (defensive coverage extension to ebay + etsy + walmart for the existing single-platform amazon happy-path P-23/P-24/P-25 specs). §A unchanged per Rule 18. Schema-change-in-flight stays "No".)

**Previously updated:** 2026-05-18-b (W#2 → main deploy session #18 — P-34 (propagate row hover-highlight to captured-text rows + image thumbnails on URL detail page) DEPLOYED to vklf.com + REAL-INDEPENDENT-WEBSITE VERIFY. §B 2026-05-18-b entry appended at end covering: (1) deploy session #18 standard cheat-sheet (b) execution + brief director re-verify on captured-text rows + image thumbnails ("all green, hover works on both"); (2) HEADLINE — W#2 admin data-management surface now COMPLETE + LIVE on vklf.com with hover-highlight UX consistency across URL list + captured-text rows + image thumbnails; (3) implementation subtlety captured — captured-text rows reuse P-33's `querySelectorAll('td')` pattern verbatim, BUT image thumbnails use `querySelector('button')` on outer wrapper to target first descendant button (ThumbnailButton; trash-overlay sits second in DOM order) AND explicitly restore `#0d1117` on leave rather than clearing to `''` because the card has an explicit base background; (4) zero new polish items captured this session; (5) (a.41) RECOMMENDED-NEXT = W#2 polish P-21 — symmetric-canonicalize `pickInitialUrl` + `buildRecognitionSet` (MEDIUM defensive). §A unchanged per Rule 18. Schema-change-in-flight stays "No".)

**Previously updated:** 2026-05-18 (W#2 → main deploy session #17 — P-28 + P-27 ALL DEPLOYED to vklf.com + REAL-INDEPENDENT-WEBSITE FULL VERIFY across Parts A-E + IN-SESSION SCOPE-ADD P-33 row hover-highlight SHIPPED + paint-bug HOT-FIXED + DEPLOYED + VERIFIED in same session. §B 2026-05-18 entry appended at end covering: (1) deploy session #17 standard cheat-sheet (b) execution + 5-part director walkthrough verification on real Independent Website URL (4 delete surfaces + rollback path); (2) HEADLINE — W#2 admin data-management surface (add + manual-add + edit + delete) now complete + live on vklf.com; (3) P-33 in-session scope-add — Rule 11 forced-picker → Ship-as-tack-on; first-attempt `<tr>`-background-paint slip + hot-fix to `querySelectorAll<HTMLTableCellElement>('td')` + bumped color `#161b22` → `#21262d`; (4) pattern lesson captured in CORRECTIONS_LOG — grep `tr:hover` against `*.css` in `src/` BEFORE inline-on-`<tr>` approach; (5) (a.40) RECOMMENDED-NEXT = W#2 polish P-34 propagate hover-highlight to captured-text rows + image thumbnails on URL detail page. §A unchanged per Rule 18. Schema-change-in-flight stays "No".)

**Previously updated:** May 16, 2026 (W#2 → main deploy session #16 — P-30 + P-31 + P-32 ALL DEPLOYED to vklf.com + REAL-INDEPENDENT-WEBSITE FULL VERIFY across P-32 multi-file-drop case + 4 P-29 area spot-checks. §B 2026-05-16 entry appended at end covering deploy outcome + walkthrough verification + the P-29 manual-add area's end-to-end regression coverage achievement (UI mechanical via P-30 Playwright + API route-handler integration via P-31 node:test +62 cases + real-website director walkthrough). §A unchanged per Rule 18. Schema-change-in-flight stays "No".)

**Previously updated:** May 15, 2026-h (W#2 P-31 BUILD session — route-handler DI refactor SHIPPED at code level on `workflow-2-competition-scraping` + P-32 multi-file-drop warning fix SHIPPED + 62 new node:test cases all passing. §B 2026-05-15-h entry appended below covering the Option A → A' DI seam fork (per-route closure factory adapted to RequestLike contract after mid-flight probe revealed `next/server` cannot load under `node --test --experimental-strip-types`), the factory architecture across all 4 W#2 routes, and the headline scoreboard delta (src/lib node:test 447 → 509). §A unchanged per Rule 18. Schema-change-in-flight stays "No".)

**Previously updated:** May 15, 2026-g (W#2 P-30 BUILD session — Playwright React-bundle stub-page rig SHIPPED at code level on `workflow-2-competition-scraping` in commit `0548da7`. §B 2026-05-15-g entry appended below covering the Rule 14f forced-picker outcome (Option A — extend P-17 authFetch esbuild stub-page pattern), the rig architecture, and the headline scoreboard delta (P-29 Playwright cases went from 31 skipped → 30 pass + 1 P-32-deferred-skip). §A unchanged per Rule 18. Schema-change-in-flight stays "No".)

**Previously updated:** May 15, 2026-f (W#2 → main deploy session #15 — P-29 Slice #3 DEPLOYED to vklf.com + REAL-INDEPENDENT-WEBSITE FULL VERIFY across all five parts in a single batched pass; zero walkthrough-found polish items. §B 2026-05-15-f entry appended below covering the deploy outcome + walkthrough verification + P-29 three-slice arc completion. §A unchanged. Schema-change-in-flight stays "No".)

**Previously updated:** May 15, 2026-e (W#2 P-29 Slice #3 BUILD session — manual-add captured-image modal + new SSRF-guarded `fetch-by-url` route + new pure-function `ssrf-guard.ts` module + 37 security-class node:test cases all SHIPPED at code level on `workflow-2-competition-scraping`. §B 2026-05-15-e entry appended below. §A unchanged per Rule 18. Schema-change-in-flight stays "No".)

**Previously updated:** May 15, 2026 (W#2 polish session #11 — P-12 SHIPPED at code level on `workflow-2-competition-scraping` (commit `414efe6`) — extension 401-retry / silent-refresh analog to P-1. `extensions/competition-scraping/src/lib/api-client.ts` `authedFetch` refactored to factory `makeAuthedFetch({ supabase, fetchFn })` + 9 new unit tests; 261/261 ext tests pass; deploy pending per ROADMAP W#2 row (a.15). §B 2026-05-15 entry appended below; §A remains frozen per Rule 18; schema-change-in-flight stays "No".)
**Previously updated:** May 7, 2026-h (W#2 Chrome extension build — session 3 — §B 2026-05-07-h entry appended covering Module 1 URL-capture content script for the 4 shopping platforms (Amazon, Ebay, Etsy, Walmart) + the 3 URL-recognition specs from the §B 2026-05-07-g end-of-session addendum + URL-add overlay form; §A remains frozen per Rule 18; schema-change-in-flight stays "No"; per-platform DOM-pattern modules + URL-normalization helper + recognition cache + 36 walked-through tests appended to verification backlog targeting Waypoint #1.)
**Previously updated:** May 4, 2026 (W#2 Stack-and-Architecture session — first §B entry appended; all 13 §A.17 deferred questions RESOLVED via new Group B doc `COMPETITION_SCRAPING_STACK_DECISIONS.md`; §A remains frozen per Rule 18; schema-change-in-flight flag flipped to "Yes" at start of session per `MULTI_WORKFLOW_PROTOCOL.md` Rule 4)
**Previously updated:** May 4, 2026 (creation; §A frozen at end of Workflow Requirements Interview; §B empty pending future in-flight refinements)

**Doc type:** Group B (workflow-specific). Loaded whenever a session works on W#2.

**Related docs:**
- `HANDOFF_PROTOCOL.md` Rule 18 — Workflow Requirements Interview methodology
- `HANDOFF_PROTOCOL.md` Rule 19 — Platform-Truths Audit (executed this session; results in `PLATFORM_REQUIREMENTS.md` updates)
- `HANDOFF_PROTOCOL.md` Rule 21 — Pre-interview directive scan (executed; no prior W#2-specific directives found)
- `HANDOFF_PROTOCOL.md` Rule 25 + `MULTI_WORKFLOW_PROTOCOL.md` — Multi-workflow coordination (W#2 lives on `workflow-2-competition-scraping` branch; W#1 stays on `main`)
- `PLATFORM_REQUIREMENTS.md` §1.4 + §2.2.1 + §6 + §6.6 + §8.4 + §10.1 + §10.2 + §12.6 — Platform-truths audit additions (NEW 2026-05-04)
- `PROJECT_CONTEXT.md` §2 — Workflow #2 one-line description
- `DATA_CATALOG.md` §6.1 + §7.2.2 — W#2 entries (filled out this session)

**Structure (per HANDOFF_PROTOCOL Rule 18):**
- **§A — Initial Workflow Requirements Interview answers.** Frozen at end-of-interview. Authoritative initial spec.
- **§B — In-flight refinements (append-only).** Empty at end of interview. Future sessions append entries here, never edit prior ones or §A.

---

## §A — Initial Workflow Requirements Interview answers (FROZEN 2026-05-04)

### A.0 Interview meta

- **Interview format:** Director provided a comprehensive free-form brief (preserved verbatim in §A.15 below); Claude read it back; then conducted the structured 14-question interview in 4 clusters of 3-5 questions each, with read-back between clusters.
- **Pre-interview directive scan (Rule 21):** searched `ROADMAP.md`, `DATA_CATALOG.md`, `PLATFORM_REQUIREMENTS.md`, `PROJECT_CONTEXT.md` for prior W#2-specific directives. **No directives found.** Only structural pointers exist (e.g., `ROADMAP.md` line 1892 confirms "next step = Workflow Requirements Interview produces COMPETITION_SCRAPING_DESIGN.md"; `DATA_CATALOG.md` §7.2.2 placeholder noting W#1 topic hierarchy as anticipated input — REJECTED at interview, see Q4).
- **Sister-workflow state at interview time:** W#1 (Keyword Clustering) was in stabilization on `main`; just shipped the atomic-batch fold-in (`0caa200`); D3 retry paused at canvas 194; schema-change-in-flight = No. No coordination conflicts.

---

### A.1 Purpose (Q1)

W#2 is a **Chrome browser extension** plus a corresponding **section inside PLOS at vklf.com**, working together to let a human (admin in Phase 1; multiple workers from Phase 3 onward) collect competitive-intelligence data — URLs, text snippets, and images — from competitor product listings on shopping platforms (Amazon, Ebay, Etsy, Walmart, Google Shopping, Google Ads) and from independent product websites discovered via Google organic results.

**Critically: data capture is 100% human-driven.** The user manually highlights text, right-clicks images, drags region screenshots. The extension's job is to make those manual motions fast and well-organized, NOT to crawl/scrape autonomously. This is intentional — the platform stays clear of every shopping-platform's anti-bot Terms of Service.

All captured data flows in real-time into the corresponding Project's "Competition Scraping & Deep Analysis" section in PLOS at vklf.com, where downstream workflows (W#3 Therapeutic Strategy, W#5 Conversion Funnel, W#6 Content Development, W#9 Clinical Evidence, W#10 Reviews, etc.) can consume it.

W#2 has TWO co-equal halves with different deployment models:
1. **Chrome extension** — installed in the user's browser; runs outside vklf.com; has its own UI, auth, state, and build pipeline.
2. **PLOS web section** — lives at `/projects/[projectId]/competition-scraping`; built into the existing Next.js app; imports specific components from the Shared Workflow Components Library (per Q14).

Both halves talk to the same backend APIs and write to the same Postgres tables. PLOS DB is the single source of truth (per Q12).

---

### A.2 Users (Q2)

| Phase | Users | Detail |
|---|---|---|
| **Phase 1** | Admin only (1 person) | Admin uses the extension and the PLOS section solo |
| **Phase 3** | ~10 workers + admin | Workers are **platform specialists** — one worker covers Amazon across many Projects; another covers Ebay; etc. NOT generalists. |
| **Phase 4** | ~20 workers + admin | Same platform-specialist pattern; ~3 workers per platform globally |

**Assignment model — 4-way (refines `PLATFORM_REQUIREMENTS.md §2.2`'s 3-way model):**

Per-(user × workflow × project × platform) where platform ∈ {Amazon, Ebay, Etsy, Walmart, GoogleShopping, GoogleAds, IndependentWebsites}.

**Hard rule:** exactly one worker per (project, platform). Two workers are NEVER assigned to the same platform within the same Project. Enforced at the assignment table level — the assignment UI rejects double-assignment.

**Implication:** the Phase-2 Assignment table needs an OPTIONAL `subScope` column (string, default null). W#2 populates it with the platform name. Other workflows leave it null. Index: composite `(workflow, projectId, subScope)` for fast "is this slot taken" lookups.

**Cross-reference:** `PLATFORM_REQUIREMENTS.md §2.2.1` (NEW 2026-05-04) — captures this as the platform-wide pattern; future workflows declare their own sub-scopes if needed.

---

### A.3 Throughput (Q3)

| Phase | Workers | Projects/day | Projects/week¹ | Projects/year² |
|---|---|---|---|---|
| Phase 1 | 1 (admin) | ~1 | ~7 | ~365 |
| Phase 3 | ~10 | ~10 | ~70 | ~3,650 |
| Phase 4 | ~20 | ~20³ | ~140³ | ~7,300³ |

¹ Assuming 7 days. ² Assuming ~52 weeks. ³ Phase 4 throughput is linear-extrapolation of Phase 3 (10 workers → 10/day; 20 workers → 20/day); director didn't explicitly commit to a Phase 4 number.

**Per-Project capture footprint (director's estimate):**

- ~100 competitor URLs per Project, total across all 7 platforms
- ~5,000 text rows per Project (titles, bullets, descriptions, reviews, etc.)
- ~300 images per Project (regular product shots + A+ content region-screenshots)

**Image storage projections (cumulative, ~500 KB average per image):**

- Phase 3: ~70 Projects/wk × 300 images × 500 KB ≈ **~500 GB/year**
- Phase 4: ~140 Projects/wk × 300 images × 500 KB ≈ **~1 TB/year**

**Cross-reference:** `PLATFORM_REQUIREMENTS.md §10.2` (NEW 2026-05-04) — captures the image-storage scale as a platform-level fact + dedicated bucket strategy.

**W#2 is the platform-bottleneck workflow at Phase 3.** Platform-wide Phase-3 target is 500 Projects/week (per `PLATFORM_REQUIREMENTS.md §1.2`). W#2's 70/week is ~7× lower. To match the platform target, W#2 would need ~70 workers, OR per-Project work would need to compress 7×, OR some Projects skip W#2. Director-acknowledged tradeoff; revisit at Phase 3 ramp time.

**Cross-reference:** `PLATFORM_REQUIREMENTS.md §1.4` (NEW 2026-05-04) — captures per-workflow throughput-bottleneck recognition pattern.

---

### A.4 Inputs (Q4)

W#2 is **fully self-contained input-wise.** It has zero upstream contract with W#1 or any other workflow.

**What W#2 reads:**
- **Project record** (Project ID, name, description) — from the existing `Project` table; same data the rest of PLOS uses.
- **User credentials** (extension authenticates against PLOS).
- **User-typed inputs at runtime:** highlight terms, selected platform, URL edits, field values, custom field definitions, etc.

**What W#2 explicitly does NOT read:**
- W#1's topic hierarchy / canvas / keyword clusters. Director rejected this at interview time. (Earlier `DATA_CATALOG.md §7.2.2` placeholder speculated W#2 might read W#1's topic hierarchy; that speculation is now overruled.)
- Anything from W#3-W#14.

**Implication for workflow readiness (see Q6):** W#2 is "always ready" — no upstream dependency to wait for.

---

### A.5 Outputs (Q5) — provisional list; design data model FLEXIBLY

Per `HANDOFF_PROTOCOL.md` Rule 18 reciprocal output declarations, W#2's outputs are explicitly named here. **Specific downstream consumers will be filled in at THEIR design interviews** — director chose NOT to lock in downstream consumer assumptions now.

**Director's directive at interview time:** "Design the system in a way that allows us to use things easily in the downstream workflows." Translation: the data model must be FLEXIBLE — extensible field schemas, loose downstream coupling, no assumptions baked in about which downstream workflow will read what.

**Provisional output list:**

| # | Output (provisional Human Reference Language) | What it is, in plain terms | Anticipated downstream consumers (provisional; finalized per consumer's interview) |
|---|---|---|---|
| 1 | **Competitor URL list** (per Project, per platform) | The structured list of every competitor product/listing the user identified, tagged by platform and competition category, with all the fields specified in §A.7 Module 1 | W#3 Therapeutic Strategy, W#5 Conversion Funnel, W#6 Content Development, W#9 Clinical Evidence, W#11 Post-Launch Optimization |
| 2 | **Captured text corpus** (per Project, per URL, per category) | All text snippets captured from competitor pages (titles, bullets, descriptions, reviews, etc.), tagged by content category + arbitrary tags | W#3, W#5, W#6, W#9, W#10 (Reviews) |
| 3 | **Captured image library** (per Project, per URL, per category) | All images saved (regular + region-screenshot A+ modules), with `Composition` + `Text` fields, tagged by image category + arbitrary tags | W#4 Brand Identity (visual references), W#6 Content Development (image inspiration), W#7 Multi-Media Assets (style references) |
| 4 | **Project-scoped vocabularies** | The user-created lists per Project: Competition Categories, Product Names, Brand Names, Size/Option labels, Content Categories, Image Categories, custom fields | Any downstream workflow on the same Project — vocabularies are platform-shared per `PLATFORM_REQUIREMENTS.md §8.4` |
| 5 | **Per-platform discovery metadata** | Which discovery channel (Amazon search, Google Shopping, Google Ads, Google organic) found each URL — preserves "how did we find this competitor" provenance | W#11 Post-Launch Optimization, W#13 Exit Strategy |

**Edit permissions — per-(producing-workflow, data-item, consuming-workflow) granular:**

Director's framing: "Downstream workflows are allowed to EDIT some of this data. Will be shared as per workflow." The default direction is NOT read-only. Specific edit permissions are deferred to each downstream workflow's design interview.

**Cross-reference:** `PLATFORM_REQUIREMENTS.md §6.6` (NEW 2026-05-04) — captures the granular permission model platform-wide.

**Vocabularies (output #4) are platform-shared, not W#2-owned:** any downstream workflow can ADD entries. W#2 just bootstraps the vocabularies. **Cross-reference:** `PLATFORM_REQUIREMENTS.md §8.4` (NEW 2026-05-04).

---

### A.6 Workflow readiness rules (Q6)

**Rule:** W#2 is **"always ready"** for any Project, regardless of whether W#1 (or any other workflow) has produced data for that Project.

**Prerequisites for working on W#2 in a Project:**
1. The Project must exist. Project creation is independent of any workflow — the `/projects` page (`src/app/projects/page.tsx:297-380`) has a "New Project" inline form that doesn't require any workflow. Confirmed by code inspection at interview time.
2. (Phase 2+) The user must have a (user × workflow × project × platform) assignment.

**No upstream data dependency.** W#2 doesn't wait for W#1 or anything else.

**Cross-reference:** `PLATFORM_REQUIREMENTS.md §6` example updated 2026-05-04 to reflect this (earlier draft incorrectly speculated W#2 would depend on W#1's topic hierarchy).

---

### A.7 User experience shape (Q7)

**Two halves with different components-library relationships (see Q14):**
1. Chrome browser extension — wholly outside the components library; separate codebase
2. PLOS-side section at `/projects/[projectId]/competition-scraping` — imports specific components from the Shared Workflow Components Library

**Bidirectional sync (Option C from Q7.a):** users can EDIT field values in BOTH the extension AND PLOS. The backend syncs both ways.

#### Module 1 — Competition Identification

**Job:** build a structured list of "who the competition is, where they live online, and basic facts about each."

**Setup (in the extension, before adding URLs):**

- User logs in with PLOS credentials → extension authenticates with PLOS → extension shows the user's accessible Projects (filtered by their assignments in Phase 2).
- User picks a Project to work on.
- User picks **which source platform** they're about to capture URLs from: Amazon / Ebay / Etsy / Walmart / Google Shopping / Google Ads / Independent Website (found via Google organic results).
- **Why platform-pick is mandatory before URL capture:** for non-shopping-site sources (Google Shopping, Google Ads, Independent Websites), the URL itself doesn't betray which discovery channel it came from — it just looks like a company's product page. Platform-pick at session start lets us tag every URL captured in that session with its discovery source.
- User enters one or more **"Highlight Terms"** — keywords/phrases the user wants the extension to find-and-highlight on whatever page they visit later. Each term gets a **user-pickable highlight color** from a palette of ~20 distinct swatches. Font color flips automatically (white text on dark background, black text on light background) so it's always readable. Terms are removable.

**The "live" part of Module 1 (this happens on the source platform's site, not on vklf.com):**

- User goes to Amazon (or wherever) and searches for something.
- Extension scans the page DOM, highlights every occurrence of the user's "Highlight Terms" in their chosen colors, and shows an **overlay** with a count of how many times the terms appeared on the page.
- This is purely a "help me eyeball which results are relevant" feature — no data is saved yet.
- When the user spots a competitor URL worth saving, they trigger an **add-URL gesture** (recommended: **Shift + Click**, with right-click fallback for trackpad-only users). Final gesture choice deferred to extension-build session.
- An **overlay** opens showing: the Project (auto), the chosen platform (auto), the URL (editable), and a set of fields they can fill in later or now.

**Per-URL fields (some required at capture, most fillable later):**

Required at capture (auto-populated; user only confirms):
- URL (auto, editable)
- Platform (auto)
- Project (auto)

Fillable later (free-form OR pick-from-prior):
- **Competition Category** — e.g., "device," "topical product," "supplement" — sortable in PLOS. Per-Project shared vocabulary.
- **Product Name** — per-Project shared vocabulary.
- **Brand Name** (often different from product) — per-Project shared vocabulary.
- **Size/Option** — sub-record under Product Name; one product can have many sizes.
- **Price** — sub-field under Size/Option; one product+size = one price.
- **Shipping Cost** — sub-field under Size/Option.
- **Results Page Rank** — what position this URL appeared at in the search results.
- **Product Star Rating** (Amazon, Ebay, Walmart only).
- **Seller Star Rating** (Etsy).
- **Number of Product Reviews**.
- **Number of Seller Reviews**.
- **User-defined custom fields:**
  - "Add new product-associated category" (e.g., Country of Manufacturing)
  - "Add new product-Size/Option-associated category" (e.g., Customizations for extra-large bottles)

**Other Module 1 behaviors:**

- User can browse the captured URL list inside the extension (mini-table view) so they can fill in fields without going back to vklf.com.
- User can also add a URL **manually** (typing it into a table) — useful for independent websites or any case the click-to-capture flow doesn't fit.
- User can edit/delete captured URLs from the extension OR from PLOS (bidirectional sync).

#### Module 2 — Competition Data Scraping

**Job:** for each URL captured in Module 1, collect the page's content — text snippets and images — categorized by content type.

**URL recognition:** when the user navigates back to a URL that's already in the system (for the current Project), the extension visibly signals "yes, this URL is recognized" — quickly and obviously (e.g., a green badge in the extension popover, or a subtle border highlight).

**Saving text — two paths:**

1. **Highlight-and-add:** user highlights a span of text on the page → triggers an "Add text" gesture (recommended: keyboard shortcut OR right-click context-menu item — final choice at extension-build session) → picks a **content category** (pre-existing or new on the spot) → text is saved against (URL, Project, category).
2. **Paste-into-extension:** user pastes raw text into the extension → picks URL → picks category → saved.

**Saving images — two flavors:**

1. **Regular image** (a product shot): right-click → "Save to PLOS" context-menu item → picks category → image is saved as a thumbnail in PLOS, expandable on click.
2. **A+ Content Module** (a marketing block where text is overlaid on an image, common on Amazon): right-click-save loses the text overlay because it's a separate DOM layer. Instead, the user invokes a special **"region-screenshot mode"** → mouse turns into a highlighter → user drags a rectangle around the entire visual block (image + overlaid text) → screenshot is saved as a single flattened PNG/JPG where the text is now baked into the pixels.

**Region-screenshot mechanism (provisional):** `chrome.tabs.captureVisibleTab` API to get the visible viewport, then crop client-side to the user's rectangle. Final approach evaluated at extension-build session.

**Every saved text or image record gets these extra fields:**
- **Composition** — describes what's IN the image (free text, manual now; future AI auto-fills it via vision model)
- **Text** — the text that appears INSIDE the image (free text, manual now; future AI auto-fills it via OCR / vision model)
- **Tags** — arbitrary text tags the user can add to any captured row, on top of the structured category

**Display on both sides (extension AND PLOS):**

- Captured data shows as a **table**.
- Browseable by clicking platform name → list of URLs for that platform → list of captured rows for that URL.
- Rows are **editable, deletable, reorderable, addable** from BOTH sides (bidirectional sync).
- Manually-added rows still attach to a URL/category.

#### UX split between extension and PLOS

| Action | Extension | PLOS |
|---|---|---|
| Log in with PLOS credentials | ✅ | ✅ (already exists) |
| Pick a Project | ✅ | ✅ (already exists at `/projects`) |
| Pick a platform (per session) | ✅ | — |
| Manage Highlight Terms + colors | ✅ | — |
| See live highlights on source platform's page | ✅ | — |
| Add-URL gesture (Shift+Click) | ✅ | — |
| Manually add a URL (typing) | ✅ | ✅ |
| Add-text gesture (highlight + shortcut) | ✅ | — |
| Paste text into extension | ✅ | — |
| Add-image gesture (right-click) | ✅ | — |
| Region-screenshot mode | ✅ | — |
| Browse captured-so-far | ✅ (mini-table) | ✅ (full sortable/filterable view) |
| Edit any field | ✅ | ✅ |
| Delete a row / URL | ✅ | ✅ |
| Reset extension state (LOCAL only) | ✅ | — |
| **Reset all W#2 data for this Project** (admin only, destructive, behind guard) | — | ✅ |
| Download extension files + install instructions | — | ✅ (always-visible deliverables area) |
| View image full-size + download original | — | ✅ |
| Sort/filter captured data | ✅ (basic) | ✅ (full) |
| Worker-status: "I'm done with platform X for Project Y" | ✅ | ✅ |
| Admin: assign workers per (Project, platform) | — | ✅ (Phase 2+) |
| Future: AI auto-populate Composition + Text on images | — | ✅ |

---

### A.8 Concurrency requirements (Q8)

**Pattern:** effective **Pattern A (strict single-editor)** at the (Project × platform) granularity, NOT at the Project granularity.

**Why:** per-platform partitioning (Q2) means two workers' writes physically can't conflict. Worker-A writes rows tagged `platform=Amazon`; Worker-B writes rows tagged `platform=Etsy`. There's no shared row to race on.

**Implication:** no operational-transform / CRDT machinery needed. Standard last-write-wins on individual rows is sufficient because the partitioning model means real conflicts (two workers editing the same row) cannot occur in normal operation.

**Edge case — admin-self-edit while a worker is offline:** a worker captures data offline; in the same window, admin edits a field on a captured row from PLOS; worker comes back online and the offline queue flushes. The most-recent write wins (admin's edit OR worker's edit, whichever was timestamped later by the server). Acceptable per "captured = done, no review cycle" framing — but flagged here so it's not a surprise later.

**Cross-reference:** `PLATFORM_REQUIREMENTS.md §3.2 Pattern A`.

---

### A.9 Review cycle applicability (Q9)

**"Captured = done."** W#2 does NOT use the standard `submitted-for-review → acceptable | revision-requested` cycle from `PLATFORM_REQUIREMENTS.md §4`.

The deliverable is the captured competition dataset; once the worker has captured it, it's available for downstream consumption immediately. No admin sign-off step.

**Implication for Phase-2 worker-status flow:** the worker UI shows a "I'm done with [platform] for this Project" button that flips the assignment to a `completed` state directly, skipping the `submitted-for-review` and `acceptable | revision-requested` states. The library's `<WorkerCompletionButton>` (Phase 1 path) is used; `<AdminReviewControls>` (Phase 2) is skipped for workflows like W#2 that declare `reviewCycle: 'skip'`.

---

### A.10 Audit trail requirement (Q10)

- **Phase 1 (admin solo):** NO audit emission. Irrelevant.
- **Phase 3 (~10 workers):** audit emission turns ON. Useful for catching mis-categorization patterns ("this worker keeps mis-categorizing X").
- **Implementation:** hooks into the platform-wide audit-trail infrastructure that Phase 2 builds (per `PLATFORM_REQUIREMENTS.md §5.5`).
- **Granularity:** per-action audit events for capture, edit, delete, vocabulary-add. Specific event payload schema deferred to Phase-3 audit-design time.
- **Phase 4:** audit table partitioning / archival evaluated at scale per `PLATFORM_REQUIREMENTS.md §5.4`.

---

### A.11 Reset rules (Q11)

**Two-scope reset model:**

1. **Extension-LOCAL reset.** User clicks "Reset extension" inside the extension UI. Behavior: extension's local cache is wiped + UI returns to "no Project selected" state. **Does NOT touch PLOS data.** Use case: worker finishes one Project's platform and wants to pivot to a different Project; or extension's local state got cluttered and they want a clean slate without losing PLOS-side data. Cheap, reversible (just re-log-in and re-pick the Project).

2. **PLOS-side data reset (admin-only, destructive).** Admin clicks "Reset W#2 data for this Project" inside PLOS at the Project's W#2 card. Behavior: deletes all W#2-captured data for this specific Project — URL records, text rows, image rows, vocabularies (entries created BY W#2 in this Project; vocabularies that other workflows added entries to are untouched per the platform-shared vocab model in §8.4). Same shape as W#1's reset (per `PLATFORM_REQUIREMENTS.md §7`). **Behind a guard:** "type the Project name to confirm — this will permanently delete all W#2 data for Project X." NOT reversible.

**Why this two-scope model (Option C in interview Q11.a):** clean separation of concerns. Extension reset = "I'm done with this Project on the extension side and want to pivot" (no destructive consequence). PLOS reset = "delete this Project's W#2 data" (destructive, admin only, behind guard). Both UIs make their consequences obvious.

---

### A.12 Data persistence (Q12)

**Director's framing at interview:** "Choose a methodology that is most sturdy and reliable with least risk of data loss." Director deferred to Claude's recommendation; Claude proposed an approach; director approved as drafted.

**Approved approach: "PLOS is canonical; extension is a thin client with offline tolerance."**

1. **PLOS database is the single source of truth.** Every captured URL, text row, image, vocabulary entry, custom field, etc. lives in the PLOS Postgres database (Supabase). Images live in Supabase Storage with their DB row holding the storage URL.

2. **Every user action in the extension writes through to PLOS immediately.** No batching, no "save when you click away." User highlights text → clicks Add → request goes to PLOS → ack returns → row appears in extension UI. Same for URL captures, image saves, field edits, deletes. **No window of time exists where captured data is "extension-only" and could be lost on tab close.**

3. **Each capture carries a client-generated unique ID (UUIDv4).** If a write times out and the extension retries, PLOS recognizes the ID and treats the second write as a no-op. So retries are safe — never produce duplicates.

4. **The extension keeps a small local cache** (Chrome extension's `chrome.storage.local`) for two purposes:
   - **(a) Read cache** — keeps the "browse captured-so-far" view inside the extension snappy without a round-trip to PLOS on every keystroke.
   - **(b) Offline write queue** — if PLOS is unreachable when the user captures something (slow Wi-Fi, PLOS deploy in progress, etc.), the capture is queued locally and flushed automatically when the connection returns. The user sees a small "syncing N items" indicator while the queue drains. **The extension does NOT let the user navigate away or close the tab while there's an unflushed write** — a small modal blocks tab close, same shape as Gmail's "you have unsaved changes" guard.

5. **PLOS pushes updates back to the extension in near-real-time:**
   - **Phase 1:** 5-10 second polling.
   - **Phase 2 onward:** Supabase Realtime subscription (when the platform-wide realtime infrastructure goes in per `PLATFORM_REQUIREMENTS.md §3.4`).
   - Bidirectional sync per Q7.a: edits in PLOS land in the extension; edits in extension land in PLOS.

6. **Image storage:** Supabase Storage, dedicated `competition-scraping` bucket, private (signed-URL access only), per-Project folder structure. **Reversibility:** swappable to S3 later via the storage helper wrapper that `PLATFORM_REQUIREMENTS.md §10.4` already requires.

7. **Image upload is two-phase:** (a) extension POSTs the image bytes to PLOS → PLOS uploads to Supabase Storage → returns a storage URL; (b) extension POSTs a captured-image row referencing that URL. If phase (a) succeeds but phase (b) fails, the orphaned image is cleaned up by a daily janitor job. **Why two-phase:** ensures the DB row only exists if the image is actually retrievable.

**Reversibility of this whole approach:** very high. Every layer (write-through, idempotency, offline queue, image two-phase) is additive — we can simplify any of them later if profiling shows them unnecessary, without losing data. Going the OPPOSITE direction (starting with batched local-heavy storage and trying to add reliability later) is much harder to retrofit safely.

**What this approach explicitly avoids:**
- "Local-first" architectures (PouchDB / IndexedDB-as-primary) — too easy to lose data when a user uninstalls the extension or wipes Chrome.
- "Save on tab close" — race condition on every reload.
- Fire-and-forget writes — invisible failure mode that bites months later.

---

### A.13 Edge cases and quality bar (Q13)

**Quality bar:** **niche-dependent and not ascertainable up-front.** There is no platform-wide quality threshold for "this dataset is acceptable."

Combined with Q9 ("captured = done, no review cycle"), the design implication is:

- **NO automated quality scoring** in W#2 (unlike W#1, which has stability scoring on AI-driven topics).
- **NO per-Project quality threshold check** that would block a worker from completing.
- **Admin judges quality by inspection**, per-Project. If a worker's dataset is sub-par for a particular niche, admin uses the PLOS-side reset action (per Q11) to wipe and re-assign.
- **Phase 3 audit trail** (per Q10) gives admin the forensic data to spot patterns ("this worker keeps mis-categorizing X") without slowing down the per-Project workflow.

**Edge cases worth recording for future implementation sessions:**

- **Site DOM changes (Amazon/Ebay/etc. update their HTML):** the extension's highlight + URL-recognition + region-screenshot logic depends on stable DOM patterns. Any site redesign breaks the extension. Mitigation: per-platform DOM-pattern modules in the extension; when a site changes, only that platform's module needs an update. Captured tab in `chrome.storage.local` of "platform DOM version observed last" so the extension can warn the user when a platform's DOM changes shape.
- **Captured page changes after capture (competitor updates their listing):** captured data is a snapshot. The captured URL still works, but if the user re-visits later and re-captures, the new capture lands as a new row (different timestamp) — old row preserved as historical.
- **Region-screenshot capturing the wrong region:** user can re-capture; old screenshot can be deleted from PLOS or extension.
- **Image storage bucket fills up unexpectedly:** monitored via Supabase dashboard; alerting deferred to Phase 3.
- **Worker captures duplicate URL for same Project:** PLOS DB enforces unique `(projectId, platform, url)` constraint; extension shows "URL already in this Project — view existing record" instead of saving a duplicate.
- **Custom field added by worker A, then worker B doesn't see it:** custom fields are per-Project; bidirectional sync (Q7.a / Q12) ensures all workers on the same Project see the same custom field set within the polling/realtime cadence.

---

### A.14 Components library fit (Q14) — director deferred to Claude's recommendation; approved as drafted (reframed 2026-05-05 from "Scaffold fit" to "Components library fit" per the components-library architectural pivot landed on `main` 2026-05-04 in `session_2026-05-04_workflow-tool-scaffold-design` — see `docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md` for the full library spec)

**Recommendation:** **PLOS-side W#2 view IMPORTS specific components from the Shared Workflow Components Library and authors its own custom React content component for the multi-table viewer. The Chrome extension is WHOLLY outside the library** (different deployment model — Chrome Manifest V3 codebase per `COMPETITION_SCRAPING_STACK_DECISIONS.md §1`, not a PLOS Next.js page).

#### PLOS-side W#2 view (`/projects/[projectId]/competition-scraping`)

The page composes its layout by importing the library components below + the workflow's own custom multi-table viewer for the content area. Per `PLATFORM_REQUIREMENTS.md §12` (REWRITTEN 2026-05-04 — components-library architecture replaces the earlier scaffold-shell concept), there is no required shell; the workflow page authors its own composition.

| Library component | W#2 use | Notes |
|---|---|---|
| `useWorkflowContext()` hook | ✅ imports | Auth + Project + role + workflow-status load (per `WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md §3.1`); replaces ~40 lines of boilerplate |
| `<WorkflowTopbar>` | ✅ imports | Workflow title "Competition Scraping & Deep Analysis" + back-to-Project breadcrumb + admin-only reset button (admin reset = the PLOS-side data-wipe per Q11) |
| `<StatusBadge>` | ✅ imports | Standard 3-state Phase 1 (inactive / active / completed); 5-state including review states wired but dormant in Phase 1 (W#2 has no review cycle — `reviewCycle: 'skip'` declared at workflow level) |
| `<DeliverablesArea>` (Resources sub-section) | ✅ imports | Always-visible deliverables — Detailed User Guide + Download Extension button (per Q13). Implements `PLATFORM_REQUIREMENTS.md §12.6` shared component pattern #1 |
| `<CompanionDownload>` | ✅ imports | Chrome extension download — rendered inside the Resources sub-section per `WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md §3.5` Decision 4A. Implements `PLATFORM_REQUIREMENTS.md §12.6` shared component pattern #3 |
| `<ResetWorkflowButton>` + `<ResetConfirmDialog>` | ✅ imports | Admin-only reset UX with type-the-project-name confirmation; wired to W#2's own `resetWorkflowData(projectId)` function per `PLATFORM_REQUIREMENTS.md §7.3` |
| `<NotReadyBanner>` | ❌ skipped | W#2 declared "always ready" per §A.6 — no upstream-readiness rule (no W#1 dependency) |
| `<WorkerCompletionButton>` (Phase 1 path) | ✅ imports | Phase 1: button-driven completion (admin self-completes per `PLATFORM_REQUIREMENTS.md §4.4`). Per-(Project × platform) completion semantics handled INSIDE W#2's custom content component (the multi-table viewer); the library button is for the workflow-level overall completion |
| `<AdminReviewControls>` (Phase 2) | ❌ skipped | W#2 declared `reviewCycle: 'skip'` — no review cycle |
| `useEmitAuditEvent()` (Phase 2 / 3) | ✅ imports (Phase 3) | Per Q10, audit emission turns on in Phase 3 |

**Custom React content component** (W#2's own — NOT library): a multi-table viewer with platform → URL → captured-rows navigation, sort/filter, and image expand viewer. This is the workflow's own concern per `PLATFORM_REQUIREMENTS.md §12.6` shared component pattern #2 (content area is the workflow's own concern, not imposed by the library). W#2 is the FIRST workflow to author such a custom content component.

#### Chrome extension

- ❌ **Wholly outside the components library.** The library is a set of React components for PLOS Next.js workflow pages; the extension is a separate codebase (Chrome Manifest V3 + WXT framework per `COMPETITION_SCRAPING_STACK_DECISIONS.md §1` + its own build pipeline).
- The extension SHARES the PLOS API contract and the PLOS data model — but does not import any library components.
- We can borrow visual language from PLOS for consistency, but no shared component library between them in Phase 1.

#### Three shared component patterns W#2 surfaces (captured in `PLATFORM_REQUIREMENTS.md §12.6`)

W#2's design interview surfaced the three patterns the components library implements, captured in `PLATFORM_REQUIREMENTS.md §12.6` (NEW 2026-05-04; framing reframed 2026-05-05):

1. **Always-visible deliverables.** A workflow may have downloadable artifacts (extension files, templates, README PDFs) present regardless of Project state. Implemented by `<DeliverablesArea>`'s optional Resources sub-section.
2. **Custom React content components.** A workflow's content area is the workflow's own custom React component — NOT something the library imposes or provides. W#2 exercises this first (multi-table viewer).
3. **External-client companion pattern.** A workflow may ship a downloadable companion artifact (browser extension, mobile app, desktop tool) that talks to PLOS via API. Implemented by `<CompanionDownload>`. W#2 is the first.

#### Sequencing

Per `PLATFORM_REQUIREMENTS.md §12.4` (REWRITTEN 2026-05-04), library components are built incrementally as workflows surface concrete needs. The Phase-1 components needed to unblock W#2's PLOS-side build (`useWorkflowContext()`, `<WorkflowTopbar>`, `<StatusBadge>`, `<DeliverablesArea>` with Resources sub-section, `<CompanionDownload>`, `<ResetWorkflowButton>` + `<ResetConfirmDialog>`, `<NotReadyBanner>`, `<WorkerCompletionButton>` Phase 1 path) ship first. Phase 2 components (`<AdminReviewControls>`, `useEmitAuditEvent()`) are built when Phase 2 turn-on is scheduled.

**Recommended session sequence after this interview:**

1. **W#2 Stack-and-Architecture session** — extension framework (Manifest V3 + vanilla JS / React-in-extension / Plasmo / WXT — choose); auth pattern (long-lived API tokens vs OAuth device flow); image storage flow (signed-URL upload helper); region-screenshot mechanism (`chrome.tabs.captureVisibleTab` + canvas crop vs html2canvas); URL-add gesture (Shift+Click recommended); Highlight Terms color palette (~20 distinct accessibility-contrast colors); polling vs realtime upgrade timing. Output: `COMPETITION_SCRAPING_STACK_DECISIONS.md` Group B doc + updates to this doc's §B. ✅ DONE 2026-05-04 (`session_2026-05-04_w2-stack-and-architecture`).

2. **Shared Workflow Components Library Phase-1 build** — ships the components named above (per `WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md §A`). Cross-workflow concern; not W#2-only — every workflow #3-#14 imports library components freely.

3. **W#2 PLOS-side build** — composes library components + W#2's custom multi-table viewer content component. Multiple sessions: schema migration, API routes, custom React content component, sort/filter UI, image expand viewer, admin reset.

4. **W#2 Chrome extension build** — can run in parallel with the PLOS-side build after stack-and-architecture is locked + Phase-1 library has shipped. Multiple sessions: extension shell, auth, Module 1 capture flow, Module 2 capture flow, image upload, offline queue.

---

### A.15 Director's free-form brief (preserved verbatim — important context for future sessions)

The director provided this brief at the start of the interview, before the structured 14-question pass. It is preserved verbatim here because it contains UX details, examples, and rationales that the structured Q&A condensed; future implementation sessions should refer back to it for the original framing.

---

> WORKFLOW #2: Competition Scraping & Deep Analysis
>
> We have been working on a tool known as the PLOS (Product Launch Operating System) that has multiple workflow tools that allows us to work on individual 'Projects' and process specific data within each tool. So far we have finished working on the 'Keyword Clustering Tool' and now want to begin working on the 'Competition Scraping & Deep Analysis' tool. Note that this tool will work on the same project(s) that were created and were worked on by the 'Keyword Clustering Tool'.
>
> Overview of the 'Competition Scraping & Deep Analysis' tool:
>
> This tool is essentially a chrome extension that allows the user to quickly and easily do the following:
>
> - Create a list of competitors of a specific product niche (which will be associated with the Project in our PLOS). This competitors list can be shopping site product listings (Amazon, Ebay, Etsy, Walmart, Google Shopping) or independent product websites. The user should be able to create categories for these competitors (for example, primary competitor, secondary competitor, etc.).
>
> - Manually scrape text data on those competitor product listing pages and websites by highlighting specific sentences and/or paragraphs and then associating them with specific data categories (for example, Product listing title, Product Listing Bullet Points, etc).
>
> - Manually save images on those competitor product listing pages and websites by right clicking on those images and then associating them with specific data categories (for example, Product listing images, Amazon A+ Content Module Image, etc).
>
> - See all this collected data in PLOS on our site (vklf.com), organized under its associated project.
>
> In other words, this tool will have multiple mini workflows that the user can use to collect specific data from shopping sites and independent product websites. The chrome extension files should be available in PLOS inside the 'Competition Scraping & Deep Analysis' card so that if the user doesn't have the files, they can download it from there and see the instructions on how to use the extension properly.
>
> Now let's go over the detailed functionality the extension should have:
>
> When the user first chooses a project and clicks the 'Competition Scraping & Deep Analysis' card in the PLOS UI, they should see a section to download the 'Competition Scraping & Deep Analysis' extension files and instructions on how to install the chrome extension. Once the user loads the chrome extension, there should be a way for the user to enter their credentials to log into the extension and connect it to the PLOS platform in vklf.com where they can choose the 'Project' they can work on. This 'Projects' list is the same projects list that were created when the admin first started working on the projects in the Keywords Sorting tool. Note that projects are only created once in the beginning when admin starts working on them in the Keyword Sorting Tool, then other tools access the same project and add data to it. Once the user is logged into the 'Competition Scraping & Deep Analysis' extension and connected to a project in PLOS, then they can choose a 'module' within the extension to start working on the workflow associated with the extension. The following are the modules that the user can choose and work on with details on the functionality of each module:
>
> **Competition Identification Module:**
>
> This module essentially allows the user to add specific shopping site listing urls and website urls to the project along with the product name and company name to be associated with the Project. Before the user can add a url to the project, they have to first select which platform they will be adding the urls from. The choices will be Amazon.com, Ebay.com, Etsy.com, Walmart.com, Google Shopping, Google Ads and Independent Websites (found via google results).
>
> The Competition Identification Module should also have a text input box with the title called 'Highlight Terms'. Here the user should be able to enter multiple terms into the text box and when the user then clicks outside the text box, the system should show the individual terms listed under the 'Highlight Terms' heading with a color swatch next to each one and an option to remove the individual highlight terms. When the user clicks on the color swatch next to the individual highlight terms, they should be shown an expanded color swatch with individual rectangles containing individual colors. If the user clicks on a specific color, they should return to the 'Highlight Terms' and the term for which the color swatch was selected should be highlighted in that color. Make sure the text font changes to a color so that it stands out in front of the highlighted background (for example, if the highlight color is white, the font color should be black but if the highlight color is black, then the font color should be white. Note that the user only needs to be give about 20 color choices that are distinct from each other.
>
> Once the user enters the 'Highlight Terms' and selects a specific highlight color to go with each term, then they can choose from the platform choices provided above (Amazon.com, Ebay.com, Etsy.com, Walmart.com, Google Shopping, Google Ads and Independent Websites) and then the user can go to that specific website and start adding urls in the way described below. You may be wondering why the user needs to select the platform name before adding urls and that because it is critical for admin to not only know who the competition is (through the url) but where that competition exists. While it may seem logical that simply going to Amazon, ebay, esty or Walmart should alert the tool that the user is on that platform, the problem occurs when the user is on Google Shopping, Google Ads or an Independent product website (found via Google Results), where the link to the competition is often simply the link of the company's product page and there is no way to tell what platform (Google Shopping, Google Ads or Google Results), those urls were found through. By having the user first select the platform and then initiate the url adding process, the tool will always know what the source we used to identify the competition. In the 'Competition Scraping & Deep Analysis' section in PLOS, admin will be able to see this information along with the url as well when this data is presented to them.
>
> Now note that when the user goes to any of the platforms that they have selected to start adding urls from, the user may enter some search term in that platform's search bar which will lead to the platform showing that search term's results. The tool should at this point look at the entire page and see if anywhere on the page any of the individual 'Highlight Terms' exist and if they do, the tool should highlight that term on the page in the color selected by the user in our tool. This allows for the user to quickly and easily see if any product listing links are relevant to the user's competition identification search. The extension should also show an overlay that has the total number of times the page contains the 'Highlight Terms'. Now when the user wants to add a product listing url to the selected Project under the 'Competition Identification Module' of the 'Competition Scraping & Deep Analysis', they should be able to click on the target url link using some method that you can suggest (for example, Shift + Left click or right click) and then an overlay should open that should show the project into which the url is about to be added, the platform under which the url is about to be added, the url itself that is about to be added and then there should be a few more fields that the user can populate:
>
> - Competition Category: (in which the user can either add a new category or can choose from a previously added category). Note that these categories represent the type of product or services the competition represents (for example, device, topical product, supplement, etc). Then in the PLOS under 'Competition Scraping & Deep Analysis', admin can sort the view of all competition by categories.
> - Product Name: This is simply the product name. Again, the user can either add a new product name or can choose from a previously added product name.
> - Brand Name: This is simply the brand name (which can often be different from the Product Name). Again, the user can either add a new brand name or can choose from a previously added brand name.
> - Size/Option: This represents the product size/Options. Note that this should be a sub-category below the product name. In other words, the user should be able to add multiple 'Sizes/Options' under a single product name.
> - Price: This represents the product price. Note that this should be a sub-category below the product name and associated with a specific product Size/Option. In other words, the user should be able to add a specific price for each Size/Option under a single product name.
> - Shipping Cost: This represents the product shipping cost. Note that this should be a sub-category below the product name and associated with a specific product Size/Option. In other words, the user should be able to add a specific shipping cost for each Size/Option under a single product name.
> - Results Page Rank: This is the results page position of that url, also added by the user.
> - Product Star Rating: This is simply a number that shows how many stars the product has out of 5. Applies to Amazon, Ebay and Walmart.
> - Seller Star Rating: This is simply a number that shows how many stars the seller has out of 5. Applies to Etsy.
> - Number of Product Reviews: This is simply a number that shows how many reviews customers have left for the product.
> - Number of Seller Reviews: This is simply a number that shows how many reviews customers have left for the seller.
> - The user should also be able to add new fields that are either product associated (which should say "Add New Product Associated Category"), for example, 'Country of Manufacturing' or associated with a specific product Size/Option (which should say "Add New Product Size/Option Associated Category"), for example 'Customizations for extra large bottles'.
>
> Note that the seller does not need to enter any information aside from submitting the url (which should be editable by the user). The other fields should be updateable later.
>
> All the data captured by the user should be updated in real-time in the 'Competition Scraping & Deep Analysis' section in PLOS under 'Analyze Competition'. The user should also be able to click on the extension to see all the data they have captured so far if they want to populate the fields associated with each competition url. Note that the user should be able to reset the entire extension to get rid of all data in it to reuse it for another Project or delete any urls and its associated data individually.
>
> Note that the user should be able to add competition urls through the easy mechanism we will come up with as mentioned above or the user should be able to manually add a url into the competition table (for example, independent websites).
>
> **Competition Data Scraping Module:**
>
> In this module the user should be able to do two things:
>
> - Store selected text into categories under a specific url under a specific Project.
> - Store selected images into categories under a specific url under a specific Project.
>
> Let's go into the details of this module. Say, at one point, the user has added all the competition urls. Now the user should be able to go to one of those urls and the tool should confirm in a quickly apparent way that the extension knows this url is recognized as already in the system. Then the user should be able to begin the process of scraping text data and image data in a way that will not go against any Amazon.com, Ebay.com, Etsy.com, Walmart.com and Google policies. Below we will go over how exactly the user should be able to scrape both text and image data from the competition urls in a fast way and more manual way (while both methods will be manual)...
>
> When adding text data to a project, the main way the user should be able to do that is by highlighting entire string of text they want to add to the project and then through an easy and fast mechanism that you can suggest, they should be able to click 'Add text' to add that text to the project. However, note that when the user is adding text under a url which in turn is associated with a specific platform and is associated with a specific Project, the user also has to specify what content category that data belongs under. These categories can be created by the user at any time (even while adding text or images) and the user can even select pre-made categories under that project. For example, a category might be 'Amazon Title' which will reference that the text is the Amazon listing's title or it may be 'Amazon Bullet Point' in which case it is a bullet point at the top of the Amazon listing. The other way the user can add data is by simply pasting it into the extension under the url. Again, the user will have to choose which url that want to add the data to and what category they want to add the data to. This will come in handy when admin wants to look at not just competition for a specific Project in PLOS but when they want to look at just one aspect of the competitions such as Titles, Bullets, Reviews, etc. There should also be 2 additional fields associated with each image: 'Composition' (which describes the composition of the image) and 'Text' (which contains specific text that is embedded in the image), both these things can be manually populated by the user or an AI tool will be added later to be able to have an AI module do populate both these things.
>
> The other type of data the user should be able to store under a url are images. Just like text data, the user should be able to save the images under categories. Note that the extension and out tool in PLOS should know if the data collected is text or an image. Images can be of two different kinds. They can be normal images such as product shots or they can be A+ content modules that are a combination of image and superimposed text. If the image that is being stored is a regular image, the our extension should rely on a simple mechanism that you can come up with to save that image under a new or existing image category under the url. These images should be viewable as thumbnails in the PLOS (Competition Scraping & Deep Analysis) and expandable when clicked on. However, if the image that is being stored is like a A+ content module that has both images and a text overlay, the user should be able to employ a methodology which you can suggest where if a specific button is clicked, the mouse turns into highlighting tool where the user can click and highlight the entire image including the image and text overlay elements and screenshot it so that the screenshot can be saved as a single image (essentially embedding the text into the image which would not happen if only the image was saved in the normal way). Once again, each such stored image should have the 'Composition' and 'Text' fields associated with them and be treated like the way we treat any collected data (stored under a url under a specific category).
>
> Now all this data should be presented in both the extension and PLOS (Competition Scraping & Deep Analysis) as a table that can be explored by clicking on individual platform names or urls. Note that there should also be a tags column next to each piece of data added under a specific url and the user should be able to add text tags to those specific pieces of text or images.
>
> Note that the user should be able to edit/delete any text in the table. The user should also be able to move rows within the table.
> The user should also be able to add new rows of data to the table under any url (this data would have to be associated with the same things that any data collected from the urls is).
>
> While only admin will be using the extension initially, note that later only multiple people should be able to download the extension and simultaneously work on the Projects they are assigned to. These users will be assigned not only to specific Projects but specific platforms (Amazon, Ebay, Etsy, Walmart, Google) so that they can only add urls from those platforms (Google Shopping, Google Ads and Google Organic Results assigned people can add any url from any independent website however only within the specific Google platform they are assigned to).
>
> Please think about the best way to program this extension and best stack to use so that scaling up as mentioned won't be an issue long term. Please make sure you study our existing PLOS platform so that the new 'Competition Scraping & Deep Analysis' section and tool development fits seamlessly into the platform. Ask as many questions as needed to ensure you have a good grasp on what needs to be done in a sturdy and reliable manner. Since this will take many sessions, make sure you employ a methodology that creates handoffs within the codespace that you have access to and creates the initial prompt such that each new session knows exactly where we are in the roadmap and where the tool fits within the context of the overall platform so that the tool does not clash with any other functionality.
>
> MAKE SURE IF YOU USE A COMMON ROADMAP OR HANDOFF DOCUMENTS THAT MAY BE USED BY OTHER WORKFLOWS, YOU SHOULD NEVER CHANGE THE PARTS OF THOSE DOCUMENTS THAT APPLY TO OTHER WORKFLOWS BECAUSE WE MAY WORK ON THEM AT DIFFERENT PACES THAN THIS WORKFLOW.

---

### A.16 Platform-Truths Audit (Rule 19) cross-reference

The following platform-level facts surfaced during this interview and were ratified into `PLATFORM_REQUIREMENTS.md` in this same session per Rule 19. All additive; no existing requirements removed or weakened.

| # | PLATFORM_REQUIREMENTS.md location | What was added |
|---|---|---|
| (a) | §1.4 (appended) | Per-workflow throughput-bottleneck recognition. W#2 = 70/wk vs platform target 500/wk = ~7× shortfall. Director-acknowledged tradeoff. |
| (b) | §2.2.1 (NEW) | Workflow-internal sub-scopes. W#2 sub-scope = `platform`; per-(user × workflow × project × platform) assignment; one worker per (project, platform). |
| (c) | §6 example (corrected) + §6.6 (NEW) | W#2 confirmed "always ready" (earlier speculation rejected). NEW §6.6 captures cross-workflow data permissions as per-(producing-workflow, data-item, consuming-workflow) granular. |
| (d) | §8.4 (NEW) | Project-scoped shared vocabularies. Vocabulary tables scoped to (Project × vocabulary-type), not to producing workflow; any workflow on the same Project can READ + ADD entries. |
| (e) | §10.1 (appended) | Non-web-app clients pattern. Chrome extension is the first non-web-app client of PLOS. Auth, API surface, distribution implications. |
| (f) | §10.2 (appended) | Image-storage scale projections. ~500 GB/yr Phase 3, ~1 TB/yr Phase 4. Dedicated bucket per workflow + private + signed URLs. |
| (g) | §12.6 (NEW) | Three shared component patterns surfaced by W#2: always-visible deliverables (`<DeliverablesArea>` Resources sub-section), custom React content components (workflow's own concern, not imposed by library), external-client companion pattern (`<CompanionDownload>`). Note: §12.6 was originally framed as "scaffold extension-points" at the time of the 2026-05-04 W#2 interview; reframed 2026-05-05 W#2 doc-reframe to "shared component patterns" per the components-library architectural pivot landed on `main` 2026-05-04. |

---

### A.17 Open implementation questions deferred to W#2 Stack-and-Architecture session

These are NOT design-doc questions; they're implementation-detail decisions that need their own session BEFORE any code is written. Captured here so the next session has a checklist.

1. **Extension framework choice.** Manifest V3 + vanilla JS (lowest dependency, most portable) vs React-in-extension (familiar to PLOS web team) vs Plasmo (modern, batteries-included) vs WXT (similar to Plasmo). Trade-offs: bundle size, dev ergonomics, hot-reload during development.
2. **Auth pattern.** Long-lived API tokens issued from a PLOS settings page (simple, similar to GitHub PAT) vs OAuth 2.0 device flow (more standard, enables revocation). Decide once; pattern applies to all future non-web clients per `PLATFORM_REQUIREMENTS.md §10.1`.
3. **Image storage flow.** Bucket name (`competition-scraping`); upload helper (signed-URL flow vs server-relay); per-Project folder structure; janitor job for orphaned images.
4. **Region-screenshot mechanism.** `chrome.tabs.captureVisibleTab` API + client-side canvas crop (simplest, works on any page) vs html2canvas (works on hidden DOM but slower) vs DOM-to-image. Test on Amazon A+ content modules specifically.
5. **URL-add gesture.** Recommended: Shift+Click. Fallback for trackpad-only users: right-click context menu item. Reasoning: Shift+Click is the universal "open in new tab without actually opening" gesture from browser tradition; users find it intuitive.
6. **Highlight Terms color palette.** ~20 distinct colors, accessibility-contrast-checked. Each color paired with its auto-flipped text color (white-on-dark, black-on-light). Recommend WCAG AAA contrast for the foreground/background pair.
7. **Add-text gesture.** Recommended: keyboard shortcut (Ctrl+Shift+A or similar) AFTER text is highlighted. Fallback: right-click context menu item. Test for collision with browser/site shortcuts.
8. **Real-time sync polling cadence (Phase 1).** 5-10 sec polling for "new captures from PLOS" (low frequency because workers don't share platforms within a Project, so cross-worker updates are rare). Upgrade to Supabase Realtime push when platform-wide realtime infrastructure ships in Phase 2.
9. **Schema design.** Tables: `competitor_url`, `captured_text`, `captured_image`, `vocabulary` (shared with platform), `worker_assignment` (Phase 2), `audit_event` (Phase 3). Indexes: per-(projectId, platform) primary access pattern; per-(projectId, vocabulary_type) for vocab lookups. Schema-change-in-flight flag must be set in Active Tools table during this session (see `MULTI_WORKFLOW_PROTOCOL.md` Rule 4 schema-change handshake).
10. **PLOS-side route structure.** `/projects/[projectId]/competition-scraping/page.tsx` = main view; sub-routes for individual URL detail (image expand viewer); admin assignment UI route (Phase 2).
11. **API route structure.** REST conventions matching W#1's pattern: `POST /api/projects/[projectId]/competition-scraping/urls`, `POST .../text`, `POST .../images` (two-phase upload), etc. CORS-friendly + idempotent + token-auth-aware per §10.1 implications.
12. **Build pipeline for the extension.** Separate package in repo (e.g., `extensions/competition-scraping/`) with its own `package.json`, build (Vite or webpack), packaging (.zip for Chrome Web Store + unpacked dir for development sideloading). CI hooks to package on every release.
13. **Distribution.** Phase 1: unpacked dev folder + zip on PLOS deliverables area. Phase 2+: Chrome Web Store listing (organization-private if possible).

---

### A.18 Recommended sequencing (next sessions)

Per Q14 sequencing analysis:

1. **Next session — W#2 Stack-and-Architecture session.** Resolves §A.17 questions 1-13. Output: `COMPETITION_SCRAPING_STACK_DECISIONS.md` (Group B doc). No code yet; design + decisions only.
2. **After that — Shared Workflow Components Library Phase-1 build.** Cross-workflow concern; not W#2-specific. Incorporates `PLATFORM_REQUIREMENTS.md §12.6` shared component patterns surfaced by W#2 (always-visible deliverables, custom React content components, external-client companion). Multiple sessions. ✅ DONE 2026-05-05-c on `main` (commit `34e88ea`); reached this branch via 2026-05-06 merge.
3. **After Phase-1 library ships — W#2 PLOS-side build.** Multi-session: schema migration → routes → custom React content component (composed alongside imported library components per `PLATFORM_REQUIREMENTS.md §12.6` shared component pattern #2 — content area is the workflow's own concern) → admin reset (uses library's `<ResetWorkflowButton>` + `<ResetConfirmDialog>`) → image expand viewer → (Phase 2) admin assignment UI.
4. **Parallel with PLOS-side build — W#2 Chrome extension build.** Multi-session: shell → auth → Module 1 capture flow → Module 2 capture flow → image upload → offline queue → distribution polish.

---

## §B — In-flight refinements (APPEND-ONLY)

This section is for entries added in subsequent sessions when the director adds scope, refines decisions, or surfaces new requirements between this initial design doc and Tool Graduation. Each entry: date, session ID, what the director said, what alternatives were considered, what was decided. Append-only — never edit prior entries.

### Format for each entry

```
**[DATE] — [session ID]**
- **Director's directive:** [verbatim or close paraphrase]
- **Alternatives considered:** [brief list]
- **Decision:** [what was decided]
- **Affected sections:** [which §A sub-sections this refines, or "new — no prior §A coverage"]
- **Cross-references:** [other docs touched, if any]
```

### Entries

**2026-05-04 — session_2026-05-04_w2-stack-and-architecture (Claude Code, second W#2 session)**

- **Session purpose:** resolve the 13 deferred implementation questions captured in §A.17 ("Open implementation questions deferred to W#2 Stack-and-Architecture session"). Output a new Group B doc capturing the FROZEN stack decisions; this §B entry serves as the event log + pointer.

- **Director's directives:**
  - Approve all 13 stack decisions in 4 clusters of 3-4 questions, with cluster-level read-back per `HANDOFF_PROTOCOL.md` Rule 18.
  - **Schema-change-in-flight handshake (Cluster 0):** approved Option A — flip the W#2 schema-change-in-flight flag in `ROADMAP.md` "Current Active Tools" table to "Yes" at start of this session, covering both this design session AND the next implementation session that lands `prisma/schema.prisma` edits. Flag stays "Yes" until that implementation session completes + pushes. Flipping was done immediately at session start (Rule 19 exception — the flag's purpose is real-time coordination visibility for any parallel chat that might open mid-session).
  - **Q5 URL-add gesture override:** director chose Option D (floating "+ Add" button on link hover) over Claude's recommendation of Option A (right-click context-menu + Alt+Click). Reasoning: most discoverable for non-technical Phase 3 workers. Implementation guardrails accepted: 300ms hover delay, scoped to product-detail-page patterns per platform, per-session dismiss button, right-click context-menu as redundant secondary path.
  - **Q7 add-text gesture override:** director chose Option C (click "Add Text" button in extension popover) over Claude's recommendation of Option A (right-click + Ctrl/Cmd+Shift+S). Same reasoning — most discoverable for non-technical workers.
  - **Q13 distribution add-on:** director added explicit requirement that PLOS contains DETAILED instructions on how to **install AND USE** the extension. Captured in §13 of the new STACK_DECISIONS doc as a Detailed User Guide block always visible at `/projects/[projectId]/competition-scraping`, with full workflow walkthrough + screenshots + printable PDF version.
  - **Q8 sync cadence add-on:** director added explicit requirement that the system plan for contingencies and have redundancies so that any data missed being synced is quickly caught and fixed. Captured in §8.3 of the new STACK_DECISIONS doc as a comprehensive sync-failure safety net: write-ahead log, failed-write queue, tab-close guard, always-visible sync indicator, idempotency-key echo, periodic reconciliation, worker-completion verification using server counts (Phase 2), daily janitor count-consistency check, worker-visible failure mode with diagnostic export.

- **Alternatives considered:** comprehensive — every question presented Claude's per-option pros/cons in plain language with explicit recommendation marker per Rule 14f. Notable alternative-vs-decision deltas:
  - Q1 framework: WXT chosen over Plasmo (similar batteries-included, but WXT is TypeScript-first + thinner abstraction over Manifest V3).
  - Q2 auth: direct `signInWithPassword` chosen over the §A.17-listed long-lived-API-token + OAuth-device-flow options. **§A.17 framing missed this option** — captured as a `CORRECTIONS_LOG` entry at end-of-session.
  - Q3 image upload: signed-URL direct upload chosen over server-relay (bypasses Vercel function size + timeout cliffs).
  - Q4 region-screenshot: `chrome.tabs.captureVisibleTab` + canvas crop chosen over html2canvas (pixel-perfect; no DOM-walking quirks; no third-party library).
  - Q9 schema: 7 W#2-scoped tables + 2 cross-workflow tables (WorkerAssignment for Phase 2, AuditEvent for Phase 3); custom fields = JSON-on-parent for Phase 1, normalize at Phase 3 if needed (deferred ROADMAP polish item).
  - Q12 build: monorepo at `extensions/competition-scraping/` chosen over separate-repo (lockstep API contract changes; shared types as a folder, not a published package).

- **Decision:** all 13 §A.17 questions resolved. The new Group B doc `COMPETITION_SCRAPING_STACK_DECISIONS.md` is the FROZEN spec. §A.17 is now considered RESOLVED — future build sessions read the new doc, not §A.17.

- **Affected sections:** §A.17 (resolved by reference; remains in §A as the historical record of the questions). §B entries: this is the first §B entry. No edits to §A1–§A18; §A remains frozen per Rule 18.

- **Cross-references:**
  - **NEW:** `docs/COMPETITION_SCRAPING_STACK_DECISIONS.md` — full FROZEN spec for §1-§13 plus §14 cross-doc updates list + §15 build-session deferred items.
  - `docs/ROADMAP.md` — "Current Active Tools" W#2 row updated; schema-change-in-flight = Yes; W#2 section updated.
  - `docs/PLATFORM_REQUIREMENTS.md` §10.1 — direct-credentials chosen as non-web-app-client auth pattern.
  - `docs/PLATFORM_REQUIREMENTS.md` §10.1 (potentially §10.2) — sync-reliability pattern as candidate platform-wide requirement (decision deferred to end-of-session Platform-Truths Audit per Rule 19; tracked as a `DEFERRED:` task per Rule 26).
  - `docs/CORRECTIONS_LOG.md` — entry on §A.17 Q2 framing miss.
  - `docs/DATA_CATALOG.md` §6.1 — provisional W#2 entries promoted to finalized field names per §9.
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — new Group B doc registered.

---

**2026-05-07 — session_2026-05-07_w2-api-routes-session-1 (Claude Code, on `workflow-2-competition-scraping` branch)**

- **Session purpose:** ship session-1 of the recommended 3-session split for the W#2 API routes per `COMPETITION_SCRAPING_STACK_DECISIONS.md §11.1`. The split: session-1 = read paths + `urls` POST/PATCH/DELETE + vocabulary endpoints; session-2 = text + sizes + image-upload two-phase flow + reconcile + `competition-storage.ts` helper; session-3 = admin reset endpoint + janitor cron.

- **Director's directive (carried over from prior session's ROADMAP next-session list):** begin item (a) of the W#2 ROADMAP next-session list — API routes per §11. No new directives this session.

- **Alternatives considered (Rule-15 autonomous decisions, surfaced in the drift check + recap, accepted by director by absence of pushback):**
  - **POST `.../urls` idempotency:** §11.1 doesn't specify behavior on duplicate (workflow, platform, url) creates, but §11.2 cross-cutting items emphasize extension-idempotency. Two patterns considered: (a) return 409 with the existing row in body so the caller can branch; (b) create-then-catch-P2002 returning the existing row with 200 (treats duplicate as a successful idempotent retry). Chose (b) — most-thorough-and-reliable for the extension's WAL-driven retry pattern; 200 vs 201 status code lets the caller distinguish if needed without ever surfacing a 500 on a benign duplicate. Same pattern applied to POST `/vocabulary` (where §11.1 explicitly says "upsert (no error on duplicate)").
  - **PATCH `.../urls/[urlId]` error mapping:** P2025 (record not found) surfaced as 404; P2002 (re-target collides with another existing row) surfaced as 409. Standard HTTP semantics; gives extension callers actionable distinction between "not yours / never existed" and "would create a duplicate" and "transient flake."
  - **DELETE idempotency:** P2025 (already deleted) returns `{success: true}` instead of erroring. Matches the W#1 pattern; safe under retry.
  - **CORS allowlist:** any `chrome-extension://*` origin allowed via permissive prefix match; the JWT remains the auth boundary. Locking down to a specific extension ID would require knowing the production Web Store ID at PLOS-build time, which we don't have until Phase 2 distribution per §13.2. Documented in `src/lib/cors.ts` header comment.
  - **Vocabulary route activity-stamping:** the project-scoped vocabulary route does NOT call `markWorkflowActive` — it uses `verifyProjectAuth` (not `verifyProjectWorkflowAuth`), so it lacks a clean single workflow context to stamp. The calling workflow's own routes (urls POST/PATCH/DELETE on the W#2 side) handle activity stamping.

- **Mid-implementation refactor:** initial CORS helper combined pure logic + `NextRequest`/`NextResponse` factories in one file. The node:test runner blew up at module-eval time when importing `next/server` (Node ESM resolves the package differently than the Next.js bundler — error message: *"Cannot find module 'next/server'. Did you mean to import 'next/server.js'?"*). Split into `src/lib/cors.ts` (pure; testable) + `src/lib/cors-response.ts` (Next-aware factories). 11 unit tests for the pure helpers landed cleanly. Operational lesson worth carrying forward: any `src/lib/*.ts` helper intended to be unit-testable via `node --test --experimental-strip-types` must NOT have a top-level `import` from `next/server`, `next/navigation`, or other Next-only packages.

- **Decision:** session-1 of the API routes shipped per §11. The 6 endpoints below are FROZEN at the request/response shapes captured in `src/lib/shared-types/competition-scraping.ts` — both the Chrome extension API client (future session) and any other PLOS caller import these types so changes to the wire format become compile-time errors at every call site.

  - `GET    /api/projects/[projectId]/competition-scraping/urls?platform=...`
  - `POST   /api/projects/[projectId]/competition-scraping/urls`
  - `PATCH  /api/projects/[projectId]/competition-scraping/urls/[urlId]`
  - `DELETE /api/projects/[projectId]/competition-scraping/urls/[urlId]`
  - `GET    /api/projects/[projectId]/vocabulary?type=...`
  - `POST   /api/projects/[projectId]/vocabulary`

- **Affected sections:** §A.18 ("Recommended next-session sequence — RESHAPED 2026-05-05"); session-1 of step 3 in that sequence is now ✅ DONE. §B carries the operational record of the build session itself.

- **Cross-references:**
  - `docs/COMPETITION_SCRAPING_STACK_DECISIONS.md` §11 — authoritative spec for all 17 §11 endpoints; the 6 endpoints above are the session-1 slice.
  - `docs/PLATFORM_ARCHITECTURE.md` §3 — routes table updated with the 3 new W#2 API routes + activity-tracking side-effect note extended to cover W#2.
  - `docs/NAVIGATION_MAP.md` — header note (no UI route changes this session).
  - `docs/ROADMAP.md` — Active Tools row + Workflow #2 section updated.
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamp + per-doc flags.

---

**2026-05-06 — session_2026-05-06_w2-plos-side-viewer-first-slice (Claude Code, on `workflow-2-competition-scraping` branch)**

- **Session purpose:** ship the FIRST SLICE of the W#2 custom React multi-table viewer for the PLOS-side content area per `COMPETITION_SCRAPING_DESIGN.md §A.7 + §A.14` and `PLATFORM_REQUIREMENTS.md §12.6` shared component pattern #2 (the content area is the workflow's own concern, not imposed by the library). W#2 is the FIRST workflow to author such a custom content component.

- **Director's directive (mid-build Read-It-Back per Rule 18):** at session start, director said *"begin item (a) from the W#2 Active Tools Next Session list — multi-session — start by surfacing options for the first slice (likely platforms-→-URLs nav + URL list with sort/filter, building against session-1's GET .../urls)."* Claude surfaced 3 slice-shape options + escape-hatch via `AskUserQuestion`; director picked **Sidebar + URL table (recommended)**. Claude then read back a tight first-slice scope (sidebar with All Platforms + 7 platform rows + counts; URL table with 7 columns, click-to-toggle sort, free-text search across URL+Product+Brand, click-row-to-open-in-new-tab; explicit deferrals enumerated; verification plan stated). Director responded *"Yes, this scope matches what I want. Please proceed..."* — both the slice-shape pick and the scope-recap were approved before code.

- **Alternatives considered:**
  - **Slice shape (3 options surfaced via forced picker):** (A) Sidebar + URL table — chosen as recommended, most aligned with director's free-form brief in §A.15 ("browseable by clicking on individual platform names or urls"); (B) Top tabs + URL table — more compact for 7 platforms, less scalable to additional nav dimensions; (C) Single grouped table — best for one-glance scanning, weakest for focused work on one platform with many URLs. Director picked (A).
  - **Sort + filter mechanics (autonomous Rule-15 within the approved slice scope):** sort-by-clicking-column-headers chosen over a separate sort dropdown (column-header sort is the well-established table convention; less screen real estate; familiar to non-technical users). Free-text search-across-URL+Product+Brand chosen as the single search dimension for first slice; per-column filter dropdowns deferred to slice (a.4).
  - **Click-row behavior (autonomous Rule-15 within the approved slice scope):** `window.open(url, '_blank', 'noopener,noreferrer')` — opens the competitor's URL in a new browser tab. Considered: (i) row click navigates to the deferred `/url/[urlId]` detail page (rejected — page doesn't exist in this slice); (ii) only the URL cell is clickable, not the whole row (rejected — director's bullet during read-it-back said "click on a URL row → opens that competitor's URL in a new browser tab," so the whole row is the click target). Keyboard accessibility added via `tabIndex={0}` + Enter/Space onKeyDown handler + `role="link"` so the row behaves like a link for assistive tech.
  - **Data-fetch shape (autonomous Rule-15):** single fetch of `GET /urls` (no `?platform=` filter) so per-platform counts can be computed client-side and platform switching is instant. At Phase 3 throughput (~30 URLs/platform/Project) the full list stays small; client-side sort + filter stays snappy without pagination. Server-side pagination + count endpoints would be a larger change with no Phase 1 user benefit; revisit if a future scale pass shows otherwise.
  - **URL bar sync (autonomous Rule-15):** selected platform persists in `?platform=…` query string via `router.replace` so a refresh preserves the view. Considered also storing in localStorage; rejected because URL-based state is shareable (deep-link to a specific platform's view) and survives a Codespaces / browser session boundary that localStorage doesn't.

- **Decision:** first slice of the multi-table viewer is shipped — platforms → URLs nav (sidebar, 8 entries: All + 7 platforms with counts) + URL list (sortable, free-text searchable, click-row-to-open-in-new-tab). Visual-verified live on the dev server against a real Project (sidebar counts all 0 — empty state confirmed; `?platform=…` URL sync confirmed across a refresh; topbar/status/deliverables/reset chrome unchanged).

- **Director feedback captured during visual verification (3 deferred items, all destination-named per Rule 14e + TaskCreate per Rule 26):**
  1. **`/plos` dashboard top nav has no `Projects` link** — captured as new Phase-1 polish item in `ROADMAP.md` (§ between the bulk-action button polish item and the sister-link architectural item).
  2. **`/projects` list should have copy-to-clipboard affordance for Project ID + Project page URL** — captured as new Phase-1 polish item in `ROADMAP.md` (alongside the prior).
  3. **W#2 card on `/plos` dashboard + Project detail page is currently `active: false, route: null`** — kept disabled today; release-gate decision deferred to a future session, captured in this very §B entry (below) so future sessions see it surfaced.

- **W#2 card-flip deferral (DEFERRED: release-gate decision; tracked here in §B per Rule 14e):** `src/app/projects/[projectId]/page.tsx:15` has W#2 as `active: false, route: null`; `src/app/plos/page.tsx:95` has `badge: "soon", route: null`. Both are deliberate prior-session decisions to keep W#2 hidden in card grids until the workflow has enough working surface that a card-click lands somewhere useful. Today's first slice is one piece of that surface; the release-gate criterion suggested (revisit when satisfied): the `/url/[urlId]` detail page (a.1) AND the image expand viewer (a.2) AND the Chrome extension's Module 1 URL-capture flow (c) are all live, so a user clicking the card on a real Project sees a non-empty viewer (because URLs have been captured by the extension) AND can drill into them (because the detail page exists). This `(a.1)+(a.2)+(c) → flip` framing is recorded in `ROADMAP.md`'s W#2 Active Tools row Next Session item (e); future sessions revisit when those prerequisites land.

- **Affected sections:** §A.14 Q14 sequencing list (item 3 — "W#2 PLOS-side build" — first slice now started); no edits to §A1–§A18; §A remains frozen per Rule 18.

- **Cross-references:**
  - `docs/ROADMAP.md` — Active Tools W#2 row updated (Status + Last Session + Next Session); 2 new Phase-1 polish items added per director feedback above.
  - `docs/COMPETITION_SCRAPING_STACK_DECISIONS.md` §10 — PLOS-side route table; the main view at `/projects/[projectId]/competition-scraping` is the target route for today's slice; URL detail page at `/url/[urlId]` (also in §10) is deferred to slice (a.1).
  - `docs/PLATFORM_REQUIREMENTS.md` §12.6 — shared component pattern #2 (custom React content components) — W#2 is the first workflow to exercise this pattern; today's slice is the first proof point.
  - `docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md` — confirms the library does NOT include a content-area component; today's slice authors W#2's own.
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc flags.

---

**2026-05-07 — session_2026-05-07_w2-plos-side-viewer-detail-page-slice (Claude Code, on `workflow-2-competition-scraping` branch)**

- **Session purpose:** ship slice (a.1) of the W#2 PLOS-side viewer — the per-URL detail page at `/projects/[projectId]/competition-scraping/url/[urlId]` (address fixed by `COMPETITION_SCRAPING_STACK_DECISIONS.md §10` as deep-linkable). Continues the multi-table viewer's natural drill-down from URL row → URL detail.

- **Director's directive (mid-build Read-It-Back per Rule 18):** at session start, director said *"begin item (a.1) — Multi-session — start by surfacing options for this slice's scope (likely: detail page chrome + captured-text rows table; image rendering and image-expand modal deferred to a.2)."* Claude surfaced 4 scope options + escape-hatch via `AskUserQuestion` per Rule 14f; director picked **Option B "A + sizes + image count" (recommended)**.

- **Alternatives considered (4 options surfaced via forced picker):**
  - (A) Page chrome + captured-text rows only — minimal; ~1 session; doesn't surface sizes data that may already exist from extension capture; doesn't show image presence.
  - (B) **A + read-only sizes sub-section + image-count placeholder + clean read-path foundation** — chosen as recommended; ships the full set of read paths (URL + text + sizes + images) in one structured pass with consistent auth/retry/CORS so future slices (a.2 viewer, a.3 inline editing, a.4 filters) build on the foundation rather than each adding a one-off path; lower risk of inconsistency drift across the foundation; longer than A but still ~1 session. Director's standing preference for most-thorough-and-reliable applied.
  - (C) B + start of inline editing of 1-2 URL fields — folded slice (a.3) work into (a.1); rejected for blurring slice boundaries.
  - (D) Escape-hatch — not selected.

- **Mid-session pivot (verification-data deferral, NEW DEFERRED ITEM tracked in §B):** when Claude surfaced the visual-verification checklist for the slice, director's question — *"How would I see any url table without any way to add data in that entire UI"* — exposed a real gap: no PLOS-side manual-URL-add affordance has been built (extension is the canonical data-entry path, and it hasn't been built either). Claude surfaced 4 options for unblocking verification (manual-add UI / seed script / Prisma Studio / DevTools curl + escape-hatch); director chose Option D-class "Other — defer all visual tests until extension captures data; keep a running tally and walk through each set later." NEW Group B doc `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` created today as the running tally — append-only per-slice; today populates slice (a.1)'s 12-step visual checklist + seed-data prerequisites; future PLOS slices append their own. This deferral is captured in `ROADMAP.md` Active Tools W#2 row Next Session item (f) "Walk through VERIFICATION_BACKLOG slice (a.1) checklist."

- **ROADMAP-wording-vs-actual-shipped drift correction (CORRECTIONS_LOG informational entry):** the W#2 Active Tools row's prior Next Session item (a.1) said *"Builds against session-2's `GET .../urls/[urlId]/text` + `GET .../urls/[urlId]/images` (or whichever read paths apply)"* — but on reading the actual session-2 + session-3 commits Claude found NO GET handlers had shipped on those paths (only POST/PATCH/DELETE). Slice (a.1) added the four GET handlers in-flight today — additive, mechanical, no scope expansion beyond what the slice already needed; surfaced upfront in the start-of-session drift check. Captured as INFORMATIONAL entry in `CORRECTIONS_LOG.md` with the operational lesson for future end-of-session ROADMAP authoring (distinguish "what next slice builds against / what already exists" from "what next slice adds").

- **Decision (slice (a.1) shipped):** detail page composes `useWorkflowContext()` + `<WorkflowTopbar>` library chrome + a custom in-page `UrlDetailContent` component with: sub-breadcrumb (`Competition Scraping › [Platform] › [URL]`, first two segments are `<Link>`); URL metadata read-only grid (Platform, Product Name, Brand Name, Category, Product Stars, Seller Stars, # Product Reviews, # Seller Reviews, Results Page Rank, Added On, Last Updated) + customFields sub-grid; "Open original URL ↗" button preserving the prior new-tab affordance; read-only "Sizes / Options" sub-section (Size/Option, Price, Shipping Cost, Added On); sortable "Captured Text" table (Content Category, Text-wrapping, Tags, Added On) with `(N)` count badge; image-count placeholder. Parallel four-fetch via `Promise.all` against the four GET read paths shipped today; cancelled-flag race guard prevents stale fetches from clobbering newer state. UrlTable click-row rewired from `window.open(url, '_blank')` to `onRowOpen(urlId)` callback; parent `CompetitionScrapingViewer` `router.push`es to the detail page (Back button preserves platform + search state via the URL bar). Image rendering itself ships in slice (a.2); inline editing in (a.3); per-column filter dropdowns in (a.4).

- **Affected sections:** §A.14 Q14 sequencing list (item 3 — "W#2 PLOS-side build" — slice (a.1) now done); no edits to §A1–§A18; §A remains frozen per Rule 18.

- **Cross-references:**
  - `docs/ROADMAP.md` — Active Tools W#2 row updated (Status + Last Session + Next Session — (a.2) promoted to RECOMMENDED FIRST; new (f) verification backlog walkthrough item added).
  - `docs/PLATFORM_ARCHITECTURE.md` §3 — routes table updated with the 4 new GETs + the new page route.
  - `docs/CORRECTIONS_LOG.md` — new INFORMATIONAL entry on ROADMAP wording-vs-actual-shipped drift.
  - `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — NEW Group B doc, slice (a.1) section populated.
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc flags + new Group B doc registration.

---

**2026-05-07 — session_2026-05-07-e_w2-detailed-user-guide (Claude Code, on `workflow-2-competition-scraping` branch)**

- **Session purpose:** ship slice (b) of the W#2 next-session list — the always-visible Detailed User Guide content per `COMPETITION_SCRAPING_STACK_DECISIONS.md §13.1.1` (install) + §13.1.2 (use) + §13.1.3 (implementation). Independent of the (a.x) viewer slices and the Chrome extension build.

- **Director's directive (mid-build Read-It-Back per Rule 18):** at session start, Claude surfaced 4 Rule-14f options for the next-session pick (b/c/(d|f)/escape) — director picked **(b) Detailed User Guide — RECOMMENDED**. A second 4-option Rule-14f question scoped the build concretely (full install + use content + JSX + Print stylesheet vs Markdown variant vs install-only-defer-use vs escape) — director picked **the full-scope JSX + print recommended option**. No mid-build pivots; no scope expansion; no overrides of recommendations.

- **Alternatives considered (concrete-scope question, 4 options):**
  - (A) **Full install + use content authored as JSX, screenshot placeholders, print stylesheet + window.print() button, default-expanded collapsible block, placement between Status row and DeliverablesArea — RECOMMENDED.** Chosen. Highest confidence of shipping a complete deliverable in one session with zero new dependencies.
  - (B) Same content + placement, but render via react-markdown so future content edits are .md files. Closer to §13.1.3 literal wording but adds a dependency + bundling validation; rejected as less thorough for a single-session pick.
  - (C) Install-only — defer §13.1.2 use walkthrough. Smaller scope; rejected as partial.
  - (D) Escape-hatch — not selected.

- **PDF strategy decision (closes `STACK_DECISIONS §15 Q8`):** Phase 1 ships browser-native print-to-PDF — a `@media print` stylesheet on the guide block hides everything else and resets to black-on-white; a "Print this guide" button calls `window.print()`; user picks "Save as PDF" in the browser's native Print dialog. Zero new dependencies. If Phase 2+ wants programmatic PDF generation (e.g., for scheduled exports or worker email distribution), a real PDF library can be added then; the print-stylesheet path remains as a no-cost fallback.

- **Decision (slice (b) shipped):** new W#2-specific `<DetailedUserGuide />` component at `src/app/projects/[projectId]/competition-scraping/components/DetailedUserGuide.tsx` (714 LOC including content). Renders inline between the Status row and the `<DeliverablesArea>` per §13.1.3. Default expanded; collapsible via aria-expanded + aria-controls button. Header has 📖 icon + "Detailed User Guide" h2 + "Print this guide" button (only when expanded) + "Hide guide ▾ / Show guide ▸" toggle. Body: lead paragraph + "what you'll need" checklist; Part 1 (install — 7 numbered Step components with screenshot placeholder slots + "when a new version is released" note); Part 2 (use — 10 sub-sections covering sign in / Project + platform / Highlight Terms / capture URL / add Sizes / capture text / capture image / region screenshot / browse / edit / sign out); Tips section. Plain Language passing CLAUDE_CODE_STARTER Rule 1 throughout. Screenshots are gray-bordered figcaption placeholders today; new folder `public/competition-scraping/guide-screenshots/` (with `.gitkeep`) created so future image commits drop in cleanly. `page.tsx` updated to import + render the new component; the prior "Detailed User Guide content authoring deferred to a follow-up session" comment replaced with the now-shipped reference. CompanionDownload description tweaked to point at the user guide.

- **Affected sections:** §A.14 Q14 sequencing list (item 5 area — Detailed User Guide content now shipped); no edits to §A1–§A18; §A remains frozen per Rule 18.

- **Cross-references:**
  - `docs/ROADMAP.md` — Active Tools W#2 row updated (Status cell adds slice (b) shipped; Last Session updated; Next Session list drops (b)).
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc flags.
  - `STACK_DECISIONS §15 Q8` (PDF library choice) — informally resolved by this session: Phase 1 = browser print-to-PDF; library decision deferred unless/until programmatic PDF generation becomes a Phase 2+ requirement.

---

**2026-05-07-f — session_2026-05-07-f_w2-extension-build-session-1 (Claude Code, on `workflow-2-competition-scraping` branch)**

- **Session purpose:** ship session 1 of the W#2 Chrome extension build per `STACK_DECISIONS §1, §2, §12` and ROADMAP Active Tools W#2 row item (c). First session of an estimated 5–7 sessions for the full extension build. Scope frozen at session start via two Rule 14f questions (next-step pick: extension build kickoff RECOMMENDED; session-1 scope: WXT init + auth shell + smoke-test API call RECOMMENDED). A third Rule 14f question scoped the smoke-test API target to vklf.com (RECOMMENDED).

- **Director's mid-session directive (Rule 18 mid-build Read-It-Back):** mid-session, after the code shipped + verification scoreboard came clean, director directed: *"I want to do all testing once all the coding is done. Let's add these tests to the roadmap post coding. Make sure you walk me through each test item step by step."* Interpretation: the 9-step in-chat smoke-test walkthrough Claude was about to run becomes a new section in `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md`. Format mirrors existing slice (a.x) sections: step-by-step click-by-click instructions with exact button labels + expected outcomes. Future extension-build sessions append their own sections. After all 5–7 extension sessions ship, ONE dedicated verification session walks the entire backlog (extends the existing ROADMAP item (f) pattern).

- **Alternatives considered (Rule 14f session-1 scope, 4 options):**
  - (A) **WXT init + auth shell with sign-in + sign-out + JWT storage + token-refresh + Bearer header on a smoke-test API call — RECOMMENDED.** Chosen. Lands the WXT framework + Supabase JS + chrome.storage.local adapter + popup UI + smoke-test verification all behind a green build, ~150–300 LOC of extension code so the framework reversibility window per `§1` remains open.
  - (B) WXT init + monorepo + shared-types but stubbed sign-in (no real Supabase). Faster session end but defers integration risks (CORS, refresh tokens, manifest permissions) to session 2 which would carry both auth-land and integration-discovery work.
  - (C) WXT init only — `Hello world` popup, no auth or shared types. Most conservative; rejected because going maximally narrow today doesn't unlock more reversibility tomorrow (reversibility window is bounded by total extension LOC, not today's session size).
  - (D) Escape-hatch — not selected.

- **Alternatives considered (Rule 14f smoke-test target, 3 options):**
  - (A) **Production vklf.com — RECOMMENDED.** Chosen. `host_permissions: ["https://vklf.com/*", "https://*.supabase.co/*"]`; smoke-test calls `GET https://vklf.com/api/projects`. Tests the actual production path the extension will use in real use; CORS/auth surprises caught now, not after 5 capture flows ship on top.
  - (B) Both production vklf.com + Codespaces dev URL. Slightly more setup; useful only if testing against unmerged branch code, which the W#2 branch isn't deploying anyway.
  - (C) Escape-hatch — not selected.

- **Three Rule-15 autonomous picks taken (no user-visible difference):**
  - **Package manager: npm (deviates from `STACK_DECISIONS §12.2` pnpm prescription).** Reason: rest of the repo uses npm; using pnpm just for the extension means the director would need `npm install -g pnpm` first as an extra non-obvious step, and would be running `npm` in the root and `pnpm` in `extensions/`. npm-everywhere is simpler with zero technical downside (WXT supports both). The §12.2 prescription was a tool-choice that wasn't fully justified for a single-package non-workspace setup; relaxed to npm at this session per `feedback_avoid_over_prescribing.md`-style reasoning (prescription was made before the prescription's actual cost/benefit could be measured).
  - **Shared-types import: relative path (`../../../src/lib/shared-types/competition-scraping`), not tsconfig paths alias** (closes `STACK_DECISIONS §15 Q1`). Reason: zero extra tsconfig setup; alias variant requires WXT/Vite + tsc + IDE all to agree on a paths config. Phase-1 cost is marginally uglier import lines. Reversibility: trivial — flip later in any session by adding `paths` to extension tsconfig.
  - **Smoke-test endpoint: `GET /api/projects`** (Option A's "e.g., GET /api/projects or the W#2 reconcile endpoint" — picking the first). Reason: simpler — proves Bearer + CORS + auth round-trip without needing a hardcoded projectId. Returns the project list which is meaningful signal for the director ("yes, I see my projects"). The W#2-specific reconcile endpoint gets exercised in session 3+ when capture flows land.

- **Cross-workflow infrastructure edit (surfaced + autonomous Rule 15):** added an OPTIONS preflight handler + `withCors` wrap to `src/app/api/projects/route.ts` so the extension's `Authorization: Bearer` request gets through CORS. `/api/projects` is a non-W#2 cross-workflow endpoint used by W#1's projects list. The change is purely additive (no same-origin behavior change; CORS headers only attach when the request originates from a `chrome-extension://` origin). Mechanically required for any non-web-app PLOS client to ever call `/api/projects`. Surfaced at code-write time per `MULTI_WORKFLOW_PROTOCOL §3` cross-workflow-edit discipline.

- **Decision (extension session 1 shipped):**
  - **`extensions/competition-scraping/`** scaffolded as a new top-level monorepo subfolder. WXT 0.20.25 + React 19.2 + Supabase JS 2.101 + TypeScript 5.7 + @types/chrome 0.1.42 + @wxt-dev/module-react 1.2.2.
  - `package.json` with scripts `dev` / `build` / `zip` / `compile` / `postinstall: wxt prepare`.
  - `wxt.config.ts` declares manifest with `permissions: ['storage']` + `host_permissions: ['https://vklf.com/*', 'https://*.supabase.co/*']`.
  - `tsconfig.json` extends `.wxt/tsconfig.json` (auto-generated by `wxt prepare`); strict + noUncheckedIndexedAccess + jsx: react-jsx; includes the relative shared-types path.
  - `.gitignore` — `node_modules/` + `.output/` + `.wxt/` + `*.log` + `.DS_Store`.
  - `src/lib/supabase.ts` — Supabase client with chrome.storage.local storage adapter; PKCE auth flow; auto-refresh on; persistSession on; detectSessionInUrl off. Adapter guards against `chrome` being undefined so `wxt prepare`'s type-generation pass doesn't crash when it imports the module in Node.
  - `src/lib/auth.ts` — `signIn(email, password)` / `signOut()` / `getSession()` / `getAccessToken()`.
  - `src/lib/api-client.ts` — `authedFetch` wrapper that adds `Authorization: Bearer <JWT>`; `listProjects()` smoke-test calling `https://vklf.com/api/projects`; structured `PlosApiError` class.
  - `src/entrypoints/popup/index.html` + `main.tsx` + `App.tsx` + `style.css` — sign-in screen (email + password form) → signed-in screen (signed-in-as line + Verify Connection button + Sign Out button). React 19 functional components with hooks. CSS at ~360px width.
  - `src/entrypoints/background.ts` — service worker stub; imports supabase to keep auto-refresh alive while the worker is active. Phase 1 placeholder; future sessions add WAL replay + reconciliation poller + navigator.onLine handlers.
  - `src/app/api/projects/route.ts` — added OPTIONS handler + `withCors` wrap on GET response + error response.
  - Root `tsconfig.json` — `extensions` added to `exclude` so root tsc doesn't type-check the extension code (which has its own WXT-aware tsconfig with chrome globals etc.).

- **Verification scoreboard:**
  - Extension build: clean. `.output/chrome-mv3/` produced (manifest + background.js + popup.html + assets/ + chunks/) at ~600 KB unpacked. `competition-scraping-extension-0.1.0-chrome.zip` produced at ~590 KB.
  - Extension `tsc --noEmit`: clean (zero errors).
  - Root PLOS `tsc --noEmit`: clean (extensions/ excluded).
  - Root PLOS `npm run build`: clean (49 routes — same baseline; CORS edits to `/api/projects` route did not add or change route count).
  - Tests: `node --test --experimental-strip-types $(find src -name '*.test.ts')` reports **393/393 pass** — exact baseline parity.
  - Lint: `npx eslint src` reports project-wide **13 errors / 39 warnings** — exact baseline parity (the 13 errors all live in pre-existing files outside the W#2 surface and outside `extensions/`).

- **Smoke test:** NOT performed this session per director's directive to defer all manual testing to a single dedicated post-coding verification session. The 9-step walkthrough is captured in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Extension build — session 1" section as 18 walked-through tests (Steps 1–18 covering download → unzip → install → pin → sign-in → sign-out → verify connection → token persistence → manifest sanity check → service-worker DevTools → build artifact integrity).

- **Affected sections:** §A.14 Q14 sequencing list (item 4 — "W#2 Chrome extension build" — session 1 now done; 4–6 sessions remaining); no edits to §A1–§A18; §A remains frozen per Rule 18.

- **Cross-references:**
  - `docs/ROADMAP.md` — Active Tools W#2 row updated (Status cell adds extension session 1 shipped + Last Session updated + Next Session list rotates to extension session 2).
  - `docs/PLATFORM_ARCHITECTURE.md` §1 — file-structure note added for the new `extensions/` top-level folder.
  - `docs/PLATFORM_ARCHITECTURE.md` §3 — routes table notes the OPTIONS handler addition on `/api/projects`.
  - `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — new "Extension build — session 1" section appended with 18 walked-through tests.
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc flags.
  - `STACK_DECISIONS §15 Q1` (tsconfig paths alias vs relative) — closed: relative path chosen for Phase 1 with reversibility note.
  - `STACK_DECISIONS §12.2` (pnpm prescription) — relaxed to npm for the extension; deviation captured here.

---

**2026-05-07-g — session_2026-05-07-g_w2-extension-build-session-2 (Claude Code, on `workflow-2-competition-scraping` branch)**

- **Session purpose:** ship session 2 of the W#2 Chrome extension build per `STACK_DECISIONS §6` (Highlight Terms 20-color palette) + `STACK_DECISIONS §1, §2, §12` (extension framework + auth + monorepo structure already established in session 1) + `DESIGN §A.7` Module 1 setup flow (sign in → pick Project → pick Platform → set up Highlight Terms). Second of the 5–7 (now 7+ with the 3 verification waypoints) extension-build sessions; ROADMAP Active Tools W#2 row item (c).

- **Director-approved scope at session start via Rule 14f `AskUserQuestion`:** Option A "All three, full per-spec — RECOMMENDED" picked (4 options surfaced: **A recommended** all three full / B pickers-only-defer-Highlight-Terms / C all three + URL-recognition-badge stub / D escape hatch). Concrete-scope read-back per Rule 18 mid-build directive Read-It-Back covered: per-Project Highlight-Terms scoping; progressive-disclosure layout (project always visible; platform + Highlight Terms gated by project pick); switching projects clears platform; pure-helpers location at `extensions/competition-scraping/src/lib/`; on-blur splits commas + newlines; case-insensitive dedup; popover dismiss paths (outside-click + Esc); verification path. Director responded "Sounds right. Please proceed..." — full scope approved before any code.

- **Alternatives considered (Rule 14f, 4 options):**
  - (A) **All three popup pieces, full per-spec — RECOMMENDED.** Chosen. Lands the entire setup-screen surface (project + platform + Highlight Terms with the §6 4×5 palette + per-Project storage) in one commit so session 3 can build URL capture on a complete setup foundation. Most thorough.
  - (B) Pickers-only — defer Highlight Terms to session 3. Smaller scope; rejected because it splits the setup screen across two sessions and waypoint #1 would still need to verify all three pieces from different sessions.
  - (C) All three + URL-recognition badge stub. Reaches forward into session 3's content-script territory; rejected as more speculative than thorough.
  - (D) Escape-hatch — not selected.

- **Three Rule-15 autonomous picks taken (no user-visible difference within the brief's stated requirements):**
  - **Highlight Terms storage scope = per-Project** (key: `highlightTerms:<projectId>` in chrome.storage.local) — fits §A.7 framing where Highlight Terms come AFTER project pick; different Projects have different competitor terms.
  - **Switching projects clears persisted platform** (the platform pick is contextual to the project; new project = new context).
  - **Verify-Connection button retired** — the project picker itself proves the auth round-trip works (loading the project list IS the smoke test). Session 1's button was scaffolding for the auth shell, no longer needed.

- **Pure-helpers location decision:** `extensions/competition-scraping/src/lib/` (the logical home — these helpers only run inside the extension). Added a `test` script to extension's `package.json` so the extension has its own green test signal independent of the root runner. The `.ts` extensions in imports (required by node:test under `--experimental-strip-types`) initially conflicted with extension `tsconfig`'s default `allowImportingTsExtensions: false`; fixed by adding `allowImportingTsExtensions: true` + `noEmit: true` to extension `tsconfig.json`. Mirrors the root tsconfig's posture (root has both flags).

- **Two transient lint errors caught + fixed mid-session:**
  - `react-hooks/set-state-in-effect` on `ProjectPicker.tsx`'s `setState({ kind: 'loading' })` inside `useEffect` — same recurring pattern that bit slices (a.1) + (a.2). Fixed by initializing useState with `{ kind: 'loading' }` and just letting the fetch resolve to `ready` or `error`; no setState-in-effect synchronously.
  - `react/no-unescaped-entities` on the literal `'` in "you haven't" empty-state copy — fixed via `&apos;` escape.

- **Decision (extension session 2 shipped):**
  - **NEW pure-logic helpers** at `extensions/competition-scraping/src/lib/`:
    - `color-palette.ts` — 20-color palette per §6 (10 light + 10 dark), `getDefaultColorForIndex` (rotation banana → royal blue → mint → crimson → peach for first 5; continues through the rest of the palette for 6th-onward; wraps modulo 20), `getContrastTextColor` (palette-table lookup → black on light / white on dark; defensive luminance fallback for off-palette hex), `findPaletteColor` (case-insensitive lookup), `relativeLuminance` (WCAG formula; ill-formed input returns 0.5 deterministic fallback).
    - `highlight-terms.ts` — `parseTermInput` (splits on commas + newlines; trims; dedupes case-insensitively preserving first-seen casing), `mergeWithExisting` (continues color rotation from existing list length so adding terms across two on-blur events keeps default-color spread), `removeTermAt` + `setColorAt` (immutable updaters with bounds defense).
    - `popup-state.ts` — chrome.storage.local I/O. `getSelectedProjectId` / `setSelectedProject` (switching project clears persisted platform per the §A.7 contract). `getSelectedPlatform` / `setSelectedPlatform`. `getHighlightTerms(projectId)` / `setHighlightTerms(projectId, terms)` — per-Project keying. Adapter guards against `chrome` being undefined so module imports outside extension runtime no-op (mirrors `supabase.ts` pattern).
    - `platforms.ts` — 7 platform options + `getPlatformLabel` lookup.
  - **NEW unit tests** at `extensions/competition-scraping/src/lib/`:
    - `color-palette.test.ts` — 28 tests across COLOR_PALETTE structure (length 20, 10 light + 10 dark, unique hexes/names/uppercase format), DEFAULT_ROTATION_INDICES (opens with banana → royal blue → mint → crimson → peach per §6; covers every palette index exactly once), `getDefaultColorForIndex` (positional + wrap + invalid-index defense), `getContrastTextColor` (every light returns black; every dark returns white; lowercase input handled; off-palette luminance fallback), `relativeLuminance` (white/black/ill-formed defaults), `findPaletteColor` (case-insensitive + missing).
    - `highlight-terms.test.ts` — 14 tests across `parseTermInput` (empty, comma-split, newline-split, mixed, trim, dedup, non-string defense), `mergeWithExisting` (rotation continuation, dedup against existing, preserves overridden colors, empty-incoming returns copy), `removeTermAt` + `setColorAt` (bounds checks, immutability).
    - 42/42 pass via `node --test --experimental-strip-types`.
  - **NEW popup React components** at `extensions/competition-scraping/src/entrypoints/popup/components/`:
    - `ProjectPicker.tsx` — dropdown with loading/error/empty states; calls existing `listProjects()` from session 1; preserves the persisted selection if still in the list.
    - `PlatformPicker.tsx` — 7-option dropdown (Amazon / Ebay / Etsy / Walmart / Google Shopping / Google Ads / Independent Website) + muted-help line explaining why platform-pick is mandatory (Google Shopping / Google Ads / independent websites have URL ambiguity).
    - `HighlightTermsManager.tsx` — textarea + on-blur parse → chip list. Each chip styled with its highlight color (auto-flipped text). Per-chip swatch trigger + × remove. "Clear all highlight terms" link below the list. Anchors a `ColorSwatchPopover` to the chip whose swatch is being edited.
    - `ColorSwatchPopover.tsx` — 4×5 grid of 20 palette swatches per §6 (light rows 1–2, dark rows 3–4); ~32×32 with 2px gap; selected swatch shows thin black border on light / thin white border + outer ring on dark; color name as `title` tooltip on hover; closes on outside-mousedown + Esc.
  - **MODIFIED `App.tsx`** — replaced `SignedInScreen` Verify-Connection placeholder with `SetupScreen` composing the three pickers. State hydrates from `popup-state.ts` on mount; persists on every change. Active-session banner (small green "Capturing for **\<Platform Label\>**" line) renders at top once both project + platform are selected. Sign-out button stays at bottom.
  - **MODIFIED `style.css`** — extended with `field-block` layout + select/textarea styling matching the existing input style + `active-session` banner + `term-list` / `term-row` / `term-chip` / `swatch-trigger` / `term-remove` + `swatch-popover` (anchored, z-index 10, box-shadow) + `swatch-grid` (5×4 with 32×32 cells + 2px gap) + `swatch-cell` + `swatch-cell-selected` (dark vs light variants).
  - **MODIFIED `api-client.ts`** — typed `listProjects()` return as `ExtensionProject[]` with shape-validation filter that defends against unexpected response shapes (selects `{ id, name, description, lastActivityAt }`). Imports use `.ts` extensions to satisfy node:test under `--experimental-strip-types`.
  - **MODIFIED extension `tsconfig.json`** — added `allowImportingTsExtensions: true` + `noEmit: true` so .ts-extension imports work in both tsc and node:test.
  - **MODIFIED extension `package.json`** — added `test` npm script: `node --test --experimental-strip-types $(find src -name '*.test.ts')`.

- **Verification scoreboard:**
  - Extension `npm run compile` (`tsc --noEmit`): clean — zero errors.
  - Extension `npm test`: **42/42 pass** — exact baseline parity (no prior test count; this session establishes the baseline).
  - Extension `npm run build`: clean. `.output/chrome-mv3/` produced (manifest.json + popup.html + background.js + popup chunks + popup css). Bundle ~603 KB unpacked.
  - Extension `npm run zip`: produces `competition-scraping-extension-0.1.0-chrome.zip` (~165 KB compressed).
  - Extension `npx eslint extensions/competition-scraping/src`: clean — zero errors, zero warnings on the session-2 files.
  - Root `npx tsc --noEmit`: clean (`extensions/` excluded).
  - Root `npm run build`: clean — 49 routes (same baseline; zero new routes; this session adds zero PLOS-side files).
  - Root tests `find src -name '*.test.ts' | xargs node --test --experimental-strip-types`: **393/393 pass** — exact baseline parity (no root `src/lib` files modified).
  - Root `npx eslint src`: project-wide 13 errors / 39 warnings — exact baseline parity.

- **Manual smoke test:** NOT performed this session per the standing 2026-05-07-f directive deferring all manual extension testing to the 3 verification waypoints. 28 walked-through tests captured in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Extension build — session 2" section (Steps S2-1 through S2-28 covering: setup-screen flip from session 1's Verify-Connection / project list load + sort + error / project-picker default + persistence / platform list 7 options + rationale + active-session banner / switching projects clears platform / Highlight Terms empty state + add single + add multi-comma + add multi-newline + dedup case-insensitive + auto-flip text contrast across all swatches / open + change + close color picker / remove single + clear-all / persistence across popup close + Chrome restart / per-Project term lists / long-term wrap / whitespace-only input dropped / sign-out behavior / chrome.storage.local key check via service-worker DevTools / no console errors / build artifact integrity). Lands in waypoint #1 coverage (after extension session 3 ships URL-capture).

- **Affected sections:** §A.14 Q14 sequencing list (item 4 — "W#2 Chrome extension build" — session 2 now done; 3–5 sessions remaining before the 3 verification waypoints; total session-count estimate ~22–26 build + 3 waypoints = ~25–29). §A.13 + §A.15 popup setup flow now first-class implementation rather than design intent. No edits to §A1–§A18; §A remains frozen per Rule 18.

- **Cross-references:**
  - `docs/ROADMAP.md` — Active Tools W#2 row updated (Status cell adds extension session 2 shipped + Last Session updated + Next Session item (c) wording reflects session 2 done; Workflow #2 section item 4 updated to reflect session 1 + 2 shipped).
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc flags.
  - `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — new "Extension build — session 2" section appended with 28 walked-through tests targeting waypoint #1.
  - `STACK_DECISIONS §6` — implementation realized; FROZEN spec unchanged.
  - `STACK_DECISIONS §15 Q2` (extension settings page UI) — partially addressed by sign-out button + future reset path; full settings page still deferred.

---

**2026-05-07-g end-of-session addendum — URL-recognition features (2 new behaviors + URL-normalization rule) — director directive captured at end of session_2026-05-07-g_w2-extension-build-session-2**

- **Director's directive (verbatim):** *"After the user has added a url to a project, the platform results page should show an icon to the left of that link to reflect that the url is already added to the project. After the user has added a url to a project and when the user is on that url, there should be an overlay somewhere on the page to reflect that that specific page url is already added to the project the user is working on. Note that the tool should ignore the part of the url that includes the ? symbol and everything after that for these two new functionalities because that may change between browsing sessions."*

- **Captured at end-of-session 2026-05-07-g** after the session 2 commits (`51bc526` extension code + `317c036` doc batch) had already shipped + been pushed; this addendum is doc-only and lands as a separate commit. Implementation lands in extension session 3 (Module 1 URL-capture content script) — these are content-script features that require the per-platform DOM-pattern infrastructure session 3 establishes. Surfacing as a §B refinement now so session 3 has the spec ready in its first read.

- **Read-It-Back per Rule 18 mid-build (echoed back to director before this entry was written):** "Sound right?" — director: "Sounds right" — full scope approved before any doc edits.

- **Three behavioral specs (frozen at this entry):**

  1. **Search-results-page "already saved" icon.** On a platform's search-results page (Amazon search, Ebay search, Etsy search, Walmart search, Google Shopping results, Google Ads results, Independent Website pages with multiple product links), every competitor link whose normalized URL matches a `CompetitorUrl` already saved for the **currently-selected Project** (per the popup's `selectedProjectId` from session 2) gets a small icon rendered to the **LEFT of the link**. Passive recognition aid — no click target, no overlay, no popup; just a visual marker telling the user "you already have this one." Icon shape + color are extension-design-time decisions (Rule 15 autonomous at session 3) but should be visually distinct from the floating "+ Add" button per `STACK_DECISIONS §5` so the two affordances don't get confused. Per-platform DOM-pattern modules per `STACK_DECISIONS §5` Implementation guardrail #2 already enumerate which links count as "competitor links" on each platform — the same per-platform module decides where to inject the "already saved" icon.

  2. **Detail-page "already saved" overlay.** When the user navigates to a competitor URL whose normalized URL matches an existing `CompetitorUrl` saved for the current Project, an overlay appears **somewhere on the page** confirming "this URL is already in your project." Placement (corner overlay vs. extension-popover badge vs. inline ribbon vs. floating banner) is deferred to session-3 implementation time as a Rule-15 autonomous pick when the content-script wiring is in front of us; can be revisited if director wants to lock placement now (no objection raised at end-of-session 2026-05-07-g, so deferred). The §A.7 Module 2 framing's *"green badge in the extension popover, or a subtle border highlight"* is the prior illustrative spec; this entry supersedes it with the explicit "overlay somewhere on the page" framing.

  3. **URL-normalization rule (applies to BOTH features above).** Before comparing a candidate URL against the saved-`CompetitorUrl` list, strip `?` and everything after — i.e., drop the entire query string. Reason: tracking tokens (UTM params, click-IDs), session IDs, sort/filter parameters, etc. vary between browsing sessions and would cause false negatives ("user has saved URL X but the search page shows X with a different query-string and the icon doesn't appear"). Saved `CompetitorUrl.url` rows keep their **full URL as-typed** (the §A.7 brief lets the user edit URL during capture; storage is the canonical user-intent record); normalization is a **comparison-time operation only**, not a storage transformation. Implementation: a pure helper `normalizeUrlForRecognition(url: string): string` in the extension's lib (likely co-located with the per-platform modules; testable via node:test). Fragment (`#` and after) is **NOT** stripped today per the explicit director directive ("the part that includes the ? symbol and everything after that") — fragments are typically navigational anchors within the same page, not tracking-token noise; if a counter-example surfaces during waypoint #1, this rule can be extended additively.

- **Cross-references this entry triggers:**
  - **`ROADMAP.md` Active Tools W#2 row item (c)** — extension session 3's scope extended to include the three specs above (URL-add overlay form was already in session 3's scope; the two recognition features + the URL-normalization helper are additions). Updated this addendum.
  - **Rule 26 deferred task** — `DEFERRED:` task registered via TaskCreate at the start of this addendum, pointing at this §B entry as the destination spec; closes when extension session 3 ships the three specs.
  - **`STACK_DECISIONS §15` — open implementation questions** — adding implicitly via the session-3 scope extension; no edit to that file needed since the three specs are now frozen design rather than open questions.

- **Affected sections:** §A.7 Module 1 + Module 2 URL-recognition framing now has concrete behavioral specs. §A.7 Module 2's *"e.g., a green badge in the extension popover, or a subtle border highlight"* example phrasing is superseded for forward-looking decisions but §A remains frozen per Rule 18 — the supersession is captured here in §B and downstream sessions read both §A + §B together.

- **Why captured at end-of-session, not in session 2's main body:** session 2's scope was popup project-picker + platform-picker + Highlight-Terms color-palette UI, all of which shipped in commit `51bc526`. Director surfaced these two recognition features after the session-2 commits had been pushed. Per Rule 14e + Rule 26 the right move is a doc-only addendum that captures the directive immediately, registers a `DEFERRED:` task tracking implementation, and updates ROADMAP so session 3 has the spec ready — not a reopen of session 2.

---

**2026-05-07-h — session_2026-05-07-h_w2-extension-build-session-3 (Claude Code, on `workflow-2-competition-scraping` branch)**

- **Session purpose:** ship session 3 of the W#2 Chrome extension build per `STACK_DECISIONS §5` (floating "+ Add" button on link hover) + `STACK_DECISIONS §15 Q7` (per-platform DOM-pattern modules — explicit "build session per platform" framing) + `COMPETITION_SCRAPING_DESIGN.md §B` 2026-05-07-g end-of-session addendum (3 URL-recognition specs: search-results "already saved" icon + detail-page "already saved" overlay + `?`-stripping URL-normalization rule). Third of the 5–7+ extension-build sessions; ROADMAP Active Tools W#2 row item (c).

- **Director-approved scope at session start via Rule 14f `AskUserQuestion`:** Option B "Foundation + 4 shopping platforms (Amazon, Ebay, Etsy, Walmart)" picked over Option A "Foundation + Amazon only — RECOMMENDED" / Option C "Foundation + all 7 platforms" / Option D escape-hatch. Director's pick lands the framework + 4 simple-URL-pattern shopping platforms in a single session; Google Shopping (redirect-URL detection), Google Ads (DOM-attribute detection), Independent Websites (different opt-in UX) deferred to their own sessions per the §15 Q7 "build session per platform" framing. Total session count moves from 5–7 to ~6–8. Concrete-scope read-back per Rule 18 mid-build covered: framework pieces (URL-normalization helper + content-script orchestrator + floating "+ Add" button + URL-add overlay form + recognition icon + detail-page overlay + recognition cache + API client additions + right-click context menu fallback); 4 platform modules (amazon/ebay/etsy/walmart with regex-based product-link detection + canonical URL extraction); manifest expansion (`https://*.{amazon,ebay,etsy,walmart}.com/*` host_permissions + `contextMenus` permission); detail-page overlay placement (top-right floating banner, Rule-15 autonomous pick); verification path (~36 walked-through tests appended to verification backlog; lands in Waypoint #1). Director responded "Sounds perfect. Please proceed..." — full scope approved before any code.

- **Alternatives considered (Rule 14f, 4 options):**
  - (A) **Foundation + Amazon only — RECOMMENDED.** Builds the framework + 1 platform fully. Most conservative — `STACK_DECISIONS §15 Q7` literally anticipates "Build session per platform"; aligns with that cadence.
  - (B) **Foundation + 4 shopping platforms (Amazon, Ebay, Etsy, Walmart) — DIRECTOR PICKED.** Same framework + the 4 simple-URL-pattern shopping sites. Larger session; covers the four mainstream e-commerce sites in one shot.
  - (C) Foundation + all 7 platforms. Most aggressive; risks under-spec'd Google Ads / Independent Websites under one-session pressure.
  - (D) Escape-hatch — not selected.

- **Five Rule-15 autonomous picks taken (no user-visible difference within the brief's stated requirements):**
  - **Per-platform module shape: declarative pure functions** (no DOM access, no chrome.* access, no fetch). Each module exports `matchesProduct(href)` + `canonicalProductUrl(href)` + `platform` + `hostnames`. Lets each module be unit-tested via node:test in isolation (no jsdom mock needed). Future polish session can add jsdom-based fixtures of real pages if needed.
  - **Canonical URL extraction strips known volatile path-suffixes per platform.** Amazon: drops `/ref=sr_1_3` etc.; Ebay: drops title slug between `/itm/` and listing ID; Etsy: drops title slug after listing ID, preserves locale prefix; Walmart: drops title slug. Reasoning: makes the recognition cache more accurate (two browsing sessions of the same product collapse to the same canonical URL even if user navigated via different entry points). Stricter than the §B 2026-05-07-g directive's literal `?`-stripping; the directive said `?` is the minimum, didn't prohibit additional canonicalization.
  - **Content-script architecture: vanilla DOM (no React).** Avoided React inside the content script + shadow root — would balloon bundle size + risk conflicts with host-page React (Ebay, Walmart). Each component is a TS factory returning `{ destroy }`; styles inject as a single `<style>` tag with `plos-cs-` class prefix + `!important` on critical layout properties.
  - **Detail-page overlay placement: top-right floating banner.** Per the §B 2026-05-07-g item 2 "placement deferred to session-3 implementation as Rule-15 autonomous." Reasoning: visible without obscuring the product image area (typically center/left on every platform); matches Chrome's native notification placement; dismissible without interfering with primary actions. Auto-dismisses after 5 seconds + click-to-X.
  - **Recognition cache strategy: in-memory Set per page-load.** Single `GET /urls?platform=...` call on content-script init; results normalized via `normalizeUrlForRecognition` and stored in a `Set<string>` for O(1) hover-time lookups. Refreshed (in-place add) after a successful URL save so the just-saved link's "+ Add" button gets the new "already saved" icon on the same page. NOT persisted across page-loads — each new page re-fetches. Cost: 1 HTTP call per page (small JSON; cheap). Alternative considered + rejected: chrome.storage.local cache with TTL — adds complexity for unclear benefit at Phase 1 scale.

- **Decision (extension session 3 shipped):**
  - **NEW pure-logic helpers** at `extensions/competition-scraping/src/lib/`:
    - `url-normalization.ts` — `normalizeUrlForRecognition(url)` strips `?` and after per §B 2026-05-07-g item 3; `urlsMatchAfterNormalization(a, b)` boolean wrapper; `buildRecognitionSet(rows)` for the cache build path.
    - `platform-modules/types.ts` — shared `PlatformModule` interface.
    - `platform-modules/amazon.ts` — `/dp/{ASIN}` + `/gp/product/{ASIN}` matcher + canonical URL extractor (strips `/ref=...` etc.).
    - `platform-modules/ebay.ts` — `/itm/{listing-id}` matcher + canonical extractor (strips title slug).
    - `platform-modules/etsy.ts` — `/listing/{numeric-id}` matcher + canonical extractor (strips title slug; preserves locale prefix like `/dk-en/listing/...`).
    - `platform-modules/walmart.ts` — `/ip/{slug}/{numeric-id}` and `/ip/{numeric-id}` matcher + canonical extractor (strips slug).
    - `platform-modules/registry.ts` — `getModuleByPlatform(value)` for popup-state lookup; `getModuleByHostname(host)` for content-script entry routing (suffix match).
  - **NEW content-script components** at `extensions/competition-scraping/src/lib/content-script/`:
    - `styles.ts` — `CONTENT_SCRIPT_CSS` (≈6 KB stylesheet scoped via `.plos-cs-*` class prefix + `!important` on critical props) + `ensureStylesInjected()` idempotent injector.
    - `floating-add-button.ts` — `createFloatingAddButton({onClick})` factory; 300ms hover delay (§5 guardrail #1), per-session × dismiss (§5 guardrail #3), z-index 2147483647 (§5 guardrail #5), positioned upper-right of link bbox (§5 guardrail #4).
    - `already-saved-icon.ts` — `attachAlreadySavedIcon(link, canonicalUrl)` + `detachAlreadySavedIcon(link)` + `detachAllAlreadySavedIcons()`. Renders a green ✓ circle to the LEFT of competitor product links per §B 2026-05-07-g item 1.
    - `already-saved-overlay.ts` — `showAlreadySavedOverlay(projectName)` + `hideAlreadySavedOverlay()`. Top-right floating banner per §B 2026-05-07-g item 2.
    - `url-add-form.ts` — `openUrlAddForm({initialUrl, projectId, projectName, platform, onSaved, onClose})`. Modal-style overlay with backdrop + dialog, fields for URL (pre-filled, editable) + Project (read-only) + Platform (read-only) + Competition Category / Product Name / Brand Name (free-text, optional). Save calls `createCompetitorUrl`; loading state; inline error on HTTP failure. Esc + Cancel + backdrop click all close without saving.
    - `messaging.ts` — typed `OpenUrlAddFormMessage` for content-script ↔ background message protocol (right-click context-menu fallback).
    - `orchestrator.ts` — `runOrchestrator()` entry called by `entrypoints/content.ts`. Reads popup-state, picks the right platform module, fetches recognition cache, scans DOM for product links, attaches hover handlers + saved-icon, evaluates detail-page overlay condition, sets up MutationObserver for SPA / infinite-scroll re-scans + `popstate` listener for SPA URL changes, listens for context-menu messages.
  - **NEW content-script entry** at `extensions/competition-scraping/src/entrypoints/content.ts` — WXT `defineContentScript` with matches for the 4 platforms, `runAt: 'document_idle'`, calls `runOrchestrator()` and registers cleanup via `ctx.onInvalidated`.
  - **MODIFIED `api-client.ts`** — added `listCompetitorUrls(projectId, platform)` + `createCompetitorUrl(projectId, body)` using shared types from `src/lib/shared-types/competition-scraping.ts`. Refactored response-error handling into shared `readJsonOrThrow` helper used by all three exported functions.
  - **MODIFIED `entrypoints/background.ts`** — added `chrome.contextMenus` registration on `runtime.onInstalled` (id `plos-add-to-competition-scraping`, title "Add to PLOS — Competition Scraping", contexts `['link']`) and `contextMenus.onClicked` listener that forwards the link's URL to the active tab's content script via `chrome.tabs.sendMessage`. Idempotent re-registration via `removeAll`-then-create.
  - **MODIFIED `wxt.config.ts`** — added `https://*.{amazon,ebay,etsy,walmart}.com/*` to `host_permissions` and `contextMenus` to `permissions`. Chrome will require user re-approval at unpacked-reload time (standard MV3 install flow when host scope expands).
  - **NEW node:test unit tests** at `extensions/competition-scraping/src/lib/`:
    - `url-normalization.test.ts` — 24 tests across `normalizeUrlForRecognition` (no `?`, single param, multi param, empty value, fragment-only, `?` + `#` combined, trailing slash, non-string defense, real-world Amazon search URL), `urlsMatchAfterNormalization` (identical, asymmetric `?`, divergent paths, case-sensitive, empty defense), `buildRecognitionSet` (empty, multi-row, dedup-after-normalize, missing `.url` defense, undefined-row defense).
    - `platform-modules/amazon.test.ts` — 25 tests across metadata + matcher (positive: bare `/dp/`, trailing slash, `/ref=`, query, `/gp/product/`, title slug + `/dp/`; negative: search results, category page, 11-char or 9-char IDs, non-alphanum, lowercase, non-string) + canonical extractor (strip `/ref=`, strip slug+ref+query, normalize `/gp/product/` to `/dp/`, preserve host).
    - `platform-modules/ebay.test.ts` — 12 tests: bare `/itm/{id}`, slug-prefixed, query, trailing slash; reject too-short IDs, search, seller, alphanum; canonical extraction strips slug.
    - `platform-modules/etsy.test.ts` — 11 tests: bare `/listing/{id}`, slug-suffixed, query, locale-prefixed (`/dk-en/listing/...`); reject search, shop, non-numeric IDs; canonical extraction strips slug + preserves locale.
    - `platform-modules/walmart.test.ts` — 10 tests: slug-prefixed `/ip/Slug/{id}`, slug-less `/ip/{id}`, query; reject category, search, non-numeric; canonical extraction strips slug.
    - `platform-modules/registry.test.ts` — 12 tests across PLATFORM_MODULES list integrity (length 4, unique platforms, callable matchers) + getModuleByPlatform (4 known + 3 deferred-platform-returns-null + null/empty defense) + getModuleByHostname (exact, www subdomain, deeper subdomains, case-insensitive, internationalized TLD rejected, unrelated rejected, null/empty defense, substring-not-suffix rejection).
    - **104 new tests; 246/246 pass overall (146 helper tests in this session's test count + 42 prior popup tests + ... matching the verification scoreboard).** Wait — actual count is 146 helper tests; the 42 prior popup tests are part of those (color-palette + highlight-terms = 42; new = 104; total = 146). Verification scoreboard reports tests=146 pass.

- **Verification scoreboard:**
  - Extension `npm run compile` (`tsc --noEmit`): clean — zero errors.
  - Extension `npm test`: **146/146 pass** (42 prior + 104 new across url-normalization, 4 platform modules, registry).
  - Extension `npm run build`: clean. `.output/chrome-mv3/` produced with manifest.json + popup.html + background.js + popup chunks + popup css + **NEW** `content-scripts/content.js` chunk. Total bundle size **822 KB unpacked** (vs ~603 KB after session 2; +219 KB for content-script chunk). Build wall-clock 6.4 s.
  - Extension `npx eslint extensions/competition-scraping/src`: clean — zero errors, zero warnings on the session-3 files.
  - Root `npx tsc --noEmit`: clean (`extensions/` excluded).
  - Root `npm run build`: clean — **49 routes** (same baseline; zero new routes; this session adds zero PLOS-side files).
  - Root tests: **393/393 pass** — exact baseline parity (no root `src/lib` files modified).
  - Root `npx eslint src`: project-wide **13 errors / 39 warnings** — exact baseline parity.

- **Manual smoke test:** NOT performed this session per the standing 2026-05-07-f directive deferring all manual extension testing to the 3 verification waypoints. **36 walked-through tests captured in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Extension build — session 3" section** (Steps S3-1 through S3-36 covering: extension reload + permission re-approval / Site access verification / Permissions list / popup setup baseline / Amazon search → hover → "+ Add" button appears / cursor-leave hides button / form open + canonical URL pre-fill + context block / Save with empty optional fields / Save with all fields / Cancel / Esc / backdrop click / save failure inline error / per-session × dismiss / right-click context menu / detail-page overlay appears + auto-dismiss + manual close + non-saved-URL doesn't show / `?`-stripping URL-normalization with tracking-token URLs / non-product-link button absence / hover-delay 300ms / repeat full Amazon flow on Ebay / Etsy / Walmart / cross-platform mismatch no-op / mid-session platform switch / SPA navigation re-scan on Etsy infinite scroll / recognition cache survives URL save / popup-not-configured no-op / service worker DevTools clean / chrome.storage.local key check / build artifact integrity). **Lands in waypoint #1 coverage** (Waypoint #1 fires immediately after this session per the 3-waypoint plan in COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md).

- **Cumulative waypoint #1 surface size now ~150–160 walked-through steps** (originally estimated 50–80 in the 2026-05-07-f waypoint-split addendum; actual count: slice (a.1) 12 + slice (a.2) 14 + slice (a.3) 23 + slice (a.4) 30 + slice (b) [no walked-through steps; content-only slice] + extension session 1 18 + extension session 2 28 + extension session 3 36 = ~161 steps). Director may want to sub-split Waypoint #1 into two passes if the single walkthrough proves too long; flagged in the verification backlog's session 3 section for the verification session itself to evaluate.

- **Affected sections:** §A.7 Module 1 — implementation realized for the URL-capture flow on the 4 shopping platforms (Google Shopping / Google Ads / Independent Websites still pending). §A.14 Q14 sequencing list (item 4 — "W#2 Chrome extension build" — session 3 now done; 3–5 sessions remaining + 3 verification waypoints; total session-count estimate ~25–29). §B 2026-05-07-g addendum's 3 URL-recognition specs — IMPLEMENTED. No edits to §A1–§A18; §A remains frozen per Rule 18.

- **Cross-references:**
  - `docs/ROADMAP.md` — Active Tools W#2 row updated (Status cell adds extension session 3 shipped + Last Session updated + Next Session item (c) reflects session 3 done with session 4 + Waypoint #1 next).
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc flags.
  - `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — new "Extension build — session 3" section appended with 36 walked-through tests targeting waypoint #1.
  - `docs/PLATFORM_ARCHITECTURE.md` §1 — file-structure note adds `extensions/competition-scraping/src/lib/platform-modules/` + `extensions/competition-scraping/src/lib/content-script/` + `extensions/competition-scraping/src/entrypoints/content.ts`.
  - `STACK_DECISIONS §5` — implementation realized; FROZEN spec unchanged.
  - `STACK_DECISIONS §15 Q7` — partially closed (4 of 7 platform modules shipped; Google Shopping / Google Ads / Independent Websites pending).
  - `COMPETITION_SCRAPING_DESIGN.md §B` 2026-05-07-g end-of-session addendum — 3 specs implemented (search-results "already saved" icon + detail-page overlay + URL-normalization rule).

---

**2026-05-07-f addendum — verification-waypoint split (3 waypoints replacing 1)**

- **Director's directive (mid-end-of-session, after the doc batch had been committed but before exit):** *"Let's split the testing that way you described above. (1) After session 3 (Module 1 URL-capture lands) — simplest end-to-end loop exists: install → sign in → pick project + platform → capture a competitor URL → see it on the PLOS viewer. ~50–80 tests. (2) After session 5 (image upload lands) — full data-capture surface exists; only WAL/reconciler/distribution polish remain. ~120–150 tests."* Plus the implicit waypoint #3 at extension session 7 covering the remaining ~50 tests.

- **Alternatives considered:** ONE post-coding session covering all 150–200 tests in one sitting (the original 2026-05-07-f directive); SPLIT INTO 2 (after session 3 OR after session 5 + final); SPLIT INTO 3 (chosen). Three waypoints chosen — best balance of "find-a-problem-early feedback loop" + "manageable session size" + "natural stopping points where the next coding sessions don't re-touch the verified surface."

- **Decision:** ROADMAP item (f) wording updated; `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Verification waypoints" section added near the top (under "Why this doc exists") documenting the 3-waypoint plan + per-waypoint discipline (heading flip from PENDING → ✅ DONE per section as covered; new sections accumulate for the next waypoint; failures either get immediate fix or a Rule-26 `DEFERRED:` task with destination).

- **Affected sections:** §A.14 Q14 sequencing list (item 4 — "W#2 Chrome extension build" — verification now interleaved with build, not deferred to end); no edits to §A1–§A18; §A remains frozen per Rule 18.

- **Total session-count impact:** prior estimate (`session_2026-05-07-f` end-of-session handoff) of ~22–26 total W#2 sessions adjusts upward by +2 to **~24–28 total** because we add 2 verification sessions (waypoints #1 and #2) before the original final waypoint (#3, formerly the only verification session). Sessions to first testable end-to-end loop drop from 6 to 3 — director sees the extension working with real data 3 sessions earlier.

- **Cross-references:**
  - `docs/ROADMAP.md` — Active Tools W#2 row Next Session item (f) wording rewritten.
  - `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — "Verification waypoints" section added near top + header timestamp updated.
  - `docs/CHAT_REGISTRY.md` — addendum to today's row.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamp updated.

---

**2026-05-08 — session_2026-05-08_w2-to-main-full-deploy (Claude Code, on `main` branch — first W#2 milestone merge to main since the W#2 branch was created)**

- **Session purpose:** ship the W#2 → main full deploy that closes the deploy-gap blocker that ended Waypoint #1 attempt #1 on 2026-05-07-i. This is the first per-milestone merge of W#2 work to main since the W#2 branch was created — every W#2 session prior to today shipped on `workflow-2-competition-scraping` only; vklf.com (which runs main) had none of it. Per `MULTI_WORKFLOW_PROTOCOL.md §2`'s "feature branch until per-milestone merge" pattern, today's session is the first such milestone — chosen because the deploy gap has become an active blocker (not a stylistic choice).

- **Director's directives (via two Rule 14f `AskUserQuestion` calls at the strategy fork):**
  - **Schema check before merge:** Option A "Run prisma db pull --print first (recommended)" picked over "Trust the docs and skip the check" + escape hatch. Empirical schema verification preferred over commit-message trust for the first deploy after an out-of-band schema push.
  - **Merge approach:** Option A "Fast-forward merge (recommended)" picked over "Merge commit (--no-ff)" + escape hatch. Linear history; no extra merge node.
  - **Push approval (Rule 9 four-option):** Option A "Push now (recommended)" picked over "Run tests first / Hold / Escape." Director chose to deploy directly post-merge rather than gate on additional test runs since `npm run build` already ran clean.

- **Alternatives considered:** (i) cherry-pick only the CORS handler from the W#2 branch as a hot-fix to unblock Waypoint #1 — discussed in 2026-05-07-i Rule 14f; rejected as it would leave 31 W#2 commits stranded on the feature branch and require a second deploy session anyway. (ii) Hot-deploy mid-2026-05-07-i session — rejected then for context-cost reasons. (iii) Merge with `--no-ff` to mark the milestone with an explicit merge commit — rejected today as cosmetic; fast-forward is cleaner for a strict-descendant feature branch.

- **Decision:** Fast-forward merge of all 32 W#2 commits to main + push to origin + Vercel auto-redeploy + visual verification. Merge geometry: `main` 451697d → ea7321b; `workflow-2-competition-scraping` and `main` are now identical at `ea7321b`. **Schema strategy:** verified empirically that prod schema already contains the 7 W#2 tables + back-relations (pushed out-of-band 2026-05-06 per `701775f` commit message) — no `prisma db push` needed during this session; merge is purely code. **Verification:** W#1 visual verification PASSED on production (zero regressions in Keyword Clustering); W#2 PLOS-side visual verification PASSED (empty-state pages render cleanly at `/projects/[id]/competition-scraping`).

- **Affected sections:** §A.0 (referencing the deploy milestone — though §A is frozen, this entry serves as the §B-side acknowledgment); §A.14 Q14 sequencing — item 2 (PLOS-side build) and items 3-7 (extension build) all now LIVE on production, not just on the feature branch; §A.18 (release plan) — the deploy step that was previously implicit is now explicit.

- **Cross-references:**
  - `docs/ROADMAP.md` — Active Tools W#2 row Last Session updated; Next Session NEW (a) "Resume Waypoint #1 verification" + (c.0) flipped to ✅ DONE; header timestamp updated.
  - `docs/CHAT_REGISTRY.md` — new top row + header timestamp updated.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamp updated.

- **Branch implications:** `workflow-2-competition-scraping` continues to exist as the W#2 feature branch for subsequent code-producing sessions per `MULTI_WORKFLOW_PROTOCOL §2`. The next session — Waypoint #1 verification resumption — does not produce code, so it can run on either branch. The director's open scoping question (carried from this session into next): keep the original 2-step verification split or collapse to single-pass now that PLOS-side is also live.

---

**2026-05-08-c — session_2026-05-08-c_w2-waypoint-1-verification-attempt-3-extension-session-3 (Claude Code)**

- **Session purpose:** Waypoint #1 verification attempt #3 — extension session 3 walkthrough across Amazon (and the deferred S2-3 offline re-verify). Sessions 1+2 had passed in attempt #2; this session was supposed to walk through S3-1 through S3-36 and close out Waypoint #1. **Actual outcome:** PARTIAL — Amazon S3-1 through S3-11 ✅ before director called wrap-up at S3-11 per session-mgmt lucidity preference (3 substantive mid-session pivots already absorbed). Three real bugs in extension session 3 code FIXED INLINE in single code commit `f4226ca`. Three director directives surfaced + captured per Rule 18 mid-build directive Read-It-Back (this entry).

- **Director's directives (three captured this session per Rule 18 mid-build):**

  - **Directive #1 — Per-user-per-project extension state moves to PLOS DB (P-3 broadened from prior Highlight-Terms-on-reinstall observation):** *"Highlight words should be stored server side so that no matter where the user logs in, they can pick up where they left off. The same goes for other similar data so that no matter where the user logs in, they can pick up where they left off."* Surfaced when `Remove + Load unpacked` reload during the messaging-proxy fix wiped `chrome.storage.local`, and the director had to re-enter Highlight Terms per Project. Director's standing principle: extension state should NOT depend on a single Chrome profile / installation.

  - **Directive #2 — Live-page Highlight Terms application (P-5):** *"When using the competition scraping extension, the highlight words should be highlighted on the page that the user is on."* Surfaced during S3-7 walkthrough when director observed that Highlight Terms entered in popup were NOT being applied to the live Amazon search-results page. Current state: zero live-page highlight code in `extensions/competition-scraping/src/lib/content-script/`. Director's intent was always live-page highlighting (not PLOS-side captured-text only).

  - **Directive #3 — "Sponsored Ad" checkbox in URL-add form + PLOS-side tag (P-6):** *"Along with the 3 different fields that the user can fill out when saving a url, there should be a button to check that says 'Sponsored Ad'. This should be shown as a small tag in the PLOS side in Competition Scraping & Deep Analysis UI as well."* Surfaced during S3-10 walkthrough after the Save flow worked end-to-end. Pairs with P-4 (Amazon SSPA-redirect detection) — when P-4 ships, the form's checkbox would be auto-pre-checked for SSPA-detected URLs.

- **Alternatives considered (per directive):**

  - **#1 (state location):** PLOS DB (chosen — meets "no matter where user logs in" bar) vs. `chrome.storage.sync` (Chrome-account-scoped only — rejected, doesn't survive cross-browser-instance) vs. status quo `chrome.storage.local` (per-installation — rejected, fails reinstall test).

  - **#2 (highlight scope):** PLOS-side captured-text only (rejected via the director's clarification) vs. live competitor pages only (would deprioritize PLOS-side which would be a feature regression) vs. **both** PLOS-side AND live competitor pages (chosen — director's clarification explicitly named live-page; PLOS-side is additive future work).

  - **#3 (sponsored-ad capture):** Auto-detect only via P-4 (no manual override — rejected, P-4 may not catch every Amazon ad shape; user needs override) vs. **manual checkbox NOW + auto-pre-check WHEN P-4 ships** (chosen — synergy: P-6 first means P-4 only adds auto-pre-check behavior, not invent a new column).

- **Decisions:**

  - All three directives captured as ROADMAP polish backlog entries (P-3, P-5, P-6) — see `ROADMAP.md` "🔍 W#2 polish backlog" section. Each entry has scope sketch + estimated effort + cross-references. None actionable in this session per session-mgmt lucidity preference (3 substantive in-session pivots already absorbed for the messaging-proxy fix + button-disappear fix + saved-icon dedupe-and-visibility fix).

  - **Schema implication for P-3 + P-6:** when these polish items get built, the schema-change-in-flight flag will need to flip to "Yes" — both add fields (P-3 likely a new table or fields on existing user-project association tables; P-6 adds `isSponsoredAd Boolean @default(false)` to `CompetitorUrl`). Coordination per `MULTI_WORKFLOW_PROTOCOL §4` schema-change handshake applies.

- **Three inline code fixes shipped this session (not directives — bugs surfaced during walkthrough that blocked progression past their respective steps; commit `f4226ca`):**

  - **Fix #1 — Content-script CORS messaging proxy:** original Waypoint #1 attempt #3 trigger. Content scripts run in host page's origin (`amazon.com` etc.) which is NOT in vklf.com's CORS allowlist (`chrome-extension://*` only — see `src/lib/cors.ts:isAllowedOrigin`). Direct fetches from `listCompetitorUrls` + `createCompetitorUrl` failed preflight with `TypeError: Failed to fetch`. Fix: new `extensions/competition-scraping/src/lib/content-script/api-bridge.ts` routes the 3 PLOS API calls (`listProjects` + `listCompetitorUrls` + `createCompetitorUrl`) through `chrome.runtime.sendMessage` → background service worker → fetch from extension origin where CORS passes. Also extracted `PlosApiError` to standalone `errors.ts` so the bridge doesn't transitively pull in `auth.ts → supabase` under `node:test --experimental-strip-types`. **Bonus side effect:** content.js bundle dropped from ~219 KB to ~21 KB (supabase no longer pulled in transitively into per-page content script — real perf win on every Amazon/Ebay/Etsy/Walmart page load).

  - **Fix #2 — Floating "+" button hover grace timer:** moving cursor from link to floating button fired link-mouseleave → button hidden before cursor reached it. Fix: 150ms grace timer scheduled by `hide()`; button mouseenter cancels the timer; button mouseleave reschedules. Same pattern for `×` dismiss button. ~25 LOC change to `floating-add-button.ts`.

  - **Fix #3 — "Already saved" icon dedupe + visibility boost:** Amazon product cards have 4+ anchor tags pointing to the same product (image link, title link, review-anchor link, price link), so 1 saved URL produced 4 ✓ icons cluttering the card. Plus the default 16px muted-green icon was too subtle to spot at default styling against Amazon's busy chrome (director only noticed icons after applying debug outline via DevTools Console). Fix: dedupe in `orchestrator.scanLinks` to 1 icon per unique normalized URL (across MutationObserver re-scans by reading existing `data-plos-cs-has-icon="1"` markers) + CSS visibility boost in `styles.ts` (28×28 vibrant emerald `#16a34a`, 3px white border + green halo ring + drop shadow + bolder ✓ glyph at 18px font-size 900 weight + max z-index 2147483647). ~20 LOC orchestrator change + ~10 LOC CSS update.

- **Three doc-text drift items surfaced + captured for future cleanup or committed inline:**

  - S3-2 expected list said `https://vklf.com/*` — stale; manifest now uses `https://www.vklf.com/*` per attempt #2 fix `5472d26`. Inline doc-text update committed in this session's doc batch.
  - S3-3 expected `Storage` permission to display in Chrome UI; in practice Chrome only displays permissions with meaningful privacy implications (`storage` is benign internal-only and often hidden). Inline doc-text caveat added.
  - S3-8 said "+ Add button disappears immediately" on cursor away; with the grace-timer fix it now disappears after 150ms (deliberately, to enable the cursor traversal in fix #2). Inline doc-text update.

- **Affected sections:** §A.7 Module 1 (URL capture flow) — adds (post-implementation) clarifications around content-script CORS architecture (must use messaging proxy, not direct fetch) + saved-icon dedupe behavior + cursor-traversal grace timer. §A is frozen per Rule 18; this §B entry serves as the operational-evolution log. §B's prior 2026-05-07-g end-of-session addendum (search-results "already saved" icon spec) gains an addendum: **icon is now deduped to ONE per unique saved URL per page** (was implicitly per-link in the original spec).

- **Cross-references:**
  - `docs/ROADMAP.md` — header + Active Tools W#2 row + W#2 polish backlog new entries P-3, P-4, P-5, P-6.
  - `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — header + Waypoint #1 attempt log new row #3 + cross-references for attempt #3 + S3-1 through S3-11 marked ✅ + inline doc-text fixes for S3-2, S3-3, S3-8, S3-11.
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header + per-doc flags.
  - `docs/CORRECTIONS_LOG.md` — 2026-05-08-c entry (content-script CORS architecture lesson — extensions making cross-origin calls from content scripts MUST route through background service worker; same-origin allowlist `chrome-extension://*` doesn't cover content-script's host-page origin).
  - Code commit `f4226ca` on `workflow-2-competition-scraping`.

- **Branch implications:** Two commits this session: code `f4226ca` + end-of-session doc-batch (this commit). Both pending Rule 9 push approval — push to `workflow-2-competition-scraping` does NOT deploy vklf.com (which runs `main`). Next session's task is Waypoint #1 attempt #4 covering S3-12 through S3-36 + S2-3 deferred re-verify; next session can run on either branch (no code production expected unless mid-attempt-#4 surfaces another fix-inline pivot).

---

**2026-05-08-d — session_2026-05-08-d_w2-waypoint-1-verification-attempt-4-extension-session-3-completion (Claude Code)**

- **Trigger:** Waypoint #1 verification attempt #4 walked Amazon S3-12 through S3-25 ✅ then pivoted mid-session per Rule 14f Option A to fix four polish items (P-4 + P-5 + P-7 + P-8) before continuing the Ebay/Etsy/Walmart walkthrough — director's reasoning: avoid re-encountering the same bugs across 3 more platforms. Two of the four (P-7 + P-8) were captured live during the walkthrough today; the other two (P-4 + P-5) had been deferred from attempt #3 yesterday. All four shipped at code level in a single commit; browser re-verify carries to attempt #5.

- **Director directives surfaced today (per Rule 18 mid-build directive Read-It-Back — echoed back + confirmed before action):**

  - **(P-7) URL-add overlay positioning — directive at S3-12:** *"When the overlay opens to allow the user to add a url, it shouldn't open directly on top of the very product listing for which the url is being added because many times the user may need to look at the product listing to type in the product name, type or brand."* Read-back captured the intent (don't occlude the listing being captured), the rationale (user often needs the listing visible while typing optional fields), and proposed-and-approved the implementation approach (offset overlay from the trigger's bounding box). Confirmed by director "Yes, it's right."

  - **(P-8) ✓ already-saved icon punches through URL-add overlay — observation at S3-16:** *"if a listing that is next to it had its url added previously, its checkmark shows up on top of the new overlay (which it shouldn't)."* Read-back captured the intent (overlay should fully cover/dim everything underneath, including ✓ icons), the root cause (yesterday's `f4226ca` icon-visibility-boost set z-index to max int32 which equals the form's z-index → two stacking contexts at same z-index → DOM-order rendering → icon punches through), and proposed-and-approved the implementation approach (lower icon z-index + raise overlay z-index). Confirmed by director "Sounds right."

  - **(P-5) Live-page Highlight Terms application — directive carried over from 2026-05-08-c session, expanded with full design Read-It-Back today before coding:** Director surfaced expectation in attempt #3 (*"the highlight words are not being highlighted on the amazon results page... When using the competition scraping extension, the highlight words should be highlighted on the page that the user is on"*); today's design Read-It-Back enumerated the implementation choices (case-insensitive + word-boundary + multi-word + longest-first + whitespace-tolerant matching; TreeWalker over text nodes with skip-list including script/style/textarea/contenteditable/iframe/svg/our own UI; chrome.storage.onChanged listener for live popup-edit refresh; MutationObserver hookup via existing orchestrator observer; perf safeguards 50-term soft cap + 500KB body cap; requestIdleCallback for initial pass; what's-NOT-done scope — no contenteditable highlighting, no overlap dedup, no per-host opt-out). Director's response: "approve P-5 design — proceed."

  - **(P-4) Amazon sponsored-ads SSPA-redirect detection — feature gap carried over from 2026-05-08-c session.** Today's work involved director providing two real captured sponsored-ad URLs from Amazon (sp_atf placement → ASIN B0DWJTLNYT; sp_mtf placement → ASIN B0716F3NFG) for HTML-pattern verification before coding. Real-URL evidence confirmed `/sspa/click?ie=UTF8&spc=...&url=<URL-encoded path with /dp/{ASIN}>` as the canonical SSPA shape; both `searchParams.get('url')` (auto-decoded once) + the real ASIN positioning inside the decoded path were verified empirically. Implementation followed.

- **Why these matter:** P-7 + P-8 are visual-presentation polish but matter for daily UX (P-7 is the cognitive cost of needing to remember the listing details; P-8 is a "this looks broken" first-impression). P-5 is a directional feature gap — the popup-side Highlight Terms manager existed since extension-build session 2 but the user-facing payoff (terms actually highlighting on the page) was missing. P-4 is a feature gap — sponsored ads weren't capturable because the floating "+" button no-op'd on `/sspa/click` URLs.

- **Implementation summary:**

  - **(P-8 / smallest fix)** `extensions/competition-scraping/src/lib/content-script/styles.ts` — z-index restructure into 3 tiers (page-overlay 999990 for saved-icon + add-button + dismiss + overlay-banner; modal-backdrop 999998; modal-content 999999) replacing the prior universal max-int 2147483647. Preserved the icon's ability to beat host-page chrome (Amazon's chrome max-z-index is ~5000-10000 so 999990 has ~100× headroom). Added a leading comment block in the CSS file documenting the tier system. ~5 lines effective change.

  - **(P-7)** Three files modified: `extensions/competition-scraping/src/lib/content-script/url-add-form.ts` adds optional `triggerRect?: DOMRect | null` to `UrlAddFormProps` + new pure helper `computeFormPosition()` that places the form on the side of the viewport opposite the trigger's horizontal center (anchored near top with 16px margin, clamped for narrow viewports); applies via inline `style.position`/`style.left`/`style.top` so the explicit positioning overrides the backdrop's flex-centered layout. `extensions/competition-scraping/src/lib/content-script/floating-add-button.ts` extends the `FloatingAddButtonOptions.onClick` contract to `(href, triggerRect: DOMRect | null)` + stores `currentLinkRect = link.getBoundingClientRect()` at button-show time. `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` threads `triggerRect` from the floating button's onClick into `handleAddRequest(href, triggerRect)` and into the openUrlAddForm props; right-click context-menu fallback path passes `null` for `triggerRect` (no trigger element) → form falls back to centered layout. ~50 LOC across 3 files.

  - **(P-4)** Two files modified: `extensions/competition-scraping/src/lib/platform-modules/amazon.ts` adds `decodeSspaInner(href)` helper (parses URL, checks `pathname === '/sspa/click'`, pulls `searchParams.get('url')`, prepends `${protocol}//${host}`, returns full URL or null); both `matchesProduct` and `canonicalProductUrl` consult it as a fallback when the direct ASIN_RE match fails. `extensions/competition-scraping/src/lib/platform-modules/amazon.test.ts` adds 9 SSPA-coverage tests using the two real captured sponsored-ad URLs + edge cases (missing/empty `url=` param + non-SSPA URLs that happen to have a `url` query param + `/gp/product/` inside SSPA). ~50 LOC source + ~70 LOC tests.

  - **(P-5 / largest fix)** Three files: NEW `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` (~240 LOC) implements the live-page highlight-terms module per the approved design. NEW `extensions/competition-scraping/src/lib/content-script/highlight-terms.test.ts` (~120 LOC) unit-tests the regex builder + colormap pure logic (DOM-touching functions verified live in browser re-verify). `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` integrates: `await startLiveHighlighting(projectId)` after `ensureStylesInjected()` (with try/catch so highlight failures don't break the rest of orchestrator); MutationObserver tick also calls `highlighter.refresh()` (idempotent — strips existing highlights then re-applies); `popstate` location-change handler also calls `highlighter.refresh()`; cleanup teardown calls `highlighter.destroy()`. `extensions/competition-scraping/src/lib/content-script/styles.ts` adds `.plos-cs-highlight` CSS rule (display: inline; padding: 0 2px; border-radius: 2px; background-color + color set inline per-term).

- **Affected sections:** §A.7 Module 1 (URL capture flow) — `+ Add` button now appears on Amazon sponsored ads (P-4) + URL-add overlay positions away from the clicked listing (P-7) + ✓ already-saved icons no longer punch through the URL-add overlay (P-8). §A is frozen per Rule 18; this §B entry serves as the operational-evolution log. **NEW behavior surface — live-page Highlight Terms (P-5)**: the popup-side Highlight Terms manager (built in extension-build session 2 per §A.7) now also drives a content-script that wraps every matching token on Amazon/Ebay/Etsy/Walmart product pages with a colored `<mark>` element. Reads the same `highlightTerms:<projectId>` storage key the popup writes; live-syncs popup edits via `chrome.storage.onChanged`. Skips contenteditable/textarea/script/style/our-own-UI subtrees. Performance safeguards in place. Will need to interact carefully with P-3 (per-user-per-project state moves to PLOS DB) when that ships — same storage-read API can be swapped to PLOS-API-read.

- **Cross-references:**
  - `docs/ROADMAP.md` — header + Active Tools W#2 row Status + Next Session updates + W#2 polish backlog (P-4 + P-5 marked ✅ SHIPPED 2026-05-08-d code-level + new entries P-7 + P-8 marked ✅ SHIPPED 2026-05-08-d code-level).
  - `docs/CHAT_REGISTRY.md` — header + new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header + per-doc flags.
  - `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — NOT updated this session per Rule 14f Option A wrap-now choice; attempt #4 row + S3-12..S3-25 check-offs + S3-16 doc-text caveat get added at the start of next session's end-of-session doc batch alongside the browser re-verify outcomes.
  - Code commit `<TBD-this-session>` on `workflow-2-competition-scraping` (the polish-fixes commit) + this doc-batch commit.

- **Branch implications:** Two commits this session: code (4 polish fixes — single commit) + end-of-session doc-batch (this commit). Both pending Rule 9 push approval — push to `workflow-2-competition-scraping` does NOT deploy vklf.com (which runs `main`). Next session (attempt #5) starts with director downloading the new zip from `extensions/competition-scraping/.output/competition-scraping-extension-0.1.0-chrome.zip` (175 KB), reloading the unpacked extension at `chrome://extensions`, and walking through a 4-fix re-verify on Amazon (~15-30 min) before continuing the Ebay/Etsy/Walmart walkthrough.

---

**2026-05-09-b — session_2026-05-09-b_w2-polish-session-6-p-6-sponsored-ad-build-and-deploy**

- **Director's directive (initial — from launch prompt):** *"W#2 polish session #6 — implement P-6 Sponsored Ad checkbox in URL-add form + PLOS-side tag (per ROADMAP polish backlog P-6 entry; queued by director 2026-05-08-d Option-A 3-session-split). Schema-change-in-flight session — flips flag Yes → No."*

- **Read-It-Back at drift check (per Rule 14a + 14f):** Claude echoed back the 6-part scope from the ROADMAP P-6 entry — (a) schema add `isSponsoredAd Boolean @default(false)` to CompetitorUrl; (b) shared types extended additively; (c) API routes wired (POST/GET/PATCH on /urls + /urls/[urlId]); (d) extension url-add-form checkbox + payload; (e) PLOS-side viewer badge + detail-page toggle + column filter; (f) P-4 synergy via SSPA detection. Director-confirmed via Rule 14f single ambiguity question on the column filter UI shape: Option A new `BooleanFilter` tri-state primitive (All / Sponsored only / Non-sponsored only — recommended) vs Option B reuse `MultiSelectFilter` with synthetic options (less code; leaky abstraction). Director picked **Option A**.

- **Rule-15 autonomous picks (no user-visible difference):**
  - **Sponsored column position = position 2 (right after URL, before Product Name).** Reasoning: sponsored is the most-important meta-attribute about a URL right after its address; co-locates the badge with the URL identity. Alternative placements (last column / between Category and Stars) considered and rejected as making the badge less spatially tied to the URL.
  - **Boolean tri-state representation = `'all' | 'true' | 'false'` string union (vs `boolean | null`).** Cleaner round-trip through URLSearchParams (single key `?sponsored=true|false`; key-omission means 'all') without null-vs-undefined ambiguity.
  - **`detectsAsSponsored` is OPTIONAL on the `PlatformModule` interface** — only Amazon implements it; Ebay/Etsy/Walmart leave it undefined and orchestrator treats absence as "default false." Future platforms with sponsored detection (Google Ads paid placements?) can opt in additively.
  - **Detail-page toggle UX is one-click flip (no edit/save dance).** Other inline editors (Text/Number/Vocabulary) use a pencil → edit → ✓/✕ pattern; for a boolean that's overkill — clicking the checkbox optimistically flips, fires PATCH, reverts on error. New `EditableBooleanField` primitive captures this pattern (minimal, reusable for future boolean toggles in W#2 + W#3-14).

- **What was decided:** Code shipped per the 6-part scope. Two commits both deployed to vklf.com:
  - `bc6816c` P-6 implementation — 14 files (+461/-2): schema + 3 shared types + GET/POST/PATCH wiring on /urls + /urls/[urlId] + extension `url-add-form.ts` checkbox + new optional `PlatformModule.detectsAsSponsored()` (Amazon impl + 7 new amazon.test.ts cases + orchestrator passes signal at form-open as `defaultIsSponsoredAd` prop) + new CSS for checkbox row + PLOS-side `UrlTable.tsx` new "Sponsored" column at position 2 (sortable label + funnel + amber pill badge) + new `BooleanFilter` tri-state primitive in `ColumnFilters.tsx` + new `EditableBooleanField` primitive in `EditableField.tsx` wired into `UrlDetailContent.tsx` between Category and Product Stars.
  - `8115138` post-deploy popover-clipping fix — 1 file (+51/-12): director-observed regression where the column-filter popover got clipped on short tables by the wrapper's `overflow-x: auto` (browsers force overflow-y to clip too). Switched `FilterPopover` from `position: absolute` to `position: fixed` with viewport-anchored top/left computed at click-time from trigger button's `getBoundingClientRect()`; clamped to keep the popover inside the viewport's right edge. Benefits all 7 column filters, not just Sponsored.

- **Mid-session correction (CORRECTIONS_LOG entry, LOW severity):** Claude framed the Step 3 `prisma db push` STOP-gate as targeting "the dev DB only." That was wrong — PLOS uses **one shared Supabase database** for both dev and prod (one connection string in `.env`). The schema column landed in the production DB at the time of the push, before any code had been deployed to read/write it. Safe in this case (additive boolean with `@default(false)`; no data loss; new column simply held the default until vklf.com later got the new code). Acknowledged + correctly framed mid-session at the dev-vs-prod boundary discussion (Step 14). Corrected understanding: dev server (localhost) reads/writes the same DB; vklf.com reads/writes the same DB; "dev" vs "prod" applies to CODE deployment but NOT DB. Future schema-change sessions need to factor this in (a `prisma db push` IS a production schema change, even when described as "dev push" in the session script).

- **Browser-verified live on vklf.com end-to-end:**
  - Walmart: column appears ✅; detail-page toggle flips Yes/No with optimistic update ✅; badge appears on saved row in list ✅; column filter All/Sponsored/Non-sponsored with `?sponsored=true|false` URL round-trip ✅; sort by Sponsored toggle ✅.
  - Amazon extension: SSPA-detected sponsored ad → checkbox auto-pre-checked in URL-add overlay ✅; save with checkbox checked → POST persists isSponsoredAd: true → badge appears on viewer row ✅; organic save (unchecked) → em-dash on viewer ✅.
  - Popover post-fix re-verify: short table; funnel popover opens fully visible (Apply + Clear buttons not clipped) ✅; benefits all 7 column filters ✅.

- **Director-confirmed P-9 status (Walmart highlight-words gap):** existing W#2 polish backlog item P-9 (highlight-terms 500KB cap too aggressive) covers the chrome://extensions Errors panel symptom that surfaced on Walmart again this session. New data point captured: Walmart search exact byte count = 656,627 bytes (`https://www.walmart.com/search?q=bursitis`); 500KB cap fires. Folded into P-9 entry; no new polish item created.

- **Doc updates this session (this commit on `main`):**
  - `docs/ROADMAP.md` — header + Active Tools W#2 row Next Session item (a.2) marked ✅ DONE 2026-05-09-b + W#2 polish backlog P-6 ✅ SHIPPED ✅ DEPLOYED ✅ BROWSER-VERIFIED + P-9 entry data-point addition.
  - `docs/CHAT_REGISTRY.md` — new top row + header.
  - `docs/DOCUMENT_MANIFEST.md` — header + per-doc Modified flags + this-session summary.
  - `docs/COMPETITION_SCRAPING_DESIGN.md §B` (this entry).
  - `docs/CORRECTIONS_LOG.md` — LOW-severity 2026-05-09-b entry on dev-DB framing slip.

- **Branch implications:** Code commits `bc6816c` + `8115138` authored on `workflow-2-competition-scraping`, then deployed via fast-forward merge → `main` per `MULTI_WORKFLOW_PROTOCOL.md §11.1`. Both branches now sit at `8115138` (W#2 fast-forwarded back to main after the second deploy push pending). End-of-session doc-batch commit lands on `main` directly (covers session work that happened across both branches; `main` is the canonical home for ROADMAP/CHAT_REGISTRY/DOCUMENT_MANIFEST/CORRECTIONS_LOG; W#2 will be fast-forwarded to match before next session). Push of doc-batch commit pending Rule 9 approval — push triggers Vercel rebuild but contains zero user-visible code changes (docs only).

---

**2026-05-10 — session_2026-05-10_w2-polish-session-7-p-3-highlight-terms-server-side (Claude Code, eighteenth W#2 session — code commit `16d4351` pushed to `workflow-2-competition-scraping`; W#2 → main merge + browser-verify on vklf.com pending future deploy session)**

- **Director's directive (initial — from launch prompt):** *"W#2 polish session #7 — implement P-3 (narrowed) Highlight Terms server-side persistence (per ROADMAP polish backlog P-3 entry, narrowed by director 2026-05-08-d Option-A 3-session-split to Highlight Terms only; remaining P-3 scope stays open). Schema-change-in-flight session — flips flag Yes → No. Mandatory first action: Rule 18 mid-build directive Read-It-Back to surface the schema-shape decision (table vs JSON column) BEFORE coding."* Director gave Claude pick-whichever agency between (A) P-3 narrowed Highlight Terms server-side persistence and (B) P-9 + P-10 extension polish bundle.

- **Read-It-Back at drift check (Rule 14a):** Claude recommended Option A (P-3 narrowed) as the most thorough/reliable path with three reasons surfaced in plain-language per-option framing: most thorough (removes the underlying state-loss class of bugs; P-9 + P-10 are bug-fix patches and the affected platforms degrade gracefully today); pre-positioned (the W#2 row's "Next Session" cell already had a written launch prompt); schema window open (W#1 graduation-pending so no schema work coming there). Director picked **Option A** via Rule 14f forced-picker — selected "P-3 Highlight Terms (recommended)."

- **Schema-shape Read-It-Back (Rule 18, mandatory before any code):** Claude surfaced three storage options with full per-option context — **Shape A** dedicated `UserProjectHighlightTerm` table (one row per user+project+term; per-term granularity supports future polish like lastMatchedAt; reorderable cleanly via sortOrder; cross-project queries indexable); **Shape B** single JSON column on a new `UserProjectExtensionState` table (matches today's chrome.storage.local shape; smallest extension refactor; less queryable; could become a forward-compatible bucket for future state); **Shape C** reuse the existing generic `UserPreference` table (zero new tables; couples extension-state semantics into a generic prefs bag; hardest to grow). Recommended Shape A as the most-thorough/reliable answer with explicit caveat that the broader-P-3-scope items (selectedProjectId, selectedPlatform) are different shapes (single scalars, not lists) and should NOT pre-share a bucket today — premature abstraction. Director picked **Shape A** via Rule 14f forced-picker.

- **Implementation-plan Read-It-Back (Rule 18, second mandatory step):** Claude wrote the full plan in plain language covering 9 sections: (1) new table schema with field-by-field annotation; (2) two API endpoints `GET` + `PUT` under existing `/api/projects/[projectId]/extension-state/highlight-terms` tree with PUT-replace-whole-list semantics inside one `$transaction`; (3) extension popup switch from chrome.storage.local read/write to PLOS-first via api-client.ts; (4) **content-script unchanged** — chrome.storage.local stays as a per-installation MIRROR cache so the shipped P-5 module's `chrome.storage.onChanged` listener keeps firing on edits without additional surface to break; (5) one-time auto-migration of pre-existing local terms on first authenticated load (pushes them up so director doesn't re-enter); (6) offline policy — read fallback shows cached terms with sync warning, write failure throws inline error and does NOT update cache (next online sync brings server state back); (7) explicit out-of-scope: selectedProjectId/selectedPlatform server-side, case-insensitive DB collation, per-term audit columns (lastMatchedAt etc.); (8) verification surface; (9) ~120-180 min estimate. Director approved + granted standing-approvals for both push-when-clean and immediate `prisma db push` via three Rule 14f forced-pickers.

- **Rule-15 autonomous picks (no user-visible difference):**
  - **Auth helper = `verifyProjectAuth` (NOT `verifyProjectWorkflowAuth`).** Highlight Terms are user+Project scoped, not workflow scoped — they're meaningful regardless of which workflow is being worked on under the Project. Using `verifyProjectAuth` skips the find-or-create-ProjectWorkflow upsert that adds DB load for no semantic benefit here. Aligned with the `(userId, projectId, term)` unique constraint at the schema layer.
  - **PUT-replace-whole-list semantics (vs CRUD).** The term list is small (typically 5-20 terms) and edited as a whole in the popup. Replace-whole-list matches the existing call-site contract exactly (the popup's `setHighlightTerms` always wrote the full array). One $transaction = no partial-write race. Idempotent — same body produces same end state.
  - **Server validation: 200-char term limit; 100-term list limit; 7-char hex color regex; case-sensitive intra-request dedup.** Defense in depth — popup-side dedup is case-insensitive but the server's unique constraint is case-sensitive; intra-request dedup avoids surfacing P2002 to the client. Limits are pragmatic guardrails to prevent accidentally storing megabyte payloads.
  - **Sync-helper dependency-injection seam (`HighlightTermsSyncDeps`).** Refactored mid-session after the first test attempt failed because `node:test --experimental-strip-types` couldn't resolve the auth → supabase chain (extensionless `'./supabase'` import). DI seam makes orchestration logic testable without mocking Supabase auth + fetch + chrome.storage.local globals. Production callers use the default deps; tests inject fakes. (Side-effect: also fixed the auth.ts `'./supabase'` import to `'./supabase.ts'` for ESM-strict resolver compatibility.)
  - **Popup orchestration sequence: optimistic update + rollback on save failure.** Mirrors P-6's `EditableBooleanField` pattern. State updates immediately on user edit; PUT fires; on success state advances to server's canonical view (server may normalize, e.g. trim whitespace); on failure state rolls back to prior + inline error renders.
  - **Sync-warning UI surface = small muted-help paragraph above HighlightTermsManager.** Save-error UI surface = inline error block below HighlightTermsManager. Two distinct surfaces because they cover different failure modes (load offline vs save offline) and clearing one shouldn't auto-clear the other. Successful save clears stale sync-warning since a successful PUT proves the server is reachable.

- **What was decided + shipped:** 9 files changed (+841/-9); single commit `16d4351` on `workflow-2-competition-scraping`. New: `prisma/schema.prisma` adds `UserProjectHighlightTerm` model with `@@unique([userId, projectId, term])` + `@@index([userId, projectId])`; `src/app/api/projects/[projectId]/extension-state/highlight-terms/route.ts` — new GET + PUT + OPTIONS handlers; `src/lib/shared-types/competition-scraping.ts` — adds `HighlightTermDto` + `ListHighlightTermsResponse` + `ReplaceHighlightTermsRequest` + `ReplaceHighlightTermsResponse`; `extensions/competition-scraping/src/lib/api-client.ts` — adds `listHighlightTerms` + `replaceHighlightTerms`; `extensions/competition-scraping/src/lib/highlight-terms-sync.ts` — new orchestrator module with DI seam + `loadHighlightTerms` returning `{ terms, source: 'server' | 'migrated' | 'cache-fallback', warning }` + `saveHighlightTerms` (server-first then mirror); `extensions/competition-scraping/src/lib/highlight-terms-sync.test.ts` — 13 new tests. Modified: `extensions/competition-scraping/src/entrypoints/popup/App.tsx` — SetupScreen wires sync helpers + new sync-warning + save-error UI surfaces; `extensions/competition-scraping/src/lib/popup-state.ts` — header comments updated to reflect mirror-cache role (no functional change); `extensions/competition-scraping/src/lib/auth.ts` — `'./supabase'` → `'./supabase.ts'` for ESM resolver.

- **Schema push:** `npx prisma db push` succeeded against prod in 1.05s (additive — new table only; no existing table touched). Schema-change-in-flight flag flipped Yes during build, back to No after push completed. Note (carried from 2026-05-09-b CORRECTIONS_LOG): PLOS uses one shared Supabase database for dev + prod, so the new table landed in the production DB at push time. Safe — additive change; pre-P-3 code on main simply doesn't read/write the new table; the new code uses it only after W#2 → main merge ships.

- **Verification scoreboard:**
  - Extension `npm run compile` clean (zero errors).
  - Extension `npm test`: **205/205 pass** (was 192/192 — 13 new sync tests added).
  - Extension `npm run build`: clean; **637.9 KB total** (popup-CWenFIaG.js 401.54 kB; background.js 202.12 kB; content.js 29.53 kB).
  - Extension `npx eslint extensions/competition-scraping/src` (run from root): **clean — zero errors / zero warnings.**
  - Root `npx tsc --noEmit`: clean (extensions/ excluded by config).
  - Root `npm run build`: clean — **50 routes** (was 49; new `/api/projects/[projectId]/extension-state/highlight-terms`).
  - Root `node --test --experimental-strip-types $(find src/lib -name '*.test.ts')`: **393/393 pass** — exact baseline parity (no root `src/lib` files modified).
  - Root `npx eslint src`: **52 problems (13 errors, 39 warnings)** — exact baseline parity (13e/39w).

- **Browser verification:** NOT YET — code lives on `workflow-2-competition-scraping` only; not on `main`; not on vklf.com. Director would walk through after a future W#2 → main deploy session. Director's call when to schedule the deploy. Verification path when it happens: (a) install/reload extension; (b) sign in; (c) pick Project that previously had Highlight Terms in chrome.storage.local; (d) confirm terms appear (one-time migration silently pushed them server-side); (e) add/remove a term; (f) toggle DevTools Network → Offline; reload popup → confirm sync warning appears + cached terms still show; (g) sign in from a different Chrome profile / different laptop; confirm same terms appear (the cross-device-test that motivated P-3 originally).

- **Multi-workflow per Rule 25:** Pull-rebase clean at session start. Schema-change-in-flight stayed "No" both rows entering session; flipped W#2's to "Yes" at start of `prisma db push` step, back to "No" after push succeeded. No parallel chat. W#1 row untouched per Rule 3 ownership; zero cross-workflow edits.

- **TaskList sweep at end-of-session (Rule 26):** 5 tasks tracked + completed (Read-It-Back schema-shape; read existing schema + design + call sites; implement P-3; verify build/tests/lint; end-of-session doc batch). **Zero `DEFERRED:` items at any point.** Polish-or-future work surfaced (e.g., contenteditable highlighting; per-host opt-out; client-side write queue for offline writes) was acknowledged in the plan Read-It-Back as out-of-scope and **not deferred** — director didn't want them in scope today and they're not load-bearing for the P-3 polish goal.

- **Affected sections:** §A.7 Module 1 (URL capture flow + Highlight Terms manager) — Highlight Terms now persist server-side; cross-device + cross-Chrome-profile behavior is now "your terms come with you." §A is frozen per Rule 18; this §B entry serves as the operational-evolution log. **NEW data-flow surface — server-authoritative Highlight Terms storage:** popup writes server first, then mirrors to chrome.storage.local; content-script live-page module (shipped P-5) reads chrome.storage.local + listens to chrome.storage.onChanged; the mirror keeps the live-page sync working without the content-script ever talking to the server. Affects §A.12 Data persistence (`highlightTerms:<projectId>` in chrome.storage.local was authoritative; now a per-installation cache mirror; PLOS DB `UserProjectHighlightTerm` is authoritative).

- **Cross-references:** `prisma/schema.prisma` UserProjectHighlightTerm model; `src/app/api/projects/[projectId]/extension-state/highlight-terms/route.ts` (GET + PUT + OPTIONS); `src/lib/shared-types/competition-scraping.ts` (HighlightTermDto + ListHighlightTermsResponse + ReplaceHighlightTermsRequest + ReplaceHighlightTermsResponse); `extensions/competition-scraping/src/lib/highlight-terms-sync.ts` (orchestrator with DI seam); `extensions/competition-scraping/src/lib/api-client.ts` (listHighlightTerms + replaceHighlightTerms); `extensions/competition-scraping/src/entrypoints/popup/App.tsx` SetupScreen (load/save wiring + sync-warning + save-error UI); `extensions/competition-scraping/src/lib/popup-state.ts` (mirror-cache role documented); `ROADMAP.md` W#2 polish backlog P-3 entry status update; `CHAT_REGISTRY.md` 2026-05-10 row.

- **Branch implications:** Code commit `16d4351` pushed to `workflow-2-competition-scraping` per session-start standing approval. **NOT on `main` yet; NOT deployed to vklf.com.** Director's call when to schedule the W#2 → main merge to deploy. Until then, vklf.com runs the prior code (P-6 + popover fix from 2026-05-09-b); the new `UserProjectHighlightTerm` table sits idle in prod (no writers / no readers from main code). End-of-session doc-batch commit lands on `workflow-2-competition-scraping` (covers session work that happened entirely on this branch). Push of doc-batch commit pending Rule 9 approval — push to W#2 branch does NOT deploy vklf.com regardless.

### 2026-05-10-b — W#2 → main deploy session: P-3 narrowed Highlight Terms server-side persistence DEPLOYED + BROWSER-VERIFIED on vklf.com (closes the deploy-pending state from 2026-05-10)

- **Director's session task:** *"W#2 → main deploy session — fast-forward merge `workflow-2-competition-scraping` into main per `MULTI_WORKFLOW_PROTOCOL.md §11.1`, push to main, watch Vercel auto-redeploy, browser-verify P-3 narrowed Highlight Terms server-side persistence on vklf.com (the path captured in ROADMAP W#2 polish backlog P-3 entry: install/reload extension → sign in → pick Project that previously had local Highlight Terms → confirm one-time auto-migration silently pushed them server-side → add/remove a term → DevTools Network → Offline + reload popup → confirm sync warning + cached terms still show → sign in from a different Chrome profile / different laptop → confirm same terms appear)."* This is platform-wide deploy infrastructure (cross-workflow concern); per `HANDOFF_PROTOCOL.md` Rule 25 + `MULTI_WORKFLOW_PROTOCOL.md §11.1`, work belongs on `main`.

- **Sequence executed:** branch verified `main` at session start ✅ → `git fetch origin && git pull --rebase origin main` clean (already up to date) ✅ → `git merge --ff-only origin/workflow-2-competition-scraping` clean (no conflicts; main was 0 ahead of W#2 branch; advanced `928a271 → 8a6e3b5`; 13 files, +905/-17 — both code commit `16d4351` and doc-batch commit `8a6e3b5` brought over) ✅ → `git push origin main` clean ✅ → Vercel auto-redeploy completed (director-confirmed `"build done"`) ✅. **Schema-change-in-flight flag stays No throughout — schema landed in prod last session via `prisma db push`; today is code-deploy only, no schema work.**

- **P-3 verification — all three paths PASSED on vklf.com:**

  - **(i) Silent one-time auto-migration verified end-to-end ✅.** Director added a `p3-server-test` term during the OLD-extension state at session-start (mid-session attempted Phase D before realizing the rebuild + reload had loaded the OLD extension code due to a Codespace folder-zip stale download — see Mid-session friction below). Once the NEW build was loaded via the unique-name single-file zip path, the popup's first authenticated load fired the migration: server returned empty (no terms for this Project + user) + cache had the `p3-server-test` term → orchestrator's migration path triggered → PUT to `/api/projects/[projectId]/extension-state/highlight-terms` → terms appeared via `source: 'migrated'` path with no UI nag. Verified via DevTools Network tab: highlight-terms request appeared with status 200.

  - **(ii) DevTools Network → Offline + reload popup → cached terms still show ✅.** Director toggled DevTools Network throttling to "Offline", pressed Cmd+R / Ctrl+R to reload the popup with DevTools attached. Cached `p3-server-test` term still rendered in the chip list (orchestrator's `cache-fallback` path returned terms from `chrome.storage.local` mirror).

  - **(iii) Cross-device sign-in (different Chrome profile/laptop) → same terms appear ✅.** Director signed in from a different Chrome profile / different laptop, picked the same Project, and confirmed the `p3-server-test` term appeared. **This is the canonical proof of server-side persistence** — the term could only be in the server DB, not local cache (cache is per-Chrome-installation; a different profile/laptop has its own cache that started empty).

- **Mid-session friction captured to `CORRECTIONS_LOG.md`:**

  - **(a) Codespace folder-zip download served what looked like a stale build despite director's full redo.** Director executed: delete old folders → remove old extension → download zip from Codespaces → save extracted folder locally → load folder into Chrome. After Phase D + offline reload, DevTools Network tab showed only the popup HTML/JS/CSS chunks + a failed `projects` request — NO `highlight-terms` request fired at all, suggesting OLD code was loaded. The popup chunk filename in the loaded extension was `popup-CMo7bk1g.js` whereas the freshly-built extension's chunk was `popup-CWenFIaG.js` (verified via `grep` against the local `.output/chrome-mv3/chunks/`). **Root cause hypothesis:** the standard Codespace browser-tab "Download folder" UI generates a zip on the fly and may have served what amounts to a stale or cached zip from a prior session's `.output/`. **Fix:** Claude bypassed the standard folder-zip mechanism by running `zip -r .output/plos-extension-2026-05-10-p3.zip .` server-side (single file, unique filename `plos-extension-2026-05-10-p3.zip`, sha256 `c10142f4...`); director downloaded that single file directly from `extensions/competition-scraping/.output/`, extracted, loaded as unpacked extension; the `highlight-terms` request appeared in DevTools immediately on next reload, confirming the new code was finally loaded. **Lesson for future extension-rebuild sessions:** prefer the single-file unique-name zip path over the Codespace folder-zip download when a code-version mismatch is suspected.

  - **(b) Claude's first diagnostic was over-engineered — director called it `"unnecessarily complex"`.** When the chunk-filename mismatch surfaced, Claude initially proposed asking the director to (i) open the local extension folder on their laptop, (ii) open `popup.html` in a text editor, (iii) read the script tag's `src` attribute, (iv) list the contents of the `chunks` subfolder, etc. — a multi-step file-by-file path-tracing diagnostic. Director feedback: *"This is unnecessarily complex. Think of a different fix."* Claude's switch was the simpler approach above (server-side zip with unique name + direct download). **Lesson for future debugging sessions:** when a download-mechanism is the suspected source of staleness, prefer to bypass the suspect mechanism with a different one rather than chasing diagnostic depth into the suspect mechanism.

- **Pull-rebase clean at both checkpoints per Rule 25:** session start (after fetch) + before doc-batch commit. Multi-workflow per Rule 25: W#1 row untouched per Rule 3 ownership; schema-change-in-flight stays No throughout (no schema work today).

- **TaskList sweep at end-of-session per Rule 26:** 5 session tasks tracked + completed (start-of-session sequence + drift check; fast-forward merge + push; watch Vercel; browser-verify P-3; end-of-session doc batch). Zero `DEFERRED:`-prefixed tasks at any point. The two CORRECTIONS_LOG entries are session-record findings (process improvements / debugging-style guidance), not deferred items per Rule 14e — they belong in CORRECTIONS_LOG directly, no destination handoff needed.

- **Cross-references:** ROADMAP.md header + Active Tools W#2 row + (a.4) ✅ DONE 2026-05-10-b + (a.3) browser-verify ✅ DONE + W#2 polish backlog P-3 entry flipped to BROWSER-VERIFIED; CHAT_REGISTRY.md 2026-05-10-b row; CORRECTIONS_LOG.md 2026-05-10-b two new entries (Codespace folder-zip stale download + over-engineered diagnostic); commits `16d4351` + `8a6e3b5` (both pre-existing on W#2 branch from 2026-05-10; brought to main via this session's fast-forward merge); `extensions/competition-scraping/.output/plos-extension-2026-05-10-p3.zip` (server-side build artifact, gitignored).

- **Branch implications:** session work was the merge + push + browser verification — no new code commits authored this session. The fast-forward merge brought `16d4351` (code) + `8a6e3b5` (doc-batch) from W#2 onto main, both already pushed to origin. End-of-session doc-batch commit lands on `main` directly (covers today's deploy + browser-verify session). After this commit pushes, vklf.com gets a Vercel rebuild but contains zero user-visible code changes (docs only).

---

**2026-05-10-b — session_2026-05-10-b_w2-polish-session-8-p2-p9-p10-bundle (Claude Code, nineteenth W#2 session — three polish fixes shipped at code level on `workflow-2-competition-scraping`; W#2 → main merge + browser-verify on vklf.com pending future deploy session)**

- **Director's directive (initial — from launch prompt):** *"W#2 polish session #8 — P-9 + P-10 + P-2 polish bundle per ROADMAP Active Tools W#2 row Next Session item (a.5) + W#2 polish backlog entries P-9 (highlight-terms 500KB body-text cap too aggressive — blocks Ebay+Walmart pages, fires repeatedly on Walmart heavy-SPA pages) + P-10 (AlreadySavedOverlay banner intermittent on Walmart heavy-SPA pages) + P-2 (extension offline-error handling — authedFetch doesn't catch fetch's TypeError)."*

- **Read-It-Back at drift check (Rule 14a):** Claude surfaced three observations BEFORE asking how to proceed: (1) ROADMAP's Active Tools W#2 row Next Session list has `(a.4)` W#2 → main deploy as RECOMMENDED NEXT, but director picked `(a.5)` polish bundle — doing polish first compounds the W#2-vs-main gap; (2) Group A doc reads partial (CLAUDE_CODE_STARTER + HANDOFF_PROTOCOL + MULTI_WORKFLOW_PROTOCOL + targeted ROADMAP sections only — platform-wide docs not loaded); (3) ~3-4.5 hour total estimate; lucidity risk surfaced upfront. Director picked **"Proceed with all three fixes today, P-2 → P-10 → P-9 in that order (Recommended)"** via Rule 14f forced-picker.

- **P-2 fix shipped (smallest piece, ~5-10 LOC + tests):**
  - `extensions/competition-scraping/src/lib/api-client.ts:46-60` `authedFetch` now wraps the `fetch()` call in `try { ... } catch (err) { throw mapFetchTransportError(err); }`.
  - New exported helper `mapFetchTransportError(err: unknown): PlosApiError` — converts `TypeError("Failed to fetch")` (offline / DNS failure / CORS preflight failure / refused connection) into `PlosApiError(0, 'Network unreachable — check your connection.')`. Other error shapes (AbortError, generic Error, PlosApiError, primitives) are re-thrown unchanged.
  - New test file `extensions/competition-scraping/src/lib/api-client.test.ts` — 6 new tests cover the helper in isolation: TypeError → PlosApiError(0, ...); cross-message TypeError variants; non-TypeError re-throw; AbortError DOMException re-throw; PlosApiError re-throw (idempotent on already-mapped); primitive/null re-throw.
  - **Why exporting the helper:** lets the test exercise the conversion logic without mocking global `fetch`, follows the established pattern of exporting pure-logic helpers (`buildHighlightRegex`, `buildColorMap`, etc.).

- **P-10 fix shipped (~30-50 LOC, no new tests — extension convention is DOM-touching code verified end-to-end in browser):**
  - `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — three behavior changes:
    - **`maybeShowDetailOverlay()` dedupes by `location.href`:** new `lastOverlayUrl: string | null` closure variable. Set BEFORE the recognition match so navigate-away-and-back correctly re-fires (A saved → B unsaved → A again all distinct). Without dedupe, Walmart's React routing fires multiple URL-change events for the same destination during one navigation, causing banner flicker.
    - **`scheduleDetailOverlayCheck()` debouncer (150ms):** cancellable timer ensures only the final URL gets a banner check after a burst of pushState calls. Cleanup on teardown clears any pending timer.
    - **MutationObserver-based SPA URL change detection:** new `lastObservedUrl = location.href` closure variable. Inside the existing 250ms-debounced rescan callback, after `scanLinks()` + `highlighter.refresh()`, check `location.href !== lastObservedUrl`; if changed, update + call `scheduleDetailOverlayCheck()`. **Key technical wrinkle that drove this design:** Chrome content scripts run in an **isolated world** with their own `window.history`, so patching `pushState` in the content-script context does NOT intercept host-page React Router calls (Walmart, etc.) that happen in the page's own context. The MutationObserver is the cross-context-safe signal — SPA navigation always causes immediate DOM mutation paired with a URL change.
  - **popstate handler unchanged in shape but now routes through `scheduleDetailOverlayCheck()`** for consistency with MutationObserver-detected changes. Initial-load detail-overlay check at orchestrator startup (line 242 in pre-fix) also routes through the debouncer — gives Walmart's React time to settle URL after content-script load.
  - **Alternatives ruled out:** page-context `<script>` injection to patch pushState in page context (more invasive; CSP-sensitive); `chrome.webNavigation.onHistoryStateUpdated` (requires `webNavigation` permission + user re-approval prompt + background-script messaging); polling `location.href` (wasteful CPU). MutationObserver-based detection re-uses already-running observer with zero new permissions or background overhead.

- **P-9 fix shipped (largest piece, chunked/incremental highlight pass + cap removed entirely):**
  - **The recommended backlog combination (c) chunked + (e) dedupe warning + (f) skip-if-unchanged measurement reduces to (c) alone** — chunking removes the cap entirely, which auto-resolves both noise (no cap → no warning to dedupe) and perf (no cap → no expensive `document.body.textContent.length` re-measure on each refresh tick).
  - `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` — three changes:
    - **`MAX_BODY_TEXT_LEN_BYTES` constant + `pageTooLarge()` function REMOVED entirely.** No more 500KB cap; no more chrome://extensions Errors panel accumulation; no more skip-pass for Ebay (~1.5MB) and Walmart (~636KB) pages.
    - **New exported `processInChunks<T>(items, processItem, options)` helper** — generic chunk-and-yield. Default chunk size 500 (sized so each chunk takes ~10-15ms at ~25μs/wrap on typical pages). Yields between chunks via `requestIdleCallback` (with `setTimeout(0)` fallback). Pluggable `yieldFn` for unit testing without browser idle-callback API. Honors a `CancellationSignal` — returns at next chunk boundary if `signal.cancelled` becomes true mid-pass.
    - **`applyHighlightsTo` is now `async`** — collects text nodes upfront via TreeWalker (existing pattern; cheap synchronous DOM read), then processes them via `processInChunks`. Honors cancellation in BOTH the collect phase (between TreeWalker steps) and the wrap phase (between chunks).
  - **`startLiveHighlighting.refresh()` rewritten for last-wins cancellation:** new `activeApplySignal: CancellationSignal | null` closure variable tracks the in-flight pass. Each new `refresh()` cancels the previous (sets `signal.cancelled = true`) before starting fresh. Wrapped in try/finally so the active-signal slot is cleared on completion or cancellation. The destroy() function also cancels in-flight passes for clean teardown.
  - **MutationObserver debounce stays at 250ms in orchestrator.ts.** Cancellation-on-new-refresh handles the rapid re-fire churn cleanly: rapid SPA mutations on Walmart will cancel + restart refreshes, with the latest DOM-state always becoming the eventual visible state.
  - **9 new tests added to `extensions/competition-scraping/src/lib/content-script/highlight-terms.test.ts`** for `processInChunks` — chunk boundary correctness (no yield within chunks; no trailing yield); empty-input; signal-cancelled-mid-pass; signal-cancelled-before-first-item; default chunkSize; ordering invariant.

- **Rule-15 autonomous picks (no user-visible difference):**
  - **Default chunkSize = 500.** Sized so each chunk takes ~10-15ms (well under 16ms frame budget) on typical pages with ~25μs/text-node wrap. Tunable via options for future tuning.
  - **`scheduleYield` uses `requestIdleCallback` when available, falls back to `setTimeout(0)`.** Identical strategy to existing initial-pass scheduling. Both yield to the event loop; idle callback waits for browser-determined idle moments (preferred), setTimeout fires next-tick (universal).
  - **Pure helper extraction pattern.** `processInChunks` and `mapFetchTransportError` exported for unit testing — established convention across the extension's pure-logic surface (`buildHighlightRegex`, `buildColorMap`, URL-normalization helpers, etc.).
  - **No bumped MutationObserver debounce on heavy-SPA platforms.** With cancellation-on-new-refresh, the churn-cost is paid only on the cancelled passes' partial work (which is wiped by the next removeAllHighlights anyway); no need to slow refresh latency.
  - **TS-narrowing fix mid-implementation.** Initial `processInChunks` used `for (let i = 0; i < items.length; i++) processItem(items[i])` which TS strict-mode flagged with TS2345 (`items[i]` typed as `T | undefined` under `noUncheckedIndexedAccess`). Switched to `for (const item of items)` with separate counter — same semantics, clean type narrowing.

- **What was decided + shipped:** Three fixes in a single bundle on `workflow-2-competition-scraping`. Two new test files (`api-client.test.ts` 6 tests; `highlight-terms.test.ts` extended +9 tests for `processInChunks`); modifications to `api-client.ts` (P-2 wrapper + helper), `highlight-terms.ts` (P-9 chunked walker + cap removed), `orchestrator.ts` (P-10 SPA URL-change detection + dedupe + debouncer). Total +15 tests; zero regressions.

- **Verification scoreboard:**
  - Extension `npm run compile` clean (zero errors).
  - Extension `npm test`: **220/220 pass** (was 205/205 — +6 P-2 tests + +9 P-9 processInChunks tests).
  - Extension `npm run build`: clean; **638.82 KB total** (popup unchanged at ~401 KB; background unchanged at ~202 KB; content-scripts/content.js ~30 KB).
  - Extension `npx eslint extensions/competition-scraping/src` (run from extension root): exit 0; "Pages directory" informational message from inherited Next eslint plugin (not a lint error — no errors / no warnings emitted; same observation as session #7's lint output).
  - Root `npx tsc --noEmit`: clean (extensions/ excluded by config).
  - Root `npm run build`: clean — **50 routes** (exact baseline parity from session #7; no new routes this session).
  - Root `node --test --experimental-strip-types $(find src/lib -name '*.test.ts')`: **393/393 pass** — exact baseline parity (no root `src/lib` files modified).
  - Root `npx eslint src`: **52 problems (13 errors, 39 warnings)** — exact baseline parity (13e/39w).

- **Browser verification:** NOT YET — code lives on `workflow-2-competition-scraping` only; not on `main`; not on vklf.com. Director will walk through after a future W#2 → main deploy session. Verification path when it happens, per fix:
  - **P-2:** Sign in to extension; toggle DevTools Network → Offline; trigger an `authedFetch`-backed call (e.g., open popup which lists projects, OR sign out + sign in to force `listProjects` API call); confirm the popup's red error box reads "Network unreachable — check your connection." instead of "Failed to fetch" / blank state.
  - **P-9:** Configure Highlight Terms in popup; navigate to Ebay search results page (~1.5MB body text) — Highlight Terms appear (previously: skipped via cap). Same on Walmart (~636KB+). Open chrome://extensions Errors panel for the extension — confirm zero new "exceeds highlight cap" entries (the warning is gone). Configure 50+ terms — confirm "exceeds soft cap" warning still fires (the soft cap on term count is preserved). Spot-check that highlights still appear on Amazon (was working pre-fix).
  - **P-10:** Sign in; pick Project; pick Walmart platform; save a Walmart product URL via the floating "+ Add" button; navigate from Walmart search results to that saved product detail page (single-click navigation — uses pushState) — confirm the green "✓ This URL is already in your project" banner appears reliably (previously: intermittent on Walmart). Repeat across 5-10 navigations to test reliability. Also spot-check Amazon + Ebay + Etsy detail-page banner (was working pre-fix); confirm no regressions.

- **Multi-workflow per Rule 25:** Pull-rebase clean at session start. Schema-change-in-flight stayed "No" both rows entire session — none of P-2/P-9/P-10 touched `prisma/schema.prisma`. No parallel chat. W#1 row untouched per Rule 3 ownership; zero cross-workflow edits.

- **TaskList sweep at end-of-session (Rule 26):** 5 tasks tracked + completed (start-of-session sequence + drift check; P-2 fix; P-10 fix; P-9 fix; verification + doc batch). **Zero `DEFERRED:` items at any point.** One observation captured (the wxt-build hang seen mid-session resolved itself; root cause was apparently stale background processes from earlier build attempts; not deferred — informational).

- **Affected sections:** §A.7 Module 1 (URL capture flow + AlreadySavedOverlay banner reliability + live-page Highlight Terms application) — Walmart heavy-SPA reliability improved across two surfaces; Highlight Terms now apply on arbitrary-size pages; offline-error UX cleaner. §A is frozen per Rule 18; this §B entry serves as the operational-evolution log. **No new data-flow surfaces.**

- **Cross-references:** `extensions/competition-scraping/src/lib/api-client.ts` (P-2 wrap + `mapFetchTransportError` helper); `extensions/competition-scraping/src/lib/api-client.test.ts` (NEW — 6 tests); `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` (P-9 chunked walker + cap removed + `processInChunks` helper + `CancellationSignal` interface); `extensions/competition-scraping/src/lib/content-script/highlight-terms.test.ts` (extended +9 processInChunks tests); `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` (P-10 SPA URL-change detection + dedupe + 150ms debouncer); `ROADMAP.md` W#2 polish backlog P-2 + P-9 + P-10 entry status updates; `CHAT_REGISTRY.md` 2026-05-10-b row.

- **Branch implications:** Code commit (this session's work) lands on `workflow-2-competition-scraping`. **NOT on `main` yet; NOT deployed to vklf.com.** Combined with session #7's P-3 narrowed work (commit `16d4351`), the W#2-vs-main deploy gap now covers FOUR polish items (P-2 + P-3 narrowed + P-9 + P-10) plus session #7's schema addition. The next deploy session (item (a.4) in the Active Tools row) will browser-verify all four together. End-of-session doc-batch commit also lands on `workflow-2-competition-scraping`. Push of both code + doc-batch commits pending Rule 9 approval — push to W#2 branch does NOT deploy vklf.com regardless.

**2026-05-10-c — session_2026-05-10-c_w2-main-deploy-and-p9-p10-browser-verify-and-p2-deferred (Claude Code, twentieth W#2 session — W#2 → main deploy session #2; P-9 + P-10 ✅ DEPLOYED + ✅ BROWSER-VERIFIED on vklf.com; P-2 ✅ DEPLOYED but browser re-verify DEFERRED with corrected test sequence captured)**

- **Director's directive (initial — from launch prompt):** *"W#2 → main deploy session — fast-forward merge `workflow-2-competition-scraping` to `main` and push to deploy four W#2 polish items (P-2 + P-3 narrowed + P-9 + P-10) plus session #7's UserProjectHighlightTerm schema addition."* Per `MULTI_WORKFLOW_PROTOCOL.md §11.1`, work belongs on `main`.

- **Drift-check surfaced 3 facts not in launch prompt (clarified before any git surgery):**
  - **(a) Two of the four items already shipped + verified.** P-3 + UserProjectHighlightTerm schema landed in the previous deploy session (2026-05-10-b commit `21d717b` on main; verified via `npx prisma db pull --print` + `grep -n UserProjectHighlightTerm prisma/schema.prisma` line 404). Today's actual deploy scope is just **P-2 + P-9 + P-10** (3 fixes, not 4), all extension-only code.
  - **(b) `git merge --ff-only` is NOT possible — branches diverged.** main's `21d717b` (deploy doc-batch from 2026-05-10-b) had advanced past the merge base. polish session #8 (`9d9cfea` + `6cd9949`) was added to W#2 WITHOUT first pulling main's `21d717b` — neither branch is a strict ancestor of the other.
  - **(c) Root cause for next-session protocol fix:** polish session #8 should have run `git pull origin main` (not just `git pull --rebase origin workflow-2-competition-scraping`) to absorb main's `21d717b` deploy doc-batch into W#2 before adding new W#2 commits. Captured to CORRECTIONS_LOG with proposed fix to extend `MULTI_WORKFLOW_PROTOCOL §4`.

- **Director-picked Option A (recommended) for divergence resolution:** rebase W#2 onto main + force-push W#2 + ff-only merge to main + push origin/main. Reasoning: produces clean linear history; matches "fast-forward merge" intent from launch prompt; one-time cleanup of the divergence so next W#2 session starts from a clean state.

- **Rebase + conflict resolution executed:** `git checkout workflow-2-competition-scraping && git rebase main`. Three doc-file conflicts (CHAT_REGISTRY, DOCUMENT_MANIFEST, ROADMAP) + two auto-merged (COMPETITION_SCRAPING_DESIGN, COMPETITION_SCRAPING_VERIFICATION_BACKLOG). Conflicts resolved mechanically via Python script:
  - **Header chains** in CHAT_REGISTRY/DOCUMENT_MANIFEST/ROADMAP: kept HEAD's "Last updated" as top + demoted W#2's content to a new "Previously updated" entry. Same pattern for "Last updated in session" lines (one regex slip required manual fix later).
  - **W#2 row in ROADMAP Active Tools table:** the row's "Last Session" cell was the trickiest — both versions prepended their own session entry to a flowing concatenated cell. Resolution = take HEAD's row (which has all the latest accurate sub-item statuses including (a.3) → DONE, (a.4) → DONE), surgically prepend the polish session #8 entry to the start of the Last Session cell with " / " separator (HEAD's convention; W#2 had used "PRIOR:" trailing word).

- **Force-push W#2 + ff-only merge to main:** `git push --force-with-lease origin workflow-2-competition-scraping` succeeded (origin's W#2 went `6cd9949...cc843a7 (forced update)`; old commits dangling on GitHub for ~30 days, recoverable). Then `git checkout main && git merge --ff-only workflow-2-competition-scraping` clean (now strictly 2 commits ahead). Per Rule 9 deploy gate, described both commits' impact + asked explicit confirmation; director approved; `git push origin main` clean → Vercel auto-redeploy started. Net result on main: `d2e2115` (P-2/P-9/P-10 extension code, byte-identical to original `9d9cfea` per pre-push code-diff verification) + `cc843a7` (resolved-conflict doc-batch).

- **Extension rebuilt + zipped for sideload:** `npx wxt build` clean in 1.574s (no epoll_wait hang this time after `pkill -f wxt` to clear yesterday's zombies). `.output/chrome-mv3/` total size **638.82 kB** — exact match for polish session #8 verified baseline (no surprise drift from rebase). Zipped `plos-extension-2026-05-10-c-p2-p9-p10.zip` at repo root, 177,116 bytes (slightly larger than yesterday's 175,090 due to polish session #8 code additions). Unique-named filename per the Codespace-zip-cache lesson from yesterday's CORRECTIONS_LOG.

- **P-9 verification — ALL 9 STEPS PASSED on vklf.com (cap-removal + chunked walker confirmed across 4 platforms):**
  - **P9-1 + P9-2 (Ebay search + listing detail):** Highlight Terms now appear on previously-blocked ~1.5MB / ~1.58MB pages ✅ (cap-removal verified — these pages were entirely blocked pre-fix).
  - **P9-3 + P9-5 (chrome://extensions Errors panel post-Ebay + post-Walmart):** zero new "exceeds highlight cap" entries ✅ (cap entirely removed → no warning to repeat; held even after Walmart's ~20+ MutationObserver re-renders).
  - **P9-4 (Walmart search heavy-SPA ~636-675KB):** Highlight Terms appear + page does NOT freeze ✅ (chunked walker yields between batches; 500 nodes ≈ 10-15ms/chunk).
  - **P9-6 (soft 50-term-count cap):** console warning fires when terms exceed 50 ✅ (separate from removed body-text cap; still active).
  - **P9-7 + P9-8 (Amazon + Etsy spot-checks):** no regression ✅ (smaller pages still highlight cleanly).
  - **P9-9 (live-edit on Walmart):** add/remove a term in the popup with a Walmart page open → page updates highlights within ~1-2s without refresh ✅ (chrome.storage.onChanged listener + last-wins cancellation handles in-flight pass cleanly).

- **P-10 verification — ALL 10 STEPS PASSED on vklf.com (Walmart heavy-SPA reliability + cross-platform spot-checks):**
  - **P10-1 (direct paste of saved Walmart URL):** banner appears within ~1s + auto-dismisses after 5s ✅.
  - **P10-2 + P10-3 (Walmart SPA-navigation to saved product, repeat 5 times):** banner appears reliably 5/5 times across different saved products ✅ (the previously-flaky path — pre-fix this was intermittent).
  - **P10-4 (unsaved product navigation):** NO banner appears ✅ (correctly suppressed — URL not in recognition set).
  - **P10-5 (unsaved → saved navigation):** banner appears ✅ (dedupe correctly tracks last-considered URL — re-fires on URL change).
  - **P10-6 (refresh same URL):** banner appears again on refresh ✅ (fresh content script = fresh state).
  - **P10-7 (manual × dismiss + stay on URL):** banner does NOT re-appear at the same URL ✅ (dedupe correctly suppresses re-fire until URL changes).
  - **P10-8 + P10-9 + P10-10 (Amazon + Ebay + Etsy spot-checks):** banner appears on each saved-product navigation ✅ (no regression on platforms that already worked pre-fix).

- **P-2 BROWSER RE-VERIFY DEFERRED + corrected test sequence captured for next session:**
  - **What director observed today:** P2-4 still showed "Failed to fetch" instead of friendly "Network unreachable — check your connection." in the popup's red error box.
  - **Diagnosis (verified via code-read):** P-2's fix (`mapFetchTransportError` in `extensions/competition-scraping/src/lib/api-client.ts:62`) wraps `authedFetch` only. Supabase auth's `signInWithPassword` (in `auth.ts:17-23`) has its OWN internal fetch path that's NOT wrapped by `mapFetchTransportError`. The original verification spec from polish session #8 ("sign out → WiFi off → sign in") hits supabase auth's path BEFORE `authedFetch` ever runs — so P-2's fix doesn't trigger; supabase returns "Failed to fetch" verbatim.
  - **Corrected test sequence for next session:** (1) sign in normally with WiFi ON (network works → SetupScreen renders → ProjectPicker fetches projects via authedFetch successfully → cached session is established); (2) turn OFF WiFi (stay signed in); (3) close popup, then re-open it (popup's `ProjectPicker` re-fetches via `authedFetch` on mount → P-2 converts the `TypeError` to `PlosApiError(0, 'Network unreachable — check your connection.')`); (4) `ProjectPicker` prepends "Couldn't load your projects (0): " to the error.message → expected red error box reads approximately **"Couldn't load your projects (0): Network unreachable — check your connection."**.
  - **DEFERRED registered as TaskCreate task #6** per Rule 26 — closes only when a future session walks the corrected sequence on vklf.com + the friendly error message is confirmed in the red error box. If a future session sees "Failed to fetch" still appearing with the corrected sequence, P-2 has a real code bug (likely in `mapFetchTransportError` signature or in `ProjectPicker.tsx:31-35` error.message extraction).

- **Mid-session director-side correction on Walmart platform-switch (verification-spec gap captured to CORRECTIONS_LOG):**
  - **What director observed:** after switching popup from Amazon → Walmart and navigating to Walmart, neither Highlight Terms nor the floating "+" icon appeared. chrome://extensions Errors panel showed zero new errors.
  - **Diagnosis (verified via code-read):** `extensions/competition-scraping/src/lib/content-script/orchestrator.ts:78-81` reads `selectedPlatform` from popup-state ONCE on page load. If user switches the popup's platform AFTER the page is already loaded, the running content script doesn't re-read — orchestrator's gate-check at line 102-107 (verify hostname matches selected-platform's module) silently bails out (no errors, no UI). The page needs a refresh to re-read the new platform setting.
  - **Director refreshed Walmart → Highlight Terms + "+" icon both appeared immediately.** All P-9 + P-10 Walmart steps passed after that.
  - **Verification-spec gap:** the Polish session #8 spec said "switch the popup to the right platform before each navigation" but didn't explicitly call out "AND refresh the page after switching the popup's platform if you have a page already open." Captured as CORRECTIONS_LOG entry; spec body should be updated in the next polish-spec session.

- **Three CORRECTIONS_LOG entries this session:**
  - **(a) Polish session #8 didn't pull main into W#2 first → caused today's divergence.** Process gap. Structural fix proposed: extend `MULTI_WORKFLOW_PROTOCOL §4` to require pulling main into feature branches when main has advanced (e.g., after a deploy session). Today's session is W#2 deploy work, not protocol-design work; the protocol update lands in a future session.
  - **(b) P-2 verification spec design conflated supabase-auth fetch with `authedFetch` fetch paths.** Spec-design gap. Today exercised the wrong layer — a future session needs the corrected sequence (above).
  - **(c) Verification spec for P-9 + P-10 didn't call out the refresh-after-platform-switch requirement.** Spec-design gap. Today director hit silent gate-check rejection on first Walmart attempt; a future polish-spec update should add the refresh requirement.

- **Schema-change-in-flight stays "No" throughout this session.** No schema work today (today is rebase + deploy + browser-verify + doc-batch only). PLOS uses one shared Supabase DB; schema state was already aligned with main from session #7's `prisma db push`.

- **Multi-workflow per Rule 25:** pull-rebase clean at both checkpoints (session start + before doc-batch commit; both no-ops since no other concurrent work). W#1 row untouched per Rule 3 ownership. W#2 row updated.

- **TaskList sweep at end-of-session per Rule 26:** 6 session tasks tracked + 5 completed; 1 `DEFERRED:` task open at end-of-session — task #6 (P-2 browser re-verify with corrected test sequence). Per Rule 26 the doc entries that the deferred task points to ARE written this session — ROADMAP polish backlog P-2 status updated + COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md "Polish session #8" P-2 sub-table updated with corrected sequence + this §B entry's "Corrected test sequence" sub-bullet captured. The task itself remains open as the persistent reminder for the next session to actually walk the corrected sequence.

- **Cross-references:** ROADMAP.md header + Active Tools W#2 row Last Session + W#2 polish backlog P-2/P-9/P-10 status updates; CHAT_REGISTRY.md 2026-05-10-c row + Last-updated-in-session line; DOCUMENT_MANIFEST.md header + per-doc flags; COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md "Polish session #8" P-9 + P-10 sub-tables marked PASS + P-2 sub-table updated with corrected sequence; CORRECTIONS_LOG.md 2026-05-10-c three new entries; commits `d2e2115` ext code + `cc843a7` resolved-conflict doc-batch (both pushed to origin/main mid-session per Rule 9 approval); `plos-extension-2026-05-10-c-p2-p9-p10.zip` at repo root (gitignored build artifact).

- **Branch implications:** all session work on `main` (the deploy branch). W#2 branch was rebased + force-pushed to align with main + new code commits. After this session: W#2 = main + 0 (W#2 fully caught up since the merge brought everything onto main). Next W#2 session will start clean from `main`'s state. End-of-session doc-batch commit also lands on `main`. Push pending Rule 9 approval — doc-only push triggers Vercel rebuild but contains zero user-visible code changes (the code from `d2e2115` is already deployed earlier in session).

---

### 2026-05-10-d — W#2 → main deploy session #3 — rebase + ff-merge of polish session #9 doc-batch onto main + P-9 + P-10 ✅ RE-CONFIRMED BROWSER-VERIFIED on vklf.com (ALL 19 STEPS PASSED)

**Session ID:** `session_2026-05-10-d_w2-main-deploy-session-3-and-p9-p10-reverify-on-vklf` (Claude Code, Seventy-first Claude Code session). Cross-workflow / platform-wide deploy work on `main` per `MULTI_WORKFLOW_PROTOCOL.md §11.1`. Closes ROADMAP Active Tools W#2 row item (a.7) RECOMMENDED-NEXT (added by polish session #9's `2c1c736` to bring its P-2 verified docs onto main).

- **Same divergence pattern as 2026-05-10-c session #2.** Polish session #9 (on `workflow-2-competition-scraping`) didn't pull main's two newer commits (`79ab26d` deploy session #2 doc-batch + `af9537b` addendum) before adding its own commit (`2c1c736`). When today's session checked, workflow-2 (local) was at `2c1c736` and main was at `af9537b` — common ancestor `cc843a7`, both branches one commit ahead. ff-only merge from workflow-2 to main was blocked. Captured as a recurring instance of CORRECTIONS_LOG 2026-05-10-c entry #1 (the structural fix to extend `MULTI_WORKFLOW_PROTOCOL §4` is still pending implementation). Today's W#2 polish session #10 launch prompt embedded a manual mitigation: "git merge --ff-only origin/main" right after the branch checkout, before any new commits land — closes the gap until the protocol fix ships.

- **Reconciliation per director-picked Option A (recommended) — same proven sequence as 2026-05-10-c session #2:**
  1. `git checkout workflow-2-competition-scraping` (1 commit ahead of origin)
  2. `git rebase main` → 4 doc conflicts surfaced: `docs/CHAT_REGISTRY.md` + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (2 regions) + `docs/DOCUMENT_MANIFEST.md` + `docs/ROADMAP.md` (3 regions: header, W#2 row, polish backlog header, P-2 entry). Conflicts resolved mechanically — preserved both sessions' content with polish-session-9 as "Last updated" and deploy-session-2 demoted to "Previously updated". `docs/COMPETITION_SCRAPING_DESIGN.md` had NO conflict (workflow-2 hadn't touched it; main's 79ab26d's §B entry flowed through cleanly via auto-merge).
  3. W#2 row in ROADMAP.md merged via Python script (extracted both sides' rows by 1-indexed line; took incoming side's row as base since it has the most current (a.5) item + the right (a.7) for today; inserted HEAD's deploy-session-#2 Last Session entry between polish session #9's prepended entry and the prior shared "2026-05-10-b w2-polish-session-8-p2-p9-p10-bundle" history; preserved row's `| No |` ending — schema-flight column intact).
  4. `git rebase --continue` → produced new commit `d86be9f` on workflow-2 (rebased polish session #9's content + the conflict resolutions).
  5. `git push --force-with-lease origin workflow-2-competition-scraping` (`cc843a7` → `d86be9f`; old commit `2c1c736` dangles on GitHub for ~30 days).
  6. `git checkout main && git pull --rebase origin main` (clean — no new commits on origin/main since session start).
  7. `git merge --ff-only workflow-2-competition-scraping` (1 commit ahead). Local main now at `d86be9f`.
  8. `git push origin main` (`af9537b` → `d86be9f`). Vercel auto-redeploy triggered.

- **One new commit on main: `d86be9f` (rebased polish session #9 doc-batch — doc-only +25/-15 across 4 files).** No extension code change since `d2e2115` (deployed in session #2). The commit author + commit message preserved from polish session #9 by the rebase (per git default behavior — "End-of-session doc batch — 2026-05-10-c W#2 polish session #9 — P-2 BROWSER-VERIFIED on local extension build" is `d86be9f`'s subject).

- **Extension rebuilt + zipped for sideload:** `npx wxt build` again hit the epoll_wait hang post-completion (known WXT quirk per 2026-05-10-b CORRECTIONS_LOG); killed via `pkill -f wxt` after ~6s — artifacts intact on disk at `extensions/competition-scraping/.output/chrome-mv3/` totaling 656 KB (matches polish session #8 baseline `638.82 kB` within block-counting overhead since extension code is byte-identical — no source changes since `d2e2115`). Copied to uniquely-named directory `plos-extension-2026-05-10-d-w2-deploy-3` and zipped to `plos-extension-2026-05-10-d-w2-deploy-3.zip` at repo root, 174 KB. Unique-named filename per the Codespace-zip-cache lesson from 2026-05-10-b CORRECTIONS_LOG.

- **P-9 verification — ALL 9 STEPS PASSED on vklf.com (re-confirmation after fresh sideload + rebase-merge):** same expected results as 2026-05-10-c session #2, same actual results today — no regression. Director walked all 9 steps after Vercel "Ready" + sideload + sign-in + project picked. Detailed step list embedded in the session's verification-walk message: P9-1 + P9-2 (Ebay search + listing detail — Highlight Terms appear on previously-blocked ~1.5MB / ~1.58MB pages); P9-3 + P9-5 (chrome://extensions Errors panel post-Ebay + post-Walmart — zero new "exceeds highlight cap" entries); P9-4 (Walmart search heavy-SPA ~636-675KB — Highlight Terms appear + page does NOT freeze); P9-6 (soft 50-term-count cap — console warning fires when terms exceed 50); P9-7 + P9-8 (Amazon + Etsy spot-checks — no regression); P9-9 (live-edit on Walmart — propagates within ~1-2s).

- **P-10 verification — ALL 10 STEPS PASSED on vklf.com (re-confirmation):** same expected vs. actual as 2026-05-10-c session #2 — no regression. P10-1 (direct paste of saved Walmart URL — banner within ~1s + auto-dismiss after 5s); P10-2 + P10-3 (Walmart SPA-navigation 5/5 reliability across different saved products); P10-4 (unsaved suppresses correctly); P10-5 (unsaved → saved navigation re-fires); P10-6 (refresh re-fires); P10-7 (manual × dismiss + stay-on-URL correctly suppresses re-fire); P10-8 + P10-9 + P10-10 (Amazon + Ebay + Etsy spot-checks — no regression).

- **P-2 doc updates flowed onto main via the merge.** Polish session #9 (`2c1c736`'s now-rebased version `d86be9f`) had verified P-2 BROWSER-VERIFIED on local extension build via the corrected sequence. Today's merge brought those doc updates onto main. Per byte-identical-bundle reasoning, P-2 is fully verified — `mapFetchTransportError` code path is in extension JS that runs identically regardless of vklf.com vs local (fetch URL `https://vklf.com/api/...` and offline TypeError → PlosApiError mapping happens client-side; no server-side dependency). vklf.com re-verify of P-2 is formally optional belt-and-suspenders confirmation; today's session didn't walk it because (a) launch prompt explicitly scoped today to P-9 + P-10 re-verify only, (b) byte-identical-bundle reasoning makes vklf.com re-verify functionally redundant for extension-only changes, (c) director can fold it into a future polish session if they want it for completeness.

- **Smooth session — zero new CORRECTIONS_LOG entries.** Three lessons reinforced from prior sessions (no need to re-capture; existing entries cover them):
  - **(a) Branch recommendation correctly followed addendum's branch-rule cheat sheet.** `af9537b`'s addendum to CORRECTIONS_LOG 2026-05-10-c entry #4 had captured: "code build → feature branch; deploy → main; browser-verify → feature branch; cross-workflow infra → main." Today's session is a deploy session → on `main` ✅. Director's launch prompt explicitly named the protocol section and required branch verification at session start — Claude verified `git branch --show-current` returned `main` before any heavy doc reads.
  - **(b) Test sequences for P-9 + P-10 included the platform-switch-refresh callout.** CORRECTIONS_LOG 2026-05-10-c entry #3 captured the platform-switch refresh requirement (orchestrator reads `selectedPlatform` once on page load; needs refresh after popup-side platform switch). Today's verification-walk message embedded "REFRESH the test page" instruction at every platform-switch step. Director didn't hit the silent gate-check rejection that surfaced in session #2.
  - **(c) Rebase-then-ff pattern works smoothly when applied prophylactically.** Same divergence pattern hit twice in 24 hours (sessions #2 + #3); both times director-picked Option A (rebase + ff) reconciled cleanly with mechanical conflict resolution. The pattern is proven; the structural fix to prevent the divergence in the first place is still pending in `MULTI_WORKFLOW_PROTOCOL §4`.

- **Schema-change-in-flight stays "No" throughout this session.** No schema work today (today is rebase + deploy + browser-verify + doc-batch only). PLOS uses one shared Supabase DB; schema state was already aligned with main from session #7's `prisma db push`.

- **Multi-workflow per Rule 25:** pull-rebase clean at both checkpoints (session start + before doc-batch commit; both no-ops since no other concurrent work). W#1 row untouched per Rule 3 ownership. W#2 row updated.

- **TaskList sweep at end-of-session per Rule 26:** 8 session tasks tracked + completed (drift check + go-ahead; rebase workflow-2; force-push; ff-merge + push; build + zip extension; P-9 verify; P-10 verify; end-of-session doc batch). Zero `DEFERRED:`-prefixed tasks at any point.

- **Cross-references:** ROADMAP.md header + Active Tools W#2 row Last Session + (a.7) DONE + (a.8) RECOMMENDED-NEXT + W#2 polish backlog header re-confirm + "Stays open" line drops P-2; CHAT_REGISTRY.md 2026-05-10-d row + Last-updated-in-session line; DOCUMENT_MANIFEST.md header + per-doc flags; COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md "Polish session #8" header marked ✅ COMPLETE 2026-05-10-d + P-9 + P-10 sub-tables get re-confirm annotations + P-2 sub-table updated to fully-verified; commits `d86be9f` rebased polish session #9 doc-batch (already pushed to origin/main mid-session per Rule 9 approval) + this end-of-session doc-batch; `plos-extension-2026-05-10-d-w2-deploy-3.zip` at repo root (gitignored build artifact for director sideload).

- **Branch implications:** all session work on `main` (the deploy branch). W#2 branch was rebased + force-pushed to align with main; main fast-forwarded to absorb the rebased commit. After this session: W#2 = main + 0 (W#2 fully caught up since the merge brought everything onto main). Next W#2 session will start clean from `main`'s state but MUST run `git merge --ff-only origin/main` immediately after `git checkout workflow-2-competition-scraping && git pull --rebase origin workflow-2-competition-scraping` to absorb today's `d86be9f` deploy doc-batch BEFORE adding new commits — closes the recurring divergence gap manually. End-of-session doc-batch commit also lands on `main`. Push pending Rule 9 approval — doc-only push triggers Vercel rebuild but contains zero user-visible code changes.

---

### 2026-05-10-e — W#2 polish session #10 — P-3 broader scope (selectedProjectId + selectedPlatform server-side persistence) ✅ SHIPPED at code level on `workflow-2-competition-scraping`

**2026-05-10-e — session_2026-05-10-e_w2-polish-session-10-p3-broader-scope-server-side (Claude Code, twenty-second W#2 session — code commit `49d396e` pushed to `workflow-2-competition-scraping`; W#2 → main merge + cross-device browser-verify on vklf.com pending future deploy session)**

- **Director's directive (initial — from launch prompt):** *"W#2 polish session #10 — implement remaining P-3 broader scope (selectedProjectId + selectedPlatform server-side persistence) per ROADMAP polish backlog P-3 entry 'REMAINING P-3 scope (open for future session)' + ROADMAP Active Tools W#2 row (a.6) standing item + director's standing principle 'no matter where the user logs in, they can pick up where they left off' captured 2026-05-08-c. Schema-change-in-flight session — flips flag Yes during build then back to No after `prisma db push` lands. Mandatory first action: Rule 18 mid-build directive Read-It-Back to surface the schema-shape decision (single `UserExtensionState` table with two scalar columns vs. two separate tables vs. JSON column) BEFORE coding."*

- **Schema-shape Read-It-Back at drift check (Rule 18, mandatory before any code):** Claude surfaced THREE storage options with full per-option context plus a fourth-ish semantic-change option (per-project last-platform memory) flagged in the prose:
  - **Option 1** — single new `UserExtensionState` record-type with two scalar columns per user (RECOMMENDED). Preserves today's chrome.storage.local behavior 1:1 — switching projects still clears platform. Cross-device-restore: pick Project + Platform on laptop 1, sign in on laptop 2, same picks already selected. Smallest blast radius; mirrors last week's Highlight Terms decision (dedicated record-type over generic `UserPreference` bucket).
  - **Option 2** — two record-types (one for last-picked Project per user; second per-(user, project) for last-picked Platform). Richer behavior: each project remembers its own last-picked platform; switching to Project A restores Amazon, switching to B restores Walmart, switching back to A restores Amazon. **Behavior CHANGE** from today's "clear platform on project switch."
  - **Option 3** — one packed-together JSON blob column. Flexible but harder to query / type-enforce / evolve. Rejected for similar reasons in last week's Highlight Terms decision (Shape B).
  - **Option 4 (escape hatch)** — "I have a question first that I need clarified."
  - Rationale for recommending Option 1 over Option 2: launch prompt's literal scope was "preserve today's selectedProjectId + selectedPlatform globally" — Option 2's per-project semantic was distinct from "move today's storage to server." If director wanted the richer UX, that should be a deliberate decision not smuggled into a storage move. **Director picked Option 1** via Rule 14f forced-picker.

- **Implementation-plan Read-It-Back at drift check (Rule 18, second mandatory step):** Claude wrote the full plan in plain language covering 9 sections:
  1. New `UserExtensionState` record-type schema (`id @default(uuid)` + `userId @unique` + `selectedProjectId String?` + `selectedPlatform String?` + `updatedAt @updatedAt` + `@@index([userId])`).
  2. New API endpoint `/api/extension-state` (GET + PUT + OPTIONS) — top-level user-scoped (NOT under `/api/projects/[projectId]/extension-state` because selectedProjectId IS the projectId; matches existing `/api/user-preferences/[key]` pattern). `verifyAuth` (NOT `verifyProjectAuth`). Server enforces refined "switching project clears platform" invariant on PUT (see Rule-15 autonomous picks below for the refinement). Stale-pointer cleanup on GET (silently returns null for selectedProjectId if the project was deleted). Project-ownership double-check on PUT for non-null selectedProjectId.
  3. New shared types in `src/lib/shared-types/competition-scraping.ts` (ExtensionStateDto + GetExtensionStateResponse + ReplaceExtensionStateRequest + ReplaceExtensionStateResponse).
  4. New `extensions/competition-scraping/src/lib/extension-state-sync.ts` orchestrator module mirroring the highlight-terms-sync.ts pattern — DI seam, `loadExtensionState` (server-first + cache-fallback + one-time auto-migrate), `saveExtensionState` (server-first then mirror to cache).
  5. Extension popup `App.tsx` switch from direct `getSelectedProjectId/Platform` reads to `loadExtensionState`; from direct `setSelectedProject/Platform` writes to `saveExtensionState`. Optimistic update + rollback on failure pattern.
  6. **Content-script orchestrator UNCHANGED** — content scripts can't reach vklf.com directly per CORS allowlist (`chrome-extension://*` only); the api-bridge is reserved for URL-recognition flows. The mirror-cache pattern is what makes this work — popup writes server first, then mirrors locally; orchestrator reads the mirror; `chrome.storage.onChanged` fires when popup edits land.
  7. New extStateSyncWarning + extStateSaveError UI surfaces above the picker pair in popup (matches last week's Highlight Terms pattern).
  8. Verification surface: extension compile + tests + build + eslint; root tsc + tests + build + eslint baseline parity.
  9. Cross-device verification path deferred to next W#2 → main deploy session (the canonical proof of correctness — same shape as P-3 narrowed Highlight Terms 2026-05-10-b).
  Director approved + granted standing-approvals for both push-when-clean and immediate `prisma db push` via three Rule 14f forced-pickers.

- **Rule-15 autonomous picks (no user-visible difference):**
  - **Auth helper = `verifyAuth` (NOT `verifyProjectAuth`).** Extension state is user-scoped; selectedProjectId IS itself a projectId so there's no parent project for it. When the request body's selectedProjectId is non-null, the API additionally verifies the user owns that project — defense-in-depth against malicious or buggy clients saving someone else's id.
  - **API path = `/api/extension-state` (top-level, NOT under `/api/projects/[projectId]/...`).** Matches existing `/api/user-preferences/[key]` pattern; cleaner data model (the parent path can't be a projectId because the value IS the projectId).
  - **PUT semantics over PATCH:** body always includes both fields explicitly (null = clear). Mirrors last week's Highlight Terms PUT-replace-whole-state pattern.
  - **Server-side refined "switching project clears platform" invariant.** Initial draft cleared platform whenever prior projectId differed from incoming. This was too aggressive — it broke the migration case (server empty + cache has both → "incoming differs from prior null" → clear → migration would lose platform). Refined rule: clear platform only when (a) incoming projectId is null, OR (b) prior projectId is non-null AND differs from incoming. Auto-migration case preserved (prior is null, so no "switch" to trigger clear). Caught by the auto-migration unit test on first `npm test` run; refined route + sync helper docstring + test fake server in same session before commit. Same end-to-end semantics as today's chrome.storage.local rule (`popup-state.ts:setSelectedProject` clears platform when prior is non-null AND different).
  - **Sync-helper dependency-injection seam (`ExtensionStateSyncDeps`).** Same pattern as `HighlightTermsSyncDeps` — orchestration logic testable without mocking Supabase auth + fetch + chrome.storage.local globals.
  - **Mirror-cache I/O as separate functions on popup-state.ts (`getExtensionStateCache` + `setExtensionStateCache`).** Writes both keys directly without re-applying the project-switch-clear logic — server already applied the canonical invariant; the cache mirror writes the canonical post-write state. Existing `setSelectedProject` / `setSelectedPlatform` retained (still useful as a local-write API surface, e.g. for offline fallback paths).
  - **Optimistic update + rollback on save failure in popup.** Mirrors last week's Highlight Terms pattern. State updates immediately on user click; PUT fires; on success state advances to server's canonical view (server may apply the invariant); on failure state rolls back to prior + inline error renders.
  - **Two distinct UI surfaces above the picker pair:** extStateSyncWarning (load-fallback informational; muted-help styling) + extStateSaveError (save-failure alert; error styling). Two distinct surfaces because they cover different failure modes (load offline vs. save offline) and clearing one shouldn't auto-clear the other. Successful save clears stale sync-warning since a successful PUT proves the server is reachable.

- **What was decided + shipped:** 8 files changed (+1092/-28); single commit `49d396e` on `workflow-2-competition-scraping`. New: `prisma/schema.prisma` adds UserExtensionState model; `src/app/api/extension-state/route.ts` (new GET + PUT + OPTIONS); `src/lib/shared-types/competition-scraping.ts` adds ExtensionStateDto + GetExtensionStateResponse + ReplaceExtensionStateRequest + ReplaceExtensionStateResponse; `extensions/competition-scraping/src/lib/api-client.ts` adds getExtensionState + replaceExtensionState; `extensions/competition-scraping/src/lib/extension-state-sync.ts` (new orchestrator with DI seam); `extensions/competition-scraping/src/lib/extension-state-sync.test.ts` (13 new tests). Modified: `extensions/competition-scraping/src/entrypoints/popup/App.tsx` (sync helpers wired + new UI surfaces); `extensions/competition-scraping/src/lib/popup-state.ts` (header docstring + new mirror-cache I/O functions).

- **Schema push:** `npx prisma db push` succeeded against prod in 1.16s (additive — new table only; no existing table touched). Schema-change-in-flight flag flipped Yes during build, back to No after push completed. PLOS uses one shared Supabase DB for dev + prod, so the new table landed in the production DB at push time. Safe — additive change; pre-broader-P-3 code on main simply doesn't read/write the new table; the new code uses it only after W#2 → main merge ships.

- **Verification scoreboard:**
  - Extension `npm run compile` clean (zero errors).
  - Extension `npm test`: **233/233 pass** (was 220/220 — 13 new sync tests added).
  - Extension `npm run build`: clean; **641.42 kB total** (popup-DLEZzAlj.js 404.28 kB; background.js 202.26 kB; content.js 30.16 kB; popup-D_aALNcA.css 3.58 kB).
  - Extension `npx eslint extensions/competition-scraping/src` (run from root): **clean — zero errors / zero warnings.**
  - Root `npx tsc --noEmit`: clean.
  - Root `npm run build`: clean — **51 routes** (was 50; new `/api/extension-state`).
  - Root `node --test --experimental-strip-types $(find src/lib -name '*.test.ts')`: **393/393 pass** — exact baseline parity.
  - Root `npx eslint src`: **52 problems (13 errors, 39 warnings)** — exact baseline parity (one transient `prefer-const` error from my route fixed within the same session before commit).

- **Browser verification:** NOT YET — code lives on `workflow-2-competition-scraping` only; not on `main`; not on vklf.com. Director will walk through after a future W#2 → main deploy session per (a.9) RECOMMENDED-NEXT in the W#2 row Next Session cell. Verification path when it happens (cross-device proof of correctness — same shape as P-3 narrowed Highlight Terms 2026-05-10-b): (a) install/reload extension on laptop 1; (b) sign in; (c) pick Project + Platform; (d) close popup; (e) sign in from a different Chrome profile / different laptop; (f) confirm same Project + Platform appear already-selected (the canonical proof of server-side persistence).

- **Multi-workflow per Rule 25:** Pull-rebase clean at session start (workflow-2 branch up to date with origin). Schema-change-in-flight stayed "No" both rows entering session; flipped W#2's to "Yes" at start of `prisma db push` step, back to "No" after push succeeded. No parallel chat. W#1 row untouched per Rule 3 ownership; zero cross-workflow edits. Pre-commit pull-rebase: workflow-2 branch had no remote new commits (origin was 0 ahead) — no rebase needed. The pre-existing 1-commit-ahead state from yesterday's `07abf09` (which lives on `main`, not `workflow-2`; the branches were not in true ahead-state) cleared up at push time as branch caught up.

- **TaskList sweep at end-of-session per Rule 26:** 14 session tasks tracked + completed (4 main-session: drift check + Read-It-Back + implement + end-of-session doc batch; 10 implementation sub-tasks: prisma schema edit + db push + shared types + API route + api-client functions + sync helper + popup wiring + popup-state docstring + verification + commit-push). **Zero `DEFERRED:`-prefixed tasks at any point.** Out-of-scope items declared explicitly in the implementation Read-It-Back (per-project last-platform memory; FK-declared relations; additional state items beyond the two named; live-updating popup state when state changes from a different device; richer audit/timestamp columns) were **not deferred** — director didn't want them in scope today and they're not load-bearing for the broader-P-3 polish goal.

- **Affected sections:** §A.7 Module 1 (URL capture flow + Project + Platform pickers in popup) — the picker pair now persists server-side; cross-device + cross-Chrome-profile behavior is now "your last picks come with you." §A is frozen per Rule 18; this §B entry serves as the operational-evolution log. **NEW data-flow surface — server-authoritative extension state storage:** popup writes server first, then mirrors to chrome.storage.local; content-script orchestrator reads chrome.storage.local on every page load (its mode of operation unchanged from before P-3 broader). Affects §A.12 Data persistence (`selectedProjectId` + `selectedPlatform` in chrome.storage.local were authoritative; now per-installation cache mirrors; PLOS DB `UserExtensionState` is authoritative).

- **Cross-references:** `prisma/schema.prisma` UserExtensionState model; `src/app/api/extension-state/route.ts` (GET + PUT + OPTIONS); `src/lib/shared-types/competition-scraping.ts` (ExtensionStateDto + GetExtensionStateResponse + ReplaceExtensionStateRequest + ReplaceExtensionStateResponse); `extensions/competition-scraping/src/lib/extension-state-sync.ts` + `.test.ts`; `extensions/competition-scraping/src/lib/api-client.ts` (getExtensionState + replaceExtensionState); `extensions/competition-scraping/src/entrypoints/popup/App.tsx` SetupScreen (load/save wiring + sync-warning + save-error UI); `extensions/competition-scraping/src/lib/popup-state.ts` (mirror-cache role documented + new getExtensionStateCache + setExtensionStateCache); ROADMAP.md W#2 polish backlog P-3 entry status update + Active Tools (a.6) flipped to ✅ DONE + new (a.9) RECOMMENDED-NEXT for the W#2 → main deploy session; CHAT_REGISTRY.md 2026-05-10-e row.

- **Branch implications:** Code commit `49d396e` pushed to `workflow-2-competition-scraping` per session-start standing approval. **NOT on `main` yet; NOT deployed to vklf.com.** Director's call when to schedule the W#2 → main merge to deploy. Until then, vklf.com runs the prior code (P-3 narrowed Highlight Terms + the prior polish + popover fix from 2026-05-09-b); the new `UserExtensionState` table sits idle in prod (no writers / no readers from main code). End-of-session doc-batch commit lands on `workflow-2-competition-scraping` (covers session work that happened entirely on this branch). Push of doc-batch commit pending Rule 9 approval — push to W#2 branch does NOT deploy vklf.com regardless. Per the recurring divergence pattern from sessions #2 + #3, the next W#2 → main deploy session MUST run `git fetch origin && git log main..origin/workflow-2-competition-scraping --oneline` first to confirm exactly which commits will flow onto main, then ff-only merge if main is clean ahead of W#2; otherwise rebase + force-push pattern (same reconciliation as 2026-05-10-c session #2 + 2026-05-10-d session #3).

---

### 2026-05-10-f — W#2 → main deploy session #4 (P-3 broader scope ✅ DEPLOYED) + P-1 silent token refresh ✅ SHIPPED at code level on `workflow-2-competition-scraping`

**Session:** session_2026-05-10-f_w2-main-deploy-session-4-and-p-1-shipped (Claude Code; started on `main` for the deploy, switched to `workflow-2-competition-scraping` mid-session for the P-1 ship). Seventy-third Claude Code session.

**Two-phase session.**

**Phase 1 — Deploy of P-3 broader scope.** ff-only merge of `workflow-2-competition-scraping` commits `49d396e` (P-3 broader scope code from session #10) + `cd637f7` (session #10 doc-batch) onto `main` succeeded clean — `main` was at `07abf09` and W#2 had advanced cleanly past it without divergence (no rebase or force-push needed; same shape as 2026-05-10-b deploy session #1). Pushed to `origin/main` → Vercel auto-redeployed in ~60-90s. Verified `/api/extension-state` route is live by curl: returned 401 with `{"error":"Missing or invalid Authorization header"}` confirming the route exists and the auth-gate works (4xx-without-deployed-route would be 404; production-redirect from apex `vklf.com` → `www.vklf.com` is at the Vercel edge level). Fresh extension build (`extensions/competition-scraping/`) packaged at `plos-extension-2026-05-10-e-w2-deploy-4.zip` (174 KB; gitignored) for sideload at the next verification session.

**P3B-1..P3B-11 cross-device browser verification of P-3 broader scope DEFERRED mid-session at director's request.** Director said *"I want to defer all these tests for now. What should we work on next?"* after Claude prepared the full P3B sub-table walkthrough. Captured per Rule 14e + Rule 26: destination is the existing `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Polish session #10" sub-table (still PENDING) + ROADMAP Active Tools W#2 row (a.9) flipped to ✅ DEPLOY DONE + VERIFICATION DEFERRED + new (a.10) RECOMMENDED-NEXT for combined deploy session #5 (brings P-1 to main) + walk through deferred P3B verification simultaneously. TaskCreate `DEFERRED:` task created mid-session, closed at end-of-session when destination annotations landed.

**Phase 2 — P-1 silent token refresh shipped.** After deferral, director asked *"What should we work on next?"* and Claude offered a Rule 14f forced-picker with three real options (P-1 silent token refresh on W#2 branch / W#2 doc cleanup / wrap session early) plus the escape hatch. Director picked P-1 — the only open W#2 polish item since 2026-05-08-b. Branch-switched from `main` to `workflow-2-competition-scraping` per CORRECTIONS_LOG 2026-05-10-c entry #4 cheat-sheet (a). Main and W#2 were at the same commit (`cd637f7`) so the branch switch was a clean checkout — no rebase needed.

**P-1 Read-It-Back per Rule 18:** Claude wrote the full implementation plan in plain language covering: where the fix lives (single file `src/lib/authFetch.ts` — 28 LOC → ~70 LOC; one wrapper used by 76 call sites across 14 files: `/projects`, project detail, keyword-clustering, competition-scraping, AdminNotes, all the `useKeywords`/`useCanvas` hooks); the new behavior (read session unchanged → first fetch unchanged → if 401: silently call `supabase.auth.refreshSession()` → if refresh succeeded with new access_token: rebuild headers + re-fire fetch ONCE → if refresh failed: see failure-path question); what's NOT changing (Supabase client setup; the 76 call sites; non-401 paths; no-session-at-all throw); test coverage (new `src/lib/authFetch.test.ts` with 7 cases via `node:test` + `node:assert/strict`); verification gates; commit + push plan; Rule 15 autonomous picks (refresh-failure due to network-offline gets same treatment as expired refresh token).

**Failure-path forced-picker per Rule 14f:** Director picked **Option (a) — return the 401 as-is, no redirect** when refresh ALSO fails (the rare 1-week-away case). When refresh fails, the wrapper just returns the original 401 response to the caller; the caller's existing error handler surfaces the familiar "Could not load Projects (401): Invalid or expired token" message in the UI. Rationale: zero changes to any of the 76 call sites; easy to test; no global navigation side-effect from a low-level fetch wrapper. The alternative (hard-redirect to sign-in via `window.location.replace('/')`) was offered but not picked because of the global-navigation-side-effect concern.

**Implementation:** `src/lib/authFetch.ts` refactored to a tested factory shape — new `makeAuthFetch({supabase, fetchFn})` factory accepts deps for unit-test substitution; production export `authFetch` is bound via lazy initialization to a Supabase singleton + global `fetch`. **Lazy init was required** because the Node test runner imports `authFetch.ts` without `NEXT_PUBLIC_SUPABASE_URL` set in env, and an eager `createClient()` at module scope crashed the test process on first attempt. Single commit `d715cde` on `workflow-2-competition-scraping`; pushed to origin (does NOT redeploy vklf.com — only push-to-main does).

**Verification scoreboard:** `node --test --experimental-strip-types $(find src/lib -name '*.test.ts')` reports **400/400 src/lib tests pass** (was 393; +7 authFetch tests). `npx tsc --noEmit` clean. `npm run build` clean (51 routes; same as session #10). `npx eslint src/lib/authFetch.ts src/lib/authFetch.test.ts` clean (zero errors / zero warnings on the changed files). Project-wide `npx eslint src` reports **52 problems (13 errors, 39 warnings)** — exact baseline parity with session #10. **Browser verification:** NOT YET — code on `workflow-2-competition-scraping` only; not on `main`; not on vklf.com. Director will discover the fix passively the next time they come back to vklf.com after >1 hour, OR can verify via the next deploy session #5 (per (a.10) RECOMMENDED-NEXT).

**Operational note (informational):** the extension `npm run build` (`wxt build`) ran for ~9 minutes during the deploy phase before being killed — chrome-mv3 output files were complete after ~10s with sizes matching expected 641 kB ext bundle from session #10, but the wxt parent process never exited cleanly. Force-kill produced the same artifacts. Captured in `CORRECTIONS_LOG.md` 2026-05-10-f as INFORMATIONAL.

**Multi-Workflow per Rule 25:** `git fetch origin` + `git pull --rebase` clean at session start AND before each commit. Branch-switch from `main` → `workflow-2-competition-scraping` happened only AFTER deploy phase + verification defer + director's pivot decision; W#1 row untouched per Rule 3 ownership; no parallel chat; schema-change-in-flight stays "No" — today ships pure code at the wrapper layer with no schema changes (the UserExtensionState table from session #10 remained in prod unchanged).

**TaskList sweep at end-of-session per Rule 26:** 11 tasks tracked through the session. 1 `DEFERRED:` task created mid-session for the P3B verification, closed at end-of-session when destination annotations landed. **Zero open `DEFERRED:` tasks** at end-of-session per Rule 26.

**Cross-references:** `src/lib/authFetch.ts` (the factory + production export); `src/lib/authFetch.test.ts` (7 tests); ROADMAP Active Tools W#2 row Last Session 2026-05-10-f entry + (a.9)/(a.10) Next Session items; ROADMAP polish backlog P-1 entry (flipped to ✅ SHIPPED at code level); `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` Polish session #10 sub-table (deploy-#4 deferred-verification annotation) + new "Polish session #11" P-1 section; CORRECTIONS_LOG 2026-05-10-f INFORMATIONAL entry on extension `wxt build` 9-min hang.

---

**2026-05-11-b — session_2026-05-11-b_w2-extension-session-4-module-2-text-capture**

**Session:** session_2026-05-11-b_w2-extension-session-4-module-2-text-capture (Claude Code; on `workflow-2-competition-scraping`). Seventy-fifth Claude Code session.

**Director's directive (initial — from launch prompt):** today's task was the P3B-1..P3B-11 cross-device verification of P-3 broader scope. Director pivoted mid-drift-check to a coding-with-deferred-testing mode: *"Rather than perform testing. Just tell me what testing needs to be performed in a general sense. I may defer the testing till the very end and just want you to keep coding and updating the code while giving me the option to test or defer the test till the end and keep coding"*. Verification queue tally surfaced (P3B + P1V); director picked Module 2 text-capture build as the next coding item after Claude's mistaken P-6 recommendation was corrected (P-6 shipped 2026-05-09-b).

**Pre-code mistake captured (Rule 10 + Rule 24):** Claude recommended P-6 (Sponsored Ad checkbox) as the next-coding item without first verifying P-6 was actually open. Single-grep of `prisma/schema.prisma` + `url-add-form.ts` would have surfaced that `isSponsoredAd` + the checkbox UI were both already in place from 2026-05-09-b. Logged as CORRECTIONS_LOG 2026-05-11-b entry (synthesis-from-stale-grep failure mode — same root as 2026-04-27 Rule 24 origin entry).

**Rule 14f sub-decisions before any code (text-capture gesture + tags input):**

1. **Text-add gesture shape** — director picked **Option A "right-click context-menu only"** (recommended).
   - Option A "right-click context-menu only" (RECOMMENDED + chosen) — single discoverable surface for new workers; zero key-chord collision risk with host-page bindings (Amazon/Walmart each bind their own); ship surface area minimized.
   - Option B "keyboard shortcut only" — fast for power users but undiscoverable + risk of collision with host-page bindings.
   - Option C "both" — double the surface to test/maintain.
   - Reversible: a keyboard shortcut can be added additively later without breaking the menu path.

2. **Tags input shape** — director picked **Option A "structured chip-list"** (recommended).
   - Option A "structured chip-list" (RECOMMENDED + chosen) — Enter or comma adds a chip; X-on-chip removes; case-insensitive dedup with first-seen-casing preserved; clear visual state vs. ambiguous "is the comma part of this tag or a separator?"
   - Option B "free-text comma-separated" — smaller code surface but ambiguous + less clear visual state.
   - Reversible at any time.

**Scope split explicitly captured (mid-build directive Read-It-Back, Rule 18):** Module 2 at full scope is text capture + image capture + region-screenshot + image upload — multi-hour build. Today's session ships text-capture ONLY (both gestures — highlight-and-add + paste-into-extension). Image-capture path (right-click "Save to PLOS — Image" + two-phase signed-URL upload) + region-screenshot mode deferred to session 5. Rationale per `STACK_DECISIONS.md` §11 line 559 — the original plan had separate Module-1-capture / Module-2-capture / image-upload / offline-queue / polish sessions; we're following that structure.

**Rule 15 autonomous picks noted in commit:**
- The text-capture form's URL picker pre-selects the saved-URL row matching the current page (via `pickInitialUrl`) when one is recognized. Falls back to a "Pick a saved URL…" placeholder. Pattern matches the URL-add form's "trigger-derived initial value" UX from session 3.
- `validateCapturedTextDraft` requires non-empty `contentCategory` at the FORM level (server allows null). Rationale: every captured row is categorized per §A.7 reading + clean filtering on PLOS-side. Server's loose acceptance preserved for future clients (offline queue, manual API callers).
- The popup paste flow lives in the same SetupScreen as Highlight Terms — gated on Project + Platform both being picked. Empty-state rendered when no saved URLs for the current platform yet.
- Backdrop click + Esc + Cancel all close the content-script form without saving — same UX as the URL-add form.

**Files changed this session (extension only — no schema, no API, no Next.js routes):**
- NEW `extensions/competition-scraping/src/lib/captured-text-validation.ts` (~140 LOC).
- NEW `extensions/competition-scraping/src/lib/captured-text-validation.test.ts` (~180 LOC; **19 tests**).
- NEW `extensions/competition-scraping/src/lib/content-script/text-capture-form.ts` (~370 LOC; content-script overlay form).
- NEW `extensions/competition-scraping/src/entrypoints/popup/components/CapturedTextPasteForm.tsx` (~230 LOC; React popup paste flow).
- Modified `extensions/competition-scraping/src/lib/api-client.ts` — `createCapturedText`, `listVocabularyEntries`, `createVocabularyEntry`.
- Modified `extensions/competition-scraping/src/lib/content-script/api-bridge.ts` — same 3 functions via background-proxy for content-script use.
- Modified `extensions/competition-scraping/src/lib/content-script/messaging.ts` — new `open-text-capture-form` content-script push message + 3 new `BackgroundRequest` variants (`create-captured-text`, `list-vocabulary`, `create-vocabulary-entry`).
- Modified `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — listens for `open-text-capture-form`, hands off to the new form.
- Modified `extensions/competition-scraping/src/entrypoints/background.ts` — second context-menu (`'Add to PLOS — Captured Text'` on `contexts: ['selection']`) + handlers for the 3 new request kinds.
- Modified `extensions/competition-scraping/src/lib/content-script/styles.ts` — `.plos-cs-form-select`, `.plos-cs-form-status`, `.plos-cs-form-inline-add`, `.plos-cs-chip-row`, `.plos-cs-chip`, `.plos-cs-chip-remove`.
- Modified `extensions/competition-scraping/src/entrypoints/popup/App.tsx` — renders `<CapturedTextPasteForm>` below Highlight Terms when Project + Platform picked.
- Modified `extensions/competition-scraping/src/entrypoints/popup/style.css` — paste-form section + chip styles.

**API surface used (server-side already exists; no server work this session):**
- `POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/text` (API-routes session 2, 2026-05-07). Idempotent on `clientId`.
- `GET /api/projects/[projectId]/vocabulary?type=content-category` (2026-05-07).
- `POST /api/projects/[projectId]/vocabulary` (2026-05-07; upsert).

**Verification scoreboard:**
- Extension `npx tsc --noEmit` clean.
- Extension `npm test` reports **252/252 pass** (was 233; +19 captured-text-validation tests).
- Extension `npx eslint src` clean — 0 errors / 0 warnings.
- Extension `npx wxt build` — artifacts written successfully at `.output/chrome-mv3/`; parent process hangs at exit per known issue (CORRECTIONS_LOG 2026-05-10-f INFORMATIONAL). Workaround: `pkill -f wxt` after seeing `.output/` populated; artifacts are intact.
- Root `npx tsc --noEmit` clean.
- Root `npm run build` clean (51 routes — exact baseline parity; no new routes since session #11).
- Root `node --test --experimental-strip-types src/lib/**/*.test.ts` reports **400/400 pass** — baseline parity (no root code changes).
- Root `npx eslint src` reports 52 problems (13 errors, 39 warnings) — exact baseline parity.

**Multi-Workflow per Rule 25:** `git fetch origin` + `git pull --rebase origin workflow-2-competition-scraping` clean at session start (`workflow-2-competition-scraping` at `daa4ca8`; `origin/main` at `9a1aacd` from deploy session #5 earlier today). This session's commit lands on `workflow-2-competition-scraping`; doc-only flow-through to `main` happens at the next deploy session (which will also carry the image-capture session 5 code). Per CORRECTIONS_LOG 2026-05-10-c entry #1 PROCESS-quality finding, `main` has advanced 1 commit past this branch's last point — that lesson recommends pulling main into the feature branch before adding new commits when main has advanced. This session's commit DOES advance the feature branch without first absorbing main's doc-only commit — flagged at session start in the drift check; director acknowledged via the "Wrap session 4" pick. The next deploy session will rebase or ff-merge per the now-standard pattern (CORRECTIONS_LOG 2026-05-10-c entries #1 + #4). W#1 row untouched per Rule 3 ownership. Schema-change-in-flight stays No (today is pure code at the extension layer; no DB schema, no API surface change).

**TaskList sweep per Rule 26:** 4 session tasks tracked + completed (start-of-session sequence; P3B walkthrough — set aside in favor of coding-with-deferred-testing per director's pivot; Module 2 text-capture build; end-of-session doc batch). Zero `DEFERRED:` (Rule 26 prefix) tasks at any point. Task #2 (P3B-1..P3B-11 verification) left pending across sessions per the standing deferral — destination doc entry (PENDING sub-table in VERIFICATION_BACKLOG.md Polish session #10) already exists from prior sessions.

**Cross-references:** `extensions/competition-scraping/src/lib/captured-text-validation.ts` + `.test.ts`; `extensions/competition-scraping/src/lib/content-script/text-capture-form.ts`; `extensions/competition-scraping/src/entrypoints/popup/components/CapturedTextPasteForm.tsx`; `extensions/competition-scraping/src/entrypoints/background.ts` (new context-menu); `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` new "Extension build — session 4" S4-A + S4-B + S4-C walkthrough sections; ROADMAP Active Tools W#2 row Last Session 2026-05-11-b entry + new (a.12) RECOMMENDED-NEXT for session 5 image-capture; CORRECTIONS_LOG 2026-05-11-b entry on P-6 stale-grep-synthesis slip.

---

**2026-05-11-b-addendum — Forward directive captured for upcoming sessions (popup two-tab restructure + URL viewer)**

**Captured:** end of `session_2026-05-11-b_w2-extension-session-4-module-2-text-capture` (Claude Code; on `workflow-2-competition-scraping`).

**Context:** at end-of-session, after session 4 text-capture shipped + the doc batch committed, director adjusted the forward plan via the personalized-handoff conversation. Two future-session items captured here so the next session (and the one after) sees them at session-start docs read per Rule 21 pre-interview directive scan.

**Forward directive A — verification-first next session (Path A picked via Rule 14f).**

The next session is a pure browser-verification session on vklf.com covering ALL deferred check sub-tables in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md`:
- **P3B-1..P3B-11** — P-3 broader scope cross-device sign-in test (Polish session #10 sub-table, PENDING since 2026-05-10-e, deferred twice).
- **P1V-1..P1V-3** — P-1 silent token refresh (Polish session #11 sub-table, PENDING since 2026-05-10-f; partly passive).
- **S4-A + S4-B + S4-C** — Extension build session 4 Module 2 text-capture walkthroughs (new section as of this commit).

**Prerequisite:** a fresh extension zip built from commit `b8423ab` (or later if more code has landed) — the existing `plos-extension-2026-05-11-w2-deploy-5.zip` at repo root predates session 4 and lacks the text-capture code. Build via `cd extensions/competition-scraping && npm run build` (apply the wxt-process-hangs-but-artifacts-are-written workaround from CORRECTIONS_LOG 2026-05-10-f INFORMATIONAL — `pkill -f wxt` once `.output/chrome-mv3/` is populated). Zip the artifacts into `plos-extension-2026-05-12-<slug>.zip` at repo root.

**Branch:** verification-only work for W#k (k ≥ 2) belongs on the W#k feature branch per CORRECTIONS_LOG 2026-05-10-c entry #4 cheat-sheet (c) — `workflow-2-competition-scraping`.

**Forward directive B — popup two-tab restructure + URL viewer (session AFTER verification).**

After the verification session lands clean, the session after that adds a new user-facing feature in the extension popup. Captured here so the build session has the spec ready.

**Spec:**

- The popup gets a **two-tab navigation** at the top, switching between two surfaces:
  - **Tab 1 — "Identify Competition"** — contains the existing popup surfaces moved here: ProjectPicker dropdown, PlatformPicker dropdown, HighlightTermsManager (with its color-swatch UI + save flow). No behavior change; just relocation into the tab container.
  - **Tab 2 — "Capture Text & Images"** — contains two stacked surfaces:
    1. **URL viewer** — a scrollable list of every saved CompetitorUrl for the current Project, **across ALL platforms** (director-picked Option A via Rule 14f at session 2026-05-11-b end). Each row shows: URL, platform (label or icon), competition category, product name, brand name, sponsored-ad badge. Clicking the URL opens that page in a new browser tab (`chrome.tabs.create({url, active: true})` or anchor with `target="_blank"`). The list is scrollable for projects with many URLs; load via existing `listCompetitorUrls(projectId, null)` (null platform = all platforms — verify the api-client supports null; if not, add a passthrough).
    2. **Text capture paste form** — today's `<CapturedTextPasteForm>` MOVED here from its current location in App.tsx (currently below HighlightTermsManager).
  - Future: when Module 2 image capture ships (session 5), its popup-side surface (if any) also lives in Tab 2.

- **Active-session banner** — the existing "Capturing for [platform]" banner remains visible regardless of which tab is active (it's a top-level setup-state indicator, not tab content).

- **Tab navigation UX:**
  - Default open tab on popup-open = Tab 1 ("Identify Competition") — preserves today's behavior for muscle memory.
  - Tab pick persists in `chrome.storage.local` (one new state key `selectedPopupTab`) so re-opens after navigation return to the user's last-picked tab. NOT synced server-side (UI state only; no cross-device persistence needed per §A.7 storage taxonomy).
  - Tab switch is instant (React state) — no network call.

- **Edge cases to handle in the build:**
  - Tab 2's URL viewer renders an empty-state message ("No URLs captured yet for this Project — pick a platform on Tab 1 and use the "+ Add" button on a competitor page") when the project has zero URLs.
  - The text-capture paste form keeps its existing empty-state ("No saved [platform] URLs yet — capture one via '+ Add' first") when the user is on a platform with no saved URLs.
  - If the popup opens before Project is picked, Tab 2 should render a friendly "Pick a Project on the Identify Competition tab first" message — don't try to render the URL viewer with no projectId.

- **Out of scope for the first build pass** (defer if needed; capture as polish items if surfaced):
  - Per-column sort on the URL viewer table (added later if users want).
  - Per-row edit/delete from the popup (PLOS-side detail page is the canonical edit surface).
  - Filter by platform / category / sponsored-status in the popup (PLOS-side viewer has filters; popup keeps it simple for now).

**Code surfaces likely affected:**
- New: `extensions/competition-scraping/src/entrypoints/popup/components/PopupTabs.tsx` (tab navigation chrome).
- New: `extensions/competition-scraping/src/entrypoints/popup/components/CapturedUrlList.tsx` (URL viewer).
- New: `extensions/competition-scraping/src/lib/popup-state.ts` extended with `selectedPopupTab` storage key + helpers.
- Modified: `extensions/competition-scraping/src/entrypoints/popup/App.tsx` (move existing surfaces under Tab 1 + render Tab 2's surfaces; `<CapturedTextPasteForm>` relocated).
- Modified: `extensions/competition-scraping/src/entrypoints/popup/style.css` (tab strip styles + URL list table styles).
- Maybe: `extensions/competition-scraping/src/lib/api-client.ts` (confirm `listCompetitorUrls(projectId, null)` works; if not, extend or call without the platform filter).

**Verification surface for that build session:** new "Extension build — session 4b" (or "session N+M" depending on intervening sessions) section in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` with walkthrough steps for: tab switch persistence; URL list renders with all expected columns; click row → opens URL; empty-state renders correctly when project has no URLs; existing surfaces (Project / Platform / Highlight Terms / paste form) still work as before from inside their new tabs.

**Schema impact:** none. New feature is pure popup React + a new chrome.storage.local key. No schema change, no API surface change, no `prisma db push`.

**Branch:** code-build work for W#k (k ≥ 2) belongs on the W#k feature branch per CORRECTIONS_LOG 2026-05-10-c entry #4 cheat-sheet (a) — `workflow-2-competition-scraping`.

**Why this entry exists separately from today's main 2026-05-11-b §B entry:** today's main entry captures what SHIPPED this session (session 4 text-capture). This addendum captures forward directives for FUTURE sessions (verification + tabs feature). Future sessions' Rule 21 pre-interview directive scan will pick up this entry as the canonical source for the upcoming work's spec + sub-decisions.

---

**2026-05-12 — session_2026-05-12_w2-verification-and-vklf-illegal-invocation-hotfix**

**Session:** session_2026-05-12_w2-verification-and-vklf-illegal-invocation-hotfix (Claude Code; pivoted between `main` for the production hotfix and `workflow-2-competition-scraping` for verification work + this doc batch). Seventy-sixth Claude Code session.

**What shipped (code-level):** ONE commit `08f10e5` on `main` — vklf.com production hotfix to `src/lib/authFetch.ts` (7-line fix wrapping bare `fetch` in arrow `(u, i) => fetch(u, i)` to preserve the browser's window receiver). Deployed via Vercel auto-redeploy `state: success`; director verified on vklf.com.

**What was verified (no code; pure browser verification):**

- **S4-A** popup paste flow — 12/12 PASS (A-1 form renders below Highlight Terms; A-2 form fields + Save button enabled state; A-3 empty-state on platform with no URLs; A-4 happy-path save with existing category; A-5 "+ Add new…" inline category upsert; A-6 tag chips with comma-paste split + case-insensitive dedupe; A-7 × removes a chip; A-8 / A-9 / A-10 inline validation errors for missing text / URL / category; A-11 offline error message; A-12 saved rows appear on PLOS detail page).
- **S4-B** right-click overlay flow — 12/12 PASS with two workarounds noted (B-1 "already saved" banner sanity; B-2 select text; B-3 menu item appears; B-4 form opens with text + URL pre-filled — workaround: select in non-highlighted areas + manual URL pick if needed; B-5 happy-path save; B-6 row appears on PLOS detail page; B-7 menu hidden without selection; B-8 platform-mismatch silent bail; B-9 cross-URL pick attaches to picked URL; B-10 Esc/Cancel/backdrop close paths; B-11 "+ Add new…" from overlay; B-12 unsaved page no auto-prefill).
- **S4-C** idempotency — S4-C-1 PASS (no captured-text WAL keys in chrome.storage.local); S4-C-2 SKIPPED OPTIONAL (manual curl).
- **P1V-2** active silent-token-refresh — PASS. Today's hotfix verified end-to-end: forced expiry via DevTools console snippet; reload Projects; observed exact 3-request sequence in Network: `/api/projects` 401 → Supabase `/auth/v1/token?grant_type=refresh_token` 200 → `/api/projects` retry 200; UI no red error.
- **P1V-3** failure path — PASS. Forced expiry + refresh_token removal; reload; Supabase client fired SIGNED_OUT → app routed to login screen. Functionally correct (forces re-authentication, which is the right outcome when refresh can't recover). **Doc drift:** P1V-3 verification doc expected "red error in UI"; actual mechanism is auto-signout + login redirect. Captured for next-session VERIFICATION_BACKLOG cleanup.
- **P1V-1** passive (>1-hour idle return) — DEFERRED as passive; will surface naturally during normal vklf.com use; logged annotation.
- **P3B-1..P3B-10** cross-device sign-in — 10/10 PASS. Canonical proof of server-side persistence: laptop 2 was fresh install (chrome.storage.local empty); first sign-in's GET `/api/extension-state` returned Project + Platform from laptop 1's prior picks; popup pre-selected both — picks could ONLY have come from the server. Platform-switching semantics (Option-1) verified — switching project clears platform; switching back doesn't restore per-project memory. Offline cache-fallback with sync warning banner verified (via WiFi-off path; DevTools throttling on popup re-open doesn't carry across remount — useful note for next-session VERIFICATION_BACKLOG cleanup).
- **P3B-11** OPTIONAL one-time auto-migration smoke test — N/A (no pre-existing local-only picks on laptop 2's fresh install; not applicable to today's setup).

**Six DEFERRED polish items captured this session (per Rule 14e + Rule 26)** — destinations in ROADMAP.md W#2 polish backlog:

- **P-12** Extension 401-retry / silent-refresh analog to P-1. Extension `api-client.ts authedFetch` has no 401-retry today; transient 401s surface as "broken popup" state until popup re-open. Mirror P-1's pattern: on 401, call `refreshSession()`, retry once. Same fix path as P-1 but for extension context.
- **P-13** Autofocus on "+ Add new…" inline input (both popup `CapturedTextPasteForm.tsx` AND content-script `text-capture-form.ts`). Director-requested; small UX polish (~2 lines per file: `inputRef.current?.focus()` on mount via useEffect, OR `autoFocus` prop on the inline input element).
- **P-14** Highlight-terms applicator + MutationObserver self-feedback loop causes flashing on all platforms. **PRE-EXISTING since 2026-05-08-d P-5 ship** — orchestrator's MO observes document.body subtree, fires on EVERY mutation including its own strip+reapply cycle of highlight `<mark>` elements. Visible flashing at ~250ms cadence (RESCAN_DEBOUNCE_MS). Compounded by host-page activity. Selection on highlighted text is destroyed every cycle (blocked S4-B initially; workaround = select non-highlighted text). Fix: disconnect+reconnect MO around each refresh OR filter mutations whose target is a `<mark>` element OR set a "we're mutating" flag. Must regression-test P-10 SPA-navigation detection still works after fix.
- **P-15** `pickInitialUrl` missing `canonicalProductUrl` step on slug-variant URLs. Session 4 bug. `captured-text-validation.ts pickInitialUrl(pageUrl, rows)` normalizes both by `normalizeUrlForRecognition` (strips query string only). But Amazon serves the same product under `/Product-Name/dp/B0XXX/` AND `/dp/B0XXX/` paths — exact-match fails. The "already saved" banner path in orchestrator does pass URL through `platformModule.canonicalProductUrl(...)` first to strip slugs. The pre-fill path skips that step. Fix: in `text-capture-form.ts` line 459 call site, canonicalize pageUrl before passing to pickInitialUrl: `pickInitialUrl(platformModule.canonicalProductUrl(props.pageUrl) ?? props.pageUrl, rows)`.
- **P-16** Extension service worker "went to a bad state unexpectedly" on laptop 2 chrome://extensions. MV3 SW crash; stack trace degenerate (":0 (anonymous function)"). Auto-restarted by Chrome. Diagnose via SW's own DevTools ("Inspect views: service worker" on the extension card). Likely candidates: Supabase auto-refresh failure during WiFi-off period (unhandled promise rejection — MV3 SWs are stricter); `chrome.runtime.onMessage` async handlers without try/catch. Fix: wrap onMessage async paths in try/catch with structured sendResponse on error.
- **P-17** Real-fetch integration test for `authFetch.ts` production export. Test-coverage gap that allowed today's `Illegal invocation` bug to ship. All 7 P-1 unit tests inject a fake `fetchFn`; none exercise the production export's bare-reference wiring. Node's fetch is more lenient than browser fetch, so even an integration test in node wouldn't catch this. Need browser-context test harness (jsdom or Playwright) that exercises the real `authFetch` export. Cross-cutting platform-side polish (not strictly W#2) — captured under W#2 polish backlog for now; future session can re-categorize.

**Two doc drifts captured (to be cleaned up in next VERIFICATION_BACKLOG-update session):**

- S4-A-2 expected "Save button disabled until URL + category + non-empty text" — code at `CapturedTextPasteForm.tsx:314` shows `disabled={submitting}` only; validation surfaces via `validateCapturedTextDraft` on submit click (URL → text → category priority).
- P1V-3 expected "red error in UI: Could not load Projects (401)" — actual mechanism is Supabase client fires SIGNED_OUT → app routes to login screen. Functionally correct but doc text needs update.

**Multi-Workflow per Rule 25:** session pivoted between branches. Hotfix shipped on `main` per cheat-sheet (b). Verification + this end-of-session doc batch on `workflow-2-competition-scraping` per cheat-sheet (c). End-of-session rebase of W#2 onto origin/main hit conflicts in 4 doc-header chains (expected — both branches updated headers this week) — aborted; next W#2 → main deploy session handles the merge cleanly. W#2 branch's local `src/lib/authFetch.ts` still has the pre-hotfix version; runtime impact zero since W#2 branch isn't deployed. Next deploy session must merge main into W#2 before adding new commits (per CORRECTIONS_LOG 2026-05-10-c entry #1 PROCESS-quality finding). Schema-change-in-flight stays No. W#1 row untouched per Rule 3 ownership.

**Verification scoreboard:** root `npx tsc --noEmit` clean on main with hotfix; `npm run build` on main clean (51 routes — baseline parity); `node --test src/lib/authFetch.test.ts` on main 7/7 PASS. Extension tests not re-run this session (no extension code change). Vercel deployment of `08f10e5` `state: success` per `gh api deployments/4650327672/statuses`.

**Cross-references:** `src/lib/authFetch.ts:81-88` (the fixed production export); commit `08f10e5` (the hotfix on main, pushed + deployed); `extensions/competition-scraping/src/lib/content-script/text-capture-form.ts:459` (the `pickInitialUrl` call site that needs canonicalization per P-15); `extensions/competition-scraping/src/lib/content-script/orchestrator.ts:297-317` (the MutationObserver loop that flashes highlights per P-14); ROADMAP W#2 polish backlog new items P-12 through P-17; this session's CORRECTIONS_LOG entry 2026-05-12 (HIGH severity hotfix + test-gap analysis); COMPETITION_SCRAPING_VERIFICATION_BACKLOG Outcome 2026-05-12 block (per-sub-table results + doc-drift notes).


---

**2026-05-15 — session_2026-05-15_w2-p12-extension-401-retry-silent-refresh-shipped**

**Session:** session_2026-05-15_w2-p12-extension-401-retry-silent-refresh-shipped (Claude Code; on `workflow-2-competition-scraping` end-to-end). Eightieth Claude Code session.

**Task per launch prompt + ROADMAP (a.14):** Ship P-12 — the extension 401-retry / silent-refresh analog to web-side P-1. Mirror P-1's `makeAuthFetch` factory shape (`src/lib/authFetch.ts`) on the extension's `authedFetch` (`extensions/competition-scraping/src/lib/api-client.ts`). Add the analogous unit tests. Check whether W#2 branch needs `origin/main` merged in before adding new commits (per CORRECTIONS_LOG 2026-05-10-c entry #1 PROCESS finding — first session to apply that protocol after the 2026-05-12 capture).

**What shipped (commit `414efe6`):**

- **`extensions/competition-scraping/src/lib/api-client.ts`** — `authedFetch` replaced with `makeAuthedFetch({ supabase, fetchFn })` factory + a production-export binding. The factory signature mirrors `src/lib/authFetch.ts`'s `makeAuthFetch` one-to-one: takes `Pick<SupabaseClient, 'auth'>` + a `FetchFn`. On 401 the wrapper calls `supabase.auth.refreshSession()` once and retries with the new access token; if refresh also fails (refresh-token expiry, transport error, server revocation), the original 401 propagates through the caller's existing `PlosApiError(401)` path unchanged — preserving the 76 popup call sites' error handling byte-identically for the "really expired" case. Production export wraps `fetch` in an arrow `(u, i) => fetch(u, i)` to preserve the browser's window receiver — applying the P-17 lesson from the 2026-05-12 hotfix `08f10e5` proactively (passing `fetch` bare detaches it; the browser throws `TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation` on every call). Existing behaviors preserved: (a) pre-fetch no-token check still throws `PlosApiError(401, 'Not signed in')` BEFORE the network call so callers' existing "Not signed in" error path fires unchanged; (b) `mapFetchTransportError` wrapping applied to BOTH the first attempt AND the retry, so `TypeError → PlosApiError(0, 'Network unreachable')` semantics survive across the silent-refresh path. The supabase singleton is imported from `./supabase.ts` (which already wires `chrome.storage.local` as the storage adapter with `autoRefreshToken: true` + `persistSession: true`); the explicit refresh on 401 closes the window between token expiry and the next background `autoRefreshToken` tick.

- **`extensions/competition-scraping/src/lib/api-client.test.ts`** — extended with 9 new tests for `makeAuthedFetch` mirroring `src/lib/authFetch.test.ts`'s 7-test pattern, plus 2 extension-specific cases that the web-side suite doesn't cover (because the web side doesn't have `mapFetchTransportError` semantics): (1) 200 happy path — no refresh; (2) 401 → refresh success → retry 200 — verify both `Authorization: Bearer <old>` then `Bearer <new>` headers in the recorded calls; (3) 401 → refresh success → retry 401 — verify final 401 returned + exactly one refresh attempted (no infinite loop); (4) 401 → refresh fails → returns original 401 with body preserved; (5) 500 → no refresh; (6) no session → throws `PlosApiError(401, 'Not signed in')` BEFORE any fetch call; (7) POST: body + caller-supplied headers preserved across the retry, `Authorization` rewritten with the new token; (8) **NEW** TypeError on first attempt → throws `PlosApiError(0, 'Network unreachable')`; (9) **NEW** TypeError on retry (after successful refresh) → throws `PlosApiError(0)`. Tests use the same `node:test` + `--experimental-strip-types` pattern as the existing extension test suite. Test count 252 → 261 (+9). Zero regressions in the existing 252 tests.

**Branch state at session start (resolved cleanly):**

W#2 was 4 commits behind `origin/main` at session start (`6525961` Rule 27 + `422c658` P-17 + `bca7bee` platform-UI fix-pair + `23a5985` 2026-05-12-b deploy doc-batch). Director picked **merge over rebase** via Rule 14f forced-picker — the merge path avoids force-push and produces simpler conflict resolution if anything arose. `git merge origin/main` ✅ **FAST-FORWARDED cleanly** (zero conflicts) because main's 2026-05-12-b deploy session had already absorbed W#2's prior 2026-05-12 doc-batch commit `23375bd` via the rebase that ran on `main` in that session — so W#2's tip was already an ancestor of `origin/main`, and the merge simply advanced the W#2 pointer.

This is the **first session to apply the CORRECTIONS_LOG 2026-05-10-c entry #1 protocol** (pull-main-into-feature-branch-before-adding-new-commits) since it was captured. The protocol worked exactly as designed — no surprises, no rebase complications, no force-push.

**Verification scoreboard:**

- 261/261 extension tests pass (was 252 before; +9 from P-12).
- `pnpm compile` (ext `tsc --noEmit`) clean — after adding `!` non-null assertions on `calls[N]` array accesses in the test helpers. Reason: extension tsconfig has `noUncheckedIndexedAccess: true` which the web tsconfig doesn't, so the verbatim copy of the web-side test helper pattern needed minor type-strictness fixes. Not a process failure — just a stricter tsconfig surface for the extension package. No CORRECTIONS_LOG entry warranted; the strictness difference was always present and is appropriate for extension code that runs in untyped service-worker contexts.
- `pnpm build` (wxt build) ✅ exit code 0; 6 artifacts at 676K under `.output/chrome-mv3/` — baseline parity with prior session's build. Applied the wxt-watcher-pipe-block workaround from CORRECTIONS_LOG 2026-05-10-f INFORMATIONAL (background-run + filesystem-inspect; `pkill` once artifacts are present).

**Multi-Workflow per Rule 25:** Session stayed on `workflow-2-competition-scraping` end-to-end. No W#1 row change. Schema-change-in-flight stays "No". No cross-workflow doc edits.

**Verification of P-12 — passive (matches P-1):** Like P-1's verification (also passive — natural discovery on come-back >1 hour later on vklf.com), P-12's effect surfaces when the director returns to the extension popup after the access token has expired. No active manual walkthrough scheduled; the unit-test coverage of the factory + the architectural symmetry with the already-deployed-and-verified P-1 web-side carries the confidence. The next deploy session (ROADMAP (a.15) deploy session #7) brings P-12 to the director's Chrome via the fresh extension zip; from there, passive observation during natural use closes verification.

**TaskList sweep per Rule 26:** 6 main session tasks (merge origin/main; refactor authedFetch to factory; add silent-refresh + 401 retry; add unit tests; build + test; end-of-session doc batch) — all completed. **Zero `DEFERRED:` items captured this session** — all P-12 in-scope work shipped; no out-of-scope items surfaced during the work.

**Two commits this session:**

- `414efe6` on `workflow-2-competition-scraping` — P-12 code + tests (`extensions/competition-scraping/src/lib/api-client.ts` + `api-client.test.ts`; +373 lines, -23 lines).
- End-of-session doc batch on same branch (this commit, hash captured at handoff time).

**NEITHER commit pushed yet at the time of this §B entry.** Push to `workflow-2-competition-scraping` is a separate end-of-session decision and does NOT deploy vklf.com (pushing the W#2 branch only updates `origin/workflow-2-competition-scraping`; the W#2 → main merge that triggers Vercel auto-deploy happens at (a.15) deploy session #7 next session).

**Cross-references:** `extensions/competition-scraping/src/lib/api-client.ts:79-180` (new `makeAuthedFetch` factory + production export); `extensions/competition-scraping/src/lib/api-client.test.ts:113-end` (new P-12 test suite — 9 tests); `src/lib/authFetch.ts:40-88` (P-1 web-side analog the extension mirrors); `src/lib/authFetch.test.ts` (web-side test suite this extension test suite parallels — same `node:test` + `--experimental-strip-types` pattern + same fake-supabase/fake-fetch helper shapes); commit `414efe6`; ROADMAP W#2 row (a.14) ✅ SHIPPED + (a.15) RECOMMENDED-NEXT (W#2 → main deploy session #7); ROADMAP W#2 polish backlog list-item P-12 ✅ SHIPPED-at-code-level; CORRECTIONS_LOG 2026-05-10-c entry #1 (the pull-main-into-feature-branch protocol applied successfully today); CORRECTIONS_LOG 2026-05-12 (P-17 + Illegal-invocation hotfix lesson — production export's bare-fetch detachment is the regression class P-12's production export now guards against via the same arrow wrapping P-1 uses).

---

### 2026-05-13 — W#2 Extension build session 5 — Module 2 image-capture regular-image gesture ✅ SHIPPED at code level on `workflow-2-competition-scraping`; region-screenshot gesture DEFERRED to session 6

- **Session purpose:** ship the Module 2 image-capture path per §A.7 + `STACK_DECISIONS.md` §3 + §11.1. Launch prompt framed today as W#2 polish session #17 with Rule 14f forced-picker among W#2 polish backlog items (P-13 / P-16 / P-19 / P-20 design session HIGH / P-21 defensive) + Waypoint #2 Extension build session 5 (image-capture) + fresh-priority escape hatch. **Director picked Waypoint #2 Extension build session 5** — the forward build chunk.
- **Director's mid-build directive (Rule 18 Read-It-Back):** at scope-split moment, Claude surfaced the file plan (~1500–1800 LOC across ~9 files; multi-hour single-session scope at the edge of viability per Rule 16 zoom-out) and ran a Rule 14f forced-picker comparing (A) regular-image-first; region-screenshot deferred to session 6 [recommended per `feedback_recommendation_style.md`] / (B) full Module 2 ship / (C) region-screenshot-first; regular-image deferred / (D) "I have a question first" escape hatch. **Director picked Option A.** The split is captured here in §B as the binding scope decision:
  - **In scope this session:** right-click "Add to PLOS — Image" context-menu on image elements; image-capture-form (image preview + saved-URL picker + image-category picker with "+ Add new…" inline upsert + Composition optional + Embedded text optional + Tags chip-list); end-to-end two-phase signed-URL upload routed through the background service worker (fetchImageBytes → requestUpload → PUT to Supabase signed URL → finalize → CapturedImage row).
  - **Deferred to session 6:** region-screenshot gesture — popup-side "Region-screenshot mode" button + transparent overlay + crosshair cursor + drag rectangle + `chrome.tabs.captureVisibleTab` + canvas crop + flow into the same image-capture-form. Tracked as Rule 26 `DEFERRED:` task at scope-split moment with destination `ROADMAP.md` W#2 row Next Session (a.22) RECOMMENDED-NEXT slot; closed at end-of-session sweep after (a.22) added.
- **Decision (slice shipped today, code commit `0866b89`):** 11 files +1656/-7. NEW files (3): `extensions/competition-scraping/src/lib/captured-image-validation.ts` + `.test.ts` (pure-logic validation helpers mirroring `captured-text-validation.ts`; 12 unit tests covering happy path + each validation reason + tag normalization); `extensions/competition-scraping/src/lib/content-script/image-capture-form.ts` (~480 LOC; mirrors `text-capture-form.ts` overlay-form shape with image preview block + image-category vocab type + Composition + Embedded text + Tags). MODIFIED files (8): `background.ts` (new context-menu entry `contexts: ['image']` + click handler routing `info.srcUrl` + `info.pageUrl` via `open-image-capture-form` ContentScriptMessage + new `handleSubmitImageCapture` end-to-end uploader); `api-client.ts` (new exports `requestImageUpload`, `putImageBytesToSignedUrl`, `finalizeImageUpload`, `fetchImageBytes` — each with `fetchFn` injection seam for node:test); `api-client.test.ts` (11 new tests for fetchImageBytes covering MIME header / extension fallback / 415 / 413 / 404 / TypeError / charset-suffix; 3 for putImageBytesToSignedUrl covering success / 4xx with body / TypeError); `api-bridge.ts` (`submitImageCapture` wrapper); `messaging.ts` (`OpenImageCaptureFormMessage` + `SubmitImageCaptureRequestMessage` + `CapturedImage` envelope + `isBackgroundRequest` coverage); `orchestrator.ts` (handler for `open-image-capture-form`); `styles.ts` (image-preview CSS block: bordered wrap + max-height clamp + `object-fit: contain`); `wxt.config.ts` (5 image-CDN `host_permissions` entries — see "Documented platform fact" below).
- **Documented platform fact (Rule 19 platform-truths audit — caught in scope-decision moment, captured here):** the Chrome extension's `host_permissions` must include image-CDN hostnames for each platform, NOT just the platform's primary product-listing-page hostname. Reason: the background service worker fetches the image bytes from extension origin (cleanest path — sidesteps host-page-origin CORS on cross-origin image CDNs); Manifest V3 blocks cross-origin `fetch()` outside `host_permissions`. Today the 5 added entries cover Amazon (`*.media-amazon.com`, `*.ssl-images-amazon.com`), Ebay (`*.ebayimg.com`), Etsy (`*.etsystatic.com`), Walmart (`*.walmartimages.com`). Future per-platform additions (e.g., Google Shopping, independent websites for §A.7's Module 1 future extension) must include the platform's image-CDN pattern alongside its product-page host. **This is a `PLATFORM_REQUIREMENTS.md §10.2` adjacent platform fact** but is W#2-specific in the sense that only W#2 (and the future image-pipeline workflows that may consume W#2's captured images) need cross-origin image-CDN read access; recorded here in §B rather than promoted to PLATFORM_REQUIREMENTS because no other workflow has surfaced an analogous need yet.
- **Verification scoreboard:** ext `npm test` 289/289 pass (+23 vs session #15's 266 baseline — 12 captured-image-validation + 11 api-client image-upload); ext `tsc --noEmit` clean; ext `wxt build` clean in 1.66 s (content.js 53,520 B vs deploy-#9's 41,268 B = +12,252 B for new form + image-CDN host listing; background.js 206,734 B vs 203,936 = +2,798 B for image-capture handler + new context-menu; manifest.json 881 B = +105 B vs ~776 baseline for the 5 host_permissions entries). Root tsc / build / lint untouched this session (no `src/` changes).
- **Browser verification deferred** to the next W#2 → main deploy session — standard W#2 ship-then-deploy pattern (Rule 27 scope exception applies: cross-platform visual judgment + permission-prompt-on-reinstall flow is best verified in real browser by director, not Playwright). Walkthrough captured in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Extension build — session 5 — Module 2 image-capture regular-image gesture SHIPPED" section.
- **Multi-Workflow per Rule 25:** session stayed on `workflow-2-competition-scraping` end-to-end; pull-rebase clean at session start (already up-to-date with origin); W#1 row untouched per Rule 3 ownership; schema-change-in-flight stays "No"; no cross-workflow doc edits.
- **TaskList sweep per Rule 26:** 5 session tasks tracked + completed; 1 `DEFERRED:` task captured at scope-split moment (region-screenshot session 6 → `ROADMAP.md` W#2 row (a.22)); closed at end-of-session sweep after (a.22) entry written.
- **Smooth session — zero slips captured to CORRECTIONS_LOG.** One trivial test-import-path off-by-one caught + fixed by the test runner in <1 minute on first run (mechanical typo, not a recurring pattern; not a CORRECTIONS_LOG entry).
- **Cross-references:** code commit `0866b89` (already pushed to `origin/workflow-2-competition-scraping`); ROADMAP W#2 row Last Session prepended + (a.21) flipped ✅ DONE + new (a.22) RECOMMENDED-NEXT slot (region-screenshot session 6 OR W#2 → main deploy session #10 OR W#2 polish backlog continuation including P-20 design session); COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md new "Extension build — session 5 — Module 2 image-capture regular-image gesture SHIPPED" section; CHAT_REGISTRY.md new top entry + header; DOCUMENT_MANIFEST.md header + per-doc flags + this-session summary; CORRECTIONS_LOG.md unchanged (no slips).

---

### 2026-05-13 — W#2 Extension build session 6 — Module 2 region-screenshot gesture ✅ SHIPPED at code level on `workflow-2-competition-scraping`; Playwright cross-platform regression coverage in place; closes (a.22-a) deferred from session 5

- **Session purpose:** ship the Module 2 region-screenshot gesture per `STACK_DECISIONS.md` §4 (`chrome.tabs.captureVisibleTab` + canvas crop) + §A.7 (drag-rectangle around A+ Content Modules + flow into the existing image-capture-form). Director picked (a.22-a) Waypoint #2 Extension build session 6 from the (a.22) Rule 14f forced-picker menu (a.22-a / a.22-b deploy #10 / a.22-c polish backlog). Closes the region-screenshot deferred-task from session 5's scope split.

- **Decision (slice shipped today):** 11 files changed (~1820 net LOC), 5 new + 6 modified. NEW files:
  - `extensions/competition-scraping/src/lib/region-screenshot.ts` (~210 LOC pure-logic — rect normalize / clamp / edge-touch / too-small / crop-params math / data-URL parse with atob+Buffer dual decoder)
  - `extensions/competition-scraping/src/lib/region-screenshot.test.ts` (~270 LOC, 25 unit tests covering all 6 helpers)
  - `extensions/competition-scraping/src/lib/content-script/region-screenshot-overlay.ts` (~290 LOC — full-viewport overlay + crosshair cursor + drag-rectangle + always-on banner with §4 hint copy + processing state + Escape cancel + 4-panel dim-outside)
  - `extensions/competition-scraping/src/entrypoints/popup/components/RegionScreenshotModeButton.tsx` (~95 LOC — popup-side trigger; `chrome.tabs.query` for active tab + `chrome.tabs.sendMessage` enter-region-screenshot-mode + window.close + non-supported-platform inline error)
  - `tests/playwright/extension/region-screenshot.spec.ts` (~390 LOC — extension-context regression spec, cross-platform PLATFORMS-array parametrized across amazon/ebay/etsy/walmart, mirrors P-22 slice 2 shape; **stubs `chrome.tabs.captureVisibleTab` in `serviceWorker.evaluate`** because Chrome only grants `activeTab` to the active tab after a USER GESTURE — Playwright's synthetic SW dispatch doesn't qualify; the test exercises everything DOWNSTREAM of the chrome.* boundary)
- MODIFIED files:
  - `wxt.config.ts` — `activeTab` added to `permissions` (was just `['storage', 'contextMenus']`; manifest grew 881 → 893 B = +12 B). Required by `chrome.tabs.captureVisibleTab` per Chrome MV3 model — popup-open is the user gesture that grants activeTab to the active tab; the popup-side "Region-screenshot mode" button then has access. Without this entry the production flow rejects with the activeTab/<all_urls> permission error.
  - `src/entrypoints/background.ts` — new `handleCaptureVisibleTab` handler routes `capture-visible-tab` BackgroundRequest → `chrome.tabs.captureVisibleTab({format:'png'})` → returns `{dataUrl}` envelope. Header comment updated to reflect session 6 ship.
  - `src/entrypoints/popup/App.tsx` — `<RegionScreenshotModeButton />` rendered alongside `<CapturedTextPasteForm />` once project+platform picked.
  - `src/entrypoints/popup/style.css` — new `.region-screenshot-trigger` block (margin-top + divider + full-width button + helper-text spacing).
  - `src/lib/content-script/messaging.ts` — new `EnterRegionScreenshotModeMessage` (added to `ContentScriptMessage` discriminated union) + new `CaptureVisibleTabRequest` (added to `BackgroundRequest` union) + new `CaptureVisibleTabResponseEnvelope` + `isContentScriptMessage` + `isBackgroundRequest` updated.
  - `src/lib/content-script/api-bridge.ts` — new `requestVisibleTabCapture()` helper (content-script-to-background round-trip).
  - `src/lib/content-script/image-capture-form.ts` — new optional `sourceType?: ImageSourceType` prop (default `'regular'`); when set to `'region-screenshot'` the form pipes that value through `validateCapturedImageDraft` → background's `submit-image-capture` request body → server-side `finalize` body; same form UI handles both gestures uniformly because `fetchImageBytes` accepts both `http(s):` and `data:` srcs.
  - `src/lib/content-script/orchestrator.ts` — new branch for `enter-region-screenshot-mode` message: opens the overlay → on `onCaptured(dataUrl)`, destroys overlay + opens `image-capture-form` with that data URL as `srcUrl` and `sourceType='region-screenshot'`.
  - `src/lib/content-script/styles.ts` — new CSS block: `.plos-cs-region-screenshot-overlay` (fixed full-viewport, crosshair cursor, z-index above the form backdrop), `.plos-cs-region-screenshot-banner` (top-pinned, dark, pointer-events:none so drags pass through), `.plos-cs-region-screenshot-dim` (the four "outside the rect" panels), `.plos-cs-region-screenshot-rect` (white-bordered rectangle), `.plos-cs-region-screenshot-processing` (centered "Capturing region…" while captureAndCrop runs).

- **Director's mid-build directive (Rule 18 Read-It-Back):** at session start Claude surfaced the full file plan (~1100–1600 LOC across 10 files; UX details for popup button / banner copy / cancel gesture / multi-capture / sourceType decisions all called out + recommendation per file). Director picked "Yes" — straight to Slice A. No mid-build scope split this session; the plan as drafted shipped.

- **Documented platform fact #1 (Rule 19 — production bug-fix caught by Playwright):** `chrome.tabs.captureVisibleTab` requires `activeTab` in `permissions`. The drift-check assumption that per-platform `host_permissions` covered captureVisibleTab was wrong; the Playwright spec surfaced this with *"Either the '<all_urls>' or 'activeTab' permission is required."* Without the manifest fix the production region-screenshot flow would have failed in real Chrome too. **Director-time saved by the Rule 27 forced-picker recommending Playwright at session 6 plan** — the bug would have otherwise been caught only at the next manual deploy walkthrough.

- **Documented platform fact #2 (Rule 19 — synthetic dispatch ≠ user gesture):** Even with `activeTab` in the manifest, Chrome only grants the permission to the active tab when the user *invokes* the extension — toolbar icon click, context menu pick, or keyboard shortcut. Playwright's `serviceWorker.evaluate` → `chrome.tabs.sendMessage` synthetic dispatch is NOT a user gesture, so the test's captureVisibleTab call still rejects with the same permission error even with the manifest fix. **The spec stubs `chrome.tabs.captureVisibleTab` in `serviceWorker.evaluate` before navigating** to a 1×1 PNG fixture, so the test exercises everything DOWNSTREAM of the chrome.* permission boundary (overlay → drag → crop → form → 3-phase upload). Real captureVisibleTab coverage stays in the manual cross-platform deploy walkthrough.

- **NEW NEXT_SESSION.md defense-in-depth guard installed at session start (director-approved Rule 14f forced-picker Option A):** the director hit `cat: docs/NEXT_SESSION.md: No such file or directory` when launching this session — a prior session forgot to refresh it at close, and an earlier verbal "double-check before closing" instruction had failed because it relied on Claude's memory. Three layers shipped:
  1. **Mechanical:** `.claude/hooks/check-next-session-doc.sh` PreToolUse hook on `Bash` (~70 LOC) — blocks any commit whose message contains "End-of-session" unless `docs/NEXT_SESSION.md` is staged in that commit. Tightened regex avoids echo/grep false positives; 6/6 test scenarios pass locally before ship. `.claude/settings.json` (committed-to-repo) wires the hook. Hook loads at next-session start, so today's own end-of-session commit isn't yet protected — the seed file (#3 below) covers today.
  2. **Procedural:** `HANDOFF_PROTOCOL.md` §4 Step 1 item #11 extended to include `docs/NEXT_SESSION.md` as an ALWAYS-update doc (alongside CHAT_REGISTRY.md, NEW_CHAT_PROMPT.md, DOCUMENT_MANIFEST.md timestamps). "Last updated" header bumped at top of HANDOFF_PROTOCOL.
  3. **Seed:** `docs/NEXT_SESSION.md` (2.6 KB inaugural seed) created so the file is present from now on. End-of-session today writes the canonical next-session launch prompt into the file; future sessions overwrite. The director's scheduled `./resume` script + pointer-file design session (per memory `project_resume_script_design_scheduled.md`) can extend the file's shape later; today's redundancy is the small "make sure the file gets created and updated" hard guard.

- **Verification scoreboard:** ext `npx tsc --noEmit` clean; ext `npm test` **314/314 pass** (was 289 baseline from session 5 = +25 region-screenshot pure-logic tests); ext `npx wxt build` clean in 1.4 s (content.js 61,582 B vs 53,520 B baseline = +8,062 B; background.js 207,040 B vs 206,734 B = +306 B; manifest.json 893 B vs 881 B = +12 B for `activeTab`); **Playwright `tests/playwright/extension/region-screenshot.spec.ts` 4/4 GREEN** in 9.7 s on the clean build (amazon 1.9s / ebay 2.0s / etsy 2.1s / walmart 2.0s — same cross-platform parametrization shape as P-22 slice 2's image-capture.spec.ts). Root tsc / build / lint untouched (no `src/` changes outside the extension dir).

- **Browser verification (real captureVisibleTab path) deferred** to the next W#2 → main deploy session per the standard W#2 ship-then-deploy pattern. Rule 27 scope exception applies: cross-platform permission-prompt-on-reinstall flow + the real captureVisibleTab API path is best verified in a real browser by the director, not Playwright (Playwright's stub bypasses Chrome's user-gesture permission gate). Walkthrough captured in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Extension build — session 6 — Module 2 region-screenshot gesture SHIPPED" section.

- **Multi-Workflow per Rule 25:** session stayed on `workflow-2-competition-scraping` end-to-end. Pull-rebase clean at session start (already up-to-date with origin). W#1 row untouched per Rule 3 ownership. Schema-change-in-flight stays "No" (this session shipped extension + test code only; no schema changes). Cross-workflow doc edit surfaced + approved at session start: `HANDOFF_PROTOCOL.md` §4 Step 1 item #11 + header "Last updated" (the NEXT_SESSION.md guard rule edit). These propagate to `main` at the next W#2 → main merge.

- **TaskList sweep per Rule 26:** 5 session tasks tracked + 1 explicit `DEFERRED:` task captured at session start (Task #4: mis-dated 2026-05-14/2026-05-15 labels across docs — destination: `CORRECTIONS_LOG.md` cleanup entry + dedicated platform-wide session on `main`). All 4 non-DEFERRED tasks completed; Task #4 stays open and is documented in `CORRECTIONS_LOG.md` this end-of-session as the canonical entry (the destination has been written; the task can close).

- **Smooth session — zero CORRECTIONS_LOG-tier slips on Claude's side.** Two production bug-fixes ARE captured to CORRECTIONS_LOG: (a) the missing `activeTab` permission caught by Playwright (the drift-check assumption was wrong — the spec's regression coverage caught it before the manual deploy walkthrough did); (b) the mis-dated commit messages and §B entries across recent sessions (commits authored 2026-05-13 labeled "2026-05-14" and "2026-05-15") — informational entry for a future cleanup session.

- **Cross-references:** code commit hash captured at handoff time; ROADMAP W#2 row Last Session prepended + (a.22-a) flipped ✅ DONE + new (a.23) RECOMMENDED-NEXT slot (W#2 → main deploy session #10 brings the full Module 2 image-capture chunk — both regular-image gesture from session 5 + region-screenshot gesture from session 6 — to vklf.com as one coherent feature); `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` new "Extension build — session 6 — Module 2 region-screenshot gesture SHIPPED" section; CHAT_REGISTRY.md new top entry + header; DOCUMENT_MANIFEST.md header + per-doc flags + this-session summary; CORRECTIONS_LOG.md 2026-05-13 entries (a) activeTab catch + (b) mis-dated labels deferral; HANDOFF_PROTOCOL.md §4 Step 1 item #11 + header bumped (NEXT_SESSION.md guard); new files: `.claude/hooks/check-next-session-doc.sh`, `.claude/settings.json`, `docs/NEXT_SESSION.md`.

---

### 2026-05-14 — W#2 polish session #17 — P-20 highlight-flashing on real Amazon FIXED at code level (fingerprint short-circuit) on `workflow-2-competition-scraping`

- **Session purpose:** design + ship the P-20 polish fix (Amazon highlight-flashing + selection-collapse post-P-14-deploy). Picked Option A at the §4 Step 1c "No obvious next task" forced-picker that closed the previous session (`session_2026-05-14_w2-main-deploy-session-11-region-screenshot-DEPLOYED-FULL-VERIFY` + follow-up). Today's launch prompt (auto-injected by the Layer 1 SessionStart hook — Rule 28 verification incidentally completed at session start) framed the work as a design pass with optional code ship if the chosen approach was small-scope; director picked "design + ship today" at the post-evidence scope forced-picker.

- **Director's directives:**
  - **Evidence-gathering pre-step (Rule 27 forced-picker, Option A — manual DevTools trace):** director ran the trace script `docs/p-20-trace-script.js` (NEW — written this session) on a real Amazon PDP (`https://www.amazon.com/dp/B0CTTF514L?th=1`) for 30 seconds in an Incognito window (extension disabled to keep the trace pure). Results: 234 MutationRecord batches; 181 nodes added (6.0/sec); 180 removed; 34 311 chars text content added (1144 chars/sec); **34 would-be `refresh()` rescans in 30s = 1.13/sec** under the orchestrator's 250ms trailing-edge throttle. Top added tags: DIV (38), A (11), SPAN (8), IMG (4), LINK (3), SCRIPT (2), P (2). Evidence-driven conclusion: shape (a) "longer debounce" insufficient (even a 5s debounce only drops flash to ~once-per-5s, breaks `+Add` button responsiveness on new product links); shape (c) per-platform DOM scoping brittle + partial coverage (Amazon's main PDP area itself mutates); shape (d) IntersectionObserver wrong-problem (doesn't fix in-view mutation). Shape (b) "remember-and-compare fingerprint" picked.
  - **Fix-shape forced-picker — shape (b) picked.** Per `feedback_recommendation_style.md`, shape (b) was marked `(recommended)` as most-thorough-and-reliable: addresses root cause (in real Amazon, most mutations cycle the same words back in — fingerprint of pending highlight work stays unchanged → refresh short-circuits → no flash, no selection-collapse); platform-agnostic (works on all 4 platforms; works on future Google Shopping / Google Ads platforms automatically); composes with existing P-14 mute-MO infrastructure; modest implementation cost (~80 LOC + tests + new Playwright spec).
  - **Scope forced-picker — design + ship today.** Director picked the "design + ship today, in this same session" option as more thorough than splitting design + ship across two sessions (avoids the next-session re-derive drift risk).

- **Alternatives considered:**
  - **Shape (a) longer debounge — NOT RECOMMENDED.** Evidence ruled out: at the measured 1.13 rescans/sec under 250ms throttle, bumping to 1000ms gives ~1/sec (barely different); bumping to 2000ms gives 0.5/sec (still visibly flashing every 2 seconds); bumping to 5000ms+ would noticeably break `+Add` button responsiveness on new product links. Bad trade-off ratio.
  - **Shape (c) per-platform DOM scoping — NOT RECOMMENDED.** Amazon's MAIN product area mutates (image gallery rotation, color-swatch swaps, video previews) — scoping wouldn't fully solve it. Per-platform CSS selectors require maintenance per Amazon redesign cycle; same burden for eBay/Etsy/Walmart and any future platform (Google Shopping, Google Ads, independent-website in W#2's planned scope).
  - **Shape (d) IntersectionObserver-based viewport-only highlight — NOT RECOMMENDED.** Doesn't actually fix the flashing problem — when Amazon mutates content that's currently visible (carousel image rotation), the same strip-and-reapply pattern still fires. Solves a different problem ("highlight efficiently on very large pages") that we don't have at our 4 platforms' content sizes. Major architectural rewrite (~250+ LOC).
  - **Where to compute the fingerprint:**
    - (i) Sync TreeWalker pass over `document.body` before strip-and-reapply, honoring same skip rules as `applyHighlightsTo` — CHOSEN (cost O(N) once per refresh; sync so no race between fingerprint compute and apply).
    - (ii) Integrate fingerprint compute INTO the existing target-collection phase of `applyHighlightsTo` to share a single walk — REJECTED for first slice (more invasive; the second walk's cost is bounded and only paid on changed-state refreshes — most refreshes short-circuit before the second walk).
    - (iii) Maintain incremental fingerprint via MO record inspection — REJECTED (complex; mutation records don't directly indicate "matchable text changed"; need to walk to know).
  - **What goes in the hash:**
    - (i) Hash of all visible text on page (after skip rules) — REJECTED (fingerprint would change whenever ANY visible text changes, including non-matchable ad copy cycling).
    - (ii) Hash of the regex MATCH positions + matched strings only — CHOSEN (most precise; fingerprint only changes when matchable text changes).
    - (iii) Hash of currently-applied mark elements' text content — REJECTED (doesn't detect "should highlight new text not yet matched").
  - **Skip-existing-marks behavior in the fingerprint walk** — CHOSEN by reusing `shouldSkipSubtree`. Elegant consequence: the fingerprint reflects PENDING highlight work (unhighlighted matches only), not all matches on page. In steady state (everything highlighted) the fingerprint is the constant `"0:5381"` (zero matches, init hash) and stays stable until new matchable text appears OR existing marks get destroyed by external mutation exposing their text. Both transitions correctly change the fingerprint and trigger re-apply.
  - **Pre-apply vs. post-apply fingerprint storage** — CHOSEN: post-apply recompute (inside the mute window) is what gets stored. Initial design stored the pre-apply fingerprint; refactored after realizing the next refresh's walk skips the just-placed marks and finds zero pending matches → fingerprint would always differ from stored pre-apply value → unnecessary second apply on next tick. Storing post-apply (`"0:5381"` in steady state) gives stable comparison.
  - **Fingerprint invalidation on term-list change** — CHOSEN: explicitly set `lastFingerprint = null` in the `chrome.storage.onChanged` handler before the refresh call. Without it, a term-list change that produces the same match-set on the current page (e.g., color edit only, or adding a term that doesn't match current content) would hash to the same value and the refresh would short-circuit — missing the color update or the new term's future-matching potential. SPA-navigation invalidation is automatic (the new page content has different text → different fingerprint → re-apply fires).
  - **Cancellation handling** — CHOSEN: only update `lastFingerprint` inside the mute window when the apply completes UNCANCELLED. Partial state shouldn't be stored as "steady state." If apply was cancelled (a newer refresh superseded it), the next refresh's pre-check will see the partial-state fingerprint and proceed to a fresh apply.
  - **Regression test shape:** new `P-20 EXTERNAL-MUTATION` describe in `tests/playwright/extension/highlight-flashing.spec.ts`, parametrized per platform (matches existing P-14 / P-10 pattern). Each test: inject a 100ms `setInterval` that appends + removes a non-matchable `<div>` (mimics Amazon carousel rotation rate at ~10/sec, slightly above the measured 6/sec real-Amazon node-add rate to harden the assertion); observe `<mark>` mutation count over 2.0s; assert `count === 0` (post-fix, the fingerprint short-circuit makes refresh a no-op for non-matchable mutations). Locks in the bug class — without this spec, the existing 17 specs would pass even if a future change re-introduced the loop (because they ran on a STATIC mock page).

- **Decision:** P-20 fingerprint short-circuit shipped at code level on `workflow-2-competition-scraping`. Files changed:
  - `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` — new exports `hashFingerprintMatches` (pure helper) + `computeMatchableFingerprint` (DOM-walking); new `lastFingerprint: string | null` state in `startLiveHighlighting`; `refresh()` modified to short-circuit pre-mute when fingerprint unchanged + recompute post-apply inside mute on uncancelled completion; `onStorageChanged` invalidates fingerprint before triggering refresh.
  - `extensions/competition-scraping/src/lib/content-script/highlight-terms.test.ts` — +9 unit tests on the pure `hashFingerprintMatches` helper (determinism, count-prefix shape, order-sensitivity, position-sensitivity, long-string collision-resistance, large-N stability). Pure-logic only; the DOM-walking `computeMatchableFingerprint` is verified end-to-end via the Playwright suite per the file's established testing pattern.
  - `tests/playwright/extension/highlight-flashing.spec.ts` — new `P-20 EXTERNAL-MUTATION` per-platform test (4 new tests, one per amazon / ebay / etsy / walmart). Suite grew 25 → 29.
  - `docs/p-20-trace-script.js` — NEW evidence-gathering tool kept in the repo (well-documented; reusable for future content-script mutation-rate investigations on any platform).

- **Affected sections:** §A.7 (live-page Highlight Terms refresh behavior — refresh() now short-circuits when matchable text is unchanged since last apply); §A.13 (edge cases — "external mutation continuously firing on real Amazon" now produces no-op refreshes); the rest of §A remains frozen per Rule 18.

- **Verification scoreboard:**
  - ext `npx tsc --noEmit -p tsconfig.json` — CLEAN (no new TS errors).
  - ext `npm test` — **323/323 GREEN** (was 314 baseline from session 6 = +9 new fingerprint tests).
  - root Playwright extension project (`npx playwright test --project=extension`) — **29/29 GREEN** in 1m43s (was 25/25 from session 6 = +4 new P-20 EXTERNAL-MUTATION specs). Zero regression on the 25 pre-existing specs (5 SMOKE + 4 P-14 count + 4 P-14 identity + 4 SELECTION-STABILITY + 4 P-22 image-capture + 4 region-screenshot + 1 P-10 SPA-nav).
  - ext `npm run build` — CLEAN in 1.3s (content.js 62,440 B vs 61,582 B baseline = +858 B for the P-20 fingerprint logic; manifest.json + background.js + popup-*.js + popup-*.css unchanged).

- **Browser verification (real Amazon path) deferred** to the next W#2 → main deploy session (W#2 → main deploy session #12). Rule 27 scope exception applies: the bug class is "real Amazon's continuous external DOM mutation" which Playwright simulates approximately (via the new 100ms-setInterval injection) but real Amazon is the ultimate test. The deploy session will sideload the fresh extension on real Amazon and walk through "navigate to PDP with highlight terms set → wait 10s → observe whether flashing stops + selection survives" — the symptom the original P-20 report (2026-05-12-g) flagged.

- **Multi-Workflow per Rule 25:** session stayed on `workflow-2-competition-scraping` end-to-end. `git pull --rebase origin workflow-2-competition-scraping` at session start = clean (already up-to-date). Schema-change-in-flight stays "No" (zero schema work today). W#1 row untouched per Rule 3 ownership.

- **TaskList sweep per Rule 26:** 8 session tasks tracked (resume-flow capture, start-of-session sequence, P-20 design pass, implement fingerprint, unit tests, Playwright spec, run test suite, end-of-session doc batch) + all 8 closed at end-of-session. Zero `DEFERRED:` items at any point.

- **Cross-references:**
  - **NEW file:** `docs/p-20-trace-script.js` — DevTools mutation-rate trace script with director-walkthrough header. Reusable for future content-script bug investigations.
  - `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` (the canonical fingerprint implementation).
  - `tests/playwright/extension/highlight-flashing.spec.ts` (the new regression spec — 4 platforms × 1 new test).
  - `docs/ROADMAP.md` W#2 row Last Session 2026-05-14 prepended + (a.25) flipped ✅ SHIPPED-AT-CODE-LEVEL + new (a.26) RECOMMENDED-NEXT (W#2 → main deploy session #12 with P-20 real-Amazon verification); polish backlog P-20 entry flipped ✅ SHIPPED-AT-CODE-LEVEL with real-Amazon caveat pointing to (a.26).
  - `docs/CORRECTIONS_LOG.md` 2 new INFORMATIONAL entries this batch (Resume-flow Rule 28 verified + two small operational slips self-caught).
  - `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — new "P-20 fingerprint short-circuit SHIPPED at code level (W#2 polish session #17)" section with mutation-rate trace evidence + design narrative + verification scoreboard + deploy plan pointer.
  - `docs/CHAT_REGISTRY.md` — new top entry.
  - `docs/DOCUMENT_MANIFEST.md` — per-doc flags + this-session summary.
  - `docs/NEXT_SESSION.md` — rewritten for W#2 → main deploy session #12.

---

### 2026-05-14 — W#2 polish session #18 — P-23 Amazon main-image right-click context-menu fix SHIPPED at code level on `workflow-2-competition-scraping`

**Director's directive (per launch prompt):** *"W#2 polish session #18 — ship P-23 Amazon main-image right-click context-menu fix on `workflow-2-competition-scraping`. Closes (a.27) RECOMMENDED-NEXT. Standard ship-then-deploy pattern — today's work is the code-level ship; a future deploy session brings it to vklf.com."* Launch prompt also enumerated 3 candidate fix shapes (A/B/C — same 3 captured during deploy-#10 doc batch when P-23 was first identified) and recommended starting with (A).

**The bug.** On Amazon's product-listing page, right-clicking the main product `<img>` does NOT show the "Add to PLOS — Image" menu. Workaround pre-fix: click image → Amazon opens it in a larger viewer pane → right-click on the now-clean `<img>` in that viewer → menu fires + full upload chain works. Affects only Amazon; Walmart/eBay/Etsy all work on direct right-click on the main listing-page image. Severity MEDIUM (workflow degradation only; non-obvious workaround). Root cause: Amazon's main `<img>` is wrapped in zoom/overlay elements (typically a `.imgTagWrapper` div containing the `<img>` PLUS a sibling overlay shield `<div>` that intercepts pointer events). The overlay div catches the `contextmenu` event before Chrome's contextMenus API recognizes the right-click target as matching `contexts: ['image']`.

**Alternatives considered (the 3 candidate fixes from deploy-#10 doc batch):**

- **(A) Widen `chrome.contextMenus` `contexts` to `['all']` + element-walk in handler.** Smallest code change for the contexts setting; expands menu surface across all right-clicks (UX wart); element-walk needs to live content-script-side because `info.srcUrl` is only populated when Chrome's native image-context detection matches.
- **(B) Inject a content-script right-click listener that walks DOM up from `event.target` to find an underlying `<img>`.** Keeps `contexts: ['image']` for Walmart/eBay/Etsy (zero behavior change on stable platforms); adds a parallel content-script-only path for Amazon. Higher implementation cost (new listener + new "synthesize a click" / "show floating affordance" UI path).
- **(C) Reuse the §5 floating "+ Add" button pattern from URL capture.** Lowest implementation cost (existing code path); mixes UX patterns (right-click for some platforms, floating button for Amazon main image) — a UX wart.

**What was decided — refined Option (A):** picked the launch-prompt-recommended (A) AS THE STARTING POINT but refined the mechanism after reading the existing content-script structure. Key refinement: the "element-walk in handler" lives in the content-script (not the background) because Chrome doesn't populate `info.srcUrl` for non-image right-click targets even under `contexts: ['all']`. So the mechanism becomes:

1. `background.ts` widens `contexts: ['image']` → `contexts: ['all']`. The menu now fires on any right-click target.
2. `background.ts` removes the early-bail `if (!srcUrl) return;` guard — empty-srcUrl is now an expected case to be handled downstream.
3. `background.ts` dispatches `open-image-capture-form` with `srcUrl: info.srcUrl ?? ''` (may be empty for non-image targets).
4. NEW content-script helper `find-underlying-image.ts` exports `findUnderlyingImage(target: Element | null): string | null` that walks up from `target` (depth ≤ MAX_ANCESTOR_DEPTH=10) and at EACH ancestor both checks if cursor IS an `<img>` AND scans `cursor.querySelector('img')` for an `<img>` descendant. The descendant-scan is what unlocks Amazon's pattern: the right-click lands on the sibling overlay div, so walking UP from the shield won't find the image directly — but the shared parent's `querySelector('img')` DOES. Prefers `currentSrc` (browser-picked URL respecting `srcset`) over `src` (raw attribute).
5. `orchestrator.ts` attaches a capture-phase `contextmenu` listener at the TOP of `runOrchestrator` (BEFORE any awaits — see CORRECTIONS_LOG 2026-05-14 entry for the listener-attach race that surfaced this placement decision). The listener always updates `lastRightClickImageSrc` on every right-click (sets to discovered src OR null).
6. `orchestrator.ts` message handler — when `open-image-capture-form` arrives with empty `msg.srcUrl`, falls back to `lastRightClickImageSrc`; if both empty, bails silently with `sendResponse({ ok: false, reason: 'no-image-found' })`.

**Why this refined-(A) shape over a clean (B):** simpler mechanism (one new helper file + one cache variable + one capture-phase listener; no new message kind; no UI synthesis path). Walmart/eBay/Etsy behavior is unchanged because Chrome's image-context detection still runs under `contexts: ['all']` — direct-`<img>` right-clicks populate `info.srcUrl` natively and the cache is never consulted. UX cost on all 4 platforms: the "Add to PLOS — Image" menu now appears on right-click of any element (slight noisiness; bail-silently semantics keep it functionally correct). Bounded acceptable trade-off vs. the Amazon-fix benefit; if the UX noise becomes a problem, a future polish session can scope the wider contexts to Amazon only via `documentUrlPatterns`.

**Verification scoreboard — all GREEN:**

- ext `npx tsc --noEmit -p tsconfig.json` → exit 0.
- ext `npm test` → **334/334 pass** in 3.6s (was 323; +10 new `findUnderlyingImage` unit tests + 1 net adjustment).
- root `npx playwright test --project=extension` → **31/31 pass** in 1.3 min (was 29; +2 new P-23 specs — positive overlay-shield → falls-back-to-cache; negative plain-text → silent bail).
- ext `wxt build` → clean in 1.42s; content.js 62,437 → **63,038 bytes (+601 bytes)** within the launch-prompt "few hundred bytes" target.

**Files changed this session:**

- modified `extensions/competition-scraping/src/entrypoints/background.ts` (widen contexts + drop early bail).
- modified `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` (top-of-function listener attach + cache + cache-fallback in message handler + detach in early returns + main cleanup).
- NEW `extensions/competition-scraping/src/lib/content-script/find-underlying-image.ts`.
- NEW `extensions/competition-scraping/src/lib/content-script/find-underlying-image.test.ts`.
- NEW `tests/playwright/extension/p23-amazon-overlay-image.spec.ts`.
- NEW `tests/playwright/extension/amazon-overlay-image-product-page.html` fixture.

**Mid-build slip caught + fixed before commit:** initial draft placed the contextmenu listener AFTER the orchestrator's async init flow (after several awaits for `getSelectedProjectId` / `listCompetitorUrls` / `listProjects` / `startLiveHighlighting`). The Playwright spec's `dispatchEvent('contextmenu')` then ran in the race window between `data-plos-cs-active=1` being set (synchronous, top of function) and the listener actually attaching (later, after awaits) — false-negative test failure with "form did not render" even though all production code paths were correct. Fix: hoist the listener attach to the TOP of `runOrchestrator` (synchronous with `data-plos-cs-active=1`), add `detachContextMenuListener()` calls in each early-return path to prevent listener leak on unsupported platforms. Full lesson recorded in `CORRECTIONS_LOG.md` 2026-05-14 entry "Playwright capture-phase listener-attach race in P-23 spec."

**Real-Amazon browser verification DEFERRED to W#2 → main deploy session #13** per standard ship-then-deploy pattern.

**Cross-references:**

- `docs/ROADMAP.md` W#2 row Last Session 2026-05-14 prepended + (a.27) flipped ✅ DONE + new (a.28) RECOMMENDED-NEXT W#2 → main deploy session #13 + polish backlog P-23 entry flipped ✅ SHIPPED-AT-CODE-LEVEL.
- `docs/CORRECTIONS_LOG.md` 1 new INFORMATIONAL entry — Playwright capture-phase listener-attach race caught + fixed.
- `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` new "P-23 Amazon main-image right-click context-menu fix SHIPPED at code level (W#2 polish session #18)" section.
- `docs/CHAT_REGISTRY.md` new top entry.
- `docs/DOCUMENT_MANIFEST.md` per-doc flags.
- `docs/NEXT_SESSION.md` rewritten for W#2 → main deploy session #13 with the standard deploy-session prompt + pre-deploy verification scoreboard + browser-verification steps for real Amazon.

---

### 2026-05-14 — W#2 → main deploy session #13 — P-23 DEPLOYED to vklf.com + three NEW polish items (P-27 / P-28 / P-29) captured per Rule 24 + Rule 14a Read-It-Back

**Session ID:** `session_2026-05-14_w2-main-deploy-session-13-p23-amazon-context-menu-DEPLOYED-FULL-VERIFY` (Claude Code; rebase phase on `workflow-2-competition-scraping`; ff-merge + deploy push on `main`).

**Outcome (P-23):** Yesterday's polish session #18 P-23 fix (refined Option (A) — widen `contexts: ['image']` → `contexts: ['all']` + content-script `find-underlying-image.ts` ancestor + sibling-img walk + capture-phase listener hoisted to top of `runOrchestrator` + cache-fallback + silent bail) DEPLOYED cleanly to vklf.com via standard cheat-sheet (b) flow. Real-Amazon browser-verify by director: **all 9 walkthrough steps PASSED** including cross-platform Walmart/eBay/Etsy spot-check (zero behavior change) and UX-noise spot-check (menu appears on non-image right-click as expected; clicking it silently bails). Director's verbatim outcome: *"Everything worked perfectly. No need to check the database."* P-23 polish backlog entry flipped ✅ **SHIPPED-AT-DEPLOY-LEVEL**.

**Outcome (P-27 / P-28 / P-29 new polish items):** Director surfaced three new W#2 features end-of-session for the roadmap:
1. Delete added texts and images from a URL.
2. Delete URLs added to a project.
3. Manually add URLs, text, and images to a project under any platform within vklf.com.

**Rule 24 pre-capture search performed across `ROADMAP.md`, this DESIGN doc, `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md`, `DATA_CATALOG.md`, and the live code under `src/app/api/...` + `src/app/projects/...`.** Findings: **all three features were originally specified in the W#2 Workflow Requirements Interview** captured in this DESIGN doc's §A — director's own words on:
- **Line 487:** *"the user should be able to reset the entire extension to get rid of all data in it to reuse it for another Project or **delete any urls and its associated data individually**."* → P-28 lineage.
- **Line 489:** *"the user should be able to add competition urls through the easy mechanism we will come up with as mentioned above or the user should be able to **manually add a url into the competition table (for example, independent websites)**."* → P-29 lineage.
- **Line 506:** *"Note that the user should be able to **edit/delete any text in the table**. The user should also be able to **move rows within the table**."* → P-27 lineage.

**Status check from code-read 2026-05-14:** back-end DELETE handler for URLs already exists at `urls/[urlId]/route.ts:272` (from the original session-1 API-routes work); back-end DELETE for captured-text + captured-image does NOT exist (only GET + POST shipped on the sub-routes); back-end POSTs for manual-add of URL/text/image all exist (reusable from the extension flow); vklf.com UI for all three operations does NOT exist (data entry flows through the Chrome extension today).

**Special status for P-29 — REVERSES the 2026-05-07 deliberate deferral.** Captured originally in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` line 965: *"there is no manual-URL-add affordance on the PLOS side yet (**deliberately deferred per the director's 2026-05-07 call** — the alternative seed paths were declared not worth the friction vs. just waiting)."* The 2026-05-07 framing chose to keep the Chrome extension as the canonical data-entry path; today's director surfaces the gap that comes with that framing — no way to capture data from "independent websites" outside Walmart/eBay/Etsy/Amazon. P-29 explicitly reverses the deferral; the reversal is captured prominently in the P-29 polish-backlog entry so future sessions don't re-defer based on the older framing.

**Capture shape picked via Rule 14f forced-picker.** Three options presented:
- **(A) Three new polish-backlog entries P-27/P-28/P-29 with cross-refs to this DESIGN doc (recommended)** — keeps polish-backlog as single canonical "what's next" surface, preserves design-doc lineage, doesn't pre-commit to design decisions you haven't made yet.
- (B) Update this DESIGN doc §B as in-flight refinements only — closer to doc-architecture spirit but less actionable as a "what's next" surface.
- (C) Run a formal mini-interview now on the three features — most thorough but most time-expensive.

**Director picked (A).** Three new sections appended to `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (P-27 / P-28 / P-29 NEW POLISH ITEM sections) with the standard structure (status / severity / lineage / what-the-feature-is / what's-shipped-today / what-needs-to-be-built / open-design-questions / estimated-scope / cross-references). The §A interview answers in this DESIGN doc are NOT modified — they remain the frozen-at-interview canonical spec; the new polish-backlog entries are derived from them.

**Next session picked via §4 Step 1c interview with expanded candidate list (P-29 / P-28 / P-27 / pre-existing P-21 / P-19 / P-13):** **P-29 design session** (manual-add UI on vklf.com) — director-picked. NEXT_SESSION.md rewritten with the design-pass prompt + 5 open design questions to settle via Rule 14f forced-pickers (image upload mechanics for the manual-add image form / schema-add for "Other" platform / `source` column for audit-trail distinction between extension-captured vs. manually-added rows / permission model admin-Phase-1 vs. worker-Phase-2 / form UX location modal-vs-inline-vs-separate-page). Build sessions for P-29 will follow the design session; P-27 + P-28 stay in the backlog for future picks.

**Branch state at session end:**
- `origin/workflow-2-competition-scraping` advanced `6f6e69f → 6461c2a` (this push lands today's P-23 ship that yesterday's polish-#18 session committed).
- `origin/main` advanced `6f6e69f → 6461c2a` (the deploy push; Vercel auto-redeploy fired but no-op for web bundle since extension-only).
- Workflow-2 + main now at parity → clean state for the (a.29) P-29 design session that picks up tomorrow on the workflow-2 branch.

**Cross-references:**
- `docs/ROADMAP.md` W#2 row Last Session 2026-05-14 prepended + (a.28) flipped ✅ DONE + new (a.29) RECOMMENDED-NEXT P-29 design session.
- `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` new "Deploy session #13 — P-23 DEPLOYED + REAL-AMAZON FULL VERIFY 2026-05-14" section + new "P-27 / P-28 / P-29 NEW POLISH ITEM" sections.
- `docs/CHAT_REGISTRY.md` new top entry.
- `docs/CORRECTIONS_LOG.md` header bump only (no new §Entries — clean session, zero slips).
- `docs/DOCUMENT_MANIFEST.md` per-doc flags.
- `docs/NEXT_SESSION.md` rewritten for (a.29) P-29 design session — design-pass prompt with 5 open-question forced-pickers.

---

### 2026-05-15 — session_2026-05-15_w2-p29-design-session (Claude Code, on `workflow-2-competition-scraping`)

**Session purpose:** P-29 DESIGN session — settle the 5 open design questions captured in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` lines 1834-1839 via Rule 14f forced-pickers, then propose a build slice + Rule 27 verification picker. Per launch prompt: no code change in this session — design + sequencing approval only.

**Director's directives this session (5 forced-picker outcomes + 1 verification-approach pick):**

- **Q3 — `source` audit-trail column.** Picked "All 3 tables (recommended)." Decision: add `source: 'extension' | 'manual'` column to `CompetitorUrl`, `CapturedText`, and `CapturedImage`. Default existing rows to `'extension'`. One `prisma db push` migration runs in Slice #1's session. Most thorough — covers the cross-source case (manual text/image added to an extension-captured URL). Reversible.

- **Q4 — Permission model.** Picked "Symmetric with extension (recommended)." Decision: modal's "+ Manually add" button visible to anyone with project-workflow access. Phase 1 admin-only by virtue of admin-solo; Phase 2 workers see it when they have assignment to (project, competition-scraping, [platform]). Server-side gate `verifyProjectWorkflowAuth` is authoritative; no client-side admin-only override.

- **Q5 — Manual-add UI form location.** Picked "Modal popup (recommended)." Decision: modal opens from "+ Manually add URL" button on `UrlTable.tsx` (URL form) and "+ Manually add captured text" / "+ Manually add captured image" buttons on `url/[urlId]/page.tsx` (text + image forms). Modal pattern used for all three sub-features uniformly.

- **Q1 — Image upload mechanics.** Picked "All three (recommended)." Decision: image modal exposes three input shapes — drag-and-drop area + paste-from-clipboard listener (Ctrl+V/Cmd+V) + text field labeled "or paste an image URL." URL-of-image path is gated server-side with allowlist of public web hostnames (blocking internal/loopback/cloud-metadata IPs per SSRF guidance), strict content-type check (must be `image/*`), size limit ≤10 MB.

- **Q2-reframing (Stage 0) — "Other" platform handling.** Q2 COLLAPSED after Rule-3 code-truth check. `independent-website` is already a supported platform value end-to-end (`prisma/schema.prisma:257` `platform String`; `src/lib/shared-types/competition-scraping.ts:20-29` `PLATFORMS` 7-value array; `extensions/competition-scraping/src/lib/platforms.ts:19` extension popup picker). No schema change for "Other" handling. Modal's platform dropdown labels this option "Independent Website" to match extension (Rule 15 autonomous; UI-consistency principle). The yesterday-captured framing in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` line 1832 ("Current platform enum is `walmart | ebay | etsy | amazon`. Adding 'other' requires a schema add") was INCORRECT against current code — captured to CORRECTIONS_LOG today as INFORMATIONAL (root cause = Rule 24 pre-capture search yesterday found the higher-level lineage on DESIGN doc line 489 but didn't grep the actual schema).

- **Rule 27 — verification approach for Slice #1.** Picked "Hybrid (recommended)." Decision: Playwright covers the mechanical/regression-prone parts (button → modal → form submit → row appears → `source='manual'` → auth gate); director manual walkthrough covers visual-judgment + end-to-end smoke on a real independent website.

**Alternatives considered (per pick) — comprehensive forced-pickers per Rule 14f.** Notable rejected options:
- Q3 Option B (URL-only `source` column) — fails the cross-source case (manual text/image on an extension-captured URL).
- Q3 Option C (defer to Phase 3 AuditEvent table) — no visibility for years; Phase 3 far off.
- Q4 Option B (admin-only forever) — breaks extension symmetry; reduces worker autonomy.
- Q5 Option B (inline expansion) — multi-field URL form + image-upload area both crowd a single table row.
- Q1 Option C (URL-only) — forces user to host image somewhere first; loses drag-drop convenience.
- Rule 27 Option A (Playwright only) — visual-judgment portions need director's eye.

**Build sequencing (three slices, three sessions):**
- **Slice #1 (next session)** = manual-add URL modal on `UrlTable.tsx` + one-shot `source` schema migration covering all 3 W#2 tables. Schema-change-in-flight flag in ROADMAP Current Active Tools flips to "Yes" at Slice #1's session start. Smallest; validates pattern.
- **Slice #2** = manual-add captured-text modal on URL-detail page. No schema change (Slice #1 covered).
- **Slice #3** = manual-add captured-image modal with all three input modalities + new server-side URL-fetch endpoint with SSRF allowlist + content-type + size guardrails. Largest.

Each slice its own session per `PROJECT_CONTEXT.md §13` discover-as-you-build.

**Director-approved end-of-session pick:** Path A — wrap design session here; start Slice #1 in a fresh session via `./resume`. Rationale per session-management lucidity preference (`feedback_session_management.md`).

**Decision:** all 5 design questions settled + sequencing approved + Rule 27 verification approach picked. Slice #1 set as next session via `NEXT_SESSION.md` rewrite. No code changed this session.

**Affected sections:**
- §A.7 (Module 1 URL-add UX) — now also serviced by a vklf.com modal in addition to the extension's "+ Add" gesture.
- §A.10 (Audit trail) — adds explicit `source` column to W#2 tables (Q3 outcome).
- §A.13 (Data persistence) — schema columns added (Slice #1 migration).
- §A.18 (Recommended next-session sequence) — adds the three P-29 build slices.

**Cross-references:**
- `prisma/schema.prisma:257` (Slice #1 adds `source` column to CompetitorUrl + CapturedText + CapturedImage)
- `src/lib/shared-types/competition-scraping.ts:20-29` (PLATFORMS already includes `independent-website`; Slice #1 will add `source` field to URL/text/image DTOs)
- `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx` (Slice #1's modal mount point)
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/page.tsx` (Slices #2 + #3's modal mount points)
- `extensions/competition-scraping/src/lib/platforms.ts:19` (existing "Independent Website" label match for UI consistency)
- `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` lines 1814-1853 (P-29 polish-backlog entry; status flip to design-DONE in this end-of-session batch)
- `PLATFORM_REQUIREMENTS.md §5` (audit-trail policy informs Q3 decision)
- `CORRECTIONS_LOG.md` — new 2026-05-15 INFORMATIONAL entry on Q2 code-vs-doc drift
- `NEXT_SESSION.md` rewritten for Slice #1 build session
- `ROADMAP.md` W#2 row updates + new (a.30) RECOMMENDED-NEXT Slice #1 + polish backlog P-29 entry status flip

---

### 2026-05-15-b — session_2026-05-15-b_w2-p29-slice-1-build-session (Claude Code, on `workflow-2-competition-scraping`)

**Session purpose:** P-29 Slice #1 BUILD session — ship the manual-add URL modal + one-shot `source` schema migration covering all 3 W#2 tables, per the 2026-05-15 design pass's frozen decisions. Closes (a.30) RECOMMENDED-NEXT.

**What shipped at code level (commit `070820a` on `workflow-2-competition-scraping`):**

- **Schema migration** (Q3 outcome): `prisma db push` against the live DB added `source String @default("extension")` column to `CompetitorUrl` + `CapturedText` + `CapturedImage`. Verified post-migration: 25 + 8 + 10 = 43 existing rows backfilled to `'extension'` via the column default; counts unchanged. `prisma/schema.prisma:269,309,337`.

- **Shared types update**: new `SOURCES` vocabulary + `isSource` type guard added to `src/lib/shared-types/competition-scraping.ts`; `source: Source` field added to `CompetitorUrl` / `CapturedText` / `CapturedImage` response interfaces; `source?: Source` added to `CreateCompetitorUrlRequest` / `CreateCapturedTextRequest` / `FinalizeImageUploadRequest`. Slice #2 + Slice #3 won't need to re-touch shared types.

- **API route update** (collection POST): `src/app/api/projects/[projectId]/competition-scraping/urls/route.ts` POST handler accepts optional `source`; validates via `isSource`; rejects misshapen values with 400 + explicit error message; default `'extension'` applies server-side when omitted (preserves Chrome extension's existing POST traffic semantics — extension's existing `CreateCompetitorUrlRequest` payload doesn't carry `source`, so backward-compatible).

- **Wire-shape echo** (6 toWireShape serializers updated): `urls/route.ts`, `urls/[urlId]/route.ts`, `text/[textId]/route.ts`, `urls/[urlId]/text/route.ts`, `urls/[urlId]/images/route.ts`, `urls/[urlId]/images/finalize/route.ts`, `images/[imageId]/route.ts`. Each now returns `source` on every read path. TypeScript would have caught any miss because the shared-types interfaces now require the field on the response shapes — `npx tsc --noEmit` clean confirmed.

- **UI: `UrlAddModal.tsx`** (new ~470 LOC component at `src/app/projects/[projectId]/competition-scraping/components/UrlAddModal.tsx`): full URL-add form mirroring the Chrome extension's overlay shape — URL + Platform (7-value dropdown with extension-matched labels like "Independent Website") + Brand + Product + Category + Product Stars (0-5, step 0.1) + # Reviews + Results Page Rank + Sponsored toggle. Autofocus on URL field; Escape / Cancel / X / backdrop dismiss (only when not submitting); inline validation surface; submit-in-flight lock disables all controls + dismiss paths to prevent orphan POSTs. POSTs with `source: 'manual'` explicitly.

- **UrlTable.tsx wire-in** (Q5 outcome — modal pattern; director-picked button location: top-right of search toolbar): new "+ Manually add URL" button rendered at top-right of the existing search/clear-filters/count toolbar; click opens the modal; on success, modal closes + parent `CompetitionScrapingViewer.handleUrlAdded` prepends the new row to the URL list state with `id`-dedup against the POST's idempotent return path.

- **Tests**: 10 node:test cases for `isSource` + cross-vocabulary type guards at `src/lib/shared-types/competition-scraping.test.ts` (all GREEN); 6 Playwright UI-mechanical test cases at `tests/playwright/p29-manual-add-url-modal.spec.ts` — all `test.skip()` today pending the React-bundle stub-page rig captured as **P-30** in the polish backlog.

**Deferred items captured per Rule 14e + Rule 26:**

- **P-30** — Playwright React-bundle stub-page rig that bundles React + ReactDOM + Slice #1+#2+#3 modal components via esbuild, served by `tests/playwright/test-server.mjs`. Unblocks the 6 skipped Slice #1 spec cases and pre-empts the same gap for Slice #2 + Slice #3. Tracked in W#2 polish backlog (`COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md`). ETA: 60-90 min in its own session.

- **P-31** — Route-handler DI refactor for testability. Today the POST handler at `urls/route.ts` wires `prisma`, `verifyProjectWorkflowAuth`, `markWorkflowActive`, `recordFlake`, `withRetry` inline; pure-function tests can't exercise it. Refactor extracts validation + Prisma-create into an injectable shape so node:test can hit it without bundling Next.js. Tracked in W#2 polish backlog. ETA: 30-45 min in its own session.

- **Empty-URL-list-locks-out-manual-add** — when a Project's W#2 URL list is empty, `CompetitionScrapingViewer`'s EmptyState renders before `UrlTable`, so the new "+ Manually add URL" button is hidden behind the "install Chrome extension" empty-state copy. Director-manual-walkthrough verification will hit this only if a Project starts at zero URLs. Captured as DEFERRED — likely lifts into a small follow-up that renders the manual-add button in the empty state too OR moves the empty-state into UrlTable so the toolbar always renders. Tracked in W#2 polish backlog as the in-text DEFERRED note inside `CompetitionScrapingViewer.tsx`'s `handleUrlAdded` JSDoc + this §B entry.

**Multi-Workflow per Rule 25:**

- Session ran on `workflow-2-competition-scraping` per `MULTI_WORKFLOW_PROTOCOL §11`.
- Schema-change-in-flight flag flipped Yes during build (per launch prompt Rule 4 handshake); flips back to No at end-of-session in this batch.
- Pull-rebase clean at session start (workflow branch up to date with origin); pull-rebase clean again before push.
- W#1 row untouched per Rule 3 ownership.
- TaskList sweep per Rule 26: 11 session tasks tracked; 2 DEFERRED items (P-30 + P-31) captured both in TaskCreate AND in this §B entry above.

**Rule 23 Change Impact Audit outcome:** Additive (safe) — confirmed at session start; proceeded. No coordinated downstream-consumer update required. Future workflows that consume W#2 data via `DATA_CATALOG.md §7` will see the new `source` field on every read path; opt-in for filtering / display / audit.

**Verification scoreboard:**

- `npx tsc --noEmit`: clean.
- `npm run build`: clean (all routes compile; no warnings).
- `node --test src/lib/shared-types/competition-scraping.test.ts`: 10/10 pass.
- `npx playwright test --project=chromium tests/playwright/p29-manual-add-url-modal.spec.ts`: 6/6 skipped as designed (P-30 + P-31 cover the run-time coverage gaps).
- Director manual walkthrough on real-independent-website end-to-end: **DEFERRED** to the next W#2 → main deploy session that brings this code to vklf.com (workflow branch isn't deployed).

**Director-approved end-of-session pick:** standard 2-commit W#2 session shape — code commit (`070820a`) pushed mid-session with Rule 9 ask; end-of-session doc batch is this commit + push.

**Affected sections:**
- §A.7 (Module 1 URL-add UX) — now also serviced by vklf.com's UrlAddModal in addition to the Chrome extension's "+ Add" gesture.
- §A.10 (Audit trail) — `source` column now load-bearing for distinguishing extension vs. manual rows.
- §A.13 (Data persistence) — schema columns landed.
- §A.18 (Recommended next-session sequence) — Slice #2 (captured-text modal) is the next pick; Slice #3 (image modal) follows.

**Cross-references:**
- Commit `070820a` (Slice #1 code; 15 files +908/-1)
- `src/app/projects/[projectId]/competition-scraping/components/UrlAddModal.tsx` (NEW; ~470 LOC)
- `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx` (toolbar button + modal mount)
- `src/app/projects/[projectId]/competition-scraping/components/CompetitionScrapingViewer.tsx` (`handleUrlAdded` callback with `id`-dedup)
- `src/lib/shared-types/competition-scraping.ts` (`SOURCES` vocabulary + `isSource` guard + `source` on URL/text/image DTOs)
- `src/lib/shared-types/competition-scraping.test.ts` (10 node:test cases)
- `tests/playwright/p29-manual-add-url-modal.spec.ts` (6 skipped UI-mechanical cases; structural placeholder for the P-30 bundle-rig session)
- `prisma/schema.prisma:269,309,337` (the three `source` column additions)
- `ROADMAP.md` W#2 row Last Session prepended + (a.30) flipped ✅ SHIPPED-AT-CODE-LEVEL + new (a.31) RECOMMENDED-NEXT Slice #2; schema-change-in-flight flag flipped back to No.
- `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — P-29 section flipped Slice #1 ✅ SHIPPED-AT-CODE-LEVEL; new P-30 + P-31 polish entries appended.
- `NEXT_SESSION.md` rewritten for Slice #2.

---

### 2026-05-15-c — session_2026-05-15-c_w2-p29-slice-2-build-session (Claude Code, on `workflow-2-competition-scraping`)

**Session purpose:** P-29 Slice #2 BUILD session — ship the manual-add captured-text modal on the URL-detail page, per the 2026-05-15 design pass's frozen decisions + the Slice #1 ship's already-plumbed `source` end-to-end work. Closes (a.31) RECOMMENDED-NEXT.

**What shipped at code level (commit `a9e2bf5` on `workflow-2-competition-scraping`, pushed origin mid-session with Rule 9 approval):**

- **API route update** (`src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/text/route.ts`): POST handler accepts optional `source` in the request body; validates via `isSource` from `src/lib/shared-types/competition-scraping.ts` (Slice #1's export); rejects misshapen values with 400 + explicit error message; default `'extension'` server-side when omitted (preserves Chrome extension's existing POST traffic byte-for-byte — extension's `CreateCapturedTextRequest` payload doesn't carry `source`, so backward-compatible). Persists on `createData` via the new `source` column Slice #1 already added to the `CapturedText` table.

- **UI: `CapturedTextAddModal.tsx`** (new ~370 LOC component at `src/app/projects/[projectId]/competition-scraping/components/CapturedTextAddModal.tsx`): 3-field form mirroring the extension's right-click text-capture flow — Text (required, multi-line textarea — typical paste target) + Content Category (optional plain text input; vocabulary autocomplete deferred to a future polish item per design hint) + Tags (optional comma-separated input parsed to `string[]` with whitespace-trim + empty-drop). Autofocus on the Text textarea; Escape / Cancel / X / backdrop dismiss (only when not submitting); inline validation surface; submit-in-flight lock disables all controls + dismiss paths to prevent orphan POSTs. POSTs `source: 'manual'` + `clientId: crypto.randomUUID()` so retries hit the route's idempotent path. Mirrors UrlAddModal exactly in shape + dismiss UX + style; the smaller form (3 fields vs. 9) drops the platform picker + numeric validators.

- **URL-detail page wire-in** (Q5 outcome — modal pattern; director-picked button location: **right end of "Captured Text" section h2 row**, per the session-start Rule 14f forced-picker): `CapturedTextSubsection` in `UrlDetailContent.tsx` now accepts `projectId` + `urlId` + `onTextAdded` props; owns internal `modalOpen` state; renders a flex row containing the h2 + count on the left and the green "+ Manually add captured text" button (`data-testid="manual-add-captured-text-button"`) on the right; mounts the modal at the bottom of the section. Parent `UrlDetailContent` owns `handleTextAdded` callback that prepends the newly-created row to `textSlot.data` with `clientId`-dedup (existing-row match → replace in place; no match → prepend at index 0) — mirrors `CompetitionScrapingViewer.handleUrlAdded`'s id-dedup pattern from Slice #1 but switches the dedup key to `clientId` since text rows are idempotent-on-clientId per the API route's contract.

- **Tests**: NEW `tests/playwright/p29-manual-add-captured-text-modal.spec.ts` (~155 LOC) — 8 UI-mechanical test cases at the launch-prompt-picked path (director picked "new file" via the session-start Rule 14f forced-picker; alternative was "append to existing Slice #1 spec"); all `test.skip()` today pending P-30 React-bundle stub-page rig. Cases mirror the Slice #1 spec's 6 cases + add 2 new ones specific to Slice #2: (a) "Submit with optional fields serializes contentCategory + parsed tags" — covers the comma-parse logic; (b) "clientId-dedup — duplicate-create 200 response replaces existing row in-place" — covers `handleTextAdded`'s clientId-dedup behavior.

- **No new node:test cases needed**: Slice #1's `src/lib/shared-types/competition-scraping.test.ts` `isSource` regression already covers Slice #2's new POST-handler validation branch (same guard, same vocabulary). 10/10 cases still pass.

**Deferred items captured per Rule 14e + Rule 26:**

- **Director manual walkthrough on real-Independent-Website URL on vklf.com — DEFERRED to W#2 → main deploy session #14**. Workflow branch isn't deployed; deferral count now stands at TWO (Slice #1's walkthrough also deferred to the same session). The combined deploy session will exercise both new modals end-to-end. Captured as (a.32) RECOMMENDED-NEXT in ROADMAP W#2 row.

**No new polish items captured this session** (P-30 + P-31 from Slice #1 still cover all three slices' regression-coverage gaps; nothing new surfaced).

**Multi-Workflow per Rule 25:**

- Session ran on `workflow-2-competition-scraping` per `MULTI_WORKFLOW_PROTOCOL §11`.
- Schema-change-in-flight flag stays "No" entire session (no schema work this slice — Slice #1 covered all 3 W#2 tables).
- Pull-rebase clean at session start (workflow-2 3 commits ahead of `origin/main` — 2026-05-15 design batch `948a1a9` + Slice #1 code `070820a` + Slice #1 doc batch `b5711e1`); no fetch-during-session.
- W#1 row untouched per Rule 3 ownership.
- TaskList sweep per Rule 26: 7 session tasks tracked; all 7 closed; zero `DEFERRED:` items at session end.

**Rule 23 Change Impact Audit outcome:** Additive (safe) — confirmed at session start. The new POST `source` field is optional + defaulted server-side; existing extension POST traffic is byte-for-byte unchanged; no coordinated downstream-consumer update required. Future workflows that consume W#2 captured-text data via `DATA_CATALOG.md §7` will see the `source` field on every read path (Slice #1 already plumbed it); opt-in for filtering / display / audit.

**Verification scoreboard:**

- `npx tsc --noEmit`: clean (one path-fix during build: `../../components` → `../../../components` for the modal import — caught immediately by the type-check; not a CORRECTIONS_LOG-tier slip).
- `npm run build`: clean (all 49 routes compile; no warnings).
- `node --test src/lib/shared-types/competition-scraping.test.ts`: 10/10 pass (unchanged from Slice #1).
- `npx playwright test --project=chromium tests/playwright/p29-manual-add-captured-text-modal.spec.ts`: 8/8 skipped as designed (P-30 + P-31 still cover the run-time coverage gaps).
- Project-wide eslint: +1 error of the same `react-hooks/set-state-in-effect` class Slice #1's `UrlAddModal.tsx` already shipped with (same accepted pattern, baseline parity by class — the reset-on-close effect mirrors Slice #1's shape verbatim).
- Director manual walkthrough on real-Independent-Website end-to-end: **DEFERRED** to W#2 → main deploy session #14 (workflow branch isn't deployed).

**Director-approved end-of-session pick (§4 Step 1c interview):** **W#2 → main deploy session #14 for Slices #1 + #2** (Option A, recommended). Rationale per `feedback_recommendation_style.md`: most thorough — exercises both new modals on real-website data BEFORE Slice #3 piles more code on top; catches deploy-time / live-DB integration issues earlier; releases the twice-deferred walkthrough debt in a single deploy session. Slice #3 (image modal — biggest) picks up build sequence on a clean branch state after deploy #14 lands.

**Director-approved end-of-session pick (Rule 9 push approval):** standard W#2 build-session shape — code commit `a9e2bf5` pushed mid-session with explicit Rule 9 approval; end-of-session doc-batch commit + push covered by the same approval per `feedback_approval_scope_per_decision_unit.md` (approval-scope-per-decision-unit).

**Affected sections:**
- §A.7 (Module 1 URL-add UX + Module 2 captured-text UX) — captured-text is now also serviced by vklf.com's `CapturedTextAddModal` in addition to the Chrome extension's right-click highlight-and-add gesture.
- §A.10 (Audit trail) — `source` column now load-bearing for distinguishing extension vs. manual rows across both URL + captured-text scopes after Slice #2.
- §A.13 (Data persistence) — no schema change (Slice #1 covered).
- §A.18 (Recommended next-session sequence) — deploy #14 for Slices #1+#2 is the next pick; Slice #3 follows after the deploy.

**Cross-references:**
- Commit `a9e2bf5` (Slice #2 code; 4 files +682/-21)
- `src/app/projects/[projectId]/competition-scraping/components/CapturedTextAddModal.tsx` (NEW; ~370 LOC)
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` (handleTextAdded with `clientId`-dedup + CapturedTextSubsection prop expansion + section-header row + button + modal mount)
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/text/route.ts` (POST `source` acceptance + `isSource` validation + default `'extension'` + persist on createData)
- `tests/playwright/p29-manual-add-captured-text-modal.spec.ts` (8 skipped UI-mechanical cases; structural placeholder for the P-30 bundle-rig session)
- `src/lib/shared-types/competition-scraping.ts` — `CreateCapturedTextRequest.source?: Source` field (Slice #1's plumbing; load-bearing this slice on the write path)
- `src/lib/shared-types/competition-scraping.test.ts` — 10 node:test cases (unchanged; `isSource` regression now also covers Slice #2's POST validation branch)
- `ROADMAP.md` W#2 row Last Session unchanged this session per existing convention (header line carries session-by-session delta); W#2 row Next Session column updated: (a.31) flipped ✅ SHIPPED-AT-CODE-LEVEL + new (a.32) RECOMMENDED-NEXT W#2 → main deploy session #14; schema-change-in-flight stays No.
- `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — P-29 section status updated to "DESIGN COMPLETE + Slice #1 SHIPPED + Slice #2 SHIPPED AT CODE LEVEL" + new "P-29 Slice #2 SHIPPED" section appended.
- `NEXT_SESSION.md` rewritten 2026-05-15-c for W#2 → main deploy session #14.

---

### 2026-05-15-d — session_2026-05-15-d_w2-main-deploy-session-14-p29-slices-1-and-2-plus-six-walkthrough-polish-fixes (Claude Code, dual-branch — main for deploy + fixes; workflow-2 fast-forwarded each cycle)

**Session purpose:** W#2 → main deploy session #14 — bring P-29 Slices #1 + #2 to vklf.com + director manual walkthrough end-to-end smoke on a real Independent Website URL. Closes (a.32) RECOMMENDED-NEXT.

**Deploy execution:** Pre-deploy verification scoreboard on `workflow-2-competition-scraping` all GREEN (tsc + build + 10/10 node:test + 14/14 Playwright skipped). 5 commits ahead of `origin/main`, 0 behind. `git checkout main && git pull --rebase origin main` no-op. `git merge --ff-only workflow-2-competition-scraping` clean ff. Re-ran scoreboard on `main` post-merge — all GREEN. Rule 9 deploy-gate ask with full describe-before-push (commits / user-visible changes / reversibility). Director approved Option A "Yes, push." `git push origin main 2d3e2a7..66ee6ff`. Vercel auto-redeploy fired; director confirmed green.

**Director walkthrough on real Independent Website URL `diverticleanse.com`:** Hybrid Rule 27 verification — director-batched checklist (all parts at once, then "all green" or 🔴 + which step failed) per director's preferred style this session. Part A (URL modal) ✅ green; Part B (captured-text modal) ✅ green; Part C (Chrome extension regression spot-check — extension's existing right-click captured-text gesture writes default `source='extension'` row) ✅ green.

**Four NEW polish items found during walkthrough — all fixed + deployed + verified in same session (Slice #2.5 polish-batch):**

- **P-32** — Competition Category field in manual-add URL modal swapped from plain text input to `<VocabularyPicker>` dropdown. Reuses the same VocabularyPicker component the URL detail page's inline-edit fields use. Added two new optional props (`autoFocus` default `true`; `inputStyleOverride`) so the picker is reusable inside a modal without stealing focus from the URL input or diverging visually. Existing inline-edit callers unchanged.

- **P-33** — URL field in manual-add URL modal accepts schemeless input. `type="url"` → `type="text"`; `handleSubmit` auto-prepends `https://` if the input doesn't already start with `http://` or `https://`. Director picker pick: option (i) auto-prepend over option (ii) save-as-typed.

- **P-34** — Manual-add URL modal pre-selects Platform when opened from a platform-filtered view. New optional `defaultPlatform?: Platform` prop on `UrlAddModal`; threaded from `CompetitionScrapingViewer` (which reads `?platform=` URL query param) through `UrlTable` to `UrlAddModal`. "All" view → `defaultPlatform` is `undefined` → fallback to existing first-platform default; specific filter → modal pre-selects that platform.

- **P-35** — Content Category field in manual-add captured-text modal swapped from plain text input to `<VocabularyPicker>` dropdown (vocabulary type `content-category`). Same fix shape as P-32.

All four shipped in commit `cd215bb` (5 files +66/-22). Pushed origin/main + workflow-2 fast-forwarded. Director re-walkthrough — "all green."

**Two MORE NEW polish items found during re-walkthrough — both fixed + deployed + verified in same session:**

- **P-36** — Extension's in-page URL-add overlay (content-script context — `extensions/competition-scraping/src/lib/content-script/url-add-form.ts`) Competition Category swapped from plain text input to sentinel-based `<select>` mirroring the popup `CapturedTextPasteForm.tsx`'s content-category dropdown pattern. New `makeCategoryField()` helper builds the `<select>` + hidden free-text input revealed when sentinel picked + load-error inline note. Async-loads existing entries via `listVocabularyEntries(projectId, 'competition-category')` from the existing api-bridge (routed through background to vklf.com). `handleSave` upserts the new vocabulary entry FIRST via `createVocabularyEntry` if sentinel picked + non-empty input, then proceeds with the URL POST. Fresh extension build packaged: `plos-extension-2026-05-15-d-w2-deploy-14-fix-5.zip` (187 KB) at repo root for director sideload.

- **P-37** — VocabularyPicker dropdown popover background lifted for contrast against modal bg. Popover was `#161b22` (matching modal dialog `#161b22` exactly — invisible blend). Changed to `#21262d` (clearly lighter) + stronger border `#484f58` + deeper shadow `0 8px 24px rgba(0,0,0,0.7)` + visible row divider `#373d44` + brighter text `#e6edf3`. Single-file change in `VocabularyPicker.tsx`. Affects both new modal callers AND existing inline-edit callers (free contrast improvement everywhere).

P-37 shipped in commit `d3a44a0`; P-36 shipped in commit `688f310`. Each pushed origin/main + workflow-2 fast-forwarded. Director re-walkthrough — "all green" web + "extension all green" extension sideload verification.

**Two CORRECTIONS_LOG INFORMATIONAL entries this session:**

- Extension tsc test-fixture slip carried from Slice #1 (`captured-text-validation.test.ts` CompetitorUrl fixture missing `source: 'extension'` field). Slice #1's verification scoreboard ran only root tsc, not extension's own `npm run compile`. Caught when Fix #5 needed `npm run compile`; fixed inline this session (test fixture updated to include `source: 'extension'`). Operational note: shared-types-touching slice sessions should include extension tsc in verification scoreboard going forward.

- CWD-drift Bash slip recurrence — second observation of this slip class (first was 2026-05-12-c). Caught + recovered same-session via absolute paths. Codified into operational practice: prefer absolute paths over `cd <subdir>` in Bash invocations; when `cd` is unavoidable (workspace-local commands), explicitly reset before next conceptual unit of work.

**Director-approved end-of-session pick** (§4 Step 1c interview): **Slice #3 BUILD session** (manual-add captured-image modal with three input modalities — drag-drop + clipboard paste + URL-of-image text field — plus new server-side URL-fetch endpoint with SSRF allowlist + content-type + size guardrails per the 2026-05-15 design pass's Q1 outcome). (a.33) RECOMMENDED-NEXT. NEXT_SESSION.md rewritten.

**Multi-Workflow per Rule 25:** Dual-branch session — initial pre-deploy verification on `workflow-2-competition-scraping`, ff-merge + deploy on `main`, three ping-pong sync cycles (commit on main + push + fast-forward workflow-2 to keep slice #3 base clean). Pull-rebase clean at all checkpoints. Schema-change-in-flight stays "No" entire session. W#1 row untouched per Rule 3 ownership.

**Rule 23 Change Impact Audit outcome:** Additive (safe) for all six fixes — VocabularyPicker's two new props are optional with defaults preserving prior behavior; UrlAddModal's new `defaultPlatform` prop is optional; the extension Competition Category dropdown writes to the same `competitionCategory` field on `CompetitorUrl` via the same POST endpoint; the schema-level `competitionCategory` column was already a nullable `String`. No coordinated downstream-consumer update required.

**Affected sections:**
- §A.7 (Module 1 URL-add UX) — now also serviced by vklf.com's UrlAddModal with VocabularyPicker for Competition Category + schemeless-URL tolerance + platform pre-select from filtered view; extension's URL-add overlay also gained a Competition Category dropdown (sentinel-based <select> mirroring popup).
- §A.7 (Module 2 captured-text UX) — vklf.com's CapturedTextAddModal now uses VocabularyPicker for Content Category.
- §A.18 (Recommended next-session sequence) — Slice #3 image modal is the next pick (a.33).

**Cross-references:**
- Commits `cd215bb` (Slice #2.5 web — 5 files +66/-22) + `d3a44a0` (Fix #6 contrast — 1 file +12/-6) + `688f310` (Fix #5 extension — 1 file +189/-10) + doc-batch commit (this session's wrap)
- `plos-extension-2026-05-15-d-w2-deploy-14-fix-5.zip` (187 KB) at repo root
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/VocabularyPicker.tsx` (new optional props + contrast lift)
- `src/app/projects/[projectId]/competition-scraping/components/UrlAddModal.tsx` (Fixes #1-#3 web)
- `src/app/projects/[projectId]/competition-scraping/components/CapturedTextAddModal.tsx` (Fix #4 web)
- `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx` (Fix #3 prop threading)
- `src/app/projects/[projectId]/competition-scraping/components/CompetitionScrapingViewer.tsx` (Fix #3 prop threading)
- `extensions/competition-scraping/src/lib/content-script/url-add-form.ts` (Fix #5 extension)
- `extensions/competition-scraping/src/lib/captured-text-validation.test.ts` (pre-existing Slice #1 slip fix)
- ROADMAP W#2 row (a.32) ✅ DONE + new (a.33) RECOMMENDED-NEXT Slice #3
- COMPETITION_SCRAPING_VERIFICATION_BACKLOG — new "Deploy session #14 — P-29 Slices #1+#2 DEPLOYED + FULL VERIFY 2026-05-15-d" section + new P-32 through P-37 entries
- CORRECTIONS_LOG 2026-05-15-d — two new INFORMATIONAL entries

---

### 2026-05-15-e — session_2026-05-15-e_w2-p29-slice-3-build-session (Claude Code, on `workflow-2-competition-scraping`)

**Session purpose:** P-29 Slice #3 BUILD session — ship the manual-add captured-image modal with all three input modalities (drag-drop + clipboard paste + URL-of-image text field) + NEW server-side SSRF-guarded URL-fetch endpoint + NEW pure-function `ssrf-guard.ts` security boundary + 37 security-class node:test cases, per the 2026-05-15 design pass's Q1 outcome. Closes (a.33) RECOMMENDED-NEXT.

**What shipped at code level** (single bundled code+doc commit on `workflow-2-competition-scraping`):

- **NEW `src/lib/ssrf-guard.ts`** (~720 LOC) — pure-function IP classification module. **`classifyAddress(address)`** returns `{ allowed: true }` or `{ allowed: false, reason, address }` for any IPv4 + IPv6 string. Covers (v4) RFC 1918 private (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) + loopback (127.0.0.0/8) + link-local (169.254.0.0/16; covers AWS/GCP/Azure metadata) + CGNAT (100.64.0.0/10) + TEST-NET (192.0.2/24, 198.51.100/24, 203.0.113/24) + multicast (224.0.0.0/4) + broadcast (255.255.255.255) + reserved (240.0.0.0/4); (v6) loopback (::1) + unspecified (::) + link-local (fe80::/10) + unique-local (fc00::/7 incl. fd00::/8) + multicast (ff00::/8) + documentation (2001:db8::/32). IPv4-mapped IPv6 (`::ffff:a.b.c.d`) and NAT64 (`64:ff9b::a.b.c.d`) decompose to v4 and defer — closes the classic SSRF-bypass attempt of encoding a private v4 as a v6 to dodge a v4-only blocklist. **`validateUrlPreResolve(rawUrl)`** runs scheme rejection (only http: / https: allowed; rejects file: / data: / javascript: / ftp: / gopher: / ws: / about:) + cloud-metadata hostname blocklist (defense-in-depth: `metadata.google.internal` / `metadata.goog` / `metadata`) + literal-IP classification for bracketed `[::1]` form. **`resolveAndValidate(hostname, lookupFn?)`** does DNS lookup with `{ all: true }` and rejects if ANY returned IP is in a blocked range (catches DNS rebind via multi-record return). **`safeFetch(rawUrl, opts)`** is the high-level shim: validates URL → pre-resolves + validates ALL IPs → picks one (preferring v4) → re-validates → connects directly to the validated IP via Node's built-in `http(s).request({ host: <ip>, port, path, headers: { host: <hostname> }, servername: <hostname>, family, lookup: stub-returning-validated-ip })` — the stub `lookup` closes the DNS-rebind window entirely because the connect never re-resolves; the override-Host header + SNI servername keep vhosted servers serving the right virtual host with the right cert. Streams body with maxBytes cap + wall-clock timeout + socket.setTimeout + 3xx redirect refusal (explicit `redirect: 'manual'`-equivalent via direct `http.request` which doesn't auto-follow).

  **SSRF design decision:** Option A from session-start drift check (manual DNS resolve + connect-by-IP + override-Host header + TLS SNI). Picked over Option B (manual resolve + re-trust at fetch time) or Option C (small dependency like `ssrf-req-filter` or `undici` Agent connect-callback) because Option A is the most defensive — eliminates the DNS-rebind attack window entirely by never letting any code path re-resolve the hostname after validation. Implemented WITHOUT adding any new npm dependency (no `undici` import needed; Node stdlib `http(s).request` has the exact `lookup` override knob we needed). Decision recorded inside the file's top docblock.

- **NEW `src/lib/ssrf-guard.test.ts`** (~565 LOC, 37 node:test cases all GREEN) — security-class coverage for every BlockReason: each IPv4 block range tested with representative + boundary addresses (e.g., 172.15.0.1 and 172.32.0.1 verified as PUBLIC just outside the /12); each IPv6 block range tested; IPv4-mapped IPv6 v4-defer including the `::ffff:127.0.0.1` SSRF-bypass attempt; NAT64 v4-defer; bracketed `[::1]` form; representative public addresses (Cloudflare 1.1.1.1, Google 8.8.8.8, Quad9 9.9.9.9, plus v6 equivalents); scheme rejection across 7 non-http(s) schemes; metadata-hostname rejection including UPPERCASE form (URL parser canonicalizes to lowercase); literal-IP-in-URL rejection across both IPv4 + bracketed-IPv6 forms; URLs with userinfo + port + query (allowed by classifier — credentials are not the SSRF concern); injected-lookupFn DNS-rebind catch — `resolveAndValidate` rejects when one of multiple returned IPs is private (the canonical multi-record rebind attack); malformed-IPv4 rejection (octet>255, leading zeros for octal ambiguity, wrong octet count); empty + non-string input safety.

- **NEW `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/images/fetch-by-url/route.ts`** (~280 LOC) — POST endpoint that powers the "or paste an image URL" modality. Body `{ imageUrl }`. Flow: (1) `verifyProjectWorkflowAuth` standard auth gate; (2) parent CompetitorUrl scope-check (forged urlId from another Project → 404); (3) `safeFetch(imageUrl, { timeoutMs: 10_000, maxBytes: IMAGE_UPLOAD_MAX_BYTES })` — 5 MB cap matches the rest of W#2 image flow (STACK_DECISIONS §3); (4) Content-Type validation against `ACCEPTED_IMAGE_MIME_TYPES` (the 3-MIME set jpeg/png/webp — refuses application/octet-stream + svg + heic + heif); (5) defense-in-depth size re-check; (6) `composeStoragePath` + NEW `uploadBytesAsServer` server-side direct upload to Supabase Storage (admin client; upsert:true; bypasses signed-URL handshake since server has bytes already); (7) `getFullSizeUrl` mints a 1-hour signed preview URL; (8) returns `FetchImageByUrlResponse` with `capturedImageId + storagePath + mimeType + fileSize + previewUrl`. Maps each `BlockReason` to a sensible HTTP status (timeout→504; body-too-large→413; redirect-blocked/http-error/network-error→502; invalid-scheme→400; private/loopback/link-local/etc→403; invalid-address→400) + a user-facing error message that doesn't leak internal detail.

- **NEW `src/app/projects/[projectId]/competition-scraping/components/CapturedImageAddModal.tsx`** (~640 LOC) — three input modalities in a single modal: (a) **drag-and-drop zone** with dashed border + dragover highlight + multi-file-drop "first only" with warning; (b) **clipboard-paste listener** active only while modal is open AND no image already loaded (doesn't clobber an in-progress drop or fetch); (c) **"or paste an image URL" text field** with client-side scheme check before POSTing to `fetch-by-url`. State modeled as a discriminated union — `LoadedImage = { kind: 'local', blob, mimeType, fileSize, objectUrl, filename? } | { kind: 'fetched', capturedImageId, storagePath, mimeType, fileSize, previewUrl }` — so the submit handler routes correctly: 'local' goes through Phase 1 (requestUpload) + Phase 2 (PUT bytes to signed URL) + Phase 3 (finalize); 'fetched' skips Phase 1+2 (bytes already uploaded server-side) and goes straight to Phase 3. Both paths POST `source: 'manual'` explicitly on finalize. Mirrors `CapturedTextAddModal` + `UrlAddModal` shape exactly (Escape / Cancel / X / backdrop dismiss / submit-in-flight lock / `crypto.randomUUID()` clientId). Optional metadata fields: Image Category (VocabularyPicker with vocabulary type `image-category`), Composition (textarea), Embedded Text (textarea), Tags (comma-parsed). Preview thumbnail renders from object-URL (drag-drop / paste) or from `previewUrl` (URL-fetch); "Replace…" button clears loaded image and returns modal to idle.

- **NEW `tests/playwright/p29-manual-add-captured-image-modal.spec.ts`** (~290 LOC, 17 UI-mechanical test cases all `test.skip()` pending P-30 React-bundle rig) — mirrors the Slice #1 + Slice #2 specs' shape; covers button render in section header, modal open, submit-disabled-when-no-image, each of the three input modalities including drag-drop file validation (oversize / wrong-type / multi-file), URL-fetch happy path + 403 SSRF block path + client-side scheme-reject, submit-path-A (Phase 1+2+3) + submit-path-B (URL → Phase 3 only), refreshImages firing after success, error display on finalize 4xx, all four dismiss paths, "Replace…" idle-return.

- **Modified `src/lib/shared-types/competition-scraping.ts`** — adds `FetchImageByUrlRequest` + `FetchImageByUrlResponse` interfaces (the latter includes `previewUrl: string` for client-side thumbnail display before finalize).

- **Modified `src/lib/competition-storage.ts`** — adds `uploadBytesAsServer({ storagePath, bytes, contentType })` helper for server-side direct upload bypassing the signed-URL handshake. Used by the fetch-by-url route. Admin client + upsert: true (idempotent).

- **Modified `src/app/api/.../images/finalize/route.ts`** — wires `body.source` validation via `isSource` (400 on misshapen value) + persists `createData.source ?? 'extension'` (the runtime persistence Slice #1's DTO field needed — Slice #3 completes the wire-in for image-finalize, matching what Slice #1 already did for urls/route.ts and Slice #2 for urls/[urlId]/text/route.ts). Default `'extension'` server-side preserves extension's byte-for-byte POST traffic semantics.

- **Modified `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx`** — adds `refreshImages` `useCallback` that refetches the images list endpoint after a successful manual-add (necessary because the finalize response is bare `CapturedImage` without signed URLs, while the gallery needs `CapturedImageWithUrls`; one extra round-trip is the cleanest fix without threading signed-URL minting through the extension-shared finalize path). Extends `CapturedImagesGallery` to accept `projectId` + `urlId` + `onImageAdded` props; owns internal `modalOpen` state; renders flex-row section-header with the h2 on the left + the "+ Manually add captured image" button on the right (`data-testid="manual-add-captured-image-button"`); mounts the modal at the bottom of the section.

**Rule 23 Change Impact Audit outcome:** Additive (safe). Confirmed at session start; proceeded. New endpoint + new modal + finalize route's new optional input branch. Extension's existing requestUpload+finalize traffic byte-for-byte unchanged (extension doesn't send `source`, so it continues defaulting to `'extension'` server-side). No coordinated downstream-consumer update required.

**Verification scoreboard — all GREEN:**

- `npx tsc --noEmit` clean.
- `cd extensions/competition-scraping && npm run compile` clean (per the 2026-05-15-d operational lesson — shared-types-touching slice ran extension tsc as part of scoreboard).
- `npm run build` clean (now 50 routes — new `fetch-by-url` registered).
- `node --test` on all 18 src/lib test files: **447/447 pass** — 37 new ssrf-guard cases + baseline 410 from prior sessions.
- Extension `npm test`: 334/334 pass (unchanged from 2026-05-15-d baseline — Slice #3 shared-types additions are accretive, no extension regression).
- `npx playwright test tests/playwright/p29-manual-add-captured-image-modal.spec.ts`: 17/17 skipped as designed (P-30 unblocks).
- Director manual walkthrough on real-Independent-Website end-to-end exercising all three modalities + SSRF defensive spot-check + extension regression spot-check: **DEFERRED** to W#2 → main deploy session #15 (workflow branch isn't deployed).

**Deferred items captured per Rule 14e + Rule 26:** None new this session. P-30 (Playwright React-bundle stub-page rig) + P-31 (route-handler DI refactor) from Slice #1 already cover Slice #3's regression-coverage gap.

**Director-approved end-of-session pick** (§4 Step 1c not triggered — clear continuation): **W#2 → main deploy session #15** = bring Slice #3 to vklf.com + walkthrough exercises all three modalities. This completes the P-29 three-slice manual-add arc end-to-end. (a.34) RECOMMENDED-NEXT. NEXT_SESSION.md rewritten with deploy session #15 prompt.

**Multi-Workflow per Rule 25:** Session stayed on `workflow-2-competition-scraping` end-to-end. Pull-rebase clean at session start (workflow-2 0 commits ahead of `origin/main` per pointer-file expectation post-2026-05-15-d ping-pong sync). Schema-change-in-flight stays "No" all session — no schema work (Slice #1 plumbed `source` on `CapturedImage` already). W#1 row untouched per Rule 3 ownership. TaskList sweep per Rule 26: 13 session tasks tracked + all 13 closed; zero `DEFERRED:` items at session end.

**Affected sections:**
- §A.7 (Module 2 captured-image UX) — captured-image is now also serviced by vklf.com's `CapturedImageAddModal` in addition to the Chrome extension's right-click "Save to PLOS" / region-screenshot gestures. Three input modalities: drag-drop / clipboard paste / URL-of-image with server-side SSRF guard.
- §A.10 (Audit trail) — `source` column now load-bearing across all three W#2 tables (CompetitorUrl + CapturedText + CapturedImage) after Slice #3 completes the finalize-route wire-in. Distinguishes extension-captured vs. manual-modal-captured rows everywhere.
- §A.13 (Data persistence) — no schema change (Slice #1 covered). Storage bucket `competition-scraping` continues to hold all three sources of image bytes (extension-uploaded via signed-URL Phase 1+2; manual-modal drag-drop / paste via the same Phase 1+2; manual-modal URL-fetch via server-side direct upload bypassing the signed-URL handshake).
- §A.18 (Recommended next-session sequence) — deploy session #15 for Slice #3 is the next pick (a.34); after deploy session #15, the P-29 three-slice manual-add feature is complete end-to-end.

**Cross-references:**
- Single bundled commit on `workflow-2-competition-scraping` (code + doc batch).
- `src/lib/ssrf-guard.ts` (NEW ~720 LOC) + `src/lib/ssrf-guard.test.ts` (NEW ~565 LOC, 37 tests).
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/images/fetch-by-url/route.ts` (NEW ~280 LOC).
- `src/app/projects/[projectId]/competition-scraping/components/CapturedImageAddModal.tsx` (NEW ~640 LOC).
- `tests/playwright/p29-manual-add-captured-image-modal.spec.ts` (NEW ~290 LOC, 17 skipped).
- `src/lib/shared-types/competition-scraping.ts` (FetchImageByUrlRequest + FetchImageByUrlResponse interfaces added).
- `src/lib/competition-storage.ts` (`uploadBytesAsServer` helper added).
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/images/finalize/route.ts` (`body.source` validation + persistence wire-in).
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` (`refreshImages` callback + `CapturedImagesGallery` prop expansion + section-header row + button + modal mount).
- ROADMAP W#2 row (a.33) ✅ SHIPPED-AT-CODE-LEVEL + new (a.34) RECOMMENDED-NEXT W#2 → main deploy session #15.
- COMPETITION_SCRAPING_VERIFICATION_BACKLOG — P-29 section status updated to "Slices #1+#2 DEPLOYED + Slice #3 SHIPPED AT CODE LEVEL" + new "P-29 Slice #3 SHIPPED" section appended.
- NEXT_SESSION.md rewritten 2026-05-15-e for deploy session #15.

---

### 2026-05-15-f — session_2026-05-15-f_w2-main-deploy-session-15-p29-slice-3-DEPLOYED-FULL-VERIFY (Claude Code, dual-branch — main for deploy + workflow-2 fast-forwarded after the main push)

**Session purpose:** W#2 → main deploy session #15 — bring P-29 Slice #3 (manual-add captured-image modal + SSRF-guarded `fetch-by-url` endpoint + `ssrf-guard.ts` security module) from `workflow-2-competition-scraping` to `main` → vklf.com via standard W#2 → main deploy cheat-sheet (rebase + ff-merge + Rule 9 deploy gate + push + Vercel auto-redeploy + ping-pong sync) + director walkthrough on a real Independent Website URL exercising all three input modalities + SSRF defensive spot-check + extension regression spot-check. Closes (a.34) RECOMMENDED-NEXT. **Completes the P-29 three-slice manual-add arc end-to-end on vklf.com.**

**What shipped to production this session** (zero new code; ff-merge brought 2026-05-15-e's bundled commit `8018294` onto main and into the live web bundle):

- The `+ Manually add captured image` button at the right end of every URL detail page's Captured Images section header.
- The `CapturedImageAddModal` with three input modalities (drag-drop, clipboard paste, URL-of-image text field).
- The new server-side `POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/images/fetch-by-url` endpoint.
- The `ssrf-guard.ts` security boundary protecting that endpoint.
- The `uploadBytesAsServer` storage helper for server-side direct upload (bypasses signed-URL handshake).
- The `body.source` validation + persistence wire-in on the existing `images/finalize` route.
- The `refreshImages` callback wired through `UrlDetailContent.tsx` + `CapturedImagesGallery`.

(For the full code-level shape see §B 2026-05-15-e — the BUILD session entry — this entry covers only the deploy + verification.)

**Pre-deploy scoreboard re-run on workflow-2 at session start — all GREEN:**
- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npm run compile` clean
- `npm run build` clean (50 routes — `fetch-by-url` registered)
- `node --test` on all 18 src/lib test files: **447/447 pass** (37 ssrf-guard cases + baseline 410)
- Extension `npm test`: **334/334 pass** (unchanged — Slice #3 shared-types additions accretive)
- `npx playwright test tests/playwright/p29-manual-add-captured-image-modal.spec.ts`: 17/17 skipped as designed (pending P-30 React-bundle rig)

**Deploy execution per `MULTI_WORKFLOW_PROTOCOL.md` standard W#2 → main path:**
1. `git checkout main && git pull --rebase origin main` — clean; main at `1607933` (deploy-#14's end-of-session doc-batch commit, unchanged since 2026-05-15-d).
2. `git merge --ff-only workflow-2-competition-scraping` — clean fast-forward `1607933..8018294`; 15 files +3124/-73 (incl. 5 new code/test files: `ssrf-guard.ts` + `ssrf-guard.test.ts` + `fetch-by-url/route.ts` + `CapturedImageAddModal.tsx` + Playwright Slice #3 spec; 4 modified code files: `shared-types/competition-scraping.ts` + `competition-storage.ts` + `finalize/route.ts` + `UrlDetailContent.tsx`; 6 modified docs: ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + NEXT_SESSION + COMPETITION_SCRAPING_DESIGN + COMPETITION_SCRAPING_VERIFICATION_BACKLOG).
3. **Rule 9 deploy gate** — issued via `AskUserQuestion` forced-picker (Yes — push to main / No — hold off / I have a question first). Director picked Yes. Plain-language deploy describe covered: what user-visible change goes live (new "+ Manually add captured image" button + three input modalities + new server-side endpoint + SSRF guardrail), what does NOT change (Chrome extension byte-for-byte unchanged; no schema change), reversibility (revert commit 8018294 if anything breaks; additive change), what happens after push (Vercel auto-redeploy ~1-2 min, then workflow-2 sync, then walkthrough).
4. `git push origin main` — pushed `1607933..8018294`. Vercel auto-redeployed cleanly.
5. `git checkout workflow-2-competition-scraping && git push origin workflow-2-competition-scraping` — pushed `1607933..8018294` to keep workflow-2 in lockstep with main (ping-pong sync; same Rule 9 approval scope per `feedback_approval_scope_per_decision_unit.md`).

**Rule 23 Change Impact Audit outcome:** Additive (safe). Confirmed at session start. Slice #3's new endpoint + new modal + new SSRF guard + finalize route's new optional `source` input branch are all additive — extension's existing `requestUpload + finalize` traffic byte-for-byte unchanged; no coordinated downstream-consumer update required.

**Director manual walkthrough on real Independent Website URL — all five parts ✅ GREEN in a single batched pass** (deploy #14 director-preferred reporting style — director ran all five parts end-to-end before reporting back with "all green"):
- **Part A — drag-and-drop modality:** drag a JPEG/PNG/WebP from desktop into the drop zone → dropzone highlights on dragover → drop produces a preview thumbnail + mime + size text → optional metadata fields fillable (Image Category via VocabularyPicker, Composition, Embedded Text, Tags) → Save → modal closes → new row appears in the gallery. ✅
- **Part B — clipboard paste modality:** modal reopened with no image; Ctrl/Cmd+V with a clipboard image → preview thumbnail appears → Save → new row in gallery. ✅
- **Part C — URL-of-image modality (the new server-side endpoint):** paste a real public image URL into the URL text field → click Fetch image → spinner (~1-3s) → preview thumbnail appears with the fetched image → Save → new row in gallery (server-side direct upload bypassing signed-URL handshake). ✅
- **Part D — SSRF defensive spot-check:** paste a private-range URL (e.g., `http://localhost/...` / `http://192.168.x.x/...` / `http://169.254.169.254/computeMetadata/v1/`) → click Fetch image → inline plain-language error rejecting the resolve (no successful fetch; no preview; the SSRF guard fires as designed). ✅
- **Part E — Chrome extension regression spot-check:** with the extension active on any supported platform (Amazon / eBay / Etsy / Walmart / Google Shopping / Google Ads / Independent Website), saved an image via the existing right-click "Save to PLOS" or region-screenshot gesture → row appears in gallery as before; `source='extension'` default persisted (defense in depth — extension's POST traffic is byte-for-byte unchanged from pre-Slice-#3 because the extension doesn't send a `source` field, so the route falls through to the `'extension'` default). ✅

**Zero walkthrough-found polish items** — Slice #3 + Slices #1+#2's foundation work shipped cleanly into production on the first deploy cycle. Contrast deploy session #14 (three deploy cycles + six walkthrough-found polish fixes P-32 through P-37) — this session's single-pass green outcome reflects the maturity of the P-29 three-slice arc by Slice #3 (and the design-rigor of the 2026-05-15 design pass that frontloaded the cross-modality + SSRF + symmetric-permission decisions).

**P-29 three-slice arc completion summary:**

| Slice | What it shipped | Built | Deployed |
|---|---|---|---|
| #1 | Manual-add URL modal + `source` schema migration on all 3 W#2 tables | 2026-05-15-b | 2026-05-15-d (deploy session #14) |
| #2 | Manual-add captured-text modal on URL-detail page | 2026-05-15-c | 2026-05-15-d (deploy session #14) |
| #3 | Manual-add captured-image modal (3 modalities) + SSRF-guarded `fetch-by-url` endpoint + `ssrf-guard.ts` module | 2026-05-15-e | **2026-05-15-f (deploy session #15 — this session)** |

The manual-add feature is now end-to-end on vklf.com. Admins can add URLs (Slice #1 toolbar button), captured texts (Slice #2 section-header button on URL detail page), and captured images (Slice #3 section-header button on URL detail page with three input modalities) without using the Chrome extension. The original 2026-05-07 deliberate deferral of "manual-add UI on vklf.com" is fully closed.

**Deferred items captured per Rule 14e + Rule 26:** None new this session. The pre-existing P-30 (Playwright React-bundle rig) and P-31 (route-handler DI refactor) captured during Slice #1's build still cover the regression-coverage gap for the entire three-slice arc.

**Director-approved end-of-session pick** (§4 Step 1c forced-picker fired — P-29 arc wrapped with no obvious continuation): **P-30 Playwright React-bundle stub-page rig** = (a.35) RECOMMENDED-NEXT. Rationale per `feedback_recommendation_style.md`: most thorough/reliable next pick — locks in mechanical-UX regression coverage for the entire P-29 manual-add feature while the modal code is fresh; converts the 31 currently-skipped Playwright cases (17 image + 8 text + 6 URL) into running coverage in one session; highest-leverage choice because every future P-29-area polish/walkthrough then has automated regression coverage at zero director-time cost. NEXT_SESSION.md rewritten 2026-05-15-f with the P-30 build session prompt + Rule 14f forced-picker among the four candidate rig shapes (Vite stub-page / Next.js test-only route / Playwright Component Testing / JSDOM unit tests).

**Multi-Workflow per Rule 25:** dual-branch session — pre-deploy scoreboard verification on `workflow-2-competition-scraping`, ff-merge + deploy phases on `main`, one ping-pong sync after the main push (both branches now at `8018294`). Pull-rebase clean at all checkpoints. Schema-change-in-flight stays "No" entire session (no schema work — Slice #1's `source`-column migration already in place since 2026-05-15-b). W#1 row untouched per Rule 3 ownership. **TaskList sweep per Rule 26:** 6 session tasks tracked (pre-deploy scoreboard / checkout main + pull + ff-merge / Rule 9 deploy gate + push main / push workflow-2 sync / director walkthrough Parts A-E / end-of-session doc batch); all 6 closed by end-of-session; zero `DEFERRED:` items at session end. **Three pushes this session:** origin/main (Rule 9-approved deploy push); origin/workflow-2 (ping-pong sync, same approval scope); end-of-session doc-batch push (same approval scope per `feedback_approval_scope_per_decision_unit.md`).

**Affected sections:**
- §A.7 (Module 2 captured-image UX) — captured-image is now also serviced by vklf.com's `CapturedImageAddModal` in addition to the Chrome extension's right-click "Save to PLOS" / region-screenshot gestures; all three input modalities are now LIVE on production for any URL detail page across all 7 supported platforms.
- §A.10 (Audit trail) — `source` column is now load-bearing across all three W#2 tables (CompetitorUrl + CapturedText + CapturedImage) in production. Distinguishes extension-captured vs. manual-modal-captured rows everywhere; per-row provenance is queryable.
- §A.13 (Data persistence) — no schema change. Storage bucket `competition-scraping` holds all three sources of image bytes (extension-uploaded via signed-URL Phase 1+2; manual-modal drag-drop / paste via the same Phase 1+2; manual-modal URL-fetch via server-side direct upload bypassing the signed-URL handshake via `uploadBytesAsServer`).
- §A.18 (Recommended next-session sequence) — P-29 three-slice arc fully closed; next pick is P-30 (test-infrastructure work that converts the 31 currently-skipped Playwright cases into running regression coverage).

**Cross-references:**
- Single doc-batch commit on `main` (this session — code changes were carried by the ff-merge of 2026-05-15-e's bundled commit `8018294`).
- ROADMAP W#2 row (a.34) ✅ DONE + new (a.35) RECOMMENDED-NEXT P-30 Playwright React-bundle rig.
- COMPETITION_SCRAPING_VERIFICATION_BACKLOG new "Deploy session #15 — P-29 Slice #3 DEPLOYED + FULL VERIFY 2026-05-15-f" section at top + Slice #3 SHIPPED-AT-CODE-LEVEL section's pending-verification table flipped DEFERRED → ✅ PASS for all 12 rows.
- NEXT_SESSION.md rewritten 2026-05-15-f for P-30 build session.

---

### §B 2026-05-15-g — P-30 Playwright React-bundle stub-page rig SHIPPED at code level

**Session:** `session_2026-05-15-g_w2-p30-playwright-react-bundle-rig` (Claude Code, on `workflow-2-competition-scraping`).
**Commit:** `0548da7` on `workflow-2-competition-scraping`.
**Closes:** (a.35) RECOMMENDED-NEXT.
**Director-approved next pick (§4 Step 1c forced-picker):** (a.36) — **P-31** route-handler DI refactor for testability (closes the API-layer regression-coverage gap that P-30 deliberately left out of scope; completes the P-29 area's regression-coverage trifecta — modal UI mechanical via P-30 + route-handler integration via P-31 + real-website smoke via director walkthrough).

**Rule 14f forced-picker at session start — rig shape (4 candidates):**

- **(A) Extend existing P-17 authFetch esbuild stub-page rig — director-recommended + director-picked.** Reuses `tests/playwright/build-bundle.mjs` + `test-server.mjs` + the static-HTML + esbuild bundle pattern. Add a React-aware esbuild bundle entrypoint per modal, mount each modal in a tiny stub HTML page with `window.__test*` hooks, serve via the existing node http server, drive with Playwright. Real Chromium render + real DOM (faithful drag-drop / paste / DataTransfer event handling — load-bearing for Slice #3's three modalities). Zero new tooling (React 19 + esbuild 0.28 + `@playwright/test` 1.60 already in `package.json`). Reversible — if scaling becomes painful at modal #10, can pivot to Option C without losing the spec files.
- **(B) Next.js test-only route under `src/app/__playwright__/`.** Closest to production environment; reuses Next.js dev server. Cons: ships test-code paths in the route table (gating discipline required to prevent production leakage); slower test loop because Next.js dev-server boot dominates per-test time. Less thorough than A because of the production-leakage risk + slower loop discourages running locally.
- **(C) `@playwright/experimental-ct-react`.** Playwright's first-party Component Testing runner — purpose-built for this. Cons: EXPERIMENTAL label (API can break between releases); requires a parallel config file + new build pipeline + new mount() conventions; new tooling surface to learn + maintain; locks us into a less-stable API for the entire P-29 + future modal coverage. Less reliable than A specifically because of the experimental label.
- **(D) JSDOM unit tests.** Auto-eliminated from the picker because it conflicts with Rule 27's real-browser-context intent — Slice #3's drag-drop + clipboard-paste + DataTransfer handling can't be faithfully exercised in JSDOM.

**Why Option A is most thorough/reliable per `feedback_recommendation_style.md`:** PROVEN pattern in this repo (P-17 already works); real Chromium → catches the real-DOM-specific bugs the modals can hit (drag-drop / clipboard paste / DataTransfer specifically); zero new tooling surface; director already invested in this pattern via P-17 ship; reuse vs. invent. Director picked Option A.

**Rig architecture shipped:**

The rig is a layered extension of the existing P-17 pattern:

1. **`tests/playwright/build-bundle.mjs` (modified)** — `buildAuthFetchBundle()` preserved + factored shared `define`/`alias` into module constants + NEW `buildP29ModalBundles()` that bundles three React entrypoints. esbuild handles JSX via the automatic runtime (`jsx: 'automatic'`); the `@/` path alias maps to `src/` so the modals' imports resolve identically to production; `@supabase/supabase-js` aliases to the existing `fake-supabase.ts` so authFetch's real production wiring runs without a real Supabase client.

2. **`tests/playwright/mounts/*.tsx` (NEW)** — three React mount entrypoints (URL / text / image). Each:
   - Imports React + ReactDOM (`createRoot`) + the production modal.
   - Renders a thin `<Wrapper>` that owns `isOpen` state, renders the trigger button at the test-id the corresponding spec asserts on (`manual-add-url-button` / `manual-add-captured-text-button` / `manual-add-captured-image-button`), and renders the production modal with the right prop wiring.
   - For text + image: also owns a captured-row list mirroring `UrlDetailContent.handleTextAdded` (clientId-dedup prepend) / `refreshImages` (re-fetch the gallery list after a successful save so the GET ordering can be asserted).
   - Exposes test hooks on `window` (`window.__test` / `window.__testText` / `window.__testImage`) and reads `window.__testParams` / `__testTextParams` / `__testImageParams` for per-test overrides set via `page.addInitScript()`.

3. **`tests/playwright/pages/*.html` (NEW)** — three static stub HTML pages. Each seeds `window.__fakeSupabaseState` (so authFetch passes the auth check), then `await import('/dist/<bundle-name>.bundle.js')` to side-effect-mount the wrapper, then sets `window.__pageReady = true`.

4. **`tests/playwright/test-server.mjs` (modified)** — extended with a `HTML_PAGES` map for the 3 new pages and a `/dist/<name>.bundle.js` route prefix (path-traversal-guarded: rejects bundle names containing `/` or `..`). Boot step `await Promise.all([buildAuthFetchBundle(), buildP29ModalBundles()])` builds all four bundles before listening.

**Spec authoring pattern (applied to all three P-29 specs):**

- `await page.goto(PAGE_URL); await page.waitForFunction(() => window.__pageReady === true);` to ensure the bundle has finished mounting.
- `page.route(POST_PATTERN, ...)` to intercept the modal's fetch + capture body shape (via `request.postDataJSON()`) and shape the response. Since authFetch's real production code calls `window.fetch`, the route handler fires at the browser network layer before the request leaves Chromium.
- Drive the UI via `getByTestId` (for the trigger button) + `getByLabel` (for form fields) + `getByRole('dialog' | 'button' | 'alert' | 'status')` for assertions.
- For drag-drop tests: `page.evaluateHandle()` constructs a `DataTransfer` containing synthetic `File` objects of the desired `(name, mimeType, size)` shape, then `locator.dispatchEvent('drop', { dataTransfer })`.
- For clipboard-paste tests: `page.evaluate()` constructs a `ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })` and dispatches on `document` (matching where the modal listens).
- For UUID-shape assertions on `clientId`: a small regex `^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$` matched against the captured body. Real `crypto.randomUUID()` is used in the modal — secure-context rules are satisfied because the test server runs on `127.0.0.1` which Chromium treats as secure.
- For the captured-text clientId-dedup test: `page.addInitScript()` pins `window.crypto.randomUUID` to a fixed UUID AND seeds `window.__testTextParams = { seedRows: [...] }` with an existing row sharing that UUID. The modal submits with the pinned UUID; the route fulfills 200 with the existing row's shape; the wrapper's clientId-dedup replaces in-place.

**Headline scoreboard delta (the load-bearing P-30 outcome):**

| Spec | Before P-30 | After P-30 | Delta |
|---|---|---|---|
| `p29-manual-add-url-modal.spec.ts` | 6 skipped | 6/6 PASS | +6 net new passing |
| `p29-manual-add-captured-text-modal.spec.ts` | 8 skipped | 8/8 PASS | +8 net new passing |
| `p29-manual-add-captured-image-modal.spec.ts` | 17 skipped | 16 PASS + 1 skipped (P-32) | +16 net new passing; 1 deferred |
| **Total** | **31 skipped** | **30 PASS + 1 P-32-deferred** | **+30 net new passing in one session** |

Every future P-29-area polish/walkthrough now has automated regression coverage at zero director-time cost. The rig architecture extends straightforwardly to additional W#2 modals (e.g., the future P-27/P-28 delete-confirm dialogs) — each new modal = one bundle entrypoint + one mount script + one stub HTML page + one spec file; the rig itself doesn't need re-architecting.

**P-32 polish item surfaced + captured per Rule 14e + Rule 26:**

The multi-file-drop test failed on first run, revealing a real production bug in `CapturedImageAddModal.tsx`. `onDrop` sets `setWarningMessage('N files dropped — only the first will be used')` and then `await tryLoadFile(files[0], files[0].name)`. `tryLoadFile`'s first lines are `setErrorMessage(null)` + `setWarningMessage(null)`. Both updates batch into the same React commit cycle. The later `setWarningMessage(null)` wins. The warning UI never appears on multi-file drop. P-30's whole purpose IS regression coverage — the rig caught it on first authoring. The fix is a one-liner; deferred to keep P-30 strictly test-infra-only per launch-prompt scope. P-32 capture in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (new polish-backlog entry); the corresponding Playwright test is marked `test.skip()` with a header note pointing at P-32. Will fold naturally into the start of the P-31 session — it's a `CapturedImageAddModal`-area one-line fix that demonstrates the new Playwright regression coverage flipping a skip → pass in real time.

**Verification scoreboard — all GREEN on `workflow-2-competition-scraping`:**

- `npx tsc --noEmit`: clean
- `cd extensions/competition-scraping && npm run compile`: clean
- `npm run build`: compiled successfully (52 routes — same baseline as deploy #15; no new routes since P-30 is `tests/`-only)
- `find src/lib -name "*.test.ts" | xargs node --test`: **447/447 pass** (unchanged baseline)
- `cd extensions/competition-scraping && npm test`: **334/334 pass** (unchanged baseline)
- `npx playwright test`: **63 passed + 1 skipped (P-32 deferred)** in 1.8m

**Per Rule 23 Change Impact Audit — Additive (safe):** new files only under `tests/` + minor extensions to `tests/playwright/test-server.mjs` + `tests/playwright/build-bundle.mjs`. Zero `src/` runtime impact; zero schema changes; zero shared-types changes; zero API surface changes. No downstream consumers affected.

**Affected sections:**
- §A.13 (Data persistence) — unchanged; the rig exercises the existing API contract, not the storage layer.
- §A.18 (Recommended next-session sequence) — P-30 closed; next pick is P-31 (route-handler DI refactor; (a.36) RECOMMENDED-NEXT).

**Multi-Workflow per Rule 25:** session ran on `workflow-2-competition-scraping`; schema-change-in-flight flag stays No (P-30 is test-infra-only); pull-rebase no-op at start; W#1 row untouched per Rule 3 ownership. **TaskList sweep per Rule 26:** 8 session tasks tracked + completed (Read modal components / Build rig slice 1 / Port URL spec / Port text spec / Port image spec / Verification scoreboard / End-of-session doc batch / Track P-32 deferral); 1 DEFERRED item (P-32) captured both in TaskCreate AND in the COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md new P-32 entry below; closed after the doc entry was written.

**Cross-references:**

- Commit `0548da7` on `workflow-2-competition-scraping`
- `tests/playwright/build-bundle.mjs` + `tests/playwright/test-server.mjs`
- `tests/playwright/mounts/p29-{url,text,image}-modal.mount.tsx`
- `tests/playwright/pages/p29-{url,text,image}-modal.html`
- `tests/playwright/p29-manual-add-{url,captured-text,captured-image}-modal.spec.ts`
- `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` new P-30 SHIPPED section + new P-32 polish entry + the three Slice #N SHIPPED sections' "all N currently `test.skip()`" lines flipped inline
- ROADMAP W#2 row (a.35) flipped ✅ SHIPPED-AT-CODE-LEVEL + new (a.36) RECOMMENDED-NEXT P-31 + polish backlog P-30 entry flipped ✅ SHIPPED-AT-CODE-LEVEL + new P-32 polish entry
- `NEXT_SESSION.md` rewritten 2026-05-15-g for P-31 build session

---

### 2026-05-15-h — W#2 P-31 BUILD session — route-handler DI refactor SHIPPED + P-32 multi-file-drop warning fix SHIPPED + 62 new node:test cases all passing

**Session:** `session_2026-05-15-h_w2-p31-route-handler-di-refactor` (Claude Code, on `workflow-2-competition-scraping` end-to-end). One-hundred-and-fourth Claude Code session. Closes (a.36) RECOMMENDED-NEXT.

**Session opener — P-32 one-line fix:** In `CapturedImageAddModal.tsx`, the multi-file drop warning text was set in `onDrop` then silently cleared by `tryLoadFile`'s clear-on-entry line before React commits. P-30's Playwright spec caught this bug on first authoring. Small Rule 14f forced-picker at session start (move clear out of `tryLoadFile` / re-set after `await` / pass warning text in as arg) → director picked **Option A — move the clear out of `tryLoadFile`** (smallest diff that fully eliminates the race; preserves the existing clear-on-entry semantics for the paste + file-input paths that need it). After the fix shipped + re-enabling the Playwright `test.skip()` line → captured-image spec went from **16/17 + 1 skip to 17/17 PASS** in real time, demonstrating P-30's regression coverage working end-to-end.

**Two Rule 14f forced-pickers fired for the P-31 DI seam shape:**

First picker surfaced three candidate shapes:
- **(A) Per-route closure factory** `makeHandler(deps): (req, ctx) => Promise<NextResponse>` — deps explicit at the seam. Director picked.
- **(B) Module-level pure function** `createCompetitorUrl({...deps}): Promise<{ status, body }>` — fully testable; no Next types in test surface; my recommendation per `feedback_recommendation_style.md`.
- **(C) Three-layer adapter pattern** — split route into parse / business-logic / shape.

Mid-flight probe revealed a structural constraint I missed before showing the picker: `next/server` is NOT in Next's `package.json` `exports` field (only top-level `server.js`/`server.d.ts` files exist; no subpath export points at them). `node --test --experimental-strip-types` cannot resolve `import { NextRequest } from 'next/server'`. The original Option A premise (tests construct NextRequest objects) was therefore not viable with the existing test infrastructure.

Surfaced honestly mid-flight + ran a second Rule 14f forced-picker:
- **(A') Adapt Option A** — type the inner handler against a minimal `RequestLike` interface; route shim wraps with a one-line adapter at the boundary. Tests pass a plain literal object — no `next/server` import needed. Director picked.
- (B) Switch to Option B (my original recommendation).
- (C) Add vitest+next plugin (significant test-infra investment).

Net cost ~3 min. Captured to CORRECTIONS_LOG 2026-05-15-h as INFORMATIONAL: future Rule 14f pickers involving test-runner constraints should verify the constraint BEFORE the picker fires.

**Architecture (Option A' applied to all 4 W#2 routes):**

Created `src/lib/competition-scraping/handlers/` directory containing:
- `shared.ts` — `RequestLike` + `HandlerResult` + `VerifyAuthFn` + `VerifyAuthResult` shared types.
- `urls.ts` — `makeUrlsHandlers(deps): { GET, POST }`. Each handler returns `{ status, body }`.
- `url-text.ts` — `makeUrlTextHandlers(deps): { GET, POST }`. Adds `competitorUrl.findFirst` parent-existence check.
- `images-finalize.ts` — `makeImagesFinalizeHandlers(deps): { POST }`. Adds injectable `verifyUploadedFile` + `composeStoragePath` + `bucket`.
- `images-fetch-by-url.ts` — `makeImagesFetchByUrlHandlers(deps): { POST }`. Adds injectable `safeFetch` + `uploadBytesAsServer` + `getFullSizeUrl` + `composeStoragePath` + `generateCapturedImageId`.

Each `src/app/api/projects/[projectId]/competition-scraping/.../route.ts` shim is now ~70 LOC: imports factory + production deps; builds `productionVerifyAuth` adapter (real `verifyProjectWorkflowAuth` returns NextResponse on 401 — adapter clones the body into `HandlerResult` shape); calls factory with production deps to get inner handlers; exports thin Next-typed wrappers that delegate + apply `withCors(req, NextResponse.json(result.body, { status: result.status }))`.

**Test coverage (62 new cases across 4 test files; all PASS):**

| Spec | Cases | Coverage |
|---|---|---|
| `urls.test.ts` | **16** | POST 401 / 400 invalid JSON / 400 missing/invalid platform / 400 missing/empty url / 400 invalid source / 201 happy default-source / 201 explicit source manual / 201 trim metadata + isSponsoredAd / 200 P2002 idempotent lookup / 500 prisma error → recordFlake; GET 401 / 200 no filter / 200 with platform filter / 400 invalid platform filter. |
| `url-text.test.ts` | **15** | POST 401 / 400 invalid JSON + missing fields + invalid tags/sortOrder/source / 404 parent / 201 happy + source manual / 200 P2002 / 500 prisma; GET 401 / 404 parent / 200 ordered list. |
| `images-finalize.test.ts` | **16** | POST 401 / 400 invalid JSON + missing clientId/capturedImageId + invalid mimeType/sourceType/fileSize/tags/source / 404 parent / 400 file missing in storage / 400 verifyUploadedFile throws (recordFlake fires) / 201 happy + source manual / 200 P2002 / 500 prisma. |
| `images-fetch-by-url.test.ts` | **15** | POST 401 / 400 invalid JSON + missing imageUrl / 404 parent / 403 SSRF private-v4 + metadata-hostname / 400 SSRF invalid-scheme / 504 timeout / 413 body-too-large / 502 redirect-blocked / 415 wrong + missing content-type / 502 upload throws / 502 preview-URL throws / 200 happy. |
| **Total** | **62** | All PASS. 447 baseline → **509/509 src/lib node:test cases.** |

**Verification scoreboard — all GREEN:**

- `npx tsc --noEmit`: clean
- `cd extensions/competition-scraping && npm run compile`: clean
- `npm run build`: compiled successfully (52 routes — same baseline; no new routes since P-31 is a refactor)
- src/lib node:test: **509/509 pass** (was 447 → +62 new P-31 cases — exactly matches the new test count)
- Extension `npm test`: 334/334 pass (unchanged)
- `npx playwright test`: **64/64 pass** (was 63 + 1 P-32-deferred-skip; P-32 fix flipped)

**HEADLINE DELTA: src/lib node:test went from 447/447 → 509/509 in a single session** (well over the launch-prompt's "30-40 new cases" target). Combined with P-30's UI-mechanical regression coverage + the already-DONE director walkthrough verification from deploys #14/#15, the P-29 area now has end-to-end automated regression coverage on both the UI mechanical AND the API route-handler layers AT ZERO director-time cost. **W#2 → main deploy session #16 is the natural next** ((a.37) RECOMMENDED-NEXT picked via §4 Step 1c forced-picker).

**Per Rule 23 Change Impact Audit — Additive (safe):** new factory + new test files + thin route.ts shims that delegate to the factory. Production behavior byte-for-byte unchanged — same status codes, same error messages, same persistence semantics, same side-effects in identical order. No schema changes; no shared-types changes; no Chrome extension or PLOS-side UI sees any API contract difference. P-32 fix is a production bug fix surfacing an existing-intended-but-unreachable warning UI.

**Affected sections:**
- §A.13 (Data persistence) — unchanged.
- §A.18 (Recommended next-session sequence) — P-31 closed; next pick is **W#2 → main deploy session #16** ((a.37) RECOMMENDED-NEXT).

**Multi-Workflow per Rule 25:** session ran on `workflow-2-competition-scraping` end-to-end; schema-change-in-flight stays No; pull-rebase no-op at start; W#1 untouched per Rule 3 ownership. **TaskList sweep per Rule 26:** 7 session tasks tracked + completed; zero `DEFERRED:` items at session end.

**Cross-references:**

- `src/lib/competition-scraping/handlers/{shared,urls,url-text,images-finalize,images-fetch-by-url}.ts` (5 new factory files)
- `src/lib/competition-scraping/handlers/{urls,url-text,images-finalize,images-fetch-by-url}.test.ts` (4 new test files)
- 4 rewritten route.ts shim files under `src/app/api/projects/[projectId]/competition-scraping/`
- `src/app/projects/[projectId]/competition-scraping/components/CapturedImageAddModal.tsx` (P-32 fix)
- `tests/playwright/p29-manual-add-captured-image-modal.spec.ts` (P-32 skip removal)
- COMPETITION_SCRAPING_VERIFICATION_BACKLOG P-31 ✅ SHIPPED status flip + P-32 ✅ FIXED status flip + new "## P-31 SHIPPED at code level" section
- ROADMAP W#2 row (a.36) flipped ✅ SHIPPED-AT-CODE-LEVEL + new (a.37) RECOMMENDED-NEXT deploy session #16
- CORRECTIONS_LOG 2026-05-15-h INFORMATIONAL entry — original Rule 14f picker shown without first verifying the test-runner constraint
- `NEXT_SESSION.md` rewritten 2026-05-15-h for deploy session #16

---

### 2026-05-16 — W#2 → main deploy session #16 — P-30 + P-31 + P-32 ALL DEPLOYED to vklf.com + REAL-INDEPENDENT-WEBSITE FULL VERIFY across P-32 multi-file-drop case + 4 P-29 area spot-checks

**Session:** `session_2026-05-16_w2-main-deploy-session-16-p30-p31-p32-DEPLOYED-FULL-VERIFY` (Claude Code, dual-branch — pre-deploy scoreboard on `workflow-2-competition-scraping`; ff-merge + deploy push on `main`; workflow-2 fast-forwarded after the main push). One-hundred-and-fifth Claude Code session. Closes (a.37) RECOMMENDED-NEXT.

**Director's directive:** verbatim from launch prompt — *"W#2 → main deploy session #16 — bring P-30 (Playwright React-bundle stub-page rig) + P-31 (route-handler DI refactor + 62 new node:test cases) + P-32 (CapturedImageAddModal multi-file-drop warning fix) to vklf.com in one combined deploy. Closes (a.37) RECOMMENDED-NEXT."*

**Alternatives considered for the deploy approach:** standard W#2 → main deploy cheat-sheet (rebase + ff-merge + Rule 9 ask + push origin/main + Vercel auto-redeploy + ping-pong sync) was the only natural option — workflow-2 was 4 commits linearly ahead of main since deploy #15's ping-pong sync; clean fast-forward shape; no merge commits to worry about. Considered but ruled out: splitting into 3 separate deploys (P-30 alone, then P-31 alone, then P-32 alone) — rejected as wasteful since all 3 were tightly bundled and verified together on workflow-2.

**Decision — Additive (safe) deploy classification per Rule 23 Change Impact Audit:**
- P-30 — test-infra only (zero `src/` runtime changes; tests-only modifications under `tests/playwright/`). Invisible to users.
- P-31 — route-handler DI refactor with zero behavior change (same status codes, same error messages, same persistence semantics, same side-effects). Invisible to users; production behavior byte-for-byte identical.
- P-32 — production bug fix surfacing an existing-intended-but-unreachable warning UI. ONE user-visible change: the multi-file-drop warning "N files dropped — only the first will be used" now appears when a user drags 2+ image files onto the captured-image manual-add modal's drop zone (previously coded but unreachable due to a React-state-batching bug; P-32 fixed by moving `setWarningMessage(null)` out of `tryLoadFile`).
- No schema; no shared-types changes; no Chrome extension or PLOS-side UI sees any API contract difference.

**Deploy mechanics — single clean cycle:**
1. **Pre-deploy scoreboard on `workflow-2-competition-scraping` — all 6 GREEN:** tsc clean; extension tsc clean; `npm run build` clean (52 routes); src/lib node:test **509/509**; extension `npm test` 334/334; `npx playwright test` **64/64** in 2.2 min.
2. **Rebase + ff-merge:** `git checkout main && git pull --rebase origin main` (0 ahead); `git checkout workflow-2-competition-scraping && git pull --rebase origin workflow-2-competition-scraping` (2 ahead origin/workflow-2, 4 ahead origin/main); `git rebase main` no-op fast-forward; `git checkout main && git merge --ff-only workflow-2-competition-scraping` → clean ff-merge `3443971..f18e146` (32 files +4704/-1711 — 10 production source + 22 doc/test/infra); re-run scoreboard on `main` post-merge — all GREEN.
3. **Rule 9 deploy-gate via AskUserQuestion forced-picker:** described 4 commits in plain language with user-visible effects (P-30 invisible, P-31 invisible, P-32 visible multi-file-drop warning, doc commits zero impact); director picked Yes.
4. **Deploy push + Vercel auto-redeploy:** `git push origin main 3443971..f18e146` → Vercel auto-redeployed cleanly in ~1-2 min; `git push origin workflow-2-competition-scraping a1b99d2..f18e146` for ping-pong sync.
5. **Director walkthrough on real Independent Website URL** (Rule 27 scope-exception — one-off post-deploy smoke check):
   - P-32 multi-file-drop test ✅ — director dragged 2+ image files onto drop zone; warning text "2 files dropped — only the first will be used" appeared; first image previewed; modal stayed open. **P-32 user-visible fix verified live.**
   - P-29 area spot-checks (zero behavior change from P-31's DI refactor) — all 4 saved cleanly: Add URL (exercises `urls` factory); Add captured text (exercises `url-text` factory); Add captured image via drag (exercises `images-finalize` factory); Add captured image via URL fetch (exercises `images-fetch-by-url` factory). **P-31 DI refactor verified zero-regression in production.**

**Headline outcome — the P-29 manual-add area is now fully complete + live on vklf.com with end-to-end automated regression coverage:**

| Coverage layer | Status | Mechanism |
|---|---|---|
| UI mechanical (Playwright) | ✅ LIVE | P-30 — esbuild React-bundle stub-page rig; 64/64 cases pass (was 30 pass + 1 P-32-deferred-skip; P-32 fix flipped) |
| API route-handler integration (node:test) | ✅ LIVE | P-31 — per-route closure factory `makeXxxHandlers(deps)` with RequestLike contract; 62 new cases (16 urls + 15 url-text + 16 images-finalize + 15 fetch-by-url); 509/509 src/lib total |
| Real-website director walkthrough | ✅ DONE | P-32 multi-file-drop + 4 P-29 area spot-checks; zero polish items found this session |

Director's role this session was Rule 9 deploy-gate approval + post-deploy walkthrough verification. Zero director-time cost going forward for P-29 area regression coverage (P-30 + P-31 catch the same bug classes automatically on every future code change).

**§4 Step 1c forced-picker fired** at end-of-session — deploy session wrapped cleanly; the P-29 area arc is now complete + live + end-to-end-regression-covered; no obvious continuation from THIS session itself. Director picked **(a.38) RECOMMENDED-NEXT = W#2 P-28 + P-27 paired build session on `workflow-2-competition-scraping`** — build BOTH delete features in one session (P-28 delete URLs with cascade disclosure + P-27 delete captured texts/images). Rationale per `feedback_recommendation_style.md`: pairing keeps overlapping design questions (Q1 soft-vs-hard delete / Q2 image storage cleanup / Q3 audit-trail event shape / Q4 permission model / Q5 confirm-dialog component placement) consistent; P-29 area is fresh in memory; P-30 + P-31 regression coverage de-risks the build session.

**One CORRECTIONS_LOG INFORMATIONAL entry this session:** cwd-leak Bash slip recurred TWICE (pre-deploy scoreboard + post-merge scoreboard). 4th-or-5th recurrence of the 2026-05-12-c slip class. Pattern STRENGTHENING — see CORRECTIONS_LOG 2026-05-16 entry for the strengthened operational rule (when running parallel Bash calls where ANY uses `cd`, EVERY command must explicitly prefix with desired absolute cwd; preference: avoid `cd` entirely via absolute paths + `npm --prefix`).

**Affected sections:**
- §A.13 (Data persistence) — unchanged.
- §A.18 (Recommended next-session sequence) — P-30 + P-31 + P-32 deploy closed; next pick is **W#2 P-28 + P-27 paired build session** ((a.38) RECOMMENDED-NEXT).

**Multi-Workflow per Rule 25:** dual-branch session — pre-deploy verification on `workflow-2-competition-scraping`, ff-merge + deploy phases on `main`, one ping-pong sync after the main push (both branches now at `f18e146`). Pull-rebase clean at all checkpoints. Schema-change-in-flight stays "No" entire session. W#1 row untouched per Rule 3 ownership. **TaskList sweep per Rule 26:** 6 session tasks tracked + all 6 closed; zero `DEFERRED:` items at session end (clean walkthrough — no new polish items captured this session).

**Cross-references:**

- ROADMAP 2026-05-16 header bump + W#2 row Last Session 2026-05-16 prepended + (a.37) flipped ✅ DONE + new (a.38) RECOMMENDED-NEXT P-28 + P-27 paired
- CHAT_REGISTRY new top entry 2026-05-16
- DOCUMENT_MANIFEST header + per-doc flags
- CORRECTIONS_LOG 2026-05-16 INFORMATIONAL entry — cwd-leak twice recurrence + pattern strengthening
- COMPETITION_SCRAPING_VERIFICATION_BACKLOG 2026-05-16 header + P-30/P-31/P-32 statuses flipped to ✅ DEPLOYED + new "## Deploy session #16 — P-30+P-31+P-32 DEPLOYED + FULL VERIFY 2026-05-16" section appended at end before EOF
- `docs/NEXT_SESSION.md` rewritten 2026-05-16 for P-28 + P-27 paired build session with full design-picker spec (Q1-Q5 forced-pickers + back-end DELETE handlers via P-31 DI pattern + UI trash buttons + new ConfirmDeleteDialog component + 20-30 new node:test cases + extended Playwright rig)

---

### 2026-05-17 — W#2 P-28 + P-27 PAIRED BUILD session — delete URLs (with cascade disclosure) + delete captured texts/images SHIPPED at code level

**Session:** `session_2026-05-17_w2-p28-p27-paired-build` (Claude Code, on `workflow-2-competition-scraping`). One-hundred-and-sixth Claude Code session. Closes (a.38) RECOMMENDED-NEXT.

**Director directive setting up this session (Read-It-Back per Rule 18 mid-build):** "Build BOTH delete features in one session because their design questions overlap" (per 2026-05-16 §4 Step 1c forced-picker that set up (a.38)). Today's session honored that — P-28 + P-27 ship together; the shared ConfirmDeleteDialog component composes plain (text + image) + cascade (URL) variants from a single source; the cascade-counts endpoint exists to serve only the URL-delete disclosure path; optimistic-update + rollback shapes mirror across all four delete surfaces.

#### Load-bearing finding surfaced at start-of-session (Rule 3 — code wins over doc)

`NEXT_SESSION.md` pre-build read list + `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` P-27 polish-backlog section both framed the back-end DELETE handlers for captured-text + captured-image as missing — claims like "Back-end `text/route.ts` exposes GET + POST only — no DELETE handler. Need to build a new DELETE handler" + "Back-end `images/route.ts` exposes GET only — no DELETE handler. Need to build a new DELETE handler." Code verification at session start showed all three DELETE handlers ALREADY EXIST:

- **URL DELETE** at `urls/[urlId]/route.ts:273` — cascades to `CompetitorSize` + `CapturedText` + `CapturedImage` rows via Prisma `onDelete: Cascade` in `schema.prisma`. Storage objects NOT deleted at cascade time (daily janitor cron handles orphans per §3 stack decisions).
- **Text DELETE** at `text/[textId]/route.ts:171` — production-quality, idempotent on P2025, ownership-scoped via `competitorUrl: { projectWorkflowId }` relation filter.
- **Image DELETE** at `images/[imageId]/route.ts:209` — DB row + best-effort Supabase storage cleanup via `deleteImage(storagePath)`; storage failure does NOT abort DB delete (orphan goes to janitor); idempotent on P2025.

The handlers shipped during the original session-1 API-routes work. The 2026-05-14 P-27 capture's "What's shipped today" sub-section was wrong against code reality at the time of capture — root cause hypothesized as a collection-vs-per-row route conflation (the collection routes `urls/[urlId]/text/route.ts` + `urls/[urlId]/images/route.ts` ARE GET + POST only; the per-row routes one folder shallower at `text/[textId]/route.ts` + `images/[imageId]/route.ts` carry PATCH + DELETE). See `CORRECTIONS_LOG.md` 2026-05-17 INFORMATIONAL entry for the full slip + prevention.

**Consequence (avoided):** the originally-planned 5-question forced-picker set in `NEXT_SESSION.md` (Q1 soft-vs-hard / Q2 image storage / Q3 audit-trail / Q4 permission model / Q5 confirm-dialog placement) assumed Q1-Q4 were genuinely-open back-end design choices. They weren't — the answers were already encoded in the existing code. Surfaced to director with full diff against doc claims BEFORE any picker fired; reframed scope from "back-end + UI build" → "UI-only build + new cascade-counts endpoint"; collapsed picker set to Q5 + Q6 (cascade-count mechanism, newly emerged from simplified scope).

#### Two genuinely-open Rule 14f forced-pickers fired via AskUserQuestion

**Q5 — confirm-delete dialog shape:**
- Option A (recommended) — Shared `ConfirmDeleteDialog.tsx` with plain + cascade variants. Composable across all four surfaces; one place to evolve design; matches W#2 pattern of per-feature modals built on a shared shape.
- Option B — Inline AlertDialog per use site. Faster but risks drift.
- Option C — Browser-native `window.confirm()`. Zero design but ugly + can't render cascade disclosure.

✅ **Director picked Option A.**

**Q6 — cascade-count mechanism for P-28 disclosure:**
- Option A (recommended) — New `GET cascade-counts` lazy-fetch endpoint. Brief loading state in dialog (~50-200ms); fresh counts; consistent on both URL-delete surfaces (URL list + URL detail).
- Option B — Inline counts in existing URL list GET response. Single round-trip but expands shared-types surface.
- Option C — Client-side count on URL detail (already-loaded arrays) + new endpoint for URL list. Hybrid; two code paths.

✅ **Director picked Option A.**

**Q3 audit-trail event granularity** — explicitly kept at the existing coarse `markWorkflowActive()` shape (no scope-add for per-row audit events). If multi-worker Phase 2 audit needs require per-row events later, that's a future polish item.

#### Code shipped (~12 new/modified files)

**Back-end (3 new files, all under `src/lib/competition-scraping/handlers/` + `src/app/api/`):**
- NEW `src/lib/competition-scraping/handlers/cascade-counts.ts` (DI factory + handler). Returns `CascadeCountsResponse = { texts: number; images: number }`. Parallel `prisma.capturedText.count` + `prisma.capturedImage.count` via `Promise.all` (both filter `where: { competitorUrlId: urlId }`); URL ownership check via `findFirst({ where: { id: urlId, projectWorkflowId }, select: { id: true } })`; 404 short-circuits count queries; 500 with `recordFlake` + `withRetry` passthrough.
- NEW `src/lib/competition-scraping/handlers/cascade-counts.test.ts` — 18 node:test cases.
- NEW `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/cascade-counts/route.ts` — thin shim adapting to NextRequest + CORS + NextResponse; production wiring of `verifyProjectWorkflowAuth` → `VerifyAuthFn` adapter mirroring P-31's pattern.

**UI (1 new shared component + 3 modified pages):**
- NEW `ConfirmDeleteDialog.tsx` (~280 LOC) — shared dialog. Two variants: `{ kind: 'plain' }` (single message line) + `{ kind: 'cascade'; counts: CascadeCounts | null; countsError: string | null }` (3-state disclosure: loading / ready / error). Disclosure pluralization (`1 captured text` vs `N captured texts`). 0/0 counts → softer phrasing ("URL has no captured texts or captured images attached"). Submit-in-flight lock disables Cancel + X + Escape. Error-on-throw inline `<div role="alert">` surface, dialog stays open, Confirm + Cancel re-enable. Internal state resets on re-open. Test hooks via `data-testid`.
- Modified `UrlTable.tsx` — new "actions" column added after "Added On"; trash button per row with `e.stopPropagation()` so the row-click navigate doesn't fire; lazy cascade-counts fetch via `useEffect` keyed on pendingDeleteRow; 4-state dialog mount; optimistic-remove via `onUrlDeleted(row.id)` BEFORE DELETE call; rollback via `onUrlAdded(row)` (parent's existing id-dedup handles re-insertion) on non-ok response or network error.
- Modified `CompetitionScrapingViewer.tsx` — new `handleUrlDeleted(urlId)` callback removes the URL from `urls` state via `setUrls(prev => prev?.filter(u => u.id !== urlId))`; passed through as `onUrlDeleted` prop.
- Modified `UrlDetailContent.tsx` — Delete URL header button in UrlMetadataCard next to "Open original URL ↗" (red destructive style); top-level URL-delete dialog state + cascade-counts lazy fetch + handleUrlDeleteConfirm navigates back to workflow main page on success (via `useRouter().push`); `handleTextDeleted(textId)` optimistic-remove for captured-text rows with rollback via setState reset; `handleImageDeleted(imageId)` same shape for captured-image rows; CapturedTextSubsection owns its own per-row delete dialog state + trash button in new actions column on each text row; CapturedImagesGallery owns its own per-thumbnail delete dialog state + trash overlay (positioned absolute top-right of each thumbnail tile, `e.stopPropagation()` so it doesn't trigger the thumbnail's image-viewer open); 3 dialog mounts at appropriate scope levels.

**Test rig + spec (3 new files + 2 modified rig scripts):**
- NEW `tests/playwright/mounts/p28-confirm-delete-dialog.mount.tsx` — React mount with `window.__test` hooks (openDialog / closeDialog / setVariant / setOnConfirmShape / getConfirmCount / getCloseCount).
- NEW `tests/playwright/pages/p28-confirm-delete-dialog.html` — static stub page; seeds fake-supabase per the P-30 rig convention.
- NEW `tests/playwright/p28-confirm-delete-dialog.spec.ts` — 11 UI-mechanical regression cases.
- Modified `tests/playwright/build-bundle.mjs` — added p28 mount to `buildP29ModalBundles()` entries.
- Modified `tests/playwright/test-server.mjs` — added p28 page route.

#### Verification scoreboard — all GREEN

| Check | Result | Δ vs baseline |
|---|---|---|
| `npx tsc --noEmit` (PLOS) | clean | — |
| `cd extensions/competition-scraping && npx tsc --noEmit` | clean | — |
| `npm run build` | clean, 53 routes | +1 (cascade-counts) |
| `node --test` src/lib | **527/527** | +18 (cascade-counts.test.ts) |
| Extension `npm test` | 334/334 | unchanged |
| Full Playwright suite | **75/75** | +11 (p28-confirm-delete-dialog.spec.ts) |

#### What deferred or kept narrow

- **Director walkthrough on real Independent Website URL** DEFERRED to W#2 → main deploy session #17 — workflow-2 not live on vklf.com.
- **No node:test for the existing per-row text + image DELETE handlers** — they aren't DI-refactored. Adding coverage would have required a P-31-style refactor out of scope. Captured as observation, not a polish item — current production handlers are stable + the cascade behavior is the only new wire concern (covered by the new cascade-counts handler's 18 cases).
- **Per-row audit events** — Q3 stayed at coarse `markWorkflowActive()`. Future polish if Phase 2 multi-worker audit needs require it.

#### Cross-references

- `CORRECTIONS_LOG.md` 2026-05-17 INFORMATIONAL entry — doc-vs-code drift on P-27 back-end status (the framing slip surfaced + corrected this session).
- `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` 2026-05-17 — P-27 + P-28 polish-backlog entries flipped ✅ SHIPPED-AT-CODE-LEVEL + new "## P-28 + P-27 SHIPPED at code level (paired build session 2026-05-17)" section appended at end.
- `ROADMAP.md` 2026-05-17 header — full session narrative + W#2 row update.
- `NEXT_SESSION.md` rewritten 2026-05-17 for W#2 → main deploy session #17 with standard cheat-sheet (b) + 4-part director walkthrough script.
- `feedback_recommendation_style.md` — the "(recommended)" markers on Q5 + Q6 were placed on the most-thorough-and-reliable options (shared component + new endpoint) per the standing operational behavior.

---

### 2026-05-18 — W#2 → main deploy session #17 — P-28 + P-27 ALL DEPLOYED to vklf.com + REAL-INDEPENDENT-WEBSITE FULL VERIFY across Parts A-E + IN-SESSION SCOPE-ADD P-33 row hover-highlight SHIPPED + paint-bug HOT-FIXED + DEPLOYED + VERIFIED

**Session:** `session_2026-05-18_w2-main-deploy-session-17-p28-p27-DEPLOYED-FULL-VERIFY-plus-P-33-hover-tackon` (Claude Code, dual-branch — pre-deploy scoreboard on `workflow-2-competition-scraping`; ff-merge + deploy push + hot-fix deploy on `main`; ping-pong sync after each main push). One-hundred-and-seventh Claude Code session. Closes (a.39) RECOMMENDED-NEXT.

**Standard W#2 → main deploy cheat-sheet (b) executed cleanly** for the primary P-28 + P-27 deploy. Pre-deploy scoreboard on workflow-2 all GREEN: tsc clean (root + extension); `npm run build` clean (**53 routes** — unchanged from 2026-05-17 build); src/lib node:test **527/527 pass**; extension `npm test` 334/334 unchanged; Playwright full suite **75/75 pass** (~2 min). Rebase no-op (workflow-2 linearly 2 commits ahead of main since deploy #16 ping-pong — `a226ea1` P-28+P-27 code + `f58ca8c` end-of-session doc batch). FF-merge `62d215c..f58ca8c` clean (19 files +1989/-94). Post-merge scoreboard re-run on main — all GREEN. Rule 9 deploy gate via AskUserQuestion 4-option picker → director picked **"Deploy now (Rule 9-approved)"**. Push `origin/main 62d215c..f58ca8c` → Vercel auto-redeployed cleanly (~1-2 min). Ping-pong sync `workflow-2-competition-scraping` was already at the same SHA as `main` post-merge so it was a no-op.

**Director walkthrough on real Independent Website URL — single batched pass across all 5 parts ALL GREEN:**

| Part | Surface | Outcome |
|---|---|---|
| A | Captured-text row trash icon → dialog with text preview → confirm → row removes + persisted after reload | ✅ PASS |
| B | Captured-image thumbnail trash overlay → dialog with image preview + category → confirm → image removes + persisted after reload | ✅ PASS |
| C | URL detail "Delete URL" header button → cascade-disclosure dialog (loading state → resolves to "This will also delete N captured texts and M captured images") → confirm → navigation back → URL row gone from list | ✅ PASS |
| D | URL list row trash icon (right-most "actions" column) → cascade-disclosure dialog same shape → confirm → row vanishes + persisted after reload | ✅ PASS |
| E | Rollback path via DevTools Offline throttle → confirm with network offline → dialog stayed open + inline error + row re-appeared after optimistic-update rollback | ✅ PASS |

**HEADLINE OUTCOME:** the W#2 admin data-management surface (add via Chrome extension + manual-add via P-29 + edit via inline-edit + delete via P-28/P-27) is now **COMPLETE + LIVE** on vklf.com end-to-end. The entire CRUD surface for the Independent Website project's Competition Scraping workflow is production-ready.

**In-session scope-add — P-33 row hover-highlight tack-on (Rule 11 forced-picker):**

Director surfaced natural-use feedback post-walkthrough: *"When the user puts their mouseover a row in the table in competition workflow, that row should get highlighted in a different color."* Rule 11 scope-add forced-picker fired with 3 options (defer-to-polish-backlog recommended / ship-as-tack-on / question-first) + escape hatch. Director picked **ship-as-tack-on**.

**First attempt — commit `1794eef`:**

Edit at `UrlTable.tsx:498-510` — `onMouseEnter={(e) => { e.currentTarget.style.background = '#161b22'; }}` + `onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}` + `transition: 'background 120ms ease'` on the `<tr>` style. Full scoreboard re-run on workflow-2 — all GREEN. Committed + ff-merged + pushed origin/main + ping-pong sync. Vercel auto-redeployed cleanly. **Director reported on vklf.com after Vercel green + hard refresh: hover-highlight NOT visible.**

**Diagnosis:** `<tr>` background paint is unreliable when `<td>` cells render on top — the `<td>` cells' transparent default paint sometimes paints OVER the `<tr>` background in modern browsers. The codebase already had the established convention of applying hover background to `<td>` cells via CSS — `mt-tbl tbody tr:hover td { background: ... }` in `mt-table.css`; same pattern in `ast-table.css` + `canvas-table-mode.css`. The Rule 14e pre-capture grep against `*.css` in `src/` would have surfaced this prior treatment but the first attempt jumped to inline-on-`<tr>` without checking.

**Hot-fix — commit `507f7d6`:**

Edit at `UrlTable.tsx:501-513` — swapped to `onMouseEnter={(e) => { const cells = e.currentTarget.querySelectorAll<HTMLTableCellElement>('td'); cells.forEach((cell) => { cell.style.background = '#21262d'; }); }}` + matching `onMouseLeave` that clears each cell's background back to `''`. Dropped the 120ms ease transition on `<tr>` (was useless once we stopped setting `<tr>` background). Color bumped `#161b22` → `#21262d` (`--ph-bg` / `--border-dark` palette range — clearly elevated above `#0d1117` page bg; matches existing row-separator color for visual harmony). Abbreviated re-scoreboard (tsc + build clean; full Playwright not re-run since change is purely DOM event handler). Committed + ff-merged + pushed origin/main + ping-pong sync. **Director re-verified post-hot-fix-deploy on vklf.com: hover-highlight VISIBLE + working.**

**P-33 final status:** ✅ **SHIPPED + DEPLOYED + REAL-INDEPENDENT-WEBSITE VERIFIED 2026-05-18** in this same session.

**Pattern lesson captured in CORRECTIONS_LOG.md 2026-05-18:** when adding hover effects to a table, **grep `tr:hover` against `*.css` in `src/` FIRST** — if the codebase has an established pattern, follow it. Net cost ~5 min (one extra deploy cycle). Zero production impact (invisible-hover state was harmless; clicks + navigation still worked).

**§4 Step 1c forced-picker fired at end-of-session:**

Deploy session #17 wrapped cleanly + W#2 admin data-management surface complete + live; no inherent continuation. Director picked **(a.40) RECOMMENDED-NEXT = W#2 polish P-34** — propagate row hover-highlight from URL list table to captured-text rows + image thumbnails on URL detail page. Closes UX consistency gap from today's P-33 tack-on. Rationale per `feedback_recommendation_style.md` (most thorough/reliable): keeps director in W#2 context which is fresh; small focused session (~30 min code work) using same `querySelectorAll` pattern; brings UX consistency to entire admin data-management surface.

**Cross-references:**

- `ROADMAP.md` 2026-05-18 header bump + W#2 row Last Session 2026-05-18 prepended + (a.38) flipped ✅ DONE + (a.39) ✅ DONE + new (a.40) RECOMMENDED-NEXT P-34.
- `CHAT_REGISTRY.md` 2026-05-18 new top entry.
- `DOCUMENT_MANIFEST.md` 2026-05-18 header bump + per-doc flags.
- `CORRECTIONS_LOG.md` 2026-05-18 INFORMATIONAL §Entry — P-33 first-attempt `<tr>`-paint slip.
- `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` 2026-05-18 — P-27 + P-28 polish-backlog entries flipped ✅ SHIPPED-AT-CODE-LEVEL → ✅ DEPLOYED + new "## Deploy session #17 + P-33 hover tack-on" section appended at end + new P-33 entry ✅ SHIPPED + DEPLOYED + VERIFIED + new P-34 entry ⏳ RECOMMENDED-NEXT.
- `NEXT_SESSION.md` rewritten 2026-05-18 for P-34 with same-pattern launch prompt + abbreviated scoreboard targets.
- `feedback_approval_scope_per_decision_unit.md` — the P-33 tack-on + hot-fix deploy cycles were covered by Rule 11 scope-add approval scope (one decision unit) per standing operational behavior.

---

### 2026-05-18-b — W#2 → main deploy session #18 — P-34 hover-propagation to captured-text rows + image thumbnails on URL detail page DEPLOYED + REAL-INDEPENDENT-WEBSITE VERIFIED

**Session:** `session_2026-05-18-b_w2-main-deploy-session-18-p34-hover-propagation-DEPLOYED-FULL-VERIFY` (Claude Code, dual-branch — pre-deploy scoreboard on `workflow-2-competition-scraping`, ff-merge + deploy push on `main`, ping-pong sync after main push). One-hundred-and-eighth Claude Code session. Closes (a.40) RECOMMENDED-NEXT.

**Outcome:** ✅ **P-34 hover-propagation SHIPPED + DEPLOYED + REAL-INDEPENDENT-WEBSITE VERIFIED in single session.** Commit `b5cf7ea` (1 file +33/-2 in `UrlDetailContent.tsx`). Director re-verify on real Independent Website URL detail page: *"all green, hover works on both"*. Pre-deploy + post-merge scoreboards all GREEN (tsc / ext tsc / `npm run build` 53 routes / src/lib node:test 527/527 / ext `npm test` 334/334 / Playwright 75/75).

**HEADLINE:** the W#2 admin data-management surface (add via extension + manual-add via P-29 + edit via inline-edit + delete via P-28/P-27 + hover-consistency via P-33+P-34) is now **COMPLETE + LIVE on vklf.com end-to-end with UX consistency across URL list + captured-text rows + image thumbnails.**

**Implementation subtlety — captured-text rows vs. image thumbnails:**

Captured-text rows live as `<tr>` rows inside a `<table>`, identical DOM shape to the URL list table that P-33 hover-highlighted. So they reuse the P-33 pattern verbatim:

```ts
onMouseEnter={(e) => {
  const cells = e.currentTarget.querySelectorAll<HTMLTableCellElement>('td');
  cells.forEach((cell) => { cell.style.background = '#21262d'; });
}}
onMouseLeave={(e) => {
  const cells = e.currentTarget.querySelectorAll<HTMLTableCellElement>('td');
  cells.forEach((cell) => { cell.style.background = ''; });
}}
```

Clearing each cell's `background` to empty string on leave is safe because the `<td>` cells have no explicit inline background — they inherit transparency from the parent table.

Image thumbnails are a different DOM shape: each thumbnail lives in a wrapping `<div style={{ position: 'relative' }}>` containing a `<ThumbnailButton>` (which renders as a `<button>` with explicit `background: '#0d1117'`) AND a trash-overlay button. Two implementation challenges:

1. **Which descendant element receives the hover-color swap?** The wrapping `<div>` has no visible background (it's `position: relative` with no `background` style), so swapping its background would be invisible behind the ThumbnailButton's `#0d1117`. The natural target is the ThumbnailButton itself — the visible card. Using `e.currentTarget.querySelector<HTMLButtonElement>('button')` picks the **first descendant button**, which is the ThumbnailButton (the trash-overlay button sits AFTER it in DOM order).
2. **What value to restore on leave?** The naive P-33 pattern clears `background` to `''` on leave. But the ThumbnailButton has an explicit `background: '#0d1117'` set inline by its React render. Clearing the inline `background` to empty string would leave the card transparent until React re-renders. Fix: explicitly restore `'#0d1117'` on leave:

```ts
onMouseEnter={(e) => {
  const card = e.currentTarget.querySelector<HTMLButtonElement>('button');
  if (card) card.style.background = '#21262d';
}}
onMouseLeave={(e) => {
  const card = e.currentTarget.querySelector<HTMLButtonElement>('button');
  if (card) card.style.background = '#0d1117';
}}
```

Same `#21262d` hover color as captured-text rows + URL list table for visual consistency across all three surfaces.

**Operational lesson worth carrying forward:** when porting an inline-style hover pattern from one element shape to another, check whether the target element has an explicit inline base style for the property being swapped. If yes, the leave-handler must restore the explicit base value (not clear to empty string).

**Deploy mechanics (cheat-sheet b):** rebase no-op (workflow-2 0 ahead of main pre-this-commit per deploy #17 ping-pong); ff-merge `d551443..b5cf7ea` clean; post-merge scoreboard re-run on main all GREEN (full Playwright 75/75 re-run on main for thoroughness per `feedback_recommendation_style.md` — pure DOM event-handler change has no Playwright coverage, but re-running validates the build artifact); Rule 9 deploy gate via AskUserQuestion picker → director picked "Deploy now (Rule 9-approved)"; pushed origin/main `d551443..b5cf7ea` (Vercel auto-redeployed cleanly ~1-2 min); ping-pong sync no-op (workflow-2 already at same SHA as main post-merge).

**Next session pick (§4 Step 1c forced-picker):** deploy session #18 wrapped cleanly + W#2 admin data-management surface complete + hover-consistent across all three surfaces; no inherent continuation. Director picked **(a.41) RECOMMENDED-NEXT = W#2 polish P-21** — symmetric-canonicalize `pickInitialUrl` (`captured-text-validation.ts:128`) + `buildRecognitionSet` (`url-normalization.ts:63`); MEDIUM defensive; closes the slug-variant asymmetry that previously caused the P-15 Amazon FAIL in deploy session #9 (left-side canonicalized via `platformModule.canonicalProductUrl`, right-side raw). Rationale per `feedback_recommendation_style.md`: most thorough/reliable next pick — closes a known asymmetry with actual node:test coverage (~4 new cases per function, 8 total) rather than smaller UX-only polish. ~30 min code session + standard scoreboard + W#2 → main deploy session #19 + brief director re-verify (optional, defensive fix).

**Smooth session — zero CORRECTIONS_LOG-tier slips on Claude's side.**

---

### 2026-05-18-c — W#2 → main deploy session #19 — P-21 symmetric-canonicalize `pickInitialUrl` + `buildRecognitionSet` SHIPPED + DEPLOYED to vklf.com

**Session:** `session_2026-05-18-c_w2-main-deploy-session-19-p21-symmetric-canonicalize-DEPLOYED` (Claude Code, dual-branch — pre-deploy on `workflow-2-competition-scraping`, ff-merge + deploy phases on `main`, ping-pong sync after main push). Closes (a.41) RECOMMENDED-NEXT from deploy session #18.

**Outcome:** ✅ **P-21 SHIPPED + DEPLOYED in single session.** Commit `c3e69af` (5 files +318/-16 — all in `extensions/competition-scraping/src/lib/`). No director walkthrough this session — Rule 27 picker chose "skip walkthrough; 14 new node:test cases are the regression coverage" (the most thorough/reliable path per `feedback_recommendation_style.md` for this defensive-fix shape; controlled-repro session 2026-05-12-h already validated the LEFT-side fix on real Amazon).

**HEADLINE:** the slug-variant asymmetry that caused the P-15 Amazon FAIL in deploy session #9 is now closed defensively at the unit + orchestrator wiring levels. Future-defensive coverage for user-pasted slug-variant URLs at the URL-add form; +14 new `node:test` cases provide permanent regression coverage at the most stable layer.

**The asymmetry (recap from 2026-05-12-h root-cause analysis):**

- LEFT side of URL recognition comparison was canonicalized via `platformModule.canonicalProductUrl(...)`:
  - `pickInitialUrl` at `captured-text-validation.ts:128` — applied to `pageUrl` via the optional 3rd-arg `canonicalize` fn passed by `text-capture-form.ts:459`.
  - `orchestrator.ts` `handleAddRequest` at `:210`, `scanLinks` icon-dedup at `:254` + `:263`, `maybeShowDetailOverlay` at `:307` — all canonicalized `href` / `location.href` before `normalizeUrlForRecognition`.
- RIGHT side was iterated RAW:
  - `pickInitialUrl` `for (const row of rows)` at `:140-145` — `normalizeUrlForRecognition(row.url)` with no canonicalize.
  - `buildRecognitionSet` at `url-normalization.ts:63` — had no `canonicalize` parameter; rows added to Set in their saved form.
  - `orchestrator.ts:143` (init) + `:226-227` (onSaved) — passed `buildRecognitionSet(rows)` with no fn; called `normalizeUrlForRecognition(row.url)` directly in onSaved.
- Result: a row saved as `/Product-Name-Slug/dp/{ASIN}/ref=sr_1_3` or `/gp/product/{ASIN}` or `/dp/{ASIN}/` was never recognized by hover-time / overlay / pre-select lookups even though the user was on the canonical `/dp/{ASIN}` page (and vice versa).

**The fix — symmetric canonicalization:**

1. **`captured-text-validation.ts` `pickInitialUrl`** — apply `canonicalize` to each `row.url` on the RIGHT side before normalizing + comparing. Idempotent for already-canonical rows (canonical → canonical is a no-op via the canonicalize fn). Updated docstring to reflect symmetric behavior; cross-referenced `orchestrator.ts:307-309` as the parallel canonicalize-LEFT path.
2. **`url-normalization.ts` `buildRecognitionSet`** — added optional `canonicalize?: (href: string) => string | null` parameter. When provided, applied to each row's URL before normalizing + adding to the Set. When omitted (or when it returns null for a row), row URL is used raw — preserves backward-compat for callers that don't have access to a platform module and for non-product rows (e.g. manually-added search-results URLs).
3. **`content-script/orchestrator.ts`** — wired the lib improvement into production:
   - **Line 143 (init):** `buildRecognitionSet(rows, (href) => platformModule.canonicalProductUrl(href))` — Set is now built symmetric with the hover-time + overlay lookups at `:210` / `:254` / `:263` / `:307`.
   - **Line 233-244 (onSaved callback):** `const canonical = platformModule.canonicalProductUrl(row.url) ?? row.url; const normalized = normalizeUrlForRecognition(canonical); if (normalized) recognitionSet.add(normalized);` — newly-saved rows land in the Set in canonical form so future hover lookups match.

**Scope expansion beyond the launch-prompt sketch (mid-drift-check, surfaced before any code):**

The launch prompt sketched "~2 LOC per function (4 LOC total) + ~4 new node:test cases per function (8 total)" — covering only the pure-function changes. Mid-drift-check I surfaced that without ALSO wiring the orchestrator call sites at `:143` and `:226-227`, the `buildRecognitionSet` parameter change would ship as dead code (production still wouldn't pass a canonicalize fn). Director picked **"Proceed with full scope (lib + orchestrator + tests) (recommended)"** via AskUserQuestion. Actual diff: +318/-16 across 5 files. The "+318" is dominated by:

- 14 new `node:test` cases (6 in `captured-text-validation.test.ts` + 8 in `url-normalization.test.ts`) with full fixture setup + descriptive `describe('... — symmetric canonicalize on ... (P-21)')` blocks.
- Updated docstrings on both `pickInitialUrl` + `buildRecognitionSet` documenting the symmetric behavior + cross-referencing each other + the orchestrator call sites.
- The orchestrator wires include explanatory comments tying back to P-21 + the pre-fix asymmetry.

Per `feedback_recommendation_style.md` (most thorough/reliable): the full scope ensures the fix actually takes effect in production, with regression coverage at both unit + integration-via-real-orchestrator-wire levels.

**Test coverage shipped (+14 new node:test cases):**

- `captured-text-validation.test.ts` — new `describe('pickInitialUrl — symmetric canonicalize on RIGHT side (P-21)')` block (6 cases): canonical-vs-slug-variant ROW; slug-variant-vs-slug-variant ROW; canonical-vs-`/gp/product` ROW; canonical-vs-trailing-slash ROW; idempotent on already-canonical; canonicalize-returns-null fallback for non-product ROW.
- `url-normalization.test.ts` — new `describe('buildRecognitionSet — symmetric canonicalize on rows (P-21)')` block (8 cases): slug-variant / `/gp/product` / trailing-slash collapse; multi-variant dedupe; null fallback; backward-compat (omit canonicalize); alwaysNull defensive; non-string row.url defensiveness.

**Pre-deploy verification scoreboard — all GREEN on `workflow-2-competition-scraping`:** tsc clean; ext tsc clean; `npm run build` clean (**53 routes** unchanged); src/lib node:test **527/527** (unchanged — change is extension-only); extension `npm test` **348/348** (was 334; **+14 new P-21 cases**); Playwright **75/75** (unchanged — pure-function lib change).

**Deploy mechanics (cheat-sheet b):** rebase no-op; ff-merge `f41aac6..c3e69af` clean; post-merge scoreboard re-run on main all GREEN (full Playwright re-run on main for thoroughness per `feedback_recommendation_style.md`); Rule 9 deploy-gate via AskUserQuestion picker → director picked "Deploy now (Rule 9-approved)"; pushed origin/main (Vercel auto-redeployed cleanly ~1-2 min); ping-pong sync clean.

**One INFORMATIONAL CORRECTIONS_LOG entry this session:** doc-path drift between NEXT_SESSION.md launch prompt + 2026-05-12-g root-cause analysis prose (cited `src/lib/captured-text-validation.ts` etc.) and actual file paths (`extensions/competition-scraping/src/lib/...`). Per Rule 3 code wins; paths silently corrected in this session's diff. Full lesson in `CORRECTIONS_LOG.md §Entry 2026-05-18-c` — write full paths from repo root in future doc captures; never assume `src/lib/` as default prefix because extension code lives elsewhere.

**Next session pick (§4 Step 1c forced-picker):** P-21 wrapped cleanly; W#2 polish backlog still has older items P-19 (LOW-MEDIUM overlay-dismiss) and P-13 (LOW autofocus), but no inherent continuation from THIS session. Director picked **(a.42) RECOMMENDED-NEXT = (a.13) P-17 authFetch real-fetch integration test on `main`** — pivot off W#2 polish to platform-wide work. Rationale per `feedback_recommendation_style.md`: most thorough/reliable next pick — closes a known production hotfix with permanent regression coverage at the most stable layer (Playwright real-browser); higher-priority than W#2 polish P-19/P-13 which are low-frequency UX items.

**Smooth session — one INFORMATIONAL CORRECTIONS_LOG entry (doc-path drift inherited from prior sessions, not introduced by this one); zero CORRECTIONS_LOG-tier Claude-side slips.**

---

## §B 2026-05-19-c — W#2 → main deploy sessions #21 + #22 — P-13 popup autofocus + P-38 popup URL pre-select (1-URL rule) BOTH SHIPPED + DEPLOYED to vklf.com; P-39 sticky URL preference captured as next session's pick

`session_2026-05-19-c_w2-main-deploy-sessions-21-22-p13-p27-paired-DEPLOYED` (Claude Code, dual-branch — pre-deploy on `workflow-2-competition-scraping`, two ff-merge + deploy cycles on `main`, ping-pong syncs after each push). Closes (a.44) RECOMMENDED-NEXT.

**Headline.** Two paired build-and-deploy cycles in one session. Deploy #21 P-13 (1 LOC `autoFocus` prop on popup React `<input>`; commit `e217eb9`); Deploy #22 P-38 (Rule 11 in-session scope-add; 4 LOC `urls.length === 1` pre-select rule in useEffect + resetForm; commit `a0d5c8a` stacked on `e217eb9`). Both scoreboards GREEN at exact baselines. Vercel auto-redeploys no-op (web bundle unchanged — fixes live in extension code only). P-13 verified PASS first try; P-38 verified PASS only after director set up a TRUE 1-URL test scenario.

**ROADMAP P-13 "Where" drift caught at session start (Rule 3).** Original P-13 capture 2026-05-12 listed both popup + content-script overlay surfaces, but the 3 content-script overlays already had `.focus()` calls — popup React was the only true gap. Scope reduced before any code. CORRECTIONS_LOG 2026-05-19-c §Entry captures the slip + prevention rule.

**Rule 11 in-session scope-add P-38 (the popup URL pre-select fix).** Director surfaced natural-use feedback during P-13 verification: popup didn't auto-select the URL for "Attach to which saved URL?". Rule 14f forced-picker with 3 options (defer / simple rule / sticky preference); director picked simple rule. Multi-URL case deferred as new P-39 per separation-of-scope.

**Polish-item numbering collision (Rule 24 sub-step a slip).** Today's commits labeled "P-27" + "P-28" collide with existing deployed items; renumbered to P-38 + P-39 in doc layer; commit messages frozen per Rule 8. CORRECTIONS_LOG 2026-05-19-c-2 §Entry captures the slip + prevention rule (mechanical grep at every P-NN naming moment).

**P-39 design pre-capture for next session.** Sticky most-recently-used URL preference per (project, platform) tuple in `chrome.storage.local`. Key shape: `plos-cs-popup-url-pref-{projectId}-{platform}`. Fall-back ladder: stored-pref-matches → P-38's `length === 1` → placeholder. Write on every URL onChange. Edge case: stored URL id no longer matches → fallback. Test coverage Option A (pure-function node:test): extract `getStickyPreselectedUrlId(urls, storedPref)` for ~6-10 cases. Estimated ~20-30 LOC total. Standard W#2 → main deploy cycle expected as session #23. (a.45) RECOMMENDED-NEXT set via §4 Step 1c forced-picker over alternatives (P-16 service-worker MV3 diagnostics; W#3 first session; W#1 graduated-tool re-entry) per `feedback_recommendation_style.md` (most thorough/reliable: closes director's actual real-world friction; well-scoped single-session ship).

**Implementation note for next session author.** P-39's pure-function helper boundary is the cleanest design. The lookup logic (decide what selectedUrlId should be given urls + storedPref) is pure; the read from chrome.storage.local is mechanical wire-up at the useEffect site; the write to chrome.storage.local is mechanical wire-up at the onChange handler. The component-side handlers should be ~3-5 LOC each (await `chrome.storage.local.get(key)` → call `getStickyPreselectedUrlId(urls, storedPref?.[key])` → setSelectedUrlId; analog for write). The node:test cases test only the pure function. Skip the storage I/O test surface — testing chrome.storage in node:test would require mocks that exceed the fix's scope; Playwright extension popup spec is heavier than the fix's risk warrants.

**Group A modified this session:** ROADMAP / CHAT_REGISTRY / DOCUMENT_MANIFEST / CORRECTIONS_LOG / NEXT_SESSION. **Group B modified:** this DESIGN; VERIFICATION_BACKLOG.

---

## §B 2026-05-19-c-2 (ADDENDUM to §B 2026-05-19-c above) — W#2 → main deploy sessions #23 + #24 — P-39 sticky URL preference SHIPPED then REVERTED as wrong-feature + P-40 popup auto-pre-select URL matching active tab SHIPPED + DEPLOYED + REAL-INDEPENDENT-WEBSITE VERIFIED on vklf.com

Same Claude session as §B 2026-05-19-c above (`session_2026-05-19-c_w2-main-deploy-sessions-21-22-23-24-p13-then-p38-p39-reverted-p40-shipped`); session expanded from the originally-scoped 2 deploy cycles (#21 P-13 + #22 P-38) → 4 deploy cycles (+#23 P-39 + #24 reverts + P-40) after director repeatedly clarified actual UX intent. Closes (a.44) + (a.45) RECOMMENDED-NEXT loops — (a.45) closed as P-40 (the actually-correct fix), NOT as P-39 (the reverted wrong-feature originally captured at (a.45)).

**Headline.** After deploy #22's P-38 verification revealed real-world combos have 2+ URLs (P-38's 1-URL rule never fires), director pushed back. I shipped P-39 sticky most-recently-used URL preference as a third deploy cycle. P-39 verified PASS on synthetic multi-URL test setup. Then director's third pushback: *"All of these tests passed but this was not the issue we were trying to fix. The 'Pick a saved url' dropdown should be prechosen if the url page is already added to vklf.com (which isn't the case currently)."* That clarified the actual session-start ask: the popup dropdown should pre-select the saved URL matching the page currently open — same pattern the right-click content-script overlay uses via `pickInitialUrl` + platform-module `canonicalProductUrl`. Reverted P-38 + P-39 via `git revert`; shipped P-40 in deploy session #24 as the actually-correct fix; verified PASS on director's real workflow.

**Design rationale for the revert vs. layered-fallback choice.** Director picked at the in-session forced-picker between:
- (A) Revert P-38 + P-39 + ship clean P-40 (Recommended) — cleanest codebase; P-38/P-39 commits stay in git history as documented mistakes; no leftover dead code.
- (B) Keep P-38 + P-39 as low-priority fallbacks, stack P-40 as primary in a layered ladder — preserves work; complex multi-tier fall-back; surprising UX in edge cases.
- (C) Stop session, P-40 in next session — defers the right fix one session.

Director picked (A). Per `feedback_recommendation_style.md` (most thorough/reliable): the rolled-back state is honest about today's mistake and gives the next session a clean baseline. Layered fallbacks would have preserved low-value complexity (P-38's `length === 1` is a trivial case rarely hit; P-39's sticky preference is a different feature than active-tab-match) for marginal benefit.

**P-40 implementation pattern (15 LOC reusing existing helpers; no new files; no new tests).**

- Imports added to `CapturedTextPasteForm.tsx`: `pickInitialUrl` from `../../../lib/captured-text-validation.ts` (which we were already importing for other reasons) + `getModuleByPlatform` from `../../../lib/platform-modules/registry.ts`.
- useEffect's Promise.all extended from 2-tuple → 3-tuple: adds `chrome.tabs.query({ active: true, currentWindow: true })`.
- After `setUrls(urlRows)`: look up active tab's URL via `tabs[0]?.url`; if set, get the platform module via `getModuleByPlatform(props.platform)` + call `pickInitialUrl(activeTabUrl, urlRows, canonicalize)` with the same `(href) => platformModule.canonicalProductUrl(href)` shape as content-script overlay's `text-capture-form.ts:466`. If matched, `setSelectedUrlId(matched.id)`. If no match, selectedUrlId stays at default `''` (placeholder).
- resetForm unchanged from P-13 post-state: `setSelectedUrlId('')` after a save. Next popup open re-runs the useEffect and re-matches the active tab URL.
- `activeTab` manifest permission already in place (`wxt.config.ts` confirmed at session start) — grants temporary URL access on popup-open user gesture.

**Edge cases handled by reusing `pickInitialUrl`:**
- Active tab URL undefined (chrome.tabs permission edge case) → no match → placeholder.
- Active tab URL doesn't match any saved row → no match → placeholder.
- Active tab URL is on a different domain than `props.platform` suggests → `pickInitialUrl` returns null since saved rows are on the current platform's domain.
- Slug-variant Amazon URL → `canonicalProductUrl` strips slug + normalizes to `/dp/{ASIN}` per P-15 + P-21 — matches saved canonical row.

**Test coverage decision (Rule 27 forced-picker, Option A).** No new tests this commit — `pickInitialUrl` is already covered by 6 cases in `captured-text-validation.test.ts` (P-15 + P-21 added the canonicalize coverage); the popup-side `chrome.tabs.query` + `getModuleByPlatform` wire-up is mechanical single-call integration that director's sideload manual verification at deploy time on the REAL workflow is sufficient regression coverage for. Pre-deploy + post-merge scoreboards on both #23 + #24 all GREEN at expected baselines.

**Director verification on real workflow.** Three test cases all PASS: (1) open popup on saved competitor page → that page's URL pre-selected; (2) open popup on non-saved page → placeholder; (3) slug-variant Amazon URL → still matches via canonicalProductUrl per P-15.

**The wrong-feature-shipped-twice slip captured as CORRECTIONS_LOG 2026-05-19-c-3 §Entry.** Real-tier slip (not just informational). Root cause: I (Claude) jumped from a one-line natural-use feedback ("popup did not autoselect the url") → drafting Rule 14f picker options without first asking director the specific behavior they wanted. Prevention rule: when director surfaces feedback with natural-language ambiguity (e.g., "the url" — which URL?), FIRST ask director to clarify the specific behavior intended via a feature-definition Read-It-Back picker (each option is a possible INTERPRETATION of the feedback, not a possible IMPLEMENTATION), THEN run the implementation-shape Rule 14f picker for HOW to fix it. Concrete shape captured in the §Entry.

**§4 Step 1c forced-picker fired at end-of-session.** Director picked **(a.46) RECOMMENDED-NEXT = W#2 polish P-16 SW MV3 crash diagnostics on `workflow-2-competition-scraping`** over alternatives (W#3 Therapeutic Strategy first session per Rule 18 at ~90-150 min; W#2 Tool Graduation per HANDOFF_PROTOCOL §4 Step 2 Scenario B — heavy multi-step ritual). Rationale per `feedback_recommendation_style.md`: closes the only remaining open W#2 polish item with concrete code-level work; well-scoped diagnostic session; lowest risk vs. heavier alternatives.

**Cross-references:** P-15 + P-21 (the `pickInitialUrl` + canonicalize helpers P-40 reuses); CORRECTIONS_LOG 2026-05-19-c-3 §Entry (the wrong-feature-shipped-twice slip); commits `b635ae7` (revert P-39) + `f0cef37` (revert P-38) + `182da37` (P-40 ship); `text-capture-form.ts:466` (the content-script overlay reference implementation for the same pattern).

---

## §B 2026-05-19-e — W#2 → main deploy session #26 — P-24 saved-image indicator on the page SHIPPED + DEPLOYED + REAL-CHROME-VERIFIED on vklf.com

**Session:** `session_2026-05-19-e_w2-main-deploy-session-26-p24-saved-image-indicator-DEPLOYED` (Claude Code, dual-branch — pre-deploy scoreboard on `workflow-2-competition-scraping`, ff-merge + deploy phase on `main`, ping-pong sync after main push). Closes (a.47) RECOMMENDED-NEXT.

**Outcome:** P-24 saved-image indicator overlays a green ✓ at the top-right of host-page `<img>` elements whose `currentSrc`/`src` matches a saved CapturedImage row's `originalSrcUrl`. Indicator scoped to pages whose canonical URL matches a saved CompetitorUrl (same scope as the existing detail-overlay banner). Director real-Chrome verification PASS first try.

**Load-bearing finding at session start (Rule 3 — code wins).** The launch prompt + ROADMAP P-24 entry both stated *"CapturedImage table already has both `src_url` + `original_src_url`"* — the field did not exist in schema, TypeScript wire shape, finalize API, or extension save path. Drift was caught BEFORE any code via the start-of-session diagnosis steps + AskUserQuestion forced-picker. Director picked **Option 1** (add new nullable `originalSrcUrl String?` column to CapturedImage + persist forward on new captures; pre-existing rows backfill to NULL and won't show the indicator until re-captured) over Option 2 (defer P-24 until P-25 designed) + Option 3 (image-hash matching no schema change — too expensive at scan-time). Captured here so this design history isn't reconstructed from commit messages later.

**Schema-change-in-flight discipline.** Schema flag flipped Yes during build. `npx prisma db push` ran against the shared dev+prod Supabase DB and landed in 1.20s (additive — no destructive change). Flag flipped back to No before deploy.

**Persistence path — extension flow:** `background.ts` `handleSubmitImageCapture` now threads `req.srcUrl` into the finalize call as `originalSrcUrl` ONLY when (a) `req.request.sourceType === 'regular'` AND (b) `!req.srcUrl.startsWith('data:')`. Region-screenshot captures (whose srcUrl is a base64 data URL — sometimes megabytes) are skipped — their original src can never match a host-page `<img>` and storing the data URL in DB is wasteful.

**Persistence path — manual-add modal (DEFERRED).** The web-side `CapturedImageAddModal.tsx` URL-paste path (P-29 Slice #3) is OUT OF SCOPE for P-24 ship. A trivial 1-line addition (`if (urlInput.trim()) finalizeBody.originalSrcUrl = urlInput.trim();` inside the fetch-by-url branch) folds into any future W#2 polish session. Captured in NEXT_SESSION.md alternate candidates.

**API surface change.** `FinalizeImageUploadRequest` gains optional `originalSrcUrl?: string`. Server-side validation: must be a string when provided; trimmed-to-null on empty/whitespace. `CapturedImage` interface gains required `originalSrcUrl: string | null`. All three `toWireShape` sites (collection list route + per-image PATCH route + finalize handler) updated to include the field in responses. Backward compatible — older extensions that don't send the field get NULL persisted; older clients reading the new wire shape ignore unknown additive field.

**Content-script architecture.** Three modules cooperate:

1. **`api-bridge.ts` + new bridge function `listCapturedImages(projectId, urlId)`** — routes through background per the standard content-script CORS pattern. New `list-captured-images` request kind in `messaging.ts` + type-guard. Background dispatches to `api-client.ts`'s new `listCapturedImages` function.

2. **New `already-saved-image-icon.ts` helper (~150 LOC).** Exports `attachAlreadySavedImageIcon(img, savedImageId)` + `detachAlreadySavedImageIcon(savedImageId)` + `detachAllAlreadySavedImageIcons()` + `reposition(icon, img)`. Icon is a 28×28 green ✓ overlay with `position:fixed`, white border, green halo ring, drop shadow (matching the URL ✓ icon's visibility-boost styling). Positioned via `getBoundingClientRect()` at top-right of the matched `<img>`. `position:fixed` + `pointer-events:none` means the icon doesn't intercept clicks or interact with host-page layout. Pinned to `document.body` (not the image's parent — avoids host-page layout invasion). Per-icon `data-plos-cs-image-icon-for="<savedImageId>"` for orchestrator-side lookup; per-img `data-plos-cs-image-has-icon="<savedImageId>"` flag for dedupe across rescans.

3. **`orchestrator.ts` extension** — three additions:
   - **`urlIdByNormalized: Map<string, string>`** built alongside the existing `recognitionSet` so the orchestrator can resolve the current saved URL's id when `maybeShowDetailOverlay` matches.
   - **`capturedImagesByUrlId: Map<string, CapturedImageWithUrls[]>`** cache keyed by urlId. One fetch per urlId per page-load. Negative-cached (empty array) on API failure so rescans don't retry.
   - **`scanImages()`** — O(M) match: builds `rowsBySrc: Map<originalSrcUrl, row>` (first-time) then walks `document.querySelectorAll<HTMLImageElement>('img')` once, checking each `img.currentSrc` + `img.src` against the map. First match per saved row wins (mirrors the URL ✓ dedupe rationale). Existing icons whose matched row is no longer active get detached. Existing icons whose img is still matched get repositioned.
   - **Wired into** `maybeShowDetailOverlay()` (fires on saved-URL match — fetch + scan), `MutationObserver` tick (rescan after DOM mutations), and `window.scroll`/`window.resize` listeners (reposition existing icons without re-scanning).

**Match strategy — v1 strict equality only.** `img.currentSrc === originalSrcUrl || img.src === originalSrcUrl`. Host pages serve different image variants at different sizes (e.g., Amazon's `_SX300_` suffix); v1 matches only the EXACT src that was captured. Pre-existing captured rows have NULL originalSrcUrl and will never match. Future polish item could add fuzzy matching (strip platform-specific size suffixes) but v1 ships clean before that complexity.

**Known v1 limitation — no mid-session cache invalidation.** When the user saves a new image WHILE on a page (the most likely verification flow), the orchestrator does NOT auto-refresh the cache for that urlId — the indicator appears only after page reload. Future polish: push a cache-invalidation hook from `image-capture-form`'s `onSaved` into orchestrator's `capturedImagesByUrlId.delete(urlId) + scanImages()`. Acceptable for v1; director verification flow is "save → reload → confirm indicator."

**Test coverage — Hybrid Option A per Rule 27 forced-picker at session start.**

- **node:test (extension `npm test`):** 10 new cases in `already-saved-image-icon.test.ts` covering `reposition` math (top/left from getBoundingClientRect, zero-geometry hide, negative-clamp), `attachAlreadySavedImageIcon` happy path (icon created with correct class + attributes + ✓ text; positioned from rect) + idempotency (re-attach same id+img returns existing without double-create) + zero-geometry skip, `detachAlreadySavedImageIcon` (removes icon + clears recognition flag, no-op on missing id), `detachAllAlreadySavedImageIcons` (clears all + preserves imgs). 368/368 pass (was 358; +10).
- **node:test (server-side src/lib):** 4 new cases in `images-finalize.test.ts` covering `originalSrcUrl` validation (invalid type rejected with 400) + persistence (string value flows to `data.originalSrcUrl` + appears in response) + null-on-omit + whitespace-trim-to-null. 531/531 pass (was 527; +4).
- **Playwright extension-context spec slice:** new `tests/playwright/extension/p24-saved-image-indicator.spec.ts` (single-platform amazon happy path) — route-intercepts page + `listCompetitorUrls` + `listCapturedImages` + `/api/projects`; navigates to a saved competitor URL with `<img>` matching a saved row; waits for `data-plos-cs-active=1` orchestrator-attach signal; waits for `.plos-cs-saved-image-icon`; asserts exactly 1 icon + correct `data-plos-cs-image-icon-for` attribute + saved-img recognition flag set + non-matching-img recognition flag NOT set. 76/76 Playwright total (was 75; +1).

**Cross-references:** P-24 ROADMAP polish-backlog entry (line ~141 — flipped ✅ DONE with full fix-shape narrative as part of this doc batch); CHAT_REGISTRY 2026-05-19-e top entry; CORRECTIONS_LOG 2026-05-19-e header bump (zero slips; informational observation on doc-vs-code drift caught cleanly at session start); `already-saved-icon.ts` (the URL-anchor sibling helper this module mirrors); `find-underlying-image.ts` (P-23 Amazon fallback — independent feature, no shared code path); deploy session #26 commit `6e7ffa5`; fresh zip `plos-extension-2026-05-19-w2-deploy-26.zip`.

## §B 2026-05-19-f — W#2 → main deploy session #27 — P-25 captured-text haze indicator on the page SHIPPED + DEPLOYED + REAL-CHROME-VERIFIED on vklf.com

**Closes (a.48) RECOMMENDED-NEXT.** Symmetric pair to P-24 saved-image-indicator shipped yesterday (2026-05-19-e); closes the second of three on-page recognition cues (URL ✓ session 3 + image ✓ yesterday + text haze today). Schema-change-in-flight session — additive nullable `selector String?` column on `CapturedText` landed via `npx prisma db push` in 940ms.

**Two genuinely-open Rule 14f forced-pickers fired via AskUserQuestion at session start.**

**Picker 1 — Selector serialization + rendering approach.** Three real options surfaced:

- (A) CSS Custom Highlight API + XPath-based serialized selector — recommended per `feedback_recommendation_style.md` (most thorough/reliable: non-DOM-modifying haze sidesteps the P-14 MutationObserver feedback-loop concern that drove `muteMutationObserver` for `highlight-terms.ts`; manifest already enforces Chrome 105+ which has `CSS.highlights`; clean presentation via `::highlight(plos-cs-saved-text)` pseudo-element)
- (B) `<span class="plos-cs-saved-text-haze">` DOM-wrap + selector — same XPath serialization but DOM-modifies host page; broader compat (works in older Chrome) but adds a third DOM-modifying layer alongside `highlight-terms.ts`'s `<mark>` wraps; risks MutationObserver feedback loops similar to the P-14 incident.
- (C) Hybrid (A) + text-fallback for null-selector legacy rows — strictly more code; trades extra complexity for elimination of the v1 limitation (legacy rows would also get haze via DOM text-walker first-occurrence match); imprecise when same text appears multiple times.

Director picked **(A)**. Rationale: matches P-24's documented v1 limitation pattern (legacy NULL → no haze until re-captured); cleanest co-existence with the existing `highlight-terms.ts` feature; lowest regression risk relative to (B).

**Picker 2 — Test coverage approach (Rule 27 forced-picker).** Director picked **Hybrid Option A** — node:test unit tests on the selector helper + Playwright extension-context spec. Same shape as yesterday's P-24 risk profile. Matches `feedback_recommendation_style.md`: most thorough/reliable per repeatable regression coverage.

**Architecture shipped — 17 files +1870/-5.**

**Schema change (additive nullable):** `CapturedText.selector String?` — opaque JSON-encoded `{xpath, startOffset, endOffset}` resolved against `document.body`. Pre-P-25 rows backfill to NULL with no haze until re-captured (same v1 limitation pattern as P-24's `originalSrcUrl`). Wire shape: `CapturedText.selector: string | null` + `CreateCapturedTextRequest.selector?: string`; route handler validates non-empty string when present.

**Selector helper — new `extensions/competition-scraping/src/lib/captured-text-selector.ts` (460 LOC).** Pure-logic module with NO DOM dependency at import time — testable via hand-built `SelectorElement` + `SelectorText` stubs (same pattern as `find-underlying-image.test.ts`). Surface:

- `encodeSelector` / `decodeSelector` — JSON wrapper with strict validation (returns null on any malformed input so callers can silently skip bad rows rather than propagating errors).
- `parseXPath` / `formatXPath` — tiny element-only XPath grammar (`/DIV[1]/P[2]/SPAN[1]`) with 1-based positional indexing. NO `document.evaluate` dependency so the helper works identically in node:test stubs and real Chrome content-script context.
- `resolveXPath` / `computeXPath` — walk an xpath against a root element; compute an xpath from root to target.
- `collectTextNodes` / `flattenedOffsetWithin` / `nodeAtFlattenedOffset` — convert (textNode, offset-in-node) coordinates to/from flattened character offset within an anchor element's textContent.
- `deepestCommonElementAncestor` — find the deepest shared element of two nodes (anchor for the selector).
- `serializeRangeToSelector(range, root)` — high-level: takes a real DOM Range + root Element, produces a ParsedSelector.
- `deserializeSelectorToRange(selector, root, RangeCtor?)` — inverse; falls back to null on any mismatch.

**Haze renderer — new `extensions/competition-scraping/src/lib/content-script/saved-text-highlight.ts` (214 LOC).** Wraps `CSS.highlights['plos-cs-saved-text']` with attach/detach/clear lifecycle keyed by savedTextId. Module-scope `rangesById: Map<string, Range>` for O(1) per-id lookup. Idempotent re-attach (replaces prior Range). Silent no-op when `CSS.highlights` unavailable (older Chrome / test env without DOM). Test-only `__setTestRegistry` injection hook lets the unit tests exercise the lifecycle with a fake `CSS.highlights` + `Highlight` constructor.

**Orchestrator extension — `extensions/competition-scraping/src/lib/content-script/orchestrator.ts`:**

- **Contextmenu capture-phase listener** extended to ALSO snapshot the user's current `window.getSelection().getRangeAt(0)` alongside the existing `lastRightClickImageSrc` snapshot. The Range is lost across the message round-trip to background and back (Chrome's `info.selectionText` strips it to a string), so it must be captured synchronously BEFORE the menu opens. The snapshot is serialized via `serializeRangeToSelector` + `encodeSelector` and cached as `lastRightClickSelectorJson`.
- **`open-text-capture-form` message handler** passes the cached selector through to `openTextCaptureForm` via the new `selectorJson` prop, then resets the cache so a later right-click without a selection doesn't inherit a stale selector.
- **`maybeShowDetailOverlay`** extended: after the existing `listCapturedImages` fire-and-forget, ALSO fire `listCapturedTexts(projectId, urlId)` via `maybePopulateTextCache`. On settle: `scanTextHazes(urlId)` decodes each row's selector + deserializes to a Range against `document.body` + calls `attachSavedTextHaze(range, row.id)`. Rows with NULL selector are skipped silently. Rows whose Range can't be re-located in current DOM are also skipped (best-effort match — same v1 limitation as P-24).
- **MutationObserver tick** + **URL-change teardown** + **page teardown** all call `scanTextHazes` (rescan) or `clearTextHazes` (drop registry) per their respective phases.

**Form wiring — `text-capture-form.ts`:** new `selectorJson: string | null` prop. On Save success, the form spreads `selector: selectorJson` into the `createCapturedText` request body (omitted when null so server defaults to NULL). `api-bridge.ts` + `api-client.ts` + `messaging.ts` + `background.ts` all gained matching `list-captured-texts` dispatch + the wire-shape selector field.

**CSS — `styles.ts`:** new `::highlight(plos-cs-saved-text)` rule with `background-color: rgba(255, 235, 59, 0.32) !important` + `text-decoration: underline dotted rgba(120, 80, 0, 0.45) !important`. Distinct from `.plos-cs-saved-image-icon` (P-24 image indicator) and `mark.plos-cs-highlight-term` (highlight-terms feature) — zero CSS-class / Highlight-name / lifecycle collisions.

**Collision avoidance with highlight-terms.ts (existing user-keyword feature):** P-25 uses a DIFFERENT CSS Custom Highlight registry name (`plos-cs-saved-text` vs. highlight-terms' `<mark>` wraps), DIFFERENT styling pseudo-element, and DIFFERENT teardown lifecycle. Both features can coexist on the same page without interference. The P-14 `muteMutationObserver` machinery is NOT needed for P-25 because CSS Custom Highlight is non-DOM-modifying — the host-page MutationObserver wouldn't see the haze, so there's no feedback-loop risk.

**Test coverage — Hybrid Option A per Rule 27 forced-picker.**

- **node:test (server-side src/lib):** 5 new cases in `url-text.test.ts` covering selector POST handling (400 on empty string, 400 on non-string, 201 persists when provided, 201 omitted-null-on-wire) + GET wire shape (returns selector for both null and non-null cases). 536/536 pass (was 531; +5).
- **node:test (extension `npm test`):** 36 new cases in `captured-text-selector.test.ts` covering encode/decode JSON round-trip + xpath parse/format/resolve/compute + text-node collection + flattened-offset conversion + deepest-common-ancestor; 12 new cases in `saved-text-highlight.test.ts` covering attach/detach lifecycle + idempotent re-attach + cleanup + graceful no-op when CSS.highlights unavailable. 416/416 pass (was 368; +48).
- **Playwright extension-context spec:** new `tests/playwright/extension/p25-saved-text-haze.spec.ts` (single-platform amazon happy path) — two tests covering: (1) `CSS.highlights['plos-cs-saved-text']` registers exactly the rows whose selector re-locates (null-selector row is correctly skipped; valid row's Range.toString() matches the expected substring); (2) haze tears down on navigation away from saved URL. 78/78 Playwright total (was 76; +2).

**Director real-Chrome verification PASS first try.** Sideloaded `plos-extension-2026-05-19-w2-deploy-27.zip`; captured a new text snippet via right-click on a saved competitor URL; reloaded page; light-yellow haze visible on the matched span. Legacy NULL-selector rows correctly showed no haze (v1 limitation as documented).

**One informational process-observation captured in CORRECTIONS_LOG 2026-05-19-f (NOT a real-tier slip):** the first Playwright run failed because `.output/chrome-mv3/` had a stale build from before today's orchestrator + messaging + background changes. The Playwright fixture loads the built extension via `--load-extension`, so without a rebuild the test exercised yesterday's bits. Caught immediately via TimeoutError on `waitForFunction(CSS.highlights.get('plos-cs-saved-text'))`; ran `npm run build` in the extension dir; rebuilt extension verified by `background.js` mtime + size delta; re-ran Playwright → PASS on first try. Future-session prevention: when running Playwright extension-context specs after editing extension source, ALWAYS rebuild before running playwright. Consider a `pretest` Playwright config hook that runs the wxt build if `.output/` is older than any `src/` file.

**Cross-references:** P-25 ROADMAP polish-backlog entry (flipped ✅ DONE with full fix-shape narrative as part of this doc batch); CHAT_REGISTRY 2026-05-19-f top entry; CORRECTIONS_LOG 2026-05-19-f header bump (zero CORRECTIONS_LOG-tier slips; one informational observation captured on stale-extension-build catch); `already-saved-image-icon.ts` (the P-24 sibling helper this module's design mirrors); `highlight-terms.ts` (the existing unrelated keyword-highlight feature — distinct registry name + class + lifecycle confirmed no-collision); deploy session #27 commit `e7c82da`; fresh zip `plos-extension-2026-05-19-w2-deploy-27.zip`.

---

## §B 2026-05-19-g — P-23 saved-URL dropdown side-by-side ship session

**Session:** `session_2026-05-19-g_w2-main-deploy-session-28-p23-saved-url-dropdown-DEPLOYED`. W#2 → main deploy session #28.

**What shipped:** Pre-P-23 behavior — the 3 caller forms that render a "Pick a saved URL…" dropdown built each `<option>` label as `row.productName?.trim() || (row.url long? truncate : row.url)` — i.e., when productName was set, the URL disappeared from the option text entirely. Director-reported impact: when multiple saved URLs shared the same product name (e.g., variant SKUs of one brand's product), the director couldn't tell WHICH saved URL they were about to attach a capture to without first opening each URL detail page.

Post-P-23 behavior — same 3 caller forms render `${productName} — ${url-truncated-at-60}` (em-dash separator) when productName is non-empty after `.trim()`; URL-only path with the prior 80/77-char truncation preserved exactly when productName is null / undefined / empty / all-whitespace.

**Drift caught at session-start (Rule 3 — code wins).** Launch prompt (written at the close of 2026-05-19-f) named two fix sites: `text-capture-form.ts` (correctly) and `url-add-form.ts` (incorrectly — the file has no saved-URL `<select>`; its only `opt.textContent = entry.value` lines are inside the content-category vocab picker shipped as P-36 2026-05-15). Grep of `productName?\.trim\(\)` across the extension surfaced THREE actual sites with the pre-P-23 collapse pattern: `text-capture-form.ts:474-476` + `image-capture-form.ts:534-536` (parallel sibling for image captures, NOT named in prompt) + `CapturedTextPasteForm.tsx:255-258` (popup-side React paste form, NOT named in prompt). Drift surfaced via AskUserQuestion picker BEFORE any code; director picked Option A (all-3-sites scope) over Option B (just text-capture-form — prompt's narrow read) + Option C (skip the popup form). All-3-sites scope chosen to prevent discoverable inconsistency between the three forms — every saved-URL dropdown in the extension now behaves the same way after this ship.

**Label format choice — Rule 14f forced-picker before coding.** Options weighed:
- (A) **Em-dash separator `${productName} — ${url}` (PICKED — recommended).** Plain text inside `<option>`; em-dash is the conventional UX pattern across native select UIs; no extra DOM; works in all browsers identically; visually distinct from a hyphen-in-name. Reversible — trivial to change later.
- (B) Pipe separator `${productName} | ${url}`. Compact but `|` can look like the letter `I` or `l` in some fonts. Same DOM shape as A.
- (C) Two-line layout via `<span>` + CSS. Richer hierarchy but `<option>` styling is highly restricted in most browsers (Chrome silently ignores most CSS on `<option>`). High risk of looking fine in code but rendering as plain concatenated text on real Chrome — the very platform PLOS ships to.
- (D) Aggressive truncate (URL to 30 chars + concat). Risks losing the distinguishing part of the URL.

Director picked Option A (em-dash) per `feedback_recommendation_style.md` (most thorough/reliable).

**Truncation budget refinement.** Pre-P-23 truncation budget was URL.length > 80 → truncate to 77 + ellipsis. Post-P-23: when productName is also present in the option text, tighten the URL budget to 60 (truncate to 57 + ellipsis) so the total `${productName} — ${url}` stays scannable. When productName is absent, the 80/77 budget is preserved exactly — the URL-only path is unchanged from pre-P-23 (regression-test case included in the helper's node:test suite to lock this).

**Extraction to a shared pure helper.** Rather than duplicate the new label logic across 3 caller sites, extract to a new pure helper file `extensions/competition-scraping/src/lib/saved-url-option-label.ts`:

```ts
export function buildSavedUrlOptionLabel(
  row: { productName?: string | null; url: string }
): string {
  const trimmedName = typeof row.productName === 'string' ? row.productName.trim() : '';
  if (trimmedName.length > 0) {
    return `${trimmedName} — ${truncate(row.url, 60, 57)}`;
  }
  return truncate(row.url, 80, 77);
}
```

All 3 caller sites import + call `buildSavedUrlOptionLabel(row)` — each call site replaces ~5 LOC of inline collapse logic with one function call. Helper lives at the top-level extension lib (alongside `url-normalization.ts` etc.) since it's used from both content-script context (the two right-click forms) and the popup origin (the React paste form).

**Test coverage choice — Rule 27 forced-picker before coding.** Options weighed:
- (A) **Hybrid (PICKED — recommended).** node:test on the pure helper (productName present/absent/null/undefined/whitespace × truncation at 60/61/80/81 boundaries × pre-P-23 URL-only regression) + 1 Playwright extension-context spec asserting the rendered `<option>` text shape for two seeded saved URLs (one with productName, one without) in the text-capture form. Sibling sites (image-capture-form + CapturedTextPasteForm) covered by the pure-helper cases alone — sufficient because the helper output is identical across all 3 callers; the Playwright spec verifies the content-script rendering path end-to-end on one site.
- (B) node:test only (defer Playwright to P-22).
- (C) Director manual walkthrough only.

Director picked Option A. Result: +12 node:test cases (extension test suite 416 → 428) + 1 Playwright spec (78 → 79).

**Real-Chrome verification (Rule 27 scope exception — visual judgment).** Director walkthrough on all 3 forms after deploy → PASS first try. All three dropdowns rendered the em-dash side-by-side label for rows with productName + URL-only for rows without — pre-P-23 behavior preserved on the URL-only path.

**Affected §A sections (informational — §A frozen per Rule 18):**
- §A.7 Module 1 (URL capture flow) — the saved-URL picker UX in all 3 forms now shows `${productName} — ${url}` side-by-side instead of collapsing the URL when productName is set. No spec-level change to §A.7's URL-add or text-capture flows; this is a display-only refinement at the dropdown-label layer.

**Cross-references:**
- ROADMAP W#2 polish backlog P-23 dropdown entry (flipped ✅ DONE 2026-05-19-g with full fix-shape narrative)
- `extensions/competition-scraping/src/lib/saved-url-option-label.ts` (the new pure helper)
- `extensions/competition-scraping/src/lib/saved-url-option-label.test.ts` (12 node:test cases)
- `tests/playwright/extension/p23-saved-url-dropdown-label.spec.ts` (the new Playwright spec)
- `extensions/competition-scraping/src/lib/content-script/text-capture-form.ts:474` (caller site 1)
- `extensions/competition-scraping/src/lib/content-script/image-capture-form.ts:534` (caller site 2)
- `extensions/competition-scraping/src/entrypoints/popup/components/CapturedTextPasteForm.tsx:255` (caller site 3)
- COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md "Deploy session #28" section (full pre-deploy + post-merge scoreboard + real-Chrome verification narrative)
- CORRECTIONS_LOG 2026-05-19-g (informational entries on wxt-build-hang recurrence + launch-prompt drift as third recent Rule 3 catch)
- deploy session #28 commit `5cb2419`; fresh zip `plos-extension-2026-05-19-w2-deploy-28.zip`

---

## §B 2026-05-19-g-2 — P-27 Captured-videos feature scope-add (mid-build directive Read-It-Back per Rule 18)

**Session:** addendum to `session_2026-05-19-g_w2-main-deploy-session-28-p23-saved-url-dropdown-DEPLOYED` (`session_2026-05-19-g-2`). Post-handoff scope-add directive from director.

**Director's verbatim directive 2026-05-19-g:** *"I want to add a new feature to the roadmap for Workflow #2. While we are able to capture text and images currently and add them under urls for all platforms and websites, I want to be able to also capture videos as well and add them to video categories under the urls."*

**Read-It-Back per Rule 18 mid-build directive:** capturing as P-27 in the W#2 polish backlog with full ROADMAP entry; this §B 2026-05-19-g-2 entry is the design-side anchor for the future dedicated design session before code starts. No code is committed today; only the capture + the open design questions.

### Director's three Rule 14f forced-picker outcomes (captured today)

| Question | Options | Director's pick | Rationale |
|---|---|---|---|
| **Q1 Source — what's stored when you capture a video** | (A) URL reference only / (B) **URL + uploaded bytes both** / (C) Bytes only | **(B) URL reference + uploaded video bytes — BOTH stored** | Most thorough for archival (if competitor deletes the video, the bytes are preserved); accepts the heavier scope (new Supabase bucket + raised cap + thumbnail extraction). |
| **Q2 Gestures — UX paths** | (A) **Full symmetry with text/image (all 3 paths)** / (B) Popup paste only / (C) Right-click only | **(A) Full symmetry — right-click on `<video>` + right-click on embed + popup paste form** | Matches director's standing pattern of UX symmetry across text/image/now-video; heaviest implementation but most thorough user-facing parity. |
| **Q3 Graduation timing** | (A) **Pre-graduation polish item** / (B) Post-graduation expansion | **(A) Pre-graduation — joins P-22 + P-18 + P-26** | Director's standing directive *"All these things should ship before Workflow #2 is deemed complete"* (captured 2026-05-19-d-2). W#2 graduation now requires 4 remaining items, not 3. |

### Two relevant CONSTRAINTS surfaced by Rule 24 pre-capture search

1. **`STACK_DECISIONS.md:144` (load-bearing).** The current image-upload 5 MB size cap was chosen *specifically to prevent video uploads*: verbatim *"5 MB cap covers the heavy tail without permitting accidental video uploads or oversized PNGs."* P-27 needs to either (a) raise that cap, OR (b) introduce a new bucket with a deliberately-larger cap (preferred — keeps the image bucket's 5MB cap as the existing-uploads constraint while a separate video bucket has its own larger cap). The design session will pick which.

2. **`PLATFORM_REQUIREMENTS.md:427` (already-flagged tech-debt).** Verbatim: *"Workflow-deliverable storage (videos, design files, etc.) likely needs a dedicated bucket strategy — possibly private + signed URLs (already on the tech-debt list)."* P-27's bucket design SATISFIES this tech-debt item; the design session should explicitly close (or scope) this PLATFORM_REQUIREMENTS item.

### 7 open design questions to resolve in the dedicated design session before any code starts

1. **New Supabase bucket strategy.** Private + signed URLs (per `PLATFORM_REQUIREMENTS.md:427` directional hint) vs. public? Size cap (candidates: 100 MB / 500 MB / per-project byte budget)? MIME-type allowlist (`video/mp4` + `video/webm` likely; `video/quicktime` for `.mov` — should we accept?)? Bucket name?
2. **Thumbnail extraction.** Server-side FFmpeg in a Vercel serverless function (heavy infra lift; flexible) vs. client-side extension `<video>` + `<canvas>` frame-grab (lighter; relies on the extension doing the thumb-extract before upload) vs. just rely on the source URL's poster attribute / YouTube auto-thumb API (lightest; only works for embedded video platforms). Forced-picker at design-session start.
3. **Schema additions.** New `CapturedVideo` table (chosen — symmetric with `CapturedText`/`CapturedImage`; cleaner) vs. polymorphic `CapturedAsset` with `mediaType` discriminator (rejected — less type-safe; would force refactor of existing models). New `video-category` vocabulary type — confirm this is the right shape vs. reusing `image-category` for some videos (e.g., "main product image / lifestyle / detail shot" categories vs. "demo video / unboxing video / review video / promo video" video-specific categories). Likely new type.
4. **YouTube/Vimeo handling.** For embedded video platforms — store URL only (likely; YouTube ToS + technical extraction difficulty argue against attempting to download bytes), OR attempt URL-to-bytes download (likely rejected). Document the decision explicitly + the URL-only fallback for embeds.
5. **Cross-platform `<video>` detection.** Empirical investigation needed in design session: which of the 7 supported platforms (Amazon / Ebay / Etsy / Walmart / Google Shopping / Google Ads / Independent Website) actually host inline `<video>` elements on PDPs vs. embed YouTube/Vimeo iframes vs. neither? Amazon's PDPs are known to host inline `<video>` for 360° spin views + product demos. Other platforms TBD.
6. **Three Living Questions (Rule 7) — answers to record in DATA_CATALOG at design time.** (i) **Upstream data needed:** Project + Platform + CompetitorUrl (parent) + new `video-category` vocabulary type. (ii) **Read-only or editable downstream:** read-only by future W#3+ workflows; same pattern as captured text/images. (iii) **N/A** (read-only path).
7. **DATA_CATALOG §7 Cross-Tool Data Flow Map.** Add a new "captured videos" output entry to W#2's row, per Rule 18 reciprocal output declaration. Downstream consumers initially "TBD." This pre-declared output lets future W#3+ interviews pull the output spec from W#2's row without re-asking W#2's chat.

### Estimated scope

**~6-12 sessions** before W#2 graduation; broken down approximately:
- **Session 1 — Design interview + DESIGN §B entry + schema design (no code).** Resolves the 7 open questions above + finalizes the `CapturedVideo` Prisma model shape + bucket name + size cap + thumbnail approach. Director-confirmed before Session 2.
- **Session 2 — Schema migration + bucket setup + API routes scaffolding.** `npx prisma db push` for new `CapturedVideo` table + new `video-category` enum value; new Supabase Storage bucket; new API route handlers under `/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/` (POST/GET/PATCH/DELETE following the CapturedImage pattern).
- **Sessions 3-5 — Extension content-script + popup forms.** Right-click `<video>` capture form (`video-capture-form.ts`); right-click embed fallback (`video-embed-capture-form.ts`); popup paste form (`CapturedVideoPasteForm.tsx`); saved-video on-page indicator overlay; URL detail page renderer (`<iframe>` for embeds + `<video>` for direct sources + click-to-play thumbnail overlay).
- **Session 6 — Single-platform amazon Playwright spec.** Following P-23/P-24/P-25 pattern: single platform first; cross-platform extension deferred to a P-22-style follow-up.
- **Optional Sessions 7+ — Thumbnail extraction polish + size-cap tuning + YouTube-embed special handling + cross-platform Playwright extension (via P-22-style pattern).**

W#2 graduation estimate revised: ~3-6 more sessions (pre-P-27 capture, items were P-22 + P-18 + P-26) → ~9-18 more sessions (post-P-27 capture, items are P-22 + P-18 + P-26 + P-27 where P-27 alone is ~6-12 sessions).

### Why this is a §B entry and not a §A change

§A is frozen per Rule 18 (Initial Requirements Interview answers — original spec). P-27 is an in-flight scope expansion that extends Q5 (Outputs) of the original interview — original interview captured "captured text + captured images" as W#2's outputs; today's directive adds "captured videos" as a third output. This §B entry is the canonical record of that expansion. When P-27 ships, this §B entry becomes the historical anchor; the resulting `CapturedVideo` schema + bucket strategy + UX flows will get their own §B entries at code-ship time per the standard pattern.

### Affected sections (informational — §A frozen per Rule 18)

- **§A.7 Module 1 (URL capture flow)** — videos do NOT affect URL capture itself; only adds a new asset type that can be attached to a captured URL post-capture.
- **§A.7 Module 2 (highlight-and-add capture flow)** — extended with a new Module 2c (videos) parallel to existing Module 2a (text) + Module 2b (images). Specifics of Module 2c land in a future §B entry at ship time.
- **§A.15 (image metadata fields)** — videos will have a parallel set (composition, embedded text, tags, duration_seconds NEW relative to images, sortOrder).

### Cross-references

- ROADMAP W#2 polish backlog P-27 entry (captured today with full fix-shape narrative + 7 open design questions)
- `extensions/competition-scraping/src/lib/content-script/image-capture-form.ts` (sibling pattern to mirror for video right-click form)
- `extensions/competition-scraping/src/lib/content-script/find-underlying-image.ts` (sibling DOM-walking helper to mirror for embed-fallback path)
- `extensions/competition-scraping/src/entrypoints/popup/components/CapturedTextPasteForm.tsx` (sibling pattern to mirror for popup paste video form)
- `prisma/schema.prisma` `CapturedImage` model (sibling table to mirror for `CapturedVideo`)
- `STACK_DECISIONS.md:144` (5MB image cap reasoning to revisit at design session)
- `PLATFORM_REQUIREMENTS.md:427` (already-flagged tech-debt note that P-27 satisfies/scopes)
- `feedback_recommendation_style.md` (director's standing preference for most-thorough/reliable path; informed all three picks today)
- CORRECTIONS_LOG 2026-05-19-g-2 header amendment (this addendum doc-batch)
- CHAT_REGISTRY 2026-05-19-g-2 header amendment

---

## §B 2026-05-20-b — P-27 Captured-videos feature design session shipped — design lives in standalone `docs/CAPTURED_VIDEOS_DESIGN.md` (cross-reference pointer)

**Session:** `session_2026-05-20-b_p27-captured-videos-design-interview` (Claude Code, on `workflow-2-competition-scraping`; DOC-ONLY — no code, no schema, no deploy).

**Director's directive 2026-05-20-b (Rule 14f forced-picker at session start, before any other interview work):** the design doc structure picker fired at session start per the 2026-05-19-g-2 §B entry above (which had pre-staged the picker shape A/B/C/D). Director picked **Option A — new top-level `docs/CAPTURED_VIDEOS_DESIGN.md` Group B doc** over Option B (§B append in this doc) and Option C (both — heaviest).

**Director's pick rationale.** Option A wins on three criteria: (1) cleaner separation — P-27 is a substantive new functional surface with its own ~6-9 build sessions estimated, deserving top-level visibility rather than burial in this doc's §B history; (2) top-level discoverability — future P-27 Build sessions read `docs/CAPTURED_VIDEOS_DESIGN.md` directly without grepping for §B entries; (3) clean separation of W#2's graduated-pattern §A from P-27's new-feature §A (this doc's §A is frozen at the original Workflow Requirements Interview spec; P-27 introduces new spec content that warrants its own §A frozen narrative + §B append-only history).

**Alternatives considered.** Option B (§B append in this doc) — director rejected: lighter doc-add cost but would have ballooned this already-3,078-line doc + buried the design in §B append history; future Build sessions would have had to grep §B for the P-27 design entry. Option C (both — new top-level doc + §B cross-reference here) — director rejected as heaviest: two places to update going forward; potentially confusing about which is canonical. Option D (escape hatch — different doc structure) — not invoked.

**Decision.** P-27 design lives in standalone `docs/CAPTURED_VIDEOS_DESIGN.md` (525 lines after corrections; §A.0–§A.18 frozen + §B empty per Rule 18 shape). This §B 2026-05-20-b entry is the cross-reference pointer from this doc to the standalone P-27 spec.

**Reasoning summary (for future readers searching for P-27 design rationale in this doc):**

- Look up the P-27 schema spec in `docs/CAPTURED_VIDEOS_DESIGN.md` §A.7 (CapturedVideo table fields + new `VideoSourceType` enum + new `video-category` value added to existing VocabularyEntry `type` enum).
- Look up the bucket + size cap + thumbnail extraction picks in `docs/CAPTURED_VIDEOS_DESIGN.md` §A.9.
- Look up the v1 scope picks in `docs/CAPTURED_VIDEOS_DESIGN.md` §A.3.
- Look up the implementation arc table (Build session sequencing) in `docs/CAPTURED_VIDEOS_DESIGN.md` §A.2.
- Look up the 11 forced-picker outcomes audit trail in `docs/CAPTURED_VIDEOS_DESIGN.md` §A.0.

**Impact on §A of this doc (informational — §A frozen per Rule 18; this §B entry captures the impact for traceability).** §A is unchanged. P-27 is a NEW polish item on top of W#2's graduated-pattern surface; it does NOT alter the original Workflow Requirements Interview answers. The Q5 (Outputs) section of §A originally captured text + image as W#2's outputs; the 2026-05-19-g-2 §B entry above captured the scope expansion to text + image + video; this §B 2026-05-20-b entry captures the design session that resolved the open design questions for the video third-output. When P-27 ships, the resulting `CapturedVideo` schema + bucket strategy + UX flows will get their own §B entries in the standalone `docs/CAPTURED_VIDEOS_DESIGN.md` at code-ship time per the Rule 18 §B append-only pattern (NOT in this doc's §B).

**Rule 24 end-of-session catch worth noting here for traceability** (full detail in `docs/CORRECTIONS_LOG.md` §Entry 2026-05-20-b INFORMATIONAL): the design doc §A.8 originally claimed text + image capture forms force admin-page-first vocab creation; per Rule 3 code-wins, inline "+ Add new category" UX already shipped to text + image + URL forms per ROADMAP P-13 (`text-capture-form.ts:305` + `image-capture-form.ts:368` + `url-add-form.ts:244` + `CapturedTextPasteForm.tsx:262`). Caught + corrected before commit. The corrected §A.3 / §A.8 / §A.18 narrative now accurately documents that P-27 Q9's pick of Option C (inline "+ Add new category" affordance) extends the EXISTING pattern to videos; it does NOT introduce a new pattern. Pattern strengthening: ALSO run Rule 24 / Rule 3 checks BEFORE making claims about existing UX in design docs, not just for ROADMAP-capture moments.

### Cross-references

- `docs/CAPTURED_VIDEOS_DESIGN.md` (NEW Group B doc shipped this session — 525 lines; §A frozen + §B empty per Rule 18 shape; the binding spec for the P-27 Build arc).
- ROADMAP P-27 polish backlog entry (annotated 2026-05-20-b with "✅ Design session 1 complete; Next stage = Build #1" + all 11 forced-picker outcomes surfaced).
- COMPETITION_SCRAPING_DESIGN §B 2026-05-19-g-2 above (the scope-add directive Read-It-Back that pre-staged today's design session — direct prior entry).
- `docs/DATA_CATALOG.md` §7.2.2 W#2 row (extended this session with Captured video library output entry per Rule 18 reciprocal output declaration).
- `docs/PLATFORM_REQUIREMENTS.md` §10.2 line 427 (partial-closed this session for video — the dedicated-bucket-strategy tech-debt note now affirmed in code for video) + new video-storage scale-projections paragraph.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-20-b INFORMATIONAL (the Rule 24 end-of-session catch on the §A.8 asymmetry-claim).
- ROADMAP header narrative 2026-05-20-b (the canonical session narrative).
- CHAT_REGISTRY 2026-05-20-b top entry (the canonical chronological log).
- `feedback_recommendation_style.md` (director's standing preference for most-thorough/reliable path; informed all 11 forced-picker outcomes this session).
- 2 NEW permanent feedback memories saved this session: `feedback_destructive_ops_confirmation.md` + `feedback_remaining_roadmap_summary.md`.

---

## §B 2026-05-23 — P-46 W#2 Phase 2 redesign DESIGN session shipped — design lives in standalone `docs/COMPETITION_DATA_V2_DESIGN.md` (cross-reference pointer)

**Session:** `session_2026-05-23_p46-w2-phase-2-design-session` (Claude Code, on `workflow-2-competition-scraping`; DOC-ONLY — no code, no schema, no deploy).

**Director's directive 2026-05-23 (carry-over from 2026-05-22-i's NEXT_SESSION.md):** P-46 W#2 Phase 2 redesign design session — locked since 2026-05-22-c to start AFTER P-45 ships, which happened 2026-05-22-i. Run through the 10 deferred clarification questions captured in the P-46 ROADMAP entry via Rule 14f forced-pickers + create a new design doc capturing the locked decisions.

**Design-doc shape decision (no forced-picker fired this session for the doc-structure question — pre-locked by the 2026-05-20-b CAPTURED_VIDEOS_DESIGN.md precedent + the parent session brief).** Picked **Option A — new top-level `docs/COMPETITION_DATA_V2_DESIGN.md` Group B doc** matching the 2026-05-20-b CAPTURED_VIDEOS_DESIGN.md split rationale: (1) cleaner separation — P-46 is a substantive Phase 2 expansion with 5 workstreams + 11-17 build sessions estimated, deserving top-level visibility; (2) top-level discoverability — future P-46 Workstream sessions read `docs/COMPETITION_DATA_V2_DESIGN.md` directly without grepping §B history; (3) clean separation of W#2's frozen Phase 1 §A from P-46's new Phase 2 §A (this doc's §A is frozen at the 2026-05-04 Workflow Requirements Interview spec; P-46 introduces new Phase 2 spec content that warrants its own §A frozen narrative + §B append-only history).

**Decision.** P-46 design lives in standalone `docs/COMPETITION_DATA_V2_DESIGN.md` (~700 lines; §A.1-§A.10 frozen + §A.0 audit trail + §A.11 schema-additions list + §A.12 5-workstream sequencing + §A.13 verification strategy + §B empty per Rule 18 shape + §C per-workstream implementation outlines covering 5 workstreams). This §B 2026-05-23 entry is the cross-reference pointer from this doc to the standalone P-46 spec.

**The 10 locked decisions (verbatim from §A.1-§A.10 of the new design doc — full rationale + alternatives there).**

- **(Q1)** Reviews extraction shape — DEFERRED to future per-platform polish sessions; director said "Each platform will have different ways of capturing reviews and we will discuss those methods of capture later." Selected via "Other" option. Follow-up picker on Q1 narrowed v1 surface to schema + URL-detail-page view + vklf.com-side manual entry form; NO extension Reviews gesture in v1.
- **(Q2)** Inline cell editing — click-to-edit on every cell (recommended); spreadsheet feel; Tab/Enter saves.
- **(Q3)** Per-user UI preferences storage — server-side per-user (cross-device sync) via new `UserTablePreferences` Prisma model keyed by (userId, projectId) (recommended).
- **(Q4)** Comprehensive Competitor Analysis page scope — one per Project (recommended); single rich-text doc per Project.
- **(Q5)** Rich-text editor library — TipTap (recommended).
- **(Q6)** Sizes/Options box — hide UI but keep data (recommended); no destructive migration.
- **(Q7)** Competition Score input — number input only (recommended); no slider.
- **(Q8)** Status column ↔ URL detail page Scraping Status — SKIPPED via Rule 14f Default-to-recommendation exception (permission-on-default-approved-path); locked default: bidirectional mirror through `CompetitorUrl.scrapingStatus` enum.
- **(Q9)** Select preview thumbnail — DROPPED from P-46 entirely; director said "Ignore this feature. We don't need to add it anymore." Selected via "Other" option.
- **(Q10)** Workstream sequencing — Schema → URL detail page → Competition Data table → Comprehensive Analysis page → Extension + Reviews (recommended); Workstream 1 (Schema) is non-negotiable first.

**Scope reductions locked this session.** Q1's deferral + Q9's drop shrink P-46 from the original 15-25 sessions estimate to a revised 11-17 sessions across 5 workstreams (Schema 2-3 / URL detail page 2-3 / Competition Data table 3-4 / Comprehensive Analysis page 2-3 / Extension form additions + manual Reviews entry 2-4).

**Reasoning summary (for future readers searching for P-46 design rationale in this doc).**

- Look up the 10 locked decisions in `docs/COMPETITION_DATA_V2_DESIGN.md` §A.1-§A.10.
- Look up the consolidated schema-additions list (new tables CapturedReview / ComprehensiveCompetitorAnalysis / UserTablePreferences + new CompetitorUrl columns + new analysis Json columns on CapturedText/Image/Video + new ScrapingStatus enum + new overallAnalyses Json column on CompetitorUrl) in `docs/COMPETITION_DATA_V2_DESIGN.md` §A.11.
- Look up the 5-workstream sequencing + revised 11-17 sessions estimate in `docs/COMPETITION_DATA_V2_DESIGN.md` §A.12.
- Look up the per-workstream verification strategy in `docs/COMPETITION_DATA_V2_DESIGN.md` §A.13.
- Look up the per-workstream implementation outlines in `docs/COMPETITION_DATA_V2_DESIGN.md` §C (5 §C subsections).
- Look up the 8 forced-picker outcomes audit trail + the 3 informational drift-check observations at session start in `docs/COMPETITION_DATA_V2_DESIGN.md` §A.0.

**Impact on §A of this doc (informational — §A frozen per Rule 18; this §B entry captures the impact for traceability).** §A is unchanged. P-46 is a Phase 2 expansion on top of W#2's graduated-pattern surface; it does NOT alter the original Workflow Requirements Interview answers from 2026-05-04. The Q5 (Outputs) section of §A originally captured text + image as W#2's outputs; the 2026-05-19-g-2 §B entry above captured the scope expansion to text + image + video for P-27; the 2026-05-20-b §B entry above captured the design session that resolved the P-27 open design questions; this §B 2026-05-23 entry captures the P-46 Phase 2 redesign that expands the structured-data surface (new ~12 table columns + new Comprehensive Competitor Analysis page + Reviews capture surface + URL detail page restructure + vklf.com-side upload/edit/delete + extension form additions). When P-46 ships across the 5 workstreams, the resulting schema + UI + extension changes will get their own §B entries in the standalone `docs/COMPETITION_DATA_V2_DESIGN.md` at code-ship time per the Rule 18 §B append-only pattern (NOT in this doc's §B).

**Three INFORMATIONAL drift-check observations captured at session start + in the new design doc §A.0 (NOT promoted to a CORRECTIONS_LOG §Entry since informational + cleanly resolved within the design doc itself).**

1. P-46 ROADMAP entry's schema-additions list claimed `resultsPageRank` + `numProductReviews` + `numSellerReviews` as new fields, but all three already exist on `CompetitorUrl` (lines 262/265/266 of `prisma/schema.prisma`). Notation drift only; cleaned up in the new design doc's §A.11 consolidated schema-additions list.
2. P-46 entry references `page.tsx` for the table redesign; actual table lives in `components/CompetitionScrapingViewer.tsx` + `UrlTable.tsx` + `ColumnFilters.tsx`. New design doc §C.3 (Competition Data table workstream) references the correct files per workstream.
3. P-46 entry's `UrlDetailContent.tsx:740` Sizes/Options box reference confirmed correct (heading at 740; `SizesSubsection` function at 729). No drift; documented for traceability.

### Cross-references

- `docs/COMPETITION_DATA_V2_DESIGN.md` (NEW Group B doc shipped this session — ~700 lines; §A frozen + §B empty per Rule 18 shape; the binding spec for the P-46 5-workstream build arc).
- ROADMAP P-46 polish backlog entry (annotated 2026-05-23 with 🟢 DESIGN COMPLETE + the 10 DECISIONS LOCKED Q→A mapping inline + revised estimate 11-17 sessions across 5 workstreams + cross-reference to the new design doc).
- COMPETITION_SCRAPING_DESIGN §B 2026-05-20-b above (the parallel P-27 design-doc-split precedent that informed this session's doc-structure decision).
- COMPETITION_SCRAPING_DESIGN §B 2026-05-19-g-2 above (the original P-27 scope-add directive that started the captured-videos arc — P-45 closed last session; P-46 starts here).
- `docs/CAPTURED_VIDEOS_DESIGN.md` (the sibling design doc for P-27 + P-45; §B 2026-05-23 cross-reference entry appended this session noting P-46 design shipped).
- `docs/DOCUMENT_MANIFEST.md` (registered new `docs/COMPETITION_DATA_V2_DESIGN.md` as Group B Workflow-2 doc; loaded for any P-46 workstream session).
- ROADMAP header narrative 2026-05-23 (the canonical session narrative).
- CHAT_REGISTRY 2026-05-23 top entry (the canonical chronological log).
- `feedback_recommendation_style.md` (director's standing preference for most-thorough/reliable path; informed the 8 forced-picker outcomes this session).
- `feedback_default_to_recommendation.md` (informed the Q8 picker-skip — single most-thorough path obvious; Q8 was permission-on-default-approved-path not intent-clarification).

---

## §B 2026-05-24-d — `session_2026-05-24-d_p47-shadow-dom-refactor-session-1` — P-47 Shadow DOM refactor Session 1 lands the content-script video-capture-form mount strategy refactor from `document.body` + 80-event-listener band-aid to open Shadow DOM root with `FORM_CHROME_CSS` injected inside the shadow + band-aid deletion — NEW reusable Pattern memorialized "Shadow DOM mount as structural replacement for per-listener event-isolation band-aid" pairing with P-45 Build #2 §Entry 2026-05-22-i Pattern B as the long-term-fix pairing — LOW informational sub-observation on CSS extraction into shared exported constant + template-literal interpolation back into composite constant

**Session:** `session_2026-05-24-d_p47-shadow-dom-refactor-session-1` (Claude Code, on `workflow-2-competition-scraping`; PURE CODE — no schema, no API, no shared-types; no main push)
**Branch:** `workflow-2-competition-scraping` (single-branch; no main push; build commit `d08f673` sits on workflow branch alongside the 2 prior W5 build commits `3c981be` + `41172f1` all awaiting the next bundled W5 + P-47 deploy session per (a.87))
**Build commits this session:** ONE — `d08f673` — W#2 polish P-47 Shadow DOM refactor Session 1 — replace 80-event-listener band-aid with Shadow DOM mount — 2 files +203/-220 (net -17 LOC)
**Pushes today:** 1 — end-of-session push of build commit `d08f673` + today's doc-batch together to `origin/workflow-2-competition-scraping` (operationally adjacent; NO Rule 9 gate fired — no destructive operations, no main push)
**Director directive at session start:** *"please defer any real world testing that needs to be done by me and work on the next item otherwise road map for workflow#"* — same standing pattern as prior 2 sessions; resolved per `feedback_default_to_recommendation.md` without a re-confirmation picker since the launch-prompt task (P-47 Shadow DOM refactor Session 1, pure code) was already the recommended default and matched the directive
**Director directive mid-session:** *"please skip anything that requires me to do real world testing in this session"* — directly skipped P-47 Step 8 (empirical Chrome verification on Amazon); captured as DEFERRED task #6 + resolved by routing the verify to next session's bundled deploy Phase-4 step
**Director directive at end-of-session:** picker outcome A (Bundled W5 + P-47 deploy session — Recommended) over (B) P-26 below-fold scroll capture Session 1 + (C) P-43 mechanical prevention small fix + (D) question first
**Status:** P-47 Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-24-d. P-47 implementation arc progress: Session 1 of the original 2-3 estimate landed at code level; Session 2 (Cross-platform verification) MERGED into the next deploy session's Phase-4 since the Shadow DOM mount is structural-only with no cross-platform variance expected; Session 3 (DEPLOY) MERGED into the next bundled W5 + P-47 deploy session per (a.87). DEPLOY-PENDING. Phase-4 director real-Chrome verification on Amazon pending — bundles into the next deploy session's Phase-4 step (covers BOTH W5 URL-form additions + P-47 Shadow DOM mount since both ship via the same extension form surface).

**Why this entry lives in `docs/COMPETITION_SCRAPING_DESIGN.md` §B rather than `docs/COMPETITION_DATA_V2_DESIGN.md` §B:** P-47 is a structural refactor of the **extension content-script architecture** introduced post-W#2-graduation as a structural cleanup of P-45 Build #2's band-aid; it has no §A binding in `docs/COMPETITION_DATA_V2_DESIGN.md` (which captures the P-46 Phase 2 redesign of the vklf.com surface — Comprehensive Analysis page + Competition Data table redesign + Reviews capture + URL detail page restructure). P-47 belongs to the W#2 extension content-script subsystem captured in this design doc. Future P-47-related sessions should also land their §B entries here, not in the V2 design doc.

**What landed this session — empirical narrative:**

The content-script video-capture form (`extensions/competition-scraping/src/lib/content-script/video-capture-form.ts`) now mounts inside an **open Shadow DOM root** attached to a fixed-positioned host `<div>` in `document.body`, rather than appending the backdrop directly into `document.body`. Events fired inside the shadow root do not surface to page-level handlers by default, so the per-input event-isolation band-aid (P-45 Build #2 2026-05-22-i, 20 events × 4 inputs = 80 listeners on each form open) is no longer needed and has been deleted.

**`styles.ts` changes:**

- New exported `FORM_CHROME_CSS` constant containing the `.plos-cs-form-*` + `.plos-cs-chip-*` rules previously inlined in `CONTENT_SCRIPT_CSS`.
- `CONTENT_SCRIPT_CSS` now interpolates `${FORM_CHROME_CSS}`, so the other forms (image / text / url-add) that still mount to `document.body` continue to receive these rules via the host-page `<head>` stylesheet without drift between the two consumption sites.

**`video-capture-form.ts` changes:**

- Import `FORM_CHROME_CSS` from `./styles.ts`.
- Create host `<div>` with `position:fixed inset:0 z-index:999998` + `attachShadow({mode:'open'})`; inject `<style>FORM_CHROME_CSS</style>` inside the shadow root.
- Append backdrop inside the shadow root; append host to `document.body`.
- `destroy()` removes the host (parent of the shadow root) instead of the backdrop.
- `focusNewCategoryInput()` reads `shadow.activeElement` instead of `document.activeElement`, since `document.activeElement` returns the host element for any descendant focused inside the shadow.
- Delete `applyAggressiveEventIsolation` function (62 LOC including the 20-event-array `stopPropagation` loop + the click-handler force-focus with `queueMicrotask` retry) + its 4 call sites + its 20-line context comment.
- Escape-to-close `keydown` listener stays on `document` — keydown events from inside the shadow root compose up through the host into the document tree, so the listener catches them in both cases.

All 5 scoreboard checks GREEN at unchanged baselines (root tsc clean / ext tsc clean / 558 ext UNCHANGED / 786 src/lib UNCHANGED / 62 routes UNCHANGED). Check 6 Playwright SKIPPED per non-deploy-session convention. No new tests — the refactor is structural-only with no new units of behaviour to cover at the node:test layer (form-mount lifecycle isn't unit-tested today; coverage will land if/when this proves useful as a regression bell).

**NEW reusable Pattern memorialized — "Shadow DOM mount as structural replacement for per-listener event-isolation band-aid":**

When a per-listener band-aid (N events × M elements = N×M listeners on each component open) successfully isolates a component from page-level interference, the structural replacement is a Shadow DOM mount providing the same isolation at the boundary level with zero per-listener overhead.

Today's instance: P-45 Build #2 (2026-05-22-i) shipped an aggressive event-isolation band-aid (20 events × 4 inputs = 80 listeners on each video-capture-form open) to solve the page-level focus-stealing problem on Amazon. The band-aid worked empirically — verified on Amazon during P-45's Phase-4 verification — but carried hidden risk for any future video-form feature that needed to PROPAGATE events upward, and the per-listener overhead grew linearly with form-control count. P-47 Session 1 today replaced the band-aid with a Shadow DOM mount: events fired inside the shadow root do not surface to page-level handlers by default, so the isolation is at the boundary rather than per-listener.

**Pairs with P-45 Build #2 §Entry 2026-05-22-i Pattern B** (the band-aid memorialized) as the long-term-fix pairing. The band-aid + Shadow DOM mount form a complete pattern lifecycle:
- **Pattern B from P-45 Build #2 §Entry 2026-05-22-i** memorialized the band-aid: "aggressive page-event-isolation via per-listener stopPropagation across the full input event surface — viable as a localized late-stage fix when a structural refactor would balloon scope and the band-aid stays bounded to a small component surface".
- **Today's Pattern memorialized in this §B entry** memorializes the structural replacement: "when a per-listener band-aid successfully isolates a component from page-level interference, the structural replacement is a Shadow DOM mount providing the same isolation at the boundary level with zero per-listener overhead".

Together these two Patterns calibrate the band-aid → structural-fix arc: ship the band-aid first to unblock the immediate ship; capture the structural replacement as a polish-backlog entry; ship the structural replacement in a later session when scope permits. P-45 Build #2 → P-47 Session 1 is the canonical exemplar.

**Why this Pattern matters:** Many UI-isolation problems present first as "events from the host page interfere with the component"; the band-aid (per-listener stopPropagation across the full event surface of the component's input elements) solves the immediate problem but doesn't generalize — every new input or event type added later must be added to the band-aid arrays manually, and the overhead grows linearly. Shadow DOM mount provides the same isolation at the boundary level — events composed inside the shadow root don't surface to the page unless explicitly bubbled through with `composed: true`. The structural replacement is cheaper at runtime AND less brittle at code-level.

**LOW informational sub-observation — "CSS extraction into shared exported constant + template-literal interpolation back into composite constant":**

When refactoring `styles.ts` to inject CSS rules inside the Shadow DOM root (which doesn't inherit page styles), the natural approach was to duplicate the `.plos-cs-form-*` rules inline inside `video-capture-form.ts`. That would have introduced drift risk: any future change to a form-chrome CSS rule would have to be made in two places (the page-level stylesheet for the image / text / url-add forms that still mount to `document.body`, and the inline copy inside `video-capture-form.ts` for the shadow root).

The most-thorough/reliable approach per `feedback_recommendation_style.md`: extract the form-chrome rules to a new exported `FORM_CHROME_CSS` constant; re-interpolate that constant back into `CONTENT_SCRIPT_CSS` via `${FORM_CHROME_CSS}` so the global stylesheet consumers continue to receive these rules via the host-page `<head>` stylesheet; import `FORM_CHROME_CSS` into `video-capture-form.ts` and inject it via a `<style>` tag inside the shadow root.

The Pattern: **single source of truth via template-literal interpolation back into composite constant** — both consumption sites (global stylesheet + Shadow DOM root) consume the same exported `FORM_CHROME_CSS` constant; any future change to a form-chrome CSS rule lands in one place and propagates to both sites without drift.

**Why this is informational not a full Pattern:** the technique is a standard refactor pattern (extract-shared-constant + interpolate-back) rather than a novel insight; captured as a sub-observation under the main P-47 entry rather than a standalone reusable Pattern.

**Verification scoreboard:**

- Pre-build /scoreboard: 5/5 GREEN at baselines — root tsc clean / extension tsc clean / 558 ext UNCHANGED / 786 src/lib UNCHANGED / 62 routes UNCHANGED. Check 6 Playwright SKIPPED per Rule 27 (non-deploy-session convention).
- Post-refactor /scoreboard after build commit `d08f673`: 5/5 GREEN at unchanged baselines — root tsc / ext tsc / 558 / 786 / 62 — no new tests (structural-only refactor; existing tests cover the form's input handling + save logic which is unchanged).
- End-of-session baselines: root tsc clean / ext tsc clean / 558 ext / 786 src/lib / 62 routes (all UNCHANGED from session-start; the refactor is structural-only).

**Affected §A sections (informational — §A frozen per Rule 18):**

- §A is unchanged. The video-capture-form is part of the extension content-script architecture added post-W#2-graduation (the captured-videos feature originated as P-27 designed 2026-05-20-b in `docs/CAPTURED_VIDEOS_DESIGN.md`); the form's mount strategy is an implementation detail not captured in §A's pre-graduation design surface.
- The §B narrative log for extension content-script architecture changes lives in this doc (e.g., the original 2026-05-19-g P-23 saved-URL-dropdown entries + this 2026-05-24-d P-47 entry). Future content-script architecture changes append here per the canonical Group B pattern.

**Impact on §A: None; §A stays frozen per Rule 18.**

**Director triple-defer informational calibration data point continuation:**

Director has now deferred W4 Phase-4 director real-Chrome verification a THIRD consecutive session (originally deferred 2026-05-26 W4 deploy session + re-deferred 2026-05-24-c + re-deferred 2026-05-24-d today). The standing carry-overs pattern memorialized in CORRECTIONS_LOG §Entry 2026-05-24-c continues to apply — the 10-step W4 Phase-4 walkthrough preserved verbatim in NEXT_SESSION.md ## Standing carry-overs section must carry forward AGAIN. No process change needed; just disciplined verbatim preservation across consecutive deferrals.

**Calibration insight:** when director defers Phase-4 verification across multiple consecutive sessions AND the unshipped-to-main queue accumulates (today: 3 build commits unshipped — W5 build + Reviews polish + P-47 Shadow DOM), the natural resolution is a **bundled deploy session** that ships everything in the queue under ONE Rule 9 gate + ONE Phase-4 verification step. That's the picker outcome A from today's end-of-session picker: bundled W5 + P-47 deploy ff-merges 3 build commits + the interleaved doc-batch commits + Vercel auto-redeploy + fresh extension zip + Phase-4 covers BOTH W5 URL-form additions AND Shadow DOM mount since both ship via the same extension form surface.

**Cross-references:**

- CORRECTIONS_LOG §Entry 2026-05-24-d (today's W5 + P-47 closing entry — captures the same content from a corrections-log/procedural perspective; this design doc §B captures it from a design/implementation perspective + the long-term-fix pairing arc with P-45 Build #2's band-aid memorialization).
- CORRECTIONS_LOG §Entry 2026-05-22-i (P-45 Build #2 — established Pattern B "aggressive page-event-isolation via per-listener stopPropagation" — the band-aid this refactor replaces).
- CORRECTIONS_LOG §Entry 2026-05-24-c (yesterday's W5 build session — established the director double-defer informational calibration data point; today's session continues the pattern with a triple-defer of W4 Phase-4 verify).
- `docs/ROADMAP.md` P-47 polish-backlog entry (annotated this session — Status flipped to ✅ DONE-AT-CODE-LEVEL 2026-05-24-d on workflow-2-competition-scraping via `d08f673` — DEPLOY-PENDING bundled into next session's W5 + P-47 deploy; (a.86) closed + (a.87) opens for bundled W5 + P-47 deploy session).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-19-g (P-23 saved-URL-dropdown side-by-side ship session — sibling extension content-script architecture entry).
- `docs/CAPTURED_VIDEOS_DESIGN.md` (the sibling design doc for P-27 + P-45 captured-videos feature where the band-aid this refactor replaces was originally shipped).
- `docs/NEXT_SESSION.md` (today's complete rewrite for bundled W5 + P-47 deploy session + ## Standing carry-overs section preserving W4 Phase-4 10-step verification walkthrough verbatim — third consecutive verbatim preservation).
- `feedback_recommendation_style.md` (most-thorough/reliable — today's end-of-session picker resolved to Recommended option A "Bundled W5 + P-47 deploy"; today's NEW Pattern "Shadow DOM mount as structural replacement" recommends the structural fix over continuing with band-aids per most-thorough/reliable).
- `feedback_default_to_recommendation.md` (today's session-start director directive resolved per this feedback memory without a re-confirmation picker — launch-prompt task was already the recommended default).

**Closing line:** P-47 Shadow DOM refactor Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-24-d. Content-script video-capture-form mount strategy refactored from `document.body` + 80-event-listener band-aid to open Shadow DOM root with `FORM_CHROME_CSS` injected inside the shadow + band-aid deletion. Next session: bundled W5 + P-47 deploy session per (a.87). Standing carry-over: W4 Phase-4 verify (preserved verbatim in NEXT_SESSION.md ## Standing carry-overs section — third consecutive verbatim preservation).

---

## §B 2026-05-24-e — `session_2026-05-24-e_bundled-w5-p47-deploy` — P-47 Shadow DOM mount DEPLOYED to vklf.com via bundled W5 + P-47 deploy session shipping 3 build commits + 2 doc-batch commits behind ONE Rule 9 gate; pairs with §B 2026-05-24-d as the build session entry + today's §B as the deploy entry pairing — Phase-4 director real-Chrome verification on Amazon DEFERRED to next session per W4 deploy 2026-05-26 Pattern with 2-step P-47 walkthrough preserved verbatim in NEXT_SESSION.md ## Standing carry-overs section (c)

**Session shape:** Pure orchestration DEPLOY session on `workflow-2-competition-scraping` → `main`. ZERO new code. ZERO new schema. ZERO new dependencies. ZERO new routes. ONE Rule 9 gate fired (deploy push). TWO §4 Step 1c forced-pickers fired (Rule 9 deploy gate + Phase-4 in-session vs deferred). THREE pushes planned per `feedback_approval_scope_per_decision_unit.md`. ONE P-47-specific DEFERRED item carries forward as a standing carry-over.

**Outcome at deploy level for P-47:** The Shadow DOM mount that landed at code level via build commit `d08f673` 2026-05-24-d (Session 1 — see §B 2026-05-24-d above) shipped to production today via `workflow-2-competition-scraping` → `main` bundled ff-merge `9205340..d68885a` carrying 5 commits (W5 build `3c981be` + Reviews polish `41172f1` + W5 doc-batch `4d0f771` + P-47 build `d08f673` + P-47 doc-batch `d68885a`) behind ONE Rule 9 gate; Vercel auto-redeploy fired; fresh extension zip `plos-extension-2026-05-24-w2-deploy-34.zip` 202.98 KB dropped at repo root via `npm run zip` in `extensions/competition-scraping/` (ready for director sideload at Phase-4 verification next session).

The content-script video-capture form is now live on vklf.com end-to-end mounting inside an open Shadow DOM root attached to a fixed-positioned host `<div>` in `document.body` — structurally preventing page-level event interference WITHOUT the 80-event-listener band-aid that shipped in P-45 Build #2 2026-05-22-i. The band-aid (62 LOC: `applyAggressiveEventIsolation` function + its 4 call sites + its 20-line context comment) is deleted from production code. `FORM_CHROME_CSS` is extracted to a shared exported constant in `styles.ts` + interpolated back into `CONTENT_SCRIPT_CSS` for the other forms (image / text / url-add) that still mount to `document.body` + injected inside the shadow root via a `<style>` tag for the video-capture form — single source of truth for both consumption sites.

**Pre-deploy /scoreboard on `workflow-2-competition-scraping`:** 5/5 GREEN at unchanged baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 786 src/lib UNCHANGED / 62 routes UNCHANGED); Check 6 Playwright SKIPPED per Rule 27 non-deploy-spec convention (P-47 build commit `d08f673` introduced no extension Playwright spec coverage — the refactor is structural-only with no new behavioural units to cover; form-mount lifecycle isn't unit-tested today per §B 2026-05-24-d note).

**Post-merge /scoreboard on `main`:** 5/5 GREEN at exact same baselines.

**Phase-4 director real-Chrome verification on Amazon DEFERRED to next session at director directive *"defer to next session (per W4 deploy 2026-05-26 Pattern)"*** — 2-step P-47 verification walkthrough preserved verbatim in next NEXT_SESSION.md ## Standing carry-overs section (c) so the next session can copy + execute without re-deriving. Pairs with W5 4-step walkthrough in section (b) into ONE Phase-4 step at next session since both ship via the same extension form surface (director walks both verifications on the same Amazon product page in one sitting).

**Why Amazon specifically:** the original Issue 2 focus-stealing problem that motivated the P-45 Build #2 2026-05-22-i band-aid was Amazon-specific. If Amazon works cleanly with the band-aid removed + Shadow DOM in place, that's the strongest signal the Shadow DOM mount preserved the band-aid's behaviour structurally. Walkthrough step (c.2) explicitly calls out the Amazon-specific verification per the original Issue 2 platform.

### Cross-references

- **`docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-24-d** — the P-47 Session 1 BUILD entry (the structural refactor mechanics: Shadow DOM mount + CSS extraction + band-aid deletion + 5/5 GREEN at unchanged baselines + NEW Pattern "Shadow DOM mount as structural replacement for per-listener event-isolation band-aid"). Today's §B 2026-05-24-e is the parallel DEPLOY entry pairing — build session entry + deploy session entry together document the complete P-47 Session 1 lifecycle from code-level land to production deploy. The PHASE-4 verification entry will be a future §B at next session (or §B addendum to today's entry if verification PASSES with no fix-forwards needed).
- **`docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-24-e** — the parallel deploy entry in the W#2 design doc (captures the bundled deploy outcome from the W#2 Competition Data design perspective; also memorializes the NEW reusable Pattern "Bundled-build-commit deploy under ONE Rule 9 gate" as the first cross-workstream bundled deploy in W#2 history; today's bundled deploy spans BOTH design docs since it ships cross-doc-scoped commits — P-46 W5 + P-46 Reviews polish are W#2 Competition Data design scope; P-47 Shadow DOM is W#2 content-script architecture scope).
- **`docs/CORRECTIONS_LOG.md` §Entry 2026-05-24-e** — the session's closing §Entry capturing bundled-deploy outcome + NEW Pattern "Bundled-build-commit deploy under ONE Rule 9 gate" + LOW informational dual P-43 cwd-leak reproductions + calibration data point.
- **`docs/ROADMAP.md` P-47 polish-backlog entry** (annotated this session — status flipped to ✅ DEPLOYED-PHASE-4-PENDING 2026-05-24-e on vklf.com via bundled ff-merge; original capture preserved for traceability).
- **`docs/NEXT_SESSION.md`** (today's complete rewrite for the bundled Phase-4 real-Chrome verification session + ## Standing carry-overs section (c) preserving the P-47 2-step verification walkthrough verbatim).
- **P-45 Build #2 §Entry 2026-05-22-i** in `docs/CORRECTIONS_LOG.md` — the band-aid memorialization Pattern B (the per-listener event-isolation band-aid that today's deploy DELETES from production code in favor of the structural Shadow DOM mount). Build entry §B 2026-05-24-d + deploy entry §B 2026-05-24-e + P-45 Build #2 §Entry 2026-05-22-i Pattern B form the complete pattern lifecycle: ship the band-aid first to unblock the immediate ship (P-45 Build #2 2026-05-22-i); capture the structural replacement as a polish-backlog entry (P-47 NEW 2026-05-22-i); ship the structural replacement in a later session at code level (P-47 Session 1 2026-05-24-d via §B 2026-05-24-d); deploy the structural replacement to production removing the band-aid (today via §B 2026-05-24-e). P-45 Build #2 → P-47 Session 1 build → P-47 Session 1 deploy is the canonical exemplar of the band-aid → structural-fix lifecycle in W#2 history.

**Closing line:** P-47 Shadow DOM mount ✅ DEPLOYED-PHASE-4-PENDING 2026-05-24-e on vklf.com via bundled W5 + P-47 deploy session (ff-merge `9205340..d68885a` carrying 5 commits behind ONE Rule 9 gate). The band-aid is deleted from production code in favor of the structural Shadow DOM mount. Next session: bundled Phase-4 real-Chrome verification session per (a.88) covering W4 10-step + W5 4-step + P-47 2-step walkthroughs (all preserved verbatim in NEXT_SESSION.md ## Standing carry-overs section); if all PASS, P-47 closes ✅ DONE-AND-VERIFIED end-to-end.

---

## §B 2026-05-24-f — `session_2026-05-24-f_p46-w4-phase4-fix-forward-1-then-w5-p47-phase4-pass-plus-p48-capture` — P-47 Shadow DOM mount Phase-4 PASS first-walk on Amazon closes the band-aid → structural-fix lifecycle end-to-end on vklf.com; P-47 ✅ DONE-AND-VERIFIED 2026-05-24-f; NEW P-48 cross-reference (different feature — P-45 screen recording playback — but lives in the same docs)

**§A frozen** per Rule 18. This entry is informational + lifecycle-completion. **P-47 implementation arc COMPLETE end-to-end ✅ DONE-AND-VERIFIED 2026-05-24-f on vklf.com**: P-45 Build #2 §Entry 2026-05-22-i Pattern B band-aid memorialization (the per-listener event-isolation band-aid that needed structural replacement) → P-47 Session 1 build §B 2026-05-24-d (Shadow DOM mount + CSS migration + band-aid deletion at code level) → P-47 Session 1 deploy §B 2026-05-24-e (bundled W5 + P-47 deploy under ONE Rule 9 gate) → P-47 Phase-4 PASS today (this entry). **Sessions 2-3 from the original P-47 estimate MERGED into today's bundled deploy outcome** — the original estimate budgeted Session 2 for cross-platform verification + Session 3 for deploy; the structural-only refactor with no behavioural changes meant no cross-platform variance was expected, so Sessions 2-3 collapsed into the bundled deploy + Phase-4 PASS path.

**P-47 Phase-4 verification mechanics.** Director walked 2 steps on Amazon (the original Issue 2 platform from P-45 Build #2 where the band-aid was originally needed) per the verification walkthrough preserved verbatim in 2026-05-24-e NEXT_SESSION.md ## Standing carry-overs section (c):

**Step 1 — Open the extension URL save form on a competitor page + confirm the form opens cleanly.** PASS — form opens cleanly + the form chrome (backdrop overlay + form border + buttons) looks identical to before the refactor (the CSS extraction into `FORM_CHROME_CSS` shared exported constant + template-literal interpolation back into composite `CONTENT_SCRIPT_CSS` constant means single source of truth for both global stylesheet consumers + Shadow DOM root consumer — zero visual drift).

**Step 2 — Confirm form interaction works cleanly with the Shadow DOM mount + no page-level focus interference.** PASS — text inputs + textareas accept focus cleanly + retain focus while typing + clicking outside-and-back works cleanly + Amazon's page-level handlers do NOT steal focus from the form (the original Issue 2 symptom that drove the band-aid is structurally prevented by the Shadow DOM boundary); Escape closes the form cleanly (the Escape-to-close `keydown` listener stays on `document` and keydown events from inside the shadow root compose up through the host into the document tree as designed).

**Zero fix-forwards needed for P-47.** This is the cleanest possible Phase-4 verification outcome — the structural refactor preserved the band-aid's behaviour without per-listener overhead (62 LOC `applyAggressiveEventIsolation` function + 4 call sites + 20-line context comment all deleted; structural Shadow DOM boundary replaces 80 event listeners per form open).

**Pairs with the §B 2026-05-22-i Pattern B band-aid memorialization (in P-45 Build #2 closing entry — CORRECTIONS_LOG §Entry 2026-05-22-i) as the LONG-TERM-FIX PAIRING completion.** The band-aid → structural-fix lifecycle now verified end-to-end in production:
- **Build §B 2026-05-22-i** (P-45 Build #2) — ship the band-aid first to unblock the immediate ship + capture the structural replacement as a polish-backlog entry (P-47 NEW 2026-05-22-i).
- **Build §B 2026-05-24-d** (P-47 Session 1) — ship the structural replacement at code level (Shadow DOM mount + CSS migration + band-aid deletion).
- **Deploy §B 2026-05-24-e** (P-47 deploy via bundled W5 + P-47 deploy) — deploy the structural replacement to production removing the band-aid from production code.
- **Phase-4 PASS §B 2026-05-24-f** (today) — verify the structural replacement preserves the band-aid's behaviour on the original Issue 2 platform (Amazon) in real Chrome with director Yes verdict.

P-45 Build #2 → P-47 Session 1 build → P-47 Session 1 deploy → P-47 Session 1 Phase-4 PASS is the canonical exemplar of the **complete band-aid → structural-fix lifecycle end-to-end in W#2 history** — first such lifecycle to close in W#2.

**NEW P-48 cross-reference (different feature — P-45 screen recording playback — but lives in the same docs).** During today's verification session, director observed: *"The video saved is very laggy when played back on vklf.com."* Follow-up clarifying picker disambiguated symptom (stutters / frame drops during playback, specifically affecting P-45 screen-recording captures — not P-23 drag-and-drop captures). Per Rule 24 search across all docs (ROADMAP P-NN entries; CORRECTIONS_LOG §Entry table; design docs §A + §B; COMPETITION_SCRAPING_VERIFICATION_BACKLOG): no prior treatment found. Captured as NEW P-48 polish item in ROADMAP polish backlog with diagnostic + implementation scope (~1-2 sessions estimated). P-48 sketch: capture-side likely root cause (`MediaRecorder` constructed with no `videoBitsPerSecond` cap → browser default 6-8 Mbps+ at 1080p → files exceed real-time decode budget); Session 1 Diagnostic = `ffprobe` inspection + Chrome DevTools Network panel observation; Session 2 Implementation = capture-side bitrate cap at 2.5 Mbps + frame-rate cap at 30fps + dimension cap at 1080p in `extensions/competition-scraping/src/lib/content-script/screen-recorder.ts` (~30 LOC). P-48 lives in the content-script feature surface (same general area as P-47 + P-45) so the design entries when P-48 ships will live here in COMPETITION_SCRAPING_DESIGN.md (capture-side concerns) AND/OR COMPETITION_DATA_V2_DESIGN.md (delivery + display concerns). Cross-reference established now so the diagnostic session can pick the right doc(s) for the implementation §B entry.

**Pre-deploy /scoreboard 5/5 GREEN at unchanged baselines** (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 786 src/lib UNCHANGED / 62 routes UNCHANGED); Check 6 Playwright SKIPPED per Rule 27 — no Playwright spec coverage for content-script form mount lifecycle (no behavioural changes to unit-test). Post-merge /scoreboard partial (root tsc clean / extension tsc clean / src/lib 786/786 GREEN); Check 5 + Check 3 trusted at unchanged baselines since merged commit byte-identical to pre-deploy via clean ff-merge (no rebase, no squash).

**Schema-change-in-flight flag STAYS NO** entire session — UI-only W4 fix-forward; P-47 itself is content-script mount refactor with no schema, no API, no shared-types.

**Impact on §A:** None. §A's content-script architecture coverage + P-27 captured-videos design + P-23 saved-URL dropdown all consumed without amendment; today's P-47 Phase-4 PASS is the verification of the structural refactor that was already captured in §B 2026-05-24-d at code level. §A stays frozen per Rule 18.

**Cross-references:**
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-24-d (P-47 Session 1 build session — the structural Shadow DOM mount + band-aid deletion that today's Phase-4 verifies in production).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-24-e (P-47 Session 1 deploy — the bundled W5 + P-47 deploy that landed the structural replacement on vklf.com awaiting today's Phase-4 verification).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-24-f — paired entry capturing the W4 + W5 Phase-4 PASS lifecycle outcome (different design doc per the 2026-05-24-d precedent; W#2 design layer concerns there + content-script architecture concerns here).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-22-i (P-45 Build #2 closing entry — Pattern B band-aid memorialization that today's P-47 Phase-4 PASS verifies as structurally replaced in production).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-24-f (today's bundled Phase-4 verification + fix-forward #1 + Phase-4 PASS closing entry — 6 sub-observations including NEW P-48 capture).
- `docs/ROADMAP.md` P-47 polish-backlog entry (annotated today — status flipped to ✅ DONE-AND-VERIFIED 2026-05-24-f end-to-end; the band-aid → structural-fix lifecycle now closes end-to-end on vklf.com).
- `docs/ROADMAP.md` P-46 polish-backlog entry (annotated today — entire 5-workstream polish arc closes ✅ DONE-AND-VERIFIED end-to-end 2026-05-24-f).
- `docs/ROADMAP.md` NEW P-48 polish-backlog entry (captured today per Rule 24 search; diagnostic + implementation scope; LOW–MEDIUM severity; 1-2 sessions estimated).
- `docs/NEXT_SESSION.md` (today's complete rewrite for P-48 Session 1 (Diagnostic) + ZERO standing carry-overs since all 3 Phase-4 verifications closed today).

**Closing line:** P-47 Shadow DOM mount Phase-4 PASS first-walk on Amazon closes the band-aid → structural-fix lifecycle end-to-end on vklf.com ✅ DONE-AND-VERIFIED 2026-05-24-f. First complete band-aid → structural-fix lifecycle in W#2 history. NEW P-48 polish item captured for future session (video playback stutters on vklf.com; P-45 screen-recording-specific; LOW–MEDIUM severity; ~1-2 sessions diagnostic + implementation). Next session: P-48 Session 1 (Diagnostic) per (a.89).

---

## §B 2026-05-25 — `session_2026-05-25_p48-session-1-diagnostic` — P-48 screen-recording playback stutter root cause identified via `ffprobe` + EBML inspection — missing WebM duration metadata (canonical MediaRecorder limitation); pre-Session-1 capture-side-bitrate hypothesis empirically falsified; Session 2 fix path locked = `fix-webm-duration` library injection in `record-controller.ts` post-stop

**§A frozen** per Rule 18. This entry is informational + diagnostic-completion. **P-48 Session 1 (Diagnostic) ✅ DONE 2026-05-25 on `workflow-2-competition-scraping`** — pure diagnostic session executing the (a.89) RECOMMENDED-NEXT protocol drafted at end of 2026-05-24-f. ZERO code lands this session; one push planned at end-of-session (doc-batch) + one ping-pong ff-merge push.

**Diagnostic findings.** Empirical inspection across 3 SCREEN_RECORDING webm files in the production DB + their Supabase Storage delivery layer:

- **Capture-side bitrate cap ALREADY SHIPPED.** Read `extensions/competition-scraping/src/lib/screen-recording/record-controller.ts:42` — `export const VIDEO_BITS_PER_SECOND_DEFAULT = 2_500_000;`. Read line 455-458 — the MediaRecorder constructor already passes this cap. The pre-Session-1 hypothesis ("uncapped MediaRecorder bitrate, default 6-8 Mbps+ at 1080p") was busted at the source-code read step.
- **Actual file bitrates well below the cap.** `ffprobe` on the 3 SCREEN_RECORDING webm files in production: 0.50 Mbps / 1.35 Mbps / 0.67 Mbps. All three well below the 2.5 Mbps cap; capture-side bitrate is NOT the root cause.
- **Supabase Storage delivery clean.** `curl -I --range 0-1000000` against signed URLs returned 206 Partial Content with `accept-ranges: bytes`. Cloudflare edge cache HIT on second request (200 from cache). Throughput Codespace → Cloudflare → file measured ~124 Mbps. Delivery-side is NOT the root cause.
- **Root cause = missing WebM duration metadata.** Every file shows `Duration: N/A` in the `ffprobe` format header. Deep-probe with `ffprobe -show_format -of json` confirms `format.duration: NOPTS`. This is the canonical MediaRecorder limitation — the EBML header is written at recording-START before duration is known, and the browser never patches it after `stop()`. The HTML5 video player on vklf.com therefore sees `videoElement.duration === Infinity` on load, which breaks its pre-buffer-planning math, causing reactive chunk-fetching that surfaces as visible stutter.

**File path drift correction.** The pre-Session-1 P-48 ROADMAP entry referenced `extensions/competition-scraping/src/lib/content-script/screen-recorder.ts`. The actual file is `extensions/competition-scraping/src/lib/screen-recording/record-controller.ts`. The drift was caused by Claude's pre-Session-1 description being based on the conceptual "where MediaRecorder lives" (content-script-adjacent) rather than a verified file-read. Today's diagnosis corrected the path in the ROADMAP entry; the design-doc layer (here) is the authoritative cross-reference for capture-side mechanics going forward.

**Locked Session 2 fix path.** Add `fix-webm-duration` npm package as runtime dep in `extensions/competition-scraping/package.json` (tiny ~3 KB library — https://github.com/yusitnikov/fix-webm-duration is the canonical implementation; no transitive deps; MIT licensed). In `record-controller.ts`, after the recorder fires `stop` but before `onStopped` emits, `await fixWebmDuration(blob, durationMs)` to inject the JS-known duration into the EBML Segment Info Duration tag, then emit the patched Blob. Approximately 10 LOC in `record-controller.ts` + a few new unit-test cases in `record-controller.test.ts` confirming the patch is applied (mock MediaRecorder + verify patched blob's first ~256 bytes contain the Segment Info Duration tag). Schema-change-in-flight: NO. Director real-Chrome verification post-deploy: record 1-2 NEW screen recordings via the extension on Amazon (or any platform) → load on vklf.com → confirm seek bar shows a real total duration (not "∞" or "Live" or "-:--") AND playback is smooth. NOTE: only NEW recordings benefit; the 3 existing webm files in the DB keep their broken metadata.

**Busted-hypothesis lesson.** The pre-Session-1 hypothesis was plausible-sounding (default MediaRecorder bitrate IS uncapped + IS often 6-8 Mbps+ at 1080p screen content + DOES often cause decode-budget issues). But it was a guess, not an empirical finding. Session 1's `ffprobe`-first diagnostic ruled it out in the first ~10 minutes of probing the actual production artifacts. **Calibration:** ALWAYS run the cheapest available probe against actual production artifacts before drafting Session 2 implementation scope. This is the most-reliable diagnostic per `feedback_recommendation_style.md` most-thorough/reliable principle.

**NEW reusable Pattern memorialized.** **"ffprobe-first diagnostic reveals hypothesis-bust before any code lands — empirical inspection of artifacts in their actual production state preempts speculative implementation."** Triggers when a polish item or bug-fix item has a working hypothesis based on plausible reasoning but no empirical inspection of the actual production artifact. Apply ALWAYS, BEFORE drafting Session-2-style implementation scope. Steps: (1) read source code where artifact is produced — verify implementation matches the hypothesis's assumption; (2) query production store for ALL artifacts in the relevant category (cover full enum value set; use `groupBy by <enum-field>` to surface coverage upfront); (3) run cheapest probe against each artifact + tabulate findings; (4) cross-check delivery layer if artifact is consumed via network; (5) lock root cause empirically + re-scope Session 2 to match. See CORRECTIONS_LOG §Entry 2026-05-25 sub-observation (b) for full Pattern shape + cross-references.

**MEDIUM informational sub-observation captured separately.** During Session 1 step 2, an enum-coverage query bug caused a brief false-alarm where Claude reported "no SCREEN_RECORDING rows in DB" because the initial filter `sourceType: 'DIRECT_BYTES'` excluded the very category being investigated. Director caught it in one round-trip; re-query found 3 rows. Mechanical prevention candidate captured in CORRECTIONS_LOG §Entry 2026-05-25 sub-observation (c) — when querying tables with multi-value discriminator enums, query ALL values OR `groupBy by <enum-field>` to surface coverage upfront before drilling into a subset. Not a top-tier slip (recovery was immediate + director-caught), but worth memorializing as a mechanical prevention candidate for future diagnostic sessions.

**Diagnostic-script housekeeping.** 6 throwaway diagnostic scripts created in `scripts/` during Session 1 (`p48-list-recent-videos.mjs` + `p48-find-screen-recs.mjs` + `p48-find-screen-recs-v2.mjs` + `p48-get-signed-url.mjs` + `p48-dl-webm.mjs` + `p48-sign-webm.mjs`) all DELETED at session end. Rationale: one-shot operational tools; reference credentials + Supabase project IDs that would create maintenance overhead if kept; DB queries + ffprobe invocations + curl HEAD/Range syntax documented in CORRECTIONS_LOG §Entry 2026-05-25 sub-observation (e) for trivial recreation if a future session wants to re-run.

**Director mid-session directive on Network panel walkthrough.** Director's mid-session message *"i can't do any testing right now so add that to the next session and wrap up no"* deferred the 15-step Chrome DevTools Network Panel walkthrough that Claude had drafted. The walkthrough was preserved VERBATIM in `docs/NEXT_SESSION.md` `## Pre-session notes (offline steps for director between sessions)` section so director can run it on their Mac between sessions if they choose. NOT preserved in `## Standing carry-overs` because it's a director-side action, not a Claude-defer carry-over. If director runs the walkthrough before Session 2, the findings would either further confirm the missing-duration root cause (single most important observation: whether the seek bar shows a real total duration or "∞" / "Live" / "-:--") or surface an additional contributor; either way Session 2's fix path is locked enough to proceed without the walkthrough's findings.

**Schema-change-in-flight flag STAYS NO** entire session — pure diagnostic; no code; no schema; no API; no shared-types.

**Pre-build + post-diagnostic /scoreboard NOT run** — no code change to verify. Baselines unchanged from prior session (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 786 src/lib UNCHANGED / 62 routes UNCHANGED); Check 6 Playwright SKIPPED per Rule 27 non-build-session convention.

**Impact on §A:** None. §A's content-script + extension architecture coverage all stays as-is; today's P-48 diagnostic is about capture-side mechanics inside the existing screen-recording flow, not a new feature. §A stays frozen per Rule 18.

**Cross-references:**
- `docs/COMPETITION_SCRAPING_DESIGN.md` previous §B entries — P-23 saved-URL dropdown entries from 2026-05-19-g (established precedent for extension content-script architecture changes living in this doc) + P-47 entries 2026-05-24-d / 2026-05-24-e / 2026-05-24-f (the most recent Shadow DOM mount lifecycle that closed end-to-end immediately prior to today).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-25 — today's Session 1 Diagnostic closing entry with 5 sub-observations including the NEW reusable Pattern memorialization + enum-coverage query-bug informational + diagnostic-script housekeeping note.
- `docs/ROADMAP.md` P-48 polish-backlog entry — contents replaced this session (status flipped to ✅ DIAGNOSED 2026-05-25 (Session 1 of 2); WHERE corrected; WHY rewritten with empirical findings; Fix scope rewritten with Session 2 fix path locked; original capture preserved for traceability).
- `docs/NEXT_SESSION.md` — fully rewritten for P-48 Session 2 (Implementation) on `workflow-2-competition-scraping`; 15-step Chrome DevTools Network Panel walkthrough preserved VERBATIM in ## Pre-session notes section for director-side execution between sessions.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-24-f sub-observation (d) — the NEW P-48 capture from 2026-05-24-f that Session 1 today empirically refined; the pre-Session-1 hypothesis-and-scope draft that turned out to be busted at the implementation-scope level (cap already shipped) but correct at the priority level (P-48 IS a real director-observed issue worth fixing).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-22-i — P-45 Build #2 closing entry; P-45 ships the screen-recording capture path that produces the webm files this polish item improves; the missing-duration limitation has been latent in every P-45 capture since the feature shipped.
- `feedback_recommendation_style.md` (most-thorough/reliable — today's ffprobe-first diagnostic embodies this principle; speculative implementation would have shipped the wrong fix).
- `feedback_approval_scope_per_decision_unit.md` (2-push diagnostic-session pattern — doc-batch push + doc-batch ff-merge push; today follows this exactly).

**Closing line:** P-48 Session 1 (Diagnostic) ✅ DONE 2026-05-25 on `workflow-2-competition-scraping`. Root cause locked = missing WebM duration metadata in MediaRecorder-produced container headers (canonical MediaRecorder limitation; ffprobe + EBML deep-probe across 3 production SCREEN_RECORDING webm files; capture-side bitrate cap empirically ruled out; Supabase + Cloudflare delivery layer empirically ruled out). Session 2 fix path locked = `fix-webm-duration` npm dep + ~10 LOC in `record-controller.ts` post-stop / pre-`onStopped`. File path drift in pre-Session-1 entry corrected (`content-script/screen-recorder.ts` → `screen-recording/record-controller.ts`). NEW reusable Pattern "ffprobe-first diagnostic reveals hypothesis-bust before any code lands" memorialized for any future polish/bug-fix session with a plausible-but-untested working hypothesis. Next session: P-48 Session 2 (Implementation) per (a.90) — small build + deploy session estimated ~30-45 min in-Claude.

---

## §B 2026-05-25 — `session_2026-05-25_p48-session-2-implementation-and-ff1-busted` — P-48 Session 2 (Implementation + Fix-Forward #1 BUSTED) ✅ DEPLOYED-PARTIAL 2026-05-25 on vklf.com — `fix-webm-duration` patch shipped end-to-end + director-verified seek-bar fix; Phase-4 surfaced playback stutter PERSISTS even with duration metadata correct; empirical ffprobe revealed every SCREEN_RECORDING webm captured at ~6-7 fps actual rate (not 30 fps); speculative fix-forward #1 (DOM-attachment theory) empirically BUSTED; remaining stutter work deferred to P-48 Session 3 (Diagnostic #2); NEW reusable Pattern "Speculative fix-forward without empirical pre-verification = antipattern (reinforcement of Session 1's ffprobe-first Pattern at the fix-forward level)" memorialized

**§A frozen** per Rule 18. This entry is informational + implementation-completion + Phase-4 PARTIAL + FF-1 BUSTED lifecycle outcome. **P-48 Session 2 (Implementation + Fix-Forward #1 BUSTED) ✅ DEPLOYED-PARTIAL 2026-05-25 on vklf.com via `workflow-2-competition-scraping` → `main`** — BUILD + DEPLOY + FIX-FORWARD session executing the (a.90) RECOMMENDED-NEXT protocol drafted at end of Session 1. TWO build commits landed (`279da34` + `d8b9507`); TWO Rule 9 deploy gates fired (both director-Yes per `feedback_recommendation_style.md`); SIX pushes total per `feedback_approval_scope_per_decision_unit.md` (Deploy #1 + ping-pong #1 + Deploy #2 + ping-pong #2 all DONE; doc-batch push + ff-merge push PENDING).

**Implementation outcome — Session 2 build commit `279da34` (4 files +211/-9; ff-merge `a486af8..279da34` to main; Rule 9 gate #1):**

- **`extensions/competition-scraping/package.json` +1:** Adds `fix-webm-duration ^1.0.6` runtime dep (https://github.com/yusitnikov/fix-webm-duration — MIT licensed; ~3 KB published bundle; no transitive deps).
- **`package-lock.json` +36:** Lockfile entries for the new dep + its zero transitive sub-deps.
- **`extensions/competition-scraping/src/lib/screen-recording/record-controller.ts` +40/-9:** Imports `fixWebmDuration` from `fix-webm-duration`. Extends `RecordControllerDeps` interface with an optional `fixWebmDuration?: (blob: Blob, durationMs: number) => Promise<Blob>` field (DI-seam — preserves the existing test-injection pattern; allows test files to inject their own mock or omit it entirely). `createProductionDeps` factory now wires the real `fixWebmDuration` function into the production deps bundle. `emitStoppedOnce` becomes async; after the recorder fires `stop` and the final Blob is assembled but before `onStopped` emits, the function calls `await deps.fixWebmDuration(blob, durationMs)` to inject the JS-known duration into the EBML Segment Info Duration tag of the WebM container header. **Error-path:** wrapped in try/catch — if `fixWebmDuration` throws (corrupt EBML structure, unexpected file shape, etc.), the catch handler logs the error + emits the UNPATCHED original blob via `onStopped` so the recording is never lost.
- **`extensions/competition-scraping/src/lib/screen-recording/record-controller.test.ts` +143:** Adds 4 new node:test cases covering the DI-seam + happy-path + error-path + missing-dep-path: (1) "patched blob is emitted via onStopped when dep is wired" — verifies the patched blob (returned by mock fixWebmDuration) flows through emitStoppedOnce to onStopped instead of the original blob; (2) "dep is called with the assembled blob and duration in milliseconds" — verifies the dep call arguments match the EBML library's signature `(blob: Blob, durationMs: number)`; (3) "when dep throws, onStopped emits the unpatched blob (recording not lost)" — verifies the error-path falls through to the original unpatched blob; (4) "when dep is absent, onStopped emits the raw unpatched blob (pre-Session-2 behavior preserved)" — verifies extension is backwards-compatible if the dep is omitted from the deps bundle. Test count: 558 → **562** (+4 baseline locked).

**Director Phase-4 verification — Session 2 build deployed + director sideloaded the new extension zip `plos-extension-2026-05-25-w2-deploy-35.zip` (207.03 KB) + recorded a NEW screen recording post-deploy + loaded it on vklf.com:**

- **Seek bar verdict: ✅ PASS.** Recording now shows real total duration like "0:22" instead of "∞" / "Live" / "-:--". Session 1's missing-duration-metadata hypothesis CONFIRMED for the seek-bar layer.
- **Stutter verdict: ❌ FAIL.** Playback stutter PERSISTS even with duration metadata now correct. Director observed visible stutters on the new recording (same as on pre-fix recordings).

**Phase-4 PARTIAL-PASS surfaced that the original "playback stutters" symptom had TWO sub-symptoms with different root causes.** Session 2 addressed (a) the seek-bar sub-symptom but did NOT address (b) the stutter sub-symptom. The pre-Session-2 expectation was that fixing missing-duration would resolve BOTH; the empirical Phase-4 outcome refutes that assumption.

**Post-deploy diagnostic — empirical ffprobe revealed the actual root cause of the stutter:**

Claude ran ffprobe on multiple sample recordings to characterize the actual frame-rate behavior of every SCREEN_RECORDING webm file in production (since P-45 shipped 2026-05-22-i):

- Pre-fix file 1: **106 frames / 15.616s = 6.79 fps** (encoded bitrate 0.50 Mbps; one of Session 1's 3 inspected files)
- Pre-fix file 2: **154 frames / 22.69s = 6.79 fps** (encoded bitrate 1.35 Mbps; another Session 1 inspected file)
- Post-fix file (new recording made between build deploy + FF-1): **95 frames / 15.30s = 6.21 fps**

The natural variation (6.21 / 6.79 / 6.79) is within ffprobe-measurement noise for screen recordings of this length; **effective frame rate is consistently ~6-7 fps**, not the intended 30 fps. **Every SCREEN_RECORDING webm file is being captured at ~6-7 fps actual playback rate.** Playback can't be smoother than the source. The actual root cause of the stutter director has been observing is literally low-fps source playback, not playback-pacing or missing-metadata.

**This refines Session 1's diagnosis.** The missing-duration-metadata theory was correct for the seek-bar layer (and Session 2 fixed it end-to-end) but did NOT explain the stutter. The stutter has a separate root cause — the canvas-crop pipeline in `productionCropStreamToRegion` produces output at ~6-7 fps even when the input getDisplayMedia track requests 30 fps. Candidate bottleneck layers (for Session 3 to disambiguate): (1) getDisplayMedia source — does `track.getSettings().frameRate` report what was requested (30 fps) or something lower; (2) the hidden `<video>` element playback — Chrome may throttle hidden videos as a battery-saving optimization (FF-1 attempted to test this hypothesis); (3) `canvas.captureStream(30)` output — the canvas may not be redrawn at 30 Hz if the requestAnimationFrame loop is slower than 30 Hz; (4) MediaRecorder encoder — may drop frames if input pipeline can't sustain the requested rate.

**Speculative fix-forward #1 — Session 2 FF-1 build commit `d8b9507` (1 file +25/-2; ff-merge `279da34..d8b9507` to main; Rule 9 gate #2):**

- **`extensions/competition-scraping/src/lib/screen-recording/record-controller.ts` +25/-2:** In `productionCropStreamToRegion`, the hidden `<video>` element previously created via `document.createElement('video')` and never attached to the DOM is now attached to `document.body` with hidden-positioning styling (`position:fixed; top:0; left:0; width:1px; height:1px; opacity:0; pointerEvents:none; zIndex:-2147483648`). Theory: Chrome throttles detached video elements to ~6-7 fps as a battery-saving optimization (a documented Chrome behavior); attaching to DOM with hidden-positioning styling should remove the throttle. Teardown removes the video element from DOM. FF-1 changes ONLY `productionCropStreamToRegion` (the production-only implementation); tests inject their own `cropStreamToRegion` via DI seam, so test counts stayed at 562/562 GREEN.

**Director Phase-4 verification post-FF-1 — director sideloaded fresh zip `plos-extension-2026-05-25-w2-deploy-36-ff1.zip` (207.09 KB) + recorded a NEW screen recording post-FF-1 + Claude ran ffprobe on it:**

- Post-FF-1 file: **155 frames / 18.19s = 8.52 fps**

The +1.7 fps difference vs pre-FF-1 baseline (6.21-6.79 fps) is within ffprobe-measurement noise; the FF-1 theory was empirically BUSTED. Attaching the video to DOM did NOT meaningfully change the canvas-crop pipeline's output frame rate.

**Per director Rule 14f forced-picker outcome, remaining stutter work deferred to P-48 Session 3 (Diagnostic #2).** Picker offered (A) Defer to P-48 Session 3 (Recommended) — accept partial outcome + document empirical findings + ship proper diagnostic next session / (B) one more empirical fix attempt — try framerate constraint + 100x100/opacity-0.01 styling combo / (C) roll back FF-1 + defer; director picked (A). **FF-1 commit `d8b9507` STAYS in production** (no rollback) — director's choice preserves the failed-theory commit as a calibration data point for this design-doc lesson rather than rewriting history. Session 3 will start from `d8b9507` as the baseline; if Session 3 identifies the real bottleneck + ships a fix that subsumes FF-1, the FF-1 DOM-attachment can be removed at that point.

**NEW reusable Pattern memorialized.** **"Speculative fix-forward without empirical pre-verification = antipattern (reinforcement of Session 1's ffprobe-first Pattern at the fix-forward level)."** Triggers when, within a Phase-4 fix-forward cascade, a quick speculative fix-forward is tempting BECAUSE (a) the cycle is short (~10-15 min: edit + scoreboard + push + Vercel redeploy + extension zip + director sideload); (b) the diff is small (~25 LOC; one file); (c) the director-context-switch cost is low (director already in Phase-4 verification mode). BUT if the underlying root cause hasn't been EMPIRICALLY confirmed (only theorized), the fix-forward has a non-trivial probability of being ineffective — wasting a director-Phase-4 cycle + leaving a failed-theory commit in production. **Apply ALWAYS, BEFORE shipping any fix-forward.** Concrete steps: (1) articulate the THEORY of why the fix would help; (2) identify the EMPIRICAL TEST that would confirm/refute (here: a small browser-context HTML page creating attached + detached `<video>` variants + counting VideoFrames over time via `MediaStreamTrackProcessor` or `captureStream` + canvas); (3) run the empirical test if cheap to run; (4) only ship if confirmed, OR if the empirical test is itself prohibitively expensive AND the fix is small + reversible + worth the chance. **Today's slip:** FF-1 was framed as Recommended at Rule 9 gate #2 + shipped without empirical pre-verification of whether DOM attachment would unthrottle the video — director appropriately deferred to Claude's recommendation per `feedback_default_to_recommendation.md`; the real slip was in Claude's recommendation logic. **Pairs with §B 2026-05-25 (Session 1) Pattern "ffprobe-first diagnostic reveals hypothesis-bust before any code lands"** as the fix-forward-level version of the same calibration discipline. Future fix-forward shaping should explicitly include an "Have I empirically verified the theory?" gate in the recommendation logic.

**Locked Session 3 path = empirical instrumentation BEFORE structural changes.** Add per-frame instrumentation to extension content-script — log `track.getSettings().frameRate` from getDisplayMedia (source-side actual rate); count VideoFrames at source vs after canvas-crop pipeline using `MediaStreamTrackProcessor` if available; observe `canvas.captureStream(30)` output rate; observe MediaRecorder ondataavailable timer; tabulate per-frame logs to identify the empirical bottleneck across the 4 candidate layers (getDisplayMedia source / video element throttling / canvas.captureStream / MediaRecorder encoder). Decide whether to ship the instrumentation behind a feature flag or as a temporary dev-only branch (director picks); director records 1-2 NEW recordings with instrumentation; Claude reads logs + identifies empirical bottleneck; locks Session 4 implementation scope. Estimated 30-60 min in-Claude. Schema-change-in-flight: NO.

**Calibration data point on session budget.** Session 2 was budgeted at ~30-45 min in-Claude per the (a.90) NEXT_SESSION.md estimate. Actual in-session time was ~2-3 hours due to (i) unplanned Phase-4 PARTIAL-PASS requiring deeper diagnosis; (ii) FF-1 attempt + post-FF-1 verification cycle; (iii) deferred-vs-iterate Rule 14f picker + structured wrap-up. **Future calibration:** implementation sessions that ship under a Phase-4 deploy gate should always budget +50-100% time for "what if Phase-4 surfaces an unexpected issue." W4 deploy 2026-05-24-f was the canonical Pattern example; today's session reinforces it for the P-48 case at smaller scale.

**Operational housekeeping.** ONE throwaway diagnostic script `scripts/p48-s2-probe-new.mjs` (~50 LOC; ESM; PrismaClient + Supabase signed-URL generation + ffprobe target list) created in-session to support the post-deploy + post-FF-1 ffprobe inspections (Session 1's 6 throwaway scripts were already deleted at Session 1's end so could not be reused). DELETED at session end per the 2026-05-25 Session 1 housekeeping convention. Reconstruction cost ~10 min if a future session wants to re-run; query shape + signed-URL generation documented in CORRECTIONS_LOG §Entry 2026-05-25 sub-observation (e).

**Schema-change-in-flight flag STAYS NO** entire session — pure UI/extension changes (one new npm runtime dep + ~50 LOC across build + FF-1 + new test cases; no `prisma db push`; no schema; no API contract changes — DI seam additions are additive optional fields).

**Pre-deploy + post-FF-1 /scoreboard verification.** Pre-deploy /scoreboard after build commit `279da34` 5/5 GREEN at new baselines (root tsc clean / extension tsc clean / **562 ext +4 from baseline 558** — exact match with 4 new fix-webm-duration test cases / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**); Check 6 Playwright SKIPPED per Rule 27 — no Playwright spec coverage for record-controller. Post-merge /scoreboard on `main` partial per session_2026-05-24-f Pattern (root tsc clean / extension tsc clean / src/lib 786/786 GREEN; Check 3 + Check 5 trusted at unchanged baselines via clean ff-merge — byte-identical to pre-deploy). FF-1 post-edit /scoreboard 5/5 GREEN at unchanged baselines (extension tsc clean; extension `npm test` 562/562 UNCHANGED since FF-1 changes `productionCropStreamToRegion` only — tests inject their own `cropStreamToRegion` via DI seam).

**Impact on §A:** None. §A's content-script + extension architecture coverage all stays as-is; today's P-48 Session 2 is about capture-side mechanics inside the existing screen-recording flow (canvas-crop pipeline + MediaRecorder output container), not a new feature. §A stays frozen per Rule 18.

**Cross-references:**
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-25 (Session 1) — yesterday's Session 1 Diagnostic entry capturing the ffprobe-first Pattern; today's Session 2 Pattern is its fix-forward-level pairing.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-25 (Session 2) — today's Session 2 closing entry with 5 sub-observations including the NEW reusable Pattern memorialization + the MEDIUM informational empirical 6-7 fps finding + calibration data point on session budget overrun + operational housekeeping note.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-25 (Session 1) sub-observation (b) — the "ffprobe-first diagnostic" Pattern that today's sub-observation (b) reinforces at the fix-forward level.
- `docs/ROADMAP.md` P-48 polish-backlog entry — status flipped this session from ✅ DIAGNOSED 2026-05-25 (Session 1 of 2) to ✅ DEPLOYED-PARTIAL 2026-05-25 (Sessions 1 + 2 done; seek bar fixed; stutter NOT resolved — opens Session 3 Diagnostic #2 per (a.91)).
- `docs/NEXT_SESSION.md` — fully rewritten for P-48 Session 3 (Diagnostic #2) on `workflow-2-competition-scraping`; 3 plain-terms sections at top per director's 2026-05-21 directive; ZERO standing carry-overs.
- §B 2026-05-22-i (P-45 Build #2 closing entry) — P-45 ships the screen-recording capture path that produces the webm files; the ~6-7 fps source-file rate has been latent in every P-45 capture since the feature shipped.
- §B 2026-05-24-d / 2026-05-24-e / 2026-05-24-f (P-47 Shadow DOM lifecycle) — the band-aid → structural-fix lifecycle that closed end-to-end immediately prior; today's P-48 lifecycle is shaping up differently (Session 1 diagnosis → Session 2 implementation + Phase-4 PARTIAL → FF-1 BUSTED → Session 3 second diagnostic loop) and may end up being the longest-running polish-item arc in W#2 polish history if Session 3 doesn't immediately lock the bottleneck.
- `feedback_recommendation_style.md` (most-thorough/reliable — today's FF-1 violated this principle by recommending without empirical pre-verification; the new Pattern memorialized today refines the recommendation logic for fix-forwards).
- `feedback_default_to_recommendation.md` (director appropriately deferred to Claude's recommendation at Rule 9 gate #2; the real slip was in Claude's recommendation logic).
- `feedback_approval_scope_per_decision_unit.md` (6-push fix-forward-cascade session pattern).

**Closing line:** P-48 Session 2 (Implementation + Fix-Forward #1 BUSTED) ✅ DEPLOYED-PARTIAL 2026-05-25 on vklf.com. Build commit `279da34` shipped `fix-webm-duration` patch end-to-end under Rule 9 gate #1 + director-verified seek-bar fix; FF-1 commit `d8b9507` shipped DOM-attachment theory under Rule 9 gate #2 + empirically BUSTED via post-deploy ffprobe (8.52 fps within noise of pre-fix 6.21-6.79 fps baseline). Empirical ffprobe revealed every SCREEN_RECORDING webm captured at ~6-7 fps actual rate — refines Session 1's diagnosis; the original "playback stutters" symptom had multiple contributing causes and Sessions 1-2 resolved one of them. NEW reusable Pattern "Speculative fix-forward without empirical pre-verification = antipattern" memorialized — pairs with §B 2026-05-25 (Session 1) Pattern as the fix-forward-level version. FF-1 commit STAYS in production as calibration data point per director Rule 14f picker. New baselines: extension test count 562/562 (+4 from 558). Next session: P-48 Session 3 (Diagnostic #2) per (a.91) — empirical instrumentation pass to identify the ~6-7 fps source-file bottleneck (~30-60 min in-Claude).

---

## §B 2026-05-25 — `session_2026-05-25_reviews-phase-2-capture-session` — Reviews Phase 2 scope-expansion CAPTURE SESSION — NEW P-49 hub-and-spokes entry (4-platform extension review extraction + AI analysis at 3 levels) + NEW P-50 Condition Pathology placeholder card captured; A.1 deferral resolved via P-49 cross-reference; NEW reusable Pattern "Mid-pre-build scope-expansion redirect — pure-capture session over mixed-session attempts"

**§A frozen** per Rule 18. This entry is informational + scope-expansion-capture. **Session shape: pure capture (NO code, NO builds, NO deploys, ZERO Rule 9 gates fired).** Director's pre-build launch task for today was **P-48 Session 3 (Diagnostic #2)** for the screen-recording stutter empirical instrumentation pass; before any P-48 Session 3 work began, director surfaced the long-anticipated "next round of additions" to W#2 (per the verbatim 2026-05-24-f directive to "explicitly ASK director for next round of additions once all remaining things are done"). Director picked **Option A (Recommended: pure capture today; P-48 Session 3 deferred opportunistically)** at the Rule 14f session-direction forced-picker.

**Director's scope drop covered four new features + one small dashboard addition:**

1. **Automated per-platform review collection** for Amazon, eBay, Etsy, and Walmart via extension and/or crawler. Verbatim per-platform DOM specs preserved in the P-49 ROADMAP entry for ingestion at next session's design interview: **Amazon** listing-page `Customers say` block + Top reviews US/other countries + per-star pagination URL `https://www.amazon.com/product-reviews/<ASIN>/...&filterByStar=critical&pageNumber=N` at 10/page; capture star + title + body + helpful-count; sort by helpful-count desc; default 200/star user-adjustable. **eBay** feedback URL `https://www.ebay.com/fdbk/mweb_profile?fdbkType=FeedbackReceivedAsSeller&item_id=<ID>&username=<SELLER>&...&overall_rating_item=NEUTRAL` at ~25/page; Neutral → 3-star + Negative → 1-star mapping; default 200/filter. **Etsy** listing-page `Reviews for this item` + `View all reviews for this item` overlay with per-star percentage filter at ~8/page; capture 3+2+1 star by default at 200/star. **Walmart** per-star query-param `https://www.walmart.com/reviews/product/<ID>?ratings=N` at 10/page; capture star + title + full-expanded body (click "View more" expander); default 200/star.
2. **Per-product two-sweep AI review analysis** — first sweep produces per-batch summaries of manageable review subsets; second sweep merges batch summaries into comprehensive per-product summary; user can scope to a specific star-count subset or all reviews together.
3. **Cross-Type pooled AI analysis** — same review-analysis system run across all products sharing a `type` value (the Competition Data column shipped via P-46 W3 2026-05-23-e); produces a comprehensive summary per Type.
4. **Cross-everything AI analysis (competitive landscape)** — same system pooled across all Types within a Project; produces a full competitive-landscape review report.
5. **Condition Pathology card** — small dashboard placeholder card between `Competition Scraping & Deep Analysis` and `Therapeutic Strategy & Product Family Design` on the PLOS dashboard (`src/app/projects/[projectId]/page.tsx` + `src/app/projects/page.tsx` 15-entry `WORKFLOW_DEFS` array at position 3).

**Critical anti-bot constraint per director (verbatim).** *"Both methods should ensure that we don't get flagged by amazon for going against their terms or doing something wrong. That means our functionality should be very close to real world human user sitting where admin is."* Extension-method runs in director's logged-in browser session at director's IP (low risk on all 4 platforms; behaviorally indistinguishable from a power user). Crawler-method (headless server-IP) is **high-risk on Amazon specifically** (aggressive anti-bot detection; captchas; IP bans; possible ToS strikes against seller account if Amazon associates scraping with director's account); lower but real risk on Walmart/Etsy; lowest on eBay. Crawler-method realistic implementation typically requires residential proxy rotation + browser-fingerprint randomization + captcha-solving services + careful rate-limiting — significant ongoing cost + complexity. Decision on crawler scope **deferred to design session**; default expectation per most-thorough/reliable reasoning is extension-method only with crawler dropped or deeply deferred.

**Capture-shape Rule 14f forced-picker outcome (Recommended).** Hub-and-spokes structure for P-49 (single multi-workstream ROADMAP entry analogous to P-46) chosen over flat-split-per-feature (4-5 separate P-NN entries) and over hybrid. **Card-only scope for P-50** chosen over "full Workflow #3 + renumber all downstream workflows" and over "defer scope decision" — implication: no doc-wide W# renumbering required (Therapeutic Strategy stays W#3 by convention even though it slides to card-position 4); Prisma schema unchanged (already free-form `workflow String`); existing docs that reference workflow counts (`PROJECT_CONTEXT.md §2` "14 PLOS workflows") stay accurate at the WORKFLOW level (Condition Pathology is a placeholder card, not yet a numbered workflow).

**Entry-approval Rule 14f forced-picker outcome (Recommended).** Both P-49 + P-50 entries approved as drafted; Reviews Phase 2 Design Session locked as next-session task per (a.92).

**P-49 structure — 5 internal workstreams analogous to P-46's hub-and-spokes:**

1. **Workstream 1 — Reviews Phase 2 Design Session (NEXT SESSION per (a.92)).** Workflow Requirements Interview producing `docs/REVIEWS_PHASE_2_DESIGN.md` §A (frozen-decisions) + §B (empty append-only) + §C (per-workstream implementation outlines). Locks: anti-bot strategy / extension-vs-crawler scope decision / per-platform DOM extraction shape per the 4 platforms / AI model choice + cost guards / batch sizing for two-sweep summarization / 3-level analysis output shape + UI placement / schema additions for analysis outputs / star-count breakdown UI / server-side review reordering mechanism / bulk-delete affordance / scrape-job orchestration model (background-job vs in-page extension worker). ~1 session pure design.
2. **Workstream 2 — Per-platform extension extraction** — 4 build clusters (one per platform: Amazon → eBay → Etsy → Walmart, in that director-stated priority order). Each cluster: per-platform module wiring in `extensions/competition-scraping/src/lib/content-script/`, right-click "Scrape reviews for this URL" context-menu entry, DOM walker per platform's review-page structure, paginated "load more" automation honoring per-page review counts (Amazon 10/page, eBay 25/page, Etsy 8/page, Walmart 10/page), Supabase write through existing `CapturedReview` model with `source = 'extension-scrape'` (new source value vs. current `'manual'`), user-configurable scrape cap default 200/star, sort by helpful-count where available. Estimated ~2-4 sessions per platform = ~8-16 sessions total.
3. **Workstream 3 — Crawler infrastructure (CONDITIONAL on design-session scope decision)** — if scoped in: proxy strategy (residential rotation), rate-limiting, anti-bot handling, scheduling, job-queue, output ingestion to `CapturedReview` table. Estimated ~5-10 sessions if scoped in; likely deferred or dropped per anti-bot risk discussion.
4. **Workstream 4 — Captured Reviews UI extensions on vklf.com** — star-count breakdown counters at top of CapturedReviewsSection, star-filter (replace existing star-rating-multi-select with a more compact star-counter-bar that doubles as filter), server-side drag-to-reorder (within-star + across-star; persists to DB via new PUT route), bulk-delete affordance (select multiple + delete-with-confirm). New API routes for reorder + bulk delete. Estimated ~2-3 sessions.
5. **Workstream 5 — AI review analysis system** — three levels per director directive: (a) per-product two-sweep summarization; (b) cross-Type pooled; (c) cross-everything (full competitive-landscape report). LLM choice + prompt shapes locked at design session. Output stored as new schema + surfaced via NEW UI panels on the existing Comprehensive Competitor Analysis page (P-46 W4 — shipped 2026-05-24-f) OR a new dedicated page (design-session decision). Estimated ~5-10 sessions.

**Total estimate (post-design-session):** ~20-50 sessions across all workstreams; refined post-interview.

**Extension-side architecture cross-reference (per P-23 precedent — extension content-script changes live in this doc, not in COMPETITION_DATA_V2_DESIGN).** Workstream 2 of P-49 (per-platform extension extraction) lands per-platform modules in `extensions/competition-scraping/src/lib/content-script/`. Each module: (a) right-click context-menu entry "Scrape reviews for this URL" registered via the existing extension context-menu wiring; (b) platform-specific DOM walker keyed on platform-detection helper (URL pattern match: `amazon.com/dp/` vs `ebay.com/itm/` vs `etsy.com/listing/` vs `walmart.com/ip/`); (c) paginated "load more" automation honoring per-page review counts; (d) Supabase write through existing `CapturedReview` model. **Architecture cross-references for design-session ingestion:** P-23 saved-URL dropdown side-by-side ship (§B 2026-05-19-g) — first extension content-script per-platform diff; established the extension-side architecture pattern of detecting platform via URL prefix + branching the gesture per platform. P-45 Build #2 (§B 2026-05-22-i) — `applyAggressiveEventIsolation` per-listener band-aid + P-47 Shadow DOM replacement (§B 2026-05-24-d) — established the form-mount strategy for extension content-script forms; same pattern likely applies to any "review-scrape progress" UI surfaced inside the page. P-46 Workstream 5 (§B 2026-05-24-c + 2026-05-24-e + 2026-05-24-f) — extension URL save form additions via `makeTextareaField()` helper extension to existing `url-add-form.ts` — same content-script form scaffolding pattern likely reused for any per-platform review-scrape settings panel.

**A.1 deferral RESOLVED today.** The Reviews-extraction mechanism deferral in `docs/COMPETITION_DATA_V2_DESIGN.md` §A.1 (2026-05-23) was directly resolved by today's P-49 capture — A.1 was updated this session with a "RESOLVED 2026-05-25 — see ROADMAP P-49" cross-reference paragraph linking the original deferral to the now-captured P-49 hub. The 2026-05-23 A.1 deferral was: *"The per-platform Reviews-extraction mechanism is **DEFERRED to future per-platform polish sessions** that follow P-46 graduation."* Director's 2026-05-25 directive surfaces the full scope cluster in one shot — including the per-platform extraction mechanism + AI analysis at 3 levels + dashboard placeholder card. P-46 W2 Session 4 (shipped 2026-05-28) had landed the v1 surface (schema + URL-detail-page view + manual entry form) per A.1b; today's Phase 2 extends to automation across both collection and analysis.

**NEW reusable Pattern memorialized today: "Mid-pre-build scope-expansion redirect — when director surfaces major new scope at session-start before pre-build reads complete, the most-thorough/reliable path is a pure-capture session (pause planned task; run Rule 24 searches; capture as ROADMAP entries; defer planned task) rather than mixed-session attempts."** Trigger: director surfaces a new scope cluster before pre-build reads complete or before any code begins. Concrete steps: (1) immediately pause the planned task; (2) fire Rule 14f session-direction picker offering (A) pure-capture / (B) mixed / (C) pivot fully / (D) original task as planned + minimal capture; (3) default to (A) per most-thorough/reliable; (4) run Rule 24 searches across all docs for any prior treatment of the new scope; (5) fire capture-shape picker (hub-and-spokes vs flat split vs hybrid); (6) capture the new scope as one or more ROADMAP entries with verbatim director-supplied specs preserved for design-session ingestion; (7) update any docs the new scope resolves (here: A.1 cross-reference); (8) write `## Proposed interview question scaffold` section in NEXT_SESSION.md preserving the design-session question draft verbatim; (9) lock the next-session task as the design session that ingests today's capture. **Rationale:** mixing capture with planned-task code-shipping risks (a) incomplete capture (rushed; missing director-context); (b) incomplete planned-task work (interrupted; partial deploy under Rule 9 risk); (c) divided attention across two heavy contexts in one session. Pairs as a Rule-30 plain-terms-summary lesson — director benefits from clean session-shapes (one session = one outcome class) rather than mixed-outcome sessions where the plain-terms summary has to span two unrelated arcs.

**LOW informational sub-observation: long-deferred concerns naturally resolve when director's mental model of what they want catches up with the deferred scope.** A.1 was deferred at the 2026-05-23 P-46 W#2 Phase 2 design interview with director's verbatim *"Each platform will have different ways of capturing reviews and we will discuss those methods of capture later."* Today (2026-05-25 — 2 days later at session-relative time) director surfaced the full per-platform specs in one shot, naming all 4 platforms + specific DOM patterns + URL structures + per-star counts + AI analysis aggregation levels. Calibration data point for design discipline: when a design decision is genuinely premature (director can't yet name the concrete options), deferring + waiting for the director's mental model to mature can produce a much higher-quality capture later than forcing the decision at the original moment. The A.1 deferral was vindicated; pairs with the LOW informational sub-observation from §B 2026-05-24-f about UX directives surfacing 3+ months after styling shipped (different shape — stylistic directive surfaces late after concrete experience; today's is functional-scope directive surfaces late after concrete capability — but same underlying mental-model-maturation dynamic).

**Operational note: 15 interview-question draft preserved verbatim in NEXT_SESSION.md ## Proposed interview question scaffold section.** The 15 questions cover: Q1 crawler scope / Q2 per-platform priority order / Q3 scrape job orchestration / Q4 per-star scrape count UX / Q5 server-side review reordering / Q6 bulk-delete affordance / Q7 AI model choice + cost guards / Q8 two-sweep batch sizing / Q9 AI analysis output shape / Q10 AI analysis UI placement / Q11 AI analysis trigger UX / Q12 AI analysis caching + re-run / Q13 schema additions / Q14 star-count breakdown UI / Q15 anti-bot defensive posture. Each has options + Recommended pick per most-thorough/reliable reasoning. Next session walks through them as the Workflow Requirements Interview producing `docs/REVIEWS_PHASE_2_DESIGN.md`.

**P-50 (Condition Pathology card) capture — separate small concern.** Card-only scope per Rule 14f picker (no W# renumbering). Suggested entry: `{ id: "condition-pathology", icon: "🩺", title: "Condition Pathology", active: false, route: null },` at position 3 in BOTH `WORKFLOW_DEFS` arrays (per-Project landing + project-list page). Lives on `main` not `workflow-2-competition-scraping` per `docs/MULTI_WORKFLOW_PROTOCOL.md` §11 platform-wide-infrastructure branch model. NOT on (a.92) critical path; opportunistic small session (~10 min in-Claude) OR bundled with a future `main`-branch session.

**Schema-change-in-flight flag STAYS NO** entire session (pure ROADMAP + design-doc capture; no `prisma db push`; no schema; no API contract changes). **EXPECTED YES** when next session's design interview locks the AI analysis output tables OR when Workstream 2 first per-platform build lands `source = 'extension-scrape'` enum value addition to `CapturedReview.source`.

**Pre-build + post-capture /scoreboard NOT run** (no code change to verify); baselines unchanged from prior session (root tsc clean / extension tsc clean / **562 ext UNCHANGED** / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**). Check 6 Playwright SKIPPED per Rule 27.

**Impact on §A:** None. §A's frozen content-script + extension architecture coverage all stays as-is; today's P-49 capture is design-level scope expansion that will land in the new standalone `docs/REVIEWS_PHASE_2_DESIGN.md` once next session's design interview produces it. §A stays frozen per Rule 18. **Future P-49 build sessions get §B entries in `docs/REVIEWS_PHASE_2_DESIGN.md` directly per Rule 18, NOT in this doc's §B** (analogous to the P-46 → COMPETITION_DATA_V2_DESIGN split per §B 2026-05-23 above). Extension-side architecture-spanning observations (Shadow DOM mounts; per-platform URL-prefix dispatch; `makeTextareaField()` helper extensions) continue to land in this doc's §B per the P-23 / P-45 / P-47 precedent — the per-platform-extraction modules themselves are W#2-graduated-pattern surface work that this doc owns.

**Cross-references:**
- `docs/ROADMAP.md` NEW P-49 polish-backlog entry — Reviews Phase 2 hub-and-spokes with director's verbatim per-platform specs preserved + anti-bot constraint preserved + 3-level AI analysis output shape preserved.
- `docs/ROADMAP.md` NEW P-50 polish-backlog entry — Condition Pathology card placeholder; small `main`-branch session; ~10 min in-Claude; opportunistic.
- `docs/COMPETITION_DATA_V2_DESIGN.md` §A.1 (updated this session with "RESOLVED 2026-05-25 — see ROADMAP P-49" cross-reference paragraph linking original deferral to today's capture).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-25 (Reviews Phase 2 capture session) — paired entry in the V2 design doc; today's entry here covers extension-side architecture cross-reference per P-23 precedent; the V2 design doc's entry covers data-shape side.
- `docs/COMPETITION_DATA_V2_DESIGN.md` §A.1b — v1 Reviews surface shipped via P-46 W2 Session 4 (2026-05-28); P-49 extends both the collection mechanism (Workstream 2) AND the UI surface (Workstream 4).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-25 (Reviews Phase 2 scope-expansion capture — the THIRD 2026-05-25-dated §Entry) — today's closing §Entry capturing 4 sub-observations including the NEW reusable Pattern "Mid-pre-build scope-expansion redirect" + LOW informational on long-deferred concerns naturally resolving + operational note.
- `docs/NEXT_SESSION.md` — fully rewritten for next session = Reviews Phase 2 Design Session (Workflow Requirements Interview producing `docs/REVIEWS_PHASE_2_DESIGN.md`) on `workflow-2-competition-scraping`; 3 plain-terms sections at top; `## Proposed interview question scaffold` section preserving the 15 questions verbatim.
- §B 2026-05-23 (P-46 design session cross-reference) — same hub-and-spokes precedent for splitting a multi-workstream polish item into its own standalone design doc.
- §B 2026-05-19-g (P-23 saved-URL dropdown ship) — first extension content-script per-platform diff; the URL-prefix dispatch pattern P-49 Workstream 2 will reuse.
- §B 2026-05-22-i (P-45 Build #2) + §B 2026-05-24-d (P-47 Shadow DOM) + §B 2026-05-24-c (P-46 W5 `makeTextareaField` extensions) — extension content-script form-mount architecture relevant to any per-platform review-scrape progress UI.
- `feedback_recommendation_style.md` (most-thorough/reliable — today's pure-capture choice over mixed-session is the most-thorough/reliable path per the new Pattern memorialized).
- `feedback_default_to_recommendation.md` (director defaulted to all 3 Rule 14f picker recommendations today).
- `feedback_approval_scope_per_decision_unit.md` (2-push capture-session pattern: doc-batch push + doc-batch ff-merge push).
- W#2's anti-bot considerations (NEW concern; no prior treatment — first time we ship server-side automation against platform pages; locks W#2 graduation step until Phase 2 closes at the workstream-by-workstream level).

**Closing line:** Reviews Phase 2 scope-expansion CAPTURE SESSION ✅ DONE 2026-05-25 on `workflow-2-competition-scraping` — pure-capture session (NO code, NO builds, NO deploys, ZERO Rule 9 gates fired). NEW P-49 hub-and-spokes entry + NEW P-50 placeholder card entry captured with director's verbatim per-platform specs preserved. A.1 deferral RESOLVED via P-49 cross-reference. NEW reusable Pattern "Mid-pre-build scope-expansion redirect — pure-capture session over mixed-session attempts" memorialized — pairs as a Rule-30 plain-terms-summary lesson + supports clean session-shapes for director. LOW informational sub-observation on long-deferred concerns naturally resolving when director's mental model catches up — calibration data point for design discipline. 15 interview-question draft preserved verbatim in NEXT_SESSION.md for next session's Workflow Requirements Interview ingestion. Next session: Reviews Phase 2 Design Session per (a.92) on `workflow-2-competition-scraping` (~1 session pure design; produces `docs/REVIEWS_PHASE_2_DESIGN.md`).

---

## §B 2026-05-25-b — `session_2026-05-25-b_reviews-phase-2-design-session` — Reviews Phase 2 Design Session producing `docs/REVIEWS_PHASE_2_DESIGN.md` — cross-reference pointer entry from extension-side architecture per the P-23 precedent (extension content-script changes live in this doc, not in COMPETITION_DATA_V2_DESIGN); §A frozen per Rule 18; THIRD APPLICATION of the design-doc-split precedent (P-27 2026-05-20-b first; P-46 2026-05-23 second; P-49 today third)

**§A frozen** per Rule 18. This entry is informational + design-doc-split cross-reference from the **extension-side architecture** of the design (the data-shape-side cross-reference lives in `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-25-b — paired entry — per the dual-doc P-23 + P-46 + P-27 precedents). Suffix `-b` per Rule 14 disambiguation since §B 2026-05-25 already exists in this doc for yesterday's Reviews Phase 2 scope-expansion capture session + §B 2026-05-25 already exists for P-48 Sessions 1 + 2.

**Session shape: pure design session (NO code, NO builds, NO deploys, ZERO Rule 9 gates fired).** Today executed the (a.92) RECOMMENDED-NEXT task locked by yesterday's capture session. Director walked through the 15-question scaffold preserved verbatim in yesterday's NEXT_SESSION.md `## Proposed interview question scaffold` section + answered 14 direct-Yes-to-Recommended + 1 Q7 substantive refinement on the AI model-version selector.

**NEW standalone `docs/REVIEWS_PHASE_2_DESIGN.md` shipped (790 lines).** §A frozen at 15 interview-locked subsections A.1-A.15 + §B empty append-only per Rule 18 + §C 4 active workstream implementation outlines (W1 DONE this session / W2 Per-platform extension extraction with 4 sub-clusters Amazon→eBay→Etsy→Walmart / W4 Captured Reviews UI extensions / W5 AI review analysis system at 3 levels) + W3 Crawler infrastructure DROPPED placeholder per Q1 outcome — extension-only locked matching director's verbatim *"functionality should be very close to real world human user sitting where admin is"* anti-bot constraint. Revised P-49 scope post-design: 4 active workstreams instead of 5; revised estimate ~15-25 sessions total instead of ~20-50.

**THIRD APPLICATION of the design-doc-split precedent from W#2's history.** Lineage of design-doc splits per Rule 18 Option A (new top-level doc):
1. **P-27 → `CAPTURED_VIDEOS_DESIGN.md`** (created 2026-05-20-b in `session_2026-05-20-b_p27-captured-videos-design-interview`; first application via §B 2026-05-20-b in this doc).
2. **P-46 → `COMPETITION_DATA_V2_DESIGN.md`** (created 2026-05-23 in `session_2026-05-23_p46-w2-phase-2-design-session`; second application via §B 2026-05-23 in this doc).
3. **P-49 → `REVIEWS_PHASE_2_DESIGN.md`** (created 2026-05-25-b in `session_2026-05-25-b_reviews-phase-2-design-session`; third application via TODAY's §B 2026-05-25-b in this doc).

**Extension-side architecture cross-references for P-49 Workstream 2 ingestion (per-platform extension extraction).** Per the P-23 precedent that extension content-script changes live in this doc (the W#2 master design doc), today's §B captures the extension-architecture-spanning cross-references future P-49 W2 build sessions will reuse:

- **URL-prefix dispatch (§B 2026-05-19-g — P-23 saved-URL dropdown side-by-side ship).** First extension content-script per-platform diff established the platform-detection pattern via URL prefix matching: `amazon.com/dp/` vs `ebay.com/itm/` vs `etsy.com/listing/` vs `walmart.com/ip/`. P-49 W2's per-platform module dispatch reuses this exact pattern. Each module's review-page URL pattern: `amazon.com/product-reviews/<ASIN>/...&filterByStar=...&pageNumber=N` (Amazon — per A.1 of new design doc); `ebay.com/fdbk/mweb_profile?fdbkType=FeedbackReceivedAsSeller&item_id=<ID>&...&overall_rating_item=NEUTRAL|NEGATIVE` (eBay); `etsy.com/listing/<ID>/...` overlay + per-star percentage filter (Etsy); `walmart.com/reviews/product/<ID>?ratings=N` (Walmart).
- **Shadow DOM mount strategy (§B 2026-05-22-i — P-45 Build #2 + §B 2026-05-24-d — P-47 refactor).** A.3 of the new design doc locks the per-platform scrape progress indicator UI surface as a Shadow DOM mount reusing the P-47 pattern (open Shadow DOM root with `FORM_CHROME_CSS` injected inside the shadow; host `<div>` with `position:fixed inset:0 z-index:999998`). The W2 build sessions extract the P-47 Pattern into a shared helper consumed by all 4 per-platform modules + W2's scrape-pagination logic.
- **`makeTextareaField()` helper extensions (§B 2026-05-24-c + §B 2026-05-24-e + §B 2026-05-24-f — P-46 W5 extension URL save form additions).** The content-script form-mount strategy used in P-46 W5 (where `makeTextareaField()` was extended from the existing `url-add-form.ts` to add Type / Description-1 / Description-2 / Price fields) sets the precedent for any per-platform review-scrape settings panel (per-star scrape cap input per A.4 + per-trigger override input).
- **A.15 anti-bot defensive posture lock (per the new design doc).** Conservative defaults — 1-3s random delay between pagination clicks + respect platform's intrinsic rate limits + abort on captcha detection + show clear UI notification to director if any platform rate-limits us — applies to all 4 per-platform W2 modules. New shared helper `scrape-pagination.ts` ships in W2 Session 1 (per (a.93)) implementing the conservative defaults + per-platform cap + cancellable abort signal + UI notification surface.

**Shared infrastructure that W2 Session 1 ships (per (a.93)).** Schema migration (the A.13 package) + shared `scrape-pagination.ts` helper for the conservative anti-bot defaults + Shadow DOM progress indicator (reuses P-47 pattern as a shared helper) + Amazon DOM walker getting basic end-to-end extraction working on a real Amazon product page. Subsequent W2 sessions (Amazon Session 2+ for refinement + Amazon → eBay → Etsy → Walmart per A.2) reuse all three shared pieces with platform-specific DOM walkers per module.

**Affected §A sections in this doc (informational — §A stays frozen per Rule 18).**
- **§A.7 (content-script architecture overview) — extended informationally by P-49 W2's per-platform modules.** The existing §A.7 covers the v1 content-script architecture (URL-add form via the content-script's `Add URL` gesture, image-capture form via `Capture image to URL`, video-capture form via `Capture video to URL` shadow-DOM mount, text-capture form via `Capture text to URL`); P-49 W2 adds per-platform review-scrape gestures (`Scrape reviews for this URL` right-click context-menu entry; per-platform module + DOM walker + paginated scrape lifecycle). §A.7 stays frozen per Rule 18; the new design doc's §C.2 W2 implementation outline is the canonical extension-architecture spec for P-49 W2.
- **§A.8 (extension shipping pipeline) — UNCHANGED.** Per-platform modules ship via the same monorepo at `extensions/competition-scraping/` + same WXT build pipeline + same Phase 1 unpacked + Phase 2 Chrome Web Store Unlisted distribution. No changes to shipping mechanics from P-49.
- **§A.16/A.17 (architectural decisions ledger) — UNCHANGED.** No new architectural decisions today; A.7's content-script architecture covers per-platform modules as additive surfaces; A.15 covers extension distribution (P-49 W2 ships in the existing extension package, not as a separate extension).

**Cross-references:**
- `docs/REVIEWS_PHASE_2_DESIGN.md` (NEW — 790 lines) — canonical interview-locked design spec; future P-49 build-session §B entries land there per Rule 18, NOT in this doc's §B.
- `docs/ROADMAP.md` P-49 entry — Status flip from "DESIGN-PENDING" to "🟢 DESIGN-FROZEN 2026-05-25-b" + 4-active-workstreams-instead-of-5 update + (a.92) close + (a.93) open = P-49 W2 Amazon Session 1.
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-25-b — paired entry covering data-shape side; today's entry here covers extension-side architecture per the P-23 + P-27 + P-46 precedent.
- §B 2026-05-25 (Reviews Phase 2 scope-expansion capture session) — yesterday's opening entry for this Workstream 1 arc; today's §B 2026-05-25-b closes the W1 arc and opens the W2-W5 build arc.
- §B 2026-05-25 (P-48 Session 1 + Session 2) — same-day prior §Bs covering screen-recording stutter diagnostic + implementation + FF-1 BUSTED; pure orthogonal to P-49 (different feature surface; different file path).
- §B 2026-05-23 (P-46 → COMPETITION_DATA_V2_DESIGN split) — second application of the design-doc-split pattern; today's P-49 split is the third.
- §B 2026-05-20-b (P-27 → CAPTURED_VIDEOS_DESIGN split) — first application of the design-doc-split pattern; the lineage Pattern P-49 today follows.
- §B 2026-05-19-g (P-23 saved-URL dropdown ship) — first extension content-script per-platform diff; URL-prefix dispatch pattern P-49 W2 reuses.
- §B 2026-05-22-i (P-45 Build #2 — `applyAggressiveEventIsolation` band-aid).
- §B 2026-05-24-d (P-47 Shadow DOM mount as structural replacement for the P-45 band-aid) — mount strategy P-49 W2's scrape-progress indicator reuses.
- §B 2026-05-24-c + §B 2026-05-24-e + §B 2026-05-24-f (P-46 W5 extension URL save form additions via `makeTextareaField()`) — content-script form-scaffolding pattern P-49 W2's per-platform settings panels reuse.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-25-b (P-49 Reviews Phase 2 design-session closing entry — the FOURTH 2026-05-25-dated §Entry) — today's closing §Entry with the NEW reusable Pattern + calibration data point + LOW informational sub-observation.
- `feedback_recommendation_style.md` (most-thorough/reliable — today's 14-of-15 direct-Yes-to-Recommended rate validates the framing).
- `feedback_default_to_recommendation.md` (default to Recommended — today's 14-of-15 direct-Yes confirms the default-to-Recommended posture is well-calibrated).
- `feedback_approval_scope_per_decision_unit.md` (2-push design-session pattern: doc-batch push + doc-batch ff-merge push).
- W#2's anti-bot considerations (locked via A.15 of new design doc; Recommended Conservative defaults — 1-3s random delays + captcha-aware abort + rate-limit UI notification).
- W#2 graduation step (now further deferred until Reviews Phase 2 closes at the workstream-by-workstream level per the P-49 ROADMAP entry).

**Closing line:** P-49 Reviews Phase 2 DESIGN SESSION ✅ DONE 2026-05-25-b on `workflow-2-competition-scraping` — pure design session (NO code, NO builds, NO deploys, ZERO Rule 9 gates fired). NEW standalone `docs/REVIEWS_PHASE_2_DESIGN.md` shipped (790 lines; §A frozen 15 decisions + §B empty + §C 4 active workstream outlines + W3 Crawler DROPPED placeholder per Q1 outcome). Director answered 14 of 15 picker direct-Yes-to-Recommended + 1 Q7 substantive refinement on the AI model-version selector. THIRD APPLICATION of the design-doc-split precedent from W#2's history (P-27 2026-05-20-b first; P-46 2026-05-23 second; P-49 today third). Extension-side architecture cross-references preserved here per the P-23 precedent; data-shape side lives in `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-25-b paired entry. Future P-49 build-session §B entries land in the new design doc, not in this doc's §B per Rule 18. Next session: P-49 W2 Amazon Session 1 (schema migration + shared scrape-pagination helper + Shadow DOM progress indicator + Amazon DOM walker) per (a.93) on `workflow-2-competition-scraping` — Schema-change-in-flight flag flips to YES at start when the A.13 schema migration runs.

---

## §B 2026-05-26 — `session_2026-05-26_p49-w2-amazon-session-1` — P-49 W2 Amazon Session 1 build session lands schema migration + shared content-script infrastructure + Amazon DOM walker at code level via build commit `422436f` (20 files +2069/-7); extension-side architecture cross-reference pointer entry per the P-23 + P-46 precedent — canonical build-session §B entry lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-26

**§A frozen** per Rule 18. This entry is informational + cross-reference pointer from the **extension-side architecture** of P-49 (the canonical build-session entry lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-26 per Rule 18). The pointer-entry convention here mirrors the §B 2026-05-25-b pointer entry (P-49 design session) + the §B 2026-05-23 pointer entry (P-46 design session) — extension-side architecture changes get a pointer in this doc; the canonical entry lives in the dedicated design doc.

**Session shape: pure CODE session on `workflow-2-competition-scraping` (NO deploys, NO Rule 9 gates fired, ZERO Rule 14f forced-pickers fired).** Build commit `422436f` (20 files +2069/-7) shipped the foundation build for the Reviews Phase 2 implementation arc. NOT ff-merged to main this session (build session; the build commit stays on the workflow branch until the eventual Amazon deploy session ships under Rule 9 gate ~3-5 sessions from now). **Schema-change-in-flight flag flipped NO → YES at `npx prisma db push`** (1.44s; additive only; zero data loss) — stays YES until the eventual Amazon deploy session ships the migration to production.

**Extension-side architecture additions (for future P-49 W2 build sessions to reference + reuse).** Today's build shipped 3 new content-script modules + new context-menu wiring + new message types that future eBay / Etsy / Walmart sub-cluster sessions will reuse. Per the P-23 + P-46 precedent (extension content-script architecture lives in this doc; data-shape side lives in the dedicated design doc), today's §B captures the extension-architecture-spanning surface:

- **NEW `extensions/competition-scraping/src/lib/content-script/scrape-pagination.ts` (~310 LOC; +371 in the diff).** Shared per-platform paginated-scrape helper per §A.15 of the canonical design doc. Generic `paginate(opts)` loop with 1-3s random `randomPaginationDelay()` between page transitions + `detectCaptcha(doc)` with Amazon-specific (`#captchacharacters`) + generic CAPTCHA selectors (any captcha iframe + `.g-recaptcha` + `.h-captcha` + `[data-sitekey]` + any element with `role="captcha"`) + `isRateLimitStatus()` HTTP 429/503 detection + AbortSignal-cancellable for user-initiated cancel + structured `ScrapeProgress` event stream (page-loading / page-loaded / row-saved / completed / aborted-by-user / aborted-captcha / aborted-rate-limit / aborted-error). Future eBay / Etsy / Walmart sub-cluster modules will compose against this helper without re-implementing the pagination loop.
- **NEW `extensions/competition-scraping/src/lib/content-script/scrape-progress-indicator.ts` (~230 LOC; +331 in the diff).** Shared Shadow DOM progress indicator per §A.3 reusing the P-47 2026-05-24-d mount pattern. Open Shadow DOM root attached to a fixed-positioned host `<div>` in `document.body` with `z-index: 999999`. NEW `PROGRESS_INDICATOR_CSS` constant injected inside the shadow. Subscribes to `ScrapeProgress` events from `scrape-pagination.ts` + renders "Scraping page N — X reviews captured so far..." with cancel button + auto-dismiss on completed + persists on captcha / rate-limit / error per §A.3. Future per-platform modules consume this indicator without re-implementing the Shadow DOM mount.
- **NEW `extensions/competition-scraping/src/lib/content-script/amazon-review-extractor.ts` (~300 LOC; +325 in the diff).** Amazon-specific per-platform module per §C.2 of the canonical design doc. URL detection (`isAmazonReviewPage` + `extractAsinFromReviewUrl` + `urlsMatchByAsin`) + per-row DOM walker against `[data-hook="review"]` selectors + parsers (`parseStarRating` / `parseHelpfulCount` / `parseAmazonReviewDate`) + `findNextPageUrl` + `runAmazonReviewScrape` orchestrator. **Key implementation refinement: `runAmazonReviewScrape` uses `fetch()` + `DOMParser` for pagination** (avoids killing the content-script via full-page navigation — see Pattern memorialization below). Each subsequent platform module (`ebay-review-extractor.ts`, `etsy-review-extractor.ts`, `walmart-review-extractor.ts` per §C.2's eBay/Etsy/Walmart sub-clusters) will follow the same shape — URL detection + per-row DOM walker + per-platform parsers + `findNextPageUrl` + `run<Platform>ReviewScrape` orchestrator composing against `scrape-pagination.ts` + `scrape-progress-indicator.ts`.
- **Right-click context-menu wiring (3 modified files): `background.ts` (+49), `messaging.ts` (+50/-1), `orchestrator.ts` (+96).** New `CONTEXT_MENU_SCRAPE_REVIEWS_ID` entry with title "Scrape reviews for this URL" + `contexts: ['all']` registered in `background.ts`'s context-menu creation handler. New `start-review-scrape` ContentScriptMessage type (payload: `pageUrl` string) in `messaging.ts`. New `create-captured-review` BackgroundRequest type (payload: `projectId` + `urlId` + `body` matching CreateCapturedReview wire shape) in `messaging.ts`. New `start-review-scrape` handler in `orchestrator.ts` adds `savedCompetitorUrlRows` cache (per-URL `id`, `url`, `reviewScrapeCap`, `productName`) populated from the existing URL-list fetch + detects platform via `isAmazonReviewPage()` + matches the trigger `pageUrl` against saved CompetitorUrls by ASIN via `urlsMatchByAsin()` + dispatches to `runAmazonReviewScrape()` with the matched `competitorUrlId` + per-URL `reviewScrapeCap` + AbortSignal; eBay/Etsy/Walmart pages route to a "Platform not yet supported in Session 1 — Amazon ships first per §A.2" toast.
- **Per-extension api-bridge / api-client additions (2 modified files): `api-client.ts` (+24), `api-bridge.ts` (+21).** New `createCapturedReview(projectId, urlId, body)` function calling the existing POST `/api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews` endpoint with the additional `helpfulCount` + `platform` fields. The api-bridge wrapper routes through the background-proxy (content-scripts can't directly fetch cross-origin URLs).

**NEW reusable Pattern: "Content-script pagination via `fetch()` + `DOMParser` avoids the full-page-navigation kill."** (Canonical memorialization lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-26 + `docs/CORRECTIONS_LOG.md` §Entry 2026-05-26 sub-observation (b); this entry references the Pattern as a content-script-architecture-level Pattern alongside P-23 URL-prefix-dispatch.) Trigger: a content-script wants to walk pages 2..N of a paginated review-list whose "Next page" affordance is a regular HTML anchor that would navigate the live tab. Behavior: use `await fetch(nextPageUrl)` + `new DOMParser().parseFromString(html, 'text/html')` to materialize a fully-walkable Document instead of clicking the live anchor. Rationale: long-running multi-page scrape workflows are otherwise impossible in a single content-script lifetime — full-page navigation cycles the content-script's V8 context + destroys closures + breaks the in-flight scrape. Pairs with P-23 URL-prefix-dispatch (§B 2026-05-19-g in this doc) as the second canonical content-script-architecture-level Pattern. P-23 governs *which* per-platform module handles a given URL; today's Pattern governs *how* a per-platform module walks pages 2..N within that platform's review-list.

**NEW reusable Pattern: "Foundation session bundles schema + shared helpers + first per-platform module under one commit."** (Canonical memorialization lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-26 + `docs/CORRECTIONS_LOG.md` §Entry 2026-05-26 sub-observation (c); this entry references the Pattern as the extension-side scaffolding strategy for multi-platform polish arcs.) Trigger: a multi-workstream polish item with a per-platform sub-cluster structure needs its first build session. Behavior: ship ALL of (1) schema migration + (2) shared infrastructure modules (in this case `scrape-pagination.ts` + `scrape-progress-indicator.ts`) + (3) the FIRST per-platform module getting basic end-to-end working under one commit (in this case `amazon-review-extractor.ts`). Rationale: subsequent per-platform sub-cluster Sessions 1's (eBay / Etsy / Walmart) reuse the shared substrate without re-design. Pairs with P-46 W1 Schema-as-foundation Pattern (2026-05-24) as the next-evolution version. Future per-platform sub-cluster Sessions 1's for P-49 W2 are expected to be much smaller (just the platform module + reuse of the shared helpers landed today + maybe additional CAPTCHA selectors for that platform).

**Affected §A sections in this doc (informational — §A stays frozen per Rule 18).**
- **§A.7 (content-script architecture overview) — extended informationally by P-49 W2's per-platform review-scrape gestures.** The existing §A.7 covers v1 content-script architecture (URL-add form via `Add URL` gesture, image-capture via `Capture image to URL`, video-capture via `Capture video to URL` Shadow DOM mount, text-capture via `Capture text to URL`); today's P-49 W2 Amazon Session 1 adds the per-platform review-scrape gesture (`Scrape reviews for this URL` right-click context-menu entry; per-platform module + DOM walker + paginated scrape lifecycle via `scrape-pagination.ts` + Shadow DOM progress indicator via `scrape-progress-indicator.ts`). §A.7 stays frozen per Rule 18; the canonical extension-architecture spec for P-49 W2 lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §C.2.
- **§A.8 (extension shipping pipeline) — UNCHANGED.** Per-platform modules ship via the same monorepo at `extensions/competition-scraping/` + same WXT build pipeline + same Phase 1 unpacked + Phase 2 Chrome Web Store Unlisted distribution. No changes to shipping mechanics from P-49 W2 Session 1.
- **§A.16/A.17 (architectural decisions ledger) — UNCHANGED.** No new architectural decisions today; A.7's content-script architecture covers per-platform review-scrape gestures as additive surfaces; A.15 covers extension distribution (P-49 W2 ships in the existing extension package, not as a separate extension).

**Cross-references:**
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-26 — canonical build-session entry for P-49 W2 Amazon Session 1; future P-49 build-session §B entries land there per Rule 18, NOT in this doc's §B.
- `docs/ROADMAP.md` P-49 status flip from "🟢 DESIGN-FROZEN 2026-05-25-b" to "🟢 IN-FLIGHT 2026-05-26 — Workstream 2 Amazon Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-26" + Amazon Session 1 narrative landed in the Workstream 2 section + (a.93) closes + (a.94) opens.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-26 (P-49 W2 Amazon Session 1 closing entry) — TWO NEW reusable Patterns memorialized + calibration data point + LOW informational sub-observation.
- §B 2026-05-25-b (P-49 Design Session cross-reference pointer) — yesterday's design-session pointer entry; today's build session consumes the design doc that opened.
- §B 2026-05-25 (P-49 Capture Session cross-reference pointer) — the original capture-session pointer entry whose verbatim per-platform DOM specs informed yesterday's design session + today's build session.
- §B 2026-05-24-d (P-47 Shadow DOM mount as structural replacement for the P-45 band-aid) — mount strategy today's `scrape-progress-indicator.ts` reuses.
- §B 2026-05-22-i (P-45 Build #2 — `applyAggressiveEventIsolation` band-aid) — the original event-isolation problem P-47 solved structurally + today's `scrape-progress-indicator.ts` inherits the Shadow DOM mount approach.
- §B 2026-05-19-g (P-23 saved-URL dropdown side-by-side ship) — first content-script-architecture-level Pattern; today's fetch+DOMParser Pattern pairs with it.
- §B 2026-05-23 (P-46 design-session pointer) — second application of the design-doc-split pattern; P-49 (today) is the third application's build-session §B entry pointer.
- §B 2026-05-20-b (P-27 design-session pointer) — first application of the design-doc-split pattern; the lineage Pattern P-49 follows.
- `feedback_recommendation_style.md` (most-thorough/reliable — every implementation decision today followed the design doc + launch prompt's Recommended path).
- `feedback_default_to_recommendation.md` (ZERO Rule 14f pickers fired this session validates the default-to-Recommended posture when upstream specs are unambiguous).
- `feedback_approval_scope_per_decision_unit.md` (2-push build-session pattern: workflow-branch push carrying the build commit + doc-batch ff-merge to main for doc-batch only).

**Closing line:** P-49 W2 Amazon Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-26 on `workflow-2-competition-scraping` via build commit `422436f` (20 files +2069/-7) — first build session of the Reviews Phase 2 implementation arc; foundation session bundling schema + shared content-script infrastructure (`scrape-pagination.ts` + `scrape-progress-indicator.ts`) + Amazon DOM walker (`amazon-review-extractor.ts`) + right-click context-menu wiring under one commit. ZERO Rule 9 deploy gates fired (build commits stay on workflow branch). ZERO Rule 14f forced-pickers fired (design doc + launch prompt unambiguous). Schema-change-in-flight flag flipped NO → YES at `npx prisma db push`. Pre-build + post-build /scoreboard 5/5 GREEN at expected new baselines (611 ext +49 from baseline 562; 786 src/lib UNCHANGED; 62 routes UNCHANGED). NEW baseline locked: extension `npm test` = 611/611. TWO NEW reusable Patterns memorialized (canonical entries in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-26 + `docs/CORRECTIONS_LOG.md` §Entry 2026-05-26): "Content-script pagination via `fetch()` + `DOMParser` avoids the full-page-navigation kill" + "Foundation session bundles schema + shared helpers + first per-platform module under one commit". §A unchanged per Rule 18; this entry is the extension-side architecture cross-reference pointer to the canonical build-session entry in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-26 per the P-23 + P-46 + P-27 design-doc-split precedent. Closes (a.93); opens (a.94) RECOMMENDED-NEXT = P-49 W2 Amazon Session 2 on `workflow-2-competition-scraping`.

---

## §B 2026-05-27 — `session_2026-05-27_p49-w2-amazon-session-2` — P-49 W2 Amazon Session 2 build session lands cross-star navigation loop + helpful-count sort + Customers-say block + Shadow DOM trigger popup atop the Session 1 foundation via build commit `1830074` (5 files +1054/-99); extension-side architecture cross-reference pointer entry per the P-23 + P-46 + Session 1 precedent — canonical build-session §B entry lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27; **NEW Shadow DOM trigger modal as SECOND consumer of the P-47 Pattern after Session 1's progress indicator**

**§A frozen** per Rule 18. This entry is informational + cross-reference pointer from the **extension-side architecture** of P-49 (the canonical build-session entry lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27 per Rule 18). The pointer-entry convention here mirrors §B 2026-05-26 (Session 1) + §B 2026-05-25-b (P-49 design session) + §B 2026-05-23 (P-46 design session) — extension-side architecture changes get a pointer in this doc; the canonical entry lives in the dedicated design doc.

**Session shape: pure CODE session on `workflow-2-competition-scraping` (NO deploys, NO Rule 9 gates fired, EXACTLY ONE Rule 14f forced-picker fired for the Customers-say block storage-shape choice).** Build commit `1830074` (5 files +1054/-99) shipped the cross-star navigation loop + helpful-count sort + Customers-say block + Shadow DOM trigger popup atop the Session 1 foundation. NOT ff-merged to main this session (build session; build commits stay on the workflow branch until the eventual Amazon deploy session ships under Rule 9 gate per (a.95)). **Schema-change-in-flight flag STAYS YES** entire session carrying from Session 1's `npx prisma db push` — no schema work this session; STAYS YES until Amazon deploy session ships migration live on vklf.com.

**Extension-side architecture additions (for future P-49 W2 build sessions to reference + reuse).** Today's build extends the Amazon per-platform module + adds a NEW Shadow DOM trigger modal that future eBay / Etsy / Walmart sub-cluster sessions will reuse:

- **`extensions/competition-scraping/src/lib/content-script/amazon-review-extractor.ts` (+419/-93)** — major refactor. NEW `AMAZON_STAR_FILTERS` const + `AmazonStarFilter` type (one_star..five_star) + NEW `starRatingForFilter` / `buildAmazonStarFilterUrl` / `buildAmazonProductListingUrl` helpers. `runAmazonReviewScrape` refactored from "scrape current view" to **ASIN-driven cross-star loop** (pages 1..N all fetched via fetch+DOMParser — extension of Session 1's pagination Pattern; the cross-star loop visits up to 5 different filter views and only one can be the live DOM, so the loop fetches page 1 too). `AmazonScrapeContext.cap` → `capPerStar`; `AmazonScrapeResult` gains `insertedByStar` + `customersSayInserted`. Captcha + rate-limit abort the whole scrape per §A.15 anti-escalation. NEW `sortByHelpfulCountDesc` helper (stable; null sorts last; pure functional) applied per-star before saveReview. NEW `extractCustomersSayFromListing` helper (4 selector fallbacks for the Amazon AI-summary block). NEW private `scrapeOneStar` + `scrapeCustomersSayBlock` orchestration helpers. `AmazonScrapeSaveInput.source` widened to discriminated union `'extension-scrape' | 'extension-scrape:customers-say'` per the Rule 14f picker outcome.

- **`extensions/competition-scraping/src/lib/content-script/orchestrator.ts` (+59/-37)** — `start-review-scrape` handler refactored to (a) extract ASIN via existing `extractAsinFromReviewUrl` helper from Session 1, (b) fire `openScrapeTriggerModal` BEFORE dispatching to `runAmazonReviewScrape`, (c) build new context shape (`asin` + `capPerStar` from modal output + per-URL `competitorUrlId` from the saved row), (d) saveReview wrapper passes `input.source` through to `createCapturedReview` so both per-reviewer + Customers-say discriminators reach the API correctly. Modal cancel returns silently.

- **NEW `extensions/competition-scraping/src/lib/content-script/scrape-trigger-modal.ts` (320 LOC)** — Shadow DOM-mounted modal with per-star-cap numeric input pre-filled with saved per-URL `reviewScrapeCap` default. **SECOND consumer of the P-47 2026-05-24-d Shadow DOM mount Pattern in the P-49 W2 Amazon scrape flow** (the FIRST was Session 1's `scrape-progress-indicator.ts`; the ORIGINAL was P-47's `video-capture-form.ts` refactor 2026-05-24-d). Open shadow root on a fixed-positioned host `<div>` in `document.body` with high `z-index`. Returns Promise resolving to `{ capPerStar: number }` on Start OR null on Cancel / Escape / backdrop click (canonical modal UX). NEW `clampCap` pure helper exported for unit testing (MIN_CAP=1, MAX_CAP=5000; floors decimals; returns 200 for non-finite). Future per-platform sub-cluster sessions (eBay, Etsy, Walmart) will reuse this SAME modal helper, not re-implement.

- **NEW `extensions/competition-scraping/src/lib/content-script/scrape-trigger-modal.test.ts` (44 LOC)** — 5 new node:test cases for `clampCap`.

- **`extensions/competition-scraping/src/lib/content-script/amazon-review-extractor.test.ts` (+182)** — 17 new node:test cases covering all new helpers.

**TOTAL: 22 new node:test cases. Extension `npm test` baseline NEW: 633/633 (+22 from Session 1 baseline 611).**

**NEW reusable Pattern note: "Cross-star loop's 'fetch page 1 too' refines Session 1's fetch+DOMParser Pattern."** (Canonical memorialization lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27; this entry references the Pattern as a content-script-architecture-level refinement of yesterday's fetch+DOMParser Pattern.) Session 1's `runAmazonReviewScrape` rooted page 1 in the live DOM (the page the user is already on when right-clicking) + walked pages 2..N via fetch+DOMParser. Session 2's cross-star loop visits up to 5 different filter views — only ONE can be the live DOM. The cross-star loop fetches page 1 via fetch+DOMParser TOO, not just pages 2..N. Generalizable observation: **once you've decided to use fetch+DOMParser for any pages in a multi-page scrape, using it uniformly for ALL pages (including page 1) is the most-thorough/reliable choice** — eliminates the live-DOM-vs-fetched-DOM branching in the per-row walker + ensures all rows are extracted from identical Document shapes (no accidental coupling to live-DOM-specific behaviors like CSS-applied styles).

**Customers-say Rule 14f outcome memorialized as informational design-doc note.** EXACTLY ONE Rule 14f forced-picker fired this session — the Customers-say block storage-shape picker that the launch prompt explicitly anticipated. 4 options offered: (A) starRating=5 sentinel + source="extension-scrape:customers-say" — no schema change, no wire-validator change, but lies about rating; (B) Relax wire validator to allow starRating=0 sentinel — cleaner semantic but couples validator to source; (C) Add new `amazonCustomersSayText` column on CompetitorUrl — additive schema change; (D) Defer Customers-say entirely. Director picked Option A (Recommended) — reversible via the existing PATCH route if a future design decision picks a different shape. The discriminator field choice (source vs. new column) was NOT a separate picker — the launch prompt locked the recommended path. **NEW reusable Pattern memorialized in `docs/CORRECTIONS_LOG.md` §Entry 2026-05-27 sub-observation (c): "Pre-emptive design choice rolled into Rule 14f picker"** — when a substantive design choice arises mid-build that wasn't pre-locked, surface it as a picker even if the implementer has a strong default; `feedback_recommendation_style.md`'s most-thorough-and-reliable directive still requires options visibility.

**Affected §A sections in this doc (informational — §A stays frozen per Rule 18).**
- **§A.7 (content-script architecture overview) — extended informationally by P-49 W2's NEW Shadow DOM trigger modal.** The existing §A.7 covers v1 content-script architecture; today's P-49 W2 Amazon Session 2 adds the trigger modal as the SECOND consumer of the P-47 Shadow DOM mount Pattern after Session 1's progress indicator. §A.7 stays frozen per Rule 18; the canonical extension-architecture spec for P-49 W2 lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §C.2 + §A.3.
- **§A.8 (extension shipping pipeline) — UNCHANGED.** No changes to shipping mechanics this session.
- **§A.16/A.17 (architectural decisions ledger) — UNCHANGED.** No new architectural decisions today.

**Cross-references:**
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27 — canonical build-session entry for P-49 W2 Amazon Session 2; future P-49 build-session §B entries land there per Rule 18, NOT in this doc's §B.
- `docs/ROADMAP.md` P-49 status update — Workstream 2 Amazon Sessions 1 + 2 ✅ DONE-AT-CODE-LEVEL on `workflow-2-competition-scraping`; (a.94) closes + (a.95) opens for P-49 W2 Amazon DEPLOY session.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-27 (P-49 W2 Amazon Session 2 closing entry) — TWO NEW reusable Patterns memorialized + LOW informational drift sub-observation + calibration data point.
- §B 2026-05-26 (P-49 W2 Amazon Session 1 cross-reference pointer) — Session 1 first build-session pointer entry in this doc; today's entry is the second in the pair.
- §B 2026-05-25-b (P-49 Design Session cross-reference pointer) — design-session pointer; Sessions 1 + 2 both consume the design doc that opened.
- §B 2026-05-24-d (P-47 Shadow DOM mount as structural replacement for the P-45 band-aid) — mount strategy today's `scrape-trigger-modal.ts` reuses as the SECOND consumer in the P-49 W2 flow after Session 1's `scrape-progress-indicator.ts`.
- §B 2026-05-22-i (P-45 Build #2 — `applyAggressiveEventIsolation` band-aid) — the original event-isolation problem P-47 solved structurally + today's `scrape-trigger-modal.ts` benefits from the same structural fix.
- §B 2026-05-19-g (P-23 saved-URL dropdown side-by-side ship) — first content-script-architecture-level Pattern; today's cross-star loop Pattern pairs with yesterday's fetch+DOMParser Pattern as content-script-architecture-level building blocks.
- `feedback_recommendation_style.md` (most-thorough/reliable — every implementation decision today followed the design doc + launch prompt's Recommended path; the Customers-say Rule 14f picker offered the Recommended Option A director picked).
- `feedback_default_to_recommendation.md` (default to Recommended — director picked Recommended on the one picker that fired; the discriminator-column choice was skipped as a picker since the launch prompt locked it as Recommended).
- `feedback_approval_scope_per_decision_unit.md` (1-push pattern this session per the NEW Pattern memorialized in CORRECTIONS_LOG §Entry 2026-05-27 sub-observation (b)).

**Closing line:** P-49 W2 Amazon Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-27 on `workflow-2-competition-scraping` via build commit `1830074` (5 files +1054/-99) — second build session of the Reviews Phase 2 implementation arc atop the Session 1 foundation; cross-star navigation loop + helpful-count sort within star + `Customers say` AI-summary block capture + Shadow DOM trigger popup with per-URL cap override all shipped at code level under one commit. ZERO Rule 9 deploy gates fired (build session only; build commits stay on workflow branch until Amazon deploy session per (a.95)). EXACTLY ONE Rule 14f forced-picker fired (Customers-say storage-shape — director picked Recommended Option A: starRating=5 sentinel + source="extension-scrape:customers-say" discriminator). Schema-change-in-flight flag STAYS YES carrying from Session 1; STAYS YES until Amazon deploy completion. Pre-build + post-build /scoreboard 5/5 GREEN at expected new baseline (633 ext +22 from Session 1 baseline 611; 786 src/lib UNCHANGED; 62 routes UNCHANGED). NEW baseline locked: extension `npm test` = 633/633. NEW Shadow DOM trigger modal (`scrape-trigger-modal.ts`) is the SECOND consumer of the P-47 Shadow DOM mount Pattern in the P-49 W2 Amazon scrape flow after Session 1's `scrape-progress-indicator.ts` (and the ORIGINAL P-47 consumer was `video-capture-form.ts` refactored 2026-05-24-d). §A unchanged per Rule 18; this entry is the extension-side architecture cross-reference pointer to the canonical build-session entry in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27 per the P-23 + P-46 + Session 1 precedent. Closes (a.94); opens (a.95) RECOMMENDED-NEXT = P-49 W2 Amazon DEPLOY session on `workflow-2-competition-scraping` → `main`.

---

## §B 2026-05-28 — `session_2026-05-28_p49-w2-amazon-deploy-and-fix-forwards` — P-49 W2 Amazon DEPLOY + 4-fix-forward cascade session ships Sessions 1 + 2 + 3 fix-forward commits to production via 4 Rule 9 deploy gates within ONE Phase 4 verification session; final director PASS verdict after FF#4 RESOLVES the Sessions 1 + 2 standing carry-over; extension-side architecture cross-reference pointer entry per the P-23 + P-46 + Sessions 1 + 2 precedent — canonical deploy-session §B entry lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-28; **FF#2 trigger modal extension with 5 star checkboxes makes the trigger modal the THIRD P-47 mount pattern consumer** + **FF#4 pageNumber-increment pagination is the FIRST URL-construction-based pagination Pattern in the extension**

**§A frozen** per Rule 18. This entry is informational + cross-reference pointer from the **extension-side architecture** of P-49 (the canonical deploy-session entry lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-28 per Rule 18). The pointer-entry convention here mirrors §B 2026-05-27 (Session 2) + §B 2026-05-26 (Session 1) + §B 2026-05-25-b (P-49 design session) + §B 2026-05-23 (P-46 design session) — extension-side architecture changes get a pointer in this doc; the canonical entry lives in the dedicated design doc.

**Session shape: DEPLOY + 4-FIX-FORWARD session on `workflow-2-competition-scraping` → `main` (4 Rule 9 deploy gates fired; 9 Rule 14f forced-pickers fired all director-Yes to Recommended).** Initial deploy ff-merge `1914171..0ef8340` carrying 4 commits (Sessions 1 + 2 + intervening doc-batches) under Rule 9 deploy gate #1; Vercel auto-redeploy fired; fresh extension zip `plos-extension-2026-05-28-w2-deploy-37.zip` produced via `npm run zip`; Phase 4 director real-Chrome verification on a real Amazon product page surfaced 4 distinct issues across 2 verification rounds; 3 fix-forward commits shipped under their own Rule 9 deploy gates (FF#1 `8bc2e7e` standalone + FF#2+#3 `b55cdbd` bundled + FF#4 `f6944db` standalone); final director PASS verdict after FF#4. **Schema-change-in-flight flag FLIPPED YES → NO at initial deploy push completion** (canonical schema-change-ships-to-production transition).

**Extension-side architecture additions this session (for future P-49 W2 sub-cluster + W4/W5 build sessions to reference + reuse).** Today's 3 fix-forward commits extend the Amazon per-platform module + the Shadow DOM trigger modal + introduce URL-construction-based pagination:

- **FF#1 `8bc2e7e` — Dispatch over-restriction antipattern fix at the per-platform extractor layer (3 files +190/-16; +18 ext tests).** Session 2's dispatch check `isAmazonReviewPage(url)` was too restrictive given the cross-star refactor (ALL pages fetched via fetch+DOMParser, so the starting page is just an ASIN source). Added `isAmazonProductPage` + `isAmazonScrapableUrl` + `extractAsinFromProductUrl` + `extractAsinFromAmazonUrl` symmetric helpers in `amazon-review-extractor.ts` + updated dispatch at `orchestrator.ts:1163` + extended `urlsMatchByAsin` to accept `/dp/` in first arg. **Future per-platform sub-cluster sessions (eBay / Etsy / Walmart) should adopt the `isXxxScrapableUrl` + `extractAsinFromXxxUrl` symmetric helper Pattern from FF#1 from the start** — each platform's dispatch should accept ALL valid product/listing/review URLs exposing the canonical item identifier (ASIN for Amazon; ItemID for eBay; ListingID for Etsy; ItemID for Walmart). Reduces the likelihood of repeating this antipattern at each platform's first deploy session.

- **FF#2 `b55cdbd` bundled (6 files +274/-8; +4 ext tests) — Trigger modal extension with 5 star checkboxes makes the trigger modal the THIRD P-47 mount pattern consumer in the P-49 W2 Amazon scrape flow.** Session 2's `scrape-trigger-modal.ts` was the SECOND P-47 consumer (after Session 1's `scrape-progress-indicator.ts`); today's FF#2 extended that modal with 5 star checkboxes (pre-checked by default = all stars on) + new `starFilterForRating` helper. The modal's Shadow DOM root host structure is unchanged (still reuses the P-47 2026-05-24-d mount pattern); the additions are purely inside the shadow root (5 new checkbox elements + their click handlers). Future per-platform sub-cluster sessions (eBay / Etsy / Walmart) will reuse this SAME modal helper — the per-star checkbox UI is platform-agnostic since all 4 platforms have per-star filter semantics (Amazon: filterByStar; eBay: maps Neutral→3-star + Negative→1-star; Etsy: per-star percentage filter; Walmart: per-star query-param).

- **FF#3 `b55cdbd` bundled (shipped with FF#2) — Progress indicator per-star breakdown.** The `scrape-progress-indicator.ts` from Session 1 was extended to show per-star breakdown (current star + cumulative count per star + total cumulative) instead of the previous "0 reviews then 46 reviews" messaging. The Shadow DOM root host structure is unchanged; the additions are purely inside the shadow root (additional text spans + a per-star count map). Future per-platform sub-cluster sessions will reuse this SAME progress-indicator helper with the per-star breakdown UI.

- **FF#4 `f6944db` (1 file +23/-10; 0 new tests — integration-level deferred to Playwright per Rule 27) — pageNumber-increment pagination is the FIRST URL-construction-based pagination Pattern in the extension.** Replaced `findNextPageUrl` call in `scrapeOneStar`'s `advanceToNextPage` with direct pageNumber increment via `buildAmazonStarFilterUrl(asin, filter, N+1)`; stop signal = fetched page has 0 reviews. Doesn't depend on Amazon's UI; works regardless of numbered links / Show-more button / AJAX. **Per-platform extractor design should prefer URL-construction-based navigation primitives wherever the platform exposes a stable URL parameter contract** — Amazon, eBay, Etsy, Walmart all expose stable URL-parameter pagination contracts. Future per-platform sub-cluster sessions should adopt URL-construction pagination from the start, not DOM-link-scraping.

**TOTAL: 22 new node:test cases across all 3 fix-forwards. Extension `npm test` baseline NEW: 655/655 (+22 from Session 2 baseline 633; +18 FF#1 + 4 FF#2+#3 + 0 FF#4).**

**NEW reusable Pattern note: "Phase 4 verification fix-forward cascade scales beyond N=5 when each issue is scoped + reversible + UI-only."** (Canonical memorialization lives in `docs/CORRECTIONS_LOG.md` §Entry 2026-05-28 sub-observation (b); this entry references the Pattern as a deploy-session-level extension-architecture Pattern.) Today shipped 4 fix-forwards (3 commits since FF#2+FF#3 bundled) under separate Rule 9 deploy gates within ONE Phase 4 verification session. Pairs with + extends the P-46 W3 2026-05-24-f "Phase-4 verification fix-forward cascade in a single deploy session" Pattern. Future P-49 W2 sub-cluster deploy sessions (eBay / Etsy / Walmart) should expect 1-5 fix-forwards within the same deploy session as the canonical pattern.

**Affected §A sections in this doc (informational — §A stays frozen per Rule 18).**
- **§A.7 (content-script architecture overview) — extended informationally by P-49 W2's FF#2 trigger modal extension with 5 star checkboxes.** The existing §A.7 covers v1 content-script architecture; today's FF#2 makes the trigger modal the THIRD consumer of the P-47 Shadow DOM mount Pattern (after Sessions 1's progress indicator + Session 2's trigger modal baseline). §A.7 stays frozen per Rule 18; the canonical extension-architecture spec for P-49 W2 lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §C.2 + §A.3.
- **§A.8 (extension shipping pipeline) — UNCHANGED.** No changes to shipping mechanics this session (the `npm run zip` workflow handled the 4 fresh zips identically).
- **§A.16/A.17 (architectural decisions ledger) — UNCHANGED.** No new architectural decisions today (the 3 NEW reusable Patterns memorialized are session-level Patterns memorialized in CORRECTIONS_LOG §Entry 2026-05-28; they inform future session shapes but don't lock new architectural decisions on §A.16/A.17).

**Cross-references:**
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-28 — canonical deploy-session entry for P-49 W2 Amazon DEPLOY + 4-fix-forward cascade; future P-49 build/deploy-session §B entries land there per Rule 18, NOT in this doc's §B.
- `docs/ROADMAP.md` P-49 status update — Workstream 2 Amazon ✅ DEPLOYED-AND-VERIFIED 2026-05-28 narrative; (a.95) closes + (a.96) opens for P-49 W4 Captured Reviews UI extensions Session 1.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-28 (P-49 W2 Amazon DEPLOY + 4-fix-forward cascade closing entry) — THREE NEW reusable Patterns memorialized canonically + LOW informational P-43 cwd-leak Pattern Class reproduction + calibration data point.
- §B 2026-05-27 (P-49 W2 Amazon Session 2 cross-reference pointer) — Session 2 build cluster (cross-star + Customers-say + trigger modal); today's deploy ships Session 2 + 3 fix-forwards.
- §B 2026-05-26 (P-49 W2 Amazon Session 1 cross-reference pointer) — Session 1 foundation (schema + shared infra + Amazon DOM walker); today's deploy ships Session 1 too.
- §B 2026-05-25-b (P-49 Design Session cross-reference pointer) — design-session pointer; Sessions 1 + 2 + today's deploy all consume the design doc that opened.
- §B 2026-05-24-d (P-47 Shadow DOM mount as structural replacement for the P-45 band-aid) — mount strategy today's FF#2 trigger modal extension reuses as the THIRD consumer in the P-49 W2 flow after Sessions 1 + 2's progress indicator + trigger modal.
- §B 2026-05-22-i (P-45 Build #2 — `applyAggressiveEventIsolation` band-aid) — the original event-isolation problem P-47 solved structurally + today's FF#2 trigger modal extension benefits from the same structural fix.
- §B 2026-05-19-g (P-23 saved-URL dropdown side-by-side ship) — first content-script-architecture-level Pattern; today's FF#1 symmetric-helper Pattern + FF#4 URL-construction pagination Pattern pair with the cross-star loop Pattern + the fetch+DOMParser Pattern as content-script-architecture-level building blocks.
- `feedback_recommendation_style.md` (most-thorough/reliable — every Rule 14f picker today framed Recommended; 9/9 director-Yes).
- `feedback_default_to_recommendation.md` (default-to-Recommended — 9/9 = 100% calibration data point reinforces).
- `feedback_playwright_for_repeatable_walkthroughs.md` (Phase 4 mode picker fired at the 5+ step manual walkthrough decision point per the directive; director picked Manual walkthrough Recommended).
- `feedback_approval_scope_per_decision_unit.md` (~10 pushes this session within the deploy-session push pattern; deploys + ping-pongs grouped under their respective Rule 9 gates without separate approval for each push).

**Closing line:** P-49 W2 Amazon DEPLOY + 4-fix-forward cascade session ✅ DONE 2026-05-28 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — first production deploy of the Reviews Phase 2 implementation arc. 4 Rule 9 deploy gates fired (initial + FF#1 + FF#2+#3 + FF#4). 9 Rule 14f forced-pickers fired, all director-Yes to Recommended (9/9 = 100% calibration). Schema-change-in-flight flag FLIPPED YES → NO at initial deploy push completion. NEW baseline locked: extension `npm test` = 655/655 (+22 cumulative from 633 entry baseline). 4 fresh extension zips at repo root. Final director PASS verdict after FF#4 RESOLVES the Sessions 1 + 2 standing carry-over. FF#2 trigger modal extension with 5 star checkboxes makes the trigger modal the THIRD P-47 mount pattern consumer. FF#4 pageNumber-increment pagination is the FIRST URL-construction-based pagination Pattern in the extension. §A unchanged per Rule 18; this entry is the extension-side architecture cross-reference pointer to the canonical deploy-session entry in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-28 per the P-23 + P-46 + Sessions 1 + 2 precedent. Closes (a.95); opens (a.96) RECOMMENDED-NEXT = P-49 W4 Captured Reviews UI extensions Session 1 on `workflow-2-competition-scraping`.

---

## §B 2026-05-30 — `session_2026-05-30_p49-w2-ebay-sub-cluster-session-1` — P-49 W2 eBay sub-cluster DEPLOY + 5-fix-forward cascade session ships Session 1 build commit + 5 fix-forward commits to production via 5 Rule 9 deploy gates within ONE Phase 4 verification session; final director PASS verdict after FF#5 RESOLVES the eBay sub-cluster end-to-end on vklf.com; extension-side architecture cross-reference pointer entry per the P-23 + P-46 + W2 Amazon precedent — canonical deploy-session §B entry lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-30; **FF#5 `extractSellerFromListingHtml` regex against the `"sellerUserName":"<value>"` JSON data island + `[role=tabpanel]:not([hidden])` walker scope = THREE NEW reusable Patterns memorialized that apply directly to future Etsy + Walmart sub-cluster sessions**

**§A frozen** per Rule 18. This entry is informational + cross-reference pointer from the **extension-side architecture** of P-49 W2 eBay sub-cluster (the canonical deploy-session entry lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-30 per Rule 18). The pointer-entry convention here mirrors §B 2026-05-28 (W2 Amazon DEPLOY) + §B 2026-05-27 (W2 Amazon Session 2) + §B 2026-05-26 (W2 Amazon Session 1) + §B 2026-05-25-b (P-49 design session) + §B 2026-05-23 (P-46 design session) — extension-side architecture changes get a pointer in this doc; the canonical entry lives in the dedicated design doc.

**Session shape: BUILD + DEPLOY + 5-FIX-FORWARD session on `workflow-2-competition-scraping` → `main` (5 Rule 9 deploy gates fired; 3 Rule 14f forced-pickers fired all director-Yes-to-Recommended).** Build commit `11e99e1` (3 files +1535/-99 — NEW `ebay-review-extractor.ts` ~390 LOC per-platform module + NEW `ebay-review-extractor.test.ts` ~470 LOC + 64 new node:test cases + MODIFY `orchestrator.ts` eBay dispatch) ff-merged to main under Rule 9 gate #1; Vercel auto-redeploy fired; fresh extension zip `plos-extension-2026-05-30-w2-ebay-deploy-1.zip` produced via `npm run zip`; Phase 4 director real-Chrome verification surfaced TWO co-occurring bugs (seller auto-detect failing + This Item filter returning All Items rows) that survived 3 speculative fix-forwards (FF#1+#2 bundled `23b6221` + FF#3 `c19f187`) before Rule 14f mid-Phase-4 picker rerouted to **diagnostic-instrumentation FF#4 `6675963`** (TEMPORARY HTML-dump + console.log probes; director uploaded 3 HTML files + console output) → **FF#5 `23aa851` empirically-verified fix — the WIN** (3 files +176/-135; +8 ext tests; `extractSellerFromListingHtml` regex against `"sellerUserName"` JSON data island + `[role=tabpanel]:not([hidden])` walker scope + remove FF#4 instrumentation); director Phase 4 PASS verdict "Everything worked perfectly". **Schema-change-in-flight flag STAYS NO entire session** (eBay reuses the schema W2 Amazon shipped 2026-05-28; no `prisma db push`; no API contract changes; new platform discriminator `'ebay'` already accepted by the `CapturedReview.platform String?` column from W2 Session 1).

**Extension-side architecture additions this session (for future P-49 W2 sub-cluster + W5 build sessions to reference + reuse).** Today's build commit + 5 fix-forward commits extend the per-platform module Pattern (now the SECOND consumer after the canonical Amazon module from W2 Session 1) + introduce three NEW content-script-architecture-level Patterns directly applicable to future Etsy + Walmart sub-clusters:

- **Build commit `11e99e1` — eBay per-platform module is the SECOND consumer of the W2 Amazon per-platform module Pattern.** The `ebay-review-extractor.ts` mirrors the canonical Amazon Patterns: FF#1 symmetric helper Pattern (`isEbayScrapableUrl` + `extractItemIdFromEbayUrl` + symmetric URL-detection matrix) adopted from the start (not as a fix-forward as in Amazon's case) + FF#4 URL-construction-based pagination Pattern (`buildEbayFeedbackUrl(itemId, seller, feedbackType, pageNumber)` direct URL construction with stop signal = fetched page has 0 reviews; doesn't depend on the platform's UI for pagination) + Session 2's cross-filter loop Pattern adapted for eBay's Neutral → 3-star + Negative → 1-star feedback type mapping per §A.2 spec + Shadow DOM trigger modal + scrape-pagination + scrape-progress-indicator all reused from W2 Sessions 1 + 2 without modification. **Future eBay-adjacent platforms (Etsy + Walmart) should adopt this per-platform module Pattern from the start** — each platform's per-platform module file under `extensions/competition-scraping/src/lib/content-script/<platform>-review-extractor.ts` + symmetric URL-detection helpers + URL-construction-based pagination + cross-filter loop structure + reuse of shared infrastructure modules (`scrape-pagination.ts` + `scrape-progress-indicator.ts` + `scrape-trigger-modal.ts`) all in place — the Etsy + Walmart Session 1 build sessions should be small surgical additions following this template.

- **FF#5 `23aa851` — Pattern memorialization #1: "Tabpanel-scoped DOM walking — `[role=tabpanel]:not([hidden])` to avoid capturing rows from inactive tabs".** Confirmed today by eBay's feedback page rendering BOTH the This Item + All Items tabpanels in the same HTML with the All Items panel carrying the `hidden` attribute. The fix is a one-line walker-scope addition: `(doc.querySelector('[role="tabpanel"]:not([hidden])') ?? doc)` — try the active tabpanel first, fall through to whole-doc scope as a classic-view safety net. **Generalizes beyond eBay to any tabbed-content scraping surface in the extension** — Amazon's tabbed review-filter UI, Etsy's per-star filter overlay, Walmart's review aggregator tabs all potentially exhibit this pattern. Future per-platform module sessions should adopt this walker-scope Pattern proactively if the platform's HTML uses tabbed UI.

- **FF#5 `23aa851` — Pattern memorialization #2: "JSON data-island extraction for server-rendered seller/product metadata".** Modern site listing pages frequently embed JSON blobs containing canonical seller/product fields (`"sellerUserName":"<value>"` on eBay; likely similar shapes on Etsy + Walmart for seller-name / listing-name / category metadata). **Regex extraction against raw HTML is more robust than DOM-link probing when the visible UI renders the same data via React buttons/spans rather than `<a href="...">`.** Today's eBay listing pages did NOT render `/usr/<seller>` links anywhere in the visible DOM; the seller name was rendered via a React component reading from the JSON data island. The fix is a simple regex against the raw HTML string (not the parsed Document) — `/"sellerUserName":\s*"([^"]+)"/` extracts the value reliably; the legacy DOM-link walker stays as a classic-view fallback. **Applies to future Etsy + Walmart sub-cluster sessions** — adopt the JSON data-island extraction Pattern from the start for any platform-canonical seller/listing/product metadata; preserve DOM-link walker as a classic-view fallback.

- **FF#4 `6675963` + FF#5 `23aa851` — Pattern memorialization #3: "Diagnostic-instrumentation FF as escape valve from speculative-FF antipattern".** When 2+ consecutive speculative fix-forwards BUSTED, ALWAYS fire a Rule 14f picker offering (A) Diagnostic instrumentation [Recommended — dump fetched artifacts to director's Downloads + console.log selector probes; director uploads → empirical evidence → next FF is correct] vs (B) Defer to next session [PARTIAL deploy + capture in NEXT_SESSION.md]; don't ship a 3rd speculative FF. Today validated this — FF#5 with empirical evidence solved BOTH bugs in one shot after 3 speculative FFs (FF#1+#2 bundled + FF#3) all guessed wrong on the same surface area. **Pairs with + extends the 2026-05-25 P-48 Session 1 "ffprobe-first / empirical-first diagnostic" Pattern at the deploy-session-cascade level** — the ffprobe-first Pattern says "inspect the actual production artifacts BEFORE drafting Session 2 fix scope"; today's Pattern says "inspect the actual fetched artifacts BEFORE shipping the Nth speculative FF in a deploy cascade". Future P-49 W2 sub-cluster deploy sessions (Etsy + Walmart) should expect the diagnostic-instrumentation FF as a normal escape valve when speculative FFs stack up.

**TOTAL: 76 new node:test cases cumulative across build commit + 5 fix-forwards (64 Session 1 module + 4 FF#1+#2 seller-text-input + 0 FF#3 + 0 FF#4 diagnostic + 8 FF#5 sellerFromListingHtml + tabpanel-scoping). Extension `npm test` baseline NEW: 731/731 (+76 from entry baseline 655).**

**NEW reusable Pattern note: "Phase 4 verification fix-forward cascade scales to N=5 (was N=4 at 2026-05-28 Amazon DEPLOY, was N=5 at the original P-46 W3 2026-05-24-f precedent)."** (Canonical memorialization lives in `docs/CORRECTIONS_LOG.md` §Entry 2026-05-30 sub-observation (a) + sub-observation references; this entry references the Pattern as a deploy-session-level extension-architecture Pattern.) Today shipped 5 fix-forwards under separate Rule 9 deploy gates within ONE Phase 4 verification session — stretches the 2026-05-28 Amazon DEPLOY's 4-FF count by one further. Pairs with + extends the P-46 W3 2026-05-24-f + the 2026-05-28 Amazon DEPLOY 4-FF + the diagnostic-instrumentation FF Pattern as the canonical N=5 model. Future P-49 W2 sub-cluster deploy sessions (Etsy / Walmart) should expect 1-5 fix-forwards within the same deploy session as the canonical pattern.

**Affected §A sections in this doc (informational — §A stays frozen per Rule 18).**
- **§A.7 (content-script architecture overview) — extended informationally by today's eBay per-platform module being the SECOND per-platform module in the extension after Amazon.** The existing §A.7 covers v1 content-script architecture; today's eBay module follows the same Pattern Amazon established at 2026-05-26 + 2026-05-27 + 2026-05-28; future Etsy + Walmart modules should slot in identically. §A.7 stays frozen per Rule 18; the canonical extension-architecture spec for P-49 W2 lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §C.2 + §A.3.
- **§A.8 (extension shipping pipeline) — UNCHANGED.** No changes to shipping mechanics this session (the `npm run zip` workflow handled the 4 fresh zips identically).
- **§A.16/A.17 (architectural decisions ledger) — UNCHANGED.** No new architectural decisions today (the 3 NEW reusable Patterns memorialized are session-level Patterns memorialized in CORRECTIONS_LOG §Entry 2026-05-30; they inform future session shapes but don't lock new architectural decisions on §A.16/A.17).

**Cross-references:**
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-30 — canonical deploy-session entry for P-49 W2 eBay DEPLOY + 5-fix-forward cascade; future P-49 build/deploy-session §B entries land there per Rule 18, NOT in this doc's §B.
- `docs/ROADMAP.md` P-49 status update — Workstream 2 eBay sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-30 narrative; (a.98) closes + (a.99) opens for P-49 W2 Etsy sub-cluster Session 1.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-30 (P-49 W2 eBay DEPLOY + 5-fix-forward cascade closing entry) — THREE NEW reusable Patterns memorialized canonically + 3 LOW informational sub-observations.
- §B 2026-05-28 (P-49 W2 Amazon DEPLOY + 4-fix-forward cascade cross-reference pointer) — today's eBay sub-cluster directly reuses the Amazon Patterns from this entry (FF#1 symmetric helpers + FF#4 URL-construction pagination + the 4-fix-forward cascade Pattern that today's 5-fix-forward cascade extends).
- §B 2026-05-27 (P-49 W2 Amazon Session 2 cross-reference pointer) — Shadow DOM trigger modal Pattern + cross-star/cross-filter loop Pattern reused today.
- §B 2026-05-26 (P-49 W2 Amazon Session 1 cross-reference pointer) — shared infrastructure (scrape-pagination + scrape-progress-indicator + scrape-trigger-modal) + the foundation-session-bundle-substrate Pattern reused today.
- §B 2026-05-25-b (P-49 Design Session cross-reference pointer) — design-session pointer; today's deploy consumes §A.2 (per-platform priority order + eBay-specific spec) + §A.3 (Shadow DOM mounts) + §A.4 (per-URL cap override) + §A.13 (platform discriminator) + §A.15 (anti-bot defaults) + §A.16 (no new API routes).
- §B 2026-05-24-d (P-47 Shadow DOM mount as structural replacement for the P-45 band-aid) — mount strategy today's eBay trigger modal reuses (the trigger modal was the SECOND P-47 consumer at W2 Session 2; eBay just dispatches into the existing modal — no new mount).
- §B 2026-05-19-g (P-23 saved-URL dropdown side-by-side ship) — first content-script-architecture-level Pattern; today's three NEW Patterns (tabpanel-scoped DOM walking + JSON data-island extraction + diagnostic-instrumentation FF as escape valve) pair with the cross-star loop Pattern + the fetch+DOMParser Pattern + the symmetric-helper Pattern + the URL-construction pagination Pattern as content-script-architecture-level building blocks.
- `feedback_recommendation_style.md` (most-thorough/reliable — every Rule 14f picker today framed Recommended; 3/3 director-Yes to Recommended = 100%).
- `feedback_default_to_recommendation.md` (default-to-Recommended — 3/3 = 100% calibration data point pairs with 2026-05-28's 9/9 = 100% as the second 100% session this week).
- `feedback_playwright_for_repeatable_walkthroughs.md` (Phase 4 mode picker fired at the 5+ step manual walkthrough decision point per the directive; director picked Manual walkthrough Recommended).
- `feedback_approval_scope_per_decision_unit.md` (~12 pushes this session within the deploy-session push pattern; 5 deploys + 5 ping-pongs grouped under their respective Rule 9 gates + end-of-session post-deploy doc-batch push + ff-merge push).

**Closing line:** P-49 W2 eBay sub-cluster DEPLOY + 5-fix-forward cascade session ✅ DONE 2026-05-30 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — first deploy session of the W2 eBay sub-cluster (second per-platform sub-cluster after Amazon). 5 Rule 9 deploy gates fired (build deploy + FF#1+#2 bundled + FF#3 + FF#4 diagnostic + FF#5 fix). 3 Rule 14f forced-pickers fired, all director-Yes to Recommended (3/3 = 100% calibration). Schema-change-in-flight flag STAYS NO entire session. NEW baseline locked: extension `npm test` = 731/731 (+76 cumulative from 655 entry baseline). 4 fresh extension zips at repo root. Final director PASS verdict on FF#5 "Everything worked perfectly" RESOLVES the eBay sub-cluster end-to-end. THREE NEW reusable Patterns memorialized that apply directly to future Etsy + Walmart sub-cluster sessions: "Diagnostic-instrumentation FF as escape valve from speculative-FF antipattern" + "Tabpanel-scoped DOM walking via `[role=tabpanel]:not([hidden])`" + "JSON data-island extraction for server-rendered seller/product metadata". §A unchanged per Rule 18; this entry is the extension-side architecture cross-reference pointer to the canonical deploy-session entry in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-30 per the P-23 + P-46 + W2 Amazon precedent. Closes (a.98); opens (a.99) RECOMMENDED-NEXT = P-49 W2 Etsy sub-cluster Session 1 on `workflow-2-competition-scraping`.

## §B 2026-05-31 — `session_2026-05-31_p49-w2-etsy-sub-cluster-session-1` — P-49 W2 Etsy sub-cluster DEPLOY + 3-fix-forward cascade session ships Session 1 build commit + 3 fix-forward commits to production via 4 Rule 9 deploy gates within ONE Phase 4 verification session; final director PASS verdict after FF#3 RESOLVES the Etsy sub-cluster end-to-end on vklf.com; extension-side architecture cross-reference pointer entry per the P-23 + P-46 + W2 Amazon + eBay precedent — canonical deploy-session §B entry lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-31; **FF#1 architecture pivot from URL-construction to live-DOM driver + FF#3 `findOverlayContainer` restriction to `.deep-dive-sheet` only + reject hidden variants = THREE NEW reusable Patterns memorialized: "Diagnostic-instrumentation FF Pattern reusability validated across consecutive sessions" + "Over-broad fallback selectors in platform DOM-walkers should be DELETED, not added" + "AJAX-loaded overlay scraping requires live-DOM driver, not URL-construction"; second consecutive per-platform DEPLOY entry to reuse the Diagnostic-instrumentation FF Pattern (eBay was first 2026-05-30; Etsy is second 2026-05-31)**

**§A frozen** per Rule 18. This entry is informational + cross-reference pointer from the **extension-side architecture** of P-49 W2 Etsy sub-cluster (the canonical deploy-session entry lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-31 per Rule 18). The pointer-entry convention here mirrors §B 2026-05-30 (W2 eBay DEPLOY) + §B 2026-05-28 (W2 Amazon DEPLOY) + §B 2026-05-27 (W2 Amazon Session 2) + §B 2026-05-26 (W2 Amazon Session 1) + §B 2026-05-25-b (P-49 design session) + §B 2026-05-23 (P-46 design session) — extension-side architecture changes get a pointer in this doc; the canonical entry lives in the dedicated design doc.

**Session shape: BUILD + DEPLOY + 3-FIX-FORWARD session on `workflow-2-competition-scraping` → `main` (4 Rule 9 deploy gates fired; 8 Rule 14f forced-pickers fired all director-Yes-to-Recommended).** Build commit `c572a42` (3 files +1509/-3 — NEW `etsy-review-extractor.ts` ~565 LOC initial URL-construction approach + NEW `etsy-review-extractor.test.ts` ~580 LOC + 72 new node:test cases + MODIFY `orchestrator.ts` Etsy dispatch) ff-merged to main under Rule 9 gate #1; Vercel auto-redeploy fired; fresh extension zip `plos-extension-2026-05-31-w2-etsy-deploy-1.zip` produced via `npm run zip`; Phase 4 director real-Chrome verification surfaced that the URL-construction approach was BUSTED — Etsy's "View all reviews for this item" overlay loads via AJAX on the same listing URL with no separate URL for filters or pagination. Architecture pivot via **FF#1 `67aeacd`** (2 files +1058/-705) rewrote `etsy-review-extractor.ts` from URL-construction to live-DOM driver based on director's paste of the 41 KB overlay outerHTML; FF#1 BUSTED silently → Rule 14f mid-Phase-4 picker rerouted to **diagnostic-instrumentation FF#2 `a3107b6`** (1 file +163/-2; TEMPORARY `[PLOS ETSY DIAGNOSTIC]` console.log at every step + auto-download of overlay HTML; reused yesterday's eBay FF#4 Pattern) → **FF#3 `41b03c5` empirical fix — the WIN** (2 files +73/-190; restrict `findOverlayContainer` to `.deep-dive-sheet` only + reject hidden variants `aria-hidden`, `wt-display-none`, `hidden` attribute + remove FF#2 instrumentation); director Phase 4 PASS verdict "Everything worked perfectly this time" (identical phrasing to yesterday's eBay FF#5 PASS). **Schema-change-in-flight flag STAYS NO entire session** (Etsy reuses the schema W2 Amazon shipped 2026-05-28; no `prisma db push`; no API contract changes; `'etsy'` discriminator already accepted by the `CapturedReview.platform String?` column from W2 Session 1).

**Extension-side architecture additions this session (for future P-49 W2 Walmart sub-cluster + W5 build sessions to reference + reuse).** Today's build commit + 3 fix-forward commits extend the per-platform module Pattern (now the THIRD consumer after Amazon + eBay) + introduce three NEW content-script-architecture-level Patterns directly applicable to the future Walmart sub-cluster:

- **Build commit `c572a42` — Etsy per-platform module is the THIRD consumer of the W2 per-platform module Pattern.** The initial `etsy-review-extractor.ts` followed the canonical Amazon + eBay Patterns (FF#1 symmetric helpers + FF#4 URL-construction-based pagination + cross-filter loop + Shadow DOM trigger modal reuse). **However, Phase 4 empirically falsified the URL-construction assumption for Etsy specifically** — Etsy's "View all reviews for this item" overlay loads via AJAX on the same listing URL with no separate URL for filters or pagination. The architecture pivot via FF#1 to live-DOM driver represents a NEW per-platform module sub-pattern alongside the URL-construction sub-pattern (Amazon + eBay + Walmart use URL-construction; Etsy uses live-DOM driver). **Future Walmart sub-cluster should use URL-construction per the director-verbatim spec** (separate URLs `/reviews/product/<ID>?ratings=N` for per-star filters with multi-star via repeated `&ratings=M` params).

- **FF#1 `67aeacd` — Pattern memorialization #1: "Diagnostic-instrumentation FF Pattern reusability validated across consecutive sessions".** Yesterday's eBay session memorialized the Diagnostic-instrumentation FF Pattern (eBay FF#4 = diagnostic + eBay FF#5 = empirical fix). Today's Etsy session reused the Pattern identically (Etsy FF#2 = diagnostic + Etsy FF#3 = empirical fix). Same outcome shape twice in a row across different platforms + different root causes (eBay: JSON data-island + tabpanel-scoping bugs; Etsy: over-broad findOverlayContainer fallback selector matching hidden non-deep-dive dialogs). **Pattern is now empirically validated as a repeatable success Pattern for the per-platform sub-cluster deploy session shape.** Future Walmart sub-cluster + future W3-W14 workstreams that need platform-DOM diagnostics should adopt this Pattern from the start.

- **FF#3 `41b03c5` — Pattern memorialization #2: "Over-broad fallback selectors in platform DOM-walkers should be DELETED, not added".** FF#1 BUSTED because the `[aria-modal="true"][role="dialog"]` fallback selector in `findOverlayContainer` matched Etsy's hidden `#customer-photo-overlay-carousel` (review-photo lightbox; pre-rendered in DOM with `aria-hidden="true"` + `wt-display-none` class but present at page load). Defensive coding instinct said "add more fallbacks for resilience" but the empirical failure mode was the OPPOSITE — too many fallbacks let the wrong element through. **Lesson: prefer a single canonical-class selector + a hidden-state filter over multiple progressively-broader fallbacks.** Generalizes to all 4 platform extractors: each `findXxxContainer` helper should use the platform-canonical class + reject hidden variants (aria-hidden, wt-display-none, hidden attribute), not fall back to bare role/modal selectors. **Applies directly to W2 Walmart Session 1** — if `findWalmartContainer` exists, it should follow this pattern from the start.

- **FF#1 + FF#3 `41b03c5` — Pattern memorialization #3: "AJAX-loaded overlay scraping requires live-DOM driver, not URL-construction".** Etsy's "View all reviews for this item" overlay loads via AJAX on the same listing URL (no separate URL exists for the overlay OR for per-star filters OR for pagination). The Amazon + eBay URL-construction Pattern doesn't apply. Etsy required architecture pivot to live-DOM driver: click trigger → wait for overlay → click histogram filter → wait for content swap → walk rows → click pagination Next → wait → repeat. **Generalizes to W2 Walmart sub-cluster:** investigate Walmart's URL contract FIRST (the director-verbatim spec says `/reviews/product/<ID>?ratings=N` separate URLs — so URL-construction applies, NOT live-DOM driver like Etsy). But future per-platform sub-clusters where the platform uses AJAX overlays will need the live-DOM driver Pattern. Recommendation for FUTURE: build a small URL-contract-vs-AJAX detection helper at design-session time per platform so the architecture choice is locked before Session 1 begins.

**TOTAL: 87 new node:test cases cumulative across build commit + 3 fix-forwards (72 build module + 12 FF#1 live-DOM driver + 0 net FF#2 diagnostic + 3 net FF#3 hidden-variant rejection). Extension `npm test` baseline NEW: 818/818 (+87 from entry baseline 731).**

**NEW reusable Pattern note: "Phase 4 verification fix-forward cascade — 3 fix-forwards this session vs 5 yesterday + 4 two days ago = the Diagnostic-instrumentation FF Pattern is REDUCING the count of speculative FFs as it matures."** (Canonical memorialization lives in `docs/CORRECTIONS_LOG.md` §Entry 2026-05-31 sub-observation references; this entry references the Pattern as a deploy-session-level extension-architecture Pattern.) Today shipped only 3 fix-forwards under separate Rule 9 deploy gates within ONE Phase 4 verification session — one fewer than yesterday's eBay 5-FF count. The mid-Phase-4 picker rerouted to diagnostic-instrumentation FF EARLIER in the cascade today (after FF#1 BUSTED vs yesterday's after FF#3 BUSTED), preventing 2 additional speculative FFs from shipping. **Future P-49 W2 Walmart sub-cluster session should expect 0-3 fix-forwards within the same deploy session — the Diagnostic-instrumentation FF as the canonical escape valve when speculative FFs stack up; 1-calendar-day cadence preserved across all per-platform sub-clusters.**

**Affected §A sections in this doc (informational — §A stays frozen per Rule 18).**
- **§A.7 (content-script architecture overview) — extended informationally by today's Etsy per-platform module being the THIRD per-platform module in the extension after Amazon + eBay.** Today's Etsy module follows the same Pattern Amazon established at 2026-05-26 + 2026-05-27 + 2026-05-28 + eBay at 2026-05-30; future Walmart module should slot in identically (URL-construction sub-pattern per Walmart's spec). §A.7 stays frozen per Rule 18; the canonical extension-architecture spec for P-49 W2 lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §C.2 + §A.3.
- **§A.8 (extension shipping pipeline) — UNCHANGED.** No changes to shipping mechanics this session (the `npm run zip` workflow handled the 4 fresh zips identically).
- **§A.16/A.17 (architectural decisions ledger) — UNCHANGED.** No new architectural decisions today (the 3 NEW reusable Patterns memorialized are session-level Patterns memorialized in CORRECTIONS_LOG §Entry 2026-05-31; they inform future session shapes but don't lock new architectural decisions on §A.16/A.17).

**Cross-references:**
- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-31 — canonical deploy-session entry for P-49 W2 Etsy DEPLOY + 3-fix-forward cascade; future P-49 build/deploy-session §B entries land there per Rule 18, NOT in this doc's §B.
- `docs/ROADMAP.md` P-49 status update — Workstream 2 Etsy sub-cluster ✅ DEPLOYED-AND-VERIFIED 2026-05-31 narrative; (a.99) closes + (a.100) opens for P-49 W2 Walmart sub-cluster Session 1.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-31 (P-49 W2 Etsy DEPLOY + 3-fix-forward cascade closing entry) — THREE NEW reusable Patterns memorialized canonically + 3 LOW informational sub-observations.
- §B 2026-05-30 (P-49 W2 eBay DEPLOY + 5-fix-forward cascade cross-reference pointer) — predecessor entry capturing the Diagnostic-instrumentation FF Pattern that today's Etsy session reused identically + the canonical N=5 cascade count that today's N=3 cascade reduces.
- §B 2026-05-28 (P-49 W2 Amazon DEPLOY + 4-fix-forward cascade cross-reference pointer) — predecessor entry capturing the W2 Amazon Patterns; today's Etsy session attempted to reuse the URL-construction Pattern (FF#4 from this entry) but empirically falsified the assumption for Etsy's AJAX-overlay architecture.
- §B 2026-05-27 (P-49 W2 Amazon Session 2 cross-reference pointer) — Shadow DOM trigger modal Pattern + cross-star/cross-filter loop Pattern reused today (trigger modal unchanged; cross-filter loop applied to 3-star/2-star/1-star per §A.2).
- §B 2026-05-26 (P-49 W2 Amazon Session 1 cross-reference pointer) — shared infrastructure (scrape-pagination + scrape-progress-indicator + scrape-trigger-modal) + the foundation-session-bundle-substrate Pattern reused today.
- §B 2026-05-25-b (P-49 Design Session cross-reference pointer) — design-session pointer; today's deploy consumes §A.2 (per-platform priority order + Etsy-specific spec) + §A.3 (Shadow DOM mounts) + §A.4 (per-URL cap override) + §A.13 (platform discriminator) + §A.15 (anti-bot defaults) + §A.16 (no new API routes).
- §B 2026-05-24-d (P-47 Shadow DOM mount as structural replacement for the P-45 band-aid) — mount strategy today's Etsy module dispatches into the existing modal (no new mount).
- §B 2026-05-19-g (P-23 saved-URL dropdown side-by-side ship) — first content-script-architecture-level Pattern; today's three NEW Patterns pair with the cross-star loop Pattern + the fetch+DOMParser Pattern + the symmetric-helper Pattern + the URL-construction pagination Pattern + the JSON data-island extraction Pattern + the tabpanel-scoped walker Pattern as content-script-architecture-level building blocks.
- `feedback_recommendation_style.md` (most-thorough/reliable — every Rule 14f picker today framed Recommended; 8/8 director-Yes to Recommended = 100%).
- `feedback_default_to_recommendation.md` (default-to-Recommended — 8/8 = 100% calibration data point pairs with 2026-05-28's 9/9 = 100% + 2026-05-30's 3/3 = 100% as the third 100% session this week; cumulative running 35/38 = 92.1% across recent 6 sessions).
- `feedback_playwright_for_repeatable_walkthroughs.md` (Phase 4 mode picker fired at the 5+ step manual walkthrough decision point per the directive; director picked Manual walkthrough Recommended).
- `feedback_approval_scope_per_decision_unit.md` (~10 pushes this session within the deploy-session push pattern; 4 deploys + 4 ping-pongs grouped under their respective Rule 9 gates + end-of-session post-deploy doc-batch push + ff-merge push).

**Closing line:** P-49 W2 Etsy sub-cluster DEPLOY + 3-fix-forward cascade session ✅ DONE 2026-05-31 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — third deploy session of the W2 per-platform arc after Amazon (2026-05-28) + eBay (2026-05-30); second consecutive per-platform DEPLOY to reuse the Diagnostic-instrumentation FF Pattern. 4 Rule 9 deploy gates fired (build deploy + FF#1 deploy + FF#2 diagnostic deploy + FF#3 fix deploy — one fewer than yesterday's eBay 5-FF). 8 Rule 14f forced-pickers fired, all director-Yes to Recommended (8/8 = 100% calibration). Schema-change-in-flight flag STAYS NO entire session. NEW baseline locked: extension `npm test` = 818/818 (+87 cumulative from 731 entry baseline). 4 fresh extension zips at repo root + 1 debug HTML file from director's diagnostic capture. Final director PASS verdict on FF#3 "Everything worked perfectly this time" RESOLVES the Etsy sub-cluster end-to-end. THREE NEW reusable Patterns memorialized that apply directly to the future Walmart sub-cluster session: "Diagnostic-instrumentation FF Pattern reusability validated across consecutive sessions" + "Over-broad fallback selectors in platform DOM-walkers should be DELETED, not added" + "AJAX-loaded overlay scraping requires live-DOM driver, not URL-construction" (the third Pattern partially applies to Walmart — investigate URL contract FIRST per director-verbatim spec the Walmart URLs `/reviews/product/<ID>?ratings=N` separate URLs exist so URL-construction applies there, NOT live-DOM driver like Etsy). §A unchanged per Rule 18; this entry is the extension-side architecture cross-reference pointer to the canonical deploy-session entry in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-31 per the P-23 + P-46 + W2 Amazon + eBay precedent. Closes (a.99); opens (a.100) RECOMMENDED-NEXT = P-49 W2 Walmart sub-cluster Session 1 on `workflow-2-competition-scraping`.

---

## §B 2026-06-01 — `session_2026-06-01_p49-w2-walmart-sub-cluster-session-1` — P-49 W2 Walmart sub-cluster DEPLOY + 3-fix-forward cascade session ships Session 1 build commit + 3 fix-forward commits to production via 4 Rule 9 deploy gates within ONE Phase 4 verification session; final director PASS verdict on FF#3 "Everything passed" RESOLVES the Walmart sub-cluster end-to-end on vklf.com; **CLOSES the entire P-49 W2 per-platform extension extraction arc across all 4 platforms** (Amazon 2026-05-28 + eBay 2026-05-30 + Etsy 2026-05-31 + Walmart 2026-06-01); extension-side architecture cross-reference pointer entry per the P-23 + P-46 + W2 Amazon + eBay + Etsy precedent — canonical deploy-session §B entry lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-06-01; **FF#1 `3321690` loosen-LISTING_PAGE_PATH-regex (accept BOTH `/ip/<id>` and `/ip/<slug>/<id>`) + FF#3 `86cbfbd` anchor-on-`enhanced-review-content`-data-testid + `closest('.overflow-visible')` walk-up + screen-reader-only `<span class="ld_Ec">` star + word-boundary regex `/\b(review|...)\b/i` reviewer-name filter = THREE NEW reusable Patterns memorialized that apply to future per-platform sub-cluster sessions + future W3-W14 workstreams that need platform-DOM diagnostics**.

This W2 Walmart sub-cluster DEPLOY session is the FOURTH + FINAL per-platform DEPLOY in the W2 arc after Amazon (2026-05-28) + eBay (2026-05-30) + Etsy (2026-05-31). It is the THIRD consecutive per-platform DEPLOY session to reuse the Diagnostic-instrumentation FF Pattern (eBay was first 2026-05-30; Etsy second 2026-05-31; Walmart third today 2026-06-01) — the Pattern is now empirically validated as a **repeatable canonical Pattern for the per-platform sub-cluster deploy session shape** across 3 consecutive days/3 consecutive platforms with 3 different root causes (eBay: tabpanel-scoping + JSON data-island; Etsy: over-broad findOverlayContainer fallback selector matching hidden lightbox; Walmart: completely wrong data-testid names — all 14 candidate selectors returned 0). Future W3-W14 workstreams that need platform-DOM diagnostics should adopt this Pattern from the start.

**Per the canonical extension-side architecture cross-reference pointer Pattern (see §B 2026-05-26 W2 Amazon Session 1 entry above for the originating Pattern description from the P-23 + P-46 + P-27 design-doc-split precedent), the full deploy-session narrative for the W2 Walmart sub-cluster lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-06-01.** This §B entry here is the extension-side architecture pointer entry — it captures the EXTENSION-LEVEL architectural additions for future reuse across the W#2 (Competition Scraping) workflow design canon, not the full deploy-session record.

**Files affected at extension level this session:**

- NEW `extensions/competition-scraping/src/lib/content-script/walmart-review-extractor.ts` (~530 LOC initially; ~510 LOC after FF#3 net rewrite). Walmart per-platform module mirroring W2 Amazon + eBay URL-construction Patterns (FF#1 symmetric helpers + FF#4 URL-construction pagination); the canonical extractor for Walmart product reviews via `https://www.walmart.com/reviews/product/<ID>?ratings=N` (multi-star via repeated `&ratings=M` params) at 10 reviews/page.
- NEW `extensions/competition-scraping/src/lib/content-script/walmart-review-extractor.test.ts` (~660 LOC initially; ~640 LOC after FF#3 net rewrite). node:test cases covering the URL helpers + parsers + dispatch surface.
- MODIFY `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — Walmart dispatch block inserted between Etsy and the fallback toast; new fallback message acknowledges all 4 platforms now ship (Amazon + eBay + Etsy + Walmart).
- All shared content-script infrastructure modules (`scrape-pagination.ts` + `scrape-progress-indicator.ts` + `scrape-trigger-modal.ts`) reused unchanged from prior W2 deploys.

**THREE NEW extension-side architecture Patterns memorialized this session** (full details in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-06-01 + `docs/CORRECTIONS_LOG.md` §Entry 2026-06-01):

(a) **"Diagnostic-instrumentation FF Pattern reusability validated across 3 consecutive days/platforms"** — when 2+ consecutive speculative fix-forwards BUSTED at the platform-DOM-walker layer, ALWAYS fire a Rule 14f picker offering (A) Diagnostic instrumentation [Recommended — TEMPORARY console.log + auto-download via programmatic `<a download>` of fetched HTML to director's Downloads + SELECTOR PROBE per page logging counts of all candidate selectors] vs (B) Defer to next session. Validated across 3 consecutive sessions/platforms with 3 different root causes. **Reusable across all future platform-DOM walker development** in `extensions/competition-scraping/src/lib/content-script/`.

(b) **"Word-boundary regex `\b...\b` for reserved-keyword filtering against natural-language strings"** — in extension content-script parsers that filter natural-language strings (reviewer names, product titles, category labels) against a denylist of reserved keywords, ALWAYS use word-boundary anchors (`\b`) not substring matching. Critical: real reviewer name "Walmart customer, Top Reviewer" contains "Reviewer" — substring regex `/review/i` falsely matched "Review" inside "Reviewer" and filtered the name out. Generalizes to ANY denylist filter in the extension; applies to future per-platform extractors that filter `<a>` links or text nodes that may legitimately contain reserved-keyword inflections.

(c) **"closest() walk-up + anchor-on-canonical-data-testid pattern when no card-level data-testid exists"** — when a platform's review row has a stable per-review `data-testid` on a SUB-element (body / footer) but NOT on the row root, anchor the walker on the stable sub-element data-testid and walk UP via `closest('<canonical-class>')` to find the card boundary. Cleaner + more robust than scanning for the card root via CSS-attribute-contains or parentElement chain navigation. Applies to ANY future per-platform DOM walker where the row-level marker is on a SUB-element of the row, not the row root itself.

**Cross-references (extension-side architecture documents):**

- `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-06-01 — the canonical full deploy-session record for the W2 Walmart sub-cluster; full Phase 4 verification narrative + full 3-fix-forward cascade narrative + 3 NEW reusable Patterns + scoreboard table + cross-references all live there.
- `docs/CORRECTIONS_LOG.md` §Entry 2026-06-01 — the corrections-log entry capturing today's 3 NEW reusable Patterns + 3 LOW informational sub-observations + the full Pattern memorialization narrative for cross-session reuse.
- §B 2026-05-31 above (W2 Etsy DEPLOY) — predecessor entry capturing the SECOND consecutive per-platform DEPLOY to reuse the Diagnostic-instrumentation FF Pattern; today's Walmart entry validates the Pattern as canonical across 3 consecutive days/3 different platforms.
- §B 2026-05-30 above (W2 eBay DEPLOY) — FIRST per-platform DEPLOY entry to memorialize the Diagnostic-instrumentation FF Pattern; today's Walmart is the third consecutive reuse.
- §B 2026-05-28 above (W2 Amazon DEPLOY) — predecessor entry capturing the W2 Amazon URL-construction Patterns (FF#1 symmetric helpers + FF#4 URL-construction-based pagination) reused successfully today by the Walmart module (URL-construction applies cleanly to Walmart per §A.2 spec — both `/ip/<id>` and `/ip/<slug>/<id>` accepted via FF#1 regex loosening).
- §B 2026-05-27 above (W2 Amazon Session 2) — predecessor entry capturing the cross-star/cross-filter loop Pattern + Shadow DOM trigger modal Pattern reused today by the Walmart module.
- §B 2026-05-26 above (W2 Amazon Session 1) — foundation entry capturing the `fetch()` + `DOMParser` content-script pagination Pattern + the Shadow DOM mount Pattern (used directly by today's Walmart module unchanged).
- §B 2026-05-19-g above (P-23 saved-URL dropdown side-by-side ship) — first content-script-architecture-level Pattern; today's three NEW Patterns pair with the cross-star loop Pattern + the fetch+DOMParser Pattern + the symmetric-helper Pattern + the URL-construction pagination Pattern + the JSON data-island extraction Pattern + the tabpanel-scoped walker Pattern + the closest()-walk-up Pattern + the word-boundary-regex Pattern as content-script-architecture-level building blocks.
- `feedback_recommendation_style.md` (most-thorough/reliable — every Rule 14f picker today framed Recommended; 7/7 director-Yes to Recommended = 100%).
- `feedback_default_to_recommendation.md` (default-to-Recommended — 7/7 = 100% calibration data point pairs with prior session 100% data points as the fourth 100% session in recent rotation; cumulative running 50/53 = 94.3% across recent 8 sessions).
- `feedback_playwright_for_repeatable_walkthroughs.md` (Phase 4 mode picker fired at the 5+ step manual walkthrough decision point per the directive; director picked Manual walkthrough Recommended).
- `feedback_approval_scope_per_decision_unit.md` (~10 pushes this session within the deploy-session push pattern; 4 deploys + 4 ping-pongs grouped under their respective Rule 9 gates + end-of-session post-deploy doc-batch push + ff-merge push).

**Closing line:** P-49 W2 Walmart sub-cluster DEPLOY + 3-fix-forward cascade session ✅ DONE 2026-06-01 end-to-end on vklf.com via `workflow-2-competition-scraping` → `main` — fourth + FINAL per-platform DEPLOY session in the W2 arc after Amazon (2026-05-28) + eBay (2026-05-30) + Etsy (2026-05-31); third consecutive per-platform DEPLOY to reuse the Diagnostic-instrumentation FF Pattern. **CLOSES the entire P-49 W2 per-platform extension extraction arc across all 4 platforms — Amazon + eBay + Etsy + Walmart all now ✅ DEPLOYED-AND-VERIFIED end-to-end on vklf.com.** 4 Rule 9 deploy gates fired (build deploy + FF#1 deploy + FF#2 diagnostic deploy + FF#3 fix deploy — same count as yesterday's Etsy 3-FF). 7 Rule 14f forced-pickers fired, all director-Yes to Recommended (7/7 = 100% calibration; running cumulative 50/53 = 94.3% across recent 8 sessions). Schema-change-in-flight flag STAYS NO entire session. NEW baseline locked: extension `npm test` = 910/910 (+92 cumulative from 818 entry baseline). 5 fresh extension zips at repo root + 3 debug HTML files from director's diagnostic capture. Final director PASS verdict on FF#3 "Everything passed" RESOLVES the Walmart sub-cluster end-to-end. THREE NEW reusable Patterns memorialized that apply directly to future W3-W14 workstreams + future per-platform extractors: "Diagnostic-instrumentation FF Pattern reusability validated across 3 consecutive days/platforms" + "Word-boundary regex for reserved-keyword filtering against natural-language strings" + "closest() walk-up + anchor-on-canonical-data-testid Pattern". §A unchanged per Rule 18; this entry is the extension-side architecture cross-reference pointer to the canonical deploy-session entry in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-06-01 per the P-23 + P-46 + W2 Amazon + eBay + Etsy precedent. **Closes (a.100); opens (a.101) RECOMMENDED-NEXT = P-49 W5 AI review analysis Session 1 on `workflow-2-competition-scraping`** per §C.5 implementation outline (token-counter + batch-sizer + cache + cost-cap foundation primitives + first per-product prompt + first end-to-end run on a small product) — newly unblocked because all 4 platform corpora exist in production as of today's Walmart deploy.

---

## §B 2026-05-27 — `session_2026-05-27_p49-w5-session-1.5-reviews-phase-3-design-lock` — cross-reference pointer entry per Rule 18 — canonical W5 Session 1.5 Reviews Phase 3 design lock + schema enum extension + shared ExecutionModeSelect component build-session entry lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27

This session's W5 Session 1.5 design-lock + build work is **PLOS-side AI infrastructure**, not extension-side. The canonical §B entry for the session lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27 per the W5 Session 1 2026-06-02 cross-doc precedent (W5 sessions are PLOS-side; per-platform extension sessions like W2 Amazon/eBay/Etsy/Walmart land cross-reference pointers here in `COMPETITION_SCRAPING_DESIGN.md`).

**No new extension-side architecture decisions this session.** Today's build commit `252e1dd` (6 files +181/-10) touched ONLY PLOS-side files (`prisma/schema.prisma` + `src/lib/shared-types/competition-scraping.ts` + `src/lib/competition-scraping/handlers/review-analysis-run.ts` + NEW `src/lib/workflow-components/execution-mode.ts` + NEW `src/lib/workflow-components/execution-mode-select.tsx` + NEW `src/lib/workflow-components/execution-mode.test.ts`). The extension-side per-platform extractors (`amazon-review-extractor.ts` + `ebay-review-extractor.ts` + `etsy-review-extractor.ts` + `walmart-review-extractor.ts`) are UNCHANGED; the existing extension build (`910/910` UNCHANGED) carries forward.

**Forward-looking note for future extension-side cross-references:** when W5 Session 2+ wires the new Tables 2/3/4 surface (per the design lock in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27), the Per-Review Summarize button + modal + browser batch loop will live PLOS-side; the existing extension-side per-platform extractors continue to feed `CapturedReview` rows that the new W5 surface consumes. No extension-side changes are expected through the W5 Sessions 2-10 arc unless director surfaces new per-platform extraction requirements.

**Cross-reference:** the canonical W5 Session 1.5 entry — including the full Reviews Phase 3 design lock (3-table + 7-flow + browser-first execution + 7 v1 prompts + 4-option toggle expansion) + the ~20 Rule 14f forced-pickers calibration data + the mid-planning architectural redirect from server-side worker pattern to W#1's browser-first execution pattern + the supersedence of §A.10 + §A.11 + §A.12 + the new schema enum values (PER_REVIEW + PER_CATEGORY) + the shared ExecutionModeSelect component + the NEW reusable Pattern memorialized via NEW memory file `feedback_browser_first_ai_with_server_migration.md` — lives in `docs/REVIEWS_PHASE_2_DESIGN.md` §B 2026-05-27.

---

---

## §B 2026-06-01-c — `session_2026-06-01-c_p54-competition-scraping-main-table-phase-4-sort-by-grouping` — P-54 Phase 4: the "Sort By" grouping box on the MAIN `/competition-scraping` Competitor URLs table (R6 / D2) — append-only design note per Rule 18 (§A frozen)

**Informational design note (the canonical phase spec lives in `docs/polish-item-specs/P-54-competition-scraping-main-table-enhancements.md` §3 Phase 4 + §4 Q-H resolution; the as-built scoreboard + the reusable Pattern live in `docs/CORRECTIONS_LOG.md` §Entry 2026-06-01-c).**

**Design choices made this session (Q-H resolved WITH the director via a 3-question design picker BEFORE coding, per `feedback_plan_output_shape_before_building` — all 3 Recommended chosen):**
- The MAIN Competitor URLs table gained a "Sort By" box (beside Platforms / Columns in `ColumnVisibilityBar`) that groups rows by **Platform / Category / Type** into banner-row groups, mirroring the `/reviews-analysis-by-category` + `/reviews-analysis-by-type` page pattern. **"None" (flat) is the default** = the existing ungrouped table.
- The chosen grouping mode + the per-mode banner order PERSIST and are SHARED across the Project (consistent with the Phase-3 share-everything model) — they ride in the existing `ProjectTablePreferences` row via the additive `groupBy String @default("none")` + `groupOrder Json @default("{}")` fields (`prisma db push`; additive; zero data loss).
- Within a group BOTH per-column click-sort AND row-drag work; the group banners are themselves draggable (two-level drag); the Phase-3 column reorder stays INDEPENDENT of grouping; the empty bucket renders "(Uncategorized)" / "(Untyped)" pinned last.

**Implementation subtlety (the reusable Pattern):** grouping is a re-bucketing LAYER over the rows that are ALREADY in display order (the active per-column click-sort, or the manual `rowOrder` drag order). `buildMainGroupedRows` (NEW pure helper `src/lib/competition-scraping/main-table-grouping.ts`) re-buckets by group key while preserving the input order WITHIN each bucket — so the active column-sort / manual row order flows through for free, with no re-sort inside the grouping. A consequence: the existing two-level-drag re-rank helpers `applyCategoryDrag` / `applyCompetitorDrag` (from `category-table-layout`) generalize directly to the main table — their "Category"/"Competitor" names are historical; the ops are pure string-array re-ranks. The flat path is byte-for-byte unchanged (Phases 1–3 untouched); the only new render code is the grouped branch in `UrlTable.tsx` (banner rows + per-group `SortableContext` inside the existing ONE `DndContext`, id-discriminated as column-key / `grp:` banner / row-id) + the NEW `GroupBannerRow` component.

**Affected §A sections (INFORMATIONAL — §A is FROZEN per Rule 18; not edited):** the main-table surface description (Competitor URLs table) now also supports a "Sort By" grouping mode; persistence for the main table is the shared `ProjectTablePreferences` store (Phase 3), now also carrying `groupBy` + `groupOrder`.

**Cross-references:** spec `docs/polish-item-specs/P-54-competition-scraping-main-table-enhancements.md` (§3 Phase 4 + §4 Q-H); `docs/CORRECTIONS_LOG.md` §Entry 2026-06-01-c; grouping precedent `src/lib/competition-scraping/category-table-grouping.ts` + `type-table-grouping.ts` + the By-Category / By-Type pages; the as-built grouping helper `src/lib/competition-scraping/main-table-grouping.ts`; the grouped render `components/UrlTable.tsx`; the shared store `handlers/project-table-preferences.ts`.

---

---

## §B 2026-06-01-d — `session_2026-06-01-d_p54-competition-scraping-phase-5-dynamic-category-columns` — P-54 Phase 5: the dynamic content/image/video category columns on the MAIN `/competition-scraping` Competitor URLs table (R7 / R8 / R9 per D3/D4/D5/D7/D8/D9) — append-only design note per Rule 18 (§A frozen) — **CLOSES P-54**

**Informational design note (the canonical phase spec lives in `docs/polish-item-specs/P-54-competition-scraping-main-table-enhancements.md` §3 Phase 5 + §4 Q-F/Q-I resolution; the as-built scoreboard + the reusable Pattern live in `docs/CORRECTIONS_LOG.md` §Entry 2026-06-01-d).**

**Design choices made this session (Q-F + Q-I resolved WITH the director via a 3-question design picker BEFORE coding, per `feedback_plan_output_shape_before_building` — the two DESIGN questions matched recommendations; a 3rd PROCESS question was a director override):**
- For each captured **content / image / video category**, the MAIN Competitor URLs table grows a locked column-PAIR: the captured text body (R7) or `embeddedText` (R8/R9) on the LEFT + its glued **"[category] Analysis"** column immediately to the right. Multiple items in the same category stack as aligned `rowSpan` sub-rows (D3, reusing the reviews-table pattern), so each item's "Your Analysis" sits exactly beside its text.
- The columns are SHOWN by default when their content exists; a NEW "Content / Image / Video Categories" group of checkboxes in the Columns box shows/hides each kind (D7).
- Cells edit IN-table: the captured/embedded TEXT inline (D9), the "Your Analysis" via a click-to-open POP-OUT editor reusing the existing `PerItemAnalysisBox` TipTap surface (Q-I → pop-out, NOT raw inline contenteditable in a narrow cell) — writing back through the EXISTING per-item PATCH routes (`/text/[textId]`, `/images/[imageId]`, `/videos/[videoId]`; D5). The table refetches on tab/window refocus (D4).
- Each value column + its analysis column move together as a LOCKED PAIR under Phase-3 column reorder (D8) and align in BOTH the flat AND the Phase-4 grouped render paths. New categories auto-append left of "Added On" (Q-F); the user's custom order is kept across category changes; deleted categories drop from the saved order.

**Implementation subtlety (the reusable Pattern):** the locked pairs were delivered with NO schema change — the predicted locked-pair column-order store was AVOIDED. Only the VALUE key is stored as an orderable unit in the EXISTING `ProjectTablePreferences.columnOrder` (and the dynamic keys ride in the existing `columnVisibility` / `columnWidths` maps); the "[category] Analysis" column is synthesized + glued at RENDER immediately to its right, so the existing `moveColumnKey` drags the pair as one for free. Generalizes: when a derived/paired column must travel with an anchor column, make ONLY the anchor orderable + synthesize the partner at render. The dynamic columns are fed via an opt-in `?withCaptures=1` include on the existing GET `/urls` (a lightweight per-URL captured-item projection) — keeping the route count at 71 and the default payload + all other `/urls` consumers unchanged.

**Affected §A sections (INFORMATIONAL — §A is FROZEN per Rule 18; not edited):** the main-table surface description (Competitor URLs table) now also renders dynamic per-category value/analysis column pairs sourced from the per-URL `CapturedText` / `CapturedImage` / `CapturedVideo` items; persistence for the main table remains the shared `ProjectTablePreferences` store (Phase 3), now also carrying the dynamic column keys in its existing Json maps (no new field).

**Cross-references:** spec `docs/polish-item-specs/P-54-competition-scraping-main-table-enhancements.md` (§3 Phase 5 + §4 Q-F/Q-I); `docs/CORRECTIONS_LOG.md` §Entry 2026-06-01-d; the as-built helper `src/lib/competition-scraping/dynamic-columns.ts`; the data path `handlers/urls.ts` (opt-in `?withCaptures=1`); the render `components/UrlTable.tsx` + `ColumnVisibilityBar.tsx` + `CompetitionScrapingViewer.tsx`; the captured-item models + detail-page edit precedent `CapturedText` / `CapturedImage` / `CapturedVideo` + `url/[urlId]/components/UrlDetailContent.tsx` + `PerItemAnalysisBox.tsx` + the per-item PATCH routes; the shared store `handlers/project-table-preferences.ts`; §B 2026-06-01-c above (the Phase-4 grouping seam this Phase-5 work aligns inside).

---

---

## §B 2026-06-02 — `session_2026-06-02_p55-comprehensive-analysis-files-and-main-table-additions` — P-55: `/comprehensive-analysis` downloadable materials (Excel exports of the four competition tables + a teaching primer) + a NEW main-table "Overall Competitor Analysis" column + Columns-box ordering fixes — append-only design note per Rule 18 (§A frozen)

**Informational design note (the canonical spec lives in `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` §1 verbatim director instructions + §2 joint decisions + §3 consolidated spec + §4 open questions; the as-built scoreboard + the reusable Patterns live in `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02). Phases 1 + 2a + 2b-i DEPLOYED this session (Phases 1 + 2a director-verified; Phase 2b-i awaiting director verification); Phase 2b-ii + Phase 3 remain.**

**Design choices made this session (requirements + all decisions resolved WITH the director via AskUserQuestion BEFORE coding, per `feedback_plan_output_shape_before_building` + `feedback_no_fabricated_instructions`):**
- The director's CONCRETE direction **SUPERSEDES the old P-51 in-app-AI-summarize idea**: the `/comprehensive-analysis` page PREPARES downloadable materials — Excel spreadsheets of the four competition tables + a teaching "primer" — so the DIRECTOR runs the AI of their choice themselves (download → feed to an AI → paste/refine in the editor), with the primer also insertable into the editor via an "Insert primer" button. An in-app "do it for me" button is a possible LATER step, NOT in P-55.
- A NEW **"Comprehensive Competitive Analysis Files" box** sits above the editor on `/comprehensive-analysis`; each file is downloadable individually OR all together as a .zip. **Every download regenerates fresh from LIVE data at click time** (a stated behavior the director was promised; see the Implementation subtlety below).
- The four spreadsheets: **Competition Content Overview** (the whole main Competitor URLs table — all columns / all rows; Phase 2a ✅) + **Competition Reviews Analysis** (one row per captured review — Stars · Review · Review Summary — + per-competitor fields + the comprehensive bulleted/non-bulleted AI summaries repeated; Phase 2b-i ✅ awaiting verification) + **Reviews Analysis By Competitor Category** + **Reviews Analysis By Competitor Type** (two-level grouped — competitors within a category/type banner, reviews within a competitor — + per-group bulleted/non-bulleted summaries + Source Reviews; Phase 2b-ii NOT BUILT, currently shown "Added in the next update").
- A NEW main-table **"Overall Competitor Analysis" column** (left of "Added On"; a pop-out editor; save via the existing urls/[urlId] PATCH; sortable / hideable / drag-reorderable) + the Columns-box checkbox order now MIRRORS the table column order (the category-group checkboxes interleave at their real position instead of being appended after Added On).
- **Primer (Phase 3):** a Word **.docx** describing each table + its columns + what each column contains, generated to reflect the project's ACTUAL columns; lives in the Files box AND insertable into the editor via a re-clickable "Insert primer" button (NOT a fixed header / NOT auto-insert).

**Implementation subtlety (the reusable Patterns — see CORRECTIONS_LOG §Entry 2026-06-02):** (a) a newly-introduced FIXED column lands at its intended saved-order slot via `withMissingKeysBefore` (the fixed-column analogue of `withDynamicKeysInOrder`), applied to BOTH the table render and the Columns-box checkbox order; (b) the Columns-box entries (fixed + per-kind group checkboxes) are ordered in ONE pass via `orderedColumnBoxEntries` so the checkbox order mirrors the table; (c) spreadsheet export of a stacked-sub-row table = EXPAND the sub-rows into REAL Excel rows + repeat the fixed columns per row (Excel has no sub-rows — director: "Excel can't do sub-rows"); (d) the `/comprehensive-analysis` page does NOT own the source data, so the Files box re-fetches each table's sources FRESH at click time + REUSES the owning pages' pure assembly helpers (`dynamic-columns`, `mergeTitleAndBody`, the PER_REVIEW/PER_PRODUCT hydration from `/review-analysis`) rather than duplicating page logic. The initial Phase-2a/2b-i implementation cached on mount; the director's question surfaced that this violated the promised "fresh every download" guarantee → fixed in `e263be5`. NO schema change — everything is additive client-side (download generation, NEW dep jszip ^3.10.1) or reuses existing routes (GET `/urls?withCaptures=1` + `/review-analysis` + `/urls/[urlId]/reviews` + the existing urls/[urlId] PATCH); route count stays 71.

**Affected §A sections (INFORMATIONAL — §A is FROZEN per Rule 18; not edited):** the `/comprehensive-analysis` page surface now hosts a "Comprehensive Competitive Analysis Files" box (downloadable Excel exports + the planned primer .docx + "Insert primer" button) in addition to the existing TipTap editor; the main Competitor URLs table gains an "Overall Competitor Analysis" column persisted via the existing urls/[urlId] PATCH; persistence for the main table remains the shared `ProjectTablePreferences` store.

**Cross-references:** spec `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md`; the superseded `docs/polish-item-specs/P-51-comprehensive-analysis-ai-summary.md` (UI dimension superseded; `ReviewAnalysis.PER_PROJECT` slot unused); `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02; the as-built lib `src/lib/competition-scraping/comprehensive-analysis-exports.ts` + the helpers `withMissingKeysBefore` (column-order.ts) + `orderedColumnBoxEntries` (dynamic-columns.ts); the render `ComprehensiveAnalysisFilesBox.tsx` + `OverallAnalysisBox` + `UrlTable.tsx` + `ColumnVisibilityBar.tsx` + `CompetitionScrapingViewer.tsx`; the export precedent `reviews-table-export.ts` (`slugifyForFilename`); the grouped-page helpers Phase 2b-ii will reuse (`category-analysis-aggregation`, `buildCategoryGroups`, `buildCategorySourceReviewRows`, `category-table-columns` / `type-table-columns`); §B 2026-06-01-d above (the dynamic-category-column data path the Content Overview sheet draws on).

---

## §B 2026-06-02-b — `session_2026-06-02-b_p55-phase-2b-ii-grouped-spreadsheets-audit-and-primer-content` — P-55 CONTINUED: the two grouped By-Category + By-Type spreadsheets + a full four-file export audit (exports now MIRROR the on-screen tables) + the Phase 3 primer content generator (held back, inert) — append-only design note per Rule 18 (§A frozen)

**Informational design note (the canonical spec lives in `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md`; the as-built scoreboard + the reusable Patterns live in `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02-b; the standing export rule lives in memory `feedback_exports_include_all_table_data`). Phase 2b-ii DEPLOYED this session (director verification of the four exports DEFERRED); Phase 3 part 1 (the primer CONTENT generator + approved wording) BUILT + committed inert (`dfa4af1`); Phase 3 part 2 (the primer .docx + "Insert primer" button + Files-box entry) remains.**

**The governing design principle made explicit this session — an export must MIRROR the on-screen table:** a downloadable table export must (1) match the on-screen table's columns + their order EXACTLY (source the columns from the page's column registry — e.g. `CATEGORY_TABLE_COLUMNS` / `TYPE_TABLE_COLUMNS` — never a parallel hardcoded list, so it can't drift), (2) include ALL data the table can show, including click-to-reveal / expand-only data (e.g. the `/competitor-reviews-analysis` expand panel's Reviewer · Date · per-row Summary), (3) split every sub-row across ALL columns into its own real Excel row, and (4) generate fresh from live data on every download click — plus a backstop clamp of every cell to Excel's 32,767-char per-cell limit. Director verbatim (2026-06-02): *"Any column or data that is only shown when clicked on should be automatically included in the table that is exported. In other words, all possible data that is included in the table should be exported."*

**Design choices made this session (resolved WITH the director via plain-terms feedback + AskUserQuestion pickers):**
- The two **grouped spreadsheets** (Reviews Analysis By Competitor Category + By Competitor Type) are built by ONE generic grouped-export engine + two thin wrappers, two-level (competitors within a category/type banner, reviews within a competitor): category/type SUMMARY (banner) rows first, then competitor REVIEW rows; columns + order read from the page registries to match the on-screen tables exactly (the invented "Review" + "Source for AI complaint" columns were removed); Source Reviews are their own rows.
- The **four-file audit** confirmed all four Files-box exports now obey the mirror-the-table rule above; only the flat **Competition Reviews Analysis** export had drifted (it used a hardcoded `REVIEWS_ANALYSIS_HEADER` and omitted the expand-only Reviewer/Date/Summary data) — rebuilt FF4 to read the page columns + include the click-to-reveal data, with the live `/reviews` fetch extended to return `reviewerName` + `reviewDate`.
- The **primer (Phase 3 part 1)** content + wording were planned WITH the director and APPROVED; the pure generator `comprehensive-analysis-primer.ts` (`buildPrimer()` reflecting the project's actual columns + `renderPrimerToPlainText`) is committed but NOT wired to any UI (rides to main inert; the build stays 71 routes). Phase 3 part 2 wires the .docx + "Insert primer" button + Files-box entry next session.

**Implementation subtlety (the reusable Patterns — see CORRECTIONS_LOG §Entry 2026-06-02-b):** (a) derive an export's columns from the page's column registry, not a hardcoded list, so the export and the rendered table stay pinned to the same source of truth and cannot silently diverge; (b) clamp every spreadsheet cell to Excel's 32,767-char limit (`clampToExcelCellLimit`) when concatenating long free-text; (c) a fully-tested pure lib committed ahead of its UI is safe to carry onto main inert (tree-shaken out of any build that doesn't import it) — record it explicitly in the handoff. NO schema change — everything is additive client-side (download generation) or reuses existing routes (GET `/urls?withCaptures=1` + `/review-analysis` + `/urls/[urlId]/reviews`); route count stays 71.

**Affected §A sections (INFORMATIONAL — §A is FROZEN per Rule 18; not edited):** the `/comprehensive-analysis` "Comprehensive Competitive Analysis Files" box now offers all FOUR competition spreadsheets (the two grouped By-Category / By-Type sheets are no longer "Added in the next update"), each mirroring its on-screen table; the planned primer .docx + "Insert primer" button remain Phase 3 part 2.

**Cross-references:** spec `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` (§3.B FINAL 4-point export rules + §4 RESOLVED); memory `feedback_exports_include_all_table_data`; `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02-b; the as-built `comprehensive-analysis-exports.ts` (the grouped engine + `clampToExcelCellLimit` + the registry-driven columns) + `comprehensive-analysis-primer.ts` (held back at `dfa4af1`) + `ComprehensiveAnalysisFilesBox.tsx`; §B 2026-06-02 above (the prior P-55 entry this continues).

---

---

## §B 2026-06-02-c — `session_2026-06-02-c_p55-without-individual-reviews-export-variants` — P-55 CONTINUED: three NEW "without individual reviews" summary-only export variants in the `/comprehensive-analysis` Files box (+ the four original exports director-verified) — append-only design note per Rule 18 (§A frozen)

**Informational design note (the canonical spec lives in `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` §1 verbatim directive + §2 trim-depth picker + §3.B SEVEN-file spec + §4 RESOLVED; the as-built scoreboard + the P-43 cwd-leak recurrence live in `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02-c; the standing export rule lives in memory `feedback_exports_include_all_table_data`). The four original Files-box exports were director-VERIFIED on vklf.com this session (all four PASS — the verification deferred at 2026-06-02-b is CLOSED); the three trimmed variants were built + DEPLOYED-AND-VERIFIED (`8420739`, director "pass").**

**Design intent change (small, additive):** the "Comprehensive Competitive Analysis Files" box now offers SUMMARY-ONLY variants of the three reviews spreadsheets alongside the full detailed versions — so the director can hand an AI (or read) a clean one-row-per-competitor view without the individual-customer-review detail. The box now lists SEVEN files (the original four UNCHANGED + three "without individual reviews" variants); "Download all (.zip)" bundles all seven; every file still regenerates fresh from live data on each click.

**Design choices made this session (resolved WITH the director — ONE AskUserQuestion picker BEFORE coding):** for the FLAT "Competition Reviews Analysis without individual reviews" file the trim was ambiguous (it has per-review columns beyond the three the director named); the director chose **"Drop ALL review detail (recommended)"** — one row per competitor with identity columns + the two Comprehensive summaries. The two grouped trimmed variants (By Category / By Type) drop exactly the three named columns (Stars / Reviews Summary / Source Reviews), leaving one short banner row per group above one row per competitor.

**Implementation subtlety (the reusable Pattern):** the trimmed variants reuse the SAME builders via a `withoutIndividualReviews` opt (on `buildReviewsAnalysisExportMatrix` + `buildGroupedReviewsAnalysisExportMatrix` + its two wrappers in `comprehensive-analysis-exports.ts`) rather than a parallel code path — registry-driven column filtering (drop `stars` / `reviewsSummary` / `catSourceReviews`|`typeSourceReviews`, skip the per-source-review banner rows, collapse per-review row expansion to one row per competitor) keeps the trimmed files pinned to the same column source-of-truth as the full versions, so a trimmed file CANNOT silently diverge from its source table. The button-onClick dispatch in `ComprehensiveAnalysisFilesBox.tsx` was refactored from an inline ternary into a `downloadHandlers` record keyed by file key. NO schema change — additive client-side download generation + reused existing routes (GET `/urls?withCaptures=1` + `/review-analysis` + each URL's `/reviews`); route count stays 71.

**Affected §A sections (INFORMATIONAL — §A is FROZEN per Rule 18; not edited):** the `/comprehensive-analysis` "Comprehensive Competitive Analysis Files" box now offers SEVEN spreadsheets (the four full exports + three summary-only variants of the reviews files); the planned primer .docx + "Insert primer" button remain Phase 3 part 2.

**Cross-references:** spec `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` (§1 + §2 + §3.B + §4 RESOLVED); memory `feedback_exports_include_all_table_data` + `feedback_plan_output_shape_before_building`; `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02-c (the P-43 cwd-leak recurrence); the as-built `comprehensive-analysis-exports.ts` (the `withoutIndividualReviews` opt) + `ComprehensiveAnalysisFilesBox.tsx` (the `downloadHandlers` record + the 3 trimmed builders); §B 2026-06-02-b above (the four-file audit this builds on) + §B 2026-06-02 (the original P-55 Files-box entry).

---

---

## §B 2026-06-02-d — `session_2026-06-02-d_p55-phase-3-primer-wiring-editable-primer-and-graduation-methodology` — P-55 Phase 3: the teaching primer WIRED + made EDITABLE/SAVABLE in the `/comprehensive-analysis` Files box (+ the Workflow Graduation Continuity methodology) — append-only design note per Rule 18 (§A frozen)

**Informational design note (the canonical P-55 spec lives in `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` §3 + §4 RESOLVED; the graduation methodology lives in `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` §1 verbatim directive + HANDOFF_PROTOCOL Rule 33; the two session observations live in `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02-d). Phase 3 closes the P-55 primer dimension; the editable/savable primer is the materially-new design choice this session. Both parts DEPLOYED-AND-VERIFIED on vklf.com (director "pass all five" + "pass").**

**Design intent change (the primer becomes a first-class, user-owned artifact):** P-55's earlier phases produced spreadsheets; Phase 3 produces the teaching "primer" as a downloadable Word `.docx` AND a one-click editor insert. The materially-new decision this session is that the primer is not a fixed/auto-generated blob — it is EDITABLE + SAVABLE: an "✎ Edit" rich-text modal lets the director reword it, **Save** persists their version, and from then on the saved version is what BOTH the .docx download AND the "↡ Insert primer" button emit; **Reset to default** reverts to the generated wording. The default wording reflects the project's actual columns + all SEVEN Files-box files.

**Design choices made this session (resolved WITH the director — Rule 14f AskUserQuestion pickers BEFORE coding, for the graduation methodology):** map + pointers kept in sync (NOT a duplicate of the source-of-truth docs); a terminal `./catch-up-workflow <N>` script (NOT a slash-command); git-tracked docs are the reliable backup (which answers the Rule 29 memory-wipe concern). For the primer itself the shape was director-directed (wire it as a .docx + an Insert button → then "make it editable + savable").

**Implementation subtlety (one source of truth for the primer):** download / insert / edit all resolve the SAME primer via `resolveCurrentPrimer` (the saved `primerJson` override, else the generated default) so the three surfaces can never diverge. Persistence is a NEW additive nullable `ComprehensiveCompetitorAnalysis.primerJson Json?` behind a NEW dedicated endpoint `.../comprehensive-analysis/primer` (GET/PUT, null=reset; route count 71 → 72) whose DI handler `handlers/comprehensive-analysis-primer-doc.ts` owns ONLY `primerJson` and NEVER clobbers the analysis doc's `contentJson` (a separate column), using a node:test-safe `Prisma.DbNull` value-import. The `.docx` is generated client-side via the NEW `docx ^9.7.1` dependency (`renderPrimerToDocxBlob` / `tipTapToDocxBlob`); `renderPrimerToTipTapDoc` bridges the generated primer into the rich-text editor for both Insert and Edit. NOTE (CORRECTIONS_LOG §Entry 2026-06-02-d observation (a)): the primer TEXT summarizes the Files-box inventory, so it had to be refreshed to cover all SEVEN files after 2026-06-02-c added the three "without individual reviews" variants — a generated/templated artifact does not auto-update and was pinned with a test assertion.

**Affected §A sections (INFORMATIONAL — §A is FROZEN per Rule 18; not edited):** the `/comprehensive-analysis` "Comprehensive Competitive Analysis Files" box now also offers the "Competitive Analysis Primer" Word `.docx` (singly + in the zip) + an "↡ Insert primer" button + an "✎ Edit" button; the editor gains a savable per-analysis primer. With Phase 3 shipped, P-55 is essentially CLOSED.

**Cross-references:** spec `docs/polish-item-specs/P-55-comprehensive-analysis-files-and-main-table-additions.md` (§3.C primer + §4 `.docx`-library question RESOLVED — `docx ^9.7.1`); `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` §1 + HANDOFF_PROTOCOL Rule 33 + DOCUMENTATION_ARCHITECTURE §5 Steps 7–8 + `docs/templates/WORKFLOW_PRIMER_TEMPLATE.md` + `docs/COMPETITION_SCRAPING_PRIMER.md` (W#2 first instance); `docs/CORRECTIONS_LOG.md` §Entry 2026-06-02-d; the as-built `comprehensive-analysis-primer.ts` (`renderPrimerToTipTapDoc`) + `comprehensive-analysis-exports.ts` (`buildPrimerDynamicColumnLabels`) + page-side `primer-render.ts` (`buildPrimerFromUrls` / `renderPrimerToDocxBlob` / `tipTapToDocxBlob` / `resolveCurrentPrimer`) + `handlers/comprehensive-analysis-primer-doc.ts` + `PrimerEditorModal.tsx`; §B 2026-06-02-c above (the trimmed variants the primer text now covers) + §B 2026-06-02-b (the four-file audit) + §B 2026-06-02 (the original P-55 Files-box entry).

---

---

END OF DOCUMENT
