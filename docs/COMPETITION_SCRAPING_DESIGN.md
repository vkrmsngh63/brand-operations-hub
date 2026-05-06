# COMPETITION SCRAPING & DEEP ANALYSIS — DESIGN DOC (Workflow #2)

**Workflow number:** W#2
**Workflow name:** Competition Scraping & Deep Analysis (🔍)
**Status:** 🔄 Design phase (this doc is the design-phase deliverable)
**Branch:** `workflow-2-competition-scraping`
**Created:** May 4, 2026
**Created in session:** session_2026-05-04_w2-workflow-requirements-interview (Claude Code)
**Last updated:** May 4, 2026 (W#2 Stack-and-Architecture session — first §B entry appended; all 13 §A.17 deferred questions RESOLVED via new Group B doc `COMPETITION_SCRAPING_STACK_DECISIONS.md`; §A remains frozen per Rule 18; schema-change-in-flight flag flipped to "Yes" at start of session per `MULTI_WORKFLOW_PROTOCOL.md` Rule 4)
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

END OF DOCUMENT
