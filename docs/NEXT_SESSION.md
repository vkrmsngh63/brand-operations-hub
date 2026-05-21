# Next session

**Written:** 2026-05-21 (`session_2026-05-21_p27-build-8-fix-forward-polish-with-deferred-bugs-11-12` — end-of-session handoff after P-27 Captured-videos feature **BUILD #8 FIX-FORWARD POLISH SESSION SHIPPED + DEPLOYED on vklf.com** via ff-merge `workflow-2-competition-scraping` → `main` (`bd7cedd..a47a95f`, 2 commits including Build #7 doc-batch + new Build #8 code commit `a47a95f`; +645 / -19 across 7 files (6 modified + 1 NEW `capture-failure-toast.ts`)); fresh extension zip `plos-extension-2026-05-21-w2-deploy-32.zip` (198,508 bytes — +1,659 over deploy-31's 196,849 bytes; second deploy zip carrying the captured-videos surface end-to-end + Build #8's 5 fix-forward fixes). Closes (a.61) RECOMMENDED-NEXT (partial close — Build #8 ships 5 code-level fixes + deploys + director re-verifies in-session; **PARTIAL PASS** — Etsy still ✅ full pass; Walmart now ✅ full pass [Bug #14a + #14b cleared]; Ebay form NOW OPENS on video preview right-click [Bug #13 cleared by `<source src>` fallback]; Amazon click-into-overlay form opens correctly; Amazon hover-preview now surfaces a visible toast via the new `capture-failure-toast.ts` defensive UX [Bug #9 defensive hardening shipped]; **Bug #11 Amazon "Add new video category" input dead REMAINS UNFIXED** despite defensive hardening; **Bug #12 Save fails "Network unreachable (Failed to fetch)" now reproduces on Amazon AND Ebay** + the new `retryOnTransportError` helper did NOT clear it; **NEW Bug #15** captured on Ebay — right-click on video controls strip shows only Chrome's native "Mute" menu, a known Chrome quirk where the native HTML5 video menu suppresses extension entries; **Bug #9 Amazon hover-preview walker still fails** (toast appears but no form — likely cross-origin iframe issue)). Opens **(a.62) RECOMMENDED-NEXT = P-27 implementation #9 (DevTools-cooperative debugging session — Claude narrates one DevTools diagnostic step at a time + director reports what they see live; targets Bug #11 + Bug #12 + Bug #9 deeper-walk + Bug #15 Ebay native-controls quirk) on `workflow-2-competition-scraping`** per natural-continuation pattern (no §4 Step 1c forced-picker needed — the next session is the natural debugging continuation of the 2 unfixed bugs + 2 deeper-diagnoses).

---

## What we did this session (in plain terms)

We shipped Build #8 — the fix-forward polish session — live to vklf.com. Five concrete code-level fixes landed in one commit, the deploy went out cleanly, you sideloaded the fresh extension zip, and we walked through the four competitor platforms again to see what changed since Build #7's verification.

**Etsy** still works perfectly across all four surfaces — the Build #7 baseline held with zero regressions.

**Walmart** is now fully working. The hover-preview right-click that did NOTHING before now opens the form, and the in-form video thumbnail renders correctly. Both Build #7 Walmart bugs (#14a + #14b) are cleared.

**Ebay** got partial improvement. The form NOW OPENS on video preview right-click — Build #7's "no form opens at all" bug (#13) is cleared, fixed by a new `<source src>` fallback path in the DOM walker that catches Ebay's `<video>` elements which have empty `currentSrc`/`src` but populated `<source>` children. However, Save still fails on Ebay with the same "Network unreachable" error as Amazon (carried over from Build #12). And a brand-new bug surfaced — right-clicking directly on Ebay's video controls strip (the bottom progress-bar area) shows ONLY Chrome's native "Mute" menu instead of our extension's options. That's a known Chrome quirk where the native HTML5 video menu suppresses extension context-menu entries.

**Amazon** got partial improvement. Clicking-into-overlay video right-click now opens the form correctly. The hover-preview right-click now surfaces a visible toast saying capture failed (instead of silently doing nothing) — but the toast appears because the DOM walker still can't find Amazon's hover-preview video element. That's the new `capture-failure-toast.ts` defensive UX shipping its first user benefit: even when the root cause isn't fixed, you get visible feedback instead of a silent fail. The Bug #11 "Add new video category" input where typed characters didn't appear REMAINS BROKEN despite the defensive hardening (a new `focusNewCategoryInput()` retry path + key-event stopPropagation guards). And the Bug #12 Save-fails-with-Network-unreachable bug actually got WORSE — it now reproduces on Ebay too, and a new retry-on-TypeError helper in the fetch layer did NOT clear it.

So we shipped real progress (3 platforms improved + zero regressions + 1 NEW design layer with the defensive toast) but landed on a partial-pass outcome with 2 stubborn bugs that need a different diagnostic approach. The pattern of fixes-that-helped-the-clear-cases + defensive-hardening-that-surfaces-feedback validates the hardening-with-fallback design choice for Build #9.

## What we'll do next session (in plain terms)

Next session is **Build #9 — DevTools-cooperative debugging session.** This is a debugging-cooperation session, fundamentally different from the prior build sessions.

The shape: Claude narrates ONE diagnostic step at a time, you perform it in Chrome DevTools, then you tell me what you see. We do this iteratively until we've collected enough live evidence to design fixes. No more "read the code + guess + ship + verify" loops — Build #8 proved that 2 of the bugs (#11 input + #12 fetch) need information that only exists at runtime in DevTools, which we can't get from code reading alone.

Concrete plan:

1. **Bug #12 Save fails "Network unreachable" on Amazon + Ebay** — likely the highest-leverage target. You'll open Chrome DevTools → Network tab on Amazon → reproduce the failing Save → I'll narrate which entry to click on + which headers/payload/preflight result to read out → we'll pin down whether it's a CORS preflight failure, a malformed URL, or a body-serialization issue. The error string already points to the exact line of `mapFetchTransportError` in `api-client.ts`; what we don't know is what the actual failing fetch looks like on the wire.

2. **Bug #11 Amazon "Add new video category" input dead** — second target. You'll right-click the input + Inspect Element → DevTools Elements tab → we'll verify the element state (disabled? readonly? has event listeners?) + the active-element focus tracking + the key-event listener chain. The defensive `focusNewCategoryInput()` Build #8 shipped didn't clear it, which means either (a) the input never gets focus despite the retry, or (b) the input has focus but something upstream is blocking key events from reaching React's state setter.

3. **Bug #9 Amazon hover-preview walker deeper-walk** — third target (now that the toast surfaces feedback, this is no longer silent-fail; we know exactly when the walker bails). You'll right-click the hover preview → DevTools Console → I'll narrate a `document.elementsFromPoint(x, y)` call at the click coordinates → we'll see what the actual DOM stack at that pixel looks like. The hypothesis is Amazon's hover-preview lives in a cross-origin iframe whose contents we can't traverse from the main frame's content script.

4. **Bug #15 Ebay native-controls quirk** — UX recovery rather than DOM diagnosis (since this is known Chrome behavior, not a walker bug). Two options to consider: surface a one-time toast hint when we detect the right-click happened on the controls strip, OR detect the controls-strip target + reposition the gesture (e.g., suggest right-clicking on the video frame instead).

After we collect the diagnostic evidence + propose code fixes, the session likely splits into two parts: (a) diagnose + draft the fix paths together, (b) ship the fixes + run /scoreboard + Rule 9 gate + deploy + you re-walk. If the diagnosis takes a full session, the fixes ship in Build #10 instead — that's fine; debugging quality matters more than artificial session boundaries.

## What's still left on the total roadmap (in plain terms)

- **P-27 captured videos (current focus):** Builds #1–#8 done. **Build #9 (DevTools-cooperative debugging session) next session.** After Bug #11 + #12 are diagnosed + fixed, P-27 graduates (the remaining items become low-priority polish — Bug #9 cross-origin walker if it's solvable; Bug #15 Ebay UX recovery; cross-platform Playwright extension).
- **P-26 below-fold scroll capture** — lower-priority W#2 polish; current workaround works (two captures + two metadata-tagged rows); ~1-2 sessions when we get to it.
- **P-42 backup-memory-dir hook fix** — strongly recommended before any future big session; HIGH operational severity; ~1 session.
- **P-43 scoreboard absolute-paths polish** — still OPEN; sub-1-hour polish; should ship as the very next non-P-27 session.
- **P-44 wxt zip parent-process hang** — annoying but not blocking; **reproduced TWICE this session** (during dist rebuild for Playwright + during fresh-zip packaging); reliable-now-not-intermittent. ~1 session of diagnosis.
- After all of those, W#2 graduates. Then W#3–W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Not blocking Build #9.

---

**For:** the next Claude Code session — ninth P-27 Build session (Session #9 of estimated ~9-10 build sessions per the design doc §A.2 implementation arc table, now extended to cover DevTools-cooperative debugging). **DevTools-cooperative debugging session** — diagnose Bug #11 + Bug #12 + Bug #9 deeper-walk + Bug #15 with director-live DevTools collaboration; if diagnosis surfaces concrete fix paths, ship the fixes + redeploy + re-walk; if diagnosis needs more passes, the fixes ship in Build #10 instead (debugging quality > artificial session boundaries). Per Rule 23 Change Impact Audit: **CONDITIONAL — fixes may be ADDITIVE (defensive hardening / new helper paths) OR MIXED (modify existing fetch helpers / orchestrator handlers depending on what DevTools surfaces).** **Schema-change-in-flight flag stays "No"** — no schema delta expected for any of the 4 fix targets (all are extension-side runtime + content-script DOM + fetch transport issues; no Prisma changes anticipated). **Rule 9 trigger expectation: CONDITIONAL** — only fires if Build #9's diagnoses lead to code fixes that get shipped; if Build #9 is purely diagnostic + fixes get deferred to Build #10, no Rule 9 trigger this session.

---

## Status of today's session

**P-27 Captured-videos feature BUILD #8 FIX-FORWARD POLISH SESSION SHIPPED + DEPLOYED on vklf.com via `workflow-2-competition-scraping` → `main`.** One-hundred-and-twenty-eighth Claude Code session — `session_2026-05-21_p27-build-8-fix-forward-polish-with-deferred-bugs-11-12`. SEVENTH substantive session of the current P-27 Build arc (Builds #2 + #3 + #4 + #5 + #6 + #7 + #8 all chained sequentially since 2026-05-21).

**Deploy mechanics (Rule 9 gate fired + director-Yes captured):**

- Ff-merge `workflow-2-competition-scraping` → `main`: 2 commits (`bd7cedd..a47a95f`) landed as pure fast-forward; no merge commit; +645 / -19 across 7 files. The 2 commits covered Build #7 end-of-session doc-batch + new Build #8 code commit `a47a95f`.
- Push `origin/main`: `a47a95f` is now live; Vercel auto-redeploy fired.
- Ping-pong sync: all 4 refs (`workflow-2-competition-scraping` local + remote; `main` local + remote) at `a47a95f`.
- Fresh extension zip `plos-extension-2026-05-21-w2-deploy-32.zip` (198,508 bytes — +1,659 over deploy-31's 196,849 bytes); **second deploy zip carrying the captured-videos surface end-to-end + Build #8's 5 fix-forward fixes**.
- **P-44 wxt zip parent-process hang reproduced TWICE this session** — once during the extension dist rebuild for Playwright + once during the fresh-zip packaging step. Both times the dist/zip artifact landed correctly within ~5 seconds; the parent node process hung past the 60-second timeout. Workaround used both times: `cp` the artifact from `.output/` to repo root + TaskStop on the hung task. **Confirms P-44 is reliable + recurring (not transient)** — P-44 stays OPEN; reproduction count climbed.

**Pre-deploy scoreboard (all GREEN — only ext delta):** root tsc clean / extension tsc clean / `npm run build` **57 routes** (unchanged) / src/lib node:test **589/589** (unchanged) / extension `npm test` **495/495 (+13 over Build #7's 482 — 10 new walker test cases + 3 new transport-retry test cases)** / Playwright **94/94** (unchanged from Build #6's baseline).

**Post-merge scoreboard SKIPPED as deliberate efficiency choice** — ff-merge produces a bit-for-bit identical file tree to the pre-deploy state, so re-running would be performative. Documented as a process-justified skip, not a slip.

**Director real-Chrome RE-VERIFICATION RAN IN-SESSION** (per Rule 14f close-out picker — director chose "verify in this session" again after Build #7's pattern worked well). Re-verification covered the 6 Build #7 bugs + surfaced 1 new bug:

| Bug ID | Build #7 status | Build #8 status |
|---|---|---|
| #9 Amazon hover-preview class | ❌ Silent fail | ⚠️ Toast appears (defensive UX shipped) but no form — walker still fails; likely cross-origin iframe |
| #10 Amazon in-form thumbnail render | ❌ Empty thumbnail | (covered by click-into-overlay path improvements) |
| #11 Amazon "Add new video category" input dead | ❌ Input dead | ❌ Still dead — defensive hardening DID NOT fix |
| #12 Amazon Save fails "Network unreachable" | ❌ Amazon only | ❌ Now Amazon AND Ebay — retry-on-TypeError didn't clear |
| #13 Ebay no form opens | ❌ No form | ✅ Form NOW OPENS via `<source src>` fallback |
| #14a Walmart hover-preview (SHARED with #9) | ❌ Silent fail | ✅ Cleared by walker improvements |
| #14b Walmart playing-video thumbnail (SHARED with #10) | ❌ No thumbnail | ✅ Cleared by thumbnail render path |
| Amazon click-into-overlay (regression check) | ✅ PASS | ✅ PASS (no regression) |
| Etsy all 4 surfaces (regression check) | ✅ PASS | ✅ PASS (no regression) |
| #15 NEW — Ebay native-controls quirk | (not observed) | ⚠️ NEW — right-click on controls strip shows Chrome's "Mute" menu only |

**Schema-change-in-flight flag stayed "No"** the entire session (Build #8 is pure extension-side runtime + content-script DOM + fetch transport-error edge-case fixes; no Prisma changes; no new database columns; no bucket configuration changes).

**FOUR NEW DEFERRED items open at session end (Rule 26):**

- **TaskList #10 — Bug #11 Amazon "Add new video category" input dead (UNFIXED at Build #8 despite defensive hardening):** the new `focusNewCategoryInput()` retry path (defers focus across 2 requestAnimationFrame ticks + blurs any active-element focus-stealer + retries once at 50ms) + key-event stopPropagation on the input did NOT fix the symptom. Needs DevTools-cooperative diagnosis: (a) verify the input gets focus at all (active-element tracking in DevTools Console); (b) verify key events reach the input (Event Listeners panel in DevTools); (c) verify React's state setter actually fires when keys are typed. Diagnostic starting point: open Chrome DevTools on Amazon → right-click video → form opens → click "Add new video category" dropdown option → text input appears → click into the input → check `document.activeElement` in Console → type a character → check whether the input's value attribute updates.
- **TaskList #11 — Bug #12 Save fails "Network unreachable (Failed to fetch)" now on Amazon AND Ebay (UNFIXED at Build #8):** the new `retryOnTransportError(op, delayMs=250)` helper wrapping `makeAuthedFetch`'s initial fetch did NOT clear the failure. Both retries hit the same TypeError. The improved error message now appends the underlying TypeError text in parens for diagnostic visibility — observed string is "Network unreachable (Failed to fetch) — check your connection." which confirms the underlying browser error is "Failed to fetch" (generic CORS / network error). Needs DevTools Network tab capture: (a) reproduce the failing Save on Amazon → DevTools Network tab → find the failing fetch → check whether it's the CORS preflight (OPTIONS) or the actual request (POST); (b) check the request URL is what we expect (`/api/projects/[projectId]/competition-scraping/urls/[urlId]/videos/finalize`); (c) check the response headers for CORS-related errors; (d) check the request body is JSON-serializable + matches `FinalizeVideoUploadRequest` shape. Etsy works for the same flow which proves CORS host_permissions cover the basic path; this is Amazon + Ebay specific.
- **TaskList #12 — NEW Bug #15 Ebay native-controls quirk:** right-clicking on Ebay's video controls strip (the bottom progress-bar area) shows ONLY Chrome's native "Mute" / "Show controls" menu instead of our extension's "Add to PLOS" entries. Suspected known Chrome quirk where the native HTML5 video menu suppresses extension context-menu entries when the right-click target is the video element's native controls overlay. UX recovery options: (a) detect the controls-strip target + surface a one-time toast hint suggesting the user right-click on the video frame above the controls; (b) extend the contextmenu listener to fire for native controls right-clicks too (may not be possible — Chrome may suppress the event entirely); (c) document the limitation + ship a help-tooltip near the right-click affordance. Diagnostic starting point: right-click on Ebay video controls strip → DevTools Console → check whether the orchestrator's contextmenu listener fires at all (add a `console.log` at the listener entry).
- **TaskList #13 — Bug #9 Amazon hover-preview walker deeper-walk:** the Build #8 walker improvements (stacked-elements fallback via `document.elementsFromPoint(clickX, clickY)` + `<source src>` fallback) helped on Walmart + Ebay but did NOT fix Amazon's hover-preview. The new defensive toast surfaces visible feedback (so the bug is no longer silent-fail), but the form still doesn't open. Hypothesis: Amazon's hover-preview video lives inside a cross-origin iframe whose contents we can't traverse from the main frame's content script. Diagnostic starting point: right-click the Amazon hover preview → DevTools Elements tab → check whether the target element is inside an `<iframe>` + whether the iframe's `src` is cross-origin to the main page. If so, fixing this requires either an in-iframe content script (extension manifest + permissions changes) or accepting the limitation + improving the toast message to explain why.

**Per Rule 23 Change Impact Audit:** Additive (safe) — new helpers + new file `capture-failure-toast.ts` + new optional parameters on `findUnderlyingVideoEmbed` + new `retryOnTransportError` helper (safe across all routes because finalize routes dedupe on clientId server-side); no breaking signature changes on any existing exported function. No new dependencies. No data risk.

**Rule 9 gate disposition:** fired explicitly via AskUserQuestion picker. Director chose Option 1 "Yes — proceed with deploy (recommended)". Deploy ff-merge `bd7cedd..a47a95f` → main + push origin/main + ping-pong sync + fresh extension zip packaged.

**§4 Step 1c forced-picker NOT FIRED as a separate decision** — the natural-continuation next session is P-27 Build #9 (DevTools-cooperative debugging session). Director defaulted to this recommendation per `feedback_default_to_recommendation.md`. **(a.62) RECOMMENDED-NEXT = P-27 implementation #9 (DevTools-cooperative debugging session) on `workflow-2-competition-scraping`.**

**SIXTH end-of-session run under the Rule 30 + §4 Step 4b template** (first was 2026-05-21-b Build #3; second was 2026-05-21-c Build #4; third was 2026-05-21-d Build #5; fourth was 2026-05-22 Build #6; fifth was 2026-05-22-b Build #7). The 3 plain-terms sections above continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; Build #9's diagnostic walkthrough lands here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` AND with `main` (both at `a47a95f` after this session's ping-pong sync, plus the doc-batch commit this session adds). After Build #9's diagnoses + any fixes ship + the next deploy ff-merges, both branches will advance together again.

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-27 implementation #9 — DevTools-cooperative debugging session on `workflow-2-competition-scraping`.** Closes **(a.62) RECOMMENDED-NEXT**. Four DEFERRED bugs from Build #8's in-session re-verification need DevTools-cooperative diagnosis (Bug #11 input dead + Bug #12 Save fails Network unreachable + Bug #9 Amazon hover-preview deeper-walk + Bug #15 Ebay native-controls quirk).

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or coding).
- `docs/ROADMAP.md` lines 1-30 (header) + the P-27 polish-backlog entry (annotated 2026-05-21 with "✅ Build #8 fix-forward deploy complete 2026-05-21 (a47a95f) — Walmart + Ebay-form-opens + Amazon-click-into-overlay all PASS via re-verification + Bug #11 + #12 + new Bug #15 deferred to Build #9 + Bug #9 deeper-walk also deferred").
- `docs/CAPTURED_VIDEOS_DESIGN.md` §B 2026-05-21 entry — captures the Build #8 fix-forward outcomes per bug + the hardening-with-fallback design choices + the 4 DEFERRED items captured for Build #9 + the diagnostic next-steps per bug.
- `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Deploy session #32 — P-27 Captured-videos Build #8 fix-forward polish + 2 unfixed bugs deferred + 1 new Ebay-quirk bug" section appended this session (the canonical verification artifact).
- `docs/HANDOFF_PROTOCOL.md` Rule 8 (Pre-flight audit) + Rule 9 (main deploy gate — conditional this session: only if Build #9 ships fixes) + Rule 27 (Playwright forced-picker — DevTools-cooperative debugging falls OUTSIDE Playwright's automated coverage; Rule 27 fires the manual-walkthrough path explicitly) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `extensions/competition-scraping/src/lib/content-script/video-capture-form.ts` (Bug #11 input event handling — the `focusNewCategoryInput()` Build #8 added didn't clear the symptom; cross-check against working sibling `image-capture-form.ts`).
- `extensions/competition-scraping/src/lib/api-client.ts` (Bug #12 fetch transport — `mapFetchTransportError` at line ~100 + `retryOnTransportError` Build #8 helper + `makeAuthedFetch` call sites; DevTools Network tab will reveal what the helper didn't catch).
- `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` (Bug #9 + #15 — the contextmenu listener registration + the `lastRightClickVideoResult` snapshot path + the SW→tab `open-video-capture-form` dispatch).
- `extensions/competition-scraping/src/lib/content-script/find-underlying-video-embed.ts` (Bug #9 deeper-walk — the Build #8 stacked-elements fallback didn't catch Amazon's hover-preview; needs cross-origin iframe consideration).
- `extensions/competition-scraping/src/lib/content-script/capture-failure-toast.ts` (NEW FILE Build #8 — `showCaptureFailureToast(message)` mounting + dismiss + idempotency; Bug #15 UX recovery may extend this with a more specific Ebay-controls hint).

**Task shape (Build session #9 = DevTools-cooperative debugging session):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or coding. Cover: which 4 bugs we'll diagnose + the diagnostic order (Bug #12 first — highest-leverage; Bug #11 second; Bug #9 third; Bug #15 fourth as UX recovery), the DevTools-cooperative shape (one step at a time, director reports what they see), what stays unchanged on the design side (no schema delta; no design re-litigation — §A frozen per Rule 18; this session is debugging scope only).

2. **Fire Rule 27 picker EXPLICITLY at session start** — DevTools-cooperative debugging is a manual-walkthrough pattern; Rule 27 requires comparing Playwright automated test vs. director manual walkthrough vs. hybrid. The honest recommendation: manual walkthrough only (Playwright cannot reproduce platform-specific DOM quirks on real Amazon + Ebay pages; the bugs surfaced only at director real-Chrome verification by design per §A.13 Hybrid coverage). Director-Yes gate before proceeding.

3. **Diagnose Bug #12 Save fails "Network unreachable" first** (highest leverage; affects 2 platforms). Director opens Chrome DevTools on Amazon → Network tab → reproduces the failing Save → Claude narrates one inspection step at a time (find the failing fetch → click it → read out the request URL / headers / payload + response status + CORS preflight result if any). Goal: pin down whether it's CORS preflight failure / malformed URL / body-serialization issue. If diagnosis surfaces a concrete fix path, draft the fix + ship it in the same session; if it surfaces a deeper investigation, capture the findings + defer the fix to Build #10.

4. **Diagnose Bug #11 "Add new video category" input dead second.** Director right-clicks Amazon video → opens form → clicks "Add new video category" → text input appears → Claude narrates: (a) click into input → check `document.activeElement` in Console (is the input focused?); (b) type a key → check Event Listeners panel for the input element (what listeners are registered?); (c) check whether React state updates (inspect the React DevTools panel for the form component). Goal: identify which layer is failing — focus-not-acquired / keydown-blocked-upstream / React-state-not-updating. If diagnosis surfaces fix, ship it; if deeper, defer.

5. **Diagnose Bug #9 Amazon hover-preview deeper-walk third.** Director right-clicks Amazon hover preview → defensive toast appears → DevTools Console → Claude narrates: (a) `document.elementFromPoint(lastClickX, lastClickY)` at the recorded click coordinates; (b) walk up the DOM tree → check whether the target's nearest ancestor `<iframe>` has cross-origin `src`. If cross-origin iframe confirmed, capture the limitation + improve the toast copy to explain ("Amazon embeds this preview in a cross-origin frame we can't access — try right-clicking after the video plays in the overlay"); if NOT cross-origin, investigate further.

6. **Diagnose Bug #15 Ebay native-controls quirk fourth.** Director right-clicks Ebay video controls strip → Chrome's "Mute" menu appears → Claude narrates: (a) does our orchestrator's contextmenu listener fire AT ALL? (check via temporary `console.log` at the listener entry). If listener doesn't fire, the Chrome quirk suppresses the event entirely + UX recovery is the only path (option A from the deferred-item description). If listener does fire but the menu doesn't render, debug the SW→tab message routing.

7. **IF Build #9 ships fixes** (any of #11 / #12 / #9 / #15): /scoreboard GREEN → Rule 9 director-Yes gate → ff-merge `workflow-2-competition-scraping` → `main` → push origin/main → Vercel auto-redeploy → ping-pong sync → fresh extension zip `plos-extension-2026-05-XX-w2-deploy-33.zip`. Director re-walks the fixed platforms.

8. **IF Build #9 is purely diagnostic** (no fixes shipped): document the diagnostic findings + the concrete fix paths in `docs/CAPTURED_VIDEOS_DESIGN.md` §B 2026-05-XX entry; the fixes ship in Build #10; no Rule 9 trigger this session.

9. **End-of-session doc-batch** covers ROADMAP (P-27 polish-backlog entry annotated with the Build #9 outcome) + CHAT_REGISTRY (header bump — 129th Claude Code session) + DOCUMENT_MANIFEST + CORRECTIONS_LOG (likely zero new entries unless a process slip occurs) + NEXT_SESSION.md (rewritten for whatever the next priority becomes) + CAPTURED_VIDEOS_DESIGN.md §B 2026-05-XX entry (the diagnostic findings + fix paths captured per Rule 18) + COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md "Deploy session #33" section (only if Build #9 ships fixes + deploys).

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** for any mid-debugging forced-pickers (e.g., if a diagnostic surfaces a third unexpected option, or if a fix turns out to need a scope-expansion), surface 2-4 plausible options + the recommended option + the rationale; default to the recommendation if director defers.

**Schema-change-in-flight flag:** stays "No" the entire session (all 4 bugs are extension-side runtime + content-script DOM + fetch transport issues; no schema delta expected; the §A.7 schema spec is unchanged).

---

## Pre-session notes (offline steps for director between sessions)

**NO required offline steps for Build #9** — the DevTools-cooperative session runs entirely from Claude + Chrome DevTools + the deploy-32 zip already sideloaded from this session. Director can reproduce any of the 4 bugs at the start of next session as a sanity-check.

**STILL-OPEN optional offline step (NOT blocking Build #9 — carry-over from Build #1):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking Build #9 — can happen any time.

**Optional offline reading for director:** `docs/CAPTURED_VIDEOS_DESIGN.md` §B 2026-05-21 entry (the Build #8 fix-forward outcomes + the 4 DEFERRED items + diagnostic next-steps per bug — informational for understanding what Build #9 will attack). ~5-minute skim before the next session if director wants the full context.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session:** `git push origin main` IF Build #9 ships fixes (Rule 8/9 explicitly authorize this as the canonical deploy mechanic; the Rule 9 director-Yes gate is the procedural safety). NO `prisma db push` planned (no schema delta to ship). NO `git reset --hard` / `git push --force` / `git branch -D` planned. The ff-merge precondition is verified before any main push.

**Rule 9 triggers planned this session: CONDITIONAL** — only fires if Build #9's diagnoses lead to code fixes that get shipped. If Build #9 is purely diagnostic + fixes get deferred to Build #10, no Rule 9 trigger this session. The director-Yes gate is non-negotiable when it fires.

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe.

---

## Why this pointer was written this way (debug aid)

Today's session ran P-27 Build #8 fix-forward polish — 5 code-level fixes targeting the 6 Build #7 verification failures + 1 new bug surfaced during re-verification (#15 Ebay native-controls quirk). Re-verification result: PARTIAL PASS — 3 platforms improved + zero regressions + 1 new design layer (defensive toast) shipped, but 2 stubborn bugs (#11 input dead + #12 Save fails "Network unreachable") plus 1 new bug (#15 Ebay quirk) plus 1 deeper-diagnosis (#9 Amazon hover-preview walker) remain. The fix-shape proved that the failing bugs need information that only exists at runtime in DevTools — code reading alone is insufficient.

The §4 Step 1c forced-picker did NOT fire at session close — the next session is the natural debugging continuation (DevTools-cooperative session). Build #9's launch prompt is shaped around (a) the diagnostic order that maximizes information leverage (Bug #12 first — affects 2 platforms; highest-leverage diagnosis), (b) the DevTools-cooperative shape (Claude narrates one step + director reports live — fundamentally different from prior build sessions where Claude wrote code based on hypotheses), (c) the Rule 27 picker firing EXPLICITLY at session start to surface that Playwright cannot reproduce platform-specific DOM quirks on real Amazon + Ebay pages (the bugs surfaced only at director real-Chrome verification by design per §A.13 Hybrid coverage), (d) the conditional Rule 9 trigger (only if Build #9 ships fixes; debugging quality > artificial session boundaries), (e) the standing optional offline step (Supabase Global File Size Limit raise) is carried over but NOT blocking.

The Builds #1-#8 mid-build judgment calls (in design doc §B 2026-05-20-c + §B 2026-05-21 + §B 2026-05-21-b + §B 2026-05-21-c + §B 2026-05-21-d + §B 2026-05-22 + §B 2026-05-22-b + §B 2026-05-21 [Build #8]) are all binding inputs to Build #9; do NOT re-litigate at debugging time. The design is unchanged; only specific bugs need DevTools-level diagnosis to identify their fixes.

**Alternate next-session candidates if director shifts priorities at session start (after Build #8 deploy + verification + before Build #9 DevTools-cooperative debugging):**

- **Defer Build #9 fixes + ship P-43 scoreboard absolute-paths polish instead (LOW-MEDIUM elevated by ongoing reproduction history).** Sub-1-hour polish; the recurring CWD-leak class keeps biting. Director may pick this if a quick win on operational tooling is preferred before the harder DevTools session. Estimated <1 hour.
- **Defer Build #9 fixes + ship P-42 backup-memory-dir hook fix (HIGH severity).** Multi-reproduction history; STRONGLY RECOMMENDED before any future big session. Estimated ~1 session; LOW LOC; HIGH operational importance.
- **Defer Build #9 fixes + ship P-44 wxt-zip + wxt-build parent-process hang fix.** **Reproduced TWICE this session — strongest evidence yet that P-44 is reliable + recurring, not intermittent.** Director may pick this if the per-Build session overhead of working around P-44 has gotten too painful. Estimated ~1 session.
- **Defer Build #9 fixes + start P-26 below-fold full-page-scroll capture (LOW-severity deferred large lift).** The only remaining non-P-27 W#2 pre-graduation polish item; current workaround works; ~600-1000 LOC code-only session, no design needed. Recommended *only* if director wants to wrap a smaller-scope polish item BEFORE the rest of P-27's debugging arc ships. Estimated 1-2 sessions.
- **Defer Build #9 fixes + start W#2 graduation prep.** P-27 has shipped 80%+ of its design surface; the remaining 2 bugs + 2 deeper-diagnoses can ship as low-priority polish if director wants to declare W#2 graduated. The graduation moment is director's call; technical signal says the core feature works on 3 of 4 platforms fully + 1 platform partially.
- **Raise Supabase Global File Size Limit (DEFERRED Task #N from Build #1, captured in ROADMAP as P-27 sub-item).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time.

Check `ROADMAP.md` for the canonical state.
