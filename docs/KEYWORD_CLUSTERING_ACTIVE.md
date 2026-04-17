# KEYWORD CLUSTERING — ACTIVE DOCUMENT
## Current state of the Keyword Clustering workflow tool (Group B, tool-specific)

**Last updated:** April 17, 2026 (Phase M Ckpt 8 complete — `/plos` Keyword Analysis card now correctly routes to `/projects`, navigation path is fully working end-to-end)
**Last updated in chat:** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c
**Previously updated:** https://claude.ai/chat/7e0b8456-b925-4460-a583-d348d1c965bf

**Purpose:** This is the working document for the Keyword Clustering tool during its active development phase. Covers everything built so far, what's pending, technical details, and known issues.

**When this tool graduates to stable completion:** This doc will be split into `KEYWORD_CLUSTERING_ARCHIVE.md` (full history) and `KEYWORD_CLUSTERING_DATA_CONTRACT.md` (what downstream tools need to know). See `DOCUMENTATION_ARCHITECTURE.md` §5 for the Tool Graduation Ritual.

**Upload this doc when:** Working on ANY feature, test, or bugfix related to Keyword Clustering.

---

## ⚠️ POST-CKPT-8 STATE (READ FIRST)

**As of 2026-04-17 (Phase M Ckpt 8 complete):**

- The Keyword Clustering tool's URL is `/projects/[projectId]/keyword-clustering`.
- The tool is single-state — user arrives with a specific Project already picked via URL.
- ✅ **The `/plos` Keyword Analysis card** has been rewired (Ckpt 8) from the deleted `/keyword-clustering` to `/projects`. Full navigation path from Login → Dashboard → PLOS → click Keyword Analysis card → `/projects` → pick a Project → `/projects/[projectId]` → click Keyword Analysis workflow card → `/projects/[projectId]/keyword-clustering` now works end-to-end without any 404s.
- The `components/` folder (ASTTable, MTTable, KeywordWorkspace, etc. — 25+ files) lives at `src/app/projects/[projectId]/keyword-clustering/components/` (moved from `src/app/keyword-clustering/components/` in Ckpt 7). All relative imports (`./components/KeywordWorkspace`, etc.) work.
- The old `src/app/keyword-clustering/` folder has been DELETED entirely. Do not recreate it.
- `KeywordWorkspace`, `useKeywords`, `useCanvas`, and all inner tool components are UNCHANGED by Ckpts 7 and 8. They still receive `projectId`, `userId`, `aiMode` as props and function identically.
- The API routes (keywords, canvas/nodes, canvas/pathways, canvas/sister-links, canvas/rebuild, canvas state) are UNCHANGED. URL paths stay the same (`/api/projects/[projectId]/...`); the server resolves `projectWorkflowId` internally via `verifyProjectWorkflowAuth`.
- `npm run build` passes cleanly (most recently verified in Ckpt 8: 18.5s, 17/17 static pages, zero TypeScript errors).
- Local commits: Ckpt 7 = `5cc10c5`, Ckpt 8 = `ac62a3a`. Both on `main`, not pushed (Phase M deploy hold until Ckpt 9).

**Checkpoint remaining:** 9 (deploy + cleanup of pre-existing leftover files).

---

## ⚠️ POST-PHASE-M SCHEMA NOTE

**As of 2026-04-16 (Phase M Ckpt 4 complete), the database schema changed:**

- The old `Project` table no longer has a `workflow` field and is now the user-facing Project record (see PLATFORM_ARCHITECTURE.md §5 for live schema).
- A new internal table `ProjectWorkflow` now sits between a Project and its workflow-specific data.
- **All workflow data tables now reference `projectWorkflowId` instead of `projectId`:**
  - `Keyword.projectId` → `Keyword.projectWorkflowId`
  - `CanvasNode.projectId` → `CanvasNode.projectWorkflowId`
  - `Pathway.projectId` → `Pathway.projectWorkflowId`
  - `SisterLink.projectId` → `SisterLink.projectWorkflowId`
  - `CanvasState.projectId` → `CanvasState.projectWorkflowId`

**API URL paths are unchanged:** routes like `/api/projects/[projectId]/keywords` keep the same URL — the server resolves `projectWorkflowId` internally. This decision minimized client code churn.

**As of 2026-04-17 (Phase M Ckpt 5):** All API routes (server-side) have been rewritten to align with the new schema.
**As of 2026-04-17 (Phase M Ckpt 7):** The client-side Keyword Clustering page has been updated to match — single-state, URL-driven.

