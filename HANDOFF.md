# Brand Operations Hub — Developer Handoff
## Complete Documentation for Chat Continuation

---

## 0. TERMINOLOGY & NAMING CONVENTIONS

**Brand Operations Hub** — The overall application name shown on login and post-login landing page.

**Workflows** — Each operational area accessed from the post-login landing page. Refer to each by its landing page card title:
- **Keyword Clustering** (active — migrated from original ~17,691-line HTML tool)
- Competition Scraping & Analysis (coming soon)
- Conversion Funnel Creation (coming soon)
- Content Development (coming soon)
- Multi-Media Assets Development (coming soon)
- Post-Launch Review Generation (coming soon)
- Clinical Evidence & Endorsement Generation (coming soon)
- IP Development (coming soon)
- Post Launch Improvement (coming soon)
- Exit Strategy (coming soon)

---

## 1. PROJECT OVERVIEW

**Stack:** Next.js 16 (App Router, TypeScript, Tailwind), Prisma 6, Supabase (Postgres + Auth), Vercel hosting.
**Repo:** Private GitHub repository, developed in GitHub Codespaces.
**Domain:** https://vklf.com (Vercel auto-deploy from `main` branch).
**Codespace path:** `/workspaces/brand-operations-hub`

---

## 2. DATABASE SCHEMA (Prisma)

6 tables: **Project**, **Keyword**, **CanvasNode**, **Pathway**, **SisterLink**, **CanvasState**.

Key fields on CanvasNode:
```
id, projectId, title, description, x, y, w, h, baseY, pathwayId, parentId,
relationshipType, linkedKwIds (JSON), kwPlacements (JSON), collapsedLinear,
collapsedNested, narrativeBridge, altTitles (JSON), userMinH, connCP, connOutOff,
connInOff, sortOrder
```

Schema file: `prisma/schema.prisma`

---

## 3. APPLICATION ARCHITECTURE

### Key Files
| File | Purpose |
|------|---------|
| `src/app/keyword-clustering/page.tsx` | Page shell, project selector, `aiMode` state |
| `src/app/keyword-clustering/components/KeywordWorkspace.tsx` | Main workspace — lifts `useCanvas`, connects all panels |
| `src/app/keyword-clustering/components/CanvasPanel.tsx` | SVG mindmap canvas + keyword preview + popover |
| `src/app/keyword-clustering/components/canvas-panel.css` | Canvas styles |
| `src/app/keyword-clustering/components/CanvasEditPanel.tsx` | Right-side edit drawer (320px) |
| `src/app/keyword-clustering/components/CanvasTableMode.tsx` | 9-column funnel table view |
| `src/app/keyword-clustering/components/ASTTable.tsx` | All Search Terms table |
| `src/app/keyword-clustering/components/MTTable.tsx` | Main Terms table |
| `src/app/keyword-clustering/components/TIFTable.tsx` | Terms In Focus table |
| `src/app/keyword-clustering/components/TVTTable.tsx` | Topics View Table |
| `src/app/keyword-clustering/components/KASTable.tsx` | Keywords Analysis Table |
| `src/app/keyword-clustering/components/AutoAnalyze.tsx` | Auto-Analyze overlay (config, batches, streaming, canvas apply) |
| `src/app/keyword-clustering/components/auto-analyze.css` | Auto-Analyze styles |
| `src/hooks/useKeywords.ts` | Keyword CRUD hook |
| `src/hooks/useCanvas.ts` | Canvas CRUD hook (nodes, pathways, sister links, state) |
| `src/app/api/ai/analyze/route.ts` | Server-side API proxy for Anthropic |

### Architecture Rules
- `useCanvas` is lifted to `KeywordWorkspace` and passed as `canvas` prop to `CanvasPanel` — CanvasPanel does NOT call `useCanvas` internally
- TVT and KAS accept `nodes`, `updateNodes`, `allKeywords` as props from KeywordWorkspace (no internal data fetching)
- `aiMode` state lives in `page.tsx` and is passed as prop to `KeywordWorkspace`
- Canvas multi-select uses `selectedIds: Set<number>` — drag/selection handlers use `viewXRef`/`viewYRef`/`zoomRef` refs to avoid stale closures
- `volume` field may be `string | number` — always use `Number(kw.volume) || 0`
- Single-click on canvas nodes selects only; right-click opens edit panel; double-click renames inline
- TSV export includes hidden X/Y columns to preserve node positions
- TSV import has Merge vs Overwrite modes when existing data is present
- Canvas node overlap resolution (`resolveOverlap`) must run BEFORE `updateNodes()` save call
- The `xlsx` npm package is already installed and must be loaded via dynamic `await import('xlsx')` inside handlers (NOT top-level import) to avoid SSR build failures

---

## 4. CANVAS NODE RENDERING

