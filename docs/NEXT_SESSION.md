# Next session

**Written:** 2026-05-18-c — `session_2026-05-18-c_w2-main-deploy-session-19-p21-symmetric-canonicalize-DEPLOYED` (Claude Code; dual-branch — pre-deploy scoreboard on `workflow-2-competition-scraping`, ff-merge + deploy phases on `main`, ping-pong sync after main push).

**For:** the next Claude Code session.

**Status of W#2 → main deploy session #19:** ✅ **P-21 symmetric-canonicalize `pickInitialUrl` + `buildRecognitionSet` SHIPPED + DEPLOYED to vklf.com.** Closes (a.41) RECOMMENDED-NEXT. Single-commit build-and-deploy session — symmetric canonicalization landed in both pure-function lib helpers AND orchestrator call sites that consume them. Standard W#2 → main deploy cheat-sheet (b) executed cleanly: pre-deploy scoreboard all GREEN on workflow-2 (tsc / extension tsc / `npm run build` 53 routes / src/lib node:test 527/527 / extension `npm test` **348/348** — was 334; **+14 new P-21 cases** / Playwright 75/75); rebase no-op; ff-merge `f41aac6..c3e69af` clean (5 files +318/-16 — all in `extensions/competition-scraping/src/lib/`); post-merge scoreboard re-run on main all GREEN; Rule 9 deploy gate → director picked "Deploy now"; pushed origin/main (Vercel auto-redeployed); ping-pong sync clean. **HEADLINE: the slug-variant asymmetry that caused the P-15 Amazon FAIL in deploy session #9 is now closed defensively at the unit + orchestrator wiring levels.** Future-defensive fix; director-side walkthrough deliberately skipped per Rule 27 picker — the 14 new node:test cases ARE the regression coverage. **§4 Step 1c forced-picker fired** at end-of-session (P-21 wrapped cleanly with no inherent continuation; W#2 polish backlog still has older items P-19 / P-13 but director chose to pivot to platform-wide work). Director picked **(a.42) RECOMMENDED-NEXT = (a.13) P-17 authFetch real-fetch integration test on `main`** — most thorough/reliable next pick per `feedback_recommendation_style.md`: closes a known production hotfix (vklf.com `Illegal invocation` 2026-05-12) with permanent regression coverage at the most stable layer (Playwright real-browser); higher-priority than W#2 polish P-19/P-13 which are low-frequency UX items.

---

## Branch

**`main`** — platform-wide infrastructure work, NOT W#2. The `./resume` script will switch you from `workflow-2-competition-scraping` (where deploy session #19 ended) → `main`. Verify with `git branch --show-current` immediately after `./resume`; should be on `main`, not `workflow-2-competition-scraping`. If you're still on workflow-2 after `./resume`, STOP and surface to director — `./resume` may have failed silently and director needs to run the ESCAPE HATCH 3-step path manually.