---

## ⚠️ POST-APRIL-17 ARCHITECTURAL REVEAL — Phase 2 implications for this tool

As of 2026-04-17 (chat `cc15409c-...`), the platform architectural reveal established that Keyword Clustering must eventually support:

1. **Up to 10–20 concurrent editors** on a single Project's canvas with OT/CRDT merge strategy (Pattern D per `PLATFORM_REQUIREMENTS.md §3`). Current tool is single-user only. **This is the highest-impact Phase 2 change to this tool.**

2. **Review cycle integration** — workers click "I'm done — please review"; admin reviews, leaves notes, can mark Acceptable or Revision-Requested. Tool must display review state and revision notes inline. Currently not supported.

3. **Audit trail (Phase 2, opt-in)** — whether Keyword Clustering emits audit events is TBD at Phase 2 design. Strong candidate for audit given high edit volume and 10–20 concurrent editors. Emission helper built in Phase 2 scaffold; events declared in a future design update.

4. **Reset Workflow Data** — admin-only destructive action to wipe all KC data for a specific Project (per `PLATFORM_REQUIREMENTS.md §7`). Must clear: Keywords, CanvasNodes, Pathways, SisterLinks, CanvasState, AA checkpoint localStorage. Not yet implemented — on Phase 1-gap roadmap (Must-have).

5. **Per-(user, workflow, project) assignment** — tool must only be reachable by admin or by users with an Assignment row for (this workflow, this Project). Currently all-or-nothing: if you can log in, you can use it. Phase 2 adds permission middleware at API level + worker-scoped UI.

6. **Scale target Phase 3:** ~500 Projects with active KC workflows simultaneously; at Phase 4 up to ~5,000. Current DB indexes (projectWorkflowId on Keyword/CanvasNode/Pathway/SisterLink) should handle this, but query patterns at scale need verification before Phase 3.

These items do NOT affect Phase 1 admin-solo work. They are flagged here so Phase 2 design work correctly scopes what must be added to this specific tool.

---

## 1. Tool overview

### What it does
Takes a broad list of niche-related keywords, analyzes their intents, and organizes them thematically into a hierarchy of topics that form highly efficient conversion funnels.

### Card on PLOS Landing Page
- **Icon:** 🔑
- **Title:** Keyword Analysis & Intent Discovery
- **Status:** Active (only active card as of current chat)
- **Route:** `/projects/[projectId]/keyword-clustering` (as of Ckpt 7)
- ✅ **Card on `/plos`** now correctly routes to `/projects` (Ckpt 8 rewire) — user picks a Project there, then enters the KC workspace from the Project detail page.

### Origin
Migrated from the original single-HTML tool `keyword_sorting_tool_v18.html` (~17,691 lines). Migration is mostly complete but some features have not yet been ported — see §7 "Missing features (Phase 1-gap)" below.

---

## 2. How the user accesses the tool

**Post-Ckpt-8 (current working path):**
```
Login (/) → Dashboard (/dashboard) → PLOS Landing (/plos)
  → Click "Keyword Analysis & Intent Discovery" card  ✅ routes to /projects (Ckpt 8 rewire)
  → /projects  (Projects list)
  → Click an existing Project's name
  → /projects/[projectId]  (Project detail page)
  → Click the Keyword Analysis workflow card
  → /projects/[projectId]/keyword-clustering  (single-state, Project pre-selected)
```

**The full navigation works end-to-end now.** No 404s, no workarounds needed. As of Ckpt 8, clicking the Keyword Analysis card on `/plos` correctly takes the user to the Projects list, where they pick a Project before entering the KC workspace.

---

## 3. Architecture

### Component tree (as of Ckpt 7)
```
src/app/projects/[projectId]/keyword-clustering/
  ├── page.tsx          — wrapper: auth, read projectId from URL, fetch Project name, render workspace (164 lines)
  └── components/       — all the actual tool code
        │
        └── <KeywordWorkspace projectId userId aiMode>
              │
              ├── Manual Mode (3-panel + canvas):
              │   ├── <ASTTable>         — All Search Terms (left top)
              │   ├── <MTTable>          — Main Terms (left middle)
              │   ├── <TIFTable>         — Terms In Focus (left bottom)
              │   └── <CanvasPanel>      — Topics Layout Canvas (right)
              │       └── <CanvasEditPanel>  — 320px drawer for node editing
              │
              └── AI Mode (1 table + canvas + AI Actions Pane):
                    │
                    ├── One of 4 views (toggle):
                    │   ├── <ASTTable>     — "Normal" view
                    │   ├── <MTTable>      — "Common Terms" view
                    │   ├── <KASTable>     — "Keywords Analysis" view
                    │   └── <TVTTable>     — "Topics View"
                    │
                    ├── <CanvasPanel> or <CanvasTableMode>
                    │
                    └── <AutoAnalyze>      — Auto-Analyze system (76KB)
```

