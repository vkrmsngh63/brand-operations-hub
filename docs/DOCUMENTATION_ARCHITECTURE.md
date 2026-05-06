# DOCUMENTATION ARCHITECTURE
## The meta-document: explains how the entire documentation system works, why each doc exists, and when to load/update each one.

**Last updated:** April 17, 2026 (timestamp bump — Phase M Ckpts 9 + 9.5 complete; `/docs/` canonical location now active; content unchanged from Ckpt 8 version)
**Last updated in chat:** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f

---

## 1. Why this document exists

The Product Launch Operating System (PLOS) is being built by a **non-programmer director + Claude** across many chat sessions. Every chat is isolated — Claude has no memory of previous chats. The only way information travels from one chat to the next is through:

1. **Documentation files** the user uploads at the start of each chat
2. **The code in the repo** (which Claude can read via Codespace commands)
3. **The user's memory** (what the user tells Claude during the chat)

When any of these three channels break down, information gets lost and Claude makes mistakes that cascade into bigger problems. This document describes the documentation system that ensures information travels reliably across chats for as long as this project exists — even when it grows to 14+ workflow tools and hundreds of components.

**Critical principle:** This document is authoritative. If any other doc contradicts this one, this one wins.

---

## 2. The core problem this system solves

### Problem 1: Context window limits
Each Claude chat has a finite context window. As the project grows, uploading every document to every chat will exceed that limit. We need a system where only the RELEVANT subset of docs is loaded per chat, but all information remains accessible when needed.

### Problem 2: Information drift
When docs are updated or refactored across chats, details can be dropped silently. We need a system that catches drift before it causes damage.

### Problem 3: Cross-tool data references
PLOS has 14 interconnected workflow tools. Data captured in one tool feeds downstream tools. When a future chat asks Claude to "use the primary keywords from each topic node" to build a downstream tool, Claude must know *exactly* which data that refers to — without guessing.

### Problem 4: Mistake recurrence
If Claude made a mistake in a past chat, future chats shouldn't repeat it. We need a persistent record of mistakes and lessons.

### Problem 5: Chat traceability
When Claude says "we decided X in a past chat," the user should be able to open that exact chat by URL, not hunt through history.

### Problem 6: Methodology consistency
The director's iterative, discovery-driven methodology (see `PROJECT_CONTEXT.md` §13) must survive across chats. Each new Claude must understand and support this approach, not push back against it.

---

## 3. The document hierarchy

### Group A — Always Loaded (every chat starts with these)

These small, foundational docs establish context. Upload ALL of them at the start of every chat:

| File | Purpose | Changes... |
|---|---|---|
| `NEW_CHAT_PROMPT.md` | Entry point. Tells Claude what phase we're in, what to do first, and which other docs to load. | Every chat (tailored to next chat's scope) |
| `HANDOFF_PROTOCOL.md` | The rules Claude MUST follow at start, during, and end of every chat. | When rules evolve |
| `PROJECT_CONTEXT.md` | The "why" of PLOS — vision, users, business model, scope, working methodology. | Rarely (vision shifts or methodology changes) |
| `PLATFORM_ARCHITECTURE.md` | Technical architecture — routes, database schema, shared systems. | When architecture changes |
| `PLATFORM_REQUIREMENTS.md` | **Non-functional and platform-wide requirements** — scale, users, assignment model, concurrency, review cycles, audit policy, infrastructure, phasing. Authoritative for platform-wide truths. | When platform-level facts change (rare but consequential) |
| `NAVIGATION_MAP.md` | Every click path through the app. | When routes or navigation changes |
| `DATA_CATALOG.md` | Master index of all data captured by all tools, using Human Reference Language. | When any tool captures/changes data |
| `ROADMAP.md` | Execution plan — what's done, what's next, in what order. | Every chat |
| `CORRECTIONS_LOG.md` | Mistakes Claude has made + lessons learned. Append-only. | When a mistake happens |
| `CHAT_REGISTRY.md` | Chronological log of chat URLs with summaries of work done. | Every chat (new row added) |
| `DOCUMENTATION_ARCHITECTURE.md` | This document. | Rarely |
| `DOCUMENT_MANIFEST.md` | Ground-truth registry of every doc in the system. | Every chat (timestamps) |

