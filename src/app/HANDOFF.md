# Brand Operations Hub — Handoff Document
## For new chat sessions to read first

---

## Project Overview

**Brand Operations Hub** is an internal operations platform for brand development workflows.

**Tech stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Supabase (auth + database), Vercel (hosting).

**Repository:** GitHub (private) — `brand-operations-hub`
**Live URL:** https://brand-operations-hub-green.vercel.app (and https://vklf.com once DNS propagates)

---

## Current State (Phase 0 — Foundation)

### What's working
- Next.js project created with TypeScript, Tailwind, App Router
- Supabase project connected (auth enabled, email/password)
- Login page — dark theme, matches original tool design
- Dashboard (post-login landing page) — 11 workflow cards in 2 sections
- Authentication — real email/password via Supabase (replaces hardcoded admin/adminpass123)
- Sign Out button on dashboard
- Toast notifications for "Coming Soon" workflows
- Deployed to Vercel with automatic deploys from GitHub
- Custom domain setup initiated (vklf.com — DNS propagating)

### Project structure

brand-operations-hub/
  docs/
    workflows/       # Workflow specs
    primers/         # AI prompt primers
    legacy/          # Original single-file tool docs
  src/
    app/
      globals.css       # Dark theme CSS variables, font
      layout.tsx        # Root layout (IBM Plex Sans font, metadata)
      page.tsx          # Login page (Supabase auth)
      dashboard/
        page.tsx      # Post-login landing page (11 workflow cards)
    lib/
      supabase.ts       # Supabase client
    middleware.ts          # Auth middleware (placeholder)
  .env.local                 # Supabase URL + anon key (not in Git)
  HANDOFF.md                 # THIS FILE
  ROADMAP.md                 # Development roadmap

### Key files

src/app/page.tsx — Login page: email/password, Supabase auth, dark gradient
src/app/dashboard/page.tsx — Landing page: 11 workflow cards, Sign Out, toast
src/lib/supabase.ts — Supabase client connection
.env.local — Environment variables (not committed to Git)

---

## Authentication

- Provider: Supabase Auth (email/password)
- Session check: Client-side in dashboard page (supabase.auth.getSession())
- No session → redirect to login page
- Server-side middleware: Placeholder, to be upgraded later

---

## Workflows

1. Keyword Clustering — Card shows "Active" (tool not yet built)
2. Competition Scraping & Analysis — Coming Soon
3. Conversion Funnel Creation — Coming Soon
4. Content Development — Coming Soon
5. Multi-Media Assets Development — Coming Soon
6. Post-Launch Review Generation — Coming Soon
7. Clinical Evidence & Endorsement Generation — Coming Soon
8. IP Development — Coming Soon
9. Post Launch Improvement — Coming Soon
10. Business Operations — Coming Soon
11. Exit Strategy — Coming Soon

---

## What's Next

See ROADMAP.md for the full development plan. Next priority: Phase 1 — Keyword Clustering Migration (database schema, API routes, AST table component).

---

## For New Chat Sessions

1. Read this file (HANDOFF.md) for current architecture
2. Read ROADMAP.md for what's done and what's next
3. The original single-file tool docs are in docs/legacy/ for reference
4. Ask the user what they want to work on