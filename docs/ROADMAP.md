# ROADMAP
## Product Launch Operating System (PLOS) — Development Execution Plan

**Last updated:** April 18, 2026 (Phase 1g-test partial — first Claude Code session; findings + tuning punch-list; Phase 1g-test follow-up now the top priority)
**Last updated in session:** session_2026-04-18_phase1g-test-kickoff (Claude Code)
**Previously updated (claude.ai era):** https://claude.ai/chat/75cc8985-b70a-49f4-8b64-444c34ef541f

**Scale context (added 2026-04-17):** PLOS targets 500 Projects/week with 50 concurrent workers in Phase 3, with headroom for 5,000 Projects/week in Phase 4. See `PLATFORM_REQUIREMENTS.md §1` for full scale targets. All roadmap items must be evaluated against Phase 3 as the minimum target scale.

---

## Status legend
- ✅ COMPLETE
- 🟡 CODE COMPLETE (not tested)
- 🔄 IN PROGRESS
- ❌ NOT STARTED
- 📋 DESIGNED ONLY
- 🎯 NEXT PRIORITY

---

## The 4-phase model (canonical)

Per `PLATFORM_REQUIREMENTS.md §11`, platform development is structured around four phases. This roadmap restructures all roadmap items into these phases.

```
Phase 1 — Admin-solo tooling
  Goal: admin runs 50 Projects/week solo through all 14 workflows
  Gate to Phase 2: all 14 workflow tools built; one end-to-end Project completed

Phase 2 — Multi-user infrastructure
  Goal: platform ready for worker onboarding
  Gate to Phase 3: infrastructure complete; 1 test worker running successfully

Phase 3 — Worker ramp
  Goal: scale from 1 test worker to 50 workers at 500 Projects/week
  Gate to Phase 4: stable 500/week operation

Phase 4 — Scale hardening
  Goal: scale from 500/week to 5,000/week
  Gate: ongoing
```

---

## Current status overview

| Phase / Milestone | Status |
|---|---|
| **Platform foundations** (Phases 0, 1a–1f, 1g-rebuild, 1-foundation, Phase 2 rebrand, Phase D) | ✅ COMPLETE |
| **Phase M** (DB refactor + API rewrite + UI rework) | ✅ COMPLETE — All 9 checkpoints + 9.5 bug-fix deployed to vklf.com |
| **Phase 1 — Admin-solo tooling** | 🔄 IN PROGRESS — Keyword Clustering (workflow 1) is the first tool; 13 more to build |
| **Phase 2 — Multi-user infrastructure** | ❌ NOT STARTED — architectural sketches exist; no build work |
| **Phase 3 — Worker ramp** | ❌ NOT STARTED |
| **Phase 4 — Scale hardening** | ❌ NOT STARTED |

---

## COMPLETED work (summary — pre-April-17-reveal)

These phases/milestones are complete and remain valid after the April 17 architectural reveal. The reveal did NOT invalidate any prior work — all code, schema, and infrastructure built so far is kept.

