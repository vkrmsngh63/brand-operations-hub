# Brand Operations Hub — Development Roadmap

---

## Phase 0 — Foundation Setup: COMPLETE

- [x] GitHub repository created (private)
- [x] GitHub Codespaces configured (browser-based development)
- [x] Next.js 16 project initialized (TypeScript, Tailwind, App Router)
- [x] Supabase project created (auth + database)
- [x] Login page built (dark theme, Supabase email/password auth)
- [x] Dashboard landing page built (11 workflow cards, 2 sections)
- [x] Deployed to Vercel (auto-deploys from GitHub)
- [x] Custom domain connected (vklf.com)
- [x] Documentation structure created (HANDOFF.md, ROADMAP.md, docs/)

---

## Phase 1 — Keyword Clustering Migration: IN PROGRESS

### 1a. Data Layer: COMPLETE
- [x] Prisma 6 installed and configured
- [x] Database schema defined (6 tables: Project, Keyword, CanvasNode, Pathway, SisterLink, CanvasState)
- [x] Schema pushed to Supabase (tables created)
- [x] Prisma client helper created (src/lib/db.ts)
- [x] API routes for Project CRUD (list, create, get, update, delete)
- [x] API routes for Keyword CRUD (create, read, update, delete, bulk import, bulk delete)
- [x] API routes for Canvas CRUD (nodes, pathways, sister links, canvas state)
- [x] Dashboard Keyword Clustering card wired to navigate to /keyword-clustering
- [x] Keyword Clustering page shell with project selector (create, open, delete projects)

### 1b. AST Table: COMPLETE

#### 1b-core: COMPLETE
- [x] ASTTable React component with all 7 columns (checkbox, keyword, volume, sorting status, tags, topics, topic descriptions)
- [x] Virtual scrolling (tested with 2330+ rows)
- [x] Keyword search with whole-word matching
- [x] Status filter checkboxes (Sorted, Partial, Unsorted)
- [x] Column visibility toggles (Vol, Tags, Topics, Topic Descriptions)
- [x] Status pills with color coding (gray/orange/green/blue) and click-to-cycle
- [x] Add row (type keyword + Enter)
- [x] Excel paste — bulk import with duplicate/header row detection
- [x] Row selection (checkbox + keyword click), select-all with indeterminate state
- [x] Remove keyword (single + bulk when rows selected)
- [x] Google search button per row
- [x] Tag pill click to filter + yellow filter bar
- [x] Tag header search + topic header search
- [x] Sort by Volume button
- [x] Show All reset button
- [x] Zoom controls (7–18px range)
- [x] Toast notifications
- [x] useKeywords hook (fetch, add, bulkImport, update, batchUpdate, delete, bulkDelete, reorder)
- [x] KeywordWorkspace wrapper connecting ASTTable to API
- [x] Page layout with h-screen + flex-col + overflow-hidden for proper virtual scroll
- [x] API fix: volume field parseInt() conversion for single and bulk import

#### 1b-interact: COMPLETE
- [x] Drag-to-reorder rows via ⁞ handle with blue line drop indicators
- [x] Reorder persists to database (batch PATCH sortOrder with error handling)
- [x] Removed Terms overlay (archive on remove, 🗑 button with badge, full overlay, ↩ restore, Escape to close)
- [x] Bulk remove archives all selected rows

#### 1b-tags: COMPLETE
- [x] Inline tag editing (click pill to edit, click + to add, clear to delete)
- [x] Batch tag operations (add/remove tags propagated across all selected rows)
- [x] Right-click tag pill to filter, left-click to edit
- [x] TagCell separate component with own editing state

#### 1b-controls: COMPLETE
- [x] Copy Table Data button (copies visible rows as TSV to clipboard)
- [x] CSV download button (downloads all keywords as CSV file)
- [x] Column resize drag handles with full-height gridlines on all cells

