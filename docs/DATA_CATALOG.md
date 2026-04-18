# DATA CATALOG
## Master index of all data captured across the PLOS platform, with Human Reference Language

**Last updated:** April 18, 2026 (Phase 1g-test partial — corrected §5.8 and §5.9 Auto-Analyze drift; keys claimed in prior versions do not exist in code)
**Last updated in session:** session_2026-04-18_phase1g-test-kickoff (Claude Code)
**Previously updated (claude.ai era):** https://claude.ai/chat/cc15409c-5000-4f4f-a5ce-a42784b5a94f

**Purpose:** Bridge between user's natural language references and the code's technical names. Loaded every chat as Group A.

---

## 1. How to use this catalog

Every data item captured by any workflow tool gets a registry entry with:
- **HUMAN REF** — user's natural language (can be multiple aliases)
- **CAPTURED IN** — which tool + UI area
- **TECHNICAL NAME** — exact DB field / code path
- **CONTRACT DOC** — pointer to tool's Data Contract (when tool has graduated)
- **SHARED WITH** — which downstream workflows read it (may be "TBD")
- **R/W DOWNSTREAM** — for each consuming workflow, read-only or read-write

**Critical:** User authors Human References during Tool Graduation. Claude does NOT invent them.

---

## 2. Terminology — IMPORTANT

**User-facing term:** "Project" (one product launch effort, e.g., "Brand X Launch 2026").
**Internal DB tables:**
- `Project` = the user-facing project record
- `ProjectWorkflow` = per-workflow state + data bucket for a Project (USER NEVER SEES THIS NAME)

When user says "the project," they mean the `Project` record. All workflow-specific data (keywords, canvas, etc.) attaches to the `ProjectWorkflow` internally, but the user thinks of it as "part of the project."

---

## 3. Catalog organization

1. Platform-level data (Projects, Workflow Status, Admin Notes, User Preferences)
2. Keyword Clustering (current tool)
3. Placeholders for 13 future workflows

---

## 4. Platform-level data

### 4.1 Project (user-facing)
- **HUMAN REF:** "a project" / "the project" / "a product launch" / "my project"
- **CAPTURED IN:** `/projects` page — "+ New Project" button (Phase M Checkpoint 6)
- **TECHNICAL NAME:** `Project` table (live as of Checkpoint 4)
- **FIELDS (live):**
  - `id` — UUID, primary key
  - `userId` — owner
  - `name` — display name (default "Untitled Project")
  - `description` — free-text long description (default empty)
  - `sortOrder` — manual ordering on /projects page (default 0)
  - `createdAt`, `updatedAt` — timestamps
- **SHARED WITH:** ALL 14 PLOS workflow tools — every workflow operates in context of one Project
- **R/W DOWNSTREAM:** Metadata (name/description) is R/W from any workflow tool with appropriate permissions
- **STATUS:** Schema live in DB. `/projects` UI to be built in Checkpoint 6.

### 4.2 ProjectWorkflow (internal — user never sees this name)
- **HUMAN REF:** The user doesn't directly reference this; to the user, the concept is "the keyword clustering stage of my project is active" — NOT "the project workflow is active"
- **CAPTURED IN:** Auto-created when user enters a workflow in context of a Project (silent, no UI — Phase M Checkpoint 7)
- **TECHNICAL NAME:** `ProjectWorkflow` table (live as of Checkpoint 4)
- **FIELDS (live):**
  - `id` — UUID, primary key
  - `projectId` — FK to Project
  - `workflow` — String, e.g., `"keyword-clustering"`, `"competition-scraping"`
  - `status` — String: `"inactive"` | `"active"` | `"completed"`
  - `firstActivityAt` — Timestamp, nullable (set when status first becomes "active")
  - `lastActivityAt` — Timestamp, nullable (updated on every meaningful mutation in the workflow)
  - `completedAt` — Timestamp, nullable (set when user marks workflow complete)
  - `createdAt`, `updatedAt` — timestamps
