# Next session

**Written:** 2026-05-14 — session_2026-05-14_w2-polish-session-18-p23-amazon-right-click-context-menu-SHIP (Claude Code, on `workflow-2-competition-scraping`).

**For:** the next Claude Code session, whatever it is.

**Status of P-23 (Amazon main-image right-click context-menu):** ✅ **SHIPPED-AT-CODE-LEVEL today** on `workflow-2-competition-scraping`. One commit on the workflow-2 branch contains the code + tests + doc batch together. Pre-ship verification scoreboard all GREEN: ext tsc clean; ext `npm test` 334/334; root Playwright extension project 31/31; ext build clean; content.js 62,437 → 63,038 bytes (+601 bytes). Real-Amazon browser verification DEFERRED to this next session (the standard W#2 ship-then-deploy pattern).

---

## Branch
workflow-2-competition-scraping

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**W#2 → main deploy session #13 — P-23 Amazon main-image right-click context-menu fix DEPLOYED to vklf.com.** Closes (a.28) RECOMMENDED-NEXT. Standard cheat-sheet (b) flow — rebase `workflow-2-competition-scraping` onto `origin/main`, ff-merge to `main`, push origin/main, package fresh extension zip, real-Amazon browser verification.

**What's on workflow-2 ahead of main:** ONE commit (today's P-23 ship: code + tests + doc batch in a single commit). Cleanest possible deploy shape — `git log origin/main..workflow-2-competition-scraping` should show 1 commit; `git log workflow-2-competition-scraping..origin/main` should show 0 commits (no parallel main activity since today's deploy-#12 ff-merge that landed P-20).

**Per HANDOFF_PROTOCOL.md Rule 25 + MULTI_WORKFLOW_PROTOCOL.md, this is a dual-branch session** — rebase phase on `workflow-2-competition-scraping`, ff-merge + deploy push + browser verification on `main`. Verify branch state with `git branch --show-current` before any doc reads — the `./resume` script will have placed you on workflow-2 per the Branch field above; if not, STOP and surface to director. **Per the 2026-05-14 launch-prompt-staleness CORRECTIONS_LOG entry, at session start run `git log origin/main..workflow-2-competition-scraping` AND `git log workflow-2-competition-scraping..origin/main` BEFORE reading this launch prompt's framing as authoritative.**

**Pre-deploy verification scoreboard targets (re-run before commit on workflow-2 branch; rebase is a no-op so the results carry to main):**

  - ext `npx tsc --noEmit -p tsconfig.json` — expect CLEAN.
  - ext `npm test` — expect **334/334** (the P-23 fix shipped today; baseline confirmed in session).
  - root `npx playwright test --project=extension` — expect **31/31** GREEN (the 2 new P-23 specs shipped today; baseline confirmed in session).
  - ext `npm run build` — expect CLEAN; content.js ≈ **63,038 bytes** (the P-23 fix's content.js byte target).

**Deploy mechanics (cheat-sheet (b)):**

1. `cd /workspaces/brand-operations-hub && git fetch origin` (already done by `./resume`).
2. Verify `git log origin/main..workflow-2-competition-scraping` = 1 commit (today's P-23 ship); `git log workflow-2-competition-scraping..origin/main` = 0 commits.
3. `git rebase origin/main` from workflow-2 — should be a no-op fast-forward (no parallel main activity since deploy-#12). If conflicts surface (unlikely), STOP + surface to director per Rule 8 destructive-op gate.
4. `git push --force-with-lease origin workflow-2-competition-scraping` (Rule 8+9 STOP — Rule 9 deploy describe + verify-approach picker before any push).
5. `git checkout main && git pull --rebase origin main` — should be clean.
6. `git merge --ff-only workflow-2-competition-scraping` — should advance main by exactly 1 commit.
7. `git push origin main` (Rule 8+9 STOP — the actual deploy push; Vercel auto-redeploy is a no-op for the web bundle since zero `src/` changes — the P-23 fix is extension-only).
8. Package fresh extension zip at repo root: `plos-extension-2026-05-15-w2-deploy-13.zip` (or whatever the date is at deploy time). Run via `cd extensions/competition-scraping && npx wxt zip` OR a manual `cd .output/chrome-mv3 && zip -r ../../../../plos-extension-...zip .` — match the existing zip-creation pattern from prior deploys.

**Browser verification on real Amazon (Rule 27 scope-exception — the bug class IS "real-Amazon-DOM-ness is the point"):**

  1. Sideload the new zip on Chrome (chrome://extensions → Developer mode → Remove old + Load unpacked from unzipped folder; re-approve host permissions if Chrome prompts).
  2. Open the extension popup → set Project = (any director-test project) + Platform = Amazon.
  3. Navigate to a real Amazon product detail page (any `/dp/{ASIN}` URL; the existing `/dp/B0CTTF514L` Cool Heat Patches works as a familiar test target from prior sessions).
  4. Wait 5–10 seconds for the page to settle through Amazon's mutation cycles (lazy reviews, ads, recommendation widgets).
  5. **Right-click directly on the main product image** (NOT on the click-to-zoom larger viewer pane — that's the pre-fix workaround). Confirm the "Add to PLOS — Image" menu fires.
  6. Click "Add to PLOS — Image" → confirm the form opens with the main product image previewed (the underlying `<img>` src, not empty/broken).
  7. Fill the form (saved-URL pre-select should already work per P-15; image-category dropdown; optional composition/embedded-text/tags) and click Save → confirm the form closes + a new CapturedImage row lands in the DB (verify via `scripts/inspect-w2-state.mjs` if available, OR via the vklf.com URL-detail-page image gallery).
  8. **Cross-platform regression spot-check:** repeat right-click on a direct `<img>` on Walmart/eBay/Etsy product pages — confirm the menu still fires correctly + the form still opens with the right image preview. Zero behavior change expected on those platforms.
  9. **UX-noise spot-check:** on any platform, right-click on a non-image element (a paragraph of text, a header, a link, blank page area). Confirm the "Add to PLOS — Image" menu entry now appears (this is the expected UX cost of the widened `contexts: ['all']` change). Confirm clicking it does NOTHING visible (the handler bails silently because there's no image to find at that right-click target).

**Rule 27 scope-exception logic:** the load-bearing logic (empty-srcUrl content-script fallback path) is covered by the Playwright overlay-wrapped fixture (`tests/playwright/extension/p23-amazon-overlay-image.spec.ts` — 2 specs, positive + negative, both GREEN). Real-Amazon manual verification is the natural choice for this deploy session because (a) the bug class is "real-Amazon-DOM-ness is the point" — the Playwright fixture mirrors Amazon's pattern but real Amazon may have additional variants; (b) the widened-menu UX needs real-browser confirmation (Playwright can't drive Chrome's native context-menu UI); (c) this is a one-off deploy-time verification, not a regression-cycle thing.

**If real-Amazon verification PASSES:** P-23 flips ✅ SHIPPED-AT-DEPLOY-LEVEL; polish backlog entry closes; (a.28) closes; next (a.29) RECOMMENDED-NEXT opens for the next priority polish item (likely P-21 pickInitialUrl asymmetric canonicalize per existing W#2 polish backlog, OR P-19 green-overlay-dismiss → one-time selection collapse, OR P-13 autofocus on "+ Add new…" inline category input — director picks).

**If real-Amazon verification FAILS:** capture the failure mode precisely (which step fails, what symptom, which Amazon URL), STOP, surface to director via Rule 8+10 acknowledge-mistakes — likely scope is "the refined-Option-A mechanism didn't generalize" → consider falling back to Option (B) per launch-prompt's "if Option A doesn't work cleanly, fall back to (B) as slice 2."

## Pre-session notes (optional, offline steps to do between sessions)

Nothing strictly required. The P-23 fix is staged on `workflow-2-competition-scraping` ready for the deploy session. If you (the director) want to do a quick offline sanity check: the new helper file is `extensions/competition-scraping/src/lib/content-script/find-underlying-image.ts` (~95 lines, plain-language comments throughout). The new Playwright specs are at `tests/playwright/extension/p23-amazon-overlay-image.spec.ts`. Neither file is heavy reading; both are well-commented.

## Why this pointer was written this way (debug aid)

Today's session (W#2 polish session #18) shipped the P-23 fix at code level per the launch-prompt-recommended refined Option (A): widen background's contexts to `['all']` + content-script element-walk fallback. The cleanest possible shape was achieved — one commit on workflow-2 (code + tests + doc batch together), pre-ship verification scoreboard all GREEN (334/334 ext tests + 31/31 Playwright extension project), content.js byte target met (+601 bytes within "few hundred bytes" launch-prompt target). One INFORMATIONAL CORRECTIONS_LOG entry captured mid-session: a Playwright capture-phase listener-attach race surfaced when the listener was first placed AFTER orchestrator's async init flow — false-negative test failure caught and fixed via source re-architecture (hoist listener to top of `runOrchestrator`). Pattern lesson worth recording for future content-script tests that exercise capture-phase event listeners.

The deploy is the natural next session — standard ship-then-deploy pattern, no scope ambiguity. The Rule 27 forced-picker for the verification approach was effectively pre-decided: real-Amazon manual verification is the right choice for this specific bug class (the widened-menu UX + the listing-page overlay-wrapped image both want real-browser confirmation; Playwright already covers the load-bearing logic at regression level).

If you (the next Claude session) read this and the P-23 deploy has already happened OR director has revised intent, check `ROADMAP.md` Current Active Tools for the actual current state and ask the director which task they'd like to work on instead. The next-most-likely polish items after P-23 fully deploys are P-21 (pickInitialUrl asymmetric canonicalize), P-19 (green-overlay-dismiss → one-time selection collapse), or P-13 (autofocus on "+ Add new…" inline category input) — all already captured in the W#2 polish backlog.
