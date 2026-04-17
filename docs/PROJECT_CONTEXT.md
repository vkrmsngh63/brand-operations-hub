# PROJECT CONTEXT
## The "why" of the Product Launch Operating System (PLOS)

**Last updated:** April 17, 2026 (business context filled in from platform architectural reveal chat)
**Last updated in chat:** https://claude.ai/chat/cc15409c-5000-4f4f-a5ce-a42784b5a94f

**Purpose:** This document captures the vision, users, scope, and business context of PLOS. It is the "why" behind every technical decision. It is uploaded to every chat so Claude always has the strategic context.

**Note:** This document is a living baseline. Sections marked `[TO BE EXPANDED]` need further detail from the user in future chats — Claude should surface these gaps when relevant.

---

## 1. What PLOS is

**PLOS (Product Launch Operating System)** is a multi-tool software platform that manages the end-to-end process of launching products — from initial keyword research through post-launch optimization and eventual exit strategy.

PLOS was formerly called "Brand Operations Hub." The rename happened in Phase 2 (April 2026). The repository name `brand-operations-hub` has been retained despite the rename.

### The core insight behind PLOS
A product launch is not a single task — it's a **multi-stage macro-workflow** that spans market research, competitive intelligence, therapeutic strategy, brand identity, conversion funnel design, content development, multimedia asset creation, marketplace launch, clinical evidence generation, customer engagement, post-launch optimization, compliance management, and exit strategy. Currently, these stages are handled by disconnected tools, spreadsheets, and manual processes. PLOS unifies them into a single platform where the **output of each stage feeds the input of the next**.

### The user's position on "shared project data"
All 14 PLOS workflow tools operate on a shared **Project** (one Project = one product launch effort). Each workflow creates its own workflow-scoped data bucket (internally called `ProjectWorkflow` — the user never sees this term) linked to the Project. Some data within these workflow buckets is shared across workflows (read-only in some cases, editable in others). Specifics of what is shared and how it's shared are decided per-data-item at implementation time — see `DATA_CATALOG.md` Shared Data Registry.

---

## 2. The 14 PLOS workflows (the macro-workflow)

All 14 workflows below operate on the same Project. A Project moves through them roughly in the order listed, though some workflows are concurrent or ongoing.

1. **Keyword Analysis & Intent Discovery** (🔑) — _CURRENTLY ACTIVE_ — Import and cluster keywords into intent groups, discover value tool opportunities, map cross-page narrative potential.
2. **Competition Scraping & Deep Analysis** (🔍) — Competitor product discovery, SEO analysis, marketplace analysis, clinical evidence mapping, gap analysis.
3. **Therapeutic Strategy & Product Family Design** (🧬) — Product family architecture, claim prioritization, clinical trial design, therapeutic engagement protocols.
4. **Brand Identity & IP** (🏷️) — Brand name generation, visual identity, trademark/patent filing, exit-value asset documentation.
5. **Conversion Funnel & Narrative Architecture** (🎯) — Central and custom funnel design, micro-journey specs, email/PPC/value tool integration.
6. **Content Development** (✍️) — SEO pages, PPC landing pages, marketplace listings, email sequences, app content, quality scoring, compliance pre-screening.
7. **Multi-Media Assets & App Development** (🎬) — Product imagery, medical illustrations, infographics, video/audio, companion apps, value tools.
8. **Marketplace Optimization & Launch** (🏪) — Amazon, Walmart, eBay, Etsy, Google Shopping, website launch with multi-platform coordination.
9. **Clinical Evidence & Endorsement** (🔬) — Evidence tiers 1–4 (case reports through full RCTs), publication management, MD advisory panel, practitioner endorsement.
10. **Therapeutic Engagement & Review Generation** (💊) — Alliance loops, multi-channel engagement, negative experience interception, review generation, referrals.
11. **Post-Launch Optimization** (📈) — SEO/marketplace monitoring, conversion optimization, competitive intelligence, content refresh, kill/escalate decisions.
12. **Compliance & Risk Mitigation** (⚖️) — Rulebook management, automated pre-screening, multi-firm review queue, platform compliance, incident response.
13. **Exit Strategy & Portfolio Management** (🚪) — Portfolio dashboard, living deal sheets, brand selling platform, valuation tracking, exit execution.
14. **Analytics & System Administration** (📊) — Central dashboards, AI prompt management, cross-brand analytics, permissions, capacity planning, system health.