**Total:** 12 files in Group A. All should always be uploaded.

### Group B — Loaded When Working on a Specific Tool

When building/modifying a specific workflow tool, upload that tool's relevant doc:

| Doc Type | When to Load | Example Filename |
|---|---|---|
| **Active Doc** | While the tool is still being built/iterated on | `KEYWORD_CLUSTERING_ACTIVE.md` |
| **Archive** | When going BACK to a finished tool (rare) | `KEYWORD_CLUSTERING_ARCHIVE.md` |
| **Data Contract** | When a downstream tool needs to READ data from an upstream tool | `KEYWORD_CLUSTERING_DATA_CONTRACT.md` |

**Key rule:** A tool has an Active Doc **or** an Archive, never both simultaneously. The Archive is created at "Tool Graduation" (see section 5).

### Group C — Loaded Rarely

| Doc | When to Load |
|---|---|
| `KST_Handoff_v18.md` (legacy) | Only if referencing the original single-HTML tool's behavior |
| `KST_Features_Tour_v15.md` (legacy) | Only if referencing the original tool's features |
| `keyword_sorting_tool_v18.html` (legacy) | Only if debugging against the original tool's behavior |

These are historical references from before PLOS existed. They should NOT be loaded by default.

---

## 4. The Human Reference Language (HRL) system

### The problem
The user is non-technical. When they say "the main keywords of a topic," they should not have to know that internally these are `Keyword.id` values where `Node.kwPlacements[keywordId] === 'p'`. Claude must do the translation.

### The solution
Every data item captured by any tool is registered in `DATA_CATALOG.md` with THREE fields:

1. **HUMAN REFERENCE** — How the user would naturally refer to this data. Can include multiple aliases.
2. **CAPTURED IN** — Which tool + which UI area captures it.
3. **TECHNICAL NAME** — The exact database field / variable / Prisma path.

Plus a pointer to the tool's Data Contract for full implementation detail.

### Critical rule: The user authors the Human Reference, not Claude
When a tool is completed, Claude must INTERVIEW the user about the data captured and ask them to describe it in their own words. Claude must NOT invent human references. The moment Claude starts authoring human references, drift re-emerges.

### Example entry in DATA_CATALOG.md
```
### Primary Keywords in a Topic
- HUMAN REF: "the primary keywords of a topic" / "the bold keywords in a topic" / "the main keywords under a node"
- CAPTURED IN: Keyword Clustering → Canvas → Node Edit Panel → Keywords section (marked [p])
- TECHNICAL NAME: Keyword.id where CanvasNode.kwPlacements[keywordId] === 'p'
- CONTRACT DOC: KEYWORD_CLUSTERING_DATA_CONTRACT.md §3.2
- SHARED WITH: TBD — decide per downstream workflow as they are built
```

---

## 5. Tool Lifecycle — When a tool "graduates"

When work on a specific workflow tool reaches a stable completion state (all features working, no active development), Claude performs a **Tool Graduation Ritual**:

### Step 1: Split the Active Doc
The `<TOOL>_ACTIVE.md` document becomes TWO documents:

- `<TOOL>_ARCHIVE.md` — Full history: all features, implementation decisions, bugs fixed, edge cases. Loaded only if we return to modify the tool.
- `<TOOL>_DATA_CONTRACT.md` — ONLY what downstream tools need: data schemas, Human References, R/W flags, edge cases, sample data. Permanent, small, referenced from `DATA_CATALOG.md`.

### Step 2: Conduct the Data Capture Interview
Claude asks the user structured questions about every piece of data the tool captured:
- "Describe this data in the way you would naturally refer to it"
- "Which downstream tools might need to read it?"
- "Should it be read-only downstream, or editable?"
- "If editable, how should the upstream tool see the edits?"
- "Are there edge cases or constraints downstream tools should know about?"

### Step 3: Update DATA_CATALOG.md
Add entries for every new data item with Human Reference + Technical Name + Shared Data Registry flags.

