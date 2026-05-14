# Next session

**Written:** 2026-05-14 — session_2026-05-14_w2-main-deploy-session-12-p20-fingerprint-short-circuit-DEPLOYED (Claude Code, on `main` after ff-merge from `workflow-2-competition-scraping`).

**For:** the next Claude Code session, whatever it is.

**Status of P-20 (highlight-flashing on real Amazon):** ✅ **SHIPPED-AT-DEPLOY-LEVEL today** on vklf.com via deploy session #12. Two commits brought to main (`865ffd6` P-20 code + `8f11388` P-20 doc batch via ff-merge `5e18e4b..8f11388`). Fresh extension zip `plos-extension-2026-05-14-w2-deploy-12.zip` (187,918 bytes; content.js 62,437 bytes) packaged at repo root. Browser verification on real Amazon SKIPPED per Rule 27 forced-picker — director picked "trust Playwright 29/29" — sufficient regression coverage from the 4 new EXTERNAL-MUTATION specs (10/sec injected DOM churn vs real Amazon's measured 6/sec). Director-self-check real-world test list provided in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Deploy session #12" section for optional independent verification (not a deploy gate).

---

## Branch
workflow-2-competition-scraping

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
**W#2 polish session #18 — ship P-23 Amazon main-image right-click context-menu fix** on `workflow-2-competition-scraping`. Closes (a.27) RECOMMENDED-NEXT. Standard ship-then-deploy pattern — today's work is the code-level ship; a future deploy session brings it to vklf.com.

