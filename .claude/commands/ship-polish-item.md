---
description: Kick off a W#2 polish ship session with the canonical pattern — branch verify → ROADMAP entry read → Rule 3 code-truth diagnosis steps → Rule 14f forced-pickers before coding → code the fix → /scoreboard → /deploy → director real-Chrome verification → /end-of-session. Use at session start when shipping a specific polish item.
argument-hint: "[P-NN or polish-item-id]"
allowed-tools: Bash(*), Read, Edit, Write, Grep, Glob, AskUserQuestion, Agent
---

Polish ship session orchestration for **$ARGUMENTS**. Walk these steps in order.

## Step 1 — Read the ROADMAP entry for $ARGUMENTS

Locate the polish item's entry in `docs/ROADMAP.md` and read its full narrative:

```bash
grep -nE "^- \\*\\*$ARGUMENTS\\*\\*" docs/ROADMAP.md
```

Read the matched line + the section context to understand:
- **Where:** which files are affected (per the entry)
- **Status:** OPEN / ⏳ / ✅ DONE — if already DONE, surface to director
- **Severity:** LOW / MEDIUM / MEDIUM-HIGH / HIGH
- **Pre-graduation gating:** YES (joins P-22/P-18/P-26/P-27 in the remaining items) or post-graduation
- **Captured by:** date + originator
- **Pre-capture search per Rule 24:** what was searched + what was found
- **Why:** director's intent
- **Fix shape:** the proposed implementation outline
- **Test coverage:** which Rule 27 option is recommended
- **Schema-change-in-flight flag:** will it flip to "Yes"?
- **Cross-references:** related files + design docs + memory

## Step 2 — Branch verify

Per HANDOFF_PROTOCOL CLAUDE_CODE_STARTER Step 2 — non-negotiable:

```bash
git branch --show-current
git status
```

Expected for W#2 polish items: `workflow-2-competition-scraping`. If on `main` → STOP. Surface mismatch + give exact terminal commands to switch.

## Step 3 — Pull latest

```bash
git pull --rebase origin $(git branch --show-current)
```

Should be a no-op (your branch should already be at the post-end-of-session-ping-pong SHA from prior session). If commits come in → flag what changed.

## Step 4 — Rule 3 code-truth diagnosis steps (verify launch prompt's premises)

The launch prompt + ROADMAP entry name specific files + lines as fix sites. Verify those premises BEFORE coding — every recent ship session has caught one Rule 3 drift (P-16 wrap-async / P-24 originalSrcUrl / P-23 url-add-form). Maintain that discipline.

Read each named source file at the cited line numbers. Confirm the pattern described in the ROADMAP entry actually exists. If anything differs from the entry's narrative → surface drift to director via AskUserQuestion picker BEFORE any code. Reframe the scope based on the drift findings.

If the polish item has a substantive Rule 24 search component (new feature scope-add, not a small UX tweak), invoke `/rule-24-search [keyword]` to re-verify pre-capture search results. The slash command runs the canonical 7-grep search.

## Step 5 — Rule 14f forced-pickers before coding (when applicable)

Per the new "default-to-recommendation" exception in HANDOFF_PROTOCOL Rule 14f (added 2026-05-19-g-3), SKIP the picker when the choice is asking permission to proceed on a clear recommendation.

STILL fire forced-pickers for:
- Scope decisions where multiple distinct paths exist with no clear "most thorough"
- Design choices (label format, separator style, etc.) — director should choose visual/UX details
- Test coverage approach per Rule 27 (if not pre-decided by the ROADMAP entry)
- Anything where the polish item's "fix shape" leaves a genuine design question open

When you DO fire a picker, follow Rule 14f shape:
- Per-option context (plain language; consequences; reversibility)
- Recommended marker on the most-thorough option (`(recommended)` inside the headline)
- Escape-hatch option as final option ("I have a question first that I need clarified")
- Free-text invitation at the close

## Step 6 — Schema-change-in-flight flag transition (if applicable)

