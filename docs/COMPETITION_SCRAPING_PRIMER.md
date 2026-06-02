# Competition Scraping (W#2) — Continuity Primer

**Read this first when returning to W#2 to fix or extend it.** It is the map; the
docs it links are the territory. After reading this plus whichever linked docs your
task needs, you should be able to continue W#2 seamlessly from where it was left —
without relying on Claude's auto-memory (which is not authoritative; everything
load-bearing is in these git-tracked files).

**Branch:** `workflow-2-competition-scraping` · **Live at:** vklf.com
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

## 5. OPEN items at graduation

Read `docs/ROADMAP.md` (search "W#2" + the P-IDs) for the authoritative list. As of
graduation the notable open items include: **P-58** (MEDIUM — the in-app
Download-Extension button should serve the LATEST build; the next pick), **P-57** (MEDIUM
— fill the delete-coverage gaps for reviews / videos / category-labels), **P-61** (MEDIUM
— extension server-side default categories per platform per content-type;
spec `docs/polish-item-specs/P-61-extension-default-categories.md`), plus the
lower-priority residue: **P-59** (update `DetailedUserGuide.tsx`), **P-60** (open-detail
↗ icon on the 3 analysis tables), **P-53** (on-page "Export Table" button — largely
absorbed by P-55), **P-43** (add absolute `cd` prefix to all `scoreboard.md` Bash
commands — recurring cwd-leak), **P-50** (NEW Condition Pathology card), **P-26/P-27**
(below-fold scroll / capture bugs, low priority), and the two **P-52** carry-overs
(Opus 4.8 pricing numbers + the W#1 `AutoAnalyze.tsx` shared-list migration).
**P-56** (the Amazon Highlight-Terms flicker that blocked selecting sentences for
capture) is now ✅ CLOSED — DEPLOYED-AND-VERIFIED 2026-06-02-e on real Amazon (the
deferred P-20 real-Amazon verification is resolved); the only residue is an optional
"kill the idle reading-time flash too" Option-2 follow-up. **P-55** (Comprehensive
Analysis files + editable primer) is essentially complete. **P-54** + **P-49 W#2** are
CLOSED.

---

**Re-entry command:** `./catch-up-workflow 2` — switches to `workflow-2-competition-scraping`, pulls, and launches a session pointed at this primer. See `docs/HANDOFF_PROTOCOL.md` **Rule 33** for the methodology.
