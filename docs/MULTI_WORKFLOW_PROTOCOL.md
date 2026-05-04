# MULTI-WORKFLOW PROTOCOL
## Methodology for working on multiple PLOS workflows with persistent branch state across sequential sessions

**Created:** April 29, 2026 (session_2026-04-28_canvas-blanking-and-closure-staleness-fix; methodology session immediately after the bug-fix work shipped — director requested a way to start W#2 without interfering with continuing W#1 work).

**REFRAMED 2026-05-04** in `session_2026-05-04_workflow-tool-scaffold-design`: the original framing assumed PARALLEL Claude Code chats (one for W#1, one for W#2, both alive at the same time). The director's actual operational reality is SEQUENTIAL — single Codespace, single terminal, one workflow at a time. Branch state persists across sessions because it's the same Codespace. The state-coordination scaffolding in this doc (active-tools table, schema-change-in-flight flag, per-workflow doc-section ownership) remains valuable for tracking state across sequential sessions over long stretches of time, but the parallel-chat framing was retired. See §11 (NEW 2026-05-04) for the canonical "how to start a session for any workflow" procedure both director and Claude follow.

**Audience:** Claude reads this at session start whenever the start-of-session task references any workflow with N ≥ 2, or when the "Current Active Tools" table in `ROADMAP.md` shows more than one workflow in active development. Establishes the branch + state-coordination rules.

**Status:** Group A (always-loaded) doc #16. Read alongside `HANDOFF_PROTOCOL.md` at session start.

---

## 1. Why this protocol exists

PLOS has 14 planned workflows. Workflow #1 (Keyword Clustering) is in late-stage stabilization — multiple sessions per week. Workflow #2 (Competition Scraping) is in active design + about to enter build. Future workflows #3-#14 will follow.

The director works **sequentially — one workflow at a time, in a single Codespace, with a single terminal** (per project memory `project_sequential_workflow_operation.md`). But state for multiple workflows is in flight at the same time:
- W#1's branch is `main`; W#2's branch is `workflow-2-competition-scraping`; future workflows will have their own feature branches.
- The director may switch between workflows session-to-session (e.g., a W#2 session today, a W#1 fix session tomorrow, then back to W#2).
- Branch state in the Codespace persists across sessions — whichever branch the previous session ended on is the branch the next session starts on, unless the director explicitly switches.
- Schema-change-in-flight flags persist across sessions (a flag set in W#2's design session matters weeks later when W#2's PLOS-side build does the actual `prisma db push`).
- Doc edits from one workflow's branch eventually merge to `main` and may conflict with edits made on `main` for cross-workflow concerns.

Without explicit coordination, sessions across this multi-workflow state would:
- Land on the wrong branch and have to switch mid-session (friction surfaced 2026-05-04 — see project memory + §11 below for the prevention mechanism).
- Race on schema migrations across non-coordinated sessions (less likely than parallel-chat racing, but still real if a director forgets they have W#2 schema in flight when starting a W#1 session).
- Overwrite each other's doc edits when branches eventually merge.
- Lose track of which deferred items belong to which workflow.

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

## 7. How to start a new workflow chat (FIRST session for a never-before-started workflow)

**Use this only when starting a workflow for the very first time.** For any subsequent session on an already-started workflow, see §11 below — that's the canonical "how to start a session for any workflow" procedure.

When the director wants to start W#k for k ≥ 2 for the first time:

1. **Open a Codespaces terminal** (or use the existing one).
2. **In that terminal, switch to `main` and create the feature branch:**
   ```
   cd /workspaces/brand-operations-hub && git fetch origin && git checkout main && git pull --rebase origin main && git checkout -b workflow-N-<slug>
   ```
   (Replace `N` with the workflow number and `<slug>` with a short slug — for W#2 it was `workflow-2-competition-scraping`.)
3. **Launch Claude Code:**
   ```
   claude
   ```
4. **Paste the launch prompt** for the workflow's first session (the director maintains these per workflow; for W#2 the canonical first-session launch prompt is in Appendix A below). The launch prompt instructs Claude to run the Workflow Requirements Interview per `HANDOFF_PROTOCOL.md` Rule 18 and produce the design doc.
5. **At end of the first W#k session**, the active-tools table in `ROADMAP.md` gets the new row, and the next-session instructions for the workflow are captured in the standard `§4 Step 4b` handoff.

---

## 8. Appendix A — Canonical W#2 launch prompt template

Use this when starting any W#2 session. Replace the bracketed `[task description]` with whatever the next W#2 session's task is. The branch-checkout terminal commands at the top are NON-NEGOTIABLE — they ensure the director's terminal is on the correct branch before Claude Code launches, preventing the branch-mismatch friction surfaced 2026-05-04.

**Step 1 — In a Codespaces terminal, run this command (it switches to the W#2 branch and pulls the latest):**

```
cd /workspaces/brand-operations-hub && git fetch origin && git checkout workflow-2-competition-scraping && git pull --rebase origin workflow-2-competition-scraping
```

**Step 2 — Launch Claude Code:**

```
claude
```

**Step 3 — As your first message, paste this** (edit the bracketed task description for what you're actually doing — see "Common W#2 task descriptions" below for ready-made variants):

```
Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
[task description]. Per HANDOFF_PROTOCOL.md Rule 25 + MULTI_WORKFLOW_PROTOCOL.md
+ project memory project_sequential_workflow_operation.md, this is W#2 work
and belongs on the workflow-2-competition-scraping branch. Verify branch
state with `git branch --show-current` before any doc reads — if you're
not on workflow-2-competition-scraping, STOP and surface to director (the
terminal commands in Step 1 above should have switched you, but verify).

Start by running the mandatory start-of-session sequence including reading
MULTI_WORKFLOW_PROTOCOL.md.
```

**Common W#2 task descriptions** (drop into the `[task description]` slot above):

- **W#2 doc-reframe** (closes deferred Tasks #8 + #9 from `session_2026-05-04_workflow-tool-scaffold-design`):
  > "W#2 doc-reframe — first item before any other W#2 work, addressing Tasks #8 + #9 in TaskList. Run the three reframes per Task #8: (1) docs/COMPETITION_SCRAPING_DESIGN.md §A.14 from 'Scaffold Fit' to 'Components Library Fit'; (2) docs/PLATFORM_REQUIREMENTS.md §12.6 from 'scaffold extension-points' to 'shared component patterns'; (3) docs/ROADMAP.md Current Active Tools W#2 row's Next Session item (a) reframed to components-library wording. Plus Task #9: docs/COMPETITION_SCRAPING_STACK_DECISIONS.md three lines mentioning 'Shared Workflow-Tool Scaffold.'"

- **W#2 PLOS-side build** (after the Phase-1 components-library build session has shipped on `main`):
  > "W#2 PLOS-side build session — implement the user-facing routes at /projects/[projectId]/competition-scraping per docs/COMPETITION_SCRAPING_DESIGN.md + docs/COMPETITION_SCRAPING_STACK_DECISIONS.md. Compose the page using the Shared Workflow Components Library (built on main in the prior Phase-1 components build session) + W#2's custom <CompetitionScrapingViewer /> content component. This session WILL include schema work — flips W#2's schema-change-in-flight flag from Yes → No after prisma db push lands. Read existing W#1 page.tsx as a composition reference. Read components library at src/lib/workflow-components/."

- **W#2 Chrome extension build** (after schema is locked on main; can run in parallel with PLOS-side build):
  > "W#2 Chrome extension build session — implement the WXT-based Chrome extension at extensions/competition-scraping/ per docs/COMPETITION_SCRAPING_STACK_DECISIONS.md §12. This session implements [specific module — e.g., 'Module 1 URL capture flow', 'Module 2 text save flow', 'image upload flow']. Auth uses signInWithPassword per Q2; URL upload uses signed-URL direct-to-Supabase per Q3."

(The director can also write task descriptions freehand; the format above is the recommended shape but not mandatory.)

---

## 9. Appendix B — Canonical W#1 continuation prompt template

Use this when starting any W#1 session. Same NON-NEGOTIABLE pattern as Appendix A — branch-checkout terminal commands first, then launch Claude Code, then paste the prompt.

**Step 1 — In a Codespaces terminal, run this command (it switches to `main` and pulls the latest):**

```
cd /workspaces/brand-operations-hub && git fetch origin && git checkout main && git pull --rebase origin main
```

**Step 2 — Launch Claude Code:**

```
claude
```

**Step 3 — As your first message, paste this** (edit the bracketed task description):

```
Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
[task description]. Per HANDOFF_PROTOCOL.md Rule 25 + MULTI_WORKFLOW_PROTOCOL.md
+ project memory project_sequential_workflow_operation.md, this is W#1 work
and belongs on `main`. Verify branch state with `git branch --show-current`
before any doc reads — if you're not on `main`, STOP and surface to director.

Start by running the mandatory start-of-session sequence.
```

**Common W#1 task descriptions** (refer to the W#1 row's "Next Session" cell in `ROADMAP.md` Current Active Tools table for the live priority list — items rotate as work ships):

- D3 retry resume from preserved checkpoint
- Sister-link consolidation drift cleanup
- `[FLAKE]` visibility investigation
- Pre-flight visibility on Resume
- Wrap remaining unwrapped routes
- GoTrueClient multi-instance fix
- Phase-1 UI polish bundle
- V3-era cleanup pass

Pick whichever next-priority item the director chose; copy its description from the Active Tools table.

---

## 10. Canonical "How to start a session for any workflow" — quick reference (NEW 2026-05-04)

(See §11 below for the full procedure with branch-task table + step-by-step instructions. This sub-section here is the quick lookup.)

| Workflow / task type | Branch | Launch prompt template |
|---|---|---|
| W#1 (Keyword Clustering) | `main` | Appendix B above |
| W#2 (Competition Scraping) | `workflow-2-competition-scraping` | Appendix A above |
| W#k for k ≥ 3 (future workflow, already started) | `workflow-N-<slug>` | Same shape as Appendix A; replace branch name |
| W#k for k ≥ 2 (FIRST session, never started) | (created in session, from `main`) | §7 above (the first-session-only procedure) |
| Cross-workflow / platform-wide infrastructure (e.g., components library; platform refactors; scaffold rewrites) | `main` | §11 below has the template |

---

## 11. How to start a session for any workflow (canonical procedure — NEW 2026-05-04)

This is the canonical procedure both director and Claude follow at the start of every session. It replaces the implicit assumption that branch state is "already correct."

**Step 1 — Identify the right branch for the next session's task.**

Use this table:

| Session task type | Branch |
|---|---|
| Work on W#1 (Keyword Clustering) | `main` |
| Work on W#k for k ≥ 2 (specific named workflow) | `workflow-N-<slug>` (e.g., W#2 → `workflow-2-competition-scraping`) |
| Cross-workflow / platform-wide infrastructure (components library, platform refactors, etc.) | `main` |
| First session for a never-before-started workflow | See §7 |

**Step 2 — In a Codespaces terminal, switch to that branch and pull the latest.**

For W#1 or platform-wide work:
```
cd /workspaces/brand-operations-hub && git fetch origin && git checkout main && git pull --rebase origin main
```

For W#k for k ≥ 2 (replace `workflow-N-<slug>` with the actual branch name):
```
cd /workspaces/brand-operations-hub && git fetch origin && git checkout workflow-N-<slug> && git pull --rebase origin workflow-N-<slug>
```

**Step 3 — Launch Claude Code:**

```
claude
```

**Step 4 — As your first message, paste a launch prompt naming the specific task.**

Use:
- Appendix A above for W#2 (with one of the common-task-description variants)
- Appendix B above for W#1 (with one of the common-task-description variants)
- The platform-wide template below for cross-workflow / platform infrastructure work
- The §7 first-session procedure for a never-before-started workflow

**Step 5 — Claude verifies branch + runs the mandatory start-of-session sequence.**

Per `CLAUDE_CODE_STARTER.md` start-of-session routine, Claude's first action after reading the starter file is `git branch --show-current` + `git status` to verify the branch matches the task. If mismatch, Claude STOPS and surfaces to the director immediately — does NOT continue doc reads on the wrong branch.

---

### §11.1 Cross-workflow / platform-wide launch prompt template

For platform-wide infrastructure work (e.g., components library, platform refactors, cross-workflow concerns surfaced as the recommended next-session in W#1 or W#2 standing instructions):

**Step 1 — In a Codespaces terminal:**

```
cd /workspaces/brand-operations-hub && git fetch origin && git checkout main && git pull --rebase origin main
```

**Step 2 — Launch Claude Code:**

```
claude
```

**Step 3 — As your first message, paste this** (edit the bracketed task description):

```
Read docs/CLAUDE_CODE_STARTER.md and follow every rule in it. Today's task:
[task description] — this is platform-wide infrastructure (cross-workflow
concern); per HANDOFF_PROTOCOL.md Rule 25 + MULTI_WORKFLOW_PROTOCOL.md +
project memory project_sequential_workflow_operation.md, work belongs on
`main` (NOT on any workflow feature branch). Verify branch state with
`git branch --show-current` before any doc reads — if you're not on `main`,
STOP and surface to director.

Note any active workflows' state in the drift check — read ROADMAP.md
"Current Active Tools" table to confirm no schema-change-in-flight flag
conflicts with today's session.

Start by running the mandatory start-of-session sequence including reading
MULTI_WORKFLOW_PROTOCOL.md.
```

---

## 12. When to update / retire this protocol

- **Update this doc** any time the multi-workflow coordination methodology evolves: new branch convention, additional doc-section ownership, schema-change-handshake refinement, new workflow added with a new launch-prompt template.
- **Retire it** if PLOS ever returns to truly single-workflow-at-a-time mode (no other workflows in flight; no per-workflow feature branches needed).
- **Don't silently override** any rule here mid-session; if a session needs to deviate, surface it to the director, get explicit approval, log the deviation in CORRECTIONS_LOG, and update this doc.

---

END OF DOCUMENT
