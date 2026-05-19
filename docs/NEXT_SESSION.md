# Next session

**Written:** 2026-05-19-f (`session_2026-05-19-f_w2-main-deploy-session-27-p25-saved-text-haze-DEPLOYED`).

**For:** the next Claude Code session.

**Status of today's W#2 → main deploy session #27:** P-25 captured-text haze indicator on the page SHIPPED + DEPLOYED + REAL-CHROME-VERIFIED on vklf.com (build commit `e7c82da`). Pre-deploy + post-merge scoreboards both GREEN: tsc / ext tsc / `npm run build` 53 routes / src/lib node:test **536/536** (was 531; +5 new selector POST handler cases) / extension `npm test` **416/416** (was 368; +48 new — 36 captured-text-selector pure-logic cases + 12 saved-text-highlight attach/detach cases) / Playwright **78/78** (was 76; +2 new P-25 extension-context specs). Fresh zip `plos-extension-2026-05-19-w2-deploy-27.zip` at repo root (191,413 bytes — +516 over deploy-26).

**Closes (a.48) RECOMMENDED-NEXT.** 2 of 6 W#2 polish items remaining before graduation shipped this week (P-24 2026-05-19-e + P-25 today); **4 remain** that the director has stated must ship before W#2 is deemed complete: P-23 (saved-URL dropdown side-by-side) + P-22 (Playwright cross-platform slices 2-4) + P-18 (devcontainer Chromium libs) + P-26 (below-fold full-page-scroll capture). Estimated ~4-8 more W#2 polish sessions before graduation.

---

## Branch

**`workflow-2-competition-scraping`** — W#2 polish work, NOT platform-wide. The `./resume` script will switch you from wherever your shell is (probably `workflow-2-competition-scraping` already, since today's session ended there after the doc-batch push + ping-pong) → `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