- **CONSTRAINT:** Unique per `(projectId, workflow)` — one per Project per workflow type
- **HOW STATUS CHANGES:**
  - Inactive → Active: AUTO, on first meaningful user action in that workflow (via `markWorkflowActive()` helper — Checkpoint 5)
  - Active → Completed: MANUAL, user checks box/button in Projects View (Checkpoint 6)
  - Completed → Active: MANUAL, user unchecks
- **SHARED WITH:** Any tool/view that displays workflow progress (e.g., Projects View on /plos)

### 4.3 Workflow Status (a field of ProjectWorkflow — surfaced in user language)
- **HUMAN REF:** "the status of [workflow] for [project]" / "whether I've started [workflow]" / "whether [workflow] is done" / "what stage is [project] at"
- **CAPTURED IN:** Same as 4.2 (ProjectWorkflow.status field). Surfaced in UI on Projects View.
- **TECHNICAL NAME:** `ProjectWorkflow.status` String field
- **VALUES:** `"inactive"` | `"active"` | `"completed"`
- **UI DISPLAY:** Badge on workflow cards in Projects View — gray (inactive), blue (active), green (completed)
- **SHARED WITH:** Projects View; possibly Analytics & System Administration workflow

### 4.4 Project Last Activity (derived, not a direct DB field)
- **HUMAN REF:** "when I last worked on this project" / "the most recently touched project"
- **CAPTURED IN:** Computed on `/projects` page
- **TECHNICAL NAME:** `MAX(ProjectWorkflow.lastActivityAt)` aggregated across all ProjectWorkflows for a given Project
- **USAGE:** Default sort order on `/projects` page ("most recently worked on first")
- **WHY NOT `Project.updatedAt`:** After Phase M, `Project.updatedAt` only changes when the Project's name/description is edited — not when the user works inside a workflow. The aggregate across ProjectWorkflows is the true "last activity" signal.

### 4.5 Admin Notes (4 systems)
- **HUMAN REF:** "the admin notes" / "the notes for [system]"
- **CAPTURED IN:** 4 separate pages — `/pms/notes`, `/think-tank/notes` (currently live); `/dashboard/notes`, `/plos/notes` (Phase M Checkpoint 8)
- **TECHNICAL NAME:** `AdminNote` table, scoped by `(userId, system)` where system ∈ {"dashboard", "plos", "pms", "think-tank"}
- **FIELDS:** `title`, `description`, `content` (rich text HTML), `sortOrder`, `attachments[]`
- **ATTACHMENTS:** Stored in Supabase `admin-notes` bucket at path `<userId>/<noteId>/<timestamp>-<rand>-<safeName>`
- **SHARED WITH:** N/A (user-scoped, not business data)
- **NOTE:** Schema unchanged by Phase M. Valid `system` values expand at the application level; no DB change needed.

### 4.6 User Preferences
- **HUMAN REF:** "my preferences" / "my saved settings"
- **CAPTURED IN:** Various UI interactions (sidebar widths, view modes, sort orders)
- **TECHNICAL NAME:** `UserPreference` table, key-value pairs per user
- **KNOWN KEYS:**
  - `adminnotes_sidebar_width`
  - `adminnotes_view_mode_<system>`
  - `adminnotes_combined_sort_<system>`
- **SHARED WITH:** N/A (per-user UI state)

---

### 4.7 — 4.11 Phase 2 planned data items (NOT YET BUILT)

These data items are required for Phase 2 (multi-user infrastructure) per `PLATFORM_REQUIREMENTS.md`. Schemas are sketched in `PLATFORM_ARCHITECTURE.md §13`. Not built; listed here so future chats know they're planned and don't treat their absence as "missing documentation."

### 4.7 Assignment (three-way join — user × workflow × project)
- **HUMAN REF (provisional):** "the assignment" / "the access grant" / "who is assigned to what"
- **CAPTURED IN:** Admin grants access via future assignment UI (Phase 2) — TBD page
- **TECHNICAL NAME:** `Assignment` table (PLANNED; see `PLATFORM_ARCHITECTURE.md §13.1`)
- **FIELDS (planned):** userId, projectId, workflow, grantedBy, grantedAt, revokedAt, reviewState
- **UNIQUE CONSTRAINT (planned):** `(userId, projectId, workflow)` — one assignment per user per workflow per project
- **SHARED WITH:** All workflow tools (Phase 2+) — every API route will filter by assignments for non-admin users
- **STATUS:** Phase 2 build; scope/schema to be finalized during Phase 2 design