If the polish item requires a schema change:
- Flip the flag in CHAT_REGISTRY + ROADMAP active-tools header from "No" → "Yes" BEFORE running `npx prisma db push`
- After successful migration, flip back to "No" in the same end-of-session doc-batch

Per Rule 8 (STOP before destructive operations), `prisma db push` against production requires confirmation. Surface the migration command + what columns get added BEFORE running it.

## Step 7 — Code the fix

Per Rule 23 Change Impact Audit (NEW 2026-04-26), classify the change BEFORE coding:
- **Additive (safe):** new optional field; new operation; new metadata. Default for most polish items.
- **Compatible-modifying (caution):** semantic change to existing data BUT downstream consumers unaffected.
- **Breaking (hard):** rename / removal / type change. Each downstream consumer must be updated in lockstep OR via versioned Data Contract.

Most W#2 polish items are Additive. Surface the audit classification + downstream consumer check inline before coding.

Then write the code per the ROADMAP entry's fix shape narrative. Common shapes:
- Pure helper extraction (e.g., P-23's `buildSavedUrlOptionLabel`) + wire into all caller sites
- Content-script form addition (e.g., P-24's saved-image indicator)
- New schema column + API route + extension wiring (e.g., P-25's `selector` field)
- New Playwright spec slices (e.g., P-22's cross-platform extension)

Match the existing pattern in the affected files (sibling code conventions). Reuse helpers where applicable.

## Step 8 — Test coverage (per Rule 27)

Most recent polish items used Hybrid coverage (Option A from the Rule 27 forced-picker): pure-helper node:test cases + 1 Playwright extension-context spec. Match that pattern.

```bash
cd /workspaces/brand-operations-hub/extensions/competition-scraping && npm test 2>&1 | tail -10  # node:test
cd /workspaces/brand-operations-hub && node --test --experimental-strip-types $(find /workspaces/brand-operations-hub/src/lib -name '*.test.ts') 2>&1 | tail -10  # if server-side change
```

Then build the extension dist + run Playwright:

```bash
cd /workspaces/brand-operations-hub/extensions/competition-scraping && npm run build  # then kill wxt process if it hangs after dist is on disk
cd /workspaces/brand-operations-hub && npm run test:e2e:all 2>&1 | tail -20
```

All checks should be GREEN. Capture deltas vs. baseline for the doc-batch later.

## Step 9 — Pre-deploy /scoreboard

Run `/scoreboard` for the canonical 6-check pre-deploy verification. Confirm all green + capture deltas.

## Step 10 — Commit the build

Per Rule 11 commit hygiene, stage ONLY the polish-item files (NOT untracked zips, NOT pre-existing leftovers):

```bash
git add <list of specific files touched by this polish item>
git status --short | head -10  # verify staged correctly
git commit -m "W#2 (a.NN) $ARGUMENTS — <one-line description>

<brief narrative — what changed + why + test coverage summary>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

## Step 11 — Run /deploy

Invoke `/deploy` to handle the Rule 9 gate + ff-merge + push + ping-pong + fresh extension zip + director real-Chrome verification walkthrough.

## Step 12 — Run /end-of-session

After director PASS/FAIL on the real-Chrome verification, invoke `/end-of-session` to handle the doc-batch + commit + push + ping-pong + Personalized Handoff. The polish item's ROADMAP entry flips ⏳ OPEN → ✅ DONE in the doc-batch.

## Anti-patterns to avoid

- **Don't skip Step 4** — every recent polish ship has caught one Rule 3 drift. The diagnosis-steps discipline IS the value.
- **Don't fire pickers re-confirming the recommended path** — the default-to-recommendation exception (Rule 14f exception, NEW 2026-05-19-g-3) skips those. Fire pickers only for genuine intent decisions.
- **Don't commit zips** per Rule 11.
- **Don't deploy without /scoreboard green** — fix the failure before deploying.
- **Don't mark the polish item ✅ DONE in the doc-batch until director PASS** — the deploy can be reverted if real-Chrome verification surfaces an issue.
