# Brand Operations Hub — Developer Handoff
## Complete Documentation for Chat Continuation

---

## 0. SESSION SUMMARY (Latest)

**Completed this session:**
- Phase 1d-core: Canvas panel with nodes, pan, zoom, drag, add/delete/rename
- Phase 1d-connect: P→C and P→P link modes, detach node, expanded context menu
- Phase 1d-edit: Edit panel drawer (title, description, alt titles, keyword list, hover popover)
- Phase 1d-link: Drag keywords from AST/TIF onto canvas nodes to link them
- Phase 1d-polish: Node resize (drag grip handle), collapse/expand child nodes
- Phase 1e-table: Canvas Table Mode with 9-column funnel view, mode toggle, TSV copy
- Bug fixes: MT detach data loss (lifted entries state), AST zoom (CSS zoom), canvas CSS restoration
- Safety protocol added to HANDOFF.md

**Key architectural decisions:**
- Canvas uses SVG (not HTML5 Canvas) for node rendering — enables React event handling per node
- Edit panel is a sibling flex child alongside the SVG canvas area, not an overlay
- CanvasPanel accepts `allKeywords` prop from KeywordWorkspace to show keyword data in edit panel
- MT entries state lifted to KeywordWorkspace (same pattern as TIF) to survive detach/reattach
- AST zoom uses CSS `zoom` property instead of `fontSize` (hardcoded px in CSS overrode fontSize)
- Keyword drag-to-canvas uses HTML5 drag/drop with `text/kst-kwids` data transfer type
- Canvas Table Mode is a separate `CanvasTableMode` component rendered conditionally via `canvasMode` state
- Collapse state is local to CanvasPanel (not persisted to DB yet)

**Files created this session:**
- `src/hooks/useCanvas.ts` — Canvas data hook (fetch, add, update, delete nodes; update canvas state)
- `src/app/keyword-clustering/components/CanvasPanel.tsx` (~644 lines) — Main canvas component
- `src/app/keyword-clustering/components/canvas-panel.css` — Canvas styles
- `src/app/keyword-clustering/components/CanvasEditPanel.tsx` — Edit panel drawer
- `src/app/keyword-clustering/components/canvas-edit-panel.css` — Edit panel styles
- `src/app/keyword-clustering/components/CanvasTableMode.tsx` (~241 lines) — Table mode view
- `src/app/keyword-clustering/components/canvas-table-mode.css` — Table mode styles

**Files modified this session:**
- `src/app/keyword-clustering/components/KeywordWorkspace.tsx` — Added CanvasPanel import, MT entries lift, allKeywords prop
- `src/app/keyword-clustering/components/ASTTable.tsx` — Added kst-kwids to drag data, CSS zoom fix
- `src/app/keyword-clustering/components/TIFTable.tsx` — Added kst-kwids to drag data
- `src/app/keyword-clustering/components/MTTable.tsx` — Exported MTEntry type, lifted entries state to props
- `src/app/api/projects/[projectId]/canvas/nodes/route.ts` — Added DELETE handler

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

### KeywordWorkspace.tsx (main layout)
- Imports: ASTTable, MTTable, TIFTable, CanvasPanel, ScrollArrows, FloatingPanel
- State: tifKeywords, tifActive, mtEntries (lifted), panel visibility, detached state, panel flex sizes
- Passes `allKeywords={keywords}` to CanvasPanel
- Passes `entries={mtEntries}` and `onSetEntries={setMtEntries}` to MTTable

### CanvasPanel.tsx (~644 lines)
- **Mindmap mode**: SVG-based canvas with pan, zoom, node drag, connectors
- **Table mode**: Renders CanvasTableMode component
- `canvasMode` state toggles between "mindmap" and "table"
- Link mode (P→C, P→P) with visual feedback and toast messages
- Edit panel (CanvasEditPanel) slides in from right on node click
- Node resize via grip handle in bottom-right corner
- Collapse/expand child nodes via ▼/▶ toggle
- Hover popover shows full description
- Drop handler accepts `text/kst-kwids` drag data from AST/TIF tables
- Uses `useCanvas` hook for all data operations

### CanvasEditPanel.tsx
- Right-side drawer (320px) with title, description, alt titles, linked keywords
- Auto-saves on blur (title, description, alt titles)
- Keyword list shows placement (p/s) toggle, volume, remove button
- Close on Escape or ✕ button

### CanvasTableMode.tsx (~241 lines)
- 9-column funnel table: Depth, Topic (indented), Alt Titles, Relationship, Parent Topic, Conversion Path, Sister Nodes, Keywords, Description
- Depth-first tree walk ordering (linear children before nested)
- TSV copy button
- Row click opens edit panel
- Depth-based colors matching original tool

### ASTTable.tsx (~1123 lines)
- Virtual scrolling, split topics view, drag-to-reorder
- Drag handler includes `text/kst-kwids` data for canvas drop
- CSS zoom for font scaling (not fontSize)

### MTTable.tsx
- Entries state lifted to KeywordWorkspace via `entries`/`onSetEntries` props
- Exported `MTEntry` interface

