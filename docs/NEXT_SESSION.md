# Next session

**Written:** 2026-05-14 — session_2026-05-14_w2-deploy-10-cross-platform-smoke-verify (Claude Code, on `main`).

**For:** the next Claude Code session, whatever it is.

**Status:** FINALIZED 2026-05-14 end-of-session — director picked Option A (W#2 Module 2 region-screenshot session 6 on `workflow-2-competition-scraping`) via the §4 Step 1c "No obvious next task" Rule 14f forced-picker. Recommended pick per `feedback_recommendation_style.md` (most-thorough-and-reliable: closes out Module 2 image-capture pair fully — the regular-image gesture (Walmart yesterday + eBay/Etsy/Amazon today) is now fully verified in production; the paired region-screenshot mechanism per `COMPETITION_SCRAPING_STACK_DECISIONS.md §4` was deferred at the (a.22) pick when director picked deploy-#10).

---

## Branch
workflow-2-competition-scraping

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
W#2 Extension build session 6 — Module 2 region-screenshot mechanism per
`docs/COMPETITION_SCRAPING_STACK_DECISIONS.md` §4 (`chrome.tabs.captureVisibleTab`
+ canvas crop) and `docs/COMPETITION_SCRAPING_DESIGN.md` §A.7 / §B 2026-05-13
in-flight refinement (region-screenshot scope-split deferral from session 5).

Per HANDOFF_PROTOCOL.md Rule 25 + MULTI_WORKFLOW_PROTOCOL.md + project memory
project_sequential_workflow_operation.md, this is W#2 build work and belongs on
the workflow-2-competition-scraping branch. Verify branch state with
`git branch --show-current` before any doc reads — if you're not on
workflow-2-competition-scraping, STOP and surface to director (the terminal
commands in Step 1 of the cd+checkout path above should have switched you, but
verify).

Start by running the mandatory start-of-session sequence including reading
MULTI_WORKFLOW_PROTOCOL.md. Read COMPETITION_SCRAPING_STACK_DECISIONS.md §4 (the
frozen region-screenshot mechanism decision) + COMPETITION_SCRAPING_DESIGN.md §B
(the 2026-05-13 scope-split entry) before designing the build plan. The
regular-image gesture's `text-capture-form.ts`-pattern shape (image preview +
saved-URL picker + image-category picker + Composition/Embedded text/Tags +
Save) is the right reference for region-screenshot UX — it should reuse the
same form once the user has drawn their rectangle and captured the screenshot
bytes.

Today's session is platform-side build only — no deploy. Standard W#2
ship-then-deploy pattern: ship at code level on workflow-2-competition-scraping
this session; deploy to main + vklf.com is a separate future session.

Note: W#2 polish backlog now has 23 items (P-1 through P-23). NEW P-23 added
2026-05-14: "Amazon main-image right-click context-menu does not fire — workaround:
click image to open in viewer pane first, then right-click." Affects only Amazon
(Walmart/eBay/Etsy work on direct right-click); user-experience degradation only,
not a hard failure. NOT in scope for today's region-screenshot session — its own
future polish session. See `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md`
polish backlog for the full P-23 entry.

## Pre-session notes (optional, offline steps to do between sessions)

Nothing offline — you're all set. The deployed extension zip
(`plos-extension-2026-05-13-w2-deploy-10.zip`) is already at repo root from
the 2026-05-13-b session and remains the production-running build until the
next deploy session ships a newer one. No reinstall needed for today's build
session — region-screenshot work is code-level only.

## Why this pointer was written this way (debug aid)

Today's session (2026-05-14) closed deploy-#10 verification at four-of-four
platforms (Walmart ✅ FULL yesterday + eBay/Etsy/Amazon ✅ today). The
2026-05-13 scope-split at session 5 had deferred Module 2's region-screenshot
half to a future session; the (a.22) Rule 14f forced-picker offered deploy
OR region-screenshot session 6, and director picked deploy (which became
deploy-#10). With deploy-#10 now fully verified, region-screenshot session 6
is the natural unblock: it closes the Module 2 image-capture pair fully and
keeps W#2 forward-progress on the build side.

Per the §4 Step 1c interview at end-of-session today, the picker offered (A)
region-screenshot session 6 [recommended], (B) P-23 quick fix, (C) different
polish item, (D) different workflow, (E) clarification escape hatch. Director
picked (A).

If you (the next Claude session) read this and the W#2 region-screenshot
session has already shipped, the director may have revised intent — check
ROADMAP.md Current Active Tools for the actual current state and ask the
director which task they'd like to work on instead.
