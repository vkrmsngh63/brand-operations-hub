# P-64 — Reorder models on the /ai-models screen → drives AI task dropdown order

**Status:** 🔴 OPEN — captured 2026-06-03-g per Rule 31 (verbatim director ask). NOT yet built.
**Severity / effort:** LOW (small; the persistence column already exists — see §3). Enhancement to the P-63 self-serve registry admin screen.
**Cross-references:** P-63 (the central AI-model registry + the `/ai-models` admin screen this extends) · `docs/AI_MODEL_REGISTRY.md` · `docs/AI_MODEL_REGISTRY_PRIMER.md`.

---

## §1 — Original director instruction (VERBATIM, append-only)

> **2026-06-03-g:** "On the 'https://www.vklf.com/ai-models' page, the user should be able to move the models relative to each other and that is the order in which the models should show in the AI task dropdowns."

### Plain restatement (for traceability — NOT a substitute for §1)

On the `/ai-models` admin screen, let the director reorder the models relative to
one another (e.g. drag a row up/down). The saved order becomes the order the
models appear in every AI-task model dropdown across the platform (W#1
Auto-Analyze + the 7 W#2 review-analysis modals).

---

## §2 — Rule 24 pre-capture search (2026-06-03-g)

Searched ROADMAP, `docs/AI_MODEL_REGISTRY.md`, `docs/AI_MODEL_REGISTRY_PRIMER.md`,
the P-63 spec, `docs/CORRECTIONS_LOG.md`, and the schema/registry code for
reorder/drag/sortOrder of models. **No prior treatment of model ORDERING** — all
existing P-63 material covers add/remove/edit only. Genuinely new.

## §3 — Code-truth note (Rule 3 — what already exists)

The persistence + read path is **already in place from P-63 Phase 2a/2c**, so this
is a small build:

- `AiModelRegistryEntry.sortOrder Int @default(0)` already exists (`prisma/schema.prisma`)
  and is documented as "picker display order".
- `getRunnableModelIdsForMenu` / the registry GET already query
  `findMany({ orderBy: { sortOrder: 'asc' } })`, and `selectMenuModels` preserves
  input order, so **the dropdowns already render in `sortOrder` sequence**
  (the live `useModelsForMenu` hook fetches in that order).
- Today `sortOrder` is only set at seed time (registry order) + appended on create
  (`sortOrder = count`); there is **no UI or endpoint to change it after the fact**.

**So the work is just two pieces:**
1. **UI on `/ai-models`** — a reorder affordance on the models table (drag-handle
   rows, or up/down buttons). Repo has reusable drag infra: P-54's `@dnd-kit`
   usage + `src/lib/competition-scraping/column-order.ts` (`moveColumnKey`) +
   `main-table-grouping` two-level-drag helpers.
2. **Persist** — a reorder endpoint (e.g. `PATCH /api/ai-models/reorder` taking the
   ordered list of registry ids → writes each row's `sortOrder`), wired through the
   `ai-model-registry` DI-seam handler with node:tests. The dropdowns then follow
   automatically via the existing live fetch (no picker changes needed).

### Design questions to resolve WITH the director before building (per `feedback_plan_output_shape_before_building`)
- **D-A — Ordering scope:** ONE global order for all menus, OR a per-menu order
  (W#1 vs W#2 could want different orders)? (Recommend: one global order first —
  simplest; `sortOrder` is already global. Per-menu would need a richer model.)
- **D-B — Reorder affordance:** drag-handle rows (matches P-54) vs up/down arrows
  (simpler, more obvious for a non-programmer). (Recommend: drag, with the dense
  table already shipped.)
- **D-C — Does order interact with the default?** The W#1/W#2 picker defaults are
  separate `useState` values; reordering should NOT change which model is the
  default, only display order. (Confirm.)

## §4 — Acceptance (when built)
- On `/ai-models`, the director can reorder models and Save; the order persists
  across reloads.
- Opening any W#1/W#2 model dropdown shows the models in the saved order.
- Existing models' selectability, pricing, runnable gating unchanged.
