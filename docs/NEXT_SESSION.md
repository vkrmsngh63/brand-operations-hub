# Next session

**Written:** 2026-05-23-d (`session_2026-05-23-d_p46-workstream-3-session-1-table-preferences-and-column-visibility-bar` — end-of-session handoff after **W#2 polish P-46 Workstream 3 (Competition Data table redesign) Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-23-d on `workflow-2-competition-scraping`** via build commit `d846a97` — 10 files +1369/-224. First build session of the P-46 Workstream 3 implementation arc (Session 1 of 3-4 estimated per §C.3). **Headline outcome:** the foundational `UserTablePreferences` plumbing + horizontal `ColumnVisibilityBar` at the top of the Competition Data table + deletion of the left-side `PlatformSidebar` all landed cleanly; column visibility persists per-user-per-project via the auth-derived-userId path that matches every other W#2 project-scoped route; path-convention refactor surfaced + executed at Rule 14f session-start picker — director picked "Refactor — match platform convention (recommended)" over "Keep current path, add ownership check"; NEW reusable Pattern memorialized **"Foundation-workstream path-convention drift surfaced by next-workstream session-start picker"** (pairs with the 2026-05-28 Session 4 path-divergence Pattern for URL-shape rather than nesting depth). Schema-change-in-flight flag STAYS NO (consumes existing Workstream 1 schema). **Closes (a.77) RECOMMENDED-NEXT = P-46 Workstream 3 Session 1.** **Opens (a.78) RECOMMENDED-NEXT = P-46 Workstream 3 Session 2 — click-to-edit cell editors per §C.3 Session 2 spec** on `workflow-2-competition-scraping`; potentially bundled with the ~12 new data columns since both touch UrlTable cell renderers.

---

## What we did this session (in plain terms)

Today was the **first build session of Workstream 3** — Competition Data table redesign. The Competition Data page (the table at the top of the Competition Scraping page that lists all competitor URLs in a project) gets ~3-4 build sessions of work, then one deploy session at the end. Today's session landed the foundation that Sessions 2-3 build click-to-edit / column resize / drag-reorder / font size on top of.

What happened, in plain terms:

- **The path-convention refactor caught at session start.** Workstream 1 (the schema session three weeks ago) scaffolded a 501-stub route at `/api/users/[userId]/table-preferences/[projectId]` — a path shape that's different from the rest of the Competition Scraping API. Every other Workstream 2 route lives under `/api/projects/[projectId]/competition-scraping/...` and derives the user ID from the auth session rather than reading it from the URL. Workstream 1 explicitly left a comment in the 501-stub saying "When Workstream 3 implements this route, either enforce auth.userId === params.userId at the auth check OR refactor to match the project-scoped convention. Surface this at next-workstream session start." Today's session fired a Rule 14f picker on this; director picked the refactor (most thorough; removes the special-case URL shape; removes the double-check; matches sibling routes). The W1 stub was deleted; a new route lives at `/api/projects/[projectId]/competition-scraping/table-preferences` with auth-derived userId.
- **The horizontal column visibility bar replaces the left-side platform sidebar.** Previously the Competition Data page had a 220px left column with platform navigation. Today's session landed a horizontal bar at the top of the table combining two checkbox groups: Platforms (All / Amazon / Ebay / Etsy / Walmart / Google Shopping / Google Ads / Independent Websites — single-select; all 7 platforms preserved from the deleted sidebar) + Columns (9 per-column show/hide toggles — one for each column in the table — multi-select). The bar owns no state of its own; it's driven by props from the parent page component, which seeds state from a GET to the new route at mount and writes state via a 500ms-debounced PUT on toggle.
- **The user preferences round-trip works end-to-end.** Director can toggle a column off in the UI; the toggle persists across page refreshes (loaded from the database via the GET at mount). Toggling persists across devices (the database row keys by userId + projectId). The 500ms debounce on writes means burst toggles only fire one network request after the burst settles.
- **The cell renderer architecture got a refactor.** The existing table component (`UrlTable.tsx`) used to render each column with a hand-coded `<td>` block per column. Today's session extracted those into a `Record<SortKey, (row) => ReactNode>` map. The tbody iterates over `visibleColumns` (the filtered list) and looks up each cell renderer by key. This eliminates duplicate visibility branches per column AND sets the stage cleanly for Session 2's click-to-edit work (the cell renderers will swap to editable variants per data type without touching the iteration logic).
- **34 new server-side tests landed.** The new handler module (`user-table-preferences.ts`) has 34 node:test cases pinning down: the strict trust-boundary validator (the 6 editable fields per `WriteUserTablePreferencesRequest` — columnVisibility / columnWidths / fontSize / rowOrder / lastUsedSortColumn / lastUsedSortDirection — each with valid/invalid shape coverage including arrays, nulls, non-booleans, negatives, out-of-range integers, unknown keys); the wire-shape coercion (Prisma JsonValue columns → typed wire shapes with bad-DB-shape fallbacks); the GET happy path + auth-403 + 404 + 500; the PUT happy path + auth-403 + 400-on-invalid-JSON + 400-on-bad-shape + 200-on-partial-patch + 500-on-prisma-throw + null-sort preservation. The test suite count is 692 → 726 (+34, exact match).
- **All 5 /scoreboard checks GREEN at new baselines.** Root tsc clean / extension tsc clean / 558 ext tests UNCHANGED / 726 src/lib tests (+34 from baseline 692, exact match) / 61 routes UNCHANGED (the new route replaced the deleted W1 stub at a net 0).
- **No new corrections-tier slip.** One informational §Entry landed (the closing §Entry for Session 1 capturing the path-convention refactor narrative + the new Pattern + the calibration data point that Session 1 of 3-4 landed cleanly within scope).
- **Calibration data point continued:** Session 1 of 3-4 estimated Workstream 3 sessions landed cleanly within the §C.3 Session 1 spec (preferences plumbing + horizontal bar + sidebar removal). Useful continuation of the calibration discipline started in the 2026-05-23-c §Entry; if §C.3 Sessions 2-4 are similarly well-specced, expect 3-4 build sessions + 1 deploy session = 4-5 Workstream 3 total.

**Workstream 3's first build session lands clean.** Sessions 2-3 build click-to-edit / new columns / column resize / drag-reorder / adjustable font size on top of today's plumbing. Session 4 (or whichever session ends Workstream 3) is the deploy session.

## What we'll do next session (in plain terms)

Next session is the **P-46 Workstream 3 Session 2 build** — click-to-edit cell editors per §C.3 Session 2 spec.

What Session 2 covers (per §C.3):

- **Click-to-edit on every cell** — director can edit any cell value by clicking it. Tab/Enter saves; Escape cancels. Spreadsheet-style feel. Each column's cell type gets its appropriate inline editor:
  - **Text cells** (URL / platform tags / any string fields) → `EditableTextField` from `EditableField.tsx` (already shipped in Session 5).
  - **Enum cells** (platform / scrapingStatus / any enum) → `EditableEnumField<T>` segmented-control from `EditableField.tsx` (also already shipped in Session 5).
  - **Number cells** (any integer columns) → new `EditableNumberField` to land Session 2.
  - **Decimal cells** (price / any decimal) → new `EditableDecimalField` to land Session 2.
  - **Boolean cells** (any yes/no toggle column) → new `EditableBooleanField` (or reuse `EditableEnumField<'true' | 'false'>`).
  - **Date cells** → new `EditableDateField` (native HTML date input).
  - **Tags cells** → new `EditableTagsField` (comma-separated parser).
- **Optional bundling with the 12 new data columns** — §C.3 enumerates ~12 new columns for the Competition Data table (Type / Description-1 / Description-2 / Price / various structural fields already shipped at URL-level in Session 5; the table-level mirror of those + a few new ones). Adding those columns AND wiring click-to-edit on them in the same session avoids double-rewriting the cell-renderer map. Recommended bundling.

The first task of Session 2 is the standard Rule 14f session-start scope-pick: bundle the 12 new columns with click-to-edit (recommended) vs. land just the click-to-edit editors on existing columns first (alternate). Per `feedback_recommendation_style.md` + `feedback_default_to_recommendation.md`, surface the bundled option as the recommended default.

**Schema-change-in-flight flag** enters NO; expected to STAY NO through Session 2 (the 12 new columns are already in `CompetitorUrl` from Workstream 1's schema; no new `prisma db push` needed). Re-evaluate if a new column shape surfaces that needs schema work.

No deploy in Session 2 — Workstream 3 follows the same multi-session shape as Workstream 2: ~3-4 build sessions then one deploy session at the end (per the "Multi-session workstream deploy gate timing" Pattern memorialized 2026-05-23-c).

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-23-d (Workstream 3 Session 1 ✅ DONE-AT-CODE-LEVEL):

- **P-46 Workstream 3 Sessions 2-3 (Competition Data table redesign).** ~2-3 more build sessions. Session 2 = click-to-edit cell editors per data type, potentially bundled with the 12 new data columns. Session 3 = column resize (drag column edges) + drag-to-reorder rows + adjustable font size. Then a Workstream 3 deploy session at the end.
- **P-46 Workstream 4 (Comprehensive Competitor Analysis page).** ~2-3 sessions. NEW page hosting per-Project TipTap rich-text doc with hyperlinks back to URL detail pages + edit-mode toggle + back-button. Consumes the same `RichTextEditor` wrapper Session 1 of Workstream 2 built (using the `variant='full'` branch).
- **P-46 Workstream 5 (Extension form additions + manual Reviews entry).** ~1-2 sessions. Adds Type / Description-1 / Description-2 / Price fields to the extension URL save form so they get captured at extension time + sent to PLOS server on save. Includes the vklf.com-side manual Reviews entry form (Workstream 2 already shipped the entry modal — this workstream may add tweaks based on real-Chrome usage). One deploy session ends this workstream + closes the P-46 arc.
- **P-47 Shadow DOM refactor (LOW; AFTER P-46).** ~2-3 sessions. Replaces the 80-event-listener band-aid from P-45 Build #2's Issue 2 fix with proper Shadow DOM isolation. LOW priority since band-aid works empirically.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions. Current two-captures workaround works fine. May be reduced in urgency now that Workstream 2's vklf.com-side image upload affordances are deployed (director can now upload images directly without below-fold capture).
- **P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk) — DEFERRED LOW.** May obsolete now that P-46 redesigned the URL detail page surface they live in (Workstream 2 deployed 2026-05-23-c).
- **W#2 graduation** after P-46 + P-47 + P-26 ship. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent; can happen any time.

---

**For:** the next Claude Code session — **P-46 Workstream 3 Session 2 build** (estimated ~2.5-3 hours: pre-build doc reads ~30 min + Rule 14f session-start scope-pick on bundling vs. not ~10 min + implementation ~90-120 min + /scoreboard verification ~10 min + end-of-session doc-batch ~30 min). Per Rule 23 Change Impact Audit: **UI-only build session** (no schema changes expected; consumes existing Workstream 1 schema columns; the 12 new data columns are all already in `CompetitorUrl`). **Schema-change-in-flight flag enters NO** (carrying from Session 1 — STAYS NO); **expected to stay NO** through Session 2 (revisit if a new schema column surfaces during planning — unlikely). **Rule 9 triggers planned this session: ZERO** (Workstream 3 Session 2 is a build session, not a deploy; the deploy happens at the end of Workstream 3 after Sessions 2-3 land). **ONE push planned per `feedback_approval_scope_per_decision_unit.md`:** end-of-session push of the Workstream 3 Session 2 build commit + the doc-batch commit together to `origin/workflow-2-competition-scraping` (operationally adjacent; NO Rule 9 gate fires since this is a feature-branch push not `git push origin main`).

---

## Status of today's session

**W#2 polish P-46 Workstream 3 (Competition Data table redesign) Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-23-d on `workflow-2-competition-scraping`** via build commit `d846a97` (10 files +1369/-224). First build session of the P-46 Workstream 3 implementation arc (Session 1 of 3-4 estimated per §C.3). Pure code session — no deploy, no schema change, no new dependencies, no fresh extension zip.

**Session shape (build session — single-branch; no main push):**

- Pre-build reads at session start (read `docs/COMPETITION_DATA_V2_DESIGN.md` §C.3 + §A.2 + §A.3 + §A.8 + §B 2026-05-24 through 2026-05-23-c for the binding inputs).
- Rule 14f session-start scope-pick: director picked Option A "Preferences plumbing + checkbox bar (recommended)" (§C.3 Session 1 spec) over Option B "New columns + click-to-edit foundation (alt)" + Option C "Combine both".
- Rule 14f path-convention refactor picker (mid-session): director picked "Refactor — match platform convention (recommended)" over "Keep current path, add ownership check".
- Implementation: NEW handler factory + 34 new tests + new route at the auth-derived-userId path + new `ColumnVisibilityBar` + new column registry + rewrites to `CompetitionScrapingViewer` + `UrlTable` + W1 501-stub DELETED + `PlatformSidebar` DELETED + doc-comment updates on shared-types.
- /scoreboard verification: all 5 checks GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 726 src/lib +34 from baseline 692 / 61 routes UNCHANGED); Check 6 Playwright SKIPPED per non-deploy-session convention.
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG with new §Entry 2026-05-23-d + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + the new §B 2026-05-23-d entry on COMPETITION_DATA_V2_DESIGN.md).
- ONE push at end-of-session per the canonical pattern in `feedback_approval_scope_per_decision_unit.md` (build commit + doc-batch commit pushed together to `origin/workflow-2-competition-scraping`).

