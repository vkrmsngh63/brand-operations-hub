# PLATFORM ARCHITECTURE
## Technical architecture of the Product Launch Operating System (PLOS)

**Last updated:** April 17, 2026 (Phase M Ckpt 8 complete — Admin Notes added for Dashboard + PLOS; `/plos` Keyword Analysis card rewired to `/projects`)
**Last updated in chat:** https://claude.ai/chat/fc8025bf-551a-4b3c-8483-ec6d8ed9e33c

**Purpose:** Defines the technical structure of the platform — routes, database schema, authentication, shared systems, file organization. Loaded in every chat as part of Group A.

**Note on scale context (added 2026-04-17):** The scale and user-model assumptions this doc is evaluated against are defined in `PLATFORM_REQUIREMENTS.md` (Group A). Summary for quick reference: Phase 1 = admin-solo at ~50 Projects/week; Phase 3 = ~50 concurrent workers, 500 Projects/week; Phase 4 = 5,000 Projects/week headroom. Architecture must target Phase 3 as minimum; Phase 4 as stretch. Where Phase 3/4 scale is not yet addressed in current code, gaps are tracked in §10 Known Technical Debt.

---

## 1. High-level architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User's Browser                           │
│  (Next.js client-side React + Supabase client for auth)     │
└───────────────────┬─────────────────────────────────────────┘
                    │ HTTPS
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                  Vercel (production)                         │
│  Next.js server — renders pages, handles API routes          │
│  Domain: https://vklf.com                                    │
└───────────────────┬─────────────────────────────────────────┘
                    │ Prisma + Supabase JS
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase                                  │
│  ├── PostgreSQL database (via DATABASE_URL / DIRECT_URL)     │
│  ├── Supabase Auth (JWT-based authentication)                │
│  ├── Supabase Storage (admin-notes bucket, public)           │
│  └── Supabase Realtime (PLANNED — Phase 1-realtime)          │
└─────────────────────────────────────────────────────────────┘

                    External:
┌─────────────────────────────────────────────────────────────┐
│  Anthropic API (Claude) — for Auto-Analyze AI                │
│  Called either:                                              │
│   • Direct: browser → Anthropic (no server timeout)          │
│   • Server: browser → Vercel → Anthropic (5min timeout)      │
└─────────────────────────────────────────────────────────────┘
```

### Development environment
- **Codespace:** `/workspaces/brand-operations-hub`
- **Repo:** GitHub `brand-operations-hub` (name kept despite rebrand to PLOS)
- **Deploy flow:** Push to GitHub `main` → Vercel auto-deploys → live at vklf.com
- **Known Codespaces issue:** PORTS tab often doesn't show port 3000. Do NOT troubleshoot. Push to GitHub → Vercel deploy → test at vklf.com with Ctrl+Shift+R.

---

## 2. Directory structure (top-level)

```
/workspaces/brand-operations-hub/
├── prisma/
│   ├── schema.prisma              — database schema (source of truth, Phase M live)
│   └── schema.prisma.bak          — pre-Phase M backup
├── public/                        — static assets
├── src/
│   ├── app/                       — Next.js App Router pages + API routes
│   │   ├── layout.tsx             — root HTML layout + IBM Plex font
│   │   ├── page.tsx               — login page (root "/")
│   │   ├── globals.css
│   │   ├── dashboard/             — Initial Landing Page (/dashboard)
│   │   │   └── notes/             — Dashboard Admin Notes (Phase M Ckpt 8 ✅ LIVE)
│   │   ├── plos/                  — PLOS Landing Page (/plos)
│   │   │   └── notes/             — PLOS Admin Notes (Phase M Ckpt 8 ✅ LIVE)
│   │   ├── pms/
│   │   │   └── notes/             — PMS Admin Notes (/pms/notes)
│   │   ├── think-tank/
│   │   │   └── notes/             — Think Tank Admin Notes (/think-tank/notes)
│   │   ├── projects/              — Projects page (Phase M — Checkpoint 6)
│   │   │   └── [projectId]/       — Project detail page + per-Project workflow routes
│   │   │       └── keyword-clustering/  — per-project KC tool (Phase M — Checkpoint 7 ✅ LIVE)
│   │   │           ├── page.tsx         — page wrapper (164 lines)
│   │   │           └── components/      — tool code (moved from old /keyword-clustering in Ckpt 7)
│   │   └── api/
│   │       ├── projects/          — user-facing Projects CRUD (updated Ckpt 5)
│   │       ├── project-workflows/ — NEW in Ckpt 5 — workspace state endpoints
│   │       ├── ai/
│   │       ├── admin-notes/
│   │       └── user-preferences/
│   ├── components/                — shared components (AdminNotes, etc.)
│   ├── hooks/                     — React hooks (useKeywords, useCanvas)
│   ├── lib/
│   │   ├── auth.ts                — verifyAuth / verifyProjectAuth / verifyProjectWorkflowAuth
│   │   ├── authFetch.ts           — client-side fetch wrapper (adds JWT)
│   │   ├── db.ts                  — Prisma client instance
│   │   ├── supabase.ts            — client-side Supabase
│   │   ├── supabase-server.ts     — server-side Supabase (service role)
│   │   └── workflow-status.ts     — NEW in Ckpt 5 — markWorkflowActive + ensureProjectWorkflow
│   └── middleware.ts
├── package.json
└── .env.local                     — environment variables (NOT committed)
```

**Deleted in Ckpt 7:** `src/app/keyword-clustering/` folder (entirely removed; its `components/` subfolder was moved to `src/app/projects/[projectId]/keyword-clustering/components/`).

---

## 3. Routes (URL → behavior)

### Current routes (as of end of Phase M Checkpoint 8)

| URL | Auth | Description |
|---|---|---|
| `/` | No | Login |
| `/dashboard` | Yes | Initial Landing Page — 3 system cards (PLOS/PMS/Think Tank). 📝 Notes button in top-right (Ckpt 8) → `/dashboard/notes`. |
| `/dashboard/notes` | Yes | **NEW (Ckpt 8)** — Dashboard Admin Notes. Thin 11-line wrapper passing `system="dashboard"` to shared `AdminNotes` component. |
| `/plos` | Yes | PLOS Landing — 14 workflow cards + Business Ops. 📝 Notes button in top-right (Ckpt 8) → `/plos/notes`. Keyword Analysis card routes to `/projects` (Ckpt 8 rewire — previously pointed at deleted `/keyword-clustering`). |
| `/plos/notes` | Yes | **NEW (Ckpt 8)** — PLOS Admin Notes. Thin 11-line wrapper passing `system="plos"` to shared `AdminNotes` component. |
| `/pms` | Yes | PMS placeholder + Admin Notes button |
| `/pms/notes` | Yes | PMS Admin Notes |
| `/think-tank` | Yes | Think Tank landing (projects in localStorage) |
| `/think-tank/notes` | Yes | Think Tank Admin Notes |
| `/projects` | Yes | **(Ckpt 6)** — Projects list page with search/filter/sort/infinite-scroll/create/edit/delete. Also serves as PLOS Projects View. |
| `/projects/[projectId]` | Yes | **(Ckpt 6)** — Project detail page showing 14 workflow cards with status. Clicking KC card navigates to per-Project KC workspace (works as of Ckpt 7). |
| `/projects/[projectId]/keyword-clustering` | Yes | **(Ckpt 7)** — Keyword Clustering workspace, single-state (Project pre-picked from URL). Reads projectId from URL, fetches Project name, renders `<KeywordWorkspace>`. |

### Deleted routes (previously existed)

| URL | Deleted in | Reason |
|---|---|---|
| `/keyword-clustering` | Ckpt 7 | Replaced by `/projects/[projectId]/keyword-clustering`. The old dual-state page (Projects List + Workspace) is no longer needed — Projects List lives on `/projects`; workspace lives under the per-Project URL. |
| `/projects/projectId` (no brackets) | Ckpt 7 | Stray folder leftover from Ckpt 6 draft-save-gone-wrong; never a real route; was creating a useless `/projects/projectId` entry in the build output. Cleaned up during Ckpt 7. |

### Planned routes (Phase M Checkpoint 9 — no new routes; Ckpt 9 is deploy + cleanup only)

| URL | Auth | Description |
|---|---|---|
| `/projects/[projectId]/<future-workflow>` | Yes | Each future workflow (workflows 2–14) will have a route under `/projects/[projectId]/` |

### API routes (all require JWT via `Authorization: Bearer <token>`)

**Post-Ckpt-5 — aligned with new schema; unchanged by Ckpt 6 or 7:**
| Route | Method | Purpose | Auth helper |
|---|---|---|---|
| `/api/projects` | GET / POST | List user's Projects (sorted by aggregate lastActivityAt) / Create | `verifyAuth` |
| `/api/projects/[projectId]` | GET / PATCH / DELETE | Read (slim — Project + workflow statuses) / update name+description / delete cascade | `verifyProjectAuth` |
| `/api/project-workflows/[projectId]` | GET | List all ProjectWorkflow rows for a Project (for Projects page status badges) | `verifyProjectAuth` |
| `/api/project-workflows/[projectId]/[workflow]` | GET / PATCH | Read / update single workspace status (auto-creates row on first peek, manual active/completed toggle) | `verifyProjectAuth` + ensureProjectWorkflow |
| `/api/projects/[projectId]/keywords` | GET / POST / PATCH / DELETE | Keywords CRUD — uses projectWorkflowId internally | `verifyProjectWorkflowAuth("keyword-clustering")` |
| `/api/projects/[projectId]/keywords/[keywordId]` | PATCH / DELETE | Single keyword update/delete | `verifyProjectWorkflowAuth("keyword-clustering")` |
| `/api/projects/[projectId]/canvas` | GET / PATCH | Full canvas read / canvas state (viewport/counters) update | `verifyProjectWorkflowAuth("keyword-clustering")` |
| `/api/projects/[projectId]/canvas/nodes` | GET / POST / PATCH / DELETE | Node CRUD (bulk PATCH transactional) | `verifyProjectWorkflowAuth("keyword-clustering")` |
| `/api/projects/[projectId]/canvas/pathways` | POST / DELETE | Pathway create/delete | `verifyProjectWorkflowAuth("keyword-clustering")` |
| `/api/projects/[projectId]/canvas/sister-links` | POST / DELETE | Sister link create/delete | `verifyProjectWorkflowAuth("keyword-clustering")` |
| `/api/projects/[projectId]/canvas/rebuild` | POST | Atomic diff-based canvas rebuild | `verifyProjectWorkflowAuth("keyword-clustering")` |
| `/api/ai/analyze` | POST | Auto-Analyze AI endpoint (unchanged in Ckpt 5) | — |
| `/api/admin-notes?system=` | GET | List admin notes for a system | `verifyAuth` |
| `/api/admin-notes` | POST | Create admin note | `verifyAuth` |
| `/api/admin-notes/[noteId]` | GET / PATCH / DELETE | Note CRUD | `verifyAuth` |
| `/api/admin-notes/reorder` | POST | Bulk reorder (transactional) | `verifyAuth` |
| `/api/admin-notes/[noteId]/attachments` | POST | Upload attachment (multipart) | `verifyAuth` |
| `/api/admin-notes/[noteId]/attachments/[attachmentId]` | DELETE | Delete attachment | `verifyAuth` |
| `/api/user-preferences/[key]` | GET / PUT | Per-user preference upsert | `verifyAuth` |

**Activity tracking side-effect (post-Ckpt-5):** All KC workflow-data routes (keywords, canvas nodes, pathways, sister-links, rebuild) call `markWorkflowActive(projectId, "keyword-clustering")` after successful mutations. This flips `ProjectWorkflow.status` from `"inactive"` to `"active"` on first meaningful use and refreshes `lastActivityAt`. GET endpoints and canvas state (pan/zoom) do NOT trigger activity tracking.

---

## 4. `/projects/[projectId]/keyword-clustering` page — current live state (Ckpt 7)

Following Ckpt 7, the Keyword Clustering client page is now a **single-state, URL-driven page**. Key properties:

- **Route:** `/projects/[projectId]/keyword-clustering` (Next.js App Router; `[projectId]` is a dynamic segment)
- **File:** `src/app/projects/[projectId]/keyword-clustering/page.tsx` (164 lines)
- **Reads projectId from URL** via `useParams()`, not from component state
- **Fetches Project summary** on mount via `GET /api/projects/[projectId]` to populate the header with the Project name
- **Handles 404/403** with friendly error UI + "Back to Projects" button (rather than crashing or silently failing)
- **Back-to-Project navigation** via the top-bar link → `/projects/[projectId]` (the Project detail page)
- **Preserves all existing workspace code** — the `<KeywordWorkspace>` component and its tree under `components/` moved alongside the page unchanged, still receive `projectId, userId, aiMode` as props
- **Build-compatible** — `npm run build` completes without errors; new route appears in the build output as `ƒ /projects/[projectId]/keyword-clustering`

### What Ckpt 7 removed from the old page
- "Projects List" state (State A of the old dual-state page) — the project list, "+ New Project" form, and delete buttons
- `activeProjectId` state variable and its associated setter logic
- `fetchProjects()` function (listing was on the old page; now on `/projects`)
- `createProject()` function (now on `/projects` via the "+ New Project" inline form)
- `deleteProject()` function (now on `/projects` via the two-step delete confirm)
- The "← Back to projects" sub-topbar link that used to sit below the main topbar in State B — no longer needed, the main "Back to Project" is the single Back control

### What Ckpt 7 did NOT change
- `KeywordWorkspace.tsx` and every file under `components/` — same code, moved to new location, still referenced by relative imports (`./components/KeywordWorkspace`). Git detected all 44 files as renames (100% content match).
- The API routes — `verifyProjectWorkflowAuth` already creates the ProjectWorkflow row on first access, so the workspace works regardless of whether this is the Project's first visit to Keyword Clustering or the 100th.
- The Auto-Analyze checkpoint key pattern — already uses `projectWorkflowId`, not `projectId`, so no change needed.

### Deploy status
**The app remains in a Phase-M-hold deploy state until Ckpt 9.** Everything Ckpts 1–7 have built exists only in local commits (`3b69cf2` Ckpt 6, `5cc10c5` Ckpt 7). The live site at vklf.com still runs the pre-Phase-M commit (`f545e2a`) which is fully broken against the new Supabase schema. Safety branch `phase-m-safety-net` at `f545e2a` remains available for emergency rollback.

---

## 5. Database schema

Source of truth: `prisma/schema.prisma`

### 5.1 Terminology alignment (IMPORTANT)

- **"Project"** — user-facing concept AND database table name. One Project = one product launch effort.
- **"ProjectWorkflow"** — internal database table (user never sees this term). Tracks per-workflow state for a Project. Holds the data bucket for each workflow.
- **All workflow data tables** (Keyword, CanvasNode, Pathway, SisterLink, CanvasState) reference `projectWorkflowId`.

### 5.2 LIVE schema (as of end of Phase M Checkpoint 5; unchanged by Ckpts 6–7)

This is the schema currently running in Supabase. The server-side code aligns with it (Ckpt 5 done); client-side UI alignment completed in Ckpts 6–7.

```prisma
// Project — user-facing record.
// One Project = one product launch effort.
model Project {
  id          String   @id @default(uuid())
  userId      String
  name        String   @default("Untitled Project")
  description String   @default("") @db.Text
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  workflows   ProjectWorkflow[]

  @@index([userId])
}

