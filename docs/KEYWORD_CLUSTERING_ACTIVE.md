# KEYWORD CLUSTERING — ACTIVE DOCUMENT
## Current state of the Keyword Clustering workflow tool (Group B, tool-specific)

**Last updated:** April 18, 2026 (Phase 1g-test partial — first Claude Code session; Auto-Analyze live-tested with real signal + multiple tuning findings + several doc drifts corrected)
**Last updated in session:** session_2026-04-18_phase1g-test-kickoff (Claude Code)
**Previously updated (claude.ai era):** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c

**Purpose:** This is the working document for the Keyword Clustering tool during its active development phase. Covers everything built so far, what's pending, technical details, and known issues.

**When this tool graduates to stable completion:** This doc will be split into `KEYWORD_CLUSTERING_ARCHIVE.md` (full history) and `KEYWORD_CLUSTERING_DATA_CONTRACT.md` (what downstream tools need to know). See `DOCUMENTATION_ARCHITECTURE.md` §5 for the Tool Graduation Ritual.

**Upload this doc when:** Working on ANY feature, test, or bugfix related to Keyword Clustering.

---

## ⚠️ POST-PHASE-1G-TEST STATE (READ FIRST — added 2026-04-18)

**As of 2026-04-18 (first Claude Code session — Phase 1g-test partial):**

- ✅ **Auto-Analyze has been live-tested for the first time.** The tool runs end-to-end in principle. Batch 1 completed cleanly: 8 topic nodes created, canvas rebuild atomic, validation passed.
- ❌ **Systematic failure mode discovered in batch 2:** With a growing topics table, the model (Sonnet 4-6) produces full-table (Mode A) responses that drop pre-existing topics. 3 retries all failed the same way. The tool's Mode A→B auto-switch does NOT trigger on validation failures (only on truncation) — this is a design gap.
- ⚠️ **Adaptive Thinking mode is broken for large prompts.** With Initial Prompt V2 (~35,921 chars) + Primer (~15,208 chars), Adaptive thinking consumed its entire budget and produced 0 output tokens. **Workaround confirmed:** switch Thinking dropdown to "Enabled" with Budget=12000 tokens. This worked for batch 1.
- ⚠️ **Vercel 5-min timeout is a real risk.** Batch 2 attempt 2 took 4:59 wall time and returned 0 output tokens — strongly suggests Vercel killed the stream. For long runs, Direct mode (no timeout) may be required.
- 📝 **Multiple doc drifts discovered and corrected this session** — see §4 below. Most notable: the `kst_aa_*` localStorage keys referenced in prior docs **do not exist in the code**. Only `aa_checkpoint_{Project.id}` exists, and only after a run starts.
- 🚫 **The Bursitis Project's 2,328 keywords are NOT yet clustered.** First 8 keywords from batch 1 landed as topics; all others remain unsorted. Phase 1g-test follow-up (a second tuning pass) is required before we can complete a real clustering run.

**Next priority after Phase 1g-test follow-up:** see §6 "Phase 1g-test findings" for specific tuning items to validate in the next session.

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

**⚠️ CORRECTED 2026-04-18:** the prior version of this list referenced `kst_aa_apikey`, `kst_aa_model`, `kst_aa_initial_prompt`, `kst_aa_primer_prompt` as if they were standalone localStorage keys. **Those keys do NOT exist in the current code.** Verified by grep across `/src/` on 2026-04-18 — zero matches. The actual behavior:

- **Auto-Analyze checkpoint — the ONLY AA-related localStorage key** — `aa_checkpoint_{Project.id}` (note: uses `Project.id` not `ProjectWorkflow.id`; prior docs were wrong on this too). Created only AFTER a run starts and `saveCheckpoint()` fires. Contains the full config (apiMode, apiKey, model, seedWords, thinking mode + budget, processingMode, prompts, etc.) + current batch state + log entries.
- **Before a run starts, NO Auto-Analyze settings are persisted.** Open the panel, paste prompts, close the browser → everything is lost. This is a UX gap for a non-programmer user.
- **After a run starts and the first checkpoint saves, the Resume Checkpoint button (▶ Resume) appears on next visit and restores the full config including prompts** — but only if the checkpoint wasn't discarded via ✕ Cancel (which calls `clearCheckpoint()`).

**Other localStorage items (unchanged from prior docs — verify each against code before acting):**
- MT Table entries (`kst_mt`)
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

### Partially tested
- **Auto-Analyze — first live run completed 2026-04-18 on Bursitis Project (2,328 keywords).** See §6.5 Phase 1g-test findings below. Batch 1 succeeded end-to-end, batch 2 failed systematically with Mode A full-table behavior. More tuning work needed before a completing run is possible.

