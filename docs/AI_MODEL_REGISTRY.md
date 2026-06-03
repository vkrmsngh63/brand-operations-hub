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
| 4 | **Platform-level AI-model registry (P-63 Phase 1 — the NEW single source of truth; CANONICAL home of the model list + pricing)** | `src/lib/ai-models/registry.ts` (+ `types.ts`, `provider-adapter.ts`, **`models.ts`** [`SUPPORTED_MODEL_VERSIONS` + `DEFAULT_MODEL_VERSION`], **`pricing.ts`** [`MODEL_PRICING` + cost-math]) | Platform-wide (W#1 + W#2) | Opus 4.8, Opus 4.7, Opus 4.6 (W#1's wider menu reconciled in Deploy 3) | Opus 4.7 (`DEFAULT_MODEL_ID` / `DEFAULT_MODEL_VERSION`) | self — `MODEL_PRICING` now lives here (`ai-models/pricing.ts`) | 

**Note on the two different menus.** W#2 is **Opus-only** by locked policy (§A.7); W#1 offers a wider menu (Sonnet/Haiku/older Opus too). There is no single universal model list — so site #4 encodes this with a per-record **`menus`** tag (`'review-analysis'` and/or `'keyword-clustering'`), and each picker calls `getModelsForMenu(<its menu>)`. The 3 Opus models are tagged for both menus; Sonnet 4.6 / Opus 4.5 / Haiku 4.5 are tagged for keyword-clustering only, so they never leak into W#2's Opus-only modals.

**Note — W#1 now shares the registry (P-63 Phase 1 Deploy 3).** `AutoAnalyze.tsx` no longer hardcodes its menu: the `<select>` maps `getModelsForMenu('keyword-clustering')` (friendly `displayLabel`s), pricing reads site #4's `MODEL_PRICING` via a local `aaPrice()` projection, and the thinking request param is built by `anthropicAdapter.mapThinkingOption` (adaptive→auto / enabled→extended / disabled→none). The only thing still local to the file is the default `useState('claude-sonnet-4-6')`. The supersedes P-52's deferred "smaller, safer inline addition" — adding a W#1 model is now a registry edit, not a 3-spot file edit.

**Note on site #4 — the in-progress consolidation (P-63).** Site #4 is the platform-level registry being built to SUPERSEDE sites #1–#3: a single data-driven source (company + model + thinking options + pricing) plus a provider-adapter integration seam, so every picker on the platform loads its options from one place and adding/removing a model propagates everywhere. **Phase 0 (current) is purely additive** — site #4 is seeded from sites #1/#2 and nothing consumes it yet, so sites #1–#3 remain authoritative for now. As later phases repoint consumers to site #4 and retire #1–#3, this table will be updated. See `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` for the full methodology, phasing, and the planned **`docs/AI_MODEL_REGISTRY_PRIMER.md`** (the catch-up guide for adding/removing/editing models + integrating a new company).

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
| Keyword Clustering Auto-Analyze picker (W#1) | `src/app/projects/[projectId]/keyword-clustering/components/AutoAnalyze.tsx` | **site #4** (`getModelsForMenu('keyword-clustering')` options + `MODEL_PRICING` pricing + `anthropicAdapter` thinking) |

**P-63 Phase 1 Deploy 2 (current):** all 7 W#2 review-analysis modals now render their model `<option>` list from site #4 via `getModelsForMenu('review-analysis')` instead of mapping `SUPPORTED_MODEL_VERSIONS` directly. Behaviour is identical (the menu still resolves to the 3 Opus ids in the same order, shown as raw ids). The per-menu `menus` tag on each registry record is what keeps W#2 Opus-only once W#1's wider menu lands in Deploy 3.

The browser extension has **no** model selection — nothing to register there.

## 3. How to add a new model (the checklist — registry-centric as of P-63 Phase 1)

**New model from an already-integrated provider (Anthropic today) — config only:**
1. **Pricing:** add a `MODEL_PRICING` row in `src/lib/ai-models/pricing.ts` (site #4) with the 4 per-MTok rates. If official numbers aren't available yet, use the same-tier placeholder + a `CONFIRM` comment.
2. **Registry record:** in `src/lib/ai-models/registry.ts` (site #4) add a friendly name to `ANTHROPIC_LABELS` and add the model to the seed — set `menus` (which pickers offer it: `'review-analysis'` for W#2, `'keyword-clustering'` for W#1, or both), `thinkingOptions`, `pricing`, `enabled`, and `runnableStatus: 'runnable'`.
3. **Pickers pick it up automatically** — every surface calls `getModelsForMenu(<its menu>)`, so no picker file needs editing. (For W#2 the model id must also stay valid for the run-batch validator, which still keys off `SUPPORTED_MODEL_VERSIONS`; add Opus-only W#2 ids there too — `ai-models/models.ts`.)
4. **Defaults:** only change a picker's local default if the new model should be the default (W#2 `DEFAULT_MODEL_VERSION` in `ai-models/models.ts`; W#1's `useState('…')` in `AutoAnalyze.tsx`).
5. **Tests:** extend `ai-models/registry.test.ts` + `ai-models/pricing.test.ts` to pin the new model + its menu tagging.

**New model from a NEW provider (OpenAI / Google / …) — needs integration:**
6. Add the registry record as above but with `runnableStatus: 'integration-pending'` (pickers render it disabled; it is never dispatched). Then ship a provider adapter in `provider-adapter.ts` + register it in `PROVIDER_ADAPTERS`, driven by that provider's uploaded API/SDK docs, and only then flip the model(s) to `runnable`. The `isProviderIntegrated` invariant (a runnable model MUST have a shipped adapter) is what keeps this issue-free. See the planned **`docs/AI_MODEL_REGISTRY_PRIMER.md`** for the full add-a-provider walkthrough.

## 4. Enforcement

`.claude/hooks/check-model-registry-drift.sh` runs at SessionStart. It scans `src/` for model-menu/pricing **declaration** patterns (`SUPPORTED_MODEL_VERSIONS = [`, `*_PRICING` tables, hardcoded `<option value="claude-…">`) and, for any declaration site whose file path is not referenced in §1 of this doc, emits a "🟠 MODEL REGISTRY DRIFT" reminder. This is a non-blocking nudge, not a gate — it surfaces an unregistered model-picker so Rule 32 can be honored.
