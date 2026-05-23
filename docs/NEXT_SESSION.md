# Next session

**Written:** 2026-05-24 (`session_2026-05-24_p46-workstream-1-schema-first-build-session` — end-of-session handoff after **W#2 polish P-46 Workstream 1 (Schema) ✅ DONE-AT-CODE-LEVEL 2026-05-24 on `workflow-2-competition-scraping`** — first build session of the P-46 5-workstream implementation arc; schema migration landed live on Supabase under Rule 9 director-Yes gate at `npx prisma db push` (1.32s; zero data loss; additive only); 4 new API route shells scaffolded as 501-stubs; shared-types extended for new wire shapes; 12 new src/lib node:test cases. Build commit `caad82a` — 21 files +781/-11 on `workflow-2-competition-scraping`; NOT pushed to main — Workstream 1 is a build session, not a deploy session. **Closes (a.70) RECOMMENDED-NEXT = P-46 Workstream 1 (Schema) first build session.** **Opens (a.71) RECOMMENDED-NEXT = P-46 Workstream 2 (URL detail page redesign) first build session** on `workflow-2-competition-scraping` per Q10's locked sequencing — Workstream 2 ships the densest user-visible improvement.

---

## What we did this session (in plain terms)

This was the **first build session of P-46** — the multi-workstream redesign of W#2 that the 2026-05-23 design session locked. Today shipped **Workstream 1 (Schema)** — the database foundation. Director won't see anything change on vklf.com today; this is plumbing. After the next ~10 sessions of Workstreams 2 through 5, the redesigned Competition Data surface ships live.

What landed today, in plain terms:

- **The live database now carries** three brand-new tables (Captured Reviews / Comprehensive Competitor Analysis / User Table Preferences) + eight new fields on the existing per-URL row (product type / two descriptions / price / 1-100 competition score / a Yes-or-No "scraping done?" status / one rich-text overall analysis per URL / a rich-text bag of per-category overall analysis) + one rich-text per-item Analysis field on each captured text / image / video row + a new enum that powers the Status column ↔ Scraping Status toggle bidirectional mirror.
- **Four new behind-the-scenes addresses (API routes)** stand as empty placeholders for Workstreams 2-4 to fill in: one each for managing reviews / comprehensive analysis / user table preferences + per-row edit endpoints for the new fields.
- **Twelve new automated unit tests** confirm the new shape-validation helpers reject misshapen data at the trust boundary (so future code can rely on them).
- **All five verification checks GREEN** at the new baselines (root tsc clean / extension tsc clean / 558 extension tests unchanged / **602 server tests (+12 from baseline 590)** / **61 routes compiled (+4 from baseline 57)**).

The schema-migration `npx prisma db push` ran under a Rule 9 director-Yes gate (Claude asked Yes/No; director said Yes). The migration ran in 1.32 seconds with zero data loss; only additive changes (new tables empty; new columns nullable or have defaults).

**Schema-change-in-flight flag FLIPPED NO → YES** at the moment `prisma db push` completed. The schema is live on Supabase; the production routes on vklf.com don't know about it yet. The flag stays YES until a future deploy session ships the schema-aware code to vklf.com (likely after Workstream 2 or 3 lands enough UI to demo the schema's reach).

**Workstream 1 came in under estimate** — the design doc allotted 2-3 sessions; landed in 1. The schema + API route shells + shared-types extension + node:test coverage all bundled cleanly into a single foundation build session. Sessions 2-3 originally allocated for Workstream 1 reabsorbed into Workstream 2's runway. Documented as a reusable "Workstream Foundation Build Bundle" Pattern in `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-24 for future workstream first-build sessions.

## What we'll do next session (in plain terms)

Next session is **P-46 Workstream 2 (URL detail page redesign) — Session 1 of 3-5 estimated.** Workstream 2 ships the densest user-visible improvement of the entire P-46 arc — the URL detail page that the director uses to view + edit every captured competitor URL gets a comprehensive redesign:

- New **Type / Description-1 / Description-2 / Price URL fields** at the top of each URL's detail page (matching the new schema columns from Workstream 1).
- New **Captured Reviews box** with star-rating multi-select filter (renders reviews stored against this URL).
- New **per-item Analysis text boxes** under EVERY captured text / image / video item (rich-text editor each; admin's per-item analysis lives here).
- New **per-category Overall Analysis boxes** at the bottom of each capture-box section (one rich-text doc per category: text / image / video / reviews).
- New **Overall Competitor Analysis text box** at the bottom of the URL box (one rich-text doc for the whole URL).
- New **Scraping Status toggle** at top (Incomplete vs Complete) — mirrors back to the Competition Data table's Status column.
- **Remove** the existing Sizes/Options box UI (keep underlying `CompetitorSize` data per §A.6).
- New **image/video upload affordances** on the vklf.com side so the director isn't forced to use the extension to add an image or video.
- New **edit-affordances** next to existing captured items for descriptions / tags / metadata + delete-affordance for reviews + edit-thumbnail affordance for videos.

Session 1 of Workstream 2 starts with the **TipTap shared rich-text editor wrapper component** — the rich-text editor that the per-item Analysis boxes + the per-category Overall Analysis boxes + the URL-level Overall Competitor Analysis box + the Comprehensive Analysis page (Workstream 4) all consume. Then wires per-item Analysis text box rendering to ONE existing surface (Captured Text on the URL detail page) as the first slice — the simplest existing row type that has the new `analysis` JSON column from Workstream 1.

Adds 3 new npm dependencies: `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link`. No schema changes (Workstream 1 already covered all of P-46's schema). No deploy this session — Workstream 2 spans 3-5 sessions total before its deploy.

## What's still left on the total roadmap (in plain terms)

Major W#2 items as of session-end 2026-05-24:

- **P-46 Workstream 1 SCHEMA ✅ DONE-AT-CODE-LEVEL 2026-05-24** (this session). Note: Workstream 1 was originally estimated 2-3 sessions; landed in 1. **Workstream 1 will need its own deploy session later** (likely after Workstream 2 or 3 lands enough UI to demo the schema's reach).
- **P-46 Workstream 2 (URL detail page redesign) — NEXT (recommended).** ~3-5 sessions total. Session 1 = TipTap shared wrapper component + per-item Analysis on Captured Text (simplest first slice). Subsequent sessions extend to Captured Image / Captured Video / per-category Overall Analysis / Overall Competitor Analysis / Captured Reviews box + filter / new Type/Description/Price URL fields / Scraping Status toggle / remove Sizes/Options UI / vklf.com-side image/video upload affordances + edit-affordances + delete-affordances.
- **P-46 Workstream 3 (Competition Data table redesign).** ~3-4 sessions. ~12 new columns + click-to-edit on every cell + resizable column widths + drag-to-reorder rows + per-column show/hide toggles + adjustable font size + horizontal checkbox bar at top + cross-device-synced user preferences via `UserTablePreferences` model from Workstream 1.
- **P-46 Workstream 4 (Comprehensive Competitor Analysis page).** ~2-3 sessions. NEW page hosting per-Project TipTap rich-text doc (one per Project) with hyperlinks back to URL detail pages + edit-mode toggle + back-button.
- **P-46 Workstream 5 (Extension form additions + manual Reviews entry).** ~1-2 sessions. Add Type / Description-1 / Description-2 / Price fields to the extension URL save form + vklf.com-side manual Reviews entry form (no extension Reviews gesture in v1 per §A.1b deferral). Deploy session ends this workstream + closes the P-46 arc.
- **P-47 Shadow DOM refactor (LOW; AFTER P-46).** ~2-3 sessions. Replaces the 80-event-listener band-aid from P-45 Build #2's Issue 2 fix with proper Shadow DOM isolation. LOW priority since band-aid works empirically. Sequencing-wise sits AFTER P-46 implementation lands so the refactor doesn't conflict with new in-form interactions.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions. Current two-captures workaround works fine. May be reduced in urgency by P-46 Workstream 2's vklf.com-side image upload affordances.
- **P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk) — DEFERRED LOW.** May obsolete with P-46 redesign which restructures the URL detail page surface they live in.
- **W#2 graduation** after P-46 + P-47 + P-26 ship. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking P-46):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`.

---

**For:** the next Claude Code session — **P-46 Workstream 2 (URL detail page redesign) — Session 1 of 3-5 estimated** (estimated ~2-3 hours: pre-build doc reads ~30 min + TipTap dependency add + shared wrapper component design + per-item Analysis on Captured Text wiring + /scoreboard verification + end-of-session doc-batch ~30 min). Per Rule 23 Change Impact Audit: **ADDITIVE + UI-only** (new shared React component + 3 new npm dependencies + wiring per-item Analysis on Captured Text via the new `analysis` JSON column from Workstream 1; no schema changes — Workstream 1 already covered all of P-46's schema; no API behavior changes — the per-item PATCH endpoints exist as 501 stubs from Workstream 1 + this session lands the first real implementation behind one of them). No data risk (existing rows render with empty Analysis text boxes per §A.11 "no data backfill needed"; new fields are nullable or have defaults). Zero downstream W#1 / W#3 cross-tool impact. **Schema-change-in-flight flag enters YES** (carrying from Workstream 1's `prisma db push`); **stays YES** through Workstream 2 + Workstream 3 sessions until the first deploy session ships the schema-aware code to vklf.com. **Rule 9 triggers planned this session: ZERO** — no schema changes; no main push; pure code session. **ONE push planned** — end-of-session doc-batch + build commit to `origin/workflow-2-competition-scraping` (no main push since this is a build session, not a deploy session).

---

## Status of today's session

**W#2 polish P-46 Workstream 1 (Schema) ✅ DONE-AT-CODE-LEVEL 2026-05-24 on `workflow-2-competition-scraping`** — first build session of the P-46 5-workstream implementation arc; schema migration landed live on Supabase under Rule 9 director-Yes gate at `npx prisma db push`; 4 new API route shells scaffolded as 501-stubs; shared-types extended; 12 new src/lib node:test cases. One-hundred-and-thirty-seventh Claude Code session — `session_2026-05-24_p46-workstream-1-schema-first-build-session`. Build commit `caad82a` — 21 files +781/-11 on `workflow-2-competition-scraping`; NOT pushed to main since Workstream 1 is a build session.

**Session shape (build session — schema migration + API shells + shared-types + node:test):**

- Pre-build reads + drift check at session start (read `docs/COMPETITION_DATA_V2_DESIGN.md` §A.11 + §C.1 + `prisma/schema.prisma` current state).
- Designed the schema delta in detail (Prisma-syntax diff covering 3 new tables + new columns on CompetitorUrl + new `analysis` JSON column on CapturedText/Image/Video + new `ScrapingStatus` enum + new `overallAnalyses` JSON column).
- Ran `npx prisma db push` under Rule 9 director-Yes gate (AskUserQuestion picker; director Yes; migration ran in 1.32s; zero data loss).
- Scaffolded 4 API route shells as 501 Not Implemented stubs.
- Extended `src/lib/shared-types/competition-scraping.ts` for new wire shapes.
- Added 12 new node:test cases for the new shape-validation helpers.
- /scoreboard verification: all 5 checks GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext / **602 src/lib +12 from baseline 590** / **61 routes +4 from baseline 57**); Check 6 Playwright SKIPPED per non-deploy-session convention.
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + the new §B 2026-05-24 entry on COMPETITION_DATA_V2_DESIGN.md).
- ONE push at end-of-session to `origin/workflow-2-competition-scraping` (no main push since this is a build session; no Rule 9 trigger at the push since `feedback_approval_scope_per_decision_unit.md` scopes the Rule 9 gate to the schema-migration decision unit, not the doc-batch push to a feature branch).

