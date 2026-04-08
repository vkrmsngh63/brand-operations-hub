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
- [x] Zoom controls (7–18px range, CSS zoom)
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
- [x] Batch topic editing across selected rows in AST (delta propagation)
- [x] Right-click topic pill to filter in AST (yellow filter bar)
- [x] Topic editing in MT vertical view, TIF
- [x] Batch topic editing in MT and TIF

### 1c. MT + TIF Tables: COMPLETE
- [x] Main Terms table — all features (3 view modes, vertical view, drag-reorder, bulk operations, etc.)
- [x] Terms In Focus table — all features (search, filters, drag-reorder, active/paused toggle, etc.)
- [x] MT entries state lifted to KeywordWorkspace to survive detach/reattach

### 1c-mt-extras. MT Additional Features: COMPLETE
- [x] Apply Main Term As Tag button
- [x] Inline tag input field in header bar
- [x] Keyword tag search + topic search in control bar

### 1c-behavior. TIF Auto-Add Behavior: COMPLETE
- [x] Auto-add-on-checkbox matching original tool behavior

### 1b-split. Split Topics View (AST, MT, TIF): COMPLETE
- [x] All split view features (per-topic sub-rows, approval toggle, description editing, batch propagation, height sync)

### 1-ui. UI Layout Features: COMPLETE
- [x] Resizable dividers, panel visibility checkboxes, scroll arrows

### 1-detach. Detach / Floating Window Overlays: COMPLETE
- [x] All panels detachable with synced state

### 1d. Topics Layout Canvas: COMPLETE
- [x] **1d-core**: SVG canvas with nodes, pan (drag background), zoom (scroll wheel + buttons), drag nodes, add/delete/rename nodes, reset/fit view, grid dots, pathway-colored accent stripes
- [x] **1d-connect**: P→C (nested) and P→P (linear) link modes with visual feedback, detach node from parent, expanded context menu (Rename, Detach, Make Parent of…, Link as Sibling to…, Delete)
- [x] **1d-edit**: Edit panel drawer (320px right side) with title, description, alternate titles, linked keywords list with p/s placement toggle, hover popover for full description
- [x] **1d-link**: Drag keywords from AST/TIF onto canvas nodes to link them (HTML5 drag/drop with text/kst-kwids data type, hit-test on drop)
- [x] **1d-polish**: Node resize (drag grip handle, min 140×60), collapse/expand child nodes (▼/▶ toggle on parent nodes, hides descendants + connectors + sister links)

### 1e. Canvas Table Mode: IN PROGRESS — NEXT PRIORITY
- [x] **1e-table**: 9-column funnel table view (Depth, Topic, Alt Titles, Relationship, Parent Topic, Conversion Path, Sister Nodes, Keywords, Description), mode toggle (Mindmap/Table), depth-first tree walk ordering, TSV copy, row click opens edit panel
- [ ] **1e-edit**: Edit mode (editable cells, add/remove rows, save back to canvas)
- [ ] **1e-tsv**: TSV upload/paste to update canvas data

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
