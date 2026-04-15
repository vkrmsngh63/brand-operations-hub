# Brand Operations Hub — Developer Handoff
## Complete Documentation for Chat Continuation
## Last Updated: April 14, 2026

---

## 0. TERMINOLOGY & NAMING CONVENTIONS

**Brand Operations Hub** — The overall application name. Will become a multi-tool enterprise collaboration platform with 12+ workflow tools, role-based access, activity tracking, admin oversight, real-time collaboration, and AI automation.

**Workflows** — Each operational area accessed from the post-login landing page:
- **Keyword Clustering** (active — migrated from original ~17,691-line HTML tool)
- Competition Scraping & Analysis (coming soon)
- Conversion Funnel Creation (coming soon)
- Content Development (coming soon)
- Multi-Media Assets Development (coming soon)
- Post-Launch Review Generation (coming soon)
- Clinical Evidence & Endorsement Generation (coming soon)
- IP Development (coming soon)
- Post Launch Improvement (coming soon)
- Exit Strategy (coming soon)

---

## 1. PROJECT OVERVIEW

**Stack:** Next.js 16 (App Router, TypeScript, Tailwind), Prisma 6, Supabase (Postgres + Auth + Realtime), Vercel hosting (may migrate to Railway/AWS for scale).
**Repo:** Private GitHub repository (`vkrmsngh63/brand-operations-hub`), developed in GitHub Codespaces.
**Domain:** https://vklf.com (Vercel auto-deploy from `main` branch).
**Codespace path:** `/workspaces/brand-operations-hub`

---

## 2. PLATFORM VISION — CRITICAL CONTEXT

This tool is being built toward a **multi-tenant, real-time collaboration platform**:

- **Multi-user:** 5–10 people on the same project/table simultaneously, scaling to 100+ concurrent users across hundreds of projects
- **Real-time sync:** Changes must appear instantly for all connected users (like Google Docs)
- **Scale:** 10,000+ keywords per table, hundreds of canvas nodes
- **Role-based access:** Admin, manager, worker roles with per-tool and per-functionality permissions
- **Activity tracking:** Every action logged. Admin can monitor, approve/disapprove, and give feedback.
- **Future platform features:** Live chat, video chat, training material system, payment system, automatic reminders, cross-tool data pipelines
- **Builder:** The user (non-programmer) working with Claude. No dev team planned near-term. All instructions must be step-by-step with exact commands.

**Architecture implication:** Every data hook, API endpoint, and component must be designed with multi-user and real-time in mind going forward.

---

## 3. DATABASE SCHEMA (Prisma)

6 tables: **Project**, **Keyword**, **CanvasNode**, **Pathway**, **SisterLink**, **CanvasState**.

Key fields on CanvasNode:
```
id, projectId, title, description, x, y, w, h, baseY, pathwayId, parentId,
relationshipType, linkedKwIds (JSON), kwPlacements (JSON), collapsedLinear,
collapsedNested, narrativeBridge, altTitles (JSON), userMinH, connCP, connOutOff,
connInOff, sortOrder
```

Schema file: `prisma/schema.prisma`

---

## 4. APPLICATION ARCHITECTURE

### Key Files
| File | Purpose |
|------|---------|
| `src/app/keyword-clustering/page.tsx` | Page shell, project selector, `aiMode` state, uses `authFetch` |
| `src/app/keyword-clustering/components/KeywordWorkspace.tsx` | Main workspace — lifts `useCanvas`, connects all panels, auto-save indicator |
| `src/app/keyword-clustering/components/CanvasPanel.tsx` | SVG mindmap canvas + keyword preview + popover |
| `src/app/keyword-clustering/components/CanvasEditPanel.tsx` | Right-side edit drawer (320px) |
| `src/app/keyword-clustering/components/CanvasTableMode.tsx` | 9-column funnel table view |
| `src/app/keyword-clustering/components/ASTTable.tsx` | All Search Terms table (200ms debounced search) |
| `src/app/keyword-clustering/components/MTTable.tsx` | Main Terms table |
| `src/app/keyword-clustering/components/TIFTable.tsx` | Terms In Focus table |
| `src/app/keyword-clustering/components/TVTTable.tsx` | Topics View Table |
| `src/app/keyword-clustering/components/KASTable.tsx` | Keywords Analysis Table |
| `src/app/keyword-clustering/components/AutoAnalyze.tsx` | Auto-Analyze overlay (diff-based atomic rebuild) |
| `src/hooks/useKeywords.ts` | Keyword CRUD hook (uses `authFetch`, bulk endpoints, saving state) |
| `src/hooks/useCanvas.ts` | Canvas CRUD hook (uses `authFetch`) |
| `src/lib/auth.ts` | Server-side JWT verification + project ownership |
| `src/lib/authFetch.ts` | Client-side fetch wrapper with JWT token |
| `src/lib/supabase-server.ts` | Server-side Supabase client (lazy init with service role key) |
| `src/lib/db.ts` | Prisma client singleton |
| `src/app/api/ai/analyze/route.ts` | Server-side API proxy for Anthropic (JWT-protected) |
| `src/app/api/projects/[projectId]/canvas/rebuild/route.ts` | Atomic canvas rebuild endpoint |

