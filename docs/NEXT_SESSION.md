# Next session

**Written:** 2026-05-19-b — `session_2026-05-19-b_w2-main-deploy-session-20-p19-overlay-dismiss-DEPLOYED` (Claude Code; dual-branch — pre-deploy scoreboard on `workflow-2-competition-scraping`, rebase + ff-merge + deploy phases on `main`, ping-pong sync after main push).

**For:** the next Claude Code session.

**Status of W#2 → main deploy session #20:** ✅ **P-19 green status overlay auto-dismiss → one-time selection collapse fix SHIPPED + DEPLOYED to vklf.com.** Closes (a.43) RECOMMENDED-NEXT. Single-commit build-and-deploy session — symmetric mute-discipline fix landed in `already-saved-overlay.ts` (new `ShowAlreadySavedOverlayOptions.muteMutationObserver` prop) + `orchestrator.ts` (passes existing closure-scope wrapper to the overlay site, same one already passed to `startLiveHighlighting` per P-14 fix 2026-05-12-e). Both dismiss paths (5s auto-dismiss timer + close-button click) flow through the single `destroy()` function and therefore both inherit the mute discipline. Drift caught at merge time: main had advanced today via the earlier (-a) P-17 verify-and-close session (commit `27bf4cb`); workflow-2 rebased clean onto main (non-overlapping changesets — mine: extension code; 27bf4cb: docs only); ff-merge `27bf4cb..7e111a8` clean (3 files +230/-2 — all in `extensions/competition-scraping/src/lib/content-script/`); post-merge scoreboard re-run on `main` all GREEN (tsc / ext tsc / `npm run build` 53 routes / src/lib node:test 527/527 / extension `npm test` **352/352** — was 348; **+4 new P-19 cases** / Playwright 75/75); Rule 9 deploy-gate via AskUserQuestion picker → director picked "Deploy now (Rule 9-approved)"; pushed `origin/main 27bf4cb..7e111a8` (Vercel auto-redeployed — web bundle unchanged; P-19 fix lives in extension code only); ping-pong sync clean (workflow-2 push `046e6b4..7e111a8`). **HEADLINE: the cross-platform UX papercut director surfaced 2026-05-12-g (selected text collapses when green overlay auto-dismisses, all 4 platforms) is now closed defensively via existing P-14 mute-discipline infrastructure.** Director-side walkthrough deferred — the 4 new node:test cases assert wrapper invocation on every destroy path (explicit destroy / `hideAlreadySavedOverlay()` / replacement-destroy / default no-op when option omitted) and ARE the regression coverage per Rule 27 default. **§4 Step 1c forced-picker fired** at end-of-session (P-19 wrapped cleanly with no inherent continuation; W#2 polish backlog reduces to a single open item P-13 LOW autofocus + outside-of-backlog deferred items). Director picked **(a.44) RECOMMENDED-NEXT = W#2 polish P-13 LOW autofocus on `workflow-2-competition-scraping`** — most thorough/reliable per `feedback_recommendation_style.md`: closes the W#2 polish backlog completely (only remaining open item) before pivoting to new workstream; lowest risk + smallest scope of remaining options.

---

## Branch

**`workflow-2-competition-scraping`** — W#2 polish work, NOT platform-wide. The `./resume` script will switch you from `main` (where today's 2026-05-19-b deploy session ended) → `workflow-2-competition-scraping`. Verify with `git branch --show-current` immediately after `./resume`; should be on `workflow-2-competition-scraping`, not `main`. If you're still on `main` after `./resume`, STOP and surface to director — `./resume` may have failed silently and director needs to run the ESCAPE HATCH 3-step path manually.

