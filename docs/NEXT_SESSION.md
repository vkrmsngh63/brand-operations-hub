# Next session

**Written:** 2026-05-19-g (`session_2026-05-19-g_w2-main-deploy-session-28-p23-saved-url-dropdown-DEPLOYED`).

**For:** the next Claude Code session.

**Status of today's W#2 → main deploy session #28:** P-23 saved-URL dropdown side-by-side SHIPPED + DEPLOYED + REAL-CHROME-VERIFIED on vklf.com on ALL 3 forms (popup paste form + right-click "Add to PLOS — Captured Text" + right-click "Add to PLOS — Image"). Build commit `5cb2419`. Pre-deploy + post-merge scoreboards both GREEN: tsc / ext tsc / `npm run build` 53 routes / src/lib node:test **536/536** (unchanged) / extension `npm test` **428/428** (was 416; +12 saved-url-option-label pure-helper cases) / Playwright **79/79** (was 78; +1 new P-23 extension-context spec). Fresh zip `plos-extension-2026-05-19-w2-deploy-28.zip` at repo root (191,561 bytes — +148 over deploy-27).

**Closes (a.49) RECOMMENDED-NEXT.** 3 of 6 W#2 polish items shipped this week (P-24 + P-25 + P-23); **3 remain** that the director has stated must ship before W#2 graduation: P-22 (Playwright cross-platform slices 2-4) + P-18 (devcontainer Chromium libs) + P-26 (below-fold full-page-scroll capture). Estimated ~3-6 more W#2 polish sessions before graduation.

---

## Branch

**`workflow-2-competition-scraping`** — W#2 polish work, NOT platform-wide. The `./resume` script will switch you from wherever your shell is (probably `workflow-2-competition-scraping` already, since today's session ended there after the doc-batch push + ping-pong) → `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