### API Routes (ALL JWT-protected)
| Route | Methods | Notes |
|-------|---------|-------|
| `/api/projects` | GET, POST | List/create projects for authenticated user |
| `/api/projects/[projectId]` | GET, PATCH, DELETE | Single project with ownership check |
| `/api/projects/[projectId]/keywords` | GET, POST, PATCH, DELETE | Keywords — PATCH is bulk with `$transaction` |
| `/api/projects/[projectId]/keywords/[keywordId]` | PATCH, DELETE | Single keyword ops |
| `/api/projects/[projectId]/canvas` | GET, PATCH | Canvas state (viewport, zoom, counters) |
| `/api/projects/[projectId]/canvas/nodes` | GET, POST, PATCH, DELETE | Nodes — PATCH is bulk with `$transaction` |
| `/api/projects/[projectId]/canvas/rebuild` | POST | Atomic canvas rebuild (upserts, deletes, pathways, sister links in one transaction) |
| `/api/projects/[projectId]/canvas/pathways` | POST, DELETE | Pathway CRUD |
| `/api/projects/[projectId]/canvas/sister-links` | POST, DELETE | Sister link CRUD |
| `/api/ai/analyze` | POST | Anthropic API proxy (JWT-protected, 5min timeout) |

### Architecture Rules
- `useCanvas` is lifted to `KeywordWorkspace` and passed as `canvas` prop to `CanvasPanel` — CanvasPanel does NOT call `useCanvas` internally
- TVT and KAS accept `nodes`, `updateNodes`, `allKeywords` as props from KeywordWorkspace
- `aiMode` state lives in `page.tsx` and is passed as prop to `KeywordWorkspace`
- Canvas multi-select uses `selectedIds: Set<number>` — drag/selection handlers use `viewXRef`/`viewYRef`/`zoomRef` refs to avoid stale closures
- Single-click on canvas nodes selects only; right-click opens edit panel; double-click renames inline
- TSV export includes hidden X/Y columns; TSV import has Merge vs Overwrite modes
- Canvas node overlap resolution (`resolveOverlap`) must run BEFORE `updateNodes()` save call
- `xlsx` npm package must be loaded via dynamic `await import('xlsx')` inside handlers (NOT top-level) to avoid SSR build failures

---

## 5. AUTHENTICATION SYSTEM (Implemented in Phase 1-foundation)

### Server-Side Auth Flow
1. Client calls `supabase.auth.getSession()` to get JWT token
2. `authFetch()` wrapper attaches token as `Authorization: Bearer <token>` header
3. API routes call `verifyAuth(req)` or `verifyProjectAuth(req, projectId)`
4. `verifyAuth` extracts token, calls `getSupabaseAdmin().auth.getUser(token)` to verify
5. `verifyProjectAuth` additionally checks `project.userId === auth.userId` for ownership

### Key Files
- `src/lib/supabase-server.ts` — Lazy-initialized Supabase admin client using `SUPABASE_SERVICE_ROLE_KEY`
- `src/lib/auth.ts` — `verifyAuth()` and `verifyProjectAuth()` functions
- `src/lib/authFetch.ts` — Client-side `authFetch()` drop-in replacement for `fetch()`

### Environment Variables Required
| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | .env.local + Vercel | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | .env.local + Vercel | Supabase anonymous/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | .env.local + Vercel | Supabase secret key for server-side auth |
| `ANTHROPIC_API_KEY` | .env.local + Vercel | Anthropic API key for server-mode Auto-Analyze |
| `DATABASE_URL` | .env.local + Vercel | Supabase Postgres connection string |
| `DIRECT_URL` | .env.local + Vercel | Supabase Postgres direct connection |

### Previous Auth (REMOVED)
- ~~`x-user-id` client header~~ — Eliminated. All routes now use JWT verification.
- ~~`userId` parameter in `useKeywords`~~ — Removed. Hook now takes only `projectId`.

---

## 6. BULK API ENDPOINTS (Implemented in Phase 1-foundation)

### Keywords Bulk PATCH
`PATCH /api/projects/[projectId]/keywords`
```json
{ "keywords": [{ "id": "abc", "sortingStatus": "AI-Sorted" }, ...] }
```
All updates in a single Prisma `$transaction`. Returns `{ updated: N }`.

