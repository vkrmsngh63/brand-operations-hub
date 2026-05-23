# Next session

**Written:** 2026-05-23 (`session_2026-05-23_p46-w2-phase-2-design-session` — end-of-session handoff after **W#2 polish P-46 W#2 Phase 2 design session ✅ DONE 2026-05-23 on `workflow-2-competition-scraping`** — pure DESIGN session, no code commits, no deploys, no Rule 9 gates fired, no fresh extension zip, no ping-pong sync). Shipped new `docs/COMPETITION_DATA_V2_DESIGN.md` (~700 lines; §A frozen 10 questions + §B empty + §C 5-workstream implementation outlines) — mirrors the §A frozen-shape pattern of `docs/CAPTURED_VIDEOS_DESIGN.md` per Rule 18 + parallels the 2026-05-20-b P-27 design-doc-split precedent. Director walked the 10 deferred clarification questions captured in the P-46 ROADMAP entry via Rule 14f forced-pickers — 8 pickers fired + 1 Default-to-recommendation skip on Q8 + 1 director "Other" pick on Q9 DROPPING the Select-preview-thumbnail feature from P-46 + 1 follow-up picker on Q1 DEFERRING per-platform Reviews extraction (v1 surface narrowed to schema + URL-detail-page view + vklf.com-side manual entry form; NO extension Reviews gesture in v1). Q1's deferral + Q9's drop shrink P-46 from the original 15-25 sessions estimate to a revised 11-17 sessions across 5 workstreams. Q10 locks workstream sequencing as **Schema → URL detail page → Competition Data table → Comprehensive Analysis page → Extension + Reviews**. **Closes (a.69) RECOMMENDED-NEXT = P-46 W#2 Phase 2 design session.** **Opens (a.70) RECOMMENDED-NEXT = P-46 Workstream 1 (Schema) first build session.**

---

## What we did this session (in plain terms)

This was a **pure design session** — no code, no deploys, no real-world testing. After yesterday shipped the screen-recording feature live to vklf.com (P-45 Build #2 deploy completed 2026-05-22-i), today picked up the next major scope item that's been on the roadmap since 2026-05-22-c: **P-46, the W#2 Phase 2 redesign** of the Competition Data page + a brand-new Comprehensive Competitor Analysis page + ~12 new columns in the URL table + a new Reviews capture surface + a restructured URL detail page + the ability to upload/edit/delete from vklf.com (so the director isn't forced to use the extension for everything) + a few new fields in the extension's URL save form (Type + Description-1 + Description-2 + Price).

P-46 has been waiting in the wings as a high-level scope-drop since 2026-05-22-c — the director captured the broad outline then, but left 10 clarification questions deliberately open so the dedicated design session could resolve them after P-45 cleared. Today was that dedicated design session.

The session ran the 10 clarification questions one at a time as Rule 14f forced-pickers. Each picker surfaced 2-4 plausible options + a recommended pick + the rationale, then the director answered. Here's what got locked, in plain terms:

1. **Reviews — how do we capture them?** Director DEFERRED this. Each shopping platform displays reviews differently (Amazon does star + reviewer + body + verified-purchase badge; Etsy does star + reviewer + shop-response thread; Walmart does aggregate-rating overlays), so the extraction logic needs per-platform polish sessions later. For v1, we ship **schema** (new `CapturedReview` table) + **URL-detail-page view** (renders reviews stored against a CompetitorUrl) + **vklf.com-side manual entry form** (director types in a review by hand). No extension Reviews gesture in v1.

2. **Inline cell editing in the table — click-to-edit on every cell vs. edit-mode toggle?** Locked **click-to-edit on every cell** (spreadsheet feel; Tab/Enter saves). More intuitive for a power-user surface.

3. **Where do per-user UI preferences live — server-side or per-browser?** Locked **server-side per-user (cross-device sync)** via a new `UserTablePreferences` Prisma model keyed by (userId, projectId). Means column widths + visibility toggles + row ordering survive a fresh login on a different device.

4. **Comprehensive Analysis page — one per Project, one per Platform within Project, or freeform multiple per Project?** Locked **one per Project** — a single rich-text doc per Project for holistic analysis across all the competitors in that Project.

5. **Rich-text editor library for the Comprehensive Analysis page?** Locked **TipTap** — best React + headless + extensible combination; matches the project's existing React stack.

6. **The Sizes/Options box on URL detail page — delete it or hide it?** Locked **hide UI but keep data**. No destructive migration; preserves any historical data; UI surface area cleans up; the box can come back later if needed.

7. **Competition Score input — slider or number input or both?** Locked **number input only**. Sliders are imprecise for 1-100 values; number input is faster + more accurate.

8. **Status column in the table ↔ Scraping Status toggle on the URL detail page — should they mirror each other?** This one was SKIPPED via the Default-to-recommendation exception (Rule 14f) since the bidirectional mirror is the obvious permission-on-default-approved-path. Locked default: **bidirectional mirror** through the new `CompetitorUrl.scrapingStatus` enum.

9. **"Select preview thumbnail" feature?** Director DROPPED this entirely. "Ignore this feature. We don't need to add it anymore." Selected via "Other" option. Saves us ~2-3 sessions of work.

10. **Workstream sequencing — which order do the 5 workstreams ship in?** Locked **Schema → URL detail page → Competition Data table → Comprehensive Analysis page → Extension + Reviews**. Workstream 1 (Schema) is non-negotiable first since every downstream workstream reads schema fields.

The two scope-reduction decisions (Q1 deferral + Q9 drop) shrink the overall P-46 implementation estimate from the original 15-25 sessions down to **11-17 sessions across 5 workstreams**.

The session output is a brand-new design doc — `docs/COMPETITION_DATA_V2_DESIGN.md` (~700 lines) — that captures all 10 decisions in §A (frozen per Rule 18, won't change again) + an empty §B for future per-workstream refinements + a §C with per-workstream implementation outlines. The doc mirrors the shape of `docs/CAPTURED_VIDEOS_DESIGN.md` (the P-27 design doc shipped 2026-05-20-b under the same precedent — top-level Group B doc rather than burying the spec in `docs/COMPETITION_SCRAPING_DESIGN.md`'s §B history).

The ROADMAP P-46 entry got updated in place with the 10 LOCKED DECISIONS subsection inline + the revised 11-17 sessions estimate + a cross-reference to the new design doc.

**Three informational drift-check observations** got captured (not promoted to a CORRECTIONS_LOG §Entry since they're informational + cleanly resolved within the design doc itself): (1) the P-46 entry's schema list claimed 3 fields that already exist on CompetitorUrl; (2) the entry referenced `page.tsx` for the table redesign but the table actually lives in three components in a sibling `components/` directory; (3) the line-740 Sizes/Options box reference was confirmed correct.

**Zero code changes. Zero deploys. Zero Rule 9 gates. Zero ping-pong sync needed.** Only the design doc + ROADMAP P-46 entry edits + the end-of-session doc-batch.

## What we'll do next session (in plain terms)

Next session is **P-46 Workstream 1 (Schema) first build session** — the first of ~2-3 sessions in Workstream 1 (Schema). This kicks off the implementation arc that will span ~11-17 sessions across 5 workstreams. **Workstream 1 is non-negotiable first** because every downstream workstream reads schema fields.

What Workstream 1 builds, in plain terms:

The session adds **three new tables to the database**:

1. **`CapturedReview`** — stores reviews captured against a CompetitorUrl. Fields: id, competitorUrlId, starRating (1-5), reviewerName, reviewBody, reviewDate, source ("manual" for v1; future per-platform extraction work will add other sources), createdAt, updatedAt.
2. **`ComprehensiveCompetitorAnalysis`** — stores the per-Project rich-text Comprehensive Competitor Analysis page content. Fields: id, projectId (unique — one per project), tiptapJson (the TipTap rich-text editor's JSON state), updatedAt.
3. **`UserTablePreferences`** — stores per-user UI preferences for the Competition Data table (column widths, visibility, row ordering, font size). Fields: id, userId, projectId, column widths, hidden columns, row ordering, font size, updatedAt. Unique on (userId, projectId).

Plus **new columns on existing tables**:

- **`CompetitorUrl`** gets: `type` (String?), `description1` (String?), `description2` (String?), `price` (String?), `competitionScore` (Int? 1-100), `scrapingStatus` (new `ScrapingStatus` enum INCOMPLETE/COMPLETE), `overallCompetitorAnalysis` (Text?), `overallAnalyses` (Json? — bag for per-category "Overall Text/Image/Video/Reviews Analysis" boxes shown at bottom of each capture box).
- **`CapturedText`** gets: `analysis` (Text? — per-item AI-ready analysis box shown under each captured text on URL detail page).
- **`CapturedImage`** gets: `analysis` (Text? — same as above for images).
- **`CapturedVideo`** gets: `analysis` (Text? — same as above for videos).

Plus **one new enum**:

- **`ScrapingStatus`** — INCOMPLETE | COMPLETE. Drives the bidirectional mirror between the URL detail page Scraping Status toggle and the Competition Data table Status column.

The schema migration ships via `npx prisma db push` — this is a **Rule 9 destructive-operation gate**: Claude will fire an AskUserQuestion picker asking director Yes/No before running `prisma db push`. Director answers Yes → schema lands on Supabase live. Schema-change-in-flight flag flips NO → YES at that moment (the new tables + columns + enum are live on Supabase before the production routes on vklf.com know about them). The flag stays YES until the next deploy session ships the schema-aware code to vklf.com via ff-merge to main.

Beyond the schema migration, Workstream 1 also scaffolds the **API route shells** that future workstreams will fill in: `GET /api/projects/[projectId]/captured-reviews`, `POST /api/projects/[projectId]/captured-reviews`, `PATCH /api/projects/[projectId]/captured-reviews/[id]`, `DELETE /api/projects/[projectId]/captured-reviews/[id]`, `GET /api/projects/[projectId]/comprehensive-analysis`, `PUT /api/projects/[projectId]/comprehensive-analysis`, `GET /api/projects/[projectId]/user-table-preferences`, `PUT /api/projects/[projectId]/user-table-preferences`, plus PATCH variants for `CompetitorUrl` fields + the per-item `analysis` fields on CapturedText/Image/Video. Shell-only — the implementation lands in Workstream 2 onward.

**Shared-types extensions** in `src/lib/shared-types/competition-scraping.ts` for the new wire shapes (CapturedReview, ComprehensiveCompetitorAnalysis, UserTablePreferences, ScrapingStatus enum).

**Test coverage:** node:test cases for the new shared-type discriminators + any small helpers; Playwright is NOT in scope for Workstream 1 (no UI to test yet — the UI starts in Workstream 2).

**No real-world testing required for Workstream 1 itself** — the schema migration is a Rule 9 gate that director Yes/No approves; the API route shells return 501 Not Implemented stubs until Workstream 2 fills them in; the only verification is `/scoreboard` GREEN at the new baselines.

**Branch:** stays on `workflow-2-competition-scraping`. No `main` push this session (Workstream 1 is a build session, not a deploy session). The deploy of Workstream 1's schema code to vklf.com happens later — likely after Workstream 2 or Workstream 3 lands enough UI to demo the schema's reach.

## What's still left on the total roadmap (in plain terms)

Major W#2 items as of session-end 2026-05-23:

- **P-46 Workstream 1 (Schema) first build session (NEXT — recommended).** ~2-3 sessions in Workstream 1 (schema migration + API route shells + shared-types + node:test coverage). First session lands the schema via `prisma db push` under Rule 9 director-Yes gate.
- **P-46 Workstream 2 (URL detail page redesign).** ~2-3 sessions after Workstream 1 lands. Remove Sizes/Options box UI (keep data); add new Type/Description-1/Description-2/Price fields to URL box; add new "Captured Reviews" box with star-rating multi-select filter; add per-item Text/Image/Video/Review Analysis boxes under EVERY captured item; add per-category "Overall Analysis" boxes at bottom of each capture box; add "Overall Competitor Analysis" text box at bottom of URL box; show image + video metadata inline with edit + delete affordances; add upload-image / upload-video buttons; add Scraping Status toggle at top.
- **P-46 Workstream 3 (Competition Data table redesign).** ~3-4 sessions. Shrink + reposition Detailed User Guide + Resources boxes to upper-right; replace left-side platform navigation with horizontal checkbox bar at top combining platform filters + per-column show/hide controls; add prominent "Comprehensive Competitor Analysis" tab at top; rewrite the URL table with ~12 new columns / per-column `?` tooltips / inline cell editing (click-to-edit) / resizable column widths persisted / adjustable font size persisted / drag-to-reorder rows persisted / trash icon locked far-right.
- **P-46 Workstream 4 (Comprehensive Competitor Analysis page).** ~2-3 sessions. NEW page `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/page.tsx` with TipTap rich-text editor for admin's holistic competitive analysis; edit-mode toggle at top + "Competition Data" back-button at top; hyperlinks back to specific URL detail pages.
- **P-46 Workstream 5 (Extension form additions + manual Reviews entry).** ~2-4 sessions. Add Type / Description-1 / Description-2 / Price fields to the extension URL save form; add the vklf.com-side manual Reviews entry form; deploy session ends this workstream + closes the P-46 arc.
- **P-47 Shadow DOM refactor (LOW priority — captured 2026-05-22-i).** ~2-3 sessions to replace the 80-event-listener band-aid from P-45 Build #2's Issue 2 fix with proper Shadow DOM isolation. LOW priority since band-aid works. Sequencing AFTER P-46's design lands (which it just did) AND ideally AFTER P-46 implementation ships (so the refactor doesn't conflict with any new in-form interactions P-46 introduces).
- **P-26 below-fold scroll capture** — lower-priority W#2 polish; current workaround works (two captures + two metadata-tagged rows); ~1-2 sessions when we get to it. May be reduced in urgency by P-46's vklf.com-side image upload affordances.
- **P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk)** — DEFERRED low-priority polish items; not exercised by P-45's flow; may stay deferred indefinitely or close as obsoleted once P-46's redesign covers the user-visible surface differently.
- **W#2 graduation** after P-46 + P-47 + P-26 ship. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking P-46):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Not blocking P-46 Workstream 1 at all.

---

**For:** the next Claude Code session — **P-46 Workstream 1 (Schema) first build session** (estimated ~2-3 hours: pre-build doc reads ~30 min + schema-migration design + `prisma db push` Rule 9 gate + API route shells + shared-types extensions + node:test coverage + /scoreboard verification + end-of-session doc-batch ~30 min). Per Rule 23 Change Impact Audit: **ADDITIVE schema changes + ADDITIVE API route shells** (new tables + new columns + new enum + new routes; no destructive migrations; the Sizes/Options box keeps its data per Q6's hide-UI-keep-data decision; no schema delete; no row delete). Reversible at the schema level via `prisma db push` rollback if needed (BUT once Workstream 2+ start writing data into the new tables, rollback becomes destructive — sequence the rollback decision BEFORE Workstream 2 lands). No new dependencies (Prisma + Next.js + shared-types are already on the project). No data risk to existing rows (new columns are nullable; new tables are empty). Zero downstream W#1 / W#3 cross-tool impact. **Schema-change-in-flight flag flips NO → YES** at the moment `prisma db push` completes (the new tables + columns + enum are live on Supabase before the production routes on vklf.com know about them). The flag stays YES until the next deploy session ships the schema-aware code to vklf.com via ff-merge to main. **Rule 9 triggers planned: ONE** — `npx prisma db push` (director Yes/No AskUserQuestion picker fires once at the schema-migration step). **ONE push planned** — end-of-session doc-batch push to `origin/workflow-2-competition-scraping` (no main push since Workstream 1 is a build session, not a deploy session).

---

## Status of today's session

**P-46 W#2 Phase 2 design session ✅ DONE 2026-05-23 on `workflow-2-competition-scraping`** — pure DESIGN session, no code commits, no deploys, no Rule 9 gates fired, no fresh extension zip, no ping-pong sync. One-hundred-and-thirty-sixth Claude Code session — `session_2026-05-23_p46-w2-phase-2-design-session`. Shipped new `docs/COMPETITION_DATA_V2_DESIGN.md` (~700 lines; §A frozen 10 questions + §B empty + §C 5-workstream implementation outlines).

**Session shape (pure design — no code commits, no deploys):**

- Pre-design reads + drift check at session start surfaced 3 informational observations (notation drift in the P-46 entry's schema list / wrong-file reference for the table redesign / Sizes/Options box reference confirmed correct).
- Walked 10 P-46 clarification questions one at a time via Rule 14f forced-pickers — 8 pickers fired + 1 Default-to-recommendation skip on Q8 + 1 director "Other" pick on Q9 + 1 follow-up picker on Q1.
- Created new `docs/COMPETITION_DATA_V2_DESIGN.md` (~700 lines) mirroring the §A frozen-shape pattern of `docs/CAPTURED_VIDEOS_DESIGN.md` per Rule 18 + parallels the 2026-05-20-b P-27 design-doc-split precedent.
- Updated ROADMAP P-46 entry in place with the 10 LOCKED DECISIONS Q→A mapping inline + the revised 11-17 sessions estimate + cross-reference to the new design doc.
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + the new COMPETITION_DATA_V2_DESIGN.md) + 2 Group B docs touched (COMPETITION_SCRAPING_DESIGN.md §B 2026-05-23 + CAPTURED_VIDEOS_DESIGN.md §B 2026-05-23 cross-reference entries).
- ONE push at end-of-session to `origin/workflow-2-competition-scraping` (no main push since no Rule 9 trigger this session).

**Director sentiment:** P-46 design locked cleanly. Q1's deferral + Q9's drop trimmed P-46's scope from 15-25 sessions to 11-17 sessions.

**§4 Step 1c forced-picker NOT FIRED** — next-session task is unambiguous per Q10's locked decision: Workstream 1 (Schema) is non-negotiable first. No picker needed.

**ZERO new DEFERRED items at session end (Rule 26)** — all 5 tasks completed (pre-design reads + drift check / walk 10 P-46 pickers / create COMPETITION_DATA_V2_DESIGN.md / update ROADMAP P-46 entry / end-of-session doc-batch).

**ZERO new CORRECTIONS_LOG §Entries this session** — 3 informational drift-check observations captured in the design doc + drift-check report, NOT corrections-tier.

**FOURTEENTH end-of-session run under the Rule 30 + §4 Step 4b template** (first was 2026-05-21-b Build #3; second was 2026-05-21-c Build #4; third was 2026-05-21-d Build #5; fourth was 2026-05-22 Build #6; fifth was 2026-05-22-b Build #7; sixth was 2026-05-21 Build #8; seventh was 2026-05-22-c Build #9; eighth was 2026-05-22-d Build #1a; ninth was 2026-05-22-e Build #1b; tenth was 2026-05-22-f P-42; eleventh was 2026-05-22-g P-43; twelfth was 2026-05-22-h P-44; thirteenth was 2026-05-22-i P-45 Build #2 deploy). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-46 Workstream 1 build session lands here (code commits stay on workflow-2 per the established pattern; deploy to main happens later, likely after Workstream 2 or Workstream 3 lands enough UI to demo the schema's reach). The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at the doc-batch commit landing after this NEXT_SESSION.md is written (`workflow-2-competition-scraping` will be 1 commit ahead of `main` at `ee8c79d` — the design-session doc-batch lands on workflow-2 only; main doesn't move this session). After the next P-46 Workstream 1 session's end-of-session doc-batch + build commits, workflow-2 will be N commits ahead of main (the design-session doc-batch + Workstream 1 build commit + Workstream 1 doc-batch); will NOT be ff-merged to main since Workstream 1 is a build session, not a deploy session.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-46 Workstream 1 (Schema) first build session, on `workflow-2-competition-scraping`.** Closes **(a.70) RECOMMENDED-NEXT**. This is the first build session of the P-46 5-workstream implementation arc that the 2026-05-23 design session locked. Workstream 1 (Schema) is non-negotiable first per Q10's locked sequencing decision. CODE session — schema migration ships via `prisma db push` under Rule 9 director-Yes gate + API route shells + shared-types extensions + node:test coverage. No deploy session — code stays on `workflow-2-competition-scraping`; main doesn't move this session.

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or coding).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-46 polish-backlog entry (the 10 LOCKED DECISIONS subsection — the binding input for Workstream 1's schema scope).
- **`docs/COMPETITION_DATA_V2_DESIGN.md` ENTIRE DOC** (the binding P-46 spec — read §A.1-§A.10 for the 10 locked decisions / §A.11 consolidated schema-additions list / §A.12 5-workstream sequencing / §A.13 verification strategy / §C.1 Workstream 1 Schema implementation outline). This doc is the canonical source of truth for what Workstream 1 builds.
- `prisma/schema.prisma` (the live schema — informs WHAT EXISTS today vs. what gets added; 3 of the "new" fields in the P-46 entry actually already exist on CompetitorUrl per the drift-check at design-session start — `resultsPageRank`/`numProductReviews`/`numSellerReviews` on lines 262/265/266; don't re-add them).
- `src/lib/shared-types/competition-scraping.ts` (the live wire-type surface Workstream 1 extends).
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` (the URL detail page surface Workstream 2 will rewrite; Workstream 1 doesn't touch UI but reading this confirms which fields downstream UI workstreams will consume).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-23 (the cross-reference pointer entry to the new design doc — already informational only).
- `docs/COMPETITION_SCRAPING_STACK_DECISIONS.md` (the W#2 architectural decisions — informs Prisma model + API route conventions).
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (destructive-operation director-Yes gate — fires once for `prisma db push`) + Rule 14f (forced-picker if any fix-shape ambiguity surfaces) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — ADDITIVE schema; safe except for the Rule 9 gate) + Rule 26 (DEFERRED items registry) + Rule 30 (Session bookends) + §4 Step 4b extended template.

**Task shape (P-46 Workstream 1 schema build session):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or coding. Cover: what we'll do in the session (read P-46 design doc + design schema delta in detail + run `prisma db push` under Rule 9 gate + scaffold API route shells + extend shared-types + add node:test coverage + /scoreboard verification + end-of-session doc-batch), the ONE Rule 9 gate (`prisma db push`), the schema-change-in-flight flag transition (flips NO → YES at `prisma db push` completion), the no-deploy shape (code stays on workflow-2; main doesn't move this session).

2. **Pre-build reads** — execute the pre-build read list above. ~30 minutes. Surface any drift between `docs/COMPETITION_DATA_V2_DESIGN.md` §A.11's schema additions vs. `prisma/schema.prisma` current state; capture as informational drift-check notes per Rule 22 + Rule 24 (the design-session drift-check already caught the 3 fields that already exist on CompetitorUrl; double-check by reading the relevant `prisma/schema.prisma` lines).

3. **Design the schema delta in detail** — surface a precise Prisma-syntax diff covering: 3 new tables (`CapturedReview` / `ComprehensiveCompetitorAnalysis` / `UserTablePreferences`) + new columns on `CompetitorUrl` + new `analysis` Json column on `CapturedText`/`CapturedImage`/`CapturedVideo` + new `ScrapingStatus` enum + new `overallAnalyses` Json column on `CompetitorUrl`. Show director the diff before running `prisma db push`. Fire Rule 14f forced-picker if any field-naming or relation-shape ambiguity surfaces (especially around CapturedReview's relation to CompetitorUrl + ComprehensiveCompetitorAnalysis's unique constraint on projectId + UserTablePreferences's composite unique on (userId, projectId)).

4. **Run `npx prisma db push` under Rule 9 director-Yes gate** — fire AskUserQuestion picker asking director Yes/No before running the migration. Director Yes → run + verify the migration landed (`npx prisma db pull` to round-trip + show the regenerated schema matches the local edit). Schema-change-in-flight flag flips NO → YES at this moment.

5. **Scaffold API route shells** — create the new routes as 501 Not Implemented stubs that future workstreams will fill in: `GET/POST/PATCH/DELETE /api/projects/[projectId]/captured-reviews` + `GET/PUT /api/projects/[projectId]/comprehensive-analysis` + `GET/PUT /api/projects/[projectId]/user-table-preferences` + new PATCH handlers for the new `CompetitorUrl` columns + new PATCH handlers for the per-item `analysis` field on CapturedText/Image/Video. Each route exports a typed handler that returns 501 with a body shape matching the future contract.

6. **Extend `src/lib/shared-types/competition-scraping.ts`** with the new wire shapes: `CapturedReview` + `ComprehensiveCompetitorAnalysis` + `UserTablePreferences` + `ScrapingStatus` enum + the new optional fields on `CompetitorUrlWire`. Add type guards/discriminators where needed.

7. **Add node:test cases** for the new shared-type discriminators + any small helpers. No Playwright (no UI to test yet — Workstream 2 starts UI).

8. **`/scoreboard` verification** — Check 1 root tsc clean / Check 2 extension tsc clean / Check 3 extension `npm test` 558/558 (no change — extension untouched) / Check 4 src/lib node:test 590 + N new cases / Check 5 `npm run build` 57 + N new routes / Check 6 Playwright SKIPPED per non-deploy-session convention. All GREEN at new baselines.

9. **End-of-session doc-batch** covers ROADMAP (header bump + P-46 entry annotated with Workstream 1 ✅ DONE) + CHAT_REGISTRY (header bump — 137th Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header bump only — likely zero new §Entries unless a process slip occurs) + NEXT_SESSION.md (rewritten for P-46 Workstream 2 first session — URL detail page redesign) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + CLAUDE_CODE_STARTER (header bump only) + `docs/COMPETITION_DATA_V2_DESIGN.md` (NEW §B 2026-05-23-NEXT-LETTER entry capturing Workstream 1's schema delta + drift-check + Rule 9 gate outcome + the empirical schema state after `prisma db push`). **ONE push** to `origin/workflow-2-competition-scraping` (no main push since this is a build session, not a deploy session; no ping-pong sync since main doesn't move).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for any schema-shape ambiguity that surfaces (relation cascade behavior, default values, indexes), surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers. Per `feedback_default_to_recommendation.md`, skip the picker if the question is asking permission to proceed on a path the director would default-approve (e.g., "should the new CapturedReview table have onDelete: Cascade from CompetitorUrl?" — yes, that's the obvious default; skip the picker).

**Schema-change-in-flight flag:** enters **NO** + flips **NO → YES** at the moment `prisma db push` completes successfully. Stays YES through subsequent Workstream 1 sessions + Workstream 2 sessions until the first deploy session ships the schema-aware code to vklf.com.

---

## Pre-session notes (offline steps for director between sessions)

**Required offline step BEFORE the next P-46 Workstream 1 session:** none. The `prisma db push` runs from inside the Codespace using the existing Supabase service-role key in `.env.local`.

**Standing optional offline step (NOT blocking P-46 Workstream 1 — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking P-46 Workstream 1 at all — can happen any time.

**Optional offline reading for director:** `docs/COMPETITION_DATA_V2_DESIGN.md` §A.1-§A.10 (the 10 locked decisions; ~5-minute skim) + §A.11 (the consolidated schema-additions list; ~3-minute skim) + §A.12 (5-workstream sequencing + 11-17 sessions estimate; ~2-minute skim). Worth scanning before the next session if director wants the full design context.

**Pre-build setup (informational — Claude will handle in-session):** the Workstream 1 session doesn't sideload the extension or run any real-Chrome verification; the only "setup" is the Rule 9 director-Yes gate firing once for `prisma db push`.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned.

**Rule 9 triggers planned this session: ONE** — `npx prisma db push` (director Yes/No AskUserQuestion picker fires once at the schema-migration step). No `git push origin main`, no `git reset --hard`, no `git push --force`, no `git branch -D`, no `rm -rf`, no SQL DELETE/DROP/TRUNCATE planned (the schema migration is ADDITIVE — new tables + new columns + new enum; no DROP or DELETE).

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits a 🚨 alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any build work.

---

## Why this pointer was written this way (debug aid)

Today's session was the P-46 W#2 Phase 2 design session that's been locked since 2026-05-22-c to start AFTER P-45 ships, which happened yesterday 2026-05-22-i. The design session ran cleanly: 10 clarification questions walked via Rule 14f forced-pickers (8 pickers fired + 1 Default-to-recommendation skip on Q8 + 1 director "Other" pick on Q9 + 1 follow-up picker on Q1) + new design doc shipped + ROADMAP P-46 entry annotated with the locked decisions.

The natural next-session task per Q10's locked sequencing decision is **P-46 Workstream 1 (Schema) first build session** — Workstream 1 (Schema) is non-negotiable first since every downstream workstream reads schema fields. No §4 Step 1c forced-picker needed because the sequencing decision was made today; the picker fired ONCE during Q10 and the answer is binding for the next ~5+ sessions.

The shape of the Workstream 1 session is **code session with ONE Rule 9 gate** — `prisma db push` lands the schema delta on Supabase live; flag flips NO → YES; API route shells + shared-types extensions + node:test coverage fill out the rest; /scoreboard GREEN at the new baselines; doc-batch + ONE push to workflow-2 at end. No main push, no ff-merge, no Vercel auto-redeploy, no ping-pong sync — Workstream 1 is a build session, not a deploy session.

**Alternate next-session candidates if director shifts priorities at session start (after P-46 design + before Workstream 1):**

- **Defer P-46 Workstream 1 + start P-47 Shadow DOM refactor.** ~2-3 sessions. NOT recommended — P-47 is LOW priority (band-aid works empirically) AND sequencing-wise the design doc explicitly noted Shadow DOM should wait until P-46 implementation lands so the refactor doesn't conflict with new in-form interactions P-46 may introduce. If director picks this, it's a small reversible polish but it doesn't advance P-46's W#2-graduation path.
- **Defer P-46 Workstream 1 + start P-26 below-fold scroll capture.** ~1-2 sessions. NOT recommended — P-46 is the big-scope item that's been on the roadmap for over two weeks; P-26 is much smaller + the workaround works. Jumping to P-26 doesn't advance the W#2 graduation path materially AND P-46's vklf.com-side image upload affordances (Workstream 2) may reduce P-26's urgency.
- **Defer P-46 Workstream 1 + start P-27 Bug #9 + Bug #15 (the remaining deferred captured-videos polish leftovers).** NOT recommended — both bugs are LOW priority and may obsolete entirely with P-46's redesign (which restructures the URL detail page surface they live in). Better to lock the P-46 implementation first + see if P-46 reshapes the surface in a way that closes Bug #9 + Bug #15 incidentally.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time.
- **A polish-detour ahead of P-46 Workstream 1 if director wants pre-flight infrastructure work.** Reasonable candidates: nothing immediately obvious — the operational substrate is hardened across 3 layers (P-42 backup-memory hook + P-43 absolute-paths discipline + P-44 wxt build/zip wrappers). If director picks this path, surface the open polish landscape as a Rule 14f forced-picker.

Check `ROADMAP.md` for the canonical state. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §A.11 + §C.1 for Workstream 1's binding schema + implementation spec.