### 4.8 Review State (field of Assignment)
- **HUMAN REF (provisional):** "the review status" / "has this been reviewed" / "is this submitted for review"
- **CAPTURED IN:** Assignment row; UI controls TBD (worker-facing "I'm done" button; admin-facing review controls)
- **TECHNICAL NAME:** `Assignment.reviewState` (PLANNED)
- **VALUES (planned):** `"assigned"` | `"in-progress"` | `"submitted-for-review"` | `"acceptable"` | `"revision-requested"`
- **STATE TRANSITIONS:** See `PLATFORM_REQUIREMENTS.md §4`
- **UI DISPLAY:** Badge on worker's assignment list; admin review dashboard; workflow-tool status bar
- **SHARED WITH:** Any view that displays worker progress or admin review workload

### 4.9 Review Notes
- **HUMAN REF (provisional):** "the review notes" / "feedback from admin" / "revision notes"
- **CAPTURED IN:** Admin's review UI (Phase 2) — TBD component
- **TECHNICAL NAME:** `ReviewNote` table (PLANNED; see `PLATFORM_ARCHITECTURE.md §13.2`)
- **FIELDS (planned):** assignmentId, authorUserId, content (rich text), createdAt
- **UI DISPLAY:** Attached to the Assignment; visible to worker when reviewState is `revision-requested`
- **SHARED WITH:** Worker (for the assignment they own); admin; possibly audit queries

### 4.10 Audit Events
- **HUMAN REF (provisional):** "the audit log" / "the history of changes" / "who did what"
- **CAPTURED IN:** Automatically emitted by workflow tools that opt into audit (Phase 2)
- **TECHNICAL NAME:** `AuditEvent` table (PLANNED; see `PLATFORM_ARCHITECTURE.md §13.3`)
- **FIELDS (planned):** projectId, workflow, userId, eventType, payload (JSON), createdAt
- **OPT-IN:** Per-workflow; declared at workflow design time per `PLATFORM_REQUIREMENTS.md §5`
- **SHARED WITH:** Admin monitoring dashboards; per-workflow audit views; possibly exported for external analysis

### 4.11 User Role
- **HUMAN REF (provisional):** "my role" / "admin vs. worker"
- **CAPTURED IN:** Admin's user management UI (Phase 2) — TBD page; set at user invite time
- **TECHNICAL NAME:** TBD — either `UserRole` table (multi-role) or `UserProfile.role` column (single-role). See `PLATFORM_ARCHITECTURE.md §13.4`.
- **VALUES (initial):** `"admin"` | `"worker"`. More roles may be added.
- **SHARED WITH:** All API routes (permission middleware); every UI that scopes by role

### 4.12 Workflow Deliverables (planned storage model)
- **HUMAN REF (provisional):** "the deliverables" / "the output files" / "the workflow outputs"
- **CAPTURED IN:** Each workflow's upload/output area (Phase 2 pattern; specific UI per-workflow)
- **TECHNICAL NAME:** `Deliverable` table (PLANNED) + `workflow-deliverables` Supabase Storage bucket (PLANNED, private + signed URLs)
- **PATH PATTERN (planned):** `<projectId>/<workflow>/<filename>`
- **METADATA (planned):** owner, uploaded-by, version, timestamps, filename, size, content-type
- **SHARED WITH:** The workflow that produced it (read-write), downstream workflows that consume it (read-only typically), admin (full access)
- **VERSIONING:** Policy TBD per workflow — some workflows may need full version history (e.g., Content Development drafts), others may be last-version-wins (e.g., final assets)

---

## 5. Keyword Clustering — captured data

