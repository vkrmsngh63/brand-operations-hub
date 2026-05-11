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

**2026-05-09-b — session_2026-05-09-b_w2-polish-session-6-p-6-sponsored-ad-build-and-deploy**

- **Director's directive (initial — from launch prompt):** *"W#2 polish session #6 — implement P-6 Sponsored Ad checkbox in URL-add form + PLOS-side tag (per ROADMAP polish backlog P-6 entry; queued by director 2026-05-08-d Option-A 3-session-split). Schema-change-in-flight session — flips flag Yes → No."*

- **Read-It-Back at drift check (per Rule 14a + 14f):** Claude echoed back the 6-part scope from the ROADMAP P-6 entry — (a) schema add `isSponsoredAd Boolean @default(false)` to CompetitorUrl; (b) shared types extended additively; (c) API routes wired (POST/GET/PATCH on /urls + /urls/[urlId]); (d) extension url-add-form checkbox + payload; (e) PLOS-side viewer badge + detail-page toggle + column filter; (f) P-4 synergy via SSPA detection. Director-confirmed via Rule 14f single ambiguity question on the column filter UI shape: Option A new `BooleanFilter` tri-state primitive (All / Sponsored only / Non-sponsored only — recommended) vs Option B reuse `MultiSelectFilter` with synthetic options (less code; leaky abstraction). Director picked **Option A**.

- **Rule-15 autonomous picks (no user-visible difference):**
  - **Sponsored column position = position 2 (right after URL, before Product Name).** Reasoning: sponsored is the most-important meta-attribute about a URL right after its address; co-locates the badge with the URL identity. Alternative placements (last column / between Category and Stars) considered and rejected as making the badge less spatially tied to the URL.
  - **Boolean tri-state representation = `'all' | 'true' | 'false'` string union (vs `boolean | null`).** Cleaner round-trip through URLSearchParams (single key `?sponsored=true|false`; key-omission means 'all') without null-vs-undefined ambiguity.
  - **`detectsAsSponsored` is OPTIONAL on the `PlatformModule` interface** — only Amazon implements it; Ebay/Etsy/Walmart leave it undefined and orchestrator treats absence as "default false." Future platforms with sponsored detection (Google Ads paid placements?) can opt in additively.
  - **Detail-page toggle UX is one-click flip (no edit/save dance).** Other inline editors (Text/Number/Vocabulary) use a pencil → edit → ✓/✕ pattern; for a boolean that's overkill — clicking the checkbox optimistically flips, fires PATCH, reverts on error. New `EditableBooleanField` primitive captures this pattern (minimal, reusable for future boolean toggles in W#2 + W#3-14).

- **What was decided:** Code shipped per the 6-part scope. Two commits both deployed to vklf.com:
  - `bc6816c` P-6 implementation — 14 files (+461/-2): schema + 3 shared types + GET/POST/PATCH wiring on /urls + /urls/[urlId] + extension `url-add-form.ts` checkbox + new optional `PlatformModule.detectsAsSponsored()` (Amazon impl + 7 new amazon.test.ts cases + orchestrator passes signal at form-open as `defaultIsSponsoredAd` prop) + new CSS for checkbox row + PLOS-side `UrlTable.tsx` new "Sponsored" column at position 2 (sortable label + funnel + amber pill badge) + new `BooleanFilter` tri-state primitive in `ColumnFilters.tsx` + new `EditableBooleanField` primitive in `EditableField.tsx` wired into `UrlDetailContent.tsx` between Category and Product Stars.
  - `8115138` post-deploy popover-clipping fix — 1 file (+51/-12): director-observed regression where the column-filter popover got clipped on short tables by the wrapper's `overflow-x: auto` (browsers force overflow-y to clip too). Switched `FilterPopover` from `position: absolute` to `position: fixed` with viewport-anchored top/left computed at click-time from trigger button's `getBoundingClientRect()`; clamped to keep the popover inside the viewport's right edge. Benefits all 7 column filters, not just Sponsored.

- **Mid-session correction (CORRECTIONS_LOG entry, LOW severity):** Claude framed the Step 3 `prisma db push` STOP-gate as targeting "the dev DB only." That was wrong — PLOS uses **one shared Supabase database** for both dev and prod (one connection string in `.env`). The schema column landed in the production DB at the time of the push, before any code had been deployed to read/write it. Safe in this case (additive boolean with `@default(false)`; no data loss; new column simply held the default until vklf.com later got the new code). Acknowledged + correctly framed mid-session at the dev-vs-prod boundary discussion (Step 14). Corrected understanding: dev server (localhost) reads/writes the same DB; vklf.com reads/writes the same DB; "dev" vs "prod" applies to CODE deployment but NOT DB. Future schema-change sessions need to factor this in (a `prisma db push` IS a production schema change, even when described as "dev push" in the session script).

- **Browser-verified live on vklf.com end-to-end:**
  - Walmart: column appears ✅; detail-page toggle flips Yes/No with optimistic update ✅; badge appears on saved row in list ✅; column filter All/Sponsored/Non-sponsored with `?sponsored=true|false` URL round-trip ✅; sort by Sponsored toggle ✅.
  - Amazon extension: SSPA-detected sponsored ad → checkbox auto-pre-checked in URL-add overlay ✅; save with checkbox checked → POST persists isSponsoredAd: true → badge appears on viewer row ✅; organic save (unchecked) → em-dash on viewer ✅.
  - Popover post-fix re-verify: short table; funnel popover opens fully visible (Apply + Clear buttons not clipped) ✅; benefits all 7 column filters ✅.

- **Director-confirmed P-9 status (Walmart highlight-words gap):** existing W#2 polish backlog item P-9 (highlight-terms 500KB cap too aggressive) covers the chrome://extensions Errors panel symptom that surfaced on Walmart again this session. New data point captured: Walmart search exact byte count = 656,627 bytes (`https://www.walmart.com/search?q=bursitis`); 500KB cap fires. Folded into P-9 entry; no new polish item created.

- **Doc updates this session (this commit on `main`):**
  - `docs/ROADMAP.md` — header + Active Tools W#2 row Next Session item (a.2) marked ✅ DONE 2026-05-09-b + W#2 polish backlog P-6 ✅ SHIPPED ✅ DEPLOYED ✅ BROWSER-VERIFIED + P-9 entry data-point addition.
  - `docs/CHAT_REGISTRY.md` — new top row + header.
  - `docs/DOCUMENT_MANIFEST.md` — header + per-doc Modified flags + this-session summary.
  - `docs/COMPETITION_SCRAPING_DESIGN.md §B` (this entry).
  - `docs/CORRECTIONS_LOG.md` — LOW-severity 2026-05-09-b entry on dev-DB framing slip.

