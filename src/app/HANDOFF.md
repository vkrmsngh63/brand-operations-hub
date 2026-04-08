# Brand Operations Hub — Developer Handoff
## Complete Documentation for Chat Continuation

---

## 0. SESSION SUMMARY (Latest)

**Completed this session:**
- Phase 1b-split: Split Topics View for AST, MT, TIF
- Phase 1-ui: Resizable dividers, panel visibility checkboxes, scroll arrows
- Phase 1-detach: Detachable floating window overlays for all panels
- Database: Added `canvasLoc` (Json) and `topicApproved` (Json) fields to Keyword model
- API: PATCH route updated to handle canvasLoc and topicApproved

**Key architectural decisions:**
- Split view disables virtual scrolling in AST (uses larger row height estimate instead)
- Height sync between Topics and Descriptions columns uses useEffect with requestAnimationFrame
- MT split view nests topic sub-sub-rows inside keyword sub-rows in vertical view
- MT height sync runs on dependency array `[splitTopics, astKeywords, showTopics, showTopicDesc, visible, viewMode]`
- Detach overlays render same component instances with same props (state stays synced via parent)
- ScrollArrows component auto-detects scrollable descendant by class name pattern `*-frame`
- Divider component uses incremental delta tracking (not absolute position)

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

### Other models: CanvasNode, Pathway, SisterLink, CanvasState, Project (unchanged)

---

## 3. API ROUTES

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/projects/[projectId]/keywords` | GET | List all keywords |
| `/api/projects/[projectId]/keywords` | POST | Create single or bulk `{ keywords: [...] }` |
| `/api/projects/[projectId]/keywords` | DELETE | Bulk delete `{ ids: [...] }` |
| `/api/projects/[projectId]/keywords/[keywordId]` | PATCH | Update keyword (supports: keyword, volume, sortingStatus, tags, topic, sortOrder, canvasLoc, topicApproved) |
| `/api/projects/[projectId]/keywords/[keywordId]` | DELETE | Delete single keyword |

---

## 4. COMPONENT ARCHITECTURE

### KeywordWorkspace.tsx (main layout)
- Imports: ASTTable, MTTable, TIFTable, ScrollArrows, FloatingPanel
- State: tifKeywords, tifActive, panel visibility (showAST/MT/TIF/Canvas), detached state, panel flex sizes, left/right split fraction
- Renders: topbar with panel checkboxes → main area with left panel (stacked tables with dividers) + vertical divider + canvas placeholder
- Each panel wrapped in ScrollArrows, has ⊞ detach button overlay
- Detached panels render in FloatingPanel overlays with same props

### ASTTable.tsx (~1123 lines)
- Virtual scrolling with splitRowH adjustment for split mode
- Split Topics View: SplitTopicCell, SplitDescCell components
- Split selection state: splitTopicSel, splitDescSel (Map<string, Set<string>>)
- Height sync useEffect between topic and description sub-rows
- Batch propagation via split checkboxes

### MTTable.tsx (~1310 lines)
- Three view modes: comma (0), vertical (1), single-line (2)
- Split Topics View nested inside vertical view keyword sub-rows
- MtSplitTopicPills, MtSplitDescPills components
- mtSplitHighlight() helper for per-topic cross-highlighting between Topics and Descriptions columns
- Invisible spacer in MtSplitDescPills to match "⊕ add" row in Topics
- Height sync: two-level (keyword items across columns + topic sub-items within keyword)
- Null guard on colWidths resize to prevent crash

### TIFTable.tsx (~630 lines)
- Split Topics View: TifSplitTopicCell, TifSplitDescCell components
- Same split selection pattern as AST
- Height sync useEffect for topic/description sub-rows

### ScrollArrows.tsx
- Wraps panel content, finds descendant with class `*-frame`
- Shows ◀ ▶ buttons when horizontal overflow detected
- Uses ResizeObserver + MutationObserver + scroll event

### FloatingPanel.tsx
- Fixed-position overlay with backdrop blur
- Draggable by header, resizable from all 8 edges/corners
- Escape key or ✕ button to close

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

---

## 6. SPLIT TOPICS VIEW — IMPLEMENTATION DETAILS

### State pattern (same across AST, MT, TIF)
```typescript
type SplitSelMap = Map<string, Set<string>>; // kwId → Set of topic strings
const [splitTopics, setSplitTopics] = useState(false);
const [splitTopicSel, setSplitTopicSel] = useState<SplitSelMap>(new Map());
const [splitDescSel, setSplitDescSel] = useState<SplitSelMap>(new Map());
```

### Helper functions
- `splitIsChecked(map, kwId, topic)` → boolean
- `splitSetChecked(map, kwId, topic, val)` → new SplitSelMap
- `splitAllChecked(map)` → array of { kwId, topic }

### Batch propagation rules
- Edit topic pill with checkbox checked → rename/delete on all checked topics with same text
- Edit description with topic checkbox checked → propagate to all checked topics
- Edit description with desc checkbox checked → propagate to all checked descs with same original value
- Toggle approval with topic checkbox checked → propagate to all checked topics

### Height sync
- AST/TIF: useEffect syncs `.ast-split-list` / `.tif-split-list` children heights within same `<tr>`
- MT: Two-level sync — Level 1 syncs `mt-kw-item` across columns, Level 2 syncs `mt-split-topic-item` between Topics and Descriptions wraps

---

## 7. KNOWN PATTERNS & GOTCHAS

- `canvasLoc` and `topicApproved` are JSON objects on the Keyword record. Always spread-copy before mutation: `const cl = { ...(kw.canvasLoc || {}) }`
- Topic delimiter is pipe `|` not comma: `"Topic A | Topic B"`
- Tag delimiter is comma: `"tag1, tag2"`
- AST virtual scrolling uses `splitRowH = splitTopics ? 80 : ROW_HEIGHT` for row height estimation
- MT resize handler has null guard: `if (!resizeRef.current) return prev`
- MT height sync deps: `[splitTopics, astKeywords, showTopics, showTopicDesc, visible, viewMode]`
- Divider drag uses incremental deltas (not absolute position tracking)

---

## 8. FILE LISTING

```
src/app/keyword-clustering/components/
├── ASTTable.tsx           (~1123 lines)
├── ast-table.css
├── MTTable.tsx            (~1310 lines)
├── mt-table.css
├── TIFTable.tsx           (~630 lines)
├── tif-table.css
├── KeywordWorkspace.tsx   (~260 lines)
├── workspace.css
├── ScrollArrows.tsx
├── scroll-arrows.css
├── FloatingPanel.tsx
├── floating-panel.css
├── ASTTable.tsx.bak       (backup)
├── MTTable.tsx.bak        (backup)
├── TIFTable.tsx.bak       (backup)
├── KeywordWorkspace.tsx.bak (backup)

src/hooks/
├── useKeywords.ts         (Keyword type includes canvasLoc, topicApproved)

src/app/api/projects/[projectId]/keywords/
├── route.ts               (GET, POST, DELETE)
├── [keywordId]/route.ts   (PATCH supports canvasLoc, topicApproved; DELETE)

prisma/
├── schema.prisma          (Keyword has canvasLoc Json, topicApproved Json)
```
