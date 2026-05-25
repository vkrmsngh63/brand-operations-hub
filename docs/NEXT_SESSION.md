# Next session

**Written:** 2026-05-25 (`session_2026-05-25_p48-session-1-diagnostic` — end-of-session handoff after **W#2 polish P-48 Session 1 (Diagnostic) ✅ DONE 2026-05-25 on `workflow-2-competition-scraping`** — pure diagnostic session ruling out capture-side bitrate as root cause (cap already shipped in `record-controller.ts:42` as `VIDEO_BITS_PER_SECOND_DEFAULT = 2_500_000`; actual files measured 0.50 / 1.35 / 0.67 Mbps — well below the cap) + ruling out delivery-side (Supabase Storage returns `accept-ranges: bytes` + 206 Partial Content on byte-range; Cloudflare edge cache hits on re-requests; ~124 Mbps throughput Codespace → file) + identifying **missing WebM duration metadata in MediaRecorder-produced container headers** as the empirical root cause via `ffprobe` + EBML deep-probe across 3 production SCREEN_RECORDING webm files (every file shows `Duration: N/A` per ffprobe; EBML inspector confirms `format: duration: NOPTS`; canonical MediaRecorder limitation — EBML header written at recording-START before duration is known, never patched after `stop()`). Pre-Session-1 ROADMAP entry hypothesis ("uncapped bitrate") empirically FALSIFIED + file path drift corrected (`content-script/screen-recorder.ts` → actual `screen-recording/record-controller.ts`). **Closes (a.89) RECOMMENDED-NEXT = P-48 Session 1 (Diagnostic) ✅ DIAGNOSED 2026-05-25**; **opens (a.90) RECOMMENDED-NEXT = P-48 Session 2 (Implementation) on `workflow-2-competition-scraping`** — first item in director's 2026-05-24-f directive sequence to "fix all things remaining for competition scraping" before W#2 graduation + then explicitly ASK director for next round of additions.

---

## What we did this session (in plain terms)

Today was a **diagnostic session** for the screen-recording stutter issue you flagged during the 2026-05-24-f Phase-4 verifications. No code landed — nothing on vklf.com changed. I ran inspection tools (`ffprobe` for media metadata + `curl` for HTTP delivery checks) on the actual screen-recording videos already saved in your database, and on the Supabase Storage delivery layer that serves them to vklf.com.

The working hypothesis going into the session — that the videos were being recorded at too high a bitrate (typical browser default for screen recording is 6-8 Mbps) and exceeding the playback device's real-time decode budget — turned out to be **empirically wrong on two counts.** First, the bitrate cap is already in the code (2.5 Mbps; shipped as part of the P-45 build originally — we just didn't realize it during the 2026-05-24-f session-end when P-48 was captured). Second, the actual recorded files came in at 0.50 / 1.35 / 0.67 Mbps — well below the 2.5 Mbps cap, well below anything that would stress a modern playback device. So the bitrate is fine. I also tested the Supabase Storage delivery layer — it returns proper HTTP byte-range responses, Cloudflare's edge caches the files, the throughput from Codespace to file is ~124 Mbps. Delivery is fine too.

**The real cause turned out to be a missing piece of metadata in the WebM container header.** When the browser's MediaRecorder writes a WebM file, it stamps the file header at the START of recording — before it knows how long the recording will be. After you stop the recording, the browser SHOULD go back and patch the duration value into the header, but Chrome never does (this is a well-known MediaRecorder limitation). So every screen recording in your DB has a header that says "duration: unknown." When vklf.com loads the video, the HTML5 video player sees `duration === Infinity` and breaks its pre-buffer-planning math — instead of fetching the next chunk smoothly, it reactively fetches chunks as the current one plays out, and that gap surfaces as visible stutter.

Mid-session I had **one picker mishap.** When I queried the database for recent screen recordings, I accidentally filtered on only 2 of the 3 enum values for the source-type discriminator field — missed the very `SCREEN_RECORDING` value I was looking for. The query returned zero rows, and I briefly reported "no screen recordings in DB — looks like they're not being saved at all." You corrected me immediately (*"I've definitely created P-45 screen recordings; they're missing from the DB"*), I re-queried with all 3 enum values, and 3 recordings appeared. No real "data integrity bug," just a query bug on my end. I've captured this as a mechanical prevention note in CORRECTIONS_LOG so future diagnostic sessions remember to query ALL enum values upfront.

