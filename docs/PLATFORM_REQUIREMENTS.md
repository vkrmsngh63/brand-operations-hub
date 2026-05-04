# PLATFORM REQUIREMENTS
## Non-functional and platform-level requirements for the Product Launch Operating System (PLOS)

**Created:** April 17, 2026
**Created in chat:** https://claude.ai/chat/cc15409c-5000-4f4f-a5ce-a42784b5a94f
**Last updated:** May 4, 2026 (W#2 Workflow Requirements Interview Platform-Truths Audit per HANDOFF_PROTOCOL Rule 19 — director-approved batch of 7 additions: §1.4 per-workflow throughput-bottleneck recognition; §2.2.1 workflow-internal sub-scopes (W#2 platform sub-scope); §6 example updated for W#2 "always ready" + new §6.6 cross-workflow data permissions per-(producing-workflow, data-item, consuming-workflow) granularity; §8.4 Project-scoped shared vocabularies; §10.1 non-web-app clients (Chrome extension as first non-web client); §10.2 image-storage scale projections; §12.6 scaffold extension-points (always-visible deliverables, custom React content components, external-client companion pattern). All additive; no existing requirements removed or weakened. Modified on `workflow-2-competition-scraping` feature branch per MULTI_WORKFLOW_PROTOCOL Rule 3 — only W#2-relevant edits, no other workflow's owned sections touched.)
**Last updated in session:** session_2026-05-04_w2-workflow-requirements-interview (Claude Code)
**Previously updated:** April 17, 2026

**Purpose:** This document captures the **platform-level truths** that apply across all 14+ workflow tools — scale targets, user model, concurrency, review cycles, audit policy, infrastructure, and phasing. Every feature and workflow built on PLOS must be evaluated against these requirements.

**Why this doc exists:** Prior to the creation of this document, platform-level facts lived in the user's head and surfaced mid-build as corrections forcing rework. This document ensures every future Claude starts with the full scale and user-model context loaded — no future feature gets designed without it.

**Group:** A (always uploaded to every chat).

**Authority:** For any conflict between this doc and another doc on a platform-level requirement, **this doc wins**. Workflow-specific requirements live in each workflow's own design doc; platform-wide requirements live here.

---

## 1. Scale targets

### 1.1 Current operational scale (Phase 1 — admin-solo)
- **~50 Projects completed per week** by admin alone (single user)
- Each Project moves through **all 14+ workflows** within roughly one week of active processing
- Active in-flight Projects on the platform at any time: roughly **50–150** (50/week × 1–3 week backlog)

### 1.2 Target operational scale (Phase 3 — full worker ramp)
- **500 Projects completed per week** — completing entire 14-workflow cycles
- **~50 concurrent users** working on the platform alongside admin
- Active in-flight Projects on the platform at any time: **500–1,500** (500/week × 1–3 week backlog)

### 1.3 Headroom / aspirational scale (Phase 4 — scale hardening)
- Up to **5,000 Projects completed per week** (10× Phase 3)
- Worker count TBD at Phase 4 planning time (likely 100–500)
- Active in-flight Projects: 5,000–15,000 at any time
- At this scale, per-Project database rows become significant:
  - 5,000 Projects/week × 14 workflows = **70,000 new `ProjectWorkflow` rows per week**
  - Keyword volumes, canvas nodes, pathways etc. scale multiplicatively within that

### 1.4 Design implication
**No feature may be designed under the assumption that the platform serves a single user with a small Project count.** All UI patterns (lists, filters, navigation), all API patterns (pagination, search, bulk operations), all database patterns (indexes, query patterns) must be evaluated against Phase 3 scale at minimum, with Phase 4 as the stretch target.

Features where Phase 3/4 scale is not yet addressed should still be built, but must explicitly flag the scale gap as technical debt in `ROADMAP.md` and `PLATFORM_ARCHITECTURE.md §10`.

**Per-workflow throughput-bottleneck recognition (NEW 2026-05-04 — surfaced by W#2 design interview):**

The platform-wide Phase-3 target of 500 Projects/week assumes all 14 workflows can keep pace. Workflows that are LABOR-INTENSIVE PER PROJECT may bottleneck the pipeline below the platform target.

**Currently identified bottlenecks:**

- **W#2 Competition Scraping & Deep Analysis** — at director's expected throughput (~10 workers × 1 project/worker/day = ~70/week), W#2 is roughly 7× lower than the 500/week platform target. To match the platform target, W#2 would need ~70 workers, OR per-Project work would need to compress 7×, OR the platform-wide target accepts that some Projects skip W#2. Director-acknowledged tradeoff at the W#2 design interview; revisit at Phase 3 ramp time.

**Future workflows:** at each workflow's design interview, surface throughput-per-Project + worker-count-per-Project explicitly; if the resulting throughput-per-week is below the platform target, log here.

---

## 2. User model

### 2.1 User types

**Admin (currently: one person — the director).**
- Runs the entire platform during Phase 1 (solo throughput of 50 Projects/week)
- Grants per-user per-workflow per-project access to all other users (Phase 2+)
- Reviews all worker output (Phase 2+)
- Is the only user with platform-wide access during Phase 1
- Also actively performs workflow work personally (testing, quality oversight, direct production) — admin is NOT a pure orchestrator

**Workers (Phase 2+, up to ~50, ramping 5/week).**
- Contractors, freelancers, and in-house employees (mixed)
- Remote and globally distributed (likely)
- **Each worker specializes in specific workflow types** — not generalists
- Access is granted per (user, workflow, project) tuple — a worker with access to "Keyword Analysis for Project 237" does NOT automatically get access to "Keyword Analysis for Project 412" or to any other workflow on Project 237
- Workers do not see other workers' assignments or Projects they don't have access to

### 2.2 Assignment model (canonical — IMPORTANT)

Admin grants access using a **three-way assignment**: one row per (userId, workflow, projectId).

Example: User Sarah is granted access to Keyword Analysis on Projects {237, 412, 508}.
This is THREE assignment rows:
- (sarah, keyword-clustering, 237)
- (sarah, keyword-clustering, 412)
- (sarah, keyword-clustering, 508)

If Sarah is also assigned Keyword Analysis on Projects {901, 1003}, that's two more rows. If another worker Mike does Competition Scraping on the same Projects as Sarah, those are separate rows for Mike.

### 2.2.1 Workflow-internal sub-scopes (NEW 2026-05-04 — surfaced by W#2 design interview)

Some workflows partition their work along a sub-dimension that requires the assignment to expand beyond `(user × workflow × project)`. Workflows that need this declare it at design time.

**Current sub-scopes:**

- **W#2 Competition Scraping & Deep Analysis — sub-scope = `platform`.** Per-`(user × workflow × project × platform)` where `platform ∈ {Amazon, Ebay, Etsy, Walmart, GoogleShopping, GoogleAds, IndependentWebsites}`. Exactly one worker per `(project, platform)` — never two workers on the same platform within the same project. Enforced at the assignment table level.

**Implication:** the Phase-2 Assignment table needs an OPTIONAL `subScope` column (string, default null). Workflows that use a sub-scope populate it; workflows without one leave it null. Index: composite `(workflow, projectId, subScope)` for fast "is this slot taken" lookups.

**Future workflows:** at each workflow's design interview (Rule 18), Q8 Concurrency now asks "Does this workflow need a sub-scope dimension beyond `(user × workflow × project)`?" If yes, it's declared here.

### 2.3 Assignment mechanics (per admin's workflow)
- Admin assigns manually — no auto-assignment in initial design
- Admin assigns only when admin observes that a workflow is ready to be worked on (ready = upstream data dependencies satisfied — see §7 Workflow readiness)
- Multiple workers can be assigned to the **same (workflow, project)** simultaneously — concurrent collaboration is required (see §4)
- Workers can have multiple assignments at once (across different workflows and projects)

### 2.4 User roles (initial; will likely expand)
- `admin` — platform owner, grants access, reviews output, can do anything
- `worker` — scoped access only to assignments; cannot grant access to others; cannot see unassigned Projects

Additional roles (reviewer-only, auditor-only, etc.) may be introduced as the team structure matures.

### 2.5 Design implication
**Permissions are not an afterthought.** Every API endpoint, every page, every data query from Phase 2 onward must filter by the requesting user's assignments. Admin-wide queries are the exception, not the rule. This shapes database indexes (composite indexes on userId + workflow + projectId) and API design (filters baked into every list endpoint).

---

## 3. Concurrency

### 3.1 Concurrent users per (Project, workflow)

**Strict requirement for Keyword Clustering:** Up to **10–20 workers** may be assigned to the same Project's Keyword Clustering canvas simultaneously and expected to collaborate in real time. This is a confirmed eventual requirement, not speculation.

**Other workflows:** Concurrency requirements are decided per-workflow during that workflow's design interview (see §7 of `HANDOFF_PROTOCOL.md` and the Workflow Requirements Interview pattern). Not every workflow needs real-time collaboration. Some may be strict single-editor.

### 3.2 Concurrency strategies (reference)

When concurrency is required in a workflow, the strategy is chosen at workflow design time. Four patterns, in order of implementation complexity:

**Pattern A — Strict single-editor.**
Only one user can edit at a time. Other assigned users can view but not modify. Simplest to implement; suitable for workflows where multi-editing doesn't make sense.

**Pattern B — Last-write-wins.**
All assigned users can edit concurrently. When two edits collide, the last to reach the server overwrites the earlier. Simple to implement; acceptable for low-stakes data (e.g., canvas viewport state) but unacceptable for work content (risk of silently lost work).

**Pattern C — Pessimistic locking.**
When User A starts editing an entity, that entity is locked for others until A releases the lock. Prevents conflicts but creates queue-style bottlenecks. Rarely the right choice.

**Pattern D — Operational-transform / CRDT merge (Figma/Google Docs style).**
All edits are modeled as small composable operations. Concurrent edits merge automatically with well-defined rules. Highest implementation complexity; best user experience at high concurrency. Requires the data model to be structured as operations from the start — difficult to retrofit.

**Keyword Clustering will use Pattern D** (OT/CRDT merge) at Phase 2. The canvas already resembles operation-oriented design (move-node, link-keyword, create-pathway are natural operation shapes).

### 3.3 Presence and attribution
When real-time collaboration is active on a workflow:
- **Presence** — visible indicators of which users are currently in the workspace (e.g., avatar dots near active regions). Required for any concurrent workflow.
- **Attribution** — the system tracks who made each change. Required for any concurrent workflow.

The visibility of attribution to non-admin users (do workers see each other's names on changes?) is a product decision per workflow.

### 3.4 Design implication
Real-time collaboration infrastructure must be architected **before** the first worker is onboarded to any workflow that requires it. This is a Phase 2 blocker. Implementation should use a proven library (Supabase Realtime, Yjs, Liveblocks, or similar) rather than building from scratch.

---

## 4. Review cycle

### 4.1 The review flow (platform-wide feature, not per-workflow)

Required in Phase 2. Identical across all workflows that use it.

**States of a (user, workflow, project) assignment:**

```
assigned → in-progress → submitted-for-review → { acceptable | revision-requested }
                                                         │
                                                         └─→ in-progress (cycle)
```

- **assigned** — Admin granted access; worker hasn't started
- **in-progress** — Worker has started working
- **submitted-for-review** — Worker has clicked "I'm done — please review" button; admin is notified
- **acceptable** — Admin has reviewed and approved the work
- **revision-requested** — Admin has reviewed and returned with notes; worker can resume work and re-submit

### 4.2 Reviewer notes
- Admin can attach notes when moving from `submitted-for-review` → `revision-requested`
- Notes are visible to the worker when the work returns to them
- Notes history is preserved (a work item can cycle through review multiple times; prior notes remain accessible)
- Notes should support rich text (reuse the Admin Notes editor component pattern)

### 4.3 Button behavior
- The "I'm done — please review" button is visible to the worker; admin sees the review state in their dashboard
- Admin can "reset" a submitted-for-review state back to in-progress (effectively reopening it for the worker without marking as acceptable)
- Admin can mark as "acceptable" which finalizes that review cycle
- A completed workflow may be reopened manually (e.g., post-launch revision) — admin action only

### 4.4 Admin self-review
During Phase 1 (admin-solo), admin does not review admin's own work. The review cycle infrastructure is built in Phase 2, not Phase 1. Phase 1's `ProjectWorkflow.status` field can remain simple (`inactive` / `active` / `completed`).

### 4.5 Phase 2 schema additions (planned, not built)
The review cycle will require (at minimum):
- `ProjectWorkflow.reviewState` field (or a separate state on the Assignment row) — likely enum/string: `assigned | in-progress | submitted-for-review | acceptable | revision-requested`
- `ReviewNote` table — linked to an Assignment row, with timestamps, content, and author
- Email notification integration (admin is notified on submitted-for-review)

### 4.6 Design implication
Workflow tools built during Phase 1 should **not hardcode status transitions** in ways that will conflict with the Phase 2 review cycle. Specifically: tool UIs should display workflow status via a centralized component that can expand to show more states later without per-tool rewrites.

---

## 5. Audit trail

### 5.1 Policy
**Audit trail is opt-in per workflow, not platform-wide.** Each workflow, at its design time, declares whether it needs an audit trail and at what granularity.

### 5.2 When audit is required (examples — final list per-workflow)
- Workflows where **compliance/legal attribution matters** (even though compliance per §9 is currently "none," specific workflows may still need attribution for internal QA)
- Workflows where **bad actors could cause silent data corruption** that needs forensic investigation
- Workflows where **admin needs to know who did what** for performance/quality reasons

### 5.3 When audit is not required
- Workflows with low stakes where the storage/performance cost exceeds the value
- Workflows where the output is a single final artifact (no need to track intermediate edits)

### 5.4 Phasing
- Phase 1: no audit trail (admin-solo; irrelevant)
- Phase 2: audit trail implemented for workflows that declared it in their design interview
- Phase 3/4: audit trail tables may need partitioning or archival strategies at scale (5,000 Projects/week × active workflows producing audit events)

### 5.5 Phase 2 schema sketch (planned, not built)
- `AuditEvent` table: id, workflowType, projectId, userId, timestamp, eventType, payload (JSON)
- Likely indexed by (projectId, workflowType) and (userId, timestamp) for common queries
- Partition or archive policy TBD at implementation time

### 5.6 Design implication
Phase 1 workflow tools do not need to emit audit events. Phase 2 tools that declare audit requirements should emit events through a shared helper (to be built in Phase 2) so adding audit to a new workflow is a one-line addition, not a per-tool rebuild.

---

## 6. Workflow readiness

### 6.1 Model

A workflow is "ready to be worked on" when its **declared data dependencies** are satisfied.

**Readiness is declarative per workflow, not computed by a central resolver.** Each workflow tool declares its own readiness rules at design time. Examples:
- Keyword Clustering: "always ready" (entry-point-like; user can upload keywords directly)
- **Competition Scraping & Deep Analysis (W#2): "always ready" — confirmed at W#2 design interview 2026-05-04. NO upstream dependency on W#1 or any other workflow. (Earlier draft of this doc speculated W#2 might depend on W#1's topic hierarchy; that speculation was rejected by the director at interview time.)**
- Content Development (hypothetical): "ready when both Competition Scraping and Therapeutic Strategy have produced their deliverables"

### 6.2 Not an entry gate
No workflow is **architecturally** the entry point. The current order of workflows (Keyword Analysis → Competition Scraping → ...) is a **business ordering**, not a system constraint. New workflows may be inserted anywhere in the chain as business needs evolve. The system must not hardcode "workflow 1 is keyword clustering."

### 6.3 UI implications
- Projects page: each workflow card on each Project shows a `ready` / `not-ready` indicator
- Worker-facing view: workers only see their assignments in workflows that are ready on their assigned Projects
- Not-ready indicators should show WHY (which upstream dependency is missing)

### 6.4 Phase 1 implementation
Since Phase 1 is admin-solo and Keyword Clustering is "always ready," readiness is trivially `true` for now. Real readiness logic will come online as workflows 2–14 are built and declare dependencies on each other.

### 6.5 Design implication
Every new workflow's design interview must answer the question: **"What data must exist before this workflow can start?"** — and the answer becomes a declarative rule in the workflow's design doc.

### 6.6 Cross-workflow data permissions (NEW 2026-05-04 — surfaced by W#2 design interview)

Some workflows produce data that downstream workflows need to READ (the standard case, captured in `DATA_CATALOG.md` §7 Cross-Tool Data Flow Map). Some workflows' data may also be EDITABLE by specific downstream workflows — this is the more complex case.

**Granularity required:** per-(producing-workflow, data-item, consuming-workflow). Examples (provisional, from W#2 design interview):

- W#2 produces "Competition Categories" vocabulary — W#5 (Conversion Funnel) may ADD to this vocabulary; W#9 (Clinical Evidence) is read-only.
- W#2 produces "Captured text rows" — some downstream workflow may FLAG specific rows as "use verbatim"; others are read-only. Specifics finalized per-downstream design interview.

**Implementation guidance:**

- Per-workflow design interview (Rule 18) Q5 Outputs answer must declare provisional read/write expectations.
- Per-downstream workflow design interview must declare which upstream data items it intends to write to.
- Database schema implements via per-table Row-Level Security policies in Supabase OR per-row `editable_by_workflows` array column. Implementation choice deferred to first downstream-edit case.

**Why not just "per-workflow" (workflow can edit all of upstream's data or none)?** Too coarse — most downstream workflows want SOME edit permissions (e.g., adding to a vocabulary) without needing ALL edit permissions (e.g., deleting captured images). The granular model lets us ship the minimum surface.

---

## 7. Reset workflow data

### 7.1 Policy
Every workflow must have a **"reset this Project's data"** action available to admin that:
- Deletes all data stored by this workflow for this specific Project
- Does NOT affect any other workflow's data on the same Project
- Does NOT affect other Projects
- Flips the ProjectWorkflow status back to `inactive`
- Is confirmable (destructive action — no accidental reset)
- Is admin-only

### 7.2 Purpose
Admin uses reset when a worker's output is sub-par and needs to be redone from scratch by a different worker. The reset must be fast and complete — no residual data confusing the new worker.

### 7.3 Per-workflow specification
Exactly **what** gets reset is specified per-workflow at design time. For Keyword Clustering, reset would clear: Keywords, CanvasNodes, Pathways, SisterLinks, CanvasState, and localStorage keys (checkpoint, config). Other workflows will have different specifics.

### 7.4 Audit/review implications
When audit trail is enabled for a workflow, a reset action must itself be audited. When review cycles exist, reset interacts with review state — admin should be able to reset even if the current state is "submitted-for-review" (and doing so clears the submission).

### 7.5 Phase 1 implementation
Reset is a Phase 2+ requirement for collaborative workflows but is **also useful for admin in Phase 1** (testing, throwaway data). Build it for each workflow as the workflow is built. For Keyword Clustering specifically, reset is currently not implemented and is on the roadmap (Phase 1-gap or sooner).

---

## 8. Workflow count and organization

### 8.1 Workflow count is not fixed
The current count of 14 workflows plus Business Operations is a **current snapshot**, not an architectural constant. New workflows may be:
- Added anywhere in the dependency chain
- Removed or merged as the business model evolves
- Renamed

Architecture must treat workflow count as dynamic data. In particular: no hardcoded lists of workflows in UI code; the list of workflows comes from a single canonical source (e.g., a constant/config file or database table).

### 8.2 Hierarchical visual grouping (UI-only)
Workflow cards may be displayed in a parent-child visual hierarchy on the `/plos` page and Projects page. This is **purely visual organization** — like folder grouping in a file manager.

In the data model:
- Every workflow is a flat, independent entity
- There is no parent-child relationship between workflows in the database
- The hierarchy is metadata on the workflow card display (probably stored alongside other card config like icon, title, short description)

### 8.3 Design implication
If any code starts relying on workflow parent-child relationships beyond display, that's a signal the model is drifting wrong. Workflows communicate with each other through **data dependencies** (§6), not through hierarchy.

### 8.4 Project-scoped shared vocabularies (NEW 2026-05-04 — surfaced by W#2 design interview)

Some workflows produce vocabularies (controlled lists of categories, names, labels) that other workflows on the same Project also need to READ and potentially WRITE TO.

**Examples from W#2:**
- Competition Categories (e.g., "device", "topical", "supplement")
- Brand Names
- Product Names
- Content Categories (e.g., "Amazon Title", "Amazon Bullet Point")
- Image Categories

**Pattern:** vocabulary tables are scoped to `(Project × vocabulary-type)`, NOT to the producing workflow. Any workflow on the same Project can READ + ADD entries. The producing workflow doesn't "own" the vocabulary — it just bootstraps it.

**Implementation guidance:**

- Single shared `Vocabulary` table OR per-vocabulary-type tables — implementation decision at first-build time
- Each row tracks: `projectId`, `vocabularyType`, `value`, `createdByWorkflow`, `createdByUserId`, `createdAt`
- Soft-delete with a `deletedAt` column (vocabulary entries reference into other tables, so hard-delete causes referential integrity headaches)

**Future workflows:** at each design interview, Q5 Outputs answer must explicitly call out any vocabularies the workflow produces or expects to extend.

---

## 9. Compliance

### 9.1 Current policy (explicit)
**No sensitive data is stored or processed in PLOS.**
- No patient/medical data (HIPAA does not apply)
- No EU personal data subject to GDPR in a consumer sense
- No financial data requiring PCI compliance
- No data requiring specific geographic residency

Despite the "therapeutic," "clinical evidence," and "compliance" workflow names in the platform, these refer to **marketing-facing and internal-QA processes** around launched products, not to regulated data about individuals.

### 9.2 Future evaluation
This policy will be re-evaluated if:
- The business expands to handle real patient/customer data
- Workflows are added that process regulated information
- Worker-generated content involves medical claims that need legal retention

If any of those become true, a dedicated Compliance Requirements interview will precede architecture changes.

### 9.3 Design implication
Current architecture (Supabase Postgres, public `admin-notes` storage bucket, Vercel hosting, no encryption at rest beyond provider defaults) is appropriate for the current compliance posture. No additional compliance-motivated changes required in Phase 1.

---

## 10. Infrastructure

### 10.1 Current stack (Phase 1-appropriate)
- **Frontend/backend:** Next.js 16 on Vercel (serverless functions, 5-minute max timeout)
- **Database:** Supabase Postgres (Pro plan sufficient for Phase 1 scale)
- **Storage:** Supabase Storage (public `admin-notes` bucket currently; additional buckets likely needed for workflow deliverables)
- **Auth:** Supabase Auth (JWT)
- **Realtime:** Not yet enabled; planned for Phase 2 (Supabase Realtime is the default choice)
- **AI:** Anthropic API direct or via Vercel

**Non-web-app clients (NEW 2026-05-04 — surfaced by W#2 design interview):**

Until W#2, every PLOS interaction happened inside the Next.js web app at vklf.com. W#2 introduces a Chrome browser extension as a co-equal client — running in the user's browser outside vklf.com and talking to PLOS over the network.

**Implications platform-wide:**

- **Authentication** — PLOS now needs to support non-web-app clients. Likely pattern: long-lived API tokens issued from a PLOS settings page, OR OAuth 2.0 device flow. Decision deferred to W#2 stack-and-architecture session; once chosen, the pattern applies to all future non-web clients.
- **API surface** — APIs designed for the extension must be CORS-friendly, idempotent, and explicit about authentication context. Cannot rely on cookie-based session auth.
- **Distribution** — extension files (.zip / unpacked / Chrome Web Store) hosted somewhere; PLOS surface for download + install instructions per workflow.

**Future workflows:** any workflow that needs user actions outside the browser-tab-on-vklf.com (browser extension, mobile app, desktop tool) follows the same patterns established here.

### 10.2 Phase 3 (50 worker) stack expectations
- Likely still Vercel + Supabase with a higher Supabase tier
- Real-time infrastructure (Supabase Realtime or third-party like Liveblocks) selected and deployed
- Workflow-deliverable storage (videos, design files, etc.) likely needs a dedicated bucket strategy — possibly private + signed URLs (already on the tech-debt list)

**Image-storage scale projections (NEW 2026-05-04 — surfaced by W#2 design interview):**

W#2 Competition Scraping captures ~300 images per Project (mix of regular product shots ~200 KB + A+ content region-screenshots ~1-2 MB; ~500 KB average). Aggregate projections:

- Phase 3 (~70 Projects/wk × 300 images × ~500 KB) ≈ ~500 GB/year of image storage
- Phase 4 (~140 Projects/wk × 300 images × ~500 KB) ≈ ~1 TB/year of image storage

**Implication for Supabase Storage strategy:**

- Dedicated bucket per workflow that stores significant binary assets (W#2 = `competition-scraping`; future workflows TBD)
- Private buckets with signed-URL access (no public access)
- Lifecycle policies for archival evaluated at Phase 3 ramp time
- CDN configuration evaluated at Phase 3 ramp time

Existing `admin-notes` public bucket is unaffected.

### 10.3 Phase 4 (500+ worker / 5,000 Projects/week) stack considerations
At the Phase 4 timeline, evaluate:
- **Database:** Supabase scale limits vs. migrating to managed Postgres on AWS RDS (Aurora); consider read replicas, connection pooling (PgBouncer), potential sharding by userId or projectId
- **Background jobs:** Vercel function timeout (5 min) becomes a hard limit for bulk operations. Consider a dedicated job queue — AWS SQS + Lambda, Inngest, Trigger.dev, or BullMQ + Railway/Fly.io
- **Storage:** Supabase Storage vs. S3 directly — cost and throughput question
- **CDN:** Likely Cloudflare or Vercel's default; evaluate asset delivery patterns
- **Real-time scale:** Supabase Realtime connection limits vs. dedicated service

### 10.4 Coding portability requirement
**Phase 1 code must not lock us into Vercel/Supabase in ways that prevent a Phase 4 migration.** Practically:
- Use standard Prisma + Postgres patterns (avoid Supabase-specific SQL extensions unless necessary)
- Keep Supabase Auth usage wrapped in our `verifyAuth` helper — if we migrate to Auth0 or Clerk later, only the helper needs replacing
- Keep file storage access wrapped in a small helper (future-swap to S3)
- Avoid Vercel-specific Edge runtime features in the critical path (they migrate poorly)

### 10.5 Design implication
**No infrastructure migration required in Phase 1 or Phase 2.** Plan the AWS discussion for Phase 4. The question "should we move to AWS now?" has a defensible answer of "no" through the end of Phase 3 on both cost and complexity grounds. When Phase 4 approaches, do a dedicated Infrastructure Interview chat.

---

## 11. Phasing

The platform develops in four phases. Each phase has a distinct goal and gate.

### Phase 1 — Admin-solo tooling (🎯 CURRENT)
**Goal:** Admin can complete all 14 workflows end-to-end for a single Project, at production quality, unassisted.
**Gate to Phase 2:** All 14 workflow tools built. Admin has run ≥1 complete Project through them. Keyword Clustering's polish items completed.
**Duration:** Long; do not over-commit to a timeline. Workflow-by-workflow build.
**Users:** Only admin.
**What NOT to build yet:** assignment system, review cycles, audit trail, real-time collaboration, worker-facing views.

### Phase 2 — Multi-user infrastructure
**Goal:** Platform ready for worker onboarding. All infrastructure to support 50 concurrent workers with granular assignments, review cycles, audit (where required), and real-time collaboration (where required).
**Gate to Phase 3:** Infrastructure complete and tested with admin + 1 test worker.
**Duration:** TBD — depends on final Phase 1 scope.
**What to build:**
- Assignment table + permission middleware on all API routes
- Worker-facing views of PLOS (only their assignments visible)
- Review cycle (states, notes, notifications)
- Audit trail infrastructure (opt-in per workflow)
- Real-time collaboration per workflow that requires it (Keyword Clustering + others TBD)

### Phase 3 — Worker ramp
**Goal:** Scale from 1 test worker to 50 workers running 500 Projects/week.
**Gate to Phase 4:** Stable 500/week operation with acceptable quality and admin overhead.
**Duration:** ~10 weeks (5 workers/week ramp).
**Focus:** operational iteration, quality monitoring dashboards, worker onboarding materials, iteration on pain points.

### Phase 4 — Scale hardening
**Goal:** Scale from 500/week to 5,000/week.
**Gate:** N/A — this is ongoing.
**Focus:** infrastructure migration (possible AWS), database optimization, cost management, performance tuning.

### Cross-phase work
Some work spans phases:
- **Documentation system** — maintained continuously (per `DOCUMENTATION_ARCHITECTURE.md`)
- **Keyword Clustering polish** (Phase 1-gap, Phase 1-persist, etc.) — runs in parallel with new workflow builds in Phase 1
- **Infrastructure / performance work** — evaluated at each phase gate

---

## 12. The Shared Workflow-Tool Scaffold (architectural commitment)

### 12.1 Principle
The Keyword Clustering tool is an **outlier** in complexity — 76KB of Auto-Analyze code, a multi-mode canvas with draggable nodes/pathways/sister-links, dual-state UI, bidirectional table↔canvas sync, AI-powered delta merging, etc. It is **not a template** for the remaining 13 workflows.

Most of the remaining workflows are **genuinely simpler** — closer to "structured form + file upload + review + some workflow-specific visualization" than to an interactive canvas application.

### 12.2 The scaffold
Before building workflows 2–N, a **Shared Workflow-Tool Scaffold** will be designed and built. This is a reusable component/pattern that most workflows use. It provides:
- Standard workflow page shell (route, auth check, workflow-status wiring)
- Standard topbar (workflow title, back navigation, admin reset button)
- Standard status indicator (inactive/active/completed, extendable for Phase 2 review states)
- Standard deliverables area (file upload, file list, file download)
- Standard structured-content area (forms/text/notes — workflow-specific fields plug in here)
- Standard worker-facing status controls (Phase 2: "I'm done — please review" button, revision-notes viewer)
- Standard admin-facing review controls (Phase 2: acceptable / revision-requested + notes)
- Standard audit-event emission helper (Phase 2: opt-in)

### 12.3 What each workflow adds
Each specific workflow plugs into the scaffold by defining:
- Its name, icon, and card metadata
- Its readiness rules (§6)
- Its data schema (tables + fields)
- Its custom content area (the workflow-specific UI — forms, visualizations, tools)
- Its reset rules (§7)
- Its audit-event types if any (§5)
- Its concurrency strategy if any (§3)

### 12.4 Implementation timing
The scaffold is built **before workflow #2**. Once built, adding workflow #3, #4, etc. is substantially faster because the shell is already solved.

Keyword Clustering is retrofitted into the scaffold later (low priority — it works fine as-is), OR the scaffold is designed to accommodate custom workflows like Keyword Clustering as a special case.

### 12.5 Design implication
When workflow #2 is started, the **first substantive work is designing the scaffold**, not designing workflow #2's specifics. The scaffold work benefits all subsequent workflows, so it's worth doing right.

### 12.6 Scaffold extension-points discovered during workflow interviews (NEW 2026-05-04 — surfaced by W#2 design interview)

The scaffold's design (per §12.4 — built before W#2 build begins) must accommodate the following extensibility patterns surfaced by W#2:

1. **Always-visible deliverables.** A workflow may have downloadable artifacts (extension files, templates, README PDFs) that are present regardless of Project state. Distinct from per-Project produced outputs. The deliverables area in the scaffold must support both modes.

2. **Custom React content components.** A workflow may plug in a fully custom content component (not just standard forms) into the workflow-specific content area. W#2 will be the first to use this (multi-table viewer with platform/URL/category navigation). The scaffold must define a clean plug-in interface — likely a React prop accepting a component, with the scaffold passing standard context (workflow status, project context, auth context).

3. **External-client companion pattern.** A workflow may ship a downloadable companion artifact (browser extension, mobile app, desktop tool) that talks to PLOS via API rather than running inside a browser-tab on vklf.com. W#2 is the first; future workflows may follow. The scaffold must surface this as a recognized pattern + provide a standard "download companion" UI block.

**Future workflows:** at each design interview, Q14 Scaffold Fit answer should reference these extension-points and declare which (if any) the workflow will use.

---

## 13. Open platform questions

Items revealed by future workflow interviews that become platform-level will be added here. Current opens:

1. **Monitoring/dashboard for admin** — At 500 Projects/week, admin needs a way to see "what's falling behind," "what's waiting for review," "what's stalled." Design deferred to Phase 2 planning.
2. **Worker-facing landing page** — What workers see when they log in. Design deferred to Phase 2 planning.
3. **Notification system** — Email and/or in-app notifications for review-submitted, revision-requested, new-assignment. Design deferred to Phase 2 planning.
4. **Bulk Project creation** — At 500/week (~100 Projects/day on working days), creating Projects one at a time may be slow for admin. Possibly a bulk-import feature. Design deferred.
5. **Deliverable versioning** — When a workflow produces outputs (files, datasets), and admin requests revisions, old versions may need to be kept. Policy per workflow, infrastructure platform-wide. Deferred to Phase 2 planning.
6. **Workflow deliverable storage** — §4.6 of this doc implied this. Separate storage buckets per workflow? One shared? Signed URLs? Deferred.

Each open becomes a pointer to a future planning chat at the relevant phase.

---

## 14. How to use this document

### 14.1 For every chat
This doc is Group A — uploaded every chat. Claude reads it during the Pre-Flight Drift Check.

### 14.2 When designing a new workflow
Before starting build, run the **Workflow Requirements Interview** (see `HANDOFF_PROTOCOL.md`). That interview includes a platform-truths audit: "Did any answer reveal a platform-level fact not yet in `PLATFORM_REQUIREMENTS.md`?" If yes, update this doc first, then proceed.

### 14.3 When updating this doc
- Changes to scale targets, user model, or phasing require explicit user approval
- Adding a new subsection is additive (Claude can propose, user approves)
- Removing or softening a requirement is significant — flag explicitly and get approval
- All updates bump the "Last updated" date

### 14.4 Authority
This doc is **authoritative on platform-wide requirements**. Workflow-specific details live in each workflow's design doc. When a workflow's requirements conflict with platform requirements, the platform requirements win (or the workflow design must be revised).

---

END OF DOCUMENT
