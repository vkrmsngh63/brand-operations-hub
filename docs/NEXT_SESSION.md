# Next session

**Written:** 2026-05-24 (`session_2026-05-24_p46-workstream-3-deploy-and-five-fix-forwards` — end-of-session handoff after **W#2 polish P-46 Workstream 3 (Competition Data table redesign) SHIPPED + DEPLOYED + REAL-CHROME-VERIFIED on vklf.com 2026-05-24 via `workflow-2-competition-scraping` → `main` initial ff-merge `51e68f8..c727da9` carrying 6 commits + 5 in-session fix-forwards `f8293f1` → `0703174` → `712efa0` → `7358963` → `ac45737` resolving 11 Phase-4 verification issues end-to-end**. Pure deploy session that converted Workstream 3's three build sessions into 6 production deploys to vklf.com in one calendar day; director's exact end-of-session words: *"pass"*. **Headline outcome: P-46 Workstream 3 ✅ DONE-AND-VERIFIED 2026-05-24 on vklf.com end-to-end.** Combined W1+W2+W3 spend = 11 sessions vs. 7-11 estimated. **Six deploy pushes to `origin/main` today — highest count in any single session to date.** NEW reusable Pattern memorialized **"Phase-4 verification fix-forward cascade in a single deploy session"** + MEDIUM informational Rule 18 spec-capture gap surfaced + mechanical prevention added to working methodology (any UI-shape spec given mid-build must be echoed into binding docs + read back per Rule 14a BEFORE implementation lands). Schema-change-in-flight flag STAYS NO entire session (ZERO `prisma db push`; all 5 fix-forwards consume the W1 schema live since 2026-05-24 + deployed since 2026-05-23-c). **Closes (a.80) RECOMMENDED-NEXT = P-46 Workstream 3 deploy session ✅ DONE-AND-VERIFIED 2026-05-24 on vklf.com.** **Opens (a.81) RECOMMENDED-NEXT = P-46 Workstream 4 (Comprehensive Competitor Analysis page) first build session** on `workflow-2-competition-scraping` per Q10's locked sequencing — ~2-3 sessions estimated per §C.4; builds a NEW page hosting per-Project TipTap rich-text doc with hyperlinks back to URL detail pages + edit-mode toggle + "Competition Data" back-button; uses the same `RichTextEditor` wrapper W2 S1 built with `variant='full'` for the full-toolbar editor config; NEW route `/projects/[projectId]/competition-scraping/comprehensive-analysis/page.tsx`; NEW API route `/api/projects/[projectId]/competition-scraping/comprehensive-analysis` (currently 501-stub from W1; needs implementation); NEW Prisma model `ComprehensiveCompetitorAnalysis` already shipped in W1 schema ready for use.

---

## What we did this session (in plain terms)

Today was the **Workstream 3 deploy session for P-46** — the session that took Workstream 3's three build sessions (which lived on the `workflow-2-competition-scraping` feature branch) and pushed them to vklf.com so the director could use them in real Chrome. The session ran the canonical Phase-4 deploy pattern, then surfaced 11 separate UI issues at Phase-4 director verification, then resolved all 11 in-session via 5 fix-forwards that each became their own production deploy.

What happened, in plain terms:

- **Initial deploy landed clean.** Pre-deploy /scoreboard 5/5 GREEN at the unchanged baselines. Rule 9 director-Yes gate fired; director picked "Deploy now (recommended)." ff-merge `51e68f8..c727da9` carrying 6 commits (Workstream 3's three build commits + three doc-batch commits) ran clean. Post-merge /scoreboard 5/5 GREEN on main. Push to origin/main triggered Vercel auto-redeploy. Ping-pong sync brought workflow-2 back even with main.
- **Director's Phase-4 verification on vklf.com surfaced 11 issues** — the W3 redesign was visible on vklf.com but needed UX/layout adjustments. Issues were scoped + reversible + UI-only, so rather than capturing them as DEFERRED items for next session, today's session fixed-forward them in five batches.
- **Fix-forward #1 (commit `f8293f1`, 5 files +336/-177) covered 5 issues in one bundle:** extended the column resize handle to full table height with a faint full-table-height line during drag (via `ResizeObserver`); made the Competition Data page full-width by removing the page's `maxWidth: 1080px` cap; made the table horizontally scrollable (table `width: max-content` + `minWidth: 100%` inside the existing `overflowX: auto` wrapper); relocated the font-size stepper from the ColumnVisibilityBar to the table's toolbar as bare `+`/`−` buttons (no `Npt` label); converted the Platform filter from single-select to multi-select checkboxes (Platform[] state shape + `?platforms=X,Y` URL convention + "All Platforms" toggle + legacy `?platform=X` backwards compat in the URL viewer).
- **Fix-forward #2 (commit `0703174`, 1 file +54/-6) added sticky table header + sticky horizontal scrollbar:** table wrapper changed to `overflow: auto` + `maxHeight: calc(100vh - 200px)` + `minHeight: 400px`; all three `<th>` variants got `position: sticky; top: 0; zIndex: 3` so the header doesn't scroll away when the table content scrolls; the column resize handle's zIndex bumped from 2 to 4 so the drag handle renders above the sticky thead.
- **Fix-forward #3 (commit `712efa0`, 3 files +105/-83) addressed three issues:** the director-specified column order (Category · Type · Sponsored · Product Name · Brand Name · Description 1 · Description 2 · Results Rank · Price · Product Stars · # Reviews · Seller Stars · Seller Reviews · Competition Score · URL · Status · Added On — reshuffled both `TABLE_COLUMN_DEFS` + `COLUMNS` in lockstep); the ↗ Open button moved INSIDE the Product Name cell with `stopPropagation` so the cell still click-to-edits the text but the inline arrow opens the URL detail page in a new tab; URL detail page made full-width (`maxWidth: 100%` with 24px side padding; inner content caps for breadcrumb / image / video player intentionally untouched).
- **Fix-forward #4 (commit `7358963`, 3 files +49/-12) moved the Platform column to the very left of the table** — new `'platform'` column entry at position 0; renders friendly label via `PLATFORM_LABELS` (which moved from a local const inside ColumnVisibilityBar to an exported shared const inside `url-table-columns.ts` so both the bar checkbox row + the table cell renderer share a single source of truth); the checkbox auto-appeared in the Columns visibility bar since the bar iterates `TABLE_COLUMN_DEFS`.
- **Fix-forward #5 (commit `ac45737`, 1 file +80/-19) converted the Status column to click-to-cycle:** new internal `StatusCycleCell` sub-component replaces the `InlineEnumCell` dropdown for `scrapingStatus`; one-click toggle between `INCOMPLETE`/`COMPLETE` with optimistic update + error rollback; saving-disabled prevents double-click pileup. The bidirectional mirror with the URL detail page's Scraping Status toggle still works because both paths PATCH the same `CompetitorUrl.scrapingStatus` field. After this fix-forward Phase-4 re-verified all 11 issues PASS on vklf.com — director's exact word: *"pass"*.
- **Six deploy pushes to `origin/main` today** — the highest count in any single session to date. ~14 pushes total across deploys + ping-pong syncs + end-of-session bundle. Each push approved at its decision unit per `feedback_approval_scope_per_decision_unit.md`. Each deploy push was gated via an AskUserQuestion Rule 9 picker; director picked "Deploy now (recommended)" for all 6.
- **NEW reusable Pattern memorialized — "Phase-4 verification fix-forward cascade in a single deploy session."** When Phase-4 director verification surfaces multiple issues post-deploy, fix-forward in-session rather than deferring; each fix-forward becomes its own build commit + own Rule 9 gate + own Phase-4 reverify cycle; the session ends with N deploys total. Today set the new high-water mark: 6 deploys (initial + 5 fix-forwards). Pairs with the P-45 Build #2 2026-05-22-i fix-forward Pattern (1 initial + 1 fix-forward); today extends to N≥5 showing the pattern scales when issues are scoped + reversible + UI-only.
- **MEDIUM informational — Rule 18 spec-capture gap surfaced + fixed-forward in-session.** Director's column-order specification existed in director's intent but was never echoed into binding docs (§C.3 of `docs/COMPETITION_DATA_V2_DESIGN.md` or a §B refinement entry). Session 2 defaulted to "additive append" (9 pre-P-46 columns kept positions; 8 new ones appended). Surfaced at Phase-4 verification + fixed in fix-forward #3. **Mechanical prevention added to working methodology:** any UI-shape spec given mid-build (column order, button position, layout decision, sort default) must be echoed into binding docs + read back per Rule 14a BEFORE implementation lands.
- **All 5 /scoreboard checks GREEN at unchanged baselines** on both pre-deploy + post-merge runs (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 744 src/lib UNCHANGED / 61 routes UNCHANGED). After each fix-forward — root tsc + Next.js build re-verified at 61 routes; full scoreboard acceptably skipped per fix-forward (no new tests, no new routes, no new dependencies).
- **P-43 cwd-leak class re-reproduced ~9 times today** across the day's many sanity-check passes (LOW informational; same pattern as multiple prior reproductions; caught + recovered every time with the absolute-`cd` template form). **Date-stamping anomaly continuation (LOW informational):** the 5 fix-forward commit MESSAGES used suffix labels `2026-05-23-g` through `2026-05-23-k` continuing yesterday's `-f` sequence; git commit TIMESTAMPS correct (2026-05-24); only human-readable in-message labels diverged.

**Combined W1+W2+W3 total spend = 11 sessions** across the implementation arc (1 schema + 5 W2 UI + 1 W2 deploy + 3 W3 UI + 1 W3 deploy) vs. 7-11 estimated per §C.1/§C.2/§C.3 — top end of estimate with no overrun. **Workstream 3's implementation arc closes complete on vklf.com.** Workstreams 1+2+3 are all ✅ DONE-AND-VERIFIED in production.

## What we'll do next session (in plain terms)

Next session is the **P-46 Workstream 4 first build session** — building the new Comprehensive Competitor Analysis page. This is a brand new page that hosts a rich-text document per Project where the director can write their holistic synthesis of competitive analysis with hyperlinks back to specific URL detail pages.

What Workstream 4 covers across ~2-3 sessions per §C.4:

- **A new top-level navigation surface** on the Competition Data page — director can click a "Comprehensive Competitor Analysis" tab / button to navigate to the new page.
- **A new page route** `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/page.tsx` rendering the editor.
- **A new API route** `src/app/api/projects/[projectId]/competition-scraping/comprehensive-analysis/route.ts` that handles GET (read the rich-text doc) + PUT (save the rich-text doc). Currently exists as a 501-stub from Workstream 1; needs full implementation following the W2 Session 1 DI-seam pattern (extract handlers to `src/lib/competition-scraping/handlers/comprehensive-analysis.ts` for unit testability).
- **The TipTap rich-text editor** reusing the same `RichTextEditor` wrapper W2 Session 1 shipped — but configured with `variant='full'` (full toolbar with bold/italic/headings/lists/links) instead of `variant='minimal'` (what W2's Analysis boxes used). This will exercise the `variant='full'` branch of the wrapper that W2 Session 1 designed but didn't yet ship in production use.
- **Hyperlinks back to URL detail pages** — the editor should let the director type/paste a URL detail page link (or use a "Link to URL" affordance) so each rich-text reference is a clickable hyperlink that opens the corresponding URL detail page in a new tab. This is the key affordance that makes the Comprehensive Analysis page useful — the director references specific captured items as evidence in their broader synthesis.
- **Edit-mode toggle at top + "Competition Data" back-button at top** — edit-mode toggle switches between read-only display + edit affordances (Save button visible / dirty-state indicators visible). Back-button takes the director back to the Competition Data page.
- **The NEW Prisma model `ComprehensiveCompetitorAnalysis`** — already shipped in Workstream 1's schema (fields: id / projectId / contentJson (TipTap doc as JSON) / lastEditedBy / lastEditedAt + created/updatedAt). Per-Project: one row per Project. Workstream 4 wires the read + write halves.

**Session 1 of Workstream 4 (likely scope) covers the route handler half + the basic page + read-only display:** implement `src/lib/competition-scraping/handlers/comprehensive-analysis.ts` DI seam following the W2 S1 + W3 S1 precedent (extract for unit testability + write 15-25 node:test cases for the handler's contract); thin shim `route.ts` wiring DI seam to `verifyProjectAuth` + CORS + `withRetry` + `recordFlake`; new page route rendering the editor in read-only mode with seeded content from the GET. Session 1 may also begin the edit-mode toggle if scope allows; otherwise Session 2 covers that + save lifecycle.

**Session 2-3 (estimated) cover the remaining surface** — edit-mode toggle, save lifecycle with debounced PUT, dirty-state indicators, hyperlink affordance, navigation between Competition Data page + Comprehensive Analysis page, end-to-end Playwright walkthrough (if scope warrants), then a Workstream 4 deploy session.

After Workstream 4 ships, **Workstream 5 (Extension form additions + manual Reviews entry) is the last remaining workstream of P-46** — ~1-2 sessions covering the extension URL save form additions (Type / Description-1 / Description-2 / Price) so director can capture these fields at extension time + manual Reviews entry tweaks on vklf.com. Then a Workstream 5 deploy closes the P-46 arc end-to-end.

**Schema-change-in-flight flag** STAYS NO at Workstream 4 session start (the `ComprehensiveCompetitorAnalysis` Prisma model is already in W1's schema + already deployed via W2's 2026-05-23-c deploy; this session writes the code that reads + writes the existing schema columns).

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-24 (Workstream 3 ✅ DONE-AND-VERIFIED 2026-05-24 on vklf.com end-to-end):

- **P-46 Workstream 4 (Comprehensive Competitor Analysis page).** ~2-3 sessions estimated per §C.4. NEW page hosting per-Project TipTap rich-text doc with hyperlinks back to URL detail pages + edit-mode toggle + "Competition Data" back-button. Consumes the same `RichTextEditor` wrapper Workstream 2 Session 1 built (using the `variant='full'` branch). Includes Workstream 4 deploy session at the end.
- **P-46 Workstream 5 (Extension form additions + manual Reviews entry).** ~1-2 sessions estimated per §C.5. Adds Type / Description-1 / Description-2 / Price fields to the extension URL save form so they get captured at extension time + sent to PLOS server on save. Includes vklf.com-side manual Reviews entry tweaks based on real-Chrome usage. One deploy session ends this workstream + closes the P-46 arc.
- **P-47 Shadow DOM refactor (LOW; AFTER P-46).** ~2-3 sessions. Replaces the 80-event-listener band-aid from P-45 Build #2's Issue 2 fix with proper Shadow DOM isolation. LOW priority since band-aid works empirically.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions. Current two-captures workaround works fine. May be reduced in urgency now that Workstreams 2+3's vklf.com-side image upload + table redesign are deployed.
- **P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk) — DEFERRED LOW.** May obsolete now that P-46 redesigned the URL detail page + Competition Data table surfaces they live in.
- **W#2 graduation** after P-46 + P-47 + P-26 ship. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent; can happen any time.

---

**For:** the next Claude Code session — **P-46 Workstream 4 first build session** (estimated ~2.5-3.5 hours: pre-build doc reads ~30 min + session-start scope-pick if needed ~10 min + implementation ~90-120 min for the route-handler DI seam + page route + read-only editor seeded from GET + tests + scoreboard verification ~15 min + end-of-session doc-batch ~30 min). Per Rule 23 Change Impact Audit: **ADDITIVE + UI-only + ROUTE-IMPLEMENTATION** (new page route + new route-handler module + new DI-seam + the 501-stub at the existing route path gets filled in; no new dependencies — TipTap landed in W2 S1; the `ComprehensiveCompetitorAnalysis` model already in W1 schema). **Schema-change-in-flight flag enters NO** (carrying from today's W3 deploy — STAYS NO at Workstream 4 session end since no `prisma db push` planned). **Rule 9 triggers planned this session: ZERO** (pure build session; no deploy; no schema change; no destructive ops). **Pushes planned per `feedback_approval_scope_per_decision_unit.md`:** ONE — end-of-session push of build commit + doc-batch commit together to `origin/workflow-2-competition-scraping` (operationally adjacent; no Rule 9 gate fires).

---

## Status of today's session

**W#2 polish P-46 Workstream 3 (Competition Data table redesign) ✅ DONE-AND-VERIFIED 2026-05-24 on vklf.com end-to-end via `workflow-2-competition-scraping` → `main` initial ff-merge `51e68f8..c727da9` carrying 6 commits + 5 in-session fix-forwards `f8293f1` → `0703174` → `712efa0` → `7358963` → `ac45737` resolving 11 Phase-4 verification issues.** Pure deploy session that converted Workstream 3's three build sessions into 6 production deploys to vklf.com in one calendar day. Director's exact end-of-session words: *"pass"*. Combined W1+W2+W3 total spend = 11 sessions vs. 7-11 estimated per §C.1/§C.2/§C.3.

**Session shape (deploy session — multi-branch; 6 deploy events; ~14 pushes total):**

- Pre-build reads at session start (read `docs/COMPETITION_DATA_V2_DESIGN.md` §C.3 + §B 2026-05-23-d/-e/-f + §B 2026-05-23-c for the binding inputs).
- Phase 1 — pre-deploy /scoreboard 5/5 GREEN at baselines.
- Phase 2 — Rule 9 director-Yes gate via AskUserQuestion for initial `git push origin main`; director picked "Deploy now (recommended)."
- Phase 3 — ff-merge `51e68f8..c727da9` carrying 6 commits clean; post-merge /scoreboard 5/5 GREEN on main; push to origin/main; Vercel auto-redeploy fired; ping-pong sync clean.
- Phase 4 — director real-Chrome verify on vklf.com surfaced 11 issues across 5 fix-forward batches; each fix-forward landed via its own build commit on workflow-2 + own Rule 9 gate + own deploy push + own ping-pong sync + own Phase-4 re-verify cycle.
- /scoreboard verification: pre-deploy + post-merge 5/5 GREEN at unchanged baselines; per-fix-forward tsc + build re-verified at 61 routes UNCHANGED (full scoreboard acceptably skipped per fix-forward — calibration data point: baselines stayed UNCHANGED across all 6 deploys).
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG with new §Entry 2026-05-24 + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + the new §B 2026-05-24 entry on COMPETITION_DATA_V2_DESIGN.md).
- ~14 pushes total across deploys + ping-pong syncs + end-of-session bundle per the canonical pattern in `feedback_approval_scope_per_decision_unit.md` (6 deploy pushes + 6 ping-pong syncs + 1 end-of-session doc-batch push + 1 end-of-session ping-pong).

**§4 Step 1c forced-picker NOT FIRED** — next-session task unambiguous per §C.4 + Q10's locked sequencing + the "Multi-session workstream deploy gate timing" Pattern memorialized 2026-05-23-c (next workstream's foundation build begins after the prior workstream's deploy closes ✅ DONE-AND-VERIFIED).

**ZERO new DEFERRED items at session end (Rule 26)** — all 19 in-session TaskCreate tasks completed cleanly.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry this session — the P-46 Workstream 3 DEPLOY CLOSING §Entry 2026-05-24** capturing (a) W3 ✅ DONE-AND-VERIFIED end-to-end via initial deploy + 5 fix-forwards + 6/6 Phase-4 verifies PASS; (b) the NEW "Phase-4 verification fix-forward cascade in a single deploy session" reusable Pattern memorialization; (c) MEDIUM informational Rule 18 spec-capture gap observation + the mechanical prevention added to working methodology; (d) LOW informational P-43 cwd-leak class re-reproduced ~9 times today across pre-deploy + post-merge + single-check sanity passes; (e) LOW informational date-stamping anomaly continuation.

**TWENTY-FIFTH end-of-session run under the Rule 30 + §4 Step 4b template** (sequence prior to today: 2026-05-21-b → 2026-05-21-c → 2026-05-21-d → 2026-05-22 → 2026-05-22-b → 2026-05-21 → 2026-05-22-c → 2026-05-22-d → 2026-05-22-e → 2026-05-22-f → 2026-05-22-g → 2026-05-22-h → 2026-05-22-i → 2026-05-23 → 2026-05-24 → 2026-05-25 → 2026-05-26 → 2026-05-27 → 2026-05-28 → 2026-05-23-b → 2026-05-23-c → 2026-05-23-d → 2026-05-23-e → 2026-05-23-f → today). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; the P-46 Workstream 4 first build session begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at today's end-of-session doc-batch commit (the commit that lands when the parent pushes this NEXT_SESSION.md after fix-forward #5 `ac45737`). `main` should be at the same SHA (today's end-of-session doc-batch SHA, after the final ping-pong sync). Verify with `git log main..HEAD --oneline` — should show ZERO commits (both branches even).

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-46 Workstream 4 (Comprehensive Competitor Analysis page) first build session, on `workflow-2-competition-scraping`.** Closes **(a.81) RECOMMENDED-NEXT**. This is the first build session of Workstream 4's ~2-3 estimated session arc per §C.4. Build a NEW page at `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/page.tsx` hosting per-Project TipTap rich-text doc with hyperlinks back to URL detail pages + edit-mode toggle + "Competition Data" back-button. Implement the currently-501-stub API route `src/app/api/projects/[projectId]/competition-scraping/comprehensive-analysis/route.ts` via a new DI-seam handler module `src/lib/competition-scraping/handlers/comprehensive-analysis.ts` following the W2 S1 + W3 S1 precedent.

BUILD session — NO Rule 9 gates expected. No new schema (the `ComprehensiveCompetitorAnalysis` Prisma model is already in W1's schema from 2026-05-24 + deployed via 2026-05-23-c W2 deploy). No new npm dependencies (TipTap already landed in W2 S1).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify both branches' SHA relationships with `git log main..HEAD --oneline` — should show ZERO commits (both branches even at today's end-of-session doc-batch SHA).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or implementation).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-46 polish-backlog entry (the Workstream sub-status grid showing WS#1+2+3 ✅ DONE-AND-VERIFIED + WS#4 FIRST BUILD SESSION NEXT per (a.81) — the binding input for today's scope).
- **`docs/COMPETITION_DATA_V2_DESIGN.md`** with focus on **§C.4 Workstream 4 implementation outline (the binding spec for the Comprehensive Analysis page)** + **§A.4 (the design decision around one Comprehensive Analysis page per Project synthesizing all platforms + competitors)** + **§A.5 (the TipTap rich-text editor library decision; the wrapper W2 S1 built supports `variant='full'` for this page)** + **§B 2026-05-24 (today's W3 deploy closing entry — captures the "Phase-4 verification fix-forward cascade" Pattern + the Rule 18 spec-capture gap prevention mechanism + the calibration data point that W1+W2+W3 = 11 sessions vs. 7-11 estimated)** + **§B 2026-05-25 (the W2 Session 1 entry capturing the `RichTextEditor` wrapper that today's session will reuse with `variant='full'`)** + **§B 2026-05-24 (the W1 Schema entry capturing the `ComprehensiveCompetitorAnalysis` model that today's session will consume)**.
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (no deploy planned this session; gate will NOT fire) + Rule 14a (the design doc is the source of truth; if any aspect of implementation feels like "the default should be obvious," explicitly check that the default is captured in binding docs first — this is the tightening from the Rule 18 spec-capture gap surfaced 2026-05-24) + Rule 14f (will fire ONCE at session-start to confirm scope: route handlers + page + read-only display first, then edit-mode toggle if scope allows — or split across Sessions 1+2 if scope feels too large) + Rule 18 (§A of `docs/COMPETITION_DATA_V2_DESIGN.md` stays frozen; §B 2026-05-XX is the new append for this build session) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — ADDITIVE + UI-only + ROUTE-IMPLEMENTATION) + Rule 25 (Multi-Workflow — single-branch session; workflow-2 only; no main push expected) + Rule 26 (DEFERRED items registry) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- The existing `src/lib/competition-scraping/handlers/user-table-preferences.ts` (W3 S1 DI-seam handler — direct template for today's new `comprehensive-analysis.ts` handler module) + `src/app/api/projects/[projectId]/competition-scraping/table-preferences/route.ts` (W3 S1 thin shim — direct template for today's route shim) + `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/PerItemAnalysisBox.tsx` + `RichTextEditor.tsx` (W2 S1 — the wrapper today's session will reuse with `variant='full'`).

**Task shape (P-46 Workstream 4 first build session):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or implementation. Cover: what we'll do in the session (Workstream 4 first build — Comprehensive Analysis page route handler + page route + read-only display, with edit-mode toggle if scope allows), the schema-change-in-flight flag stays NO (no transition; schema already live), ZERO Rule 9 gates planned, ONE push planned at end-of-session.

2. **Pre-build reads** — execute the pre-build read list above. ~30 minutes.

3. **Rule 14f session-start scope-pick (if needed)** — confirm Session 1 scope between: (a) recommended — route-handler DI seam + page route + read-only editor seeded from GET (~90-120 min implementation; defers edit-mode toggle + save lifecycle to Session 2); (b) alt — full edit-mode + save lifecycle this session (~150-180 min implementation; may need a Session 2 anyway for hyperlink-affordance + navigation polish); (c) alt — split smaller, just the handler + 501-fill this session, page route to Session 2. Director picks; recommended path per `feedback_recommendation_style.md` is (a).

4. **Implementation** — write `src/lib/competition-scraping/handlers/comprehensive-analysis.ts` (~280-340 LOC DI-seam handler factory mirroring `user-table-preferences.ts` + `url-text.ts` + `reviews-by-id.ts` precedent — exports `extractComprehensiveAnalysisPatch` strict trust-boundary validator + `toWireShape` coercing Prisma JsonValue to typed shape + `makeComprehensiveAnalysisHandlers` factory returning GET + PUT) + 15-25 new node:test cases bringing src/lib to 759-769; thin shim `route.ts` (~70 LOC wiring DI seam to `verifyProjectAuth` + `withRetry` + `recordFlake` + CORS); new page route `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/page.tsx` (~150-250 LOC; Server Component that seed-fetches the doc; renders the editor in read-only mode initially; back-button to `/projects/[projectId]/competition-scraping`); navigation surface on Competition Data page (add a "Comprehensive Competitor Analysis" tab/button at top — probably in the ColumnVisibilityBar or as a new top-bar element above it; needs Rule 14f sub-picker for placement); seed-from-GET silently 404-tolerant; reuse `RichTextEditor` wrapper from W2 S1 with `variant='full'`.

5. **Tests** — 15-25 new node:test cases for the DI-seam handler covering: `extractComprehensiveAnalysisPatch` happy + bad-shape rejection + null body rejection + non-object body rejection; `toWireShape` coercion with bad-DB-shape fallback; GET + PUT handlers' happy paths + auth-failure + 400-on-bad-shape + 500-on-prisma-throw.

6. **/scoreboard verification** — all 5 checks GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 759-769 src/lib +15-25 from baseline 744 / 62 routes +1 from baseline 61 — IF a new route is created; OR 61 UNCHANGED if Session 1 only fills the existing W1 stub); Check 6 Playwright SKIPPED per non-deploy-session convention.

7. **End-of-session doc-batch** covers ROADMAP (header bump + P-46 entry annotated with Workstream 4 Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-XX in the Workstream sub-status grid + (a.81) closed + new (a.82) opened for Workstream 4 Session 2) + CHAT_REGISTRY (header bump — 148th Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header bump + new §Entry IF a fix-shape ambiguity / process slip / new reusable Pattern surfaces — otherwise header bump only) + NEXT_SESSION.md (rewritten for P-46 Workstream 4 Session 2) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + CLAUDE_CODE_STARTER (header bump only) + `docs/COMPETITION_DATA_V2_DESIGN.md` (NEW §B entry capturing Session 1 outcome + scope choices + Pattern reuse from W2 S1 + W3 S1 precedents). **ONE push** per the canonical pattern.

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** any picker that fires (Rule 14f session-start scope-pick + any sub-pickers for navigation surface placement / edit-mode shape) — surface the recommended path + default to it if director defers.

**Per Rule 14a tightening from 2026-05-24:** before writing code for any UI surface, scan the §C.4 spec + most-recent §B entries for any sequencing/ordering/positioning language; if any feels implicit-but-not-explicit (e.g., "the navigation surface goes... where? top-bar? sidebar? as a tab? inline above the ColumnVisibilityBar?"), fire a Rule 14f picker on the canonical spec BEFORE writing code. This prevents the spec-capture gap that surfaced today's MEDIUM-informational Rule 18 observation.

**Schema-change-in-flight flag:** STAYS **NO** (no `prisma db push` planned; consumes existing W1 schema; `ComprehensiveCompetitorAnalysis` model already deployed).

---

## Pre-session notes (offline steps for director between sessions)

**Required offline step BEFORE the next P-46 Workstream 4 Session 1 build session:** none. All infrastructure landed in prior sessions; the build is pure new-code on top of the deployed schema + the W2 `RichTextEditor` wrapper.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking the P-46 Workstream 4 first build session at all — can happen any time. Director-independent.

**Optional offline reading for director:** `docs/COMPETITION_DATA_V2_DESIGN.md` §C.4 Workstream 4 outline (~2-minute skim) + §A.4 (the binding "one Comprehensive Analysis page per Project" decision) + §A.5 (the TipTap library decision). Worth scanning before the Session 1 if director wants context for the Rule 14f session-start scope-pick.

**Pre-session setup (informational — Claude will handle in-session):** the Workstream 4 first build session begins on `workflow-2-competition-scraping`; director's involvement is the standard go-ahead after Step 7b plain-terms summary + the Rule 14f session-start scope-pick + maybe one or two sub-pickers on UI placement decisions.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`).

**Rule 9 triggers planned this session: ZERO** — pure build session; no deploy; no `prisma db push` (schema already shipped + already deployed); no `git push origin main`; no destructive SQL.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits a 🚨 alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any implementation work.

---

## Why this pointer was written this way (debug aid)

Today's session was the **W3 deploy session that turned into a 6-deploy fix-forward cascade**. The session ran cleanly through the initial Phase 1-3 deploy then surfaced 11 Phase-4 issues that were all UI-only + scoped + reversible, so Claude + director executed 5 fix-forwards in-session rather than capturing them as DEFERRED items. Director's exact end-of-session words after fix-forward #5: *"pass"* — all 11 issues verified PASS on vklf.com.

The natural next-session task per Q10's locked sequencing + the "Multi-session workstream deploy gate timing" Pattern is **Workstream 4 (Comprehensive Competitor Analysis page) first build session** — the next workstream's foundation build begins after the prior workstream's deploy closes ✅ DONE-AND-VERIFIED. Workstream 4 is the FOURTH of the FIVE P-46 workstreams; ~2-3 sessions estimated per §C.4; consumes existing infrastructure (the `ComprehensiveCompetitorAnalysis` Prisma model from W1's schema + the `RichTextEditor` wrapper from W2 S1).

- **(Recommended)** Workstream 4 Session 1 — route-handler DI seam + page route + read-only editor seeded from GET. Recommended because (a) the DI-seam-first pattern from W2 S1 + W3 S1 + W2 S4 has worked cleanly across all three prior workstream foundation sessions; (b) splitting Session 1 from edit-mode + save lifecycle keeps Session 1's scope bounded; (c) the existing 501-stub at the route path needs to be filled in before any client code can make a real GET work end-to-end.

The shape of Session 1 is **pure code + ZERO Rule 9 gates + ONE end-of-session push** — pre-build doc reads → Rule 14f session-start scope-pick (if needed) → implementation of handler + tests + route shim + page route → /scoreboard verification → end-of-session doc-batch → push to workflow-2.

**After Workstream 4 Sessions 1-2-3 land clean + Workstream 4 deploys, Workstream 5 (Extension form additions + manual Reviews entry) is the LAST remaining workstream of P-46** — ~1-2 sessions. Then P-46 closes ✅ end-to-end. Then P-47 + P-26 + DEFERRED P-27 bugs (or absorbed obsolete) before W#2 graduation. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).

**Alternate next-session candidates if director shifts priorities at session start (after W3 deploy + before Workstream 4 Session 1):**

- **Defer Workstream 4 + start P-47 Shadow DOM refactor.** NOT recommended — P-47 is LOW priority (band-aid works empirically) AND the P-46 implementation arc benefits from finishing W4 + W5 in sequence; pausing for P-47 mid-P-46 fragments the arc.
- **Defer Workstream 4 + start a polish-detour to capture a refinement from today's 11-issue Phase-4 cascade as a §B entry refining §C.3 retroactively.** NOT recommended — today's 5 fix-forwards already shipped to production + were captured in the §B 2026-05-24 entry + the CORRECTIONS_LOG §Entry; no remaining refinement work. The §C.3 spec is now "done" by virtue of the live deployment matching director's intent post-fix-forward #5.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.
- **A polish-detour ahead of Workstream 4 if director wants pre-build infrastructure work.** No obvious candidate this time — the operational substrate is hardened across 3 layers (P-42 backup-memory hook + P-43 absolute-paths discipline + P-44 wxt build/zip wrappers); today's deploy session ran cleanly through 6 deploy cycles. If director picks this path, surface the open polish landscape as a Rule 14f forced-picker.

Check `ROADMAP.md` for the canonical state. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §C.4 + §A.4 + §A.5 + §B 2026-05-24 through 2026-05-23-f for Workstream 4's binding scope + the 11 prior closing entries spanning Workstream 1 + W2 Sessions 1-5 + the W2 deploy + W3 Sessions 1-3 + today's W3 deploy.