You ended the session before the 15-step Chrome DevTools Network Panel walkthrough I had drafted (*"i can't do any testing right now so add that to the next session and wrap up no"*). I've preserved that walkthrough VERBATIM in the `## Pre-session notes` section below — you can run it on your Mac in 5 minutes between sessions if you want to either (a) further confirm the missing-duration root cause yourself OR (b) just skip it and let Session 2 ship the fix speculatively based on the strong empirical evidence already collected.

## What we'll do next session (in plain terms)

Next session is **P-48 Session 2 (Implementation) on `workflow-2-competition-scraping`** — small build + deploy session estimated 30-45 min in-Claude.

The fix is mechanical and small. I'll add a tiny npm library called `fix-webm-duration` (~3 KB; well-known canonical library that exists exactly for this MediaRecorder limitation; MIT licensed; no transitive dependencies) to the extension's dependencies. Then in the screen-recording controller file (`record-controller.ts`), after the recorder finishes stopping but BEFORE it emits the final Blob to the rest of the extension, I'll call the library's `fixWebmDuration(blob, durationMs)` function to patch the missing duration value into the WebM header. About 10 lines of code in one file, plus a few new automated test cases to verify the patch lands correctly.

Then we deploy to vklf.com under ONE Rule 9 gate (you say Yes to the deploy push, Vercel auto-redeploys in ~2-3 minutes, fresh extension zip dropped at repo root, you sideload the new zip), and you perform a Phase-4 real-Chrome verification: record 1-2 NEW screen recordings on Amazon (or any platform), load them on vklf.com, and confirm (a) the seek bar shows a real total duration like "0:42" or "1:15" — NOT "∞" or "Live" or "-:--", and (b) playback no longer stutters.