**Status:** All Human References below are PROVISIONAL. User will refine during Tool Graduation Interview.

**Foreign key:** All KC data tables now reference `projectWorkflowId` (live as of Checkpoint 4). Pre-Phase M references to `projectId` are obsolete.

### 5.1 Keywords
- **HUMAN REF (PROVISIONAL):** "the keywords" / "the search terms" / "the list of keywords"
- **CAPTURED IN:** Keyword Clustering → AST (All Search Terms) table via import, manual entry, or paste
- **TECHNICAL NAME:** `Keyword` table; foreign key `projectWorkflowId` (live)
- **PER-KEYWORD FIELDS:** `keyword`, `volume`, `sortingStatus` (Unsorted/Partially/Completely/AI-Sorted), `tags`, `topic`, `canvasLoc`, `topicApproved`
- **SHARED WITH:** TBD — likely Content Development, Conversion Funnel, Marketplace Optimization
- **R/W DOWNSTREAM:** TBD at per-workflow design time

### 5.2 Topics (Canvas Nodes)
- **HUMAN REF (PROVISIONAL):** "the topics" / "the topic nodes" / "the mindmap topics"
- **CAPTURED IN:** Canvas (Mindmap or Table mode) → Node creation / Edit Panel
- **TECHNICAL NAME:** `CanvasNode` table; foreign key `projectWorkflowId` (live)
- **FIELDS:** `title`, `description`, `altTitles`, `parentId`, `pathwayId`, `relationshipType`, `narrativeBridge`, `linkedKwIds`, `kwPlacements`, position/size, collapse states
- **SHARED WITH:** TBD — highly likely Conversion Funnel, Content Development
- **R/W DOWNSTREAM:** TBD

### 5.3 Primary Keywords in a Topic
- **HUMAN REF (PROVISIONAL):** "the primary keywords of a topic" / "the bold keywords" / "the main keywords under a node"
- **TECHNICAL NAME:** Keyword IDs where `CanvasNode.kwPlacements[keywordId] === 'p'`
- **DISPLAY:** Bold dark text
- **SHARED WITH:** TBD

### 5.4 Secondary Keywords in a Topic
- **HUMAN REF (PROVISIONAL):** "the secondary keywords of a topic" / "the italic purple keywords"
- **TECHNICAL NAME:** Keyword IDs where `CanvasNode.kwPlacements[keywordId] === 's'`
- **DISPLAY:** Italic purple text
- **SHARED WITH:** TBD

### 5.5 Pathways
- **HUMAN REF (PROVISIONAL):** "the pathways" / "the conversion pathways"
- **TECHNICAL NAME:** `Pathway` table (id, projectWorkflowId)
- **SHARED WITH:** TBD — likely Conversion Funnel

### 5.6 Sister Links
- **HUMAN REF (PROVISIONAL):** "the sister links" / "the purple dashed lines between topics"
- **TECHNICAL NAME:** `SisterLink` table (nodeA, nodeB, projectWorkflowId)
- **DISPLAY:** Dashed purple lines between canvas nodes
- **SHARED WITH:** TBD

### 5.7 Canvas State
- **HUMAN REF (PROVISIONAL):** "the canvas viewport" / "the zoom level"
- **TECHNICAL NAME:** `CanvasState` table (viewX, viewY, zoom, nextNodeId, nextPathwayId, projectWorkflowId unique)
- **SHARED WITH:** N/A (UI state)