Used by `useKeywords.batchUpdate()` (single request instead of N+1) and `useKeywords.reorder()` (single request for all sortOrder changes).

### Canvas Nodes Bulk PATCH
`PATCH /api/projects/[projectId]/canvas/nodes`
```json
{ "nodes": [{ "id": 1, "x": 100, "y": 200 }, ...] }
```
All updates in a single Prisma `$transaction`.

### Atomic Canvas Rebuild
`POST /api/projects/[projectId]/canvas/rebuild`
```json
{
  "nodes": [{ "id": 1, "title": "...", ... }],
  "pathways": [{ "id": 1 }],
  "sisterLinks": [{ "nodeA": 1, "nodeB": 2 }],
  "canvasState": { "nextNodeId": 10, "nextPathwayId": 3 },
  "deleteNodeIds": [5, 6],
  "deletePathwayIds": [2],
  "deleteSisterLinkIds": ["uuid-1"]
}
```
Node upserts (create or update by ID), pathway upserts, sister link creates, deletions — ALL in one `$transaction`. If any operation fails, everything rolls back.

Used by Auto-Analyze `doApply()` function.

---

## 7. CANVAS NODE RENDERING

Node layout zones: Title (22px) → Alt titles (14px) → Description (flexible) → Keyword preview (36px, always reserved) → Badge (18px)

Key constants in `CanvasPanel.tsx`: `NODE_W = 220`, `NODE_H = 160`, `KW_PREVIEW_H = 36`

**FIXED:** AutoAnalyze.tsx `NODE_H` now matches CanvasPanel at `160` (was incorrectly `120`).

---

## 8. AUTO-ANALYZE SYSTEM

Two API modes (Direct / Server), streaming SSE, stall retries, adaptive batch sizing, full-table → delta auto-switch, 5 hard + 7 soft validation checks, checkpoint persistence.

### Canvas Apply — Diff-Based Atomic Rebuild (Phase 1g-rebuild)
The `doApply()` function in AutoAnalyze.tsx was rebuilt in Phase 1g-rebuild:
- **Old approach (REMOVED):** Delete all nodes → recreate all → multiple separate API calls. Destructive — partial failure left broken canvas.
- **New approach:** Diff-based. Matches AI output titles against existing nodes. Reuses existing node IDs/positions/customizations. Builds complete state, sends to `/canvas/rebuild` in single atomic transaction. If anything fails, all changes roll back.

Key improvements:
- Preserves user customizations (manual position tweaks, descriptions) on existing nodes
- New nodes get auto-layout; existing nodes keep their position
- Pathways reused when existing depth-0 nodes already have them
- Sister links built and applied atomically
- Single transaction = no half-built canvas states

---

## 9. UI FEATURES ADDED IN THIS CHAT

### Auto-Save Indicator (Phase 1-foundation)
- Located in topbar of KeywordWorkspace
- Shows "Saving…" (amber) during any save operation, "Saved ✓" (green) when idle
- Tracks all operations: addKeyword, updateKeyword, batchUpdate, reorder
- Uses `savingCount` ref for concurrent save tracking in `useKeywords.ts`

### AST Search Debounce (Phase 1-foundation)
- 200ms debounce on the main keyword search input in ASTTable.tsx
- Uses `searchInput` (immediate) + `searchQ` (debounced) dual state pattern
- Enter key bypasses debounce for immediate search
- Clear all also resets `searchInput`

---

## 10. UI MODES

**Manual Mode:** 3-panel left (AST + MT + TIF) + Topics Layout Canvas. 4 visibility checkboxes.
**AI Mode:** Single Keywords Working Area (4 views) + Canvas. Action buttons per view:
- Normal: Uncheck All, Check First 15, Generate AI Prompt, Upload Response, Auto-Analyze
- Common: Smaller Clusters, Generate AI Prompt, Upload Response
- Analysis: Copy Table Data
- Topics: Expand/Collapse All, Check/Uncheck All, Filter Depths, Description toggle, Zoom

---

## 11. SAFETY PROTOCOL — CRITICAL

**Before replacing ANY existing file:** backup first (`cp file file.bak`), verify line count after, never provide partial files, always build before push, always ask user to visually confirm.

**Codespaces:** Push to GitHub → wait for Vercel auto-deploy → test at https://vklf.com (Ctrl+Shift+R). Do NOT troubleshoot PORTS tab.

**User context:** Complete novice. Step-by-step instructions with exact commands always. Never assume knowledge.

---

## 12. DATA PERSISTENCE AUDIT — CRITICAL

