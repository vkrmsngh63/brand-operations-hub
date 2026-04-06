# Brand Operations Hub — Development Roadmap

---

## Phase 0 — Foundation Setup: COMPLETE

- [x] GitHub repository created
- [x] Next.js project initialized (TypeScript, Tailwind, App Router)
- [x] Supabase project created (auth + database)
- [x] Login page built (dark theme, Supabase email/password auth)
- [x] Dashboard landing page built (11 workflow cards, 2 sections)
- [x] Deployed to Vercel (auto-deploys from GitHub)
- [x] Custom domain initiated (vklf.com — DNS propagating)
- [x] Documentation structure created (HANDOFF.md, ROADMAP.md, docs/)

---

## Phase 1 — Keyword Clustering Migration: NOT STARTED

This is the largest phase. Porting the entire Keyword Clustering workflow from the single HTML file to the hosted platform.

### Sub-phases
- [ ] 1a. Data Layer — Prisma schema for keywords, canvas nodes, pathways, sister links. API routes for CRUD.
- [ ] 1b. AST Table — All Search Terms table as React component. Virtual scroll, search, filters, drag-reorder, zoom.
- [ ] 1c. MT + TIF Tables — Main Terms and Terms In Focus tables.
- [ ] 1d. Topics Layout Canvas — Mindmap canvas with nodes, connectors, drag-drop, edit panel, collapse/expand.
- [ ] 1e. Canvas Table Mode — 9-column funnel table, edit mode, TSV import/export.
- [ ] 1f. AI Mode + KAS + TVT — AI Actions Pane, four-way toggle, Keywords Analysis Table, Topics View Table.
- [ ] 1g. Auto-Analyze System — Claude API integration, streaming, batch processing, validation, delta merge.
- [ ] 1h. Download/Upload Work — Export/import from database.

---

## Phase 2 — Competition Scraping: NOT STARTED

- [ ] Competitor data model and API
- [ ] Frontend: competitor table, data entry, image gallery
- [ ] Server-side scraping with Playwright
- [ ] Browser extension (clipper)
- [ ] AI image analysis and competitive strategy

---

## Phase 3+ — Remaining Workflows: NOT STARTED

Each workflow follows: spec → data model → API → frontend → AI integration.

---

## Reference

- Original tool: docs/legacy/keyword_sorting_tool_v18.html
- Original architecture: docs/legacy/KST_Handoff_v18.md
- Original features: docs/legacy/KST_Features_Tour_v15.md
- Pipeline spec: docs/legacy/KST_Pipeline_Spec_v1.md