#### 1b-topics: COMPLETE
- [x] Inline topic pill editing in AST (TopicCell — click pill to edit, click + to add, clear to delete, pipe '|' delimiter)
- [x] Batch topic editing across selected rows in AST (delta propagation — same logic as tag batch editing)
- [x] Right-click topic pill to filter in AST (yellow "📌 Filtering by topic" bar with toggle and ✕ clear)
- [x] Topic editing in MT vertical view (MtTopicPills — editable pills per keyword sub-row)
- [x] Batch topic editing in MT (parent handleMtTopicEdit — delta applied to all checked keywords)
- [x] Right-click topic pill to filter in MT (yellow filter bar with ✕ clear)
- [x] Topic editing in TIF (TifTopicPills — editable pills per row)
- [x] Batch topic editing in TIF (parent handleTifTopicEdit — delta applied to all selected rows)
- [x] Right-click topic pill to filter in TIF (toggle topic filter)

### 1c. MT + TIF Tables: COMPLETE
- [x] Main Terms table — basic shell (8 columns, add/paste import, search, filters, column visibility, zoom, column resize, copy table data)
- [x] Main Terms table — three view modes (comma/vertical/single-line), header click to cycle all rows
- [x] Main Terms table — vertical view with per-keyword checkboxes, SV, Tags, Topics columns
- [x] Main Terms table — row checkbox auto-switches to vertical view and checks all keywords
- [x] Main Terms table — drag-to-reorder rows with blue drop indicator
- [x] Main Terms table — mark status on checked keywords (Unsorted/Partial/Sorted)
- [x] Main Terms table — bulk tag operations (add/remove tags on checked keywords)
- [x] Main Terms table — remove selected rows button
- [x] Main Terms table — associated keyword search (filters sub-rows in vertical view)
- [x] Main Terms table — sticky footer input row
- [x] Main Terms table — visible sub-row borders and synchronized amber hover across all columns
- [x] Main Terms table — Topic Descriptions column has sub-rows participating in hover sync
- [x] Terms In Focus table — component created with search, filters, column visibility, zoom, column resize
- [x] Terms In Focus table — drag-to-reorder, mark status, remove selected, clear all, copy table data
- [x] Terms In Focus table — active/paused toggle (state lifted to KeywordWorkspace)
- [x] Terms In Focus table — wired into KeywordWorkspace (3 tables stacked: AST + MT + TIF)
- [x] Terms In Focus table — tag search, topic search, topic pill click-to-filter

### 1c-mt-extras. MT Additional Features: COMPLETE
- [x] Apply Main Term As Tag button (adds main term text as tag to all checked keywords in that row)
- [x] Inline tag input field in header bar (replaces prompt() dialogs with inline text input + Apply/✕)
- [x] Keyword tag search in control bar (Search kw tags… — filter keyword sub-rows by tags)
- [x] Keyword topic search in control bar (Search kw topics… — filter keyword sub-rows by topics)

### 1c-behavior. TIF Auto-Add Behavior: COMPLETE
- [x] Decision: auto-add-on-checkbox (matching original HTML tool behavior)
- [x] AST checkbox change automatically calls addToTif
- [x] MT vertical view checkbox change automatically calls addToTif
- [x] MT row checkbox (select all keywords) automatically calls addToTif
- [x] ▶ TIF buttons removed from AST and MT
- [x] TIF Active/Paused toggle state lifted to KeywordWorkspace parent

### 1b-split. Split Topics View (AST, MT, TIF): COMPLETE
- [x] Split/Combined view toggle on Topics column header (click header to toggle, "Split" badge when active)
- [x] Split view: one sub-row per topic with checkbox + drag handle + editable topic pill
- [x] Topic approval status toggle (✓/✕) per topic with batch propagation via checkboxes
- [x] Topic Descriptions editing in split view (click description text → inline textarea, Ctrl+Enter save, Escape cancel, blur save)
- [x] Description stored in keyword record (canvasLoc Json field — per-keyword, per-topic text)
- [x] Batch propagation via topic checkboxes (edit one topic → propagate to all checked topics)
- [x] Batch propagation via description checkboxes (edit one description → propagate to all checked descriptions)
- [x] Cross-highlight between topic and description sub-rows on hover (AST, TIF: DOM traversal; MT: mtSplitHighlight helper)
- [x] Height sync between topic and description sub-row columns (AST/TIF: useEffect; MT: two-level sync)
- [x] "⊕ add topic" row with matching invisible spacer in descriptions column (MT)
- [x] Pill overflow control (text-overflow: ellipsis, column boundary respected)
- [x] Database: canvasLoc (Json) and topicApproved (Json) fields added to Keyword model
- [x] API: PATCH route updated to handle canvasLoc and topicApproved

