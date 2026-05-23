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

## §B 2026-05-24 — `session_2026-05-24_p46-workstream-1-schema-first-build-session` — Workstream 1 (Schema) landed at code level + memorializes the "Workstream Foundation Build Bundle" reusable Pattern

- **Director said:** general "proceed" directive at session start ("ready, proceed with the P-46 Workstream 1 first build session per the launch prompt in NEXT_SESSION.md"). The ONE Rule 9 picker fired during the session — `npx prisma db push` AskUserQuestion picker — received director-Yes.

- **What landed (faithful to §A.11 with one deliberate inconsistency-resolution):**
  - Schema migration `npx prisma db push` ran in 1.32s; zero data loss; additive only. Build commit `caad82a` (21 files +781/-11 on `workflow-2-competition-scraping`). NOT pushed to main (Workstream 1 is a build session, not a deploy session).
  - **3 new Prisma models:** `CapturedReview` (per §A.1b fields + see inconsistency-resolution below) / `ComprehensiveCompetitorAnalysis` (per §A.4 with naming-convention drift surfaced below) / `UserTablePreferences` (per §A.3 with path-convention drift surfaced below).
  - **8 new `CompetitorUrl` columns:** `type` / `description1` / `description2` / `price` / `competitionScore` / `scrapingStatus` enum / `overallCompetitorAnalysis` JSON / `overallAnalyses` JSON bag. All match §A.11 verbatim.
  - **1 new `analysis` JSON column** on each of CapturedText / CapturedImage / CapturedVideo per §A.5 + §A.11.
  - **1 new Prisma enum:** `ScrapingStatus { INCOMPLETE, COMPLETE }` per §A.8 + §A.11.
  - **4 new API route shells** scaffolded as 501 Not Implemented stubs that Workstreams 2-4 fill in (CapturedReview CRUD / Comprehensive Analysis read+write / User Table Preferences read+write / per-row PATCH for new `CompetitorUrl` columns + per-item `analysis` JSON on CapturedText/Image/Video). Each route exports a typed handler returning 501 with a body shape matching the future contract.
  - **`src/lib/shared-types/competition-scraping.ts` extended** for new wire shapes (`CapturedReview` / `ComprehensiveCompetitorAnalysis` / `UserTablePreferences` / `ScrapingStatus`) + new optional fields on `CompetitorUrlWire`.
  - **12 new node:test cases** for the new shape-validation helpers (test count 590 → 602; +12). Reject misshapen data at the trust boundary so future code can rely on them.
  - **All 5 /scoreboard checks GREEN at new baselines:** root tsc clean / extension tsc clean / 558 ext unchanged / 602 src/lib (+12) / 61 routes (+4); Check 6 Playwright SKIPPED per non-deploy-session convention.

- **Inconsistency-resolution on `CapturedReview.analysis` (deliberate; informational; no §A amendment needed):** §A.1b's literal text said `analysis Text?` for the per-item Analysis field on CapturedReview, but §A.11's consolidated schema-additions list said `analysis Json @default("{}")`. Implemented as **`Json @default("{}")`** matching §A.11 + matching CapturedText/Image/Video on this field per §A.5's standing "per-item Analysis is always TipTap rich-text" pattern. No director-confirmed override needed since both readings were already on the design doc; the consolidated §A.11 list takes precedence over the §A.1b shorthand. Informational flag only.

- **§A.4 naming-convention drift surfaced (NOT amended; §A frozen per Rule 18):** `ComprehensiveCompetitorAnalysis` uses `lastEditedBy + lastEditedAt + createdAt` rather than the schema-wide `addedBy + updatedAt` convention used by `CompetitorUrl` / `CapturedText` / `CapturedImage` / `CapturedVideo`. Implemented per §A.4 literal text per Rule 18 frozen. Surface only; no action needed. Future workstreams reading the schema should expect this one model to use the per-edit-tracker convention rather than the standard schema-wide pattern.

