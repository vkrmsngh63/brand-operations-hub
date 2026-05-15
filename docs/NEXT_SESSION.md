# Next session

**Written:** 2026-05-15-f — session_2026-05-15-f_w2-main-deploy-session-15-p29-slice-3-DEPLOYED-FULL-VERIFY (Claude Code, dual-branch — main for deploy + workflow-2 fast-forwarded after the main push).

**For:** the next Claude Code session.

**Status of W#2 → main deploy session #15:** ✅ **P-29 Slice #3 DEPLOYED + FULL VERIFY on vklf.com.** Clean fast-forward of the single bundled commit `8018294` from `workflow-2-competition-scraping` onto `main`. Vercel auto-redeploy completed cleanly. Director walkthrough on a real Independent Website URL exercised all five parts of the verification scope — drag-drop / clipboard paste / URL-of-image / SSRF defensive spot-check / extension regression — and reported "all green" across the batch in a single pass (no walkthrough-found polish items this cycle). **The P-29 three-slice manual-add arc is now complete + live end-to-end on vklf.com — admins can add URLs + captured texts + captured images manually from any URL detail page without using the Chrome extension.** Closes (a.34) RECOMMENDED-NEXT.

**The recommended next pick:** **P-30 — Playwright React-bundle stub-page rig** = the test-only React rendering rig that unblocks the ~50 Playwright tests currently `test.skip()`-annotated across all three P-29 modal specs (17 cases in `p29-manual-add-captured-image-modal.spec.ts` + 8 cases in `p29-manual-add-captured-text-modal.spec.ts` + 6 cases in `p29-manual-add-url-modal.spec.ts` + ~19 additional cases across the three specs' branch coverage). Locks in mechanical-UX regression coverage for everything just shipped, prevents the entire bug class from regressing on future polish/walkthrough cycles, and is the highest-leverage next pick per `feedback_recommendation_style.md` ("most thorough and reliable"). Closes (a.35) RECOMMENDED-NEXT.

---

## Branch
workflow-2-competition-scraping (start here; on entry should be 0 commits ahead of `origin/main` per the ping-pong sync at end of deploy session #15)

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**W#2 P-30 BUILD session — Playwright React-bundle stub-page rig.** Goal: build the test-only React rendering rig that unblocks the ~50 currently-skipped Playwright tests across the three P-29 manual-add modal specs (Slice #1 URL modal / Slice #2 captured-text modal / Slice #3 captured-image modal) — convert `test.skip()` into running coverage for the entire manual-add feature in one session. Closes (a.35) RECOMMENDED-NEXT.

Verify branch state with `git branch --show-current` before any doc reads — should be on `workflow-2-competition-scraping` (`./resume` switched you; verify). Start by running the mandatory start-of-session sequence.

**Schema-change-in-flight flag stays "No"** — P-30 is test-infrastructure work; zero schema changes, zero `src/` runtime changes (only `tests/` + supporting test fixtures).

**P-30 BUILD session scope:**

1. **Pre-coding design pass — Rule 14f forced-picker for the rig shape** before any code. Candidate shapes to surface (each with their trade-off summary):
   - **(A) Vite/esbuild dev-server stub-page approach** — a tiny in-repo stub-page that imports the modal component directly and renders it inside a test harness; Playwright navigates to `http://localhost:5174/p29-test/url-modal?fixtures=...` and exercises the UI. Pros: real React render + real DOM; close to production behavior. Cons: needs a parallel dev server in CI; coordinate with Next.js dev server's port.
   - **(B) Next.js test-only page route** — a `src/app/__playwright__/...` route gated by env var that mounts the modal in a fixture-driven test harness. Pros: reuses Next.js's existing dev server; no new tool. Cons: ships test code in the route table; gating discipline required to prevent production leakage.
   - **(C) Component-level Playwright Component Testing** (`@playwright/experimental-ct-react`) — Playwright's first-party component test runner. Pros: purpose-built for exactly this use case; isolated from Next.js. Cons: experimental + larger setup; new tooling surface.
   - **(D) Skip the rig, ship JSDOM unit tests instead** (e.g., vitest + @testing-library/react) — different test class but covers the same mechanical UX. Cons: drifts from "browser-context test" Rule 27 intent; doesn't catch real-DOM-specific bugs (focus / paste events / DataTransfer / clipboard).
   - **(E) I have a question first that I need clarified.**

   Recommendation per `feedback_recommendation_style.md` (most thorough and reliable; the option that catches the same bug class on regression while staying in the Playwright real-browser-context that Rule 27 already invested in): Director's pick after the forced-picker.

2. **Implementation slice 1** — stand up the picked rig shape with ONE working test (the simplest spec from Slice #1's `p29-manual-add-url-modal.spec.ts`). Confirm the rig boots, the modal renders, the test exercises it end-to-end, and the assertion passes.

3. **Implementation slice 2** — port the remaining ~50 currently-skipped tests across all three specs to use the rig. Flip `test.skip()` → `test()` for each as you migrate.

4. **Verification scoreboard at end of build session:**
   - `npx tsc --noEmit` clean
   - `cd extensions/competition-scraping && npm run compile` clean
   - `npm run build` clean (50 routes — should match deploy session #15's baseline)
   - `node --test` on all 18 src/lib test files: 447/447 pass (unchanged — P-30 is test-infra only)
   - Extension `npm test`: 334/334 pass (unchanged — P-30 doesn't touch the extension)
   - `npx playwright test tests/playwright/p29-*.spec.ts`: **~50/50 PASS** (was 31 skipped) — this is the headline scoreboard delta for P-30.

5. **Director manual smoke** of the rig's dev experience: run one test live with `--headed --debug` to confirm the developer-loop feels right (fast restart, clear failure messages, good locator strategy). If the rig feels janky, capture polish items per Rule 14e + Rule 26.

6. **End-of-session doc batch:**
   - ROADMAP polish-backlog P-30 entry status → ✅ SHIPPED at code level on `workflow-2-competition-scraping`
   - (a.35) RECOMMENDED-NEXT → ✅ DONE; new (a.36) RECOMMENDED-NEXT picked via Step 1c forced-picker (likely candidates: P-31 route-handler DI refactor / P-27 delete captured texts/images / P-28 delete URLs cascade / older polish P-21 / P-19 / P-13)
   - CHAT_REGISTRY new top row
   - DOCUMENT_MANIFEST header + per-doc flags
   - COMPETITION_SCRAPING_DESIGN §B new 2026-05-?? entry for the rig design pick + implementation outcome
   - COMPETITION_SCRAPING_VERIFICATION_BACKLOG: P-30 section status updated to ✅ SHIPPED; flip the three P-29 spec sections from "tests skipped pending P-30" to "tests live"
   - NEXT_SESSION.md rewrite

**Pre-deploy checklist at session start:**

- `git branch --show-current` confirms `workflow-2-competition-scraping`.
- `git log origin/main..workflow-2-competition-scraping --oneline` — expects 0 commits (workflow-2 in lockstep with main after deploy session #15's ping-pong sync).
- Read `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-15-f (deploy session #15 outcome — Slice #3 deployed + full verify + P-29 three-slice arc complete).
- Read `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` for the three P-29 spec sections' current status ("17/17 skipped" + "8/8 skipped" + "6/6 skipped" — P-30 unblocks all three).
- Read `ROADMAP.md` W#2 row + polish backlog P-30 entry's current framing.
- Per Rule 23, run Change Impact Audit before any code. P-30 is test-infrastructure-only — additive change with zero impact on production code paths. Classification will be Additive (safe).

**Rule 23 expected outcome for the rig build:** Additive (safe). New files only — `tests/` directory + test-only rig support files. No `src/` changes (zero runtime impact); no schema; no shared-types changes; no API surface changes. The 17+8+6=31 currently-skipped Playwright cases flip to live coverage but the cases themselves don't change shape — the rig delivers the rendering context the cases were already written against.

**Verification scoreboard for P-30 BUILD session (target state at end-of-session):**

- All pre-build scoreboard items still GREEN.
- Post-build scoreboard re-run on `workflow-2-competition-scraping` before commit (mandatory per Rule 5 — verify-before-commit).
- The headline scoreboard delta: Playwright P-29 spec coverage flips from "31 skipped" to "~50 PASS" (some specs may produce more concrete test cases than the original placeholders).

## Pre-session notes (optional, offline steps to do between sessions)

None. P-30 is an all-Claude-Code session — no offline preparation needed. The director's role this session is the Rule 14f forced-picker pick at the start, then end-of-session manual smoke of the rig's developer-loop feel.

## Why this pointer was written this way (debug aid)

P-30 was captured during the 2026-05-15-b Slice #1 BUILD session as a NEW polish item per Rule 14e + Rule 26 when the Slice #1 Playwright spec shipped with 6 cases all `test.skip()`-annotated (no rig to render the modal yet). Slices #2 + #3 followed the same pattern, accumulating 31 currently-skipped UI-mechanical cases across the three specs. The pointer file recommends P-30 next because it converts that backlog into actual regression coverage in one session — locking in the regression-prevention class for everything just shipped while the modal code is fresh.

The director's preferred deploy shape across the P-29 arc (3 build sessions + 2 deploy sessions across 2026-05-15-b through 2026-05-15-f) is now established and proven: ship one slice per session at code level; deploy when 2-3 slices accumulate; walk through end-to-end on a real Independent Website URL; fix any polish items same-session per the deploy-#14 multi-cycle pattern. P-30 keeps that pattern intact — it's a single-session build whose value compounds across every future P-29-area polish/walkthrough cycle.

**Alternate next-session candidates if director shifts priorities at session start:**

- P-31 (route-handler DI refactor — unblocks API-layer regression coverage for `urls/route.ts` + `urls/[urlId]/text/route.ts` + `images/finalize/route.ts` + the new `fetch-by-url/route.ts`). Pairs well with P-30 — ship both this cycle for paired UI + API regression coverage.
- P-28 (delete URLs cascade — user-facing admin feature for cleaning up Projects).
- P-27 (delete captured texts/images — sibling of P-28 at the URL-detail-page level).
- Older polish items P-21 / P-19 / P-13 — surfaced during the Module 1+2 builds but not yet prioritized.

Check `ROADMAP.md` W#2 row for the canonical state.

**After P-30 ships:** the natural next pick is P-31 (paired with P-30 to complete UI + API regression coverage for the P-29 area), or any of the user-facing polish items above per director priority.
