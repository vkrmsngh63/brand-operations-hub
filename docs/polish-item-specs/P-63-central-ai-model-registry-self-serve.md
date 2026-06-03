# P-63 — Self-serve central AI-model registry (single source of truth → auto-propagates to every model picker)

**Status:** 🟢 PHASE 0 BUILT 2026-06-03-e (`session_2026-06-03-e`). Architecture designed WITH director (4-question picker, all answered); the purely-additive platform-level foundation module is built + green on `workflow-2-competition-scraping` (pending deploy decision). Captured per Rule 31. Extends P-52 (`docs/AI_MODEL_REGISTRY.md` + Rule 32) from a *documentation* registry into a *data-driven, self-serve* one. Platform-wide (touches W#1 + W#2 + a new admin surface).

**Severity:** N/A (new capability, not a bug). Effort: LARGE / multi-session.

---

## §1 — Original director instructions (VERBATIM, append-only)

> **2026-06-03-e:** "Instead of individually plugging in the Opus 4.8 pricing numbers, let's come up with a new methodology that places the AI models, their pricing etc into a central place so that when the user wants to remove an AI model from the platform, they can go to that place and remove the old model and when the user wants to add a new model to the platform, they can add the company name, model name and pricing into that central place. This central place should keep track of all the places where an AI model can be selected by the user to run a specific task and updating the AI model in the central place should autonatically deploy the model choices and prices throughout the platform where model options are given. We already have a place where we are keeping track of all the places where AI models choices are given to run AI tasks, perhaps we can use this. This new methodology should code the AI task overlays in such a way that it will load up the AI models choices and prices, etc from this central place. Note that when the user wants to add a new model option to the central place, they should first select the company (Anthropic, ChatGPT, Google Gemini, etc), then pick the model and also pick the thinking options the user wants to offer within the model (Extra thinking, fast, auto, etc), then specify the prices. Please think about this carefully so that you can identify how we can not only update the existing AI overlays in a way that prevents issues but employs a methodology that ensures this process is issue-free. For example, as part of adding a new model, should user upload API integration documents for the model and have you think about integration?"

> **2026-06-03-e (follow-up, in response to the design picker):** "I have two questions related to this approach. Will there be a primer that you can create (and give me the instructions on how to point you to it when the time comes) that will tell you what approach we took and how to integrate a new company, model, etc into this central system we are developing so that if I need to add/remove/edit anything with the available AI models, I can do so easily? Secondly, will you ensure that whatever changes we make to the existing places where the AI model choices are available, that they will not break anything in those tasks?"
>
> **2026-06-03-e (on new-provider handling):** "Not only Save as 'integration pending' but also create a cooltip or popover that is shown when that option is picked that gives precise instructions to me on what instructions to give you so that you can get caught up on how we designed this AI updating system and what to do next to get that AI model LIVE."

### Plain restatement (for traceability — NOT a substitute for §1)

Build a single central registry of AI models (company + model + thinking options + pricing). A self-serve UI lets the user add/remove models. Every model-selection overlay on the platform loads its choices + prices FROM this registry (no hardcoded lists). Add/remove in the registry → propagates everywhere automatically. The "add a model" flow: pick company → pick model → pick which thinking options to offer → enter pricing. The methodology must be **issue-free**, including the integration question (does adding a model need API-integration docs + Claude designing the integration?).

**Two director guarantees requested (2026-06-03-e):** (1) a **continuity primer** (`docs/AI_MODEL_REGISTRY_PRIMER.md`) that documents the chosen approach + how to add/remove/edit a model + how to integrate a new company, with a one-line pointer command the director gives Claude to load it on demand; (2) an explicit **non-breaking guarantee** for every change to the existing model-picker surfaces. **Plus** an in-UI **popover** on any `integration-pending` model that tells the director the exact instruction to give Claude to get that model LIVE (it points at the primer).

---

## §2 — Rule 3 code-truth audit (2026-06-03-e, three parallel Explore agents)

**Today's state (partial, W#2-scoped registry + one hardcoded W#1 list):**

- **W#2 central constants:** `src/lib/competition-scraping/review-analysis/models.ts` (`DEFAULT_MODEL_VERSION` + `SUPPORTED_MODEL_VERSIONS` = Opus 4.8/4.7/4.6; SDK-free so client components can import it) + `pricing.ts` (`MODEL_PRICING` 4-component per-MTok table; Opus-4.8 row is PLACEHOLDER pending official numbers). **6 W#2 modals already import** `SUPPORTED_MODEL_VERSIONS` (PerReview / PerCompetitor[NonBulleted] / GlobalCompetitor[NonBulleted] / Category / Type run-modals). This is the existing "central place" the director references.
- **W#1 still hardcodes its own list:** `keyword-clustering/components/AutoAnalyze.tsx` — inline `<select>` of 6 models (Opus 4.8/4.7/4.6, Sonnet 4.6, Opus 4.5, Haiku 4.5), inline `AA_PRICING`, inline `useState` default. NOT centralized (P-52 deferred this migration). It is ALSO the ONLY surface that offers **thinking options** today (`thinkingMode` adaptive/enabled/disabled + `thinkingBudget`).
- **The documentation registry:** `docs/AI_MODEL_REGISTRY.md` enumerates §1 declaration sites + §2 consumers. `.claude/hooks/check-model-registry-drift.sh` (Rule 32, SessionStart) flags any unregistered declaration site. This is a DOC + a lint hook — NOT runtime data the app loads.
- **Execution / integration:** **Anthropic-only.** `@anthropic-ai/sdk` is the sole AI SDK in `package.json`. The selected model id flows as a plain string into `anthropicClient.messages.create({ model })` — **no provider branching, no adapter seam.** W#2 runs server-side (`ANTHROPIC_API_KEY` env); W#1 AutoAnalyze runs browser-direct (user key in localStorage) OR server-proxy. Thinking maps to Anthropic `thinking: {type, budget_tokens}`. **Adding a new model from an already-wired provider = string/config change; adding a NEW provider (OpenAI/Gemini) = real adapter code at every call site.**

---

## §3 — Proposed methodology (the two-layer principle)

The key to "issue-free" is separating two layers that look like one:

### Layer A — Presentation/config (fully data-driven, safe to auto-propagate)
A single registry record per model: `company/provider`, `modelId`, `displayLabel`, `thinkingOptionsOffered[]`, `pricing{input,output,cacheWrite,cacheRead}`, `isDefault`, `enabled`, and a **`runnableStatus`** (integrated vs presentation-only). Every picker on the platform becomes a *consumer* that loads options from this registry at render. Add/remove/edit once → every dropdown updates everywhere. Pure data ⇒ no code risk.

### Layer B — Integration/adapter (code; cannot be pure config)
Introduce a `AiProviderAdapter` interface (build-request / call / parse-usage / map-thinking-option). Each provider ships one adapter. The run path dispatches by the model's provider. **A model is runnable only if its provider has a shipped adapter.**
- New model, **existing** provider (e.g. another Claude) → config-only, instantly runnable, **no API docs needed**.
- New **provider** (OpenAI/Gemini) → registry records it but marks **"integration pending — not runnable yet"**; the picker shows it disabled/labeled; making it runnable is a guided adapter build with Claude where **uploading that provider's API/SDK docs is exactly the input** used to write + test the adapter, then flip to runnable.

**Direct answer to the director's API-docs question:** YES — but only for a NEW PROVIDER, not for a new model of an already-integrated provider. The not-runnable-until-adapter-exists gate is what makes the whole thing issue-free (prevents the trap of a user adding Gemini, it appearing in dropdowns, and runs silently failing).

### Proposed phasing (Rule 23 — change a data shape only behind an audit)
- **Phase 0:** promote `models.ts`/`pricing.ts` to a platform-level module + introduce the Anthropic adapter seam with ZERO behavior change (all green).
- **Phase 1:** every picker (6 W#2 modals + W#1 AutoAnalyze) loads from the central registry — kills the last hardcoded list.
- **Phase 2:** DB-backed storage + the admin "add a model" wizard (company → model → thinking options → pricing).
- **Phase 3:** a second-provider adapter when the director actually wants OpenAI/Gemini (docs-driven build).

---

## §4 — Design decisions (director-answered 2026-06-03-e)

- **D1 — Storage:** ⏳ DEFERRED to Phase 2 (does NOT block Phase 0/1; the registry accessors are a storage seam — `getAiModelRegistry()` reads an in-code seed today and only its body changes when we move to DB). Director asked two clarifying questions instead of picking (see §1 follow-up) — both answered YES (primer will be created; non-breaking is guaranteed, and Phase 0 is provably non-breaking because additive). **Recommendation to confirm before Phase 2:** DB-backed for true self-serve runtime add/remove.
- **D2 — New-provider handling:** ✅ Save as `integration-pending` (NOT block) **+ an in-UI popover** on the pending model giving the director the precise instruction to give Claude to get it LIVE (the popover points at `AI_MODEL_REGISTRY_PRIMER.md`). The `RunnableStatus` field + the `isProviderIntegrated` invariant (provider-adapter.ts) encode this; the popover is a Phase 2 UI deliverable.
- **D3 — Scope/phasing:** ✅ Platform-wide, incl. W#1 AutoAnalyze migration.
- **D4 — Admin surface placement:** ⏳ DEFERRED to Phase 2 (a global platform-level "AI Models" admin page is the working assumption; confirm at Phase 2).
- **D5 — This-session action:** ✅ Start Phase 0 now (done — see §6).

## §6 — Phase 0 as built (2026-06-03-e) — PURELY ADDITIVE, provably non-breaking

New platform-level module under `src/lib/ai-models/` (nothing existing was edited, so no current model picker or AI task can break — directly satisfies the director's non-breaking guarantee):
- `types.ts` — `AiProviderId` / `ThinkingOptionId` / `RunnableStatus` / `AiModelRecord`; re-exports `ModelPricing`/`TokenUsage` from the existing W#2 pricing module (single source of pricing math).
- `registry.ts` — `AiModelRecord[]` seeded FROM the existing W#2 `models.ts` list + `pricing.ts` numbers (no duplication) + storage-seam accessors (`getAiModelRegistry` / `getEnabledModels` / `getRunnableModels` / `getModelById` / `getModelByModelId` / `isModelRunnable` / `getDefaultModelId`). Phase 2 changes ONLY these accessor bodies to read from DB.
- `provider-adapter.ts` — the `AiProviderAdapter` interface + the shipped `anthropicAdapter` (`mapThinkingOption` mirrors W#1 AutoAnalyze's current `{type:'enabled',budget_tokens}` / `{type:'adaptive'}` / omitted shape) + `getAdapter` / `isProviderIntegrated`. NOT yet wired into the 12 live `messages.create` call sites (that is Phase 1).
- `registry.test.ts` + `provider-adapter.test.ts` — +15 node:test, incl. the core issue-free INVARIANT ("every runnable model has an integrated provider").
- Registered as site #4 in `docs/AI_MODEL_REGISTRY.md` §1 (Rule 32 hook stays clean).

**Temporary dependency direction:** Phase 0's platform module imports FROM the W#2 review-analysis module (to avoid duplicating data). Phase 1 inverts this — physically moves the source-of-truth down into `ai-models/` and leaves back-compat re-export shims at the old W#2 paths so existing imports keep working unchanged.

## §7 — Remaining phases (the build plan)

- **Phase 1 (next):** repoint every consumer to site #4 — all 6 W#2 modals + W#1 AutoAnalyze load options/labels/pricing/thinking from the registry; route the live `messages.create` calls through the adapter (zero behavior change for Anthropic); physically move `models.ts`/`pricing.ts` under `ai-models/` with back-compat shims; reconcile W#1's thinking options into `thinkingOptions`. Each surface migrated + verified one at a time, scoreboard green between each.
- **Phase 2:** DB-backed storage (Prisma model) behind the SAME accessors + the admin "add a model" wizard (company → model → thinking options → pricing) + the `integration-pending` popover (D2). Confirm D1 + D4 first.
- **Phase 3:** a second-provider adapter (OpenAI / Google) when the director wants one — docs-driven build that flips that provider's models from `integration-pending` to `runnable`.
- **Primer deliverable:** create `docs/AI_MODEL_REGISTRY_PRIMER.md` (the director's requested catch-up guide) once the architecture stabilizes (target: end of Phase 1 / start of Phase 2), with a one-line pointer command for the director.

---

## §5 — Cross-references

- **P-52** (`docs/AI_MODEL_REGISTRY.md`, Rule 32) — the existing documentation registry + drift hook this supersedes/extends; the two open P-52 carry-overs (Opus 4.8 official pricing; W#1 AutoAnalyze shared-list migration) are ABSORBED by this work.
- `src/lib/competition-scraping/review-analysis/models.ts` + `pricing.ts` — the seed data + the module to promote.
- `docs/COMPETITION_SCRAPING_PRIMER.md` §5 — W#2 residue (P-52 carry-overs).
- `docs/MULTI_WORKFLOW_PROTOCOL.md` §11 — branch model (platform-wide infra → likely `main`-scoped).
