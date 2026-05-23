# Next session

**Written:** 2026-05-25 (`session_2026-05-25_p46-workstream-2-session-1-tiptap-wrapper-and-per-item-analysis-on-captured-text` — end-of-session handoff after **W#2 polish P-46 Workstream 2 (URL detail page redesign) Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-25 on `workflow-2-competition-scraping`** — first build session of the P-46 Workstream 2 implementation arc (Session 1 of 3-5 estimated); landed the TipTap shared rich-text editor wrapper + the per-item Analysis text box on Captured Text as the first user-visible slice + the route-handler half (`PATCH text/[textId]` allowlist extension for `analysis` field validated via `isValidAnalysisPayload`). Build commit `b6e43fe` — 8 files +1572/-149 on `workflow-2-competition-scraping`; NOT pushed to main — Session 1 is a build session, not a deploy session. **Closes (a.71) RECOMMENDED-NEXT = P-46 Workstream 2 (URL detail page redesign) Session 1.** **Opens (a.72) RECOMMENDED-NEXT = P-46 Workstream 2 Session 2** on `workflow-2-competition-scraping` — wire per-item Analysis on Captured Image + Captured Video using the same `PerItemAnalysisBox` component (different `apiUrl` prop) + convert their galleries to card-list layout matching today's Captured Text precedent.

---

## What we did this session (in plain terms)

This was the **first build session of Workstream 2** — the URL detail page redesign that is the densest user-visible improvement of the entire P-46 arc. Today shipped the TipTap shared rich-text editor wrapper component + the first per-item Analysis text box on Captured Text + the route-handler half so the round-trip works end-to-end on the workflow-2 branch.

What landed today, in plain terms:

- **The URL detail page's Captured Text section looks visibly different.** It used to be a 5-column table of captured texts; now each captured text is a **vertical card** with the text body at the top + a per-item **Analysis text box** below it (a rich-text editor where the director writes their AI-ready analysis of that one captured text). The director picked card layout over 3 alternatives via a Rule 14f forced-picker (4 options previewed with ASCII mockups; card layout was the recommended option).
- **This card layout becomes the precedent** for Captured Image / Captured Video / Captured Reviews in subsequent Workstream 2 sessions — they all switch to the same card-list shape with the same per-item Analysis box underneath each item.
- **A new shared rich-text editor wrapper** (`RichTextEditor.tsx`) was built. Every TipTap usage in the rest of P-46 — per-item Analysis boxes on Image / Video / Review + per-category Overall Analysis boxes + URL-level Overall Competitor Analysis box + Workstream 4's Comprehensive Analysis page — all consume this one wrapper.
- **A new per-item Analysis box component** (`PerItemAnalysisBox.tsx`) was extracted. It owns the per-row save lifecycle (debounced auto-save after 500ms of typing pause + force-save on blur + a "Saving…" / "✓ Saved" / "Save failed" indicator). The same component will be reused for Image / Video / Review by passing a different API endpoint URL.
- **3 new npm dependencies installed** — `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link` at version 3.23.6. 50 packages added transitively; all compatible with React 19 + Next.js 16.
- **20 new automated unit tests** for the pure helpers that guard the trust boundary (so the route handler can reject misshapen data before it hits the database).
- **All five verification checks GREEN** at the new baselines (root tsc clean / extension tsc clean / 558 extension tests UNCHANGED / **622 server tests (+20 from baseline 602)** / **61 routes UNCHANGED** — no new routes; only extended the existing `text/[textId]` PATCH endpoint allowlist).

No schema changes today. The schema for the per-item Analysis fields already shipped in Workstream 1 (2026-05-24); today landed the route-handler half + the UI half together so the round-trip works.

**Schema-change-in-flight flag STAYS YES** — carrying from Workstream 1's `prisma db push` 2026-05-24. The schema is still live on Supabase + undeployed-aware on vklf.com. The flag stays YES through subsequent Workstream 2 + Workstream 3 sessions until the first deploy session ships the schema-aware code to vklf.com.

**Session 1 came in cleanly within the 3-5 sessions estimate** for Workstream 2 — exactly the planned scope landed (wrapper + per-item box + Captured Text card-list rewrite + route-handler half + node:test coverage). No scope overrun; no fix-forward; informational calibration data point captured in `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-25.

## What we'll do next session (in plain terms)

Next session is **P-46 Workstream 2 Session 2.** It applies today's card-list precedent + the `PerItemAnalysisBox` component to **Captured Image + Captured Video** — the next two capture types after Captured Text:

- **Convert the Captured Image gallery** on the URL detail page to a vertical card list (each card = one image + its existing metadata + a per-item Analysis text box at the bottom).
- **Convert the Captured Video gallery** to the same card-list shape.
- **Wire `PerItemAnalysisBox`** under each image card + each video card (passing the existing per-row PATCH endpoint URLs — `/api/.../images/[imageId]` + `/api/.../videos/[videoId]` — as the `apiUrl` prop).
- **Extend the route handlers** at `images/[imageId]/route.ts` + `videos/[videoId]/route.ts` PATCH allowlists for the `analysis` field — same fix shape as today's `text/[textId]` extension (allowlist `analysis` + validate via `isValidAnalysisPayload`; one-line addition per route).
- **May also start the per-category Overall Analysis boxes** — one rich-text editor per capture category (Text / Image / Video / Reviews) at the bottom of each category section, persisted to the new `CompetitorUrl.overallAnalyses` JSON bag column Workstream 1 added.

Adds 6-10 new node:test cases for the new route handler logic (bringing src/lib to roughly 628-632). No schema changes (Workstream 1 already covered all of P-46's schema). No new npm dependencies (TipTap landed this session). No deploy this session — Workstream 2 spans 3-5 sessions total before its deploy.

## What's still left on the total roadmap (in plain terms)

Major W#2 items as of session-end 2026-05-25:

- **P-46 Workstream 1 SCHEMA ✅ DONE-AT-CODE-LEVEL 2026-05-24.** Needs its own deploy session later (likely after Workstream 2 or 3 lands enough UI to demo the schema's reach).
- **P-46 Workstream 2 (URL detail page redesign) — IN PROGRESS.** Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-25 (this session; TipTap shared wrapper + per-item Analysis on Captured Text + card-list precedent). **Session 2 NEXT (recommended)** = Captured Image + Captured Video per-item Analysis + card-list layout + possibly per-category Overall Analysis boxes. Sessions 3-5 cover Captured Reviews + URL-level Overall Competitor Analysis + new Type/Description-1/Description-2/Price URL fields + Scraping Status toggle (Incomplete vs Complete; bidirectional mirror of Status column) + remove Sizes/Options UI + vklf.com-side image/video upload affordances + edit-affordances for descriptions/tags/metadata + delete-affordance for reviews + edit-thumbnail affordance for videos.
- **P-46 Workstream 3 (Competition Data table redesign).** ~3-4 sessions. ~12 new columns + click-to-edit on every cell + resizable column widths + drag-to-reorder rows + per-column show/hide toggles + adjustable font size + horizontal checkbox bar at top + cross-device-synced user preferences via `UserTablePreferences` model from Workstream 1.
- **P-46 Workstream 4 (Comprehensive Competitor Analysis page).** ~2-3 sessions. NEW page hosting per-Project TipTap rich-text doc (one per Project) with hyperlinks back to URL detail pages + edit-mode toggle + back-button. Consumes the same `RichTextEditor` wrapper this session built (using the `variant='full'` branch).
- **P-46 Workstream 5 (Extension form additions + manual Reviews entry).** ~1-2 sessions. Add Type / Description-1 / Description-2 / Price fields to the extension URL save form + vklf.com-side manual Reviews entry form. Deploy session ends this workstream + closes the P-46 arc.
- **P-47 Shadow DOM refactor (LOW; AFTER P-46).** ~2-3 sessions. Replaces the 80-event-listener band-aid from P-45 Build #2's Issue 2 fix with proper Shadow DOM isolation. LOW priority since band-aid works empirically.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions. Current two-captures workaround works fine. May be reduced in urgency by Workstream 2's vklf.com-side image upload affordances.
- **P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk) — DEFERRED LOW.** May obsolete with P-46 redesign which restructures the URL detail page surface they live in.
- **W#2 graduation** after P-46 + P-47 + P-26 ship. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking P-46):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`.

---

**For:** the next Claude Code session — **P-46 Workstream 2 Session 2** (estimated ~2-3 hours: pre-build doc reads ~30 min + Captured Image card-list rewrite ~30 min + Captured Video card-list rewrite ~30 min + 2 route-handler PATCH allowlist extensions ~15 min + node:test coverage ~30 min + /scoreboard verification + end-of-session doc-batch ~30 min). Per Rule 23 Change Impact Audit: **ADDITIVE + UI-only** (extends today's card-list pattern + `PerItemAnalysisBox` component to Captured Image + Captured Video; extends 2 existing PATCH routes with the same one-line `analysis` allowlist extension that today's `text/[textId]` route received; no schema changes — Workstream 1 already covered all of P-46's schema; no new npm dependencies — TipTap landed this session). No data risk (existing image/video rows render with empty Analysis text boxes per §A.11 "no data backfill needed"). Zero downstream W#1 / W#3 cross-tool impact. **Schema-change-in-flight flag enters YES** (carrying from Workstream 1's `prisma db push`); **stays YES** through Workstream 2 + Workstream 3 sessions until the first deploy session ships the schema-aware code to vklf.com. **Rule 9 triggers planned this session: ZERO** — no schema changes; no main push; pure code session. **ONE push planned** — end-of-session doc-batch + build commit to `origin/workflow-2-competition-scraping` (no main push since this is a build session, not a deploy session).

---

## Status of today's session

**W#2 polish P-46 Workstream 2 (URL detail page redesign) Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-25 on `workflow-2-competition-scraping`** — first build session of the P-46 Workstream 2 implementation arc; landed the TipTap shared rich-text editor wrapper (`RichTextEditor.tsx` 317 LOC) + the per-item Analysis text box component (`PerItemAnalysisBox.tsx` 174 LOC) on Captured Text as the first user-visible slice + pure helpers (`tiptap-helpers.ts` 92 LOC including the `isValidAnalysisPayload` route-trust-boundary guard) + 20 new node:test cases for the helpers + the route-handler half (`PATCH text/[textId]` allowlist extension for `analysis` field validated at the trust boundary). Build commit `b6e43fe` — 8 files +1572/-149 on `workflow-2-competition-scraping`; NOT pushed to main since Workstream 2 Session 1 is a build session.

**Session shape (build session — shared wrapper + first capture type wiring + first route-handler half):**

- Pre-build reads at session start (read `docs/COMPETITION_DATA_V2_DESIGN.md` §A.5 + §A.12 + §A.15 + §C.2 + §B 2026-05-24 + `prisma/schema.prisma` empirical state + `src/lib/shared-types/competition-scraping.ts`).
- Designed the TipTap shared wrapper API (props: initial JSON / on-change callback / read-only mode / placeholder / debounce-ms / variant `'minimal' | 'full'`) + the per-item Analysis box (renders the wrapper + owns save-lifecycle + status indicator).
- Rule 14f forced-picker fired ONCE mid-session — visual layout of the per-item Analysis box on Captured Text (4 options previewed with ASCII mockups; director picked Option A "Card layout — replace the table (recommended)" over B expandable row / C sixth column / D inline sub-row).
- Installed 3 new npm dependencies (`@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link` at 3.23.6; 50 packages added transitively; all compatible with React 19 + Next.js 16).
- Scaffolded `src/lib/rich-text/tiptap-helpers.ts` (92 LOC pure helpers — `EMPTY_TIPTAP_DOC` / `isEmptyTipTapDoc` / `normalizeTipTapInput` / `isValidAnalysisPayload`; deliberately free of `@tiptap/*` imports so node:test loads them cleanly) + 20 new node:test cases.
- Built `RichTextEditor.tsx` (317 LOC platform-shared TipTap wrapper; minimal toolbar; forward-compatible `variant` prop; debounced on-change 500ms + onBlur flush + SSR-safe via `immediatelyRender: false`).
- Built `PerItemAnalysisBox.tsx` (174 LOC; owns per-row save lifecycle; reusable across capture types via `apiUrl` prop).
- Rewrote `CapturedTextSubsection` in `UrlDetailContent.tsx` from 5-column HTML table to vertical card list with new `CapturedTextCard` + `CapturedTextSortControl` helpers; removed unused `SortableHeader` + `textCellStyle`.
- Extended `PATCH /api/projects/[projectId]/competition-scraping/text/[textId]` allowlist for `analysis` field validated via `isValidAnalysisPayload` at the trust boundary (rejects null / arrays / primitives).
- /scoreboard verification: all 5 checks GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / **622 src/lib +20 from baseline 602** / **61 routes UNCHANGED** — no new routes; only allowlist extension); Check 6 Playwright SKIPPED per non-deploy-session convention.
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + the new §B 2026-05-25 entry on COMPETITION_DATA_V2_DESIGN.md).
- ONE push at end-of-session to `origin/workflow-2-competition-scraping` (no main push since this is a build session; no Rule 9 trigger at the push since `feedback_approval_scope_per_decision_unit.md` scopes Rule 9 gates to schema-migration / main-push / destructive-op decision units, not feature-branch doc-batch pushes).