### Storage Strategy
| Data Type | Storage Target | Reason |
|-----------|---------------|--------|
| User data (MT entries, TIF entries, AA config/prompts, Removed Terms) | **Database** | Survives everything |
| UI preferences (zoom, column visibility, panel sizes) | **localStorage** (project-scoped: `kst_${projectId}_key`) | Lightweight, device-specific |
| Ephemeral state (search queries, selections, drag state) | **React state only** | Acceptable to lose |

### MUST FIX (user loses work) → Database:
1. MT Table entries  2. AA config  3. AA prompts  4. **Removed Terms** (currently React state only in ASTTable.tsx)

### SHOULD FIX (annoying UX) → localStorage (project-scoped):
5. Panel visibility  6. AST column toggles  7. AST status filters  8. AST zoom  9. AI table view  10. Canvas mode  11. Canvas collapsed nodes  12. TIF entries  13. TIF active/paused

### NICE TO HAVE → localStorage:
14. Panel flex ratios  15. Detached panel states

---

## 13. MIGRATION GAP ANALYSIS

Features from original HTML tool never included in migration plan:

**Must Migrate:** Generate AI Prompt overlay, Canvas undo (universal — all operations), Conversion Path Pages Box

**Should Migrate:** Canvas copy/cut/paste nodes, 7 canvas toolbar toggles, Keyword transfer between nodes, Export PNG, Snap-to-parent on drag, AI Mode Uncheck All + Check First 15

**Nice to Have:** Exit Conversion Path, Unlink KWs, Narrative bridge dots, Keyword tooltip, Separate pathways, Node count badge

**Needs Verification:** Fit to Screen, Clear Canvas, Context menu completeness, Keyboard shortcuts, Change Password, Topbar Removed Terms button

**Stubs (no migration needed):** Upload AI Prompt Response, Create Smaller Clusters

---

## 14. TECH DEBT — DEFERRED ITEMS

These were identified in Phase 1-foundation but deferred as higher-risk refactors:

| Item | Risk | Notes |
|------|------|-------|
| Extract shared Keyword type to `src/types/keyword.ts` | Medium | Currently defined separately in useKeywords, AutoAnalyze, ASTTable |
| Unify volume type (Prisma `Int` vs TS `string`) | Medium | Touches many files + Prisma schema |
| Fix mutable state in CanvasPanel drag handlers | High | Drag handlers directly mutate nodes array; should use overlay ref |
| Fix ASTRow memoization | Medium | `React.memo` defeated by passing many props; pass only per-row data |
| Add error state to `useCanvas` hook | Low | Currently only useKeywords has error state |
| Add error display + retry buttons in UI | Low | When fetches fail, no user feedback |
| Add optimistic update rollback on failure | Medium | Some hooks do this, others don't |

---

## 15. PHASE STATUS

| Phase | Status |
|-------|--------|
| Phases 0, 1a–1f | ✅ COMPLETE |
| Phase 1g — Auto-Analyze | ✅ CODE COMPLETE |
| **Phase 1-foundation — Security, Bulk APIs, Code Quality** | ✅ **COMPLETE** |
| **Phase 1g-rebuild — Atomic Canvas Rebuild** | ✅ **COMPLETE** |
| Phase 1g-test — Auto-Analyze Testing (9 items) | ❌ NOT STARTED |
| Phase 1-verify — Verify Existing Features (6 items) | ❌ NOT STARTED |
| Phase 1-gap — Migrate Missing Features (15 items) | ❌ NOT STARTED |
| Phase 1-persist — Data Persistence (15 items) | ❌ NOT STARTED |
| Phase 1h — .kst Export + Reset | ❌ NOT STARTED |
| Phase 1-realtime — Real-Time Multi-User | ❌ Needed within 1–2 months |
| Phase 1-collab — Activity Tracking & Roles | ❌ NOT STARTED |
| Phase 1-review — Comprehensive Review | ❌ NOT STARTED |

**Next up:** Phase 1g-test → Phase 1-verify → Phase 1-gap → 1-persist → 1h → 1-realtime → 1-collab → 1-review

---

## 16. GIT HISTORY (This Chat)

| Commit | Description |
|--------|-------------|
| `d9f8855` | (baseline — state before this chat) |
| (next) | Phase 1-foundation: server-side JWT auth on all API routes |
| (next) | Fix: lazy init Supabase server client to avoid build-time error |
| (next) | Phase 1-foundation: bulk API endpoints with Prisma transactions + canvas rebuild |
| (next) | Phase 1-foundation: code quality fixes — NODE_H mismatch, search debounce, auto-save indicator |
| (next) | Phase 1-foundation: proper auto-save indicator tracking all save operations |
| `539aa81` | Phase 1g-rebuild: diff-based atomic canvas rebuild for Auto-Analyze |
