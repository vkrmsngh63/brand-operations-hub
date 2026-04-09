# Brand Operations Hub — Developer Handoff
## Complete Documentation for Chat Continuation

---

## 0. SESSION SUMMARY (Latest — Phase 1g Auto-Analyze)

**Completed this session:**
- Phase 1g (partial): Auto-Analyze system with full processing engine
- Server-side API proxy route (`/api/ai/analyze`) with 5-min Vercel timeout
- Direct browser→Anthropic API mode (no timeout, user provides API key)
- User can choose between "Direct" and "Server proxy" modes in the overlay
- Auto-Analyze overlay UI: configuration panel, prompt section, batch list, progress bar, activity log, control buttons (Start/Pause/Resume/Cancel)
- Full batch processing loop: queue building, adaptive batch sizing, streaming SSE, stall/error retries, delta mode auto-switch
- Prompt assembly with system prompt + primer + output instructions (Mode A full table / Mode B delta)
- Response parsing: delimited block extraction, delta merge, KAT mapping
- Validation engine: 5 hard checks (result exists, table present, keywords placed, no deletions, no keyword losses) + soft warnings
- Canvas apply logic: overwrite/rebuild approach — delete all nodes, parse TSV, create nodes with auto-layout, set parent relationships
- Pathway creation for depth-0 nodes with pathwayId assigned to all descendants
- Depth-0 node chaining with linear connections for conversion funnel flow
- Keyword linking to nodes with [p]/[s] placement parsing
- Keyword `topic` and `canvasLoc` fields updated when linked to nodes
- Post-apply refresh: `fetchCanvas()` + `fetchKeywords()` to sync UI
- AI-Sorted status marking with post-apply verification
- Node title overflow fix (foreignObject with text-overflow ellipsis)
- Keyword preview section at bottom of canvas nodes (up to 5 keywords shown)
- Keyword popover (dark floating panel anchored to node, shows all keywords with volume and placement)
- Node layout zones: title → alt titles → description → keyword preview → badge

**Known issues to fix in next session:**
- **Keyword preview not displaying in topic nodes** — the layout code and popover are in place but keywords are not rendering in the preview section. This is the first thing to debug in the next chat.
- Depth-0 linear chain connections not yet tested (requires fresh auto-analyze run)
- Pathway colors not yet tested (requires fresh auto-analyze run)
- Copy activity log button not yet added
- Help icons (ⓘ) with tooltips on config elements not yet added

**Key architectural decisions:**
- Auto-Analyze uses overwrite/rebuild approach for canvas apply (matches original tool behavior) — all nodes deleted and recreated each batch
- Direct browser API mode calls `api.anthropic.com` with `anthropic-dangerous-direct-browser-access` header — no timeout limits
- Server proxy mode uses `/api/ai/analyze` route with `maxDuration = 300` (5 min Vercel limit, 15 min on Pro)
- `AutoAnalyze` component receives all data and callbacks as props from `KeywordWorkspace`
- Async run loop uses refs (`runningRef`, `abortRef`, `batchesRef`, `currentIdxRef`, etc.) to avoid stale closures
- `kwPopoverNodeId` state in CanvasPanel controls which node's keyword popover is shown
- Node vertical layout: title (22px) → alt titles (14px if present) → description (flexible) → keyword preview (36px if keywords exist) → badge (18px)

**Files created this session:**
- `src/app/api/ai/analyze/route.ts` (~55 lines) — Server-side API proxy
- `src/app/keyword-clustering/components/AutoAnalyze.tsx` (~1380 lines) — Full auto-analyze component
- `src/app/keyword-clustering/components/auto-analyze.css` (~325 lines) — Auto-analyze overlay styles

**Files modified this session:**
- `src/app/keyword-clustering/components/KeywordWorkspace.tsx` (~415 lines) — Added AutoAnalyze import, aaOpen state, wired ⚡ button, passed props
- `src/app/keyword-clustering/components/CanvasPanel.tsx` (~920 lines) — Added kwPopoverNodeId state, keyword preview in nodes, keyword popover, title overflow fix, layout zone calculation
- `src/app/keyword-clustering/components/canvas-panel.css` — Added keyword preview, popover, title wrap styles

---

## 1. PROJECT OVERVIEW

**Stack:** Next.js 16, TypeScript, Tailwind, Prisma 6, Supabase (PostgreSQL), Vercel
**Repo:** Private GitHub, auto-deploys to Vercel
**Live URL:** https://vklf.com
**Codespace path:** `/workspaces/brand-operations-hub`

