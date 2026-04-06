# Brand Operations Hub — Handoff Document
## For new chat sessions to read first

---

## Project Overview

**Brand Operations Hub** is an internal operations platform for brand development workflows, being migrated from a single HTML file (~17,700 lines) to a hosted web application.

**Tech stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Supabase (auth + database), Prisma 6 (ORM), Vercel (hosting).

**Repository:** GitHub (private) — `brand-operations-hub`
**Live URL:** https://brand-operations-hub-green.vercel.app and https://vklf.com
**Development:** GitHub Codespaces (browser-based, no local installs)

---

## Current State

### Phase 0 — Foundation: COMPLETE
- Next.js project with TypeScript, Tailwind, App Router
- Supabase project connected (email/password auth)
- Login page — dark gradient background, centered card, IBM Plex Sans font
- Dashboard landing page — 11 workflow cards in 2 sections (Product Development & Launch + Ongoing Operations)
- Deployed to Vercel with auto-deploys from GitHub
- Custom domain vklf.com connected

### Phase 1a — Data Layer: COMPLETE
- Prisma 6 installed and configured (NOT Prisma 7 — v7 has breaking changes with Supabase)
- Database schema pushed to Supabase with 6 tables
- Prisma client helper at src/lib/db.ts
- API routes created for all CRUD operations
- Keyword Clustering page shell with project selector (create, open, delete projects)
- Dashboard card wired to navigate to /keyword-clustering

### Phase 1b-core — AST Table: COMPLETE
- AST (All Search Terms) table component with all 7 columns: checkbox, keyword, volume, sorting status, tags, topics, topic descriptions
- Virtual scrolling — tested with 2330+ rows
- Search — keyword search with whole-word matching
- Status filters — checkboxes for Sorted, Partial, Unsorted
- Column visibility toggles — Vol, Tags, Topics, Topic Descriptions
- Status pills with color coding (gray/orange/green/blue) and click-to-cycle
- Add row — type keyword + Enter
- Excel paste — bulk import with duplicate/header row detection
- Row selection — checkbox + keyword click, select-all with indeterminate state
- Remove — single keyword and bulk delete (when rows selected)
- Google search button per row
- Tag pill click to filter + yellow filter bar
- Tag header search + topic header search
- Sort by Volume button
- Show All reset button
- Zoom controls (7–18px range)
- Toast notifications
- NEXT STEP: Phase 1b-interact — drag-to-reorder rows and Removed Terms overlay

### Database Tables (defined in prisma/schema.prisma)
- **Project** — container for each keyword clustering project (userId, name, workflow)
- **Keyword** — one row per keyword (keyword, volume, sortingStatus, tags, topic, sortOrder)
  - NOTE: volume field is Int in database — API converts strings to int via parseInt()
- **CanvasNode** — topic nodes on canvas (title, description, x, y, w, h, parentId, pathwayId, kwPlacements, altTitles, etc.)
- **Pathway** — conversion paths
- **SisterLink** — connections between sibling nodes (nodeA, nodeB)
- **CanvasState** — viewport state (nextNodeId, nextPathwayId, viewX, viewY, zoom)

All tables have projectId foreign key with cascade delete. CanvasNode stores linkedKwIds, kwPlacements, altTitles, connCP, connOutOff, connInOff as JSON fields.

---

## API Routes

```
src/app/api/projects/
  route.ts                          — GET (list) + POST (create)
  [projectId]/
    route.ts                        — GET (full project) + PATCH (rename) + DELETE
    keywords/
      route.ts                      — GET (list) + POST (single/bulk) + DELETE (bulk)
      [keywordId]/
        route.ts                    — PATCH (update) + DELETE (single)
    canvas/
      route.ts                      — GET (state+pathways+links) + PATCH (state)
      nodes/
        route.ts                    — GET (list) + POST (create) + PATCH (bulk update)
      pathways/
        route.ts                    — POST (create) + DELETE
      sister-links/
        route.ts                    — POST (create) + DELETE
```

---

## Project Structure