**§4 Step 1c forced-picker NOT FIRED** — next-session task unambiguous (Workstream 3 Session 2 = click-to-edit cell editors per §C.3 Session 2 spec; only ordering choice is whether to bundle with the 12 new data columns, which is a §C.3 sub-scope picker not a §4 Step 1c picker).

**ZERO new DEFERRED items at session end (Rule 26)** — all 6 in-session TaskCreate tasks completed cleanly.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry this session — the P-46 Workstream 3 Session 1 closing §Entry 2026-05-23-d** capturing the path-convention refactor narrative + the new "Foundation-workstream path-convention drift surfaced by next-workstream session-start picker" Pattern + calibration data point (Session 1 of 3-4 landed cleanly within scope).

**TWENTY-SECOND end-of-session run under the Rule 30 + §4 Step 4b template** (sequence prior to today: 2026-05-21-b → 2026-05-21-c → 2026-05-21-d → 2026-05-22 → 2026-05-22-b → 2026-05-21 → 2026-05-22-c → 2026-05-22-d → 2026-05-22-e → 2026-05-22-f → 2026-05-22-g → 2026-05-22-h → 2026-05-22-i → 2026-05-23 → 2026-05-24 → 2026-05-25 → 2026-05-26 → 2026-05-27 → 2026-05-28 → 2026-05-23-b → 2026-05-23-c → today). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; the P-46 Workstream 3 Session 2 build begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at today's end-of-session doc-batch commit (the commit that lands when the parent pushes this NEXT_SESSION.md after build commit `d846a97`). `main` remains at `9969427` (the 2026-05-23-c Workstream 2 deploy SHA — the doc-batch commit `51e68f8` lives on workflow-2 only — wait, correction: the prior session's doc-batch ALSO landed on main via the canonical 3-push pattern's post-deploy ping-pong sync; both branches were even at `51e68f8` at end of 2026-05-23-c). So at the start of Session 2, `workflow-2-competition-scraping` is AHEAD of `main` by 2 commits — today's build commit `d846a97` + today's doc-batch commit. Verify with `git log main..HEAD --oneline` — should show exactly today's 2 commits.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-46 Workstream 3 Session 2 build, on `workflow-2-competition-scraping`.** Closes **(a.78) RECOMMENDED-NEXT**. This is the second of an estimated 3-4 build sessions covering the Competition Data table redesign per §C.3 of `docs/COMPETITION_DATA_V2_DESIGN.md`.