### TIFTable.tsx
- Drag handler includes `text/kst-kwids` data for canvas drop

### useCanvas.ts
- `fetchCanvas()` — loads nodes + canvas state + pathways + sister links
- `addNode()` — POST with auto-increment ID
- `updateNodes()` — PATCH bulk update
- `deleteNode()` — DELETE with optimistic local removal
- `updateCanvasState()` — PATCH viewport/zoom

---

## 5. CSS FILES

| File | Purpose |
|------|---------|
| `ast-table.css` | AST panel, table, pills, tags, split view, column resize |
| `mt-table.css` | MT panel, vertical view, split topic/desc, tag operations |
| `tif-table.css` | TIF panel, split topic/desc, toggle switch |
| `workspace.css` | Topbar, dividers, panel layout, detach button styling |
| `scroll-arrows.css` | Scroll arrow overlay buttons |
| `floating-panel.css` | Floating panel overlay, resize handles |
| `canvas-panel.css` | Canvas SVG, action bar, nodes, connectors, link mode, popover, toast |
| `canvas-edit-panel.css` | Edit panel drawer, fields, keyword list, alt titles |
| `canvas-table-mode.css` | Table mode, 9-column layout, badges, keyword pills |

---

## 6. SPLIT TOPICS VIEW — IMPLEMENTATION DETAILS

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

### Connectors
- Linear (P→P): Blue L-shaped elbow lines, parent bottom-left → gutter → child top-left
- Nested (P→C): Orange L-shaped lines, parent bottom-center → elbow → child left-center
- Arrow dot at connection point

### Keyword drag-to-canvas
- AST/TIF set `e.dataTransfer.setData('text/kst-kwids', JSON.stringify(kwIds))` on drag start
- `effectAllowed = 'copyMove'` on drag source
- Canvas SVG and canvas-area div both have `onDragOver` and `onDrop` handlers
- Drop handler hit-tests nodes by position, adds keyword IDs to `linkedKwIds`

### Canvas Table Mode
- Tree walk: roots sorted by pathwayId then Y, children sorted by Y, linear before nested
- Conversion Path = title of root node in the same pathway
- Keywords show `[p]`/`[s]` placement annotations

---

## 8. KNOWN PATTERNS & GOTCHAS

- `canvasLoc` and `topicApproved` are JSON objects on Keyword. Always spread-copy: `const cl = { ...(kw.canvasLoc || {}) }`
- Topic delimiter is pipe `|` not comma: `"Topic A | Topic B"`
- Tag delimiter is comma: `"tag1, tag2"`
- AST virtual scrolling uses `splitRowH = splitTopics ? 80 : ROW_HEIGHT`
- AST zoom uses CSS `zoom` property (not `fontSize`) because hardcoded px in CSS overrode inline fontSize
- MT entries state is lifted to KeywordWorkspace to survive detach/reattach cycles
- MT resize handler has null guard: `if (!resizeRef.current) return prev`
- Divider drag uses incremental deltas (not absolute position tracking)
- Canvas collapse state is local (not persisted to DB yet)
- `linkedKwIds` is stored as Json in DB but typed as `string[]` in TypeScript — always cast appropriately

---

## 9. MANDATORY SAFETY PROTOCOL

### Rules for Claude (every chat must follow these)

**RULE 1 — BACKUP BEFORE REPLACE**
Before replacing ANY existing file, always run a backup first:
```bash
cp path/to/file path/to/file.bak
```

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

### Recovery commands (for the user)
- Restore a backup: `cp path/to/file.bak path/to/file`
- Undo last git commit (before push): `git reset --soft HEAD~1`
- Undo last git commit (after push): `git revert HEAD && git push`
- See recent changes: `git diff HEAD~1`
- See what files changed: `git log --oneline --name-only -3`

---

## 10. FILE LISTING

```
src/app/keyword-clustering/components/
├── ASTTable.tsx              (~1123 lines)
├── ast-table.css
├── MTTable.tsx               (~1310 lines)
├── mt-table.css
├── TIFTable.tsx              (~849 lines)
├── tif-table.css
├── CanvasPanel.tsx           (~644 lines)
├── canvas-panel.css
├── CanvasEditPanel.tsx
├── canvas-edit-panel.css
├── CanvasTableMode.tsx       (~241 lines)
├── canvas-table-mode.css
├── KeywordWorkspace.tsx      (~260 lines)
├── workspace.css
├── ScrollArrows.tsx
├── scroll-arrows.css
├── FloatingPanel.tsx
├── floating-panel.css
├── *.bak, *.bak2, *.bak3... (backups)

src/hooks/
├── useKeywords.ts
├── useCanvas.ts

src/app/api/projects/[projectId]/
├── keywords/route.ts         (GET, POST, DELETE)
├── keywords/[keywordId]/route.ts (PATCH, DELETE)
├── canvas/route.ts           (GET, PATCH canvas state)
├── canvas/nodes/route.ts     (GET, POST, PATCH, DELETE)
├── canvas/pathways/route.ts  (POST, DELETE)
├── canvas/sister-links/route.ts (POST, DELETE)

prisma/
├── schema.prisma
```
