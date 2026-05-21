# Next session

**Written:** 2026-05-21 (`session_2026-05-21_p27-build-2-api-routes-shared-types` — end-of-session handoff after P-27 Captured-videos feature BUILD SESSION #2 SHIPPED at code level on `workflow-2-competition-scraping`. Commit `7093f2e` landed 4 new API routes under `/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/` (requestUpload + finalize + list) + the sibling per-row endpoint at `competition-scraping/videos/[videoId]/` (PATCH + DELETE) + 7 new wire interfaces + 2 new type guards in `src/lib/shared-types/competition-scraping.ts` + 12 new node:test cases + 1 stale-test fix for `isVocabularyType`. Closes (a.55) RECOMMENDED-NEXT (partial — Build #2 lands the API routes + shared-types extensions only; subsequent Build sessions add extension UI / Playwright spec / deploy / verify per design doc §A.2 implementation arc table). Opens **(a.56) RECOMMENDED-NEXT = P-27 implementation #3 (Build session — extension content-script right-click on `<video>` form + helper `find-underlying-video-embed.ts` + pure-helper node:test cases) on `workflow-2-competition-scraping`** as the natural-continuation next session per design doc §A.2 implementation arc table row #4. **First Build session that lands a user-visible surface** — the right-click "Add to PLOS — Captured Video" content-menu entry + the inline content-script form that the director can actually see + use during a sideload-and-test of the extension.

---

## What we did this session (in plain terms)

In plain terms: we built the "back end of the back end" for the captured-videos feature. We did NOT touch anything the user sees yet. We added four new web addresses (API routes) that the eventual browser-extension form will talk to when you right-click a video on a competitor's page and say "Add to PLOS." Two of the routes mint short-lived signed upload URLs (one for the video file itself + one for the thumbnail image), one finalizes the upload by saving a database row, one returns the list of videos already saved for a URL, and the per-row route at a sibling path handles edits + deletes for individual videos. We also added the contract definitions ("shared types") that say what each route expects + what it returns, so the front end + back end + tests + extension all stay in agreement. Finally we wrote twelve new tiny tests that prove the validators (the guards that check incoming requests look right) reject bad data + accept good data; and we fixed one tiny stale test that had drifted since Build #1.

No deploy. Nothing on vklf.com changed. Nothing the user clicks on yet.

## What we'll do next session (in plain terms)

Next session is **Build #3** — the **first session you'll be able to actually see + click**. We'll add the right-click menu entry "Add to PLOS — Captured Video" inside the browser extension, plus the little inline form that pops up after you right-click a `<video>` element on a competitor's page (the same shape as the existing right-click form for captured images). We'll also add a small helper file that walks the page's DOM to find the underlying video URL when the right-clicked element is an embed (YouTube, Vimeo, etc.) rather than a direct `<video>` tag. We'll write tests for that helper (the pure functions are testable without a browser). At the end you'll have an extension build you can sideload + try by right-clicking a competitor video; the data will save through the API routes we shipped this session. No deploy yet — that comes in a later session.

## What's still left on the total roadmap (in plain terms)

**W#2 Competition Scraping** still has 4 polish items gating graduation:

- **P-27 Captured videos** (the one we're inside right now) — Builds #1 + #2 done; Builds #3 through ~#6-9 still to go (extension UI + Playwright spec + deploy + director real-Chrome verification).
- **P-26** below-fold full-page-scroll capture (lower priority; current workaround works; estimated 1-2 sessions when we get to it).
- **P-42** `backup-memory-dir.sh` hook fix — **strongly recommended to ship before any future big session** (three reproductions now confirm Claude's memory directory is unsafe across any future Codespaces rebuild until this ships; ~1 session, low LOC, high operational importance).
- **P-43** `.claude/commands/scoreboard.md` template polish — convert relative `cd` to absolute paths (sub-1-hour polish; reproduction #2 of the same slip happened this session, so the case is getting stronger).
- **P-44** `wxt build` parent-process hang investigation (low severity; workaround documented; ~1 session for diagnosis).

After all W#2 polish ships, W#2 graduates (frozen as a production tool — pattern matches W#1 Keyword Clustering).

**W#3-W#14** — twelve more workflows on the roadmap; none started yet. Order TBD by director when W#2 graduates.

**Infrastructure TODOs:** raise Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos` (offline dashboard step; director can do anytime; not blocking any session).

---

**For:** the next Claude Code session — third P-27 Build session (Session #3 of estimated ~6-9 build sessions per the design doc §A.2 implementation arc table). Extension content-script right-click on `<video>` form (parallels existing `image-capture-form.ts` shape) + new helper `find-underlying-video-embed.ts` (parallels existing `find-underlying-image.ts`) + pure-helper node:test cases. Per Rule 23 Change Impact Audit: Additive (safe) — new optional content-script form + new optional helper; no existing data affected; no downstream-consumer breakage risk (the API routes shipped this session are the consumers, and they accept the new requests cleanly per the shared-type contracts). **Schema-change-in-flight flag stays "No"** — Build #3 is pure code; no new tables / enums / columns / API routes.

---

## Status of today's session

**P-27 Captured-videos feature BUILD SESSION #2 SHIPPED at code level on `workflow-2-competition-scraping`.** One-hundred-and-twenty-second Claude Code session. Build commit `7093f2e` landed locally + will push via end-of-session bundle to `origin/workflow-2-competition-scraping`. The shared production Supabase DB schema is unchanged from Build #1 (Build #2 is pure code). 4 new API routes live on the feature branch; the API routes call the `src/lib/competition-video-storage*` helpers shipped in Build #1. No extension UI surfaces the capture flow yet; Build #3 begins the extension-side work.

**4 new API route files shipped + 1 modified shared-types file + 1 modified test file:**

- NEW `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/requestUpload/route.ts` — POST (DIRECT_BYTES only); mints TWO signed URLs (video bytes + thumbnail) per design doc §A.9; uses `requestVideoUploadUrls` helper from Build #1.
- NEW `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/finalize/route.ts` — POST (EMBED + DIRECT_BYTES branches via `sourceType` discriminator); idempotent on `clientId @unique` race; persists `CapturedVideo` row + returns the wire shape.
- NEW `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/route.ts` — GET list (filtered by `competitorUrlId`); returns bare `CapturedVideo[]`; URL minting deferred to a future Build session per design-doc §B 2026-05-21 staging decision.
- NEW `src/app/api/projects/[projectId]/competition-scraping/videos/[videoId]/route.ts` — PATCH + DELETE at the SIBLING path (NOT nested under `urls/[urlId]/`); mirrors image sibling at `competition-scraping/images/[imageId]/` exactly.
- MODIFIED `src/lib/shared-types/competition-scraping.ts` — added 7 new wire interfaces (`RequestVideoUploadRequest` / `RequestVideoUploadResponse` / `FinalizeVideoUploadRequest` / `FinalizeVideoUploadResponse` / `ListCapturedVideosResponse` / `UpdateCapturedVideoRequest` / `UpdateCapturedVideoResponse` / `DeleteCapturedVideoResponse`) + 2 new type guards (`isRequestVideoUploadRequest` / `isFinalizeVideoUploadRequest`).
- MODIFIED `src/lib/shared-types/competition-scraping.test.ts` — extended with 12 new node:test cases covering the new type guards + an update to the existing `isVocabularyType` test to include `video-category` (Build #1 added it but the test stayed stale — caught + fixed this session).

**3 mid-build judgment calls captured in `docs/CAPTURED_VIDEOS_DESIGN.md` §B 2026-05-21 (per Rule 18 append-only):**

1. File naming camelCase (`requestUpload/route.ts`, `finalize/route.ts`) vs. hyphenated (`request-upload-url/`, `finalize-upload/`) — picked camelCase to mirror the image sibling EXACTLY. Launch prompt named files loosely as hyphenated; actual image sibling uses camelCase. "Mirror exactly" per `feedback_default_to_recommendation.md` standing rule.
2. Per-row PATCH+DELETE path placement — nested (`urls/[urlId]/videos/[videoId]/`) vs. sibling (`competition-scraping/videos/[videoId]/`) — picked sibling to mirror image sibling exactly. The launch prompt's nested phrasing was a loose paraphrase, not binding micro-architecture.
3. List endpoint response shape — bare `CapturedVideo[]` vs. `CapturedVideoWithUrls[]` (pre-minted signed URLs mirroring `CapturedImageWithUrls[]`) — picked bare `CapturedVideo[]`. URL minting at list time is expensive for video (1-hour TTL × N rows × possibly TWO URLs per row); the image sibling added it later (slice a.2) when the gallery UI needed it. Following the same staging here — defer URL minting to a future Build session when the URL detail page renderer is built.

**ZERO DEFERRED items open at end-of-session** — all 4 TaskList items closed as `completed`.

**TWO NEW INFORMATIONAL CORRECTIONS_LOG §Entries** captured:

- **(i)** Parallel-Bash relative-`cd` shell-state collision REPRODUCED during /scoreboard execution (reproduction #2 of the 2026-05-20-c entry — a parallel `npm run build` call ran in the extensions/competition-scraping directory because an earlier parallel `cd extensions/competition-scraping && npx tsc --noEmit` leaked CWD state; caught + corrected by re-running with explicit `cd /workspaces/brand-operations-hub && npm run build > /tmp/next-build.log 2>&1`; strengthens the case for P-43 to ship soon).
- **(ii)** `backup-memory-dir.sh` PostToolUse hook did NOT auto-mirror the new feedback-memory file — **P-42 reproduction #3**. Manually mirrored via `cp` before the commit. Three reproductions across three consecutive memory-write sessions confirms P-42 is reliably reproducible + that director's memory is unsafe across any future Codespaces rebuild until P-42 ships. STRONGLY recommended to ship before any future big session.
- **Sub-observation** under (ii): background-task output capture wrote 0 bytes on two consecutive backgrounded `npm run build` attempts despite EXIT=0 confirmed via subsequent inline re-run. Workaround: use explicit `> /tmp/file.log 2>&1` redirect + run synchronously. Informational; not blocking.

**Pre-end-of-session scoreboard (all GREEN):** root tsc clean / extension tsc clean / `npm run build` **57 routes** (+4 over baseline 53 — new requestUpload + finalize + videos list + videos/[videoId]) / src/lib node:test **589/589** (+12 over baseline 577 — new video type-guard cases) / extension `npm test` **428/428** (unchanged — no extension source touched) / Playwright **91/91** (unchanged).

**Schema-change-in-flight flag stayed "No"** the entire session. **Per Rule 23 Change Impact Audit:** Additive (safe).

**NEW Rule 30 + §4 Step 4b template extension shipped this session** per director's verbatim 2026-05-21 standing directive: *"From here on, for every next session, I want you to also tell me in simple terms what we will do in the session and summarize what was done in the session and what we will do in the next session. I also want you to check and tell me what work is pending according to the roadmap in simple terms."* New operational-memory file `feedback_session_bookends_plain_summary.md` saved + indexed in MEMORY.md (both manually mirrored to `.codespace-backup/memory/` after P-42 reproduction #3). Companion `docs/CLAUDE_CODE_STARTER.md` Step 7b added in start-of-session sequence.

---

## Branch

**`workflow-2-competition-scraping`** — Build sessions stay on the feature branch; ff-merge to main only at /deploy stages (Build #3 does NOT ship to main — only the extension content-script + helper + tests land on the feature branch; the full P-27 Build arc ships via a future deploy session per design doc §A.2). The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at the end-of-session doc-batch commit + Build #2 commit `7093f2e` + the 2026-05-20-c lineage (Build #1 commit `c8fa639` + 2026-05-20-c doc-batch `ab8cd01` + 2026-05-20-c addendum `e3f344e`); `main` at SHA `a754aee` (unchanged since 2026-05-20 deploy + doc-batch). Workflow-2 is FIVE COMMITS AHEAD of main (Build #1 + Build #1 doc-batch + Build #1 addendum + Build #2 + this session's doc-batch). No ping-pong sync was needed at end of this session because main didn't move.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As the new Step 7b says, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-27 implementation #3 — Build session (extension content-script right-click on `<video>` form + helper `find-underlying-video-embed.ts` + pure-helper node:test cases) on `workflow-2-competition-scraping`.** Closes **(a.56) RECOMMENDED-NEXT** (partial close — Build #3 lands the extension content-script form + helper + tests only; subsequent Build sessions add the popup paste form + saved-video indicator + URL detail renderer + Playwright spec + deploy + verify per `docs/CAPTURED_VIDEOS_DESIGN.md` §A.2 implementation arc table).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; note new Step 7b plain-terms summary added 2026-05-21).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-27 polish-backlog entry (annotated 2026-05-21 with "✅ Build #2 complete 2026-05-21").
- `docs/CAPTURED_VIDEOS_DESIGN.md` fully (§A.7 CapturedVideo schema spec; §A.9 bucket configuration; §A.11 size-cap enforcement two-layer client + server pattern; **§A.2 implementation arc table row #4 — the canonical source for Build #3's task shape**; §B 2026-05-20-c entry — the 3 mid-build refinements from Build #1; §B 2026-05-21 entry — the 3 mid-build judgment calls from Build #2 that constrain Build #3's helper-naming + form-shape choices).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-20-b entry (the cross-reference pointer to CAPTURED_VIDEOS_DESIGN).
- **The reference shape Build #3 will mirror** — `extensions/competition-scraping/src/lib/content-script/image-capture-form.ts` (the existing sibling content-script form for right-click image capture; Build #3's `video-capture-form.ts` mirrors this shape).
- **The reference helper Build #3 will mirror** — `extensions/competition-scraping/src/lib/content-script/find-underlying-image.ts` (the existing sibling DOM-walking helper; Build #3's `find-underlying-video-embed.ts` mirrors this shape).
- **The API routes Build #3's form will call** (just-shipped this session — Build #2 output) — `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/requestUpload/route.ts` + `finalize/route.ts` (the two routes the content-script form fires during capture).
- **The Build #1 helpers Build #3's helper might also call** — `src/lib/competition-video-storage-helpers.ts` (embed-platform detection helpers across 6 hosts + 13 URL-pattern regexes; Build #3's helper may compose with these or may live entirely in the extension content-script package — pick the path during a Rule 23 audit at session start).
- `src/lib/shared-types/competition-scraping.ts` (the wire types — Build #3's form must match `RequestVideoUploadRequest` + `FinalizeVideoUploadRequest` shapes exactly).
- `docs/HANDOFF_PROTOCOL.md` Rule 8 (Pre-flight audit for destructive operations — Build #3 has NO Rule 8 triggers, but verify on each tool call) + Rule 23 (Change Impact Audit — classify Build #3 as Additive (safe) BEFORE coding) + **Rule 30 (NEW 2026-05-21 — Session bookends; plain-language summaries at start + end)** + §4 Step 4b extended template (NEW 2026-05-21 — 3 new mandatory plain-terms sections at the TOP of the handoff).

**Task shape (Build session #3):**

1. **Pre-flight audit per Rule 8 + Rule 23.** Build #3 is pure extension-side code — no `prisma db push`, no `git push origin main`, no destructive ops. Classify per Rule 23: ADDITIVE (safe) — new optional content-script form + new optional helper; no existing data affected; no downstream-consumer breakage risk. Surface the Rule 23 audit to director via AskUserQuestion only if a non-additive change is discovered mid-build; otherwise proceed.

2. **Per Rule 30 (NEW 2026-05-21) — plain-terms session-start summary.** Before any heavy reads or coding, produce the "What this session will do (in plain terms)" summary so director can confirm the session shape. Cover: what we'll build, what we won't build, what the user will see at session-end, what the next session will pick up.

3. **New helper `find-underlying-video-embed.ts`.** Add `extensions/competition-scraping/src/lib/content-script/find-underlying-video-embed.ts` paralleling existing `find-underlying-image.ts`. Pure-function DOM walker that takes a right-click target element + walks up the DOM tree to find either (a) a direct `<video>` element (then `videoElement.currentSrc` or the `<source>` child's `src`), or (b) an `<iframe>` whose `src` matches a known video-embed-hostname allowlist (YouTube / Vimeo / TikTok / Loom / Wistia / Vidyard — already enumerated in Build #1's `embed-platform detection` helpers). Returns a normalized result: `{ kind: 'direct', src: string, mimeType: string|null } | { kind: 'embed', platform: string, src: string } | { kind: 'none' }`. Compose with Build #1's `competition-video-storage-helpers.ts` embed-detection helpers where useful; OR keep the extension helper self-contained if cross-package coupling is awkward (audit at session start).

4. **New content-script form `video-capture-form.ts`.** Add `extensions/competition-scraping/src/lib/content-script/video-capture-form.ts` paralleling existing `image-capture-form.ts`. Right-click context-menu entry "Add to PLOS — Captured Video" wires to this form; the form renders an inline overlay on the competitor page with fields mirroring the image-capture form (category dropdown + composition free-text + embeddedText + tags + a Save button). The Save button (a) calls `requestUpload` route to mint signed URLs (DIRECT_BYTES path) OR skips that for the EMBED path, (b) uploads video bytes + thumbnail to the signed URLs (DIRECT_BYTES path only), (c) calls `finalize` route with the metadata + bucketPath (or with `sourceType=embed_url` + the embed URL for the EMBED path), (d) shows the saved-video indicator overlay (a future Build session will polish the indicator UI; Build #3 can ship a basic "saved!" toast).

5. **Test coverage (Rule 27 Hybrid).** Add node:test cases for the new pure-function helper `find-underlying-video-embed.ts` — covering both happy paths (direct `<video>` + recognized embed) + edge cases (no video on page / unsupported embed / nested iframe / shadow DOM if relevant). The content-script form itself does NOT get node:test coverage at Build #3 (it depends on the DOM + browser APIs; Playwright extension-context coverage arrives at a later Build session per design doc §A.13).

6. **Scoreboard:** verify `npx tsc --noEmit` clean + `cd /workspaces/brand-operations-hub/extensions/competition-scraping && npx tsc --noEmit` clean (**absolute path per the 2026-05-20-c + 2026-05-21 CORRECTIONS_LOG §Entries — avoid parallel-Bash relative-cd footgun**) + `npm run build` clean (expect **57 routes** unchanged — no new API routes this session) + src/lib node:test passes (expect **589/589** unchanged — no new src/lib tests this session) + extension `npm test` passes with new helper tests (expect **~430-440/430-440** depending on how many helper test cases added — was 428/428) + Playwright **91/91** unchanged. **Fresh extension zip** required this session (extension source changed → zip rebuild) — name should follow the pattern `plos-extension-2026-05-22-w2-p27-build-3.zip` (substitute the actual session date).

7. **Build commit on workflow-2** (no main push this session — Build #3 stays on feature branch). End-of-session doc-batch covers ROADMAP (P-27 polish-backlog annotation extended with "Build #3 complete: extension content-script + helper") + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG (likely zero new entries unless P-42 reproduction #4 fires again) + NEXT_SESSION (rewritten for Build #4 — likely the popup paste form + saved-video indicator overlay) + CAPTURED_VIDEOS_DESIGN §B 2026-05-22 entry (capturing any mid-build judgment calls).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for any mid-build forced-pickers (e.g., whether to expose the EMBED vs DIRECT_BYTES branch as a single form with conditional inputs OR as two separate forms; whether to ship the saved-video indicator in Build #3 or defer to Build #4), surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers.

**Schema-change-in-flight flag:** stays "No" the entire session (Build #3 is pure code — no `prisma db push`, no schema edit; no new API routes; no shared-types schema changes).

---

## Pre-session notes (offline steps for director between sessions)

**NO required offline steps for Build #3** — Build #3 is pure extension-side code (content-script form + helper). No new buckets, no schema changes, no dashboard work needed before the session starts.

**STILL-OPEN optional offline step (NOT blocking Build #3 — carry-over from Build #1):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from 2026-05-20-c handoff):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

This adds the defense-in-depth bucket-level cap on top of the app-layer two-layer enforcement that's already shipped. Not blocking Build #3 — can happen any time. The DEFERRED Task #9 sub-item under ROADMAP P-27 still tracks this for future closure.

**Optional offline reading for director:** `docs/CAPTURED_VIDEOS_DESIGN.md` §A.2 (implementation arc table — Build #3 = row #4 = the first user-visible-surface session) + §A.7 (CapturedVideo schema spec — to understand what fields the form's metadata inputs cover) + §B 2026-05-21 entry (the 3 mid-build judgment calls Build #2 made that constrain Build #3's choices). ~5-minute skim before the next session if director wants the full context on what Build #3 will land.

---

## Destructive-operation safety check for next session

**NO Rule 8 (destructive operation) triggers planned** this session — Build #3 is pure extension-side code; no `prisma db push`, no `git push origin main`, no destructive ops.

**NO Rule 9 (main deploy) triggers planned** this session — Build #3 stays on workflow-2 feature branch; no main push; no Vercel redeploy; no ping-pong sync. The Build arc's first deploy lands at a future Build session per design doc §A.2.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact (verified at end of this session via `ls -la` + `wc -c` comparison; manually mirrored both files affected by P-42 reproduction #3 before the doc-batch commit). Critical files safe.

---

## Why this pointer was written this way (debug aid)

Today's session ran P-27 Build #2 (API routes + shared-types extensions) per the design doc §A.2 implementation arc table row #3. The §4 Step 1c forced-picker was NOT fired as a separate decision because the design doc §A.2 implementation arc table itself encodes the next-session pick: Build #3 (extension content-script + helper) follows Build #2 directly per row #4. This is the canonical pattern for sequential Build sessions in a multi-session implementation arc per Rule 18.

Build #3's launch prompt is shaped around (a) mirroring the existing sibling extension content-script form (`image-capture-form.ts`) exactly for the right-click `<video>` capture flow, (b) adding a new pure-function helper `find-underlying-video-embed.ts` (mirroring sibling `find-underlying-image.ts`) for the DOM walking from right-click target → underlying video/embed src, (c) leaning on the API routes shipped in Build #2 (`requestUpload` + `finalize`) for the network calls during capture, and (d) leaning on the Build #1 `competition-video-storage-helpers.ts` embed-detection helpers (6 hosts + 13 URL-pattern regexes) where useful for the helper's embed-recognition step. No popup paste form yet; no saved-video indicator overlay yet; no URL detail page renderer yet; no Playwright spec yet — those arrive at Build sessions #4-#6 per design doc §A.2.

The 2026-05-20-b director-confirmed picks (11 forced-picker outcomes in design doc §A.0) + the 2026-05-20-c Build #1 mid-build refinements (in design doc §B 2026-05-20-c) + the 2026-05-21 Build #2 mid-build judgment calls (in design doc §B 2026-05-21) are all binding inputs to Build #3; do NOT re-litigate. The shipped API routes + shared types + tests are also binding inputs; Build #3's form should match `RequestVideoUploadRequest` + `FinalizeVideoUploadRequest` shapes exactly.

**Alternate next-session candidates if director shifts priorities at session start (after Build #2 lands + before Build #3):**

- **P-42 backup-memory-dir.sh hook investigation + fix (HIGH severity — STRONGLY RECOMMENDED before Build #3 if not already shipped; ROADMAP P-42).** **REPRODUCTION #3 captured 2026-05-21** during this session — Claude wrote NEW memory file `feedback_session_bookends_plain_summary.md` + edited `MEMORY.md`; backup mirror was MISSING the new file entirely + the updated `MEMORY.md` was STALE; manually mirrored both via `cp` at session-close. Three reproductions across three consecutive memory-write sessions confirms the Layer-1 (Mechanical) gap is reliably reproducible + that director's memory is unsafe across any future Codespaces rebuild until P-42 ships. **The case is getting stronger with every reproduction.** Estimated ~1 session; LOW LOC; HIGH operational importance. Recommended fix shape: (1) Add debug-log line to `backup-memory-dir.sh` to make hook fire/no-fire observable; (2) Trigger controlled test memory write + diagnose root cause (matcher mis-config / env-var missing / tool wiring); (3) Fix the root cause; (4) AND/OR add defense-in-depth mirror-staleness canary as a SessionStart hook that detects + auto-syncs minor drift + logs major drift to CORRECTIONS_LOG.
- **P-43 `.claude/commands/scoreboard.md` template polish — convert relative `cd` to absolute paths (LOW-MEDIUM elevated toward MEDIUM after reproduction #2 this session; ROADMAP P-43).** Sub-1-hour polish; removes the relative-cd footgun from the canonical /scoreboard skill template + ideally extends to ALL parallel-Bash patterns in any skill or session. Captured 2026-05-20-c + reproduced 2026-05-21 (this session); two reproductions in two consecutive sessions strengthens the case.
- **P-44 `wxt build` parent-process hang investigation (LOW severity but operationally annoying; ROADMAP P-44).** Multi-session-recurring. Tactical workaround documented in `.claude/commands/scoreboard.md` KNOWN ISSUE section. Worth a dedicated investigation session — estimated ~1 session for diagnosis; ship time TBD based on root cause. Cross-references P-43 (the scoreboard.md template polish may surface the wxt hang more cleanly once relative-cd is removed).
- **Raise Supabase Global File Size Limit (DEFERRED Task #9 from Build #1, captured in ROADMAP as P-27 sub-item).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time.
- **P-26 below-fold full-page-scroll capture** (LOW-severity deferred large lift — currently the only remaining non-P-27 pre-graduation polish item; current workaround works; ~600-1000 LOC code-only session, no design needed). Recommended *only* if director wants to wrap the smaller-scope polish item BEFORE the rest of P-27's Build arc. Estimated 1-2 sessions.
- **Manual-add modal originalSrcUrl tack-on** (DEFERRED from 2026-05-19-e — trivial 1-line; could fold into any P-NN session or be its own sub-1-hour session). **Per `feedback_handoff_carryovers_to_roadmap.md` (2026-05-20-c standing rule):** this DEFERRED carry-over should also land in ROADMAP at next opportunity (currently surfaces only in this NEXT_SESSION.md alternates list + the prior 2026-05-19-e CORRECTIONS_LOG entry).

Check `ROADMAP.md` for the canonical state.