### Step 4: Conduct the Next-Tool Setup Interview
Claude asks the user:
- "Which tool are we building next?"
- "What's its high-level goal?"
- "Which upstream Data Contracts will it need to read?"
- "What's the first milestone?"
- "Any design/UX preferences already decided?"

### Step 5: Create the next tool's Active Doc
Prepopulated with the goal, required data contracts, initial roadmap, and open questions for Day 1 of the next chat.

### Step 6: Update NEW_CHAT_PROMPT.md
Tailored to the next chat: "We are starting work on [NEXT_TOOL]. Load these docs: [list]. Here's Day 1's plan: [steps]."

---

## 6. End-of-Chat Handoff Protocol — Two scenarios

### Scenario A: Work on current tool is ONGOING (more to do next chat)
Claude produces:
1. Updated `NEW_CHAT_PROMPT.md` with current phase, current step, "resume here"
2. Updated `<TOOL>_ACTIVE.md` with everything built/changed/decided this chat (if a tool is being worked on)
3. Updated `ROADMAP.md` if items completed or added
4. Updated `CORRECTIONS_LOG.md` if any mistakes were made
5. Updated `PLATFORM_ARCHITECTURE.md` if routes/tables/systems changed
6. Updated `DATA_CATALOG.md` if new data was captured
7. Updated `CHAT_REGISTRY.md` with a new row for this chat

### Scenario B: Current tool is COMPLETE, starting a new tool next chat
Claude performs the full **Tool Graduation Ritual** (section 5), PLUS:
1. Updated `CORRECTIONS_LOG.md`
2. Updated `CHAT_REGISTRY.md`
3. Updated `ROADMAP.md`

### Mid-Chat Pivot
If the chat's scope pivots to a fundamentally different task mid-chat, Claude must add a second row to `CHAT_REGISTRY.md` for the same chat URL but a different scope. One chat can appear multiple times in the registry.

---

## 7. Cross-Chat Data Clarification Protocol

When Claude (in a current chat) is unsure which specific data the user is referencing from a previous tool's work, Claude must:

1. **Stop and identify the ambiguity** (do not guess)
2. **Recommend a specific chat URL from `CHAT_REGISTRY.md`** where that data was originally discussed
3. **Give the user a precise question to ask the Claude in that chat** — worded so the answer unambiguously identifies the data

Example:
> "You mentioned 'the main topics' from Keyword Clustering. That could mean: top-level topics in the hierarchy, or topics marked as primary, or something else. Please open this chat: https://claude.ai/chat/[uuid-from-registry] — and ask: 'When we were working on the canvas, what did we call the top-level topics with no parent? Describe them in the natural language I would use.' Paste the answer back here."

And the reverse: every chat's `NEW_CHAT_PROMPT.md` instructs Claude that future chats may ask for clarifying questions about data captured in the current chat's tool, and Claude must answer precisely using BOTH Human Reference Language AND technical names.

---

## 8. Chat URL Capture Protocol

Every chat, Claude captures the chat URL at THREE moments:

1. **START of chat** — After Pre-Flight Drift Check, before any work. Hard gate: no work proceeds without URL capture.
2. **MID-CHAT** — If scope pivots significantly. Results in a new registry row.
3. **END of chat** — Final confirmation for the canonical registry entry.

See `HANDOFF_PROTOCOL.md` for the exact phrasing Claude uses to request the URL.

---

## 9. Living Questions — questions that are never globally answered

Certain architectural questions cannot be answered once and for all. They must be answered locally, per-implementation. `HANDOFF_PROTOCOL.md` requires Claude to ask these whenever relevant:

1. **"Which data from upstream workflows does this new workflow need?"** — Answered when designing each new workflow.
2. **"Is each piece of shared data read-only or editable downstream?"** — Answered per-data-item at implementation time.
3. **"If editable, how does the upstream tool see the edits?"** — Answered per-data-item at implementation time.
4. **"Which workflow(s) does this specific project exist in?"** — Answered at Project creation and updated as workflows are added.

All answers are recorded in `DATA_CATALOG.md` under the **Shared Data Registry** section.

---

## 10. Scaling this system

### How it stays manageable as the project grows

