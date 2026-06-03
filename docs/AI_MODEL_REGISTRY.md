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
| 1 | ~~Review-analysis model registry~~ → **back-compat shim** (P-63 Phase 1) | `src/lib/competition-scraping/review-analysis/models.ts` | W#2 Competition Scraping | re-exports site #4's list (canonical declarations MOVED to `ai-models/models.ts`) | — | re-export shim — no longer declares |
| 2 | ~~Review-analysis pricing table~~ → **back-compat shim** (P-63 Phase 1) | `src/lib/competition-scraping/review-analysis/pricing.ts` | W#2 Competition Scraping | re-exports site #4's `MODEL_PRICING` + cost-math (canonical MOVED to `ai-models/pricing.ts`) | — | re-export shim — no longer declares |
| 3 | ~~Keyword Clustering Auto-Analyze model picker~~ → **consumer of site #4** (P-63 Phase 1 Deploy 3) | `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` | W#1 Keyword Clustering | reads `getModelsForMenu('keyword-clustering')` — no inline list | Sonnet 4.6 (local `useState` default) | site #4 `MODEL_PRICING` (via `aaPrice()`); thinking via `anthropicAdapter` |
| 4 | **Platform-level AI-model registry — accessors + adapter seam** (P-63 Phase 1; the registry's logic. The in-code SEED + accessors; as of Phase 2a the live runtime source is the DB table `AiModelRegistryEntry`, read through these same accessors / `server-registry.ts`) | `src/lib/ai-models/registry.ts` (+ `types.ts`, `provider-adapter.ts`) | Platform-wide (W#1 + W#2) | Opus 4.8, Opus 4.7, Opus 4.6 (W#1's wider menu reconciled in Deploy 3) | Opus 4.7 (`DEFAULT_MODEL_ID` / `DEFAULT_MODEL_VERSION`) | via site #6 (`MODEL_PRICING`) |
| 5 | **Model list declaration** (`SUPPORTED_MODEL_VERSIONS` + `DEFAULT_MODEL_VERSION`) — the canonical W#2 model-id list + default | `src/lib/ai-models/models.ts` | Platform-wide (seeds the registry; W#2 run-batch validator) | Opus 4.8, Opus 4.7, Opus 4.6 | Opus 4.7 (`DEFAULT_MODEL_VERSION`) | n/a (list only) |
| 6 | **Pricing table declaration** (`MODEL_PRICING` + cost-math) — the canonical per-model per-MTok rates | `src/lib/ai-models/pricing.ts` | Platform-wide (W#1 + W#2 cost math) | all 6 ids (3 Opus + Sonnet 4.6 / Opus 4.5 / Haiku 4.5) | — | self (numeric literals; Opus 4.8 PLACEHOLDER pending official numbers) |

**Note on the two different menus.** W#2 is **Opus-only** by locked policy (§A.7); W#1 offers a wider menu (Sonnet/Haiku/older Opus too). There is no single universal model list — so site #4 encodes this with a per-record **`menus`** tag (`'review-analysis'` and/or `'keyword-clustering'`), and each picker calls `getModelsForMenu(<its menu>)`. The 3 Opus models are tagged for both menus; Sonnet 4.6 / Opus 4.5 / Haiku 4.5 are tagged for keyword-clustering only, so they never leak into W#2's Opus-only modals.

**Note — W#1 now shares the registry (P-63 Phase 1 Deploy 3).** `AutoAnalyze.tsx` no longer hardcodes its menu: the `<select>` maps `getModelsForMenu('keyword-clustering')` (friendly `displayLabel`s), pricing reads site #4's `MODEL_PRICING` via a local `aaPrice()` projection, and the thinking request param is built by `anthropicAdapter.mapThinkingOption` (adaptive→auto / enabled→extended / disabled→none). The only thing still local to the file is the default `useState('claude-sonnet-4-6')`. The supersedes P-52's deferred "smaller, safer inline addition" — adding a W#1 model is now a registry edit, not a 3-spot file edit.

**Note on site #4 — the consolidation is COMPLETE + SELF-SERVE (P-63 Phase 2, 2026-06-03-g).** Site #4 is the platform-level registry that now SUPERSEDES sites #1–#3 as the single source of truth: a data-driven source (company + model + thinking options + pricing) plus a provider-adapter integration seam, so every picker loads from one place and add/remove/edit/reorder propagates everywhere. **The live runtime source is now the DB table `AiModelRegistryEntry`** (seeded on first read from the in-code seed at site #4 / sites #5/#6), read through the same accessors + `server-registry.ts` + the DI-seam handler `src/lib/ai-models/handlers/ai-model-registry.ts`. Sites #1/#2 are back-compat re-export shims; site #3 (W#1 AutoAnalyze) is a live consumer. The self-serve `/ai-models` admin screen lets the director add/remove/edit/reorder models in the browser; the dropdowns + the W#2 run-path validation + cost math all read the registry. See `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` for the full methodology + phasing, `docs/polish-item-specs/P-64-ai-models-reorder.md` for the reorder, and **`docs/AI_MODEL_REGISTRY_PRIMER.md`** (the catch-up guide — now reflects that everyday add/remove/edit/reorder is done on the screen, and Phase 3 = connecting a new AI company).

## 2. Consumers (read the central list — do NOT declare their own)

These surfaces import from a declaration site rather than keeping their own copy. They do **not** need editing when a model is added (they pick it up automatically) and are **not** watched by the hook.

| Surface | File | Reads from |
|---|---|---|
| Per-review summarize modal | `…/competitor-reviews-analysis/components/PerReviewSummarizeModal.tsx` | **site #4** `ai-models/registry.ts` (`getModelsForMenu('review-analysis')`) |
| Per-competitor summarize modal | `…/competitor-reviews-analysis/components/PerCompetitorSummarizeModal.tsx` | **site #4** (`getModelsForMenu('review-analysis')`) |
| Global competitor summarize modal | `…/competitor-reviews-analysis/components/GlobalCompetitorSummarizeModal.tsx` | **site #4** (`getModelsForMenu('review-analysis')`) |
| Per-competitor NON-bulleted (prose) modal | `…/competitor-reviews-analysis/components/PerCompetitorNonBulletedModal.tsx` | **site #4** (`getModelsForMenu('review-analysis')`) |
| Global competitor NON-bulleted (prose) modal | `…/competitor-reviews-analysis/components/GlobalCompetitorNonBulletedModal.tsx` | **site #4** (`getModelsForMenu('review-analysis')`) |
| Category AI run modal (bulleted + non-bulleted) | `…/reviews-analysis-by-category/components/CategoryAiRunModal.tsx` | **site #4** (`getModelsForMenu('review-analysis')`) |
| Type AI run modal (bulleted + non-bulleted) | `…/reviews-analysis-by-type/components/TypeAiRunModal.tsx` | **site #4** (`getModelsForMenu('review-analysis')`) |
| SDK client seam (back-compat re-export) | `src/lib/competition-scraping/review-analysis/client.ts` | re-exports `models.ts` shim → site #4 |
| Review-analysis batch handler (validator) | `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` | `client.ts` → `models.ts` shim → site #4 (`DEFAULT_MODEL_VERSION` + `isSupportedModelVersion`) |
| Keyword Clustering Auto-Analyze picker (W#1) | `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` | **site #4 — LIVE DB fetch** (`useModelsForMenu('keyword-clustering')` → DB registry, seed fallback) + `MODEL_PRICING` pricing + `anthropicAdapter` thinking |
| `/ai-models` self-serve admin screen (P-63 Phase 2b) | `src/app/ai-models/` (+ pure logic `src/lib/ai-models/admin-ui.ts`) | the DB table `AiModelRegistryEntry` via the CRUD + reorder API (`/api/ai-models`, `/api/ai-models/[id]`) — reads/writes models |
| The live picker hook (P-63 Phase 2c) | `useModelsForMenu` (client) + `selectMenuModels` (pure) | fetches the DB registry (seed fallback) + filters enabled+runnable+menu — the source every dropdown now reads |
| W#2 review-analysis run-batch route — validation + cost math (P-63 Phase 2d) | `src/lib/competition-scraping/handlers/review-analysis-run-batch.ts` (+ `src/lib/ai-models/server-registry.ts`) | **the registry** — accepts any runnable+review-analysis-tagged model (static Opus list as fallback); cost math resolves registry pricing via polymorphic `calculateCostUsd`/`estimateCostUsd` (`string \| ModelPricing`) |

**P-63 Phase 2 (current — 2026-06-03-g):** the registry is now SELF-SERVE + DB-backed. The live runtime source is the DB table `AiModelRegistryEntry` (seeded on first read from the in-code list at site #4), read/written via the CRUD + reorder API behind the DI-seam handler `src/lib/ai-models/handlers/ai-model-registry.ts`. The `/ai-models` admin screen (add / edit / remove / drag-reorder [P-64]) writes the DB; every picker reads it LIVE via `useModelsForMenu` (seed fallback), so admin edits propagate everywhere with NO deploy. The W#2 run path is now a registry consumer for BOTH validation AND cost math (Phase 2d) — so a self-serve model runs end-to-end. The per-menu `menus` tag + the `runnable`-vs-`integration-pending` gate keep it issue-free (W#2 stays Opus-only; a model can't run without a shipped adapter). _(Earlier: Phase 1 Deploy 2 repointed the 7 W#2 modals to `getModelsForMenu('review-analysis')` against the in-code seed; Phase 2c replaced that with the live DB fetch.)_

The browser extension has **no** model selection — nothing to register there.

## 3. How to add a new model (the checklist — registry-centric as of P-63 Phase 1; SELF-SERVE as of Phase 2)

**Self-serve (Phase 2 — the normal path now):** for a model from an already-integrated provider, the director adds/edits/removes/reorders models directly on the **`/ai-models` admin screen** (no code, no deploy — the DB table `AiModelRegistryEntry` is the live source + every picker reads it live). The code-edit checklist below is the underlying mechanism + the path for seeding new in-code defaults or adding a NEW provider (Phase 3).

**New model from an already-integrated provider (Anthropic today) — config only:**
1. **Pricing:** add a `MODEL_PRICING` row in `src/lib/ai-models/pricing.ts` (site #4) with the 4 per-MTok rates. If official numbers aren't available yet, use the same-tier placeholder + a `CONFIRM` comment.
2. **Registry record:** in `src/lib/ai-models/registry.ts` (site #4) add a friendly name to `ANTHROPIC_LABELS` and add the model to the seed — set `menus` (which pickers offer it: `'review-analysis'` for W#2, `'keyword-clustering'` for W#1, or both), `thinkingOptions`, `pricing`, `enabled`, and `runnableStatus: 'runnable'`.
3. **Pickers pick it up automatically** — every surface calls `getModelsForMenu(<its menu>)`, so no picker file needs editing. (For W#2 the model id must also stay valid for the run-batch validator, which still keys off `SUPPORTED_MODEL_VERSIONS`; add Opus-only W#2 ids there too — `ai-models/models.ts`.)
4. **Defaults:** only change a picker's local default if the new model should be the default (W#2 `DEFAULT_MODEL_VERSION` in `ai-models/models.ts`; W#1's `useState('…')` in `AutoAnalyze.tsx`).
5. **Tests:** extend `ai-models/registry.test.ts` + `ai-models/pricing.test.ts` to pin the new model + its menu tagging.

**New model from a NEW provider (OpenAI / Google / …) — needs integration:**
6. Add the registry record as above but with `runnableStatus: 'integration-pending'` (pickers render it disabled; it is never dispatched; the `/ai-models` admin screen also shows the integration-pending popover with the exact Claude kickoff instruction). Then ship a provider adapter in `provider-adapter.ts` + register it in `PROVIDER_ADAPTERS`, driven by that provider's uploaded API/SDK docs, and only then flip the model(s) to `runnable`. The `isProviderIntegrated` invariant (a runnable model MUST have a shipped adapter) is what keeps this issue-free. **This is P-63 Phase 3 (OpenAI/ChatGPT + Google Gemini) — a FUTURE task fired when the director supplies that provider's docs.** See **`docs/AI_MODEL_REGISTRY_PRIMER.md`** for the full add-a-provider walkthrough.

## 4. Enforcement

`.claude/hooks/check-model-registry-drift.sh` runs at SessionStart. It scans `src/` for model-menu/pricing **declaration** patterns (`SUPPORTED_MODEL_VERSIONS = [`, `*_PRICING` tables, hardcoded `<option value="claude-…">`) and, for any declaration site whose file path is not referenced in §1 of this doc, emits a "🟠 MODEL REGISTRY DRIFT" reminder. This is a non-blocking nudge, not a gate — it surfaces an unregistered model-picker so Rule 32 can be honored.
