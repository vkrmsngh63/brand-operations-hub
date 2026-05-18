# Next session

**Written:** 2026-05-19-c — `session_2026-05-19-c_w2-main-deploy-sessions-21-22-23-24-p13-then-p38-p39-reverted-p40-shipped` (Claude Code; dual-branch — pre-deploy on `workflow-2-competition-scraping`, four ff-merge + deploy cycles on `main`, ping-pong syncs after each main push).

**For:** the next Claude Code session.

**Status of today's W#2 → main deploy sessions #21 + #22 + #23 + #24:** Today's session expanded from the originally-scoped P-13 ship into a four-deploy correction sequence as the director repeatedly clarified the actual UX intent. Final landed state on main: **P-13 (autofocus on popup's inline "+ Add new…" category input) ✅ SHIPPED + DEPLOYED + VERIFIED** (commit `e217eb9`, deploy session #21). **P-40 (popup auto-pre-select URL matching the active tab — "page-on-page-match") ✅ SHIPPED + DEPLOYED + VERIFIED** (commit `182da37`, deploy session #24). Two intermediate ships **REVERTED** as wrong-feature: P-38 popup 1-URL pre-select (commit `a0d5c8a` deploy session #22, reverted in `f0cef37`) + P-39 popup sticky most-recently-used URL preference (commit `2766031` deploy session #23, reverted in `b635ae7`). Both reverts went out as part of deploy session #24's main push (3 commits — 2 reverts + P-40). Three INFORMATIONAL / one severity-bump CORRECTIONS_LOG §Entries this session: (1) ROADMAP P-13 "Where" drift; (2) polish-item numbering collision (rendered moot by reverts but pattern still worth capturing); (3) **wrong-feature-shipped-twice slip — director's "popup did not autoselect the url" feedback meant "the URL matching the page I'm currently on," not generic "some URL"; my misreading produced P-38 + P-39 before the third attempt (P-40) finally landed the right fix.** P-40 uses the same `pickInitialUrl` + platform-module `canonicalProductUrl` pattern the content-script overlay has used since P-15 + P-21 — transplanted to the popup surface via `chrome.tabs.query({ active: true, currentWindow: true })`.

**Closes ROADMAP (a.45) RECOMMENDED-NEXT** — but as P-40 (active-tab-URL match), not as the originally-captured P-39 (sticky preference; reverted today as wrong-feature).

**(a.46) RECOMMENDED-NEXT = W#2 polish P-16 — extension service worker MV3 crash diagnostics on `workflow-2-competition-scraping`** via §4 Step 1c forced-picker. Rationale per `feedback_recommendation_style.md`: closes the only remaining open W#2 polish item with concrete code-level work; well-scoped diagnostic session; lowest risk vs. heavier alternatives (W#3 Therapeutic Strategy first session at ~90-150 min; W#2 Tool Graduation as a heavy multi-step ritual).

---

## Branch

**`workflow-2-competition-scraping`** — W#2 polish work, NOT platform-wide. The `./resume` script will switch you from `main` (where today's 2026-05-19-c sessions ended) → `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`, not `main`. If you're still on `main` after `./resume`, STOP and surface to director.

Expected branch state on entry: `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` AND exactly even with `origin/main`. Both branches at the same SHA after today's final ping-pong sync + the end-of-session doc-batch addendum push.

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**Ship P-16 — diagnose + fix extension service worker MV3 "went to a bad state unexpectedly" crash** on `workflow-2-competition-scraping` (ROADMAP W#2 polish backlog P-16 entry; new ROADMAP Active Tools (a.46) RECOMMENDED-NEXT). Goal: open the SW's own DevTools (via `chrome://extensions` → click "Inspect views: service worker" on the extension card) → find the real stack trace → wrap async `onMessage` handlers in try/catch + structured `sendResponse` on error → ensure Supabase auto-refresh failures are caught. Director observed the crash on laptop 2 during P3B-9 cross-device sign-in walkthrough — Chrome auto-restarts the SW so user-visible impact is intermittent (popup + context-menu remain functional after restart). Closes (a.46) RECOMMENDED-NEXT.

Branch is `workflow-2-competition-scraping`. Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Fix shape (per ROADMAP W#2 polish backlog P-16 entry; ~30-60 min):**

- Target file: `extensions/competition-scraping/src/entrypoints/background.ts`
- Suspected causes (per P-16 entry):
  1. Supabase auto-refresh-token loop fired during P3B-9's WiFi-off period + threw an unhandled promise rejection. MV3 SWs are stricter than persistent backgrounds about unhandled rejections.
  2. `chrome.runtime.onMessage` handlers hit an unhandled error in one of the session-4 async paths (`createCapturedText`, `listVocabularyEntries`, `createVocabularyEntry`) when the network was offline.
- Fix shape:
  1. Wrap each async onMessage handler's body in try/catch.
  2. On catch, send structured `sendResponse({ ok: false, error: { message: String(err) } })` so the popup-side gets a clean error rather than silence.
  3. Ensure Supabase auto-refresh failures are caught (Supabase swallows refresh errors internally, but the MV3 SW may surface them via unhandled-rejection paths — add a global `self.addEventListener('unhandledrejection', ...)` that logs to console.error but doesn't re-throw).

**Diagnosis steps before coding (these may change the fix shape):**

1. Reproduce the crash if possible: on laptop 2 or any test device, sign in to extension, toggle WiFi off, click some popup button that triggers an authenticated request, toggle WiFi back on, repeat. If the SW crashes, observe the stack trace.
2. If the crash doesn't reproduce: read all chrome.runtime.onMessage handlers in `background.ts` (and any other entrypoints under `src/entrypoints/`) and identify ones with `async (message, sender, sendResponse)` shape that lack try/catch. Those are the candidate fixes.
3. Surface to director if the SW DevTools stack trace differs from the suspected causes above — the fix shape may need to be revised.

**Test coverage decision (Rule 27 forced-picker at session start):**

- (A) Node:test cases on the onMessage handler shape if the refactor introduces a testable seam (e.g., extract a `safeHandle(handler)` helper that wraps + catches; test that exceptions become structured error responses). Estimated +3-5 cases.
- (B) Director's manual diagnosis-and-verify session — no automated test. Sideload after fix, exercise the suspected crash paths (offline + retry), confirm SW survives.
- (C) Hybrid — write the safeHandle helper test cases AND have director re-verify the crash-no-longer-fires path on real laptop 2.
- (D) Escape hatch.

Per `feedback_recommendation_style.md` (most thorough/reliable), Option (C) is the right pick — code-level regression coverage on the wrapper logic + director real-laptop verification on the actual crash class.

**Pre-deploy verification scoreboard targets (expected baselines from today's deploy session #24 post-state):**

- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npx tsc --noEmit` clean
- `npm run build` clean — **53 routes** (unchanged; no new routes)
- `src/lib` node:test: **527/527** unchanged (P-16 is extension-only)
- Extension `npm test`: **352/352** baseline + new safeHandle cases if Option A/C picked (~355-357 expected)
- Playwright: **75/75** unchanged

**Deploy mechanics (cheat-sheet b — standard W#2 → main deploy):** unchanged. Pre-deploy scoreboard → rebase if main moved → ff-merge → post-merge scoreboard → Rule 9 gate → push main → ping-pong sync → fresh extension build → director sideload + manual verification.

**Per Rule 23 Change Impact Audit (pre-classify before code):** ADDITIVE — pure defensive error-handling polish; zero schema; zero API; zero shared-types. The structured error response shape may need a shared-types update if popup-side caller code expects a specific contract; surface at session start.

**Group A docs to update at end-of-session:** ROADMAP (header + (a.46) → flip ✅ DONE + new (a.47) RECOMMENDED-NEXT — likely W#2 Tool Graduation per §4 Step 2 Scenario B since P-16 closes the LAST open W#2 polish item, OR W#3 Therapeutic Strategy first session per Rule 18; settle via §4 Step 1c forced-picker); CHAT_REGISTRY; DOCUMENT_MANIFEST; CORRECTIONS_LOG (header bump + any new entries); NEXT_SESSION (rewritten for the next pick).

**Group B docs to update at end-of-session:** COMPETITION_SCRAPING_VERIFICATION_BACKLOG (new Deploy session #25 entry + P-16 flipped ✅ DONE); COMPETITION_SCRAPING_DESIGN may not need a §B entry (defensive polish doesn't change design intent).

**Schema-change-in-flight flag:** stays "No" for this entire session.

Start by running the mandatory start-of-session sequence.

**Pre-build read list (in addition to mandatory start-of-session sequence):**

- `extensions/competition-scraping/src/entrypoints/background.ts` — find all `chrome.runtime.onMessage.addListener` handlers + their async paths.
- `extensions/competition-scraping/src/lib/supabase.ts` — review auto-refresh-token flow + check whether refresh errors are caught.
- ROADMAP W#2 polish backlog P-16 entry — full root-cause + fix-shape narrative.

## Pre-session notes (optional, offline steps to do between sessions)

If you can: try reproducing the SW crash on a test device. Sign in to extension, toggle WiFi off, click around the popup. If you observe the crash, screenshot the chrome://extensions error message + stack trace for the next session. Even a partial stack trace narrows the diagnosis considerably. If you can't reproduce, that's fine — Option B/C fallback (defensive try/catch wrap + speculative fix) still works.

## Why this pointer was written this way (debug aid)

Today's session was complex. Originally scoped to ship P-13 (autofocus on popup's inline category input — a 1 LOC fix). During P-13 verification, director surfaced natural-use feedback about the popup's URL dropdown not auto-selecting. I (Claude) interpreted this as a generic "auto-select something" feature request and shipped P-38 (1-URL pre-select) + P-39 (sticky most-recently-used URL preference) across two additional deploy cycles before director clarified the actual intent: the dropdown should pre-select the URL matching the page currently open. Reverted P-38 + P-39 + shipped P-40 (`pickInitialUrl` + active-tab URL match — same pattern as the right-click overlay) as the actually-correct fix in deploy session #24. Captured the misreading slip as a real CORRECTIONS_LOG §Entry. After today, the W#2 polish backlog has ONE open item (P-16 — service-worker MV3 crash diagnostics) — that's the natural next pick. After P-16 ships, W#2 polish backlog is functionally complete; the next session after that opens the W#2 graduation question.

**Alternate next-session candidates if director shifts priorities at session start:**

- W#3 Therapeutic Strategy first session per Rule 18 — heavy lift (~90-150 min) but advances platform arc.
- W#2 Tool Graduation per HANDOFF_PROTOCOL §4 Step 2 Scenario B — if director declares W#2 functionally complete after P-13 + P-40 (P-16 is the only remaining polish; could be split into "graduate now and capture P-16 in the polish-backlog sidecar" or "ship P-16 first then graduate"); see HANDOFF_PROTOCOL §4 Step 2 Scenario B for the full ritual.
- W#1 graduated-tool re-entry per Rule 22 — only if Keyword Clustering issue surfaces from natural use.

Check `ROADMAP.md` for the canonical state.