Expected branch state on entry: `workflow-2-competition-scraping` exactly even with `origin/workflow-2-competition-scraping` AND exactly even with `origin/main` (the 2026-05-19-b deploy push + ping-pong sync left both branches at the same SHA `7e111a8`).

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**Ship P-13 — LOW autofocus on "+ Add new…" inline category input** on `workflow-2-competition-scraping` (ROADMAP W#2 polish backlog P-13 entry near line 105; new ROADMAP Active Tools (a.44) RECOMMENDED-NEXT). Goal: close the final remaining open W#2 polish item — director-requested at S4-A-5 — when user picks "+ Add new…" from category dropdown, the inline name-input that appears should auto-receive focus so the user can immediately start typing (currently requires an extra click). Closes (a.44) RECOMMENDED-NEXT. **After P-13 ships, the W#2 polish backlog is EMPTY** and W#2 is ready for either (a) Tool Graduation per HANDOFF_PROTOCOL §4 Step 2 Scenario B, or (b) director's next W#2 feature direction.

Branch is `workflow-2-competition-scraping` (W#2 polish — NOT platform-wide on main). Verify branch state with `git branch --show-current` before any doc reads — should be `workflow-2-competition-scraping`. If you're still on `main`, STOP and surface to director (the `./resume` switch may have failed; recover via the ESCAPE HATCH).

**Fix shape (per ROADMAP W#2 polish backlog P-13 entry near line 105):** ~2 LOC per file × 2 files. Two surfaces:
- `extensions/competition-scraping/src/entrypoints/popup/components/CapturedTextPasteForm.tsx` — the popup-side category dropdown.
- `extensions/competition-scraping/src/lib/content-script/text-capture-form.ts` — the content-script-side category dropdown (in-page overlay).

Both surfaces have the same "+ Add new…" affordance that reveals an inline name-input. Fix: either `inputRef.current?.focus()` via `useEffect` on mount of the inline input, OR the React `autoFocus` prop on the input element. Confirm which pattern fits each file at session start (React popup likely uses `useEffect`; content-script vanilla DOM likely uses `inputElement.focus()` after appendChild).

Schema-change-in-flight flag stays "No" for this entire session (P-13 is UX micro-polish — no schema change, no API change, no shared-types change).

Start by running the mandatory start-of-session sequence.

**Pre-build read list (in addition to mandatory start-of-session sequence):**

- `extensions/competition-scraping/src/entrypoints/popup/components/CapturedTextPasteForm.tsx` — locate the category dropdown + "+ Add new…" option + the inline name-input that appears.
- `extensions/competition-scraping/src/lib/content-script/text-capture-form.ts` — same affordance, vanilla DOM rendering pattern.
- `extensions/competition-scraping/src/lib/content-script/image-capture-form.ts` — same category dropdown probably exists here too (image-capture form); IF YES, fix in 3 files instead of 2; IF NO, leave alone. Confirm via grep for `"+ Add new"` or `add-new-category` or similar at session start.
- ROADMAP W#2 polish backlog P-13 entry (near line 105) — full root-cause + fix-shape narrative.

**P-13 scope + design pattern:**

- Goal: closes the final remaining open W#2 polish item.
- Bug class: missing autofocus → user must click into the inline name-input after the dropdown reveals it; minor friction but adds up across many adds.
- Fix surface: 2-3 files, ~2 LOC each (React-side: `autoFocus` prop or `useEffect` + ref; content-script-side: `inputEl.focus()` after `appendChild`).
- Estimated ~15-25 min code session: locate inline inputs + apply autofocus (~5 LOC total) + verify locally + standard scoreboard + deploy.
- Per Rule 23 Change Impact Audit (pre-classify before code): ADDITIVE — pure UX micro-fix; zero production behavior change outside the inline-input-reveal moment.

**Test coverage decision (Rule 27 forced-picker at session start):**

- (A) No new tests — pure UX micro-fix, behavior is "the cursor shows up in the input"; node:test can't observe focus state; Playwright COULD but is overkill for 2 LOC of `autoFocus`. **Recommend.**
- (B) Add 1-2 Playwright extension cases asserting `document.activeElement === inputEl` after dropdown click. Slightly higher confidence, +10-15 min authoring cost, +2-3 sec Playwright suite time.
- (C) Director's manual smoke verification only — sideload extension, open popup, pick category dropdown, click "+ Add new…", confirm cursor is in inline input. Belt-and-suspenders if A is picked.
- (D) Escape hatch.

Per `feedback_recommendation_style.md` (most thorough/reliable), Option (A) is probably the natural pick — `autoFocus` is essentially declarative React syntax with no edge cases worth a regression test; manual verification at deploy time is sufficient. Confirm at session start via Rule 27 picker.

**Pre-deploy verification scoreboard targets (expected baselines from today's 2026-05-19-b deploy session #20 post-state):**

- `npx tsc --noEmit` clean
- `cd extensions/competition-scraping && npx tsc --noEmit` clean
- `npm run build` clean — **53 routes** (unchanged; no new routes)
- `src/lib` node:test: **527/527** unchanged (P-13 is extension UI only)
- Extension `npm test`: **352/352** unchanged (no new tests if Option A picked; +1-2 if Option B picked)
- Playwright: **75/75** unchanged (or +1-2 if Option B picked)

**Deploy mechanics (cheat-sheet b — standard W#2 → main deploy):**

1. Pre-deploy scoreboard on `workflow-2-competition-scraping` (all 6 checks above).
2. Rebase / ff-merge workflow-2 onto `main` via the standard sequence (rebase no-op expected if no parallel main activity; otherwise rebase first then ff-merge).
3. Post-merge scoreboard re-run on `main` (full Playwright re-run per `feedback_recommendation_style.md` for thoroughness).
4. Rule 9 deploy gate via AskUserQuestion with the standard 4-option picker (Deploy now / Hold / Hold + reason / Question first). Recommend "Deploy now (Rule 9-approved)."
5. `git push origin main` → Vercel auto-redeploys (~1-2 min). **Note: P-13 is extension code; the Vercel web bundle is unchanged**, so the redeploy is a no-op for the live web app. The push is still required to publish the code + run CI on the latest commit.
6. Ping-pong sync: `git push origin workflow-2-competition-scraping` (fast-forward) per Rule 25.
7. Fresh extension build via `rm -rf extensions/competition-scraping/.output && cd extensions/competition-scraping && npx wxt build && npx wxt zip` → zip lands in `extensions/competition-scraping/.output/*.zip`; rename + copy to repo root as `plos-extension-2026-05-NN-w2-deploy-21.zip`.

**Director re-verify on real Independent Website URL (very brief — 1-2 min visual check):**

After sideloading the fresh extension build, open the popup (or click "Capture text" overlay on any 4-platform page), find the category dropdown, click "+ Add new…", confirm the cursor immediately shows in the inline name-input WITHOUT clicking. Should work on both popup-side (CapturedTextPasteForm) AND content-script-side (text-capture-form overlay). Per Rule 27 — visual UX micro-fix, director's eye is the test; no Playwright forced-picker fires (Option A path).

**Per Rule 23 Change Impact Audit (pre-classify before code):** ADDITIVE — pure UX micro-fix; zero production behavior change outside the inline-input-reveal moment.

**Group A docs to update at end-of-session:** ROADMAP (header + (a.44) → flip ✅ DONE + new (a.45) RECOMMENDED-NEXT pick — likely W#2 graduation per HANDOFF_PROTOCOL §4 Step 2 Scenario B OR new workflow #3 first session per Rule 18; settle via §4 Step 1c forced-picker because P-13 closes the entire W#2 polish backlog); CHAT_REGISTRY (new top entry); DOCUMENT_MANIFEST (per-doc flag timestamps); CORRECTIONS_LOG (header bump + any new entries); NEXT_SESSION (rewritten for the next pick).

**Group B docs to update at end-of-session:** COMPETITION_SCRAPING_VERIFICATION_BACKLOG (new Deploy session #21 entry + P-13 ⏳ OPEN → ✅ DONE). COMPETITION_SCRAPING_DESIGN may not need an entry (UX micro-fix doesn't change design intent).

## Pre-session notes (optional, offline steps to do between sessions)

None. P-13 is an all-Claude-Code session — no offline preparation needed. Director's role during this session: pick the test coverage approach via Rule 27 forced-picker at session start (probably Option A — no tests); pick "Deploy now" via Rule 9 AskUserQuestion gate at the deploy step; pick the next session's task via §4 Step 1c interview at end (W#2 polish backlog will be EMPTY after P-13; the picker covers W#2 Graduation vs. W#3 start vs. W#1 re-entry).

## Why this pointer was written this way (debug aid)

Today's W#2 → main deploy session #20 brought P-19 (green status overlay auto-dismiss → selection-collapse fix) to vklf.com cleanly via the symmetric mute-discipline pattern established by P-14. The W#2 polish backlog now reduces to a SINGLE open item — P-13 (LOW autofocus on "+ Add new…" inline category input). Director picked **(a.44) RECOMMENDED-NEXT = P-13 autofocus on `workflow-2-competition-scraping`** via §4 Step 1c forced-picker as the most thorough/reliable next pick — closes the W#2 polish backlog completely before any pivot to a new workstream; lowest risk + smallest scope of remaining options (vs. W#1 re-entry, vs. W#3 first session). After P-13 ships, W#2 is ready for graduation or for director's next W#2 feature direction.

**Alternate next-session candidates if director shifts priorities at session start:**

- W#2 Tool Graduation per HANDOFF_PROTOCOL §4 Step 2 Scenario B (split ACTIVE → ARCHIVE + DATA_CONTRACT; finalize HRL; emit Resume Prompt template) — only if director declares W#2 complete; otherwise the polish backlog gap (P-13) is the blocker.
- Start W#3 Therapeutic Strategy first session per Rule 18 Workflow Requirements Interview — large lift (~90-150 min) but advances platform arc forward.
- W#1 graduated-tool re-entry per Rule 22 (only if Keyword Clustering issue surfaces from natural use).
- Fresh natural-use surface (anything director discovered since 2026-05-19-b doc-batch push).

Check `ROADMAP.md` for the canonical state. **After P-13 ships:** the W#2 polish backlog is EMPTY; next session is either W#2 graduation, W#3 first session, or W#1 re-entry — settled via §4 Step 1c forced-picker.
