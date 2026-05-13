# Next session

**Written:** 2026-05-13-c — session_2026-05-13-c_resume-script-design (Claude Code, on `main`).

**For:** the next Claude Code session, whatever it is.

**Status:** PROVISIONAL — will be finalized at end-of-session per HANDOFF_PROTOCOL.md §4 Step 1 row 12. The "no obvious next task" interview fires this session because today's work (platform-wide resume-mechanism ship) wrapped cleanly with no natural continuation; director picks at end-of-session.

---

## Branch
main

## Launch prompt

Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
complete W#2 → main deploy session #10 verification per the (a.23) RECOMMENDED-NEXT
slot in ROADMAP.md Current Active Tools W#2 row — form rendering on Walmart
(image preview thumbnail + saved-URL picker + Composition/Embedded-text/Tags/
image-category fields + Save button) + 2-phase signed-URL upload + CapturedImage
row creation, plus cross-platform smoke on ebay/etsy/Amazon. The Module 2
regular-image gesture was DEPLOYED to vklf.com on 2026-05-13-b (commit `bd7b39a`
on `origin/main`); only context-menu firing has been verified live so far.

This is platform-wide post-deploy verification on `main` — per HANDOFF_PROTOCOL.md
Rule 25 + MULTI_WORKFLOW_PROTOCOL.md, the verification session belongs on `main`
(matches cheat-sheet (b)). Verify branch state with `git branch --show-current`
before any doc reads — if you're not on `main`, STOP and surface to director.

Per Rule 27 Playwright forced-picker: the verification is the kind that fires
the forced-picker (Chrome extension form flow + cross-platform smoke). Compare
(A) Playwright extension-context spec [P-22 in W#2 polish backlog]; (B) director
manual walkthrough; (C) hybrid; (D) escape hatch. Director picked Option C
Hybrid at the original P-22 capture moment — manual smoke first, Playwright
spec deferred to its own session; honor that pick unless director redirects.

Start by running the mandatory start-of-session sequence.

## Pre-session notes (optional, offline steps to do between sessions)

Nothing offline — you're all set. The deployed extension zip
(`plos-extension-2026-05-13-w2-deploy-10.zip`) is already at repo root from
the 2026-05-13-b session; if Chrome ever loses the sideloaded copy, reload
that zip via Developer-mode → Load unpacked (or → Update → Remove + reload
the zip).

## Why this pointer was written this way (debug aid)

Today's session shipped the new `./resume` mechanism and the supporting rule
+ doc changes. There was no obvious continuation of today's platform-wide
infrastructure work, so per the new HANDOFF_PROTOCOL.md §4 Step 1 row 12
interview, director picked the next session's task at end-of-session. The
(a.23) W#2 verification slot is the highest-priority open work surfaced in
the most recent W#2 row (deploy #10 was DEPLOYED + PARTIAL verify; form/save/
cross-platform smoke deferred).

If you (the next Claude session) read this and the W#2 (a.23) slot has
already shipped, the director may have revised intent — check ROADMAP.md
Current Active Tools for the actual current state and ask the director
which task they'd like to work on instead.