```
brand-operations-hub/
  docs/
    workflows/          # Workflow specs (empty, to be populated)
    primers/            # AI prompt primers (empty, to be populated)
    legacy/             # Original single-file tool docs (empty, to be populated)
  prisma/
    schema.prisma       # Database schema — 6 tables
  src/
    app/
      globals.css       # Dark theme + table theme CSS variables, Tailwind import
      layout.tsx        # Root layout (IBM Plex Sans font via link tag, metadata)
      page.tsx          # Login page (Supabase email/password auth)
      dashboard/
        page.tsx        # Post-login landing page (11 workflow cards)
      keyword-clustering/
        page.tsx        # Keyword Clustering — project selector + workspace
        components/
          ASTTable.tsx          # All Search Terms table (virtual scroll, filters, etc.)
          ast-table.css         # AST table styles (light theme table on dark page)
          KeywordWorkspace.tsx  # Connects ASTTable to API via useKeywords hook
      api/
        projects/       # All API routes (see API Routes section above)
    hooks/
      useKeywords.ts    # React hook for keyword CRUD (fetch, add, bulk import, update, delete, reorder)
    lib/
      supabase.ts       # Supabase client (browser-side auth)
      db.ts             # Prisma client (database operations)
    middleware.ts        # Auth middleware (placeholder)
  .env                  # DATABASE_URL + DIRECT_URL (for Prisma CLI)
  .env.local            # NEXT_PUBLIC_SUPABASE_URL + ANON_KEY + DATABASE_URL + DIRECT_URL
  HANDOFF.md            # THIS FILE
  ROADMAP.md            # Development roadmap
```

---

## Key Technical Decisions

- **Prisma 6, not 7:** Prisma 7 removed url/directUrl from schema.prisma and requires prisma.config.ts + adapter pattern. Too complex for our setup. Prisma 6 works cleanly with Supabase.
- **Two env files:** .env is read by Prisma CLI. .env.local is read by Next.js. Both contain the database URLs.
- **Database password:** Must not contain special characters (@, #, $, etc.) because they break PostgreSQL connection URLs. Use only letters and numbers.
- **Supabase auth:** Email/password via @supabase/supabase-js client-side. Session check in dashboard page redirects to login if not authenticated.
- **Font loading:** IBM Plex Sans loaded via link tag in layout.tsx head, not via CSS @import (which conflicts with Tailwind's @import).
- **GitHub Codespaces:** All development in browser. 60 free hours/month. Stop codespace when not working.
- **JSON fields in Prisma:** When updating CanvasNode JSON fields (linkedKwIds, kwPlacements, altTitles) in bulk operations, cast values as `unknown as Prisma.InputJsonValue` to satisfy TypeScript.
- **Volume field:** Database stores volume as Int. API routes use `parseInt(body.volume) || 0` to convert string input. The useKeywords hook sends volume as a string; the API converts it.
- **Auth header:** API routes receive userId via `x-user-id` header. The useKeywords hook includes this header on every fetch call. To be upgraded to proper auth middleware later.
- **Page layout for virtual scroll:** The keyword-clustering page uses `h-screen flex flex-col overflow-hidden` on the outermost div, and `flex-1 flex flex-col overflow-hidden` on inner containers, so the AST table frame gets a constrained height and virtual scrolling works correctly.

---

## Authentication

- Provider: Supabase Auth (email/password)
- Session check: Client-side in dashboard and keyword-clustering pages (supabase.auth.getSession())
- No session -> redirect to login page
- API routes receive userId via x-user-id header (to be upgraded to proper auth middleware later)
- The useKeywords hook accepts userId as a parameter and sends it as x-user-id header on all requests
- Server-side middleware: Placeholder, to be upgraded later

---

## Workflows (Landing Page Cards)

**Product Development & Launch (9 cards):**
1. Keyword Clustering — Active (navigates to /keyword-clustering)
2. Competition Scraping & Analysis — Coming Soon
3. Conversion Funnel Creation — Coming Soon
4. Content Development — Coming Soon
5. Multi-Media Assets Development — Coming Soon
6. Post-Launch Review Generation — Coming Soon
7. Clinical Evidence & Endorsement Generation — Coming Soon
8. IP Development — Coming Soon
9. Post Launch Improvement — Coming Soon

**Ongoing Operations (2 prominent cards):**
10. Business Operations — Coming Soon
11. Exit Strategy — Coming Soon

---

## For New Chat Sessions

1. Read this file (HANDOFF.md) for current architecture
2. Read ROADMAP.md for what is done and what is next
3. The original single-file tool docs can be provided for reference when needed
4. Upload keyword_sorting_tool_v18.html when building UI components (AST table, canvas)
5. Ask the user what they want to work on

## Important User Preferences

- User is NOT a programmer — walk through every step with exact commands and explanations
- User works in GitHub Codespaces (browser-based, no local installs)
- Always confirm each step before moving to the next — do not batch multiple steps
- At ~60% context, warn about upcoming save point
- At ~70% context, stop work, update docs, push to GitHub, provide exact new-chat instructions
- Never let conversation hit 75% without doing a full save