### 1-ui. UI Layout Features: COMPLETE
- [x] Resizable horizontal dividers between AST↔MT and MT↔TIF (drag to resize panel heights)
- [x] Resizable vertical divider between left panel and canvas (drag to resize panel widths)
- [x] Panel visibility checkboxes in topbar (show/hide AST, MT, TIF, Canvas — hiding redistributes space)
- [x] Dividers auto-hide when adjacent panels are hidden
- [x] Horizontal scroll arrows on table frames (auto-appear when content overflows)
- [x] ScrollArrows component with ResizeObserver + MutationObserver + scroll detection

### 1-detach. Detach / Floating Window Overlays: COMPLETE
- [x] AST detach overlay (⊞ button → floating window with all AST functionality, synced state, ✕ close)
- [x] MT detach overlay (⊞ button → floating window with all MT functionality)
- [x] TIF detach overlay (⊞ button → floating window with all TIF functionality)
- [x] Canvas detach overlay (⊞ button → floating canvas view)
- [x] Overlays are draggable by header and resizable from all edges/corners
- [x] State syncs between inline panel and overlay (same component, same props)
- [x] Escape key to close overlay
- [x] Panel visibility checkbox unchecked → overlay closes too
- [x] FloatingPanel component with backdrop blur, drag, 8-edge resize

### 1d. Topics Layout Canvas: NOT STARTED — NEXT PRIORITY
- [ ] Mindmap canvas with nodes, connectors, drag-drop
- [ ] Edit panel, collapse/expand, sister links, auto-layout
- [ ] Drag keywords from AST/MT/TIF onto canvas to link them to nodes
- [ ] Drag topic pills from Split View onto canvas

### 1e. Canvas Table Mode: NOT STARTED
- [ ] 9-column funnel table, edit mode
- [ ] TSV import/export

### 1f. AI Mode + KAS + TVT: NOT STARTED
- [ ] Manual/AI mode toggle in topbar
- [ ] AI Actions Pane with four-way toggle (Normal/Common/Analysis/Topics)
- [ ] Keywords Analysis Table (KAS) — derived view showing keyword-to-topic mapping with upstream hierarchy
- [ ] Topics View Table (TVT) — depth-first tree view of canvas data with drag-reorder, expand/collapse, depth filter, zoom

### 1g. Auto-Analyze System: NOT STARTED
- [ ] Claude API integration (server-side)
- [ ] AI Prompt Popover (Generate AI Prompt, Upload AI Prompt Response)
- [ ] Streaming, batch processing, validation, delta merge
- [ ] Adaptive/Classic processing modes, batch tiers, hybrid full-table/delta
- [ ] Post-apply verification, checkpoint persistence

### 1h. Download/Upload Work: NOT STARTED
- [ ] Export complete .kst JSON file (all data, selections, filters, UI state, AI state, canvas state)
- [ ] Import/restore from .kst file (exact state restoration)
- [ ] Reset Tool function (clear all data and reset to fresh state)

---

## Phase 2 — Competition Scraping: NOT STARTED

- [ ] Competitor data model and API
- [ ] Frontend: competitor table, data entry, image gallery
- [ ] Server-side scraping with Playwright
- [ ] Browser extension (clipper)
- [ ] AI image analysis and competitive strategy

---

## Phase 3+ — Remaining Workflows: NOT STARTED

Each workflow follows: spec -> data model -> API -> frontend -> AI integration.

---

## Reference

- Original tool: docs/legacy/keyword_sorting_tool_v18.html
- Original architecture: docs/legacy/KST_Handoff_v18.md
- Original features: docs/legacy/KST_Features_Tour_v15.md
- Pipeline spec: docs/legacy/KST_Pipeline_Spec_v1.md
- Migration plan: docs/legacy/Migration_Master_Plan_v1.md
- Gap analysis: docs/legacy/ROADMAP_GAP_ANALYSIS.md