### 5.8 Auto-Analyze config + prompts (ephemeral React state — **NOT persisted before a run starts**)
- **HUMAN REF (PROVISIONAL):** "the auto-analyze settings" / "the AI prompts" / "the seed words"
- **TECHNICAL REALITY (corrected 2026-04-18):** These settings (apiMode, apiKey, model, seedWords, thinking mode + budget, processingMode, stallTimeout, reviewMode, volumeThreshold, batchSize, keywordScope, initialPrompt, primerPrompt) live ONLY in React component state inside `AutoAnalyze.tsx` before a run begins. **No standalone localStorage keys exist** for any of these — prior versions of this catalog claimed keys like `kst_aa_apikey`, `kst_aa_model`, `kst_aa_initial_prompt`, `kst_aa_primer_prompt`; those do not exist in the codebase (grep-verified 2026-04-18, zero matches).
- **After a run starts**, the `saveCheckpoint()` function bundles all settings into the `aa_checkpoint_{Project.id}` localStorage blob (see 5.9 below).
- **Practical UX implication:** If the user opens the Auto-Analyze panel, pastes prompts, configures settings, and then closes the browser or reloads the page WITHOUT starting a run, everything is lost. Tracked as a Phase 1-polish item (persist settings to `UserPreference`).
- **SHARED WITH:** N/A

### 5.9 Auto-Analyze checkpoint (localStorage)
- **HUMAN REF (PROVISIONAL):** "the auto-analyze progress" / "where I left off in auto-analyze"
- **TECHNICAL NAME (corrected 2026-04-18):** localStorage key `aa_checkpoint_{Project.id}` — **uses `Project.id`, NOT `ProjectWorkflow.id`.** The code is at line 227 of `AutoAnalyze.tsx`: `const cpKey = 'aa_checkpoint_' + projectId;` where `projectId` comes from `useParams()` which reads `Project.id` from the URL. Prior docs were wrong on this.
- **Content when populated:** full config (§5.8 fields), batches array, currentIdx, totalSpent, deltaMode, batchTier, elapsed seconds, logEntries.
- **Lifecycle:** Created on first `saveCheckpoint()` call during a run; updated after each batch; cleared on ✕ Cancel (via `handleCancel()` → `clearCheckpoint()`); restored on ▶ Resume via `handleResumeCheckpoint()`.
- **SHARED WITH:** N/A

### 5.10 Removed Terms (localStorage — ⚠️ currently lost on refresh)
- **HUMAN REF (PROVISIONAL):** "the removed terms" / "the archived keywords"
- **TECHNICAL NAME:** localStorage key `kst_rm` (migration to DB pending Phase 1-persist)
- **SHARED WITH:** TBD

### 5.11 Main Terms entries (localStorage — Phase 1-persist pending)
- **HUMAN REF (PROVISIONAL):** "the main terms" / "the MT entries"
- **TECHNICAL NAME:** localStorage key `kst_mt`
- **SHARED WITH:** TBD

### 5.12 Terms In Focus (session-only)
- **HUMAN REF (PROVISIONAL):** "the terms in focus" / "the TIF terms"
- **TECHNICAL NAME:** Session-only React state
- **SHARED WITH:** TBD

---

## 6. Future workflows — placeholder sections

Entries will be added during each workflow's Tool Graduation Ritual:

- 6.1 Competition Scraping & Deep Analysis
- 6.2 Therapeutic Strategy & Product Family Design
- 6.3 Brand Identity & IP
- 6.4 Conversion Funnel & Narrative Architecture
- 6.5 Content Development
- 6.6 Multi-Media Assets & App Development
- 6.7 Marketplace Optimization & Launch
- 6.8 Clinical Evidence & Endorsement
- 6.9 Therapeutic Engagement & Review Generation
- 6.10 Post-Launch Optimization
- 6.11 Compliance & Risk Mitigation
- 6.12 Exit Strategy & Portfolio Management
- 6.13 Analytics & System Administration
- 6.14 Business Operations

---

## 7. Shared Data Registry

Data items explicitly shared across workflows, with R/W flags per consumer.

### 7.1 Currently shared

**Project metadata (name, description)** — shared across all 14 workflows
- FROM: Project table (created on `/projects` page)
- TECHNICAL REFERENCE: `Project.name`, `Project.description`
- CONSUMING WORKFLOWS: All 14 — any workflow can read these to display project context
- R/W: READ-ONLY from within a specific workflow's tool (editing name/description happens on `/projects` page)

