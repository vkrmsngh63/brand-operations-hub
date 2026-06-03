# AI Model Registry — Primer (how to add / remove / edit AI models)

**This is the catch-up guide you (the director) asked for.** When you want to add, remove, or edit an AI model anywhere on the platform — or wire up a brand-new AI company — point Claude at this file and it will know exactly how the system was designed and what to do next.

## The one-line pointer to give Claude

> **"Read `docs/AI_MODEL_REGISTRY_PRIMER.md`, then help me add / remove / edit an AI model."**

That single sentence is enough. Claude reads this file, re-learns the whole design, and walks you through the change.

---

## What this system is (in plain terms)

There is now **one central place** that holds every AI model the platform can use — the model, its company, its thinking options, and its pricing. Every dropdown where you pick an AI model reads from this one place. So when you add or remove a model here, it appears or disappears **everywhere** automatically. No hardcoded lists anywhere.

It is built in **two deliberately-separate layers** — this separation is what makes changes safe:

1. **The list layer (always safe to change).** The models, their friendly names, which dropdowns they appear in, their thinking options, and their prices. Changing this is pure data — it can never break a running task.
2. **The connection layer (code).** The actual wiring that lets a model *run*. Each AI company (Anthropic, OpenAI, Google, …) needs a "connection" (an *adapter*) written once.

**The safety rule that makes it issue-free:** a model can be marked **"ready to run" only if its company's connection already exists.** If you add a model from a company we haven't connected yet, it is saved as **"integration pending"** — it shows up disabled and is never actually used — so you can never end up with a model that looks available but silently fails.

---

## Where it lives (for Claude)

All under `src/lib/ai-models/`:

| File | What it holds |
|---|---|
| `registry.ts` | The list of models (the seed) + the accessors every picker reads (`getModelsForMenu`, `getEnabledModels`, `getRunnableModels`, …). **This is the single source of truth.** |
| `pricing.ts` | The pricing table (`MODEL_PRICING`, 4 per-MTok rates) + the cost math. |
| `types.ts` | The shape of a model record (`AiModelRecord`), the menu ids (`AiPickerMenuId`), the thinking options (`ThinkingOptionId`), the runnable status. |
| `provider-adapter.ts` | The connection layer — the `AiProviderAdapter` interface + each company's shipped adapter (today: `anthropicAdapter`). `isProviderIntegrated` is the safety gate. |
| `handlers/ai-model-registry.ts` | The DI-seam handler behind the CRUD + reorder API (`/api/ai-models` GET/POST/PATCH-reorder, `/api/ai-models/[id]` PUT/DELETE) — reads/writes the DB table `AiModelRegistryEntry` with seed-on-read. (Phase 2a/2/P-64.) |
| `server-registry.ts` | Server-only registry reads for the W#2 run path (validation + cost-math resolution from the DB). (Phase 2d.) |
| `admin-ui.ts` | The pure logic behind the `/ai-models` admin screen (the Add-a-model wizard + table). (Phase 2b.) |
| `useModelsForMenu` (client hook) + `selectMenuModels` (pure) | The live client fetch every picker uses — pulls the DB registry (seed fallback) + filters enabled+runnable+menu. (Phase 2c.) |
| `registry.test.ts`, `provider-adapter.test.ts`, + the handler / admin-ui / server-registry / reorder tests | The guardrail tests — including the invariant "every runnable model has a shipped connection." |

The canonical site map + per-surface consumer list is `docs/AI_MODEL_REGISTRY.md` (§1 declaration sites, §2 consumers, §3 the add-a-model checklist). This primer is the friendly companion to that reference.

**The "menus" concept.** Different screens offer different model lists on purpose — W#2 (Competition Scraping review analysis) is Opus-only; W#1 (Keyword Clustering Auto-Analyze) offers a wider menu. Each model record carries a `menus` tag saying which screens offer it, and each dropdown asks for `getModelsForMenu(<its menu>)`. Today's menus: `'review-analysis'` (W#2) and `'keyword-clustering'` (W#1).

---

## The three things you'll want to do

### 1. Add a model from a company we ALREADY use (e.g. another Claude model)