### NOT yet tested in user's real usage
- **Post-Phase-M data persistence** — the new schema is live in Supabase and user has re-imported Bursitis keywords (2,328) since Ckpt 9 deploy. Read/write confirmed via the one successful batch. Needs broader stress testing.
- **Post-Ckpt-7 navigation in the browser** — confirmed working during Ckpt 9.5 visual verification and confirmed again during Phase 1g-test. ✅ No issues.

---

## 6.5 Phase 1g-test findings (2026-04-18, first Claude Code session)

**Test setup:**
- Project: "Bursitis" — 2,328 unsorted keywords (fresh Project, no prior clustering or AI-Sorted data)
- Model: `claude-sonnet-4-6` (chosen for balance of capability and cost)
- API Mode: **Server proxy** (via Vercel, leveraging the server-side `ANTHROPIC_API_KEY` env var)
- Processing mode: Adaptive (Foundation 8 → Expansion 12 → Placement 18 batch tiers)
- Initial Prompt V2 pasted: 35,921 characters
- Topics Layout Table Primer V2 pasted: 15,208 characters
- Seed words: `bursitis`

### 6.5.1 — BUG: Adaptive Thinking mode produces 0 output tokens on large prompts

**Symptom:** With Thinking=Adaptive and the 51k-char prompt loaded, the model entered thinking phase and ran for ~4:58 of wall time on each of 3 attempts, then the stream completed with "Input: 183, Output: 0 tokens." The "Input: 183" is misleading — it's cache-miss tokens reported by the streaming usage event, not total input. Total input was ~13,584 tokens per attempt.

**Root cause hypothesis:** Adaptive Thinking does not cap the thinking token budget. On complex/large prompts, the model consumes its entire `max_tokens=128000` allocation during the silent thinking phase with no room left to emit output text. The stream's final usage event reports 0 output tokens because none were ever generated.

**Workaround confirmed working:** Change Thinking dropdown from "Adaptive" to "Enabled", set Budget to 12000. Batch 1 with this setting: thinking phase ~1:55, output phase ~1:49, total batch time ~3:51, 14,752 output tokens generated, validation passed, 8 topics on canvas. Cost: $0.257 for batch 1 (no cache hit yet).

**Fix recommendation:** In the Auto-Analyze component, when Adaptive is selected but the combined system prompt exceeds ~40k chars, the tool should warn the user that Adaptive may fail and suggest switching to Enabled with a safe budget. Alternatively, detect the "0 output tokens" failure signature and auto-fall-back to Enabled.

### 6.5.2 — BUG: Mode A (full-table) produces invalid output as the topics table grows

**Symptom:** Batch 2 with Thinking=Enabled 12k budget succeeded in producing 17,399 output tokens but the model's response **dropped 4 pre-existing topics from batch 1 and lost 8 keywords.** The validation check (HC5 — lost keywords — zero tolerance) correctly rejected the response and triggered a retry with correction context.

