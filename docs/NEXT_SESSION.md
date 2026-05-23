# Next session

**Written:** 2026-05-26 (`session_2026-05-26_p46-workstream-2-session-2-per-item-analysis-on-captured-image-and-video` — end-of-session handoff after **W#2 polish P-46 Workstream 2 (URL detail page redesign) Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-26 on `workflow-2-competition-scraping`** — second build session of the P-46 Workstream 2 implementation arc (Session 2 of 3-5 estimated); applied Session 1's locked card-list precedent + the `PerItemAnalysisBox` reusable component to Captured Image + Captured Video as the next two capture types after Captured Text + extended the corresponding PATCH routes (`images/[imageId]` + `videos/[videoId]`) for the `analysis` field using the same one-line fix-shape Session 1 set for `text/[textId]`. Build commit `9747f63` — 4 files +325/-102 on `workflow-2-competition-scraping`; NOT pushed to main — Session 2 is a build session, not a deploy session. **Closes (a.72) RECOMMENDED-NEXT = P-46 Workstream 2 Session 2.** **Opens (a.73) RECOMMENDED-NEXT = P-46 Workstream 2 Session 3** on `workflow-2-competition-scraping` — multiple §C.2-aligned candidates surface (recommended: URL-level Overall Competitor Analysis box + per-category Overall Analysis boxes — completes the "Analysis surface" arc before moving to structural fields; alt: Captured Reviews UI; alt: new URL-level Type/Description/Price fields + Scraping Status toggle + remove Sizes/Options UI). Director picks at Session 3 start.

---

## What we did this session (in plain terms)

This was the **second build session of Workstream 2** — the URL detail page redesign. Session 1 (2026-05-25) shipped the TipTap shared rich-text editor wrapper + the first per-item Analysis text box on Captured Text + the route-handler half for the simplest capture type, and locked the card-list layout precedent via a 4-option Rule 14f forced-picker. Today's Session 2 applied that locked precedent to the next two capture types — Captured Image + Captured Video — and extended their PATCH routes the same way Session 1 extended `text/[textId]`.

What landed today, in plain terms:

- **The URL detail page's Captured Image gallery now looks like Captured Text from Session 1.** It used to be a grid of small image thumbnails; now each captured image is a **vertical card** with the image at the top (click still opens the existing image viewer with prev/next nav) + the existing metadata (category / composition / embedded text / tags / when added) + a per-item **Analysis text box** at the bottom (the rich-text editor where the director writes their AI-ready analysis of that one captured image).
- **The URL detail page's Captured Video gallery now looks the same way.** It used to be a 2-column card grid; now each captured video is a vertical card with the inline video player at the top (the YouTube/Vimeo embed for EMBED-type or the inline `<video controls>` player for direct-bytes / screen-recording types) + metadata + a per-item Analysis text box at the bottom.
- **The per-item Analysis box is the SAME component Session 1 built** — `PerItemAnalysisBox.tsx`. It's now reused 3 times (Text + Image + Video); it'll be reused a 4th time when Captured Reviews lands later in Workstream 2. The only thing that changes between capture types is one prop (the API endpoint URL the box saves to).
- **2 server-side endpoints were extended** to accept the new Analysis text — `/api/.../images/[imageId]` + `/api/.../videos/[videoId]` PATCH routes. Each one got the same one-line addition Session 1 made to `text/[textId]`: allow the `analysis` field through the request guard. No new endpoints — just two existing endpoints accepting one more field each.
- **6 new automated unit tests** were added to pin down exactly how the trust-boundary guard (`isValidAnalysisPayload`) handles edge cases (nested JSON / arbitrary keys / functions / Object.create(null) / empty TipTap doc / bigint). These tests document the guard's exact behavior so a regression there fails loud rather than silently corrupting a JSON column write.
- **No Rule 14f forced-pickers fired this session.** Every layout choice was a direct application of Session 1's locked precedent — matched the Captured Text card shape (pill + trash + hero + metadata + analysis) for both new card types; matched the same trash-button style for the image trash; kept the existing image-click-opens-viewer behavior; kept the existing inline video player.
- **All five verification checks GREEN** at the new baselines (root tsc clean / extension tsc clean / 558 extension tests UNCHANGED / **628 server tests (+6 from baseline 622)** / **61 routes UNCHANGED** — no new routes; only extended the existing image + video PATCH endpoint allowlists).

No schema changes today (the schema for the Analysis fields already shipped in Workstream 1 2026-05-24; Session 1 landed the first route-handler half; today landed the next two).

**Schema-change-in-flight flag STAYS YES** — carrying from Workstream 1's `prisma db push` 2026-05-24. Stays YES through subsequent Workstream 2 + Workstream 3 sessions until the first deploy session ships the schema-aware code to vklf.com.

**Session 2 came in cleanly within the 3-5 sessions estimate for Workstream 2** — exactly the planned scope landed (image gallery card-list rewrite + video gallery card-list rewrite + 2 route-handler extensions + 6 new tests). No scope overrun; no fix-forward; informational calibration data point captured in `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-26. Two consecutive in-scope Workstream 2 sessions confirms the §C.2 plan + the Session 1 abstraction were both well-specced.

## What we'll do next session (in plain terms)

Next session is **P-46 Workstream 2 Session 3.** Multiple §C.2-aligned candidates surface; director picks at Session 3 start:

- **(Recommended) URL-level Overall Competitor Analysis box + per-category Overall Analysis boxes.** This completes the "Analysis surface" arc across all capture levels — per-item analysis (Sessions 1-2; one rich-text box per individual captured text/image/video; landed) + per-category analysis (Session 3; one rich-text box at the bottom of each capture section synthesizing all items in that category) + URL-level analysis (Session 3; one rich-text box at the bottom of the URL detail page synthesizing all categories) — before moving to structural URL-level fields. Consumes the same `RichTextEditor` wrapper Session 1 already shipped; persists to schema columns Workstream 1 already added (`CompetitorUrl.overallCompetitorAnalysis` for URL-level + `CompetitorUrl.overallAnalyses` JSON bag for per-category). No new components needed; no new schema; only new render code + new PATCH allowlist extensions for the URL-level field.
- **(Alt) Captured Reviews UI.** New card component matching Sessions 1-2's card-list shape + a manual-add modal so the director can enter reviews by hand on vklf.com (no extension review-capture in v1 per Q1's deferral) + flesh out the `CapturedReview` CRUD route handlers that Workstream 1 scaffolded as 501 stubs. Greenfield surface; slots into the same card-list precedent.
- **(Alt) New URL-level structural fields.** Type / Description-1 / Description-2 / Price (4 new text fields at the top of the URL box) + Scraping Status toggle (Incomplete / Complete; bidirectional mirror of the Competition Data table's Status column) + remove Sizes/Options UI (hide-UI-keep-data per Q6). Smaller individual changes but touches more existing surfaces.

Likely 6-10 new node:test cases for the chosen scope (bringing src/lib to roughly 634-638). No schema changes (Workstream 1 already covered all of P-46's schema). No new npm dependencies. No deploy this session — Workstream 2 spans 3-5 sessions total before its deploy.

## What's still left on the total roadmap (in plain terms)

Major W#2 items as of session-end 2026-05-26:

- **P-46 Workstream 1 SCHEMA ✅ DONE-AT-CODE-LEVEL 2026-05-24.** Needs its own deploy session later.
- **P-46 Workstream 2 (URL detail page redesign) — IN PROGRESS — 50% complete.** Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-25 (TipTap wrapper + per-item Analysis on Captured Text + card-list precedent). Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-26 (this session; same shape applied to Captured Image + Captured Video). **Session 3 NEXT (recommended)** = URL-level Overall Competitor Analysis + per-category Overall Analysis boxes (completes the Analysis surface arc). Sessions 4-5 cover whatever Session 3 doesn't pick + Captured Reviews + new Type/Description-1/Description-2/Price URL fields + Scraping Status toggle (Incomplete vs Complete; bidirectional mirror of Status column) + remove Sizes/Options UI + vklf.com-side image/video upload affordances + edit-affordances for descriptions/tags/metadata + delete-affordance for reviews + edit-thumbnail affordance for videos. Workstream 2 deploys to vklf.com after Sessions 3-5 complete.
- **P-46 Workstream 3 (Competition Data table redesign).** ~3-4 sessions. ~12 new columns + click-to-edit on every cell + resizable column widths + drag-to-reorder rows + per-column show/hide toggles + adjustable font size + horizontal checkbox bar at top + cross-device-synced user preferences via `UserTablePreferences` model from Workstream 1.
- **P-46 Workstream 4 (Comprehensive Competitor Analysis page).** ~2-3 sessions. NEW page hosting per-Project TipTap rich-text doc (one per Project) with hyperlinks back to URL detail pages + edit-mode toggle + back-button. Consumes the same `RichTextEditor` wrapper Session 1 built (using the `variant='full'` branch).
- **P-46 Workstream 5 (Extension form additions + manual Reviews entry).** ~1-2 sessions. Add Type / Description-1 / Description-2 / Price fields to the extension URL save form + vklf.com-side manual Reviews entry form. Deploy session ends this workstream + closes the P-46 arc.
- **P-47 Shadow DOM refactor (LOW; AFTER P-46).** ~2-3 sessions. Replaces the 80-event-listener band-aid from P-45 Build #2's Issue 2 fix with proper Shadow DOM isolation. LOW priority since band-aid works empirically.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions. Current two-captures workaround works fine. May be reduced in urgency by Workstream 2's vklf.com-side image upload affordances.
- **P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk) — DEFERRED LOW.** May obsolete with P-46 redesign which restructures the URL detail page surface they live in.
- **W#2 graduation** after P-46 + P-47 + P-26 ship. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking P-46):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`.

---

**For:** the next Claude Code session — **P-46 Workstream 2 Session 3** (estimated ~2-3 hours: pre-build doc reads ~30 min + session-start Rule 14f forced-picker for Session 3's scope ~10 min + the chosen scope's code work ~60-90 min + node:test coverage ~20 min + /scoreboard verification + end-of-session doc-batch ~30 min). Per Rule 23 Change Impact Audit: **ADDITIVE + UI-only** (extends the rich-text + card-list pattern Sessions 1-2 established to the next §C.2-aligned scope; consumes Workstream 1's existing schema columns; no schema changes; no new npm dependencies — TipTap landed in Session 1). No data risk (existing rows render with empty Analysis text boxes per §A.11 "no data backfill needed"). Zero downstream W#1 / W#3 cross-tool impact. **Schema-change-in-flight flag enters YES** (carrying from Workstream 1's `prisma db push`); **stays YES** through Workstream 2 + Workstream 3 sessions until the first deploy session ships the schema-aware code to vklf.com. **Rule 9 triggers planned this session: ZERO** — no schema changes; no main push; pure code session. **ONE push planned** — end-of-session doc-batch + build commit to `origin/workflow-2-competition-scraping` (no main push since this is a build session, not a deploy session).

---

## Status of today's session

**W#2 polish P-46 Workstream 2 (URL detail page redesign) Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-26 on `workflow-2-competition-scraping`** — second build session of the P-46 Workstream 2 implementation arc; applied Session 1's locked card-list precedent + the `PerItemAnalysisBox` reusable component to Captured Image + Captured Video as the next two capture types after Captured Text + extended the corresponding PATCH routes (`images/[imageId]` + `videos/[videoId]`) for the `analysis` field using the same one-line fix-shape Session 1 set for `text/[textId]`. Build commit `9747f63` — 4 files +325/-102 on `workflow-2-competition-scraping`; NOT pushed to main since Session 2 is a build session.

**Session shape (build session — extends Session 1's pattern to 2 more capture types + 2 route-handler halves):**

- Pre-build reads at session start (read `docs/COMPETITION_DATA_V2_DESIGN.md` §C.2 + §A.5 + §A.11 + §B 2026-05-24 + §B 2026-05-25 + `prisma/schema.prisma` empirical state + `src/lib/shared-types/competition-scraping.ts` + Session 1's `RichTextEditor.tsx` + `PerItemAnalysisBox.tsx` + `tiptap-helpers.ts` + the existing `text/[textId]` route extension as the fix-shape template).
- NO Rule 14f forced-pickers fired this session — every layout choice for the Image + Video cards was a direct application of Session 1's locked precedent per `feedback_default_to_recommendation.md` (matched Session 1's CapturedTextCard shape pill+trash+hero+metadata+analysis for both new card types; matched `rowTrashButtonStyle` for the image trash button; kept the existing `ThumbnailButton` as the image hero; kept the existing inline player render for the video hero; per-row Analysis box placed below metadata rows matching Session 1's precedent).
- Rewrote `CapturedImagesGallery` in `UrlDetailContent.tsx` from a thumbnail grid (`gridTemplateColumns: repeat(auto-fill, minmax(140px, 1fr))`) to a vertical card list (`display: flex; flexDirection: column; gap: 12px`) with new `CapturedImageCard` helper carrying pill + trash + image hero via existing `ThumbnailButton` + metadata rows + `PerItemAnalysisBox`.
- Rewrote `CapturedVideosGallery` from a 2-col card grid (`gridTemplateColumns: repeat(auto-fill, minmax(280px, 1fr))`) to the same vertical card-list shape with new `CapturedVideoCard` helper carrying pill + inline `<iframe>` (EMBED) or `<video controls>` (DIRECT_BYTES / SCREEN_RECORDING) hero with `maxWidth: 480px` cap + metadata rows + `PerItemAnalysisBox`. Threaded `projectId` prop from parent's `project.id`.
- Removed unused `thumbnailTrashButtonStyle` (the overlay-trash style for the now-deleted thumbnail-grid render model).
- Extended `PATCH /api/.../images/[imageId]/route.ts` allowlist for `analysis` field validated via `isValidAnalysisPayload` at the trust boundary. One import + one conditional block. Identical fix-shape as Session 1's `text/[textId]` extension.
- Extended `PATCH /api/.../videos/[videoId]/route.ts` with the same `analysis` allowlist extension. Same fix shape.
- Added 6 new edge-case node:test cases for `isValidAnalysisPayload` in `tiptap-helpers.test.ts` pinning down the trust-boundary guard's contract (nested object → true; plain object with arbitrary keys → true; function → false; Object.create(null) → true; TipTap doc with empty content array → true; bigint → false). Test count 622 → 628 (+6).
- /scoreboard verification: all 5 checks GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / **628 src/lib +6 from baseline 622** / **61 routes UNCHANGED** — no new routes; only allowlist extensions); Check 6 Playwright SKIPPED per non-deploy-session convention.
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + the new §B 2026-05-26 entry on COMPETITION_DATA_V2_DESIGN.md).
- ONE push at end-of-session to `origin/workflow-2-competition-scraping` (no main push since this is a build session; no Rule 9 trigger at the push since `feedback_approval_scope_per_decision_unit.md` scopes Rule 9 gates to schema-migration / main-push / destructive-op decision units, not feature-branch doc-batch pushes).

**§4 Step 1c forced-picker NOT FIRED** — Session 3 task candidates ALL align with §C.2 Workstream 2 plan; the director-pick choice between them is a scope-ordering preference (which §C.2 sub-scope lands first), not an unknown next-session task. The pointer file enumerates the candidates so director can choose at Session 3 start; pre-build reads will identify which candidate's surfaces are cleanest to touch first.

**ZERO new DEFERRED items at session end (Rule 26)** — all 8 in-session tasks completed.

**NO new CORRECTIONS_LOG §Entry this session** — no fix-shape ambiguity; no estimate slip; no process slip; Session 2 landed cleanly within the 3-5-session Workstream 2 estimate mirroring Session 1's clean landing. (Optional informational calibration §Entry was considered + skipped per default-to-skip; the calibration data point is captured in design doc §B 2026-05-26 instead.)

**SEVENTEENTH end-of-session run under the Rule 30 + §4 Step 4b template** (sequence prior to today: 2026-05-21-b → 2026-05-21-c → 2026-05-21-d → 2026-05-22 → 2026-05-22-b → 2026-05-21 → 2026-05-22-c → 2026-05-22-d → 2026-05-22-e → 2026-05-22-f → 2026-05-22-g → 2026-05-22-h → 2026-05-22-i → 2026-05-23 → 2026-05-24 → 2026-05-25 → today). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-46 Workstream 2 Session 3 build session lands here (code commits stay on workflow-2 per the established pattern; deploy to main happens later, likely after Workstream 2 + possibly Workstream 3 lands enough UI to demo the schema's reach). The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at the doc-batch commit landing after this NEXT_SESSION.md is written. `workflow-2-competition-scraping` will be 6 commits ahead of `main` at `ee8c79d` — the 2026-05-23 design-session doc-batch `d364063` + the 2026-05-24 Workstream 1 build commit `caad82a` + the 2026-05-24 doc-batch `fb19314` + the 2026-05-25 Workstream 2 Session 1 build commit `b6e43fe` + the 2026-05-25 doc-batch `9f555d0` + today's build commit `9747f63` + today's end-of-session doc-batch (the commit that lands when the parent pushes the bundle); main doesn't move this session. After the next Workstream 2 Session 3 build commit + doc-batch, workflow-2 will be 8 commits ahead of main; will NOT be ff-merged to main since Session 3 is a build session, not a deploy session.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-46 Workstream 2 Session 3, on `workflow-2-competition-scraping`.** Closes **(a.73) RECOMMENDED-NEXT**. This is Session 3 of Workstream 2 (the URL detail page redesign — the densest user-visible improvement of the entire P-46 arc; Workstream 2 reached the 50% mark at Session 2). Session 3's scope is one of three §C.2-aligned candidates — director picks at session start via Rule 14f forced-picker between:

- **(Recommended) URL-level Overall Competitor Analysis box + per-category Overall Analysis boxes** — completes the "Analysis surface" arc across all capture levels before structural fields. Consumes the same `RichTextEditor` wrapper Session 1 already shipped; persists to `CompetitorUrl.overallCompetitorAnalysis` + `CompetitorUrl.overallAnalyses` from Workstream 1's schema (no new schema columns; the columns already exist). Adds per-category Overall Analysis boxes (one rich-text editor per capture category — Text / Image / Video / and a placeholder for Reviews) at the bottom of each capture section + one URL-level Overall Competitor Analysis box at the bottom of the URL detail page synthesizing all categories. Adds a new server-side PATCH route (or extends an existing one) at `/api/projects/[projectId]/competition-scraping/url/[urlId]` for the URL-level fields — or extends the existing per-URL PATCH route stub Workstream 1 scaffolded. ~6-10 new node:test cases for the new route handler logic.
- **(Alt) Captured Reviews UI** — new `CapturedReviewCard` matching Sessions 1-2's card-list shape + manual-add modal so the director can enter reviews by hand on vklf.com + flesh out the `CapturedReview` CRUD route handlers Workstream 1 scaffolded as 501 stubs. Greenfield card type slots into the same card-list precedent; bigger structural shift since Reviews is greenfield (no prior render to convert).
- **(Alt) New URL-level structural fields** — Type / Description-1 / Description-2 / Price (4 new text fields at the top of the URL box) + Scraping Status toggle (Incomplete / Complete; bidirectional mirror of the Competition Data table's Status column) + remove Sizes/Options UI (hide-UI-keep-data per Q6). Smaller individual changes; touches more existing surfaces.

CODE session — no schema changes (Workstream 1 already covered all of P-46's schema); no new npm dependencies (TipTap landed in Session 1); no deploy session — code stays on `workflow-2-competition-scraping`; main doesn't move this session.

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or coding).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-46 polish-backlog entry (the Workstream sub-status grid showing WS#2 Sessions 1-2 ✅ DONE-AT-CODE-LEVEL + Session 3 NEXT — the binding input for today's scope).
- **`docs/COMPETITION_DATA_V2_DESIGN.md`** with focus on **§C.2 Workstream 2 implementation outline** (the binding spec for what Workstream 2 builds + what Session 3 covers) + **§A.5 (TipTap library + per-item Analysis pattern)** + **§A.11 (schema additions including the `overallCompetitorAnalysis` Text column + the `overallAnalyses` JSON bag column on `CompetitorUrl` — both already deployed at code level via Workstream 1; both consumed by the recommended Session 3 scope)** + **§B 2026-05-24 (Workstream 1 closing entry — the schema state Session 3 reads against)** + **§B 2026-05-25 (Workstream 2 Session 1 closing entry — the card-layout precedent + the `PerItemAnalysisBox` extraction Pattern)** + **§B 2026-05-26 (Workstream 2 Session 2 closing entry — the Session 2 file-by-file + the "card-list pattern propagates cleanly" empirical observation)**. This doc is the canonical source of truth.
- `prisma/schema.prisma` — verify the empirical schema state for the `CompetitorUrl` columns the recommended Session 3 scope reads (`overallCompetitorAnalysis Text?` + `overallAnalyses Json @default("{}")`) — both deployed at code level via Workstream 1.
- `src/lib/shared-types/competition-scraping.ts` — the wire-type surface Workstream 1 extended (Session 3 reads the URL-level + per-category Analysis fields on the wire types).
- `src/lib/rich-text/tiptap-helpers.ts` + `tiptap-helpers.test.ts` — the pure helpers Session 1 shipped + the 6 new edge-case tests Session 2 added (the `isValidAnalysisPayload` guard is the trust-boundary check; today's session adds it to the URL-level PATCH route too if that's the chosen scope).
- `src/app/projects/[projectId]/competition-scraping/components/RichTextEditor.tsx` + `PerItemAnalysisBox.tsx` — Session 1's new components (today's session CONSUMES these for the per-category + URL-level Analysis boxes; should not need to modify them — but if a small modification is needed to support a URL-level non-per-row box, surface it via Rule 14f forced-picker).
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` — Sessions 1-2 rewrote `CapturedTextSubsection` + `CapturedImagesGallery` + `CapturedVideosGallery` to vertical card lists; today extends the page with either (recommended) the per-category Overall Analysis boxes at the bottom of each capture section + the URL-level Overall Competitor Analysis box at the bottom of the URL detail page; OR (alt) the Captured Reviews section; OR (alt) the new URL-level structural fields at the top of the URL box. Read the existing URL-box render at the top of the file + the existing per-section structure to understand the insertion points.
- For the recommended scope: the existing URL-level PATCH route stub at `/api/projects/[projectId]/competition-scraping/url/[urlId]` (Workstream 1 should have scaffolded it as a 501 stub for the new fields including `overallCompetitorAnalysis` + `overallAnalyses`) — read the existing shape before extending. For the Captured Reviews alt scope: read the `CapturedReview` CRUD route stubs Workstream 1 scaffolded. For the new URL-level fields alt scope: read the URL box render in `UrlDetailContent.tsx`.
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-23 (the cross-reference pointer entry to the P-46 design doc — informational only).
- `docs/HANDOFF_PROTOCOL.md` Rule 14f (forced-picker REQUIRED at session start to pick between the 3 Session 3 candidates + may fire again mid-session if any fix-shape ambiguity surfaces within the chosen scope) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — ADDITIVE + UI-only; safe; no new dependencies) + Rule 26 (DEFERRED items registry) + Rule 30 (Session bookends) + §4 Step 4b extended template.

**Task shape (P-46 Workstream 2 Session 3):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or coding. Cover: what we'll do in the session (Rule 14f forced-picker to pick Session 3's scope from the 3 candidates + execute the chosen scope's code work + node:test coverage + /scoreboard verification + end-of-session doc-batch), the ZERO Rule 9 gates planned (no schema; no main push), the schema-change-in-flight flag state (stays YES from Workstream 1's migration), the no-deploy shape (code stays on workflow-2; main doesn't move this session).

2. **Pre-build reads** — execute the pre-build read list above. ~30 minutes. Surface any drift between §C.2's locked plan + Sessions 1-2's empirical landing.

3. **Rule 14f forced-picker — pick Session 3's scope from the 3 candidates.** Surface the 3 options with the rationale shape captured in §B 2026-05-26 of the design doc + recommend Option A (URL-level Overall Competitor Analysis + per-category Overall Analysis boxes) because it completes the "Analysis surface" arc across all capture levels before moving to structural fields, and because it consumes already-shipped infrastructure (Session 1's `RichTextEditor` wrapper + Workstream 1's `overallCompetitorAnalysis` + `overallAnalyses` schema columns) without needing new components or new schema. Per `feedback_default_to_recommendation.md`, default to Option A if director defers. The chosen scope shape locks the next set of tasks.

4. **Execute the chosen scope's code work.** ~60-90 minutes. For Option A: render per-category Overall Analysis boxes at the bottom of `CapturedTextSubsection` + `CapturedImagesGallery` + `CapturedVideosGallery` (each one consumes `RichTextEditor` directly with `variant='minimal'` + writes to `CompetitorUrl.overallAnalyses[category]` JSON bag entry via a new or extended URL-level PATCH route) + render URL-level Overall Competitor Analysis box at the bottom of the URL detail page (also `RichTextEditor` minimal + writes to `CompetitorUrl.overallCompetitorAnalysis`); extend (or create) the URL-level PATCH route for both fields with `isValidAnalysisPayload` guards at the trust boundary. For Option B or C: see the candidate shapes in the design doc §C.2.

5. **Add node:test cases** for the new route handler logic. Likely 6-10 new cases (happy path + invalid payload rejection + the guard rejecting null / arrays / primitives per field; for Option A specifically: per-category JSON-bag write isolation; for Option B: the CapturedReview CRUD happy paths + 404 + auth checks; for Option C: the new structural-field allowlist + bidirectional mirror integrity). Bring src/lib node:test count from 628 to ~634-638.

6. **`/scoreboard` verification** — Check 1 root tsc clean / Check 2 extension tsc clean / Check 3 extension `npm test` 558/558 (no change — extension untouched) / Check 4 src/lib node:test 628 + 6-10 new cases / Check 5 `npm run build` 61 routes (UNCHANGED for Option A's URL-level PATCH-extension; +1 if Option A creates a new URL-level route; +1-2 for Option B's CapturedReview CRUD if new endpoints; UNCHANGED for Option C if only allowlist extensions) / Check 6 Playwright SKIPPED per non-deploy-session convention. All GREEN at new baselines.

7. **End-of-session doc-batch** covers ROADMAP (header bump + P-46 entry annotated with Workstream 2 Session 3 progress; closes (a.73) + opens (a.74) for Workstream 2 Session 4) + CHAT_REGISTRY (header bump — 140th Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header bump only — likely zero new §Entries unless a process slip occurs) + NEXT_SESSION.md (rewritten for P-46 Workstream 2 Session 4) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + CLAUDE_CODE_STARTER (header bump only) + `docs/COMPETITION_DATA_V2_DESIGN.md` (NEW §B 2026-05-?? entry capturing Session 3's empirical landing). **ONE push** to `origin/workflow-2-competition-scraping` (no main push since this is a build session; no ping-pong sync since main doesn't move).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for the Session 3 scope-pick at session start, recommend Option A explicitly + default to it if director defers. For any layout ambiguity within the chosen scope (e.g., per-category Overall Analysis box label format; URL-level Overall Competitor Analysis box position relative to the page footer), surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers. Per `feedback_default_to_recommendation.md`, skip the picker if the question is asking permission to proceed on a path the director would default-approve (e.g., "should per-category Overall Analysis boxes use the same `RichTextEditor` `variant='minimal'` Sessions 1-2 used for per-item Analysis?" — yes per layout-precedent consistency; skip the picker).

**Schema-change-in-flight flag:** enters **YES** (carrying from Workstream 1's `prisma db push` 2026-05-24). **Stays YES** through subsequent Workstream 2 sessions + Workstream 3 sessions until the first deploy session ships the schema-aware code to vklf.com.

---

## Pre-session notes (offline steps for director between sessions)

**Required offline step BEFORE the next P-46 Workstream 2 Session 3:** none. All infrastructure landed in prior sessions (TipTap dependencies in Session 1; schema in Workstream 1).

**Standing optional offline step (NOT blocking P-46 Workstream 2 — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking P-46 Workstream 2 at all — can happen any time. Director-independent.

**Optional offline reading for director:** `docs/COMPETITION_DATA_V2_DESIGN.md` §C.2 Workstream 2 implementation outline (~2-minute skim) + §B 2026-05-26 (today's Workstream 2 Session 2 closing entry — the empirical confirmation that the card-list pattern propagates cleanly across capture types; ~3-minute skim). Worth scanning before the next session if director wants context for which §C.2 candidate to pick at Session 3 start.

**Pre-build setup (informational — Claude will handle in-session):** the Workstream 2 Session 3 session doesn't sideload the extension or run any real-Chrome verification; the only "setup" is reading the URL-level + per-category render insertion points in `UrlDetailContent.tsx` before extending — no director involvement.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned.

**Rule 9 triggers planned this session: ZERO** — no schema changes (Workstream 1 already covered all of P-46's schema including the `overallCompetitorAnalysis` + `overallAnalyses` columns the recommended scope reads); no `git push origin main`; no `git reset --hard`; no `git push --force`; no `git branch -D`; no `rm -rf`; no SQL DELETE/DROP/TRUNCATE planned.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits a 🚨 alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any build work.

---

## Why this pointer was written this way (debug aid)

Today's session was P-46 Workstream 2 Session 2 (apply Session 1's locked card-list precedent + `PerItemAnalysisBox` reusable component to Captured Image + Captured Video + extend their PATCH routes for the `analysis` field). The session ran cleanly: ZERO Rule 14f forced-pickers fired (every layout choice was a direct application of Session 1's locked precedent per `feedback_default_to_recommendation.md`) + 4 files changed in build commit `9747f63` + 6 new edge-case node:test cases for `isValidAnalysisPayload` + /scoreboard 5/5 GREEN at new baselines. The session came in cleanly within the 3-5 sessions estimate for Workstream 2 mirroring Session 1's clean landing — no scope overrun.

The natural next-session task per §C.2 Workstream 2 implementation outline is **Workstream 2 Session 3** — but unlike Session 2 (where Session 1 left only one obvious next step — apply the same pattern to the next 2 capture types), Session 3 surfaces **three §C.2-aligned candidates** with no single forced-pick:

- **(Recommended) URL-level Overall Competitor Analysis + per-category Overall Analysis boxes.** Completes the "Analysis surface" arc across all capture levels before structural fields. Consumes already-shipped infrastructure (Session 1's `RichTextEditor` wrapper + Workstream 1's schema columns). Natural §C.2 next step after Sessions 1-2's per-item Analysis arc.
- **(Alt) Captured Reviews UI.** Greenfield surface; slots into the same card-list precedent; but Reviews has no extension-side capture in v1 per Q1's deferral, so the v1 surface is server-side render + manual-add modal only.
- **(Alt) New URL-level structural fields.** Type / Description-1 / Description-2 / Price + Scraping Status toggle + remove Sizes/Options UI. Smaller individual changes; touches more existing surfaces.

The Rule 14f forced-picker at Session 3 start gives director the choice; Claude's recommendation is Option A because it builds on momentum (the rich-text + card-list infrastructure is already in place + the schema columns it consumes are already deployed). Sessions 4-5 cover whatever Session 3 doesn't pick — so picking Option A leaves Sessions 4-5 for the Reviews UI + structural fields, which is a natural narrative arc; picking Option B or C leaves Option A + the others for Sessions 4-5.

The shape of the Workstream 2 Session 3 session is **pure code session with ZERO Rule 9 gates** — no schema changes (Workstream 1 covered all of P-46's schema); no new npm dependencies (TipTap landed in Session 1); the chosen scope ships UI + route-handler extensions only; node:test coverage; /scoreboard GREEN at new baselines; doc-batch + ONE push to workflow-2 at end. No main push, no ff-merge, no Vercel auto-redeploy, no ping-pong sync — Workstream 2 Session 3 is a build session, not a deploy session.

**Alternate next-session candidates if director shifts priorities at session start (after Workstream 2 Session 2 + before Workstream 2 Session 3):**

- **Defer Workstream 2 Session 3 + skip ahead to Workstream 3 (Competition Data table redesign).** NOT recommended — Workstream 2 is now half-complete (Sessions 1-2 ✅ DONE-AT-CODE-LEVEL but Sessions 3-5 pending); skipping ahead to Workstream 3 leaves Workstream 2 incomplete + introduces table-redesign work parallel to the URL-detail-page redesign that risks scope-collision. Better to finish Workstream 2 fully before starting Workstream 3.
- **Defer Workstream 2 Session 3 + start P-47 Shadow DOM refactor.** ~2-3 sessions. NOT recommended — P-47 is LOW priority (band-aid works empirically) AND sequencing-wise the design doc explicitly noted Shadow DOM should wait until P-46 implementation lands.
- **Defer Workstream 2 Session 3 + start P-26 below-fold scroll capture.** ~1-2 sessions. NOT recommended — P-46 is the big-scope item in flight; P-26 is much smaller + the workaround works; jumping to P-26 doesn't advance the W#2 graduation path.
- **Defer Workstream 2 Session 3 + start P-27 Bug #9 + Bug #15 (remaining deferred captured-videos polish leftovers).** NOT recommended — both bugs are LOW priority and may obsolete entirely with P-46's redesign.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.
- **A polish-detour ahead of Workstream 2 Session 3 if director wants pre-flight infrastructure work.** No obvious candidate this time — the operational substrate is hardened across 3 layers (P-42 backup-memory hook + P-43 absolute-paths discipline + P-44 wxt build/zip wrappers); Workstream 2 Sessions 1-2's landings were both clean so there's no new substrate work surfaced. If director picks this path, surface the open polish landscape as a Rule 14f forced-picker.

Check `ROADMAP.md` for the canonical state. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §C.2 + §B 2026-05-24 + §B 2026-05-25 + §B 2026-05-26 for Workstream 2's binding scope + the prior 3 sessions' empirical landing notes.