BUILD session — no deploy this session. Workstream 3 Session 1 (2026-05-23-d) landed the foundational preferences plumbing + horizontal `ColumnVisibilityBar` + sidebar removal. Session 2 builds click-to-edit cell editors per data type (text/number/decimal/enum/boolean/date/tags) on top of Session 1's cell-renderer map architecture, potentially bundled with the ~12 new data columns since both touch the same `UrlTable.tsx` cell renderer surface.

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify both branches' SHA relationships with `git log main..HEAD --oneline` — should show exactly 2 commits (today's build commit `d846a97` + today's doc-batch commit).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or implementation).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-46 polish-backlog entry (the Workstream sub-status grid showing WS#3 Session 1 of 3-4 ✅ DONE-AT-CODE-LEVEL 2026-05-23-d + Session 2 NEXT per (a.78) — the binding input for today's scope).
- **`docs/COMPETITION_DATA_V2_DESIGN.md`** with focus on **§C.3 Workstream 3 implementation outline — Session 2** (the binding spec for this session's scope) + **§A.2 (click-to-edit on every cell — binding decision Q2 — the canonical source for cell-editor semantics — Tab/Enter saves; Escape cancels; the EditableField components own the lifecycle)** + **§B 2026-05-23-d (Session 1's closing entry capturing the foundational cell-renderer map architecture today's session inherits)** + **§B 2026-05-24 through 2026-05-23-c (the rest of the Workstream 2 + deploy entries for context)**. This doc is the canonical source of truth.
- `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx` — the table component Session 1 refactored to use a cell-renderer map; Session 2 swaps the renderers to editable variants per data type without touching iteration logic.
- `src/app/projects/[projectId]/competition-scraping/components/url-table-columns.ts` — the canonical column registry; Session 2 may extend this with per-column data-type metadata (`'text' | 'number' | 'decimal' | 'enum' | 'boolean' | 'date' | 'tags'`) to drive the editor-type selection.
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/EditableField.tsx` — Session 5's `EditableTextField` + `EditableEnumField<T>` segmented-control components (both reusable in Session 2 for click-to-edit text + enum cells; Session 2 may add `EditableNumberField` + `EditableDecimalField` + `EditableBooleanField` + `EditableDateField` + `EditableTagsField` as new components in the same file or a sibling file).
- `prisma/schema.prisma` — confirm the 12 new `CompetitorUrl` columns are in place from Workstream 1's schema (so the new columns in Session 2 can be wired without any new schema migration).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (zero gates planned this session — build session, not a deploy) + Rule 14f (will fire at session start on bundle-with-12-new-columns vs. land-just-editors-first scope-pick) + Rule 18 (§A of `docs/COMPETITION_DATA_V2_DESIGN.md` stays frozen; §B 2026-05-XX is the new append for this session) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — UI-only build session expected; no schema; the 12 new columns are already in W1's schema) + Rule 25 (Multi-Workflow — single-branch session; no main push since not a deploy) + Rule 26 (DEFERRED items registry) + Rule 27 (Playwright forced-picker; SKIPPED per non-deploy-session convention) + Rule 30 (Session bookends) + §4 Step 4b extended template.

**Task shape (P-46 Workstream 3 Session 2 build — click-to-edit cell editors + potentially the 12 new data columns):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or implementation. Cover: what we'll do in the session (Workstream 3 Session 2 per §C.3 — click-to-edit cell editors per data type, potentially bundled with the 12 new data columns), the schema-change-in-flight flag stays NO (default expectation), the ZERO Rule 9 gates planned (build session, not a deploy), the ONE push planned (end-of-session doc-batch).

2. **Pre-build reads** — execute the pre-build read list above. ~30 minutes. Verify §C.3 Session 2 spec + the 12 new columns already exist in W1's schema + the existing `UrlTable.tsx` cell-renderer map shape Session 1 set.

3. **Rule 14f session-start scope-pick** — surface the bundle-with-12-new-columns vs. land-just-editors-first picker. Per `feedback_default_to_recommendation.md`: surface the bundled option as the recommended default (avoids double-rewriting the cell-renderer map between sessions) + default to it if director defers.

4. **Implementation** — landing the chosen scope. New `EditableNumberField` + `EditableDecimalField` + `EditableBooleanField` + `EditableDateField` + `EditableTagsField` components (extend `EditableField.tsx` or create siblings). New per-column data-type metadata in `url-table-columns.ts` driving editor-type selection. UrlTable cell-renderer map swap to editable variants. If bundling: add the 12 new column definitions to `url-table-columns.ts` + add their cell renderers to UrlTable. Wire PATCH requests through the existing `urls/[urlId]` PATCH route (Session 5 already extended its allowlist for the 4 URL-level structural fields — Session 2 may extend further for the table-level mirrors). Reuse the four memorialized extraction-shape Patterns from Workstream 2 (PerItemAnalysisBox / OverallAnalysisBox / Per-record handler DI-seam / Field-allowlist subset extraction) where they apply + the new "Foundation-workstream path-convention drift" Pattern from today if any further path-convention catches surface.

5. **/scoreboard verification** — all 5 checks must GREEN at new baselines reflecting any test count changes. Check 6 Playwright SKIPPED per non-deploy-session convention.

6. **End-of-session doc-batch** covers ROADMAP (header bump + P-46 entry annotated with Workstream 3 Session 2 ✅ DONE-AT-CODE-LEVEL + Workstream sub-status grid updated with WS#3 Session 2 of 3-4 ✅ DONE-AT-CODE-LEVEL + (a.78) closed + new (a.79) opened for Workstream 3 Session 3) + CHAT_REGISTRY (header bump — 145th Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header bump only or new §Entry depending on whether new reusable Pattern surfaces) + NEXT_SESSION.md (rewritten for Workstream 3 Session 3) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + CLAUDE_CODE_STARTER (header bump only) + `docs/COMPETITION_DATA_V2_DESIGN.md` (NEW §B entry capturing Workstream 3 Session 2's landing). **ONE push** at end-of-session to `origin/workflow-2-competition-scraping` per the canonical pattern.

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** any picker that fires (Rule 14f session-start scope-pick / sub-scope choices during implementation) — surface the recommended path + default to it if director defers.

**Schema-change-in-flight flag:** STAYS **NO** (carrying from Session 1's NO). **Default expectation: stays NO** through Session 2 (the 12 new columns are already in W1's `CompetitorUrl` schema; the cell editors consume + write existing schema). **Re-evaluate if a new schema column surfaces during planning** (unlikely — W1 was comprehensive).

---

## Pre-session notes (offline steps for director between sessions)

**Required offline step BEFORE the next P-46 Workstream 3 Session 2 build session:** none. All infrastructure landed in prior sessions; Workstream 3 Session 2 begins purely with code work on `workflow-2-competition-scraping`.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking P-46 Workstream 3 Session 2 at all — can happen any time. Director-independent.

**Optional offline reading for director:** `docs/COMPETITION_DATA_V2_DESIGN.md` §C.3 Workstream 3 Session 2 outline (~2-minute skim) + §B 2026-05-23-d (today's Session 1 closing entry; captures the new "Foundation-workstream path-convention drift" Pattern + the calibration data point that Session 1 landed within scope). Worth scanning before the next session if director wants context.

**Pre-session setup (informational — Claude will handle in-session):** the Workstream 3 Session 2 begins on `workflow-2-competition-scraping`; director's involvement is minimal — just the standard go-ahead after Step 7b plain-terms summary + the Rule 14f forced-picker on bundle-with-12-new-columns vs. land-just-editors-first scope-pick at session start. No pre-session terminal commands needed.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`).

