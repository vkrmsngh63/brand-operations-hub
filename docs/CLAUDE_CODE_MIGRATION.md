# CLAUDE CODE MIGRATION
## How we shift from claude.ai to Claude Code seamlessly — without losing institutional memory

**Created:** April 17, 2026 (end of Phase M Ckpt 8 chat `fc8025bf-551a-4b3c-8483-ec6d8ed9e33c`)
**Status:** Migration planned; executes after Phase M Ckpt 9 deploy completes.
**Audience:** Both the user (setup steps) and Claude (operational rules).

---

## 1. Why we're switching

After 8 Phase M checkpoints completed in claude.ai, two recurring bottlenecks have been observed:

1. **Round-trip cost.** Every command requires the user to paste it into Codespaces, copy the output, paste it back. Ckpt 8 alone had 20+ such round-trips. This multiplies chat length, fatigues the user, and adds avenues for errors.
2. **Pattern 11 recurrence.** The "I'm a non-programmer, use plain language" instruction has had to be manually re-stated by the user in FOUR consecutive chats despite escalating documentation. The fourth recurrence (in Ckpt 8) happened on a "paste the file" request — a class of slip that would be architecturally prevented by Claude having direct file access.

Claude Code addresses both: Claude runs inside the user's Codespaces environment, reads files directly, executes commands itself, and commits work to git — with the user in a supervisory role (approving destructive operations, answering design decisions, visually verifying results).

The handoff-doc system we built remains fully operational — it just downgrades in importance from "survival mechanism" to "between-session memory layer." Docs live in `/docs/` inside the repo; Claude Code reads them directly.

---

## 2. What stays the same (the doc system)

Everything we built in Phase D and refined through Ckpts 5–8 continues to work:

- **Group A handoff documents (13 total — see §7)** stay as the authoritative platform-wide context. Claude Code reads them at the start of every session.
- **Group B tool-specific docs** (e.g., `KEYWORD_CLUSTERING_ACTIVE.md`) stay. Claude Code opens them when working on the relevant tool.
- **Session-end doc update ritual** stays. At end of each session, Claude runs the Document Update Checklist and updates whatever changed — same as before. The difference: Claude commits the updates directly to git instead of producing downloadable files.
- **The 20 rules in `HANDOFF_PROTOCOL.md`** stay. Rules 14a–14e (communication level), Rule 9 in `NEW_CHAT_PROMPT.md` (concrete-method requirement), Patterns 1–12 in `CORRECTIONS_LOG.md` — all still apply.
- **The user is still a non-programmer.** Every rule about plain language, options-with-recommendations, reversibility, and the Read-It-Back test applies identically in Claude Code. Claude Code does NOT lower the communication-discipline bar.
- **Sessions are still ephemeral.** Claude has no memory between sessions. Context windows still fill up on long sessions. Handoff docs remain the between-session memory.

## 3. What genuinely changes

| Aspect | claude.ai (old) | Claude Code (new) |
|---|---|---|
| Docs delivery | Uploaded at start of every chat | Read directly from `/docs/` in repo |
| Session identifier | URL from browser address bar | Date + short topic string (e.g., `session_2026-04-20_phase1gtest-kickoff`) |
| File access | Claude cannot read user's repo; asks user to paste | Claude reads files directly |
| Command execution | Claude gives command; user pastes; user pastes output back | Claude runs command; user sees output live |
| End-of-session doc updates | Claude produces files → user downloads → overwrites local → uploads next chat | Claude edits docs → commits to git → next session reads from repo |
| Destructive operation safety | Paste-dance gives review time | Requires Claude to pause and explicitly ask for confirmation |
| Pattern 11 risk | High (user-facing sandbox-path commands can slip) | Lower (Claude acts in repo directly) — but question-framing slips still possible |
| Context-window limits | Apply (~chat length) | Apply (~session length) — same fundamental constraint |
| When to end a session | When Claude feels stretched | Same |

## 4. Preparing for the switch — EXACT SEQUENCE

### Prerequisite: Ckpt 9 must complete first

Do NOT begin migration until Ckpt 9 is successfully deployed to vklf.com and visually verified. Rationale: Ckpt 9 is the highest-stakes operation in Phase M (first time Phase M code runs against real users). Switching methodologies simultaneously would double the uncertainty. One tool-change at a time.

**Ckpt 9 itself already handles one prerequisite for migration:** it creates `/docs/` at repo root and relocates all 13 Group A handoff docs + Group B docs into it, plus this migration guide + `CLAUDE_CODE_STARTER.md`. After Ckpt 9 pushes successfully, the repo is migration-ready.

