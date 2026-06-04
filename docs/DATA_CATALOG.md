# DATA CATALOG
## Master index of all data captured across the PLOS platform, with Human Reference Language

**Last updated:** 2026-06-04-b (W#1 H-1 slice 2 — the `AuditEvent` §4.10 event vocabulary EXTENDED: manual `source` is now LIVE (the keyword-clustering server mutation routes now record a user's hand edits, not just AI runs), and three new event types were added — `UPDATE_KEYWORD`, `ADD_PATHWAY`, `REMOVE_PATHWAY` (vocabulary length 16→19). Recording now spans AI runs (slice 1, via the client recorder) AND manual server-route edits (slice 2, via the NEW server-side recorder `src/lib/audit-recorder-server.ts`) — best-effort + POST-COMMIT so a recorder failure can never roll back a user's edit. **NO schema migration this session** (the table is unchanged; only more rows + more eventType values). No new data item — §4.10 entry extended in place. Prior: 2026-06-04 (W#1 H-1 slice 1 — the `AuditEvent` data item flipped from PLANNED to LIVE: W#1 (Keyword Clustering) is its FIRST consumer. The shared generic `AuditEvent` table — already in `prisma/schema.prisma` line 715 + the live DB since 2026-05-06 (commit `701775f`), UNUSED until now — now records W#1 action-history events with `workflowType='keyword-clustering'` and `payload` = `{source, action, op, before, after, batchId, seq, detail}`. AI-run recording shipped that session; manual-edit recording was queued. Read surface: GET `/api/projects/[projectId]/audit-events`. NO schema migration that session — the table pre-existed. Three Living Questions (Rule 7) answers folded into §4.10 below. See `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` H-1 + `docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md` §3.10. Prior: 2026-05-20-b (P-27 captured-videos design session — §7.2.2 W#2 row extended with NEW "Captured video library" output entry per `docs/CAPTURED_VIDEOS_DESIGN.md` §A.15 + §A.16 reciprocal output declaration; new `video-category` vocabulary type captured as upstream-input dependency (read by W#2 capture forms); anticipated downstream consumers W#4 Brand Identity (visual references) + W#6 Content Development (video inspiration) + W#7 Multi-Media Assets (style references) mirroring captured-image-library's downstream pattern. Three Living Questions (Rule 7) answers folded into the new entry: (i) upstream data needed = Project + Platform + CompetitorUrl + new `video-category` vocabulary; (ii) read-only by W#3+; (iii) N/A on edits-back. DOC-ONLY session — no schema this session; the actual `CapturedVideo` table + new `VideoSourceType` enum + new `video-category` value land at the future Build session #1 per design doc §A.2 implementation arc table. Schema-change-in-flight stayed "No" this session — design + DATA_CATALOG capture only; flips to "Yes" at next session start when P-27 Build #1 begins the `prisma db push`. NEW Group B design doc `docs/CAPTURED_VIDEOS_DESIGN.md` shipped 2026-05-20-b is the binding source for this DATA_CATALOG entry.)

**Previously updated:** 2026-05-15-b (W#2 P-29 Slice #1 BUILD session — `source` String column added to §6.1.1 + §6.1.3 + §6.1.4 wire-shape FIELDS lists; default `"extension"` so existing rows backfill via column default; closed-vocabulary `"extension" | "manual"` validated via `isSource` from shared-types. Captures the new audit-trail dimension that distinguishes Chrome-extension capture from vklf.com manual-add modal entry — per `COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-15 design entry Q3 outcome.)

**Previously updated:** May 12, 2026 (**W#1 Tool Graduation — Data Capture Interview executed.** §5 header retired the "all PROVISIONAL" framing; 11 entries (§5.1, §5.2, §5.2a, §5.3, §5.4, §5.5, §5.6, §5.7, §5.9, §5.11, §5.12) had Human Reference Language finalized in the live Data Capture Interview; entries §5.8 + §5.10 were already locked in earlier sessions. Every §5.x entry now carries a `CONTRACT DOC` pointer to `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2. §7.2.1 (W#1 Cross-Tool Data Flow Map row) updated from PROVISIONAL → FINAL with the 12 data items + downstream consumer table. §7.1 summary table updated to point at the finalized contract. Three NEW client-side-to-server-side migration items surfaced mid-interview (Main Terms, Terms In Focus, Auto-Analyze checkpoint) per director's standing 2026-05-08-c "pick up where you left off" principle; captured in `KEYWORD_CLUSTERING_POLISH_BACKLOG.md` §"Pending server-side migrations" — Data Contract v1 locks current localStorage technical names; future v2 ships when migrations complete per Rule 23 versioned-contract pattern.)
**Last updated in session:** session_2026-05-12_w1-graduation-ritual (Claude Code)
**Previously updated:** May 4, 2026 (W#2 Workflow Requirements Interview — provisional W#2 entries added to §6.1 (7 sub-sections covering competitor URL records, sizes/options, captured text, captured images, platform-shared vocabularies, highlight terms, worker assignments with platform sub-scope) + §7.2.2 W#2 row in Cross-Tool Data Flow Map filled in with reciprocal output declarations per Rule 18 + W#1-as-W#2-input speculation rejected. All entries provisional pending W#2 Tool Graduation; finalized HRL authored per Doc Architecture §5 at graduation time. Modified on `workflow-2-competition-scraping` feature branch per MULTI_WORKFLOW_PROTOCOL Rule 3 — only W#2-relevant additions, no W#1 sections touched.)
**Previously updated in session:** session_2026-05-04_w2-workflow-requirements-interview (Claude Code)
**Previously updated:** April 30, 2026 (Scale Session B — `CanvasNode` gains a third Pivot-era data item: `intentFingerprint` (Human Reference Language: "the topic's one-line searcher intent" / "the canonical phrase that captures who is searching and what they want"; format 5–15 words searcher-centric; NOT NULL after 3-step migration completed this session; live-backfilled across 37 Bursitis Test rows by `scripts/backfill-intent-fingerprints.ts`). Section 5.2 amended (FIELDS list extended); new section §5.2a added with full data-item record (format / validation / G3 guard / cross-reference). Foundation for Tiered Canvas Serialization (Sessions C/D/E pending).)
**Previously updated:** April 25, 2026 (Pivot Session B — `CanvasNode` gained `stableId` + `stabilityScore`; both backfilled across 104 Bursitis rows.)
**Last updated in session:** session_2026-04-25_phase1g-test-followup-part3-pivot-session-B (Claude Code)
**Previously updated in session:** session_2026-04-25_phase1g-test-followup-part3-session3b (Claude Code)
**Previously updated in session (earlier):** session_2026-04-24_phase1g-test-followup-part3-session3a (Claude Code)
**Previously updated:** April 18, 2026 (Phase 1g-test partial — corrected §5.8 and §5.9 Auto-Analyze drift)
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
- **HUMAN REF:** "the audit log" / "the action history" / "the history of changes" / "who did what"
- **CAPTURED IN:** Automatically emitted by workflow tools that opt into audit (Phase 2). **LIVE as of 2026-06-04 — W#1 (Keyword Clustering) is the FIRST consumer** (H-1 action history). W#1 records via TWO paths, NOT the library `useEmitAuditEvent()` hook (W#1 predates the library context): (1) AI runs — a best-effort batched CLIENT recorder POSTs to the keyword-clustering route (POST `/api/projects/[projectId]/audit-events`) [slice 1, 2026-06-04]; (2) MANUAL edits — a best-effort, POST-COMMIT SERVER-side recorder (`src/lib/audit-recorder-server.ts`) inserts directly inside the keyword-clustering server mutation routes, OUTSIDE the mutation transaction so a recorder failure can never roll back a user's edit [slice 2, 2026-06-04-b].
- **TECHNICAL NAME:** `AuditEvent` table — **EXISTS in `prisma/schema.prisma` (line 715) + the live DB** (added 2026-05-06, commit `701775f`, during a W#2 build slice; UNUSED until W#1 consumed it 2026-06-04). NO schema migration was needed at W#1 first-consume (the table pre-existed). Cross-ref `PLATFORM_ARCHITECTURE.md §13.3`.
- **FIELDS (7 columns, verified live via `information_schema`):** id, workflowType, projectId, userId, eventType, payload (JSON), createdAt (the original sketch's `timestamp` is `createdAt` as built). For W#1, `workflowType='keyword-clustering'` and `payload` = `{source, action, op, before, after, batchId, seq, detail}`.
- **W#1 EVENT VOCABULARY (`src/lib/audit-payload.ts`, 19 types as of slice 2):** the 13 operation-applier op types + 3 manual CREATE/DELETE/RESTORE_KEYWORD + 3 NEW (slice 2) `UPDATE_KEYWORD` / `ADD_PATHWAY` / `REMOVE_PATHWAY` (vocabulary length 16→19). AI-run recording = one batch per Auto-Analyze apply pass (best-effort, fire-and-forget) [slice 1]. Manual-edit recording is now LIVE at the server save-points (`canvas/nodes`, `keywords`, `keywords/[id]`, `removed-keywords`, `removed-keywords/[id]/restore`) via the pure `topicUpdateEvents()` (content/structure diff — SKIPS pure-layout x/y/w/h drags, folds reparent+reorder into one MOVE_TOPIC) + `keywordUpdateEvents()` (content diff — skips canvasLoc/topicApproved) [slice 2, 2026-06-04-b]. `canvas/sister-links` + `canvas/pathways` are wired FUTURE-PROOF (no client caller today — driven only by the AI rebuild pipeline). NOT recorded yet (candidate for a later slice): AI-sourced keyword archives (`auto-ai-detected-irrelevant` source on `removed-keywords` POST — slice 2 was manual-only scope).
- **READ SURFACE:** GET `/api/projects/[projectId]/audit-events` — recent history, newest-first (used for verification today + the future Action-History UI tab).
- **Three Living Questions (Rule 7) — W#1 `AuditEvent`:** (i) upstream data needed = Project + userId + the W#1 operation stream (op type, before/after topic state) — all already in-tool; no cross-workflow upstream read; (ii) read-only by any future consumer (Admin monitoring / per-workflow history views) — system-write only; (iii) N/A on edits-back (audit rows are append-only and never edited).
- **OPT-IN:** Per-workflow; declared at workflow design time per `PLATFORM_REQUIREMENTS.md §5`. W#1 opted in via H-1.
- **SHARED WITH:** Admin monitoring dashboards; per-workflow audit views; possibly exported for external analysis (all TBD/future — W#1 is currently the only writer + reader).

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

**Status:** ✅ FINALIZED 2026-05-12 — W#1 graduated per HANDOFF_PROTOCOL §4 Step 2 Scenario B. All Human Reference Language entries below are the canonical phrasings the director uses; every entry has a CONTRACT DOC pointer to `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2.

**Foreign key:** All KC data tables now reference `projectWorkflowId` (live as of Checkpoint 4). Pre-Phase M references to `projectId` are obsolete.

### 5.1 Keywords
- **HUMAN REF:** *"the keywords"* / *"the search terms"* / *"the list of keywords"* — all three are canonical equivalents (director confirmed 2026-05-12 graduation interview Cluster A.1)
- **CAPTURED IN:** Keyword Clustering → AST (All Search Terms) table via import, manual entry, or paste
- **TECHNICAL NAME:** `Keyword` table; foreign key `projectWorkflowId` (live)
- **CONTRACT DOC:** `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2 row #1
- **PER-KEYWORD FIELDS:** `keyword`, `volume`, `sortingStatus` (Unsorted/Partially Sorted/Completely Sorted/AI-Sorted/**Reshuffled** — last value added 2026-04-25 Session 3b; assigned by P3-F7 reconciliation pass when a keyword that was previously AI-Sorted is no longer linked to any topic on the canvas after a batch-rebuild; surfaced as a yellow badge in the AST so admin can spot the alarm; auto-eligible for re-placement under Auto-Analyze's default scope), `tags`, `topic`, `canvasLoc`, `topicApproved`
- **SHARED WITH:** TBD — likely Content Development, Conversion Funnel, Marketplace Optimization
- **R/W DOWNSTREAM:** TBD at per-workflow design time

### 5.2 Topics (Canvas Nodes)
- **HUMAN REF:** *"the topics"* / *"the topic nodes"* / *"the mindmap topics"* / *"nodes"* / *"boxes"* — all five are canonical equivalents (director confirmed 2026-05-12 graduation interview Cluster A.2; "nodes" + "boxes" newly captured this session)
- **CAPTURED IN:** Canvas (Mindmap or Table mode) → Node creation / Edit Panel
- **TECHNICAL NAME:** `CanvasNode` table; foreign key `projectWorkflowId` (live)
- **CONTRACT DOC:** `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2 row #2
- **FIELDS:** `title`, `description`, `altTitles`, `parentId`, `pathwayId`, `relationshipType`, `narrativeBridge`, `linkedKwIds`, `kwPlacements`, position/size, collapse states, `stableId` (Pivot B), `stabilityScore` (Pivot B), `intentFingerprint` (Scale Session B)
- **SHARED WITH:** TBD — highly likely Conversion Funnel, Content Development
- **R/W DOWNSTREAM:** TBD

### 5.2a Topic Intent Fingerprint (NEW 2026-04-30 — Scale Session B)
- **HUMAN REF:** *"searcher intent"* — canonical conversational form (director confirmed 2026-05-12 graduation interview Cluster A.3; the prior PROVISIONAL long-form descriptions *"the topic's one-line searcher intent"* and *"the canonical phrase that captures who is searching for this topic and what they want"* are retired)
- **CAPTURED IN:** AI emits via `intent_fingerprint` field on `ADD_TOPIC` / `UPDATE_TOPIC_TITLE` / `UPDATE_TOPIC_DESCRIPTION` (optional) ops + `merged_intent_fingerprint` on `MERGE_TOPICS` + `intent_fingerprint` per `into[]` entry on `SPLIT_TOPIC` — once V4 prompts ship in Scale Session D. Until then, populated via the AI-driven backfill script `scripts/backfill-intent-fingerprints.ts` (one-time per project) + the `''` placeholder default that future non-AI canvas-node creates supply.
- **CONTRACT DOC:** `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2 row #2a
- **TECHNICAL NAME:** `CanvasNode.intentFingerprint String NOT NULL` (added 2026-04-30 via 3-step migration)
- **FORMAT:** Short canonical phrase, 5–15 words, in searcher-centric language. Example: *"Older bursitis sufferers seeking gentle, low-cost home relief."* (Scale Session B live backfill produced 11–13 word phrases on Sonnet 4.6.)
- **VALIDATION:**
  - Server-side G3 guard at `/canvas/nodes` PATCH + `/canvas/rebuild` rejects empty/whitespace fingerprints with HTTP 400 — applies whenever the client explicitly includes the field in an update.
  - Operation applier (`src/lib/operation-applier.ts`) `validateOptionalFingerprint` rejects empty/whitespace strings when supplied on AI ops; absence is permitted in Session B (Session D will tighten to required).
  - Wiring layer (`src/lib/auto-analyze-v3.ts`) omits the field from rebuild payload when the applier's value is empty — prevents G3 false-positive on transient empty values mid-batch.
- **SHARED WITH:** Tier serializer (Scale Session C onward — load-bearing for Tier 1 compressed serialization where the full keyword list is dropped); Reevaluation Pass 3a (intent-equivalence detection across canvas via fingerprints alone — Scale Session D).
- **R/W DOWNSTREAM:** TBD per Sessions C–E.
- **CROSS-REFERENCE:** `INPUT_CONTEXT_SCALING_DESIGN.md` §1.2 (definition + format + who-writes-it) + §6 Scale Session B (build spec) + `KEYWORD_CLUSTERING_ACTIVE.md` POST-2026-04-30-SCALE-SESSION-B STATE block (live shipped state) + `DEFENSE_IN_DEPTH_AUDIT_DESIGN.md` §5.4 (G3 guard).

### 5.3 Primary Keywords in a Topic
- **HUMAN REF:** *"Primary Keywords"* — canonical (capital P, capital K). Director confirmed 2026-05-12 graduation interview Cluster A.4 that *"Primaries"* shorthand is NOT used; the prior PROVISIONAL alternative phrasings *"the bold keywords"* / *"the main keywords under a node"* are descriptive but secondary.
- **TECHNICAL NAME:** Keyword IDs where `CanvasNode.kwPlacements[keywordId] === 'p'`
- **CONTRACT DOC:** `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2 row #3
- **DISPLAY:** Bold dark text on canvas
- **SHARED WITH:** TBD

### 5.4 Secondary Keywords in a Topic
- **HUMAN REF:** *"Secondary Keywords"* — canonical (capital S, capital K). Director confirmed 2026-05-12 graduation interview Cluster A.5 that *"Secondaries"* shorthand is NOT used; the prior PROVISIONAL alternative phrasing *"the italic purple keywords"* is descriptive but secondary.
- **TECHNICAL NAME:** Keyword IDs where `CanvasNode.kwPlacements[keywordId] === 's'`
- **CONTRACT DOC:** `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2 row #4
- **DISPLAY:** Italic purple text on canvas
- **SHARED WITH:** TBD

### 5.5 Pathways
- **HUMAN REF:** *"pathways"* / *"conversion pathways"* — both canonical equivalents (director confirmed 2026-05-12 graduation interview Cluster B.1)
- **TECHNICAL NAME:** `Pathway` table (id, projectWorkflowId)
- **CONTRACT DOC:** `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2 row #5
- **SHARED WITH:** TBD — likely Conversion Funnel

### 5.6 Sister Links
- **HUMAN REF:** *"sister links"* / *"deferred sister links"* — both canonical equivalents (director confirmed 2026-05-12 graduation interview Cluster B.2; "deferred sister links" reflects the post-2026-05-05-b Option A invisibility cleanup where the consolidation model no longer sees them). The prior PROVISIONAL alternative *"the purple dashed lines between topics"* is descriptive but secondary.
- **TECHNICAL NAME:** `SisterLink` table (nodeA, nodeB, projectWorkflowId)
- **CONTRACT DOC:** `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2 row #6
- **DISPLAY:** Dashed purple lines between canvas nodes
- **SHARED WITH:** DEFERRED — managed by future second-pass functionality run, not first-pass Auto-Analyze. Existing sister links persist as canvas data; new sister-link emission is invisible to the consolidation model.

### 5.7 Canvas State
- **HUMAN REF:** *"where the canvas is"* — canonical conversational form for the reload-position state (director confirmed 2026-05-12 graduation interview Cluster B.3). The prior PROVISIONAL phrasings *"the canvas viewport"* / *"the zoom level"* were over-techy descriptions, retired.
- **TECHNICAL NAME:** `CanvasState` table (viewX, viewY, zoom, nextNodeId, nextPathwayId, projectWorkflowId unique)
- **CONTRACT DOC:** `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2 row #7
- **SHARED WITH:** N/A (UI viewport state, per-(user, project-workflow))

### 5.8 Auto-Analyze config + prompts (DB-backed via UserPreference + apiKey-in-localStorage split — fixed 2026-04-24 Session 3a)
- **HUMAN REF:** *"the auto-analyze settings"* / *"the AI prompts"* / *"the seed words"* / *"my Anthropic key"* (LOCKED 2026-04-24 Session 3a; confirmed unchanged in 2026-05-12 graduation interview — no Cluster question needed)
- **CONTRACT DOC:** `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2 row #8
- **TECHNICAL REALITY (Session 3a):** Settings auto-save 800ms after any change in `AutoAnalyze.tsx` and load on panel mount. Two storage paths split for security:
  - **`apiKey`** — browser `localStorage` key `aa_apikey_{projectId}`. Per-browser, per-project. Never sent to our DB to avoid storing the user's Anthropic secret in plain-text Postgres. **2026-05-12 graduation interview decision:** this remains the deliberate exception to the platform's standing "pick up where you left off" principle (2026-05-08-c) — server-side storage of a user's third-party secret is a meaningful security delta.
  - **All other settings** (apiMode, model, seedWords, volumeThreshold, batchSize, processingMode, thinkingMode, thinkingBudget, keywordScope, stallTimeout, reviewMode, initialPrompt, primerPrompt) — single JSON blob stored in existing `UserPreference` table at key `aa_settings_{projectId}` via `PUT /api/user-preferences/aa_settings_{projectId}`. Per-user-per-project. Syncs across devices.
- **Hydration on mount:** GET reads both paths in parallel; missing values fall back to hardcoded defaults; `settingsLoaded` flag prevents the auto-save useEffect from overwriting fresh-loaded values with stale React-default values during the initial render.
- **HISTORY:** Pre-2026-04-24 was ephemeral React state — settings reset on every page refresh. Director's "Phase 1-polish: persist Auto-Analyze settings in UserPreference" item shipped this session.
- **SHARED WITH:** N/A

### 5.9 Auto-Analyze checkpoint (localStorage today — server-side migration pending)
- **HUMAN REF:** *"the auto-analyze progress"* / *"where I left off in auto-analyze"* / *"the checkpoint"* / *"the saved run"* — all four are canonical equivalents (director confirmed 2026-05-12 graduation interview Cluster B.4; *"the checkpoint"* and *"the saved run"* newly captured this session)
- **CONTRACT DOC:** `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2 row #9
- **🟡 PENDING SERVER-SIDE MIGRATION:** captured 2026-05-12 graduation interview. Today's localStorage path means a paused run can't be Resumed from a different browser/device. Migration scope: schema (`AutoAnalyzeCheckpoint` table OR extend `UserPreference`), API, AutoAnalyze.tsx Resume-detection wiring, localStorage → DB one-time backfill. ~1–2 sessions estimated. On ship, Data Contract bumps to v2 per Rule 23. See `KEYWORD_CLUSTERING_POLISH_BACKLOG.md` §"Pending server-side migrations".
- **TECHNICAL NAME (today; corrected 2026-04-18):** localStorage key `aa_checkpoint_{Project.id}` — **uses `Project.id`, NOT `ProjectWorkflow.id`.** The code is at line 227 of `AutoAnalyze.tsx`: `const cpKey = 'aa_checkpoint_' + projectId;` where `projectId` comes from `useParams()` which reads `Project.id` from the URL. Prior docs were wrong on this.
- **Content when populated:** full config (§5.8 fields), batches array, currentIdx, totalSpent, deltaMode, batchTier, elapsed seconds, logEntries.
- **Lifecycle:** Created on first `saveCheckpoint()` call during a run; updated after each batch; cleared on ✕ Cancel (via `handleCancel()` → `clearCheckpoint()`); restored on ▶ Resume via `handleResumeCheckpoint()`.
- **SHARED WITH:** N/A

### 5.10 Removed Terms (DB-backed soft archive — fixed 2026-04-24 Session 3a)
- **HUMAN REF:** *"the removed terms"* / *"the archived keywords"* / *"the trash"* (Modal labels them "🗑 Removed Terms") — LOCKED 2026-04-24; confirmed unchanged in 2026-05-12 graduation interview — no Cluster question needed
- **CONTRACT DOC:** `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2 row #10
- **TECHNICAL NAME:** Prisma model `RemovedKeyword`. FK to `ProjectWorkflow`. Fields: `id, projectWorkflowId, originalKeywordId (nullable), keyword, volume, sortingStatus, tags, topic, canvasLoc, removedAt, removedBy (userId), removedSource ('manual' | 'auto-ai-detected-irrelevant'), aiReasoning (nullable Text)`. Read via `GET /api/projects/[projectId]/removed-keywords`; written via `POST .../removed-keywords` (transactional copy-then-delete) and `POST .../removed-keywords/[removedId]/restore` (transactional reverse).
- **PERSISTENCE:** Database. Survives page refresh, syncs across devices (per-ProjectWorkflow scope).
- **SHARED WITH:** Future Auto-Analyze salvage mechanism (Session 3b) writes here with `removedSource='auto-ai-detected-irrelevant'`. Future Auto-Remove BUTTON (deferred per director) would also write here.
- **HISTORY:** Pre-2026-04-24 was localStorage-only (key `kst_rm`); UI showed an empty list on every page refresh and the underlying delete actually hard-deleted the Keyword row. Director caught the bug in Session 2; fix shipped Session 3a as Option B (per-ProjectWorkflow DB table).

### 5.11 Main Terms (localStorage today — server-side migration pending)
- **HUMAN REF:** *"Main Terms"* — canonical (capital M, capital T). Director confirmed 2026-05-12 graduation interview Cluster C.1 that *"MT entries"* is NOT a thing — that prior PROVISIONAL phrasing is RETIRED.
- **CONTRACT DOC:** `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2 row #11
- **🟡 PENDING SERVER-SIDE MIGRATION:** captured 2026-05-12 graduation interview. Director: *"We want nothing stored locally and this functionality should have been moved server side."* Today's localStorage path violates the platform-standing 2026-05-08-c "pick up where you left off" principle. Migration scope: new `MainTerm` table FK'd to ProjectWorkflow OR extend `Keyword` with a `isMainTerm` flag; API; AutoAnalyze.tsx wiring; localStorage → DB one-time backfill. ~1–2 sessions estimated. On ship, Data Contract bumps to v2 per Rule 23. See `KEYWORD_CLUSTERING_POLISH_BACKLOG.md` §"Pending server-side migrations".
- **TECHNICAL NAME (today):** localStorage key `kst_mt`
- **SHARED WITH:** TBD

### 5.12 Terms In Focus (session-only React state today — server-side migration pending)
- **HUMAN REF:** *"Terms In Focus"* — canonical (capital T, capital I, capital F). Director confirmed 2026-05-12 graduation interview Cluster C.2 that *"TIF terms"* is NOT a real spoken shorthand — that prior PROVISIONAL phrasing is RETIRED.
- **CONTRACT DOC:** `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2 row #12
- **🟡 PENDING SERVER-SIDE MIGRATION:** captured 2026-05-12 graduation interview. Today's session-only React state clears on every page refresh — the worst of the three pending migrations because nothing is preserved across reloads. Migration scope: new `TermInFocus` table FK'd to ProjectWorkflow + API + AutoAnalyze.tsx wiring; no localStorage backfill needed (session-only state has nothing to migrate). ~1 session estimated, lightest of the three. On ship, Data Contract bumps to v2 per Rule 23. See `KEYWORD_CLUSTERING_POLISH_BACKLOG.md` §"Pending server-side migrations".
- **TECHNICAL NAME (today):** Session-only React state
- **SHARED WITH:** TBD

---

## 6. Future workflows — placeholder sections

Entries will be added during each workflow's Tool Graduation Ritual:

### 6.1 Competition Scraping & Deep Analysis (W#2) — provisional, captured at Workflow Requirements Interview 2026-05-04 + refined at Stack-and-Architecture 2026-05-04

**Status:** ✅ SHIPPED + LIVE (schema built 2026-05-06; live on vklf.com) — **W#2 GRADUATED 2026-06-03 (continuity-first, HANDOFF_PROTOCOL Rule 33).** The shipped Prisma schema (`prisma/schema.prisma`: `CompetitorUrl`, `CapturedText` / `CapturedImage` / `CapturedVideo`, `CapturedReview`, `ReviewAnalysis`, `ComprehensiveCompetitorAnalysis`, `UserTablePreferences`, `ProjectTablePreferences`, `CategoryDefault`) is the AUTHORITATIVE source of truth — read the code over any doc claim (Rule 3). The entries below remain PROVISIONAL on **finalized Human Reference Language**, and the per-downstream R/W flags are still TBD: by director pick 2026-06-03 the finalized-HRL **Data Capture Interview + the `COMPETITION_SCRAPING_DATA_CONTRACT.md` split are DEFERRED until W#3 starts and discovers a need to read W#2 data** (DOCUMENTATION_ARCHITECTURE §4 "create the Data Contract on downstream need"; see `docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` §4). Original frozen schema spec: `COMPETITION_SCRAPING_STACK_DECISIONS.md §9` (FROZEN 2026-05-04).

**Source-of-truth docs (in order):**
1. `docs/COMPETITION_SCRAPING_STACK_DECISIONS.md` §9 — schema spec (FROZEN 2026-05-04).
2. `docs/COMPETITION_SCRAPING_DESIGN.md` §A (frozen 2026-05-04) — Workflow Requirements Interview answers + UX shape.
3. `docs/COMPETITION_SCRAPING_DESIGN.md` §B (append-only) — in-flight refinements.

**Cross-references:** `PLATFORM_REQUIREMENTS.md §2.2.1` (4-way assignment with platform sub-scope), `§6.6` (cross-workflow data permissions per-(workflow, data-item) granular), `§8.4` (platform-shared vocabularies), `§10.1` (non-web-app client / Chrome extension; auth resolved 2026-05-04 to direct `signInWithPassword`), `§10.1.1` (NEW 2026-05-04 — non-web-app client sync-reliability requirements promoted from W#2 design), `§10.2` (image-storage projections), `§12.6` (scaffold extension-points).

#### 6.1.1 Competitor URL record (provisional)
- **HUMAN REF (PROVISIONAL):** "the competitor list" / "captured competitor URLs" / "the competition table"
- **CAPTURED IN:** Chrome extension Module 1 (Competition Identification) → write-through to PLOS via API; viewable + editable in PLOS at `/projects/[projectId]/competition-scraping`
- **TECHNICAL NAME:** `competitor_url` table (NOT YET BUILT — schema-design pending Stack-and-Architecture session)
- **FIELDS (provisional):**
  - `id` — UUID, primary key (client-generated for idempotency)
  - `projectId` — FK to Project
  - `platform` — String column (NOT a Prisma enum): `"amazon" | "ebay" | "etsy" | "walmart" | "google-shopping" | "google-ads" | "independent-website"` — per `prisma/schema.prisma:257` comment + `src/lib/shared-types/competition-scraping.ts` `PLATFORMS` const (canonical). DRIFT-FIXED 2026-05-15 (was incorrectly framed as a Prisma enum with underscored values; corrected to match code per Rule 3).
  - `url` — String, the competitor URL (editable)
  - `competitionCategory` — String, FK to vocabulary (e.g., "device", "topical product", "supplement")
  - `productName` — String, FK to vocabulary
  - `brandName` — String, FK to vocabulary
  - `resultsPageRank` — Integer, nullable
  - `productStarRating` — Float, nullable (Amazon/Ebay/Walmart only)
  - `sellerStarRating` — Float, nullable (Etsy only)
  - `productReviewsCount` — Integer, nullable
  - `sellerReviewsCount` — Integer, nullable
  - `customFields` — JSON, nullable (for "Add new product-associated category" custom fields like "Country of Manufacturing")
  - `source` — String, NOT NULL, default `"extension"`. Closed vocabulary `"extension" | "manual"` enforced at the wire boundary via `isSource` (per `src/lib/shared-types/competition-scraping.ts`). Distinguishes Chrome-extension capture from vklf.com manual-add modal entry. NEW 2026-05-15-b — P-29 Slice #1.
  - `createdByUserId`, `createdAt`, `updatedAt` — provenance + timestamps
  - **Constraint:** unique on `(projectId, platform, url)` — prevents duplicate captures
- **SHARED WITH (provisional):** W#3, W#5, W#6, W#9, W#11
- **R/W DOWNSTREAM:** TBD per each consumer's design interview — director's directive 2026-05-04 was "shared as per workflow" with default-to-editable rather than default-to-read-only

#### 6.1.2 Competitor product Size/Option (provisional)
- **HUMAN REF (PROVISIONAL):** "the size" / "the option" / "size/option"
- **CAPTURED IN:** Same as 6.1.1; sub-record under a competitor URL
- **TECHNICAL NAME:** `competitor_product_size_option` table (NOT YET BUILT)
- **FIELDS (provisional):**
  - `id` — UUID, primary key
  - `competitorUrlId` — FK to competitor_url
  - `label` — String (e.g., "Large", "12oz", "Pack of 6")
  - `price` — Decimal
  - `shippingCost` — Decimal, nullable
  - `customFields` — JSON, nullable (for "Add new product-Size/Option-associated category" like "Customizations for extra-large bottles")
  - timestamps
- **CONSTRAINT:** Multiple sizes per competitor URL allowed
- **SHARED WITH (provisional):** Same as 6.1.1

#### 6.1.3 Captured text row (provisional)
- **HUMAN REF (PROVISIONAL):** "the captured text" / "scraped text" / "the text rows"
- **CAPTURED IN:** Chrome extension Module 2 (Competition Data Scraping) — text highlight + add-text gesture OR paste-into-extension; viewable + editable in PLOS
- **TECHNICAL NAME:** `captured_text` table (NOT YET BUILT)
- **FIELDS (provisional):**
  - `id` — UUID, primary key
  - `competitorUrlId` — FK to competitor_url
  - `contentCategory` — String, FK to vocabulary (e.g., "Amazon Title", "Amazon Bullet Point")
  - `text` — String (long; the captured text)
  - `tags` — String[] (arbitrary text tags)
  - `displayOrder` — Integer (user-reorderable)
  - `source` — String, NOT NULL, default `"extension"`. Closed vocabulary `"extension" | "manual"`. NEW 2026-05-15-b — P-29 Slice #1 (Slice #2 wires the vklf.com manual-add text modal that emits `source="manual"`).
  - timestamps + provenance
- **VOLUME EXPECTATION:** ~5,000 rows per Project (per A.3 estimate)
- **SHARED WITH (provisional):** W#3, W#5, W#6, W#9, W#10
- **R/W DOWNSTREAM:** TBD

#### 6.1.4 Captured image record (provisional)
- **HUMAN REF (PROVISIONAL):** "the captured images" / "scraped images" / "the image library"
- **CAPTURED IN:** Chrome extension Module 2 — right-click save (regular image) OR region-screenshot mode (A+ content modules); viewable in PLOS as thumbnails, expandable
- **TECHNICAL NAME:** `captured_image` table (NOT YET BUILT) + Supabase Storage bucket `competition-scraping`
- **FIELDS (provisional):**
  - `id` — UUID, primary key
  - `competitorUrlId` — FK to competitor_url
  - `imageCategory` — String, FK to vocabulary (e.g., "Product Listing Image", "Amazon A+ Content Module")
  - `imageType` — Enum: `"regular" | "region_screenshot"`
  - `storageUrl` — String (Supabase Storage signed URL or path)
  - `composition` — String, nullable (manual now; future AI auto-fill via vision model)
  - `embeddedText` — String, nullable (for A+ content; manual now; future AI auto-fill via OCR)
  - `tags` — String[]
  - `displayOrder` — Integer
  - `widthPx`, `heightPx`, `sizeBytes` — Integer (for storage analytics)
  - `source` — String, NOT NULL, default `"extension"`. Closed vocabulary `"extension" | "manual"`. NEW 2026-05-15-b — P-29 Slice #1 (Slice #3 wires the vklf.com manual-add image modal with drag-drop + paste + URL-of-image input modalities). DISTINCT from `imageType` (`"regular" | "region_screenshot"`) which describes the IMAGE's content shape; `source` describes WHICH CLIENT created the row.
  - timestamps + provenance
- **VOLUME EXPECTATION:** ~300 images per Project (per A.3); ~500 KB average → ~500 GB/yr Phase 3, ~1 TB/yr Phase 4
- **SHARED WITH (provisional):** W#4, W#6, W#7
- **R/W DOWNSTREAM:** TBD

#### 6.1.5 Project-scoped vocabularies (NOT W#2-owned — platform-shared per §8.4)
- **HUMAN REF (PROVISIONAL):** "the categories" / "the brand list" / "the product list" / "the content categories"
- **CAPTURED IN:** First created in W#2 Module 1 (Competition Categories, Product Names, Brand Names, Size/Option labels) and Module 2 (Content Categories, Image Categories); also extensible by other workflows on the same Project per `PLATFORM_REQUIREMENTS.md §8.4`
- **TECHNICAL NAME:** `vocabulary` table (NOT YET BUILT — single shared table OR per-vocabulary-type tables; choice deferred to first-build session)
- **FIELDS (provisional):**
  - `id` — UUID, primary key
  - `projectId` — FK to Project (vocabularies are Project-scoped, NOT workflow-scoped)
  - `vocabularyType` — String, e.g., `"competition_category" | "product_name" | "brand_name" | "size_option" | "content_category" | "image_category"`
  - `value` — String (the actual term)
  - `createdByWorkflow` — String (which workflow first added it)
  - `createdByUserId` — FK to User
  - `deletedAt` — Timestamp, nullable (soft-delete; vocabulary entries reference into other tables, so hard-delete causes referential issues)
  - timestamps
- **CONSTRAINT:** Unique on `(projectId, vocabularyType, value)` — case-insensitive
- **SHARED WITH:** ANY workflow on the same Project (READ + ADD)
- **R/W DOWNSTREAM:** READ-WRITE (any workflow on the same Project can ADD entries; only the original creator or admin can soft-delete)

#### 6.1.6 Highlight Terms with colors (server-stored; cross-device persisted) — DECISION RESOLVED 2026-05-10
- **HUMAN REF (PROVISIONAL):** "the highlight terms" / "the highlight colors"
- **CAPTURED IN:** Chrome extension Module 1 setup (popup picker pair)
- **TECHNICAL NAME:** `UserProjectHighlightTerm` table (per-(user, project, term)), one row per term. Server-side authoritative; chrome.storage.local is per-installation MIRROR cache.
- **DECISION:** server-stored — director's standing principle "no matter where the user logs in, they can pick up where they left off" (captured 2026-05-08-c) drove the call. Shipped + browser-verified cross-device 2026-05-10-b.
- **FIELDS:**
  - `id` String @id @default(uuid)
  - `userId` String
  - `projectId` String
  - `term` String
  - `color` String (7-char hex from §6 20-color palette)
  - `sortOrder` Int @default(0)
  - `createdAt`, `updatedAt` DateTime
  - `@@unique([userId, projectId, term])` + `@@index([userId, projectId])`
- **API:** GET + PUT at `/api/projects/[projectId]/extension-state/highlight-terms` (verifyProjectAuth-scoped; PUT is replace-whole-list inside one $transaction).
- **SHARED WITH:** Self-only (this user's extension); not shared cross-workflow.

#### 6.1.7 Worker assignment with platform sub-scope (Phase 2+)
- **HUMAN REF (PROVISIONAL):** "the assignment" / "Sarah is assigned to Amazon for Project X"
- **CAPTURED IN:** Phase-2 admin assignment UI in PLOS
- **TECHNICAL NAME:** `Assignment` table (Phase-2 platform-wide; W#2 populates `subScope` column with platform name per `PLATFORM_REQUIREMENTS.md §2.2.1`)
- **FIELDS (provisional, when Assignment table is built in Phase 2):**
  - `id`, `userId`, `workflow`, `projectId`, `subScope` (String, nullable; W#2 uses platform name), `status` (per Phase-2 review-cycle states OR W#2's simplified `assigned | in-progress | completed`), timestamps
- **CONSTRAINT:** Unique on `(workflow, projectId, subScope)` — enforces "one worker per (Project, platform)" for W#2

#### 6.1.8 Selected Project + Selected Platform (extension setup picks; server-stored; cross-device persisted) — DECISION RESOLVED 2026-05-10-e
- **HUMAN REF (PROVISIONAL):** "the project the user is currently capturing for" + "the platform the user is currently capturing from"
- **CAPTURED IN:** Chrome extension popup setup screen (`ProjectPicker` + `PlatformPicker`)
- **TECHNICAL NAME:** `UserExtensionState` table (one row per user). Server-side authoritative; chrome.storage.local is per-installation MIRROR cache (read by content-script orchestrator on every page load — content scripts can't reach vklf.com directly per CORS allowlist).
- **DECISION:** server-stored — extends the same "no matter where the user logs in, they can pick up where they left off" principle that drove §6.1.6. Schema-shape decision per Rule 18 mid-build Read-It-Back: single record-type with two scalar columns per user (preserves today's chrome.storage.local behavior 1:1 — switching project still clears platform). Shipped at code level 2026-05-10-e on `workflow-2-competition-scraping`; browser-verify pending next W#2 → main deploy session.
- **FIELDS:**
  - `id` String @id @default(uuid)
  - `userId` String @unique  (one row per user)
  - `selectedProjectId` String? (nullable — user has not picked yet, OR cleared)
  - `selectedPlatform` String? (nullable — same; one of the W#2 platform vocabulary values when set)
  - `updatedAt` DateTime
  - `@@index([userId])`
- **API:** GET + PUT at `/api/extension-state` (verifyAuth-scoped, NOT verifyProjectAuth — this is user-scoped state, not project-scoped). PUT is replace-whole-state with refined "switching project clears platform" invariant: server clears platform when (a) incoming projectId is null OR (b) prior projectId is non-null AND differs from incoming. Migration case preserved (prior null + incoming both → no clear). Project-ownership double-check on PUT for non-null selectedProjectId.
- **SHARED WITH:** Self-only (this user's extension); not shared cross-workflow.

- 6.2 Therapeutic Strategy & Product Family Design
- 6.3 Brand Identity & IP
- 6.4 Conversion Funnel & Narrative Architecture
  - **Forward-pointer (captured 2026-04-26):** see `ROADMAP.md` Workflow #5 entry — narrative-driven comprehensiveness is a first-class W#5 directive. Per `HANDOFF_PROTOCOL.md` Rule 21, the W#5 design session must surface this directive at interview start.
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

## 7. Cross-Tool Data Flow Map (PROMOTED 2026-04-26 from "Shared Data Registry")

This map is the central reference for cross-workflow data integration. Every workflow tool declares (a) what it READS from upstream workflows and (b) what it PRODUCES for downstream workflows. As tools graduate, their entries move from PROVISIONAL to finalized.

The Map is an always-loaded index that points OUT to per-tool Data Contracts for full detail. It stays lean by being a router, not a destination.

**Load-bearing roles:**
- Per `HANDOFF_PROTOCOL.md` Rule 18 reciprocal output declarations, every Workflow Requirements Interview adds entries here for the new tool's row (produced data) AND column (read upstream data).
- Per `HANDOFF_PROTOCOL.md` Rule 23 (Change Impact Audit), this Map is the load-bearing lookup mechanism for cascade-prevention before any change to a graduated tool. Every audit consults the Map first.
- Per Tool Graduation Ritual (`HANDOFF_PROTOCOL.md` §4 Step 2 Scenario B), the Map is updated as part of the graduation deliverables stack.

### 7.1 Summary table — what's shared today

| Producer | Data item | Consumer(s) | R/W | Status |
|---|---|---|---|---|
| Project record | `Project.name`, `Project.description` | All 14 workflows | READ-ONLY (edit on `/projects` page only) | LIVE |
| All workflows | `ProjectWorkflow.lastActivityAt` | `/projects` page (sort-by-last-activity) | WRITE from workflow APIs; READ from `/projects` page | LIVE |
| Workflow #1 (Keyword Clustering) | 12 data items (Keywords, Topics, Topic Intent Fingerprint, Primary/Secondary Keywords, Pathways, Sister Links, Canvas State, Auto-Analyze settings, Auto-Analyze checkpoint, Removed Terms, Main Terms, Terms In Focus) — see `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2 | W#5 confirmed bidirectional (read topic hierarchy + write narrative-bridge topics); W#2 confirmed reads-nothing; W#3/W#4/W#6/W#7 likely-readers per ROADMAP; W#8–W#14 TBD per interview | per-consumer at consumer's design interview | ✅ FINAL — Data Contract v1 ratified 2026-05-12 — see §7.2.1 |

### 7.2 Per-tool detail (filled in as workflows graduate / get designed)

#### 7.2.1 Workflow #1 — Keyword Clustering

**Status:** ✅ GRADUATED 2026-05-12. Data Contract v1 ratified — see `KEYWORD_CLUSTERING_DATA_CONTRACT.md`. Production-Readiness Gate met at 5 of 6 prereqs ✅ VERIFIED LIVE; prereq #1 (cold-start banner UI) 🟡 PARTIAL — happy-path verified, banner code covered by unit tests + code review, natural-flake confirmation engineered close to never-fires.

**Produces (finalized per Rule 18 reciprocal output declarations at 2026-05-12 graduation Data Capture Interview — 12 items; full detail in `KEYWORD_CLUSTERING_DATA_CONTRACT.md` §2):**

- *"the keywords"* / *"the search terms"* (`Keyword` table) — the AST rows with volume, sortingStatus, tags, topic placement
- *"the topics"* / *"the nodes"* / *"the boxes"* (`CanvasNode` table) — the structured conversion-funnel topic hierarchy with stable IDs, stability scores, intent fingerprints
- *"searcher intent"* (`CanvasNode.intentFingerprint`) — 5–15-word searcher-centric phrase per topic; load-bearing for tiered serialization + cross-canvas intent-equivalence detection
- *"Primary Keywords"* + *"Secondary Keywords"* (`CanvasNode.kwPlacements`) — per-topic keyword classification (bold dark text vs. italic purple text)
- *"pathways"* / *"conversion pathways"* (`Pathway` table) — conversion pathways through the canvas
- *"sister links"* / *"deferred sister links"* (`SisterLink` table) — cross-cutting topic relationships; managed by future second-pass functionality run, invisible to first-pass Auto-Analyze consolidation per 2026-05-05-b Option A cleanup
- *"the removed terms"* / *"the archived keywords"* / *"the trash"* (`RemovedKeyword` table) — soft-archived irrelevant keywords with `removedSource` + `aiReasoning`
- *"where the canvas is"* (`CanvasState` table) — UI viewport state, per-(user, project-workflow)
- *"the auto-analyze settings"* / *"the AI prompts"* / *"my Anthropic key"* (`UserPreference` table + `localStorage` for apiKey only)
- *"the auto-analyze progress"* / *"the checkpoint"* / *"the saved run"* (`localStorage aa_checkpoint_*` — pending server-side migration per Polish Backlog)
- *"Main Terms"* (`localStorage kst_mt` — pending server-side migration per Polish Backlog)
- *"Terms In Focus"* (session-only React state — pending server-side migration per Polish Backlog)

**Anticipated downstream consumers (per `PROJECT_CONTEXT.md` §2; specific R/W flags decided per-consumer at consumer's design interview):**

- Workflow #2 (Competition Scraping) — ✅ DECIDED at W#2 interview 2026-05-04: **W#2 reads NOTHING from W#1** (W#2 is fully self-contained input-wise).
- Workflow #3 (Therapeutic Strategy) — likely reads per-topic primary keywords to inform product family architecture. R/W TBD.
- Workflow #4 (Brand Identity) — likely reads searcher-centric topic titles to inform brand-language alignment. R/W TBD.
- Workflow #5 (Conversion Funnel & Narrative Architecture) — reads topic hierarchy as the structural foundation for narrative-driven funnel design; per the 2026-04-26 directive (see `ROADMAP.md` Workflow #5 entry), W#5 ALSO adds new narrative-bridge topics that are NOT surfaced by W#1's keyword analysis. R/W: READ from W#1's hierarchy + WRITE new narrative-bridge topics back to the canvas (canonical placement TBD at W#5 design interview — could be a separate W#5-owned table referencing W#1's canvas, or augmentation of W#1's canvas via a new `narrativeBridge` flag).
- Workflow #6 (Content Development) — reads topic hierarchy to determine content production scope. R/W TBD.
- Workflow #7 (Multi-Media Assets) — reads topic hierarchy to determine asset production scope. R/W TBD.
- Workflows #8-14 — reads TBD per individual interview.

**Reads:**
- `Project.name`, `Project.description` (READ-ONLY, all workflows)

#### 7.2.2 Workflow #2 — Competition Scraping & Deep Analysis

**Status:** 🔄 Design phase. Workflow Requirements Interview COMPLETED 2026-05-04 (session_2026-05-04_w2-workflow-requirements-interview). Schema not yet built; data items below are provisional pending W#2 Tool Graduation. Source-of-truth: `docs/COMPETITION_SCRAPING_DESIGN.md` §A.

**Produces (provisional list per Rule 18 reciprocal output declarations; specific R/W flags per consumer at consumer's design interview):**

| Output | What it is | Anticipated downstream consumers |
|---|---|---|
| Competitor URL list | Structured competitor product/listing records (per Project, per platform) with category, brand, product, sizes, price, ratings, custom fields per `DATA_CATALOG.md §6.1.1`-`6.1.2` | W#3 Therapeutic Strategy, W#5 Conversion Funnel, W#6 Content Development, W#9 Clinical Evidence, W#11 Post-Launch Optimization |
| Captured text corpus | All text snippets captured from competitor pages (titles, bullets, descriptions, reviews) tagged by content category + tags per `DATA_CATALOG.md §6.1.3` | W#3, W#5, W#6, W#9, W#10 (Reviews) |
| Captured image library | All saved images (regular + region-screenshot A+ modules) with Composition + Text fields per `DATA_CATALOG.md §6.1.4`. Volume: ~300/Project; storage: ~500GB/yr Phase 3 | W#4 Brand Identity (visual references), W#6 Content Development (image inspiration), W#7 Multi-Media Assets (style references) |
| Captured video library (NEW 2026-05-20-b — P-27) | All saved videos — both direct-bytes uploads (inline `<video>` element bytes; stored in new `competition-scraping-videos` Supabase bucket; private + signed URLs; 100 MB per-file cap; allowlist `video/mp4` + `video/webm` + `video/quicktime`) AND URL-references (YouTube / Vimeo / etc. embeds where bytes can't be downloaded per platform ToS — pointer-only; zero bytes stored). Per design doc `CAPTURED_VIDEOS_DESIGN.md` §A.7 schema spec: new `CapturedVideo` table parallel to `CapturedImage` with required `sourceType` discriminator (`'bytes' | 'embed_url'`) + nullable `storagePath` / `storageBucket` / `fileSize` / `mimeType` / `duration_seconds` / `width` / `height` / `thumbnailStoragePath` (NULL when client-side `<canvas>` thumbnail extraction fails — save never blocked; ▶️ icon placeholder shown). New `video-category` vocabulary type. Volume: ~30 captured videos / Project (~30% direct-bytes / ~70% embed mix); direct-bytes storage: ~1 TB/yr Phase 3 + ~2 TB/yr Phase 4 per `PLATFORM_REQUIREMENTS.md §10.2` video-storage projections; embed-URL references at zero-bytes-stored. **Three Living Questions (Rule 7) answers per design doc §A.15:** (i) upstream data needed = Project + Platform + CompetitorUrl + new `video-category` vocabulary; (ii) read-only by W#3+; (iii) N/A on edits-back. **Status:** schema spec FROZEN at design session 2026-05-20-b; schema migration via `npx prisma db push` lands at P-27 Build session #1 (next session). | W#4 Brand Identity (visual references mirroring captured-image), W#6 Content Development (video inspiration mirroring captured-image), W#7 Multi-Media Assets (style references mirroring captured-image), W#5 Conversion Funnel (potential video proof points for narrative-architecture composition; TBD at W#5 design interview), W#3 Therapeutic Strategy (potential video evidence for therapeutic-strategy ideation; TBD at W#3 design interview) |
| Project-scoped vocabularies | Competition Categories, Product Names, Brand Names, Size/Option labels, Content Categories, Image Categories, **Video Categories (NEW 2026-05-20-b — P-27)** per `DATA_CATALOG.md §6.1.5`. **Platform-shared per `PLATFORM_REQUIREMENTS.md §8.4` — NOT W#2-owned.** Any workflow on the same Project can READ + ADD entries. New `video-category` vocabulary type added by P-27 design session; entries created via the same inline "+ Add new category" affordance pattern shipped to text + image + URL forms (per ROADMAP P-13 entry — see CORRECTIONS_LOG §Entry 2026-05-20-b for the Rule 24 catch on this symmetry). | Any downstream workflow on the same Project |
| Per-platform discovery metadata | Which discovery channel (Amazon search, Google Shopping, Google Ads, Google organic) found each URL — preserves "how did we find this competitor" provenance | W#11 Post-Launch Optimization, W#13 Exit Strategy |

**Director's directive 2026-05-04:** "Design the system in a way that allows us to use things easily in the downstream workflows." Translation: data model is FLEXIBLE; no assumptions baked in about specific downstream consumers.

**Reads:**
- `Project.name`, `Project.description` (READ-ONLY, all workflows)
- **Nothing from W#1 or any other workflow.** Director rejected W#1 topic hierarchy as input at interview time. W#2 is fully self-contained input-wise.

**Edit permissions on W#2 outputs (Q5.b at interview):** per-(producing-workflow, data-item, consuming-workflow) granular per `PLATFORM_REQUIREMENTS.md §6.6` (NEW 2026-05-04). Default direction is editable rather than read-only; specifics decided per-downstream design interview. Vocabularies (output #4) are READ + ADD by any workflow on the same Project per §8.4.

#### 7.2.3-7.2.14 Remaining workflows

Entries created at each workflow's design interview (per Rule 18 reciprocal output declarations).

### 7.3 Phase 2 platform-shared items (designed; NOT YET BUILT)

These are platform-level shared items — not workflow-to-workflow data, but cross-cutting infrastructure that every Phase 2 tool must respect.

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

**AuditEvents** — shared (for workflows that opt in) — **LIVE 2026-06-04; W#1 is the FIRST consumer**
- FROM: Automatic emission from instrumented workflow mutations. W#1 (Keyword Clustering) writes via POST `/api/projects/[projectId]/audit-events` (its keyword-clustering route, not the library hook — W#1 predates the library context). AI-run recording live; manual-edit recording queued (H-1 slice 2).
- CONSUMING: Admin audit views; possibly worker "my history" views (TBD); the future W#1 Action-History UI tab (reads GET `/api/projects/[projectId]/audit-events`). Currently W#1 is the only writer + reader.
- R/W: System-write only (append-only; rows never edited); read by admin and possibly workers for their own events

**Workflow Deliverables** — shared across workflows
- FROM: Uploaded by the workflow that produces them
- CONSUMING: Downstream workflows (read-only typically), admin (full access)
- R/W: Per-workflow write policy; generally read-only downstream unless specific workflow designs otherwise

### 7.4 Decision criteria (for future entries)

When a new workflow needs data from upstream, Claude must ask the director (Living Questions per `HANDOFF_PROTOCOL.md` Rule 7):

1. **"Which data does [NEW WORKFLOW] need from [UPSTREAM WORKFLOW]?"**
2. **"Is this data read-only, or editable?"**
3. **"If editable, should edits in [NEW WORKFLOW] be visible to [UPSTREAM WORKFLOW]?"**
4. **"Edge cases or constraints?"**

Each entry format (used in §7.2 sub-sections):

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

### 7.5 Maintenance

- Map is updated at every Tool Graduation per `HANDOFF_PROTOCOL.md` §4 Step 2 Scenario B item 5.
- Map is updated when a new Workflow Requirements Interview produces an upstream-read or downstream-write declaration (per Rule 18 reciprocal output declarations).
- Per `HANDOFF_PROTOCOL.md` Rule 23 (Change Impact Audit), the Map is the load-bearing lookup mechanism for cascade-prevention before any change to a graduated tool. Every audit consults this Map first.
- Never silently delete entries — mark `DEPRECATED` with date and reason.

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