**Rule 9 triggers planned this session: ZERO** — Workstream 3 Session 2 is a build session, not a deploy. No `git push origin main`; no `prisma db push` (default expectation — UI-only consuming existing schema); no `git reset --hard`; no `git push --force`; no `git branch -D`; no `rm -rf`; no SQL DELETE/DROP/TRUNCATE planned. ALL standard build-session conventions apply.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits a 🚨 alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any implementation work.

---

## Why this pointer was written this way (debug aid)

Today's session was the **first build session of P-46 Workstream 3** — the Competition Data table redesign. The session ran cleanly: pre-build reads (~30 min) → Rule 14f session-start scope-pick (Option A preferences plumbing + checkbox bar recommended; director picked) → implementation (~90-120 min including the path-convention refactor Rule 14f mid-session picker) → /scoreboard 5/5 GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 726 src/lib +34 / 61 routes UNCHANGED) → end-of-session doc-batch (~30 min covering the 8-doc bundle). The path-convention refactor caught at session-start was an in-scope bonus (W1 explicitly flagged it for next-workstream surfacing); the refactor cost was small (~70 LOC shim + 1 file delete + 1 file add) relative to the session total (1369 LOC).

The natural next-session task per §C.3 sequencing is the **Workstream 3 Session 2 build** — click-to-edit cell editors per data type, potentially bundled with the 12 new data columns:

- **(Recommended)** Workstream 3 Session 2 — click-to-edit cell editors per data type (text/number/decimal/enum/boolean/date/tags) reusing Session 5's `EditableTextField` + `EditableEnumField<T>` from `EditableField.tsx`, **bundled with the ~12 new data columns** since both touch UrlTable cell renderers. Recommended because (a) the cell-renderer map architecture Session 1 set is the natural seam where both changes land; (b) splitting them across Sessions 2-3 would require rewriting the cell-renderer map twice; (c) §C.3 Session 2 spec enumerates both as in-scope. The Rule 14f forced-picker at session-start will surface the bundling vs. not-bundling choice; default-to-recommendation per `feedback_default_to_recommendation.md` guides the pick. ~3 sessions total estimated remaining for Workstream 3 (Session 2 + Session 3 + Workstream 3 deploy).

The shape of the Workstream 3 Session 2 build is **pure code session with ZERO Rule 9 gates** — no schema changes expected (consumes existing W1 schema + the 12 new columns already in `CompetitorUrl`); pre-build reads → Rule 14f scope-pick → implementation → /scoreboard verification → end-of-session doc-batch (8-doc bundle) → ONE push at end-of-session to `origin/workflow-2-competition-scraping`.

**After the Workstream 3 implementation arc lands clean + the Workstream 3 deploy session follows, Workstream 4 (Comprehensive Competitor Analysis page) begins next.** ~2-3 sessions for Workstream 4 covering the rich-text editor integration on a new page + hyperlink-to-URL-detail-page wiring + edit/view-mode toggle + back-button. Then Workstream 5 (Extension form additions + manual Reviews entry). Then P-46 closes ✅ end-to-end. Then P-47 + P-26 + DEFERRED P-27 bugs (or absorbed obsolete) before W#2 graduation.