Across 3 attempts on batch 2:
- Attempt 1: 17,399 output tokens, dropped 4 topics + lost 8 keywords → validation failed
- Attempt 2: 0 output tokens — stream ran 4:59 wall time (suspicious — Vercel's 5-min ceiling) → retry triggered
- Attempt 3: 16,552 output tokens, dropped 6 topics + lost 2 keywords → validation failed → batch 2 marked FAILED, tool moved to batch 3

The tool's 3-attempt retry cap worked as designed. But the 8 keywords from batch 2 remain unsorted.

**Root cause:** Mode A requires the model to transcribe the full existing topics table AND add new rows for the current batch. As the table grows, the model's attention degrades and it omits rows — effectively "summarizing by omission." The prompt explicitly forbids deleting topics, but the model does it anyway. This is a known pattern with long-context generation.

**Design gap:** The docs describe a Mode A → Mode B auto-switch that's supposed to kick in on truncation. It did not trigger on these validation failures because the responses weren't truncated — they were omission-complete. **The auto-switch condition needs to include validation failures from dropped-topics / lost-keywords, not just truncation.**

**Fix recommendations:**
1. Broaden the Mode A → Mode B trigger to include validation failures from lost data
2. Consider making Mode B (delta) the default after batch 1 (when the topics table has any content)
3. Consider splitting very large prompts across system + cached + user-message boundaries more deliberately to leverage Anthropic's prompt caching further

### 6.5.3 — BUG: Vercel 5-minute timeout is a real ceiling, and it's close

**Symptom:** Batch 2 attempt 2 took exactly 4:59 wall time from request start to stream-complete — within 1 second of Vercel's 5-minute serverless function timeout — and returned 0 output tokens. Possible that Vercel killed the stream.

**Implication:** For any batch that takes longer than ~4:30 wall time on Server mode, we're at risk of this ceiling. And batches get slower as the table grows (more input tokens, more thinking needed to manage existing state).

**Workaround:** Switch API Mode dropdown to "Direct (browser → Anthropic)". This routes requests from the user's browser straight to Anthropic, bypassing Vercel entirely, with no timeout. Downside: the user must paste their own Anthropic API key into the tool's UI (stored in React state only — same persistence caveats as the prompts).

**Design recommendation:** For Projects with > N keywords (where N is small enough that expected per-batch times stay safely under 4 minutes), Server mode is fine. For larger Projects, Direct mode should be the default. A UI hint could surface this based on keyword count.

### 6.5.4 — UX bug: Budget input field snaps back to default on empty

**Symptom:** When editing the "Budget" number input, deleting all characters causes the field to auto-refill with the default value (10000) before the user can type their new number. The user is forced to triple-click to select-all, then type.

**Code location:** `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` line ~1514: `onChange={e => setThinkingBudget(parseInt(e.target.value) || 10000)}`. The `|| 10000` fallback fires whenever `parseInt("")` returns NaN.

**Fix:** Allow an empty string during editing. Only enforce the default on blur or on form submit.

### 6.5.5 — UX need: Auto-Analyze overlay should be resizable and movable

**User request:** The overlay should be draggable via its top bar (move to any position on screen) and resizable via a drag-handle on its bottom-right corner. Currently it's a fixed-position panel.

### 6.5.6 — Documentation drift corrected (Pattern 3 / Pattern 11 adjacent)

During this session, three doc drifts from prior claude.ai chats were discovered via code reading:

1. **`DATA_CATALOG.md` §5.8** and **`KEYWORD_CLUSTERING_ACTIVE.md` §4** both claimed the `kst_aa_apikey`, `kst_aa_model`, `kst_aa_initial_prompt`, `kst_aa_primer_prompt` localStorage keys exist. **They don't.** Grep confirmed zero matches in `/src/`. Fixed in both docs this session.

2. **`KEYWORD_CLUSTERING_ACTIVE.md` §4** claimed the checkpoint key uses `projectWorkflowId`. **Code uses `projectId`** (line 227: `const cpKey = 'aa_checkpoint_' + projectId;`). Fixed.

3. **Implicit assumption** that the "Initial Prompt v2" was retrievable from somewhere. In fact it's stored only in the user's separate text files + inside `keyword_sorting_tool_v18.html` on the user's laptop. Nothing in the repo or database holds the prompt content. Recommendation: commit `docs/AUTO_ANALYZE_PROMPT_V2.md` containing the canonical V2 Initial + Primer prompts — source-of-truth in the repo, not in ephemeral browser state or scattered files. **Logged as a follow-up task for the next session.**

### 6.5.7 — Session verdict

Phase 1g-test was **partially completed**: we confirmed the tool works end-to-end in principle, found the major tuning path (Thinking: Enabled 12k), identified several bugs and doc drifts, and produced a concrete punch-list for a Phase 1g-test follow-up session. The Bursitis Project's 2,328 keywords are not yet fully clustered — that's a dedicated follow-up run, ideally in Direct mode, with Mode A→B auto-switch behavior revisited first.

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
- **Phase 1g-test (PARTIAL — 2026-04-18):** First live run completed; Sonnet+Adaptive-Thinking bug found + workaround confirmed; Mode A omission failure identified. See §6.5 for details.
- **Phase 1g-test follow-up (🎯 NEXT PRIORITY):** Second tuning pass. Scope:
  1. Commit canonical V2 Initial + Primer prompts to `docs/AUTO_ANALYZE_PROMPT_V2.md` (source of truth in repo, not scattered files)
  2. Broaden Mode A → Mode B auto-switch trigger to include validation failures (currently only triggers on truncation)
  3. Fix Budget input UX bug (allow empty string during editing; default on blur)
  4. Add UI hint recommending Direct mode for larger Projects (Vercel 5-min timeout risk)
  5. Do a full clustering run on Bursitis (2,328 keywords) with Direct + Enabled-12k + expectation of Mode B operation after batch 1
- **Phase 1-polish (NEW items added 2026-04-18):**
  - Auto-Analyze overlay should be **resizable** (drag bottom-right corner) AND **movable** (drag top bar)
  - Budget input field UX bug (see §6.5.4)
  - Warn user in UI when Adaptive Thinking is selected with a large prompt (risk of 0 output tokens)
  - Persist Auto-Analyze settings (prompts, apiKey, model, etc.) in `UserPreference` so they survive panel close / page refresh even before a run starts
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
