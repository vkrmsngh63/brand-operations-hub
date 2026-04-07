# Brand Operations Hub — Handoff Document
## For new chat sessions to read first

---

## Project Overview

**Brand Operations Hub** is an internal operations platform for brand development workflows, being migrated from a single HTML file (~17,700 lines) to a hosted web application.

**Tech stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Supabase (auth + database), Prisma 6 (ORM), Vercel (hosting).

**Repository:** GitHub (private) — `brand-operations-hub`
**Live URL:** https://brand-operations-hub-green.vercel.app and https://vklf.com
**Development:** GitHub Codespaces (browser-based, no local installs)
**Codespace path:** `/workspaces/brand-operations-hub`

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
- Tag pill click-to-filter + yellow filter bar
- Tag header search + topic header search
- Sort by Volume button
- Show All reset button
- Zoom controls (7–18px range)
- Toast notifications

### Phase 1b-interact — Drag & Removed Terms: COMPLETE
- Drag-to-reorder rows via ⁞ handle (only drag handle initiates drag, not the whole row)
- Blue line drop indicators (above/below target row)
- Reorder persists to database (batch PATCH of sortOrder fields, with error handling)
- Removed Terms overlay — removing keywords archives them instead of permanent delete
- 🗑 Removed Terms button in panel header with red count badge
- Full-screen overlay with keyword/volume/status/tags columns
- Green ↩ restore button per removed keyword (with duplicate checking)
- Escape key closes overlay
- Bulk remove — selecting multiple rows and clicking − archives all selected

### Phase 1b-tags — Inline Tag Editing: COMPLETE
- Click a tag pill → inline input replaces it, pre-filled with tag text
- Press Enter or click away → saves the edit
- Clear the input and save → deletes that tag
- Press Escape → cancels the edit
- Click the + trigger (appears on hover in tag cell) → new tag input
- Batch support: if multiple rows are selected and you edit/add/remove a tag, the delta (added/removed tags) is propagated to ALL selected rows
- Right-click a tag pill → filters by that tag (left-click edits, right-click filters)
- TagCell is a separate React component with its own editing state

### Phase 1b-controls — Copy, CSV & Column Resize: COMPLETE
- Copy Table Data button — copies visible rows as TSV to clipboard (respects column visibility for Vol/Tags)
- CSV Download button — downloads ALL keywords as CSV file (keyword_sorting_data.csv)
- Column resize drag handles — drag right edge of any column border to resize, full-height gridlines on all cells

### Phase 1b-topics — Inline Topic Editing (AST, MT, TIF): COMPLETE
- AST: TopicCell component — click pill to edit, + to add, clear to delete, pipe | delimiter
- AST: Batch topic propagation — edit a topic with multiple rows selected → delta applied to all selected
- AST: Right-click topic pill → yellow "📌 Filtering by topic" bar with toggle and ✕ clear
- MT: MtTopicPills component in vertical view — click pill to edit, + to add, clear to delete
- MT: Batch topic propagation via parent handleMtTopicEdit — edit topic on one checked keyword → delta applied to all checked keywords
- MT: Right-click topic pill → yellow topic filter bar with ✕ clear
- TIF: TifTopicPills component — click pill to edit, + to add, clear to delete
- TIF: Batch topic propagation via parent handleTifTopicEdit — edit topic on one selected row → delta applied to all selected
- TIF: Right-click topic pill → toggles topic filter (existing yellow bar)

### Phase 1c — MT + TIF Tables: COMPLETE
- MTTable.tsx with mt-table.css — fully functional
- 8 columns, 3 view modes, keyword matching, drag-to-reorder, mark status, bulk tag add/remove, remove selected, keyword search (filters sub-rows), sticky footer
- TIFTable.tsx with tif-table.css — fully functional
- 7 columns: checkbox, drag handle, focus term, volume, status, tags, topics
- Search, status filters, column visibility, zoom, column resize, sort by vol, drag reorder, mark status, remove selected, clear all, copy table data, active/paused toggle
- Tag search in Tags column header, topic search in Topics column header
- Topic pill click-to-filter with yellow topic filter bar
- KeywordWorkspace.tsx: AST + MT + TIF stacked vertically in left panel

### Phase 1c-mt-extras — MT Additional Features: COMPLETE
- "MT → Tag" button — adds each row's main term as tag to its checked keywords
- Inline tag input field — replaces prompt() dialogs with inline text input + Apply/✕ for both add and remove
- Keyword tag search in control bar — "Search kw tags…" filters vertical view sub-rows by tag content
- Keyword topic search in control bar — "Search kw topics…" filters vertical view sub-rows by topic content
- All four search fields cleared by ↺ Show All
- Vertical view header shows "(filtered from N)" when filters reduce the keyword count