Expected branch state on entry: `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` AND exactly even with `origin/main`. Both branches at the same SHA after today's deploy-#28 main push + ping-pong sync + end-of-session doc-batch push + ping-pong.

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**Ship P-22 — Playwright cross-platform slices 2-4 (extend the existing single-platform amazon happy-path specs to ebay + etsy + walmart)** on `workflow-2-competition-scraping` (ROADMAP W#2 polish backlog P-22 entry; ROADMAP Active Tools (a.50) RECOMMENDED-NEXT). Goal: defensive regression-coverage extension — every existing single-platform amazon-only spec gets per-platform clones for ebay + etsy + walmart so per-platform DOM differences don't go uncaught. Closes (a.50) RECOMMENDED-NEXT.

Branch is `workflow-2-competition-scraping`. Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Fix shape (per ROADMAP W#2 polish backlog P-22 entry + standing Rule 27 forced-picker output; ~150-250 LOC of test code; NO source code change; NO schema change):**

1. **No schema change** — pure test-coverage extension. Schema-change-in-flight flag stays "No" the entire session.

2. **No source code change** — only test files are touched.

3. **Identify the single-platform amazon-only specs that need extension.** Today's coverage (per `tests/playwright/extension/`):
   - `p23-saved-url-dropdown-label.spec.ts` — single-platform amazon happy path (added 2026-05-19-g).
   - `p24-saved-image-indicator.spec.ts` — single-platform amazon happy path.
   - `p25-saved-text-haze.spec.ts` — single-platform amazon happy path × 2 specs (attach + tear-down).

   Specs already multi-platform across {amazon, ebay, etsy, walmart} (use `test.describe.each([...])` or per-platform `test.describe` blocks — preserved as-is, no work to do):
   - `image-capture.spec.ts` — 4-platform via `pl.platform` loop.
   - `region-screenshot.spec.ts` — 4-platform.
   - `highlight-flashing.spec.ts` — 4-platform.
   - `p23-amazon-overlay-image.spec.ts` — INTENTIONALLY amazon-only (Amazon-specific DOM concern; no platform sibling needed).

4. **Extension shape:** for each of P-23 / P-24 / P-25 specs, replace the single `test.describe(..., () => { test(...) })` block with a `test.describe.each([{platform: 'ebay', ...}, {platform: 'etsy', ...}, {platform: 'walmart', ...}], ($pl) => { test(...) })` pattern OR add 3 sibling `test.describe` blocks if `describe.each` is unidiomatic in this repo's conventions. Reuse the existing fakedata / route-fixture / mock-page-HTML scaffolding; only the `pl.platform` / fixture URL / DOM HTML need to vary per platform.

5. **Per Rule 23 Change Impact Audit (pre-classify before code):** Additive (safe). Test-only change. No source code change. No schema change. No API change. Zero downstream W#1 / W#3 cross-tool impact.

**Diagnosis steps before coding (verify the launch prompt's premises before any code):**

1. Read `tests/playwright/extension/p23-saved-url-dropdown-label.spec.ts` (250 LOC; shipped today) — confirm it's single-platform amazon.
2. Read `tests/playwright/extension/p24-saved-image-indicator.spec.ts` — confirm single-platform amazon.
3. Read `tests/playwright/extension/p25-saved-text-haze.spec.ts` — confirm single-platform amazon × 2 specs.
4. Read `tests/playwright/extension/image-capture.spec.ts` AND `region-screenshot.spec.ts` to see the canonical 4-platform `test.describe.each` / per-platform-describe pattern this repo uses; match that pattern in the P-22 extension.
5. Sanity-grep for any platform-specific DOM assumptions baked into the P-23/24/25 specs (e.g., Amazon-specific selectors like `m.media-amazon.com` in P-24's `SAVED_IMG_SRC`) — these need per-platform substitutes.
6. Surface any drift to director BEFORE coding via AskUserQuestion picker. Recurring pattern: every recent P-NN ship session has caught one Rule 3 drift catch — keep that discipline.

**Forced-picker before coding (Rule 14f):**

This is a pure test-coverage extension; the design choice is narrow but the SHAPE choice matters.

- (A) `test.describe.each([...])` with parameterized fakedata table (recommended — matches the repo's `image-capture.spec.ts` 4-platform pattern; minimal duplication; clear per-platform parameterization in one place)
- (B) Three sibling `test.describe` blocks per spec file (more verbose; ~3× the LOC; only consider if `describe.each` proves awkward with the per-platform fixtures)
- (C) Three sibling spec FILES (one per platform per spec) — heaviest scope; only consider if file-level parallelization is needed
- (D) Escape hatch

Per `feedback_recommendation_style.md` (most thorough/reliable): **Option (A)** — `describe.each` is the canonical Playwright pattern, already used in 3 existing 4-platform specs in this repo, easiest to read + extend later.

**Test coverage decision (Rule 27 forced-picker at session start):**

This session IS the test coverage; the existing P-23/24/25 spec test for the feature, the per-platform extension extends the regression coverage. No additional test layer needed.

- (A) Just run the extended Playwright suite as the verification (recommended — the new specs ARE the verification; running them on each of the 4 platforms confirms the per-platform paths work)
- (B) Add a node:test unit-test layer on the per-platform fakedata factory if extracted (only if the factory grows non-trivial — likely not necessary)
- (C) Director manual walkthrough on each of the 3 new platforms — unnecessary; Playwright simulates each platform's URL pattern via per-platform fakedata
- (D) Escape hatch

Per `feedback_recommendation_style.md`: **Option (A) — Playwright suite alone is sufficient.** Rule 27 scope-exception logic: the regression coverage IS the goal; no real-world judgment call needed.

**Pre-deploy verification scoreboard targets (expected baselines from today's deploy session #28 post-state):**

- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npx tsc --noEmit` clean
- `npm run build` clean — **53 routes** (unchanged — no new route)
- `src/lib` node:test: **536/536** (unchanged — no server-side change)
- Extension `npm test`: **428/428** (unchanged — no extension source change; only test files in `tests/playwright/extension/`)
- Playwright: **79/79** + ~+9 new per-platform specs (3 features × 3 platforms) → ~88 total. Some specs may already cover the cross-platform path; verify with a dry-run pass before locking the +9 expectation.

**Deploy mechanics (cheat-sheet b — standard W#2 → main deploy):** unchanged. Pre-deploy scoreboard → rebase if main moved → ff-merge → post-merge scoreboard → Rule 9 gate → push main → ping-pong sync → fresh extension build (no source change so the bundle is byte-identical except for the wxt-imposed build hash; cheap rebuild). The Playwright suite IS the verification — no director real-Chrome verification needed (Rule 27 scope-exception: pure regression coverage extension; no user-visible change).

**Optional: investigate the wxt build hang.** Today's session (and yesterday's 2026-05-19-f) both hit a recurring wxt-build-hang issue: `wxt build` writes the dist correctly at ~5-second mark but the parent node process hangs indefinitely afterward (~12 minutes in today's case before kill). Today's session has captured this informationally in CORRECTIONS_LOG. P-22's session has no extension source changes so should build fast — IF the hang recurs, capture the wxt version + node version + any new log output before killing; consider opening an issue or adding a Playwright `pretest` hook that runs `wxt build` with a timeout. Don't make it the primary session focus; the test-coverage extension is the primary task.

**Group A docs to update at end-of-session:** ROADMAP (header + (a.50) → ✅ DONE + new (a.51) RECOMMENDED-NEXT — likely P-18 or P-26 via §4 Step 1c forced-picker); CHAT_REGISTRY (new top entry); DOCUMENT_MANIFEST (header); CORRECTIONS_LOG (header bump + any new entries — possibly a wxt-build-hang §Entry if escalated); NEXT_SESSION (rewritten for the next polish item).

**Group B docs to update at end-of-session:** COMPETITION_SCRAPING_VERIFICATION_BACKLOG (new Deploy session #29 entry + P-22 flipped ✅ DONE). COMPETITION_SCRAPING_DESIGN unchanged (test-coverage extension doesn't change design intent — no §B entry needed; mirror the 2026-05-19-d P-16 precedent).

**Schema-change-in-flight flag:** stays "No" entire session (pure test-coverage extension; no schema work).

Start by running the mandatory start-of-session sequence.

**Pre-build read list (in addition to mandatory start-of-session sequence):**

- `tests/playwright/extension/p23-saved-url-dropdown-label.spec.ts` (250 LOC — today's ship; first candidate for cross-platform extension).
- `tests/playwright/extension/p24-saved-image-indicator.spec.ts` (single-platform amazon — second candidate).
- `tests/playwright/extension/p25-saved-text-haze.spec.ts` (single-platform amazon × 2 specs — third candidate).
- `tests/playwright/extension/image-capture.spec.ts` (canonical 4-platform pattern this repo uses — REFERENCE for the extension shape; do NOT modify).
- ROADMAP W#2 polish backlog P-22 entry.

## Pre-session notes (optional, offline steps to do between sessions)

Nothing required offline. The session is fully self-contained (test-code-only extension; Playwright suite as verification).

## Why this pointer was written this way (debug aid)

Today's session shipped P-23 cleanly + verified live on real Chrome on all 3 forms (PASS first try). The §4 Step 1c forced-picker offered 4 options: (A) P-22 Playwright cross-platform slices 2-4 [recommended — defensive coverage extension], (B) P-18 devcontainer Chromium libs [smallest scope], (C) P-26 below-fold full-page-scroll capture [largest lift], (D) DEFERRED manual-add modal originalSrcUrl tack-on. Director picked (A) P-22 per `feedback_recommendation_style.md` standing preference (most thorough/reliable — extends regression coverage to the remaining 3 platforms catching per-platform DOM differences). Director can override the pick by editing this file's `## Launch prompt` section before next session start.

**Alternate next-session candidates if director shifts priorities at session start:**

- P-18 devcontainer Chromium libs (LOW dev ergonomic — small fold-in; sub-1-hour session).
- P-26 below-fold full-page-scroll capture (LOW deferred large lift — last in the queue; current workaround works; ~200-400 LOC).
- **P-27 Captured-videos feature** (NEW — added 2026-05-19-g-2 as a post-handoff scope-add per director directive). Pre-graduation polish item; substantive feature expansion. Estimated ~6-12 sessions broken into: dedicated design interview (Session 1) + schema migration + bucket setup + API routes (Session 2) + extension content-script + popup forms + saved-video indicator + URL detail renderer (Sessions 3-5) + single-platform amazon Playwright spec (Session 6) + optional polish (Sessions 7+). Open design questions: Supabase bucket strategy + thumbnail extraction approach + schema additions + YouTube/Vimeo handling + cross-platform `<video>` detection. **The first session for P-27 is design-only (no code) — director-confirmed picks today are: URL reference + uploaded bytes BOTH stored; full UX symmetry with text/image; pre-graduation gating.** Full details: ROADMAP P-27 entry + COMPETITION_SCRAPING_DESIGN §B 2026-05-19-g-2 entry.
- Manual-add modal originalSrcUrl tack-on (DEFERRED from 2026-05-19-e — trivial 1-line; could fold into any P-NN session).
- Investigate the wxt-build-hang issue separately (informational item only; not on the W#2 polish backlog).

Check `ROADMAP.md` for the canonical state.
