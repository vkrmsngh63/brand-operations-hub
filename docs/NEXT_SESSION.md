# Next session

**Written:** 2026-05-20-c (`session_2026-05-20-c_p27-build-1-schema-bucket-helper` — end-of-session handoff after P-27 Captured-videos feature BUILD SESSION #1 SHIPPED at code level on `workflow-2-competition-scraping`. Commit `c8fa639` landed the schema migration (`npx prisma db push` for new `CapturedVideo` table + `VideoSourceType` enum + `video-category` added to `VocabularyEntry.vocabularyType` String column comment allowlist — NOT a Prisma enum per Build #1 mid-build refinement) + new Supabase Storage bucket `competition-scraping-videos` (private + 3-MIME allowlist `video/mp4, video/webm, video/quicktime`; bucket-level 100 MB cap REJECTED by Supabase Global File Size Limit → deferred to dashboard step; size enforcement falls to app-layer per design doc §A.11 two-layer client + server pattern) + new helper modules `src/lib/competition-video-storage.ts` + `src/lib/competition-video-storage-helpers.ts` paralleling existing `competition-storage*` siblings + 41 new node:test cases. Closes (a.54) RECOMMENDED-NEXT (partial — Build #1 lands schema + bucket + helper only; subsequent Build sessions add API routes / extension UI / Playwright spec / deploy / verify per design doc §A.2 implementation arc table). Opens **(a.55) RECOMMENDED-NEXT = P-27 implementation #2 (Build session — API routes scaffolding + shared-types extensions for route request/response shapes) on `workflow-2-competition-scraping`** as the natural-continuation next session per design doc §A.2 implementation arc table row #3.

**For:** the next Claude Code session — second P-27 Build session (Session #2 of estimated ~6-9 build sessions per the design doc §A.2 implementation arc table). API routes scaffolding under `/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/` + extension/shared-types extensions for the route request/response shapes — `RequestVideoUploadRequest` / `RequestVideoUploadResponse` / `FinalizeVideoUploadRequest` / `FinalizeVideoUploadResponse` / `ListCapturedVideosResponse`. Mirror the existing sibling API routes under `/api/projects/[projectId]/competition-scraping/urls/[urlId]/images/` exactly (request-upload-url + finalize-upload + list + delete + wipe). Per Rule 23 Change Impact Audit: Additive (safe) — new optional routes + new optional shared-type interfaces; no existing data affected; no downstream-consumer breakage risk (no consumers exist yet for the new routes). **Schema-change-in-flight flag stays "No"** — Build #2 is pure code; no new tables / enums / columns.

---

## Status of today's session

**P-27 Captured-videos feature BUILD SESSION #1 SHIPPED at code level on `workflow-2-competition-scraping`.** One-hundred-and-twenty-first Claude Code session. Build commit `c8fa639` landed locally + pushed via end-of-session bundle to `origin/workflow-2-competition-scraping`. The shared production Supabase DB now has the new `CapturedVideo` table + `VideoSourceType` enum live; the new `competition-scraping-videos` bucket is created (private + 3-MIME allowlist); the new `src/lib/competition-video-storage*` helpers are in place. No API routes yet wire up to the helpers; no extension UI surfaces the capture flow; Build #2 begins the API route scaffolding work.

**6 new files shipped (5 production + 1 script):**

- `prisma/schema.prisma` — added `CapturedVideo` model + `VideoSourceType` enum + `capturedVideos` back-relation on `CompetitorUrl` + `video-category` to `VocabularyEntry.vocabularyType` comment allowlist (additive — schema applied via `npx prisma db push`).
- `src/lib/shared-types/competition-scraping.ts` — added `VIDEO_*` constants + `ACCEPTED_VIDEO_MIME_TYPES` + `VideoSourceType` + `isAcceptedVideoMimeType` + `isVideoSourceType` + `CapturedVideo` wire interface + `video-category` to `VOCABULARY_TYPES`.
- `src/lib/competition-video-storage-helpers.ts` — pure helpers (MIME mapping, path composers, size validation incl. NaN+Infinity edge cases, embed platform detection across 6 hosts via 13 URL-pattern regexes).
- `src/lib/competition-video-storage.ts` — Supabase SDK ops paralleling `competition-storage.ts`.
- `src/lib/competition-video-storage-helpers.test.ts` — 41 node:test cases (all GREEN).
- `scripts/create-competition-scraping-videos-bucket.mjs` — idempotent SDK bucket-creation script.

**3 mid-build refinements captured in `docs/CAPTURED_VIDEOS_DESIGN.md` §B 2026-05-20-c (per Rule 18 append-only):**

1. Schema shape matched sibling `CapturedImage` where §A.7 draft diverged — `tags` Json not String[], `id` uuid not cuid, `videoCategory` + `composition` nullability mirrors sibling.
2. `VocabularyEntry.vocabularyType` is a `String` column NOT a Prisma enum as both the design doc and the launch prompt loosely worded — plain string-value addition + comment-list update; no enum migration.
3. Supabase bucket created without bucket-level `fileSizeLimit=100MB` cap because the project's Global File Size Limit (Storage Settings) rejected the value below 100 MB — bucket-level cap DEFERRED to dashboard offline step; size enforcement falls to app-layer per design doc §A.11 two-layer client + server pattern (which is the documented design — the bucket-level cap was a third defense-in-depth layer that didn't make it).

**ONE DEFERRED item open at end-of-session** — Task #9 "Raise Supabase Global File Size Limit to enable bucket-level 100MB cap on competition-scraping-videos." Destination: ROADMAP P-27 polish-backlog entry sub-item (captured). Director's offline dashboard step — not blocking Build #2; can happen any time.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry** captures a parallel Bash `cd` shell-state collision during the /scoreboard run (relative `cd extensions/competition-scraping` raced on shared CWD state across 4 parallel Bash calls; one call landed in the extension dir first, second call's relative cd errored, third call's `find src/lib` silently found the EXTENSION's `src/lib` instead of the root's and returned 428 cases instead of expected 577 — coincidentally matched the extension test baseline so looked correct). Caught + corrected before any decision was made on the wrong count; final scoreboard reported the correct 577/577. Lesson: use absolute paths for parallel Bash calls that need specific CWDs; suggested follow-up to update `.claude/commands/scoreboard.md` to use absolute paths throughout.

**Pre-end-of-session scoreboard (all GREEN):** root tsc clean / extension tsc clean / `npm run build` **53 routes** (unchanged) / src/lib node:test **577/577** (+41 from baseline 536) / extension `npm test` **428/428** (unchanged) / Playwright **91/91** (unchanged).

**Schema-change-in-flight flag stayed "Yes"** during the `prisma db push` window + flipped back to "No" at end-of-session AFTER Build #1 commit landed + schema verified-applied + no rollback needed. **Per Rule 23 Change Impact Audit:** Additive (safe).

---

## Branch

**`workflow-2-competition-scraping`** — Build sessions stay on the feature branch; ff-merge to main only at /deploy stages (Build #2 does NOT ship to main — only the API routes + shared-types extensions land on the feature branch; the full P-27 Build arc ships via a future deploy session per design doc §A.2). The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at the end-of-session doc-batch commit + Build #1 commit `c8fa639`; `main` at SHA `a754aee` (unchanged since 2026-05-20 deploy + doc-batch); workflow-2 TWO COMMITS AHEAD of main (Build #1 commit `c8fa639` + this session's end-of-session doc-batch commit). No ping-pong sync was needed at end of this session because main didn't move.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. Today's task:

**W#2 polish P-27 implementation #2 — Build session (API routes + shared-types extensions for route request/response shapes) on `workflow-2-competition-scraping`.** Closes **(a.55) RECOMMENDED-NEXT** (partial close — Build #2 lands the API routes + shared-types extensions only; subsequent Build sessions add extension UI / Playwright spec / deploy / verify per `docs/CAPTURED_VIDEOS_DESIGN.md` §A.2 implementation arc table).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-27 polish-backlog entry (annotated 2026-05-20-c with "✅ Build #1 complete 2026-05-20-c" + new DEFERRED sub-item for Supabase Global File Size Limit raise).
- `docs/CAPTURED_VIDEOS_DESIGN.md` fully (§A.7 CapturedVideo schema spec — now also reflected in the live DB; §A.9 bucket configuration; §A.11 size-cap enforcement two-layer client + server pattern; §A.2 implementation arc table row #3 — the canonical source for Build #2's task shape; §B 2026-05-20-c entry — the 3 mid-build refinements that constrain Build #2's request/response shapes).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-20-b entry (the cross-reference pointer to CAPTURED_VIDEOS_DESIGN).
- `src/lib/competition-video-storage.ts` (the Supabase SDK ops helper — Build #2's API routes will call its surfaces).
- `src/lib/competition-video-storage-helpers.ts` (the pure helpers — Build #2's API route validation will lean on its size + MIME guards).
- `src/lib/shared-types/competition-scraping.ts` (the existing `CapturedImage` request/response shapes — Build #2's new video request/response interfaces should mirror these exactly).
- `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/images/` route handlers (the sibling API routes — Build #2's video routes mirror these handler shapes exactly).
- `docs/HANDOFF_PROTOCOL.md` Rule 8 (Pre-flight audit for destructive operations — Build #2 has NO Rule 8 triggers, but verify on each tool call) + Rule 23 (Change Impact Audit — classify Build #2 as Additive (safe) BEFORE coding).

**Task shape (Build session #2):**

1. **Pre-flight audit per Rule 8 + Rule 23.** Build #2 is pure code — no `prisma db push`, no `git push origin main`, no destructive ops. Classify per Rule 23: ADDITIVE (safe) — new optional routes + new optional shared-type interfaces; no existing data affected; no downstream-consumer breakage risk (no consumers exist yet). Surface the Rule 23 audit to director via AskUserQuestion only if a non-additive change is discovered mid-build; otherwise proceed.

2. **Shared-types extensions.** Add new request/response interfaces in `src/lib/shared-types/competition-scraping.ts`:
   - `RequestVideoUploadRequest` (mirror `RequestImageUploadRequest` shape — `mimeType: string` + `fileSize: number`).
   - `RequestVideoUploadResponse` (mirror `RequestImageUploadResponse` shape — `uploadUrl: string` + `bucketPath: string` + `expiresInSeconds: number`).
   - `FinalizeVideoUploadRequest` (mirror `FinalizeImageUploadRequest` shape — `bucketPath: string` + the metadata fields from `CapturedVideo` wire interface: `videoCategory?` + `composition?` + `embeddedText?` + `tags?` + `sourceType` + `fileSize?` + `mimeType?` + `durationSeconds?` + `width?` + `height?` + `thumbnailStoragePath?` + `originalSrcUrl?` + `source: 'extension' | 'manual'`).
   - `FinalizeVideoUploadResponse` (mirror `FinalizeImageUploadResponse` shape — `capturedVideo: CapturedVideo`).
   - `ListCapturedVideosResponse` (mirror `ListCapturedImagesResponse` shape — `videos: CapturedVideo[]`).
   - Add type guards `isRequestVideoUploadRequest` / `isFinalizeVideoUploadRequest` etc. paralleling the existing image type guards.

3. **API route scaffolding.** Add new route handlers under `/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/`:
   - `request-upload-url/route.ts` — POST → validates request via type-guard → uses `requestVideoUploadUrl` helper → returns `RequestVideoUploadResponse`. Mirror the image sibling exactly. Server-side enforcement: size cap (100 MB per design doc §A.10) + MIME allowlist (`isAcceptedVideoMimeType`) per design doc §A.11 layer 2.
   - `finalize-upload/route.ts` — POST → validates request via type-guard → uses `finalizeVideoUpload` helper → persists `CapturedVideo` row → returns `FinalizeVideoUploadResponse`. Mirror the image sibling exactly.
   - `route.ts` (list) — GET → uses Prisma `capturedVideo.findMany` filtered by `competitorUrlId` → returns `ListCapturedVideosResponse`. Mirror the image sibling exactly.
   - `[videoId]/route.ts` — DELETE → uses `deleteVideo` helper → removes the CapturedVideo row + the storage object → returns 204. Mirror the image sibling exactly.

4. **Test coverage (Rule 27 Hybrid).** Add node:test cases for the new type guards + any new pure-helper logic added during Build #2. The API route handlers themselves DO NOT get node:test coverage at Build #2 (they need a Supabase mock harness; that arrives at a later Build session per design doc §A.13 test coverage approach). Surface to director via AskUserQuestion if a Rule 27 picker is needed for any non-helper test surface added this session.

5. **Scoreboard:** verify `npx tsc --noEmit` clean + `cd /workspaces/brand-operations-hub/extensions/competition-scraping && npx tsc --noEmit` clean (absolute path per the 2026-05-20-c CORRECTIONS_LOG §Entry — avoid parallel-Bash relative-cd footgun) + `npm run build` clean (expect **57 routes** — was 53; +4 new route handlers from this session: request-upload-url + finalize-upload + list + delete) + src/lib node:test passes with new cases (expect **~580-590/580-590** depending on how many type-guard cases added) + extension `npm test` unchanged (**428/428** — no extension source change this session) + Playwright **91/91** unchanged.

6. **Build commit on workflow-2** (no main push this session — Build #2 stays on feature branch). End-of-session doc-batch covers ROADMAP (P-27 polish-backlog annotation extended with "Build #2 complete: API routes + shared types") + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG (likely zero new entries) + NEXT_SESSION (rewritten for Build #3) + CAPTURED_VIDEOS_DESIGN §B 2026-05-21 entry (capturing any mid-build refinements + the Rule 23 audit outcome).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for any mid-build forced-pickers (e.g., naming conventions on the new shared-type interfaces; whether to add a separate `embed-url` route shape for sources where there's no upload step), surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers.

**Schema-change-in-flight flag:** stays "No" the entire session (Build #2 is pure code — no `prisma db push`, no schema edit). Flips to "Yes" only if a mid-build refinement reveals a schema gap requiring an additive migration (unlikely — Build #1 already landed the binding schema).

---

## Pre-session notes (offline steps for director between sessions)

**NO required offline steps for Build #2** — Build #2 is pure code (API routes + shared types). No new buckets, no schema changes, no dashboard work needed before the session starts.

**OPTIONAL offline step (NOT blocking Build #2):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step:

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

This adds the defense-in-depth bucket-level cap on top of the app-layer two-layer enforcement that's already shipped. Not blocking Build #2 — can happen any time. The DEFERRED Task #9 sub-item under ROADMAP P-27 tracks this for future closure.

**Optional offline reading for director:** `docs/CAPTURED_VIDEOS_DESIGN.md` §A.7 (CapturedVideo schema spec — now also reflected in the live DB) + §A.11 (size-cap enforcement two-layer pattern — Build #2's request-upload-url route's server-side enforcement) + §A.2 (implementation arc table) — ~5-minute skim before the next session if director wants the full context on what Build #2 will land.

---

## Destructive-operation safety check for next session

**NO Rule 8 (destructive operation) triggers planned** this session — Build #2 is pure code; no `prisma db push`, no `git push origin main`, no destructive ops.

**NO Rule 9 (main deploy) triggers planned** this session — Build #2 stays on workflow-2 feature branch; no main push; no Vercel redeploy; no ping-pong sync. The Build arc's first deploy lands at a future Build session per design doc §A.2.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe.

---

## Why this pointer was written this way (debug aid)

Today's session ran P-27 Build #1 (schema + bucket + helper) per the design doc §A.2 implementation arc table row #2. The §4 Step 1c forced-picker was NOT fired as a separate decision because the design doc §A.2 implementation arc table itself encodes the next-session pick: Build #2 (API routes + shared-types extensions) follows Build #1 directly per row #3. This is the canonical pattern for sequential Build sessions in a multi-session implementation arc per Rule 18.

Build #2's launch prompt is shaped around (a) mirroring the existing sibling image API routes exactly (request-upload-url + finalize-upload + list + delete), (b) adding the new shared-type interfaces in `src/lib/shared-types/competition-scraping.ts`, and (c) leaning on the `competition-video-storage*` helpers shipped in Build #1 for the route handler implementations. No extension UI yet; no Playwright spec yet — those arrive at Build sessions #3-#6 per design doc §A.2.

The 2026-05-20-b director-confirmed picks (11 forced-picker outcomes in design doc §A.0) + the 2026-05-20-c Build #1 mid-build refinements (in design doc §B 2026-05-20-c) are binding inputs to Build #2; do NOT re-litigate. The design doc §A.7 schema spec + Build #1's actual implementation reality (mirroring `CapturedImage` exactly for `tags` / `id` / nullability) are both binding inputs; Build #2 should not extend or modify the schema or the helpers beyond what's already landed.

**Alternate next-session candidates if director shifts priorities at session start (after Build #1 lands + before Build #2):**

- **P-42 backup-memory-dir.sh hook investigation + fix (HIGH severity — STILL RECOMMENDED before Build #2 if not already shipped; ROADMAP P-42 line 173).** Captured 2026-05-20-b as a HIGH-severity gap in Layer 1 (Mechanical) of the P-41 4-layer memory-loss-prevention architecture. **REPRODUCED 2026-05-20-c** during this session — Claude wrote NEW memory file `feedback_handoff_carryovers_to_roadmap.md` + edited `MEMORY.md`; backup mirror did NOT receive either file automatically; manually mirrored via 2 `cp` commands at session-close (same gap as 2026-05-20-b). Until investigated + fixed, every future session that writes memory files risks creating stale-mirror gaps that defeat the architecture's safety guarantee. Estimated ~1 session; LOW LOC; HIGH operational importance.
- **P-43 `.claude/commands/scoreboard.md` template polish — convert relative `cd` to absolute paths (LOW-MEDIUM severity; NEW 2026-05-20-c; ROADMAP P-43).** Sub-1-hour polish; removes the relative-cd footgun from the canonical /scoreboard skill template so future sessions don't repeat the parallel-Bash-cd shell-state collision slip that produced a misleading 428-vs-577 test count this session. Captured in CORRECTIONS_LOG §Entry 2026-05-20-c.
- **P-44 `wxt build` parent-process hang investigation (LOW severity but operationally annoying; NEW 2026-05-20-c; ROADMAP P-44).** Multi-session-recurring (2026-05-19-f + 2026-05-19-g + 2026-05-21 + 2026-05-20-c). Tactical workaround documented in `.claude/commands/scoreboard.md` KNOWN ISSUE section. Worth a dedicated investigation session — estimated ~1 session for diagnosis; ship time TBD based on root cause. Cross-references P-43 (the scoreboard.md template polish may surface the wxt hang more cleanly once relative-cd is removed).
- **Raise Supabase Global File Size Limit (DEFERRED Task #9 from this session, now landed in ROADMAP as P-27 sub-item).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time.
- **P-26 below-fold full-page-scroll capture** (LOW-severity deferred large lift — currently the only remaining non-P-27 pre-graduation polish item; current workaround works; ~600-1000 LOC code-only session, no design needed). Recommended *only* if director wants to wrap the smaller-scope polish item BEFORE the rest of P-27's Build arc. Estimated 1-2 sessions.
- **Manual-add modal originalSrcUrl tack-on** (DEFERRED from 2026-05-19-e — trivial 1-line; could fold into any P-NN session or be its own sub-1-hour session). **Per `feedback_handoff_carryovers_to_roadmap.md` (NEW 2026-05-20-c standing rule):** this DEFERRED carry-over should also land in ROADMAP at next opportunity (currently surfaces only in this NEXT_SESSION.md alternates list + the prior 2026-05-19-e CORRECTIONS_LOG entry).

Check `ROADMAP.md` for the canonical state.