---

## 2. DATABASE SCHEMA (Prisma)

### Keyword model
```prisma
model Keyword {
  id             String   @id @default(uuid())
  projectId      String
  keyword        String
  volume         Int      @default(0)
  sortingStatus  String   @default("Unsorted")
  tags           String   @default("")
  topic          String   @default("")
  canvasLoc      Json     @default("{}")    // per-topic descriptions: { "topicName": "description text" }
  topicApproved  Json     @default("{}")    // per-topic approval: { "topicName": true }
  sortOrder      Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  project        Project  @relation(...)
}
```

### CanvasNode model
```prisma
model CanvasNode {
  id                Int      @id
  projectId         String
  title             String   @default("")
  description       String   @default("")
  x                 Float    @default(0)
  y                 Float    @default(0)
  w                 Float    @default(220)
  h                 Float    @default(120)
  baseY             Float    @default(0)
  pathwayId         Int?
  parentId          Int?
  relationshipType  String   @default("")
  linkedKwIds       Json     @default("[]")
  kwPlacements      Json     @default("{}")
  collapsedLinear   Boolean  @default(false)
  collapsedNested   Boolean  @default(false)
  narrativeBridge   String   @default("")
  altTitles         Json     @default("[]")
  userMinH          Float?
  connCP            Json?
  connOutOff        Json?
  connInOff         Json?
  sortOrder         Int      @default(0)
  ...
}
```

### Other models: Pathway, SisterLink, CanvasState, Project (unchanged from previous sessions)

---

## 3. API ROUTES

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ai/analyze` | POST | Server-side proxy to Anthropic API (streaming SSE) |
| `/api/projects/[projectId]/keywords` | GET | List all keywords |
| `/api/projects/[projectId]/keywords` | POST | Create single or bulk `{ keywords: [...] }` |
| `/api/projects/[projectId]/keywords` | DELETE | Bulk delete `{ ids: [...] }` |
| `/api/projects/[projectId]/keywords/[keywordId]` | PATCH | Update keyword fields |
| `/api/projects/[projectId]/keywords/[keywordId]` | DELETE | Delete single keyword |
| `/api/projects/[projectId]/canvas` | GET | Get canvas state + pathways + sister links |
| `/api/projects/[projectId]/canvas` | PATCH | Update canvas state (viewport, zoom, counters) |
| `/api/projects/[projectId]/canvas/nodes` | GET | List all canvas nodes |
| `/api/projects/[projectId]/canvas/nodes` | POST | Create node (auto-increments nextNodeId) |
| `/api/projects/[projectId]/canvas/nodes` | PATCH | Bulk update nodes `{ nodes: [...] }` |
| `/api/projects/[projectId]/canvas/nodes` | DELETE | Delete nodes `{ id: N }` or `{ ids: [...] }` |
| `/api/projects/[projectId]/canvas/pathways` | POST | Create pathway |
| `/api/projects/[projectId]/canvas/pathways` | DELETE | Delete pathway |
| `/api/projects/[projectId]/canvas/sister-links` | POST | Create sister link |
| `/api/projects/[projectId]/canvas/sister-links` | DELETE | Delete sister link |

---

## 4. COMPONENT ARCHITECTURE

### page.tsx (keyword-clustering page)
- Manages: auth, project list, project selector, `aiMode` state
- Passes `aiMode` prop to KeywordWorkspace
- Manual/AI toggle button in top-right of page topbar

### KeywordWorkspace.tsx (~415 lines, main layout)
- Calls `useCanvas(projectId)` — single source of truth for canvas data
- Calls `useKeywords(projectId, userId)` — single source of truth for keywords
- Passes `canvas` prop (full useCanvas return) to CanvasPanel
- Passes `nodes`, `updateNodes`, `allKeywords` to TVTTable and KASTable
- **Manual mode:** 3-panel left (AST + MT + TIF) + Canvas right, panel visibility checkboxes, detach buttons, resizable dividers
- **AI mode:** AI Actions Pane (four-way toggle) + single table view + Canvas right
- AI table views: Normal→AST, Common→MT, Analysis→KAS, Topics→TVT
- Contains `aaOpen` state, renders `<AutoAnalyze />` with all props
- State: tifKeywords, mtEntries (lifted), panel visibility, detached state, panel flex sizes, aiTableView, aaOpen

### AIActionsPane (inside KeywordWorkspace)
- Four-way toggle: Normal / Common Terms / Analysis / Topics
- Buttons per view; Normal view has ⚡ Auto-Analyze button that calls `onOpenAA` prop
- Props: `view`, `onSetView`, `onOpenAA`

### AutoAnalyze.tsx (~1380 lines)
- Full auto-analyze overlay with configuration, prompt management, batch processing
- Two API modes: Direct (browser→Anthropic, no timeout) and Server (browser→Vercel→Anthropic, 5min/15min timeout)
- State machine: IDLE → RUNNING → PAUSED/BATCH_REVIEW/API_ERROR → ALL_COMPLETE
- Adaptive batch sizing: Foundation (8) → Expansion (12) → Placement (18)
- Full table → Delta auto-switch on truncation
- 5 hard validation checks + soft warnings
- Canvas apply: overwrite/rebuild with auto-layout, pathway creation, keyword linking
- Props: open, onClose, allKeywords, nodes, pathways, sisterLinks, onUpdateNodes, onAddNode, onDeleteNode, onBatchUpdateKeywords, projectId, onRefreshCanvas, onRefreshKeywords

### CanvasPanel.tsx (~920 lines)
- Accepts `canvas: ReturnType<typeof useCanvas>` as prop (no internal useCanvas call)
- **Mindmap mode**: SVG-based canvas with pan, zoom, node drag, connectors
- **Table mode**: Renders CanvasTableMode component
- **Multi-select**: `selectedIds: Set<number>` replaces old `selectedId`
- **Auto-pan**: Viewport scrolls when mouse near edge during drag
- **Keyword preview**: Bottom section of each node showing up to 5 keywords
- **Keyword popover**: `kwPopoverNodeId` state, dark floating panel with all keywords
- **Node layout zones**: title (22px) → alt titles (14px) → description (flexible) → kw preview (36px) → badge (18px)
- Right-click opens context menu + edit panel
- Double-click renames inline
- Single-click selects only (no edit panel)
- `resolveOverlap()` runs BEFORE `updateNodes()` save

### TVTTable.tsx (~479 lines)
- Topics View Table: depth-first tree walk, expand/collapse, drag-reorder
- Accepts `nodes`, `updateNodes`, `allKeywords` as props

### KASTable.tsx (~281 lines)
- Keywords Analysis Table: 9-column derived view
- Accepts `nodes`, `updateNodes`, `allKeywords` as props

### Other components unchanged: ASTTable, MTTable, TIFTable, CanvasTableMode, CanvasEditPanel, ScrollArrows, FloatingPanel

---

## 5. AUTO-ANALYZE SYSTEM DETAILS

### State Machine
```
IDLE → RUNNING → PAUSED (user pause)
                → BATCH_REVIEW (review mode)
                → API_ERROR (retryable)
                → VALIDATION_ERROR (retryable)
                → ALL_COMPLETE