Expected branch state on entry: `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` AND exactly even with `origin/main`. Both branches at the same SHA after today's deploy-#27 main push + ping-pong sync + end-of-session doc-batch push + ping-pong.

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**Ship P-23 — saved-URL dropdown side-by-side (URL + product name visible together so the director can confirm the URL before saving)** on `workflow-2-competition-scraping` (ROADMAP W#2 polish backlog P-23 entry; ROADMAP Active Tools (a.49) RECOMMENDED-NEXT). Goal: close the third of the remaining 4 W#2 polish items; quick UX-clarity win between heavier polish sessions. Closes (a.49) RECOMMENDED-NEXT.

Branch is `workflow-2-competition-scraping`. Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Fix shape (per ROADMAP W#2 polish backlog P-23 dropdown entry; ~50-80 LOC, NO schema change):**

1. **No schema change** — pure UI tweak. Schema-change-in-flight flag stays "No" entire session.

2. **Extension — text-capture-form.ts:** the saved-URL `<select>` populates options like `opt.textContent = row.productName?.trim() || (row.url.length > 80 ? row.url.slice(0, 77) + '…' : row.url)` (around line 450). Today the OR collapses URL out of view whenever productName is set. Replace with a side-by-side label format: `${productName}  —  ${truncatedUrl}` (or similar that director picks via Rule 14f forced-picker — em-dash vs. pipe vs. line-break). Truncation rule: keep both visible without overflow.

3. **Extension — url-add-form.ts:** has a similar `<select>` for the existing-URL picker. Apply the same fix for visual consistency across both forms.

4. **PLOS-side `/projects/[projectId]/competition-scraping/url/[urlId]/` page:** the URL detail page already shows the URL + product name side by side (this isn't a regression). NO change here.

5. **Per Rule 23 Change Impact Audit (pre-classify before code):** UI-only change, no data shape change, no schema change, no API change. Classification: Additive (safe). Zero downstream W#1 / W#3 cross-tool impact.

**Diagnosis steps before coding (same play as today's P-25 session — verify the launch prompt's premises before any code):**

1. Read `extensions/competition-scraping/src/lib/content-script/text-capture-form.ts` around line 450 — confirm the `opt.textContent = row.productName?.trim() ||` pattern exists and matches the launch prompt narrative.
2. Read `extensions/competition-scraping/src/lib/content-script/url-add-form.ts` — find the parallel pattern. If structurally different, surface to director before coding.
3. Grep for any OTHER `<select>` element that lists URL options with the same productName-vs-url collapse pattern. Likely only the two above, but verify.
4. Surface any drift to director BEFORE coding via AskUserQuestion picker.

**Forced-picker before coding (Rule 14f):**

- (A) `${productName}  —  ${url}` em-dash separator (recommended — visually distinct, plain-text, no extra DOM)
- (B) `${productName}  |  ${url}` pipe separator (similar, more compact)
- (C) HTML option with two `<span>`s + CSS for two-line layout (richer but `<option>` styling is limited in most browsers; may not render as intended on all platforms)
- (D) Truncate URL to 30 chars and concat — risks losing the part the director needs to see
- (E) Escape hatch

Per `feedback_recommendation_style.md` (most thorough/reliable): **Option (A)** — em-dash is the conventional UX pattern, works inside `<option>` without CSS tricks, preserves both pieces of information in a scannable way.

**Test coverage decision (Rule 27 forced-picker at session start):**

- (A) Hybrid — node:test unit tests on the label-builder pure function + 1 new Playwright extension-context spec slice asserting the option text shape matches.
- (B) node:test only — defer Playwright to P-22 cross-platform slice work.
- (C) Director manual walkthrough only.
- (D) Escape hatch.

Per `feedback_recommendation_style.md` (most thorough/reliable): **Option (A) Hybrid is the right pick** — matches today's P-25 and yesterday's P-24 risk profiles. The label-builder is small enough to factor into a pure helper for node:test; the Playwright slice catches regression on the on-screen display.

**Pre-deploy verification scoreboard targets (expected baselines from today's deploy session #27 post-state):**

- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npx tsc --noEmit` clean
- `npm run build` clean — **53 routes** (unchanged if no new route)
- `src/lib` node:test: **536/536** (unchanged if no server-side change)
- Extension `npm test`: **416/416** + ~+5-10 new label-builder cases → ~421-426
- Playwright: **78/78** + ~+1 new P-23 spec slice → ~79

**Deploy mechanics (cheat-sheet b — standard W#2 → main deploy):** unchanged. Pre-deploy scoreboard → rebase if main moved → ff-merge → post-merge scoreboard → Rule 9 gate → push main → ping-pong sync → fresh extension build → director sideload + manual verification on real competitor URL with a saved URL that has a product name.

**Director real-website verification at deploy time (Rule 27 scope exception — visual judgment + real-platform DOM):** open the right-click "Add to PLOS — Captured Text" form on a saved URL that has both a product name and a long URL. Confirm BOTH are visible in the saved-URL dropdown without truncation collapse. Same check for the existing-URL picker in url-add-form.

**Group A docs to update at end-of-session:** ROADMAP (header + (a.49) → flip ✅ DONE + new (a.50) RECOMMENDED-NEXT — likely P-22 or P-18 via §4 Step 1c forced-picker); CHAT_REGISTRY (new top entry); DOCUMENT_MANIFEST (header); CORRECTIONS_LOG (header bump + any new entries); NEXT_SESSION (rewritten for the next polish item).

**Group B docs to update at end-of-session:** COMPETITION_SCRAPING_VERIFICATION_BACKLOG (new Deploy session #28 entry + P-23 flipped ✅ DONE); COMPETITION_SCRAPING_DESIGN §B entry capturing the label-format choice.

**Schema-change-in-flight flag:** stays "No" entire session (pure UI tweak; no schema work).

Start by running the mandatory start-of-session sequence.

**Pre-build read list (in addition to mandatory start-of-session sequence):**

- `extensions/competition-scraping/src/lib/content-script/text-capture-form.ts` (line ~450 area — option text formatting).
- `extensions/competition-scraping/src/lib/content-script/url-add-form.ts` — parallel pattern for the existing-URL picker.
- ROADMAP W#2 polish backlog P-23 entry (the dropdown one, not the Amazon right-click one — there's a numbering collision noted in line 111).

## Pre-session notes (optional, offline steps to do between sessions)

If you can: identify 2-3 saved CompetitorUrls in PLOS that have BOTH a product name AND a long URL — those will be your test cases at deploy-time verification.

## Why this pointer was written this way (debug aid)

Today's session shipped P-25 cleanly + verified live on real Chrome (PASS on first try). The §4 Step 1c forced-picker at end-of-session offered 4 options: (A) P-23 [recommended — small surface, quick UX win between heavier P-24/P-25-style sessions], (B) P-22 [defensive coverage], (C) DEFERRED manual-add modal originalSrcUrl tack-on, (D) escape hatch. Director chose to wrap the session without explicitly picking from the forced-picker; per `feedback_session_management.md` (wrap before degrading), Claude defaulted to (A) P-23 as the standing recommended option per `feedback_recommendation_style.md` (most thorough/reliable for this stage of the polish queue). Director can override the pick by editing this file's `## Launch prompt` section before next session start.

**Alternate next-session candidates if director shifts priorities at session start:**

- P-22 Playwright cross-platform slices 2-4 (MEDIUM coverage extension — defensive but not user-visible; could fold into another session).
- Manual-add modal originalSrcUrl tack-on (DEFERRED item from 2026-05-19-e — trivial 1-line addition to `CapturedImageAddModal.tsx` URL-paste path for symmetric persistence with the extension flow).
- P-18 devcontainer Chromium libs (LOW dev ergonomic — small fold-in to any session).
- P-26 below-fold full-page-scroll capture (LOW deferred large lift — last in the queue; current workaround works).

Check `ROADMAP.md` for the canonical state.
