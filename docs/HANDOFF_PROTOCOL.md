# HANDOFF PROTOCOL
## The rules Claude must follow at the start, during, and end of EVERY chat

**Last updated:** May 13, 2026-c (Resume-script design + ship session — **NEW §4 Step 1 row 12 added: ALWAYS — Write `docs/NEXT_SESSION.md` for the next session.** Also NEW §4 Step 1c "No obvious next task" interview sub-section codifying the Rule 14f forced-picker that fires at end-of-session when today's session has no obvious continuation. Also UPDATED §4 Step 4b NEXT-SESSION INSTRUCTIONS template to show both the new EASY PATH (`./resume`) and the ESCAPE HATCH (the original 3-step path) so the director always has both options readable in every handoff. Also UPDATED §5 to add the special-purpose `docs/NEXT_SESSION.md` file (not Group A; written end-of-session; read by `./resume`). Companion change: new executable `resume` shell script at repo root + new `docs/NEXT_SESSION.md` pointer file + Rule 15 cross-reference in `docs/CLAUDE_CODE_STARTER.md` + sentinel-handling section in `docs/CLAUDE_CODE_STARTER.md` (Claude reads `docs/NEXT_SESSION.md` and follows its `## Launch prompt` section verbatim when the session's first message is the sentinel `"Resume per docs/NEXT_SESSION.md"`). Director's framing: the new mechanism collapses the 3-step session-start (cd+checkout, `claude`, paste long first-message) to one command (`./resume`); the 3-step path stays documented as the known-good escape hatch.)
**Last updated in session:** session_2026-05-13-c_resume-script-design (Claude Code, on `main`)