**ProjectWorkflow.lastActivityAt** — shared for aggregate "last activity" display
- FROM: Updated by any workflow's API on meaningful mutation (via `markWorkflowActive()` helper)
- TECHNICAL REFERENCE: `ProjectWorkflow.lastActivityAt`
- CONSUMING: `/projects` page (for "most recently worked on" sort)
- R/W: Write from individual workflow APIs; Read from /projects page

### 7.1.1 Planned Phase 2 shared items (NOT YET BUILT)

**Assignment** — shared across the platform
- FROM: Admin assignment UI (Phase 2, TBD)
- TECHNICAL REFERENCE: `Assignment` table
- CONSUMING: All workflow APIs (for permission filtering), worker dashboards, admin review dashboard
- R/W: Write = admin only; Read = admin (all), worker (their own assignments only)

**Assignment.reviewState** — shared
- FROM: Updated by worker "I'm done" action + admin review actions
- CONSUMING: Worker dashboard, admin review dashboard, workflow tool status indicators
- R/W: Worker can flip `in-progress` → `submitted-for-review`; admin can flip to `acceptable` or `revision-requested`; admin can reset submitted state

**ReviewNotes** — shared
- FROM: Admin review action
- CONSUMING: Worker UI (their revision context), admin history
- R/W: Admin write; worker read-only for their assignments

**AuditEvents** — shared (for workflows that opt in)
- FROM: Automatic emission from instrumented workflow mutations
- CONSUMING: Admin audit views; possibly worker "my history" views (TBD)
- R/W: System-write only; read by admin and possibly workers for their own events

**Workflow Deliverables** — shared across workflows
- FROM: Uploaded by the workflow that produces them
- CONSUMING: Downstream workflows (read-only typically), admin (full access)
- R/W: Per-workflow write policy; generally read-only downstream unless specific workflow designs otherwise

### 7.2 Decision criteria (for future entries)
When a new workflow needs data from upstream, Claude must ask the user:

1. **"Which data does [NEW WORKFLOW] need from [UPSTREAM WORKFLOW]?"**
2. **"Is this data read-only, or editable?"**
3. **"If editable, should edits in [NEW WORKFLOW] be visible to [UPSTREAM WORKFLOW]?"**
4. **"Edge cases or constraints?"**

Each entry format:
```
### [Data Item Name]
- FROM (upstream): [Workflow name]
- TECHNICAL REFERENCE: [table.field or computed path]
- CONSUMING WORKFLOWS:
  - [Workflow A]: READ-ONLY
  - [Workflow B]: READ-WRITE (edits sync back)
- EDGE CASES: [constraints]
- RATIONALE: [why this decision]
```

### 7.3 Maintenance
- New entries added during per-workflow design
- R/W flags updated if changed
- Never silently delete — mark `DEPRECATED` with date and reason

---

## 8. Cross-Chat Data Clarification Protocol (recap)

When Claude is unsure which data the user means:
1. Stop, identify ambiguity
2. Look up upstream tool's chat URL in `CHAT_REGISTRY.md`
3. Tell user: "Please open [URL]. Ask: '[precise question]'. Paste answer back."
4. Wait for user's return before proceeding

Every chat's Claude must be prepared to answer clarifying questions about data captured in its tool, using BOTH Human Reference and Technical name.

---

## 9. How to update this document

### When a new data item is captured
Add entry under appropriate workflow section. HUMAN REF, CAPTURED IN, TECHNICAL NAME at minimum. SHARED WITH = "TBD" until a downstream workflow consumes it.

### When a new workflow consumes upstream data
Add entries to Shared Data Registry (§7). Update upstream data's SHARED WITH and R/W DOWNSTREAM.

### When a workflow graduates
Complete Data Capture Interview with user. Finalize all provisional HUMAN REF values based on user input. Point CONTRACT DOC field to the newly-created Data Contract file.

### Iterative schema evolution (per PROJECT_CONTEXT.md §13)
When fields are added mid-development (the standard case), the new field must be documented here in the same chat it's added to the schema. This keeps the catalog in sync with reality.

### User's wording always wins over Claude's
If user's Human Reference is less technically precise, keep user's as primary. Note precise version in TECHNICAL NAME.

---

END OF DOCUMENT