- **Group A docs stay small** — they reference, not duplicate, detailed info from Tier B docs
- **Group B docs are loaded only when relevant** — a chat building Content Development doesn't need Keyword Clustering's Archive, only its Data Contract
- **Archives sit on the shelf** — the bulk of accumulated detail doesn't weigh down normal chats
- **DATA_CATALOG.md is always loaded** — it's the bridge, but stays lean because it points to contracts rather than duplicating them

### When the system needs to evolve

If at some point in the future:
- Group A docs collectively exceed a reasonable context window → split `PLATFORM_ARCHITECTURE.md` into `PLATFORM_ARCHITECTURE_CORE.md` (always loaded) + `PLATFORM_ARCHITECTURE_DETAILS.md` (loaded on demand)
- `DATA_CATALOG.md` becomes too large → split into per-workflow catalogs with an index
- `CHAT_REGISTRY.md` becomes unwieldy → archive older entries into `CHAT_REGISTRY_ARCHIVE.md` keeping only the last 50 entries active

These are only triggered when ACTUALLY needed, not preemptively.

---

## 11. Responsibilities — who maintains what

| Doc | Maintained By | Updated When |
|---|---|---|
| All Group A docs | Claude at end of every chat | When relevant changes occur |
| Tool Active Docs | Claude during the chat | When the tool is worked on |
| Tool Archives | Claude at Tool Graduation | Only at graduation |
| Tool Data Contracts | Claude at Tool Graduation + when downstream tool discovers a need | Rarely (contracts should be stable) |
| `CHAT_REGISTRY.md` | Claude at end of every chat | Every chat |
| `CORRECTIONS_LOG.md` | Claude at end of every chat if a mistake occurred | When mistakes happen |

**The user's responsibility** is to upload the updated docs back to the repo after each chat. Claude will remind the user at end-of-chat.

---

## 12. Quick-start for new chats

If you are a future Claude reading this, your start-of-chat sequence is:

1. Read ALL Group A docs that were uploaded
2. Perform the **Pre-Flight Drift Check** (see `HANDOFF_PROTOCOL.md`)
3. Capture the chat URL (see `HANDOFF_PROTOCOL.md`)
4. Identify which Group B docs are needed for the current task and request them from the user if not already uploaded
5. Confirm with the user before starting work

If you are the user reading this, your start-of-chat sequence is:

1. Open a new Claude chat
2. Upload all 11 Group A files
3. If you know which tool you'll be working on, upload that tool's Active Doc or Data Contract(s)
4. Paste the content of `NEW_CHAT_PROMPT.md` into the message box
5. Send

---

## 13. Iterative schema evolution — methodology alignment

This section exists because the director's working methodology (see `PROJECT_CONTEXT.md` §13) has direct implications for how documentation stays in sync with reality.

### The core alignment
The director **discovers new data fields mid-development**, adds them to the schema, and keeps moving. This is the correct approach (see `PROJECT_CONTEXT.md` §13 for rationale). The documentation system must support this without friction.

### Rules for mid-chat schema changes

When a new field or table is added during a chat:

1. **Add the field first, document immediately after.** The documentation update happens in the same chat, before handoff — NOT deferred to "next chat will clean it up."

2. **Update `DATA_CATALOG.md` with a new entry** for every new field/table. At minimum:
   - HUMAN REF (provisional wording OK if not yet validated with user)
   - CAPTURED IN (which tool/UI area)
   - TECHNICAL NAME (exact field path)
   - SHARED WITH (TBD is acceptable)

3. **Update `PLATFORM_ARCHITECTURE.md` §5** if schema structure changed (new table, removed field, FK renames).

4. **No speculative additions.** Do not add fields "we might need later." Only add what the current work requires. This keeps the schema free of dead fields.

### What makes this safe

Because each field is:
- Added as optional with a default (migrates cleanly against existing data)
- Documented in the same chat (no undocumented fields slip through)
- Validated with the user before finalization (Tool Graduation Interview confirms provisional names)

…iterative evolution does not accumulate debt. It just grows the schema alongside the software.

### What Claude must NOT do

- Push back against mid-development field additions
- Suggest "we should have planned this better"
- Treat schema evolution as technical debt or chaos
- Defer documentation updates to "next chat"