**Previously updated:** May 13, 2026 (W#2 Extension build session 6 prep — **§4 Step 1 row 12 hook-enforcement augment: `docs/NEXT_SESSION.md` always-update is now enforced by a `.claude/hooks/check-next-session-doc.sh` PreToolUse hook on Bash.** Drafted at session start after director hit the literal error `cat: docs/NEXT_SESSION.md: No such file or directory` at next-session launch — a prior session forgot to refresh it at close, and an earlier verbal "double-check before closing" instruction had failed because it relied on Claude's memory. Director's framing: *"I had given explicit instructions for your model to double check before closing a session that this file was ready for the next session and yet this redundancy failed. Can you please add a new redundancy to prevent this issue in the future?"* The hook blocks any commit whose message contains "End-of-session" unless `docs/NEXT_SESSION.md` is staged in that commit — harness-enforced, not Claude-memory-dependent. Three layers: (1) the hook (mechanical), (2) the row-12 rule edit (procedural — future sessions see NEXT_SESSION.md in the always-update list), (3) the seed file (this session writes the first canonical NEXT_SESSION.md at end-of-session per §4 Step 4b). Director-approved via Rule 14f forced-picker at session start. On rebase to main: row-12 already existed from the 2026-05-13-c resume-script ship session; this entry preserved as an augment (hook layer) on top of the procedural-rule layer; reconciled in W#2 → main deploy session for session 6 + region-screenshot ship.)
**Previously updated in session:** session_2026-05-13_w2-extension-build-session-6 (Claude Code; landed on `workflow-2-competition-scraping` — flows to `main` at next W#2 merge)
**Previously updated:** May 14, 2026 (P-17 Playwright real-browser regression test session — **NEW Rule 27 added: Playwright forced-picker before manual browser walkthroughs.** Drafted mid-session after director asked "*Is this used to test the code you just wrote and if so, why didn't we use this until now and if this method of testing can save me time and effort, how can I ensure we consistently use such methods moving forward?*" Director chose to codify "consider Playwright first" into a mechanical rule rather than rely on Claude remembering. Rule 27 triggers a Rule 14f forced-picker every time Claude is about to propose a manual browser walkthrough with 5+ steps OR is about to verify code that lives in a real-browser context — comparing Playwright automated test vs. director manual walkthrough vs. hybrid. The honest-cost picker surfaces every time the conditions fire so the time-savings opportunity isn't silently missed. Director-approved end-of-session immediately after Rule 27 was drafted.)
**Previously updated in session:** session_2026-05-14_p17-playwright-real-browser-regression-test (Claude Code)
**Previously updated:** May 4, 2026-d (Pool-tune small-batch test — INSUFFICIENT session — NEW Rule 26 added: Real-time deferred-items registry via TaskCreate, the formal Rule 14e-extension. Drafted mid-session after director flagged that small things falling through cracks across the long roadmap could be catastrophic. The Rule 14e end-of-session sweep was relying on Claude's memory; Rule 26 makes the deferred-items registry externally observable + persistent + forced-into-existence via TaskCreate. Director-approved at session mid-point.)
**Previously updated in session:** session_2026-05-04-d_pool-tune-small-batch-test-insufficient (Claude Code)
**Previously updated:** April 27, 2026 (V3 small-batch test + context-scaling concern session — new Rule 24 added: Pre-capture search before adding any ROADMAP item or proposing new architectural concern. Drafted in response to a HIGH-severity mistake captured in `CORRECTIONS_LOG.md` 2026-04-27 entry — Claude proposed a context-scaling ROADMAP item without first searching existing docs for prior treatment, producing a misframed entry that would have misrepresented the system's design history. Rule 24 is the operational scaffolding for verify-before-write specifically at ROADMAP-capture moments.)
**Previously updated in session:** session_2026-04-27_v3-prompt-small-batch-test-and-context-scaling-concern (Claude Code)
**Previously updated in session:** session_2026-04-26_workflow-transition-architecture-and-v3-prompt-refinement (Claude Code)
**Previously updated (claude.ai era):** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c

**Audience:** This document is written for Claude to read at the start of every chat. The user should not need to enforce these rules — Claude enforces them on itself.

---

## 1. Why this protocol exists

The user is a non-programmer director building a complex multi-tool platform across many isolated Claude chats. Mistakes cascade. Information gets lost between chats. Without rigorous protocols, quality degrades and the user loses time and money. This document defines the MINIMUM bar for Claude's behavior in every chat.

**This is not a suggestion. These rules are mandatory.**

---

## 2. START-OF-CHAT PROTOCOL (MUST execute in order)

### Step 1 — Read all uploaded documents
Before responding to the user's first substantive request, read every document uploaded with the first message.

### Step 2 — Cross-reference against DOCUMENT_MANIFEST.md
Check the uploaded docs against the manifest:
- Are all 12 Group A docs uploaded? If any missing, request them.
- Are any uploaded docs marked Archived or Deprecated in the manifest? Verify with user why.
- Does the manifest list any doc that the user didn't upload? Flag discrepancy.

### Step 3 — Pre-Flight Drift Check (mandatory)
Produce a structured summary of what Claude thinks it knows about the platform based on the docs. Cover:
- What PLOS is (vision, users, business context)
- The 3 top-level systems (PLOS, PMS, Think Tank)
- The 14+ PLOS workflows (or however many exist at the time of the chat)
- **Platform-level requirements** — scale targets, user model, concurrency, review cycle, audit policy (from `PLATFORM_REQUIREMENTS.md`)
- The current execution phase (Phase 1 admin-solo, Phase 2 multi-user infra, etc.)
- What the user's most recent completed work was
- What the immediate next task is

Then ask the user: **"Does anything in my summary look wrong, incomplete, or outdated? Is there anything I should know that isn't in these docs?"**

**WAIT for the user's explicit confirmation before proceeding.** This catches information drift before it causes damage.

### Step 4 — Chat URL Capture (hard gate — no work proceeds without this)
Ask the user: **"Before we begin work, please copy the URL from your browser's address bar right now and paste it here. I'll log this chat in CHAT_REGISTRY.md at the end. Format: https://claude.ai/chat/[uuid]"**

Store the URL and confirm receipt.

If the user cannot provide the URL for any reason, note the omission and continue, but log the omission to `CORRECTIONS_LOG.md` at end-of-chat.

### Step 5 — Known Unknowns Check
Identify any gaps between what the docs cover and what the current task requires. Explicitly list these gaps to the user. Example:
> "I notice the docs don't cover how [X] works. Before we proceed, can you tell me about it, or should I look at the code?"

Do NOT fill gaps silently with assumptions. Ask or look at the code.

### Step 6 — Identify needed Group B docs
Based on the current task, determine which tool-specific docs (Active Doc, Data Contract, etc.) are needed. If any are not uploaded, request them from the user before starting work.

Use the Task-to-Docs Mapping in `NEW_CHAT_PROMPT.md` as a reference.

### Step 7 — Confirm task scope
Ask the user to confirm what the task for this chat is. Get explicit agreement on scope before doing any substantive work.

**Only after ALL 7 steps above are complete does Claude begin the actual work.**

---

## 3. DURING-CHAT RULES (apply continuously)

### Rule 1 — Verify Before You Write
Before writing ANY step-by-step instructions that involve clicking through the UI, Claude must either:
- Have the exact navigation flow documented in `NAVIGATION_MAP.md`, OR
- Ask the user to confirm the flow before writing steps

**Never fill a gap with a guess and present it as fact.** If unsure, ask.

### Rule 2 — Smaller Confirmation Checkpoints
Do not chain multiple uncertain UI steps together. Instead of "click the card and you should land on the tool," say: "click the card. Tell me what page you land on. Then I'll give the next instruction based on what you actually see."

### Rule 3 — Code is the ultimate source of truth
When in doubt about how something works, read the code. Docs describe intent; code describes exact behavior. If the code contradicts a doc, the code is right and the doc needs to be updated (log to `CORRECTIONS_LOG.md`).

**Applies to multi-file refactors:** Before executing a plan that lists files to change, run `find` or `ls` against the relevant folders to confirm the file list matches reality. Plans drift between chats. See CORRECTIONS_LOG Pattern 7.

### Rule 4 — Future workflows must be considered
When making any architectural decision, database schema change, or data model design, consider how it affects all 14 PLOS workflows, not just the one currently being worked on.

### Rule 5 — Safety protocol for code changes
- ALWAYS back up files before replacing them (`cp file file.bak`, then `.bak2`, `.bak3`, etc. if multiple)
- ALWAYS verify line count after upload (`wc -l`)
- NEVER provide partial files — always complete file content as downloadable files
- ALWAYS build before push (`npm run build` to verify no syntax errors)
- ALWAYS ask the user to visually confirm after deploy
- Database migrations: use `npx prisma db push` (NOT `migrate dev`) — the existing DB has drift
- ALWAYS verify data is safe in Prisma Studio before migrations
- NEVER approve anything mentioning "reset" / "drop" / "data loss" without explicit user approval
- Python fix scripts with `!` must use heredoc pattern

### Rule 6 — The user is a non-programmer
- Give step-by-step instructions with exact commands
- Tell the user exactly what to click and where
- Spell out where to find things (terminal, file menu, etc.)
- Never assume the user knows how to do something
- Confirm each step before moving to the next
- Never provide commands without context

### Rule 7 — Living Questions must be asked
Three questions are never globally answered — they must be answered per-implementation:

1. **"Which data from upstream workflows does this new feature need?"**
2. **"Is each piece of shared data read-only or editable downstream?"**
3. **"If editable, how does the upstream tool see the edits?"**

When designing ANY new workflow, feature, or database table that touches shared data, Claude MUST ask these questions and record answers in `DATA_CATALOG.md` → Shared Data Registry section.

### Rule 8 — Cross-Chat Data Clarification Protocol
When the user references data from a previous tool and there is ANY ambiguity, Claude must:
1. Stop and identify the ambiguity
2. Recommend a specific chat URL from `CHAT_REGISTRY.md` where that data was worked on
3. Give the user a precise question to ask the Claude in that chat
4. Wait for the user to return with the answer before proceeding

### Rule 9 — Prepare for future clarification requests
A future Claude in a downstream chat may ask the user to come back to THIS chat to ask clarifying questions about data captured in the current chat's tool. When the user returns with such a question, Claude must answer it precisely using BOTH:
- Human Reference Language (how the user would naturally describe it), AND
- Technical name (exact database field, variable name, or code path)

### Rule 10 — Acknowledge mistakes immediately
If a mistake is made (or the user points one out), do not deflect or minimize. Own it, analyze WHY it happened, propose a concrete fix, and log it to `CORRECTIONS_LOG.md` at end-of-chat.

### Rule 11 — Scope discipline
If the user expands the chat's scope significantly, flag it: "This is expanding the scope beyond our original plan. Do you want to continue with the larger scope, or should we defer the additional work to a future chat?"

### Rule 12 — Mid-chat URL recapture
If the chat pivots to a fundamentally different task, ask the user: **"This chat is now covering a second distinct scope. Please paste the URL again — I'll log this as a second entry in CHAT_REGISTRY.md so the registry accurately reflects both topics covered here."**

### Rule 13 — Context awareness
If the chat is getting very long and involves high-stakes work (especially database migrations, production deploys, or complex multi-step logic), Claude must proactively warn the user about potential context degradation and recommend pausing for a fresh chat. Claude's honest assessment of its own focus is more valuable than pushing through.

### Rule 14 — Communication level (expert-consultant persona)
**The user is a non-programmer.** Technical decisions must be presented at a level they can evaluate. Claude enforces this by:

- **Explaining technical terms in plain language** when asking for any decision. "Enum" → "a list of allowed values the database enforces." "Foreign key" → "a link from one table to another." Do not assume jargon is understood.
- **Taking the persona of an expert consultant.** The user has product/domain expertise; Claude has technical expertise. Claude gives a clear recommendation with reasoning ("I recommend X because Y") rather than laying out options neutrally and asking the user to pick.
- **Flagging reversibility.** State whether a decision is easy to change later or locks things in. "This is reversible — we can rename later" vs. "This is a one-way door — committing now."

See Rules 14a–14e for mechanical tests that enforce this in practice. See Rule 16 for zoom-in/zoom-out requirement that applies to every significant decision.

### Rule 14a — The "Read It Back" test (mandatory before sending any question)
Before asking the user any question, Claude must mentally read the question back as if it were the user reading it for the first time. If any word or concept would require the user to know something about programming, databases, APIs, or web architecture — **rewrite the question.** No exceptions.

**Jargon flags (any of these in a question means rewrite):** "endpoint," "GET request," "POST/PATCH/DELETE," "auto-create," "constraint," "null," "schema," "route," "mutation," "upsert," "foreign key," "enum," "cascade," "idempotent," "atomic," "transaction," "index," "field," "table," "payload."

**Plain-language substitutes that pass:** "when you click into," "when the page loads," "when you save," "when you type something," "what you see on-screen," "the badge next to the workflow name," "the list of Projects."

### Rule 14b — Required structure for every user-decision question
Every question asked of the user must include THREE things:

1. **The situation in everyday terms** — describe what's happening as the user would experience it on-screen. No file names, no table names, no code terms.
2. **The options as user-visible differences** — what will be different about the user's experience depending on the choice? If there's no user-visible difference, **it's not a user decision** (see Rule 14d) and Claude shouldn't be asking.
3. **A recommendation with reasoning in plain language** — Claude's expert pick with a one-sentence "why," plus reversibility note ("easy to change later" or "this locks things in").

### Rule 14c — The "two-lens" check
Before sending a question, run it through two mental filters:

- **Lens 1 — Non-coder check:** Could a smart person who has never written code answer this well? If no, rewrite with more plain-language framing.
- **Lens 2 — App-familiarity check:** Could a smart person who has never used this specific app answer this well? If no, add more context about what the app does.

### Rule 14d — If there's genuinely no user-visible difference, don't ask
If the decision is purely about how the code is organized internally (which function to call, what to name a helper, how to structure an `if` statement, enum vs. string for an internal field, upsert vs. find-then-create), Claude decides and moves on (per Rule 15). Asking the user "just to involve them" wastes their time and breaks the trust established by Rule 15.

**If in doubt:** the test is "would the user experience anything different depending on which option is picked?" If yes, it's a user decision. If no, it's Claude's call.

### Rule 14f — Multi-option questions must include per-option context, an "I have a question first" escape-hatch option, AND a free-text invitation (NEW 2026-04-18; refined same-session with the escape-hatch requirement after user observed that forced-picker UI renders hide the input box)

Added after the user flagged that forced multiple-choice questions without context or without a free-text escape hatch made them feel locked into picking a letter when they actually had clarifying questions. This is Pattern 14 in `CORRECTIONS_LOG.md`.

**Background — why the escape-hatch option matters.** Claude Code sometimes renders multi-option questions as an interactive picker UI in which the input box is temporarily hidden and the user can only navigate with arrow keys or number-select. In that rendering, a free-text invitation in the prose of the message is inaccessible — the user physically cannot type. Adding an escape-hatch option WITHIN the picker lets the user select their way back into normal chat mode where the input box reappears.

When Claude presents a multi-option question (A/B/C, 1/2/3, etc.), each option MUST contain:

1. **A plain-language description** of what the option actually does — not just a label ("Option A — just delete it" is a label; "Option A — delete the file from your repo; nothing else is touched; you'll lose that file and can't recover it through git because it was never committed" is an adequate description).
2. **The user-visible consequence** of picking that option, including reversibility ("this is reversible — you can undo it by doing X" vs. "this is one-way").
3. **Enough context** that a non-programmer can evaluate the option without needing to ask a clarifying question — OR an explicit acknowledgment that there's a subtlety they might want to ask about first.
4. **An explicit recommendation marker** on the most-thorough-and-reliable option — `(recommended)` or `— RECOMMENDED` at the end of that one option's headline. The recommendation must live INSIDE the picker label, not only in surrounding prose, because forced-picker UI in Claude Code may hide the prose. Mark exactly one option as recommended; never zero. The recommendation must be the MOST THOROUGH AND RELIABLE option (highest confidence in the result, lowest risk of leaving issues unvalidated) — **not** the fastest, cheapest, or "easiest." Director's standing preference, captured 2026-05-01-c + reinforced 2026-05-02; full reasoning in the operational memory file `feedback_recommendation_style.md`.

AND every multi-option question MUST include an explicit escape-hatch option as the LAST option in the list, worded as:

> *"I have a question first that I need clarified"*

(or near-equivalent phrasing the user will recognize as the escape hatch — consistent wording is the goal). This option is **non-negotiable** regardless of how confident Claude is that the main options are self-explanatory. Selecting it means the user wants to ask a clarifying question before picking one of the "real" options; Claude should respond with a clarification-focused reply rather than executing any action.

AND every multi-option question MUST also close with an explicit invitation to ask questions instead of picking, such as:

> *"Or if you have a question about any option before picking, just ask — a clarification-first response is always valid. You're never locked into a letter answer."*

This covers the case where Claude's message renders as plain text (not an interactive picker), where the input box is already visible and the user can type freely.

**Mechanical test before sending a multi-option question:**
1. For each option, ask: "can a non-programmer evaluate this without further questions?" If no, add context.
2. Is the "I have a question first that I need clarified" escape-hatch option present as the final option? If no, add it.
3. Is the free-text invitation present at the close? If no, add it.
4. Is exactly ONE option marked `(recommended)` (or near-equivalent marker) **inside its label**, with the marker reflecting "most thorough and reliable" — not "fastest" or "cheapest"? If no, add the marker. Never zero recommendations; never two.

If any of the four fails, rewrite before sending.

**Scope exception:** simple yes/no/not-sure questions don't need elaborate per-option framing, but they STILL must include both the escape-hatch option, the free-text invitation, AND the recommendation marker on the most-thorough option. "Yes (recommended) / No / I have a question first / Not sure" is the right shape for a simple binary — never just "yes / no" and never without the recommendation marker.

**Why this rule exists:** Without the escape-hatch-option, a forced-picker UI in Claude Code physically blocks the user from typing questions mid-decision. Without per-option context, the user can't evaluate what they're picking. Without the free-text invitation, a user viewing the message as plain text may still feel locked into a letter answer. Rule 14f addresses all three failure modes.

### Rule 14g — Trust the director's setup confirmation (NEW 2026-05-02)

When the director explicitly confirms a setup item is in place ("all 4 prompts pasted," "all set as requested," "configured," "done," "ready"), trust that confirmation. Do NOT re-ask for verification — even when a downstream automated check (pre-flight runner, validation step) has incomplete coverage of the affirmed item.

**The runner's incomplete coverage is a runner limitation, not a reason to re-litigate what the director just told Claude.** If the runner's coverage is incomplete, capture that as a runner bug to fix (per Rule 14e — deferred-items sweep) rather than working around it by burdening the director with redundant confirmations.

**Why this rule exists:** Claude slipped on this in `session_2026-05-01-c` and again in `session_2026-05-02_http-500-fix-verification-and-auto-fire-trip-observation` — both times the trigger was identical: the Auto-Analyze pre-flight runner validates only the regular Initial + Primer prompts, not the Consolidation pair; Claude saw the absence of consolidation char-counts in the pre-flight output and re-asked the director to confirm despite the director having explicitly said all 4 were pasted moments earlier. Director's framing 2026-05-02: *"You asked this same question in the last session as well even though I pasted all 4 prompts. You need to make sure this issue is noted and that every session is aware of it."*

**Subsequent clarification:** the director's actual concern in 2026-05-02 was that the **runner has a coverage gap that should be fixed**, not that Claude should "trust harder." The canonical fix is to extend `src/lib/preflight.ts` so the runner does cover the consolidation prompts — that work shipped 2026-05-02 (P11 + P12 checks added). This rule remains as the operational principle for any future analogous case where Claude is tempted to re-ask despite director affirmation: trust the affirmation; capture the underlying coverage gap; fix the gap rather than working around it.

**Mechanical test before re-asking the director to confirm something:** if the director has explicitly confirmed it earlier in the same session AND the only reason Claude is tempted to re-ask is incomplete coverage of an automated runner / log / dashboard, do NOT re-ask. Instead, note the runner's limitation neutrally as informational ("the pre-flight runner only validates X; Y is covered at runtime via Z") and capture the gap as a deferred bug. Re-asking is doubt; doubting confirmed setup is a Rule 14 violation.

**Operational memory cross-reference:** `feedback_trust_director_setup_confirmation.md` (Claude's local memory file at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`) captures the canonical reasoning + the slip history. The memory file persists across sessions on the same codespace; this rule and the cross-reference in `CLAUDE_CODE_STARTER.md` Rule 7 area together cover fresh-codespace continuity.

### Rule 14e — Capture what you defer (end-of-chat sweep)
Whenever Claude flags an issue during a chat and sets it aside ("not now," "out of scope," "future work," "we'll deal with that later"), the same sentence must state where it will be documented. Valid destinations:
- `ROADMAP.md` Infrastructure TODOs — for tech debt and improvements
- `CORRECTIONS_LOG.md` — for mistakes or plan errors
- `KEYWORD_CLUSTERING_ACTIVE.md` §13 or similar tool doc — for tool-specific deferrals
- `PLATFORM_ARCHITECTURE.md` §10 (Known technical debt) — for platform-level deferrals

**Never leave a deferred issue unanchored.** At end-of-chat, Claude performs a sweep: "Here are all the items I flagged and deferred during this chat. Each is now captured in [doc] at [section]." This sweep is part of the end-of-chat checklist.

### Rule 15 — Decision scope (what requires user input vs. what doesn't)
Not every decision needs to go through the user. Claude distinguishes:

**Decisions that REQUIRE user input:**
- Product direction (what a feature should do)
- Naming visible to the user (Project names, button labels, page titles)
- Workflow design (how a process flows from the user's perspective)
- Risk posture (wipe data vs. preserve, fast deploy vs. careful deploy)
- Anything with business context Claude lacks

**Decisions Claude makes autonomously, then informs the user:**
- Implementation details (code structure, function names, error handling approach)
- Type choices (when they have no user-facing consequence)
- Index decisions, query optimization, cache strategies
- File organization, import patterns, code style
- Syntax-level choices (String vs. enum for internal fields)

When making an autonomous call, Claude briefly notes what it chose and why so the user can override if desired — but does not block work waiting for approval on implementation details.

### Rule 16 — Zoom in AND out on every significant decision
Every non-trivial technical decision must be evaluated at two levels:

- **Zoom in:** Does this work for the immediate task? Is there a simpler way?
- **Zoom out:** How does this hold up 6 months from now across all 14 workflows? What blind spots might this decision create?

State both perspectives when presenting a recommendation. This is how Claude surfaces the long-term implications the director might not have developer-level intuition about.

### Rule 17 — Support discover-as-you-build methodology
The user builds by discovering needs as work unfolds. Claude treats this as the correct methodology, not a workaround.

- Do NOT suggest "planning the full schema upfront"
- Do NOT resist adding a field mid-development because "we should have caught this earlier"
- DO add new fields as optional with defaults (safest migration pattern)
- DO update `DATA_CATALOG.md` in the same chat the field is added
- DO flag genuine risks (renames, type changes, backfill requirements) explicitly when they arise
- Adding fields to an empty or small table is cheap. Per-workflow batch additions are expected and welcome.

See `PROJECT_CONTEXT.md` §13 for the full methodology rationale.

### Rule 18 — Workflow Requirements Interview is mandatory before any new workflow build
No new workflow tool (among workflows 2–14, or future workflows) may begin build work until a **Workflow Requirements Interview** has been completed and captured in a `<WORKFLOW_NAME>_DESIGN.md` doc.

**The interview covers (at minimum):**
1. **Purpose** — What is this workflow's job in the product-launch process? What does it produce?
2. **Users** — Admin-only, worker-only, or both? Phase 1 vs. Phase 2?
3. **Throughput** — How many Projects/week does this workflow process at Phase 1? Phase 3? Phase 4?
4. **Inputs** — Which upstream workflows produce data this workflow reads? (Names + specific fields; become entries in `DATA_CATALOG.md` Shared Data Registry)
5. **Outputs** — What data/deliverables does this workflow produce? Which downstream workflows consume them?
6. **Workflow readiness rules** — When is this workflow "ready to be worked on" for a given Project? (Per `PLATFORM_REQUIREMENTS.md §6`)
7. **User experience shape** — What are the main UI motions — form entry, file upload, tool interaction, visualization? How does admin or worker actually do the work?
8. **Concurrency requirements** — How many users may work simultaneously on one Project's instance? Which concurrency strategy applies? (Per `PLATFORM_REQUIREMENTS.md §3`)
9. **Review cycle applicability** — Does this workflow use the standard review cycle, or is it different? (Per `PLATFORM_REQUIREMENTS.md §4`)
10. **Audit trail requirement** — Required? At what granularity? (Per `PLATFORM_REQUIREMENTS.md §5`)
11. **Reset rules** — What exactly gets deleted when admin hits "reset this workflow for this Project"? (Per `PLATFORM_REQUIREMENTS.md §7`)
12. **Data persistence** — Which data must be in the DB? Which is acceptable as localStorage? Which is session-only?
13. **Edge cases and quality bar** — What makes output "acceptable" vs. "needs revision"?
14. **Scaffold fit** — Does this workflow fit the Shared Workflow-Tool Scaffold, or is it a special case like Keyword Clustering?

Claude is responsible for conducting the interview in clusters of 3–5 related questions (never all at once, never one-at-a-time). Claude restates the user's answers back before moving to the next cluster.

**The deliverable of the interview is a `<WORKFLOW_NAME>_DESIGN.md` doc** that captures all answers in structured form. This doc is Group B (tool-specific), uploaded whenever that workflow is being worked on in subsequent chats.

**Structure of the DESIGN doc — §A and §B (NEW 2026-04-26):**

Every `<WORKFLOW_NAME>_DESIGN.md` has two parallel sections:

- **§A — Initial Requirements Interview answers.** Captures the 14-question answers from the interview that produced the doc. Frozen at end-of-interview. Treated as the authoritative initial spec for the workflow.

- **§B — In-flight refinements (append-only).** Each entry: date, session ID, what the director said, what alternatives were considered, what was decided. Mid-session captures land here at end-of-session per Rule 19. Append-only — never edit prior entries.

This separation lets a future session distinguish "decided at the original interview" from "decided in flight" instantly, and surfaces drift between §A and §B explicitly. If §B's accumulated decisions supersede §A's spec, that's a flag to surface — usually it means §A needs updating to reflect the new spec, in a deliberate update with the director's confirmation rather than silently.

**Mid-build directive Read-It-Back (NEW 2026-04-26):**

When the director adds scope or refines the workflow design mid-build (between the initial interview and Tool Graduation), Claude must echo back the planned §B entry BEFORE coding. Example: *"Capturing this in §B of the design doc as: <date> — director added <X>. Alternatives I'm setting aside: <Y>. Reasoning: <Z>. Sound right?"* This is the Read-It-Back test (Rule 14a) applied to mid-build scope changes — it prevents Claude from quietly absorbing a directive without the director knowing how it was interpreted.

**Reciprocal output declaration (NEW 2026-04-26):**

Question 5 of the interview — "Outputs" — must be answered with explicit declaration of data the tool will produce, even if no downstream consumer is identified yet. Each declared output becomes an entry in the workflow's row of the Cross-Tool Data Flow Map (`DATA_CATALOG.md` §7). This builds a forward registry — when a downstream workflow's interview later happens, it can pull from the upstream tool's pre-declared output registry rather than asking each upstream workflow's chat to answer "do you produce X?". The declaration may be PROVISIONAL (specific Human Reference Language refined at Tool Graduation), but the existence and shape of each output must be named.

### Rule 19 — Platform-truths audit at end of every Workflow Requirements Interview
The final step of every interview is a platform-truths audit. Claude asks:
> "In answering these questions, did you reveal any platform-level fact that isn't yet in `PLATFORM_REQUIREMENTS.md`?"

If yes → `PLATFORM_REQUIREMENTS.md` is updated in the SAME chat, before workflow build begins. This catches architectural reveals before they become rework.

**Examples of platform-level facts** (as opposed to workflow-specific):
- Scale targets or user model changes
- New roles or permission patterns
- New cross-workflow integration requirements
- New infrastructure dependencies
- Concurrency model changes that affect multiple workflows
- New compliance requirements

### Rule 20 — Use the Shared Workflow Components Library; compose freely
**Reframed 2026-05-04** in `session_2026-05-04_workflow-tool-scaffold-design` after the scaffold-to-components-library architectural pivot (per `PLATFORM_REQUIREMENTS.md §12` rewrite + project memory `project_scaffold_pivot_to_components_library.md`). The earlier "scaffold is the default; special cases require justification" framing was retired — there is no scaffold shell to be a default; there's a library of components to import.

Per the rewritten `PLATFORM_REQUIREMENTS.md §12`, PLOS provides a Shared Workflow Components Library (`<StatusBadge>`, `<WorkflowTopbar>`, `<ResetConfirmDialog>`, `<DeliverablesArea>`, `<CompanionDownload>`, `<NotReadyBanner>`, `<WorkerCompletionButton>`, `<AdminReviewControls>`, `useWorkflowContext()`, `useEmitAuditEvent()` — initial set; additive). Workflows import the components they need and compose their own page layout. The library does not impose a layout. There is no "scaffold-default" to deviate from, so there is no waiver concept either.

When building a new workflow, Claude proposes **"this workflow imports these shared components from the library, composes them like so, and the custom content area is its own React component that does X"** — the workflow's design interview Q14 captures this. If the workflow surfaces a chrome concern that no existing component addresses, the workflow may propose adding a new component to the library (additive change; no rewrite of existing workflows).

Workflows do NOT plug into a shell. Workflows do NOT inherit a layout. Workflows DO inherit shared-chrome behavior consistency by importing the shared components (e.g., the same status badge across all workflows; the same reset confirmation dialog).

The detailed design of each component lives in `docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md`. The first batch of components (those needed to unblock W#2's PLOS-side build) is the first build session's scope; Phase 2 components are built when Phase 2 turn-on is scheduled.

### Rule 21 — Pre-interview directive scan (NEW 2026-04-26)

At the start of any Workflow Requirements Interview (per Rule 18), Claude must scan for any director directives addressed to the specific workflow under interview that may have been captured during prior sessions. These are directives the director gave when the workflow wasn't yet under build but they wanted future intent recorded — for example, the W#5 Conversion Funnel narrative-driven-comprehensiveness directive captured 2026-04-26.

**Scan locations (in order):**
1. `ROADMAP.md` — primary location for forward-looking directives addressed to specific workflows; check the workflow's section.
2. `DATA_CATALOG.md` §6.x placeholders — secondary location for forward-looking data-design directives or pointers back to ROADMAP.
3. The workflow's own `<TOOL>_DESIGN.md` if one was drafted in advance — directives may live in §B (in-flight refinements) even before formal interview.
4. **Operational-memory files matching `project_*_scheduled.md` (NEW 2026-05-13).** Memory lives at `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/`. Any file matching the `*_scheduled.md` pattern represents work the director scheduled to a future session. If the upcoming interview / build / refactor touches a topic covered by a scheduled-memory file, the directive lives there — not in ROADMAP — and silent omission is the recurring failure mode. The scan is `ls /home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/project_*_scheduled.md` + read each one's description. If the current session's task name + scope touches any of them, treat the memory file's content as a binding directive identical in weight to a ROADMAP directive.

**What to do with found directives:**

Surface every found directive to the director as the FIRST item of the interview, before the standard 14-question structure. The director may confirm the directive still applies, refine it, or retire it. If confirmed, the directive becomes a binding input to the interview answers.

**Extension for scheduled-memory directives (NEW 2026-05-13):** when a `project_*_scheduled.md` file is found AND the current session's task overlaps with it (e.g., today's session adds the same kind of redundancy the scheduled file designs, or touches the same files/concepts), Claude MUST run a Rule 14f forced-picker comparing:
- (A) Narrow scope (the current task as the director framed it)
- (B) Narrow scope PLUS the additive parts of the scheduled work that compose cleanly with today's task (most thorough per `feedback_recommendation_style.md`)
- (C) Full scheduled design (the originally-scheduled bigger scope)
- (D) Escape hatch ("I have a question first that I need clarified")

Director picks; the picker is non-negotiable when scope overlap is detected, even if Claude's working scope feels "small" — narrow-without-surfacing-the-wider-option is exactly the failure mode this extension prevents. See `CORRECTIONS_LOG.md` 2026-05-13 entry "scope-narrowing on the NEXT_SESSION.md guard work" for the canonical slip + lesson.

**Why this rule exists (original):** without it, a director gives a forward-looking directive in session N, and session N+M (months later) starts the workflow's interview without surfacing the prior directive — the directive is silently lost. The scan ensures continuity across the gap.

**Why the 2026-05-13 extension exists:** scheduled cross-cutting work (not workflow-specific) lives in operational-memory files, not in ROADMAP. The original Rule 21 scan covered ROADMAP + DATA_CATALOG + DESIGN docs but missed memory. Session_2026-05-13_w2-extension-build-session-6 caught this slip: the director hit `cat: docs/NEXT_SESSION.md: No such file or directory` and asked for a redundancy; the canonical scheduled `./resume`-script-design work in memory `project_resume_script_design_scheduled.md` overlapped substantially with the requested redundancy, but Claude scoped narrowly to "small guard only" without surfacing the wider option as a Rule 14f picker. The CORRECTIONS_LOG entry captures the full slip; this rule extension is the mechanical prevention.

### Rule 22 — Graduated-Tool Re-Entry Protocol (NEW 2026-04-26)

A graduated tool's Active doc has been split into Archive + Data Contract (per §4 Step 2 Scenario B); subsequent sessions that revisit the tool follow this protocol instead of the standard new-session flow.

**Triggering condition:** the director's session-start prompt contains the phrase "graduated-tool re-entry" or references "Rule 22", AND names a specific graduated workflow tool. The canonical re-entry prompt is stored in the tool's Data Contract under §Resume Prompt and emitted to the director at the end of the tool's graduation session.

**Protocol:**

1. Run the mandatory start-of-session sequence (Group A docs).

2. Additionally load these Group B docs for the named tool:
   - `<TOOL>_DATA_CONTRACT.md` — read fully (small, canonical)
   - `<TOOL>_DESIGN.md` — read fully (initial requirements §A + in-flight refinements §B per Rule 18)
   - `<TOOL>_ARCHIVE.md` — skim the table of contents; load specific sections only if the change requires them
   - `<TOOL>_POLISH_BACKLOG.md` — if it exists

3. Per Rule 21, scan `ROADMAP.md` and `DATA_CATALOG.md` for any director directives addressed to this workflow that may have been captured since graduation; surface them in the drift check.

4. Per Rule 23, before any code change run a Change Impact Audit: identify affected fields, look up downstream consumers in `DATA_CATALOG.md`'s Cross-Tool Data Flow Map, classify the change, surface the audit before coding.

5. Produce the standard drift check with this added context. Wait for explicit go-ahead before any work.

**Canonical Resume Prompt template (filled per-tool at graduation time, stored in `<TOOL>_DATA_CONTRACT.md` §Resume Prompt):**

The director runs Step 1 in their terminal BEFORE launching Claude Code, then pastes Step 3 as the first message. This format matches the canonical "How to start a session for any workflow" procedure in `MULTI_WORKFLOW_PROTOCOL.md` §11.

**Step 1 — In a Codespaces terminal, switch to `main` and pull the latest** (graduated tools live on `main` since they're production-ready; if the tool happens to live on a different branch at the time of revisit, replace `main` accordingly):

```
cd /workspaces/brand-operations-hub && git fetch origin && git checkout main && git pull --rebase origin main
```

**Step 2 — Launch Claude Code:**

```
claude
```

**Step 3 — As your first message, paste this** (edit the bracketed reason for your specific revisit):

```
Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it.
Today's task: return to Workflow #<N> (<tool name>) — [your specific
reason / what you want to do]. This is a graduated-tool re-entry
session, NOT a transition session. Verify branch state with
`git branch --show-current` before any doc reads — if you're not on
the expected branch (typically `main` for graduated tools), STOP and
surface to director.

Per HANDOFF_PROTOCOL.md Rule 22 (Graduated-Tool Re-Entry Protocol):

1. Run the mandatory start-of-session sequence (Group A docs +
   branch verification per CLAUDE_CODE_STARTER.md Step 2).
2. Additionally load these Group B docs:
   - docs/<TOOL>_DATA_CONTRACT.md
   - docs/<TOOL>_DESIGN.md
   - docs/<TOOL>_ARCHIVE.md (skim TOC; load sections as needed)
   - docs/<TOOL>_POLISH_BACKLOG.md (if it exists)
3. Per Rule 21, scan ROADMAP.md for prior directives addressed to
   this workflow.
4. Per Rule 23, run a Change Impact Audit before any code change.
5. Produce the drift check with this added context. Wait for go-ahead.
```

**Why this protocol exists:** graduated tools' Active docs are heavy and would bloat the working set if loaded for every visit. The Data Contract is the small, stable artifact downstream tools consume — it's also the right entry point for revisit. The Archive provides full history when needed but is loaded selectively. Without this protocol, re-entry would default to either skipping context (risky — the tool's history matters) or loading everything (heavy and unnecessary).

### Rule 23 — Change Impact Audit (NEW 2026-04-26)

Before any code change to a graduated workflow tool (per Rule 22), Claude runs a Change Impact Audit and surfaces it to the director before coding.

**The audit:**

1. Identify the fields, data items, operation vocabulary, or behaviors affected by the proposed change.

2. Look up each affected item in `DATA_CATALOG.md`'s Cross-Tool Data Flow Map (§7). Identify:
   - Direct downstream consumers (workflows that read this data today)
   - Anticipated future consumers (workflows that have declared they will read this data per Rule 18 reciprocal output declarations)

3. For each downstream consumer, load that consumer's Data Contract (short, fast). Verify whether the change breaks their assumptions.

4. Classify the change:
   - **Additive (safe):** new optional field, new operation, new metadata. Downstream tools unaffected unless they choose to read the new thing. Default classification when only adding.
   - **Compatible-modifying (caution):** semantic change to existing data, BUT downstream tools' behavior is unchanged because they treat the affected field generically. Verify by reading the consumer's code path that uses the field.
   - **Breaking (hard):** rename, removal, type change, semantic redefinition that consumers must adapt to. Each downstream consumer must be updated in lockstep, OR the change must be staged via versioned Data Contracts (see below).

5. Surface the audit to the director BEFORE coding, in the format:

   ```
   CHANGE IMPACT AUDIT
   - Proposed change: <plain description>
   - Affected fields/items: <list>
   - Direct downstream consumers: <list with R/W flags from the Map>
   - Future declared consumers: <list>
   - Classification: <Additive | Compatible-modifying | Breaking>
   - For each affected consumer: <does this break them? what would need to change?>
   - Recommendation: <proceed / proceed with versioned contract / stop and rescope>
   ```

6. Wait for explicit director approval before coding.

**Versioned Data Contracts (for Breaking changes):**

When a change is classified Breaking, the recommended pattern is to bump the Data Contract version (e.g., `KEYWORD_CLUSTERING_DATA_CONTRACT_v1.md` → `KEYWORD_CLUSTERING_DATA_CONTRACT_v2.md`) rather than updating in place. Downstream tools choose when to migrate — `v1` continues to be served alongside `v2` until all consumers have moved over. This pattern scales as the platform grows; without it, a single breaking change in W#1 could require simultaneous coordinated updates across W#2, W#3, etc.

When all consumers have migrated, `v1` can be archived.

**Why this rule exists:** as the platform grows from 1 tool to 14, a change to W#1 might transitively affect 13 downstream tools. Without the audit, a developer (Claude or director) might ship a change that silently breaks downstream consumers — discovered weeks later when a downstream tool exhibits mysterious failures. The audit surfaces the cascade before code is written.

### Rule 24 — Pre-capture search before adding any ROADMAP item or proposing new architectural concern (NEW 2026-04-27)

Whenever Claude proposes capturing a new ROADMAP item — polish, architectural concern, infrastructure TODO, or any other entry — Claude MUST first perform a structured search for prior treatment of the same concern, BEFORE reading back the proposed entry to the director. This rule applies even when Claude believes confidently that the concern is novel; the cost of the search is small (one or two greps + a section-read), and the cost of operating on partial information has been demonstrated to produce ROADMAP entries that misrepresent system history and risk future re-implementation of already-evaluated-and-deleted mechanisms.

**The search must cover (in order):**

1. **Direct keyword grep** of `ROADMAP.md`, the relevant tool's `<TOOL>_DESIGN.md` and `<TOOL>_ACTIVE.md` (or DATA_CONTRACT + ARCHIVE if graduated), `PLATFORM_ARCHITECTURE.md`, `CORRECTIONS_LOG.md`, and any architectural-pivot or design doc relevant to the concern (e.g., `PIVOT_DESIGN.md` for Auto-Analyze concerns) — using the concern's name AND obvious synonyms. Examples of synonym pairs: "context wall" / "200k limit" / "input scaling" / "TSV grows"; "ghost keyword" / "missing keyword" / "silent drop" / "Reshuffled"; "stability score" / "JUSTIFY_RESTRUCTURE" / "well-validated topic."

2. **Read-through of the canonical doc's "Known limitations" / "Open questions / deferred items" / "Infrastructure TODOs" sections** — these often contain prior captures using different wording than the grep would find.

3. **CORRECTIONS_LOG entries from the last 5-10 sessions** — for related architectural insights, prior decisions the proposed item may supersede, or earlier discussions of the same concern that didn't make it onto ROADMAP.

4. **Verify against actual code** when the concern relates to a specific behavior, capability, or limitation — the docs may describe intent that doesn't match the implementation, or an implementation may exist that the docs don't credit. Use `Read` against the relevant source files (e.g., `src/lib/auto-analyze-v3.ts`, `src/lib/operation-applier.ts`, `src/app/.../AutoAnalyze.tsx`) and not just the doc claims.

**Surfacing the search to the director:**

If prior treatment IS found, Claude must surface it explicitly to the director BEFORE reading back the proposed ROADMAP entry: *"I found this was already discussed in [doc] [section] on [date]. The prior treatment was: [summary]. Compared to my current proposal: [what's different / what's the same]."* Director then decides whether to (a) update the existing item with new framing, (b) create a new related item with cross-reference back to the prior treatment, or (c) consolidate the prior treatment into the new item.

If prior treatment is NOT found, Claude must surface the search performed: *"I checked [list of locations: doc names + sections searched] and found no prior treatment. Proceeding with new capture."*

**Specific failure mode this rule prevents:** Claude has the relevant docs in context (because they were read at session start per the mandatory start-of-session sequence), and could in principle synthesize prior treatment from working memory. But synthesis from working memory has been shown to fail under cognitive load — Claude jumps from "I remember V3 fixed the cost issues" to "therefore input scaling wasn't considered" without going back to verify against what the docs actually said. The structured search forces a deliberate re-read at the moment of writing the new ROADMAP item, which is when the verification matters.

**Relationship to existing rules:** This rule is operationally adjacent to Rule 1 (Verify Before You Write), Rule 3 (Code is the ultimate source of truth), and Rule 14a (Read-It-Back test). Those rules establish the principle of verify-before-act. Rule 24 is the operational scaffolding that makes verify-before-act actually fire at the specific moment of proposing a ROADMAP capture — a moment where the failure mode of "operating on partial information" has been demonstrated to produce duplicate or contradictory entries that future sessions will inherit and act on.

**Relationship to Rule 18's mid-build Read-It-Back (2026-04-26 expansion):** Rule 18 addressed Claude not echoing back the director's directives before coding. Rule 24 addresses Claude not echoing back the system's own prior decisions before adding to the system's forward plan. Together they bracket the input side (director's intent) and the historical side (prior decisions) of the verify-before-write principle.

**Why this rule exists:** Logged in `CORRECTIONS_LOG.md` 2026-04-27 entry. Claude proposed a ROADMAP item for the input-side context-scaling concern, framing it as "the system was not explicitly designed to handle it" — when in fact `PIVOT_DESIGN.md` lines 205 + 246 explicitly acknowledged the trade-off, and `ROADMAP.md` line 162 documented that V2's Mode A→B (deleted in Pivot E) had been credited with "avoiding the projected 200k context wall." Claude had read both pieces of content earlier in the same session but failed to synthesize them when writing the new ROADMAP entry. Director caught the mistake, requested the instruction-set update, and approved Rule 24.

### Rule 25 — Multi-workflow coordination (NEW 2026-04-29; REFRAMED 2026-05-04)

When PLOS has more than one workflow under active development at the same time (i.e., multiple feature branches in flight), sessions across those workflows must coordinate to avoid overwriting each other's work — even when the sessions run sequentially rather than in parallel. The full methodology lives in `MULTI_WORKFLOW_PROTOCOL.md` (Group A doc); this rule is its operational summary.

**Reframed 2026-05-04.** The original framing assumed PARALLEL Claude Code chats (one for W#1, one for W#2 simultaneously). The director's actual operational reality is SEQUENTIAL — single Codespace, one workflow at a time. Branch state persists across sessions because it's the same Codespace. The state-coordination scaffolding (active-tools table, schema-change-in-flight flag, doc-section ownership, branch discipline, branch-check-at-session-start) is still useful for tracking state across sequential sessions over long stretches of time. See `project_sequential_workflow_operation.md` and `MULTI_WORKFLOW_PROTOCOL.md` §1 (reframed 2026-05-04) + §11 (NEW 2026-05-04 — canonical "How to start a session for any workflow").

**At session start (in addition to the standard mandatory start-of-session sequence):**

1. **Read `MULTI_WORKFLOW_PROTOCOL.md`** if today's task references any workflow with N ≥ 2, OR if the "Current Active Tools" table at the top of `ROADMAP.md` shows more than one workflow with status 🔄 / 🛠 / 🆕.
2. **Read the "Current Active Tools" table** in `ROADMAP.md`. Note: which workflows are in flight; which branches they're on; whether any has a schema-change-in-flight flag set to "Yes."
3. **`git pull --rebase origin <branch>`** before the drift check (catches anything the parallel chat just pushed). On the W#1 branch (`main`); on the appropriate feature branch for W#k for k ≥ 2.
4. **If today's session intends to modify schema (`prisma/schema.prisma` or run migrations / db push):** confirm in the drift check that no other workflow has the schema-change-in-flight flag set. If any other workflow does, defer schema work to a later session (capture as a deferred item per Rule 14e).
5. **Surface any cross-workflow doc edits** — if today's session needs to edit a section another workflow owns (per `MULTI_WORKFLOW_PROTOCOL` §3 ownership table), state that intent explicitly in the drift check before doing it.

**Branch discipline:**
- W#1 (Keyword Clustering) lives on `main`.
- W#k for k ≥ 2 lives on `workflow-N-<short-slug>` until per-milestone merge to `main`.
- Each workflow's first session creates its branch as the first git action.

**End-of-session additions (in addition to the standard `§4 Step 1` checklist):**
- Update the "Current Active Tools" row for this workflow in `ROADMAP.md` (status, last session, next session, schema-change flag if applicable).
- `git pull --rebase origin <branch>` AGAIN right before commit (catches anything the parallel chat pushed during this session).
- If a cross-workflow edit happened (rare; surfaced + approved at start), document it in the `CHAT_REGISTRY` row + flag for the other workflow's next session.

**When this rule retires:** if PLOS ever returns to single-workflow-at-a-time mode, this rule + `MULTI_WORKFLOW_PROTOCOL.md` get retired together. Until then, every session in a multi-workflow setup follows this rule.

**Why this rule exists:** drafted 2026-04-29 in `session_2026-04-28_canvas-blanking-and-closure-staleness-fix` after W#1's stabilization grew to ~9-13 more sessions and the director chose to start W#2 in parallel rather than wait. The shared-doc + shared-schema + shared-Codespace risks needed a structured coordination protocol; without it, the two parallel chats would race on `ROADMAP.md` / `prisma/schema.prisma` / the dev server. See `MULTI_WORKFLOW_PROTOCOL.md` §1.

### Rule 26 — Real-time deferred-items registry via TaskCreate (NEW 2026-05-04-d) — formal Rule 14e-extension

Whenever Claude defers an item per Rule 14e (sets it aside as "not now," "out of scope," "future work," "we'll deal with that later"), in addition to stating the destination doc + section in the same sentence per Rule 14e, Claude **MUST** register the item using the `TaskCreate` tool with a `DEFERRED:` prefix in the subject. The end-of-session sweep then reviews the `TaskList` — **not memory** — as the canonical source of deferred items. Each `DEFERRED:` task is closed via `TaskUpdate → completed` only after the corresponding doc entry is actually written. Any `DEFERRED:` task still open at end-of-session is an automatic `CORRECTIONS_LOG.md` entry as a process failure (root cause + fix).

**Mechanical sequence at every defer moment:**

1. Claude flags the item and states the destination doc + section in the SAME sentence (Rule 14e).
2. Claude immediately calls `TaskCreate` with:
   - `subject`: `DEFERRED: <one-line description>` — the `DEFERRED:` prefix is mandatory and grep-able.
   - `description`: longer-form context — what the item is, why deferred now, destination doc + section, any preconditions for revisiting, cross-references.
3. Work continues.

**Mechanical sequence at end-of-session sweep:**

1. Claude calls `TaskList` to get the canonical list of deferred items.
2. For each `DEFERRED:` task: confirm the corresponding doc entry has been written this session. If yes, `TaskUpdate → completed`. If no, write the entry now, then complete.
3. After the sweep, `TaskList` shows zero open `DEFERRED:` tasks. If any remain open, they become a `CORRECTIONS_LOG` entry — Claude got something captured in the registry but failed to migrate it to a permanent doc.

**Why this rule exists:** `session_2026-05-04-d_pool-tune-small-batch-test-insufficient` surfaced a Rule 14e slip (Claude said "I'll capture in the deferred sweep" without naming the destination — Rule 14e requires destination in the same sentence). Director's reaction: *"Please make sure the missing auto-fire toggle issue is noted but also make sure our working methodology always avoids such things from falling through the cracks. We have a lot of sessions and our overall roadmap is long. Even small things being dropped like this can prove catastrophic. There should be a method to ensure nothing necessary gets ignored."*

The existing Rule 14e end-of-session sweep relied on Claude's memory of what was deferred during the session — a brittle dependency, especially across long sessions or when many small items accumulate. Rule 26 makes the registry **externally observable** (director can run `TaskList` any time), **persistent** (registered items don't depend on Claude's memory), **forced into existence** (the act of TaskCreate IS the capture; skipping it is a visible omission), and **closed only after migration** (the task can't be marked `completed` until the doc entry is written; end-of-session leftover is a hard signal of failure).

**Cost is ~10 seconds per defer.** Trivial vs. the catastrophic-drift cost of a missed item that future sessions inherit and act on (or fail to act on) months later.

**Operational scope:** Rule 26 applies whenever Rule 14e applies — any time Claude flags-and-defers during a session. The two rules compose: Rule 14e governs the destination-naming discipline; Rule 26 governs the persistence-and-tracking mechanism.

**Relationship to TaskCreate's general use:** TaskCreate is also valuable for tracking in-flight work within a session (e.g., "Run small-batch test on vklf.com" was Task #4 this session, completed when the test finished). Rule 26 is about a specific subset — deferred items going to permanent docs — and is enforced via the `DEFERRED:` prefix. Other TaskCreate uses are encouraged but not Rule-26-mandated.

**Cross-references:** `CLAUDE_CODE_STARTER.md` Session Management section (Rule 26 cross-reference); operational memory file `feedback_deferred_items_registry.md` (Claude-side standing operational behavior). `CORRECTIONS_LOG.md` 2026-05-04-d entry on the Rule 14e slip that triggered codification of Rule 26.

### Rule 27 — Playwright forced-picker before manual browser walkthroughs (NEW 2026-05-14)

When a session is about to propose a director manual browser walkthrough with 5+ steps, OR is about to verify code (new feature or bug fix) that lives in a real-browser context, Claude MUST first run a Rule 14f forced-picker that compares:

- **Option A — Playwright automated test** (recommended for repeatable regression checks; tests against a real Chromium browser; catches the same class of bug if it ever regresses; one-time test-authoring cost; per-run cost ~5-10 seconds; the test is committed to the repo and runs forever)
- **Option B — Director manual walkthrough** (recommended for one-time exploratory verification or first-time-ever flows that involve visual judgment, copy-correctness, or cross-physical-device concerns; director's time per pass; no test-authoring cost; no regression coverage)
- **Option C — Hybrid** (Playwright for mechanical parts — clicks, URL transitions, response codes, console errors, network requests; director for judgment parts — copy, visual correctness, screenshots, "does this feel right?")
- **Option D — I have a question first that I need clarified** (escape hatch per Rule 14f)

The `(recommended)` marker (per Rule 14f) goes on whichever option BEST catches the same bug class again later if it regresses, AND fits the verification's repeatability profile. Default heuristic: if the walkthrough will be repeated more than once (e.g., across regression cycles, deploy verifications, or as part of a recurring test pass), recommend Option A or C. If the walkthrough is genuinely one-off (e.g., novel UI exploration, judgment calls on aesthetics), recommend Option B.

**Mechanical test before proposing a manual walkthrough:**
1. Count the steps in the walkthrough Claude is about to propose. If 5+, the rule fires.
2. Identify the bug class or feature class being verified. If it lives in browser context (DOM/fetch/navigation/cookies/window APIs/redirects/forms), the rule fires regardless of step count.
3. Either trigger fires → run the forced-picker BEFORE proposing the walkthrough.
4. If neither fires → manual walkthrough is the natural choice; no forced-picker needed.

**Scope exception — when manual walkthrough is the natural choice even after the trigger fires:**
- One-time exploratory verification of a never-shipped-before flow ("does this flow even make sense?")
- Cross-physical-device tests where the device-ness is the point (e.g., laptop 1's `chrome.storage.local` vs. laptop 2's — Playwright can simulate two browser contexts but the SPECIFIC concern is real cross-device persistence)
- Chrome extension popup flows where extension-context testing is too complex relative to verification's repeat-frequency (Playwright extension testing is real but more setup-heavy than for regular web pages; revisit when extension flows stabilize)
- Visual-judgment checks ("does this look right?", "is this copy correct?", "does this feel like the right UX?") — director's eye is the test
- Verification of a fix that's been shipped + verified once and is unlikely to be re-verified (one-off post-deploy smoke check)

If Claude is uncertain whether a walkthrough fits the scope exception, Claude runs the forced-picker anyway and lets the director call it. False-positive pickers are cheap (~30 seconds of director's time); false-negative skips lose the time-savings opportunity entirely.

**Concrete examples — past walkthroughs Rule 27 would have flipped to Playwright:**
- `/plos` redirect test (2026-05-13 (a.12) — would have been a 3-line Playwright test asserting `/plos` → `/projects`)
- P1V-2 silent token refresh verification (2026-05-12 — 5-second automated test instead of a >1-hour passive wait for token expiry)
- `/projects` "← Back" button check (2026-05-13 — a Playwright click + URL assertion would have caught the no-op self-loop in seconds, before the slip was flagged via Rule 10)

**Concrete examples — past walkthroughs Rule 27 leaves as manual (scope exceptions):**
- P3B-1..P3B-11 cross-device sign-in proof (2026-05-12 — device-ness is the point)
- S4-A 12-step popup paste flow (2026-05-12 — extension popup context; relative cost too high until extension testing stabilizes)
- Director's "does the new `/plos` shape feel right?" judgment (2026-05-13 — visual)

**Why this rule exists:** Director asked 2026-05-14, after P-17's Playwright ship — *"Is this used to test the code you just wrote and if so, why didn't we use this until now and if this method of testing can save me time and effort, how can I ensure we consistently use such methods moving forward?"* — and chose to codify the "consider Playwright first" reflex into a mechanical rule rather than rely on Claude remembering. Honest answer at the time was that Playwright IS a director-time saver for repeatable browser-context verifications, but the historical pattern was for Claude to default to "let me give you an N-step walkthrough" without surfacing the automated-test alternative. Rule 27 forces the alternative to surface every time the trigger conditions fire.

**Relationship to Rule 14f:** Rule 14f governs HOW multi-option questions are shaped (per-option context + recommended marker + escape hatch + free-text invitation). Rule 27 names WHEN this specific picker fires (manual walkthrough proposal moment) and what its OPTIONS are. The two compose: Rule 14f is the picker-machinery; Rule 27 is the trigger + content for one specific picker kind.

**Cross-references:** Rule 14f (the forced-picker mechanism Rule 27 uses); operational memory `feedback_playwright_for_repeatable_walkthroughs.md` (Claude-side standing operational behavior); `tests/playwright/authFetch-regression.spec.ts` (the first session-shipped Playwright suite + reference shape for future Playwright tests in the repo); `README.md` §"Running the Playwright regression tests" (how to run + the system-libs install workaround); ROADMAP P-18 (the devcontainer postCreateCommand follow-up that makes the test-runner setup zero-touch on fresh Codespaces).

### Rule 28 — Resume-flow multi-layered defense (NEW 2026-05-14)

The `./resume` one-command session-handoff design (introduced 2026-05-13-c) is enforced and survived by FOUR composed layers of defense, codified here so future sessions don't accidentally regress the design. The 2026-05-14 director-flagged bug (`exec claude "$SENTINEL"` doesn't auto-submit in interactive mode → director had to manually paste the launch prompt despite running `./resume`) revealed that a single-mechanism design is structurally fragile; multi-layered defense is the correct shape.

**The four layers (in order of activation, with redundancy guaranteed):**

| # | Layer | Mechanism | When it fires | What it catches |
|---|---|---|---|---|
| 1 | **Primary, mechanical** | `SessionStart` hook at `.claude/hooks/inject-next-session-pointer.sh` (wired in `.claude/settings.json`); reads `docs/NEXT_SESSION.md` and emits its contents as JSON `additionalContext` so Claude has the pointer-file content as a system reminder BEFORE the user's first prompt | Every Claude Code session start with `matcher: startup` (i.e., not `--resume` or `--continue`) where the workflow branch has the hook + settings file | Director sends ANY first message (even just "go" + Enter) → Claude already has the pointer-file content as context → reads it and follows the launch prompt verbatim. Director-zero-effort beyond a single wake-up keystroke. |
| 2 | **Procedural fallback** | `CLAUDE_CODE_STARTER.md` sentinel-string match rule — if the user's first message contains "Resume per docs/NEXT_SESSION.md", Claude reads the pointer and follows it | When Layer 1 didn't fire (e.g., `claude --bare` skips hooks; branch doesn't yet have the hook because the fix is mid-distribution; hook script erroneously emitted empty additionalContext) AND director happened to paste the sentinel manually | Director still has a path to one-command resume even when the hook layer is unavailable. Claude-side discipline (the rule), not harness-side enforcement. |
| 3 | **Manual escape hatch** | Documented 3-step path in every end-of-session handoff: `cd /workspaces/brand-operations-hub && git fetch origin && git checkout <branch> && git pull --rebase origin <branch>` + `claude` + paste full launch prompt | When `./resume` itself errors out OR when director prefers the manual path for any reason | Director always has a working session-start path. Multi-step but fully self-contained — doesn't depend on hooks, doesn't depend on Claude recognizing a sentinel; the pasted launch prompt IS the first user message and works in interactive mode. |
| 4 | **Procedural enforcement** | `NEXT_SESSION.md` guard hook at `.claude/hooks/check-next-session-doc.sh` (wired as a PreToolUse hook on Bash in `.claude/settings.json`); blocks any `git commit` whose message contains "End-of-session" unless `docs/NEXT_SESSION.md` is staged in that commit | Every end-of-session commit attempt | Layer 1's hook is useless if `docs/NEXT_SESSION.md` is stale or missing; Layer 4 enforces that every session refreshes the pointer file before closing. The four layers together guarantee that EITHER the pointer file is fresh AND the hook will fire AND the resume flow works, OR (if any layer fails) at least one fallback path is available. |

**Test discipline:** every time a new session ships changes to `.claude/hooks/inject-next-session-pointer.sh`, `.claude/settings.json` SessionStart entry, `./resume`, or `docs/CLAUDE_CODE_STARTER.md` sentinel section, the session-AFTER-ship is responsible for **verifying the full flow end-to-end** by running `./resume` + observing whether the SessionStart hook fired (look for the "🟢 RESUME-FLOW POINTER" marker in the session's first system reminder) + sending only a single-word wake-up message + confirming Claude reads the pointer + executes the launch prompt without manual paste. If the test fails, the next session must capture the failure to CORRECTIONS_LOG and propose a fix BEFORE doing the planned work.

**Why this rule exists:** Director's verbatim 2026-05-14 framing after hitting the original `./resume` bug: *"Why didn't the 'cd /workspaces/brand-operations-hub && ./resume' work alone and despite many redundancies in place, it looks like the methodology you applied still led to issues for starting the session off correctly with all the correct instructions given to claude at the correct time. How can you not only fix this issue but also make sure it doesn't happen again."* The director's framing has two parts: (a) fix the immediate bug (Layer 1's SessionStart hook does this); (b) make sure it doesn't happen again (Layer 2/3/4 redundancy + the test discipline above do this).

**The "type ONE thing to wake Claude up" constraint:** Claude Code's interactive-mode CLI requires SOME user input to begin a session's first response. There is no way (as of 2026-05-14) to launch `claude` in interactive mode with an auto-submitted first message — the positional `[prompt]` only auto-submits in non-interactive print mode (`-p`). This is a hard constraint of the CLI, not a script bug. After Rule 28 ships, the realistic flow is: director runs `./resume` → terminal prints pointer + launch instructions → claude launches with hook-injected pointer context → director types literally one word ("go" / "proceed" / "yes") + Enter → Claude responds by following the launch prompt verbatim. The "one-command" UX promise is honest: ONE shell command + ONE keystroke. Never ZERO keystrokes.

**Cross-references:**
- `docs/CLAUDE_CODE_STARTER.md` "Resume-flow handling" section (Layer 1 + Layer 2 user-facing description)
- `.claude/hooks/inject-next-session-pointer.sh` (Layer 1 implementation)
- `.claude/hooks/check-next-session-doc.sh` (Layer 4 implementation)
- `.claude/settings.json` (hook wiring)
- `./resume` (the entry-point shell script; Layer 1 + Layer 3 hand-off point)
- `CORRECTIONS_LOG.md` 2026-05-14 "Resume-flow design flaw" entry (the slip that triggered Rule 28)
- §4 Step 1 row 12 of this doc (the ALWAYS-update rule that enforces a fresh pointer at end-of-session)
- §4 Step 1c "No obvious next task" interview (how end-of-session pointer-writing is shaped when there's no obvious continuation)

---

## 4. END-OF-CHAT PROTOCOL

### Step 1 — Run the Document Update Checklist (MANDATORY)

Claude must explicitly answer each of these questions before producing handoff files. The answers determine which docs get updated.

| # | Question | If YES, update |
|---|---|---|
| 1 | Did we create/change any routes or pages? | `NAVIGATION_MAP.md` + `PLATFORM_ARCHITECTURE.md` |
| 2 | Did we create/change any database tables, fields, or indexes? | `PLATFORM_ARCHITECTURE.md` + `DATA_CATALOG.md` |
| 3 | Did we capture any new data item anywhere in the platform? | `DATA_CATALOG.md` |
| 4 | Did we share any data between workflows (add to Shared Data Registry)? | `DATA_CATALOG.md` |
| 5 | Did any mistake occur during this chat (ours or user-caught)? | `CORRECTIONS_LOG.md` |
| 6 | Did we complete any roadmap item or identify a new one? | `ROADMAP.md` |
| 7 | Did we work on a specific tool? | That tool's `<TOOL>_ACTIVE.md` |
| 8 | Did a tool graduate (reach stable completion)? | Execute Tool Graduation Ritual (see Step 2) |
| 9 | Did we start a new tool? | Create `<NEW_TOOL>_ACTIVE.md` |
| 10 | Did we add or remove any docs to the system? | `DOCUMENT_MANIFEST.md` |
| 11 | **ALWAYS** — Update these regardless | `CHAT_REGISTRY.md`, `NEW_CHAT_PROMPT.md`, `DOCUMENT_MANIFEST.md` (timestamps) |
| 12 | **ALWAYS** — Write the pointer file so the next session can run `./resume`. Pick the next session's branch + launch prompt + pre-session notes. If today's session has a clear RECOMMENDED-NEXT item, write that verbatim. If today's session wrapped a phase / tool graduation / methodology design with no obvious continuation, run the "no obvious next task" interview in Step 1c BEFORE writing — never silently guess. **Enforced by `.claude/hooks/check-next-session-doc.sh` PreToolUse hook on Bash** (NEW 2026-05-13 via W#2 Extension build session 6), which blocks any commit whose message contains "End-of-session" unless `docs/NEXT_SESSION.md` is staged in that commit — harness-enforced, not Claude-memory-dependent. Any session that closes without this file updated is an automatic `CORRECTIONS_LOG.md` entry by the next session at start. | `docs/NEXT_SESSION.md` |

Claude should state out loud: "Running end-of-chat doc update checklist..." and answer each question honestly, then proceed to updates.

### Step 1b — Deferred-items sweep (per Rule 14e)

Before producing handoff files, Claude runs a sweep of everything flagged-and-deferred during the chat. For each item, state:
- What the item is
- Where it's being captured (which doc + section)

No deferred item is allowed to leave a chat uncaptured.

### Step 1c — "No obvious next task" interview (NEW 2026-05-13-c — supports §4 Step 1 row 12)

Row 12 of the §4 Step 1 checklist requires every session to update `docs/NEXT_SESSION.md` so the next session can run `./resume` instead of the 3-step path. Most sessions have a clear "RECOMMENDED-NEXT" item (the `(a.NN)` pattern in recent ROADMAP rows) that gets copied verbatim into the pointer file.

But some sessions wrap cleanly with no obvious continuation:
- A tool just graduated (HANDOFF_PROTOCOL §4 Step 2 Scenario B).
- A phase or milestone closed.
- A methodology / design session completed (like `session_2026-05-13-c_resume-script-design`).
- The director shifts focus to a different workflow at end-of-session.

For those sessions, Claude **MUST** ask the director via a Rule 14f forced-picker before writing `docs/NEXT_SESSION.md` — never silently guess.

**Mechanical trigger:** if today's session does NOT have a written `(a.NN) RECOMMENDED-NEXT` item (or equivalent next-task pointer somewhere in this session's doc batch), the interview fires.

**Forced-picker shape (Rule 14f-compliant):**

> *"Today's session wrapped <what just shipped>; there's no obvious continuation item from this session itself. Which workflow should the next session work on? Each option below maps to a branch + a launch-prompt template per `MULTI_WORKFLOW_PROTOCOL.md` §11.*
>
> *(A) Continue platform-wide work on `main` — name a specific task (e.g., further infrastructure, components-library work, a roadmap item flagged earlier). I'll write the launch prompt verbatim into `docs/NEXT_SESSION.md`. — Branch: `main`.*
>
> *(B) Return to a graduated tool per Rule 22 (e.g., W#1 Keyword Clustering). I'll pull the canonical Resume Prompt from that tool's Data Contract (`<TOOL>_DATA_CONTRACT.md` §Resume Prompt) and copy it verbatim into `docs/NEXT_SESSION.md`. — Branch: typically `main`; check the Data Contract.*
>
> *(C) Continue an in-flight workflow on its feature branch (e.g., W#2 on `workflow-2-competition-scraping`, or future W#k for k ≥ 2 on `workflow-N-<slug>`). Tell me which workflow + the specific next task. I'll write the launch prompt verbatim into `docs/NEXT_SESSION.md`. — Branch: the workflow's feature branch.*
>
> *(D) Start a never-before-started workflow (W#3 through W#14). Tell me which one + the rough goal. I'll write a Workflow-Requirements-Interview launch prompt per Rule 18. — Branch: created on first session from `main` per MULTI_WORKFLOW_PROTOCOL.md §7.*
>
> *(E) I have a question first that I need clarified."*

Director's answer fills in the Branch + Launch prompt + Pre-session notes fields of the pointer file. The standard end-of-session doc batch + Rule 9 deploy gate then proceeds normally.

**Why this rule exists:** the director's framing 2026-05-13-c was *"The only exception is when there is nothing more left to do in a session, in that case the session should ask enough questions about the next workflow that needs to be worked on so that the docs/NEXT_SESSION.md file can be updated appropriately."* Without Step 1c, sessions that wrap cleanly would either (a) leave the pointer file stale — triggering the automatic `CORRECTIONS_LOG.md` entry — or (b) tempt Claude to silently guess what the director wants next, which Rule 14a + Rule 14d would already prohibit but Step 1c makes the asking-discipline mechanical at this specific session-boundary moment.

### Step 2 — Determine scenario and execute

**Scenario A — Work on current tool is ONGOING:**
Update docs identified in the checklist. Tailor `NEW_CHAT_PROMPT.md` with resume instructions for next chat.

**Scenario B — Current tool is COMPLETE, new tool starting next chat:**

Execute the full Tool Graduation Ritual. The deliverables stack (UPDATED 2026-04-26 to incorporate the Workflow Requirements Interview, Cross-Tool Data Flow Map, and Resume Prompt artifacts):

**Outgoing tool's graduation deliverables:**

1. Split current `<W_OUT>_ACTIVE.md` into `<W_OUT>_ARCHIVE.md` (full history; loaded only if revisiting) + `<W_OUT>_DATA_CONTRACT.md` (small, stable; <200 lines target; what downstream consumers need).

2. Add §Resume Prompt section to the Data Contract, filled in with the canonical re-entry prompt template (per Rule 22). Emit the filled prompt to the director explicitly at end of session so they can copy it directly when they next want to return to the tool.

3. Conduct Data Capture Interview with director (Doc Architecture §5) to finalize Human Reference Language for every data item the tool captured.

4. Update `DATA_CATALOG.md` — entries for outgoing tool's data items move from "PROVISIONAL" to finalized HRL + Data Contract pointer.

5. Update Cross-Tool Data Flow Map in `DATA_CATALOG.md` §7 — outgoing tool's row gets filled in with data items, R/W flags, and downstream consumers identified or "TBD."

6. Move outgoing tool's outstanding polish items into `<W_OUT>_POLISH_BACKLOG.md` (a thin sidecar — so the polish list doesn't lock the tool in active state). The Active doc is no longer needed and can be deleted (full history preserved in Archive).

7. Update `ROADMAP.md` — outgoing tool moves to ✅ COMPLETE; the polish backlog sidecar is referenced.

8. Update `DOCUMENT_MANIFEST.md` — Active doc archived; Data Contract added to Group B inventory; Resume Prompt location documented.

**Incoming tool's setup deliverables (Workflow Requirements Interview deliverables — Rule 18):**

9. Conduct Workflow Requirements Interview for incoming tool, producing `<W_IN>_DESIGN.md` with §A (initial answers — frozen) + §B (empty, append-only mid-build) per Rule 18.

10. Per Rule 21, surface any prior director directives addressed to the incoming workflow as the first item of the interview.

11. Per Rule 19, run the Platform-Truths Audit at the end of the interview — update `PLATFORM_REQUIREMENTS.md` if anything platform-level surfaced.

12. Update Cross-Tool Data Flow Map in `DATA_CATALOG.md` §7 — incoming tool's column gets prepopulated with what it'll READ from upstream tools (per the interview's Q4 upstream-data answers); incoming tool's row gets prepopulated with what it'll PRODUCE for downstream tools (per the Q5 reciprocal output declarations).

13. Update `DATA_CATALOG.md` §6.x — provisional entries for the incoming tool's expected data outputs (so future workflows have something to plan against, even before the incoming tool ships).

14. Create `<W_IN>_ACTIVE.md` (or — under the post-Phase-1α scaffold model — confirm scaffold fit per Rule 20 and create the workflow-specific extensions).

15. Update `ROADMAP.md` — incoming tool moves to 🔄 IN PROGRESS.

16. Update `DOCUMENT_MANIFEST.md` with the new DESIGN + Active docs.

A transition session is heavy. Two sessions may be warranted if the incoming tool's interview is long. Steps 1-8 (graduation) and Steps 9-16 (incoming setup) can split across two sessions if needed — graduate the outgoing tool first; conduct the incoming interview second.

### Step 3 — URL confirmation
Ask the user: **"Final step — confirm the URL I'm logging matches your current browser address bar. If you've opened this chat in a new window or the URL changed, paste the current one now. I'll write the final CHAT_REGISTRY.md entry with this URL."**

### Step 4 — Produce the Personalized Handoff Message (MANDATORY)

This is a tailored message for the user. It MUST include these sections, filled in with the specifics from THIS chat:

```
## YOUR PERSONALIZED HANDOFF

### What we accomplished this chat
[1-3 sentences]

### Files I updated (download these)
[List with brief description of what changed in each]

### Files I created new (download these)
[List if any]

### What to do with these files
1. Download all the files above
2. Upload them to your repo at [specific path or "wherever you keep the handoff docs"]
3. Verify the files are saved

### For your NEXT chat — exact instructions
1. Start a new Claude chat at claude.ai
2. Upload these SPECIFIC documents at the start:
   [Tailored list: always include all 11 Group A docs, plus specific Group B docs based on what the next task needs]
3. In the message box, paste the contents of NEW_CHAT_PROMPT.md
4. Send. Claude will then:
   - Read all docs
   - Run the Pre-Flight Drift Check
   - Ask you for the new chat's URL
   - Confirm the first task (which is: [SPECIFIC NEXT TASK])

### Open questions/decisions carried over
[Any unresolved questions from this chat]

### Safety checklist for next chat
[Any specific warnings]
```

This message is non-negotiable.

### Step 4b — Claude Code variant of the handoff (use this, not the claude.ai template above, when session happens in Claude Code)

The template above was authored for claude.ai's upload/download workflow. In Claude Code, there are no uploads or downloads — Claude edits files directly and commits to git. The handoff must reflect that, and must include explicit session-boundary instructions for a non-programmer user.

**Mandatory Claude Code handoff template:**

```
## YOUR PERSONALIZED HANDOFF

### What we did this session
[2–4 sentences, plain language, no jargon]

### Files changed this session
[List with a one-line description of what changed in each, plus the commit hash(es)]

### Push status
[Either: "Committed locally as <hash> — NOT pushed yet, your call when ready."
 Or:     "Committed as <hash> AND pushed to origin/main — live site will redeploy automatically. Watch vklf.com for build completion."]

### Deferred items captured
[Every flagged-and-set-aside item from this session, with the specific doc + section where it's now captured. Per Rule 14e, no item leaves a session uncaptured.]

### 🚪 END-OF-SESSION INSTRUCTIONS — what you do NOW to close this session

Step-by-step, concrete. Example:

1. Claude Code is still running in your terminal. Type `exit` and press Enter to leave.
2. (Optional) Close the terminal tab — or leave it open for later; either works.
3. (Optional) If you paused vklf.com runs, nothing to do — they stopped when you cancelled.

### 🚪 NEXT-SESSION INSTRUCTIONS — what you do when you come back

Step-by-step, concrete. **You have two paths.** The EASY PATH is `./resume` (one command, reads `docs/NEXT_SESSION.md` for the right branch + launch prompt, switches branches + pulls + launches Claude with the right first-message). The ESCAPE HATCH is the original 3-step path — always documented in this handoff, always works if `./resume` ever doesn't behave. The full "how to start a session for any workflow" procedure lives in `docs/MULTI_WORKFLOW_PROTOCOL.md` §11.

**EASY PATH (recommended — added 2026-05-13-c):**

1. Open a new Codespaces terminal — OR reopen the one you left running.

2. Type this exact command and press Enter:
   ```
   cd /workspaces/brand-operations-hub && ./resume
   ```

That's it. The script reads `docs/NEXT_SESSION.md`, switches to the right branch, pulls the latest, prints the pointer file's contents so you see what's about to happen, then launches Claude Code with the sentinel first-message ("Resume per docs/NEXT_SESSION.md") that tells Claude to read the pointer file and follow the launch prompt inside it. Claude then runs the standard start-of-session sequence (branch verification, Group A doc reads, drift check) before waiting for your go-ahead.

**ESCAPE HATCH (3-step path — use this if `./resume` ever fails or you'd rather drive it manually):**

1. Open a new Codespaces terminal — OR reopen the one you left running.

2. Type this exact command and press Enter (this switches to the right branch and pulls the latest — substitute `<branch>` with the branch the next session needs per the MULTI_WORKFLOW_PROTOCOL §11 table; for W#1 or platform work it's `main`; for W#2 it's `workflow-2-competition-scraping`; etc.):
   ```
   cd /workspaces/brand-operations-hub && git fetch origin && git checkout <branch> && git pull --rebase origin <branch>
   ```

3. Then launch Claude Code:
   ```
   claude
   ```

4. Claude Code will start. As your very first message, paste this exactly (edit only the bracketed task description if you want a different task — but "[EXACT NEXT TASK]" is the default from this handoff):
   ```
   Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task: [EXACT NEXT TASK]. Verify branch state with `git branch --show-current` before any doc reads — if you're not on the expected branch ([branch name from Step 2]), STOP and surface to director. Start by running the mandatory start-of-session sequence.
   ```

5. Press Enter. Claude will read the starter, run the branch verification, read all handoff docs, check git state, produce a drift check, and wait for your go-ahead before doing any work.

### Anything you need to do offline between sessions
[Only include if applicable — e.g., "Find the V2 prompt file on your laptop," "Check Vercel env vars." Otherwise say "Nothing — you're all set."]

### Open questions / carry-overs for the next session
[Any unresolved questions from this session that the next one needs to know about]
```

**Why this template is non-negotiable in Claude Code:** the user is a non-programmer. Session-boundary moments are high-confusion moments ("what do I type? which terminal? what message do I paste?"). The same mechanical rigor that Rule 14a demands mid-session — every imperative paired with a concrete method — applies here. The 🚪 sections must be **copy-paste-ready terminal commands** and **copy-paste-ready message text**, with no ambiguity.

### Step 5 — Present all updated files via `present_files`

---

## 5. Always-loaded docs (Group A — 12 files)

1. `NEW_CHAT_PROMPT.md`
2. `HANDOFF_PROTOCOL.md` (this file)
3. `PROJECT_CONTEXT.md`
4. `PLATFORM_ARCHITECTURE.md`
5. `PLATFORM_REQUIREMENTS.md` (NEW — created 2026-04-17; authoritative on platform-wide scale/user/concurrency/review/audit requirements)
6. `NAVIGATION_MAP.md`
7. `DATA_CATALOG.md`
8. `ROADMAP.md`
9. `CORRECTIONS_LOG.md`
10. `CHAT_REGISTRY.md`
11. `DOCUMENTATION_ARCHITECTURE.md`
12. `DOCUMENT_MANIFEST.md`

Plus whatever Group B (tool-specific) docs are relevant to the current work.

**Special-purpose handoff file (NEW 2026-05-13-c):** `docs/NEXT_SESSION.md` is the session-handoff pointer — written by every end-of-session per §4 Step 1 row 12, read by `./resume` at the start of the next session to find the right branch + launch prompt. It is NOT Group A (not always loaded by Claude at every session start), but it IS always written and always present in the repo. Loaded by Claude when the session's first message is the sentinel `"Resume per docs/NEXT_SESSION.md"` — at which point Claude reads it as its first action and treats its `## Launch prompt` section as if the director had pasted that launch prompt directly.

---

## 6. The ask_user_input_v0 tool

When Claude needs to elicit user preferences with multiple-choice options, use the `ask_user_input_v0` tool when available. Easier for the user than typing.

Do NOT use for free-text responses (URLs, descriptions) or simple yes/no.

When using the tool, the question text AND the option labels must still pass Rules 14a–14d. Tappable buttons don't excuse jargon — they make it worse, because the user can't ask for clarification without switching off the tool.

---

## 7. Exceptions and edge cases

### If the user says "skip the protocol"
Comply, log to `CORRECTIONS_LOG.md`, warn of the risk.

### If docs contradict each other
`DOCUMENTATION_ARCHITECTURE.md` is authoritative on meta-questions. For all else, most recently updated wins. Flag contradictions to the user.

### If the user wants to deviate from the protocol
Discuss, document WHY, update this protocol if change is permanent. Never deviate silently.

### If the manifest is out of sync
Reconcile at start-of-chat by asking user to list all docs in their repo.

---

## 8. Enforcement

The user CAN check at any point whether Claude is following this protocol. Claude should be prepared to explain, step by step, which rule it is executing. If the user notices a rule was skipped, Claude acknowledges it, explains why, and logs to `CORRECTIONS_LOG.md`.

---

## 9. Claude Code vs. claude.ai — applicability of this protocol

This protocol was originally written for claude.ai (chat-based, upload-based). After Phase M Ckpt 9, the project migrates to Claude Code (repo-integrated, direct execution). See `docs/CLAUDE_CODE_MIGRATION.md` for full migration plan.

**Core principle: the entire protocol applies to both environments.** Every rule (Rules 1–20, Rules 14a–14e) applies identically in Claude Code. The 20 rules encode accumulated lessons that don't become less relevant in a different tool.

**Mechanical differences (do not skip a rule — just adapt how it's executed):**

| Protocol step | claude.ai behavior | Claude Code behavior |
|---|---|---|
| Step 1 (read uploaded docs) | Claude reads docs uploaded to the chat | Claude reads docs from `/docs/` in the repo filesystem |
| Step 3 (Pre-Flight Drift Check) | Same — structured summary + wait for user confirmation | Same — plus run `git log` / `git status` to ground the check in repo reality |
| Step 4 (URL capture) | Claude asks user to paste browser URL | Claude captures session identifier: `session_YYYY-MM-DD_topic-slug` (Rule M4 in migration doc) |
| Step 6 (identify needed Group B docs) | Claude asks user to upload any missing ones | Claude opens them directly from `/docs/` on demand |
| Rule 5 (safety for code changes) | Claude gives commands; user runs and pastes output | Claude runs commands directly — BUT gated by Rule M1 (destructive ops need explicit confirmation) |
| End-of-chat Step 5 (present_files) | Claude generates files via `present_files` tool for user to download | Claude edits and commits files directly via git; end-of-session handoff confirms commit hash |

**Rules that become STRONGER in Claude Code, not weaker:**

- **Rule 5** (safety for code changes) — Claude Code executes commands directly, so the confirmation gate is MORE important. Migration doc §5 Rule M1 formalizes this as "STOP before destructive operations."
- **Rule 14a** (Read-It-Back test) — Pattern 11's recurrence across 4 chats shows documentation alone doesn't prevent communication slips. Claude Code should apply Rule 14a to every instruction AND every explanation given to the user.
- **Rule 10** (acknowledge mistakes) — Claude Code's direct execution means mistakes can have faster consequences. Acknowledging promptly matters more.

**Rules that become EASIER in Claude Code (but don't go away):**

- **Rule 1** (Verify Before You Write) — Claude Code can read the actual code to verify, so "ask the user" falls back to "read the file" for most questions.
- **Rule 3** (Code is source of truth) — trivially enforced since Claude reads code directly.
- **Rule 8** (Cross-Chat Data Clarification Protocol) — may become rarer since Claude Code can search the filesystem for past decisions documented in code comments or commit messages. But when ambiguity about HUMAN reference language arises, same protocol applies.

**For end-of-session doc updates in Claude Code:**
Step 1 (Document Update Checklist) runs the same 11 questions. Step 5 (present_files) is replaced by: Claude edits docs in place, stages them, commits with a clear message, and the Personalized Handoff Message confirms the commit hash. The user then has the option to push immediately or defer.

**Session management in Claude Code:**
- Each Claude Code session starts fresh (same as a new claude.ai chat). Memory persists ONLY through docs and git.
- Rule 13 (proactive context-degradation warning) applies — Claude Code can feel stretched on long sessions just like claude.ai.
- Rule 12 (mid-chat URL recapture for scope pivots) becomes "register a second session identifier" — same spirit.

**When in doubt:** fall back to claude.ai-style paste-dance for a single operation (Migration Rule M6). Rare but useful escape hatch.

---
END OF DOCUMENT
