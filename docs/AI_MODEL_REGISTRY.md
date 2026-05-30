# AI Model Registry

**Purpose:** the single canonical list of every place in PLOS where a user (director) picks an AI model, plus where each model's pricing lives. When a new Claude model ships, this doc tells you exactly which files to touch so the model becomes selectable everywhere and cost estimates stay accurate. When a new model-picker is added to the platform, it MUST be registered here per **HANDOFF_PROTOCOL.md Rule 32**.

**Created:** 2026-05-29-b (ROADMAP P-52 — AI model registry + central model-selection methodology + Opus 4.8 rollout). *(The build commit `5b9784a` carried a `2026-05-31-b` stamp here, written before the date-stamp drift was resolved this same session; corrected to the real calendar date `2026-05-29-b` in the end-of-session doc-batch — see CORRECTIONS_LOG §Entry 2026-05-29-b.)*

**Cross-references:**
- ROADMAP entry: **P-52**
- Methodology rule: `docs/HANDOFF_PROTOCOL.md` **Rule 32**
- Enforcement hook: `.claude/hooks/check-model-registry-drift.sh` (SessionStart — flags model-list/pricing *declaration sites* not registered below)
- W#2 model policy: `docs/REVIEWS_PHASE_2_DESIGN.md` §A.7 (Opus-only; Opus 4.7 default + 4.6/4.8 selectable)
- W#1 model-stability scoring (adjacent, NOT model-selection UI): `docs/MODEL_QUALITY_SCORING.md`

---

## 1. Declaration sites (source-of-truth model lists + pricing tables)

These files **declare** a model menu or a pricing table inline. They are the surfaces the enforcement hook watches: a declaration site that is not listed here will be flagged at session start.

| # | Surface | File | Workflow | Models offered | Default | Pricing source |
|---|---|---|---|---|---|---|
| 1 | Review-analysis model registry (the W#2 central list) | `src/lib/competition-scraping/review-analysis/models.ts` | W#2 Competition Scraping | Opus 4.8, Opus 4.7, Opus 4.6 | Opus 4.7 (`DEFAULT_MODEL_VERSION`) | `pricing.ts` (site #2) |
| 2 | Review-analysis pricing table | `src/lib/competition-scraping/review-analysis/pricing.ts` | W#2 Competition Scraping | Opus 4.8, Opus 4.7, Opus 4.6 (`MODEL_PRICING`) | — | self — cached from the Anthropic Models API; 4 rates per model (input / output / cache-write-5m / cache-read) |
| 3 | Keyword Clustering Auto-Analyze model picker | `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` | W#1 Keyword Clustering | Opus 4.8, Opus 4.7, Opus 4.6, Sonnet 4.6, Opus 4.5, Haiku 4.5 | Sonnet 4.6 | inline `AA_PRICING` (2 rates per model: input / output) |

**Note on the two different menus.** W#2 is **Opus-only** by locked policy (§A.7). W#1 offers a wider menu (including Sonnet/Haiku/older Opus). This is intentional — there is no single universal model list. Each declaration site owns its own menu; the registry tracks them all.

**Note on W#1 not yet sharing a constant.** W#1's `AutoAnalyze.tsx` still hardcodes its menu in three spots (`AA_PRICING`, the default `useState`, the `<select>` options). Migrating W#1 to read from a shared constant is a deferred cleanup (P-52 picker chose the smaller, safer inline addition for the live tool). Until then, adding a model to W#1 means editing all three spots in that one file.

## 2. Consumers (read the central list — do NOT declare their own)

These surfaces import from a declaration site rather than keeping their own copy. They do **not** need editing when a model is added (they pick it up automatically) and are **not** watched by the hook.

| Surface | File | Reads from |
|---|---|---|
| Per-review summarize modal | `…/competitor-reviews-analysis/components/PerReviewSummarizeModal.tsx` | `models.ts` (`SUPPORTED_MODEL_VERSIONS`) |
| Per-competitor summarize modal | `…/competitor-reviews-analysis/components/PerCompetitorSummarizeModal.tsx` | `models.ts` |
| Global competitor summarize modal | `…/competitor-reviews-analysis/components/GlobalCompetitorSummarizeModal.tsx` | `models.ts` |
| Per-competitor NON-bulleted (prose) modal | `…/competitor-reviews-analysis/components/PerCompetitorNonBulletedModal.tsx` | `models.ts` (`SUPPORTED_MODEL_VERSIONS`) |
| Global competitor NON-bulleted (prose) modal | `…/competitor-reviews-analysis/components/GlobalCompetitorNonBulletedModal.tsx` | `models.ts` (`SUPPORTED_MODEL_VERSIONS`) |
| Category AI run modal (bulleted + non-bulleted) | `…/reviews-analysis-by-category/components/CategoryAiRunModal.tsx` | `models.ts` (`SUPPORTED_MODEL_VERSIONS`) |
| SDK client seam (back-compat re-export) | `src/lib/competition-scraping/review-analysis/client.ts` | re-exports `models.ts` |
| Review-analysis batch handler (validator) | `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` | `client.ts` → `models.ts` (`DEFAULT_MODEL_VERSION` + `isSupportedModelVersion`) |

The browser extension has **no** model selection — nothing to register there.

## 3. How to add a new model (the checklist)

1. **W#2:** add the model id to `SUPPORTED_MODEL_VERSIONS` in `models.ts` (site #1). The 3 modals + the validator pick it up automatically.
2. **W#2 pricing:** add a `MODEL_PRICING` entry in `pricing.ts` (site #2) with the 4 per-MTok rates. If official numbers aren't available yet, use the same-tier placeholder and leave a `CONFIRM` comment.
3. **W#1:** add the model to all three spots in `AutoAnalyze.tsx` (site #3): an `AA_PRICING` entry, and an `<option>` in the model `<select>`. (Default `useState` only if it becomes the new default.)
4. **Defaults:** only change `DEFAULT_MODEL_VERSION` / W#1's default `useState` if the director wants the new model to be the default.
5. **Update this table** (rows above) with the new model id.
6. **Tests:** extend `models.test.ts` + `pricing.test.ts` to pin the new model.

## 4. Enforcement

`.claude/hooks/check-model-registry-drift.sh` runs at SessionStart. It scans `src/` for model-menu/pricing **declaration** patterns (`SUPPORTED_MODEL_VERSIONS = [`, `*_PRICING` tables, hardcoded `<option value="claude-…">`) and, for any declaration site whose file path is not referenced in §1 of this doc, emits a "🟠 MODEL REGISTRY DRIFT" reminder. This is a non-blocking nudge, not a gate — it surfaces an unregistered model-picker so Rule 32 can be honored.
