# Spec Binding & Integration Addendum — Variant B (Workflow #1)
**Status: decisions locked; both design discussions (rulebook assembly, vertical ordering) CLOSED.** Read alongside the Technical Specification. **Where this addendum and the spec disagree, this addendum wins** — it reflects the real codebase and the confirmed decisions. The spec's two open stubs — `TODO(rulebook_assembly)` and `TODO(vertical_ordering)` — are now **RESOLVED here and in `rulebook-v0.2.md`; do not stub them** (see §4).

**This package lives in the repo in the `Workflow 1 AI V2/` folder — see `README.md` there for reading order and the pre-build checklist.** Before implementing, run a **Plan Mode** pass (read-only verification + plan + human approval) as described in the README. Items previously marked [CONFIRM] are now **DECIDED** (§3).

---

## 0. The one rule that overrides everything
Variant B must **NOT** replicate Variant A's method of feeding the current/growing canvas into each batch prompt. Variant A does exactly that — `auto-analyze-v3.ts › buildOperationsInputTsv` serializes the whole (tiered) canvas into every batch. **That growing-context loop is the precise bottleneck Variant B was created to eliminate.**

Variant B instead produces intents and topics **independently** (nothing about the accumulated tree appears in any analysis prompt), then **assembles and materializes** the tree once at the end. The per-batch AI payload must stay **small and roughly constant** no matter how large the tree grows. If you ever find yourself serializing the accumulated tree back into an analysis prompt, stop — that is Variant A's pattern, not Variant B's.

---

## 1. Firm bindings (derived from the codebase)

### 1.1 Execution model → browser-side (overrides spec §2)
No queue/worker/job system exists; the app is browser-first by deliberate, documented design (server is a thin SSE proxy, `maxDuration=300`). Variant B's pipeline runs as a **client-side loop modeled on `AutoAnalyze.tsx`**: a state machine (idle/running/paused/review/error/complete), pause/resume/cancel, a **spend-cap**, a **localStorage checkpoint** for resume, an activity log, and a downloadable NDJSON forensic log (reuse `src/lib/forensic-log.ts`). Parallelism is **bounded concurrent fetches from the browser** (default cap 6, config `variantB.concurrency`) — not server fan-out. The efficiency win (flat per-batch payloads) holds regardless of venue. Reuse the `callApi` pattern and the `/api/ai/analyze` SSE proxy.

### 1.2 Input → reuse the existing paste loader (overrides spec §3 Step 2 input, and the "Excel file" framing)
There is no file/xlsx/CSV importer (the `xlsx` dep is export-only). Ingestion is **clipboard paste → TSV split → `useKeywords.bulkImport`** (`ASTTable.handlePaste` → `src/hooks/useKeywords.ts`), which already dedupes and normalizes volume suffixes (`5K→5000`). Variant B **reuses `useKeywords`/`bulkImport` verbatim** and needs only its own paste host (or shares `ASTTable`). Carrier dedup (Step 2) runs *after* the loader, on the persisted `Keyword` rows.

### 1.3 Output write → reuse the canvas-rebuild path
Variant B materializes its finished tree into a rebuild payload and writes it **atomically via the existing `POST /api/projects/[id]/canvas/rebuild`** (`prisma.$transaction`, including the >50%-shrink blanking guard), under its own `projectWorkflowId`. It does **not** emit Variant-A-style incremental operations.

### 1.4 Data model → map onto the existing schema (overrides spec §1; DECIDED per D2)
The existing schema already carries most of `Topic`:
- **Variant B `Topic` → existing `CanvasNode` row.** `title`→`title` (searcher-voice), nesting→`parentId` (unlimited depth ✓), **primary/secondary keywords → `kwPlacements {kwId:'primary'|'secondary'}`** (exact match), member keywords→`linkedKwIds`, **our fingerprint → `intentFingerprint`** (NOT NULL; Variant B computes it from the descriptor profile).
- **Add nullable columns to `CanvasNode`** (nullable ⇒ Variant A untouched): `zone`, `stage`, `verticalRank`, `siblingOrder`, `isSpine`, and one `variantBMeta Json` for the remainder (canonical profile, boundary belongs/excludes, `title_voice`, summary).
- **Reuse `Keyword` verbatim** under Variant B's `projectWorkflowId`. Reuse `canvas-layout.ts` / `reconciliation.ts` if rendering on the canvas.
- **Net-new tables.** **In core (first build):** the rulebook store (`CLREntry`) — the rulebook is DB-backed (D3 revised). **Fast-follow (§5):** the Lessons Module (`LessonRow`, `RulebookChange`). `IntentInstance` is pipeline-internal (browser state during a run); the provenance index is derivable from `kwPlacements`+`parentId` (or cached). (All schema deltas are gated — §1.7.)