- **Phase 0:** Foundation (GitHub, Codespaces, Next.js, Supabase, Vercel, Domain)
- **Phase 1a–1f:** Core Keyword Clustering migration
- **Phase 1g:** Auto-Analyze system code (code complete; not yet tested — Phase 1g-test remains)
- **Phase 1-foundation:** Security (JWT auth) + bulk APIs + code quality
- **Phase 1g-rebuild:** Atomic canvas rebuild
- **Phase 2 (rebrand):** PLOS Rebrand + 3-tier navigation + Think Tank + Admin Notes (PMS + Think Tank)
- **Phase D (documentation overhaul):** 11-document handoff system with Document Lifecycle Management (DLMS)
- **Phase M Checkpoints 1–4 (2026-04-16):** Database schema refactor (Project + ProjectWorkflow + workflow-data tables on projectWorkflowId)
- **Phase M Checkpoint 5 (2026-04-17):** All server-side API routes aligned with new schema; `npm run build` clean; committed at `14d68e7`
- **Phase M Checkpoint 6 (2026-04-17, chat `7a745b12-...`):** Built `/projects` page and `/projects/[projectId]` detail page. Scale-aware from day one: live search (name + description), sort (last activity / name / created), filter by completion status and workflow stage, infinite scroll, edit pencil + full Edit Project modal, two-step delete confirm, inline New Project form, expand-accordion showing 14 workflow cards with Mark Done/Reopen toggle, empty state, no-results state, toast notifications. Visual vocabulary matches `/dashboard` and `/plos`. All CRUD saves to database via Ckpt 5 API. Committed locally; not deployed (Phase M hold window). Commit: `3b69cf2`.
- **Phase M Checkpoint 7 (2026-04-17, chat `7e0b8456-...`):** Refactored Keyword Clustering from `/keyword-clustering` (dual-state page with built-in Projects List) to `/projects/[projectId]/keyword-clustering` (single-state, Project pre-picked from URL). Moved `components/` folder alongside the new page wrapper. Wrote new 164-line `page.tsx` (down from 225) that reads projectId from URL, fetches Project name, shows friendly error on 404/403, and renders the workspace. Top-bar Back button returns to `/projects/[projectId]` detail page. Deleted old `/keyword-clustering` folder. Also cleaned up stray `src/app/projects/projectId/` folder (no brackets) left behind from Ckpt 6. `npm run build` passed cleanly. Commit: `5cc10c5`. Not pushed (still Phase M deploy hold). **`/plos` Keyword Analysis card still points at deleted route — will 404 if clicked; fix is Ckpt 8's scope.**
- **Phase M Checkpoint 8 (2026-04-17, chat `fc8025bf-...`):** Admin Notes added to Dashboard and PLOS pages; broken Keyword Analysis card on `/plos` rewired to `/projects`. Physical changes: (1) `src/components/AdminNotes.tsx` — `SystemKey` type extended from `"think-tank" | "pms"` to `"think-tank" | "pms" | "dashboard" | "plos"` (line 34; only change to the component). (2) New file `src/app/dashboard/notes/page.tsx` (11 lines; mirror of PMS notes page — `system="dashboard"`, `systemLabel="Dashboard"`, `systemIcon="🚀"`, `backRoute="/dashboard"`). (3) New file `src/app/plos/notes/page.tsx` (11 lines; same pattern — `system="plos"`, `systemLabel="Product Launch Operating System"`, `systemIcon="🚀"`, `backRoute="/plos"`). (4) `src/app/dashboard/page.tsx` — 📝 Notes button added to top-right flex container, immediately left of Sign Out (+17 lines). (5) `src/app/plos/page.tsx` — Keyword Analysis card `route` changed from `"/keyword-clustering"` to `"/projects"`; 📝 Notes button added to top bar, grouped with Sign Out in a right-side flex wrapper (+5 net lines). `npm run build` passed cleanly in 18.5s; 17/17 static pages, zero TypeScript errors, both `/dashboard/notes` and `/plos/notes` appear as routes in the build output. Committed locally as `ac62a3a`; branch now 4 commits ahead of origin/main. Not pushed — Phase M deploy hold continues through Ckpt 9. **Pre-existing leftovers in git status** (13 files from Ckpts 1–5) were unstaged via `git reset HEAD` per Option A (clean split); they remain in the working tree for Ckpt 9 cleanup. See `CORRECTIONS_LOG.md` for the canonical inventory and handling procedure. **Mistake logged:** Pattern 11 recurrence (fourth consecutive chat) — Claude asked user to "paste the file" without a concrete command; Pattern 11 mitigation updated to cover all imperative instructions, not just decision questions.

---

## ✅ PHASE M — ALL CHECKPOINTS COMPLETE (2026-04-17)

