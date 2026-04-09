# Brand Operations Hub — Developer Handoff
## Complete Documentation for Chat Continuation

---

## 0. SESSION SUMMARY (Latest)

**Completed this session:**
- Phase 1f: Manual/AI mode toggle wired to existing topbar button in page.tsx
- Phase 1f: AI Actions Pane with four-way toggle (Normal / Common Terms / Analysis / Topics)
- Phase 1f: Keywords Analysis Table (KAS) — 9-column derived view showing keyword-to-topic mapping with upstream hierarchy, alternating group colors, copy TSV
- Phase 1f: Topics View Table (TVT) — light theme, depth-first tree walk, single expand/collapse toggle, drag-reorder, depth filter, zoom, description popover, ancestry highlighting
- Lifted `useCanvas` hook from CanvasPanel to KeywordWorkspace for shared state — Canvas and TVT/KAS now sync in real-time
- Canvas multi-select: shift+click to toggle nodes, shift+drag for selection box, group drag
- Canvas auto-pan: viewport auto-scrolls when dragging nodes or selection box near edges
- Delete key removes all selected nodes
- "N selected" indicator in toolbar

**Key architectural decisions:**
- `useCanvas` is now called in KeywordWorkspace and passed as a prop (`canvas`) to CanvasPanel and as individual props (`nodes`, `updateNodes`) to TVT/KAS
- CanvasPanel no longer calls `useCanvas` internally — it destructures from `canvas` prop
- TVT and KAS are purely derived views that accept `nodes` and `allKeywords` as props (no own data fetching)
- AI mode state (`aiMode`) lives in page.tsx and is passed as a prop to KeywordWorkspace
- `aiTableView` state lives in KeywordWorkspace (controls which table is shown in AI mode)
- Multi-select uses `selectedIds: Set<number>` instead of old `selectedId: number | null`
- Selection box and node drag use `viewXRef`/`viewYRef`/`zoomRef` refs to avoid stale closure values during drag operations
- Auto-pan uses EDGE_ZONE=40px and PAN_SPEED=8 canvas units per mouse event

**Files modified this session:**
- `src/app/keyword-clustering/page.tsx` (~226 lines) — Added `aiMode` state, wired Manual/AI toggle, passes `aiMode` prop to KeywordWorkspace
- `src/app/keyword-clustering/components/KeywordWorkspace.tsx` (~399 lines) — Lifted useCanvas, AI mode layout, four-way toggle, AI Actions Pane, imports KAS + TVT
- `src/app/keyword-clustering/components/workspace.css` (~386 lines) — AI mode toggle styles, actions pane styles, placeholder styles
- `src/app/keyword-clustering/components/CanvasPanel.tsx` (~884 lines) — Accepts canvas prop, multi-select, selection box, group drag, auto-pan
- `src/app/keyword-clustering/components/canvas-panel.css` — Added `.cvs-multi-label` style

**Files created this session:**
- `src/app/keyword-clustering/components/TVTTable.tsx` (~479 lines) — Topics View Table component
- `src/app/keyword-clustering/components/tvt-table.css` (~327 lines) — TVT light theme styles
- `src/app/keyword-clustering/components/KASTable.tsx` (~281 lines) — Keywords Analysis Table component
- `src/app/keyword-clustering/components/kas-table.css` (~172 lines) — KAS light theme styles

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

### KeywordWorkspace.tsx (~399 lines, main layout)
- Calls `useCanvas(projectId)` — single source of truth for canvas data
- Calls `useKeywords(projectId, userId)` — single source of truth for keywords
- Passes `canvas` prop (full useCanvas return) to CanvasPanel
- Passes `nodes`, `updateNodes`, `allKeywords` to TVTTable and KASTable
- **Manual mode:** 3-panel left (AST + MT + TIF) + Canvas right, panel visibility checkboxes, detach buttons, resizable dividers
- **AI mode:** AI Actions Pane (four-way toggle) + single table view + Canvas right
- AI table views: Normal→AST, Common→MT, Analysis→KAS, Topics→TVT
- State: tifKeywords, mtEntries (lifted), panel visibility, detached state, panel flex sizes, aiTableView