### Step 1 — Install Claude Code (user does this, Claude is not in the loop)

In a Codespaces terminal:

```bash
npm install -g @anthropic-ai/claude-code
```

Then authenticate. The tool will walk you through it — it uses the same Anthropic account you use for claude.ai.

**If you hit installation issues:** the official docs at https://docs.claude.com have the authoritative install instructions and will be more current than this document. The specific command above may change as the tool evolves.

### Step 2 — Test it works (user, ~5 min)

In your Codespaces terminal, from the repo root (`/workspaces/brand-operations-hub/`):

```bash
claude
```

This starts an interactive Claude Code session. Try a trivial request like "list the files in /docs/ and tell me what each one is for." If Claude responds with accurate file summaries, setup is working.

Type `exit` or Ctrl+C to end the session.

### Step 3 — Read this migration guide end-to-end

You're doing that now if you're reading this in Claude Code. Good. If you're reading it before installing Claude Code, come back to this step after install — it'll help you know what to expect.

### Step 4 — Start your first real Claude Code session for Phase 1g-test

Your next real work session (Phase 1g-test kickoff — live-testing Auto-Analyze on Keyword Clustering) happens in Claude Code. The starter prompt lives at `docs/CLAUDE_CODE_STARTER.md`. The workflow:

1. Open a Codespaces terminal at repo root
2. Run `claude` to start a session
3. As your very first message, paste (or have Claude read) `docs/CLAUDE_CODE_STARTER.md` and then state your task:

> "Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task: Phase 1g-test — live-test Auto-Analyze on Keyword Clustering. Start by running the mandatory start-of-session sequence in docs/HANDOFF_PROTOCOL.md §2."

Claude Code will then:
- Read the starter prompt and lock in the communication rules
- Read the handoff protocol
- Read the other Group A docs
- Read `KEYWORD_CLUSTERING_ACTIVE.md` (Group B) for the tool context
- Run `git log`, `git status` to understand current state
- Produce a drift check + proposed work plan
- Wait for your go-ahead

**This mirrors the exact sequence you use in claude.ai today** — just without the file-upload step.

---

## 5. Safety rules for Claude Code sessions (Claude reads this)

These supplement — do not replace — the rules in `HANDOFF_PROTOCOL.md` and the banner in `NEW_CHAT_PROMPT.md`. They exist because Claude Code has direct execution power that claude.ai does not.

### Rule M1 — Confirm before destructive operations (MANDATORY)

Destructive operations = anything that deletes data, rewrites history, or is hard to undo. Examples:
- `rm`, `rm -rf`, `rmdir`
- `git reset --hard`, `git push --force`, `git clean -fd`
- `git rebase -i` with history rewrites
- `prisma migrate reset`, `prisma db push --force-reset`
- Overwriting files that aren't already tracked/backed up
- `DROP TABLE`, `TRUNCATE`, any SQL DELETE without WHERE
- Deleting anything from `/mnt/` or similar system paths
- Dropping or deleting Supabase records without clear scoping

**For ALL of the above:** Claude STOPS, describes what's about to happen in plain English (what files/records/commits will be affected, and whether recovery is possible), and asks for explicit confirmation from the user. Only proceed on a clear affirmative ("yes," "confirm," "go ahead") — never on silence or ambiguous responses.

**For deploys specifically (`git push origin main` when push would change live site):** Claude describes what commits will go live, what user-visible changes result, and asks for explicit confirmation.

### Rule M2 — Visual verification after deploy is the user's job

Claude Code cannot open a browser and see vklf.com. When work deploys to production, Claude asks the user to visually verify and describes exactly what to check. Claude does NOT mark work "done" until the user confirms visual verification.

### Rule M3 — Commit hygiene applies the same way

The Option A (clean split) pattern from Ckpt 8 applies identically in Claude Code: each session's commits contain only that session's work. If leftovers accumulate, they're handled explicitly, not swept into an unrelated commit. See `CORRECTIONS_LOG.md` 2026-04-17 entry "Pre-existing .bak/untracked files" for the procedure.

### Rule M4 — Session identifier

Each Claude Code session is identified by a dated topic string. Format: `session_YYYY-MM-DD_short-topic-slug` (e.g., `session_2026-04-20_phase1gtest-kickoff`). Claude captures this at start-of-session and uses it in end-of-session doc updates.