Expected branch state on entry: `main` exactly even with `origin/main` (the 2026-05-18-c deploy push + ping-pong sync left both branches at the same SHA `c3e69af`).

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**Ship P-17 — real-fetch integration test for `src/lib/authFetch.ts` production export** (ROADMAP W#2 row (a.13)). Goal: catch the bare-`fetch` Illegal-invocation regression class that the 2026-05-12 hotfix `08f10e5` revealed. Closes (a.42) RECOMMENDED-NEXT.

Branch is `main` (platform infrastructure used by W#1 + W#2 + future workflows — NOT a W#2 polish session). Verify branch state with `git branch --show-current` before any doc reads — should be `main`. If you're still on `workflow-2-competition-scraping`, STOP and surface to director (the `./resume` switch may have failed; recover via the ESCAPE HATCH).

Pick a browser-context test approach via Rule 14f forced-picker at session start — candidates: (A) jsdom in vitest (lightest but jsdom's fetch may still be node-style), (B) extend the existing Playwright suite with a new spec (heaviest but most thorough — real Chromium browser context, identical to the production bug surface), (C) Playwright Component Testing experimental-ct-react (middle ground), (D) escape hatch. Per `feedback_recommendation_style.md` (most thorough/reliable), (B) is likely the recommended option — Playwright's real browser context is the only test class that reliably reproduces the `TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation` browser-receiver-detachment bug that jsdom/node won't catch.

Schema-change-in-flight flag stays "No" for this entire session (P-17 is test-infra-only — no schema change, no API change, no shared-types change).

Start by running the mandatory start-of-session sequence.

**Pre-build read list (in addition to mandatory start-of-session sequence):**

- `src/lib/authFetch.ts` (entire file, ~95 LOC) — the production export at lines 81-88 is the bug surface. The hotfix `08f10e5` wrapped `fetch` in a bound function but the test suite never exercises the production export wiring itself.
- `src/lib/authFetch.test.ts` — the existing 7-test suite. All inject a fake `fetchFn` via the DI seam at the SUT boundary; none import the production export.
- `tests/playwright/authFetch-regression.spec.ts` (if it exists from P-17 prior work; check via `ls`) — the reference shape for a future Playwright test from session 2026-05-14 (Rule 27 P-17 shipped, but per ROADMAP (a.13) the integration test is still pending).
- `tests/playwright/build-bundle.mjs` + `test-server.mjs` — the Playwright React-bundle stub-page rig from P-30. The P-17 spec may want to reuse this rig to render a thin wrapper that imports the production `authFetch` export and exercises it.
- `CORRECTIONS_LOG.md` 2026-05-12 entry for the `Illegal invocation` hotfix root cause — full context on WHY the existing unit tests didn't catch the bug.

**P-17 scope + design pattern:**

- Goal: a permanent regression test that imports the production `authFetch.ts` export, exercises a real (mocked-but-realistic) authenticated fetch through the production wiring, and asserts no `TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation` is thrown.
- The bug class: when `fetch` is passed bare as `fetchFn` (or any function reference), the browser's `Window.fetch` requires `this === window` at invocation time. Detached references throw. Node's fetch is more permissive — won't reproduce the bug. JSDOM's fetch may or may not (depends on jsdom version). Playwright's real Chromium browser context is the canonical reproduction surface.
- Estimated ~30-60 LOC test file + possibly 1-2 LOC test-infra additions (new mount entrypoint for `authFetch` exercise + new stub page) + 0 LOC production changes (the hotfix already shipped; this session adds regression coverage only).
- Per Rule 23 Change Impact Audit (pre-classify before code): ADDITIVE — test-only addition; zero production code change; zero schema; zero API; zero shared-types.

**Pre-deploy verification scoreboard targets (expected baselines from today's deploy session #19 post-state):**

- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npx tsc --noEmit` clean
- `npm run build` clean — **53 routes** (unchanged; no new routes)
- `src/lib` node:test: **527/527** unchanged (P-17 is browser-context, not node:test)
- Extension `npm test`: **348/348** unchanged (P-17 doesn't touch extension code)
- Playwright: **75 → ~76-78** depending on how many cases the new P-17 spec adds

**Deploy mechanics (cheat-sheet a — platform-wide on main, no W#2 → main merge required):**

Because this session works directly on `main` (NOT on `workflow-2-competition-scraping`), the deploy is simpler than the W#2 → main pattern. The standard a-shape:

1. Pre-deploy scoreboard on `main` (all 6 checks above).
2. Rule 9 deploy gate via AskUserQuestion with the standard 4-option picker (Deploy now / Hold / Hold + reason / Question first). Recommend "Deploy now (Rule 9-approved)."
3. `git push origin main` → Vercel auto-redeploys (~1-2 min). **Note: P-17 is test-only; the production bundle on vklf.com is unchanged**, so the Vercel redeploy is technically a no-op for the live web bundle. The push is still required to publish the test suite to the repo + run CI on the latest commit.
4. **No ping-pong sync required** (no workflow-2 branch involvement). After main push, `workflow-2-competition-scraping` is now 1 commit behind main; future W#2 sessions will rebase or fast-forward to pick it up — that's the normal multi-workflow flow per Rule 25.

**Director re-verify on vklf.com (very brief — test-only):**

P-17 ships ZERO production behavior change. Director-side verification is just confirming Vercel's redeploy shows the new commit deployed cleanly + the existing site still works (1-minute smoke check). Per Rule 27, no Playwright forced-picker needed — the new test IS the canonical verification + the production behavior is unchanged.

**Per Rule 23 Change Impact Audit (pre-classify before code):** ADDITIVE — test-only addition; zero production code change; zero schema; zero API; zero shared-types.

**Group A docs to update at end-of-session:** ROADMAP (header + (a.42) → flip ✅ DONE + new (a.43) RECOMMENDED-NEXT pick); CHAT_REGISTRY (new top entry); DOCUMENT_MANIFEST (per-doc flag timestamps); CORRECTIONS_LOG (header bump + any new entries); NEXT_SESSION (rewritten for the next pick — likely back to W#2 polish P-19 / P-13 OR another platform-wide item OR W#1 re-entry OR new workflow start; settle via §4 Step 1c forced-picker if no obvious continuation from THIS session).

**Group B docs to update at end-of-session:** typically NONE for a platform-wide P-17 session — the change touches `src/lib/authFetch.ts` test infrastructure, not a specific workflow's Group B doc. Possibly add a brief `authFetch.test.ts` co-located note. The next session's continuation pick might re-engage W#2's Group B docs.

## Pre-session notes (optional, offline steps to do between sessions)

None. P-17 is an all-Claude-Code session — no offline preparation needed. Director's role during this session: pick the test-class approach (Rule 14f forced-picker at session start: jsdom vs. Playwright vs. Component Testing); pick "Deploy now" via Rule 9 AskUserQuestion gate at the end; pick the next session's task via §4 Step 1c interview at end.

## Why this pointer was written this way (debug aid)

Today's W#2 → main deploy session #19 brought P-21 (symmetric-canonicalize `pickInitialUrl` + `buildRecognitionSet`) to vklf.com cleanly + the 14 new node:test cases provide permanent regression coverage. The W#2 polish backlog now reduces to older items P-19 (LOW-MEDIUM overlay-dismiss) and P-13 (LOW autofocus) — neither is high-priority. Director picked **(a.42) = (a.13) P-17 authFetch real-fetch integration test on `main`** via §4 Step 1c forced-picker as the most thorough/reliable next pick — closes a known production hotfix with permanent regression coverage at the most stable layer (Playwright real-browser), higher-priority than W#2 polish P-19/P-13 which are low-frequency UX items.

**Alternate next-session candidates if director shifts priorities at session start:**

- Pre-existing W#2 polish backlog: P-19 (LOW-MEDIUM overlay-dismiss) / P-13 (LOW autofocus) — both would require switching branch back to `workflow-2-competition-scraping`.
- W#1 graduated-tool re-entry per Rule 22 (e.g., if director hits a Keyword Clustering issue during natural use).
- New workflow #3-#14 first session per Rule 18 Workflow Requirements Interview (e.g., W#3 Therapeutic Strategy if director wants to start the next workflow build).
- Fresh natural-use surface (e.g., a regression discovered while using vklf.com after the P-21 deploy).

Check `ROADMAP.md` for the canonical state. **After P-17 ships:** the platform's auth-fetch path has end-to-end browser-context regression coverage on top of the existing 7-unit-test DI suite; next picks likely return to W#2 polish (P-19 / P-13) or start W#3 per Rule 18.