### 1.5 Models & prompt plumbing
Anthropic-only via the existing **model registry**: Variant B's picker reuses `useModelsForMenu(...)`; cost/forecast reuse `calcCost` + `src/lib/cost-estimator.ts`; pricing from `AiModelRegistryEntry`. Auth unchanged. No custom AI retry today (SDK defaults; 502 on failure) — keep that unless we add one deliberately. **First-build prompt *templates* are versioned code constants** (W#2 pattern, e.g. `src/lib/variant-b/prompts.ts` with `_PROMPT_VERSION` strings) **that inject the DB-backed rulebook content at runtime** — the rulebook itself is in-core data (D3 revised). Only the human-correction Lessons Module UI is the fast-follow (§5).

### 1.6 No embeddings → non-vector candidate generation (binds spec §3 Step 5; DECIDED per D4)
No embeddings client / vector store / pgvector. Step 5 candidate generation uses the **non-vector default**: bucket by fingerprint, then compare within normalized-token-overlap neighborhoods. Do **not** add pgvector.

### 1.7 Protocols Claude Code must follow
- **This is NOT stock Next.js.** Per `AGENTS.md`, read the relevant guide under `node_modules/next/dist/docs/` **before writing any code**; follow in-repo conventions, not training-data Next.js.
- **Schema changes go through the single-schema-owner protocol** (`prisma db push`; no migrations dir; one chat owns the schema at a time — `docs/MULTI_WORKFLOW_PROTOCOL.md`). **Propose the schema delta — the new tables + the nullable `CanvasNode` columns — for human approval before pushing.**
- Use **`projectWorkflowId`** for all keyword/canvas writes (the TS `Keyword.projectId` is a UI label, not the DB column). `AuditEvent`'s time column is **`timestamp`**.
- Mirror the **"applier wins"** rule (`HANDOFF_PROTOCOL.md` Rule 3): Variant B's pure-logic modules are the source of truth over prompt text when they drift.
- Tests via **`node --test`** for pure libs (mirror the coverage of `operation-applier.ts` et al.); Playwright for E2E.

