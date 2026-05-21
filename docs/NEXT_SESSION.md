# Next session

**Written:** 2026-05-22 (`session_2026-05-22_p27-build-6-playwright-specs` — end-of-session handoff after P-27 Captured-videos feature BUILD SESSION #6 SHIPPED at code level on `workflow-2-competition-scraping`. Commit `af0ed00` landed 4 NEW test files: `tests/playwright/extension/amazon-video-product-page.html` (~40 LOC fixture) + `tests/playwright/extension/video-capture.spec.ts` (~370 LOC DIRECT_BYTES happy path) + `tests/playwright/extension/video-capture-embed.spec.ts` (~280 LOC EMBED path) + `tests/playwright/extension/video-paste-popup.spec.ts` (~310 LOC popup paste path). Total +1297 LOC; ZERO modifications. Closes (a.59) RECOMMENDED-NEXT (partial — Build #6 lands the Playwright extension-context specs + fixture per design doc §A.2 row #7; deploy + director real-Chrome verification remain for Builds #7-#8). Opens **(a.60) RECOMMENDED-NEXT = P-27 implementation #7 (Deploy session — `/deploy` orchestration per `.claude/commands/deploy.md`: pre-deploy `/scoreboard` GREEN → Rule 9 director-Yes gate → ff-merge `workflow-2-competition-scraping` → `main` → push origin/main → Vercel auto-redeploy → ping-pong sync → fresh extension zip `plos-extension-2026-05-22-w2-deploy-N.zip`) on `workflow-2-competition-scraping`** as the natural-continuation next session per design doc §A.2 implementation arc table row #8 (sequential-build pattern per Rule 18; no §4 Step 1c forced-picker needed).

---

## What we did this session (in plain terms)

We wrote automated browser tests that prove the captured-videos feature actually works end-to-end. Three new test files run inside Playwright (an automated Chrome controller) against a fake Amazon-style product page (not the real Amazon site — a tiny HTML fixture we built specifically for this test).

- **Test #1** simulates a director right-clicking a video element on the page, filling out the capture form, hitting Save, and verifies the upload pipeline (request a signed URL, upload the bytes, upload the thumbnail, finalize the database row) all fires in the correct order.
- **Test #2** simulates right-clicking a YouTube embed iframe, fills the form, hits Save, and verifies that only the "finalize" step fires (embeds don't upload any bytes — they store just the URL).
- **Test #3** simulates opening the extension popup, pasting a YouTube URL into the popup paste form, filling category + composition, hitting Save, and verifies only the finalize step fires.

The Playwright test count grew from 91 to 94 (3 new cases, all GREEN at first run, in 2.0 min total runtime).

**Nothing visible on vklf.com changed this session.** No deploy. The new tests + fixture stay on the feature branch — they're a safety net for the next session's deploy.

## What we'll do next session (in plain terms)

Next session is **Build #7 — deploy to vklf.com.** This is the moment the captured-videos feature goes LIVE for the director to use on the real site.

The deploy session is mechanical (no design decisions needed — every prior Build's mid-build judgment calls are already locked in):

1. Run the full pre-deploy scoreboard (TypeScript clean + 57 routes + 589 src/lib tests + 482 extension tests + 94 Playwright tests) — all must be GREEN.
2. Director approves the deploy at the Rule 9 gate (one Yes/No question).
3. Merge `workflow-2-competition-scraping` → `main` (fast-forward, no merge commit).
4. Push to origin/main → Vercel auto-redeploys vklf.com.
5. Build a fresh extension zip `plos-extension-2026-05-22-w2-deploy-N.zip` for sideload.
6. Director sideloads the new zip + opens vklf.com → SEES a new "Captured Videos" section on each competitor URL detail page (alongside the existing "Captured Text" + "Captured Images" sections).

**After deploy, Build #8 is the director's hands-on real-Chrome verification walkthrough** — right-click a real video on a real competitor page (Amazon product video / YouTube product demo / etc.) + try the popup paste flow + revisit a competitor page to see the saved-video green ✓ badges + open a URL detail page to see the inline video player and embed.

## What's still left on the total roadmap (in plain terms)

- **P-27 captured videos (current focus):** Builds #1–#6 done. **Build #7 (deploy to vklf.com) next session.** Then Build #8 (director hands-on real-Chrome verification walkthrough on the live site).
- **P-26 below-fold scroll capture** — lower-priority W#2 polish; current workaround works (two captures + two metadata-tagged rows); ~1-2 sessions when we get to it.
- **P-42 backup-memory-dir hook fix** — strongly recommended before any future big session; HIGH operational severity; ~1 session.
- **P-43 scoreboard absolute-paths polish** — reinforced AGAIN this session (CWD-drift reproduction #4 — `npm test` ran from root because the prior call's `cd` didn't carry over; caught + corrected). **Four reproductions in ~2 weeks across the P-27 Build arc.** Sub-1-hour polish; should ship as the very next non-P-27 session.
- **P-44 wxt zip parent-process hang** — annoying but not blocking; ~1 session of diagnosis.
- After all of those, W#2 graduates. Then W#3–W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Not blocking the Build #7 deploy.

---

**For:** the next Claude Code session — seventh P-27 Build session (Session #7 of estimated ~8 build sessions per the design doc §A.2 implementation arc table). **Deploy session** per `/deploy` orchestration in `.claude/commands/deploy.md`. Pre-deploy `/scoreboard` GREEN → Rule 9 director-Yes gate → ff-merge `workflow-2-competition-scraping` → `main` → push origin/main → Vercel auto-redeploy → ping-pong sync → fresh extension zip `plos-extension-2026-05-22-w2-deploy-N.zip`. Per Rule 23 Change Impact Audit: **DEPLOY (Rule 9 triggers fire — director-Yes gate non-negotiable).** Affirms 12 commits ahead of main (10 prior + Build #6 + Build #6 doc-batch) all land in a single ff-merge → `main` → push origin/main → Vercel auto-redeploy. **Schema-change-in-flight flag stays "No"** — Build #6 was pure test code; the live Supabase production schema is unchanged since Build #1's 2026-05-20-c `npx prisma db push` (additive — new `CapturedVideo` table + `VideoSourceType` enum + `video-category` String comment-allowlist value; all already applied + verified-live since 2026-05-20-c).

---

## Status of today's session

**P-27 Captured-videos feature BUILD SESSION #6 SHIPPED at code level on `workflow-2-competition-scraping`.** One-hundred-and-twenty-sixth Claude Code session — FIFTH substantive session of the current P-27 Build arc (Builds #2 + #3 + #4 + #5 + #6 all chained sequentially since 2026-05-21). Build commit `af0ed00` landed locally + will push via end-of-session bundle to `origin/workflow-2-competition-scraping`. The shared production Supabase DB schema is unchanged from Build #1 (Build #6 is pure test code).

**4 NEW files in this Build (no modifications to existing files):**

- NEW `tests/playwright/extension/amazon-video-product-page.html` (~40 LOC) — Amazon-style product page fixture with inline `<video src="https://m.media-amazon.com/videos/fake-product-demo.mp4">` + `<iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ">` for the right-click capture specs to target.
- NEW `tests/playwright/extension/video-capture.spec.ts` (~370 LOC) — DIRECT_BYTES happy path. Right-click `<video>` → `contextmenu` dispatched via `page.dispatchEvent('#hero-video', 'contextmenu')` (populates the orchestrator's capture-phase listener snapshot) → SW→tab `open-video-capture-form` message via retry loop → form renders → fill fields → Save → Phase-1 `requestVideoUpload` mock fires → Phase-2 PUT to mocked Supabase Storage fires with video bytes → Phase-2b PUT thumbnail JPEG fires (informational-only per §A.12 NULL-thumbnail fallback; conditional assertion via `phase2ThumbnailFired` boolean) → Phase-3 `finalizeVideoUpload` fires with sourceType='DIRECT_BYTES'.
- NEW `tests/playwright/extension/video-capture-embed.spec.ts` (~280 LOC) — EMBED path. Right-click YouTube `<iframe>` → contextmenu dispatched → orchestrator's `findUnderlyingVideoEmbed` returns `kind='embed' platform='youtube'` → form opens with "Recognized as Youtube" source banner (single-capital, per `video-capture-form.ts:182-184` `capitalize` helper) → Save → ONLY Phase-3 finalize fires with sourceType='EMBED' + originalSrcUrl=iframe.src. Phase-1/Phase-2 routes are mocked to fail-if-hit and the spec asserts they did NOT fire.
- NEW `tests/playwright/extension/video-paste-popup.spec.ts` (~310 LOC) — popup paste path. Open `chrome-extension://<extensionId>/popup.html` → mock `/api/extension-state` to pre-pick project + amazon → CapturedVideoPasteForm renders → fill paste URL (YouTube watch URL) + saved-URL picker + category + composition → Save → ONLY Phase-3 finalize fires with sourceType='EMBED' + originalSrcUrl=pasted YouTube watch URL.

Total +1297 / -0 LOC.

**3 mid-build judgment calls captured in `docs/CAPTURED_VIDEOS_DESIGN.md` §B 2026-05-22 (per Rule 18 append-only):**

1. **DIRECT_BYTES thumbnail assertion strictness.** Picked "tolerate both paths" per §A.12 NULL-thumbnail fallback. The spec tracks a `phase2ThumbnailFired` boolean; conditional Phase-2b method + Content-Type assertion only when fired; conditional `thumbnailStoragePath` assertion on finalize (present iff Phase 2b fired). Empirically Phase-2b DID fire in headless mode on this run, but the spec stays correct if a future Chromium upgrade flips that behavior.
2. **Embed-platform name capitalization assertion.** Picked code-truth over branding aesthetics per Rule 3. The form's source-kind banner reads `"Recognized as ${capitalize(embedPlatform)}"` per `video-capture-form.ts:182-184` — first-letter-upper from helper's lowercase 'youtube' → 'Youtube' (single-capital, NOT 'YouTube' camel-case). Spec uses `toContainText('Recognized as Youtube')` matching the form's exact rendering. If form later changes to 'YouTube' for branding correctness, spec + form code update in lockstep at that future polish.
3. **Right-click capture-phase listener dispatch via Playwright `page.dispatchEvent`.** Distinct from the image spec's approach. Image orchestrator at `orchestrator.ts:896` reads `msg.srcUrl || lastRightClickImageSrc || ''` (SW→tab message can carry srcUrl directly); video orchestrator at line 927 reads ONLY `lastRightClickVideoResult` (no msg.srcUrl fallback). So the video spec MUST dispatch a real `contextmenu` event on the target FIRST so the orchestrator's capture-phase listener populates the snapshot; THEN the SW→tab open message reads it. Implementation: `await page.dispatchEvent('#hero-video', 'contextmenu')` BEFORE the `serviceWorker.evaluate` chrome.tabs.sendMessage retry loop. Documented in the spec file header comment for future maintainers.

**ZERO DEFERRED items open at end-of-session.**

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry** captured:

- **P-43 CWD-drift reproduction #4 — `npm test` ran from root instead of extension dir at mid-scoreboard Check 5; caught from "Missing script: test" error; re-ran with absolute-path cd; baseline confirmed 482/482 on re-run.** The invocation was `npm test 2>&1 | tail -15` WITHOUT a leading `cd /workspaces/brand-operations-hub/extensions/competition-scraping &&`; each Bash invocation gets a fresh shell so the prior parallel call's cd didn't carry over; npm reported "Missing script: test" from root (root has no `test` script). **Reproduction #4 in ~2 weeks across the P-27 Build arc.** At this reproduction rate, P-43 should ship as the very next non-P-27 session.

**Pre-end-of-session scoreboard (all GREEN — only Playwright delta):** root tsc clean (unchanged) / extension tsc clean (unchanged) / `npm run build` **57 routes** (unchanged) / src/lib node:test **589/589** (unchanged) / extension `npm test` **482/482** (unchanged) / **Playwright 91 → 94 (+3 NEW cases — all GREEN at first run)** in 2.0 min total runtime.

**Schema-change-in-flight flag stayed "No"** the entire session. **Per Rule 23 Change Impact Audit:** Additive (safe) — new test files + new fixture only; ZERO existing files modified.

**FOURTH end-of-session run under the Rule 30 + §4 Step 4b template** (first was 2026-05-21-b Build #3; second was 2026-05-21-c Build #4; third was 2026-05-21-d Build #5). The plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; the `/deploy` orchestration will ff-merge to `main` at the Rule 9 gate. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at the end-of-session doc-batch commit + Build #6 commit `af0ed00` + the 2026-05-21-d Build #5 doc-batch `032b484` + Build #5 commit `467af4c` + 2026-05-21-c Build #4 doc-batch + Build #4 commit + Build #3 doc-batch + Build #3 + Build #2 doc-batch + Build #2 lineage; `main` at SHA `a754aee` (unchanged since 2026-05-20 deploy + doc-batch). **Workflow-2 is TWELVE COMMITS AHEAD of main** (Build #1 + Build #1 doc-batch + Build #1 addendum + Build #2 + Build #2 doc-batch + Build #3 + Build #3 doc-batch + Build #4 + Build #4 doc-batch + Build #5 + Build #5 doc-batch + Build #6 + this session's doc-batch — note: the actual ff-merge at deploy will land however many commits separate the branches at that moment). No ping-pong sync was needed at end of this session because main didn't move.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-27 implementation #7 — Deploy session per `.claude/commands/deploy.md` orchestration on `workflow-2-competition-scraping` → `main`.** Closes **(a.60) RECOMMENDED-NEXT** (partial close — Build #7 ships Builds #1-#6 to vklf.com via ff-merge to main; Build #8 director real-Chrome verification walkthrough is the final stage per `docs/CAPTURED_VIDEOS_DESIGN.md` §A.2 row #9).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list (verify each file path via `ls` / `find` BEFORE reading; the 2026-05-21-c session caught two mis-paraphrased sibling-reference-shape paths in the launch prompt, so this list explicitly notes canonical paths):**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or coding).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-27 polish-backlog entry (annotated 2026-05-22 with "✅ Build #6 complete 2026-05-22").
- `docs/CAPTURED_VIDEOS_DESIGN.md` §A.2 row #8 (deploy session task shape) + §A.13 (test-coverage approach now ✅ COMPLETE on the Playwright side for single-platform amazon per Build #6) + the entire §B history (2026-05-20-c + 2026-05-21 + 2026-05-21-b + 2026-05-21-c + 2026-05-21-d + **2026-05-22** — these capture EVERY mid-build judgment call from Builds #1-#6; do NOT re-litigate any of them at deploy time).
- `docs/HANDOFF_PROTOCOL.md` Rule 8 (Pre-flight audit for destructive operations — Build #7 has Rule 9 triggers; the director-Yes gate is the canonical pre-flight) + Rule 9 (main deploy gate — director-Yes via AskUserQuestion picker is non-negotiable) + Rule 23 (Change Impact Audit — classify Build #7 as ADDITIVE deploy of Builds #1-#6's already-classified-additive changes) + Rule 30 (Session bookends; plain-language summaries at start + end) + §4 Step 4b extended template (3 mandatory plain-terms sections at the TOP of the handoff).
- `.claude/commands/deploy.md` — the canonical deploy orchestration (this is the slash-command Claude invokes via `/deploy` per the established pattern). Verify the orchestration covers: pre-deploy `/scoreboard` GREEN → Rule 9 picker → ff-merge → push origin/main → Vercel auto-redeploy → ping-pong sync → fresh extension zip → end-of-session doc-batch (separate end-of-session sweep at session close — NOT inside the /deploy orchestration itself).
- `.claude/commands/scoreboard.md` — the canonical /scoreboard slash-command. Build #7 is pre-deploy gated on /scoreboard GREEN per Rule 9; verify the 6-check sequence still uses absolute paths (P-43 polish is still OPEN; sub-1-hour polish; should ship before this session OR be paid as discipline overhead during this session).

**Task shape (Build session #7 = Deploy session):**

1. **Pre-flight audit per Rule 8 + Rule 9 + Rule 23.** Build #7 has Rule 9 triggers (ff-merge to main + push origin/main + Vercel auto-redeploy). **The director-Yes gate is non-negotiable.** Classify per Rule 23: ADDITIVE deploy of Builds #1-#6's already-classified-additive changes (new `CapturedVideo` table since Build #1 + new API routes since Build #2 + new extension code since Builds #3-#4 + new renderer + signed-URL list endpoint since Build #5 + new Playwright specs since Build #6). The cumulative deploy lands all of these together. No existing data risk; the schema additions are additive + already verified live in Supabase since Build #1's 2026-05-20-c `prisma db push`. Surface the Rule 23 audit to director via the Rule 9 deploy-gate AskUserQuestion picker.

2. **Per Rule 30 — plain-terms session-start summary.** Before any heavy reads or coding, produce the "What this session will do (in plain terms)" summary so director can confirm the session shape. Cover: what we'll deploy (Builds #1-#6 of the captured-videos feature — the schema + bucket + helpers + API routes + extension UI + URL detail page renderer + signed-URL list endpoint + Playwright specs), what's user-visible after deploy (the "Captured Videos" section on each competitor URL detail page on vklf.com; the right-click "Add to PLOS — Captured Video" context-menu entry on competitor pages once the new extension zip is sideloaded; the popup paste form for video URLs), what's NOT user-visible (the new tests don't change runtime behavior; they just back the existing code with automated coverage), what the next session will pick up (Build #8 = director's hands-on real-Chrome verification walkthrough).

3. **Pre-deploy /scoreboard GREEN at exact baselines.** Run `/scoreboard` (use absolute paths per all recent CORRECTIONS_LOG entries — P-43's CWD-drift class has bitten 4 times in 2 weeks):
   - Root tsc clean: `cd /workspaces/brand-operations-hub && npx tsc --noEmit` → CLEAN.
   - Extension tsc clean: `cd /workspaces/brand-operations-hub/extensions/competition-scraping && npx tsc --noEmit` → CLEAN.
   - `npm run build`: `cd /workspaces/brand-operations-hub && npm run build` → **57 routes** GREEN.
   - src/lib node:test: `cd /workspaces/brand-operations-hub && node --test --experimental-strip-types $(find /workspaces/brand-operations-hub/src/lib -name '*.test.ts')` → **589/589** PASS.
   - Extension `npm test`: `cd /workspaces/brand-operations-hub/extensions/competition-scraping && npm test` → **482/482** PASS.
   - Playwright: `cd /workspaces/brand-operations-hub && npm run test:e2e:all` (or whatever the canonical full-suite script is per `package.json`'s `test:e2e:*` scripts; verify before running) → **94/94** GREEN (NEW baseline — replaces the prior 91; Build #6 added the +3 video specs).

4. **Rule 9 director-Yes gate via AskUserQuestion picker.** Surface the deploy summary + the Rule 23 audit + the scoreboard counts to director. Wait for explicit Yes before any main push. NEVER skip the gate; NEVER push to main without it.

5. **Ff-merge `workflow-2-competition-scraping` → `main`.** `cd /workspaces/brand-operations-hub && git checkout main && git pull origin main && git merge --ff-only workflow-2-competition-scraping`. Expect 12 commits to land (or however many separate the branches at deploy time). NO merge commit; NO --no-ff; NO rebase. If ff-merge fails (main has moved since branch's last sync), STOP and surface to director — the ff-merge precondition was violated.

6. **Push origin/main.** `git push origin main`. Vercel watches main + auto-redeploys vklf.com on every push. Wait ~2-3 min for the Vercel build to complete (verifiable via Vercel dashboard or by curling vklf.com to see the new deploy SHA — but the SHA verification is informational; don't block on it).

7. **Ping-pong sync.** `git checkout workflow-2-competition-scraping && git merge --ff-only main && git push origin workflow-2-competition-scraping`. This keeps the feature branch even with main after the deploy.

8. **Fresh extension zip.** `cd /workspaces/brand-operations-hub/extensions/competition-scraping && npm run zip` (expect the P-44 parent-process hang — workaround: the `.output/competition-scraping-extension-0.1.0-chrome.zip` will be written; kill the hung background task; `cp` the zip to repo root with canonical filename `plos-extension-2026-05-22-w2-deploy-N.zip` where N is the next deploy number — check repo root for the highest existing `plos-extension-*-deploy-NN.zip` and increment by 1; the most recent at end-of-session 2026-05-21-d was `plos-extension-2026-05-21-w2-deploy-30.zip` so this should be `deploy-31`).

9. **Post-merge /scoreboard re-run.** After the ff-merge + push + ping-pong + zip, re-run /scoreboard to verify post-merge baselines hold (expect same counts as pre-deploy: 57 routes / 589 src/lib / 482 ext / 94 Playwright). This is the Rule 27 post-deploy verification step.

10. **End-of-session doc-batch.** Covers ROADMAP (P-27 polish-backlog annotated with "✅ Build #7 deploy complete 2026-05-22" + (a.60) flipped closed + new (a.61) RECOMMENDED-NEXT = Build #8 director real-Chrome verification opened) + CHAT_REGISTRY (header bump — 127th Claude Code session; new registry-table row for deploy session #N) + DOCUMENT_MANIFEST + CORRECTIONS_LOG (likely zero new entries unless a slip occurs — if P-44 zip hang reproduces, that's another reproduction §Entry but no new lesson) + NEXT_SESSION (rewritten for Build #8) + CAPTURED_VIDEOS_DESIGN §B 2026-05-22-b entry IF mid-deploy judgment calls fire (the deploy is mechanical so unlikely; only fire a §B append if a real decision happens).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for any mid-deploy forced-pickers (e.g., the Rule 9 deploy-gate question — present the Yes/No picker with deploy summary attached; if scoreboard surfaces any unexpected delta, STOP and surface to director), surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers.

**Schema-change-in-flight flag:** stays "No" the entire session (Build #6 was pure test code; no schema delta to ship at deploy time — the schema additions from Build #1's 2026-05-20-c `prisma db push` are already live in Supabase since that day and unchanged through Builds #2-#6).

---

## Pre-session notes (offline steps for director between sessions)

**NO required offline steps for Build #7** — the deploy session is mechanical and runs entirely from Claude + the existing tooling.

**STILL-OPEN optional offline step (NOT blocking Build #7 — carry-over from Build #1):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

This adds the defense-in-depth bucket-level cap on top of the app-layer two-layer enforcement that's already shipped. Not blocking Build #7 — can happen any time before or after the deploy.

**Optional offline reading for director:** `docs/CAPTURED_VIDEOS_DESIGN.md` §A.2 row #8 (deploy session task shape) + §B 2026-05-22 entry (the 3 mid-build judgment calls Build #6 made on the Playwright specs — informational for understanding what the new test suite asserts). ~3-minute skim before the next session if director wants the full context.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session:** `git push origin main` (the deploy push — Rule 8/9 explicitly authorize this as the canonical deploy mechanic; the Rule 9 director-Yes gate is the procedural safety). NO `prisma db push` planned (no schema delta to ship). NO `git reset --hard` / `git push --force` / `git branch -D` planned. The ff-merge precondition is verified before any main push.

**Rule 9 triggers planned this session:** YES — ff-merge `workflow-2-competition-scraping` → `main` + push origin/main + Vercel auto-redeploy. The director-Yes gate is non-negotiable. Surface the deploy summary + Rule 23 audit + scoreboard counts via AskUserQuestion picker BEFORE any main push.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact (the P-42 backup hook is still gappy but no new memory writes this session so the mirror state is unchanged). Critical files safe.

---

## Why this pointer was written this way (debug aid)

Today's session ran P-27 Build #6 (single-platform amazon Playwright extension-context specs covering all 3 capture gestures + new Amazon-style fixture page) per the design doc §A.2 implementation arc table row #7. The §4 Step 1c forced-picker was NOT fired as a separate decision because the design doc §A.2 implementation arc table itself encodes the next-session pick: Build #7 (deploy session) follows Build #6 directly per row #8. This is the canonical pattern for sequential Build sessions in a multi-session implementation arc per Rule 18.

Build #7's launch prompt is shaped around (a) running the canonical `/deploy` orchestration in `.claude/commands/deploy.md` end-to-end with the Rule 9 director-Yes gate firing as the deploy-blocking step, (b) verifying the new Playwright baseline of 94 holds pre-deploy AND post-merge, (c) building a fresh extension zip because Build #5's type-tightening edits + Build #4's content-script + popup changes exist in the extension source even if Build #5's edits are return-type-only — the deploy moment is when the cumulative extension surface becomes user-installable, and (d) standing optional offline step (Supabase Global File Size Limit raise) is carried over but NOT blocking.

The Builds #1-#6 mid-build judgment calls (in design doc §B 2026-05-20-c + §B 2026-05-21 + §B 2026-05-21-b + §B 2026-05-21-c + §B 2026-05-21-d + §B 2026-05-22) are all binding inputs to Build #7; do NOT re-litigate at deploy time. The Build #6 shipped surface (3 new Playwright specs + 1 new fixture) is automated test coverage that backs the Build #1-#5 shipped surface; Build #7 deploys the latter and verifies the former stays GREEN post-merge.

**Reinforcement from this session's CWD-drift slip (CORRECTIONS_LOG §Entry):** the recurring CWD-leak class has bitten 4 times in ~2 weeks across the P-27 Build arc. Future sessions should use absolute paths for ALL Bash patterns that depend on a specific CWD — not just `cd` commands but also `npm test`, `npm run build`, `find` paths, `node --test ...` argument paths. P-43 polish should ship as the very next non-P-27 session; absent that, every session manually maintains discipline. Build #7's /scoreboard run is the canonical scoreboard command pattern and Rule 9 deploy gate; verify cwd via `pwd` BEFORE every Bash invocation that depends on CWD.

**Alternate next-session candidates if director shifts priorities at session start (after Build #6 lands + before Build #7):**

- **P-42 backup-memory-dir.sh hook investigation + fix (HIGH severity — STRONGLY RECOMMENDED before any future big session if not already shipped; ROADMAP P-42).** Multi-reproduction history confirms the Layer-1 (Mechanical) gap is reliably reproducible + that director's memory is unsafe across any future Codespaces rebuild until P-42 ships. Estimated ~1 session; LOW LOC; HIGH operational importance.
- **P-43 `.claude/commands/scoreboard.md` template polish — convert relative `cd` to absolute paths + extend the polish to ALL Bash patterns in any skill or session that depend on a specific CWD (LOW-MEDIUM elevated by reproduction #4 captured this session; ROADMAP P-43).** Sub-1-hour polish; the reproduction count keeps climbing (#4 today). The fix is so cheap and the recurrence so frequent that shipping P-43 before Build #7 might save discipline overhead during Build #7's pre-deploy /scoreboard run.
- **P-44 `wxt build`/`wxt zip` parent-process hang investigation (LOW severity but operationally annoying; ROADMAP P-44).** Multi-session-recurring; will reproduce during Build #7's fresh-zip step. Worth a dedicated investigation session — estimated ~1 session for diagnosis; ship time TBD based on root cause.
- **Raise Supabase Global File Size Limit (DEFERRED Task #9 from Build #1, captured in ROADMAP as P-27 sub-item).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time.
- **P-26 below-fold full-page-scroll capture** (LOW-severity deferred large lift — currently the only remaining non-P-27 pre-graduation polish item; current workaround works; ~600-1000 LOC code-only session, no design needed). Recommended *only* if director wants to wrap the smaller-scope polish item BEFORE the rest of P-27's Build arc deploys. Estimated 1-2 sessions.

Check `ROADMAP.md` for the canonical state.
