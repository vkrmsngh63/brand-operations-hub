# Variant B — Handoff Package (README / Index)
**For Claude Code (Codespaces). Start here.**

This package specifies a new keyword-analysis variant ("Variant B" / "AI 2") to be added to Workflow #1 (Keyword Clustering), running alongside the existing system ("Variant A" / "AI 1") for A/B testing on identical input.

---

## Where these files live
This whole package lives in the repo under **`Workflow 1 AI V2/`** (a dedicated folder, to avoid filename collisions with existing repo files such as the root `README.md`). The files, in reading order:

1. **`variantB-primer.md`** — orientation: what Variant B is and *why*. Read first.
2. **`variantB-technical-spec.md`** — the prescriptive contract: data model, per-step contracts, prompts, validation, build order.
3. **`variantB-binding-addendum.md`** — grounds everything in *this* codebase and records the locked decisions. **This overrides the spec wherever they differ.**
4. **`rulebook-v0.2.md`** — the **rules of the funnel**: descriptor schema, the 7 zones + their ordered stages, value ladders, placement rules + misfit taxonomy, conservative merge/nest, the diagnostic settings (§9), the **ordering logic** (§10), and the **reorganization sweeps** (§11). This is the in-core, DB-backed rulebook the pipeline loads — the authority for all funnel rules and ordering.
5. **`lessons-learned-module.md`** — spec for the human-correction Lessons Learned Module UI (a fast-follow; see the addendum's roadmap, §5).
6. **`process-walkthrough-v0.4.md`** — optional, deeper plain-language walkthrough of the methodology, if you want the full conceptual picture.
7. **`variantB-codebase-intake.md`** — the as-read intake report on the live repo (reuse points, models, protocols). Reference while running Plan Mode; verify against current code.

(If you only read three, read #1, #3, and #4.)

---

## Precedence
Where any two documents disagree, the order of authority is: **binding addendum → technical spec → primer/walkthrough.** The addendum wins because it reflects the actual codebase and the human's confirmed decisions.

---

## ⛔ Before you write ANY code or change ANY schema — do this first

**Run a Plan Mode pass (read-only). Do not edit code or run `prisma db push` until the human approves the plan.**

In Plan Mode, verify against the live code (do not assume the intake report is still exact):
1. The reuse points exist with the assumed shapes: `useKeywords.bulkImport`; the `POST /api/projects/[id]/canvas/rebuild` transaction **and its >50%-shrink blanking guard**; `CanvasNode`'s `kwPlacements`, `intentFingerprint`, `parentId`, `linkedKwIds`; `useModelsForMenu`; `ExecutionModeSelect`; `cost-estimator.ts`; `forensic-log.ts`.
2. The **nullable** `CanvasNode` column additions (`zone`, `stage`, `verticalRank`, `siblingOrder`, `isSpine`, `variantBMeta`) do **not** ripple into Variant A's read/write or canvas-render paths.
3. The three-state toggle change (Manual / AI 1 / AI 2) on `keyword-clustering/page.tsx` is **localized** and does not disturb Manual or AI 1 behavior.
4. The **keyword-clone** across `ProjectWorkflow`s (copying Variant A's `Keyword` rows into Variant B's workflow) is sound and **idempotent**.
5. The schema delta follows the **single-schema-owner protocol** (`docs/MULTI_WORKFLOW_PROTOCOL.md`; `prisma db push`, no migrations dir, one chat owns the schema).

**Output:** a concrete implementation plan plus a list of any mismatches between this package and the live code, **for human approval.** Adjust the plan to fit the code; do not silently invent integration patterns.

Also: **this is NOT stock Next.js** — read the relevant guide under `node_modules/next/dist/docs/` before writing code (`AGENTS.md`).

---

## The one rule that matters most
Variant B must **not** rebuild Variant A's growing-canvas loop (serializing the whole tree into every batch prompt). That loop is the exact bottleneck Variant B exists to remove. Variant B produces intents/topics independently and assembles the tree once; per-batch payloads stay small and flat. (Full statement: addendum §0.)

---

## Decisions (locked by the human)
- **D1 — Location:** `components/variant-b/` + `src/lib/variant-b/` inside the keyword-clustering surface; reuse the loader.
- **D2 — Storage:** Variant B gets its own `ProjectWorkflow` (e.g. `keyword-clustering-vb`); clone Variant A's keywords into it for identical input; reuse `CanvasNode` + nullable columns.
- **D3 *(revised)* — Rulebook/Lessons:** the rulebook is **DB-backed and the automated diagnostic runs in core**; prompt *templates* are versioned code constants that inject the DB rulebook; only the **human-correction Lessons Module UI** is the fast-follow.
- **D4 — Embeddings:** none now; non-vector candidate generation.
- **D5 — Toggle:** three-state **Manual / AI 1 / AI 2**; AI-1-vs-AI-2 choice persisted in `UserPreference` (`kc_variant_{projectId}`).
- **D6 — Execution mode UI:** reuse `ExecutionModeSelect`.

(Details and the build order: addendum §1, §3, §4.)

---

## Roadmap (deferred — record these, do not build yet)
The **human-correction Lessons Module UI**; **pgvector** (only if non-vector candidate generation proves insufficient); **server-side execution** (only for large-scale parallelism). See addendum §5.

**Both design discussions are now CLOSED.** The spec's two stubs — `TODO(rulebook_assembly)` and `TODO(vertical_ordering)` — are **RESOLVED**: implement them per **`rulebook-v0.2.md`** (§9 diagnostic, §10 ordering, §11 reorganization sweeps) and the addendum (§4), **not** as stubs. Rulebook assembly + the automated diagnostic, and the deterministic ordering + reorganization sweeps, are **in the first build**.
