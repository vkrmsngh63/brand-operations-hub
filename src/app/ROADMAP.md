# Brand Operations Hub — Development Roadmap
## Last Updated: April 14, 2026

---

## Phase 0 — Foundation Setup: COMPLETE
- [x] GitHub repo, Codespaces, Next.js 16, Supabase, Login, Dashboard, Vercel, Domain, Docs

## Phase 1a–1f — Core Migration: COMPLETE
- [x] Data Layer, AST Table, MT + TIF Tables, Topics Layout Canvas, Canvas Table Mode, AI Mode + KAS + TVT

## Phase 1g — Auto-Analyze System: CODE COMPLETE
- [x] All auto-analyze code (streaming, batching, validation, prompts, checkpoint, etc.)

---

## Phase 1-foundation — Tech Debt & Security: ✅ COMPLETE

### Security — ✅ DONE
- [x] Server-side Supabase JWT verification on all API routes (`src/lib/auth.ts`)
- [x] `verifyAuth()` for user-level routes, `verifyProjectAuth()` for project-level routes
- [x] Client-side `authFetch()` wrapper sends JWT automatically (`src/lib/authFetch.ts`)
- [x] Lazy-init Supabase server client to avoid build-time errors (`src/lib/supabase-server.ts`)
- [x] Remove trust of `x-user-id` client header — fully eliminated
- [x] AI analyze route (`/api/ai/analyze`) protected with JWT
- [x] `SUPABASE_SERVICE_ROLE_KEY` configured in both .env.local and Vercel

### Bulk API Endpoints — ✅ DONE
- [x] `PATCH /api/projects/{id}/keywords` — bulk update with `$transaction`
- [x] `POST /api/projects/{id}/canvas/rebuild` — atomic canvas rebuild (upserts + deletes in one transaction)
- [x] Canvas nodes PATCH wrapped in `$transaction` (was `Promise.all`)
- [x] `useKeywords.batchUpdate` wired to bulk endpoint (was N+1 individual PATCHes)
- [x] `useKeywords.reorder` wired to bulk endpoint (was N+1 individual PATCHes)

### Code Quality Fixes — PARTIALLY DONE
- [x] Fix NODE_H mismatch: AutoAnalyze.tsx `NODE_H = 120` → `160` to match CanvasPanel
- [x] Add 200ms debounce on AST search input (dual state: `searchInput` + `searchQ`)
- [x] Add auto-save indicator ("Saved ✓" / "Saving…") in topbar with `saving` state in useKeywords
- [ ] **DEFERRED:** Fix volume type — unify Prisma `Int` + TypeScript `string` → consistent `number`
- [ ] **DEFERRED:** Extract shared `Keyword` type to `src/types/keyword.ts`
- [ ] **DEFERRED:** Fix mutable state in CanvasPanel drag handlers (use overlay ref)
- [ ] **DEFERRED:** Fix ASTRow memoization (pass per-row data, not entire Map objects)

### Error Handling — NOT STARTED (DEFERRED)
- [ ] Add error state to `useCanvas` hook
- [ ] Add error display + retry buttons in UI
- [ ] Add optimistic update rollback on failure

---

## Phase 1g-rebuild — Auto-Analyze Canvas Rebuild: ✅ COMPLETE

- [x] Replaced destructive delete-all → recreate-all with diff-based approach
- [x] Uses atomic `POST /api/projects/{id}/canvas/rebuild` endpoint
- [x] Preserves user customizations (position, size, descriptions) on existing nodes
- [x] Handles partial failure with transaction rollback
- [x] Pathways reused for existing depth-0 nodes; new pathways created atomically
- [x] Sister links built and applied in same transaction
- [x] Single API call instead of dozens of individual create/update/delete calls

---

## Phase 1g-test — Auto-Analyze Testing: NOT STARTED — NEXT PRIORITY

Run after 1g-rebuild (✅ done). 9 test items:
- [ ] Keyword preview pills (blue for primary, purple for secondary)
- [ ] Keywords linked immediately (no refresh needed after auto-analyze)
- [ ] Depth-0 linear chain connections (conversion funnel flow)
- [ ] Checkpoint persistence (pause → refresh browser → resume from checkpoint)
- [ ] Sister links (dashed purple lines between nodes)
- [ ] Full multi-batch end-to-end run (multiple batches complete successfully)
- [ ] AI-Sorted status marking (keywords marked blue after placement)
- [ ] Activity log (progress percentages, timing, cost tracking)
- [ ] Stall recovery (auto-retry on stalled API responses)

---

## Phase 1-verify — Verify Existing Features: NOT STARTED

- [ ] Fit to Screen button
- [ ] Clear Canvas button
- [ ] Right-click context menu completeness (Copy/Paste/Select All/Deselect All)
- [ ] Keyboard shortcuts (Ctrl+C/X/V/Z/A, Delete)
- [ ] Change Password (in-app vs Supabase dashboard)
- [ ] Topbar "All Removed Search Terms" button