Plus one standalone:

- **Business Operations** (⚙️) — Ongoing operations of launched products: inventory, fulfillment, customer service, financials, vendor management, operational workflows.

The macro-workflow: each workflow's output feeds downstream workflows. Shared data flows through the Project via ProjectWorkflow data buckets. See `DATA_CATALOG.md` for specific data handoffs.

---

## 3. The 3 top-level systems (the platform)

The platform has THREE top-level systems, of which PLOS is one:

1. **PLOS (Product Launch Operating System)** — The 14 workflows above. The main focus of current development.
2. **PMS (Project Management System)** — Currently a placeholder. Will coordinate teams, track tasks, manage timelines across product launch operations.
3. **Think Tank** — An independent ideation workspace with nestable projects for capturing ideas, organizing research, developing strategic concepts. Partially built in Phase 2.

Both PMS and Think Tank have Admin Notes functionality (shared `AdminNotes` component, built in Phase 2). Phase M adds Admin Notes to `/dashboard` and `/plos` as well.

---

## 4. Who uses PLOS (user types)

**As of April 17, 2026, these user types have been confirmed (previously marked `[TO BE EXPANDED]`).** See `PLATFORM_REQUIREMENTS.md §2` for the canonical user model and assignment mechanics.

### Primary users

**Admin (currently: one person — the director / primary user).**
- Runs the entire platform during Phase 1 (see §9 Phasing): solo throughput of ~50 Projects per week through all 14+ workflows
- Personally performs workflow work (not purely orchestrator) — uses the platform to do the actual production work, not just to supervise
- During Phase 2+: grants per-(user, workflow, project) access to workers; reviews all worker output
- Only user with platform-wide access

**Workers (Phase 2+, scaling to ~50).**
- **Mix of contractors, freelancers, and in-house employees**
- Remote and globally distributed (likely)
- Each worker specializes in specific workflow types — not generalists
- Access is granted per-(user, workflow, project) tuple — workers cannot see Projects or workflows they have no assignment to
- Ramp schedule: 5 workers/week over ~10 weeks starting at Phase 2 gate

### Scale and context

- **Platform type:** Internal operations tool for a company launching its own products. NOT a SaaS product sold to external customers. NOT a consulting deliverable.
- **Target throughput:** 50 Projects/week in Phase 1 (admin-solo), ramping to **500 Projects/week** in Phase 3 (full worker team), with headroom to **5,000 Projects/week** planned for Phase 4
- **Project lifecycle:** ~1 week from start to launch (though Projects continue indefinitely after launch — see §5)

### Open questions about users

*(Most originally open questions have been answered as of April 17, 2026. Any remaining:)*
- Future evolution: will the team structure shift (e.g., a second admin, team leads, regional managers)? Not a current concern but worth revisiting periodically.

---

## 5. What success looks like

### Launch milestone (the first success gate)
**"Launch" means admin can complete all 14 workflows end-to-end for a single Project**, at production quality, unassisted. This is the proof-of-concept that the tool works as an integrated system. Reaching this milestone gates Phase 2 (multi-user infrastructure).

### Phase 3 success (full worker operation)
- **500 Projects completed per week** through the full 14-workflow cycle
- **~50 workers operating simultaneously** with clean per-assignment scoping
- Admin spending the majority of time on oversight (review/assignment/quality) rather than production work
- Review-cycle turnaround acceptable (workers rarely blocked waiting for admin)

### Phase 4 success (scale)
- **5,000 Projects per week** achievable without fundamental re-architecture
- Infrastructure cost-scalable to that volume
- Platform stability and performance maintained at 10× Phase 3 load

### Long-term success
- Most of the output work that used to be done in third-party tools (spreadsheets, external project managers, generic note systems) now happens inside PLOS at higher quality and speed
- Each Project generates a complete, organized archive of deliverables (keyword analyses, clinical data, creative assets, marketing plans, compliance docs, etc.) that remain queryable and useful through post-launch iteration
- Post-launch data (ad CTR, conversions, sales) feeds back into the platform to drive iterative improvements on launched products

### What does NOT define success
- Revenue per brand, time-to-launch, and specific numeric targets — these are business-side metrics, not platform metrics. The platform's job is to enable them; it does not itself have them as KPIs.

