# Next session

**Written:** 2026-05-14 — session_2026-05-14_w2-main-deploy-session-11-region-screenshot-DEPLOYED-FULL-VERIFY + same-session follow-up shipping the resume-flow multi-layered defense fix per HANDOFF_PROTOCOL Rule 28 (Claude Code, on `main`).

**For:** the next Claude Code session, whatever it is.

**🟢 NEW THIS SESSION (2026-05-14 follow-up) — RESUME-FLOW FIX SHIPPED. Test it on next session start:**

The original `./resume` script's `exec claude "$SENTINEL"` line was structurally broken (Claude Code's positional `[prompt]` doesn't auto-submit in interactive mode); director hit this at the start of today's session and had to manually paste the launch prompt despite running `./resume`. **The fix shipped this same session:** NEW `.claude/hooks/inject-next-session-pointer.sh` (SessionStart hook that reads this pointer file and injects its contents as a system reminder before the user's first prompt) + UPDATED `.claude/settings.json` (wires the new SessionStart hook alongside the existing PreToolUse guard hook) + UPDATED `./resume` (removed the broken positional arg + improved terminal-side wake-up guidance) + UPDATED `docs/CLAUDE_CODE_STARTER.md` "Resume-flow handling" section (now describes multi-layered defense: Layer 1 SessionStart hook = primary, Layer 2 sentinel-string match = procedural fallback, Layer 3 ESCAPE HATCH 3-step path = manual fallback, Layer 4 NEXT_SESSION.md guard hook = end-of-session enforcement) + NEW `docs/HANDOFF_PROTOCOL.md` Rule 28 codifying the multi-layered defense. Fix is on `main` AND merged into `workflow-2-competition-scraping` so the hook fires regardless of which branch `./resume` checks out.

**Next session's PRIMARY task is to test the fix end-to-end per HANDOFF_PROTOCOL Rule 28's "Test discipline" requirement BEFORE proceeding with P-20 design work.** Test steps:
1. Run `./resume` in a Codespaces terminal (Layer 1 should fire automatically when claude launches).
2. Watch for the "🟢 RESUME-FLOW POINTER" marker in the session's first system reminder — that's Layer 1 confirming it fired. If you see the marker, Layer 1 works; if you don't, Layer 1 failed and you fall through to Layer 2.
3. Send a SINGLE-WORD wake-up message (literally just `go` + Enter, or `proceed` + Enter, or even just Enter on a blank line if that works).
4. Confirm Claude reads this pointer file + treats its "## Launch prompt" section verbatim + executes the start-of-session sequence WITHOUT requiring any further input from director (no manual paste of the launch prompt).
5. If the full flow works without manual paste: capture as a CORRECTIONS_LOG INFORMATIONAL entry "Resume-flow Rule 28 fix verified working end-to-end on first real run" + proceed with P-20 design work.
6. If the flow fails at any step: capture the failure to CORRECTIONS_LOG + halt P-20 work + propose Rule 28 refinement BEFORE doing anything else (per Rule 28's "test discipline" clause).

**Status of the P-20 task (the original planned next-session work):** FINALIZED 2026-05-14 end-of-session — director picked Option A (P-20 design session — Amazon highlight-flashing/selection-collapse) via the §4 Step 1c "No obvious next task" Rule 14f forced-picker. Recommended pick per `feedback_recommendation_style.md` (most-thorough-and-reliable: tackles the highest-severity outstanding W#2 issue — P-20 is HIGH severity because Amazon is the primary platform per W#2 Phase 1 throughput target, and the flashing + selection-collapse on real Amazon post-P-14-deploy is the biggest unresolved user-visible issue). The P-20 design work is the PRIMARY POST-TEST TASK after step 5 above succeeds.

---

## Branch
workflow-2-competition-scraping

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
W#2 polish session — **P-20 design session: P-14 fix doesn't generalize to real
Amazon** — external-mutation retrigger from continuously-mutating amazon.com DOM
keeps the strip-and-reapply loop active on Amazon despite P-14's `muteMutationObserver`
self-retrigger fix. Symptom: highlighted words keep flashing + text selection collapses
on real Amazon product pages; Walmart/eBay/Etsy are stable post-load so the loop
doesn't fire visibly there. HIGH severity — Amazon is the primary platform per W#2
Phase 1 throughput target.

Goal of this session: **design pass**, not necessarily a code ship. Evaluate the
candidate fix shapes (per P-20 entry in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md`
polish backlog):
  (a) longer debounce (1000ms+) — accept slower refresh on dynamic pages
  (b) fingerprint the would-be highlight-set + short-circuit refresh when unchanged
      (idempotent no-op for the common case of "external mutation didn't add new
      highlightable text")
  (c) scope MO observe to platform-specific DOM regions on Amazon
      (need per-platform CSS selectors)
  (d) IntersectionObserver-based "only highlight what's visible" instead of
      body-wide refresh

Recommended pre-step: run a real-Amazon DevTools mutation-rate trace as evidence
(use `MutationObserver` in the Console to count mutations per second on a typical
Amazon product page) so the design can be informed by actual data, not just the
hypothesis. Then evaluate the 4 fix shapes against the trace evidence + Rule 16
zoom-out (how each option interacts with the 4 platforms, with future P-26
full-page-scroll-capture if it ever ships, with P-14's existing infrastructure).

Per HANDOFF_PROTOCOL.md Rule 25 + MULTI_WORKFLOW_PROTOCOL.md + project memory
project_sequential_workflow_operation.md, this is W#2 polish work and belongs on
the workflow-2-competition-scraping branch. Verify branch state with
`git branch --show-current` before any doc reads — if you're not on
workflow-2-competition-scraping, STOP and surface to director.

Start by running the mandatory start-of-session sequence including reading
MULTI_WORKFLOW_PROTOCOL.md. Read the P-20 entry in
`docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` polish backlog +
`extensions/competition-scraping/src/lib/content-script/orchestrator.ts`
MutationObserver setup (the call site for P-14's mute fix is near line 297) +
`extensions/competition-scraping/src/lib/content-script/highlight-terms.ts`
refresh() (the strip-and-reapply path P-14 wrapped) + the existing P-14 Playwright
suite (`tests/playwright/extension/highlight-flashing.spec.ts`, 17 specs across
4 platforms) for the regression test shape any P-20 fix must continue to pass.

Today's session may produce a designed approach + a code commit if the pick
turns out to be small-scope; OR may produce only a design with the ship as
a follow-up session if the chosen approach is larger. Director picks scope at
the design-pass forced-picker.

Note: W#2 polish backlog now has 26 items (P-1 through P-26). NEW P-26 added
2026-05-14: "Below-fold capture limitation — current design captures only viewport;
'two halves' workaround documented; full-page scroll-capture is a future
enhancement with significant trade-offs (sticky headers, lazy content timing,
layout-changes-on-scroll, infinite-scroll handling, multi-captureVisibleTab
performance cost)." NOT in scope for today's P-20 design — captured for future
re-evaluation only.

## Pre-session notes (optional, offline steps to do between sessions)

Nothing offline — you're all set. The deployed extension zip
(`plos-extension-2026-05-14-w2-deploy-11.zip`) is at repo root from today's
deploy session #11 and remains the production-running build until the next
deploy session ships a newer one. No reinstall needed for the P-20 design
session — it's design + maybe-code work on the workflow branch; deploy comes
later if a fix ships.

If you DID want to repro the P-20 symptom in advance: sideload the current
extension zip (or stick with the one you have from today's deploy session),
sign in, set Project + Platform = Amazon + at least one highlight term that
appears on Amazon product pages, navigate to any Amazon product page, watch
the page settle for 5-10 seconds, observe the flashing on highlighted text.
That's the symptom P-20 will design a fix for.

## Why this pointer was written this way (debug aid)

Today's session (2026-05-14) closed deploy session #11 — Module 2 region-screenshot
gesture DEPLOYED to vklf.com + cross-platform FULL VERIFY across all 4 platforms
(Walmart + eBay + Etsy + Amazon, all confirmed via DB inspection script showing
`sourceType=region-screenshot` rows in CapturedImage table). Module 2's full
image-capture pair (regular-image + region-screenshot) is now complete + deployed.

Per the §4 Step 1c interview at end-of-session today, the picker offered (A)
P-20 design session [HIGH severity, recommended], (B) P-23 fix (Amazon main-image
right-click context-menu), (C) P-22 slice 3 (error-path Playwright coverage),
(D) Dating cleanup (platform-wide hygiene on `main`). Director picked (A) —
tackles the highest-severity outstanding W#2 issue.

Mid-verification, director asked why the region-screenshot rectangle can't be
dragged below the fold — Claude explained Chrome's `chrome.tabs.captureVisibleTab`
is viewport-only by design + walked the "two halves" workaround vs. full-page
scroll-capture trade-offs. Director picked "keep current design + capture P-26
polish entry for future re-evaluation." P-26 is now in ROADMAP polish backlog
but NOT today's next-session task.

If you (the next Claude session) read this and the P-20 design session has
already shipped, the director may have revised intent — check ROADMAP.md
Current Active Tools for the actual current state and ask the director which
task they'd like to work on instead.
