# Next session

**Written:** 2026-05-21 (`session_2026-05-21_w2-main-deploy-session-30-p18-devcontainer-DEPLOYED-VERIFICATION-DEFERRED` — end-of-session handoff after P-18 devcontainer postCreateCommand shipped + deployed but director real-Chrome (fresh-Codespace-rebuild) verification deferred to the next session due to the Codespace-rebuild-kills-running-session coupling discovered mid-session).

**For:** the next Claude Code session (P-18 verification re-entry — collect the PASS/FAIL result from director's Codespace-rebuild walkthrough that happens between this session and the next, then close P-18 fully + fire §4 Step 1c forced-picker for the actual NEXT polish item).

---

## Status of today's session

**P-18 devcontainer postCreateCommand for Playwright Chromium system libraries SHIPPED + DEPLOYED on vklf.com** (functional no-op for end users — pure developer-environment ergonomics). Build commit `49c6403` on `workflow-2-competition-scraping`; ff-merged clean onto `main` (`bc60ee1..49c6403` — main hadn't moved since yesterday's 2026-05-20 deploy-#29 + doc-batch); pushed origin/main → Vercel auto-redeploy (web no-op — config-only change) → ping-pong sync to workflow-2 (both branches at `49c6403`).

**PARTIAL CLOSE on (a.51) RECOMMENDED-NEXT P-18.** The two-file config landed correctly (`.devcontainer/devcontainer.json` minimum-viable config + `.devcontainer/install-playwright-deps.sh` 54 LOC idempotent bash script with `EXIT trap` to always restore yarn.list even on failure; mode 100755). But **the director real-Chrome verification was DEFERRED to the next session** because the only path that proves the postCreateCommand wiring actually fires (director's earlier Rule 27 Option A pick = fresh-Codespace-rebuild walkthrough) requires tearing down the running container — which kills Claude's terminal mid-session. Director picked **"Wrap up this session now — verify after on your own time (recommended)"** at the mid-session Rule 14f follow-up picker.

**Pre-deploy + post-merge scoreboards both GREEN at exact 2026-05-20 baselines** (identical pre + post — confirms the config-only nature of the change): tsc / ext tsc / `npm run build` **53 routes** (unchanged) / src/lib node:test **536/536** (unchanged) / extension `npm test` **428/428** (unchanged) / Playwright **91/91** in 2.0 min pre-deploy + 2.1 min post-merge (unchanged). Fresh zip `plos-extension-2026-05-21-w2-deploy-30.zip` at repo root (191,561 bytes — **byte-identical to deploy-29's + deploy-28's; third consecutive byte-identical extension bundle**, since no extension source has changed since the P-23 ship on 2026-05-19-g).

Schema-change-in-flight stayed "No" the entire session. Per Rule 23 Change Impact Audit: Additive (safe). Config-only. No source code, no schema, no API, no test additions. Zero downstream W#1 / W#3 cross-tool impact. Only affects fresh Codespace builds; existing Codespaces unaffected.

---

## Branch

**`workflow-2-competition-scraping`** — W#2 polish work. The `./resume` script will switch you to `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`. If you're on `main`, STOP and surface to director.

**Expected branch state on entry:** `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` AND exactly even with `origin/main`. Both branches at the same SHA after this session's deploy-#30 main push + ping-pong sync + end-of-session doc-batch push + ping-pong (the doc-batch commit SHA becomes the new shared tip).

---

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:

**P-18 verification re-entry — collect PASS/FAIL from director's Codespace-rebuild walkthrough, then close P-18 fully + fire §4 Step 1c forced-picker for the actual NEXT polish item** on `workflow-2-competition-scraping`. Closes (a.52) RECOMMENDED-NEXT.

Branch is `workflow-2-competition-scraping`. Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director.

**First task — Rule 14f forced-picker before any other work:**

Ask director — via AskUserQuestion — whether the Codespace rebuild walkthrough has already happened between sessions:

- **(A) PASS — director already rebuilt + ran `npm run test:e2e:all` + it passed cleanly without manual lib install** → proceed to close P-18 fully (flip ROADMAP P-18 entry + W#2 Active Tools row + COMPETITION_SCRAPING_VERIFICATION_BACKLOG P-18 verification line to ✅ VERIFIED 2026-05-21+ + close (a.52)); then fire §4 Step 1c forced-picker for the NEXT polish item.
- **(B) FAIL — director rebuilt but `npm run test:e2e:all` reported a missing-library error (or postCreateCommand didn't run at all)** → diagnose-and-fix mode. Likely candidates: (1) Codespaces didn't pick up the new devcontainer.json on rebuild (rare but possible — verify via `cat /proc/1/cmdline` or container metadata); (2) the install-playwright-deps.sh script failed at the apt-get step (check `~/.npm/_logs/` or postCreateCommand output if available); (3) yarn.list disable/restore dance didn't execute (check `ls /etc/apt/sources.list.d/` — yarn.list should be present after install). Surface the failure mode + a Rule 14f fix-shape picker to director before any code.
- **(C) NOT YET — director hasn't had time to rebuild + test yet** → walk the director through the rebuild walkthrough click-by-click in this session (Codespaces command palette → "Codespaces: Rebuild Container" → wait ~5-10 min for the rebuild → open fresh terminal → `cd /workspaces/brand-operations-hub && npm run test:e2e:all` → capture PASS/FAIL). **NOTE:** if director picks (C), Claude's session terminal will be killed by the rebuild — same coupling as 2026-05-21. So (C) effectively becomes another session pause; the practical handoff is: walk director through the rebuild steps verbally, then end this session with a NEXT_SESSION.md amendment recording where we are, and the actual verify-result-collection moves to the session after.
- **(D) Escape hatch** — director wants to skip P-18 verification entirely + accept it as ✅ SHIPPED-AT-DEPLOY-LEVEL forever, treating the postCreateCommand as documented-but-not-proven; closes (a.52) without the rebuild walkthrough.

**Per `feedback_recommendation_style.md` (most thorough/reliable) + `feedback_default_to_recommendation.md`:** if director already has a PASS/FAIL (A or B) ready, that's the natural path. If not yet (C), walk through the rebuild verbally + end with another amendment + defer collection to the session after. (D) is available but de-emphasized — the whole point of P-18 was zero-touch Codespace bring-up; not proving it leaves the value-prop unverified.

**Pre-build read list (in addition to mandatory start-of-session sequence):**

- `docs/ROADMAP.md` lines 1-30 (header) + the (a.51) + (a.52) Active Tools entries + the P-18 polish backlog entry near line 137 (after this session's flip, should show ✅ SHIPPED-AT-DEPLOY-LEVEL 2026-05-21 — verification pending Codespace rebuild walkthrough).
- `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` lines 1-30 (header) + the new "Deploy session #30" section at the end (the verification PENDING line is captured there as the canonical entry for the rebuild walkthrough director performs offline).
- `.devcontainer/devcontainer.json` (the file shipped this session — verify its contents on disk per Rule 3).
- `.devcontainer/install-playwright-deps.sh` (the script shipped this session — verify mode 100755 + the EXIT trap shape).
- `README.md` §"Running the Playwright regression tests" lines 50-74 (canonical manual workaround that the script mirrors; reference shape for what "PASS" looks like).

**On PASS (option A or successful (C) result later) — close-out steps:**

1. Flip ROADMAP P-18 polish backlog entry status from "✅ SHIPPED-AT-DEPLOY-LEVEL 2026-05-21 — verification pending Codespace rebuild walkthrough" to "✅ DONE-AND-VERIFIED 2026-05-21+ (director Codespace-rebuild walkthrough PASS — fresh Codespace ran `npm run test:e2e:all` without manual lib install)".
2. Flip ROADMAP Active Tools (a.51) entry to ✅ DONE-AND-VERIFIED (currently ✅ SHIPPED-AT-DEPLOY-LEVEL — verification deferred to (a.52)).
3. Close (a.52) RECOMMENDED-NEXT (P-18 verification re-entry).
4. Add a verification-PASS line to COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md's Deploy session #30 entry.
5. Fire §4 Step 1c forced-picker for the actual NEXT polish item. Likely candidates:
   - **(a) P-26 below-fold full-page-scroll capture** — LOW-severity UX gap; ~600-1000 LOC; large lift; documented workaround works.
   - **(b) P-27 captured-videos feature DESIGN SESSION** — substantive new feature; first session is design-only; needs 6-12 sessions total post-design.
   - **(c) Manual-add modal originalSrcUrl tack-on** (DEFERRED from 2026-05-19-e — trivial 1-line; could fold into any P-NN session).
   - **(d) Escape hatch.**
   Per `feedback_recommendation_style.md`: the recommendation depends on director's tolerance for session-count to W#2 graduation. P-26 is the smaller path (~1-2 sessions); P-27 is the larger path (~6-12 sessions); both must ship before W#2 graduation per the standing directive.

**On FAIL (option B) — diagnose-and-fix:**

1. Capture the exact error text from `npm run test:e2e:all` (likely shape: `error while loading shared libraries: libXXX.so.0`).
2. Compare to the canonical lib list in `.devcontainer/install-playwright-deps.sh` line ~20-30 — does the missing lib appear in the script?
   - If YES → the script ran but the apt-get install didn't actually install it. Likely cause: yarn.list disable failed; apt update returned stale; apt install hit a 404 on the lib. Check the postCreateCommand log if Codespaces preserved it (usually under `/tmp/` or `/var/log/codespaces/`).
   - If NO → the lib list in the script is incomplete vs. what Playwright actually needs in this Codespaces image. Add it + bump the lib list; ship a P-18 follow-up fix.
3. After fix lands, repeat the rebuild walkthrough to re-verify.

**Schema-change-in-flight flag:** stays "No" entire session (verification re-entry; if FAIL → bug fix still config-only; no schema work either way).

**Pre-deploy verification scoreboard targets (if any code change ships):**

- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npx tsc --noEmit` clean
- `npm run build` clean — **53 routes** (unchanged — no new route)
- `src/lib` node:test: **536/536** (unchanged — no server-side change)
- Extension `npm test`: **428/428** (unchanged — no extension source change)
- Playwright: **91/91** (unchanged — no test additions expected for verification close-out)

If the FAIL path triggers a real config fix, deploy mechanics are cheat-sheet (b) — Rule 9-gated AskUserQuestion deploy gate, ff-merge, ping-pong sync. Fresh extension zip expected byte-identical AGAIN (config-only).

**Group A docs to update at end-of-session:** ROADMAP (header + (a.51) flipped to ✅ DONE-AND-VERIFIED if PASS or amended if FAIL + new (a.53) RECOMMENDED-NEXT for the picked next polish item + P-18 polish backlog entry annotated with the verification outcome); CHAT_REGISTRY (new top entry); DOCUMENT_MANIFEST (header bump only — no doc add/remove unless the FAIL path adds a new file); CORRECTIONS_LOG (header bump + any new entries — if the FAIL path surfaces a slip, capture it; if PASS, header-bump only); NEXT_SESSION (rewritten for the new picked next polish item).

**Group B docs to update at end-of-session:** COMPETITION_SCRAPING_VERIFICATION_BACKLOG (new "Deploy session #30 verification close-out" addendum entry + P-18 verification PENDING → PASS or FAIL flip). COMPETITION_SCRAPING_DESIGN unchanged (verification-only close-out; no design intent change).

Start by running the mandatory start-of-session sequence, then fire the first task's Rule 14f forced-picker (A/B/C/D above) before any other work.

---

## Pre-session notes (offline steps for director between sessions)

**This is the load-bearing offline step.** Between this session and the next:

1. Open the Codespace's command palette (View menu → "Command Palette…" or `Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Type "Codespaces: Rebuild Container" and select it. **Note:** the simpler "Rebuild Container" command (Dev Containers extension) may also work, but "Codespaces: Rebuild Container" is the Codespaces-specific one that picks up the new `.devcontainer/devcontainer.json` on a fresh container build.
3. Confirm the rebuild prompt. The container will tear down + rebuild over ~5-10 minutes. Claude Code's terminal in the current Codespace will be killed during this — that's expected.
4. After the rebuild completes, the Codespace will reload with a fresh container. **Open a fresh terminal** (Terminal menu → "New Terminal" or Ctrl+\` / Cmd+\`).
5. Run `cd /workspaces/brand-operations-hub && npm run test:e2e:all`.
6. Record the result:
   - **PASS** = Playwright suite runs to completion (~2 min) and reports 91/91 passed. The postCreateCommand fired during the rebuild, installed the libs, and Chromium has everything it needs.
   - **FAIL** = error message containing `error while loading shared libraries: libXXX.so.0` or similar. Copy the full error message verbatim.
7. Bring the PASS/FAIL + any error text to the next Claude session as input to the first task's Rule 14f forced-picker.

**Time budget for the offline step:** ~10-15 minutes (5-10 min rebuild + 2 min test run + a few min to inspect output). Sub-15-minute task.

---

## Why this pointer was written this way (debug aid)

Today's session shipped P-18 cleanly + scoreboards all GREEN at exact baselines (config-only nature of the change confirmed by identical pre + post scoreboards + third consecutive byte-identical extension zip). The intended verification path was Option A from the original Rule 27 forced-picker — director-walkthrough on a fresh Codespace rebuild — but mid-session it became clear that rebuilding the Codespace kills the running Claude terminal (since Claude IS running inside the container being rebuilt). I surfaced this coupling to director via a Rule 14f follow-up picker (verify-now-with-session-death vs. wrap-and-verify-after vs. skip-verification) and director picked the recommended "Wrap up this session now — verify after on your own time" option.

So this NEXT_SESSION.md is written to handle the three-way A/B/C outcome of what director did between sessions. The first task is the A/B/C/D picker; everything else flows from the picker outcome. Director can override the pick by editing this file's `## Launch prompt` section before next session start.

**Alternate next-session candidates if director shifts priorities at session start (after P-18 verification closes):**

- **P-26 below-fold full-page-scroll capture** (LOW-severity deferred large lift — last in the queue; current workaround works; ~600-1000 LOC). Captures content below the initial viewport on long product pages via programmatic scroll-and-capture before stitching into a single full-page image. **Recommended next** if director wants to wrap W#2 polish on the smaller-scope path.
- **P-27 Captured-videos feature DESIGN SESSION** (substantive new feature; first session is design-only — no code; runs the full design interview that the 2026-05-19-g-2 capture punted to a dedicated session). Estimated ~6-12 sessions total post-design. Open design questions: Supabase bucket strategy; thumbnail extraction approach; schema additions; YouTube/Vimeo handling; cross-platform `<video>` detection. **The first P-27 session is design-only (no code) — director-confirmed picks 2026-05-19-g-2: URL reference + uploaded bytes BOTH stored; full UX symmetry with text/image; pre-graduation gating.**
- **Manual-add modal originalSrcUrl tack-on** (DEFERRED from 2026-05-19-e — trivial 1-line; could fold into any P-NN session).
- **Investigate the wxt-zip parent-process hang behavior session-over-session.** Today's session saw the hang recur (matching 2026-05-19-f + 2026-05-19-g; counter-evidence to 2026-05-20's clean run). Hang pattern: artifact correctly on disk at ~5-15 sec mark; parent process never exits; `pkill -f "wxt zip"` is the workaround. Worth a dedicated investigation session if it keeps recurring across deploys.

Check `ROADMAP.md` for the canonical state.