**§4 Step 1c forced-picker NOT FIRED** — next-session task unambiguous per the §C.2 Workstream 2 plan (after Captured Text comes Captured Image + Video next; same layout precedent; same `PerItemAnalysisBox` component reused; same one-line PATCH allowlist extension on the existing routes).

**ZERO new DEFERRED items at session end (Rule 26)** — all in-session tasks completed.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry this session** — the P-46 Workstream 2 Session 1 closing §Entry capturing (a) the Rule 14f picker outcome + the card-layout-replaces-table precedent set for the remaining 3 capture types + (b) the `PerItemAnalysisBox` extraction Pattern memorialized as a reusable component shape (one component owns per-row save lifecycle; reusable across capture types via `apiUrl` prop) for future per-row-edit-affordance work + (c) calibration data point — Session 1's "1 of 3-5 sessions" estimate landed cleanly within scope. No corrections-tier slip occurred this session.

**SIXTEENTH end-of-session run under the Rule 30 + §4 Step 4b template** (sequence prior to today: 2026-05-21-b → 2026-05-21-c → 2026-05-21-d → 2026-05-22 → 2026-05-22-b → 2026-05-21 → 2026-05-22-c → 2026-05-22-d → 2026-05-22-e → 2026-05-22-f → 2026-05-22-g → 2026-05-22-h → 2026-05-22-i → 2026-05-23 → 2026-05-24 → today). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-46 Workstream 2 Session 2 build session lands here (code commits stay on workflow-2 per the established pattern; deploy to main happens later, likely after Workstream 2 or Workstream 3 lands enough UI to demo the schema's reach). The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at the doc-batch commit landing after this NEXT_SESSION.md is written. `workflow-2-competition-scraping` will be 4 commits ahead of `main` at `ee8c79d` — the 2026-05-23 design-session doc-batch `d364063` + the 2026-05-24 Workstream 1 build commit `caad82a` + the 2026-05-24 doc-batch `fb19314` + today's build commit `b6e43fe` + today's end-of-session doc-batch (the commit that lands when the parent pushes the bundle); main doesn't move this session. After the next Workstream 2 Session 2 build commit + doc-batch, workflow-2 will be 6 commits ahead of main; will NOT be ff-merged to main since Session 2 is a build session, not a deploy session.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-46 Workstream 2 Session 2, on `workflow-2-competition-scraping`.** Closes **(a.72) RECOMMENDED-NEXT**. This is Session 2 of Workstream 2 (the URL detail page redesign — the densest user-visible improvement of the entire P-46 arc). Session 2 applies the card-list precedent + the `PerItemAnalysisBox` component shipped in Session 1 to **Captured Image + Captured Video** — converting their galleries to the same card-list layout + wiring per-item Analysis text boxes under each card + extending the existing PATCH routes (`images/[imageId]` + `videos/[videoId]`) for the `analysis` field. CODE session — no schema changes (Workstream 1 already covered all of P-46's schema); no new npm dependencies (TipTap landed in Session 1); no deploy session — code stays on `workflow-2-competition-scraping`; main doesn't move this session.

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or coding).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-46 polish-backlog entry (the Workstream sub-status grid showing WS#2 Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-25 + WS#2 Session 2 NEXT — the binding input for today's scope).
- **`docs/COMPETITION_DATA_V2_DESIGN.md`** with focus on **§C.2 Workstream 2 implementation outline** (the binding spec for what Workstream 2 builds + what Session 2 covers) + **§A.5 (TipTap library + per-item Analysis pattern)** + **§A.11 (schema additions including the per-item `analysis` JSON column on CapturedImage + CapturedVideo — already deployed at code level via Workstream 1)** + **§B 2026-05-24 (Workstream 1 closing entry — the schema state Session 2 reads against)** + **§B 2026-05-25 (Workstream 2 Session 1 closing entry — the card-layout precedent + the `PerItemAnalysisBox` extraction Pattern that Session 2 consumes)**. This doc is the canonical source of truth.
- `prisma/schema.prisma` — verify the empirical schema state for CapturedImage + CapturedVideo (the `analysis Json @default("{}")` column on each is what today's PATCH route extensions persist into).
- `src/lib/shared-types/competition-scraping.ts` — the wire-type surface Workstream 1 extended (Session 2 reads the `analysis` field on the Image + Video wire types).
- `src/lib/rich-text/tiptap-helpers.ts` + `tiptap-helpers.test.ts` — the pure helpers Session 1 shipped (the `isValidAnalysisPayload` guard runs in all 4 capture-type PATCH routes; today's session adds it to 2 more).
- `src/app/projects/[projectId]/competition-scraping/components/RichTextEditor.tsx` + `PerItemAnalysisBox.tsx` — Session 1's new components (today's session CONSUMES these; should not need to modify them — but if a small modification is needed to support image/video specifics, surface it via Rule 14f forced-picker).
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` — Session 1 rewrote `CapturedTextSubsection` to vertical card list; today rewrites the **CapturedImagesGallery** + **CapturedVideosSection** to the same card-list shape per Session 1's locked precedent. Read both gallery sections to understand the existing metadata-per-item shape before rewriting.
- `src/app/api/projects/[projectId]/competition-scraping/text/[textId]/route.ts` — Session 1's PATCH allowlist extension is the FIX-SHAPE TEMPLATE for today's `images/[imageId]/route.ts` + `videos/[videoId]/route.ts` extensions (allowlist `analysis` + validate via `isValidAnalysisPayload`; one-line addition per route + corresponding node:test cases).
- `src/app/api/projects/[projectId]/competition-scraping/images/[imageId]/route.ts` + `videos/[videoId]/route.ts` — the routes Session 2 extends with the same allowlist extension.
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-23 (the cross-reference pointer entry to the P-46 design doc — informational only).
- `docs/HANDOFF_PROTOCOL.md` Rule 14f (forced-picker if any fix-shape ambiguity surfaces — e.g., the per-category Overall Analysis boxes' UI shape if Session 2 starts those) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — ADDITIVE + UI-only; safe; no new dependencies) + Rule 26 (DEFERRED items registry) + Rule 30 (Session bookends) + §4 Step 4b extended template.

**Task shape (P-46 Workstream 2 Session 2):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or coding. Cover: what we'll do in the session (apply card-list precedent + PerItemAnalysisBox to Captured Image + Captured Video; extend 2 existing PATCH routes for the `analysis` field; node:test coverage; /scoreboard verification; end-of-session doc-batch), the ZERO Rule 9 gates planned (no schema; no main push), the schema-change-in-flight flag state (stays YES from Workstream 1's migration), the no-deploy shape (code stays on workflow-2; main doesn't move this session).

2. **Pre-build reads** — execute the pre-build read list above. ~30 minutes. Surface any drift between `docs/COMPETITION_DATA_V2_DESIGN.md` §C.2 + §B 2026-05-25's locked card-layout precedent and the existing CapturedImagesGallery + CapturedVideosSection render shapes (both should adapt cleanly — they already render in gallery shapes that are closer to card-list than the Captured Text table was).

3. **Rewrite `CapturedImagesGallery`** in `UrlDetailContent.tsx` to the vertical card list pattern Session 1 established for Captured Text. Each card holds the existing image tile + its metadata (category / composition / embeddedText / tags) + a `PerItemAnalysisBox` underneath wired to `/api/projects/[projectId]/competition-scraping/images/[imageId]` via the `apiUrl` prop. Match the visual shape of Session 1's `CapturedTextCard` for consistency.

4. **Rewrite `CapturedVideosSection`** to the same card-list pattern. Each card holds the existing video tile + its metadata + a `PerItemAnalysisBox` wired to `/api/projects/[projectId]/competition-scraping/videos/[videoId]`.

5. **Extend `PATCH /api/projects/[projectId]/competition-scraping/images/[imageId]/route.ts`** allowlist to accept `analysis` field validated via `isValidAnalysisPayload` at the trust boundary. One-line addition per the Session 1 `text/[textId]` template. Match the same error-shape (400 on invalid payload; 200 on successful update; consistent response body).

6. **Extend `PATCH /api/projects/[projectId]/competition-scraping/videos/[videoId]/route.ts`** with the same `analysis` allowlist extension. Same fix shape.

7. **Add node:test cases** for the 2 route handler extensions (likely 6-10 new cases total — happy path + invalid payload rejection + the `isValidAnalysisPayload` guard rejecting null / arrays / primitives on each route). Bring src/lib node:test count from 622 to ~628-632.

8. **OPTIONAL — may start per-category Overall Analysis boxes** if scope allows in-session. One rich-text editor per capture category (Text / Image / Video / Reviews) at the bottom of each category section, persisted to the new `CompetitorUrl.overallAnalyses` JSON bag column Workstream 1 added. Surface via Rule 14f forced-picker mid-session if the per-category boxes would extend the session beyond ~2.5 hours — defer the per-category boxes to Session 3 in that case.

9. **`/scoreboard` verification** — Check 1 root tsc clean / Check 2 extension tsc clean / Check 3 extension `npm test` 558/558 (no change — extension untouched) / Check 4 src/lib node:test 622 + 6-10 new cases / Check 5 `npm run build` 61 routes UNCHANGED (no new routes; only allowlist extensions) / Check 6 Playwright SKIPPED per non-deploy-session convention. All GREEN at new baselines.

10. **End-of-session doc-batch** covers ROADMAP (header bump + P-46 entry annotated with Workstream 2 Session 2 progress; closes (a.72) + opens (a.73) for Workstream 2 Session 3) + CHAT_REGISTRY (header bump — 139th Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header bump only — likely zero new §Entries unless a process slip occurs) + NEXT_SESSION.md (rewritten for P-46 Workstream 2 Session 3) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + CLAUDE_CODE_STARTER (header bump only) + `docs/COMPETITION_DATA_V2_DESIGN.md` (NEW §B with the next session letter entry capturing Session 2's empirical landing). **ONE push** to `origin/workflow-2-competition-scraping` (no main push since this is a build session; no ping-pong sync since main doesn't move).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for any layout ambiguity that surfaces (e.g., card metadata ordering for Image vs. Text; whether per-item Analysis box appears below the image or beside it for wide tiles; whether per-category Overall Analysis boxes ship in Session 2 or defer to Session 3), surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers. Per `feedback_default_to_recommendation.md`, skip the picker if the question is asking permission to proceed on a path the director would default-approve (e.g., "should image cards match Captured Text card metadata-row ordering?" — yes per layout-precedent consistency; skip the picker).

**Schema-change-in-flight flag:** enters **YES** (carrying from Workstream 1's `prisma db push` 2026-05-24). **Stays YES** through subsequent Workstream 2 sessions + Workstream 3 sessions until the first deploy session ships the schema-aware code to vklf.com.

---

## Pre-session notes (offline steps for director between sessions)

**Required offline step BEFORE the next P-46 Workstream 2 Session 2:** none. Today's TipTap dependencies are already installed; today's session reads the existing schema (already migrated 2026-05-24).

**Standing optional offline step (NOT blocking P-46 Workstream 2 — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking P-46 Workstream 2 at all — can happen any time. Director-independent.

**Optional offline reading for director:** `docs/COMPETITION_DATA_V2_DESIGN.md` §C.2 Workstream 2 implementation outline (~2-minute skim) + §B 2026-05-25 (today's Workstream 2 Session 1 closing entry — the card-layout precedent + the `PerItemAnalysisBox` extraction Pattern; ~3-minute skim). Worth scanning before the next session if director wants context for how Captured Image + Captured Video adopt the same layout shape.

**Pre-build setup (informational — Claude will handle in-session):** the Workstream 2 Session 2 session doesn't sideload the extension or run any real-Chrome verification; the only "setup" is reading the existing CapturedImagesGallery + CapturedVideosSection render shapes before rewriting — no director involvement.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned.

**Rule 9 triggers planned this session: ZERO** — no schema changes (Workstream 1 already covered all of P-46's schema); no `git push origin main`; no `git reset --hard`; no `git push --force`; no `git branch -D`; no `rm -rf`; no SQL DELETE/DROP/TRUNCATE planned.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits a 🚨 alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any build work.

---

## Why this pointer was written this way (debug aid)

Today's session was the P-46 Workstream 2 Session 1 (TipTap shared wrapper + per-item Analysis on Captured Text as the first user-visible slice + the route-handler half for the simplest capture type). The session ran cleanly: 4-option Rule 14f forced-picker on visual layout resolved to card layout + the wrapper API picker was skipped per Default-to-recommendation (canonical TipTap wrapper API obvious) + the save-mechanism picker was skipped per Default-to-recommendation (debounced on-change + onBlur flush is the canonical Notion/Google-Docs UX shape) + 3 new npm dependencies installed cleanly + 20 new node:test cases + /scoreboard 5/5 GREEN at new baselines. The session came in cleanly within the 3-5 sessions estimate for Workstream 2 — no scope overrun.

The natural next-session task per §C.2 Workstream 2 implementation outline is **Workstream 2 Session 2** — apply the card-list precedent + the `PerItemAnalysisBox` component to Captured Image + Captured Video. Sessions 3-5 cover Captured Reviews + URL-level Overall Competitor Analysis + new Type/Description/Price URL fields + Scraping Status toggle + remove Sizes/Options UI + vklf.com-side upload/edit/delete affordances. No §4 Step 1c forced-picker needed because the §C.2 plan + the card-layout precedent + the PerItemAnalysisBox reusable component make the Session 2 task unambiguous.

The shape of the Workstream 2 Session 2 session is **pure code session with ZERO Rule 9 gates** — no schema changes (Workstream 1 covered all of P-46's schema); no new npm dependencies (TipTap landed in Session 1); 2 existing PATCH routes get one-line allowlist extensions; 2 existing render functions get rewritten to card-list shape using Session 1's components; node:test for the route extensions; /scoreboard GREEN at new baselines; doc-batch + ONE push to workflow-2 at end. No main push, no ff-merge, no Vercel auto-redeploy, no ping-pong sync — Workstream 2 Session 2 is a build session, not a deploy session.

**Alternate next-session candidates if director shifts priorities at session start (after Workstream 2 Session 1 + before Workstream 2 Session 2):**

- **Defer Workstream 2 Session 2 + skip ahead to Workstream 3 (Competition Data table redesign).** NOT recommended — Workstream 2 is half-complete (Session 1 ✅ DONE-AT-CODE-LEVEL but Sessions 2-5 pending); skipping ahead to Workstream 3 leaves Workstream 2 incomplete + introduces table-redesign work parallel to the URL-detail-page redesign that risks scope-collision. Better to finish Workstream 2 fully before starting Workstream 3.
- **Defer Workstream 2 Session 2 + start P-47 Shadow DOM refactor.** ~2-3 sessions. NOT recommended — P-47 is LOW priority (band-aid works empirically) AND sequencing-wise the design doc explicitly noted Shadow DOM should wait until P-46 implementation lands.
- **Defer Workstream 2 Session 2 + start P-26 below-fold scroll capture.** ~1-2 sessions. NOT recommended — P-46 is the big-scope item in flight; P-26 is much smaller + the workaround works; jumping to P-26 doesn't advance the W#2 graduation path.
- **Defer Workstream 2 Session 2 + start P-27 Bug #9 + Bug #15 (remaining deferred captured-videos polish leftovers).** NOT recommended — both bugs are LOW priority and may obsolete entirely with P-46's redesign.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.
- **A polish-detour ahead of Workstream 2 Session 2 if director wants pre-flight infrastructure work.** No obvious candidate this time — the operational substrate is hardened across 3 layers (P-42 backup-memory hook + P-43 absolute-paths discipline + P-44 wxt build/zip wrappers); Workstream 2 Session 1's landing was clean so there's no new substrate work surfaced. If director picks this path, surface the open polish landscape as a Rule 14f forced-picker.

Check `ROADMAP.md` for the canonical state. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §C.2 + §B 2026-05-24 + §B 2026-05-25 for Workstream 2's binding scope + the prior 2 sessions' empirical landing notes.
