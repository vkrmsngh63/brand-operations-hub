# Keyword Clustering (W#1) — Continuity Primer

**Read this first when returning to W#1 to fix or extend it.** It is the map; the
docs it links are the territory. After reading this plus whichever linked docs your
task needs, you should be able to continue W#1 seamlessly from where it was left —
without relying on Claude's auto-memory (which is not authoritative; everything
load-bearing is in these git-tracked files).

**Branch:** `main` (W#1 is graduated and lives on `main` per Rule 22) · **Live at:** vklf.com (inside a Project → Keyword Clustering)
**Status:** ✅ **GRADUATED 2026-05-12.** Continuity primer + `./catch-up-workflow 1` backfilled 2026-06-03-c per HANDOFF_PROTOCOL Rule 33 (W#1 predated Rule 33; this brings it under the same one-paste re-entry kit as W#2). Unlike W#2, W#1 still has a **live, non-empty polish backlog** (see §5) — it is graduated, not finished.
**Status / current baselines / open items — ALWAYS read these for live numbers:**
`docs/ROADMAP.md` + the `docs/CLAUDE_CODE_STARTER.md` header (test counts, route count, and the latest session's state live there; do NOT trust any number hard-coded in this primer).

---

## 1. What W#1 IS

Keyword Clustering is the **first workflow in every Project**. It ingests the
Project's full keyword universe (the "All Search Terms" — typically thousands to
tens of thousands of search terms with volumes) and produces a structured **topic
hierarchy on a 2D canvas**. The hierarchy organizes every relevant keyword under
topics that match its searcher intent, arranged in conversion-funnel order from
awareness to decision. Keywords that don't fit the Project's scope are soft-archived
to a "Removed Terms" table with AI-attributed reasoning. The AI engine that builds
the hierarchy is **Auto-Analyze** (batched AI passes + periodic full-canvas
consolidations). W#1's output (canvas + topic hierarchy + keyword placements +
removed terms) is the structural foundation every downstream PLOS workflow consumes.

## 2. What is CODED into it (the surfaces — high level, not exhaustive)

- **App page** — `src/app/projects/[projectId]/keyword-clustering/page.tsx` and its
  `components/`: `KeywordWorkspace.tsx` (the shell), `CanvasPanel.tsx` /
  `CanvasEditPanel.tsx` / `CanvasTableMode.tsx` (the 2D topic canvas + edit + table
  views), `AutoAnalyze.tsx` (the AI run overlay), and the keyword tables
  `ASTTable.tsx` (All Search Terms) / `KASTable.tsx` / `TVTTable.tsx` / `MTTable.tsx`
  (Main Terms) / `TIFTable.tsx` (Terms In Focus), plus `FloatingPanel.tsx` /
  `ScrollArrows.tsx`.
- **Behind-the-scenes endpoints** — under `src/app/api/projects/[projectId]/`:
  `canvas/` (`route.ts`, `nodes/`, `rebuild/`, `sister-links/`, `pathways/`),
  `keywords/` (`route.ts` + `[keywordId]/`), `removed-keywords/` (`route.ts` +
  `[removedId]/restore/`), and `src/app/api/user-preferences/[key]/` (Auto-Analyze
  settings/prompts).
- **Shared logic / helpers** — `src/lib/`: `operation-applier.ts` (applies the AI's
  ordered op list atomically — one batch = one DB transaction), `auto-analyze-v3.ts`
  (the run engine), `canvas-fetch-parser.ts`, `canvas-layout.ts`,
  `canvas-rebuild-guard.ts`; plus `src/lib/workflow-components/use-workflow-context.tsx`
  (note: `useEmitAuditEvent()` here is a Phase-2 **stub no-op** — see H-1 in §5).
- **Browser extension:** none — W#1 is fully in-app (the extension is W#2's).
- **Saved-data shapes (database models)** in `prisma/schema.prisma`:
  `ProjectWorkflow`, `Keyword`, `CanvasNode` (topics; carries `intentFingerprint`
  + `kwPlacements`), `RemovedKeyword`, `Pathway`, `SisterLink`, `CanvasState`,
  `UserPreference`. **Three data items are still client-side** (Main Terms / Terms
  In Focus / Auto-Analyze checkpoint — see M-1 in §5) and the Anthropic API key is a
  deliberate client-side exception.

## 3. POINTERS — the deep docs (always current; load as the task needs)

| If you need… | Read |
|---|---|
| Full **functionality / design intent** | `docs/INPUT_CONTEXT_SCALING_DESIGN.md` (Scale Sessions A–E: tiered serialization, intent fingerprints, atomic-batch fold-in) · `docs/AUTO_ANALYZE_PROMPT_V4.md` + `docs/AUTO_ANALYZE_CONSOLIDATION_PROMPT_V4.md` (the live V4 prompts that drive Auto-Analyze) |
| Full **code map / data contract** | `docs/KEYWORD_CLUSTERING_DATA_CONTRACT.md` (small + stable; the 12 data items, the operation vocabulary §4, the Rule 22 Resume Prompt §7) · `docs/KEYWORD_CLUSTERING_ARCHIVE.md` (~4600 lines; full build history + every STATE block — skim the ToC, load specific blocks only when a change needs the "why") |
| The **data items** (Human Reference Language + downstream sharing) | `docs/DATA_CATALOG.md` §5 (per-item entries) + §7 (Cross-Tool Data Flow Map) |
| The **rules** we followed | `docs/HANDOFF_PROTOCOL.md` + `docs/CLAUDE_CODE_STARTER.md` (platform-wide) · `docs/MULTI_WORKFLOW_PROTOCOL.md` (branch / graduation / Rule 22 re-entry) · `docs/AI_MODEL_REGISTRY.md` (model choices, Rule 32) |
| **Mistakes we wanted to avoid** | `docs/CORRECTIONS_LOG.md` (append-only; the W#1 entries — Pivot rationale, the cold-start render-layer flake, scaling/connection-hold ceilings, the client-side-storage "pick up where you left off" principle) |
| Per-feature **work items** (sized + scoped) | `docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md` (W#1 predates the `polish-item-specs/` convention; its backlog is the per-feature source-of-truth) |
| **Verification** history / known-deferred items | `docs/KEYWORD_CLUSTERING_ARCHIVE.md` STATE blocks + `docs/ROADMAP.md` (W#1 had no separate verification-backlog doc; verification ran inline). Passive prereq #1 (cold-start banner) tracked as P-1 in the backlog. |
| Operating memory (how the director collaborates) | `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/MEMORY.md` — background context only; verify any named file/flag still exists before acting (memory is not authoritative). |

## 4. How to safely CHANGE it (the guardrails)

- Work on `main` (W#1 is graduated; it has no feature branch). Deploys to vklf.com
  go out from `main` via Vercel — only through the **Rule 9** deploy gate (explicit
  director Yes).
- Before coding: **Rule 3** (code wins over docs — read the source, don't trust doc
  claims) · **Rule 21** (scan ROADMAP + DATA_CATALOG for any director directives
  addressed to W#1 since graduation) · **Rule 23** (Change Impact Audit before moving
  any data shape — look up downstream consumers in `DATA_CATALOG.md` §7.2.1 and
  classify Additive / Compatible / Breaking) · **Rule 14f** (forced-picker for genuine
  decisions).
- Keep green before every deploy (run `/scoreboard`): root `tsc`, `src/lib` node:test,
  `npm run build` route count. Current pass counts live in the
  `docs/CLAUDE_CODE_STARTER.md` header — read them there.
- **Schema changes:** additive + `prisma db push` ONLY with explicit director
  authorization (Rule 8/9); never `migrate reset` against prod. When a client-side
  item migrates server-side, bump `KEYWORD_CLUSTERING_DATA_CONTRACT.md` to v2 per the
  Rule 23 versioned-contract pattern.

## 5. OPEN items at graduation (the LIVE polish backlog)

W#1 is graduated but **not finished** — it carries an active, prioritized backlog.
The canonical, always-current list (with sizing, scope, and work-splits) is
**`docs/KEYWORD_CLUSTERING_POLISH_BACKLOG.md`** — this primer deliberately does NOT
restate it (copies drift; the backlog doc stays current). Tiers at a glance:

| Tier | Items | Note |
|---|---|---|
| 🚨 **HIGH** | **H-1** Action history table + per-action undo | Highest-priority OPEN item; ~3–5 sessions; the queued next task (see below) |
| 🟡 **MEDIUM** | **M-1** three client-side → server-side migrations (Main Terms / Terms In Focus / Auto-Analyze checkpoint) · **M-2** Auto-Analyze cost forecasting + credit-balance check · **M-3** late-run validation-retry telemetry | M-1 violates the "pick up where you left off anywhere" principle |
| 🔵 **LOW** | **L-1…L-5** archived-terms visibility · overlay font-size pass · Resume pre-flight visibility · canvas-size in top-bar · bulk-archive homograph detection | Small polish bundle |
| 🟣 **CARRY-OVERS** | **C-1…C-7** `[FLAKE]` visibility · Phase-3 scaling reconsideration · backend integration tests · auto-fire toggle check · wrap remaining routes · GoTrueClient multi-instance · V3-era dead-code cleanup | From prior sessions |
| ⛔ **EXPLICITLY LAST** | **Z-1** action-by-action feedback workflow + Prompt Refining button (V4→V5) | Director directive 2026-05-03-b: build this last |
| 🟡 **PASSIVE** | **P-1** cold-start banner verification (prereq #1, 🟡 PARTIAL) | Flip to ✅ if a natural flake ever renders the banner in normal use |

**The queued next W#1 task** lives in `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` (today:
**H-1**). Authoritative cross-platform priority view: `docs/ROADMAP.md` (search "W#1").

### Two re-entry paths coexist (both valid)

- **`./catch-up-workflow 1`** — the Rule 33 front door (this primer). Best when you
  want the map first, then decide what to change.
- **`./resume-workflow 1`** — the Rule 22 roadmap-driven path; reads
  `docs/KEYWORD_CLUSTERING_NEXT_SESSION.md` and launches straight at the queued task
  (today H-1). Best when you already know you're continuing the queued item.

---

**Re-entry command:** `./catch-up-workflow 1` — switches to `main`, pulls, and launches a session pointed at this primer. See `docs/HANDOFF_PROTOCOL.md` **Rule 33** for the methodology.