### Remaining open metrics
- Specific quality/velocity thresholds per workflow (defined during each workflow's design interview)
- Infrastructure cost budget per Project (to be modeled in Phase 4 planning)

---

## 6. Design principles (current)

### Multi-tenancy
The platform will eventually support multi-tenant use. Data must be scoped by `userId` and `projectId` (and in the future, by `teamId` or `organizationId`).

### Real-time collaboration (Phase 1-realtime — coming)
- 5–10 users on the same project simultaneously, scaling to 100+
- Real-time sync like Google Docs (via Supabase Realtime)
- Presence indicators showing who is where
- Conflict resolution on concurrent edits

### Role-based access (Phase 1-collab — coming)
- User roles: admin, worker, etc.
- Per-tool and per-functionality permissions
- Activity log with admin approval/disapproval

### Scale targets
- 10,000+ keywords per table
- 100+ concurrent users
- Growing number of workflow tools (14 + Business Ops + future)

### Non-programmer-friendly
The platform must be usable by non-technical people. The director is the primary user and cannot read code. All UX decisions favor clarity and discoverability over power-user density.

---

## 7. Technology stack (current)

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend:** Next.js API routes (serverless on Vercel)
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma 6
- **Auth:** Supabase Auth (JWT-based)
- **Storage:** Supabase Storage (for Admin Notes attachments)
- **AI:** Anthropic API (Claude) — for Auto-Analyze in Keyword Clustering
- **Hosting:** Vercel
- **Repo:** GitHub (repo name: `brand-operations-hub`)
- **Domain:** https://vklf.com
- **Dev environment:** GitHub Codespaces at `/workspaces/brand-operations-hub`

**Planned additions:**
- Supabase Realtime (for real-time collaboration)
- Possibly Railway or AWS (if Vercel becomes limiting)

---

## 8. Why certain choices were made

### Why Next.js 16
Full-stack framework with serverless deployment, excellent TypeScript support, modern React features (Server Components, streaming). Good for rapid iteration by a non-programmer + Claude.

### Why Supabase
Postgres + Auth + Storage + Realtime all bundled. Reduces operational complexity. Good dashboard for non-technical inspection. RLS (Row-Level Security) for multi-tenant data.

### Why Prisma
Typed database access. Good migration story. `npx prisma studio` lets non-technical users inspect data visually.

### Why localStorage for some data (for now)
Speed of iteration. UI state, panel widths, sort preferences don't need to survive device changes. Data that MUST persist across devices (notes, project data) is in the database. Phase 1-persist will migrate the must-persist-cross-device localStorage items into the database.

### Why the current single-user model
The first user is the director alone. Multi-user features (real-time, roles, activity log) are designed-for-but-not-yet-built. They're scheduled for Phase 1-realtime and Phase 1-collab.

---

## 9. Where PLOS came from

### Origin story
PLOS started as a single-HTML tool called "Keyword Sorting Tool" (KST). It was `keyword_sorting_tool_v18.html`, ~17,691 lines. It ran entirely in the browser with localStorage persistence.

The tool did keyword clustering, topic hierarchies on a visual canvas, and AI-powered auto-analysis. It worked, but:
- Single-HTML architecture couldn't support multi-user collaboration
- localStorage couldn't scale to 10,000+ keywords
- No way to add other workflow tools

### The migration to a proper platform
Starting with Phase 0, the tool was rebuilt as a Next.js + Supabase platform. The migration is still ongoing. Some features from the original KST are not yet migrated (see `ROADMAP.md` Phase 1-gap).

### Phase 2 — The "Brand Operations Hub → PLOS" rebrand
In April 2026, the platform was renamed from "Brand Operations Hub" to "Product Launch Operating System" (PLOS) and given proper 3-tier navigation (Initial Landing → PLOS Landing → Tool). The Think Tank and PMS were sketched in as top-level systems. Admin Notes was built for both.

### Phase D — Documentation Overhaul (April 16, 2026)
After catching a navigation-assumption error that revealed a deeper architectural leak (the shared-Project macro-workflow principle wasn't in any handoff doc), the full 11-document handoff system was built to prevent that class of drift going forward.

### Phase M — Schema Refactor (partially complete — April 16, 2026)
The database was refactored so that one user-facing Project flows through all 14 workflows via internal ProjectWorkflow records. Checkpoints 1–4 of 9 are complete (schema design, schema push, database verified). Checkpoints 5–9 (API code rebuild, /projects page, workflow status helper, Admin Notes expansion, deploy) are the next chat's work.

### What's next
See `ROADMAP.md`. Current focus: finish Phase M (Checkpoints 5–9), then Phase 1g-test (Auto-Analyze testing), then migrating missing KC features, then data persistence cleanup, then real-time collaboration.

---

## 10. Business context

**As of April 17, 2026, these facts have been confirmed** (previously marked `[TO BE EXPANDED — mostly unknown to Claude]`).

- **Platform type:** Internal operations tool for the director's own company
- **Business model:** The company launches its own products; PLOS is used entirely internally — NOT sold to external clients, NOT a consulting deliverable, NOT a SaaS product
- **Industry:** Consumer wellness / health / therapeutic products (implied by workflow names: "therapeutic strategy," "clinical evidence," "therapeutic engagement" — though the platform architecture is domain-agnostic)
- **Compliance posture:** No regulated data handled in PLOS — see `PLATFORM_REQUIREMENTS.md §9`. Compliance-themed workflows refer to marketing-facing and internal QA processes around launched products, not to processing patient/customer data.
- **Build arrangement:** Director (non-programmer) + Claude, building across many chats with the handoff documentation system
- **Resource commitment:** Director has capacity for ~12 hours/day of Claude-assisted work; high personal investment in the project
- **Stakes:** High — errors cascade; the platform is central to the business operation

### Still to be clarified over time
- Specific niche / product categories beyond "wellness/therapeutic"
- Target business metrics (units shipped, revenue per brand, etc.) — these are not platform concerns but may become relevant for platform decisions (e.g., cost modeling)
- Long-term team plans beyond the 50-worker ramp (second admin? regional structure?)

---

## 11. Guiding philosophy

### Correctness over speed
Given the high stakes, a slower, more careful approach beats a fast, error-prone approach. Claude is instructed to verify before acting, confirm before proceeding, and log mistakes honestly.

### Documentation as infrastructure
Handoff documents are not paperwork — they are the infrastructure that prevents cascading failures. See `DOCUMENTATION_ARCHITECTURE.md` for the complete system.

### The non-programmer must remain empowered
The director does not need to become a programmer. Claude must translate technical concepts into natural language, and the director must be able to reference data and concepts in natural language (see Human Reference Language in `DATA_CATALOG.md`).

### Build for the scale you'll have, not the scale you have today
Every decision should account for eventual scale: 14 workflows, 100+ concurrent users, 10,000+ keywords per table, cross-tool data pipelines. Solutions that work only at current scale are red flags.

---

## 12. Open questions (mostly answered as of April 17, 2026)

Most original open questions were answered during the platform architectural reveal chat (`cc15409c-...`). Remaining opens:

1. **Specific niche** — "Wellness / health / therapeutic products" is confirmed at the broad level. Specific product categories / sub-niches may influence future workflow designs but are not currently blocking anything.
2. **Long-term team structure** — Whether the 50-worker team stays flat or develops sub-structure (team leads, regional managers, etc.) is open. Not currently a design constraint.
3. **Specific business metrics** (products shipped per year, revenue per brand, exit valuations) — Not platform concerns but relevant for cost modeling in Phase 4.

Answered and no longer open:
- ✅ Internal tool vs. SaaS vs. consulting: **internal tool** for the director's own company
- ✅ Industry/niche: **wellness/health/therapeutic products**
- ✅ Monetization model: **not applicable** — internal ops tool
- ✅ User types: admin + workers (contractor/freelancer/in-house mix) — see §4
- ✅ Compliance context: **no regulated data** — see `PLATFORM_REQUIREMENTS.md §9`
- ✅ Launch definition: admin completes all 14 workflows end-to-end for one Project — see §5
- ✅ Team composition: admin (1) + workers (up to 50), ramping 5/week in Phase 2

Claude should surface any remaining open item opportunistically when relevant, not all at once.

---

## 13. Working methodology — iterative, discovery-driven development

**This is a first-class operating principle. It is NOT a limitation or workaround. Future Claudes must support this methodology, not push back against it.**

### How the director works
The director is a non-programmer who builds this platform by **adding functionalities one at a time, discovering what new elements are needed as the work unfolds.** This means:

- Schema fields get added incrementally — when a real need appears, not speculatively
- Database tables get designed one workflow at a time — when that workflow is being built
- UX decisions get made after seeing what the current implementation actually feels like
- Scope emerges from the work, not from upfront specification

### Why this is the correct approach
Attempts to fully design a platform like PLOS upfront would fail for well-understood reasons in software development:

- The platform is too large (14 workflows + platform infrastructure) to hold entirely in mind at design time
- The director's product intuition sharpens as each workflow is built — later workflows benefit from lessons from earlier ones
- Building incrementally means every feature is tested in the wild before the next feature is added, catching problems early
- Over-designed schemas accumulate dead fields and unused tables that confuse future work

This iterative approach is how most successful software gets built. It is a deliberate methodology, not a compromise.

### How Claude supports this methodology safely
The risks of iterative development are:
- Each new field addition is a schema change that could fail if done carelessly
- Fields added without documentation become mysterious to future chats
- Naming decisions made quickly can accumulate inconsistency

Claude mitigates these risks by:

- **Always preferring optional fields with defaults** when adding new columns — these migrate safely against existing data
- **Running `npx prisma db push` the safe way** (never `migrate reset`, never `--force-reset` without explicit user approval on wipeable data)
- **Adding documentation for every new field as it's added** — `DATA_CATALOG.md` gets updated in the same chat the field is added
- **Flagging rename/type-change risks explicitly** when they arise (these are the hard migrations)
- **Batching field additions per workflow** during the Tool Graduation Ritual rather than spreading them across many small migrations

### What future Claudes should do
When a new field need is discovered mid-chat:

1. Add it as an optional field with a sensible default
2. Update the relevant Data Catalog entry in the same chat
3. Note the addition in the Corrections Log if any non-obvious decision was made
4. Do NOT treat the addition as a flag that the user should have "planned ahead better" — they shouldn't have; planning comes from doing

Future Claudes should NEVER:

- Suggest the user "plan the full schema upfront"
- Resist adding a field because "we should have caught this earlier"
- Treat incremental schema evolution as technical debt

Incremental schema evolution IS the design. Treat it that way.

### Claude's communication style (paired with this methodology)
Because the director is a non-programmer, Claude takes on the persona of an expert consultant:

- Explain technical terms in plain language when asking for a decision
- Give a clear recommendation with reasoning — don't leave the decision to the director when it's a technical implementation choice
- Zoom out (long-term impact across all 14 workflows) and zoom in (immediate task) on every decision
- Make reversible technical details autonomously — only surface decisions that affect the product, naming visible to users, workflow design, or risk posture
- After making autonomous calls, briefly inform the user so they can override if desired

Specific rules on communication are in `HANDOFF_PROTOCOL.md` §3 Rules 14–17.

### Relationship to platform-level requirements (added April 17, 2026)

Discover-as-you-build applies to **workflow-level schema and data decisions**. It does NOT apply to **platform-level requirements** (scale targets, user model, concurrency, review cycles, audit policy, infrastructure phasing).

Platform-level requirements are captured once, in `PLATFORM_REQUIREMENTS.md`, and updated only when genuinely new truths emerge. They are not iteratively discovered; they are asked about up front during the first chat of each new phase and during every Workflow Requirements Interview (per `HANDOFF_PROTOCOL.md` Rule 18).

This separation exists because platform-level misunderstandings are very expensive to correct — they tend to force rework across many workflows simultaneously — whereas workflow-level misunderstandings are usually contained to one tool and cheap to fix.

### The Workflow Requirements Interview (mandatory for every new workflow)

Before any workflow tool (workflows 2–N) begins build, Claude conducts a **Workflow Requirements Interview** with the user — a structured multi-cluster conversation covering purpose, users, throughput, inputs, outputs, readiness rules, UX shape, concurrency, review applicability, audit needs, reset rules, data persistence, quality bar, and scaffold fit. The interview is documented in `HANDOFF_PROTOCOL.md` Rule 18 and produces a `<WORKFLOW_NAME>_DESIGN.md` doc that guides the build.

This is how discover-as-you-build stays safe at workflow scope: the interview catches the big reveals up front; the remaining discovery happens in the small, safe space of "adding a field as a need emerges mid-build."

---

END OF DOCUMENT
