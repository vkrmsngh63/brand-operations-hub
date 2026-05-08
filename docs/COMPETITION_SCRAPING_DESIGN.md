# COMPETITION SCRAPING & DEEP ANALYSIS — DESIGN DOC (Workflow #2)

**Workflow number:** W#2
**Workflow name:** Competition Scraping & Deep Analysis (🔍)
**Status:** 🔄 Design phase (this doc is the design-phase deliverable)
**Branch:** `workflow-2-competition-scraping`
**Created:** May 4, 2026
**Created in session:** session_2026-05-04_w2-workflow-requirements-interview (Claude Code)
**Last updated:** May 7, 2026-h (W#2 Chrome extension build — session 3 — §B 2026-05-07-h entry appended covering Module 1 URL-capture content script for the 4 shopping platforms (Amazon, Ebay, Etsy, Walmart) + the 3 URL-recognition specs from the §B 2026-05-07-g end-of-session addendum + URL-add overlay form; §A remains frozen per Rule 18; schema-change-in-flight stays "No"; per-platform DOM-pattern modules + URL-normalization helper + recognition cache + 36 walked-through tests appended to verification backlog targeting Waypoint #1.)
**Previously updated:** May 4, 2026 (W#2 Stack-and-Architecture session — first §B entry appended; all 13 §A.17 deferred questions RESOLVED via new Group B doc `COMPETITION_SCRAPING_STACK_DECISIONS.md`; §A remains frozen per Rule 18; schema-change-in-flight flag flipped to "Yes" at start of session per `MULTI_WORKFLOW_PROTOCOL.md` Rule 4)
**Previously updated:** May 4, 2026 (creation; §A frozen at end of Workflow Requirements Interview; §B empty pending future in-flight refinements)

**Doc type:** Group B (workflow-specific). Loaded whenever a session works on W#2.

**Related docs:**
- `HANDOFF_PROTOCOL.md` Rule 18 — Workflow Requirements Interview methodology
- `HANDOFF_PROTOCOL.md` Rule 19 — Platform-Truths Audit (executed this session; results in `PLATFORM_REQUIREMENTS.md` updates)
- `HANDOFF_PROTOCOL.md` Rule 21 — Pre-interview directive scan (executed; no prior W#2-specific directives found)
- `HANDOFF_PROTOCOL.md` Rule 25 + `MULTI_WORKFLOW_PROTOCOL.md` — Multi-workflow coordination (W#2 lives on `workflow-2-competition-scraping` branch; W#1 stays on `main`)
- `PLATFORM_REQUIREMENTS.md` §1.4 + §2.2.1 + §6 + §6.6 + §8.4 + §10.1 + §10.2 + §12.6 — Platform-truths audit additions (NEW 2026-05-04)
- `PROJECT_CONTEXT.md` §2 — Workflow #2 one-line description
- `DATA_CATALOG.md` §6.1 + §7.2.2 — W#2 entries (filled out this session)

**Structure (per HANDOFF_PROTOCOL Rule 18):**
- **§A — Initial Workflow Requirements Interview answers.** Frozen at end-of-interview. Authoritative initial spec.
- **§B — In-flight refinements (append-only).** Empty at end of interview. Future sessions append entries here, never edit prior ones or §A.

---

## §A — Initial Workflow Requirements Interview answers (FROZEN 2026-05-04)

### A.0 Interview meta

- **Interview format:** Director provided a comprehensive free-form brief (preserved verbatim in §A.15 below); Claude read it back; then conducted the structured 14-question interview in 4 clusters of 3-5 questions each, with read-back between clusters.
- **Pre-interview directive scan (Rule 21):** searched `ROADMAP.md`, `DATA_CATALOG.md`, `PLATFORM_REQUIREMENTS.md`, `PROJECT_CONTEXT.md` for prior W#2-specific directives. **No directives found.** Only structural pointers exist (e.g., `ROADMAP.md` line 1892 confirms "next step = Workflow Requirements Interview produces COMPETITION_SCRAPING_DESIGN.md"; `DATA_CATALOG.md` §7.2.2 placeholder noting W#1 topic hierarchy as anticipated input — REJECTED at interview, see Q4).
- **Sister-workflow state at interview time:** W#1 (Keyword Clustering) was in stabilization on `main`; just shipped the atomic-batch fold-in (`0caa200`); D3 retry paused at canvas 194; schema-change-in-flight = No. No coordination conflicts.

---

### A.1 Purpose (Q1)

W#2 is a **Chrome browser extension** plus a corresponding **section inside PLOS at vklf.com**, working together to let a human (admin in Phase 1; multiple workers from Phase 3 onward) collect competitive-intelligence data — URLs, text snippets, and images — from competitor product listings on shopping platforms (Amazon, Ebay, Etsy, Walmart, Google Shopping, Google Ads) and from independent product websites discovered via Google organic results.

**Critically: data capture is 100% human-driven.** The user manually highlights text, right-clicks images, drags region screenshots. The extension's job is to make those manual motions fast and well-organized, NOT to crawl/scrape autonomously. This is intentional — the platform stays clear of every shopping-platform's anti-bot Terms of Service.

All captured data flows in real-time into the corresponding Project's "Competition Scraping & Deep Analysis" section in PLOS at vklf.com, where downstream workflows (W#3 Therapeutic Strategy, W#5 Conversion Funnel, W#6 Content Development, W#9 Clinical Evidence, W#10 Reviews, etc.) can consume it.

W#2 has TWO co-equal halves with different deployment models:
1. **Chrome extension** — installed in the user's browser; runs outside vklf.com; has its own UI, auth, state, and build pipeline.
2. **PLOS web section** — lives at `/projects/[projectId]/competition-scraping`; built into the existing Next.js app; imports specific components from the Shared Workflow Components Library (per Q14).

Both halves talk to the same backend APIs and write to the same Postgres tables. PLOS DB is the single source of truth (per Q12).

---

### A.2 Users (Q2)

| Phase | Users | Detail |
|---|---|---|
| **Phase 1** | Admin only (1 person) | Admin uses the extension and the PLOS section solo |
| **Phase 3** | ~10 workers + admin | Workers are **platform specialists** — one worker covers Amazon across many Projects; another covers Ebay; etc. NOT generalists. |
| **Phase 4** | ~20 workers + admin | Same platform-specialist pattern; ~3 workers per platform globally |

**Assignment model — 4-way (refines `PLATFORM_REQUIREMENTS.md §2.2`'s 3-way model):**

Per-(user × workflow × project × platform) where platform ∈ {Amazon, Ebay, Etsy, Walmart, GoogleShopping, GoogleAds, IndependentWebsites}.

**Hard rule:** exactly one worker per (project, platform). Two workers are NEVER assigned to the same platform within the same Project. Enforced at the assignment table level — the assignment UI rejects double-assignment.

**Implication:** the Phase-2 Assignment table needs an OPTIONAL `subScope` column (string, default null). W#2 populates it with the platform name. Other workflows leave it null. Index: composite `(workflow, projectId, subScope)` for fast "is this slot taken" lookups.

**Cross-reference:** `PLATFORM_REQUIREMENTS.md §2.2.1` (NEW 2026-05-04) — captures this as the platform-wide pattern; future workflows declare their own sub-scopes if needed.

---

### A.3 Throughput (Q3)

| Phase | Workers | Projects/day | Projects/week¹ | Projects/year² |
|---|---|---|---|---|
| Phase 1 | 1 (admin) | ~1 | ~7 | ~365 |
| Phase 3 | ~10 | ~10 | ~70 | ~3,650 |
| Phase 4 | ~20 | ~20³ | ~140³ | ~7,300³ |

¹ Assuming 7 days. ² Assuming ~52 weeks. ³ Phase 4 throughput is linear-extrapolation of Phase 3 (10 workers → 10/day; 20 workers → 20/day); director didn't explicitly commit to a Phase 4 number.

**Per-Project capture footprint (director's estimate):**

- ~100 competitor URLs per Project, total across all 7 platforms
- ~5,000 text rows per Project (titles, bullets, descriptions, reviews, etc.)
- ~300 images per Project (regular product shots + A+ content region-screenshots)

**Image storage projections (cumulative, ~500 KB average per image):**

- Phase 3: ~70 Projects/wk × 300 images × 500 KB ≈ **~500 GB/year**
- Phase 4: ~140 Projects/wk × 300 images × 500 KB ≈ **~1 TB/year**

**Cross-reference:** `PLATFORM_REQUIREMENTS.md §10.2` (NEW 2026-05-04) — captures the image-storage scale as a platform-level fact + dedicated bucket strategy.

**W#2 is the platform-bottleneck workflow at Phase 3.** Platform-wide Phase-3 target is 500 Projects/week (per `PLATFORM_REQUIREMENTS.md §1.2`). W#2's 70/week is ~7× lower. To match the platform target, W#2 would need ~70 workers, OR per-Project work would need to compress 7×, OR some Projects skip W#2. Director-acknowledged tradeoff; revisit at Phase 3 ramp time.

**Cross-reference:** `PLATFORM_REQUIREMENTS.md §1.4` (NEW 2026-05-04) — captures per-workflow throughput-bottleneck recognition pattern.

---

### A.4 Inputs (Q4)

W#2 is **fully self-contained input-wise.** It has zero upstream contract with W#1 or any other workflow.

**What W#2 reads:**
- **Project record** (Project ID, name, description) — from the existing `Project` table; same data the rest of PLOS uses.
- **User credentials** (extension authenticates against PLOS).
- **User-typed inputs at runtime:** highlight terms, selected platform, URL edits, field values, custom field definitions, etc.

**What W#2 explicitly does NOT read:**
- W#1's topic hierarchy / canvas / keyword clusters. Director rejected this at interview time. (Earlier `DATA_CATALOG.md §7.2.2` placeholder speculated W#2 might read W#1's topic hierarchy; that speculation is now overruled.)
- Anything from W#3-W#14.

**Implication for workflow readiness (see Q6):** W#2 is "always ready" — no upstream dependency to wait for.

---

### A.5 Outputs (Q5) — provisional list; design data model FLEXIBLY

Per `HANDOFF_PROTOCOL.md` Rule 18 reciprocal output declarations, W#2's outputs are explicitly named here. **Specific downstream consumers will be filled in at THEIR design interviews** — director chose NOT to lock in downstream consumer assumptions now.

**Director's directive at interview time:** "Design the system in a way that allows us to use things easily in the downstream workflows." Translation: the data model must be FLEXIBLE — extensible field schemas, loose downstream coupling, no assumptions baked in about which downstream workflow will read what.

**Provisional output list:**

| # | Output (provisional Human Reference Language) | What it is, in plain terms | Anticipated downstream consumers (provisional; finalized per consumer's interview) |
|---|---|---|---|
| 1 | **Competitor URL list** (per Project, per platform) | The structured list of every competitor product/listing the user identified, tagged by platform and competition category, with all the fields specified in §A.7 Module 1 | W#3 Therapeutic Strategy, W#5 Conversion Funnel, W#6 Content Development, W#9 Clinical Evidence, W#11 Post-Launch Optimization |
| 2 | **Captured text corpus** (per Project, per URL, per category) | All text snippets captured from competitor pages (titles, bullets, descriptions, reviews, etc.), tagged by content category + arbitrary tags | W#3, W#5, W#6, W#9, W#10 (Reviews) |
| 3 | **Captured image library** (per Project, per URL, per category) | All images saved (regular + region-screenshot A+ modules), with `Composition` + `Text` fields, tagged by image category + arbitrary tags | W#4 Brand Identity (visual references), W#6 Content Development (image inspiration), W#7 Multi-Media Assets (style references) |
| 4 | **Project-scoped vocabularies** | The user-created lists per Project: Competition Categories, Product Names, Brand Names, Size/Option labels, Content Categories, Image Categories, custom fields | Any downstream workflow on the same Project — vocabularies are platform-shared per `PLATFORM_REQUIREMENTS.md §8.4` |
| 5 | **Per-platform discovery metadata** | Which discovery channel (Amazon search, Google Shopping, Google Ads, Google organic) found each URL — preserves "how did we find this competitor" provenance | W#11 Post-Launch Optimization, W#13 Exit Strategy |

**Edit permissions — per-(producing-workflow, data-item, consuming-workflow) granular:**

Director's framing: "Downstream workflows are allowed to EDIT some of this data. Will be shared as per workflow." The default direction is NOT read-only. Specific edit permissions are deferred to each downstream workflow's design interview.

**Cross-reference:** `PLATFORM_REQUIREMENTS.md §6.6` (NEW 2026-05-04) — captures the granular permission model platform-wide.

**Vocabularies (output #4) are platform-shared, not W#2-owned:** any downstream workflow can ADD entries. W#2 just bootstraps the vocabularies. **Cross-reference:** `PLATFORM_REQUIREMENTS.md §8.4` (NEW 2026-05-04).

---

### A.6 Workflow readiness rules (Q6)

**Rule:** W#2 is **"always ready"** for any Project, regardless of whether W#1 (or any other workflow) has produced data for that Project.

**Prerequisites for working on W#2 in a Project:**
1. The Project must exist. Project creation is independent of any workflow — the `/projects` page (`src/app/projects/page.tsx:297-380`) has a "New Project" inline form that doesn't require any workflow. Confirmed by code inspection at interview time.
2. (Phase 2+) The user must have a (user × workflow × project × platform) assignment.

**No upstream data dependency.** W#2 doesn't wait for W#1 or anything else.

**Cross-reference:** `PLATFORM_REQUIREMENTS.md §6` example updated 2026-05-04 to reflect this (earlier draft incorrectly speculated W#2 would depend on W#1's topic hierarchy).

---

### A.7 User experience shape (Q7)

**Two halves with different components-library relationships (see Q14):**
1. Chrome browser extension — wholly outside the components library; separate codebase
2. PLOS-side section at `/projects/[projectId]/competition-scraping` — imports specific components from the Shared Workflow Components Library

**Bidirectional sync (Option C from Q7.a):** users can EDIT field values in BOTH the extension AND PLOS. The backend syncs both ways.

#### Module 1 — Competition Identification

**Job:** build a structured list of "who the competition is, where they live online, and basic facts about each."

**Setup (in the extension, before adding URLs):**

- User logs in with PLOS credentials → extension authenticates with PLOS → extension shows the user's accessible Projects (filtered by their assignments in Phase 2).
- User picks a Project to work on.
- User picks **which source platform** they're about to capture URLs from: Amazon / Ebay / Etsy / Walmart / Google Shopping / Google Ads / Independent Website (found via Google organic results).
- **Why platform-pick is mandatory before URL capture:** for non-shopping-site sources (Google Shopping, Google Ads, Independent Websites), the URL itself doesn't betray which discovery channel it came from — it just looks like a company's product page. Platform-pick at session start lets us tag every URL captured in that session with its discovery source.
- User enters one or more **"Highlight Terms"** — keywords/phrases the user wants the extension to find-and-highlight on whatever page they visit later. Each term gets a **user-pickable highlight color** from a palette of ~20 distinct swatches. Font color flips automatically (white text on dark background, black text on light background) so it's always readable. Terms are removable.

**The "live" part of Module 1 (this happens on the source platform's site, not on vklf.com):**

- User goes to Amazon (or wherever) and searches for something.
- Extension scans the page DOM, highlights every occurrence of the user's "Highlight Terms" in their chosen colors, and shows an **overlay** with a count of how many times the terms appeared on the page.
- This is purely a "help me eyeball which results are relevant" feature — no data is saved yet.
- When the user spots a competitor URL worth saving, they trigger an **add-URL gesture** (recommended: **Shift + Click**, with right-click fallback for trackpad-only users). Final gesture choice deferred to extension-build session.
- An **overlay** opens showing: the Project (auto), the chosen platform (auto), the URL (editable), and a set of fields they can fill in later or now.

**Per-URL fields (some required at capture, most fillable later):**

Required at capture (auto-populated; user only confirms):
- URL (auto, editable)
- Platform (auto)
- Project (auto)

Fillable later (free-form OR pick-from-prior):
- **Competition Category** — e.g., "device," "topical product," "supplement" — sortable in PLOS. Per-Project shared vocabulary.
- **Product Name** — per-Project shared vocabulary.
- **Brand Name** (often different from product) — per-Project shared vocabulary.
- **Size/Option** — sub-record under Product Name; one product can have many sizes.
- **Price** — sub-field under Size/Option; one product+size = one price.
- **Shipping Cost** — sub-field under Size/Option.
- **Results Page Rank** — what position this URL appeared at in the search results.
- **Product Star Rating** (Amazon, Ebay, Walmart only).
- **Seller Star Rating** (Etsy).
- **Number of Product Reviews**.
- **Number of Seller Reviews**.
- **User-defined custom fields:**
  - "Add new product-associated category" (e.g., Country of Manufacturing)
  - "Add new product-Size/Option-associated category" (e.g., Customizations for extra-large bottles)

**Other Module 1 behaviors:**

- User can browse the captured URL list inside the extension (mini-table view) so they can fill in fields without going back to vklf.com.
- User can also add a URL **manually** (typing it into a table) — useful for independent websites or any case the click-to-capture flow doesn't fit.
- User can edit/delete captured URLs from the extension OR from PLOS (bidirectional sync).

#### Module 2 — Competition Data Scraping

**Job:** for each URL captured in Module 1, collect the page's content — text snippets and images — categorized by content type.

**URL recognition:** when the user navigates back to a URL that's already in the system (for the current Project), the extension visibly signals "yes, this URL is recognized" — quickly and obviously (e.g., a green badge in the extension popover, or a subtle border highlight).

**Saving text — two paths:**

1. **Highlight-and-add:** user highlights a span of text on the page → triggers an "Add text" gesture (recommended: keyboard shortcut OR right-click context-menu item — final choice at extension-build session) → picks a **content category** (pre-existing or new on the spot) → text is saved against (URL, Project, category).
2. **Paste-into-extension:** user pastes raw text into the extension → picks URL → picks category → saved.

**Saving images — two flavors:**

1. **Regular image** (a product shot): right-click → "Save to PLOS" context-menu item → picks category → image is saved as a thumbnail in PLOS, expandable on click.
2. **A+ Content Module** (a marketing block where text is overlaid on an image, common on Amazon): right-click-save loses the text overlay because it's a separate DOM layer. Instead, the user invokes a special **"region-screenshot mode"** → mouse turns into a highlighter → user drags a rectangle around the entire visual block (image + overlaid text) → screenshot is saved as a single flattened PNG/JPG where the text is now baked into the pixels.

**Region-screenshot mechanism (provisional):** `chrome.tabs.captureVisibleTab` API to get the visible viewport, then crop client-side to the user's rectangle. Final approach evaluated at extension-build session.

**Every saved text or image record gets these extra fields:**
- **Composition** — describes what's IN the image (free text, manual now; future AI auto-fills it via vision model)
- **Text** — the text that appears INSIDE the image (free text, manual now; future AI auto-fills it via OCR / vision model)
- **Tags** — arbitrary text tags the user can add to any captured row, on top of the structured category

**Display on both sides (extension AND PLOS):**

- Captured data shows as a **table**.
- Browseable by clicking platform name → list of URLs for that platform → list of captured rows for that URL.
- Rows are **editable, deletable, reorderable, addable** from BOTH sides (bidirectional sync).
- Manually-added rows still attach to a URL/category.

#### UX split between extension and PLOS

| Action | Extension | PLOS |
|---|---|---|
| Log in with PLOS credentials | ✅ | ✅ (already exists) |
| Pick a Project | ✅ | ✅ (already exists at `/projects`) |
| Pick a platform (per session) | ✅ | — |
| Manage Highlight Terms + colors | ✅ | — |
| See live highlights on source platform's page | ✅ | — |
| Add-URL gesture (Shift+Click) | ✅ | — |
| Manually add a URL (typing) | ✅ | ✅ |
| Add-text gesture (highlight + shortcut) | ✅ | — |
| Paste text into extension | ✅ | — |
| Add-image gesture (right-click) | ✅ | — |
| Region-screenshot mode | ✅ | — |
| Browse captured-so-far | ✅ (mini-table) | ✅ (full sortable/filterable view) |
| Edit any field | ✅ | ✅ |
| Delete a row / URL | ✅ | ✅ |
| Reset extension state (LOCAL only) | ✅ | — |
| **Reset all W#2 data for this Project** (admin only, destructive, behind guard) | — | ✅ |
| Download extension files + install instructions | — | ✅ (always-visible deliverables area) |
| View image full-size + download original | — | ✅ |
| Sort/filter captured data | ✅ (basic) | ✅ (full) |
| Worker-status: "I'm done with platform X for Project Y" | ✅ | ✅ |
| Admin: assign workers per (Project, platform) | — | ✅ (Phase 2+) |
| Future: AI auto-populate Composition + Text on images | — | ✅ |

---

### A.8 Concurrency requirements (Q8)

**Pattern:** effective **Pattern A (strict single-editor)** at the (Project × platform) granularity, NOT at the Project granularity.

**Why:** per-platform partitioning (Q2) means two workers' writes physically can't conflict. Worker-A writes rows tagged `platform=Amazon`; Worker-B writes rows tagged `platform=Etsy`. There's no shared row to race on.

**Implication:** no operational-transform / CRDT machinery needed. Standard last-write-wins on individual rows is sufficient because the partitioning model means real conflicts (two workers editing the same row) cannot occur in normal operation.

**Edge case — admin-self-edit while a worker is offline:** a worker captures data offline; in the same window, admin edits a field on a captured row from PLOS; worker comes back online and the offline queue flushes. The most-recent write wins (admin's edit OR worker's edit, whichever was timestamped later by the server). Acceptable per "captured = done, no review cycle" framing — but flagged here so it's not a surprise later.

**Cross-reference:** `PLATFORM_REQUIREMENTS.md §3.2 Pattern A`.

---

### A.9 Review cycle applicability (Q9)

**"Captured = done."** W#2 does NOT use the standard `submitted-for-review → acceptable | revision-requested` cycle from `PLATFORM_REQUIREMENTS.md §4`.

The deliverable is the captured competition dataset; once the worker has captured it, it's available for downstream consumption immediately. No admin sign-off step.

**Implication for Phase-2 worker-status flow:** the worker UI shows a "I'm done with [platform] for this Project" button that flips the assignment to a `completed` state directly, skipping the `submitted-for-review` and `acceptable | revision-requested` states. The library's `<WorkerCompletionButton>` (Phase 1 path) is used; `<AdminReviewControls>` (Phase 2) is skipped for workflows like W#2 that declare `reviewCycle: 'skip'`.

---

### A.10 Audit trail requirement (Q10)

- **Phase 1 (admin solo):** NO audit emission. Irrelevant.
- **Phase 3 (~10 workers):** audit emission turns ON. Useful for catching mis-categorization patterns ("this worker keeps mis-categorizing X").
- **Implementation:** hooks into the platform-wide audit-trail infrastructure that Phase 2 builds (per `PLATFORM_REQUIREMENTS.md §5.5`).
- **Granularity:** per-action audit events for capture, edit, delete, vocabulary-add. Specific event payload schema deferred to Phase-3 audit-design time.
- **Phase 4:** audit table partitioning / archival evaluated at scale per `PLATFORM_REQUIREMENTS.md §5.4`.

---

### A.11 Reset rules (Q11)

**Two-scope reset model:**

1. **Extension-LOCAL reset.** User clicks "Reset extension" inside the extension UI. Behavior: extension's local cache is wiped + UI returns to "no Project selected" state. **Does NOT touch PLOS data.** Use case: worker finishes one Project's platform and wants to pivot to a different Project; or extension's local state got cluttered and they want a clean slate without losing PLOS-side data. Cheap, reversible (just re-log-in and re-pick the Project).

2. **PLOS-side data reset (admin-only, destructive).** Admin clicks "Reset W#2 data for this Project" inside PLOS at the Project's W#2 card. Behavior: deletes all W#2-captured data for this specific Project — URL records, text rows, image rows, vocabularies (entries created BY W#2 in this Project; vocabularies that other workflows added entries to are untouched per the platform-shared vocab model in §8.4). Same shape as W#1's reset (per `PLATFORM_REQUIREMENTS.md §7`). **Behind a guard:** "type the Project name to confirm — this will permanently delete all W#2 data for Project X." NOT reversible.

**Why this two-scope model (Option C in interview Q11.a):** clean separation of concerns. Extension reset = "I'm done with this Project on the extension side and want to pivot" (no destructive consequence). PLOS reset = "delete this Project's W#2 data" (destructive, admin only, behind guard). Both UIs make their consequences obvious.

---

### A.12 Data persistence (Q12)

**Director's framing at interview:** "Choose a methodology that is most sturdy and reliable with least risk of data loss." Director deferred to Claude's recommendation; Claude proposed an approach; director approved as drafted.

**Approved approach: "PLOS is canonical; extension is a thin client with offline tolerance."**

1. **PLOS database is the single source of truth.** Every captured URL, text row, image, vocabulary entry, custom field, etc. lives in the PLOS Postgres database (Supabase). Images live in Supabase Storage with their DB row holding the storage URL.

2. **Every user action in the extension writes through to PLOS immediately.** No batching, no "save when you click away." User highlights text → clicks Add → request goes to PLOS → ack returns → row appears in extension UI. Same for URL captures, image saves, field edits, deletes. **No window of time exists where captured data is "extension-only" and could be lost on tab close.**

3. **Each capture carries a client-generated unique ID (UUIDv4).** If a write times out and the extension retries, PLOS recognizes the ID and treats the second write as a no-op. So retries are safe — never produce duplicates.

4. **The extension keeps a small local cache** (Chrome extension's `chrome.storage.local`) for two purposes:
   - **(a) Read cache** — keeps the "browse captured-so-far" view inside the extension snappy without a round-trip to PLOS on every keystroke.
   - **(b) Offline write queue** — if PLOS is unreachable when the user captures something (slow Wi-Fi, PLOS deploy in progress, etc.), the capture is queued locally and flushed automatically when the connection returns. The user sees a small "syncing N items" indicator while the queue drains. **The extension does NOT let the user navigate away or close the tab while there's an unflushed write** — a small modal blocks tab close, same shape as Gmail's "you have unsaved changes" guard.

5. **PLOS pushes updates back to the extension in near-real-time:**
   - **Phase 1:** 5-10 second polling.
   - **Phase 2 onward:** Supabase Realtime subscription (when the platform-wide realtime infrastructure goes in per `PLATFORM_REQUIREMENTS.md §3.4`).
   - Bidirectional sync per Q7.a: edits in PLOS land in the extension; edits in extension land in PLOS.

6. **Image storage:** Supabase Storage, dedicated `competition-scraping` bucket, private (signed-URL access only), per-Project folder structure. **Reversibility:** swappable to S3 later via the storage helper wrapper that `PLATFORM_REQUIREMENTS.md §10.4` already requires.

7. **Image upload is two-phase:** (a) extension POSTs the image bytes to PLOS → PLOS uploads to Supabase Storage → returns a storage URL; (b) extension POSTs a captured-image row referencing that URL. If phase (a) succeeds but phase (b) fails, the orphaned image is cleaned up by a daily janitor job. **Why two-phase:** ensures the DB row only exists if the image is actually retrievable.

**Reversibility of this whole approach:** very high. Every layer (write-through, idempotency, offline queue, image two-phase) is additive — we can simplify any of them later if profiling shows them unnecessary, without losing data. Going the OPPOSITE direction (starting with batched local-heavy storage and trying to add reliability later) is much harder to retrofit safely.

**What this approach explicitly avoids:**
- "Local-first" architectures (PouchDB / IndexedDB-as-primary) — too easy to lose data when a user uninstalls the extension or wipes Chrome.
- "Save on tab close" — race condition on every reload.
- Fire-and-forget writes — invisible failure mode that bites months later.

---

### A.13 Edge cases and quality bar (Q13)

**Quality bar:** **niche-dependent and not ascertainable up-front.** There is no platform-wide quality threshold for "this dataset is acceptable."

Combined with Q9 ("captured = done, no review cycle"), the design implication is:

- **NO automated quality scoring** in W#2 (unlike W#1, which has stability scoring on AI-driven topics).
- **NO per-Project quality threshold check** that would block a worker from completing.
- **Admin judges quality by inspection**, per-Project. If a worker's dataset is sub-par for a particular niche, admin uses the PLOS-side reset action (per Q11) to wipe and re-assign.
- **Phase 3 audit trail** (per Q10) gives admin the forensic data to spot patterns ("this worker keeps mis-categorizing X") without slowing down the per-Project workflow.

**Edge cases worth recording for future implementation sessions:**

- **Site DOM changes (Amazon/Ebay/etc. update their HTML):** the extension's highlight + URL-recognition + region-screenshot logic depends on stable DOM patterns. Any site redesign breaks the extension. Mitigation: per-platform DOM-pattern modules in the extension; when a site changes, only that platform's module needs an update. Captured tab in `chrome.storage.local` of "platform DOM version observed last" so the extension can warn the user when a platform's DOM changes shape.
- **Captured page changes after capture (competitor updates their listing):** captured data is a snapshot. The captured URL still works, but if the user re-visits later and re-captures, the new capture lands as a new row (different timestamp) — old row preserved as historical.
- **Region-screenshot capturing the wrong region:** user can re-capture; old screenshot can be deleted from PLOS or extension.
- **Image storage bucket fills up unexpectedly:** monitored via Supabase dashboard; alerting deferred to Phase 3.
- **Worker captures duplicate URL for same Project:** PLOS DB enforces unique `(projectId, platform, url)` constraint; extension shows "URL already in this Project — view existing record" instead of saving a duplicate.
- **Custom field added by worker A, then worker B doesn't see it:** custom fields are per-Project; bidirectional sync (Q7.a / Q12) ensures all workers on the same Project see the same custom field set within the polling/realtime cadence.

---

### A.14 Components library fit (Q14) — director deferred to Claude's recommendation; approved as drafted (reframed 2026-05-05 from "Scaffold fit" to "Components library fit" per the components-library architectural pivot landed on `main` 2026-05-04 in `session_2026-05-04_workflow-tool-scaffold-design` — see `docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md` for the full library spec)

**Recommendation:** **PLOS-side W#2 view IMPORTS specific components from the Shared Workflow Components Library and authors its own custom React content component for the multi-table viewer. The Chrome extension is WHOLLY outside the library** (different deployment model — Chrome Manifest V3 codebase per `COMPETITION_SCRAPING_STACK_DECISIONS.md §1`, not a PLOS Next.js page).

#### PLOS-side W#2 view (`/projects/[projectId]/competition-scraping`)

The page composes its layout by importing the library components below + the workflow's own custom multi-table viewer for the content area. Per `PLATFORM_REQUIREMENTS.md §12` (REWRITTEN 2026-05-04 — components-library architecture replaces the earlier scaffold-shell concept), there is no required shell; the workflow page authors its own composition.

| Library component | W#2 use | Notes |
|---|---|---|
| `useWorkflowContext()` hook | ✅ imports | Auth + Project + role + workflow-status load (per `WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md §3.1`); replaces ~40 lines of boilerplate |
| `<WorkflowTopbar>` | ✅ imports | Workflow title "Competition Scraping & Deep Analysis" + back-to-Project breadcrumb + admin-only reset button (admin reset = the PLOS-side data-wipe per Q11) |
| `<StatusBadge>` | ✅ imports | Standard 3-state Phase 1 (inactive / active / completed); 5-state including review states wired but dormant in Phase 1 (W#2 has no review cycle — `reviewCycle: 'skip'` declared at workflow level) |
| `<DeliverablesArea>` (Resources sub-section) | ✅ imports | Always-visible deliverables — Detailed User Guide + Download Extension button (per Q13). Implements `PLATFORM_REQUIREMENTS.md §12.6` shared component pattern #1 |
| `<CompanionDownload>` | ✅ imports | Chrome extension download — rendered inside the Resources sub-section per `WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md §3.5` Decision 4A. Implements `PLATFORM_REQUIREMENTS.md §12.6` shared component pattern #3 |
| `<ResetWorkflowButton>` + `<ResetConfirmDialog>` | ✅ imports | Admin-only reset UX with type-the-project-name confirmation; wired to W#2's own `resetWorkflowData(projectId)` function per `PLATFORM_REQUIREMENTS.md §7.3` |
| `<NotReadyBanner>` | ❌ skipped | W#2 declared "always ready" per §A.6 — no upstream-readiness rule (no W#1 dependency) |
| `<WorkerCompletionButton>` (Phase 1 path) | ✅ imports | Phase 1: button-driven completion (admin self-completes per `PLATFORM_REQUIREMENTS.md §4.4`). Per-(Project × platform) completion semantics handled INSIDE W#2's custom content component (the multi-table viewer); the library button is for the workflow-level overall completion |
| `<AdminReviewControls>` (Phase 2) | ❌ skipped | W#2 declared `reviewCycle: 'skip'` — no review cycle |
| `useEmitAuditEvent()` (Phase 2 / 3) | ✅ imports (Phase 3) | Per Q10, audit emission turns on in Phase 3 |

**Custom React content component** (W#2's own — NOT library): a multi-table viewer with platform → URL → captured-rows navigation, sort/filter, and image expand viewer. This is the workflow's own concern per `PLATFORM_REQUIREMENTS.md §12.6` shared component pattern #2 (content area is the workflow's own concern, not imposed by the library). W#2 is the FIRST workflow to author such a custom content component.

#### Chrome extension

- ❌ **Wholly outside the components library.** The library is a set of React components for PLOS Next.js workflow pages; the extension is a separate codebase (Chrome Manifest V3 + WXT framework per `COMPETITION_SCRAPING_STACK_DECISIONS.md §1` + its own build pipeline).
- The extension SHARES the PLOS API contract and the PLOS data model — but does not import any library components.
- We can borrow visual language from PLOS for consistency, but no shared component library between them in Phase 1.

#### Three shared component patterns W#2 surfaces (captured in `PLATFORM_REQUIREMENTS.md §12.6`)

W#2's design interview surfaced the three patterns the components library implements, captured in `PLATFORM_REQUIREMENTS.md §12.6` (NEW 2026-05-04; framing reframed 2026-05-05):

1. **Always-visible deliverables.** A workflow may have downloadable artifacts (extension files, templates, README PDFs) present regardless of Project state. Implemented by `<DeliverablesArea>`'s optional Resources sub-section.
2. **Custom React content components.** A workflow's content area is the workflow's own custom React component — NOT something the library imposes or provides. W#2 exercises this first (multi-table viewer).
3. **External-client companion pattern.** A workflow may ship a downloadable companion artifact (browser extension, mobile app, desktop tool) that talks to PLOS via API. Implemented by `<CompanionDownload>`. W#2 is the first.

#### Sequencing

Per `PLATFORM_REQUIREMENTS.md §12.4` (REWRITTEN 2026-05-04), library components are built incrementally as workflows surface concrete needs. The Phase-1 components needed to unblock W#2's PLOS-side build (`useWorkflowContext()`, `<WorkflowTopbar>`, `<StatusBadge>`, `<DeliverablesArea>` with Resources sub-section, `<CompanionDownload>`, `<ResetWorkflowButton>` + `<ResetConfirmDialog>`, `<NotReadyBanner>`, `<WorkerCompletionButton>` Phase 1 path) ship first. Phase 2 components (`<AdminReviewControls>`, `useEmitAuditEvent()`) are built when Phase 2 turn-on is scheduled.

**Recommended session sequence after this interview:**

1. **W#2 Stack-and-Architecture session** — extension framework (Manifest V3 + vanilla JS / React-in-extension / Plasmo / WXT — choose); auth pattern (long-lived API tokens vs OAuth device flow); image storage flow (signed-URL upload helper); region-screenshot mechanism (`chrome.tabs.captureVisibleTab` + canvas crop vs html2canvas); URL-add gesture (Shift+Click recommended); Highlight Terms color palette (~20 distinct accessibility-contrast colors); polling vs realtime upgrade timing. Output: `COMPETITION_SCRAPING_STACK_DECISIONS.md` Group B doc + updates to this doc's §B. ✅ DONE 2026-05-04 (`session_2026-05-04_w2-stack-and-architecture`).

2. **Shared Workflow Components Library Phase-1 build** — ships the components named above (per `WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md §A`). Cross-workflow concern; not W#2-only — every workflow #3-#14 imports library components freely.

3. **W#2 PLOS-side build** — composes library components + W#2's custom multi-table viewer content component. Multiple sessions: schema migration, API routes, custom React content component, sort/filter UI, image expand viewer, admin reset.

4. **W#2 Chrome extension build** — can run in parallel with the PLOS-side build after stack-and-architecture is locked + Phase-1 library has shipped. Multiple sessions: extension shell, auth, Module 1 capture flow, Module 2 capture flow, image upload, offline queue.

---

### A.15 Director's free-form brief (preserved verbatim — important context for future sessions)

The director provided this brief at the start of the interview, before the structured 14-question pass. It is preserved verbatim here because it contains UX details, examples, and rationales that the structured Q&A condensed; future implementation sessions should refer back to it for the original framing.

---

> WORKFLOW #2: Competition Scraping & Deep Analysis
>
> We have been working on a tool known as the PLOS (Product Launch Operating System) that has multiple workflow tools that allows us to work on individual 'Projects' and process specific data within each tool. So far we have finished working on the 'Keyword Clustering Tool' and now want to begin working on the 'Competition Scraping & Deep Analysis' tool. Note that this tool will work on the same project(s) that were created and were worked on by the 'Keyword Clustering Tool'.
>
> Overview of the 'Competition Scraping & Deep Analysis' tool:
>
> This tool is essentially a chrome extension that allows the user to quickly and easily do the following:
>
> - Create a list of competitors of a specific product niche (which will be associated with the Project in our PLOS). This competitors list can be shopping site product listings (Amazon, Ebay, Etsy, Walmart, Google Shopping) or independent product websites. The user should be able to create categories for these competitors (for example, primary competitor, secondary competitor, etc.).
>
> - Manually scrape text data on those competitor product listing pages and websites by highlighting specific sentences and/or paragraphs and then associating them with specific data categories (for example, Product listing title, Product Listing Bullet Points, etc).
>
> - Manually save images on those competitor product listing pages and websites by right clicking on those images and then associating them with specific data categories (for example, Product listing images, Amazon A+ Content Module Image, etc).
>
> - See all this collected data in PLOS on our site (vklf.com), organized under its associated project.
>
> In other words, this tool will have multiple mini workflows that the user can use to collect specific data from shopping sites and independent product websites. The chrome extension files should be available in PLOS inside the 'Competition Scraping & Deep Analysis' card so that if the user doesn't have the files, they can download it from there and see the instructions on how to use the extension properly.
>
> Now let's go over the detailed functionality the extension should have:
>
> When the user first chooses a project and clicks the 'Competition Scraping & Deep Analysis' card in the PLOS UI, they should see a section to download the 'Competition Scraping & Deep Analysis' extension files and instructions on how to install the chrome extension. Once the user loads the chrome extension, there should be a way for the user to enter their credentials to log into the extension and connect it to the PLOS platform in vklf.com where they can choose the 'Project' they can work on. This 'Projects' list is the same projects list that were created when the admin first started working on the projects in the Keywords Sorting tool. Note that projects are only created once in the beginning when admin starts working on them in the Keyword Sorting Tool, then other tools access the same project and add data to it. Once the user is logged into the 'Competition Scraping & Deep Analysis' extension and connected to a project in PLOS, then they can choose a 'module' within the extension to start working on the workflow associated with the extension. The following are the modules that the user can choose and work on with details on the functionality of each module:
>
> **Competition Identification Module:**
>
> This module essentially allows the user to add specific shopping site listing urls and website urls to the project along with the product name and company name to be associated with the Project. Before the user can add a url to the project, they have to first select which platform they will be adding the urls from. The choices will be Amazon.com, Ebay.com, Etsy.com, Walmart.com, Google Shopping, Google Ads and Independent Websites (found via google results).
>
> The Competition Identification Module should also have a text input box with the title called 'Highlight Terms'. Here the user should be able to enter multiple terms into the text box and when the user then clicks outside the text box, the system should show the individual terms listed under the 'Highlight Terms' heading with a color swatch next to each one and an option to remove the individual highlight terms. When the user clicks on the color swatch next to the individual highlight terms, they should be shown an expanded color swatch with individual rectangles containing individual colors. If the user clicks on a specific color, they should return to the 'Highlight Terms' and the term for which the color swatch was selected should be highlighted in that color. Make sure the text font changes to a color so that it stands out in front of the highlighted background (for example, if the highlight color is white, the font color should be black but if the highlight color is black, then the font color should be white. Note that the user only needs to be give about 20 color choices that are distinct from each other.
>
> Once the user enters the 'Highlight Terms' and selects a specific highlight color to go with each term, then they can choose from the platform choices provided above (Amazon.com, Ebay.com, Etsy.com, Walmart.com, Google Shopping, Google Ads and Independent Websites) and then the user can go to that specific website and start adding urls in the way described below. You may be wondering why the user needs to select the platform name before adding urls and that because it is critical for admin to not only know who the competition is (through the url) but where that competition exists. While it may seem logical that simply going to Amazon, ebay, esty or Walmart should alert the tool that the user is on that platform, the problem occurs when the user is on Google Shopping, Google Ads or an Independent product website (found via Google Results), where the link to the competition is often simply the link of the company's product page and there is no way to tell what platform (Google Shopping, Google Ads or Google Results), those urls were found through. By having the user first select the platform and then initiate the url adding process, the tool will always know what the source we used to identify the competition. In the 'Competition Scraping & Deep Analysis' section in PLOS, admin will be able to see this information along with the url as well when this data is presented to them.
>
> Now note that when the user goes to any of the platforms that they have selected to start adding urls from, the user may enter some search term in that platform's search bar which will lead to the platform showing that search term's results. The tool should at this point look at the entire page and see if anywhere on the page any of the individual 'Highlight Terms' exist and if they do, the tool should highlight that term on the page in the color selected by the user in our tool. This allows for the user to quickly and easily see if any product listing links are relevant to the user's competition identification search. The extension should also show an overlay that has the total number of times the page contains the 'Highlight Terms'. Now when the user wants to add a product listing url to the selected Project under the 'Competition Identification Module' of the 'Competition Scraping & Deep Analysis', they should be able to click on the target url link using some method that you can suggest (for example, Shift + Left click or right click) and then an overlay should open that should show the project into which the url is about to be added, the platform under which the url is about to be added, the url itself that is about to be added and then there should be a few more fields that the user can populate:
>
> - Competition Category: (in which the user can either add a new category or can choose from a previously added category). Note that these categories represent the type of product or services the competition represents (for example, device, topical product, supplement, etc). Then in the PLOS under 'Competition Scraping & Deep Analysis', admin can sort the view of all competition by categories.
> - Product Name: This is simply the product name. Again, the user can either add a new product name or can choose from a previously added product name.
> - Brand Name: This is simply the brand name (which can often be different from the Product Name). Again, the user can either add a new brand name or can choose from a previously added brand name.
> - Size/Option: This represents the product size/Options. Note that this should be a sub-category below the product name. In other words, the user should be able to add multiple 'Sizes/Options' under a single product name.
> - Price: This represents the product price. Note that this should be a sub-category below the product name and associated with a specific product Size/Option. In other words, the user should be able to add a specific price for each Size/Option under a single product name.
> - Shipping Cost: This represents the product shipping cost. Note that this should be a sub-category below the product name and associated with a specific product Size/Option. In other words, the user should be able to add a specific shipping cost for each Size/Option under a single product name.
> - Results Page Rank: This is the results page position of that url, also added by the user.
> - Product Star Rating: This is simply a number that shows how many stars the product has out of 5. Applies to Amazon, Ebay and Walmart.
> - Seller Star Rating: This is simply a number that shows how many stars the seller has out of 5. Applies to Etsy.
> - Number of Product Reviews: This is simply a number that shows how many reviews customers have left for the product.
> - Number of Seller Reviews: This is simply a number that shows how many reviews customers have left for the seller.
> - The user should also be able to add new fields that are either product associated (which should say "Add New Product Associated Category"), for example, 'Country of Manufacturing' or associated with a specific product Size/Option (which should say "Add New Product Size/Option Associated Category"), for example 'Customizations for extra large bottles'.
>
> Note that the seller does not need to enter any information aside from submitting the url (which should be editable by the user). The other fields should be updateable later.
>
> All the data captured by the user should be updated in real-time in the 'Competition Scraping & Deep Analysis' section in PLOS under 'Analyze Competition'. The user should also be able to click on the extension to see all the data they have captured so far if they want to populate the fields associated with each competition url. Note that the user should be able to reset the entire extension to get rid of all data in it to reuse it for another Project or delete any urls and its associated data individually.
>
> Note that the user should be able to add competition urls through the easy mechanism we will come up with as mentioned above or the user should be able to manually add a url into the competition table (for example, independent websites).
>
> **Competition Data Scraping Module:**
>
> In this module the user should be able to do two things:
>
> - Store selected text into categories under a specific url under a specific Project.
> - Store selected images into categories under a specific url under a specific Project.
>
> Let's go into the details of this module. Say, at one point, the user has added all the competition urls. Now the user should be able to go to one of those urls and the tool should confirm in a quickly apparent way that the extension knows this url is recognized as already in the system. Then the user should be able to begin the process of scraping text data and image data in a way that will not go against any Amazon.com, Ebay.com, Etsy.com, Walmart.com and Google policies. Below we will go over how exactly the user should be able to scrape both text and image data from the competition urls in a fast way and more manual way (while both methods will be manual)...
>
> When adding text data to a project, the main way the user should be able to do that is by highlighting entire string of text they want to add to the project and then through an easy and fast mechanism that you can suggest, they should be able to click 'Add text' to add that text to the project. However, note that when the user is adding text under a url which in turn is associated with a specific platform and is associated with a specific Project, the user also has to specify what content category that data belongs under. These categories can be created by the user at any time (even while adding text or images) and the user can even select pre-made categories under that project. For example, a category might be 'Amazon Title' which will reference that the text is the Amazon listing's title or it may be 'Amazon Bullet Point' in which case it is a bullet point at the top of the Amazon listing. The other way the user can add data is by simply pasting it into the extension under the url. Again, the user will have to choose which url that want to add the data to and what category they want to add the data to. This will come in handy when admin wants to look at not just competition for a specific Project in PLOS but when they want to look at just one aspect of the competitions such as Titles, Bullets, Reviews, etc. There should also be 2 additional fields associated with each image: 'Composition' (which describes the composition of the image) and 'Text' (which contains specific text that is embedded in the image), both these things can be manually populated by the user or an AI tool will be added later to be able to have an AI module do populate both these things.
>
> The other type of data the user should be able to store under a url are images. Just like text data, the user should be able to save the images under categories. Note that the extension and out tool in PLOS should know if the data collected is text or an image. Images can be of two different kinds. They can be normal images such as product shots or they can be A+ content modules that are a combination of image and superimposed text. If the image that is being stored is a regular image, the our extension should rely on a simple mechanism that you can come up with to save that image under a new or existing image category under the url. These images should be viewable as thumbnails in the PLOS (Competition Scraping & Deep Analysis) and expandable when clicked on. However, if the image that is being stored is like a A+ content module that has both images and a text overlay, the user should be able to employ a methodology which you can suggest where if a specific button is clicked, the mouse turns into highlighting tool where the user can click and highlight the entire image including the image and text overlay elements and screenshot it so that the screenshot can be saved as a single image (essentially embedding the text into the image which would not happen if only the image was saved in the normal way). Once again, each such stored image should have the 'Composition' and 'Text' fields associated with them and be treated like the way we treat any collected data (stored under a url under a specific category).
>
> Now all this data should be presented in both the extension and PLOS (Competition Scraping & Deep Analysis) as a table that can be explored by clicking on individual platform names or urls. Note that there should also be a tags column next to each piece of data added under a specific url and the user should be able to add text tags to those specific pieces of text or images.
>
> Note that the user should be able to edit/delete any text in the table. The user should also be able to move rows within the table.
> The user should also be able to add new rows of data to the table under any url (this data would have to be associated with the same things that any data collected from the urls is).
>
> While only admin will be using the extension initially, note that later only multiple people should be able to download the extension and simultaneously work on the Projects they are assigned to. These users will be assigned not only to specific Projects but specific platforms (Amazon, Ebay, Etsy, Walmart, Google) so that they can only add urls from those platforms (Google Shopping, Google Ads and Google Organic Results assigned people can add any url from any independent website however only within the specific Google platform they are assigned to).
>
> Please think about the best way to program this extension and best stack to use so that scaling up as mentioned won't be an issue long term. Please make sure you study our existing PLOS platform so that the new 'Competition Scraping & Deep Analysis' section and tool development fits seamlessly into the platform. Ask as many questions as needed to ensure you have a good grasp on what needs to be done in a sturdy and reliable manner. Since this will take many sessions, make sure you employ a methodology that creates handoffs within the codespace that you have access to and creates the initial prompt such that each new session knows exactly where we are in the roadmap and where the tool fits within the context of the overall platform so that the tool does not clash with any other functionality.
>
> MAKE SURE IF YOU USE A COMMON ROADMAP OR HANDOFF DOCUMENTS THAT MAY BE USED BY OTHER WORKFLOWS, YOU SHOULD NEVER CHANGE THE PARTS OF THOSE DOCUMENTS THAT APPLY TO OTHER WORKFLOWS BECAUSE WE MAY WORK ON THEM AT DIFFERENT PACES THAN THIS WORKFLOW.

---

### A.16 Platform-Truths Audit (Rule 19) cross-reference

The following platform-level facts surfaced during this interview and were ratified into `PLATFORM_REQUIREMENTS.md` in this same session per Rule 19. All additive; no existing requirements removed or weakened.

| # | PLATFORM_REQUIREMENTS.md location | What was added |
|---|---|---|
| (a) | §1.4 (appended) | Per-workflow throughput-bottleneck recognition. W#2 = 70/wk vs platform target 500/wk = ~7× shortfall. Director-acknowledged tradeoff. |
| (b) | §2.2.1 (NEW) | Workflow-internal sub-scopes. W#2 sub-scope = `platform`; per-(user × workflow × project × platform) assignment; one worker per (project, platform). |
| (c) | §6 example (corrected) + §6.6 (NEW) | W#2 confirmed "always ready" (earlier speculation rejected). NEW §6.6 captures cross-workflow data permissions as per-(producing-workflow, data-item, consuming-workflow) granular. |
| (d) | §8.4 (NEW) | Project-scoped shared vocabularies. Vocabulary tables scoped to (Project × vocabulary-type), not to producing workflow; any workflow on the same Project can READ + ADD entries. |
| (e) | §10.1 (appended) | Non-web-app clients pattern. Chrome extension is the first non-web-app client of PLOS. Auth, API surface, distribution implications. |
| (f) | §10.2 (appended) | Image-storage scale projections. ~500 GB/yr Phase 3, ~1 TB/yr Phase 4. Dedicated bucket per workflow + private + signed URLs. |
| (g) | §12.6 (NEW) | Three shared component patterns surfaced by W#2: always-visible deliverables (`<DeliverablesArea>` Resources sub-section), custom React content components (workflow's own concern, not imposed by library), external-client companion pattern (`<CompanionDownload>`). Note: §12.6 was originally framed as "scaffold extension-points" at the time of the 2026-05-04 W#2 interview; reframed 2026-05-05 W#2 doc-reframe to "shared component patterns" per the components-library architectural pivot landed on `main` 2026-05-04. |

---

### A.17 Open implementation questions deferred to W#2 Stack-and-Architecture session

These are NOT design-doc questions; they're implementation-detail decisions that need their own session BEFORE any code is written. Captured here so the next session has a checklist.

1. **Extension framework choice.** Manifest V3 + vanilla JS (lowest dependency, most portable) vs React-in-extension (familiar to PLOS web team) vs Plasmo (modern, batteries-included) vs WXT (similar to Plasmo). Trade-offs: bundle size, dev ergonomics, hot-reload during development.
2. **Auth pattern.** Long-lived API tokens issued from a PLOS settings page (simple, similar to GitHub PAT) vs OAuth 2.0 device flow (more standard, enables revocation). Decide once; pattern applies to all future non-web clients per `PLATFORM_REQUIREMENTS.md §10.1`.
3. **Image storage flow.** Bucket name (`competition-scraping`); upload helper (signed-URL flow vs server-relay); per-Project folder structure; janitor job for orphaned images.
4. **Region-screenshot mechanism.** `chrome.tabs.captureVisibleTab` API + client-side canvas crop (simplest, works on any page) vs html2canvas (works on hidden DOM but slower) vs DOM-to-image. Test on Amazon A+ content modules specifically.
5. **URL-add gesture.** Recommended: Shift+Click. Fallback for trackpad-only users: right-click context menu item. Reasoning: Shift+Click is the universal "open in new tab without actually opening" gesture from browser tradition; users find it intuitive.
6. **Highlight Terms color palette.** ~20 distinct colors, accessibility-contrast-checked. Each color paired with its auto-flipped text color (white-on-dark, black-on-light). Recommend WCAG AAA contrast for the foreground/background pair.
7. **Add-text gesture.** Recommended: keyboard shortcut (Ctrl+Shift+A or similar) AFTER text is highlighted. Fallback: right-click context menu item. Test for collision with browser/site shortcuts.
8. **Real-time sync polling cadence (Phase 1).** 5-10 sec polling for "new captures from PLOS" (low frequency because workers don't share platforms within a Project, so cross-worker updates are rare). Upgrade to Supabase Realtime push when platform-wide realtime infrastructure ships in Phase 2.
9. **Schema design.** Tables: `competitor_url`, `captured_text`, `captured_image`, `vocabulary` (shared with platform), `worker_assignment` (Phase 2), `audit_event` (Phase 3). Indexes: per-(projectId, platform) primary access pattern; per-(projectId, vocabulary_type) for vocab lookups. Schema-change-in-flight flag must be set in Active Tools table during this session (see `MULTI_WORKFLOW_PROTOCOL.md` Rule 4 schema-change handshake).
10. **PLOS-side route structure.** `/projects/[projectId]/competition-scraping/page.tsx` = main view; sub-routes for individual URL detail (image expand viewer); admin assignment UI route (Phase 2).
11. **API route structure.** REST conventions matching W#1's pattern: `POST /api/projects/[projectId]/competition-scraping/urls`, `POST .../text`, `POST .../images` (two-phase upload), etc. CORS-friendly + idempotent + token-auth-aware per §10.1 implications.
12. **Build pipeline for the extension.** Separate package in repo (e.g., `extensions/competition-scraping/`) with its own `package.json`, build (Vite or webpack), packaging (.zip for Chrome Web Store + unpacked dir for development sideloading). CI hooks to package on every release.
13. **Distribution.** Phase 1: unpacked dev folder + zip on PLOS deliverables area. Phase 2+: Chrome Web Store listing (organization-private if possible).

---

### A.18 Recommended sequencing (next sessions)

Per Q14 sequencing analysis:

1. **Next session — W#2 Stack-and-Architecture session.** Resolves §A.17 questions 1-13. Output: `COMPETITION_SCRAPING_STACK_DECISIONS.md` (Group B doc). No code yet; design + decisions only.
2. **After that — Shared Workflow Components Library Phase-1 build.** Cross-workflow concern; not W#2-specific. Incorporates `PLATFORM_REQUIREMENTS.md §12.6` shared component patterns surfaced by W#2 (always-visible deliverables, custom React content components, external-client companion). Multiple sessions. ✅ DONE 2026-05-05-c on `main` (commit `34e88ea`); reached this branch via 2026-05-06 merge.
3. **After Phase-1 library ships — W#2 PLOS-side build.** Multi-session: schema migration → routes → custom React content component (composed alongside imported library components per `PLATFORM_REQUIREMENTS.md §12.6` shared component pattern #2 — content area is the workflow's own concern) → admin reset (uses library's `<ResetWorkflowButton>` + `<ResetConfirmDialog>`) → image expand viewer → (Phase 2) admin assignment UI.
4. **Parallel with PLOS-side build — W#2 Chrome extension build.** Multi-session: shell → auth → Module 1 capture flow → Module 2 capture flow → image upload → offline queue → distribution polish.

---

## §B — In-flight refinements (APPEND-ONLY)

This section is for entries added in subsequent sessions when the director adds scope, refines decisions, or surfaces new requirements between this initial design doc and Tool Graduation. Each entry: date, session ID, what the director said, what alternatives were considered, what was decided. Append-only — never edit prior entries.

### Format for each entry

```
**[DATE] — [session ID]**
- **Director's directive:** [verbatim or close paraphrase]
- **Alternatives considered:** [brief list]
- **Decision:** [what was decided]
- **Affected sections:** [which §A sub-sections this refines, or "new — no prior §A coverage"]
- **Cross-references:** [other docs touched, if any]
```

### Entries

**2026-05-04 — session_2026-05-04_w2-stack-and-architecture (Claude Code, second W#2 session)**

- **Session purpose:** resolve the 13 deferred implementation questions captured in §A.17 ("Open implementation questions deferred to W#2 Stack-and-Architecture session"). Output a new Group B doc capturing the FROZEN stack decisions; this §B entry serves as the event log + pointer.

- **Director's directives:**
  - Approve all 13 stack decisions in 4 clusters of 3-4 questions, with cluster-level read-back per `HANDOFF_PROTOCOL.md` Rule 18.
  - **Schema-change-in-flight handshake (Cluster 0):** approved Option A — flip the W#2 schema-change-in-flight flag in `ROADMAP.md` "Current Active Tools" table to "Yes" at start of this session, covering both this design session AND the next implementation session that lands `prisma/schema.prisma` edits. Flag stays "Yes" until that implementation session completes + pushes. Flipping was done immediately at session start (Rule 19 exception — the flag's purpose is real-time coordination visibility for any parallel chat that might open mid-session).
  - **Q5 URL-add gesture override:** director chose Option D (floating "+ Add" button on link hover) over Claude's recommendation of Option A (right-click context-menu + Alt+Click). Reasoning: most discoverable for non-technical Phase 3 workers. Implementation guardrails accepted: 300ms hover delay, scoped to product-detail-page patterns per platform, per-session dismiss button, right-click context-menu as redundant secondary path.
  - **Q7 add-text gesture override:** director chose Option C (click "Add Text" button in extension popover) over Claude's recommendation of Option A (right-click + Ctrl/Cmd+Shift+S). Same reasoning — most discoverable for non-technical workers.
  - **Q13 distribution add-on:** director added explicit requirement that PLOS contains DETAILED instructions on how to **install AND USE** the extension. Captured in §13 of the new STACK_DECISIONS doc as a Detailed User Guide block always visible at `/projects/[projectId]/competition-scraping`, with full workflow walkthrough + screenshots + printable PDF version.
  - **Q8 sync cadence add-on:** director added explicit requirement that the system plan for contingencies and have redundancies so that any data missed being synced is quickly caught and fixed. Captured in §8.3 of the new STACK_DECISIONS doc as a comprehensive sync-failure safety net: write-ahead log, failed-write queue, tab-close guard, always-visible sync indicator, idempotency-key echo, periodic reconciliation, worker-completion verification using server counts (Phase 2), daily janitor count-consistency check, worker-visible failure mode with diagnostic export.

- **Alternatives considered:** comprehensive — every question presented Claude's per-option pros/cons in plain language with explicit recommendation marker per Rule 14f. Notable alternative-vs-decision deltas:
  - Q1 framework: WXT chosen over Plasmo (similar batteries-included, but WXT is TypeScript-first + thinner abstraction over Manifest V3).
  - Q2 auth: direct `signInWithPassword` chosen over the §A.17-listed long-lived-API-token + OAuth-device-flow options. **§A.17 framing missed this option** — captured as a `CORRECTIONS_LOG` entry at end-of-session.
  - Q3 image upload: signed-URL direct upload chosen over server-relay (bypasses Vercel function size + timeout cliffs).
  - Q4 region-screenshot: `chrome.tabs.captureVisibleTab` + canvas crop chosen over html2canvas (pixel-perfect; no DOM-walking quirks; no third-party library).
  - Q9 schema: 7 W#2-scoped tables + 2 cross-workflow tables (WorkerAssignment for Phase 2, AuditEvent for Phase 3); custom fields = JSON-on-parent for Phase 1, normalize at Phase 3 if needed (deferred ROADMAP polish item).
  - Q12 build: monorepo at `extensions/competition-scraping/` chosen over separate-repo (lockstep API contract changes; shared types as a folder, not a published package).

- **Decision:** all 13 §A.17 questions resolved. The new Group B doc `COMPETITION_SCRAPING_STACK_DECISIONS.md` is the FROZEN spec. §A.17 is now considered RESOLVED — future build sessions read the new doc, not §A.17.

- **Affected sections:** §A.17 (resolved by reference; remains in §A as the historical record of the questions). §B entries: this is the first §B entry. No edits to §A1–§A18; §A remains frozen per Rule 18.

- **Cross-references:**
  - **NEW:** `docs/COMPETITION_SCRAPING_STACK_DECISIONS.md` — full FROZEN spec for §1-§13 plus §14 cross-doc updates list + §15 build-session deferred items.
  - `docs/ROADMAP.md` — "Current Active Tools" W#2 row updated; schema-change-in-flight = Yes; W#2 section updated.
  - `docs/PLATFORM_REQUIREMENTS.md` §10.1 — direct-credentials chosen as non-web-app-client auth pattern.
  - `docs/PLATFORM_REQUIREMENTS.md` §10.1 (potentially §10.2) — sync-reliability pattern as candidate platform-wide requirement (decision deferred to end-of-session Platform-Truths Audit per Rule 19; tracked as a `DEFERRED:` task per Rule 26).
  - `docs/CORRECTIONS_LOG.md` — entry on §A.17 Q2 framing miss.
  - `docs/DATA_CATALOG.md` §6.1 — provisional W#2 entries promoted to finalized field names per §9.
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — new Group B doc registered.

---

**2026-05-07 — session_2026-05-07_w2-api-routes-session-1 (Claude Code, on `workflow-2-competition-scraping` branch)**

- **Session purpose:** ship session-1 of the recommended 3-session split for the W#2 API routes per `COMPETITION_SCRAPING_STACK_DECISIONS.md §11.1`. The split: session-1 = read paths + `urls` POST/PATCH/DELETE + vocabulary endpoints; session-2 = text + sizes + image-upload two-phase flow + reconcile + `competition-storage.ts` helper; session-3 = admin reset endpoint + janitor cron.

- **Director's directive (carried over from prior session's ROADMAP next-session list):** begin item (a) of the W#2 ROADMAP next-session list — API routes per §11. No new directives this session.

- **Alternatives considered (Rule-15 autonomous decisions, surfaced in the drift check + recap, accepted by director by absence of pushback):**
  - **POST `.../urls` idempotency:** §11.1 doesn't specify behavior on duplicate (workflow, platform, url) creates, but §11.2 cross-cutting items emphasize extension-idempotency. Two patterns considered: (a) return 409 with the existing row in body so the caller can branch; (b) create-then-catch-P2002 returning the existing row with 200 (treats duplicate as a successful idempotent retry). Chose (b) — most-thorough-and-reliable for the extension's WAL-driven retry pattern; 200 vs 201 status code lets the caller distinguish if needed without ever surfacing a 500 on a benign duplicate. Same pattern applied to POST `/vocabulary` (where §11.1 explicitly says "upsert (no error on duplicate)").
  - **PATCH `.../urls/[urlId]` error mapping:** P2025 (record not found) surfaced as 404; P2002 (re-target collides with another existing row) surfaced as 409. Standard HTTP semantics; gives extension callers actionable distinction between "not yours / never existed" and "would create a duplicate" and "transient flake."
  - **DELETE idempotency:** P2025 (already deleted) returns `{success: true}` instead of erroring. Matches the W#1 pattern; safe under retry.
  - **CORS allowlist:** any `chrome-extension://*` origin allowed via permissive prefix match; the JWT remains the auth boundary. Locking down to a specific extension ID would require knowing the production Web Store ID at PLOS-build time, which we don't have until Phase 2 distribution per §13.2. Documented in `src/lib/cors.ts` header comment.
  - **Vocabulary route activity-stamping:** the project-scoped vocabulary route does NOT call `markWorkflowActive` — it uses `verifyProjectAuth` (not `verifyProjectWorkflowAuth`), so it lacks a clean single workflow context to stamp. The calling workflow's own routes (urls POST/PATCH/DELETE on the W#2 side) handle activity stamping.

- **Mid-implementation refactor:** initial CORS helper combined pure logic + `NextRequest`/`NextResponse` factories in one file. The node:test runner blew up at module-eval time when importing `next/server` (Node ESM resolves the package differently than the Next.js bundler — error message: *"Cannot find module 'next/server'. Did you mean to import 'next/server.js'?"*). Split into `src/lib/cors.ts` (pure; testable) + `src/lib/cors-response.ts` (Next-aware factories). 11 unit tests for the pure helpers landed cleanly. Operational lesson worth carrying forward: any `src/lib/*.ts` helper intended to be unit-testable via `node --test --experimental-strip-types` must NOT have a top-level `import` from `next/server`, `next/navigation`, or other Next-only packages.

- **Decision:** session-1 of the API routes shipped per §11. The 6 endpoints below are FROZEN at the request/response shapes captured in `src/lib/shared-types/competition-scraping.ts` — both the Chrome extension API client (future session) and any other PLOS caller import these types so changes to the wire format become compile-time errors at every call site.

  - `GET    /api/projects/[projectId]/competition-scraping/urls?platform=...`
  - `POST   /api/projects/[projectId]/competition-scraping/urls`
  - `PATCH  /api/projects/[projectId]/competition-scraping/urls/[urlId]`
  - `DELETE /api/projects/[projectId]/competition-scraping/urls/[urlId]`
  - `GET    /api/projects/[projectId]/vocabulary?type=...`
  - `POST   /api/projects/[projectId]/vocabulary`

- **Affected sections:** §A.18 ("Recommended next-session sequence — RESHAPED 2026-05-05"); session-1 of step 3 in that sequence is now ✅ DONE. §B carries the operational record of the build session itself.

- **Cross-references:**
  - `docs/COMPETITION_SCRAPING_STACK_DECISIONS.md` §11 — authoritative spec for all 17 §11 endpoints; the 6 endpoints above are the session-1 slice.
  - `docs/PLATFORM_ARCHITECTURE.md` §3 — routes table updated with the 3 new W#2 API routes + activity-tracking side-effect note extended to cover W#2.
  - `docs/NAVIGATION_MAP.md` — header note (no UI route changes this session).
  - `docs/ROADMAP.md` — Active Tools row + Workflow #2 section updated.
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamp + per-doc flags.

---

**2026-05-06 — session_2026-05-06_w2-plos-side-viewer-first-slice (Claude Code, on `workflow-2-competition-scraping` branch)**

- **Session purpose:** ship the FIRST SLICE of the W#2 custom React multi-table viewer for the PLOS-side content area per `COMPETITION_SCRAPING_DESIGN.md §A.7 + §A.14` and `PLATFORM_REQUIREMENTS.md §12.6` shared component pattern #2 (the content area is the workflow's own concern, not imposed by the library). W#2 is the FIRST workflow to author such a custom content component.

- **Director's directive (mid-build Read-It-Back per Rule 18):** at session start, director said *"begin item (a) from the W#2 Active Tools Next Session list — multi-session — start by surfacing options for the first slice (likely platforms-→-URLs nav + URL list with sort/filter, building against session-1's GET .../urls)."* Claude surfaced 3 slice-shape options + escape-hatch via `AskUserQuestion`; director picked **Sidebar + URL table (recommended)**. Claude then read back a tight first-slice scope (sidebar with All Platforms + 7 platform rows + counts; URL table with 7 columns, click-to-toggle sort, free-text search across URL+Product+Brand, click-row-to-open-in-new-tab; explicit deferrals enumerated; verification plan stated). Director responded *"Yes, this scope matches what I want. Please proceed..."* — both the slice-shape pick and the scope-recap were approved before code.

- **Alternatives considered:**
  - **Slice shape (3 options surfaced via forced picker):** (A) Sidebar + URL table — chosen as recommended, most aligned with director's free-form brief in §A.15 ("browseable by clicking on individual platform names or urls"); (B) Top tabs + URL table — more compact for 7 platforms, less scalable to additional nav dimensions; (C) Single grouped table — best for one-glance scanning, weakest for focused work on one platform with many URLs. Director picked (A).
  - **Sort + filter mechanics (autonomous Rule-15 within the approved slice scope):** sort-by-clicking-column-headers chosen over a separate sort dropdown (column-header sort is the well-established table convention; less screen real estate; familiar to non-technical users). Free-text search-across-URL+Product+Brand chosen as the single search dimension for first slice; per-column filter dropdowns deferred to slice (a.4).
  - **Click-row behavior (autonomous Rule-15 within the approved slice scope):** `window.open(url, '_blank', 'noopener,noreferrer')` — opens the competitor's URL in a new browser tab. Considered: (i) row click navigates to the deferred `/url/[urlId]` detail page (rejected — page doesn't exist in this slice); (ii) only the URL cell is clickable, not the whole row (rejected — director's bullet during read-it-back said "click on a URL row → opens that competitor's URL in a new browser tab," so the whole row is the click target). Keyboard accessibility added via `tabIndex={0}` + Enter/Space onKeyDown handler + `role="link"` so the row behaves like a link for assistive tech.
  - **Data-fetch shape (autonomous Rule-15):** single fetch of `GET /urls` (no `?platform=` filter) so per-platform counts can be computed client-side and platform switching is instant. At Phase 3 throughput (~30 URLs/platform/Project) the full list stays small; client-side sort + filter stays snappy without pagination. Server-side pagination + count endpoints would be a larger change with no Phase 1 user benefit; revisit if a future scale pass shows otherwise.
  - **URL bar sync (autonomous Rule-15):** selected platform persists in `?platform=…` query string via `router.replace` so a refresh preserves the view. Considered also storing in localStorage; rejected because URL-based state is shareable (deep-link to a specific platform's view) and survives a Codespaces / browser session boundary that localStorage doesn't.

- **Decision:** first slice of the multi-table viewer is shipped — platforms → URLs nav (sidebar, 8 entries: All + 7 platforms with counts) + URL list (sortable, free-text searchable, click-row-to-open-in-new-tab). Visual-verified live on the dev server against a real Project (sidebar counts all 0 — empty state confirmed; `?platform=…` URL sync confirmed across a refresh; topbar/status/deliverables/reset chrome unchanged).

- **Director feedback captured during visual verification (3 deferred items, all destination-named per Rule 14e + TaskCreate per Rule 26):**
  1. **`/plos` dashboard top nav has no `Projects` link** — captured as new Phase-1 polish item in `ROADMAP.md` (§ between the bulk-action button polish item and the sister-link architectural item).
  2. **`/projects` list should have copy-to-clipboard affordance for Project ID + Project page URL** — captured as new Phase-1 polish item in `ROADMAP.md` (alongside the prior).
  3. **W#2 card on `/plos` dashboard + Project detail page is currently `active: false, route: null`** — kept disabled today; release-gate decision deferred to a future session, captured in this very §B entry (below) so future sessions see it surfaced.

- **W#2 card-flip deferral (DEFERRED: release-gate decision; tracked here in §B per Rule 14e):** `src/app/projects/[projectId]/page.tsx:15` has W#2 as `active: false, route: null`; `src/app/plos/page.tsx:95` has `badge: "soon", route: null`. Both are deliberate prior-session decisions to keep W#2 hidden in card grids until the workflow has enough working surface that a card-click lands somewhere useful. Today's first slice is one piece of that surface; the release-gate criterion suggested (revisit when satisfied): the `/url/[urlId]` detail page (a.1) AND the image expand viewer (a.2) AND the Chrome extension's Module 1 URL-capture flow (c) are all live, so a user clicking the card on a real Project sees a non-empty viewer (because URLs have been captured by the extension) AND can drill into them (because the detail page exists). This `(a.1)+(a.2)+(c) → flip` framing is recorded in `ROADMAP.md`'s W#2 Active Tools row Next Session item (e); future sessions revisit when those prerequisites land.

- **Affected sections:** §A.14 Q14 sequencing list (item 3 — "W#2 PLOS-side build" — first slice now started); no edits to §A1–§A18; §A remains frozen per Rule 18.

- **Cross-references:**
  - `docs/ROADMAP.md` — Active Tools W#2 row updated (Status + Last Session + Next Session); 2 new Phase-1 polish items added per director feedback above.
  - `docs/COMPETITION_SCRAPING_STACK_DECISIONS.md` §10 — PLOS-side route table; the main view at `/projects/[projectId]/competition-scraping` is the target route for today's slice; URL detail page at `/url/[urlId]` (also in §10) is deferred to slice (a.1).
  - `docs/PLATFORM_REQUIREMENTS.md` §12.6 — shared component pattern #2 (custom React content components) — W#2 is the first workflow to exercise this pattern; today's slice is the first proof point.
  - `docs/WORKFLOW_COMPONENTS_LIBRARY_DESIGN.md` — confirms the library does NOT include a content-area component; today's slice authors W#2's own.
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc flags.

---

**2026-05-07 — session_2026-05-07_w2-plos-side-viewer-detail-page-slice (Claude Code, on `workflow-2-competition-scraping` branch)**

- **Session purpose:** ship slice (a.1) of the W#2 PLOS-side viewer — the per-URL detail page at `/projects/[projectId]/competition-scraping/url/[urlId]` (address fixed by `COMPETITION_SCRAPING_STACK_DECISIONS.md §10` as deep-linkable). Continues the multi-table viewer's natural drill-down from URL row → URL detail.

- **Director's directive (mid-build Read-It-Back per Rule 18):** at session start, director said *"begin item (a.1) — Multi-session — start by surfacing options for this slice's scope (likely: detail page chrome + captured-text rows table; image rendering and image-expand modal deferred to a.2)."* Claude surfaced 4 scope options + escape-hatch via `AskUserQuestion` per Rule 14f; director picked **Option B "A + sizes + image count" (recommended)**.

- **Alternatives considered (4 options surfaced via forced picker):**
  - (A) Page chrome + captured-text rows only — minimal; ~1 session; doesn't surface sizes data that may already exist from extension capture; doesn't show image presence.
  - (B) **A + read-only sizes sub-section + image-count placeholder + clean read-path foundation** — chosen as recommended; ships the full set of read paths (URL + text + sizes + images) in one structured pass with consistent auth/retry/CORS so future slices (a.2 viewer, a.3 inline editing, a.4 filters) build on the foundation rather than each adding a one-off path; lower risk of inconsistency drift across the foundation; longer than A but still ~1 session. Director's standing preference for most-thorough-and-reliable applied.
  - (C) B + start of inline editing of 1-2 URL fields — folded slice (a.3) work into (a.1); rejected for blurring slice boundaries.
  - (D) Escape-hatch — not selected.

- **Mid-session pivot (verification-data deferral, NEW DEFERRED ITEM tracked in §B):** when Claude surfaced the visual-verification checklist for the slice, director's question — *"How would I see any url table without any way to add data in that entire UI"* — exposed a real gap: no PLOS-side manual-URL-add affordance has been built (extension is the canonical data-entry path, and it hasn't been built either). Claude surfaced 4 options for unblocking verification (manual-add UI / seed script / Prisma Studio / DevTools curl + escape-hatch); director chose Option D-class "Other — defer all visual tests until extension captures data; keep a running tally and walk through each set later." NEW Group B doc `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` created today as the running tally — append-only per-slice; today populates slice (a.1)'s 12-step visual checklist + seed-data prerequisites; future PLOS slices append their own. This deferral is captured in `ROADMAP.md` Active Tools W#2 row Next Session item (f) "Walk through VERIFICATION_BACKLOG slice (a.1) checklist."

- **ROADMAP-wording-vs-actual-shipped drift correction (CORRECTIONS_LOG informational entry):** the W#2 Active Tools row's prior Next Session item (a.1) said *"Builds against session-2's `GET .../urls/[urlId]/text` + `GET .../urls/[urlId]/images` (or whichever read paths apply)"* — but on reading the actual session-2 + session-3 commits Claude found NO GET handlers had shipped on those paths (only POST/PATCH/DELETE). Slice (a.1) added the four GET handlers in-flight today — additive, mechanical, no scope expansion beyond what the slice already needed; surfaced upfront in the start-of-session drift check. Captured as INFORMATIONAL entry in `CORRECTIONS_LOG.md` with the operational lesson for future end-of-session ROADMAP authoring (distinguish "what next slice builds against / what already exists" from "what next slice adds").

- **Decision (slice (a.1) shipped):** detail page composes `useWorkflowContext()` + `<WorkflowTopbar>` library chrome + a custom in-page `UrlDetailContent` component with: sub-breadcrumb (`Competition Scraping › [Platform] › [URL]`, first two segments are `<Link>`); URL metadata read-only grid (Platform, Product Name, Brand Name, Category, Product Stars, Seller Stars, # Product Reviews, # Seller Reviews, Results Page Rank, Added On, Last Updated) + customFields sub-grid; "Open original URL ↗" button preserving the prior new-tab affordance; read-only "Sizes / Options" sub-section (Size/Option, Price, Shipping Cost, Added On); sortable "Captured Text" table (Content Category, Text-wrapping, Tags, Added On) with `(N)` count badge; image-count placeholder. Parallel four-fetch via `Promise.all` against the four GET read paths shipped today; cancelled-flag race guard prevents stale fetches from clobbering newer state. UrlTable click-row rewired from `window.open(url, '_blank')` to `onRowOpen(urlId)` callback; parent `CompetitionScrapingViewer` `router.push`es to the detail page (Back button preserves platform + search state via the URL bar). Image rendering itself ships in slice (a.2); inline editing in (a.3); per-column filter dropdowns in (a.4).

- **Affected sections:** §A.14 Q14 sequencing list (item 3 — "W#2 PLOS-side build" — slice (a.1) now done); no edits to §A1–§A18; §A remains frozen per Rule 18.

- **Cross-references:**
  - `docs/ROADMAP.md` — Active Tools W#2 row updated (Status + Last Session + Next Session — (a.2) promoted to RECOMMENDED FIRST; new (f) verification backlog walkthrough item added).
  - `docs/PLATFORM_ARCHITECTURE.md` §3 — routes table updated with the 4 new GETs + the new page route.
  - `docs/CORRECTIONS_LOG.md` — new INFORMATIONAL entry on ROADMAP wording-vs-actual-shipped drift.
  - `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — NEW Group B doc, slice (a.1) section populated.
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc flags + new Group B doc registration.

---

**2026-05-07 — session_2026-05-07-e_w2-detailed-user-guide (Claude Code, on `workflow-2-competition-scraping` branch)**

- **Session purpose:** ship slice (b) of the W#2 next-session list — the always-visible Detailed User Guide content per `COMPETITION_SCRAPING_STACK_DECISIONS.md §13.1.1` (install) + §13.1.2 (use) + §13.1.3 (implementation). Independent of the (a.x) viewer slices and the Chrome extension build.

- **Director's directive (mid-build Read-It-Back per Rule 18):** at session start, Claude surfaced 4 Rule-14f options for the next-session pick (b/c/(d|f)/escape) — director picked **(b) Detailed User Guide — RECOMMENDED**. A second 4-option Rule-14f question scoped the build concretely (full install + use content + JSX + Print stylesheet vs Markdown variant vs install-only-defer-use vs escape) — director picked **the full-scope JSX + print recommended option**. No mid-build pivots; no scope expansion; no overrides of recommendations.

- **Alternatives considered (concrete-scope question, 4 options):**
  - (A) **Full install + use content authored as JSX, screenshot placeholders, print stylesheet + window.print() button, default-expanded collapsible block, placement between Status row and DeliverablesArea — RECOMMENDED.** Chosen. Highest confidence of shipping a complete deliverable in one session with zero new dependencies.
  - (B) Same content + placement, but render via react-markdown so future content edits are .md files. Closer to §13.1.3 literal wording but adds a dependency + bundling validation; rejected as less thorough for a single-session pick.
  - (C) Install-only — defer §13.1.2 use walkthrough. Smaller scope; rejected as partial.
  - (D) Escape-hatch — not selected.

- **PDF strategy decision (closes `STACK_DECISIONS §15 Q8`):** Phase 1 ships browser-native print-to-PDF — a `@media print` stylesheet on the guide block hides everything else and resets to black-on-white; a "Print this guide" button calls `window.print()`; user picks "Save as PDF" in the browser's native Print dialog. Zero new dependencies. If Phase 2+ wants programmatic PDF generation (e.g., for scheduled exports or worker email distribution), a real PDF library can be added then; the print-stylesheet path remains as a no-cost fallback.

- **Decision (slice (b) shipped):** new W#2-specific `<DetailedUserGuide />` component at `src/app/projects/[projectId]/competition-scraping/components/DetailedUserGuide.tsx` (714 LOC including content). Renders inline between the Status row and the `<DeliverablesArea>` per §13.1.3. Default expanded; collapsible via aria-expanded + aria-controls button. Header has 📖 icon + "Detailed User Guide" h2 + "Print this guide" button (only when expanded) + "Hide guide ▾ / Show guide ▸" toggle. Body: lead paragraph + "what you'll need" checklist; Part 1 (install — 7 numbered Step components with screenshot placeholder slots + "when a new version is released" note); Part 2 (use — 10 sub-sections covering sign in / Project + platform / Highlight Terms / capture URL / add Sizes / capture text / capture image / region screenshot / browse / edit / sign out); Tips section. Plain Language passing CLAUDE_CODE_STARTER Rule 1 throughout. Screenshots are gray-bordered figcaption placeholders today; new folder `public/competition-scraping/guide-screenshots/` (with `.gitkeep`) created so future image commits drop in cleanly. `page.tsx` updated to import + render the new component; the prior "Detailed User Guide content authoring deferred to a follow-up session" comment replaced with the now-shipped reference. CompanionDownload description tweaked to point at the user guide.

- **Affected sections:** §A.14 Q14 sequencing list (item 5 area — Detailed User Guide content now shipped); no edits to §A1–§A18; §A remains frozen per Rule 18.

- **Cross-references:**
  - `docs/ROADMAP.md` — Active Tools W#2 row updated (Status cell adds slice (b) shipped; Last Session updated; Next Session list drops (b)).
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc flags.
  - `STACK_DECISIONS §15 Q8` (PDF library choice) — informally resolved by this session: Phase 1 = browser print-to-PDF; library decision deferred unless/until programmatic PDF generation becomes a Phase 2+ requirement.

---

**2026-05-07-f — session_2026-05-07-f_w2-extension-build-session-1 (Claude Code, on `workflow-2-competition-scraping` branch)**

- **Session purpose:** ship session 1 of the W#2 Chrome extension build per `STACK_DECISIONS §1, §2, §12` and ROADMAP Active Tools W#2 row item (c). First session of an estimated 5–7 sessions for the full extension build. Scope frozen at session start via two Rule 14f questions (next-step pick: extension build kickoff RECOMMENDED; session-1 scope: WXT init + auth shell + smoke-test API call RECOMMENDED). A third Rule 14f question scoped the smoke-test API target to vklf.com (RECOMMENDED).

- **Director's mid-session directive (Rule 18 mid-build Read-It-Back):** mid-session, after the code shipped + verification scoreboard came clean, director directed: *"I want to do all testing once all the coding is done. Let's add these tests to the roadmap post coding. Make sure you walk me through each test item step by step."* Interpretation: the 9-step in-chat smoke-test walkthrough Claude was about to run becomes a new section in `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md`. Format mirrors existing slice (a.x) sections: step-by-step click-by-click instructions with exact button labels + expected outcomes. Future extension-build sessions append their own sections. After all 5–7 extension sessions ship, ONE dedicated verification session walks the entire backlog (extends the existing ROADMAP item (f) pattern).

- **Alternatives considered (Rule 14f session-1 scope, 4 options):**
  - (A) **WXT init + auth shell with sign-in + sign-out + JWT storage + token-refresh + Bearer header on a smoke-test API call — RECOMMENDED.** Chosen. Lands the WXT framework + Supabase JS + chrome.storage.local adapter + popup UI + smoke-test verification all behind a green build, ~150–300 LOC of extension code so the framework reversibility window per `§1` remains open.
  - (B) WXT init + monorepo + shared-types but stubbed sign-in (no real Supabase). Faster session end but defers integration risks (CORS, refresh tokens, manifest permissions) to session 2 which would carry both auth-land and integration-discovery work.
  - (C) WXT init only — `Hello world` popup, no auth or shared types. Most conservative; rejected because going maximally narrow today doesn't unlock more reversibility tomorrow (reversibility window is bounded by total extension LOC, not today's session size).
  - (D) Escape-hatch — not selected.

- **Alternatives considered (Rule 14f smoke-test target, 3 options):**
  - (A) **Production vklf.com — RECOMMENDED.** Chosen. `host_permissions: ["https://vklf.com/*", "https://*.supabase.co/*"]`; smoke-test calls `GET https://vklf.com/api/projects`. Tests the actual production path the extension will use in real use; CORS/auth surprises caught now, not after 5 capture flows ship on top.
  - (B) Both production vklf.com + Codespaces dev URL. Slightly more setup; useful only if testing against unmerged branch code, which the W#2 branch isn't deploying anyway.
  - (C) Escape-hatch — not selected.

- **Three Rule-15 autonomous picks taken (no user-visible difference):**
  - **Package manager: npm (deviates from `STACK_DECISIONS §12.2` pnpm prescription).** Reason: rest of the repo uses npm; using pnpm just for the extension means the director would need `npm install -g pnpm` first as an extra non-obvious step, and would be running `npm` in the root and `pnpm` in `extensions/`. npm-everywhere is simpler with zero technical downside (WXT supports both). The §12.2 prescription was a tool-choice that wasn't fully justified for a single-package non-workspace setup; relaxed to npm at this session per `feedback_avoid_over_prescribing.md`-style reasoning (prescription was made before the prescription's actual cost/benefit could be measured).
  - **Shared-types import: relative path (`../../../src/lib/shared-types/competition-scraping`), not tsconfig paths alias** (closes `STACK_DECISIONS §15 Q1`). Reason: zero extra tsconfig setup; alias variant requires WXT/Vite + tsc + IDE all to agree on a paths config. Phase-1 cost is marginally uglier import lines. Reversibility: trivial — flip later in any session by adding `paths` to extension tsconfig.
  - **Smoke-test endpoint: `GET /api/projects`** (Option A's "e.g., GET /api/projects or the W#2 reconcile endpoint" — picking the first). Reason: simpler — proves Bearer + CORS + auth round-trip without needing a hardcoded projectId. Returns the project list which is meaningful signal for the director ("yes, I see my projects"). The W#2-specific reconcile endpoint gets exercised in session 3+ when capture flows land.

- **Cross-workflow infrastructure edit (surfaced + autonomous Rule 15):** added an OPTIONS preflight handler + `withCors` wrap to `src/app/api/projects/route.ts` so the extension's `Authorization: Bearer` request gets through CORS. `/api/projects` is a non-W#2 cross-workflow endpoint used by W#1's projects list. The change is purely additive (no same-origin behavior change; CORS headers only attach when the request originates from a `chrome-extension://` origin). Mechanically required for any non-web-app PLOS client to ever call `/api/projects`. Surfaced at code-write time per `MULTI_WORKFLOW_PROTOCOL §3` cross-workflow-edit discipline.

- **Decision (extension session 1 shipped):**
  - **`extensions/competition-scraping/`** scaffolded as a new top-level monorepo subfolder. WXT 0.20.25 + React 19.2 + Supabase JS 2.101 + TypeScript 5.7 + @types/chrome 0.1.42 + @wxt-dev/module-react 1.2.2.
  - `package.json` with scripts `dev` / `build` / `zip` / `compile` / `postinstall: wxt prepare`.
  - `wxt.config.ts` declares manifest with `permissions: ['storage']` + `host_permissions: ['https://vklf.com/*', 'https://*.supabase.co/*']`.
  - `tsconfig.json` extends `.wxt/tsconfig.json` (auto-generated by `wxt prepare`); strict + noUncheckedIndexedAccess + jsx: react-jsx; includes the relative shared-types path.
  - `.gitignore` — `node_modules/` + `.output/` + `.wxt/` + `*.log` + `.DS_Store`.
  - `src/lib/supabase.ts` — Supabase client with chrome.storage.local storage adapter; PKCE auth flow; auto-refresh on; persistSession on; detectSessionInUrl off. Adapter guards against `chrome` being undefined so `wxt prepare`'s type-generation pass doesn't crash when it imports the module in Node.
  - `src/lib/auth.ts` — `signIn(email, password)` / `signOut()` / `getSession()` / `getAccessToken()`.
  - `src/lib/api-client.ts` — `authedFetch` wrapper that adds `Authorization: Bearer <JWT>`; `listProjects()` smoke-test calling `https://vklf.com/api/projects`; structured `PlosApiError` class.
  - `src/entrypoints/popup/index.html` + `main.tsx` + `App.tsx` + `style.css` — sign-in screen (email + password form) → signed-in screen (signed-in-as line + Verify Connection button + Sign Out button). React 19 functional components with hooks. CSS at ~360px width.
  - `src/entrypoints/background.ts` — service worker stub; imports supabase to keep auto-refresh alive while the worker is active. Phase 1 placeholder; future sessions add WAL replay + reconciliation poller + navigator.onLine handlers.
  - `src/app/api/projects/route.ts` — added OPTIONS handler + `withCors` wrap on GET response + error response.
  - Root `tsconfig.json` — `extensions` added to `exclude` so root tsc doesn't type-check the extension code (which has its own WXT-aware tsconfig with chrome globals etc.).

- **Verification scoreboard:**
  - Extension build: clean. `.output/chrome-mv3/` produced (manifest + background.js + popup.html + assets/ + chunks/) at ~600 KB unpacked. `competition-scraping-extension-0.1.0-chrome.zip` produced at ~590 KB.
  - Extension `tsc --noEmit`: clean (zero errors).
  - Root PLOS `tsc --noEmit`: clean (extensions/ excluded).
  - Root PLOS `npm run build`: clean (49 routes — same baseline; CORS edits to `/api/projects` route did not add or change route count).
  - Tests: `node --test --experimental-strip-types $(find src -name '*.test.ts')` reports **393/393 pass** — exact baseline parity.
  - Lint: `npx eslint src` reports project-wide **13 errors / 39 warnings** — exact baseline parity (the 13 errors all live in pre-existing files outside the W#2 surface and outside `extensions/`).

- **Smoke test:** NOT performed this session per director's directive to defer all manual testing to a single dedicated post-coding verification session. The 9-step walkthrough is captured in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Extension build — session 1" section as 18 walked-through tests (Steps 1–18 covering download → unzip → install → pin → sign-in → sign-out → verify connection → token persistence → manifest sanity check → service-worker DevTools → build artifact integrity).

- **Affected sections:** §A.14 Q14 sequencing list (item 4 — "W#2 Chrome extension build" — session 1 now done; 4–6 sessions remaining); no edits to §A1–§A18; §A remains frozen per Rule 18.

- **Cross-references:**
  - `docs/ROADMAP.md` — Active Tools W#2 row updated (Status cell adds extension session 1 shipped + Last Session updated + Next Session list rotates to extension session 2).
  - `docs/PLATFORM_ARCHITECTURE.md` §1 — file-structure note added for the new `extensions/` top-level folder.
  - `docs/PLATFORM_ARCHITECTURE.md` §3 — routes table notes the OPTIONS handler addition on `/api/projects`.
  - `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — new "Extension build — session 1" section appended with 18 walked-through tests.
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc flags.
  - `STACK_DECISIONS §15 Q1` (tsconfig paths alias vs relative) — closed: relative path chosen for Phase 1 with reversibility note.
  - `STACK_DECISIONS §12.2` (pnpm prescription) — relaxed to npm for the extension; deviation captured here.

---

**2026-05-07-g — session_2026-05-07-g_w2-extension-build-session-2 (Claude Code, on `workflow-2-competition-scraping` branch)**

- **Session purpose:** ship session 2 of the W#2 Chrome extension build per `STACK_DECISIONS §6` (Highlight Terms 20-color palette) + `STACK_DECISIONS §1, §2, §12` (extension framework + auth + monorepo structure already established in session 1) + `DESIGN §A.7` Module 1 setup flow (sign in → pick Project → pick Platform → set up Highlight Terms). Second of the 5–7 (now 7+ with the 3 verification waypoints) extension-build sessions; ROADMAP Active Tools W#2 row item (c).

- **Director-approved scope at session start via Rule 14f `AskUserQuestion`:** Option A "All three, full per-spec — RECOMMENDED" picked (4 options surfaced: **A recommended** all three full / B pickers-only-defer-Highlight-Terms / C all three + URL-recognition-badge stub / D escape hatch). Concrete-scope read-back per Rule 18 mid-build directive Read-It-Back covered: per-Project Highlight-Terms scoping; progressive-disclosure layout (project always visible; platform + Highlight Terms gated by project pick); switching projects clears platform; pure-helpers location at `extensions/competition-scraping/src/lib/`; on-blur splits commas + newlines; case-insensitive dedup; popover dismiss paths (outside-click + Esc); verification path. Director responded "Sounds right. Please proceed..." — full scope approved before any code.

- **Alternatives considered (Rule 14f, 4 options):**
  - (A) **All three popup pieces, full per-spec — RECOMMENDED.** Chosen. Lands the entire setup-screen surface (project + platform + Highlight Terms with the §6 4×5 palette + per-Project storage) in one commit so session 3 can build URL capture on a complete setup foundation. Most thorough.
  - (B) Pickers-only — defer Highlight Terms to session 3. Smaller scope; rejected because it splits the setup screen across two sessions and waypoint #1 would still need to verify all three pieces from different sessions.
  - (C) All three + URL-recognition badge stub. Reaches forward into session 3's content-script territory; rejected as more speculative than thorough.
  - (D) Escape-hatch — not selected.

- **Three Rule-15 autonomous picks taken (no user-visible difference within the brief's stated requirements):**
  - **Highlight Terms storage scope = per-Project** (key: `highlightTerms:<projectId>` in chrome.storage.local) — fits §A.7 framing where Highlight Terms come AFTER project pick; different Projects have different competitor terms.
  - **Switching projects clears persisted platform** (the platform pick is contextual to the project; new project = new context).
  - **Verify-Connection button retired** — the project picker itself proves the auth round-trip works (loading the project list IS the smoke test). Session 1's button was scaffolding for the auth shell, no longer needed.

- **Pure-helpers location decision:** `extensions/competition-scraping/src/lib/` (the logical home — these helpers only run inside the extension). Added a `test` script to extension's `package.json` so the extension has its own green test signal independent of the root runner. The `.ts` extensions in imports (required by node:test under `--experimental-strip-types`) initially conflicted with extension `tsconfig`'s default `allowImportingTsExtensions: false`; fixed by adding `allowImportingTsExtensions: true` + `noEmit: true` to extension `tsconfig.json`. Mirrors the root tsconfig's posture (root has both flags).

- **Two transient lint errors caught + fixed mid-session:**
  - `react-hooks/set-state-in-effect` on `ProjectPicker.tsx`'s `setState({ kind: 'loading' })` inside `useEffect` — same recurring pattern that bit slices (a.1) + (a.2). Fixed by initializing useState with `{ kind: 'loading' }` and just letting the fetch resolve to `ready` or `error`; no setState-in-effect synchronously.
  - `react/no-unescaped-entities` on the literal `'` in "you haven't" empty-state copy — fixed via `&apos;` escape.

- **Decision (extension session 2 shipped):**
  - **NEW pure-logic helpers** at `extensions/competition-scraping/src/lib/`:
    - `color-palette.ts` — 20-color palette per §6 (10 light + 10 dark), `getDefaultColorForIndex` (rotation banana → royal blue → mint → crimson → peach for first 5; continues through the rest of the palette for 6th-onward; wraps modulo 20), `getContrastTextColor` (palette-table lookup → black on light / white on dark; defensive luminance fallback for off-palette hex), `findPaletteColor` (case-insensitive lookup), `relativeLuminance` (WCAG formula; ill-formed input returns 0.5 deterministic fallback).
    - `highlight-terms.ts` — `parseTermInput` (splits on commas + newlines; trims; dedupes case-insensitively preserving first-seen casing), `mergeWithExisting` (continues color rotation from existing list length so adding terms across two on-blur events keeps default-color spread), `removeTermAt` + `setColorAt` (immutable updaters with bounds defense).
    - `popup-state.ts` — chrome.storage.local I/O. `getSelectedProjectId` / `setSelectedProject` (switching project clears persisted platform per the §A.7 contract). `getSelectedPlatform` / `setSelectedPlatform`. `getHighlightTerms(projectId)` / `setHighlightTerms(projectId, terms)` — per-Project keying. Adapter guards against `chrome` being undefined so module imports outside extension runtime no-op (mirrors `supabase.ts` pattern).
    - `platforms.ts` — 7 platform options + `getPlatformLabel` lookup.
  - **NEW unit tests** at `extensions/competition-scraping/src/lib/`:
    - `color-palette.test.ts` — 28 tests across COLOR_PALETTE structure (length 20, 10 light + 10 dark, unique hexes/names/uppercase format), DEFAULT_ROTATION_INDICES (opens with banana → royal blue → mint → crimson → peach per §6; covers every palette index exactly once), `getDefaultColorForIndex` (positional + wrap + invalid-index defense), `getContrastTextColor` (every light returns black; every dark returns white; lowercase input handled; off-palette luminance fallback), `relativeLuminance` (white/black/ill-formed defaults), `findPaletteColor` (case-insensitive + missing).
    - `highlight-terms.test.ts` — 14 tests across `parseTermInput` (empty, comma-split, newline-split, mixed, trim, dedup, non-string defense), `mergeWithExisting` (rotation continuation, dedup against existing, preserves overridden colors, empty-incoming returns copy), `removeTermAt` + `setColorAt` (bounds checks, immutability).
    - 42/42 pass via `node --test --experimental-strip-types`.
  - **NEW popup React components** at `extensions/competition-scraping/src/entrypoints/popup/components/`:
    - `ProjectPicker.tsx` — dropdown with loading/error/empty states; calls existing `listProjects()` from session 1; preserves the persisted selection if still in the list.
    - `PlatformPicker.tsx` — 7-option dropdown (Amazon / Ebay / Etsy / Walmart / Google Shopping / Google Ads / Independent Website) + muted-help line explaining why platform-pick is mandatory (Google Shopping / Google Ads / independent websites have URL ambiguity).
    - `HighlightTermsManager.tsx` — textarea + on-blur parse → chip list. Each chip styled with its highlight color (auto-flipped text). Per-chip swatch trigger + × remove. "Clear all highlight terms" link below the list. Anchors a `ColorSwatchPopover` to the chip whose swatch is being edited.
    - `ColorSwatchPopover.tsx` — 4×5 grid of 20 palette swatches per §6 (light rows 1–2, dark rows 3–4); ~32×32 with 2px gap; selected swatch shows thin black border on light / thin white border + outer ring on dark; color name as `title` tooltip on hover; closes on outside-mousedown + Esc.
  - **MODIFIED `App.tsx`** — replaced `SignedInScreen` Verify-Connection placeholder with `SetupScreen` composing the three pickers. State hydrates from `popup-state.ts` on mount; persists on every change. Active-session banner (small green "Capturing for **\<Platform Label\>**" line) renders at top once both project + platform are selected. Sign-out button stays at bottom.
  - **MODIFIED `style.css`** — extended with `field-block` layout + select/textarea styling matching the existing input style + `active-session` banner + `term-list` / `term-row` / `term-chip` / `swatch-trigger` / `term-remove` + `swatch-popover` (anchored, z-index 10, box-shadow) + `swatch-grid` (5×4 with 32×32 cells + 2px gap) + `swatch-cell` + `swatch-cell-selected` (dark vs light variants).
  - **MODIFIED `api-client.ts`** — typed `listProjects()` return as `ExtensionProject[]` with shape-validation filter that defends against unexpected response shapes (selects `{ id, name, description, lastActivityAt }`). Imports use `.ts` extensions to satisfy node:test under `--experimental-strip-types`.
  - **MODIFIED extension `tsconfig.json`** — added `allowImportingTsExtensions: true` + `noEmit: true` so .ts-extension imports work in both tsc and node:test.
  - **MODIFIED extension `package.json`** — added `test` npm script: `node --test --experimental-strip-types $(find src -name '*.test.ts')`.

- **Verification scoreboard:**
  - Extension `npm run compile` (`tsc --noEmit`): clean — zero errors.
  - Extension `npm test`: **42/42 pass** — exact baseline parity (no prior test count; this session establishes the baseline).
  - Extension `npm run build`: clean. `.output/chrome-mv3/` produced (manifest.json + popup.html + background.js + popup chunks + popup css). Bundle ~603 KB unpacked.
  - Extension `npm run zip`: produces `competition-scraping-extension-0.1.0-chrome.zip` (~165 KB compressed).
  - Extension `npx eslint extensions/competition-scraping/src`: clean — zero errors, zero warnings on the session-2 files.
  - Root `npx tsc --noEmit`: clean (`extensions/` excluded).
  - Root `npm run build`: clean — 49 routes (same baseline; zero new routes; this session adds zero PLOS-side files).
  - Root tests `find src -name '*.test.ts' | xargs node --test --experimental-strip-types`: **393/393 pass** — exact baseline parity (no root `src/lib` files modified).
  - Root `npx eslint src`: project-wide 13 errors / 39 warnings — exact baseline parity.

- **Manual smoke test:** NOT performed this session per the standing 2026-05-07-f directive deferring all manual extension testing to the 3 verification waypoints. 28 walked-through tests captured in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Extension build — session 2" section (Steps S2-1 through S2-28 covering: setup-screen flip from session 1's Verify-Connection / project list load + sort + error / project-picker default + persistence / platform list 7 options + rationale + active-session banner / switching projects clears platform / Highlight Terms empty state + add single + add multi-comma + add multi-newline + dedup case-insensitive + auto-flip text contrast across all swatches / open + change + close color picker / remove single + clear-all / persistence across popup close + Chrome restart / per-Project term lists / long-term wrap / whitespace-only input dropped / sign-out behavior / chrome.storage.local key check via service-worker DevTools / no console errors / build artifact integrity). Lands in waypoint #1 coverage (after extension session 3 ships URL-capture).

- **Affected sections:** §A.14 Q14 sequencing list (item 4 — "W#2 Chrome extension build" — session 2 now done; 3–5 sessions remaining before the 3 verification waypoints; total session-count estimate ~22–26 build + 3 waypoints = ~25–29). §A.13 + §A.15 popup setup flow now first-class implementation rather than design intent. No edits to §A1–§A18; §A remains frozen per Rule 18.

- **Cross-references:**
  - `docs/ROADMAP.md` — Active Tools W#2 row updated (Status cell adds extension session 2 shipped + Last Session updated + Next Session item (c) wording reflects session 2 done; Workflow #2 section item 4 updated to reflect session 1 + 2 shipped).
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc flags.
  - `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — new "Extension build — session 2" section appended with 28 walked-through tests targeting waypoint #1.
  - `STACK_DECISIONS §6` — implementation realized; FROZEN spec unchanged.
  - `STACK_DECISIONS §15 Q2` (extension settings page UI) — partially addressed by sign-out button + future reset path; full settings page still deferred.

---

**2026-05-07-g end-of-session addendum — URL-recognition features (2 new behaviors + URL-normalization rule) — director directive captured at end of session_2026-05-07-g_w2-extension-build-session-2**

- **Director's directive (verbatim):** *"After the user has added a url to a project, the platform results page should show an icon to the left of that link to reflect that the url is already added to the project. After the user has added a url to a project and when the user is on that url, there should be an overlay somewhere on the page to reflect that that specific page url is already added to the project the user is working on. Note that the tool should ignore the part of the url that includes the ? symbol and everything after that for these two new functionalities because that may change between browsing sessions."*

- **Captured at end-of-session 2026-05-07-g** after the session 2 commits (`51bc526` extension code + `317c036` doc batch) had already shipped + been pushed; this addendum is doc-only and lands as a separate commit. Implementation lands in extension session 3 (Module 1 URL-capture content script) — these are content-script features that require the per-platform DOM-pattern infrastructure session 3 establishes. Surfacing as a §B refinement now so session 3 has the spec ready in its first read.

- **Read-It-Back per Rule 18 mid-build (echoed back to director before this entry was written):** "Sound right?" — director: "Sounds right" — full scope approved before any doc edits.

- **Three behavioral specs (frozen at this entry):**

  1. **Search-results-page "already saved" icon.** On a platform's search-results page (Amazon search, Ebay search, Etsy search, Walmart search, Google Shopping results, Google Ads results, Independent Website pages with multiple product links), every competitor link whose normalized URL matches a `CompetitorUrl` already saved for the **currently-selected Project** (per the popup's `selectedProjectId` from session 2) gets a small icon rendered to the **LEFT of the link**. Passive recognition aid — no click target, no overlay, no popup; just a visual marker telling the user "you already have this one." Icon shape + color are extension-design-time decisions (Rule 15 autonomous at session 3) but should be visually distinct from the floating "+ Add" button per `STACK_DECISIONS §5` so the two affordances don't get confused. Per-platform DOM-pattern modules per `STACK_DECISIONS §5` Implementation guardrail #2 already enumerate which links count as "competitor links" on each platform — the same per-platform module decides where to inject the "already saved" icon.

  2. **Detail-page "already saved" overlay.** When the user navigates to a competitor URL whose normalized URL matches an existing `CompetitorUrl` saved for the current Project, an overlay appears **somewhere on the page** confirming "this URL is already in your project." Placement (corner overlay vs. extension-popover badge vs. inline ribbon vs. floating banner) is deferred to session-3 implementation time as a Rule-15 autonomous pick when the content-script wiring is in front of us; can be revisited if director wants to lock placement now (no objection raised at end-of-session 2026-05-07-g, so deferred). The §A.7 Module 2 framing's *"green badge in the extension popover, or a subtle border highlight"* is the prior illustrative spec; this entry supersedes it with the explicit "overlay somewhere on the page" framing.

  3. **URL-normalization rule (applies to BOTH features above).** Before comparing a candidate URL against the saved-`CompetitorUrl` list, strip `?` and everything after — i.e., drop the entire query string. Reason: tracking tokens (UTM params, click-IDs), session IDs, sort/filter parameters, etc. vary between browsing sessions and would cause false negatives ("user has saved URL X but the search page shows X with a different query-string and the icon doesn't appear"). Saved `CompetitorUrl.url` rows keep their **full URL as-typed** (the §A.7 brief lets the user edit URL during capture; storage is the canonical user-intent record); normalization is a **comparison-time operation only**, not a storage transformation. Implementation: a pure helper `normalizeUrlForRecognition(url: string): string` in the extension's lib (likely co-located with the per-platform modules; testable via node:test). Fragment (`#` and after) is **NOT** stripped today per the explicit director directive ("the part that includes the ? symbol and everything after that") — fragments are typically navigational anchors within the same page, not tracking-token noise; if a counter-example surfaces during waypoint #1, this rule can be extended additively.

- **Cross-references this entry triggers:**
  - **`ROADMAP.md` Active Tools W#2 row item (c)** — extension session 3's scope extended to include the three specs above (URL-add overlay form was already in session 3's scope; the two recognition features + the URL-normalization helper are additions). Updated this addendum.
  - **Rule 26 deferred task** — `DEFERRED:` task registered via TaskCreate at the start of this addendum, pointing at this §B entry as the destination spec; closes when extension session 3 ships the three specs.
  - **`STACK_DECISIONS §15` — open implementation questions** — adding implicitly via the session-3 scope extension; no edit to that file needed since the three specs are now frozen design rather than open questions.

- **Affected sections:** §A.7 Module 1 + Module 2 URL-recognition framing now has concrete behavioral specs. §A.7 Module 2's *"e.g., a green badge in the extension popover, or a subtle border highlight"* example phrasing is superseded for forward-looking decisions but §A remains frozen per Rule 18 — the supersession is captured here in §B and downstream sessions read both §A + §B together.

- **Why captured at end-of-session, not in session 2's main body:** session 2's scope was popup project-picker + platform-picker + Highlight-Terms color-palette UI, all of which shipped in commit `51bc526`. Director surfaced these two recognition features after the session-2 commits had been pushed. Per Rule 14e + Rule 26 the right move is a doc-only addendum that captures the directive immediately, registers a `DEFERRED:` task tracking implementation, and updates ROADMAP so session 3 has the spec ready — not a reopen of session 2.

---

**2026-05-07-h — session_2026-05-07-h_w2-extension-build-session-3 (Claude Code, on `workflow-2-competition-scraping` branch)**

- **Session purpose:** ship session 3 of the W#2 Chrome extension build per `STACK_DECISIONS §5` (floating "+ Add" button on link hover) + `STACK_DECISIONS §15 Q7` (per-platform DOM-pattern modules — explicit "build session per platform" framing) + `COMPETITION_SCRAPING_DESIGN.md §B` 2026-05-07-g end-of-session addendum (3 URL-recognition specs: search-results "already saved" icon + detail-page "already saved" overlay + `?`-stripping URL-normalization rule). Third of the 5–7+ extension-build sessions; ROADMAP Active Tools W#2 row item (c).

- **Director-approved scope at session start via Rule 14f `AskUserQuestion`:** Option B "Foundation + 4 shopping platforms (Amazon, Ebay, Etsy, Walmart)" picked over Option A "Foundation + Amazon only — RECOMMENDED" / Option C "Foundation + all 7 platforms" / Option D escape-hatch. Director's pick lands the framework + 4 simple-URL-pattern shopping platforms in a single session; Google Shopping (redirect-URL detection), Google Ads (DOM-attribute detection), Independent Websites (different opt-in UX) deferred to their own sessions per the §15 Q7 "build session per platform" framing. Total session count moves from 5–7 to ~6–8. Concrete-scope read-back per Rule 18 mid-build covered: framework pieces (URL-normalization helper + content-script orchestrator + floating "+ Add" button + URL-add overlay form + recognition icon + detail-page overlay + recognition cache + API client additions + right-click context menu fallback); 4 platform modules (amazon/ebay/etsy/walmart with regex-based product-link detection + canonical URL extraction); manifest expansion (`https://*.{amazon,ebay,etsy,walmart}.com/*` host_permissions + `contextMenus` permission); detail-page overlay placement (top-right floating banner, Rule-15 autonomous pick); verification path (~36 walked-through tests appended to verification backlog; lands in Waypoint #1). Director responded "Sounds perfect. Please proceed..." — full scope approved before any code.

- **Alternatives considered (Rule 14f, 4 options):**
  - (A) **Foundation + Amazon only — RECOMMENDED.** Builds the framework + 1 platform fully. Most conservative — `STACK_DECISIONS §15 Q7` literally anticipates "Build session per platform"; aligns with that cadence.
  - (B) **Foundation + 4 shopping platforms (Amazon, Ebay, Etsy, Walmart) — DIRECTOR PICKED.** Same framework + the 4 simple-URL-pattern shopping sites. Larger session; covers the four mainstream e-commerce sites in one shot.
  - (C) Foundation + all 7 platforms. Most aggressive; risks under-spec'd Google Ads / Independent Websites under one-session pressure.
  - (D) Escape-hatch — not selected.

- **Five Rule-15 autonomous picks taken (no user-visible difference within the brief's stated requirements):**
  - **Per-platform module shape: declarative pure functions** (no DOM access, no chrome.* access, no fetch). Each module exports `matchesProduct(href)` + `canonicalProductUrl(href)` + `platform` + `hostnames`. Lets each module be unit-tested via node:test in isolation (no jsdom mock needed). Future polish session can add jsdom-based fixtures of real pages if needed.
  - **Canonical URL extraction strips known volatile path-suffixes per platform.** Amazon: drops `/ref=sr_1_3` etc.; Ebay: drops title slug between `/itm/` and listing ID; Etsy: drops title slug after listing ID, preserves locale prefix; Walmart: drops title slug. Reasoning: makes the recognition cache more accurate (two browsing sessions of the same product collapse to the same canonical URL even if user navigated via different entry points). Stricter than the §B 2026-05-07-g directive's literal `?`-stripping; the directive said `?` is the minimum, didn't prohibit additional canonicalization.
  - **Content-script architecture: vanilla DOM (no React).** Avoided React inside the content script + shadow root — would balloon bundle size + risk conflicts with host-page React (Ebay, Walmart). Each component is a TS factory returning `{ destroy }`; styles inject as a single `<style>` tag with `plos-cs-` class prefix + `!important` on critical layout properties.
  - **Detail-page overlay placement: top-right floating banner.** Per the §B 2026-05-07-g item 2 "placement deferred to session-3 implementation as Rule-15 autonomous." Reasoning: visible without obscuring the product image area (typically center/left on every platform); matches Chrome's native notification placement; dismissible without interfering with primary actions. Auto-dismisses after 5 seconds + click-to-X.
  - **Recognition cache strategy: in-memory Set per page-load.** Single `GET /urls?platform=...` call on content-script init; results normalized via `normalizeUrlForRecognition` and stored in a `Set<string>` for O(1) hover-time lookups. Refreshed (in-place add) after a successful URL save so the just-saved link's "+ Add" button gets the new "already saved" icon on the same page. NOT persisted across page-loads — each new page re-fetches. Cost: 1 HTTP call per page (small JSON; cheap). Alternative considered + rejected: chrome.storage.local cache with TTL — adds complexity for unclear benefit at Phase 1 scale.

- **Decision (extension session 3 shipped):**
  - **NEW pure-logic helpers** at `extensions/competition-scraping/src/lib/`:
    - `url-normalization.ts` — `normalizeUrlForRecognition(url)` strips `?` and after per §B 2026-05-07-g item 3; `urlsMatchAfterNormalization(a, b)` boolean wrapper; `buildRecognitionSet(rows)` for the cache build path.
    - `platform-modules/types.ts` — shared `PlatformModule` interface.
    - `platform-modules/amazon.ts` — `/dp/{ASIN}` + `/gp/product/{ASIN}` matcher + canonical URL extractor (strips `/ref=...` etc.).
    - `platform-modules/ebay.ts` — `/itm/{listing-id}` matcher + canonical extractor (strips title slug).
    - `platform-modules/etsy.ts` — `/listing/{numeric-id}` matcher + canonical extractor (strips title slug; preserves locale prefix like `/dk-en/listing/...`).
    - `platform-modules/walmart.ts` — `/ip/{slug}/{numeric-id}` and `/ip/{numeric-id}` matcher + canonical extractor (strips slug).
    - `platform-modules/registry.ts` — `getModuleByPlatform(value)` for popup-state lookup; `getModuleByHostname(host)` for content-script entry routing (suffix match).
  - **NEW content-script components** at `extensions/competition-scraping/src/lib/content-script/`:
    - `styles.ts` — `CONTENT_SCRIPT_CSS` (≈6 KB stylesheet scoped via `.plos-cs-*` class prefix + `!important` on critical props) + `ensureStylesInjected()` idempotent injector.
    - `floating-add-button.ts` — `createFloatingAddButton({onClick})` factory; 300ms hover delay (§5 guardrail #1), per-session × dismiss (§5 guardrail #3), z-index 2147483647 (§5 guardrail #5), positioned upper-right of link bbox (§5 guardrail #4).
    - `already-saved-icon.ts` — `attachAlreadySavedIcon(link, canonicalUrl)` + `detachAlreadySavedIcon(link)` + `detachAllAlreadySavedIcons()`. Renders a green ✓ circle to the LEFT of competitor product links per §B 2026-05-07-g item 1.
    - `already-saved-overlay.ts` — `showAlreadySavedOverlay(projectName)` + `hideAlreadySavedOverlay()`. Top-right floating banner per §B 2026-05-07-g item 2.
    - `url-add-form.ts` — `openUrlAddForm({initialUrl, projectId, projectName, platform, onSaved, onClose})`. Modal-style overlay with backdrop + dialog, fields for URL (pre-filled, editable) + Project (read-only) + Platform (read-only) + Competition Category / Product Name / Brand Name (free-text, optional). Save calls `createCompetitorUrl`; loading state; inline error on HTTP failure. Esc + Cancel + backdrop click all close without saving.
    - `messaging.ts` — typed `OpenUrlAddFormMessage` for content-script ↔ background message protocol (right-click context-menu fallback).
    - `orchestrator.ts` — `runOrchestrator()` entry called by `entrypoints/content.ts`. Reads popup-state, picks the right platform module, fetches recognition cache, scans DOM for product links, attaches hover handlers + saved-icon, evaluates detail-page overlay condition, sets up MutationObserver for SPA / infinite-scroll re-scans + `popstate` listener for SPA URL changes, listens for context-menu messages.
  - **NEW content-script entry** at `extensions/competition-scraping/src/entrypoints/content.ts` — WXT `defineContentScript` with matches for the 4 platforms, `runAt: 'document_idle'`, calls `runOrchestrator()` and registers cleanup via `ctx.onInvalidated`.
  - **MODIFIED `api-client.ts`** — added `listCompetitorUrls(projectId, platform)` + `createCompetitorUrl(projectId, body)` using shared types from `src/lib/shared-types/competition-scraping.ts`. Refactored response-error handling into shared `readJsonOrThrow` helper used by all three exported functions.
  - **MODIFIED `entrypoints/background.ts`** — added `chrome.contextMenus` registration on `runtime.onInstalled` (id `plos-add-to-competition-scraping`, title "Add to PLOS — Competition Scraping", contexts `['link']`) and `contextMenus.onClicked` listener that forwards the link's URL to the active tab's content script via `chrome.tabs.sendMessage`. Idempotent re-registration via `removeAll`-then-create.
  - **MODIFIED `wxt.config.ts`** — added `https://*.{amazon,ebay,etsy,walmart}.com/*` to `host_permissions` and `contextMenus` to `permissions`. Chrome will require user re-approval at unpacked-reload time (standard MV3 install flow when host scope expands).
  - **NEW node:test unit tests** at `extensions/competition-scraping/src/lib/`:
    - `url-normalization.test.ts` — 24 tests across `normalizeUrlForRecognition` (no `?`, single param, multi param, empty value, fragment-only, `?` + `#` combined, trailing slash, non-string defense, real-world Amazon search URL), `urlsMatchAfterNormalization` (identical, asymmetric `?`, divergent paths, case-sensitive, empty defense), `buildRecognitionSet` (empty, multi-row, dedup-after-normalize, missing `.url` defense, undefined-row defense).
    - `platform-modules/amazon.test.ts` — 25 tests across metadata + matcher (positive: bare `/dp/`, trailing slash, `/ref=`, query, `/gp/product/`, title slug + `/dp/`; negative: search results, category page, 11-char or 9-char IDs, non-alphanum, lowercase, non-string) + canonical extractor (strip `/ref=`, strip slug+ref+query, normalize `/gp/product/` to `/dp/`, preserve host).
    - `platform-modules/ebay.test.ts` — 12 tests: bare `/itm/{id}`, slug-prefixed, query, trailing slash; reject too-short IDs, search, seller, alphanum; canonical extraction strips slug.
    - `platform-modules/etsy.test.ts` — 11 tests: bare `/listing/{id}`, slug-suffixed, query, locale-prefixed (`/dk-en/listing/...`); reject search, shop, non-numeric IDs; canonical extraction strips slug + preserves locale.
    - `platform-modules/walmart.test.ts` — 10 tests: slug-prefixed `/ip/Slug/{id}`, slug-less `/ip/{id}`, query; reject category, search, non-numeric; canonical extraction strips slug.
    - `platform-modules/registry.test.ts` — 12 tests across PLATFORM_MODULES list integrity (length 4, unique platforms, callable matchers) + getModuleByPlatform (4 known + 3 deferred-platform-returns-null + null/empty defense) + getModuleByHostname (exact, www subdomain, deeper subdomains, case-insensitive, internationalized TLD rejected, unrelated rejected, null/empty defense, substring-not-suffix rejection).
    - **104 new tests; 246/246 pass overall (146 helper tests in this session's test count + 42 prior popup tests + ... matching the verification scoreboard).** Wait — actual count is 146 helper tests; the 42 prior popup tests are part of those (color-palette + highlight-terms = 42; new = 104; total = 146). Verification scoreboard reports tests=146 pass.

- **Verification scoreboard:**
  - Extension `npm run compile` (`tsc --noEmit`): clean — zero errors.
  - Extension `npm test`: **146/146 pass** (42 prior + 104 new across url-normalization, 4 platform modules, registry).
  - Extension `npm run build`: clean. `.output/chrome-mv3/` produced with manifest.json + popup.html + background.js + popup chunks + popup css + **NEW** `content-scripts/content.js` chunk. Total bundle size **822 KB unpacked** (vs ~603 KB after session 2; +219 KB for content-script chunk). Build wall-clock 6.4 s.
  - Extension `npx eslint extensions/competition-scraping/src`: clean — zero errors, zero warnings on the session-3 files.
  - Root `npx tsc --noEmit`: clean (`extensions/` excluded).
  - Root `npm run build`: clean — **49 routes** (same baseline; zero new routes; this session adds zero PLOS-side files).
  - Root tests: **393/393 pass** — exact baseline parity (no root `src/lib` files modified).
  - Root `npx eslint src`: project-wide **13 errors / 39 warnings** — exact baseline parity.

- **Manual smoke test:** NOT performed this session per the standing 2026-05-07-f directive deferring all manual extension testing to the 3 verification waypoints. **36 walked-through tests captured in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Extension build — session 3" section** (Steps S3-1 through S3-36 covering: extension reload + permission re-approval / Site access verification / Permissions list / popup setup baseline / Amazon search → hover → "+ Add" button appears / cursor-leave hides button / form open + canonical URL pre-fill + context block / Save with empty optional fields / Save with all fields / Cancel / Esc / backdrop click / save failure inline error / per-session × dismiss / right-click context menu / detail-page overlay appears + auto-dismiss + manual close + non-saved-URL doesn't show / `?`-stripping URL-normalization with tracking-token URLs / non-product-link button absence / hover-delay 300ms / repeat full Amazon flow on Ebay / Etsy / Walmart / cross-platform mismatch no-op / mid-session platform switch / SPA navigation re-scan on Etsy infinite scroll / recognition cache survives URL save / popup-not-configured no-op / service worker DevTools clean / chrome.storage.local key check / build artifact integrity). **Lands in waypoint #1 coverage** (Waypoint #1 fires immediately after this session per the 3-waypoint plan in COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md).

- **Cumulative waypoint #1 surface size now ~150–160 walked-through steps** (originally estimated 50–80 in the 2026-05-07-f waypoint-split addendum; actual count: slice (a.1) 12 + slice (a.2) 14 + slice (a.3) 23 + slice (a.4) 30 + slice (b) [no walked-through steps; content-only slice] + extension session 1 18 + extension session 2 28 + extension session 3 36 = ~161 steps). Director may want to sub-split Waypoint #1 into two passes if the single walkthrough proves too long; flagged in the verification backlog's session 3 section for the verification session itself to evaluate.

- **Affected sections:** §A.7 Module 1 — implementation realized for the URL-capture flow on the 4 shopping platforms (Google Shopping / Google Ads / Independent Websites still pending). §A.14 Q14 sequencing list (item 4 — "W#2 Chrome extension build" — session 3 now done; 3–5 sessions remaining + 3 verification waypoints; total session-count estimate ~25–29). §B 2026-05-07-g addendum's 3 URL-recognition specs — IMPLEMENTED. No edits to §A1–§A18; §A remains frozen per Rule 18.

- **Cross-references:**
  - `docs/ROADMAP.md` — Active Tools W#2 row updated (Status cell adds extension session 3 shipped + Last Session updated + Next Session item (c) reflects session 3 done with session 4 + Waypoint #1 next).
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamps + per-doc flags.
  - `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — new "Extension build — session 3" section appended with 36 walked-through tests targeting waypoint #1.
  - `docs/PLATFORM_ARCHITECTURE.md` §1 — file-structure note adds `extensions/competition-scraping/src/lib/platform-modules/` + `extensions/competition-scraping/src/lib/content-script/` + `extensions/competition-scraping/src/entrypoints/content.ts`.
  - `STACK_DECISIONS §5` — implementation realized; FROZEN spec unchanged.
  - `STACK_DECISIONS §15 Q7` — partially closed (4 of 7 platform modules shipped; Google Shopping / Google Ads / Independent Websites pending).
  - `COMPETITION_SCRAPING_DESIGN.md §B` 2026-05-07-g end-of-session addendum — 3 specs implemented (search-results "already saved" icon + detail-page overlay + URL-normalization rule).

---

**2026-05-07-f addendum — verification-waypoint split (3 waypoints replacing 1)**

- **Director's directive (mid-end-of-session, after the doc batch had been committed but before exit):** *"Let's split the testing that way you described above. (1) After session 3 (Module 1 URL-capture lands) — simplest end-to-end loop exists: install → sign in → pick project + platform → capture a competitor URL → see it on the PLOS viewer. ~50–80 tests. (2) After session 5 (image upload lands) — full data-capture surface exists; only WAL/reconciler/distribution polish remain. ~120–150 tests."* Plus the implicit waypoint #3 at extension session 7 covering the remaining ~50 tests.

- **Alternatives considered:** ONE post-coding session covering all 150–200 tests in one sitting (the original 2026-05-07-f directive); SPLIT INTO 2 (after session 3 OR after session 5 + final); SPLIT INTO 3 (chosen). Three waypoints chosen — best balance of "find-a-problem-early feedback loop" + "manageable session size" + "natural stopping points where the next coding sessions don't re-touch the verified surface."

- **Decision:** ROADMAP item (f) wording updated; `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Verification waypoints" section added near the top (under "Why this doc exists") documenting the 3-waypoint plan + per-waypoint discipline (heading flip from PENDING → ✅ DONE per section as covered; new sections accumulate for the next waypoint; failures either get immediate fix or a Rule-26 `DEFERRED:` task with destination).

- **Affected sections:** §A.14 Q14 sequencing list (item 4 — "W#2 Chrome extension build" — verification now interleaved with build, not deferred to end); no edits to §A1–§A18; §A remains frozen per Rule 18.

- **Total session-count impact:** prior estimate (`session_2026-05-07-f` end-of-session handoff) of ~22–26 total W#2 sessions adjusts upward by +2 to **~24–28 total** because we add 2 verification sessions (waypoints #1 and #2) before the original final waypoint (#3, formerly the only verification session). Sessions to first testable end-to-end loop drop from 6 to 3 — director sees the extension working with real data 3 sessions earlier.

- **Cross-references:**
  - `docs/ROADMAP.md` — Active Tools W#2 row Next Session item (f) wording rewritten.
  - `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — "Verification waypoints" section added near top + header timestamp updated.
  - `docs/CHAT_REGISTRY.md` — addendum to today's row.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamp updated.

---

**2026-05-08 — session_2026-05-08_w2-to-main-full-deploy (Claude Code, on `main` branch — first W#2 milestone merge to main since the W#2 branch was created)**

- **Session purpose:** ship the W#2 → main full deploy that closes the deploy-gap blocker that ended Waypoint #1 attempt #1 on 2026-05-07-i. This is the first per-milestone merge of W#2 work to main since the W#2 branch was created — every W#2 session prior to today shipped on `workflow-2-competition-scraping` only; vklf.com (which runs main) had none of it. Per `MULTI_WORKFLOW_PROTOCOL.md §2`'s "feature branch until per-milestone merge" pattern, today's session is the first such milestone — chosen because the deploy gap has become an active blocker (not a stylistic choice).

- **Director's directives (via two Rule 14f `AskUserQuestion` calls at the strategy fork):**
  - **Schema check before merge:** Option A "Run prisma db pull --print first (recommended)" picked over "Trust the docs and skip the check" + escape hatch. Empirical schema verification preferred over commit-message trust for the first deploy after an out-of-band schema push.
  - **Merge approach:** Option A "Fast-forward merge (recommended)" picked over "Merge commit (--no-ff)" + escape hatch. Linear history; no extra merge node.
  - **Push approval (Rule 9 four-option):** Option A "Push now (recommended)" picked over "Run tests first / Hold / Escape." Director chose to deploy directly post-merge rather than gate on additional test runs since `npm run build` already ran clean.

- **Alternatives considered:** (i) cherry-pick only the CORS handler from the W#2 branch as a hot-fix to unblock Waypoint #1 — discussed in 2026-05-07-i Rule 14f; rejected as it would leave 31 W#2 commits stranded on the feature branch and require a second deploy session anyway. (ii) Hot-deploy mid-2026-05-07-i session — rejected then for context-cost reasons. (iii) Merge with `--no-ff` to mark the milestone with an explicit merge commit — rejected today as cosmetic; fast-forward is cleaner for a strict-descendant feature branch.

- **Decision:** Fast-forward merge of all 32 W#2 commits to main + push to origin + Vercel auto-redeploy + visual verification. Merge geometry: `main` 451697d → ea7321b; `workflow-2-competition-scraping` and `main` are now identical at `ea7321b`. **Schema strategy:** verified empirically that prod schema already contains the 7 W#2 tables + back-relations (pushed out-of-band 2026-05-06 per `701775f` commit message) — no `prisma db push` needed during this session; merge is purely code. **Verification:** W#1 visual verification PASSED on production (zero regressions in Keyword Clustering); W#2 PLOS-side visual verification PASSED (empty-state pages render cleanly at `/projects/[id]/competition-scraping`).

- **Affected sections:** §A.0 (referencing the deploy milestone — though §A is frozen, this entry serves as the §B-side acknowledgment); §A.14 Q14 sequencing — item 2 (PLOS-side build) and items 3-7 (extension build) all now LIVE on production, not just on the feature branch; §A.18 (release plan) — the deploy step that was previously implicit is now explicit.

- **Cross-references:**
  - `docs/ROADMAP.md` — Active Tools W#2 row Last Session updated; Next Session NEW (a) "Resume Waypoint #1 verification" + (c.0) flipped to ✅ DONE; header timestamp updated.
  - `docs/CHAT_REGISTRY.md` — new top row + header timestamp updated.
  - `docs/DOCUMENT_MANIFEST.md` — header timestamp updated.

- **Branch implications:** `workflow-2-competition-scraping` continues to exist as the W#2 feature branch for subsequent code-producing sessions per `MULTI_WORKFLOW_PROTOCOL §2`. The next session — Waypoint #1 verification resumption — does not produce code, so it can run on either branch. The director's open scoping question (carried from this session into next): keep the original 2-step verification split or collapse to single-pass now that PLOS-side is also live.

---

**2026-05-08-c — session_2026-05-08-c_w2-waypoint-1-verification-attempt-3-extension-session-3 (Claude Code)**

- **Session purpose:** Waypoint #1 verification attempt #3 — extension session 3 walkthrough across Amazon (and the deferred S2-3 offline re-verify). Sessions 1+2 had passed in attempt #2; this session was supposed to walk through S3-1 through S3-36 and close out Waypoint #1. **Actual outcome:** PARTIAL — Amazon S3-1 through S3-11 ✅ before director called wrap-up at S3-11 per session-mgmt lucidity preference (3 substantive mid-session pivots already absorbed). Three real bugs in extension session 3 code FIXED INLINE in single code commit `f4226ca`. Three director directives surfaced + captured per Rule 18 mid-build directive Read-It-Back (this entry).

- **Director's directives (three captured this session per Rule 18 mid-build):**

  - **Directive #1 — Per-user-per-project extension state moves to PLOS DB (P-3 broadened from prior Highlight-Terms-on-reinstall observation):** *"Highlight words should be stored server side so that no matter where the user logs in, they can pick up where they left off. The same goes for other similar data so that no matter where the user logs in, they can pick up where they left off."* Surfaced when `Remove + Load unpacked` reload during the messaging-proxy fix wiped `chrome.storage.local`, and the director had to re-enter Highlight Terms per Project. Director's standing principle: extension state should NOT depend on a single Chrome profile / installation.

  - **Directive #2 — Live-page Highlight Terms application (P-5):** *"When using the competition scraping extension, the highlight words should be highlighted on the page that the user is on."* Surfaced during S3-7 walkthrough when director observed that Highlight Terms entered in popup were NOT being applied to the live Amazon search-results page. Current state: zero live-page highlight code in `extensions/competition-scraping/src/lib/content-script/`. Director's intent was always live-page highlighting (not PLOS-side captured-text only).

  - **Directive #3 — "Sponsored Ad" checkbox in URL-add form + PLOS-side tag (P-6):** *"Along with the 3 different fields that the user can fill out when saving a url, there should be a button to check that says 'Sponsored Ad'. This should be shown as a small tag in the PLOS side in Competition Scraping & Deep Analysis UI as well."* Surfaced during S3-10 walkthrough after the Save flow worked end-to-end. Pairs with P-4 (Amazon SSPA-redirect detection) — when P-4 ships, the form's checkbox would be auto-pre-checked for SSPA-detected URLs.

- **Alternatives considered (per directive):**

  - **#1 (state location):** PLOS DB (chosen — meets "no matter where user logs in" bar) vs. `chrome.storage.sync` (Chrome-account-scoped only — rejected, doesn't survive cross-browser-instance) vs. status quo `chrome.storage.local` (per-installation — rejected, fails reinstall test).

  - **#2 (highlight scope):** PLOS-side captured-text only (rejected via the director's clarification) vs. live competitor pages only (would deprioritize PLOS-side which would be a feature regression) vs. **both** PLOS-side AND live competitor pages (chosen — director's clarification explicitly named live-page; PLOS-side is additive future work).

  - **#3 (sponsored-ad capture):** Auto-detect only via P-4 (no manual override — rejected, P-4 may not catch every Amazon ad shape; user needs override) vs. **manual checkbox NOW + auto-pre-check WHEN P-4 ships** (chosen — synergy: P-6 first means P-4 only adds auto-pre-check behavior, not invent a new column).

- **Decisions:**

  - All three directives captured as ROADMAP polish backlog entries (P-3, P-5, P-6) — see `ROADMAP.md` "🔍 W#2 polish backlog" section. Each entry has scope sketch + estimated effort + cross-references. None actionable in this session per session-mgmt lucidity preference (3 substantive in-session pivots already absorbed for the messaging-proxy fix + button-disappear fix + saved-icon dedupe-and-visibility fix).

  - **Schema implication for P-3 + P-6:** when these polish items get built, the schema-change-in-flight flag will need to flip to "Yes" — both add fields (P-3 likely a new table or fields on existing user-project association tables; P-6 adds `isSponsoredAd Boolean @default(false)` to `CompetitorUrl`). Coordination per `MULTI_WORKFLOW_PROTOCOL §4` schema-change handshake applies.

- **Three inline code fixes shipped this session (not directives — bugs surfaced during walkthrough that blocked progression past their respective steps; commit `f4226ca`):**

  - **Fix #1 — Content-script CORS messaging proxy:** original Waypoint #1 attempt #3 trigger. Content scripts run in host page's origin (`amazon.com` etc.) which is NOT in vklf.com's CORS allowlist (`chrome-extension://*` only — see `src/lib/cors.ts:isAllowedOrigin`). Direct fetches from `listCompetitorUrls` + `createCompetitorUrl` failed preflight with `TypeError: Failed to fetch`. Fix: new `extensions/competition-scraping/src/lib/content-script/api-bridge.ts` routes the 3 PLOS API calls (`listProjects` + `listCompetitorUrls` + `createCompetitorUrl`) through `chrome.runtime.sendMessage` → background service worker → fetch from extension origin where CORS passes. Also extracted `PlosApiError` to standalone `errors.ts` so the bridge doesn't transitively pull in `auth.ts → supabase` under `node:test --experimental-strip-types`. **Bonus side effect:** content.js bundle dropped from ~219 KB to ~21 KB (supabase no longer pulled in transitively into per-page content script — real perf win on every Amazon/Ebay/Etsy/Walmart page load).

  - **Fix #2 — Floating "+" button hover grace timer:** moving cursor from link to floating button fired link-mouseleave → button hidden before cursor reached it. Fix: 150ms grace timer scheduled by `hide()`; button mouseenter cancels the timer; button mouseleave reschedules. Same pattern for `×` dismiss button. ~25 LOC change to `floating-add-button.ts`.

  - **Fix #3 — "Already saved" icon dedupe + visibility boost:** Amazon product cards have 4+ anchor tags pointing to the same product (image link, title link, review-anchor link, price link), so 1 saved URL produced 4 ✓ icons cluttering the card. Plus the default 16px muted-green icon was too subtle to spot at default styling against Amazon's busy chrome (director only noticed icons after applying debug outline via DevTools Console). Fix: dedupe in `orchestrator.scanLinks` to 1 icon per unique normalized URL (across MutationObserver re-scans by reading existing `data-plos-cs-has-icon="1"` markers) + CSS visibility boost in `styles.ts` (28×28 vibrant emerald `#16a34a`, 3px white border + green halo ring + drop shadow + bolder ✓ glyph at 18px font-size 900 weight + max z-index 2147483647). ~20 LOC orchestrator change + ~10 LOC CSS update.

- **Three doc-text drift items surfaced + captured for future cleanup or committed inline:**

  - S3-2 expected list said `https://vklf.com/*` — stale; manifest now uses `https://www.vklf.com/*` per attempt #2 fix `5472d26`. Inline doc-text update committed in this session's doc batch.
  - S3-3 expected `Storage` permission to display in Chrome UI; in practice Chrome only displays permissions with meaningful privacy implications (`storage` is benign internal-only and often hidden). Inline doc-text caveat added.
  - S3-8 said "+ Add button disappears immediately" on cursor away; with the grace-timer fix it now disappears after 150ms (deliberately, to enable the cursor traversal in fix #2). Inline doc-text update.

- **Affected sections:** §A.7 Module 1 (URL capture flow) — adds (post-implementation) clarifications around content-script CORS architecture (must use messaging proxy, not direct fetch) + saved-icon dedupe behavior + cursor-traversal grace timer. §A is frozen per Rule 18; this §B entry serves as the operational-evolution log. §B's prior 2026-05-07-g end-of-session addendum (search-results "already saved" icon spec) gains an addendum: **icon is now deduped to ONE per unique saved URL per page** (was implicitly per-link in the original spec).

- **Cross-references:**
  - `docs/ROADMAP.md` — header + Active Tools W#2 row + W#2 polish backlog new entries P-3, P-4, P-5, P-6.
  - `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — header + Waypoint #1 attempt log new row #3 + cross-references for attempt #3 + S3-1 through S3-11 marked ✅ + inline doc-text fixes for S3-2, S3-3, S3-8, S3-11.
  - `docs/CHAT_REGISTRY.md` — new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header + per-doc flags.
  - `docs/CORRECTIONS_LOG.md` — 2026-05-08-c entry (content-script CORS architecture lesson — extensions making cross-origin calls from content scripts MUST route through background service worker; same-origin allowlist `chrome-extension://*` doesn't cover content-script's host-page origin).
  - Code commit `f4226ca` on `workflow-2-competition-scraping`.

- **Branch implications:** Two commits this session: code `f4226ca` + end-of-session doc-batch (this commit). Both pending Rule 9 push approval — push to `workflow-2-competition-scraping` does NOT deploy vklf.com (which runs `main`). Next session's task is Waypoint #1 attempt #4 covering S3-12 through S3-36 + S2-3 deferred re-verify; next session can run on either branch (no code production expected unless mid-attempt-#4 surfaces another fix-inline pivot).

---

**2026-05-08-d — session_2026-05-08-d_w2-waypoint-1-verification-attempt-4-extension-session-3-completion (Claude Code)**

- **Trigger:** Waypoint #1 verification attempt #4 walked Amazon S3-12 through S3-25 ✅ then pivoted mid-session per Rule 14f Option A to fix four polish items (P-4 + P-5 + P-7 + P-8) before continuing the Ebay/Etsy/Walmart walkthrough — director's reasoning: avoid re-encountering the same bugs across 3 more platforms. Two of the four (P-7 + P-8) were captured live during the walkthrough today; the other two (P-4 + P-5) had been deferred from attempt #3 yesterday. All four shipped at code level in a single commit; browser re-verify carries to attempt #5.

- **Director directives surfaced today (per Rule 18 mid-build directive Read-It-Back — echoed back + confirmed before action):**

  - **(P-7) URL-add overlay positioning — directive at S3-12:** *"When the overlay opens to allow the user to add a url, it shouldn't open directly on top of the very product listing for which the url is being added because many times the user may need to look at the product listing to type in the product name, type or brand."* Read-back captured the intent (don't occlude the listing being captured), the rationale (user often needs the listing visible while typing optional fields), and proposed-and-approved the implementation approach (offset overlay from the trigger's bounding box). Confirmed by director "Yes, it's right."

  - **(P-8) ✓ already-saved icon punches through URL-add overlay — observation at S3-16:** *"if a listing that is next to it had its url added previously, its checkmark shows up on top of the new overlay (which it shouldn't)."* Read-back captured the intent (overlay should fully cover/dim everything underneath, including ✓ icons), the root cause (yesterday's `f4226ca` icon-visibility-boost set z-index to max int32 which equals the form's z-index → two stacking contexts at same z-index → DOM-order rendering → icon punches through), and proposed-and-approved the implementation approach (lower icon z-index + raise overlay z-index). Confirmed by director "Sounds right."

  - **(P-5) Live-page Highlight Terms application — directive carried over from 2026-05-08-c session, expanded with full design Read-It-Back today before coding:** Director surfaced expectation in attempt #3 (*"the highlight words are not being highlighted on the amazon results page... When using the competition scraping extension, the highlight words should be highlighted on the page that the user is on"*); today's design Read-It-Back enumerated the implementation choices (case-insensitive + word-boundary + multi-word + longest-first + whitespace-tolerant matching; TreeWalker over text nodes with skip-list including script/style/textarea/contenteditable/iframe/svg/our own UI; chrome.storage.onChanged listener for live popup-edit refresh; MutationObserver hookup via existing orchestrator observer; perf safeguards 50-term soft cap + 500KB body cap; requestIdleCallback for initial pass; what's-NOT-done scope — no contenteditable highlighting, no overlap dedup, no per-host opt-out). Director's response: "approve P-5 design — proceed."

  - **(P-4) Amazon sponsored-ads SSPA-redirect detection — feature gap carried over from 2026-05-08-c session.** Today's work involved director providing two real captured sponsored-ad URLs from Amazon (sp_atf placement → ASIN B0DWJTLNYT; sp_mtf placement → ASIN B0716F3NFG) for HTML-pattern verification before coding. Real-URL evidence confirmed `/sspa/click?ie=UTF8&spc=...&url=<URL-encoded path with /dp/{ASIN}>` as the canonical SSPA shape; both `searchParams.get('url')` (auto-decoded once) + the real ASIN positioning inside the decoded path were verified empirically. Implementation followed.

- **Why these matter:** P-7 + P-8 are visual-presentation polish but matter for daily UX (P-7 is the cognitive cost of needing to remember the listing details; P-8 is a "this looks broken" first-impression). P-5 is a directional feature gap — the popup-side Highlight Terms manager existed since extension-build session 2 but the user-facing payoff (terms actually highlighting on the page) was missing. P-4 is a feature gap — sponsored ads weren't capturable because the floating "+" button no-op'd on `/sspa/click` URLs.

- **Implementation summary:**

  - **(P-8 / smallest fix)** `extensions/competition-scraping/src/lib/content-script/styles.ts` — z-index restructure into 3 tiers (page-overlay 999990 for saved-icon + add-button + dismiss + overlay-banner; modal-backdrop 999998; modal-content 999999) replacing the prior universal max-int 2147483647. Preserved the icon's ability to beat host-page chrome (Amazon's chrome max-z-index is ~5000-10000 so 999990 has ~100× headroom). Added a leading comment block in the CSS file documenting the tier system. ~5 lines effective change.

  - **(P-7)** Three files modified: `extensions/competition-scraping/src/lib/content-script/url-add-form.ts` adds optional `triggerRect?: DOMRect | null` to `UrlAddFormProps` + new pure helper `computeFormPosition()` that places the form on the side of the viewport opposite the trigger's horizontal center (anchored near top with 16px margin, clamped for narrow viewports); applies via inline `style.position`/`style.left`/`style.top` so the explicit positioning overrides the backdrop's flex-centered layout. `extensions/competition-scraping/src/lib/content-script/floating-add-button.ts` extends the `FloatingAddButtonOptions.onClick` contract to `(href, triggerRect: DOMRect | null)` + stores `currentLinkRect = link.getBoundingClientRect()` at button-show time. `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` threads `triggerRect` from the floating button's onClick into `handleAddRequest(href, triggerRect)` and into the openUrlAddForm props; right-click context-menu fallback path passes `null` for `triggerRect` (no trigger element) → form falls back to centered layout. ~50 LOC across 3 files.

  - **(P-4)** Two files modified: `extensions/competition-scraping/src/lib/platform-modules/amazon.ts` adds `decodeSspaInner(href)` helper (parses URL, checks `pathname === '/sspa/click'`, pulls `searchParams.get('url')`, prepends `${protocol}//${host}`, returns full URL or null); both `matchesProduct` and `canonicalProductUrl` consult it as a fallback when the direct ASIN_RE match fails. `extensions/competition-scraping/src/lib/platform-modules/amazon.test.ts` adds 9 SSPA-coverage tests using the two real captured sponsored-ad URLs + edge cases (missing/empty `url=` param + non-SSPA URLs that happen to have a `url` query param + `/gp/product/` inside SSPA). ~50 LOC source + ~70 LOC tests.

  - **(P-5 / largest fix)** Three files: NEW `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` (~240 LOC) implements the live-page highlight-terms module per the approved design. NEW `extensions/competition-scraping/src/lib/content-script/highlight-terms.test.ts` (~120 LOC) unit-tests the regex builder + colormap pure logic (DOM-touching functions verified live in browser re-verify). `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` integrates: `await startLiveHighlighting(projectId)` after `ensureStylesInjected()` (with try/catch so highlight failures don't break the rest of orchestrator); MutationObserver tick also calls `highlighter.refresh()` (idempotent — strips existing highlights then re-applies); `popstate` location-change handler also calls `highlighter.refresh()`; cleanup teardown calls `highlighter.destroy()`. `extensions/competition-scraping/src/lib/content-script/styles.ts` adds `.plos-cs-highlight` CSS rule (display: inline; padding: 0 2px; border-radius: 2px; background-color + color set inline per-term).

- **Affected sections:** §A.7 Module 1 (URL capture flow) — `+ Add` button now appears on Amazon sponsored ads (P-4) + URL-add overlay positions away from the clicked listing (P-7) + ✓ already-saved icons no longer punch through the URL-add overlay (P-8). §A is frozen per Rule 18; this §B entry serves as the operational-evolution log. **NEW behavior surface — live-page Highlight Terms (P-5)**: the popup-side Highlight Terms manager (built in extension-build session 2 per §A.7) now also drives a content-script that wraps every matching token on Amazon/Ebay/Etsy/Walmart product pages with a colored `<mark>` element. Reads the same `highlightTerms:<projectId>` storage key the popup writes; live-syncs popup edits via `chrome.storage.onChanged`. Skips contenteditable/textarea/script/style/our-own-UI subtrees. Performance safeguards in place. Will need to interact carefully with P-3 (per-user-per-project state moves to PLOS DB) when that ships — same storage-read API can be swapped to PLOS-API-read.

- **Cross-references:**
  - `docs/ROADMAP.md` — header + Active Tools W#2 row Status + Next Session updates + W#2 polish backlog (P-4 + P-5 marked ✅ SHIPPED 2026-05-08-d code-level + new entries P-7 + P-8 marked ✅ SHIPPED 2026-05-08-d code-level).
  - `docs/CHAT_REGISTRY.md` — header + new top row.
  - `docs/DOCUMENT_MANIFEST.md` — header + per-doc flags.
  - `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` — NOT updated this session per Rule 14f Option A wrap-now choice; attempt #4 row + S3-12..S3-25 check-offs + S3-16 doc-text caveat get added at the start of next session's end-of-session doc batch alongside the browser re-verify outcomes.
  - Code commit `<TBD-this-session>` on `workflow-2-competition-scraping` (the polish-fixes commit) + this doc-batch commit.

- **Branch implications:** Two commits this session: code (4 polish fixes — single commit) + end-of-session doc-batch (this commit). Both pending Rule 9 push approval — push to `workflow-2-competition-scraping` does NOT deploy vklf.com (which runs `main`). Next session (attempt #5) starts with director downloading the new zip from `extensions/competition-scraping/.output/competition-scraping-extension-0.1.0-chrome.zip` (175 KB), reloading the unpacked extension at `chrome://extensions`, and walking through a 4-fix re-verify on Amazon (~15-30 min) before continuing the Ebay/Etsy/Walmart walkthrough.

---

END OF DOCUMENT