```

### Processing Flow
1. User configures: model, seed words, scope, processing mode, thinking, prompts
2. `buildQueue()` creates batches from unsorted keywords
3. `runLoop()` processes batches sequentially
4. Each batch: `assemblePrompt()` → `buildRequestBody()` → `callApi()` (streaming SSE)
5. Response parsed: `extractBlock()` for delimited sections
6. `validateResult()` — 5 hard checks, retry on failure
7. `doApply()` — delete all nodes, rebuild from TSV, create pathways, link keywords
8. `onRefreshCanvas()` + `onRefreshKeywords()` to sync UI
9. Mark placed keywords as AI-Sorted

### API Modes
- **Direct**: Browser calls `api.anthropic.com` with `anthropic-dangerous-direct-browser-access` header. User provides API key. No timeout.
- **Server**: Browser calls `/api/ai/analyze` which proxies to Anthropic. API key from `ANTHROPIC_API_KEY` env var. 5-min timeout (free) / 15-min (Pro).

### Batch Tiers (Adaptive Mode)
- Foundation: 8 keywords per batch (starting)
- Expansion: 12 (when rolling 3-batch avg new topics < 2)
- Placement: 18 (when rolling 5-batch avg new topics < 1.5)

### Output Modes
- Mode A (Full Table): Complete TSV with all topics, used early
- Mode B (Delta): Only ADD/UPDATE rows, auto-switches when full table hits max_tokens

### Validation (5 Hard Checks)
1. Result exists
2. Topics Layout Table present and parseable
3. All batch keywords placed in some topic
4. No existing topics deleted
5. No previously-assigned keywords lost

### Canvas Apply (doApply)
1. Delete all existing nodes
2. Parse TSV rows (depth, title, altTitles, relationship, parent, keywords, description)
3. Create nodes with auto-layout (horizontal spread by depth, vertical stacking)
4. Create pathways for depth-0 nodes, assign pathwayId to descendants
5. Chain depth-0 nodes with linear parent→child relationships
6. Set parent relationships for all child nodes
7. Link keywords to nodes (linkedKwIds + kwPlacements)
8. Update keyword records (topic field + canvasLoc)
9. Refresh canvas + keywords
10. Verify placement, mark AI-Sorted

---

## 6. CANVAS IMPLEMENTATION DETAILS

### Node rendering
- SVG `<g>` groups with `transform={translate(x,y)}`
- Accent stripe (5px left bar) colored by pathwayId
- Title in foreignObject with text-overflow ellipsis
- Alt titles (smaller italic text)
- Description (foreignObject with line clamp)
- Keyword preview (foreignObject, 36px, up to 5 keywords + expand button)
- Badge showing keyword count + child count
- Resize grip in bottom-right corner
- Collapse toggle (▼/▶) when node has children

### Node layout zones (top to bottom)
- Title: y=4, 22px height
- Alt titles: y=28, 14px (only if present)
- Description: from descY to kwPreviewY (flexible, shrinks when keywords present)
- Keyword preview: kwPreviewY, 36px (only if keywords linked)
- Badge: bottom 18px

### Keyword popover
- `kwPopoverNodeId` state in CanvasPanel
- Dark floating panel positioned at node's right edge
- Shows all keywords with volume and [p]/[s] placement
- Primary keywords in blue, secondary in purple italic
- Close via ✕ button or clicking the ▲ button on the node

### Node interaction
- **Single-click**: Selects node (blue dashed outline), no edit panel
- **Shift+click**: Toggles node in multi-selection
- **Right-click**: Opens context menu AND edit panel on right side
- **Double-click**: Opens inline title rename input
- **Drag**: Move node(s); on release, resolveOverlap() auto-nudges if overlapping
- **Shift+drag background**: Draws selection box, selects all overlapping nodes

### Connectors
- Linear (P→P): Blue L-shaped elbow lines
- Nested (P→C): Orange L-shaped lines

### Canvas Table Mode — TSV Import/Export
- TSV export includes 11 columns including hidden X/Y position columns
- TSV import: auto-detects headers, flexibly maps columns, strips non-breaking spaces
- Import modes: Merge vs Overwrite
- `xlsx` loaded via dynamic `await import('xlsx')` to avoid SSR errors

---

## 7. KNOWN PATTERNS & GOTCHAS

- `canvasLoc` and `topicApproved` are JSON objects on Keyword. Always spread-copy: `const cl = { ...(kw.canvasLoc || {}) }`
- Topic delimiter is pipe `|` not comma: `"Topic A | Topic B"`
- Tag delimiter is comma: `"tag1, tag2"`
- AST virtual scrolling uses `splitRowH = splitTopics ? 80 : ROW_HEIGHT`
- AST zoom uses CSS `zoom` property (not `fontSize`)
- MT entries state is lifted to KeywordWorkspace to survive detach/reattach cycles
- MT resize handler has null guard: `if (!resizeRef.current) return prev`
- Divider drag uses incremental deltas (not absolute position tracking)
- Canvas collapse state is local (not persisted to DB yet)
- `linkedKwIds` is stored as Json in DB but typed as `string[]` in TypeScript — always cast appropriately
- `xlsx` must be imported dynamically (`await import('xlsx')`) inside async handlers — top-level import causes SSR build failure
- `resolveOverlap()` must run BEFORE `updateNodes()` — running after causes bounce-back
- `volume` field may be typed as `string | number` in some contexts — always use `Number(kw.volume) || 0`
- `useCanvas` is now called in KeywordWorkspace, NOT in CanvasPanel — CanvasPanel receives it as `canvas` prop
- Multi-select uses `selectedIds: Set<number>` — all old `selectedId` references were converted
- Selection box and node drag use ref-based viewport tracking (`viewXRef`, `viewYRef`, `zoomRef`) to avoid stale React closure values during mouse event handlers
- AutoAnalyze async loop uses refs alongside state to avoid stale closures in the while loop
- Python one-liners with `!` characters fail in bash due to history expansion — use `cat > /tmp/fix.py << 'PYEOF'` heredoc pattern instead
- Vercel free plan has 5-minute function timeout; Pro has 15 minutes — use Direct API mode for long-running Opus calls

---

## 8. MANDATORY SAFETY PROTOCOL

### Rules for Claude (every chat must follow these)

**RULE 1 — BACKUP BEFORE REPLACE**
Before replacing ANY existing file, always run a backup first:
```bash
cp path/to/file path/to/file.bak
```
If multiple backups exist, use `.bak2`, `.bak3`, etc.

**RULE 2 — NEVER PROVIDE PARTIAL FILES AS REPLACEMENTS**
If replacing a file, the new file MUST contain ALL content — not just additions or changes. A partial file that overwrites a complete one destroys work. This is the #1 most dangerous mistake Claude can make on this project.

**RULE 3 — VERIFY AFTER UPLOAD**
After the user uploads a replacement file, always verify the line count is reasonable:
```bash
wc -l path/to/file
```
Compare to the expected size. If a 200-line file suddenly has 30 lines, something went wrong.

**RULE 4 — BUILD BEFORE PUSH**
Always run `npx next build 2>&1 | tail -10` and confirm it passes before telling the user to push.

**RULE 5 — GIT IS THE SAFETY NET**
If something goes wrong after a push, revert immediately:
```bash
git log --oneline -5        # find the last good commit
git revert HEAD             # undo the last commit
```

**RULE 6 — VISUAL SPOT-CHECK ON DEPLOY**
After every Vercel deploy, always ask the user to confirm the page looks correct before moving on to new work. Never assume a deploy succeeded just because the build passed.

**RULE 7 — STEP-BY-STEP INSTRUCTIONS FOR NOVICE USER**
The user is a complete novice with no programming knowledge. For every action:
- Tell them exactly where to go, what to click, what to type
- Provide exact commands to copy-paste
- Confirm each step before moving to the next
- When asking them to edit files manually, show the exact text to find and the exact replacement text
- Verify their edits by asking them to paste back the relevant section
- Never just provide commands without context and instructions

**RULE 8 — USE HEREDOC PATTERN FOR PYTHON SCRIPTS**
Bash interprets `!` in double-quoted strings (history expansion). When writing Python scripts that contain `!`, always use the heredoc pattern:
```bash
cd /workspaces/brand-operations-hub && cat > /tmp/fix.py << 'PYEOF'
# python code here
PYEOF
python3 /tmp/fix.py
```

### Recovery commands (for the user)
- Restore a backup: `cp path/to/file.bak path/to/file`
- Undo last git commit (before push): `git reset --soft HEAD~1`
- Undo last git commit (after push): `git revert HEAD && git push`
- See recent changes: `git diff HEAD~1`
- See what files changed: `git log --oneline --name-only -3`

---

## 9. FILE LISTING

```
src/app/api/ai/analyze/
├── route.ts                   (~55 lines)

