# Next session

**Written:** 2026-05-24-c (`session_2026-05-24-c_p46-workstream-5-session-1-extension-url-form-additions-and-reviews-modal-polish` — end-of-session handoff after **W#2 polish P-46 Workstream 5 Session 1 (Extension URL save form additions — Type / Description-1 / Description-2 / Price fields) ✅ DONE-AT-CODE-LEVEL 2026-05-24-c on `workflow-2-competition-scraping` via build commit `3c981be` (4 files +225/-0) + opportunistic Reviews modal idempotency polish ✅ DONE-AT-CODE-LEVEL 2026-05-24-c via build commit `41172f1` (1 file +9/-1)**). Pure CODE session on `workflow-2-competition-scraping`; NEITHER commit pushed to main (W5 deploy DEFERRED at director request); 2 build commits sit on workflow branch awaiting future W5 deploy session. **W#4 Phase-4 director real-Chrome verification deferred a second consecutive session at director directive** — full 10-step verification walkthrough preserved verbatim below in ## Standing carry-overs section so the next session can copy + execute it without re-deriving. **TWO §4 Step 1c forced-pickers fired** — session-start (director shifted from W4 Phase-4 verify to P-46 W5 Recommended) + end-of-session next-session scope (director picked P-47 Shadow DOM refactor Session 1 Recommended). **Schema-change-in-flight flag STAYS NO** — no `prisma db push`; W5 consumes already-deployed W1 schema; Reviews modal polish is React-component-only. Pre-deploy + post-polish /scoreboard both 5/5 GREEN at new baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / **786 src/lib +3 from baseline 783** / **62 routes UNCHANGED**); Check 6 Playwright SKIPPED per non-deploy-session convention. **Closes (a.85) RECOMMENDED-NEXT = P-46 Workstream 5 Session 1 build (opened + closed today)**; **(a.84) RECOMMENDED-NEXT = P-46 W4 Phase-4 verification STAYS OPEN** (deferred a second consecutive session — standing carry-over); **opens (a.86) RECOMMENDED-NEXT = P-47 Shadow DOM refactor Session 1** on `workflow-2-competition-scraping`.

---

## What we did this session (in plain terms)

Today was a **scope-shift session**. The original launch-prompt task was the P-46 Workstream 4 Phase-4 director real-Chrome verification on vklf.com. At session-start, director deferred that task again and chose to "work on next item on roadmap" instead. A clarifying picker resolved to **P-46 Workstream 5 (Recommended)** — the extension URL save form additions per §C.5. The W5 Session 1 build landed cleanly. Then, while scanning the Reviews surface for opportunistic cosmetic polish, a real correctness bug surfaced — the `CapturedReviewAddModal` clientId was being regenerated on every Save click, which defeated the server-side P2002 dedup on retries. That got prioritized over the cosmetic candidates and shipped today too.

What happened, in plain terms:

- **Session-start picker shifted scope.** Director deferred today's planned task (W4 Phase-4 verify) and asked to work on the next roadmap item. A clarifying picker offered P-46 W5 (Recommended) over P-47 Shadow DOM refactor + P-43 mechanical prevention candidate. Director picked W5.
- **W5 Session 1 build landed cleanly.** Build commit `3c981be` (4 files +225/-0) added Type / Description-1 / Description-2 / Price fields to the extension URL save form via a new `makeTextareaField()` helper alongside the existing `makeField()` helper. The POST `/api/projects/[projectId]/competition-scraping/urls` handler allowlist + `CreateCompetitorUrlRequest` wire type both extended additively. 3 new node:test cases brought src/lib from 783 to 786. All 5 scoreboard checks GREEN at new baselines (root tsc clean / ext tsc clean / 558 ext UNCHANGED / 786 src/lib +3 / 62 routes UNCHANGED). Check 6 Playwright SKIPPED per non-deploy-session convention.
- **§C.5 file-list inconsistency surfaced + captured informationally.** §C.5 listed `extensions/competition-scraping/src/entrypoints/popup/components/UrlAddForm.tsx` as a file W5 would touch — that file DOES NOT EXIST in the repo. The popup components directory contains other forms (CapturedTextPasteForm + CapturedVideoPasteForm + ColorSwatchPopover + HighlightTermsManager + PlatformPicker + ProjectPicker + RegionScreenshotModeButton) but no `UrlAddForm.tsx`. The URL-add form lives ONLY in the content-script at `src/lib/content-script/url-add-form.ts`. One-less-file simplification; no scope reduction; §C.5 stays frozen per Rule 18.
- **Opportunistic Reviews modal idempotency polish landed.** While scanning the Reviews surface for cosmetic UX polish (focus order, chip preview, placeholder text), a real correctness bug surfaced: `CapturedReviewAddModal.tsx` was inlining `clientId: crypto.randomUUID()` in `handleSubmit`, which regenerated a new UUID on every Save click. The server-side P2002 dedup in `url-reviews.ts` correctly rejected duplicate clientIds — but the modal was generating new ones, so each retry-after-error appeared as a new submission. Fix: hoisted clientId to a `useState` seeded per modal-open + reset on close via a `useEffect`. Build commit `41172f1` (1 file +9/-1). All 5 scoreboard checks GREEN at unchanged baselines (no new tests — server-side dedup already covered in url-reviews.test.ts).
- **NEW reusable Pattern memorialized.** The Reviews polish surface led to the new pattern: **"Opportunistic-polish-during-build-session — when scanning a related surface for polish, real bugs may surface alongside cosmetic candidates; prioritize real bugs."** Captured in CORRECTIONS_LOG §Entry 2026-05-24-c + design doc §B 2026-05-24-c.
- **End-of-session picker chose next-session scope.** Director's free-text "Other" answer: *"for the next session, defer any real world testing items that I need to do. instead work on the next item on our road map for workflow#2"*. Follow-up picker offered P-47 Shadow DOM refactor Session 1 (Recommended) + P-26 below-fold scroll capture + P-43 mechanical prevention. Director picked P-47.
- **THREE deferred items captured for next session.** W4 Phase-4 real-Chrome verification (carried from start of session — second consecutive defer) + W5 deploy session (NEW today — 2 build commits sit unpushed-to-main) + W5 Phase-4 real-Chrome verification (NEW today — pairs with W5 deploy defer). All destinations preserved verbatim in ## Standing carry-overs section below.
- **Schema-change-in-flight flag STAYS NO** the entire session. No `prisma db push`. W5 consumes the already-deployed W1 schema (live since W1's 2026-05-24 + deployed since W2's 2026-05-23-c); Reviews modal polish is React-component-only.

**The session landed cleanly through scope-shift + opportunistic-polish + verbatim-preservation of carry-overs.** No top-tier slips; no fix-forwards; no Rule 9 gates fired; ONE end-of-session push planned to `origin/workflow-2-competition-scraping` carrying 3 commits.

## What we'll do next session (in plain terms)

Next session is the **P-47 Shadow DOM refactor Session 1** — refactor the content-script video-capture form's mounting strategy from the 80-event-listener band-aid shipped in P-45 Build #2 (commit `ee8c79d`) to proper Shadow DOM isolation.

What the P-47 Session 1 covers:

- **Refactor `extensions/competition-scraping/src/lib/content-script/video-capture-form.ts`.** Currently the form mounts a backdrop div + content div directly into `document.body`. The refactor changes the mount strategy to a single `<div>` host element with `attachShadow({mode:'open'})` and renders the form inside the shadow root instead. Events don't bubble out of a Shadow DOM into the page DOM by default, so the page-level isolation becomes structural rather than per-listener.
- **Refactor `extensions/competition-scraping/src/lib/content-script/styles.ts`.** All `.plos-cs-form-*` CSS rules need to be injected inside the shadow root via a `<style>` tag (shadow DOM doesn't inherit page styles). Either inline the styles inside the shadow root at mount time, or import them as a string and inject. Most-thorough/reliable per `feedback_recommendation_style.md` is the inline-at-mount approach (no separate string-import indirection).
- **Remove the 80-event-listener band-aid.** Once Shadow DOM isolation works, the 20-events × 4-inputs = 80-listeners-per-form-open isolation in `video-capture-form.ts` can be deleted. Memorialize the deletion in the §B entry so the band-aid → Shadow DOM transition is traceable in git history.
- **No popup-form changes.** Popup forms (CapturedVideoPasteForm + CapturedTextPasteForm + the missing UrlAddForm) are already isolated since the popup is a separate document context. P-47 is content-script-only.
- **Empirical verification:** load the fresh extension .crx in Chrome on Amazon (where Issue 2's focus-stealing originally surfaced); confirm the form opens + accepts input + saves without any page-level focus interference. Empirical equivalent verification of the band-aid's behavior. Walk through other platforms (Ebay / Walmart / Etsy / Aliexpress / Macys / Bestbuy) at director's discretion — Amazon is the canonical verification target since that's where Issue 2 surfaced.
- **End-of-session doc-batch** covers the standard 7 Group A docs + 1 Group B doc (likely `docs/COMPETITION_SCRAPING_DESIGN.md` for the Shadow DOM refactor narrative since this is extension structural; alternatively or additionally `docs/COMPETITION_DATA_V2_DESIGN.md` if any cross-references land — TBD by session shape).

**Schema-change-in-flight flag** STAYS **NO** at the P-47 Session 1 start (no schema work in P-47 at all; pure content-script DOM mount refactor).

**After P-47 ships,** the standing carry-overs (W4 Phase-4 verify + W5 deploy + W5 Phase-4 verify) remain queued. Director may pick them up in any order in subsequent sessions; the verbatim walkthroughs preserved below ensure no re-derivation overhead when they do.

## What's still left on the total roadmap (in plain terms)

As of session-end 2026-05-24-c (P-46 W5 Session 1 ✅ DONE-AT-CODE-LEVEL; W5 deploy + W4 Phase-4 verify + W5 Phase-4 verify all deferred; P-47 NEXT):

- **P-47 Shadow DOM refactor Session 1** (NEXT). ~1 session of ~2-3 estimated. Pure content-script structural refactor of `video-capture-form.ts` mount strategy + style injection inside shadow root + removal of the 80-event-listener band-aid.
- **Standing carry-over: P-46 W4 Phase-4 verification session.** Deferred a second consecutive session at director's request. 1 session when director is ready for real-world testing. The 10-step walkthrough is preserved verbatim in ## Standing carry-overs section below.
- **Standing carry-over: P-46 W5 deploy session.** 2 build commits sit on `workflow-2-competition-scraping` awaiting ff-merge to main + Vercel auto-redeploy + fresh extension .crx zip. 1 session when director is ready for real-world testing.
- **Standing carry-over: P-46 W5 Phase-4 verification session.** Pairs with W5 deploy. ~1 session.
- **P-46 Workstream 5 Session 2 (optional polish — TBD).** §C.5 estimate was 1-2 sessions; W5 Session 1 today covered the user-visible scope after the popup-form file simplification. Session 2 may be redundant; director picks at next W5 deploy session whether to scope additional W5 work before deploy.
- **P-26 below-fold scroll capture (LOW).** ~1-2 sessions. Current two-captures workaround works fine.
- **P-27 Bug #9 (Amazon hover-preview deeper-walk) + Bug #15 (Ebay native-controls quirk) — DEFERRED LOW.** May be obsolete now that P-46 redesigned the URL detail page + Competition Data table surfaces they live in.
- **P-43 mechanical prevention candidate (LOW informational).** Add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md` (specifically Check 5's `npm run build` + route-count grep), not just the extension-rooted Checks 2-3. Not blocking any workstream.
- **W#2 graduation** after P-46 + P-47 + P-26 ship + standing carry-overs all close. Then W#3-W#14 (twelve more workflows on the roadmap; none started yet).
- **Optional offline step (any time, NOT blocking):** raise the Supabase Global File Size Limit to enable bucket-level 100 MB cap on `competition-scraping-videos`. Director-independent.

---

**For:** the next Claude Code session — **P-47 Shadow DOM refactor Session 1** (estimated ~60-120 min: pre-build doc reads ~5-10 min + branch state verify ~2 min + Rule 14f session-start picker ~2 min + content-script refactor ~30-60 min + style injection ~10-20 min + band-aid removal ~5-10 min + empirical Chrome verification ~10-20 min + end-of-session doc-batch ~15-20 min). Per Rule 23 Change Impact Audit: **STRUCTURAL REFACTOR + EXTENSION-ONLY** (DOM mount strategy change inside the content script + CSS rule re-injection inside shadow root + deletion of 80-event-listener band-aid; no new schema; no new routes; no new dependencies). **Schema-change-in-flight flag stays NO** (no transition; no schema work in P-47 at all). **Rule 9 triggers planned this session: ZERO** (pure code session; no push to main). **Pushes planned per `feedback_approval_scope_per_decision_unit.md`:** 1 minimum (end-of-session push to `origin/workflow-2-competition-scraping` carrying P-47 build commit + this doc-batch).

---

## Status of today's session

**W#2 polish P-46 Workstream 5 Session 1 (Extension URL save form additions — Type / Description-1 / Description-2 / Price fields) ✅ DONE-AT-CODE-LEVEL 2026-05-24-c on `workflow-2-competition-scraping` via build commit `3c981be` (4 files +225/-0) + opportunistic Reviews modal idempotency polish ✅ DONE-AT-CODE-LEVEL 2026-05-24-c via build commit `41172f1` (1 file +9/-1)**. Pure CODE session; NEITHER commit pushed to main (W5 deploy DEFERRED at director request).

**Session shape (CODE SESSION — single-branch; ZERO Rule 9 gates; TWO §4 Step 1c forced-pickers; ONE push planned):**

- Pre-build reads at session start (read `docs/COMPETITION_DATA_V2_DESIGN.md` §C.5 + ROADMAP P-46 entry + relevant extension content-script file).
- Rule 14f session-start picker FIRED — director deferred W4 Phase-4 verify + picked P-46 W5 (Recommended) via clarifying picker.
- W5 Session 1 build landed via `3c981be` (4 files +225/-0).
- /scoreboard after W5 build — 5/5 GREEN at new baselines (786 src/lib +3).
- Opportunistic Reviews polish scan → real correctness bug surfaced → fixed via `41172f1` (1 file +9/-1).
- /scoreboard after polish — 5/5 GREEN at unchanged baselines.
- End-of-session §4 Step 1c picker FIRED — director picked P-47 Shadow DOM refactor Session 1 (Recommended).
- End-of-session doc-batch covers the 8-doc bundle (ROADMAP + CHAT_REGISTRY + DOCUMENT_MANIFEST + CORRECTIONS_LOG with new §Entry 2026-05-24-c + HANDOFF_PROTOCOL + CLAUDE_CODE_STARTER + this NEXT_SESSION + the new §B 2026-05-24-c entry on COMPETITION_DATA_V2_DESIGN.md).
- ONE push this session: end-of-session push of build commits `3c981be` + `41172f1` + today's doc-batch together to `origin/workflow-2-competition-scraping` (operationally adjacent; NO Rule 9 gate fired — no destructive operations this session, no main push).

**§4 Step 1c forced-picker FIRED TWICE** — both pickers resolved per `feedback_recommendation_style.md` to most-thorough/reliable Recommended options.

**THREE DEFERRED items captured for next session at end-of-session sweep (Rule 26):**

- **Task #1** `DEFERRED: P-46 W4 Phase-4 real-Chrome verification` — carried from start of session (originally deferred 2026-05-26; deferred again today; second consecutive defer)
- **Task #11** `DEFERRED: P-46 W5 deploy session` — NEW today (2 build commits sit unpushed-to-main; deploy when director ready for real-world testing again)
- **Task #12** `DEFERRED: P-46 W5 Phase-4 real-Chrome verification` — NEW today (pairs with W5 deploy defer)

All three destinations captured verbatim in ## Standing carry-overs section below. Tasks #2-#10 all completed in-session.

**ONE NEW INFORMATIONAL CORRECTIONS_LOG §Entry 2026-05-24-c** — the P-46 Workstream 5 Session 1 + Reviews modal polish closing §Entry capturing §C.5 file-list inconsistency observation + NEW Pattern "Opportunistic-polish-during-build-session" + director double-defer informational calibration data point.

**TWENTY-NINTH end-of-session run under the Rule 30 + §4 Step 4b template** (sequence prior to today: 2026-05-21-b → 2026-05-21-c → 2026-05-21-d → 2026-05-22 → 2026-05-22-b → 2026-05-21 → 2026-05-22-c → 2026-05-22-d → 2026-05-22-e → 2026-05-22-f → 2026-05-22-g → 2026-05-22-h → 2026-05-22-i → 2026-05-23 → 2026-05-24 → 2026-05-25 → 2026-05-26 → 2026-05-27 → 2026-05-28 → 2026-05-23-b → 2026-05-23-c → 2026-05-23-d → 2026-05-23-e → 2026-05-23-f → 2026-05-24 → 2026-05-24-b → 2026-05-25 → 2026-05-26 → today 2026-05-24-c). The 3 plain-terms sections above + the parent's Personalized Handoff continue carrying the 3 mandatory plain-terms sections at the top per director's standing 2026-05-21 directive.

---

## Branch

**`workflow-2-competition-scraping`** — entered at start of next session; the P-47 Shadow DOM refactor Session 1 begins here. The `./resume` script (or `./resume-workflow 2`) will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` at today's end-of-session doc-batch commit. `main` is BEHIND by 3 commits (today's 2 build commits + today's doc-batch). Verify with `git log main..HEAD --oneline` showing 3 commits ahead (NOT zero this time, unlike yesterday's pointer expectation where both branches were even at the deploy SHA). The W5 deploy has NOT happened — next session does NOT deploy unless director decides to bundle a W5 deploy with the P-47 session (NOT recommended; deploys are their own sessions per the "Multi-session workstream deploy gate timing" Pattern).

---

## Launch prompt

Read `docs/CLAUDE_CODE_STARTER.md` and follow every rule in it. **As Step 7b says (NEW 2026-05-21), produce the plain-terms summary of what this session will do BEFORE I give go-ahead.** Today's task:

**W#2 polish P-47 Shadow DOM refactor Session 1, on `workflow-2-competition-scraping`.** Closes **(a.86) RECOMMENDED-NEXT**. Pure-code structural refactor session — replaces the 80-event-listener band-aid shipped in P-45 Build #2 (commit `ee8c79d`, 2026-05-22-i) with proper Shadow DOM isolation in the content-script video-capture-form mount strategy.

CODE session — ZERO Rule 9 gates planned. No new schema work. No new npm dependencies. No main push. Pure refactor of existing extension content-script code.

Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director. Verify both branches' SHA relationships with `git log main..HEAD --oneline` — should show 3 commits ahead (today's 2 build commits + today's doc-batch; main is BEHIND because W5 deploy was deferred).

**Per HANDOFF_PROTOCOL Rule 21 + Rule 22 — Pre-build read list:**

- `docs/CLAUDE_CODE_STARTER.md` (mandatory start-of-session; Step 7b plain-terms summary REQUIRED before any heavy reads or refactor).
- `docs/ROADMAP.md` lines 1-30 (header) + the **P-47 polish-backlog entry** (line ~237 — the canonical scope-and-where description with file paths + severity + rationale + cross-references to P-45 Build #2's Issue 2 fix narrative) + the P-46 polish-backlog entry's WS#5 status flip (so you're aware W5 is DONE-AT-CODE-LEVEL pending deploy).
- `extensions/competition-scraping/src/lib/content-script/video-capture-form.ts` (the file being refactored — current mount strategy + the 80-event-listener band-aid that gets deleted as part of the refactor).
- `extensions/competition-scraping/src/lib/content-script/styles.ts` (all `.plos-cs-form-*` CSS rules that need to be injected inside the shadow root).
- `docs/HANDOFF_PROTOCOL.md` Rule 14f (will fire at most ONCE at session-start to confirm P-47 Session 1 scope) + Rule 18 (Group B design docs append-only) + Rule 21 + Rule 22 (pre-build read list) + Rule 23 (Change Impact Audit — STRUCTURAL REFACTOR + EXTENSION-ONLY) + Rule 25 (Multi-Workflow — workflow-2 only; no main push) + Rule 26 (DEFERRED items registry — three standing carry-overs already captured below; do NOT delete; carry them through to next session) + Rule 27 (Playwright — TBD per session scope) + Rule 30 (Session bookends) + §4 Step 4b extended template.
- `feedback_approval_scope_per_decision_unit.md` (push count + ping-pong pattern; will not apply to main this session — pure workflow branch session).
- The P-45 Build #2 closing §Entry 2026-05-22-i in CORRECTIONS_LOG (the Issue 2 fix that shipped the band-aid; P-47 closes the band-aid by replacing it with Shadow DOM isolation).
- Optionally: `docs/COMPETITION_SCRAPING_DESIGN.md` for content-script architecture context (if the design doc has Shadow DOM precedent or guidance; unlikely since P-47 is the first Shadow DOM mount in the extension).

**Task shape (P-47 Shadow DOM refactor Session 1):**

1. **Plain-terms session-start summary per Rule 30** BEFORE any heavy reads or refactor. Cover: what we'll do in the session (Shadow DOM refactor of content-script video-capture-form mount + style injection inside shadow root + deletion of 80-event-listener band-aid + empirical Chrome verification on Amazon), schema-change-in-flight flag stays NO, ZERO Rule 9 gates planned.

2. **Pre-build reads** — execute the pre-build read list above. ~5-10 minutes.

3. **Branch state verify** — `git branch --show-current` (should be `workflow-2-competition-scraping`) + `git log main..HEAD --oneline` (should show 3 commits — today's 2 build commits + today's doc-batch; main is BEHIND because W5 deploy was deferred).

4. **Rule 14f session-start confirmation** — confirm P-47 Session 1 scope is the right scope this session. Per `feedback_recommendation_style.md` recommended path is proceed-to-refactor with full Shadow DOM + style-injection + band-aid-deletion bundle. Director picks; if director shifts scope, fire clarifying picker between standing carry-overs (W4 Phase-4 verify / W5 deploy / W5 Phase-4 verify) per `feedback_recommendation_style.md`.

5. **Shadow DOM refactor of `video-capture-form.ts`:** convert the current `document.body`-mounted backdrop+content divs to a single host `<div>` with `attachShadow({mode:'open'})` + render the form inside the shadow root. Preserve all existing form behavior — field rendering, save handlers, region-screenshot interaction, etc. The mount strategy changes; the form contents don't.

6. **Style injection inside shadow root:** create a `<style>` tag inside the shadow root + inject all `.plos-cs-form-*` CSS rules from `styles.ts`. Most-thorough/reliable per `feedback_recommendation_style.md` is inline-at-mount (import the CSS rules as a string from `styles.ts` and inject inside the shadow root). Alternative: duplicate the rules inline in `video-capture-form.ts` (NOT recommended — drift risk).

7. **Delete the 80-event-listener band-aid.** Once Shadow DOM isolation works, the 20-events × 4-inputs = 80-listeners-per-form-open isolation in `video-capture-form.ts` can be deleted. Verify with empirical Chrome test on Amazon (the platform where Issue 2 surfaced) that focus-stealing does not reproduce with the band-aid removed + Shadow DOM in place.

8. **Empirical Chrome verification.** Build a fresh extension zip; load in Chrome on Amazon; trigger the video-capture form; confirm: form opens cleanly + accepts input + saves cleanly + no page-level focus interference. Walk through Ebay / Walmart / Etsy / Aliexpress / Macys / Bestbuy at director's discretion (Amazon is canonical since that's where Issue 2 surfaced; cross-platform verification optional but recommended).

9. **/scoreboard verification** at session-end. Expected 5/5 GREEN at unchanged baselines (no new tests for a structural refactor; existing tests should pass). Check 6 Playwright may apply if the refactor changes any extension Playwright spec assertions; likely SKIPPED.

10. **End-of-session doc-batch** covers ROADMAP (header bump + P-47 entry status flip to ✅ DONE-AT-CODE-LEVEL 2026-05-XX OR ✅ DONE-AND-VERIFIED 2026-05-XX based on empirical-Chrome outcome) + CHAT_REGISTRY (header bump — 152nd Claude Code session) + DOCUMENT_MANIFEST (header bump) + CORRECTIONS_LOG (header bump + new §Entry capturing the refactor outcome + any new reusable Patterns surfaced — likely "Shadow DOM mount refactor of content-script form for page-level isolation without per-event listener band-aid") + NEXT_SESSION.md (rewritten for next-session task per session-end forced-picker outcome) + HANDOFF_PROTOCOL (header bump only — no new rules expected) + CLAUDE_CODE_STARTER (header bump only) + Group B doc per session scope (likely `docs/COMPETITION_SCRAPING_DESIGN.md` for the Shadow DOM refactor narrative; alternatively or additionally `docs/COMPETITION_DATA_V2_DESIGN.md` if any cross-references land). The standing carry-overs section (W4 Phase-4 verify + W5 deploy + W5 Phase-4 verify) must carry forward unchanged into the next NEXT_SESSION.md.

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** any picker that fires — surface the recommended path + default to it if director defers.

**Per Rule 14a tightening from 2026-05-24:** if any aspect of the Shadow DOM refactor feels under-specified in the P-47 polish-backlog entry, surface the gap to director via Rule 14f picker BEFORE the code change lands.

**Schema-change-in-flight flag:** STAYS **NO** (no schema work in P-47 at all; pure content-script DOM mount refactor).

---

## Standing carry-overs (deferred real-world testing)

The following three real-world-testing items are deferred at director's request. They carry forward across sessions until director picks them up. Each is preserved verbatim below so any future session can copy + execute without re-deriving the verification mechanics.

### (a) P-46 Workstream 4 Phase-4 director real-Chrome verification

**Status:** DEFERRED a second consecutive session (originally deferred 2026-05-26 W4 deploy session; re-deferred 2026-05-24-c today at director directive *"defer any real world testing items that I need to do"*).

**Pre-flight setup:**

- Open Chrome on Mac.
- Open vklf.com.
- Sign in if needed.
- Pick any one Project in your Project list — the W4 page is per-Project not per-platform, so cross-platform exception applies (pick any single Project rather than walking all 7 platforms).

**Step 1 — Navigate from Competition Data to the new Comprehensive Competitor Analysis page.**

Click into the chosen Project. Navigate to Competition Data (`/projects/<projectId>/competition-scraping`). Confirm you see the redesigned Competition Data page from the W3 deploy 2026-05-24 — horizontal `ColumnVisibilityBar` at the top combining platform filters + per-column show/hide toggles + click-to-edit cells + 17 columns + sticky table header + per-row "↗" Open button + drag-to-reorder rows + font-size stepper in the table toolbar. **Above the ColumnVisibilityBar at the top of the page**, look for a standalone "→ Comprehensive Competitor Analysis" navigation button row. **Click that button.** Expected: navigation to `/projects/<projectId>/competition-scraping/comprehensive-analysis/`. **Verify:** the URL bar shows the new path + the page loads without 404 or 501 error.

**Step 2 — Confirm initial page state (empty or existing content).**

The new Comprehensive Competitor Analysis page should load. If you've never written anything for this Project, you'll see an empty-state placeholder (something like "No analysis yet — click Edit to begin"). If you have written content before (which is unlikely for a fresh deploy but possible if any earlier session test-saved content), the existing rich-text content will render in read mode. **Verify:** the page renders cleanly, with a "← Competition Data" back-button visible at the top + an "Edit" toggle button somewhere on the page (likely top-right or top of the editor surface) + a last-edited timestamp footer at the bottom (the timestamp will be blank or show "Never" if the page is empty; otherwise it shows the last write time).

**Step 3 — Toggle into edit mode.**

Click the "Edit" button. Expected: the page transitions from read-mode to edit-mode. The static rendered content is replaced by an editable TipTap rich-text editor with a toolbar at the top. The toolbar should show (per §A.5 + W4 S1's variant='full' toolbar): H1 / H2 / H3 heading buttons + Bold + Italic + Underline + bullet-list + numbered-list + Link + Code block + the new **"Link to URL"** dropdown picker (added in W4 S2). The "Edit" button should now be a "Done" button. **Verify:** the editor mounts without errors + the toolbar shows all expected affordances + cursor lands in the editor surface ready for typing.

**Step 4 — Type body content.**

Click into the editor body. Type a short test paragraph: e.g., **"This is a test comprehensive analysis. Key competitors include the following:"** + press Enter. Now apply some formatting: select the word "Key" + click the Bold button + select "competitors" + click the Italic button. Make a heading: press Enter to start a new line + click the H2 button + type **"Key competitor URLs"** + press Enter. **Verify:** the typed text appears in real-time + Bold + Italic styling applies as expected + H2 heading renders larger than body text.

**Step 5 — Insert an internal hyperlink via the "Link to URL" toolbar dropdown.**

On a fresh line, click the **"Link to URL"** dropdown button in the toolbar. Expected: a dropdown panel opens showing a list of URLs from the current Project's competitor URL list (the same URLs that appear as rows in the Competition Data table). A search box at the top of the dropdown lets you filter case-insensitively. **Type a few characters** of a URL's product name OR seller name OR raw URL — the list filters live as you type. **Click any URL row** in the filtered list. Expected: the dropdown closes + a hyperlink is inserted at your cursor position. The hyperlink's visible text is a sensible default (product name OR seller name OR raw URL, depending on what's available). The hyperlink is styled in **blue underlined text** + has a small **🔗 emoji prefix** in front of it. **Verify:** all of the above + the cursor lands just after the inserted hyperlink ready for more typing.

**Step 6 — Toggle Done (transition to read mode).**

Click the "Done" button (the same button that was "Edit" before). Expected: the page transitions back from edit-mode to read-mode. The editor is replaced by a static rich-text rendering of the same content + the last-edited timestamp at the bottom of the page updates to the current time. **Verify:** the content you just typed renders cleanly in read mode (Bold + Italic + H2 all visually distinct + the 🔗 emoji prefix is still in front of the hyperlink + the hyperlink is still blue underlined).

**Step 7 — Click the rendered hyperlink.**

In read mode, click the rendered hyperlink (the one with the 🔗 emoji prefix). Expected: navigation to the matching URL detail page at `/projects/<projectId>/competition-scraping/url/<urlId>/`. The URL detail page shows the per-URL detail surface from the W2 deploy 2026-05-23-c (with the W2 Session 5 structural fields + Scraping Status toggle + bidirectional mirror with the Competition Data table's Status column). **Verify:** navigation works + the URL detail page loads + the URL detail surface shows the correct URL (the one you clicked).

**Step 8 — Navigate back via the back-button.**

On the URL detail page, click the "← Competition Data" back-button at the top of the page (this is the existing W2 affordance). Expected: navigation back to the Competition Data page (`/projects/<projectId>/competition-scraping`). Now click the standalone "→ Comprehensive Competitor Analysis" button again. Expected: you land back on the new W4 page (`/projects/<projectId>/competition-scraping/comprehensive-analysis/`) + your test content from Steps 4-5 is still there in read mode (because it was saved automatically when you clicked Done in Step 6).

**Step 9 — Toggle into edit mode one more time + verify the editor mounts.**

Click "Edit" again. Expected: editor mounts cleanly + your existing test content is loaded into the editor as editable rich-text + the hyperlink with the 🔗 emoji prefix is still styled correctly + clicking inside the hyperlink shows the standard TipTap Link mark interaction (edit/remove the link). Now click "Done" again without making any changes. Expected: page returns to read mode + the last-edited timestamp at the bottom of the page should update to the current time (since clicking Done triggers a save lifecycle even if no content changed — confirm this updates on every Done click OR document if it doesn't).

**Step 10 — Test the in-line `#url/<urlId>` shorthand syntax (advanced; optional).**

This step tests the "manual shorthand entry" path (the alternative to using the toolbar Link-to-URL picker). Click "Edit" one more time. On a fresh line in the editor, type literally: **the hash character followed by the word url followed by a slash followed by any valid urlId from the URL list, then press space**. Expected: the editor should recognize the shorthand pattern + the typed text should auto-convert to a hyperlink (via the same UrlReferenceExtension that handles the click interception). The result should look identical to the hyperlink you inserted via the picker in Step 5 (blue underlined + 🔗 emoji prefix). **Verify:** this auto-conversion works AND clicking the auto-created hyperlink (after toggling Done) navigates correctly per Step 7. If auto-conversion does NOT happen, that's a known limitation per §C.4's specification — the click interception works on `#url/<urlId>` hrefs regardless of HOW the href was inserted; the toolbar picker is the primary insertion affordance. Document the outcome either way.

**How to report back:**

For each step (1-10), tell Claude in plain language: PASS / FAIL / PARTIAL. If FAIL or PARTIAL, describe what you saw vs. what was expected. Screenshots or pasted observations are welcome. Claude will collate the report + either close W4 as ✅ DONE-AND-VERIFIED (if all 10 PASS) or initiate a fix-forward cascade (if any FAIL or PARTIAL).

**Cross-platform note:** the new Comprehensive Competitor Analysis page is per-Project, not per-platform. Pick any single platform (Amazon OR Ebay OR Walmart OR Etsy OR Aliexpress OR Macys OR Bestbuy) for the verification — there's no need to walk all 7 platforms since the page does not vary by platform.

### (b) P-46 Workstream 5 deploy session

**Status:** DEFERRED at director request 2026-05-24-c. 2 build commits sit on `workflow-2-competition-scraping` awaiting ff-merge to main + Vercel auto-redeploy + fresh extension .crx zip.

**Build commits to deploy:**
- `3c981be` — W#2 polish P-46 Workstream 5 Session 1 — extension URL add form additions (Type/Description-1/Description-2/Price) — 4 files +225/-0
- `41172f1` — W#2 polish P-46 Workstream 5 polish — fix CapturedReviewAddModal clientId idempotency bug — 1 file +9/-1

**Deploy session shape (mirrors the W2 + W3 + W4 deploy patterns):**

1. Pre-deploy /scoreboard on `workflow-2-competition-scraping` — verify 5/5 GREEN at expected baselines (root tsc clean / ext tsc clean / 558 ext / 786 src/lib / 62 routes). Check 6 Playwright — per Rule 27 picker, likely RUN since the ff-merge bundle contains `extensions/` source files (the W5 extension URL save form additions) — director picks RUN vs SKIP based on whether Playwright spec coverage exists for the extension URL save form.
2. Rule 9 gate moment — ONE Rule 9 picker fires for the deploy push to main. Per `feedback_recommendation_style.md` recommended path is "Deploy now — push to origin/main (recommended)".
3. `git push origin main` executes; main fast-forwards from `096a2ac` to the W5 doc-batch SHA carrying the 2 build commits + any in-between doc-batch commits.
4. Vercel auto-redeploy fires (~2-3 minute build + cache invalidation). Optionally: build a fresh extension .crx zip via `npm run build` in `extensions/competition-scraping/` + zip the dist/ output (matches the existing `plos-extension-*.zip` filename pattern at repo root).
5. Post-merge /scoreboard on `main` — verify 5/5 GREEN at same baselines.
6. Phase-4 director real-Chrome verification — either runs in-session (per the W3 deploy 2026-05-24 Pattern) OR deferred to next session (per the W4 deploy 2026-05-26 Pattern). Director picks at deploy time.
7. End-of-session doc-batch + ping-pong sync + end-of-session ff-merge push to `origin/main` for doc-batch.

**Recommended deploy session timing:** AFTER P-47 Shadow DOM refactor ships (since P-47 is content-script-only + does not touch the W5 URL save form). Alternatively: bundle W5 deploy + P-47 deploy together if P-47 lands cleanly + director wants one deploy session covering both — but the "Multi-session workstream deploy gate timing" Pattern recommends one deploy per workstream for traceability.

### (c) P-46 Workstream 5 Phase-4 director real-Chrome verification

**Status:** DEFERRED at director request 2026-05-24-c. Pairs with W5 deploy — runs either in-session (during W5 deploy session) or as its own session (per the W4 deferred-Phase-4 Pattern).

**Pre-flight setup:**

- Open Chrome on Mac.
- Confirm the fresh extension .crx is loaded (manually unpack the latest `plos-extension-2026-05-XX-*.zip` from the repo root into `chrome://extensions/` → "Load unpacked" → pick the dist/ directory).
- Open any one competitor platform (Amazon / Ebay / Walmart / Etsy / Aliexpress / Macys / Bestbuy) — pick the platform with the most-frequent existing URL captures for highest-signal verification.
- Sign in to vklf.com if needed.

**Step 1 — Open the extension URL save form on a competitor page.**

Navigate to a product page on the chosen platform (e.g., an Amazon product page). Trigger the extension's URL save flow — likely via the extension popup OR a content-script affordance per the existing URL save form interaction. **Verify:** the URL save form opens cleanly + shows the existing fields (URL / Platform / Brand Name / Sponsored Ad / etc.) **AND** shows the FOUR new fields between Brand Name + Sponsored Ad: **Type** / **Description-1** / **Description-2** / **Price**. The new fields render as textareas (per `makeTextareaField()` helper from W5 Session 1) with appropriate labels + placeholder hints.

**Step 2 — Fill in the four new fields + save.**

Type sensible test values into each new field: e.g., **Type:** "Product" / **Description-1:** "Test description 1" / **Description-2:** "Test description 2" / **Price:** "$29.99". Fill in the other required fields as usual. **Click Save.** **Verify:** the form submits without error + the URL save flow completes successfully (existing UX — likely a toast notification or form-closes-on-success).

**Step 3 — Confirm the row lands on vklf.com with all 4 new fields populated.**

Open vklf.com → navigate to the Project's Competition Data page (`/projects/<projectId>/competition-scraping`). Find the row for the URL you just saved. **Verify:** the row shows the 4 new fields populated with the values you typed in Step 2. The Type / Description-1 / Description-2 / Price columns should all render the test values. If the Type / Description columns are hidden by default, use the ColumnVisibilityBar to show them.

**Step 4 — Optional: test Reviews modal duplicate-Save behavior to confirm idempotency fix works end-to-end.**

Navigate to a URL detail page (`/projects/<projectId>/competition-scraping/url/<urlId>`). Click "Add Review" to open the `CapturedReviewAddModal`. Fill in a test review (1-5 stars + body + optional reviewer name + date). **Click Save TWICE in rapid succession** (or click Save → wait for error → click Save again). **Verify:** ONLY ONE review row lands in the URL's reviews list (the server-side P2002 dedup now correctly recognizes the duplicate clientId since the modal hoisted clientId to a `useState` instead of regenerating on every Save click).

**How to report back:**

For each step (1-4), tell Claude in plain language: PASS / FAIL / PARTIAL. If FAIL or PARTIAL, describe what you saw vs. what was expected. Screenshots or pasted observations are welcome. Claude will collate the report + either close W5 as ✅ DONE-AND-VERIFIED (if all PASS) or initiate a fix-forward cascade (if any FAIL or PARTIAL).

**Cross-platform note:** the URL save form additions are per-extension not per-platform, so cross-platform exception applies (pick any single platform). Optionally walk the other platforms at director's discretion.

---

## Pre-session notes (offline steps for director between sessions)

**Required offline step BEFORE the next P-47 Shadow DOM refactor Session 1:** none. P-47 is pure-code; director's involvement is just the standard go-ahead after the Step 7b plain-terms summary + the empirical Chrome verification on Amazon after the refactor lands.

**Standing optional offline step (NOT blocking — standing carry-over):** raise the Supabase Global File Size Limit to enable the bucket-level 100 MB cap on `competition-scraping-videos`. Step-by-step (unchanged from prior handoffs):

1. Open the Supabase dashboard at https://app.supabase.com → sign in if needed → pick the PLOS project.
2. **Storage** tab → **Settings** sub-tab.
3. **Global File Size Limit** → raise to **≥ 100 MB**.
4. Save.
5. EITHER re-run `node scripts/create-competition-scraping-videos-bucket.mjs` to update the bucket's `fileSizeLimit` (the script is idempotent), OR edit the bucket directly via the Supabase Storage UI → bucket settings → file size limit → set to 100 MB.

Not blocking the P-47 Shadow DOM refactor Session 1 at all — can happen any time. Director-independent.

**Optional offline reading for director:** the P-47 polish-backlog entry in ROADMAP.md (~line 237 — the canonical scope-and-where description with file paths + severity + rationale + cross-references to P-45 Build #2's Issue 2 fix narrative). ~3-minute skim.

**Pre-session setup (informational — Claude will handle in-session):** the P-47 Shadow DOM refactor Session 1 begins on `workflow-2-competition-scraping`; director's involvement is the standard go-ahead after Step 7b plain-terms summary + the empirical Chrome verification on Amazon after the refactor lands.

---

## Destructive-operation safety check for next session

**Rule 8 triggers planned this session: ZERO** — no destructive git operations planned (no rebases, no force pushes, no `git reset --hard`, no `git branch -D`). The P-47 refactor is additive code change on `workflow-2-competition-scraping`.

**Rule 9 triggers planned this session: ZERO** — no `git push origin main` planned. P-47 Session 1 is a pure code session; deploy would happen in a later session bundling P-47 + W5 deploy (or separately).

**NO Rule 29 (container-level destructive op) triggers planned** this session. NO Codespaces rebuild planned. Claude's memory directory + `.codespace-backup/memory/` mirror both remain intact. Critical files safe. **Layer-3b mirror-staleness canary active since 2026-05-22-f.** If at session-start the canary emits an alert (file count differs, presence differs, or any per-file size differs between source and mirror), STOP and investigate before any refactor work.

---

## Why this pointer was written this way (debug aid)

Today's session was a **scope-shift session** — original launch-prompt task (W4 Phase-4 verify) was deferred at session-start; director chose to work on the next roadmap item. A clarifying picker resolved to P-46 W5 (Recommended), the extension URL save form additions. The W5 Session 1 build landed cleanly; an opportunistic Reviews modal polish surfaced + landed alongside (the new "Opportunistic-polish-during-build-session" Pattern memorialized). At end-of-session, director directed deferring all real-world testing items for next session + working on the next code-only roadmap item. A follow-up picker resolved to **P-47 Shadow DOM refactor Session 1 (Recommended)** over P-26 below-fold scroll capture + P-43 mechanical prevention candidate.

The natural next-session task per (a.86) RECOMMENDED-NEXT is **P-47 Shadow DOM refactor Session 1** — pure-code structural refactor of the content-script video-capture-form mount strategy from the 80-event-listener band-aid (shipped in P-45 Build #2 commit `ee8c79d` 2026-05-22-i) to proper Shadow DOM isolation. The P-47 polish-backlog entry has the full scope-and-where description; refactor it as specified.

- **(Recommended)** P-47 Shadow DOM refactor Session 1 — pure-code structural refactor. Recommended because (a) director explicitly picked this at the end-of-session picker; (b) it's pure-code (matches director's directive "defer real-world testing items"); (c) the band-aid → Shadow DOM transition is cleanest as a single bundled refactor; (d) low-risk since the band-aid works empirically and the refactor is structural.

The shape of the P-47 Session 1 session is **branch-state verify + Rule 14f confirmation + Shadow DOM refactor + style injection + band-aid deletion + empirical Chrome verification + end-of-session doc-batch + 1 push to workflow branch**.

**After P-47 ships,** the three standing carry-overs (W4 Phase-4 verify + W5 deploy + W5 Phase-4 verify) remain queued. Director may pick them up in any order in subsequent sessions; the verbatim walkthroughs preserved above in ## Standing carry-overs ensure no re-derivation overhead when they do.

**Alternate next-session candidates if director shifts priorities at session start:**

- **Pick up W4 Phase-4 verification** from ## Standing carry-overs section (a). NOT recommended unless director is ready for real-world testing — director explicitly deferred this at end-of-session. The 10-step walkthrough is preserved verbatim above for copy + execute when director is ready.
- **Pick up W5 deploy session** from ## Standing carry-overs section (b). NOT recommended unless director is ready for real-world testing — director explicitly deferred this at end-of-session. The deploy session shape is described above for execute when director is ready.
- **Pick up W5 Phase-4 verification** (after W5 deploy lands) from ## Standing carry-overs section (c). NOT recommended this session since W5 deploy hasn't happened yet. The 4-step walkthrough is preserved verbatim above for copy + execute when director is ready.
- **P-26 below-fold scroll capture (LOW).** NOT recommended — was the second-place option at end-of-session picker; P-47 was picked first; P-26 can happen any time after P-47.
- **P-43 mechanical prevention candidate.** NOT recommended — was the third-place option at end-of-session picker; LOW informational; not blocking any workstream; can happen any time.
- **Raise Supabase Global File Size Limit (standing optional offline step).** Director's offline dashboard step — see Pre-session notes above. Not a Claude session task; can happen any time. Director-independent.

Check `ROADMAP.md` for the canonical state. Check the P-47 polish-backlog entry at line ~237 for the binding scope-and-where description. Check `docs/COMPETITION_DATA_V2_DESIGN.md` §C.5 for W5 Session 1's binding context (which this session consumed).