- **Branch implications:** Code commits `bc6816c` + `8115138` authored on `workflow-2-competition-scraping`, then deployed via fast-forward merge → `main` per `MULTI_WORKFLOW_PROTOCOL.md §11.1`. Both branches now sit at `8115138` (W#2 fast-forwarded back to main after the second deploy push pending). End-of-session doc-batch commit lands on `main` directly (covers session work that happened across both branches; `main` is the canonical home for ROADMAP/CHAT_REGISTRY/DOCUMENT_MANIFEST/CORRECTIONS_LOG; W#2 will be fast-forwarded to match before next session). Push of doc-batch commit pending Rule 9 approval — push triggers Vercel rebuild but contains zero user-visible code changes (docs only).

---

**2026-05-10 — session_2026-05-10_w2-polish-session-7-p-3-highlight-terms-server-side (Claude Code, eighteenth W#2 session — code commit `16d4351` pushed to `workflow-2-competition-scraping`; W#2 → main merge + browser-verify on vklf.com pending future deploy session)**

- **Director's directive (initial — from launch prompt):** *"W#2 polish session #7 — implement P-3 (narrowed) Highlight Terms server-side persistence (per ROADMAP polish backlog P-3 entry, narrowed by director 2026-05-08-d Option-A 3-session-split to Highlight Terms only; remaining P-3 scope stays open). Schema-change-in-flight session — flips flag Yes → No. Mandatory first action: Rule 18 mid-build directive Read-It-Back to surface the schema-shape decision (table vs JSON column) BEFORE coding."* Director gave Claude pick-whichever agency between (A) P-3 narrowed Highlight Terms server-side persistence and (B) P-9 + P-10 extension polish bundle.

- **Read-It-Back at drift check (Rule 14a):** Claude recommended Option A (P-3 narrowed) as the most thorough/reliable path with three reasons surfaced in plain-language per-option framing: most thorough (removes the underlying state-loss class of bugs; P-9 + P-10 are bug-fix patches and the affected platforms degrade gracefully today); pre-positioned (the W#2 row's "Next Session" cell already had a written launch prompt); schema window open (W#1 graduation-pending so no schema work coming there). Director picked **Option A** via Rule 14f forced-picker — selected "P-3 Highlight Terms (recommended)."

- **Schema-shape Read-It-Back (Rule 18, mandatory before any code):** Claude surfaced three storage options with full per-option context — **Shape A** dedicated `UserProjectHighlightTerm` table (one row per user+project+term; per-term granularity supports future polish like lastMatchedAt; reorderable cleanly via sortOrder; cross-project queries indexable); **Shape B** single JSON column on a new `UserProjectExtensionState` table (matches today's chrome.storage.local shape; smallest extension refactor; less queryable; could become a forward-compatible bucket for future state); **Shape C** reuse the existing generic `UserPreference` table (zero new tables; couples extension-state semantics into a generic prefs bag; hardest to grow). Recommended Shape A as the most-thorough/reliable answer with explicit caveat that the broader-P-3-scope items (selectedProjectId, selectedPlatform) are different shapes (single scalars, not lists) and should NOT pre-share a bucket today — premature abstraction. Director picked **Shape A** via Rule 14f forced-picker.

- **Implementation-plan Read-It-Back (Rule 18, second mandatory step):** Claude wrote the full plan in plain language covering 9 sections: (1) new table schema with field-by-field annotation; (2) two API endpoints `GET` + `PUT` under existing `/api/projects/[projectId]/extension-state/highlight-terms` tree with PUT-replace-whole-list semantics inside one `$transaction`; (3) extension popup switch from chrome.storage.local read/write to PLOS-first via api-client.ts; (4) **content-script unchanged** — chrome.storage.local stays as a per-installation MIRROR cache so the shipped P-5 module's `chrome.storage.onChanged` listener keeps firing on edits without additional surface to break; (5) one-time auto-migration of pre-existing local terms on first authenticated load (pushes them up so director doesn't re-enter); (6) offline policy — read fallback shows cached terms with sync warning, write failure throws inline error and does NOT update cache (next online sync brings server state back); (7) explicit out-of-scope: selectedProjectId/selectedPlatform server-side, case-insensitive DB collation, per-term audit columns (lastMatchedAt etc.); (8) verification surface; (9) ~120-180 min estimate. Director approved + granted standing-approvals for both push-when-clean and immediate `prisma db push` via three Rule 14f forced-pickers.

- **Rule-15 autonomous picks (no user-visible difference):**
  - **Auth helper = `verifyProjectAuth` (NOT `verifyProjectWorkflowAuth`).** Highlight Terms are user+Project scoped, not workflow scoped — they're meaningful regardless of which workflow is being worked on under the Project. Using `verifyProjectAuth` skips the find-or-create-ProjectWorkflow upsert that adds DB load for no semantic benefit here. Aligned with the `(userId, projectId, term)` unique constraint at the schema layer.
  - **PUT-replace-whole-list semantics (vs CRUD).** The term list is small (typically 5-20 terms) and edited as a whole in the popup. Replace-whole-list matches the existing call-site contract exactly (the popup's `setHighlightTerms` always wrote the full array). One $transaction = no partial-write race. Idempotent — same body produces same end state.
  - **Server validation: 200-char term limit; 100-term list limit; 7-char hex color regex; case-sensitive intra-request dedup.** Defense in depth — popup-side dedup is case-insensitive but the server's unique constraint is case-sensitive; intra-request dedup avoids surfacing P2002 to the client. Limits are pragmatic guardrails to prevent accidentally storing megabyte payloads.
  - **Sync-helper dependency-injection seam (`HighlightTermsSyncDeps`).** Refactored mid-session after the first test attempt failed because `node:test --experimental-strip-types` couldn't resolve the auth → supabase chain (extensionless `'./supabase'` import). DI seam makes orchestration logic testable without mocking Supabase auth + fetch + chrome.storage.local globals. Production callers use the default deps; tests inject fakes. (Side-effect: also fixed the auth.ts `'./supabase'` import to `'./supabase.ts'` for ESM-strict resolver compatibility.)
  - **Popup orchestration sequence: optimistic update + rollback on save failure.** Mirrors P-6's `EditableBooleanField` pattern. State updates immediately on user edit; PUT fires; on success state advances to server's canonical view (server may normalize, e.g. trim whitespace); on failure state rolls back to prior + inline error renders.
  - **Sync-warning UI surface = small muted-help paragraph above HighlightTermsManager.** Save-error UI surface = inline error block below HighlightTermsManager. Two distinct surfaces because they cover different failure modes (load offline vs save offline) and clearing one shouldn't auto-clear the other. Successful save clears stale sync-warning since a successful PUT proves the server is reachable.

- **What was decided + shipped:** 9 files changed (+841/-9); single commit `16d4351` on `workflow-2-competition-scraping`. New: `prisma/schema.prisma` adds `UserProjectHighlightTerm` model with `@@unique([userId, projectId, term])` + `@@index([userId, projectId])`; `src/app/api/projects/[projectId]/extension-state/highlight-terms/route.ts` — new GET + PUT + OPTIONS handlers; `src/lib/shared-types/competition-scraping.ts` — adds `HighlightTermDto` + `ListHighlightTermsResponse` + `ReplaceHighlightTermsRequest` + `ReplaceHighlightTermsResponse`; `extensions/competition-scraping/src/lib/api-client.ts` — adds `listHighlightTerms` + `replaceHighlightTerms`; `extensions/competition-scraping/src/lib/highlight-terms-sync.ts` — new orchestrator module with DI seam + `loadHighlightTerms` returning `{ terms, source: 'server' | 'migrated' | 'cache-fallback', warning }` + `saveHighlightTerms` (server-first then mirror); `extensions/competition-scraping/src/lib/highlight-terms-sync.test.ts` — 13 new tests. Modified: `extensions/competition-scraping/src/entrypoints/popup/App.tsx` — SetupScreen wires sync helpers + new sync-warning + save-error UI surfaces; `extensions/competition-scraping/src/lib/popup-state.ts` — header comments updated to reflect mirror-cache role (no functional change); `extensions/competition-scraping/src/lib/auth.ts` — `'./supabase'` → `'./supabase.ts'` for ESM resolver.

- **Schema push:** `npx prisma db push` succeeded against prod in 1.05s (additive — new table only; no existing table touched). Schema-change-in-flight flag flipped Yes during build, back to No after push completed. Note (carried from 2026-05-09-b CORRECTIONS_LOG): PLOS uses one shared Supabase database for dev + prod, so the new table landed in the production DB at push time. Safe — additive change; pre-P-3 code on main simply doesn't read/write the new table; the new code uses it only after W#2 → main merge ships.

- **Verification scoreboard:**
  - Extension `npm run compile` clean (zero errors).
  - Extension `npm test`: **205/205 pass** (was 192/192 — 13 new sync tests added).
  - Extension `npm run build`: clean; **637.9 KB total** (popup-CWenFIaG.js 401.54 kB; background.js 202.12 kB; content.js 29.53 kB).
  - Extension `npx eslint extensions/competition-scraping/src` (run from root): **clean — zero errors / zero warnings.**
  - Root `npx tsc --noEmit`: clean (extensions/ excluded by config).
  - Root `npm run build`: clean — **50 routes** (was 49; new `/api/projects/[projectId]/extension-state/highlight-terms`).
  - Root `node --test --experimental-strip-types $(find src/lib -name '*.test.ts')`: **393/393 pass** — exact baseline parity (no root `src/lib` files modified).
  - Root `npx eslint src`: **52 problems (13 errors, 39 warnings)** — exact baseline parity (13e/39w).

- **Browser verification:** NOT YET — code lives on `workflow-2-competition-scraping` only; not on `main`; not on vklf.com. Director would walk through after a future W#2 → main deploy session. Director's call when to schedule the deploy. Verification path when it happens: (a) install/reload extension; (b) sign in; (c) pick Project that previously had Highlight Terms in chrome.storage.local; (d) confirm terms appear (one-time migration silently pushed them server-side); (e) add/remove a term; (f) toggle DevTools Network → Offline; reload popup → confirm sync warning appears + cached terms still show; (g) sign in from a different Chrome profile / different laptop; confirm same terms appear (the cross-device-test that motivated P-3 originally).

- **Multi-workflow per Rule 25:** Pull-rebase clean at session start. Schema-change-in-flight stayed "No" both rows entering session; flipped W#2's to "Yes" at start of `prisma db push` step, back to "No" after push succeeded. No parallel chat. W#1 row untouched per Rule 3 ownership; zero cross-workflow edits.

- **TaskList sweep at end-of-session (Rule 26):** 5 tasks tracked + completed (Read-It-Back schema-shape; read existing schema + design + call sites; implement P-3; verify build/tests/lint; end-of-session doc batch). **Zero `DEFERRED:` items at any point.** Polish-or-future work surfaced (e.g., contenteditable highlighting; per-host opt-out; client-side write queue for offline writes) was acknowledged in the plan Read-It-Back as out-of-scope and **not deferred** — director didn't want them in scope today and they're not load-bearing for the P-3 polish goal.

- **Affected sections:** §A.7 Module 1 (URL capture flow + Highlight Terms manager) — Highlight Terms now persist server-side; cross-device + cross-Chrome-profile behavior is now "your terms come with you." §A is frozen per Rule 18; this §B entry serves as the operational-evolution log. **NEW data-flow surface — server-authoritative Highlight Terms storage:** popup writes server first, then mirrors to chrome.storage.local; content-script live-page module (shipped P-5) reads chrome.storage.local + listens to chrome.storage.onChanged; the mirror keeps the live-page sync working without the content-script ever talking to the server. Affects §A.12 Data persistence (`highlightTerms:<projectId>` in chrome.storage.local was authoritative; now a per-installation cache mirror; PLOS DB `UserProjectHighlightTerm` is authoritative).

- **Cross-references:** `prisma/schema.prisma` UserProjectHighlightTerm model; `src/app/api/projects/[projectId]/extension-state/highlight-terms/route.ts` (GET + PUT + OPTIONS); `src/lib/shared-types/competition-scraping.ts` (HighlightTermDto + ListHighlightTermsResponse + ReplaceHighlightTermsRequest + ReplaceHighlightTermsResponse); `extensions/competition-scraping/src/lib/highlight-terms-sync.ts` (orchestrator with DI seam); `extensions/competition-scraping/src/lib/api-client.ts` (listHighlightTerms + replaceHighlightTerms); `extensions/competition-scraping/src/entrypoints/popup/App.tsx` SetupScreen (load/save wiring + sync-warning + save-error UI); `extensions/competition-scraping/src/lib/popup-state.ts` (mirror-cache role documented); `ROADMAP.md` W#2 polish backlog P-3 entry status update; `CHAT_REGISTRY.md` 2026-05-10 row.

- **Branch implications:** Code commit `16d4351` pushed to `workflow-2-competition-scraping` per session-start standing approval. **NOT on `main` yet; NOT deployed to vklf.com.** Director's call when to schedule the W#2 → main merge to deploy. Until then, vklf.com runs the prior code (P-6 + popover fix from 2026-05-09-b); the new `UserProjectHighlightTerm` table sits idle in prod (no writers / no readers from main code). End-of-session doc-batch commit lands on `workflow-2-competition-scraping` (covers session work that happened entirely on this branch). Push of doc-batch commit pending Rule 9 approval — push to W#2 branch does NOT deploy vklf.com regardless.

### 2026-05-10-b — W#2 → main deploy session: P-3 narrowed Highlight Terms server-side persistence DEPLOYED + BROWSER-VERIFIED on vklf.com (closes the deploy-pending state from 2026-05-10)

- **Director's session task:** *"W#2 → main deploy session — fast-forward merge `workflow-2-competition-scraping` into main per `MULTI_WORKFLOW_PROTOCOL.md §11.1`, push to main, watch Vercel auto-redeploy, browser-verify P-3 narrowed Highlight Terms server-side persistence on vklf.com (the path captured in ROADMAP W#2 polish backlog P-3 entry: install/reload extension → sign in → pick Project that previously had local Highlight Terms → confirm one-time auto-migration silently pushed them server-side → add/remove a term → DevTools Network → Offline + reload popup → confirm sync warning + cached terms still show → sign in from a different Chrome profile / different laptop → confirm same terms appear)."* This is platform-wide deploy infrastructure (cross-workflow concern); per `HANDOFF_PROTOCOL.md` Rule 25 + `MULTI_WORKFLOW_PROTOCOL.md §11.1`, work belongs on `main`.

- **Sequence executed:** branch verified `main` at session start ✅ → `git fetch origin && git pull --rebase origin main` clean (already up to date) ✅ → `git merge --ff-only origin/workflow-2-competition-scraping` clean (no conflicts; main was 0 ahead of W#2 branch; advanced `928a271 → 8a6e3b5`; 13 files, +905/-17 — both code commit `16d4351` and doc-batch commit `8a6e3b5` brought over) ✅ → `git push origin main` clean ✅ → Vercel auto-redeploy completed (director-confirmed `"build done"`) ✅. **Schema-change-in-flight flag stays No throughout — schema landed in prod last session via `prisma db push`; today is code-deploy only, no schema work.**

- **P-3 verification — all three paths PASSED on vklf.com:**

  - **(i) Silent one-time auto-migration verified end-to-end ✅.** Director added a `p3-server-test` term during the OLD-extension state at session-start (mid-session attempted Phase D before realizing the rebuild + reload had loaded the OLD extension code due to a Codespace folder-zip stale download — see Mid-session friction below). Once the NEW build was loaded via the unique-name single-file zip path, the popup's first authenticated load fired the migration: server returned empty (no terms for this Project + user) + cache had the `p3-server-test` term → orchestrator's migration path triggered → PUT to `/api/projects/[projectId]/extension-state/highlight-terms` → terms appeared via `source: 'migrated'` path with no UI nag. Verified via DevTools Network tab: highlight-terms request appeared with status 200.

  - **(ii) DevTools Network → Offline + reload popup → cached terms still show ✅.** Director toggled DevTools Network throttling to "Offline", pressed Cmd+R / Ctrl+R to reload the popup with DevTools attached. Cached `p3-server-test` term still rendered in the chip list (orchestrator's `cache-fallback` path returned terms from `chrome.storage.local` mirror).

  - **(iii) Cross-device sign-in (different Chrome profile/laptop) → same terms appear ✅.** Director signed in from a different Chrome profile / different laptop, picked the same Project, and confirmed the `p3-server-test` term appeared. **This is the canonical proof of server-side persistence** — the term could only be in the server DB, not local cache (cache is per-Chrome-installation; a different profile/laptop has its own cache that started empty).

- **Mid-session friction captured to `CORRECTIONS_LOG.md`:**

  - **(a) Codespace folder-zip download served what looked like a stale build despite director's full redo.** Director executed: delete old folders → remove old extension → download zip from Codespaces → save extracted folder locally → load folder into Chrome. After Phase D + offline reload, DevTools Network tab showed only the popup HTML/JS/CSS chunks + a failed `projects` request — NO `highlight-terms` request fired at all, suggesting OLD code was loaded. The popup chunk filename in the loaded extension was `popup-CMo7bk1g.js` whereas the freshly-built extension's chunk was `popup-CWenFIaG.js` (verified via `grep` against the local `.output/chrome-mv3/chunks/`). **Root cause hypothesis:** the standard Codespace browser-tab "Download folder" UI generates a zip on the fly and may have served what amounts to a stale or cached zip from a prior session's `.output/`. **Fix:** Claude bypassed the standard folder-zip mechanism by running `zip -r .output/plos-extension-2026-05-10-p3.zip .` server-side (single file, unique filename `plos-extension-2026-05-10-p3.zip`, sha256 `c10142f4...`); director downloaded that single file directly from `extensions/competition-scraping/.output/`, extracted, loaded as unpacked extension; the `highlight-terms` request appeared in DevTools immediately on next reload, confirming the new code was finally loaded. **Lesson for future extension-rebuild sessions:** prefer the single-file unique-name zip path over the Codespace folder-zip download when a code-version mismatch is suspected.

  - **(b) Claude's first diagnostic was over-engineered — director called it `"unnecessarily complex"`.** When the chunk-filename mismatch surfaced, Claude initially proposed asking the director to (i) open the local extension folder on their laptop, (ii) open `popup.html` in a text editor, (iii) read the script tag's `src` attribute, (iv) list the contents of the `chunks` subfolder, etc. — a multi-step file-by-file path-tracing diagnostic. Director feedback: *"This is unnecessarily complex. Think of a different fix."* Claude's switch was the simpler approach above (server-side zip with unique name + direct download). **Lesson for future debugging sessions:** when a download-mechanism is the suspected source of staleness, prefer to bypass the suspect mechanism with a different one rather than chasing diagnostic depth into the suspect mechanism.

- **Pull-rebase clean at both checkpoints per Rule 25:** session start (after fetch) + before doc-batch commit. Multi-workflow per Rule 25: W#1 row untouched per Rule 3 ownership; schema-change-in-flight stays No throughout (no schema work today).

- **TaskList sweep at end-of-session per Rule 26:** 5 session tasks tracked + completed (start-of-session sequence + drift check; fast-forward merge + push; watch Vercel; browser-verify P-3; end-of-session doc batch). Zero `DEFERRED:`-prefixed tasks at any point. The two CORRECTIONS_LOG entries are session-record findings (process improvements / debugging-style guidance), not deferred items per Rule 14e — they belong in CORRECTIONS_LOG directly, no destination handoff needed.

- **Cross-references:** ROADMAP.md header + Active Tools W#2 row + (a.4) ✅ DONE 2026-05-10-b + (a.3) browser-verify ✅ DONE + W#2 polish backlog P-3 entry flipped to BROWSER-VERIFIED; CHAT_REGISTRY.md 2026-05-10-b row; CORRECTIONS_LOG.md 2026-05-10-b two new entries (Codespace folder-zip stale download + over-engineered diagnostic); commits `16d4351` + `8a6e3b5` (both pre-existing on W#2 branch from 2026-05-10; brought to main via this session's fast-forward merge); `extensions/competition-scraping/.output/plos-extension-2026-05-10-p3.zip` (server-side build artifact, gitignored).

- **Branch implications:** session work was the merge + push + browser verification — no new code commits authored this session. The fast-forward merge brought `16d4351` (code) + `8a6e3b5` (doc-batch) from W#2 onto main, both already pushed to origin. End-of-session doc-batch commit lands on `main` directly (covers today's deploy + browser-verify session). After this commit pushes, vklf.com gets a Vercel rebuild but contains zero user-visible code changes (docs only).

---

**2026-05-10-b — session_2026-05-10-b_w2-polish-session-8-p2-p9-p10-bundle (Claude Code, nineteenth W#2 session — three polish fixes shipped at code level on `workflow-2-competition-scraping`; W#2 → main merge + browser-verify on vklf.com pending future deploy session)**

- **Director's directive (initial — from launch prompt):** *"W#2 polish session #8 — P-9 + P-10 + P-2 polish bundle per ROADMAP Active Tools W#2 row Next Session item (a.5) + W#2 polish backlog entries P-9 (highlight-terms 500KB body-text cap too aggressive — blocks Ebay+Walmart pages, fires repeatedly on Walmart heavy-SPA pages) + P-10 (AlreadySavedOverlay banner intermittent on Walmart heavy-SPA pages) + P-2 (extension offline-error handling — authedFetch doesn't catch fetch's TypeError)."*

- **Read-It-Back at drift check (Rule 14a):** Claude surfaced three observations BEFORE asking how to proceed: (1) ROADMAP's Active Tools W#2 row Next Session list has `(a.4)` W#2 → main deploy as RECOMMENDED NEXT, but director picked `(a.5)` polish bundle — doing polish first compounds the W#2-vs-main gap; (2) Group A doc reads partial (CLAUDE_CODE_STARTER + HANDOFF_PROTOCOL + MULTI_WORKFLOW_PROTOCOL + targeted ROADMAP sections only — platform-wide docs not loaded); (3) ~3-4.5 hour total estimate; lucidity risk surfaced upfront. Director picked **"Proceed with all three fixes today, P-2 → P-10 → P-9 in that order (Recommended)"** via Rule 14f forced-picker.

- **P-2 fix shipped (smallest piece, ~5-10 LOC + tests):**
  - `extensions/competition-scraping/src/lib/api-client.ts:46-60` `authedFetch` now wraps the `fetch()` call in `try { ... } catch (err) { throw mapFetchTransportError(err); }`.
  - New exported helper `mapFetchTransportError(err: unknown): PlosApiError` — converts `TypeError("Failed to fetch")` (offline / DNS failure / CORS preflight failure / refused connection) into `PlosApiError(0, 'Network unreachable — check your connection.')`. Other error shapes (AbortError, generic Error, PlosApiError, primitives) are re-thrown unchanged.
  - New test file `extensions/competition-scraping/src/lib/api-client.test.ts` — 6 new tests cover the helper in isolation: TypeError → PlosApiError(0, ...); cross-message TypeError variants; non-TypeError re-throw; AbortError DOMException re-throw; PlosApiError re-throw (idempotent on already-mapped); primitive/null re-throw.
  - **Why exporting the helper:** lets the test exercise the conversion logic without mocking global `fetch`, follows the established pattern of exporting pure-logic helpers (`buildHighlightRegex`, `buildColorMap`, etc.).

- **P-10 fix shipped (~30-50 LOC, no new tests — extension convention is DOM-touching code verified end-to-end in browser):**
  - `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — three behavior changes:
    - **`maybeShowDetailOverlay()` dedupes by `location.href`:** new `lastOverlayUrl: string | null` closure variable. Set BEFORE the recognition match so navigate-away-and-back correctly re-fires (A saved → B unsaved → A again all distinct). Without dedupe, Walmart's React routing fires multiple URL-change events for the same destination during one navigation, causing banner flicker.
    - **`scheduleDetailOverlayCheck()` debouncer (150ms):** cancellable timer ensures only the final URL gets a banner check after a burst of pushState calls. Cleanup on teardown clears any pending timer.
    - **MutationObserver-based SPA URL change detection:** new `lastObservedUrl = location.href` closure variable. Inside the existing 250ms-debounced rescan callback, after `scanLinks()` + `highlighter.refresh()`, check `location.href !== lastObservedUrl`; if changed, update + call `scheduleDetailOverlayCheck()`. **Key technical wrinkle that drove this design:** Chrome content scripts run in an **isolated world** with their own `window.history`, so patching `pushState` in the content-script context does NOT intercept host-page React Router calls (Walmart, etc.) that happen in the page's own context. The MutationObserver is the cross-context-safe signal — SPA navigation always causes immediate DOM mutation paired with a URL change.
  - **popstate handler unchanged in shape but now routes through `scheduleDetailOverlayCheck()`** for consistency with MutationObserver-detected changes. Initial-load detail-overlay check at orchestrator startup (line 242 in pre-fix) also routes through the debouncer — gives Walmart's React time to settle URL after content-script load.
  - **Alternatives ruled out:** page-context `<script>` injection to patch pushState in page context (more invasive; CSP-sensitive); `chrome.webNavigation.onHistoryStateUpdated` (requires `webNavigation` permission + user re-approval prompt + background-script messaging); polling `location.href` (wasteful CPU). MutationObserver-based detection re-uses already-running observer with zero new permissions or background overhead.

- **P-9 fix shipped (largest piece, chunked/incremental highlight pass + cap removed entirely):**
  - **The recommended backlog combination (c) chunked + (e) dedupe warning + (f) skip-if-unchanged measurement reduces to (c) alone** — chunking removes the cap entirely, which auto-resolves both noise (no cap → no warning to dedupe) and perf (no cap → no expensive `document.body.textContent.length` re-measure on each refresh tick).
  - `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` — three changes:
    - **`MAX_BODY_TEXT_LEN_BYTES` constant + `pageTooLarge()` function REMOVED entirely.** No more 500KB cap; no more chrome://extensions Errors panel accumulation; no more skip-pass for Ebay (~1.5MB) and Walmart (~636KB) pages.
    - **New exported `processInChunks<T>(items, processItem, options)` helper** — generic chunk-and-yield. Default chunk size 500 (sized so each chunk takes ~10-15ms at ~25μs/wrap on typical pages). Yields between chunks via `requestIdleCallback` (with `setTimeout(0)` fallback). Pluggable `yieldFn` for unit testing without browser idle-callback API. Honors a `CancellationSignal` — returns at next chunk boundary if `signal.cancelled` becomes true mid-pass.
    - **`applyHighlightsTo` is now `async`** — collects text nodes upfront via TreeWalker (existing pattern; cheap synchronous DOM read), then processes them via `processInChunks`. Honors cancellation in BOTH the collect phase (between TreeWalker steps) and the wrap phase (between chunks).
  - **`startLiveHighlighting.refresh()` rewritten for last-wins cancellation:** new `activeApplySignal: CancellationSignal | null` closure variable tracks the in-flight pass. Each new `refresh()` cancels the previous (sets `signal.cancelled = true`) before starting fresh. Wrapped in try/finally so the active-signal slot is cleared on completion or cancellation. The destroy() function also cancels in-flight passes for clean teardown.
  - **MutationObserver debounce stays at 250ms in orchestrator.ts.** Cancellation-on-new-refresh handles the rapid re-fire churn cleanly: rapid SPA mutations on Walmart will cancel + restart refreshes, with the latest DOM-state always becoming the eventual visible state.
  - **9 new tests added to `extensions/competition-scraping/src/lib/content-script/highlight-terms.test.ts`** for `processInChunks` — chunk boundary correctness (no yield within chunks; no trailing yield); empty-input; signal-cancelled-mid-pass; signal-cancelled-before-first-item; default chunkSize; ordering invariant.

- **Rule-15 autonomous picks (no user-visible difference):**
  - **Default chunkSize = 500.** Sized so each chunk takes ~10-15ms (well under 16ms frame budget) on typical pages with ~25μs/text-node wrap. Tunable via options for future tuning.
  - **`scheduleYield` uses `requestIdleCallback` when available, falls back to `setTimeout(0)`.** Identical strategy to existing initial-pass scheduling. Both yield to the event loop; idle callback waits for browser-determined idle moments (preferred), setTimeout fires next-tick (universal).
  - **Pure helper extraction pattern.** `processInChunks` and `mapFetchTransportError` exported for unit testing — established convention across the extension's pure-logic surface (`buildHighlightRegex`, `buildColorMap`, URL-normalization helpers, etc.).
  - **No bumped MutationObserver debounce on heavy-SPA platforms.** With cancellation-on-new-refresh, the churn-cost is paid only on the cancelled passes' partial work (which is wiped by the next removeAllHighlights anyway); no need to slow refresh latency.
  - **TS-narrowing fix mid-implementation.** Initial `processInChunks` used `for (let i = 0; i < items.length; i++) processItem(items[i])` which TS strict-mode flagged with TS2345 (`items[i]` typed as `T | undefined` under `noUncheckedIndexedAccess`). Switched to `for (const item of items)` with separate counter — same semantics, clean type narrowing.

- **What was decided + shipped:** Three fixes in a single bundle on `workflow-2-competition-scraping`. Two new test files (`api-client.test.ts` 6 tests; `highlight-terms.test.ts` extended +9 tests for `processInChunks`); modifications to `api-client.ts` (P-2 wrapper + helper), `highlight-terms.ts` (P-9 chunked walker + cap removed), `orchestrator.ts` (P-10 SPA URL-change detection + dedupe + debouncer). Total +15 tests; zero regressions.

- **Verification scoreboard:**
  - Extension `npm run compile` clean (zero errors).
  - Extension `npm test`: **220/220 pass** (was 205/205 — +6 P-2 tests + +9 P-9 processInChunks tests).
  - Extension `npm run build`: clean; **638.82 KB total** (popup unchanged at ~401 KB; background unchanged at ~202 KB; content-scripts/content.js ~30 KB).
  - Extension `npx eslint extensions/competition-scraping/src` (run from extension root): exit 0; "Pages directory" informational message from inherited Next eslint plugin (not a lint error — no errors / no warnings emitted; same observation as session #7's lint output).
  - Root `npx tsc --noEmit`: clean (extensions/ excluded by config).
  - Root `npm run build`: clean — **50 routes** (exact baseline parity from session #7; no new routes this session).
  - Root `node --test --experimental-strip-types $(find src/lib -name '*.test.ts')`: **393/393 pass** — exact baseline parity (no root `src/lib` files modified).
  - Root `npx eslint src`: **52 problems (13 errors, 39 warnings)** — exact baseline parity (13e/39w).

- **Browser verification:** NOT YET — code lives on `workflow-2-competition-scraping` only; not on `main`; not on vklf.com. Director will walk through after a future W#2 → main deploy session. Verification path when it happens, per fix:
  - **P-2:** Sign in to extension; toggle DevTools Network → Offline; trigger an `authedFetch`-backed call (e.g., open popup which lists projects, OR sign out + sign in to force `listProjects` API call); confirm the popup's red error box reads "Network unreachable — check your connection." instead of "Failed to fetch" / blank state.
  - **P-9:** Configure Highlight Terms in popup; navigate to Ebay search results page (~1.5MB body text) — Highlight Terms appear (previously: skipped via cap). Same on Walmart (~636KB+). Open chrome://extensions Errors panel for the extension — confirm zero new "exceeds highlight cap" entries (the warning is gone). Configure 50+ terms — confirm "exceeds soft cap" warning still fires (the soft cap on term count is preserved). Spot-check that highlights still appear on Amazon (was working pre-fix).
  - **P-10:** Sign in; pick Project; pick Walmart platform; save a Walmart product URL via the floating "+ Add" button; navigate from Walmart search results to that saved product detail page (single-click navigation — uses pushState) — confirm the green "✓ This URL is already in your project" banner appears reliably (previously: intermittent on Walmart). Repeat across 5-10 navigations to test reliability. Also spot-check Amazon + Ebay + Etsy detail-page banner (was working pre-fix); confirm no regressions.

- **Multi-workflow per Rule 25:** Pull-rebase clean at session start. Schema-change-in-flight stayed "No" both rows entire session — none of P-2/P-9/P-10 touched `prisma/schema.prisma`. No parallel chat. W#1 row untouched per Rule 3 ownership; zero cross-workflow edits.

- **TaskList sweep at end-of-session (Rule 26):** 5 tasks tracked + completed (start-of-session sequence + drift check; P-2 fix; P-10 fix; P-9 fix; verification + doc batch). **Zero `DEFERRED:` items at any point.** One observation captured (the wxt-build hang seen mid-session resolved itself; root cause was apparently stale background processes from earlier build attempts; not deferred — informational).

- **Affected sections:** §A.7 Module 1 (URL capture flow + AlreadySavedOverlay banner reliability + live-page Highlight Terms application) — Walmart heavy-SPA reliability improved across two surfaces; Highlight Terms now apply on arbitrary-size pages; offline-error UX cleaner. §A is frozen per Rule 18; this §B entry serves as the operational-evolution log. **No new data-flow surfaces.**

- **Cross-references:** `extensions/competition-scraping/src/lib/api-client.ts` (P-2 wrap + `mapFetchTransportError` helper); `extensions/competition-scraping/src/lib/api-client.test.ts` (NEW — 6 tests); `extensions/competition-scraping/src/lib/content-script/highlight-terms.ts` (P-9 chunked walker + cap removed + `processInChunks` helper + `CancellationSignal` interface); `extensions/competition-scraping/src/lib/content-script/highlight-terms.test.ts` (extended +9 processInChunks tests); `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` (P-10 SPA URL-change detection + dedupe + 150ms debouncer); `ROADMAP.md` W#2 polish backlog P-2 + P-9 + P-10 entry status updates; `CHAT_REGISTRY.md` 2026-05-10-b row.

- **Branch implications:** Code commit (this session's work) lands on `workflow-2-competition-scraping`. **NOT on `main` yet; NOT deployed to vklf.com.** Combined with session #7's P-3 narrowed work (commit `16d4351`), the W#2-vs-main deploy gap now covers FOUR polish items (P-2 + P-3 narrowed + P-9 + P-10) plus session #7's schema addition. The next deploy session (item (a.4) in the Active Tools row) will browser-verify all four together. End-of-session doc-batch commit also lands on `workflow-2-competition-scraping`. Push of both code + doc-batch commits pending Rule 9 approval — push to W#2 branch does NOT deploy vklf.com regardless.

**2026-05-10-c — session_2026-05-10-c_w2-main-deploy-and-p9-p10-browser-verify-and-p2-deferred (Claude Code, twentieth W#2 session — W#2 → main deploy session #2; P-9 + P-10 ✅ DEPLOYED + ✅ BROWSER-VERIFIED on vklf.com; P-2 ✅ DEPLOYED but browser re-verify DEFERRED with corrected test sequence captured)**

- **Director's directive (initial — from launch prompt):** *"W#2 → main deploy session — fast-forward merge `workflow-2-competition-scraping` to `main` and push to deploy four W#2 polish items (P-2 + P-3 narrowed + P-9 + P-10) plus session #7's UserProjectHighlightTerm schema addition."* Per `MULTI_WORKFLOW_PROTOCOL.md §11.1`, work belongs on `main`.

- **Drift-check surfaced 3 facts not in launch prompt (clarified before any git surgery):**
  - **(a) Two of the four items already shipped + verified.** P-3 + UserProjectHighlightTerm schema landed in the previous deploy session (2026-05-10-b commit `21d717b` on main; verified via `npx prisma db pull --print` + `grep -n UserProjectHighlightTerm prisma/schema.prisma` line 404). Today's actual deploy scope is just **P-2 + P-9 + P-10** (3 fixes, not 4), all extension-only code.
  - **(b) `git merge --ff-only` is NOT possible — branches diverged.** main's `21d717b` (deploy doc-batch from 2026-05-10-b) had advanced past the merge base. polish session #8 (`9d9cfea` + `6cd9949`) was added to W#2 WITHOUT first pulling main's `21d717b` — neither branch is a strict ancestor of the other.
  - **(c) Root cause for next-session protocol fix:** polish session #8 should have run `git pull origin main` (not just `git pull --rebase origin workflow-2-competition-scraping`) to absorb main's `21d717b` deploy doc-batch into W#2 before adding new W#2 commits. Captured to CORRECTIONS_LOG with proposed fix to extend `MULTI_WORKFLOW_PROTOCOL §4`.

- **Director-picked Option A (recommended) for divergence resolution:** rebase W#2 onto main + force-push W#2 + ff-only merge to main + push origin/main. Reasoning: produces clean linear history; matches "fast-forward merge" intent from launch prompt; one-time cleanup of the divergence so next W#2 session starts from a clean state.

- **Rebase + conflict resolution executed:** `git checkout workflow-2-competition-scraping && git rebase main`. Three doc-file conflicts (CHAT_REGISTRY, DOCUMENT_MANIFEST, ROADMAP) + two auto-merged (COMPETITION_SCRAPING_DESIGN, COMPETITION_SCRAPING_VERIFICATION_BACKLOG). Conflicts resolved mechanically via Python script:
  - **Header chains** in CHAT_REGISTRY/DOCUMENT_MANIFEST/ROADMAP: kept HEAD's "Last updated" as top + demoted W#2's content to a new "Previously updated" entry. Same pattern for "Last updated in session" lines (one regex slip required manual fix later).
  - **W#2 row in ROADMAP Active Tools table:** the row's "Last Session" cell was the trickiest — both versions prepended their own session entry to a flowing concatenated cell. Resolution = take HEAD's row (which has all the latest accurate sub-item statuses including (a.3) → DONE, (a.4) → DONE), surgically prepend the polish session #8 entry to the start of the Last Session cell with " / " separator (HEAD's convention; W#2 had used "PRIOR:" trailing word).

- **Force-push W#2 + ff-only merge to main:** `git push --force-with-lease origin workflow-2-competition-scraping` succeeded (origin's W#2 went `6cd9949...cc843a7 (forced update)`; old commits dangling on GitHub for ~30 days, recoverable). Then `git checkout main && git merge --ff-only workflow-2-competition-scraping` clean (now strictly 2 commits ahead). Per Rule 9 deploy gate, described both commits' impact + asked explicit confirmation; director approved; `git push origin main` clean → Vercel auto-redeploy started. Net result on main: `d2e2115` (P-2/P-9/P-10 extension code, byte-identical to original `9d9cfea` per pre-push code-diff verification) + `cc843a7` (resolved-conflict doc-batch).

- **Extension rebuilt + zipped for sideload:** `npx wxt build` clean in 1.574s (no epoll_wait hang this time after `pkill -f wxt` to clear yesterday's zombies). `.output/chrome-mv3/` total size **638.82 kB** — exact match for polish session #8 verified baseline (no surprise drift from rebase). Zipped `plos-extension-2026-05-10-c-p2-p9-p10.zip` at repo root, 177,116 bytes (slightly larger than yesterday's 175,090 due to polish session #8 code additions). Unique-named filename per the Codespace-zip-cache lesson from yesterday's CORRECTIONS_LOG.

- **P-9 verification — ALL 9 STEPS PASSED on vklf.com (cap-removal + chunked walker confirmed across 4 platforms):**
  - **P9-1 + P9-2 (Ebay search + listing detail):** Highlight Terms now appear on previously-blocked ~1.5MB / ~1.58MB pages ✅ (cap-removal verified — these pages were entirely blocked pre-fix).
  - **P9-3 + P9-5 (chrome://extensions Errors panel post-Ebay + post-Walmart):** zero new "exceeds highlight cap" entries ✅ (cap entirely removed → no warning to repeat; held even after Walmart's ~20+ MutationObserver re-renders).
  - **P9-4 (Walmart search heavy-SPA ~636-675KB):** Highlight Terms appear + page does NOT freeze ✅ (chunked walker yields between batches; 500 nodes ≈ 10-15ms/chunk).
  - **P9-6 (soft 50-term-count cap):** console warning fires when terms exceed 50 ✅ (separate from removed body-text cap; still active).
  - **P9-7 + P9-8 (Amazon + Etsy spot-checks):** no regression ✅ (smaller pages still highlight cleanly).
  - **P9-9 (live-edit on Walmart):** add/remove a term in the popup with a Walmart page open → page updates highlights within ~1-2s without refresh ✅ (chrome.storage.onChanged listener + last-wins cancellation handles in-flight pass cleanly).

- **P-10 verification — ALL 10 STEPS PASSED on vklf.com (Walmart heavy-SPA reliability + cross-platform spot-checks):**
  - **P10-1 (direct paste of saved Walmart URL):** banner appears within ~1s + auto-dismisses after 5s ✅.
  - **P10-2 + P10-3 (Walmart SPA-navigation to saved product, repeat 5 times):** banner appears reliably 5/5 times across different saved products ✅ (the previously-flaky path — pre-fix this was intermittent).
  - **P10-4 (unsaved product navigation):** NO banner appears ✅ (correctly suppressed — URL not in recognition set).
  - **P10-5 (unsaved → saved navigation):** banner appears ✅ (dedupe correctly tracks last-considered URL — re-fires on URL change).
  - **P10-6 (refresh same URL):** banner appears again on refresh ✅ (fresh content script = fresh state).
  - **P10-7 (manual × dismiss + stay on URL):** banner does NOT re-appear at the same URL ✅ (dedupe correctly suppresses re-fire until URL changes).
  - **P10-8 + P10-9 + P10-10 (Amazon + Ebay + Etsy spot-checks):** banner appears on each saved-product navigation ✅ (no regression on platforms that already worked pre-fix).

- **P-2 BROWSER RE-VERIFY DEFERRED + corrected test sequence captured for next session:**
  - **What director observed today:** P2-4 still showed "Failed to fetch" instead of friendly "Network unreachable — check your connection." in the popup's red error box.
  - **Diagnosis (verified via code-read):** P-2's fix (`mapFetchTransportError` in `extensions/competition-scraping/src/lib/api-client.ts:62`) wraps `authedFetch` only. Supabase auth's `signInWithPassword` (in `auth.ts:17-23`) has its OWN internal fetch path that's NOT wrapped by `mapFetchTransportError`. The original verification spec from polish session #8 ("sign out → WiFi off → sign in") hits supabase auth's path BEFORE `authedFetch` ever runs — so P-2's fix doesn't trigger; supabase returns "Failed to fetch" verbatim.
  - **Corrected test sequence for next session:** (1) sign in normally with WiFi ON (network works → SetupScreen renders → ProjectPicker fetches projects via authedFetch successfully → cached session is established); (2) turn OFF WiFi (stay signed in); (3) close popup, then re-open it (popup's `ProjectPicker` re-fetches via `authedFetch` on mount → P-2 converts the `TypeError` to `PlosApiError(0, 'Network unreachable — check your connection.')`); (4) `ProjectPicker` prepends "Couldn't load your projects (0): " to the error.message → expected red error box reads approximately **"Couldn't load your projects (0): Network unreachable — check your connection."**.
  - **DEFERRED registered as TaskCreate task #6** per Rule 26 — closes only when a future session walks the corrected sequence on vklf.com + the friendly error message is confirmed in the red error box. If a future session sees "Failed to fetch" still appearing with the corrected sequence, P-2 has a real code bug (likely in `mapFetchTransportError` signature or in `ProjectPicker.tsx:31-35` error.message extraction).

- **Mid-session director-side correction on Walmart platform-switch (verification-spec gap captured to CORRECTIONS_LOG):**
  - **What director observed:** after switching popup from Amazon → Walmart and navigating to Walmart, neither Highlight Terms nor the floating "+" icon appeared. chrome://extensions Errors panel showed zero new errors.
  - **Diagnosis (verified via code-read):** `extensions/competition-scraping/src/lib/content-script/orchestrator.ts:78-81` reads `selectedPlatform` from popup-state ONCE on page load. If user switches the popup's platform AFTER the page is already loaded, the running content script doesn't re-read — orchestrator's gate-check at line 102-107 (verify hostname matches selected-platform's module) silently bails out (no errors, no UI). The page needs a refresh to re-read the new platform setting.
  - **Director refreshed Walmart → Highlight Terms + "+" icon both appeared immediately.** All P-9 + P-10 Walmart steps passed after that.
  - **Verification-spec gap:** the Polish session #8 spec said "switch the popup to the right platform before each navigation" but didn't explicitly call out "AND refresh the page after switching the popup's platform if you have a page already open." Captured as CORRECTIONS_LOG entry; spec body should be updated in the next polish-spec session.

- **Three CORRECTIONS_LOG entries this session:**
  - **(a) Polish session #8 didn't pull main into W#2 first → caused today's divergence.** Process gap. Structural fix proposed: extend `MULTI_WORKFLOW_PROTOCOL §4` to require pulling main into feature branches when main has advanced (e.g., after a deploy session). Today's session is W#2 deploy work, not protocol-design work; the protocol update lands in a future session.
  - **(b) P-2 verification spec design conflated supabase-auth fetch with `authedFetch` fetch paths.** Spec-design gap. Today exercised the wrong layer — a future session needs the corrected sequence (above).
  - **(c) Verification spec for P-9 + P-10 didn't call out the refresh-after-platform-switch requirement.** Spec-design gap. Today director hit silent gate-check rejection on first Walmart attempt; a future polish-spec update should add the refresh requirement.

- **Schema-change-in-flight stays "No" throughout this session.** No schema work today (today is rebase + deploy + browser-verify + doc-batch only). PLOS uses one shared Supabase DB; schema state was already aligned with main from session #7's `prisma db push`.

- **Multi-workflow per Rule 25:** pull-rebase clean at both checkpoints (session start + before doc-batch commit; both no-ops since no other concurrent work). W#1 row untouched per Rule 3 ownership. W#2 row updated.

- **TaskList sweep at end-of-session per Rule 26:** 6 session tasks tracked + 5 completed; 1 `DEFERRED:` task open at end-of-session — task #6 (P-2 browser re-verify with corrected test sequence). Per Rule 26 the doc entries that the deferred task points to ARE written this session — ROADMAP polish backlog P-2 status updated + COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md "Polish session #8" P-2 sub-table updated with corrected sequence + this §B entry's "Corrected test sequence" sub-bullet captured. The task itself remains open as the persistent reminder for the next session to actually walk the corrected sequence.

- **Cross-references:** ROADMAP.md header + Active Tools W#2 row Last Session + W#2 polish backlog P-2/P-9/P-10 status updates; CHAT_REGISTRY.md 2026-05-10-c row + Last-updated-in-session line; DOCUMENT_MANIFEST.md header + per-doc flags; COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md "Polish session #8" P-9 + P-10 sub-tables marked PASS + P-2 sub-table updated with corrected sequence; CORRECTIONS_LOG.md 2026-05-10-c three new entries; commits `d2e2115` ext code + `cc843a7` resolved-conflict doc-batch (both pushed to origin/main mid-session per Rule 9 approval); `plos-extension-2026-05-10-c-p2-p9-p10.zip` at repo root (gitignored build artifact).

- **Branch implications:** all session work on `main` (the deploy branch). W#2 branch was rebased + force-pushed to align with main + new code commits. After this session: W#2 = main + 0 (W#2 fully caught up since the merge brought everything onto main). Next W#2 session will start clean from `main`'s state. End-of-session doc-batch commit also lands on `main`. Push pending Rule 9 approval — doc-only push triggers Vercel rebuild but contains zero user-visible code changes (the code from `d2e2115` is already deployed earlier in session).

---

### 2026-05-10-d — W#2 → main deploy session #3 — rebase + ff-merge of polish session #9 doc-batch onto main + P-9 + P-10 ✅ RE-CONFIRMED BROWSER-VERIFIED on vklf.com (ALL 19 STEPS PASSED)

**Session ID:** `session_2026-05-10-d_w2-main-deploy-session-3-and-p9-p10-reverify-on-vklf` (Claude Code, Seventy-first Claude Code session). Cross-workflow / platform-wide deploy work on `main` per `MULTI_WORKFLOW_PROTOCOL.md §11.1`. Closes ROADMAP Active Tools W#2 row item (a.7) RECOMMENDED-NEXT (added by polish session #9's `2c1c736` to bring its P-2 verified docs onto main).

- **Same divergence pattern as 2026-05-10-c session #2.** Polish session #9 (on `workflow-2-competition-scraping`) didn't pull main's two newer commits (`79ab26d` deploy session #2 doc-batch + `af9537b` addendum) before adding its own commit (`2c1c736`). When today's session checked, workflow-2 (local) was at `2c1c736` and main was at `af9537b` — common ancestor `cc843a7`, both branches one commit ahead. ff-only merge from workflow-2 to main was blocked. Captured as a recurring instance of CORRECTIONS_LOG 2026-05-10-c entry #1 (the structural fix to extend `MULTI_WORKFLOW_PROTOCOL §4` is still pending implementation). Today's W#2 polish session #10 launch prompt embedded a manual mitigation: "git merge --ff-only origin/main" right after the branch checkout, before any new commits land — closes the gap until the protocol fix ships.

- **Reconciliation per director-picked Option A (recommended) — same proven sequence as 2026-05-10-c session #2:**
  1. `git checkout workflow-2-competition-scraping` (1 commit ahead of origin)
  2. `git rebase main` → 4 doc conflicts surfaced: `docs/CHAT_REGISTRY.md` + `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` (2 regions) + `docs/DOCUMENT_MANIFEST.md` + `docs/ROADMAP.md` (3 regions: header, W#2 row, polish backlog header, P-2 entry). Conflicts resolved mechanically — preserved both sessions' content with polish-session-9 as "Last updated" and deploy-session-2 demoted to "Previously updated". `docs/COMPETITION_SCRAPING_DESIGN.md` had NO conflict (workflow-2 hadn't touched it; main's 79ab26d's §B entry flowed through cleanly via auto-merge).
  3. W#2 row in ROADMAP.md merged via Python script (extracted both sides' rows by 1-indexed line; took incoming side's row as base since it has the most current (a.5) item + the right (a.7) for today; inserted HEAD's deploy-session-#2 Last Session entry between polish session #9's prepended entry and the prior shared "2026-05-10-b w2-polish-session-8-p2-p9-p10-bundle" history; preserved row's `| No |` ending — schema-flight column intact).
  4. `git rebase --continue` → produced new commit `d86be9f` on workflow-2 (rebased polish session #9's content + the conflict resolutions).
  5. `git push --force-with-lease origin workflow-2-competition-scraping` (`cc843a7` → `d86be9f`; old commit `2c1c736` dangles on GitHub for ~30 days).
  6. `git checkout main && git pull --rebase origin main` (clean — no new commits on origin/main since session start).
  7. `git merge --ff-only workflow-2-competition-scraping` (1 commit ahead). Local main now at `d86be9f`.
  8. `git push origin main` (`af9537b` → `d86be9f`). Vercel auto-redeploy triggered.

- **One new commit on main: `d86be9f` (rebased polish session #9 doc-batch — doc-only +25/-15 across 4 files).** No extension code change since `d2e2115` (deployed in session #2). The commit author + commit message preserved from polish session #9 by the rebase (per git default behavior — "End-of-session doc batch — 2026-05-10-c W#2 polish session #9 — P-2 BROWSER-VERIFIED on local extension build" is `d86be9f`'s subject).

- **Extension rebuilt + zipped for sideload:** `npx wxt build` again hit the epoll_wait hang post-completion (known WXT quirk per 2026-05-10-b CORRECTIONS_LOG); killed via `pkill -f wxt` after ~6s — artifacts intact on disk at `extensions/competition-scraping/.output/chrome-mv3/` totaling 656 KB (matches polish session #8 baseline `638.82 kB` within block-counting overhead since extension code is byte-identical — no source changes since `d2e2115`). Copied to uniquely-named directory `plos-extension-2026-05-10-d-w2-deploy-3` and zipped to `plos-extension-2026-05-10-d-w2-deploy-3.zip` at repo root, 174 KB. Unique-named filename per the Codespace-zip-cache lesson from 2026-05-10-b CORRECTIONS_LOG.

- **P-9 verification — ALL 9 STEPS PASSED on vklf.com (re-confirmation after fresh sideload + rebase-merge):** same expected results as 2026-05-10-c session #2, same actual results today — no regression. Director walked all 9 steps after Vercel "Ready" + sideload + sign-in + project picked. Detailed step list embedded in the session's verification-walk message: P9-1 + P9-2 (Ebay search + listing detail — Highlight Terms appear on previously-blocked ~1.5MB / ~1.58MB pages); P9-3 + P9-5 (chrome://extensions Errors panel post-Ebay + post-Walmart — zero new "exceeds highlight cap" entries); P9-4 (Walmart search heavy-SPA ~636-675KB — Highlight Terms appear + page does NOT freeze); P9-6 (soft 50-term-count cap — console warning fires when terms exceed 50); P9-7 + P9-8 (Amazon + Etsy spot-checks — no regression); P9-9 (live-edit on Walmart — propagates within ~1-2s).

- **P-10 verification — ALL 10 STEPS PASSED on vklf.com (re-confirmation):** same expected vs. actual as 2026-05-10-c session #2 — no regression. P10-1 (direct paste of saved Walmart URL — banner within ~1s + auto-dismiss after 5s); P10-2 + P10-3 (Walmart SPA-navigation 5/5 reliability across different saved products); P10-4 (unsaved suppresses correctly); P10-5 (unsaved → saved navigation re-fires); P10-6 (refresh re-fires); P10-7 (manual × dismiss + stay-on-URL correctly suppresses re-fire); P10-8 + P10-9 + P10-10 (Amazon + Ebay + Etsy spot-checks — no regression).

- **P-2 doc updates flowed onto main via the merge.** Polish session #9 (`2c1c736`'s now-rebased version `d86be9f`) had verified P-2 BROWSER-VERIFIED on local extension build via the corrected sequence. Today's merge brought those doc updates onto main. Per byte-identical-bundle reasoning, P-2 is fully verified — `mapFetchTransportError` code path is in extension JS that runs identically regardless of vklf.com vs local (fetch URL `https://vklf.com/api/...` and offline TypeError → PlosApiError mapping happens client-side; no server-side dependency). vklf.com re-verify of P-2 is formally optional belt-and-suspenders confirmation; today's session didn't walk it because (a) launch prompt explicitly scoped today to P-9 + P-10 re-verify only, (b) byte-identical-bundle reasoning makes vklf.com re-verify functionally redundant for extension-only changes, (c) director can fold it into a future polish session if they want it for completeness.

- **Smooth session — zero new CORRECTIONS_LOG entries.** Three lessons reinforced from prior sessions (no need to re-capture; existing entries cover them):
  - **(a) Branch recommendation correctly followed addendum's branch-rule cheat sheet.** `af9537b`'s addendum to CORRECTIONS_LOG 2026-05-10-c entry #4 had captured: "code build → feature branch; deploy → main; browser-verify → feature branch; cross-workflow infra → main." Today's session is a deploy session → on `main` ✅. Director's launch prompt explicitly named the protocol section and required branch verification at session start — Claude verified `git branch --show-current` returned `main` before any heavy doc reads.
  - **(b) Test sequences for P-9 + P-10 included the platform-switch-refresh callout.** CORRECTIONS_LOG 2026-05-10-c entry #3 captured the platform-switch refresh requirement (orchestrator reads `selectedPlatform` once on page load; needs refresh after popup-side platform switch). Today's verification-walk message embedded "REFRESH the test page" instruction at every platform-switch step. Director didn't hit the silent gate-check rejection that surfaced in session #2.
  - **(c) Rebase-then-ff pattern works smoothly when applied prophylactically.** Same divergence pattern hit twice in 24 hours (sessions #2 + #3); both times director-picked Option A (rebase + ff) reconciled cleanly with mechanical conflict resolution. The pattern is proven; the structural fix to prevent the divergence in the first place is still pending in `MULTI_WORKFLOW_PROTOCOL §4`.

- **Schema-change-in-flight stays "No" throughout this session.** No schema work today (today is rebase + deploy + browser-verify + doc-batch only). PLOS uses one shared Supabase DB; schema state was already aligned with main from session #7's `prisma db push`.

- **Multi-workflow per Rule 25:** pull-rebase clean at both checkpoints (session start + before doc-batch commit; both no-ops since no other concurrent work). W#1 row untouched per Rule 3 ownership. W#2 row updated.

- **TaskList sweep at end-of-session per Rule 26:** 8 session tasks tracked + completed (drift check + go-ahead; rebase workflow-2; force-push; ff-merge + push; build + zip extension; P-9 verify; P-10 verify; end-of-session doc batch). Zero `DEFERRED:`-prefixed tasks at any point.

- **Cross-references:** ROADMAP.md header + Active Tools W#2 row Last Session + (a.7) DONE + (a.8) RECOMMENDED-NEXT + W#2 polish backlog header re-confirm + "Stays open" line drops P-2; CHAT_REGISTRY.md 2026-05-10-d row + Last-updated-in-session line; DOCUMENT_MANIFEST.md header + per-doc flags; COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md "Polish session #8" header marked ✅ COMPLETE 2026-05-10-d + P-9 + P-10 sub-tables get re-confirm annotations + P-2 sub-table updated to fully-verified; commits `d86be9f` rebased polish session #9 doc-batch (already pushed to origin/main mid-session per Rule 9 approval) + this end-of-session doc-batch; `plos-extension-2026-05-10-d-w2-deploy-3.zip` at repo root (gitignored build artifact for director sideload).

- **Branch implications:** all session work on `main` (the deploy branch). W#2 branch was rebased + force-pushed to align with main; main fast-forwarded to absorb the rebased commit. After this session: W#2 = main + 0 (W#2 fully caught up since the merge brought everything onto main). Next W#2 session will start clean from `main`'s state but MUST run `git merge --ff-only origin/main` immediately after `git checkout workflow-2-competition-scraping && git pull --rebase origin workflow-2-competition-scraping` to absorb today's `d86be9f` deploy doc-batch BEFORE adding new commits — closes the recurring divergence gap manually. End-of-session doc-batch commit also lands on `main`. Push pending Rule 9 approval — doc-only push triggers Vercel rebuild but contains zero user-visible code changes.

---

### 2026-05-10-e — W#2 polish session #10 — P-3 broader scope (selectedProjectId + selectedPlatform server-side persistence) ✅ SHIPPED at code level on `workflow-2-competition-scraping`

**2026-05-10-e — session_2026-05-10-e_w2-polish-session-10-p3-broader-scope-server-side (Claude Code, twenty-second W#2 session — code commit `49d396e` pushed to `workflow-2-competition-scraping`; W#2 → main merge + cross-device browser-verify on vklf.com pending future deploy session)**

- **Director's directive (initial — from launch prompt):** *"W#2 polish session #10 — implement remaining P-3 broader scope (selectedProjectId + selectedPlatform server-side persistence) per ROADMAP polish backlog P-3 entry 'REMAINING P-3 scope (open for future session)' + ROADMAP Active Tools W#2 row (a.6) standing item + director's standing principle 'no matter where the user logs in, they can pick up where they left off' captured 2026-05-08-c. Schema-change-in-flight session — flips flag Yes during build then back to No after `prisma db push` lands. Mandatory first action: Rule 18 mid-build directive Read-It-Back to surface the schema-shape decision (single `UserExtensionState` table with two scalar columns vs. two separate tables vs. JSON column) BEFORE coding."*

- **Schema-shape Read-It-Back at drift check (Rule 18, mandatory before any code):** Claude surfaced THREE storage options with full per-option context plus a fourth-ish semantic-change option (per-project last-platform memory) flagged in the prose:
  - **Option 1** — single new `UserExtensionState` record-type with two scalar columns per user (RECOMMENDED). Preserves today's chrome.storage.local behavior 1:1 — switching projects still clears platform. Cross-device-restore: pick Project + Platform on laptop 1, sign in on laptop 2, same picks already selected. Smallest blast radius; mirrors last week's Highlight Terms decision (dedicated record-type over generic `UserPreference` bucket).
  - **Option 2** — two record-types (one for last-picked Project per user; second per-(user, project) for last-picked Platform). Richer behavior: each project remembers its own last-picked platform; switching to Project A restores Amazon, switching to B restores Walmart, switching back to A restores Amazon. **Behavior CHANGE** from today's "clear platform on project switch."
  - **Option 3** — one packed-together JSON blob column. Flexible but harder to query / type-enforce / evolve. Rejected for similar reasons in last week's Highlight Terms decision (Shape B).
  - **Option 4 (escape hatch)** — "I have a question first that I need clarified."
  - Rationale for recommending Option 1 over Option 2: launch prompt's literal scope was "preserve today's selectedProjectId + selectedPlatform globally" — Option 2's per-project semantic was distinct from "move today's storage to server." If director wanted the richer UX, that should be a deliberate decision not smuggled into a storage move. **Director picked Option 1** via Rule 14f forced-picker.

- **Implementation-plan Read-It-Back at drift check (Rule 18, second mandatory step):** Claude wrote the full plan in plain language covering 9 sections:
  1. New `UserExtensionState` record-type schema (`id @default(uuid)` + `userId @unique` + `selectedProjectId String?` + `selectedPlatform String?` + `updatedAt @updatedAt` + `@@index([userId])`).
  2. New API endpoint `/api/extension-state` (GET + PUT + OPTIONS) — top-level user-scoped (NOT under `/api/projects/[projectId]/extension-state` because selectedProjectId IS the projectId; matches existing `/api/user-preferences/[key]` pattern). `verifyAuth` (NOT `verifyProjectAuth`). Server enforces refined "switching project clears platform" invariant on PUT (see Rule-15 autonomous picks below for the refinement). Stale-pointer cleanup on GET (silently returns null for selectedProjectId if the project was deleted). Project-ownership double-check on PUT for non-null selectedProjectId.
  3. New shared types in `src/lib/shared-types/competition-scraping.ts` (ExtensionStateDto + GetExtensionStateResponse + ReplaceExtensionStateRequest + ReplaceExtensionStateResponse).
  4. New `extensions/competition-scraping/src/lib/extension-state-sync.ts` orchestrator module mirroring the highlight-terms-sync.ts pattern — DI seam, `loadExtensionState` (server-first + cache-fallback + one-time auto-migrate), `saveExtensionState` (server-first then mirror to cache).
  5. Extension popup `App.tsx` switch from direct `getSelectedProjectId/Platform` reads to `loadExtensionState`; from direct `setSelectedProject/Platform` writes to `saveExtensionState`. Optimistic update + rollback on failure pattern.
  6. **Content-script orchestrator UNCHANGED** — content scripts can't reach vklf.com directly per CORS allowlist (`chrome-extension://*` only); the api-bridge is reserved for URL-recognition flows. The mirror-cache pattern is what makes this work — popup writes server first, then mirrors locally; orchestrator reads the mirror; `chrome.storage.onChanged` fires when popup edits land.
  7. New extStateSyncWarning + extStateSaveError UI surfaces above the picker pair in popup (matches last week's Highlight Terms pattern).
  8. Verification surface: extension compile + tests + build + eslint; root tsc + tests + build + eslint baseline parity.
  9. Cross-device verification path deferred to next W#2 → main deploy session (the canonical proof of correctness — same shape as P-3 narrowed Highlight Terms 2026-05-10-b).
  Director approved + granted standing-approvals for both push-when-clean and immediate `prisma db push` via three Rule 14f forced-pickers.

- **Rule-15 autonomous picks (no user-visible difference):**
  - **Auth helper = `verifyAuth` (NOT `verifyProjectAuth`).** Extension state is user-scoped; selectedProjectId IS itself a projectId so there's no parent project for it. When the request body's selectedProjectId is non-null, the API additionally verifies the user owns that project — defense-in-depth against malicious or buggy clients saving someone else's id.
  - **API path = `/api/extension-state` (top-level, NOT under `/api/projects/[projectId]/...`).** Matches existing `/api/user-preferences/[key]` pattern; cleaner data model (the parent path can't be a projectId because the value IS the projectId).
  - **PUT semantics over PATCH:** body always includes both fields explicitly (null = clear). Mirrors last week's Highlight Terms PUT-replace-whole-state pattern.
  - **Server-side refined "switching project clears platform" invariant.** Initial draft cleared platform whenever prior projectId differed from incoming. This was too aggressive — it broke the migration case (server empty + cache has both → "incoming differs from prior null" → clear → migration would lose platform). Refined rule: clear platform only when (a) incoming projectId is null, OR (b) prior projectId is non-null AND differs from incoming. Auto-migration case preserved (prior is null, so no "switch" to trigger clear). Caught by the auto-migration unit test on first `npm test` run; refined route + sync helper docstring + test fake server in same session before commit. Same end-to-end semantics as today's chrome.storage.local rule (`popup-state.ts:setSelectedProject` clears platform when prior is non-null AND different).
  - **Sync-helper dependency-injection seam (`ExtensionStateSyncDeps`).** Same pattern as `HighlightTermsSyncDeps` — orchestration logic testable without mocking Supabase auth + fetch + chrome.storage.local globals.
  - **Mirror-cache I/O as separate functions on popup-state.ts (`getExtensionStateCache` + `setExtensionStateCache`).** Writes both keys directly without re-applying the project-switch-clear logic — server already applied the canonical invariant; the cache mirror writes the canonical post-write state. Existing `setSelectedProject` / `setSelectedPlatform` retained (still useful as a local-write API surface, e.g. for offline fallback paths).
  - **Optimistic update + rollback on save failure in popup.** Mirrors last week's Highlight Terms pattern. State updates immediately on user click; PUT fires; on success state advances to server's canonical view (server may apply the invariant); on failure state rolls back to prior + inline error renders.
  - **Two distinct UI surfaces above the picker pair:** extStateSyncWarning (load-fallback informational; muted-help styling) + extStateSaveError (save-failure alert; error styling). Two distinct surfaces because they cover different failure modes (load offline vs. save offline) and clearing one shouldn't auto-clear the other. Successful save clears stale sync-warning since a successful PUT proves the server is reachable.

- **What was decided + shipped:** 8 files changed (+1092/-28); single commit `49d396e` on `workflow-2-competition-scraping`. New: `prisma/schema.prisma` adds UserExtensionState model; `src/app/api/extension-state/route.ts` (new GET + PUT + OPTIONS); `src/lib/shared-types/competition-scraping.ts` adds ExtensionStateDto + GetExtensionStateResponse + ReplaceExtensionStateRequest + ReplaceExtensionStateResponse; `extensions/competition-scraping/src/lib/api-client.ts` adds getExtensionState + replaceExtensionState; `extensions/competition-scraping/src/lib/extension-state-sync.ts` (new orchestrator with DI seam); `extensions/competition-scraping/src/lib/extension-state-sync.test.ts` (13 new tests). Modified: `extensions/competition-scraping/src/entrypoints/popup/App.tsx` (sync helpers wired + new UI surfaces); `extensions/competition-scraping/src/lib/popup-state.ts` (header docstring + new mirror-cache I/O functions).

- **Schema push:** `npx prisma db push` succeeded against prod in 1.16s (additive — new table only; no existing table touched). Schema-change-in-flight flag flipped Yes during build, back to No after push completed. PLOS uses one shared Supabase DB for dev + prod, so the new table landed in the production DB at push time. Safe — additive change; pre-broader-P-3 code on main simply doesn't read/write the new table; the new code uses it only after W#2 → main merge ships.

- **Verification scoreboard:**
  - Extension `npm run compile` clean (zero errors).
  - Extension `npm test`: **233/233 pass** (was 220/220 — 13 new sync tests added).
  - Extension `npm run build`: clean; **641.42 kB total** (popup-DLEZzAlj.js 404.28 kB; background.js 202.26 kB; content.js 30.16 kB; popup-D_aALNcA.css 3.58 kB).
  - Extension `npx eslint extensions/competition-scraping/src` (run from root): **clean — zero errors / zero warnings.**
  - Root `npx tsc --noEmit`: clean.
  - Root `npm run build`: clean — **51 routes** (was 50; new `/api/extension-state`).
  - Root `node --test --experimental-strip-types $(find src/lib -name '*.test.ts')`: **393/393 pass** — exact baseline parity.
  - Root `npx eslint src`: **52 problems (13 errors, 39 warnings)** — exact baseline parity (one transient `prefer-const` error from my route fixed within the same session before commit).

- **Browser verification:** NOT YET — code lives on `workflow-2-competition-scraping` only; not on `main`; not on vklf.com. Director will walk through after a future W#2 → main deploy session per (a.9) RECOMMENDED-NEXT in the W#2 row Next Session cell. Verification path when it happens (cross-device proof of correctness — same shape as P-3 narrowed Highlight Terms 2026-05-10-b): (a) install/reload extension on laptop 1; (b) sign in; (c) pick Project + Platform; (d) close popup; (e) sign in from a different Chrome profile / different laptop; (f) confirm same Project + Platform appear already-selected (the canonical proof of server-side persistence).

- **Multi-workflow per Rule 25:** Pull-rebase clean at session start (workflow-2 branch up to date with origin). Schema-change-in-flight stayed "No" both rows entering session; flipped W#2's to "Yes" at start of `prisma db push` step, back to "No" after push succeeded. No parallel chat. W#1 row untouched per Rule 3 ownership; zero cross-workflow edits. Pre-commit pull-rebase: workflow-2 branch had no remote new commits (origin was 0 ahead) — no rebase needed. The pre-existing 1-commit-ahead state from yesterday's `07abf09` (which lives on `main`, not `workflow-2`; the branches were not in true ahead-state) cleared up at push time as branch caught up.

- **TaskList sweep at end-of-session per Rule 26:** 14 session tasks tracked + completed (4 main-session: drift check + Read-It-Back + implement + end-of-session doc batch; 10 implementation sub-tasks: prisma schema edit + db push + shared types + API route + api-client functions + sync helper + popup wiring + popup-state docstring + verification + commit-push). **Zero `DEFERRED:`-prefixed tasks at any point.** Out-of-scope items declared explicitly in the implementation Read-It-Back (per-project last-platform memory; FK-declared relations; additional state items beyond the two named; live-updating popup state when state changes from a different device; richer audit/timestamp columns) were **not deferred** — director didn't want them in scope today and they're not load-bearing for the broader-P-3 polish goal.

- **Affected sections:** §A.7 Module 1 (URL capture flow + Project + Platform pickers in popup) — the picker pair now persists server-side; cross-device + cross-Chrome-profile behavior is now "your last picks come with you." §A is frozen per Rule 18; this §B entry serves as the operational-evolution log. **NEW data-flow surface — server-authoritative extension state storage:** popup writes server first, then mirrors to chrome.storage.local; content-script orchestrator reads chrome.storage.local on every page load (its mode of operation unchanged from before P-3 broader). Affects §A.12 Data persistence (`selectedProjectId` + `selectedPlatform` in chrome.storage.local were authoritative; now per-installation cache mirrors; PLOS DB `UserExtensionState` is authoritative).

- **Cross-references:** `prisma/schema.prisma` UserExtensionState model; `src/app/api/extension-state/route.ts` (GET + PUT + OPTIONS); `src/lib/shared-types/competition-scraping.ts` (ExtensionStateDto + GetExtensionStateResponse + ReplaceExtensionStateRequest + ReplaceExtensionStateResponse); `extensions/competition-scraping/src/lib/extension-state-sync.ts` + `.test.ts`; `extensions/competition-scraping/src/lib/api-client.ts` (getExtensionState + replaceExtensionState); `extensions/competition-scraping/src/entrypoints/popup/App.tsx` SetupScreen (load/save wiring + sync-warning + save-error UI); `extensions/competition-scraping/src/lib/popup-state.ts` (mirror-cache role documented + new getExtensionStateCache + setExtensionStateCache); ROADMAP.md W#2 polish backlog P-3 entry status update + Active Tools (a.6) flipped to ✅ DONE + new (a.9) RECOMMENDED-NEXT for the W#2 → main deploy session; CHAT_REGISTRY.md 2026-05-10-e row.

- **Branch implications:** Code commit `49d396e` pushed to `workflow-2-competition-scraping` per session-start standing approval. **NOT on `main` yet; NOT deployed to vklf.com.** Director's call when to schedule the W#2 → main merge to deploy. Until then, vklf.com runs the prior code (P-3 narrowed Highlight Terms + the prior polish + popover fix from 2026-05-09-b); the new `UserExtensionState` table sits idle in prod (no writers / no readers from main code). End-of-session doc-batch commit lands on `workflow-2-competition-scraping` (covers session work that happened entirely on this branch). Push of doc-batch commit pending Rule 9 approval — push to W#2 branch does NOT deploy vklf.com regardless. Per the recurring divergence pattern from sessions #2 + #3, the next W#2 → main deploy session MUST run `git fetch origin && git log main..origin/workflow-2-competition-scraping --oneline` first to confirm exactly which commits will flow onto main, then ff-only merge if main is clean ahead of W#2; otherwise rebase + force-push pattern (same reconciliation as 2026-05-10-c session #2 + 2026-05-10-d session #3).

---

### 2026-05-10-f — W#2 → main deploy session #4 (P-3 broader scope ✅ DEPLOYED) + P-1 silent token refresh ✅ SHIPPED at code level on `workflow-2-competition-scraping`

**Session:** session_2026-05-10-f_w2-main-deploy-session-4-and-p-1-shipped (Claude Code; started on `main` for the deploy, switched to `workflow-2-competition-scraping` mid-session for the P-1 ship). Seventy-third Claude Code session.

**Two-phase session.**

**Phase 1 — Deploy of P-3 broader scope.** ff-only merge of `workflow-2-competition-scraping` commits `49d396e` (P-3 broader scope code from session #10) + `cd637f7` (session #10 doc-batch) onto `main` succeeded clean — `main` was at `07abf09` and W#2 had advanced cleanly past it without divergence (no rebase or force-push needed; same shape as 2026-05-10-b deploy session #1). Pushed to `origin/main` → Vercel auto-redeployed in ~60-90s. Verified `/api/extension-state` route is live by curl: returned 401 with `{"error":"Missing or invalid Authorization header"}` confirming the route exists and the auth-gate works (4xx-without-deployed-route would be 404; production-redirect from apex `vklf.com` → `www.vklf.com` is at the Vercel edge level). Fresh extension build (`extensions/competition-scraping/`) packaged at `plos-extension-2026-05-10-e-w2-deploy-4.zip` (174 KB; gitignored) for sideload at the next verification session.

**P3B-1..P3B-11 cross-device browser verification of P-3 broader scope DEFERRED mid-session at director's request.** Director said *"I want to defer all these tests for now. What should we work on next?"* after Claude prepared the full P3B sub-table walkthrough. Captured per Rule 14e + Rule 26: destination is the existing `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` "Polish session #10" sub-table (still PENDING) + ROADMAP Active Tools W#2 row (a.9) flipped to ✅ DEPLOY DONE + VERIFICATION DEFERRED + new (a.10) RECOMMENDED-NEXT for combined deploy session #5 (brings P-1 to main) + walk through deferred P3B verification simultaneously. TaskCreate `DEFERRED:` task created mid-session, closed at end-of-session when destination annotations landed.

**Phase 2 — P-1 silent token refresh shipped.** After deferral, director asked *"What should we work on next?"* and Claude offered a Rule 14f forced-picker with three real options (P-1 silent token refresh on W#2 branch / W#2 doc cleanup / wrap session early) plus the escape hatch. Director picked P-1 — the only open W#2 polish item since 2026-05-08-b. Branch-switched from `main` to `workflow-2-competition-scraping` per CORRECTIONS_LOG 2026-05-10-c entry #4 cheat-sheet (a). Main and W#2 were at the same commit (`cd637f7`) so the branch switch was a clean checkout — no rebase needed.

**P-1 Read-It-Back per Rule 18:** Claude wrote the full implementation plan in plain language covering: where the fix lives (single file `src/lib/authFetch.ts` — 28 LOC → ~70 LOC; one wrapper used by 76 call sites across 14 files: `/projects`, project detail, keyword-clustering, competition-scraping, AdminNotes, all the `useKeywords`/`useCanvas` hooks); the new behavior (read session unchanged → first fetch unchanged → if 401: silently call `supabase.auth.refreshSession()` → if refresh succeeded with new access_token: rebuild headers + re-fire fetch ONCE → if refresh failed: see failure-path question); what's NOT changing (Supabase client setup; the 76 call sites; non-401 paths; no-session-at-all throw); test coverage (new `src/lib/authFetch.test.ts` with 7 cases via `node:test` + `node:assert/strict`); verification gates; commit + push plan; Rule 15 autonomous picks (refresh-failure due to network-offline gets same treatment as expired refresh token).

**Failure-path forced-picker per Rule 14f:** Director picked **Option (a) — return the 401 as-is, no redirect** when refresh ALSO fails (the rare 1-week-away case). When refresh fails, the wrapper just returns the original 401 response to the caller; the caller's existing error handler surfaces the familiar "Could not load Projects (401): Invalid or expired token" message in the UI. Rationale: zero changes to any of the 76 call sites; easy to test; no global navigation side-effect from a low-level fetch wrapper. The alternative (hard-redirect to sign-in via `window.location.replace('/')`) was offered but not picked because of the global-navigation-side-effect concern.

**Implementation:** `src/lib/authFetch.ts` refactored to a tested factory shape — new `makeAuthFetch({supabase, fetchFn})` factory accepts deps for unit-test substitution; production export `authFetch` is bound via lazy initialization to a Supabase singleton + global `fetch`. **Lazy init was required** because the Node test runner imports `authFetch.ts` without `NEXT_PUBLIC_SUPABASE_URL` set in env, and an eager `createClient()` at module scope crashed the test process on first attempt. Single commit `d715cde` on `workflow-2-competition-scraping`; pushed to origin (does NOT redeploy vklf.com — only push-to-main does).

**Verification scoreboard:** `node --test --experimental-strip-types $(find src/lib -name '*.test.ts')` reports **400/400 src/lib tests pass** (was 393; +7 authFetch tests). `npx tsc --noEmit` clean. `npm run build` clean (51 routes; same as session #10). `npx eslint src/lib/authFetch.ts src/lib/authFetch.test.ts` clean (zero errors / zero warnings on the changed files). Project-wide `npx eslint src` reports **52 problems (13 errors, 39 warnings)** — exact baseline parity with session #10. **Browser verification:** NOT YET — code on `workflow-2-competition-scraping` only; not on `main`; not on vklf.com. Director will discover the fix passively the next time they come back to vklf.com after >1 hour, OR can verify via the next deploy session #5 (per (a.10) RECOMMENDED-NEXT).

**Operational note (informational):** the extension `npm run build` (`wxt build`) ran for ~9 minutes during the deploy phase before being killed — chrome-mv3 output files were complete after ~10s with sizes matching expected 641 kB ext bundle from session #10, but the wxt parent process never exited cleanly. Force-kill produced the same artifacts. Captured in `CORRECTIONS_LOG.md` 2026-05-10-f as INFORMATIONAL.

**Multi-Workflow per Rule 25:** `git fetch origin` + `git pull --rebase` clean at session start AND before each commit. Branch-switch from `main` → `workflow-2-competition-scraping` happened only AFTER deploy phase + verification defer + director's pivot decision; W#1 row untouched per Rule 3 ownership; no parallel chat; schema-change-in-flight stays "No" — today ships pure code at the wrapper layer with no schema changes (the UserExtensionState table from session #10 remained in prod unchanged).

**TaskList sweep at end-of-session per Rule 26:** 11 tasks tracked through the session. 1 `DEFERRED:` task created mid-session for the P3B verification, closed at end-of-session when destination annotations landed. **Zero open `DEFERRED:` tasks** at end-of-session per Rule 26.

**Cross-references:** `src/lib/authFetch.ts` (the factory + production export); `src/lib/authFetch.test.ts` (7 tests); ROADMAP Active Tools W#2 row Last Session 2026-05-10-f entry + (a.9)/(a.10) Next Session items; ROADMAP polish backlog P-1 entry (flipped to ✅ SHIPPED at code level); `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` Polish session #10 sub-table (deploy-#4 deferred-verification annotation) + new "Polish session #11" P-1 section; CORRECTIONS_LOG 2026-05-10-f INFORMATIONAL entry on extension `wxt build` 9-min hang.

---

**2026-05-11-b — session_2026-05-11-b_w2-extension-session-4-module-2-text-capture**

**Session:** session_2026-05-11-b_w2-extension-session-4-module-2-text-capture (Claude Code; on `workflow-2-competition-scraping`). Seventy-fifth Claude Code session.

**Director's directive (initial — from launch prompt):** today's task was the P3B-1..P3B-11 cross-device verification of P-3 broader scope. Director pivoted mid-drift-check to a coding-with-deferred-testing mode: *"Rather than perform testing. Just tell me what testing needs to be performed in a general sense. I may defer the testing till the very end and just want you to keep coding and updating the code while giving me the option to test or defer the test till the end and keep coding"*. Verification queue tally surfaced (P3B + P1V); director picked Module 2 text-capture build as the next coding item after Claude's mistaken P-6 recommendation was corrected (P-6 shipped 2026-05-09-b).

**Pre-code mistake captured (Rule 10 + Rule 24):** Claude recommended P-6 (Sponsored Ad checkbox) as the next-coding item without first verifying P-6 was actually open. Single-grep of `prisma/schema.prisma` + `url-add-form.ts` would have surfaced that `isSponsoredAd` + the checkbox UI were both already in place from 2026-05-09-b. Logged as CORRECTIONS_LOG 2026-05-11-b entry (synthesis-from-stale-grep failure mode — same root as 2026-04-27 Rule 24 origin entry).

**Rule 14f sub-decisions before any code (text-capture gesture + tags input):**

1. **Text-add gesture shape** — director picked **Option A "right-click context-menu only"** (recommended).
   - Option A "right-click context-menu only" (RECOMMENDED + chosen) — single discoverable surface for new workers; zero key-chord collision risk with host-page bindings (Amazon/Walmart each bind their own); ship surface area minimized.
   - Option B "keyboard shortcut only" — fast for power users but undiscoverable + risk of collision with host-page bindings.
   - Option C "both" — double the surface to test/maintain.
   - Reversible: a keyboard shortcut can be added additively later without breaking the menu path.

2. **Tags input shape** — director picked **Option A "structured chip-list"** (recommended).
   - Option A "structured chip-list" (RECOMMENDED + chosen) — Enter or comma adds a chip; X-on-chip removes; case-insensitive dedup with first-seen-casing preserved; clear visual state vs. ambiguous "is the comma part of this tag or a separator?"
   - Option B "free-text comma-separated" — smaller code surface but ambiguous + less clear visual state.
   - Reversible at any time.

**Scope split explicitly captured (mid-build directive Read-It-Back, Rule 18):** Module 2 at full scope is text capture + image capture + region-screenshot + image upload — multi-hour build. Today's session ships text-capture ONLY (both gestures — highlight-and-add + paste-into-extension). Image-capture path (right-click "Save to PLOS — Image" + two-phase signed-URL upload) + region-screenshot mode deferred to session 5. Rationale per `STACK_DECISIONS.md` §11 line 559 — the original plan had separate Module-1-capture / Module-2-capture / image-upload / offline-queue / polish sessions; we're following that structure.

**Rule 15 autonomous picks noted in commit:**
- The text-capture form's URL picker pre-selects the saved-URL row matching the current page (via `pickInitialUrl`) when one is recognized. Falls back to a "Pick a saved URL…" placeholder. Pattern matches the URL-add form's "trigger-derived initial value" UX from session 3.
- `validateCapturedTextDraft` requires non-empty `contentCategory` at the FORM level (server allows null). Rationale: every captured row is categorized per §A.7 reading + clean filtering on PLOS-side. Server's loose acceptance preserved for future clients (offline queue, manual API callers).
- The popup paste flow lives in the same SetupScreen as Highlight Terms — gated on Project + Platform both being picked. Empty-state rendered when no saved URLs for the current platform yet.
- Backdrop click + Esc + Cancel all close the content-script form without saving — same UX as the URL-add form.

**Files changed this session (extension only — no schema, no API, no Next.js routes):**
- NEW `extensions/competition-scraping/src/lib/captured-text-validation.ts` (~140 LOC).
- NEW `extensions/competition-scraping/src/lib/captured-text-validation.test.ts` (~180 LOC; **19 tests**).
- NEW `extensions/competition-scraping/src/lib/content-script/text-capture-form.ts` (~370 LOC; content-script overlay form).
- NEW `extensions/competition-scraping/src/entrypoints/popup/components/CapturedTextPasteForm.tsx` (~230 LOC; React popup paste flow).
- Modified `extensions/competition-scraping/src/lib/api-client.ts` — `createCapturedText`, `listVocabularyEntries`, `createVocabularyEntry`.
- Modified `extensions/competition-scraping/src/lib/content-script/api-bridge.ts` — same 3 functions via background-proxy for content-script use.
- Modified `extensions/competition-scraping/src/lib/content-script/messaging.ts` — new `open-text-capture-form` content-script push message + 3 new `BackgroundRequest` variants (`create-captured-text`, `list-vocabulary`, `create-vocabulary-entry`).
- Modified `extensions/competition-scraping/src/lib/content-script/orchestrator.ts` — listens for `open-text-capture-form`, hands off to the new form.
- Modified `extensions/competition-scraping/src/entrypoints/background.ts` — second context-menu (`'Add to PLOS — Captured Text'` on `contexts: ['selection']`) + handlers for the 3 new request kinds.
- Modified `extensions/competition-scraping/src/lib/content-script/styles.ts` — `.plos-cs-form-select`, `.plos-cs-form-status`, `.plos-cs-form-inline-add`, `.plos-cs-chip-row`, `.plos-cs-chip`, `.plos-cs-chip-remove`.
- Modified `extensions/competition-scraping/src/entrypoints/popup/App.tsx` — renders `<CapturedTextPasteForm>` below Highlight Terms when Project + Platform picked.
- Modified `extensions/competition-scraping/src/entrypoints/popup/style.css` — paste-form section + chip styles.

**API surface used (server-side already exists; no server work this session):**
- `POST /api/projects/[projectId]/competition-scraping/urls/[urlId]/text` (API-routes session 2, 2026-05-07). Idempotent on `clientId`.
- `GET /api/projects/[projectId]/vocabulary?type=content-category` (2026-05-07).
- `POST /api/projects/[projectId]/vocabulary` (2026-05-07; upsert).

**Verification scoreboard:**
- Extension `npx tsc --noEmit` clean.
- Extension `npm test` reports **252/252 pass** (was 233; +19 captured-text-validation tests).
- Extension `npx eslint src` clean — 0 errors / 0 warnings.
- Extension `npx wxt build` — artifacts written successfully at `.output/chrome-mv3/`; parent process hangs at exit per known issue (CORRECTIONS_LOG 2026-05-10-f INFORMATIONAL). Workaround: `pkill -f wxt` after seeing `.output/` populated; artifacts are intact.
- Root `npx tsc --noEmit` clean.
- Root `npm run build` clean (51 routes — exact baseline parity; no new routes since session #11).
- Root `node --test --experimental-strip-types src/lib/**/*.test.ts` reports **400/400 pass** — baseline parity (no root code changes).
- Root `npx eslint src` reports 52 problems (13 errors, 39 warnings) — exact baseline parity.

**Multi-Workflow per Rule 25:** `git fetch origin` + `git pull --rebase origin workflow-2-competition-scraping` clean at session start (`workflow-2-competition-scraping` at `daa4ca8`; `origin/main` at `9a1aacd` from deploy session #5 earlier today). This session's commit lands on `workflow-2-competition-scraping`; doc-only flow-through to `main` happens at the next deploy session (which will also carry the image-capture session 5 code). Per CORRECTIONS_LOG 2026-05-10-c entry #1 PROCESS-quality finding, `main` has advanced 1 commit past this branch's last point — that lesson recommends pulling main into the feature branch before adding new commits when main has advanced. This session's commit DOES advance the feature branch without first absorbing main's doc-only commit — flagged at session start in the drift check; director acknowledged via the "Wrap session 4" pick. The next deploy session will rebase or ff-merge per the now-standard pattern (CORRECTIONS_LOG 2026-05-10-c entries #1 + #4). W#1 row untouched per Rule 3 ownership. Schema-change-in-flight stays No (today is pure code at the extension layer; no DB schema, no API surface change).

**TaskList sweep per Rule 26:** 4 session tasks tracked + completed (start-of-session sequence; P3B walkthrough — set aside in favor of coding-with-deferred-testing per director's pivot; Module 2 text-capture build; end-of-session doc batch). Zero `DEFERRED:` (Rule 26 prefix) tasks at any point. Task #2 (P3B-1..P3B-11 verification) left pending across sessions per the standing deferral — destination doc entry (PENDING sub-table in VERIFICATION_BACKLOG.md Polish session #10) already exists from prior sessions.

**Cross-references:** `extensions/competition-scraping/src/lib/captured-text-validation.ts` + `.test.ts`; `extensions/competition-scraping/src/lib/content-script/text-capture-form.ts`; `extensions/competition-scraping/src/entrypoints/popup/components/CapturedTextPasteForm.tsx`; `extensions/competition-scraping/src/entrypoints/background.ts` (new context-menu); `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` new "Extension build — session 4" S4-A + S4-B + S4-C walkthrough sections; ROADMAP Active Tools W#2 row Last Session 2026-05-11-b entry + new (a.12) RECOMMENDED-NEXT for session 5 image-capture; CORRECTIONS_LOG 2026-05-11-b entry on P-6 stale-grep-synthesis slip.

---

**2026-05-11-b-addendum — Forward directive captured for upcoming sessions (popup two-tab restructure + URL viewer)**

**Captured:** end of `session_2026-05-11-b_w2-extension-session-4-module-2-text-capture` (Claude Code; on `workflow-2-competition-scraping`).

**Context:** at end-of-session, after session 4 text-capture shipped + the doc batch committed, director adjusted the forward plan via the personalized-handoff conversation. Two future-session items captured here so the next session (and the one after) sees them at session-start docs read per Rule 21 pre-interview directive scan.

**Forward directive A — verification-first next session (Path A picked via Rule 14f).**

The next session is a pure browser-verification session on vklf.com covering ALL deferred check sub-tables in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md`:
- **P3B-1..P3B-11** — P-3 broader scope cross-device sign-in test (Polish session #10 sub-table, PENDING since 2026-05-10-e, deferred twice).
- **P1V-1..P1V-3** — P-1 silent token refresh (Polish session #11 sub-table, PENDING since 2026-05-10-f; partly passive).
- **S4-A + S4-B + S4-C** — Extension build session 4 Module 2 text-capture walkthroughs (new section as of this commit).

**Prerequisite:** a fresh extension zip built from commit `b8423ab` (or later if more code has landed) — the existing `plos-extension-2026-05-11-w2-deploy-5.zip` at repo root predates session 4 and lacks the text-capture code. Build via `cd extensions/competition-scraping && npm run build` (apply the wxt-process-hangs-but-artifacts-are-written workaround from CORRECTIONS_LOG 2026-05-10-f INFORMATIONAL — `pkill -f wxt` once `.output/chrome-mv3/` is populated). Zip the artifacts into `plos-extension-2026-05-12-<slug>.zip` at repo root.

**Branch:** verification-only work for W#k (k ≥ 2) belongs on the W#k feature branch per CORRECTIONS_LOG 2026-05-10-c entry #4 cheat-sheet (c) — `workflow-2-competition-scraping`.

**Forward directive B — popup two-tab restructure + URL viewer (session AFTER verification).**

After the verification session lands clean, the session after that adds a new user-facing feature in the extension popup. Captured here so the build session has the spec ready.

**Spec:**

- The popup gets a **two-tab navigation** at the top, switching between two surfaces:
  - **Tab 1 — "Identify Competition"** — contains the existing popup surfaces moved here: ProjectPicker dropdown, PlatformPicker dropdown, HighlightTermsManager (with its color-swatch UI + save flow). No behavior change; just relocation into the tab container.
  - **Tab 2 — "Capture Text & Images"** — contains two stacked surfaces:
    1. **URL viewer** — a scrollable list of every saved CompetitorUrl for the current Project, **across ALL platforms** (director-picked Option A via Rule 14f at session 2026-05-11-b end). Each row shows: URL, platform (label or icon), competition category, product name, brand name, sponsored-ad badge. Clicking the URL opens that page in a new browser tab (`chrome.tabs.create({url, active: true})` or anchor with `target="_blank"`). The list is scrollable for projects with many URLs; load via existing `listCompetitorUrls(projectId, null)` (null platform = all platforms — verify the api-client supports null; if not, add a passthrough).
    2. **Text capture paste form** — today's `<CapturedTextPasteForm>` MOVED here from its current location in App.tsx (currently below HighlightTermsManager).
  - Future: when Module 2 image capture ships (session 5), its popup-side surface (if any) also lives in Tab 2.

- **Active-session banner** — the existing "Capturing for [platform]" banner remains visible regardless of which tab is active (it's a top-level setup-state indicator, not tab content).

- **Tab navigation UX:**
  - Default open tab on popup-open = Tab 1 ("Identify Competition") — preserves today's behavior for muscle memory.
  - Tab pick persists in `chrome.storage.local` (one new state key `selectedPopupTab`) so re-opens after navigation return to the user's last-picked tab. NOT synced server-side (UI state only; no cross-device persistence needed per §A.7 storage taxonomy).
  - Tab switch is instant (React state) — no network call.

- **Edge cases to handle in the build:**
  - Tab 2's URL viewer renders an empty-state message ("No URLs captured yet for this Project — pick a platform on Tab 1 and use the "+ Add" button on a competitor page") when the project has zero URLs.
  - The text-capture paste form keeps its existing empty-state ("No saved [platform] URLs yet — capture one via '+ Add' first") when the user is on a platform with no saved URLs.
  - If the popup opens before Project is picked, Tab 2 should render a friendly "Pick a Project on the Identify Competition tab first" message — don't try to render the URL viewer with no projectId.

- **Out of scope for the first build pass** (defer if needed; capture as polish items if surfaced):
  - Per-column sort on the URL viewer table (added later if users want).
  - Per-row edit/delete from the popup (PLOS-side detail page is the canonical edit surface).
  - Filter by platform / category / sponsored-status in the popup (PLOS-side viewer has filters; popup keeps it simple for now).

**Code surfaces likely affected:**
- New: `extensions/competition-scraping/src/entrypoints/popup/components/PopupTabs.tsx` (tab navigation chrome).
- New: `extensions/competition-scraping/src/entrypoints/popup/components/CapturedUrlList.tsx` (URL viewer).
- New: `extensions/competition-scraping/src/lib/popup-state.ts` extended with `selectedPopupTab` storage key + helpers.
- Modified: `extensions/competition-scraping/src/entrypoints/popup/App.tsx` (move existing surfaces under Tab 1 + render Tab 2's surfaces; `<CapturedTextPasteForm>` relocated).
- Modified: `extensions/competition-scraping/src/entrypoints/popup/style.css` (tab strip styles + URL list table styles).
- Maybe: `extensions/competition-scraping/src/lib/api-client.ts` (confirm `listCompetitorUrls(projectId, null)` works; if not, extend or call without the platform filter).

**Verification surface for that build session:** new "Extension build — session 4b" (or "session N+M" depending on intervening sessions) section in `COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` with walkthrough steps for: tab switch persistence; URL list renders with all expected columns; click row → opens URL; empty-state renders correctly when project has no URLs; existing surfaces (Project / Platform / Highlight Terms / paste form) still work as before from inside their new tabs.

**Schema impact:** none. New feature is pure popup React + a new chrome.storage.local key. No schema change, no API surface change, no `prisma db push`.

**Branch:** code-build work for W#k (k ≥ 2) belongs on the W#k feature branch per CORRECTIONS_LOG 2026-05-10-c entry #4 cheat-sheet (a) — `workflow-2-competition-scraping`.

**Why this entry exists separately from today's main 2026-05-11-b §B entry:** today's main entry captures what SHIPPED this session (session 4 text-capture). This addendum captures forward directives for FUTURE sessions (verification + tabs feature). Future sessions' Rule 21 pre-interview directive scan will pick up this entry as the canonical source for the upcoming work's spec + sub-decisions.

---

END OF DOCUMENT