Node layout zones (inside each SVG node box):
- Title (22px) → Alt titles (14px, if present) → Description (flexible, ~5 lines) → Keyword preview (36px, always reserved) → Badge (18px)

Key constants in `CanvasPanel.tsx`:
- `NODE_W = 220`, `NODE_H = 160` (minimum enforced height)
- `KW_PREVIEW_H = 36` (always allocated regardless of keyword count)
- `renderH = Math.max(node.h, NODE_H)` enforces minimum display height

Keyword preview: blue pills (primary), purple italic pills (secondary).
Keyword popover: `kwPopoverNodeId` state, floating panel on ▼ click.
Pathway colors: 10-color rotation on left accent stripe.

---

## 5. AUTO-ANALYZE SYSTEM

### Overview
- Two API modes: **Direct** (browser→Anthropic, no timeout) and **Server** (browser→Vercel→Anthropic, 5-min timeout)
- Streaming SSE, stall retries (5) + model retries (3)
- Processing modes: **Adaptive** (default, auto-sizing 8→12→18) / **Classic** (fixed batch size)
- Hybrid full-table → delta auto-switch on truncation
- 5 hard + 7 soft validation checks
- Canvas apply: overwrite/rebuild approach (delete all nodes, recreate from TSV)
- Post-apply: keyword linking, pathway creation, depth-0 chaining, sister link creation
- Checkpoint persistence: saves to `localStorage` after each batch, resume banner on reload

### Canvas Apply Steps (in AutoAnalyze.tsx)
1. Delete existing nodes
2. Parse TSV response
3. Create nodes with auto-layout
4. Set parent relationships
4b. Chain depth-0 nodes with linear connections
5. Link keywords to nodes
6. Create sister links
7. Verify and mark keywords as AI-Sorted

### Config Fields (all have ⓘ help tooltips)
API Mode, API Key, Model, Scope, Seed words, Processing, Batch size, Thinking, Budget, Stall timeout, Volume threshold, Review mode, Initial Prompt, Topics Layout Table Primer

---

## 6. PERFORMANCE & BUILD NOTES

- Always build before push: code is auto-deployed to Vercel from GitHub
- TypeScript strict mode — run `npx tsc --noEmit` to check for errors
- ANTHROPIC_API_KEY is configured in both Codespace `.env.local` and Vercel environment variables

---

## 7. UI MODES

### Manual Mode (default)
3-panel left (AST + MT + TIF) + Topics Layout Canvas right. 4 visibility checkboxes.

### AI Mode
Single "Keywords Working Area" (one of 4 views) + Canvas. AI Actions Pane with four-way toggle:
1. Normal Table View (AST)
2. Common Terms View (MT)
3. Keywords Analysis View (KAS)
4. Topics View (TVT)

---

## 8. SAFETY PROTOCOL — CRITICAL

**Before replacing ANY existing file:**
1. ALWAYS back it up first: `cp file file.bak`
2. If multiple backups exist, use `.bak2`, `.bak3`, etc.
3. After the user uploads a replacement, verify line count: `wc -l file`
4. NEVER provide a partial file as a replacement — it MUST contain ALL content
5. Always build/check before push
6. Always ask the user to visually confirm after deploy
7. When writing Python fix scripts with `!` characters, always use the heredoc pattern (`cat > /tmp/fix.py << 'PYEOF'`) because bash interprets `!` in double-quoted strings

**Codespaces deployment workflow:**
- The GitHub Codespaces PORTS tab often does not show port 3000 even when the dev server is running. Do NOT spend time troubleshooting it.
- Instead: push code to GitHub with `git add -A && git commit -m "message" && git push`, wait 1–2 minutes for Vercel auto-deploy, then test at https://vklf.com (use Ctrl+Shift+R to hard refresh).

**User context:**
- The user is a complete novice with no programming knowledge
- Always provide step-by-step instructions with exact commands, what to click, and where to go
- Never assume the user knows how to do something — spell it out
- Always confirm each step before moving to the next
- When asking for manual edits, show exact text to find and exact replacement
- When replacing files, provide complete file content as a downloadable file
- Never provide commands without context and instructions
- When running terminal commands, explain what they do
- When commands fail (red circle), investigate and explain

---

## 9. DATA PERSISTENCE AUDIT — CRITICAL

### Current Persistence Status

A comprehensive audit revealed that many types of user data and UI state are NOT being persisted across page refreshes. This section documents everything: what currently persists, what doesn't, and what the fix strategy is.

### Storage Strategy
| Data Type | Storage Target | Reason |
|-----------|---------------|--------|
| User data (MT entries, TIF entries, AA config/prompts) | **Database** | Survives refresh, tab close, device switching |
| UI preferences (zoom, column visibility, panel sizes) | **localStorage** | Lightweight, device-specific, no API needed |
| Ephemeral state (search queries, selections, drag state) | **React state only** | Acceptable to lose on refresh |

