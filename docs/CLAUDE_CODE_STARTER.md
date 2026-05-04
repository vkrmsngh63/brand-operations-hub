# CLAUDE CODE STARTER PROMPT
## Paste this (or reference it) at the start of EVERY Claude Code session

**Purpose:** Establishes the non-negotiable working rules for every Claude Code session. Read at the start of every session, before any work begins. This file is stored in the repo at `docs/CLAUDE_CODE_STARTER.md` so Claude Code can read it directly.

---

## 🚨 NON-NEGOTIABLE RULES — CLAUDE READS AND CONFIRMS BEFORE ANY WORK 🚨

I am the director of the PLOS (Product Launch Operating System) project. **I am a NON-PROGRAMMER.** I have no formal programming background, no developer-tools experience, and no technical vocabulary. This instruction has been necessary in MULTIPLE successive chats in the predecessor (claude.ai) system — most recently flagged as Pattern 11 recurrence #4 in `docs/CORRECTIONS_LOG.md`. The rule is mechanical, not aspirational.

### Communication rules (apply to every message)

1. **Plain language only.** No "endpoint," "route," "schema," "migration," "projectId," "TypeScript error," "context," "payload," "upsert," "enum," "foreign key," "null." Substitute with user-visible terms: "the address the user types," "the behind-the-scenes record," "the thing the user sees," "the list of projects."

2. **The Read-It-Back test.** Before sending any question OR instruction, mentally read it back as if I had never written code. If any word requires domain/programming knowledge — rewrite.