### Phase 1c-behavior — TIF Auto-Add: COMPLETE
- Decision: auto-add-on-checkbox (matching original HTML tool behavior)
- AST: checking a keyword checkbox auto-adds it to TIF
- AST: checking select-all auto-adds all visible keywords to TIF
- MT: checking a keyword in vertical view auto-adds it to TIF
- MT: selecting a row checkbox (which checks all keywords) auto-adds all keywords to TIF
- Unchecking does NOT remove from TIF
- ▶ TIF buttons removed from both AST and MT
- TIF Active/Paused toggle properly controls auto-add (state lifted to KeywordWorkspace)

### MT Vertical View Sub-Row Enhancements: COMPLETE
- Visible borders between sub-rows (solid #d6dce4 gray dividers)
- Synchronized hover highlighting across all columns — hovering any sub-row cell highlights the entire keyword row across Associated Keywords, KW SV, Tags, Topics, and Topic Descriptions columns
- Amber hover color (#fef9c3) stands out against white default and blue selection backgrounds
- Topic Descriptions column has matching sub-rows with spacer header (content placeholder for 1b-split phase)
- React `hoveredKw` state tracks hovered keyword string, `mt-kw-hover` CSS class applied across all columns

### NEXT STEPS (see ROADMAP.md for full details):
Three sub-phases remain before the canvas work begins:
- **1b-split** — Split Topics View with per-topic sub-rows, topic descriptions editing
- **1-ui** — Resizable panel dividers, panel visibility checkboxes, horizontal scroll arrows
- **1-detach** — Detach/floating window overlays for AST/MT/TIF/Canvas
- **1d** — Topics Layout Canvas (mindmap mode)

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
      nodes/route.ts                — GET + POST + PATCH (batch)
      pathways/route.ts             — GET + POST + DELETE
      sister-links/route.ts         — GET + POST + DELETE
      state/route.ts                — GET + PUT
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
          ASTTable.tsx          # All Search Terms table (virtual scroll, filters, drag-reorder, tags, topics with TopicCell, removed terms, copy/CSV, column resize, auto-add to TIF on checkbox)
          ast-table.css         # AST table styles (light theme table on dark page)
          MTTable.tsx           # Main Terms table (3 view modes, keyword matching, vertical sub-rows with synced hover, drag-reorder, mark status, inline tag input, MT→Tag, keyword tag/topic search, MtTopicPills with batch, auto-add to TIF)
          mt-table.css          # MT table styles (visible sub-row borders, synced amber hover, hardcoded light colors)
          TIFTable.tsx          # Terms In Focus table (search, filters, drag-reorder, mark status, remove, clear, active/paused toggle, TifTopicPills with batch, tag search, topic search, topic pill filter)
          tif-table.css         # TIF table styles (hardcoded light colors)
          KeywordWorkspace.tsx  # Connects AST + MT + TIF tables to API, stacked vertically in left panel, manages tifKeywords + tifActive state, addToTif callback
      api/
        projects/       # All API routes (see API Routes section above)
    hooks/
      useKeywords.ts    # React hook for keyword CRUD (fetch, add, bulk import, update, delete, reorder with persistence)
    lib/
      supabase.ts       # Supabase client (browser-side auth)
      db.ts             # Prisma client (database operations)
    middleware.ts        # Auth middleware (placeholder)
  .env                  # DATABASE_URL + DIRECT_URL (for Prisma CLI)
  .env.local            # NEXT_PUBLIC_SUPABASE_URL + ANON_KEY + DATABASE_URL + DIRECT_URL
  HANDOFF.md            # THIS FILE
  ROADMAP.md            # Development roadmap (includes gap analysis results)
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
- **Volume field:** Database stores volume as Int. API routes use `parseInt(body.volume) || 0` to convert string input. The useKeywords hook sends volume as a string; the API converts it. When restoring from Removed Terms, volume is cast with `String(rm.volume || '')`.
- **Auth header:** API routes receive userId via `x-user-id` header. The useKeywords hook includes this header on every fetch call. To be upgraded to proper auth middleware later.
- **Page layout for virtual scroll:** The keyword-clustering page uses `h-screen flex flex-col overflow-hidden` on the outermost div, and `flex-1 flex flex-col overflow-hidden` on inner containers, so the AST table frame gets a constrained height and virtual scrolling works correctly.
- **Drag-to-reorder:** Only the ⁞ handle initiates drag (via onMouseDown setting tr.draggable=true). The row itself has draggable=false by default. Reorder persists sortOrder to API with try/catch error handling.
- **Removed Terms:** Stored in React state (session-only, not persisted to database yet). Keywords are archived on remove with status reset to Unsorted and tags cleared. Future: add removedAt column to database.
- **Tag editing:** TagCell is a separate component (not memoized) with its own editing state. Batch tag edits propagate deltas (added/removed tags) to all selected rows via individual PATCH calls. Left-click edits a pill, right-click filters by it.
- **Topic editing:** TopicCell (AST), MtTopicPills (MT), TifTopicPills (TIF) — all follow same pattern as tags but use pipe `|` delimiter. Batch propagation uses parent-level handler functions (handleTopicEdit, handleMtTopicEdit, handleTifTopicEdit) that have direct access to selection state. Child components call parent callbacks with (oldTopicStr, newTopicStr) and parent computes deltas and applies to all selected/checked keywords. Right-click filters via dedicated topicFilter state with yellow filter bar.
- **Reorder persistence:** The reorder function assigns sequential sortOrder (0, 1, 2...) and PATCHes only changed rows. Wrapped in try/catch — if network fails, local order is still correct.
- **MT Table CSS:** Uses hardcoded light color values (#fff, #f8fafc, #e2e8f0, etc.) instead of CSS variables to prevent dark theme bleed from the page-level dark theme.
- **MT view mode cycling:** Triggered by clicking the "Associated Keywords" column header, which cycles ALL visible rows together. Individual cells do not cycle on click.
- **MT keyword matching:** Uses whole-word boundary regex matching — all words in the main term must appear as whole words in the keyword string.
- **MT keyword search:** Filters individual keyword sub-rows within each MT row (not the MT rows themselves). Works across all view modes (comma, vertical, single-line). Additional kw tag search and kw topic search also filter sub-rows.
- **MT inline tag input:** Replaces browser prompt() dialogs. Clicking +Tag or −Tag shows inline input with Apply/✕ buttons. Enter applies, Escape cancels.
- **MT sub-row hover sync:** React `hoveredKw` state tracks which keyword is hovered. `mt-kw-hover` CSS class applied to all corresponding sub-row items across all 5 columns (Keywords, SV, Tags, Topics, Topic Desc). Amber highlight (#fef9c3) distinguishes sub-row hover from blue row selection.
- **MT data persistence:** Session-only (React state). Not yet saved to database. MT entries disappear on logout/tab close.
- **TIF data persistence:** Session-only (React state). Keywords auto-added via checkbox from AST/MT. Not yet saved to database.
- **TIF Active/Paused state:** Lifted to KeywordWorkspace parent. tifActive and onSetTifActive passed as props to TIFTable. The addToTif callback checks tifActive before adding.
- **Auto-add to TIF:** Checking a keyword checkbox in AST or MT vertical view auto-adds it to TIF (matching original HTML tool). Unchecking does NOT remove from TIF. TIF Active/Paused toggle controls whether adds are accepted.
- **TIF tag/topic search:** Tag search in header uses whole-word matching on tag strings. Topic search matches exact topic pill text (pipe-delimited). Topic pill click-to-filter shows yellow filter bar with clear button.

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

## Known Development Environment Issues

### Port Forwarding in GitHub Codespaces
The PORTS tab in Codespaces may not show port 3000 even when the dev server is running. This is a known recurring issue. Do NOT spend time troubleshooting it. Instead, for testing: push code to GitHub with `git add -A && git commit -m "message" && git push`, wait 1–2 min for deploy, then hard-refresh (Ctrl+Shift+R) at https://vklf.com. As a secondary option, try the direct URL `https://CODESPACE-NAME-3000.app.github.dev` (get the codespace name from the Codespace address bar).

---

## For New Chat Sessions

1. Read this file (HANDOFF.md) for current architecture
2. Read ROADMAP.md for what is done and what is next
3. The original single-file tool docs can be provided for reference when needed
4. Upload keyword_sorting_tool_v18.html when building UI components
5. Ask the user what they want to work on

## Important User Preferences

- User is NOT a programmer — walk through every step with exact commands and explanations
- User works in GitHub Codespaces (browser-based, no local installs)
- Always confirm each step before moving to the next — do not batch multiple steps
- When replacing files, provide the complete file content in chat for copy-paste (user cannot reliably download files from Claude)
- At ~60% context, warn about upcoming save point
- At ~70% context, stop work, update docs, push to GitHub, provide exact new-chat instructions
- Never let conversation hit 75% without doing a full save