### What currently DOES persist (saved to database):
- ✅ Keywords — add, remove, edit text, volume, tags, topics, topic descriptions, sorting status, sort order
- ✅ Canvas nodes — position, size, title, description, alt titles, parent relationships, linked keywords, placements, pathway assignments
- ✅ Canvas state — viewport position (viewX, viewY, zoom)
- ✅ Pathways — created during auto-analyze
- ✅ Sister links — created during auto-analyze
- ✅ Projects — name, creation, deletion

### What does NOT persist — MUST FIX (user loses work):

| # | What's Lost | Where It Lives | State Variable | Fix Target |
|---|------------|----------------|----------------|------------|
| 1 | **MT Table entries** (Main Terms added by user) | KeywordWorkspace.tsx line 123 | `mtEntries: MTEntry[]` | Database (new table or JSON field on Project) |
| 2 | **Auto-Analyze config** (API key, model, seed words, all settings) | AutoAnalyze.tsx lines 165–176 | Multiple useState vars | Database (JSON field on Project) or localStorage per project |
| 3 | **Auto-Analyze prompts** (Initial Prompt, Primer Prompt) | AutoAnalyze.tsx lines 177–178 | `initialPrompt`, `primerPrompt` | Database (JSON field on Project) or localStorage per project |

### What does NOT persist — SHOULD FIX (annoying UX):

| # | What's Lost | Where It Lives | State Variable | Fix Target |
|---|------------|----------------|----------------|------------|
| 4 | **Panel visibility** (AST/MT/TIF/Canvas checkboxes) | KeywordWorkspace.tsx lines 131–134 | `showAST`, `showMT`, `showTIF`, `showCanvas` | localStorage |
| 5 | **AST column visibility** (Vol/Tags/Topics/TopicDesc toggles) | ASTTable.tsx lines 86, 90–92 | `showVol`, `showTags`, `showTopics`, `showTopicDesc` | localStorage |
| 6 | **AST status filters** (Sorted/Partial/Unsorted checkboxes) | ASTTable.tsx lines 87–89 | `showSorted`, `showPartial`, `showUnsorted` | localStorage |
| 7 | **AST zoom / font size** | ASTTable.tsx line 101 | `fontSize` | localStorage |
| 8 | **AI table view selection** (Normal/Common/Analysis/Topics) | KeywordWorkspace.tsx line 127 | `aiTableView` | localStorage |
| 9 | **Canvas mode** (Mindmap vs Table toggle) | CanvasPanel.tsx | `canvasMode` | localStorage |
| 10 | **Canvas collapsed nodes** (which parents are expanded/collapsed) | CanvasPanel.tsx | `collapsed: Set<number>` | localStorage |
| 11 | **TIF entries** (Terms In Focus keyword list) | KeywordWorkspace.tsx line 122 | `tifKeywords: string[]` | localStorage (session-like, matches original tool) |
| 12 | **TIF active/paused toggle** | KeywordWorkspace.tsx line 124 | `tifActive` | localStorage |

### What does NOT persist — NICE TO HAVE:

| # | What's Lost | Where It Lives | State Variable | Fix Target |
|---|------------|----------------|----------------|------------|
| 13 | **Panel flex ratios** (divider drag positions) | KeywordWorkspace.tsx lines 145–146 | `panelFlex`, `leftFrac` | localStorage |
| 14 | **Detached panel states** (floating windows open/closed) | KeywordWorkspace.tsx lines 137–140 | `detachedAST/MT/TIF/Canvas` | localStorage |

### What does NOT persist — ACCEPTABLE (ephemeral by nature):
- AST search query, tag filter text, topic filter text
- Row selections (checkboxes)
- Drag states, hover states, editing states
- Edit panel open/closed state
- Toast notifications

---

## 10. PHASE STATUS

| Phase | Status |
|-------|--------|
| Phase 0 — Foundation Setup | ✅ COMPLETE |
| Phase 1a — Data Layer | ✅ COMPLETE |
| Phase 1b — AST Table | ✅ COMPLETE |
| Phase 1c — MT + TIF Tables | ✅ COMPLETE |
| Phase 1d — Topics Layout Canvas | ✅ COMPLETE |
| Phase 1e — Canvas Table Mode | ✅ COMPLETE |
| Phase 1f — AI Mode + KAS + TVT | ✅ COMPLETE |
| Phase 1g — Auto-Analyze System | ✅ CODE COMPLETE (testing pending) |
| **Phase 1-persist — Data Persistence Fixes** | ❌ **NOT STARTED — HIGH PRIORITY** |
| Phase 1h — Download/Upload .kst | ❌ NOT STARTED |
| Phase 2 — Competition Scraping | ❌ NOT STARTED |
