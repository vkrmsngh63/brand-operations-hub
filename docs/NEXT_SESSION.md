# Next session

**Written:** 2026-05-15-g — session_2026-05-15-g_w2-p30-playwright-react-bundle-rig (Claude Code, on `workflow-2-competition-scraping`).

**For:** the next Claude Code session.

**Status of W#2 P-30 BUILD session #15-g:** ✅ **Playwright React-bundle stub-page rig SHIPPED at code level** on `workflow-2-competition-scraping` in commit `0548da7`. Director's Rule 14f pick at session start was Option A (extend existing P-17 authFetch esbuild stub-page rig) over Option B (Next.js test-only route) / Option C (`@playwright/experimental-ct-react` experimental) / Option D (JSDOM — auto-eliminated as it conflicts with Rule 27 real-browser-context intent). Rig architecture: `tests/playwright/build-bundle.mjs` extended with `buildP29ModalBundles()` (3 React entrypoints, automatic JSX runtime, `@/` → `src/` alias, fake-supabase alias); 3 new mount entrypoints under `tests/playwright/mounts/`; 3 new static stub pages under `tests/playwright/pages/`; `tests/playwright/test-server.mjs` extended with new page + `/dist/*.bundle.js` routes (traversal-guarded). All 3 P-29 spec files flipped from describe-level `test.skip(true, ...)` to live test bodies. **HEADLINE DELTA: P-29 Playwright cases went from 31 skipped → 30 pass + 1 P-32-deferred-skip in a single session** (URL 6/6 + captured-text 8/8 + captured-image 16/17). Verification scoreboard all GREEN. Closes (a.35) RECOMMENDED-NEXT.

**NEW polish item P-32 captured this session per Rule 14e + Rule 26:** multi-file drop warning in `CapturedImageAddModal.tsx` set in `onDrop` then cleared by `tryLoadFile` before React commits — warning UI never appears on multi-file drop. P-30 spec caught it on first authoring. One-line fix deferred to keep P-30 strictly test-infra-only per launch-prompt scope. Will fold naturally into the start of the P-31 session as session-opener.

**The recommended next pick:** **P-31 — route-handler DI refactor for testability** = extract validation + Prisma calls from the 4 W#2 route.ts handlers (`urls/route.ts`, `urls/[urlId]/text/route.ts`, `urls/[urlId]/images/finalize/route.ts`, `urls/[urlId]/images/fetch-by-url/route.ts`) behind a dependency-injection seam so `node --test` can exercise them in isolation without bundling Next.js. Closes the API-layer regression-coverage gap that P-30 deliberately left out of scope. Completes the P-29 area's regression-coverage trifecta — UI mechanical (P-30 ✓) + route-handler integration (P-31) + real-website smoke (director walkthrough already DONE for the 3 slices). Closes (a.36) RECOMMENDED-NEXT.

---