// ProjectWorkflow — internal per-workflow state + data bucket.
// User never sees this name in the UI.
model ProjectWorkflow {
  id              String    @id @default(uuid())
  projectId       String
  workflow        String    // "keyword-clustering", etc.
  status          String    @default("inactive") // "inactive"|"active"|"completed"
  firstActivityAt DateTime?
  lastActivityAt  DateTime?
  completedAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  project     Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  keywords    Keyword[]
  canvasNodes CanvasNode[]
  pathways    Pathway[]
  sisterLinks SisterLink[]
  canvasState CanvasState?

  @@unique([projectId, workflow])
  @@index([projectId])
}

// Keyword — attached to a workflow instance (was: Project).
model Keyword {
  id                String   @id @default(uuid())
  projectWorkflowId String
  keyword           String
  volume            Int      @default(0)
  sortingStatus     String   @default("Unsorted")
  tags              String   @default("")
  topic             String   @default("")
  canvasLoc         Json     @default("{}")
  topicApproved     Json     @default("{}")
  sortOrder         Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  projectWorkflow   ProjectWorkflow @relation(fields: [projectWorkflowId], references: [id], onDelete: Cascade)

  @@index([projectWorkflowId])
}

// CanvasNode, Pathway, SisterLink, CanvasState — same pattern: projectWorkflowId FK
// AdminNote, NoteAttachment, UserPreference — unchanged from pre-Phase M
// (AdminNote.system enum expands to include "dashboard" and "plos" at the app level)
```

For the complete file, see `prisma/schema.prisma` (206 lines).

### 5.3 Schema evolution philosophy

Per `PROJECT_CONTEXT.md` §13, the schema evolves iteratively as new needs are discovered during workflow builds. Future schema changes will:

- Add optional fields with defaults (safe migrations)
- Create new tables for new workflows when those workflows are built
- Document every new field in `DATA_CATALOG.md` in the same chat the field is added

When rename-level or type-change migrations become necessary (rare), they're flagged as risky and handled carefully with explicit user approval.

### 5.4 What Phase M has completed vs. what remains

**Completed (Checkpoints 1–8):**
- ✅ Backup of pre-Phase M schema (`prisma/schema.prisma.bak`)
- ✅ Git safety branch (`phase-m-safety-net` at commit `f545e2a`)
- ✅ New schema written and validated
- ✅ Database reset via `npx prisma db push --force-reset` (all pre-Phase M data wiped, confirmed OK by user)
- ✅ New tables verified in Supabase Table Editor
- ✅ **Ckpt 5:** All server-side API routes aligned with new schema; `npm run build` clean; committed at `14d68e7`
- ✅ **Ckpt 6 (2026-04-17, chat `7a745b12-...`):** Built `/projects` page (~1,493 lines) and `/projects/[projectId]` detail page (~372 lines) with scale-aware features; committed at `3b69cf2`.
- ✅ **Ckpt 7 (2026-04-17, chat `7e0b8456-...`):** Refactored Keyword Clustering to `/projects/[projectId]/keyword-clustering`, deleted old `/keyword-clustering` folder, cleaned up stray `projects/projectId` folder; `npm run build` clean; committed at `5cc10c5`.
- ✅ **Ckpt 8 (2026-04-17, chat `fc8025bf-...`):** Admin Notes added to `/dashboard` and `/plos`; `/plos` Keyword Analysis card rewired to `/projects`. Files changed: 3 edits (AdminNotes.tsx type extension, dashboard/page.tsx button, plos/page.tsx button + route rewire) + 2 new files (dashboard/notes/page.tsx, plos/notes/page.tsx). `npm run build` clean in 18.5s (17/17 static pages). Committed at `ac62a3a`.

**Remaining (Checkpoint 9):**
- Checkpoint 9: Deploy to vklf.com. Cleanup of 13 pre-existing leftover files in working tree + ~32 committed `.bak` files. `src/app/HANDOFF.md` / `src/app/ROADMAP.md` relocation. Add `*.bak*` to `.gitignore`. `npm run build`, commit, push, deploy, verify on vklf.com, visual-test all Phase M pages.

---

## 6. Authentication system

### How it works
- Supabase Auth issues JWTs on login
- Client stores session in Supabase client (persists via localStorage under Supabase's keys)
- Client-side code uses `authFetch()` from `src/lib/authFetch.ts` to add `Authorization: Bearer <jwt>`
- Server-side API routes call `verifyAuth()`, `verifyProjectAuth()`, or `verifyProjectWorkflowAuth()` from `src/lib/auth.ts`

### `verifyAuth(req)` → `{ userId, error }`
Validates JWT. Returns `userId` on success, 401 on failure.

### `verifyProjectAuth(req, projectId)` → `{ userId, projectId, error }`
Validates JWT AND checks user owns the Project. Returns 403 on ownership mismatch, 404 if Project missing.

### `verifyProjectWorkflowAuth(req, projectId, workflow)` → `{ userId, projectId, projectWorkflowId, workflow, error }` (NEW in Ckpt 5)
Does everything `verifyProjectAuth` does, PLUS upserts the `ProjectWorkflow` row for `(projectId, workflow)` so the caller always gets a valid `projectWorkflowId` to use. If the row doesn't exist yet, it's created with `status = "inactive"` — the first meaningful mutation will bump it to `"active"` via `markWorkflowActive`.

### History
- Originally trusted `x-user-id` header — security hole
- Phase 1-foundation added real JWT verification on ALL API routes
- Phase M Ckpt 5 added workflow-scoped auth helper

---

## 7. Shared systems

### AdminNotes (shared component)
- Location: `src/components/AdminNotes.tsx`
- Used by: `/pms/notes`, `/think-tank/notes`, `/dashboard/notes` (Ckpt 8), `/plos/notes` (Ckpt 8)
- Parameterized by `system` prop — separate data per system
- `SystemKey` type (line 34): `"think-tank" | "pms" | "dashboard" | "plos"` (last two added in Ckpt 8)
- Features: rich text editor, fonts, bold/italic/underline/color/alignment/lists/hyperlinks, undo/redo, 800ms auto-save, attachments (images/videos, 25MB max), Individual/Combined view, drag-to-reorder sidebar, resizable sidebar
- Preferences persisted per user + per system via `UserPreference`:
  - `adminnotes_sidebar_width`
  - `adminnotes_view_mode_<s>`
  - `adminnotes_combined_sort_<s>`

### Storage: `admin-notes` bucket
- Supabase Storage, public
- RLS for authenticated users
- Path: `<userId>/<noteId>/<timestamp>-<rand>-<safeName>`
- Deferred: switch to private + signed URLs

### Bulk API pattern
Routes modifying many records use Prisma `$transaction`:
- `PATCH /api/projects/[id]/keywords` (bulk)
- `PATCH /api/projects/[id]/canvas/nodes` (bulk)
- `POST /api/projects/[id]/canvas/rebuild` (atomic)
- `POST /api/admin-notes/reorder`

### Workflow Status Tracking (live as of Ckpt 5)
- Helper: `src/lib/workflow-status.ts` → `markWorkflowActive(projectId, workflow)` and `ensureProjectWorkflow(projectId, workflow)`
- `markWorkflowActive` is called after every mutation in KC workflow-data routes
- Logic: if status is "inactive", bump to "active" + set `firstActivityAt`. If "completed", leave status alone but still update `lastActivityAt`. Refresh `lastActivityAt` on every call.
- `ensureProjectWorkflow` is used by status-read endpoints to avoid 404s on never-visited workspaces — creates Inactive row silently if needed.

---

## 8. Keyword Clustering — tool architecture (for reference)

### Top-level component (as of Ckpt 7)
`src/app/projects/[projectId]/keyword-clustering/page.tsx` (164 lines) — single-state, Project pre-picked from URL via `useParams()`.

### Main workspace
`src/app/projects/[projectId]/keyword-clustering/components/KeywordWorkspace.tsx` — orchestrates when active

### Components (all under `src/app/projects/[projectId]/keyword-clustering/components/` post-Ckpt-7)
| Component | Purpose |
|---|---|
| ASTTable, MTTable, TIFTable | Manual mode tables |
| KASTable, TVTTable | AI mode analysis + topics tables |
| CanvasPanel, CanvasTableMode, CanvasEditPanel | Canvas system |
| AutoAnalyze | AI-powered auto-analyze (76KB) |
| KeywordWorkspace | Top-level orchestrator |
| FloatingPanel, ScrollArrows | UI utilities |

### Hooks
- `useKeywords.ts` — keyword state + batchUpdate + reorder
- `useCanvas.ts` — canvas state (lifted to KeywordWorkspace)

### Technical notes
- `xlsx` package: dynamic `await import('xlsx')` only (no top-level)
- `resolveOverlap` must run BEFORE `updateNodes()` save
- `useCanvas` lifted to KeywordWorkspace, passed as prop to CanvasPanel
- `aiMode` lives in page.tsx, passed as prop. **Per-session only — resets on page refresh** (tracked as Phase 1-polish item).
- Canvas multi-select uses refs (avoids stale closures)
- TSV export includes hidden X/Y columns
- Auto-Analyze Direct = browser→Anthropic, Server = browser→Vercel→Anthropic (5min timeout)
- Node layout: title (22px) → alt titles (14px) → description → KW preview (36px) → badge (18px)
- Checkpoint: localStorage `aa_checkpoint_{projectWorkflowId}` (key uses projectWorkflowId, not projectId)
- Sister links API: `POST /api/projects/{id}/canvas/sister-links` (URL unchanged; internals use projectWorkflowId)

---

## 9. Environment variables

Required in `.env.local` (local) and Vercel (production):

```
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...      # server-side only — NEVER expose
ANTHROPIC_API_KEY=...
DATABASE_URL=postgresql://...      # pooled
DIRECT_URL=postgresql://...        # direct (for migrations)
```

---

## 10. Known technical debt (deferred)

From Phase 1-foundation:
- Shared Keyword type to `src/types/keyword.ts`
- Unify volume type (Prisma Int vs TS string)
- Mutable state in CanvasPanel drag handlers
- ASTRow memoization
- Error state in useCanvas + error UI + retry
- Optimistic update rollback

From Phase 2:
- Move Think Tank projects from localStorage to DB
- Remove committed `.bak*` files; add `*.bak*` to `.gitignore`
- Switch `admin-notes` bucket to private + signed URLs
- Middleware deprecation warning (Next.js 16 "proxy" convention)
- Rich text editor uses deprecated `document.execCommand`

From Phase M:
- Two uncommitted handoff files live in `src/app/` (`HANDOFF.md`, `ROADMAP.md`) — should be relocated to repo root or `/docs` folder; files in `src/app/` risk Next.js treating them as routes
- `prisma/schema.prisma.bak` and backup branch `phase-m-safety-net` can be removed once Phase M is fully verified deployed
- **NEW from Ckpt 7 (2026-04-17):** ~30 `.bak`/`.bak2`/`.bak3` etc. files live in `src/app/projects/[projectId]/keyword-clustering/components/` (moved alongside the real components from their old location). Dead weight. Remove in Ckpt 9 cleanup.

From Phase M Ckpt 5 (2026-04-17):
- **Race condition on `nextNodeId` / `nextPathwayId`** in canvas/nodes POST and canvas/pathways POST. Two concurrent requests could read same id and collide on primary key. Fix options: wrap in `$transaction` with SERIALIZABLE isolation, OR switch to UUID primary keys. Priority: low-to-medium. Must be fixed before multi-user (Phase 1-collab).
- Asymmetric `canvasState` upsert logic between `canvas/nodes/route.ts` POST and `canvas/pathways/route.ts` POST — worth normalizing.
- `ops as any` TypeScript workaround in `canvas/rebuild/route.ts` — pre-existing, low priority.

From Platform Architectural Reveal chat (2026-04-17 — chat `cc15409c-...`):
- 🆕 **`/projects` page design is incomplete for Phase 3 scale.** Currently sketched for small-scale admin-solo; at 500–5,000 Projects/week and 50 concurrent users, page needs filter/search/sort/pagination/role-scoped queries. Admin-solo version built in Phase M Ckpt 6; scale-aware version planned for Phase 2.
- 🆕 **No assignment table yet.** Phase 2 requires three-way (User, Workflow, Project) assignment model (`PLATFORM_REQUIREMENTS.md §2.2`). Schema not designed.
- 🆕 **No review-cycle infrastructure yet.** Phase 2 requires states (`assigned | in-progress | submitted-for-review | acceptable | revision-requested`) + `ReviewNote` table + email notifications (`PLATFORM_REQUIREMENTS.md §4`). Schema not designed.
- 🆕 **No audit-trail infrastructure yet.** Phase 2 requires `AuditEvent` table + shared emission helper; opt-in per workflow (`PLATFORM_REQUIREMENTS.md §5`). Schema not designed.
- 🆕 **No role column on User records.** Phase 2 requires at minimum `admin | worker` roles with permission middleware on all API routes.
- 🆕 **No real-time collaboration infrastructure.** Phase 2 requires per-workflow strategy (Keyword Clustering: OT/CRDT for 10–20 concurrent editors; others TBD — `PLATFORM_REQUIREMENTS.md §3`). Likely library choice: Supabase Realtime + Yjs, Liveblocks, or similar.
- 🆕 **No Shared Workflow-Tool Scaffold yet.** Required before workflow #2 build begins (`PLATFORM_REQUIREMENTS.md §12`). Design chat not yet scheduled.
- 🆕 **No workflow-readiness resolver yet.** Per-workflow declarative rules will be added as workflows are built; UI indicators (`ready` / `not-ready`) not yet implemented.
- 🆕 **No "reset workflow data" feature in any workflow yet.** Required for admin per `PLATFORM_REQUIREMENTS.md §7`; first implementation will be Keyword Clustering (low priority during Phase 1 solo; high priority before Phase 2 workers arrive).
- 🆕 **Workflow deliverable storage strategy not designed.** Platform will need a deliverables bucket (separate from `admin-notes`) with per-workflow organization, possibly private + signed URLs.

From Phase M Ckpt 6 (2026-04-17):
- 🆕 **Card-label edits (`/dashboard` 3 system cards + `/plos` 14 workflow cards) still save to localStorage.** In Phase 2 these become shared data — admin's edits need to be visible to all workers on all their browsers. Migration to DB required before Phase 2. ROADMAP item logged.

From Phase M Ckpt 7 (2026-04-17):
- 🆕 **Manual/AI toggle on Keyword Clustering page resets on refresh.** Low priority; admin typically uses one mode per session. Would benefit from persisting per-user preference via `UserPreference`. ROADMAP Phase 1-polish item logged.

From Phase M Ckpt 8 (2026-04-17) — **Pre-Ckpt-9 leftover inventory (CRITICAL for all chats before Ckpt 9):**

**Thirteen files exist in the user's working tree that are NOT part of any committed checkpoint.** They accumulated across Ckpts 5, 6, and 7 and were not swept in by those chats (correctly — each chat committed only its own work). Ckpt 8 also did not commit them (Option A clean split). Ckpt 9 deletes them during its cleanup pass.

```
prisma/schema.prisma.bak                          (Ckpts 1–4 backup; schema stable — safe to delete)
src/app/HANDOFF.md                                (legacy location; relocate to /docs/ or delete)
src/app/ROADMAP.md                                (legacy location; relocate to /docs/ or delete)
src/app/api/projects/route.ts.bak                 (Ckpt 5)
src/app/api/projects/[projectId]/route.ts.bak     (Ckpt 5)
src/app/api/projects/[projectId]/canvas/route.ts.bak                (Ckpt 5)
src/app/api/projects/[projectId]/canvas/nodes/route.ts.bak          (Ckpt 5)
src/app/api/projects/[projectId]/canvas/pathways/route.ts.bak       (Ckpt 5)
src/app/api/projects/[projectId]/canvas/rebuild/route.ts.bak        (Ckpt 5)
src/app/api/projects/[projectId]/canvas/sister-links/route.ts.bak   (Ckpt 5)
src/app/api/projects/[projectId]/keywords/route.ts.bak              (Ckpt 5)
src/app/api/projects/[projectId]/keywords/[keywordId]/route.ts.bak  (Ckpt 5)
src/lib/auth.ts.bak                               (Ckpt 5)
```

**Plus committed `.bak` files that also need Ckpt 9 removal:**
- `src/app/dashboard/page.tsx.bak` (committed `ac62a3a`)
- `src/app/plos/page.tsx.bak` (committed `ac62a3a`)
- ~30 `.bak`/`.bak2`/`.bak3`/etc. files in `src/app/projects/[projectId]/keyword-clustering/components/` (committed during Ckpt 7's folder move at `5cc10c5`)

**Procedural rule for any chat BEFORE Ckpt 9:** `git add -A` silently sweeps these into the next chat's commit. Use specific paths or run `git reset HEAD <paths>` after staging to unstage leftovers before committing. See `CORRECTIONS_LOG.md` 2026-04-17 entry "Pre-existing .bak/untracked files in git status handled via Option A clean split" for the canonical procedure.

---

## 11. Performance considerations

### Current
- Bulk endpoints use `$transaction`
- Canvas visibility-aware rendering
- AST 200ms search debounce
- Virtual scroll for keyword lists

### Planned (Phase 1-realtime)
- Server-side cursor pagination for keywords
- Server-side search/filtering/sorting
- Supabase Realtime subscriptions

---

## 12. Deployment

### Flow
```
Codespace edit → git commit → git push origin main → Vercel auto-deploy → live at vklf.com
```

### Before every push
- `npm run build` must succeed locally
- Migration involved? Verify in Prisma Studio first
- `cp file file.bak` any replaced file
- `wc -l` to verify line count

### After every deploy
- Test at https://vklf.com with Ctrl+Shift+R
- Ask user to visually confirm

### Phase M deployment note
**The app is currently in a broken intermediate state.** The live Supabase DB has the new schema (Phase M Ckpt 4 complete), and the server-side API routes have been rewritten (Ckpt 5 complete) plus all client-side pages (`/projects`, `/projects/[projectId]`, `/projects/[projectId]/keyword-clustering`, `/dashboard/notes`, `/plos/notes`) have been built (Ckpts 6–8 complete), but none of this is deployed yet. DO NOT deploy to vklf.com until Checkpoint 9 of Phase M is reached. The safety branch `phase-m-safety-net` at `f545e2a` can be reverted to if something goes wrong, but note that the DB schema would still need to be reverted too. Local main is now 4 commits ahead of origin/main: `14d68e7` Ckpt 5, `3b69cf2` Ckpt 6, `5cc10c5` Ckpt 7, `ac62a3a` Ckpt 8.

---

## 13. Phase 2 schema sketch (planned, NOT YET BUILT)

This section records the schema additions that Phase 2 will require. These tables do NOT exist in the database as of April 17, 2026. This sketch is a **planning reference**, not a commitment to specific field names — final shape will be decided at Phase 2 design time.

### 13.1 Assignment (three-way join)

```prisma
model Assignment {
  id          String   @id @default(uuid())
  userId      String
  projectId   String
  workflow    String   // e.g., "keyword-clustering"
  grantedBy   String   // admin userId
  grantedAt   DateTime @default(now())
  revokedAt   DateTime?
  reviewState String   @default("assigned") // "assigned"|"in-progress"|"submitted-for-review"|"acceptable"|"revision-requested"

  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId, workflow])
  @@index([userId])
  @@index([projectId, workflow])
  @@index([reviewState])
}
```

Notes:
- Review state lives on the Assignment (per-user) not on ProjectWorkflow (per-project), because multiple users can have different review states on the same (project, workflow) simultaneously.
- `revokedAt` allows admin to revoke access without deleting history.
- Index on `reviewState` supports admin queries like "show me all assignments awaiting review."

### 13.2 ReviewNote

```prisma
model ReviewNote {
  id            String     @id @default(uuid())
  assignmentId  String
  authorUserId  String     // usually admin
  content       String     @db.Text  // rich text
  createdAt     DateTime   @default(now())

  assignment    Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)

  @@index([assignmentId])
}
```

Notes:
- One assignment can have many review notes (revision → resubmit → revision cycles).
- Content supports rich text (reuse Admin Notes editor component).

### 13.3 AuditEvent

```prisma
model AuditEvent {
  id          String   @id @default(uuid())
  projectId   String
  workflow    String
  userId      String
  eventType   String   // workflow-specific, e.g., "keyword.created", "node.moved"
  payload     Json     @default("{}")
  createdAt   DateTime @default(now())

  @@index([projectId, workflow])
  @@index([userId, createdAt])
  @@index([createdAt])
}
```

Notes:
- Opt-in per workflow (not every workflow emits audit events).
- No FK to Project — intentionally soft — so that audit history survives Project deletion if needed (policy TBD).
- Payload is JSON for workflow-specific event data.
- At Phase 4 scale (5,000 Projects/week), this table may need partitioning or archival.

### 13.4 User role

The existing user record (managed by Supabase Auth) will need a role attribute in Phase 2. Two likely options:
- **Option A:** Add a `UserRole` table with `(userId, role)` rows, allowing multi-role users
- **Option B:** Add a `role` column to a `UserProfile` table (new) since Supabase's `auth.users` isn't directly extensible

Decision deferred to Phase 2 planning.

### 13.5 Workflow deliverable storage

At Phase 2, workflows produce files (images, PDFs, videos, design files, compliance docs). Current `admin-notes` bucket is not appropriate (wrong scope, public, wrong security posture).

Likely design (to be confirmed at Phase 2):
- New bucket `workflow-deliverables` (private, signed URLs)
- Path pattern: `<projectId>/<workflow>/<filename>`
- `Deliverable` table recording metadata (owner, uploaded-by, versioned, etc.)

---

END OF DOCUMENT
