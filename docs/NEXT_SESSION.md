# Next session

**Written:** 2026-05-20 (`session_2026-05-20_w2-main-deploy-session-29-p22-cross-platform-slices-DEPLOYED` — end-of-session handoff after P-22 cross-platform regression coverage shipped and deployed).

**For:** the next Claude Code session (P-18 task; details below).

---

## Status of today's session

**P-22 Playwright cross-platform slices 2-4** SHIPPED + DEPLOYED on vklf.com. Build commit `f4e90ec`. Closes (a.50) RECOMMENDED-NEXT.

Pre-deploy + post-merge scoreboards both GREEN: tsc / ext tsc / `npm run build` **53 routes** / src/lib node:test **536/536** (unchanged) / extension `npm test` **428/428** (unchanged — no extension source change) / Playwright **91/91** (was 79; **+12 new per-platform specs** = P-23 +3 + P-24 +3 + P-25 +6). Fresh zip `plos-extension-2026-05-20-w2-deploy-29.zip` (191,561 bytes; **byte-identical to deploy-28's zip** — confirms the predicted byte-identical-bundle outcome when extension source is unchanged). Director real-Chrome verification SKIPPED per Rule 27 scope-exception (pure regression coverage extension; no user-visible behavior change; Playwright suite IS the verification).

4 of W#2 polish items SHIPPED this week (P-24 + P-25 + P-23 + P-22); **3 W#2 polish items remain** (P-18 + P-26 + P-27) before W#2 graduation per director's standing directive. Estimated ~7-15 more W#2 polish sessions before graduation (P-27 captured-videos alone is ~6-12 sessions).

---

## Branch

**`workflow-2-competition-scraping`** — W#2 polish work, NOT platform-wide. The `./resume` script will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

Expected branch state on entry: `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` AND exactly even with `origin/main`. Both branches at the same SHA after today's deploy-#29 main push + ping-pong sync + end-of-session doc-batch push + ping-pong.

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**Ship P-18 — devcontainer postCreateCommand for Playwright Chromium system libraries** on `workflow-2-competition-scraping` (ROADMAP W#2 polish backlog P-18 entry; ROADMAP Active Tools (a.51) RECOMMENDED-NEXT). Goal: add a `.devcontainer/devcontainer.json` (or update the existing one if present) with a `postCreateCommand` (or `onCreateCommand`) that auto-installs the Playwright Chromium system libs (libgbm1 + libnss3 + libasound2t64 + libatk-1.0-0 + libatk-bridge2.0-0 + libxfixes3 + libnspr4 + others per the README's "Running the Playwright regression tests" section workaround) so that fresh Codespaces can run `npm run test:e2e:all` zero-touch. Sub-1-hour session. Closes (a.51) RECOMMENDED-NEXT.

Branch is `workflow-2-competition-scraping`. Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**Fix shape (per ROADMAP W#2 polish backlog P-18 entry; ~30-100 LOC of config + small shell stanza; NO source code change; NO schema change; NO test change):**

1. **No schema change** — pure devcontainer-config work. Schema-change-in-flight flag stays "No" the entire session.

2. **No source code change** — only `.devcontainer/devcontainer.json` (or equivalent Codespace config) touched.

3. **No test additions** — the verification IS rebuilding a fresh Codespace and confirming `npm run test:e2e:all` runs zero-touch (Rule 27 forced-picker fires at session start to pick between Director-walkthrough, hybrid simulation via `apt-get purge`, or pure-design-only-on-this-pass).

4. **First check:** does `.devcontainer/devcontainer.json` exist today? Search the repo root and `.devcontainer/` subdirectory. The ROADMAP P-18 capture says "no `.devcontainer/` directory exists today" but verify per Rule 3 (code wins; documentation may be stale).
   - If it exists → add/extend the `postCreateCommand` (or `onCreateCommand`) field with the lib-install stanza. Preserve any other postCreateCommand work already there by chaining (`&&` or `;` depending on idempotency needs).
   - If it doesn't exist → create the file with the minimum-viable schema + the postCreateCommand stanza.

5. **The lib-install stanza shape:** mirror the manual workaround documented in `README.md` §"Running the Playwright regression tests" — the workaround that today involves temporarily disabling `/etc/apt/sources.list.d/yarn.list` (because of an unverifiable GPG signature blocking `apt update`), running `apt update + apt install -y libgbm1 libnss3 libasound2t64 ...`, then restoring yarn.list. Encode the same sequence as a `postCreateCommand` shell one-liner OR a small `.devcontainer/install-playwright-deps.sh` script invoked from `postCreateCommand`.

6. **Per Rule 23 Change Impact Audit (pre-classify before code):** Additive (safe). Config-only change. No source code change. No schema change. No API change. No test change. Zero downstream W#1 / W#3 cross-tool impact. The change only takes effect on **fresh Codespace builds** — existing Codespaces are unaffected.

**Diagnosis steps before coding (verify the launch prompt's premises before any code):**

1. Run `ls -la .devcontainer/ 2>/dev/null || echo "no .devcontainer dir"` to confirm the today's state.
2. Read `README.md` §"Running the Playwright regression tests" — confirm the exact lib list director runs manually today + the yarn.list workaround.
3. Read `package.json` to confirm `npm run test:e2e:all` is the actual canonical command (or whatever it is; just verify the script name).
4. Look at Playwright's published `--with-deps` lib list at `node_modules/playwright/lib/server/registry/dependencies.js` (or wherever it lives in this Playwright version) — the canonical list is the ground truth.
5. Sanity-check whether a `--with-deps` workaround actually works today (the README claims it doesn't because of the yarn.list GPG issue — verify per Rule 3).
6. Surface any drift to director BEFORE coding via AskUserQuestion picker.

**Forced-picker before coding (Rule 14f):**

The fix is narrow but the SHAPE choice matters:

- (A) Inline `postCreateCommand` string in `devcontainer.json` (recommended if it fits on one line; ~50-80 chars; lowest config surface)
- (B) Separate `.devcontainer/install-playwright-deps.sh` script invoked from `postCreateCommand` (cleaner separation; ~30-40 LOC bash; idempotent + commented; recommended if the install sequence has multiple steps including the yarn.list dance)
- (C) Use Playwright's `--with-deps` flag in the script if it works (smaller surface; might not work per README) — verify with a quick test
- (D) Escape hatch

Per `feedback_recommendation_style.md` (most thorough/reliable): likely **Option (B)** — the install sequence has multiple steps (disable yarn.list + apt update + apt install + restore yarn.list) and benefits from being in a versioned script with comments; the script can be re-run from any Codespace as a recovery tool if `postCreateCommand` didn't run.

**Test coverage decision (Rule 27 forced-picker at session start — directly relevant since this is dev-environment ergonomics):**

- (A) Director walkthrough on a fresh Codespace rebuild (recommended — only way to PROVE the postCreateCommand actually runs on a fresh container; cost ~10 minutes including waiting for the rebuild)
- (B) Hybrid: simulate the fresh state via `sudo apt-get purge libgbm1 libnss3 ...` + then `bash .devcontainer/install-playwright-deps.sh` standalone + then `npm run test:e2e:all` (faster than a full rebuild; doesn't validate the `postCreateCommand` invocation itself, only the script contents)
- (C) Pure-design-only-on-this-pass — ship the config, defer real verification to whenever the next fresh Codespace happens organically (lowest-cost; lowest-signal)
- (D) Escape hatch

Per `feedback_recommendation_style.md`: **Option (A) Director walkthrough on a fresh Codespace rebuild** — only this proves the wiring actually fires. Acceptable to also do (B) as a fast smoke before (A) if director time is constrained.

**Pre-deploy verification scoreboard targets (expected baselines from today's deploy session #29 post-state):**

- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npx tsc --noEmit` clean
- `npm run build` clean — **53 routes** (unchanged — no new route)
- `src/lib` node:test: **536/536** (unchanged — no server-side change)
- Extension `npm test`: **428/428** (unchanged — no extension source change)
- Playwright: **91/91** (unchanged — no test additions expected since this is a config-only ship)

**Deploy mechanics (cheat-sheet b — standard W#2 → main deploy):** unchanged. Pre-deploy scoreboard → rebase if main moved → ff-merge → post-merge scoreboard → Rule 9 gate → push main → ping-pong sync → fresh extension build (no source change so the bundle is byte-identical except possibly for a wxt-imposed build hash; cheap rebuild). Real-Chrome verification fires per Rule 27 picker outcome above — Option (A) director walkthrough on a fresh Codespace rebuild is the gold standard; the postCreateCommand only fires on fresh-Codespace creation.

**Group A docs to update at end-of-session:** ROADMAP (header + P-18 polish backlog entry flipped ✅ SHIPPED-AT-DEPLOY-LEVEL 2026-05-XX + (a.51) → ✅ DONE + new (a.52) RECOMMENDED-NEXT — likely P-26 or P-27 design-only via §4 Step 1c forced-picker); CHAT_REGISTRY (new top entry); DOCUMENT_MANIFEST (header bump only — no doc add/remove unless `.devcontainer/install-playwright-deps.sh` is created and listed there); CORRECTIONS_LOG (header bump + any new entries — possibly a CHROMIUM-LIB-LIST-STALENESS §Entry if the Playwright `--with-deps` lib list has drifted from the README's manually-curated list); NEXT_SESSION (rewritten for the next polish item — likely P-26 or P-27 design-only).

**Group B docs to update at end-of-session:** COMPETITION_SCRAPING_VERIFICATION_BACKLOG (new Deploy session #30 entry + P-18 flipped ✅ DONE). COMPETITION_SCRAPING_DESIGN unchanged (config-only change doesn't change design intent — no §B entry needed; mirrors the 2026-05-19-d P-16 + 2026-05-20 P-22 precedents).

**Schema-change-in-flight flag:** stays "No" entire session (config-only change; no schema work).

Start by running the mandatory start-of-session sequence.

**Pre-build read list (in addition to mandatory start-of-session sequence):**

- `.devcontainer/devcontainer.json` (if it exists — verify per Rule 3).
- `README.md` §"Running the Playwright regression tests" (the canonical manual workaround director runs today).
- `package.json` (verify `npm run test:e2e:all` script name).
- ROADMAP W#2 polish backlog P-18 entry.

## Pre-session notes (optional, offline steps to do between sessions)

If director is willing to schedule a fresh Codespace rebuild during this session for verification (Option A), no offline prep needed — the rebuild happens via Codespace UI ("Rebuild Container" command). If director prefers to test the postCreateCommand in a side-Codespace or via a colleague's fresh checkout, no special prep needed either.

## Why this pointer was written this way (debug aid)

Today's session shipped P-22 cleanly + scoreboards all GREEN (Playwright at 91/91, +12 over deploy-28). The §4 Step 1c forced-picker offered 4 options: (A) P-18 devcontainer Chromium libs [recommended — smallest scope; sub-1-hour; closes a recurring fresh-Codespace friction point], (B) P-26 below-fold full-page-scroll capture [largest lift; ~600-1000 LOC; documented workaround works], (C) P-27 captured-videos design session [substantive new feature; first session would be design-only; needs 6-12 sessions total], (D) escape hatch. Director picked (A) P-18 per `feedback_recommendation_style.md` standing preference (most thorough/reliable — small + reversible + closes a real ergonomics gap that affects every fresh Codespace). Director can override the pick by editing this file's `## Launch prompt` section before next session start.

**Alternate next-session candidates if director shifts priorities at session start:**

- **P-26 below-fold full-page-scroll capture** (LOW deferred large lift — last in the queue; current workaround works; ~600-1000 LOC). Captures content below the initial viewport on long product pages via programmatic scroll-and-capture before stitching into a single full-page image.
- **P-27 Captured-videos feature DESIGN SESSION** (substantive new feature; first session is design-only — no code; runs the full design interview that the 2026-05-19-g-2 capture punted to a dedicated session). Estimated ~6-12 sessions total post-design: schema migration + bucket setup + API routes + extension content-script + popup forms + saved-video indicator + URL detail renderer + single-platform amazon Playwright spec + optional polish. Open design questions: Supabase bucket strategy; thumbnail extraction approach; schema additions; YouTube/Vimeo handling; cross-platform `<video>` detection. **The first P-27 session is design-only (no code) — director-confirmed picks 2026-05-19-g-2: URL reference + uploaded bytes BOTH stored; full UX symmetry with text/image; pre-graduation gating.** Full details: ROADMAP P-27 entry + COMPETITION_SCRAPING_DESIGN §B 2026-05-19-g-2 entry.
- **Manual-add modal originalSrcUrl tack-on** (DEFERRED from 2026-05-19-e — trivial 1-line; could fold into any P-NN session).
- **Investigate the wxt-build-hang issue more deeply** if it recurs (informational item only; not on the W#2 polish backlog). 2026-05-20's session saw the hang NOT recur (counter-evidence to the prior 2026-05-19-f + 2026-05-19-g recurring-hang observations).

Check `ROADMAP.md` for the canonical state.
