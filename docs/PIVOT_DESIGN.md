# PIVOT DESIGN
## Operation-based output contract for Auto-Analyze (Keyword Clustering)

**Last updated:** April 25, 2026 (Pivot Session C complete — Initial Prompt + Primer rewritten as `docs/AUTO_ANALYZE_PROMPT_V3.md`; output contract changed from "complete updated TSV table" to "list of operations" matching `src/lib/operation-applier.ts` vocabulary; doc-only session, V2 untouched as historical reference)
**Last updated in session:** session_2026-04-25_phase1g-test-followup-part3-pivot-session-C (Claude Code)
**Previously updated in session:** session_2026-04-25_phase1g-test-followup-part3-pivot-session-B (Claude Code)
**Previously updated in session (earlier):** session_2026-04-25_phase1g-test-followup-part3-pivot-session-A (Claude Code)
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

### Pivot Session B — ✅ DONE (2026-04-25)
- ✅ 3-step migration applied to live database (Bursitis): Step 1 added nullable `stableId` + defaulted `stabilityScore`; Step 2 backfill script populated all 104 Bursitis rows (`t-1` … `t-104`); Step 3 tightened `stableId` to NOT NULL + added `@@unique([projectWorkflowId, stableId])`. Both schema pushes received explicit Rule-8 approval.
- ✅ `src/lib/operation-applier.ts` written — pure function, no I/O. 13 operations + atomic batch apply + alias resolver + invariant checks. ~600 LOC.
- ✅ Per-operation pre-validators inline within each apply function (referenced IDs/aliases resolve, REMOVE_KEYWORD requires another placement, JUSTIFY_RESTRUCTURE on stability ≥ 7.0, no parent cycles, no orphan splits/deletes, no self-merges).
- ✅ Post-application invariant checks: parents exist, no cycles, sister links reference real nodes, no original keyword silently lost.
- ✅ 43 unit tests in `src/lib/operation-applier.test.ts` against synthetic operation sets — runs via `node --test`. All passing. No AI, no DB.
- ✅ Production routes patched to supply `stableId: \`t-${id}\`` at create time (`src/app/api/projects/[projectId]/canvas/nodes/route.ts` POST + `src/app/api/projects/[projectId]/canvas/rebuild/route.ts` upsert.create) — necessary because Step 3's NOT NULL constraint shipped to production.
- ✅ Backfill script (`scripts/backfill-stable-ids.ts`) + duplicate-check script (`scripts/verify-no-stable-id-duplicates.ts`) committed for historical/diagnostic value. Idempotent; re-running finds nothing to do.
- One Rule-13 zoom-out miss flagged + corrected mid-session: Claude shipped Step 3's NOT NULL push before noticing two pre-existing production routes would now fail at runtime. Director approved the patch (Option A) inside the same session. Captured in `CORRECTIONS_LOG.md` 2026-04-25 pivot-session-B entry.

### Pivot Session C — ✅ DONE (2026-04-25)
- ✅ Initial Prompt rewritten — philosophy / context / conversion-funnel framing kept verbatim; "complete updated Integrated Topics Layout Table" instruction replaced with "emit a list of operations using the vocabulary in the Primer"; reevaluation-pass section rewritten so each of the seven triggers maps to a specific operation (`ADD_TOPIC` + `MOVE_KEYWORD`, `MOVE_KEYWORD`, `SPLIT_TOPIC`, `MERGE_TOPICS`, `MOVE_TOPIC`, `MOVE_TOPIC` with relationship change, `ADD_TOPIC` + `MOVE_KEYWORD`); the standalone Reevaluation Report block is gone (operations carry `reason` fields inline). New rule "anything not mentioned stays exactly where it was — silence is preservation" included as a structural promise. Surviving wording from the V2 proposed-changes notes folded in: tie-breaker rule (Change 1), Step 4b Comprehensiveness Verification with the math-bug fix (Change 3 redrafted), JUSTIFY_RESTRUCTURE 6-field payload (Change 4), multi-placement-is-a-feature paragraph (Change 5), cross-canvas low-volume scan (Change 2 Loc 1).
- ✅ Primer rewritten — column-definitions section replaced with INPUT TABLE COLUMNS (9-column TSV with Stable ID as first column, plus the new `<uuid>|<text> [p|s]` Keywords format and Stability Score). Output-format section replaced with OPERATION SYNTAX (JSON Lines inside a `=== OPERATIONS ===` / `=== END OPERATIONS ===` block; snake_case keys throughout). Rules-and-constraints rewritten with: deletion via `DELETE_TOPIC` (with `reassign_keywords_to` accepting another topic OR the literal `"ARCHIVE"`) replacing the V2 never-delete rule; no-orphan-keywords rule for `REMOVE_KEYWORD` vs `ARCHIVE_KEYWORD`; SPLIT/DELETE pre-requirement that source has no children; MERGE auto-reparent + auto-rewrite-sister-links semantics so the AI doesn't double-emit; SPLIT/DELETE drop sister links on the source (AI re-emits ADD_SISTER_LINK if needed); parent-cycle forbidden rule; Conversion Path and Stability Score both read-only.
- ✅ Output: new file `docs/AUTO_ANALYZE_PROMPT_V3.md` (~640 lines). Legacy `docs/AUTO_ANALYZE_PROMPT_V2.md` kept untouched as historical reference (it's the record of what was actually pasted into the production UI through every Bursitis run, including the Session 3b verification).
- ✅ Three drift-check design questions locked with director's go-ahead: operation output syntax = JSON Lines; input-state format = TSV with Stable ID first column; standalone Reevaluation Report block = scrapped (operations carry reasons inline).
- Director re-pastes new prompts into Auto-Analyze UI at end of session (concrete click path in the session handoff).

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