- **§A.3 path-convention drift surfaced (deferred to Workstream 3's implementation session; §A frozen per Rule 18):** `/api/users/[userId]/table-preferences/[projectId]` differs from PLOS's auth-derived-userId convention (e.g., `/api/extension-state` derives userId from session; `/api/projects/[projectId]/extension-state/highlight-terms` does the same). Implemented per §A.3 literal text. The route stub's header comment carries a tombstone marker noting this. **Workstream 3's implementation session decides** between (a) enforce `auth.userId === params.userId` at the auth check so the literal-text path stays + the security model matches the rest of PLOS, OR (b) refactor to `/api/projects/[projectId]/competition-scraping/table-preferences` matching the auth-derived userId convention. Both readings are valid; deferral to Workstream 3 is the correct call.

- **Drift between estimate and actual:** §C.1 estimated 2-3 sessions for Workstream 1; landed in 1. Design doc explicitly allowed combining Sessions 1+2 if scope landed cleanly. Sessions 2-3 originally allocated reabsorbed into Workstream 2's runway. **Note:** Workstream 1 still needs its own deploy session before §C.1 marks "deployed" — likely after Workstream 2 or 3 lands enough UI to demo the schema's reach. The schema-aware code on workflow-2 is undeployed on main; the schema is live on Supabase. Schema-change-in-flight flag FLIPPED NO → YES at `prisma db push` completion; stays YES until that future deploy session.

- **One reusable Pattern memorialized for future workstream first-build sessions — "Workstream Foundation Build Bundle":** When a workstream's scope is well-specced in advance via the design doc's §A + §C subsections, the schema delta + API route shells + shared-types extension + node:test coverage can bundle in a single build session as long as ALL of the following hold:
  - (a) **Schema is purely additive** — new tables empty; new columns nullable or defaulted; new enum drives a new column with sane default; no DROP / DELETE; no destructive migration. Director-Yes Rule 9 gate fires once for `npx prisma db push`; reversible at the schema level until Workstream 2+ starts writing data into the new tables.
  - (b) **API routes are 501 stubs** — each new route file exports a typed handler that returns 501 with a body shape matching the future contract; downstream workstreams will fill in the implementation later. Stubs let downstream workstreams import route URLs from a stable surface immediately.
  - (c) **Wire-type extensions are forward-compatible** — new fields optional on request types; new fields populated on response types via mapper extensions; old clients see new fields they don't care about as `undefined`.
  - (d) **The existing toWireShape mapper sites are explicitly enumerated and updated** — every place the schema-level model gets converted to wire shape gets the new fields added in this build session. Misses here are caught by Check 1 (root tsc) at /scoreboard.

  **Why this matters:** the default planning estimate for a Workstream 1-style foundation in a multi-workstream feature is typically 2-3 sessions (schema in session 1, API + shared-types in session 2, tests + verification in session 3). When ALL four conditions hold, the work compresses into 1 session because there's no UI to wire, no real-world walkthrough, no Rule 9 deploy gate beyond the schema-migration one, and no schema-vs-code drift to reconcile across boundaries (the schema, the wire types, and the route stubs all land in one commit so the truth is identical across all three layers). **Tag this Pattern in future Workstream 1-style sessions** — if all four conditions can be met, plan 1 session for the foundation, not 2-3.

- **Decision:** Workstream 1 closed at code level for the P-46 implementation arc. Next session begins Workstream 2 (URL detail page redesign) Session 1 per Q10's locked sequencing.

- **Impact on §A:** **None.** §A.1b's per-item Analysis field reading reconciles via §A.11's consolidated list (the consolidated list takes precedence over the shorthand per §B's append-only convention). §A.3's path-convention disagreement is captured here as a deferral marker for Workstream 3's implementation session, not as an §A amendment. §A.4's naming-convention drift is captured here as informational; no §A amendment. The "Workstream Foundation Build Bundle" Pattern is a session-shape memorialization, not a design change.

---

## §B 2026-05-25 — `session_2026-05-25_p46-workstream-2-session-1-tiptap-wrapper-and-per-item-analysis-on-captured-text` — Workstream 2 Session 1 lands TipTap shared wrapper + per-item Analysis on Captured Text + card-layout precedent set

- **Director said:** general "proceed" directive at session start ("ready, proceed with the P-46 Workstream 2 Session 1 per the launch prompt in NEXT_SESSION.md"). ONE Rule 14f forced-picker fired mid-session — visual layout of the per-item Analysis box on Captured Text — director picked **Option A "Card layout — replace the table (recommended)"** over 3 alternatives (B expandable row / C sixth column / D inline sub-row). ZERO Rule 9 gates fired this session (no schema changes; no destructive ops).

- **Rule 14f forced-picker outcome — visual layout (4 options previewed with ASCII mockups):**
  - **Option A — Card layout (replace the table) (RECOMMENDED).** Each captured text becomes a vertical card with metadata row at top + body text below + Analysis editor below that. Most space for the rich-text editor; layout precedent that propagates cleanly to Image / Video / Review which already render gallery-style.
  - **Option B — Expandable row (current table stays).** Click a chevron to expand a row into a full-width Analysis editor below; collapse to restore table view.
  - **Option C — Sixth column.** Add a sixth column with a compact Analysis preview + an edit affordance.
  - **Option D — Inline sub-row.** A second row beneath each text row holds the Analysis editor inline.
  - **Director picked Option A.** **This choice propagates to all 4 capture types** (Text / Image / Video / Review) in subsequent Workstream 2 sessions per §C.2. The remaining 3 capture types already render in gallery/list shapes that adapt naturally to a card-list layout; Captured Reviews (Session 3 or 4) is greenfield and slots into the same card-list shape from day one.

- **Skipped pickers (per `feedback_default_to_recommendation.md`):** wrapper file location (§A.15 already locked W#2-local at `src/app/projects/[projectId]/competition-scraping/components/RichTextEditor.tsx` — no picker needed); wrapper API shape (props: initial JSON / on-change callback / read-only mode / placeholder / debounce-ms / variant — most-thorough/canonical TipTap wrapper API obvious); save mechanism (debounced on-change 500ms + onBlur flush is the canonical Notion / Google-Docs rich-text-editor UX shape).

- **What landed (file-by-file recap matching build commit `b6e43fe` — 8 files +1572/-149):**
  - **NEW `src/lib/rich-text/tiptap-helpers.ts`** (92 LOC pure helpers) — exports `EMPTY_TIPTAP_DOC` constant + `isEmptyTipTapDoc` predicate + `normalizeTipTapInput` defensive normalizer + `isValidAnalysisPayload` route-trust-boundary guard (rejects null / arrays / primitives; accepts only object-shaped TipTap documents). **Deliberately free of `@tiptap/*` imports** so `node:test` can load them without browser-only ProseMirror dependencies.
  - **NEW `src/lib/rich-text/tiptap-helpers.test.ts`** — 20 new node:test cases covering all four helpers' happy paths + edge cases (empty doc detection / array rejection / null rejection / primitive rejection / nested-object acceptance / forward-compatibility for unknown TipTap node types). Test count 602 → 622 (+20; exact match with the new tiptap-helpers tests).
  - **NEW `src/app/projects/[projectId]/competition-scraping/components/RichTextEditor.tsx`** (317 LOC) — platform-shared TipTap editor wrapper per §A.5 + §A.12. Minimal toolbar: Bold / Italic / bullet list / numbered list / link. **Forward-compatible `variant: 'minimal' | 'full'` prop** — `'minimal'` is wired this session (per-item Analysis boxes); `'full'` reserved for Workstream 4 Comprehensive Analysis page. Debounced on-change save (500ms default) + onBlur flush + SSR-safe via `immediatelyRender: false` (per TipTap's Next.js compatibility guidance). The wrapper itself doesn't persist — the consumer wires up the save mechanism via props.
  - **NEW `src/app/projects/[projectId]/competition-scraping/components/PerItemAnalysisBox.tsx`** (174 LOC) — one-captured-item Analysis box that owns the per-row save lifecycle. Renders the RichTextEditor (variant='minimal') + a status indicator ("Saving…" while in-flight; "✓ Saved" once it lands; "Save failed — retry?" on error). Reusable for Captured Image / Video / Review in later Workstream 2 sessions by passing a different `apiUrl` prop.
  - **MODIFIED `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx`** — `CapturedTextSubsection`'s render switches from a 5-column HTML table to a vertical card list per the Rule 14f picker. New `CapturedTextCard` + `CapturedTextSortControl` helpers handle the card-layout rendering + the now-out-of-table sort affordance. Removed the now-unused `SortableHeader` + `textCellStyle`. Layout precedent set for Captured Image / Video / Review per-item Analysis in subsequent sessions.
  - **MODIFIED `src/app/api/projects/[projectId]/competition-scraping/text/[textId]/route.ts`** — PATCH allowlist extended to accept `analysis` field; validates via `isValidAnalysisPayload` at the trust boundary (rejects null / arrays / primitives — only object-shaped TipTap documents pass). **FIRST REAL IMPLEMENTATION behind a Workstream-1-era 501 stub surface** — the wire-type's `analysis?: Record<string, unknown>` shipped in Workstream 1; this session lands the route-handler half + the UI half together so the round-trip works on the workflow-2 branch even though the deploy is later.
  - **3 new npm dependencies** — `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-link` (all at 3.23.6; 50 packages added transitively including `@tiptap/core` + `@tiptap/pm` + ProseMirror engine). All compatible with React 19 + Next.js 16. `package.json` + `package-lock.json` updated.

- **Verification scoreboard at new baselines:** root tsc clean / extension tsc clean / 558 ext UNCHANGED (extension untouched) / **622 src/lib node:test (+20 from baseline 602 — exact match with new tiptap-helpers tests)** / **61 routes UNCHANGED** (no new routes; only extended existing `text/[textId]` PATCH allowlist); Check 6 Playwright SKIPPED per non-deploy-session convention (lands later in Workstream 2 once URL detail page rewrite is further along per §C.2).

- **Reusable Pattern memorialized for future per-row-edit-affordance work — "PerItemAnalysisBox extraction":** When a per-row edit affordance (rich-text editor / structured form / autosave field) is needed across multiple sibling capture types in a feature, extract a single component that owns the per-row save lifecycle and parameterize per-type behavior via a small props surface. The PerItemAnalysisBox extracts the per-row save lifecycle (debounced on-change persist + onBlur flush + status indicator + retry-on-error) into a single component. Each captured item type (Text / Image / Video / Review) consumes the SAME component but passes a different `apiUrl` prop — `/api/.../text/[textId]` for Captured Text today; `/api/.../images/[imageId]` for Captured Image next session; etc. The component itself doesn't know what capture type it's hosting; it just owns the save-lifecycle for the JSON column at the API path the caller provides.

  **Why this matters:**
  - (a) **One save-lifecycle to maintain.** The "Saving…" / "✓ Saved" / "Save failed" status logic + the debounce + the onBlur flush + the abort-on-unmount semantics all live in ONE component. Future bugs get fixed once; future improvements (e.g., optimistic UI) land once.
  - (b) **Layout precedent propagates cleanly.** Because the same component renders on Text / Image / Video / Review, the visual layout (card layout per the Rule 14f picker) propagates by composition rather than copy-paste — Sessions 2-4 of Workstream 2 don't need to re-decide layout for each capture type.
  - (c) **API contract uniformity enforced by props.** The `apiUrl` prop has the same shape across capture types — PATCH with `{ analysis: TipTapDoc }` body. The route-handler half (which Workstream 1 stubbed as 501) gets the same one-line extension on each capture type (allowlist `analysis` + validate via `isValidAnalysisPayload`). One pattern, four routes.
  - (d) **Trust-boundary guard in shared helpers.** `isValidAnalysisPayload` validates the wire shape at the route trust boundary — rejecting null / arrays / primitives before the data ever reaches Prisma. The same guard runs in all 4 capture-type PATCH routes; future capture types can adopt the same guard for free.

  **Tag this "PerItemAnalysisBox extraction" as a reusable Pattern worth recognizing in future per-row-edit-affordance work.** Applies wherever (a)+(b)+(c)+(d) hold across sibling row types.

- **Drift between estimate and actual:** §C.2 estimates Workstream 2 at 3-5 sessions; Session 1's "first slice" framing was "build the shared wrapper + wire per-item Analysis on the simplest capture type (Captured Text)" and that landed cleanly within scope. Build commit `b6e43fe` shipped exactly the planned scope (wrapper component + per-item Analysis box component + Captured Text card-list rewrite + text/[textId] PATCH allowlist extension + 20 new node:test cases). No scope overrun; no fix-forward; no follow-up Workstream-2-Session-1b session needed. **Informational calibration data point** — a "shared wrapper + first-capture-type wiring + first-route-handler-half" Workstream 2-style session can complete cleanly in 1 session if the wrapper API shape is decided at the start (Default-to-recommendation skipped the API picker) and the layout choice resolves via a single Rule 14f forced-picker.

- **Decision:** Workstream 2 Session 1 closed at code level. Next session begins Workstream 2 Session 2 (Captured Image + Captured Video per-item Analysis wiring + card-list layout extension to those capture types) per (a.72) RECOMMENDED-NEXT.

- **Impact on §A:** **None.** §A.5 (TipTap library decision) + §A.12 (TipTap as platform-shared dependency) + §A.15 (W#2-local wrapper location) all confirmed by this session's implementation. The new "PerItemAnalysisBox extraction" Pattern is a session-shape memorialization, not a design change. The card-layout-replaces-table choice is a §C.2 implementation-detail outcome locked via Rule 14f forced-picker; §A stays frozen per Rule 18.

---

## §B 2026-05-26 — `session_2026-05-26_p46-workstream-2-session-2-per-item-analysis-on-captured-image-and-video` — Workstream 2 Session 2 applies Session 1's card-list precedent + `PerItemAnalysisBox` to Captured Image + Captured Video; confirms the extraction Pattern from Session 1 was the right abstraction

- **Director said:** general "proceed" directive at session start ("ready, proceed with the P-46 Workstream 2 Session 2 per the launch prompt in NEXT_SESSION.md"). NO Rule 14f forced-pickers fired this session — every layout choice for the Image + Video cards was a direct application of Session 1's locked card-list precedent per `feedback_default_to_recommendation.md`. ZERO Rule 9 gates fired (no schema changes; no destructive ops).

- **What landed (file-by-file recap matching build commit `9747f63` — 4 files +325/-102):**
  - **MODIFIED `src/app/api/projects/[projectId]/competition-scraping/images/[imageId]/route.ts`** (+17 LOC) — PATCH allowlist extended to accept `analysis` field; validates via `isValidAnalysisPayload` from `@/lib/rich-text/tiptap-helpers` at the trust boundary (rejects null / arrays / primitives — only object-shaped TipTap documents pass). One import + one conditional block. Identical fix-shape as Session 1's `text/[textId]` extension.
  - **MODIFIED `src/app/api/projects/[projectId]/competition-scraping/videos/[videoId]/route.ts`** (+15 LOC) — same fix shape; PATCH allowlist extended for `analysis` field; same trust-boundary validation.
  - **MODIFIED `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx`** (+329/-102) — `CapturedImagesGallery` switches from a thumbnail grid (`gridTemplateColumns: repeat(auto-fill, minmax(140px, 1fr))`) to a **vertical card list** (`display: flex; flexDirection: column; gap: 12px`); new `CapturedImageCard` component carries pill (imageCategory) top-left + trash button top-right (shared `rowTrashButtonStyle` like Session 1's CapturedTextCard) + image hero via the existing `ThumbnailButton` (click still opens `ImageViewerModal` with prev/next nav) + metadata rows (composition / embeddedText / tags / addedAt) + `PerItemAnalysisBox` wired to `/api/projects/{projectId}/competition-scraping/images/{imageId}` via the `apiUrl` prop (testId `captured-image-card` + `captured-image-delete-button` + `captured-image-analysis-{id}`). `CapturedVideosGallery` switches from a 2-col card grid (`gridTemplateColumns: repeat(auto-fill, minmax(280px, 1fr))`) to the same vertical card-list shape; now takes `projectId` prop (threaded from parent's `project.id`); new `CapturedVideoCard` component carries pill (videoCategory) top-left + inline `<iframe>` (EMBED) or `<video controls>` (DIRECT_BYTES / SCREEN_RECORDING) hero with `maxWidth: 480px` cap + metadata rows + `PerItemAnalysisBox` wired to videos/[videoId] (per-row delete still deferred — matches Build #5's "renderer only" scope). Removed unused `thumbnailTrashButtonStyle` (the overlay-trash style for the now-deleted thumbnail-grid model).
  - **MODIFIED `src/lib/rich-text/tiptap-helpers.test.ts`** (+66 LOC) — 6 new edge-case node:test cases for `isValidAnalysisPayload` pinning down the trust-boundary guard's contract at the boundary the two new routes share: nested object → true (TipTap doc JSON nests arbitrarily deep); plain object with arbitrary keys → true (guard is shape-level, not schema-level); function → false (typeof !== 'object'; not JSON-serializable); Object.create(null) → true (plain bag without prototype); TipTap doc with empty content array → true (legal shape distinct from EMPTY_TIPTAP_DOC); bigint → false (primitive; JSON.stringify throws). Documents the guard's exact behavior at the boundary so a regression there fails loud rather than corrupting a JSON column write. Test count 622 → 628 (+6).

- **Skipped pickers (per `feedback_default_to_recommendation.md`):** card layout shape (matched Session 1's CapturedTextCard shape pill+trash+hero+metadata+analysis for both new card types — no picker needed; direct application of Session 1's locked precedent); image trash button style (matched `rowTrashButtonStyle` like Session 1's CapturedTextCard — no picker needed); image hero (kept the existing `ThumbnailButton` so click still opens `ImageViewerModal` with prev/next nav — no picker needed); video hero (kept the existing inline `<iframe>` / `<video controls>` render — no picker needed); per-row Analysis box placement (below metadata rows matching Session 1's CapturedTextCard precedent — no picker needed); per-video delete affordance (deferred per Build #5's "renderer only" scope — no picker needed; surfaces as a polish item if real-Chrome verification later turns it up).

- **Verification scoreboard at new baselines:** root tsc clean / extension tsc clean / 558 ext UNCHANGED (extension untouched) / **628 src/lib node:test (+6 from baseline 622 — exact match with new isValidAnalysisPayload edge-case tests)** / **61 routes UNCHANGED** (no new routes; only extended existing `images/[imageId]` + `videos/[videoId]` PATCH allowlists); Check 6 Playwright SKIPPED per non-deploy-session convention.

- **Empirical observation — "card-list pattern propagates cleanly across capture types":** Session 1 set the precedent for Captured Text via a 4-option Rule 14f forced-picker (card layout / expandable row / sixth column / inline sub-row); the picker locked card layout. Session 2 applied that precedent to Captured Image + Captured Video **unchanged** — zero new picker decisions, zero new layout debates. The `PerItemAnalysisBox` component shipped in Session 1 was consumed twice in Session 2 (once per new capture type) by passing a different `apiUrl` prop; the route-handler half (which Workstream 1 stubbed as 501 and Session 1 first implemented for `text/[textId]`) got the same one-line extension on both new routes. This confirms the "PerItemAnalysisBox extraction" Pattern memorialized in §B 2026-05-25 was the right abstraction — one component + `apiUrl` prop covers 3 capture types so far (Text / Image / Video), with the 4th (Reviews) slotting in cleanly when it lands in a later Workstream 2 session.

- **Calibration data point — Session 2 estimate:** §C.2 of the design doc estimates Workstream 2 at 3-5 sessions; Session 2 framed as "apply Session 1's card-list precedent + PerItemAnalysisBox component to Captured Image + Captured Video + extend their PATCH routes for the analysis field" landed cleanly within scope. Build commit `9747f63` shipped exactly the planned scope. No scope overrun; no fix-forward; no follow-up Workstream-2-Session-2b session needed. Mirrors Session 1's clean landing — two consecutive in-scope Workstream 2 sessions confirms the §C.2 plan + the Session 1 abstraction were both well-specced. Workstream 2 reaches the 50% mark (Sessions 1-2 of 3-5 complete); Sessions 3-5 cover Captured Reviews UI + URL-level Overall Competitor Analysis + per-category Overall Analysis boxes + new Type/Description-1/Description-2/Price URL fields + Scraping Status toggle + remove Sizes/Options UI + vklf.com-side upload/edit/delete affordances + edit-thumbnail affordance for videos.

- **Decision:** Workstream 2 Session 2 closed at code level. Next session begins Workstream 2 Session 3 per (a.73) RECOMMENDED-NEXT. Multiple §C.2-aligned candidates surface for Session 3's scope:
  - **(Recommended)** URL-level Overall Competitor Analysis box + per-category Overall Analysis boxes (one per capture category — Text / Image / Video / Reviews — at the bottom of each section). Consumes the same `RichTextEditor` wrapper Session 1 shipped; persists to `CompetitorUrl.overallCompetitorAnalysis` + `CompetitorUrl.overallAnalyses` from Workstream 1's schema (`overallAnalyses` is a JSON bag column where each category gets its own object key). Completes the "Analysis surface" arc across all capture levels — per-item analysis (Sessions 1-2) + per-category analysis (Session 3) + URL-level analysis (Session 3) — before moving to the structural URL-level fields in Session 4. This is the natural §C.2 next step before structural fields because it builds on the rich-text infrastructure that's already shipped and complete.
  - **(Alt)** Captured Reviews UI. New `CapturedReviewCard` matching Session 1/2's card-list shape + manual-add modal + flesh out the `CapturedReview` CRUD route from the Workstream 1 501-stub. Slots into the same card-list precedent established by Sessions 1-2. Bigger structural shift since Reviews is greenfield (no prior render to convert).
  - **(Alt)** New URL-level fields Type / Description-1 / Description-2 / Price (4 new text fields at the top of the URL box) + Scraping Status toggle (Incomplete / Complete; bidirectional mirror of the Competition Data table's Status column) + remove Sizes/Options UI (hide-UI-keep-data per Q6). Smaller individual changes but breaks more existing surfaces (URL box layout shift + Status column wiring).

  Director picks at Session 3 start per Rule 14f forced-picker; pointer file `docs/NEXT_SESSION.md` enumerates the candidates with the same rationale shape.

- **Impact on §A:** **None.** §A.5 + §A.12 + §A.15 (TipTap shared wrapper decisions) all confirmed again by this session's consumption of the wrapper without modification. §C.2 (Workstream 2 implementation outline) reaches the 50% completion mark — Sessions 1-2 of 3-5 done; Sessions 3-5 pending per the natural §C.2 sequencing. No §A amendment; §A stays frozen per Rule 18.

---

## §B 2026-05-27 — `session_2026-05-27_p46-workstream-2-session-3-url-level-and-per-category-overall-analysis-boxes` — Workstream 2 Session 3 completes the "Analysis surface" arc across all capture levels via NEW `OverallAnalysisBox` parallel component + new `isValidOverallAnalysesBag` strict-shape trust-boundary guard + bag-merge over replace at the `urls/[urlId]` PATCH; memorializes the "OverallAnalysisBox extraction" reusable Pattern as a parallel sibling to Session 1's "PerItemAnalysisBox extraction" Pattern

- **Director said:** general "proceed" / "go" directive at session start; explicitly picked Option A at the Rule 14f Session 3 scope picker. ZERO Rule 9 gates fired (no schema changes; no destructive ops). The session opened with a Rule 14f forced-picker between 3 §C.2-aligned candidates per the prior session's pointer-file enumeration; director confirmed Option A.

- **Rule 14f forced-picker outcome (session-start scope-pick — 3 candidates surfaced; director picked A):**
  - **(A) URL-level Overall Competitor Analysis box + per-category Overall Analysis boxes — recommended (CHOSEN).** Completes the "Analysis surface" arc across all capture levels (per-item Sessions 1-2 + per-category + URL-level this session) before moving to structural fields. Consumes already-shipped infrastructure (Session 1's `RichTextEditor` wrapper + Workstream 1's `overallCompetitorAnalysis` + `overallAnalyses` schema columns) without needing new components or new schema. Natural §C.2 next step after Sessions 1-2's per-item Analysis arc.
  - **(B) Captured Reviews UI alt.** New `CapturedReviewCard` matching Sessions 1-2's card-list shape + manual-add modal + flesh out `CapturedReview` CRUD route handlers Workstream 1 scaffolded as 501 stubs. Greenfield card type slots into the same card-list precedent; bigger structural shift since Reviews is greenfield (no prior render to convert). Deferred to Session 4.
  - **(C) New URL-level structural fields alt.** Type / Description-1 / Description-2 / Price (4 new text fields at the top of the URL box) + Scraping Status toggle + remove Sizes/Options UI. Smaller individual changes; touches more existing surfaces. Deferred to Session 4-5.

- **What landed (file-by-file recap matching build commit `4773b62` — 5 files +452/-1):**
  - **NEW `src/app/projects/[projectId]/competition-scraping/components/OverallAnalysisBox.tsx`** (~200 LOC) — URL-level + per-category Overall Analysis box. Parallels `PerItemAnalysisBox.tsx` (Session 1) but PATCHes the `urls/[urlId]` route with a `field` discriminator prop driving body shape: `{ kind: 'overallCompetitorAnalysis' }` emits `{ overallCompetitorAnalysis: <doc> }`; `{ kind: 'overallAnalyses', category: 'text'|'image'|'video'|'reviews' }` emits `{ overallAnalyses: { [category]: <doc> } }`. Same save-lifecycle as `PerItemAnalysisBox` (Saving… / ✓ Saved / Save failed indicators + generation-counter for stale-response handling). Reusable in Session 4 for the Overall Reviews Analysis box (category='reviews') without modification.
  - **MODIFIED `src/lib/rich-text/tiptap-helpers.ts`** (+37 LOC) — adds `isValidOverallAnalysesBag` trust-boundary guard (strict shape: rejects non-objects/null/arrays; rejects unknown keys to catch typos like `txet` at the boundary; requires each known-category value pass `isValidAnalysisPayload`) + `OVERALL_ANALYSES_CATEGORIES` constant + `OverallAnalysesCategory` type export. Deliberately strict per the design's Q5 "category bag should fail loud on typos" implication — choosing the most-thorough validation rather than allowing extra keys.
  - **MODIFIED `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/route.ts`** (+65 LOC) — extends PATCH allowlist for two new fields: `overallCompetitorAnalysis` (validated via existing `isValidAnalysisPayload`) + `overallAnalyses` (validated via new `isValidOverallAnalysesBag`). The `overallAnalyses` field **MERGES** the incoming partial bag onto the existing row's bag (reads `existingRow.overallAnalyses` first, then spreads incoming on top) so saving one category doesn't wipe sibling categories — required since per-category boxes each PATCH only their own slot.
  - **MODIFIED `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx`** (+65/-1) — threads `overallAnalysisInitial` prop through to `CapturedTextSubsection` + `CapturedImagesGallery` + `CapturedVideosGallery`; each subsection renders an `OverallAnalysisBox` at the bottom (category text/image/video). Page-level `OverallAnalysisBox` for `overallCompetitorAnalysis` renders after `CapturedVideosGallery` at page bottom. Imports `OverallAnalysisBox` alongside existing `PerItemAnalysisBox` import.
  - **MODIFIED `src/lib/rich-text/tiptap-helpers.test.ts`** (+88 LOC) — 10 new node:test cases for `isValidOverallAnalysesBag`: empty bag → true; one known category → true; all four known categories → true; null → false; array → false; primitive string → false; primitive number → false; primitive bool → false; unknown key like 'txet' → false; known key + null value → false; known key + array value → false; known key + primitive value → false. Documents the strict-shape guard's exact behavior so a regression there fails loud rather than corrupting a JSON column write. Test count 628 → 638 (+10).

- **Skipped sub-pickers (per `feedback_default_to_recommendation.md`):**
  - **Bag-merge over replace at the PATCH route.** The only valid choice — replace semantics would wipe sibling categories when saving one category at a time. No picker needed; the data shape forced the choice.
  - **Strict unknown-key rejection in `isValidOverallAnalysesBag`.** Most-thorough option per `feedback_recommendation_style.md` — catches typos like `txet` instead of `text` at the trust boundary rather than silently writing them through to the database where they'd accumulate as "unreachable" data. Picker skipped per default-to-recommendation.
  - **Parallel `OverallAnalysisBox` component over overloading `PerItemAnalysisBox` with a discriminator prop.** Both components are small (~150-200 LOC each); the wire contracts are different enough (per-row PATCH at `text/[textId]` vs URL-level PATCH at `urls/[urlId]` with bag-merge) that the parallel-component shape keeps each component's wire contract obvious at callsites. Overloading `PerItemAnalysisBox` with a "URL-level vs per-row" discriminator would have hidden the wire-contract distinction inside the component's render branch — clearer to have two siblings each with one obvious wire contract.

- **NEW reusable Pattern memorialized — "OverallAnalysisBox extraction":** **when a related-but-distinct edit affordance shares the same save-lifecycle shape as an existing component but has a different wire body shape, prefer a parallel component over overloading the existing one.** The new component duplicates the save-lifecycle skeleton (generation-counter for stale-response handling + Saving…/✓ Saved/Save failed UI indicators + on-blur flush via debounced save) but emits a different request body shape via a discriminator prop. Pairs with Session 1's "PerItemAnalysisBox extraction" Pattern memorialized in §B 2026-05-25. Together the two Patterns cover the full spectrum of save-lifecycle reuse: **(a) same wire contract, different `apiUrl` prop → reuse via `apiUrl` prop (Session 1's PerItemAnalysisBox Pattern)** — `PerItemAnalysisBox` covers 3 capture types so far (Text / Image / Video) with the 4th (Reviews) slotting in cleanly via the same `apiUrl` prop; **(b) different wire contract, same save-lifecycle → parallel component with discriminator prop (this session's OverallAnalysisBox Pattern)** — `OverallAnalysisBox` covers per-category Overall Analysis + URL-level Overall Competitor Analysis via the `field` discriminator. Choosing between the two Patterns at design time: if the wire body shape is identical and only the destination URL changes, use Pattern (a); if the wire body shape changes, use Pattern (b). Together they keep the save-lifecycle code DRY without forcing callsites to read a giant component's branch logic to understand its wire contract.

- **Verification scoreboard at new baselines:** root tsc clean / extension tsc clean / 558 ext UNCHANGED (extension untouched) / **638 src/lib node:test (+10 from baseline 628 — exact match with new `isValidOverallAnalysesBag` tests)** / **61 routes UNCHANGED** (no new routes; only extended existing `urls/[urlId]` PATCH allowlist); Check 6 Playwright SKIPPED per non-deploy-session convention.

- **Calibration data point — Session 3 estimate:** §C.2 of the design doc estimates Workstream 2 at 3-5 sessions; Session 3 framed as "URL-level + per-category Overall Analysis boxes — completes the Analysis surface arc" landed cleanly within scope. Build commit `4773b62` shipped exactly the planned scope (5 files +452/-1 = 1 new component + 1 helper extension + 1 route allowlist extension + 1 UI integration + 1 test extension). No scope overrun; no fix-forward; no follow-up Workstream-2-Session-3b session needed. **Three consecutive in-scope Workstream 2 sessions (1, 2, 3) confirms the §C.2 plan + the Session 1 abstraction were both well-specced.** Workstream 2 reaches the ~70% mark (Sessions 1-3 of 3-5 complete); Sessions 4-5 cover Captured Reviews UI + new Type/Description/Price URL fields + Scraping Status toggle + remove Sizes/Options UI + vklf.com-side upload/edit/delete affordances + edit-thumbnail affordance for videos.

- **P-43 cwd-leak class re-reproduction (LOW informational; same shape as prior closing entries):** during /scoreboard Check 5, `npm run build` ran the EXTENSION build instead of the Next.js build because Checks 2+3 had legitimately `cd`'d to `extensions/competition-scraping/` for the extension tsc + extension test runs. The output showed extension build artifacts (`extension built in 1.5s, 757 kB total`) — caught immediately. Recovered with absolute `cd /workspaces/brand-operations-hub && npm run build` which produced the expected 61-route Next.js build. Same LOW informational pattern as multiple prior reproductions (2026-05-22-g + 2026-05-22-h + 2026-05-22-i + 2026-05-24 closing entries). Reinforces P-43's standing observation: template hardening protects verbatim-template-read pathways but NOT Claude's inline-typed shortcuts. No additional template work needed; recovery is fast (one absolute-path `cd` away). Captured here as informational observation rather than promoted to CORRECTIONS_LOG since the pattern is already well-documented + the shape of "extension build ran instead of Next.js build because cwd drifted" is recognized on sight + recovery is single-command.

- **Decision:** Workstream 2 Session 3 closed at code level. Next session begins Workstream 2 Session 4 per (a.74) RECOMMENDED-NEXT. Two §C.2-aligned candidates remain for Session 4's scope:
  - **(Recommended)** Captured Reviews UI. New `CapturedReviewCard` matching Sessions 1-3's card-list shape + manual-add modal + flesh out `CapturedReview` CRUD route handlers Workstream 1 scaffolded as 501-stubs. Reviews is the last capture type missing UI; landing this fills the last greenfield gap before structural fields. Recommended because §C.2 originally sequenced this as Session 3 of Workstream 2 — natural next §C.2 step after the Analysis surface arc completion. The new `CapturedReviewsSection` can consume the existing `OverallAnalysisBox` component with `kind='overallAnalyses'` `category='reviews'` for the Overall Reviews Analysis box at the bottom of the section — no new component needed for that.
  - **(Alt)** New URL-level structural fields Type / Description-1 / Description-2 / Price (4 new text fields at the top of the URL box) + Scraping Status toggle (Incomplete / Complete; bidirectional mirror of the Competition Data table's Status column) + remove Sizes/Options UI (hide-UI-keep-data per Q6). Smaller individual changes but breaks more existing surfaces (URL box layout shift + Status column wiring).

  Director picks at Session 4 start per Rule 14f forced-picker; pointer file `docs/NEXT_SESSION.md` enumerates the candidates with the same rationale shape.

- **Impact on §A:** **None.** §A.5 (TipTap library decision) + §A.11 (schema additions including `overallCompetitorAnalysis` + `overallAnalyses` bag column) + §A.12 (TipTap as platform-shared dependency) + §A.15 (per-item Analysis pattern) all confirmed again by this session's consumption of the existing infrastructure without modification. §C.2 (Workstream 2 implementation outline) reaches the ~70% completion mark — Sessions 1-3 of 3-5 done; Sessions 4-5 pending per the natural §C.2 sequencing. No §A amendment; §A stays frozen per Rule 18.

---

## §B 2026-05-28 — `session_2026-05-28_p46-workstream-2-session-4-captured-reviews-ui` — Workstream 2 Session 4 lands the Captured Reviews UI end-to-end (the last greenfield capture type missing UI) + relocates W1's nested per-record stub to the shallow precedent path + memorializes the "Per-record handler DI-seam precedent extension" reusable Pattern

- **Director said:** general "proceed" / "go" directive at session start; explicitly picked Option A at the Rule 14f Session 4 scope picker. ZERO Rule 9 gates fired (no schema changes; no destructive ops). The session opened with a Rule 14f forced-picker between 2 §C.2-aligned candidates per the prior session's pointer-file enumeration; director confirmed Option A.

- **Rule 14f forced-picker outcome (session-start scope-pick — 2 candidates surfaced; director picked A):**
  - **(A) Captured Reviews UI — recommended (CHOSEN).** New `CapturedReviewCard` matching Sessions 1-3's card-list shape + manual-add modal so the director can enter reviews by hand on vklf.com (no extension Reviews capture in v1 per Q1's deferral) + flesh out the `CapturedReview` CRUD route handlers Workstream 1 scaffolded as 501 stubs. Greenfield card type slots into the same card-list precedent. Recommended because §C.2 originally sequenced this as Session 3 of Workstream 2 — natural next §C.2 step after the Analysis surface arc completion in Session 3. Reviews is the only capture type that doesn't yet have UI; landing this fills the last greenfield gap before structural fields. The new `CapturedReviewsSection` consumes the existing `OverallAnalysisBox` component with `kind='overallAnalyses'` `category='reviews'` for the Overall Reviews Analysis box at the bottom of the section — exactly the natural slot the Session 3 design left open for the 4th category.
  - **(B) New URL-level structural fields — alt.** Type / Description-1 / Description-2 / Price + Scraping Status toggle + remove Sizes/Options UI. Deferred to Session 5 (the last §C.2 sub-scope remaining for Workstream 2 after Session 4 lands Reviews).

- **W1 path-divergence finding (informational; resolved within-session via architectural move):** at pre-build read step, when reading W1's `CapturedReview` route 501-stubs scaffolded at `urls/[urlId]/reviews/route.ts` (collection) + `urls/[urlId]/reviews/[reviewId]/route.ts` (per-record), Claude noticed that the **per-record path diverges from the precedent set by the other 3 capture types**. The other 3 capture types' per-record PATCH/DELETE routes live at the SHALLOW path (`text/[textId]` / `images/[imageId]` / `videos/[videoId]`) because the record ID is globally unique within the workflow + the deeper path adds no security. W1 likely scaffolded the per-record review route at the nested path by following the collection route's path shape unreflexively. The divergence was caught at this session's start + resolved within-session via an architectural move (see below) at zero migration cost (the W1 nested 501-stub had no production traffic + no consumer; the move is a 1-file-delete + 1-file-add at the new shallow path).

- **Architectural move executed within-session:** **deleted** `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews/[reviewId]/route.ts` (W1's nested 501-stub); **created** `src/app/api/projects/[projectId]/competition-scraping/reviews/[reviewId]/route.ts` (the new per-record route at the shallow precedent path); the **collection route stays at the deeper path** `urls/[urlId]/reviews/route.ts` matching collection-route precedent (`urls/[urlId]/text/route.ts` + `urls/[urlId]/images/route.ts` + `urls/[urlId]/videos/route.ts` — because parent-URL ownership lookup naturally lives at the deeper collection path; only the per-record routes live at the shallow path). The build-commit message explicitly calls out the path-relocation so future readers see the architectural rationale at the commit level.

- **What landed (file-by-file recap matching build commit `82d390a` — 9 files +2350/-69):**
  - **NEW `src/lib/competition-scraping/handlers/url-reviews.ts`** (~295 LOC) — DI seam for the captured-reviews-under-URL collection handlers (POST + GET) following the `url-text.ts` P-31 pattern. Includes `CapturedReviewRow` type + `UrlReviewsPrismaLike` minimal Prisma surface + `UrlReviewsHandlerDeps` factory deps; `toWireShape` coercing Date → ISO string and Json → string[] / Record; GET handler with 401 / 404 / 500 happy-path and `orderBy [{ addedAt: 'asc' }]`; POST handler validating `clientId` (non-empty string) + `starRating` (integer in [1, 5]) + `body` (non-empty string) + `tags` (string array) + `reviewerName` (string|null) + `reviewDate` (ISO date string|null|empty→null) + `analysis` (trust-boundary via `isValidAnalysisPayload`) + `source` (defaults to 'manual'); 404 on parent-URL-not-found; 201 happy; 200 idempotent on Prisma P2002 unique-constraint violation (looks up existing row by `clientId` and returns it); 500 on unhandled errors with `recordFlake`.
  - **NEW `src/lib/competition-scraping/handlers/url-reviews.test.ts`** (~408 LOC) — 17 new node:test cases mirroring the `url-text.test.ts` shape: POST 401 / 400 invalid JSON / 400 clientId missing / 400 starRating missing / 400 starRating out of range / 400 starRating non-integer / 400 body empty / 400 tags wrong / 400 reviewDate unparseable / 400 analysis null / 404 parent not found / 201 happy / 200 idempotent P2002 / 500 unhandled + GET 401 / 404 / 200 with orderBy contract.
  - **NEW `src/lib/competition-scraping/handlers/reviews-by-id.ts`** (~290 LOC) — DI seam for the per-record captured-review PATCH + DELETE handlers. **Sets a NEW PRECEDENT** — the text/[textId] / images/[imageId] / videos/[videoId] per-record routes were direct-shape (no DI seam); this session extracts per-record handlers to a DI seam because the analysis-field trust boundary + the per-field allowlist warrant unit coverage at the handler layer. Allowlisted PATCH fields: `starRating` (integer 1-5) / `body` (non-empty string) / `reviewerName` (string|null) / `reviewDate` (ISO date string|null) / `tags` (string[]) / `analysis` (trust-boundary via `isValidAnalysisPayload`). Ownership check via `findFirst` with the relation filter `competitorUrl: { projectWorkflowId }`. P2025 errors map to 404 (PATCH) or 200 idempotent (DELETE).
  - **NEW `src/lib/competition-scraping/handlers/reviews-by-id.test.ts`** (~350 LOC) — 15 new node:test cases: PATCH 401 / 400 invalid JSON / 404 not-found / 400 starRating out-of-range / 400 body empty / 400 analysis array / 400 tags wrong / 400 reviewDate unparseable / 200 happy / 200 analysis-only / 404 P2025 + DELETE 401 / 200 not-found-idempotent / 200 happy / 200 P2025-idempotent.
  - **MODIFIED `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews/route.ts`** (was W1's 501-stub; now ~82 LOC thin shim) — replaces 501-stub with thin shim adapting `makeUrlReviewsHandlers` to NextRequest/NextResponse + CORS, mirroring the text route shim exactly.
  - **NEW `src/app/api/projects/[projectId]/competition-scraping/reviews/[reviewId]/route.ts`** (~80 LOC thin shim) — per-record PATCH + DELETE thin shim at the SHALLOW PRECEDENT PATH (the architectural-move destination).
  - **DELETED `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/reviews/[reviewId]/route.ts`** — W1's nested-path 501-stub (the architectural-move source).
  - **NEW `src/app/projects/[projectId]/competition-scraping/components/CapturedReviewAddModal.tsx`** (~479 LOC) — manual-add modal mirroring `CapturedTextAddModal.tsx` structure but with a 1-5 star-rating picker widget (5 buttons rendered as ☆ / ★ with click-to-select + "Pick 1–5" / "N of 5" inline label) + body textarea + reviewer-name text input + native HTML date input + tags input (comma-separated → string[]). Idempotent on `clientId` via `crypto.randomUUID()`. Save button disabled until both `starRating` AND `body` are populated.
  - **MODIFIED `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx`** (+398 LOC; ~1851 → ~2249 lines) — threads `CapturedReview` + `ListCapturedReviewsResponse` types through the imports; imports `CapturedReviewAddModal` component; adds `reviewsSlot` state + reviews fetch to the parallel-fetches block (now 6 parallel reads); adds `handleReviewAdded` + `handleReviewDeleted` callbacks (optimistic-remove + rollback shape mirroring text + image); renders `<CapturedReviewsSection>` between `<CapturedVideosGallery>` and the page-bottom `<OverallAnalysisBox>` for `overallCompetitorAnalysis`; NEW `CapturedReviewsSection` function (parent section with sort control + card list + manual-add modal + delete-confirm dialog + Overall Reviews Analysis box at bottom); NEW `CapturedReviewCard` function (per-card render: star-rating display via `StarRatingDisplay` helper + reviewer name + review date + body + trash + tags + addedAt + `PerItemAnalysisBox` below each card via `apiUrl` pointing at `competition-scraping/reviews/[reviewId]` — the new shallow per-record path); NEW `StarRatingDisplay` helper (read-only stars rendered as ★ filled / ☆ unfilled); NEW `CapturedReviewSortControl` function (sort by `addedAt` default or `starRating`; direction asc/desc).

- **Skipped sub-pickers (per `feedback_default_to_recommendation.md`):**
  - **The architectural move from W1's nested per-record path to the shallow precedent path.** Clear "most thorough/reliable" choice per `feedback_recommendation_style.md` — the divergence was a W1 oversight that breaks the precedent set by the other 3 capture types; resolving it within-session at zero migration cost was the obvious right call. No picker needed; the precedent forced the choice.
  - **Star-rating widget design.** 5 buttons rendered as ☆ / ★ with click-to-select is the canonical web star-rating shape (matches the Amazon / Yelp / Google Reviews precedent). No picker needed.
  - **Sort-key set for the Captured Reviews section.** `addedAt` default (matching Captured Text precedent) + `starRating` as the type-natural secondary key (matching the precedent shape "default by added time + a secondary key in the type-natural direction"). No picker needed; the precedent forced the choice.
  - **DI-seam extraction for per-record handlers (vs. direct-shape like text/[textId] / images/[imageId] / videos/[videoId]).** The analysis-field trust boundary + the per-field allowlist warrant unit coverage at the handler layer without needing to mock Next.js; DI-seam extraction is the most-thorough choice per `feedback_recommendation_style.md`. No picker needed.

- **NEW reusable Pattern memorialized — "Per-record handler DI-seam precedent extension":** **Sessions 1-2 retroactively extended PATCH allowlists on existing direct-shape route files (text/[textId] / images/[imageId] / videos/[videoId]); Session 4 sets a new precedent of extracting per-record handlers behind a DI seam matching the P-31 collection-route pattern when the per-field allowlist has a non-trivial trust boundary.** Here the trust boundary is the `analysis`-field `isValidAnalysisPayload` guard + the `starRating` integer-in-[1,5] guard + the `reviewDate` ISO-string parsing + the `tags` array-of-strings guard. The benefit: node:test cases load the handler directly via `node --test --experimental-strip-types` without needing to mock Next.js — Sessions 1-2's direct-shape PATCH allowlist extensions don't get this benefit (their test coverage lives elsewhere). Cost: slightly more boilerplate (factory + types + thin shim). **Worth it when the per-field allowlist warrants unit coverage at the handler layer; not worth it when the route is just CRUD without validation.** Pairs with §B 2026-05-25's "PerItemAnalysisBox extraction" Pattern + §B 2026-05-27's "OverallAnalysisBox extraction" Pattern — together the three Patterns capture the full set of extraction shapes Workstream 2 has empirically discovered: (a) component reuse via `apiUrl` prop (Session 1) for save-lifecycle code shared across capture types with the same wire contract; (b) parallel component with discriminator prop (Session 3) for save-lifecycle code shared across components with different wire contracts; (c) handler DI-seam extraction (Session 4) for route-handler code with non-trivial trust-boundary validation that warrants unit coverage at the handler layer. Future workstreams + future capture types can apply these three Patterns together as a planning lens for extraction shapes.

- **Verification scoreboard at new baselines:** root tsc clean / extension tsc clean / 558 ext UNCHANGED (extension untouched) / **670 src/lib node:test (+32 from baseline 638 — exact match with 17 new url-reviews + 15 new reviews-by-id handler tests)** / **61 routes UNCHANGED** (deleted W1 nested per-record stub + added new shallow per-record route = net 0; the collection 501→DI-shim is a path already counted at the 61-routes baseline); Check 6 Playwright SKIPPED per non-deploy-session convention.

- **Calibration data point — Workstream 2 Session 4 estimate:** §C.2 of the design doc estimates Workstream 2 at 3-5 sessions; Session 4 framed as "Captured Reviews UI — the last greenfield capture type missing UI" landed cleanly within scope. Build commit `82d390a` shipped exactly the planned scope (9 files +2350/-69 = 2 new handler modules + 2 new test modules + 1 thin-shim + 1 new per-record route at shallow path + 1 deleted W1 nested stub + 1 new modal + 1 UI integration). No scope overrun; no fix-forward; no follow-up Workstream-2-Session-4b session needed. **Four consecutive in-scope Workstream 2 sessions (1, 2, 3, 4) confirm the §C.2 plan is well-specced + the three extraction Patterns (PerItemAnalysisBox + OverallAnalysisBox + per-record handler DI-seam) cover the extraction-shape spectrum cleanly.** Workstream 2 reaches the ~85% mark (Sessions 1-4 of 3-5 complete); Session 5 covers the URL-level structural fields (Type / Description-1 / Description-2 / Price + Scraping Status toggle + remove Sizes/Options UI) as the last §C.2 sub-scope remaining for Workstream 2 before the Workstream 2 deploy session.

- **Decision:** Workstream 2 Session 4 closed at code level. Next session begins Workstream 2 Session 5 per (a.75) RECOMMENDED-NEXT. Session 5's scope is the last §C.2 sub-scope remaining for Workstream 2:
  - **(Recommended)** New URL-level structural fields. Type / Description-1 / Description-2 / Price (4 new text fields at the top of the URL box) + Scraping Status toggle (Incomplete / Complete; bidirectional mirror of the Competition Data table's Status column) + remove Sizes/Options UI (hide-UI-keep-data per Q6). Touches the existing `urls/[urlId]` PATCH route allowlist (extend for 4 new text fields + 1 enum) + render new field group at top of URL box in `UrlDetailContent.tsx` + hide Sizes/Options UI + wire Status column bidirectional mirror. Likely 6-10 new node:test cases.

  Director picks at Session 5 start per Rule 14f forced-picker (the recommendation is locked + the only candidate; the picker is operational courtesy rather than a real choice); pointer file `docs/NEXT_SESSION.md` describes the scope.

- **Impact on §A:** **None.** §A.11 (schema additions including the `CapturedReview` Prisma model + the `overallAnalyses` JSON bag with the `reviews` slot) confirmed again by this session's consumption of the existing infrastructure without modification. §C.2 (Workstream 2 implementation outline) reaches the ~85% completion mark — Sessions 1-4 of 3-5 done; Session 5 pending per the natural §C.2 sequencing. No §A amendment; §A stays frozen per Rule 18.

---

## §B 2026-05-23-b — `session_2026-05-23-b_p46-workstream-2-session-5-url-level-structural-fields` — Workstream 2 Session 5 lands the URL-level structural fields + Scraping Status toggle + Sizes/Options UI removal + Status column bidirectional mirror; closes Workstream 2 at code level; memorializes the "Field-allowlist subset extraction" reusable Pattern

- **Director said:** general "proceed" / "go" directive at session start; explicitly picked Proceed at the Rule 14f Session 5 operational scope picker. ZERO Rule 9 gates fired (no schema changes; no destructive ops; no main push). The session opened with a Rule 14f forced-picker confirming Session 5's scope (the only §C.2 sub-scope remaining for Workstream 2); per `feedback_default_to_recommendation.md` the per-§C.2-scope sub-picker was skipped — only one valid scope remained.

- **Rule 14f session-start operational scope-pick outcome:** **director picked Proceed.** Session 5's scope is the URL-level structural fields (Type / Description-1 / Description-2 / Price + Scraping Status toggle + remove Sizes/Options UI + add Status column to Competition Data table) — the only §C.2 sub-scope remaining for Workstream 2 after Sessions 1-3 covered the Analysis surface arc + Session 4 covered Reviews. Per `feedback_default_to_recommendation.md` the per-§C.2-scope sub-picker was skipped — Session 5's scope is forced by the §C.2 plan.

- **What landed (file-by-file recap matching build commit `374f1a3` — 6 files +669/-109):**
  - **NEW `src/lib/competition-scraping/url-structural-fields-validation.ts`** (~105 LOC) — pure trust-boundary helper `extractUrlStructuralFieldsPatch(body)` returning `{ ok: true, patch } | { ok: false, error }`. Trim-or-null normalization for the 4 text fields (`type` / `description1` / `description2` / `price`); strict enum-acceptance for `scrapingStatus` via existing `isScrapingStatus` type guard. Extracted from the route into `src/lib/competition-scraping/` so node:test exercises production code path without Next.js/Prisma.
  - **NEW `src/lib/competition-scraping/url-structural-fields-validation.test.ts`** (~218 LOC; **22 new node:test cases**) — empty body / null body / non-object body / each text field's trim-or-null normalization (including non-string coercion + explicit-null pass-through) / each scrapingStatus enum branch (INCOMPLETE / COMPLETE / case-mismatch / unknown enum / null / non-string) / all-5-set / unknown-key-ignored / omitted-vs-explicit-null discrimination / scrapingStatus short-circuit on invalid enum.
  - **MODIFIED `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/route.ts`** (+15 net) — import + call `extractUrlStructuralFieldsPatch`; spread `structuralResult.patch` onto the Prisma `data` payload; forward `structuralResult.error` as 400 on invalid scrapingStatus. Replaces ~50 LOC of inline per-field normalization initially written and then refactored out into the helper for testability.
  - **MODIFIED `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/EditableField.tsx`** (+210/-22) — `EditableTextField` gains optional `multiline` + `rows` props rendering `<textarea>` instead of `<input>` when `multiline: true`; suppresses the shell's Enter-to-save via `stopPropagation` on the textarea's onKeyDown so Enter inserts a newline (Esc still bubbles to the shell to cancel; used for the two `db.Text` description columns); NEW `FieldShell.readValueStyle` prop so multiline read-mode can use `whiteSpace: pre-wrap + wordBreak: break-word` for saved newlines; NEW generic `EditableEnumField<T extends string>` component — segmented-control over a fixed option set; single-click optimistic write with error rollback (same shape as `EditableBooleanField` but generic over enum string-unions); aria-correct role=radiogroup + role=radio + aria-checked; used for the Scraping Status toggle + reusable by Workstream 3 for click-to-edit enum cells; NEW style constants `textareaStyle` (resize: vertical; min-height 60px) + `multilineReadValueStyle`.
  - **MODIFIED `src/app/projects/[projectId]/competition-scraping/url/[urlId]/components/UrlDetailContent.tsx`** (+168 net) — adds `ScrapingStatus` type import; removes `CompetitorSize` + `ListCompetitorSizesResponse` imports; removes `sizesSlot` state + `setSizesSlot` setter; removes `sizes` from the parallel-reads block (5 fetches now instead of 6; the comment annotates the §A.6 hide-UI-keep-data reasoning); removes the `<SizesSubsection />` render call + the `SizesSubsection` function definition (~45 lines) + the now-unused `tableStyle` / `thStyle` / `cellStyle` / `formatMoney` helpers (all only used by SizesSubsection — confirmed via grep before deletion); adds `EditableEnumField<ScrapingStatus>` rendering the Scraping Status toggle as a prominent full-width strip above the field grid; adds `EditableTextField` for Type + Price into the existing auto-fill repeat grid (alongside Product Name / Brand Name / Category / etc.); adds Description-1 + Description-2 as full-width multiline `EditableTextField` rows below the grid (db.Text columns deserve room to breathe; `rows=3` each); adds `SCRAPING_STATUS_OPTIONS` constant — `[{value: 'INCOMPLETE', label: 'Incomplete'}, {value: 'COMPLETE', label: 'Complete'}]`.
  - **MODIFIED `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx`** (+51 net) — adds `scrapingStatus` to SortKey union; adds it to COLUMNS array with `label: 'Status'` + `filterKey: null` (per-column filtering for Status defers to Workstream 3 with the rest of the table redesign); adds matching `<td>` cell rendering a color-coded pill (green Complete / gray Incomplete) via new `scrapingStatusBadgeStyle(status)` helper; column positioned second-from-left after URL (workflow state indicator deserves prominent placement); updates the file's leading doc-block to reflect the new column lineup.

- **Skipped sub-pickers (per `feedback_default_to_recommendation.md`):**
  - **Field-allowlist subset extraction over inline route normalization.** Most-thorough per `feedback_recommendation_style.md` — production code path exercised by node:test without paying the boilerplate of a whole DI-seam handler. No picker needed.
  - **Description-1 + Description-2 as full-width multiline below the grid (not grid cells).** Most-thorough for db.Text content readability. The two Description fields warrant more vertical room than a grid cell allows. No picker needed.
  - **Scraping Status as full-width strip above the grid (not a grid cell).** Most-prominent placement for the workflow state indicator. Status drives whether a URL has been fully analyzed; deserves top-of-box placement. No picker needed.
  - **Status column second-from-left in UrlTable (after URL).** Most-prominent UX precedent — workflow state indicators belong near the row identifier, not buried in trailing columns. No picker needed.
  - **`EditableEnumField` as generic segmented control (not extending `EditableBooleanField` with options).** Reusable by Workstream 3's enum cells without enum→boolean coercion gymnastics. Generic over `T extends string` so any string-union enum type works. No picker needed.
  - **Sizes/Options dead-code full deletion (not commented-out).** Matches the project rule "If you are certain that something is unused, you can delete it completely"; Git history preserves reversibility per §A.6 hide-UI-keep-data intent — underlying `CompetitorSize` table data + the table itself stay in the database; only the UI is gone. No picker needed.

- **NEW reusable Pattern memorialized — "Field-allowlist subset extraction":** **When a small subset of PATCH-allowlist fields deserves trust-boundary unit coverage without needing a whole handler DI seam, extract a pure `extractXFieldsPatch(body)` helper that returns an `{ ok, patch } | { ok, error }` discriminator the route spreads onto its Prisma update payload.** Smaller granularity than Session 4's "Per-record handler DI-seam precedent extension" Pattern — covers the spectrum from "whole handler DI seam" (Session 4) to "field-subset pure helper" (this session) to "single-field type-guard" (existing `isScrapingStatus` / `isPlatform`). The benefit: production code is exercised by node:test (the helper is the production path) without paying the boilerplate of a whole DI-seam handler. Cost: a small extra file + a small extra import in the route. Worth it when the field subset has non-trivial normalization or enum acceptance logic that warrants direct test coverage; not worth it when the field is a single primitive validated by an existing type-guard. **Pairs with §B 2026-05-25's "PerItemAnalysisBox extraction" Pattern + §B 2026-05-27's "OverallAnalysisBox extraction" Pattern + §B 2026-05-28's "Per-record handler DI-seam precedent extension" Pattern — together the four Patterns give Workstream 2 a memorialized extraction-shape vocabulary spanning UI component reuse via `apiUrl` prop (Session 1) / UI parallel component with discriminator prop (Session 3) / handler DI-seam extraction (Session 4) / field-subset pure helper (Session 5).** Future workstreams + future capture types can apply these four Patterns together as a planning lens for extraction shapes.

- **Verification scoreboard at new baselines:** root tsc clean / extension tsc clean / 558 ext UNCHANGED (extension untouched) / **692 src/lib node:test (+22 from baseline 670 — exact match with new `url-structural-fields-validation` tests)** / **61 routes UNCHANGED** (no new routes; only extended existing `urls/[urlId]` PATCH allowlist); Check 6 Playwright SKIPPED per non-deploy-session convention.

- **Calibration data point — Workstream 2 ~100% complete (Sessions 1-5 of 3-5 estimated all DONE):** §C.2 of the design doc estimates Workstream 2 at 3-5 sessions; Workstream 2 came in at the top end of the range (5 sessions) but no overrun. Each session landed cleanly within scope; no fix-forward; no follow-up sub-session needed. Build commit `374f1a3` shipped exactly the planned scope (6 files +669/-109 = 1 new helper module + 1 new test module + 1 route extension + 1 EditableField extension + 1 UrlDetailContent rewrite + 1 UrlTable column addition). **Workstream 2's implementation arc reaches 100% complete at code level — Session 1 shipped the foundation (TipTap wrapper + per-item Analysis on Captured Text); Session 2 extended the pattern to Image + Video; Session 3 completed the Analysis surface arc with per-category + URL-level Overall Analysis boxes; Session 4 landed Reviews as a first-class capture type; Session 5 closes Workstream 2 with the URL-level structural fields + Scraping Status toggle + Sizes/Options removal + Status column mirror.** The four memorialized extraction-shape Patterns across Sessions 1/3/4/5 give the project a small but useful planning lens for future workstreams + future capture types.

- **Date-stamping anomaly informational observation:** today's date per director confirmation at session start is **2026-05-23**, but the doc-history's recent session stamps run 2026-05-24 (Workstream 1) → 2026-05-25 (Session 1) → 2026-05-26 (Session 2) → 2026-05-27 (Session 3) → 2026-05-28 (Session 4). Session suffix `-b` per Rule 14 disambiguates today's session against the original 2026-05-23 design session. Either the prior 5 sessions' date stamps were forward-dated (the Codespace's system clock running ahead of director's wall clock) or the director's understanding of today's date diverges from elapsed-time accounting. Captured here as informational; not promoted to a separate corrections-tier §Entry; no remediation needed beyond the suffix discipline. The director was asked at session start and confirmed 2026-05-23. See CORRECTIONS_LOG §Entry 2026-05-23-b for the full informational text.

- **P-43 cwd-leak class re-reproduced ONCE during /scoreboard execution (LOW informational; paired with the §B 2026-05-27 entry's same observation):** Check 2's parallel `cd /workspaces/brand-operations-hub/extensions/competition-scraping && npx tsc --noEmit` left cwd in the extension dir; Check 5's `npm run build` from the drifted cwd ran the EXTENSION build instead of Next.js (output showed `Built extension in 1.387 s` with `757.27 kB` total instead of the Next.js route table). Caught immediately from output content + recovered with absolute `cd /workspaces/brand-operations-hub`. Same LOW informational pattern; template hardening protects verbatim-template-read pathways but NOT Claude's inline-typed shortcuts. NOT promoted to a separate corrections-tier §Entry.

- **Decision:** Workstream 2 implementation arc complete at code level. Next session: **Workstream 2 deploy session.** Phase-4 deploy ff-merging `workflow-2-competition-scraping` → `main` (carries Workstream 1's schema commits + Sessions 1-5's UI/route commits as one fast-forward); Vercel auto-redeploy fires; ping-pong sync back to `workflow-2-competition-scraping`; Phase-4 director real-Chrome cross-platform verify covering all 5 surfaces landed by Sessions 1-5 (vertical card lists with per-item Analysis on Captured Text/Image/Video/Reviews + per-category + URL-level Overall Analysis boxes + Captured Reviews UI end-to-end + manual-add Reviews modal + 4 new URL-level structural text fields + Scraping Status toggle + Status column on the Competition Data table + Sizes/Options UI gone); schema-change-in-flight flag flips YES → NO at deploy completion.

- **Impact on §A:** **None.** §A stays frozen per Rule 18. §A.6 (Sizes/Options hide-UI-keep-data) confirmed by this session's UI-deletion + data-preservation execution. §A.7 (Competition Score number-input-only) untouched — out of Session 5's scope. §A.8 (Status column bidirectional mirror via `CompetitorUrl.scrapingStatus` enum) confirmed by this session's column-level mirror implementation. §A.11 (schema additions) confirmed again — Session 5 consumed Workstream 1's existing schema columns (`type` / `description1` / `description2` / `price` / `scrapingStatus`) without modification. §C.2 (Workstream 2 implementation outline) reaches 100% completion — all sub-scopes landed; no §C.2 amendment needed.

- **Closing line:** Workstream 2 implementation arc complete at code level. Next session: Workstream 2 deploy.

---

## §B 2026-05-23-c — `session_2026-05-23-c_p46-workstream-2-deploy-session` — Workstream 2 DEPLOY SESSION ships Workstream 1's schema-aware code + Sessions 1-5's UI/route work to vklf.com end-to-end via ff-merge `783abf4..9969427` + Phase-4 6/6 surfaces PASS; memorializes the "Multi-session workstream deploy gate timing" reusable Pattern

- **Session shape:** DEPLOY session (canonical 4-phase /deploy orchestration). Pure orchestration — no new code, no new schema, no new dependencies, no fresh extension zip. The 4 phases ran cleanly with ONE Rule 9 gate fired for the deploy push.

- **Headline outcome:** **P-46 Workstream 2 ✅ DONE-AND-VERIFIED 2026-05-23-c end-to-end on vklf.com.** Phase-4 director real-Chrome cross-platform verification ALL 6 SURFACES PASS clean with zero caveats — director reported "all surfaces pass" — the cleanest end-of-workstream verification in any P-46 session. **Workstream 1 ✅ DONE-AND-VERIFIED 2026-05-23-c in the same ff-merge** (schema columns shipped via 2026-05-24 `prisma db push` are now read+write-active in production after today's code deploy). Schema-change-in-flight flag FLIPPED YES → NO at deploy completion.

- **Phase 1 — Pre-deploy /scoreboard:** All 5 checks GREEN at exact Session 5 baselines — root tsc clean / extension tsc clean / 558 ext UNCHANGED / 692 src/lib UNCHANGED / 61 routes UNCHANGED. Check 6 Playwright SKIPPED via Rule 27 picker — director picked SKIP (recommended; the lone `extensions/` file in the ff-merge bundle is `captured-text-validation.test.ts` +11 lines, test-only, doesn't ship in the `.crx` runtime; the Workstream 2 deploy is purely server-side + web UI).

- **Phase 2 — Rule 9 director-Yes gate:** AskUserQuestion picker fired ONCE for `git push origin main`; director picked "Deploy now (recommended)".

- **Phase 3 — ff-merge + push + Vercel auto-redeploy + ping-pong sync:** `git checkout main && git merge --ff-only workflow-2-competition-scraping` succeeded clean; ff-merge range `783abf4..9969427` — **49 files +7504/-477** — 13 commits ff'd as one fast-forward:
  - `d364063` design-session doc-batch (2026-05-23)
  - `caad82a` Workstream 1 schema build (2026-05-24)
  - `fb19314` W1 doc-batch (2026-05-24)
  - `b6e43fe` W2 Session 1 build (2026-05-25)
  - `9f555d0` S1 doc-batch (2026-05-25)
  - `9747f63` S2 build (2026-05-26)
  - `070a7ee` S2 doc-batch (2026-05-26)
  - `4773b62` S3 build (2026-05-27)
  - `64084ae` S3 doc-batch (2026-05-27)
  - `82d390a` S4 build (2026-05-28)
  - `a8aa37b` S4 doc-batch (2026-05-28)
  - `374f1a3` S5 build (2026-05-23-b)
  - `9969427` S5 doc-batch (2026-05-23-b)

  Post-merge /scoreboard all 5 checks GREEN on main (tree-identity preserved through ff; Playwright SKIPPED per ff-merge-is-pointer-move convention). `git push origin main 783abf4..9969427` succeeded — Vercel auto-redeploy fired. Ping-pong sync: `git checkout workflow-2-competition-scraping && git merge --ff-only main` was a NO-OP (workflow-2 was already at `9969427` from the prior session's doc-batch push); `git push origin workflow-2-competition-scraping` returned "Everything up-to-date".

- **Phase 4 — Director real-Chrome cross-platform verify on vklf.com (ALL 6 SURFACES PASS):**
  1. **Captured Text section** (vertical card list + per-item Analysis editor with Saving / ✓ Saved indicator; persists on refresh) — **PASS** (Sessions 1 + 5 combined).
  2. **Captured Image section** (same shape) — **PASS** (Session 2).
  3. **Captured Video section** (same shape) — **PASS** (Session 2).
  4. **Captured Reviews section** (manual-add modal with 1-5 star picker + body + reviewer name + date + tags; per-item Analysis; Overall Reviews Analysis) — **PASS** (Session 4).
  5. **URL-level affordances** (4 new structural text fields Type / Description-1 / Description-2 / Price + Scraping Status toggle + Overall Competitor Analysis box at page bottom; Sizes/Options UI completely removed) — **PASS** (Session 5 + Session 3).
  6. **Competition Data table Status pill column** (second-from-left after URL; green Complete / gray Incomplete; bidirectionally mirrors the URL detail page toggle) — **PASS** (Session 5).

- **Schema-change-in-flight flag FLIPPED YES → NO at deploy completion.** Workstream 1's schema (3 new tables `CapturedReview` / `ComprehensiveCompetitorAnalysis` / `UserTablePreferences` + 8 new `CompetitorUrl` columns + 1 new `analysis` JSON column on each of CapturedText/Image/Video + 1 new `ScrapingStatus` enum) — live on Supabase since 2026-05-24 — now has production code reading + writing them on vklf.com. Existing rows render with empty new-field values per §A.11 "no data backfill needed". The flag stays NO until the next schema migration (likely Workstream 3 — `UserTablePreferences` model is already in place but the user-facing settings UI hasn't been built; Workstream 3 first build session may add settings UI without a new schema delta — TBD).

- **NEW reusable Pattern memorialized — "Multi-session workstream deploy gate timing":** When a workstream spans multiple build sessions (here: 1 schema + 5 UI sessions = 6 build sessions across 6 distinct calendar/session-letter dates), the deploy session should land AFTER the LAST build session that contains user-visible UI, not after the schema session. Three reasons:
  - (a) Deploying after the schema session alone gives no user-visible value but locks the schema-change-in-flight flag YES across the entire build arc (preventing flag-clear status at every intermediate build session). Under this Pattern the flag has minimal time-in-flight footprint — one NO→YES transition at the schema build + one YES→NO transition at the end-of-workstream deploy.
  - (b) Deploying after each build session multiplies the deploy-orchestration overhead 6x. One deploy ≈ 2 hours of pure orchestration; six deploys would be ≈ 12 hours.
  - (c) The END-TO-END user flow is verifiable in one Phase-4 walkthrough at the END of the build arc when ALL UI is in place. Verifying after the schema build alone gives no walkthrough (schema is server-side). Verifying after each UI build session would walk through partial UI (Session 2's Captured Image works but Session 4's Captured Reviews UI doesn't exist yet at that point). The end-of-arc Phase-4 walks through the COMPLETE user flow across all 6 surfaces in one continuous session — exactly what happened today.

  This Pattern pairs with the 2026-05-24 "Workstream Foundation Build Bundle" Pattern (schema + API shells + shared-types in one foundation build session) to give the full multi-session workstream deploy-cadence shape: **ONE foundation build + N UI builds + ONE end-of-workstream deploy.** Reusable by Workstreams 3-5 of P-46 + future multi-session workstreams (W#3-W#14 each likely follow this same cadence if well-specced via a frozen §A interview + §C per-workstream outlines like P-46 has).

- **Informational sub-observation A — P-43 cwd-leak class re-reproduced TWICE this session:** Both pre-deploy /scoreboard Check 5 + post-merge /scoreboard Check 5 ran the EXTENSION build instead of the Next.js root build because the parallel Checks 2+3 cd'd to `extensions/competition-scraping/` and Claude's inline-typed Check 5 didn't carry the `cd /workspaces/brand-operations-hub &&` prefix. Caught immediately from grep output of `0` routes (Next.js prints a route table; the extension build prints `Built extension in N s` + zip size) and recovered cleanly both times. Same LOW informational shape as the 2026-05-22-i + 2026-05-24 + 2026-05-27 reproductions. Reinforces P-43's standing observation that template hardening protects verbatim-template-read pathways but NOT Claude's inline-typed Bash shortcuts. NOT promoted to a separate corrections-tier §Entry — captured in CORRECTIONS_LOG §Entry 2026-05-23-c as a LOW informational sub-observation embedded in the deploy-closing entry.

- **Informational sub-observation B — Pointer-file off-by-one on main-tip SHA:** NEXT_SESSION.md (written by Session 5's end-of-session) said main was at `ee8c79d` (the 2026-05-22-i P-45 deploy BUILD commit) but actual main was at `783abf4` (the 2026-05-22-i DOC-BATCH which landed via the canonical 3-push pattern's post-deploy ping-pong sync — both main + workflow-2 end up at the doc-batch SHA after the prior session closes). The 13-commit ff-merge count was still correct. LOW informational; the deploy proceeded cleanly because the ff-merge from workflow-2 to main worked regardless of which SHA main was at. Pattern reminder for pointer-file writers: refer to the END SHA after the prior session's full doc-batch push (the "actual main tip"), not the build commit alone. The canonical 3-push pattern in `feedback_approval_scope_per_decision_unit.md` makes the doc-batch the LAST push of the session, so the doc-batch SHA is always the most recent SHA on both branches after a deploy session.

- **Calibration data point — Workstream 2 came in at the top end of estimate:** 5 build sessions vs. 3-5 estimated per §C.2. The §C.2 plan was well-specced; no overrun. Combined with Workstream 1's UNDER-estimate (1 session vs. 2-3 planned per §C.1), the total Workstream 1+2 spend is 6 build sessions + 1 deploy session = 7 sessions vs. 4-8 estimated (4 = W1 floor 2 + W2 floor 3; 8 = W1 ceil 3 + W2 ceil 5). Right on plan. Useful data point for sizing Workstream 3 (estimated 3-4 sessions per §C.3) — if §C.3 is similarly well-specced, expect 3-4 build sessions + 1 deploy session = 4-5 total.

- **Impact on §A: NONE.** §A stays frozen per Rule 18. The schema delta + 5 UI workstreams + interview answers Q1-Q10 all stayed exactly as specced in the design session 2026-05-23; no §A amendments needed during implementation. Confirms the §A frozen interview pattern produced a well-specced multi-workstream plan.

- **Impact on §C:** **§C.2 (Workstream 2 implementation outline) is now 100% COMPLETE** — all sub-scopes landed across Sessions 1-5 + deployed end-to-end today; no §C.2 amendment needed. **§C.3 (Workstream 3 — Competition Data table redesign) begins next session per (a.77) RECOMMENDED-NEXT.** **§C.4 + §C.5 (Workstreams 4 + 5) remain pending per Q10's locked sequencing.**

- **Cross-references:**
  - CORRECTIONS_LOG §Entry 2026-05-23-c — the operational-log twin of this §B entry; captures the deploy-closing observations + the same Pattern memorialization at the operational-log layer.
  - §B 2026-05-24 — Workstream Foundation Build Bundle Pattern (pairs with today's new Pattern to give the full multi-session-workstream deploy-cadence shape).
  - §B 2026-05-25 — PerItemAnalysisBox extraction Pattern (Session 1; first of Workstream 2's four memorialized extraction-shape Patterns).
  - §B 2026-05-27 — OverallAnalysisBox extraction Pattern (Session 3).
  - §B 2026-05-28 — Per-record handler DI-seam precedent extension Pattern (Session 4).
  - §B 2026-05-23-b — Field-allowlist subset extraction Pattern (Session 5; fourth + final of Workstream 2's memorialized extraction-shape Patterns).
  - §A.11 — schema additions confirmed live on Supabase since 2026-05-24 + read+write-active on vklf.com since today's deploy.
  - §C.2 — Workstream 2 implementation outline; 100% complete after today's deploy.
  - §C.3 — Workstream 3 implementation outline; begins next session.

- **Closing line:** Workstream 2 implementation arc complete end-to-end ✅ DONE-AND-VERIFIED on vklf.com. Workstream 1 also closes ✅ DONE-AND-VERIFIED. Next session: Workstream 3 first build session — Competition Data table redesign per §C.3.

---

END OF DOCUMENT