## Branch
workflow-2-competition-scraping (start here; on entry should be 1 commit ahead of `origin/main` = today's `0548da7` test-infra code + this end-of-session doc-batch on top — both will flow into `main` at the next W#2 → main deploy session).

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**W#2 P-31 BUILD session — route-handler DI refactor for testability.** Goal: refactor the 4 W#2 `route.ts` handlers (`urls/route.ts` + `urls/[urlId]/text/route.ts` + `urls/[urlId]/images/finalize/route.ts` + `urls/[urlId]/images/fetch-by-url/route.ts`) to extract validation + Prisma calls behind a dependency-injection seam so `node --test` can exercise them in isolation. Author ~30-40 new node:test cases covering validation + 401 auth gate + 400 error shapes + happy-path persistence per route. Closes (a.36) RECOMMENDED-NEXT. **Session opener:** apply the P-32 one-liner first (multi-file drop warning fix in `CapturedImageAddModal.tsx`) + re-enable the corresponding Playwright `test.skip()`-annotated test → flip Playwright count from 30/31 to 31/31. Tiny demonstration of the P-30 regression coverage working end-to-end.

Verify branch state with `git branch --show-current` before any doc reads — should be on `workflow-2-competition-scraping` (`./resume` switched you; verify). Start by running the mandatory start-of-session sequence.

**Schema-change-in-flight flag stays "No"** — P-31 is a testability-oriented refactor; zero schema changes, zero shared-types changes, additive seam in existing routes.

**P-31 BUILD session scope:**

1. **Session opener — P-32 one-liner fix** before any P-31 work:
   - In `CapturedImageAddModal.tsx`, move `setWarningMessage(null)` out of `tryLoadFile`'s preamble OR set the warning after `await tryLoadFile(...)` resolves OR pass the warning text in as a `tryLoadFile` arg. Director picks shape via small Rule 14f forced-picker (recommend the shape that's most local — moving the clear out of `tryLoadFile` and into the call sites that need it).
   - Remove the `test.skip(true, 'P-32 — ...')` annotation from the multi-file-drop test in `tests/playwright/p29-manual-add-captured-image-modal.spec.ts`.
   - Run `npx playwright test --project=chromium tests/playwright/p29-manual-add-captured-image-modal.spec.ts` → confirm 17/17 PASS (was 16/17 + 1 P-32-skip). This demonstrates the P-30 regression coverage working end-to-end.
   - Update `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` P-32 entry status → ✅ FIXED 2026-05-15-h (or whatever today's session ID is).
   - Update the "captured-image: 16/17" mention in the P-30 SHIPPED section + the Slice #3 SHIPPED-section's spec-status line to reflect the new 17/17.

2. **Pre-coding design pass — Rule 14f forced-picker for the DI seam shape** before any P-31 code. Candidate shapes to surface:
   - **(A) Per-route closure factory.** Each route exports `export function makeHandler(deps: HandlerDeps): NextHandler` + the production wires the singleton at route entry point via a thin wrapper. Pros: most explicit per-route; each route's deps are visible at the seam; easy to swap in test deps. Cons: 4 nearly-identical wrappers.
   - **(B) Module-level injectable function.** Extract validation + Prisma into a separately-exported pure-function-style handler (e.g., `createCompetitorUrl({ projectId, userId, body, prisma, markWorkflowActive, ... })`) that returns `{ status, body }`. Route just calls it with production deps + adapts to `NextResponse`. Pros: business logic fully testable as a pure function; matches the shape captured in the P-31 polish-backlog entry.
   - **(C) Testable-route adapter pattern.** Separate the route boundary (request parsing + response shaping) from business logic; expose the business-logic function for direct `node --test` exercise. Pros: idiomatic Next.js Route Handler boundary; minimal change.
   - **(D) I have a question first that I need clarified.**

   Recommendation per `feedback_recommendation_style.md` (most thorough and reliable): **Option B** — module-level injectable function. The P-31 polish-backlog entry already captures this shape (see VERIFICATION_BACKLOG.md P-31 section's example signature). It's the most testable + matches existing platform conventions for pure-function helpers (e.g., `ssrf-guard.ts`'s pure-function classifiers). Director picks at session start.

3. **Implementation slice 1** — apply the picked DI seam to `urls/route.ts` (the smallest of the 4 routes) + author 10-15 new node:test cases covering the validation surface (200 happy / 400 missing url / 400 invalid platform / 400 invalid source / 401 unauthenticated / persistence path). Confirm the test class boots end-to-end.

4. **Implementation slice 2** — apply the same seam to the remaining 3 routes (`urls/[urlId]/text/route.ts`, `images/finalize/route.ts`, `fetch-by-url/route.ts`). Author 15-25 more test cases covering their specific validation + the SSRF guard's integration with `fetch-by-url`'s route boundary (already covered at the pure-function level by `ssrf-guard.test.ts` — the new test exercises the route-level wiring).

5. **Verification scoreboard at end of build session:**
   - `npx tsc --noEmit` clean
   - `cd extensions/competition-scraping && npm run compile` clean
   - `npm run build` clean (52 routes — should match deploy session #15's baseline + P-30 sessions' baseline)
   - `find src/lib -name "*.test.ts" | xargs node --test`: was 447/447 → expected ~477-487/477-487 with 30-40 new P-31 cases
   - Extension `npm test`: 334/334 pass (unchanged — P-31 doesn't touch the extension)
   - `npx playwright test`: 64/64 pass (was 63 pass + 1 P-32-skip; session opener flips that to 64/64)

6. **End-of-session doc batch:**
   - ROADMAP polish-backlog P-31 entry status → ✅ SHIPPED at code level on `workflow-2-competition-scraping`
   - ROADMAP polish-backlog P-32 entry status → ✅ FIXED at code level
   - (a.36) RECOMMENDED-NEXT → ✅ DONE; new (a.37) RECOMMENDED-NEXT picked via §4 Step 1c forced-picker (likely candidates: W#2 → main deploy session #16 to bring P-30 + P-31 + P-32 to vklf.com / P-28 delete URLs cascade / P-27 delete captured texts/images / older polish P-21 / P-19 / P-13).
   - CHAT_REGISTRY new top row
   - DOCUMENT_MANIFEST header + per-doc flags
   - COMPETITION_SCRAPING_DESIGN §B new 2026-05-?? entry for the DI seam design pick + implementation outcome
   - COMPETITION_SCRAPING_VERIFICATION_BACKLOG: P-31 section status updated to ✅ SHIPPED + P-32 entry flipped to ✅ FIXED
   - NEXT_SESSION.md rewrite

**Pre-deploy checklist at session start:**

- `git branch --show-current` confirms `workflow-2-competition-scraping`.
- `git log origin/main..workflow-2-competition-scraping --oneline` — expects 2 commits (today's `0548da7` test-infra code + today's end-of-session doc-batch commit). Both flow to `main` at the next W#2 → main deploy session.
- Read `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` P-30 SHIPPED + P-31 polish-backlog entry + P-32 polish-backlog entry.
- Read `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-15-g (P-30 build session outcome).
- Read `ROADMAP.md` W#2 row + (a.36) RECOMMENDED-NEXT entry for P-31.
- Per Rule 23, run Change Impact Audit before any code. P-31 is a testability-oriented refactor — Additive (safe) classification for the DI seam extension (existing route behavior unchanged; new exports added); the P-32 one-line fix is also Additive (production bug fix; behavior change is "warning now appears as designed").

**Rule 23 expected outcome for P-31:** Additive (safe). New exports + one-level-of-indirection per route; production behavior unchanged byte-for-byte (the route's response shape, status codes, error messages, and side-effects are all driven by the extracted pure function called with production deps). The P-32 fix surfaces an existing-intended-but-unreachable warning; no existing behavior is removed or changed.

**Verification scoreboard for P-31 BUILD session (target state at end-of-session):**

- All pre-build scoreboard items still GREEN.
- 30-40 new node:test cases passing covering the 4 W#2 routes' validation + auth + error + persistence shapes.
- P-32 fix verified — 17/17 captured-image Playwright tests now passing (was 16/17).
- Headline P-31 scoreboard delta: route-handler integration regression coverage NOW LIVE for the 4 W#2 routes; combined with P-30's UI-mechanical coverage, the P-29 area now has end-to-end regression coverage (UI + API + real-website smoke).

## Pre-session notes (optional, offline steps to do between sessions)

None. P-31 is an all-Claude-Code session — no offline preparation needed. Director's role this session: the small Rule 14f forced-picker for P-32 fix shape (session opener) + the bigger Rule 14f forced-picker for the DI seam shape (before P-31 code) + end-of-session forced-picker for (a.37) RECOMMENDED-NEXT.

## Why this pointer was written this way (debug aid)

P-31 was captured during the 2026-05-15-b Slice #1 BUILD session as a NEW polish item per Rule 14e + Rule 26 when the Slice #1 API-layer regression coverage turned out to need a module-level DI seam that `urls/route.ts` (and siblings) don't have today. The original capture preserved the recommended shape (Option B above — module-level injectable function) as the destination — today's session can recreate that or pick differently via the Rule 14f forced-picker at session start.

P-31 is paired with P-30 as the API-layer counterpart that completes the P-29 area's regression-coverage trifecta. With both shipped, every future P-29-area polish/walkthrough then has automated regression coverage on BOTH the UI mechanical layer AND the route-handler integration layer at zero director-time cost. Real-website smoke remains the director's manual judgment (per Rule 27 scope-exception for one-off post-deploy smoke).

The P-32 session-opener is included specifically because: (i) it's a one-liner so it doesn't displace P-31's scope; (ii) it demonstrates the P-30 regression coverage flipping a skip → pass in real time, which is morale-positive after the rig-build session; (iii) it closes the only currently-skipped Playwright test, leaving the suite at 64/64 GREEN at the start of P-31's verification scoreboard.

**Alternate next-session candidates if director shifts priorities at session start:**

- W#2 → main deploy session #16 (bring P-30 + P-32 to vklf.com immediately — but defers the API-layer regression-coverage gap). Trade-off: the P-30 rig itself doesn't change production behavior, so its deploy is non-load-bearing; better to ship P-30 + P-31 + P-32 together at the next deploy.
- P-28 (delete URLs cascade — user-facing admin feature for cleaning up Projects).
- P-27 (delete captured texts/images — sibling of P-28 at the URL-detail-page level).
- Older polish items P-21 / P-19 / P-13 — surfaced during the Module 1+2 builds but not yet prioritized.

Check `ROADMAP.md` W#2 row for the canonical state.

**After P-31 ships:** the natural next pick is W#2 → main deploy session #16 — bring P-30 + P-31 + P-32 to vklf.com in one combined deploy. After that, the P-29 area's three-slice manual-add feature is fully covered by automated regression coverage on both UI + API layers + real-website smoke, AND the P-32 production bug is fixed. The W#2 polish backlog then continues with the next director-picked item (P-27 / P-28 / older polish).
