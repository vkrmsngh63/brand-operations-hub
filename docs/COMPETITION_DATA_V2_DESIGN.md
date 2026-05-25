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

**RESOLVED 2026-05-25 — see ROADMAP P-49.** Director surfaced the long-promised follow-up to this deferral on 2026-05-25 with a comprehensive scope cluster covering all 4 platforms + 3 levels of AI-driven review analysis. Captured as **P-49 Reviews Phase 2** (hub-and-spokes structure analogous to P-46). Per-platform extraction details (Amazon `Customers say` block + per-star pagination URLs / eBay Neutral+Negative feedback mapping / Etsy overlay pagination / Walmart per-star `?ratings=N` query-param URLs + "View more" expander) preserved verbatim in the P-49 entry for ingestion into the future `docs/REVIEWS_PHASE_2_DESIGN.md` design doc that opens at the next session per (a.92).

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

## §B 2026-05-23-d — `session_2026-05-23-d_p46-workstream-3-session-1-table-preferences-and-column-visibility-bar` — Workstream 3 Session 1 lands the foundational `UserTablePreferences` plumbing + horizontal `ColumnVisibilityBar` + sidebar removal; path-convention refactor surfaced + executed at Rule 14f session-start; memorializes the "Foundation-workstream path-convention drift surfaced by next-workstream session-start picker" reusable Pattern

- **Session shape:** PURE BUILD session — no deploy, no schema change, no new dependencies, no fresh extension zip. First build session of the P-46 Workstream 3 implementation arc (Session 1 of 3-4 estimated per §C.3). Build commit `d846a97` — 10 files +1369/-224 on `workflow-2-competition-scraping`; NOT pushed to main since Session 1 is a build session.

- **Headline outcome:** **The foundational `UserTablePreferences` plumbing + horizontal `ColumnVisibilityBar` at the top of the Competition Data table + deletion of the left-side `PlatformSidebar` all landed cleanly.** Column visibility persists per-user-per-project via the auth-derived-userId path that matches every other W#2 project-scoped route; checkbox state syncs across devices via the `UserTablePreferences` Prisma model Workstream 1 shipped + the new route this session shipped. Sessions 2-3 build click-to-edit / new columns / column resize / drag-reorder / adjustable font on top of today's plumbing.

- **Rule 14f forced-pickers fired this session (two):**
  1. **Session-start scope-pick** (Workstream 3 Session 1 scope) — director picked "Preferences plumbing + checkbox bar (recommended)" (§C.3 Session 1 spec) over "New columns + click-to-edit foundation (alt)" + "Combine both". Recommended path because Sessions 2-3 build click-to-edit/drag-resize on top of this plumbing; landing it first means no double-rewriting of persistence later.
  2. **Path-convention refactor mid-session** (table-preferences API URL) — director picked "Refactor — match platform convention (recommended)" over "Keep current path, add ownership check". W1 explicitly flagged this in the 501-stub's comments verbatim: *"When Workstream 3 implements this route, enforce 'auth.userId === params.userId' at the auth check OR refactor to /api/projects/[projectId]/competition-scraping/table-preferences (auth-derived userId). Surface this as a §B refinement candidate before the implementation lands."* Refactor chosen for most-thorough/reliable per `feedback_recommendation_style.md` — removes the special-case URL shape; removes the auth.userId === params.userId double-check; matches extension-state + every other W#2 project-scoped route for callsite uniformity.