---

## Phase 1-gap — Migrate Missing Features: NOT STARTED

**Must migrate:**
- [ ] Generate AI Prompt overlay (seed words, customizable prompt, Selected Search Terms table, Conversion Funnel table, Copy Table Data, Copy Funnel Data, Update button, persistence)
- [ ] Universal undo system — Ctrl+Z for ALL operations (keywords, tags, topics, canvas nodes, everything)
- [ ] Conversion Path Pages Box (pathway browser, per-pathway views, Select/Deselect All)

**Should migrate:**
- [ ] Canvas copy/cut/paste nodes (Ctrl+C/X/V + toolbar toggle)
- [ ] Canvas toolbar toggles (7): KW Details, Borders, Labels, Expanded KW View, KW Volume, Lock Relationships, All Conversion Pathways
- [ ] Canvas keyword transfer between nodes (copy/cut from edit panel, paste into another)
- [ ] Canvas export PNG
- [ ] Canvas snap-to-parent on drag
- [ ] AI Mode: Uncheck All + Check First 15 buttons

**Nice to have:**
- [ ] Exit Conversion Path, Unlink KWs, Narrative bridge dots, Keyword tooltip, Separate pathways, Node count badge

---

## Phase 1-persist — Data Persistence Fixes: NOT STARTED

**Must fix → Database:**
- [ ] MT Table entries
- [ ] Auto-Analyze config (API key, model, seed words, all settings)
- [ ] Auto-Analyze prompts (Initial Prompt, Primer Prompt)
- [ ] Removed Terms (archived keywords — currently lost on refresh)

**Should fix → localStorage (project-scoped: `kst_${projectId}_key`):**
- [ ] Panel visibility, AST column toggles, AST status filters, AST zoom
- [ ] AI table view, Canvas mode, Canvas collapsed nodes
- [ ] TIF entries, TIF active/paused

**Nice to have → localStorage:**
- [ ] Panel flex ratios, Detached panel states

---

## Phase 1h — Download/Upload .kst + Reset Tool: NOT STARTED

Build AFTER all features are migrated and persistence is fixed.

- [ ] Export `.kst` JSON file (tool-specific for Keyword Clustering, with `schemaVersion` field)
- [ ] Import from `.kst` file (exact state restoration, Merge vs Overwrite)
- [ ] Reset Tool function (clear project data, confirmation dialog)

---

## Phase 1-realtime — Real-Time Multi-User: NOT STARTED — NEEDED WITHIN 1–2 MONTHS

### Server-Side Data Handling (required for 10K+ keywords)
- [ ] Server-side pagination for keywords (cursor-based)
- [ ] Server-side search/filtering
- [ ] Server-side sorting

### Real-Time Sync (Supabase Realtime)
- [ ] Subscribe to keyword changes
- [ ] Subscribe to canvas node changes
- [ ] Subscribe to canvas state changes (pathways, sister links)
- [ ] Conflict resolution strategy
- [ ] Presence indicators

### Project Sharing
- [ ] Invite users to a project
- [ ] Project member list with role assignment
- [ ] Per-project permissions

---

## Phase 1-collab — Activity Tracking & Roles: NOT STARTED

### Activity Logging
- [ ] Database table for activity log
- [ ] Log every mutation
- [ ] Activity feed UI

### Admin Features
- [ ] Admin can view activity log
- [ ] Admin can approve/disapprove actions
- [ ] Admin can leave feedback
- [ ] Admin dashboard

### Role-Based Access
- [ ] User roles table (admin, worker)
- [ ] Per-tool access control
- [ ] Per-functionality permissions

---

## Phase 1-review — Comprehensive UX & Quality Review: NOT STARTED

- [ ] Feature parity audit (all 21 sections of KST_Features_Tour_v15.md)
- [ ] Visual comparison
- [ ] Interaction testing
- [ ] Data flow verification
- [ ] Edge cases
- [ ] Performance benchmarking
- [ ] Multi-user stress test
- [ ] UX improvement recommendations

---

## Phase 2+ — Future Workflows & Platform: NOT STARTED

- Competition Scraping & Analysis
- Conversion Funnel Creation
- Content Development
- Remaining 8 workflows
- Live chat, Video chat, Training system, Payment system
- Automatic reminders, Cross-tool data pipelines
- Hosting migration (Vercel → Railway/AWS if needed)

---

## EXECUTION ORDER

```
1g-test → 1-verify → 1-gap → 1-persist → 1h → 1-realtime → 1-collab → 1-review
```

(1-foundation ✅ and 1g-rebuild ✅ are complete.)

---

## Reference

- Original tool: `keyword_sorting_tool_v18.html`
- Original architecture: `KST_Handoff_v18.md`
- Original features: `KST_Features_Tour_v15.md`
