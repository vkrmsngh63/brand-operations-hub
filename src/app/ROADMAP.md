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

### 1a. Data Layer: IN PROGRESS
- [x] Prisma 6 installed and configured
- [x] Database schema defined (6 tables: Project, Keyword, CanvasNode, Pathway, SisterLink, CanvasState)
- [x] Schema pushed to Supabase (tables created)
- [x] Prisma client helper created (src/lib/db.ts)
- [ ] API routes for Project CRUD
- [ ] API routes for Keyword CRUD (create, read, update, delete, bulk import)
- [ ] API routes for Canvas CRUD (nodes, pathways, sister links, canvas state)
- [ ] Wire up dashboard Keyword Clustering card to navigate to the workflow page
- [ ] Create blank Keyword Clustering page shell

### 1b. AST Table: NOT STARTED
- [ ] All Search Terms table as React component
- [ ] Virtual scrolling, search, filters, sorting status
- [ ] Drag-reorder, zoom, CSV download
- [ ] Removed Terms overlay

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