- **File-by-file recap matching build commit `d846a97` (10 files +1369/-224):**
  - **NEW** `src/lib/competition-scraping/handlers/user-table-preferences.ts` (~340 LOC DI-seam handler factory mirroring the `url-text.ts` / `reviews-by-id.ts` precedent). Exports `extractTablePreferencesPatch` (strict trust-boundary validator with field allowlist for the 6 editable fields per `WriteUserTablePreferencesRequest` — columnVisibility / columnWidths / fontSize / rowOrder / lastUsedSortColumn / lastUsedSortDirection — each strictly validated per §A.3) + `toWireShape` (Prisma JsonValue → typed wire shape coercion with bad-DB-shape fallbacks) + `makeUserTablePreferencesHandlers(deps)` factory returning GET + PUT.
  - **NEW** `src/lib/competition-scraping/handlers/user-table-preferences.test.ts` — 34 new node:test cases covering: extractTablePreferencesPatch validation across all 6 fields (incl. array + null + non-boolean + negative + non-integer + out-of-range rejection); toWireShape coercion + bad-DB defaults + filter-non-boolean-from-bool-map; GET auth-403/404/200/500; PUT auth-403/400-invalid-json/400-bad-shape/200-partial-patch/empty-patch/500-on-throw/null-sort preservation. src/lib count 692 → 726 (+34, exact match).
  - **NEW** `src/app/api/projects/[projectId]/competition-scraping/table-preferences/route.ts` (~70 LOC thin shim wiring DI seam to `verifyProjectAuth` + `withRetry` + `recordFlake` + `corsPreflightResponse` / `withCors`).
  - **DELETED** `src/app/api/users/[userId]/table-preferences/[projectId]/route.ts` — W1's 501-stub at the old path. Replaced by the new route at the auth-derived-userId convention path.
  - **NEW** `src/app/projects/[projectId]/competition-scraping/components/ColumnVisibilityBar.tsx` (~180 LOC horizontal bar with two checkbox groups — Platforms ("All Platforms" + 7 platforms single-select preserving all 7 from the deleted sidebar — toggling an active chip resets to 'all') + Columns (9 toggles from `TABLE_COLUMN_DEFS` multi-select); owns no state; exports `isColumnVisible(map, columnId)` with missing-key-default-true semantics matching §A.3).
  - **NEW** `src/app/projects/[projectId]/competition-scraping/components/url-table-columns.ts` (~35 LOC canonical `TABLE_COLUMN_DEFS` registry of 9 column id ↔ label pairs matching UrlTable's SortKey + `TABLE_COLUMN_IDS` Set + relocated `ScopeFilter` type from PlatformSidebar; stable id strings double as keys in `UserTablePreferences.columnVisibility` JSON).
  - **MODIFIED** `src/app/projects/[projectId]/competition-scraping/components/CompetitionScrapingViewer.tsx` (drops the 220px grid + sidebar layout for a vertical stack — bar above table; seeded `columnVisibility` state from GET `/api/projects/[projectId]/competition-scraping/table-preferences` at mount with silent 404/network fallback to empty map; `handleToggleColumn` with 500ms debounced PUT via `prefsTimerRef` so the latest body wins on burst toggles; imports `ScopeFilter` from `url-table-columns` after PlatformSidebar's deletion).
  - **MODIFIED** `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx` (adds optional `columnVisibility` prop; computes `visibleColumns` via `useMemo` filtering `COLUMNS` with missing-key-default-true semantics; extracts cell renderers into a `Record<SortKey, (row) => ReactNode>` map so the tbody iterates `visibleColumns.map((col) => cellRenderers[col.key](row))` without duplicate visibility branches per column; trash-button column stays unfiltered as row-action surface; updates leading doc-block).
  - **MODIFIED** `src/lib/shared-types/competition-scraping.ts` (doc-comment updates on `ReadUserTablePreferencesResponse` + `WriteUserTablePreferencesRequest` to reflect the new auth-derived path; wire shapes themselves unchanged — W1 already shipped them correctly).
  - **DELETED** `src/app/projects/[projectId]/competition-scraping/components/PlatformSidebar.tsx` (replaced by `ColumnVisibilityBar`).

- **NEW reusable Pattern memorialized — "Foundation-workstream path-convention drift surfaced by next-workstream session-start picker":** When a foundation workstream (here: P-46 Workstream 1) scaffolds a route at a path that diverges from the platform's convention (here: `/api/users/[userId]/table-preferences/[projectId]` vs. the auth-derived `/api/projects/[projectId]/competition-scraping/...` shape every other W#2 route uses), the foundation session SHOULD leave a clear "surface before next workstream lands" comment in the 501-stub body (which W1 did, verbatim quoted above). The next workstream's session-start SHOULD fire a Rule 14f forced-picker on the path before implementation lands — surfacing the divergence as a binary "refactor to convention" vs. "keep current path with ownership check" picker. Most-thorough/reliable per `feedback_recommendation_style.md` is virtually always the refactor (removes the special-case URL shape; removes the auth.userId === params.userId double-check; matches sibling routes for callsite uniformity), unless production traffic exists at the old path (here: zero — W1's stub returned 501; no rows in `UserTablePreferences`). The refactor cost is one file delete + one file add at the new path + one shim implementation — minimal at next-workstream time, growing-cost as workstream consumers pile on the old path.

  This Pattern **pairs with the 2026-05-28 §B entry's "W1 path-divergence finding + architectural-move resolution" Pattern** (nested per-record path `urls/[urlId]/reviews/[reviewId]` vs. shallow precedent path `reviews/[reviewId]`). Together they cover both **URL-shape drift** (this Pattern — userId in path vs. project-scoped auth-derived) + **nesting-depth drift** (Session 4's Pattern — nested vs. shallow per-record). Both share the meta-shape:
  - **Detect** at the foundation-workstream → next-workstream transition.
  - **Surface** as a Rule 14f forced-picker at next-workstream session start.
  - **Resolve** within-session via a path move (delete + new + shim) + announcement in the build commit message.
  - **Memorialize** in both the operational-log layer (CORRECTIONS_LOG §Entry — what + why) + the design-doc layer (§B append — pairs with §A.3 / §A.X reference).

  Reusable by Workstreams 4-5 of P-46 + future multi-workstream polish items.

- **Verification scoreboard at new baselines:** All 5 /scoreboard checks GREEN — root tsc clean / extension tsc clean / 558 ext UNCHANGED / **726 src/lib +34 from baseline 692** (exact match with 34 new user-table-preferences.test.ts cases) / **61 routes UNCHANGED** (new table-preferences route replaced deleted W1 stub, net 0). Check 6 Playwright SKIPPED per non-deploy-session convention.

- **Schema-change-in-flight flag STAYS NO** the entire session — no `prisma db push`; consumes existing Workstream 1 schema (`UserTablePreferences` model + columnVisibility/columnWidths/fontSize/rowOrder/lastUsedSortColumn/lastUsedSortDirection JSON columns already in place since 2026-05-24). **Default expectation: stays NO** through Sessions 2-3 (UI-only consuming existing schema). Re-evaluate if a new schema column surfaces during Sessions 2-3 planning (unlikely — the 12 new data columns are all already in `CompetitorUrl` from W1).

- **Calibration data point — Workstream 3 Session 1 sized correctly:** Session 1 of 3-4 estimated Workstream 3 sessions landed cleanly within scope. The §C.3 Session 1 spec was: (a) `UserTablePreferences` read/write at the Competition Data page level; (b) horizontal checkbox bar combining platform filters + per-column show/hide controls; (c) delete the left-side PlatformSidebar. All three landed; the path-convention refactor was an in-scope bonus catch (cost: one file delete + one file add + ~70 LOC shim — small relative to the ~1369 LOC session total). Useful continuation of the calibration discipline started in the 2026-05-23-c §B entry (Workstream 2 came in at top end of 3-5 estimate; combined W1+W2 = 7 sessions vs. 4-8 estimated). If §C.3 Sessions 2-4 are similarly well-specced, expect 3-4 build sessions + 1 deploy session = 4-5 Workstream 3 total (matching the §C.3 estimate).

- **Workstream 3 progress = 1 of 3-4 estimated sessions ✅ DONE-AT-CODE-LEVEL.** Sessions 2-3 remaining: Session 2 = click-to-edit cell editors per data type (text/number/decimal/enum/boolean/date/tags inline editors reusing Session 5's `EditableTextField` + `EditableEnumField<T>` from `EditableField.tsx`), potentially bundled with the ~12 new data columns since both touch UrlTable cell renderers (recommended bundling per `feedback_recommendation_style.md` — splitting them across sessions requires rewriting the cell-renderer map twice). Session 3 = column resize (drag column edges) + drag-to-reorder rows + adjustable font size. Then Workstream 3 deploy session ends the arc.

- **Impact on §A: NONE.** §A stays frozen per Rule 18. The Session 1 deliverables consume §A.3 (server-side per-user `UserTablePreferences` keyed by (userId, projectId)) + §A.X (horizontal checkbox bar with platforms + columns) exactly as specced; no §A amendments needed. The path-convention refactor is a §B refinement (W1 explicitly flagged it as such in the 501-stub comments) — not a §A amendment.

- **Impact on §C:** **§C.3 Session 1 is now 100% COMPLETE** — all 3 sub-scopes landed; **§C.3 Session 2 (click-to-edit cell editors per data type, potentially bundled with the 12 new columns) begins next session per (a.78) RECOMMENDED-NEXT.** §C.4 + §C.5 (Workstreams 4 + 5) remain pending per Q10's locked sequencing.

- **Cross-references:**
  - CORRECTIONS_LOG §Entry 2026-05-23-d — the operational-log twin of this §B entry; captures the path-convention refactor narrative + the same Pattern memorialization at the operational-log layer.
  - §B 2026-05-23-c — Workstream 2 deploy closing; the predecessor §B entry; "Multi-session workstream deploy gate timing" Pattern memorialized there applies to Workstream 3's eventual deploy session.
  - §B 2026-05-28 — Per-record handler DI-seam precedent extension + "When a foundation workstream scaffolds a 501-stub at a divergent path..." Pattern (the nesting-depth twin of today's URL-shape Pattern; together they cover both drift dimensions).
  - §B 2026-05-24 — Workstream Foundation Build Bundle Pattern (Workstream 1's `UserTablePreferences` model + the 501-stub with the path-convention warning comment was that session's foundation-build deliverable; today's session executes the warning).
  - §A.2 — click-to-edit on every cell (binding decision Q2; Session 2's binding spec).
  - §A.3 — server-side per-user `UserTablePreferences` Prisma model keyed by (userId, projectId) (binding decision Q3; consumed this session via the new auth-derived-userId route).
  - §A.8 — Status column bidirectional mirror (already shipped in Session 5 + deployed 2026-05-23-c; Session 2 may extend per-column filtering for Status which Session 5 deferred to Workstream 3).
  - §C.3 — Workstream 3 implementation outline; Session 1 spec executed cleanly this session; Sessions 2-4 remaining.

- **Closing line:** Workstream 3 Session 1 ✅ DONE-AT-CODE-LEVEL. Next session: Workstream 3 Session 2 — click-to-edit cell editors per data type, potentially bundled with the 12 new data columns per §C.3.

---

## §B 2026-05-23-e — `session_2026-05-23-e_p46-workstream-3-session-2-click-to-edit-cell-editors-and-eight-new-data-columns` — Workstream 3 Session 2 lands click-to-edit cell editors per §A.2 + 8 new data columns + UX behavior change row-click → "↗" Open button; memorializes the "In-table inline-cell parallel-component set to URL-detail-page EditableField primitives" reusable Pattern

- **Session shape:** PURE BUILD session — no deploy, no schema change, no new dependencies, no fresh extension zip. Second build session of the P-46 Workstream 3 implementation arc (Session 2 of 3-4 estimated per §C.3). Build commit `899afd4` — 7 files +1414/-91 on `workflow-2-competition-scraping`; NOT pushed to main since Session 2 is a build session. Builds atop Workstream 3 Session 1's foundation (`d846a97` / `3d6c97b` from 2026-05-23-d).

- **Headline outcome:** **The Competition Data table is now fully click-to-edit per §A.2** (every cell becomes its appropriate inline editor on click — text / multiline-text / integer / decimal / boolean / enum / date / url) + adds 8 new data columns (5 W1-additive — `type` / `description1` / `description2` / `price` / `competitionScore`; 3 pre-existing-but-unsurfaced — `resultsPageRank` / `sellerStarRating` / `numSellerReviews`). Total table now has 17 columns (was 9 entering this session). The row-click → handleRowOpen behavior was removed in favor of an explicit "↗" Open button per row in the row-actions column — necessary UX-behavior change since whole-row onClick conflicted with cell-level click-to-edit per §A.2.

- **Rule 14f forced-picker fired this session (one):**
  1. **Session-start scope-pick** (Workstream 3 Session 2 scope) — director picked "Bundle: new columns + click-to-edit together (recommended)" over "Click-to-edit on existing columns only". Recommended because both touch the same cell-renderer map in UrlTable; splitting them across sessions requires rewriting the map twice. The §C.3 Session 2 spec explicitly enumerates both as in-scope.

- **File-by-file recap matching build commit `899afd4` (7 files +1414/-91):**
  - **NEW** `src/app/projects/[projectId]/competition-scraping/components/InlineCells.tsx` (~800 LOC compact in-table click-to-edit editors — parallel-component set to the URL detail page's `EditableField.tsx` primitives). Exports `InlineTextCell` (with optional multiline textarea), `InlineNumberCell` (with min/max/step/integer flags), `InlineBooleanCell` (single-click toggle), `InlineEnumCell<T>` (click to open popover with options; single-click commit), `InlineDateCell` (native HTML date input with optional `readOnly` for server-stamped timestamps like `addedAt`), and `InlineUrlCell` (delegates to InlineTextCell with link-coloring + non-empty validation). Save lifecycle on every variant: optimistic update + rollback-on-throw + inline error pill until next edit. `e.stopPropagation()` on every cell-click handler so the row's onClick doesn't fire while editing (defensive-future-safe even after this session's whole-row onClick removal).
  - **NEW** `src/lib/competition-scraping/competition-score-validation.ts` (~65 LOC trust-boundary helper `extractCompetitionScorePatch(body)` for the new `competitionScore` PATCH allowlist per §A.7 — integer 1-100 nullable; mirrors W2 Session 5's `url-structural-fields-validation.ts` Pattern; **direct application of W2 S5's "Field-allowlist subset extraction" reusable Pattern**).
  - **NEW** `src/lib/competition-scraping/competition-score-validation.test.ts` — 18 new node:test cases covering: empty body / null body / non-object body (defensive paths return empty patch); integer in range (1, 50, 100) accepted; null explicitly clears column; below-min (0, -5) / above-max (101) / decimal (50.5) / NaN / Infinity / string / boolean / array / explicit-undefined all rejected with appropriate error messages; unknown keys alongside `competitionScore` ignored. src/lib count 726 → 744 (+18, exact match).
  - **MODIFIED** `src/app/projects/[projectId]/competition-scraping/components/url-table-columns.ts` (+47 LOC) — adds `TableColumnDataType` discriminator (`'url' | 'text' | 'text-multiline' | 'number-integer' | 'number-decimal' | 'boolean' | 'enum' | 'date-readonly'`) driving per-cell editor selection in UrlTable; extends `TABLE_COLUMN_DEFS` registry with 8 new column defs; total registry now 17 columns.
  - **MODIFIED** `src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx` (major rewrite +263 LOC / -109 LOC). Extends `SortKey` union from 9 keys to 17. Extends `COLUMNS` array with 8 new entries. Rewrites `cellRenderers` map to use `InlineCells` components — each cell now renders its column's appropriate editor wired to `onCellSave(row.id, { fieldName: next })`. Adds required `onCellSave` prop. Removes row-level `onClick={handleRowOpen}` (replaced by explicit "↗" Open button in row-actions column). Adds per-row "↗" Open button next to the trash button; both buttons sit in a single 88px-wide row-actions column at the right edge.
  - **MODIFIED** `src/app/projects/[projectId]/competition-scraping/components/CompetitionScrapingViewer.tsx` (+44 LOC). New `handleCellSave` `useCallback` PATCHes `/api/projects/[projectId]/competition-scraping/urls/[urlId]` with the field patch + replaces the local row in `urls` state with the server's authoritative response; throws on PATCH failure so the inline cell can render its error pill. Passed through to `<UrlTable />` as `onCellSave`. Imports `UpdateCompetitorUrlRequest` + `UpdateCompetitorUrlResponse` from shared-types.
  - **MODIFIED** `src/app/api/projects/[projectId]/competition-scraping/urls/[urlId]/route.ts` (+13 LOC). Imports the new `extractCompetitionScorePatch` helper; adds `competitionScore` validation step between the existing structural-fields extraction and the `overallCompetitorAnalysis` allowlist — mirrors W2 S5's helper-extraction pattern.

- **NEW reusable Pattern memorialized — "In-table inline-cell parallel-component set to URL-detail-page EditableField primitives":** When a feature needs the same edit-affordance shape in two different visual contexts (here: per-cell editing in a dense table row vs. per-field editing in a labeled detail panel), prefer a **parallel-component set** over forcing the existing components to handle both contexts via configuration props. The visual + ergonomic constraints differ enough (label + pencil-button + spaced layout in a panel vs. compact click-on-value + auto-focus + tight padding in a table cell) that the configurations would proliferate. The parallel set keeps each callsite typed against the right shape + lets the two evolve independently.

  This Pattern **pairs with W2 Session 3's "OverallAnalysisBox parallel to PerItemAnalysisBox" Pattern** (parallel-component for ANALYSIS surfaces). Together they cover **"parallel-component for visual-context-divergence"** as a meta-shape applicable across both EDIT and ANALYSIS surfaces. Sister patterns in the P-46 catalog: PerItemAnalysisBox extraction (S1) / OverallAnalysisBox parallel (S3) / Per-record handler DI-seam precedent extension (S4) / Field-allowlist subset extraction (S5) / Foundation-workstream path-convention drift (W3 S1) / In-table inline-cell parallel-component set (this session). Reusable across Workstreams 4-5 + future polish items needing the same edit-affordance shape across multiple visual contexts.

- **UX behavior change worth surfacing to director — row-click navigation removed in favor of explicit "↗" Open button:** Whole-row `onClick={handleRowOpen}` is **removed** this session per §A.2 (cell-level click-to-edit conflicted with whole-row click). Replaced by an explicit per-row "↗" Open button in the row-actions column (sitting to the LEFT of the trash button; both buttons in a single 88px-wide row-actions column at the right edge). The visual hover-highlight on the row remains (purely cosmetic) but the cursor is no longer pointer-on-the-row; only the explicit buttons are pointer. Director should test this — the row-click → URL detail page navigation no longer works; the "↗" arrow icon is the new affordance. Flag for director attention in the Personalized Handoff.

- **Validation of W2 Session 5's "Field-allowlist subset extraction" Pattern reusability:** The new `extractCompetitionScorePatch(body)` helper is a direct second application of the Pattern shipped 2026-05-23-b for the 4 URL-level structural fields. Same shape: pure trust-boundary helper returning `{ ok, patch } | { ok, error }`; same call shape from the route (`const result = extract(body); if (!result.ok) return 400; spread patch onto Prisma data`); same test coverage shape. Validates the Pattern travels cleanly without per-callsite customization. Total Pattern applications in P-46 = 2.

- **Verification scoreboard at new baselines:** All 5 /scoreboard checks GREEN — root tsc clean / extension tsc clean / 558 ext UNCHANGED / **744 src/lib +18 from baseline 726** (exact match with 18 new competition-score-validation.test.ts cases) / **61 routes UNCHANGED** (no new routes; `competitionScore` added to existing `urls/[urlId]` PATCH allowlist). Check 6 Playwright SKIPPED per non-deploy-session convention.

- **Schema-change-in-flight flag STAYS NO** the entire session — no `prisma db push`; the 8 new data columns are all already in `CompetitorUrl` from W1's 2026-05-24 schema (`type` / `description1` / `description2` / `price` / `competitionScore` were W1-additive; `resultsPageRank` / `sellerStarRating` / `numSellerReviews` were pre-existing-but-unsurfaced in `CompetitorUrl`). **Default expectation: stays NO** through Session 3 (the 3 fields `columnWidths` / `fontSize` / `rowOrder` for column resize / row reorder / font size are all already in `UserTablePreferences` from W1).

- **P-43 cwd-leak class re-reproduced ONCE this session — LOW informational:** During /scoreboard execution, parallel Bash calls for Check 2 (extension tsc, `cd /workspaces/brand-operations-hub/extensions/competition-scraping && npx tsc --noEmit`) + Check 4 (`npm test`) ran in parallel; the `cd` from Check 2 leaked into Check 4's cwd, causing `npm test` to invoke the EXTENSION's test script (558 tests) instead of falling back to the root's (no test script). Caught from the test-name content (urlsMatchAfterNormalization / buildRecognitionSet are extension tests). Recovered by reading `.claude/commands/scoreboard.md` for the canonical absolute-path commands + re-running Check 4 with the explicit `node --test --experimental-strip-types $(find /workspaces/...)` form. **FIFTH reproduction of the same Pattern** (prior reproductions: 2026-05-22-i + 2026-05-23-b + 2026-05-23-c twice). Recovery cost: ~30 seconds + one extra Bash call. Reinforces standing observation that template hardening protects verbatim-template-read pathways but NOT Claude's inline-typed shortcuts.

- **Calibration data point — Workstream 3 Session 2 sized correctly under bundled scope:** Session 2 of 3-4 estimated Workstream 3 sessions landed cleanly within the bundled scope. The §C.3 Session 2 spec was: (a) click-to-edit cell editors per data type; (b) the new data columns surfaced via the cell-renderer map. Both landed; the pleasant discovery that 3 of the 7 needed cell-editor primitives already existed in W2 Session 5's EditableField.tsx (only 2 truly-new editor types needed: InlineDateCell + InlineUrlCell beyond the parallel set) meant the session came in at the bundled scope without scope creep. Useful data point continuation of the calibration discipline started in the 2026-05-23-c §B entry.

- **Workstream 3 progress = 2 of 3-4 estimated sessions ✅ DONE-AT-CODE-LEVEL.** Session 3 remaining: column resize (drag column edges) + drag-to-reorder rows + adjustable font size per §C.3 Session 3 spec — all 3 features consume existing `columnWidths` / `fontSize` / `rowOrder` JSON columns on `UserTablePreferences` from W1's schema via Session 1's auth-derived-userId route. Then Workstream 3 deploy session ends the arc.

- **Impact on §A: NONE.** §A stays frozen per Rule 18. The Session 2 deliverables consume §A.2 (click-to-edit on every cell — binding decision Q2) + §A.3 (server-side per-user `UserTablePreferences` keyed by (userId, projectId)) + §A.7 (`competitionScore` column 1-100 integer nullable — binding decision Q7) + §A.8 (Status column bidirectional mirror — already shipped in W2 S5; consumed this session as one of the 17 column defs) exactly as specced; no §A amendments needed.

- **Impact on §C:** **§C.3 Session 2 is now 100% COMPLETE** — both sub-scopes (click-to-edit cell editors per data type + the new data columns) landed via the bundled-scope outcome; **§C.3 Session 3 (column resize + drag-to-reorder + font size) begins next session per (a.79) RECOMMENDED-NEXT.** §C.4 + §C.5 (Workstreams 4 + 5) remain pending per Q10's locked sequencing.

- **Cross-references:**
  - CORRECTIONS_LOG §Entry 2026-05-23-e — the operational-log twin of this §B entry; captures the bundled-scope outcome + Pattern memorialization + UX behavior change + P-43 re-reproduction at the operational-log layer.
  - §B 2026-05-23-d — Workstream 3 Session 1 closing; the predecessor §B entry; foundational `UserTablePreferences` plumbing + horizontal `ColumnVisibilityBar` + sidebar removal — today's session consumes that plumbing via the cell-editor wiring + PUT round-trip.
  - §B 2026-05-23-c — Workstream 2 deploy closing; "Multi-session workstream deploy gate timing" Pattern applies to Workstream 3's eventual deploy session.
  - §B 2026-05-23-b — Workstream 2 Session 5 closing; memorialized the "Field-allowlist subset extraction" Pattern that today's session applies for the second time on `competitionScore`.
  - §B 2026-05-27 — Workstream 2 Session 3 closing; memorialized the "OverallAnalysisBox parallel to PerItemAnalysisBox" Pattern — sister parallel-component Pattern for ANALYSIS surfaces; today's "In-table inline-cell parallel-component set" Pattern is its sibling for EDIT surfaces.
  - §A.2 — click-to-edit on every cell (binding decision Q2; fully consumed this session).
  - §A.3 — server-side per-user `UserTablePreferences` Prisma model keyed by (userId, projectId) (binding decision Q3; consumed via the auth-derived-userId route Session 1 shipped).
  - §A.7 — `competitionScore` column 1-100 integer nullable (binding decision Q7; consumed via new `extractCompetitionScorePatch` helper).
  - §A.8 — Status column bidirectional mirror (already shipped in W2 S5; consumed this session as one of the 17 column defs).
  - §C.3 — Workstream 3 implementation outline; Session 2 spec executed cleanly this session; Session 3 (column resize + drag-reorder + font size) remaining.

- **Closing line:** Workstream 3 Session 2 ✅ DONE-AT-CODE-LEVEL. Next session: Workstream 3 Session 3 — column resize + drag-to-reorder rows + adjustable font size per §C.3.

---

## §B 2026-05-23-f — Workstream 3 Session 3 closing entry — column resize + drag-to-reorder rows + table-wide font-size stepper bundled per Rule 14f outcome + NEW reusable Pattern "Shared debounced-mutation lifecycle reused across an N-control surface" + three new @dnd-kit npm dependencies + Workstream 3 implementation arc COMPLETE at code level (Sessions 1-3 of 3-4 estimated)

**Session:** `session_2026-05-23-f_p46-workstream-3-session-3-column-resize-drag-reorder-font-size`
**Branch:** `workflow-2-competition-scraping`
**Build commit:** `7ad7eff` — 6 files +781/-178
**Status:** Workstream 3 Session 3 ✅ DONE-AT-CODE-LEVEL 2026-05-23-f. Workstream 3 implementation arc COMPLETE at code level across Sessions 1-3 of 3-4 estimated — landed inside the estimated window. Next session: Workstream 3 deploy session (Phase-4 deploy per (a.80) RECOMMENDED-NEXT).

**Rule 14f session-start scope-pick outcome:**

Director picked "Bundle all 3 controls (recommended)" over "Ship just font size + drag-to-reorder, defer column resize" and "Ship just column resize, defer font size + drag-to-reorder." Recommended option per `feedback_recommendation_style.md` — most thorough — all 3 share the same `UserTablePreferences` plumbing + debounced PUT lifecycle Session 1 wired, so bundling avoids re-deriving the same patterns 2-3 times across sessions. ZERO Rule 14f sub-pickers fired during execution per `feedback_default_to_recommendation.md` — library choice (`@dnd-kit` over alternatives like react-dnd / dnd-kit / native HTML5 drag/drop), MIN/MAX clamping bounds for column widths + font size, sort-mode disambiguation ('manual' vs. existing column sort), and "preserve rowOrder ids not in current sorted set" semantics were all clear "most thorough/reliable" defaults.

**File-by-file recap matching build commit `7ad7eff`:**

1. **`src/app/projects/[projectId]/competition-scraping/components/url-table-columns.ts`** — adds `defaultWidth: number` to `TableColumnDef` + per-column defaults (URL=280, Description-1/2=240, Product Name=220, etc.) + NEW constants `MIN_COLUMN_WIDTH = 60` / `MAX_COLUMN_WIDTH = 600` / `FONT_SIZE_MIN = 10` / `FONT_SIZE_MAX = 24` / `FONT_SIZE_DEFAULT = 14` (the font-size trio mirrors the handler's validator constants per Session 1's `extractTablePreferencesPatch` for shared client-server clamping semantics) + NEW `resolveColumnWidth(map, column)` helper.

2. **`src/app/projects/[projectId]/competition-scraping/components/CompetitionScrapingViewer.tsx`** — adds three new state slices (`columnWidths` / `fontSize` / `rowOrder`) alongside Session 1's `columnVisibility` + extends the seed-from-GET effect to fill all four fields from `UserTablePreferences` at mount + NEW handlers `handleColumnResize` / `handleFontSizeChange` / `handleRowReorder` all sharing the existing `prefsTimerRef` 500 ms debounced PUT (a burst of drag events from any control coalesces into one network write on idle; the latest mutation always wins because each handler clears the timer before resetting it).

3. **`src/app/projects/[projectId]/competition-scraping/components/ColumnVisibilityBar.tsx`** — adds a third group "Text size" at the far right of the bar with − / Npt / + stepper buttons disabled at FONT_SIZE_MIN / FONT_SIZE_MAX bounds + the supporting styles (`fontSizeGroupStyle`, `stepperStyle`, `stepperButtonStyle`, `stepperValueStyle`).

4. **`src/app/projects/[projectId]/competition-scraping/components/UrlTable.tsx`** — major rewrite (+629/-178 region; bulk of session diff):
   - Splits the `SortKey` type into `ColumnSortKey | 'manual'`; 'manual' mode respects `rowOrder` from `UserTablePreferences`, otherwise the existing comparator-based sort wins.
   - Wraps `<tbody>` in `<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>` + `<SortableContext items={...} strategy={verticalListSortingStrategy}>`.
   - `PointerSensor` with `activationConstraint: { distance: 4 }` so per-cell click-to-edit (Session 2) isn't hijacked by drag activation on the row's drag handle.
   - Each `<tr>` becomes a NEW `SortableUrlRow` sub-component that uses `useSortable({ id: row.id })` + applies `CSS.Transform.toString(transform)` style + threads `attributes` onto the row + spreads `listeners` onto the leading drag-handle button.
   - Adds `<colgroup>` with explicit widths per column (drag-handle column 32px + visible columns from `resolveColumnWidth(...)` + actions column 88px); switches table to `tableLayout: 'fixed'` so colgroup widths bind exactly.
   - Adds NEW `ColumnResizeHandle` sub-component — drag handle absolutely positioned at the right edge of every `<th>`; `onPointerDown` captures + tracks `pointermove` (computing delta + clamping to MIN/MAX) + commits on `pointerup`; optimistic per-pointermove commit so the table re-renders width live during the drag.
   - Applies `effectiveFontSize` as `fontSize: ${effectiveFontSize}px` on the `<table>` element so every cell scales together.
   - `handleDragEnd` computes the new id order from the sorted display, preserves any rowOrder IDs not in the current sorted set (e.g., rows filtered out by the search box — they stay in their saved position when the filter clears), calls `onRowReorder` with the merged order, sets `sortKey` to `'manual'` so the user-imposed order sticks visually.
   - Adds NEW `tableColumnDefByKey(key)` helper to resolve a column id to its `TABLE_COLUMN_DEFS` entry for width lookup.

5. **`package.json`** — adds three @dnd-kit dependencies (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`).
6. **`package-lock.json`** — auto-updated; 4 packages added net (3 direct + 1 transitive `@dnd-kit/accessibility`).

**NEW reusable Pattern memorialized — "Shared debounced-mutation lifecycle reused across an N-control surface":**

When a foundation session wires a debounced PUT lifecycle for ONE field of a shared per-user prefs row, the next session can land N additional controls without re-deriving the batching logic by routing every new control through the SAME timer ref + the SAME flush callback (with a partial body specific to that control). The 500 ms debounce coalesces bursts from ANY of the N controls into ONE network write; the latest mutation always wins because each handler clears the timer before resetting it.

Today's session validated this Pattern by routing 3 new controls (column resize / row reorder / font-size change) through Session 1's `prefsTimerRef` + `flushPrefsPut`, producing zero additional debounce code beyond a one-line handler per control. Composes with:

- **W2 S5's "Field-allowlist subset extraction" Pattern** — different shape (server-side trust boundary) but same meta-Pattern of "foundation-session primitive becomes Pattern when reused by N=2+ subsequent sessions";
- **W3 S1's "Foundation-workstream path-convention drift surfaced by next-workstream session-start picker" Pattern** — the path convention itself was the foundational decision; today's reuse benefits from S1's convention-correct path;
- **W3 S2's "In-table inline-cell parallel-component set to URL-detail-page EditableField primitives" Pattern** — the parallel-component set + today's debounced-lifecycle reuse together cover the "extract once, reuse N times" meta-shape across both component-structure (S2) and effect-lifecycle (S3) dimensions.

Together these three Workstream 3 Patterns form a complete foundation→reuse cycle: S1 lays the route + plumbing primitive; S2 reuses the plumbing for click-to-edit while extracting the parallel-component set primitive; S3 reuses BOTH (the plumbing + the in-table edit affordances) while extracting the shared-debounced-mutation-lifecycle primitive that future workstreams/sessions can claim for free.

**Three new npm dependencies landed (first runtime drag-and-drop library on this layer):**

`@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (with one transitive `@dnd-kit/accessibility`). First time the Competition Data table layer takes a runtime drag-and-drop library; bundle size +~30 KB gzipped one-time cost. The @dnd-kit family chosen as the "most thorough/reliable" default per `feedback_recommendation_style.md` — modern React-first API, pointer-event based, accessibility built-in, MIT license, actively maintained. Alternatives considered + rejected silently (no Rule 14f picker fired since the recommendation was clear): react-dnd (older API, HTML5-backend abstractions add complexity for our pointer-friendly use case), native HTML5 drag-and-drop (poor accessibility story; harder to integrate with React's render lifecycle).

**Verification scoreboard at unchanged baselines:**

- root tsc: clean (UNCHANGED)
- extension tsc: clean (UNCHANGED)
- extension `npm test`: **558/558** UNCHANGED (no extension code touched)
- src/lib node:test: **744/744** UNCHANGED (no new server-side code; UI-only session per pointer expectation; the new constants + helpers in `url-table-columns.ts` are UI-only)
- Next.js `npm run build`: **61 routes** compiled successfully UNCHANGED (no new routes; only extended existing `urls/[urlId]` already-existing PATCH allowlist semantics indirectly via the new controls hitting the existing table-preferences PUT)
- Check 6 Playwright: SKIPPED per non-deploy-session convention

**Calibration data point — Workstream 3 lands at LOWER end of 3-4 estimate:**

Sessions 1-3 ✅ DONE-AT-CODE-LEVEL within scope per §C.3 spec. Workstream 3 came in at the LOWER end of the 3-4 estimate (3 sessions vs. 3-4 budgeted), reflecting that:
- Session 1's foundational `UserTablePreferences` plumbing (DI-seam handler + auth-derived-userId route + horizontal bar + sidebar removal) was a one-session bundle as specced;
- Session 2's bundled scope (click-to-edit cell editors + 8 new data columns) fit cleanly in one session because 3 of the 7 needed cell-editor primitives already existed in W2 Session 5's EditableField.tsx;
- Session 3's bundled scope (column resize + drag-reorder + font size) fit cleanly in one session because all 3 controls reused Session 1's debounced PUT lifecycle without re-derivation, and the @dnd-kit family integrated cleanly without surprises.

Combined Workstream 1+2+3 calibration: W1 = 1 session (under 2-3 estimate); W2 = 5 build sessions + 1 deploy (top end of 3-5 estimate); W3 = 3 sessions (low end of 3-4 estimate); Workstream 3 deploy session pending. Useful data point for sizing Workstreams 4-5 (W4 = ~2-3; W5 = ~1-2).

**P-43 cwd-leak class re-reproduced ONCE (sixth reproduction overall) — LOW informational sub-observation:**

During /scoreboard Check 5 the parallel-Bash invocation leaked cwd from Checks 2+3 (which legitimately `cd extensions/competition-scraping/`) into the Check 5 `npm run build` call, producing the EXTENSION build output (`Built extension in 2.432 s`) instead of Next.js routes. Caught immediately from the output content + recovered with the absolute-`cd` template form. Same LOW informational pattern as the 2026-05-22-i + 2026-05-23-b + 2026-05-23-c + 2026-05-23-e reproductions. Captured in CORRECTIONS_LOG §Entry 2026-05-23-f as a LOW informational sub-observation; NOT promoted to a corrections-tier slip; immediate detection + recovery; no impact on scoreboard result.

**Affected §A sections (informational — §A frozen per Rule 18):**

- §A.3 — server-side per-user `UserTablePreferences` Prisma model keyed by (userId, projectId) (binding decision Q3; fully consumed this session across all three new fields `columnWidths` + `fontSize` + `rowOrder`).
- §C.3 — Workstream 3 implementation outline; Session 3 spec executed cleanly this session bundling all 3 deliverables; Workstream 3 implementation arc now COMPLETE at code level across Sessions 1-3 of 3-4 estimated.

**Impact on §A: None; §A stays frozen per Rule 18.** All §A binding decisions consumed cleanly as specced; no §A amendment needed; no §A surprises during implementation.

- **Closing line:** Workstream 3 Session 3 ✅ DONE-AT-CODE-LEVEL. Workstream 3 implementation arc COMPLETE at code level across Sessions 1-3. Next session: Workstream 3 deploy session — Phase-4 deploy ff-merging `workflow-2-competition-scraping` → `main` (6 commits as one fast-forward) → Vercel auto-redeploy → ping-pong sync → Phase-4 director real-Chrome cross-platform verify across the Competition Data table surfaces (column resize + drag-to-reorder + font-size stepper).

---

## §B 2026-05-24 — Workstream 3 DEPLOY closing entry — Workstream 3 ✅ DONE-AND-VERIFIED end-to-end on vklf.com via initial ff-merge `51e68f8..c727da9` (6 commits) + 5 in-session fix-forwards `f8293f1` → `0703174` → `712efa0` → `7358963` → `ac45737` resolving 11 Phase-4 verification issues + NEW reusable Pattern "Phase-4 verification fix-forward cascade in a single deploy session" + MEDIUM informational Rule 18 spec-capture gap observation with mechanical prevention added to working methodology + Workstream 3 implementation arc COMPLETE end-to-end (Sessions 1-3 build + 1 deploy with 6 deploy events)

**Session:** `session_2026-05-24_p46-workstream-3-deploy-and-five-fix-forwards`
**Branch:** `workflow-2-competition-scraping` → `main` (ping-pong sync 6 times across the day)
**Deploy events:** 6 — initial ff-merge `51e68f8..c727da9` + fix-forward #1 `f8293f1` + fix-forward #2 `0703174` + fix-forward #3 `712efa0` + fix-forward #4 `7358963` + fix-forward #5 `ac45737`
**Total pushes today:** ~14 — 6 deploy pushes to `origin/main` (each gated via AskUserQuestion Rule 9 picker; director picked "Deploy now (recommended)" for all 6) + 6 ping-pong syncs to `origin/workflow-2-competition-scraping` (all clean fast-forwards) + 1 end-of-session doc-batch push + 1 end-of-session ping-pong
**Director verdict at session end:** *"pass"* — all 11 Phase-4 issues PASS on vklf.com after fix-forward #5
**Status:** Workstream 3 ✅ DONE-AND-VERIFIED 2026-05-24 on vklf.com end-to-end. Workstream 3 implementation arc COMPLETE across 3 build sessions + 1 deploy session with 6 deploy events. Next session: Workstream 4 (Comprehensive Competitor Analysis page) first build session per (a.81) RECOMMENDED-NEXT — ~2-3 sessions estimated per §C.4.

**Full enumeration of 11 issues surfaced at Phase-4 verification + which fix-forward landed each:**

Initial deploy (ff-merge `51e68f8..c727da9` carrying Workstream 3 Sessions 1+2+3 build commits + doc-batches as one 6-commit fast-forward; Vercel auto-redeploy fired; director loaded vklf.com Competition Data page in real Chrome on Mac). Director surfaced the following 11 issues across Phase-4 verification + the subsequent re-verifications:

1. **Issue 1 — column resize handle should extend to full table height showing a faint column line during drag.** Fixed in fix-forward #1 (commit `f8293f1`). NEW `ResizeObserver` on the table tracks live table height; `height: tableHeight` applied on the `ColumnResizeHandle` so the resize line visibly extends past the header during drag. Phase-4 re-verify PASS.

2. **Issue 2 — page should be full width.** Fixed in fix-forward #1 (commit `f8293f1`). `src/app/projects/[projectId]/competition-scraping/page.tsx` `<main>` had `maxWidth: 1080px` + `margin: auto` — both removed so the page consumes the viewport width. Phase-4 re-verify PASS.

3. **Issue 3 — table should be horizontally scrollable instead of breaking out of its container.** Fixed in fix-forward #1 (commit `f8293f1`). Table `width` changed from `100%` to `max-content` + `minWidth: 100%` so the existing `overflowX: auto` wrapper now scrolls horizontally when columns overflow the viewport instead of breaking the layout. Phase-4 re-verify PASS.

4. **Issue 4 — relocate font-size stepper from ColumnVisibilityBar to the table toolbar, as bare +/- buttons (no Npt display).** Fixed in fix-forward #1 (commit `f8293f1`). Stepper removed from ColumnVisibilityBar; added to UrlTable's toolbar as bare `+`/`−` buttons with no `Npt` value display + no label. Phase-4 re-verify PASS.

5. **Issue 5 — Platform filter should support multi-select via checkboxes (not single-select).** Fixed in fix-forward #1 (commit `f8293f1`). `Platform[]` state shape replaces single-value `Platform`; `?platforms=X,Y` URL convention replaces `?platform=X`; "All Platforms" select-all/deselect-all toggle; legacy `?platform=X` backwards compat in the URL-detail-page viewer (treats single-value `?platform=` as a one-element array on the new state shape). Phase-4 re-verify PASS.

6. **Issue 6 — sticky table header + sticky horizontal scrollbar when scrolling within the table.** Fixed in fix-forward #2 (commit `0703174`). Table wrapper changed to `overflow: auto` + `maxHeight: calc(100vh - 200px)` + `minHeight: 400px`; all 3 `<th>` variants (drag-handle / sortable / non-sortable) got `position: sticky; top: 0; zIndex: 3; background: #0d1117` via a shared `stickyHeaderStyle` constant for consistency; `ColumnResizeHandle` zIndex bumped from 2 to 4 to render above the sticky thead so the drag handle isn't covered by the header. Phase-4 re-verify PASS.

7. **Issue 7 — director-specified column order.** Fixed in fix-forward #3 (commit `712efa0`). `TABLE_COLUMN_DEFS` + `COLUMNS` reshuffled in lockstep to: Category · Type · Sponsored · Product Name · Brand Name · Description 1 · Description 2 · Results Rank · Price · Product Stars · # Reviews · Seller Stars · Seller Reviews · Competition Score · URL · Status · Added On. Phase-4 re-verify PASS.

8. **Issue 8 — ↗ Open button relocate inside Product Name cell with stopPropagation.** Fixed in fix-forward #3 (commit `712efa0`). Moved from row-actions column into Product Name cell with `e.stopPropagation()` on click so the cell still click-to-edits the text but the inline link opens the URL detail page in a new tab; row-actions column shrunk from 88px to 52px containing only trash; standalone `rowOpenButtonStyle` + `handleOpenClick` + `onOpenClick` prop all removed; NEW `inlineProductNameOpenButtonStyle`. Phase-4 re-verify PASS.

9. **Issue 9 — URL detail page should be full width.** Fixed in fix-forward #3 (commit `712efa0`). `UrlDetailContent.tsx` `<main>` `maxWidth: 1080px` + `margin: auto` changed to `maxWidth: 100%` with `24px` side padding; inner content caps at 480px breadcrumb / 320px image / 480px video player intentionally untouched (these specific caps preserve readability per their original §A constraints). Phase-4 re-verify PASS.

10. **Issue 10 — Platform column at very left of the table.** Fixed in fix-forward #4 (commit `7358963`). NEW `'platform'` entry at position 0 in `TABLE_COLUMN_DEFS` + `COLUMNS` + `ColumnSortKey` union + `cellRenderers`; renders friendly label via `PLATFORM_LABELS` lookup; `PLATFORM_LABELS` moved from `ColumnVisibilityBar` local const to `url-table-columns.ts` exported shared const so both the bar checkbox row + the table cell renderer use a single source of truth; column read-only display matches `addedAt`'s server-stamped read-only precedent; checkbox auto-appears in Columns visibility bar since the bar iterates `TABLE_COLUMN_DEFS`. Phase-4 re-verify PASS.

11. **Issue 11 — Status column should be click-to-cycle (one-click toggle between INCOMPLETE/COMPLETE), not a dropdown.** Fixed in fix-forward #5 (commit `ac45737`). NEW internal `StatusCycleCell` sub-component replaces `InlineEnumCell` dropdown for `scrapingStatus`; one-click toggle between `INCOMPLETE`/`COMPLETE` with optimistic update + error rollback; `saving`-disabled prevents double-click pileup; bidirectional mirror with URL detail page's `EditableEnumField` Scraping Status toggle preserved via the same shared `CompetitorUrl.scrapingStatus` PATCH; removed unused `InlineEnumCell` import + `SCRAPING_STATUS_OPTIONS` const since `scrapingStatus` was the only `InlineEnumCell` caller in this file. Phase-4 re-verify PASS. **Director's verbatim end-of-session words: "pass"** — all 11 issues confirmed PASS on vklf.com.

**NEW reusable Pattern memorialized — "Phase-4 verification fix-forward cascade in a single deploy session":**

When Phase-4 director verification surfaces multiple issues post-deploy, fix-forward in-session rather than deferring; each fix-forward becomes its own build commit + own Rule 9 gate + own Phase-4 reverify cycle; the session ends with N deploys total. Today's session set the new high-water mark: 6 deploys (initial + 5 fix-forwards). Pairs with the P-45 Build #2 2026-05-22-i fix-forward Pattern (1 initial + 1 fix-forward) — today extends to N≥5 fix-forwards in one session showing the pattern scales.

**When to use:** any deploy session where Phase-4 verify surfaces multiple issues that are scoped + reversible + UI-only.

**When NOT to use:** if any issue requires schema change OR significant new code OR director shifts scope away from current workstream → defer to next session instead. The pattern depends on each fix being small enough that the cost of an extra `tsc + build + push + Vercel-redeploy + Phase-4-reverify` cycle is small relative to the cost of capturing the issue + scheduling a follow-up session for it.

Today's 11-issues / 5-fix-forwards execution validated the pattern's scaling: every fix-forward landed in under 30 minutes from issue surfacing to PASS verification; no fix-forward needed to be reverted; each one's tsc + Next.js build re-verification stayed at 61 routes UNCHANGED; full /scoreboard was acceptably skipped per fix-forward (no new tests, no new routes, no new dependencies). The pattern composes with prior memorialized Patterns: the W3 "Multi-session workstream deploy gate timing" (memorialized 2026-05-23-c) defines when the deploy session lands; today's "Phase-4 verification fix-forward cascade" defines what happens INSIDE that deploy session when multiple issues surface; together they cover the multi-session-workstream deploy-cadence end-to-end shape.

**MEDIUM informational — Rule 18 spec-capture gap surfaced + mechanical prevention added to working methodology:**

Director's column-order specification for the Competition Data table existed in director's intent but was never echoed into binding docs (§C.3 of this design doc or a §B refinement entry). The Session 2 (2026-05-23-e) implementation defaulted to "additive append" semantics — the 9 pre-P-46 columns kept their pre-existing positions (URL / Brand Name / Product Name / Sponsored / Product Stars / # Reviews / Category / Added On / Actions) and the 8 new ones were appended at the end (Type / Description 1 / Description 2 / Price / Competition Score / Results Rank / Seller Stars / Seller Reviews) without asking. The default felt natural for an additive change so no Rule 14f picker fired. The gap surfaced at Phase-4 verification of the initial deploy + fix-forwards #1-#2; director re-specified the column order verbatim; fix-forward #3 reshuffled both `TABLE_COLUMN_DEFS` + `COLUMNS` in lockstep.

**Mechanical prevention added to working methodology:** any UI-shape spec given mid-build (column order, button position, layout decision, sort default, etc.) must be echoed into binding docs + read back per Rule 14a BEFORE implementation lands. The capture point: at session-start when reading the design doc's §C.X session-spec block + the most-recent §B entries, scan for any sequencing/ordering/positioning language; if any is implicit-but-not-explicit, fire a Rule 14f picker on the canonical spec BEFORE writing code. This is a tightening of Rule 14a from "the design doc is the source of truth" to "the design doc is the source of truth; if any aspect of the implementation feels like 'the default should be obvious,' explicitly check that the default is captured in binding docs first." Captured as a footnote in CORRECTIONS_LOG §Entry 2026-05-24 + here in the design doc for traceability across future workstream sessions.

**Verification scoreboard:**

- Pre-deploy /scoreboard (workflow-2 before initial ff-merge): root tsc clean / extension tsc clean / 558 ext UNCHANGED / 744 src/lib UNCHANGED / 61 routes UNCHANGED; Check 6 Playwright SKIPPED per Rule 27 (no `extensions/` source files in the ff-merge bundle)
- Post-merge /scoreboard (main after initial ff-merge): identical baselines preserved through ff
- After fix-forwards #1-#5: root tsc clean + Next.js build 61 routes UNCHANGED each time; full /scoreboard not re-run per fix-forward (acceptable since each fix-forward was small UI-only with no new tests, no new routes, no new dependencies — calibration data point: baselines stayed UNCHANGED across all 6 deploys)

**P-43 cwd-leak class re-reproduced ~9 times across the day (LOW informational sub-observation):**

Across pre-deploy /scoreboard + post-merge /scoreboard + the various single-check tsc/build sanity passes between fix-forwards, the P-43 cwd-leak class re-reproduced approximately 9 times. Same Pattern as the 2026-05-22-i + 2026-05-23-c + 2026-05-23-e + 2026-05-23-f reproductions: when Check 3 (extension `npm test`) cd's to `extensions/competition-scraping/`, the cwd leaks into Check 5's `npm run build` call. Caught + recovered every single time with the absolute `cd /workspaces/brand-operations-hub` template form. Pattern stable; P-43's template-hardening fix protects verbatim-template-read pathways but NOT Claude's inline-typed shortcuts (the high count today reflects that Claude reaches for the shortcut form more often when running many sanity-check loops in a row). LOW informational; no impact on scoreboard or deploy results.

**Date-stamping anomaly continuation (LOW informational sub-observation):**

Calendar date today per director confirmation is **2026-05-24**. The 5 fix-forward commit MESSAGES used suffix labels `2026-05-23-g` through `2026-05-23-k` continuing yesterday's `-f` sequence. Git commit TIMESTAMPS in the actual git history are correct (2026-05-24); only the human-readable labels in commit MESSAGES diverged. Same anomaly class as noted in the 2026-05-23-b §Entry. Pattern: when many sessions occur in close succession across calendar-day boundaries, the `-letter` suffix convention sometimes diverges from the calendar date. Not corrections-tier; LOW informational; the in-doc dating discipline is intact (header bumps + ROADMAP polish entry + this §B entry + NEXT_SESSION.md + CORRECTIONS_LOG §Entry all use the correct calendar date 2026-05-24).

**Affected §A sections (informational — §A frozen per Rule 18):**

- §A.2 (click-to-edit on every cell) — Status column became click-to-cycle via the new `StatusCycleCell` rather than the `InlineEnumCell` dropdown, slightly narrowing the click-to-edit interpretation for enum fields with exactly 2 states (cycle is faster than dropdown for binary toggles); §A.2's underlying binding decision unchanged.
- §A.3 (server-side per-user `UserTablePreferences`) — fully consumed; all 6 fields now driving live UI on vklf.com.
- §A.7 (Competition Score 1-100) — surfaced via the existing PATCH allowlist + Session 2's `extractCompetitionScorePatch`; now deployed.
- §A.8 (Status column bidirectional mirror) — bidirectional mirror preserved through the StatusCycleCell change (still PATCHes the same `CompetitorUrl.scrapingStatus` field).
- §C.3 — Workstream 3 implementation outline; fully consumed across Sessions 1-3 + the 5 fix-forwards; Workstream 3 now ✅ DONE-AND-VERIFIED on vklf.com end-to-end. §C.4 begins next session.

**Impact on §A: None; §A stays frozen per Rule 18.** All §A binding decisions consumed cleanly despite the 11-issue Phase-4 cascade because all 11 issues were either (a) layout/styling refinements within the same §A surface area or (b) UX polish that left §A's underlying binding decisions intact. The Rule 18 spec-capture gap surfaced this session was about an UNDERSPECIFIED §C.3 section (column order), not a §A binding decision being violated.

**Calibration data point — full W1+W2+W3 implementation arc complete:**

- Workstream 1 = 1 build session + folded into W2 deploy (under §C.1's 2-3 estimate);
- Workstream 2 = 5 build sessions + 1 deploy session (top end of §C.2's 3-5 estimate);
- Workstream 3 = 3 build sessions + 1 deploy session with 6 deploy events from fix-forward cascade (low end of §C.3's 3-4 estimate for build sessions);
- **Combined W1+W2+W3 = 11 sessions** vs. 7-11 estimated (sum of §C.1+§C.2+§C.3 floor/ceiling) — landed at top end of estimate with no overrun;
- Useful data point for sizing Workstreams 4-5: W4 = ~2-3 sessions per §C.4; W5 = ~1-2 sessions per §C.5; **total P-46 spend trending toward 14-16 sessions** vs. the original 11-17 estimate post-Q1+Q9 scope reductions.

**Cross-references:**

- CORRECTIONS_LOG §Entry 2026-05-24 (the closing entry for this deploy session — captures the same 11 issues + 5 fix-forwards + new Pattern + Rule 18 gap from a procedural perspective; this design doc §B captures the same content from a design/implementation perspective).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-23-c (the W2 deploy session — established the "Multi-session workstream deploy gate timing" Pattern that today's W3 deploy composed with the new "Phase-4 verification fix-forward cascade" Pattern).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-23-d through §B 2026-05-23-f (the three W3 build session entries — Sessions 1-3 whose bundled scopes today's deploy shipped together via the initial ff-merge).
- `docs/ROADMAP.md` P-46 polish-backlog entry (annotated this session — WS#3 flipped to ✅ DONE-AND-VERIFIED 2026-05-24 on vklf.com via 6 deploys; (a.80) closed; new (a.81) opened for Workstream 4 first build session).
- CORRECTIONS_LOG §Entry 2026-05-22-i (the P-45 Build #2 deploy session that established the prior 1-initial + 1-fix-forward Pattern; today's 1-initial + 5-fix-forward execution scales it).

**Closing line:** Workstream 3 ✅ DONE-AND-VERIFIED 2026-05-24 on vklf.com end-to-end via 6-deploy fix-forward cascade. P-46 implementation arc progress: Workstreams 1 + 2 + 3 = 3 of 5 ✅ DONE-AND-VERIFIED on vklf.com. Next session: Workstream 4 (Comprehensive Competitor Analysis page) first build session — NEW page hosting per-Project TipTap rich-text doc with hyperlinks back to URL detail pages + edit-mode toggle + "Competition Data" back-button; uses the same `RichTextEditor` wrapper W2 S1 built with `variant='full'`; NEW route `/projects/[projectId]/competition-scraping/comprehensive-analysis/page.tsx`; NEW API route `/api/projects/[projectId]/competition-scraping/comprehensive-analysis` (currently 501-stub from W1; needs implementation); NEW Prisma model `ComprehensiveCompetitorAnalysis` already shipped in W1 schema ready for use.

---

## §B 2026-05-24-b — `session_2026-05-24-b_p46-workstream-4-session-1-comprehensive-analysis-page` — Workstream 4 Session 1 lands the per-Project Comprehensive Analysis page end-to-end at code level — full §C.4 Session 1 scope shipped + TWO new reusable Patterns memorialized + FIRST APPLICATION of the 2026-05-24 Rule 14a tightening

**Session:** `session_2026-05-24-b_p46-workstream-4-session-1-comprehensive-analysis-page`
**Branch:** `workflow-2-competition-scraping` (single-branch session; no main push since Session 1 is a build session, not a deploy session)
**Build commit:** `283d4d1` — 9 files +1258/-32
**Director verdict at session end:** Session 1 closed at code level; Session 2 (internal-hyperlink TipTap extension) opens (a.82) RECOMMENDED-NEXT
**Status:** Workstream 4 Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-24-b; Sessions 2-3 remaining per §C.4 (Session 2 = internal-hyperlink TipTap extension; Session 3 = conditional deploy if Sessions 1-2 land clean).

**What landed (9 files +1258/-32):**

- **NEW** `src/lib/competition-scraping/handlers/comprehensive-analysis.ts` (~225 LOC DI-seam handler factory mirroring `user-table-preferences.ts` precedent) — exports `extractComprehensiveAnalysisPatch` strict trust-boundary validator + `toWireShape` JsonValue → Record<string, unknown> coercion with bad-DB-shape fallback to empty doc + `makeComprehensiveAnalysisHandlers` factory returning GET + PUT. PUT populates `lastEditedBy` from auth-derived `userId` on every upsert; `lastEditedAt` is Prisma-managed via `@updatedAt` on update, passed explicitly on create.
- **NEW** `src/lib/competition-scraping/handlers/comprehensive-analysis.test.ts` (~380 LOC; 20 new node:test cases bringing src/lib to **764 from baseline 744**).
- **MODIFIED** `src/app/api/projects/[projectId]/competition-scraping/comprehensive-analysis/route.ts` — replaces Workstream 1's 501-stub with thin DI-seam shim wrapping `makeComprehensiveAnalysisHandlers` via the `verifyProjectAuthAdapter` pattern from `table-preferences/route.ts`.
- **MODIFIED** `src/app/projects/[projectId]/competition-scraping/components/RichTextEditor.tsx` — extends `variant='full'` toolbar per §A.5: H1/H2/H3 headings + Bold + Italic + Underline + bullet/numbered lists + Link + Code block. StarterKit's `heading: false` flipped to `heading: { levels: [1, 2, 3] }` when variant is 'full'. `@tiptap/extension-underline` imported and registered for both variants (toolbar surfaces it only for 'full'). Minimal variant unchanged.
- **NEW** `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/page.tsx` (~269 LOC client page route; uses `useWorkflowContext` + `useParams` + `useRouter`; GET on mount via `authFetch`; 404-tolerant empty-state; Edit/Done toggle; back-button "← Competition Data" at top; last-edited timestamp footer).
- **NEW** `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/components/AnalysisEditor.tsx` (~151 LOC parallel-component to W2 S1's `PerItemAnalysisBox` — same save-lifecycle Pattern but PUT method + `{ contentJson }` body shape + `variant='full'` toolbar; Saving/✓ Saved/Save failed status indicator).
- **NEW** `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/components/AnalysisReadView.tsx` (~76 LOC; renders the TipTap doc via `RichTextEditor` with `readOnly=true` rather than a separate `generateHTML` static render path — chosen to keep typography identical between read/edit modes without risk of style drift; empty-state placeholder shown when `isEmptyTipTapDoc(contentJson)`).
- **MODIFIED** `src/app/projects/[projectId]/competition-scraping/components/CompetitionScrapingViewer.tsx` (+31 LOC; standalone "→ Comprehensive Competitor Analysis" navigation button row above `ColumnVisibilityBar` per the session-start Rule 14f sub-picker; uses existing `router.push` already imported).
- **MODIFIED** `package.json` (+1 line; `@tiptap/extension-underline@3.23.6` promoted from transitive (already in node_modules via `@tiptap/extensions`) to top-level dep so the version is locked).

**TWO Rule 14f forced-pickers fired at session start (per Rule 14a tightening from 2026-05-24):**

1. **Session 1 scope** — director picked **Full §C.4 scope (recommended)** over "Conservative pointer scope" + "Handler-only this session." The §C.4 binding spec was the source of truth; yesterday's NEXT_SESSION.md pointer had defaulted to a more conservative Session 1 scope; the 2026-05-24 Rule 14a tightening directed surfacing the divergence to director rather than silently picking the pointer's recommendation. **This is the FIRST APPLICATION of the Rule 14a tightening shipped 2026-05-24** (any UI-shape spec given mid-build must be echoed into binding docs + read back per Rule 14a BEFORE implementation lands — the pointer-vs-binding-spec divergence is a sibling shape since both are mid-arc planning artifacts where the binding spec wins).

2. **Navigation surface placement** — director picked **Standalone button above the bar (recommended)** over "Tab strip" + "Button inside ColumnVisibilityBar." §A.4's "tab at the top" wording resolved cleanly to a standalone button row above `ColumnVisibilityBar`.

**ZERO Rule 14f sub-pickers fired during execution** per `feedback_default_to_recommendation.md`.

**Pattern A memorialized — "Per-Project edit-affordance parallel to per-row edit-affordance":**

When an edit affordance needs the same save-lifecycle shape at TWO scope levels (per-row vs. per-Project), extract parallel components that share structure but differ on the per-scope wire details:

- **PerItemAnalysisBox** (W2 S1) — per-row scope; PATCH method; body `{ analysis }`; `variant='minimal'`.
- **AnalysisEditor** (W4 S1, today) — per-Project scope; PUT method; body `{ contentJson }`; `variant='full'`.

Both wrap the same `RichTextEditor`. Both have the same Saving/Saved/Failed status-indicator structure. Both use a `generation counter ref` for stale-response protection.

Pairs with:
- W2 S1's "PerItemAnalysisBox extraction" Pattern (2026-05-25)
- W2 S3's "OverallAnalysisBox parallel component" Pattern (2026-05-27)

Meta-shape: when a shared per-action lifecycle (debounced persist + status indicator + retry on error) is needed at N scopes (per-row / per-category / per-Project), each new scope adds a thin parallel component that wraps the same editor primitive — the save-lifecycle structure stays uniform via shared property shape, while per-scope wire details (method, body, scope key) parameterize via props. Three reusable Patterns now compose into this meta-shape across the W2+W4 implementation arc.

**Pattern B memorialized — "Editor-as-readonly substitutes for a separate static renderer":**

§A.5 mentions `generateHTML` for non-editor read views. AnalysisReadView instead uses `RichTextEditor readOnly=true` (the wrapper supports a `readOnly` prop since W2 S1). Rationale: identical typography between edit and read modes without a duplicate render path. The editor's overhead is one ProseMirror instance per mount, negligible for a single per-Project doc. A separate static renderer would risk style drift between the two paths. Worth memorializing as a reusable Pattern for future read-view/edit-view siblings.

**§A.5 generateHTML divergence (informational; NOT a slip):**

§A.5 explicitly mentions `generateHTML` as the path for non-editor read views. Today chose Pattern B (editor-as-readonly) instead. The §A.5 mention is preserved as a design intent; the actual implementation diverges to the readonly-editor path for the style-drift-prevention rationale captured in Pattern B above. No §A amendment needed — Pattern B is a refinement on §A.5's reading guidance, not a contradiction.

**§C.4 file-naming drift (TipTapEditor vs RichTextEditor — informational):**

§C.4 names the editor wrapper `TipTapEditor.tsx` but the wrapper W2 S1 actually shipped is named `RichTextEditor.tsx`. The rename was captured in W2 S1's §B 2026-05-25 entry. Today consumed the actual filename. No §A amendment needed; no slip; just informational. Pattern: when a foundation session renames a component during implementation, downstream sessions consume the renamed file; the original §C plan's filename becomes informational rather than binding.

**Schema-change-in-flight flag STAYS NO** entire session — no `prisma db push`; consumes the existing `ComprehensiveCompetitorAnalysis` Prisma model from W1's 2026-05-24 schema (already deployed via 2026-05-23-c W2 deploy).

**Verification scoreboard:**

| Check | Status | Baseline → New |
|-------|--------|----------------|
| 1. Root tsc | GREEN | clean → clean |
| 2. Extension tsc | GREEN | clean → clean |
| 3. Extension `npm test` | GREEN | 558 → 558 (UNCHANGED) |
| 4. src/lib node:test | GREEN | 744 → **764 (+20 — exact match with 20 new comprehensive-analysis.test.ts cases)** |
| 5. `npm run build` routes | GREEN | 61 → 61 (UNCHANGED — W1 501-stub at existing path filled in; no new route paths created) |
| 6. Playwright | SKIPPED per non-deploy-session convention | — |

**Calibration data point — Session 1 of 2-3 estimated landed cleanly within scope:**

- Session duration: ~150-180 min (top end of recommended-scope estimate per the Rule 14f Session 1 scope-pick rationale);
- No overrun, no fix-forward, all 17 in-session TaskCreate tasks completed cleanly;
- Two new Patterns surfaced organically during implementation — the "parallel-component at per-Project scope" Pattern was a natural extension of the W2 S1 + W2 S3 parallel-component lineage; the "editor-as-readonly" Pattern was a default-to-recommendation choice for style-drift prevention;
- Sessions 2-3 remaining: Session 2 = internal-hyperlink TipTap extension (custom extension recognizing `#url/<urlId>` shorthand + resolving to URL detail page navigation; may polish hyperlink-insertion affordance UI via "Link to URL" button helper); Session 3 = conditional deploy if Sessions 1-2 land clean;
- Continuation of the W1+W2+W3 calibration discipline — total P-46 spend now at 12 sessions (1 W1 + 5 W2 build + 1 W2 deploy + 3 W3 build + 1 W3 deploy + 1 W4 build today) vs. 14-16 estimated trajectory for the full P-46 arc.

**Affected §A sections (informational — §A frozen per Rule 18):**

- **§A.4** (one Comprehensive Analysis page per Project synthesizing all platforms + competitors) — surfaced + implemented end-to-end; per-Project doc reads + writes against `ComprehensiveCompetitorAnalysis` row via the new DI-seam handlers; back-button to `/projects/[projectId]/competition-scraping` per §A.4's "back to Competition Data" wording.
- **§A.5** (TipTap rich-text editor library decision; full toolbar config for Comprehensive Analysis page) — surfaced + extended; W2 S1's `RichTextEditor` wrapper extended with the full toolbar (H1/H2/H3 + Bold + Italic + Underline + bullet/numbered lists + Link + Code block); `@tiptap/extension-underline` registered for both variants. `generateHTML` static render path mentioned in §A.5 was replaced with Pattern B "editor-as-readonly" — informational; no §A amendment.

**Impact on §A: None; §A stays frozen per Rule 18.** All §A binding decisions consumed cleanly. The two Patterns surfaced today are §B refinements on §A.4 + §A.5's implementation shape, not amendments to the binding decisions.

**Cross-references:**

- CORRECTIONS_LOG §Entry 2026-05-24-b (the closing entry for this session — captures the same Pattern memorializations + the Rule 14a tightening first-application + calibration data point from a procedural perspective; this §B captures the same content from a design/implementation perspective).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-25 (W2 S1's "PerItemAnalysisBox extraction" Pattern — direct parent of today's Pattern A).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-27 (W2 S3's "OverallAnalysisBox parallel component" Pattern — sibling parallel-component Pattern at per-category scope).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-24 (W3 deploy entry — captures the Rule 14a tightening mechanical prevention that today's session applied for the first time).
- `docs/ROADMAP.md` P-46 polish-backlog entry (annotated this session — WS#4 Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-24-b; (a.81) closed; new (a.82) opened for Workstream 4 Session 2).

**Closing line:** Workstream 4 Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-24-b. P-46 implementation arc progress: Workstreams 1 + 2 + 3 = ✅ DONE-AND-VERIFIED on vklf.com; Workstream 4 Session 1 = ✅ DONE-AT-CODE-LEVEL (1 of ~2-3 estimated sessions). Next session: Workstream 4 Session 2 — internal-hyperlink TipTap extension per §C.4 Session 2 spec.

---

## §B 2026-05-25 — `session_2026-05-25_p46-workstream-4-session-2-internal-hyperlink-tiptap-extension` — Workstream 4 Session 2 lands the internal-hyperlink TipTap extension + Link-to-URL toolbar picker end-to-end at code level + NEW reusable Pattern "Custom TipTap extension via `addProseMirrorPlugins` for click interception of shorthand hrefs without a custom Mark type" + TWO Rule 14f session-start picker outcomes + Workstream 4 implementation arc COMPLETE at code level (Sessions 1-2 of ~2-3 estimated)

**Session:** `session_2026-05-25_p46-workstream-4-session-2-internal-hyperlink-tiptap-extension`
**Date:** 2026-05-25
**Branch:** `workflow-2-competition-scraping` (single-branch session; no main push since Session 2 is a build session, not a deploy session)
**Build commit:** `5854eff` — 8 files +786/-1
**Author:** Claude Code (149th session)

### What landed (file-by-file matching build commit `5854eff`)

- **NEW** `src/lib/rich-text/url-reference-helpers.ts` (~115 LOC pure helpers) — `extractUrlIdFromHref(href)` returns the matched id or `null` from a `#url/<urlId>` shape; `buildInternalUrlPath(projectId, urlId)` returns the canonical detail-page path; `buildInternalUrlHref(urlId)` returns the canonical shorthand `#url/<urlId>` href used inside the editor doc; `filterUrlsByQuery(urls, query)` returns a case-insensitive filtered subset of the URL picker entries; `defaultLinkLabelForUrl(url)` derives a sensible default link text from a URL's product name or seller name or the raw URL. Exports `URL_REFERENCE_HREF_PREFIX = '#url/'` constant + `UrlPickerEntry { id, productName, sellerName, url }` interface.
- **NEW** `src/lib/rich-text/url-reference-helpers.test.ts` (~158 LOC; 19 new node:test cases bringing src/lib to **783 from baseline 764** — exact match).
- **NEW** `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/components/UrlReferenceExtension.ts` (~105 LOC TipTap Extension via `addProseMirrorPlugins`). Intercepts clicks on `<a href="#url/<urlId>">` in both editable + read-only modes via ProseMirror's `handleClick` prop. Extracts urlId via the pure helper from the raw `getAttribute('href')` value — **not** `link.href` which is browser-resolved to an absolute fragment URL that includes the page path. Calls `options.onInternalLinkClick(urlId)` callback so the consumer decides how to resolve the click.
- **NEW** `src/app/projects/[projectId]/competition-scraping/comprehensive-analysis/components/LinkToUrlPicker.tsx` (~304 LOC toolbar dropdown). Lazy-loads URL list via `authFetch('/api/projects/<projectId>/competition-scraping/urls')` on first open + caches. Case-insensitive search filter via the shared `filterUrlsByQuery` helper. On pick, inserts the chosen URL's default label text at cursor position + applies the Link mark with `#url/<urlId>` href via TipTap's `editor.chain().focus().insertContent({...}).setLink({href}).run()` pattern. Closes on outside-click; tab/arrow keys navigate the filtered list.
- **MODIFIED** `src/app/projects/[projectId]/competition-scraping/components/RichTextEditor.tsx` (+90/-1 LOC) — accepts a new optional `projectId?: string` prop; uses `useRouter` from `next/navigation`; stores `projectId` + `router` in refs so the click handler (registered ONCE at editor mount via the Extension's `handleClick`) always sees the current values without stale-closure bugs; registers `UrlReferenceExtension` with `handleInternalLinkClick = (urlId) => { if (projectIdRef.current) routerRef.current?.push(buildInternalUrlPath(projectIdRef.current, urlId)) }` callback; extends `Link.configure`'s `isAllowedUri` to accept `#url/` hrefs (otherwise the Link extension's default URL-shape gatekeeper would reject the non-http href shape and silently strip the mark); surfaces `LinkToUrlPicker` in the 'full' toolbar variant only when `projectId` provided; inline `<style>` tag with `InternalLinkStyles` component for distinct styling (🔗 emoji glyph prefix + same blue underlined per session-start picker outcome).
- **MODIFIED** `AnalysisEditor.tsx` (+7 LOC) — accepts + passes-through `projectId` prop.
- **MODIFIED** `AnalysisReadView.tsx` (+5 LOC) — accepts + passes-through `projectId` prop (the read-mode editor also needs the click interception since rendered hyperlinks must navigate in read mode).
- **MODIFIED** `comprehensive-analysis/page.tsx` (+2 LOC) — passes `projectId` (already in scope via `useParams()`) to both children.

### TWO Rule 14f session-start picker outcomes

1. **Session 2 scope.** Director picked **"Extension + Link-to-URL picker (Recommended)"** over "Extension only, picker deferred" + "Picker only (NOT recommended)" per `feedback_recommendation_style.md`. The picker is the user-facing affordance that makes the shorthand discoverable + ergonomic; without it, only users who already know the `#url/<urlId>` syntax can use the feature.

2. **Visual styling of internal hyperlinks.** Director picked **"Distinct — small URL icon prefix + same blue (Recommended)"** over "Identical — same blue underlined" + "Distinct — different color." Same blue underlined as external links BUT prefixed with a small 🔗 emoji glyph signaling "internal URL navigation." Implemented via inline `<style>` tag emitted by the editor wrapper, scoped to `.plos-rt-editor a[href^="#url/"]::before { content: "🔗 "; ... }`.

### Design choices captured (ZERO Rule 14f sub-pickers fired during execution; each had a clear "most thorough/reliable" default per `feedback_default_to_recommendation.md`)

- **Extension vs. custom Mark type.** Chose **Extension via `addProseMirrorPlugins`** (lower-cost + reuses the existing Link mark). A custom Mark would have required a new schema type + custom rendering + custom parsing rules. The shorthand href can ride inside the standard Link mark; no separate Mark needed.

- **ProseMirror `handleClick` vs. a per-Mark click handler.** Chose **`handleClick` at the EditorView level**. It intercepts at the right layer (DOM event) + sees the raw DOM node so `getAttribute('href')` returns the unresolved shorthand — `link.href` (the property access) would have returned a browser-resolved absolute URL including the current page path, making the prefix match harder.

- **Stale-closure prevention via refs.** Chose **refs for `projectId` + `router`** over a fresh extension registration on every render. The Extension's `handleClick` is registered ONCE at editor mount; if it captured `projectId` + `router` directly from props, prop changes mid-session would leave the handler with stale values. Refs solve this without forcing editor re-creation on every prop change (which would discard editor state — undo history, selection, cursor position).

- **Lazy URL list load.** Chose **load-on-first-open** for the LinkToUrlPicker over load-at-mount. Saves bandwidth on docs the user never edits + on read-only views where the picker isn't shown.

- **Extending `Link.configure`'s `isAllowedUri`.** The default Link extension's URL-shape gatekeeper rejects non-http hrefs and silently strips the mark on paste/parse. The fix is one line: `Link.configure({ ..., isAllowedUri: (url) => url.startsWith(URL_REFERENCE_HREF_PREFIX) || defaultIsAllowedUri(url) })`. Worth memorializing because the failure mode is silent — the Link mark just disappears at parse time with no error.

- **CSS attribute selector for visual signal.** Chose **`.plos-rt-editor a[href^="#url/"]::before { content: "🔗 "; }`** over a custom Mark type. The CSS selector reuses the Extension's recognition criterion (the `#url/` prefix), so the styling + the click interception share their criterion + can't drift apart.

### NEW reusable Pattern — "Custom TipTap extension via `addProseMirrorPlugins` for click interception of shorthand hrefs without a custom Mark type"

When a feature needs to recognize + intercept clicks on a non-standard href shape (here: `#url/<urlId>` shorthand), the lowest-cost design is an Extension (not a new Mark) that:

1. Adds a ProseMirror plugin via `addProseMirrorPlugins` returning a `Plugin` with `props.handleClick`.
2. Reads the raw href via the DOM node's `getAttribute('href')` (NOT `link.href` — that property is browser-resolved to an absolute URL).
3. Filters by the shorthand prefix (or any other shape-test) via a pure helper imported from a shared `src/lib/` module.
4. Delegates the resolution to a consumer-supplied callback (e.g., `options.onInternalLinkClick(urlId)`).

The existing Link mark is REUSED (just extend `Link.configure`'s `isAllowedUri` to accept the shorthand prefix).

A separate visual signal (CSS attribute selector + `::before` content) handles distinctness without a Mark-level type discriminator.

**WHEN TO USE:** any TipTap doc where you need to recognize + handle a custom href shape but the styling + storage shape of the Link mark are otherwise fine. **WHEN NOT TO USE:** if you need fundamentally different storage shape (extra attributes beyond href), use a custom Mark; if you need different schema position semantics (e.g., a Node not a Mark), use a Node.

This is the **third W4-arc Pattern**, paired with W4 S1's Pattern A "Per-Project edit-affordance parallel to per-row edit-affordance" + W4 S1's Pattern B "Editor-as-readonly substitutes for a separate static renderer."

### Verification scoreboard (all 6 checks GREEN at new baselines)

| Check | Status | Baseline → New |
|-------|--------|----------------|
| 1. Root tsc | GREEN | clean → clean |
| 2. Extension tsc | GREEN | clean → clean |
| 3. Extension `npm test` | GREEN | 558 → 558 (UNCHANGED) |
| 4. src/lib node:test | GREEN | 764 → **783 (+19 — exact match with 19 new url-reference-helpers.test.ts cases)** |
| 5. `npm run build` routes | GREEN | 62 → 62 (UNCHANGED — no new route paths) |
| 6. Playwright | SKIPPED per non-deploy-session convention | — |

### Schema impact

**Schema-change-in-flight flag STAYS NO** the entire session — no `prisma db push`; pure client-side TipTap extension on top of W4 S1's editor wrapper + page route + components. The new helpers + Extension + picker all operate on doc shapes that were already valid TipTap JSON before this session; nothing new is persisted.

### Impact on §A

**None.** §A.4's example syntax named the `#url/<urlId>` shorthand shape; §A.5's guidance named "custom TipTap extension" for the click-interception mechanism; today's session consumed both as specced. **§A stays frozen per Rule 18.**

### Calibration data point

**Session 2 of 2-3 estimated landed cleanly within bundled scope.** Total in-session time ~150-180 min. No overrun. No fix-forward. All 7 in-session TaskCreate tasks completed cleanly. **W4 implementation arc COMPLETE at code level across Sessions 1-2 of ~2-3 estimated** — landed at the low end of the estimate; budget remains for a single deploy session as the third W4 session.

### Cross-references

- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-24-b (W4 S1's design doc append — captured Pattern A + Pattern B; today's Pattern is the third W4-arc Pattern).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §A.4 + §A.5 (consumed as specced).
- CORRECTIONS_LOG §Entry 2026-05-25 (today's Workstream 4 Session 2 closing entry — captures the same content from a corrections-log perspective).
- `docs/ROADMAP.md` P-46 polish-backlog entry (annotated this session — WS#4 Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-25; (a.82) closed; new (a.83) opened for Workstream 4 deploy session).

**Closing line:** Workstream 4 Session 2 ✅ DONE-AT-CODE-LEVEL 2026-05-25. P-46 implementation arc progress: Workstreams 1 + 2 + 3 = ✅ DONE-AND-VERIFIED on vklf.com; Workstream 4 Sessions 1-2 = ✅ DONE-AT-CODE-LEVEL (W4 arc COMPLETE at code level across Sessions 1-2 of ~2-3 estimated). Next session: Workstream 4 deploy session — Phase-4 deploy ff-merging `workflow-2-competition-scraping` → `main` carrying W4 Sessions 1+2 build commits + doc-batch commits.

---

## §B 2026-05-26 — `session_2026-05-26_p46-workstream-4-deploy-session-phase-4-verification-deferred` — Workstream 4 DEPLOY SESSION ships W4 Sessions 1+2's UI + route-handler code to vklf.com end-to-end via ff-merge `cafd3ed..096a2ac` (4 commits) + Phase-4 director real-Chrome verification DEFERRED to next session at director request + NEW informational Pattern "Truncated picker response → fire clarifying picker, don't silently interpret" + Workstream 4 status flips to ✅ DEPLOYED-PHASE-4-PENDING (not yet ✅ DONE-AND-VERIFIED until Phase-4 PASS next session)

**Session:** `session_2026-05-26_p46-workstream-4-deploy-session-phase-4-verification-deferred`
**Branch:** `workflow-2-competition-scraping` → `main` (ff-merge — main moved from `ac45737` to `096a2ac` via 4-commit fast-forward; `workflow-2-competition-scraping` unchanged at `096a2ac` before + after the ff-merge — ff-merge only changes main's SHA, not the source branch's; no mid-session ping-pong sync needed)
**Deploy events:** 1 — initial ff-merge `cafd3ed..096a2ac` carrying 4 commits (W4 S1 build `283d4d1` + W4 S1 doc-batch `8b30ab3` + W4 S2 build `5854eff` + W4 S2 doc-batch `096a2ac`); ZERO in-session fix-forwards because Phase-4 director real-Chrome verification was DEFERRED to next session at director request
**Total pushes today:** 3 — 1 deploy push to `origin/main` (gated via AskUserQuestion Rule 9 picker; director picked "Deploy now — push to origin/main (recommended)" after a clarifying picker disambiguated a truncated director response "deploy now but defer any real wor") + 1 end-of-session doc-batch push to `origin/workflow-2-competition-scraping` + 1 end-of-session ff-merge push to `origin/main` for the doc-batch (operationally adjacent to the deploy push — does NOT re-invoke Rule 9)
**Director directive at deploy time:** *"deploy now but defer any real wor"* (truncated; clarified via clarifying picker to "Deploy now — but pause BEFORE the push to main" which is effectively identical to default Rule 9 behavior)
**Status:** Workstream 4 ✅ DEPLOYED-PHASE-4-PENDING 2026-05-26 on vklf.com. W4 implementation arc COMPLETE at code level across Sessions 1-2 of ~2-3 estimated + deploy COMPLETE + Phase-4 verify NEXT session. **W4 flips to ✅ DONE-AND-VERIFIED after Phase-4 PASS next session per (a.84) RECOMMENDED-NEXT.** If Phase-4 surfaces issues → fix-forward cascade per the 2026-05-24 W3 deploy Pattern.

**What landed this session — empirical narrative:**

The session began with the pre-deploy /scoreboard verification on `workflow-2-competition-scraping`. All 5 checks GREEN at expected W4 S2 baselines: root tsc clean / extension tsc clean / 558 ext UNCHANGED / 783 src/lib UNCHANGED / 62 routes UNCHANGED. Check 6 Playwright SKIPPED per Rule 27 picker — director picked SKIP since ff-merge bundle has zero `extensions/` source files (no extension dist changes to test) and the new W4 page surface has no existing Playwright spec coverage.

At the Rule 9 gate moment, Claude fired an AskUserQuestion picker. Director's first answer rendered as a truncated string "deploy now but defer any real wor" (no trailing "k" — likely a UI rendering truncation, not director error). Claude did NOT silently interpret + fired a clarifying AskUserQuestion picker offering 4 disambiguation options (deploy-now-skip-Phase4, deploy-now-pause-before-push, deploy-then-defer-everything-else, defer-entire-deploy). Director picked **"Deploy now — but pause BEFORE the push to main"** which was effectively identical to default Rule 9 behavior (the default Rule 9 disposition is exactly: pause + ask director + then push on Yes).

`git push origin main` executed cleanly, fast-forwarding main from `ac45737` to `096a2ac`. Vercel auto-redeploy fired (~2-3 minute build + cache invalidation). Post-merge /scoreboard on `main` 5/5 GREEN at exact same baselines.

At this point director directed deferring the Phase-4 director real-Chrome verification to next session. **The 10-step verification walkthrough was drafted in-session** — director's request was that the walkthrough be preserved verbatim so next session can copy + execute it. The walkthrough covers: navigation from Competition Data → standalone "→ Comprehensive Competitor Analysis" button → page loads → toggle edit mode → type body content + insert `#url/<urlId>` shorthand via the "Link to URL" toolbar dropdown → toggle Done → click the rendered hyperlink → confirm navigation → back-button returns to Comprehensive Analysis page → final edit-mode toggle. Cross-platform exception applies (the new page is per-Project not per-platform, so director picks any one platform). Drafted walkthrough preserved verbatim in `docs/NEXT_SESSION.md` ## Launch prompt section.

**NEW informational Pattern memorialized — "Truncated picker response → fire clarifying picker, don't silently interpret":**

When director's AskUserQuestion answer renders as a truncated string (e.g., missing the trailing word or character of an answer that's clearly mid-sentence), Claude must NOT silently interpret the truncated text. Instead, Claude fires a clarifying AskUserQuestion picker offering the most likely 3-4 disambiguation options + lets director pick. Today's session validated this Pattern: director's first AskUserQuestion answer rendered as "deploy now but defer any real wor" — Claude could have inferred "deploy now but defer any real work" (= ship the deploy + skip non-deploy work), but the inference space was actually larger (was "real work" Phase-4 verification? fix-forwards? next-session prep? unclear). Claude fired a 4-option clarifying picker; director picked the most-thorough deploy option which was effectively default Rule 9 behavior.

**Why this Pattern matters:** AskUserQuestion picker text is short-form by design (often single phrases or one-liners), so a truncated reply that drops a critical word can flip the meaning entirely (e.g., "deploy now AND defer X" vs. "deploy now BUT defer X" — opposite implications for X). Silent interpretation risks the wrong execution path. Clarifying picker overhead is small (~30 seconds) and the disambiguation has perfect fidelity since director picks the literal text.

**Pairs with Rule 14g** (trust director confirmation when explicit, but ambiguity → clarify rather than assume). **Could become a feedback memory if it recurs** — for now, informational only; one observation insufficient to confirm a recurring pattern.

**Multi-session-workstream deploy pattern observations across §B entries — the third such observation:**

This §B 2026-05-26 entry is the **third multi-session-workstream deploy pattern observation in this design doc**, joining §B 2026-05-23-c (W2 deploy) + §B 2026-05-24 (W3 deploy with 5-fix-forward cascade). The three observations together calibrate the deploy-session shape:

- **§B 2026-05-23-c (W2 deploy):** memorialized the "Multi-session workstream deploy gate timing" Pattern — the deploy session lands after the LAST build session that contains user-visible UI (NOT after every build session). W2 had 5 build sessions; the deploy session was session #6 in the W2 arc.
- **§B 2026-05-24 (W3 deploy):** memorialized the "Phase-4 verification fix-forward cascade in a single deploy session" Pattern — when Phase-4 surfaces multiple issues post-deploy, fix-forward in-session; each fix-forward = own build commit + own Rule 9 gate + own Phase-4 reverify cycle. W3 deploy set the high-water mark at 6 deploys (initial + 5 fix-forwards) resolving 11 verification issues.
- **§B 2026-05-26 (today's W4 deploy):** validates the alternate branch of the W3 Pattern — when director defers Phase-4 to next session, the deploy session is a single-deploy with zero fix-forwards; the Phase-4 verification becomes its own next session (with its own potential fix-forward cascade if issues surface there). The deploy mechanic + the Phase-4 verify mechanic can be decoupled across two sessions when director chooses.

Calibration data point: across W2 + W3 + W4 deploy sessions, the total deploy-event count is 1 (W2) + 6 (W3) + 1 (W4 so far) = 8 deploys to ship 3 workstreams' UI surfaces to vklf.com. W3 was the outlier with the high-fix-forward count; W2 + W4 were single-deploy sessions (W4's single-deploy was because Phase-4 was deferred — the actual fix-forward count for W4 will be known after next session's Phase-4 verify).

**Verification scoreboard:**

- Pre-deploy /scoreboard (workflow-2 before ff-merge): root tsc clean / extension tsc clean / 558 ext UNCHANGED / 783 src/lib UNCHANGED / 62 routes UNCHANGED; Check 6 Playwright SKIPPED per Rule 27 (no `extensions/` source files in the ff-merge bundle)
- Post-merge /scoreboard (main after ff-merge): identical baselines preserved through ff
- No fix-forwards happened (Phase-4 deferred to next session)

**P-43 cwd-leak class re-reproduced TWICE during /scoreboard execution (LOW informational sub-observation; 5th+ reproduction overall):**

Both reproductions happened on Check 5 (Next.js `npm run build` route count) in pre-deploy AND post-merge /scoreboard runs. Root cause: parallel Checks 2+3 use `cd /workspaces/brand-operations-hub/extensions/competition-scraping && ...` which drifts the shell cwd to the extension directory; Check 5's template in `.claude/commands/scoreboard.md` has a bare `npm run build` without an absolute-cd prefix, so it picked up the drifted cwd and ran the EXTENSION build instead of the Next.js build. Caught immediately from output content + recovered with absolute `cd /workspaces/brand-operations-hub && npm run build` retry; final 62-routes result correct after retry.

**Mechanical prevention candidate (informational only; NOT shipped this session):** add absolute `cd /workspaces/brand-operations-hub` prefix to ALL Bash commands in `.claude/commands/scoreboard.md` (specifically Check 5's `npm run build` + route-count grep), not just the extension-rooted Checks 2-3. The prior P-43 template-hardening pass (2026-05-22-g) added absolute cd to Checks 2-3 (the drift-causing checks) but did NOT add it to Check 5 (the drift-absorbing check). Bilateral hardening would make the template robust against any reordering or parallelization changes. Candidate for a future P-43-followup polish session, but not blocking any active workstream. NOT a top-tier slip — recovery was immediate + result was correct.

**Affected §A sections (informational — §A frozen per Rule 18):**

- §A.4 (Comprehensive Competitor Analysis page surface) — fully deployed; the per-Project rich-text doc + the "Link to URL" toolbar picker + the internal-hyperlink rendering are all now live on vklf.com awaiting Phase-4 verification.
- §A.5 (TipTap editor wrapper with variant='full' toolbar) — fully deployed; H1/H2/H3 + Bold + Italic + Underline + bullet/numbered lists + Link + Code block + the new "Link to URL" picker are all live on vklf.com.
- §C.4 — Workstream 4 implementation outline; Sessions 1-2 fully consumed; Session 3 (deploy) consumed today; Phase-4 verify becomes effectively a Session 4 (NOT in original §C.4 estimate of ~2-3 sessions; calibration data point — when Phase-4 is deferred to a separate session, the total workstream session count is build sessions + 1 deploy + 1 Phase-4 verify = build+2 sessions). Useful data point for sizing W#5: §C.5 estimates ~1-2 build sessions; with the deferred-Phase-4 branch as a possibility, total W#5 spend could be 1 build + 1 deploy + 1 Phase-4 verify = 3 sessions worst case.

**Impact on §A: None; §A stays frozen per Rule 18.** All §A binding decisions consumed cleanly; the deploy was a pure mechanical shipment of W4 S1 + S2's code to vklf.com with no design changes required.

**Calibration data point — full W1+W2+W3+W4 implementation arc progress:**

- Workstream 1 = 1 build session + folded into W2 deploy (under §C.1's 2-3 estimate);
- Workstream 2 = 5 build sessions + 1 deploy session (top end of §C.2's 3-5 estimate);
- Workstream 3 = 3 build sessions + 1 deploy session with 6 deploy events from fix-forward cascade (low end of §C.3's 3-4 estimate for build sessions);
- Workstream 4 = 2 build sessions + 1 deploy session + 1 Phase-4 verify session pending (top end of §C.4's ~2-3 estimate for build sessions, with the deferred-Phase-4 branch adding 1 extra session vs. the typical in-deploy Phase-4 pattern);
- **Combined W1+W2+W3+W4 = 13 sessions (so far)** vs. 9-14 estimated (sum of §C.1+§C.2+§C.3+§C.4 floor/ceiling — with W4 trending toward 14 if Phase-4 verifies clean OR 15+ if fix-forwards land);
- Useful data point for sizing Workstream 5: W5 = ~1-2 sessions per §C.5; **total P-46 spend trending toward 15-17 sessions** vs. the original 11-17 estimate post-Q1+Q9 scope reductions.

**Cross-references:**

- CORRECTIONS_LOG §Entry 2026-05-26 (the closing entry for this deploy session — captures the same content from a corrections-log/procedural perspective; this design doc §B captures it from a design/implementation perspective).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-25 (yesterday's W4 Session 2 closing entry — captures the third W4-arc Pattern "Custom TipTap extension via `addProseMirrorPlugins`" + the W4 implementation arc COMPLETE at code level across Sessions 1-2).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-24-b (W4 Session 1 closing entry — captures Pattern A + Pattern B + FIRST APPLICATION of Rule 14a tightening).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-24 (the W3 DEPLOY closing entry — established the "Phase-4 verification fix-forward cascade in a single deploy session" Pattern that today's W4 deploy validates the alternate branch of).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-23-c (the W2 DEPLOY closing entry — established the "Multi-session workstream deploy gate timing" Pattern that today's W4 deploy composes with the deferred-Phase-4 branch).
- `docs/ROADMAP.md` P-46 polish-backlog entry (annotated this session — WS#4 flipped to ✅ DEPLOYED-PHASE-4-PENDING 2026-05-26 on vklf.com via ff-merge `cafd3ed..096a2ac` (4 commits); (a.83) closed; new (a.84) opened for Workstream 4 Phase-4 verification session).
- `docs/NEXT_SESSION.md` (today's complete rewrite for the W4 Phase-4 verification session — preserves the 10-step verification walkthrough verbatim in the ## Launch prompt section so the next session can copy + execute it).

**Closing line:** Workstream 4 ✅ DEPLOYED-PHASE-4-PENDING 2026-05-26 on vklf.com via single ff-merge of 4 commits. Phase-4 director real-Chrome verification DEFERRED to next session at director request — 10-step walkthrough preserved verbatim in NEXT_SESSION.md. P-46 implementation arc progress: Workstreams 1 + 2 + 3 = ✅ DONE-AND-VERIFIED on vklf.com; Workstream 4 = ✅ DEPLOYED-PHASE-4-PENDING (W4 closes ✅ DONE-AND-VERIFIED after Phase-4 PASS next session per (a.84)). Next session: Workstream 4 Phase-4 verification session — director executes 10-step real-Chrome verification walkthrough on vklf.com.

---

## §B 2026-05-24-c — `session_2026-05-24-c_p46-workstream-5-session-1-extension-url-form-additions-and-reviews-modal-polish` — Workstream 5 Session 1 lands extension URL save form additions (Type / Description-1 / Description-2 / Price) at code level + opportunistic Reviews modal idempotency polish fixes the W2 Session 4 `CapturedReviewAddModal` clientId regen-on-every-Save bug + §C.5 file-list inconsistency informational observation (popup `UrlAddForm.tsx` doesn't exist — URL-add form lives only in content-script) + NEW reusable Pattern "Opportunistic-polish-during-build-session — when scanning a related surface for polish, real bugs may surface alongside cosmetic candidates; prioritize real bugs" + director double-defer informational calibration data point

**Session:** `session_2026-05-24-c_p46-workstream-5-session-1-extension-url-form-additions-and-reviews-modal-polish`
**Branch:** `workflow-2-competition-scraping` (single-branch; no main push; W5 deploy DEFERRED at director request — 2 build commits sit on workflow branch awaiting future W5 deploy session)
**Build commits this session:** TWO — (1) `3c981be` — W#2 polish P-46 Workstream 5 Session 1 — extension URL add form additions (Type/Description-1/Description-2/Price) — 4 files +225/-0; (2) `41172f1` — W#2 polish P-46 Workstream 5 polish — fix CapturedReviewAddModal clientId idempotency bug — 1 file +9/-1
**Pushes today:** 1 — end-of-session push of build commits `3c981be` + `41172f1` + today's doc-batch together to `origin/workflow-2-competition-scraping` (operationally adjacent; NO Rule 9 gate fired — no destructive operations, no main push)
**Director directive at session start:** deferred original launch-prompt task (W4 Phase-4 verify) + chose to "work on next item on roadmap" — resolved via clarifying picker to P-46 W5 (Recommended) over P-47 Shadow DOM refactor + P-43 mechanical prevention candidate
**Director directive at end-of-session:** free-text "Other" answer *"for the next session, defer any real world testing items that I need to do. instead work on the next item on our road map for workflow#2"* — resolved via follow-up picker to P-47 Shadow DOM refactor Session 1 (Recommended)
**Status:** Workstream 5 Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-24-c. W5 implementation arc progress: Session 1 of §C.5's 1-2 estimated landed at code level; DEPLOY-PENDING (deferred at director request). W4 status STAYS ✅ DEPLOYED-PHASE-4-PENDING 2026-05-26 on vklf.com (no change — Phase-4 verify deferred a second consecutive session).

**What landed this session — empirical narrative:**

Today was a scope-shift session. The original launch-prompt task was the P-46 Workstream 4 Phase-4 director real-Chrome verification on vklf.com. At session-start, director deferred that task again + chose to "work on next item on roadmap" instead. A clarifying picker resolved to P-46 Workstream 5 (Recommended) — the extension URL save form additions per §C.5.

The W5 Session 1 build landed cleanly via build commit `3c981be` (4 files +225/-0):

- **NEW `makeTextareaField()` helper** in `extensions/competition-scraping/src/lib/content-script/url-add-form.ts` alongside the existing `makeField()` helper. The textarea variant renders multi-line input for free-text fields (Description-1 / Description-2) while `makeField()` continues to handle single-line inputs (Type / Price).
- **4 new fields inserted between Brand Name + Sponsored Ad** at capture time in the URL add form: **Type** / **Description-1** / **Description-2** / **Price**. The position matches §A's intent for these structural fields — they sit near the top of the form alongside Brand Name + Sponsored Ad rather than at the bottom.
- **POST `/api/projects/[projectId]/competition-scraping/urls` handler allowlist** extended additively for the 4 new optional fields. Existing fields continue to work unchanged.
- **`CreateCompetitorUrlRequest` wire type** in `src/lib/shared-types/competition-scraping.ts` extended additively with the 4 new optional fields. Wire-type changes match the existing `additive optional fields` convention used throughout W#2 schema evolution.
- **3 new node:test cases** in `src/lib/competition-scraping/handlers/urls.test.ts` bringing src/lib from 783 to 786. The new cases cover the POST allowlist for each new field (trim-or-null normalization for the 2 textarea fields + trim-or-null for the 2 single-line fields) + a happy-path case combining all 4 new fields with the existing required fields.

All 5 scoreboard checks GREEN at new baselines (root tsc clean / ext tsc clean / 558 ext UNCHANGED / 786 src/lib +3 from baseline 783 / 62 routes UNCHANGED). Check 6 Playwright SKIPPED per non-deploy-session convention.

Then, while scanning the Reviews surface for opportunistic cosmetic polish (focus order / chip preview / placeholder text), a real correctness bug surfaced — the `CapturedReviewAddModal` clientId was being regenerated on every Save click, which defeated the server-side P2002 dedup on retries. The polish commit `41172f1` (1 file +9/-1) fixed it:

- **`CapturedReviewAddModal.tsx`** previously inlined `clientId: crypto.randomUUID()` inside `handleSubmit`, regenerating a new UUID on every Save click. The server-side P2002 dedup in `url-reviews.ts` correctly rejected duplicate clientIds, but the modal kept generating new ones — so retry-after-error appeared as a new submission instead of a duplicate.
- **Fix:** hoisted clientId to a `useState` seeded per modal-open (`useState(() => crypto.randomUUID())`) + reset on close via a `useEffect` that clears the UUID when the modal closes so the next open generates a fresh one. End-to-end: each modal-open session has exactly ONE clientId across all retry attempts, restoring the server-side P2002 dedup's correctness contract.
- **No new tests** — React component layer fix; server-side dedup already covered in `url-reviews.test.ts`.

Post-polish /scoreboard 5/5 GREEN at unchanged baselines.

**§C.5 file-list inconsistency informational observation (LOW; §C.5 stays frozen per Rule 18):**

§C.5 of this design doc listed `extensions/competition-scraping/src/entrypoints/popup/components/UrlAddForm.tsx` as a file Workstream 5 would touch. **That file DOES NOT EXIST in the repo.** The popup components dir has CapturedTextPasteForm + CapturedVideoPasteForm + ColorSwatchPopover + HighlightTermsManager + PlatformPicker + ProjectPicker + RegionScreenshotModeButton — no `UrlAddForm.tsx`. The URL-add form lives ONLY in the content-script at `src/lib/content-script/url-add-form.ts`.

**Why this is one-less-file simplification (NOT scope reduction):** §C.5 anticipated adding the 4 new fields to BOTH a popup form AND the content-script form. In practice the popup form doesn't exist — the URL-add flow is content-script-only. Today's W5 Session 1 build landed the 4 new fields in the content-script form via a new `makeTextareaField()` helper alongside the existing `makeField()` helper. The user-facing W5 scope is COMPLETE for URL-add capture; the §C.5 file-list overcounted by one.

**§C.5 stays frozen per Rule 18; informational only.** No §A or §C amendment needed; the observation is captured here in §B 2026-05-24-c.

**NEW reusable Pattern memorialized — "Opportunistic-polish-during-build-session — when scanning a related surface for polish, real bugs may surface alongside cosmetic candidates; prioritize real bugs":**

When a session's primary build scope is locked (today: P-46 W5 extension URL save form additions) but director permits opportunistic polish on related surfaces (today: scanning the Reviews surface for cosmetic UX targets), real correctness bugs may surface alongside the cosmetic candidates. **The Pattern: prioritize real bugs over cosmetic improvements when both surface during opportunistic polish.**

Today's instance: scanning Reviews modal for "improve focus order" / "improve chip preview" / "improve placeholder text" cosmetic candidates surfaced the clientId regen-on-every-Save correctness bug as the highest-value target. Cosmetic candidates deferred to a future polish session; correctness bug fixed today.

**Why this Pattern matters:** Opportunistic polish is bounded-time work inside a primarily-scoped build session; the polish budget should go to the highest-value target surfaced during the polish scan. Correctness bugs are always higher value than cosmetic improvements (correctness regressions affect users immediately; cosmetic regressions accumulate gradually). The Pattern guides time-budget allocation when multiple polish candidates surface.

**Pairs with:** `feedback_recommendation_style.md` (most-thorough/reliable) — when ranking polish candidates surfaced opportunistically, recommend the most-thorough/reliable target = the correctness bug; defer cosmetic candidates to a future polish session where they're the primary scope.

**Director double-defer informational calibration data point:**

Director deferred W4 Phase-4 director real-Chrome verification a second consecutive session today (originally deferred 2026-05-26 W4 deploy session + re-deferred 2026-05-24-c today). Director ALSO deferred W5 deploy + W5 Phase-4 verification at end-of-session per the directive *"defer any real world testing items that I need to do. instead work on the next item on our road map for workflow#2"*.

**Calibration insight:** when director defers Phase-4 verification across multiple consecutive sessions, the standing carry-overs section in NEXT_SESSION.md becomes the canonical place to preserve verification walkthroughs verbatim across sessions. The 10-step W4 Phase-4 walkthrough (preserved verbatim in 2026-05-26 NEXT_SESSION.md per yesterday's director directive) MUST be preserved verbatim AGAIN in today's NEXT_SESSION.md rewrite — the next session needs to be able to copy + execute it without re-deriving.

**No process change needed; just disciplined verbatim preservation across consecutive deferrals.** Today's NEXT_SESSION.md ## Standing carry-overs section preserves the W4 Phase-4 10-step walkthrough verbatim from the 2026-05-26 NEXT_SESSION.md + adds parallel W5 deploy + W5 Phase-4 verify carry-overs.

**Pairs with:** prior multi-session-workstream deploy pattern observations memorialized in design doc §B entries 2026-05-23-c (W2 deploy — "Multi-session workstream deploy gate timing" Pattern) + 2026-05-24 (W3 deploy — "Phase-4 verification fix-forward cascade in a single deploy session" Pattern) + 2026-05-26 (W4 deploy — "Truncated picker response → fire clarifying picker" Pattern + Phase-4 deferred-to-next-session branch). Together these calibrate the deploy + Phase-4 verify shape across W2-W5.

**Verification scoreboard:**

- Pre-deploy /scoreboard after W5 build commit `3c981be`: 5/5 GREEN at new baselines — root tsc clean / extension tsc clean / 558 ext UNCHANGED / **786 src/lib +3 from baseline 783** (exact match with 3 new urls.test.ts cases for the W5 POST allowlist) / 62 routes UNCHANGED. Check 6 Playwright SKIPPED per Rule 27 (non-deploy-session convention).
- Post-polish /scoreboard after Reviews polish commit `41172f1`: 5/5 GREEN at unchanged baselines — root tsc / ext tsc / 558 / 786 / 62 — no new tests (React component layer fix; server-side dedup already covered in url-reviews.test.ts).
- End-of-session baselines: root tsc clean / ext tsc clean / 558 ext / **786 src/lib (+3 net)** / 62 routes.

**Affected §A sections (informational — §A frozen per Rule 18):**

- §A.6 (URL detail page Sizes/Options removal + new structural fields Type/Description-1/Description-2/Price) — today's W5 Session 1 build added these 4 fields at the extension URL save form so they're captured at the moment a URL is added; the vklf.com-side editing already shipped in W2 Session 5 (2026-05-23-b). End-to-end the 4 fields are now captured at extension-add time + editable on vklf.com.
- §A.8 (Reviews capture workflow) — today's opportunistic Reviews modal polish fixed an idempotency bug shipped in W2 Session 4 (2026-05-28). No §A change; the W2 Session 4 design intent was correct, the implementation had a regression that's now fixed.
- §C.5 (Workstream 5 implementation outline) — listed `UrlAddForm.tsx` (popup) which doesn't exist; today consumed the actual content-script-only file; §C.5 stays frozen per Rule 18; one-less-file simplification captured above.

**Impact on §A: None; §A stays frozen per Rule 18.** All §A binding decisions consumed cleanly; the W5 Session 1 build matched §A.6's intent for the structural fields; the Reviews polish fixed an implementation regression, not a design issue.

**Calibration data point — Workstream 5 session count + full W1-W5 implementation arc progress:**

W5 Session 1 came in at the low end of §C.5's 1-2 estimate (just Session 1 today). W5 may close at code level pending W5 Session 2 if director scopes more W5 work (e.g., manual Reviews entry tweaks on vklf.com based on real-Chrome usage), OR W5 may close at code level today if W5 Session 1 fully covers §C.5's user-visible scope after the popup-form file simplification narrowed the work.

Combined W1+W2+W3+W4+W5 implementation arc progress (as of session-end 2026-05-24-c):
- Workstream 1 = 1 build session + folded into W2 deploy (under §C.1's 2-3 estimate);
- Workstream 2 = 5 build sessions + 1 deploy session (top end of §C.2's 3-5 estimate);
- Workstream 3 = 3 build sessions + 1 deploy session with 6 deploy events from fix-forward cascade (low end of §C.3's 3-4 estimate);
- Workstream 4 = 2 build sessions + 1 deploy session + 1 Phase-4 verify session pending (top end of §C.4's ~2-3 estimate; deferred-Phase-4 branch adds 1 extra session vs. typical in-deploy Phase-4 pattern; second consecutive defer today);
- Workstream 5 = 1 build session today (low end of §C.5's 1-2 estimate); deploy + Phase-4 verify both deferred.
- **Combined W1+W2+W3+W4+W5 = 14 sessions (so far)** vs. 10-16 estimated (sum of §C.1+§C.2+§C.3+§C.4+§C.5 floor/ceiling).
- **Total P-46 spend trending toward 16-18 sessions** vs. the original 11-17 estimate post-Q1+Q9 scope reductions — within range but at top end of estimate due to deferred-Phase-4 branches adding sessions.

**Cross-references:**

- CORRECTIONS_LOG §Entry 2026-05-24-c (today's W5 Session 1 + Reviews modal polish closing entry — captures the same content from a corrections-log/procedural perspective; this design doc §B captures it from a design/implementation perspective).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §C.5 (Workstream 5 implementation outline — listed `UrlAddForm.tsx` (popup) which doesn't exist; today consumed the actual content-script-only file; §C.5 stays frozen per Rule 18; one-less-file simplification captured in this §B 2026-05-24-c entry).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-26 (W4 deploy session — established the deferred-Phase-4-to-next-session branch; today's W4 Phase-4 verify deferred a second consecutive session; W5 deploy + W5 Phase-4 verify deferred today following the same branch).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-28 (W2 Session 4 — shipped CapturedReviewAddModal with the clientId bug fixed today; original implementation correctly extracted per-record handlers behind DI seam matching P-31 precedent but inlined clientId in handleSubmit defeating the server-side P2002 dedup on retries).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-23-c (the W2 DEPLOY closing entry — established the "Multi-session workstream deploy gate timing" Pattern).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-24 (the W3 DEPLOY closing entry — established the "Phase-4 verification fix-forward cascade in a single deploy session" Pattern).
- `docs/ROADMAP.md` P-46 polish-backlog entry (annotated this session — WS#5 status flipped to ✅ DONE-AT-CODE-LEVEL 2026-05-24-c — DEPLOY-PENDING (deferred at director request); WS#4 status STAYS ✅ DEPLOYED-PHASE-4-PENDING 2026-05-26 on vklf.com — no change; (a.85) closed + (a.84) stays open + (a.86) opens for P-47 Shadow DOM refactor Session 1).
- `docs/NEXT_SESSION.md` (today's complete rewrite for P-47 Shadow DOM refactor Session 1 + ## Standing carry-overs section preserving W4 Phase-4 10-step verification walkthrough verbatim + W5 deploy + W5 Phase-4 verify standing carry-overs).

**Closing line:** Workstream 5 Session 1 ✅ DONE-AT-CODE-LEVEL 2026-05-24-c. Opportunistic Reviews modal idempotency polish also DONE-AT-CODE-LEVEL. P-46 implementation arc progress: Workstreams 1 + 2 + 3 = ✅ DONE-AND-VERIFIED on vklf.com; Workstream 4 = ✅ DEPLOYED-PHASE-4-PENDING (W4 Phase-4 verify deferred a second consecutive session); Workstream 5 = ✅ DONE-AT-CODE-LEVEL — DEPLOY-PENDING (deferred at director request). Next session: P-47 Shadow DOM refactor Session 1 per (a.86). Standing carry-overs: W4 Phase-4 verify + W5 deploy + W5 Phase-4 verify (all preserved verbatim in NEXT_SESSION.md ## Standing carry-overs section).

---

## §B 2026-05-24-e — `session_2026-05-24-e_bundled-w5-p47-deploy` — bundled P-46 W5 + P-47 deploy session ships 3 build commits + 2 doc-batch commits behind ONE Rule 9 gate as the FIRST CROSS-WORKSTREAM bundled deploy in W#2 history + NEW reusable Pattern "Bundled-build-commit deploy under ONE Rule 9 gate" memorialized + Phase-4 director real-Chrome verification DEFERRED to next session per W4 deploy 2026-05-26 Pattern with 3 walkthroughs preserved verbatim in NEXT_SESSION.md ## Standing carry-overs section (W4 4th consecutive defer + W5 1st defer + P-47 1st defer) — informational; §A stays frozen per Rule 18

**Session shape:** Pure orchestration DEPLOY session on `workflow-2-competition-scraping` → `main`. ZERO new code. ZERO new schema. ZERO new dependencies. ZERO new routes. ONE Rule 9 gate fired (deploy push). TWO §4 Step 1c forced-pickers fired (Rule 9 deploy gate + Phase-4 in-session vs deferred). THREE pushes planned per `feedback_approval_scope_per_decision_unit.md` (deploy push DONE; end-of-session doc-batch push + ff-merge push pending). THREE DEFERRED items carry forward as standing carry-overs.

**Outcome:** Three build commits sitting on `workflow-2-competition-scraping` since the 2026-05-24-c W5 build + 2026-05-24-d P-47 build sessions shipped to `main` cleanly via ONE ff-merge `9205340..d68885a` carrying 5 commits (W5 build `3c981be` + Reviews polish `41172f1` + W5 doc-batch `4d0f771` + P-47 build `d08f673` + P-47 doc-batch `d68885a`) behind ONE Rule 9 gate; Vercel auto-redeploy fired (~2-3 minute build + cache invalidation); fresh extension zip `plos-extension-2026-05-24-w2-deploy-34.zip` 202.98 KB dropped at repo root via `npm run zip` in `extensions/competition-scraping/` (31st zip artifact at repo root; ready for director sideload at Phase-4 verification next session).

**Two §4 Step 1c forced-pickers fired this session:**

- **Rule 9 deploy gate picker** — picker offered (A) Deploy now — push to origin/main (Recommended) / (B) Hold + investigate first / (C) other. Director picked A per `feedback_recommendation_style.md` most-thorough/reliable.
- **Phase-4 in-session vs deferred picker** — picker offered (A) Run Phase-4 in-session now (Recommended per `feedback_recommendation_style.md` since in-session Phase-4 closes the deploy session with ✅ DONE-AND-VERIFIED instead of ✅ DEPLOYED-PHASE-4-PENDING) / (B) Defer Phase-4 to next session (per W4 deploy 2026-05-26 Pattern). Director picked B — "Defer to next session". This is the THIRD time the bundled-Phase-4 defer Pattern fires (W4 2026-05-26 first; W5+P-47 today second; W4 STILL pending for 4th consecutive defer is third instance).

**Pre-deploy /scoreboard on `workflow-2-competition-scraping`:** 5/5 GREEN at unchanged baselines (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 786 src/lib UNCHANGED / 62 routes UNCHANGED); Check 6 Playwright SKIPPED per Rule 27 non-deploy-spec convention (none of the 3 build commits introduced extension Playwright spec coverage — W5 added node:test cases to urls.test.ts; Reviews polish was React-component-only; P-47 was structural-only).

**Post-merge /scoreboard on `main`:** 5/5 GREEN at exact same baselines.

### NEW reusable Pattern memorialized — "Bundled-build-commit deploy under ONE Rule 9 gate"

**Shape:** When N build commits sit on a workflow branch awaiting deploy + each commit already passed /scoreboard GREEN at its own session + all commits are additive + no inter-commit dependencies require fix-forward sequencing, the most-thorough/reliable choice is to ff-merge ALL N commits behind ONE Rule 9 gate rather than splitting into N separate deploy sessions.

**Why it works:**
- Each build commit already passed individual session /scoreboards GREEN — the bundle's combined /scoreboard pre-deploy is operationally equivalent to N sequential individual /scoreboards.
- ff-merge to main is fast-forward only — no merge conflicts possible since the commits are linear on the workflow branch.
- Vercel auto-redeploy fires ONCE per main push regardless of how many commits in the push — so N separate deploy sessions would each pay the ~2-3 minute Vercel build + cache invalidation cost; bundling pays it once.
- Rule 9 deploy gate fires ONCE — director approval cost is constant regardless of N.
- Phase-4 verification can pair walkthroughs from sibling commits when they share the same UI surface (today: W5 + P-47 both ship via the extension form surface — Phase-4 covers both walkthroughs in one session at next-session).

**When to use:** N build commits already at ✅ DONE-AT-CODE-LEVEL with /scoreboard GREEN at individual sessions; all commits additive (no schema, no breaking changes); no inter-commit dependencies; Phase-4 verification walkthroughs can be paired OR deferred together.

**When NOT to use:** any commit has fix-forward dependency on another commit (must sequence individually); any commit involves schema-change-in-flight transition (deploy each schema commit individually for cleaner rollback); Phase-4 verification needs intermediate sign-off between commits.

**Exemplars in W#2 history:**
- **First exemplar — W2 deploy 2026-05-23-c** — carried 5 build sessions + Workstream 1 schema commits as one fast-forward. But single-workstream (all P-46 W2).
- **Second exemplar (FIRST CROSS-WORKSTREAM) — today's bundled W5 + P-47 deploy 2026-05-24-e** — the FIRST cross-workstream bundled deploy in W#2 history (P-46 W5 + P-46 Reviews polish + P-47 Shadow DOM are 3 distinct polish items shipped together; P-46 + P-47 are different ROADMAP polish entries).

**Pairs with prior deploy Patterns memorialized in §B entries of this doc:**
- §B 2026-05-23-c W2 deploy — "Multi-session workstream deploy gate timing" Pattern (deploy lands AFTER the LAST build session that contains user-visible UI, not after the schema session).
- §B 2026-05-24 W3 deploy — "Phase-4 verification fix-forward cascade in a single deploy session" Pattern (opposite end of the spectrum — 6 fix-forwards in one session demonstrating the pattern scales when issues are scoped + reversible + UI-only; today's deferred-Phase-4 means no fix-forward cascade possible this session).
- §B 2026-05-26 W4 deploy — single Rule 9 gate + Phase-4 deferred (closest analog to today's shape).

**Calibration data point:** today's bundled deploy landed cleanly without any fix-forwards (Phase-4 deferred so no fix-forward cascade possible this session). 3 prior standing carry-overs from 2026-05-24-c (W5 deploy + W5 Phase-4 verify + P-47 Phase-4 verify) all collapse: W5 deploy RESOLVED via today's bundled deploy; W5 + P-47 Phase-4 verifies RE-DEFERRED into next session's 3-walkthrough bundled Phase-4. ONE prior standing carry-over from 2026-05-26 (W4 Phase-4 verify) re-defers for 4th consecutive session.

### Phase-4 verification queued for next session — 3 walkthroughs bundled

Director picked "Defer to next session (per W4 deploy 2026-05-26 Pattern)" over Recommended "Run in-session now" at the Phase-4 picker. The 3 walkthroughs queued for next session:

- **(a) W4 Comprehensive Competitor Analysis page 10-step walkthrough** — 4th consecutive defer; carries forward verbatim from 2026-05-26 W4 deploy + 2026-05-24-c + 2026-05-24-d + today.
- **(b) W5 URL save form additions 4-step walkthrough** — 1st defer today.
- **(c) P-47 Shadow DOM mount 2-step walkthrough** — 1st defer today.

The (b) + (c) walkthroughs pair into ONE Phase-4 step at next session (same extension form surface — director walks both verifications on the same Amazon product page in one sitting); (a) is a separate Phase-4 step on the per-Project Comprehensive Competitor Analysis page on vklf.com.

If all 3 walkthroughs PASS next session → P-46 W4 + W5 + P-47 all flip to ✅ DONE-AND-VERIFIED + P-46 Workstream 5 closes the entire P-46 implementation arc end-to-end + P-47 closes (only Session 1 was needed at code level + Phase-4; Sessions 2-3 from the original P-47 estimate MERGED into today's bundled deploy).

If any walkthrough FAILS or PARTIAL → initiate fix-forward cascade per W3 deploy 2026-05-24 Pattern.

### Impact on §A

**None.** §A stays frozen per Rule 18. Today's bundled deploy + Phase-4 deferral consumes specs already locked: §A.2's click-to-edit cells + structural fields (W5); §A.11's schema additions (W5 already-deployed since W1's 2026-05-24 + 2026-05-23-c W2 deploy); §A.5's TipTap editor (W4 already-deployed since 2026-05-26 W4 deploy); the P-47 Shadow DOM mount is content-script architecture not covered by §A.

### Cross-references

- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-24-e (this session's closing §Entry — the bundled W5 + P-47 deploy session closing entry capturing bundled-deploy outcome + NEW Pattern + LOW informational dual P-43 cwd-leak reproductions + calibration data point).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-24-e (parallel deploy entry in the W#2 design doc — captures the P-47 Shadow DOM mount DEPLOY outcome from a content-script architecture perspective; pairs with §B 2026-05-24-d as the build session entry + today's §B as the deploy entry; today's bundled deploy spans BOTH design docs since it ships cross-doc-scoped commits).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-23-c (the W2 DEPLOY closing entry — established the "Multi-session workstream deploy gate timing" Pattern; precedent for single-workstream bundled deploy).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-24 (the W3 DEPLOY closing entry — established the "Phase-4 verification fix-forward cascade in a single deploy session" Pattern; reference for what to do if next session's Phase-4 surfaces issues).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-26 (the W4 DEPLOY closing entry — established the Phase-4-deferred-to-next-session branch + the bundled-Phase-4 defer Pattern that today's session executes the deferred Phase-4 for via the 3-walkthrough bundle next session).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-24-c (the W5 build session entry + the standing carry-overs that all RESOLVE at today's deploy or RE-DEFER into next session's Phase-4).
- `docs/ROADMAP.md` P-46 polish-backlog entry (annotated this session — WS#5 status flipped to ✅ DEPLOYED-PHASE-4-PENDING 2026-05-24-e on vklf.com; WS#4 status STAYS ✅ DEPLOYED-PHASE-4-PENDING 2026-05-26 on vklf.com — no change; (a.87) closed + (a.88) opens for the bundled Phase-4 real-Chrome verification session).
- `docs/ROADMAP.md` P-47 polish-backlog entry (annotated this session — status flipped to ✅ DEPLOYED-PHASE-4-PENDING 2026-05-24-e on vklf.com).
- `docs/NEXT_SESSION.md` (today's complete rewrite for the bundled Phase-4 real-Chrome verification session + ## Standing carry-overs section preserving W4 10-step + W5 4-step + P-47 2-step verification walkthroughs verbatim).

**Closing line:** Bundled W5 + P-47 deploy session ✅ DEPLOYED-PHASE-4-PENDING 2026-05-24-e on vklf.com via `workflow-2-competition-scraping` → `main` bundled ff-merge `9205340..d68885a` carrying 5 commits (3 build + 2 doc-batch) behind ONE Rule 9 gate. P-46 implementation arc progress: W1-W3 = ✅ DONE-AND-VERIFIED on vklf.com; W4 + W5 = ✅ DEPLOYED-PHASE-4-PENDING (both bundle into next session's 3-walkthrough Phase-4 step alongside P-47). Next session: bundled Phase-4 real-Chrome verification session per (a.88) covering W4 10-step + W5 4-step + P-47 2-step walkthroughs.

---

## §B 2026-05-24-f — `session_2026-05-24-f_p46-w4-phase4-fix-forward-1-then-w5-p47-phase4-pass-plus-p48-capture` — Bundled Phase-4 verification session + W4 fix-forward #1 + W4 + W5 Phase-4 PASS lifecycle closes the entire P-46 5-workstream polish arc end-to-end on vklf.com; NEW reusable Pattern "Bundled Phase-4 verification surfaces issues concentrated in the most-complex newest surface" + NEW reusable Pattern "Editor save-on-Done race condition (debounced save + unmount cleanup)" + LOW informational on UX directive surfacing 3+ months after styling shipped + NEW P-48 cross-reference

**§A frozen** per Rule 18. This entry is informational + lifecycle-completion. **W4 implementation arc COMPLETE end-to-end ✅ DONE-AND-VERIFIED 2026-05-24-f on vklf.com**: Sessions 1-2 build (2026-05-24-b + 2026-05-25 per §B entries above) + deploy 2026-05-26 (Phase-4 deferred per §B entry above) + fix-forward #1 + Phase-4 PASS today (this entry). **W5 implementation arc COMPLETE end-to-end ✅ DONE-AND-VERIFIED 2026-05-24-f on vklf.com**: Session 1 build 2026-05-24-c (per §B entry above) + bundled deploy 2026-05-24-e (per §B entry above) + Phase-4 PASS today. **P-46 ENTIRE 5-WORKSTREAM POLISH ARC CLOSES ✅ DONE-AND-VERIFIED END-TO-END 2026-05-24-f on vklf.com** — W1 schema + W2 URL detail page redesign + W3 Competition Data table redesign + W4 Comprehensive Competitor Analysis page + W5 Extension URL save form additions ALL ✅ DONE-AND-VERIFIED.

**Bundled Phase-4 verification session mechanics.** Director walked 3 deferred verification scripts in one sitting per Rule 26 ## Standing carry-overs Pattern: (a) W4 10-step on per-Project page; (b) W5 4-step on extension URL save form via Amazon product page; (c) P-47 2-step on extension video-capture form via same Amazon product page (paired into one sitting with (b)).

**Walkthrough (a) W4 — 7 director-observed issues surfaced** during the 10-step walkthrough:
1. No blinking cursor visible when entering edit mode.
2. H1 / H2 / H3 headings don't visibly render larger than body text.
3. Inserted hyperlink doesn't render underlined.
4. Bullets in bullet list don't show.
5. Done button doesn't save the typed content (text disappears on toggle back to read mode).
6. No font-size option in the toolbar.
7. Dark background for the editor surface (director directive *"please don't pick a dark background for the editor where the text is added"* — sitewide directive, not W4-specific).

**Fix-forward #1 mechanics:** all 7 issues bundled into ONE UI-only build commit `d38b036` (5 files +292/-94) under ONE Rule 9 deploy gate (director picked "Deploy now — Recommended" per `feedback_recommendation_style.md` recommended path); ff-merge `5ed754e..d38b036` clean fast-forward; Vercel auto-redeploy fired ~2-3 minute cycle; director re-walked all 10 W4 Phase-4 steps post-redeploy → ALL PASS.

**TWO Rule 14f forced-pickers fired during fix-forward shaping:**
1. **Light-theme scope picker** — director picked sitewide editor light-theme over W4-only scoping per most-thorough/reliable. Retroactively updates ALL prior `RichTextEditor` mounts (URL detail page per-item Analysis editors from W2 S1; Overall Analysis editors from W2 S3; Comprehensive Analysis page editor from W4 S1-S2) without per-surface re-verification needed.
2. **Font-size feature picker** — director picked add font-size stepper to W4 editor toolbar (parallel design to the Competition Data table's W3 Session 3 font-size stepper at table-wide scope; today's editor stepper is per-editor scope).

**Walkthrough (b) W5 — PASS first-walk on Amazon** (zero fix-forwards needed): 4 new fields (Type / Description-1 / Description-2 / Price) appear cleanly as textareas via `makeTextareaField()` helper extension to existing `url-add-form.ts`; typed test values land on vklf.com Competition Data row populated correctly; optional Step 4 Reviews modal idempotency end-to-end also PASS (rapid double-Save click → only ONE review row lands).

**NEW reusable Pattern memorialized today: "Bundled Phase-4 verification surfaces issues concentrated in the most-complex newest surface; subsequent surfaces tend to PASS first-walk."** Today: W4 (newest + most-complex per-Project rich-text editor surface with TipTap + UrlReferenceExtension + LinkToUrlPicker + AnalysisEditor + AnalysisReadView) surfaced 7 issues; W5 (extension form additions — well-precedented `makeTextareaField()` helper extension) + P-47 (Shadow DOM mount — structural-only refactor with no behavioural changes) both PASS first-walk. Calibration data point: when deferring N walkthroughs into one bundled session, expect fix-forwards concentrated in the most-novel surface; budget time for ~1 fix-forward cycle per such surface. Pairs with the W3 deploy 2026-05-24 Pattern "Phase-4 verification fix-forward cascade in a single deploy session" (§B 2026-05-24 above) but at a smaller scale (W3 had 5 fix-forwards over 11 issues across 1 surface; today had 1 fix-forward over 7 issues across 1 of 3 surfaces).

**NEW reusable Pattern memorialized today: "Editor save-on-Done race condition (debounced save + unmount cleanup)."** Issue 5 from today's W4 Phase-4 walkthrough (Done button doesn't save) root-caused to a two-layer bug:

- **Layer 1 — `RichTextEditor` cleanup CLEARS the pending 500ms debounce timer WITHOUT flushing.** When `AnalysisEditor` unmounts on mode='edit'→'read', `RichTextEditor`'s cleanup effect runs; cleanup CLEARED `pendingTimerRef.current` but did NOT call the save callback with the pending content. The 500ms debounce window typically spans the click-Done event, so the latest content was always in `pendingContentRef` when cleanup fired. Result: any content typed within the last 500ms before Done was discarded.
- **Layer 2 — page.tsx's `loadState` was frozen at mount.** Even if the save HAD persisted (e.g., a 600ms delay between last keystroke and Done click), page.tsx's `loadState.contentJson` was never refreshed after a successful PUT. So when AnalysisEditor unmounted + AnalysisReadView mounted, the read view rendered from the stale mount-time loadState, showing pre-edit content even when the save succeeded.

**Two-layer fix:** (i) RichTextEditor cleanup flushes `pendingContent` through `onChangeRef` before clearing the timer; (ii) AnalysisEditor exposes `onSaved` callback fired after a successful PUT; page.tsx wires the callback to update `loadState.contentJson` + `loadState.lastEditedAt` so read view shows fresh content.

**Pattern:** ANY debounced-save editor with a parent-controlled mount lifecycle (Edit/Done toggle, modal open/close, accordion expand/collapse) must (a) flush on unmount cleanup AND (b) propagate save outcomes back to parent state OR re-fetch from server before unmount. Cross-references PerItemAnalysisBox (W2 S1) + OverallAnalysisBox (W2 S3) which share the same `RichTextEditor` unmount path — the Layer 1 unmount-flush fix benefits them too (any rapid Save → modal-close interaction in those surfaces was vulnerable to the same race). Their parent consumers (CapturedTextSubsection etc.) have different state-management shapes so the Layer 2 onSaved-callback wiring is W4-specific. Memorialize for future editor-lifecycle work.

**LOW informational sub-observation: UX directive surfaced 3+ months after the affected styling shipped.** Director's directive *"Please don't pick a dark background for the editor where the text is added"* came today. But the dark-theme RichTextEditor first shipped in W2 Session 1 (2026-05-25 — 3 months ago at session-relative time) and director walked Phase-4 verifications on it across W2 deploy 2026-05-23-c + W3 deploy 2026-05-24 + W4 deploy 2026-05-26 + Bundled W5+P-47 deploy 2026-05-24-e — 4 prior Phase-4 walkthroughs touched the dark editor + ZERO prior stylistic flags raised. Calibration: stylistic directives can surface late as director's mental model of the platform matures; the fix-forward Pattern handles it cleanly (UI-only site-wide change via single picker + single commit + single deploy). The site-wide theme scope (per Rule 14f picker outcome — Recommended path picked) means today's fix-forward retroactively updates ALL prior RichTextEditor mounts without per-surface re-verification needed. Memorialize as informational, not a slip. The styling choice from W2 Session 1 was reasonable in isolation; late-surfacing stylistic directive is a normal evolution.

**NEW P-48 cross-reference.** During today's verification session, director observed video playback stutters on vklf.com (specifically the P-45 screen-recording captures — not P-23 drag-and-drop captures). Per Rule 24 search across all docs: no prior treatment found. Captured as NEW P-48 polish item in ROADMAP polish backlog with diagnostic + implementation scope (~1-2 sessions estimated). P-48 sketch: capture-side likely root cause (`MediaRecorder` constructed with no `videoBitsPerSecond` cap → browser default 6-8 Mbps+ at 1080p → files exceed real-time decode budget); Session 1 Diagnostic = `ffprobe` inspection + Chrome DevTools Network panel observation; Session 2 Implementation = capture-side bitrate cap at 2.5 Mbps + frame-rate cap at 30fps + dimension cap at 1080p in `screen-recorder.ts`. P-48 lives in the W#2 polish-backlog (consumed by both the Competition Data page video display + the URL detail page video card display); design entries belong here in COMPETITION_DATA_V2_DESIGN.md when P-48 ships. Not in scope for §A this session.

**Calibration data point — fix-forward in-session vs defer.** Per the W3 deploy 2026-05-24 Pattern, fix-forward in-session was the recommended path (vs. defer) since the 7 issues were all UI-only + scoped + reversible + no schema change + same workstream as the verification. Outcome: fix-forward landed cleanly + director re-verified PASS on all 10 W4 steps in same session. Validates the "fix-forward in-session unless schema change / significant new code / scope shift" criterion from `feedback_recommendation_style.md`.

**Pre-deploy /scoreboard 5/5 GREEN at unchanged baselines** (root tsc clean / extension tsc clean / 558 ext UNCHANGED / 786 src/lib UNCHANGED / 62 routes UNCHANGED); Check 6 Playwright SKIPPED per Rule 27 — no Playwright spec coverage for the RichTextEditor / AnalysisEditor / LinkToUrlPicker editor changes. Post-merge /scoreboard partial (root tsc clean / extension tsc clean / src/lib 786/786 GREEN); Check 5 + Check 3 trusted at unchanged baselines since merged commit byte-identical to pre-deploy via clean ff-merge (no rebase, no squash).

**Schema-change-in-flight flag STAYS NO** entire session — UI-only fix-forward (no schema, no API, no shared-types, no new routes, no new dependencies).

**Impact on §A:** None. §A.5's editor styling guidance + §A.4's hyperlink rendering guidance + the W3 Session 3 font-size stepper precedent all consumed for today's fix-forward; no §A amendment. §A stays frozen per Rule 18.

**Cross-references:**
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-24-e (yesterday's bundled W5 + P-47 deploy entry — today's session executes the deferred Phase-4 for that deploy).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §B 2026-05-26 (W4 deploy with Phase-4 deferred — today's session executes the deferred Phase-4 for W4 too; now-complete W4 lifecycle: build sessions 2026-05-24-b + 2026-05-25 → deploy 2026-05-26 (Phase-4 deferred) → fix-forward + Phase-4 PASS today).
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-24-f — paired entry capturing P-47 Phase-4 PASS outcome (different design doc per the 2026-05-24-d precedent).
- `docs/ROADMAP.md` P-46 polish-backlog entry (annotated today — W4 + W5 sub-status flipped to ✅ DONE-AND-VERIFIED 2026-05-24-f end-to-end + overall P-46 5-workstream arc closure; closes (a.88) + opens (a.89)).
- `docs/ROADMAP.md` P-47 polish-backlog entry (annotated today — status flipped to ✅ DONE-AND-VERIFIED 2026-05-24-f end-to-end).
- `docs/ROADMAP.md` NEW P-48 polish-backlog entry (captured today per Rule 24 search; diagnostic + implementation scope; LOW–MEDIUM severity; 1-2 sessions estimated).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-24-f (the bundled Phase-4 verification + fix-forward #1 + Phase-4 PASS closing entry — 6 sub-observations + 2 NEW reusable Patterns + NEW P-48 capture).
- `docs/NEXT_SESSION.md` (today's complete rewrite for P-48 Session 1 (Diagnostic) + ZERO standing carry-overs since all 3 Phase-4 verifications closed today).

**Closing line:** W4 fix-forward #1 + Phase-4 PASS lifecycle closes the W4 implementation arc end-to-end ✅ DONE-AND-VERIFIED 2026-05-24-f on vklf.com; W5 Phase-4 PASS first-walk closes the W5 implementation arc end-to-end ✅ DONE-AND-VERIFIED 2026-05-24-f on vklf.com; **P-46 entire 5-workstream polish arc closes ✅ DONE-AND-VERIFIED end-to-end 2026-05-24-f on vklf.com** (W1 schema + W2 URL detail page redesign + W3 Competition Data table redesign + W4 Comprehensive Competitor Analysis page + W5 Extension URL save form additions ALL ✅ DONE-AND-VERIFIED). NEW P-48 polish item captured for future session. Next session: P-48 Session 1 (Diagnostic) per (a.89).

---

## §B 2026-05-25 — `session_2026-05-25_reviews-phase-2-capture-session` — Reviews Phase 2 scope-expansion CAPTURE SESSION — A.1 deferral RESOLVED via NEW P-49 hub-and-spokes ROADMAP entry + NEW P-50 Condition Pathology placeholder card captured; pure-capture session (NO code, NO builds, NO deploys, ZERO Rule 9 gates fired); NEW reusable Pattern "Mid-pre-build scope-expansion redirect — pure-capture session over mixed-session attempts" memorialized

**§A frozen** per Rule 18. This entry is informational + scope-expansion-capture from the **data-shape side** of the design (the extension-side architecture cross-reference for P-49 Workstream 2 lives in `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-25 — paired entry — per the P-23 precedent that extension content-script changes live in the W#2 master design doc, not in this P-46 doc).

**Session shape: pure capture (NO code, NO builds, NO deploys, ZERO Rule 9 gates fired).** Director's pre-build launch task for today was **P-48 Session 3 (Diagnostic #2)** for the screen-recording stutter empirical instrumentation pass; before any P-48 Session 3 work began, director surfaced the long-anticipated "next round of additions" to W#2 per the verbatim 2026-05-24-f directive *"We will be adding more things to competition scraping once the pending things are finished and I want you to explicitly ask me to give you the next round of additions once all remaining things are done."* Director picked **Option A (Recommended: pure capture today; P-48 Session 3 deferred opportunistically)** at the Rule 14f session-direction forced-picker.

**§A.1 deferral RESOLVED today.** The 2026-05-23 §A.1 deferral was: *"The per-platform Reviews-extraction mechanism (auto-extract vs. user-typed vs. hybrid; what DOM selectors per platform) is **DEFERRED to future per-platform polish sessions** that follow P-46 graduation."* Director's 2026-05-25 directive surfaces the full per-platform extraction scope cluster in one shot, including DOM patterns + URL structures + per-star counts + AI analysis aggregation levels for all 4 platforms. §A.1 was updated this session (not on appendix-only Rule 18 grounds since it's a cross-reference, not a re-litigation) with a "**RESOLVED 2026-05-25 — see ROADMAP P-49**" paragraph at the end of the section linking the original deferral to today's P-49 capture — preserving §A.1's original director-supplied reasoning intact while making the resolution discoverable to future readers walking §A top-to-bottom. P-46 W2 Session 4 (shipped 2026-05-28) had landed the v1 surface per §A.1b (schema + URL-detail-page view + manual entry form); today's P-49 Phase 2 extends to automation across both collection (per-platform extension + optional crawler) and analysis (LLM-driven at 3 aggregation levels).

**Data-shape side architecture cross-references for P-49 ingestion at next session's design interview:**

- **§A.1b (CapturedReview shape) — the v1 schema P-49 extends.** Current `CapturedReview` model has `source` field with v1 value `'manual'`; P-49 Workstream 2 adds `source = 'extension-scrape'` as a new enum value (small additive schema migration). Other field additions TBD per design session — likely candidates: `helpfulCount Int?` (Amazon supplies; eBay/Etsy/Walmart don't); `sortRank Int?` for server-side reordering per Workstream 4; `platform String?` (denormalized from parent CompetitorUrl for query convenience); plus AI-analysis output tables (entirely new tables — TBD per Workstream 5 design decision).
- **§A.4 (ComprehensiveCompetitorAnalysis shape) — the UI surface P-49 Workstream 5 likely extends.** The per-Project Comprehensive Competitor Analysis page (P-46 W4 — shipped 2026-05-24-f) is the natural home for the cross-Type + cross-everything AI analysis surfaces per Workstream 5. Design-session decision: extend the existing page with new sections, OR create a new dedicated `/reviews-analysis` page. Most-thorough/reliable default: extend the existing page since the cross-everything competitive landscape report is conceptually adjacent to the page's existing comprehensive-summary scope.
- **§A.5 (TipTap JSON storage) — likely consumed for AI analysis output rendering.** AI summaries land as rich-text blocks; reuse the existing `RichTextEditor` (read-mode `AnalysisReadView`) for display per the W2 Session 1 + W4 Session 1 precedent.
- **§A.3 (UserTablePreferences shape) — likely extended for Reviews UI preferences per Workstream 4.** Star-filter state + per-star scrape-cap user setting + reorder preference all per-user-per-Project preferences; the `UserTablePreferences` model is the existing precedent.
- **§A.13 (Living Questions answers — Shared Data Registry) — new entries expected at design-session close.** Per-platform CapturedReview entities + AI-analysis output entities + scrape-job orchestration entities each warrant a Shared Data Registry entry with the 3 Living Questions answered (Who reads it? Who writes it? Where does it live?).
- **§A.14 (Cross-Tool Data Flow Map reciprocal output declaration) — new entries expected.** Per-platform extraction produces reviews consumed by AI analysis; AI analysis produces summaries consumed by the Comprehensive Analysis page UI; cross-tool flow declarations land at design-session close per Rule 18.
- **§A.11 (consolidated schema list) — design-session deliverable extends this list.** Workstream 1 added: `CompetitorUrl` new columns + `CapturedText`/`Image`/`Video` new `analysis` column + new `ScrapingStatus` enum + new `CapturedReview` / `ComprehensiveCompetitorAnalysis` / `UserTablePreferences` models. P-49 design session locks the next round: `CapturedReview` field additions (new source enum value + likely helpfulCount + sortRank + platform) + new AI-analysis output tables (TBD count + shape — likely one per aggregation level: per-product, per-Type, per-Project competitive-landscape).

**P-49 ROADMAP entry summary (preserved in `docs/ROADMAP.md` as the canonical capture; see paired §B in COMPETITION_SCRAPING_DESIGN.md for extension-side architecture detail).** Hub-and-spokes structure mirroring P-46 with 5 internal workstreams: **W1 Reviews Phase 2 Design Session (NEXT per (a.92))** ~1 session pure design producing `docs/REVIEWS_PHASE_2_DESIGN.md`; **W2 Per-platform extension extraction** ~8-16 sessions across 4 platforms (Amazon → eBay → Etsy → Walmart priority order per director); **W3 Crawler infrastructure** CONDITIONAL ~5-10 sessions if scoped in (likely deferred per anti-bot risk); **W4 Captured Reviews UI extensions** ~2-3 sessions for star-count breakdown + star-filter + server-side reorder + bulk-delete; **W5 AI review analysis system** ~5-10 sessions for 3 levels (per-product two-sweep + cross-Type pooled + cross-everything competitive landscape). Total estimate post-design ~20-50 sessions. Director's verbatim per-platform DOM specs + anti-bot constraint + 3-level AI analysis output shape all preserved in the P-49 ROADMAP entry for design-session ingestion.

**P-50 ROADMAP entry summary (preserved in `docs/ROADMAP.md`).** Small `main`-branch placeholder card "Condition Pathology" between Competition Scraping & Deep Analysis and Therapeutic Strategy & Product Family Design on the PLOS dashboard; card-only scope per Rule 14f picker (no W# renumbering); ~10 min in-Claude opportunistic small session.

**THREE Rule 14f forced-pickers fired this session (all director-Yes per recommendations):**

1. **Session-direction picker** — (A) Pure capture today (Recommended) / (B) Mixed / (C) Pivot fully / (D) P-48 as planned + minimal capture; director picked (A).
2. **Capture-shape picker** — Hub-and-spokes (Recommended) / Flat split / Hybrid for P-49 + card-only (Recommended) / full-workflow / defer for P-50; director picked both Recommended options.
3. **Entry-approval + next-session picker** — Both entries approved + Reviews Phase 2 Design Session locked as next-session task per (a.92).

**NEW reusable Pattern memorialized today: "Mid-pre-build scope-expansion redirect — when director surfaces major new scope at session-start before pre-build reads complete, the most-thorough/reliable path is a pure-capture session (pause planned task; run Rule 24 searches; capture as ROADMAP entries; defer planned task) rather than mixed-session attempts."** Trigger: director surfaces a new scope cluster before pre-build reads complete or before any code begins. Concrete steps: (1) immediately pause the planned task; (2) fire Rule 14f session-direction picker offering (A) pure-capture / (B) mixed / (C) pivot fully / (D) original task as planned + minimal capture; (3) default to (A) per most-thorough/reliable; (4) run Rule 24 searches across all docs for any prior treatment of the new scope; (5) fire capture-shape picker (hub-and-spokes vs flat split vs hybrid); (6) capture the new scope as one or more ROADMAP entries with verbatim director-supplied specs preserved for design-session ingestion; (7) update any docs the new scope resolves (here: A.1 cross-reference); (8) write `## Proposed interview question scaffold` section in NEXT_SESSION.md preserving the design-session question draft verbatim; (9) lock the next-session task as the design session that ingests today's capture. **Rationale:** mixing capture with planned-task code-shipping risks (a) incomplete capture (rushed; missing director-context); (b) incomplete planned-task work (interrupted; partial deploy under Rule 9 risk); (c) divided attention across two heavy contexts in one session. Pairs as a Rule-30 plain-terms-summary lesson — director benefits from clean session-shapes (one session = one outcome class) rather than mixed-outcome sessions where the plain-terms summary has to span two unrelated arcs.

**LOW informational sub-observation: long-deferred concerns naturally resolve when director's mental model of what they want catches up with the deferred scope.** §A.1 was deferred at the 2026-05-23 initial design interview with director's verbatim *"Each platform will have different ways of capturing reviews and we will discuss those methods of capture later."* Today (2026-05-25 — 2 days later at session-relative time) director surfaced the full per-platform specs in one shot, naming all 4 platforms + specific DOM patterns + URL structures + per-star counts + AI analysis aggregation levels. Calibration data point for design discipline: when a design decision is genuinely premature (director can't yet name the concrete options), deferring + waiting for the director's mental model to mature can produce a much higher-quality capture later than forcing the decision at the original moment. The §A.1 deferral was vindicated. Memorialize as informational, not a slip — the original 2026-05-23 deferral decision was correct given the information available then.

**Operational note: 15 interview-question draft preserved verbatim in NEXT_SESSION.md ## Proposed interview question scaffold section.** The 15 questions cover: Q1 crawler scope / Q2 per-platform priority order / Q3 scrape job orchestration / Q4 per-star scrape count UX / Q5 server-side review reordering / Q6 bulk-delete affordance / Q7 AI model choice + cost guards / Q8 two-sweep batch sizing / Q9 AI analysis output shape / Q10 AI analysis UI placement / Q11 AI analysis trigger UX / Q12 AI analysis caching + re-run / Q13 schema additions / Q14 star-count breakdown UI / Q15 anti-bot defensive posture. Each has options + Recommended pick per most-thorough/reliable reasoning. Next session walks through them as the Workflow Requirements Interview producing `docs/REVIEWS_PHASE_2_DESIGN.md`.

**Schema-change-in-flight flag STAYS NO** entire session (pure ROADMAP + design-doc capture; no `prisma db push`; no schema; no API contract changes). **EXPECTED YES** when next session's design interview locks the AI analysis output tables OR when P-49 Workstream 2 first per-platform build lands `source = 'extension-scrape'` enum value addition to `CapturedReview.source`.

**Pre-build + post-capture /scoreboard NOT run** (no code change to verify); baselines unchanged from prior session (root tsc clean / extension tsc clean / **562 ext UNCHANGED** / **786 src/lib UNCHANGED** / **62 routes UNCHANGED**). Check 6 Playwright SKIPPED per Rule 27.

**Impact on §A:** §A.1 updated this session with a "RESOLVED 2026-05-25 — see ROADMAP P-49" cross-reference paragraph at the end of the section — preserves original director-supplied reasoning intact while making the resolution discoverable to future readers walking §A top-to-bottom. This is a cross-reference annotation per the Rule 18 spirit (not a re-litigation of the §A.1 deferral itself, which was correct at the time and is now superseded by external scope advancement, not by §A.1 being re-decided). All other §A sections unchanged. §A stays frozen per Rule 18 for re-litigation purposes. **Future P-49 build sessions get §B entries in `docs/REVIEWS_PHASE_2_DESIGN.md` directly per Rule 18, NOT in this doc's §B** (analogous to the 2026-05-23 P-46 → COMPETITION_DATA_V2_DESIGN split precedent — P-49 is its own multi-workstream hub-and-spokes and warrants its own design doc).

**Cross-references:**
- `docs/ROADMAP.md` NEW P-49 polish-backlog entry — Reviews Phase 2 hub-and-spokes with director's verbatim per-platform specs preserved + anti-bot constraint preserved + 3-level AI analysis output shape preserved; canonical capture for this session's scope expansion.
- `docs/ROADMAP.md` NEW P-50 polish-backlog entry — Condition Pathology card placeholder; small `main`-branch session.
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-25 (Reviews Phase 2 capture session) — paired entry covering extension-side architecture cross-reference for P-49 Workstream 2 (per-platform extension extraction architecture: URL-prefix dispatch from P-23; Shadow DOM mounts from P-47; `makeTextareaField()` helper extensions from P-46 W5). Per the P-23 precedent, extension content-script changes live in the W#2 master design doc; this doc covers the data-shape side.
- `docs/COMPETITION_DATA_V2_DESIGN.md` §A.1 (updated this session with "RESOLVED 2026-05-25 — see ROADMAP P-49" cross-reference paragraph).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §A.1b (v1 Reviews surface shipped via P-46 W2 Session 4 — schema + manual-entry path that Phase 2 extends).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §A.4 (ComprehensiveCompetitorAnalysis page — likely home for P-49 Workstream 5 AI analysis surfaces).
- `docs/COMPETITION_DATA_V2_DESIGN.md` §A.11 (consolidated schema list — design-session deliverable extends).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-25 (Reviews Phase 2 scope-expansion capture — the THIRD 2026-05-25-dated §Entry) — today's closing §Entry capturing 4 sub-observations including the NEW reusable Pattern "Mid-pre-build scope-expansion redirect" + LOW informational on long-deferred concerns naturally resolving + operational note.
- `docs/NEXT_SESSION.md` — fully rewritten for next session = Reviews Phase 2 Design Session (Workflow Requirements Interview producing `docs/REVIEWS_PHASE_2_DESIGN.md`) on `workflow-2-competition-scraping`; 3 plain-terms sections at top; `## Proposed interview question scaffold` section preserving the 15 questions verbatim.
- `feedback_recommendation_style.md` (most-thorough/reliable — today's pure-capture choice over mixed-session is the most-thorough/reliable path per the new Pattern memorialized).
- `feedback_default_to_recommendation.md` (director defaulted to all 3 Rule 14f picker recommendations today).
- `feedback_approval_scope_per_decision_unit.md` (2-push capture-session pattern: doc-batch push + doc-batch ff-merge push).
- §B 2026-05-23 (the initial P-46 W#2 Phase 2 design session that produced §A — set the hub-and-spokes precedent today's P-49 follows).
- §B 2026-05-24-f (P-46 entire 5-workstream polish arc closure — the prior hub-and-spokes lifecycle exemplar; P-49 is the second W#2 hub-and-spokes polish hub).
- W#2 graduation step (now deferred until Reviews Phase 2 closes at the workstream-by-workstream level per the new P-49 entry).

**Closing line:** Reviews Phase 2 scope-expansion CAPTURE SESSION ✅ DONE 2026-05-25 — §A.1 deferral RESOLVED via NEW P-49 hub-and-spokes ROADMAP entry capturing director's verbatim per-platform specs + anti-bot constraint + 3-level AI analysis output shape. NEW P-50 Condition Pathology placeholder card captured as separate small concern. NEW reusable Pattern "Mid-pre-build scope-expansion redirect — pure-capture session over mixed-session attempts" memorialized. LOW informational sub-observation on long-deferred §A.1 concern naturally resolving when director's mental model of what they want catches up — calibration data point for design discipline + vindication of the original 2026-05-23 deferral. 15 interview-question draft preserved verbatim in NEXT_SESSION.md for next session's Workflow Requirements Interview ingestion. Next session: Reviews Phase 2 Design Session per (a.92) on `workflow-2-competition-scraping` (~1 session pure design; produces `docs/REVIEWS_PHASE_2_DESIGN.md` mirroring this doc's §A frozen-decisions + §B empty + §C per-workstream implementation outlines structure).

---

## §B 2026-05-25-b — `session_2026-05-25-b_reviews-phase-2-design-session` — Reviews Phase 2 Design Session producing `docs/REVIEWS_PHASE_2_DESIGN.md` — cross-reference pointer entry from data-shape side per the dual-doc P-23 + P-46 precedent; §A frozen per Rule 18; this is the second application of the design-doc-split precedent (P-46 → COMPETITION_DATA_V2_DESIGN.md 2026-05-23 + P-27 → CAPTURED_VIDEOS_DESIGN.md 2026-05-20-b; today: P-49 → REVIEWS_PHASE_2_DESIGN.md 2026-05-25-b)

**§A frozen** per Rule 18. This entry is informational + design-doc-split cross-reference from the **data-shape side** of the design (the extension-side architecture cross-reference for P-49 Workstream 2 lives in `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-25-b — paired entry — per the P-23 precedent that extension content-script changes live in the W#2 master design doc, not in this P-46 doc). Suffix `-b` per Rule 14 disambiguation since §B 2026-05-25 already exists in this doc for yesterday's Reviews Phase 2 scope-expansion capture session.

**Session shape: pure design session (NO code, NO builds, NO deploys, ZERO Rule 9 gates fired).** Today executed the (a.92) RECOMMENDED-NEXT task locked by yesterday's capture session: Reviews Phase 2 Design Session (Workflow Requirements Interview producing `docs/REVIEWS_PHASE_2_DESIGN.md`). Director walked through the 15-question scaffold preserved verbatim in yesterday's NEXT_SESSION.md `## Proposed interview question scaffold` section. Director answered all 15 forced-pickers — 14 direct-Yes-to-Recommended + 1 Q7 substantive refinement on the AI model-version selector (preserved Opus-throughout Recommended path while adding a per-run 4.7-default / 4.6-selectable dropdown alongside per-run + per-Project monthly cost caps from the W#1 pattern).

**NEW standalone `docs/REVIEWS_PHASE_2_DESIGN.md` shipped (790 lines).** §A frozen at 15 interview-locked subsections A.1-A.15 + §B empty append-only per Rule 18 + §C 4 active workstream implementation outlines (W1 DONE this session / W2 Per-platform extension extraction with 4 sub-clusters Amazon→eBay→Etsy→Walmart / W4 Captured Reviews UI extensions / W5 AI review analysis system at 3 levels) + W3 Crawler infrastructure DROPPED placeholder per Q1 outcome. Same structural shape as this doc (`COMPETITION_DATA_V2_DESIGN.md`) — the P-46 design doc precedent set 2026-05-23 + the 2026-05-20-b `CAPTURED_VIDEOS_DESIGN.md` precedent. This is the SECOND APPLICATION of the design-doc-split pattern from this doc's lineage (the FIRST being the original 2026-05-23 split that produced this doc).

**15 decisions locked across A.1-A.15 in `docs/REVIEWS_PHASE_2_DESIGN.md`** (summarized here for cross-reference; canonical lives in the new design doc):

- **A.1 (Q1) collection method = Extension only** — W3 Crawler workstream DROPS per director's verbatim *"behaviorally indistinguishable from real-world human user sitting where admin is"* anti-bot constraint.
- **A.2 (Q2) per-platform priority = Amazon → eBay → Etsy → Walmart** — matches director's stated 2026-05-25 priority order.
- **A.3 (Q3) scrape execution = In-page with Shadow DOM progress indicator** — reuses P-47 mount pattern from §B 2026-05-24-d + 2026-05-22-i.
- **A.4 (Q4) per-star cap = Per-URL setting + per-trigger override** — new `CompetitorUrl.reviewScrapeCap Int? @default(200)` column.
- **A.5 (Q5) reordering = Drag-to-reorder** — new `sortRank Int?` column on `CapturedReview` reusing W3 Session 3 @dnd-kit shared debounced-mutation Pattern from §B 2026-05-23-f.
- **A.6 (Q6) bulk-delete = Multi-select checkboxes + confirm modal** — new batch-delete API route.
- **A.7 (Q7) AI model = Claude Opus throughout with per-run model-version selector** — 4.7 default / 4.6 selectable dropdown + per-run + per-Project monthly cost caps (W#1 pattern from `docs/MODEL_QUALITY_SCORING.md`).
- **A.8 (Q8) batch sizing = Adaptive ~80% context fill** — W#1 `INPUT_CONTEXT_SCALING_DESIGN.md` Tiered Canvas Serialization reuse.
- **A.9 (Q9) AI output = Rich-text TipTap JSON** — reuses existing `RichTextEditor` from this doc's §A.5 + P-46 W2 Session 1 + W4 Session 1.
- **A.10 (Q10) UI placement = Per-product on URL detail + per-Type & cross-everything on existing P-46 W4 Comprehensive Competitor Analysis page** — reuses existing surfaces from this doc's §A.4 (`ComprehensiveCompetitorAnalysis` shape).
- **A.11 (Q11) trigger = Manual button + model dropdown + cost preview modal** — director-controlled; cost-visible per click.
- **A.12 (Q12) caching = Fingerprint cache (review-IDs + model version) + "out of date" badge + explicit re-run** — lowest-cost cache strategy.
- **A.13 (Q13) schema = Full package locked** — new `ReviewAnalysis` table with discriminated `level` enum {PER_PRODUCT, PER_TYPE, PER_PROJECT} + `analysisJson Json` + `reviewsHash String` + `modelVersion String` + `runAt DateTime` + `runByUserId String?` + `costUsdMicros Int?`; `CapturedReview` field additions including `source` enum value addition + `sortRank Int?` + `helpfulCount Int?` + `platform String?`; `CompetitorUrl.reviewScrapeCap Int? @default(200)`.
- **A.14 (Q14) star UI = Counter-bar with click-to-filter** — replaces existing star-rating-multi-select.
- **A.15 (Q15) anti-bot = Conservative everywhere** — 1-3s random delays + captcha-aware abort + rate-limit UI notification.

**Affected §A sections in this doc (informational — §A stays frozen per Rule 18).** The new P-49 spec touches several existing §A sections informationally — making explicit cross-references that future P-49 build sessions will encounter:

- **§A.1 (Reviews extraction shape) — was updated 2026-05-25 with "RESOLVED 2026-05-25 — see ROADMAP P-49" cross-reference paragraph; that resolution is now fully realized via the new design doc.** Yesterday's §A.1 update is the bridge from the original 2026-05-23 deferral → the 2026-05-25 P-49 capture → today's 2026-05-25-b design-session ingestion. The new design doc's A.1 fully supersedes this §A.1 deferral for P-49 build-session purposes.
- **§A.1b (`CapturedReview` shape) — the v1 schema P-49 extends.** Current `CapturedReview` model has `source` field with v1 value `'manual'`; P-49 Workstream 2 adds `source = 'extension-scrape'` as a new enum value per A.13. Other field additions per A.13: `sortRank Int?` for server-side reordering per A.5; `helpfulCount Int?` (Amazon supplies; eBay/Etsy/Walmart don't); `platform String?` (denormalized from parent CompetitorUrl for query convenience).
- **§A.4 (`ComprehensiveCompetitorAnalysis` shape) — the UI surface P-49 Workstream 5 extends.** Per the new design doc's A.10, the per-Project Comprehensive Competitor Analysis page (P-46 W4 — shipped 2026-05-24-f) is the locked-in home for the cross-Type + cross-everything AI analysis surfaces per W5. Per-product W5 analysis lives on the URL detail page (this doc's §A.1b surface).
- **§A.5 (TipTap JSON storage) — consumed for AI analysis output rendering.** Per the new design doc's A.9, AI summaries land as rich-text TipTap JSON; reuse the existing `RichTextEditor` (read-mode `AnalysisReadView`) for display per the W2 Session 1 + W4 Session 1 precedent.
- **§A.11 (consolidated schema list) — design-session deliverable extends this list.** Workstream 1 added: `CompetitorUrl` new columns + `CapturedText`/`Image`/`Video` new `analysis` column + new `ScrapingStatus` enum + new `CapturedReview` / `ComprehensiveCompetitorAnalysis` / `UserTablePreferences` models. P-49 design session A.13 locks the next round: `CapturedReview` field additions (new source enum value + helpfulCount + sortRank + platform) + `CompetitorUrl.reviewScrapeCap` + new `ReviewAnalysis` model (discriminated `level` enum).
- **§A.13 (Living Questions answers — Shared Data Registry) — new entries expected at design-session close.** The new design doc adds `ReviewAnalysis` entity + extended `CapturedReview` entity + `CompetitorUrl.reviewScrapeCap` entity with the 3 Living Questions answered (Who reads it? Who writes it? Where does it live?). Lives in the new design doc per Rule 18.
- **§A.14 (Cross-Tool Data Flow Map reciprocal output declaration) — new entries expected.** Per-platform extension extraction (W2) produces CapturedReview rows consumed by W5 AI analysis; W5 produces ReviewAnalysis rows consumed by the W4 Comprehensive Analysis page UI + per-product URL detail UI. Lives in the new design doc per Rule 18.

**Cross-references:**
- `docs/REVIEWS_PHASE_2_DESIGN.md` (NEW — 790 lines) — canonical interview-locked design spec; future P-49 build-session §B entries land there per Rule 18, NOT in this doc's §B.
- `docs/ROADMAP.md` P-49 entry — Status flip from "DESIGN-PENDING" to "🟢 DESIGN-FROZEN 2026-05-25-b" + 4-active-workstreams-instead-of-5 update + (a.92) close + (a.93) open.
- `docs/COMPETITION_SCRAPING_DESIGN.md` §B 2026-05-25-b — paired entry covering extension-side architecture cross-reference for P-49 Workstream 2 (per-platform extension extraction architecture: URL-prefix dispatch from P-23 + Shadow DOM mounts from P-47 + `makeTextareaField()` helper extensions from P-46 W5). Per the P-23 precedent, extension content-script changes live in the W#2 master design doc; this doc covers the data-shape side.
- §B 2026-05-25 (Reviews Phase 2 scope-expansion capture session) — yesterday's opening entry for this Workstream 1 arc; today's §B 2026-05-25-b closes the W1 arc and opens the W2-W5 build arc.
- §B 2026-05-23 (the initial P-46 W#2 Phase 2 design session that produced this doc) — set the design-doc-split precedent today's P-49 follows; first application of the pattern.
- §B 2026-05-24-f (P-46 entire 5-workstream polish arc closure — the prior hub-and-spokes lifecycle exemplar; P-49 is the second W#2 hub-and-spokes polish hub).
- §A.1 (resolved 2026-05-25; today fully superseded by the new design doc's A.1).
- §A.1b (v1 Reviews surface — schema + manual-entry path P-49 extends).
- §A.4 (ComprehensiveCompetitorAnalysis surface — locked-in home for W5 cross-Type + cross-everything AI analysis per the new design doc's A.10).
- §A.5 (TipTap JSON storage — reused for W5 AI analysis output rendering per the new design doc's A.9).
- §A.11 (consolidated schema list — design-session deliverable extends this list).
- `docs/CORRECTIONS_LOG.md` §Entry 2026-05-25-b (P-49 Reviews Phase 2 design-session closing entry — the FOURTH 2026-05-25-dated §Entry) — today's closing §Entry capturing the NEW reusable Pattern "Director-supplied per-platform DOM specs in capture-session memorialization pay off at design-session ingestion" + calibration data point + LOW informational sub-observation.
- W#2 graduation step (now further deferred until Reviews Phase 2 closes at the workstream-by-workstream level per the P-49 ROADMAP entry).

**Closing line:** P-49 Reviews Phase 2 DESIGN SESSION ✅ DONE 2026-05-25-b on `workflow-2-competition-scraping` — pure design session (NO code, NO builds, NO deploys, ZERO Rule 9 gates fired). NEW standalone `docs/REVIEWS_PHASE_2_DESIGN.md` shipped (790 lines; §A frozen 15 decisions + §B empty + §C 4 active workstream outlines + W3 Crawler DROPPED placeholder per Q1 outcome). Director answered 14 of 15 picker direct-Yes-to-Recommended + 1 Q7 substantive refinement on the AI model-version selector. SECOND APPLICATION of the design-doc-split precedent from this doc's lineage (P-46 → COMPETITION_DATA_V2_DESIGN.md 2026-05-23 [first]; P-49 → REVIEWS_PHASE_2_DESIGN.md 2026-05-25-b [second]). §A.1 resolved 2026-05-25 + fully superseded today by the new design doc's A.1; future P-49 build-session §B entries land in the new design doc, not in this doc's §B per Rule 18. Next session: P-49 W2 Amazon Session 1 (schema migration + shared scrape-pagination helper + Shadow DOM progress indicator + Amazon DOM walker) per (a.93) on `workflow-2-competition-scraping`.

---

END OF DOCUMENT