**§4 Step 1c forced-picker NOT FIRED** — next-session task unambiguous per Q10's locked sequencing (Workstream 2 follows Workstream 1).

**ZERO new DEFERRED items at session end (Rule 26)** — all in-session tasks completed.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry this session** — the P-46 Workstream 1 closing §Entry with the new reusable Pattern "Workstream Foundation Build Bundle" + 3 embedded informational sub-observations (P-43 bug-class re-reproduction 1× at Check 5; Workstream 1 under-estimate as informational calibration data point; §A.3 path-convention disagreement deferred as §B refinement candidate). No corrections-tier slip occurred this session.

**FIFTEENTH end-of-session run under the Rule 30 + §4 Step 4b template** (sequence prior to today: 2026-05-21-b → 2026-05-21-c → 2026-05-21-d → 2026-05-22 → 2026-05-22-b → 2026-05-21 → 2026-05-22-c → 2026-05-22-d → 2026-05-22-e → 2026-05-22-f → 2026-05-22-g → 2026-05-22-h → 2026-05-22-i → 2026-05-23 → today). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-46 Workstream 2 Session 1 build session lands here (code commits stay on workflow-2 per the established pattern; deploy to main happens later, likely after Workstream 2 or Workstream 3 lands enough UI to demo the schema's reach). The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at the doc-batch commit landing after this NEXT_SESSION.md is written. `workflow-2-competition-scraping` will be 3 commits ahead of `main` at `ee8c79d` — the 2026-05-23 design-session doc-batch `d364063` + today's build commit `caad82a` + today's end-of-session doc-batch (the commit that lands when the parent pushes the bundle); main doesn't move this session. After the next P-46 Workstream 2 session's end-of-session doc-batch + build commits, workflow-2 will be N more commits ahead of main; will NOT be ff-merged to main since Workstream 2 Session 1 is a build session, not a deploy session.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-46 Workstream 2 (URL detail page redesign) — Session 1 of 3-5 estimated, on `workflow-2-competition-scraping`.** Closes **(a.71) RECOMMENDED-NEXT**. This is the first build session of Workstream 2 (the densest user-visible improvement of the entire P-46 arc). Session 1 builds the TipTap shared rich-text editor wrapper component + wires per-item Analysis text box rendering to ONE existing surface (Captured Text on the URL detail page) as the first slice. CODE session — no schema changes (Workstream 1 already covered all of P-46's schema); no deploy session — code stays on `workflow-2-competition-scraping`; main doesn't move this session.

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or coding).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-46 polish-backlog entry (the Workstream sub-status grid + 10 LOCKED DECISIONS subsection — the binding input for Workstream 2's scope).
- **`docs/COMPETITION_DATA_V2_DESIGN.md` ENTIRE DOC** with focus on §A.5 (TipTap rich-text editor library + per-item Analysis pattern) + §A.6 (Sizes/Options hide-UI-keep-data) + §A.7 (Competition Score number input) + §A.8 (Status ↔ Scraping Status mirror) + §A.11 (consolidated schema-additions list — already deployed at code level via Workstream 1) + §A.12 (TipTap as platform-shared dependency) + §C.2 Workstream 2 implementation outline + §B 2026-05-24 (Workstream 1 closing entry + the "Workstream Foundation Build Bundle" Pattern + the §A.3 path-convention deferral notice for Workstream 3). This doc is the canonical source of truth for what Workstream 2 builds.
- `prisma/schema.prisma` (the live schema — verifies what Workstream 1 actually shipped + confirms the schema-aware code wires correctly).
- `src/lib/shared-types/competition-scraping.ts` (the wire-type surface Workstream 1 extended — Workstream 2 imports from here for the new fields).
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` (the URL detail page surface Workstream 2 starts rewriting; today's Session 1 only adds the per-item Analysis text box on Captured Text + the TipTap shared wrapper component).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-23 (the cross-reference pointer entry to the P-46 design doc — already informational only).
- `docs/COMPETITION_SCRAPING_STACK_DECISIONS.md` (the W#2 architectural decisions — informs Prisma model + API route conventions).
- `docs/HANDOFF_PROTOCOL.md` Rule 14f (forced-picker if any fix-shape ambiguity surfaces) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — ADDITIVE + UI-only; safe; 3 new npm dependencies) + Rule 26 (DEFERRED items registry) + Rule 30 (Session bookends) + §4 Step 4b extended template.

**Task shape (P-46 Workstream 2 Session 1):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or coding. Cover: what we'll do in the session (read P-46 design doc + Workstream 1's empirical schema state + design the TipTap shared wrapper + add 3 new npm dependencies + scaffold the wrapper component + wire per-item Analysis text box rendering to Captured Text on URL detail page + add node:test coverage for the wrapper / Playwright skipped for Session 1 since UI is fresh + /scoreboard verification + end-of-session doc-batch), the ZERO Rule 9 gates (no schema; no main push), the schema-change-in-flight flag state (stays YES from Workstream 1's migration), the no-deploy shape (code stays on workflow-2; main doesn't move this session).

2. **Pre-build reads** — execute the pre-build read list above. ~30 minutes. Surface any drift between `docs/COMPETITION_DATA_V2_DESIGN.md` §A.11's schema-additions list vs. `prisma/schema.prisma` empirical state (Workstream 1 shipped faithfully but the §B 2026-05-24 entry captures the inconsistency-resolution on CapturedReview.analysis — Json not Text — that's worth verifying explicitly).

3. **Design the TipTap shared wrapper component in detail** — surface the wrapper's API surface (props: initial JSON / on-change callback / read-only mode / placeholder text / max-length cap?) + the file location (likely `src/components/rich-text/TipTapEditor.tsx` or `src/app/projects/[projectId]/competition-scraping/components/RichTextEditor.tsx` — fire Rule 14f forced-picker on the location since this is the platform-shared rich-text editor per §A.12) + the dependency list (`@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link` per §A.5) + the JSON contract (TipTap's native ProseMirror JSON; the schema's `analysis Json` column holds this directly with no wrapper).

4. **Add 3 new npm dependencies** — `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link`. Verify they install cleanly + don't conflict with existing React 19 / Next.js 15 versions.

5. **Scaffold the TipTap shared wrapper component** — implement props + render + on-change wiring + read-only mode + Tab/Enter/Escape key handling (deferred to whichever Save-mechanism the consumer wires up; the wrapper itself doesn't save).

6. **Wire per-item Analysis text box rendering to Captured Text on URL detail page** as the first slice — add the per-item Analysis text box under each captured text row + wire the read from `CapturedText.analysis` JSON column + wire the on-change PATCH to the per-item PATCH endpoint stub from Workstream 1 (the stub currently returns 501; this session lands the FIRST real implementation behind the stub so the round-trip works on the workflow-2 branch even though the deploy is later).

7. **Add node:test cases** for the TipTap wrapper component (component-level rendering + on-change behavior + read-only mode toggling) — likely 6-10 new cases. No Playwright for Session 1 since the surface is fresh; Playwright lands later in Workstream 2 once the URL detail page rewrite is further along.

8. **`/scoreboard` verification** — Check 1 root tsc clean / Check 2 extension tsc clean / Check 3 extension `npm test` 558/558 (no change — extension untouched) / Check 4 src/lib node:test 602 + N new cases / Check 5 `npm run build` 61 + N new routes (likely no new routes since the per-item PATCH endpoint already exists as a stub from Workstream 1; Session 1 fills in the body, doesn't add the route) / Check 6 Playwright SKIPPED per non-deploy-session convention. All GREEN at new baselines.

9. **End-of-session doc-batch** covers ROADMAP (header bump + P-46 entry annotated with Workstream 2 Session 1 progress; closes (a.71) + opens (a.72) for Workstream 2 Session 2) + CHAT_REGISTRY (header bump — 138th Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header bump only — likely zero new §Entries unless a process slip occurs) + NEXT_SESSION.md (rewritten for P-46 Workstream 2 Session 2 — likely Captured Image + Captured Video per-item Analysis wiring + per-category Overall Analysis boxes) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + CLAUDE_CODE_STARTER (header bump only) + `docs/COMPETITION_DATA_V2_DESIGN.md` (NEW §B 2026-05-25 or whatever the next session letter is, entry capturing Workstream 2 Session 1's decisions on TipTap wrapper API + file location + per-item Analysis wiring shape). **ONE push** to `origin/workflow-2-competition-scraping` (no main push since this is a build session, not a deploy session; no ping-pong sync since main doesn't move).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for any wrapper-shape ambiguity that surfaces (file location, props API, JSON contract, on-change debounce timing), surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers. Per `feedback_default_to_recommendation.md`, skip the picker if the question is asking permission to proceed on a path the director would default-approve (e.g., "should the wrapper auto-save on blur?" — yes per typical rich-text-editor UX; skip the picker).

**Schema-change-in-flight flag:** enters **YES** (carrying from Workstream 1's `prisma db push` 2026-05-24). **Stays YES** through subsequent Workstream 2 sessions + Workstream 3 sessions until the first deploy session ships the schema-aware code to vklf.com.

---

## Pre-session notes (offline steps for director between sessions)

**Required offline step BEFORE the next P-46 Workstream 2 Session 1:** none. The TipTap dependency install runs from inside the Codespace; the per-item Analysis PATCH wiring runs against the existing Supabase schema (already migrated this session).

**Standing optional offline step (NOT blocking P-46 Workstream 2 — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking P-46 Workstream 2 at all — can happen any time. Director-independent.

**Optional offline reading for director:** `docs/COMPETITION_DATA_V2_DESIGN.md` §A.5 (TipTap rich-text editor decision; ~3-minute skim) + §C.2 Workstream 2 implementation outline (~2-minute skim) + §B 2026-05-24 (Workstream 1 closing entry + the "Workstream Foundation Build Bundle" Pattern; ~3-minute skim). Worth scanning before the next session if director wants context for the TipTap wrapper design.

**Pre-build setup (informational — Claude will handle in-session):** the Workstream 2 Session 1 session doesn't sideload the extension or run any real-Chrome verification; the only "setup" is the `npm install` of 3 new TipTap dependencies which runs as a regular Bash command without director involvement.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned.

**Rule 9 triggers planned this session: ZERO** — no schema changes (Workstream 1 already covered all of P-46's schema); no `git push origin main`; no `git reset --hard`; no `git push --force`; no `git branch -D`; no `rm -rf`; no SQL DELETE/DROP/TRUNCATE planned.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits a 🚨 alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any build work.

---

## Why this pointer was written this way (debug aid)

Today's session was the P-46 Workstream 1 (Schema) first build session — the foundation of the P-46 5-workstream implementation arc the 2026-05-23 design session locked. The session ran cleanly: schema delta designed against §A.11 + Rule 9 director-Yes gate for `npx prisma db push` + 4 new API route shells scaffolded as 501-stubs + shared-types extended + 12 new node:test cases + /scoreboard 5/5 GREEN at new baselines. The session came in under estimate (1 session vs. 2-3 planned per §C.1) which memorialized the "Workstream Foundation Build Bundle" reusable Pattern.

The natural next-session task per Q10's locked sequencing is **P-46 Workstream 2 (URL detail page redesign) Session 1** — Workstream 2 follows Workstream 1 since downstream workstreams depend on the schema. No §4 Step 1c forced-picker needed because the sequencing decision was made at the design session; the picker fired ONCE during Q10 and the answer is binding for the next ~10+ sessions.

The shape of the Workstream 2 Session 1 session is **pure code session with ZERO Rule 9 gates** — no schema changes (Workstream 1 covered all of P-46's schema); TipTap wrapper + per-item Analysis on Captured Text + 3 new npm dependencies; /scoreboard GREEN at new baselines; doc-batch + ONE push to workflow-2 at end. No main push, no ff-merge, no Vercel auto-redeploy, no ping-pong sync — Workstream 2 Session 1 is a build session, not a deploy session.

**Alternate next-session candidates if director shifts priorities at session start (after Workstream 1 + before Workstream 2 Session 1):**

- **Defer P-46 Workstream 2 + start P-47 Shadow DOM refactor.** ~2-3 sessions. NOT recommended — P-47 is LOW priority (band-aid works empirically) AND sequencing-wise the design doc explicitly noted Shadow DOM should wait until P-46 implementation lands so the refactor doesn't conflict with new in-form interactions P-46 may introduce. If director picks this, it's a small reversible polish but it doesn't advance P-46's W#2-graduation path.
- **Defer P-46 Workstream 2 + start P-26 below-fold scroll capture.** ~1-2 sessions. NOT recommended — P-46 is the big-scope item that's been in flight since 2026-05-22-c; P-26 is much smaller + the workaround works. Jumping to P-26 doesn't advance the W#2 graduation path materially AND P-46's vklf.com-side image upload affordances (Workstream 2) may reduce P-26's urgency.
- **Defer P-46 Workstream 2 + start P-27 Bug #9 + Bug #15 (the remaining deferred captured-videos polish leftovers).** NOT recommended — both bugs are LOW priority and may obsolete entirely with P-46's redesign (which restructures the URL detail page surface they live in). Better to lock the P-46 implementation first + see if P-46 reshapes the surface in a way that closes Bug #9 + Bug #15 incidentally.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.
- **A polish-detour ahead of P-46 Workstream 2 Session 1 if director wants pre-flight infrastructure work.** No obvious candidate this time — the operational substrate is hardened across 3 layers (P-42 backup-memory hook + P-43 absolute-paths discipline + P-44 wxt build/zip wrappers); Workstream 1's foundation just landed cleanly so there's no new substrate work surfaced. If director picks this path, surface the open polish landscape as a Rule 14f forced-picker.

Check `ROADMAP.md` for the canonical state. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §A.5 + §C.2 + §B 2026-05-24 for Workstream 2's binding scope + the prior session's empirical schema landing notes.