### Final state
- **Database:** ✅ New Project + ProjectWorkflow schema live in Supabase
- **Server code (API routes):** ✅ Rewritten for new schema; deployed (Ckpt 5)
- **`/projects` page:** ✅ Scale-aware list page deployed (Ckpt 6)
- **`/projects/[projectId]` detail page:** ✅ Built (Ckpt 9.5 — discovered missing post-deploy) + deployed
- **`/projects/[projectId]/keyword-clustering`:** ✅ Single-state KC workspace deployed (Ckpt 7)
- **`/keyword-clustering` (old dual-state route):** ✅ Deleted (Ckpt 7)
- **`/dashboard/notes` + Dashboard 📝 Notes button:** ✅ Deployed (Ckpt 8; note-creation fixed in Ckpt 9.5)
- **`/plos/notes` + PLOS 📝 Notes button:** ✅ Deployed (Ckpt 8; note-creation fixed in Ckpt 9.5)
- **`/plos` Keyword Analysis card:** ✅ Rewired to `/projects` (Ckpt 8), deployed
- **`/docs/` handoff docs folder:** ✅ Created + populated with 15 docs (Ckpt 9)
- **Legacy `src/app/HANDOFF.md` + `ROADMAP.md`:** ✅ Deleted (Ckpt 9)
- **All 51 `.bak` files:** ✅ Deleted (Ckpt 9); `.gitignore` now catches future ones
- **Live site:** ✅ vklf.com running Phase M code; full happy-path verified working

### Checkpoint completion summaries
- **Ckpt 9 (2026-04-17, chat `75cc8985-...`):** Deploy + cleanup + `/docs/` setup. Committed as `3a2b928`: 58 files changed, 5131 insertions, 26869 deletions. Pushed as part of a 5-commit push (Ckpts 5-9 together). Vercel build "Ready" in ~2 min. Visual verification on vklf.com passed for: login, Dashboard + 📝 Notes nav, PLOS + 📝 Notes nav, `/plos` Keyword Analysis → `/projects` rewire, `/projects` list page, expanded accordion, `/projects/[id]/keyword-clustering` reachable via accordion card. Failed for: Admin Notes creation on Dashboard/PLOS (API allowlist missed new systems), `/projects` accordion missing Business Ops card, clicking Project title → 404 because `/projects/[projectId]/page.tsx` had never existed despite docs claiming it was built in Ckpt 6. Triggered Ckpt 9.5 in the same chat.
- **Ckpt 9.5 (2026-04-17, same chat):** Three bug fixes. Fix 1: extended admin-notes API allowlist to include `'dashboard'` and `'plos'` (2-line change in `src/app/api/admin-notes/route.ts`). Fix 2: added `business-operations` as 15th entry in `WORKFLOW_DEFS` in `src/app/projects/page.tsx` (1-line insert). Fix 3: created `src/app/projects/[projectId]/page.tsx` from scratch (487 lines) — Project header + 15-card workflow grid + 404/403/loading states + coming-soon toast + back-nav. Committed as `fcf2373`: 3 files changed, 491 insertions, 3 deletions. Pushed; Vercel "Ready" in ~2 min. Re-verification on vklf.com: all three bugs fixed.

### Phase M — officially complete

**Deploy hold lifted.** vklf.com is now stable and coherent. The DB schema, API routes, UI pages, and Admin Notes all align. The full Phase 1 happy-path works end-to-end: Dashboard → PLOS → Keyword Analysis card → Projects list → click Project → detail page → Keyword Clustering workspace → Back to Project → Back to Projects.

**Safety branch `phase-m-safety-net` at `f545e2a`:** Can now be deleted in a future chat if desired (it served its purpose as a pre-Phase-M anchor; no longer needed).

**Phase 1g-test can now begin.**

---

## 🎯 Post-Phase-M — Claude Code Migration (TOP PRIORITY) — user executes, no Claude chat needed

After Phase M is fully deployed and verified (DONE as of 2026-04-17), the user performs a ~30-minute offline migration:

1. **Install Claude Code** in Codespaces (`npm install -g @anthropic-ai/claude-code` or current equivalent — check https://docs.claude.com for current install command)
2. **Authenticate** (uses existing Anthropic account)
3. **Smoke test** — run `claude` in Codespaces terminal, ask a trivial question, verify file reading works
4. **Read `docs/CLAUDE_CODE_MIGRATION.md`** end-to-end — this is the user's orientation to the new methodology
5. **Ready for first Claude Code session** (Phase 1g-test kickoff)

This migration is logged as a roadmap item (this section) and captured in `docs/CLAUDE_CODE_MIGRATION.md`. No code changes. No Claude chat required during the migration itself.

**The final message of chat `75cc8985-...` (the chat that deployed Ckpt 9 + Ckpt 9.5) includes a "🚨 Ready to switch to Claude Code" section with exact steps.**

### First Claude Code session — Phase 1g-test kickoff
**After migration:** First real Claude Code session tackles Phase 1g-test — live-testing Auto-Analyze on Keyword Clustering. Starter prompt: `docs/CLAUDE_CODE_STARTER.md`. See `docs/KEYWORD_CLUSTERING_ACTIVE.md` §6 for Phase 1g-test scope.

---

## Phase 1 — Admin-solo tooling (ONGOING — 🔄 IN PROGRESS)

### Goal and gate
**Goal:** Admin can complete all 14 PLOS workflows end-to-end for a single Project at production quality.
**Gate to Phase 2:** All 14 workflow tools built. ≥1 Project has been run end-to-end by admin. Keyword Clustering's polish items completed.

### Workflow build plan (the 14 PLOS workflows)

#### Workflow 1 — Keyword Analysis & Intent Discovery (🔑)
**Status:** 🔄 IN PROGRESS (partially built — Phase 1a–1g-rebuild done; Phase 1g-test PARTIAL as of 2026-04-18; polish items remain)

**Polish items remaining:**
- ✅ **Phase 1g-test (partial — 2026-04-18):** First live Auto-Analyze run completed on Bursitis Project (2,328 keywords). Tool runs end-to-end in principle. Findings: Adaptive Thinking produces 0 output tokens on large prompts (workaround: Enabled mode w/ 12k budget). Mode A full-table drops pre-existing topics as the table grows (3-of-3 retries failed on batch 2). Vercel 5-min timeout is a real ceiling. Multiple doc drifts corrected. See `KEYWORD_CLUSTERING_ACTIVE.md` §6.5 for full findings.
- 🎯 **Phase 1g-test follow-up (NEXT PRIORITY — next session):**
  1. Commit canonical V2 prompts to `docs/AUTO_ANALYZE_PROMPT_V2.md` (source of truth in the repo, not scattered text files on the user's laptop)
  2. Broaden the Mode A → Mode B auto-switch trigger to include validation failures (currently only fires on truncation)
  3. Fix Budget input UX bug (empty string during edit should not snap to default)
  4. Add UI hint recommending Direct mode for large-keyword Projects
  5. Add warning when Adaptive Thinking is selected with a large prompt (0-output-tokens risk)
  6. Complete a full Bursitis clustering run with tuned settings (Direct mode + Enabled-12k + expected Mode B after batch 1)
- **Phase 1-polish (NEW items added 2026-04-18 from Phase 1g-test session):**
  - Auto-Analyze overlay should be **resizable** (drag bottom-right corner) AND **movable** (drag top bar)
  - Budget input field: allow empty string during editing, enforce default on blur only
  - Persist Auto-Analyze settings (prompts, apiKey, model, etc.) in `UserPreference` so they survive panel close / page refresh even before a run starts
- **Phase 1-verify:** Verify canvas rebuild edge cases (large batches, node deletion overlap, pathway updates)
- **Phase 1-gap:** Port remaining KST features (see §below for full list)
- **Phase 1-persist:** Migrate must-persist localStorage items to database (MT Table, Removed Terms, etc.)
- **Phase 1h:** UX polish (keyboard shortcuts, accessibility)

#### Workflow 2 — Competition Scraping & Deep Analysis (🔍)
**Status:** ❌ NOT STARTED

**Prerequisite:** Phase 1α — Shared Workflow-Tool Scaffold must be designed and built BEFORE this workflow begins. Per `PLATFORM_REQUIREMENTS.md §12` and `HANDOFF_PROTOCOL.md` Rule 20.

**Next step:** Workflow Requirements Interview (per HANDOFF_PROTOCOL Rule 18), producing `COMPETITION_SCRAPING_DESIGN.md`. The interview will cover: purpose, users, throughput, inputs (from Keyword Clustering), outputs, readiness rules, UX shape, concurrency, review cycle, audit, reset, data persistence, quality bar, scaffold fit.

#### Workflow 3 — Therapeutic Strategy & Product Family Design (🧬)
**Status:** ❌ NOT STARTED. Prereq: scaffold + Workflow 2 Data Contract.

#### Workflow 4 — Brand Identity & IP (🏷️)
**Status:** ❌ NOT STARTED.

#### Workflow 5 — Conversion Funnel & Narrative Architecture (🎯)
**Status:** ❌ NOT STARTED.

#### Workflow 6 — Content Development (✍️)
**Status:** ❌ NOT STARTED.

#### Workflow 7 — Multi-Media Assets & App Development (🎬)
**Status:** ❌ NOT STARTED.

#### Workflow 8 — Marketplace Optimization & Launch (🏪)
**Status:** ❌ NOT STARTED.

#### Workflow 9 — Clinical Evidence & Endorsement (🔬)
**Status:** ❌ NOT STARTED.

#### Workflow 10 — Therapeutic Engagement & Review Generation (💊)
**Status:** ❌ NOT STARTED.

#### Workflow 11 — Post-Launch Optimization (📈)
**Status:** ❌ NOT STARTED.

#### Workflow 12 — Compliance & Risk Mitigation (⚖️)
**Status:** ❌ NOT STARTED.

#### Workflow 13 — Exit Strategy & Portfolio Management (🚪)
**Status:** ❌ NOT STARTED.

#### Workflow 14 — Analytics & System Administration (📊)
**Status:** ❌ NOT STARTED.

#### Standalone — Business Operations (⚙️)
**Status:** ❌ NOT STARTED. Not part of the 14-workflow sequence — runs continuously alongside launched products.

### Phase 1α — Shared Workflow-Tool Scaffold
**Status:** 📋 DESIGNED ONLY — no build work

**Prereq to Workflow 2.** Build a reusable shell that provides: standard page wrapper (auth + status + project context), standard topbar, status indicator, deliverables area, workflow-specific content area (pluggable), worker-facing status controls (Phase 2), admin review controls (Phase 2), audit-event emission helper (Phase 2).

Per `PLATFORM_REQUIREMENTS.md §12.4` — scaffold is built once, then each subsequent workflow plugs in.

### Phase 1 polish items — ongoing

(Items that improve Phase 1 tooling but don't block the 14-workflow build order.)

- **Keyword Clustering: aiMode persistence (NEW 2026-04-17)** — the Manual/AI toggle on the Keyword Clustering top bar currently resets every time the user opens the page. Would benefit from persisting the last-chosen mode per-user per-workflow (via `UserPreference` table). Low priority — admin will generally use one mode or the other per session. Not blocking any other work.
- **Auto-Analyze prompts edition UI** — currently prompts live in localStorage with no in-tool editor. Add a prompt-editor panel somewhere in AI mode.
- **Export-to-Excel** — Keyword Clustering currently exports as TSV only. Add `.xlsx` export using existing `xlsx` package.

---

## Phase 2 — Multi-user infrastructure (❌ NOT STARTED)

### Goal and gate
**Goal:** Platform ready for worker onboarding at scale. All infrastructure for 50 concurrent workers.
**Gate to Phase 3:** Infrastructure complete. 1 test worker running successfully through ≥1 workflow on ≥1 Project.

### Phase 2 scope (summary)

Details in `PLATFORM_REQUIREMENTS.md §2, §3, §4, §5` and `PLATFORM_ARCHITECTURE.md §13`:

- **Assignment system** — three-way table (userId, workflow, projectId), admin grants access. Permission middleware on every API endpoint.
- **Worker-facing views** — PLOS landing page, Projects list, and workflow tools all filter to the worker's assignments.
- **Review cycle** — states (assigned / in-progress / submitted-for-review / acceptable / revision-requested) + ReviewNote table + email/in-app notifications.
- **Audit trail infrastructure** — AuditEvent table + shared emission helper. Opt-in per workflow.
- **Real-time collaboration infrastructure** — per-workflow strategy. Keyword Clustering: OT/CRDT for 10–20 concurrent editors (Pattern D per PLATFORM_REQUIREMENTS §3.2). Others TBD.
- **Role column on User records** — at minimum `admin | worker`. Possibly UserRole table or UserProfile extension.
- **Migrate card-label edits from localStorage to database** — `/dashboard` 3 system cards + `/plos` 14 workflow cards currently save to browser. In Phase 2 these need to be shared across admin and all workers. Add `cardLabels` table or similar; migrate existing localStorage values on first login.
- **Workflow deliverable storage** — new `workflow-deliverables` bucket, private with signed URLs. `Deliverable` table for metadata.
- **Phase 2 open questions** (per PLATFORM_REQUIREMENTS §13) — admin monitoring dashboard design, worker landing page design, notification system design, bulk Project creation tool, deliverable versioning policy.

### Phase 2 tech-debt items
(From Ckpts 5–7 and earlier work. These are items that don't block Phase 1 but must be addressed before workers come online.)

- **Race condition on `nextNodeId` / `nextPathwayId`** in canvas POST routes (Ckpt 5). Two concurrent requests could collide on primary key. Fix: wrap in `$transaction` with SERIALIZABLE isolation, or switch to UUID primary keys.
- **Asymmetric `canvasState` upsert logic** between canvas/nodes/route.ts POST and canvas/pathways/route.ts POST — normalize before Phase 2 concurrency work.
- **`ops as any` TypeScript workaround** in `canvas/rebuild/route.ts`.
- **Shared Keyword type file** in `src/types/keyword.ts`.
- **Unify volume type** (Prisma Int vs TS string).
- **Mutable state in CanvasPanel drag handlers**.
- **ASTRow memoization**.
- **Error state in useCanvas + retry UI**.
- **Optimistic update rollback**.

### Phase 2 platform-schema tech debt
- No assignment table yet
- No review-cycle infrastructure yet
- No audit-trail infrastructure yet
- No role column on User records
- No real-time collaboration infrastructure
- No Shared Workflow-Tool Scaffold yet (also counts as Phase 1α blocker)
- No workflow-readiness resolver yet
- No "reset workflow data" feature in any workflow yet
- No workflow deliverable storage strategy yet
- No Think Tank localStorage → DB migration yet

---

## Phase 3 — Worker ramp (❌ NOT STARTED)

**Goal:** 1 test worker → 50 workers → 500 Projects/week.
**Duration:** ~10 weeks (5 workers/week ramp per PLATFORM_REQUIREMENTS §11).
**Focus:** Operational iteration. Quality monitoring dashboards. Worker onboarding materials. Iteration on pain points surfaced by real worker usage.

No specific items yet — will be populated as Phase 2 nears completion.

---

## Phase 4 — Scale hardening (❌ NOT STARTED)

**Goal:** 500/week → 5,000/week.
**Gate:** Ongoing.
**Focus:** Infrastructure migration (likely AWS evaluation), database optimization (possibly partitioning AuditEvent table at 5,000 Projects/week × 14 workflows = 70,000 rows/week), cost management, performance tuning.

Planning lives in `PLATFORM_REQUIREMENTS.md §10`.

---

## Infrastructure TODOs (apply across all phases)

- **Repo hygiene (Ckpt 9):** `.bak` files littered through repo; `.gitignore` doesn't catch them; `HANDOFF.md` and `ROADMAP.md` living inside `src/app/` where Next.js may interpret them.
- **Think Tank localStorage → DB:** Think Tank projects still save to browser only.
- **Admin-notes bucket access:** Currently public; switch to private + signed URLs.
- **Middleware deprecation:** Next.js 16 renamed the `middleware` convention to `proxy`. Pre-existing warning; fix at convenience.
- **Rich text editor:** Uses deprecated `document.execCommand`. Pre-existing; doesn't block anything.
- **Prisma Studio hygiene:** Occasional orphan rows appear in dev data. Not impacting production.

---

END OF DOCUMENT