### Canvas modes
- **Mindmap mode (default):** Visual canvas with draggable nodes, pathways, sister links
- **Table mode:** Alternate structured view of the same canvas data

### Hooks
- `src/hooks/useKeywords.ts` — keyword state + `batchUpdate` + `reorder`
- `src/hooks/useCanvas.ts` — canvas state (lifted to `KeywordWorkspace`, passed to `CanvasPanel`)

### Key prop flow
- `aiMode` lives in `page.tsx`, passed as prop to `KeywordWorkspace`. Per-session only — resets on page refresh. See ROADMAP Phase 1-polish item.
- `useCanvas` lifted to `KeywordWorkspace`, passed as prop to `CanvasPanel`

---

## 4. Database tables used

All scoped by `projectWorkflowId` (post-Phase-M):

| Table | Purpose |
|---|---|
| `Project` | User-facing project record (one per product launch effort). `ProjectWorkflow` holds per-workflow state/data. |
| `ProjectWorkflow` | Per-workflow internal bucket — holds status (inactive/active/completed) + activity timestamps for the keyword-clustering workflow of a specific Project. User never sees this name. |
| `Keyword` | Individual keywords: keyword text, volume, sortingStatus, tags, topic, canvasLoc, topicApproved |
| `CanvasNode` | Topic nodes: title, description, altTitles, parentId, pathwayId, kwPlacements, position, size |
| `Pathway` | Conversion pathways (grouping of nodes) |
| `SisterLink` | Cross-pathway links between nodes |
| `CanvasState` | Viewport (viewX, viewY, zoom) + nextNodeId/nextPathwayId counters |

See `PLATFORM_ARCHITECTURE.md` §5 for full schema definitions.

### Activity tracking (post-Ckpt-5)

User actions that flip `ProjectWorkflow.status` from "inactive" to "active" on first occurrence AND refresh `lastActivityAt` on every occurrence:
- Any keyword create/edit/delete (single or bulk)
- Any canvas node create/edit/delete
- Any pathway create/delete
- Any sister link create/delete
- Atomic canvas rebuild (Auto-Analyze batch apply)