### CanvasPanel.tsx (~884 lines)
- Accepts `canvas: ReturnType<typeof useCanvas>` as prop (no internal useCanvas call)
- **Mindmap mode**: SVG-based canvas with pan, zoom, node drag, connectors
- **Table mode**: Renders CanvasTableMode component
- **Multi-select**: `selectedIds: Set<number>` replaces old `selectedId`
  - Shift+click toggles node in selection
  - Shift+drag on background draws selection box (blue dashed rectangle)
  - All selected nodes drag together as a group
  - Delete key removes all selected nodes
  - "N selected" label in toolbar when >1 selected
- **Auto-pan**: Viewport scrolls when mouse is within 40px of edge during node drag or selection box drag
- Uses `viewXRef`/`viewYRef`/`zoomRef` refs alongside state to avoid stale closures in drag/selection handlers
- Right-click opens context menu + edit panel
- Double-click renames inline
- Single-click selects only (no edit panel)
- `resolveOverlap()` runs BEFORE `updateNodes()` save

### TVTTable.tsx (~479 lines)
- Accepts `nodes`, `updateNodes`, `allKeywords` as props
- Light/white theme, depth-first tree walk ordering
- Single expand/collapse toggle button (cycles between states)
- 20px/level indentation, 7 depth-based title colors
- Primary keywords bold, secondary italic purple, volume badges
- Drag-and-drop reorder (before/after/child drop modes)
- Ancestry orange highlight chain on row hover
- Description popover on topic title hover (250ms)
- Depth filter dropdown (Show All + individual depth 0–6)
- Zoom ±1px (7–18 range)
- Deduplicated keyword count

### KASTable.tsx (~281 lines)
- Accepts `nodes`, `allKeywords` as props
- 9-column table: Keyword, Main Topic, Main Topic Title, Main Topic Description, Main Topic Location, Upstream Topic, UT Title, UT Description, UT Location
- Derived from canvas nodes — walks tree, builds reverse keyword→topic mapping, walks up hierarchy for each topic
- Alternating blue/green keyword group colors
- Group separators (thick border between keyword groups, dashed between topic blocks)
- Copy Table Data button (TSV to clipboard)
- Light theme matching TVT

### CanvasTableMode.tsx (~924 lines)
- 9-column funnel table: Depth, Topic, Alt Titles, Relationship, Parent, Conversion Path, Sister Nodes, Keywords, Description
- Edit Mode, Add Row, Delete Row, Reset Table
- TSV paste/upload with live preview, merge/overwrite dialog
- `xlsx` loaded via dynamic `await import('xlsx')`

### CanvasEditPanel.tsx
- Right-side drawer (320px) with title, description, alt titles, linked keywords
- Auto-saves on blur

### ASTTable.tsx (~1123 lines)
- Virtual scrolling, split topics view, drag-to-reorder
- All column features (volume, status, tags, topics, descriptions)
- Keyword drag to canvas via `text/kst-kwids` data type

### MTTable.tsx (~1310 lines), TIFTable.tsx (~849 lines)
- Main Terms and Terms In Focus tables with full feature sets
- MT entries state lifted to KeywordWorkspace

### State pattern (same across AST, MT, TIF)
```typescript
type SplitSelMap = Map<string, Set<string>>; // kwId → Set of topic strings
const [splitTopics, setSplitTopics] = useState(false);
const [splitTopicSel, setSplitTopicSel] = useState<SplitSelMap>(new Map());
const [splitDescSel, setSplitDescSel] = useState<SplitSelMap>(new Map());
```

### Batch propagation rules
- Edit topic pill with checkbox checked → rename/delete on all checked topics with same text
- Edit description with topic checkbox checked → propagate to all checked topics
- Toggle approval with topic checkbox checked → propagate to all checked topics

