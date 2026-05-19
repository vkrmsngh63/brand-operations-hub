---
description: Orchestrate the full PLOS end-of-session protocol per HANDOFF_PROTOCOL §4. TaskList sweep → spawn plos-doc-batch agent for the 7-doc bundle → commit + push + ping-pong → produce the Personalized Handoff. Use when ready to close a session.
allowed-tools: Bash(*), Read, Edit, Write, Grep, Glob, Agent
---

End-of-session orchestration per HANDOFF_PROTOCOL §4. Walk these steps in order.

## Step 1 — Pre-flight checks

Before invoking the doc-batch agent, verify the session is actually ready to close:

```bash
# Confirm git state — should be on the right branch (workflow-N-slug or main)
git branch --show-current

# Confirm no uncommitted code changes — all build commits should be in already.
# The end-of-session commit will only carry doc updates + maybe small tooling tweaks.
git status --short | grep -v '^??' | head -20

# Confirm post-merge scoreboard was run (if this was a deploy session).
# If you've already run /scoreboard post-merge and it was green, note that here.
```

If there are uncommitted code changes that AREN'T doc updates → STOP and flag to director. The end-of-session commit should be doc-batch + tooling tweaks only, not build code. Build code should already be in a prior commit + ff-merged + pushed.

## Step 2 — TaskList sweep per Rule 14e + Rule 26

```
[Use TaskList tool to list all tasks]
```

For each open task:
- If status = `completed` → fine, leave it
- If status = `in_progress` → either complete it now OR convert to `DEFERRED:` task with destination noted
- If subject starts with `DEFERRED:` → confirm the corresponding doc entry has been written this session; if yes, TaskUpdate → completed. If no, write the entry now + then complete.

**Hard rule:** zero open `DEFERRED:` tasks at session end. Any remaining open `DEFERRED:` becomes a CORRECTIONS_LOG entry per Rule 26 as a process failure.

## Step 3 — Identify what the doc-batch needs

Read `.claude/session-modified-docs.log` to see which docs got touched mechanically by edits this session:

```bash
cat .claude/session-modified-docs.log 2>/dev/null | sort -u
```

Cross-reference against the §4 Step 1 Document Update Checklist (12 questions). Make sure nothing fell through the cracks. ALWAYS-update docs (CHAT_REGISTRY + DOCUMENT_MANIFEST + NEXT_SESSION) get bumped regardless of the log.

If today's session has no obvious next-session continuation (a tool just graduated; a methodology session closed; etc.), fire the **§4 Step 1c "No obvious next task" forced-picker** BEFORE the doc-batch agent runs — the agent needs the next-session task to write NEXT_SESSION.md correctly.

## Step 4 — Spawn the plos-doc-batch agent

Use the Agent tool with `subagent_type: "plos-doc-batch"` and brief the agent with everything it needs per its instructions:

- Session identifier (e.g., `session_2026-05-19-h_w2-polish-session-29-p22-cross-platform-slices`)
- Today's session-letter date
- Prior session's date (for the `**Previously updated:**` bump)
- Build commit hash + ff-merge hash range + push targets
- Scoreboard deltas (from `/scoreboard` outputs)
- 1-2 sentence narrative of what shipped
- Closes / opens which `(a.NN)` RECOMMENDED-NEXT items
- §4 Step 1c forced-picker outcome → new `(a.NN+1) RECOMMENDED-NEXT` next-session task
- Schema-change-in-flight flag transitions
- TaskList sweep summary
- Push count + Rule 9 gate disposition
- CORRECTIONS_LOG-tier slips OR informational observations
- Group B docs touched

The agent does the actual doc-bundle writing in its isolated context. When it returns, review its output + apply any corrections.

## Step 5 — Verify the doc batch is complete

After the agent reports back, run a quick verification:

```bash
# Confirm the 5 Group A docs all have today's header bump
for f in ROADMAP CHAT_REGISTRY DOCUMENT_MANIFEST CORRECTIONS_LOG; do
  echo "==$f=="; grep -m1 "^\\*\\*Last updated:\\*\\*" docs/$f.md | head -c 100; echo
done

# Confirm NEXT_SESSION.md was rewritten (has today's date in the "**Written:**" line)
grep -m1 "^\\*\\*Written:\\*\\*" docs/NEXT_SESSION.md | head -c 100

# Confirm Group B doc updates if applicable (W#2 → COMPETITION_SCRAPING_VERIFICATION_BACKLOG + DESIGN)
```

## Step 6 — Commit the doc batch + push + ping-pong sync

Per the standard 3-push pattern (deploy push + ping-pong sync from earlier in the session; end-of-session doc-batch push + ping-pong sync now), and per `feedback_approval_scope_per_decision_unit.md` — the end-of-session push is operationally adjacent to the deploy push and does NOT re-invoke Rule 9.

```bash
# Stage only the doc files (NOT untracked .zips per Rule 11 commit hygiene)
git add docs/<list of touched docs>

# Verify staging
git status --short | grep '^[AM]'

# Commit with the canonical end-of-session message shape
git commit -m "End-of-session doc batch — <session_id> <one-line headline>

<Group A modified list>

<Group B modified list>

<Closes / opens (a.NN) summary>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"

# ff-merge to main + push + ping-pong (if on workflow-N-slug)
git checkout main && git merge --ff-only <workflow-branch> && git push origin main
git checkout <workflow-branch> && git push origin <workflow-branch>
```

**The PreToolUse hook `check-next-session-doc.sh` will BLOCK the commit if `docs/NEXT_SESSION.md` is not staged in an "End-of-session" commit.** Make sure it's staged.

## Step 7 — Produce the Personalized Handoff Message

Per HANDOFF_PROTOCOL §4 Step 4b template. Sections:
- `## YOUR PERSONALIZED HANDOFF`
- `### What we did this session` (2-4 sentences plain language)
- `### Files changed this session` (list with commit hashes)
- `### Push status` (committed locally vs. pushed + Vercel auto-redeploy note)
- `### Deferred items captured` (zero this session, or specific destinations)
- `### 🚪 END-OF-SESSION INSTRUCTIONS — what you do NOW`
- `### 🚪 NEXT-SESSION INSTRUCTIONS — what you do when you come back` (EASY PATH `./resume` + ESCAPE HATCH 3-step path)
- `### Anything you need to do offline between sessions`
- `### Open questions / carry-overs for the next session`

Every section MUST be concrete + copy-paste-ready per `feedback_handoff_step_by_step_novice.md`. No "do X offline" without exact click-by-click instructions.

## Anti-patterns to avoid

- **Don't skip the TaskList sweep** — silent DEFERRED items break Rule 26 mechanically.
- **Don't commit untracked zips** — per Rule 11 commit hygiene, only stage doc files explicitly.
- **Don't forget the ping-pong sync** — every push to main needs a paired push to the workflow branch to keep them at the same SHA.
- **Don't make this a deploy session if it's not** — end-of-session doc-batch follows deploy-session work, but a doc-only session can use end-of-session directly.