**Alternate next-session candidates if director shifts priorities at session start (after Workstream 3 Session 1 + before Session 2):**

- **Defer click-to-edit + start the 12 new data columns alone.** NOT recommended — splitting them across sessions requires rewriting the cell-renderer map twice; the bundled-recommended option avoids this.
- **Skip ahead to Workstream 3 Session 3 (column resize / drag-to-reorder / font size).** NOT recommended — click-to-edit on every cell is the more daily-felt UX improvement; resize + drag-reorder + font size are quality-of-life additions per §C.3.
- **Defer Workstream 3 + start P-47 Shadow DOM refactor.** ~2-3 sessions. NOT recommended — P-47 is LOW priority (band-aid works empirically) AND sequencing-wise the design doc explicitly noted Shadow DOM should wait until P-46 implementation fully lands.
- **Defer Workstream 3 + start P-26 below-fold scroll capture.** ~1-2 sessions. NOT recommended — P-26's urgency may be reduced now that Workstream 2's vklf.com-side image upload affordances are deployed.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.
- **A polish-detour ahead of Workstream 3 Session 2 if director wants pre-build infrastructure work.** No obvious candidate this time — the operational substrate is hardened across 3 layers (P-42 backup-memory hook + P-43 absolute-paths discipline + P-44 wxt build/zip wrappers); Workstream 3 Session 1 landed clean so there's no new substrate work surfaced. If director picks this path, surface the open polish landscape as a Rule 14f forced-picker.

Check `ROADMAP.md` for the canonical state. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §C.3 + §A.2 + §A.3 + §A.8 + §B 2026-05-24 through 2026-05-23-d for Workstream 3's binding scope + the 8 prior closing entries spanning Workstream 1 + Sessions 1-5 + the W2 deploy + today's Session 1.