User actions that do NOT flip status (but also don't update `lastActivityAt`):
- GET any resource (reading data)
- Canvas viewport pan/zoom (writes to `CanvasState` but is pure "looking around")
- Opening the workspace without making any edits (the page fetches Project summary but no workflow-data writes happen)

Manual user action:
- Toggle "Completed" on the Projects page Completed button → PATCH to `/api/project-workflows/[projectId]/keyword-clustering` with `{ status: "completed" }`

### Data still in localStorage (planned migration in Phase 1-persist)
- MT Table entries (`kst_mt`)
- Auto-Analyze config (`kst_aa_apikey`, `kst_aa_model`, etc.)
- Auto-Analyze prompts (`kst_aa_initial_prompt`, `kst_aa_primer_prompt`)
- Auto-Analyze checkpoint (`aa_checkpoint_{projectWorkflowId}`) — key already uses projectWorkflowId
- Removed Terms (`kst_rm`) — ⚠️ currently lost on refresh
- UI state (panel visibility, filters, zoom, canvas mode, collapsed nodes, TIF entries, etc.)
- **NEW (Ckpt 7):** `aiMode` (Manual/AI toggle state) is currently per-session only — resets on page refresh. Considering adding to `UserPreference` per-user per-workflow. See ROADMAP Phase 1-polish items.

---

## 5. Feature inventory (what's built)

### Manual Mode features ✅
- **AST (All Search Terms) table:**
  - Data entry (paste list, import TSV)
  - Columns: Keyword, Volume, Status, Tags, Topics, SV
  - 4 sorting statuses: Unsorted (gray), Partially Sorted (orange), Completely Sorted (green), AI-Sorted (blue)
  - Split Topics View
  - Search, filters, virtual scroll, drag-reorder, zoom
  - CSV download
  - Column visibility toggles
  - 200ms debounce on search (Phase 1-foundation)
- **MT (Main Terms) table**
- **TIF (Terms In Focus) table**

### AI Mode features ✅
- **Four-way table toggle:**
  1. Normal Table View (AST)
  2. Common Terms View (MT)
  3. Keywords Analysis View (KAS)
  4. Topics View (TVT)
- **AI Actions Pane** with view-specific button groups
- **KAS (Keywords Analysis) table** — derived analysis view
- **TVT (Topics View) table:**
  - Depth-first tree-walk order
  - 7 depth-colored title shades
  - Primary (bold) and secondary (italic purple) keyword display
  - Volume badge per topic (sum of primary keyword volumes)
  - Deduplicated keyword count
  - Drag-to-reorder (3 modes: before / after / nest as child)
  - Description column toggle
  - Hover popover (250ms delay)
  - Ancestry orange highlight chain on row hover
  - Depth filter dropdown
  - Zoom (7–18px range)
  - Bi-directional sync with canvas

### Canvas ✅
- **Mindmap mode:**
  - Draggable nodes
  - Accent stripe per depth
  - Node content: title (22px) → alt titles (14px) → description → KW preview (36px) → badge (18px)
  - Primary keywords (blue) and secondary keywords (purple italic)
  - Badge showing `Np + Ns` counts
  - Resize grip
  - Edit Panel (320px drawer)
- **Canvas Table Mode:** alternate structured view
- **Pathways:** grouping mechanism
- **Sister Links:** dashed purple lines between nodes
- **Node resize + customization**
- **Atomic rebuild** via `/canvas/rebuild` endpoint (Phase 1g-rebuild)

### Auto-Analyze System ✅ (code complete, NOT YET TESTED — Phase 1g-test)
- **Two execution modes:**
  - Direct mode: browser → Anthropic (no server timeout)
  - Server mode: browser → Vercel → Anthropic (5min timeout)
- **Processing modes:**
  - Adaptive (default) — adaptive batch sizing
  - Classic — fixed batch size
- **Adaptive batch tiers:**
  - Foundation: 8
  - Expansion: 12
  - Placement: 18
- **Hybrid full-table → delta mode** (auto-switches on truncation)
- **Input monitoring** at 60% / 80% context window
- **5 hard + 7 soft validation checks** (HC5 zero tolerance, SC11 stability, SC12 symmetry)
- **Streaming SSE** for long-running calls
- **Stall retries** (5) + **model retries** (3)
- **Checkpoint persistence** in `localStorage` key `aa_checkpoint_{projectWorkflowId}`
- **Post-apply verification** before marking AI-Sorted
- **Initial Prompt v2** (Steps 1–7, reevaluation triggers) + **Primer Prompt**
- **Two output modes:** Mode A (full table), Mode B (delta)
- **`aaMergeDelta()`** client-side merge
- **max_tokens:** 128000
- **AA_CONTEXT_WINDOW:** 200000

### Auth & API ✅
- JWT-based auth via Supabase on every API route
- `verifyProjectAuth(projectId)` ensures user owns the Project
- `verifyProjectWorkflowAuth("keyword-clustering", projectId)` additionally upserts the ProjectWorkflow row (Ckpt 5)
- All workflow-data routes call `markWorkflowActive()` after mutations (Ckpt 5)

### Page routing & navigation ✅ (Ckpt 7)
- Page lives at `/projects/[projectId]/keyword-clustering`
- Reads `projectId` from URL via `useParams()`
- Fetches Project summary via `GET /api/projects/[projectId]` to show Project name in header
- Top-bar "← Back to Project" returns to `/projects/[projectId]`
- Friendly error state with "Back to Projects" button on 404/403
- `npm run build` passes cleanly

---

## 6. Testing status

### Tested in user's real usage
- Manual Mode tables (AST/MT/TIF): ✅ Working
- Canvas Mindmap + Table modes: ✅ Working
- AI Mode four-way toggle: ✅ Working
- Atomic canvas rebuild: ✅ Working (via Ckpt 1g-rebuild)
- Multi-project management: ✅ Working pre-Phase-M; needs re-verification after Ckpt 9 deploy

### NOT yet tested in user's real usage
- **Auto-Analyze full flow** — Phase 1g-test. Code complete but never actually run against a live dataset.
- **Post-Phase-M data persistence** — the new schema is live in Supabase but no data has been imported since the `--force-reset`; user intends to re-import keywords from the legacy KST after Ckpt 9 deploy.
- **Post-Ckpt-7 navigation in the browser** — build passes, route compiles, but no visual test performed due to Codespaces PORTS glitch. Will visual-test during Ckpt 9 deploy.

---

## 7. Missing features (Phase 1-gap — not yet ported from legacy KST)

Must-haves:
- Reset Workflow Data (admin action — wipe all KC data for a specific Project)
- Import keywords from TSV (pre-Phase-M supported, needs re-test post-deploy)

Nice-to-haves:
- Export canvas as image
- Bulk keyword operations (merge duplicates, tag many at once)
- Undo/redo history
- Keyboard shortcuts for common actions

---

## 8. Known issues / active bugs

### Pre-Phase-M issues
- None currently known in-depth (legacy bugs largely addressed in Phases 1a–1g)

### Post-Phase-M issues
- None known as of Ckpt 7 — the build passes, the page compiles, tool code is unchanged from Ckpt 5 state. First real usage will happen after Ckpt 9 deploy.

---

## 9. Deployment

- Current live code: pre-Phase-M commit `f545e2a` on vklf.com (BROKEN against live DB schema)
- Phase M Ckpts 1–7 work exists only in local commits on `main`
- Deploy: Checkpoint 9

---

## 10. Performance notes

- Canvas: visibility-aware rendering (only render visible nodes)
- AST search: 200ms debounced
- Virtual scroll on keyword tables
- Bulk writes use `$transaction`
- Atomic rebuild uses transactional diff-based update

### Phase 2 scale gap
- Current query patterns have not been verified against Phase 3 scale (~500 concurrent Projects, ~50 users). Testing planned during Phase 1α scaffold design.

---

## 11. Known issues (architecture/tech-debt specific to KC)

- Race condition on `nextNodeId` / `nextPathwayId` in `canvas/nodes` POST and `canvas/pathways` POST (Ckpt 5). Must fix before Phase 1-collab.
- Asymmetric `canvasState` upsert logic between `canvas/nodes/route.ts` POST and `canvas/pathways/route.ts` POST.
- `ops as any` TypeScript workaround in `canvas/rebuild/route.ts`.
- Mutable state in CanvasPanel drag handlers.
- Missing ASTRow memoization.
- Missing error state + retry in useCanvas.
- Missing optimistic update rollback.
- `aiMode` resets on page refresh (Ckpt 7). Low priority Phase 1-polish item.

---

## 12. Upcoming work for this tool

### Phase 1 (admin-solo)
- **Phase 1g-test:** Live-test Auto-Analyze end-to-end. Top priority after Ckpt 9 deploy.
- **Phase 1-verify:** Verify canvas rebuild edge cases.
- **Phase 1-gap:** Port remaining KST features (reset-workflow-data, canvas-as-image export, undo/redo, keyboard shortcuts).
- **Phase 1-persist:** Migrate must-persist localStorage items to database (MT Table, Removed Terms, etc.). Possibly also migrate `aiMode` to UserPreference.
- **Phase 1h:** UX polish.

### Phase 2 (multi-user)
- Assignment-based access control
- Review cycle UI (Submit for Review button, review state display, notes viewer)
- Real-time collaboration via OT/CRDT (Pattern D)
- Audit event emission (if opted in)
- Reset-workflow-data admin action

### Phase 3 (scale)
- Query pattern verification against ~500 concurrent active KC instances

---

## 13. Deferred items

### Captured here
- aiMode persistence per-user per-workflow (Phase 1-polish) — also in ROADMAP
- Reset Workflow Data feature — in `PLATFORM_REQUIREMENTS.md §7` and Phase 1-gap
- All Phase 2 items from architectural reveal — tracked in PLATFORM_REQUIREMENTS.md and PLATFORM_ARCHITECTURE.md §10

### Placeholder for future work
- Tool Graduation Ritual eventual split into `KEYWORD_CLUSTERING_ARCHIVE.md` and `KEYWORD_CLUSTERING_DATA_CONTRACT.md`. Trigger: when all Phase 1 polish items complete AND any upcoming workflow needs to consume this tool's output data (first likely consumer: Competition Scraping workflow).

---

END OF DOCUMENT