### What Claude MUST do when a field is added

- Confirm with the user: "I'm adding `fieldName` as optional text with default empty — sound right?"
- Add it to `DATA_CATALOG.md` in the same chat
- Mention it in the end-of-chat handoff summary so the user knows it exists

### Relationship to Tool Graduation

Tool Graduation is still the moment when provisional names are finalized. Fields added mid-development have provisional Human References; the Tool Graduation Interview confirms or refines them. This keeps documentation flexible during active development and rigorous once a tool stabilizes.

---

## 14. Workflow Requirements Interview + Workflow Design Docs

This section, like §13, was added as a direct response to a class of mistake — specifically, the platform architectural reveal of April 17, 2026, when significant platform-level requirements (scale, user model, assignment structure, concurrency, review cycles) surfaced mid-build and forced a pause. The response is a protocol that catches such reveals BEFORE code is written.

### 14.1 The Workflow Requirements Interview

Before any substantive build work on a new workflow tool (workflows 2–14 or future workflows), Claude conducts a **Workflow Requirements Interview** with the user. This interview is a structured, multi-cluster conversation that answers ~14 foundational questions about the workflow before any code is touched.

The full list of questions is maintained in `HANDOFF_PROTOCOL.md` Rule 18. Summary of question areas:

- Purpose and deliverables
- User types (admin vs. worker) and phasing
- Throughput at each phase (Phase 1 / Phase 3 / Phase 4)
- Upstream data inputs (→ `DATA_CATALOG.md` Shared Data Registry)
- Downstream data outputs
- Workflow readiness rules
- User experience shape (forms, uploads, visualizations, tool interactions)
- Concurrency requirements and strategy
- Review cycle applicability
- Audit trail requirement
- Reset rules
- Data persistence model
- Edge cases and quality bar
- Fit with the Shared Workflow Components Library (which shared components the workflow imports + which custom React content component it authors)

### 14.2 Interview deliverable: `<WORKFLOW_NAME>_DESIGN.md`

The interview produces a **Workflow Design Doc** — a new Group B doc per workflow. Format:
- Filename: `<WORKFLOW_NAME_IN_UPPER_SNAKE>_DESIGN.md` (example: `COMPETITION_SCRAPING_DESIGN.md`)
- Content: the 14 question answers in structured form
- Lifecycle: created before build starts, updated during build as decisions are refined, folded into `<TOOL>_ACTIVE.md` when build begins, referenced during Tool Graduation for the Data Contract

### 14.3 Platform-Truths Audit (Rule 19)

The final step of every interview is a platform-truths audit. If any answer reveals a platform-level fact (scale change, new role, new concurrency requirement, new infrastructure dependency), `PLATFORM_REQUIREMENTS.md` is updated in the same chat before workflow build begins.

### 14.4 Why this works

The doc-system already caught workflow-specific reveals well (through `DATA_CATALOG.md` updates and the Living Questions protocol). It did NOT catch platform-level reveals — those lived in the user's head because no doc was responsible for capturing them. The combination of `PLATFORM_REQUIREMENTS.md` + the Platform-Truths Audit fills that gap.

### 14.5 Relationship to the Shared Workflow Components Library

**Reframed 2026-05-04** in `session_2026-05-04_workflow-tool-scaffold-design`. The earlier "Shared Workflow-Tool Scaffold" required-shell concept was retired in favor of a bottom-up library of reusable React components and hooks. There is no required shell. Per `PLATFORM_REQUIREMENTS.md §12` (REWRITTEN 2026-05-04) + `HANDOFF_PROTOCOL.md` Rule 20 (REFRAMED 2026-05-04) + project memory `project_scaffold_pivot_to_components_library.md`.

The Components Library design lives in `docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md` (Group B — platform infrastructure). It captures 9 components (`useWorkflowContext()`, `<WorkflowTopbar>`, `<StatusBadge>`, `<DeliverablesArea>`, `<CompanionDownload>`, `<ResetWorkflowButton>` + `<ResetConfirmDialog>`, `<NotReadyBanner>`, `<WorkerCompletionButton>`, `<AdminReviewControls>`, `useEmitAuditEvent()`) plus the workflow-declaration contract.

