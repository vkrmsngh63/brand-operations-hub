# MULTI-WORKFLOW PROTOCOL
## Methodology for working on multiple PLOS workflows in parallel Claude Code chats

**Created:** April 29, 2026 (session_2026-04-28_canvas-blanking-and-closure-staleness-fix; methodology session immediately after the bug-fix work shipped — director requested a way to start W#2 without interfering with continuing W#1 work).

**Audience:** Claude reads this at session start whenever the start-of-session task references any workflow with N ≥ 2, or when the "Current Active Tools" table in `ROADMAP.md` shows more than one workflow in active development. Establishes the rules that prevent two parallel chats from overwriting each other's work.

**Status:** Group A (always-loaded) doc #16. Read alongside `HANDOFF_PROTOCOL.md` at session start.

---

## 1. Why this protocol exists

PLOS has 14 planned workflows. Workflow #1 (Keyword Clustering) is in late-stage stabilization — multiple sessions per week — and will absorb another 6–10 sessions before graduating. The director can't wait that long to start W#2. So PLOS now supports **parallel workflow chats**: one Claude Code session for W#1 stabilization on `main`, another for W#2 design + build on a feature branch, both alive at the same time, both touching shared docs.

The risks are real. Without coordination, the two chats will:
- Overwrite each other's doc edits (last-writer-wins on shared Group A docs).
- Race on schema migrations (both chats running `prisma db push` produces undefined behavior).
- Conflict on the dev server port (one Codespace, one `npm run dev`).
- Lose work to merge conflicts at commit time.

This protocol exists to make those risks structurally impossible — not just procedurally avoided.

---

## 2. Branch strategy

| Workflow | Branch | When to merge to `main` |
|---|---|---|
| **W#1 Keyword Clustering** | `main` | Already there; tool is user-facing in production; small fixes deploy continuously. Stays on `main`. |
| **W#2 Competition Scraping & Deep Analysis** | `workflow-2-competition-scraping` | Merge per-milestone (e.g., after the Workflow Requirements Interview ships; after each visible milestone the user wants to test live). |
| W#3, W#4, …, W#14 | `workflow-N-<short-slug>` | Same pattern — feature branch per workflow until ready for users. |

**Concrete rules:**

- The workflow's first session creates the branch as its first git action: `git checkout -b workflow-N-<slug>` from the current `main`.
- Subsequent sessions on the same workflow start with `git fetch origin && git checkout workflow-N-<slug> && git pull --rebase`.
- A session NEVER force-pushes a feature branch unless the director explicitly approves (per CLAUDE_CODE_STARTER Rule 8).
- When a milestone ships, merge via PR (or fast-forward merge if the user prefers) — same pattern as any feature merge.

**Why `main` for W#1:** W#1's tool is in production. Code lives on `main`; bugs are caught fast because the tool is in real use. Switching W#1 to a feature branch now would interrupt that feedback loop.

**Why feature branch for W#k for k ≥ 2:** the tool isn't user-facing yet. Early work is design, interview, and scaffolding. Pre-deploy work shouldn't pollute production.

---

## 3. Doc section ownership

Group A docs are shared. Each workflow OWNS specific sections of each doc; another workflow's chat does NOT edit owned sections without surfacing it explicitly first.

| Doc | Ownership rule |
|---|---|
| **`ROADMAP.md`** | Each workflow owns its named sections (e.g., the "Workflow #N" section). The cross-cutting "Current Active Tools" table at the top is touched by every session AT END-OF-SESSION ONLY (rule 5 below). Phase-tracking + infrastructure-TODO sections: append-only; whoever's adding tags their entry with the session ID. |
| **`CHAT_REGISTRY.md`** | Append-only; each session adds its own row at the top. Rows are independent — interleaving from parallel chats is fine. |
| **`PLATFORM_ARCHITECTURE.md`** | Each workflow owns its subsections (routes, schema for its own tables, components, etc.). Schema changes follow Rule 4 below. The cross-cutting §10 "Known Technical Debt" is append-only. |
| **`CORRECTIONS_LOG.md`** | Append-only; each session adds its own entries. |
| **`DOCUMENT_MANIFEST.md`** | Each session updates timestamps + per-doc modified flags for the docs it touched. The Group A list itself is touched only when adding/removing docs (coordinate via session-start drift check). |
| **`DATA_CATALOG.md`** | Each workflow owns its column + row in §7's Cross-Tool Data Flow Map (per HANDOFF_PROTOCOL Rule 18 reciprocal output declarations). The §7 table structure itself is touched only when adding a workflow (a Rule 25 surface event). |
| **Group B docs** (`<TOOL>_ACTIVE.md`, `<TOOL>_DESIGN.md`, etc.) | Exclusively owned by the workflow's chats. Other workflows never edit. |

**Conflict-prevention discipline:** when a session needs to edit a section another workflow owns, it surfaces the edit explicitly in the drift check (*"I plan to edit `PLATFORM_ARCHITECTURE.md` §3 routes table to add the W#2 routes; W#1 owns its rows in that table; I'll only ADD W#2 rows, not modify existing ones"*) and the director can flag it.

---

## 4. Drift + schema-change coordination

### Pull-rebase before commit (mandatory)

Every session runs `git pull --rebase origin <branch>` at TWO points:
- **Session start**, before the drift check, after the standard `git log` / `git status` reads.
- **Right before commit** at end-of-session.

This catches anything the parallel chat just pushed. If a rebase produces conflicts in shared sections, resolve and surface to director before continuing.

### Schema-change handshake

Only ONE chat at a time may modify `prisma/schema.prisma` or run `prisma db push` / migrations. Coordination:

1. **Before any schema change:** the chat about to make the change announces it in its drift check: *"I plan to add table `X` and field `Y` to support W#2 — schema-change session. Per MULTI_WORKFLOW_PROTOCOL Rule 4, no other chat should touch schema until this session ships."* The director surfaces this to the parallel chat (or the parallel chat sees it in the active-tools table — see Rule 5).
2. **The parallel chat reads the active-tools table at session start.** If it sees a schema change in flight by another workflow, it explicitly avoids any schema work this session and notes the deferral in its end-of-session items.
3. **After the schema change ships and pushes to `main`:** the chat that made the change updates the active-tools table to clear the schema-change-in-flight flag.

### Dev server exclusivity

A Codespace has one dev port. Only one `npm run dev` at a time. If both chats need to test live UI:
- Each session declares in its drift check whether it'll need the dev server.
- If two sessions need it simultaneously, they sequence: one runs to completion + kills the dev server before the other starts.
- For most W#2 design/interview work, no dev server needed at all.

### Build + test runs are non-exclusive

`npm run build`, `npm run lint`, `node --test` are CPU-bound but not resource-exclusive. Either chat can run them at any time without coordinating.

---

## 5. The "Current Active Tools" table — single source of truth

Lives at the top of `ROADMAP.md`. Every session reads it at start (it's in the mandatory Group A read). Every session updates its own row at end-of-session. Shape:

```markdown
## Current Active Tools

| Workflow | Status | Branch | Last Session | Next Session | Schema-change in flight? |
|---|---|---|---|---|---|
| W#1 Keyword Clustering | 🔄 Active dev — stabilization | main | 2026-04-29 bug-fix-and-canvas-wipe | (c) Defense-in-Depth Audit design | No |
| W#2 Competition Scraping | 🆕 About to start | workflow-2-competition-scraping | (none yet) | Workflow Requirements Interview | No |
| W#3–14 | Not yet started | — | — | — | — |
```

**Status-cell vocabulary:**
- 🆕 **About to start** — first session not yet run.
- 🔄 **Active dev** — multiple sessions in flight; tool not yet graduated.
- 🛠 **Schema-change session** — current session is modifying schema; other workflows defer schema work.
- ✅ **Graduated** — tool is stable; per HANDOFF_PROTOCOL Rule 22 the active doc has been split into Archive + Data Contract.
- ⏸ **Paused** — director paused work for some reason (captured in CHAT_REGISTRY).
- — — Workflow has no current work.

**Update discipline:** each workflow's session updates only its own row. End-of-session checklist (HANDOFF_PROTOCOL §4 Step 1) includes a new item: "update the Current Active Tools row for this workflow."

---

## 6. End-of-session checklist additions

In addition to the existing HANDOFF_PROTOCOL §4 Step 1 checklist, every session in a multi-workflow setup runs these:

| Question | If YES, action |
|---|---|
| Did this session change schema (any field in `prisma/schema.prisma` or run `prisma db push` / migrations)? | Update active-tools table: this workflow's "Schema-change in flight?" cell flips to "No" if the schema change was completed AND pushed (so other workflows can resume schema work); else stays "Yes" and the director is reminded the parallel chat must avoid schema work. |
| Does this workflow's branch differ from `main` after this session? | Note the divergence in the active-tools table's "Branch" cell + remind the director when the next merge-to-main milestone is. |
| Did this session edit a section another workflow owns? | Per Rule 3, the edit was already surfaced and approved at drift-check time. End-of-session: document the cross-workflow edit in the CHAT_REGISTRY row + flag for the other workflow to review at its next session start. |

---

## 7. How to start a new workflow chat

When the director wants to start W#k for k ≥ 2:

1. **Open a fresh Claude Code session** (separate terminal tab from any existing W#1 session).
2. **Paste the launch prompt template** (the director maintains these per workflow; for W#2 the canonical launch prompt is in this doc's Appendix A below). The launch prompt explicitly instructs Claude to read this protocol, create the feature branch, run the Workflow Requirements Interview per HANDOFF_PROTOCOL Rule 18, and produce the design doc.
3. **Claude's first concrete git action is `git checkout -b workflow-N-<slug>`** from the current `main`. Subsequent sessions for that workflow check out the existing branch.
4. **The Workflow Requirements Interview produces `<TOOL>_DESIGN.md`** as a Group B doc on the feature branch (per HANDOFF_PROTOCOL Rule 18).
5. **At end of the first W#k session**, the active-tools table gets the new row.

Subsequent W#k sessions follow the standard mandatory start-of-session sequence + check the active-tools table for parallel-workflow state.

---

## 8. Appendix A — Canonical W#2 launch prompt

Stored here so future Claude Code sessions can find it; also surfaced to the director when W#2 work is paused-and-resumed.

```
Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
begin Workflow #2 (Competition Scraping & Deep Analysis). This is the very
first session for W#2. Per HANDOFF_PROTOCOL.md Rule 25 + MULTI_WORKFLOW_PROTOCOL.md,
you'll be working in parallel with W#1 (Keyword Clustering) which has its own
active sessions on `main`; your work belongs on a feature branch
`workflow-2-competition-scraping`.

Concretely for today's session:
(1) Run the mandatory start-of-session sequence including reading
    MULTI_WORKFLOW_PROTOCOL.md.
(2) Check ROADMAP.md "Current Active Tools" table for the live state of W#1
    work in flight (especially any schema-change-in-flight flag).
(3) Create the feature branch from current main as your first git action:
    `git fetch origin && git checkout main && git pull --rebase &&
     git checkout -b workflow-2-competition-scraping`.
(4) Conduct the Workflow Requirements Interview per HANDOFF_PROTOCOL.md
    Rule 18 — produce docs/COMPETITION_SCRAPING_DESIGN.md with §A
    (initial answers, frozen at end-of-interview) + §B (empty append-only).
(5) Per Rule 21, scan ROADMAP.md for any prior directives addressed to W#2
    that need surfacing.
(6) Per Rule 19, run the platform-truths audit at end of interview — update
    PLATFORM_REQUIREMENTS.md if anything platform-level surfaces.
(7) At end of session, update the Current Active Tools table (per
    MULTI_WORKFLOW_PROTOCOL Rule 5) and produce the standard end-of-session
    handoff (HANDOFF_PROTOCOL §4).

Start by running the mandatory start-of-session sequence.
```

---

## 9. Appendix B — Canonical W#1 continuation prompt (for the parallel session)

Per the post-2026-04-29 W#1 standing instructions, the recommended next is choice (c) — Defense-in-Depth Audit design. Director can swap in (b) / (d) / (e) by editing the task description.

```
Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
per the standing instructions in docs/KEYWORD_CLUSTERING_ACTIVE.md
POST-2026-04-29-BUG-FIX-SESSION STATE block — choice (c) the dedicated
Defense-in-Depth Audit design session. Produce the per-fix redundancy matrix +
ESLint custom-rule design + runtime invariant check design + forensic
instrumentation design + server-side guards design + run-start pre-flight
self-test design. Design-only — no code.

Per HANDOFF_PROTOCOL.md Rule 25 + MULTI_WORKFLOW_PROTOCOL.md, work belongs on
`main`; check ROADMAP.md "Current Active Tools" table to confirm no W#2
schema work is in flight before any platform-level changes.

Start by running the mandatory start-of-session sequence.
```

---

## 10. When to update / retire this protocol

- **Update this doc** any time the parallel-workflow methodology evolves: new branch convention, additional doc-section ownership, schema-change-handshake refinement.
- **Retire it** if PLOS ever returns to single-workflow-at-a-time mode.
- **Don't silently override** any rule here mid-session; if a session needs to deviate, surface it to the director, get explicit approval, log the deviation in CORRECTIONS_LOG, and update this doc.

---

END OF DOCUMENT
