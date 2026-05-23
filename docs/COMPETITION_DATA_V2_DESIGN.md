# COMPETITION DATA V2 — DESIGN DOC (Workflow #2 polish P-46)

**Polish item:** P-46 — W#2 Phase 2 Competition Data redesign + Comprehensive Competitor Analysis page + ~12 new table columns + Reviews capture surface + URL detail page restructure + vklf.com-side upload/edit/delete affordances + extension URL save form additions.
**Parent workflow:** W#2 Competition Scraping & Deep Analysis (🔍)
**Status:** 🟢 Design phase — initial interview FROZEN 2026-05-23 (this doc). Implementation begins next session with Workstream 1 (Schema).
**Branch (design):** `workflow-2-competition-scraping`
**Created:** 2026-05-23
**Created in session:** `session_2026-05-23_p46-w2-phase-2-design-session` (Claude Code; on `workflow-2-competition-scraping`)
**Pre-graduation gating:** YES — P-46 is the major Phase 2 expansion of W#2 announced via director's 2026-05-22-c scope-drop directive. W#2 graduation arrives after P-46 + P-47 + P-26 all ship.

**Doc type:** Group B (workflow-specific). Loaded whenever a session works on any P-46 workstream.

**Doc location rationale:** P-46 is a large multi-workstream scope-drop. A dedicated top-level doc parallels `CAPTURED_VIDEOS_DESIGN.md` for P-27 / P-45 and keeps `COMPETITION_SCRAPING_DESIGN.md` (3,100+ lines already) from absorbing another large §B-style append history. Future P-46 build sessions read this file directly without grepping into prior W#2 history.

**Related docs:**

- `HANDOFF_PROTOCOL.md` Rule 18 — Interview-cluster + append-only DESIGN doc structure methodology (this doc is its deliverable for P-46).
- `HANDOFF_PROTOCOL.md` Rule 14f — Forced-picker pattern (used 9 times this session; one default-skip per Default-to-recommendation exception).
- `HANDOFF_PROTOCOL.md` Rule 21 + Rule 22 — Pre-design directive scan + Graduated-Tool Re-Entry (executed at session start).
- `HANDOFF_PROTOCOL.md` Rule 23 — Change Impact Audit (this design touches schema + many web surfaces + extension; audit executed during the per-question pickers).
- `HANDOFF_PROTOCOL.md` Rule 24 — Pre-capture search (executed when P-46 entry was first captured 2026-05-22-c).
- `HANDOFF_PROTOCOL.md` Rule 27 — Playwright forced-picker for verification (will fire per-workstream implementation session as needed).
- `HANDOFF_PROTOCOL.md` Rule 30 — Session bookends (this session ran the start + end plain-terms summaries).
- `ROADMAP.md` P-46 polish-backlog entry (line 209) — the original capture + 10 clarification questions answered here.
- `ROADMAP.md` P-45 polish-backlog entry — closed 2026-05-22-i; introduced screen-recording + the 80-event band-aid that P-47 will replace.
- `ROADMAP.md` P-47 polish-backlog entry — NEW 2026-05-22-i; sequencing-wise sits AFTER P-46's design lands.
- `CAPTURED_VIDEOS_DESIGN.md` — the §A frozen interview shape this doc mirrors.
- `COMPETITION_SCRAPING_DESIGN.md` §A — the prior W#2 Phase 1 frozen design this Phase 2 redesign builds on.
- `COMPETITION_SCRAPING_DESIGN.md` §B — append-only refinements log precedent.
- `prisma/schema.prisma` — the live schema P-46 Workstream 1 extends (CompetitorUrl + new models).
- `src/lib/shared-types/competition-scraping.ts` — wire types for new fields and models.

**Structure (per HANDOFF_PROTOCOL Rule 18):**

- **§A — Initial design-session interview answers.** Frozen at end-of-session (this session). Authoritative initial spec for P-46 v1.
- **§B — In-flight refinements (append-only).** Empty at end of interview. Future P-46 build sessions append entries here, never edit prior ones or §A.
- **§C — Per-workstream implementation outlines.** Five subsections (one per workstream) with file-level scope, session estimates, and cross-references back to §A decisions. Workstreams 1-5 in the locked order.

---

## §A — Initial design-session interview answers (FROZEN 2026-05-23)

### A.0 Interview meta

