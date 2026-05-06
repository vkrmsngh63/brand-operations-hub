# NAVIGATION MAP
## Every route, every click path through PLOS — the single source of truth for UI navigation

**Last updated:** May 7, 2026 (W#2 API-routes session-2 SHIPPED — no UI route changes this session. 8 new W#2 API routes (`urls/[urlId]/sizes`, `sizes/[sizeId]`, `urls/[urlId]/text`, `text/[textId]`, `urls/[urlId]/images/requestUpload`, `urls/[urlId]/images/finalize`, `images/[imageId]`, `reconcile`) registered in `PLATFORM_ARCHITECTURE.md §3` routes table. The existing W#2 page at `/projects/[projectId]/competition-scraping` continues to render the same library composition — multi-table viewer for the content area is still a placeholder; will be replaced incrementally now that the session-2 endpoints are live on this branch.)
**Last updated in session:** session_2026-05-07_w2-api-routes-session-2 (Claude Code, on `workflow-2-competition-scraping` branch)
**Previously updated:** May 7, 2026 (W#2 API-routes session-1 SHIPPED — no UI route changes this session. 3 new W#2 API routes (`/api/projects/[projectId]/competition-scraping/urls`, `.../urls/[urlId]`, `/api/projects/[projectId]/vocabulary`) registered in `PLATFORM_ARCHITECTURE.md §3` routes table.)
**Previously updated in session:** session_2026-05-07_w2-api-routes-session-1 (Claude Code, on `workflow-2-competition-scraping` branch)
**Previously updated:** May 6, 2026 (W#2 PLOS-side build first slice — added W#2 Competition Scraping & Deep Analysis route at `/projects/[projectId]/competition-scraping` composing 7 components from the Shared Workflow Components Library.)
**Previously updated in session:** session_2026-05-06_w2-plos-side-build-first-slice (Claude Code, on `workflow-2-competition-scraping` branch)
**Previously updated:** May 5, 2026-c (Shared Workflow Components Library Phase-1 build — added internal smoke-test route at `/components-smoke-test` for visual verification of all 9 Phase-1 components.)
**Previously updated in session:** session_2026-05-05-c_components-library-phase-1-build (Claude Code)
**Previously updated:** April 17, 2026 (Phase M COMPLETE — Ckpts 9 + 9.5 deployed to vklf.com; `/projects/[projectId]` detail page live for first time)
**Last updated in chat:** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f
**Chat where originally created:** https://claude.ai/chat/8320490b-3910-4b3d-b3f8-8222e25777c2

**Purpose:** This document is the authoritative map of how users navigate through the platform. If any navigation flow is not documented here, Claude must ASK the user before writing instructions that involve it.

**Rule for Claude:** Never invent a navigation flow. If the map does not cover a path, the path does not exist (for the purposes of your instructions) until you verify it with the user or the code.

---

## Status note (post-Phase-M)

**Phase M is COMPLETE as of 2026-04-17.** All routes below are live on vklf.com. The DB schema, server-side API, and UI pages are all aligned and verified working end-to-end.

- **Database schema + server-side API routes:** ✅ LIVE (Ckpt 5)
- **`/projects` page:** ✅ LIVE — list page with search, filter, sort, infinite scroll, new/edit/delete (Ckpt 6)
- **`/projects/[projectId]` detail page:** ✅ LIVE — Project header + 15-card workflow grid with status badges + coming-soon toast for non-active workflows (Ckpt 9.5 — note: Ckpt 6 docs claimed this was built then but the file didn't exist; built for real in Ckpt 9.5. See CORRECTIONS_LOG for the Pattern 7 recurrence.)
- **`/projects/[projectId]/keyword-clustering`:** ✅ LIVE (Ckpt 7) — single-state Keyword Clustering workspace, Project pre-selected from URL
- **`/keyword-clustering`:** ✅ DELETED (Ckpt 7) — folder removed entirely; route no longer exists
- **`/plos` Keyword Analysis card:** ✅ LIVE (Ckpt 8) — routes to `/projects` list
- **`/dashboard/notes` + `/plos/notes`:** ✅ LIVE (Ckpt 8; note-creation fixed in Ckpt 9.5 — API allowlist had to be extended)
- **`/docs/`:** ✅ CREATED (Ckpt 9) — canonical handoff doc location at repo root

**Deploy hold lifted.** All Phase M commits pushed and serving on vklf.com. Commits in stack: `fcf2373` (Ckpt 9.5) → `3a2b928` (Ckpt 9) → `ac62a3a` (Ckpt 8) → `5cc10c5` (Ckpt 7) → `3b69cf2` (Ckpt 6) → `14d68e7` (Ckpt 5) → `f545e2a` (pre-Phase-M safety branch anchor).

---

## 1. Top-level route map

### Current (end of Ckpt 8)

```
/                              — Login
 │
 ├── /dashboard                — Initial Landing Page (3 systems)
 │    │                           + 📝 Notes button (Ckpt 8)
 │    │
 │    ├── → /dashboard/notes   — Dashboard Admin Notes (✅ BUILT Ckpt 8)
 │    │
 │    ├── → /plos              — PLOS Landing Page (14 workflows + Business Ops)
 │    │    │                     + 📝 Notes button (Ckpt 8)
 │    │    │
 │    │    ├── → /plos/notes   — PLOS Admin Notes (✅ BUILT Ckpt 8)
 │    │    │
 │    │    ├── → /projects     — Keyword Analysis card now points here (Ckpt 8 rewire)
 │    │    │                     Projects list (✅ BUILT Ckpt 6)
 │    │    │    │
 │    │    │    └── → /projects/[projectId] — Project detail page (✅ BUILT Ckpt 6)
 │    │    │         │
 │    │    │         └── → /projects/[projectId]/keyword-clustering — KC workspace (✅ BUILT Ckpt 7)
 │    │    │
 │    │    └── (no other active navigation — 13 other cards + Business Ops show "coming soon" toast)
 │    │
 │    ├── → /pms               — PMS placeholder
 │    │    └── → /pms/notes    — PMS Admin Notes
 │    │
 │    └── → /think-tank        — Think Tank
 │         └── → /think-tank/notes — Think Tank Admin Notes
 │
 └── /components-smoke-test    — Internal smoke-test page (NEW 2026-05-05-c)
                                 Renders every Phase-1 Shared Workflow
                                 Components Library component with fake
                                 props for visual verification. No nav
                                 link to it; director types the URL
                                 directly. Removable once W#2 has its
                                 real composition page.
```

**All Phase M UI routes are now live in local commits. Deploy happens in Ckpt 9.**

---

## 2. Route-by-route detail

### `/` — Login

**What the user sees:** A centered dark-themed login form with email + password fields and a Sign In button.

**Auth required:** No

**Transitions out:**
| Action | Destination |
|---|---|
| Successful login | `/dashboard` |

---

### `/dashboard` — Initial Landing Page

**What the user sees:**
- Header: 🚀 icon + "Product Launch Operating System" + "Select a system to continue"
- Top-right: 📝 Notes button + Sign Out button (in flex container, 📝 to the left of Sign Out, 10px gap)
- 3-column grid of 3 large cards:
  1. **Product Launch Operating System** (🚀) — navigate to `/plos`
  2. **Project Management System** (📋) — navigate to `/pms`
  3. **Think Tank** (💡) — navigate to `/think-tank`
- Each card has an edit pencil (✏️) on hover — opens a modal to edit title/description
- Card edits stored in `localStorage` key `plos_initial_cards` (to be migrated to DB in Phase 2 — see ROADMAP)

**Auth required:** Yes (redirects to `/` if no Supabase session)

**Transitions out:**
| Action | Destination |
|---|---|
| Click PLOS card | `/plos` |
| Click PMS card | `/pms` |
| Click Think Tank card | `/think-tank` |
| Click 📝 Notes (Ckpt 8) | `/dashboard/notes` |
| Click Sign Out | `/` (login) |

**Source file:** `src/app/dashboard/page.tsx`

---

### `/plos` — PLOS Landing Page

**What the user sees:**
- Top bar: "← Back" button (returns to `/dashboard`) on the left; on the right, a flex container with 📝 Notes (Ckpt 8) + Sign Out
- Header: 🚀 icon + "Product Launch Operating System" + "Select a workflow to continue"
- View mode toggle: "Overview" (3 columns, compact) vs "Detailed" (2 columns, with "Show details" expand)
- In Detailed view: "Expand All" / "Collapse All" buttons
- Cards grid of 14 workflow cards (filtered to non-standalone only)
- Below an "Ongoing Operations" divider: the Business Operations standalone card
- Each card shows icon, title, short description, and Active/Coming Soon badge
- Each card has an edit pencil (✏️) on hover — opens modal to edit title, short desc, long desc
- Card edits stored in `localStorage` key `plos_workflow_cards` (to be migrated to DB in Phase 2 — see ROADMAP)
- Hover effect: bright light blue background with dark text

**Auth required:** Yes

**Which cards are Active (currently only one — and its route is now correct as of Ckpt 8):**
| Card | Status | Click → |
|---|---|---|
| 🔑 Keyword Analysis & Intent Discovery | **Active** | `/projects` (✅ rewired in Ckpt 8 — pick a Project, then enter its Keyword Analysis workflow) |
| All other 13 cards | Coming Soon | Toast: "<n> — coming soon" |
| ⚙️ Business Operations (standalone) | Coming Soon | Toast |

**Transitions out:**
| Action | Destination |
|---|---|
| Click active card (Keyword Analysis) | `/projects` (✅ Ckpt 8 rewire) |
| Click coming-soon card | Shows toast, stays on `/plos` |
| Click 📝 Notes (Ckpt 8) | `/plos/notes` |
| Click "← Back" | `/dashboard` |
| Click Sign Out | `/` |

**Source file:** `src/app/plos/page.tsx` — `DEFAULT_CARDS` array at top is authoritative list of all 14 + Business Ops. Keyword Analysis card's `route` field was updated in Ckpt 8 from `/keyword-clustering` to `/projects`. Note: card `route` values are NOT persisted to localStorage (only title/shortDesc/longDesc are), so the route change takes effect immediately on all user machines.

---

### `/dashboard/notes` — Dashboard Admin Notes (✅ BUILT in Ckpt 8)

**What the user sees:**
- Full Admin Notes workspace using shared `AdminNotes` component with `system="dashboard"`
- Dark topbar, light sidebar + editor, multi-note list with drag-reorder
- Rich text editor with formatting toolbar
- Individual view (default) or Combined view (read-only stacked notes)
- Attachments panel (images/videos)
- `systemLabel="Dashboard"`, `systemIcon="🚀"`, `backRoute="/dashboard"`
- Data stored with `system="dashboard"` tag — completely separate from PMS notes, Think Tank notes, and PLOS notes

**Transitions out:**
| Action | Destination |
|---|---|
| Back button | `/dashboard` |

**Source file:** `src/app/dashboard/notes/page.tsx` (11 lines — thin wrapper around shared `AdminNotes`)

---

### `/plos/notes` — PLOS Admin Notes (✅ BUILT in Ckpt 8)

**What the user sees:**
- Full Admin Notes workspace using shared `AdminNotes` component with `system="plos"`
- Same features as `/dashboard/notes` and `/pms/notes`
- `systemLabel="Product Launch Operating System"`, `systemIcon="🚀"`, `backRoute="/plos"`
- Data stored with `system="plos"` tag — completely separate from all other notes systems

**Transitions out:**
| Action | Destination |
|---|---|
| Back button | `/plos` |

**Source file:** `src/app/plos/notes/page.tsx` (11 lines — thin wrapper around shared `AdminNotes`)

---

---

### `/pms` — Project Management System (placeholder)

**What the user sees:**
- Placeholder page with basic header and an Admin Notes button

**Transitions out:**
| Action | Destination |
|---|---|
| Click 📝 Admin Notes | `/pms/notes` |
| Back | `/dashboard` |

**Source file:** `src/app/pms/page.tsx`

---

### `/pms/notes` — PMS Admin Notes

**What the user sees:**
- Full Admin Notes workspace using shared `AdminNotes` component with `system="pms"`
- Dark topbar, light sidebar + editor, multi-note list with drag-reorder
- Rich text editor with formatting toolbar
- Individual view (default) or Combined view (read-only stacked notes)
- Attachments panel (images/videos)

**Transitions out:**
| Action | Destination |
|---|---|
| Back button | `/pms` |

**Source file:** `src/app/pms/notes/page.tsx` + `src/components/AdminNotes.tsx`

---

### `/think-tank` — Think Tank Landing Page

**What the user sees:**
- Top-right: 📝 Admin Notes button
- Status filter tabs: All / Active / Inactive / Completed
- Project cards with:
  - Title, description, thumbnail (120×120 JPEG, canvas-resized)
  - Status (inactive/active/completed)
  - Top-level cards are bigger with accent stripe + shadow
  - Extra spacing between top-level groups (22px) vs within-group (6px)
- Drag-to-reorder (blue insertion line in top/bottom 25% of target card)

---

### `/projects` — Projects List (✅ BUILT in Ckpt 6)

**What the user sees:**
- Top bar: "← Back" (returns to `/plos`) + "Sign Out"
- Header: 📁 icon + "Projects" + "Your product launches"
- Controls bar (only shown if there are Projects or the new-form is open):
  - **Search box** — wide input with 🔍 icon and placeholder "Search Projects..." Live-filters by name AND description (200ms debounced). Has ✕ clear-button once you type anything. Not case-sensitive.
  - **Sort dropdown** — "Sort: Last activity" (default) / "Sort: Name (A–Z)" / "Sort: Date created"
  - **Completion filter dropdown** — "Filter: All Projects" (default) / "Has active workflows" / "All workflows done" / "No activity yet"
  - **Workflow-stage filter dropdown** — "Stage: Any" (default) or one of the 14 workflows (filters to Projects where that specific workflow is Active)
  - **"+ New Project"** button (primary blue, right-aligned)
- Inline New Project form appears when "+ New Project" is clicked — has Name (required) and Description (optional). Enter submits, Escape cancels.
- Empty state (zero Projects ever): large 🚀 + "Let's launch your first product" heading + explainer + big "+ Create your first Project" button.
- No-results state (have Projects but filters hide all): "No Projects match your current search or filters. Clear filters" link.
- Project cards (one per row, full-width up to the 1100px container):
  - Project **name** (bold, 15px) — hovering underlines it; clicking navigates to `/projects/[projectId]`
  - Description preview (truncated to 180 chars)
  - Meta row: "Last activity: 3 days ago" (left) + "3 Active · 1 Done · 10 Inactive" (right)
  - Edit pencil (✏️) appears top-right on hover — opens edit modal
  - Delete icon (🗑️) appears top-right on hover (to the right of the pencil) — opens two-step delete confirm
  - Clicking anywhere else on the card body toggles accordion expansion
- Accordion expanded state:
  - Shows a border-separated "Workflows" section with an "✏️ Edit Project" button (alternate entry to edit modal)
  - Below: grid of 14 workflow cards (responsive — auto-fill minmax 220px) with status badge each (gray Inactive / blue Active / green Completed) and a "Mark Done" / "Reopen" toggle on Active or Completed workflows
  - Only Keyword Analysis (🔑) is clickable — navigates to `/projects/[id]/keyword-clustering` (✅ works as of Ckpt 7). Others show "coming soon" toast.
  - Opening a second card closes the first (accordion behavior).
- Infinite scroll: 25 Projects shown at a time; scroll near bottom loads next 25. Sentinel shows "Loading more…" or "You've reached the end · N Projects total" when complete.
- Toast notifications (bottom-center) confirm successful Create / Edit / Delete / Mark Done actions.

**Modals:**
- **Edit Project modal** — Name + Description fields, Save button hits `PATCH /api/projects/[id]`
- **Delete Project modal (two-step)** — Step 1: "Delete this Project? You're about to delete '...'. Cancel / Yes, continue." Step 2: red border, ⚠️ Last chance heading, "This cannot be undone." Cancel / "Delete permanently". Final delete hits `DELETE /api/projects/[id]`.

**Auth required:** Yes (redirects to `/` if no session)

**Transitions out:**
| Action | Destination |
|---|---|
| Click Project name | `/projects/[projectId]` |
| Click card body | Expand accordion (stays on `/projects`) |
| Click Keyword Analysis workflow card | `/projects/[projectId]/keyword-clustering` ✅ (live as of Ckpt 7) |
| Click other workflow cards | Coming soon toast |
| Click "← Back" | `/plos` |
| Click Sign Out | `/` |

**Source file:** `src/app/projects/page.tsx` (~1,493 lines)

**API endpoints used:** `GET /api/projects`, `POST /api/projects`, `PATCH /api/projects/[id]`, `DELETE /api/projects/[id]`, `PATCH /api/project-workflows/[projectId]/[workflow]`

---

### `/projects/[projectId]` — Project Detail Page (✅ BUILT in Ckpt 6)

**What the user sees:**
- Top bar: "← Back to Projects" (returns to `/projects`) + "Sign Out"
- Project header: Project name (26px), description (wraps at 720px max-width), "Last activity: ..." caption
- "Workflows" section label (small uppercase)
- Grid of 14 workflow cards (auto-fill minmax 260px — larger and roomier than the in-accordion grid on `/projects`). Each card shows:
  - Workflow icon, title (bold)
  - Status badge (Inactive / Active / Completed)
  - Short description (1–2 sentences)
  - Hover: light-blue-white background, lift + shadow
- Only Keyword Analysis (🔑) is clickable in Phase 1 — navigates to `/projects/[id]/keyword-clustering` (✅ works as of Ckpt 7). Others show "coming soon" toast.

**Does NOT include (yet):** editing Project name/description from this page (use `/projects` page for now), reset-workflow-data, Phase 2 review state display, delete Project (use `/projects` page).

**Auth required:** Yes

**Transitions out:**
| Action | Destination |
|---|---|
| Click Back to Projects | `/projects` |
| Click Keyword Analysis card | `/projects/[id]/keyword-clustering` ✅ |
| Click any other workflow card | "coming soon" toast |

**Source file:** `src/app/projects/[projectId]/page.tsx` (~372 lines)

---

### `/projects/[projectId]/keyword-clustering` — Keyword Clustering workspace (✅ BUILT in Ckpt 7)

**What the user sees:**
- Top bar:
  - Left: "← Back to Project" link (returns to `/projects/[projectId]`) + vertical separator + "🔑 Keyword Clustering · v1.0" title + vertical separator + Project name (fetched from the API)
  - Right: Manual/AI mode toggle (blue=selected)
- Loading state: "Loading Project…" while the Project's name is being fetched
- Error state (if Project doesn't exist or user doesn't have access): ⚠️ icon + friendly message + "← Back to Projects" button
- Main content area: the full `<KeywordWorkspace>` component, which is the actual tool (same code as before Ckpt 7 — unchanged)
  - **Manual mode:** 3-panel left (AST + MT + TIF tables) + Topics Layout Canvas on the right
  - **AI mode:** Single Keywords Working Area (one of 4 views — Normal/Common/Analysis/Topics) + Canvas + Auto-Analyze pane
  - Canvas has two modes: Mindmap (default) and Table

**What's different from the old `/keyword-clustering`:**
- Single-state design — the old "pick a project" screen is GONE (the user arrives here having already picked a Project on the `/projects` page)
- URL contains the Project ID, so browser back/forward works correctly
- Browser back from this page returns to wherever the user came from (typically `/projects/[projectId]`), NOT to `/plos`
- "Back to Project" button explicitly returns to `/projects/[projectId]` (the Project detail page), one level up in the breadcrumb

**Auth required:** Yes (redirects to `/` if no session; shows error state if user doesn't own the Project)

**Transitions out:**
| Action | Destination |
|---|---|
| Click "← Back to Project" | `/projects/[projectId]` |
| Click "← Back to Projects" (only shown on error state) | `/projects` |
| Browser back | Typically `/projects/[projectId]` |
| Toggle Manual/AI | Switches mode (stays on same URL; preference is per-session, resets on page refresh — see ROADMAP Phase 1-polish item) |
| Various tool actions | See `KEYWORD_CLUSTERING_ACTIVE.md` for full details |

**Source file:** `src/app/projects/[projectId]/keyword-clustering/page.tsx` (164 lines) + `src/app/projects/[projectId]/keyword-clustering/components/KeywordWorkspace.tsx` (workspace orchestrator) + the rest of the `components/` folder

**API endpoint used by page wrapper:** `GET /api/projects/[projectId]` (to fetch Project name for header)

---

## 3. Key click paths (common navigation scenarios)

### Path: From login to the Keyword Clustering tool with an existing project (CURRENT — Ckpt 8 state)

```
/ (login)
  → enter credentials → Sign In
/dashboard
  → click "Product Launch Operating System" card
/plos
  → click "Keyword Analysis & Intent Discovery" card → navigates to /projects (✅ Ckpt 8 rewire)
/projects
  → click an existing Project's name
/projects/[projectId]
  → click Keyword Analysis workflow card
/projects/[projectId]/keyword-clustering
  → the tool is ready (single state)
```

### Path: Creating a new Project (Ckpt 6)

```
/projects
  → click "+ New Project" button
  → inline form appears
  → type name (required) + description (optional)
  → press Enter or click "Create Project"
  → new Project appears at top of list
```

### Path: Opening a Project's detail view (Ckpt 6)

```
/projects
  → click the bold Project name on a card
/projects/[projectId]
  → see 14 workflow cards
  → click Keyword Analysis card → navigates to /projects/[id]/keyword-clustering ✅
```

### Path: Viewing workflows inline without leaving the list (Ckpt 6)

```
/projects
  → click anywhere on Project card body (not the name)
  → card expands to show 14 workflow cards with status
  → click a different Project card body → first one closes, new one expands
```

### Path: Editing a Project (Ckpt 6)

```
/projects
  → hover a Project card → edit pencil (✏️) appears top-right
  → click pencil → edit modal opens
  → change name/description → Save
  OR
  → click card body to expand → click "✏️ Edit Project" button → same modal
```

### Path: Deleting a Project (Ckpt 6, two-step confirm)

```
/projects
  → hover a Project card → trash icon (🗑️) appears top-right
  → click trash → Step 1 confirm modal opens ("Delete this Project?")
  → click "Yes, continue" → Step 2 confirm modal opens (red, ⚠️ Last chance)
  → click "Delete permanently" → Project removed from list with toast confirmation
```

### Path: Leaving the Keyword Clustering workspace (Ckpt 7 — NEW)

```
/projects/[projectId]/keyword-clustering
  → click "← Back to Project" in top bar
/projects/[projectId]
  → click "← Back to Projects" in top bar
/projects
```

### Path: Accessing PMS Admin Notes

```
/dashboard
  → click PMS card
/pms
  → click 📝 Admin Notes
/pms/notes
```

### Path: Accessing Think Tank Admin Notes

```
/dashboard
  → click Think Tank card
/think-tank
  → click 📝 Admin Notes
/think-tank/notes
```

### Path: Accessing Dashboard Admin Notes (✅ Ckpt 8)

```
/dashboard
  → click 📝 Notes (top-right, left of Sign Out)
/dashboard/notes
```

### Path: Accessing PLOS Admin Notes (✅ Ckpt 8)

```
/dashboard
  → click PLOS card
/plos
  → click 📝 Notes (top-right, left of Sign Out)
/plos/notes
```

---

## 4. Navigation gotchas (things that don't work how you'd expect)

### Gotcha 1: ~~`/plos` Keyword Analysis card currently 404s~~ ✅ RESOLVED (Ckpt 8)
Previously, the Keyword Analysis card on `/plos` pointed at the deleted `/keyword-clustering` route. As of Ckpt 8, the card's route was rewired to `/projects`. Clicking the card now correctly navigates to the Projects list, where the user picks a Project and then enters its Keyword Analysis workflow.

### Gotcha 2: Manual/AI toggle resets on page refresh
The Manual/AI mode preference on the Keyword Clustering top bar is per-session. Refreshing the page or navigating away and back resets to Manual. Persisting the preference per-user per-workflow is tracked as a Phase 1-polish item in ROADMAP.

### Gotcha 3: Currently only Keyword Clustering is Active — all other workflows show a toast
Attempting to click any of the other 13 PLOS workflow cards (including Business Operations) shows a "coming soon" toast and stays on `/plos`. The `/projects` page and `/projects/[projectId]` detail page also show the same "coming soon" toast for the 13 coming-soon workflows.

### Gotcha 4: Codespace PORTS tab often doesn't show port 3000
Don't try to access the app via Codespace port forwarding. Push to GitHub → wait for Vercel → test at vklf.com. Currently BLOCKED by Phase M deploy hold until Ckpt 9.

### Gotcha 5: Direct browser access to a Project ID you don't own shows a friendly error
If you navigate directly to `/projects/[some-id-you-don't-own]/keyword-clustering`, the page will show "You do not have access to this Project" with a button to return to `/projects`. Same if the ID doesn't exist: "This Project no longer exists."

### Gotcha 6: Deploy hold — none of Phase M is live on vklf.com yet
All work from Ckpts 1–8 exists only in local commits on the `main` branch (4 commits ahead of origin/main: `14d68e7` Ckpt 5, `3b69cf2` Ckpt 6, `5cc10c5` Ckpt 7, `ac62a3a` Ckpt 8). The live site still runs the pre-Phase-M code (which is fully broken against the new database schema that IS live on Supabase). This is by design; deploy happens in Ckpt 9.

---

## 5. Planned navigation changes (Phase M remaining checkpoint)

### ✅ Ckpt 8: Admin Notes for Dashboard and PLOS + /plos Keyword card rewire — DONE
Completed in chat `fc8025bf-551a-4b3c-8483-ec6d8ed9e33c`:
- ✅ 📝 Notes button added to `/dashboard` top bar → routes to `/dashboard/notes`
- ✅ 📝 Notes button added to `/plos` top bar → routes to `/plos/notes`
- ✅ Both new notes pages use shared `AdminNotes` component (`system="dashboard"` and `system="plos"`)
- ✅ `/plos` Keyword Analysis card rewired from `/keyword-clustering` → `/projects`
- (Workflow-view / Projects-view toggle on `/plos` was considered but deferred — the simple route rewire was chosen as sufficient per user preference; see `CHAT_REGISTRY.md` Ckpt 8 entry)

### Ckpt 9: Deploy + cleanup
- `npm run build` + fix any remaining TypeScript errors
- Handle the `src/app/HANDOFF.md` and `src/app/ROADMAP.md` technical-debt files (move to `/docs` or delete)
- Remove `.bak*` files (13 leftover + ~32 committed — see ROADMAP Ckpt 9 "Pre-Ckpt-9 leftovers inventory") and add pattern to `.gitignore`
- `git push origin main` (4 commits: Ckpt 5, Ckpt 6, Ckpt 7, Ckpt 8)
- Verify at vklf.com with Ctrl+Shift+R

---

## 6. How to update this document

This is a living document. Whenever a new route is added, a navigation flow changes, or a new gotcha is discovered:

1. Add the route/page under §2
2. Add the click path under §3 if it's a common scenario
3. Add gotchas under §4
4. Update the top-level map (§1) if structure changes

**Who updates:** Claude at end-of-chat, as part of the handoff protocol, whenever navigation changes during the chat.

---

END OF DOCUMENT