Each subsequent workflow's Design Doc answers: "Which shared components does this workflow import, and what custom React content component does it author for its own UI?" There is no waiver concept — workflows like Keyword Clustering that have a unique UI (dual-state canvas) simply don't import the components they don't need; W#1 may adopt components piecemeal when convenient (e.g., `<ResetConfirmDialog>` once W#1 reset is built per `PLATFORM_REQUIREMENTS.md §7.5`'s roadmap gap).

---

## 15. Claude Code methodology shift — doc system evolution

**Context:** At the end of Phase M Ckpt 8, the project committed to migrating from claude.ai to Claude Code as the primary execution environment. Full migration plan is in `CLAUDE_CODE_MIGRATION.md` (Group A doc #13). This section documents how the doc system itself evolves.

### 15.1 What the doc system was built for

The system was architected assuming no filesystem access and fresh-start-every-chat:
- Uploads at chat start
- Downloads at chat end
- 13 Group A docs form the re-loaded world model
- Group B docs are tool-specific and uploaded when relevant
- Ephemeral everything — docs are the only persistent memory

### 15.2 What changes in Claude Code

Claude Code has direct filesystem access and executes commands in the user's repo. This means:

| Aspect | claude.ai system | Claude Code system |
|---|---|---|
| Where canonical docs live | User's local machine (uploaded per chat) | Repo at `/docs/` (read on demand) |
| How Claude gets docs | User uploads at chat start | Claude opens files from `/docs/` |
| How doc updates propagate | User downloads new files → overwrites local → uploads next chat | Claude edits in place, commits to git, pushes; next session `git pull`s |
| Session identifier | Chat URL from browser | `session_YYYY-MM-DD_topic-slug` |

### 15.3 What STAYS the same

- **The 13 Group A documents** remain canonical.
- **The Group B pattern** (tool-specific active docs, Tool Graduation Ritual) remains.
- **Session-end doc update ritual** remains (HANDOFF_PROTOCOL.md §4).
- **The Human Reference Language system** (§4) remains.
- **Living Questions** (§9) remain.
- **Cross-Chat Data Clarification Protocol** (§7) remains — renamed "Cross-Session" in practice but same protocol.
- **No memory between sessions** remains. Docs are still the memory layer.

### 15.4 The `/docs/` layout (post-Ckpt-9)

```
/docs/
├── (Group A — 13 files)
│   ├── PROJECT_CONTEXT.md
│   ├── PLATFORM_ARCHITECTURE.md
│   ├── PLATFORM_REQUIREMENTS.md
│   ├── NAVIGATION_MAP.md
│   ├── DATA_CATALOG.md
│   ├── ROADMAP.md
│   ├── CORRECTIONS_LOG.md
│   ├── CHAT_REGISTRY.md
│   ├── HANDOFF_PROTOCOL.md
│   ├── DOCUMENTATION_ARCHITECTURE.md
│   ├── NEW_CHAT_PROMPT.md
│   ├── DOCUMENT_MANIFEST.md
│   └── CLAUDE_CODE_MIGRATION.md   (NEW — added Ckpt 8)
│
├── (Group B — active tool docs)
│   └── KEYWORD_CLUSTERING_ACTIVE.md
│
├── (Session-start prompt)
│   └── CLAUDE_CODE_STARTER.md     (NEW — added Ckpt 8; NOT Group A, NOT uploaded; read by Claude Code at session start)
│
└── (future Group B docs)
    ├── COMPETITION_SCRAPING_DESIGN.md   (future)
    └── ...
```

### 15.5 Rollback considerations

If Claude Code creates more friction than it saves (unlikely), rolling back is trivial (see `CLAUDE_CODE_MIGRATION.md` §8). The `/docs/` folder is a net benefit regardless of tool — it gives the repo a clean home for handoff docs and removes the legacy `src/app/HANDOFF.md` problem.

### 15.6 Maintenance expectation

This doc-system-evolution section (§15) should be updated if:
- A rollback happens (log to CORRECTIONS_LOG too)
- New Claude Code-specific docs are added
- The `/docs/` layout changes structurally
- The Group A count changes from 13

---

END OF DOCUMENT