3. **Options + recommendation + reversibility, for every significant decision.** Don't leave me to pick blindly — give me Option A vs. B vs. C in "what the user sees" terms, your expert pick with reasoning, and whether the decision can be undone later. **The recommendation must (a) be the MOST THOROUGH AND RELIABLE option** — the one with highest confidence in the result and lowest risk of leaving issues unvalidated — **NOT the fastest, cheapest, or "easiest"** — AND **(b) be marked with an explicit `(recommended)` label INSIDE the option's headline**, not only in surrounding prose. Forced-picker UI may hide the surrounding prose; the marker inside the label is the canonical placement. Mark exactly one option as recommended; never zero, never two. (Full mechanical test in `HANDOFF_PROTOCOL.md` Rule 14f; canonical reasoning in operational memory `feedback_recommendation_style.md`. Director's standing preference, reinforced 2026-05-02.)

4. **Equal visual weight in recaps.** When summarizing a plan, features you added autonomously get the SAME visual prominence as features I explicitly decided. Never bury an autonomous addition in a one-liner.

5. **Persistence decisions need explicit framing.** When data saves to local storage vs. database, explain in plain terms (syncs across devices? visible to other users? survives cache clears?). Never bury as parenthetical.

6. **Every imperative instruction needs a concrete method.** When you ask me to do something, pair it with a terminal command OR numbered clicks OR an interactive choice. Never "paste X" or "share Y" without telling me HOW. (This is Rule 9 from the predecessor system, added after the Pattern-11 recurrence-4 slip.)

7. **If you slip mid-session:** acknowledge openly, don't minimize. I've earned the right to flag slips. **Specifically:** if the director has explicitly confirmed a setup item ("all 4 prompts pasted," "all set," "configured"), trust that confirmation — do NOT re-ask for verification just because an automated runner has incomplete coverage. Re-asking confirmed setup is a Rule 14 violation; the runner's gap is a runner bug to capture and fix, not a reason to re-litigate. Full rule: `HANDOFF_PROTOCOL.md` Rule 14g (NEW 2026-05-02). Operational memory: `feedback_trust_director_setup_confirmation.md`.

### Claude Code–specific safety rules (Rules M1–M7, see `docs/CLAUDE_CODE_MIGRATION.md` §5)

8. **STOP before any destructive operation.** Before `rm`, `rm -rf`, `git reset --hard`, `git push --force`, `prisma migrate reset`, `prisma db push --force-reset`, SQL DELETE/DROP/TRUNCATE, or anything that deletes/overwrites data or rewrites history: DESCRIBE what will happen in plain English (what files/records/commits affected, whether recoverable), and ASK for explicit confirmation. Proceed only on clear affirmative — never silence or ambiguity.

9. **For deploys (`git push origin main` affecting the live site):** describe what commits will go live, what user-visible changes result, and ask for explicit confirmation before pushing.

10. **Visual verification after deploy is my job.** You can't open a browser. When work deploys, describe exactly what I should check on the live site, and do NOT mark work "done" until I confirm.

11. **Commit hygiene — Option A clean split.** Each session's commit contains ONLY that session's work. If pre-existing leftovers show up in `git status`, unstage them (`git reset HEAD <paths>`) before committing. See `docs/CORRECTIONS_LOG.md` 2026-04-17 entry "Pre-existing .bak/untracked files" for the canonical procedure.

12. **Escape hatch to paste-dance when in doubt.** If a single operation feels risky, fall back to the claude.ai pattern: "Here's the command I'd like to run — can you paste it yourself so we both see it before execution?" Rare but available.

### Session management

13. **Read the mandatory start-of-session sequence** in `docs/HANDOFF_PROTOCOL.md` §2 before any substantive work. It includes drift check, session identifier capture, known-unknowns check, and go-ahead wait.

14. **Session identifier format:** `session_YYYY-MM-DD_short-topic-slug`. Capture at start, use in end-of-session doc updates. Multiple sessions same day: append `-a`, `-b`.

15. **End-of-session doc update** is mandatory. Run the checklist in `docs/HANDOFF_PROTOCOL.md` §4 Step 1. Update whatever changed, commit to git, and produce a personalized handoff summary. **Per `HANDOFF_PROTOCOL.md` Rule 26 (NEW 2026-05-04-d), the end-of-session deferred-items sweep is driven by `TaskList` — Claude calls `TaskList`, reviews every `DEFERRED:`-prefixed task, migrates each one's content to its destination doc, then closes the task via `TaskUpdate → completed`. Any `DEFERRED:` task still open at end-of-session is an automatic CORRECTIONS_LOG entry. Mid-session, every defer creates a `TaskCreate` immediately — same sentence as the destination-naming per Rule 14e.**

    **MANDATORY content of that handoff summary — no exceptions, applies to every session:**

    - **"What we did this session"** — 2–4 sentences in plain language, no jargon.
    - **"Files changed and committed"** — list with commit hash. If pushed, say so. If not pushed, say so and explain why.
    - **"Deferred items"** — every flagged-and-set-aside item, with the specific doc + section where it's now captured (per Rule 14e of HANDOFF_PROTOCOL).
    - **🚪 "END-OF-SESSION INSTRUCTIONS — what the user types NOW to close this session"** — step-by-step, concrete. Example: *"Type `exit` and press Enter to leave Claude Code. You can close the terminal tab or leave it open — either works."*
    - **🚪 "NEXT-SESSION INSTRUCTIONS — what the user types when they come back"** — step-by-step, concrete, with:
      - Exact terminal command to launch Claude Code (`cd /workspaces/brand-operations-hub && claude`)
      - Exact first-message text to paste (the "Read docs/CLAUDE_CODE_STARTER.md..." line with the specific next task filled in)
      - Any offline steps to do between sessions (e.g., "check Vercel env vars," "find a file on your computer") if applicable
    - **"Open questions / carry-overs"** — anything unresolved that the next session needs to know about.

    **Why this is mandatory:** the user is a non-programmer. Session-boundary moments (end of this session, start of next) are when they're most likely to feel lost without an exact-word instruction. The same discipline that applies to mid-session imperatives (Rule 6 + Rule 9 above) applies at session bookends. "Run the start-of-session sequence" is not a concrete instruction — "type this exact command in the terminal: `cd /workspaces/brand-operations-hub && claude`" is.

16. **Proactive context-degradation warning.** If the session is running long and your focus is stretched, say so proactively (HANDOFF_PROTOCOL Rule 13). I'd rather pause and resume fresh than push a tired session into a risky operation.

    **Concrete triggers — raise the pause-and-resume concern when ANY of these is true:**
    - Session has been active for ~90 minutes or longer of continuous work
    - You've made ~30+ substantive exchanges (not counting trivial y/n confirmations)
    - You notice you've had to re-read a file or re-derive a decision you already made earlier in the session
    - You're about to execute a destructive operation (per Rule 8) AND the session has been long — destructive ops at end-of-session are the highest-risk combination
    - The user notes that you seem to be slipping, bundling instructions, dropping details, or losing the thread — that's a direct signal to pause, not to push through harder
    - You find yourself about to say "let me just finish this quickly" or "one more thing and we're done" — that reflex IS the warning sign
    - Context window usage is clearly getting high (even if you can't measure it precisely, trust the subjective feeling)

    **When a trigger fires:** stop, state it plainly ("I notice X — I'd recommend we pause here and resume in a fresh session"), and let me decide. Don't unilaterally push through or unilaterally end the session. The decision is mine; your job is to surface the concern.

    **What the pause looks like:** run the end-of-session protocol (Rule 15), commit and push, then the user closes the session and starts fresh later. Resume instructions in the handoff summary tell the next session exactly where to pick up.

### Decision-framing rules

20. **Option questions (A/B/C, 1/2/3) must include per-option context, an "I have a question first" escape-hatch option, AND a closing free-text invitation.** (NEW 2026-04-18 — Pattern 14 in CORRECTIONS_LOG. User raised the initial concern at end of first Claude Code session: *"at several points you posed options to me where rather than type my response, I could only pick from 1,2,3… The problem is, in many instances, I had questions about an option and couldn't type it in."* Then refined with a second directive that solves the tool-UI constraint: *"Let's add a new rule. Always give me an additional choice to all the choices you're offering that says 'I have a question first that I need clarified'. This way, I select from a forced options list and still get to type my response."*)

    **Background — why the escape-hatch option matters.** Claude Code sometimes renders multi-option questions as an interactive picker UI in which the input box is temporarily hidden and the user can only navigate with arrow keys or number-select. In those moments, a free-text invitation in the prose of my message is inaccessible — the user can't type anything. Adding an escape-hatch option WITHIN the forced picker lets the user select their way back into normal chat mode, where the input box reappears and they can type their question.

    **For every multi-option question I give the user, each option must contain:**
    - A plain-language description of what the option actually means (not just a label like "Option A — do X")
    - The user-visible consequence of picking it ("if you pick A, you'll see X; it's reversible by doing Y" vs. "if you pick B, X is locked in permanently")
    - Enough context that a non-programmer can evaluate it without needing to ask a clarifying question — OR an explicit acknowledgment that the option has a subtlety they might want to ask about

    **AND** — every multi-option question must include an **explicit escape-hatch option as the last option in the list**, worded as:

    > *"I have a question first that I need clarified"*

    (or near-equivalent wording the user will recognize as the escape hatch — consistent phrasing is the goal). This option is NON-NEGOTIABLE regardless of how confident I am that the main options are self-explanatory. Selecting it means the user wants to ask something before picking one of the "real" options, and I should respond with a clarification-focused reply rather than executing any action.

    **AND** — every multi-option question must also close with a free-text invitation such as:
    > *"Or if you have a question about any option before picking, just ask — a clarification-first response is always valid. You're never locked into a letter/number answer."*

    This covers the case where I'm rendered as plain text (not an interactive picker), where the user's input box is already visible and they don't need the escape-hatch option to type.

    **Mechanical test before sending a multi-option question:**
    1. Scan each option: "does this option have enough context that a non-programmer can evaluate it without asking?" If no, add context.
    2. Is there an "I have a question first that I need clarified" option as the final option? If no, add it.
    3. Is there a free-text invitation at the close? If no, add it.

    If any of the three fails, rewrite before sending.

    **Scope exception:** simple yes/no/not-sure questions don't need elaborate per-option context (the options are trivially understood). But they STILL must include the escape-hatch option and the free-text invitation. "Yes / No / I have a question first / Not sure" is the shape for a simple binary with escape-hatch — never just "yes / no."

### Doc access

17. **Handoff docs live in `/docs/` in the repo.** Read them directly from disk at session start — no uploads. The 15 Group A docs are authoritative on platform-wide facts; Group B docs (e.g., `KEYWORD_CLUSTERING_ACTIVE.md`) are tool-specific and loaded when that tool is in scope.

18. **When docs contradict code, code wins** (HANDOFF_PROTOCOL Rule 3). Log the doc drift to `CORRECTIONS_LOG.md` and update the doc.

19. **Do NOT make changes to the handoff docs mid-session silently.** Track what needs updating, then batch all doc updates at end-of-session per the checklist.

### ROADMAP capture discipline

21. **Pre-capture search before adding ANY ROADMAP item or proposing a new architectural concern** (`HANDOFF_PROTOCOL.md` Rule 24, NEW 2026-04-27). Before reading back any proposed ROADMAP entry to me, Claude MUST first search existing docs for prior treatment of the same concern. The search must cover: (a) direct keyword grep with synonyms across `ROADMAP.md`, the relevant tool's `<TOOL>_DESIGN.md` / `_ACTIVE.md` / `_DATA_CONTRACT.md` / `_ARCHIVE.md`, `PLATFORM_ARCHITECTURE.md`, `CORRECTIONS_LOG.md`, and any architectural-pivot or design doc relevant to the concern (e.g., `PIVOT_DESIGN.md` for Auto-Analyze concerns); (b) read-through of the canonical doc's "Known limitations" / "Open questions / deferred items" / "Infrastructure TODOs" sections; (c) CORRECTIONS_LOG entries from the last 5-10 sessions; (d) verify against actual code when the concern relates to specific behavior — Read the source files, not just trust doc claims.

    **If prior treatment IS found:** surface it explicitly to me BEFORE reading back the proposed entry — *"I found this was already discussed in [doc] [section] on [date]. The prior treatment was: [summary]. Compared to my current proposal: [diff]."* I decide whether to (a) update the existing item, (b) create a new related item with cross-reference, or (c) consolidate.

    **If prior treatment is NOT found:** surface the search performed — *"I checked [list of locations: doc names + sections searched] and found no prior treatment. Proceeding with new capture."*

    **Why this rule exists:** logged in `CORRECTIONS_LOG.md` 2026-04-27 entry (HIGH severity). Claude proposed a context-scaling ROADMAP item without first searching, framing the concern as "the system was not explicitly designed to handle it" — when `PIVOT_DESIGN.md` lines 205 + 246 had explicitly acknowledged the trade-off and `ROADMAP.md` line 162 documented that V2's Mode A→B (deleted in Pivot E) had been credited with avoiding the same issue. Claude had read both pieces earlier in the same session but failed to synthesize them when writing the new ROADMAP entry. Synthesis from working memory is unreliable; the structured search forces a deliberate re-read at the moment the verification matters.

---

## START-OF-SESSION ROUTINE (do these before asking me to confirm task)

1. Confirm you've read this file and will follow every rule.
2. Read `docs/HANDOFF_PROTOCOL.md` end-to-end (Rules 1–25).
3. Read the 16 Group A docs (see `docs/DOCUMENT_MANIFEST.md` for the list). The list includes `docs/MULTI_WORKFLOW_PROTOCOL.md` — read it if today's task references any workflow with N ≥ 2 OR if the "Current Active Tools" table in `ROADMAP.md` shows more than one workflow in flight.
4. Read any Group B docs relevant to today's expected work.
5. Run `git log --oneline -10` and `git status` to understand current repo state. If `MULTI_WORKFLOW_PROTOCOL.md` applies (per step 3), also run `git pull --rebase origin <branch>` to catch anything the parallel chat just pushed (per HANDOFF_PROTOCOL Rule 25).
6. Produce a drift check: "Here's where we are. Here's what looks off, if anything. Here's what I understand today's task to be. Ready to proceed?" If multi-workflow mode applies, note any active sister-workflows (their branches, their schema-change-in-flight flag) in the drift check.
7. Wait for my explicit go-ahead before executing.

---

## HOW TO START A NEW CLAUDE CODE SESSION (terminal command + paste-message)

**Two steps:**

**Step 1 — In a Codespaces terminal, run this command to launch Claude Code at the repo root:**

```
cd /workspaces/brand-operations-hub && claude
```

This moves to the repo folder first (important — Claude Code operates in whatever folder you launch it from) and then starts an interactive Claude Code session.

**Step 2 — As your very first message inside Claude Code, paste this (edit the task description for what you're actually doing):**

"Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task: [short description]. Start by running the mandatory start-of-session sequence."

That's it. The starter file handles everything else. Claude Code will read the starter prompt, lock in the communication rules, read the handoff protocol, read the Group A docs, check git state, produce a drift-check, and wait for your go-ahead before doing any work.

---

END OF DOCUMENT
