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
- API routes created for all CRUD operations:
  - Projects: list, create, get, update, delete
  - Keywords: list, create (single + bulk), update, delete (single + bulk)
  - Canvas nodes: list, create, bulk update
  - Canvas state: get, update (upsert)
  - Pathways: create, delete
  - Sister links: create, delete
- Keyword Clustering page shell with project selector (create, open, delete projects)
- Dashboard card wired to navigate to /keyword-clustering
- NEXT STEP: Phase 1b — Build the AST (All Search Terms) table component

### Database Tables (defined in prisma/schema.prisma)
- **Project** — container for each keyword clustering project (userId, name, workflow)
- **Keyword** — one row per keyword (keyword, volume, sortingStatus, tags, topic, sortOrder)
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
      globals.css       # Dark theme CSS variables, Tailwind import
      layout.tsx        # Root layout (IBM Plex Sans font via link tag, metadata)
      page.tsx          # Login page (Supabase email/password auth)
      dashboard/
        page.tsx        # Post-login landing page (11 workflow cards)
      keyword-clustering/
        page.tsx        # Keyword Clustering — project selector + workspace shell
      api/
        projects/       # All API routes (see API Routes section above)
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

---

## Authentication

- Provider: Supabase Auth (email/password)
- Session check: Client-side in dashboard and keyword-clustering pages (supabase.auth.getSession())
- No session -> redirect to login page
- API routes receive userId via x-user-id header (to be upgraded to proper auth middleware later)
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
- At ~60% context, warn about upcoming save point
- At ~70% context, stop work, update docs, push to GitHub, provide exact new-chat instructions
- Never let conversation hit 75% without doing a full save