src/app/keyword-clustering/
├── page.tsx                    (~226 lines)

src/app/keyword-clustering/components/
├── ASTTable.tsx                (~1123 lines)
├── ast-table.css
├── MTTable.tsx                 (~1310 lines)
├── mt-table.css
├── TIFTable.tsx                (~849 lines)
├── tif-table.css
├── CanvasPanel.tsx             (~920 lines)
├── canvas-panel.css
├── CanvasEditPanel.tsx
├── canvas-edit-panel.css
├── CanvasTableMode.tsx         (~924 lines)
├── canvas-table-mode.css       (~566 lines)
├── TVTTable.tsx                (~479 lines)
├── tvt-table.css               (~327 lines)
├── KASTable.tsx                (~281 lines)
├── kas-table.css               (~172 lines)
├── KeywordWorkspace.tsx        (~415 lines)
├── workspace.css               (~386 lines)
├── AutoAnalyze.tsx             (~1380 lines)
├── auto-analyze.css            (~325 lines)
├── ScrollArrows.tsx
├── scroll-arrows.css
├── FloatingPanel.tsx
├── floating-panel.css
├── *.bak, *.bak2, *.bak3...   (backups)

src/hooks/
├── useKeywords.ts
├── useCanvas.ts

src/app/api/projects/[projectId]/
├── keywords/route.ts           (GET, POST, DELETE)
├── keywords/[keywordId]/route.ts (PATCH, DELETE)
├── canvas/route.ts             (GET, PATCH canvas state)
├── canvas/nodes/route.ts       (GET, POST, PATCH, DELETE)
├── canvas/pathways/route.ts    (POST, DELETE)
├── canvas/sister-links/route.ts (POST, DELETE)

prisma/
├── schema.prisma
```