This is **config only — no new code, instantly usable.** Claude will:
1. Add a pricing row in `pricing.ts` (4 per-MTok rates; if official numbers aren't out yet, a same-tier placeholder + a CONFIRM note).
2. Add the model to the seed in `registry.ts` — friendly name, which `menus` should offer it, its thinking options, `runnableStatus: 'runnable'`.
3. (Done.) Every dropdown tagged for that menu shows it automatically.
4. Extend the guardrail tests + run the scoreboard, then deploy under your approval.

**What you provide:** the company (already integrated), the model id, which screens should offer it, the thinking options to offer, and the prices.

### 2. Remove or edit a model

- **Remove:** Claude deletes (or disables via `enabled: false`) that record in `registry.ts`. It disappears from every dropdown at once.
- **Edit (rename, reprice, change which screens show it, change thinking options):** Claude edits that one record / its pricing row. The change propagates everywhere.

### 3. Add a model from a NEW company (OpenAI, Google Gemini, …)

This one needs a connection built — and **this is exactly where you upload that company's API / SDK documentation.** Claude will:
1. Add the model record now, marked **`integration-pending`** — it shows up disabled in the dropdowns, never run. (You'll see a note telling you it's pending.)
2. Use the **API/SDK docs you upload** to write + test that company's adapter in `provider-adapter.ts` and register it.
3. Only then flip the model(s) to `runnable`. The invariant test refuses to let a model be runnable before its adapter exists.

**What you provide:** the company, the model(s), prices, thinking options — **and that company's API/SDK integration docs** (a link or uploaded file) so Claude can build the connection.

---

## The guarantees you asked for

- **Nothing breaks.** Every picker reads from the registry through stable accessors; changing the list is data, not code. The connection layer is the only place code changes, and a model can't go live until its connection is proven. The guardrail tests + the pre-deploy scoreboard catch any regression before it reaches the live site.
- **One place, propagates everywhere.** Add/remove/edit once in `registry.ts` → every dropdown updates. No hunting through files.
- **No silent failures.** The runnable-vs-integration-pending gate means a model can never appear usable while secretly lacking a connection.

---

## Status (as of P-63 Phase 2 — SELF-SERVE IS NOW LIVE)

- **Connected companies:** Anthropic (Claude) — the only adapter shipped today.
- **Models in the registry:** Opus 4.8 / 4.7 / 4.6 (both menus), Sonnet 4.6 / Opus 4.5 / Haiku 4.5 (Keyword Clustering only) — all runnable. **The live runtime source is now the database table `AiModelRegistryEntry`** (seeded from the in-code list on first read, then editable in the browser); the in-code seed + accessors remain the fallback.
- **Pickers reading from the registry:** the 7 W#2 review-analysis modals + W#1 Auto-Analyze — all now read the database LIVE via the `useModelsForMenu` client hook, so your admin-screen edits show up in every dropdown with NO code deploy.
- **✅ SHIPPED (Phase 2, 2026-06-03-g):** the self-serve **`/ai-models` admin screen** at vklf.com — a models table where you **add** (a 4-step wizard: company → model → which screens + thinking options → pricing), **edit**, **remove**, and **drag-to-reorder** models yourself (the saved order drives every dropdown — P-64). Adding a model from a not-yet-connected company saves it as **integration pending** and shows the in-screen popover that hands you the exact instruction to give Claude to get it LIVE. The W#2 run path (validation + cost math) now reads the registry too, so a model you add yourself runs end-to-end without crashing. **You no longer need this primer for everyday add/remove/edit/reorder — do it on the screen.** This primer is still the reference for HOW the system works and for connecting a brand-new AI company (Phase 3).
- **Still to come (Phase 3 — a FUTURE task, not yet built):** the OpenAI (ChatGPT) + Google Gemini **provider adapters** (the "connection" code) so their models can flip from *integration pending* to *runnable*. This is the docs-driven build described in "Add a model from a NEW company" above — point Claude at this primer + upload that company's API/SDK docs when you want a non-Anthropic model live.

See `docs/polish-item-specs/P-63-central-ai-model-registry-self-serve.md` for the full design + phase plan, and `docs/AI_MODEL_REGISTRY.md` for the technical site map.