**The bug (captured 2026-05-14 in deploy session #10 cross-platform smoke):** Amazon main-image right-click context-menu does NOT fire on Amazon's product-listing page. Workaround that works: click image → Amazon opens a larger viewer pane → right-click on the opened image → "Add to PLOS — Image" menu fires + full upload chain works. Affects only Amazon (Walmart/eBay/Etsy worked on direct right-click during deploy-#10 cross-platform verification). Severity MEDIUM — functional Amazon image-capture path has a workaround but the workaround is non-obvious for users.

**Likely cause:** Amazon's `<img>` is wrapped in zoom/overlay elements that intercept the `contextmenu` event before Chrome recognizes the target as matching the `contexts: ['image']` predicate. The Chrome contextMenus API uses event-target inspection; Amazon's overlay div may not look like an image even though it visually IS an image.

**Candidate fixes (already enumerated in the deploy-#10 doc batch — pick the lowest-risk one that compiles cleanly):**

  - **(A) Widen `chrome.contextMenus` `contexts` to `['all']` + check element-type in the click handler** — broadens the menu to fire on any element, but adds a content-script-side element-walk in the handler to verify there's actually an image somewhere in the DOM tree. Lowest-risk fix mechanism-wise; menu appears on more elements (more visible to users) but only fires through to the upload flow if there's an actual image target. Backward-compatible across Walmart/eBay/Etsy because the element-walk gracefully exits when the underlying element isn't image-like.
  - **(B) Inject a content-script right-click listener that walks the DOM up from `event.target` to find an underlying `<img>`** — more surgical fix; keeps `contexts: ['image']` for Walmart/eBay/Etsy (zero behavior change there) and adds a parallel content-script-only path that fires on Amazon's zoom-overlay-wrapped images. Higher implementation cost (new code path) but cleaner separation of platform-specific workarounds.
  - **(C) Reuse the §5 floating "+ Add" button pattern from existing code** — the floating "+ Add" overlay (introduced 2026-05-09 for Walmart heavy-SPA pages) already walks the DOM to find image targets and renders a clickable element. Could be reused for Amazon main-image capture too. Lowest implementation cost (existing code path) but mixes UX patterns (right-click for some platforms, floating "+ Add" for Amazon main image) which may be a UX wart.

**My recommendation (per `feedback_recommendation_style.md` — most thorough and reliable):** Pick **(A) widen `contexts` to `['all']` + element-walk in handler** as the first slice. It's the most surgical fix-as-a-mechanism (single `contexts: ['all']` flag change + a small handler-side element-walk) that preserves backward compatibility with the 3 stable-DOM platforms while unblocking Amazon. If it doesn't work cleanly in implementation (some edge case in element-walk), fall back to (B) as slice 2. Director can pick a different recommendation by overriding the launch-prompt task.

**Verification approach for THIS code-level ship session (per HANDOFF_PROTOCOL Rule 27 — Playwright forced-picker before any real-browser walkthrough):**

  - **Option A — Playwright extension-context regression spec for P-23** (recommended for code-level ship — repeatable regression coverage; spec injects an Amazon-style image-with-overlay-wrapper fixture HTML page and asserts the context-menu fires + the upload-form-render message dispatches; mirrors the existing P-22 image-capture spec shape; locks in the bug class as permanent regression coverage).
  - **Option B — Director manual on real Amazon at code-level ship** — premature; the code lives on workflow-2 branch, not deployed to vklf.com yet; real-Amazon manual verification belongs in the deploy session, not the code-level ship session.
  - **Option C — Hybrid** (Playwright now + director manual on real Amazon at the future deploy session) — effectively equivalent to A given B is deferred to deploy session. Recommended.

**Pre-ship verification scoreboard (re-run before commit):**

  - ext `npx tsc --noEmit -p tsconfig.json` — expect CLEAN
  - ext `npm test` — expect 323/323 + however many new tests P-23's fix adds (likely +3-6 unit tests for the element-walk helper)
  - root `npx playwright test --project=extension` — expect 29/29 + 1 new P-23 spec = 30/30 GREEN
  - ext `npm run build` — expect CLEAN; content.js delta = +few-hundred bytes for the contexts widening + element-walk

**Per HANDOFF_PROTOCOL.md Rule 25 + MULTI_WORKFLOW_PROTOCOL.md + project memory project_sequential_workflow_operation.md, this is W#2 work and belongs on the `workflow-2-competition-scraping` branch.** Verify branch state with `git branch --show-current` before any doc reads — the `./resume` script will have placed you on workflow-2 per the Branch field above; if not, STOP and surface to director.

Start by running the mandatory start-of-session sequence including reading MULTI_WORKFLOW_PROTOCOL.md + the recent CORRECTIONS_LOG entries (for the working-directory-drift recurring pattern — use absolute paths in Bash calls, avoid `cd` chains where possible). Also: at session start, run `git log origin/main..workflow-2-competition-scraping` AND `git log workflow-2-competition-scraping..origin/main` to surface parallel-branch divergence before reading this launch prompt's framing as authoritative.

## Pre-session notes (optional, offline steps to do between sessions)

**Optional self-check on the just-shipped P-20 fix:**

The deploy-#12 doc batch (`docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Deploy session #12" section) includes a numbered self-check test list for verifying P-20 on real Amazon. The Playwright simulator is the formal verification (29/29 GREEN with the 4 new EXTERNAL-MUTATION specs); the self-check is for your own intuition / spot-check. No need to report results back to the next session — just for your visibility. The self-check tests are:

  1. Sideload `plos-extension-2026-05-14-w2-deploy-12.zip` from repo root (chrome://extensions → Developer mode → Remove old + Load unpacked from unzipped folder).
  2. Set Platform = Amazon + add a highlight term in the popup.
  3. Open a real Amazon product page; wait 10–15 seconds for lazy content + ads + recommendation widgets to settle.
  4. Observe: highlighted words STAY highlighted continuously without flashing (P-20 fix's primary symptom).
  5. Try selecting text by click-dragging over highlighted regions; selection stays held without collapsing (P-20 fix's second symptom).
  6. Switch Platform = Walmart (or eBay/Etsy); confirm zero regression on stable-DOM platforms.

**If any test fails:** just report it in the next session's launch prompt — which test failed, what symptom, which Amazon URL. The next session will treat it as a higher-priority polish item than P-23 and re-evaluate scope.

Nothing else strictly required between sessions.

## Why this pointer was written this way (debug aid)

Today's session (W#2 → main deploy session #12) brought yesterday's P-20 fingerprint short-circuit fix to vklf.com via the standard cheat-sheet (b) flow. Cleanest possible deploy shape — workflow-2 was 3 commits ahead of origin/main and main was 0 commits ahead; rebase a no-op fast-forward; the merge commit `5d85c84` naturally collapsed during the non-merge rebase per the doc-batch-empty-on-rebase pattern.

Browser verification on real Amazon was SKIPPED per Rule 27 forced-picker — director picked "trust Playwright 29/29" over the recommended "Director manual on real Amazon + cross-platform spot-check" option. Director's rationale: the 4 new EXTERNAL-MUTATION specs (10/sec mutation rate vs real Amazon's measured 6/sec from yesterday's design-session DevTools trace) provide sufficient regression coverage for the bug class. P-20 polish backlog flipped ✅ SHIPPED-AT-DEPLOY-LEVEL on this basis. Optional director-self-check real-world test list provided (above + in the VERIFICATION_BACKLOG section) for independent spot-checking — not a deploy gate.

The (a.27) RECOMMENDED-NEXT pick was P-23 Amazon main-image right-click context-menu polish — director picked (A) via the §4 Step 1c "no obvious next task" interview. P-23 was captured 2026-05-14 during deploy session #10 cross-platform smoke when director hit the "right-click doesn't fire on main image" issue on Amazon (workaround: click image → opened viewer → right-click → works). P-23 is MEDIUM severity (Amazon-specific functional issue with known workaround), well-scoped (candidate fixes already enumerated in the deploy-#10 doc batch), and a clean single-session ship per the W#2 polish backlog pattern.

If you (the next Claude session) read this and the P-23 ship has already happened, the director may have revised intent — check ROADMAP.md Current Active Tools for the actual current state and ask the director which task they'd like to work on instead. The next-most-likely polish items after P-23 ships are P-19 (green-overlay-dismiss → one-time selection collapse) or P-21 (pickInitialUrl asymmetric canonicalize) — both already captured in the W#2 polish backlog.
