# Next session

**Written:** 2026-05-22-b (`session_2026-05-22-b_p27-build-7-deploy-and-verification-with-deferred-fixes` — end-of-session handoff after P-27 Captured-videos feature **DEPLOY SESSION #7 SHIPPED + DEPLOYED on vklf.com** via ff-merge `workflow-2-competition-scraping` → `main` (13 commits `cf4e233..bd7cedd`, +7890 / -83 across 40 files); fresh extension zip `plos-extension-2026-05-22-w2-deploy-31.zip` (196,849 bytes — +5,288 over deploy-30's 191,561 bytes; first deploy zip carrying the new captured-videos surface end-to-end). Closes (a.60) RECOMMENDED-NEXT (partial close — Build #7 ships Builds #1-#6 to vklf.com via ff-merge to main; director real-Chrome verification walkthrough RAN IN-SESSION per the Rule 14f close-out picker and **surfaced 6 distinct verification failures** across Amazon + Ebay + Walmart; **Etsy passed all 4 surfaces perfectly**). Opens **(a.61) RECOMMENDED-NEXT = P-27 implementation #8 (fix-forward polish session — diagnose + fix the 6 verification failures captured this session as TaskList DEFERRED #9-#14 + redeploy + re-walk verification including Walmart) on `workflow-2-competition-scraping`** per §4 Step 1c interview outcome (sequential-build follow-up; not a new design moment — the design intent is unchanged; this is a debugging + fix-forward session).

---

## What we did this session (in plain terms)

We pushed the captured-videos feature LIVE on vklf.com. The thirteen commits accumulated across Builds #1 through #6 + their six end-of-session doc batches all landed on `main` as a single fast-forward merge; Vercel auto-redeployed; a fresh extension bundle `plos-extension-2026-05-22-w2-deploy-31.zip` was packaged for you to sideload. Pre-deploy + post-merge scoreboards both stayed green at the exact same baselines (57 routes / 589 src/lib tests / 482 extension tests / 94 Playwright tests).

Then we ran the director real-Chrome verification walkthrough live in this session. You sideloaded the new zip, opened vklf.com, and we walked the 4 user-visible surfaces across all 4 supported competitor platforms (Amazon, Ebay, Etsy, Walmart).

**Etsy worked perfectly** — right-click video capture, popup paste flow, the new "Captured Videos" gallery on the URL detail page, and the green checkmark on already-saved videos all behaved exactly as designed.

**Amazon, Ebay, and Walmart together produced 6 distinct bugs.** None are catastrophic, but each one breaks a specific user surface on a specific platform. We captured each one as a numbered DEFERRED item in the TaskList (#9 through #14) so the next session can attack them with concrete starting points instead of vague "Amazon doesn't work" memory. Each bug includes a diagnostic hypothesis pointing to a specific source file and line range so the next session doesn't have to re-investigate from scratch.

Per the Rule 14f close-out picker you chose to **fix forward rather than revert** — the Etsy surface is shipped and visible to you, so reverting would lose director-visible work. Build #8 will diagnose + fix all six bugs + redeploy + re-walk verification including the Walmart phase we deferred mid-walkthrough.

## What we'll do next session (in plain terms)

Next session is **Build #8 — the fix-forward polish session.** This is a debugging + redeploy session, not a feature build.

Concretely:

1. **Diagnose each of the 6 bugs** in the order most likely to share a root cause (the Amazon hover-preview bug and the Walmart hover-preview bug are almost certainly the same underlying issue, so fixing one likely fixes both).
2. **Ship the fixes** in one build commit (or two if scope grows) on `workflow-2-competition-scraping`.
3. **Run the full pre-deploy scoreboard** (94 Playwright tests must stay green; new node:test cases may land if extracted-helper testing applies).
4. **Director Yes/No at the Rule 9 deploy gate** (the deploy is a 13+N commit ff-merge depending on how the fix scope shakes out).
5. **Ff-merge → push origin/main → Vercel auto-redeploy → ping-pong sync → fresh extension zip** `plos-extension-2026-05-XX-w2-deploy-32.zip` (or higher if more zips landed between sessions).
6. **Director re-walks the verification** across Amazon + Ebay + Walmart (Etsy already passed; only needs a brief regression smoke). Walmart's full walkthrough lands HERE since this session deferred most of it.

After Build #8 lands successfully across all 4 platforms, P-27 closes fully and W#2 graduation moves to the front of the queue (only P-26 below-fold scroll capture remains as the last W#2 pre-graduation polish item).

## What's still left on the total roadmap (in plain terms)

- **P-27 captured videos (current focus):** Builds #1–#7 done. **Build #8 (fix-forward + redeploy + re-verify) next session.** Then P-27 graduates after the re-walkthrough passes on all 4 platforms.
- **P-26 below-fold scroll capture** — lower-priority W#2 polish; current workaround works (two captures + two metadata-tagged rows); ~1-2 sessions when we get to it.
- **P-42 backup-memory-dir hook fix** — strongly recommended before any future big session; HIGH operational severity; ~1 session.
- **P-43 scoreboard absolute-paths polish** — still OPEN; reproduction #4 captured 2026-05-22; sub-1-hour polish; should ship as the very next non-P-27 session.
- **P-44 wxt zip parent-process hang** — annoying but not blocking; reproduced AGAIN this session during the deploy-31 zip step; ~1 session of diagnosis.
- After all of those, W#2 graduates. Then W#3–W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Not blocking Build #8.

---

**For:** the next Claude Code session — eighth P-27 Build session (Session #8 of estimated ~8-9 build sessions per the design doc §A.2 implementation arc table). **Fix-forward polish session** — diagnose + fix the 6 verification failures + redeploy + re-walk verification including Walmart. Per Rule 23 Change Impact Audit: **MIXED — some fixes will be ADDITIVE (new helper logic / additional defensive paths) + some may MODIFY existing code (orchestrator scan logic / fetch helpers / event listeners).** **Schema-change-in-flight flag stays "No"** — no schema delta expected for any of the 6 fixes (all are extension-side runtime + content-script DOM behavior issues, no Prisma changes anticipated). **Rule 9 trigger expectation: YES — Build #8 will redeploy after fixes ship, so Rule 9 fires again at that deploy moment** (ff-merge `workflow-2-competition-scraping` → `main`; director-Yes gate non-negotiable).

---

## Status of today's session

**P-27 Captured-videos feature DEPLOY SESSION #7 SHIPPED + DEPLOYED on vklf.com via `workflow-2-competition-scraping` → `main`.** One-hundred-and-twenty-seventh Claude Code session — `session_2026-05-22-b_p27-build-7-deploy-and-verification-with-deferred-fixes`. SIXTH substantive session of the current P-27 Build arc (Builds #2 + #3 + #4 + #5 + #6 + #7 all chained sequentially since 2026-05-21).

**Deploy mechanics (Rule 9 gate fired + director-Yes captured):**

- Ff-merge `workflow-2-competition-scraping` → `main`: 13 commits (`cf4e233..bd7cedd`) landed as pure fast-forward; no merge commit; +7890 / -83 across 40 files. The 13 commits covered Build #1 + Build #1 addendum + Build #2 + Build #2 doc-batch + Build #3 + Build #3 doc-batch + Build #4 + Build #4 doc-batch + Build #5 + Build #5 doc-batch + Build #6 + Build #6 doc-batch.
- Push `origin/main`: `bd7cedd` is now live; Vercel auto-redeploy fired.
- Ping-pong sync: all 4 refs (`workflow-2-competition-scraping` local + remote; `main` local + remote) at `bd7cedd`.
- Fresh extension zip `plos-extension-2026-05-22-w2-deploy-31.zip` (196,849 bytes — +5,288 over deploy-30's 191,561 bytes); **first deploy zip carrying the new captured-videos extension surface end-to-end** (popup paste form + content-script video-capture form + helpers + already-saved-video icon + new background.ts context-menu entry "Add to PLOS — Captured Video").
- **P-44 wxt zip parent-process hang did NOT reproduce this session** — `npm run zip` exited cleanly with code 0 in <30 sec. P-44 stays OPEN (intermittent — reproduction count unchanged from prior sessions; today's clean run is just a no-reproduction occurrence).

**Pre-deploy + post-merge scoreboards (both GREEN — ZERO deltas):** root tsc clean / extension tsc clean / `npm run build` **57 routes** (unchanged) / src/lib node:test **589/589** (unchanged) / extension `npm test` **482/482** (unchanged) / **Playwright 94/94** (unchanged from Build #6's new baseline) in 2.0 min total runtime.

**Director real-Chrome verification RAN IN-SESSION** (per Rule 14f close-out picker — director chose option B "Sideload + verify in this session first" over option A "Defer to next session"). Verification covered 4 platforms × 4 surfaces:

- **Etsy: ✅ FULL PASS on all 4 surfaces** — right-click video capture, popup paste flow, URL detail page Captured Videos gallery, saved-video green ✓ overlay all behaved exactly as designed.
- **Amazon: ❌ 4 distinct failures captured** as TaskList DEFERRED #9 + #10 + #11 + #12.
- **Ebay: ❌ 1 failure captured** as TaskList DEFERRED #13 — content script appears to load (per `content.ts:17` matches list) but no form opens on right-click.
- **Walmart: PARTIAL VERIFICATION + 2 failures captured** as TaskList DEFERRED #14 — director walked Walmart as a courtesy after Amazon + Ebay failed; full Walmart walkthrough deferred to Build #8 re-verify.

**Schema-change-in-flight flag stayed "No"** the entire session (deploy of pre-classified-additive changes from Builds #1-#6; no new schema delta at deploy time — the schema additions from Build #1's 2026-05-20-c `npx prisma db push` are already live in Supabase since that day and unchanged through Builds #2-#7).

**SIX NEW DEFERRED items open at session end (Rule 26):**

- **TaskList #9 — Amazon-A hover-preview class (SHARED with Walmart-A):** When mouse hovers a product-image video and the preview is shown, right-clicking the preview + "Add to PLOS — Captured Video" does NOTHING (no form, no toast, no error). Diagnostic hypothesis: Amazon's hover-preview renders into a transient/overlay DOM the orchestrator's `lastRightClickVideoResult` snapshot doesn't catch (or catches but the `find-underlying-video-embed.ts` walker doesn't recognize the preview element). Likely also reproduces on Walmart's similar hover-preview UX (see #14a). Starting point: `extensions/competition-scraping/src/lib/content-script/orchestrator.ts:927` (the `lastRightClickVideoResult` snapshot — verify the capture-phase contextmenu listener fires for the preview DOM) + `extensions/competition-scraping/src/lib/content-script/find-underlying-video-embed.ts` (the DOM walker — verify it recognizes Amazon's preview-overlay video element).
- **TaskList #10 — Amazon-B1 in-form thumbnail render (SHARED partial with Walmart-B):** Click preview → video plays → right-click → "Capture Video" → form opens but the in-form video preview thumbnail does NOT render. Diagnostic hypothesis: canvas frame-grab against the playing `<video>` fails on Amazon's hero player — either `readyState<2` at the moment of capture, OR the `<video>` element's bytes are CORS-tainted from Amazon's CDN so `getImageData` throws SecurityError per §A.12. Starting point: `extensions/competition-scraping/src/lib/content-script/video-capture-form.ts` (the canvas frame-grab block — confirm §A.12 NULL-thumbnail fallback is firing for SecurityError; if so, the form should still render with a black thumbnail placeholder; if not, the form should at least show the empty area). Walmart shows a similar partial-thumbnail bug on the playing-video right-click path (see #14b).
- **TaskList #11 — Amazon-B2 "Add new video category" input dead:** When 'Add new video category' is chosen from the dropdown, the resulting text input does NOT accept typed characters (no chars appear). Diagnostic hypothesis: input event handler not wired up, OR a keydown stopPropagation upstream is blocking type events, OR the input is rendered with `disabled`/`readonly` accidentally. Starting point: `extensions/competition-scraping/src/lib/content-script/video-capture-form.ts` (the inline "+ Add new category" affordance — find the dynamic input element + verify its event wiring; cross-check against the working sibling pattern in `image-capture-form.ts` since that one works fine for image categories).
- **TaskList #12 — Amazon-B3 cross-platform category Save fails with "Network unreachable":** When an existing video category CREATED ON ANOTHER PLATFORM (e.g., a category created during Etsy testing) is chosen + Save is clicked, the request fails with the exact error string `Couldn't save (network): Network unreachable — check your connection.` This exact string comes from `extensions/competition-scraping/src/lib/api-client.ts:100` `mapFetchTransportError` which converts a `TypeError` from native `fetch()` into `PlosApiError(0, 'Network unreachable — check your connection.')`. So the underlying fetch threw a TypeError — likely a CORS preflight failure OR a body-serialization issue OR a malformed URL specific to the cross-platform category path. **Etsy works for the same flow**, which proves the CORS host_permissions in `wxt.config.ts` cover the basic API path; this is Amazon-specific. Starting point: `extensions/competition-scraping/src/lib/api-client.ts:100` (`mapFetchTransportError` — the error origin) + `finalizeVideoUpload` (the Save-call site for the EMBED branch on the form) + the `fetch` URL construction for the call; also DevTools Network tab on a reproduction would reveal whether the preflight or the actual POST failed.
- **TaskList #13 — Ebay no form opens:** Right-click on a video → "Capture Video" → NO form overlay opens at all. `extensions/competition-scraping/src/entrypoints/content.ts:17` confirms `https://*.ebay.com/*` IS in `defineContentScript.matches`, so the content script DOES load. The failure is somewhere deeper. Diagnostic hypotheses (test in order): (a) orchestrator's right-click capture-phase listener doesn't register on Ebay-platform pages (the `init` path may bail early on Ebay because of a platform-detection gate — verify in `orchestrator.ts`); (b) `find-underlying-video-embed.ts` returns `kind='none'` for Ebay's video DOM patterns (the walker may not recognize Ebay's `<video>` or `<iframe>` shapes — test by right-clicking + inspecting `lastRightClickVideoResult` in DevTools); (c) the SW→tab message bridge `open-video-capture-form` doesn't route on Ebay tabs (background.ts dispatcher — test by adding a console.log + reproducing). Starting point: open DevTools on an Ebay video page + reproduce the right-click + check console for any errors or absences. The systematic way to isolate is to set a breakpoint in `orchestrator.ts`'s contextmenu listener + see whether it even fires on Ebay.
- **TaskList #14 — Walmart partial: hover-preview class (SHARED with #9) + playing-video thumbnail (SHARED partial with #10):** Two issues, captured after director walked Walmart in-session as a courtesy after Amazon + Ebay verification surfaced their failures. **(a)** Same hover-preview class as Amazon-A (#9) — right-clicking the hover-preview video does NOTHING. Strong evidence of shared root cause with Amazon-A; fixing #9 likely fixes #14a. **(b)** Walmart's playing-video right-click DOES save successfully (the Save path works — unlike Amazon-B3 #12), BUT the in-form thumbnail does NOT render properly (similar to Amazon-B1 #10 but Save still succeeds whereas Amazon-B1 doesn't reach Save). Other Walmart tests passed (URL detail page Captured Videos gallery renders correctly + saved-video green ✓ overlay appears on saved videos). **So Walmart is partially working** — the fix-forward needs to address the hover-preview class + the thumbnail rendering, but Walmart's network + Save path are fine. Walmart's full re-walkthrough (including new captures + saved-video badges + gallery on a separate Walmart competitor URL) is deferred to Build #8's post-fix verification.

**Per Rule 23 Change Impact Audit (pre-classified before deploy):** Additive (safe) — deploy of Builds #1-#6's already-classified-additive changes (new `CapturedVideo` table since Build #1 + new API routes since Build #2 + new extension code since Builds #3-#4 + new renderer + signed-URL list endpoint since Build #5 + new Playwright specs since Build #6). The cumulative deploy lands all of these together. No existing data risk; the schema additions are additive + already verified live in Supabase since Build #1's 2026-05-20-c `prisma db push`.

**§4 Step 1c interview outcome (forced-picker fired explicitly at session close per HANDOFF_PROTOCOL §4 Step 1c):** the natural-continuation next session is P-27 Build #8 (fix-forward polish session — diagnose + fix the 6 verification failures + redeploy + re-walk). Director defaulted to this recommendation per `feedback_default_to_recommendation.md`. **(a.61) RECOMMENDED-NEXT = P-27 implementation #8 (fix-forward polish session) on `workflow-2-competition-scraping`.**

**FIFTH end-of-session run under the Rule 30 + §4 Step 4b template** (first was 2026-05-21-b Build #3; second was 2026-05-21-c Build #4; third was 2026-05-21-d Build #5; fourth was 2026-05-22 Build #6). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; Build #8's fixes land here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` AND with `main` (both at `bd7cedd` after this session's ping-pong sync, plus whatever doc-batch commit this session adds). After Build #8's fixes land + the next deploy ff-merges, both branches will advance together again.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-27 implementation #8 — Fix-forward polish session on `workflow-2-competition-scraping`.** Closes **(a.61) RECOMMENDED-NEXT**. Six DEFERRED bugs from Build #7's in-session director verification need diagnosis + fix + redeploy + re-walk verification across Amazon + Ebay + Walmart. Etsy already PASSED in the prior session so only needs a brief regression smoke after re-deploy.

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or coding).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-27 polish-backlog entry (annotated 2026-05-22-b with "✅ Build #7 deploy complete 2026-05-22-b + 6 verification failures captured for Build #8 fix-forward").
- `docs/CAPTURED_VIDEOS_DESIGN.md` §B 2026-05-22-b entry — captures the 6 verification failures + the diagnostic next-steps per failure + the decision to fix-forward rather than revert.
- `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Deploy session #31 — P-27 Captured-videos DEPLOYED + 6 verification failures captured" section appended this session (the canonical verification artifact).
- `docs/HANDOFF_PROTOCOL.md` Rule 8 (Pre-flight audit) + Rule 9 (main deploy gate — Build #8 will redeploy after fixes) + Rule 23 (Change Impact Audit) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` lines ~920-940 (the `lastRightClickVideoResult` snapshot path — Bug #9 + Bug #13's diagnostic starting points).
- `extensions/competition-scraping/src/lib/content-script/find-underlying-video-embed.ts` (the DOM walker — Bug #9 + Bug #13 may both stem from walker recognition gaps).
- `extensions/competition-scraping/src/lib/content-script/video-capture-form.ts` (the form — Bug #10 thumbnail rendering + Bug #11 input event handling).
- `extensions/competition-scraping/src/lib/api-client.ts` lines ~95-110 (`mapFetchTransportError` + the `fetch` call sites — Bug #12 cross-platform Save failure).
- `extensions/competition-scraping/wxt.config.ts` (host_permissions — verify Amazon API path coverage is symmetric with Etsy's coverage; Bug #12 diagnosis aid).

**Task shape (Build session #8 = Fix-forward polish session):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or coding. Cover: which 6 bugs we'll diagnose + the diagnostic order (start with the SHARED hover-preview bug since fixing it likely fixes 2 bugs at once — #9 + #14a), what the user-visible "after" looks like (Amazon + Ebay + Walmart all get the same 4 surfaces Etsy already passes), what stays unchanged on the design side (no schema delta; no design re-litigation — the §A frozen design is binding; this session is bugfix scope only per Rule 18).

2. **Diagnose each of the 6 bugs IN ORDER below** (likely-shared-root-cause first):

   - **Step 2a — Shared hover-preview bug (#9 + #14a).** Reproduce on Amazon; inspect `lastRightClickVideoResult` in DevTools at right-click time; check whether the capture-phase contextmenu listener fires on the hover-preview overlay element; check whether `find-underlying-video-embed.ts` recognizes the preview element. Fix in one of three plausible places: (a) extend the contextmenu listener registration to cover transient overlay elements; (b) extend `find-underlying-video-embed.ts` to recognize Amazon-style preview-overlay DOM patterns; (c) add an Amazon-specific quirk handler. Verify the fix reproduces clean on Walmart's hover-preview too (the shared-class hypothesis is testable — if Walmart still fails after the Amazon fix, the bugs are NOT shared and need separate diagnoses).

   - **Step 2b — Ebay no form opens (#13).** Reproduce on Ebay; check console for errors; add a temporary console.log to `orchestrator.ts`'s contextmenu listener registration + the SW→tab `open-video-capture-form` dispatch; identify which layer is silent. Fix the broken layer. May reveal a platform-detection gate that's accidentally Ebay-excluding.

   - **Step 2c — Amazon-B3 cross-platform Save (#12).** Reproduce on Amazon; capture the failing fetch in DevTools Network tab; inspect URL + headers + body + the CORS preflight result. Diagnose whether it's: (i) a malformed URL (wrong path segment for the cross-platform category id), (ii) a CORS preflight failure (missing host_permission), (iii) a body-serialization issue (JSON.stringify of a non-serializable field). Fix the root cause.

   - **Step 2d — Amazon-B1 + Walmart-B in-form thumbnail (#10 + #14b).** Reproduce on Amazon's playing-video; verify §A.12 NULL-thumbnail fallback is firing for SecurityError (it should be — and the form should still render). If the form area is silent (no black thumbnail placeholder), the fallback may not be firing OR the rendering may not be handling the NULL case correctly. Fix the rendering path so the form ALWAYS shows SOMETHING in the thumbnail area even if the canvas frame-grab fails.

   - **Step 2e — Amazon-B2 "Add new video category" input dead (#11).** Reproduce on Amazon; inspect the dynamic input element in DevTools; cross-compare its event wiring against the working sibling `image-capture-form.ts` inline-add affordance. Find the missing wiring + add it.

3. **Pre-deploy /scoreboard GREEN at exact baselines** (use absolute paths per the recurring P-43 reproduction lesson). Targets: 57 routes / 589 src/lib / 482 ext / 94 Playwright (all unchanged unless new helper test cases land — increment baseline accordingly + report the delta to director).

4. **Rule 9 director-Yes gate** via AskUserQuestion picker. Surface the fix summary + the Rule 23 audit + scoreboard counts to director. Wait for explicit Yes before any main push.

5. **Ff-merge `workflow-2-competition-scraping` → `main`** + push origin/main + ping-pong sync + fresh extension zip (`plos-extension-2026-05-XX-w2-deploy-32.zip` or higher).

6. **Director re-walks verification** across Amazon + Ebay + Walmart (Etsy: brief smoke only since it already PASSED in Build #7). Walmart's full walkthrough lands HERE.

7. **End-of-session doc-batch** covers ROADMAP (P-27 polish-backlog entry annotated with "✅ Build #8 fix-forward complete + re-verified 2026-05-XX") + CHAT_REGISTRY (header bump — 128th Claude Code session; new registry-table row per established pattern OR header-bump-only depending on session shape — match the established cadence since 2026-05-15-e) + DOCUMENT_MANIFEST + CORRECTIONS_LOG (likely zero new entries unless a process slip occurs; the 6 product bugs themselves are NOT corrections-log-tier — they belong in the design doc + verification backlog) + NEXT_SESSION.md (rewritten for the NEXT priority item — likely W#2 graduation prep OR P-26 if director picks below-fold scroll capture as the next non-P-27 W#2 polish) + CAPTURED_VIDEOS_DESIGN.md §B 2026-05-XX entry (the fix-forward mid-build judgment calls + the after-verification status update) + COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md "Deploy session #32" section.

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for any mid-fix forced-pickers (e.g., if a fix turns out to require a small scope-expansion or if a diagnostic surfaces a third option not anticipated above), surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers.

**Schema-change-in-flight flag:** stays "No" the entire session (all 6 bugs are extension-side runtime + content-script DOM + fetch issues; no schema delta expected; the §A.7 schema spec is unchanged).

---

## Pre-session notes (offline steps for director between sessions)

**NO required offline steps for Build #8** — the fix-forward session runs entirely from Claude + the existing tooling. The deploy-31 zip is already sideloaded from this session so director can re-reproduce any of the 6 bugs in DevTools at the start of next session as a sanity-check.

**STILL-OPEN optional offline step (NOT blocking Build #8 — carry-over from Build #1):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking Build #8 — can happen any time.

**Optional offline reading for director:** `docs/CAPTURED_VIDEOS_DESIGN.md` §B 2026-05-22-b entry (the 6 verification failures + diagnostic next-steps captured this session — informational for understanding what Build #8 will attack). ~5-minute skim before the next session if director wants the full context.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session:** `git push origin main` (the Build #8 redeploy push — Rule 8/9 explicitly authorize this as the canonical deploy mechanic; the Rule 9 director-Yes gate is the procedural safety). NO `prisma db push` planned (no schema delta to ship). NO `git reset --hard` / `git push --force` / `git branch -D` planned. The ff-merge precondition is verified before any main push.

**Rule 9 triggers planned this session:** YES — ff-merge `workflow-2-competition-scraping` → `main` + push origin/main + Vercel auto-redeploy. The director-Yes gate is non-negotiable. Surface the fix summary + Rule 23 audit + scoreboard counts via AskUserQuestion picker BEFORE any main push.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe.

---

## Why this pointer was written this way (debug aid)

Today's session ran P-27 Build #7 (deploy session — ff-merge `workflow-2-competition-scraping` → `main` + Vercel auto-redeploy + fresh extension zip) per the design doc §A.2 implementation arc table row #8. The director chose option B "Sideload + verify in this session first" at the Rule 14f close-out picker, which ran the verification walkthrough in-session. Walkthrough surfaced 6 distinct bugs across Amazon + Ebay + Walmart (Etsy passed perfectly). All 6 were captured as TaskList DEFERRED items + as a §B 2026-05-22-b entry in `docs/CAPTURED_VIDEOS_DESIGN.md` + as a new "Deploy session #31" section in `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md`.

The §4 Step 1c forced-picker fired explicitly at session close: director picked the fix-forward path over revert (the Etsy surface is shipped + visible; reverting would lose director-visible work). Build #8 is the fix-forward polish session.

Build #8's launch prompt is shaped around (a) the diagnostic order that maximizes shared-root-cause leverage (start with the shared hover-preview class since #9 + #14a likely share a root cause; fix that first + verify Walmart's hover-preview bug clears too), (b) the concrete starting-point file + line range for each of the 6 bugs so the next session doesn't re-investigate from scratch, (c) the standard deploy mechanics with Rule 9 director-Yes gate firing again at the Build #8 deploy moment, (d) the standing optional offline step (Supabase Global File Size Limit raise) is carried over but NOT blocking.

The Builds #1-#7 mid-build judgment calls (in design doc §B 2026-05-20-c + §B 2026-05-21 + §B 2026-05-21-b + §B 2026-05-21-c + §B 2026-05-21-d + §B 2026-05-22 + §B 2026-05-22-b) are all binding inputs to Build #8; do NOT re-litigate at fix-forward time. The design is unchanged; only the implementation has known bugs to fix.

**Alternate next-session candidates if director shifts priorities at session start (after Build #7 deploy + verification + before Build #8 fix-forward):**

- **Defer Build #8 fixes + ship P-43 scoreboard absolute-paths polish instead (LOW-MEDIUM elevated by reproduction #4 captured 2026-05-22).** Sub-1-hour polish; the recurring CWD-leak class keeps biting. Director may pick this if Build #8 feels too sprawling for a single session and a quick win on operational tooling is preferred. Estimated <1 hour.
- **Defer Build #8 fixes + ship P-42 backup-memory-dir hook fix (HIGH severity).** Multi-reproduction history; STRONGLY RECOMMENDED before any future big session. Estimated ~1 session; LOW LOC; HIGH operational importance.
- **Defer Build #8 fixes + start P-26 below-fold full-page-scroll capture (LOW-severity deferred large lift).** Currently the only remaining non-P-27 pre-graduation polish item; current workaround works; ~600-1000 LOC code-only session, no design needed. Recommended *only* if director wants to wrap the smaller-scope polish item BEFORE the rest of P-27's bug-fixing arc ships. Estimated 1-2 sessions.
- **Raise Supabase Global File Size Limit (DEFERRED Task #N from Build #1, captured in ROADMAP as P-27 sub-item).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time.

Check `ROADMAP.md` for the canonical state.