### Height sync
- AST/TIF: useEffect syncs `.ast-split-list` / `.tif-split-list` children heights within same `<tr>`
- MT: Two-level sync — Level 1 syncs `mt-kw-item` across columns, Level 2 syncs `mt-split-topic-item`

---

## 7. CANVAS IMPLEMENTATION DETAILS

### Node rendering
- SVG `<g>` groups with `transform={translate(x,y)}`
- Accent stripe (5px left bar) colored by pathwayId
- Title text, alt titles (smaller italic), description (foreignObject with line clamp)
- Badge showing keyword count + child count
- Resize grip in bottom-right corner
- Collapse toggle (▼/▶) when node has children

### Node interaction
- **Single-click**: Selects node (blue dashed outline), no edit panel
- **Shift+click**: Toggles node in multi-selection
- **Right-click**: Opens context menu AND edit panel on right side
- **Double-click**: Opens inline title rename input
- **Drag**: Move node(s); on release, resolveOverlap() auto-nudges if overlapping
- **Shift+drag background**: Draws selection box, selects all overlapping nodes

### Multi-select behavior
- `selectedIds: Set<number>` tracks all selected nodes
- Clicking a non-selected node (no shift) clears selection and selects only that node
- Clicking a selected node starts group drag of all selected nodes
- Shift+click toggles individual nodes in/out of selection
- Selection box adds to existing selection (does not clear first)
- Delete key deletes all selected nodes (reparents their children)
- Toolbar shows "N selected" when multiple nodes selected

### Auto-pan during drag
- When mouse is within 40px of viewport edge, canvas auto-scrolls
- Works for both node dragging and selection box drawing
- Uses `viewXRef`/`viewYRef`/`zoomRef` refs to avoid stale React closure values
- PAN_SPEED = 8 canvas units per mouse event

### Overlap resolution
- `resolveOverlap(nodeId)` checks all other nodes for overlap (with 20px gap)
- Uses smallest-nudge: compares distance to nudge right vs down, picks shorter
- Loops up to 100 times to resolve cascading overlaps
- Runs BEFORE save — fixes position locally, then one `updateNodes()` call saves final position

### Connectors
- Linear (P→P): Blue L-shaped elbow lines
- Nested (P→C): Orange L-shaped lines

### Canvas Table Mode — TSV Import/Export
- TSV export includes 11 columns including hidden X/Y position columns
- TSV import: auto-detects headers, flexibly maps columns, strips non-breaking spaces
- Import modes: Merge vs Overwrite
- `xlsx` loaded via dynamic `await import('xlsx')` to avoid SSR errors

---

## 8. KNOWN PATTERNS & GOTCHAS

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

---

## 9. MANDATORY SAFETY PROTOCOL

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

### Recovery commands (for the user)
- Restore a backup: `cp path/to/file.bak path/to/file`
- Undo last git commit (before push): `git reset --soft HEAD~1`
- Undo last git commit (after push): `git revert HEAD && git push`
- See recent changes: `git diff HEAD~1`
- See what files changed: `git log --oneline --name-only -3`

---

## 10. FILE LISTING

```
src/app/keyword-clustering/
├── page.tsx                    (~226 lines)

src/app/keyword-clustering/components/
├── ASTTable.tsx                (~1123 lines)
├── ast-table.css
├── MTTable.tsx                 (~1310 lines)
├── mt-table.css
├── TIFTable.tsx                (~849 lines)
├── tif-table.css
├── CanvasPanel.tsx             (~884 lines)
├── canvas-panel.css
├── CanvasEditPanel.tsx
├── canvas-edit-panel.css
├── CanvasTableMode.tsx         (~924 lines)
├── canvas-table-mode.css       (~566 lines)
├── TVTTable.tsx                (~479 lines)
├── tvt-table.css               (~327 lines)
├── KASTable.tsx                (~281 lines)
├── kas-table.css               (~172 lines)
├── KeywordWorkspace.tsx        (~399 lines)
├── workspace.css               (~386 lines)
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
