# Next session

**Written:** 2026-05-21-b (`session_2026-05-21-b_p27-build-3-extension-content-script-form` — end-of-session handoff after P-27 Captured-videos feature BUILD SESSION #3 SHIPPED at code level on `workflow-2-competition-scraping`. Commit `02709c4` landed 5 NEW extension files (`find-underlying-video-embed.ts` ~140 LOC pure DOM-walker helper + `find-underlying-video-embed.test.ts` 20 node:test cases + `captured-video-validation.ts` ~180 LOC form-level validator with DIRECT_BYTES vs. EMBED branching + `captured-video-validation.test.ts` 21 node:test cases + `video-capture-form.ts` ~580 LOC inline overlay form mirroring `image-capture-form.ts`) + 5 MODIFIED extension files (`messaging.ts` + `api-bridge.ts` + `api-client.ts` + `background.ts` + `orchestrator.ts`). Closes (a.56) RECOMMENDED-NEXT (partial — Build #3 lands the extension content-script form + helper + validator + tests only; subsequent Build sessions add popup paste form + saved-video indicator overlay + URL detail renderer + Playwright spec + deploy + verify per design doc §A.2 implementation arc table). Opens **(a.57) RECOMMENDED-NEXT = P-27 implementation #4 (Build session — popup paste form `CapturedVideoPasteForm.tsx` + inline "+ Add new category" for popup + saved-video indicator overlay per design doc §A.2 rows #5+#6) on `workflow-2-competition-scraping`** as the natural-continuation next session per design doc §A.2 implementation arc table rows #5+#6 (decision on whether to bundle rows #5 and #6 into a single Build #4 vs. split arrives at next session start via a Rule 14f forced-picker).

---

## What we did this session (in plain terms)

In plain terms: we built the **first piece you can actually see + click** for the captured-videos feature. The browser extension now has a new right-click menu entry — "Add to PLOS — Captured Video" — that appears when you right-click anywhere on a competitor's product page. When you click it, a little inline form pops up on the page (looks just like the existing one for captured images): pick which competitor URL it belongs to, pick a video category, optionally add a composition note + on-screen text + tags, then hit Save.

Behind the scenes the form is smart about what you right-clicked:

- If you right-clicked directly on a `<video>` element (Amazon's product video player, for example), the extension grabs the video file itself, captures a thumbnail by drawing one frame onto a canvas, and uploads both pieces to Supabase via the API routes we built last session.
- If you right-clicked on a YouTube or Vimeo embed (an `<iframe>`), the extension walks the page's DOM to find the underlying iframe + recognizes the embed platform via the 6-host allowlist we shipped in Build #1, and stores just the URL (no file upload — YouTube terms of service + technical constraints argue against downloading bytes from YouTube).

We also wrote 41 tiny tests — 20 for the DOM-walker helper that finds the underlying video URL + 21 for the form validator that branches between the two paths above. The tests run in seconds + prove the helpers reject bad data + accept good data + don't crash on weird edge cases (no video on the page; nested iframes; canvas-tainted thumbnails).

No deploy. Nothing on vklf.com changed. But you can now sideload the fresh extension zip + try the right-click flow on a real competitor page — `plos-extension-2026-05-21-w2-p27-build-3.zip` is sitting at the repo root waiting for you.

## What we'll do next session (in plain terms)

Next session is **Build #4** — popup paste form + saved-video indicator overlay. Two pieces:

1. **Popup paste form** (`CapturedVideoPasteForm.tsx`) — for the case where you've copied a video URL from somewhere else and want to paste it into PLOS without right-clicking. The popup already has paste forms for captured text + captured URLs; we add a fourth one for captured video, mirroring the same shape exactly. This also includes the **inline "+ Add new category"** affordance for the popup — same UX as text + image already have.
2. **Saved-video indicator overlay** — the green checkmark badge that appears on a video element when you revisit a competitor page where you've already saved that video. Mirrors P-24's saved-image-indicator overlay. Tells you at a glance "yes, I already grabbed this one."

We may end up splitting Build #4 into Build #4 + Build #5 depending on scope (the saved-video indicator has its own scanning loop + overlay rendering + multi-URL bookkeeping; that may deserve its own session). The next session will fire a forced-picker at session start to make the call.

At the end you'll have a fully-functional capture flow (right-click + popup paste + visual confirmation on revisit) for both direct-bytes + embed paths. Two more Build sessions after that for URL detail page renderer (Build #6) + single-platform Playwright spec (Build #7) + then deploy (Build #8) + director real-Chrome verification (Build #9).

## What's still left on the total roadmap (in plain terms)

**W#2 Competition Scraping** still has 4 polish items gating graduation:

- **P-27 Captured videos** (the one we're inside right now) — Builds #1 + #2 + #3 done; Builds #4 through ~#9 still to go (popup paste form + saved-video indicator + URL detail renderer + Playwright spec + deploy + director real-Chrome verification). The fresh extension zip from this session can be sideloaded to test Build #3's right-click flow end-to-end.
- **P-26** below-fold full-page-scroll capture (lower priority; current workaround works; estimated 1-2 sessions when we get to it).
- **P-42** `backup-memory-dir.sh` hook fix — **strongly recommended to ship before any future big session** (three reproductions now confirm Claude's memory directory is unsafe across any future Codespaces rebuild until this ships; ~1 session, low LOC, high operational importance).
- **P-43** `.claude/commands/scoreboard.md` template polish — convert relative `cd` to absolute paths (sub-1-hour polish; reinforced again this session via the `npm run zip` cwd-drift slip).
- **P-44** `wxt build` parent-process hang investigation (reinforced again this session — reproduction #N; low severity; workaround documented; ~1 session for diagnosis).

After all W#2 polish ships, W#2 graduates (frozen as a production tool — pattern matches W#1 Keyword Clustering).

**W#3-W#14** — twelve more workflows on the roadmap; none started yet. Order TBD by director when W#2 graduates.

**Infrastructure TODOs:** raise Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos` (offline dashboard step; director can do anytime; not blocking any session).

---

**For:** the next Claude Code session — fourth P-27 Build session (Session #4 of estimated ~6-9 build sessions per the design doc §A.2 implementation arc table). Popup paste form `CapturedVideoPasteForm.tsx` (parallels existing `CapturedTextPasteForm.tsx` + `CapturedUrlPasteForm.tsx` shapes) + inline "+ Add new category" for popup + saved-video indicator overlay scanning loop + overlay rendering (parallels existing P-24 saved-image indicator). Per Rule 23 Change Impact Audit: Additive (safe) — new optional popup form + new optional saved-video indicator scanning loop + overlay rendering; no existing data affected; no downstream-consumer breakage risk (the API routes shipped in Build #2 + the form validator shipped in Build #3 are the consumers, and they accept the new requests cleanly per the shared-type contracts). **Schema-change-in-flight flag stays "No"** — Build #4 is pure code; no new tables / enums / columns / API routes.

---

## Status of today's session

**P-27 Captured-videos feature BUILD SESSION #3 SHIPPED at code level on `workflow-2-competition-scraping`.** One-hundred-and-twenty-third Claude Code session — SECOND session of 2026-05-21 (first was Build #2 earlier today). Build commit `02709c4` landed locally + will push via end-of-session bundle to `origin/workflow-2-competition-scraping`. The shared production Supabase DB schema is unchanged from Build #1 (Build #3 is pure code). The user-visible right-click context-menu entry "Add to PLOS — Captured Video" now exists in the extension; the inline overlay form opens; the helpers route capture through the API routes shipped in Build #2.

**5 NEW extension files shipped + 5 MODIFIED extension files:**

- NEW `extensions/competition-scraping/src/lib/content-script/find-underlying-video-embed.ts` (~140 LOC) — pure DOM-walker helper; mirrors `find-underlying-image.ts` shape; returns tagged-union `{kind:'direct',src,mimeType,element} | {kind:'embed',platform,src} | {kind:'none'}`; depth ≤ 10; direct wins over embed at same level; composes with Build #1's `src/lib/competition-video-storage-helpers.ts` `detectEmbedPlatform` for hostname pattern matching (single source of truth — does NOT re-encode the allowlist).
- NEW `extensions/competition-scraping/src/lib/content-script/find-underlying-video-embed.test.ts` — 20 node:test cases (all three result kinds + depth bounds + ancestor descendant scan + currentSrc-vs-src preference + `<source type>` resolution + lowercase + trim + 6 embed-platform hostnames).
- NEW `extensions/competition-scraping/src/lib/captured-video-validation.ts` (~180 LOC) — form-level validator; branches on `sourceType` (DIRECT_BYTES enforces MIME accept-list + 100 MB cap per §A.10/§A.11; EMBED runs `detectEmbedPlatform` URL-pattern check per §A.10); mints clientId once per Save click for the server's idempotency path.
- NEW `extensions/competition-scraping/src/lib/captured-video-validation.test.ts` — 21 node:test cases (both branches + tag normalization).
- NEW `extensions/competition-scraping/src/lib/content-script/video-capture-form.ts` (~580 LOC) — inline overlay form; mirrors `image-capture-form.ts`; tagged-union props; canvas frame-grab thumbnail per §A.9; §A.12 NULL-thumbnail fallback on canvas-taint SecurityError; basic "Saved!" toast on success (polished saved-video on-page indicator overlay deferred to Build #4-#6 per §A.2 row #6).
- MODIFIED `extensions/competition-scraping/src/lib/content-script/messaging.ts` — new `OpenVideoCaptureFormMessage` + tagged-union `SubmitVideoCaptureRequestMessage` + type-guard updates + `SubmitVideoCaptureResponseEnvelope`.
- MODIFIED `extensions/competition-scraping/src/lib/content-script/api-bridge.ts` — new `submitVideoCapture` wrapper (tagged-union args mirror the wire shape).
- MODIFIED `extensions/competition-scraping/src/lib/api-client.ts` — four new server-side fetch helpers: `requestVideoUpload` (POST .../videos/requestUpload — TWO signed URLs per §A.9), `putVideoBytesToSignedUrl` + `putVideoThumbnailToSignedUrl` (Phase 2 PUTs; thumbnail locks Content-Type to image/jpeg per the canvas frame-grab format), `finalizeVideoUpload` (POST .../videos/finalize; branches server-side), `fetchVideoBytes` (extension-origin GET + Content-Type MIME resolution + 100 MB pre-flight cap defense-in-depth).
- MODIFIED `extensions/competition-scraping/src/entrypoints/background.ts` — new `CONTEXT_MENU_VIDEO_ID` entry ("Add to PLOS — Captured Video" / `contexts: ['all']` per the P-23 image lesson); new dispatch routes to `open-video-capture-form` ContentScriptMessage; new `handleSubmitVideoCapture` function — EMBED branch goes straight to Phase 3; DIRECT_BYTES branch runs the full Phase 0 fetch → Phase 0b thumbnail-data-URL decode → Phase 1 requestUpload → Phase 2 video + thumbnail PUTs in parallel (thumbnail PUT failure treated as §A.12 NULL-thumbnail fallback, never blocks save) → Phase 3 finalize.
- MODIFIED `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — new `lastRightClickVideoResult` snapshot wired into the same contextmenu capture-phase listener that already snapshots `lastRightClickImageSrc` + `lastRightClickSelectorJson`; consumed + reset on each `open-video-capture-form` message; two explicit form-open branches (direct + embed) keep TypeScript's discriminated-union narrowing happy without an `as` cast.

**3 mid-build judgment calls captured in `docs/CAPTURED_VIDEOS_DESIGN.md` §B 2026-05-21-b (per Rule 18 append-only):**

1. **Helper composition vs. self-contained re-encoding.** Build #3's `find-underlying-video-embed.ts` IMPORTS + composes with Build #1's `detectEmbedPlatform` (single source of truth for the 6-platform hostname allowlist + 13 URL-pattern regexes) rather than re-encoding the allowlist. Reversible — the import can be inlined later if cross-package coupling proves awkward.
2. **EMBED vs. DIRECT_BYTES — single form vs. two separate forms.** Picked single form with internal branching on Save. Reasoning: form UX is symmetric (same saved-URL picker + category + composition + embedded-text + tags + Save button); only the preview area + the network calls on Save differ. One entry-point for the user; the branch is invisible to them. Director's drift-check approval at session start (responded "go") confirmed this default-to-recommendation pick.
3. **Embed-platform name field collision** — initial draft had `platform: string` on the embed branch (the YouTube/Vimeo platform name) which collided with the existing `platform: Platform` (W#2 site platform name = amazon/ebay/etc.) at the top level of the form's props. Renamed the embed-branch field to `embedPlatform: string` so both branches share `platform: Platform` at the top level cleanly. Caught mid-build via TypeScript discriminated-union narrowing failure; fixed before any tests ran.

**ZERO DEFERRED items open at end-of-session.**

**TWO NEW INFORMATIONAL CORRECTIONS_LOG §Entries** captured:

- **(i) P-44 reproduction #N** — `npm run zip` (= `wxt zip`) parent-process hang surfaced once more this session. The `.output/competition-scraping-extension-0.1.0-chrome.zip` was actually produced (~195 KB, visible via `ls -la`), but the parent `npm run zip` shell process never exited. Workaround used: read the zip directly from `.output/` and `cp` to repo root with the canonical filename; kill the hung background task. Strengthens the case for P-44 — multi-session-recurring; ROADMAP item already exists.
- **(ii) First-call `npm run zip` from wrong cwd surfaced "Missing script: 'zip'"**. The shell's cwd after a prior `cd` had drifted; the script that ran wasn't in the extension directory. Workaround: explicit `cd /workspaces/brand-operations-hub/extensions/competition-scraping && npm run zip`. Adjacent to the 2026-05-20-c + 2026-05-21 parallel-Bash relative-cd entries; reinforces P-43.

**Pre-end-of-session scoreboard (all GREEN):** root tsc clean / extension tsc clean / `npm run build` **57 routes** (unchanged baseline; Build #3 is extension-only — no new API routes) / src/lib node:test **589/589** (unchanged) / extension `npm test` **469/469** (+41 over baseline 428 = 20 helper + 21 validator) / Playwright **91/91** (unchanged).

**Schema-change-in-flight flag stayed "No"** the entire session. **Per Rule 23 Change Impact Audit:** Additive (safe).

**First end-of-session run under the new Rule 30 + §4 Step 4b template** (shipped in the prior 2026-05-21 session) — the plain-terms sections above are the live test of the new template; director should give feedback for any refinements before the next big session.

---

## Branch

**`workflow-2-competition-scraping`** — Build sessions stay on the feature branch; ff-merge to main only at /deploy stages (Build #4 does NOT ship to main — only the popup paste form + saved-video indicator land on the feature branch; the full P-27 Build arc ships via a future deploy session per design doc §A.2). The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at the end-of-session doc-batch commit + Build #3 commit `02709c4` + the 2026-05-21 Build #2 doc-batch `5963a47` lineage; `main` at SHA `a754aee` (unchanged since 2026-05-20 deploy + doc-batch). Workflow-2 is SEVEN COMMITS AHEAD of main (Build #1 + Build #1 doc-batch + Build #1 addendum + Build #2 + Build #2 doc-batch + Build #3 + this session's doc-batch). No ping-pong sync was needed at end of this session because main didn't move.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-27 implementation #4 — Build session (popup paste form `CapturedVideoPasteForm.tsx` + inline "+ Add new category" for popup + saved-video indicator overlay per design doc §A.2 rows #5+#6) on `workflow-2-competition-scraping`.** Closes **(a.57) RECOMMENDED-NEXT** (partial close — Build #4 lands the popup paste form + saved-video indicator only; subsequent Build sessions add URL detail renderer + Playwright spec + deploy + verify per `docs/CAPTURED_VIDEOS_DESIGN.md` §A.2 implementation arc table).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or coding).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-27 polish-backlog entry (annotated 2026-05-21-b with "✅ Build #3 complete 2026-05-21-b").
- `docs/CAPTURED_VIDEOS_DESIGN.md` fully (§A.7 CapturedVideo schema spec; §A.9 bucket configuration; §A.11 size-cap enforcement two-layer client + server pattern; **§A.2 implementation arc table rows #5+#6 — the canonical source for Build #4's task shape**; §B 2026-05-20-c entry — the 3 mid-build refinements from Build #1; §B 2026-05-21 entry — the 3 mid-build judgment calls from Build #2; **§B 2026-05-21-b entry — the 3 mid-build judgment calls from Build #3 that constrain Build #4's form-shape + helper choices**).
- **The reference shapes Build #4 will mirror** — `extensions/competition-scraping/src/entrypoints/popup/components/CapturedTextPasteForm.tsx` (existing sibling popup paste form for captured text; Build #4's `CapturedVideoPasteForm.tsx` mirrors this shape exactly — same input fields + same Save flow + same inline "+ Add new category" affordance) + `extensions/competition-scraping/src/entrypoints/popup/components/CapturedUrlPasteForm.tsx` (sibling popup URL paste form).
- **The reference saved-indicator shape Build #4 will mirror** — `extensions/competition-scraping/src/lib/content-script/saved-image-indicator.ts` (existing sibling saved-image indicator scanning loop + overlay rendering from P-24; Build #4's saved-video indicator mirrors this shape).
- **The Build #3 form Build #4 must integrate with** — `extensions/competition-scraping/src/lib/content-script/video-capture-form.ts` (the inline overlay form shipped this session; the popup paste form opens the SAME form but pre-filled with the pasted URL).
- **The Build #3 validator Build #4 will reuse** — `extensions/competition-scraping/src/lib/captured-video-validation.ts` (the form-level validator with DIRECT_BYTES vs. EMBED branching; the popup paste form fires the EMBED branch only — pasted URL is always EMBED).
- **The API routes Build #4's popup form will call** (shipped in Build #2) — `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/finalize/route.ts` (EMBED-only call from popup paste form) + `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/route.ts` (GET list for saved-video indicator scan).
- `src/lib/shared-types/competition-scraping.ts` (the wire types — Build #4's form must match `FinalizeVideoUploadRequest` for EMBED branch).
- `docs/HANDOFF_PROTOCOL.md` Rule 8 (Pre-flight audit for destructive operations — Build #4 has NO Rule 8 triggers, but verify on each tool call) + Rule 23 (Change Impact Audit — classify Build #4 as Additive (safe) BEFORE coding) + Rule 30 (Session bookends; plain-language summaries at start + end) + §4 Step 4b extended template (3 mandatory plain-terms sections at the TOP of the handoff).

**Task shape (Build session #4):**

1. **Pre-flight audit per Rule 8 + Rule 23.** Build #4 is pure extension-side code — no `prisma db push`, no `git push origin main`, no destructive ops. Classify per Rule 23: ADDITIVE (safe) — new optional popup form + new optional saved-video indicator scanning loop + overlay rendering; no existing data affected; no downstream-consumer breakage risk. Surface the Rule 23 audit to director via AskUserQuestion only if a non-additive change is discovered mid-build; otherwise proceed.

2. **Per Rule 30 — plain-terms session-start summary.** Before any heavy reads or coding, produce the "What this session will do (in plain terms)" summary so director can confirm the session shape. Cover: what we'll build, what we won't build, what the user will see at session-end, what the next session will pick up.

3. **Rule 14f forced-picker at session start — bundle or split.** Build #4's scope per §A.2 covers BOTH popup paste form (row #5) + saved-video indicator overlay (row #6). The saved-video indicator has its own scanning loop + overlay rendering + multi-URL bookkeeping; that may deserve its own session. Fire a Rule 14f picker offering (A) bundle rows #5+#6 into a single Build #4 [recommended if scope is manageable — check the saved-image-indicator.ts LOC first] vs. (B) ship popup paste form only as Build #4 + saved-video indicator as Build #5 vs. (C) ship saved-video indicator only as Build #4 + popup paste form as Build #5 vs. (D) escape hatch. Pick recommendation default per `feedback_default_to_recommendation.md`.

4. **New popup paste form `CapturedVideoPasteForm.tsx`.** Add `extensions/competition-scraping/src/entrypoints/popup/components/CapturedVideoPasteForm.tsx` paralleling existing `CapturedTextPasteForm.tsx`. Pasted URL goes through `captured-video-validation.ts` EMBED branch (DIRECT_BYTES is not a paste-able URL — only right-click captures direct bytes). Form includes inline "+ Add new category" affordance mirroring the popup's existing inline-add UX for text + URL forms.

5. **New saved-video indicator overlay (if bundled into Build #4 per the picker).** Add saved-video indicator scanning loop in `orchestrator.ts` (mirrors `saved-image-indicator.ts` shape) + overlay rendering (green ✓ badge on `<video>` element + on recognized embed `<iframe>`). Reads the list of already-saved CapturedVideos for the current URL via the GET .../videos route shipped in Build #2.

6. **Test coverage (Rule 27 Hybrid).** Add node:test cases for any new pure-function helpers (e.g., the saved-video matching helper if extracted). The popup React form + the orchestrator overlay rendering depend on DOM + browser APIs; Playwright extension-context coverage arrives at Build #7 per design doc §A.13. **Per the 2026-05-21-b CORRECTIONS_LOG §Entry (ii):** ALWAYS use absolute paths for `cd` commands that need a specific CWD — avoid the parent-shell-cwd-drift slip.

7. **Scoreboard:** verify `npx tsc --noEmit` clean + `cd /workspaces/brand-operations-hub/extensions/competition-scraping && npx tsc --noEmit` clean (**absolute path per the 2026-05-20-c + 2026-05-21 + 2026-05-21-b CORRECTIONS_LOG §Entries — avoid parallel-Bash relative-cd footgun + parent-shell-cwd-drift footgun**) + `npm run build` clean (expect **57 routes** unchanged — no new API routes this session) + src/lib node:test passes (expect **589/589** unchanged — no new src/lib tests this session) + extension `npm test` passes with new helper tests (expect **~470-480/470-480** depending on how many helper test cases added — was 469/469) + Playwright **91/91** unchanged. **Fresh extension zip** required this session (extension source changed → zip rebuild) — name should follow the pattern `plos-extension-2026-05-22-w2-p27-build-4.zip` (substitute the actual session date).

8. **Build commit on workflow-2** (no main push this session — Build #4 stays on feature branch). End-of-session doc-batch covers ROADMAP (P-27 polish-backlog annotation extended with "Build #4 complete: popup paste form + saved-video indicator" if bundled, else partial) + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG (likely zero new entries unless a slip occurs) + NEXT_SESSION (rewritten for Build #5) + CAPTURED_VIDEOS_DESIGN §B 2026-05-22 entry (capturing any mid-build judgment calls).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for any mid-build forced-pickers (e.g., whether the saved-video indicator's overlay HTML is rendered as a sibling DIV vs. inside the `<video>` element's shadow DOM; whether to ship a basic vs. polished indicator visual at Build #4), surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers.

**Schema-change-in-flight flag:** stays "No" the entire session (Build #4 is pure code — no `prisma db push`, no schema edit; no new API routes; no shared-types schema changes).

---

## Pre-session notes (offline steps for director between sessions)

**NO required offline steps for Build #4** — Build #4 is pure extension-side code (popup paste form + saved-video indicator). No new buckets, no schema changes, no dashboard work needed before the session starts.

**Optional sideload-and-try step for director:** the fresh extension zip `plos-extension-2026-05-21-w2-p27-build-3.zip` at repo root contains the Build #3 right-click capture flow. Director can sideload + try the right-click "Add to PLOS — Captured Video" entry on a real competitor product page (Amazon's product video player is the canonical test target). Findings can shape Build #4's polish priorities. Safe to skip — Build #4 doesn't depend on the sideload.

**STILL-OPEN optional offline step (NOT blocking Build #4 — carry-over from Build #1):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from 2026-05-20-c handoff):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

This adds the defense-in-depth bucket-level cap on top of the app-layer two-layer enforcement that's already shipped. Not blocking Build #4 — can happen any time. The DEFERRED Task sub-item under ROADMAP P-27 still tracks this for future closure.

**Optional offline reading for director:** `docs/CAPTURED_VIDEOS_DESIGN.md` §A.2 (implementation arc table — Build #4 covers rows #5+#6) + §B 2026-05-21-b entry (the 3 mid-build judgment calls Build #3 made that constrain Build #4's form-shape choices). ~3-minute skim before the next session if director wants the full context on what Build #4 will land.

---

## Destructive-operation safety check for next session

**NO Rule 8 (destructive operation) triggers planned** this session — Build #4 is pure extension-side code; no `prisma db push`, no `git push origin main`, no destructive ops.

**NO Rule 9 (main deploy) triggers planned** this session — Build #4 stays on workflow-2 feature branch; no main push; no Vercel redeploy; no ping-pong sync. The Build arc's first deploy lands at a future Build session per design doc §A.2 row #8.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact (verified at end of this session). Critical files safe.

---

## Why this pointer was written this way (debug aid)

Today's session ran P-27 Build #3 (extension content-script form + helper + validator + 41 new node:test cases) per the design doc §A.2 implementation arc table row #4. The §4 Step 1c forced-picker was NOT fired as a separate decision because the design doc §A.2 implementation arc table itself encodes the next-session pick: Build #4 (popup paste form + saved-video indicator) follows Build #3 directly per rows #5+#6. This is the canonical pattern for sequential Build sessions in a multi-session implementation arc per Rule 18.

Build #4's launch prompt is shaped around (a) mirroring the existing sibling popup paste forms (`CapturedTextPasteForm.tsx` + `CapturedUrlPasteForm.tsx`) for the popup-paste video URL flow, (b) mirroring the existing saved-image indicator (`saved-image-indicator.ts` from P-24) for the saved-video indicator overlay, (c) reusing the form-level validator shipped in Build #3 (`captured-video-validation.ts`) for the EMBED branch (popup paste is always EMBED — pasted URLs are never DIRECT_BYTES), and (d) leaning on the API routes shipped in Build #2 (`finalize` for popup paste save + GET .../videos for indicator scan).

The 2026-05-20-b director-confirmed picks (11 forced-picker outcomes in design doc §A.0) + the 2026-05-20-c Build #1 mid-build refinements (in design doc §B 2026-05-20-c) + the 2026-05-21 Build #2 mid-build judgment calls (in design doc §B 2026-05-21) + the 2026-05-21-b Build #3 mid-build judgment calls (in design doc §B 2026-05-21-b) are all binding inputs to Build #4; do NOT re-litigate. The shipped extension form + helper + validator + tests are also binding inputs; Build #4's popup form should reuse `captured-video-validation.ts` (EMBED branch) + match `FinalizeVideoUploadRequest` shape exactly.

**Alternate next-session candidates if director shifts priorities at session start (after Build #3 lands + before Build #4):**

- **P-42 backup-memory-dir.sh hook investigation + fix (HIGH severity — STRONGLY RECOMMENDED before any future big session if not already shipped; ROADMAP P-42).** Three reproductions across three consecutive memory-write sessions confirms the Layer-1 (Mechanical) gap is reliably reproducible + that director's memory is unsafe across any future Codespaces rebuild until P-42 ships. Estimated ~1 session; LOW LOC; HIGH operational importance.
- **P-43 `.claude/commands/scoreboard.md` template polish — convert relative `cd` to absolute paths + extend the polish to ALL Bash patterns in any skill or session that depend on a specific CWD (LOW-MEDIUM elevated by reproductions this session; ROADMAP P-43).** Sub-1-hour polish; the 2026-05-21-b CORRECTIONS_LOG entry (ii) reinforces the case (the `npm run zip` cwd-drift slip is adjacent to but distinct from the parallel-Bash race captured earlier — both call for the same absolute-path discipline).
- **P-44 `wxt build`/`wxt zip` parent-process hang investigation (LOW severity but operationally annoying; ROADMAP P-44).** Reproduction #N captured this session. Multi-session-recurring. Worth a dedicated investigation session — estimated ~1 session for diagnosis; ship time TBD based on root cause.
- **Raise Supabase Global File Size Limit (DEFERRED Task #9 from Build #1, captured in ROADMAP as P-27 sub-item).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time.
- **P-26 below-fold full-page-scroll capture** (LOW-severity deferred large lift — currently the only remaining non-P-27 pre-graduation polish item; current workaround works; ~600-1000 LOC code-only session, no design needed). Recommended *only* if director wants to wrap the smaller-scope polish item BEFORE the rest of P-27's Build arc. Estimated 1-2 sessions.
- **Manual-add modal originalSrcUrl tack-on** (DEFERRED from 2026-05-19-e — trivial 1-line; could fold into any P-NN session or be its own sub-1-hour session). **Per `feedback_handoff_carryovers_to_roadmap.md` (2026-05-20-c standing rule):** this DEFERRED carry-over should also land in ROADMAP at next opportunity.

Check `ROADMAP.md` for the canonical state.
