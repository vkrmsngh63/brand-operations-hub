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

### 1b. AST Table: IN PROGRESS

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
- [x] Column resize drag handles

### 1c. MT + TIF Tables: NOT STARTED
- [ ] Main Terms table
- [ ] Terms In Focus table

### 1d. Topics Layout Canvas: NOT STARTED
- [ ] Mindmap canvas with nodes, connectors, drag-drop
- [ ] Edit panel, collapse/expand, sister links, auto-layout

### 1e. Canvas Table Mode: NOT STARTED
- [ ] 9-column funnel table, edit mode
- [ ] TSV import/export

### 1f. AI Mode + KAS + TVT: NOT STARTED
- [ ] AI Actions Pane, four-way toggle
- [ ] Keywords Analysis Table
- [ ] Topics View Table

### 1g. Auto-Analyze System: NOT STARTED
- [ ] Claude API integration (server-side)
- [ ] Streaming, batch processing, validation, delta merge

### 1h. Download/Upload Work: NOT STARTED
- [ ] Export/import from database

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