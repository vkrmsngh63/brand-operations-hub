# Next session

**Written:** 2026-05-23-e (`session_2026-05-23-e_p46-workstream-3-session-2-click-to-edit-cell-editors-and-eight-new-data-columns` — end-of-session handoff after **W#2 polish P-46 Workstream 3 (Competition Data table redesign) Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-23-e on `workflow-2-competition-scraping`** via build commit `899afd4` — 7 files +1414/-91. Second build session of the P-46 Workstream 3 implementation arc (Session 2 of 3-4 estimated per §C.3). **Headline outcome:** the Competition Data table is now fully click-to-edit per §A.2 (every cell becomes its appropriate inline editor on click — text / multiline-text / integer / decimal / boolean / enum / date / url via new `InlineCells.tsx` ~800 LOC parallel-component-set to URL detail page's `EditableField.tsx`) + 8 new data columns landed (5 W1-additive — `type` / `description1` / `description2` / `price` / `competitionScore`; 3 pre-existing-but-unsurfaced — `resultsPageRank` / `sellerStarRating` / `numSellerReviews`) bringing the Competition Data table from 9 to 17 columns; the whole-row `onClick={handleRowOpen}` is removed in favor of an explicit "↗" Open button per row (necessary UX behavior change mandated by §A.2 since whole-row onClick conflicted with cell-level click-to-edit); NEW reusable Pattern memorialized **"In-table inline-cell parallel-component set to URL-detail-page EditableField primitives"** (pairs with W2 Session 3's "OverallAnalysisBox parallel to PerItemAnalysisBox" Pattern as meta-shape covering parallel-component for visual-context-divergence across EDIT + ANALYSIS surfaces). Schema-change-in-flight flag STAYS NO (consumes existing Workstream 1 schema; the 8 new data columns are all already in `CompetitorUrl`). **Closes (a.78) RECOMMENDED-NEXT = P-46 Workstream 3 Session 2.** **Opens (a.79) RECOMMENDED-NEXT = P-46 Workstream 3 Session 3 — column resize (drag column edges) + drag-to-reorder rows + adjustable font size per §C.3 Session 3 spec** on `workflow-2-competition-scraping`; consumes existing `columnWidths` / `fontSize` / `rowOrder` JSON columns on `UserTablePreferences` from W1's schema via Session 1's auth-derived-userId route.

---

## What we did this session (in plain terms)

Today was the **second build session of Workstream 3** — the Competition Data table redesign. Session 1 (yesterday's session, 2026-05-23-d) landed the foundation — the per-user preferences plumbing + the horizontal `ColumnVisibilityBar` + removed the left-side sidebar. Today's session built click-to-edit on every cell + added 8 new data columns on top of that foundation.

What happened, in plain terms:

- **The Competition Data table is now fully click-to-edit.** You can click any cell to begin editing it in-place — text fields become text inputs; integer/decimal fields become number inputs; boolean cells toggle on single-click; enum cells open a small popover of options; date fields use the browser's native date picker; URL fields validate non-empty + link-color. Tab/Enter saves; Escape cancels; saves are optimistic (UI updates immediately) with rollback-on-throw (if the server PATCH fails the cell reverts + shows a small error pill until the next edit).
- **8 new columns landed in the table.** Five are new W1-additive (`type`, `description1`, `description2`, `price`, `competitionScore`) + three were already in the schema but never surfaced in the UI (`resultsPageRank`, `sellerStarRating`, `numSellerReviews`). The Competition Data table now has 17 columns total (was 9 going into this session). Each column has the right cell-editor type for its data shape.
- **One UX behavior change worth testing.** Previously you could click anywhere on a row to navigate to the URL detail page. That whole-row click conflicted with the new cell-level click-to-edit (clicking a cell to edit it would also trigger the row navigation). So the whole-row onClick is removed; a new "↗" Open button appears in the row-actions column (to the left of the trash button) — that's now the affordance for navigating to the URL detail page. The visual hover-highlight on the row stays but cursor is no longer pointer-on-the-row.
- **A reusable Pattern was memorialized.** Last session memorialized a Pattern for handling path-convention drift between workstreams. Today's session memorialized **"In-table inline-cell parallel-component set to URL-detail-page EditableField primitives"** — when a feature needs the same edit-affordance in two visual contexts (here: per-cell in a dense table vs. per-field in a labeled detail panel), prefer a parallel-component set over forcing the existing components to handle both via configuration props. Pairs with Session 3's "OverallAnalysisBox parallel to PerItemAnalysisBox" Pattern as a meta-shape covering parallel-component for visual-context-divergence across both EDIT and ANALYSIS surfaces.
- **One prior Pattern was validated as reusable.** Workstream 2 Session 5 memorialized "Field-allowlist subset extraction" — a pure trust-boundary helper returning `{ ok, patch } | { ok, error }` discriminator the route spreads onto its Prisma update payload. Today's session applied that Pattern for the SECOND time on the new `competitionScore` field. Total P-46 applications of the Pattern = 2. Pattern travels cleanly.
- **18 new server-side tests landed.** The new `competition-score-validation.ts` trust-boundary helper has 18 node:test cases pinning down: integer-in-range (1, 50, 100) acceptance; null explicit-clear acceptance; below-min (0, -5) / above-max (101) / decimal / NaN / Infinity / string / boolean / array / explicit-undefined all rejected with the right error messages; unknown keys alongside `competitionScore` ignored. src/lib count is 726 → 744 (+18, exact match).
- **All 5 /scoreboard checks GREEN at new baselines.** Root tsc clean / extension tsc clean / 558 ext tests UNCHANGED / 744 src/lib tests (+18 from baseline 726) / 61 routes UNCHANGED (no new routes; competitionScore added to existing `urls/[urlId]` PATCH allowlist).
- **One LOW informational re-reproduction.** The P-43 cwd-leak class re-reproduced ONCE during /scoreboard (fifth reproduction overall; same Pattern as four prior reproductions; caught + recovered in ~30 seconds with the absolute-path template form).
- **Calibration data point continued:** Session 2 of 3-4 landed cleanly within the bundled scope. The pleasant discovery was that 3 of the 7 needed cell-editor primitives already existed in W2 Session 5's EditableField.tsx, so only 2 truly-new editor types were needed (InlineDateCell + InlineUrlCell beyond the parallel set).

**Workstream 3's second build session lands clean.** Session 3 (column resize + drag-reorder + font size) remains, then the Workstream 3 deploy session.

## What we'll do next session (in plain terms)

Next session is the **P-46 Workstream 3 Session 3 build** — column resize + drag-to-reorder rows + adjustable font size per §C.3 Session 3 spec.

What Session 3 covers (per §C.3):

- **Column resize** — drag handles on the right edge of each column header; widths persist per-user-per-project via `UserTablePreferences.columnWidths` (already in W1's schema). Drag right to widen; drag left to narrow; minimum + maximum widths enforced.
- **Drag-to-reorder rows** — grab handle on the left edge of each row; row order persists per-user-per-project via `UserTablePreferences.rowOrder` (already in W1's schema). The Competition Data table currently sorts by created-at desc by default; this feature lets the director impose a custom order.
- **Adjustable font size** — a small slider or stepper (10pt-24pt range per W1's `fontSize` Prisma column constraint) somewhere in the page header area or near the ColumnVisibilityBar; size persists per-user-per-project via `UserTablePreferences.fontSize`.

All three features consume `UserTablePreferences` fields that are already shipped in W1's schema. Session 3 wires them via the same auth-derived-userId route Session 1 shipped (`/api/projects/[projectId]/competition-scraping/table-preferences`). No new schema; no new routes; just new state + new components + extension of the existing PUT body shape.

The first task of Session 3 is the standard Rule 14f session-start scope-pick: bundle all 3 features (recommended — they all consume the same `UserTablePreferences` plumbing) vs. just column resize vs. just drag-to-reorder + font size. Per `feedback_recommendation_style.md` + `feedback_default_to_recommendation.md`, surface the bundled option as the recommended default.

**Schema-change-in-flight flag** enters NO; expected to STAY NO through Session 3 (all three features consume existing `UserTablePreferences` fields already shipped in W1's 2026-05-24 schema). Re-evaluate if a new feature surfaces that needs schema work.

No deploy in Session 3 — Workstream 3 follows the same multi-session shape as Workstream 2: 3-4 build sessions then one deploy session at the end (per the "Multi-session workstream deploy gate timing" Pattern memorialized 2026-05-23-c).

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-23-e (Workstream 3 Session 2 ✅ DONE-AT-CODE-LEVEL):

- **P-46 Workstream 3 Session 3 (Competition Data table redesign — final build session).** Column resize + drag-to-reorder rows + adjustable font size. Then a Workstream 3 deploy session ends the arc.
- **P-46 Workstream 4 (Comprehensive Competitor Analysis page).** ~2-3 sessions. NEW page hosting per-Project TipTap rich-text doc with hyperlinks back to URL detail pages + edit-mode toggle + back-button. Consumes the same `RichTextEditor` wrapper Workstream 2 Session 1 built (using the `variant='full'` branch).
- **P-46 Workstream 5 (Extension form additions + manual Reviews entry).** ~1-2 sessions. Adds Type / Description-1 / Description-2 / Price fields to the extension URL save form so they get captured at extension time + sent to PLOS server on save. Includes vklf.com-side manual Reviews entry tweaks based on real-Chrome usage. One deploy session ends this workstream + closes the P-46 arc.
- **P-47 Shadow DOM refactor (LOW; AFTER P-46).** ~2-3 sessions. Replaces the 80-event-listener band-aid from P-45 Build #2's Issue 2 fix with proper Shadow DOM isolation. LOW priority since band-aid works empirically.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions. Current two-captures workaround works fine. May be reduced in urgency now that Workstream 2's vklf.com-side image upload affordances are deployed.
- **P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk) — DEFERRED LOW.** May obsolete now that P-46 redesigned the URL detail page surface they live in.
- **W#2 graduation** after P-46 + P-47 + P-26 ship. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent; can happen any time.

---

**For:** the next Claude Code session — **P-46 Workstream 3 Session 3 build** (estimated ~2.5-3 hours: pre-build doc reads ~30 min + Rule 14f session-start scope-pick on bundling ~10 min + implementation ~90-120 min + /scoreboard verification ~10 min + end-of-session doc-batch ~30 min). Per Rule 23 Change Impact Audit: **UI-only build session** (no schema changes expected; consumes existing `UserTablePreferences` fields already shipped in W1's 2026-05-24 schema). **Schema-change-in-flight flag enters NO** (carrying from Session 2 — STAYS NO); **expected to stay NO** through Session 3 (revisit if a new schema column surfaces during planning — unlikely). **Rule 9 triggers planned this session: ZERO** (Workstream 3 Session 3 is a build session, not a deploy; the deploy happens at the end of Workstream 3 after Session 3 lands). **ONE push planned per `feedback_approval_scope_per_decision_unit.md`:** end-of-session push of the Workstream 3 Session 3 build commit + the doc-batch commit together to `origin/workflow-2-competition-scraping` (operationally adjacent; NO Rule 9 gate fires since this is a feature-branch push not `git push origin main`).

---

## Status of today's session

**W#2 polish P-46 Workstream 3 (Competition Data table redesign) Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-23-e on `workflow-2-competition-scraping`** via build commit `899afd4` (7 files +1414/-91). Second build session of the P-46 Workstream 3 implementation arc (Session 2 of 3-4 estimated per §C.3). Pure code session — no deploy, no schema change, no new dependencies, no fresh extension zip.

**Session shape (build session — single-branch; no main push):**

- Pre-build reads at session start (read `docs/COMPETITION_DATA_V2_DESIGN.md` §C.3 + §A.2 + §A.3 + §A.7 + §A.8 + §B 2026-05-23-d for the binding inputs).
- Rule 14f session-start scope-pick: director picked "Bundle: new columns + click-to-edit together (recommended)" over "Click-to-edit on existing columns only".
- Implementation: NEW `InlineCells.tsx` (~800 LOC compact in-table editor primitives) + NEW `competition-score-validation.ts` (~65 LOC trust-boundary helper) + 18 new node:test cases + extensions to `url-table-columns.ts` (+47 LOC) + major rewrite of `UrlTable.tsx` (+263/-109) + `CompetitionScrapingViewer.tsx` (+44) + `urls/[urlId]/route.ts` (+13).
- /scoreboard verification: all 5 checks GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 744 src/lib +18 from baseline 726 / 61 routes UNCHANGED); Check 6 Playwright SKIPPED per non-deploy-session convention.
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG with new §Entry 2026-05-23-e + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + the new §B 2026-05-23-e entry on COMPETITION_DATA_V2_DESIGN.md).
- ONE push at end-of-session per the canonical pattern in `feedback_approval_scope_per_decision_unit.md` (build commit + doc-batch commit pushed together to `origin/workflow-2-competition-scraping`).

**§4 Step 1c forced-picker NOT FIRED** — next-session task unambiguous (Workstream 3 Session 3 = column resize + drag-to-reorder rows + adjustable font size per §C.3 Session 3 spec; the bundling sub-pick is a §C.3 sub-scope picker not a §4 Step 1c picker).

**ZERO new DEFERRED items at session end (Rule 26)** — all 6 in-session TaskCreate tasks completed cleanly.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry this session — the P-46 Workstream 3 Session 2 closing §Entry 2026-05-23-e** capturing (a) the bundled-scope Rule 14f outcome; (b) validation of W2 S5's "Field-allowlist subset extraction" Pattern reusability via `competitionScore`; (c) the NEW "In-table inline-cell parallel-component set" reusable Pattern memorialization; (d) the UX behavior change — row-click → "↗" Open button; (e) P-43 cwd-leak class fifth re-reproduction (LOW informational); (f) calibration data point continuation.

**TWENTY-THIRD end-of-session run under the Rule 30 + §4 Step 4b template** (sequence prior to today: 2026-05-21-b → 2026-05-21-c → 2026-05-21-d → 2026-05-22 → 2026-05-22-b → 2026-05-21 → 2026-05-22-c → 2026-05-22-d → 2026-05-22-e → 2026-05-22-f → 2026-05-22-g → 2026-05-22-h → 2026-05-22-i → 2026-05-23 → 2026-05-24 → 2026-05-25 → 2026-05-26 → 2026-05-27 → 2026-05-28 → 2026-05-23-b → 2026-05-23-c → 2026-05-23-d → today). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; the P-46 Workstream 3 Session 3 build begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at today's end-of-session doc-batch commit (the commit that lands when the parent pushes this NEXT_SESSION.md after build commit `899afd4`). `main` remains at `9969427` (the 2026-05-23-c Workstream 2 deploy SHA — unchanged since then; today's W3 Session 1 + Session 2 build + doc-batch commits all live on workflow-2 only). So at the start of Session 3, `workflow-2-competition-scraping` is AHEAD of `main` by **4 commits** — Session 1's build commit `d846a97` + Session 1's doc-batch commit `3d6c97b` + today's Session 2 build commit `899afd4` + today's Session 2 doc-batch commit. Verify with `git log main..HEAD --oneline` — should show exactly those 4 commits.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-46 Workstream 3 Session 3 build, on `workflow-2-competition-scraping`.** Closes **(a.79) RECOMMENDED-NEXT**. This is the third of an estimated 3-4 build sessions covering the Competition Data table redesign per §C.3 of `docs/COMPETITION_DATA_V2_DESIGN.md`.

BUILD session — no deploy this session. Workstream 3 Session 1 (2026-05-23-d) landed the foundational preferences plumbing + horizontal `ColumnVisibilityBar` + sidebar removal. Workstream 3 Session 2 (2026-05-23-e) landed click-to-edit cell editors per §A.2 + 8 new data columns + the row-click → "↗" Open button UX behavior change. Session 3 builds column resize (drag column edges) + drag-to-reorder rows + adjustable font size per §C.3 Session 3 spec on top of Session 1's `UserTablePreferences` plumbing (consumes existing `columnWidths` / `fontSize` / `rowOrder` JSON columns from W1's schema).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify both branches' SHA relationships with `git log main..HEAD --oneline` — should show exactly 4 commits (Session 1's build commit `d846a97` + Session 1's doc-batch commit `3d6c97b` + today's Session 2 build commit `899afd4` + today's Session 2 doc-batch commit).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or implementation).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-46 polish-backlog entry (the Workstream sub-status grid showing WS#3 Sessions 1-2 of 3-4 ✅ DONE-AT-CODE-LEVEL + Session 3 NEXT per (a.79) — the binding input for today's scope).
- **`docs/COMPETITION_DATA_V2_DESIGN.md`** with focus on **§C.3 Workstream 3 implementation outline — Session 3** (the binding spec for this session's scope — column resize + drag-to-reorder + font size) + **§A.3 (server-side per-user `UserTablePreferences` Prisma model keyed by (userId, projectId) — binding decision Q3; the canonical source for `columnWidths` / `fontSize` / `rowOrder` field semantics)** + **§B 2026-05-23-e (Session 2's closing entry capturing the click-to-edit + new columns + UX behavior change architecture today's session inherits)** + **§B 2026-05-23-d (Session 1's closing entry capturing the foundational `UserTablePreferences` plumbing today's session extends)**. This doc is the canonical source of truth.
- `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx` — the table component Session 2 extended with `InlineCells` cell renderers; Session 3 adds column resize handles (drag right edge of column header → resize) + drag-to-reorder rows (grab handle on left edge of row → reorder).
- `src/app/projects/[projectId]/competition-scraping/components/url-table-columns.ts` — the canonical column registry now at 17 columns; Session 3 may extend with optional `width` defaults per column.
- `src/app/projects/[projectId]/competition-scraping/components/CompetitionScrapingViewer.tsx` — Session 1's preferences plumbing (GET at mount + 500ms-debounced PUT); Session 3 extends the PUT body shape to carry `columnWidths` + `fontSize` + `rowOrder` updates.
- `src/app/projects/[projectId]/competition-scraping/components/ColumnVisibilityBar.tsx` — Session 1's horizontal bar; Session 3 may add the font-size stepper next to it (or in a sibling control near the table header).
- `src/lib/competition-scraping/handlers/user-table-preferences.ts` — the DI-seam handler Session 1 shipped; the `extractTablePreferencesPatch` validator already accepts `columnWidths` / `fontSize` / `rowOrder` per W1's `WriteUserTablePreferencesRequest`; no extension needed unless new constraints surface.
- `prisma/schema.prisma` — confirm `UserTablePreferences` model carries `columnWidths` (Json) + `fontSize` (Int with min/max constraints) + `rowOrder` (Json) fields from W1 (it does — already shipped 2026-05-24).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (zero gates planned this session — build session, not a deploy) + Rule 14f (will fire at session start on bundle-all-3 vs. partial-bundle scope-pick) + Rule 18 (§A of `docs/COMPETITION_DATA_V2_DESIGN.md` stays frozen; §B 2026-05-XX is the new append for this session) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — UI-only build session expected; no schema; the 3 fields are all already in W1's schema) + Rule 25 (Multi-Workflow — single-branch session; no main push since not a deploy) + Rule 26 (DEFERRED items registry) + Rule 27 (Playwright forced-picker; SKIPPED per non-deploy-session convention) + Rule 30 (Session bookends) + §4 Step 4b extended template.

**Task shape (P-46 Workstream 3 Session 3 build — column resize + drag-to-reorder + font size):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or implementation. Cover: what we'll do in the session (Workstream 3 Session 3 per §C.3 — column resize + drag-to-reorder rows + adjustable font size, bundling status determined by scope picker), the schema-change-in-flight flag stays NO (default expectation), the ZERO Rule 9 gates planned (build session, not a deploy), the ONE push planned (end-of-session doc-batch).

2. **Pre-build reads** — execute the pre-build read list above. ~30 minutes. Verify §C.3 Session 3 spec + the 3 fields already exist in W1's schema + Session 1's `UserTablePreferences` plumbing + Session 2's `InlineCells` integration shape.

3. **Rule 14f session-start scope-pick** — surface the bundle-all-3 vs. partial-bundle picker. Per `feedback_default_to_recommendation.md`: surface the bundled option as the recommended default (all 3 features consume the same `UserTablePreferences` plumbing; the same debounced-PUT lifecycle Session 1 wired carries all 3) + default to it if director defers.

4. **Implementation** — landing the chosen scope. Column resize: drag handles on column header right edges + resize-by-drag logic + min/max width constraints + PUT-on-release with debounce. Drag-to-reorder rows: row drag handles on left edge + drag-drop reorder logic (likely using a library like react-dnd or HTML5 drag-and-drop natively) + PUT-on-drop with the new row order. Adjustable font size: stepper or slider control 10pt-24pt (W1's constraint) + UrlTable font-size CSS variable + PUT-on-change with debounce. Reuse the six memorialized Patterns from Workstream 2 + W3 Sessions 1-2 (PerItemAnalysisBox / OverallAnalysisBox / Per-record handler DI-seam / Field-allowlist subset extraction / Foundation-workstream path-convention drift / In-table inline-cell parallel-component set) where they apply.

5. **/scoreboard verification** — all 5 checks must GREEN at new baselines reflecting any test count changes. Check 6 Playwright SKIPPED per non-deploy-session convention.

6. **End-of-session doc-batch** covers ROADMAP (header bump + P-46 entry annotated with Workstream 3 Session 3 ✅ DONE-AT-CODE-LEVEL + Workstream sub-status grid updated with WS#3 Session 3 of 3-4 ✅ DONE-AT-CODE-LEVEL + (a.79) closed + new (a.80) opened for either Workstream 3 deploy session OR Session 4 if scope expanded) + CHAT_REGISTRY (header bump — 146th Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header bump only or new §Entry depending on whether new reusable Pattern surfaces) + NEXT_SESSION.md (rewritten for Workstream 3 deploy session OR Session 4) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + CLAUDE_CODE_STARTER (header bump only) + `docs/COMPETITION_DATA_V2_DESIGN.md` (NEW §B entry capturing Workstream 3 Session 3's landing). **ONE push** at end-of-session to `origin/workflow-2-competition-scraping` per the canonical pattern.

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** any picker that fires (Rule 14f session-start scope-pick / sub-scope choices during implementation) — surface the recommended path + default to it if director defers.

**Schema-change-in-flight flag:** STAYS **NO** (carrying from Session 2's NO). **Default expectation: stays NO** through Session 3 (the 3 fields `columnWidths` / `fontSize` / `rowOrder` are already in W1's `UserTablePreferences` schema; the new controls consume + write existing schema). **Re-evaluate if a new schema column surfaces during planning** (unlikely — W1 was comprehensive).

---

## Pre-session notes (offline steps for director between sessions)

**Required offline step BEFORE the next P-46 Workstream 3 Session 3 build session:** none. All infrastructure landed in prior sessions; Workstream 3 Session 3 begins purely with code work on `workflow-2-competition-scraping`.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking P-46 Workstream 3 Session 3 at all — can happen any time. Director-independent.

**Optional offline test BEFORE next session — try the click-to-edit affordance:** director may want to verify the new click-to-edit shape on the Competition Data table works as expected before Session 3 lands. The build is NOT yet deployed to vklf.com (Workstream 3 deploy session lands after Session 3); the changes only exist locally on `workflow-2-competition-scraping`. So this test would need a local Vercel preview deploy OR waiting until the Workstream 3 deploy session ends the arc. Either is fine; not blocking.

**Optional offline reading for director:** `docs/COMPETITION_DATA_V2_DESIGN.md` §C.3 Workstream 3 Session 3 outline (~2-minute skim) + §B 2026-05-23-e (today's Session 2 closing entry; captures the click-to-edit + new columns + UX behavior change + the new "In-table inline-cell parallel-component set" Pattern). Worth scanning before the next session if director wants context.

**Pre-session setup (informational — Claude will handle in-session):** the Workstream 3 Session 3 begins on `workflow-2-competition-scraping`; director's involvement is minimal — just the standard go-ahead after Step 7b plain-terms summary + the Rule 14f forced-picker on bundle-all-3 vs. partial-bundle scope-pick at session start. No pre-session terminal commands needed.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`).

**Rule 9 triggers planned this session: ZERO** — Workstream 3 Session 3 is a build session, not a deploy. No `git push origin main`; no `prisma db push` (default expectation — UI-only consuming existing schema); no `git reset --hard`; no `git push --force`; no `git branch -D`; no `rm -rf`; no SQL DELETE/DROP/TRUNCATE planned. ALL standard build-session conventions apply.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits a 🚨 alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any implementation work.

---

## Why this pointer was written this way (debug aid)

Today's session was the **second build session of P-46 Workstream 3** — the Competition Data table redesign. The session ran cleanly: pre-build reads (~30 min) → Rule 14f session-start scope-pick (bundled scope recommended; director picked) → implementation (~90-120 min including the parallel-component set design + the row-click → "↗" Open button UX behavior change) → /scoreboard 5/5 GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 744 src/lib +18 / 61 routes UNCHANGED) → end-of-session doc-batch (~30 min covering the 8-doc bundle). The bundled scope landed without scope creep; pleasant discovery that 3 of the 7 needed cell-editor primitives already existed in W2 Session 5's EditableField.tsx meant only 2 truly-new editor types (InlineDateCell + InlineUrlCell) were needed beyond the parallel set.

The natural next-session task per §C.3 sequencing is the **Workstream 3 Session 3 build** — column resize + drag-to-reorder rows + adjustable font size:

- **(Recommended)** Workstream 3 Session 3 — column resize (drag column edges) + drag-to-reorder rows + adjustable font size per §C.3 Session 3 spec — all 3 features bundled in one session since they consume the same `UserTablePreferences` plumbing (Session 1's auth-derived-userId route + Session 1's 500ms debounced PUT lifecycle). Recommended because (a) all 3 features touch the same plumbing seam; (b) splitting across sessions would require re-deriving the debounced-PUT batching logic 3 times; (c) §C.3 Session 3 spec enumerates all 3 as in-scope. The Rule 14f forced-picker at session-start will surface the bundling vs. partial-bundling choice; default-to-recommendation per `feedback_default_to_recommendation.md` guides the pick. ~2 sessions total estimated remaining for Workstream 3 (Session 3 + Workstream 3 deploy).

The shape of the Workstream 3 Session 3 build is **pure code session with ZERO Rule 9 gates** — no schema changes expected (consumes existing W1 schema + the 3 fields already in `UserTablePreferences`); pre-build reads → Rule 14f scope-pick → implementation → /scoreboard verification → end-of-session doc-batch (8-doc bundle) → ONE push at end-of-session to `origin/workflow-2-competition-scraping`.

**After the Workstream 3 implementation arc lands clean + the Workstream 3 deploy session follows, Workstream 4 (Comprehensive Competitor Analysis page) begins next.** ~2-3 sessions for Workstream 4 covering the rich-text editor integration on a new page + hyperlink-to-URL-detail-page wiring + edit/view-mode toggle + back-button. Then Workstream 5 (Extension form additions + manual Reviews entry). Then P-46 closes ✅ end-to-end. Then P-47 + P-26 + DEFERRED P-27 bugs (or absorbed obsolete) before W#2 graduation.

**Alternate next-session candidates if director shifts priorities at session start (after Workstream 3 Session 2 + before Session 3):**

- **Defer column resize, ship just drag-to-reorder + font size.** NOT recommended — splitting across sessions would re-derive the debounced-PUT batching 2-3 times; the bundled option avoids this.
- **Defer drag-to-reorder + font size, ship just column resize.** NOT recommended — same reason; column resize alone is also the most mechanically tricky of the three (drag-handle DOM choreography on column header edges) and shipping it alongside the simpler font-size + row-reorder gives natural complexity averaging within one session.
- **Skip ahead to Workstream 3 deploy session NOW (defer Session 3).** NOT recommended — Session 3 is in-scope per §C.3; shipping without it leaves the table at 17 columns with no resize / no row reorder / no font adjustment, which feels incomplete for the §C.3 deliverable.
- **Defer Workstream 3 + start P-47 Shadow DOM refactor.** ~2-3 sessions. NOT recommended — P-47 is LOW priority (band-aid works empirically) AND sequencing-wise the design doc explicitly noted Shadow DOM should wait until P-46 implementation fully lands.
- **Defer Workstream 3 + start P-26 below-fold scroll capture.** ~1-2 sessions. NOT recommended — P-26's urgency may be reduced now that Workstream 2's vklf.com-side image upload affordances are deployed.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.
- **A polish-detour ahead of Workstream 3 Session 3 if director wants pre-build infrastructure work.** No obvious candidate this time — the operational substrate is hardened across 3 layers (P-42 backup-memory hook + P-43 absolute-paths discipline + P-44 wxt build/zip wrappers); Workstream 3 Sessions 1-2 landed clean so there's no new substrate work surfaced. If director picks this path, surface the open polish landscape as a Rule 14f forced-picker.

Check `ROADMAP.md` for the canonical state. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §C.3 + §A.2 + §A.3 + §A.7 + §A.8 + §B 2026-05-24 through 2026-05-23-e for Workstream 3's binding scope + the 9 prior closing entries spanning Workstream 1 + Sessions 1-5 + the W2 deploy + Workstream 3 Sessions 1-2.