### 1.8 The Manual / AI 1 / AI 2 toggle (DECIDED — overrides the existing two-state control)
The keyword-clustering page (`src/app/projects/[projectId]/keyword-clustering/page.tsx`) currently has a two-state `aiMode` control labeled **Manual / AI** at the top-right. Change it to **three states: `Manual` / `AI 1` / `AI 2`.**
- **Manual** — the existing manual workspace, unchanged.
- **AI 1** — the existing AutoAnalyze (Variant A), unchanged behavior; writes to the existing `keyword-clustering` ProjectWorkflow.
- **AI 2** — the new Variant B overlay/pipeline; writes to Variant B's own ProjectWorkflow (D2).
- The AI-1-vs-AI-2 selection **persists in `UserPreference`** (`kc_variant_{projectId}` = `"A"`/`"B"`, D5), surviving reloads. Render Variant A's overlay for AI 1 and Variant B's overlay for AI 2.
- **First activation of AI 2 triggers the keyword-clone** (D2): copy the project's `Keyword` rows from the `keyword-clustering` ProjectWorkflow into Variant B's ProjectWorkflow so AI 2 starts from identical input. Make it **idempotent** (clone only if B's workflow has no keywords) and provide a **"re-sync from AI 1"** action for keywords added to AI 1 later.
- Keep this change **localized** — it must not alter Manual or AI 1 behavior.

---

## 2. Reuse inventory
**Reuse verbatim:** `useKeywords`/`bulkImport`; the `/keywords`, `/canvas`, `/canvas/rebuild`, `/audit-events` routes; the `Keyword` & `CanvasNode` models; the model registry + `useModelsForMenu`; `ExecutionModeSelect`; `cost-estimator.ts`; `forensic-log.ts`; `prisma-retry.ts`; `db.ts`; `verifyAuth`.
**Adapt (new code, existing patterns):** the client run-loop / state machine / overlay (patterned on `AutoAnalyze.tsx`, built fresh under `components/variant-b/`); `canvas-layout.ts` / `reconciliation.ts` (if rendering on canvas); the three-state toggle on `page.tsx`.
**Net-new (`src/lib/variant-b/`):** the intent pipeline (carrier dedup, intent-enumeration prompt+parser, labeling, conservative merge, hierarchy/shells, placement); versioned prompt constants; the nullable `CanvasNode` columns; later, the CLR + Lessons tables and UI.
**Do NOT reuse:** `buildOperationsInputTsv`'s growing-canvas serialization, and `operation-applier.ts`'s incremental-operation semantics. Variant B writes the finished tree, not operations.

---

## 3. Decisions — LOCKED

| # | Decision | Locked outcome |
|---|---|---|
| **D1** | Where Variant B lives | `components/variant-b/` + `src/lib/variant-b/` inside the keyword-clustering surface; reuse the loader. |
| **D2** | How both outputs coexist on identical input | Variant B = **own `ProjectWorkflow`** (`workflow` string e.g. `keyword-clustering-vb`) + **keyword-clone** of Variant A's `Keyword` rows + reuse `CanvasNode` with the nullable columns in §1.4. |
| **D3** *(revised)* | Rulebook storage + Lessons timing | The **rulebook is DB-backed data** and the **automated diagnostic runs in core** (first build). **Prompt *templates* are versioned code constants** that inject the DB rulebook content at runtime. Only the **human-correction Lessons Module UI** is the fast-follow (§5). |
| **D4** | Embeddings | **None now** — non-vector candidate generation. pgvector later only if needed. |
| **D5** | A/B toggle | **Persisted in `UserPreference`** (`kc_variant_{projectId}`); surfaced via the three-state control in §1.8. |
| **D6** | Execution-mode UI | Reuse the shared `ExecutionModeSelect`. |

---

## 4. Build order (replaces spec §7)
1. **Schema delta proposal** (the rulebook table `CLREntry` + the nullable `CanvasNode` columns; Lessons tables deferred) → human approval → `prisma db push`. Then **seed the DB rulebook** from `rulebook-v0.2.md` and **run the automated diagnostic** to produce the niche layer (rulebook v0.2 §9) — both **in core**.
2. **`src/lib/variant-b/` pure pipeline libs** (each `node --test`-covered): carrier dedup → intent enumeration (prompt + JSON parser + schema validation) → topic labeling → conservative merge → hierarchy/shells. **Ordering is specced — do not stub** (rulebook v0.2 §10).
3. **Client run-loop + overlay** under `components/variant-b/` (reuse loader, model registry, `ExecutionModeSelect`, cost/forecast, forensic log; spend-cap; localStorage checkpoint).
4. **Three-state toggle** on `page.tsx` (§1.8) + **keyword-clone** for identical input + variant persistence in `UserPreference`.
5. **Materialize → `/canvas/rebuild`** write under Variant B's `projectWorkflowId`.
6. **Placement** (zone/stage rules, rulebook v0.2 §5) + **deterministic ordering** (`verticalRank` = zone-rank→stage-rank; `siblingOrder` = natural-sequence-hint-else-volume; rulebook v0.2 §10) + **periodic independent reorganization sweeps** during assembly (rulebook v0.2 §11 — they operate on the **condensed skeleton + local slices**, and **must never re-feed the whole tree** into a prompt) + provenance index.
7. **A/B comparison surface** — headline metric: **per-batch payload size / cost across the run** (flat for AI 2 vs growing for AI 1 on identical input), plus topic count, max depth, topics per zone, reachable-vs-dedup volume, and count of keywords appearing in multiple topics.
8. **Fast-follow:** the DB-backed CLR + Lessons Module (§5).
9. **Design discussions CLOSED — both spec `TODO`s RESOLVED (do not stub):** `TODO(rulebook_assembly)` → load the DB-backed rulebook + run the automated diagnostic (rulebook v0.2 §9; Step 1 above); `TODO(vertical_ordering)` → the deterministic ordering algorithm (rulebook v0.2 §10) + the periodic reorganization sweeps (rulebook v0.2 §11; Step 6 above).

---

## 5. Roadmap — deferred items (Claude Code: record these in the project roadmap)
Intentionally **not** in the first build; track them:
1. **Human-correction Lessons Learned Module (UI)** — the rulebook is already DB-backed and diagnostic-extended **in core** (D3 revised); the deferred piece is the **human-in-the-loop correction UI** that turns a correction into a safe, scoped, versioned edit of the rulebook/prompts with rollback (`lessons-learned-module.md`): the `LessonRow` + `RulebookChange` tables + the module UI.
2. **pgvector / embeddings** — only if non-vector candidate generation proves insufficient; gated schema change. (D4.)
3. **Server-side execution** — for true large-scale parallelism, per the repo's documented browser-first → server migration. Not needed for the A/B test.

---

## 6. Security flag (hygiene, not a Variant B task)
A live `.env` with Supabase credentials is present in the working tree. Verify it is gitignored and was never committed; if it ever entered git history, rotate those Supabase credentials.

---
*End of addendum. §0 and §1 are binding; §3 decisions are locked; §5 items are deferred and must be recorded in the roadmap.*