- **Interview format:** 10 questions captured in the P-46 ROADMAP entry (verbatim from director's 2026-05-22-c scope-drop). Walked in 4 clusters of 3-3-3-2 per Rule 18, with read-back between clusters. Each question fired a Rule 14f forced-picker EXCEPT Q8 which was skipped per Default-to-recommendation (permission-on-default-approved-path: confirming the Status-column = Scraping-Status mirror).
- **Pre-design directive scan (Rule 21):** the launch prompt (NEXT_SESSION.md written 2026-05-22-i) carried 1 binding constraint — P-46 must be PURE DESIGN with zero code, zero deploys, zero Rule 9 gates. ROADMAP P-46 entry + `feedback_default_to_recommendation.md` + `feedback_recommendation_style.md` carried into the cluster-walkthrough.
- **Sister-workflow state at interview time:** W#1 (Keyword Clustering) on `main`, no schema-change-in-flight; W#2 on `workflow-2-competition-scraping`, schema-change-in-flight = No this entire session (design-only).
- **Forced-picker outcomes captured this session:** 10 decisions locked (8 via picker + 1 default-skip + 1 dropped via "other" + 1 follow-up). See §A.1-§A.10.
- **Director's standing pickup at session-start:** picked P-46 over P-47 / P-26 / P-27 leftovers at the §4 Step 1c forced-picker per `feedback_default_to_recommendation.md`. Recommended path per the long-standing roadmap commitment.

---

### A.1 Q1 — Reviews capture extraction shape (DEFERRED per-platform; v1 follow-up)

**Director's pick:** "Each platform will have different ways of capturing reviews and we will discuss those methods of capture later."

**Locked decision:** The per-platform Reviews-extraction mechanism (auto-extract vs. user-typed vs. hybrid; what DOM selectors per platform) is **DEFERRED to future per-platform polish sessions** that follow P-46 graduation. Each platform (amazon / ebay / etsy / walmart / etc.) gets its own design session for the extension-side capture gesture; that's a future scope cluster, not P-46.

**Alternatives considered:**
- (A) Auto-extract everything; user can edit before save (recommended at picker time).
- (B) User-entered for v1; add auto-extract per-platform as polish.
- (C) Hybrid — auto-extract star rating + body only.
- Director's "Other" answer dropped through to the deferral path.

**Reasoning (director-supplied):** Per-platform DOM is genuinely different (Amazon collapses reviews into a "More reviews" expander; Ebay has feedback-not-product-review distinction; Etsy has favorite-shop-review separate from item review). Locking a single extraction shape across platforms today would constrain future per-platform tuning unnecessarily.

**Impact on v1:** see §A.1b (the follow-up picker fired this session).

---

### A.1b Q1-follow-up — v1 Reviews surface scope

**Director's pick:** "Schema + URL-detail-page view + vklf.com-side manual entry form (recommended)."

**Locked decision:** v1 Reviews surface ships across three workstreams:
- **Workstream 1 (Schema):** Adds the `CapturedReview` Prisma model (parallel to CapturedText / CapturedImage / CapturedVideo). Fields: `id` / `clientId` (unique) / `competitorUrlId` (FK) / `starRating Int` / `body Text` / `reviewerName String?` / `reviewDate DateTime?` / `tags Json @default("[]")` / `analysis Text?` (per-item Analysis text per A.4) / `source String @default("manual")` / `addedBy String` / `addedAt DateTime` / `updatedAt DateTime`. Indexed by `competitorUrlId`.
- **Workstream 2 (URL detail page):** Adds the "Captured Reviews" box to the URL detail page. Box lists reviews with star-rating multi-select filter + per-row edit + per-row delete. Includes a per-item "Review Analysis" text box (mirrors per-item Analysis pattern used for text / image / video).
- **Workstream 5 (Extension):** vklf.com-side manual "Add Captured Review" form on the URL detail page — you click "Add Review," type the star rating + reviewer + body + date + body, save. **NO extension-side right-click gesture in v1.**

**Deferred to per-platform polish sessions after P-46:** extension-side right-click Captured Review gesture per platform.

**Reasoning:** Director's deferral on Q1 implies the per-platform DOM work isn't ready to commit to in P-46; meanwhile the data shape + UI surface ARE ready. Shipping schema + view + vklf.com-side entry lets the Captured Reviews surface exist on Day 1 of Workstream 2; the extension gesture comes later when per-platform DOM design lands.

**Impact on §A elsewhere:** Workstream 5 scope contracts vs. the original P-46 entry (no extension Reviews gesture in v1). The Comprehensive Analysis page (A.4) can hyperlink to reviews even though they're only entered manually in v1.

---

### A.2 Q2 — Inline cell editing pattern

**Director's pick:** "Click-to-edit on every cell (recommended)."

**Locked decision:** Every editable cell in the Competition Data table is read-only-looking until clicked. Clicking turns the cell into its appropriate inline editor (text input for strings; number input for `competitionScore` / numeric fields; dropdown for enum fields; toggle for booleans). Tab or Enter saves; Escape cancels. Saves happen one cell at a time (debounced ~500 ms after the field loses focus or Tab fires).

**Alternatives considered:**
- (B) Per-row Edit button toggling row into edit-mode — rejected for higher per-edit motion cost.
- (C) Hybrid (click-to-edit for simple, row-edit for complex) — rejected for split mental model.

**Reasoning:** Spreadsheet feel; fastest per-edit motion (one click + type + Tab). The table is the daily surface the director lives in; minimizing per-edit friction matters more than transactional row-save semantics.

**Implementation implications:**
- Each column needs an inline-editor renderer registered alongside the read-only renderer.
- ~10 distinct editor patterns to maintain: text / textarea / integer / decimal / enum (e.g., `scrapingStatus`) / boolean / date / tags-array / money-decimal / URL.
- Editor open / save / cancel state lives in component-local state inside the table; saves emit to the same per-field PATCH endpoints we use elsewhere.
- Optimistic update on save success; rollback + inline error message if PATCH 4xx/5xx.

---

### A.3 Q3 — Per-user UI preferences storage

**Director's pick:** "Server-side per-user (cross-device sync) (recommended)."

**Locked decision:** New `UserTablePreferences` Prisma model stores per-user-per-project UI preferences for the Competition Data table. Cross-device sync — switching between laptop and a second machine preserves your column setup.

**Schema (Workstream 1 ships):**
```prisma
model UserTablePreferences {
  id                    String   @id @default(uuid())
  userId                String
  projectId             String
  columnVisibility      Json     @default("{}")    // { columnId: boolean }
  columnWidths          Json     @default("{}")    // { columnId: pixels }
  fontSize              Int      @default(14)      // 10-24 range
  rowOrder              Json     @default("[]")    // [competitorUrlId] in user's preferred order
  lastUsedSortColumn    String?
  lastUsedSortDirection String?                    // "asc" | "desc"
  updatedAt             DateTime @updatedAt

  @@unique([userId, projectId])
  @@index([userId])
}
```

**Alternatives considered:**
- (B) Browser-local storage — rejected because director already works across multiple machines.
- (C) Hybrid (shape cross-device, size local-only) — rejected for split mental model.

**Reasoning:** Director's actual cross-device usage pattern. Pattern matches existing `UserExtensionState` + `UserProjectHighlightTerm` precedents (both ship server-side per-user-per-project).

**Implementation implications:**
- New REST endpoint: `GET/PUT /api/users/[userId]/table-preferences/[projectId]`.
- Debounce writes to ~500 ms after last change to avoid hammering server on column-resize drag.
- Client reads preferences once at page mount; mutations update local state + fire PUT async.

---

### A.4 Q4 — Comprehensive Competitor Analysis page scope

**Director's pick:** "One per Project (recommended)."

**Locked decision:** A single rich-text "Comprehensive Competitor Analysis" page per Project. Synthesizes across ALL competitors + ALL platforms in this Project. Hyperlinks anywhere in the text can jump to specific competitor URL detail pages (e.g., `[Top Amazon competitor](#url/abc-123)` resolves to the same-tab navigation).

**Schema (Workstream 1 ships):**
```prisma
model ComprehensiveCompetitorAnalysis {
  id            String   @id @default(uuid())
  projectId     String   @unique          // one per Project
  contentJson   Json     @default("{}")   // TipTap document JSON
  lastEditedBy  String
  lastEditedAt  DateTime @updatedAt
  createdAt     DateTime @default(now())

  @@index([projectId])
}
```

**Alternatives considered:**
- (B) One per Platform within Project — rejected; cross-platform synthesis is what makes the analysis valuable.
- (C) Freeform multiple per Project — rejected for "which doc is THE doc" ambiguity that hurts downstream consumers (W#3 / W#5 / W#6).

**Reasoning:** Director's mental model is "my holistic competitive intelligence for THIS product launch." One page matches that.

**Implementation implications:**
- New page route: `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/page.tsx`.
- "Comprehensive Competitor Analysis" tab at the top of the Competition Data page (Workstream 3) links here.
- Page has edit-mode toggle (read by default; click "Edit" to enter edit mode) + "Competition Data" back-button at the top.
- Hyperlinks to URL detail pages use the existing `/projects/[projectId]/competition-scraping/url/[urlId]` route.

---

### A.5 Q5 — Rich-text editor library

**Director's pick:** "TipTap (recommended)."

**Locked decision:** TipTap powers the Comprehensive Analysis page + per-item Analysis text boxes (on Captured Text, Image, Video, Review under each URL detail page) + per-category Overall Analysis boxes + URL-box Overall Competitor Analysis text box. One editor library across all rich-text surfaces.

**Alternatives considered:**
- Lexical — modern + performant + smaller bundle, but smaller ecosystem.
- Slate.js — flexible but more boilerplate.
- Quill — battle-tested but less customizable + community React wrapper.

**Reasoning:** TipTap's React integration + extension ecosystem + documentation quality is the best fit for a multi-surface rollout. Bundle cost (~80-120 KB gzipped) acceptable given the daily-use value.

**Implementation implications:**
- Add `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link` to `package.json`.
- Per-surface editor configs: Comprehensive Analysis page = full toolbar (headings + lists + bold/italic/underline + hyperlinks + code blocks); per-item Analysis text boxes = minimal toolbar (bold/italic + lists + hyperlinks).
- Persistence: store the TipTap document JSON (`contentJson`) — never plain text. Serialize JSON-to-HTML at render time using TipTap's `generateHTML` for non-editor read views (e.g., the Comprehensive Analysis page's read-mode).
- Hyperlinks to internal URL detail pages use a custom TipTap extension that recognizes `#url/<urlId>` shorthand or full path; resolves to `<a href="/projects/.../url/<urlId>">`.

---

### A.6 Q6 — Sizes / Options box deletion

**Director's pick:** "Hide UI but keep data (recommended)."

**Locked decision:** The "Sizes / Options" section is removed from the URL detail page's UI in Workstream 2. The underlying `CompetitorSize` Prisma table + relation from `CompetitorUrl` stay in the schema. No destructive migration; no Rule 9 gate; reversible.

**Alternatives considered:**
- (B) Delete data + drop table — rejected for irreversibility.
- (C) Hide UI + per-row resurrect affordance — rejected for permanent UI complexity for an edge case.

**Reasoning:** Lowest risk; any future need can re-surface the section by simply re-rendering it. If a year passes and the section is still hidden, P-46 + N can do the destructive cleanup then.

**Implementation implications:**
- Workstream 2 removes the `SizesSubsection` render from `UrlDetailContent.tsx` (line 729-773 today).
- The fetch query for sizes data can stay or be removed from the page-data fetch — design preference is to REMOVE the fetch (don't pay the network cost) but keep the schema + API endpoint intact (so re-surfacing is just an Edit, not a re-build).

---

### A.7 Q7 — Competition Score input shape

**Director's pick:** "Number input only (recommended)."

**Locked decision:** The new `competitionScore Int? @check(min=1, max=100)` field on `CompetitorUrl` is edited via a plain `<input type="number" min={1} max={100}>` cell editor in the table + a matching number input on the URL detail page form. No slider in v1.

**Alternatives considered:**
- (B) Slider only — rejected for slow precise-value entry.
- (C) Both slider + number — rejected for table-cell space cost.

**Reasoning:** Fastest data entry; matches the existing W#2 form patterns; composes cleanly with click-to-edit (A.2).

**Implementation implications:**
- Schema: `competitionScore Int?` on `CompetitorUrl` (nullable; not all URLs need a score).
- Client validation: 1-100 range; reject input outside via inline error message.
- Server validation: identical bounds check in the PATCH endpoint.

---

### A.8 Q8 — Status column ↔ Scraping Status mirror (default-locked)

**Director's pick:** Skipped via Rule 14f Default-to-recommendation exception; the P-46 entry said "assumed yes — confirm."

**Locked decision:** The Competition Data table's "Status" column shows the same `scrapingStatus` value (INCOMPLETE | COMPLETE) as the URL detail page's "Scraping Status" toggle. Bidirectional mirror — flipping in one place updates the other on next render. Both reads + writes go through the same `CompetitorUrl.scrapingStatus` enum field.

**Reasoning:** This was the P-46 entry's default; the director's standing "yes proceed" preference applies. No UI ambiguity worth re-litigating.

**Implementation implications:**
- Schema: `scrapingStatus` enum on `CompetitorUrl` (default `INCOMPLETE`). Migration adds the enum + new column.
- Table cell renders the current value + a single-click toggle (per A.2 click-to-edit; enum cells dropdown to the two values).
- URL detail page Scraping Status toggle uses the same PATCH endpoint.

---

### A.9 Q9 — Select preview thumbnail button (DROPPED from P-46)

**Director's pick:** "Ignore this feature. We don't need to add it anymore."

**Locked decision:** The "Select preview thumbnail" button is REMOVED from P-46 scope entirely. Automatic thumbnail capture (existing canvas frame-grab for direct-bytes + platform poster image for embeds) stays as-is. No manual rectangle-draw thumbnail picker; no P-17 region-overlay reuse for this purpose in v1.

**Reasoning (director-supplied):** Director judged the auto-capture good enough in practice; the rescue path isn't worth the implementation cost.

**Implementation implications:**
- Workstream 5 contracts: no thumbnail-picker UI; no overlay infrastructure addition.
- If a future case surfaces where auto-thumbnail is consistently bad (e.g., a platform that returns black frames), capture as a future polish item then.

---

### A.10 Q10 — Workstream sequencing

**Director's pick:** "Schema → URL detail page → Competition Data table → Comprehensive Analysis page → Extension + Reviews (recommended)."

**Locked decision:** P-46 ships in this order:

1. **Workstream 1 — Schema** (non-negotiable first; nothing else lands without it).
2. **Workstream 2 — URL detail page redesign.**
3. **Workstream 3 — Competition Data table redesign.**
4. **Workstream 4 — Comprehensive Analysis page.**
5. **Workstream 5 — Extension URL save form additions + vklf.com-side manual Reviews entry form.**

**Alternatives considered:** Table-first / Extension-first / Comprehensive-first — all rejected for "what's visibly improving daily" + dependency reasons.

**Reasoning:** URL detail page is the densest user-visible improvement (12 new fields, Reviews box, per-item Analysis boxes). Shipping it second means the daily-felt redesign lands fast. Table comes next once the data shape is settled. Comprehensive Analysis is a new surface; ships once schema is locked. Extension lands last so its changes are tested against stable web surfaces.

**Implementation implications:**
- Session-count estimates (revised down from the P-46 entry's original 15-25 figure given Q1 + Q9 scope reductions):
  - Workstream 1: ~2-3 sessions (schema + migration + Prisma client regen + Rule 9 gate at first session).
  - Workstream 2: ~3-5 sessions (URL detail page is the densest surface).
  - Workstream 3: ~3-4 sessions (table redesign with click-to-edit + drag-reorder + column controls + persistence).
  - Workstream 4: ~2-3 sessions (Comprehensive Analysis page + TipTap integration).
  - Workstream 5: ~1-2 sessions (extension URL save form + vklf.com Reviews entry form).
- **Total: ~11-17 sessions** vs. original P-46 entry's 15-25 estimate.

---

### A.11 Schema additions (consolidated)

The P-46 ROADMAP entry's schema-additions list had drift on three fields (`resultsPageRank` / `numProductReviews` / `numSellerReviews` were claimed as new but already exist). This section is the canonical list of TRULY-NEW schema deltas Workstream 1 ships.

**CompetitorUrl — new columns:**
- `type String?` — product type / category tag.
- `description1 String? @db.Text` — primary description.
- `description2 String? @db.Text` — secondary description.
- `price String?` — free-text price (could be "$24.99" / "From $24" / "Free w/ Prime" so String not Decimal).
- `competitionScore Int?` — 1-100 range (per A.7 client+server validation).
- `scrapingStatus ScrapingStatus @default(INCOMPLETE)` — enum (INCOMPLETE | COMPLETE).
- `overallCompetitorAnalysis Json @default("{}")` — TipTap document JSON (per A.5).

**New Prisma enum:**
- `ScrapingStatus { INCOMPLETE, COMPLETE }`.

**Existing CapturedText / CapturedImage / CapturedVideo — new columns:**
- `analysis Json @default("{}")` — per-item TipTap document for the per-item Analysis text box.

**New Prisma models:**
- `CapturedReview` (per A.1b — fields enumerated in A.1b).
- `ComprehensiveCompetitorAnalysis` (per A.4 — fields enumerated in A.4).
- `UserTablePreferences` (per A.3 — fields enumerated in A.3).

**Per-category Overall Analysis storage:**
- Per-URL × per-capture-category Overall Analysis text boxes are stored as JSON on the `CompetitorUrl` row in a new column `overallAnalyses Json @default("{}")` — shape: `{ "text": <TipTap JSON>, "image": <TipTap JSON>, "video": <TipTap JSON>, "reviews": <TipTap JSON> }`. Single denormalized JSON column avoids a 4-row per-URL side table.

**No data backfill needed** — all fields are nullable or have defaults. Existing rows render with empty Analysis text boxes + null new fields until edited.

**Schema-change-in-flight flag:** Flips YES at Workstream 1's first session; stays YES until that workstream's deploy session deploys the new schema live on vklf.com. All subsequent P-46 workstream sessions read against the post-migration schema.

---

### A.12 Platform-truths audit (Rule 19)

Two platform-level facts surfaced during this design session and warrant `PLATFORM_REQUIREMENTS.md` updates at end-of-session:

1. **Rich-text editor as a platform-shared dependency.** TipTap is the first rich-text editor library introduced to PLOS. Once P-46 ships, future workflows that need rich text (W#3 Therapeutic Strategy almost certainly; W#5 Conversion Funnel narratives; W#6 Content Development) should default to TipTap rather than evaluating editor libraries separately. Add to `PLATFORM_REQUIREMENTS.md` §12 (or component-library §): "TipTap is PLOS's chosen rich-text editor; first introduced by W#2 P-46 Comprehensive Competitor Analysis page; future workflows requiring rich text consume `@tiptap/react` rather than evaluating alternatives."

2. **Per-user-per-project UI preference table pattern.** `UserTablePreferences` joins `UserExtensionState` + `UserProjectHighlightTerm` as the third per-user-per-project preference table. The pattern is now sufficiently used (3 tables) to be platform-canonical. Add to `PLATFORM_REQUIREMENTS.md` (or `DATA_CATALOG.md`): "Per-user UI preferences that need cross-device sync use a dedicated Prisma model keyed by (userId, projectId) — pattern shared by `UserExtensionState`, `UserProjectHighlightTerm`, `UserTablePreferences`."

Both updates land at end of the Workstream 1 session per Rule 19 timing (audits land when the spec they describe lands in code, not at design-only sessions).

---

### A.13 Living Questions (Rule 7) answers — for `DATA_CATALOG.md` Shared Data Registry

Three questions every new feature must answer:

1. **Which data from upstream workflows does P-46 need?**
   - Project (existing — `projects` table).
   - Platform (existing — W#2's per-Project platform context in `chrome.storage.local`).
   - CompetitorUrl (existing — W#2's own captured URLs; P-46 ADDS columns).
   - CapturedText / CapturedImage / CapturedVideo (existing — P-46 ADDS the per-item `analysis` column).
   - User (existing — Supabase auth).

2. **Is each piece of shared data read-only or editable downstream?**
   - All P-46 outputs are **read-only by downstream W#3+** (per `COMPETITION_SCRAPING_DESIGN.md` §A.5 standing pattern — W#2 outputs are read-only downstream in v1).

3. **If editable, how does the upstream tool see the edits?** N/A — read-only.

Add to `DATA_CATALOG.md` Shared Data Registry at end of Workstream 1 (data must exist before declaring it shared).

---

### A.14 Cross-Tool Data Flow Map reciprocal output declaration (Rule 18)

**New entries for W#2's row in `DATA_CATALOG.md` §7 Cross-Tool Data Flow Map (added at Workstream 1 end-of-session):**

| Output | Producer | Schema location | Initial downstream consumers |
|---|---|---|---|
| Captured reviews (`CapturedReview` rows) | W#2 P-46 | `prisma/schema.prisma` `CapturedReview` model + `src/lib/shared-types/competition-scraping.ts` `CapturedReviewShared` interface (NEW) | TBD — likely W#5 Conversion Funnel (review-pattern signals) + W#10 Reviews (assumed) |
| Per-item Analysis text (`analysis` JSON columns on CapturedText/Image/Video/Review) | W#2 P-46 | `prisma/schema.prisma` per-table `analysis Json` column | TBD — likely W#3 Therapeutic Strategy + W#6 Content Development |
| Per-category Overall Analysis (`overallAnalyses` JSON on CompetitorUrl) | W#2 P-46 | `prisma/schema.prisma` `CompetitorUrl.overallAnalyses Json` | TBD — likely W#3 + W#5 + W#6 |
| Comprehensive Competitor Analysis (per-Project rich-text doc) | W#2 P-46 | `prisma/schema.prisma` `ComprehensiveCompetitorAnalysis` model | TBD — likely all downstream W#3+ workflows as a strategic-context input |
| Competition Score (1-100 per CompetitorUrl) | W#2 P-46 | `prisma/schema.prisma` `CompetitorUrl.competitionScore` | TBD — W#3 + W#5 prioritization signal |

---

### A.15 Scaffold fit (Rule 20)

P-46 is an EXTENSION to an already-graduated-pattern W#2 surface, not a new workflow. The Shared Workflow Components Library is consumed by the PLOS-side rendering (existing `<StatusBadge>` / `<WorkflowTopbar>` / `<DeliverablesArea>` on the Competition Data page + URL detail page).

**Library components consumed (PLOS side):** existing — no changes to existing imports.

**New shared-library component additions proposed by P-46:** none in v1. The Comprehensive Analysis page's edit-mode toggle and TipTap editor wrapper are W#2-local; if a second workflow needs the same shape later, that workflow's design session can propose lifting the wrapper into the shared library.

**Extension content-script forms remain W#2-specific** and don't import from the shared library (W#2-local UI primitives only).

---

### A.16 Deferred-items registry from this session (Rule 14e + Rule 26)

Captured via `TaskCreate` with `DEFERRED:` prefix during this session: **none.** All five Tasks created this session (#1 pre-design reads / #2 walk pickers / #3 create design doc / #4 update ROADMAP / #5 end-of-session) complete cleanly within scope.

In-doc deferrals (scope-deferral for v1, captured per A.1 + A.9 + A.10):

- **Per-platform Reviews-extraction mechanism** (A.1 — deferred to future per-platform polish sessions; one design session per platform).
- **Select preview thumbnail button + manual rectangle-draw fallback** (A.9 — dropped entirely from P-46; capture as future polish only if auto-thumbnail proves consistently bad in practice).
- **CompetitorSize table destructive cleanup** (A.6 — kept around in v1 with UI hidden; future P-46 + N session can do the destructive cleanup if a year passes with no resurrection).
- **Slider input for Competition Score** (A.7 — number-only in v1; can add slider in a future polish if entry-feel needs it).
- **Per-row Edit-mode editing** (A.2 — click-to-edit is the v1 pattern; revisit if click-to-edit accumulates UX friction).
- **Cross-platform extension Reviews-capture Playwright tests** (mirror of P-22-style — deferred until per-platform Reviews-extraction sessions land).

---

## §B — In-flight refinements (append-only)

**Empty at end of interview 2026-05-23.** Future P-46 build sessions append entries here following the canonical format:

```markdown
### §B YYYY-MM-DD — <session ID> — <one-line topic>

- **Director said:** <verbatim or paraphrased directive>
- **Alternatives considered:** <list>
- **Decision:** <what was decided>
- **Reasoning:** <why>
- **Impact on §A:** <does §A still hold? if no, flag for §A update with director's confirmation>
```

Never edit prior entries or §A. If accumulated §B decisions supersede §A's spec, surface that to director as a flag for a deliberate §A update.

---

## §C — Per-workstream implementation outlines

Each subsection captures: scope (what ships), file-level deltas (which files change), session estimate, dependencies (what must ship first), test approach, deploy mechanics, cross-references back to §A decisions.

### §C.1 Workstream 1 — Schema

**Scope:** All P-46 schema changes ship in this workstream. After Workstream 1 deploys, the database carries all new columns + new tables + new enum; downstream workstreams only touch application code.

**Files touched:**
- `prisma/schema.prisma` — add fields per §A.11 (CompetitorUrl new columns + CapturedText/Image/Video new `analysis` column + new ScrapingStatus enum + new CapturedReview / ComprehensiveCompetitorAnalysis / UserTablePreferences models).
- `src/lib/shared-types/competition-scraping.ts` — add new wire types: `CapturedReviewShared`, `ComprehensiveCompetitorAnalysisShared`, `UserTablePreferencesShared` + extend `CompetitorUrlShared` with new columns.
- New helper files (probably 1-2 per workstream session): `src/lib/competition-scraping/captured-review-validation.ts` + `src/lib/competition-scraping/table-preferences-storage.ts`.
- New API routes: `/api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews` (GET/POST) + `/api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews/[reviewId]` (PATCH/DELETE) + `/api/projects/[projectId]/competition-scraping/comprehensive-analysis` (GET/PUT) + `/api/users/[userId]/table-preferences/[projectId]` (GET/PUT).

**Sessions estimated:** ~2-3.
- Session 1: Schema migration + Prisma client regen + new shared types + initial validators (no API routes yet).
- Session 2: API route scaffolding for new endpoints + node:test coverage for validators.
- Session 3 (CONDITIONAL — DEPLOY): if Sessions 1+2 land clean, deploy via Rule 9 director-Yes gate. Sessions 1+2's prior commits ship together.

**Dependencies:** none (first workstream).

**Test approach:** node:test for all new validators + shared-type round-trip tests. No Playwright at this workstream (no UI).

**Deploy mechanics:** First deploy session of P-46 fires Rule 9 for `npx prisma db push` (schema migration on Supabase) + Rule 9 for `git push origin main`. Schema-change-in-flight flag flips YES → NO at deploy completion.

**Cross-references:** §A.1b (CapturedReview shape) + §A.3 (UserTablePreferences shape) + §A.4 (ComprehensiveCompetitorAnalysis shape) + §A.5 (TipTap JSON storage) + §A.7 (competitionScore validation) + §A.8 (scrapingStatus enum) + §A.11 (consolidated schema list).

---

### §C.2 Workstream 2 — URL detail page redesign

**Scope:** The densest user-visible improvement in P-46. Restructures `UrlDetailContent.tsx` to render all new fields, all new Analysis text boxes, the new Captured Reviews box, and the new vklf.com-side affordances (upload / edit / delete) for existing capture rows.

**Files touched:**
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx` — major rewrite:
  - Add Type / Description-1 / Description-2 / Price fields to the URL box.
  - Add Scraping Status toggle (mirrors A.8).
  - Add Overall Competitor Analysis TipTap text box at the bottom of the URL box.
  - Remove the Sizes / Options section (A.6 — keep schema, just stop rendering).
  - Add new Captured Reviews box (parallel to existing Captured Text / Image / Video sections); includes star-rating multi-select filter; per-row edit / delete; manual "Add Review" form (A.1b).
  - Add per-item Analysis TipTap text box under EVERY captured item (text / image / video / review).
  - Add per-category Overall Analysis TipTap text box at the bottom of each capture box (Text / Images / Videos / Reviews).
  - Add upload-image / upload-video buttons (vklf.com-side direct uploads).
  - Add edit-descriptions-and-tags affordance + delete affordance for existing image / video rows.
  - Add edit-video-thumbnail affordance (Note: A.9 deferred the rectangle-draw picker; this affordance is "delete and re-capture" only in v1).
  - Show image + video metadata (category / composition / embedded text / tags) inline next to each item.
  - Remove "added on" column from Captured Text box (per P-46 entry).
- New component files (probably): `CapturedReviewsBox.tsx` + `AddReviewForm.tsx` + `PerItemAnalysisBox.tsx` + `OverallAnalysisBox.tsx` + `TipTapEditor.tsx` (shared wrapper).
- `src/app/projects/[projectId]/competition-scraping/url/[urlId]/page.tsx` — minor: adjust the data-fetch to include new fields + reviews.

**Sessions estimated:** ~3-5.
- Session 1: TipTap shared wrapper component + per-item Analysis text box on Captured Text (the simplest existing row type).
- Session 2: Per-item Analysis on Image + Video; per-category Overall Analysis on Text + Image + Video; remove Sizes/Options.
- Session 3: Captured Reviews box (list + edit + delete + manual entry form).
- Session 4: URL box new fields (Type / Description-1 / Description-2 / Price + Overall Competitor Analysis + Scraping Status toggle).
- Session 5 (CONDITIONAL — DEPLOY): if Sessions 1-4 land clean, deploy via Rule 9 gate.

**Dependencies:** Workstream 1 must be deployed (schema + API routes live on vklf.com).

**Test approach:** Hybrid per Rule 27 — node:test for any new validation helpers (`captured-review-validation.ts` already shipped in Workstream 1) + Playwright extension-context spec for the Captured Reviews flow (mirrors P-27 Build #6 single-platform amazon spec pattern) + manual walkthrough for TipTap editor experience (visual + keyboard).

**Deploy mechanics:** Standard 4-phase per `.claude/commands/deploy.md`. Rule 9 gate fires once for `git push origin main`. No `prisma db push` needed (Workstream 1 already shipped schema).

**Cross-references:** §A.1b (Reviews v1 shape) + §A.2 (click-to-edit — applies to inline-edit affordances within the URL box) + §A.5 (TipTap configs for per-item and per-category Analysis) + §A.6 (Sizes/Options removal) + §A.8 (Scraping Status toggle).

---

### §C.3 Workstream 3 — Competition Data table redesign

**Scope:** Rewrites the Competition Data page's table with all the new columns, controls, and per-user persistence per §A.2 + §A.3.

**Files touched:**
- `src/app/projects/[projectId]/competition-scraping/page.tsx` — light:
  - Shrink + reposition Detailed User Guide + Resources boxes to the upper-right corner.
  - Add prominent "Comprehensive Competitor Analysis" tab at top.
  - Replace left-side PlatformSidebar with horizontal checkbox bar at top combining platform filters + per-column show/hide controls.
- `src/app/projects/[projectId]/competition-scraping/components/CompetitionScrapingViewer.tsx` — major rewrite:
  - Integrate per-user `UserTablePreferences` (read at mount + write on change debounced).
  - Add column visibility / column width / font size / row order controls.
  - Add drag-to-reorder rows (persisted).
  - Add inline cell editing per A.2.
- `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx` — major rewrite: new columns (Type / Description-1 / Description-2 / Price / Competition Score / Status / etc.); per-cell editor renderers; tooltips on column headers; resizable headers.
- `src/app/projects/[projectId]/competition-scraping/components/ColumnFilters.tsx` — extend with show/hide checkboxes.
- `src/app/projects/[projectId]/competition-scraping/components/DetailedUserGuide.tsx` — shrink + restyle for upper-right corner placement.
- `src/app/projects/[projectId]/competition-scraping/components/PlatformSidebar.tsx` — DELETED (replaced by horizontal checkbox bar at top).

**Sessions estimated:** ~3-4.
- Session 1: `UserTablePreferences` integration + read/write at page level; horizontal checkbox bar (platform filter + column show/hide).
- Session 2: Click-to-edit cell editors (one per data type — text / number / decimal / enum / boolean / date / tags).
- Session 3: Column resize + drag-to-reorder rows + font size control.
- Session 4 (CONDITIONAL — DEPLOY): if Sessions 1-3 land clean, deploy.

**Dependencies:** Workstream 1 deployed (schema + API). Workstream 2 deployed (URL detail page; the table cells link to URL detail page rows).

**Test approach:** Hybrid — node:test for any preference-serialization helpers + Playwright spec for click-to-edit + drag-reorder + Manual walkthrough for the full preference-persistence flow across two browsers.

**Deploy mechanics:** Standard 4-phase. Rule 9 gate once for `git push origin main`.

**Cross-references:** §A.2 (click-to-edit) + §A.3 (UserTablePreferences) + §A.7 (Competition Score input shape) + §A.8 (Status column mirror).

---

### §C.4 Workstream 4 — Comprehensive Competitor Analysis page

**Scope:** New page route hosting the per-Project rich-text Comprehensive Analysis doc with hyperlinks back to URL detail pages.

**Files touched:**
- New `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/page.tsx` — full page implementation.
- New `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/components/AnalysisEditor.tsx` — TipTap full-toolbar editor wrapper.
- New `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/components/AnalysisReadView.tsx` — TipTap JSON-to-HTML render for read mode.
- Reuse `TipTapEditor.tsx` shared wrapper from Workstream 2 with a "full toolbar" config flag.

**Sessions estimated:** ~2-3.
- Session 1: Page + AnalysisEditor + AnalysisReadView + edit-mode toggle + Competition Data back-button.
- Session 2: Internal-hyperlink extension (recognize `#url/<urlId>` shorthand + resolve to URL detail page navigation).
- Session 3 (CONDITIONAL — DEPLOY): if Sessions 1-2 land clean, deploy.

**Dependencies:** Workstream 1 deployed (schema). Workstream 2 deployed (TipTap shared wrapper already in place).

**Test approach:** Hybrid — node:test for the internal-hyperlink resolver + Playwright spec for read-mode + edit-mode toggle + Manual walkthrough for the TipTap rich-text experience.

**Deploy mechanics:** Standard 4-phase.

**Cross-references:** §A.4 (one page per Project) + §A.5 (TipTap full toolbar).

---

### §C.5 Workstream 5 — Extension URL save form additions + vklf.com Reviews entry

**Scope:** Smallest workstream after Q1 + Q9 scope reductions. Adds Type / Description-1 / Description-2 / Price inputs to the extension's URL save form so these fields are captured at extension time and sent to PLOS on save. Also adds the vklf.com-side manual "Add Captured Review" form on the URL detail page.

**Files touched:**
- `extensions/competition-scraping/src/lib/content-script/url-add-form.ts` — add Type / Description-1 / Description-2 / Price inputs to the content-script URL save form.
- `extensions/competition-scraping/src/entrypoints/popup/components/UrlAddForm.tsx` — add same inputs to the popup version of the URL save form.
- `extensions/competition-scraping/src/lib/api-client.ts` — extend `saveCompetitorUrl` request shape to carry the new fields (additive).
- `src/lib/shared-types/competition-scraping.ts` — extend `CompetitorUrlSaveRequest` interface (additive).
- `src/app/.../url/[urlId]/components/CapturedReviewsBox.tsx` — already shipped in Workstream 2 (per §C.2); this workstream may polish.
- `extensions/competition-scraping/src/entrypoints/background.ts` — no changes (no new context-menu entry in v1; Reviews extension gesture is deferred).

**Sessions estimated:** ~1-2.
- Session 1: Extension URL save form additions (content-script + popup); api-client + shared-types extensions; api-route accepts new fields.
- Session 2 (CONDITIONAL — DEPLOY): if Session 1 lands clean, deploy with fresh extension zip.

**Dependencies:** Workstream 1 deployed (schema has new fields). Workstream 2 deployed (URL detail page renders new fields).

**Test approach:** Hybrid — node:test for any new validation helpers + Playwright extension-context spec for URL save with the new fields + Manual walkthrough for end-to-end save from extension → vklf.com display.

**Deploy mechanics:** Standard 4-phase with fresh extension zip. Rule 9 gate once for `git push origin main`.

**Cross-references:** §A.1b (Reviews v1 = vklf.com-side manual entry; no extension gesture in v1) + §A.9 (no thumbnail picker).

---

END OF DOCUMENT
