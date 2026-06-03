# Competition Scraping (W#2) — Continuity Primer

**Read this first when returning to W#2 to fix or extend it.** It is the map; the
docs it links are the territory. After reading this plus whichever linked docs your
task needs, you should be able to continue W#2 seamlessly from where it was left —
without relying on Claude's auto-memory (which is not authoritative; everything
load-bearing is in these git-tracked files).

**Branch:** `workflow-2-competition-scraping` · **Live at:** vklf.com
**Status:** ✅ **GRADUATED 2026-06-03** (continuity-first, per HANDOFF_PROTOCOL Rule 33). Every substantive polish item is shipped + director-verified; this primer + `./catch-up-workflow 2` are the re-entry front door. The DOCUMENTATION_ARCHITECTURE §5 Step 1 Archive/Data-Contract split is intentionally DEFERRED until W#3 needs to read W#2 data (director pick 2026-06-03) — until then this primer points straight at the current design docs, which stay authoritative.
**Status / current baselines / open items — ALWAYS read these for live numbers:**
`docs/ROADMAP.md` + the `docs/CLAUDE_CODE_STARTER.md` header (test counts, route count, and the latest session's state live there; do NOT trust any number hard-coded in this primer).

---

## 1. What W#2 IS

A competitor-research system. A **Chrome extension** captures competitor listings
(URLs, text, images, videos, and customer reviews) from Amazon, eBay, Etsy, and
Walmart into a per-Project **Competition Data** workspace in the PLOS web app. The
app organizes competitors into a sortable/groupable table, runs **AI review
analysis** at three levels (per-competitor, by category, by type), and assembles a
**Comprehensive Competitive Analysis** page with downloadable spreadsheets + a
teaching "primer" the director feeds to an external AI.

## 2. What is CODED into it (the surfaces)

- **App pages** — `src/app/projects/[projectId]/competition-scraping/`:
  - `page.tsx` — the main Competitor URLs table (columns, platform filters, grouping, drag-reorder).
  - `url/[urlId]/page.tsx` — the URL detail page (captured text/images/videos/reviews + per-item analysis editors).
  - `comprehensive-analysis/page.tsx` — the Comprehensive Competitor Analysis editor + the "Files" box (Excel exports + the editable teaching primer).
  - `competitor-reviews-analysis/page.tsx`, `reviews-analysis-by-category/page.tsx`, `reviews-analysis-by-type/page.tsx` — the three review-analysis tables.
- **Behind-the-scenes endpoints** — `src/app/api/projects/[projectId]/competition-scraping/` (~30 routes: URL CRUD, captured text/image/video CRUD + Supabase signed-URL upload, reviews CRUD + reorder + batch-delete, `review-analysis/*` AI orchestration, `table-preferences` / `project-table-preferences`, `comprehensive-analysis` + `comprehensive-analysis/primer`, `reset`).
- **Shared logic** — `src/lib/competition-scraping/` (the `handlers/` DI-seam factories — pure, node:tested — plus column/grouping registries `*-table-columns.ts` / `*-table-grouping.ts` / `dynamic-columns.ts` / `column-order.ts`, the export engine `comprehensive-analysis-exports.ts`, the primer generator `comprehensive-analysis-primer.ts` + page-side `comprehensive-analysis/components/primer-render.ts`, review aggregation `category-analysis-aggregation.ts` / `reviews-traceability.ts`, and the AI layer under `review-analysis/`).
- **Browser extension** — `extensions/competition-scraping/` (WXT + MV3): context-menu/overlay capture for text/image/video/URL + per-platform DOM specs in `lib/platforms.ts`; source in `src/entrypoints/` + `lib/content-script/`; tests via `npm test` in that directory.
- **Saved-data models** — `prisma/schema.prisma`: `CompetitorUrl`, `CapturedText` / `CapturedImage` / `CapturedVideo`, `CapturedReview`, `ReviewAnalysis`, `ComprehensiveCompetitorAnalysis` (holds both the analysis doc `contentJson` AND the saved primer `primerJson`), `UserTablePreferences`, `ProjectTablePreferences`.

## 3. POINTERS — the deep docs (load as the task needs)

| If you need… | Read |
|---|---|
| Full **functionality / design intent** | `docs/COMPETITION_SCRAPING_DESIGN.md` (master, §A frozen + §B append) · `docs/COMPETITION_DATA_V2_DESIGN.md` (P-46 phase-2 redesign) · `docs/REVIEWS_PHASE_2_DESIGN.md` (P-49 reviews + AI analysis) · `docs/CAPTURED_VIDEOS_DESIGN.md` |
| **Stack / architecture** decisions | `docs/COMPETITION_SCRAPING_STACK_DECISIONS.md` |
| Per-feature **specs** (verbatim director asks) | `docs/polish-item-specs/` — esp. `P-49-W5-*` (reviews tables), `P-54-*` (main-table enhancements), `P-55-*` (Files box + primer), `P-52-*` (AI model registry) |
| The **rules** we followed | `docs/HANDOFF_PROTOCOL.md` + `docs/CLAUDE_CODE_STARTER.md` (platform-wide) · `docs/MULTI_WORKFLOW_PROTOCOL.md` (branch/graduation) · `docs/AI_MODEL_REGISTRY.md` (model choices, Rule 32) |
| **Mistakes we wanted to avoid** | `docs/CORRECTIONS_LOG.md` (append-only; the W#2 entries — per-platform DOM extraction, diagnostic-instrumentation patterns, the recurring P-43 working-directory-leak, export-must-match-the-table) |
| **Verification** history / deferred bugs | `docs/COMPETITION_SCRAPING_VERIFICATION_BACKLOG.md` |
| How the **director collaborates** (background) | `/home/codespace/.claude/projects/-workspaces-brand-operations-hub/memory/MEMORY.md` — background context only; verify any named file/flag still exists before acting (Rule: memory is not authoritative). |

## 4. How to safely CHANGE it (guardrails)

- Work on `workflow-2-competition-scraping`; deploy to `main` (→ vklf.com via Vercel) only through the **Rule 9** deploy gate (explicit director Yes).
- Before coding: **Rule 3** (code wins over docs — read the source, don't trust doc claims) · **Rule 23** (Change Impact Audit before moving any data shape) · **Rule 14f** (forced-picker for genuine decisions) · **Rule 31** (capture new director asks verbatim into a `polish-item-specs/` file).
- Keep green before every deploy (run `/scoreboard`): root `tsc`, extension `tsc`, `src/lib` node:test, extension `npm test`, `npm run build` route count. Current pass counts live in the `docs/CLAUDE_CODE_STARTER.md` header — read them there.
- **Schema changes:** additive + `prisma db push` ONLY with explicit director authorization (Rule 8/9); never `migrate reset` against prod. The `ComprehensiveCompetitorAnalysis.primerJson` column (P-55 Phase 3 part 3) is the most recent example of the additive-nullable pattern.

## 5. State at graduation + post-graduation residue

**W#2 GRADUATED 2026-06-03 — the polish queue is DRAINED.** Every substantive polish
item is shipped + director-verified on real Chrome / vklf.com: **P-49 W#2** (reviews
analysis tables), **P-54** (main-table enhancements), **P-55** (Comprehensive Analysis
files + editable primer), **P-56** (Amazon highlight-flicker selection fix), **P-57**
(delete-coverage gaps), **P-58** (Download-Extension serves the latest build), **P-59**
(in-app Detailed User Guide brought current), **P-60** (open-detail ↗ on the three
analysis tables), **P-61** (server-side default categories per platform + content-type).
For the authoritative, always-current per-item detail, read `docs/ROADMAP.md` (search
"W#2" + the P-IDs) — this primer deliberately does NOT restate it (pointers stay current;
copies drift).

### Post-graduation residue — NON-BLOCKING, pick any when you return

None of these block graduation; they ride along as documented low-priority continuation.
Authoritative entries live in `docs/ROADMAP.md`. **As of 2026-06-03-h the open
residue (P-26 / P-27 / P-53) is ✅ CLOSED (won't-do — the director retired all three;
alternate methods cover them); the W#2 residue is now FULLY EMPTY — every Competition
Scraping item is shipped or formally retired.**

| Item | What it is | Priority |
|---|---|---|
| **P-53** | On-page "Export Table" button for the Category + Type pages — ✅ **CLOSED (won't-do) 2026-06-03-h** (director). Redundant: P-55's "Comprehensive Competitive Analysis Files" box already exports the by-Category + by-Type tables as spreadsheets (P-53 was already noted ABSORBED by P-55 Phase 2b-ii). | ✅ CLOSED (won't-do) |
| **P-43** | ✅ RESOLVED 2026-06-03-d — the recurring cwd-leak class is STRUCTURALLY KILLED. The original absolute-`cd` fix (2026-05-22-g) was already in place but the leak kept recurring because absolute `cd /abs && cmd` LEAVES the persistent-shell cwd in `/abs` for the next command; this session wrapped every cd-bearing command in all three `.claude/commands/` templates (`scoreboard.md` + `deploy.md` + `ship-polish-item.md`) in a disposable sub-shell `( cd /abs && ... )` so the change is discarded on exit + refreshed the stale baselines. Build `ac9c8bf`; see ROADMAP P-43 + CORRECTIONS_LOG §Entry 2026-06-03-d. | ✅ RESOLVED |
| **P-50** | ✅ DONE/CLOSED 2026-06-03-e — the 🩺 "Condition Pathology" placeholder card was added at dashboard position 3 in both `WORKFLOW_DEFS` arrays; build `a107e42`, `main` `a51eea2 → a107e42`, director real-Chrome "PASS". See ROADMAP P-50 + the P-50 spec. | ✅ DONE |
| **P-63** | The self-serve central AI-model registry (models + company + thinking options + pricing) that auto-propagates to EVERY model picker, no hardcoded lists. Supersedes/extends P-52 + ABSORBS both P-52 carry-overs (Opus 4.8 pricing + the W#1 `AutoAnalyze.tsx` migration). **Phase 0 + Phase 1 + Phase 2 ✅ DEPLOYED-AND-VERIFIED** (Phase 2 = 2026-06-03-g, 4 staged deploys `759cfa3`/`5283cce`/`e0f42d3`/`d793179` + a Rule-32 drift fix `b4c3ab1`, all director PASS): there is now a live `/ai-models` admin screen (add / edit / remove / drag-reorder [see P-64]) backed by the DB table `AiModelRegistryEntry`; edits propagate to every dropdown with NO deploy; the W#2 run-batch route is now a registry consumer for BOTH validation + cost math (a self-serve model runs end-to-end). **Phase 3 = a FUTURE task (NOT next session): build the OpenAI/ChatGPT + Google Gemini provider adapters** so their models flip from `integration-pending` to `runnable` — fired when the director wants a non-Anthropic model live + supplies that provider's API/SDK docs (the in-UI integration-pending popover hands over the kickoff instruction). Canonical = `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` + ROADMAP P-63 + `docs/AI_MODEL_REGISTRY.md` + `docs/AI_MODEL_REGISTRY_PRIMER.md`. | Phase 2 ✅ DONE; Phase 3 FUTURE |
| **P-64** | ✅ DEPLOYED-AND-VERIFIED 2026-06-03-g — drag-reorder models on `/ai-models` (one global order; @dnd-kit ⠿ handle) → the saved order drives every AI-task dropdown, via a NEW `PATCH /api/ai-models` reorder endpoint (writes `sortOrder`); the dropdowns follow via the P-63 Phase-2c live hook. Build `835543d`, director real-Chrome PASS. See ROADMAP P-64 + the P-64 spec. | ✅ DONE |
| **P-26 / P-27** | Below-fold scroll-capture (P-26) + captured-video capture quirks (P-27: bug #9 Amazon hover-preview / bug #15 eBay native-controls) — ✅ **CLOSED (won't-do) 2026-06-03-h** (director). Alternate methods cover them: the "capture in two halves" workaround + spreadsheet exports (P-26); screen-recording P-45 is the preferred video path + #15 is a non-fixable Chrome limitation (P-27). | ✅ CLOSED (won't-do) |
| **P-52 carry-overs** | ABSORBED into P-63 — official Opus 4.8 pricing numbers + the deferred W#1 `AutoAnalyze.tsx` shared-list migration are now handled as part of the P-63 central registry (the W#1 piece stays W#1-owned per Rule 3; P-63's scope is platform-wide) | ABSORBED into P-63 |
| **P-56 Option-2** | ✅ CLOSED as WON'T-DO 2026-06-03-e (director) — the optional "kill the idle reading-time flicker too" (redraw only changed text) isn't worth a change-diffing redraw engine; the blocking bug stays fixed (P-56 CLOSED 2026-06-02-e); reopenable if ever wanted | CLOSED (won't-do) |
| **P-62** | Workflow-11 "Post Launch Optimization & Surveillance" card + page (spec exists) | FUTURE-WORKFLOW (not W#2) |

### Deferred graduation step (by design)

The DOCUMENTATION_ARCHITECTURE §5 Step 1 **Archive/Data-Contract split** for W#2
(`COMPETITION_SCRAPING_DESIGN.md` → a shelved `*_ARCHIVE.md` + a small
`*_DATA_CONTRACT.md`) and the finalized Human-Reference-Language Data Capture Interview
are intentionally **DEFERRED until W#3 is started and discovers a need to read W#2 data**
(director pick 2026-06-03; consistent with the architecture's own "create the Data
Contract on downstream need" rule). Until then, this primer's §3 pointers go straight to
the current design docs, which remain authoritative. See
`docs/WORKFLOW_GRADUATION_CONTINUITY_DESIGN.md` §4 for the tracking entry.

---

**Re-entry command:** `./catch-up-workflow 2` — switches to `workflow-2-competition-scraping`, pulls, and launches a session pointed at this primer. See `docs/HANDOFF_PROTOCOL.md` **Rule 33** for the methodology.
