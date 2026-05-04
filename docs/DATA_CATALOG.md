# DATA CATALOG
## Master index of all data captured across the PLOS platform, with Human Reference Language

**Last updated:** May 4, 2026 (W#2 Workflow Requirements Interview — provisional W#2 entries added to §6.1 (7 sub-sections covering competitor URL records, sizes/options, captured text, captured images, platform-shared vocabularies, highlight terms, worker assignments with platform sub-scope) + §7.2.2 W#2 row in Cross-Tool Data Flow Map filled in with reciprocal output declarations per Rule 18 + W#1-as-W#2-input speculation rejected. All entries provisional pending W#2 Tool Graduation; finalized HRL authored per Doc Architecture §5 at graduation time. Modified on `workflow-2-competition-scraping` feature branch per MULTI_WORKFLOW_PROTOCOL Rule 3 — only W#2-relevant additions, no W#1 sections touched.)
**Last updated in session:** session_2026-05-04_w2-workflow-requirements-interview (Claude Code)
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
- **PER-KEYWORD FIELDS:** `keyword`, `volume`, `sortingStatus` (Unsorted/Partially Sorted/Completely Sorted/AI-Sorted/**Reshuffled** — last value added 2026-04-25 Session 3b; assigned by P3-F7 reconciliation pass when a keyword that was previously AI-Sorted is no longer linked to any topic on the canvas after a batch-rebuild; surfaced as a yellow badge in the AST so admin can spot the alarm; auto-eligible for re-placement under Auto-Analyze's default scope), `tags`, `topic`, `canvasLoc`, `topicApproved`
- **SHARED WITH:** TBD — likely Content Development, Conversion Funnel, Marketplace Optimization
- **R/W DOWNSTREAM:** TBD at per-workflow design time

### 5.2 Topics (Canvas Nodes)
- **HUMAN REF (PROVISIONAL):** "the topics" / "the topic nodes" / "the mindmap topics"
- **CAPTURED IN:** Canvas (Mindmap or Table mode) → Node creation / Edit Panel
- **TECHNICAL NAME:** `CanvasNode` table; foreign key `projectWorkflowId` (live)
- **FIELDS:** `title`, `description`, `altTitles`, `parentId`, `pathwayId`, `relationshipType`, `narrativeBridge`, `linkedKwIds`, `kwPlacements`, position/size, collapse states, `stableId` (Pivot B), `stabilityScore` (Pivot B), `intentFingerprint` (Scale Session B)
- **SHARED WITH:** TBD — highly likely Conversion Funnel, Content Development
- **R/W DOWNSTREAM:** TBD

### 5.2a Topic Intent Fingerprint (NEW 2026-04-30 — Scale Session B)
- **HUMAN REF (PROVISIONAL):** "the topic's one-line searcher intent" / "the canonical phrase that captures who is searching for this topic and what they want"
- **CAPTURED IN:** AI emits via `intent_fingerprint` field on `ADD_TOPIC` / `UPDATE_TOPIC_TITLE` / `UPDATE_TOPIC_DESCRIPTION` (optional) ops + `merged_intent_fingerprint` on `MERGE_TOPICS` + `intent_fingerprint` per `into[]` entry on `SPLIT_TOPIC` — once V4 prompts ship in Scale Session D. Until then, populated via the AI-driven backfill script `scripts/backfill-intent-fingerprints.ts` (one-time per project) + the `''` placeholder default that future non-AI canvas-node creates supply.
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

### 5.8 Auto-Analyze config + prompts (DB-backed via UserPreference + apiKey-in-localStorage split — fixed 2026-04-24 Session 3a)
- **HUMAN REF:** "the auto-analyze settings" / "the AI prompts" / "the seed words" / "my Anthropic key"
- **TECHNICAL REALITY (Session 3a):** Settings auto-save 800ms after any change in `AutoAnalyze.tsx` and load on panel mount. Two storage paths split for security:
  - **`apiKey`** — browser `localStorage` key `aa_apikey_{projectId}`. Per-browser, per-project. Never sent to our DB to avoid storing the user's Anthropic secret in plain-text Postgres.
  - **All other settings** (apiMode, model, seedWords, volumeThreshold, batchSize, processingMode, thinkingMode, thinkingBudget, keywordScope, stallTimeout, reviewMode, initialPrompt, primerPrompt) — single JSON blob stored in existing `UserPreference` table at key `aa_settings_{projectId}` via `PUT /api/user-preferences/aa_settings_{projectId}`. Per-user-per-project. Syncs across devices.
- **Hydration on mount:** GET reads both paths in parallel; missing values fall back to hardcoded defaults; `settingsLoaded` flag prevents the auto-save useEffect from overwriting fresh-loaded values with stale React-default values during the initial render.
- **HISTORY:** Pre-2026-04-24 was ephemeral React state — settings reset on every page refresh. Director's "Phase 1-polish: persist Auto-Analyze settings in UserPreference" item shipped this session.
- **SHARED WITH:** N/A

### 5.9 Auto-Analyze checkpoint (localStorage)
- **HUMAN REF (PROVISIONAL):** "the auto-analyze progress" / "where I left off in auto-analyze"
- **TECHNICAL NAME (corrected 2026-04-18):** localStorage key `aa_checkpoint_{Project.id}` — **uses `Project.id`, NOT `ProjectWorkflow.id`.** The code is at line 227 of `AutoAnalyze.tsx`: `const cpKey = 'aa_checkpoint_' + projectId;` where `projectId` comes from `useParams()` which reads `Project.id` from the URL. Prior docs were wrong on this.
- **Content when populated:** full config (§5.8 fields), batches array, currentIdx, totalSpent, deltaMode, batchTier, elapsed seconds, logEntries.
- **Lifecycle:** Created on first `saveCheckpoint()` call during a run; updated after each batch; cleared on ✕ Cancel (via `handleCancel()` → `clearCheckpoint()`); restored on ▶ Resume via `handleResumeCheckpoint()`.
- **SHARED WITH:** N/A

### 5.10 Removed Terms (DB-backed soft archive — fixed 2026-04-24 Session 3a)
- **HUMAN REF:** "the removed terms" / "the archived keywords" / "the trash" (Modal labels them "🗑 Removed Terms")
- **TECHNICAL NAME:** Prisma model `RemovedKeyword`. FK to `ProjectWorkflow`. Fields: `id, projectWorkflowId, originalKeywordId (nullable), keyword, volume, sortingStatus, tags, topic, canvasLoc, removedAt, removedBy (userId), removedSource ('manual' | 'auto-ai-detected-irrelevant'), aiReasoning (nullable Text)`. Read via `GET /api/projects/[projectId]/removed-keywords`; written via `POST .../removed-keywords` (transactional copy-then-delete) and `POST .../removed-keywords/[removedId]/restore` (transactional reverse).
- **PERSISTENCE:** Database. Survives page refresh, syncs across devices (per-ProjectWorkflow scope).
- **SHARED WITH:** Future Auto-Analyze salvage mechanism (Session 3b) writes here with `removedSource='auto-ai-detected-irrelevant'`. Future Auto-Remove BUTTON (deferred per director) would also write here.
- **HISTORY:** Pre-2026-04-24 was localStorage-only (key `kst_rm`); UI showed an empty list on every page refresh and the underlying delete actually hard-deleted the Keyword row. Director caught the bug in Session 2; fix shipped Session 3a as Option B (per-ProjectWorkflow DB table).

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

### 6.1 Competition Scraping & Deep Analysis (W#2) — provisional, captured at Workflow Requirements Interview 2026-05-04

**Status:** 🔄 Design phase. Schema not yet built. Entries below are PROVISIONAL — finalized Human Reference Language will be authored at W#2 Tool Graduation per Doc Architecture §5. Specific R/W flags for each downstream workflow are TBD per consumer's design interview.

**Source-of-truth doc:** `docs/COMPETITION_SCRAPING_DESIGN.md` §A (frozen 2026-05-04 at end of Workflow Requirements Interview).

**Cross-references:** `PLATFORM_REQUIREMENTS.md §2.2.1` (4-way assignment with platform sub-scope), `§6.6` (cross-workflow data permissions per-(workflow, data-item) granular), `§8.4` (platform-shared vocabularies), `§10.1` (non-web-app client / Chrome extension), `§10.2` (image-storage projections), `§12.6` (scaffold extension-points).

#### 6.1.1 Competitor URL record (provisional)
- **HUMAN REF (PROVISIONAL):** "the competitor list" / "captured competitor URLs" / "the competition table"
- **CAPTURED IN:** Chrome extension Module 1 (Competition Identification) → write-through to PLOS via API; viewable + editable in PLOS at `/projects/[projectId]/competition-scraping`
- **TECHNICAL NAME:** `competitor_url` table (NOT YET BUILT — schema-design pending Stack-and-Architecture session)
- **FIELDS (provisional):**
  - `id` — UUID, primary key (client-generated for idempotency)
  - `projectId` — FK to Project
  - `platform` — Enum: `"amazon" | "ebay" | "etsy" | "walmart" | "google_shopping" | "google_ads" | "independent_website"`
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

#### 6.1.6 Highlight Terms with colors (extension-local OR per-Project, TBD)
- **HUMAN REF (PROVISIONAL):** "the highlight terms" / "the highlight colors"
- **CAPTURED IN:** Chrome extension Module 1 setup
- **TECHNICAL NAME:** TBD — could be `chrome.storage.local` only (per-extension-install) OR `highlight_term` table (per-Project, syncable across worker installs)
- **DECISION DEFERRED:** to Stack-and-Architecture session. If admin/workers want highlight terms to follow them across devices, server-stored. If purely a per-session convenience, local-only.
- **FIELDS (provisional, if server-stored):**
  - `id`, `projectId`, `userId`, `term`, `color` (hex), `createdAt`
- **SHARED WITH:** Self-only (this user's extension); not shared cross-workflow

#### 6.1.7 Worker assignment with platform sub-scope (Phase 2+)
- **HUMAN REF (PROVISIONAL):** "the assignment" / "Sarah is assigned to Amazon for Project X"
- **CAPTURED IN:** Phase-2 admin assignment UI in PLOS
- **TECHNICAL NAME:** `Assignment` table (Phase-2 platform-wide; W#2 populates `subScope` column with platform name per `PLATFORM_REQUIREMENTS.md §2.2.1`)
- **FIELDS (provisional, when Assignment table is built in Phase 2):**
  - `id`, `userId`, `workflow`, `projectId`, `subScope` (String, nullable; W#2 uses platform name), `status` (per Phase-2 review-cycle states OR W#2's simplified `assigned | in-progress | completed`), timestamps
- **CONSTRAINT:** Unique on `(workflow, projectId, subScope)` — enforces "one worker per (Project, platform)" for W#2

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
| Workflow #1 (Keyword Clustering) | (full contract pending W#1 graduation) | TBD per per-workflow design interviews | TBD | PROVISIONAL — see §7.2.1 |

### 7.2 Per-tool detail (filled in as workflows graduate / get designed)

#### 7.2.1 Workflow #1 — Keyword Clustering

**Status:** Active development; Data Contract not yet ratified (will be at graduation).

**Produces (provisional list; will be finalized at graduation per Rule 18 reciprocal output declarations):**

- Topic hierarchy (canvas) — the structured conversion-funnel topic tree with primary + secondary keyword placements per Strategy 3 layered placement (per `AUTO_ANALYZE_PROMPT_V3.md`)
- Per-topic stable IDs (`t-N` format) and stability scores (0.0-10.0)
- Per-keyword classification (topic placement + sortingStatus + tags)
- Removed Terms (soft-archived irrelevant keywords with `removedSource` + `aiReasoning`)
- Pathways (conversion pathways through the canvas)
- Sister Links (cross-cutting topic relationships)

**Anticipated downstream consumers (per `PROJECT_CONTEXT.md` §2; specific R/W flags decided per-consumer at consumer's design interview):**

- Workflow #2 (Competition Scraping) — likely reads topic hierarchy to seed competitor-content gap analysis. R/W TBD at W#2 design interview.
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
| Project-scoped vocabularies | Competition Categories, Product Names, Brand Names, Size/Option labels, Content Categories, Image Categories per `DATA_CATALOG.md §6.1.5`. **Platform-shared per `PLATFORM_REQUIREMENTS.md §8.4` — NOT W#2-owned.** Any workflow on the same Project can READ + ADD entries. | Any downstream workflow on the same Project |
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

**AuditEvents** — shared (for workflows that opt in)
- FROM: Automatic emission from instrumented workflow mutations
- CONSUMING: Admin audit views; possibly worker "my history" views (TBD)
- R/W: System-write only; read by admin and possibly workers for their own events

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