**Important caveat:** only NEW recordings made AFTER Session 2's deploy will benefit from the fix. The 3 existing webm files in your DB will keep their broken metadata — they were already missing duration at capture time and we can't go back and patch files that have already been uploaded to Storage. If there's a specific existing recording you want to keep at smooth-playback quality, the workaround is to re-record it after Session 2 ships.

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-25 (P-48 Session 1 ✅ DIAGNOSED; W#2 polish queue still has 4 small items left before graduation):

- **P-48 Session 2 (Implementation) — NEXT.** ~30-45 min in-Claude. Lands the `fix-webm-duration` library + the ~10 LOC patch in `record-controller.ts` + a few new test cases + ONE Rule 9 deploy gate + director Phase-4 real-Chrome verification on NEW recordings. After Phase-4 PASS → P-48 closes ✅ DONE-AND-VERIFIED end-to-end.
- **P-43 mechanical prevention candidate (LOW informational).** ~1 small session. Add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md` (specifically Check 3's `npm test` + Check 5's `npm run build` — the prior P-43 template-hardening pass missed both). Not blocking any workstream; 7+ reproductions across sessions now.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions, OR drop. Current two-captures workaround works fine. Has been the alternate candidate in recent end-of-session pickers; consistently not picked. Re-evaluate after P-48 + P-43 close — if still LOW + not blocking anything, you may just want to drop it.
- **P-27 Bug #9 + Bug #15 — DEFERRED LOW.** ~0-1 sessions. Likely obsolete now that P-46 redesigned the surfaces. Re-evaluate after P-46 closed (which it has, 2026-05-24-f) — so this re-evaluation happens at the next P-27 touch.
- **W#2 graduation step.** ~1 session. Formal transition that closes W#2 and makes W#3 available. Requires all polish items DONE-AND-VERIFIED first.
- **THEN STOP AND EXPLICITLY ASK DIRECTOR for the next round of competition-scraping additions** per your verbatim 2026-05-24-f directive: *"We will be adding more things to competition scraping once the pending things are finished and I want you to explicitly ask me to give you the next round of additions once all remaining things are done."*
- **After your next round of additions ships:** W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent.

---

**For:** the next Claude Code session — **P-48 Session 2 (Implementation) on `workflow-2-competition-scraping`** (estimated ~30-45 min in-Claude: pre-build doc reads + branch state verify + read Session 1 diagnosis from this NEXT_SESSION.md + `npm install fix-webm-duration` in the extension workspace + edit `record-controller.ts` ~10 LOC + extend `record-controller.test.ts` with new test cases + /scoreboard + /deploy + ping-pong + fresh extension zip + director real-Chrome verification per Phase-4 walkthrough). Per Rule 23 Change Impact Audit: **SMALL BUILD + DEPLOY SESSION** (one new tiny runtime dep + ~10 LOC + new test cases). **Schema-change-in-flight flag stays NO**. **Rule 9 triggers planned this session: ONE** (deploy push). **Pushes planned per `feedback_approval_scope_per_decision_unit.md`:** 4 (deploy push + ping-pong + end-of-session doc-batch push + ff-merge to main for doc-batch).

---

## Status of last session

**W#2 polish P-48 Session 1 (Diagnostic) ✅ DONE 2026-05-25 on `workflow-2-competition-scraping`** — pure diagnostic session executing the (a.89) RECOMMENDED-NEXT protocol drafted at end of 2026-05-24-f. ZERO code lands; ZERO build commits; one push planned at end-of-session (doc-batch) + one ping-pong ff-merge push (operationally adjacent; no Rule 9 gate).

**Session shape (PURE DIAGNOSTIC — no main push; ZERO Rule 9 gates; ONE Rule 14f forced-picker fired during diagnostic shaping):**

- Pre-build reads at session start (CLAUDE_CODE_STARTER + ROADMAP P-48 + COMPETITION_SCRAPING_DESIGN §B 2026-05-24-f + record-controller.ts pre-read).
- Branch state verify — `workflow-2-competition-scraping` even at prior session's doc-batch SHA.
- Rule 14f session-start confirmation — NO picker fired (launch-prompt task was the recommended default + director directive matched).
- Step 1 — read `record-controller.ts:42` → found `VIDEO_BITS_PER_SECOND_DEFAULT = 2_500_000` cap already shipped. Hypothesis 50%-busted at source read.
- Step 2 — query production DB for recent SCREEN_RECORDING webm rows → initial query had enum-coverage bug; brief false-alarm; director corrected; re-query found 3 rows.
- Step 3 — generate signed URLs for the 3 webm files + curl-HEAD-test Supabase Storage delivery → `accept-ranges: bytes` + 206 Partial Content + Cloudflare cache HIT + 124 Mbps throughput. Delivery-side ruled out.
- Step 4 — run `ffprobe` against the 3 webm Blobs → all show `Duration: N/A` + actual encoded bitrates 0.50 / 1.35 / 0.67 Mbps (well below 2.5 Mbps cap). Capture-side bitrate ruled out.
- Step 5 — run `ffprobe -show_format -of json` for EBML deep-probe → all show `format.duration: NOPTS`. Root cause locked: missing WebM duration metadata in MediaRecorder output.
- Step 6 — draft 15-step Chrome DevTools Network Panel walkthrough for director-side confirmation.
- Director mid-session directive *"i can't do any testing right now so add that to the next session and wrap up no"* — walkthrough preserved verbatim in ## Pre-session notes section (NOT in ## Standing carry-overs; it's a director-side action, not a Claude-defer).
- Delete the 6 throwaway diagnostic scripts created in `scripts/` during the session.
- End-of-session §4 Step 1c next-session-scope picker — NOT FIRED (next-session task unambiguous per (a.90) = P-48 Session 2 Implementation; director's 2026-05-24-f directive locked the sequence).
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG with new §Entry 2026-05-25 + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + COMPETITION_SCRAPING_DESIGN.md §B 2026-05-25).
- TWO pushes this session per `feedback_approval_scope_per_decision_unit.md`: end-of-session doc-batch push to `origin/workflow-2-competition-scraping`; end-of-session ff-merge push to `origin/main` for doc-batch (operationally adjacent; does NOT invoke Rule 9 since no destructive operation).

**ONE Rule 14f forced-picker FIRED during diagnostic shaping** — capture-flow scoping picker fired after the enum-coverage query bug created a brief false-alarm; resolved when director directive *"I've definitely created P-45 screen recordings; they're missing from the DB"* + the re-query found the 3 rows.

**ZERO DEFERRED items at session end (Rule 26)** — Session 2 task IS the next-session task per (a.90); director's Network Panel walkthrough preserved as ## Pre-session notes (director-side action, not Claude-defer).

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-25** — the P-48 Session 1 Diagnostic closing §Entry capturing 5 sub-observations: (a) P-48 hypothesis empirically falsified; (b) NEW reusable Pattern "ffprobe-first diagnostic reveals hypothesis-bust before any code lands"; (c) MEDIUM informational enum-coverage query-bug + mechanical prevention candidate; (d) calibration data point (~45 min in-session under 30-60 budget); (e) operational housekeeping (6 throwaway diagnostic scripts deleted at session end).

**THIRTY-THIRD end-of-session run under the Rule 30 + §4 Step 4b template.** The 3 plain-terms sections above + the parent's Personalized Handoff continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; P-48 Session 2 (Implementation) begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at today's end-of-session doc-batch commit. `main` exactly even with `origin/main` at today's end-of-session doc-batch commit (both branches end the session at the same SHA after the canonical 2-push ping-pong pattern — Session 1 was diagnostic-only so no main push for code happened; only the doc-batch ff-merge to main lands). Verify with `git log main..HEAD --oneline` showing 0 commits ahead. Session 1 did NOT involve any code commits — only a doc-batch.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **Per Step 7b, produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-48 Session 2 (Implementation) on `workflow-2-competition-scraping`.** Closes **(a.90) RECOMMENDED-NEXT**. Small build + deploy session. Add `fix-webm-duration` runtime dep to the extension workspace + inject patched-duration WebM Blob in `record-controller.ts` post-stop / pre-`onStopped`. ~10 LOC in `record-controller.ts` + new test cases in `record-controller.test.ts`. Deploy to vklf.com under ONE Rule 9 gate; director performs Phase-4 real-Chrome verification on a NEW recording made AFTER Session 2 deploys (existing 3 webm files keep their broken metadata — only new captures benefit).

BUILD + DEPLOY session — ONE Rule 9 gate planned. New runtime dep (~3 KB; `fix-webm-duration` from yusitnikov/fix-webm-duration; MIT; no transitive deps). New ~10 LOC in `record-controller.ts`. New unit-test cases in `record-controller.test.ts`.

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify both branches' SHA relationships with `git log main..HEAD --oneline` — should show 0 commits ahead.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or build mechanics).
- `docs/ROADMAP.md` lines 1-30 (header) + the **REVISED P-48 polish-backlog entry** (status ✅ DIAGNOSED 2026-05-25 (Session 1 of 2); WHERE corrected to `screen-recording/record-controller.ts`; WHY paragraph with empirical findings; Fix scope with Session 2 OPEN scope locked).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-25 (today's Session 1 diagnostic findings entry — diagnostic mechanics + busted hypothesis + locked Session 2 fix path).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-25 (today's Session 1 Diagnostic closing entry — 5 sub-observations including NEW reusable Pattern "ffprobe-first diagnostic reveals hypothesis-bust before any code lands").
- `extensions/competition-scraping/src/lib/screen-recording/record-controller.ts` (the file Session 2 edits — note the new path; the prior P-48 entry referenced a non-existent `content-script/screen-recorder.ts`).
- `extensions/competition-scraping/src/lib/screen-recording/record-controller.test.ts` (the test file Session 2 extends with new patched-duration cases).
- `extensions/competition-scraping/package.json` (confirm extension workspace before adding the `fix-webm-duration` dep; deps live in the extension's own package.json, not the root).
- The 15-step Chrome DevTools Network Panel walkthrough in this NEXT_SESSION.md's `## Pre-session notes` section — if director has run it between sessions, fold their findings into the Session 2 plan; if they haven't run it, proceed based on the strong empirical evidence Session 1 already collected.
- `docs/HANDOFF_PROTOCOL.md` Rule 9 (deploy push gate) + Rule 14f (forced-picker mechanics) + Rule 21 + Rule 22 + Rule 23 (Change Impact Audit — SMALL BUILD + DEPLOY) + Rule 24 (search before capturing new items) + Rule 25 (Multi-Workflow — workflow-2 only) + Rule 26 (DEFERRED items registry — ZERO standing carry-overs at session entry) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `feedback_approval_scope_per_decision_unit.md` (4-push deploy-session pattern: deploy push + ping-pong + doc-batch + doc-batch ff-merge).
- `feedback_recommendation_style.md` (most-thorough/reliable — Rule 9 deploy gate + Phase-4 in-session vs deferred picker both will surface; default to recommended path).
- The P-43 polish-backlog entry in ROADMAP + recent §Entry 2026-05-26 sub-observation (the mechanical prevention candidate that comes next after P-48 — useful context for understanding the upcoming polish queue sequencing per director's directive).

**Task shape (P-48 Session 2 — Implementation):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or build mechanics. Cover: what we'll do (pre-build reads + branch state verify + npm install fix-webm-duration in extension + edit record-controller.ts ~10 LOC + extend record-controller.test.ts with new cases + /scoreboard + Rule 9 deploy gate + ff-merge + Vercel auto-redeploy + fresh extension zip + ping-pong + Phase-4 real-Chrome verification on a NEW recording + end-of-session doc-batch); schema-change-in-flight flag stays NO; ONE Rule 9 gate planned (deploy push); 4 pushes planned total.

2. **Pre-build reads** — execute the pre-build read list above. ~5 min.

3. **Branch state verify** — `git branch --show-current` (should be `workflow-2-competition-scraping`) + `git log main..HEAD --oneline` (should show 0 commits — both branches at same SHA from prior session's ping-pong).

4. **Rule 14f session-start confirmation** — confirm P-48 Session 2 implementation scope. Per `feedback_default_to_recommendation.md` no picker fires if launch-prompt task is the recommended default + director directive matches. If director has run the Network Panel walkthrough between sessions and surfaced an additional contributor, fire clarifying picker on whether Session 2 still ships the duration-metadata fix only OR bundles the additional fix.

5. **Add `fix-webm-duration` dep to extension workspace.** `cd extensions/competition-scraping && npm install fix-webm-duration` (or `pnpm` if that's the workspace package manager — verify via `package.json` workspace config). Confirm new dep + lockfile change land cleanly in the extension's own `package.json` + lockfile, NOT the root. Verify extension tsc + extension test counts unchanged after the install.

6. **Edit `record-controller.ts`** — import `fixWebmDuration` from `fix-webm-duration`. In the recorder's `stop` event handler, after the recorder fires `stop` but before `onStopped` emits, capture the elapsed duration (compute from recording-start timestamp to stop-event timestamp; ms), then `await fixWebmDuration(blob, durationMs)` to inject the JS-known duration into the EBML Segment Info Duration tag, then emit the patched Blob via `onStopped`. ~10 LOC. Preserve all existing behavior on error path (if `fixWebmDuration` throws, log + fall through to emitting the unpatched blob so we don't lose the recording).

7. **Extend `record-controller.test.ts`** — add new node:test cases verifying (a) the patched blob's EBML header contains a Segment Info Duration tag (read the first ~256 bytes + look for the EBML duration marker bytes 0x4489 followed by the duration value); (b) the patched blob's size is close to the original blob's size (the patch is ~10 bytes total); (c) the error path (mock `fixWebmDuration` throwing) still emits the unpatched blob via `onStopped`. Bring `record-controller.test.ts` from current count to +3-5 cases. Update src/lib + extension test count baselines accordingly.

8. **/scoreboard** pre-deploy. Expected: root tsc clean / extension tsc clean / 558 ext +3-5 from baseline 558 (the new fix-webm-duration test cases) / 786 src/lib UNCHANGED / 62 routes UNCHANGED / Check 6 Playwright SKIPPED per Rule 27 (no Playwright spec coverage for record-controller). If anything red, STOP + surface.

9. **Rule 9 deploy gate** — fire AskUserQuestion picker offering "Deploy now — push to origin/main (Recommended)" / "Hold for review" / "Cancel". Per `feedback_recommendation_style.md` default to Recommended.

10. **ff-merge `workflow-2-competition-scraping` → `main` + push to `origin/main`** under director Yes. Vercel auto-redeploy fires (~2-3 min cycle). /scoreboard post-merge on `main` (5/5 GREEN at same new baselines).

11. **Ping-pong sync** — fetch + ff-merge `origin/main` back into `workflow-2-competition-scraping` (no-op if already even); push if needed. Both branches at same SHA after this step.

12. **Build fresh extension zip** — `cd extensions/competition-scraping && npm run zip` (or equivalent). Confirm new zip filename at repo root with today's date (`plos-extension-2026-05-25-w2-deploy-NN.zip`); size should be similar to prior deploy zip ± a few KB (only the fix-webm-duration dep is new).

13. **Phase-4 real-Chrome verification** — director sideloads the new zip via Chrome → Extensions → Developer mode → Load unpacked → pick the extension dist dir. Director records 1-2 NEW screen recordings via the extension on Amazon (or any platform). Director loads them on vklf.com → confirms (a) the seek bar shows a real total duration like "0:42" or "1:15" — NOT "∞" or "Live" or "-:--", AND (b) playback no longer stutters. Fire Phase-4 in-session vs deferred picker per the 2026-05-24-f Pattern (default to "Run in-session now — Recommended" per `feedback_recommendation_style.md`).

14. **If Phase-4 PASS** → P-48 closes ✅ DONE-AND-VERIFIED end-to-end 2026-05-25. **If Phase-4 surfaces issues** → fix-forward cascade per the W3 deploy 2026-05-24 + W4 fix-forward 2026-05-24-f Pattern (most likely outcome: a small tweak to the durationMs computation; budget 1-2 fix-forward cycles).

15. **End-of-session doc-batch** covers ROADMAP (header bump + P-48 status flip to ✅ DONE-AND-VERIFIED if Phase-4 PASS, or ✅ DEPLOYED-PHASE-4-PENDING if Phase-4 deferred; (a.90) closes + new (a.91) opens for either W#2 graduation prep OR P-43 mechanical prevention small fix per director's 2026-05-24-f directive sequence) + CHAT_REGISTRY (header bump — 156th Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header + new §Entry capturing the implementation + Phase-4 verdict) + NEXT_SESSION (rewritten for whichever next-next task per director's directive sequence) + HANDOFF_PROTOCOL (header bump only) + CLAUDE_CODE_STARTER (header bump only) + COMPETITION_SCRAPING_DESIGN.md §B 2026-05-25 → §B 2026-05-26 for the Session 2 implementation entry capturing the build commit + Phase-4 verdict + the canonical now-complete diagnostic-then-implementation lifecycle exemplar.

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** any picker that fires — surface the recommended path + default to it if director defers.

**Schema-change-in-flight flag:** STAYS **NO** at session start AND at session end (no `prisma db push`; pure extension dep + ~10 LOC + new test cases).

---

## Pre-session notes (offline steps for director between sessions)

**Network Panel walkthrough (NEW 2026-05-25 — Director's mid-session message *"i can't do any testing right now so add that to the next session and wrap up no"* deferred this to here):**

This 5-minute walkthrough on your Mac BEFORE next session lets Session 2 land the fix immediately instead of starting with another diagnostic round. The single most important observation is whether the seek bar shows a real total duration or shows "∞" / "Live" / "-:--" — that confirms or refutes the missing-duration hypothesis directly.

**Setup (one time):**

1. Open Chrome on your Mac → navigate to vklf.com → log in if needed.
2. Pick any Project that has a Competition Data URL with a saved screen recording (P-45 capture).
3. Open the URL detail page that has the video card you want to test.
4. Open Chrome DevTools — right-click anywhere on the page → "Inspect" → click the "Network" tab at the top of DevTools.
5. In the Network tab, click the small gear icon (settings) → make sure "Disable cache" is CHECKED (so we see fresh fetches, not cached chunks).
6. Click the "Clear" icon (the ⊘ symbol) at the top-left of the Network tab to clear any prior entries.

**Reload + observe (the critical seek-bar observation):**

7. Reload the page (Cmd+R). The video card loads + the video element appears. DO NOT click play yet.
8. Look at the video element's seek bar (the horizontal bar at the bottom of the video). **The SINGLE most important observation:** does the seek bar show a real total duration to the right of the playhead (e.g., "0:00 / 0:42")? Or does it show "∞" / "Live" / "-:--" / nothing-to-the-right-of-playhead?
9. If it shows "∞" / "Live" / "-:--" / nothing → that DIRECTLY confirms the missing-duration root cause from Session 1. Session 2's fix will resolve this. If it shows a real total duration → that PARTIALLY refutes the root cause (the missing-duration limitation is intermittent; some browsers / playback paths can compute duration on the fly from the seekable range; this would mean Session 2 needs broader scope than just the duration-metadata patch).

**Network panel observation (during playback):**

10. With DevTools Network tab still open, click play on the video.
11. Watch the Network tab — you should see a row appear for the webm file (Type: `media` or filename ends in `.webm`).
12. Click that row → click the "Headers" sub-tab → look for:
    - `accept-ranges: bytes` (confirms Supabase Storage supports byte-range fetches — Session 1 already confirmed this via curl, but worth double-checking from Chrome's perspective).
    - The `range` request header (in Request Headers) — confirms Chrome IS using range fetches.
    - `content-length` (in Response Headers) — total file size.
13. Click the "Timing" sub-tab → look for the "Waiting (TTFB)" + "Content Download" timings. If "Content Download" is consistently larger than the video's actual duration (e.g., 8 seconds to download a 5-second video), the bottleneck IS network throughput; if Content Download is fast (1-2 seconds for a 5-second video) but you still see stutter, the bottleneck is decode-side, not network-side.
14. Try clicking "Pause" mid-playback, then "Play" again. Watch the Network tab — you should see additional range fetches as Chrome scrubs to the new playhead position. If those range fetches all complete cleanly with 206 Partial Content responses, the delivery layer is healthy.

**QuickTime save-and-replay isolation test:**

15. Right-click on the video element → "Save Video As..." → save the webm file to your Desktop. Open the saved file in QuickTime Player (or VLC if QuickTime can't open webm — VLC is more lenient with webm files). Does QuickTime show a real total duration? Does playback in QuickTime stutter the same way it does on vklf.com? If QuickTime stutters too → the issue is the file itself (missing-duration causes the same issue in any player that does pre-buffer-planning math). If QuickTime plays smoothly → the issue is something specific to the vklf.com playback environment + the missing-duration metadata together (the player on vklf.com may be more sensitive to the missing duration than QuickTime is).

**Reply with whatever you observe** — the seek bar reading from step 8 is the single most important data point. The Network panel observations from steps 10-14 are confirmatory; the QuickTime test in step 15 is the cleanest isolation test (file alone vs. file + vklf.com player together).

If you don't get to the walkthrough before next session, Session 2 still proceeds — but I'd start by either (a) waiting for you to run it live during the session, or (b) shipping the fix speculatively based on the strong empirical evidence already collected (capture-side ruled out, delivery-side ruled out, missing duration metadata confirmed via ffprobe on every webm file). Per `feedback_recommendation_style.md` most-thorough/reliable, option (b) is the recommended path since Session 1's ffprobe evidence is already empirically conclusive — the walkthrough would just provide an additional confirmation layer from director's Chrome environment.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking the P-48 Session 2 implementation session at all — can happen any time. Director-independent.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`). Standard build + deploy + ff-merge session.

**Rule 9 triggers planned this session: ONE** — deploy push to `origin/main` for Session 2's build commit (the ~10 LOC fix-webm-duration injection in `record-controller.ts` + new test cases + the lockfile change from `npm install fix-webm-duration`).

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits an alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any build mechanics.

---

## Why this pointer was written this way (debug aid)

Today's session was the **P-48 Session 1 Diagnostic** — pure `ffprobe`-first diagnostic on 3 production SCREEN_RECORDING webm files + curl-HEAD tests on the Supabase Storage delivery layer. The pre-Session-1 hypothesis ("uncapped MediaRecorder bitrate") was empirically falsified within the first ~20 minutes of probing actual production artifacts — the 2.5 Mbps cap was already shipped in `record-controller.ts:42` and the actual files came in at 0.50 / 1.35 / 0.67 Mbps. The real root cause is mechanical (missing EBML duration tag in MediaRecorder-produced WebM container headers — a canonical Chrome MediaRecorder limitation documented across MDN + WebRTC samples + browser bug trackers), the fix is mechanical (a well-known 3 KB library `fix-webm-duration` from yusitnikov exists exactly for this; MIT licensed; no transitive deps), and Session 2 is a small predictable build + deploy.

The natural next-session task per (a.90) RECOMMENDED-NEXT is **P-48 Session 2 (Implementation) on `workflow-2-competition-scraping`** — first item in director's 2026-05-24-f directive sequence to "fix all things remaining for competition scraping" before W#2 graduation. The fix is scoped + predictable + small + reversible (if the library has an unexpected edge case, the error path in step 6 falls through to emitting the unpatched blob).

- **(Recommended)** P-48 Session 2 (Implementation) — `npm install fix-webm-duration` in the extension workspace + ~10 LOC patch in `record-controller.ts` post-stop / pre-`onStopped` + new test cases in `record-controller.test.ts` + /scoreboard + /deploy + ping-pong + fresh extension zip + Phase-4 real-Chrome verification on NEW recordings. Recommended because (a) follows director's verbatim 2026-05-24-f directive locking the sequence; (b) Session 1's empirical diagnosis locks the fix path; (c) small + scoped + reversible + same workstream as Session 1; (d) per the W4 deploy + W4 fix-forward 2026-05-24-f Pattern, Phase-4 fix-forward in-session resolves cleanly when issues match the UI-only + scoped criteria.

The shape of the P-48 Session 2 implementation session is **plain-terms summary + pre-build reads + branch state verify + Rule 14f session-start confirmation + npm install fix-webm-duration + edit record-controller.ts + extend record-controller.test.ts + /scoreboard + Rule 9 deploy gate + ff-merge + Vercel auto-redeploy + /scoreboard post-merge + ping-pong + fresh extension zip + director Phase-4 real-Chrome verification + end-of-session doc-batch + 4 pushes**.

**After P-48 Session 2 ships,** next-next sessions step through P-43 mechanical prevention small fix → P-26 below-fold scroll evaluation → P-27 re-evaluation → W#2 graduation step → THEN STOP AND EXPLICITLY ASK director for next round of competition-scraping additions per director's verbatim 2026-05-24-f directive: *"We will be adding more things to competition scraping once the pending things are finished and I want you to explicitly ask me to give you the next round of additions once all remaining things are done."*

**Alternate next-session candidates if director shifts priorities at session start:**

- **Skip Session 2 implementation + go directly to P-43 mechanical prevention.** NOT recommended — P-48 is the first item in director's locked sequence; P-43 comes after P-48 closes. Can happen after P-48 closes.
- **P-26 below-fold scroll capture evaluation.** NOT recommended this session — P-26 is the LOW alternate that comes AFTER P-43. May get dropped after re-evaluation since current two-captures workaround works fine.
- **P-27 Bug #9 + Bug #15 re-evaluation.** NOT recommended this session — likely obsolete after P-46 redesigns (which closed 2026-05-24-f). Re-evaluate after P-26.
- **W#2 graduation step.** NOT recommended UNTIL all polish items DONE-AND-VERIFIED. Currently 3 items left after P-48 ships (P-43 + P-26 + P-27).
- **Bundle Session 2 with a Network panel verification of the duration-metadata hypothesis BEFORE the fix lands.** NOT recommended — Session 1's ffprobe evidence is already empirically conclusive (every file shows `Duration: N/A` per ffprobe; `format.duration: NOPTS` per EBML deep-probe). Additional confirmation from Chrome's perspective via the Network panel walkthrough (preserved verbatim above in ## Pre-session notes) is a director-side action that can happen between sessions if director chooses; it's not a blocker.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.

Check `ROADMAP.md` for the canonical state. Check the REVISED P-48 polish-backlog entry for the binding Session 2 scope-and-where description. Check `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-25 (today's diagnostic findings entry) + `docs/CORRECTIONS_LOG.md` §Entry 2026-05-25 (today's closing §Entry with the NEW reusable Pattern memorialization) for the canonical Session 1 diagnostic record.
