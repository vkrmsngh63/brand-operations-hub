---
description: Orchestrate the full PLOS W#2 → main deploy workflow per the canonical cheat-sheet (b). Pre-deploy /scoreboard → check main hasn't moved → Rule 9 gate (AskUserQuestion picker for director Yes) → ff-merge to main → post-merge /scoreboard → push origin/main → ping-pong sync → fresh extension zip (if extension session). Use when ready to deploy a build commit.
allowed-tools: Bash(*), Read, Edit, AskUserQuestion
---

Deploy orchestration per the canonical PLOS W#2 → main deploy pattern (cheat-sheet b). Walk these steps in order.

## Step 1 — Confirm prerequisites

Before kicking off the deploy:

```bash
# Confirm we're on a non-main branch with a build commit ready to deploy
git branch --show-current
git log --oneline -3
git status --short
```

The current branch should be a workflow-N-slug branch (e.g., `workflow-2-competition-scraping`). The most recent commit should be the build commit you're about to deploy (NOT a doc-batch commit). Working tree should be clean (no uncommitted code changes).

If anything's off → STOP and flag to director.

## Step 2 — Pre-deploy scoreboard

Run `/scoreboard` to verify the 6-check pre-deploy state. All should be GREEN. Capture the deltas vs. baseline for the doc-batch later.

Expected baselines as of 2026-05-22-g (update if you see drift):
- Root tsc: clean
- Extension tsc: clean
- npm run build: 57 routes
- src/lib node:test: 590/590
- extension `npm test`: 558/558
- Playwright: 94/94

If anything is RED → STOP. Fix the failure before deploying.

## Step 3 — Check main hasn't moved

```bash
git fetch origin main
git log origin/main..HEAD --oneline  # commits on workflow-N ahead of main
git log HEAD..origin/main --oneline  # commits on main ahead of workflow-N
```

If `git log HEAD..origin/main` shows commits → main has moved since the build commit was made. Either rebase the workflow-N branch on top of new main OR ff-merge new main into workflow-N first, then re-run /scoreboard, then deploy.

If both directions show NO commits → workflow-N is in sync with main and ff-merge will be clean. Proceed.

## Step 4 — Rule 9 deploy gate (AskUserQuestion required)

Per HANDOFF_PROTOCOL Rule 9, deploys to `origin/main` affect the live site and REQUIRE explicit director confirmation via AskUserQuestion. The "default-to-recommendation" exception (Rule 14f exception) does NOT apply to Rule 9 destructive ops — STILL fire the picker.

Frame the picker with:
- Build commit hash being deployed
- Director-visible change description (plain language; what they'll see after sideload + Vercel deploy)
- Scoreboard summary (all green; deltas)
- Fresh extension zip filename + size delta over prior

Provide AT LEAST these options:
- (A) Deploy now (recommended) — ff-merge + push + ping-pong + walk through sideload + real-Chrome verification
- (B) Hold off — I want to review first
- (C) I have a question first that I need clarified

Wait for director Yes before proceeding.

## Step 5 — ff-merge to main

```bash
git checkout main
git merge --ff-only workflow-N-competition-scraping  # replace N as appropriate
```

If ff-merge fails → STOP. Either main moved during Steps 3-4 (re-do Step 3) OR there's a merge conflict (should never happen with --ff-only).

## Step 6 — Post-merge scoreboard

Run `/scoreboard` again on main. All checks should still be GREEN. The post-merge scoreboard rerun catches drift if main moved between Step 3 and Step 5.

## Step 7 — Push origin/main + ping-pong sync

```bash
# Deploy push — triggers Vercel auto-redeploy
git push origin main

# Ping-pong sync back to workflow-N
git checkout workflow-N-competition-scraping
git push origin workflow-N-competition-scraping

# Verify both branches at the same SHA
git log --oneline -1 main
git log --oneline -1 workflow-N-competition-scraping
```

Both branches should be at the same SHA on origin now.

## Step 8 — Fresh extension zip (if extension session)

If this deploy includes Chrome extension code changes, build a fresh zip the director will sideload:

```bash
cd /workspaces/brand-operations-hub/extensions/competition-scraping && rm -rf .output && npm run zip
```

**Known issue:** `wxt build` / `wxt zip` writes the dist correctly at ~5-second mark but the parent process can hang indefinitely. If the process hangs >30 seconds AND `.output/competition-scraping-extension-0.1.0-chrome.zip` exists with non-zero size, kill the process — the zip artifact is valid:

```bash
pkill -f "wxt zip"  # OR pkill -f "wxt build"
```

Rename the zip to the canonical filename:

```bash
cd /workspaces/brand-operations-hub
cp extensions/competition-scraping/.output/competition-scraping-extension-0.1.0-chrome.zip plos-extension-<date>-w2-deploy-<N>.zip
ls -la plos-extension-<date>-w2-deploy-<N>.zip  # confirm size
```

Captured to CORRECTIONS_LOG 2026-05-19-f + 2026-05-19-g.

## Step 9 — Director real-Chrome verification walkthrough

If this deploy includes user-visible UI changes, walk the director through the sideload + verification per `feedback_handoff_step_by_step_novice.md`. Every step concrete + click-by-click + button labels:

1. Open Chrome → `chrome://extensions` → enable "Developer mode" toggle
2. Find the current PLOS extension card → click "Remove" (avoids duplicate-id error)
3. Download the fresh zip from Codespaces file tree to local disk
4. Unzip on local disk
5. Click "Load unpacked" → select the unzipped folder
6. Navigate to a test page (specific URL + reasoning why this page)
7. Specific verification steps (what to click; what they should see; what would indicate PASS vs. FAIL)

Wait for director PASS/FAIL report. Mark the polish item ✅ DONE in the doc-batch only after PASS.

If FAIL → diagnose + iterate. The deploy can be reverted via `git revert` on main + push if needed.

## Anti-patterns to avoid

- **Don't skip the Rule 9 gate** — even when scoreboard is green, the human-visible deploy decision is non-negotiable.
- **Don't deploy with red scoreboard** — debugging a failing test "after the fact" wastes deploy time + risks live-site impact.
- **Don't forget the ping-pong sync** — leaves the workflow-N branch stale; future build commits would conflict with main.
- **Don't run `git push --force` to main** — ever. If you need to undo a deploy, use `git revert` (preserves history) not force-push.