If multiple sessions happen the same day, append a letter: `session_2026-04-20_topic-a`, `session_2026-04-20_topic-b`.

### Rule M5 — Session pause + resume

If a session runs long and Claude's focus is degrading, Claude proactively says so — same as Rule 13 in the existing HANDOFF_PROTOCOL. The user can say "let's pause and resume in a fresh session." Claude runs the end-of-session doc update, commits, and the user closes. Next session reads the updated docs and continues.

### Rule M6 — When in doubt, fall back to the paste-dance

If something feels risky — a destructive operation, an irreversible config change, an unfamiliar tool invocation — Claude is ALLOWED to revert to the claude.ai-style pattern for a single operation: "Here's the command I'd like to run. Can you review it and paste it yourself so we both see it before execution?" This escape hatch should be rare but is useful for high-stakes single operations.

### Rule M7 — Do not rely on conversational memory across sessions

Even within Claude Code, Claude has no memory between sessions. If Session 1 made a decision, Session 2 needs to re-derive it from the docs or ask the user. This is the same constraint as claude.ai — Claude Code does not change it.

---

## 6. CHAT_REGISTRY.md — how it changes

Currently the registry logs by URL (claude.ai chat URL). In Claude Code, sessions don't have URLs. The registry switches to dated session identifiers.

**Transition approach:**
- Existing URL entries remain unchanged (historical record of the claude.ai era)
- New entries after the switch use the session-identifier format
- A divider row marks the transition point

Example future registry shape:

```
| Date | Session ID / URL | Tool/System | Phase | Summary |
|---|---|---|---|---|
| 2026-04-20 | session_2026-04-20_phase1gtest-kickoff (Claude Code) | Keyword Clustering / Auto-Analyze | Phase 1g-test | ... |
| ───── | ──── MIGRATION TO CLAUDE CODE ──── | ───── | ───── | ───── |
| 2026-04-18 | https://claude.ai/chat/... | Platform / Ckpt 9 | Phase M Ckpt 9 | ... |
| 2026-04-17 | https://claude.ai/chat/fc8025bf-... | Platform / Ckpt 8 | Phase M Ckpt 8 | ... |
```

## 7. Updated Group A inventory (13 docs instead of 12)

This migration adds ONE new Group A doc: `CLAUDE_CODE_MIGRATION.md` (this file). It becomes Group A doc #13. See `DOCUMENT_MANIFEST.md` for the full canonical list.

Additionally, a new non-Group-A doc lives in `/docs/`: `CLAUDE_CODE_STARTER.md`. This is the paste-at-start-of-session prompt. It's NOT Group A because it's not uploaded anywhere — it's read from disk by Claude Code at session start, every session.

## 8. Rollback plan

If Claude Code causes more friction than it solves (unlikely but possible), rolling back is trivial:
1. Stop using Claude Code; resume claude.ai
2. Delete `/docs/CLAUDE_CODE_MIGRATION.md` and `/docs/CLAUDE_CODE_STARTER.md` (or leave them for future re-attempt)
3. Upload Group A docs from `/docs/` to each claude.ai chat as before
4. Log the rollback to `CORRECTIONS_LOG.md` with reasons

The repo is unaffected by the rollback — `/docs/` is a net benefit regardless of tool choice.

## 9. Post-migration validation

After the first 2–3 Claude Code sessions, the user and Claude should explicitly check:
- Are Pattern 11 slips rarer? (Expected: yes)
- Are handoff docs being updated reliably at end-of-session? (Should be trivial since Claude commits directly)
- Is `CHAT_REGISTRY.md` maintaining session-identifier entries correctly?
- Are destructive operations being caught by Rule M1 confirmations?
- Is the round-trip cost visibly lower? (Expected: yes, substantially)

If issues surface, log to `CORRECTIONS_LOG.md` and iterate on this migration doc.

---

## 10. Open questions for future Claude Code sessions to address

- **Does Claude Code session context persist across `exit` and restart on the same day?** Likely no (each `claude` invocation is a fresh context). Verify in first session.
- **Can multiple Claude Code sessions run in parallel in different terminals?** Unclear. For the director working solo, one session at a time is the expected pattern.
- **How does Claude Code handle very long tasks that would exceed a context window?** Same strategy as claude.ai — Claude proactively suggests a pause, user says "wrap up," Claude updates docs + commits, new session picks up from doc state.

These questions don't block migration — they'll be answered by first real use.

---

END OF DOCUMENT
