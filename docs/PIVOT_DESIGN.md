# PIVOT DESIGN
## Operation-based output contract for Auto-Analyze (Keyword Clustering)

**Last updated:** April 25, 2026 (created — Pivot Session A complete; design captured here for Pivot Sessions B/C/D/E to build against)
**Last updated in session:** session_2026-04-25_phase1g-test-followup-part3-pivot-session-A (Claude Code)
**Group:** B (tool-specific to Keyword Clustering's Auto-Analyze; loaded when pivot work is in scope)

**Purpose:** This is the canonical reference doc for the Auto-Analyze architectural pivot from "AI as state-rebuilder" to "AI as state-mutator." It captures the locked design from Pivot Session A and is the build spec Pivot Sessions B/C/D/E reference.

**Background — why this pivot exists:** See `CORRECTIONS_LOG.md` 2026-04-25 high-severity architectural-insight entry for the full diagnosis. Short version: today's Auto-Analyze prompts ask the AI to re-emit the entire topics layout table every batch, which (1) lets keywords silently disappear via re-emission failure, (2) makes per-batch cost scale with canvas size rather than batch size, and (3) makes wall-clock time grow with canvas size. Verified data point: $1.89 / 26 minutes for a 4-keyword batch on a 95-node canvas, with 110,245 output tokens of which ~105k were redundant re-emission. The pivot changes the AI's output contract from "complete updated TSV table" to "list of operations against the existing table." Tool — deterministic code, not AI — applies operations to existing canvas. Validation runs on applied result.

**Expected effects after pivot:** output drops 100,000+ → under 1,000 tokens per batch; cost drops ~99%+ ($1.89 → ~$0.03–0.10); wall-clock drops from tens of minutes to under 1 minute; keywords cannot silently disappear; cost stops scaling with canvas size.

---

## 1. Operation vocabulary (locked Pivot Session A)

The AI's output is a list of operations from this finite vocabulary. Anything not mentioned in the operation list stays exactly where it was. This is the structural property that prevents silent keyword loss.

### 1.1 Topic operations

| Operation | What it does | Required fields |
|---|---|---|
| `ADD_TOPIC` | Create a new topic box | `id` (alias `$newN` for batch-internal reference), `title`, `description`, `parent` (existing stable ID, alias from earlier in batch, or `null` for root), `relationship` (`linear` or `nested`) |
| `UPDATE_TOPIC_TITLE` | Rename a topic; nothing else changes | `id` (stable ID), `to` (new title) |
| `UPDATE_TOPIC_DESCRIPTION` | Rewrite a topic's description without touching title or position | `id`, `to` (new description) |
| `MOVE_TOPIC` | Re-parent a topic (and its entire subtree) | `id`, `new_parent` (stable ID, alias, or `null`), `new_relationship` (`linear` or `nested`) |
| `MERGE_TOPICS` | Combine two topics into one | `source_id`, `target_id`, `merged_title`, `merged_description`, `reason` |
| `SPLIT_TOPIC` | Divide one topic into two; AI specifies which keywords go where | `source_id`, `into` (array of `{id (alias), title, description, keyword_ids}`), `reason` |
| `DELETE_TOPIC` | Remove a topic; keywords must be reassigned or archived | `id`, `reason`, `reassign_keywords_to` (stable ID, alias, or `ARCHIVE` literal) |

### 1.2 Keyword operations

| Operation | What it does | Required fields |
|---|---|---|
| `ADD_KEYWORD` | Place a keyword under a topic | `topic` (stable ID or alias), `keyword_id` (database UUID), `placement` (`primary` or `secondary`) |
| `MOVE_KEYWORD` | Move a keyword from one topic to another | `keyword_id`, `from` (topic stable ID or alias), `to` (topic stable ID or alias), `placement` |
| `REMOVE_KEYWORD` | Un-place a keyword from a specific topic | `keyword_id`, `from` (topic stable ID or alias). **Only legal if the keyword has at least one other placement.** Otherwise `ARCHIVE_KEYWORD` is required — keywords cannot be left unplaced. |
| `ARCHIVE_KEYWORD` | Flag a keyword as irrelevant; flows to RemovedKeyword table | `keyword_id`, `reason` |

### 1.3 Sister-link operations

| Operation | What it does | Required fields |
|---|---|---|
| `ADD_SISTER_LINK` | Create a sideways link between two topics | `topic_a` (stable ID or alias), `topic_b` (stable ID or alias) |
| `REMOVE_SISTER_LINK` | Remove an existing sister link | `topic_a`, `topic_b` |

### 1.4 Cross-cutting rules

These rules are part of the vocabulary contract — Pivot Session B's applier and Pivot Session C's prompt rewrite both depend on them.

1. **Atomic batch apply.** A batch's operations either ALL succeed and the canvas changes accordingly, OR none succeed and the canvas stays exactly as it was before the batch. There is no partial-apply mode. If operation #7 in a batch fails validation, operations #1–6 roll back. Matches the existing atomic-rebuild pattern.

2. **Sequential within-batch ordering.** Operations are applied in the order the AI emitted them. The AI may `ADD_TOPIC $new1` and then `ADD_KEYWORD topic=$new1` later in the same batch — as long as the order is preserved. The applier validates that every reference (alias or stable ID) either already exists in the canvas or was added earlier in the batch.

3. **New-topic aliases (`$new1`, `$new2`, ...).** When the AI adds a new topic, it uses a local alias rather than inventing a stable ID. The applier assigns the real `t-N` stable ID at apply time. Aliases are batch-scoped only — they do not persist past the batch. The `$` prefix is reserved syntax (no real stable ID will start with `$`).

4. **Keywords referenced by database UUID, not text.** Every keyword has a UUID in the `Keyword` table. Operations always reference keywords by `keyword_id` (UUID). This sidesteps the entire class of text-matching ghost bugs (whitespace, smart quotes, unicode) that produced the Bursitis 74 Reshuffled set.

5. **Reasons on every structural operation.** `MERGE_TOPICS`, `SPLIT_TOPIC`, `DELETE_TOPIC`, and `MOVE_TOPIC` carry a plain-English `reason` field. Becomes the audit record. `ADD_TOPIC`, `UPDATE_TOPIC_TITLE`, and `UPDATE_TOPIC_DESCRIPTION` do NOT require a reason (low-stakes, additive or descriptive only). `ARCHIVE_KEYWORD` requires a reason (the model must explain why a keyword is irrelevant).

6. **JUSTIFY_RESTRUCTURE on stability ≥ 7.0 from day one.** Operations targeting a topic with `stabilityScore ≥ 7.0` additionally require a 6-field JUSTIFY_RESTRUCTURE payload per `MODEL_QUALITY_SCORING.md §4`. Applies to: `MERGE_TOPICS`, `SPLIT_TOPIC`, `DELETE_TOPIC`, `MOVE_TOPIC`, `UPDATE_TOPIC_TITLE`. Does NOT apply to: `UPDATE_TOPIC_DESCRIPTION` (descriptive-only refinement is safe even on stable topics), `ADD_TOPIC` / `ADD_KEYWORD` / `MOVE_KEYWORD` / `REMOVE_KEYWORD` / `ARCHIVE_KEYWORD` / `ADD_SISTER_LINK` / `REMOVE_SISTER_LINK`. The actual stabilityScore values won't reach 7.0 until the stability-scoring algorithm ships in a follow-up session — until then, the gate exists but doesn't fire on any topic. Director's call (Pivot Session A Q4) was to carry it from day one rather than defer; reasoning: this is the direct mechanism that prevents silent overwrites of well-placed work, which is one of the four root-cause failures the pivot exists to fix.

### 1.5 Deliberately excluded from the vocabulary

These were considered and explicitly left out:

- **Pathway operations** (`ADD_PATHWAY`, `DELETE_PATHWAY`, `MOVE_TOPIC_BETWEEN_PATHWAYS`). Pathways are admin-driven, not AI-driven. The AI works within existing pathways but does not create or destroy them.
- **Position / size operations** (set x, y, h). Layout is the layout engine's concern (shipped Session 3b in `src/lib/canvas-layout.ts`); the AI never positions nodes manually.
- **Reserved-topic aliases** like `IRRELEVANT_KEYWORDS` or `PENDING_DELETION`. The earlier "Irrelevant Keywords floating topic" design is replaced by the direct `ARCHIVE_KEYWORD` operation, which is cleaner: no special topic to render or manage; the AI's intent maps directly to the outcome (the keyword flows to `RemovedKeyword` table). Pending Deletion is not part of the pivot's first cut.

---

## 2. Stable-ID format (locked Pivot Session A)

### 2.1 Format

**`t-1`, `t-2`, `t-3`, ... per project.** A `t-` prefix followed by a counter, scoped per Project (i.e., per `ProjectWorkflow`). Each existing topic with database integer `id=N` is backfilled to `stableId = "t-N"` so the new column maps 1:1 to existing data and the Bursitis topic with database id=42 becomes stable_id `t-42`.

Why this shape:
- **Short** — six characters or fewer per ID. The AI emits these many times per batch; UUIDs would waste output tokens and invite typos.
- **Human-readable** — debugging via DB inspection is easy when the stable ID is just a small integer.
- **Stable across renames** — `t-42` survives any number of `UPDATE_TOPIC_TITLE` operations. The diff-detector's rename-as-new-topic problem (P3-F6) goes away by construction.

### 2.2 New-topic aliases

When the AI adds a topic in a batch, it uses an alias (e.g., `$new1`), not an invented stable ID:

```
ADD_TOPIC id=$new1 title="Bursitis triggers" parent=t-42 relationship=nested ...
ADD_KEYWORD topic=$new1 keyword_id=<uuid> placement=primary
```

The applier assigns the real stable ID (`t-105`, etc.) at apply time. Aliases are batch-scoped only — they do not persist after the batch applies. The `$` prefix is reserved syntax: no real stable ID will start with `$`.

This pattern means:
- AI never has to track or emit existing stable-ID counter values.
- Two batches running in parallel cannot collide on stable-ID assignment (the applier serialises ID assignment).
- The vocabulary is "pure intent" — the AI says what it wants; the applier makes it real.

### 2.3 Backfill rule for existing topics

`stableId = "t-" + id` for every existing `CanvasNode` row. Preserves debugging value (1:1 with existing integer IDs). Numbering will have gaps where rows were deleted historically — that's fine; the gaps are diagnostic, not a problem.

---

## 3. Database migration plan (locked Pivot Session A; ships in Pivot Session B with Rule-8 approval)

**Plan only. The actual database changes ship in Pivot Session B and require explicit Rule-8 approval before any `npx prisma db push` runs.**

### 3.1 Schema additions to `CanvasNode`

Two columns added:

| Column | Type | Default | Purpose |
|---|---|---|---|
| `stableId` | `String` (NOT NULL after backfill) | none (backfilled to `"t-" + id`) | Persistent identifier the AI uses to refer to a topic across batches |
| `stabilityScore` | `Float` | `0.0` | Stability score 0.0–10.0; gates JUSTIFY_RESTRUCTURE at ≥ 7.0; populated later by the stability-scoring algorithm |

Both columns are pure additions to the existing `CanvasNode` table. No existing data is touched or rewritten by the schema change itself; the backfill step is what populates `stableId`.

### 3.2 Index

Unique index: `@@unique([projectWorkflowId, stableId])` on `CanvasNode`. Ensures the same stable ID cannot appear twice within one Project's canvas; supports fast lookup during the operation-applier's reference resolution.

### 3.3 Three-step migration sequence

**Step 1 — Add nullable columns.** 
- Prisma schema: add `stableId String?` (nullable) and `stabilityScore Float @default(0.0)` (defaulted) to `CanvasNode`. 
- Push via `npx prisma db push`. 
- Pure additive; existing data untouched; live site keeps working (the new columns are unused by current code).

**Step 2 — Run the backfill script.** 
- New file `scripts/backfill-stable-ids.ts` (Prisma-based, idempotent, logs every row updated). 
- Walks every existing `CanvasNode` row; sets `stableId = "t-" + id`; commits. 
- Re-runnable safely (idempotency check skips rows that already have a non-null `stableId`). 
- Test on a fresh test Project FIRST, then run on live data.

**Step 3 — Tighten constraint + add unique index.** 
- Prisma schema: change `stableId String?` → `stableId String` (NOT NULL); add `@@unique([projectWorkflowId, stableId])`. 
- Verification query runs first (zero rows with null `stableId`). 
- Push via `npx prisma db push`.

After step 3, the database is fully ready for the operation-applier code (Pivot Session B).

### 3.4 Risk profile

- **Step 1** is safe: adding nullable / defaulted columns can't break existing data or queries.
- **Step 2** is safe-with-care: idempotent script, tested on a fresh project first.
- **Step 3** is safe IF step 2 ran cleanly. Verification query gates step 3 on zero null `stableId` rows.
- **Reversibility:** if anything goes wrong, both columns can be dropped and we're back to the pre-migration state. No existing data is destroyed at any point.

### 3.5 Other tables — no changes in Pivot Session B

These tables are NOT changed in the pivot's database migration:
- **`SisterLink`** — keeps its existing integer FK to `CanvasNode.id`. The AI-facing operations refer to stable IDs; the applier translates to the integer FK at write time.
- **`Pathway`** — no AI operations target pathways (per §1.5); no schema change needed.
- **`RemovedKeyword`** — already exists from Session 3a; the `ARCHIVE_KEYWORD` operation writes through the existing `removed-keywords` API endpoint with `removedSource='auto-ai-detected-irrelevant'`.
- **`Keyword`** — no schema change. Operations reference keywords by their existing UUID `id`.

---

## 4. Pivot session sequence

### Pivot Session A — DONE 2026-04-25 (this session)
Design + locked decisions. This doc is the deliverable. No code changes; no database changes.

### Pivot Session B — Database migration + deterministic operation applier + validation
- Apply the 3-step migration from §3 (with Rule-8 approval before each step).
- Write `src/lib/operation-applier.ts` — pure function `(existing canvas, operation list) → (new canvas, validation result)`.
- Per-operation pre-validators (internal consistency: no orphan moves, no duplicate adds, all referenced IDs/aliases exist).
- Post-application invariant checks (no unlinked keywords, all topics have valid parents, etc.).
- Unit tests against synthetic operation sets — no AI involvement at this stage.
- Director's Rule-8 approval gate at start of session (before `prisma db push`); director's Rule-9 approval gate at end of session (before push).

### Pivot Session C — Prompt rewrite
- Rewrite Initial Prompt: keep philosophy/context/conversion-funnel framing; replace "complete updated Integrated Topics Layout Table" instruction with "emit a list of operations using the following vocabulary"; rewrite reevaluation-pass section so triggers issue `MERGE` / `SPLIT` / `RENAME` / `MOVE_TOPIC` operations.
- Rewrite Primer: column-definitions section becomes operation-definitions; output-format section becomes operation-syntax; rules-and-constraints gets the deletion-via-`DELETE_TOPIC reassign_keywords_to=...` rule (replaces the never-delete rule).
- Update `docs/AUTO_ANALYZE_PROMPT_V2.md` (or create `_V3.md`) with the new prompts.
- Director re-pastes new prompts into Auto-Analyze UI at end of session.

### Pivot Session D — Wire it together + validate end-to-end
- Update `AutoAnalyze.tsx` to send operations-output prompts and parse operation-list responses.
- Replace existing canvas-rebuild flow (TSV-based) with the operation-applier (operations-based).
- Run small test Project on a fresh canvas with new prompts; iterate until clean.
- Run small test on a populated test Project; verify keyword-loss rate drops to zero.
- Run a single batch on Bursitis as the cost-comparison data point. Expected ~$0.03–0.10 cost vs. $1.89; expected <1 minute wall-clock vs. 26 minutes.

### Pivot Session E — Migration to operations-default + deprecation plan for band-aids
- Make operations-output the default mode.
- Mark legacy table-rewrite output as deprecated; keep code path for rollback during a transition window.
- Run reconciliation pass + Reshuffled / salvage logic in "audit-only" mode for a few sessions to validate the pivot is producing zero new ghosts.
- Once validated, deprecate (remove) the band-aid code paths in a future cleanup session.

### Pivot Session F — Re-scope Sessions 4-6 (~½ session of doc work, no code)
- Session 4 (Changes Ledger UI): now narrowly about UI on top of operations data — filter / sort / admin-action surface. Probably collapses into ~1 session given operations infrastructure already exists.
- Session 5 (Stability scoring): unchanged in spirit; stable topic IDs already done in Pivot Session A. Stability scoring is a smaller standalone task.
- Session 6 (Prompt modifications): mostly subsumed by Pivot Session C. Surviving wording refinements (Q4/Q5/Q6 from Session 2b) fold into Pivot Session C; the rest archive as obsolete.

---

## 5. Open questions / deferred items

These were flagged during Pivot Session A and deferred (per `HANDOFF_PROTOCOL.md` Rule 14e — every deferral has an explicit destination).

| Item | Why deferred | Where captured |
|---|---|---|
| Stability-scoring algorithm | The JUSTIFY_RESTRUCTURE gate exists in the vocabulary but no topic ever crosses 7.0 until the algorithm ships. Algorithm is its own follow-up session after the pivot core lands. | This doc §1.4 + `MODEL_QUALITY_SCORING.md` |
| Reconciliation pass / Reshuffled status / salvage mechanism — long-term deprecation | Becomes vestigial after the pivot lands but should run in audit-only mode for a few sessions before removal. | Pivot Session E |
| Pathway-level AI operations | Pathways are admin-driven in current design; if business need emerges, the vocabulary expands. | Excluded from §1.5; revisit if needed |
| Pending Deletion canvas region | Not part of the pivot's first cut; revisit after operations-default is stable. | Excluded; future polish item |

---

## 6. How the four root-cause failures are addressed by this design

For end-of-pivot verification — does the locked design actually fix what it set out to fix?

| Failure | Mechanism in this design that addresses it |
|---|---|
| **Keywords drop during batch application** | Operation vocabulary is the only legal way to change anything; "anything not mentioned stays exactly where it was" is a structural property of the applier, not a model behaviour we hope for. |
| **Keywords correctly placed in earlier batches get silently removed in later batches** | (a) Atomic batch apply prevents half-applied state that decays into ghosts. (b) JUSTIFY_RESTRUCTURE on stability ≥ 7.0 means well-placed work cannot be silently overwritten — the model must justify in writing before disturbing it. (c) Stable IDs make rename-vs-drop unambiguous (rename is `UPDATE_TOPIC_TITLE id=t-12 to=...`, never confusable with delete-and-readd). |
| **Cost per batch has skyrocketed** | Operations-only output drops per-batch tokens from 100k+ to under 1k for most batches. Cost stops scaling with canvas size. Bursitis verification's $1.89 → expected $0.03–0.10 in Pivot Session D. |
| **Time per batch has gone up significantly** | Wall-clock is bottlenecked by output-token generation rate (~50–80 tokens/sec on Sonnet 4.6). Operations-only output → ~1k tokens → under 1 minute. Bursitis verification's 26 minutes → expected <1 minute. |

---

END OF DOCUMENT
